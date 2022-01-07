'use strict';

var SortedMap = require("dw/util/SortedMap");

var PropertyComparator = require("dw/util/PropertyComparator");
var categoryComparator = new PropertyComparator("displayName", true);

/**
 * This method returns all Brands set up as subcategories
 * in the given categoryId. The Brands are sorted in an 
 * alphabetical order and returned as Map
 * @param categoryId 
 * @returns sortedCategories
 */
function getAllBrandCategories(categoryId){

    var sortedCategories = new SortedMap();

    // fetch the root category of All Brands
    var brandsRootCategory = getCategory(categoryId);

    // find all subcategories and sort them Alphabetically
    if(brandsRootCategory.hasOnlineSubCategories()){
        var allBrandCategories = brandsRootCategory.getOnlineSubCategories();
        sortedCategories = getSortedCategoriesMap(allBrandCategories);
    }

    return sortedCategories;
}

/**
 * This method returns category object for a given categoryId
 * @param categoryId 
 * @returns category object
 */
function getCategory(categoryId){
    var catalogMgr = require('dw/catalog/CatalogMgr');
    var category = catalogMgr.getCategory(categoryId);
    return category;
}

/**
 * This method sorts the given list of categories in 
 * an Alphabetical order and returns the sorted categories 
 * as a Map with the Alphabet as the key
 * @param categories 
 * @returns sortedCategoriesMap
 */
function getSortedCategoriesMap(categories){

    var collections = require('*/cartridge/scripts/util/collections');
    var sortedCategoriesMap = new SortedMap();
   
    // iterate through all the Brands (Brand Categories)
    collections.forEach(categories, function (category) {
        updateSortedMap(category,sortedCategoriesMap);
        if(category.hasOnlineSubCategories()){

            collections.forEach(category.subCategories, function (subCategory) {
                updateSortedMap(subCategory,sortedCategoriesMap);
            });
            
        }
        
    },this);

    return sortedCategoriesMap;  
}


/**
 * This method returns all alphabets associated
 * with the starting letter of Brands
 * @param sortedCategoriesMap 
 * @returns 
 */
 function updateSortedMap(category, sortedCategoriesMap){

    var alphabets = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    var SortedSet = require('dw/util/SortedSet');

    if(isNotNull(category) && isNotNull(category.getDisplayName()) && 
        (!'dontShowUnderAllBrands' in category.custom || !category.custom.dontShowUnderAllBrands)) {

        var categoryAddedToMap = false;
        var catNamefirstLetter = category.getDisplayName().trim().charAt(0).toUpperCase();
        
        // for every Brand, iterate through the 26 Alphabets
        // and assign the Brand to the Alphabet Map
        for(var index=0;index<alphabets.length;index++){               
            var alphabet = alphabets[index];
            if(catNamefirstLetter == alphabet){
                var categoriesSet = sortedCategoriesMap.get(alphabet);
                if(categoriesSet==null){
                    categoriesSet = new SortedSet(categoryComparator);  
                } 
                                        
                categoriesSet.add(category);
                sortedCategoriesMap.put(alphabet,categoriesSet);
                categoryAddedToMap = true;
            }
        }

        // if the Brand name starting letter does not belong
        // to any of the 26 Alphabets, assign it to #
        if(!categoryAddedToMap){
            var categoriesSet = sortedCategoriesMap.get("#");
            if(categoriesSet==null){
                categoriesSet = new SortedSet(categoryComparator);  
            } 

            categoriesSet.add(category);
            sortedCategoriesMap.put("#",categoriesSet);
        } 

    }  
}

/**
 * This method returns all alphabets associated
 * with the starting letter of Brands
 * @param sortedCategoriesMap 
 * @returns 
 */
function getCategoryAlphabets(sortedCategoriesMap){
    var ArrayList = require("dw/util/ArrayList");
    var categoryAlphabets = new ArrayList();
    categoryAlphabets.addAll(sortedCategoriesMap.keySet());   
    return categoryAlphabets;
}

/**
 * This method checks for Not NULL
 * @param value 
 * @returns boolean true/false
 */
function isNotNull(value){
    if(value!=undefined && value!=null){
        return true;
    } else {
        return false;
    }
}

/**
 * This method check the query params for preferencs for Search and generate the H1String for category page when filters are configured
 * @param req 
 * @returns String 
 */
 function getGeneratedH1String(queryString){
    var Site = require('dw/system/Site');
    var refinenementStringArr = Site.current.getCustomPreferenceValue('refinementKeyToAppendH1');
    var h1String = "";
    
    if(!empty(refinenementStringArr)){
        for(var i=0;i<refinenementStringArr.length;i++) {
            if(queryString.preferences && refinenementStringArr[i] in queryString.preferences) {
                var refinementValue = queryString.preferences[refinenementStringArr[i]];
                var refineValuesArray = refinementValue.split("|");
                for(var j=0;j<refineValuesArray.length;j++){
                  h1String = h1String+" "+refineValuesArray[j];
                }
            }
        }
    }

    return h1String;
}

/**
 * This method check the query params for preferencs for Search and generate the H1String for category page when filters are configured
 * @param req 
 * @returns String 
 */
 function getGeneratedKeyWithFilters(queryString){
    var Site = require('dw/system/Site');
    var refinenementStringArr = Site.current.getCustomPreferenceValue('refinementKeyToAppendH1');
    var h1String = "";
    
    if(!empty(refinenementStringArr)){
        for(var i=0;i<refinenementStringArr.length;i++) {
            if(queryString.preferences && refinenementStringArr[i] in queryString.preferences) {
                var refinementValue = queryString.preferences[refinenementStringArr[i]];
                var refineValuesArray = refinementValue.split("|");
                for(var j=0;j<refineValuesArray.length;j++){
                if(!empty(h1String)) {
                    h1String = h1String+"-"+refineValuesArray[j].toLowerCase();;
                }else {
                    h1String = refineValuesArray[j].toLowerCase();
                }
                
                }
            }
        }
    }

    return h1String;
}

/**
 * This method check the query params for preferencs for Search and generate the H1String for category page when filters are configured
 * @param req 
 * @returns String 
 */
 function getGeneratedRefinedKey(queryString){
    var Site = require('dw/system/Site');
    var refinenementStringArr = Site.current.getCustomPreferenceValue('refinementKeyUpdateBannerImage');
    var refinedKey = "";
    
    if(!empty(refinenementStringArr)){
        for(var i=0;i<refinenementStringArr.length;i++) {
            if(queryString.preferences && refinenementStringArr[i] in queryString.preferences) {
                var refinementValue = queryString.preferences[refinenementStringArr[i]];
                var refineValuesArray = refinementValue.split("|");
                for(var j=0;j<refineValuesArray.length;j++){
                    if(!empty(refinedKey)) {
                        refinedKey = refinedKey+"-"+refineValuesArray[j].toLowerCase();
                    }else {
                        refinedKey = refineValuesArray[j].toLowerCase();
                    }
                    
                }
            }
        }
    }

    return refinedKey;
}

function camelize(str) {
   // Split the string at all space characters
   return str.split(' ')
      // Convert first char to upper case for each word
      .map(a => a[0].toUpperCase() + a.substring(1))
      // Join all the strings back together
      .join(" ")
  }


function appendURLString(urlString, queryStringToAppend) {
    var returnString = "";
    if(!empty(urlString) && !empty(queryStringToAppend)) {
        if(urlString.toString().indexOf("?"))
        if(urlString.toString().indexOf('?') == -1) {
            returnString = urlString + "?"+queryStringToAppend;
        }else {
            returnString = urlString + "&"+queryStringToAppend;
        }        
    } 

    return returnString;

}  
  
module.exports = {
    getAllBrandCategories: getAllBrandCategories,
    getCategoryAlphabets: getCategoryAlphabets,
    getGeneratedH1String: getGeneratedH1String,
    getGeneratedRefinedKey: getGeneratedRefinedKey,
    getGeneratedKeyWithFilters: getGeneratedKeyWithFilters,
    appendURLString: appendURLString
};