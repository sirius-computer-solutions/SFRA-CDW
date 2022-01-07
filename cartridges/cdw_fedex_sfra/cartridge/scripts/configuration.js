'use strict';

/* API Includes */
var Site = require('dw/system/Site');

/**
 * Retrieves the host name of the current site.
 *
 * @returns {string} Current site's host name.
 */
function getSiteHostName() {
    return Site.current.httpsHostName;
}

/**
 * Retrieves the site custom preference from the current site.
 *
 * @param {string} preference Preference name to retrieve.
 * @returns {string} Preferenece value from the site custom preferences.
 */
function getSitePreference(preference) {
    return Site.current.getCustomPreferenceValue(preference);
}

/**
 * Retrieves Fedex enable/disable status.
 *
 * @returns {boolean} enable/disable status
 */
function enabled() {
    return getSitePreference('FedexEnabled') === true;
}

/**
 * Configuration object used to prepare Fedex API requests.
 */
function Configuration() {
    this.sitePreferences = {
        enabled: enabled()
    };

    this.siteDetails = {
        ecommerceCart: 'salesforceB2CCommerce',
        ecommerceVersion: '20.1',
        websiteUrl: getSiteHostName()
    };
}

/**
 * Initializes the complete Fedex configuration.
 *
 * @returns {Object} initialized configuration object
 */
function init() {
    return new Configuration();
}

module.exports = {
    enabled: enabled,
    init: init
};
