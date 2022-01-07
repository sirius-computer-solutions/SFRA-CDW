'use strict';

var collections = require('*/cartridge/scripts/util/collections');

/**
 * Retrieves attribute refinement value model
 *
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition for which we wish to retrieve refinement values for
 * @return {Object} - Attribute refinement value model module
 */
function getAttributeRefinementValueModel(refinementDefinition) {
    if (refinementDefinition.priceRefinement) {
        return require('*/cartridge/models/search/attributeRefinementValue/price');
    } else if (refinementDefinition.attributeID === 'refinementColor') {
        return require('*/cartridge/models/search/attributeRefinementValue/color');
    } else if (refinementDefinition.attributeID === 'size') {
        return require('*/cartridge/models/search/attributeRefinementValue/size');
    } else if (refinementDefinition.categoryRefinement) {
        return require('*/cartridge/models/search/attributeRefinementValue/category');
    } else if (refinementDefinition.promotionRefinement) {
        return require('*/cartridge/models/search/attributeRefinementValue/promotion');
    }

    return require('*/cartridge/models/search/attributeRefinementValue/boolean');
}

/**
 * Creates an array of category refinements for category search
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition for which we wish to retrieve refinement values for
 * @param {CategoryAttributeValue} Model - model of the category class
 * @return {Array} - List of categories
 */
function createCategorySearchRefinement(productSearch, refinementDefinition, refinementValues, oci, httpParams, Model) {
    var childCategory = null;
    var currentCategory = productSearch.category;
    var topCategory = null;
    var insertPoint = null;
    if (currentCategory.root || currentCategory.parent.root) {
        topCategory = new Model(productSearch, refinementDefinition, currentCategory, true, oci, httpParams);
        insertPoint = topCategory.subCategories;
    } else {
        topCategory = new Model(productSearch, refinementDefinition, currentCategory.parent,false, oci, httpParams);
        childCategory = new Model(productSearch, refinementDefinition, currentCategory, true, oci,httpParams);
        topCategory.subCategories.push(childCategory);
        insertPoint = topCategory.subCategories[0].subCategories;
    }
    collections.forEach(currentCategory.subCategories, function (category) {
        var addCategory = false;
        collections.forEach(refinementValues, function(refinementValue) {
            if(category.ID === refinementValue.value) {
                addCategory = true;
            }
        });
        if (category.online && addCategory) {
            insertPoint.push(new Model(productSearch, refinementDefinition, category, false, oci, httpParams));
        }
    });
    return [topCategory];
}

/**
 * Creates an array of category refinements for category search
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition for which we wish to retrieve refinement values for
 * @param {dw.util.Collection.<dw.catalog.ProductSearchRefinementValue>} refinementValues -
 *     Collection of refinement values
 * @param {CategoryAttributeValue} Model - model of the category class
 * @return {Array} - List of categories
 */
function createProductSearchRefinement(productSearch,
    refinementDefinition,
    refinementValues,
    oci,
    Model) {
    var catalogMgr = require('dw/catalog/CatalogMgr');
    var tree = [];
    var mappedList = {};
    collections.forEach(refinementValues, function (value) {
        var category = catalogMgr.getCategory(value.value);
        mappedList[value.value] = new Model(
            productSearch,
            refinementDefinition,
            category,
            productSearch.categoryID === value.value,            
            oci);
        mappedList[value.value].parent = category.parent.ID;
    });

    Object.keys(mappedList).forEach(function (key) {
        var category = mappedList[key];
        if (category.parent !== 'root') {
            if (mappedList[category.parent]) {
                mappedList[category.parent].subCategories.push(category);
            }
        } else {
            tree.push(category);
        }
    });
    return tree;
}

/**
 * Retrieve refinement values based on refinement type
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition for which we wish to retrieve refinement values for
 * @param {dw.util.Collection.<dw.catalog.ProductSearchRefinementValue>} refinementValues -
 *     Collection of refinement values
 * @return {Array} - List of refinement values
 */
function get(productSearch, refinementDefinition, refinementValues, oci, httpParams) {
    var Model = getAttributeRefinementValueModel(refinementDefinition);

    if (refinementDefinition.categoryRefinement) {
        if (productSearch.categorySearch) {
            // return only current category, direct children and direct parent
            return createCategorySearchRefinement(productSearch, refinementDefinition, refinementValues, oci, httpParams, Model);
        }
        return createProductSearchRefinement(
            productSearch,
            refinementDefinition,
            refinementValues,
            oci,
            Model);
    }

    return collections.map(refinementValues, function (value) {
        return new Model(productSearch, refinementDefinition, value, httpParams, oci);
    });
}

module.exports = {
    get: get
};
