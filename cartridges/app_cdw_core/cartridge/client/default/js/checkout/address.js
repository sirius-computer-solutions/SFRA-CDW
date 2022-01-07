var base = require('base/checkout/address');

base.addNewAddress = function () {
    $('.btn-add-new')
        .off() //remove oob events
        .on('click', function () {
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
        } else {
            // Handle shipping address case
            // $('body').trigger('checkout:clearShippingForms');
            
            if ($el.parents('#dwfrm_shipping').length > 0) {
                updateShippingAddress();
            }
            var $option = $($el.parents('form').find('.addressSelector option')[0]);
            $option.attr('value', 'new');
            var $newTitle = $('#dwfrm_shipping input[name=localizedNewAddressTitle]').val();
            $option.text($newTitle);
            $option.prop('selected', 'selected');
            $el.parents('[data-address-mode]').attr('data-address-mode', 'new');

            
        }
    });
}


/**
 * Updates the billing address form values within payment forms without any payment instrument validation
 * @param {Object} order - the order model
 */
 function updateShippingAddress() {
    var form = $('form[name=dwfrm_shipping]');
    if (!form) return;

    $('input[name$=_firstName]', form).val("");
    $('input[name$=_lastName]', form).val("");
    $('input[name$=_address1]', form).val("");
    $('input[name$=_address2]', form).val("");
    $('input[name$=_city]', form).val("");
    $('input[name$=_postalCode]', form).val("");
    $('select[name$=_stateCode],input[name$=_stateCode]', form)
        .val("");
    $('input[name$=_phone]', form).val("");

}

module.exports = base;
