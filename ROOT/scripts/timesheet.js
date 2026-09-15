/* $Id$ */
var $timesheet = {
    /*
        *A function to render timesheet table grouped by user
        *@PARAM module - Associated Entity
        *@PARAM moduleId - Associated Entity ID
    */
    init : function(module, moduleId){
        var _self = this;
        _self.moduleId = moduleId;
        _self.module = module;
        _self.isAllowedToViewCostPerHour = jQuery("#isAllowedToViewCostPerHour").val() === "true"; //No i18N

        if(jQuery.isEmptyObject(_self.inputjson)){
            _self.inputjson = { "list_info":  { "row_count": "100","sort_field":"members","sort_order":"asc"}}; //No i18N
        }
        var timesheet;
        var url = "/api/v3/projects/"+moduleId+"/_timesheet";//No i18N
        if(module == "milestone"){//No i18N
            url = "/api/v3/projects/"+jQuery("#projectid").html()+"/milestones/"+moduleId+"/_timesheet";//No i18N
        }
        sdpAjax({
            url:url,
            async: false, acceptODCompatible: true, cache: false,
            data: sdpAjaxInputData(_self.inputjson),
            success: function(data) {
                timesheet = data.timesheet;
                sdpAjax({
                    url: "/api/v3/worklogs/_summary",//No i18N
                    data: sdpAjaxInputData({"module":module,"moduleId":moduleId,"for":module+"Timesheet"}),//No i18N
                    async: false, acceptODCompatible: true, cache: false,
                    success:function(data){
                        timesheet.summary = data.summary;
                    }
                });
            }
        });
        timesheet.isAllowedToViewCostPerHour = _self.isAllowedToViewCostPerHour;
        timesheet.sortfield = _self.inputjson.list_info.sort_field;
        timesheet.sortorder = _self.inputjson.list_info.sort_order == 'desc'? 'desc1':'asc';//No i18N
        timesheet.sortTitle = _self.inputjson.list_info.sort_order == 'desc'? translate("sdp.descending.order"):translate("sdp.ascending.order");//No i18N
        timesheet.rowspan = _self.isAllowedToViewCostPerHour? "2":"1";

        if(timesheet.members.length == 0){
            jQuery("#timesheet-listview").addClass("hide");
            jQuery("#timesheet_noDataBanner").removeClass("hide");
        }else{
            renderhbs("#timesheetTable tbody", "Timesheet", timesheet, false, "project");//No i18N
        }

        initTooltip("#timesheet-listview");//No i18N
        // Removing all the available userTimesheet web-component instances
        jQuery.each(WebComponents.instancePool, function(key, value){
            if(key.startsWith("webc_worklogs_")){delete WebComponents.instancePool[key]; }
        });
    },
    /*
        *A function to render Wokrlogs of each user in the time sheets
    */
    callComponent : function(){
        var _self = this;
        renderhbs("#userTimesheet_"+_self.memberId,"UserTimesheet",{"id": _self.memberId, "isAllowedToViewCostPerHour": _self.isAllowedToViewCostPerHour},false, "project");//No i18N
        WebComponents.render("webc_worklogs_"+_self.memberId);
    },
    rowDataConstruct : function(){
        var inputObject = {};
        var fields_required_arr= ["task","time_spent","start_time","end_time"];// No I18N
        if($timesheet.isAllowedToViewCostPerHour){
            fields_required_arr = fields_required_arr.concat(["total_cost", "other_cost", "owner_cost"]);//No i18N
        }
        inputObject.list_info = {"row_count": 10};//No i18N
        inputObject.module = $timesheet.module;
        inputObject.moduleId = $timesheet.moduleId;
        inputObject.for = $timesheet.module+"Timesheet";//No i18N
        inputObject.list_info.fields_required = fields_required_arr;
        inputObject.list_info.search_criteria = { "field":"owner.id", "condition":"is", "value":$timesheet.memberId };// No I18N
        if($timesheet.searchCriteria){
            inputObject.list_info.search_criteria.children = $timesheet.searchCriteria;
        }
        return inputObject;
    },
    constructWorklogsCell : function(table_data,_self){
        return '<div class="pl20 mb10 mt5"> <p class="pos-rel lh-large text-overflow mb5"> <span class="pos-abs right0 hidethis"></span> <span class="pr15 sb opac7">'+encodeHTML(table_data.row_data.task.title )+'</span> </p> <div class="disp-flex valign-center font-small"> <span class="text-color1">'+translate("sdp.requests.common.worklog")+':</span> <span class="mr15"> <span class="ml5 mr5 text-muted disp-ib text-overflow vmiddle maxw-150px">'+translate("sdp.admin.operatinghours.workingtime.starttime")+' -</span><span class="disp-ib vmiddle">'+table_data.row_data.start_time.display_value+'</span> </span> <span> <span class="ml5 mr5 text-muted disp-ib text-overflow vmiddle maxw-150px">'+translate("sdp.admin.operatinghours.workingtime.endtime")+' -</span><span class="disp-ib vmiddle">'+table_data.row_data.end_time.display_value+'</span> </span> </div> </div>';
    },
    constructTimespent : function(table_data,_self){
        return '<div>'+parseInt(table_data.row_data.time_spent.hours,10)+' '+ translate('sdp.projects.daydiff.hour') +' '+parseInt(table_data.row_data.time_spent.minutes, 10)  +' '+translate("sdp.projects.daydiff.minute")+' </div>';//No i18N
    },
    callbackAfterRender : function(){
        jQuery("#worklogs_"+$timesheet.memberId+"_head").attr("class","hide");
    },
    process_rowdata: function(row_data){
        row_data.total_cost = row_data.total_cost || "0.00";
        row_data.owner_cost = row_data.owner_cost || "0.00";
        row_data.other_cost = row_data.other_cost || "0.00";
        return row_data;
    },
    /*
        *A function to trigger UserTimesheet
        *@PARAM obj - details of the user for the timesheet have to be enabled
    */
    dispUserTimesheet : function(obj){
        var _self = this;
        var memberId =obj.getAttribute("id").replace("member_","");
        _self.memberId = memberId;
        var row =jQuery("#"+memberId);

        if(row.attr("active") == "true"){
            jQuery("#userTimesheet_"+memberId).closest("tr").addClass("hide");//No i18N
            jQuery("#member_"+memberId).removeAttr("style");
            jQuery("#"+memberId).removeClass("tf-rot90");
            row.attr("active","false");

            jQuery("#search_bar_"+memberId+" input").val("");
            jQuery("#search_bar_"+memberId).addClass("hide");//No i18N
            jQuery("#search_icon_"+memberId).removeClass("hide");//No i18N
            delete WebComponents.instancePool["webc_worklogs_"+memberId];
        }else{
            // this is the id of already displayed UserTimeSheet row.
            var dispId = jQuery("[id^=member_] .tf-rot90").attr("id");
            delete WebComponents.instancePool["webc_worklogs_"+dispId];
            jQuery("#userTimesheet_"+dispId).closest("tr").addClass("hide");//No i18N
            jQuery("#"+dispId).attr("active", "false");
            jQuery("#member_"+dispId).removeAttr("style");
            jQuery("[id^=member_] .tf-rot90").removeClass("tf-rot90");
            jQuery("#userTimesheet_"+memberId).closest("tr").removeClass("hide");//No i18N
            jQuery("#member_"+memberId).css({"background": "#f6f6f6"});//No i18N
            jQuery("#"+memberId).addClass("tf-rot90");
            row.attr("active","true");
            this.callComponent();
        }
    },
    /*
        *A function to form search criteria when search is done in UserTiemsheet
    */
    searchTasks : function(memberId,event){
        var _self = this;
        if(event == undefined){
            jQuery("#search_bar_"+memberId).removeClass("hide").focus();//No i18N
            jQuery("#search_bar_"+memberId+" input").focus();
            jQuery("#search_icon_"+memberId).addClass("hide");//No i18N
            return;
        }
        if(event.keyCode == 13){
            searchKey = jQuery("#search_bar_"+memberId+" input").val();//No i18N
            if(searchKey != ""){
                child = { "field": "task.title", "condition": "contains", "value":searchKey, "logical_operator":"AND" } //No i18N
                WebComponents.getInstance("webc_worklogs_"+memberId).t_obj.table_info.list_info.search_criteria.children = [child];
                WebComponents.getInstance("webc_worklogs_"+memberId).refreshTable();//No i18N
                return;
            }
            _self.hideSearchBar(memberId);
        }
    },
     /*
        *A function to form sorting data when sort is done in UserTiemsheet
    */
    sortTimesheet : function(sortField){
        var _self = this;
        var input = $timesheet.inputjson;
        if(sortField == input.list_info.sort_field){
            if(input.list_info.sort_order == "asc"){//No i18N
                input.list_info.sort_order = "desc";//No i18N
            }else{
                input.list_info.sort_order = "asc";//No i18N
            }
        }else{
            input.list_info.sort_field = sortField;
            input.list_info.sort_order = "asc";//No i18N
        }
        $timesheet.inputjson = input;
        this.init(_self.module,_self.moduleId);
    },
    /*
        *A function to hide searchBar in UserTimesheet
    */
    hideSearchBar : function(memberId){
        jQuery("#search_bar_"+memberId).addClass("hide");
        jQuery("#search_bar_"+memberId+" input").val("");
        delete WebComponents.getInstance("webc_worklogs_"+memberId).t_obj.table_info.list_info.search_criteria.children;//No i18N
        WebComponents.getInstance("webc_worklogs_"+memberId).refreshTable();//No i18N
        jQuery("#search_icon_"+memberId).removeClass("hide");
    }
}