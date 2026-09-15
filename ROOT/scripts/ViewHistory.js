/* $Id$ */
var $historyvar = {
	noHistory : true,
	filter_values : [],
	sort : 'asc', //No i18N 
	historyJSON : '',
	previous_date : "",
	isPanel : false,
	entity:"",
	entityID:0,
	key:"",
	enableSortOnly:false,
	options: {},
	historyRecords : {},
	/**
	 * This array is used to avoid sending multiple meta calls
	 */
	meta_data : [],
	/**
	 * Indicates whether there is an error related to meta information
	 */
	has_meta_error : false
};
//Function for change the sorting order
var $history = {
	sort_order : function(){
	if($historyvar.sort === 'asc') {
		$historyvar.sort = 'desc';	//No I18N
	} else {
		$historyvar.sort = 'asc';//No i18N
	}
	ClientUtil.addUserPersonalization("history_sort", {"sort_order": $historyvar.sort}, {internalKey: $historyvar.key}) //No I18N
    .then((response) => {
        $historyvar.historyJSON.sort_order = $historyvar.sort;
		if(!$historyvar.historyJSON.list_info || !$historyvar.historyJSON.list_info.has_more_rows 
			&& ( !$historyvar.historyJSON.list_info.start_index || $historyvar.historyJSON.list_info.start_index == 1) ) {
			/**
			 * This check is to verify whether the "history" object is available in the "historyJSON" or not.
			 */
			if($historyvar.historyJSON.history){
				$historyvar.historyJSON.history.reverse();
			}
			$history.update_history();
		} else {
			if($historyvar.options) {
				$historyvar.options.rerender = true;
				$historyvar.options.sort = $historyvar.sort;
			}
			$history.initializingHistory($historyvar.options, false, true);
		}
		$history.tooltipforSortIcon($historyvar.sort);
    });
},
/**
 * Function to set filter options
 * @param {Object} options optional parameters
 */
setOptions: function(options){
	var input_data = {"for":"history_filter"};//No I18N
	sdpAjax({
		url: options.optionsUrl,
		method: "GET",//No I18N
		data: sdpAjaxInputData(input_data),
		success: function(response){
			var obj = {
			"text": translate("sdp.requests.fieldFormRules.listview.fields"),//No I18N
				"children":[]//No I18N
			};
			jQuery.each(response.metainfo.fields,function(field,value){
				if(value.display_name && !(options.skipFields && options.skipFields.indexOf(field) != -1)){
					if(options.fields_mapping){ //In change module, metainfo fields do not match the columnname in historydiff table, so fields_mapping is introduced to map metainfo fields to their respective columnnames.
						field = options.fields_mapping[field];
					}
					var temp = {"id":field,"text":value.display_name,"value":"field"};//No I18N
					obj.children.push(temp);
				}
				else if(value.type === "udf" && options.entity === "changes"){ //To add udf_fields in change history filter
					jQuery.each(value.fields,function(udf_field, udf_value){
						var temp = {"id":udf_value.fafr_key, "text":udf_value.display_key, "value":"field"};//No I18N
						obj.children.push(temp);
					})
				}
			})
			obj.children.sort(function(item1, item2) {
				return item1.text > item2.text ? 1 : -1;
			});
			options.filterFields.push(obj);
		}
	});
},
//Function for initializing the historyJSON with the data(JSON Object) return by the ajax call and replace all the json values in handlebars
initializingHistory : function(options,loadmore, maintainFilter){
	$historyvar.entity = options.entity;
	$historyvar.sub_entity = options.sub_entity ? options.sub_entity : "";
	$historyvar.entityID = options.entityID;
	$historyvar.key = options.key;
	$historyvar.sort = options.sort;
	$history.enableSortOnly = options.enableSortOnly;
	$historyvar.url = options.url;
	$historyvar.filterPlaceHolder = options.filterPlaceHolder;
	$historyvar.sort === "A" && ( $historyvar.sort = "asc" );	//No I18N
	$historyvar.sort === "D" && ( $historyvar.sort = "desc" );	//No I18N
	if(options.key && !options.rerender){
		var personalizeData = sdp_user.CLIENT_CONF[options.key] || {};
		if(Object.keys(personalizeData).length==0) {
			$historyvar.sort = 'desc';//No i18N
		} else{
			$historyvar.sort = personalizeData.sort_order;
			$historyvar.sort === "A" && ( $historyvar.sort = "asc" );	//No I18N
			$historyvar.sort === "D" && ( $historyvar.sort = "desc" );	//No I18N
		}
	}
	var historyurl='';
	var start_index = loadmore ? options.start_index : 1;
	zcomponent.collapsible_destroy('#'+$historyvar.entity+'-history');
	/**
	 * To check whether the module's historyurl is present in urlConfigs
	 */
	var getURL = $history.URLConstruction(start_index, "history_url", false); //No I18N
	var data;
	if(!jQuery.isEmptyObject(getURL) && getURL.url){
		historyurl = getURL.url;
		getURL.input_data ? data = getURL.input_data : "";
		if($historyvar.options.parentId){
            data.list_info.search_criteria = [{"field": "parentid","condition": "is","value":$historyvar.options.parentId}];       //No I18N
        }
	}
	else{
		if(options.admin_entity){
			data =  {"list_info": {"sort_order": $historyvar.sort, "sort_field": "time", "start_index": start_index, "row_count": 100}}; //No i18N
			historyurl = "/api/v3/"+options.entity+"/_history"; //No I18N
		} else if(options.entity=='checklists' || options.entity == 'tour_details'){ //No i18N
			data = {"list_info":{"sort_order":(($historyvar.sort=='A' || $historyvar.sort=='asc')?"asc":"desc"),"sort_field":"time","row_count":100, "start_index": start_index}}; //No I18N
			historyurl = '/api/v3/'+options.entity+'/'+options.entityID+'/_history'; //No i18N
		} else if(options.isAdmin) {
			data = { "list_info": { "search_criteria": { "field": "entity", "condition": "is", "value": options.entity }, "sort_order": $historyvar.sort, "sort_field": "id", "start_index": start_index, "row_count": 100 } }; //No I18N
			historyurl = "/api/v3/admin/_history"; //No i18N
		} else if(options.entity === "requests") {	//No I18N
			historyurl = "/api/v3/" + options.entity + "/" + options.entityID + "/history?input_data={\"list_info\":{\"sort_order\":\"" + $historyvar.sort + "\",\"sort_field\":\"id\", \"start_index\": " + start_index + "}}"; //No I18N
		} else if (options.entity === "asset_replenishments") { //No i18N
			data = {"list_info":{"sort_order": $historyvar.sort, "sort_field":"id", "start_index": start_index, "row_count": "100"}}; //No I18N
		    // Adding Account ID in the input data, to get account specific details for SDP MSP.
		    if(isMSP)
            {
				data = {"list_info":{"sort_order": $historyvar.sort, "sort_field":"id", "start_index": start_index, "row_count": "100", "account_id": getAccountId()}}; //No I18N
            }
            historyurl = '/api/v3/asset_replenishments/_history'; //No i18N
		} else if(options.entity === "spaces"){ //No I18N
			data = { "list_info": { "sort_order": $historyvar.sort, "sort_field": "id", "start_index": start_index } }; //No I18N
			historyurl = "/api/v3/" + options.entity + "/" + options.sub_entity + "/" + options.entityID + "/history"; //No I18N
		}else if(options.entity === "fonts"){ //No I18N
			data = { "list_info": { "sort_order": $historyvar.sort, "sort_field": "id", "row_count": 100, "start_index": start_index } }; //No I18N
         	historyurl = "/api/v3/fonts/_history"; //No I18N
		}else if(options.entity === "asset_bookings"){//No I18N
			data = {"list_info":{"sort_order":"desc","sort_field":"time", "start_index": 1,"row_count": 100}}; //No I18N
			historyurl = "/api/v3/asset_bookings/"+options.entityID+"/_history";//No I18N
		}else if(options.entity === "asset_booking_settings"){//No I18N
			data = { "list_info": { "sort_order": $historyvar.sort, "sort_field": "time", "start_index": start_index, "search_criteria": [ { "field": "entity", "condition": "in", "values": ["booking_purpose"], "logical_operator": "and", "children": [ { "field": "operation", "condition": "like", "value": "add", "logical_operator": "and" } ] }, { "field": "entity", "condition": "in", "values": ["asset_booking_setting", "booking_field", "booking_purpose", "asset_booking_status"], "logical_operator": "or", "children": [ { "field": "operation", "condition": "like", "value": "edit", "logical_operator": "and" } ] } ] } }; //No I18N
			historyurl = "/api/v3/admin/_history"; //No I18N
		} else{
			if($historyvar.url){
				historyurl = $historyvar.url + "&sort_order=" + $historyvar.sort; //No I18N
			}else{
				historyurl = "/api/v3/" + options.entity + "/" + options.entityID + "/_history"; //No I18N
				data = { "list_info": { "sort_order": $historyvar.sort, "sort_field": "id", "start_index": start_index, "row_count": 100 } }; //No I18N
			}
		}
	}
	if (data) {
		if (maintainFilter) {
			if (options.enableFilter && $historyvar.options.operations_mapping) {
				data = $history.constructListInfo($historyvar.options.operations_mapping, data);
			} else if (options.enableFilter) {
				data = $history.constructListInfo({}, data);
			}
	
			if (options.is_date_filter) {
				data = this.filterByDate(data);
			}
	
			if (options.admin_entity || options.is_new_filter) {
				$history.getSelectedFilterData(data);
			}
		}
		data = sdpAjaxInputData(data);
	} else {
		data = {};
	}
		
	sdpAjax({
		url: encodeURI(historyurl),	//No i18N
		data : data,
		async: false,
		cache: false,
		ignorefailuremessage:true,
		acceptODCompatible: ($historyvar.options.acceptODCompatible) ? true : false,
		success: function(data) {
		/***
			 * If the entity is color settings
			 */
			var list_info = data.list_info;
			if(typeof $historyvar.options.processHistory === 'function' && Array.isArray(data.history)) {
				data.history = $historyvar.options.processHistory(data.history);
			}
			else if (options.entity === "color_settings" && data.history) {
				var res = {};
				res.history = colorSettings.processHistory(data,$historyvar.sort);
				data = res;
			} else if (options.entity === "saml_auth" && data.history) {	//No I18N
				$historyvar.fields = data.fields;
				var historyArr = [];
				historyArr.history = samlActions.processHistory(data, $historyvar.sort);
				data = historyArr;
			} else if(options.entity === "global_personalization") {	//No I18N
				data.sort_order = $historyvar.sort;	//No I18N
				if(options.key == 'themes') {
					themes.processHistory(data.history);
				}
				else if(options.key == 'browserTitle') {
					browserTitle.processHistory(data.history);
				}
				else if(options.key == 'organize_tab') {
					headerTabManager.processHistory(data.history);
				} else if(options.key == 'rta_config') {//No I18N
					rtaconfigTab.processHistory(data.history);
				} else if(options.key == 'landing_page') {//No I18N
					$landing_page.processHistory(data.history);
				} else {
					$wolayout.processHistory(data);
				}
				
			}
			else if(options.entity == 'tfa') {
				tfa.processHistory(data.history);
			} 
			else if(options.entity == 'asset_bookings') {
				$historyvar.fields = "desc";//No I18N
				$asset_booking_details.processHistory(data.history);
			}
			else if(options.entity == 'asset_booking_settings') {
				$historyvar.fields = "desc";//No I18N
				$asset_booking_settings.processHistory(data.history);
			}
			else if ((options.entity === "ziaconfigurations" || options.entity === "zia-bot") && data.history) {	//No I18N
					var res = {};
					res.history = zipssp.processHistory(data,$historyvar.sort);
					data = res;
			} else if (options.entity === "workflows" && data.history){ //No I18N
					var wf_resp = {};
					wf_resp.history = WorkflowEditorInstance.getInstance().processHistory(data.history);
					data = wf_resp;
			} else if(options.entity === "asset_replenishments"){ //No I18N
				$history.processHistory(data.history, false);
            }
			else if(options.entity === "asset_assets"){//No I18N
				assetDetailView.processHistory(options,data);
			}
			else if (options.entity === "fonts" && data.history) { //No I18N
				var res = {};
				res.history = themes.fontHistoryRenderData(data,$historyvar.sort);
				data = res;
			} else if(options.entity === 'udf_fields') { //No I18N
				$udfcommon.$udflview.processHistory(data.history);
			} else if(options.entity === 'worklog_templates') { //No I18N
			    $templateHelper.processHistory(data.history);
            } else {
            	$history.processHistory(data.history, true,loadmore);
            }
			data.options = options;
			data.list_info = list_info || {};
			data.list_info.start_index = data.list_info.start_index || 1;
			$historyvar.historyJSON = data;
			$historyvar.historyJSON.entity = $historyvar.entity;
			$historyvar.historyJSON.sortonly = $history.enableSortOnly;
			for(i=0;i<data.history.length;i++) { 
				if(data.history[i].operation=='MOVED') { 
					var previous_value = JSON.parse(data.history[i].diff[0].previous_value); 
					previous_value.portal_name = e_html(previous_value.portal_name);
					data.history[i].diff[0].previous_value = previous_value;
				} 
			}
			$historyvar.loaded_count = options.loading_more && $historyvar.loaded_count ? ( $historyvar.loaded_count + data.history.length ) : data.history.length;


			if(options.entity=='checklists')
			{
				var minheight=(jQuery(window).height()-250)+"px"; //No I18N
				jQuery('#historyTabContent').css('min-height',minheight); //No I18N
			}			
			jQuery('#' + options.entity + '-history .panel-group-history:first .load-more-history').remove();	//No I18N
			
			if(data && data.history && data.history.length > 0){
				$historyvar.noHistory=false;
			}
			data.system_userid = sdp_user.SYSTEM_USERID ? sdp_user.SYSTEM_USERID.toString() : '';
			$history.setRole(data, "SDOrgAdmin"); //No I18N
			if(checkIfMSP()){
				// ['isMSP'] is better written in dot notation. (Rule:dot-notation)
				data.isMSP=true;
			}
			renderhbs('#' + options.entity + '-history .panel-group-history:first',"history-component",data, (start_index > 1),"components", false, false, function(){ //No I18N
				/**
				 * Initialize the 'Show More' functionality
				 */
				$history.initalizeShowMore();
			});
		},
		error: function() {

			jQuery('#' + options.entity + '-history .panel-group-history:first').html('<div class="history-time">'+translate("ae.common.select2norecordsfound")+'</div>'); //NO I18N
		}
	});
	$history.tooltipforSortIcon($historyvar.sort);
	$historyvar.options.rerender = false;
	$historyvar.options.loading_more = false;
	$historyvar.options.start_index = undefined;
	$historyvar.previous_date = "";
	$historyvar.noHistory = true;
	if(!maintainFilter){
		$history.initDate(options);
	}
	initTooltip('#history_content_div');        //No I18N
	zcomponent.collapsible_init('#'+$historyvar.options.entity+'-history'); //No I18N
},

/**
 * This is the common function for set the role.
 * @param {object} data
 * @param {string} roleName
 */
setRole : function(data, roleName){
	data["is_"+roleName] = sdp_user.ROLES.indexOf(roleName) !== -1;
},

/**
 * Initializing the date
 */
initDate : function(options){
	/**
	 * The is_date_filter variable is to check whether filter by date is enabled or not.
	 */
	if(options.is_date_filter){
		/** 
		 * Select the first div element with the ID "history_filter_date" within the context of the element 
		 * with the dynamically generated ID "history_main_container_" + options.entity.
		 */
		const mainContainer = jQuery('div#history_filter_date', "#history_main_container_" + options.entity)[0];
		/** 
		 * Create an options object for configuring the history time filter. 
		 * - `holder`: Specifies a container div to render the time filter.
		 * - `for`: Indicates that the time filter is intended for the "history" section.
		 */
		const tf_options = {
			holder: mainContainer,
			for: 'history' //No I18N
		};
		/** 
		 * Initialize the history time filter using the provided options.
		 */
		timeFilter(tf_options);
		/** 
		 * Attach an event handler to the mainContainer for the 'timeFilterChange.history' event.
		 * This handler invokes $history.dateProcess(options) when the time filter changes.
		 */
		jQuery(mainContainer).off('timeFilterChange.history').on('timeFilterChange.history', function(){ //No I18N
			$history.dateProcess(options);
		});
	}
},
/**
 * Constructing the list info for date.
 */
dateProcess : function(options){
	var getURL = $history.URLConstruction(false, "history_url", true); //No I18N
	var inputData = (getURL.input_data) ? getURL.input_data : $historyvar.options.operations_mapping ? $history.constructListInfo($historyvar.options.operations_mapping) : $history.constructListInfo();
	inputData = $history.filterByDate(inputData);
	(options.admin_entity || options.is_new_filter) ? $history.getSelectedFilterData(inputData) : "";
	$history.filterCall({}, getURL.url, inputData);
},

loadMore: function() {
	var options = $historyvar.options;
	options.start_index = $historyvar.loaded_count + 1;
	options.loading_more = true;
	var last_panel = jQuery('#' + $historyvar.entity + '-history .panel-group-history:first > .panel:last');	//No I18N
	jQuery('#' + options.entity + '-history .panel-group-history:first .load-more-history').removeAttr("onclick").removeClass("btn-link").text( translate("common.loading.btn") + " ..." );	//No I18N
	this.initializingHistory(options, true, true);

	/** comparing if the first date of the newly loaded history and last date of the already loaded history and merging both */
	if(last_panel.length > 0) {
		zcomponent.collapsible_destroy('#'+$historyvar.entity+'-history');
		setTimeout(function() {
			var next_panel = last_panel.next();
			var last_date = last_panel.find(".panel-heading > .panel-title").text();	//No I18N
			var next_date = next_panel.find(".panel-heading > .panel-title").text();	//No I18N
			if(last_date && next_date && last_date.trim() === next_date.trim()) {
				next_panel.find(".panel-body:first .row").appendTo(last_panel.find(".panel-body:first"));	//No I18N
        		next_panel.remove();
			}
			zcomponent.collapsible_init('#'+$historyvar.entity+'-history');
		}, 10);
	}
},

// Function for update the history when filter value changed
update_history : function(){
    zcomponent.collapsible_destroy('#'+$historyvar.entity+'-history');
	$historyvar.historyJSON.options = $historyvar.options;
	$historyvar.historyJSON.entity = $historyvar.entity;
	$historyvar.historyJSON.sortonly = $history.enableSortOnly;
	
	if(typeof $historyvar.options.processHistory === 'function' && Array.isArray($historyvar.historyJSON.history)) {
		$historyvar.historyJSON.history = $historyvar.options.processHistory($historyvar.historyJSON.history);
	}
	else {
		$history.processHistory($historyvar.historyJSON.history,true);
	}

	if($historyvar.historyJSON.history!=""){
		$historyvar.noHistory = false;
	}
	$history.setRole($historyvar.historyJSON, "SDOrgAdmin"); //No I18N
    renderhbs('#' + $historyvar.entity + '-history .panel-group-history:first',"history-component",$historyvar.historyJSON, false,"components", false, false, function(){ //No I18N
		/**
		 * Initialize the 'Show More' functionality
		 */
		$history.initalizeShowMore();
	});
	$historyvar.previous_date = "";
	$historyvar.noHistory = true;
	initTooltip('#history_content_div');//No I18N
	zcomponent.collapsible_init('#'+$historyvar.entity+'-history');
	$historyvar.loaded_count = $historyvar.historyJSON.history.length;
},


// Function for initializing Select2 values
/**
 * 
 * @param {Number} entityID Entity ID 
 * @param {String} entity Entity Name (Module Name)
 * @param {String} key  Personalization Key 
 */
initWOHistory : function(inputs) {

	var _self = this;
	var options = {
		entity : "",
		sub_entity: "",
		entityID:"",
		key:"",
		enableFilter:true,
		enableSortOnly:false,
		sort:'asc'   // No I18N
	}
	options = jQuery.extend(options,inputs);
	$historyvar.options = options;
	//We are replacing the "+" with " " as the encoded value from construction of queryparam contains "+" even after decoding the value.
	$historyvar.options.search_filter = decodeURIComponent($historyvar.options.search_filter).replace("+"," ");
	if(options.setOptions){
		this.setOptions(options);
	}
	this.initializingHistory(options);
	if(options.enableFilter){
		/**
		 * Show the filter
		 */
		jQuery("#historyFilterMenu").closest("#history_filter_container").removeClass("hide");  //No i18N
		var data = [];
		if(options.entity=='checklists'){
			var checklist = translate("sdp.header.checklist"); //No i18N
			var checklistitem = translate("sdp.header.checklist_item"); //No i18N
			data = [{id: checklist, text: checklist},{id: checklistitem, text: checklistitem}];
		}
		else if($historyvar.fields){
			data = $historyvar.fields;
		}
		else if($historyvar.options.filterFields){
			data =  $historyvar.options.filterFields;
		}
		else{
			var status = translate("sdp.requests.common.status"); //No i18N
			var priority = translate("sdp.requests.common.priority"); //No i18N
			var level = translate("sdp.requests.common.level"); //No i18N
			var mode = translate("sdp.requests.common.mode"); //No i18N
			var impact = translate("sdp.problem.impact"); //No i18N
			var impactdetails = translate("sdp.problem.impactdetails"); //No i18N
			var urgency = translate("sdp.itil.common.urgency"); //No i18N
			var group = translate("sdp.requests.common.queue"); //No i18N
			var technician = translate("sdp.common.technician"); //No i18N
			var category = translate("sdp.requests.common.category"); //No i18N
			var subcategory = translate("sdp.common.subcategory"); //No i18N
			var item = translate("sdp.common.item"); //No i18N
			var servicecategory = translate("sdp.request.serviceaffected"); //No i18N
			var note = translate("sdp.common.note"); //No i18N
			var task = translate("sdp.header.newtask"); //No i18N
			var checklist = translate("sdp.header.checklist"); //No i18N
			var worklog = translate("sdp.requests.common.worklog"); //No i18N
			var solution = translate("sdp.header.newsolution"); //No i18N
			var resolution = translate("common.resolution"); //No i18N
			var asset = translate("sdp.header.newasset"); //No i18N
			var ci = translate("ae.cmdb.quicllicks.createnew.ci"); //No i18N
            var approval = translate("sdp.change.changedetails.approval"); //No i18N
			var sharerequest = translate("sdp.request.share.title"); //No i18N
			var externalaction = translate("external.action"); //No i18N
			var custommenu = translate("common.custom.menu"); //No i18N
			var requesttag = translate("sdp.header.tags"); //No i18N
			var denied = translate("request.history.operationdenied"); //No i18N
			var notificationaction = translate("notification.action"); //No I18N
			var smsnotificationaction = translate("notification.sms.action"); //No I18N
			var emailnotificationaction = translate("sdp.admin.security.settings.email.notification"); //No I18N
			var req = [translate("sdp.header.requests")]; //No i18N
			var moved = translate("request.move.moved"); //No i18N
			var requestedForCancel = translate("sdp.requesting.cancel");//No i18N
			var revokeRequestedCancel = translate("sdp.revoke.cancel");//No i18N
  			var timerAction = translate("timer.action"); //No i18N
			data = [{id: status, text: status},{id: priority, text: priority},{id: level, text: level},{id : mode, text: mode},{id: impact, text: impact},{id: impactdetails, text: impactdetails},{id: urgency, text: urgency},{id: group, text: group},{id: technician, text: technician},{id : category, text: category},{id : subcategory, text: subcategory},{id : item, text: item},{id : servicecategory, text: servicecategory},{id: asset, text: asset},{id: ci, text: ci},{id: note, text: note},{id: task, text: task},{id: worklog, text: worklog},{id: solution, text: solution},{id: resolution, text: resolution},{id: approval, text: approval},{id: sharerequest, text: sharerequest},{id: externalaction, text: externalaction},{id: custommenu, text: custommenu},{id: requesttag, text: requesttag},{id: notificationaction, text: notificationaction},{id: smsnotificationaction, text: smsnotificationaction},{id: emailnotificationaction, text: emailnotificationaction},{id: denied, text: denied},{id: checklist, text: checklist},{id: moved, text: moved},{id: requestedForCancel, text: requestedForCancel},{id: revokeRequestedCancel, text: revokeRequestedCancel},{id: timerAction, text: timerAction}];

			//Zoom history filter for scp and msp
			if (checkIfMSPOrSCP()) {
				if (true == $historyvar.isZoomConfigured) {
					var zoommeeting = translate("sdp.msp.zoom.meeting.id"); //No i18N
					data.push({ id: zoommeeting, text: zoommeeting });
				}
			}
		}
		if (checkIfMSPOrSCP()) {
			// to remove fields not applicable for SCP
			var indicesToDelete = [];
			var historyBlackList = []
			if (checkIfSCP()) {
				historyBlackList.push(translate("sdp.header.newasset"));
			}
			data.forEach(function(value, index) {
				if (historyBlackList.includes(value.id)) {
					indicesToDelete.push(index)
				}
			});
			var deletedCount = 0;
			indicesToDelete.forEach(function(indexToDelete) {
				var numberOfElementsDeleted = data.splice(indexToDelete - deletedCount, 1).length;
				deletedCount = deletedCount + numberOfElementsDeleted;
			});
		}
		if(options.entity=='releases'){
			var req = [translate("common.release")]; //No i18N
		}else if(options.entity=='problems'){
			var req = [translate("common.newproblem")]; //No i18N
		}

		jQuery("#historyFilterMenu").select2({
			multiple: true,
			data: data ,
			allowClear: true,
			placeholder: translate($historyvar.filterPlaceHolder ? $historyvar.filterPlaceHolder : "request.filterrequesthistory",req)
		});
		jQuery("#historyFilterMenu").on("change", function(data){
			var input_data = {}, url = "";
			if($historyvar.options.entity == "releases"|| $historyvar.options.entity=="problems"){
				url = "/api/v3/"+$historyvar.entity+"/"+$historyvar.entityID+"/_history";//No I18N
				input_data = _self.constructListInfo($historyvar.options.operations_mapping);
			}else if($historyvar.options.entity == "spaces"){//No I18N
				url = "/api/v3/"+$historyvar.entity+"/"+$historyvar.sub_entity+"/"+$historyvar.entityID+"/history";//No I18N
				input_data = _self.constructListInfo();
			} else if($historyvar.options.entity.startsWith('cm_')) {//No I18N
				url = '/api/v3/'+($historyvar.options.entity_key && $historyvar.options.entity_key != "null" ? $historyvar.options.entity_key : $historyvar.options.entity)+'/'+$historyvar.options.entityID+'/history';//No I18N
				input_data = _self.constructListInfo($historyvar.options.operations_mapping);
			}else if(options.is_new_history){
				var getURL = $history.URLConstruction(false, "history_url", true); //No I18N
				input_data = (getURL.input_data) ? getURL.input_data : $historyvar.options.operations_mapping ? $history.constructListInfo($historyvar.options.operations_mapping) : $history.constructListInfo();
				url = getURL.url;
			}
			if(options.is_date_filter){
				input_data = _self.filterByDate(input_data);
			}
			_self.filterCall(data, url, input_data);
		});
	}
	/**
	 * To add scroll shadow for history content
	 */
    jQuery('#history_content').on('scroll', function () {
		var scroll = jQuery(this).scrollTop();
		if (scroll > 0) {
			jQuery(this).prev().addClass("scroll-shadow");
		} else {
			jQuery(this).prev().removeClass("scroll-shadow");
		}
	});
	/**
	 * SD - 114442
	 * Root Cause: If the history component is opened using the preview component, we added a "history-dig" class to the main container. This problem only occurs in situations where the "Admin Audit" filter is not used.
	 * Fix : We have added full height "fh", If "Admin Audit" filter is not applied
	 */
	/**
	 * Select the element with the ID "history_content"
	 */
	const getHistoryContainer = jQuery("#history_content");
	/**
	 * Check if the selected element's parent has the class "history-dig"
	 */
	const isPreviewComponent = getHistoryContainer.parent().hasClass("history-dig"); //No I18N
	/**
	 * Array of modules to skip adding the class "fh"
	 */
	const skipModules = ["ziaconfigurations"];
	/**
	 * If it's a preview component, options.admin_entity is not truthy,
	 * and the current entity is in the skipModules array, add the class "fh" to the selected element
	 */
	(isPreviewComponent && !options.admin_entity && skipModules.indexOf(options.entity) === -1) && getHistoryContainer.addClass("fh"); //No I18N
},

/**
 * Show filter history based on operations and fields
 */
showFilterDialog : function(){
	var _self = this;
	var getPopup = jQuery("#dropdown_dialog_container").find("#filter_container");
	if(getPopup.length != 0){
		if(!getPopup.is(":visible") && !$historyvar.options.is_new_filter){
			this.clearSelectedDatas();
		}
		jQuery("#dropdown_dialog_container").removeClass("hide");
		return false;
	}
	var skipFilterOptions = $historyvar.options.skip_filter_options.split(",");
	var filterData = [
		{
			"id": "operationName",//No I18N
			"display_name": ($historyvar.options.is_new_filter) ? translate("common.history.operations") : translate("common.entity.name",[translate("sdp.admin.survey.operation")]),//No I18N
		},
		{
			"id": "performedBy",//No I18N
			"display_name": translate("sdp.requests.history.performedby"),//No I18N
		},
		{
			"id": "entity",//No I18N
			"display_name": $historyvar.options.entity_key,//No I18N
		}
	];
	if($historyvar.options.is_new_filter) {
		filterData = filterData.concat([
			{
				"id": "showOnly", //No I18N
				"display_name": translate("sdp.common.showonly"), //No I18N
			},
			{
				"id": "module_fields", //No I18N
				"display_name": translate("sdp.requests.fieldFormRules.listview.fields"), //No I18N
			}
		]);
    }
	(checkIfMSPOrSCP() && $historyvar.options.show_account_filter)?(filterData = filterData.concat([{"id": "accountFilter", "display_name": translate("sdp.msp.common.account")}])):"";//No I18N
	var filteredData = _self.skipOptions(filterData, skipFilterOptions);
	/**
	 * Determine the Handlebars template name based on conditions
	 */
	const templateName = $historyvar.options.admin_entity ? "admin-entity-filter" : $historyvar.options.is_new_filter ? "new-filter" : ""; //No I18N
	/**
	 * Determine the data to be passed to the Handlebars template
	 * If 'filteredData' exists, use it; otherwise, use 'filterData'
	 */
	const templateData = filteredData ? filteredData : filterData;
	/**
	 * Render an Handlebars template with the specified options and inject it into the element with ID 'dropdown_dialog_container'
	 */
	renderhbs("#dropdown_dialog_container", templateName, templateData, false, "history");//No I18N
	_self.setFilterData(skipFilterOptions);
	initTooltip('#filter_container');//No I18N
},

/**
 * This function is to set the options in the select2
 */
setFilterData: function(skipFilterOptions){
	/**
	 * Checking whether the operation name is present in skipFilterOptions and rendering the options in the select2
	 */
	if(skipFilterOptions.indexOf("operationName") == -1){
		this.setOperationData();
	}
	/**
	 * Performed by date select2 will be rendered by default, even if we have added it in the skip options.
	 */
	if(skipFilterOptions.indexOf("performedBy") == -1){
		this.setPerformedByData();
	}
    /**
     * Checking whether the entity is present in skipFilterOptions and rendering the options in the select2
     */
    if(skipFilterOptions.indexOf("entity") == -1){
        this.setEntityData();
    };

	if($historyvar.options.is_new_filter) {
	    if(skipFilterOptions.indexOf("showOnly") == -1){
	    	this.setShowOnlyData();
	    }

	    if(skipFilterOptions.indexOf("module_fields") == -1){
	    	this.setFieldsData();
	    }
	}

	checkIfMSPOrSCP() && $historyvar.options.show_account_filter && jQuery("#accountFilter").sdp_select2({cache:{}, multiple:true, allowClear: true, closeOnSelect: false, maximumSelectionSize:25, url:[{url:"/api/v3/projects/account", field:'account',list_info:{start_index:1,row_count:25}}]});//NO I18N

},

/**
 * Constructing operation data
 */
setOperationData: function(){
	var _self = this;
	var skipOperationNames = $historyvar.options.skip_operation_names.split(",");
	var operationNames = [
		{
			"text": translate("sdp.history.added"),//No I18N
			"id": "add",//No I18N
			"value": "operation"//No I18N
		},
		{
			"text": translate("sdp.requests.history.updated"),//No I18N
			"id": "edit",//No I18N
			"value": "operation"//No I18N
		},
		{
			"text": translate("sdp.itil.propview.deleted"),//No I18N
			"id": "delete",//No I18N
			"value": "operation"//No I18N
		}
	];
	var filteredData = _self.skipOptions(operationNames, skipOperationNames);
	if(filteredData.length==0){
		jQuery("#operationName").closest(".form-group").remove();//No I18N
	}
	this.renderSelect2("operationName", translate("sdp.change.sla.select"), "multiple", filteredData ? filteredData : operationNames, false);//No I18N
},

/**
 * Skip options based on given configuration data.
 * @param {array} data
 * @param {array} options
 * @returns
 */
skipOptions: function(data, options){
	var filteredData = [];
	jQuery.each(data, function(index, value){
		if(options && options.length!=0){
			if((options.indexOf(value.id) == -1)){
				filteredData.push(value);
			}
		}
		else{
			filteredData.push(value);
		}
	});
	return filteredData;
},

/**
 * Get performed by data and set into the select2
 */
setPerformedByData: function(){
	let performedByOptions = [], url = "", inputData;
	let getURL = $history.URLConstruction(false, "performed_by_url", false); //No I18N
	if(!jQuery.isEmptyObject(getURL) && getURL.url){
		url = getURL.url;
		getURL.input_data ? inputData = getURL.input_data : "";
	}else {
		url = "/api/v3/"+$historyvar.options.entity+"/_get_performed_by_for_history"; //No I18N
	}
	inputData = inputData ? sdpAjaxInputData(inputData) : {};
	// performed_by_input_data used for sdpSelelct2
    let obj = $history.URLConstruction(false, "performed_by_input_data", false).url; //No I18N
	if(obj){
        let listInfo = {"sort_order": obj.sort_order, "sort_field": obj.sort_field, "start_index": 1,"row_count":obj.row_count};  //No I18N
        if(obj.fields_required) {
            listInfo.fields_required = obj.fields_required;
        }
        var select2Options = {
            cache:{}, multiple:true, allowClear: true,closeOnSelect: false,maximumSelectionSize:obj.maximumSelection,
            url:[{
                url:url,
                field: obj.field ,
                list_info: listInfo,
                search_field: obj.search_field
            }],
            processResults: function(search_data, data, field) {
                search_data.push({
                    text: data[obj.valuePath] ? data[obj.valuePath].name || data.text : data.name || data.title || data.text,
                    id : data[obj.valuePath] ? data[obj.valuePath].id || data.id : data.id,
                });
            }
        }
        jQuery('#performedBy').sdp_select2(select2Options);
    }else{
        sdpAjax({
            method: "GET",//No I18N
            url: url,
            data: inputData,
            acceptODCompatible: ($historyvar.options.acceptODCompatible) ? true : false,
            async: false,
            success: function(response){
                jQuery.each(response.performed_by ,function(i, data){
                    var obj = {
                        "text": data.name,//No I18N
                        "id": data.id,//No I18N
                        "value": "by"//No I18N
                    };
                    performedByOptions.push(obj);
                })
            }
        });
        this.renderSelect2("performedBy", translate("sdp.change.sla.select"), "multiple", performedByOptions, false);//No I18N
    }
},

/**
 * Get entiry by data and set into the select2
 */
setEntityData: function(){
	let optionsObj = [], url = "", inputData;
	let getURL = $history.URLConstruction(false, "entity_url", false); //No I18N
	if(!jQuery.isEmptyObject(getURL) && getURL.url){
		url = getURL.url;
		getURL.input_data ? inputData = getURL.input_data : "";
	}else{
		url = "/api/v3/"+$historyvar.options.entity+"/_get_records_for_history";//No I18N
	}
	inputData = inputData ? sdpAjaxInputData(inputData) : {};
	// entity_input_data used for sdpSelect2
    let obj = $history.URLConstruction(false, "entity_input_data", false).url;  //No I18N
	if(obj){
	    let listInfo = {"sort_order": obj.sort_order, "sort_field": obj.sort_field, "start_index": 1,"row_count":obj.row_count};  //No I18N
        if(obj.fields_required) {
            listInfo.fields_required = obj.fields_required;
        }
        var select2Options = {
            cache:{}, multiple:true, allowClear: true,closeOnSelect: false,maximumSelectionSize:obj.maximumSelection,
            url:[{
                url:url,
                field: obj.field || records_for_history,
                list_info: listInfo,
                search_field: obj.search_field
            }],
            processResults: function(search_data, data, field) {
                search_data.push({
                    text: (data.name)?"#"+data.id+" "+data.name:(data.title)?"#"+data.id+" "+data.title:data.text,
                    id :  data.id,
                });
            }
        }
        jQuery('#entity').sdp_select2(select2Options);
    }else{
		/**
		 * Customizing the label displayed in the dropdown menu for the admin entity's filter.
		 * https://sdpissues.servicedeskplus.com/ui/tasks?mode=detail&from=showAllTasks&module=project&taskId=120371&moduleId=1313
		 */
		const dropdownLabel =
		/**
		 * ae_filter maeans "admin entity filter"
		 * Check if $historyvar.options.ae_filter is truthy
		 */
		($historyvar.options.ae_filter &&
		/**
		 * If truthy, access $historyvar.options.ae_filter.entity.dropdownLabel
		 */
		$historyvar.options.ae_filter.entity.dropdownLabel) ||
		/**
		 * If falsy, use the translation for "common.active.and.inactive"
		 */
		translate("common.active.and.inactive"); //No I18N

        sdpAjax({
            method: "GET",//No I18N
            url: url,
            data: inputData,
            acceptODCompatible: ($historyvar.options.acceptODCompatible) ? true : false,
            async: false,
            success: function(response){
                var active = {
                    "text": dropdownLabel,//No I18N
                    "children": []//No I18N
                };
                var inactive = {
                    "text": translate("sdp.itil.propview.deleted"),//No I18N
                    "children": []//No I18N
                };
				/**
				 * Get meta information
				 */
				const getMetaInfo = $history.getMetaInfo();
				/**
				 * SD - 105308
				 * To check if the inactive option is present in entities.
				 */
				const inactiveKeys = ["deleted", "inactive", "active", "is_active"]; //No I18N
				const metaFieldsKeys = Object.keys(getMetaInfo);
				/**
				 * Check if any inactive keys exists in metaFieldsKeys
				 */
				const isInactive = inactiveKeys.some(field => metaFieldsKeys.includes(field));
                jQuery.each(response.records_for_history, function(i, data){
                    var obj = {
                        "text": data.name || data.title || data.api_plural_name || data.status,//No I18N
                        "id": data.id,//No I18N
                    };
                    if(data.hasOwnProperty("deleted")){
                        data.deleted ? inactive.children.push(obj) : active.children.push(obj);
                    }
                    else{
                        optionsObj.push(obj);
                    }
                });

                if (active.children.length > 0) {
					if (isInactive) {
						optionsObj.push(active);
					} else {
						/**
						 *  Spread operator for merging arrays
						 */
						optionsObj.push(...active.children);
					}
				}
                if(inactive.children.length > 0){
                    optionsObj.push(inactive);
                }
            }
        });
        this.renderSelect2("entity", translate("sdp.change.sla.select"), "multiple", optionsObj, false);//No I18N
    }
},
/**
 * Get fields by data and set into the select2
 */
setFieldsData: function(){
	let fieldsOptions = [], url = "", inputData;
	let getURL = $history.URLConstruction(false, "fields_url", false); //No I18N
	if(!jQuery.isEmptyObject(getURL) && getURL.url) {
		url = getURL.url;
		inputData = getURL.field_input_data ? getURL.field_input_data : {"for" : "history"};    //No I18N
		inputData = inputData ? sdpAjaxInputData(inputData) : {};
		sdpAjax({
	        method: "GET",//No I18N
	        url: url,
			data: inputData,
			acceptODCompatible: ($historyvar.options.acceptODCompatible) ? true : false,
	        async: false,
	        success: function(response){
	            jQuery.each(response.metainfo.fields, function(i, data){
	                if(i.indexOf("udf") == 0) {
	                	jQuery.each(data.fields, function(j, field){
	                		var obj = {
			                    "text": field.display_name || text.display_name,//No I18N
			                    "id": j,//No I18N
			                    "value":"field" //No I18N
			                };
			                fieldsOptions.push(obj);
	                	});
	                }else{
	                	var obj = {
		                    "text": data.display_name || text.display_name,//No I18N
		                    "id": i,//No I18N
		                    "value":"field" //No I18N
		                };
	                	fieldsOptions.push(obj);
	                }
	            });
	        }
    	});
	}
	fieldsOptions.sort(function(a, b) {
	    var textA = a.text.toUpperCase();
	    var textB = b.text.toUpperCase();
	    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
	});
	$history.renderSelect2("module_fields", translate("sdp.change.sla.select"), "multiple", fieldsOptions, false);//No I18N
},
/**
 * Get showonly by data and set into the select2
 */
setShowOnlyData : function(){
    $history.renderSelect2("showOnly", translate("sdp.change.sla.select"), "multiple", $historyvar.options.showOnlyData, false);//No I18N
},
/**
 * Clear selected select2 datas when clicking on remove icon.
 */
clearSelectedDatas : function(){
	jQuery("#operationName, #performedBy, #entity").select2("val", ""); //No I18N
	checkIfMSPOrSCP() && $historyvar.options.show_account_filter && jQuery("#accountFilter").select2("val", ""); //No I18N
	if($historyvar.options.is_new_filter){
		 zcomponent.collapsible_destroy('#'+$historyvar.entity+'-history');
		jQuery("#showOnly, #module_fields").select2("val", ""); //No I18N
		$historyvar.operationValues = []; $historyvar.performedByValues = []; $historyvar.entityValues = []; $historyvar.showOnlyValues = []; $historyvar.fieldsValues = [];
        $history.initializingHistory($historyvar.options, false, true);
    }
},

/**
 * Initialize select2
 * @param {string} select2Id
 * @param {string} placeHolder
 * @param {boolean} isMultiple
 * @param {object} select2Data
 * @param {boolean} isCloseOnSelect
 */
renderSelect2: function(select2Id, placeHolder, isMultiple, select2Data, isCloseOnSelect){
	jQuery("#"+select2Id).select2({
		placeholder: placeHolder,
		multiple: isMultiple,
		data: select2Data,
		closeOnSelect: isCloseOnSelect
	});
	jQuery("#"+select2Id).prev().find(".select2-choices").prop("style", "max-height: 65px!important; overflow-y: auto;");   //NO I18N
},

constructListInfo: function(operations, inputData){
	var isField="";
	var isOperation="";
	if(!operations){
		operations = {};
	}
	$historyvar.filter_values = $historyvar.options.enableFilter ? jQuery("#historyFilterMenu").select2('data') : []; //No I18N
	//constructing listinfo
	
	var input_data = inputData ? inputData : {
		"list_info":{ //No I18N
			"start_index": 1 ,"row_count":100,"sort_field":"time","sort_order": $historyvar.sort,//No I18N
			"search_criteria":[]//No I18N
		}
	};
	input_data.list_info.search_criteria = input_data.list_info.search_criteria || [];
	jQuery.each($historyvar.filter_values,function(j,data){
		isField = data.value == "field";//No I18N
		isOperation = data.value == "operation";//No I18N
		var criteria =  input_data.list_info.search_criteria;
		var isFieldExists = criteria.find(({field}) => field == "field");
		var isOperationExists = criteria.find(({field}) => field == "operation");

		var criteria_values = "";
		var fieldName = "";
		if(isOperation){
			fieldName = $historyvar.options.filter_operation_name || "operation";//No I18N
			criteria_values = operations[data.id] || data.id;
		}else if(isField){
			fieldName = $historyvar.options.filter_field_name || "field";//No I18N
			criteria_values = operations[data.id] || data.id;
		}

		if((isField && isFieldExists) || (isOperation && isOperationExists)){
			jQuery.each(criteria,function(index,value){
				if((criteria[index].field=="field" && isField) || (criteria[index].field=="operation" && isOperation)){
					input_data.list_info.search_criteria[index].values = criteria[index].values.concat(criteria_values);
				}
			})
		}
		else{
			var obj = {
				"field": fieldName,//No I18N
				"condition": "in",//No I18N
				"values": Array.isArray(criteria_values) ? criteria_values : [criteria_values]//No I18N
			}
			if(input_data.list_info.search_criteria.length>0){
				obj["logical_operator"]="or"//No I18N
			}
			input_data.list_info.search_criteria.push(obj);
		}
	});
	/**
	 * https://sdpissues.servicedeskplus.com/WorkOrder.do?woMode=viewWO&woID=100367#tasks
	 */
	let options = $historyvar.options;
	if(options && typeof options.constructListInfoCB == "function"){
		input_data = options.constructListInfoCB(input_data);
	}
	return input_data;
},
/**
 * Function to edit the selected options of filter
 * @param {object} event
 */
editSelectedFilter: function(event){
	var _self = this
	if(event && event.target.id == "remove_icon"){
		jQuery(event.target).parent().remove();
		if(jQuery("#selected_operations").children().length==0 && jQuery("#selected_performedBy").children().length==0 && jQuery("#selected_"+$historyvar.options.entity).children().length==0){
			jQuery("#selected_filter_mc").addClass("hide");
			_self.clearSelectedDatas();
			jQuery("#admin_audit_fc").removeClass("hide");
		}
		_self.searchHistory({"isEdit": true}); //No I18N
	}
	else{
		var operationObj = [], performedByObj = [], entityObj = [];
		/**
		 * Fetching selected options of Operation Name field.
		 */
		var operationOpts = jQuery("#selected_operations").children();
		jQuery.each(operationOpts, function(i, val){
				operationObj[i] = { "id" : val.id, "text" : jQuery(val).text()};//No I18N
		});
		/**
		 * Adding selected values as default values.
		 */
		jQuery("#operationName").select2("data", operationObj);//No I18N
		/**
		 * Fetching selected options of Performed By field.
		 */
		var performedByOpts = jQuery("#selected_performedBy").children();
		jQuery.each(performedByOpts, function(i){
			performedByObj.push({"id": this.id, "text": jQuery(this).text()});
		});
		jQuery("#performedBy").select2("data", performedByObj);//No I18N
		/**
		 * Fetching selected options of Entity field.
		 */
		var entityOpts = jQuery("#selected_"+$historyvar.options.entity).children();
		jQuery.each(entityOpts, function(i){
			entityObj.push({"id": this.id, "text": jQuery(this).text()});
		});
		jQuery("#entity").select2("data", entityObj);//No I18N
		/**
		 * To show filter dialog box with filter fields with selected options as default values.
		 */
		jQuery("#selected_filter_mc").addClass("hide");
        jQuery("#admin_audit_fc").removeClass("hide");

	}
},

/**
 * Function to add search functionality of the history filter
 * @param {boolean} fromEdit boolean value to check whether searchHistory is called from Edited Flter or not
 */
searchHistory: function(options){
	var operationValues = [], performedByValues = [], entityValues = [], showOnlyValues = [], fieldsValues = [], accountValues = [];
	/**
	 * Fetching selected values.
	 */
	if(options && options.isEdit){
		operationValues = this.getSearchedOptions("selected_operations");//No I18N
		performedByValues = this.getSearchedOptions("selected_performedBy");//No I18N
		entityValues = this.getSearchedOptions("selected_"+$historyvar.options.entity);//No I18N
	}
	else{
		operationValues = jQuery("#operationName").select2("data");//No I18N
		performedByValues = jQuery("#performedBy").select2("data");//No I18N
		entityValues = jQuery("#entity").select2("data");//No I18N
		showOnlyValues = jQuery("#showOnly").select2("data");//No I18N
		fieldsValues = jQuery("#module_fields").select2("data");//No I18N
		(checkIfMSPOrSCP() && $historyvar.options.show_account_filter)?accountValues=jQuery("#accountFilter").select2("data"):"";//No I18N
	}
	/**
	 * Loading selected values in UI.
	 */
	if(operationValues.length!=0 || performedByValues.length!=0 || entityValues.length!=0 || showOnlyValues.length!=0 || fieldsValues.length!=0 || (checkIfMSPOrSCP() && $historyvar.options.show_account_filter && accountValues.length!=0)){
		jQuery("#selected_filter_ic").html("");
		jQuery("#admin_audit_fc").addClass("hide");
		jQuery("#selected_filter_mc").removeClass("hide");
		if(operationValues.length>0){
			this.loadSearchedOptions("selected_operations", translate("common.entity.name",[translate("sdp.admin.survey.operation")]), operationValues);//No I18N
		}
		if(performedByValues.length>0){
			this.loadSearchedOptions("selected_performedBy", translate("sdp.requests.history.performedby"), performedByValues);//No I18N
		}
		if(entityValues.length>0){
			this.loadSearchedOptions("selected_"+$historyvar.options.entity, $historyvar.options.entity_key, entityValues);//No I18N
		}
		if(showOnlyValues.length>0){
            this.loadSearchedOptions("selected_showOnly", translate("sdp.common.showonly"), showOnlyValues);//No I18N
        }
        if(fieldsValues.length>0){
            this.loadSearchedOptions("selected_fields", translate("sdp.requests.fieldFormRules.listview.fields"), fieldsValues);//No I18N
        }
	}else{
		if(options && options.init){
			showalert('failure', translate("common.creatorlinks.not.empty", [translate("sdp.admin.requesttemplate.insertfield.constraint.message.part1")]), "isAutoHide=false"); // No I18N
			return false;
		}
	}
	$historyvar.operationValues = operationValues;
	$historyvar.performedByValues = performedByValues;
	$historyvar.entityValues = entityValues;
	$historyvar.showOnlyValues = showOnlyValues;
	$historyvar.fieldsValues = fieldsValues;
	(checkIfMSPOrSCP() && $historyvar.options.show_account_filter) ? $historyvar.accountValues=accountValues:"";

	var getURL = $history.URLConstruction(false, "history_url", true); //No I18N
	var inputData = (getURL.input_data) ? getURL.input_data : $history.constructListInfo();
	($historyvar.options.is_date_filter) ? inputData = $history.filterByDate(inputData) : "";
	/**
	 * Get selected data for admin audit filter.
	 */
	this.getSelectedFilterData(inputData);
	$history.filterCall({}, getURL.url, inputData);
	/**
	 * Setting custom height for history content.
	 */
	var customHeight = jQuery("#admin_audit_inner_fc").outerHeight() + 50;
	jQuery("#"+$historyvar.options.entity+"-history").parent().css({"height": "calc(100% - "+customHeight+"px)"});
},

/**
 * Get selected data for admin audit filter
 * @param {*} inputData
 */
getSelectedFilterData : function(inputData){
	this.constructSearchCriteria(inputData, $historyvar.operationValues, "operation"); //No I18N
	this.constructSearchCriteria(inputData, $historyvar.performedByValues, "by"); //No I18N
	this.constructSearchCriteria(inputData, $historyvar.entityValues, $historyvar.options.search_filter);
	this.constructSearchCriteria(inputData, $historyvar.showOnlyValues, $historyvar.options.showOnly_filter);
	this.constructSearchCriteria(inputData, $historyvar.fieldsValues, "field"); //No I18N
	checkIfMSPOrSCP() && $historyvar.options.show_account_filter && this.constructSearchCriteria(inputData, $historyvar.accountValues, "account"); //No I18N
},

/**
 * Constructing the search criteria for admin audit filter.
 * @param {object} inputData
 * @param {array} data
 * @param {string} field
 */
constructSearchCriteria : function(inputData, data, field){
	var obj = {"field" : field, "condition" : "in", "values" : []}; //No I18N
	var listInfo = inputData.list_info;
	if(data){
		for(let index = 0; index < data.length; index++){
			obj.values.push(data[index].id);
			(!listInfo.search_criteria) ? listInfo.search_criteria = [] : "";
			(listInfo.search_criteria.length > 0) ? obj["logical_operator"] = "and" : ""; //No I18N
		}
		(obj.values.length != 0) ? listInfo.search_criteria.push(obj) : "";
		inputData.list_info = listInfo;
	}
	/**
	 * https://sdpissues.servicedeskplus.com/ui/tasks?mode=detail&from=showAllTasks&module=project&taskId=129218&moduleId=1852
	 */
	let options = $historyvar.options;
	if(options && typeof options.constructSearchCriteriaCB == "function"){
		options.constructSearchCriteriaCB(inputData);
	}
},

/**
 * Function to fetch the selected options in history filter.
 * @param {string} id
 * @returns
 */
getSearchedOptions: function(id){
	var outputObject=[];
	var optionsObject = jQuery("#"+id).children();
	jQuery.each(optionsObject, function(i, val){
		outputObject.push({"text" : jQuery(val).text(), "id": val.id})//No I18N
	});
	return outputObject;
},

/**
 * Function to load selected options of the filter in a dialog box.
 * @param {String} id To add the id value in "for" attribute of the selected option label in dialog box.
 * @param {String} name To add the display name of the selected option label.
 * @param {Object} filterObj Object with selected options of the field.
 */
loadSearchedOptions: function(id, name, filterObj){
	jQuery("#selected_filter_ic").append('<div class="form-group mb0 disp-flex p5"><div class="tr filter-label" style="width:35%;">'+
	'<label for="'+id+'" class="mr10"><span class="text-overflow disp-b" rel="uitip" mode_ellipsis="true" title="'+e_attr(name)+'" style="max-width: 94px;">'+e_html(name)+'</span></label><span class="pr5 vtop">:</span></div><div class="fw mt-5">'+
	'<div class="disp-flex valign-center" style="flex-wrap: wrap" id="'+id+'" data-id="'+id+'"></div></div></div>');
	jQuery("#"+id).html("");
	for(var i=0;i<filterObj.length;i++){
		if(filterObj[i]){
			jQuery("#"+id).append('<span class="bg-light ip-sec mb5 disp-flex valign-center" id="'+filterObj[i].id+'"><span class="disp-ib text-overflow pt1" rel="uitip" mode_ellipsis="true" title="'+e_attr(filterObj[i].text)+'" style="max-width:110px;" >'+e_html(filterObj[i].text)+'</span><span class="cspr icon-sm close3 opac3 ml5 cur-ptr" id="remove_icon"></span></span>');
		}
	};
	initTooltip('#selected_filter_ic');//No I18N
},

/**
 * Function to close dialog.
 */
closeDialog: function(){
	if($historyvar.operationValues && $historyvar.operationValues.length > 0 || $historyvar.performedByValues && $historyvar.performedByValues.length > 0 || $historyvar.entityValues && $historyvar.entityValues.length > 0){
		jQuery("#selected_filter_mc").removeClass("hide");
        jQuery("#admin_audit_fc").addClass("hide");
	}else{
		jQuery("#dropdown_dialog_container").addClass("hide");
	}
},

/**
 * The filterByDate is to construct input_data by fetching the selected calendar date.
 * @param {*} input_data
 * @returns
 */
filterByDate : function(input_data){
	/** 
	 * Retrieve the criteria from the history time filter.
	 * If criteria is available, update the search criteria in the input_data.
	 */
	const getCriteria = jQuery('div#history_filter_date', "#history_main_container_" + $historyvar.options.entity)[0].timeFilter.getCriteria();
	if (getCriteria) {
		/** 
		 * Access the list_info property from input_data,
		 * and ensure that search_criteria is initialized as an empty array if it's not defined.
		 */
		const getListInfo = input_data.list_info;
		getListInfo.search_criteria = getListInfo.search_criteria || [];
		/** 
		 * Push the retrieved criteria into the search_criteria array.
		 */
		getListInfo.search_criteria.push(getCriteria);
	}
	/** 
	 * Return the modified input_data.
	 */
	return input_data;
},

/**
 * Function to make ajax call and rendering history data after selecting any options in filter/date-filter.
 * @param {object} data
 * @param {string} url
 * @param {object} input_data
 */
filterCall : function(data, url, input_data){
	if(url){
		sdpAjax({
			url: url,
			method: "GET",//No I18N
			acceptODCompatible: ($historyvar.options.acceptODCompatible) ? true : false,
			data: sdpAjaxInputData(input_data),
			success: function(response){
				response.entity = $historyvar.entity;
				$historyvar.previous_date = "";
				$historyvar.historyJSON = response;
				if($historyvar.historyJSON.history.length>0){
					$historyvar.noHistory = false;
				}
				$history.update_history();
			}
		});
	}
	else{
		$historyvar.filter_values = (Object.keys(data).length!=0 ?  data.val.slice() : {} );
		$historyvar.previous_date = "";
		$historyvar.noHistory = true;
		$history.update_history();
	}
},

/**
 * Function to construct url and input_data for new history UI
 * @returns string
 */
URLConstruction : function(start_index, url_key, defaultURLNeeded){
	start_index = start_index ? start_index : 1;
	var getURLConfiguration = $history.urlConfigs(start_index, $historyvar.options);
	var result = {};
	if(getURLConfiguration && getURLConfiguration[url_key]){
		result.url = getURLConfiguration[url_key];
		/**
		 * https://sdpissues.servicedeskplus.com/ui/tasks?mode=detail&from=showAllTasks&module=project&taskId=122658&moduleId=1313
		 * Check if the module-specific input data exists in the URL configuration
		 */
		if(getURLConfiguration[$historyvar.options.module_value]){
			/**
			 * If module-specific input data exists, assign it to the result
			 */
			result.input_data = getURLConfiguration[$historyvar.options.module_value].input_data || "";
			/**
			 * If module-specific url exists, assign it to the result added as discussed
			 */
			getURLConfiguration[$historyvar.options.module_value].history_url && (result.url = getURLConfiguration[$historyvar.options.module_value].history_url);
		}else if (getURLConfiguration.input_data){
			/**
			 * If module-specific input data doesn't exist, check if there's a general input data in the URL configuration
			 * If general input data exists, assign it to the result
			 */
			result.input_data = getURLConfiguration.input_data;
		}
	}else if (defaultURLNeeded) {
		result.url = "/api/v3/"+$historyvar.entity+(($historyvar.sub_entity && $historyvar.sub_entity != "null") ? ("/"+$historyvar.sub_entity) : "")+($historyvar.entityID ? ("/"+$historyvar.entityID) : "")+"/_history";//No I18N
	}
	return result;
},

//Function for Checking selected filter values present in diff or not
CheckFilterValues : function(diff){
  	for(var i=0;i<diff.length;i++){
  		for(var j=0;j<$historyvar.filter_values.length;j++){
  			if(diff[i].field == $historyvar.filter_values[j] || diff[i].filter_entity == $historyvar.filter_values[j]){
  				$historyvar.noHistory = true;
  				return true;
  			}
  		}
  	}
  	return false;
 },
 //Function for changing the tool tip for collapse and expand button
 tooltipfor_Expand_and_Collapse : function(id){
  	if(document.getElementById('panel-heading-'+id).title == translate('sdp.common.collapse')){
  		document.getElementById('panel-heading-'+id).title = translate('sdp.common.expand');//No i18N
  	}else{
  		document.getElementById('panel-heading-'+id).title = translate('sdp.common.collapse');//No i18N
  	}
},

/**
 * Function for changing the tool tip for sort icon
 * @param {string} sort_type
 */
tooltipforSortIcon : function(sort_type){
	var getSortButton = jQuery("#"+$historyvar.entity+"-accord-sort-btn");
	var getSortSpan = jQuery("#"+$historyvar.entity+"-span-accord-sort-btn");
	var className, titleName;
	if(sort_type =='desc'){
		className = $historyvar.options.is_date_filter ? "asc" : "sort-down"; //No i18N
		titleName = translate('common.sortasc');
	}else{
		className = $historyvar.options.is_date_filter ? "desc1" : "sort-up"; //No i18N
		titleName = translate('common.sortdesc');
	}
	if($historyvar.options.is_date_filter){
		var getDateContainer = jQuery("#date_filter");
		getSortButton = getDateContainer.find("#"+$historyvar.entity+"-accord-sort-btn");
		getSortSpan = getDateContainer.find("#"+$historyvar.entity+"-span-accord-sort-btn");
	}
	getSortButton.attr("title", titleName);
	getSortSpan.attr("class", "cspr "+ className +" icon-sm");
},

/** Processing the history API response to convert it into the compatible format for this component */
processHistory: function(history, modifyFormat,loadmore) {
	if(!history || history.length === 0) {
		return false;
	}
	var historyRecords = loadmore ? $historyvar.historyRecords[$historyvar.entity] : {};
    var newhistory_supportedentity = ["releases", "spaces"];	//No I18N
	if(newhistory_supportedentity.indexOf($historyvar.options.entity) != -1 || $historyvar.options.admin_entity || $historyvar.options.is_new_history){
		var addOperation = ["add"];	//No I18N
		var editOperation = ["edit","UPDATE"];	//No I18N
		var deleteOperation = ["delete"];
		var notesAddOperation = [];
		var notesEditOperation = [];
		var taskAddOperation = [];
		var taskDeleteOperation = [];
		var worklogAddOperation=[];
		var worklogEditOperation=[];
		var worklogDeleteOperation=[];
		var failureOperation = [];
		var successOperation = [];
		var attachmentOperation = [];
		var outgoingOperation = [];
	    var linkOperation = [];
	    var disableOperation = [];
        var enableOperation = [];

		var entity_property = $historyvar.options.moduleproperty_mapping || {};
		if(entity_property){
			addOperation = addOperation.concat(entity_property.add || []);
			editOperation = editOperation.concat(entity_property.edit || []);
			deleteOperation = deleteOperation.concat(entity_property.delete || []);
			notesAddOperation = notesAddOperation.concat(entity_property.notes_add || []);
			notesEditOperation = notesEditOperation.concat(entity_property.notes_edit || []);
			taskAddOperation = taskAddOperation.concat(entity_property.tasks_add || []);
			taskDeleteOperation = taskDeleteOperation.concat(entity_property.tasks_delete || []);
			worklogAddOperation=worklogAddOperation.concat(entity_property.worklogs_add || []);
			worklogEditOperation=worklogEditOperation.concat(entity_property.worklogs_edit || []);
			worklogDeleteOperation=worklogDeleteOperation.concat(entity_property.worklogs_delete || []);
			failureOperation = failureOperation.concat(entity_property.failure || []);
			successOperation = successOperation.concat(entity_property.success || []);
			attachmentOperation = attachmentOperation.concat(entity_property.attachment_operation || []);
			outgoingOperation = outgoingOperation.concat(entity_property.outgoing_operation || []);
			linkOperation = linkOperation.concat(entity_property.link_operation || [] );
			disableOperation = disableOperation.concat(entity_property.disable_operation || [] );
            enableOperation = enableOperation.concat(entity_property.enable_operation || [] );
		}
		for(var i=0, len=history.length; i<len; i++) {
			var item = history[i];
				historyRecords[item.id] = item;
				if(item.client_time) {
					if(!item.hasOwnProperty("time") || !item.date) {
						item.time = item.client_time;
					} else {
						item.time.date = item.time.date || item.client_time.date;
						item.time.time = item.time.time || item.client_time.time;
					}
				}
				if(typeof item.operation == "object"){	//No I18N
					item.display_operation_name = item.operation.display_name;
					item.operation = item.operation.name;
				}
				if(item.operation) {
					var item_className = "", display_operation_name = "";	//No I18N
					if(["CREATE"].indexOf(item.operation) != -1) {	//No I18N
						display_operation_name = translate("sdp.admin.brule.whentoexec.created");	//No I18N
						item_className = "list-sprite icon-md notes-icon2 mt1";	//No I18N
					}else if(notesAddOperation.indexOf(item.operation) != -1) {
						display_operation_name = translate("common.notescreated");
						item_className = "list-sprite icon-md notes-icon2 mt1";	//No I18N
					}else if(notesEditOperation.indexOf(item.operation) != -1) {
						display_operation_name = translate("common.notesupdate");
						item_className = "list-sprite icon-md notes-icon2 mt1";	//No I18N
					}else if(taskAddOperation.indexOf(item.operation) != -1 || item.operation.indexOf('taskcustomaction') != -1) {
						display_operation_name = translate("common.taskadded");
						item_className = "list-sprite icon-md task-icon ml2 mt2";	//No I18N
					}else if(taskDeleteOperation.indexOf(item.operation) != -1) {
						display_operation_name = translate("sdp.project.history.taskdelete");
						item_className = "list-sprite icon-md task-icon ml2 mt2";	//No I18N
					}else if(worklogAddOperation.indexOf(item.operation) != -1 ) {
						display_operation_name = translate("common.worklogadded");
						item_className = "list-sprite icon-md task-icon ml2 mt2";	//No I18N
					}else if(worklogEditOperation.indexOf(item.operation) != -1 ) {
						display_operation_name = translate("sdp.project.history.taskworklogupdated0");
						item_className = "list-sprite icon-md task-icon ml2 mt2";	//No I18N
					}else if(worklogDeleteOperation.indexOf(item.operation) != -1) {
						display_operation_name = translate("sdp.project.history.taskworklogdelete0");
						item_className = "list-sprite icon-md task-icon ml2 mt2";	//No I18N
					}else if(failureOperation.indexOf(item.operation) != -1) {
					    display_operation_name = translate("sdp.common.failed");
					    item_className = "cspr triangle-red icon-md ml2";	//No I18N
					}else if(successOperation.indexOf(item.operation) != -1) {	
					    item_className = "cspr icon-md tick-green2 mt3 ml3";	//No I18N
                    }else if(attachmentOperation.indexOf(item.operation) != -1) {
					    item_className = "sdp-glyph sdp-glyph-paperclip icon-md pl2 top2";	//No I18N
                    }else if(outgoingOperation.indexOf(item.operation) != -1) {
					    item_className = "list-sprite icon-md outgoing-conv-icon-off";	//No I18N
                    }else if(linkOperation.indexOf(item.operation) != -1) {
                        item_className = "sdp-glyph sdp-glyph-link icon-md left2";	//No I18N
                    }else if(disableOperation.indexOf(item.operation) != -1){
                        item_className = "cspr disable-no icon-md"; //No I18N
                    }else if(enableOperation.indexOf(item.operation)  != -1){
                        item_className = "cspr enable icon-md"; //No I18N
					}else if(addOperation.indexOf(item.operation) != -1 || item.operation.indexOf("_add") != -1) {	//No I18N
						display_operation_name = translate("sdp.history.added");	//No I18N
						item_className = "list-sprite icon-md notes-icon2 mt1";	//No I18N
					}else if(editOperation.indexOf(item.operation) != -1 || item.operation.indexOf("_edit") != -1) {	//No I18N
						display_operation_name = translate("sdp.requests.history.updated");	//No I18N
						item_className = "sdp-glyph sdp-glyph-edit2 icon-md left1";	//No I18N
					}else if(deleteOperation.indexOf(item.operation) != -1 || item.operation.indexOf("_delete") != -1) {	//No I18N
						display_operation_name = translate("sdp.itil.propview.deleted");	//No I18N
						item_className = "sdp-glyph sdp-glyph-edit2 icon-md left1";	//No I18N
					}

					if(!item.hasOwnProperty("display_operation_name")){	//No I18N
						if(display_operation_name){
							item.display_operation_name = display_operation_name;
						}else if(item.operation_name) {
							item.display_operation_name = item.operation_name;
						}
					}
					if(item.hasOwnProperty("className")) {	//No I18N
						item_className = item.className + " "+ item_className;
					}
                    // For new icons
					if($historyvar.options.is_new_icon){
                        if((item.operation).indexOf('worklog') != -1){
                            item_className = 'cspr icon-md calendar1 opac7';        //No I18N
                        }else if((item.operation).indexOf('attachment') != -1){
                            item_className = 'cspr paperclip icon-md opac5';    //No I18N
                        }else if((item.operation).indexOf('customaction') != -1){
                            item_className = 'cspr task-trigger icon-md';               //No I18N
                        }else if((item.operation).indexOf('dependency') != -1){
                            item_className = 'cspr task-dep icon-md';                   //No I18N
                        }else if((item.operation).indexOf('comment') != -1){
                            item_className = 'cspr icon-md cmnt-new';                   //No I18N
                        }else if((item.operation).indexOf('task') != -1){
                            item_className = 'cspr icon-md unified-list';         //No I18N
                        }else if((item.operation).indexOf('milestone') != -1){
                            item_className = 'cspr icon-md mile-st-notify';             //No I18N
                        }else if((item.operation).indexOf('change') != -1 || (item.operation).indexOf('parentproject') != -1){
                            item_className = 'cspr th-change icon-md top0 tf1-3';                  //No I18N
                        }else if((item.operation).indexOf('request') != -1){
                            item_className = 'cspr icon-md incident-request';           //No I18N
                        }else if((item.operation).indexOf('release') != -1){
                            item_className = 'hspr icon-md ri-release vmiddle flip-x';  //No I18N
                        }else if((item.operation).indexOf('member') != -1){
                            item_className = 'hspr ri-req icon-md vmiddle';             //No I18N
                        }else if((item.operation).indexOf('project') != -1){
                            item_className = 'cspr prj-new icon-md';                    //No I18N
                        }
                    }
					item.className = item_className;
					var custom_property = entity_property[item.operation] || {};
					item = jQuery.extend(true, item, custom_property);
				}
		}
		$historyvar.historyRecords[$historyvar.entity] = historyRecords;
	}else{
		for(var i=0, len=history.length; i<len; i++) {
			item = history[i];
			if(modifyFormat) {
				if(!item.hasOwnProperty("display_operation_name") && item.operation_name) {
					item.display_operation_name = item.operation_name;
				}
				if(item.client_time) {
					if(!item.hasOwnProperty("time") || !item.date) {
						item.time = item.client_time;
					} else {
						item.time.date = item.time.date || item.client_time.date;
						item.time.time = item.time.time || item.client_time.time;
					}
				}
			} else {
				if(item.operation) {
					if(item.operation === "add") {	//No I18N
						item.display_operation_name = translate("sdp.history.added");	//No I18N
						if(!item.hasOwnProperty("className")) {	//No I18N
							item.className = "list-sprite icon-md notes-icon2 mt1";	//No I18N
						} else {
							item.className += "list-sprite icon-md notes-icon2 mt1";	//No I18N
						}
					} else if(item.operation === "edit") {	//No I18N
						item.display_operation_name = translate("sdp.requests.history.updated");	//No I18N
						if(!item.hasOwnProperty("className")) {	//No I18N
							item.className = "sdp-glyph sdp-glyph-edit2 icon-md left1";	//No I18N
						} else {
							item.className += "sdp-glyph sdp-glyph-edit2 icon-md left1";	//No I18N
						}
					}
				}
			}
		}
	}
	
},
loadDiff : function(diffid, index){
	var base_data = ($historyvar.historyRecords[$historyvar.entity][diffid]);
	var diff_data = base_data.diff[index];
	var data = {"base_data" : base_data, diff_data : diff_data};	//No I18N
	var encode = false;
	/**
	 * We check if the content should be encode.
	 */
	if($historyvar.options.admin_entity){
		encode = true;
		var metaField = this.getMetaInfo();
		if(metaField && data.diff_data.field){
			if(typeof $historyvar.options.encodeCB === 'function') {
				encode = $historyvar.options.encodeCB(data.diff_data.field); //Callback to not to encode the field
			}
			var getFieldType = metaField[data.diff_data.field.name] && metaField[data.diff_data.field.name].type;
			if(encode !== false && (getFieldType == "html" || data.diff_data.field.name == "help_text")){
				encode = false;
			}
		}
	}
	//SD-113739 Encoding downtime description as it is vulnerable to XSS
	else if(diff_data.field.name == "DT_DESC"){
	    encode = true;
	}
	data.encode = encode;
	/**
	 * Render an Handlebars template with the specified options and inject it into the element with ID 'diff_popup_container'
	 * The template name is "compare", and the data to be passed is stored in the 'data' variable
	 */
	renderhbs("#diff_popup_container", "compare", data, false, "history");  //NO I18N
	/**
	 *  For converting the image to video
	 */
    window.history_attach_preview = new attachPreview(jQuery("#diff_popup_container"), {target : 'img', layouts : false, skipPreview : true,attachWrap: true}); //No I18N
	jQuery('#diff_popup_container').dialog({
		modal: true,
		open: function (event, ui) {
			/**
			 * To initialize dark mode in the popup
			 */
			ThemeCustomizer.zcontrastcolorinit("#diff_popup_container"); //No I18N
			jQuery('.compare_container').find(".ui-dialog-title").html('<span> '+translate("history.diff.title.compare",[e_html(diff_data.field.display_name?diff_data.field.display_name:diff_data.field.name)])+' </span> <span style="max-width: 60%" class="text-muted font-small disp-ib text-overflow vmiddle cur-ptr" rel="uitip" "mode_ellipsis="true" title="'+translate("sdp.reports.customReport.updatewidget.lastupdatedby.label", [e_html(base_data.by.name), e_html(base_data.time.display_value)])+'"> - '+translate("sdp.reports.customReport.updatewidget.lastupdatedby.label", [e_html(base_data.by.name), e_html(base_data.time.display_value)])+'</span>'); //NO I18N
			initTooltip('div.ui-dialog'); //No I18N
		},
		close: function(){
			/**
			 * To avoid enable the scroll bar in admin history when preview component is open
			 */
			if($historyvar.options.admin_entity){
				jQuery('body').addClass('of-h');
			}
			/**
			 * When closing the dialog, if the video is playing, we stop it
			 */
			jQuery(this).empty();
		},
		width: 700,
		dialogClass: 'desc-diff compare_container', //NO I18N
		position: {
			my: 'center', //NO I18N
			at: 'center', //NO I18N
			of: window
		}
	});
},

/**
 * Get the metainfo to encode the description.
 * @returns
 */
getMetaInfo : function(entity){
	var returnData = false;
	var entityName = entity ? entity : $historyvar.options.entity;
	const getMetaData = $historyvar.meta_data[entityName];
	/**
	 * Check if there is no error related to meta information before proceeding.
	 */
	if(!$historyvar.has_meta_error){
		if(getMetaData){
			/**
			 * If metadata is already cached, return it
			 */
			returnData = getMetaData;
		}else{
			/**
			 * If metadata is not cached, fetching the meta URL.
			 */
			const getMetaURL = $history.URLConstruction(false, "meta_url", false); //NO I18N
			/** Construct the metadata URL */
			const metaURL = (getMetaURL && getMetaURL.url) ? encodeURI(getMetaURL.url) : "/api/v3/"+entityName+"/_metainfo"; //NO I18N
			sdpAjax({
				url: metaURL,
				method: "GET", //No I18N
				async: false,
				ignorefailuremessage: true,
				success: function(response){
					returnData = response.metainfo.fields;
					/**
					 * Cache the metadata for future use
					 */
					$historyvar.meta_data[entityName] = returnData;
				},
				error : function(jqXHR, status){
					/**
					 * Set the 'has_meta_error' flag to true, indicating the presence of an error related to meta information.
					 */
					$historyvar.has_meta_error = true;
				}
			});
		}
	}
	return returnData;
},
/**
 * Adding the scroll to top to the new history pages.
 */
addScrollToTop : function() {
    let scrolltotop = jQuery("#scrolltotop");
    if($historyvar.options.is_slider){
        jQuery("#"+$historyvar.options.entity+"-history").off().on("scroll", function() {
            if(jQuery("#"+$historyvar.options.entity+"-history").scrollTop() > 1000) {
                scrolltotop.removeClass("hide");
            } else {
                scrolltotop.addClass("hide");
            }
        });
    }
    jQuery(window).off().on("scroll", function() {
        if(jQuery(document).scrollTop() > 1000) {
            scrolltotop.removeClass("hide");
        } else {
            scrolltotop.addClass("hide");
        }
    });
    jQuery("#scrolltotop").off("click").on("click", () => {      // No I18N
        jQuery(`#${$historyvar.options.entity}-history, html, body`).animate({
        scrollTop: 0
        }, 400);
    });
},
/**
 * Show Filter based on new history Slider.
 */
historyFilterSlider : function(ele){
	let target = jQuery('#history_slide');
	if(jQuery("#filter_toggle").hasClass("active")){
		jQuery("#history_filter_slide").dialog("close");   // No I18N
		return;
	}
	$history.showFilterDialog();
	jQuery("#history_filter_slide").show().panelSlider({
		width: 400,
		header: false,
		placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
		position:{
			my: sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
			at: sdp_user.DIRECTION === "RTL" ? "right" : "left", // NO I18N
			of : target
		},
		modal: false,
		open:function(){
		    jQuery("#history_filter_slide").removeClass("hide");
			jQuery(ele).addClass("active");
			jQuery("#filter_name").text(translate("sdp.request.advsearch.hidefilter"));
		},
		close:function(){
			if(jQuery(ele).hasClass("active")){
				jQuery("#history_filter_slide").dialog('destroy'); // NO I18N
			}
			jQuery(ele).removeClass("active");
			jQuery("#history_filter_slide").addClass("hide");
			jQuery("#filter_name").text(translate("sdp.request.advsearch.showfilter"));
		}
	});
},
/**
 * Show Filter based on new history Filter.
 */
historyFilterToggle : function(ele){
	let leftPanel = jQuery('#filter_left_panel');
	let middlePanel = jQuery('#filter_middle_panel');
	if( jQuery(ele).attr('data-action') == 'Show'){
		$history.showFilterDialog();
	    leftPanel.removeClass('hide').addClass('disp-c').css('width','280px');        //No I18N
	   	middlePanel.removeClass('hide').addClass('disp-c').css('width','1px');        //No I18N
	    jQuery(ele).attr('data-action','Hide').find('[data-scr=SrcTxt]').text(translate('sdp.request.advsearch.hidefilter'));
	}else{
		leftPanel.addClass('hide').removeClass('disp-c'); //No I18N
	   	middlePanel.addClass('hide').removeClass('disp-c'); //No I18N
	    jQuery(ele).attr('data-action','Show').find('[data-scr=SrcTxt]').text(translate('sdp.request.advsearch.showfilter'));
	}
},

/**
 * Initialize the 'Show More' functionality.
 * This function sets up the 'Show More' feature with appropriate options.
 */
initalizeShowMore : () => {
	/**
	 * Determine if admin entity is present
	 */
	const hasAdminEntity = $historyvar.options.admin_entity;
	/**
	 * Determine the custom dialog class based on the presence of admin entity
	 */
	const customDialogClass = hasAdminEntity ? "highindex" : ""; //No I18N
	/**
	 * Options for the 'Show More' functionality
	 */
	const showMoreOptions = {
		/**
		 * Container element for 'Show More'
		 */
		container : jQuery("#history_main_container_"+$historyvar.options.entity),
		/**
		 * Popup configuration
		 */
		popup : {
			/**
			 * Custom dialog class for popup
			 */
			customDialogClass,
			/**
			 * Flag indicating if a dialog is opening
			 */
			hasOpeningDialog : hasAdminEntity
	}
	};
	/**
	 * Call the 'Show More' functionality with the configured options
	 */
	$showMore(showMoreOptions);
}

};

// helper for checking user fields
Handlebars.registerHelper('isUserField', function(diffObj, prevOrCurrent) { //NO I18N 
  if(sdp_user.USERTYPE == "Requester" && sdp_user.ROLES.indexOf("SDOrgAdmin") == -1){ //NO I18N
  	return false;
  }
  var fieldObj = diffObj.field;
  var currentValue = diffObj[prevOrCurrent];
  var isuserfield = false;
  var userFields = $historyvar.options.userFields;
  if(userFields && userFields.length > 0){
  	var value = fieldObj.name;
    if(value){
      isuserfield = userFields.indexOf(value) != -1;
    }
  }else{
  	if(currentValue && currentValue.hasOwnProperty("email_id") && currentValue.hasOwnProperty("is_vipuser")){
  		isuserfield = true;
  	}
  }
  return isuserfield;
});
Handlebars.registerHelper('constructDiffRow', function(Obj){ //NO I18N
   let rowELe = `<p>${e_html(Obj.display_name)} :`;
	if(Obj.url) {
	   rowELe = rowELe + ` <a class="cur-ptr text-link sb disp-ib" target="_parent" rel="noopener noreferrer uitip" mode_html="true" href='${Obj.url}' ${Obj.uitip?`title="${e_attr(Obj.uitip)}"`:``}>#${Obj.id}</a>`;
	}else{
	   rowELe = rowELe + ` <span class="cur-ptr sb disp-ib" rel="uitip" mode_html="true" ${Obj.uitip?`title="${e_attr(Obj.uitip)}"`:``}>#${Obj.id}</span>`;
	}
	rowELe = rowELe + ` <strong class= "disp-ib">${e_html(Obj.title)}</strong></p>`;
	return rowELe;
});

/**
 * Define a Handlebars helper named 'isMultiLine'
 */
Handlebars.registerHelper('isMultiLine', (field, field_key) => { //NO I18N 	
	/**
	 * Get metadata information
	 */
	const metaInfo = $history.getMetaInfo();
	/**
	 * Extract the base field name from field_key if present, otherwise use the original field
	 */
    const fieldName = (field_key) ? field_key.split(".")[0] : field;
	/**
	 * Check if metaInfo is available, the field exists in metaInfo, and its display type is "Multi Line"
	 */
	return metaInfo && metaInfo[fieldName] && (field_key ? metaInfo[fieldName].fields && metaInfo[fieldName].fields[field] && metaInfo[fieldName].fields[field].display_type === "Multi Line" : metaInfo[fieldName].display_type === "Multi Line");	
});

/**
 * Handlebars helper for constructing HTML for multiline content with a "Show More" link
 */
Handlebars.registerHelper('constructMultiline', (field_name, field_display_name, value) => { //NO I18N
	/**
	 * Construct HTML for the multiline content with conditional classes and styles
	 */
	return contructHtml = `<span><strong class="disp-b" data-sm='true' data-sm-height='60' data-sm-mode='popup' data-sm-field-type="multi_line" data-sm-field-name="${e_attr(field_display_name)}" style="white-space:pre-line;">${e_html(value)}</strong></span>`; //NO I18N
});
