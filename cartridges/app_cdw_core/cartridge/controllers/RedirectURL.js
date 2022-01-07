
'use strict';

var server = require('server');
server.extend(module.superModule);
var Resource = require('dw/web/Resource');

'use strict';

/**
 * @namespace RedirectURL
 */

/**
 * RedirectURL-Start : The RedirectURL-Start endpoint handles URL redirects
 * @name Base/RedirectURL-Start
 * @function
 * @memberof RedirectURL
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.append('Start', function (req, res, next) {
    var URLRedirectMgr = require('dw/web/URLRedirectMgr');

    var redirect = URLRedirectMgr.redirect;
    var location = redirect ? redirect.location : null;
    if (!location) 
    {
        var computedMetaData = {
            title: Resource.msg('404.page.title', 'common', null),
            description: Resource.msg('404.page.description', 'common', null),
            keywords: Resource.msg('404.page.keywords', 'common', null),
            pageMetaTags: []
        };
    
        var pageGroup = {name: Resource.msg('404.page.pageGroup.name', 'common', null),
                        ID: Resource.msg('404.page.pageGroup.name', 'common', null),
                        content: Resource.msg('404.page.pageGroup.value', 'common', null)};
        var robots = {name: Resource.msg('404.page.robots.name', 'common', null),
                        ID: Resource.msg('404.page.robots.name', 'common', null),
                        content: Resource.msg('404.page.robots.value', 'cacommonrt', null)};                    
        computedMetaData.pageMetaTags.push(pageGroup);
        computedMetaData.pageMetaTags.push(robots);
    
        res.setViewData({
            CurrentPageMetaData: computedMetaData
        });
    } 
    next();
});

module.exports = server.exports();
