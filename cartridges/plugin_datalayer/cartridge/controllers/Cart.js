'use strict';

const BasketMgr = require('dw/order/BasketMgr');

var server = require('server');
server.extend(module.superModule);

server.append('Show', function (req, res, next) {
    var basket = BasketMgr.getCurrentBasket();

    var datalayer = require('*/cartridge/scripts/datalayer.js');
    datalayer.populate(datalayer.CONTEXT.CART, req, basket);

    next();
});

server.append('MiniCart', function (req, res, next) {
    var basket = BasketMgr.getCurrentBasket();

    if(basket!=null){
        var datalayer = require('*/cartridge/scripts/datalayer.js');
        datalayer.populate(datalayer.CONTEXT.CART, req, basket);
    }
    next();
});

server.append('MiniCartShow', function (req, res, next) {
    var basket = BasketMgr.getCurrentBasket();

    if(basket!=null){
        var datalayer = require('*/cartridge/scripts/datalayer.js');
        datalayer.populate(datalayer.CONTEXT.CART, req, basket);
    }
    
    next();
});

module.exports = server.exports();
