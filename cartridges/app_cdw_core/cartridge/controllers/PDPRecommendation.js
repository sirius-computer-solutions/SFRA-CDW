'use strict';

var server = require('server');

  
server.get('GetObjects', function (req, res, next) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var queryString = req.querystring;
    var context = {recommendations:{}};
    if('pid' in queryString)
    {
        var origPrd = ProductMgr.getProduct(queryString.pid);
        context = {
            recommendations: origPrd.recommendations
        };
    }
    res.render('product/components/accessories', context);
    next();

});
module.exports = server.exports();
