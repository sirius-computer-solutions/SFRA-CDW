'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('CULanding', function (req, res, next) {

    var datalayer = require('*/cartridge/scripts/datalayer.js');
    datalayer.populate(datalayer.CONTEXT.CONTACTUS, req);

    next();
});


server.append('RCLanding', function (req, res, next) {

    var datalayer = require('*/cartridge/scripts/datalayer.js');
    datalayer.populate(datalayer.CONTEXT.REQUESTCATALOG, req);

    next();
});


server.append('RQLanding', function (req, res, next) {

    var datalayer = require('*/cartridge/scripts/datalayer.js');
    datalayer.populate(datalayer.CONTEXT.REQUESTQUOTE, req);

    next();
});


module.exports = server.exports();
