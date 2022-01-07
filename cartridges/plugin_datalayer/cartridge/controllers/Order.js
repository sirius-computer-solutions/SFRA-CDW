'use strict';

var server = require('server');
server.extend(module.superModule);

server.prepend(
    'Confirm',
    function (req, res, next) {
    
    var OrderMgr = require('dw/order/OrderMgr');
    var order = OrderMgr.getOrder(req.querystring.ID);
    if(order){
        var datalayer = require('*/cartridge/scripts/datalayer.js');
        datalayer.populate(datalayer.CONTEXT.CONFIRMATION, req, order);
    }
    next();
});

module.exports = server.exports();
