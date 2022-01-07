'use strict';
var HashMap = require('dw/util/HashMap');
var Mail = require('dw/net/Mail');
var Site = require('dw/system/Site');
var Template = require('dw/util/Template');
var Resource = require('dw/web/Resource');
var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

function sendContactUsEmail(contactUsDetails, templateContext) {

    var email = new Mail();

    email.addTo(Site.current.getCustomPreferenceValue('contactUsToEmail') || 'support@cdw.com');
    //email.addBcc(Site.current.getCustomPreferenceValue('contactUsToEmail') || 'support@cdw.com');
    email.setFrom(Site.current.getCustomPreferenceValue('contactUsFromEmail') || 'no-reply@salesforce.com');
    if(contactUsDetails.topic && contactUsDetails != undefined && contactUsDetails != "undefined") {
        email.setSubject(contactUsDetails.topic);
    } else {
        email.setSubject(Resource.msg('email.subject.contact.us', 'customerService', null));
    }
    
    email.setContent(renderTemplateHelper.getRenderedHtml(contactUsDetails, 'customerService/contactUsEmail'), 'text/html', 'UTF-8');
    
    email.send();
}

function sendRequestCatalogEmail(contactDetails, templateContext) {
    var email = new Mail();
    
    
    email.addTo(contactDetails.email);
    email.addBcc(Site.current.getCustomPreferenceValue('requestCatalogToEmail') || 'no-reply@salesforce.com')
    email.setFrom(Site.current.getCustomPreferenceValue('requestCatalogFromEmail') || 'no-reply@salesforce.com');
    email.setSubject(Resource.msg('email.subject.request.catalog', 'customerService', null));

    email.setContent(renderTemplateHelper.getRenderedHtml(contactDetails, 'customerService/requestCatalogEmail'), 'text/html', 'UTF-8');
    email.send();
}

function sendRequestQuoteEmail(contactDetails, templateContext) {

    var email = new Mail();
    
    email.addTo(Site.current.getCustomPreferenceValue('requestQuoteToEmail') || 'no-reply@salesforce.com');
    if(contactDetails.heItemPresent) {
        email.addBcc(Site.current.getCustomPreferenceValue('requestHEQuoteToEmail') || 'no-reply@salesforce.com')
    }
    email.setFrom(Site.current.getCustomPreferenceValue('requestQuoteFromEmail') || 'no-reply@salesforce.com');
    email.setSubject(Resource.msg('email.subject.request.quote', 'customerService', null));
    email.setContent(renderTemplateHelper.getRenderedHtml(contactDetails, 'customerService/requestQuoteEmail'), 'text/html', 'UTF-8');
    email.send();

}

function sendB2BRegisteredUserEmail(userDetails, templateContext) {
    var email = new Mail();

    // compose the email message
    email.addTo(Site.current.getCustomPreferenceValue('b2bRegisteredUserToEmail') || Resource.msg('user.registration.email.default.to.emailAddress', 'b2bUserRegistration', null));
    if (userDetails.interestedInACA) {
        email.addTo(Site.current.getCustomPreferenceValue('b2bRegisteredUserACAToEmail') || Resource.msg('user.registration.email.default.aca.to.emailAddress', 'b2bUserRegistration', null));
    }
    email.setFrom(Site.current.getCustomPreferenceValue('b2bRegisteredUserFromEmail') || Resource.msg('user.registration.email.default.from.emailAddress', 'b2bUserRegistration', null));
    email.setSubject(Site.current.getCustomPreferenceValue('b2bRegisteredUserSubjectEmail') || Resource.msg('user.registration.default.email.subject', 'b2bUserRegistration', null));
    email.setContent(renderTemplateHelper.getRenderedHtml(userDetails, 'checkout/confirmation/b2bAccountRegisteredEmail'), 'text/html', 'UTF-8');

    // send the email
    email.send();
}

function sendB2BContactAccountManagerEmail(contactAccountManagerDetails, templateContext) {
    var email = new Mail();

    // compose the email message
    email.addTo(contactAccountManagerDetails.accountManagerEmailAddress);
    email.setFrom(Site.current.getCustomPreferenceValue('b2bContactAccountManagerFromEmail') || Resource.msg('accountmanager.contact.email.default.from.emailAddress', 'b2bUserRegistration', null));
    email.setSubject(Site.current.getCustomPreferenceValue('b2bContactAccountManagerSubjectEmail') || Resource.msg('accountmanager.contact.email.default.subject', 'b2bUserRegistration', null));
    email.setContent(renderTemplateHelper.getRenderedHtml(contactAccountManagerDetails, 'account/b2b/contactAccountManagerEmail'), 'text/html', 'UTF-8');

    // send the email
    email.send();
}

module.exports = {
    sendContactUsEmail: sendContactUsEmail,
    sendRequestCatalogEmail: sendRequestCatalogEmail,
    sendRequestQuoteEmail: sendRequestQuoteEmail,
    sendB2BRegisteredUserEmail : sendB2BRegisteredUserEmail,
    sendB2BContactAccountManagerEmail : sendB2BContactAccountManagerEmail
};