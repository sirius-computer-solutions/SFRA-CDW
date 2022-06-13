'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var searchRefinementsFactory = require('*/cartridge/scripts/factories/searchRefinements');
var URLUtils = require('dw/web/URLUtils');
var preferences = require('*/cartridge/config/preferences');
var ProductSortOptions = require('*/cartridge/models/search/productSortOptions');
var urlHelper = require('*/cartridge/scripts/helpers/urlHelpers');
var Site = require('dw/system/Site');
var ArrayList = require('dw/util/ArrayList');

var ACTION_ENDPOINT = 'Search-Show';
var ACTION_ENDPOINT_AJAX = 'Search-ShowAjax';
var DEFAULT_PAGE_SIZE = preferences.defaultPageSize ? preferences.defaultPageSize : 12;


/**
 * Generates URL that removes refinements, essentially resetting search criteria
 *
 * @param {dw.catalog.ProductSearchModel} search - Product search object
 * @param {Object} httpParams - Query params
 * @param {string} [httpParams.q] - Search keywords
 * @param {string} [httpParams.cgid] - Category ID
 * @return {string} - URL to reset query to original search
 */
function getResetLink(search, httpParams) {
    var resetLink = search.categorySearch
        ? URLUtils.url(ACTION_ENDPOINT_AJAX, 'cgid', httpParams.cgid)
        : URLUtils.url(ACTION_ENDPOINT_AJAX, 'q', httpParams.q);
    if(httpParams.pmid) resetLink = URLUtils.url(ACTION_ENDPOINT_AJAX, 'pmid', httpParams.pmid);
    return resetLink;
}

/**
 * Retrieves search refinements
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {dw.catalog.ProductSearchRefinements} refinements - Search refinements
 * @param {ArrayList.<dw.catalog.ProductSearchRefinementDefinition>} refinementDefinitions - List of
 *     product serach refinement definitions
 * @return {Refinement[]} - List of parsed refinements
 */
function getRefinements(productSearch, refinements, refinementDefinitions, oci, httpParams) {

    var newRefinementDefinitions = new ArrayList();;
    var attributesNotToDisplayList = new ArrayList();
    var attributesNotToDisplay = Site.current.getCustomPreferenceValue('attributeIdsToNotToDisplay') || "";

    if(!empty(attributesNotToDisplay)) {
        for(var i=0;i<attributesNotToDisplay.length;i++) {
            attributesNotToDisplayList.add(attributesNotToDisplay[i]);
        }
    }

    /**Logic to check if the ALT URL is done and if if it is alt url, then check if we need to exclude the Brand filter to display START */
    if(!empty(oci)) {
        var CatalogMgr = require('dw/catalog/CatalogMgr');
        var originalCategory = CatalogMgr.getCategory(oci); 

        if(!empty(originalCategory) && !empty(originalCategory.custom) && "notToDisplayBrandFilter" in originalCategory.custom && originalCategory.custom.notToDisplayBrandFilter) {
            attributesNotToDisplayList.add("cdw-tools-brand-name");
        }
    }
    /**Logic to check if the ALT URL is done and if if it is alt url, then check if we need to exclude the Brand filter to display END */

    if(!empty(refinementDefinitions)) {
        for(var j=0;j<refinementDefinitions.length;j++) {
            if(!attributesNotToDisplayList.contains(refinementDefinitions[j].attributeID)) {
                if (refinementDefinitions[j].categoryRefinement) {
                    if( !empty(productSearch.category)) {
                        newRefinementDefinitions.push(refinementDefinitions[j]);
                    }
                }else {
                    newRefinementDefinitions.push(refinementDefinitions[j]);
                }
            }
        }
    }

    return collections.map(newRefinementDefinitions, function (definition) {
            var refinementValues = refinements.getAllRefinementValues(definition);
            var values = searchRefinementsFactory.get(productSearch, definition, refinementValues,oci,httpParams);
    
            return {
                displayName: definition.displayName,
                isCategoryRefinement: definition.categoryRefinement,
                isAttributeRefinement: definition.attributeRefinement,
                isPriceRefinement: definition.priceRefinement,
                isPromotionRefinement: definition.promotionRefinement,
                values: values
            };
    });
}

/**
 * Returns the refinement values that have been selected
 *
 * @param {Array.<CategoryRefinementValue|AttributeRefinementValue|PriceRefinementValue>}
 *     refinements - List of all relevant refinements for this search
 * @return {Object[]} - List of selected filters
 */
function getSelectedFilters(refinements) {
    var selectedFilters = [];
    var selectedValues = [];

    refinements.forEach(function (refinement) {
        selectedValues = refinement.values.filter(function (value) { return value.selected; });
        if (selectedValues.length) {
            selectedFilters.push.apply(selectedFilters, selectedValues);
        }
    });

    return selectedFilters;
}

/**
 * Configures and returns a PagingModel instance
 *
 * @param {dw.util.Iterator} productHits - Iterator for product search results
 * @param {number} count - Number of products in search results
 * @param {number} pageSize - Number of products to display
 * @param {number} startIndex - Beginning index value
 * @return {dw.web.PagingModel} - PagingModel instance
 */
function getPagingModel(productHits, count, pageSize, startIndex) {
    var PagingModel = require('dw/web/PagingModel');
    var paging = new PagingModel(productHits, count);

    paging.setStart(startIndex || 0);
    paging.setPageSize(pageSize || DEFAULT_PAGE_SIZE);

    return paging;
}

/**
 * Generates URL for [Show] More button
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {Object} httpParams - HTTP query parameters
 * @return {string} - More button URL
 */
function getShowMoreUrl(productSearch, httpParams) {
    var categoryHelper = require('*/cartridge/scripts/helpers/categoryHelper')
    var showMoreEndpoint = 'Search-UpdateGrid';
    var searchEndpoint = 'Search-Show';
    var tempOrigCatId = "";

    if(!empty(httpParams.oci)) { // This is when request from the brand link click
        tempOrigCatId = "oci="+httpParams.oci;
    } else if (empty(httpParams.oci) && !empty(httpParams.preferences) && 'cdw-tools-brand-name' in httpParams.preferences && productSearch.categorySearch) { // This is from the SEO Direct link or refresh of the page after the brand filters selected
        var catId = productSearch.category.ID;
        if(catId == "categories") {
            tempOrigCatId = categoryHelper.getGeneratedKeyWithFilters(httpParams).toString().replace(/ /g, '-' ).toLowerCase();
        } else {
            tempOrigCatId = categoryHelper.getGeneratedKeyWithFilters(httpParams).toString().replace(/ /g, '-' ).toLowerCase()+"-"+catId.toString().replace(/ /g, '-' ).toLowerCase();
        }
        tempOrigCatId = "oci="+tempOrigCatId;
    }
    

    var currentStart = httpParams.start || 0;
    var pageSize = httpParams.sz || DEFAULT_PAGE_SIZE;
    var hitsCount = productSearch.count;
    var nextStart;


    var totalPages = Math.ceil(hitsCount/pageSize);

    var pageinationURLArray = [];
    var localCurrentPage = 0;

    /** Handle the  Previous here */
    if(currentStart > 0) {
        var paging = getPagingModel(
            productSearch.productSearchHits,
            hitsCount,
            pageSize,
            currentStart-pageSize
        );
    
        var baseUrl = productSearch.url(showMoreEndpoint);
        var finalUrl = paging.appendPaging(baseUrl);

        var baseFullPageUrl = productSearch.url(searchEndpoint);
        var finalFullPageUrl = paging.appendPaging(baseFullPageUrl);
        if(!empty(tempOrigCatId)){
            finalFullPageUrl = categoryHelper.appendURLString(finalFullPageUrl,tempOrigCatId);
            finalUrl = categoryHelper.appendURLString(finalUrl,tempOrigCatId);
        }
        
        
        var pageDetails = {
            pageNumber: "<",
            pageURL: finalUrl,
            fullPageUrl: finalFullPageUrl,
            pageSelected: false,
            showPageNumber: true,
            itemsPerPage: pageSize
        };
        pageinationURLArray.push(pageDetails);        
    }

    /** Handle the current page */
    if(totalPages != 0 ) {
        var paging = getPagingModel(
            productSearch.productSearchHits,
            hitsCount,
            pageSize,
            0
        );
    
        var baseUrl = productSearch.url(showMoreEndpoint);
        var finalUrl = paging.appendPaging(baseUrl);

        var baseFullPageUrl = productSearch.url(searchEndpoint);
        // var finalFullPageUrl = paging.appendPaging(baseFullPageUrl);
        var finalFullPageUrl = baseFullPageUrl;

        if(!empty(tempOrigCatId)){
            finalFullPageUrl = categoryHelper.appendURLString(finalFullPageUrl,tempOrigCatId);
            finalUrl = categoryHelper.appendURLString(finalUrl,tempOrigCatId);
        }


        var selectedPage = false;
        if(currentStart == 0) {
            selectedPage = true;
        }
        var pageDetails = {
            pageNumber: "1",
            pageURL: finalUrl,
            fullPageUrl: finalFullPageUrl,
            pageSelected: selectedPage,
            showPageNumber: true,
            itemsPerPage: pageSize
        };
        pageinationURLArray.push(pageDetails);
    }




    /** handling the rest of pagenation */
    for(var i=0;i<totalPages;i++) {

        var paging = getPagingModel(
            productSearch.productSearchHits,
            hitsCount,
            pageSize,
            localCurrentPage
        );
    
        if (pageSize >= hitsCount) {
            return '';
        } else if (pageSize > pageSize) {
            nextStart = pageSize;
        } else {
            var endIdx = paging.getEnd();
            nextStart = endIdx + 1 < hitsCount ? endIdx + 1 : null;
    
            if (!nextStart) {
                if(localCurrentPage == 0) {
                    return '';
                } else {
                   break;
                }
                
            }
        }
    
        paging.setStart(nextStart);
    
        var baseUrl = productSearch.url(showMoreEndpoint);
        var finalUrl = paging.appendPaging(baseUrl);

        var baseFullPageUrl = productSearch.url(searchEndpoint);
        var finalFullPageUrl = paging.appendPaging(baseFullPageUrl);
        if(!empty(tempOrigCatId)){
            finalFullPageUrl = categoryHelper.appendURLString(finalFullPageUrl,tempOrigCatId);
            finalUrl = categoryHelper.appendURLString(finalUrl,tempOrigCatId);
        }


        localCurrentPage = parseInt(localCurrentPage)+parseInt(pageSize);

        /** Handle the selection of page */
        var selectedPage = false;
        if(localCurrentPage == currentStart) {
            selectedPage = true;
        }
        var pNumber = i+2;
        var showPageNumber = false;
        if(totalPages <= 4 || 
            (pNumber === totalPages || 
                (localCurrentPage == (currentStart-pageSize) || (localCurrentPage == (parseInt(currentStart)+parseInt(pageSize))))) ||
            ((currentStart == 0 && (localCurrentPage == (parseInt(currentStart)+parseInt(pageSize)) || ( localCurrentPage ==(parseInt(currentStart)+parseInt(pageSize)+parseInt(pageSize)))))) ||
            ((currentStart >= (hitsCount-pageSize) && (localCurrentPage == (parseInt(currentStart)-parseInt(pageSize)) || ( localCurrentPage ==(parseInt(currentStart)-parseInt(pageSize)-parseInt(pageSize)))))) ||
            (localCurrentPage == currentStart)
            ) {
            showPageNumber = true;
        }

        var pageDetails = {
            pageNumber: pNumber.toString(),
            pageURL: finalUrl,
            fullPageUrl: finalFullPageUrl,
            pageSelected: selectedPage,
            showPageNumber: showPageNumber,
            itemsPerPage: pageSize
        };

        pageinationURLArray.push(pageDetails);

        

    }

    /** Handle Next Here */
    if(totalPages > 1 && parseInt(currentStart)+parseInt(pageSize) < hitsCount) {
        var paging = getPagingModel(
            productSearch.productSearchHits,
            hitsCount,
            pageSize,
            parseInt(currentStart)+parseInt(pageSize)
        );
    
        var baseUrl = productSearch.url(showMoreEndpoint);
        var finalUrl = paging.appendPaging(baseUrl);

        var baseFullPageUrl = productSearch.url(searchEndpoint);
        var finalFullPageUrl = paging.appendPaging(baseFullPageUrl);
        if(!empty(tempOrigCatId)){
            finalFullPageUrl = categoryHelper.appendURLString(finalFullPageUrl,tempOrigCatId)
        }

        
        var pageDetails = {
            pageNumber: ">",
            pageURL: finalUrl,
            fullPageUrl: finalFullPageUrl,
            pageSelected: false,
            showPageNumber: true,
            itemsPerPage: pageSize
        };
        pageinationURLArray.push(pageDetails);        
    }

    return pageinationURLArray;
}

/**
 * Forms a URL that can be used as a permalink with filters, sort, and page size preserved
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {number} pageSize - 'sz' query param
 * @param {number} startIdx - 'start' query param
 * @return {string} - Permalink URL
 */
function getPermalink(productSearch, pageSize, startIdx) {
    var showMoreEndpoint = 'Search-Show';
    var params = { start: '0', sz: pageSize + startIdx };
    var url = productSearch.url(showMoreEndpoint).toString();
    var appended = urlHelper.appendQueryParams(url, params).toString();
    return appended;
}

/**
 * Compile a list of relevant suggested phrases
 *
 * @param {dw.util.Iterator.<dw.suggest.SuggestedPhrase>} suggestedPhrases - Iterator to retrieve suggestedPhrases
 * @return {SuggestedPhrase[]} - Array of suggested phrases
 */
function getPhrases(suggestedPhrases) {
    var phrase = null;
    var phrases = [];

    while (suggestedPhrases.hasNext()) {
        phrase = suggestedPhrases.next();
        phrases.push({
            value: phrase.phrase,
            url: URLUtils.url(ACTION_ENDPOINT, 'q', phrase.phrase)
        });
    }
    return phrases;
}


/**
 * @constructor
 * @classdesc ProductSearch class
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {Object} httpParams - HTTP query parameters
 * @param {string} sortingRule - Sorting option rule ID
 * @param {dw.util.ArrayList.<dw.catalog.SortingOption>} sortingOptions - Options to sort search
 *     results
 * @param {dw.catalog.Category} rootCategory - Search result's root category if applicable
 */
function ProductSearch(productSearch, httpParams, sortingRule, sortingOptions, rootCategory) {
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
    var categoryHelper = require('*/cartridge/scripts/helpers/categoryHelper')

    this.oci = httpParams.oci || "";
    this.httpParams= httpParams;
    this.pageSize = parseInt(httpParams.sz, 10) || DEFAULT_PAGE_SIZE;
    this.productSearch = productSearch;
    var startIdx = httpParams.start || 0;

    var Site = require('dw/system/Site');
    var overrideATSSortingRules = Site.getCurrent().getCustomPreferenceValue('overrideATSSortingRule');
    if (overrideATSSortingRules != null && overrideATSSortingRules == 'true') {
        var modifySortRules = Site.getCurrent().getCustomPreferenceValue('modifySortRules') || 'top-sellers';
        var modifySortRulesMax = Site.getCurrent().getCustomPreferenceValue('modifySortRulesMax') || '20000';
        var srule = productSearch.getSortingRule();
        var inStockProducts = new ArrayList();
        var backOrderProducts = new ArrayList();
        var outStockProducts = new ArrayList();
        var products = productSearch.productSearchHits;
        var allProducts = new ArrayList();
        
        if(productSearch.getCount()<modifySortRulesMax && (srule==null || (srule!=null && modifySortRules.indexOf(srule.ID)!=-1)))
        {
            while(products.hasNext())
            {
                
                var product = products.next();
                if(product.product.availabilityModel.inventoryRecord!=null && product.product.availabilityModel.inventoryRecord.getStockLevel().getValue() > 0 ){
                    inStockProducts.add(product);
                }
                else if(product.product.availabilityModel.inventoryRecord!=null && product.product.availabilityModel.inventoryRecord.getATS().getValue() > 0 ){
                    backOrderProducts.add(product);
                }
                else{
                    outStockProducts.add(product);
                }
            }
            
            allProducts.addAll(inStockProducts);
            allProducts.addAll(backOrderProducts);
            allProducts.addAll(outStockProducts);
            products = allProducts.iterator();
        }
    }

    var paging = getPagingModel(
        products,
        productSearch.count,
        this.pageSize,
        startIdx
    );

    var searchSuggestions = productSearch.searchPhraseSuggestions;
    this.isSearchSuggestionsAvailable = searchSuggestions ? searchSuggestions.hasSuggestedPhrases() : false;

    if (this.isSearchSuggestionsAvailable) {
        this.suggestionPhrases = getPhrases(searchSuggestions.suggestedPhrases);
    }

    this.pageNumber = paging.currentPage;
    this.count = productSearch.count;
    this.isCategorySearch = productSearch.categorySearch;
    this.isRefinedCategorySearch = productSearch.refinedCategorySearch;
    this.searchKeywords = productSearch.searchPhrase;

    this.resetLink = getResetLink(productSearch, httpParams);
    this.bannerImageUrl = productSearch.category ? searchHelper.getBannerImageUrl(productSearch.category) : null;
    this.productIds = collections.map(paging.pageElements, function (item) {
        return {
            productID: item.productID,
            productSearchHit: item
        };
    });
    if(!empty(session.custom.sortRule)) {
        sortingRule = session.custom.sortRule;
    }
    this.productSort = new ProductSortOptions(
        productSearch,
        sortingRule,
        sortingOptions,
        rootCategory,
        paging,
        this.oci
    );
    this.showMoreUrl = getShowMoreUrl(productSearch, httpParams);
    this.permalink = getPermalink(
        productSearch,
        parseInt(this.pageSize, 10),
        parseInt(startIdx, 10)
    );

    /**
     *  Logic to the canonical link for pages - START
     */
    var showMoreEndpoint = 'Search-Show';
    var tempCanonicalLink = productSearch.url(showMoreEndpoint).toString();
    if(!empty(httpParams.start) && httpParams.start != 0) {
        var params = { start: httpParams.start, sz: this.pageSize };
        var appended = urlHelper.appendQueryParams(tempCanonicalLink, params).toString();
        tempCanonicalLink = appended;
    }
    
    // } else if (empty(httpParams.oci) && !empty(httpParams.preferences) && 'cdw-tools-brand-name' in httpParams.preferences && productSearch.categorySearch) { // This is from the SEO Direct link or refresh of the page after the brand filters selected
    if (!empty(httpParams.preferences) && 'cdw-tools-brand-name' in httpParams.preferences && productSearch.categorySearch) { // This is from the SEO Direct link or refresh of the page after the brand filters selected
        var catId = productSearch.category.ID;
        if(catId == "categories") {
            var tempOrigCatId = categoryHelper.getGeneratedKeyWithFilters(httpParams).toString().replace(/ /g, '-' ).toLowerCase();
        } else {
            var tempOrigCatId = categoryHelper.getGeneratedKeyWithFilters(httpParams).toString().replace(/ /g, '-' ).toLowerCase()+"-"+catId.toString().replace(/ /g, '-' ).toLowerCase();
        }
        
        if(tempCanonicalLink.toString().indexOf('?') == -1) {
            tempCanonicalLink = tempCanonicalLink + "?oci="+tempOrigCatId;
        }else {
            tempCanonicalLink = tempCanonicalLink + "&oci="+tempOrigCatId;
        }
    } else if(!empty(httpParams.oci)) { // This is when request from the brand link click
        if(tempCanonicalLink.toString().indexOf('?') == -1) {
            tempCanonicalLink = tempCanonicalLink + "?oci="+httpParams.oci;
        }else {
            tempCanonicalLink = tempCanonicalLink + "&oci="+httpParams.oci;
        }
    }else {
        tempCanonicalLink = tempCanonicalLink;
    }
    this.canonicalLink = tempCanonicalLink;

    /**
     *  Logic to the canonical link for pages - END
     */


    if (productSearch.category) {
        var brandSortValue = '';
        if(productSearch.category.custom && 'brandSortValue' in productSearch.category.custom) {
            brandSortValue = productSearch.category.custom.brandSortValue;
        }
        
        this.category = {
            name: productSearch.category.displayName,
            id: productSearch.category.ID,
            pageTitle: productSearch.category.pageTitle,
            pageDescription: productSearch.category.pageDescription,
            pageKeywords: productSearch.category.pageKeywords,
            brandSortValue:brandSortValue
        };
    }
    this.pageMetaTags = productSearch.pageMetaTags;
    this.itemsPerPageURL = productSearch.url("Search-UpdateGrid");
    if(!empty(httpParams.oci)) {
        var ociCatId = "oci="+httpParams.oci;
        this.itemsPerPageURL = categoryHelper.appendURLString(this.itemsPerPageURL,ociCatId);
    }
}

Object.defineProperty(ProductSearch.prototype, 'refinements', {
    get: function () {
        if (!this.cachedRefinements) {
            //Filter any refinemnets configured for cdw NOT to display in filter on top of search refinements
            this.cachedRefinements = getRefinements(
                this.productSearch,
                this.productSearch.refinements,
                this.productSearch.refinements.refinementDefinitions,
                this.oci,
                this.httpParams
            );
        }
        return this.cachedRefinements;
    }
});

Object.defineProperty(ProductSearch.prototype, 'selectedFilters', {
    get: function () {
        return getSelectedFilters(this.refinements);
    }
});

module.exports = ProductSearch;
