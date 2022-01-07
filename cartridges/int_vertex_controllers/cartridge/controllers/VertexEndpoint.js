'use strict';

/**
 * Controller : VertexEndpoint
 *
 * @module controllers/Vertex
 */
var STOREFRONT_CONTROLLERS_CARTRIDGE_NAME = 'app_storefront_controllers';
var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');
var ResponseUtil = require('*/cartridge/scripts/util/Response');
var API = require('*/cartridge/scripts/lib/libVertexApi.js');
var Template = require('dw/util/Template');
var utils = require('*/cartridge/scripts/vertex')

/**
 * @description Endpoint for deleting request
 */
function deleteRequest() {
    var requestData;
    var Vertex;
    var vertexResult;
    var reply = {
        error   : true,
        message : ''
    };


    var DeleteHelper = require('*/cartridge/scripts/helper/deleteRequest');
    requestData = DeleteHelper.validateRequestParameters();

    if (requestData.ok) {
        Vertex = require('*/cartridge/scripts/vertex');
        vertexResult = Vertex.DeleteTransaction(requestData.transaction, requestData.source);

        if (vertexResult) {
            reply.message = 'Success. DeleteTransaction sent for processing. Transaction: ' + requestData.transaction + ', Source: ' + requestData.source;
            reply.error = false;
        } else {
            reply.message = 'Internal error, DeleteTransaction call failed. Transaction: ' + requestData.transaction + ', Source: ' + requestData.source;
            response.setStatus(500);
        }
    } else {
        response.setStatus(requestData.httpStatus);
        reply.message = requestData.message;
    }

    ResponseUtil.renderJSON(reply);
}
/**
 * @description Get suggestions for address cleasing
 */
function getSuggest() {
    var args; 
    var params;
    var response = {
        success : true,
        text    : null
    };
    var cart = app.getModel('Cart').get();
    var template = new Template('checkout/vertex/multishippingsuggestions');
    var object = require('*/cartridge/scripts/object');
    var fields = app.getForm('multishipping.editAddress.addressFields').object;
    var result = API.LookupTaxArea(fields, cart);

    if (result.addresses.length > 1) {
        var isEqual = isAddressesEqual(result.addresses);
        if (!isEqual) {
            args = {
                suggests: utils.filterUniqueAddresses(result.addresses)
            };
            params = object.toHashMap(args);
            response.text = template.render(params).text;
        }
    } else {
        args = { error: 'error' };
        params = object.toHashMap(args);
        response.text = template.render(params).text;
    }

    ResponseUtil.renderJSON(response);
}
/**
 *
 * @param {array} addresses array of Addresses
 * @returns {boolean} returns true if address exists in suggestions
 */
function isAddressesEqual(addresses) {
    var result = false;
    var key = 'Use Address As-Is';
    var fields = ['address1', 'city', 'countryCode', 'postalCode', 'stateCode'];
    var customerAddress;

    // Get customer saved address
    for (var i = 0; i < addresses.length; i++) {
        var address = addresses[i];
        if (address.key == key) {
            customerAddress = address;
        }
    }

    // Go though all addresses and check each suggested
    // address with customer address, if they are the same
    // we will save without any suggests otherwise we show suggest pop up
    result = addresses.some(function (add) {
        if (add.key != key) {
            var isEqual = fields.every(function (field) {
                return add[field] == customerAddress[field];
            });
            return isEqual;
        }
        return false;
    });
    return result;
}
/** Send request to Vertex Service to get proposed corrected address * */
exports.GetSuggest = guard.ensure(['https', 'post'], getSuggest);

/** Send Transaction Delete Request to Vertex service
 * @see module:controllers/Vertex~deleteRequest */
exports.DeleteRequest = guard.ensure(['https', 'post'], deleteRequest);
