'use strict';

var base = require('instorepickup/checkout/instore');



/**
 * Populate store finder html
 * @param {Object} target - Dom element that needs to be populated with store finder
 */
 function loadStoreLocator(target) {
    console.log("target.data('url')::"+target.data('url'));
    $.ajax({
        url: target.data('url'),
        method: 'GET',
        success: function (response) {
            target.html(response);
            target.show();
            target.append('<input type="hidden" name="storeId" value="'+target.data('storeid')+'" />');
            $('.dwfrm_shipping_shippingAddress_addressFields_lastName').children('input').val("Store");
        }
    });
}

/**
 * Show store locator when appropriate shipping method is selected
 * @param {Object} shippingForm - DOM element that contains current shipping form
 */
function showStoreFinder(shippingForm) {
    // hide address panel
    shippingForm.find('.shipment-selector-block').addClass('d-none');
    shippingForm.find('.shipping-address-block').addClass('d-none');
    shippingForm.find('.change-store').addClass('d-none');

    shippingForm.find('.gift-message-block').addClass('d-none');
    shippingForm.find('.gift').prop('checked', false);
    shippingForm.find('.gift-message').addClass('d-none');

    shippingForm.find('.pickup-in-store').empty().removeClass('d-none');

    loadStoreLocator(shippingForm.find('.pickup-in-store'));
}

/**
 * Hide store finder and restore address form
 * @param {Object} shippingForm - DOM element with current form
 * @param {Object} data - data containing customer and order objects
 */
function hideStoreFinder(shippingForm, data) {
    if (data.order.usingMultiShipping) {
        $('body').trigger('instore:hideMultiShipStoreFinder', {
            form: shippingForm,
            customer: data.customer,
            order: data.order
        });
    } else {
        $('body').trigger('instore:hideSingleShipStoreFinder', {
            form: shippingForm,
            customer: data.customer,
            order: data.order
        });
    }

    shippingForm.find('.pickup-in-store').addClass('d-none');
    shippingForm.find('.change-store').addClass('d-none');
    shippingForm.find('.gift-message-block').removeClass('d-none');

    shippingForm.find('input[name="storeId"]').remove();
}
/**
 * overrriden function from instore_pickup instore.js to handle just show the selected BOPIS store instead of store search
 */
 function watchForInStoreShipping() {

    $('body').on('checkout:updateCheckoutView', function (e, data) {
        var multiShipFlag = data.order.usingMultiShipping;
        if (!data.urlParams || !data.urlParams.shipmentUUID) {
            data.order.shipping.forEach(function (shipment) {
                var form = $('.shipping-form input[name="shipmentUUID"][value="' + shipment.UUID + '"]').closest('form');

                form.find('.pickup-in-store').data('url', $('.pickup-in-store').data('url'));
                if (shipment && shipment.selectedShippingMethod && shipment.selectedShippingMethod.storePickupEnabled) {
                    showStoreFinder(form, multiShipFlag);
                } else {
                    hideStoreFinder(form, data);
                }
            });

            return;
        }

        var shipment = data.order.shipping.find(function (s) {
            return s.UUID === data.urlParams.shipmentUUID;
        });


        var shippingForm = $('.shipping-form input[name="shipmentUUID"][value="' + shipment.UUID + '"]').closest('form');
        shippingForm.find('.pickup-in-store').data('url', shipment.pickupInstoreUrl);

        if (shipment && shipment.selectedShippingMethod && shipment.selectedShippingMethod.storePickupEnabled) {
            showStoreFinder(shippingForm);
        } else {
            hideStoreFinder(shippingForm, data);
        }
    });

}


base.watchForInStoreShipping = watchForInStoreShipping;

module.exports = base;
