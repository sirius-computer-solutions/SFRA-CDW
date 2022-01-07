'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('Find', function (req, res, next) {

    var datalayer = require('*/cartridge/scripts/datalayer.js');
    datalayer.populate(datalayer.CONTEXT.LOCATIONS, req);

    next();
});

module.exports = server.exports();
