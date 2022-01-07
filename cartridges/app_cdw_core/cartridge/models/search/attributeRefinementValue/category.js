 'use strict';
 
 var BaseCategory = require('app_storefront_base/cartridge/models/search/attributeRefinementValue/category');
 var categoryHelper = require('*/cartridge/scripts/helpers/categoryHelper')
 var URLUtils = require('dw/web/URLUtils');
 /**
  * @constructor
  * @classdesc Category attribute refinement value model
  *
  * @param {dw.catalog.ProductSearchModel} productSearch - ProductSearchModel instance
  * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
  *     definition
  * @param {dw.catalog.ProductSearchRefinementValue} refinementValue - Raw DW refinement value
  * @param {boolean} selected - Selected flag
  */
 function CategoryRefinementValueWrapper(productSearch, refinementDefinition, refinementValue,selected, oci, httpParams) {
     BaseCategory.apply(this, Array.prototype.slice.call(arguments));
     //this.hidefromLeftNavigationRefinement = refinementValue.custom.hidefromLeftNavigationRefinement;
     if (productSearch.categorySearch) { // This is from the SEO Direct link or refresh of the page after the brand filters selected
         var catId = refinementValue.ID;
         if(catId == "categories") {
            oci = categoryHelper.getGeneratedKeyWithFilters(httpParams).toString().replace(/ /g, '-' ).toLowerCase();
         } else if (!empty(httpParams.preferences) && 'cdw-tools-brand-name' in httpParams.preferences) {
            oci = categoryHelper.getGeneratedKeyWithFilters(httpParams).toString().replace(/ /g, '-' ).toLowerCase()+"-"+catId.toString().replace(/ /g, '-' ).toLowerCase();
         } else if('oci' in httpParams){
            oci = catId.toString().replace(/ /g, '-' ).toLowerCase();
         }
      }

      if(!empty(oci)) {
         this.url = this.url+"&oci="+oci;
      }
      this.pageUrl = this.fullURL;
      if(!empty(oci)) {
         if(this.fullURL.toString().indexOf('?') == -1) {
            this.pageUrl = this.fullURL + "?oci="+oci;
        }else {
         this.pageUrl = this.fullURL + "&oci="+oci;
        }
      }      
    
 }
 
 CategoryRefinementValueWrapper.prototype = Object.create(BaseCategory.prototype);
 CategoryRefinementValueWrapper.prototype.constructor = CategoryRefinementValueWrapper;
 
 module.exports = CategoryRefinementValueWrapper;