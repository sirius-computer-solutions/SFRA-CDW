'use strict';

/* globals jQuery */
(function ($) {
    $(document).ready(function () {
        var $isVATEnabled = $('#Vertex_isVATEnabled');
        var $requiredFields = $('#Vertex_TaxRegistrationNumber,#Vertex_ISOCountryCode');
        var $labels = $('label[for="Vertex_TaxRegistrationNumber"],label[for="Vertex_ISOCountryCode"]');
        var elem = $('<sup>').attr({ class: 'required' }).html('*');

        /**
         *
         * @param {Object} $target Target for cleasing
         */
        function classToggle($target) {
            if ($target.get(0).checked) {
                $requiredFields.each(function (i, field) {
                    $(field).attr({
                        required    : '',
                        disabled    : false,
                        placeholder : ''
                    });
                });
                elem.clone().appendTo($labels);
            } else {
                $requiredFields.each(function (i, label) {
                    $(label).attr({
                        disabled    : true,
                        placeholder : 'VAT Calculation disabled'
                    }).val('');
                    $(label).removeAttr('required').parent().find('sup')
                        .remove();
                });
            }
        }

        $isVATEnabled.on('click', function () {
            classToggle($isVATEnabled);
        });

        classToggle($isVATEnabled);
    });
}(jQuery));
