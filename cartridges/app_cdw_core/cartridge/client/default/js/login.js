'use strict';


var processInclude = require('base/util');


$(document).ready(function () {
    processInclude(require('./login/login'));
    processInclude(require('./login/b2bLogin'));
    processInclude(require('./utils/utils'));
});
