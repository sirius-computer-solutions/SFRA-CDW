var Logger = require('dw/system/Logger').getLogger('cs.job.ImportWasPrice');
var File = require('dw/io/File');
var FileReader = require('dw/io/FileReader');
var XMLStreamConstants = require('dw/io/XMLStreamConstants');
var XMLStreamReader = require('dw/io/XMLStreamReader');
var Status = require('dw/system/Status');
var Pipeline = require('dw/system/Pipeline');

var FileHelper = require('~/cartridge/scripts/file/FileHelper');
var StepUtil = require('~/cartridge/scripts/util/StepUtil');
var StringUtils = require('dw/util/StringUtils');

var ProductMgr = require('dw/catalog/ProductMgr');
var Transaction = require('dw/system/Transaction');

var overallStatus = new Status(Status.OK, 'OK', 'Import successful');

var Calendar = require('dw/util/Calendar');
var FileWriter = require('dw/io/FileWriter');
var ArrayList = require("dw/util/ArrayList");

var startDate = new Calendar();
var endDate = new Calendar();


var count = 0;

var productsList = new ArrayList();
/**
 * Import wasPrice
 *
 * @param {array} args
 */
 var oneTimeInventoryFileGenerate = function oneTimeInventoryFileGenerate(args) {
   
    var warnMsg = [];

    if (StepUtil.isDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }

    var catalogMgr = require('dw/catalog/CatalogMgr');
    var siteRootCategory = catalogMgr.getCatalog("acme-catalog-m-en");
    var a= siteRootCategory;
    updateProductId(siteRootCategory.root, args.noOfProducts, args.priceBookName,args.fileName, args.filePath, args.objectName);
    

};



/**
 * Calls the 'ValidateActiveDataFile' pipelet to validate an import file.
 *
 *
 * @return {Object}
 */
 function updateProductId(category, noOfProducts, priceBookName,fileName, filePath, objectName) {

    
    if(!empty(category) && !empty(category.products) && category.products.length > 0) {
        var productsItr = category.products.iterator();
        while(productsItr.hasNext())
        {
            var product = productsItr.next();
            if(count < noOfProducts) {
                productsList.add(product);

                count++;
            } else {
                if(objectName == "Price") {
                    var priceXML = buildPriceBookXML(productsList, priceBookName);
                    writeFile(priceXML, fileName, filePath);
                    return;
                } else if (objectName == "Inventory") {
                    var inventoryXML = buildInventoryXML(productsList, priceBookName);
                    writeFile(inventoryXML, fileName, filePath);
                    return;

                }
                
                count = 0;
                productsList = new ArrayList();
            }
            

        }
    }
    

    var subCategories = category.getSubCategories() ? category.getSubCategories() : null;
    if (subCategories) {
        var subCategoriesItr = subCategories.iterator();
        while(subCategoriesItr.hasNext())
        {
            updateProductId(subCategoriesItr.next(),noOfProducts, priceBookName,fileName, filePath, objectName);
        }
    }


};

function buildPriceBookXML(wasPriceProducts, wasPriceBookName ){
    var priceBookXML = '<pricebooks xmlns="http://www.demandware.com/xml/impex/pricebook/2006-10-31"><pricebook><header pricebook-id="'+wasPriceBookName+ '"><currency>USD</currency><display-name xml:lang="x-default">Acme Was Prices</display-name><online-flag>true</online-flag></header><price-tables>';
    for(var i=0;i<wasPriceProducts.length;i++)
    {
        var productXML = buildWasPriceProduct(wasPriceProducts[i]);
        Logger.info('productXML='+productXML);
        priceBookXML = priceBookXML + productXML;
    }
    priceBookXML = priceBookXML+ '</price-tables></pricebook></pricebooks>';
    return new XML(priceBookXML);
 }


 function buildWasPriceProduct(product) {
    var priceModel = product.getPriceModel();
    var offerPrice = priceModel.price;
    var productId = product.ID ;
    if('custom' in product && 'upc' in product.custom) {
        productId = product.custom.upc;
    }
    

    var productPrice =  
                                '<price-table product-id="' + productId + '">' +
                                    '<amount quantity="' + priceModel.basePriceQuantity + '" >' + offerPrice + '</amount>'
                                + '</price-table>'
                           ;
    Logger.info('productPrice='+productPrice);
    return new XML(productPrice);
}



function buildInventoryXML(wasPriceProducts,priceBookName ){
    var priceBookXML = '<inventory xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.demandware.com/xml/impex/inventory/2007-05-31" xsi:noNamespaceSchemaLocation="Inventory.xsd"><inventory-list><header list-id="'+priceBookName+'"><default-instock>false</default-instock><description>'+priceBookName+'</description><use-bundle-inventory-only>false</use-bundle-inventory-only><on-order>false</on-order></header><records>';
    for(var i=0;i<wasPriceProducts.length;i++)
    {
        var productXML = buildInventoryProduct(wasPriceProducts[i]);
        Logger.info('productXML='+productXML);
        priceBookXML = priceBookXML + productXML;
    }
    priceBookXML = priceBookXML+ '</records></inventory-list></inventory>';
    return new XML(priceBookXML);
 }


 function buildInventoryProduct(product) {
    var inventoryRecord = product.getAvailabilityModel().getInventoryRecord();
    var productPrice = "";
    if(!empty(inventoryRecord)) {
        var productId = product.ID ;
        if('custom' in product && 'upc' in product.custom) {
            productId = product.custom.upc;
        }
    
        var invStatus = "none";
        if(inventoryRecord.preorderable) {
            invStatus = "preorder";
        } else if(inventoryRecord.backorderable) {
            invStatus = "backorder";
        }
    
        var instockDate = "";
        if(!empty(inventoryRecord.inStockDate)) {
            instockDate = inventoryRecord.inStockDate;
        }
    
        productPrice =  
                                    '<record product-id="' + productId + '">' +
                                        '<allocation>' + inventoryRecord.allocation.value + '</allocation>' +
                                        '<allocation-timestamp>2021-10-06T15:55:25.000-05:00</allocation-timestamp>' +
                                        '<perpetual>false</perpetual>'+
                                        '<preorder-backorder-handling>'+invStatus+'</preorder-backorder-handling>' +
                                        '<in-stock-date>'+instockDate+'</in-stock-date>' +
                                        '<ats>'+inventoryRecord.ATS.value+'</ats>'+
                                        '<on-order>0</on-order>'+
                                        '<turnover>0</turnover>'
    
                                    + '</record>'
                               ;
        Logger.info('productPrice='+productPrice);
    }

    return new XML(productPrice);
}
/**
 * @method fileAction
 *
 * @description Performs file action : Archive or Remove the file
 *
 * @param {dw.io.File} action     - Action to perform (REMOVE,KEEP,ARCHIVE)
 * @param {dw.io.File} filePath     - path of source file
 * @param {String} archivePath     - path to archive folder
 * */
 var writeFile = function (xmlString,fileName, filePath) {
    try {
        // create archive folder if it doesn't exist
        Logger.info('Writing File');
        Logger.info('filename= ' + filePath);
        var startCalendar = new Calendar();
        new File([File.IMPEX, filePath].join(File.SEPARATOR)).mkdirs();
        filename = fileName + startCalendar.getTime().getTime() + '.xml' ;
        Logger.info('filename= ' + filename);
        var newFile = new File([File.IMPEX, filePath, filename].join(File.SEPARATOR));
        Logger.info('newFile= ' + newFile);
        newFile.createNewFile();
        var fileWriter = new FileWriter(newFile);
        fileWriter.writeLine('<?xml version="1.0" encoding="UTF-8"?>');
        fileWriter.writeLine(xmlString);
        Logger.info('XML File content= ' + xmlString);
        Logger.info('File Complete');
        
    } catch (e) {
        Logger.info('[ImportWasPrice.js] priceFilePath() method crashed on line:{0}. ERROR: {1}', e.lineNumber, e.message);
        Logger.error('[ImportWasPrice.js] priceFilePath() method crashed on line:{0}. ERROR: {1}', e.lineNumber, e.message);
    }
    finally{
        
        fileWriter.close();
    }
};

exports.oneTimeInventoryFileGenerate = oneTimeInventoryFileGenerate;