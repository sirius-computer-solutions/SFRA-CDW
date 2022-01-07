
'use strict';

/**
 * @namespace Sitemap
 */

 var server = require('server');


/**
 * CustomerService-RQLanding : This endpoint is called to load request quote landing page
 * @name Base/Sitemap-Landing
 * @function
 * @memberof Sitemap
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
 server.get('Landing', server.middleware.https, function (req, res, next) {
    var CatalogMgr = require('dw/catalog/CatalogMgr');

    var categories = [];

    var catalog = CatalogMgr.getCatalog("cdw-sf-catalog-en");
    if(!empty(catalog)) {
        categories.push(catalog.root.subCategories);
    }
    
   res.render('rendering/sitemap/sitemapLanding', {
       categories: categories
   });

   next();
});


module.exports = server.exports();