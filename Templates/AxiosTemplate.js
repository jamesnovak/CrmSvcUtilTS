/// <reference path="../scripts/typings/xrm/xrm.d.ts" />
/// <reference path="../scripts/typings/axios/index.d.ts" />
/** @description {#module_notes#}
 */
var removeme;
(function (removeme) {
    /** @description Specifies that Entities always have a url route and optionally have an id
     */
    var Entity = (function () {
        function Entity(route, id) {
            this.route = route;
            this.id = id;
        }
        return Entity;
    }());
    removeme.Entity = Entity;
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
    removeme.Utils = Utils;
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
    removeme.WebApi = WebApi;
})(removeme || (removeme = {}));
//# sourceMappingURL=AxiosTemplate.js.map