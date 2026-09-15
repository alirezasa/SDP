/* $Id$ */
var table_comp_task,kanban_comp_task;
var $taskList = {
    /*
        *A function where options for task table is defined
        *@PARAM: taskOptions - Associated Entity and fromPage details
    */
    init : function(taskOptions){
        var _self= this;

        taskOptions.personalize_key = taskOptions.personalize_key ? taskOptions.personalize_key: (taskOptions.module ? taskOptions.module+"_tasks" : "showAllTasks_tasks");  //No I18N
        taskOptions.tableHolder = taskOptions.personalize_key + (taskOptions.moduleId ? "_"+taskOptions.moduleId : "");
        taskOptions.url = taskOptions.url? taskOptions.url: "tasks";// NO I18N

        _self.tableInfo = taskOptions.t_info? taskOptions.t_info: $tasks.getPersonalization(taskOptions.personalize_key,"tasks");// NO I18N
        _self.taskOptions = taskOptions;
        if(isMSPOrSCP && _self.taskOptions.from === 'account') {
        	_self.isMSPSCP_AccountPage = true;
        	(isMSP)?(_self.isMSP_AccountPage = true):(_self.isSCP_AccountPage = true);
        }
        if(!_self.taskOptions.viewMode){
            _self.taskOptions.viewMode = _self.tableInfo.current_view_mode  ? _self.tableInfo.current_view_mode : "table";      // NO I18N
        }

        if(_self.taskOptions.owner){
            _self.taskOptions.viewMode = "table";//NO I18N
            delete _self.taskOptions.personalize_key;
        }
        if(_self.taskOptions.stageId && _self.taskOptions.stageId != 0){
            _self.taskOptions.stageCriteria = {"field": "stage","value": $taskList.taskOptions.stageId,"condition": "is", "logical_operator": "and"};// NO I18N
        }
        if(_self.taskOptions.from === "printView" && _self.taskOptions.advFilterCrit){
            _self.tableInfo.list_info.search_criteria = _self.taskOptions.advFilterCrit;
            delete _self.tableInfo.list_info.filter_by;
        }
        var filterId = "0";
        if(_self.taskOptions.filterId != null){
            filterId = _self.taskOptions.filterId;
        }else if(_self.tableInfo.list_info.filter_by){
            filterId = _self.tableInfo.list_info.filter_by.id;
        }
        if(_self.taskOptions.viewMode === "classic"){
            _self.tableInfo = $tasks.getPersonalization("classic_tasks", "tasks");//NO I18N
            if(!_self.tableInfo.list_info.sort_field){
                _self.tableInfo.list_info.sort_field="id";//NO I18N
                _self.tableInfo.list_info.sort_order="asc";//NO I18N
            }
        }
        _self.tableInfo.list_info.filter_by = {"id" : filterId};   //NO I18N
        _self.taskOptions.current_view = translate("common.alltasks");
        if(filterId != undefined && filterId != "0"){
            sdpAjax({
                url: '/api/v3/list_view_filters/'+filterId,// NO I18N
                ignorefailuremessage: true, async: false,
                success: function(resp) {
                    _self.taskOptions.current_view = resp.list_view_filter.display_name;
                },
                error: function(response){
                    _self.tableInfo.list_info.filter_by = {"id": 0};// NO I18N
                }
            });
        }
        if(_self.taskOptions.viewMode === "rq_leftpanel"){
            _self.tableInfo.column_order = ["title","status","priority","owner","group"];// NO I18N
        }
        if(_self.taskOptions.stageId && _self.taskOptions.stageId != 0){
            _self.taskOptions.stageCriteria = {"field": "stage","value": $taskList.taskOptions.stageId,"condition": "is", "logical_operator": "and"};// NO I18N
        }
        var table_content = { "header" : _self.taskHeaderdataConstruct(_self.tableInfo,_self) };// NO I18N

        var options = {};
        options.isFR_ListInfo_Support   = options.support_search_criteria = true;
        options.paginationEnabled       = options.columnChooserEnabled    = true;
        options.isODAPI                 = options.getmetaInfo             = true;
        options.sortingEnabled          = options.searchEnabled           = true;
        options.refreshEnabled          = _self.taskOptions.from == "showAllTasks" || _self.isMSPSCP_AccountPage;// NO I18N
        options.get_total_count         = !(_self.taskOptions.from == "showAllTasks");// NO I18N
        options.callbackOnAPIFailure    = _self.apiFailureCallback;
        options.personalize_key         = _self.taskOptions.personalize_key;
        options.inlineEditEnabled       = _self.taskOptions.inlineEdit;
        options.callbackAfterBodyRender = _self.callbackAfterTableRender;
        options.row_inputdata           = _self.taskRowdataConstruct(_self.tableInfo,_self);
        options.callbackRowfunction     = _self.taskRowdataConstruct;
        options.errMsgAutoHide          = false;

        if (taskOptions.isTaskDependencySettingEnabled){options.inlineUpdatefunction = _self.loadConfirmationForTaskDependency;}
        if(_self.taskOptions.isUnifiedView || _self.taskOptions.from === 'showAllTasks' || _self.isMSPSCP_AccountPage){
            options.inlineUpdatefunction    = _self.saveInlineEditChanges;
        }

        options.inlineEditEntity        = "task"; //No I18N
        options.must_included_fields    = ['request','project','change','problem','milestone','marked_owner','marked_group',"associated_entity","release", "overdue", "site"]; //NO I18N
        options.discarded_fields        = ["description","email_before","template","milestone","tags","udf_fields"]; //NO I18N

        if(_self.taskOptions.isUnifiedView){
            options.maxgetcount       = 25;
            options.row_min_height    = 65;
            options.view              = 'kanban'; //No I18N
            options.metainfo_entity   = "tasks";  //No I18N
            options.column_settings   = {"default_position" : 2,"assign_label_width": false, "assign_content_width":false, "columns" :[{"size" :1},{"size" :11,"pipe_separation" : false}]}; //No I18N
            options.combined_settings = {"module": "task", "component_type": "parent", "child_component": ["table_comp_request"], "columnchooser": {"id": "task", "title": "Task" } }// NO I18N
            options.inlineEditEnabled = ((sdp_user.ROLES.indexOf("SDAdmin") > -1 || sdp_user.ROLES.indexOf("SDSiteAdmin") > -1 || sdp_user.ROLES.indexOf("SDCo-ordinator") > -1) && (_self.taskOptions.viewMode!=='rq_leftpanel'))? true : false //No I18N
            options.get_total_count   = _self.taskOptions.show_total_count ? _self.taskOptions.show_total_count : false ;
            options.entity_name       = options.callbackURL = "activities";// NO I18N
            options.nodataString = '<div class="req-empty-list empty-state tc fh">'+
                '    <div class="empty-svg">'+
                '        <div class="empty-content">'+
                '            <span class="empty-title">'+ translate('common.emptytext1') + '</span>' +
                '            <p class="mt5">'+translate('common.emptytext2')+'</p>'+
                '        </div>'+
                '    </div>'+
                '</div>';
            options.width = jQ("#listview").width();  //No I18N
            var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
            jQuery('#header-placeholder').length == 0 ? options.height = (jQuery(window).height() - jQuery('#top-header').height() - chatbar_height -  80) : options.height = (jQuery(window).height() - jQuery('#header-placeholder').height() -  chatbar_height - 80);//No I18N

            if (_self.taskOptions.filterBy != "null") {
                _self.tableInfo.list_info.filter_by = _self.taskOptions.filterBy;
            }else{
                _self.tableInfo.list_info.filter_by = _self.tableInfo.list_info.filter_by || { "name" : (sdp_user.USERTYPE == "Requester" ? "Open_Requester" : "Open_System")}; //No I18N
            }
            if(_self.taskOptions.viewMode === "rq_leftpanel"){
                options.nodataString = '';
                options.width = 279;
                options.maxgetcount = 250;
                options.lazyloadingEnabled = true;
                options.column_settings  = {"default_position" : 2,"assign_label_width": false, "assign_content_width":false, "columns" :[{"size" :1, "pipe_separation" : true},{"size" :11,"pipe_separation" : false}]}; //No I18N
            }else{
                options.view_mode = "linear"; //No I18N
            }
            var retObj = {};
            retObj.table_info       = _self.tableInfo;
            retObj.table_content    = table_content;
            retObj.options          = options;
            return retObj;
        }else if(_self.taskOptions.viewMode == "kanban"){    //NO I18N
            _self.taskOptions.inlineEdit        = options.inlineEditEnabled     = false;
            _self.tableInfo.viewMode            = _self.taskOptions.viewMode;
            options.lazyloadingEnabled          = options.isAPI_include_support = true;
            options.column_settings             = {"row_custom_class":"kanban-list","assign_label_width": false,"assign_content_width":false};  //No I18N
            options.cc_discarded_fields         = ["title","id"],    //NO I18N
            options.view                        = 'kanban';         //No I18N
            options.entity_name                 = "tasks";          //NO I18N
            options.entity_name_s               = "task";           //NO I18N
            options.view_mode                   = "full_kanban";    //NO I18N
            options.default_sort_field          = "id";             //NO I18N
            options.default_sort_order          = "desc";           //NO I18N
            options.personalize_key             = "kanban_tasks";   //No I18N
            options.default_group_by            = options.SGField          = "owner";          //NO I18N
            options.callbackURL                 = _self.taskOptions.url;
            options.updateHandler               = $taskList.updateKanbanTask;
            options.default_column_order        = ["title","status","priority","type","scheduled_start_time","scheduled_end_time","index","associated_entity","link"];// NO I18N
            options.default_fields_required     = {"title":"","status":"","priority":"","type":"","scheduled_start_time":"","scheduled_end_time":"","index":"","associated_entity":"","link":""};// NO I18N
            options.default_list_info           = {"row_count": "10"};// NO I18N
            options.groupByListInfoHandler      = _self.transformListInfo;
            options.width                       = "320";    //NO I18N
            options.max_allowed_fields          = 20;
            options.row_min_height              = 35;
            options.icon_settings = {
                "show_icons_Bottom": true, //No I18N
            };
            options.group_by_list = [{
                id: "owner",            //No I18N
                name: translate("common.owner"),        //No I18N
                pl_name: translate("common.owner"),     //No I18N
                type: "user",           //No I18N
                additional_fields: {
                    "status": "",       //No I18N
                    "priority": "",     //No I18N
                    "type": ""          //No I18N
                },
                unassigned: {
                   name: translate("sdp.common.unAssign")   //No I18N
                }
            }, {
                id: "status",           //No I18N
                name: translate("common.status"),           //No I18N
                pl_name: translate("common.statuses"),      //No I18N
                type: "color",          //No I18N
                additional_fields: {
                    "owner": "",        //No I18N
                    "priority": "",     //No I18N
                    "type": ""          //No I18N
                }
            }, {
                id: "priority",         //No I18N
                name: translate("common.priority"),         //No I18N
                pl_name: translate("common.priorities"),    //No I18N
                type: "color",          //No I18N
                additional_fields: {
                    "owner": "",        //No I18N
                    "status": "",       //No I18N
                    "type": ""          //No I18N
                },
                unassigned: {
                    color: "#484848",   //NO I18N
                    name: translate("sdp.common.notassigned")    //No I18N
                }
            }, {
                id: "type",             //No I18N
                name: translate("sdp.project.taskattribute.tasktype"),          //No I18N
                pl_name: translate("sdp.admin.leftpanel.task.tasktypes"),       //No I18N
                type: "color",          //No I18N
                additional_fields: {
                    "owner": "",        //No I18N
                    "status": "",       //No I18N
                    "priority": ""      //No I18N
                },
                unassigned: {
                    color: "#484848",   //NO I18N
                    name: translate("sdp.common.notassigned")    //No I18N
                }
            }];
            options.sort_by_container       = "task-kvsort-container";          //No I18N
            options.group_by_container      = "task-managegroups-container";    //No I18N
            options.manage_group_btn        = "task-kvmanagegroup-btn";         //No I18N
            options.kanban_container        = "task-kanban-container";          //No I18N
            options.kanban_right_container  = "task-kv-right-container";        //No I18N
            options.kanban_outer_container  = "listview";                       //No I18N
            options.nodataString            = '<div class="sdp-kanban-nodata"><span class="sdp-kanban-nodatasvg"></span><span class="kanban-list-no-data">'+translate('common.dragdrop.here')+'</span></div>';   //No I18N
            options.appliedFilter = function(){
                jQuery("#ListViewFilterMenu button").hide();
            }
            options.cancelledFilter = function(){
                jQuery("#ListViewFilterMenu button").show();
            }
            renderhbs("#tasksList", "TaskKanban", _self.taskOptions, false, "task");    //No I18N
            kanban_comp_task = kanbanComponent.initComponent(_self.tableInfo, table_content, options, _self, {"viewFilter":_self.initCustomView});//No I18N
        } else {
            if(_self.taskOptions.from === "showAllTasks"){
                options.listSettingEnabled=true;
                options.listSettingOptions = {
                    enableSettings: ["record_per_page","reset_personalization","refresh_frequency"], //No I18N
                    disableSettings: ["text_wrapping"]
                }
                options.reinitializeCalback = function(){
                    $spa.navigate("/ui/tasks?mode=list&from=showAllTasks","home", "", false, _self.spaSubContainer()); //No I18N
                }
            }
            if(_self.taskOptions.viewMode == "classic"){    //NO I18N
                options.personalize_key             = "classic_tasks";  //NO I18N
                options.view_mode                   = "linear";         //NO I18N
                options.view                        = "kanban";         //NO I18N
                options.isAPI_include_support       = true;
                options.column_settings = {
                    "default_position": 2,          //No I18N
                    "assign_label_width": false,    //No I18N
                    "assign_content_width":false,   //No I18N
                    "columns": [{                   //No I18N
                        "size": 1,                  //No I18N
                        "width": "80px"             //No I18N
                    }, {
                        "size": 11,                 //No I18N
                        "pipe_separation": true,    //No I18N
                        "row_count": 2,             //No I18N
                        "default_rowposition": 2    //No I18N
                    }]
                };
                options.listSettingOptions.enableSettings.push("sorting");
            }
            options.width = (jQuery("body").attr("data-header-tabs") != "topbar"? jQuery(window).outerWidth()-jQuery(".sidebar-container").outerWidth():jQuery(window).outerWidth()) - 30;
            options.acceptODCompatible    = true;
            options.callbackURL           = options.metainfo_entity   = options.deleteURL   = _self.taskOptions.url;
            options.entity_name           = "tasks";// NO I18N
            options.tableHolder           = _self.taskOptions.tableHolder;
            options.nodatabanner_callback = _self.setNoDataBanner;
            options.bulkSelectionSetting  = { selectionDisplayField: "title" };// NO I18N
            _self.taskOptions.isCRGeneralTask = ((_self.taskOptions.module == 'release' || _self.taskOptions.module == 'change' ) && !_self.taskOptions.stageId) ? true : false;//NO I18N
            _self.taskOptions.module == "project" && delete options.discarded_fields["milestone"];// NO I18N
            if(_self.taskOptions.from!='showAllTasks' && !_self.isMSPSCP_AccountPage && _self.taskOptions.allowedOperations && _self.taskOptions.allowedOperations.edit){
                _self.taskOptions.allowedOperations.trigger = true;
                _self.taskOptions.allowedOperations.assign = true;
                _self.taskOptions.allowedOperations.close = true;
                _self.taskOptions.allowedOperations.organize = true;
            }
            if(_self.taskOptions.module == "request"){//NO I18N
                _self.taskOptions.taskMenuWrap = jQuery("#toggleRHS").attr('toggleState') == 'close' ? '': 'task-menu-wrap';//NO I18N
            }else if(_self.taskOptions.module == "change" || _self.taskOptions.module == "release"){//NO I18N
                _self.taskOptions.taskMenuWrap = jQuery("#toggleRHS-"+_self.taskOptions.module).attr('toggleState') == 'close' ? '': 'task-menu-wrap';//NO I18N
            }

            if(_self.taskOptions.from == "showAllTasks" && (_self.taskOptions.owner || _self.taskOptions.site || _self.taskOptions.group)){
                var grpCrit, ownerCrit, search_criteria;
                if(_self.taskOptions.site && _self.taskOptions.site != 0){
                    if(_self.taskOptions.site!=-1){
                        search_criteria={"field": "site.id","value": _self.taskOptions.site,"condition": "is","logical_operator":"AND"};//No I18N
                    }else{
                        search_criteria={"field": "site","value": null,"condition": "is","logical_operator":"AND"};//No I18N
                    }
                    delete _self.taskOptions.site;
                }

                if(_self.taskOptions.group && !jQuery.isEmptyObject(_self.taskOptions.group)){
                    grpCrit = {"field": _self.taskOptions.group.column,"values": _self.taskOptions.group.values,"condition": "eq","logical_operator":"AND"};//No I18N
                    if(search_criteria){
                        search_criteria.children=[grpCrit];
                    }else{
                        search_criteria = grpCrit;
                    }
                    delete _self.taskOptions.group;
                }

                if(_self.taskOptions.owner){
                    ownerCrit = {"field": "owner.name","value": _self.taskOptions.owner,"condition": "is","logical_operator":"AND"};//No I18N
                    if(search_criteria){
                        search_criteria.children? search_criteria.children.push(ownerCrit): search_criteria.children=[ownerCrit];
                    }else{
                        search_criteria = ownerCrit;
                    }
                    _self.taskOptions.dashboardOwner = _self.taskOptions.owner;
                    delete _self.taskOptions.owner;
                }
                _self.tableInfo.list_info.search_criteria = search_criteria;
            }

            if(_self.taskOptions.module == "release" || _self.taskOptions.module == "change"){ //No I18N
                options.callbackGetType = function(key) {
                    if(key == "stage.id") {
                        return {type: "long"};// NO I18N
                    }
                }
            }
            options.callbackSearchFunction = $taskList.callbackSearchFunction;
            if(_self.isSCP_AccountPage ){
                _self.tableInfo.list_info.search_criteria={"field":"account","value":acc_Id ,"condition":"is","logical_operator":"AND"}; //No I18N
            }
            var requester = sdp_user.USERTYPE === 'Requester' && _self.taskOptions.module === 'request'; //NO I18N
            if(((_self.taskOptions.allowedOperations && _self.taskOptions.allowedOperations.edit) || requester) && (_self.taskOptions.from !== 'showAllTasks' && !_self.isMSPSCP_AccountPage)) {
                _self.taskOptions.showDependency = true;
                _self.taskOptions.dependencyEditable = !requester;
            }
            if(window.isMSPOrSCP){
                _self.taskOptions.isMSPOrSCP=isMSPOrSCP;
                _self.taskOptions.isSCP=isSCP;
                if(_self.isMSPSCP_AccountPage){
                	if(isInactiveAccount == 'true'){
                        $taskList.taskOptions.allowedOperations.add=false;
                    }
                    _self.taskOptions.acc_Id=acc_Id;
                }
            }
            renderhbs("#tasksList", "TaskList", _self.taskOptions, false, "task");//No I18N
            if(_self.taskOptions.from === 'showAllTasks') {
                options.height = jQuery(window).height()-jQuery("#header-placeholder").outerHeight()-jQuery("#top-subheader").outerHeight()-jQuery("#listcontrols").outerHeight() -62;        //No I18N
                if(_self.taskOptions.viewMode != "classic"){        //No I18N
                    options.staticHeader = true;
                    options.height = jQuery(window).height()-jQuery("#header-placeholder").outerHeight()-jQuery("#top-subheader").outerHeight()-jQuery("#listcontrols").outerHeight() -101;        //No I18N
                }
                window.location.pathname=='/ui/home' && jQuery("#tasksList #listview").removeClass("mt10");
            }

            table_comp_task = new tableComponent(_self.tableInfo,table_content,options, _self);
            // Custom View
            (_self.taskOptions.from !== "printView") && _self.initCustomView(); // No I18N
        }
    },
    transformListInfo : function(data,groubBy){
        if(groubBy == "owner") {
            data.fields_required = ["name","profile_pic"];// No I18N
        }
        return data;
    },
    changeFilter : function(filterid, filtername){
        jQuery("#selected_tasklist_filter").text(filtername);
        jQuery("#selected_tasklist_filter").attr("title", filtername);

        if($taskList.taskOptions.viewMode === "kanban"){
            kanban_comp_task.k_obj.t_info.list_info.filter_by = {"id": filterid }; //NO I18N
            kanban_comp_task.refreshKanbanView();
        }else{
            table_comp_task.t_obj.table_info.list_info.filter_by = {"id": filterid }; //NO I18N
            table_comp_task.refreshTable();
        }

        if ($taskList.taskOptions.from === 'showAllTasks') { // NO I18N
            $tasks.setPersonalizeUserData(filterid, "taskview_sidebar"); // NO I18N
            if($taskList.taskOptions.viewMode === "kanban" || $taskList.taskOptions.viewMode === "classic"){
                $tasks.setPersonalizeUserData(filterid, "showAllTasks_tasks"); // NO I18N
            }
        }
    },
    taskHeaderdataConstruct : function(table_info,_self){
        var check_box = _self.taskOptions.tableHolder + "_head_chk"; //No I18N
        var defaultSettings = {"default" : true,"hide_label" : true,"column_settings" : {"position" : 1}}; //NO I18N
        var meta_data = {}, href;
        if(_self.taskOptions.url.startsWith("tasks")){
            href = '/${baseURL}/${id}'// NO I18N
        }else{
            href = '/'+_self.taskOptions.url + '/${id}';
        }
        meta_data[check_box] = jQuery.extend({"type": "checkbox"}, defaultSettings);// NO I18N
        jQuery.extend(meta_data,{
            "profile_pic"           : jQuery.extend({"dataCelltransformer" : _self.constructProfilePic,"type":"icon"}, defaultSettings),// NO I18N
            "taskicon"              : jQuery.extend({"dataCelltransformer" : _self.constructTaskIcon,   "type": "icon"}, defaultSettings),// NO I18N
            "editicon"              : jQuery.extend({"dataCelltransformer" : _self.constructTaskAction, "type": "icon"}, defaultSettings),// NO I18N
            "title"                 : {"dataCelltransformer"  : _self.constructTaskNameCell },// NO I18N
            "owner"                 : {"dataCelltransformer"  : _self.constructGroupOwnerCell, value_path:"owner.name"},// NO I18N
            "percentage_completion" : {"dataCelltransformer"  : _self.constructPerComplCell },// NO I18N
            "associated_entity"     : {"dataCelltransformer"  : _self.constructAssociatedEntity },// NO I18N
            "group"                 : {"dataCelltransformer"  : _self.constructGroupOwnerCell, value_path:"group.name"},// NO I18N
            "link"                  : {"dataCelltransformer"  : _self.constructLinkCell },// NO I18N
            "type"                  : {"inlineEdit" :true, "value_path": "type.name"},// NO I18N
            "estimated_effort"      : {"type" : "date-time" }, //No I18N
            "additional_cost"       : {"text": translate("project.task.additionalcost")+" ("+sdp_app.CURRENCY_SYMBOL+")"},// NO I18N
            "status":{// NO I18N
                "inlineEdit" :true,// NO I18N
                "href": href +'/status',// NO I18N
                "value_path": "status.name", // NO I18N
                "dataCelltransformer" : _self.constructStatusCell// NO I18N
            },
            "priority" : {// NO I18N
                "inlineEdit" :true,// NO I18N
                "href": href +'/priority',// NO I18N
                "value_path": "priority.name", // NO I18N
                "dataCelltransformer" :_self.constructPriorityCell// NO I18N
            },
            "scheduled_start_time" :{// NO I18N
                "inlineEdit" :true,// NO I18N
                "comparefield" : "scheduled_end_time" ,// NO I18N
                "width": "200px" //NO I18N
            },
            "scheduled_end_time" : {// NO I18N
                "inlineEdit" :true,// NO I18N
                "comparefield" : "scheduled_start_time",// NO I18N
                "dataCelltransformer": _self.constructScheduleEndCell,// NO I18N
                "width": "200px" //NO I18N
            },
            "actual_start_time" : {// NO I18N
                "inlineEdit" :true,// NO I18N
                "comparefield" : "actual_end_time",// NO I18N
                "width": "200px" //NO I18N
            },
            "actual_end_time" : {// NO I18N
                "inlineEdit" :true,// NO I18N
                "comparefield" : "actual_start_time",// NO I18N
                "width": "200px" //NO I18N
            },
            "milestone" :{// NO I18N
                "text": "project.milestone",// NO I18N
                "value_path": "milestone.title", //No I18N
                "type" : "string"// NO I18N
            },
            "created_by": {// NO I18N
                "value_path": "created_by.name", // NO I18N
            }
        });
        if(window.isMSPOrSCP){
        	meta_data.issitevisit={"dataCelltransformer" :_self.constructIsSiteVisit}; // No I18N
        }
        _self.taskOptions.inlineEdit = _self.taskOptions.allowedOperations && _self.taskOptions.allowedOperations.edit && _self.taskOptions.from !== 'printView';// NO I18N
        (!_self.taskOptions.inlineEdit  || _self.taskOptions.from === "showAllTasks") && delete meta_data[check_box];
        _self.taskOptions.module != "project" && delete meta_data.milestone;// NO I18N
        (["project","milestone"].indexOf(_self.taskOptions.module) != -1 || (_self.taskOptions.module &&_self.taskOptions.module.startsWith("cm_"))) && delete meta_data.group;// NO I18N
        ((_self.taskOptions.allowedOperations && !_self.taskOptions.allowedOperations.edit) || _self.taskOptions.from === 'printView' || _self.taskOptions.viewMode === "rq_leftpanel") && delete meta_data.editicon;// NO I18N
        !["combined", "rq_leftpanel"].contains(_self.taskOptions.viewMode) && delete meta_data.taskicon;// NO I18N
        _self.taskOptions.viewMode != "classic" && delete meta_data.profile_pic;    // NO I18N

        if(_self.taskOptions.viewMode === "combined" || _self.taskOptions.viewMode === "rq_leftpanel"){
            meta_data.title.hide_label = true;
            delete meta_data[check_box];
            delete meta_data.estimated_effort;
            delete meta_data.group.dataCelltransformer;
            delete meta_data.owner.dataCelltransformer;
            meta_data.title.column_settings = {"view_type" :"row"};// NO I18N
        }

        if((_self.taskOptions.from !== "showAllTasks" && _self.taskOptions.from !== "printView") || (_self.taskOptions.from === "printView" && _self.taskOptions.module)){
            (_self.taskOptions.viewMode !== "combined" && _self.taskOptions.viewMode !== "rq_leftpanel") && delete meta_data.link; //NO I18N
            delete meta_data.associated_entity;
        }else{
            if(_self.taskOptions.viewMode == "kanban" || _self.taskOptions.viewMode == "classic"){        //NO I18N
                if(_self.taskOptions.viewMode == "kanban"){
                    delete meta_data.editicon;
                    jQuery.extend(meta_data,{
                        "tags" : jQuery.extend({"dataCelltransformer" : _self.constructTags,   "type": "icon"}, defaultSettings),// NO I18N
                    });
                }
                meta_data.title = jQuery.extend(true, meta_data.title, {
                    "default": true, // No I18N
                    "hide_label": true,// No I18N
                    "column_settings": { "view_type": "row", "rowposition": 1 }     //NO I18N
                });
            }
            if(sdp_user.ROLES.indexOf("SDAdmin") == -1 && sdp_user.ROLES.indexOf("SDSiteAdmin") == -1 && sdp_user.ROLES.indexOf("SDCo-ordinator") == -1){
                _self.taskOptions.inlineEdit = false;
            }
        }

        if(_self.taskOptions.module == "release" || _self.taskOptions.module == "change"){
            if(_self.taskOptions.stageId && _self.taskOptions.stageId != 0){
                meta_data.stage = {isHidden : true};
            }else{
                meta_data.stage = {"default": true}; // NO I18N
                meta_data.index = {isHidden : true};
            }
        }
        if(_self.taskOptions.from === "showAllTasks" && _self.taskOptions.viewMode !== "kanban"){
            meta_data.editicon.td_class="pos-rel";//NO I18N
        }
        return meta_data;
    },
    apiFailureCallback: function(resp) {
        var resp = resp[1].responseJSON;
        if (resp) {
            var responseText = resp.response_status && resp.response_status.constructor === Array ? resp.response_status[0] : resp.response_status;
            var invalid_filter_criteria = translate("sdp.customfilter.invalid.criteria"); // No I18N
            if (invalid_filter_criteria === responseText.messages[0].message) {
                showalert('failure', invalid_filter_criteria, "isAutoHide=false"); // No I18N
                var personalize_key = ($taskList.taskOptions.viewMode === "kanban" || $taskList.taskOptions.viewMode === "classic")?"showAllTasks_tasks":$taskList.taskOptions.personalize_key;//NO I18N
                $tasks.setPersonalizeUserData("0", personalize_key);
                if ($taskList.taskOptions.from === 'showAllTasks') { // NO I18N
                    $tasks.setPersonalizeUserData("0", "taskview_sidebar"); // NO I18N
                }
                $tasks.loadTasks($taskList.taskOptions.mode, $taskList.taskOptions.module, $taskList.taskOptions.moduleId, '', $taskList.taskOptions.from, $taskList.taskOptions.projectId, $taskList.taskOptions.stageId); // NO I18N
            } else {
                showalert('failure', e_html(responseText.messages[0].message), "isAutoHide=true,delay=3"); // No I18N
            }
        } else {
            showalert('failure', translate("sdp.admin.associatedapplications.connectionfailure.msg", ["SDP"]), "isAutoHide=true,delay=3"); // No I18N
        }
        return false;
    },
    taskRowdataConstruct : function(table_info, _self){
        var fields_required_arr = Object.keys(table_info.fields_required);
        var inputObject         = {"list_info" : table_info.list_info};// NO I18N
        if(!inputObject.list_info.sort_field){
            inputObject.list_info.sort_field = 'index';// NO I18N
            inputObject.list_info.sort_order = 'asc';// NO I18N
        }

        if(!_self.taskOptions.isUnifiedView){
            if(_self.taskOptions.from=="showAllTasks" || (_self.taskOptions.from === 'printView' && !_self.taskOptions.module) || _self.isMSPSCP_AccountPage){
                var linkindex = fields_required_arr.indexOf("link");
                if(linkindex > -1){
                    fields_required_arr.splice(linkindex,1);
                }
                jQuery.merge(fields_required_arr,['title','request','project','change','problem',"milestone","release"]);// NO I18N
                if(_self.taskOptions.viewMode == "kanban") {
                    inputObject.include = ["tags"];
                }else if(_self.taskOptions.viewMode == "classic") {//NO I18N
                    inputObject.include = ["image_token"];
                    fields_required_arr.indexOf("owner") == -1 && fields_required_arr.push("owner");
                }
            }else{
                if(_self.taskOptions.module == "release" || _self.taskOptions.module == "change"){
                    if(_self.taskOptions.stageCriteria){
                        inputObject.list_info.search_criteria = _self.taskOptions.stageCriteria;
                    }else{
                        fields_required_arr.push("stage");
                        delete inputObject.include;
                    }
                }
            }
        }

        fields_required_arr.indexOf("id")        == -1  && fields_required_arr.push('id');
        fields_required_arr.indexOf("owner")     >  -1  && fields_required_arr.push("marked_owner");
        fields_required_arr.indexOf("taskicon")  >  -1  && fields_required_arr.splice(fields_required_arr.indexOf("taskicon"), 1);
        fields_required_arr.indexOf("editicon")  >  -1  && fields_required_arr.splice(fields_required_arr.indexOf("editicon"), 1);

        if("project" !== _self.taskOptions.module && "milestone" !== _self.taskOptions.module){
            if(fields_required_arr.indexOf("group")  == -1){
                fields_required_arr.push("group");
            }
            fields_required_arr.push("marked_group");
        }

        if(!_self.taskOptions.isUnifiedView && fields_required_arr.indexOf("associated_entity") == -1){
            fields_required_arr.push("associated_entity");
        }

        if(_self.taskOptions.isUnifiedView){
            for (var i = 0; i < fields_required_arr.length; i++) {
                fields_required_arr[i] = "task." + fields_required_arr[i];
            }
            jQuery.merge(fields_required_arr,['task.request','task.project','task.change','task.problem',"task.milestone","task.release","task.associated_entity"]);// NO I18N
        }

        _self.taskOptions.module  ?  fields_required_arr.push(_self.taskOptions.module): null;
        _self.taskOptions.module  == "milestone" && fields_required_arr.push("project");// NO I18N
        _self.taskOptions.module  == "project"   && fields_required_arr.push("milestone");// NO I18N

        fields_required_arr.push('site');
		if(window.isMSPOrSCP){
			fields_required_arr.push('account');// NO I18N
		}
        inputObject.fields_required = fields_required_arr;
        if(fields_required_arr.indexOf("status") > -1) {
            fields_required_arr.push("overdue");
        } else if(_self.taskOptions.isUnifiedView && fields_required_arr.indexOf("task.status") > -1) {
            fields_required_arr.push("task.overdue");
        }
        return inputObject;
    },
    /*
        A function to initalize the custom View
        @PARAM options- this argument is sent from kanban view when group by field is changed.
    */
    initCustomView: function(filterOptions){
        if(filterOptions && filterOptions.groupByChange) {
            viewFilterComponent.changeSkipFields(filterOptions);
            return;
        }

        if($taskList.taskOptions.viewMode === 'kanban'){
            filterOptions.entity="tasks";//No I18N
            filterOptions.metaParam='list_view_filter';//No I18N
            filterOptions.metaInfoData = null;
            filterOptions.allowReadOnly=true;
            filterOptions.setNullSiteDef= true;
            filterOptions.haveNestedColumns=false;
            filterOptions.haveInactiveValues=false;
            filterOptions.skipFields=[kanban_comp_task.k_obj.group_by];
        }else{
             filterOptions = {
                parentDiv:"task_custom_filter",//No I18N
                entity:"tasks",//No I18N
                module:"task",//No I18N
                metaParam:'list_view_filter',//No I18N
                entityComponent: table_comp_task,
                noneValID: "$(none)",  //No I18N
                customView: {"dialog_appendTo": "body"},//No I18N
                enableSave: true, allowReadOnly: true, setNullSiteDef: true,
                metaOverride: {
                    "udf_fields": { "display_name": translate("sdp.requests.fieldFormRules.scriptpopup.additionalFields") }, //No I18N
                },
                applyFn: function(search_criteria){
                    search_criteria = search_criteria.slice();
                    if(!$taskList.taskOptions.temp_list_info){
                        $taskList.taskOptions.temp_list_info = jQuery.extend({},table_comp_task.t_obj.table_info.list_info);
                    }
                    delete table_comp_task.t_obj.table_info.list_info.filter_by;
                    $taskList.taskOptions.advFilterCrit = search_criteria;
                    if(($taskList.taskOptions.module === "change" || $taskList.taskOptions.module === "release") && $taskList.taskOptions.stageCriteria){
                        search_criteria.push($taskList.taskOptions.stageCriteria);
                    }
                    table_comp_task.t_obj.table_info.list_info.search_criteria = search_criteria;
                    table_comp_task.refreshTable();
                    jQuery("#tasksList #ListViewFilterMenu button").hide();
                },
                errFiltFn: function (resp) {
                    if(resp.responseJSON.response_status.messages[0].status_code === 4008){
                        showalert("failure", resp.responseJSON.response_status.messages[0].message, "isAutoHide=false") //No I18N
                        jQuery("#viewName").focus();
                    }else if(resp.responseJSON.response_status.messages[0].status_code === 4001){
                        if(resp.responseJSON.response_status.messages[0].field == "name"){
                            showalert("failure", translate("sdp.customfilter.invalid.name"), "isAutoHide=false") //No I18N
                        } else {
                           showalert("failure", resp.responseJSON.response_status.messages[0].message, "isAutoHide=false") //No I18N
                        }
                    }
                },
                cancelFn: function(){
                    table_comp_task.t_obj.table_info.list_info = $taskList.taskOptions.temp_list_info;
                    delete $taskList.taskOptions.temp_list_info;
                    delete $taskList.taskOptions.advFilterCrit;
                    table_comp_task.t_obj.table_info.list_info.search_criteria = null;
                    if(($taskList.taskOptions.module === "change" || $taskList.taskOptions.module === "release") && $taskList.taskOptions.stageCriteria){
                        table_comp_task.t_obj.table_info.list_info.search_criteria = $taskList.taskOptions.stageCriteria;
                    }
                    table_comp_task.refreshTable();
                    jQuery("#tasksList #ListViewFilterMenu button").show();
                },
                refFiltFn: function(param){
                    delete $taskList.taskOptions.temp_list_info;
                    delete $taskList.taskOptions.advFilterCrit;
                    table_comp_task.t_obj.table_info.list_info.search_criteria = null;
                    if(($taskList.taskOptions.module === "change" || $taskList.taskOptions.module === "release") && $taskList.taskOptions.stageCriteria){
                        table_comp_task.t_obj.table_info.list_info.search_criteria = $taskList.taskOptions.stageCriteria;
                    }
                    $taskList.changeFilter(param.list_view_filter.id, param.list_view_filter.name);
                    jQuery("#tasksList #ListViewFilterMenu button").show();
                }
            }
        }
        filterOptions.changeURLData = function(field){
            var data = {};
            if(field == "group" || field == "marked_group"){
                data.for = "list_view_filter";//No I18N
            }
            var fieldIncludesInactives = ["status","priority","type","created_by","group","template"];//No I18N
            if(fieldIncludesInactives.contains(field) || field.indexOf("pick_") > -1){
                data.include_inactive_value = true;
            }

            urlOptions = {"data": data};//No I18N
            if(field === "marked_owner" || field === "marked_group"){
                urlOptions.field = field.replace("marked_", "");
            }
            return urlOptions;
        }
        filterOptions.passOnlyIds      = true;
        filterOptions.haveMultiString  = true;
        filterOptions.handleInOperators= true;
        filterOptions.specialFormats   = ["have_none"];
        filterOptions.ignoreNoneFields = ["status","associated_entity","created_by"];//No I18N
        filterOptions.hideMarkPublic   = (sdp_user.ROLES.indexOf("SDAdmin") == -1 && sdp_user.ROLES.indexOf("SDSiteAdmin") == -1);
        filterOptions.addNoneOption    = function(){
            return [{"id": "$(none)", "text":translate("common.none")}]; //No I18N
        }
        filterOptions.dollarSupport    = {
            "$_user"             : {"fields": ["owner","created_by","marked_owner"], "option":{"id":"$(logged_in_user)", "text": translate("sdp.common.loggedinuser")} },//No I18N
            "$_status_pending"   : {"fields": ["status"], "option":{"id":"$(is_pending)", "text":translate("sdp.common.allpending")}},//No I18N
            "$_status_completed" : {"fields": ["status"], "option":{"id":"$(is_completed)", "text":translate("sdp.common.allcompleted")}},//No I18N
            "$_group"            : {"fields": ["group", "marked_group"], "option":{"id":"$(my_group)", "text":translate("sdp.requests.listview.allmyqueues")}}//No I18N
        }
        filterOptions.dateCustomize   = $tasks.getCustomDateCond();
        filterOptions.allowed_value = {
            callback: function(list_info, field){
                if(["owner","created_by","site"].contains(field)){
                    list_info = {"fields_required": ["name"]};      //No I18N
                }
                return list_info;
            }
        };
        viewFilterComponent.initComponent(filterOptions);
    },
    /*
        *A function to construct TaskIcon for combined View
    */
    constructTaskIcon : function (row_data,_self) {
         return '<div class="flip-container '+(_self.taskOptions.viewMode!=="rq_leftpanel"?'mt15':'')+'"><div class="flipper no-flipper"><div class="front no-flipper"><span class="task-ic-wrapper"><span class="cspr icon-sm unified-list "></span></span></div></div></div>';
    },
    constructTaskAction : function (table_data, _self) {
        var row_data = table_data.row_data, html = "";
        var module = row_data.associated_entity;
        var moduleId = (module === 'general')? row_data.id : row_data[module].id //NO I18N
        var projectId = (row_data.associated_entity === 'milestone')? row_data.project.id : null; //NO I18N
        var stageId = ( module == 'release' || module == 'change' ) && _self.taskOptions != undefined ? _self.taskOptions.stageId: null;// NO I18N
        var eleId = "task-action-" + row_data.id;// NO I18N
        if(module.startsWith("cm_")){
            module = row_data[module].api_plural_name;
        }
        if(_self.taskOptions.isUnifiedView || _self.taskOptions.viewMode === "rq_leftpanel"){
            html  = '<div class="btn-group bs-noconflict tc-req-edit"> <a data-task="' + eleId + '" class="cur-ptr cspr menulist icon-xs flat2 sdmenu-toggle vtop" data-switch="sdmenu" rel="uitip" title="' + translate("sdp.common.actions") + '"></a>';
            html += '<ul class="sdmenu-dd" id="' + eleId + '" role="menu">';
            html += '<li><a class="task-edit" href="/" data-event="click" data-handler="$tasks.loadTasks(\'form\',\'' + module +'\','+moduleId+','+ row_data.id +',\'combinedView\','+ projectId +','+stageId+');" nonce='+sdpNonce+' data-i18n-key="sdp.common.edit">' + translate("sdp.common.edit") + '</a></li>';
            html += '<li><a href="/" data-event="click" data-handler="$taskList.triggerTask(\''+ row_data.id +'\', \'combinedView\');" nonce='+sdpNonce+' data-i18n-key="sdp.tasks.trigger">' + translate("sdp.tasks.trigger") + '</a></li>';
            html += '<li><a href="/" data-event="click" data-handler="$tasks.closeTask(\'\', \'combinedViewClose\', \'' + row_data.id + '\');" nonce='+sdpNonce+' class="task-edit" data-i18n-key="sdp.common.close">' + translate("sdp.common.close") + '</a></li>';
            html += '<li><a href="/" data-event="click" data-handler="$tasks.deleteTask(\'\', \'combinedView\', \'\', \'' + row_data.id + '\')" nonce='+sdpNonce+' data-i18n-key="sdp.common.delete">' + translate("sdp.common.delete") + '</a></li>';
            html += '</ul></div>';
        }else if(_self.taskOptions.from=="showAllTasks" || _self.isMSPSCP_AccountPage){ //NO I18N
            var from=_self.taskOptions.from;
            // altered 'showAllTasks' to 'from' as it will be common for msp account tasks too, will not affect SDP
            html  = '<div class="btn-group bs-noconflict pos-abs'+($taskList.taskOptions.viewMode == "classic" ? " ml5 pl3" : " ml10 mr10")+'"> <span data-task="' + eleId + '" class="cspr menulist icon-xs cur-ptr vtop" data-switch="sdmenu" rel="uitip" title="' + translate("sdp.common.actions") + '"></span>';
            html += '<ul class="sdmenu-dd" id="' + eleId + '" role="menu">';
            html += '<li><a href="/" data-event="click" data-handler="$tasks.loadTasks(\'form\',\'' + module +'\','+moduleId+','+ row_data.id +',\''+from+'\','+ projectId +','+stageId+');" nonce='+sdpNonce+' data-i18n-key="sdp.common.edit">' + translate("sdp.common.edit") + '</a></li>';
            html += '<li><a href="/" data-event="click" data-handler="$taskList.triggerTask(\''+ row_data.id +'\');" nonce='+sdpNonce+' data-i18n-key="sdp.tasks.trigger">' + translate("sdp.tasks.trigger") + '</a></li>';
            html += '<li><a href="/" data-event="click" data-handler="$tasks.closeTask(\'\', \'\', \'' + row_data.id + '\');" nonce='+sdpNonce+' class="task-edit" data-i18n-key="sdp.common.close">' + translate("sdp.common.close") + '</a></li>';
            html += '<li><a href="/" data-event="click" data-handler="$tasks.deleteTask(\'\',\''+from+'\', \'\', \'' + row_data.id + '\')" nonce='+sdpNonce+' data-i18n-key="sdp.common.delete">' + translate("sdp.common.delete") + '</a></li>';
            html += '</ul></div>';
        }else if(_self.taskOptions.module && (_self.taskOptions.allowedOperations["edit"] || _self.taskOptions.allowedOperations["delete"])){
            var url = $tasks.getEntityURL(module,moduleId,projectId, row_data.id);
            html  = '<div class="btn-group bs-noconflict ml10 mr10"> <span data-task="' + eleId + '" class="cspr menulist icon-xs cur-ptr vtop pos-rel" data-switch="sdmenu" rel="uitip" title="' + translate("sdp.common.actions") + '"></span>';
            html += '<ul class="sdmenu-dd" id="' + eleId + '" role="menu">';
            html += _self.taskOptions.allowedOperations["edit"] ? '<li><a class="task-edit" href="/" data-event="click" data-handler="$tasks.loadTasks(\'form\',\'' + module +'\','+moduleId+','+ row_data.id +',null,'+ projectId +','+stageId+');" nonce='+sdpNonce+' data-i18n-key="sdp.common.edit">' + translate("sdp.common.edit") + '</a></li>' : '';
            html += _self.taskOptions.allowedOperations["edit"] ? '<li><a href="/" data-event="click" data-handler="$tasks.closeTask(\''+ url +'/_close\');" nonce='+sdpNonce+' class="task-edit" data-i18n-key="sdp.common.close">' + translate("sdp.common.close") + '</a></li>' : '';
            html += _self.taskOptions.allowedOperations["delete"] ? '<li><a href="/" data-entityid="'+row_data.id+'" data-table-delete data-i18n-key="sdp.common.delete">' + translate("sdp.common.delete") + '</a></li>' : '';
            html += '</ul></div>';
        }
        return html;
    },
    constructTaskNameCell : function(table_data,_self) {
        var row_data = table_data.row_data;
        var titleStr = e_attr(row_data.title);
        var col_str = projectId = '';
        var module = row_data.associated_entity;
        if(module == "milestone"){ projectId = row_data.project.id; }
        var moduleId = row_data[module] ? row_data[module].id : '';
        if(module.startsWith("cm_")){
            module = row_data[module].api_plural_name;
        }
        let spaSubContainer = window.location.pathname == "/ui/home" ? "data-spa-subcontainer=true" : ""; // No I18N
        if($taskList.taskOptions && $taskList.taskOptions.viewMode == "kanban"){
            col_str = '<a class="uni-heading text-overflow" data-name="show_task'+row_data.id+'" rel="uitip" mode_ellipsis="true" title="'+titleStr+'" href="/ui/tasks?mode=detail&from=showAllTasks&module='+module+'&taskId='+row_data.id+(moduleId? '&moduleId='+moduleId:'')+(projectId? "&projectId="+projectId:'')+'" data-event="click" data-handler="$tasks.loadTasks(\'detail\', \''+module+'\',\''+moduleId+'\',\''+row_data.id+'\',\'kanban\','+projectId+');" nonce='+sdpNonce+'>#'+row_data.id + ' '+e_html(row_data.title) + '</a>';
        }else if(_self.taskOptions.viewMode == "classic") {//No I18N
            col_str = '<a href="/ui/tasks?mode=detail&from=showAllTasks&module='+module+'&taskId='+row_data.id+(moduleId? '&moduleId='+moduleId:'')+(projectId? "&projectId="+projectId:'')+'" rel="uitip" mode_ellipsis="true" class="uni-heading text-overflow" data-name="show_task'+row_data.id+'" title="'+titleStr+'"  data-task data-spa="true" data-spa-module="home">#'+row_data.id +' '+e_html(row_data.title) + '</a>';
        }else{
            if(_self.taskOptions.from === 'printView'){
                col_str = '<span  rel="uitip" mode_ellipsis="true" title="'+titleStr+'">'+e_html(row_data.title)+'</span>';
            }else if(_self.taskOptions.viewMode == "combined"){// NO I18N
                col_str = '<a class="uni-heading text-overflow" data-name="show_task'+row_data.id+'"  rel="uitip" mode_ellipsis="true" title="'+titleStr+'" href="/ui/tasks?mode=detail&from=showAllTasks&module='+module+'&taskId='+row_data.id+(moduleId? '&moduleId='+moduleId:'')+(projectId? "&projectId="+projectId:'')+'" data-event="click" data-handler="$tasks.loadTasks(\'detail\', \''+module+'\',\''+moduleId+'\',\''+row_data.id+'\',\'combinedView\','+projectId+');" nonce='+sdpNonce+'>#'+row_data.id + ' '+e_html(row_data.title) + '</a>';
            }else if(_self.taskOptions.viewMode == "rq_leftpanel"){// NO I18N
                col_str = '<span class="disp-ib p3 truncate-ellipsis"><a href="/ui/tasks?mode=detail&from=showAllTasks&module='+module+'&taskId='+row_data.id+(moduleId? '&moduleId='+moduleId:'')+(projectId? "&projectId="+projectId:'')+'" class="truncate-wrapper uni-heading cur-ptr sb"  rel="uitip" mode_ellipsis="true" title="' + titleStr + '"data-event="click" data-handler="$tasks.loadTasks(\'detail\', \''+module+'\',\''+moduleId+'\',\''+row_data.id+'\',\'rq_leftpanel\','+projectId+');" nonce='+sdpNonce+'>#' + row_data.id +'  '+ e_html(row_data.title)+ '</a></span>';
            }else{
                if(_self.taskOptions.from !== "showAllTasks"){
                    col_str += (_self.taskOptions.module === 'request' && sdp_user.USERTYPE === 'Requester')? '<span rel="uitip" mode_ellipsis="true" title="'+titleStr+'" data-task >'+e_html(row_data.title) + '</span>' : '<a href="/ui/tasks?mode=detail&from=showAllTasks&module='+module+'&taskId='+row_data.id+(moduleId? '&moduleId='+moduleId:'')+(projectId? "&projectId="+projectId:'')+'" rel="uitip" mode_ellipsis="true" title="'+titleStr+'"data-event="click" data-handler="$tasks.loadTasks(\'detail\',\''+module+'\',\''+moduleId+'\',\''+row_data.id+'\',\''+$taskList.taskOptions.from+'\','+projectId+');" nonce='+sdpNonce+' data-task >'+e_html(row_data.title) + '</a>';
                }else{
                    col_str += '<a href="/ui/tasks?mode=detail&from=showAllTasks&module='+module+'&taskId='+row_data.id+(moduleId? '&moduleId='+moduleId:'')+(projectId? "&projectId="+projectId:'')+(window.externalframe? "&externalframe=true":'')+'" rel="uitip" mode_ellipsis="true" title="'+titleStr+'"  data-task data-spa="true" '+spaSubContainer+' data-spa-module="home">'+e_html(row_data.title) + '</a>';
                }
            }
        }
        return col_str;
    },
    constructAssociatedEntity : function(table_data){
        return translate("sdp.report.task.module."+table_data.row_data.associated_entity);
    },
    constructProfilePic : function(table_info){
        var rd = table_info.row_data;
        var image = "/images/default-profile-pic2.svg";     //No I18N
        if(rd.owner){
            image = rd.owner.profile_pic["content-url"];        //No I18N
            if(image.indexOf("default-profile-pic2") == -1){
                image += "?key="+rd.image_token;        //No I18N
            }
        }
        return `<div class="mt10 prf-img">
                      <img src=` + image + ` class="rounded-circle w-50px h-50px">
                </div>`
    },
    constructStatusCell :  function(table_data,_self) {
        var row_data = table_data.row_data;
        var statusFlagStr = (row_data && row_data.overdue)? "<span class='list-sprite icon-sm flag-warning-icon'></span>" : "";
        statusFlagStr += '<span rel="uitip" mode_ellipsis="true" title="'+e_attr(row_data.status.name)+'">' ;
        if($taskList.taskOptions && $taskList.taskOptions.viewMode == "kanban"){
            statusFlagStr += '<em class="priority-badge mr5 minw-0px" data-style="background:' + e_attr(row_data.status.color) + ';">&nbsp;</em>';
        }
        return statusFlagStr + e_html(row_data.status.name) +'</span>'
    },
    constructPriorityCell : function(table_data,_self) {
        var row_data = table_data.row_data;
        if(row_data.priority != null) {
            var col_str = '<span rel="uitip" mode_ellipsis="true" title="'+e_attr(row_data.priority.name)+'">';
             if(_self.taskOptions != undefined && (_self.taskOptions.viewMode == "combined" || _self.taskOptions.viewMode == "rq_leftpanel")){
                col_str += '<em class="minw-0px '+(row_data.priority.color?"priority-badge":"disp-ib vmiddle boxszbb bgtransp block-bordered icon-xs top-1")+' mr5" data-style="background:' + e_attr(row_data.priority.color) + ';">&nbsp;</em>';
            }
            return col_str + e_html(row_data.priority.name)+'</span>'
        }
        return '-';
   },
    constructPerComplCell : function(table_data){
        var row_data = table_data.row_data;
        return '<span class="ui-progressbar1"><span data-style="width:'+row_data.percentage_completion+'%;" class="ui-progressbar1-fill"></span></span><span class="ui-progressbar1-after">'+row_data.percentage_completion+'%</span>'
    },
    constructGroupOwnerCell : function(table_data,_self){
        var row_data  = table_data.row_data;
        var inlineStr = $tasks.constructGroupOwnerField("inline",table_data.head_data.id,row_data);// NO I18N
        if($taskList.taskOptions.inlineEdit && (table_data.head_data.inlineEdit == undefined || table_data.head_data.inlineEdit)){
            inlineStr = "<span class='cur-ptr' data-event='click' data-handler=\"$tasks.BEA_Show_bem_dialog(\'inline\', "+row_data.id+",this)\" nonce="+sdpNonce+">"+inlineStr+"<span class='caret visi-item ml5'></span></span>";
        }
        return inlineStr;
    },
    constructLinkCell : function(table_data, task){
        var row_data  = table_data && table_data.row_data || task;
        switch(row_data.associated_entity){
            case "request":// NO I18N
                return translate("common.requestid") +'&nbsp;:&nbsp;<a href="/WorkOrder.do?woMode=viewWO&woID='+row_data.request.id+'" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" mode_html="true" title="'+e_attr(e_html(row_data.request.subject))+'">#'+row_data.request.id+'</span></a>';
            case "project":// NO I18N
                return translate("project.id")+'&nbsp;:&nbsp;<a href="/ProjectAction.do?submitaction=ViewProject&amp;projectid='+row_data.project.id+'" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" mode_html="true" title="'+e_attr(e_html(row_data.project.title))+'">#'+row_data.project.id+'</span></a>';
            case "change":// NO I18N
                return translate("sdp.change.changeId")+'&nbsp;:&nbsp;<a href="/ui/changes?entity_id='+row_data.change.id+'&mode=detail#tasks" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" mode_html="true" title="'+e_attr(e_html(row_data.change.title))+'">#'+row_data.change.id+'</span></a>';
            case "problem":// NO I18N
                return translate("sdp.problem.problemId")+'&nbsp;:&nbsp;<a href="/ui/problems?mode=detail&entity_id='+row_data.problem.id+'" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" title="'+e_attr(e_html(row_data.problem.title))+'">#'+row_data.problem.id+'</span></a>';
            case "milestone":// NO I18N
                return translate("sdp.project.taskattribute.milestoneid")+'&nbsp;:&nbsp;<a href="/MileStoneAction.do?projectid='+row_data.project.id+'&submitaction=ViewMileStone&milestoneid='+row_data.milestone.id+'" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" mode_html="true" title="'+e_attr(e_html(row_data.milestone.title))+'">#'+row_data.milestone.id+'</span></a>';
            case "release":// NO I18N
                return translate("common.release.id")+'&nbsp;:&nbsp;<a href="/ui/releases?entity_id='+row_data.release.id+'&mode=detail#submission/details" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" mode_html="true" title="'+e_attr(e_html(row_data.release.title))+'">#'+row_data.release.id+'</span></a>';
            default:
                return '-';
        }
    },
	constructIsSiteVisit : function(table_data){
	    if(!window.isMSPOrSCP) return;
		return table_data.row_data.issitevisit?translate("sdp.admin.settings.yes"):translate("sdp.admin.settings.no");// NO I18N
	},
    constructScheduleEndCell : function(table_data, _self) {
        var scheduled_end_time = table_data.row_data.scheduled_end_time;
        var dateStr = '-';
        if(scheduled_end_time  != null){
            daysdiff = scheduled_end_time.days_diff;
            var diff = '<span class='+(daysdiff.diff_key && [translate("sdp.projects.daydiff.late"), translate("sdp.projects.daydiff.passed")].contains(daysdiff.diff_key)? 'listview-dateinfo-delay':'listview-dateinfo')+'>'+daysdiff.diff+'</span> '+ (daysdiff.diff_key? daysdiff.diff_key:'');
            dateStr = scheduled_end_time.display_value+' ('+diff+')';
        }
        return '<span rel="uitip" mode_ellipsis="true" mode_html="true" title="'+e_attr(dateStr)+'">'+(dateStr)+'</span>';
    },
    callbackAfterTableRender : function(tableOptions,_self){
        // to toggle the searchrow for dashboard.
        if($taskList.taskOptions.dashboardOwner){
            table_comp_task.toggleSearchRow();
            /* The Owner value in search field is assigned separately as the above function
             doesn't support search criteria but only searchfields.
            this is a temporary fix */
            jQuery(".searchRow [data-id='owner.name']").val($taskList.taskOptions.dashboardOwner);
            delete $taskList.taskOptions.dashboardOwner
        }
        if(($taskList.taskOptions.module === 'change' && !($taskList.taskOptions.from === 'printView')) || $taskList.taskOptions.module !== 'change') {
            $tasks.updateParentTaskCount($taskList.taskOptions.module, $taskList.taskOptions.moduleId);
        }
        table_combined_task && table_combined_task.refreshTable();
        if(($taskList.taskOptions.module && $taskList.taskOptions.module.startsWith("cm_")) || (($taskList.taskOptions.module === 'change' || $taskList.taskOptions.module === 'release') && !$taskList.taskOptions.stageId)){// NO I18N
            jQuery("#content-details-inner-"+$taskList.taskOptions.module).removeClass("oxa");// NO I18N
        }else if($taskList.taskOptions.module === 'project' || $taskList.taskOptions.module === 'milestone'){//No I18N
            jQuery(".searchRow input").addClass("fw");
        }else if($taskList.taskOptions.module === 'request'){//No I18N
            jQuery(".searchRow input").parents("div .d_w").addClass("p5");//No I18N
        }

        jQuery("#tasksList #ListViewFilterMenu").off().on('click',function(){
            var filterList_obj = new filterListComp();
            filterList_obj.initComponent({
                element             : "#tasksList #ListViewFilterMenu",    //No I18N
                module              : "task",    //No I18N
                personalize_key     : "task_filter_views",    //No I18N
                filter_action       : "$taskList.changeFilter",    //No I18N
                managefilter_url    : "/ListViewFilter.do?module=task&action=listview",   //No I18N
                user_type           : sdp_user.USERTYPE,
                favoritable         : true,
                skipPersonalization : true,
                custom_filters      : sdp_user.USERTYPE === "Technician"// NO I18N
            });
            $extFrame.setOptions('#tasksList #ListViewFilterMenu');// NO I18N
        });

        if($taskList.taskOptions.viewMode == "kanban"){
            initTooltip("#listview");// NO I18N
        }
    },
    callbackSearchFunction: function(a){
        var search_criteria = table_comp_task.t_obj.table_info.list_info.search_criteria;
        search_criteria = search_criteria ?[search_criteria] : [];
        if(search_criteria[0] && search_criteria[0].children){
            search_criteria = search_criteria.concat(search_criteria[0].children);
            delete search_criteria[0].children;
        }
        $taskList.taskOptions.stageCriteria && search_criteria.push($taskList.taskOptions.stageCriteria);

        if($taskList.taskOptions.advFilterCrit){
            search_criteria = search_criteria.concat($taskList.taskOptions.advFilterCrit);
        }
        table_comp_task.t_obj.table_info.list_info.search_criteria = search_criteria;
        table_comp_task.refreshTable();
    },
    /*
        *A callback function for inline updates
    */
    saveInlineEditChanges : function (arg, cur_ele,_self) {

        var entity_id = arg[0].entity_id ,sel_val = arg[0].fieldid, input_obj={}, field = arg[0].field, temp = {};
        if(arg[0].type == "select" || arg[0].type == "lookup"){
            temp[field] = sel_val && sel_val !="" ? { "id": sel_val } : null;
        }else{
            temp[field] = sel_val && sel_val !="null" ? { "value": sel_val } : null;// NO I18N
        }
        input_obj[_self.t_obj.options.inlineEditEntity] = temp;

        var url = '';
        if(cur_ele.isUnifiedView) {
            var taskData = _self.loadedRecords[entity_id].task;
            var moduleId = taskData.associated_entity != 'general' ?taskData[taskData.associated_entity].id:'';// NO I18N
            url = $tasks.getEntityURL(taskData.associated_entity, moduleId,taskData.associated_entity === 'milestone'? taskData['project'].id:'', entity_id); //NO I18N
        }else{
            url = _self.loadedRecords[entity_id].baseURL+"/"+entity_id;
        }

        sdpAjax({
            url : '/api/v3/'+url, //NO I18N
            type : "PUT", //NO I18N
            data : sdpAjaxInputData(input_obj),
            acceptODCompatible: true, async : false,
            ignorefailuremessage: (input_obj.task.status)? true : false,  // Task Closing Rules warning msg when closing a task
            success : function(resp){
                if(input_obj.task.status && jQuery.isArray(resp.response_status)){ // Task Closing Rules warning msg when closing a task
                    $tasks.successMessageHandling(resp, window.translate("sdp.project.history.closetask0"));
                    return
                }
                var message = "";
                if(resp.response_status.messages){
                    message = resp.response_status.messages[0].message;
                }else{
                    message = translate("api.updated.success", [ translate("common.task") ]);
                }
                showalert('success',message,"isAutoHide=true");// NO I18N
                _self.refreshTable();
                if(arg[0].field == "status"){
                    if($taskList.taskOptions && ( $taskList.taskOptions.module == "release" || $taskList.taskOptions.module == "change" )){// NO I18N
                        window.top.$rc.refreshLeftPanelCount("task");// NO I18N
                    }
                    if($taskList.taskOptions && $taskList.taskOptions.module == "problem"){// NO I18N
                        window.top.$problemDetails.refreshRightSectionProperties("tasks");// NO I18N
                    }
                }
            },
            error: function(res) {
                var field = res.responseJSON.response_status.messages && res.responseJSON.response_status.messages[0].field;
                if(field && ["scheduled_start_time", "scheduled_end_time", "actual_start_time", "actual_end_time"].indexOf(field) > -1) {
                    var msg = (field === "scheduled_start_time" || field === "scheduled_end_time")? "api.validation.scheduledstart.scheduledend" : "api.validation.actualstart.actualend"; //NO I18N
                    showalert('failure', translate(msg), "isAutoHide=false");// NO I18N
                }
                var result = res.responseJSON.response_status.messages && res.responseJSON.response_status.messages[0];
                if(result.status_code >= 60000 && result.status_code <= 60006){
                    showalert('failure', translate(result.message), "isAutoHide=false");//NO I18N
                }
            }
        });
    },

     /*
        * A function to show confirmation popup for task dependency scheduling in task edit form
    */
    loadConfirmationForTaskDependency: function(arrObj, cur_ele){
        arrObj = arrObj[0];
        var field = arrObj.field;
        var value = arrObj.fieldid;
        var prev_val = table_comp_task.loadedRecords[+arrObj.entity_id][field];
        if(field && ["scheduled_start_time", "scheduled_end_time"].indexOf(field) > -1 && !(value == "null") && (prev_val != null)){
            showconfirm(true,
            "title="+translate('common.confirm')+"," + //No I18N
            "message=" + translate("project.validation.horizontal.propagate.alert") + "," + //No I18N
            "submitbutton=" + translate("common.proceed") + "," + //No I18N
            "cancelbutton=" + translate("common.no") + "," + //No I18N
            "closebutton=yes,closeOnEscKey=yes",// NO I18N
            plainTextConfirmation, true);
            function plainTextConfirmation(confirm){
                if(!confirm){return confirm;}
                table_comp_task.saveInlineEditChanges(arrObj, cur_ele);
                table_comp_task.refreshTable("refresh");// No I18N
                jQ("#_CALDIALOG_LAYER").css("visibility", "hidden"); // No I18N
            }
        }
        else{
            table_comp_task.saveInlineEditChanges(arrObj, cur_ele);
            table_comp_task.refreshTable("refresh");// No I18N
            jQ("#_CALDIALOG_LAYER").css("visibility", "hidden"); // No I18N
        }
    },
    /*
        *A function for constructing no databanner message in Task ListView
    */
    setNoDataBanner : function(table_data){
        if((table_data.t_obj.table_info.list_info.filter_by && table_data.t_obj.table_info.list_info.filter_by.id !== 0) || (table_data.t_obj.table_info.list_info.search_criteria && (!$taskList.taskOptions.stageCriteria || table_data.t_obj.table_info.list_info.search_criteria.children || table_data.t_obj.table_info.list_info.search_criteria.length>1)) || table_data.tableId === "showAllTasks_tasks" || $taskList.taskOptions.from === "printView"){
            return false;
        }

        var html  = '<div class="alert-nodata mt10">';
        if($taskList.taskOptions.module == 'change')//css changes from ui team
        {
            html  = '<div class="alert-nodata mt20">';
        }
        html     += '<span class="msg">';
        html     += '<span data-i18n-key="sdp.projects.notasks">'+translate("sdp.projects.notasks")+'</span>';
        if($taskList.taskOptions.allowedOperations.add){
            var module = $taskList.taskOptions.module;
            var moduleId = $taskList.taskOptions.moduleId;
            var projectId = module == 'milestone' ?$taskList.taskOptions.projectId: null;// NO I18N
            var stageId = ( module == 'release' || module == 'change' ) && $taskList.taskOptions.stageId ?$taskList.taskOptions.stageId: null;// NO I18N
            html     += '<a class="text-link ml5" href="/" data-name="module_add_task" data-event="click" data-handler="$tasks.loadTasks(\'form\',\''+module+'\','+moduleId+',null,null,'+projectId+','+stageId+')" nonce='+sdpNonce+' data-i18n-key="task.create">'+ translate("task.create")+'</a>';
            html     += '<span class="ml5" data-i18n-key="sdp.admin.common.or">'+translate("sdp.admin.common.or")+'</span>';
            html     += '<a class="text-link ml5" href="/" data-name="module_add_task_from_template" data-event="click" data-handler="$tasks.loadTasks(\'template\',\''+module+'\','+moduleId+',null,null,'+projectId+','+stageId+')" nonce='+sdpNonce+' data-i18n-key="sdp.admin.tasktemplate.addtaskbytemplate">'+ translate("sdp.admin.tasktemplate.addtaskbytemplate")+'</a></span>';// NO I18N
        }
        return html+'</div>';
    },
    /*
        * A function used to open organize dialog for tasks.
    */
    openOrganizeDialog :  function() {
        $taskList.getEntityTasks();
        jQuery("#organize-tasks-popup").dialog({
            width: 450,
            modal: true,
            close:function(){
                jQuery(this).dialog("destroy"); //No I18N
                jQuery('#taskOrgSave').prop('disabled',true);// NO I18N
            },
            open: function() {
                initTooltip('#organize-tasks-popup');// NO I18N
            }
        });
        //used for sorting (re-order) tasks for organising
        jQuery('[data-id=organizetasks] ul').sortable({
            containment: "#organize-tasks", //No I18N
            handle: ".drag1",//NO I18N
            axis: 'y',//NO I18N
            start: function(e, ui) {
                ui.placeholder.height(ui.item.height());
                ui.placeholder.css({'visibility':'visible'});//NO I18N
            },
            stop:function(){
                jQuery('#taskOrgSave').prop('disabled',false);// NO I18N
            }
        });
    },
    /*
        * A function used to get all the tasks
    */
    getEntityTasks : function(){
        var json_data = {sort_order:"asc",sort_field:"index",row_count:"100",start_index:1, "fields_required":["id", "title"]};// NO I18N
        if($taskList.taskOptions.module == "release"  || $taskList.taskOptions.module == "change"){
            json_data.search_criteria = {"field": "stage","value": $taskList.taskOptions.stageId,"condition": "is"};// NO I18N
        }
        var entityData = [], hasmorerows = true;
        while(hasmorerows){
            sdpAjax({
                url: '/api/v3/'+table_comp_task.t_obj.options.callbackURL,// NO I18N
                async: false, acceptODCompatible:true,
                data: sdpAjaxInputData({list_info:json_data}),
                success: function(response){
                    entityData = entityData.concat(response["tasks"]);
                    if(response.list_info && response.list_info.has_more_rows == true){
                        json_data.start_index = entityData.length + 1;
                    }else{
                        hasmorerows=false;
                    }
                },
                error : function(){
                    hasmorerows=false;
                }
            });
        }
        var organizeEle = jQuery('#organize-tasks');
        organizeEle.html('');
        jQuery.each(entityData, function(index,fieldObj){
            organizeEle.append('<li data-task-id='+fieldObj.id+'><div class="text-overflow w-420px"><span class="cspr drag1 icon-xs ml20 mr5 cursor-move top-1"></span><span class="p5 fw" rel="uitip" mode_ellipsis="true" title="'+e_attr(fieldObj.title)+'">'+e_html(fieldObj.title)+'</span></div></li>');
        });
    },
    /*
        * A function used to save (organize) for business tasks.
    */
    saveTasksAfterOrganized : function(indexCtrl) {
        showconfirm(true, 'title='+translate("common.confirm")+', message=' + translate("sdp.release.task.organize.confirm") + ', submitbutton=OK, cancelbutton=Cancel, closebutton=yes, closeOnEscKey=yes', function(confirm){// NO I18N
            if(confirm){
                var organizeList =  jQuery("[data-id=organizetasks] li");
                //get all tasks list i after reordered
                var dataOrder = organizeList.map(function() {
                    return this.getAttribute('data-task-id');
                }).get();

                sdpAjax({
                    type: 'PUT',// NO I18N
                    url: '/api/v3/'+table_comp_task.t_obj.options.callbackURL+'/_organize?ids='+dataOrder,// NO I18N
                    async:false, acceptODCompatible:true,
                    success:function(response) {
                        if(response.response_status && response.response_status.messages) {
                            showalert('success',response.response_status.messages[0].message,"isAutoHide=true");// NO I18N
                        }
                        //for closing organizepopup after updated
                        jQuery("#organize-tasks-popup").dialog('close');// NO I18N
                        table_comp_task.refreshTable();
                    }
                });
            }
        });
    },
    /*
        *A function used to trigger task
        *@PARAM taskId - Task ID
        *@PARAM from - BulkTrigger or Trigger
    */
    triggerTask: function(taskId, from) {
        var url, message = "sdp.tasks.list.start.confirm";// NO I18N
        if(taskId) {
            url = (from === 'combinedView' ?table_combined_task.loadedRecords[taskId].task.baseURL: table_comp_task.loadedRecords[taskId].baseURL) +"/"+taskId+"/_trigger";
        } else {
            url = table_comp_task.t_obj.options.callbackURL+"/_trigger?ids="+table_comp_task.bulkSelect.getSelectedIDs(); //No I18N
        }

        showconfirm(true,
            "title="+translate('common.confirm')+"," + //No I18N
            "message=" + translate(message) + "," + //No I18N
            "submitbutton=" + translate("common.proceed") + "," + //No I18N
            "cancelbutton=" + translate("common.no") + "," + //No I18N
            "closebutton=yes,closeOnEscKey=yes",// NO I18N
            function(didConfirm) {
                if (didConfirm) {
                    success_msg = translate("sdp.tasks.startnow.started"); //No I18N
                    sdpAjax({
                        url : "/api/v3/"+url, //NO I18N
                        type : 'PUT', //No I18N
                        acceptODCompatible: true, ignorefailuremessage: true, async : false,
                        success : function(resp){
                            showalert('success', success_msg, "isAutoHide=true");// NO I18N
                            (from === 'combinedView')?table_combined_task.refreshTable():table_comp_task.refreshTable();// NO I18N
                        },
                        error : function(xhr){
                            var resp = xhr.responseJSON;
                            var failure_msg="", warning_msg="";
                            var failedArr = [], successArr = [], warningArr = [];
                            if(resp.response_status && resp.response_status.constructor === Array){
                                resp.response_status.each(function(ele){
                                    if(ele.status_code != 2000){
                                        if(ele.messages[0].status_code == 8001){
                                            warningArr.push(ele.id);
                                            warning_msg = ele.messages[0].message;
                                        }else{
                                            failedArr.push(ele.id);
                                            failure_msg = ele.messages[0].message;
                                        }
                                    }else{
                                        successArr.push(ele.id);
                                    }
                                });
                                if(successArr.length){
                                    success_msg = success_msg + " [ "+successArr.join(", ")+ " ]";
                                    showalert('success',e_html(success_msg),"isAutoHide=true");// NO I18N
                                    table_comp_task.refreshTable();
                                }
                                if(warningArr.length){
                                    warning_msg = warning_msg + " [ "+warningArr.join(", ")+ " ]";
                                    showalert('info',e_html(warning_msg),"isAutoHide=false");// NO I18N
                                }
                                if(failedArr.length){
                                    failure_msg = failure_msg + " [ "+failedArr.join(", ")+ " ]";
                                    showalert('failure',e_html(failure_msg),"isAutoHide=false");// NO I18N
                                }
                            }else{
                                showalert((resp.response_status.messages[0].status_code === 8001)? 'info' : 'failure', e_html(resp.response_status.messages[0].message),"isAutoHide=false");// NO I18N
                            }
                        }
                    });
                }
            }
        );
    },
    /*
        *A function used to add a quick task
    */
    addQuickTask : function(event){
        var input_value = jQuery("#t_quick_add").val().trim();
        var assignee = jQuery("#t_quick_assignee").select2("val") || {};// NO I18N
        if(input_value){
            jQuery("#t_quick_assignee").attr("disabled",false);
                var select2Options = {
                    cache:{}, multiple:false, allowClear: true,
                    placeholder: translate("form.select.placeholder", [translate('common.owner')]),
                    url:[{
                        url:"/api/v3/"+table_comp_task.t_obj.options.callbackURL+"/owner",//NO I18N
                        field:'owner',//NO I18N
                        list_info:{fields_required:["name"],"row_count":20}, //No I18N
                        headers : { Accept: "vnd.manageengine.v3+json" },// NO I18N
                        input_data_Callback : function(e,t,s) {
                            t.list_info.fields_required = ["name", "is_online"];    //No I18N
                            let criteria = t.list_info.search_criteria || [];
                            if(assignee && assignee.online){
                                criteria.push({
                                    field: "is_online", //No I18N
                                    condition: "is",    //No I18N
                                    value: "1",
                                    logical_operator: "AND" //No I18N
                                });
                            }
                            if(criteria.length > 0) {
                                if(criteria.length === 1) {
                                    t.list_info.search_criteria = criteria[0];
                                } else {
                                    t.list_info.search_criteria = criteria;
                                }
                            }
                            return t;
                        }
                    }]
                };
            if($taskList.taskOptions.module !== 'project' && $taskList.taskOptions.module !== 'milestone' && (!$taskList.taskOptions.module || !$taskList.taskOptions.module.startsWith("cm_"))) {
                select2Options = {
                    ...select2Options,
                    processResults:  FC.config.techStatus.processResults,
                    formatSelection: FC.config.techStatus.formater,
                    formatResult: FC.config.techStatus.formater,
                    sortResults: $tasks.sortTechnician
                }
            }
            jQuery("#t_quick_assignee").sdp_select2(select2Options);
            if($taskList.taskOptions.module !== 'project' && $taskList.taskOptions.module !== 'milestone' && (!$taskList.taskOptions.module || !$taskList.taskOptions.module.startsWith("cm_"))) {
                assignee.element = jQuery("#t_quick_assignee"); //NO I18N
                FC.config.techStatus.handleFilter(jQuery("#t_quick_assignee"), true, assignee);
            }
        }
        else{
            jQuery("#t_quick_assignee").select2("destroy").val("").attr("disabled",true); //No I18N
        }
        if(event.code == 'Enter') {
            event.preventDefault();
            if(input_value == ''){
                jQuery("#t_quick_add").val("");
                showalert("failure", translate("sdp.common.titleerrormessage"), "isAutoHide=false"); //No I18N
                return;
            }

            var input_data =  {"task":{"title":input_value}}; //No I18N
            if(!isNaN(assignee)){
                input_data.task.owner = {"id": assignee};// NO I18N
            }

            if(window.isMSPOrSCP && getAccountId() != 0 && ($taskList.taskOptions.from === 'showAllTasks' ||  $taskList.isMSPSCP_AccountPage)){
                input_data.task.account = {"id" : getAccountId()};// NO I18N
            }

            if($taskList.taskOptions.module == 'release' || $taskList.taskOptions.module == "change"){
                input_data.task.stage = {"id":$taskList.taskOptions.stageId};// NO I18N
            }

            sdpAjax({
                url : "/api/v3/"+table_comp_task.t_obj.options.callbackURL,// NO I18N
                type : "POST", acceptODCompatible: true, async : false,//NO I18N
                data : sdpAjaxInputData(input_data),
                success : function(resp){
                    showalert('success',translate("common.taskadded"),"isAutoHide=true");// NO I18N
                    table_comp_task.updateTableInfoPeronalization(module)
                    jQuery("#t_quick_add").val("");
                    jQuery("#t_quick_assignee").select2("destroy").val("").attr("disabled",true);// NO I18N
                    setTimeout(function(){jQuery("#t_quick_add").focus()},10);
                }
            });
        }
    },
    /*
        *A function used to enable quick task template
    */
    showQuickAdd : function(){
        jQuery("#addquick_task").addClass("active").closest("#listcontrols").find("#quickadd_container").removeClass("hide").find(".task-quick-add").addClass("active").end().find("#btn_quick_add").removeClass("active"); //NO I18N
        jQuery("#t_quick_add").focus();
        jQuery("#t_quick_assignee").off("change").on("change",function(event){// NO I18N
            event.code = 'Enter';// NO I18N
            $taskList.addQuickTask(event);
        });
    },
    /*
        *A function used to  hide quick task template
    */
    cancelQuickadd : function(){
        jQuery("#addquick_task").removeClass("active").closest("#listcontrols").find("#quickadd_container").addClass("hide").find(".task-quick-add").removeClass("active").end().find("#btn_quick_add").addClass("active"); //NO I18N
        jQuery("#t_quick_add").val("");// NO I18N
        jQuery("#t_quick_assignee").select2("destroy").val("").attr("disabled",true);// NO I18N
    },
    /*
        *A function used to  construct the tags
    */
    constructTags : function (table_data,_self) {
        var tags = table_data.row_data.tags;
        if(tags && tags.length > 0) {
            var html = '<div class="divider"></div><div class="disp-flex flex-wrap vmiddle"> <label class="text-muted m0 text-overflow disp-ib  vmiddle"> <span>'+translate("sdp.header.tags")+'</span> </label> <span class="vmiddle mr5 ml5">:</span> ';
            tags.forEach(function(element, index){
                html += '<span class="block-bordered lineh14 mb10 mr5 rounded50 whitebg maxw-120px"> <span class="disp-ib text-overflow fw pt4 pb4 pl10 pr10" data-id="tag-text" title="'+e_attr(element.name)+'" rel="uitip" mode_ellipsis="true">'+e_html(element.name)+'</span> </span>';
            });
            return html+='</div>';
        }
    },
    /**
     * Retrieves the SPA container element if the user is on the "/ui/home" page
     * @returns An object containing the selected element or an empty object.
    */
    spaSubContainer : function(){
        return (window.location.pathname=="/ui/home") ? {"element" : jQuery('#spa-container[data-spa-subcontainer="true"]')} : {}; //NO I18N
    },
    /*
        *A function used to Switching views
    */
    switchTo : function(current_view_mode) {
        var perObj = $tasks.getPersonalization("showAllTasks_tasks", "tasks") ;       //NO I18N
        perObj.current_view_mode = current_view_mode;
        addPersonalization("showAllTasks_tasks",perObj); //No I18N
        $spa.navigate("/ui/tasks?mode=list&from=showAllTasks","home", "", false, this.spaSubContainer());      //NO I18N
    },
    /*
        *A function used to Update Kanban Task
    */
    updateKanbanTask : function(taskId, tocolumn, field, kanban, callback, fromcolumn){
        var temp = {}, sel_val = tocolumn,input_obj = {}, baseURL;
        temp[field] = sel_val && sel_val !="0" ? { "id": sel_val } : null;
        input_obj["task"] = temp;
        kanban_comp_task.kanbanData[field+"_"+fromcolumn].loadedData.forEach(function(value, index){
            if(value.id == taskId){
                baseURL = value.baseURL;
                return false;
            }
        });
        sdpAjax({
            url  : "/api/v3/"+baseURL+"/"+taskId, //NO I18N
            type : "PUT",//NO I18N
            async : false, acceptODCompatible: true,
            data : sdpAjaxInputData(input_obj),
            success : function(resp){
                if(input_obj.task.status && jQuery.isArray(resp.response_status)){
                    $tasks.successMessageHandling(resp, window.translate("sdp.project.history.closetask0"));
                    return;
                }
                var message = translate("api.updated.success", [ translate("common.task") ]);
                if(resp.response_status.messages){
                    message = resp.response_status.messages[0].message;
                }
                showalert(resp.response_status.status, message, "isAutoHide=true"); // NO I18N
                callback(true);
            },
            error: function(xhr){
                var resp = xhr.responseJSON;
                if(resp.response_status[0] && resp.response_status[0].messages){
                    for (value of resp.response_status[0].messages) {
                        var type = (value.type == "warning") ? value.type : "failure";
                        showalert(type,value.message,"isAutoHide=false");// NO I18N
                    }
                }else if(resp.response_status.messages[0] && resp.response_status.messages[0].field == 'owner' && resp.response_status.messages[0].status_code == 4001){
                    showalert('failure',translate("sdp.task.invalid.owner"), "isAutoHide=false");// NO I18N
                }else if(resp.response_status && resp.response_status.messages){
                    for (value of resp.response_status.messages) {
                        var type = (value.type == "warning") ? value.type : "failure";
                        showalert('failure',value.message,"isAutoHide=false");// NO I18N
                    }
                }else {
                    showalert(resp.response_status.status,resp.response_status.message,"isAutoHide=false");// NO I18N
                }
                callback(false);
            },
        });
    },
    /*
        A function to render the tasks inside Task Unified View in Project/Request ListView
    */
    renderUnifiedView: function(paramsJSON, pendingOnly){
        var module = paramsJSON.module;
        var moduleId = paramsJSON.moduleId;
        var scheduledEnd = paramsJSON.scheduledEnd;
        var closeAsComplete = paramsJSON.closeAsComplete;
        $taskList.scheduler = Object.assign(paramsJSON, $taskList.scheduler);

        if(pendingOnly){
            Handlebars.registerHelper("renderGroupOwner", function(task, field) {//NO I18N
              return task['marked_'+field]? task['marked_'+field].name:(task[field]?task[field].name:'-');
            });
            Handlebars.registerHelper("constructLinkCell", function(task) {//NO I18N
                switch(task.associated_entity){
                    case "request":// NO I18N
                        return '<span class="text-muted mr5 text-overflow disp-ib vmiddle maxw-120px">'+translate("common.requestid") +':</span><a href="/WorkOrder.do?woMode=viewWO&woID='+task.request.id+'" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" mode_html="true" title="'+e_attr(e_html(task.request.subject))+'">#'+task.request.id+'</span></a>';
                    case "project":// NO I18N
                        return '<span class="text-muted mr5 text-overflow disp-ib vmiddle maxw-120px">'+translate("project.id")+':</span><a href="/ProjectAction.do?submitaction=ViewProject&amp;projectid='+task.project.id+'" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" mode_html="true" title="'+e_attr(e_html(task.project.title))+'">#'+task.project.id+'</span></a>';
                    case "change":// NO I18N
                        return '<span class="text-muted mr5 text-overflow disp-ib vmiddle maxw-120px">'+translate("sdp.change.changeId")+':</span><a href="/ui/changes?entity_id='+task.change.id+'&mode=detail#tasks" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" mode_html="true" title="'+e_attr(e_html(task.change.title))+'">#'+task.change.id+'</span></a>';
                    case "problem":// NO I18N
                        return '<span class="text-muted mr5 text-overflow disp-ib vmiddle maxw-120px">'+translate("sdp.problem.problemId")+':</span><a href="/ui/problems?mode=detail&entity_id='+task.problem.id+'" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" title="'+e_attr(e_html(task.problem.title))+'">#'+task.problem.id+'</span></a>';
                    case "milestone":// NO I18N
                        return '<span class="text-muted mr5 text-overflow disp-ib vmiddle maxw-120px">'+translate("sdp.project.taskattribute.milestoneid")+':</span><a href="/MileStoneAction.do?projectid='+task.project.id+'&submitaction=ViewMileStone&milestoneid='+task.milestone.id+'" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" mode_html="true" title="'+e_attr(e_html(task.milestone.title))+'">#'+task.milestone.id+'</span></a>';
                    case "release":// NO I18N
                        return '<span class="text-muted mr5 text-overflow disp-ib vmiddle maxw-120px">'+translate("common.release.id")+':</span><a href="/ui/releases?entity_id='+task.release.id+'&mode=detail#submission/details" target="_blank" rel="noopener noreferrer" class="disp-ib vbottom"><span rel="uitip" mode_html="true" title="'+e_attr(e_html(task.release.title))+'">#'+task.release.id+'</span></a>';
                }
            });
            Handlebars.registerHelper("appendImageToken", function(description, imageToken) {//NO I18N
                return appendImageToken(description, imageToken);
            });
            Handlebars.registerHelper("getImgSrc", function(owner, imageToken) {//NO I18N
                if(!owner || owner.profile_pic["content-url"].indexOf("default-profile-pic") != -1){
                  return "/images/default-profile-pic2.svg";// No I18N
                }
                return owner.profile_pic["content-url"]+"?key="+imageToken;// No I18N
            });
        }

        var input_data = {"include":["image_token"],"list_info":{"start_index":"1", "filter_by":{"name":"pending_tasks"},"row_count":"100","sort_order":"asc","sort_field":"scheduled_end_time","fields_required":["id","title","owner","marked_owner","scheduled_start_time","scheduled_end_time","actual_start_time","actual_end_time","description","estimated_effort","percentage_completion","status.name","status.color","status.in_progress","associated_entity","overdue"]}};// NO I18N
        var url ="tasks";// NO I18N
        if(module === "request"){
            input_data.list_info.fields_required = input_data.list_info.fields_required.concat(["group","marked_group","request.technician","request.created_time","request.subject","request.due_by_time","request.is_service_request"]);// NO I18N
            url = module+"s/"+moduleId+"/tasks";// NO I18N
        }else if(module === "project"){// NO I18N
            input_data.list_info.fields_required =input_data.list_info.fields_required.concat(["project.owner","project.title","project.scheduled_start_time","project.scheduled_end_time","milestone"]);// NO I18N
            url = module+"s/"+moduleId+"/tasks";// NO I18N
        }
        if(scheduledEnd){
            input_data.list_info.fields_required = input_data.list_info.fields_required.concat(["request","project","change","problem","milestone","release","group","marked_group"]);// NO I18N
            scheduledEnd-=scheduledEnd%1000;
            input_data.list_info.search_criteria = {"condition":"is","field":"owner.id","value":window.top.jQuery("#TechList").val()||sdp_user.LOGGEDIN_USERID,"children":[{"condition":"is", "field":"marked_owner", "value":null,"logical_operator":"AND"},{"condition": "between","field":"scheduled_end_time","logical_operator":"AND","values":[parseInt(scheduledEnd), parseInt(scheduledEnd)+86400000-1]}]};// NO I18N
        }else {
            if(!pendingOnly){
                delete input_data.list_info.filter_by;
            }
        }

        sdpAjax({
            url:"/api/v3/"+url, acceptODCompatible: true, cache:false,// NO I18N
            data: sdpAjaxInputData(input_data),
            success: function(response){

                if(scheduledEnd){
                    response.from = 'scheduler';// NO I18N
                    (response.tasks.length == 0)? window.top.$previewComponent.closePreview("taskmodule_popup"):'';//No I18N
                }else{
                    response.showPendTasks = $taskList.scheduler.showPendTasks;
                    response.pendingOnly = pendingOnly;
                    if(response.list_info.row_count == 0){
                        $taskList.renderUnifiedView($taskList.scheduler, false);
                        return;
                    }
                    response.moduleData = response.tasks[0][module];
                    if(module === "request"){// NO I18N
                        response.moduleData.title = response.moduleData.subject;
                        response.moduleData.owner = response.moduleData.technician;
                    }
                    response.module = module;
                }
                response.closeAsComplete = (closeAsComplete == "closed");// NO I18N
                renderhbs("#unifiedView","TaskUnifiedView",response,false,"task");// NO I18N
                initTooltip("#unifiedView");// NO I18N

                var $container = jQuery("#unifiedView");
                $container.off(".unified-view");// NO I18N

                $container.on("click.unified-view", "#expCol", function(){
                    var curJQ = jQuery(this);
                    if(curJQ.attr('data-expand') == "true"){
                        document.getElementById("TaskCollapsePanel").expandAllPanels();
                        curJQ.attr('data-expand','false');
                        curJQ
                            .find('span.cspr')
                                .removeClass('expand-arrow1')
                                .addClass('collapse-arrow1')
                            .end()
                            .find('[data-action=text]')
                                .text(translate("sdp.common.collapseall"));//No I18N
                    }
                    else{
                        document.getElementById("TaskCollapsePanel").collapseAllPanels();
                        curJQ.attr('data-expand','true');
                        curJQ
                            .find('span.cspr')
                                .removeClass('collapse-arrow1')
                                .addClass('expand-arrow1')
                            .end()
                            .find('[data-action=text]')
                                .text(translate("sdp.common.expandall"));//No I18N
                    }
                });

                if(!scheduledEnd){
                    $container.on("click.unified-view", "#pendingOnly", function(event){
                        if(this.checked){
                            jQuery("#unifiedView .status-badge").closest("div .accordion-log").fadeOut(700);// NO I18N
                        }else{
                            if(jQuery("#unifiedView .status-badge").length == 0){
                                $taskList.renderUnifiedView($taskList.scheduler, false);
                            }else{
                                jQuery("#unifiedView .status-badge").closest("div .accordion-log").fadeIn(700);// NO I18N
                            }
                        }
                    });
                }else{
                    var search_criteria = [{"field":"id","condition":"is not","value":window.top.jQuery("#TechList").val() || sdp_user.LOGGEDIN_USERID}]; //restricted the current technician in the calendar to be listed in the owner dropdown //NO I18N
                    jQuery("#unifiedView #taskOwner").sdp_select2({
                        url:[{
                            url:"/api/v3/tasks/owner",//NO I18N
                            field:'owner',//NO I18N
                            list_info:{start_index:1,row_count:25,fields_required:["name"],search_criteria:search_criteria},
                            headers : { Accept: "vnd.manageengine.v3+json" }// NO I18N
                        }]
                    });
                    jQuery("#unifiedView input[type=checkbox]").on("click.unified-view", function(event){
                        event.stopPropagation();
                        jQuery("#unifiedView #reassign").prop("disabled",jQuery("#unifiedView input[type=checkbox]:checked").length === 0); //No I18N
                        jQuery(this).closest("div.flipper").toggleClass("flip-active");//No I18N
                        jQuery(this).closest("div.cv-task-item").toggleClass("selected-row");//No I18N
                    });
                    $container.removeAttr("style");

                    $container.on("click.unified-view", "#reassign", function(){
                        var ownerID = jQuery("#taskOwner").val();
                        if(ownerID == ""){
                            showalert("warning", translate("sdp.calendar.viewrequest.jserror1"), "isAutoHide=false");//No I18N
                            return;
                        }
                        $taskList.scheduler.successIds = [];
                        jQuery("#unifiedView input[type=checkbox]:checked").each(function(){
                            $tasks.updateTaskData('scheduler_assign', {owner: {id: ownerID}}, this.closest("label").getAttribute("data-url")); // NO I18N
                        });
                        if($taskList.scheduler.successIds.length > 0){
                            window.top.showalert("success",translate("task.assign.success")+" ["+$taskList.scheduler.successIds+"]","isAutoHide=true");// NO I18N
                        }
                        window.top.loadCalendarForTech(window.top.jQuery("#TechList").val()||sdp_user.LOGGEDIN_USERID);//No I18N
                        $taskList.renderUnifiedView($taskList.scheduler, true);
                    });
                }
            }
        });
    }
};
//# sourceURL=taskList.js;
