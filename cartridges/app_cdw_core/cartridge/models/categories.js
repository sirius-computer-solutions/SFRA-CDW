'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var URLUtils = require('dw/web/URLUtils');

/**
 * Get category url
 * @param {dw.catalog.Category} category - Current category
 * @returns {string} - Url of the category
 */
function getCategoryUrl(category) {

    if(category.custom && 'alternativeUrl' in category.custom && category.custom.alternativeUrl) {
        var altUrl = category.custom.alternativeUrl.toString();
        if (altUrl.indexOf('prefn')!=-1 && altUrl.indexOf('prefv')!=-1) 
        {
            if(category.custom.alternativeUrl.toString().indexOf('?') == -1) {
                return (category.custom.alternativeUrl.toString()).replace(/&amp;/g, '&')+"?oci="+category.ID
            }else {
                return (category.custom.alternativeUrl.toString()).replace(/&amp;/g, '&')+"&oci="+category.ID
            }
        }
        else {
            return (category.custom.alternativeUrl.toString()).replace(/&amp;/g, '&')
        }
        
    }else {
        return URLUtils.url('Search-Show', 'cgid', category.getID()).toString();
    }

}

/**
 * Converts a given category from dw.catalog.Category to plain object
 * @param {dw.catalog.Category} category - A single category
 * @returns {Object} plain object that represents a category
 */
function categoryToObject(category) {
    if (!category.custom || !category.custom.showInMenu || !category.onlineFlag) {
        return null;
    }
    
    var showBrandHeaderNav = false;
    if(category.custom && 'showBrandHeaderNav' in category.custom && category.custom.showBrandHeaderNav) {
        showBrandHeaderNav = true;
    }
    
    var brandSortValue = '';
    if(category.custom && 'brandSortValue' in category.custom) {
        brandSortValue = category.custom.brandSortValue;
    }

    var subCategoryCountForMenu = 999;
    if(category.custom && 'subCategoryCountForMenu' in category.custom) {
        subCategoryCountForMenu = category.custom.subCategoryCountForMenu;
    }
    
    var result = {
        name: category.getDisplayName(),
        displayName: category.getDisplayName(),
        url: getCategoryUrl(category),
        id: category.ID,
        showBrandHeaderNav: showBrandHeaderNav,
        image: category.image,
        thumbnail: category.thumbnail,
        custom: category.custom,
        brandSortValue:brandSortValue
    };
    var subCategories = category.getSubCategories() ?
            category.getSubCategories() : null;

    if (subCategories) {
        var index = 0;
        collections.forEach(subCategories, function (subcategory) {
            if(index<subCategoryCountForMenu)
            {
                var converted = null;
                // if (subcategory.hasOnlineProducts() || subcategory.hasOnlineSubCategories()) {
                    converted = categoryToObject(subcategory);
                // }
                if (converted) {
                    if (!result.subCategories) {
                        result.subCategories = [];
                    }
                    result.subCategories.push(converted);
                    index=index+1;
                }
            }
        });
        if (result.subCategories) {
            result.complexSubCategories = result.subCategories.some(function (item) {
                return !!item.subCategories;
            });

            var doNotShowViewAll = false;
            if(category.custom && 'doNotShowViewAll' in category.custom) {
                doNotShowViewAll = category.custom.doNotShowViewAll;
            }
            if(result.subCategories.length > 1 && !doNotShowViewAll)
            {
                var Resource = require('dw/web/Resource');
                var viewAll = {
                    name: Resource.msg('label.view.all', 'common', null),
                    displayName: Resource.msg('label.view.all', 'common', null),
                    url: getCategoryUrl(category),
                    id: category.ID,
                    showBrandHeaderNav: showBrandHeaderNav,
                    image: category.image,
                    thumbnail: category.thumbnail,
                    brandSortValue:brandSortValue
                };
                result.subCategories.push(viewAll);
            }
        }
    }
    return result;
}


/**
 * Represents a single category with all of it's children
 * @param {dw.util.ArrayList<dw.catalog.Category>} items - Top level categories
 * @constructor
 */
function categories(items, skipCategoryChecks) {
    this.categories = [];
    if(skipCategoryChecks && skipCategoryChecks === true){
        collections.forEach(items, function (item) {
            this.categories.push(categoryToObject(item));
        }, this);
    } else {
        collections.forEach(items, function (item) {
            if (item.custom && item.custom.showInMenu &&
                (item.hasOnlineProducts() || item.hasOnlineSubCategories())) {
                this.categories.push(categoryToObject(item));
            }
        }, this);
    }
}

module.exports = categories;
