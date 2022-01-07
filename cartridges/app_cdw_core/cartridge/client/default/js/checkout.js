'use strict';


var processInclude = require('base/util');


$(document).ready(function () {
    // Instore pickup
    try {
        //cdw checkout below includes instorepickup checkout overrides
        //processInclude(require('instorepickup/checkout/checkout'));
        processInclude(require('./checkout/instore'));
    } catch (ex) {
        // plugin not in use
    }
    //processInclude(require('gift_cert/checkout/giftCertificate'));
    processInclude(require('./checkout/giftCertificate'));
    processInclude(require('./checkout/checkout'));
    processInclude(require('./utils/utils'));
});
