'use strict';

var server = require('server');
server.extend(module.superModule);

server.append(
    'Show',
    function (req, res, next) {
        var datalayer = require('*/cartridge/scripts/datalayer.js');
        datalayer.populate(datalayer.CONTEXT.HOME, req);
        
        var datalayerView = datalayer.getDatalayerView();
        res.setViewData({
            datalayer: JSON.stringify(datalayerView[0])
        });

        next();
    }
);

server.append(
    'ErrorNotFound',
    function (req, res, next) {
        var datalayer = require('*/cartridge/scripts/datalayer.js');
        datalayer.populate(datalayer.CONTEXT.HOME, req);
        next();
    }
);

module.exports = server.exports();
