window.jQuery = window.$ = require('jquery');
var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./components/menu'));
    processInclude(require('base/components/cookie'));
    processInclude(require('base/components/consentTracking'));
    processInclude(require('./components/header'));
    processInclude(require('./components/footer'));
    processInclude(require('./components/estimatedArrival'));
    processInclude(require('./components/callForPrice'));
    processInclude(require('./components/quantityValidation'));
    processInclude(require('./components/carousel'));
    processInclude(require('./components/miniCart'));
    processInclude(require('base/components/collapsibleItem'));
    processInclude(require('base/components/search'));
    processInclude(require('base/components/clientSideValidation'));
    processInclude(require('base/components/countrySelector'));
    processInclude(require('base/components/toolTip'));
    processInclude(require('./components/images'));
});

require('base/thirdParty/bootstrap');
require('base/components/spinner');

