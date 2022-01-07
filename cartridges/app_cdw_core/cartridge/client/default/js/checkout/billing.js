'use strict';

var addressHelpers = require('base/checkout/address');
var base = require('base/checkout/billing');
var baseFormHelpers = require('base/checkout/formErrors');

/**
 * updates the billing address selector within billing forms
 * @param {Object} order - the order model
 * @param {Object} customer - the customer model
 */
 function updateBillingAddressSelector(order, customer) {
    var shippings = order.shipping;

    var form = $('form[name$=billing]')[0];
    var $billingAddressSelector = $('.addressSelector', form);
    var hasSelectedAddress = false;

    if ($billingAddressSelector && $billingAddressSelector.length === 1) {
        $billingAddressSelector.empty();
        // Add New Address option
        $billingAddressSelector.append(addressHelpers.methods.optionValueForAddress(
            null,
            false,
            order,
            { type: 'billing' }));

        // Separator -
        $billingAddressSelector.append(
            addressHelpers.methods.optionValueForAddress(order.resources.shippingAddresses, false, order, { type: 'billing' })
        );

        shippings.forEach(function (aShipping) {
            if (!aShipping.selectedShippingMethod || !aShipping.selectedShippingMethod.storePickupEnabled) {
                var isSelected = order.billing.matchingAddressId === aShipping.UUID;
                hasSelectedAddress = hasSelectedAddress || isSelected;
                // Shipping Address option
                $billingAddressSelector.append(
                    addressHelpers.methods.optionValueForAddress(aShipping, isSelected, order, { type: 'billing' })
                );
            }
        });

        if (customer.addresses && customer.addresses.length > 0) {
            $billingAddressSelector.append(addressHelpers.methods.optionValueForAddress(
                order.resources.accountAddresses, false, order));
            customer.addresses.forEach(function (address) {
                var isSelected = order.billing.matchingAddressId === address.ID;
                hasSelectedAddress = hasSelectedAddress || isSelected;
                // Customer Address option
                $billingAddressSelector.append(
                    addressHelpers.methods.optionValueForAddress({
                        UUID: 'ab_' + address.ID,
                        shippingAddress: address
                    }, isSelected, order, { type: 'billing' })
                );
            });
        }
    }

    if (hasSelectedAddress
        || (!order.billing.matchingAddressId && order.billing.billingAddress.address)) {
        // show
        $(form).attr('data-address-mode', 'edit');
    } else {
        $(form).attr('data-address-mode', 'new');
    }

    $billingAddressSelector.show();
}


/**
 * Updates the billing information in checkout, based on the supplied order model
 * @param {Object} order - checkout model to use as basis of new truth
 * @param {Object} customer - customer model to use as basis of new truth
 * @param {Object} [options] - options
 */
 function updateBillingInformation(order, customer) {
   updateBillingAddressSelector(order, customer);

    // update billing address form
    base.methods.updateBillingAddressFormValues(order);

    // update billing address summary and billing parts of order summary
    base.methods.updateBillingAddressSummary(order);

    if(order.shipping[0].selectedShippingMethod.storePickupEnabled) {
            //Dont Display summary and billing section to select same as shipping
            $('.same-as-billing-section').css('display','none');
            $('.same-as-billing-summary').css('display','none');
            //Display Billing address form and contact info form
            $('.billing-address').css('display','block');
            $('.contact-info-block').css('display','block');
           
    } else {
        $('.same-as-billing-section').css('display','block');
        $('.same-as-billing-summary').css('display','block');
        $('.billing-address-contact-info').css('display','block');
        $('.address-summary').css('display','block');
        
        $('.billing-address').css('display','none');
        $('.contact-info-block').css('display','none');
        $('.shippingAddressAsBillingAddress').prop('checked',true);
    }
}


base.methods.updateBillingInformation = updateBillingInformation;

module.exports = base;
