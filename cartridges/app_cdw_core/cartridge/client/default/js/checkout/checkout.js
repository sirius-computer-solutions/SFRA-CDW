'use strict';


var addressHelpers = require('./address');
var shippingHelpers = require('./shipping');
var billingHelpers = require('./billing');
var summaryHelpers = require('./summary');
var formHelpers = require('base/checkout/formErrors');
var scrollAnimate = require('base/components/scrollAnimate');


/**
 * Create the jQuery Checkout Plugin.
 *
 * This jQuery plugin will be registered on the dom element in checkout.isml with the
 * id of "checkout-main".
 *
 * The checkout plugin will handle the different state the user interface is in as the user
 * progresses through the varying forms such as shipping and payment.
 *
 * Billing info and payment info are used a bit synonymously in this code.
 *
 */
(function ($) {
    $.fn.checkout = function () { // eslint-disable-line
        var plugin = this;
        //alert("33333")

        //
        // Collect form data from user input
        //
        var formData = {
            // Shipping Address
            signin: {},

            // Shipping Address
            shipping: {},

            // Billing Address
            billing: {},

            // Payment
            payment: {},

            // Gift Codes
            giftCode: {}
        };

        //
        // The different states/stages of checkout
        //
        var checkoutStages = [
            'signin',
            'shipping',
            'payment',
            'submitted'
        ];

        /**
         * Updates the URL to determine stage
         * @param {number} currentStage - The current stage the user is currently on in the checkout
         */
        function updateUrl(currentStage) {
            // alert("currentStage::"+currentStage);
            history.pushState(
                checkoutStages[currentStage],
                document.title,
                location.pathname
                + '?stage='
                + checkoutStages[currentStage]
                + '#'
                + checkoutStages[currentStage]
            );
        }

        /**
         * Clears the GC messages
         * 
         */
         function clearGCMessages() {
            $('.gc-balance-summary-total').hide();
            $(".added-gc-message").hide();
            if($('.gc-no-more-payments-enabled').length) {
                $('.gc-no-more-payments-enabled').remove();
            }
            $('.coupon-error-message').empty();
            $('.coupon-missing-error').empty();
            $('.giftcert-input-field').attr("placeholder", "Enter up to 4 codes").val("");

            //Clear CVV forregistered customers
            if($('.saved-payment-instrument .selected-payment .saved-payment-security-code')) {
                var cvvCode = $('.saved-payment-instrument.' +
                'selected-payment .saved-payment-security-code').val("");
            }
            
        }        

        //
        // Local member methods of the Checkout plugin
        //
        var members = {
           
            // initialize the currentStage variable for the first time
            currentStage: 0,

            /**
             * Set or update the checkout stage (AKA the shipping, billing, payment, etc... steps)
             * @returns {Object} a promise
             */
            updateStage: function () {
                //alert("444444");
                var stage = checkoutStages[members.currentStage];
                // alert("stage::"+stage);
                var defer = $.Deferred(); // eslint-disable-line

                if (stage === 'signin') {
                    // DO NOTHING
                } else if (stage === 'shipping') {
                    //alert("555555");
                    //
                    // Clear Previous Errors
                    //
                    formHelpers.clearPreviousErrors('.shipping-form');

                    //
                    // Submit the Shipping Address Form
                    //
                    var isMultiShip = $('#checkout-main').hasClass('multi-ship');
                    var formSelector = isMultiShip ?
                        '.multi-shipping .active form' : '.single-shipping .shipping-form';
                    var form = $(formSelector);

                    if (isMultiShip && form.length === 0) {
                        // disable the next:Payment button here
                        $('body').trigger('checkout:disableButton', '.next-step-button-custom button');
                        // in case the multi ship form is already submitted
                        var url = $('#checkout-main').attr('data-checkout-get-url');
                        $.ajax({
                            url: url,
                            method: 'GET',
                            success: function (data) {
                                
                                // enable the next:Payment button here
                                $('body').trigger('checkout:enableButton', '.next-step-button-custom button');
                                if (!data.error) {

                                    $('body').trigger('checkout:updateCheckoutView',
                                        { order: data.order, customer: data.customer });
                                    defer.resolve();
                                } else if (data.message && $('.shipping-error .alert-danger').length < 1) {
                                    var errorMsg = data.message;
                                    var errorHtml = '<div class="alert alert-danger alert-dismissible valid-cart-error ' +
                                        'fade show" role="alert">' +
                                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                                        '<span aria-hidden="true">&times;</span>' +
                                        '</button>' + errorMsg + '</div>';
                                    $('.shipping-error').append(errorHtml);
                                    scrollAnimate($('.shipping-error'));
                                    defer.reject();
                                } else if (data.redirectUrl) {
                                    window.location.href = data.redirectUrl;
                                }
                            },
                            error: function () {
                                // enable the next:Payment button here
                                $('body').trigger('checkout:enableButton', '.next-step-button-custom button');
                                // Server error submitting form
                                defer.reject();
                            }
                        });
                    } else {
                        var shippingFormData = form.serialize();

                        $('body').trigger('checkout:serializeShipping', {
                            form: form,
                            data: shippingFormData,
                            callback: function (data) {
                                shippingFormData = data;
                            }
                        });
                        // disable the next:Payment button here
                        $('body').trigger('checkout:disableButton', '.next-step-button-custom button');
                        //alert("Shipping onload ajax call");
                        $.ajax({
                            url: form.attr('action'),
                            type: 'post',
                            data: shippingFormData,
                            success: function (data) {
                                 // enable the next:Payment button here
                                $('body').trigger('checkout:enableButton', '.next-step-button-custom button');
                                shippingHelpers.methods.shippingFormResponse(defer, data);
                                shippingHelpers.methods.processToEnableB2BCreditLimit(defer, data);
                                clearGCMessages(); 
                                if ((!data.fieldErrors || data.fieldErrors.length ==0) && (!data.serverErrors || data.serverErrors.length==0)) {
                                    $('button[value=submit-payment]').toggle(true);
                                }
                                else if(data.fieldErrors && data.fieldErrors.length > 0){
                                    $( ".btn-show-details" ).trigger( "click" );
                                }
                            },
                            error: function (err) {
                                // enable the next:Payment button here
                                $('body').trigger('checkout:enableButton', '.next-step-button-custom button');
                                if (err.responseJSON && err.responseJSON.redirectUrl) {
                                    window.location.href = err.responseJSON.redirectUrl;
                                }
                                // Server error submitting form
                                defer.reject(err.responseJSON);
                            }
                        });
                    }
                    return defer;
                } else if (stage === 'payment') {
                    //
                    // Submit the Billing Address Form
                    //

                   
                    formHelpers.clearPreviousErrors('.payment-form');

                    var billingAddressForm = $('#dwfrm_billing .billing-address-block :input').serialize();

                    $('body').trigger('checkout:serializeBilling', {
                        form: $('#dwfrm_billing .billing-address-block'),
                        data: billingAddressForm,
                        callback: function (data) {
                            if (data) {
                                billingAddressForm = data;
                            }
                        }
                    });

                    var contactInfoForm = $('#dwfrm_billing .contact-info-block :input').serialize();

                    $('body').trigger('checkout:serializeBilling', {
                        form: $('#dwfrm_billing .contact-info-block'),
                        data: contactInfoForm,
                        callback: function (data) {
                            if (data) {
                                contactInfoForm = data;
                            }
                        }
                    });

                    var activeTabId = $('.tab-pane.active').attr('id');

                    var paymentInfoSelector = '#dwfrm_billing .' + activeTabId + ' .payment-form-fields :input';
                    var paymentInfoForm = $(paymentInfoSelector).serialize();

                    $('body').trigger('checkout:serializeBilling', {
                        form: $(paymentInfoSelector),
                        data: paymentInfoForm,
                        callback: function (data) {
                            if (data) {
                                paymentInfoForm = data;
                            }
                        }
                    });

                    var paymentForm = billingAddressForm + '&' + contactInfoForm + '&' + paymentInfoForm;

                    if($('.webReferenceNumber-input-field').val() != '' || $('.webReferenceNumber-input-field').val() != undefined){
                        paymentForm += '&webReferenceNumber='+escape($('.webReferenceNumber-input-field').val());
                    }

                    if ($('.data-checkout-stage').data('customer-type') === 'registered') {
                        // if payment method is credit card
                        if ($('.payment-information').data('payment-method-id') === 'CREDIT_CARD') {
                            if (!($('.payment-information').data('is-new-payment'))) {
                                var cvvCode = $('.saved-payment-instrument.' +
                                    'selected-payment .saved-payment-security-code').val();

                                if (cvvCode === '') {
                                    var cvvElement = $('.saved-payment-instrument.' +
                                        'selected-payment ' +
                                        '.form-control');
                                    cvvElement.addClass('is-invalid');
                                    scrollAnimate(cvvElement);
                                    defer.reject();
                                    return defer;
                                }

                                var $savedPaymentInstrument = $('.saved-payment-instrument' +
                                    '.selected-payment'
                                );

                                paymentForm += '&storedPaymentUUID=' +
                                    $savedPaymentInstrument.data('uuid');

                                paymentForm += '&securityCode=' + cvvCode;
                            }
                        }
                    }
                     // disable the next:Place Order button here
                    $('body').trigger('checkout:disableButton', '.next-step-button-custom button');
                    $.spinner().start();
                    $.ajax({
                        url: $('#dwfrm_billing').attr('action'),
                        method: 'POST',
                        data: paymentForm,
                        success: function (data) {
                             
                            // cdw-335: Empty value on PayPal dropdown when user selects New Paypal
                            // payment during Submit Payment
                            if(data.order && data.order.paypalPayerEmail){
                                var paypalEmail = data.order.paypalPayerEmail;
                                var $restPaypalAccountsList = document.querySelector('#restPaypalAccountsList');
                                const $sessionPaypalAccount = document.querySelector('#sessionPaypalAccount');
                                if ($sessionPaypalAccount && $sessionPaypalAccount.value == '' && paypalEmail!='') {
                                    $sessionPaypalAccount.value = paypalEmail;
                                    $sessionPaypalAccount.innerText = paypalEmail;
                                    $sessionPaypalAccount.selected = true;
                                    $restPaypalAccountsList.onchange();
                                }
                            }

                            // enable the placeOrder button here
                            $('body').trigger('checkout:enableButton', '.next-step-button-custom button');
                            if (data.error) {
                                $.spinner().stop();
                                if (data.fieldErrors.length) {
                                    data.fieldErrors.forEach(function (error) {
                                        if (Object.keys(error).length) {
                                            formHelpers.loadFormErrors('.payment-form', error);
                                        }
                                    });
                                }

                                if (data.serverErrors.length) {
                                    data.serverErrors.forEach(function (error) {
                                        $('.error-message').show();
                                        $('.error-message-text').text(error);
                                        scrollAnimate($('.error-message'));
                                    });
                                }

                                if (data.cartError) {
                                    window.location.href = data.redirectUrl;
                                }
                                
                                defer.reject();                                
                            }else {
                                $.ajax({
                                    url: $('.place-order').data('action'),
                                    method: 'POST',
                                    success: function (data) {
                                        // enable the placeOrder button here
                                        $('body').trigger('checkout:enableButton', '.next-step-button-custom button');
                                        if (data.error) {
                                            $.spinner().stop();
                                            if (data.cartError) {
                                                window.location.href = data.redirectUrl;
                                                defer.reject();
                                            } else {
                                                // go to appropriate stage and display error message
                                                defer.reject(data);
                                                var errorId = document.getElementById("checkout-error");
                                                if(errorId != null && errorId != undefined) {
                                                    errorId.scrollIntoView();
                                                }
                                                
                                            }
                                        } else {
                                            $.spinner().stop();
    
                                            var continueUrl = data.continueUrl;
                                            var urlParams = {
                                                ID: data.orderID,
                                                token: data.orderToken
                                            };
            
                                            continueUrl += (continueUrl.indexOf('?') !== -1 ? '&' : '?') +
                                                Object.keys(urlParams).map(function (key) {
                                                    return key + '=' + encodeURIComponent(urlParams[key]);
                                                }).join('&');
            
                                            window.location.href = continueUrl;
                                            defer.resolve(data);
                                            
                                        }
                                    },
                                    error: function () {
                                        $.spinner().stop();
                                        // enable the placeOrder button here
                                        $('body').trigger('checkout:enableButton', $('.next-step-button-custom button'));
                                    }
                                });
                            }                            
                        },
                        error: function (err) {
                            $.spinner().stop();
                            // enable the next:Place Order button here
                            $('body').trigger('checkout:enableButton', '.next-step-button-custom button');
                            if (err.responseJSON && err.responseJSON.redirectUrl) {
                                window.location.href = err.responseJSON.redirectUrl;
                            }
                        }
                    });
                    return defer;
                } else if (stage === 'placeOrder') {
                    // disable the placeOrder button here
                    $('body').trigger('checkout:disableButton', '.next-step-button-custom button');
                    $.ajax({
                        url: $('.place-order').data('action'),
                        method: 'POST',
                        success: function (data) {
                            // enable the placeOrder button here
                            $('body').trigger('checkout:enableButton', '.next-step-button-custom button');
                            if (data.error) {
                                if (data.cartError) {
                                    window.location.href = data.redirectUrl;
                                    defer.reject();
                                } else {
                                    // go to appropriate stage and display error message
                                    defer.reject(data);
                                }
                            } else {
                                var continueUrl = data.continueUrl;
                                var urlParams = {
                                    ID: data.orderID,
                                    token: data.orderToken
                                };

                                continueUrl += (continueUrl.indexOf('?') !== -1 ? '&' : '?') +
                                    Object.keys(urlParams).map(function (key) {
                                        return key + '=' + encodeURIComponent(urlParams[key]);
                                    }).join('&');

                                window.location.href = continueUrl;
                                defer.resolve(data);
                            }
                        },
                        error: function () {
                            // enable the placeOrder button here
                            $('body').trigger('checkout:enableButton', $('.next-step-button-custom button'));
                        }
                    });

                    return defer;
                }
                var p = $('<div>').promise(); // eslint-disable-line
                setTimeout(function () {
                    p.done(); // eslint-disable-line
                }, 500);
                return p; // eslint-disable-line
            },

            /**
             * Initialize the checkout stage.
             *
             * TODO: update this to allow stage to be set from server?
             */
            initialize: function () {
                //alert("66666");
                // set the initial state of checkout
                members.currentStage = checkoutStages
                    .indexOf($('.data-checkout-stage').data('checkout-stage'));
                $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);

                //alert("777777:"+checkoutStages[members.currentStage]);
                //
                // Handle Payment option selection
                //
                $('input[name$="paymentMethod"]', plugin).on('change', function () {
                    $('.credit-card-form').toggle($(this).val() === 'CREDIT_CARD');
                });
                
                $('.payment-option', plugin).on('click', function () {
                    var selectedPaymentRadio = $(this).find('input[name$="paymentType"]:radio');
                    selectedPaymentRadio.prop("checked", true);

                    if(selectedPaymentRadio.val() != null || selectedPaymentRadio.val() != undefined || selectedPaymentRadio.val() != 'undefined') {
                        $('.payment-information').data('payment-method-id', selectedPaymentRadio.val());    
                    }
                    

                    if(selectedPaymentRadio.val() === 'CREDIT_CARD') {
                        $('#credit-card-content').toggle(true);
                        $('#paypal-content').toggle(false);
                        $('#store-credit-content').toggle(false);
                        $('#credit-card-content').addClass("active");
                        $('#paypal-content').removeClass("active");
                        $('#store-credit-content').removeClass("active");
                    }else if(selectedPaymentRadio.val() === 'PayPal') {
                        $('#paypal-content').toggle(true);
                        $('#credit-card-content').toggle(false);
                        $('#store-credit-content').toggle(false);
                        $('#paypal-content').addClass("active");
                        $('#credit-card-content').removeClass("active");
                        $('#store-credit-content').removeClass("active");
                        $('#store-credit-content').removeClass("active");
                    }else if (selectedPaymentRadio.val() === 'STORE_CREDIT') {
                        $('#paypal-content').toggle(false);
                        $('#credit-card-content').toggle(false);
                        $('#store-credit-content').toggle(true);
                        $('#store-credit-content').addClass("active");
                        $('#paypal-content').removeClass("active");
                        $('#credit-card-content').removeClass("active");
                    }else {
                        $('#credit-card-content').toggle(true);
                        $('#paypal-content').toggle(false);
                        $('#store-credit-content').toggle(false);
                        $('#credit-card-content').addClass("active");
                        $('#paypal-content').removeClass("active");
                        $('#store-credit-content').removeClass("active");
                    }

                    var showSubmitPayment = true;
                    if(selectedPaymentRadio.val() === 'PayPal'){
                        var $restPaypalAccountsList = document.querySelector('#restPaypalAccountsList');
                        if($restPaypalAccountsList  && ($restPaypalAccountsList.querySelector('option:checked').value === 'newaccount')){
                            showSubmitPayment = false;
                        }
                    }

                    $('button[value=submit-payment]').toggle(showSubmitPayment);

                });

                $(plugin).on('click', '.checkout-as-guest', function () {
                    // alert("current stage::signin");
                    members.nextStage();
                });
                //
                // Handle Next State button click
                //
                $(plugin).on('click', '.next-step-button-custom button', function () {
                    if($('.next-step-button-custom button').prop('disabled')){
                        //do nothing
                    } else {
                        members.nextStage();
                    }
                });

                //
                // Handle Edit buttons on shipping and payment summary cards
                //
                $('.signin-guest-summary .edit-button', plugin).on('click', function () {
                    clearGCMessages();
                    members.gotoStage('signin');
                });   

                $('.shipping-summary .edit-button', plugin).on('click', function () {
                    if (!$('#checkout-main').hasClass('multi-ship')) {
                        $('body').trigger('shipping:selectSingleShipping');
                    }
                    clearGCMessages();
                    members.gotoStage('shipping');
                });

                $('.payment-summary .edit-button', plugin).on('click', function () {
                    members.gotoStage('payment');
                });

             

                //
                // remember stage (e.g. shipping)
                //
                //updateUrl(members.currentStage);
                history.replaceState(
                    checkoutStages[members.currentStage],
                    document.title,
                    location.pathname
                    + '?stage='
                    + checkoutStages[members.currentStage]
                    + '#'
                    + checkoutStages[members.currentStage]
                );
                

                //
                // Listen for foward/back button press and move to correct checkout-stage
                //
                $(window).on('popstate', function (e) {
                    //alert("88888");
                    //
                    // Back button when event state less than current state in ordered
                    // checkoutStages array.
                    //
                    if (e.state === null ||
                        checkoutStages.indexOf(e.state) < members.currentStage) {
                        members.handlePrevStage(false);
                    } else if (checkoutStages.indexOf(e.state) > members.currentStage) {
                        // Forward button  pressed
                        members.handleNextStage(false);
                    }
                });

                //alert("9999");
                //
                // Set the form data
                //
                plugin.data('formData', formData);
                //alert("0000000");
            },

            
            /**
             * The next checkout state step updates the css for showing correct buttons etc...
             */
            nextStage: function () {
                var promise = members.updateStage();

                promise.done(function () {
                    // Update UI with new stage
                    members.handleNextStage(true);
                });

                promise.fail(function (data) {
                    // show errors
                    if (data) {
                        if (data.errorStage) {
                            members.gotoStage(data.errorStage.stage);

                            if (data.errorStage.step === 'billingAddress') {
                                var $billingAddressSameAsShipping = $(
                                    'input[name$="_shippingAddressUseAsBillingAddress"]'
                                );
                                if ($billingAddressSameAsShipping.is(':checked')) {
                                    $billingAddressSameAsShipping.prop('checked', false);
                                }
                            }
                        }

                        if (data.errorMessage) {
                            $('.error-message').show();
                            $('.error-message-text').text(data.errorMessage);
                        }
                    }
                });
            },

            /**
             * The next checkout state step updates the css for showing correct buttons etc...
             *
             * @param {boolean} bPushState - boolean when true pushes state using the history api.
             */
            handleNextStage: function (bPushState) {
                //alert("before:"+members.currentStage);
                if (members.currentStage < checkoutStages.length - 1) {
                    // move stage forward
                    members.currentStage++;

                    //
                    // show new stage in url (e.g.payment)
                    //
                    if (bPushState) {
                        // alert("before update URL in handleNextStage::"+members.currentStage);
                        updateUrl(members.currentStage);
                    }
                }

                // Set the next stage on the DOM
                if(members.currentStage != 3) {
                    $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);
                }
            },

            /**
             * Previous State
             */
            handlePrevStage: function () {
                if (members.currentStage > 0) {
                    // move state back
                    members.currentStage--;
                    updateUrl(members.currentStage);
                }

                $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);
            },

            /**
             * Use window history to go to a checkout stage
             * @param {string} stageName - the checkout state to goto
             */
            gotoStage: function (stageName) {
                members.currentStage = checkoutStages.indexOf(stageName);
                // alert("members.currentStage::"+members.currentStage);
                updateUrl(members.currentStage);
                // alert("after updateURL of goToStage::"+members.currentStage);
                $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);
                // alert("after PLUGIN of goToStage::"+checkoutStages[members.currentStage]);
            }
        };

        //alert("IIIIIIII");
        //
        // Initialize the checkout
        //
        members.initialize();

        return this;
    };
}(jQuery));


var exports = {
    initialize: function () {
        //alert("11111");
        $('#checkout-main').checkout();
        //alert("2222");
    },

    updateCheckoutView: function () {
        //alert("updateCheckoutView");
        $('body').on('checkout:updateCheckoutView', function (e, data) {
            shippingHelpers.methods.updateMultiShipInformation(data.order);
            summaryHelpers.updateTotals(data.order.totals);
            data.order.shipping.forEach(function (shipping) {
                shippingHelpers.methods.updateShippingInformation(
                    shipping,
                    data.order,
                    data.customer,
                    data.options
                );
            });
            billingHelpers.methods.updateBillingInformation(
                data.order,
                data.customer,
                data.options
            );
            billingHelpers.methods.updatePaymentInformation(data.order, data.options);
            summaryHelpers.updateOrderProductSummaryInformation(data.order, data.options);
        });
    },

    disableButton: function () {
        $('body').on('checkout:disableButton', function (e, button) {
            $(button).prop('disabled', true);
        });
    },

    enableButton: function () {
        $('body').on('checkout:enableButton', function (e, button) {
            $(button).prop('disabled', false);
        });
    },

    updateBillingAsShipping: function () {
        $('.shippingAddressAsBillingAddress').change(function (e) {
            e.preventDefault();
            var $billingAddressSameAsShipping = $(
                '.shippingAddressAsBillingAddress'
            );
            var defer = $.Deferred();
            var url = $('.shippingAddressAsBillingAddress').attr('action-url');
            if($billingAddressSameAsShipping.is(':checked')) {
                $.ajax({
                    url: url,
                    method: 'POST',
                    dataType: 'json',
                    data: {},
                    success: function (data) {
                        
                        if (data.error) {
                            //Error with GC removal so show error message
                            //$('.giftcert-remove-error-message').show();
        
                        } else {
                            shippingHelpers.methods.shippingFormResponse(defer, data);
                            $('.billing-address-block .billing-address').hide();
                            $('.billing-address-block .address-summary').show();
                            $('.billing-address-block .billing-address-contact-info').show();
                        }
                        $.spinner().stop();
                    },
                    error: function (err) {
                        console.log("err::::"+JSON.stringify(err));
                        $.spinner().stop();
                    }
                });   
            }else {
                $('.billing-address-block .billing-address').show();
                $('.contact-info-block').show();
                $('.billing-address-block .address-summary').hide();
                $('.billing-address-block .billing-address-contact-info').hide();
                //Enable the New section
                var $el = $(this);
                if ($el.parents('#dwfrm_billing').length > 0) {
                    // Handle billing address case
                    $('body').trigger('checkout:clearBillingForm');
                    var $option = $($el.parents('form').find('.addressSelector option')[0]);
                    $option.attr('value', 'new');
                    var $newTitle = $('#dwfrm_billing input[name=localizedNewAddressTitle]').val();
                    $option.text($newTitle);
                    $option.prop('selected', 'selected');
                    $el.parents('[data-address-mode]').attr('data-address-mode', 'new');
                }      
                //Clearing everything but the email
                var emailAttr = $('.hidden-order-email').attr('attr-value');
                if(emailAttr != null || emailAttr != undefined || emailAttr != '' || emailAttr != 'undefined') {
                     $('.dwfrm_billing_contactInfoFields_email .email').val($('.hidden-order-email').attr('attr-value'));
                }
                
            }
          
        });
    },

    updateSelectedPaymentMethod: function () {
        var paypal_orderId = $("#paypal_orderId").val();
        if(paypal_orderId){
            $('#paypal-content').toggle(true);
            $('#credit-card-content').toggle(false);
            $('#store-credit-content').toggle(false);
            $('#paypal-content').addClass("active");
            $('#credit-card-content').removeClass("active");
            $('#store-credit-content').removeClass("active");
            $('#store-credit-content').removeClass("active");
        }
    }

};

[billingHelpers, shippingHelpers, addressHelpers].forEach(function (library) {
    Object.keys(library).forEach(function (item) {
        if (typeof library[item] === 'object') {
            exports[item] = $.extend({}, exports[item], library[item]);
        } else {
            exports[item] = library[item];
        }
    });
});

module.exports = exports;