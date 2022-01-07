'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./search/search'));
    processInclude(require('./product/compare'));
    processInclude(require('base/product/quickView'));
    
});
