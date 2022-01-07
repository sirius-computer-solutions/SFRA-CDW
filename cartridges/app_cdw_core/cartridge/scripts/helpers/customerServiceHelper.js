'use strict';



/**
 * Method to create the product qty JSON string based on entered form
 * @param {myForm} myForm
 * 
 * @returns {string} Product Qty JSON String
 */
 function getProductQtyObj(myForm) {
    var requestedModelNumbers = myForm.contactModel;
    var requestedQty = myForm.contactQty;

    var pdtsJSON = "";
    
    if(requestedModelNumbers && requestedModelNumbers != undefined) {
            pdtsJSON =  [];
            if(!requestedQty && requestedQty == undefined) {
                return { error: true };
            }
            for (var i = 0; i < requestedModelNumbers.length; i++) {
                var reqQty = requestedQty[i];
                var modelNumber = requestedModelNumbers[i];
                
                if(modelNumber && modelNumber != undefined && modelNumber != '') {
                    if(reqQty == '' || reqQty == undefined) {
                        reqQty = "1";
                    }
                    var product = {
                        modelNumber: requestedModelNumbers[i],
                        qty: reqQty
                    };
    
                    pdtsJSON.push(product);
                }
            }

    }
   
    return pdtsJSON;
}


/**
 * Method to check if any of the items entered is Heavy Equitment
 * @param {productsQtyObj} myForm
 * 
 * @returns {boolean} true/false
 */
 function checkHeavyEquipItem(productsQtyObj) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Site = require('dw/system/Site');
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');

    var heavyEquipmentPresent = false;
    
    for(var i=0; i<productsQtyObj.length; i++) {
        var productObj = productsQtyObj[i];
        var modelNumber = productObj.modelNumber;
        if(modelNumber && modelNumber != undefined) {
            var product = null;

            var searchModel = new ProductSearchModel();
            if(!empty(modelNumber)) {
                var regex = new RegExp(Site.getCurrent().getCustomPreferenceValue('ProductIDRegex') || '[+-*/]','g');
                if(modelNumber.match(regex))
                {
                    modelNumber = modelNumber.replace(regex, "_"); 
                }
            }

            searchModel.setSearchPhrase(modelNumber);
            searchModel.search();
            if(searchModel.count > 0 && searchModel.getProductSearchHits()!=null && searchModel.getProductSearchHits().hasNext()) {
                var tempHit = searchModel.getProductSearchHits().next();
                product = tempHit.product;
            }
            
            if(product != null && product.custom && "cdw-tools-heavy-equipment" in product.custom) {
                if (product.custom["cdw-tools-heavy-equipment"] == 'true' || product.custom["cdw-tools-heavy-equipment"] == 'Yes'
                        || product.custom["cdw-tools-heavy-equipment"] === true || product.custom["cdw-tools-heavy-equipment"] == 'Y') {
                    return true;
                }
                
            }
        }
    }
   
    return heavyEquipmentPresent;
}

module.exports = {
    getProductQtyObj: getProductQtyObj,
    checkHeavyEquipItem: checkHeavyEquipItem
};

