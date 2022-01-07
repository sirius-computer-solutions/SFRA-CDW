'use strict';

var BaseAttributeValue = require('*/cartridge/models/search/attributeRefinementValue/base');
var Resource = require('dw/web/Resource');
var categoryHelper = require('*/cartridge/scripts/helpers/categoryHelper')


/**
 * @constructor
 * @classdesc Boolean attribute refinement value model
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - ProductSearchModel instance
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition
 * @param {dw.catalog.ProductSearchRefinementValue} refinementValue - Raw DW refinement value
 */
function BooleanAttributeValue(productSearch, refinementDefinition, refinementValue, httpParams, oci) {
    this.oci = oci;
    this.productSearch = productSearch;
    this.refinementDefinition = refinementDefinition;
    this.refinementValue = refinementValue;
    this.initialize();
}

BooleanAttributeValue.prototype = Object.create(BaseAttributeValue.prototype);

BooleanAttributeValue.prototype.initialize = function () {
    BaseAttributeValue.prototype.initialize.call(this);

    this.type = 'boolean';
    this.displayValue = this.getDisplayValue(
        this.refinementDefinition.attributeID,
        this.refinementValue.displayValue
    );
    this.selected = this.isSelected(
        this.productSearch,
        this.refinementDefinition.attributeID,
        this.refinementValue.value
    );
    
    this.url = this.getUrl(
        this.productSearch,
        this.actionEndpoint,
        this.id,
        this.value,
        this.selected,
        this.selectable
    );

    if(!empty(this.oci)) {
        this.url = this.url+"&oci="+this.oci;
    }
    this.title = this.getTitle(
        this.selected,
        this.selectable,
        this.refinementDefinition.displayName,
        this.displayValue
    );

    this.pageUrl = this.getUrl(
        this.productSearch,
        "Search-Show",
        this.id,
        this.value,
        this.selected,
        this.selectable
    );   
 
};

BooleanAttributeValue.prototype.getDisplayValue = function (attributeID, displayValue) {
    return Resource.msg(
        ['label.refinement', attributeID, displayValue].join('.'),
        'search',
        displayValue
    );
};

/**
 * @constructor
 * @classdesc Boolean attribute refinement value model
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - ProductSearchModel instance
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition
 * @param {dw.catalog.ProductSearchRefinementValue} refinementValue - Raw DW refinement value
 */
function BooleanRefinementValueWrapper(productSearch, refinementDefinition, refinementValue, httpParams, oci) {
    var value = new BooleanAttributeValue(
        productSearch,
        refinementDefinition,
        refinementValue,
        httpParams,
        oci
    );

    this.pageUrl = new BooleanAttributeValue(productSearch, refinementDefinition, refinementValue, httpParams, oci).pageUrl;    

    if(refinementDefinition.attributeID == 'cdw-tools-brand-name' && productSearch.categorySearch  && !value.selected) {
        // if (!empty(httpParams.preferences) && 'cdw-tools-brand-name' in httpParams.preferences && productSearch.categorySearch) { // This is from the SEO Direct link or refresh of the page after the brand filters selected
        //     var catId = productSearch.category.ID;
        //     if(catId == "categories") {
        //        oci = categoryHelper.getGeneratedKeyWithFilters(httpParams).toString().replace(/ /g, '-' ).toLowerCase();
        //     } else {
        //        oci = categoryHelper.getGeneratedKeyWithFilters(httpParams).toString().replace(/ /g, '-' ).toLowerCase()+"-"+catId.toString().replace(/ /g, '-' ).toLowerCase();
        //     }
        //  } else {
            var catId = productSearch.category.ID;
            if(catId == "categories") {
               oci = refinementValue.value.toString().replace(/ /g, '-' ).toLowerCase();
            } else {
              oci = refinementValue.value.toString().replace(/ /g, '-' ).toLowerCase()+"-"+catId.toString().replace(/ /g, '-' ).toLowerCase();
            }
            
        //  }
        if(this.pageUrl.toString().indexOf('?') == -1) {
            this.pageUrl = this.pageUrl + "?oci="+oci;
        }else {
         this.pageUrl = this.pageUrl + "&oci="+oci;
        }
    }

    
    var items = [
        'id',
        'type',
        'displayValue',
        'selected',
        'selectable',
        'title',
        'url',
        'hitCount'
    ];
    items.forEach(function (item) {
        this[item] = value[item];
    }, this);

    

}

module.exports = BooleanRefinementValueWrapper;
