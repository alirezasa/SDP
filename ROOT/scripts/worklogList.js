/* $Id$ */
var $worklogList = {
    /*
        *A function used to initialize Worklog listview.
        *@param options - associated entity details.
    */
    init: function (options) {
        var _self = this;
        _self.options = options;
        if(!_self.options.printPreview || (_self.options.printPreview && (_self.options.module === 'release' || _self.options.module === 'change'))) {
            _self.options.showSummary = true
        }
        _self.options.personalize_key = "worklogs"+(options.grandParent?"_"+options.grandParent:"")+(options.module?"_"+options.module:"");//NO I18N
        _self.options.tableInfo = $tasks.getPersonalization(_self.options.personalize_key, "worklogs");//NO I18N
        _self.options.isMSPOrSCP = isMSPOrSCP;
        renderhbs("#worklogList", "WorklogList", _self.options, false, "worklog");//NO I18N
        delete WebComponents.instancePool["webc-worklog"];//NO I18N
        WebComponents.render("webc-worklog");
    },
    /*
        *A function used to get wl list metainfo (used for msp )
    */
    getMetainfo : function()
    {
        var _self = this;
        var meta_url = "/api/v3/"+_self.options.url+"/metainfo"; //NO I18N
        var metaInfo = $worklogList.apiCall(meta_url).metainfo;
        var fields = metaInfo.fields;
        if(window.isMSPOrSCP && $worklogList.options.module == "request")
        {
            if(fields.accountcontract)
            {
                fields.is_active_contract = {"list_view":true , sortable : false , searchable : false , display_name: translate('ae.contract.report.ismaincontract') , display_key: "ae.contract.report.ismaincontract" , dataCelltransformer : $worklogList.renderIsActiveContract}; //No I18N
            }
            _self.options.show_billable_time = fields.hasOwnProperty("billable_time");  //No I18N
        }

        return fields;
    },
    /*
        *A function used as delete callback for Worklog listview.
    */
    deleteCallback: function(){
        var _self = $worklogList;
        if(_self.options.url.indexOf("release") > -1 || _self.options.url.indexOf("change") > -1) {
            $rc && $rc.refreshLeftPanelCount("worklog"); //No I18N
        }
        if(isMSPOrSCP)
        {
            if(WebComponents.getInstance("webc-worklog"))
            {
                //after deleting a worklog from the worklog list view we need to update the work log tab with its count .
                var wl_table = WebComponents.getInstance("webc-worklog").t_obj; // NO I18N
                var total_len = wl_table && wl_table.table_info && wl_table.table_info.list_info ? wl_table.table_info.list_info.total_count : 0 ;
                jQuery("#WL_Status_Cnt").text("("+total_len+")");
            }
        }
    },

    /*
        *A function used to set summary in Worklog listview.
    */
    setSummary: function(){
        var _self = $worklogList;
        let inputObject;
        if(["release", "change"].includes(_self.options.module) && jQuery("#include_inactive_worklogs").is(":checked")) {
            inputObject = {"include_inactive_value" : true}; //No I18N
        }
        var data = _self.apiCall("/api/v3/"+_self.options.url + "/_summary", inputObject); //NO I18N
        if(jQuery.isEmptyObject(data.summary)){
            return;
        }

        var summary = data.summary;
        if(summary.time_spent.hours !="0" || summary.time_spent.minutes !="0") {
            jQuery("#TimeSpentDiv,#TotalTimeSpent").css({"display":"block"}); //NO I18N
        } else {
            jQuery("#TimeSpentDiv,#TotalTimeSpent").css({"display":"none"}); //NO I18N
        }
        if(summary.total_cost && summary.total_cost !== "0.00") {
            jQuery("#TotalChargeDiv,#TotalCharge").css({"display":"block"}); //NO I18N
        } else {
            jQuery("#TotalChargeDiv,#TotalCharge").css({"display":"none"}); //NO I18N
        }
        var timeSpentString = summary.time_spent.hours+" "+translate("sdp.projects.daydiff.hour")+" "+summary.time_spent.minutes+" "+translate("sdp.projects.daydiff.minute");// No I18N
        jQuery("#TimeSpentDiv").text(timeSpentString);
        jQuery("#TotalChargeDiv").text(summary.total_cost);
        _self.options.summary = {}
        _self.options.summary.timespent = timeSpentString;
        _self.options.summary.totalcharge = summary.total_cost;
    },
    /*
        *A function used to set No data banner Worklog listview.
        *@param tableData.
    */
    setNoDataBanner: function(tableData) {
        var _self = $worklogList;

        if (_self.options && ['change', 'release'].includes(_self.options.module) && _self.options.worklogPresentInRemovedStages) {
            return false;
        }
        if(_self.options.printPreview || (tableData && tableData.t_obj && tableData.t_obj.table_info.list_info.search_criteria)) { return false; }

        return '<div class="alert-nodata mt10"><span class="msg"><span data-i18n-key="sdp.projects.tasks.noworklog">'+translate("sdp.projects.tasks.noworklog")+ "</span> " +// No I18N
                (_self.options.allowedOperations.add ? ' "<a class="text-link cur-ptr" id="addNewWorkLog_Empty" data-event="click" data-handler="$tasks.loadWorkLog(\'form\',\''+ _self.options.module + '\',\'' + _self.options.moduleId + '\',\''+ _self.options.grandParent +'\',\'' + _self.options.grandParentId +'\',\'\',\'' + _self.options.projectId + '\')" nonce='+sdpNonce+' data-i18n-key="common.addnew">'+translate("common.addnew")+'</a>"</span></div>' : "");
    },
    rowDataConstruct: function (table_info) {
        var _self = this, inputObject = {};
        inputObject.list_info = table_info.list_info;
        inputObject.fields_required = Object.keys(table_info.fields_required);

        // fetching associated_entity for request/problem/change/release worklog list view alone to display task title column
        _self.options.module != "task" && inputObject.fields_required.push("associated_entity");//NO I18N

        // in request/request-task module fetching created_by value to render the edit icon based on that in the worklog list view
        (inputObject.fields_required.indexOf("created_by") == -1 && _self.options.module == "request" || _self.options.grandParent == "request") && inputObject.fields_required.push("created_by");//NO I18N

        //if is_active_contract included in fields required , will be have to show account contract
        if(window.isMSPOrSCP && inputObject.fields_required.includes("is_active_contract"))
        {
            inputObject.fields_required.push("accountcontract"); //NO I18N
        }
        if(_self.options.module === 'request' && _self.options.printPreview && _self.options.printPreview === "true") {
            table_info.column_order = ["owner", "time_spent", "other_cost", "total_cost", "start_time", "end_time", "description"] //NO I18N
            inputObject.fields_required = table_info.column_order //SD-118172
            table_info.fields_required = { //Fixed columns for print preview.
                "owner": { "width": "150px"}, //NO I18N
                "time_spent": { "width": "150px"}, //NO I18N
                "other_cost": { "width": "150px"}, //NO I18N
                "total_cost": {}, //NO I18N
                "start_time": {}, //NO I18N
                "end_time": {}, //NO I18N
                "description": {"width": "150px"} //NO I18N
            }
            inputObject.list_info.row_count = 100;
        }
        return inputObject;
    },
    /*
        *A function used to render Edit icon in list view.
        *@param tableData.
    */
    renderEditIcon: function (tableData) {
        var _self = $worklogList, row_data = tableData.row_data;

        // Disabling edit icon for the users without DeletingOthersTimeEntry permission in request and request task module
        if(_self.options.module == "request" || _self.options.grandParent == "request"){
            if(!sdp_user.ROLES.includes("DeletingOthersTimeEntry") && (row_data.owner.id != sdp_user.LOGGEDIN_USERID && row_data.created_by.id != sdp_user.LOGGEDIN_USERID) ){
                return '<div class="cur-na opac7"><span class="tc-edit ptr-ev-none" role="img" aria-label="'+translate("sdp.common.form.editworklog")+'"></span></div>';
            }
        }
        var str = '<div class="cur-ptr"><a href="/" rel="uitip" title="'+translate("sdp.common.form.editworklog")+'" id="editWorklog_"'+row_data.id+' data-worklogid="'+row_data.id+'">'; //NO I18N
        return str+='<span class="tc-edit" role="img" aria-label="'+translate("sdp.common.form.editworklog")+'"></span></a></div>';
    },
    /*
        *A function used to render Owner field in list view.
        *@param tableData.
    */
    renderOwner: function (tableData) {
        var _self = $worklogList, row_data = tableData.row_data;
        var str = '<div class="d_w" id="editId_' + row_data.id + '" rel="uitip" mode_ellipsis="true" title="' + e_attr(row_data.owner.name) + '">';
        if(!_self.options.printPreview){ //NO I18N
           str += '<a href="/" data-event="click" data-handler="$tasks.loadWorkLog(\'detail\',\'' + _self.options.module + '\',\'' + _self.options.moduleId + '\',\'' + _self.options.grandParent + '\',\'' + _self.options.grandParentId + '\',\'' + row_data.id + '\',\'' + _self.options.projectId + '\')" nonce='+sdpNonce+'>'+ e_html(row_data.owner.name) +'</a></div>';
           return str.replace('class="d_w"', 'class="d_w cur-ptr"');
        }
        return str += e_html(row_data.owner.name) +'</div>';
    },
    /*
        *A function used to render is Active contract in list view.
        *@param tableData.
    */
    renderIsActiveContract : function(tableData)
    {
        var _self = $worklogList, row_data = tableData.row_data;
        var value = row_data.accountcontract && row_data.accountcontract.isactivecontract ? translate('common.yes') : translate('common.no');
        return  "<div>"+e_html(value) +'</div>';
    },
    /*
        *A function used to render Is Billable in list view.
        *@param tableData.
    */
    renderIsBillable : function(tableData)
    {
        var _self = $worklogList, row_data = tableData.row_data;
        var value = row_data.is_billable ? translate('common.yes') : translate('common.no');
        return  "<div>"+e_html(value) +'</div>';
    },
     /*
        *A function used to render Billable Time To Resolve in list view.
        *@param tableData.
    */
    renderBillableTime : function(tableData)
    {
        var _self = $worklogList, row_data = tableData.row_data;
        var value = row_data.billable_time ? row_data.billable_time.hours + " "+ translate('common.hrs') + " " +row_data.billable_time.minutes + " " +translate('common.mins') : "";
        return  "<div>"+e_html(value) +'</div>';
    },
    /*
        *A function used to render Time Taken To Resolve in list view.
        *@param tableData.
    */
    renderTimespent: function (tableData) {
        var _self = $worklogList, row_data = tableData.row_data, str = '';
        if(!_self.options.printPreview){
            str += '<a href="/" data-event="click" data-handler="$tasks.loadWorkLog(\'detail\',\'' + _self.options.module + '\',\'' + _self.options.moduleId + '\',\'' + _self.options.grandParent + '\',\'' + _self.options.grandParentId + '\',\'' + row_data.id + '\',\'' + _self.options.projectId + '\')" nonce='+sdpNonce+'>'+ (row_data.time_spent.hours + " " +  translate("sdp.projects.daydiff.hour") +"  "+ row_data.time_spent.minutes + " " +  translate("sdp.projects.daydiff.minute"))+'</a>';
            return str.replace('class="d_w"', 'class="d_w cur-ptr"');
        }
        return str + row_data.time_spent.hours + " " + translate("sdp.projects.daydiff.hour") + " " + row_data.time_spent.minutes + " " + translate("sdp.projects.daydiff.minute");
    },
    /*
        A function to render description column in multiline
    */
    renderDescription: function(table_data){
        var description = table_data.row_data.description;
    	if(!description || trim(description.replace(/<br\s*[\/]?>/gi, " ")) == ""){
    		return "-";
    	}
        if(sdp_app.SHOW_WORKLOG_FULL_DESC === "true"){
            description = '<div class="wspace-prewrap wb-bw">'+description+'</div>';
        }else{
            var descToolTip = description.length>2000? description.slice(0,2000)+"...":description;
            description = trim(description.replace(/<br\s*[\/]?>/gi, " "));
            description =  '<div class="d_w" data-field-display-type="Html" data-default-tooltip="true" mode_html="true" rel="uitip" mode_ellipsis="true" title="'+e_attr(descToolTip)+'">'+description+'</div>';
        }
        return description;
    },
    renderTaskTitle: function(table_data){
        var row_data = table_data.row_data;
        return row_data.task? '<span  rel="uitip" mode_ellipsis="true" title="'+e_attr(row_data.task.title)+'">'+e_html(row_data.task.title)+'</span>' : "-";
    },
    /*
        *A function used for api calls
        *@param url.
        *@param data - input json
    */
    apiCall: function(url,data){
        var _self = this, response;
        sdpAjax({
            method: 'GET', //NO I18N
            url: url,
            acceptODCompatible: true,
            async: false,
            data: sdpAjaxInputData(data),
            success: function(res){
                response = res;
            }
        })
        return response;
    },
    additionalMetaInfo: function(){

        return  {"task":{"value_path" : "task.id", "type" : "string"}};  //No I18N
    },
    tableOtherOptions: function() {
         var options = {
             callbackGetType: function(key) {
                 if(key == "task.id") {
                     return {type: "long"}; //NO I18N
                 }
             },
             callback:{
                 "delete": {//NO I18N
                     error:function(xhr){
                         var resp = xhr.responseJSON;
                         var failure_msg="", success_msg = translate("common.delete.success");// NO I18N
                         var failedArr = [], successArr = [];
                         resp.response_status.each(function(ele){
                             if(ele.status_code != 2000){
                                 failedArr.push(ele.id);
                                 failure_msg = ele.messages[0].message;
                             }else{
                                 successArr.push(ele.id);
                             }
                         });
                         if(successArr.length){
                             success_msg += " [ "+successArr.join(", ")+ " ]";
                             showalert('success',e_html(success_msg),"isAutoHide=true");// NO I18N
                         }
                         if(failedArr.length){
                             failure_msg += " [ "+failedArr.join(", ")+ " ]";
                             showalert('failure',e_html(failure_msg),"isAutoHide=false");// NO I18N
                         }
                     }
                 }
              },
              callbackInputdata: function(inputObject){
                    if(["release", "change"].includes($worklogList.options.module) && jQuery("#include_inactive_worklogs").is(":checked")){
                        inputObject.include_inactive_value = true;
                    }
                    return inputObject;
              }
         };
         return options;
    },
    callbackAfterBodyRender: function(tableOptions){
        if($worklogList.options.grandParent === "project" || $worklogList.options.grandParent === "milestone" || $worklogList.options.module === "change" || $worklogList.options.grandParent === "change"){
            jQuery(".searchRow input").addClass("fw");
        }else if($worklogList.options.module === "request" || $worklogList.options.grandParent === "request"){// NO I18N
            jQuery(".searchRow input").parents("div .d_w").addClass("p5");// NO I18N
        }
        if (["release", "change"].includes($worklogList.options.module)) {
            jQuery('#include_inactive_worklogs').off().on('click', function() {
                WebComponents.instancePool["webc-worklog"].refreshTable(); //No I18N
            });
        }
        $worklogList.setSummary();

        jQuery("#worklog_div").find("[id^=editWorklog_]").off("click").on("click", function(){// NO I18N
            $tasks.loadWorkLog('form', $worklogList.options.module, $worklogList.options.moduleId, $worklogList.options.grandParent, $worklogList.options.grandParentId, this.dataset.worklogid, $worklogList.options.projectId );// NO I18N
        });
    },
    fetchTableInfo: function(){
        return $worklogList.options.tableInfo;
    }
}
