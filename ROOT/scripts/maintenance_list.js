// $Id$
var $maintenanceList = {
	
	init : function(options){
		$maintenanceList.initialize(options);
		var promises=[];
		promises.push($maintenanceList.getLinksData());
		promises.push($maintenanceList.fetchMetaData());
		var _self=this;
		if(options&&options.gsearch&&options.gsearch!="null"&&options.gsearch!=undefined){
			_self.gsearch=options.gsearch;
			_self.isGlobalSearch=true;
			jQuery("#subheader_search_box").val(e_attr(options.gsearch)); // No I18N
		}		
		var view_mode = "table",view = "table",viewMode="table";// No I18N
        var current_view = {};
		var viewKey = "request_maintenances_currentview"; // No I18N
		if(_self.isGlobalSearch){
			viewKey="global_"+viewKey; // No I18N
		}		
        if(sdp_user.CLIENT_CONF[viewKey]){
            current_view = Object.assign({}, sdp_user.CLIENT_CONF[viewKey]);
			viewMode=current_view.view;
        }
		if(viewMode == "calendar"){
			jQuery(".page-progressbar").hide(); //No I18N
			if($maintenance.canShowCalendar()){
				$maintenanceCalendar.loadCalendarView();
				return;
			}
			else{
				view_mode = "table"; //No I18N
				view = "table"; //No I18N
				viewMode="table"; //No I18N
			}
		}
        else if(viewMode == "classic"){ // No I18N
            view_mode = "linear"; // No I18N
            view = 'kanban'; // No I18N
        }
		var filterPersonlize = {};
		var filterViewKey = "request_maintenances_filterview"; // No I18N
		if(_self.isGlobalSearch){
			filterViewKey="global_"+filterViewKey; // No I18N
		}
        if(sdp_user.CLIENT_CONF[filterViewKey]){
            filterPersonlize = Object.assign({}, sdp_user.CLIENT_CONF[filterViewKey]);
        }		
		if(filterPersonlize.quick_filter&&sdp_app.IS_SERVICECATALOG_ENABLED){
			_self.quick_filter=filterPersonlize.quick_filter;	
		}	
		if(filterPersonlize.list_view_filter&&filterPersonlize.list_view_filter.id){
			_self.list_view_filter_id=filterPersonlize.list_view_filter.id;	
			promises.push($maintenanceList.getListViewFilterDetails(filterPersonlize.list_view_filter.id));
		}	
		jQuery.when.apply(this, promises).then(function() {
			jQuery(".page-progressbar").hide(); //No I18N			
			$maintenanceList.loadTemplate(view,view_mode);
		});
	},
	
	initialize : function () {
		this.links={};
		this.current_view_mode="table"; // No I18N
		this.view="table"; // No I18N
		this.viewMode="table"; // No I18N
		this.table_comp_maintenance={};
		this.fieldsMetaInfo={};
		this.quick_filter='all'; // No I18N
		this.list_view_filter_name='all_maintenances'; // No I18N
		this.list_view_filter_display_name=window.getMessageForKey('all.maintenance');
		this.list_view_filter_id='';
		this.gsearch=null;
		this.isGlobalSearch=false;
	},
	
	loadTemplate : function(view,view_mode){
		$maintenanceList.current_view_mode=view_mode;
		$maintenanceList.view=view;
		$maintenanceList.viewMode=view_mode;
		var contextObj ={"view":view,"viewMode":view_mode}; // No I18N
        if($maintenanceList.links["delete"]){
			contextObj.checkbox = true;
		}
		if($maintenanceList.links.edit||$maintenanceList.links["delete"]){
			contextObj.actioncell = true;
			if($maintenanceList.links.edit){
				contextObj.edit = true;
			}
		}
        if($maintenanceList.links["add"]){
			contextObj.add = true;
		}	
        if($maintenanceList.links["generate_request"]){
			contextObj.generate_request = true;
		}			
		contextObj.IS_SITE_CONFIGURE=sdp_app.IS_SITE_CONFIGURE;
		contextObj.quick_filter=$maintenanceList.quick_filter;
		contextObj.list_view_filter_id=$maintenanceList.list_view_filter_id;
		contextObj.list_view_filter_name=$maintenanceList.list_view_filter_name;
		contextObj.list_view_filter_display_name=$maintenanceList.list_view_filter_display_name;
		contextObj.IS_SERVICECATALOG_ENABLED=sdp_app.IS_SERVICECATALOG_ENABLED;
		contextObj.isGlobalSearch=$maintenanceList.isGlobalSearch;
		contextObj.canShowCalendar=$maintenance.canShowCalendar();
		if(window.isMSPOrSCP) {
			$mspMaintenanceList.modifyListViewContext(contextObj);
		}
		renderhbs("#maintenance-section", "maintenance_listview_template", contextObj , false, "maintenance",null,null,$maintenanceList.listTemplateCallback);// NO I18N
		if(sdp_app.IS_SITE_CONFIGURE){
			$maintenanceList.initSiteFilter();
		}
		$maintenanceList.loadMaintenanceListView();
	},

	listTemplateCallback : () => {
        jQuery("#maintenance_all_filter").off('click').on('click', (event) => {                 // No I18N
    		$maintenanceList.handleRequestTypeFilter('all');                                    // No I18N
    	});
    	jQuery("#maintenance_incident_filter").off('click').on('click', (event) => {            // No I18N
    		$maintenanceList.handleRequestTypeFilter('incident');                               // No I18N
    	});
    	jQuery("#maintenance_service_filter").off('click').on('click', (event) => {             // No I18N
    		$maintenanceList.handleRequestTypeFilter('service');                                // No I18N
    	});
    	jQuery("#listcontrolsTableView [data-id='tableViewBtn']").off('click').on('click', (event) => {         //No I18N
    		$maintenanceList.switchMaintenanceView('table');
    	});
    	jQuery("#listcontrolsTableView [data-id='classicViewBtn']").off('click').on('click', (event) => {           //No I18N
    		$maintenanceList.switchMaintenanceView('classic');
    	});
    	jQuery("#listcontrolsTableView [data-id='calendarViewBtn']").off('click').on('click', (event) => {            // No I18N
    		$maintenanceCalendar.loadCalendarView();
    	});
    },

	loadMaintenanceListView : function(){
        var componentName = "webc-request_maintenances"; // No I18N
        delete WebComponents.instancePool[componentName];
        WebComponents.render(componentName);
        $maintenanceList.table_comp_maintenance = WebComponents.getInstance(componentName);
    },
	rowDataConstruct: function(table_info)
    {
        var inputObject = {};
		var _self=this;
        var fields_required = table_info.fields_required;
        var fields_required_arr = Object.keys(fields_required);
        var actioncellIndex = fields_required_arr.indexOf("actioncell"); // No I18N
        actioncellIndex > -1 && fields_required_arr.splice(actioncellIndex, 1);
        var chkindex = fields_required_arr.indexOf(_self.module+"_head_chk"); // No I18N
        chkindex > -1 && fields_required_arr.splice(chkindex, 1);	
        var generateRequestCellIndex = fields_required_arr.indexOf("generateRequestCell"); // No I18N
        generateRequestCellIndex > -1 && fields_required_arr.splice(generateRequestCellIndex, 1);		
		if($maintenanceList.current_view_mode=="table"){
			/*In table view, id,name,created_time,scheduler.frequency,scheduler.next_schedule_time,maintenancestate.
			group,technician are default fields and will be available in column chooser too. In these fields, scheduler.frequency,
			scheduler.next_schedule_time are scheduler fields and they are always available in get list. so we don't pass them in input.
			However, we  use comments,category,status,is_service_request fields to construct tooltip.
			So we pass them even if user has not chosen them via column chooser.
			*/
			fields_required_arr.push("is_service_request");
			if(!(fields_required_arr.indexOf("maintenancestate")>-1)){
				fields_required_arr.push("maintenancestate");
			}				
			if(!(fields_required_arr.indexOf("comments")>-1)){
				fields_required_arr.push("comments");
			}
			if(!(fields_required_arr.indexOf("category")>-1)){
				fields_required_arr.push("category");
			}
			if(!(fields_required_arr.indexOf("status")>-1)){
				fields_required_arr.push("status");
			}			
			var freqIndex=fields_required_arr.indexOf("scheduler.frequency");
			if(freqIndex>-1){
				fields_required_arr.splice(freqIndex, 1);	
			}
			var nextIndex=fields_required_arr.indexOf("scheduler.next_schedule_time");
			if(nextIndex>-1){
				fields_required_arr.splice(nextIndex, 1);	
			}			
		}
		else{
			/* In classic view name,scheduler.frequency,scheduler.next_schedule_time,maintenancestate
			are default fields and won't be available in column chooser.In these fields, scheduler.frequency,scheduler.next_schedule_time
			are scheduler fields and they are always available in get list. so we don't pass them in input and pass only name and maintenancestate if not available 
			in fields required.	When no personalization is done, we show created_time,requester,category,impact,technician as default fields and these fields 
			will be available in column chooser. However, we  use comments,category,status,is_service_request fields to construct tooltip.
			So we pass them even if user has not chosen them via column chooser.
			*/
			fields_required_arr.push("is_service_request");
			if(!(fields_required_arr.indexOf("name")>-1)){
				fields_required_arr.push("name");
			}
			if(!(fields_required_arr.indexOf("maintenancestate")>-1)){
				fields_required_arr.push("maintenancestate");
			}			
			if(!(fields_required_arr.indexOf("comments")>-1)){
				fields_required_arr.push("comments");
			}
			if(!(fields_required_arr.indexOf("category")>-1)){
				fields_required_arr.push("category");
			}
			if(!(fields_required_arr.indexOf("status")>-1)){
				fields_required_arr.push("status");
			}	
			var freqIndex=fields_required_arr.indexOf("scheduler.frequency");
			if(freqIndex>-1){
				fields_required_arr.splice(freqIndex, 1);	
			}
			var nextIndex=fields_required_arr.indexOf("scheduler.next_schedule_time");
			if(nextIndex>-1){
				fields_required_arr.splice(nextIndex, 1);	
			}			
		}
        inputObject.fields_required = fields_required_arr;
        inputObject.list_info = table_info.list_info;
		inputObject.list_info.search_criteria = $maintenanceList.getSearchCriteria(true);
		if($maintenanceList.isGlobalSearch){
			inputObject.list_info.gsearch=$maintenanceList.gsearch;
		}
		if($maintenanceList.list_view_filter_id){
			inputObject.list_info.filter_by={"id":$maintenanceList.list_view_filter_id}; //No I18N
		}		
        return inputObject;
    },
	headerDataConstruct: function(table_info)
    {
        var _self = this;
        var header = {};
		if($maintenanceList.links["delete"]){
			header["request_maintenances_head_chk"]= { //No i18N
                "column_settings": { //No I18N
                    "position": 1 //No I18N
                },
				"dataCelltransformer": _self.constructCheckBoxCell, // No I18N
                "hide_label": true, //No i18N
                "default": true, //No i18N
                "type": "checkbox" //No i18N
            };
		}
		if($maintenanceList.links.edit||$maintenanceList.links["delete"]){
            header["actioncell"]= { //No i18N
                "default": true, // No I18N
                "column_settings": {"position": 1}, // No I18N
                "dataCelltransformer": _self.constructActionCell, // No I18N
                "type": "icon", // No I18N
                "hide_label": true  //No I18N
            };
		}
		if($maintenanceList.links.generate_request){
            header["generateRequestCell"]= { //No i18N
                "default": true, // No I18N
                "column_settings": {"position": 1}, // No I18N
                "dataCelltransformer": _self.constructGenerateRequestCell, // No I18N
                "type": "icon", // No I18N
                "hide_label": true  //No I18N
            };
		}	
        header["name"]= { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
				"dataCelltransformer": _self.constructTitleCell, // No I18N
                "column_settings": { //No i18N
                    "position": (($maintenanceList.links["delete"]==undefined&&$maintenanceList.links.edit==undefined&&$maintenanceList.links.generate_request==false)?1:2), //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                }
        };	
        header["scheduler.frequency"]= { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
				"text":window.getMessageForKey("schedule.type"), // No I18N
				"disableSorting" : true, // No I18N
				"disableSearching" : true, // No I18N
				"dataCelltransformer": _self.constructScheduleTypeCell, // No I18N
                "column_settings": { //No i18N
                    "position": (($maintenanceList.links["delete"]==undefined&&$maintenanceList.links.edit==undefined&&$maintenanceList.links.generate_request==false)?2:3), //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                }
        };	
        header["scheduler.next_schedule_time"]= { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
				"disableSorting" : true, // No I18N
				"disableSearching" : true, // No I18N
				"text":window.getMessageForKey("custom.schedule.next.schedule"), // No I18N
				"dataCelltransformer": _self.constructNextScheduleCell, // No I18N
                "column_settings": { //No i18N
                    "position": (($maintenanceList.links["delete"]==undefined&&$maintenanceList.links.edit==undefined&&$maintenanceList.links.generate_request==false)?3:4), //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                }
        };		
        header["maintenancestate"]= { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
				"text":window.getMessageForKey("sdp.inventory.detailAsset.state"), // No I18N
				"disableSorting" : true, // No I18N
				"disableSearching" : true,			 // No I18N	
				"dataCelltransformer": _self.constructMaintenanceStateCell, // No I18N
                "column_settings": { //No i18N
                    "position": (($maintenanceList.links["delete"]==undefined&&$maintenanceList.links.edit==undefined&&$maintenanceList.links.generate_request==false)?4:5), //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                }
        };
        header["created_time"]= { //No i18N
                "hide_label": false //No i18N
        };	
        header["requester"]= { //No i18N
                "hide_label": false //No i18N
        };	
        header["category"]= { //No i18N
                "hide_label": false //No i18N
        };	
        header["impact"]= { //No i18N
                "hide_label": false //No i18N
        };	
        header["technician"]= { //No i18N
                "hide_label": false //No i18N
        };
        header["site"]= { //No i18N
			"dataCelltransformer": _self.constructSite, // No I18N
        };		
        if(window.isMSPOrSCP) {
            $mspMaintenanceList.modifyHeaderDataContructionConfig(header)
        }
		return header;
    },
	getListSettingOptions : function() {
		if($maintenanceList.current_view_mode=="table"){
			return {"enableSettings":["record_per_page","reset_column_width"],"disableSettings":["display_density","text_wrapping","reset_personalization"]}; // No I18N
		} else{
			return {"enableSettings":["record_per_page","sorting"],"disableSettings":["display_density","reset_personalization","text_wrapping","reset_column_width"]}; // No I18N
		}
	},
	getMetaData : function () {
        return $maintenanceList.fieldsMetaInfo;
    },
	fetchMetaData : function () {
	    var input_data = sdpAjaxInputData({"for": "request_maintenance_list_view"}); //No I18N
        var sdpOptions = {
            url: "/api/v3/request_maintenances/metainfo?" + input_data, // No I18N
            success: function(data) {
                 $maintenanceList.fieldsMetaInfo = data.metainfo.fields;
            },
            cache:false
        };
        return sdpAjax(sdpOptions);
    },	
    getLinksData : function(){
        var links_data = { "generate_request" : sdp_user.ROLES.indexOf("CreateRequests")>-1&&(sdp_user.ROLES.indexOf("CreateRequestMaintenances")>-1 || sdp_user.ROLES.indexOf("ModifyRequestMaintenances")>-1)?true:false}; // No I18N
        var url = "/api/v3/request_maintenances/_links";//NO I18N
        return sdpAjax({
			url: url,
            success: function (response) {
				var links = response._links;
                links = links.links || links;
                links.forEach(function (link) {
					if(link.name){
						links_data[link.name] = true;
                    }
                });			
				$maintenanceList.links=links_data;
            }
        });
    },	
    advFilterSettingsCB : function(){
    	// variable advFilterSettings introduced to modify config for MSP/SCP
        var advFilterSettings = {
            "options":{ // No I18N
                "metainfo_entity" : "request_maintenances", // No I18N
                "allowReadOnly" : true, // No I18N
                "haveOtherUDF" : true, // No I18N
                "setNullSiteDef" : true, // No I18N
				metaParam: "advanced_search_filter",  //No I18N
				changeURLData: $maintenanceList.changeURLData,
				metaInfo_input : {"for":"advanced_search_filter"}, //No I18N
				allowNegativeValues: false,
                haveMultiString: true,
				subFieldsArr: {"site":["region","name"]},  //No I18N
				fieldTypeConditions: {
                    "resolution.content": ["is_empty", "is_not_empty", "contains", "not_contains"], //No I18N
                    "description": ["is_empty", "is_not_empty", "contains", "not_contains"] //No I18N
                },
            }
        }
        if(window.isMSPOrSCP) {
        	$mspMaintenanceList.modifyAdvFilterSettings(advFilterSettings);
        }
        return advFilterSettings;
    },	
	changeURLData: function(field,url){
        var  fieldData='';
        var fieldIncludesInactives=['category','subcategory','item','group','impact','level','mode','priority','urgency','request_type','service_category','status','template','site']; //No I18N
        var fieldIncludesFor=['template','status','service_category','requester']; //No I18N
        var data={};
        if(url){ //This section is for handling changes in URL of allowed values API
            if(fieldIncludesFor.includes(field)){
                data["for"]="advanced_search_filter"; //No I18N
            }
            if(fieldIncludesInactives.includes(field) || field.indexOf("udf_pick_") > -1){
                data["include_inactive_value"]=true; //No I18N
            }
            fieldData={"data":data}; //No I18N
            return fieldData;
        }
        else{ //This section is for handling changes in URL of Meta Info API
            if(field == "item" || field == "subcategory" || field == "category" || field == "site"){
                fieldData={"data":{input_data:sdpToJSON( {"for":"advanced_search_filter"})}}; //No I18N
                return fieldData;
            }
        }		
	},
    callbackAfterInitialRender : function(){
		jQuery("#maintenance_listview_btn").on('click',function(){         // No I18N
               var filterList_obj = new filterListComp();
               filterList_obj.initComponent({
                   element : "#ListViewFilterMenu",  // No I18N
                   module :"request_maintenance",  // No I18N
                   personalize_key : "maintenance_filter_views",// No I18N
                   filter_action : "$maintenanceList.switchFilterView", //No I18N
                   isTrashEnabled: false,
                   favoritable : false,
                   custom_filters : false,
                   skipPersonalization : true,
				   hideFilterSearch :true
               });
		});
		if($maintenanceList.current_view_mode == "table"){
			jQuery("#request_maintenances_div").removeClass("tablebrd1");	//No I18N
		}
    },
	callbackAfterTableRender : function(){
		initTooltip('#maintenance-section');//no i18n
		window.$maintenanceLoadedIDs={};
		window.$maintenanceLoadedIDs.loadedIDs = Object.assign({},$maintenanceList.table_comp_maintenance.loadedIDs);
		jQuery("#maintenance-section [data-action-name='generateRequest']").off('click').on('click', (event) => {                 //No I18N
        	$maintenanceList.generateRequestConfirm(event.currentTarget.dataset.maintenanceId);
        });
        jQuery("#maintenance-section [data-action-name='suspendResumeMaintenance']").off('click').on('click', (event) => {                      //No I18N
        	let currentDataSet = event.currentTarget.dataset;
        	$maintenanceList.showSuspendResumePopup(currentDataSet.maintenanceState==1?"suspend":"resume",currentDataSet.maintenanceId);    //No I18N
        });
	},
	switchFilterView : function(viewId,viewName){
		var filterPersonlize = {};
		var _self=this;
		var viewKey = "request_maintenances_filterview"; // No I18N
		if(_self.isGlobalSearch){
			viewKey="global_"+viewKey; // No I18N
		}
		filterPersonlize.quick_filter=_self.quick_filter;
		filterPersonlize.list_view_filter={"id":viewId,"name":viewName}; // No I18N
		_self.list_view_filter_id=viewId;
		addPersonalization(viewKey,filterPersonlize);
		var tablecomp = WebComponents.getInstance("webc-request_maintenances"); //NO I18N
		var listInfoObj = tablecomp.t_obj.table_info.list_info;
		this.clearSearchFromView();
		listInfoObj.search_criteria = $maintenanceList.getSearchCriteria(true);
		var promises = [$maintenanceList.getListViewFilterDetails(viewId)];
		jQuery.when.apply(this, promises).then(function() {
			jQuery('#maintenances-filters').text($maintenanceList.list_view_filter_display_name); // No I18N
			jQuery('#maintenance_listview_btn').attr("title",$maintenanceList.list_view_filter_display_name);// No I18N
			tablecomp.t_obj.table_info.list_info.filter_by = {"id":viewId}; // No I18N
			// Refresh table
			tablecomp.refreshTable();
		});
	},
	initSiteFilter: function() {
		var _self=this;
		var ele = jQuery('[data-name="siteFilter"]');
		var options = {
			cache:{},
			closeOnSelect : false,
			multiple:false,
			allowClear: true,
			include_inactive_value : true,
			placeholder: translate("sdp.admin.org.technician.allsite"),
			url:[{
				url:"/api/v3/request_maintenances/site",//NO I18N
				field: "site" // No I18N
			}]
		};
		if(window.isMSP) {
			$mspMaintenanceList.modifySiteFilterOptions(options);
		}
		ele.sdp_select2(options);
		ele.on("change", function(e) {
			var tablecomp = WebComponents.getInstance("webc-request_maintenances"); //NO I18N
			var listInfoObj = tablecomp.t_obj.table_info.list_info;
			_self.clearSearchFromView();
			listInfoObj.search_criteria = $maintenanceList.getSearchCriteria(true);
			// Refresh table
			tablecomp.refreshTable();
		});
	},
	callbackSearchFunction : function(){
		var tablecomp = WebComponents.getInstance("webc-request_maintenances"); //NO I18N
		var search_criteria = $maintenanceList.getSearchCriteria();
		if(tablecomp.t_obj.table_info.list_info.search_criteria&&search_criteria&&search_criteria.length>0){
			if(tablecomp.t_obj.table_info.list_info.search_criteria.children){
				for(var i=0;i<search_criteria.length;i++){
					tablecomp.t_obj.table_info.list_info.search_criteria.children.push(search_criteria[i]);
				}
			}
			else{
				tablecomp.t_obj.table_info.list_info.search_criteria.children=search_criteria;
			}
		}
		else if(search_criteria&&search_criteria.length>0){
			tablecomp.t_obj.table_info.list_info.search_criteria=[];
			for(var i=0;i<search_criteria.length;i++){
				tablecomp.t_obj.table_info.list_info.search_criteria.push(search_criteria[i]);
			}
		}
		tablecomp.refreshTable("refresh"); // No I18N
	},
	getSearchCriteria : function(includeTableSearch){
		var search_criteria=[];
		if(sdp_app.IS_SITE_CONFIGURE){
			var ele = jQuery('[data-name="siteFilter"]');
			var val = ele.val();
			if(val){
				search_criteria.push({
					field: (val=="-1"?"site":"site.id"), // NO I18N
					value: (val=="-1"?null:val),
					condition: "is", // No I18N
					logical_operator: "and" // NO I18N
				});
			}
		}
		if($maintenanceList.quick_filter!='all'){
			var is_service_request=false;
			if($maintenanceList.quick_filter=='service'){
				is_service_request=true;
			}
			search_criteria.push({
				field: "is_service_request", // NO I18N
				value: is_service_request,
				condition: "is", // No I18N
				logical_operator: "and" // NO I18N
			});
		}
		return search_criteria;
	},
	getListViewFilterDetails : function(list_view_filter_id){
		return sdpAjax({
			url: '/api/v3/list_view_filters/'+list_view_filter_id, // No I18N
            success: function(resp) {
				$maintenanceList.list_view_filter_id = resp.list_view_filter.id;
                $maintenanceList.list_view_filter_name = resp.list_view_filter.name;
				$maintenanceList.list_view_filter_display_name = resp.list_view_filter.display_name;
            }
        });
	},
	tableCompOptions : function(){
		var _self = this,options = {};
        options = {
			"column_settings": { //No i18N
				"default_position": 2, //No i18N
                "assign_content_width": false, //No i18N
                "assign_label_width": false, //No i18N
                 "columns": [{ //No i18N
							"width": (($maintenanceList.links["delete"] == undefined && $maintenanceList.links.edit == undefined && $maintenanceList.links.generate_request == false) ? '' : "110px"),	//No i18N
							"size": (($maintenanceList.links["delete"]==undefined&&$maintenanceList.links.edit==undefined&&$maintenanceList.links.generate_request==false)?6:1), //No i18N
                            //"width": (($maintenanceList.links["delete"]==undefined&&$maintenanceList.links.edit==undefined&&$maintenanceList.links.generate_request==false)?'':'143px'), //No i18N
                            "row_count": (($maintenanceList.links["delete"]==undefined&&$maintenanceList.links.edit==undefined&&$maintenanceList.links.generate_request==false)?2:1), //No i18N
							"pipe_separation": (($maintenanceList.links["delete"]==undefined&&$maintenanceList.links.edit==undefined&&$maintenanceList.links.generate_request==false)?true:false), //No i18N
                        },
                        {
                            "size": ($maintenanceList.links["delete"]==undefined&&$maintenanceList.links.edit==undefined&&$maintenanceList.links.generate_request==false?2:6), //No I18N
                            "row_count": 2, //No i18N
                            "default_position": 2, //No i18N
							"pipe_separation": true,  // No I18N
                        },
                        {
                            "size": 2, //No I18N
                            "row_count": 2, //No i18N
                            "default_position": 2, //No i18N
							"pipe_separation": false //No i18N
                        },
                        {
                            "size": 2, //No I18N
                            "row_count": 2, //No i18N
                            "default_position": 2 //No i18N
                        },
                        {
														"width" : "5.5vw",	//No i18N
                            "size": 1, // No I18N
                            "row_count": 2, //No i18N
                            "default_position": 2 //No i18N
                        }
                    ]
                },
                default_sort_field : {"sort_field" : "name","sort_order" : "desc"}//No i18N
		}
		options.cancelFilterTable = $maintenanceList.cancelAdvancedFilter;
		options.applyFilterTable =  $maintenanceList.applyAdvancedFilter;
		options.listSettingOptions = $maintenanceList.getListSettingOptions();
		options.isFR_ListInfo_Support = true;
		return options;
    },
	cancelAdvancedFilter : function(isManual){
		//jQuery('[data-name="siteFilter"]').prop("disabled", false);  // No I18N
		$maintenanceList.table_comp_maintenance.t_obj.table_info.list_info.search_criteria= $maintenanceList.getSearchCriteria();;
		//$maintenanceList.initSiteFilter();
		if(!isManual) {
			$maintenanceList.table_comp_maintenance.refreshTable("refresh"); // No I18N
		}
	},
	applyAdvancedFilter : function(search_criteria){
		//jQuery('#siteFilter').val("").prop("disabled", true).select2("destroy");  // No I18N
		$maintenanceList.table_comp_maintenance.t_obj.table_info.list_info.search_criteria=search_criteria;
		var sc = $maintenanceList.getSearchCriteria();
		if(sc && sc.length>0){
			$maintenanceList.table_comp_maintenance.t_obj.table_info.list_info.search_criteria=search_criteria.concat(sc);
		}
		$maintenanceList.table_comp_maintenance.refreshTable("refresh"); // No I18N
	},
	additionalMetaInfo : function(){
		var self=this;
		var position = (($maintenanceList.links["delete"]==undefined&&$maintenanceList.links.edit==undefined&&$maintenanceList.links.generate_request==false)?1:2);
		var obj = {
			"editor" :{ "value_path": "editor.name", "type" : "string","column_settings":{"position":position}}, // No I18N
            "urgency": {"value_path" : "urgency.name", "type" : "string","column_settings":{"position":position}}, //No I18N
            "group": {"value_path" : "group.name", "type" : "string","column_settings":{"position":position}}, //No I18N
            "item": {"value_path" : "item.name", "type" : "string","column_settings":{"position":position}}, //No I18N
            "impact": {"value_path" : "impact.name", "type" : "string","column_settings":{"position":position}}, //No I18N
            "priority": {"value_path" : "priority.name", "type" : "string","column_settings":{"position":position}}, //No I18N
            "category": {"value_path" : "category.name", "type" : "string","column_settings":{"position":position}}, //No I18N
            "subcategory": {"value_path" : "subcategory.name", "type" : "string","column_settings":{"position":position}}, //No I18N
			"site": {"value_path" : "site.name", "type" : "string","column_settings":{"position":position}}, //No I18N
			"service_category": {"value_path" : "service_category.name", "type" : "string","column_settings":{"position":position}}, //No I18N
			"level": {"value_path" : "level.name", "type" : "string","column_settings":{"position":position}}, //No I18N
			"requester": {"value_path" : "requester.name", "type" : "string","column_settings":{"position":position}}, //No I18N
			"mode": {"value_path" : "mode.name", "type" : "string","column_settings":{"position":position}}, //No I18N
			"request_type": {"value_path" : "request_type.name", "type" : "string","column_settings":{"position":position}}, //No I18N
			"template": {"value_path" : "template.name", "type" : "string","column_settings":{"position":position}}, //No I18N
            "status": {"value_path" : "status.name", "type" : "string","column_settings":{"position":position}}, //No I18N
			"created_by": {"value_path" : "created_by.name", "type" : "string","column_settings":{"position":position}}, //No I18N
			"comments": {"column_settings":{"position":position}}, //No I18N
			"id": {"column_settings":{"position":position}}, //No I18N
			"subject": {"column_settings":{"position":position}}, //No I18N
			"created_time": {"column_settings":{"position":position}}, //No I18N
			"technician": {"column_settings":{"position":position}} //No I18N
		};
		var udf_fields=Object.assign({},self.fieldsMetaInfo.udf_fields);
		if(udf_fields&&udf_fields.fields)
		{
			var udfKeys=Object.keys(udf_fields.fields);
			for(var i=0;i<udfKeys.length;i++)
			{
				if(udf_fields.fields[udfKeys[i]].display_type != "MultiSelect" && udf_fields.fields[udfKeys[i]].display_type != "CheckBox"){
					obj["udf_fields."+udfKeys[i]]={"column_settings":{"position":position}}; //No I18N
				}
			}
		}
		if(window.isMSPOrSCP) {
			$mspMaintenance.modifyAdditionalMetaInfo(obj);
		}
		return obj;
    },
	setNoDataString : function(){
        if($maintenanceList.current_view_mode == "linear"){ // No I18N
            return '<div class="tc p15"><span>'+window.getMessageForKey("common.noitems",[window.getMessageForKey("common.maintenance")])+'</span></div>';
        }
        else{
            return '<span>'+window.getMessageForKey("common.noitems",[window.getMessageForKey("common.maintenance")])+'</span>';// No I18N
        }
    },
	constructCheckBoxCell : function(table_data){
		if($maintenanceList.current_view_mode == "linear"){
			return '<span class="pos-abs top20 mt-2" ><input type="checkbox" value="'+table_data.row_data.id+'" data-table-checkbox=""></span>';
		}
		return '<input type="checkbox" value="'+table_data.row_data.id+'" data-table-checkbox="">';
	},
    constructActionCell : function(table_data){
		var _self = this;
        var rd = table_data.row_data;
        var col_str = '<div class="pos-abs '+($maintenanceList.current_view_mode == "linear"?'top20 mt-4':'ml5 pl2')+'"><span class="menutoggle sdmenu bs-noconflict">'+
            '<a href="/" class="cur-ptr cspr menulist icon-xs flat sdmenu-toggle top-2" data-switch="sdmenu" title="'+getMessageForKey("sdp.common.actions")+'" rel="uitip" aria-expanded="true"></a>'+
            '<ul class="sdmenu-dd" role="menu">'+
              ($maintenanceList.links.edit?('<li><a data-spa="true" data-spa-module="maintenances" data-spa-page="maintenances-edit" rel="noopener" href="/ui/maintenances?mode=edit&id='+rd.id+'" >'+getMessageForKey("sdp.common.edit")+'</a></li>'):'')+
              ($maintenanceList.links["delete"]?('<li><a href="/" data-table-delete data-entityid='+ rd.id +' >'+getMessageForKey("sdp.common.delete")+'</a></li>'):'')+
              ($maintenanceList.links.edit&&rd.maintenancestate!=2?('<li><a href="/" data-maintenance-id="'+rd.id+'" data-maintenance-state="'+rd.maintenancestate+'" data-action-name="suspendResumeMaintenance">'+getMessageForKey((rd.maintenancestate==1?"suspend.operation":"admin.optood.resume.migration"))+'</a></li>'):'')+
            '</ul>'+
          '</span></div>';// No I18N
        return col_str;
    },
	constructGenerateRequestCell : function(table_data){
    	var rd = table_data.row_data;
    	if($maintenanceList.current_view_mode == "linear"){
       		return '<div class="pos-abs top20 right20 mt-4" ><span data-maintenance-id="'+rd.id+'" data-action-name="generateRequest" class="rspr icon-sm generate-req cur-ptr tf1-1 m0" title="'+getMessageForKey("generate.request")+'" rel="uitip" role="img"></span></div>';
       	}
       	return '<div class="tc"><span data-maintenance-id="'+rd.id+'" data-action-name="generateRequest" class="rspr icon-sm generate-req cur-ptr tf1-1 m0" title="'+getMessageForKey("generate.request")+'" rel="uitip" role="img"></span></div>';
    },
	constructTitleCell : function(table_data) {
		var rd = table_data.row_data;
		if($maintenanceList.current_view_mode == "table"){  // No I18N
    		return `<a rel="noopener uitip" mode_html=true title="${e_attr($maintenanceList.getTitleToolTip(rd))}" href="/ui/maintenances?mode=details&id=${rd.id}" data-spa="true" data-spa-module="maintenances" data-spa-page="maintenances-details" class="pos-rel"><span class="cspr icon-md ${rd.is_service_request ? 'service' : 'incident'}-request mr5"></span><span class="pos-rel top-1">${e_html(rd.name)}</span></a>`;
    	}
    	return `<a rel="noopener uitip" mode_html=true title="${e_attr($maintenanceList.getTitleToolTip(rd))}" href="/ui/maintenances?mode=details&id=${rd.id}" data-spa="true" data-spa-module="maintenances" data-spa-page="maintenances-details" class="pos-rel uni-heading top-1"><span class="cspr icon-md ${rd.is_service_request ? 'service' : 'incident'}-request mr5"></span><span class="pos-rel">${e_html(rd.name)}</span></a>`;
    },
	getTitleToolTip : function (rd) {
		var typeKeys= {"once":"common.once","daily":"common.daily","weekly":"common.weekly","monthly":"sdp.inventory.detailAsset.DepreciationMonthly","yearly":"common.yearly"}; // No I18N
		return '<div class="ui-tooltip-style-1"><span class="disp-t mb3"><span class="disp-c pr5"><span class="cspr icon-md '+(rd.is_service_request?"service":"incident")+'-request"></span></span><span class="sb vmiddle disp-c text-color4 wb-bw">'+e_html(rd.name)+'</span> </span><p class="font-small text-color1 lh-normal wb-bw">'+e_html(rd.comments?rd.comments:'')+'</p><hr class="mb10 mt10"><p class="font-small"><label class="text-muted mr5">'+window.getMessageForKey("sdp.requests.common.category")+':</label>'+e_html(rd.category&&rd.category.name?rd.category.name:'-')+'</p><p class="font-small"><label class="text-muted mr5">'+window.getMessageForKey("sdp.itil.common.status")+':</label>'+e_html(rd.status&&rd.status.name?rd.status.name:'-')+'</p><p class="font-small"><label class="text-muted mr5">'+window.getMessageForKey("schedule.type")+':</label>'+window.getMessageForKey(rd.scheduler.frequency?typeKeys[rd.scheduler.frequency]:'-')+'</p><p class="font-small mb3"><label class="text-muted mr5">'+window.getMessageForKey("custom.schedule.next.schedule")+':</label>'+(rd.scheduler.next_schedule_time?rd.scheduler.next_schedule_time:'-')+'</p></div>';
	},
	constructScheduleTypeCell : function(table_data) {
		var rd = table_data.row_data;
		var typeKeys= {"once":"common.once","daily":"common.daily","weekly":"common.weekly","monthly":"sdp.inventory.detailAsset.DepreciationMonthly","yearly":"common.yearly"}; // No I18N
		if($maintenanceList.current_view_mode == "table"){
			return '<span rel="uitip" mode_ellipsis="true" title="'+window.getMessageForKey(rd.scheduler.frequency?typeKeys[rd.scheduler.frequency]:'')+'" >'+window.getMessageForKey(rd.scheduler.frequency?typeKeys[rd.scheduler.frequency]:'-')+'</span>';
		}
		return '<div><div class="text-muted mb5">'+window.getMessageForKey("schedule.type")+'</div><div class="text-overflow">'+window.getMessageForKey(rd.scheduler.frequency?typeKeys[rd.scheduler.frequency]:'-')+'</div></div>';
	},
	constructNextScheduleCell: function(table_data){
		var rd = table_data.row_data;
		if($maintenanceList.current_view_mode == "table"){
			return '<span rel="uitip" mode_ellipsis="true" title="'+(rd.scheduler.next_schedule_time?rd.scheduler.next_schedule_time:'-')+'" >'+(rd.scheduler.next_schedule_time?rd.scheduler.next_schedule_time:'-')+'</span>';
		}
		return '<div><div class="text-muted mb5">'+window.getMessageForKey("custom.schedule.next.schedule")+'</div><div class="text-overflow">'+(rd.scheduler.next_schedule_time?rd.scheduler.next_schedule_time:'-')+'</div></div>';
	},
	constructMaintenanceStateCell : function(table_data){
		var rd = table_data.row_data;
		var states = {"0":window.getMessageForKey("state.suspended"),"1":window.getMessageForKey("sdp.contract.listViewI.active"),"2":window.getMessageForKey("sdp.admin.statusDef.complete")};
		if($maintenanceList.current_view_mode == "table"){
			return '<span rel="uitip" mode_ellipsis="true" title="'+states[rd.maintenancestate]+'" >'+states[rd.maintenancestate]+'</span>';
		}
		return '<div><div class="text-muted mb5">'+window.getMessageForKey("sdp.inventory.detailAsset.state")+'</div><div class="text-overflow">'+states[rd.maintenancestate]+'</div></div>';
	},
    constructSite : function(table_data){
        var rd = table_data.row_data;
		var site = rd.site? e_html(rd.site.name) : getMessageForKey("sdp.admin.technician.addtechnician.nosite"); // No I18N
		var col_str;
		if($maintenanceList.current_view_mode == "table"){
			col_str='<span rel="uitip" mode_ellipsis="true" title="'+e_attr(rd.site? rd.site.name:getMessageForKey("sdp.admin.technician.addtechnician.nosite"))+'" >'+site+'</span>';
		}
		else{
			col_str='<div class="pt5 pb5 "><span class="sspr icon-xs pin vtop mr5"></span>'+site+'</div>';
		}
        return col_str;
    },
	switchMaintenanceView : function(view_mode) {
        var current_view = {};
		var _self=this;
		var viewKey = "request_maintenances_currentview"; // No I18N
		if(_self.isGlobalSearch){
			viewKey="global_"+viewKey; // No I18N
		}
        if(sdp_user.CLIENT_CONF[viewKey]){
            current_view = Object.assign({}, sdp_user.CLIENT_CONF[viewKey]);
        }
        var view,viewMode;
        if(view_mode == "classic"){ // No I18N
            viewMode = "linear"; // No I18N
			view="kanban"; // No I18N
            current_view.view = 'classic'; // No I18N
        }
        else if(view_mode == "table"){ // No I18N
            viewMode = "table"; // No I18N
			view="table"; // No I18N
            current_view.view = "table"; // No I18N
        }
        addPersonalization(viewKey,current_view);
        $maintenanceList.loadTemplate(view,viewMode);
    },
	handleRequestTypeFilter : function (request_type) {
		var filterHtml = {
            'all':'<span class="req-sprite all-req-icon2-off icon-lg ml10"></span>',
            'incident':'<span class="req-sprite incident-req-icon2-off icon-lg ml5 mt-5" style="width: 32px;height: 32px"></span>',
            'service':'<span class="req-sprite service-req-icon2-off icon-lg ml5 mt-5" style="width: 32px;height: 32px"></span>'
        };
        jQuery('[data-id="showFilterIcon"]').html(filterHtml[request_type]);
		var attributes=["all_quick_filter","incident_quick_filter","service_quick_filter"]; // No I18N
		attributes.splice(attributes.indexOf(request_type+"_quick_filter"),1);
		jQuery('[data-name="'+attributes[0]+'"]').addClass("hide").prev("em").removeClass("hide"); // No I18N
		jQuery('[data-name="'+attributes[1]+'"]').addClass("hide").prev("em").removeClass("hide"); // No I18N
		jQuery('[data-name="'+request_type+'_quick_filter"]').removeClass("hide").prev("em").addClass("hide"); // No I18N
		var filterPersonlize = {};
		var _self=this;
		var viewKey = "request_maintenances_filterview"; // No I18N
		if(_self.isGlobalSearch){
			viewKey="global_"+viewKey; // No I18N
		}
		filterPersonlize.quick_filter=request_type;
		filterPersonlize.list_view_filter={"id":$maintenanceList.list_view_filter_id,"name":$maintenanceList.list_view_filter_name}; // No I18N
		_self.quick_filter=request_type;
		addPersonalization(viewKey,filterPersonlize);
		var tablecomp = WebComponents.getInstance("webc-request_maintenances"); //NO I18N
		var listInfoObj = tablecomp.t_obj.table_info.list_info;
		this.clearSearchFromView();
		listInfoObj.search_criteria = $maintenanceList.getSearchCriteria(true);
		// Refresh table
		tablecomp.refreshTable();
	},
	showSuspendResumePopup : function(operation,id)
	{
		if(operation=="resume"&&!$maintenance.resumeConfirmPopup.isResumeAllowed($maintenanceList.table_comp_maintenance.loadedRecords[id].scheduler,id)){
			$maintenance.resumeConfirmPopup.showReschedulePopup();
			return ;
		}
		var titleKeys= {"suspend": window.getMessageForKey("any.maintenance",[window.getMessageForKey("suspend.operation")]),"resume":window.getMessageForKey("any.maintenance",[window.getMessageForKey("admin.optood.resume.migration")])}; // No I18N
		var footerKeys= {"suspend":window.getMessageForKey("suspend.operation"),"resume":window.getMessageForKey("admin.optood.resume.migration")}; // No I18N
		var htmlDiv = '<div id="suspendedHTMLlist" class="">'+
						'<div class="form-horizontal">'+
							'<div class="p15">'+
								'<label for="suspendedTxt" class="">'+window.getMessageForKey("sdp.common.comments")+'</label>'+ // No I18N
								'<textarea  maxlength="250"   name="comments" id="suspendedTxt" rows="6" class="form-control resize-vertical"></textarea>'+
							'</div>'+
							'<div class="form-footer">'+
								'<button type="button" class="btn btn-primary" id="suspendOrResumeMaintenance">'+footerKeys[operation]+'</button>'+ // No I18N
								'<button type="button" class="btn btn-default" id="closeSuspendResumeMaintenanceDialog">'+window.getMessageForKey("sdp.common.cancel")+'</button>'+ // No I18N
							'</div>'+
						'</div>'+
					'</div>';
		jQuery('#SuspendResumecontainer').dialog({
			title:titleKeys[operation],
			autoOpen : false,
			modal : true,
			width : "500px", // No I18N
			resize : false,
			open: () => {
				jQuery("#suspendOrResumeMaintenance").off('click').on('click', (event) => {
                     $maintenanceList.SuspendOrResume(operation,id);
                 });
				 jQuery("#closeSuspendResumeMaintenanceDialog").off('click').on('click', (event) => {               // No I18N
                     jQuery("#SuspendResumecontainer").dialog('close');
                 });
			},
			close: function(event,ui){
				jQuery('#suspendedHTMLlist').remove();
				jQuery('#SuspendResumecontainer').dialog("destroy"); // No I18N
			}
		}).html(htmlDiv).dialog("open"); // No I18N
	},
	SuspendOrResume : function (operation,id){
		var operations={"suspend":"suspend","resume":"enable"}; // No I18N
		var messages = {"suspend":window.getMessageForKey("maintenance.suspended"),"resume":window.getMessageForKey("maintenance.enabled")}; // No I18N
		var input_data= {"comments":jQuery('#suspendedTxt').val()}; // No I18N
		sdpAjax({
			url: '/api/v3/request_maintenances/'+id+'/_'+operations[operation], // No I18N
			type: 'PUT', // No I18N
			data:sdpAjaxInputData(input_data),
            success: function (response) {
				window.showalert('success',messages[operation],'isAutoHide=true'); // No I18N
				jQuery('#SuspendResumecontainer').dialog('close'); // No I18N
				$maintenanceList.table_comp_maintenance.refreshTable();
            }
        });
	},
	generateRequestConfirm:function(id){
		this.maintenanceid_to_generate_request=id;
		$maintenance.generateRequestConfirm($maintenanceList.generateRequest);
	},
	generateRequest : function(canGenerate) {
		if(canGenerate){
			sdpAjax({
				url: '/api/v3/request_maintenances/'+$maintenanceList.maintenanceid_to_generate_request+'/_generate_request', // No I18N
				type: 'POST', // No I18N
				success: function (response) {
					var message='';
					if(response&&response.response_status&&response.response_status.messages&&response.response_status.messages[0]){
						message=response.response_status.messages[0].message;
					}
					window.showalert('success',e_html(message),'isAutoHide=true'); // No I18N
				},
				error: function(response){
					var message=translate('sdp.common.failed');
					try{
					if(response&&response.responseJSON&&response.responseJSON.response_status&&response.responseJSON.response_status.messages&&response.responseJSON.response_status.messages[0]){
						if(response.responseJSON.response_status.messages[0].message&&response.responseJSON.response_status.messages[0].message.message){
							message=response.responseJSON.response_status.messages[0].message.message;
							var fieldN=response.responseJSON.response_status.messages[0].message.field;
							if(fieldN){
								var fieldName=fieldN;
								if(response.responseJSON.response_status.messages[0].message&&response.responseJSON.response_status.messages[0].message.message){
									fieldName=$maintenanceList.fieldsMetaInfo[fieldName].display_name;
								}
								else if($maintenanceList.fieldsMetaInfo&&$maintenanceList.fieldsMetaInfo.udf_fields&&$maintenanceList.fieldsMetaInfo.udf_fields.fields&&$maintenanceList.fieldsMetaInfo.udf_fields.fields[fieldName]){
									fieldName=$maintenanceList.fieldsMetaInfo.udf_fields.fields[fieldName].display_name;
								}
								message=message+" : "+fieldName;
							}
						}
						else{
							message=response.responseJSON.response_status.messages[0].message;
						}
					}
					}
					catch(e){}
					window.showalert('failure',e_html(message),'isAutoHide=true'); // No I18N				
				}	
			});	
		}		
	},	
	clearSearchFromView: function(){
		if(this.current_view_mode=="table"){
			$maintenanceList.table_comp_maintenance.changeFilterString("clearOnly"); // No I18N
		}
		else{
			viewFilterComponent.resetFilter();
		}
	},
    setHeight : function(){
        var height;
        var listview_height;
        if(this.current_view_mode == "linear"){ // No I18N
            listview_height = 64;
        }
        else{
            listview_height = 110;
        }
        var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
        jQuery('#header-placeholder').length == 0 ? height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height - 80) : height = (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - listview_height);//No I18N
        var info_banner_height = jQuery("#maintenance-static-msg-panel").is(":visible") ? jQuery("#maintenance-static-msg-panel").height() : 0; //No I18N
		height=height-info_banner_height;
		return height-15;
     },
     setWidth : function(){
        return jQuery('#Right-Section').width(); // No I18N
     }
};
