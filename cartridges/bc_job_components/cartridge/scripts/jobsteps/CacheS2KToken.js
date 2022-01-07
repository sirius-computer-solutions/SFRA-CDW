var Status = require('dw/system/Status');
var s2kConstants = require('../../../../app_cdw_core/cartridge/scripts/utils/s2kServiceConstants').getConstants();
var s2kRestService = require('../../../../app_cdw_core/cartridge/scripts/services/s2kRestService');
var StepUtil = require('~/cartridge/scripts/util/StepUtil');
const tokenCache = require('dw/system/CacheMgr').getCache(s2kConstants.AUTHORIZATION_TOKEN_CACHE_LOOKUP_ID);

/**
 *
 * @param {array} args
 */
var  saveS2KTokenInCache = function SaveS2KTokenInCache(args) {
    var warnMsg = [];
    if (StepUtil.isDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }
    tokenCache.invalidate(s2kConstants.AUTHORIZATION_TOKEN_NAME);
    var dataZipCode = { PostalCode: '33578' };

    var data = { path : s2kConstants.GET_VARSITY_TRANSIT, 
        method : s2kConstants.HTTP_METHOD_POST, 
        body : dataZipCode }

    var s2kResponse = s2kRestService.call(data);
};




exports.saveS2KTokenInCache = saveS2KTokenInCache;