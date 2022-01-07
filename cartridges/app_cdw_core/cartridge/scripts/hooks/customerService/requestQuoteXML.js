'use strict';

function sendRequestQuoteXml(contactUsDetails, templateContext) {
    var HashMap = require('dw/util/HashMap');
    var Mail = require('dw/net/Mail');
    var Site = require('dw/system/Site');
    var Template = require('dw/util/Template');

    var context = new HashMap();
    var email = new Mail();
    var template = new Template('customerService/contactUsEmail');

    email.addTo('raj.ekambaram@siriuscom.com');
    email.addBcc(Site.current.getCustomPreferenceValue('contactUsEmail') || 'raj.ekambaram@siriuscom.com')
    email.setFrom(Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com');
    email.setSubject('Testing the contact us email::'+contactUsDetails.firstName);
    email.setContent(template.render(context).text, 'text/html', 'UTF-8');
    email.send();
}

module.exports = {
    sendRequestQuoteXml: sendRequestQuoteXml
};