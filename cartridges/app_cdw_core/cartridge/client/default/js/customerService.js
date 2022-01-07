'use strict';


var processInclude = require('base/util');


$(document).ready(function () {
    processInclude(require('./contactUs/contactUs'));
    processInclude(require('./customerService/customerService'));
});
