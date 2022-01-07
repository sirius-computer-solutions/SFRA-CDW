'use strict';

var base = require('app_storefront_base/cartridge/scripts/middleware/cache');
var Site = require('dw/system/Site');

function applycdwInventorySensitiveCache(req, res, next) {
    res.cachePeriod = Site.current.getCustomPreferenceValue('cdwInventoryCacheTTL') || 30; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'minutes'; // eslint-disable-line no-param-reassign
    next();
}

function applycdwPriceSensitiveCache(req, res, next) {
    res.cachePeriod = Site.current.getCustomPreferenceValue('cdwPriceCacheTTL') || 30; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'minutes'; // eslint-disable-line no-param-reassign
    next();
}

function applycdwArrivalDateSensitiveCache(req, res, next) {
    res.cachePeriod = Site.current.getCustomPreferenceValue('cdwArrivalDateTTL') || 3; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
    next();
}

module.exports = {
    applyDefaultCache: base.applyDefaultCache,
    applyPromotionSensitiveCache: base.applyPromotionSensitiveCache,
    applyInventorySensitiveCache: base.applyInventorySensitiveCache,
    applyShortPromotionSensitiveCache: base.applyShortPromotionSensitiveCache,
    applycdwInventorySensitiveCache: applycdwInventorySensitiveCache,
    applycdwPriceSensitiveCache: applycdwPriceSensitiveCache,
    applycdwArrivalDateSensitiveCache: applycdwArrivalDateSensitiveCache
};
