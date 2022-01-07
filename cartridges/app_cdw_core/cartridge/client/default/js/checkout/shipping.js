'use strict';

var addressHelpers = require('base/checkout/address');
var base = require('base/checkout/shipping');
var baseFormHelpers = require('base/checkout/formErrors');

// TODO remove uncustomized methods

$(document).ready(function() {
    //change color of selected shipping method
    $('#'+getSelectedShipMethodId()).closest('.ship-method').addClass('selected-shipping-method');
  });

/**
 * updates the shipping address selector within shipping forms
 * @param {Object} productLineItem - the productLineItem model
 * @param {Object} shipping - the shipping (shipment model) model
 * @param {Object} order - the order model
 * @param {Object} customer - the customer model
 */
function updateShippingAddressSelector(productLineItem, shipping, order, customer) {
    var uuidEl = $('input[value=' + productLineItem.UUID + ']');
    var shippings = order.shipping;

    var form;
    var $shippingAddressSelector;
    var hasSelectedAddress = false;

    if (uuidEl && uuidEl.length > 0) {
        form = uuidEl[0].form;
        $shippingAddressSelector = $('.addressSelector', form);
    }

    if ($shippingAddressSelector && $shippingAddressSelector.length === 1) {
        $shippingAddressSelector.empty();
        // Add New Address option
        $shippingAddressSelector.append(addressHelpers.methods.optionValueForAddress(
            null,
            false,
            order));
        // Separator -
        $shippingAddressSelector.append(addressHelpers.methods.optionValueForAddress(
            order.resources.shippingAddresses, false, order, { className: 'multi-shipping' }
        ));

        shippings.forEach(function (aShipping) {
            if (!aShipping.selectedShippingMethod || !aShipping.selectedShippingMethod.storePickupEnabled) {
                var isSelected = shipping.UUID === aShipping.UUID;
                hasSelectedAddress = hasSelectedAddress || isSelected;

                var addressOption = addressHelpers.methods.optionValueForAddress(
                        aShipping,
                        isSelected,
                        order,
                        { className: 'multi-shipping' }
                );
                var newAddress = addressOption.html() === order.resources.addNewAddress;
                var matchingUUID = aShipping.UUID === shipping.UUID;
                if ((newAddress && matchingUUID) || (!newAddress && matchingUUID) || (!newAddress && !matchingUUID)) {
                    $shippingAddressSelector.append(addressOption);
                }
                if (newAddress && !matchingUUID) {
                    $(addressOption[0]).remove();
                }
            }
        });
        if (customer.addresses && customer.addresses.length > 0) {
            $shippingAddressSelector.append(addressHelpers.methods.optionValueForAddress(
                order.resources.accountAddresses, false, order));
            customer.addresses.forEach(function (address) {
                var isSelected = shipping.matchingAddressId === address.ID;
                $shippingAddressSelector.append(
                    addressHelpers.methods.optionValueForAddress({
                        UUID: 'ab_' + address.ID,
                        shippingAddress: address
                    }, isSelected, order)
                );
            });
        }
    }

    if (!hasSelectedAddress) {
        // show
        $(form).addClass('hide-details');
    } else {
        $(form).removeClass('hide-details');
    }
}

/**
 * Update the shipping UI for a single shipping info (shipment model)
 * @param {Object} shipping - the shipping (shipment model) model
 * @param {Object} order - the order/basket model
 * @param {Object} customer - the customer model
 * @param {Object} [options] - options for updating PLI summary info
 * @param {Object} [options.keepOpen] - if true, prevent changing PLI view mode to 'view'
 */
function updateShippingInformation(shipping, order, customer, options) {

    // First copy over shipmentUUIDs from response, to each PLI form
    order.shipping.forEach(function (aShipping) {
        aShipping.productLineItems.items.forEach(function (productLineItem) {
            base.methods.updateProductLineItemShipmentUUIDs(productLineItem, aShipping);
        });
    });

    // Now update shipping information, based on those associations
    base.methods.updateShippingMethods(shipping);
    base.methods.updateShippingAddressFormValues(shipping);
    base.methods.updateShippingSummaryInformation(shipping, order);

    // And update the PLI-based summary information as well
    shipping.productLineItems.items.forEach(function (productLineItem) {
        updateShippingAddressSelector(productLineItem, shipping, order, customer);
        base.methods.updatePLIShippingSummaryInformation(productLineItem, shipping, order, options);
    });

    
}

/**
 * Update the shipping UI to include AVS suggestions if there is a fedexAVS JSON object for the current shipping address
 * @param {Object} shipping - the shipping (shipment model) model
 */
function addAVSOptions(shipping) {
    if(shipping.shippingAddress && shipping.shippingAddress.address1 && shipping.shippingAddress.fedexAVS) {

        var resolved = shipping.shippingAddress.fedexAVS.resolved;
        var dpv = shipping.shippingAddress.fedexAVS.dpv;
        var avsState = shipping.shippingAddress.fedexAVS.avsState;
        var shippingAddress = shipping.shippingAddress;
        var addressAsEntered = shippingAddress.address1 + ' ' + shippingAddress.city + ', ' + shippingAddress.stateCode + ' ' + shippingAddress.postalCode;

        // clear out existing options
        var $shippingAVSList = $('.shipping-avs-list');
        $shippingAVSList.empty();
        // init template for avs option
        var tmpl = $('#shipping-avs-template').clone();
        if(avsState && avsState === 'STANDARDIZED'){
            if(isMatchingAddress(shipping)){
                // do nothing; address is good
            } else if ( resolved === 'true' && dpv === 'true') {
                // suggest avs result
                var avs = shipping.shippingAddress.fedexAVS;
                var suggestedAddress = avs.streetLine1 + ' ' + avs.city + ', ' + avs.state + ' ' + avs.postalCode;
                $('input', tmpl)
                    .prop('id', 'shippingAVSRadioButton-suggested')
                    .prop('name', 'avs_user_choice')
                    .prop('value', 'change');
                $('label', tmpl)
                    .prop('for', 'shippingAVSRadioButton-suggested');
                $('.display-name', tmpl).text(suggestedAddress).addClass('line-item-name');
                $('.shipping-avs-similar', tmpl).show();
                $shippingAVSList.append(tmpl.html());
                
                $('#shippingAVSRadioButton-suggested').on('click', { shipping: shipping }, updateAddressAndSubmit);
            } else {
                //address not found
                $('input', tmpl)
                    .prop('id', 'shippingAVSRadioButton-change')
                    .prop('name', 'avs_user_choice')
                    .prop('value', 'change');
                $('label', tmpl)
                    .prop('for', 'shippingAVSRadioButton-change');
                $('.display-name', tmpl).text('Use a different address');
                $('.shipping-avs-invalid', tmpl).show();
                $shippingAVSList.append(tmpl.html());
                $('#shippingAVSRadioButton-change').on('click', clearAVSAddress);
            }
        } else {
            //address not found
            $('input', tmpl)
                .prop('id', 'shippingAVSRadioButton-change')
                .prop('name', 'avs_user_choice')
                .prop('value', 'change');
            $('label', tmpl)
                .prop('for', 'shippingAVSRadioButton-change');
            $('.display-name', tmpl).text('Use a different address');
            $('.shipping-avs-invalid', tmpl).show();
            $shippingAVSList.append(tmpl.html());
            $('#shippingAVSRadioButton-change').on('click', clearAVSAddress);
        }
        
        // if we proposed an avs option, then always allow user to proceed with adress as entered
        var childInputs = $('input', $shippingAVSList);
        if (childInputs && childInputs.length > 0) {
            // address as entered is alwasy an option so clone a new copy and add to page
            tmpl = $('#shipping-avs-template').clone();
            $('input', tmpl)
                .prop('id', 'shippingAVSRadioButton-keep')
                .prop('name', 'avs_user_choice')
                .prop('value', 'use_as_entered');

            $('label', tmpl)
                .prop('for', 'shippingAVSRadioButton-keep');
            $('.display-name', tmpl).text('Use the address as entered');
            $('.line-item-name', tmpl).text(addressAsEntered);
            $shippingAVSList.append(tmpl.html());
            $('#shippingAVSRadioButton-keep').on('click', unlockAVSAddressAndShipping);

            // disable Address form to force selection
            $('.shipping-address-block').prop('disabled', true);

            // disable payment step button to force selection
            $('.submit-shipping').prop('disabled', true);

            // hide shipping methods to force selection
            $('.shipping-method-list :input').attr('disabled', true);

            $('#'+getSelectedShipMethodId()).closest('.ship-method').removeClass('selected-shipping-method');
            //show avs header
             $('.shipping-address-validation h2').show();
            
        } else {
            // if we didn't append any avs suggestions, ensure submit shipping isn't disabled
            $('.submit-shipping').prop('disabled', false);
        }
    }
}

function isMatchingAddress(shipping){
    var avs = shipping.shippingAddress.fedexAVS;

    if(avs.streetLine1 !== shipping.shippingAddress.address1){
        return false;
    }else if (avs.city !== shipping.shippingAddress.city){
        return false;
    }else if (avs.state !== shipping.shippingAddress.stateCode){
        return false;
    }else if (avs.postalCode !== shipping.shippingAddress.postalCode){
        return false;
    }
    return true;
}

/**
 * Enable forms and clear out shipping AVS suggestions
 */
function unlockAVSAddressAndShipping() {
    $('.shipping-address-block').prop('disabled', false);
    $('.shipping-method-list :input').attr('disabled', false);
    $('#'+getSelectedShipMethodId()).closest('.ship-method').addClass('selected-shipping-method');
    //only enable payment step if a shipping method is selected
    if($(".selected-shipping-method").length > 0){
        $('.submit-shipping').prop('disabled', false);
    }
    var $shippingAVSList = $('.shipping-avs-list');
    $shippingAVSList.empty();
    $('.shipping-address-validation h2').hide();
}

/**
 * Empty out address form based on AVS suggestion choice
 */
function clearAVSAddress() {
    unlockAVSAddressAndShipping();
    $('.shippingAddressOne').val('');
    $('.shippingAddressTwo').val('');
    $('.shippingAddressCity').val('');
    $('.shippingState').val('');
    $('.shippingZipCode').val('');
    var $shippingAVSList = $('.shipping-avs-list');
    $shippingAVSList.empty();
    $('.shipping-address-validation h2').hide();
    var $shippingMethodList = $('.shipping-method-list');
    $shippingMethodList.empty();
}
/**
* @param {Object} shipping - the shipping (shipment model) model
 */
function updateAddressAndSubmit(shipping) {
    unlockAVSAddressAndShipping();
    $(".shipping-address-block .shippingAddressOne").val(shipping.data.shipping.shippingAddress.fedexAVS.streetLine1);
    $(".shipping-address-block .shippingAddressTwo").val(shipping.data.shipping.shippingAddress.fedexAVS.streetLine2);
    $(".shipping-address-block .shippingAddressCity").val(shipping.data.shipping.shippingAddress.fedexAVS.city);
    $(".shipping-address-block .shippingZipCode").val(shipping.data.shipping.shippingAddress.fedexAVS.postalCode);
    //check if fedex state is in options
    var fedexState = shipping.data.shipping.shippingAddress.fedexAVS.state;
    if($(".shipping-address-block .shippingState option").filter(function(){ return $(this).val() == fedexState; }).length){
        $(".shipping-address-block .shippingState").first().val(fedexState);
    }else{
        $(".shipping-address-block .shippingState").first().val("");
    }
    if(isAddressComplete($(".shipping-form"))){
        updateShippingMethodList($(".shipping-form"));
    }
}

/**
 * Update list of available shipping methods whenever user modifies shipping address details.
 * @param {jQuery} $shippingForm - current shipping form
 */
function updateShippingMethodList($shippingForm, doAVS = true) {
    var $shippingMethodList = $shippingForm.find('.shipping-method-list');
    var urlParams = addressHelpers.methods.getAddressFieldsFromUI($shippingForm);
    var shipmentUUID = $shippingForm.find('[name=shipmentUUID]').val();
    var url = $shippingMethodList.data('actionUrl');
    urlParams.shipmentUUID = shipmentUUID;

    var email=  $('input[name$=_email]', $shippingForm).val();
    if(email != null && email != "" && email != undefined) {
        urlParams.contactEmail = email;
    }
    
    //disable submit step while we update shipping methods
    $('.submit-shipping').prop('disabled', true);

    $shippingMethodList.spinner().start();
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: urlParams,
        success: function (data) {
            if (data.error) {
                window.location.href = data.redirectUrl;
            } else {
                $('body').trigger('checkout:updateCheckoutView',
                    {
                        order: data.order,
                        customer: data.customer,
                        options: { keepOpen: true }
                    });

                // FedexAVS below
                // write AVS options
                // if form was provided
                if(doAVS){
                    data.order.shipping.forEach(function (shipping) {
                        addAVSOptions(shipping);
                    });
                }
                
                $shippingMethodList.spinner().stop();
            }
        }
    });
}

/**
 * updates the shipping method radio buttons within shipping forms
 * @param {Object} shipping - the shipping (shipment model) model
 */
function updateShippingMethods(shipping) {
    var uuidEl = $('input[value=' + shipping.UUID + ']');
    if (uuidEl && uuidEl.length > 0) {
        $.each(uuidEl, function (shipmentIndex, el) {
            var form = el.form;
            if (!form) return;

            var $shippingMethodList = $('.shipping-method-list', form);
            if ($shippingMethodList && $shippingMethodList.length > 0) {
                $shippingMethodList.empty();
                var shippingMethods = shipping.applicableShippingMethods;
                var selected = shipping.selectedShippingMethod || {};
                var shippingMethodFormID = form.name + '_shippingAddress_shippingMethodID';
                // if we have no ship methods or just store pickup
                if(shippingMethods == 'undefined' || shippingMethods == null ||  shippingMethods.length === 0){
                    $shippingMethodList.append('<span>No shipping methods could be found for the shipping address specified.</span>');
                    // disable payment step button to force selection
                    $('.submit-shipping').prop('disabled', true);
                } else {
                    //
                    // Create the new rows for each shipping method
                    //
                    var validShipMethodSelected = false;
                    $.each(shippingMethods, function (methodIndex, shippingMethod) {
                        var tmpl = $('#shipping-method-template').clone();
                        // set input
                        $('input', tmpl)
                            .prop('id', 'shippingMethod-' + shippingMethod.ID + '-' + shipping.UUID)
                            .prop('name', shippingMethodFormID)
                            .prop('value', shippingMethod.ID)
                            .attr('checked', shippingMethod.ID === selected.ID)
                            .attr('data-pickup', shippingMethod.storePickupEnabled);
                        
                        $('label', tmpl)
                            .prop('for', 'shippingMethod-' + shippingMethod.ID + '-' + shipping.UUID);
                        // set shipping method name
                        $('.display-name', tmpl).text(shippingMethod.displayName);

                        if(shippingMethod.ID == "EXPRESS") {
                            $('.display-name', tmpl).append('<span class="fastest-tag">MOST POPULAR</span>');
                        }
                        // set or hide arrival time
                        if (shippingMethod.estimatedArrivalTime) {
                            $('.arrival-time', tmpl)
                                .text('Est. Delivery: ' + shippingMethod.estimatedArrivalTime)
                                .show();
                            $('.shipping-method-note', tmpl)
                                .text('If ordered before 12:00 pm CST')
                                .show();
                        }

                        if(shippingMethod.ID === selected.ID) {
                            $('.ship-method', tmpl).addClass("selected-shipping-method");
                            validShipMethodSelected = true;
                        }
                        // set shipping cost
                        $('.shipping-cost', tmpl).text(shippingMethod.shippingCost);
                        if(!shippingMethod.storePickupEnabled || shippingMethod.ID === selected.ID) { // Not including the BOPIS option when its changed from checkout
                            $shippingMethodList.append(tmpl.html());
                        }
                        
                    });
                    //if shippingMethodList is only one option, select it
                    if($shippingMethodList && $shippingMethodList.children() && $shippingMethodList.children().length === 1){
                        $("input[id^='shippingMethod']",$shippingMethodList).first().attr('checked','true');
                    } else if (!validShipMethodSelected){
                        $("input[id^='shippingMethod']",$shippingMethodList).first().attr('checked','true');
                    }
                }
            }
        });
    }
    
    $('body').trigger('shipping:updateShippingMethods', { shipping: shipping });
}

/**
 * Handle response from the server for valid or invalid form fields.
 * @param {Object} defer - the deferred object which will resolve on success or reject.
 * @param {Object} data - the response data with the invalid form fields or
 *  valid model data.
 */
 function processToEnableB2BCreditLimit(defer, data) {
    
    if(data.enableB2BCreditPayment && data.enableB2BCreditPayment != undefined && data.enableB2BCreditPayment != 'undefined') {
        $('.store-credit-tab').parent().css({'pointer-events':'', 'opacity':'1'});    
    } else if(!data.enableB2BCreditPayment){
        $('.store-credit-tab').parent().css({'pointer-events':'none', 'opacity':'0.6'});       
    }

};

/**
 * Check if all input and select fields which are marked as required are populated and return false if not
 * @param {jQuery} $shippingForm - current shipping form
 */
function isAddressComplete($shippingForm) {
    // select all input and select fields within the shipping address block that are inside the currently submitted form
    var requiredButEmpty = $(".shipping-address-block input[required], .shipping-address-block select[required]", $shippingForm).filter(function() {
        // filter down to only those with an empty value
        return $.trim($(this).val()) === "";  
    });

    if(requiredButEmpty.hasClass("shippingCountry")) {
        $('.shippingCountry option[value="US"]').prop('selected', true);
        requiredButEmpty = "";
    }
    
    if (requiredButEmpty && requiredButEmpty.length){
        return false;
    } else {
        return true;
    }
};

/**
 * Get the id of selected shipping method
 */
function getSelectedShipMethodId() {
    return $('input[type=radio][id^=shippingMethod-]:checked').attr("id");
}

/**
 * Handle response from the server for valid or invalid form fields.
 * @param {Object} defer - the deferred object which will resolve on success or reject.
 * @param {Object} data - the response data with the invalid form fields or
 *  valid model data.
 */
 function shippingFormResponse(defer, data) {
    var isMultiShip = $('#checkout-main').hasClass('multi-ship');
    var formSelector = isMultiShip
        ? '.multi-shipping .active form'
        : '.single-shipping form';

    // highlight fields with errors
    if (data.error) {
        if (data.fieldErrors.length) {
            data.fieldErrors.forEach(function (error) {
                if (Object.keys(error).length) {
                    baseFormHelpers.loadFormErrors(formSelector, error);
                }
            });
            defer.reject(data);
        }

        if (data.serverErrors && data.serverErrors.length) {
            //clearing out shipping errors
            $('.shipping-error').empty();
            $.each(data.serverErrors, function (index, element) {
                base.methods.createErrorNotification(element);
            });

            defer.reject(data);
        }

        if (data.cartError) {
            window.location.href = data.redirectUrl;
            defer.reject();
        }
    } else {
        // Populate the Address Summary

        $('body').trigger('checkout:updateCheckoutView', {
            order: data.order,
            customer: data.customer
        });
        $(function () {
            $('html,body').animate({
                scrollTop: $('.gift-certificate-content').offset().top
            }, 'slow');
        });

        defer.resolve(data);
    }
}

base.methods.updateShippingInformation = updateShippingInformation;
base.methods.updateShippingAddressSelector = updateShippingAddressSelector;
base.methods.updateShippingMethods = updateShippingMethods;
base.methods.unlockAVSAddressAndShipping = unlockAVSAddressAndShipping;
base.methods.clearAVSAddress = clearAVSAddress;
base.methods.addAVSOptions = addAVSOptions;
base.methods.processToEnableB2BCreditLimit = processToEnableB2BCreditLimit;
base.methods.updateShippingMethodList = updateShippingMethodList;
base.methods.getSelectedShipMethodId = getSelectedShipMethodId;
base.methods.shippingFormResponse = shippingFormResponse;

base.updateShippingList = function () {
    var baseObj = this;

    //select all input and select elements in the shipping-address-block fieldset
    $(".shipping-address-block input, .shipping-address-block select")
        .not(".addressSelector") //don't trigger this when selecting an address from the book
        .off() //remove previously added handler
        .on('change', function (e) {
            //check if address is complete before submitting; this is where AVS happens as well
            if(isAddressComplete($(e.currentTarget.form))){
                if (baseObj.methods && baseObj.methods.updateShippingMethodList) {
                    baseObj.methods.updateShippingMethodList($(e.currentTarget.form));
                } else {
                    updateShippingMethodList($(e.currentTarget.form));
                }
            }
        });
        $(".shipping-address .addressSelector")
        .on('change', function (e) {
            updateShippingMethodList($(e.currentTarget.form), false);
        });
    //if shippingMethodList is only one option, select it
    var $shippingMethodList = $('.shipping-method-list');
    //if shippingMethodList is only one option, select it
    if($shippingMethodList && $shippingMethodList.children() && $shippingMethodList.children().length === 1){
        $("input[id^='shippingMethod']",$shippingMethodList).first().attr('checked','true');
    }
};

base.selectSingleShipAddress = function () {
    $('.single-shipping .addressSelector')
        .off()//remove oob handler
        .on('change', function () {
        var form = $(this).parents('form')[0];
        var selectedOption = $('option:selected', this);
        var attrs = selectedOption.data();
        var shipmentUUID = selectedOption[0].value;
        var originalUUID = $('input[name=shipmentUUID]', form).val();
        var element;
        Object.keys(attrs).forEach(function (attr) {
            element = attr === 'countryCode' ? 'country' : attr;
            $('[name$=' + element + ']', form).val(attrs[attr]);
        });
        //$('[name$=stateCode]', form).trigger('change'); //don't trigger change event; let ship method change or next button do this
        if (shipmentUUID === 'new') {
            $(form).attr('data-address-mode', 'new');
            $(form).find('.shipping-address-block').removeClass('d-none');
        } else if (shipmentUUID === originalUUID) {
            $(form).attr('data-address-mode', 'shipment');
        } else if (shipmentUUID.indexOf('ab_') === 0) {
            $(form).attr('data-address-mode', 'customer');
        } else {
            $(form).attr('data-address-mode', 'edit');
        }
    });
},

module.exports = base;
