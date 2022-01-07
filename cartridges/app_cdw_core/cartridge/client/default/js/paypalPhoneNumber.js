'use strict';

var processInclude = require('base/util');


$(document).ready(function () {
    processInclude(require('./paypal/paypalPhoneNumber'));
    processInclude(require('./utils/utils'));
});