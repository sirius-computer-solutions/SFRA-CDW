var Logger = require('dw/system/Logger').getLogger('cs.job.s2KOrderExport');
var File = require('dw/io/File');
var FileReader = require('dw/io/FileReader');
var XMLStreamReader = require('dw/io/XMLStreamReader');
var XMLStreamConstants = require('dw/io/XMLStreamConstants');
var Status = require('dw/system/Status');
var Calendar = require('dw/util/Calendar');
var FileWriter = require('dw/io/FileWriter');

var FileHelper = require('~/cartridge/scripts/file/FileHelper');
var StepUtil = require('~/cartridge/scripts/util/StepUtil');

var s2kConstants = require('../../../../app_cdw_core/cartridge/scripts/utils/s2kServiceConstants').getConstants();
var s2kRestService = require('../../../../app_cdw_core/cartridge/scripts/services/s2kRestService');

var overallStatus = new Status(Status.OK, 'OK', 'Import successful');

var s2KOrderExport = function s2KOrderExport(args) {

    var warnMsg = [];
    var validXML = false;

    var filesToImport = fetchFilesToImport(args);

    if (!filesToImport || filesToImport.code == 'NO_FILE_FOUND' || filesToImport.error) {
        return noFileFound(args.NoFileFoundStatus);
    } 

    filesToImport.forEach(function (filePath) {
        var retryAttempt = 0;
        var s2kOrderResponse = s2kCall(filePath, args);
        while (retryAttempt == 0 && !isValidResponse(s2kOrderResponse)) {
            retryAttempt = retryAttempt+1;
            s2kOrderResponse = s2kCall(filePath, args);
        } 

        if(retryAttempt > 0 && !isValidResponse(s2kOrderResponse)) {
            Logger.error('Error occurred while submitting order xml to S2K.');
            createResponseXML(filePath, args, s2kOrderResponse, true);
        } else {
            fileAction(args.FileAction, filePath, StepUtil.replacePathPlaceholders(args.ArchivePath));
            createResponseXML(filePath, args, s2kOrderResponse, false);
        }
    });
};

/**
 * 
 * @param {String} filePath 
 * @param {array} args 
 * @param {xml} s2kOrderResponse 
 */
function createResponseXML(filePath, args, s2kOrderResponse, error) {
    try {
        var filename = filePath;
        var lastIndex = filePath.lastIndexOf('/');
        if(error) {
            filename = filePath.substring(lastIndex+1, filename.length-4) +'-s2kError.xml' ;
            var newFile = new File([File.IMPEX, StepUtil.replacePathPlaceholders(args.ArchivePath), filename].join(File.SEPARATOR));
        } else {
            filename = filePath.substring(lastIndex+1, filename.length-4) +'-s2kResponse.xml' ;
            var newFile = new File([File.IMPEX, StepUtil.replacePathPlaceholders(args.ArchivePath), filename].join(File.SEPARATOR));
        }   
        newFile.createNewFile();
        var fileWriter = new FileWriter(newFile);
        // fileWriter.writeLine('<?xml version="1.0" encoding="UTF-8"?>');
        if(s2kOrderResponse != null) {
            fileWriter.writeLine(s2kOrderResponse);
        }
    } catch (e) {
        Logger.error('[S2KOrderExport.js] s2KOrderExport() method crashed on line:{0}. ERROR: {1}', e.lineNumber, e.message);
    }
    finally{
        fileWriter.close();
    }
}

/**
 * Submits the order XML to S2K API
 * 
 * @param {String} filePath 
 * @param {array} args 
 */
function s2kCall(filePath, args) {
    var xmlFile = new File(filePath);
    if(!xmlFile.exists()) {
        throw new Error(filePath + 'does not exist!');
    }

    var s2kOrderResponse = null;
    try {

        var fileReader = new FileReader(xmlFile);
        var requestBody = fileReader.getString();
        requestBody = requestBody.replace(/[\r\n]+/g,"");

        var data = { path : s2kConstants.SUBMIT_ORDER_API_ACTION, 
                    method : s2kConstants.HTTP_METHOD_POST, 
                    body : requestBody }
                    
        s2kOrderResponse = s2kRestService.call(data);
        fileReader.close();

    } catch (e) {
        var err = e;
        Logger.error('Error occurred while submitting order xml to S2K at lineNumber ::: {0}. ERROR: {1}', e.lineNumber, e.message);
    }
    finally{
        fileReader.close();
    }
    return s2kOrderResponse;
}

/**
 * Validates the response received from S2K
 * 
 * @param {xml} s2kOrderResponse 
 */
function isValidResponse(s2kOrderResponse) {
    if(s2kOrderResponse != null && s2kOrderResponse.includes('<OrdersResponseList>')) {
        return true;
    } else {
        return false;
    }
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
        filesToImport = FileHelper.getFiles(args.SourceFolder, args.FilePattern);

        if (!filesToImport || filesToImport.length == 0) {
            return noFileFound(args.NoFileFoundStatus);
        } 
       
    } catch (e) {
        overallStatus = new Status(Status.ERROR, 'ERROR', 'Error loading files: ' + e + (e.stack ? e.stack : ''));
    }
    
    return filesToImport;
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
 function fileAction(action, filePath, archivePath) {
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
            //Remove now
            file.remove();
        } else if (action === 'REMOVE') { 
            // remove source file
            file.remove();
        }
    } catch (e) {
        Logger.error('[S2KOrderExport.js] fileAction() method crashed on line:{0}. ERROR: {1}', e.lineNumber, e.message);
    }
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

exports.s2KOrderExport = s2KOrderExport;