// set up global instance of account object
var _account: CRMTypeScriptAxios.accountform;

module CRMTypeScriptAxios {

    export class accountform {
        public entityName: string;	// grab the entity name from Xrm.Page
        public entityId: string;	// grab the entity Id from Xrm.Page	
        public crmUrl: string;		// grab Xrm.Page.context.getClientUrl()
        public $webapi: IWebApi;	// A generated service for doing webapi calls against CRM
        public utils: Utils;		// set up reusable utils object

        constructor() {

            this.utils = new Utils();
            this.entityName = parent.Xrm.Page.data.entity.getEntityName();
            this.entityId = parent.Xrm.Page.data.entity.getId();
            this.crmUrl = parent.Xrm.Page.context.getClientUrl();

            // instantiate the webapi service
            this.$webapi = new WebApi(this.crmUrl);

            // set global application reference
            _account = this;

            // disable the Name field 
            var attribs: accountAttributes = new accountAttributes();
            parent.Xrm.Page.getControl(attribs.name.name).setDisabled(false);

            this.getCompletedTasks();
        }

        getCompletedTasks() {

            // get completed Tasks related to this Account
            var acct: accountform = this.getAccount();

            var t: taskAttributes = new taskAttributes();
            var filterString = t.regardingobjectid.api_name + " eq " + this.utils.cleanGuid(acct.entityId) + " and statecode eq 1";

            var params: IParams = {
                $select: t.subject.api_name,
                $filter: filterString
            };

            _account.$webapi.retrieveMultiple<ITasks>(new task(), params)
                .then((respItems) => {

                    var vals: any = respItems.value;
                    for (let val of vals) {
                        let task: ITask = val;
                        // do your work here!
                        parent.Xrm.Utility.alertDialog(task.subject, null);
                    }
                });
        }

        /* Helper method for retrieving the current global reference */
        getAccount(): accountform {
            var a = _account;
            if (this.utils !== undefined) {
                a = this;
            } else {
                a = _account;
            }
            return a;
        }
    }
}

var app = new CRMTypeScriptAxios.accountform();