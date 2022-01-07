'use strict';

/* global empty */

var File = require('dw/io/File');
var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Pipelet = require('dw/system/Pipelet');
var StepUtil = require('~/cartridge/scripts/util/StepUtil');
var FileHelper = require('~/cartridge/scripts/file/FileHelper');
var Calendar = require('dw/util/Calendar');

/**
 * Add timestamp with file name
 * @param {string} fileName - simple file name
 * @returns {string} - file name with timestamp added in it
 * */
function addTimeStamp(fileName) {
    var extention = fileName.substring(fileName.lastIndexOf('.'), fileName.length);
    var simpleFileName = fileName.substring(0, fileName.lastIndexOf('.'));
    var now = new Date();
    var timeStamp = now.toISOString()
                    .replace(/-/g, '')
                    .replace('T', '')
                    .replace(/:/g, '')
                    .replace(/\./g, '')
                    .replace('Z', '');

    return simpleFileName + '-' + timeStamp + extention;
}

/**
 * Imports catalog files from IMPEX location.
 * @returns {string} - status
 */
 var importCatalog = function importCatalog(args) {
    var a = args;
    var error = false;


    if (StepUtil.isDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }

    var filesToImport = fetchFilesToImport(args);
    // No files found
    if (!filesToImport || filesToImport.length == 0) {
       return noFileFound(args.NoFileFoundStatus);
   } 
   filesToImport.forEach(function (filePath) {
        var file = new File(filePath);
        var fileToImport = args.SourceFolder+ File.SEPARATOR +file.name;

        var CATALOG_ARCHIVE_FLUX_DIR = File.IMPEX + File.SEPARATOR + 'src' + File.SEPARATOR + args.ArciveFolder;
        var archiveFolder = new File(CATALOG_ARCHIVE_FLUX_DIR);
        var ImportAttributeDefinitions = false;
        if(!empty(args.ImportAttributeDefinitions) && args.ImportAttributeDefinitions) {
            var ImportAttributeDefinitions = true;
        }
        
        var importcatalog = new Pipelet('ImportCatalog').execute({
            ImportMode: args.ImportMode,
            ImportFile: fileToImport,
            ImportConfiguration: { importAttributeDefinitions: ImportAttributeDefinitions,
                replaceCustomAttributes: false }
        });

        if (importcatalog.result === 1) {
            Logger.debug('ImportCatalog ' + file.name + ' imported successfully');
        } else {
            if (importcatalog.ErrorMsg) {
                Logger.error('Error Message:  ' + importcatalog.ErrorMsg);
            } else {
                Logger.error('ImportCatalog ' + file.name + ' import failed. Refer latest log in /webdav/Sites/Impex/log/');
            }
            error = true;
        }
        // file.renameTo(new File(archiveFolder.getFullPath() + File.SEPARATOR + addTimeStamp(file.name)));
        fileAction(args.AfterImportFileHandling, filePath, StepUtil.replacePathPlaceholders(args.ArciveFolder));
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
        filesToImport = FileHelper.getFiles('IMPEX' + File.SEPARATOR + 'src' + File.SEPARATOR + args.SourceFolder, args.FilePattern);
       
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
 var fileAction = function (action, filePath, archivePath) {
    try {
        var file = new File(filePath);
        if (action === 'Archive') {
            // create archive folder if it doesn't exist
            new File([File.IMPEX, archivePath].join(File.SEPARATOR)).mkdirs();
            var filename = file.name;
            var startCalendar = new Calendar();
            filename = filename.substring(0, filename.length-4) +'_' + startCalendar.getTime().getTime() + '.xml' ;
            var fileToMoveTo = new File([File.IMPEX, archivePath, filename].join(File.SEPARATOR));
            file.copyTo(fileToMoveTo);
            file.remove();
        } else if (action === 'REMOVE') { // remove source file
            file.remove();
        }
    } catch (e) {
        var a = e;
        Logger.error('[ImportWasPrice.js] fileAction() method crashed on line:{0}. ERROR: {1}', e.lineNumber, e.message);
    }
};

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

/** Exported functions **/
exports.importCatalog = importCatalog;