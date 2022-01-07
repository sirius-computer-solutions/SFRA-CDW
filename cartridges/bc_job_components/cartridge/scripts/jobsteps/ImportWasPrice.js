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
var zeroWasPriceProducts = new ArrayList();
var wasPriceHotSmokingProducts = new ArrayList();
var wasPriceHotSmokingResetProducts = new ArrayList();

var startDate = new Calendar();
var endDate = new Calendar();

    

/**
 * Import wasPrice
 *
 * @param {array} args
 */
 var importWasPrice = function importWasPrice(args) {
   
    var warnMsg = [];
    var validXML = false;

    if (StepUtil.isDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }
    
    var filesToImport = fetchFilesToImport(args);
     // No files found
     if (!filesToImport || filesToImport.length == 0) {
        return noFileFound(args.NoFileFoundStatus);
    } 
    filesToImport.forEach(function (filePath) {
        zeroWasPriceProducts = new ArrayList();
        wasPriceHotSmokingProducts = new ArrayList();
        wasPriceHotSmokingResetProducts = new ArrayList();
        
        if(isValidXML(args, filePath)) {
            var xmlFile = new File(filePath);
            if(!xmlFile.exists()) {
                throw new Error(filePath + 'does not exist!');
            }

            try {
                //open the feed and start stream reading
                var fileReader = new FileReader(xmlFile, 'UTF-8');
                var xmlReader = new XMLStreamReader(fileReader);
                var wasPriceBookXML = null;
                var wasPriceCatalogXML = null;
                var wasPriceProducts = new ArrayList();
                var wasPriceProductIndex = 0;
                var wasPriceComparePercent = args.wasPricePercentThreshold;
                var wasPriceMarginPercent = args.wasPriceMarginPercent;
                var wasPriceCompareDollarValue = args.wasPriceDiffrenceThreshold;
                while(xmlReader.hasNext()) {
                    xmlReader.next();
                    if (xmlReader.getEventType() === XMLStreamConstants.START_ELEMENT) {
                        var priceBookXML = xmlReader.readXMLObject();
                        var ns = priceBookXML.namespace();
                        var priceList = priceBookXML.ns::pricebook.ns::['price-tables'].ns::['price-table'];
                        var wasPriceProduct = [];

                        if(priceList && priceList.length() > 0) {
                            for(var i = 0; i < priceList.length(); i++) {
                                var item = priceList[i];
                                
                                var productId = item.attribute('product-id');
                                var salePrice = item.ns::amount.toString();
                                Logger.info('salePrice ::::::'+salePrice);

                                var product = productId ? ProductMgr.getProduct(productId) : null;
                                if(product) {
                                    var priceModel = product.getPriceModel();
                                    var offerPrice = priceModel.price;
                                    Logger.info('product ::::::'+product.ID);
                                    Logger.info('pricePerUnit ::::::'+priceModel.pricePerUnit);
                                    Logger.info('offerPrice ::::::'+offerPrice);
                                    //Always add the product to this list for looping purpose
                                    
                                    if(salePrice > offerPrice) {
                                        wasPriceHotSmokingProducts.add(product);
                                        wasPriceProducts.add(product);
                                        zeroWasPriceProducts.add(product);
                                        
                                        wasPriceHotSmokingResetProducts.add(product);
                                        //Transaction.wrap(function () {
                                        //    product.custom.wasPrice = 0;
                                        // });
                                    } else if(salePrice < offerPrice) {
                                        var percentChange = (offerPrice - salePrice)*100/offerPrice;
                                        Logger.info('percentChange in the price::::::'+percentChange);
                                        if( (percentChange > wasPriceComparePercent) && (offerPrice - salePrice) > wasPriceCompareDollarValue) 
                                        {
                                            wasPriceHotSmokingProducts.add(product);
                                            wasPriceProducts.add(product);
                                            if(percentChange < wasPriceMarginPercent) {
                                                wasPriceHotSmokingResetProducts.add(product);
                                            }else {
                                                //DO NOTHING as this is the HotSmoking Item
                                            } 
                                        } else {
                                            wasPriceHotSmokingResetProducts.add(product);
                                        }
                                    } else {
                                        wasPriceHotSmokingResetProducts.add(product);
                                    }
                                }
                            }
                        }
                    }
                }
                xmlReader.close();
                fileReader.close();
                fileAction(args.FileAction, filePath, StepUtil.replacePathPlaceholders(args.ArchivePath));
                if(wasPriceProducts!=null && wasPriceProducts.size() >0)
                {
                    endDate.add(Calendar.DATE, args.wasPriceExpiryDays);
                    if(wasPriceBookXML == null) wasPriceBookXML = buildPriceBookXML(wasPriceProducts, args.WasPriceBookName);
                    Logger.info('WasPriceBookXML = '+wasPriceBookXML);
                    writeWasFile(wasPriceBookXML,filePath,args.WasPricePath,"_WasPrice_");
                }

                //Hotsmoking Deals Attributes
                if(wasPriceHotSmokingProducts!=null && wasPriceHotSmokingProducts.size() >0)
                {
                    if(wasPriceCatalogXML == null) wasPriceCatalogXML = buildCatalogXML(wasPriceHotSmokingProducts);
                    Logger.info('WasPriceBookXML = '+wasPriceCatalogXML);
                    writeWasFile(wasPriceCatalogXML,filePath,args.WasPriceCatalogPath,"_HotSmokin_");
                } 
                
            } catch (e) {
                var err = e;
                Logger.error('Error occurred while importing wasPrice at lineNumber ::: {0}. ERROR: {1}', e.lineNumber, e.message);
            }
            finally{
                xmlReader.close();
                fileReader.close();
            }
        }
    });
};

function buildPriceBookXML(wasPriceProducts, wasPriceBookName ){
    var priceBookXML = '<pricebooks xmlns="http://www.demandware.com/xml/impex/pricebook/2006-10-31"><pricebook><header pricebook-id="'+wasPriceBookName+ '"><currency>USD</currency><display-name xml:lang="x-default">cdw Was Prices</display-name><online-flag>true</online-flag></header><price-tables>';
    for(var i=0;i<wasPriceProducts.length;i++)
    {
        var productXML = buildWasPriceProduct(wasPriceProducts[i]);
        Logger.info('productXML='+productXML);
        priceBookXML = priceBookXML + productXML;
    }
    priceBookXML = priceBookXML+ '</price-tables></pricebook></pricebooks>';
    return new XML(priceBookXML);
 }

 function buildCatalogXML(wasPriceHotSmokingProducts){
    var catalogXML = '<catalog xsi:schemaLocation="http://www.demandware.com/xml/impex/catalog/2006-10-31 file:///C:/MyWork/catalogload/cdw-new/mfd/xsd/catalog.xsd" catalog-id="cdw-catalog-m-en" xmlns="http://www.demandware.com/xml/impex/catalog/2006-10-31" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
    for(var i=0;i<wasPriceHotSmokingProducts.length;i++)
    {
        var productXML = buildWasPriceCatalogAttribute(wasPriceHotSmokingProducts[i]);
        Logger.info('Catalog productXML='+productXML);
        catalogXML = catalogXML + productXML;
    }
    catalogXML = catalogXML+ '</catalog>';
    return new XML(catalogXML);
 } 


 function buildWasPriceCatalogAttribute(product) {
    var startDateTime = StringUtils.formatCalendar(startDate, 'YYYY-MM-dd');
    var customAttribute =  	'<product product-id="'+product.ID+'">'+
                                    '<custom-attributes>'+
                                        '<custom-attribute attribute-id="wasPriceCreationDate">'+
                                            '<value>'+startDateTime+'</value>'+
                                        '</custom-attribute>'+
                                        '<custom-attribute attribute-id="wasPriceMarginFlag">'+
                                            '<value>'+!wasPriceHotSmokingResetProducts.contains(product)+'</value>'+
                                        '</custom-attribute>'+
                                    '</custom-attributes>'+
                            '</product>'
                           ;
                           
    return new XML(customAttribute);
}

 function buildWasPriceProduct(product) {
    var priceModel = product.getPriceModel();
    var offerPrice = zeroWasPriceProducts.contains(product)? 0.0:priceModel.price;
    var productId = product.ID ;
    var endDateTime = StringUtils.formatCalendar(endDate, 'YYYY-MM-dd');
    var startDateTime = StringUtils.formatCalendar(startDate, 'YYYY-MM-dd');

    var productPrice =  
                                '<price-table product-id="' + productId + '">' +
                                    '<online-from>' + startDateTime + 'T00:00:00.000Z</online-from>' + 
                                    '<online-to>' + endDateTime + 'T00:00:00.000Z</online-to>' +
                                    '<amount quantity="' + priceModel.basePriceQuantity + '" >' + offerPrice + '</amount>'
                                + '</price-table>'
                           ;
    if(zeroWasPriceProducts.contains(product))
    {
        productPrice =  '<price-table product-id="' + productId + '" mode="delete-all">' +
                            '<amount quantity="' + priceModel.basePriceQuantity + '" >' + offerPrice + '</amount>'
                        +'</price-table>';
    }           
    Logger.info('productPrice='+productPrice);
    return new XML(productPrice);
}

/**
 * Generate proper status message in case no files were found
 *
 * @param {String} status
 *
 * @return {dw.system.Status} Exit status for a job run
 */
 function noFileFound(status) {
    var msg = 'No files found for import.';

    switch (status) {
    case 'ERROR':
        return new Status(Status.ERROR, 'ERROR', msg);
    default:
        return new Status(Status.OK, 'NO_FILE_FOUND', msg);
    }
}

/**
 * Calls the 'ValidateActiveDataFile' pipelet to validate an import file.
 *
 * @param {String} filePath The file path of the file to validate. It should be relative to '/IMPEX/src'.
 *
 * @return {Object}
 */
 function validateActiveDataFile(filePath) {
    if (empty(filePath)) {
        return;
    }

    return Pipeline.execute('ImportWrapper-ValidateActiveDataFile', {
        File: filePath
    });
}

/**
 * Calls the 'ValidateXMLFile' pipelet to validate an import file.
 *
 * @param {String} objectType The object type to validate
 * @param {String} filePath The file path of the file to validate. It should be relative to '/IMPEX/src'.
 *
 * @return {Object}
 */
 function validateXMLFile(objectType, filePath) {
    if (empty(objectType) || empty(filePath)) {
        return;
    }

    var schemaFile = OBJECT_TYPE_TO_SCHEMA_MAPPING[objectType];

    // If the schema is not registered as known schema, skip this step
    if (empty(schemaFile)) {
        return;
    }

    return Pipeline.execute('ImportWrapper-ValidateXMLFile', {
        File   : filePath,
        Schema : schemaFile
    });
}

/**
 * Fetches files to be uploaded 
 * 
 * @param {array} args 
 * @returns {array} filesToImport
 */
function fetchFilesToImport(args) {
    var filesToImport;
    try {
        // Check source directory
        filesToImport = FileHelper.getFiles('IMPEX' + File.SEPARATOR + args.SourceFolder, args.FilePattern);
       
    } catch (e) {
        overallStatus = new Status(Status.ERROR, 'ERROR', 'Error loading files: ' + e + (e.stack ? e.stack : ''));
    }
    
    return filesToImport;
}

/**
 * Validates the XML File
 * 
 * @param {array} args 
 * @param {String} filePath 
 * @returns {Boolean}
 */
function isValidXML(args, filePath) {
    var warnMsg = [];
    var validXML = false;

    if (args.OnError == 'ABORT' && overallStatus.getCode() == 'WARNING') {
        // Skip all files if configured an previous errors occurred
        Logger.info('Skipping ' + filePath);
        return;
    }
    // Call the validation function before importing the file
    if (!empty(args.objectType)) {
        var validationResult;

        // As the active data files have a particular structure (.csv instead of .xml), use a different validation method
        if (args.objectType === 'activedata') {
            validationResult = validateActiveDataFile(relativePath);
        } else {
            validationResult = validateXMLFile(args.objectType, relativePath);
        }

        if (!empty(validationResult) && validationResult.Status.getStatus() == Status.OK) {
            validXML = true;
        } else {
            warnMsg.push(filePath);
            Logger.error('...Error while validating file: ' + filePath + '. See log file "' + validationResult.LogFileName + '" for more details.');
        }
    } else {
        validXML = true;
    }

    return validXML;
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
 var fileAction = function (action, filePath, archivePath) {
    try {
        var file = new File(filePath);
        if (action === 'ARCHIVE') {
            // create archive folder if it doesn't exist
            new File([File.IMPEX, archivePath].join(File.SEPARATOR)).mkdirs();
            var filename = file.name;
            var startCalendar = new Calendar();
            filename = filename.substring(0, filename.length-4) +'_' + startCalendar.getTime().getTime() + '.xml' ;
            var fileToMoveTo = new File([File.IMPEX, archivePath, filename].join(File.SEPARATOR));
            file.copyTo(fileToMoveTo);
        } else if (action === 'REMOVE') { // remove source file
            file.remove();
        }
    } catch (e) {
        Logger.error('[ImportWasPrice.js] fileAction() method crashed on line:{0}. ERROR: {1}', e.lineNumber, e.message);
    }
};

/**
 * @method fileAction
 *
 * @description Performs file action : Archive or Remove the file
 *
 * @param {dw.io.File} action     - Action to perform (REMOVE,KEEP,ARCHIVE)
 * @param {dw.io.File} filePath     - path of source file
 * @param {String} archivePath     - path to archive folder
 * */
 var writeWasFile = function (xmlString,currentfileName, priceFilePath, fileNamePattern) {
    try {
        // create archive folder if it doesn't exist
        Logger.info('Writing File');
        var filename = currentfileName;
        Logger.info('filename= ' + filename);
        var startCalendar = new Calendar();
        new File([File.IMPEX, priceFilePath].join(File.SEPARATOR)).mkdirs();
        var lastIndex = currentfileName.lastIndexOf('/');
        filename = currentfileName.substring(lastIndex+1, filename.length-4) +fileNamePattern+ startCalendar.getTime().getTime() + '.xml' ;
        Logger.info('filename= ' + filename);
        var newFile = new File([File.IMPEX, priceFilePath, filename].join(File.SEPARATOR));
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

exports.importWasPrice = importWasPrice;