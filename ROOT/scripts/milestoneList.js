/* $Id$ */
var table_comp_milestone;
var $milestoneList={
	init : function(projectId){
		var _self = this;
        _self.options={};
		_self.options.allowedOperations = {};
		_self.options.projectId = projectId;
		_self.options.tableHolder = "milestones";// No I18N
        _self.options.tableInfo = $tasks.getPersonalization(_self.options.tableHolder);
		sdpAjax({
            url:"/api/v3/projects/"+_self.options.projectId+"/milestones/_links",// No I18N
            data: sdpAjaxInputData({"operations_required": ["add","edit","delete"]}),// No I18N
            ignorefailuremessage: true, async: false, acceptODCompatible: true,
            success: function(resp){
                if(resp._links){
                    resp._links.forEach(function(value, index){
                        if(value.method === "post"){
                            _self.options.allowedOperations["add"] = true;
                        }else if(value.method === "delete"){//NO I18N
                            _self.options.allowedOperations["delete"] = true;
                        }else if(value.method === "put"){//NO I18N
                            _self.options.allowedOperations["edit"] = true;
                        }
                    });
                }
            }
        });
		_self.options.url = 'projects/'+_self.options.projectId+'/milestones';// No I18N
		_self.options.current_view = translate("sdp.project.gantt.allmilestones");
        if(_self.options.tableInfo.list_info.filter_by && _self.options.tableInfo.list_info.filter_by.id != 0){
            sdpAjax({
                url: '/api/v3/list_view_filters/'+_self.options.tableInfo.list_info.filter_by.id, ignorefailuremessage: true, async: false, acceptODCompatible: true,// No I18N
                success: function(resp) {
                    _self.options.current_view = resp.list_view_filter.display_name;
                }
            });
        }
        renderhbs("#milestonesDiv","MilestoneList",_self.options, false, "project");// No I18N

		delete WebComponents.instancePool["webc-milestone"];//NO I18N
        WebComponents.render("webc-milestone");
	},
	changeFilter: function(filterId,filterName) {
        jQuery("#milestoneList #selected_filter").text(filterName).attr("title",filterName);
        WebComponents.instancePool["webc-milestone"].t_obj.table_info.list_info.filter_by = {"id" : filterId}; //NO I18N
        WebComponents.instancePool["webc-milestone"].refreshTable();// No I18N
    },
	rowDataConstruct: function(table_info,ctl) {
		var inputObject = {};
        inputObject.list_info = table_info.list_info;

        var fields_required_arr = Object.keys(table_info.fields_required);
        fields_required_arr.push("project");
        inputObject.fields_required = fields_required_arr;
        inputObject.include=["summary"];
        return inputObject;
	},
	constructMilestoneTitle: function(table_data,_self){
        var row_data = table_data.row_data;
        return '<a href="/" title="'+e_attr(row_data.title)+'" rel="uitip" mode_ellipsis="true" id="mileDetails" data-moduleid='+row_data.id+'>'+e_html(row_data.title)+'</a>'
	},
	constructTaskOverview: function(table_data,_self){
        var task = table_data.row_data.summary.task;
        if(task.total == 0){
            return '<span data-moduleid='+table_data.row_data.id+' id="mile_task_'+table_data.row_data.id+'" class="tc-task flat cur-ptr" rel="uitip" mode_html="true" title="'+translate("sdp.projects.notasks")+'" role="img"></span>';
        }else{
            var compCount = task.delayed + task.ontime;
            var title = `<div class='w-auto maxw-300px'> <div class='mb10'><strong>${translate("task.title")} (${compCount}/${task.total})</strong></div> <div class='listview'> <table cellpadding='4' cellspacing='0' border='0' class='tableComponent'> <tbody> <tr class='lightbg'> <td colspan='2'>${translate("sdp.admin.projectstatus.completed")}</td> <td colspan='2'>${translate("sdp.admin.projectstatus.pending")}</td> </tr> <tr> <td><span class='disp-ib text-overflow maxw-120px'>${translate("task.ontime")}</span></td> <td data-style='border-right : 1px solid #ddd' class='pr10' align='right'><span><strong>${task.ontime}</strong></span></td> <td><span class='disp-ib text-overflow maxw-120px'>${translate("task.ontrack")}</span></td> <td align='right' class='pr10'><span><strong>${task.ontrack}</strong></span></td> </tr> <tr> <td><span class='disp-ib text-overflow maxw-120px'>${translate("sdp.dashboard.project.delayed")}</span></td> <td data-style='border-right : 1px solid #ddd' class='pr10' align='right'><span><strong>${task.delayed}</strong></span></td> <td><span class='disp-ib text-overflow maxw-120px'>${translate("sdp.requests.overdue")}</span></td> <td align='right' class='pr10'><span><strong>${task.overdue}</strong></span></td> </tr> </tbody> </table> </div> <div class='mt10'> <span class='disp-ib text-overflow vmiddle maxw-150px'><strong>${translate("task.progress")}:</strong></span> <span class='disp-ib vmiddle pl10'>${parseInt((compCount/task.total)*100)}%</span> </div> </div>`;
            var icon=(task.ontrack + task.overdue != 0)?"tc-task-p":"tc-task-c";// No I18N

            return '<span data-moduleid='+table_data.row_data.id+' id="mile_task_'+table_data.row_data.id+'" class="'+icon+' cur-ptr" rel="uitip" mode_html="true" title=\"'+title+'\"></span>';
        }
	},
	constructTaskProgress: function(table_data, self){
        var task = table_data.row_data.summary.task;
        var compCount = task.delayed + task.ontime;
        var title = task.total == 0?translate("sdp.projects.notasks"):`<div class='w-auto maxw-300px'> <div class='mb10'><strong>${translate("task.title")} (${compCount}/${task.total})</strong></div> <div class='listview'> <table cellpadding='4' cellspacing='0' border='0' class='tableComponent'> <tbody> <tr class='lightbg'> <td colspan='2'>${translate("sdp.admin.projectstatus.completed")}</td> <td colspan='2'>${translate("sdp.admin.projectstatus.pending")}</td> </tr> <tr> <td><span class='disp-ib text-overflow maxw-120px'>${translate("task.ontime")}</span></td> <td data-style='border-right : 1px solid #ddd' class='pr10' align='right'><span><strong>${task.ontime}</strong></span></td> <td><span class='disp-ib text-overflow maxw-120px'>${translate("task.ontrack")}</span></td> <td align='right' class='pr10'><span><strong>${task.ontrack}</strong></span></td> </tr> <tr> <td><span class='disp-ib text-overflow maxw-120px'>${translate("sdp.dashboard.project.delayed")}</span></td> <td data-style='border-right : 1px solid #ddd' class='pr10' align='right'><span><strong>${task.delayed}</strong></span></td> <td><span class='disp-ib text-overflow maxw-120px'>${translate("sdp.requests.overdue")}</span></td> <td align='right' class='pr10'><span><strong>${task.overdue}</strong></span></td> </tr> </tbody> </table> </div> <div class='mt10'> <span class='disp-ib text-overflow vmiddle maxw-150px'><strong>${translate("task.progress")}:</strong></span> <span class='disp-ib vmiddle pl10'>${parseInt((compCount/task.total)*100)}%</span> </div> </div>`;
        return '<span id="mile_task_'+table_data.row_data.id+'_progress" data-moduleid='+table_data.row_data.id+' class="ui-progressbar1-info ui-progressbar1-pos1"> <span class="cur-ptr" title=\"'+title+'\" mode_html="true" rel="uitip"> <span class="ui-progressbar1a rounded50"><span style="width:'+parseInt((compCount/task.total)*100)+'%;" class="ui-progressbar1-fill rounded50 taskbar"></span></span> <span class="ui-progressbar1-after"><span class="text-color4 ml5">'+compCount+'/'+task.total+'</span></span> </span> </span>';
    },
    constructScheduleEnd: function(table_data,_self){
       var scheduled_end_time = table_data.row_data.scheduled_end_time;
        var dateStr = '-';
        if(scheduled_end_time){
            daysdiff = scheduled_end_time.days_diff;
            var diff = '<span class='+(daysdiff.diff_key && [translate("sdp.projects.daydiff.late"), translate("sdp.projects.daydiff.passed")].contains(daysdiff.diff_key)? 'listview-dateinfo-delay':'listview-dateinfo')+'>'+daysdiff.diff+'</span> '+ (daysdiff.diff_key? daysdiff.diff_key:'');
            dateStr = scheduled_end_time.display_value+' ('+diff+')';
        }
        return '<span rel="uitip" mode_ellipsis="true" mode_html="true" title="'+dateStr+'">'+dateStr+'</span>';
    },
    constructActualEnd: function(table_data,_self){
        var actual_end = table_data.row_data.actual_end_time;
        var dateStr = "-";
        if(actual_end){
            dateStr = actual_end.display_value;
            if(actual_end.days_diff){
                daysdiff = actual_end.days_diff;
                dateStr += '(<span class='+(daysdiff.diff_key && [translate("sdp.projects.daydiff.late"), translate("sdp.projects.daydiff.passed")].contains(daysdiff.diff_key)? 'listview-dateinfo-delay':'listview-dateinfo')+'>'+daysdiff.diff+'</span> '+ (daysdiff.diff_key? daysdiff.diff_key:'')+')';
            }
        }
        return '<span rel="uitip" mode_ellipsis="true" mode_html="true" title="'+dateStr+'">'+dateStr+'</span>';
    },
    constructProjectedEnd: function(table_data,_self){
        var projected_end = table_data.row_data.projected_end_time;
        var dateStr = "-";
        if(projected_end){
            dateStr = projected_end.display_value;
            if(projected_end.days_diff){
                daysdiff = projected_end.days_diff;
                dateStr += '(<span class='+(daysdiff.diff_key && [translate("sdp.projects.daydiff.late"), translate("sdp.projects.daydiff.passed")].contains(daysdiff.diff_key)? 'listview-dateinfo-delay':'listview-dateinfo')+'>'+daysdiff.diff+'</span> '+ (daysdiff.diff_key? daysdiff.diff_key:'')+')';
            }
        }
        return '<span rel="uitip" mode_ellipsis="true" mode_html="true" title="'+dateStr+'">'+dateStr+'</span>';
    },
    /*
        A function to return the tableinfo to web-component for avoiding an additional personalisation call
    */
    fetchTableInfo: function(){
        return $milestoneList.options.tableInfo;
    },
    setNoDataBanner: function(table_data){
        var list_info = table_data.t_obj.table_info.list_info;
        if((list_info.filter_by && list_info.filter_by.id !== 0) || list_info.search_criteria){
            return false;
        }
		return '<div class="alert-nodata mt10"><div class="msg"><span>'+translate('sdp.projects.nomilestone')+'</span> '+($milestoneList.options.allowedOperations.add ?'<a href="/" class="text-link" id="addMilestone">'+translate("sdp.common.addnew")+'</a></div></div>':'');
	},
    tableOtherOptions: function(){
        return {
            bulkSelectionSetting:{
                selectionDisplayField : "title"//NO I18N
            },
            nodataString: translate('sdp.projects.nomilestone'),//NO I18N
            height: jQuery(window).outerHeight() - (jQuery('#milestones_div').offset().top + is_chathgt + 70),
            width: (jQuery("body").attr("data-header-tabs") != "topbar"? jQuery(window).width()-jQuery(".sidebar-container").width():jQuery(window).width()) - 50,//NO I18N
        }
    },
    callbackAfterTableRender: function(){
        $milestoneList.handleEvents();

        // for constructing navigation in details pages. Should be removed once api based page is developed
        Store.setItem({"key":"milestoneIds", "value":WebComponents.instancePool['webc-milestone'].loadedIDs.toString()});//No I18N
    },
    /*
        A function to handle all the js events in milestone list view
    */
    handleEvents: function(){
        var $container = jQuery("#milestoneList");
        $container.off(".milestone-list");// NO I18N

        $container.one('click.milestone-list', "#milestoneListViewFilter", function(){//No I18N
            var filterList_obj = new filterListComp();
            filterList_obj.initComponent({
                module              : "milestone",    //No I18N
                element             : "#ListViewFilterMenu",    //No I18N
                personalize_key     : "milestone_filter_views",   //No I18N
                filter_action       : "$milestoneList.changeFilter",    //No I18N
                favoritable         : false,
                skipPersonalization : true,
                hideFilterSearch    : true
            });
        });

        $container.on("click.milestone-list", "#addMilestone", function(evt){
            loadNewMileStoneForm();
        });

        $container.on("click.milestone-list", "#quick_add_btn", function(evt){
            $milestoneList.showQuickAdd();
        });

        $container.on("click.milestone-list", "#pickupMile", function(evt){
            $milestoneList.assignMilestone('pickup');// NO I18N
        });

        $container.on("click.milestone-list", "#assignMile", function(evt){
            jQuery("#milestoneAssignDialog").dialog({
                width: 250, modal: true,
                close: function(){
                    jQuery('#milestoneAssignDialog').dialog('destroy')// NO I18N
                            .find("#assignee").val("").end()
                            .find("#saveAssignee").prop("disabled", true);// NO I18N
                }
            });

            jQuery("#milestoneAssignDialog #assignee").on("change.milestone-list",function(){//No I18N
                jQuery("#saveAssignee").prop("disabled", false);//NO I18N
            });

            jQuery("#milestoneAssignDialog #assignee").sdp_select2({
                cache:{}, multiple:false, allowClear: true,
                placeholder: translate("form.select.placeholder", [translate('common.owner')]),
                url:[{
                    url:"/api/v3/"+$milestoneList.options.url+"/owner",//NO I18N
                    field:'owner',//NO I18N
                    list_info: {"start_index":1,"row_count":25,"fields_required":["name"]},//NO I18N
                    headers : { Accept: "vnd.manageengine.v3+json"}// NO I18N
                }]
            });
        });

        $container.on("keyup.milestone-list", "#quickaddcontainer #m_quick_add", function(evt){
            $milestoneList.addQuickMilestone(evt);
        });

        $container.on("click.milestone-list", "#quickaddcontainer #cancelQuickAdd", function(evt){
            $milestoneList.cancelQuickadd();
        });

        $container.on("click.milestone-list", "[id^=mile_task_]", function(evt){
            window.location="/MileStoneAction.do?submitaction=ViewMileStone&showTab=tasks&projectid="+$milestoneList.options.projectId+"&milestoneid="+this.getAttribute("data-moduleid");
        });

        $container.on("click.milestone-list", "#mileDetails", function(evt){
            loadMileStoneDetails(this.getAttribute("data-moduleid"));
        });

        jQuery("#milestoneAssignDialog #saveAssignee").off("click.milestone-list").on("click.milestone-list", function(evt){// NO I18N
            $milestoneList.assignMilestone();
        });

        jQuery("#milestoneAssignDialog #cancelAssignee").off("click.milestone-list").on("click.milestone-list", function(evt){// NO I18N
            jQuery('#milestoneAssignDialog').dialog('destroy')// NO I18N
                .find("#assignee").val("").end()
                .find("#saveAssignee").prop("disabled", true);// NO I18N
        });
    },
    /*
        A function to update milestone count in Project Details page due date container.
    */
    updateMilestoneCount: function(){
        var url = "/api/v3/projects/"+$milestoneList.options.projectId+"/milestones/_total_count";// NO I18N
        sdpAjax({
            url: url,
            acceptODCompatible: true, async: false, data: sdpAjaxInputData({"list_info":{"filter_by":{"name":"completed_milestones"}}}),// NO I18N
            success: function(data) {
                jQuery("#project_closedMilestones").html(data._total_count.milestones+"<em></em>");
            }
        });
        sdpAjax({
            url: url,
            acceptODCompatible: true, async: false, data: sdpAjaxInputData({"list_info":{"filter_by":{"name":"pending_milestones"}}}),// NO I18N
            success: function(data) {
               jQuery("#project_totalMilestones").html(data._total_count.milestones);
            }
        });
    },
    /*
        *A function used to enable quick Milestone template
    */
    showQuickAdd : function(){
        jQuery("#milestoneList #addquick_milestone")
            .addClass("active")
            .closest(".listview")//No I18N
            .find("#quickaddcontainer")
                .removeClass("hide")
            .find(".task-quick-add")
                .addClass("active").end()
            .find("#quick_add_btn")
                .removeClass("active");
        jQuery("#milestoneList #m_quick_add").focus();
        jQuery("#milestoneList #m_quick_assignee").off("change.quick-assign").on("change.quick-assign",function(evt){// NO I18N
            evt.code = 'Enter';// NO I18N
            $milestoneList.addQuickMilestone(evt);
        });
        jQuery('#milestones_div').height(jQuery(window).outerHeight() - (jQuery('#milestones_div').offset().top + is_chathgt+20));
    },
    addQuickMilestone: function(evt){
        var input_value = jQuery("#m_quick_add").val().trim();
        var assignInput = jQuery("#m_quick_assignee");
        var assignee = assignInput.select2("val");// NO I18N
        if(input_value){
            assignInput.attr("disabled",false);
            var select2Options = {
                cache:{}, multiple:false, allowClear: true,
                placeholder: translate("form.select.placeholder", [translate('common.owner')]),
                url:[{
                  url:"/api/v3/"+$milestoneList.options.url+"/owner",//NO I18N
                  field:'owner',//NO I18N
                  list_info:{fields_required:["name"],"row_count":25}, //No I18N
                  headers : { Accept: "vnd.manageengine.v3+json" }// NO I18N
                }]
            };
            assignInput.sdp_select2(select2Options);
        }else{
            assignInput.select2("destroy").val("").attr("disabled",true); //No I18N
        }
        if(evt.code == 'Enter') {
            evt.preventDefault();
            if(input_value == ''){
                showalert("failure", translate("sdp.common.titleerrormessage"), "isAutoHide=false"); //No I18N
                return;
            }

            var input_data =  {"milestone":{"title":input_value}}; //No I18N
            if(assignee != ""){
                input_data.milestone.owner = {"id": assignee};// NO I18N
            }

            sdpAjax({
                url : "/api/v3/"+$milestoneList.options.url,// NO I18N
                type : "POST", acceptODCompatible: true, async : false,//NO I18N
                data : sdpAjaxInputData(input_data),
                success : function(resp){
                    showalert('success',translate("sdp.milestone.addnew.successmessage"),"isAutoHide=true");// NO I18N
                    WebComponents.instancePool["webc-milestone"].refreshTable();//NO I18N
                    setTimeout(function(){jQuery("#m_quick_add").val("").focus()},10);
                    assignInput.select2("destroy").val("").attr("disabled",true);// NO I18N
                    $milestoneList.updateMilestoneCount();
                }
            });
        }
    },
    /*
        *A function used to  hide quick milestone template
    */
    cancelQuickadd : function(){
        jQuery("#milestoneList #addquick_milestone")
            .removeClass("active")
            .closest(".listview")//No I18N
            .find("#quickaddcontainer")
                .addClass("hide")
            .find(".task-quick-add")
                .removeClass("active").end()
            .find("#quick_add_btn")
                .addClass("active");
        jQuery("#milestoneList #m_quick_add").val("");// NO I18N
        jQuery("#milestoneList #m_quick_assignee").select2("destroy").val("").attr("disabled",true);// NO I18N
        jQuery('#milestones_div').height(jQuery(window).outerHeight() - (jQuery('#milestones_div').offset().top + is_chathgt + 20));
    },
    /*
        A function to assign or pickup milestones
        @PARAM: arg pickup/assign
    */
    assignMilestone: function(arg){
        var ids = WebComponents.instancePool["webc-milestone"].bulkSelect.getSelectedIDs();//NO I18N
        var input_data = {"milestone":{"owner":""}}; //No I18N
        if(arg === "pickup"){
            input_data.milestone.owner = {"id":sdp_user.LOGGEDIN_USERID};//NO I18N
        }else{
            var owner = jQuery("#assignee").select2("val");//NO I18N
            if(owner){
                input_data.milestone.owner = {"id": owner};//NO I18N
            }
        }
        sdpAjax({
            url:"/api/v3/"+$milestoneList.options.url+"/_assign?ids="+ids,//NO I18N
            data: sdpAjaxInputData(input_data),
            type:"PUT", async:false, acceptODCompatible: true,//NO I18N
            success: function(){
                if(arg === "pickup"){
                    showalert('success',translate("milestone.pickup.success"),"isAutoHide=true"); // NO I18N
                }else{
                    showalert('success',translate("milestone.assign.success"),"isAutoHide=true"); // NO I18N
                    jQuery("#milestoneAssignDialog").dialog("destroy")// NO I18N
                        .find("#assignee").select2("destroy").val("").end()// NO I18N
                        .find("#saveAssignee").prop("disabled", true);// NO I18N
                }
                WebComponents.instancePool["webc-milestone"].refreshTable();//NO I18N
            },
            error: function(xhr){
                var resp = xhr.responseJSON.response_status;
                if(resp[0].messages && resp[0].messages[0].status_code == 4001){
                    showalert('failure',translate("milestone.pickup.error"), "isAutoHide=false");// NO I18N
                    return;
                }
            }
        })
    }
}