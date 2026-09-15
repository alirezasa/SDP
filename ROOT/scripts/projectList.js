/* $Id$ */
var kanban_project;
var $projectList={
	init : function(options){
        var _self = this;
        _self.options = options || {};
        _self.options.allowedOperations = {};
        _self.options.entity = _self.options.url = _self.options.tableHolder = _self.options.personalize_key = "projects";// No I18N

        if(_self.options.from === "request"){
            _self.options.url = "requests/"+$extFrame.getActiveWindow().$req.details.request_info.id+"/projects/project";//No I18N
            _self.options.personalize_key = _self.options.from+"_"+_self.options.tableHolder;
            _self.options.entity = "project";//No I18N
        }
        _self.options.tableInfo = $tasks.getPersonalization(_self.options.personalize_key, "projects");//No I18N

        if(["printView", "request", "dashboard"].indexOf(_self.options.from) != -1 || (!_self.options.canViewAllProjects && (["resMgmt","kanban"].indexOf(_self.options.tableInfo.current_view_mode) != -1)) || options.gsearch){
            _self.options.tableInfo.current_view_mode = 'table';//No I18N
        }

        if(_self.options.tableInfo.current_view_mode == "gantt"){
            $spa.navigate("/GanttAction.do?mode=read", "projects");//No I18N
            return;
        }else if(_self.options.tableInfo.current_view_mode == 'resMgmt'){//No I18N
            $spa.navigate("/ui/projects?mode=resource", "projects");//No I18N
            return;
        }

        if(options.gsearch){
            delete _self.options.tableInfo.list_info.filter_by;
            _self.options.tableInfo.list_info.gsearch = options.gsearch;
            jQuery("#subheader_search_box").val(options.gsearch);
        }else{
            jQuery("#subheader_search_box").val("");
        }
        if(_self.options.from === 'printView'){
            delete _self.options.personalize_key;
        }
        if(_self.options.from !== "printView" && _self.options.from !== "request"){
            sdpAjax({
                url: '/api/v3/projects/_links', ignorefailuremessage: true, async: false, acceptODCompatible: true,// No I18N
                data: sdpAjaxInputData({"operations_required": ["add","delete"]}),// No I18N
                success: function(resp){
                    if(resp._links){
                        resp._links.forEach(function(value, index){
                            if(value.method == "post"){
                                _self.options.allowedOperations["add"] = true;
                            }else if(value.method == "delete"){//NO I18N
                                _self.options.allowedOperations["delete"] = true;
                            }
                        });
                    }
                }
            });
        }

        var filterId = "0";
        if(_self.options.tableInfo.list_info.filter_by){
            filterId = _self.options.tableInfo.list_info.filter_by.id;
        }
        _self.options.viewMode = _self.options.tableInfo.current_view_mode ?_self.options.tableInfo.current_view_mode:"table";      // No I18N
        if(_self.options.viewMode == "classic"){
            _self.options.personalize_key = "classic_projects";//NO I18N
            _self.options.tableInfo = $tasks.getPersonalization(_self.options.personalize_key, "projects");           //No I18N
            if(!_self.options.tableInfo.list_info.sort_field){
                _self.options.tableInfo.list_info.sort_field="id";//NO I18N
                _self.options.tableInfo.list_info.sort_order="asc";//NO I18N
            }
        }
        _self.options.current_view = translate("sdp.admin.projectroles.allowallprojects");
        if(options.gsearch){
            _self.options.current_view = translate("sdp.leftpanel.search.title")//NO I18N
        }else if($projectList.options.from == "dashboard"){// No I18N
            filterId = $projectList.options.dashboardCriteria.filter_by.id;
            delete _self.options.personalize_key;
        }
        _self.options.tableInfo.list_info.filter_by = {"id" : filterId};   //NO I18N
        if(filterId != 0){
            sdpAjax({
                url: '/api/v3/list_view_filters/'+filterId, ignorefailuremessage: true, async: false, acceptODCompatible: true,// No I18N
                success: function(resp) {
                    _self.options.current_view = resp.list_view_filter.display_name;
                },
                error: function(){
                    _self.options.tableInfo.list_info.filter_by.id = 0;
                }
            });
        }
        if(_self.options.viewMode == "kanban"){
            _self.options.lazyloadingEnabled            = true;
            _self.options.discarded_fields              = ["description","tags"];//No I18N
            _self.options.cc_discarded_fields           = ["title","id"],    //NO I18N
            _self.options.width                         = "320";        //NO I18N
            _self.options.view                          = 'kanban';     //No I18N
            _self.options.entity_name_s                 = "project";    //NO I18N
            _self.options.view_mode                     = "full_kanban";//NO I18N
            _self.options.default_group_by              = "owner";      //NO I18N
            _self.options.default_sort_field            = "id";         //NO I18N
            _self.options.default_sort_order            = "desc";       //NO I18N
            _self.options.max_allowed_fields            = 20;
            _self.options.row_min_height                = 35;
            _self.options.personalize_key               = "kanban_projects";                            //No I18N
            _self.options.must_included_fields          = ["has_attachments","tags"];     //NO I18N
            _self.options.column_settings               = {"row_custom_class":"kanban-list","assign_label_width": false,"assign_content_width":false};  //No I18N
            _self.options.inlineEdit                    = _self.options.inlineEditEnabled      = false;
            _self.options.columnChooserEnabled          = _self.options.getmetaInfo            = true;
            _self.options.callbackURL                   = _self.options.entity_name            = "projects";    //NO I18N
            _self.options.default_column_order          = ["title","status","priority","scheduled_end_time","projected_end_time"];// NO I18N
            _self.options.default_fields_required       = {"title":"","status":"","priority":"","scheduled_end_time":"","projected_end_time":""};// NO I18N
            _self.options.default_list_info             = {"row_count": "10"};// NO I18N
            _self.options.callbackAfterBodyRender       = _self.callbackAfterTableRender;
            _self.options.callbackRowfunction           = _self.rowDataConstruct;
            _self.options.row_inputdata                 = _self.rowDataConstruct(_self.options.tableInfo,_self);
            _self.options.getGroupByURL                 = _self.constructGroupByURL;
            _self.options.groupByDataHandler            = _self.transformGroupByData;
            _self.options.groupByListInfoHandler        = _self.transformListInfo;
            _self.options.callbackOnAPIFailure          = _self.apiFailureCallback;
            _self.options.icon_settings = {
                "show_icons_Bottom": true,  //No I18N
                "position": 1, //No I18N
                "rowPosition" : 1  //No I18N
            };
            _self.options.group_by_list = [{
                id: "owner",                //No I18N
                name: translate("common.owner"),            //No I18N
                pl_name: translate("common.owner"),         //No I18N
                type: "user",               //No I18N
                additional_fields: {
                    "status": "",           //No I18N
                    "priority": "",         //No I18N
                },
                unassigned: {
                   name: translate("sdp.common.unAssign")   //No I18N
                }
            }, {
                id: "status",               //No I18N
                name: translate("common.status"),           //No I18N
                pl_name: translate("common.statuses"),      //No I18N
                type: "color",              //No I18N
                additional_fields: {
                    "owner": "",            //No I18N
                    "priority": "",         //No I18N
                }
            }, {
                id: "priority",             //No I18N
                name: translate("common.priority"),         //No I18N
                pl_name: translate("common.priorities"),    //No I18N
                type: "color",              //No I18N
                additional_fields: {
                    "owner": "",            //No I18N
                    "status": "",           //No I18N
                },
                unassigned: {
                    color: "#484848",       //NO I18N
                    name: translate("sdp.common.notassigned")   //No I18N
                }
            }];
            _self.options.sort_by_container         = "project-kvsort-container";           //No I18N
            _self.options.group_by_container        = "project-managegroups-container";     //No I18N
            _self.options.manage_group_btn          = "project-kvmanagegroup-btn";          //No I18N
            _self.options.kanban_container          = "project-kanban-container";           //No I18N
            _self.options.kanban_right_container    = "project-kv-right-container";         //No I18N
            _self.options.kanban_outer_container    = "listview";                           //No I18N
            _self.options.updateHandler             = _self.updateKanbanProject;
            _self.options.nodataString              = '<div class="sdp-kanban-nodata"><span class="sdp-kanban-nodatasvg"></span><span class="kanban-list-no-data">'+translate('common.dragdrop.here')+'</span></div>';   //No I18N
            options.appliedFilter = function(){
                jQuery("#ListViewFilterMenu button").hide();
            }
            options.cancelledFilter = function(){
                jQuery("#ListViewFilterMenu button").show();
            }
            renderhbs("#projectsDiv", "ProjectKanban", _self.options, false, "project");// No I18N
            kanban_project = kanbanComponent.initComponent(_self.options.tableInfo, { "header" : _self.headerDataConstruct(_self.tableInfo,_self) }, _self.options, _self, {"viewFilter":_self.initCustomView});//No I18N
        }else{
            renderhbs("#projectsDiv", "ProjectList", _self.options, false, "project");// No I18N
            delete WebComponents.instancePool["webc-project"];//NO I18N
            WebComponents.render("webc-project");
            // Custom View
            _self.options.from !== "printView" && _self.initCustomView();//No I18N
        }
        if(sdp_user.USERTYPE === 'Technician' && (sdp_app && sdp_app.IS_SDP && !sdp_app.IS_REBRAND )){ // No I18N
            //Initiate the help videos
            HelpVideos.init("Projects", "#spa-container");//No I18N
        }
	},
	headerDataConstruct : function(){
	    var _self = this;
        var meta_data = {
            "projects_head_chk"     : {"type": "checkbox", "default": true, "hide_label": true, "dataCelltransformer"  : _self.constructChkboxCell, "column_settings"      : {"position" : 1}, "width":"25px"},// NO I18N
            "milestone_overview"    : {"type": "icon",     "dataCelltransformer"  : _self.constructMilestoneOverview, "width":"25px", "div_class":"ml5", "text" :translate("project.milestone.overview")},  // NO I18N
            "task_overview"         : {"type": "icon",     "dataCelltransformer"  : _self.constructTaskOverview, "width":"25px", "div_class":"ml5", "text" :translate("project.task.overview")},      // NO I18N
            "milestone_progress"    : {"dataCelltransformer"  : _self.constructMilestoneProgress, "text" :translate("project.milestone.progress"), "sortable":false, "searchable":false},  // NO I18N
            "task_progress"         : {"dataCelltransformer"  : _self.constructTaskProgress, "text" :translate("project.task.progress"),"sortable":false, "searchable":false}, // NO I18N
            "editicon"              : {"type": "icon",     "default": true, "hide_label": true, "dataCelltransformer"  : _self.constructEditIcon},// NO I18N
            "owner"                 : {"value_path": "owner.name"},// NO I18N
            "tags"                  : {"dataCelltransformer"  : _self.constructTags,"default" : true, "type":"icon"},// NO I18N
            "title"                 : {"dataCelltransformer"  : _self.constructProjectTitle, "hide_label": true,"column_settings": {"width":"380px","view_type": "row", "rowposition": 1 }},// NO I18N
            "scheduled_end_time"    : {"dataCelltransformer"  : _self.constructScheduleEnd },   // NO I18N
            "actual_end_time"       : {"dataCelltransformer"  : _self.constructActualEnd},      // NO I18N
            "projected_end_time"    : {"dataCelltransformer"  : _self.constructProjectedEnd},   // No I18N
            "priority"              : {"value_path":"priority.name"},// No I18N
            "type"                  : {"value_path":"type.name"},// No I18N
            "status"                : {"value_path":"status.name"},// No I18N
            "requester"             : {"value_path":"requester.name"},// No I18N
            "site"                  : {"value_path":"site.name"},// No I18N
            "department"            : {"value_path":"department.name"},// No I18N
            "created_by"            : {"value_path":"created_by.name"}// No I18N
        };
        _self.options.viewMode !== 'classic' && delete meta_data.projects_head_chk.dataCelltransformer;       //No I18N
        _self.options.viewMode !== "kanban" && delete meta_data.tags;       //No I18N
        (_self.options.viewMode === "kanban" || _self.options.from === "printView" || (_self.options.from !== "request" && _self.options.viewMode == "table" && !_self.options.allowedOperations.delete)) && delete meta_data.projects_head_chk;//NO I18N

        if(_self.options.from === "request"){
            meta_data.projects_head_chk.type = "radio";
            meta_data.projects_head_chk.td_class = "pos-rel headercheckbox";//No I18N
        }else{
            delete meta_data.editicon;
        }

        if(_self.options.from === "request" || _self.options.from === "printView"){
            delete meta_data.task_overview;
            delete meta_data.milestone_overview;
            delete meta_data.task_progress;
            delete meta_data.milestone_progress;
        }

        if(_self.options.viewMode !== 'table'){
            meta_data.title.default = true;
        }

        if(_self.options.viewMode === 'kanban'){
            delete meta_data.task_progress;
            delete meta_data.milestone_progress;
            meta_data.task_overview.default = true;
            meta_data.milestone_overview.default = true;
        }
        return meta_data;
    },
    transformListInfo : function(data,groubBy){
        if(data.list_info.search_criteria && groubBy == "owner") {
            var field = data.list_info.search_criteria[0].field;
            data.list_info.search_criteria[0].field = "user.id";        //No I18N
            data.list_info.search_criteria.push({'field': 'is_active', 'condition' : 'is', 'value' : true, "logical_operator" : "and"});    //No I18N
        }else if(groubBy == "owner") {      //No I18N
            data.list_info.search_criteria = [{'field': 'is_active', 'condition' : 'is', 'value' : true}];      //No I18N
        }
        return data;
    },
    transformGroupByData : function(data){
        if(data.members){
            var members = data.members,owners = [];
            members.forEach(function(member){
               if (!owners.includes(member.user)) {
                 owners.push(member.user);
               }
           });
            data.owner = owners;
            data.response_status.status = "success";    // NO I18N
        }
        return data;
    },
    constructGroupByURL : function(groupBy){
        var url = "/api/v3/projects/";      // NO I18N
        if(groupBy == "owner"){
            url+= "members";        // NO I18N
        }else{
            url+=groupBy
        }
        return url;
    },
    tableOtherOptions: function(){
        var otherOptions = {bulkSelectionSetting:{selectionDisplayField : "title"},nodataString:translate("sdp.project.listview.noprojectavailable")};//No I18N
        var reduce_height = 60;

        if($projectList.options.from === "request"){
            otherOptions.height= jQuery(window).height()-jQuery("#projectsDiv").find(".listcontrols").outerHeight()-reduce_height+10;
            otherOptions.width = jQuery(window).width()-5;
        }else{
            otherOptions.width = (jQuery("body").attr("data-header-tabs") != "topbar"? jQuery(window).width()-jQuery(".sidebar-container").width():jQuery(window).width()) - 22;
            otherOptions.height= jQuery(window).height()-jQuery("#header-placeholder").outerHeight()-jQuery("#top-subheader").outerHeight()-jQuery("#projectsDiv").find(".listcontrols").outerHeight() - reduce_height;
            otherOptions.listSettingEnabled=true;
            otherOptions.listSettingOptions = {
                enableSettings: ["record_per_page","reset_personalization"], //No I18N
                disableSettings: ["text_wrapping","refresh_frequency"]//No I18N
            }
            otherOptions.reinitializeCalback = function(){
                $spa.navigate("/ui/projects?mode=list","projects");  //NO I18N
            }
        }

        if($projectList.options.viewMode == 'classic'){
            otherOptions.nodataString = '<div class="pos-rel tc p10" data-style="top:50%;transform:translateY(-50%);">'+translate("sdp.project.listview.noprojectavailable")+"</div>";
            otherOptions.nodataString = jQuery(otherOptions.nodataString);
            $sdStyleConverter(otherOptions.nodataString);
            otherOptions.column_settings = {
                "default_position": 2,//No I18N
                "assign_label_width": false,//No I18N
                "assign_content_width":false,//No I18N
                "columns": [{//No I18N
                    "size": 1,//No I18N
                    "width": "60px"//No I18N
                }, {
                    "size": 11,//No I18N
                    "pipe_separation": true, //No I18N
                    "row_count": 2, //No I18N
                    "default_rowposition": 2//No I18N
                }]
            };
            otherOptions.icon_settings = {
                "show_icons_Bottom": true, //No I18N
                "position": 2, //No I18N
                "isPrepend":true,  //No I18N
                "rowPosition" : 2,  //No I18N
                "class": "disp-ib vmiddle" //No I18N
            };
            otherOptions.height += 30;
            otherOptions.listSettingOptions.enableSettings.push("sorting");
            otherOptions.bulkSelectionSetting.selectionCallback = function(checkBox){
                jQuery(checkBox).closest("div.flipper").addClass("flip-active");//No I18N
            }
            otherOptions.bulkSelectionSetting.unSelectionCallback = function(checkBox){
                jQuery(checkBox).closest("div.flipper").removeClass("flip-active");//No I18N
            }
        }

        otherOptions.callbackOnAPIFailure=$projectList.apiFailureCallback;
        return otherOptions;
    },
    /*
        A function to return the tableinfo to web-component for avoiding an additional personalisation call
    */
    fetchTableInfo: function(){
        return $projectList.options.tableInfo;
    },
    changeFilter: function(filterId,filterName) {
        var _self = this;
        jQuery("#selected_filter").text(filterName);
        jQuery("#selected_filter").attr("title",filterName);
        if(_self.options.viewMode != "kanban"){
            if($projectList.options.gsearch){
                jQuery("#subheader_search_box").val(""); // No I18N
                jQuery('[data-spa-module="projects"]').trigger("click");// No I18N
                return false;
            }
            WebComponents.instancePool["webc-project"].t_obj.table_info.list_info.filter_by = {"id" : filterId}; //NO I18N
            WebComponents.instancePool["webc-project"].refreshTable();// No I18N
        }else{
            kanban_project.k_obj.t_info.list_info.filter_by = {"id" : filterId}; //NO I18N
            kanban_project.refreshKanbanView();
        }
        if($projectList.options.from != "request" && $projectList.options.from != "dashboard" && $projectList.options.viewMode != "table"){
            var perObj = $tasks.getPersonalization("projects");// NO I18N
            perObj.list_info.filter_by ?perObj.list_info.filter_by.id = filterId : perObj.list_info.filter_by = {"id" : filterId};
            addPersonalization("projects",perObj);
        }
    },
	rowDataConstruct: function(table_info,ctl) {
		var inputObject = {};
		var fields_required_arr = Object.keys(table_info.fields_required);
        fields_required_arr.indexOf("has_attachments")==-1 && fields_required_arr.push("has_attachments");// No I18N

		inputObject.list_info = table_info.list_info;
		if($projectList.options.from == "dashboard"){
            inputObject.list_info.filter_by = $projectList.options.dashboardCriteria.filter_by;
            inputObject.list_info.search_criteria = $projectList.options.dashboardCriteria.search_criteria;
        }else if($projectList.options.from === "printView" && $projectList.options.advFilterCrit){//No I18N
            inputObject.list_info.search_criteria = $projectList.options.advFilterCrit;
            delete inputObject.list_info.filter_by;
        }
		inputObject.fields_required = fields_required_arr;
		if($projectList.options.viewMode == "kanban") {
            inputObject.include = ["tags"];
        }else if($projectList.options.viewMode == "classic") {//NO I18N
            inputObject.include = ["image_token"];
            inputObject.fields_required.indexOf("owner") == -1 && inputObject.fields_required.push("owner")
        }
        inputObject.fields_required.indexOf("title") == -1 && inputObject.fields_required.push("title");
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
        if($projectList.options.viewMode === 'kanban'){
            filterOptions.haveNestedColumns=false;
            filterOptions.metaInfoData = null;
            filterOptions.entity="projects";//No I18N
            filterOptions.metaParam='list_view_filter';//No I18N
            filterOptions.allowReadOnly=true;
            filterOptions.setNullSiteDef= true;
            filterOptions.skipFields = [kanban_project.k_obj.group_by];
        }else{
            filterOptions = {
                parentDiv:"project_custom_filter",//No I18N
                entity:"projects",//No I18N
                module:"project",//No I18N
                metaParam:'list_view_filter',//No I18N
                entityComponent: WebComponents.instancePool["webc-project"],//No I18N
                enableSave: true, allowReadOnly: true, setNullSiteDef: true, haveInactiveValues: true, noneValID: "$(none)",  //No I18N
                metaOverride: {
                    "udf_fields": { "display_name": translate("sdp.requests.fieldFormRules.scriptpopup.additionalFields") }, //No I18N
                },
                applyFn: function(search_criteria){
                    if(!$projectList.options.temp_list_info){
                        $projectList.options.temp_list_info = jQuery.extend({},WebComponents.instancePool["webc-project"].t_obj.table_info.list_info);//No I18N
                    }
                    delete WebComponents.instancePool["webc-project"].t_obj.table_info.list_info.filter_by;//No I18N
                    $projectList.options.advFilterCrit = search_criteria;
                    WebComponents.instancePool["webc-project"].t_obj.table_info.list_info.search_criteria = search_criteria;//No I18N
                    WebComponents.instancePool["webc-project"].refreshTable();//No I18N
                    jQuery("#projectListViewFilter").hide();
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
                    WebComponents.instancePool["webc-project"].t_obj.table_info.list_info = $projectList.options.temp_list_info;//No I18N
                    delete $projectList.options.temp_list_info;
                    delete $projectList.options.advFilterCrit;
                    WebComponents.instancePool["webc-project"].t_obj.table_info.list_info.search_criteria = null;//No I18N
                    WebComponents.instancePool["webc-project"].refreshTable();//No I18N
                    jQuery("#projectListViewFilter").show();
                },
                refFiltFn: function(param){
                    delete $projectList.options.temp_list_info;
                    delete $projectList.options.advFilterCrit;
                    WebComponents.instancePool["webc-project"].t_obj.table_info.list_info.search_criteria = null;//No I18N
                    $projectList.changeFilter(param.list_view_filter.id, param.list_view_filter.name);
                    jQuery("#projectListViewFilter").show();//No I18N
                }
            }
        }
        filterOptions.passOnlyIds      = true;
        filterOptions.haveMultiString  = true;
        filterOptions.handleInOperators= true;
        filterOptions.specialFormats   = ["have_none"];
        filterOptions.ignoreNoneFields = ["status","created_by"];//No I18N
        filterOptions.dateCustomize    = $tasks.getCustomDateCond();
        filterOptions.hideMarkPublic   = !$projectList.options.canViewAllProjects;
        filterOptions.addNoneOption    = function(){
           return [{"id": "$(none)", "text":translate("common.none")}]; //No I18N
        }
        filterOptions.dollarSupport    = {
           "$_user"             : {"fields": ["owner","created_by","requester"], "option":{"id":"$(logged_in_user)", "text": translate("sdp.common.loggedinuser")} },//No I18N
           "$_status_pending"   : {"fields": ["status"], "option":{"id":"$(is_pending)", "text":translate("sdp.common.allpending")}},//No I18N
           "$_status_completed" : {"fields": ["status"], "option":{"id":"$(is_completed)", "text":translate("sdp.common.allcompleted")}}//No I18N
        }
        filterOptions.allowed_value = {
           callback: function(list_info, field){
               if(["owner","created_by","requester","department","site"].contains(field)){
                   list_info = {"fields_required": ["name"]};      //No I18N
               }
               return list_info;
           }
        };
        filterOptions.changeURLData = function(field){
            return {"data":{"for":"list_view_filter"}};//No I18N
        };
       viewFilterComponent.initComponent(filterOptions);
    },
    constructChkboxCell: function (table_data) {
        var rd = table_data.row_data;
        var image = "/images/default-profile-pic2.svg";         //No I18N
        if(rd.owner){
            image = rd.owner.profile_pic["content-url"];//NO I18N
            if(image.indexOf("default-profile-pic2") == -1){
                image += "?key="+rd.image_token;        //No I18N
            }
        }
        if($projectList.options.allowedOperations.delete){
            return `<div class="flip-container mt15 left0"><div class="flipper"><div class="front"><img src=` + image + ` class="rounded-circle w-50px h-50px"></div><label for="projects_` + rd.id + `"><div class="back"><input type="checkbox" data-table-checkbox="" id="projects_` + rd.id + `" value=` + rd.id + ` templateid="1" aria-label="CheckBox"></div></label></div></div>`;       // No I18N
        }else{
            return `<div class="mt15"><div class="front"><img src=` + image + ` class="rounded-circle w-50px h-50px"></div></div>`;
        }
    },
    constructEditIcon: function(table_data){
        return '<div><div class="right0 top0 p5 pr5 disp-ib"><a href="/ProjectAction.do?submitaction=ViewProject&fromListView=true&projectid=' + table_data.row_data.id + '" target="_blank" class="cspr flat icon-sm newtab" title="' + translate('sdp.requests.newrequest.autosuggest.newwindow.open') + '" rel="uitip noopener noreferrer"></a></div></div>';
    },
	constructProjectTitle: function(table_data,_self,t_comp){
        var row_data = table_data.row_data;
        var attachmentIcon = '';
        if (row_data.has_attachments) {
            attachmentIcon = '<span><div class="hide" id="attach_popup_' + row_data.id + '"></div><span class="cur-ptr icon-sm cspr paperclip opac5 top-1" data-entity="projects" data-entity_id="' + row_data.id + '" data-target-id="#attach_popup_' + row_data.id + '"  role="img" aria-label="Attachments"></span></span>'; // No I18N
        }
        if(["printView", "request"].indexOf($projectList.options.from) == -1){
            if($projectList.options.viewMode == "classic"){
                return attachmentIcon + `<a href="/ProjectAction.do?submitaction=ViewProject&fromListView=true&projectid=`+row_data.id+`" class="uni-heading text-color4" title="`+e_attr(row_data.title)+`" rel="uitip noopener noreferrer" mode_ellipsis="true"><span class="pos-rel top-1"> #`+row_data.id+` `+e_html(row_data.title)+`</span></a>`
            }else if($projectList.options.viewMode == "kanban"){        // No I18N
                if("has_attachments" in row_data){
                    return `<span class="disp-ib p3 truncate-ellipsis"><span class="truncate-wrapper">`+attachmentIcon+`<a class="h4" href="/" data-event="click" data-handler='$previewComponent.load("/ui/projects?mode=detail&from=kanban&projectId=`+row_data.id+`&externalframe=true", "`+translate('sdp.project.heading.projectdetails')+`", "1000px",null,null,"projectDetails_popup")' nonce=${sdpNonce}  rel="uitip noopener noreferrer" mode_ellipsis="true" title="`+e_attr(row_data.title)+`"> #`+row_data.id+` `+e_html(row_data.title)+`</a></span></span>`;// No I18N
                }else{
                    return `<span class="disp-ib p3 truncate-ellipsis"><span class="truncate-wrapper"><span class="h4" rel="uitip" mode_ellipsis="true" title="`+e_attr(row_data.title)+`"> #`+row_data.id+` `+e_html(row_data.title)+`</span></span></span>`;// No I18N
                }
            }else{
                return attachmentIcon + `<a href="/ProjectAction.do?submitaction=ViewProject&fromListView=true&projectid=`+row_data.id+`" class="mt5" rel="uitip noopener noreferrer" mode_ellipsis="true" title="`+e_attr(row_data.title)+`">`+e_html(row_data.title)+`</a>`;
            }
        }else{
            return '<span rel="uitip" mode_ellipsis="true" title="'+e_attr(row_data.title)+'">'+e_html(row_data.title)+'</span>';
        }
	},
	constructTaskOverview: function(table_data,_self){
        return '<div id="proj_task_' + table_data.row_data.id + '" class="vbottom disp-ib"><span class="sdp-glyph sdp-glyph task-loading" role="img"></span></div>'; // No I18N
    },
    constructMilestoneOverview: function(table_data,_self){
        return '<div id="proj_mile_' + table_data.row_data.id + '" class="vbottom disp-ib"><span class="sdp-glyph sdp-glyph task-loading" role="img"></span></div>'; // No I18N
    },
    constructTaskProgress: function(table_data,_self){
        return '<div id="proj_task_' + table_data.row_data.id + '_progress" class="vbottom disp-ib"><span class="sdp-glyph sdp-glyph task-loading" role="img"></span></div>'; // No I18N
    },
    constructMilestoneProgress: function(table_data,_self){
        return '<div id="proj_mile_' + table_data.row_data.id + '_progress" class="vbottom disp-ib"><span class="sdp-glyph sdp-glyph task-loading" role="img"></span></div>'; // No I18N
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
    apiFailureCallback: function(resp) {
        var resp = resp[1].responseJSON;
        if (resp) {
            var responseText = resp.response_status && resp.response_status.constructor === Array ? resp.response_status[0] : resp.response_status;
            var invalid_filter_criteria = translate("sdp.customfilter.invalid.criteria"); // No I18N
            if (invalid_filter_criteria === responseText.messages[0].message) {
                var perObj = $tasks.getPersonalization("projects");//NO I18N
                perObj.list_info.filter_by = {"id":0} ;//NO I18N
                addPersonalization("projects", perObj);
                $spa.navigate("/ui/projects?mode=list","projects");// No I18N
                showalert('failure', invalid_filter_criteria, "isAutoHide=false"); // No I18N
            } else {
                showalert('failure', e_html(responseText.messages[0].message), "isAutoHide=true,delay=3"); // No I18N
            }
        } else {
            showalert('failure', translate("sdp.admin.associatedapplications.connectionfailure.msg", ["SDP"]), "isAutoHide=true,delay=3"); // No I18N
        }
        return false;
    },
	callbackAfterTableRender: function(a,_self){
	    $projectList.responsiveListControls();

        $projectList.handleEvents();

		// to show the search option in list view when directed from dashboard.
		// Should be removed when table component provides support for toggling search bar using search criteria
		if($projectList.options.from === "dashboard" && !$projectList.options.dashboardSearchApplied){
            var widgetJSON = $projectList.options.widgetJSON;
            var columns = null,values;
            if(widgetJSON.name == "PendingProjByStatus"){//No I18N
                columns = ["status.name","priority.name"];//No I18N
                values = widgetJSON.columnValues.split(",");//No I18N
            }else if(widgetJSON.name == "OverdueNDueProjByOwner" || widgetJSON.name == "ProjHourNCostVioaltionByOwner"){//No I18N
                columns = ["owner.name"];//No I18N
                values = [widgetJSON.columnValues];
            }else if(widgetJSON.name == "PendingProjByPriorityNType" || widgetJSON.name == "PendingProjBySiteNDept"){//No I18N
                columns = [widgetJSON.type+".name"];
                values = [widgetJSON.columnValues];
            }
            if(columns!= null){
                for(var i=0;i<columns.length;i++){
                    var searchcolumn = jQuery("#projects_div .searchRow").find("[data-id='"+columns[i].toLowerCase()+"']");
                    searchcolumn.val(values[i]);
                }
                if(!widgetJSON.criteria.hasOwnProperty("unassigned_column") || widgetJSON.name == "PendingProjByStatus"){
                    jQuery("#projects_div .searchRow")[0].removeAttribute("style");
                }
            }
            $projectList.options.dashboardSearchApplied = true;
        }
        if($projectList.options.viewMode == "classic"){
            jQuery("#projects_div").addClass('lv-fwrap');         //No I18N
        }
        initTooltip("#projectsDiv");// NO I18N

        // to update task and milestone count in list view
        ($projectList.options.from !="request" && $projectList.options.from !="printView") && $projectList.updateSummary();// NO I18N

        // for constructing navigation in details pages. Should be removed once api based page is developed
        if($projectList.options.viewMode != "kanban"){
            Store.setItem({"key":"projectIds", "value":WebComponents.instancePool['webc-project'].loadedIDs.toString()});//No I18N
        }else{
            Store.removeItem("projectIds");//No I18N
        }

        // For showing project help video while opening projects tab
        if($projectList.options.from !== "request" && $projectList.options.from !== "printView" && sdp_user && sdp_user.USERTYPE === 'Technician' && (sdp_app && sdp_app.IS_SDP && !sdp_app.IS_REBRAND )){ // No I18N
            if(sdp_user.TOURS_TOLOAD && sdp_user.TOURS_TOLOAD.includes("Projects") && !sdp_app.IS_REBRAND){ // No I18N
                HelpVideos.open('Projects',false); // No I18N
            }
        }
	},
	/*
	    A function to modify the input date while searching
	*/
    callbackSearchFunction: function(type){
        if(type !== "tableSearch"){ //No I18N
            return;
        }
        if($projectList.options.advFilterCrit){
            var search_criteria = WebComponents.instancePool["webc-project"].t_obj.table_info.list_info.search_criteria;//No I18N
            if(search_criteria){
                if(search_criteria.children){
                    search_criteria.children = search_criteria.children.concat($projectList.options.advFilterCrit);
                }else{
                    search_criteria.children = $projectList.options.advFilterCrit;
                }
            }
            WebComponents.instancePool["webc-project"].t_obj.table_info.list_info.search_criteria = search_criteria || $projectList.options.advFilterCrit;//No I18N
        }
        WebComponents.instancePool["webc-project"].refreshTable("search");//No I18N
    },
	/*
        A function to handle all the js events in project list view
    */
    handleEvents: function(){
        var $container = jQuery("#projectList");
        $container.off(".project-list");// NO I18N

        $container.one("click.project-list","#projectListViewFilter", function(evt){// NO I18N
            var filterList_obj = new filterListComp();
            filterList_obj.initComponent({
                module           : "project",    //No I18N
                element          : "#ListViewFilterMenu",    //No I18N
                personalize_key  : "project_filter_views",   //No I18N
                filter_action    : "$projectList.changeFilter",    //No I18N
                managefilter_url : "/ListViewFilter.do?module=project&action=listview",   //No I18N
                user_type        : sdp_user.USERTYPE,
                favoritable      : $projectList.options.from !== 'request',// NO I18N
                custom_filters   : $projectList.options.canUserViewAnyProject
            });
        });

        $container.on("click.project-list","[id^=proj_mile_]", function(evt){
            window.location="/ProjectAction.do?submitaction=ViewProject&showTab=milestone&projectid="+this.getAttribute("data-moduleid");
        });

        $container.on("click.project-list", "[id^=proj_task_]", function(evt){
            $tasks.loadTasks('unified','project',this.getAttribute("data-moduleid"),null,null,null,null,null,null,{'completed':this.getAttribute("data-compTask"),'total':this.getAttribute("data-totalTask")});
        });

        $container.on("click.project-list", "#addProject", function(evt){
            window.location = '/ProjectAction.do?submitaction=NewProject';
        });

        $container.on("click.project-list", "#deleteProj", function(evt){
            var $deleteDialog = jQuery("#deleteDialog");
            $deleteDialog.off(".delete-dialog");// NO I18N

            $deleteDialog.dialog({width: 400, modal: true });

            $deleteDialog.on("click.delete-dialog", "#deleteButton", function(){// No I18N
                var ids = WebComponents.instancePool["webc-project"].bulkSelect.getSelectedIDs();// NO I18N

                sdpAjax({
                    url:"/api/v3/projects?"+(jQuery("#cancelChange").prop("checked")?"cancelChanges=true&":"")+"ids="+ids,// No I18N
                    type: "DELETE", acceptODCompatible: true,// No I18N
                    success: function(resp){
                        showalert("success",translate("api.deleted.success", [translate("common.projects")]), "isAutoHide=true");// No I18N
                        WebComponents.instancePool['webc-project'].refreshTable();// No I18N
                        jQuery("#deleteDialog").dialog("destroy");// No I18N
                    }
                });
            });

            $deleteDialog.on("click.delete-dialog", "#cancelButton", function(){
                jQuery("#deleteDialog").dialog("destroy");// NO I18N
            });
        });

        $container.on("click.project-list", "#recentUpdates", function(evt){
            loadProjectEntityHistory('projectRecentUpdates');// NO I18N
        });

        $container.on("click.project-list", "[data-id='associateProject']", function(evt){
            $projectList.assocProjToReq();
        });

        $container.on("click.project-list", ".switch-table-view", function(evt){
            $projects.switchTo(this.getAttribute("data-table-view"));
        });

        $container.on("click.project-list", ".import-project", function(evt){
            importURL('Projects',this.getAttribute("data-import-type"));
        });

        // for attachment's list popup
        $container.on('click.project-list', 'span[data-entity="projects"].paperclip', function(evt){
            var $this = jQuery(this);
            if(!$this.data('preview-initialized')) {
                var _attachment = new attachPreview($this, {
                    api: true,
                    is_odapi: true,
                    layouts: false,
                    popover: {
                        enable: true,
                        target: $this.data("targetId"), //No I18N
                    },
                    return_instance: true,
                });
                _attachment.showPopoverUI(evt);
            }
        });

        jQuery(window).off("resize.project-list").on('resize.project-list', function() {//No I18N
            $projectList.responsiveListControls();
        });
        $container.one("remove.project-list", function(){//No I18N
            jQuery(window).off("resize.project-list");//No I18N
            $container.off(".project-list");//No I18N
            if($projectList.options.from !== "printView"){
                $projectList=null;
            }
        });
    },
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
    updateKanbanProject : function(projectId, tocolumn, field, kanban, callback, fromcolumn){
        var temp = {}, sel_val = tocolumn,input_obj = {};
        temp[field] = sel_val && sel_val !="0" ? { "id": sel_val } : null;
        input_obj["project"] = temp;
        sdpAjax({
            url  : "/api/v3/projects/"+projectId, //NO I18N
            type : "PUT",async : false, acceptODCompatible: true,   //No I18N
            data : sdpAjaxInputData(input_obj),
            success : function(resp){
                var message = translate("api.updated.success", [ translate("common.project") ]);
                if(resp.response_status.messages){
                    message = resp.response_status.messages[0].message;
                }
                showalert(resp.response_status.status,message,"isAutoHide=true"); // NO I18N
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
                    showalert('failure',translate("project.invalid.owner"), "isAutoHide=false");// NO I18N
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
        A function To update the milestone/task count in list view
    */
    updateSummary: function(){
        var ids = [];
        if($projectList.options.viewMode == "kanban"){
            jQuery("#projectList [id^=proj_mile_]").each(function(index){//No I18N
                ids.push(jQuery(this).attr("id").split("proj_mile_")[1]);// No I18N
            })
        }else{
            ids = WebComponents.instancePool["webc-project"].loadedIDs;// No I18N
        }
        if(ids.length > 0 && jQuery("#projectList [id^=proj_]").length > 0){
            sdpAjax({
                url:"/api/v3/projects/summary?ids="+ids,// No I18N
                async: false, ignorefailuremessage : false, acceptODCompatible: true,
                success: function(data){
                    data.summary.forEach(function(value, index){
                        if($projectList.options.viewMode != "kanban"){
                            var fields_required = Object.keys(WebComponents.instancePool['webc-project'].t_obj.table_info.fields_required);// No I18N

                            if(fields_required.contains("milestone_progress")){
                                var title = (value.milestone.total == 0)?translate("sdp.projects.nomilestone"):'<div><div>'+translate("sdp.project.projectattribute.totalmilestones")+' : '+value.milestone.total+'</div><div class=\'mt10\'>'+translate("sdp.project.ganttfilter.pendingmilestones")+' : '+value.milestone.pending+'</div><div class=\'mt10\'>'+translate("sdp.project.ganttfilter.completedmilestones")+' : '+value.milestone.completed+'</div></div>';
                                jQuery("#proj_mile_"+value.id+"_progress").replaceWith('<span id="proj_mile_'+value.id+'_progress" data-moduleid='+value.id+' class="ui-progressbar1-info ui-progressbar1-pos1"><span class="cur-ptr" title="'+title+'" rel="uitip" mode_html="true"> <span class="ui-progressbar1a rounded50 "><span style="width:'+parseInt((value.milestone.completed/value.milestone.total)*100)+'%;" class="ui-progressbar1-fill rounded50 milestonesbar"></span></span> <span class="ui-progressbar1-after"><span class="text-color4 ml5">'+value.milestone.completed+'/'+value.milestone.total+'</span></span> </span> </span>');
                            }

                            if(fields_required.contains("task_progress")){
                                var compCount = value.task.delayed + value.task.ontime;
                                var title = value.task.total == 0?translate("sdp.projects.notasks"):`<div class='w-auto maxw-300px'> <div class='mb10'><strong>${translate("task.title")} (${compCount}/${value.task.total})</strong></div> <div class='listview'> <table cellpadding='4' cellspacing='0' border='0' class='tableComponent'> <tbody> <tr class='lightbg'> <td colspan='2'>${translate("sdp.admin.projectstatus.completed")}</td> <td colspan='2'>${translate("sdp.admin.projectstatus.pending")}</td> </tr> <tr> <td><span class='disp-ib text-overflow maxw-120px'>${translate("task.ontime")}</span></td> <td data-style='border-right : 1px solid #ddd' class='pr10' align='right'><span><strong>${value.task.ontime}</strong></span></td> <td><span class='disp-ib text-overflow maxw-120px'>${translate("task.ontrack")}</span></td> <td align='right' class='pr10'><span><strong>${value.task.ontrack}</strong></span></td> </tr> <tr> <td><span class='disp-ib text-overflow maxw-120px'>${translate("sdp.dashboard.project.delayed")}</span></td> <td data-style='border-right : 1px solid #ddd' class='pr10' align='right'><span><strong>${value.task.delayed}</strong></span></td> <td><span class='disp-ib text-overflow maxw-120px'>${translate("sdp.requests.overdue")}</span></td> <td align='right' class='pr10'><span><strong>${value.task.overdue}</strong></span></td> </tr> </tbody> </table> </div> <div class='mt10'> <span class='disp-ib text-overflow vmiddle maxw-150px'><strong>${translate("task.progress")}:</strong></span> <span class='disp-ib vmiddle pl10'>${parseInt((compCount/value.task.total)*100)}%</span> </div> </div>`;
                                var id = value.task.total == 0?"":'id="proj_task_' + value.id + '_progress"';;
                                jQuery("#proj_task_"+value.id+"_progress").replaceWith('<span '+id+' data-moduleid='+value.id+' data-compTask='+compCount+' data-totalTask='+value.task.total+' class="ui-progressbar1-info ui-progressbar1-pos1"> <span class="'+(value.task.total == 0?"":"cur-ptr")+'" title=\"'+title+'\" mode_html="true" rel="uitip"> <span class="ui-progressbar1a rounded50"><span style="width:'+parseInt((compCount/value.task.total)*100)+'%;" class="ui-progressbar1-fill rounded50 taskbar"></span></span> <span class="ui-progressbar1-after"><span class="text-color4 ml5">'+compCount+'/'+value.task.total+'</span></span> </span> </span>');
                            }

                            if(fields_required.contains("milestone_overview")){
                                var mile = jQuery("#proj_mile_"+value.id);
                                if(value.milestone.total == 0){
                                    mile.replaceWith('<span data-moduleid='+value.id+' id="proj_mile_'+value.id+'" class="cspr icon-md tc-ms vmiddle mr5 opac3 cur-ptr" rel="uitip" title="'+translate('sdp.projects.nomilestone')+'" role="img"></span>');
                                }else {
                                    mile.replaceWith('<span data-moduleid='+value.id+' id="proj_mile_'+value.id+'" class="cspr icon-md '+(value.milestone.pending != 0?'tc-ms-p':'tc-ms-c')+' vmiddle mr5 cur-ptr" rel="uitip" mode_html="true" title="<div><div>'+translate("sdp.project.projectattribute.totalmilestones")+' : '+ value.milestone.total+'</div><div class=\'mt10\'>'+translate("sdp.project.ganttfilter.pendingmilestones")+' : '+value.milestone.pending+'</div><div class=\'mt10\'>'+translate("sdp.project.ganttfilter.completedmilestones")+' : '+value.milestone.completed+'</div></div>"></span>');
                                }
                            }
                            if(fields_required.contains("task_overview")){
                                var task = jQuery("#proj_task_"+value.id);
                                if(value.task.total == 0){
                                    task.replaceWith('<span class="tc-task flat" rel="uitip" title="'+translate("sdp.projects.notasks")+'" role="img"></span>');
                                }else{
                                    var compCount = value.task.delayed + value.task.ontime;
                                    var title = `<div class='w-auto maxw-300px'> <div class='mb10'><strong>${translate("task.title")} (${compCount}/${value.task.total})</strong></div> <div class='listview'> <table cellpadding='4' cellspacing='0' border='0' class='tableComponent'> <tbody> <tr class='lightbg'> <td colspan='2'>${translate("sdp.admin.projectstatus.completed")}</td> <td colspan='2'>${translate("sdp.admin.projectstatus.pending")}</td> </tr> <tr> <td><span class='disp-ib text-overflow maxw-120px'>${translate("task.ontime")}</span></td> <td data-style='border-right : 1px solid #ddd' class='pr10' align='right'><span><strong>${value.task.ontime}</strong></span></td> <td><span class='disp-ib text-overflow maxw-120px'>${translate("task.ontrack")}</span></td> <td align='right' class='pr10'><span><strong>${value.task.ontrack}</strong></span></td> </tr> <tr> <td><span class='disp-ib text-overflow maxw-120px'>${translate("sdp.dashboard.project.delayed")}</span></td> <td data-style='border-right : 1px solid #ddd' class='pr10' align='right'><span><strong>${value.task.delayed}</strong></span></td> <td><span class='disp-ib text-overflow maxw-120px'>${translate("sdp.requests.overdue")}</span></td> <td align='right' class='pr10'><span><strong>${value.task.overdue}</strong></span></td> </tr> </tbody> </table> </div> <div class='mt10'> <span class='disp-ib text-overflow vmiddle maxw-150px'><strong>${translate("task.progress")}:</strong></span> <span class='disp-ib vmiddle pl10'>${parseInt((compCount/value.task.total)*100)}%</span> </div> </div>`;
                                    var icon=(value.task.ontrack + value.task.overdue != 0)?"tc-task-p":"tc-task-c";// No I18N
                                    var html = '<span data-moduleid='+value.id+' id="proj_task_'+value.id+'" data-compTask='+compCount+' data-totalTask='+value.task.total+' class="'+icon+' cur-ptr" rel="uitip" mode_html="true" title=\"'+title+'\"></span>'
                                    html = jQuery(html)
                                    $sdStyleConverter(html)
                                    task.replaceWith(html);
                                }
                            }
                        }else{
                            let html = `<div class="divider"></div><div class="disp-c pl20 fl mr20" data-style="width: 45%; border-right: 1px solid #ddd;"><div class="text-muted pl10 mb10 text-overflow maxw-120px">`+translate("project.milestones")+`</div><div data-progress="donut" data-class="ml10" data-size="60" data-text="`+value.milestone.completed+`/`+ value.milestone.total+`" data-center-fill='#fff' data-text-color='#000' data-base-color='#dddddd'   data-type="1" data-percent="`+((value.milestone.completed/value.milestone.total)*100)+`" data-border="3" data-top-color="#fd708b" data-base-color="#fd708b" data-text-color="black"></div></div>`
                            html = jQuery(html)
                            $sdStyleConverter(html)
                            jQuery("#proj_mile_"+value.id).replaceWith(html);

                            html = `<div class="disp-c pl30" data-style="width: 45%;"><div class="text-muted pl20 mb10 text-overflow maxw-120px">`+translate("project.tasks")+`</div><div data-progress="donut" data-class="ml10" data-size="60" data-text="`+(value.task.delayed+value.task.ontime)+`/`+ value.task.total+`" data-center-fill='#fff' data-text-color='#000' data-base-color='#dddddd'   data-type="1" data-percent="`+(((value.task.ontime+value.task.delayed)/value.task.total)*100)+`" data-border="3" data-top-color="#21c16b" ></div></div>`
                            html = jQuery(html)
                            $sdStyleConverter(html)
                            jQuery("#proj_task_"+value.id).replaceWith(html);
                        }
                    })
                }
            });
            jQuery('#projectList *[data-progress=donut]').progressDonutBar();
            initTooltip(".tablelist");// No I18N
        }
    },
    assocProjToReq: function(){
        var activewindow = $extFrame.getActiveWindow();
        sdpAjax({
            url:'/api/v3/requests/'+activewindow.woID+'/projects',//No I18N
            data: sdpAjaxInputData({"projects":[{"project":{"id": WebComponents.instancePool['webc-project'].getSelectedRadio()}}]}),//No I18N
            type:"POST", acceptODCompatible: true,//NO I18N
            success: function(resp){
                activewindow.$previewComponent.closePreview("projAssoc_popup");//No I18N
                activewindow.showalert("success", translate("api.associate.success.msg", [translate("common.project")]), "isAutoHide=true");//No I18N
                activewindow.$req.details.updateRequestTemplates('project');//No I18N
            }
        })
    },
    responsiveListControls: function(){
        if(jQuery(window).width() <= 1500) {
           jQuery('#projectsDiv')
                .find('#KV_SwitchCombineView')
                    .removeClass('hide')
                    .addClass('bs-noconflict')
                .end()
                .find('#KV_SwitchNormalView')
                    .addClass('hide')
                .end()
                .find('[data-id=KvSwitchText]')
                    .removeClass('disp-ib')
                    .addClass('hide')
                    .closest('button')// NO I18N
                    .removeAttr('mode_ellipsis'); //No I18N
        }else{
            jQuery('#projectsDiv')
                .find('#KV_SwitchCombineView')
                    .addClass('hide')
                    .removeClass('bs-noconflict')
                .end()
                .find('#KV_SwitchNormalView')
                    .removeClass('hide')
                .end()
                .find('[data-id=KvSwitchText]')
                    .removeClass('hide')
                    .addClass('disp-ib')
                    .closest('button')// NO I18N
                    .attr('mode_ellipsis','true'); //No I18N
        }
    }
};

