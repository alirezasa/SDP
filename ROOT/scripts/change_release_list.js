// $Id$
/* Listview actions and template compilation*/
var $releaseList = {
    table_comp_release : {},
    view : 'table',// No I18N
    viewMode : 'table', // No I18N
    filter_view_internal_name : '',
    filter_view_display_name : '',
    fromCMDB : false,
    cmdb_base_criteria : {},
	is_colorsetting : false,
    init : function(module, from, externalframe, associatedEntityId,operation,fromActions, preview){
        //This object helps to find from which page, form is invoked
        $CRObj.fromPage = "list"; // No I18N
        let _self = this;   
        _self.module = module + "s"; // No I18N
        if(associatedEntityId){
            _self.associatedEntityId = associatedEntityId;
            _self.entity = module;
            _self.operation = operation;
            _self.preview = preview;
            if(fromActions){
                _self.fromActions = fromActions;
            }
        }
        if(from){
            _self.from = from;
        }
        if(from === "asset" || from === "services") {
            _self.fromCMDB = true;
        }
        else if (from === "workflow") {
            _self.fromWorkflow = true;
        }
        if(_self.module === "releases") {
            _self.filter_view_internal_name = "all_releases";// No I18N
			if(sdp_user.ROLES.indexOf("SDAdmin") !== -1){
				_self.is_colorsetting = true;
			} else if(sdp_user.USERTYPE === "Technician") { //No I18N
				if (window["cs_id"] && window["cs_enabled"] && (window["tech_personalized"] || window["is_fields"])) {
					_self.is_colorsetting = true;
				}
			}
        }
        let current_view = Object.assign({}, sdp_user.CLIENT_CONF.releases_currentview);
        let viewMode = "table",view = "table";// No I18N
        let params = getSDPURLParams();
        _self.search_text = params.gsearch;
        if(_self.search_text){
            _self.filter_view_display_name = getMessageForKey("sdp.leftpanel.search.title");// No I18N
            _self.filter_view_internal_name = "Search";// No I18N
        }
        if(current_view && !associatedEntityId){
            if(!_self.search_text && current_view.filter_by && current_view.filter_by.id){
                let filter_id = current_view.filter_by.id;
                sdpAjax({
                    url: '/api/v3/list_view_filters/'+filter_id, // No I18N
                    success: function(resp) {
                        _self.filter_view_display_name = resp.list_view_filter.display_name;
                        _self.filter_view_internal_name = resp.list_view_filter.name;
                    },
                    async: false
                });
            }
            if(current_view.view === "classic"){
                viewMode = "linear";// No I18N
                view = "kanban";// No I18N
            }
            else if(!_self.search_text && current_view.view === "calendar" && ["unscheduled_releases"].indexOf(_self.filter_view_internal_name) === -1){
                viewMode = "calendar";// No I18N
                view = "calendar";// No I18N
            }
        }
        _self.setTemplate(view,viewMode);
    },
    setTemplate : function(view,viewMode,isTrash){
        /*To destroy previous instance of table component*/
        if($releaseList && $releaseList.table_comp_release && !jQuery.isEmptyObject($releaseList.table_comp_release)){
            $releaseList.table_comp_release.destroy();
        }
        let _self = this;
            _self.view = view;
            _self.viewMode = viewMode;
            //We want only VIEW_RELEASE permission for Asset-Release Association and this is already handled in wsRequestDetails.jsp, so setting empty permission object here.
            _self.permissions = $releaseList.fromCMDB || $releaseList.fromWorkflow ? {} : _self.getPermissions();
            let contextObj = Object.assign({},_self.permissions);
            contextObj.checkbox = !this.preview?true:false;
            contextObj.actioncell = true;
            contextObj.preview = _self.preview;
            _self.show_icons = {"checkbox": true, "actioncell": true}; // No I18N
            if(isTrash){
                if(!_self.permissions["delete"] && !_self.permissions.restore_from_trash){
                    _self.show_icons.checkbox = contextObj.checkbox = false;
                    _self.show_icons.actioncell = contextObj.actioncell = false;
                }
                else if(!_self.permissions["delete"]){
                    _self.show_icons.actioncell = contextObj.actioncell = false;
                }
            }
            else{
                if((!_self.permissions.edit && !_self.permissions["delete"]) || _self.associatedEntityId){
                    _self.show_icons.actioncell = contextObj.actioncell = false;
                }
                if((!_self.permissions.edit && !_self.permissions["delete"] && !_self.permissions.assign && !_self.permissions.pickup) || (_self.operation === "associateto") ){
                    _self.show_icons.checkbox = contextObj.checkbox = false;
                }
                }
            /*calculating no. of icons to be showed in list view*/
            _self.icon_count = 1;
            if(_self.show_icons.checkbox){
                _self.icon_count++;
            }
            if(_self.show_icons.actioncell){
                _self.icon_count++;
            }
            if(_self.associatedEntityId){
                contextObj.from = _self.from;
                contextObj.operation = _self.operation;
                contextObj.associations = true;
                contextObj[_self.operation] = true;
                contextObj.module = (_self.operation === "associateto") ? _self.entity : _self.module; // No I18N
                if ($releaseList.fromCMDB || $releaseList.fromWorkflow) {
                    _self.metainfoEntity = contextObj.metainfoEntity =  _self.module ;
                    contextObj.defaultpath = "/api/v3/"; // No I18N
                }
                else {
                    _self.metainfoEntity = contextObj.metainfoEntity = _self.from + "s/" + _self.associatedEntityId + "/" + _self.module + "/" + _self.entity; // No I18N
                    contextObj.defaultpath = "/api/v3/" + _self.from + "s/" + _self.associatedEntityId + "/" + ((_self.operation === "associateto") ? (_self.module +"/") : ""); // No I18N
                }
            }
            else{
            contextObj.module = _self.module;
            }
            contextObj.view = view;
            contextObj.viewMode = viewMode;
            contextObj.isTrash = isTrash;
            contextObj.is_colorsetting = _self.is_colorsetting;
            contextObj.entityDisplayName = _self.module === "releases" ? getMessageForKey("common.release") : "";//No I18N
            contextObj.fromCMDB = _self.fromCMDB;
            contextObj.fromWorkflow = _self.fromWorkflow;
            contextObj.isMSP = isMSP;
			if(isMSP) {
				(_self.operation === "associateto") && (getCustomAccID = null); // No I18N
			}
            //Helptour initialization self.form check is added here to avoid the module tour opening from the associations.
            if(sdp_app && sdp_app.IS_SDP && !sdp_app.IS_REBRAND && !_self.from){
                if(sdp_user.USERTYPE === 'Technician' && sdp_user.ROLES.includes("ViewReleases")){ // No I18N
                    HelpVideos.init('Release', '#spa-container'); // No I18N
                }
                if(sdp_user.TOURS_TOLOAD && sdp_user.TOURS_TOLOAD.includes("Release")){ // No I18N
                    HelpVideos.open('Release',false); // No I18N
                }
            }
            
            if(viewMode === 'calendar'){// No I18N
                jQuery("body").addClass('oyh');
                ResourceLoader({
                    js:['/scripts/module_calendarView.js', '/scripts/dhtmlxscheduler_scripts.js', '/scripts/dhtmlxscheduler_ext_scripts.js'], // No I18N
                    process: 'series', // No I18N
                    success:function(){
                        if(_self.module === "releases"){
                            contextObj.fields_required = [
                                    "scheduled_end_time", // No I18N
                                    "release_type", // No I18N
                                    "category", // No I18N
                                    "scheduled_start_time", // No I18N
                                    "created_time", // No I18N
                                    "title", // No I18N
                                    "stage", // No I18N
                                    "status", // No I18N
                                    "group", // No I18N
                                    "emergency" // No I18N
                            ];
                        }
                        contextObj.containerId = 'listviewloader'; // No I18N
                        manageCalendarView.init(contextObj);
                    }
                });
            }else{
                jQuery("body").removeClass('oyh');
                const template_id = (_self.operation ? (_self.operation + "_") : "release_") + "listview_template"; //No I18N
                renderhbs("#listviewloader", template_id, contextObj, false, 'release'); // No I18N
                isMSP && (_self.operation === "associateto") && this.initAccountSelectBox(); //No I18N
                _self.setAssignDropDown();
                //Release List View Filter Dropdown construction for Asset Association
                if($releaseList.fromCMDB) {
                    _self.setReleaseFilterDropdown();
                }
                $releaseList.loadReleaseListView(viewMode);
            }
    },
	// This method is being used by MSP Team
	initAccountSelectBox: function(){
		if(!window.checkIfMSP()){
			return;
		}
		let assocAccountElement = jQuery("#association_account");//No I18N
		let accountOpts = msp_assoc_json.account_options;
		if(msp_assoc_json.is_msp_entity) {
			assocAccountElement.sdp_select2({value:accountOpts[0],cache:{},url:[{url:"/api/v3/accounts", field:'accounts',list_info:{start_index:1,row_count:25}}]});//NO I18N
		} else {
			assocAccountElement.select2({data:accountOpts});
			assocAccountElement.select2('data', accountOpts[0]); //NO I18N
		}
		assocAccountElement.on('change', function(){//No I18N
			$releaseList.table_comp_release.refreshTable("refresh"); //NO I18N
		});
		window.getCustomAccID = function(url){
			if(url && (url.startsWith('/api/v3/changes/') || url.startsWith('/api/v3/projects/')) && url.indexOf('releases/release')!==-1){ //NO I18N
				let accountChosen = jQuery("#association_account").select2('val'); //NO I18N
				return accountChosen === "" ? "0" : accountChosen; //NO I18N
			}
			return getAccountFromCombo();
		};
	},
    setAssignDropDown : function(){
        let _self = this;
        if(_self.permissions.assign){
            let url, field;
            if(_self.module === "releases"){
                url = "/api/v3/releases/release_engineer"; // No I18N
                field = 'release_engineer'; // No I18N
            }
            //jQuery('#technicianDropdown').width('200px');  // No I18N
            jQuery("#technicianDropdown").sdp_select2({ // No I18N
                placeholder : getMessageForKey('sdp.requests.common.select.technician'), //No I18N
                allowClear:true,
                url:[{
                        url: url,
                        field: field
                    }]
            });
            jQuery('#assign-button').off().on('click', function(event) {
                $releaseList.openTechnicianDropdown();
            });
            jQuery("#technicianDropdown").on('change', function () { // No I18N
                _self.bulkActions("assign");//No I18N
            }).on('select2-close',function(){ // No I18N
                jQuery(".assign-menu-cnt").removeClass('open'); // No I18N
            });
        }
        jQuery("#addnewBtn").off("click").on("click",function(event){ // No I18N
            event.preventDefault();
        });
    },
    resetGlobalSearch : function(){
        $releaseList.search_text = "";// No I18N
        jQuery("#subheader_search_box").val(""); // No I18N
        $CRObj.pushingStateURL("release", "list");// No I18N
    },
    getPermissions : function(stage){
        let _self = this;
        let url = _self.from ? (_self.from + "s/" + _self.associatedEntityId + "/" + _self.module + "/_links")   :(_self.module + "/_links");// No I18N
        let links_data = _self.getLinksData(url);
        return links_data.permissions;
    },
    getLinksData : function(moduleURL){
        let links_data = {permissions : {}};
        let url = "/api/v3/" + moduleURL;//NO I18N
            let sdpOptions = {
                url: url,
                success: function (response) {
                    let links = response._links;
                    links = links.links || links;
                    links.forEach(function (link) {
                        if(link.name){
                            links_data.permissions[link.name] = true;
                        }
                    });
                },
                async: false
            };
            if($releaseList.from === "project"){  //No I18N
                sdpOptions.acceptODCompatible = true;
            }
            sdpAjax(sdpOptions);
            return links_data;
    },
    openTechnicianDropdown : function(){
        setTimeout(function(){
            jQuery("#technicianDropdown").select2("val", "");   //No I18N
            jQuery("#technicianDropdown").select2("open"); //NO I18N
        });
    },
    bulkActions: function (action) {
        let _self = this;
        jQuery('.page-progressbar').show(); // No I18N
        let ids = $releaseList.table_comp_release.bulkSelect.getSelectedIDs();
        if(ids.length === 0){
           return;
        }
        let url = "/api/v3/"+_self.module+"/_"+action+"?ids="+ids.toString();// No I18N
        let data = {};
        if(action === "assign"){ // No I18N
            technician = jQuery('#technicianDropdown').val(); // No I18N
            if(_self.module === "releases"){
                data = sdpAjaxInputData({
                            "release": { // No I18N
                                "release_engineer": { // No I18N
                                    "id": technician // No I18N
                                }
                            }
                        });
            }
        }

        sdpAjax({
            url: url,
            type: "PUT", //No I18N
            data:  data,
            async: false,
            success: function (resp) {
                //Separate success message Assign and PickUp..
                if (action === "assign") {
                    showalert("success", getMessageForKey("sdp.release.assign.success"), "isAutoHide=true, delay=3"); //No I18N
                }
                else if (action === "pickup") {
                    showalert("success", getMessageForKey("sdp.release.pickup.success"), "isAutoHide=true, delay=3"); //No I18N
                }
                else {
                    showalert("success", getMessageForKey("sdp.common.success"), "isAutoHide=true, delay=3"); //No I18N
                }
                $releaseList.table_comp_release.refreshTable("refresh"); //NO I18N
                jQuery('.page-progressbar').hide(); // No I18N
            },
            error: function (resp) {
               let failed_ids_num = 0;
               let response = JSON.parse(resp.responseText);
               let resp_arr = response.response_status;
               let entity_ids_num = resp_arr.length;
               tableComponent.prototype.handleErrorMsg(resp,{
                    status_code :[10003],
                    error_message: function(entity_ids) {
                        failed_ids_num = entity_ids.length;
                        return  entity_ids ? getMessageForKey("sdp.release.assignfailure",[entity_ids.map(function(str) {return Number(str);})]) : resp_arr[0].messages[0].message ;
                    }
                });
                if(failed_ids_num < entity_ids_num){
                    $releaseList.table_comp_release.refreshTable("refresh"); //NO I18N
                }
                jQuery('.page-progressbar').hide(); // No I18N
            }
        });
    },
    moveToTrash : function(id){
        let _self = this;
        let ids;
        if(!id){
            ids = $releaseList.table_comp_release.bulkSelect.getSelectedIDs();
            if(ids.length === 0){
               return;
            }
        }
        else{
            ids = id;
        }
        let url = "/api/v3/" + _self.module +"/_move_to_trash?ids="+ids.toString();// No I18N
        let delete_Entity = function(confirm){
            if(confirm){
                sdpAjax({
                        url: url,
                        type: "DELETE", //No I18N
                        success: function (obj) {
                            let resp = obj.response_status;
                            let successmsg = getMessageForKey("api.trashed.success",[getMessageForKey("common.release")]);
                            showalert('success', successmsg , "isAutoHide=true"); // No I18N
                            $releaseList.table_comp_release.refreshTable("refresh"); //NO I18N
                        }
                });
            }
        };
        let title = getMessageForKey("sdp.common.delete");
        let message = getMessageForKey("sdp.release.listview.delete.confirmdelete");
        showconfirm(true,'title='+title+', message='+message+', submitbutton='+getMessageForKey("sdp.common.ok")+', cancelbutton='+getMessageForKey("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',delete_Entity,true); //No I18N
    },
    backToListview : function(){
        let _self = this;
        $releaseList.isTrash = false;
        let current_view = {};
        if(sdp_user.CLIENT_CONF.releases_currentview){
            current_view = Object.assign({}, sdp_user.CLIENT_CONF.releases_currentview);
        }
        if(current_view.filter_by && current_view.filter_by.id){
            let filter_id = current_view.filter_by.id;
            sdpAjax({
                url: '/api/v3/list_view_filters/'+filter_id, // No I18N
                success: function(resp) {
                    _self.filter_view_display_name = resp.list_view_filter.display_name;
                    _self.filter_view_internal_name = resp.list_view_filter.name;
                },
                async: false
            });
        }
        else{
            _self.filter_view_internal_name = "all_releases";// No I18N
            _self.filter_view_display_name = getMessageForKey("api.release.listview.filter.all");// No I18N
        }
        _self.setTemplate(_self.view,_self.viewMode,false);
    },
    associateRelease : function(){
        let _self = this;
        let rel_id = jQ('[name="'+ _self.module +'_head_chkd"]:checked').val(); // No I18N
        if(_self.module === "releases"){ // No I18N
            let data = sdpAjaxInputData({
                         "releases": [ // No I18N
                                {
                                    "release": { // No I18N
                                        "id": rel_id // No I18N
                                    }
                                }
                            ]
                        });
            let sdpOptions = {
                url: "/api/v3/" + _self.from + "s/" + _self.associatedEntityId + "/" + _self.module, // No I18N
                data: data,
                type: "POST",// No I18N
                success: function(resp) {
                    let parent = window.top;
                    let showalert = parent.showalert;
                    showalert("success", getMessageForKey("sdp.project.history.releaseassociated"), "isAutoHide=true, delay=3"); //No I18N
                    parent.$previewComponent.closePreview("listview_popup");// No I18N
                    setTimeout(function(){
                        if(_self.from === "project" && _self.fromActions){
                            window.top.loadProjectDetails();
                            return;
                        }else if(_self.from === "change" && _self.fromActions){ //No I18N
                            window.top.$rc.$detailsComp.gotoTabByPath(window.top.$rc.getTabPathHash("#Release/associations")); //No I18N
                        }
                        else{
                            if(parent.$releaseList && parent.$releaseList.table_comp_release){
                                parent.$releaseList.table_comp_release.refreshTable("refresh"); //NO I18N
                            }
                            //no modification needed for change
                            if(_self.from === "project"){
                                parent.jQuery("#listviewloader").attr('style','height: 113px'); //NO I18N
                                parent.loadProjectDetails("ViewProject");    // No I18N
                            }
                            parent.jQuery("#table_render_div").addClass("listview"); //NO I18N
                            parent.jQuery("#table_render_div").css("display", ""); //NO I18N
                        }
                        /*To hide associate option from action menu after association*/
                        if(_self.from === "change"){  //No I18N
                            window.top.jQuery('#changeReleaseAssocAction').addClass("hide");
                            window.top.jQuery('#changeReleaseDissocAction').removeClass("hide");
                            window.top.jQuery("#actions_list").removeClass("open");
                            window.top.jQuery("#associated_release_count")[0].innerHTML = 1;
                            window.top.$rc.summary.releases.all=1;
                        }
                    },100);
                },
                async: false
            };
            if(_self.from === "project"){ //No I18N
                sdpOptions.acceptODCompatible = true;
            }
            sdpAjax(sdpOptions);
         }
    },
    disassociateRelease : function(){
        let _self = this;
        showconfirm(true,'title='+translate("common.dissociate.release")+', message='+translate("sdp.change.releasedissociate.confirm")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes', function(confirm){  //No I18N
            if(confirm){
                let loadedRecords = $releaseList.table_comp_release.loadedRecords;
                let id = Object.keys(loadedRecords);
                if(_self.module === "releases"){// No I18N
                    let data = sdpAjaxInputData({
                        "releases": [// No I18N
                            {
                                "release": {// No I18N
                                    "id": id[0]// No I18N
                                }
                            }
                        ]
                    });
                    let sdpOptions = {
                        url: "/api/v3/" + _self.from + "s/" + _self.associatedEntityId + "/" + _self.module, // No I18N
                        data: data,
                        type: "DELETE", // No I18N
                        success: function(resp) {
                            if(_self.from === "change"){ //No I18N
                                //To show associate option after disassociation
                                jQuery('#changeReleaseAssocAction').removeClass("hide");
                                jQuery('#changeReleaseDissocAction').addClass("hide");
                                jQuery("#associated_release_count")[0].innerHTML = 0;
                                window.top.$rc.summary.releases.all=0;
                            }
                            showalert("success", getMessageForKey("sdp.project.history.releasedisassociated"), "isAutoHide=true, delay=3"); //No I18N
                            $releaseList.table_comp_release.refreshTable("refresh"); //NO I18N
                            if(_self.from === "project"){
                                loadProjectDetails("ViewProject");    // No I18N
                            }
                        },
                        async: false
                    };
                    if(_self.from === "project"){ //No I18N
                        sdpOptions.acceptODCompatible = true;
                    }
                    sdpAjax(sdpOptions);
                }
            }
        },true);
    },
    getMetaData : function () {
        let _self = this;
        let dataVal = ""; // No I18N
        dataVal = sdpAjaxInputData({"for":"list_view"}); //No I18N
        let metaInfo;
        let sdpOptions = {
            url: "/api/v3/" + _self.metainfoEntity + "/_metainfo", // No I18N
            data : dataVal,
            success: function(data) {
                 metaInfo = data.metainfo.fields;
            },
            cache:false,
            async: false
        };
        if(_self.operation && _self.from === "project"){ //No I18N
            sdpOptions.acceptODCompatible = true;
        }
        sdpAjax(sdpOptions);
        return metaInfo;
    },
    /*
    Release List View Filter Construction for Asset Association
     */
    setReleaseFilterDropdown : function(){
        //By default we will have 3 release filter for asset association. So constructing static Select2 component with below $releaseList.assetFilterObj.
        $releaseList.assetFilterObj = [
            {
                id : 1,
                text : getMessageForKey("api.release.listview.filter.all"),
                value : "all_releases"  	//No I18N
            },
            {
                id : 2,
                text : getMessageForKey("api.release.listview.filter.all_open"),
                value : "open_releases"     //No I18N
            },
            {
                id : 3,
                text : getMessageForKey("api.release.listview.filter.closed"),
                value : "closed_releases"	//No I18N
            }
        ];
        jQuery("#releaseFilterDropdown").select2({
            data : $releaseList.assetFilterObj,
            multiple : false,
            closeOnSelect : true
        }).on({
            "select2-close" :	function(){ jQuery("#releaseFilterDropdown").removeClass('open'); },	//No I18N
            "change" :  function(item){													//No i18N
                if(item.added !== undefined) {
                    $releaseList.switchFilterView(item.added.value);
                }
            }
        });
        //Default List View filter is Open_Releases.
        let defaultFilter = $releaseList.assetFilterObj.filter(function(x) { if ( x.value === "open_releases" ) { return x; } });	//No I18N
        jQuery("#releaseFilterDropdown").select2("val", defaultFilter[0].id).change();   //No I18N
    },
    /*
    Criteria to fetch all releases associated to an asset.
    */
    getSearchCriteriaForCMDB : function() {
        let search_criteria;
        if(!jQuery.isEmptyObject($releaseList.cmdb_base_criteria)) {
            search_criteria = $releaseList.cmdb_base_criteria;
        }
        else {
            if($releaseList.from === "services") {
                search_criteria = {
                    field : "services.id", // No I18N
                    condition : "is", // No I18N
                    value : $releaseList.associatedEntityId,
                };
            }
            else {
                sdpAjax({
                    url: '/api/v3/assets/' + $releaseList.associatedEntityId, // No I18N
                    async: false,
                    success: function(resp) {
                        search_criteria = {
                            field : "assets.id", // No I18N
                            condition : "is", // No I18N
                            value : $releaseList.associatedEntityId,
                            children : [
                                {
                                    logical_operator : "or", // No I18N
                                    field : "configuration_items.id", // No I18N
                                    condition : "is", // No I18N
                                    value : resp.asset.ci.id,
                                }
                            ]
                        };
                    }
                });
            }
            $releaseList.cmdb_base_criteria = search_criteria;
        }
        return search_criteria;
    },
    /*
    Criteria to fetch all releases associated to workflow.
    */
    getSearchCriteriaForWorkflow : function() {
        let search_criteria;
        if(!jQuery.isEmptyObject($releaseList.workflow_base_criteria)) {
            search_criteria = $releaseList.workflow_base_criteria;
        }
        else {
            search_criteria = {
                field : "workflow", // No I18N
                condition : "is", // No I18N
                value : $releaseList.associatedEntityId
            };
            $releaseList.workflow_base_criteria = search_criteria;
        }
        return search_criteria;
    }
};


/* TableComponent initialization*/
$releaseList = jQuery.extend(true, (function(){
    let r = {};
    r.current_view_mode = ""; // No I18N
    r.isTrash = false;
    r.loadReleaseListView = function(viewMode){
    	if(window.checkIfMSP()){
    		$tabAccount.set($accountCombo.getPersistentAccountForTab());
    	}
        let componentName = ""; // No I18N
        if($releaseList.module === "releases"){ // No I18N
            componentName = "webc-releaselist"; // No I18N
        }
        delete WebComponents.instancePool[componentName];
        r.current_view_mode = viewMode;
        WebComponents.render(componentName);
        $releaseList.table_comp_release = WebComponents.getInstance(componentName);
    },
    r.rowDataConstruct = function(tableInfo) {
        let inputObject = {};
        let fields_required = tableInfo.fields_required;
        let fields_required_arr = Object.keys(fields_required);
        let actionCellIndex = fields_required_arr.indexOf("actioncell"); // No I18N
            actionCellIndex > -1 && fields_required_arr.splice(actionCellIndex, 1);
        let radioCellIndex = fields_required_arr.indexOf("radiocell"); // No I18N
            radioCellIndex > -1 && fields_required_arr.splice(radioCellIndex, 1);
            if($releaseList.module === "releases"){ // No I18N
                let chkindex = fields_required_arr.indexOf("releases_head_chk"); // No I18N
                    chkindex > -1 && fields_required_arr.splice(chkindex, 1);
                    fields_required_arr.push("emergency"); // No I18N
                    if(fields_required_arr.indexOf("scheduled_start_time") === -1){ // No I18N
                        fields_required_arr.push("scheduled_start_time"); // No I18N
                    }
                    if(fields_required_arr.indexOf("created_time") === -1){ // No I18N
                        fields_required_arr.push("created_time"); // No I18N
                    }
                    if(fields_required_arr.indexOf("stage") === -1){ // No I18N
                        fields_required_arr.push("stage"); // No I18N
                    }
                    if(fields_required_arr.indexOf("status") === -1){ // No I18N
                        fields_required_arr.push("status"); // No I18N
                    }
                    if(fields_required_arr.indexOf("title") === -1){ // No I18N
                        fields_required_arr.push("title"); // No I18N
                    }
					//for color setting some field required for color rendering
                    if(fields_required_arr.indexOf("risk") === -1){ // No I18N
                        fields_required_arr.push("risk"); // No I18N
                    }
                    if(fields_required_arr.indexOf("impact") === -1){ // No I18N
                        fields_required_arr.push("impact"); // No I18N
                    }
                    if(fields_required_arr.indexOf("priority") === -1){ // No I18N
                        fields_required_arr.push("priority"); // No I18N
                    }
                    if(fields_required_arr.indexOf("category") === -1){ // No I18N
                        fields_required_arr.push("category"); // No I18N
                    }
                    if(fields_required_arr.indexOf("urgency") === -1){ // No I18N
                        fields_required_arr.push("urgency"); // No I18N
                    }
            }
            tableInfo.list_info.fields_required = fields_required_arr;
            inputObject.list_info = tableInfo.list_info;
            inputObject.fields_required = fields_required_arr;
        return inputObject;
    },
    r.tableCompOptions = function(){
         let _self = this,
            options = {};
            options = {
                "column_settings": { //No i18N
                    "default_position": 2, //No i18N
                    "assign_content_width": false, //No i18N
                    "assign_label_width": false, //No i18N
                    "columns": [{ //No i18N
                            "size": 1, //No i18N
                            "width": (_self.icon_count === 2 ? '70px' : (_self.icon_count === 1 ? '50px' : '110px')), //No i18N
                            "row_count": 1 //No i18N
                        },
                        {
                            "size": 6, //No i18N
                            "row_count": 2, //No i18N
                            "default_position": 2, //No i18N
                            "pipe_separation": true //No i18N
                        },
                        {
                            "size": 2, //No i18N
                            "row_count": 2, //No i18N
                            "default_position": 2 //No i18N
                        },
                        {
                            "size": 2, //No i18N
                            "row_count": 2, //No i18N
                            "default_position": 2 //No i18N
                        }
                    ]
                },
                default_sort_field : {"sort_field" : "id","sort_order" : "desc"},//No i18N
            }
			if(color_settings_helper) {
				options["color_settings"] = color_settings_helper.color_settings;
			}
            return options;
    },
    r.headerDataConstruct = function(){
        let _self = this;
        let header = {
            "releases_head_chk": { //No i18N
                "column_settings": { //No I18N
                    "position": 1 //No I18N
                },
                "hide_label": true, //No i18N
                "default": true, //No i18N
                "type": "checkbox", //No i18N
                "dataCelltransformer": _self.constructChkboxCell // No I18N
            },
            "actioncell": { //No i18N
                "default": true, // No I18N
                "column_settings": {"position": 1}, // No I18N
                "dataCelltransformer": _self.constructActionCell, // No I18N
                "type": "icon", // No I18N
                "hide_label": true  //No I18N
            },
            "workflow": { //No i18N
                "column_settings": { //No I18N
                    "position": 1, //No I18N
                    "rowposition": 1 //No i18N
                },
                "hide_label": true, //No i18N
                "default": true, //No i18N
                "type": "icon", // No I18N
                "dataCelltransformer" : _self.constructWorkflow  //No I18N
            },
            "title": { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "position": 2, //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                },
                "dataCelltransformer": _self.constructTitle //No i18N
            },
            "release_type": { //No i18N
                "hide_label": false, //No i18N
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                },
                "dataCelltransformer": _self.constructType //No i18N
            },
            "release_engineer": { //No I18N
                "hide_label": false, //No i18N
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                },
                "dataCelltransformer": _self.constructReleaseEngineer //No i18N
            },
            "priority": { //No i18N
                "hide_label": false, //No i18N
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                },
                "dataCelltransformer": _self.constructPrioritiy //No i18N
            },
            "status": { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "value_path" : "status.name", //No i18N
                "column_settings": { //No i18N
                    "position": 3, //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                },
                "dataCelltransformer": _self.constructStatus //No i18N
            },
            "stage": {//No i18N
                "isHidden": true //No i18N
            },
            "tasks": { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "position": 4, //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                },
                "dataCelltransformer": _self.taskLoading //No i18N

            }
        };
        if(r.isTrash){
            header.deleted_time = {
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                }
            }
        }
        if(!_self.show_icons.checkbox){
            delete header.releases_head_chk;
        }
        if(!_self.show_icons.actioncell){
            delete header.actioncell;
        }
        return header;
    },
    r.constructTitle = function(table_data){
        let rd = table_data.row_data;
		let color=""; //No I18N
		if (this.current_view_mode !== "table" && color_settings_helper.color_settings && color_settings_helper.color_settings.is_enabled && !isDark()) {
			const colorSetting = color_settings_helper.color_settings;
			const csField = colorSetting.field;
			if (rd[csField] !== null) {
				let curFieldVal = rd[csField].id;
				if(!curFieldVal && typeof rd[csField] === 'boolean') {
					curFieldVal = rd[csField] ? "1" : "2"; //No I18N
				}
				if (colorSetting[csField]) {
		            if (colorSetting[csField][curFieldVal]) {
		                color = colorSetting[csField][curFieldVal].background_color;
		            } else {
		                color = colorSetting.default_color;
		            }
		        }
			} else {
				color = colorSetting.default_color;
			}
            color = e_attr(color);
		}
        let scheduled_start_time, scheduled_end_time;
        if(rd.scheduled_start_time){
            scheduled_start_time = rd.scheduled_start_time.display_value;
        }
        else{
            scheduled_start_time = "-";
        }
        if(rd.scheduled_end_time){
            scheduled_end_time = rd.scheduled_end_time.display_value;
        }
        else{
            scheduled_end_time = "-";
        }
        let emergency_color = "", entity = "", modCode = "";// No I18N
        let title_head = "";
        let title_class = ""; // No I18N
        if(r.current_view_mode === "linear"){ // No I18N
            title_class = "uni-heading"; // No I18N
        }
        if($releaseList.module === "releases"){ // No I18N
            entity = "release"; // No I18N
            modCode = "RL"; // No I18N
            if(rd.emergency){
                emergency_color = "rls-rocket2";// No I18N
                title_head = getMessageForKey("sdp.release.emergency");// No I18N
            }
            else{
                emergency_color = "rls-rocket1";// No I18N
                title_head = getMessageForKey("sdp.release.general");// No I18N
            }
        }
        let dataAttr = "data-"+entity; // No I18N
        let onclick_redirect = r.isTrash ? `nonce="${sdpNonce}" data-event="click" data-handler="$previewComponent.load('/ui/print?externalframe=true&module=${entity}&entity_id=${rd.id}', '${e_param(getMessageForKey('sdp.release.details'))}')"` : ''; // No I18N
        let spaAttrs = (r.isTrash || $releaseList.from) ? '' : ' data-spa-module="releases" data-spa-page="releases-details" data-spa="true" ';// No I18N
        let href = '/ui/releases?entity_id='+ rd.id +'&mode=detail'; // No I18N
        let a_title =  $releaseList.constructTooltipTitle(rd, scheduled_start_time, scheduled_end_time, emergency_color,title_head);
        let col_str = '<a '+spaAttrs+' href="'+href+'" mode_html="true" rel="uitip" title="'+ e_attr(a_title) +'" ' + onclick_redirect + ' class="'+ title_class +'" '+dataAttr+' ' + ($releaseList.from ? 'target="_blank"' : '') + ' style="background-color:'+e_html(color)+'">'; // No I18N
        if(r.current_view_mode === "linear"){ // No I18N
            col_str += '<span class="crspr icon-md flip-x '+ emergency_color +' mr5 vmiddle"></span><span class="vmiddle">'+modCode+'-'+ rd.id +'&nbsp;</span><span class="vmiddle">'+ e_html(rd.title) +'</span></a>';// No I18N
        }
        else{
            col_str += '<span class="crspr icon-md flip-x '+ emergency_color +' mr5 vmiddle"></span><span class="vmiddle">'+ e_html(rd.title) +'</span></a>';// No I18N
        }
        return col_str;
    },
    r.constructTooltipTitle = function(row_data, scheduled_start_time, scheduled_end_time, emergency_color,title_head){
        let modCode = "";// No I18N
        if($releaseList.module === "releases"){ // No I18N
            modCode = "RL"; // No I18N
        }
        return "<div class='ui-tooltip-style-1'><p class='text-color1 font-small'>"+ title_head+": "+modCode+" - "+ row_data.id +"</p> <span class='disp-t'> <span class='disp-c'><span class='crspr flip-x "+ emergency_color +" icon-md mr5'></span></span> <span class='sb vmiddle disp-c text-color4 wb-bw'>"+e_html(row_data.title)+"</span> </span><p class='mt10 mb0 font-small'><label class='text-muted mr5'>"+ getMessageForKey("common.status") +":</label>"+ e_html(row_data.status.name) +" /<span class='crspr icon-xs chn-stages2 top-1 mr3 ml3'></span>"+ e_html(row_data.stage.name) +"</p><hr class='mb10 mt10'><p class='font-small'><label class='text-muted mr5'>"+ getMessageForKey("sdp.common.scheduledstarttime")+":</label>"+ scheduled_start_time +"</p><p class='font-small'><label class='text-muted mr5'>"+ getMessageForKey("sdp.change.scheduledendtime")+":</label>"+ scheduled_end_time +"</p><p class='mb0 font-small'><label class='text-muted mr5'>"+ getMessageForKey("sdp.change.createdtime") +":</label>"+ row_data.created_time.display_value +"</p></div>";
    },
    r.constructChkboxCell = function(table_data){
        let rd = table_data.row_data;
        let rtl_style = ""; // No I18N
        if(sdp_user.DIRECTION === "RTL"){ // No I18N
            rtl_style = "right : 10px;"; // No I18N
        }
        else{
            rtl_style = "left : 10px;"; // No I18N
        }
        return "<input type='checkbox' name='checkbox' value=" + rd.id + " data-table-checkbox style='position: absolute; top: 22px;'"+ rtl_style+">"; //No I18N
    },
    r.constructRadioCell = function(table_data) {
        let rd = table_data.row_data;
        return '<input type="radio" name="' + $releaseList.module + '_head_chkd" value="' + rd.id + '">'; //No I18N
    },
    r.constructWorkflow = function(table_data){
        let rd = table_data.row_data;
        let workflow_style = ""; // No I18N
        if(r.current_view_mode === "linear"){// No I18N
            let rtl_style = "", indent_size = 70; // No I18N
            if($releaseList.icon_count === 2){
                indent_size = 35;
            }else if($releaseList.icon_count === 1){
                indent_size = 10;
            }
            if(sdp_user.DIRECTION === "RTL"){ // No I18N
                rtl_style = "right : "+ indent_size +"px;"; // No I18N
            }
            else{
                rtl_style = "left : "+ indent_size +"px;"; // No I18N
            }
            workflow_style = "position: absolute;top: 18px;"+ rtl_style;// No I18N
        }
        let workflow_title = "",workflow_icon = "rls-workflow1";// No I18N
        let workflow_id = null;
        if(rd.workflow){
            workflow_id = rd.workflow.id;
            workflow_title = "<div class='popover-inner'><p class='text-color6 mb0'>"+ e_attr(e_html(rd.workflow.name))+"</p></div>"; // No I18N
        }
        else{
            workflow_title = "<div class='popover-inner'><p class='text-color6 mb0'>"+ getMessageForKey("sdp.common.noworkflow") +"</p></div>"; // No I18N
            workflow_icon = "rls-workflow3";// No I18N
        }
        let workflow_construct = '<a href="/" ' + ((workflow_id && !$releaseList.from) ? 'data-event="click" data-handler="$previewComponent.load(\'/ViewWorkflow.do?module_id='+ rd.id +'&externalframe=true&module=release&workflow_id=' +  workflow_id +'\',\'' + getMessageForKey('common.workflow.label')+'\');" nonce="' + sdpNonce + '" style="cursor:pointer"' : 'style="cursor:default"') + '><span class="crspr icon-md '+ workflow_icon+'" style="'+ workflow_style+'" title="'+ workflow_title+'" mode_html="true" rel="uitip"></span></a>'; // No I18N

        return (r.current_view_mode !== "linear" ? '<div class="ml5 tc">' + workflow_construct + '</div>' : workflow_construct); // No I18N
    },
    r.taskLoading = function(table_data){
        let rd = table_data.row_data;
        let col_str = ""; // No I18N
        if(r.current_view_mode === "linear"){ // No I18N
            col_str = '<label rel="uitip" class="text-muted m0 text-overflow disp-b pb10">'+ getMessageForKey("task.title")+' </label>'; // No I18N
        }
        col_str += '<div  id="release_task_' + rd.id + '"> <div class="loading-bar1"></div><div class="loading-bar1"></div><div class="loading-bar1"></div><div class="loading-bar1"></div></div>'; // No I18N
        return col_str;
    },
    r.constructPrioritiy = function(table_data){
        let rd = table_data.row_data;
        let col_str;
        if( rd.priority ){
            if( rd.priority.color ){
                col_str = '<div class="d_w"><span class="arrowBG mt3 mr5 vmiddle" style="background:'+e_attr(rd.priority.color)+'"></span><span class="vmiddle">'+ e_html(rd.priority.name)+'</span></div>';// No I18N
            }
            else{
                col_str = '<span class="vmiddle">'+ e_html(rd.priority.name)+'</span>';// No I18N
            }
            return col_str;
        }
        return '-'; // No I18N
    },
    r.callbackInitialRender = function(viewMode){
        if( $releaseList.operation === "associateto"){ // No I18N
            jQ("#listview_btn").attr("disabled", true); // No I18N
        }
        else{
            jQ("#listview_btn").on('click',function(){         // No I18N
               let filterList_obj = new filterListComp();
               filterList_obj.initComponent({
                   element : "#ListViewFilterMenu",  // No I18N
                   module : $releaseList.module === "releases" ? "release" : "change",  // No I18N
                   personalize_key : $releaseList.module + "_filter_views",// No I18N
                   //mod_spec_pers_key : "releases",// No I18N
                   filter_action : "$releaseList.switchFilterView", //No I18N
                   isTrashEnabled: true,
                   favoritable : true,
                   custom_filters : false,
                   skipPersonalization : true
               });
            });
        }
    },
    r.switchFilterView = function(viewId,viewName){
        let _self = this;

        if(viewId === "trash"){
            //$releaseList.table_comp_release.t_obj.table_info.list_info.filter_by = {"name":"trash"};// No I18N
            if($releaseList.search_text){
                $releaseList.resetGlobalSearch();
            }
            r.isTrash = true;
            $releaseList.filter_view_internal_name = viewId;
            $releaseList.filter_view_display_name = viewName;
            if($releaseList.viewMode === 'calendar'){
            $releaseList.switchReleaseView('table'); // No I18N
            }
            else{
                $releaseList.setTemplate($releaseList.view,$releaseList.viewMode,r.isTrash);
            }
            jQ('#releases-filters').text(viewName); // No I18N
            jQ('#listview_btn').attr("title",viewName);// No I18N
            return;
        }
        //We don't need below handling for asset association. so skipping below block.
        else if(!$releaseList.fromCMDB){
            let current_view = {};
            if(sdp_user.CLIENT_CONF.releases_currentview){
                current_view = Object.assign({}, sdp_user.CLIENT_CONF.releases_currentview);
            }
            current_view.filter_by = { "id": viewId};// No I18N
            addPersonalization("releases_currentview", current_view); // No I18N
            if($releaseList.search_text){
                jQ("#subheader_search_box").val(""); // No I18N
                jQ('[data-spa-page="releases-list"]').trigger("click");// No I18N
                return false;
            }
            sdpAjax({
                url: '/api/v3/list_view_filters/'+viewId, // No I18N
                success: function(resp) {
                    $releaseList.filter_view_internal_name = resp.list_view_filter.name;
                    $releaseList.filter_view_display_name = resp.list_view_filter.display_name;
                },
                async: false
            });
        }
        if($releaseList.viewMode === 'calendar'){
            if($releaseList.filter_view_internal_name === 'unscheduled_releases'){
                //$releaseList.table_comp_release.t_obj.table_info.list_info.filter_by = { "id": viewId }; // No I18N
                r.isTrash = false;
                $releaseList.switchReleaseView('table'); // No I18N
                jQ('#releases-filters').text(viewName); // No I18N
                jQ('#listview_btn').attr("title",viewName);// No I18N
                return;
            }else{
                manageCalendarView.getCalendarData(scheduler._min_date, scheduler._max_date, viewId);
            }
        }else{
            let table_info = $releaseList.table_comp_release.t_obj.table_info;
            //In asset association, we are reusing default release listview filter's by internal_name for asset_release filter.
            $releaseList.table_comp_release.t_obj.table_info.list_info.filter_by = ( $releaseList.fromCMDB ) ? { "name" : viewId } : { "id" : viewId }; //No i18n
            $releaseList.table_comp_release.t_obj.table_info.list_info.start_index = 1;

            if(r.isTrash ){
                    r.isTrash = false;
                    $releaseList.table_comp_release.addPersonalizeData($releaseList.table_comp_release.t_obj.table_info);
                    $releaseList.setTemplate($releaseList.view,$releaseList.viewMode,false);
            }
            else{
                //New list_info is added into personalization to reflect filter_by parameter.
                if( $releaseList.fromCMDB ) {
                    $releaseList.table_comp_release.t_obj.table_info.list_info.search_criteria = $releaseList.getSearchCriteriaForCMDB();
                    $releaseList.table_comp_release.addPersonalizeData($releaseList.table_comp_release.t_obj.table_info);
                }
                if( $releaseList.fromWorkflow ) {
                    $releaseList.table_comp_release.t_obj.table_info.list_info.search_criteria = $releaseList.getSearchCriteriaForWorkflow();
                    $releaseList.table_comp_release.addPersonalizeData($releaseList.table_comp_release.t_obj.table_info);
                }
                $releaseList.table_comp_release.changeFilterString("clearOnly");// No I18N
                if(table_info.list_info && table_info.list_info.search_criteria && r.current_view_mode === "linear"){
                    jQuery(".viewFiltRight .cancel-filter").trigger( "click" ); // No I18N
                }
                else{
                    $releaseList.table_comp_release.refreshTable("refresh");// No I18N
                }
            }
         }
        //We don't need below handling for asset association. so skipping below block.
        if( !$releaseList.fromCMDB ) {
            jQ('#releases-filters').text(viewName);// No I18N
            jQ('#listview_btn').attr("title",viewName);// No I18N
        }
    },
    r.callbackAfterTableRender = function(){
        //visibleContents property holds the order of the loaded records in listview
        $CRObj.loadedRecords = $releaseList.table_comp_release.loadedIDs;
        let loadedRecords = $releaseList.table_comp_release.loadedRecords;
        let keys = Object.keys(loadedRecords);
        if(keys.length){
            let url = "/api/v3/" + $releaseList.module + "/summary?ids="+keys.toString();// No I18N
                let data = sdpAjaxInputData({"list_info":{"fields_required":["tasks"]}});//NO I18N
            sdpAjax({
                url: url,
                    data: data,
                success: function (response) {
                    let summary = response.summary;
                    let spaAttrs = r.isTrash ? '' : ' data-spa-module="releases" data-spa-page="releases-details" data-spa="true" ';//NO I18N
                    for(let i=0;i<summary.length;i++){
                        let tasks = summary[i].tasks;
                        let width = 0;
                        if(tasks.all !== 0){
                            width = (tasks.closed/tasks.all) * 100 ;
                        }

                        let col_str = '<a '+ ($releaseList.from ? '' : (spaAttrs+' href="/ui/releases?entity_id='+ summary[i].id +'&mode=detail#tasks"')) + 'rel="uitip noopener noreferrer" title="'+getMessageForKey("sdp.project.listview.progresstitle",[Number(tasks.closed), Number(tasks.all)])+'"><span class="ui-progressbar1-info ui-progressbar1-pos1"><span class="ui-progressbar1a"><span style="width:'+ width+'%;" class="ui-progressbar1-fill"></span></span>  <span class="ui-progressbar1-after"><span class="count mr5">'+ tasks.closed +'</span>/<span class="ml5 fontgray">'+ tasks.all +'</span></span></span></a>';// No I18N
                        jQuery("#release_task_"+summary[i].id).html(col_str);
                        $sdEventListener(jQuery('#releases_body'));
                    }
                },
                async: false
            });
        }
        if(r.isTrash){
            jQuery("#"+$releaseList.module+"_btn_delete").attr("title",getMessageForKey("sdp.release.listview.delete.permanent"));
        }
        else{
            jQuery("#"+$releaseList.module+"_btn_delete").off("click").on("click",function(event){ // No I18N
                event.preventDefault();
            });
        }
        if($releaseList.filter_view_internal_name === "unscheduled_releases" || r.isTrash || $releaseList.filter_view_internal_name === "Search"){ // No I18N
            jQ("#cal-view").hide();//NO I18N
        }
        else{
            jQ("#cal-view").show();//NO I18N
        }
        jQ("#" + $releaseList.module + "-save-selection").prop("disabled",true); //No I18N
        jQ("input[name='" + $releaseList.module + "_head_chkd']").change(function(){   //No I18N
            jQ("#" + $releaseList.module + "-save-selection").prop("disabled",false); //No I18N
        });
        jQ("#colorSet").off("click").on("click",function(){ //No I18N
            color_setting.openColorSettingsDropDown('release'); //No I18N
        });
    },
    r.trashTaskOnclick = function(id){
        let entity = $releaseList.module === "releases" ? "release" : "change"; // No I18N
        $previewComponent.load("/ui/print?externalframe=true&module="+entity+"&entity_id="+id+"#tasks",null,null,null);// No I18N
    },
    r.bulkSelectionConstruct = function(data){
        let emergency_color;
        if($releaseList.module === "releases"){// No I18N
            if(data.emergency){
                emergency_color = "rls-rocket2";// No I18N
            }
            else{
                emergency_color = "rls-rocket1";// No I18N
            }
        }
        return '<span rel="uitip"><span class="crspr icon-md flip-x '+ emergency_color +' mr5 vmiddle"></span>&nbsp;#'+data.id+' <span class="vmiddle">'+ e_html(data.title) +'</span></span>';
    },
    r.constructStatus = function(table_data){
        let rd = table_data.row_data;
        return "<span class='disp-ib text-overflow' style='max-width:100%;''><div class='mb10'>"+ e_html(rd.status.name)+ " /</div><span class='crspr icon-xs chn-stages2 top-1 mr3 ml3' rel='uitip' title='"+getMessageForKey("sdp.admin.change.stage")+"'></span>"+ e_html(rd.stage.name)+"</span>";//No I18N
    },
    r.constructActionCell = function(table_data){
        let rd = table_data.row_data;
        let entity = $releaseList.module === "releases" ? "release" : "change"; // No I18N
        let dataAttr = "data-"+entity; // No I18N
        let onclick_redirect = '$CRObj.redirectTo("'+entity+'","edit",'+rd.id+')'; // No I18N
        let action_cell_style = ""; // No I18N
        if(r.current_view_mode === "linear"){ // No I18N
            action_cell_style = "top:18px";// No I18N
        }
        let col_str;
        if(r.current_view_mode === "linear"){
            col_str = '<div class="btn-group tc-req-edit bs-noconflict pos-abs" style="'+ action_cell_style +'" > <a class="cur-ptr cspr menulist icon-xs flat sdmenu-toggle vmiddle" data-switch="sdmenu" title="' + getMessageForKey("sdp.common.actions") + '" ></a>' +
                        '<ul class="sdmenu-dd" role="menu">'; // No I18N
            col_str += $releaseList.constructActioncellOptions(rd,dataAttr,onclick_redirect);
            col_str +='</ul></div>';// No I18N
        }
        else{
            col_str = '<div class="ml-5 tc"><div class="btn-group tc-req-edit bs-noconflict pos-abs ml-5" style="'+ action_cell_style +'" > <a class="cur-ptr cspr menulist icon-xs flat  sdmenu-toggle vmiddle" data-switch="sdmenu" title="' + getMessageForKey("sdp.common.actions") + '" ></a>' +
                        '<ul class="sdmenu-dd" role="menu">'; // No I18N
            col_str += $releaseList.constructActioncellOptions(rd,dataAttr,onclick_redirect);
            col_str +='</ul></div></div>';// No I18N
        }
        return col_str;
    },
    r.constructActioncellOptions = function(rd,dataAttr,onclick_redirect){
        let html = "";// No I18N
            if(r.isTrash){
                html += $releaseList.permissions["delete"] ? ('<li><a href="/" data-table-delete data-entityid='+ rd.id +'>'  + getMessageForKey("sdp.common.delete") + '</a></li>') : "";// No I18N
            }
            else{
                let spaAttrs = ' data-spa-module="releases" data-spa-page="releases-edit" data-spa="true" ';// No I18N
                html += $releaseList.permissions.edit ? ('<li><a '+spaAttrs+' href="/ui/releases?mode=edit&entity_id='+ rd.id +'"  '+dataAttr+' data-cs-field="edit_release">' + getMessageForKey("sdp.common.edit") + ' </a></li>') : "";
                html += $releaseList.permissions["delete"] ? ('<li><a href="/" data-event="click" data-handler="$releaseList.moveToTrash(' + rd.id + ')" nonce="' + sdpNonce + '" data-cs-field="delete_release">' + getMessageForKey("sdp.common.delete") + '</a></li>') : "";// No I18N
            }
        return html;
    },
    r.constructType = function(table_data){
        let rd = table_data.row_data;
        let col_str;
        if( rd.release_type ){
            if( rd.release_type.color ){
                col_str = '<div class="d_w"><span class="arrowBG mt3 mr5 vmiddle" style="background:'+ e_attr(rd.release_type.color)+'"></span><span class="vmiddle">'+ e_html(rd.release_type.name)+'</span></div>';// No I18N
            }
            else{
                col_str = '<span class="vmiddle">'+ e_html(rd.release_type.name)+'</span>';// No I18N
            }
            return col_str;
        }
        return '-'; // No I18N

    },
    r.constructReleaseEngineer = function(table_data){
        let rd = table_data.row_data;
        if( rd.release_engineer ){
            return e_html(rd.release_engineer.name);
        }
        return getMessageForKey("sdp.common.unAssign"); // No I18N
    },
    r.tableEntityInfo = function(personalize_key){
        let table_info = getPersonalizeData(personalize_key);
        let filter_by;
        if(!r.isTrash && !r.associatedEntityId){
            let current_view = Object.assign({}, sdp_user.CLIENT_CONF.releases_currentview);
            if(current_view && current_view.filter_by && current_view.filter_by.id){
                filter_by = current_view.filter_by;
            }
        }
        if($releaseList.filter_view_display_name){
            jQ('#releases-filters').text($releaseList.filter_view_display_name);// No I18N
            jQ('#listview_btn').attr("title",$releaseList.filter_view_display_name);// No I18N
        }
        //Modifying listview filter display name using Personalized Data if filter_by is present in table_info for asset association.
        if( $releaseList.fromCMDB && !jQuery.isEmptyObject(table_info) && !jQuery.isEmptyObject(table_info.list_info.filter_by) ) {
            let filterObj = $releaseList.assetFilterObj.filter(function(x) { if ( x.value === table_info.list_info.filter_by.name ) { return x; } });
            jQuery("#releaseFilterDropdown").select2("val", filterObj[0].id).change();   //No I18N
        }
        if(jQuery.isEmptyObject(table_info) || jQuery.isEmptyObject(table_info.fields_required)){
            let t_info;
            let listInfo = {
                start_index : 1,
                row_count : 10,
                get_total_count :"true" // No I18N
            };
            if(r.current_view_mode === "linear"){
                t_info = {
                    "list_info": listInfo, //No i18N
                    "fields_required" : {"workflow":"","release_type":"","release_engineer":"","scheduled_end_time":""},// No I18N
                    "column_order" : ["workflow","release_type","release_engineer","scheduled_end_time"] // No I18N
                };
            }
            else if($releaseList.operation === "associated"){
                if($releaseList.from === "change"){ //No I18N
                   t_info = {
                        "list_info": listInfo, //No i18N
                        "fields_required" : {"id":"","title":"","release_type":"", "stage":"", "status": "","priority":"","release_engineer":""},// No I18N
                        "column_order" : ["id","title","release_type", "stage", "status","priority","release_engineer"] // No I18N
                    };
                }
                else if($releaseList.from === "project"){ //No I18N
                    t_info = {
                        "list_info": listInfo, //No i18N
                        "fields_required" : {"id":"","title":"","release_type":"","release_engineer":"", "stage":"", "status": "","scheduled_start_time":"","scheduled_end_time":""},// No I18N
                        "column_order" : ["id","title","release_type","release_engineer", "stage", "status","scheduled_start_time","scheduled_end_time"] // No I18N
                    };
                }
                else {
                    if ($releaseList.fromCMDB) {
                        //Adding search_criteria to fetch asset associated release entries.
                        listInfo.search_criteria = $releaseList.getSearchCriteriaForCMDB();
                        listInfo.filter_by = {"name": "open_releases"};	//No I18N
                    }
                    else if ($releaseList.fromWorkflow) {
                        listInfo.search_criteria = $releaseList.getSearchCriteriaForWorkflow();
                        listInfo.filter_by = {"name": "open_releases"};	//No I18N
                    }
                    t_info = {
                        "list_info": listInfo, //No i18N
                        "fields_required" : {"id":"","title":"","release_type":"", "stage":"", "status": "","priority":"","release_engineer":"","scheduled_start_time":"","scheduled_end_time":""},// No I18N
                        "column_order" : ["id","title","release_type","stage", "status","priority","release_engineer","scheduled_start_time","scheduled_end_time"] // No I18N
                    };
                }
            }
            else{
                t_info = {
                    "list_info": listInfo, //No i18N
                    "fields_required": {"workflow":"","id":"","title":"","release_type":"", "stage":"", "status": "","release_engineer":"","tasks":"","scheduled_end_time":""},// No I18N
                    "column_order" : ["workflow","id","title","release_type","stage", "status","release_engineer","tasks","scheduled_end_time"]// No I18N
                };
            }
            table_info = t_info;
        }
        //search_criteria handling is not present in default personalization. So adding search criteria for asset association if not present.
        else if( $releaseList.fromCMDB && !table_info.list_info.search_criteria ) {
            table_info.list_info.search_criteria = $releaseList.getSearchCriteriaForCMDB();
        }
        else if( $releaseList.fromWorkflow && !table_info.list_info.search_criteria ) {
            table_info.list_info.search_criteria = $releaseList.getSearchCriteriaForWorkflow();
        }
        if(r.isTrash){
            table_info.fields_required["deleted_time"]={"width": "200px"};// No I18N
            table_info.list_info.filter_by = {"name":"trash"};     // No I18N
        }
        else if(filter_by){
            table_info.list_info.filter_by = filter_by;
        }
        if(r.search_text){
            table_info.list_info.gsearch = r.search_text;
            delete table_info.list_info.filter_by;
            jQ("#subheader_search_box").val(r.search_text); // No I18N
        }else{
            jQ("#subheader_search_box").val(""); // No I18N
        }
        return table_info;
    },
    r.switchReleaseView = function(view_mode) {
        let current_view = {};
        if(sdp_user.CLIENT_CONF.releases_currentview){
            current_view = Object.assign({}, sdp_user.CLIENT_CONF.releases_currentview);
        }
        let viewMode;
        if(view_mode === "classic"){ // No I18N
            $releaseList.viewMode = 'classic'; // No I18N
            viewMode = "linear"; // No I18N
            current_view.view = 'classic'; // No I18N
        }
        else if(view_mode === "table"){ // No I18N
            $releaseList.viewMode = 'table'; // No I18N
            viewMode = "table"; // No I18N
            current_view.view = "table"; // No I18N
        }
        else if(view_mode === "calendar"){
            /*if($releaseList.filter_view_internal_name === "unscheduled_releases"){
                $releaseList.switchReleaseView('table'); // No I18N
                return;
            }*/
            $releaseList.viewMode = 'calendar'; // No I18N
            viewMode = "calendar"; // No I18N
            current_view.view = "calendar"; // No I18N
        }
        if(view_mode === "classic" || view_mode === "calendar"){
             /**
              * To remove "url_search" from Url when navigate to classic and calendar view
              */
            const getTableInstance = $releaseList.table_comp_release;
            if(!jQuery.isEmptyObject(getTableInstance)){
                getTableInstance.changeFilterString("clearSearch");
            }
        }
        addPersonalization("releases_currentview",current_view); // No I18N
        //pass view as kanban to settemplate for a classic view
        current_view.view = (current_view.view === "classic") ? "kanban" : current_view.view; // No I18N
		if(window.cs_enabled){
			color_settings_helper.callApi("release",function(csObj){ //No I18N
				color_settings_helper.color_settings = csObj;
				$releaseList.setTemplate(current_view.view,viewMode,r.isTrash);
			});
		} else {
			$releaseList.setTemplate(current_view.view,viewMode,r.isTrash);
		}
    },
    r.setDataMetaInfo = function(){
        return {"for":"list_view"}; // No I18N
    },
    r.advFilterSettingsCB = function(){
        return {
            "options":{ // No I18N
                "metainfo_entity" : $releaseList.module, // No I18N
                "allowReadOnly" : true, // No I18N
                "haveOtherUDF" : true, // No I18N
                "setNullSiteDef" : true, // No I18N
                "changeURLData" : function(field) {  //No I18N
                    if(field === 'status') {
                        let input_data = {};
                        input_data['for'] = "release_advance_filter"; //No I18N
                        return { "data" : input_data }; //No I18N
                    }
                },
                "allowed_value" : { //No I18N
                    "callback": function (list_info, id) { //No I18N
                        if(id === 'status') {
                            return { sort_field: "stage", sort_order: "asc", row_count: "20"}; //No I18N
                        }
                    }
                }
            }
        };
    },
     r.setHeight = function(){
        let height;
        let listview_height;
        if($releaseList.operation === "associated"){ // No I18N
            if($releaseList.from === "change"){ //No I18N
                return 45;
            }
            else if ($releaseList.from === "project"){
                return 34;
            }
        }
        else if($releaseList.operation === "associateto"){
            return (jQuery(window).height()- ($releaseList.from === "change" ? 150 : 100));  //No I18N
        }
        if(r.current_view_mode === "linear"){ // No I18N
            listview_height = 83;
        }
        else{
            listview_height = 110;
        }
        let chatBarHeight = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
        jQuery('#header-placeholder').length === 0 ? height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatBarHeight - 80) : height = (jQuery(window).height() - jQuery('#header-placeholder').height() - chatBarHeight - listview_height);//No I18N
        return ($releaseList.isTrash? height-65 : height-15);
     },
     r.setWidth = function(){
        let width = jQ("#listview").width(); // No I18N
        if($releaseList.operation === "associated"){  // No I18N
            if($releaseList.from === "change"){ //No I18N
                return width - 2;
            }
            else if ($releaseList.from === "project"){  //No I18N
                return jQ("#projectdetailsincidents").width() - 4; //No I18N
            }
            else if ($releaseList.fromWorkflow) {
                return jQuery(window).width() - 4;
            }
        }
        else if($releaseList.operation === "associateto"){
            return jQuery(window).width() - 4;
        }
        else{
            return width;
        }
     },
     r.callbackColorSettingsBooleanVal = function(rd,field) {
		 let fieldObj = (field) ? rd[field] : rd[0][rd[1]];
		 if(typeof fieldObj === "boolean") {
			return fieldObj ? "1" : "2";
		 }
		 return null;
	 },
     r.setNoDataString = function(){
        if(r.current_view_mode === "linear"){ // No I18N
            return '<div class="tc p15"><span>'+ ($releaseList.module === "releases" ? getMessageForKey("sdp.release.no") : "")+'</span></div>';
        }
        else{
            return '<span>'+($releaseList.module === "releases" ? getMessageForKey("sdp.release.no") : "") +'</span>';// No I18N
        }
    },
    r.setNoDataBanner = function(table_data){
        const entity = $releaseList.module === "releases" ? "release" : "change"; // No I18N
        const dataAttr = "data-"+entity; // No I18N
        let table_info = table_data.t_obj.table_info;
        let search_filter = false;

        if(table_info.list_info){
            search_filter = (table_info.list_info.gsearch || table_info.list_info.search_fields) ? true : ((table_info.list_info.search_criteria && (Object.keys(table_info.list_info.search_criteria).length > 0)));
        }
        if($releaseList.filter_view_internal_name === "all_releases" && !search_filter && !r.isTrash && !$releaseList.associatedEntityId){// No I18N
            const noRecordImg = isDark() ? '/images/rls-empty-stateicon-dark.svg' : '/images/rls-empty-stateicon.svg'; // No I18N
            let html = '<div style="height: '+ (Number(r.setHeight()) + Number(50)) +'px; "><div class="lt-tp-md-abs"><div class="disp-t fw tc"><img style="max-height: 245px; height: 30vh;" rel="uitip" alt="No release" title="No release" src="'+noRecordImg+'" height="245" width="245"></div><div class="disp-t fw tc" style="max-width: 600px; margin: auto;"><h2 class="mb15 nobold">'+getMessageForKey("sdp.release.nodata.header") +'</h2><p class="font-medium2 lh24 mb20">'+getMessageForKey("sdp.release.nodata.explain")+'</p>';
            if($releaseList.permissions.add){
                let spaAttrs = ' data-spa-module="releases" data-spa-page="releases-add" data-spa="true" ';// No I18N
                html += '<a '+spaAttrs+' role="button" type="button" href="/ui/releases?mode=add" aria-label="Create New Release" value="'+ getMessageForKey("sdp.release.create.new")+'" class="btn btn-primary p5 pl15 pr15" '+dataAttr+' data-cs-field="create_release">'+ getMessageForKey("sdp.release.create.new")+'</a>';// No I18N
            }
            html += '</div></div>';//NO I18N
            return html;
        }
        else if($releaseList.operation === "associated" && $releaseList.from === "change"){ //NO I18N
            jQuery("#listviewloader").attr('style','height: 54px'); //NO I18N
            jQuery("#table_render_div").removeClass("listview"); //NO I18N
            jQuery("#table_render_div").css("display", "inline"); //NO I18N

            let contextObj = {from: $releaseList.from, fromModuleName : getMessageForKey("sdp.common.change"), fromModuleSmallCase: getMessageForKey("sdp.common.change.smallcase")};
            /*  change fields that will be synced with release template*/
            /* fields displayed in left side of the tooltip */
            contextObj.fieldsToSync1 = [
                getMessageForKey("sdp.change.sla.condition.type"), // No I18N
                getMessageForKey("sdp.admin.survey.criteria.urgency"), // No I18N
                getMessageForKey("common.group"), // No I18N
                getMessageForKey("sdp.change.risk"), // No I18N
                getMessageForKey("sdp.admin.survey.criteria.subcategory"), // No I18N
                getMessageForKey("sdp.change.serviceaffected.title"), // No I18N
                getMessageForKey("common.title"), // No I18N
                getMessageForKey("sdp.project.projectattribute.scheduledstarttime") // No I18N
            ];
            /* fields displayed in right side of the tooltip */
            contextObj.fieldsToSync2 = [
                getMessageForKey("sdp.change.sla.condition.impact"), // No I18N
                getMessageForKey("common.site"), // No I18N
                getMessageForKey("common.priority"), // No I18N
                getMessageForKey("sdp.common.category"), // No I18N
                getMessageForKey("sdp.common.item"), // No I18N
                getMessageForKey("sdp.itil.common.asset"), // No I18N
                getMessageForKey("sdp.common.description"), // No I18N
                getMessageForKey("sdp.project.projectattribute.scheduledendtime") // No I18N
            ];
            renderhbs('#create_release_dialog_container','new_release_overwrite_popup', contextObj, false, 'release');

            let html = '<div id="no_assocReleaseList" class="alert-nodata"><div class="msg">'; // No I18N
            html +=  getMessageForKey("sdp.change.noreleaseassociationmsg") + '&nbsp'; // No I18N
            if($releaseList.permissions.add && !$releaseList.preview){
                html +=  (sdp_user.ROLES.indexOf("CreateReleases") !== -1) ? ('<a class="text-primary" href="/" data-event="click" data-handler="showModal(\'createReleaseUI\',\'540px\',\'auto\',\'auto\',false); initTooltip(\'#createReleaseUI\')" nonce="' + sdpNonce + '" >' + getMessageForKey("sdp.change.associate.new.release") + '</a>&nbsp;' + getMessageForKey("sdp.admin.common.or") + '&nbsp') : ''; // No I18N
                html += '<a class="text-primary" href="/" data-event="click" data-handler="$previewComponent.load(\'/release/ReleaseList.jsp?module=release&from=change&associatedEntityID='+ $releaseList.associatedEntityId+'&externalframe=true&operation=associateto\',\'' + getMessageForKey("sdp.release.associaterelease") +'\',null,null,null,\'listview_popup\')" nonce="' + sdpNonce + '" >' + getMessageForKey("sdp.change.associate.child.release") + '</a></div></div>'; // No I18N
            }
            return html;
        }
        else if($releaseList.operation === "associated" && $releaseList.from === "project"){ //NO I18N
            jQuery("#listviewloader").attr('style','height: 44px'); //NO I18N
            jQuery("#table_render_div").removeClass("listview"); //NO I18N
            jQuery("#table_render_div").css("display", "inline"); //NO I18N

            let contextObj = {from: $releaseList.from, fromModuleName : getMessageForKey("common.project"), fromModuleSmallCase: getMessageForKey("common.project.smallcase")};
            /*  project fields that will be synced with new release template*/
            contextObj.fieldsToSync1 = [
                getMessageForKey("common.title"),
                getMessageForKey("sdp.common.description"),
                getMessageForKey("common.priority"),
                getMessageForKey("common.site")
            ];
            renderhbs('#create_release_dialog_container','new_release_overwrite_popup', contextObj, false, 'release');

            let html = '<div id="no_assocReleaseList" class="alert-nodata whitebg"><span class="status-icon icon-lg pr10"><span aria-hidden="true" class="common-sprite icon-lg info-icon2-lg"></span></span><span class="msg">'; // No I18N
            html +=  getMessageForKey("sdp.change.noreleaseassociationmsg") + '&nbsp'; // No I18N
            if($releaseList.permissions.add){
                html +=  (sdp_user.ROLES.indexOf("CreateReleases") !== -1) ? ('\"<a id="asso-release-new" class="text-link" href="/" data-event="click" data-handler="showModal(\'createReleaseUI\',\'540px\',\'auto\',\'auto\',false); initTooltip(\'#createReleaseUI\')" nonce="' + sdpNonce + '" >' + getMessageForKey("sdp.change.associate.new.release") + '</a>\"&nbsp; ' + getMessageForKey("sdp.admin.common.or") + '&nbsp') : ''; // No I18N
                html += '\"<a id="asso-release-existing" class="text-link" href="/" data-event="click" data-handler="$previewComponent.load(\'/release/ReleaseList.jsp?module=release&from=project&associatedEntityID='+ $releaseList.associatedEntityId+'&externalframe=true&operation=associateto\',\'' + getMessageForKey("sdp.release.associaterelease") +'\',null,null,null,\'listview_popup\')" nonce="' + sdpNonce + '" >' + getMessageForKey("sdp.change.associate.child.release") + '</a>\"</span></div>'; // No I18N
            }
            return html;
        }
        return false;
    },
    r.createReleaseToAssociate = function(div_id){
        r.closeDialog(div_id);
        const overwrite_id = jQ('[name="overwritetmp"]:checked').attr('id'); // No I18N
        $previewComponent.load('/release/ReleaseForm.jsp?module='+ $releaseList.entity +'&mode=add&from='+ $releaseList.from +'&associatedEntityId=' + $releaseList.associatedEntityId+'&operation=associateto&overwrite='+ overwrite_id+'&externalframe=true', getMessageForKey('sdp.release.new'),null,null,null,'newrelease_popup'); // No I18N
    },
    r.closeDialog = function(div_id){
        jQ(div_id).dialog("close"); // No I18N
        jQuery(div_id).dialog("destroy"); // No I18N
    },
    r.getcallBackData = function (argument) {
        let opt = argument.t_obj.options;
        let inputObject = opt.row_inputdata;
        let dataVal = sdpAjaxInputData(inputObject);
        let returnObj;
        let sdpOptions = {
            url: opt.defaultpath + opt.callbackURL,
            data: dataVal,
            success: function(obj) {
                returnObj = obj;
                for (let i = 0; i < obj[opt.entity_name].length; i++) {
                    returnObj[opt.entity_name][i] = obj[opt.entity_name][i][$releaseList.entity];
                }
            },
            async: false,
        };
        if($releaseList.from === "project"){ //No I18N
            sdpOptions.acceptODCompatible = true;
        }
        sdpAjax(sdpOptions);
        return returnObj;
    },
    /**
     * CallBack to handle field search.
     * For release association list view search we always need search criteria to be present.
     * But API don't support list_info with both search_criteria and search_fields. Also table component doesn't have any proper handling for this.
     * So we are converting search_fields into search_criteria and appending these criteria with association base criteria.
     */
    r.callbackSearchFunction = function() {
        let _self = this;
        let search_criteria = [];
        const association_base_criteria = $releaseList.fromCMDB ? $releaseList.getSearchCriteriaForCMDB() : $releaseList.getSearchCriteriaForWorkflow();
        search_criteria.push(association_base_criteria);
        if (_self.table_comp_release.t_obj.table_info.list_info.search_criteria) {
            search_criteria.push(_self.table_comp_release.t_obj.table_info.list_info.search_criteria);
        }
        //search_fields to search_criteria conversion
        delete _self.table_comp_release.t_obj.table_info.list_info.search_criteria;
        _self.table_comp_release.t_obj.table_info.list_info.search_criteria = search_criteria;
        //Refreshing table component to reflect new data.
        $releaseList.table_comp_release.refreshTable("refresh"); //NO I18N
    },
    r.additionalMetaInfo = function(){
        let additionalMetaInfo =  {
            "release_engineer": {"value_path" : "release_engineer.name", "type" : "string"}, //No I18N
            "urgency": {"value_path" : "urgency.name", "type" : "string"}, //No I18N
            "group": {"value_path" : "group.name", "type" : "string"}, //No I18N
            "item": {"value_path" : "item.name", "type" : "string"}, //No I18N
            "release_manager": {"value_path" : "release_manager.name", "type" : "string"}, //No I18N
            "impact": {"value_path" : "impact.name", "type" : "string"}, //No I18N
            "release_type": {"value_path" : "release_type.name", "type" : "string"}, //No I18N
            "priority": {"value_path" : "priority.name", "type" : "string"}, //No I18N
            "risk": {"value_path" : "risk.name", "type" : "string"}, //No I18N
            "category": {"value_path" : "category.name", "type" : "string"}, //No I18N
            "subcategory": {"value_path" : "subcategory.name", "type" : "string"}, //No I18N
            "status": {"value_path" : "status.name", "type" : "string"} //No I18N
        };
        if(r.current_view_mode !== "linear"){
            additionalMetaInfo.stage = {"value_path" : "stage.name", "type" : "string"}; //No I18N
        }
        return additionalMetaInfo;
    }
    return r;
}()),$releaseList);
