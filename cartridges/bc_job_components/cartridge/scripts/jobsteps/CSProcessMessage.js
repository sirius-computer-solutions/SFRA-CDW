var Logger = require('dw/system/Logger').getLogger('cs.job.ImportWasPrice');
var File = require('dw/io/File');
var FileReader = require('dw/io/FileReader');
var XMLStreamConstants = require('dw/io/XMLStreamConstants');
var XMLStreamReader = require('dw/io/XMLStreamReader');
var Status = require('dw/system/Status');
var Pipeline = require('dw/system/Pipeline');
var Site = require('dw/system/Site');
var Calendar = require('dw/util/Calendar');
var FileWriter = require('dw/io/FileWriter');
var MessageConstants = require('./../util/messageConstants').getConstants();

var FileHelper = require('~/cartridge/scripts/file/FileHelper');
var StepUtil = require('~/cartridge/scripts/util/StepUtil');
var StringUtils = require('dw/util/StringUtils');

var ProductMgr = require('dw/catalog/ProductMgr');
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var UUIDUtils = require('dw/util/UUIDUtils');



var overallStatus = new Status(Status.OK, 'OK', 'Import successful');

/**
 * Process mesages from Messages Custom Object and generate files
 *
 * @param {array} args
 */
 var csProcessMessage = function csProcessMessage(args) {
   
    var warnMsg = [];
    var validXML = false;

    if (StepUtil.isDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }
    

    var messages = fetchMessages(args);
     // No files found
     if (!messages.count ||
            message == 0) {
        return noMessageFound('NO_MESSAGE_FOUND');
    } 

    while (messages.hasNext()) {
        var message = messages.next();

        if(message.custom.messageType == MessageConstants.RequestCatalogMessageType) {
            processRequestCatalog(message);
        } else if (message.custom.messageType == MessageConstants.RequestQuoteMessageType) {
            processRequestQuote(message);
        } else if (message.custom.messageType == MessageConstants.NewsletterMessageType) {
            processRequestNewsLetter(message);
        } else {
            return invalidMessageTypeFound('INVALID_MESSAGE_TYPE_FOUND');
        }
        Transaction.wrap(function () {
            message.custom.messageStatus = "1";
        });

        

    };
};

/**
 * Process Newsletter message and generate the flat file
 *
 * @param {String} status
 *
 * @return {dw.system.Status} Exit status for a job run
 */
 function processRequestNewsLetter(message) {

    var fileWriter = generateFile(MessageConstants.NewsletterFileNamePrefix,MessageConstants.MessageJSONExtension,message.custom.messageId);
    fileWriter.writeLine(message.custom.message);
    fileWriter.close();

    
}

/**
 * Process Request Quote message and generate the  XML file
 *
 * @param {String} status
 *
 * @return {dw.system.Status} Exit status for a job run
 */
 function processRequestQuote(message) {
    
    var fileWriter = generateFile(MessageConstants.RequestQuoteFileNamePrefix,MessageConstants.MessageJSONExtension,message.custom.messageId);
    fileWriter.writeLine(message.custom.message);
    fileWriter.close();
}

/**
 * Process Request Catalog message and generate the flat file
 *
 * @param {String} status
 *
 * @return {dw.system.Status} Exit status for a job run
 */
 function processRequestCatalog(message) {

    var fileWriter = generateFile(MessageConstants.RequestCatalogFileNamePrefix,MessageConstants.MessageJSONExtension,message.custom.messageId);
    fileWriter.writeLine(message.custom.message);
    fileWriter.close();
}





/**
 * Process Request Quote message and generate the  XML file
 *
 * @param {String} status
 *
 * @return {dw.system.Status} Exit status for a job run
 */
 function generateFile(messageType, fileExtension, uuID) {

    var cal = new Calendar();
    var stamp = StringUtils.formatCalendar(cal, 'yyyyMMddhhmmss');
    var sid = Site.current.ID;
    var path = messageType;
    var prefix = messageType;
    var filename = prefix + '_' + sid + '_' + uuID + fileExtension;
    var file;
    var fileWriter;

    var filepath = [File.IMPEX, path].join(File.SEPARATOR);
    var filepathFile = new File(filepath);

    filepathFile.mkdirs();
    file = new File(filepathFile, filename);
    fileWriter = new FileWriter(file);

    return fileWriter;
}

/**
 * Generate proper status message in case no messages found to process
 *
 * @param {String} status
 *
 * @return {dw.system.Status} Exit status for a job run
 */
 function invalidMessageTypeFound(status) {
    var msg = 'Invalid message type found to process.';

    switch (status) {
    case 'ERROR':
        return new Status(Status.ERROR, 'ERROR', msg);
    default:
        return new Status(Status.OK, 'INVALID_MESSAGE_TYPE_FOUND', msg);
    }
}

/**
 * Generate proper status message in case no messages found to process
 *
 * @param {String} status
 *
 * @return {dw.system.Status} Exit status for a job run
 */
 function noMessageFound(status) {
    var msg = 'No messages found to process.';

    switch (status) {
    case 'ERROR':
        return new Status(Status.ERROR, 'ERROR', msg);
    default:
        return new Status(Status.OK, 'NO_MESSAGES_FOUND', msg);
    }
}


/**
 * Fetches Message Records to process
 * 
 * @param {array} args 
 * @returns {array} messageToProcess
 */
function fetchMessages(args) {
    var messages
    try {
        if(args.MessageType == 'ALL') {
            //Get all the messages which are new
           messages = CustomObjectMgr.queryCustomObjects('Message', 'custom.messageStatus = {0}', 'custom.messageType desc', '0');
        } else {
            //Get message for given messasgeTyoe with status new
            messages = CustomObjectMgr.queryCustomObjects('Message', 'custom.messageStatus = {0} and custom.messageType = {1}', 'custom.messageType desc', '0', args.MessageType);
        }
        
       
    } catch (e) {
        overallStatus = new Status(Status.ERROR, 'ERROR', 'Error Fetching messages: ' + e + (e.stack ? e.stack : ''));
    }
    
    return messages;
}


exports.csProcessMessage = csProcessMessage;