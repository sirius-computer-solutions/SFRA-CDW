'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('base/addressBook/addressBook'));
    processInclude(require('./utils/utils'));
});
