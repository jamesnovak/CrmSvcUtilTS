/// <reference path="xrm.ts" />

// set up global instance of account object
var _account: MCS.Account.account_entity;

    module MCS.Account {

    export class account_entity
    {
        public entityName: string;	// grab the entity name from Xrm.Page
        public entityId: string;	// grab the entity Id from Xrm.Page	
        public crmUrl: string;		// grab Xrm.Page.context.getClientUrl()
        public $webapi: IWebApi;	// A generated service for doing webapi calls against CRM
        public utils: Utils;		// set up reusable utils object

        constructor(public $scope?: any, public $http?: ng.IHttpService, public $interval?: ng.IIntervalService) {

            this.utils = new Utils();
            this.entityName = parent.Xrm.Page.data.entity.getEntityName();
            this.entityId = parent.Xrm.Page.data.entity.getId();
            this.crmUrl = parent.Xrm.Page.context.getClientUrl();

            // instantiate the webapi service
            this.$webapi = new WebApi($http);
            this.$webapi.setUrl(this.crmUrl);
            
            // set global application reference
            _account = this;

            // disable the Name field 
            var attribs: MCS.Account.AccountAttributes = new MCS.Account.AccountAttributes();
            parent.Xrm.Page.getControl(attribs.name.name).setDisabled(false);

            this.getCompletedTasks();
        }

        getCompletedTasks() {

            // get completed Tasks related to this Account
            var acct: account_entity = this.getAccount();

            var t: TaskAttributes = new TaskAttributes();
            var filterString = t.regardingobjectid.api_name + " eq " + this.utils.cleanGuid(acct.entityId) + " and statecode eq 1";

            var params: IParams = {
                $select: t.subject.api_name,
                $filter: filterString
            };

            _account.$webapi.retrieveMultiple<ITasks>(new Task(), params)
                .then((respItems) => {

                    var vals: any = respItems.data.value;
                    for (let val of vals) {
                        var task: ITask = val;
                        // do your work here!
                        parent.Xrm.Utility.alertDialog(task.subject, null);
                    }
                });
        }

        /* Helper method for retrieving the current global reference */
        getAccount(): account_entity {

            var a: MCS.Account.account_entity | account_entity = _account;
            if (this.utils !== undefined) {
                a = this;
            } else {
                a = _account;
            }
            return a;
        }
    }

    // instantiate the angular app, empty [] means we are not bringing in any external modules such as angularUI
    // notice the naming convention of 'app' matches the setting of ng-app in index.html.  This wires the view to the code
    var app = angular.module('app', []);

    // instantiate the main controller this can be called anything as long as it matches the ng-controller in your html
    // in the [] we have dependency injection of scope and the http service and the definition of the controller with the deployment class
    app.controller('mainCtrl', ['$scope', '$http', '$interval', account_entity]);
}
