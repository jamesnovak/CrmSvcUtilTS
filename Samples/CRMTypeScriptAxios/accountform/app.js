// set up global instance of account object
var _account;
var CRMTypeScriptAxios;
(function (CRMTypeScriptAxios) {
    var accountform = (function () {
        function accountform() {
            this.utils = new CRMTypeScriptAxios.Utils();
            this.entityName = parent.Xrm.Page.data.entity.getEntityName();
            this.entityId = parent.Xrm.Page.data.entity.getId();
            this.crmUrl = parent.Xrm.Page.context.getClientUrl();
            // instantiate the webapi service
            this.$webapi = new CRMTypeScriptAxios.WebApi(this.crmUrl);
            // set global application reference
            _account = this;
            // disable the Name field 
            var attribs = new CRMTypeScriptAxios.accountAttributes();
            parent.Xrm.Page.getControl(attribs.name.name).setDisabled(false);
            this.getCompletedTasks();
        }
        accountform.prototype.getCompletedTasks = function () {
            // get completed Tasks related to this Account
            var acct = this.getAccount();
            var t = new CRMTypeScriptAxios.taskAttributes();
            var filterString = t.regardingobjectid.api_name + " eq " + this.utils.cleanGuid(acct.entityId) + " and statecode eq 1";
            var params = {
                $select: t.subject.api_name,
                $filter: filterString
            };
            _account.$webapi.retrieveMultiple(new CRMTypeScriptAxios.task(), params)
                .then(function (respItems) {
                var vals = respItems.value;
                for (var _i = 0, vals_1 = vals; _i < vals_1.length; _i++) {
                    var val = vals_1[_i];
                    var task_1 = val;
                    // do your work here!
                    parent.Xrm.Utility.alertDialog(task_1.subject, null);
                }
            });
        };
        /* Helper method for retrieving the current global reference */
        accountform.prototype.getAccount = function () {
            var a = _account;
            if (this.utils !== undefined) {
                a = this;
            }
            else {
                a = _account;
            }
            return a;
        };
        return accountform;
    }());
    CRMTypeScriptAxios.accountform = accountform;
})(CRMTypeScriptAxios || (CRMTypeScriptAxios = {}));
var app = new CRMTypeScriptAxios.accountform();
//# sourceMappingURL=app.js.map