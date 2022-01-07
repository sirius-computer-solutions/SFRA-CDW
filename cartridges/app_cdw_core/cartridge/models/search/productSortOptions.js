'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var urlHelper = require('*/cartridge/scripts/helpers/urlHelpers');

var ACTION_ENDPOINT = 'Search-UpdateGrid';
var base = module.superModule;

/**
 * Retrieves sorting options
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search instance
 * @param {dw.util.List.<dw.catalog.SortingOption>} sortingOptions - List of sorting rule options
 * @param {dw.web.PagingModel} pagingModel - The paging model for the current search context
 * @return {SortingOption} - Sorting option
 */
function getSortingOptions(productSearch, sortingOptions, pagingModel, oci) {
    return collections.map(sortingOptions, function (option) {
        var baseUrl = productSearch.urlSortingRule(ACTION_ENDPOINT, option.sortingRule);
        var pagingParams = {
            start: pagingModel.start,
            sz: pagingModel.pageSize
        };
        if(!empty (oci)) {
            var ociValue = {
                oci: oci
            };
            baseUrl = urlHelper.appendQueryParams(baseUrl.toString(), ociValue).toString();
        }
        return {
            displayName: option.displayName,
            id: option.ID,
            url: urlHelper.appendQueryParams(baseUrl.toString(), pagingParams).toString()
        };
    });
}

/**
 * @constructor
 * @classdesc Model that encapsulates product sort options
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search instance
 * @param {string|null} sortingRuleId - HTTP Param srule value
 * @param {dw.util.List.<dw.catalog.SortingOption>} sortingOptions - Sorting rule options
 * @param {dw.catalog.Category} rootCategory - Catalog's root category
 * @param {dw.web.PagingModel} pagingModel - The paging model for the current search context
 */
function ProductSortOptions(
    productSearch,
    sortingRuleId,
    sortingOptions,
    rootCategory,
    pagingModel,
    oci
) {
    base.call(this, productSearch, sortingRuleId, sortingOptions,rootCategory,pagingModel);
    this.options = getSortingOptions(productSearch, sortingOptions, pagingModel, oci);
    
}

module.exports = ProductSortOptions;
