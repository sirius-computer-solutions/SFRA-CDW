Stuff to get this working:

create a site boolean preference to enable fedex called: FedexEnabled
create service in business manager (service, profile and credentials) or load contents of /metadata
extend shipping method system object to have a boolean attribute called fedexRates
extend product system object and create an attribute grouping for dimWeight
extend service credentials system object and create AccountNumber and MeterNumber (and assign to Extra Credentials Properties group)
extend shipment system object and create an attribute grouping for fedexRatesCache (group name: fedex)
create shipping methods with Ids: FEDEX_GROUND, FEDEX_EXPRESS_SAVER, PRIORITY_OVERNIGHT
