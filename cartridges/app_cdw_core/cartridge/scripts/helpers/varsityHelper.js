'use strict';

var Site = require('dw/system/Site');
var Logger = require('dw/system/Logger');
var logger = Logger.getLogger("varsity","varsity");
var s2kConstants = require('*/cartridge/scripts/utils/s2kServiceConstants').getConstants();
var s2kRestService = require('*/cartridge/scripts/services/s2kRestService');
var varsityConstants = require('*/cartridge/scripts/utils/varsityConstants').getConstants();
var Resource = require('dw/web/Resource');
var varsityResponseCache = require('dw/system/CacheMgr').getCache(varsityConstants.VARSITY_RESPONSE);
var zipCodeCache = require('dw/system/CacheMgr').getCache(varsityConstants.ZIP_CODE);
var s2kUtils = require('*/cartridge/scripts/helpers/s2kUtils');

/**
 * This script is a helper class for functions of the varsity cartridge
 */

/**
 * Adjusts the date if the start date is a past date or a sunday 
 * @param {Date} startDate 
 * @returns {Date}
 */
function validateStartDate(startDate) {
    var today = new Date();
    if (startDate.getDay() == 0) {
        startDate = new Date(startDate.setDate(startDate.getDate() + 1));
    }  
    if (new Date(startDate).getTime() <= today.getTime()) {
        return today;
    } else {
        return startDate;
    }
}

/**
 * calculates the estimated date range
 * @param {string} response - the json response returned from Varsity
 * @returns {object} object that contains the start date and end date
 */
exports.getEstimatedDateRange = function (response, addOneDay, serviceType, rangeStart, rangeEnd) {

    var shippingData = response.Services.filter(service => service.ServiceType === serviceType);
    if(shippingData.length > 0) {   
         
      var arrDate = shippingData[0].Date;
      logger.debug("::: Varsity Arrival Date ::: "+ arrDate);

      var year = arrDate.substring(0,4);
      var month = arrDate.substring(4,6);
      var day = arrDate.substring(6,8);
      
      /** Add one extra day if the current time stamp is past noon. This is mainly for OVERNIGHT shipping */
      if(addOneDay && s2kUtils.currentTimePastNoonCST()) {
        day = parseInt(day)+1;
      }

      var options = { weekday: 'short', month: 'long', day: 'numeric' };
      var startDate = new Date(year, month-1, day);
      if(rangeStart == null || rangeEnd == null) {// Since range is not configured just release the actual date
        var dateRange = {
            estStartDate: startDate.toLocaleDateString("en-US", options),
            estEndDate: null
         };
         return dateRange;
      }
      var range = rangeStart != null ? rangeStart : Site.current.getCustomPreferenceValue('estimatedDateRange');
      var count = 0;
      
      var rangeEndDate = startDate;
      while(count < rangeEnd){
         rangeEndDate = new Date(rangeEndDate.setDate(rangeEndDate.getDate() + 1));
         if(rangeEndDate.getDay() != 0){
               count++;
         }
      }
      logger.debug("::: serviceType :::"+serviceType+"::: startDate ::: "+startDate+"::: rangeEnd ::: "+rangeEnd+"::: rangeStart ::: "+ rangeStart);

      if(rangeStart){
         count = 0;
         var rangeStartDate = startDate;
         while(count < rangeStart){
            rangeStartDate = new Date(rangeStartDate.setDate(rangeStartDate.getDate() - 1));
               count++;
         }
         rangeStartDate = validateStartDate(rangeStartDate);
      }
      var dateRange = {
         estStartDate: rangeStartDate.toLocaleDateString("en-US", options),
         estEndDate: rangeEndDate.toLocaleDateString("en-US", options)
      };
      return dateRange;
   }
   return;
};

exports.getVarsityResponse = function (geoZipCode) {
    var serverErrors = [];
    var error = false;

    try {

        var response = varsityResponseCache.get(geoZipCode);
        if (!empty(response)) {
            return response;
        }

        var dataZipCode = { PostalCode: geoZipCode };

        var data = { path : s2kConstants.GET_VARSITY_TRANSIT, 
            method : s2kConstants.HTTP_METHOD_POST, 
            body : dataZipCode }

        var varsityServiceResponse = s2kRestService.call(data);
        varsityResponseCache.put(geoZipCode, varsityServiceResponse);

        if (varsityServiceResponse == null) {
            logger.error("No response was received from Varsity");
            return {error:true};
        }
        if (varsityServiceResponse.StatusCode == 0) {
            logger.debug("Request was successful. Response: " + varsityServiceResponse);
            if(varsityServiceResponse.Services.length > 0) {
                return varsityServiceResponse;
            } else {
                error = true;
                serverErrors.push ('error.invalid.zipcode', 'int_varsity', null);
            }
            
        } else {
            if (varsityServiceResponse.message) {
                error = true;
                serverErrors.push (varsityServiceResponse.message, 'int_varsity', null);
            }
        }
    } catch (e) {
        var a = e;
        error = true;
        serverErrors.push (
            Resource.msg('error.technical', 'int_varsity', null)
        );
    }

    return { serverErrors : serverErrors, error : error };
};