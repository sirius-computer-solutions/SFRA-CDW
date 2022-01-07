var server = require('server');
server.extend(module.superModule);


server.append('Show', function (req, res, next) {
    
    /** Logic to handle the page desiger extra values */
    if(!empty(res.renderings)) {
        var pageName = res.renderings[0].page;
    }
    //if page name is not set at rendering, pull it from content
    if(!pageName) {
        var resViewData = res.viewData;
        pageName = resViewData.content?resViewData.content.ID:"";
    }

    var datalayer = require('*/cartridge/scripts/datalayer.js');
    datalayer.populate(datalayer.CONTEXT.STATIC, req, pageName);

    var datalayerView = datalayer.getDatalayerView();
    res.setViewData({
        datalayer: JSON.stringify(datalayerView[0])
    });
    

    next();
});

module.exports = server.exports();
