'use strict';

/**
 * @returns {Object} gtmSettings object
 */
function getSettings() {
    var Site = require('dw/system/Site');
    var gtmSettings = {};
    gtmSettings.accountURL = Site.getCurrent().getCustomPreferenceValue('gtmAccountURL');
    gtmSettings.environment = Site.getCurrent().getCustomPreferenceValue('gtmEnvironment');
    gtmSettings.profileAuth = Site.getCurrent().getCustomPreferenceValue('gtmProfileAuth');
    gtmSettings.loadAsync = Site.getCurrent().getCustomPreferenceValue('gtmLoadAsync');
    gtmSettings.key = Site.getCurrent().getCustomPreferenceValue('gtmProfileKey');
    if (!gtmSettings.accountURL ||
        !gtmSettings.environment ||
        !gtmSettings.profileAuth ||
        !gtmSettings.key ||
        !gtmSettings.loadAsync) {
        return null;
    }
    return gtmSettings;
}

var gtmTransformator = {};

gtmTransformator.transformGlobalData = function (viewData) {
    return viewData;
};

gtmTransformator.transformPersonalizedData = function (viewData) {
    return viewData;
};
/**
 *
 * @param {string} context object as defined in plugin_datalayer:datalyer.js
 * @param {Object} datalayerView the current view object to be transformed
 *
 * @returns {Object} the transformed view object
 */
function transform(context, datalayerView) {
    var transformedView = [];
    var methodName = 'transform' + context;

    datalayerView.forEach(function (view) {
        if (typeof gtmTransformator[methodName] === 'function') {
            transformedView.push(gtmTransformator[methodName].call(gtmTransformator, view));
        }
    });

    return transformedView;
}

module.exports = {
    getSettings: getSettings,
    transform: transform
};
