'use strict';

var server = require('server');
server.extend(module.superModule);

server.append(
    'Show',
    function (req, res, next) {

        var resViewData = res.viewData;
        var productSearch = resViewData.productSearch;
        var refinementIncludedH1 = resViewData.refinementIncludedH1;
        
        var datalayer = require('*/cartridge/scripts/datalayer.js');
        if(productSearch){
            datalayer.populate(datalayer.CONTEXT.CATEGORY, req, productSearch, refinementIncludedH1);
        } else {
            var queryString =  parseQuery(resViewData.queryString);
            // this is a page designer page, so get cgid from request and pass in
            var obj = {};
            var cat = {};
            // need to set category.id and category.name
            cat.id = queryString.cgid;
            cat.name = queryString.cgid;
            obj.category = cat;
            datalayer.populate(datalayer.CONTEXT.CATEGORY, req, obj, refinementIncludedH1);
        }
        
        

        /** Logic to handle the page desiger extra values */
        if(!empty(res.renderings)) {
            var datalayerView = datalayer.getDatalayerView();
            if(res.renderings[0].aspectAttributes) {
                res.renderings[0].aspectAttributes.datalayer = JSON.stringify(datalayerView[0]);
            }
        }

        next();
    }
);

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

//See git history for a more comprehensive example with product grid + sorting

module.exports = server.exports();
