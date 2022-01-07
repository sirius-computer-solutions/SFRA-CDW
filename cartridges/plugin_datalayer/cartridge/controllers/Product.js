'use strict';

var server = require('server');
server.extend(module.superModule);

server.append(
    'Show',
    function (req, res, next) {
        var ProductMgr = require('dw/catalog/ProductMgr');
        var datalayer = require('*/cartridge/scripts/datalayer.js');
        
        var resViewData = res.viewData;
        var apiProduct = ProductMgr.getProduct(req.querystring.pid);
        
        datalayer.populate(datalayer.CONTEXT.PRODUCT, req, resViewData.product, apiProduct);

        next();
    }
);

module.exports = server.exports();
