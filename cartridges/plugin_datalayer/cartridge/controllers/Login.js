var server = require('server');
server.extend(module.superModule);

server.append(
    'Show',
    function (req, res, next) {
        var datalayer = require('*/cartridge/scripts/datalayer.js');
        datalayer.populate(datalayer.CONTEXT.ACCOUNT, req, "login");
        next();
    }
);


module.exports = server.exports();
