'use strict';

module.exports = function () {

    $('.price-info-link').click(function () {
        $('.call-for-price-info').toggle();
    });

    $('.call-details-close-btn').click(function () {
        $('.call-for-price-info').hide();
    });
};