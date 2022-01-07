'use strict';

var server = require('server');
server.extend(module.superModule);

server.append(
    'SubmitRegistration',
    function (req, res, next) {
        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var datalayer = require('*/cartridge/scripts/datalayer.js');
            // getting variables for the BeforeComplete function
            var registrationForm = res.getViewData(); // eslint-disable-line

            if (registrationForm.validForm) {
                datalayer.populate(datalayer.CONTEXT.ACCOUNT, req, "Registration");
            }
        });
        return next();
    }
);

server.append(
    'Show',
    function (req, res, next) {
        var datalayer = require('*/cartridge/scripts/datalayer.js');
        datalayer.populate(datalayer.CONTEXT.ACCOUNT, req, "account");
        next();
    }
);

server.append(
    'EditProfile',
    function (req, res, next) {
        var datalayer = require('*/cartridge/scripts/datalayer.js');
        datalayer.populate(datalayer.CONTEXT.ACCOUNT, req, "account");
        next();
    }
);

module.exports = server.exports();
