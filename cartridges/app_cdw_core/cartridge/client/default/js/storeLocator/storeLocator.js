/* globals google */
'use strict';

var storeLocator = require('base/storeLocator/storeLocator');

function detectLocation() {
    // clicking on detect location.
    $('.detect-location').on('click', function () {
        $.spinner().start();
        if (!navigator.geolocation || Object.keys(navigator.geolocation).length === 0) {
            setTimeout(function () {
                $.spinner().stop();
                return; 
            }, 2000);
        } else {
            storeLocator.detectLocation();
        }

    });
}

storeLocator.detectLocation = detectLocation;
var exportDetails = $.extend({}, storeLocator);

module.exports = exportDetails;
