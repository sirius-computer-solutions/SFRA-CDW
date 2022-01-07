'use strict';

const page = module.superModule;
const server = require('server');

const {
    validatePaypalOnAccount
} = require('../scripts/paypal/middleware');

const {
    billingAgreementEnabled
} = require('../config/paypalPreferences');

const BillingAgreementModel = require('../models/billingAgreement');

const {
    createAccountSDKUrl,
    getUrls
} = require('../scripts/paypal/paypalUtils');

server.extend(page);

server.append('Show', validatePaypalOnAccount, function (_, res, next) {
    var billingAgreementModel = new BillingAgreementModel();

    var savedBA = billingAgreementModel.getBillingAgreements(true);

    res.setViewData({
        paypal: {
            savedBA: savedBA,
            billingAgreementEnabled: billingAgreementEnabled,
            isBaLimitReached: billingAgreementModel.isBaLimitReached(),
            sdkUrl: createAccountSDKUrl(),
            paypalUrls: JSON.stringify(getUrls())
        }
    });
    next();
});

module.exports = server.exports();
