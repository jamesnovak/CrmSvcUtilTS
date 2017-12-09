var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/** @description A CRM Typescript Project
 */
var CRMTypeScriptAxios;
(function (CRMTypeScriptAxios) {
    /** @description Specifies that Entities always have a url route and optionally have an id
     */
    var Entity = (function () {
        function Entity(route, id) {
            this.route = route;
            this.id = id;
        }
        return Entity;
    }());
    CRMTypeScriptAxios.Entity = Entity;
    var Utils = (function () {
        function Utils() {
        }
        /** Helper method for formatting js date
            @param {string} dateVal date to be formatted, in ISO date format
        **/
        Utils.prototype.formatDate = function (dateVal) {
            if (this.isNullUndefinedEmpty(dateVal)) {
                return "null";
            }
            var d = new Date(dateVal);
            var pad = this.padLeadingZeros;
            return (pad(d.getMonth() + 1, 2) + "/" +
                pad(d.getDate(), 2) + "/" +
                d.getFullYear() + " " +
                pad(d.getHours(), 2) + ":" +
                pad(d.getMinutes(), 2));
        };
        /**
         * @description Retrieves the formatted value for an attribute
         * @param {Entity} entity the entity containing the attribute
         * @param {string} attribute name of the attribute being retrieved
         */
        Utils.prototype.getFormattedValue = function (entity, attribute) {
            var displayVal = null;
            if (entity[attribute] !== null) {
                displayVal = entity[attribute];
                var extendedField = attribute + "@OData.Community.Display.V1.FormattedValue";
                if (entity[extendedField] !== null) {
                    displayVal = entity[extendedField];
                }
            }
            return displayVal;
        };
        /**
         * Format a number string with leading zeroz
         * @param num
         * @param precision
         */
        Utils.prototype.padLeadingZeros = function (num, precision) {
            var s = "000000000" + num;
            return s.substr(s.length - precision);
        };
        /**
         * check to see if a value is null or empty
         */
        Utils.prototype.isNullUndefinedEmpty = function (value) {
            if (value === undefined) {
                return true;
            }
            if (value === null) {
                return true;
            }
            if (typeof (value) == 'string') {
                if (value.length == 0) {
                    return true;
                }
            }
            return false;
        };
        /**
         * Clean brackets and dashes from a guid
         */
        Utils.prototype.cleanGuid = function (guid, removeDashes) {
            guid = guid.replace("{", "").replace("}", "");
            if (removeDashes === true) {
                guid = guid.replace(/-/g, "");
            }
            return guid;
        };
        /**
         * Re-opens the form causing a true refresh
         */
        Utils.prototype.reopenForm = function (entityName, entityId) {
            parent.Xrm.Utility.openEntityForm(entityName, entityId);
        };
        /**
          * set all of the fields on the form as read only
          */
        Utils.prototype.markAllFieldReadOnly = function () {
            var page = parent.Xrm.Page.ui;
            page.controls
                .forEach(function (control, index) {
                if (control.setDisabled != undefined) {
                    control.setDisabled(true);
                }
            });
        };
        return Utils;
    }());
    CRMTypeScriptAxios.Utils = Utils;
    /** @description An Axios WebAPI Service for Dynamics CRM
     * @property {string} BaseUrl The CRM org url + WebAPI endpoint
     * @return {object} Axios WebAPI Service
     */
    var WebApi = (function () {
        function WebApi(crmurl) {
            this.BaseUrl = crmurl + "/api/data/v8.2/";
        }
        /** @description Performs a CRM WebAPI Retrieve
         * @param {object} e The entity being retrieved
         * @param {object} params The optional parameters for the retrieve
         * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
         * @return {object} Http GET Promise
         */
        WebApi.prototype.retrieve = function (e, params, formattedValues) {
            // lets url be a concatenation of base url, entity route, and the entity id wrapped in CRM's flavor of WebAPI
            var url = this.BaseUrl + e.route + "(" + e.id + ")";
            // handles params if there are any
            if (params != undefined)
                url = this.addParams(url, params);
            if (formattedValues === true) {
                return axios.get(url, this.getConfig(formattedValues));
            }
            else {
                return axios.get(url);
            }
        };
        /** @description Performs a CRM WebAPI Retrieve for a nextLink URL on expanded attributes or collections
         * @param {object} e The entity being retrieved
         * @param {string} nextLinkUrl the URL for the next retrieve
         * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
         * @return {object} Http GET Promise
         */
        WebApi.prototype.retrieveNext = function (e, nextLinkUrl, formattedValues) {
            // handles params if there are any
            if (formattedValues === true) {
                return axios.get(nextLinkUrl, this.getConfig(formattedValues));
            }
            else {
                return axios.get(nextLinkUrl);
            }
        };
        /** @description Performs a CRM WebAPI Create
         * @param {object} e The entity being created
         * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
         * @param {boolean} returnRecord optional flag indicating whether to return an the updated record
         * @return {object} Http POST Promise
         */
        WebApi.prototype.create = function (e, formattedValues, returnRecord) {
            // lets url be a concatenation of base url and route
            var url = this.BaseUrl + e.route;
            delete e.route;
            return axios.post(url, e, this.getConfig(formattedValues, returnRecord));
        };
        /** @description Performs a CRM WebAPI RetrieveMultiple
         * @param {object} e The entity being retrieved
         * @param {object} params The optional parameters for the retrieve
         * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
         * @return {object} Http GET Promise
         **/
        WebApi.prototype.retrieveMultiple = function (e, params, formattedValues) {
            var url = this.BaseUrl + e.route;
            if (params != undefined)
                url = this.addParams(url, params);
            if (formattedValues === true) {
                return axios.get(url, this.getConfig(formattedValues));
            }
            else {
                return axios.get(url);
            }
        };
        /** @description Performs a CRM WebAPI Update
        * @param {object} e The entity being updated
        * @param {string} route the base route for the enity webapi query string
        * @param {string} id the ID of the entity being updated
         * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
         * @param {boolean} returnRecord optional flag indicating whether to return an the updated record
        * @return {object} Http PATCH Promise
         */
        WebApi.prototype.update = function (e, route, id, formattedValues, returnRecord) {
            // ensure that no curly braces included
            id = new Utils().cleanGuid(id);
            var url = this.BaseUrl + route + "(" + id + ")";
            return axios.patch(url, e, this.getConfig(formattedValues, returnRecord));
        };
        /** @description Performs a CRM WebAPI call using FetchXml as a query
         * @param {object} e The entity being updated
         * @param {string} fetchXML fetch query being passed
         * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
         * @return {object} Http PATCH Promise
         */
        WebApi.prototype.fetch = function (e, fetchXml, formattedValues) {
            // encode the fetch XML string so we can pass via a URL
            var fetchXmlEncoded = encodeURIComponent(fetchXml);
            var url = this.BaseUrl + e.route + "?fetchXml=" + fetchXmlEncoded;
            if (formattedValues === true) {
                return axios.get(url, this.getConfig(formattedValues));
            }
            else {
                return axios.get(url);
            }
        };
        /** @description Performs a CRM WebAPI Delete
         * @param {object} e The entity being deleted
         * @return {object} Http DELETE Promise
         */
        WebApi.prototype.remove = function (e) {
            var url = this.BaseUrl + e.route;
            return axios.delete(url);
        };
        /** @description Adds together parameters in an oData string
         * @param {string} url The url string without params
         * @param {object} params The parameters to be added to the url string
         * @return {string} The url string with parameters
         */
        WebApi.prototype.addParams = function (url, params) {
            url += "?";
            var keys = Object.keys(params);
            keys.forEach(function (v, i) {
                if (i == 0 || i == keys.length)
                    url += v + '=' + params[v];
                else
                    url += '&' + v + '=' + params[v];
            });
            return url;
        };
        /** @description build the additional headers configuration element that will be passed on the HTTP call
        * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
        * @param {boolean} returnRecord optional flag indicating whether to return an the updated record
        **/
        WebApi.prototype.getConfig = function (formattedValues, returnRecord) {
            var config = {
                headers: {
                    'OData-MaxVersion': '4.0',
                    'OData-Version': '4.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=utf-8',
                }
            };
            // check for the optional arguments 
            var prefer = [];
            if (formattedValues === true) {
                prefer.push('odata.include-annotations="*"');
            }
            if (returnRecord === true) {
                prefer.push('return=representation');
            }
            if (prefer.length > 0) {
                config.headers['Prefer'] = prefer.join(",");
            }
            return config;
        };
        return WebApi;
    }());
    CRMTypeScriptAxios.WebApi = WebApi;
    //** Collection of Attribute structures for Account */
    var accountAttributes = (function () {
        function accountAttributes() {
            this.preferredcontactmethodcodename = { name: "preferredcontactmethodcodename", api_name: "preferredcontactmethodcodename" };
            this.emailaddress3 = { name: "emailaddress3", api_name: "emailaddress3" };
            this.emailaddress2 = { name: "emailaddress2", api_name: "emailaddress2" };
            this.emailaddress1 = { name: "emailaddress1", api_name: "emailaddress1" };
            this.address1_city = { name: "address1_city", api_name: "address1_city" };
            this.slaid = { name: "slaid", api_name: "_slaid_value" };
            this.adx_createdbyipaddress = { name: "adx_createdbyipaddress", api_name: "adx_createdbyipaddress" };
            this.address1_longitude = { name: "address1_longitude", api_name: "address1_longitude" };
            this.address2_freighttermscodename = { name: "address2_freighttermscodename", api_name: "address2_freighttermscodename" };
            this.modifiedon = { name: "modifiedon", api_name: "modifiedon" };
            this.aging90 = { name: "aging90", api_name: "aging90" };
            this.websiteurl = { name: "websiteurl", api_name: "websiteurl" };
            this.statuscodename = { name: "statuscodename", api_name: "statuscodename" };
            this.donotpostalmail = { name: "donotpostalmail", api_name: "donotpostalmail" };
            this.openrevenue = { name: "openrevenue", api_name: "openrevenue" };
            this.address1_addresstypecode = { name: "address1_addresstypecode", api_name: "address1_addresstypecode" };
            this.transactioncurrencyid = { name: "transactioncurrencyid", api_name: "_transactioncurrencyid_value" };
            this.sharesoutstanding = { name: "sharesoutstanding", api_name: "sharesoutstanding" };
            this.adx_modifiedbyusername = { name: "adx_modifiedbyusername", api_name: "adx_modifiedbyusername" };
            this.donotsendmm = { name: "donotsendmm", api_name: "donotsendmm" };
            this.primarycontactidname = { name: "primarycontactidname", api_name: "primarycontactidname" };
            this.creditonhold = { name: "creditonhold", api_name: "creditonhold" };
            this.transactioncurrencyidname = { name: "transactioncurrencyidname", api_name: "transactioncurrencyidname" };
            this.aging30 = { name: "aging30", api_name: "aging30" };
            this.donotbulkpostalmail = { name: "donotbulkpostalmail", api_name: "donotbulkpostalmail" };
            this.address1_shippingmethodcode = { name: "address1_shippingmethodcode", api_name: "address1_shippingmethodcode" };
            this.slainvokedid = { name: "slainvokedid", api_name: "_slainvokedid_value" };
            this.opendeals_date = { name: "opendeals_date", api_name: "opendeals_date" };
            this.businesstypecodename = { name: "businesstypecodename", api_name: "businesstypecodename" };
            this.originatingleadid = { name: "originatingleadid", api_name: "_originatingleadid_value" };
            this.masteraccountidname = { name: "masteraccountidname", api_name: "masteraccountidname" };
            this.preferredsystemuseridname = { name: "preferredsystemuseridname", api_name: "preferredsystemuseridname" };
            this.accountcategorycode = { name: "accountcategorycode", api_name: "accountcategorycode" };
            this.preferredappointmentdaycodename = { name: "preferredappointmentdaycodename", api_name: "preferredappointmentdaycodename" };
            this.address2_stateorprovince = { name: "address2_stateorprovince", api_name: "address2_stateorprovince" };
            this.participatesinworkflowname = { name: "participatesinworkflowname", api_name: "participatesinworkflowname" };
            this.territoryid = { name: "territoryid", api_name: "_territoryid_value" };
            this.gnext_employingagencysphonenumber = { name: "gnext_employingagencysphonenumber", api_name: "gnext_employingagencysphonenumber" };
            this.address2_country = { name: "address2_country", api_name: "address2_country" };
            this.accountcategorycodename = { name: "accountcategorycodename", api_name: "accountcategorycodename" };
            this.address2_line2 = { name: "address2_line2", api_name: "address2_line2" };
            this.aging60_base = { name: "aging60_base", api_name: "aging60_base" };
            this.address1_line3 = { name: "address1_line3", api_name: "address1_line3" };
            this.onholdtime = { name: "onholdtime", api_name: "onholdtime" };
            this.address1_freighttermscode = { name: "address1_freighttermscode", api_name: "address1_freighttermscode" };
            this.creditlimit = { name: "creditlimit", api_name: "creditlimit" };
            this.openrevenue_base = { name: "openrevenue_base", api_name: "openrevenue_base" };
            this.gnext_employingagencysstate = { name: "gnext_employingagencysstate", api_name: "gnext_employingagencysstate" };
            this.parentaccountidname = { name: "parentaccountidname", api_name: "parentaccountidname" };
            this.originatingleadidname = { name: "originatingleadidname", api_name: "originatingleadidname" };
            this.address1_utcoffset = { name: "address1_utcoffset", api_name: "address1_utcoffset" };
            this.preferredappointmenttimecode = { name: "preferredappointmenttimecode", api_name: "preferredappointmenttimecode" };
            this.donotsendmarketingmaterialname = { name: "donotsendmarketingmaterialname", api_name: "donotsendmarketingmaterialname" };
            this.numberofemployees = { name: "numberofemployees", api_name: "numberofemployees" };
            this.modifiedbyexternalpartyname = { name: "modifiedbyexternalpartyname", api_name: "modifiedbyexternalpartyname" };
            this.statecodename = { name: "statecodename", api_name: "statecodename" };
            this.accountclassificationcode = { name: "accountclassificationcode", api_name: "accountclassificationcode" };
            this.revenue = { name: "revenue", api_name: "revenue" };
            this.customertypecode = { name: "customertypecode", api_name: "customertypecode" };
            this.donotbulkpostalmailname = { name: "donotbulkpostalmailname", api_name: "donotbulkpostalmailname" };
            this.exchangerate = { name: "exchangerate", api_name: "exchangerate" };
            this.address2_county = { name: "address2_county", api_name: "address2_county" };
            this.isprivate = { name: "isprivate", api_name: "isprivate" };
            this.primarycontactid = { name: "primarycontactid", api_name: "_primarycontactid_value" };
            this.donotpostalmailname = { name: "donotpostalmailname", api_name: "donotpostalmailname" };
            this.telephone3 = { name: "telephone3", api_name: "telephone3" };
            this.parentaccountid = { name: "parentaccountid", api_name: "_parentaccountid_value" };
            this.address2_city = { name: "address2_city", api_name: "address2_city" };
            this.statuscode = { name: "statuscode", api_name: "statuscode" };
            this.address1_addresstypecodename = { name: "address1_addresstypecodename", api_name: "address1_addresstypecodename" };
            this.address2_latitude = { name: "address2_latitude", api_name: "address2_latitude" };
            this.createdon = { name: "createdon", api_name: "createdon" };
            this.donotbulkemail = { name: "donotbulkemail", api_name: "donotbulkemail" };
            this.address2_line1 = { name: "address2_line1", api_name: "address2_line1" };
            this.donotfax = { name: "donotfax", api_name: "donotfax" };
            this.marketcap = { name: "marketcap", api_name: "marketcap" };
            this.address1_composite = { name: "address1_composite", api_name: "address1_composite" };
            this.ownershipcode = { name: "ownershipcode", api_name: "ownershipcode" };
            this.opendeals_state = { name: "opendeals_state", api_name: "opendeals_state" };
            this.owningbusinessunit = { name: "owningbusinessunit", api_name: "_owningbusinessunit_value" };
            this.preferredappointmenttimecodename = { name: "preferredappointmenttimecodename", api_name: "preferredappointmenttimecodename" };
            this.address2_postalcode = { name: "address2_postalcode", api_name: "address2_postalcode" };
            this.adx_createdbyusername = { name: "adx_createdbyusername", api_name: "adx_createdbyusername" };
            this.lastusedincampaign = { name: "lastusedincampaign", api_name: "lastusedincampaign" };
            this.paymenttermscodename = { name: "paymenttermscodename", api_name: "paymenttermscodename" };
            this.industrycodename = { name: "industrycodename", api_name: "industrycodename" };
            this.processid = { name: "processid", api_name: "processid" };
            this.entityimage_url = { name: "entityimage_url", api_name: "entityimage_url" };
            this.address2_shippingmethodcodename = { name: "address2_shippingmethodcodename", api_name: "address2_shippingmethodcodename" };
            this.address2_line3 = { name: "address2_line3", api_name: "address2_line3" };
            this.description = { name: "description", api_name: "description" };
            this.modifiedby = { name: "modifiedby", api_name: "_modifiedby_value" };
            this.address1_county = { name: "address1_county", api_name: "address1_county" };
            this.createdbyname = { name: "createdbyname", api_name: "createdbyname" };
            this.shippingmethodcodename = { name: "shippingmethodcodename", api_name: "shippingmethodcodename" };
            this.address1_line1 = { name: "address1_line1", api_name: "address1_line1" };
            this.gnext_employingagencysaddressline2 = { name: "gnext_employingagencysaddressline2", api_name: "gnext_employingagencysaddressline2" };
            this.donotemail = { name: "donotemail", api_name: "donotemail" };
            this.territorycode = { name: "territorycode", api_name: "territorycode" };
            this.donotphonename = { name: "donotphonename", api_name: "donotphonename" };
            this.address2_postofficebox = { name: "address2_postofficebox", api_name: "address2_postofficebox" };
            this.address2_telephone1 = { name: "address2_telephone1", api_name: "address2_telephone1" };
            this.address2_telephone2 = { name: "address2_telephone2", api_name: "address2_telephone2" };
            this.address2_telephone3 = { name: "address2_telephone3", api_name: "address2_telephone3" };
            this.aging60 = { name: "aging60", api_name: "aging60" };
            this.address1_addressid = { name: "address1_addressid", api_name: "address1_addressid" };
            this.traversedpath = { name: "traversedpath", api_name: "traversedpath" };
            this.territoryidname = { name: "territoryidname", api_name: "territoryidname" };
            this.territorycodename = { name: "territorycodename", api_name: "territorycodename" };
            this.followemailname = { name: "followemailname", api_name: "followemailname" };
            this.owninguser = { name: "owninguser", api_name: "_owninguser_value" };
            this.industrycode = { name: "industrycode", api_name: "industrycode" };
            this.address2_name = { name: "address2_name", api_name: "address2_name" };
            this.openrevenue_state = { name: "openrevenue_state", api_name: "openrevenue_state" };
            this.primarysatoriid = { name: "primarysatoriid", api_name: "primarysatoriid" };
            this.name = { name: "name", api_name: "name" };
            this.gnext_employingagencyaddress1 = { name: "gnext_employingagencyaddress1", api_name: "gnext_employingagencyaddress1" };
            this.entityimageid = { name: "entityimageid", api_name: "entityimageid" };
            this.donotphone = { name: "donotphone", api_name: "donotphone" };
            this.timespentbymeonemailandmeetings = { name: "timespentbymeonemailandmeetings", api_name: "timespentbymeonemailandmeetings" };
            this.businesstypecode = { name: "businesstypecode", api_name: "businesstypecode" };
            this.primarytwitterid = { name: "primarytwitterid", api_name: "primarytwitterid" };
            this.owneridname = { name: "owneridname", api_name: "owneridname" };
            this.entityimage = { name: "entityimage", api_name: "entityimage" };
            this.entityimage_timestamp = { name: "entityimage_timestamp", api_name: "entityimage_timestamp" };
            this.createdbyexternalparty = { name: "createdbyexternalparty", api_name: "_createdbyexternalparty_value" };
            this.address2_composite = { name: "address2_composite", api_name: "address2_composite" };
            this.accountratingcodename = { name: "accountratingcodename", api_name: "accountratingcodename" };
            this.shippingmethodcode = { name: "shippingmethodcode", api_name: "shippingmethodcode" };
            this.address1_country = { name: "address1_country", api_name: "address1_country" };
            this.customertypecodename = { name: "customertypecodename", api_name: "customertypecodename" };
            this.owningteam = { name: "owningteam", api_name: "_owningteam_value" };
            this.address1_stateorprovince = { name: "address1_stateorprovince", api_name: "address1_stateorprovince" };
            this.isprivatename = { name: "isprivatename", api_name: "isprivatename" };
            this.paymenttermscode = { name: "paymenttermscode", api_name: "paymenttermscode" };
            this.marketingonly = { name: "marketingonly", api_name: "marketingonly" };
            this.creditonholdname = { name: "creditonholdname", api_name: "creditonholdname" };
            this.preferredequipmentid = { name: "preferredequipmentid", api_name: "_preferredequipmentid_value" };
            this.gnext_employingagencysalternatephonenumber = { name: "gnext_employingagencysalternatephonenumber", api_name: "gnext_employingagencysalternatephonenumber" };
            this.address1_freighttermscodename = { name: "address1_freighttermscodename", api_name: "address1_freighttermscodename" };
            this.marketingonlyname = { name: "marketingonlyname", api_name: "marketingonlyname" };
            this.accountratingcode = { name: "accountratingcode", api_name: "accountratingcode" };
            this.address1_telephone1 = { name: "address1_telephone1", api_name: "address1_telephone1" };
            this.address1_telephone2 = { name: "address1_telephone2", api_name: "address1_telephone2" };
            this.address1_telephone3 = { name: "address1_telephone3", api_name: "address1_telephone3" };
            this.address1_postofficebox = { name: "address1_postofficebox", api_name: "address1_postofficebox" };
            this.msa_managingpartnerid = { name: "msa_managingpartnerid", api_name: "_msa_managingpartnerid_value" };
            this.customersizecodename = { name: "customersizecodename", api_name: "customersizecodename" };
            this.donotemailname = { name: "donotemailname", api_name: "donotemailname" };
            this.slainvokedidname = { name: "slainvokedidname", api_name: "slainvokedidname" };
            this.fax = { name: "fax", api_name: "fax" };
            this.masterid = { name: "masterid", api_name: "_masterid_value" };
            this.gnext_psareport_psasidname = { name: "gnext_psareport_psasidname", api_name: "gnext_psareport_psasidname" };
            this.sic = { name: "sic", api_name: "sic" };
            this.ownerid = { name: "ownerid", api_name: "_ownerid_value" };
            this.address2_utcoffset = { name: "address2_utcoffset", api_name: "address2_utcoffset" };
            this.stageid = { name: "stageid", api_name: "stageid" };
            this.accountnumber = { name: "accountnumber", api_name: "accountnumber" };
            this.creditlimit_base = { name: "creditlimit_base", api_name: "creditlimit_base" };
            this.address2_fax = { name: "address2_fax", api_name: "address2_fax" };
            this.revenue_base = { name: "revenue_base", api_name: "revenue_base" };
            this.merged = { name: "merged", api_name: "merged" };
            this.owneridtype = { name: "owneridtype", api_name: "owneridtype" };
            this.address2_longitude = { name: "address2_longitude", api_name: "address2_longitude" };
            this.modifiedbyexternalparty = { name: "modifiedbyexternalparty", api_name: "_modifiedbyexternalparty_value" };
            this.defaultpricelevelid = { name: "defaultpricelevelid", api_name: "_defaultpricelevelid_value" };
            this.ftpsiteurl = { name: "ftpsiteurl", api_name: "ftpsiteurl" };
            this.preferredequipmentidname = { name: "preferredequipmentidname", api_name: "preferredequipmentidname" };
            this.gnext_employingagencyszipcode = { name: "gnext_employingagencyszipcode", api_name: "gnext_employingagencyszipcode" };
            this.gnext_employingagencyscity = { name: "gnext_employingagencyscity", api_name: "gnext_employingagencyscity" };
            this.aging90_base = { name: "aging90_base", api_name: "aging90_base" };
            this.gnext_agencyheadsjobtitle = { name: "gnext_agencyheadsjobtitle", api_name: "gnext_agencyheadsjobtitle" };
            this.defaultpricelevelidname = { name: "defaultpricelevelidname", api_name: "defaultpricelevelidname" };
            this.address1_shippingmethodcodename = { name: "address1_shippingmethodcodename", api_name: "address1_shippingmethodcodename" };
            this.gnext_psareport_psasid = { name: "gnext_psareport_psasid", api_name: "_gnext_psareport_psasid_value" };
            this.address1_primarycontactname = { name: "address1_primarycontactname", api_name: "address1_primarycontactname" };
            this.lastonholdtime = { name: "lastonholdtime", api_name: "lastonholdtime" };
            this.address1_line2 = { name: "address1_line2", api_name: "address1_line2" };
            this.createdby = { name: "createdby", api_name: "_createdby_value" };
            this.address2_addresstypecode = { name: "address2_addresstypecode", api_name: "address2_addresstypecode" };
            this.openrevenue_date = { name: "openrevenue_date", api_name: "openrevenue_date" };
            this.address2_upszone = { name: "address2_upszone", api_name: "address2_upszone" };
            this.followemail = { name: "followemail", api_name: "followemail" };
            this.donotfaxname = { name: "donotfaxname", api_name: "donotfaxname" };
            this.gnext_employingagencysemailaddress = { name: "gnext_employingagencysemailaddress", api_name: "gnext_employingagencysemailaddress" };
            this.marketcap_base = { name: "marketcap_base", api_name: "marketcap_base" };
            this.address2_addresstypecodename = { name: "address2_addresstypecodename", api_name: "address2_addresstypecodename" };
            this.ownershipcodename = { name: "ownershipcodename", api_name: "ownershipcodename" };
            this.address1_postalcode = { name: "address1_postalcode", api_name: "address1_postalcode" };
            this.tickersymbol = { name: "tickersymbol", api_name: "tickersymbol" };
            this.customersizecode = { name: "customersizecode", api_name: "customersizecode" };
            this.preferredserviceidname = { name: "preferredserviceidname", api_name: "preferredserviceidname" };
            this.createdbyexternalpartyname = { name: "createdbyexternalpartyname", api_name: "createdbyexternalpartyname" };
            this.donotbulkemailname = { name: "donotbulkemailname", api_name: "donotbulkemailname" };
            this.participatesinworkflow = { name: "participatesinworkflow", api_name: "participatesinworkflow" };
            this.stockexchange = { name: "stockexchange", api_name: "stockexchange" };
            this.preferredserviceid = { name: "preferredserviceid", api_name: "_preferredserviceid_value" };
            this.preferredcontactmethodcode = { name: "preferredcontactmethodcode", api_name: "preferredcontactmethodcode" };
            this.telephone2 = { name: "telephone2", api_name: "telephone2" };
            this.mergedname = { name: "mergedname", api_name: "mergedname" };
            this.msa_managingpartneridname = { name: "msa_managingpartneridname", api_name: "msa_managingpartneridname" };
            this.preferredsystemuserid = { name: "preferredsystemuserid", api_name: "_preferredsystemuserid_value" };
            this.accountid = { name: "accountid", api_name: "accountid" };
            this.gnext_employingagencysccty = { name: "gnext_employingagencysccty", api_name: "gnext_employingagencysccty" };
            this.telephone1 = { name: "telephone1", api_name: "telephone1" };
            this.aging30_base = { name: "aging30_base", api_name: "aging30_base" };
            this.address1_name = { name: "address1_name", api_name: "address1_name" };
            this.address1_fax = { name: "address1_fax", api_name: "address1_fax" };
            this.address1_latitude = { name: "address1_latitude", api_name: "address1_latitude" };
            this.address2_shippingmethodcode = { name: "address2_shippingmethodcode", api_name: "address2_shippingmethodcode" };
            this.accountclassificationcodename = { name: "accountclassificationcodename", api_name: "accountclassificationcodename" };
            this.preferredappointmentdaycode = { name: "preferredappointmentdaycode", api_name: "preferredappointmentdaycode" };
            this.modifiedbyname = { name: "modifiedbyname", api_name: "modifiedbyname" };
            this.address2_freighttermscode = { name: "address2_freighttermscode", api_name: "address2_freighttermscode" };
            this.address1_upszone = { name: "address1_upszone", api_name: "address1_upszone" };
            this.address2_addressid = { name: "address2_addressid", api_name: "address2_addressid" };
            this.slaname = { name: "slaname", api_name: "slaname" };
            this.adx_modifiedbyipaddress = { name: "adx_modifiedbyipaddress", api_name: "adx_modifiedbyipaddress" };
            this.address2_primarycontactname = { name: "address2_primarycontactname", api_name: "address2_primarycontactname" };
            this.opendeals = { name: "opendeals", api_name: "opendeals" };
            this.statecode = { name: "statecode", api_name: "statecode" };
        }
        return accountAttributes;
    }());
    CRMTypeScriptAxios.accountAttributes = accountAttributes;
    /** @description Instantiates a Account Entity to be used for CRUD based operations
    * @param {object} initData An optional parameter for a create and update entities */
    var account = (function (_super) {
        __extends(account, _super);
        function account(initData) {
            var _this = _super.call(this, "accounts") || this;
            _this.route = "Accounts";
            if (initData == undefined) {
                return _this;
            }
            _this.id = initData.accountid;
            _this.preferredcontactmethodcodename = initData.preferredcontactmethodcodename;
            _this.emailaddress3 = initData.emailaddress3;
            _this.emailaddress2 = initData.emailaddress2;
            _this.emailaddress1 = initData.emailaddress1;
            _this.address1_city = initData.address1_city;
            _this._slaid_value = initData._slaid_value;
            _this.adx_createdbyipaddress = initData.adx_createdbyipaddress;
            _this.address1_longitude = initData.address1_longitude;
            _this.address2_freighttermscodename = initData.address2_freighttermscodename;
            _this.modifiedon = initData.modifiedon;
            _this.aging90 = initData.aging90;
            _this.websiteurl = initData.websiteurl;
            _this.statuscodename = initData.statuscodename;
            _this.donotpostalmail = initData.donotpostalmail;
            _this.openrevenue = initData.openrevenue;
            _this.address1_addresstypecode = initData.address1_addresstypecode;
            _this._transactioncurrencyid_value = initData._transactioncurrencyid_value;
            _this.sharesoutstanding = initData.sharesoutstanding;
            _this.adx_modifiedbyusername = initData.adx_modifiedbyusername;
            _this.donotsendmm = initData.donotsendmm;
            _this.primarycontactidname = initData.primarycontactidname;
            _this.creditonhold = initData.creditonhold;
            _this.transactioncurrencyidname = initData.transactioncurrencyidname;
            _this.aging30 = initData.aging30;
            _this.donotbulkpostalmail = initData.donotbulkpostalmail;
            _this.address1_shippingmethodcode = initData.address1_shippingmethodcode;
            _this._slainvokedid_value = initData._slainvokedid_value;
            _this.opendeals_date = initData.opendeals_date;
            _this.businesstypecodename = initData.businesstypecodename;
            _this._originatingleadid_value = initData._originatingleadid_value;
            _this.masteraccountidname = initData.masteraccountidname;
            _this.preferredsystemuseridname = initData.preferredsystemuseridname;
            _this.accountcategorycode = initData.accountcategorycode;
            _this.preferredappointmentdaycodename = initData.preferredappointmentdaycodename;
            _this.address2_stateorprovince = initData.address2_stateorprovince;
            _this.participatesinworkflowname = initData.participatesinworkflowname;
            _this._territoryid_value = initData._territoryid_value;
            _this.gnext_employingagencysphonenumber = initData.gnext_employingagencysphonenumber;
            _this.address2_country = initData.address2_country;
            _this.accountcategorycodename = initData.accountcategorycodename;
            _this.address2_line2 = initData.address2_line2;
            _this.aging60_base = initData.aging60_base;
            _this.address1_line3 = initData.address1_line3;
            _this.onholdtime = initData.onholdtime;
            _this.address1_freighttermscode = initData.address1_freighttermscode;
            _this.creditlimit = initData.creditlimit;
            _this.openrevenue_base = initData.openrevenue_base;
            _this.gnext_employingagencysstate = initData.gnext_employingagencysstate;
            _this.parentaccountidname = initData.parentaccountidname;
            _this.originatingleadidname = initData.originatingleadidname;
            _this.address1_utcoffset = initData.address1_utcoffset;
            _this.preferredappointmenttimecode = initData.preferredappointmenttimecode;
            _this.donotsendmarketingmaterialname = initData.donotsendmarketingmaterialname;
            _this.numberofemployees = initData.numberofemployees;
            _this.modifiedbyexternalpartyname = initData.modifiedbyexternalpartyname;
            _this.statecodename = initData.statecodename;
            _this.accountclassificationcode = initData.accountclassificationcode;
            _this.revenue = initData.revenue;
            _this.customertypecode = initData.customertypecode;
            _this.donotbulkpostalmailname = initData.donotbulkpostalmailname;
            _this.exchangerate = initData.exchangerate;
            _this.address2_county = initData.address2_county;
            _this.isprivate = initData.isprivate;
            _this._primarycontactid_value = initData._primarycontactid_value;
            _this.donotpostalmailname = initData.donotpostalmailname;
            _this.telephone3 = initData.telephone3;
            _this._parentaccountid_value = initData._parentaccountid_value;
            _this.address2_city = initData.address2_city;
            _this.statuscode = initData.statuscode;
            _this.address1_addresstypecodename = initData.address1_addresstypecodename;
            _this.address2_latitude = initData.address2_latitude;
            _this.createdon = initData.createdon;
            _this.donotbulkemail = initData.donotbulkemail;
            _this.address2_line1 = initData.address2_line1;
            _this.donotfax = initData.donotfax;
            _this.marketcap = initData.marketcap;
            _this.address1_composite = initData.address1_composite;
            _this.ownershipcode = initData.ownershipcode;
            _this.opendeals_state = initData.opendeals_state;
            _this._owningbusinessunit_value = initData._owningbusinessunit_value;
            _this.preferredappointmenttimecodename = initData.preferredappointmenttimecodename;
            _this.address2_postalcode = initData.address2_postalcode;
            _this.adx_createdbyusername = initData.adx_createdbyusername;
            _this.lastusedincampaign = initData.lastusedincampaign;
            _this.paymenttermscodename = initData.paymenttermscodename;
            _this.industrycodename = initData.industrycodename;
            _this.processid = initData.processid;
            _this.entityimage_url = initData.entityimage_url;
            _this.address2_shippingmethodcodename = initData.address2_shippingmethodcodename;
            _this.address2_line3 = initData.address2_line3;
            _this.description = initData.description;
            _this._modifiedby_value = initData._modifiedby_value;
            _this.address1_county = initData.address1_county;
            _this.createdbyname = initData.createdbyname;
            _this.shippingmethodcodename = initData.shippingmethodcodename;
            _this.address1_line1 = initData.address1_line1;
            _this.gnext_employingagencysaddressline2 = initData.gnext_employingagencysaddressline2;
            _this.donotemail = initData.donotemail;
            _this.territorycode = initData.territorycode;
            _this.donotphonename = initData.donotphonename;
            _this.address2_postofficebox = initData.address2_postofficebox;
            _this.address2_telephone1 = initData.address2_telephone1;
            _this.address2_telephone2 = initData.address2_telephone2;
            _this.address2_telephone3 = initData.address2_telephone3;
            _this.aging60 = initData.aging60;
            _this.address1_addressid = initData.address1_addressid;
            _this.traversedpath = initData.traversedpath;
            _this.territoryidname = initData.territoryidname;
            _this.territorycodename = initData.territorycodename;
            _this.followemailname = initData.followemailname;
            _this._owninguser_value = initData._owninguser_value;
            _this.industrycode = initData.industrycode;
            _this.address2_name = initData.address2_name;
            _this.openrevenue_state = initData.openrevenue_state;
            _this.primarysatoriid = initData.primarysatoriid;
            _this.name = initData.name;
            _this.gnext_employingagencyaddress1 = initData.gnext_employingagencyaddress1;
            _this.entityimageid = initData.entityimageid;
            _this.donotphone = initData.donotphone;
            _this.timespentbymeonemailandmeetings = initData.timespentbymeonemailandmeetings;
            _this.businesstypecode = initData.businesstypecode;
            _this.primarytwitterid = initData.primarytwitterid;
            _this.owneridname = initData.owneridname;
            _this.entityimage = initData.entityimage;
            _this.entityimage_timestamp = initData.entityimage_timestamp;
            _this._createdbyexternalparty_value = initData._createdbyexternalparty_value;
            _this.address2_composite = initData.address2_composite;
            _this.accountratingcodename = initData.accountratingcodename;
            _this.shippingmethodcode = initData.shippingmethodcode;
            _this.address1_country = initData.address1_country;
            _this.customertypecodename = initData.customertypecodename;
            _this._owningteam_value = initData._owningteam_value;
            _this.address1_stateorprovince = initData.address1_stateorprovince;
            _this.isprivatename = initData.isprivatename;
            _this.paymenttermscode = initData.paymenttermscode;
            _this.marketingonly = initData.marketingonly;
            _this.creditonholdname = initData.creditonholdname;
            _this._preferredequipmentid_value = initData._preferredequipmentid_value;
            _this.gnext_employingagencysalternatephonenumber = initData.gnext_employingagencysalternatephonenumber;
            _this.address1_freighttermscodename = initData.address1_freighttermscodename;
            _this.marketingonlyname = initData.marketingonlyname;
            _this.accountratingcode = initData.accountratingcode;
            _this.address1_telephone1 = initData.address1_telephone1;
            _this.address1_telephone2 = initData.address1_telephone2;
            _this.address1_telephone3 = initData.address1_telephone3;
            _this.address1_postofficebox = initData.address1_postofficebox;
            _this._msa_managingpartnerid_value = initData._msa_managingpartnerid_value;
            _this.customersizecodename = initData.customersizecodename;
            _this.donotemailname = initData.donotemailname;
            _this.slainvokedidname = initData.slainvokedidname;
            _this.fax = initData.fax;
            _this._masterid_value = initData._masterid_value;
            _this.gnext_psareport_psasidname = initData.gnext_psareport_psasidname;
            _this.sic = initData.sic;
            _this._ownerid_value = initData._ownerid_value;
            _this.address2_utcoffset = initData.address2_utcoffset;
            _this.stageid = initData.stageid;
            _this.accountnumber = initData.accountnumber;
            _this.creditlimit_base = initData.creditlimit_base;
            _this.address2_fax = initData.address2_fax;
            _this.revenue_base = initData.revenue_base;
            _this.merged = initData.merged;
            _this.owneridtype = initData.owneridtype;
            _this.address2_longitude = initData.address2_longitude;
            _this._modifiedbyexternalparty_value = initData._modifiedbyexternalparty_value;
            _this._defaultpricelevelid_value = initData._defaultpricelevelid_value;
            _this.ftpsiteurl = initData.ftpsiteurl;
            _this.preferredequipmentidname = initData.preferredequipmentidname;
            _this.gnext_employingagencyszipcode = initData.gnext_employingagencyszipcode;
            _this.gnext_employingagencyscity = initData.gnext_employingagencyscity;
            _this.aging90_base = initData.aging90_base;
            _this.gnext_agencyheadsjobtitle = initData.gnext_agencyheadsjobtitle;
            _this.defaultpricelevelidname = initData.defaultpricelevelidname;
            _this.address1_shippingmethodcodename = initData.address1_shippingmethodcodename;
            _this._gnext_psareport_psasid_value = initData._gnext_psareport_psasid_value;
            _this.address1_primarycontactname = initData.address1_primarycontactname;
            _this.lastonholdtime = initData.lastonholdtime;
            _this.address1_line2 = initData.address1_line2;
            _this._createdby_value = initData._createdby_value;
            _this.address2_addresstypecode = initData.address2_addresstypecode;
            _this.openrevenue_date = initData.openrevenue_date;
            _this.address2_upszone = initData.address2_upszone;
            _this.followemail = initData.followemail;
            _this.donotfaxname = initData.donotfaxname;
            _this.gnext_employingagencysemailaddress = initData.gnext_employingagencysemailaddress;
            _this.marketcap_base = initData.marketcap_base;
            _this.address2_addresstypecodename = initData.address2_addresstypecodename;
            _this.ownershipcodename = initData.ownershipcodename;
            _this.address1_postalcode = initData.address1_postalcode;
            _this.tickersymbol = initData.tickersymbol;
            _this.customersizecode = initData.customersizecode;
            _this.preferredserviceidname = initData.preferredserviceidname;
            _this.createdbyexternalpartyname = initData.createdbyexternalpartyname;
            _this.donotbulkemailname = initData.donotbulkemailname;
            _this.participatesinworkflow = initData.participatesinworkflow;
            _this.stockexchange = initData.stockexchange;
            _this._preferredserviceid_value = initData._preferredserviceid_value;
            _this.preferredcontactmethodcode = initData.preferredcontactmethodcode;
            _this.telephone2 = initData.telephone2;
            _this.mergedname = initData.mergedname;
            _this.msa_managingpartneridname = initData.msa_managingpartneridname;
            _this._preferredsystemuserid_value = initData._preferredsystemuserid_value;
            _this.accountid = initData.accountid;
            _this.gnext_employingagencysccty = initData.gnext_employingagencysccty;
            _this.telephone1 = initData.telephone1;
            _this.aging30_base = initData.aging30_base;
            _this.address1_name = initData.address1_name;
            _this.address1_fax = initData.address1_fax;
            _this.address1_latitude = initData.address1_latitude;
            _this.address2_shippingmethodcode = initData.address2_shippingmethodcode;
            _this.accountclassificationcodename = initData.accountclassificationcodename;
            _this.preferredappointmentdaycode = initData.preferredappointmentdaycode;
            _this.modifiedbyname = initData.modifiedbyname;
            _this.address2_freighttermscode = initData.address2_freighttermscode;
            _this.address1_upszone = initData.address1_upszone;
            _this.address2_addressid = initData.address2_addressid;
            _this.slaname = initData.slaname;
            _this.adx_modifiedbyipaddress = initData.adx_modifiedbyipaddress;
            _this.address2_primarycontactname = initData.address2_primarycontactname;
            _this.opendeals = initData.opendeals;
            _this.statecode = initData.statecode;
            return _this;
        }
        return account;
    }(Entity));
    CRMTypeScriptAxios.account = account;
    //** Collection of Attribute structures for Task */
    var taskAttributes = (function () {
        function taskAttributes() {
            this.isbilled = { name: "isbilled", api_name: "isbilled" };
            this.prioritycodename = { name: "prioritycodename", api_name: "prioritycodename" };
            this.createdon = { name: "createdon", api_name: "createdon" };
            this.gnext_taskstage = { name: "gnext_taskstage", api_name: "gnext_taskstage" };
            this.gnext_duration = { name: "gnext_duration", api_name: "gnext_duration" };
            this.statuscodename = { name: "statuscodename", api_name: "statuscodename" };
            this.traversedpath = { name: "traversedpath", api_name: "traversedpath" };
            this.isworkflowcreated = { name: "isworkflowcreated", api_name: "isworkflowcreated" };
            this.owneridtype = { name: "owneridtype", api_name: "owneridtype" };
            this.crmtaskassigneduniqueid = { name: "crmtaskassigneduniqueid", api_name: "crmtaskassigneduniqueid" };
            this.modifiedbyname = { name: "modifiedbyname", api_name: "modifiedbyname" };
            this.onholdtime = { name: "onholdtime", api_name: "onholdtime" };
            this.owneridname = { name: "owneridname", api_name: "owneridname" };
            this.prioritycode = { name: "prioritycode", api_name: "prioritycode" };
            this.scheduledstart = { name: "scheduledstart", api_name: "scheduledstart" };
            this.actualstart = { name: "actualstart", api_name: "actualstart" };
            this.subscriptionid = { name: "subscriptionid", api_name: "subscriptionid" };
            this.exchangerate = { name: "exchangerate", api_name: "exchangerate" };
            this.subcategory = { name: "subcategory", api_name: "subcategory" };
            this.regardingobjectid = { name: "regardingobjectid", api_name: "_regardingobjectid_value" };
            this.statecode = { name: "statecode", api_name: "statecode" };
            this.gnext_classification = { name: "gnext_classification", api_name: "gnext_classification" };
            this.gnext_actualend = { name: "gnext_actualend", api_name: "gnext_actualend" };
            this.gnext_classificationname = { name: "gnext_classificationname", api_name: "gnext_classificationname" };
            this.activitytypecodename = { name: "activitytypecodename", api_name: "activitytypecodename" };
            this.regardingobjectidname = { name: "regardingobjectidname", api_name: "regardingobjectidname" };
            this.activityadditionalparams = { name: "activityadditionalparams", api_name: "activityadditionalparams" };
            this.activitytypecode = { name: "activitytypecode", api_name: "activitytypecode" };
            this.isbilledname = { name: "isbilledname", api_name: "isbilledname" };
            this.slaid = { name: "slaid", api_name: "_slaid_value" };
            this.ownerid = { name: "ownerid", api_name: "_ownerid_value" };
            this.isregularactivityname = { name: "isregularactivityname", api_name: "isregularactivityname" };
            this.scheduleddurationminutes = { name: "scheduleddurationminutes", api_name: "scheduleddurationminutes" };
            this.category = { name: "category", api_name: "category" };
            this.processid = { name: "processid", api_name: "processid" };
            this.description = { name: "description", api_name: "description" };
            this.slaname = { name: "slaname", api_name: "slaname" };
            this.gnext_starttimer = { name: "gnext_starttimer", api_name: "gnext_starttimer" };
            this.createdbyname = { name: "createdbyname", api_name: "createdbyname" };
            this.owningteam = { name: "owningteam", api_name: "_owningteam_value" };
            this.sortdate = { name: "sortdate", api_name: "sortdate" };
            this.isworkflowcreatedname = { name: "isworkflowcreatedname", api_name: "isworkflowcreatedname" };
            this.gnext_tasktypename = { name: "gnext_tasktypename", api_name: "gnext_tasktypename" };
            this.lastonholdtime = { name: "lastonholdtime", api_name: "lastonholdtime" };
            this.stageid = { name: "stageid", api_name: "stageid" };
            this.gnext_taskstagename = { name: "gnext_taskstagename", api_name: "gnext_taskstagename" };
            this.modifiedon = { name: "modifiedon", api_name: "modifiedon" };
            this.transactioncurrencyid = { name: "transactioncurrencyid", api_name: "_transactioncurrencyid_value" };
            this.slainvokedid = { name: "slainvokedid", api_name: "_slainvokedid_value" };
            this.createdby = { name: "createdby", api_name: "_createdby_value" };
            this.modifiedby = { name: "modifiedby", api_name: "_modifiedby_value" };
            this.gnext_tasktype = { name: "gnext_tasktype", api_name: "_gnext_tasktype_value" };
            this.serviceid = { name: "serviceid", api_name: "_serviceid_value" };
            this.percentcomplete = { name: "percentcomplete", api_name: "percentcomplete" };
            this.owninguser = { name: "owninguser", api_name: "_owninguser_value" };
            this.transactioncurrencyidname = { name: "transactioncurrencyidname", api_name: "transactioncurrencyidname" };
            this.actualend = { name: "actualend", api_name: "actualend" };
            this.owningbusinessunit = { name: "owningbusinessunit", api_name: "_owningbusinessunit_value" };
            this.gnext_dateassigned = { name: "gnext_dateassigned", api_name: "gnext_dateassigned" };
            this.activityid = { name: "activityid", api_name: "activityid" };
            this.isregularactivity = { name: "isregularactivity", api_name: "isregularactivity" };
            this.gnext_starttimername = { name: "gnext_starttimername", api_name: "gnext_starttimername" };
            this.slainvokedidname = { name: "slainvokedidname", api_name: "slainvokedidname" };
            this.scheduledend = { name: "scheduledend", api_name: "scheduledend" };
            this.statuscode = { name: "statuscode", api_name: "statuscode" };
            this.statecodename = { name: "statecodename", api_name: "statecodename" };
            this.actualdurationminutes = { name: "actualdurationminutes", api_name: "actualdurationminutes" };
            this.subject = { name: "subject", api_name: "subject" };
            this.regardingobjecttypecode = { name: "regardingobjecttypecode", api_name: "regardingobjecttypecode" };
        }
        return taskAttributes;
    }());
    CRMTypeScriptAxios.taskAttributes = taskAttributes;
    /** @description Instantiates a Task Entity to be used for CRUD based operations
    * @param {object} initData An optional parameter for a create and update entities */
    var task = (function (_super) {
        __extends(task, _super);
        function task(initData) {
            var _this = _super.call(this, "tasks") || this;
            _this.route = "Tasks";
            if (initData == undefined) {
                return _this;
            }
            _this.id = initData.activityid;
            _this.isbilled = initData.isbilled;
            _this.prioritycodename = initData.prioritycodename;
            _this.createdon = initData.createdon;
            _this.gnext_taskstage = initData.gnext_taskstage;
            _this.gnext_duration = initData.gnext_duration;
            _this.statuscodename = initData.statuscodename;
            _this.traversedpath = initData.traversedpath;
            _this.isworkflowcreated = initData.isworkflowcreated;
            _this.owneridtype = initData.owneridtype;
            _this.crmtaskassigneduniqueid = initData.crmtaskassigneduniqueid;
            _this.modifiedbyname = initData.modifiedbyname;
            _this.onholdtime = initData.onholdtime;
            _this.owneridname = initData.owneridname;
            _this.prioritycode = initData.prioritycode;
            _this.scheduledstart = initData.scheduledstart;
            _this.actualstart = initData.actualstart;
            _this.subscriptionid = initData.subscriptionid;
            _this.exchangerate = initData.exchangerate;
            _this.subcategory = initData.subcategory;
            _this._regardingobjectid_value = initData._regardingobjectid_value;
            _this.statecode = initData.statecode;
            _this.gnext_classification = initData.gnext_classification;
            _this.gnext_actualend = initData.gnext_actualend;
            _this.gnext_classificationname = initData.gnext_classificationname;
            _this.activitytypecodename = initData.activitytypecodename;
            _this.regardingobjectidname = initData.regardingobjectidname;
            _this.activityadditionalparams = initData.activityadditionalparams;
            _this.activitytypecode = initData.activitytypecode;
            _this.isbilledname = initData.isbilledname;
            _this._slaid_value = initData._slaid_value;
            _this._ownerid_value = initData._ownerid_value;
            _this.isregularactivityname = initData.isregularactivityname;
            _this.scheduleddurationminutes = initData.scheduleddurationminutes;
            _this.category = initData.category;
            _this.processid = initData.processid;
            _this.description = initData.description;
            _this.slaname = initData.slaname;
            _this.gnext_starttimer = initData.gnext_starttimer;
            _this.createdbyname = initData.createdbyname;
            _this._owningteam_value = initData._owningteam_value;
            _this.sortdate = initData.sortdate;
            _this.isworkflowcreatedname = initData.isworkflowcreatedname;
            _this.gnext_tasktypename = initData.gnext_tasktypename;
            _this.lastonholdtime = initData.lastonholdtime;
            _this.stageid = initData.stageid;
            _this.gnext_taskstagename = initData.gnext_taskstagename;
            _this.modifiedon = initData.modifiedon;
            _this._transactioncurrencyid_value = initData._transactioncurrencyid_value;
            _this._slainvokedid_value = initData._slainvokedid_value;
            _this._createdby_value = initData._createdby_value;
            _this._modifiedby_value = initData._modifiedby_value;
            _this._gnext_tasktype_value = initData._gnext_tasktype_value;
            _this._serviceid_value = initData._serviceid_value;
            _this.percentcomplete = initData.percentcomplete;
            _this._owninguser_value = initData._owninguser_value;
            _this.transactioncurrencyidname = initData.transactioncurrencyidname;
            _this.actualend = initData.actualend;
            _this._owningbusinessunit_value = initData._owningbusinessunit_value;
            _this.gnext_dateassigned = initData.gnext_dateassigned;
            _this.activityid = initData.activityid;
            _this.isregularactivity = initData.isregularactivity;
            _this.gnext_starttimername = initData.gnext_starttimername;
            _this.slainvokedidname = initData.slainvokedidname;
            _this.scheduledend = initData.scheduledend;
            _this.statuscode = initData.statuscode;
            _this.statecodename = initData.statecodename;
            _this.actualdurationminutes = initData.actualdurationminutes;
            _this.subject = initData.subject;
            _this.regardingobjecttypecode = initData.regardingobjecttypecode;
            return _this;
        }
        return task;
    }(Entity));
    CRMTypeScriptAxios.task = task;
})(CRMTypeScriptAxios || (CRMTypeScriptAxios = {}));
//# sourceMappingURL=xrm.js.map