'use strict';

var base = require('app_storefront_base/cartridge/scripts/middleware/cache');
var Site = require('dw/system/Site');

function applyAcmeInventorySensitiveCache(req, res, next) {
    res.cachePeriod = Site.current.getCustomPreferenceValue('AcmeInventoryCacheTTL') || 30; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'minutes'; // eslint-disable-line no-param-reassign
    next();
}

function applyAcmePriceSensitiveCache(req, res, next) {
    res.cachePeriod = Site.current.getCustomPreferenceValue('AcmePriceCacheTTL') || 30; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'minutes'; // eslint-disable-line no-param-reassign
    next();
}

function applyAcmeArrivalDateSensitiveCache(req, res, next) {
    res.cachePeriod = Site.current.getCustomPreferenceValue('AcmeArrivalDateTTL') || 3; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
    next();
}

module.exports = {
    applyDefaultCache: base.applyDefaultCache,
    applyPromotionSensitiveCache: base.applyPromotionSensitiveCache,
    applyInventorySensitiveCache: base.applyInventorySensitiveCache,
    applyShortPromotionSensitiveCache: base.applyShortPromotionSensitiveCache,
    applyAcmeInventorySensitiveCache: applyAcmeInventorySensitiveCache,
    applyAcmePriceSensitiveCache: applyAcmePriceSensitiveCache,
    applyAcmeArrivalDateSensitiveCache: applyAcmeArrivalDateSensitiveCache
};
