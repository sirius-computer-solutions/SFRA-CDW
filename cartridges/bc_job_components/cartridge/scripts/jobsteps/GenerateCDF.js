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
 var generateCDF = function GenerateCDF(args) {
   
    var warnMsg = [];

    if (StepUtil.isDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }

    var catalogMgr = require('dw/catalog/CatalogMgr');
    var siteRootCategory = catalogMgr.getCatalog(args.catalogName);
    var a= siteRootCategory;
    var csvString ='Client ID,Category ID,Category Name,Parent Category ID';
    csvString = csvString + getCatgories(siteRootCategory.root, args.clientId);
    writeFile(csvString,args.fileName, args.filePath)
    

};



/**
 * Calls the 'ValidateActiveDataFile' pipelet to validate an import file.
 *
 *
 * @return {Object}
 */
 function getCatgories(category, clientId) {
    if(category.online == true)
    {
        var csvline = '\n'+ clientId + ',' + category.ID.replace(/[,*'"]/g,' ') + ',' + category.displayName.replace(/[,*'"]/g,' ') + ',' + (category.parent!=null? category.parent.ID.replace(/[,*'"]/g,' '):'');    
        if(!empty(category) && !empty(category.subCategories) && category.subCategories.length > 0) {
            var catItr = category.subCategories.iterator();
            while(catItr.hasNext())
            {
                csvline = csvline + getCatgories(catItr.next(),clientId);
            }
        }
        return csvline;
    }
    return '';
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
 var writeFile = function (csvString,fileName, filePath) {
    try {
        // create archive folder if it doesn't exist
        Logger.info('Writing File');
        Logger.info('filename= ' + filePath);
        var startCalendar = new Calendar();
        new File([File.IMPEX, filePath].join(File.SEPARATOR)).mkdirs();
        filename = fileName + startCalendar.getTime().getTime() + '.csv' ;
        Logger.info('filename= ' + filename);
        var newFile = new File([File.IMPEX, filePath, filename].join(File.SEPARATOR));
        Logger.info('newFile= ' + newFile);
        newFile.createNewFile();
        var fileWriter = new FileWriter(newFile);
        fileWriter.writeLine(csvString);
        Logger.info('CSV File content= ' + csvString);
        Logger.info('File Complete');
        
    } catch (e) {
        Logger.info('[ImportWasPrice.js] priceFilePath() method crashed on line:{0}. ERROR: {1}', e.lineNumber, e.message);
        Logger.error('[ImportWasPrice.js] priceFilePath() method crashed on line:{0}. ERROR: {1}', e.lineNumber, e.message);
    }
    finally{
        
        fileWriter.close();
    }
};

exports.generateCDF = generateCDF;