'use strict';

const BasketMgr = require('dw/order/BasketMgr');

var server = require('server');
server.extend(module.superModule);

server.append('Begin', function (req, res, next) {
    var basket = BasketMgr.getCurrentBasket();

    if(basket!=null){
        var datalayer = require('*/cartridge/scripts/datalayer.js');
        datalayer.populate(datalayer.CONTEXT.CHECKOUT, req, basket);
    }
    next();
});

module.exports = server.exports();
