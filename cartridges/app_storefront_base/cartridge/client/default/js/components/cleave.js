'use strict';

var Cleave = require('cleave.js').default;

module.exports = {
    handleCreditCardNumber: function (cardFieldSelector, cardTypeSelector) {
        var cleave = new Cleave(cardFieldSelector, {
            creditCard: true,
            onCreditCardTypeChanged: function (type) {
                var creditCardTypes = {
                    visa: 'Visa',
                    mastercard: 'Master Card',
                    amex: 'Amex',
                    discover: 'Discover',
                    unknown: 'Unknown'
                };

                var cardType = creditCardTypes[Object.keys(creditCardTypes).indexOf(type) > -1
                    ? type
                    : 'unknown'];
                $(cardTypeSelector).val(cardType);
                $('.card-number-wrapper').attr('data-type', type);
                if (type === 'visa' || type === 'mastercard' || type === 'discover') {
                    $('#securityCode').attr('oninput','javascript: if (this.value.length > 3) this.value = this.value.slice(0, 3);' );
                } else {
                    $('#securityCode').attr('oninput','javascript: if (this.value.length > 4) this.value = this.value.slice(0, 4);' );
                }
            }
        });

        $(cardFieldSelector).data('cleave', cleave);
    },

    serializeData: function (form) {
        var serializedArray = form.serializeArray();

        serializedArray.forEach(function (item) {
            if (item.name.indexOf('cardNumber') > -1) {
                item.value = $('#cardNumber').data('cleave').getRawValue(); // eslint-disable-line
            }
        });

        return $.param(serializedArray);
    }
};
