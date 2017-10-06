 
/** @description A CRM Typescript Project
 */  
module MCS.Account {
	/** @description Specifies that Entities always have a url route and optionally have an id
	 */  
	export abstract class Entity {
		constructor(public route: string, public id?: string) { }
	}

	/** @description Interface for retrieve multiple datasets in CRM
	 *  @type generic type that corresponds with the entity being returned
	 */ 
	export interface IRetrieveMultipleData<T> {
		'@odata.context': string,
		value: T[]
	}

	export interface IAttribName {
		name: string,
		api_name:string
	}

	/** @description Helper for utilizing parameters in the WebAPI angular service
	 */  
	export interface IParams {
		$select?: string;
		$filter?: string;
		$orderby?: string;
		$top?: string;
		$expand?: string;
		[key: string]: string;
	}
	export interface IWebApi {
		retrieve<T>(e: Entity, params?: IParams, formattedValues?: boolean): ng.IHttpPromise<T>;
		retrieveNext<T>(e: Entity, nextLinkUrl: string, formattedValues?: boolean): ng.IHttpPromise<T>;
		create<T>(e: Entity, formattedValues?: boolean, returnRecord?: boolean): ng.IHttpPromise<T>;
		retrieveMultiple<T>(e: Entity, params?: IParams, formattedValues?: boolean, returnRecord?: boolean): ng.IHttpPromise<T>;
		update<T>(e: Entity, route: string, id: string): ng.IHttpPromise<T>;
		remove<T>(e: Entity): ng.IHttpPromise<T>;
		fetch<T>(e: Entity, fetchXml: string, formattedValues?: boolean): ng.IHttpPromise<T>;
		setUrl(crmurl: string): void;
		getConfig(formattedValues?: boolean, returnRecord?: boolean): any;
	}
	
	export interface IUtils {
		formatDate(dateVal: string): string;
		getFormattedValue(entity:any, attribute:string): string;
		isNullUndefinedEmpty(value: any): boolean;
		padLeadingZeros(num: number, precision: number): string;
		cleanGuid(guid: string, removeDashes?: boolean): string;
		reopenForm(entityName: string, entityId: string): void;
	}

	export class Utils implements IUtils {

		/** Helper method for formatting js date
			@param {string} dateVal date to be formatted, in ISO date format
		**/
		formatDate(dateVal: string):string {

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
		}

		/**
		 * @description Retrieves the formatted value for an attribute
		 * @param {Entity} entity the entity containing the attribute
		 * @param {string} attribute name of the attribute being retrieved
		 */
		getFormattedValue(entity:any, attribute:string): string {
			var displayVal: string = null;

			if (entity[attribute] !== null) {
				displayVal = entity[attribute];

				var extendedField = attribute + "@OData.Community.Display.V1.FormattedValue";
				if (entity[extendedField] !== null) {
					displayVal = entity[extendedField];
				}
			}
			return displayVal;
		}

		/**
		 * Format a number string with leading zeroz
		 * @param num
		 * @param precision
		 */
		padLeadingZeros (num:number, precision:number):string {
			var s = "000000000" + num;
			return s.substr(s.length - precision);
		}

		/**
		 * check to see if a value is null or empty
		 */
		isNullUndefinedEmpty(value: any): boolean {
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
		}
		/**
		 * Clean brackets and dashes from a guid
		 */
		cleanGuid(guid: string, removeDashes?: boolean): string {
			guid = guid.replace("{", "").replace("}", "");

			if (removeDashes === true) {
				guid = guid.replace(/-/g, "");
			}
			return guid;
		}
		/**
		 * Re-opens the form causing a true refresh
		 */
		reopenForm(entityName: string, entityId: string): void {
			parent.Xrm.Utility.openEntityForm(entityName, entityId);
		}
	}

	/** @description An Angular WebAPI Service for Dynamics CRM  
	 * @property {string} BaseUrl The CRM org url + WebAPI endpoint 
	 * @return {object} Angular Service
	 */  
	export class WebApi implements IWebApi {
		private BaseUrl: string; 

		// a method for injecting angular1 components in typescript
		public static $inject = [
			'$http'
		];

		// when constructed we set the angular http service privately along with the methods necessary for CRUD operations
		constructor(private $http: ng.IHttpService) { }

		/** @description Required method that constructs the BaseUrl for the Service 
		 * @param {string} crmurl The crm org url 
		 **/  
		setUrl(crmurl: string) {
			this.BaseUrl = crmurl + "/api/data/v8.2/";
		}

		/** @description Performs a CRM WebAPI Retrieve
		 * @param {object} e The entity being retrieved 
		 * @param {object} params The optional parameters for the retrieve
		 * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
		 * @return {object} Http GET Promise
		 */  
		retrieve<T>(e: Entity, params?: IParams, formattedValues?: boolean) {
			// lets url be a concatenation of base url, entity route, and the entity id wrapped in CRM's flavor of WebAPI
			let url = this.BaseUrl + e.route + "(" + e.id + ")";
			// handles params if there are any
			if (params != undefined) url = this.addParams(url, params);
			if (formattedValues === true) {
				return this.$http.get<T>(url, this.getConfig(formattedValues));
			}
			else {
			return this.$http.get<T>(url);
		}
		}

		/** @description Performs a CRM WebAPI Retrieve for a nextLink URL on expanded attributes or collections
		 * @param {object} e The entity being retrieved 
		 * @param {string} nextLinkUrl the URL for the next retrieve 
		 * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
		 * @return {object} Http GET Promise
		 */
		retrieveNext<T>(e: Entity, nextLinkUrl: string, formattedValues?: boolean) {
			// handles params if there are any
			if (formattedValues === true) {
				return this.$http.get<T>(nextLinkUrl, this.getConfig(formattedValues));
			}
			else {
				return this.$http.get<T>(nextLinkUrl);
			}
		}

		/** @description Performs a CRM WebAPI Create
		 * @param {object} e The entity being created 
		 * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
		 * @param {boolean} returnRecord optional flag indicating whether to return an the updated record
		 * @return {object} Http POST Promise
		 */  
		create<T>(e: Entity, formattedValues?: boolean, returnRecord?: boolean) {
			// lets url be a concatenation of base url and route
			let url = this.BaseUrl + e.route;
			delete e.route;

			return this.$http.post<T>(url, e, this.getConfig(formattedValues, returnRecord));
		}

		/** @description Performs a CRM WebAPI RetrieveMultiple
		 * @param {object} e The entity being retrieved 
		 * @param {object} params The optional parameters for the retrieve
		 * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
		 * @return {object} Http GET Promise
		 **/ 
		retrieveMultiple<T>(e: Entity, params?: IParams, formattedValues?: boolean) {
			let url = this.BaseUrl + e.route;
			if (params != undefined) url = this.addParams(url, params);
			if (formattedValues === true) {
				return this.$http.get<T>(url, this.getConfig(formattedValues));
			}
			else {
			return this.$http.get<T>(url);
		}
		}

		/** @description Performs a CRM WebAPI Update
		* @param {object} e The entity being updated
		* @param {string} route the base route for the enity webapi query string
		* @param {string} id the ID of the entity being updated
		 * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
		 * @param {boolean} returnRecord optional flag indicating whether to return an the updated record
		* @return {object} Http PATCH Promise
		 */  
		update<T>(e: Entity, route: string, id: string, formattedValues?: boolean, returnRecord?: boolean ) {
			// ensure that no curly braces included
			id = new Utils().cleanGuid(id);
			let url = this.BaseUrl + route + "(" + id + ")";

			return this.$http.patch<T>(url, e, this.getConfig(formattedValues, returnRecord));
		}

		/** @description Performs a CRM WebAPI call using FetchXml as a query 
		 * @param {object} e The entity being updated
		 * @param {string} fetchXML fetch query being passed
		 * @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
		 * @return {object} Http PATCH Promise
		 */
		fetch<T>(e: Entity, fetchXml: string, formattedValues?: boolean) {
			// encode the fetch XML string so we can pass via a URL
			var fetchXmlEncoded = encodeURIComponent(fetchXml);
			
			let url = this.BaseUrl + e.route + "?fetchXml=" + fetchXmlEncoded;

			if (formattedValues === true) {
				return this.$http.get<T>(url, this.getConfig(formattedValues));
			}
			else {
				return this.$http.get<T>(url);
			}
		}

		/** @description Performs a CRM WebAPI Delete
		 * @param {object} e The entity being deleted 
		 * @return {object} Http DELETE Promise
		 */  
		remove<T>(e: Entity) {
			let url = this.BaseUrl + e.route;
			return this.$http.delete<T>(url);
		}

		/** @description Adds together parameters in an oData string
		 * @param {string} url The url string without params
		 * @param {object} params The parameters to be added to the url string
		 * @return {string} The url string with parameters
		 */  
		addParams(url: string, params: IParams): string {
			url += "?";
			angular.forEach(Object.keys(params), function (v, k) {
				if (k == 0 || k == this.length)
					url += v + '=' + params[v];
				else
					url += '&' + v + '=' + params[v];
			});
			return url;
		}

		/** @description build the additional headers configuration element that will be passed on the HTTP call
		* @param {boolean} formattedValues optional flag indicating whether to return formatted attibutes values
		* @param {boolean} returnRecord optional flag indicating whether to return an the updated record
		**/
		getConfig(formattedValues?:boolean, returnRecord?:boolean): any {
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
		} 
	}	  
	  

	//** @description AUTO GENERATED CLASSES FOR Account
	// ------------------------------------------------------------------------------------------
	//** @description WebAPI collection interface for Account */
	export interface IAccounts extends IRetrieveMultipleData<IAccount> {}

	//** @description WebAPI interface for Account */
	export interface IAccount {
		[key: string]: string | number 
		preferredcontactmethodcodename?: number
		emailaddress3?: string
		emailaddress2?: string
		emailaddress1?: string
		address1_city?: string
		_slaid_value?: string
		address1_longitude?: number
		address2_freighttermscodename?: number
		modifiedon?: string
		aging90?: number
		websiteurl?: string
		statuscodename?: number
		donotpostalmail?: string
		openrevenue?: number
		address1_addresstypecode?: string
		_transactioncurrencyid_value?: string
		sharesoutstanding?: number
		donotsendmm?: string
		primarycontactidname?: string
		creditonhold?: string
		transactioncurrencyidname?: string
		aging30?: number
		donotbulkpostalmail?: string
		address1_shippingmethodcode?: string
		_slainvokedid_value?: string
		opendeals_date?: string
		businesstypecodename?: number
		_originatingleadid_value?: string
		masteraccountidname?: string
		preferredsystemuseridname?: string
		accountcategorycode?: string
		preferredappointmentdaycodename?: number
		address2_stateorprovince?: string
		participatesinworkflowname?: number
		_territoryid_value?: string
		address2_country?: string
		accountcategorycodename?: number
		address2_line2?: string
		aging60_base?: number
		address1_line3?: string
		onholdtime?: number
		address1_freighttermscode?: string
		creditlimit?: number
		openrevenue_base?: number
		parentaccountidname?: string
		originatingleadidname?: string
		address1_utcoffset?: number
		preferredappointmenttimecode?: string
		donotsendmarketingmaterialname?: number
		numberofemployees?: number
		modifiedbyexternalpartyname?: string
		statecodename?: number
		accountclassificationcode?: string
		revenue?: number
		customertypecode?: string
		donotbulkpostalmailname?: number
		exchangerate?: number
		address2_county?: string
		isprivate?: string
		_primarycontactid_value?: string
		donotpostalmailname?: number
		telephone3?: string
		_parentaccountid_value?: string
		address2_city?: string
		statuscode?: string
		address1_addresstypecodename?: number
		address2_latitude?: number
		createdon?: string
		donotbulkemail?: string
		address2_line1?: string
		donotfax?: string
		marketcap?: number
		address1_composite?: string
		ownershipcode?: string
		opendeals_state?: number
		_owningbusinessunit_value?: string
		preferredappointmenttimecodename?: number
		address2_postalcode?: string
		lastusedincampaign?: string
		paymenttermscodename?: number
		industrycodename?: number
		processid?: string
		entityimage_url?: string
		address2_shippingmethodcodename?: number
		address2_line3?: string
		description?: string
		_modifiedby_value?: string
		address1_county?: string
		createdbyname?: string
		shippingmethodcodename?: number
		address1_line1?: string
		donotemail?: string
		territorycode?: string
		donotphonename?: number
		address2_postofficebox?: string
		address2_telephone1?: string
		address2_telephone2?: string
		address2_telephone3?: string
		aging60?: number
		address1_addressid?: string
		traversedpath?: string
		territoryidname?: string
		territorycodename?: number
		followemailname?: number
		_owninguser_value?: string
		industrycode?: string
		address2_name?: string
		openrevenue_state?: number
		primarysatoriid?: string
		name?: string
		entityimageid?: string
		donotphone?: string
		timespentbymeonemailandmeetings?: string
		businesstypecode?: string
		primarytwitterid?: string
		owneridname?: string
		entityimage?: number
		entityimage_timestamp?: number
		_createdbyexternalparty_value?: string
		address2_composite?: string
		accountratingcodename?: number
		shippingmethodcode?: string
		address1_country?: string
		customertypecodename?: number
		_owningteam_value?: string
		address1_stateorprovince?: string
		isprivatename?: number
		paymenttermscode?: string
		marketingonly?: string
		creditonholdname?: number
		_preferredequipmentid_value?: string
		address1_freighttermscodename?: number
		marketingonlyname?: number
		accountratingcode?: string
		address1_telephone1?: string
		address1_telephone2?: string
		address1_telephone3?: string
		address1_postofficebox?: string
		_msa_managingpartnerid_value?: string
		customersizecodename?: number
		donotemailname?: number
		slainvokedidname?: string
		fax?: string
		_masterid_value?: string
		sic?: string
		_ownerid_value?: string
		address2_utcoffset?: number
		stageid?: string
		accountnumber?: string
		creditlimit_base?: number
		address2_fax?: string
		revenue_base?: number
		merged?: string
		owneridtype?: string
		address2_longitude?: number
		_modifiedbyexternalparty_value?: string
		_defaultpricelevelid_value?: string
		ftpsiteurl?: string
		preferredequipmentidname?: string
		aging90_base?: number
		defaultpricelevelidname?: string
		address1_shippingmethodcodename?: number
		address1_primarycontactname?: string
		lastonholdtime?: string
		address1_line2?: string
		_createdby_value?: string
		address2_addresstypecode?: string
		openrevenue_date?: string
		address2_upszone?: string
		followemail?: string
		donotfaxname?: number
		marketcap_base?: number
		address2_addresstypecodename?: number
		ownershipcodename?: number
		address1_postalcode?: string
		tickersymbol?: string
		customersizecode?: string
		preferredserviceidname?: string
		createdbyexternalpartyname?: string
		donotbulkemailname?: number
		participatesinworkflow?: string
		stockexchange?: string
		_preferredserviceid_value?: string
		preferredcontactmethodcode?: string
		telephone2?: string
		mergedname?: number
		msa_managingpartneridname?: string
		_preferredsystemuserid_value?: string
		accountid?: string
		telephone1?: string
		aging30_base?: number
		address1_name?: string
		address1_fax?: string
		address1_latitude?: number
		address2_shippingmethodcode?: string
		accountclassificationcodename?: number
		preferredappointmentdaycode?: string
		modifiedbyname?: string
		address2_freighttermscode?: string
		address1_upszone?: string
		address2_addressid?: string
		slaname?: string
		address2_primarycontactname?: string
		opendeals?: number
		statecode?: number

  }
  
  //** Collection of Attribute structures for Account */
  export class AccountAttributes {
 
		preferredcontactmethodcodename: IAttribName = { name:"preferredcontactmethodcodename", api_name:"preferredcontactmethodcodename" } 
		emailaddress3: IAttribName = { name:"emailaddress3", api_name:"emailaddress3" } 
		emailaddress2: IAttribName = { name:"emailaddress2", api_name:"emailaddress2" } 
		emailaddress1: IAttribName = { name:"emailaddress1", api_name:"emailaddress1" } 
		address1_city: IAttribName = { name:"address1_city", api_name:"address1_city" } 
		slaid: IAttribName = { name:"slaid", api_name:"_slaid_value" } 
		address1_longitude: IAttribName = { name:"address1_longitude", api_name:"address1_longitude" } 
		address2_freighttermscodename: IAttribName = { name:"address2_freighttermscodename", api_name:"address2_freighttermscodename" } 
		modifiedon: IAttribName = { name:"modifiedon", api_name:"modifiedon" } 
		aging90: IAttribName = { name:"aging90", api_name:"aging90" } 
		websiteurl: IAttribName = { name:"websiteurl", api_name:"websiteurl" } 
		statuscodename: IAttribName = { name:"statuscodename", api_name:"statuscodename" } 
		donotpostalmail: IAttribName = { name:"donotpostalmail", api_name:"donotpostalmail" } 
		openrevenue: IAttribName = { name:"openrevenue", api_name:"openrevenue" } 
		address1_addresstypecode: IAttribName = { name:"address1_addresstypecode", api_name:"address1_addresstypecode" } 
		transactioncurrencyid: IAttribName = { name:"transactioncurrencyid", api_name:"_transactioncurrencyid_value" } 
		sharesoutstanding: IAttribName = { name:"sharesoutstanding", api_name:"sharesoutstanding" } 
		donotsendmm: IAttribName = { name:"donotsendmm", api_name:"donotsendmm" } 
		primarycontactidname: IAttribName = { name:"primarycontactidname", api_name:"primarycontactidname" } 
		creditonhold: IAttribName = { name:"creditonhold", api_name:"creditonhold" } 
		transactioncurrencyidname: IAttribName = { name:"transactioncurrencyidname", api_name:"transactioncurrencyidname" } 
		aging30: IAttribName = { name:"aging30", api_name:"aging30" } 
		donotbulkpostalmail: IAttribName = { name:"donotbulkpostalmail", api_name:"donotbulkpostalmail" } 
		address1_shippingmethodcode: IAttribName = { name:"address1_shippingmethodcode", api_name:"address1_shippingmethodcode" } 
		slainvokedid: IAttribName = { name:"slainvokedid", api_name:"_slainvokedid_value" } 
		opendeals_date: IAttribName = { name:"opendeals_date", api_name:"opendeals_date" } 
		businesstypecodename: IAttribName = { name:"businesstypecodename", api_name:"businesstypecodename" } 
		originatingleadid: IAttribName = { name:"originatingleadid", api_name:"_originatingleadid_value" } 
		masteraccountidname: IAttribName = { name:"masteraccountidname", api_name:"masteraccountidname" } 
		preferredsystemuseridname: IAttribName = { name:"preferredsystemuseridname", api_name:"preferredsystemuseridname" } 
		accountcategorycode: IAttribName = { name:"accountcategorycode", api_name:"accountcategorycode" } 
		preferredappointmentdaycodename: IAttribName = { name:"preferredappointmentdaycodename", api_name:"preferredappointmentdaycodename" } 
		address2_stateorprovince: IAttribName = { name:"address2_stateorprovince", api_name:"address2_stateorprovince" } 
		participatesinworkflowname: IAttribName = { name:"participatesinworkflowname", api_name:"participatesinworkflowname" } 
		territoryid: IAttribName = { name:"territoryid", api_name:"_territoryid_value" } 
		address2_country: IAttribName = { name:"address2_country", api_name:"address2_country" } 
		accountcategorycodename: IAttribName = { name:"accountcategorycodename", api_name:"accountcategorycodename" } 
		address2_line2: IAttribName = { name:"address2_line2", api_name:"address2_line2" } 
		aging60_base: IAttribName = { name:"aging60_base", api_name:"aging60_base" } 
		address1_line3: IAttribName = { name:"address1_line3", api_name:"address1_line3" } 
		onholdtime: IAttribName = { name:"onholdtime", api_name:"onholdtime" } 
		address1_freighttermscode: IAttribName = { name:"address1_freighttermscode", api_name:"address1_freighttermscode" } 
		creditlimit: IAttribName = { name:"creditlimit", api_name:"creditlimit" } 
		openrevenue_base: IAttribName = { name:"openrevenue_base", api_name:"openrevenue_base" } 
		parentaccountidname: IAttribName = { name:"parentaccountidname", api_name:"parentaccountidname" } 
		originatingleadidname: IAttribName = { name:"originatingleadidname", api_name:"originatingleadidname" } 
		address1_utcoffset: IAttribName = { name:"address1_utcoffset", api_name:"address1_utcoffset" } 
		preferredappointmenttimecode: IAttribName = { name:"preferredappointmenttimecode", api_name:"preferredappointmenttimecode" } 
		donotsendmarketingmaterialname: IAttribName = { name:"donotsendmarketingmaterialname", api_name:"donotsendmarketingmaterialname" } 
		numberofemployees: IAttribName = { name:"numberofemployees", api_name:"numberofemployees" } 
		modifiedbyexternalpartyname: IAttribName = { name:"modifiedbyexternalpartyname", api_name:"modifiedbyexternalpartyname" } 
		statecodename: IAttribName = { name:"statecodename", api_name:"statecodename" } 
		accountclassificationcode: IAttribName = { name:"accountclassificationcode", api_name:"accountclassificationcode" } 
		revenue: IAttribName = { name:"revenue", api_name:"revenue" } 
		customertypecode: IAttribName = { name:"customertypecode", api_name:"customertypecode" } 
		donotbulkpostalmailname: IAttribName = { name:"donotbulkpostalmailname", api_name:"donotbulkpostalmailname" } 
		exchangerate: IAttribName = { name:"exchangerate", api_name:"exchangerate" } 
		address2_county: IAttribName = { name:"address2_county", api_name:"address2_county" } 
		isprivate: IAttribName = { name:"isprivate", api_name:"isprivate" } 
		primarycontactid: IAttribName = { name:"primarycontactid", api_name:"_primarycontactid_value" } 
		donotpostalmailname: IAttribName = { name:"donotpostalmailname", api_name:"donotpostalmailname" } 
		telephone3: IAttribName = { name:"telephone3", api_name:"telephone3" } 
		parentaccountid: IAttribName = { name:"parentaccountid", api_name:"_parentaccountid_value" } 
		address2_city: IAttribName = { name:"address2_city", api_name:"address2_city" } 
		statuscode: IAttribName = { name:"statuscode", api_name:"statuscode" } 
		address1_addresstypecodename: IAttribName = { name:"address1_addresstypecodename", api_name:"address1_addresstypecodename" } 
		address2_latitude: IAttribName = { name:"address2_latitude", api_name:"address2_latitude" } 
		createdon: IAttribName = { name:"createdon", api_name:"createdon" } 
		donotbulkemail: IAttribName = { name:"donotbulkemail", api_name:"donotbulkemail" } 
		address2_line1: IAttribName = { name:"address2_line1", api_name:"address2_line1" } 
		donotfax: IAttribName = { name:"donotfax", api_name:"donotfax" } 
		marketcap: IAttribName = { name:"marketcap", api_name:"marketcap" } 
		address1_composite: IAttribName = { name:"address1_composite", api_name:"address1_composite" } 
		ownershipcode: IAttribName = { name:"ownershipcode", api_name:"ownershipcode" } 
		opendeals_state: IAttribName = { name:"opendeals_state", api_name:"opendeals_state" } 
		owningbusinessunit: IAttribName = { name:"owningbusinessunit", api_name:"_owningbusinessunit_value" } 
		preferredappointmenttimecodename: IAttribName = { name:"preferredappointmenttimecodename", api_name:"preferredappointmenttimecodename" } 
		address2_postalcode: IAttribName = { name:"address2_postalcode", api_name:"address2_postalcode" } 
		lastusedincampaign: IAttribName = { name:"lastusedincampaign", api_name:"lastusedincampaign" } 
		paymenttermscodename: IAttribName = { name:"paymenttermscodename", api_name:"paymenttermscodename" } 
		industrycodename: IAttribName = { name:"industrycodename", api_name:"industrycodename" } 
		processid: IAttribName = { name:"processid", api_name:"processid" } 
		entityimage_url: IAttribName = { name:"entityimage_url", api_name:"entityimage_url" } 
		address2_shippingmethodcodename: IAttribName = { name:"address2_shippingmethodcodename", api_name:"address2_shippingmethodcodename" } 
		address2_line3: IAttribName = { name:"address2_line3", api_name:"address2_line3" } 
		description: IAttribName = { name:"description", api_name:"description" } 
		modifiedby: IAttribName = { name:"modifiedby", api_name:"_modifiedby_value" } 
		address1_county: IAttribName = { name:"address1_county", api_name:"address1_county" } 
		createdbyname: IAttribName = { name:"createdbyname", api_name:"createdbyname" } 
		shippingmethodcodename: IAttribName = { name:"shippingmethodcodename", api_name:"shippingmethodcodename" } 
		address1_line1: IAttribName = { name:"address1_line1", api_name:"address1_line1" } 
		donotemail: IAttribName = { name:"donotemail", api_name:"donotemail" } 
		territorycode: IAttribName = { name:"territorycode", api_name:"territorycode" } 
		donotphonename: IAttribName = { name:"donotphonename", api_name:"donotphonename" } 
		address2_postofficebox: IAttribName = { name:"address2_postofficebox", api_name:"address2_postofficebox" } 
		address2_telephone1: IAttribName = { name:"address2_telephone1", api_name:"address2_telephone1" } 
		address2_telephone2: IAttribName = { name:"address2_telephone2", api_name:"address2_telephone2" } 
		address2_telephone3: IAttribName = { name:"address2_telephone3", api_name:"address2_telephone3" } 
		aging60: IAttribName = { name:"aging60", api_name:"aging60" } 
		address1_addressid: IAttribName = { name:"address1_addressid", api_name:"address1_addressid" } 
		traversedpath: IAttribName = { name:"traversedpath", api_name:"traversedpath" } 
		territoryidname: IAttribName = { name:"territoryidname", api_name:"territoryidname" } 
		territorycodename: IAttribName = { name:"territorycodename", api_name:"territorycodename" } 
		followemailname: IAttribName = { name:"followemailname", api_name:"followemailname" } 
		owninguser: IAttribName = { name:"owninguser", api_name:"_owninguser_value" } 
		industrycode: IAttribName = { name:"industrycode", api_name:"industrycode" } 
		address2_name: IAttribName = { name:"address2_name", api_name:"address2_name" } 
		openrevenue_state: IAttribName = { name:"openrevenue_state", api_name:"openrevenue_state" } 
		primarysatoriid: IAttribName = { name:"primarysatoriid", api_name:"primarysatoriid" } 
		name: IAttribName = { name:"name", api_name:"name" } 
		entityimageid: IAttribName = { name:"entityimageid", api_name:"entityimageid" } 
		donotphone: IAttribName = { name:"donotphone", api_name:"donotphone" } 
		timespentbymeonemailandmeetings: IAttribName = { name:"timespentbymeonemailandmeetings", api_name:"timespentbymeonemailandmeetings" } 
		businesstypecode: IAttribName = { name:"businesstypecode", api_name:"businesstypecode" } 
		primarytwitterid: IAttribName = { name:"primarytwitterid", api_name:"primarytwitterid" } 
		owneridname: IAttribName = { name:"owneridname", api_name:"owneridname" } 
		entityimage: IAttribName = { name:"entityimage", api_name:"entityimage" } 
		entityimage_timestamp: IAttribName = { name:"entityimage_timestamp", api_name:"entityimage_timestamp" } 
		createdbyexternalparty: IAttribName = { name:"createdbyexternalparty", api_name:"_createdbyexternalparty_value" } 
		address2_composite: IAttribName = { name:"address2_composite", api_name:"address2_composite" } 
		accountratingcodename: IAttribName = { name:"accountratingcodename", api_name:"accountratingcodename" } 
		shippingmethodcode: IAttribName = { name:"shippingmethodcode", api_name:"shippingmethodcode" } 
		address1_country: IAttribName = { name:"address1_country", api_name:"address1_country" } 
		customertypecodename: IAttribName = { name:"customertypecodename", api_name:"customertypecodename" } 
		owningteam: IAttribName = { name:"owningteam", api_name:"_owningteam_value" } 
		address1_stateorprovince: IAttribName = { name:"address1_stateorprovince", api_name:"address1_stateorprovince" } 
		isprivatename: IAttribName = { name:"isprivatename", api_name:"isprivatename" } 
		paymenttermscode: IAttribName = { name:"paymenttermscode", api_name:"paymenttermscode" } 
		marketingonly: IAttribName = { name:"marketingonly", api_name:"marketingonly" } 
		creditonholdname: IAttribName = { name:"creditonholdname", api_name:"creditonholdname" } 
		preferredequipmentid: IAttribName = { name:"preferredequipmentid", api_name:"_preferredequipmentid_value" } 
		address1_freighttermscodename: IAttribName = { name:"address1_freighttermscodename", api_name:"address1_freighttermscodename" } 
		marketingonlyname: IAttribName = { name:"marketingonlyname", api_name:"marketingonlyname" } 
		accountratingcode: IAttribName = { name:"accountratingcode", api_name:"accountratingcode" } 
		address1_telephone1: IAttribName = { name:"address1_telephone1", api_name:"address1_telephone1" } 
		address1_telephone2: IAttribName = { name:"address1_telephone2", api_name:"address1_telephone2" } 
		address1_telephone3: IAttribName = { name:"address1_telephone3", api_name:"address1_telephone3" } 
		address1_postofficebox: IAttribName = { name:"address1_postofficebox", api_name:"address1_postofficebox" } 
		msa_managingpartnerid: IAttribName = { name:"msa_managingpartnerid", api_name:"_msa_managingpartnerid_value" } 
		customersizecodename: IAttribName = { name:"customersizecodename", api_name:"customersizecodename" } 
		donotemailname: IAttribName = { name:"donotemailname", api_name:"donotemailname" } 
		slainvokedidname: IAttribName = { name:"slainvokedidname", api_name:"slainvokedidname" } 
		fax: IAttribName = { name:"fax", api_name:"fax" } 
		masterid: IAttribName = { name:"masterid", api_name:"_masterid_value" } 
		sic: IAttribName = { name:"sic", api_name:"sic" } 
		ownerid: IAttribName = { name:"ownerid", api_name:"_ownerid_value" } 
		address2_utcoffset: IAttribName = { name:"address2_utcoffset", api_name:"address2_utcoffset" } 
		stageid: IAttribName = { name:"stageid", api_name:"stageid" } 
		accountnumber: IAttribName = { name:"accountnumber", api_name:"accountnumber" } 
		creditlimit_base: IAttribName = { name:"creditlimit_base", api_name:"creditlimit_base" } 
		address2_fax: IAttribName = { name:"address2_fax", api_name:"address2_fax" } 
		revenue_base: IAttribName = { name:"revenue_base", api_name:"revenue_base" } 
		merged: IAttribName = { name:"merged", api_name:"merged" } 
		owneridtype: IAttribName = { name:"owneridtype", api_name:"owneridtype" } 
		address2_longitude: IAttribName = { name:"address2_longitude", api_name:"address2_longitude" } 
		modifiedbyexternalparty: IAttribName = { name:"modifiedbyexternalparty", api_name:"_modifiedbyexternalparty_value" } 
		defaultpricelevelid: IAttribName = { name:"defaultpricelevelid", api_name:"_defaultpricelevelid_value" } 
		ftpsiteurl: IAttribName = { name:"ftpsiteurl", api_name:"ftpsiteurl" } 
		preferredequipmentidname: IAttribName = { name:"preferredequipmentidname", api_name:"preferredequipmentidname" } 
		aging90_base: IAttribName = { name:"aging90_base", api_name:"aging90_base" } 
		defaultpricelevelidname: IAttribName = { name:"defaultpricelevelidname", api_name:"defaultpricelevelidname" } 
		address1_shippingmethodcodename: IAttribName = { name:"address1_shippingmethodcodename", api_name:"address1_shippingmethodcodename" } 
		address1_primarycontactname: IAttribName = { name:"address1_primarycontactname", api_name:"address1_primarycontactname" } 
		lastonholdtime: IAttribName = { name:"lastonholdtime", api_name:"lastonholdtime" } 
		address1_line2: IAttribName = { name:"address1_line2", api_name:"address1_line2" } 
		createdby: IAttribName = { name:"createdby", api_name:"_createdby_value" } 
		address2_addresstypecode: IAttribName = { name:"address2_addresstypecode", api_name:"address2_addresstypecode" } 
		openrevenue_date: IAttribName = { name:"openrevenue_date", api_name:"openrevenue_date" } 
		address2_upszone: IAttribName = { name:"address2_upszone", api_name:"address2_upszone" } 
		followemail: IAttribName = { name:"followemail", api_name:"followemail" } 
		donotfaxname: IAttribName = { name:"donotfaxname", api_name:"donotfaxname" } 
		marketcap_base: IAttribName = { name:"marketcap_base", api_name:"marketcap_base" } 
		address2_addresstypecodename: IAttribName = { name:"address2_addresstypecodename", api_name:"address2_addresstypecodename" } 
		ownershipcodename: IAttribName = { name:"ownershipcodename", api_name:"ownershipcodename" } 
		address1_postalcode: IAttribName = { name:"address1_postalcode", api_name:"address1_postalcode" } 
		tickersymbol: IAttribName = { name:"tickersymbol", api_name:"tickersymbol" } 
		customersizecode: IAttribName = { name:"customersizecode", api_name:"customersizecode" } 
		preferredserviceidname: IAttribName = { name:"preferredserviceidname", api_name:"preferredserviceidname" } 
		createdbyexternalpartyname: IAttribName = { name:"createdbyexternalpartyname", api_name:"createdbyexternalpartyname" } 
		donotbulkemailname: IAttribName = { name:"donotbulkemailname", api_name:"donotbulkemailname" } 
		participatesinworkflow: IAttribName = { name:"participatesinworkflow", api_name:"participatesinworkflow" } 
		stockexchange: IAttribName = { name:"stockexchange", api_name:"stockexchange" } 
		preferredserviceid: IAttribName = { name:"preferredserviceid", api_name:"_preferredserviceid_value" } 
		preferredcontactmethodcode: IAttribName = { name:"preferredcontactmethodcode", api_name:"preferredcontactmethodcode" } 
		telephone2: IAttribName = { name:"telephone2", api_name:"telephone2" } 
		mergedname: IAttribName = { name:"mergedname", api_name:"mergedname" } 
		msa_managingpartneridname: IAttribName = { name:"msa_managingpartneridname", api_name:"msa_managingpartneridname" } 
		preferredsystemuserid: IAttribName = { name:"preferredsystemuserid", api_name:"_preferredsystemuserid_value" } 
		accountid: IAttribName = { name:"accountid", api_name:"accountid" } 
		telephone1: IAttribName = { name:"telephone1", api_name:"telephone1" } 
		aging30_base: IAttribName = { name:"aging30_base", api_name:"aging30_base" } 
		address1_name: IAttribName = { name:"address1_name", api_name:"address1_name" } 
		address1_fax: IAttribName = { name:"address1_fax", api_name:"address1_fax" } 
		address1_latitude: IAttribName = { name:"address1_latitude", api_name:"address1_latitude" } 
		address2_shippingmethodcode: IAttribName = { name:"address2_shippingmethodcode", api_name:"address2_shippingmethodcode" } 
		accountclassificationcodename: IAttribName = { name:"accountclassificationcodename", api_name:"accountclassificationcodename" } 
		preferredappointmentdaycode: IAttribName = { name:"preferredappointmentdaycode", api_name:"preferredappointmentdaycode" } 
		modifiedbyname: IAttribName = { name:"modifiedbyname", api_name:"modifiedbyname" } 
		address2_freighttermscode: IAttribName = { name:"address2_freighttermscode", api_name:"address2_freighttermscode" } 
		address1_upszone: IAttribName = { name:"address1_upszone", api_name:"address1_upszone" } 
		address2_addressid: IAttribName = { name:"address2_addressid", api_name:"address2_addressid" } 
		slaname: IAttribName = { name:"slaname", api_name:"slaname" } 
		address2_primarycontactname: IAttribName = { name:"address2_primarycontactname", api_name:"address2_primarycontactname" } 
		opendeals: IAttribName = { name:"opendeals", api_name:"opendeals" } 
		statecode: IAttribName = { name:"statecode", api_name:"statecode" } 

	}

  /** @description Instantiates a Account Entity to be used for CRUD based operations
  * @param {object} initData An optional parameter for a create and update entities */
  export class Account extends Entity {
		[key: string]: string | number
		public route: string = "Accounts";
 
		public preferredcontactmethodcodename:number;
		public emailaddress3:string;
		public emailaddress2:string;
		public emailaddress1:string;
		public address1_city:string;
		public _slaid_value:string;
		public address1_longitude:number;
		public address2_freighttermscodename:number;
		public modifiedon:string;
		public aging90:number;
		public websiteurl:string;
		public statuscodename:number;
		public donotpostalmail:string;
		public openrevenue:number;
		public address1_addresstypecode:string;
		public _transactioncurrencyid_value:string;
		public sharesoutstanding:number;
		public donotsendmm:string;
		public primarycontactidname:string;
		public creditonhold:string;
		public transactioncurrencyidname:string;
		public aging30:number;
		public donotbulkpostalmail:string;
		public address1_shippingmethodcode:string;
		public _slainvokedid_value:string;
		public opendeals_date:string;
		public businesstypecodename:number;
		public _originatingleadid_value:string;
		public masteraccountidname:string;
		public preferredsystemuseridname:string;
		public accountcategorycode:string;
		public preferredappointmentdaycodename:number;
		public address2_stateorprovince:string;
		public participatesinworkflowname:number;
		public _territoryid_value:string;
		public address2_country:string;
		public accountcategorycodename:number;
		public address2_line2:string;
		public aging60_base:number;
		public address1_line3:string;
		public onholdtime:number;
		public address1_freighttermscode:string;
		public creditlimit:number;
		public openrevenue_base:number;
		public parentaccountidname:string;
		public originatingleadidname:string;
		public address1_utcoffset:number;
		public preferredappointmenttimecode:string;
		public donotsendmarketingmaterialname:number;
		public numberofemployees:number;
		public modifiedbyexternalpartyname:string;
		public statecodename:number;
		public accountclassificationcode:string;
		public revenue:number;
		public customertypecode:string;
		public donotbulkpostalmailname:number;
		public exchangerate:number;
		public address2_county:string;
		public isprivate:string;
		public _primarycontactid_value:string;
		public donotpostalmailname:number;
		public telephone3:string;
		public _parentaccountid_value:string;
		public address2_city:string;
		public statuscode:string;
		public address1_addresstypecodename:number;
		public address2_latitude:number;
		public createdon:string;
		public donotbulkemail:string;
		public address2_line1:string;
		public donotfax:string;
		public marketcap:number;
		public address1_composite:string;
		public ownershipcode:string;
		public opendeals_state:number;
		public _owningbusinessunit_value:string;
		public preferredappointmenttimecodename:number;
		public address2_postalcode:string;
		public lastusedincampaign:string;
		public paymenttermscodename:number;
		public industrycodename:number;
		public processid:string;
		public entityimage_url:string;
		public address2_shippingmethodcodename:number;
		public address2_line3:string;
		public description:string;
		public _modifiedby_value:string;
		public address1_county:string;
		public createdbyname:string;
		public shippingmethodcodename:number;
		public address1_line1:string;
		public donotemail:string;
		public territorycode:string;
		public donotphonename:number;
		public address2_postofficebox:string;
		public address2_telephone1:string;
		public address2_telephone2:string;
		public address2_telephone3:string;
		public aging60:number;
		public address1_addressid:string;
		public traversedpath:string;
		public territoryidname:string;
		public territorycodename:number;
		public followemailname:number;
		public _owninguser_value:string;
		public industrycode:string;
		public address2_name:string;
		public openrevenue_state:number;
		public primarysatoriid:string;
		public name:string;
		public entityimageid:string;
		public donotphone:string;
		public timespentbymeonemailandmeetings:string;
		public businesstypecode:string;
		public primarytwitterid:string;
		public owneridname:string;
		public entityimage:number;
		public entityimage_timestamp:number;
		public _createdbyexternalparty_value:string;
		public address2_composite:string;
		public accountratingcodename:number;
		public shippingmethodcode:string;
		public address1_country:string;
		public customertypecodename:number;
		public _owningteam_value:string;
		public address1_stateorprovince:string;
		public isprivatename:number;
		public paymenttermscode:string;
		public marketingonly:string;
		public creditonholdname:number;
		public _preferredequipmentid_value:string;
		public address1_freighttermscodename:number;
		public marketingonlyname:number;
		public accountratingcode:string;
		public address1_telephone1:string;
		public address1_telephone2:string;
		public address1_telephone3:string;
		public address1_postofficebox:string;
		public _msa_managingpartnerid_value:string;
		public customersizecodename:number;
		public donotemailname:number;
		public slainvokedidname:string;
		public fax:string;
		public _masterid_value:string;
		public sic:string;
		public _ownerid_value:string;
		public address2_utcoffset:number;
		public stageid:string;
		public accountnumber:string;
		public creditlimit_base:number;
		public address2_fax:string;
		public revenue_base:number;
		public merged:string;
		public owneridtype:string;
		public address2_longitude:number;
		public _modifiedbyexternalparty_value:string;
		public _defaultpricelevelid_value:string;
		public ftpsiteurl:string;
		public preferredequipmentidname:string;
		public aging90_base:number;
		public defaultpricelevelidname:string;
		public address1_shippingmethodcodename:number;
		public address1_primarycontactname:string;
		public lastonholdtime:string;
		public address1_line2:string;
		public _createdby_value:string;
		public address2_addresstypecode:string;
		public openrevenue_date:string;
		public address2_upszone:string;
		public followemail:string;
		public donotfaxname:number;
		public marketcap_base:number;
		public address2_addresstypecodename:number;
		public ownershipcodename:number;
		public address1_postalcode:string;
		public tickersymbol:string;
		public customersizecode:string;
		public preferredserviceidname:string;
		public createdbyexternalpartyname:string;
		public donotbulkemailname:number;
		public participatesinworkflow:string;
		public stockexchange:string;
		public _preferredserviceid_value:string;
		public preferredcontactmethodcode:string;
		public telephone2:string;
		public mergedname:number;
		public msa_managingpartneridname:string;
		public _preferredsystemuserid_value:string;
		public accountid:string;
		public telephone1:string;
		public aging30_base:number;
		public address1_name:string;
		public address1_fax:string;
		public address1_latitude:number;
		public address2_shippingmethodcode:string;
		public accountclassificationcodename:number;
		public preferredappointmentdaycode:string;
		public modifiedbyname:string;
		public address2_freighttermscode:string;
		public address1_upszone:string;
		public address2_addressid:string;
		public slaname:string;
		public address2_primarycontactname:string;
		public opendeals:number;
		public statecode:number;

		constructor(initData?: IAccount) {
			super("accounts");
			if (initData == undefined) { return; } 
      
			this.id = initData.accountid;
			this.preferredcontactmethodcodename = initData.preferredcontactmethodcodename;
			this.emailaddress3 = initData.emailaddress3;
			this.emailaddress2 = initData.emailaddress2;
			this.emailaddress1 = initData.emailaddress1;
			this.address1_city = initData.address1_city;
			this._slaid_value = initData._slaid_value;
			this.address1_longitude = initData.address1_longitude;
			this.address2_freighttermscodename = initData.address2_freighttermscodename;
			this.modifiedon = initData.modifiedon;
			this.aging90 = initData.aging90;
			this.websiteurl = initData.websiteurl;
			this.statuscodename = initData.statuscodename;
			this.donotpostalmail = initData.donotpostalmail;
			this.openrevenue = initData.openrevenue;
			this.address1_addresstypecode = initData.address1_addresstypecode;
			this._transactioncurrencyid_value = initData._transactioncurrencyid_value;
			this.sharesoutstanding = initData.sharesoutstanding;
			this.donotsendmm = initData.donotsendmm;
			this.primarycontactidname = initData.primarycontactidname;
			this.creditonhold = initData.creditonhold;
			this.transactioncurrencyidname = initData.transactioncurrencyidname;
			this.aging30 = initData.aging30;
			this.donotbulkpostalmail = initData.donotbulkpostalmail;
			this.address1_shippingmethodcode = initData.address1_shippingmethodcode;
			this._slainvokedid_value = initData._slainvokedid_value;
			this.opendeals_date = initData.opendeals_date;
			this.businesstypecodename = initData.businesstypecodename;
			this._originatingleadid_value = initData._originatingleadid_value;
			this.masteraccountidname = initData.masteraccountidname;
			this.preferredsystemuseridname = initData.preferredsystemuseridname;
			this.accountcategorycode = initData.accountcategorycode;
			this.preferredappointmentdaycodename = initData.preferredappointmentdaycodename;
			this.address2_stateorprovince = initData.address2_stateorprovince;
			this.participatesinworkflowname = initData.participatesinworkflowname;
			this._territoryid_value = initData._territoryid_value;
			this.address2_country = initData.address2_country;
			this.accountcategorycodename = initData.accountcategorycodename;
			this.address2_line2 = initData.address2_line2;
			this.aging60_base = initData.aging60_base;
			this.address1_line3 = initData.address1_line3;
			this.onholdtime = initData.onholdtime;
			this.address1_freighttermscode = initData.address1_freighttermscode;
			this.creditlimit = initData.creditlimit;
			this.openrevenue_base = initData.openrevenue_base;
			this.parentaccountidname = initData.parentaccountidname;
			this.originatingleadidname = initData.originatingleadidname;
			this.address1_utcoffset = initData.address1_utcoffset;
			this.preferredappointmenttimecode = initData.preferredappointmenttimecode;
			this.donotsendmarketingmaterialname = initData.donotsendmarketingmaterialname;
			this.numberofemployees = initData.numberofemployees;
			this.modifiedbyexternalpartyname = initData.modifiedbyexternalpartyname;
			this.statecodename = initData.statecodename;
			this.accountclassificationcode = initData.accountclassificationcode;
			this.revenue = initData.revenue;
			this.customertypecode = initData.customertypecode;
			this.donotbulkpostalmailname = initData.donotbulkpostalmailname;
			this.exchangerate = initData.exchangerate;
			this.address2_county = initData.address2_county;
			this.isprivate = initData.isprivate;
			this._primarycontactid_value = initData._primarycontactid_value;
			this.donotpostalmailname = initData.donotpostalmailname;
			this.telephone3 = initData.telephone3;
			this._parentaccountid_value = initData._parentaccountid_value;
			this.address2_city = initData.address2_city;
			this.statuscode = initData.statuscode;
			this.address1_addresstypecodename = initData.address1_addresstypecodename;
			this.address2_latitude = initData.address2_latitude;
			this.createdon = initData.createdon;
			this.donotbulkemail = initData.donotbulkemail;
			this.address2_line1 = initData.address2_line1;
			this.donotfax = initData.donotfax;
			this.marketcap = initData.marketcap;
			this.address1_composite = initData.address1_composite;
			this.ownershipcode = initData.ownershipcode;
			this.opendeals_state = initData.opendeals_state;
			this._owningbusinessunit_value = initData._owningbusinessunit_value;
			this.preferredappointmenttimecodename = initData.preferredappointmenttimecodename;
			this.address2_postalcode = initData.address2_postalcode;
			this.lastusedincampaign = initData.lastusedincampaign;
			this.paymenttermscodename = initData.paymenttermscodename;
			this.industrycodename = initData.industrycodename;
			this.processid = initData.processid;
			this.entityimage_url = initData.entityimage_url;
			this.address2_shippingmethodcodename = initData.address2_shippingmethodcodename;
			this.address2_line3 = initData.address2_line3;
			this.description = initData.description;
			this._modifiedby_value = initData._modifiedby_value;
			this.address1_county = initData.address1_county;
			this.createdbyname = initData.createdbyname;
			this.shippingmethodcodename = initData.shippingmethodcodename;
			this.address1_line1 = initData.address1_line1;
			this.donotemail = initData.donotemail;
			this.territorycode = initData.territorycode;
			this.donotphonename = initData.donotphonename;
			this.address2_postofficebox = initData.address2_postofficebox;
			this.address2_telephone1 = initData.address2_telephone1;
			this.address2_telephone2 = initData.address2_telephone2;
			this.address2_telephone3 = initData.address2_telephone3;
			this.aging60 = initData.aging60;
			this.address1_addressid = initData.address1_addressid;
			this.traversedpath = initData.traversedpath;
			this.territoryidname = initData.territoryidname;
			this.territorycodename = initData.territorycodename;
			this.followemailname = initData.followemailname;
			this._owninguser_value = initData._owninguser_value;
			this.industrycode = initData.industrycode;
			this.address2_name = initData.address2_name;
			this.openrevenue_state = initData.openrevenue_state;
			this.primarysatoriid = initData.primarysatoriid;
			this.name = initData.name;
			this.entityimageid = initData.entityimageid;
			this.donotphone = initData.donotphone;
			this.timespentbymeonemailandmeetings = initData.timespentbymeonemailandmeetings;
			this.businesstypecode = initData.businesstypecode;
			this.primarytwitterid = initData.primarytwitterid;
			this.owneridname = initData.owneridname;
			this.entityimage = initData.entityimage;
			this.entityimage_timestamp = initData.entityimage_timestamp;
			this._createdbyexternalparty_value = initData._createdbyexternalparty_value;
			this.address2_composite = initData.address2_composite;
			this.accountratingcodename = initData.accountratingcodename;
			this.shippingmethodcode = initData.shippingmethodcode;
			this.address1_country = initData.address1_country;
			this.customertypecodename = initData.customertypecodename;
			this._owningteam_value = initData._owningteam_value;
			this.address1_stateorprovince = initData.address1_stateorprovince;
			this.isprivatename = initData.isprivatename;
			this.paymenttermscode = initData.paymenttermscode;
			this.marketingonly = initData.marketingonly;
			this.creditonholdname = initData.creditonholdname;
			this._preferredequipmentid_value = initData._preferredequipmentid_value;
			this.address1_freighttermscodename = initData.address1_freighttermscodename;
			this.marketingonlyname = initData.marketingonlyname;
			this.accountratingcode = initData.accountratingcode;
			this.address1_telephone1 = initData.address1_telephone1;
			this.address1_telephone2 = initData.address1_telephone2;
			this.address1_telephone3 = initData.address1_telephone3;
			this.address1_postofficebox = initData.address1_postofficebox;
			this._msa_managingpartnerid_value = initData._msa_managingpartnerid_value;
			this.customersizecodename = initData.customersizecodename;
			this.donotemailname = initData.donotemailname;
			this.slainvokedidname = initData.slainvokedidname;
			this.fax = initData.fax;
			this._masterid_value = initData._masterid_value;
			this.sic = initData.sic;
			this._ownerid_value = initData._ownerid_value;
			this.address2_utcoffset = initData.address2_utcoffset;
			this.stageid = initData.stageid;
			this.accountnumber = initData.accountnumber;
			this.creditlimit_base = initData.creditlimit_base;
			this.address2_fax = initData.address2_fax;
			this.revenue_base = initData.revenue_base;
			this.merged = initData.merged;
			this.owneridtype = initData.owneridtype;
			this.address2_longitude = initData.address2_longitude;
			this._modifiedbyexternalparty_value = initData._modifiedbyexternalparty_value;
			this._defaultpricelevelid_value = initData._defaultpricelevelid_value;
			this.ftpsiteurl = initData.ftpsiteurl;
			this.preferredequipmentidname = initData.preferredequipmentidname;
			this.aging90_base = initData.aging90_base;
			this.defaultpricelevelidname = initData.defaultpricelevelidname;
			this.address1_shippingmethodcodename = initData.address1_shippingmethodcodename;
			this.address1_primarycontactname = initData.address1_primarycontactname;
			this.lastonholdtime = initData.lastonholdtime;
			this.address1_line2 = initData.address1_line2;
			this._createdby_value = initData._createdby_value;
			this.address2_addresstypecode = initData.address2_addresstypecode;
			this.openrevenue_date = initData.openrevenue_date;
			this.address2_upszone = initData.address2_upszone;
			this.followemail = initData.followemail;
			this.donotfaxname = initData.donotfaxname;
			this.marketcap_base = initData.marketcap_base;
			this.address2_addresstypecodename = initData.address2_addresstypecodename;
			this.ownershipcodename = initData.ownershipcodename;
			this.address1_postalcode = initData.address1_postalcode;
			this.tickersymbol = initData.tickersymbol;
			this.customersizecode = initData.customersizecode;
			this.preferredserviceidname = initData.preferredserviceidname;
			this.createdbyexternalpartyname = initData.createdbyexternalpartyname;
			this.donotbulkemailname = initData.donotbulkemailname;
			this.participatesinworkflow = initData.participatesinworkflow;
			this.stockexchange = initData.stockexchange;
			this._preferredserviceid_value = initData._preferredserviceid_value;
			this.preferredcontactmethodcode = initData.preferredcontactmethodcode;
			this.telephone2 = initData.telephone2;
			this.mergedname = initData.mergedname;
			this.msa_managingpartneridname = initData.msa_managingpartneridname;
			this._preferredsystemuserid_value = initData._preferredsystemuserid_value;
			this.accountid = initData.accountid;
			this.telephone1 = initData.telephone1;
			this.aging30_base = initData.aging30_base;
			this.address1_name = initData.address1_name;
			this.address1_fax = initData.address1_fax;
			this.address1_latitude = initData.address1_latitude;
			this.address2_shippingmethodcode = initData.address2_shippingmethodcode;
			this.accountclassificationcodename = initData.accountclassificationcodename;
			this.preferredappointmentdaycode = initData.preferredappointmentdaycode;
			this.modifiedbyname = initData.modifiedbyname;
			this.address2_freighttermscode = initData.address2_freighttermscode;
			this.address1_upszone = initData.address1_upszone;
			this.address2_addressid = initData.address2_addressid;
			this.slaname = initData.slaname;
			this.address2_primarycontactname = initData.address2_primarycontactname;
			this.opendeals = initData.opendeals;
			this.statecode = initData.statecode;

		}
	}

}
