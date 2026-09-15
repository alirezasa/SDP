/* $Id$ */

if(typeof $req === "undefined" || !$req) {
	var $req = {};
	/** when loading th request preview inside iframe, the sdp_user has to be fetched from parent scope */
	if(!window.sdp_user) {
		var sdp_user = parent.sdp_user;
	}
	$req.sdp_user = parent.sdp_user;
	$req.winsize_sm = 1420;	/** Minimum window width limit, upto which the left panel will be hidden by default */
}

$req.utils = {

	/** External frame loading exceptions in actions */
	external_load_exceptions: {
		actions: ["edit", "actions", "timer", "email_tech", "sms_tech", "custom_layout","nav_buttons"],	//No I18N
		tabs: ["tasks", "worklogs", "time_analysis", "dependency", "approvals"],	//No I18N
		rpanel:false,
		lpanel: false
	},

	/*
	 * Generic function to make all the ajax calls and return the response. Also, calls the callback function if any after the ajax call
	 */
	ajax: function(url, type, async, cache, successCallBack, failureCallBack) {
		async = async === false ? false  : true;
		if(type === "GET") { cache = false;}//No I18N
		return sdpAjax({
			url: url,
			type: type,
			async: async,
			cache: cache,
			success: function(response) {
				if(typeof successCallBack === "function") {	//No I18N
					successCallBack(response);
				}
				return response;
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if(typeof failureCallBack === "function") {	//No I18N
					failureCallBack(jqXHR, textStatus, errorThrown);
				}
			}
		});
	},

	/**
	 * Safe event trigger for the fields without triggering FAFR rule execution
	 */
	safeTrigger: function(element, eventType) {
		if(!element) {
			return false;
		}
		var evt = document.createEvent("HTMLEvents");//NO I18N
		evt.firedBy='user_api';	//No I18N
		evt.initEvent(eventType, true, true); // event type,bubbling,cancelable
		return !element.dispatchEvent(evt);
	},

  	/**
  	 * Removes the visible alert message from UI and  displays the new alert message using existing showalert function
  	 */
  	alert: function(type, message, options) {
  		jQuery("#alertbox").remove();
  		showalert(type, message, options);
  	}
};

$req.layout = {
	is_customized: false,

	technician: {
		tabs: ["details", "resolution", "tasks", "checklists", "worklogs", "approvals", "dependency", "time_analysis", "history"],	/** default Tabs ordered list */	//No I18N
		properties: ["status", "priority", "tasks","checklists", "first_response_due_by_time", "technician", "group", "site", "attachments", "assets"], /** default Right panel properties ordered list to be rendered for technician */	//No I18N
		details: ["description", "conversation", "properties"],	/** default Details tab sections ordered list */	//No I18N
		rpanel: ["rlc", "properties", "share", "associations", "tags", "requester"],	/** default Right panel sections ordered list */	//No I18N
		show_rpanel: true, //No I18N
		rlc_position: "bottom", //No I18N
		can_tech_edit: false //No I18N
	},

	requester: {
		tabs: ["details", "resolution", "tasks", "worklogs", "approvals", "history"],	/** default Tabs ordered list */	//No I18N
		properties: ["status", "assets", "priority", "due_by_time"],	/** default Details tab sections ordered list */	//No I18N
		details: ["description", "conversation", "properties"],	/** default Right panel properties ordered list to be rendered for technician */	//No I18N
		rpanel: ["properties", "requester"],	/** default Right panel sections ordered list */	//No I18N
		show_rpanel: true //No I18N
	},

	initialize: function(fetchPers) {
		if(isMSPOrSCP) {
			if(this.technician.rpanel.indexOf("account") == -1) {
				this.technician.rpanel.push("account");
			}
			if(!this.technician.hasOwnProperty("account_properties")) {
				this.technician.account_properties = ["account_manager", "industry", "country", "name", "weburl", "emailid", "landline"];	/** Default fields for the account section in the right panel */	// NO I18N
			}
		}
		var usertype = $req.sdp_user.USERTYPE === "Technician" ? "technician" : "requester";	//No I18N
		this.tabs = this[usertype].tabs;
		this.properties = this[usertype].properties;
		this.details = this[usertype].details;
		this.rpanel = this[usertype].rpanel;
		this.show_rpanel = this[usertype].show_rpanel;
		this.rlc_position = this[usertype].rlc_position;
		this.can_tech_edit = this[usertype].can_tech_edit;
		if(isMSPOrSCP) {
			// Removing site and asset field from default technician properties
			var siteIndex = this.properties.indexOf("site");	//No I18N
			if(siteIndex != -1) {
				var toSplice = 0;
				if(isSCP) {
					toSplice = 1;
				}
				if(this.properties.indexOf("account") == -1) {	//No I18N
					// if account is not there in properties list - splice and add account
					this.properties.splice(siteIndex, toSplice, "account");	//No I18N
				} else if(toSplice > 0) {
					// if account is there in properties list - splice only if to be spliced
					this.properties.splice(siteIndex, toSplice);
				}
			}
			if(isSCP) {
				var assetIndex = this.properties.indexOf("asset");	//No I18N
				if(assetIndex !== -1) {
					this.properties.splice(assetIndex, 1);
				}
            }
			/**Get the account properties from the user/global personaization */
            this.account_properties = this[usertype].account_properties;

			if(!sdp_app.IS_RLC_MODULE_ENABLED) {
				// RLC feature is license based for SCP.
				var rlcIndex = this.technician.rpanel.indexOf("rlc");
				if (rlcIndex !== -1) {
					this.technician.rpanel.splice(rlcIndex, 1);
				}
			}

			if(!sdp_app.IS_REQUEST_SHARING_MODULE_ENABLED) {
				// Request Sharing feature is license based for SCP.
				var requestShareIndex = this.technician.rpanel.indexOf("share");
				if (requestShareIndex !== -1) {
					this.technician.rpanel.splice(requestShareIndex, 1);
				}
			}
		}

		if(fetchPers !== false) {
			this.getPersLayout();
		}
	},

	/**
	 * Sets default values for the layout
	 * which can also avoid errors in showing the Request details preview page in other modules
	 */
	setDefault: function() {
		var layout = $req.sdp_user.USERTYPE === "Technician" ? this.technician : this.requester;	//No I18N
		this.tabs = layout.tabs;
		this.properties = layout.properties;
		this.details = layout.details;
		this.rpanel = layout.rpanel;
		this.show_rpanel = layout.show_rpanel;
		this.rlc_position = layout.rlc_position;
		this.can_tech_edit = layout.can_tech_edit;
		this.externalframe = window.externalframe;
		if(isMSPOrSCP) {
			this.account_properties = layout.account_properties;
		}
	},

	afterPageReady: function(){
		if((!$req.layout.show_rpanel && $req.sdp_user.USERTYPE == "Technician" )|| (window.externalframe && $req.sdp_user.USERTYPE == "Technician")){
			var rlcData = $req.rpanel.rlcTransitions();
			var associationsData = $req.rpanel.techAssociations();
			if(associationsData.length){
				let afterRenderCallback =()=>{
					$req.details.bindEvents.templates.association_details(associationsData);
				}
			    renderhbs('#asso-section', 'association-details', associationsData, false, 'requests',null,null,afterRenderCallback); //No I18N
				jQuery("#asso-section").addClass("section-padding").prepend('<div class="ml10 mr15"><strong id="assoSecHeader" data-i18n-key="sdp.project.associations.tabname">'+getMessageForKey("sdp.project.associations.tabname")+'</strong><hr class="mt10 mb15"></div>');
			}
			if(rlcData.isEnabled){
                let afterRenderCallback = function() {
                    $req.details.bindEvents.templates.rlc_transitions(rlcData);
                }
			    renderhbs('#rlc-section', 'rlc-transitions', rlcData, false, 'requests', true, null, afterRenderCallback); //No I18N
				var rlcSecHgt = jQuery("#rlc-section").height();
				if($req.layout.rlc_position === "bottom"){
					var leftPanelWidth = jQuery("#requests_div").width() + 10;
					jQuery("#content-section").css("padding-bottom",rlcSecHgt); //No I18N
					if(window.externalframe){
						jQuery("#rlc-section").addClass("rlc-position-bottom bottom0").css({"width":"100%"});  //No I18N
					}
					else{
						jQuery("#rlc-section").addClass("rlc-position-bottom").css({"width":"calc(100% - "+(leftPanelWidth+29)+"px)"}); //No I18N
					}
				}
				else{
					jQuery("#request-header-info").css({"padding-bottom": "25px","position":"relative"}); //No I18N
					jQuery("#rlc-section").addClass("rlc-position-top"); //No I18N
				}
			}
			jQuery("#tag-section").append('<div id="request-tag-section" class="form-section clearfix tags-dd p15 pl10"></div>');
			if(window.externalframe){
				$req.tags.render();
				jQuery('body').css('overflow','hidden auto'); //No I18N
				jQuery("#main").css({"display":"block"}); //No I18N
				jQuery("#req-details-body").css({"padding-bottom":"35px"}); //No I18N
			}
			jQuery("#property-section").addClass("propSection");
			var reqInfo = $req.details.request_info;
			if(($req.sdp_user.USERTYPE === 'Technician') && (reqInfo.is_trashed || (sdp_user.ROLES.indexOf('ShareRequest') === -1)) && !reqInfo.is_shared ) {
				return;
			}
			else{
				$req.share.renderInDetails();
			}
		}

		// add the scroll event listener
		var scrollListener = debounce(function() {
			var isLeftPanelVisiable = jQuery("#request-left-panel .cview").is(":visible"); // NO I18N
			if (isLeftPanelVisiable) {
				var tableObj = !requestListViews.isUnified ? table_comp_request : table_combined_task;
				if (jQuery("#WOHeader").hasClass("sticky-fixed")) {
					tableObj.t_obj.options.height = jQuery(window).height() - 60;
				} else {
					tableObj.t_obj.options.height = jQuery(window).height() - 160;
				}
				jQuery("#requests_list_kanban_div").height(tableObj.t_obj.options.height);
				//SD-124107 -> UI Glitch issue in Left panel list view.
				jQuery("#requests_list_kanban_div").addClass('fh');
			}
		}, 100);
		jQuery(window).on("scroll.wod_lpanel_height", scrollListener);
		if(sdp_app.platformai_info.is_request_summarization_enabled) {
		    $platformai_summary.showOption();
		}
	},
	/**
	 * Gets the personalized layout information that to be used for rendering
	 * If fails to fetch the personalized info, the default values wull be used for rendering
	 */
	getPersLayout: function() {
		var _self = this;
		try {
				var layout_pers_key = $req.sdp_user.USERTYPE === "Technician" ? "request_details_technician_layout" : "request_details_requester_layout";	//No I18N
				var layout = window.getGlobalPersonalization(layout_pers_key);
				var client_conf = sdp_user.CLIENT_CONF.req_details_layout;
				if(client_conf && (client_conf!="false") && sdp_user.USERTYPE === "Technician" && layout && layout.can_tech_edit){
					layout = client_conf;
				}
				if(window.externalframe){
					if(!layout){
						layout = $req.layout.technician;
					}
					layout.show_rpanel = false;
				}
			/** for tabs and details sections, even if the DB is missing any entry, the missed item will be pushed at the end of the layout */
			var fixLayout = function(layout, layoutname) {
				var def_items = $req.sdp_user.USERTYPE === "Technician" ? _self.technician[layoutname] : _self.requester[layoutname];	//No I18N
				if(!layout) {
					return def_items;
				}
				var item;
				for(var i = 0, len = def_items.length; i < len; i++) {
					item = def_items[i];
					if(layout.indexOf(item) === -1) {
						layout.push(item);
					}
				}
				return layout;
			};
			if(layout) {
				var layout_items = ["tabs", "properties", "details", "rpanel","show_rpanel","rlc_position","can_tech_edit"];	//No I18N
				/** For SCP, we are showing account section in the right panel  */
				if (isMSPOrSCP && sdp_app.IS_ACC_INFO_ICON_ENABLED) {
					layout_items.push("account_properties"); // No I18N
				}
				if(layout.show_rpanel === undefined){
					layout.show_rpanel = true;
				}
				for(var i=0; i<layout_items.length; i++) {
					 if((layout[layout_items[i]] && jQuery.isArray(layout[layout_items[i]])) || layout_items[i]==="show_rpanel" || layout_items[i]==="rlc_position" ||layout_items[i] === "can_tech_edit") {
						/** checking and fixing the valid tabs and details section layout */
						if(layout_items[i] === "tabs" || layout_items[i] === "details") {
							this[layout_items[i]] = fixLayout(layout[layout_items[i]], layout_items[i]);
						}
						else {
							this[layout_items[i]] = layout[layout_items[i]];
						}
					}
				}
				this.is_customized = true;
			}
		} catch (exception) {
			throw new Error(exception);
		}
	},

	/**
	 * Opens the Layout Customization window in a dialog
	 */
	open: function(view,layout) {
		$req.layout.user_view = view;
		$req.layout.layout_type = layout;
		window.showURLInDialog("/workorder/WOLayout.jsp", "position=absmiddle, width=1250, height=655, modal=yes, closeOnEscKey=no, closeButton=no");	//No I18N
	},

	/**
	 * On closing the layout, if the current tab is History, then the tab is refreshed to overwrite the history component variable values by Layout history
	 * TODO: The history component should be changed to instance model
	 */
	close: function() {
		if($req.details.tab_name === "history") {
			$req.details.updateTab("history");	//No I18N
		}
	}
};
$req.layout.setDefault();

$req.details = {
	request_info: {},	/* Basic Request information --> status, priority, description, ... */
	template_info: {},	/* ReTemplate's information */
	udf_mapping_names:{},
	refer_fields:[],
	meta_info: {},	/* Meta Information for the Properties */
	request_metrics: {},	/* Summary info ex: -> link_request_count, dependency_count, notes_count, ... */
	operational_data: {},	/* action permission related information */
	allowedValues: {},
	tab_name: null,	/* denotes the tab which is opened currently */
	tab_options: null,	/* Not used --> can be removed */
	template_module: "INCIDENT",	/* denotes the template type */	//No I18N
	request_associations: {},	/* Request Association information. ex: --> problem, project, change, purchase */
	self_service_portal_settings : {},	/* General settings data */
	request_closing_rules : {},
	is_loading_failed: false,
	rlc: {
		transitions: [],
		isEnabled: false
	},
	status_mandate:{},
	is_collab_initialized: false,

	pending_req_count:0,
	did_modify: false,
	did_collab_notify_cancelled: false,
	events: {},

	/*
	 * Gets the all the required information to render the templates in Request Page
	 */
	initialize: function(id) {
		/** resets basic properties of the request */
		this.request_info = {};
		this.template_info = {};
		this.meta_info = {};
		this.request_metrics = {};
		this.operational_data = {};
		this.tab_name = null;
		this.tab_options = null;
		this.request_associations = {};
		this.self_service_portal_settings = {};
		this.request_closing_rules = {};
		this.req_warning= null;
		this.rlc = {
			transitions: [],
			isEnabled: false
		};
		this.is_collab_initialized = false;

        if(id !== undefined) {
		    window.woID = woID = id;
	    }
  		//Need to reset the resource attributed when request details is accessed. So that the popup opens when comming from List view/Form Page
  		this.resetResourceAttrs();
		this.getRequestInfo(woID, this.getReqIncludes());
		if(this.is_loading_failed) {
			return false;
		}
		this.setTemplateModule();
		$req.tags.init();
		// this.getTemplate();
		// this.getStatusJson(woID);

		if(window.externalframe) {
			this.exceptions = $req.utils.external_load_exceptions;
		}
		return true;
	},

	/**
	 * Returns an array of the required entities to be fetched in base request api call
	 */
	getReqIncludes: function() {
		var includesArr = ["_links", "asset_list", "status", "metainfo", "request_template", "request_associations", "udf_mapping_names"];	//No I18N
		if(!this.request_info.is_trashed) {
			includesArr.push("self_service_portal");	//No I18N
			includesArr.push("summary");	//No I18N
		}
		if($req.sdp_user.USERTYPE === "Technician") {	//No I18N
			includesArr.push("nav_details");	//No I18N
			if(!isMSPOrSCP || sdp_app.IS_REQUEST_CUSTOM_MENU_MODULE_ENABLED) {
				// for SDP this block is always executed
				// Request Custom Menu is license based for SCP
			includesArr.push("custom_menus");	//No I18N
			}
			includesArr.push("dependency");	//No I18N
			includesArr.push("refresh_frequency");	//No I18N
			if(!this.request_info.is_trashed) {
				includesArr.push("timer_getall");	//No I18N
			}
		} else {
			includesArr.push("requester_detail");
		}
		return includesArr;
	},

	getRLCTransition:function(woID) {
		try {
			$req.utils.ajax('/api/v3/requests/'+woID+'/_get_transitions', 'GET', false, false, function(data) { //NO I18N
	            if(data.transitions) {
		            $req.details.rlc.transitions =[];
		            for(var i=0; i<data.transitions.length; i++) {
		            	if(data.transitions[i].pre_rule_satisfied) {
		            		data.transitions[i].tooltip=e_html("<p class='mb0'>"+getMessageForKey("common.next.label",[getMessageForKey("sdp.requests.common.status")])+"</p><p class='mb10 sb'>"+e_html(data.transitions[i].target_node.name)+"</p><p class='text-muted'>"+e_html(data.transitions[i].help_text||" ")+"</p>");
		            		$req.details.rlc.transitions.push(data.transitions[i])
						}
					}
	            $req.details.rlc.isEnabled=true;
	            $req.details.rlc.lifecycle=$req.details.request_info.lifecycle;
	            $req.details.rlc.lifecycle.name=e_html($req.details.rlc.lifecycle.name);
	            }
	        });
		} catch (exception) {
			console.error(exception);
		}
	},

	get_status_mandate:function(woID, toStatus) {
		sdpAjax({
			url: '/api/v3/requests/'+woID+'/_status_mandatory_fields',//No I18N
			type: 'GET',//No i18n
			data: sdpAjaxInputData({"status_id": toStatus}) ,//No I18N
			async: false,
			cache: false,
            success: function(data) {
            	$req.details.status_mandate[toStatus] = data.status_mandatory_fields;
            },
            error: function() {
            	showalert('failure',getMessageForKey("sdp.dashboard.common.messages.outdatedpage"),'isAutoHide=false,delay=3');//NO I18N
            	delete $req.details.status_mandate[toStatus];
            }
        });
	},

	getClosureCode:function(woID) {
	    //SD-114033 : Storing all closure codes Iteratively.
		var start_index=1;
		var has_more_rows=false;
		var closureCodeArray = [];
		do{
			sdpAjax({
				url: '/api/v3/requests/'+woID+'/closure_code', // No I18N
				type: 'GET',	//No I18N
				async: false,
				cache: false,
				data: {
					input_data: sdpToJSON({
						list_info: {
							row_count: 100,
							start_index: start_index,
						}
					})
				},
				success:function(data) {
					for(var i=0;i<data.closure_code.length;i++){
						closureCodeArray.push(data.closure_code[i])
					}
					has_more_rows=data.list_info.has_more_rows;
    				start_index=start_index+100;
				}
			});
		}while(has_more_rows);
		$req.details.operational_data.request_closure_code = closureCodeArray;
	},

	getStatusJson:function(woID) {
    		var start_index=1;
    		var has_more_rows=false;
    		var statusArray=[];
    		do{
		sdpAjax({
			url: '/api/v3/requests/'+woID+'/status',	//No I18N
			type: 'GET',	//No I18N
			async: false,
			cache: false,
//SD-118310 When the request response due by time is elapsed, while invoking print preview the getStatusJson is passed without ID.
    			//Since the API is changed to sdpAjax, this error is thrown on UI. Previously the API call was failing but was not seen in UI. So handling it with ignorefailuremessage, and retaining the old behavior.
    			ignorefailuremessage:true,			data: {
				input_data: sdpToJSON({
					list_info: {
    						row_count: 100,
    						start_index: start_index,
					}
				})
			},
			success:function(data) {
                	for(var i=0;i<data.status.length;i++){
    					statusArray.push(data.status[i]);
    				}
    				has_more_rows=data.list_info.has_more_rows;
    				start_index=start_index+100;
            },
            error: function() {
            	/** failed to get the status set from the server, hence creating the status set with current status alone */
                	statusArray=[$req.details.request_info.status];
    				has_more_rows=false;
            }
        });
    	}while(has_more_rows);
    	$req.details.setStatusJson(statusArray);
    	$req.prop.status=statusArray;
	},

	setStatusJson: function(statusJson) {
		if(!statusJson) {
			return;
		}
		$req.details.operational_data.close_status_id = "-1";
		$req.details.operational_data.resolved_status_id = "-1";
		$req.details.operational_data.canceled_status_id = "-1";
    	var status_stop = [], status_running = {}, closed_resolved_status = [];

		for(var i=0,ilen = statusJson.length; i < ilen ;i++) {
            if(statusJson[i].internal_name === 'Closed') {
                $req.details.operational_data.close_status_id = statusJson[i].id;
            } else if(statusJson[i].internal_name === 'Resolved') {
                $req.details.operational_data.resolved_status_id = statusJson[i].id;
            } else if(statusJson[i].internal_name === 'Cancelled') {
                $req.details.operational_data.canceled_status_id = statusJson[i].id;
            } else if(statusJson[i].in_progress && statusJson[i].stop_timer) {
                status_stop.push(parseInt(statusJson[i].id));
            } else if(statusJson[i].in_progress && !statusJson[i].stop_timer) {
                status_running[statusJson[i].id] = statusJson[i].name;
            } else if(!statusJson[i].in_progress && !statusJson[i].stop_timer) {
               closed_resolved_status.push(parseInt(statusJson[i].id));
            }
        }

        $req.details.operational_data.closed_resolved_status = closed_resolved_status;
        $req.details.operational_data.status_stop = status_stop;
        $req.details.operational_data.status_running = status_running;
	},

    getRequestClosingRulesJson: function(async) {
	  	async = async ? true : false;
	  	$req.utils.ajax("/api/v3/request_closing_rules", "GET", async, false, function(data) {	//No I18N
	  		$req.details.request_closing_rules = data && data.request_closing_rules && data.request_closing_rules.length > 0 ? data.request_closing_rules[0] : {};
	  	});
    },

    /*
	 * Gets the basic Request information
	 * @param: woID - Request ID, for which the basic information needs to be fetched
	 * @param: includes - array of required extra information related to the Request
	 * @param: async - whether to invoke the api call in Asynchronized manner
	 */
	getRequestInfo: function(id, includes, async) {
		async = async ? true : false;
		var url;
		var url_key = "request";//No I18N
		if(includes && includes.length > 0) {
			var includesStr = sdpToJSON(includes);
			url = "/api/v3/requests/" + id + "/request_detail?includes=" + encodeURIComponent(includesStr);	//No I18N
			/** for non-login approval, approval_key needs to be sent for the authorization */
			if(typeof approval_key !== "undefined" && approval_key) {
				url += "&APPROVAL_KEY="+approval_key;	//No I18N
			}
			else if(typeof nmi_preview !== "undefined" && nmi_preview) {
				url += "&nmi_preview="+nmi_preview;	//No I18N
			}
			url_key = "request_detail"; //No I18N
		} else {
			url = "/api/v3/requests/"+id;	//No I18N
		}
		var successHandler = function(data) {
			if(data.response_status.status == "failed"){
				$req.utils.alert("failure",data.response_status.messages[0].message, "isAutoHide=false");       //NO I18N
				$req.details.is_loading_failed = true;
				return false;
			}
			if (data.response_status.status=="warning"){
				$req.details.req_warning=data.response_status.messages[0];
			}
			if(jQuery.isEmptyObject(data) || (data.response_status && data.response_status.status === "failed")) {
				$req.utils.alert("failure", getMessageForKey("sdp.request.invalidrequestid.error"), "isAutoHide=false");	//NO I18N
				setTimeout(function() {
					window.location.href = "/WOListView.do";	//NO I18N
				}, 3000);
				return false;
			}
			$req.details.is_loading_failed = false;
			if(jQuery.isArray(data.request_detail) && data.request_detail.length > 0) {
				data = data.request_detail[0];
			}
			if(data.hasOwnProperty("udf_mapping_names")){
				$req.details.udf_mapping_names=data.udf_mapping_names;
			}
			$req.details.request_info = data.request;
			$req.details.request_info.description = appendImageToken($req.details.request_info.description, $req.details.request_info.image_token);


			/** In case of the old merged id, the new merged ID should be opened */
			if($req.details.request_info && $req.details.request_info.id != id) {
				window.woID = woID = id = $req.details.request_info.id;
			}

			if(data && includes && includes.length > 0) {
				/** moving the "_links" to the last position in the array as it might have timer dependencies */
				var linksIndex = includes.indexOf("_links");
				if(linksIndex > -1) {
					includes.push(includes.splice(linksIndex, 1)[0]);
				}
				for(var i=0; i<includes.length; i++) {
					switch(includes[i]) {
						case "metainfo":	//No I18N
							/**
							 * WARNING: Do not access the metainfo properties directly from the below variable,
							 * as the type value for the fields may differ in server and client as per the client implementation.
							 * Always use $req.prop.getFieldMetaInfo method
							 */
							$req.details.meta_info = {};
							$req.details.meta_info.fields = data.metainfo && data.metainfo.metainfo ? data.metainfo.metainfo : data.metainfo;
							break;
						case "_links":	//No I18N
							$req.details.operational_data.links = $req.details.constructPermissionInfo(data._links);
							break;
						case "custom_menus":	//No I18N
							$req.details.operational_data.custom_menus = data.custom_menus ? data.custom_menus : [];
							break;
						case "asset_list":	//No I18N
							$req.details.asset_info = data.asset_list ? data.asset_list : null;
							$req.details.toolsAllowed = data.toolsAllowed ? data.toolsAllowed : null;
							break;
						case "nav_details":	//No I18N
							// TASK ID: 75113
							if (data.nav_details) {
								// load the navigation from local storage
								var req_list_view_data = Store.getItem("req_list_view_data"); // NO I18N
								if (req_list_view_data) {
									try {
										// load the navigation from local storage
										req_list_view_data = JSON.parse(req_list_view_data);
									} catch (error) {}
									if (Array.isArray(req_list_view_data)) {
										/** setting navigation information based on the available data - ordered array of requests */
										var curIndex = req_list_view_data.indexOf(id+""); // NO I18N
										if (curIndex > -1 && window.current_req_mode !== "combined") { // NO I18N
											$req.details.nav_next = curIndex === req_list_view_data.length - 1 ? null : req_list_view_data[curIndex + 1];
											$req.details.nav_prev = curIndex === 0 ? null : req_list_view_data[curIndex - 1];
										} else {
											$req.details.nav_prev = $req.details.nav_next = null;
										}
									} else {
										$req.details.nav_prev = $req.details.nav_next = null;
									}
								}
							}else {
								$req.details.nav_prev = $req.details.nav_next = null;
							}
							break;
						case "timer_getall":	//No I18N
							$req.details.timer_info = data.timer_getall ? data.timer_getall : [];
							break;
						case "request_associations":	//No I18N
							if(data.request_associations) {
						    	$req.details.request_associations = {};
						    	var assn_len = data.request_associations.length;
						    	try {
						    		/** setting associated entities info */
						    		if(assn_len > 0) {
										for(var j=0; j<assn_len; j++) {
										   $req.details.request_associations[Object.keys(data.request_associations[j])[0]] = data.request_associations[j][Object.keys(data.request_associations[j])];
							    		}
							    	}
						    	} catch(ex) {
						    		console.error(ex);
						    	}
						    }
							break;
						case "dependency":	//No I18N
			    			$req.details.request_info.has_pending_dependency = data.has_pending_dependency ? data.has_pending_dependency : false;
							break;
						case "close_mandatory":	//No I18N
							$req.details.close_mandatory_fields = data.close_mandatory && data.close_mandatory.close_mandatory_fields ? data.close_mandatory.close_mandatory_fields.fields : [];
					        break;
					     case "status":	//No I18N
					     	if(!data.status || !jQuery.isArray(data.status) || data.status.length === 0) {
					    		/** failed to get the status set from the server, hence creating the status set with current status alone */
					    		data.status = [$req.details.request_info.status];
					    	}
					     	$req.details.setStatusJson(data.status);
					     	$req.prop.status=data.status;
					     	break;
					    case "summary":	//No I18N
					    	$req.details.request_metrics = data.summary ? data.summary : {};
					    	break;
					    case "self_service_portal":	//No I18N
					    	$req.details.self_service_portal_settings = data.self_service_portal ? data.self_service_portal : {};
					    	break;
					    case "sort_info":	//No I18N
					    	$req.details.sort_info = data.sort_info ? data.sort_info : {};
					    	break;
						case "refresh_frequency":	//No I18N
							//Getting refresh timing from table, classic and combined personlization object
							var refreshingTime = null;
							var perObj = sdp_user.CLIENT_CONF.requestlistview;
							if (!jQuery.isEmptyObject(perObj)){
								// Refreshing table list (getting value from personalized and trigger the value)
								var view_mode = "table"; //No I18N
								if(perObj.current_view_mode){
									view_mode = perObj.current_view_mode;
								}
								var listInfoPerObject = view_mode === "combined" ? sdp_user.CLIENT_CONF.combined_requests : sdp_user.CLIENT_CONF.table_requests; //No I18N
								if (!jQuery.isEmptyObject(listInfoPerObject) && listInfoPerObject.refresh_time) {
									refreshingTime = listInfoPerObject.refresh_time;
								}
								$req.details.refresh_frequency = refreshingTime;
							}
							else if(sdp_user.CLIENT_CONF.table_requests && sdp_user.CLIENT_CONF.table_requests.refresh_time){
                                $req.details.refresh_frequency = sdp_user.CLIENT_CONF.table_requests.refresh_time;
                            }
							 else {
								$req.details.refresh_frequency = refreshingTime;
							}
					    	break;
					    case "request_template":	//No I18N
					    	$req.details.template_info = data.request_template ? data.request_template : {};
					    	break;
					    case "requester_detail":	//No I18N
					    	user_details = null;
					    	if(data.requester_detail && data.requester_detail.requester) {
					    		user_details = {};
				    			user_details.user = data.requester_detail.requester;
				    			if(data.requester_detail.metainfo) {
				    				user_details.metainfo = data.requester_detail.metainfo;
				    			}
				    			//Updating requester profile pic details from request response for request details page >> right panel requester profile pic
				    			//Incase of requester login, used API is failed in popup. Need to user profile pic details from requester partial data from request response.
				    			if(user_details.user.profile_pic && user_details.user.profile_pic.id && data.request.requester.profile_pic){
				    				user_details.user.profile_pic = data.request.requester.profile_pic;
					    	}
					    	}
					    	break;
					}
				}
			}
			if(data && data.current_time) {
				$req.details.server_time = data.current_time;
			}
		};
		$req.utils.ajax(url, "GET", async, false,successHandler,function(json) { //No I18N
		    var data = json.responseJSON;
			if(!jQuery.isEmptyObject(data) && data.response_status && data.response_status.status === "warning" && data[url_key]){ //In case of warnings, If response has request data, successHandler will be called & request details page will be rendered.
                   successHandler(data)
			}
			else if(!jQuery.isEmptyObject(data) && data.response_status && data.response_status.status === "failed"){
				$req.utils.alert("failure",data.response_status.messages[0].message, "isAutoHide=false");       //NO I18N
                setTimeout(function() {
                    window.location.href = "/WOListView.do";	//NO I18N
                }, 3000);
                return false;
			} else {
			    $req.utils.alert("failure", getMessageForKey("sdp.request.invalidrequestid.error"), "isAutoHide=false");	//NO I18N
                setTimeout(function() {
                    window.location.href = "/WOListView.do";	//NO I18N
                }, 3000);
                return false;
			}
		});
		if(isMSPOrSCP) {
			// setting $req.detals.account_info i.e. Request's Account Indormation in $req.details
			if(jQuery.isEmptyObject(this.request_info.account)) {
				// not associated to any account
				$req.details.account_info = {};
			} else {
				var accountId = this.request_info.account.id;
				$req.mspdetails.getAccountInfo(woID, accountId, async);
			}
		}
	},

	/*
	 * Gets the list of permitted operations for the user
	 */
	getWOLinks: function(woID) {
		$req.utils.ajax("/api/v3/requests/"+woID+"/_links", "GET", false, false, function(data) {	//No I18N
			if(data && data._links) {
				$req.details.operational_data.links = $req.details.constructPermissionInfo(data._links.links);
			}
		}, function() {
			/** Redirecting to Request list view due to the failure while fetching the Requst permission info */
			setTimeout(function() {
				var frameDetails = $req.common.getFrameDetails();
				if (frameDetails.externalframe) {
					if (frameDetails.internalframe) {
						top.$ReqPreview.closeRequestPreview('#req-details-preview');  //No I18N
					} else {
						window.location.href = "/WOListView.do?externalframe=true"; //No I18N
					}
				} else {
					window.location.href = "/WOListView.do"; //No I18N
				}
			}, 3000);
			return false;
		});
	},

	/*
	 * Gets the summary of the request --> link_request_count, dependency_count, notes_count, ...
	 */
	getRequestSummary: function(woID) {
		var data = $req.utils.ajax("/api/v3/requests/"+woID+"/summary", "GET", false, false, function(data) {	//No I18N
			$req.details.request_metrics = data && data.request_summary ? data.request_summary : {};
		});
	},

	/*
	 * Gets the association information of the request --> problem, project, change, purchase
	 */
  	getAssociationData: function(woID, module) {
  		if(!module) {
  			return;
  		}
  		$req.utils.ajax("/api/v3/requests/"+woID+"/"+((module=="project")?"projects":module), "GET", false, false, function(data) {	//No I18N
            var module_map = (module === "problem") ? "request_" + module + "_association" : module;	//No I18N
            if(module == "project"){
                module_map = "project_request_association";//No I18N
                module = "projects";//No I18N
            }
	    	if(data && data[module] && data[module].length > 0) {
	    		$req.details.request_associations[module_map] = data[module][0];
	    	} else {
	    		$req.details.request_associations[module_map] = {};
	    	}
  		});
	},

	/*
	 * Sets the Request Template type
	 */
	setTemplateModule: function() {
        if(this.request_info.is_service_request) {
			this.template_module = "SERVICE";	//NO I18N
		} else {
			this.template_module = "INCIDENT";	//NO I18N
		}
	},

	/*
	 * Gets the current request's template information
	 */
	getTemplate: function() {
		var url = "/api/v3/request_template_request/" + this.request_info.id;	//No I18N
		/** for non-login approval, approval_key needs to be sent for the authorization */
		if(typeof approval_key !== "undefined" && approval_key) {
			url += "?APPROVAL_KEY="+approval_key;	//No I18N
		}
		$req.utils.ajax(url, "GET", false, false, function(data) {	//No I18N
			$req.details.template_info = data && data.request_templates && data.request_templates.length > 0 ? data.request_templates[0] : {};
		});
	},

	/*
	 * Gets the Meta information for the fields like type, id, fafr_key, ...
	 */
	getMetaInfo: function() {
		$req.utils.ajax("/api/v3/requests/" + this.request_info.id + "/metainfo", "GET", false, false, function(data) {	//No I18N
			/**
			 * WARNING: Do not access the metainfo properties directly from the below variable,
			 * as the type value for the fields may differ in server and client as per the client implementation.
			 * Always use $req.prop.getFieldMetaInfo method
			 */
			$req.details.meta_info = data && data.metainfo ? data.metainfo : {};
		});
	},

	/*
	 * Gets the list of allowed values to be shown for each fields in Property
	 */
	getAllowedValues: function() {
		var templateId = this.request_info.template.id;
		var baseurl = "/servlet/SDAjaxServlet?";//No I18N
		if(isMSPOrSCP){
			var accountId='0';
			if(!jQuery.isEmptyObject(this.request_info.account))
			{
				accountId=$req.details.request_info.account.id;
			}
			else if(isMSP)
			{
				accountId = getAccountId();
			}

			baseurl= "/servlet/MSPSDAjaxServlet?WF_ACCOUNTID="+accountId+'&woID='+woID+'&';//No I18N
		}
		$req.utils.ajax(baseurl+"action=GetAllowedValues&module="+this.template_module+"&templateId="+templateId, "GET", false, false, function(data) {	//No I18N
			$req.details.allowedValues = data && data.FIELDOBJECT ? data.FIELDOBJECT : {};
		});
	},

	/*
	 * Gets the general settings information
	 */
	getSelfServiceInfo: function(woID, async) {
		async = async ? true : false;
		var data = $req.utils.ajax("/api/v3/requests/"+woID+"/self_service_portal_settings", "GET", async, false, function(data) {	//No I18N
			$req.details.self_service_portal_settings = data && data.self_service_portal_settings && data.self_service_portal_settings.length > 0 ? data.self_service_portal_settings[0] : {};
		});
	},

	/**
	 * Returns the responded time of the ticket, if any response is already done, else returns null
	 */
	getRespondedTime: function(context) {
		var request = context || this.request_info;
		return request.responded_time ? request.responded_time.value : null;
	},

	/**
	 * Returns the resolved time of the ticket, if ticket is resolved or completed already, else returns null
	 */
	getResolvedTime: function(context) {
		var request = context || this.request_info;
		return request.resolved_time ? request.resolved_time.value : (request.completed_time ? request.completed_time.value : null);
	},

	/*
	 * Constructs the permissions info based on the data available in _links
	 */
	 constructPermissionInfo: function(links) {
	 	if(!links) {
	 		return false;
	 	}
	 	links = $req.common.constructLinksInfo(links);

	 	try {
	 		/** adds worklog_timer - post permission, if there is no worklog timer is running for the loggedin user */
	 		if(links.worklog_timers && links.worklog_timers.get) {
		 		var can_post_wt = true;
		 		if($req.details.timer_info && $req.details.timer_info.length > 0) {
		 			for(var i=0, len=$req.details.timer_info.length; i<len; i++) {
		 				if($req.details.timer_info[i].owner.id == $req.sdp_user.LOGGEDIN_USERID) {
		 					can_post_wt = false;
		 					break;
		 				}
		 			}
		 		}
		 		if(can_post_wt) {
		 			links.worklog_timer = { post: { href: ""}};	//No I18N
		 		}
		 	}
	 	} catch(ex) {
	 		console.error(ex);
	 	}
	 	return links;
	 },

	/*
	 * Constructs the allowed tabs list to be displayed using the data available
	 */
	constructAllowedTabs: function() {
		var allowed_tabs = [];
		var tab_order = $req.layout.tabs;
		for(var i=0; i<tab_order.length; i++) {
			if(window.externalframe) {
				if($req.utils.external_load_exceptions.tabs.indexOf(tab_order[i]) > -1) {
					continue;
				}
			}
			switch(tab_order[i]) {
				case "details":	//No I18N
					allowed_tabs.push("details");	//No I18N
					break;

				case "resolution":	//No I18N
					var statusType = null;
					if(this.request_info.status != null && !this.request_info.is_trashed) {
						statusType = Handlebars.helpers.getStatusValue();
					}
					var resol_permitted = false;	/** Technician with the permission to view the resolution */
					if($req.sdp_user.USERTYPE === 'Technician' && $req.sdp_user.ROLES.indexOf("ViewSolutions") > -1) {
						resol_permitted = true;
					}

					/** if the resolution suggestion for tech is enabled and the request doesn't have any resolution, the bulb icon should be should be shown next to the Resolution in tab name */
		      		if(!this.request_info.is_trashed && resol_permitted && this.self_service_portal_settings.show_suggestions_to_technicians && this.request_info.status != null && statusType !== "Resolved" && statusType !== "Closed" && (!this.request_info.resolution || (this.request_info.resolution && !this.request_info.resolution.content))) {	//No I18N
						allowed_tabs.push("resolution_sugg");	//No I18N
					} else if(resol_permitted) {
						allowed_tabs.push("resolution");	//No I18N
					} else {
						allowed_tabs.push("resolution_req");	//No I18N
					}
					break;

				case "tasks":	//No I18N
					if(($req.sdp_user.USERTYPE === 'Technician' || $req.details.template_info.task_configurations.can_requester_view_tasks) && !this.request_info.is_trashed) {
						allowed_tabs.push("tasks");	//No I18N
					}
					break;

				case "worklogs":	//No I18N
					if($req.sdp_user.USERTYPE === 'Technician' || $req.sdp_user.ROLES.indexOf("ViewWorkLog") > -1) {
						allowed_tabs.push("worklogs");	//No I18N
					}
					break;

				case "approvals":	//No I18N
					if($req.sdp_user.USERTYPE === 'Technician') {
						if(!this.request_info.is_trashed && this.request_info.approval_status) {
							allowed_tabs.push("approvals");	//No I18N
						}
					} else if(this.self_service_portal_settings.show_approval_tab && this.request_info.approval_status) {
						allowed_tabs.push("approvals");	//No I18N
					}
					break;

				case "dependency":	//No I18N
					if($req.sdp_user.USERTYPE === 'Technician'&& !this.request_info.is_trashed && this.request_info.has_dependency) {
						allowed_tabs.push("dependency");	//No I18N
					}
					break;

				case "time_analysis":	//No I18N
					if($req.sdp_user.USERTYPE === 'Technician' && !this.request_info.is_trashed) {
						allowed_tabs.push("time_analysis");	//No I18N
					}
					break;

				case "history":	//No I18N
				if(!isMSPOrSCP || $req.details.self_service_portal_settings.can_view_request_history)
				{
					// always executed for SDP
					allowed_tabs.push("history");	//No I18N
				}
					break;
				case "checklists":	//No I18N
					if($req.sdp_user.USERTYPE === 'Technician' && !this.request_info.is_trashed) {
					allowed_tabs.push("checklists");	//No I18N
					}
					break;
			}
		}

		$req.details.operational_data.allowed_tabs = allowed_tabs;
		$req.details.operational_data.req_status_type = statusType;
	},
	/*
	 * Changes the request tab to the mentioned tab
	 * Parameters
	 *      1) tabName -> Tab to be changed.
	 *      2) options -> Metadata required when opening the tab to perform specific o
     perations such as directly open a specific sub-tab or directly go to "Add New Task" page.
     *      3) event -> event which invoked this function. It can be used to stop the
     tab switching, when some important pending work is there in the current tab.
     */
	changeTab: function(tabName, options, event, scrollTo, tabOptions) {
		/* checks if the unsaved Resolution is there in the tab and alerts the user */
		if(!this.checkResolutionChange(event)) {
			if(event && event.type === "popstate") {
    			var stateObj = { "tab": "resolution" };	//No I18N
    			window.history.replaceState(stateObj, "resolution", "#resolution");	//No I18N
    		}
			return false;
		}
		/* In few cases options value will be fetched from the parent object. This is to retain the value when the onpopstate (hash change) event calls this fn */
		if(!options && this.tab_options) {
			options = this.tab_options;
		}
		var default_tab = "details";	// No I18N

		/* checks if the user has permission to access the mentioned tab */
		if(tabName && !this.checkUserAccess(tabName)){
			tabName = '';	// No I18N
		}

		/* Storing options value to parent object to fetch later, if hash change event occurs */
		if(options !== undefined) {
			this.tab_options = options;
		} else {
			this.tab_options = null;
		}
		if(!tabName || tabName == "") {
			tabName = "details";	//No I18N
		}
		this.tab_name = tabName;
		if(tabName) {
			/* selecting respective tab to make active */
			if(tabName.indexOf("resolution") > -1) {
				if(jQuery("#"+tabName+"-tab").is(":visible")) {
					jQuery("#"+tabName+"-tab").sdtab("show");	// No I18N
				} else {
					jQuery("#resolution-sugg-tab").sdtab("show");	// No I18N
				}
			} else if(tabName === "properties") {	//No I18N
				jQuery("#details-tab").sdtab("show");	// No I18N
			} else {
				jQuery("#"+tabName+"-tab").sdtab("show");	// No I18N
			}

			/* Pushes the current url to the browser history list as the hash changes in the url wont't be added to the history by default */
			if(!(window.location.hash === "" && tabName === "details") && window.location.hash.substr(1) != tabName && !window.externalframe) {
				 var stateObj = { "tab": tabName, "id": parseInt(this.request_info.id, 10)};	//No I18N
				 /* TODO: Need to check if the tab options also should be pushed along with tabname */
				 window.history.pushState(stateObj, tabName, "#"+tabName);	//No I18N
				//window.location.hash=tabName;	// will trigger the onpopstate event, since it changes the history state in the browser. (only when the hash value changes)
			}
		}

		if(typeof window.resAttachInstance !== "undefined" && tabName === "details" && !(tabOptions && tabOptions.action === "AddAttach") ){ // NO I18N
			$req.details.updateAttachments(tabOptions);
		}
		if(tabOptions && tabOptions.action === "AddAttach"){
			jQuery("#desc-body .ip-drag").trigger("click");
		}

		/** destroying the resolution attachments */
		if(typeof window.resAttachInstance !== "undefined" && window.resAttachInstance instanceof attachPreview && !window.resAttachInstance.is_destroyed) {
			window.resAttachInstance.destroy(true);
		}

		var container = jQuery("#tab-content");	// No I18N
		container.html(ajaxBar());

		/** Hides all the sections */
		jQuery("#desc-section, #resource-section, #conversation-section, #property-section, #share-section , #asso-section , #tag-section").addClass("hide");
		jQuery("#tab-content").removeClass("hide");

		/* on detail fafr should applied */
		if($req.prop.editMode || $req.prop.checkResBulkEdit) {
		    /* on form load hiding FAFR could hide rightPanel Fields to */
		    //$req.rpanel.render();
		    $req.prop.render();
	    }
	    if($req.resource.checkResBulkEdit) {
		    $req.resource.resourceCancel();
		}
		//$req.prop.checkRightPanel = false;
		switch(tabName) {
			case "details" :	// No I18N
			case "properties":	//No I18N
			if($req.details.did_collab_notify_cancelled ){
				$req.details.navigateWO(window.woID);
				$req.details.did_collab_notify_cancelled = false;
			}else{
				jQuery("#tab-content").addClass("hide");
				jQuery('#desc-section, #conversation-section, #property-section, #share-section , #asso-section , #rlc-section, #tag-section').removeClass('hide');
				if(this.request_info.is_service_request && (($req.resource.resource_info.sections && $req.resource.resource_info.sections.length > 0) || $req.details.request_info.total_cost)) {
					jQuery('#resource-section').removeClass('hide');
				}
				if(jQuery("#show-more-desc").hasClass("hide") && !this.request_info.is_trashed) {
					/** wraps the description content, if it exceeds the height of 450px */
					$req.details.wrapDescriptionPanel();
				}
				/** Scrolls to conversation section when opened from the main listview conversation icon */
				if((window.location.hash === "#Conversation" || options && options.tab_data ==="Conversation") && jQuery("#conversation-section  .latest-conv").length > 0) {
					jQuery('html, body').stop( true, true ).animate({
						scrollTop: jQuery("#conversation-section  .latest-conv").offset().top - 100	//NO I18N
					}, 300);
				}
				$req.prop.checkResolutionStatus = false;

				/** scrolls to the properties section in details tab */
				if(tabName === "properties") {
					var ele = jQuery('#property-section');
					var container = window.externalframe ? jQuery("#req-details-preview") : jQuery('html, body');	//No I18N
					container.stop( true, true ).animate({
						scrollTop: ele.offset().top - 70
					}, 300, function() {
						/** Highlights Properties section by blinking the border of the Properties section */
						ele.css({ boxShadow: "#ffefe4 0px 0px 2px 5px" });	//NO I18N
    					setTimeout(function() {
        					ele.css({ boxShadow: "none" });	//NO I18N
    					}, 500);
        			});
				}
			}
			break;

			// case "properties" :	// No I18N
			// 	jQuery("#property-section").removeClass("hide");
			// 	jQuery("#tab-content").addClass("hide");
			// 	$req.prop.checkResolutionStatus = false;
			// 	if($req.prop.editMode && $req.prop.isOperationComplete){
			// 	    //$req.prop.sectionalCancel(true);
			// 	    /* on form load hiding FAFR could hide rightPanel Fields to */
			// 	    //$req.rpanel.render();
			// 	    $req.prop.render();
			//     }
			// break;

			case "approvals" :	// No I18N
				var url = "/WorkOrder.do?woMode=viewWOApproval&woID=" + this.request_info.id;	// No I18N
				container.html("<div id='approvalDetails'></div>");	// No I18N
				jQuery("#approvalDetails").html(ajaxBar());	//No I18N

				jQuery("#approvalDetails").load(url, function() {	//No I18N

		    	});
				/* JS in the loaded page will move the content to approvalDetails element */
			break;

			case "tasks" :	// No I18N
			case "worklogs" :	// No I18N
				var req_id = this.request_info.id;
				var site_id = null;
				if(this.request_info.site) {
					site_id = this.request_info.site.id;
				}
				if(this.request_info.is_trashed || window.print_mode) {
					/** Different url content for the print preview and trash mode */
					var url = "/workorder/RequestCost.jsp?woId="+req_id+"&siteId="+site_id;	// No I18N
					container.html("<div id='worklogDetails'><table width='100%'></table></div>");	// No I18N
					container.find("#worklogDetails > table").load(url, function() {
						$req.details.initWOTrash('worklog');	// No I18N
					});
				} else {
					if(tabName === 'tasks') {
                        container.html("<div id='tasksDiv'></div>");	// No I18N
                        jQuery("#tasksDiv").html(ajaxBar());	//No I18N
                        $tasks.loadTasks("list","request", req_id); //No I18N
                    } else if(tabName === 'worklogs') { //No I18N
                        container.html("<div id='worklogsDiv'></div>");	// No I18N
                        jQuery("#worklogsDiv").html(ajaxBar());	//No I18N
                        $tasks.loadWorkLog("list", "request", req_id); //No I18N
                    }
					/** scrolls to the top of the tab content */
					if(options && options.length > 0 || scrollTo) {
						jQuery('html,body').animate({
							scrollTop: (jQuery("#req-details-body").offset().top - 60) + "px"	//No I18N
						}, 200);
					}
				}
			break;

			case "dependency" :	// No I18N
				var req_id = this.request_info.id;
				var site_id = null;
				if(this.request_info.site) {
					site_id = this.request_info.site.id;
				}
				var url =  "/WODependencyDef.do?SubmitAction=getDependencyDetails&Module=request&AssociatedEntityId=" + req_id + "&scopeid=" + site_id +"&SUBREQUEST=true";	// No I18N
				container.html("<div id='dependencyDetails'></div>");	// No I18N
				jQuery("#dependencyDetails").html(ajaxBar());	//No I18N
				window.frames.SDPHeaderFrame.location.href=url;
				/** JS in the loaded page will move the content to dependencyDetails element */

				var sdpFrame = jQuery("iframe[name='SDPHeaderFrame']");	// No I18N
				sdpFrame.off("load");	// No I18N
				sdpFrame.on('load',function() {
					jQuery("#dependencyDetails").find('[nonce]').attr('nonce', parent.sdpNonce); //No I18N
					jQuery("#dependencyDetails").find("[snonce]").attr("snonce",parent.sdpNonce);
					/** For the Mickey Listview, the Column chooser option is overwritten to open at the absolute middle position */
					if(window._MENU_MODEL_MGR && _MENU_MODEL_MGR.hasOwnProperty("CCListInline")) {
						_MENU_MODEL_MGR.CCListInline.WINPARAMS = "position=absmiddle, modal=yes, title=Columns, transitionType=boxIn, transitionInterval=0.0,width=210,closePrevious=false";	//No I18N
					}
					initTooltip('#dependencyDetails');	// No I18N
				});
			break;

			case "resolution" :	// No I18N
				if($req.details.did_collab_notify_cancelled ){
					$req.details.navigateWO(window.woID,'resolution'); // NO I18N
					$req.details.did_collab_notify_cancelled = false;
				}else{
					container.html("<div id='resolutionDetails'></div>");	// No I18N
					jQuery("#resolutionDetails").html(ajaxBar());	//No I18N
					this.openResolutionTab(options);
				}
			break;

			case "time_analysis" :	// No I18N
				var url = "/WorkOrder.do?woMode=viewAssessmentHistory&woID=" + $req.details.request_info.id+'&externalframe=true';	// No I18N

                let time_analysis_ele = jQuery('<div id="time-analysis-ldr"></div><iframe id="wo-time-analysis" class="fw minh-100vh noborder" src="'+url+'" ></iframe>')     //NO i18N
				container.empty().append(time_analysis_ele);
				jQuery('#time-analysis-ldr').html(ajaxBar()); // NO I18N
				jQuery('#wo-time-analysis').load(function(){
					jQuery("#time-analysis-ldr").fadeOut(); //NO I18N
					// find iframe height
					var iframeHeight = jQuery(this).contents().find('body').height(); // NO I18N
					// set height
					jQuery(this).height(iframeHeight+100);
				});

			break;

			case "history" :	// No I18N
				var id = parseInt($req.details.request_info.id, 10);
				var url = "/common/ViewHistory.jsp?id="+id+"&module=requests&key=req_history_sort_order";//No I18N
				container.load(url);
			break;

			case "checklists" : // No I18N
				var id = parseInt($req.details.request_info.id, 10);
				var url = "/common/ChecklistDetails.jsp?id="+id+"&module=requests&submodule=checklists";//No I18N
				container.load(url);
			break;

			/** no hash value in URL */
			default :
				jQuery("#desc-section, #conversation-section").removeClass("hide");
				if(this.request_info.is_service_request){
					jQuery("#resource-section").removeClass("hide");
				}
				jQuery("#tab-content").addClass("hide");
			break;
		}
		/** To Release disable mode of RLC transition while moving to tab */
		jQuery('#right-panel .btn-transition').prop({disabled: false});//no i18n
		/** Reseting options of the tab to the default null value, since it is Tab specific */
		$se.page_scripts.render("rdp_page");
		this.tab_options = null;
		if(typeof woTabs !== "undefined") {
			/** Rearranging the WO tabs, as the selected tab from dropdown should be shown in the visible tab list */
			woTabs.reArrangeTab();
		}
		jQuery('#TaskGroupTechLayer').remove();
	},

	/*
	 * Updates to the mentioned tab in the argument - transitionToTab.
	 * if empty argument is passed, the current tab will be updated.
	 */
	updateTab: function(transitionToTab, load_complete_req, callback) {
		/** checks if there is any unsaved resolution content present in the page */
		if(!this.checkResolutionChange()) {
			return false;
		}
		var _self = this;
		if(!transitionToTab) {
			transitionToTab = window.location.hash;
			transitionToTab = transitionToTab.substr(1);
		}
		var layout = "#req-details-body";	//No I18N
		var url = "/workorder/WOTabDetails.jsp";	//No I18N
		if(load_complete_req) {
			/** reloads complete request section except the app header and the left panel listview */
			layout = "#content-panel";	//No I18N
			url = "/workorder/WODetails.jsp?woID="+woID;	//No I18N
		}
		jQuery(layout).load(url, function() {
			if(transitionToTab && transitionToTab != "default") {
				_self.changeTab(transitionToTab);
			} else {
				_self.changeTab();
			}
			CommonUIActions.wrapperResize( "toggleclick" ); //NO I18N
			if(typeof callback === "function") {
				callback();
			}
		});
		this.resetResourceAttrs();
	},

	/* resets resource attributes to false*/
	resetResourceAttrs:function(){
		$req.prop.didFetchResourceObj=false;
	},

	/*
	 * checks if the user can open the mentioned tab for the current Request ID
	 */
	checkUserAccess: function(tabName) {
		if(tabName == "resolution" || tabName == "properties" || (this.operational_data.allowed_tabs && this.operational_data.allowed_tabs.indexOf(tabName) > -1)) {
			return true;
		} else {
			return false;
		}
	},

	/*
	 * Opens the Resolution tab based on the information provided in the options argument
	 */
	openResolutionTab: function(options) {
		window.resolutiontab_click();
		var _self = this;
		var tab = "tab1";	// No I18N
		var params = null;
		var userType = "";
		var statusType = null;

		/** options object includes the resolution's sub-tab, url parameters, user type and the status type */
		if(options && options.length > 0) {
			tab = options[0] ? options[0] : "";
			params = options[1] ? options[1] : "";
			userType = options[2] ? options[2] : "";
			statusType = options[3] ? options[3] : null;
		} else {
			var allowedTabs = this.operational_data.allowed_tabs;
			if(allowedTabs && allowedTabs.indexOf("resolution") > -1) {
				statusType = this.request_info.status ? this.request_info.status.name : null;
			} else if(allowedTabs && allowedTabs.indexOf("resolution_req") > -1) {
				userType = $req.sdp_user.USERTYPE;
			}
		}

		var url = "/workorder/requestResolution.jsp?woID=" + this.request_info.id + "&isDetailsPage=true";	// No I18N
		if(externalframe){
			url += '&externalframe=true'; 	//No I18N
		}
		/** Resolution edit view */
		if(params && params.indexOf("editResolution=true") > -1) {
			url += "&editResolution=true";	//No I18N
		}
		if( statusType!=null && (statusType == "Resolved" || statusType == "Closed")) {
			url += "&reqStatusClose=true";	// No I18N
		}
		if(!this.request_info.resolution || !this.request_info.resolution.content) {
			url += "&hasResolution=false";	//No I18N
		}
		/** Resolution trash view */
		if(this.request_info.is_trashed) {
	    	url += "&woMode=trashWO";	// No I18N
	    }
		/* Below script copied from Request.js and modified a bit for the new UI */
		jQuery("#resolutionDetails").load(url, function() { // No I18N
			/* Detects the web page navigation */
			window.onbeforeunload = function() {
		        if (jQuery(".sdtab-content #ze_HTMLDesc_Focus").is(":visible") && (!jQuery(this).closest("ul").hasClass("nav-sdtabs")) && getResolnDescription() != "") {
					return "Changes are not saved"; // No I18N
				}
		    }
		    var req_id = _self.request_info.id;
		    var tech_id = null;
			if(_self.request_info.technician) {
				tech_id = _self.request_info.technician.id;
			}
			var site_id = null;
			if(_self.request_info.site) {
				site_id = _self.request_info.site.id;
			}
		    var resolURL = "/AddResolution.do?mode=viewWOResolution&associatedEntity=request&associatedEntityID="+req_id+"&module=request&woID=" + req_id + "&technicianID="+tech_id+"&from=WOResolution&scopeid="+site_id+"&isDetailsPage=true"; // No I18N
		    if(params) {
		    	resolURL = resolURL + params;
			}
			if(externalframe){
				resolURL +='&externalframe=true';  // No I18N
			}
		    if(window.fromListView && window.fromListView != "false") {
		        resolURL = resolURL + "&fromListView=true"; // No I18N
		    }
		    if($req.details.request_info.is_trashed) {
		    	resolURL = resolURL + "&woMode=trashWO";	// No I18N
		    }
		    if(!$req.details.request_info.is_trashed) {
		    	try {
		    		onloadResolutionEvents(jQuery("#requestId").text(),resolURL);	//NO I18N
					/* Binds the funciton for sub tab switching event and checks if any unsaved resolution is there */
					jQuery("#resolutionDetails .nav-sdtabs li").off("click").on("click", function(e) {// No I18N
						if(jQuery(".sdtab-content #ze_HTMLDesc_Focus").is(":visible")  && getResolnDescription() != ""){
							var rslt = confirm(getMessageForKey("sdp.requests.resolution.content.notsaved.alert"));// No I18N
							if (rslt == false) {
								e.preventDefault();
							}else{
								jQuery("#resolution_url").val(resolURL);	//NO I18N
								jQuery("#sln_Obj").val("");	//NO I18N
								req_rsln.tabSwitching(this,userType);
							}
						} else {
							req_rsln.tabSwitching(this,userType);
						}
					});
					/* loads the specified sub tab */
		    	} catch(ex) {
		    		console.error(ex);
		    	}
			    jQuery(".sugs-tabs").find("li[data-switch='"+tab+"']").trigger("click");	//NO I18N
			} else {
		    	jQuery("#resln_cont").load(resolURL, function() {	//No I18N
		    		$req.details.initWOTrash("resolution");	//No I18N
		    	});
		    }
		});
	},

	/*
	 * checks if the unsaved Resolution content is present in the current tab and alerts the user
	 */
	checkResolutionChange: function(event) {
        if(typeof $worklogForm !== 'undefined' && $worklogForm.worklogform_comp && !($worklogForm.worklogform_comp.is_destroyed) && $worklogForm.worklogform_comp.hasUnsavedData()) {
            $worklogForm.worklogform_comp.destroy()
        }
		if(jQuery(".sdtab-content #ze_HTMLDesc_Focus").is(":visible")  && getResolnDescription() != ""){
			var rslt = confirm(getMessageForKey("sdp.requests.resolution.content.notsaved.alert"));// No I18N
			if (rslt == false) {
				jQuery("#"+this.tab_name+"-tab").sdtab("show");
				if(event) {
					event.preventDefault();
					event.stopPropagation();
				}
				return false;
			} else {
				/** resets the background status update info */
				$req.prop.resetStatusFields();
				$req.prop.description = null;
				resolution_editor=null;
				if($req.prop.checkBulkEdit) {
					$req.prop.renderForm();
				}
			}
		}
		return true;
	},

	/*
	 * Renders the static message for the request if anything is there to display
	 */
	renderStaticMessage: function() {
		var msgData = {};
		msgData.request_info = this.request_info;
		msgData.sdp_user = $req.sdp_user;
		msgData.links = this.operational_data.links;
		msgData.externalframe = window.externalframe;
		/** Hides the empty section to show the sliding animation after rendering - This is applied when conversation/properties is updated */
		jQuery("#static-msg-panel").css("display", "none");	//No I18N
		jQuery("#static-warning-msg-panel").css("display", "none");	//No I18N
		renderhbs('#static-msg-panel', 'static-header-msg', msgData, false, 'requests', undefined, undefined, $req.details.bindEvents.templates.static_header_msg); //No I18N
		renderhbs('#static-warning-msg-panel', 'requester-cancel-requested-alert', msgData, false, 'requests', undefined, undefined, $req.details.bindEvents.templates.requester_cancel_request); //No I18N
		setTimeout(function() {
			if(jQuery("#static-msg-panel .msg-content").length > 0) {
				jQuery("#static-msg-panel").slideDown();
			}
			if(jQuery("#static-warning-msg-panel .msg").length > 0) {
				jQuery("#static-warning-msg-panel").slideDown();
			}
		}, 500);
	},

	/*
	 * Renders the Request's action header
	 */
	renderWOHeader: function() {
		var reqOperData = {};
		reqOperData.reqId = this.request_info.id;
		if(this.request_info.status != null && ( parseInt(this.request_info.status.id) == parseInt($req.details.operational_data.close_status_id)
			|| parseInt(this.request_info.status.id) == parseInt($req.details.operational_data.resolved_status_id)
			|| parseInt(this.request_info.status.id) == parseInt($req.details.operational_data.canceled_status_id)
				|| ($req.details.operational_data.closed_resolved_status && $req.details.operational_data.closed_resolved_status.indexOf(parseInt(this.request_info.status.id)) > -1)) ) {
			this.request_info.status.type = "Closed";
		}

		try {
			/** When the SSP option --- 'Create as a new request when Requester replies to the Closed Request" is enabled, below info are needed */
			if($req.sdp_user.USERTYPE === "Requester" && typeof this.operational_data.links.reply === "undefined" && (this.self_service_portal_settings.global_reopen_option === "New" || this.self_service_portal_settings.global_reopen_option === "TimePeriod")) { /** SD-109942, as for requester when status is disabled for viewing, status info will not be in request_details so using links to check if the request is closed */
				var recreate_new;
				var recreateTemplate = $req.details.request_info.template.id;
				if(isTemplateAvailable(this.request_info.template.id)) {
					/** If the current template is available for Requester, it will be used to recreate a the ticket */
					recreate_new = "Recreate";	//No I18N
				} else if(!this.request_info.is_service_request && !this.self_service_portal_settings.disable_default_template) {
					/** If the default template is available for Requester, it will be used to recreate a the ticket */
					recreate_new = "DefaultAlert";	//No I18N
					recreateTemplate = this.self_service_portal_settings.default_template_id;
				}
				if(!recreate_new) {
					/** If both current template and Default template are not available, then the page will be redirected to the respective Templates page */
					if(this.request_info.is_service_request) {
						recreate_new = "ServiceAlert";	//No I18N
					} else {
						recreate_new = "IncidentAlert";	//No I18N
					}
				}
				if(this.request_info.is_service_request && this.request_info.service_category) {
					reqOperData.serviceId = this.request_info.service_category.id;
				} else {
					reqOperData.serviceId = null;
				}
				reqOperData.recreate_new = recreate_new;
				reqOperData.recreateTemplate = recreateTemplate
			}
		} catch(ex) {
			console.error(ex);
		}

		reqOperData.links = this.operational_data.links;
		reqOperData.request_info = this.request_info;
		reqOperData.custom_menus = this.operational_data.custom_menus;
		reqOperData.nav_prev = this.nav_prev;
		reqOperData.nav_next = this.nav_next;
		if(isMSPOrSCP)
		{
			reqOperData.isMSPOrSCP = isMSPOrSCP
			var req_list_view_acc_data = Store.getItem("req_list_view_acc_data"); //No I18N
			if(req_list_view_acc_data && req_list_view_acc_data.length)
			{
				req_list_view_acc_data = JSON.parse(req_list_view_acc_data);
				reqOperData.nav_prev_acc = req_list_view_acc_data[this.nav_prev];
				reqOperData.nav_next_acc = req_list_view_acc_data[this.nav_next];
			}
		}
		reqOperData.kb_shorcuts = sdp_user.KB_SHORTCUTS;
		reqOperData.ssp = this.self_service_portal_settings;
		reqOperData.can_add_wlog = $req.details.operational_data.links && $req.details.operational_data.links.worklog && $req.details.operational_data.links.worklog.post ? true : false;
		reqOperData.timer_info = $req.details.timer_info;

		if(window.externalframe) {
			reqOperData.externalframe = window.externalframe;
		}else{
			reqOperData.externalframe = false;
		}

		reqOperData.exceptions = this.exceptions || {};

		if(sdp_user.ROLES.indexOf('ShareRequest') > -1) {
			reqOperData.can_share = true;
		}
		reqOperData.canEditLayout = (sdp_user.ROLES.indexOf("SDAdmin") > -1 || sdp_user.ROLES.indexOf("HelpdeskConfig") > -1) ? true : false;
  		if(this.request_associations && !jQuery.isEmptyObject(this.request_associations)) {
  			reqOperData.request_associations = this.request_associations;
  		}
  		reqOperData.canceled_status_id = this.operational_data.canceled_status_id;
  		reqOperData.sdp_user = $req.sdp_user;
  		reqOperData.fromListView = window.fromListView;
  		if(isMSPOrSCP) {
  			reqOperData.sdp_app = parent.sdp_app;
  			reqOperData.showReject = true;
  			if(isSCP) {
	  			reqOperData.showReject = false;
	  			if(!parent.sdp_app.IS_REQUEST_SHARING_MODULE_ENABLED) {
	  				reqOperData.can_share = false;
	  			}
  			}
  			// externalframe set as true when calling from Request Kanban list view
  			if($req.sdp_user.USERTYPE === "Technician" && !window.externalframe) {
	  			$req.mspdetails.renderMSPWorkOrderTopPanel();
	  		}
	  		$req.details.request_info.showAssociateContractMessage = false;
	  		if(!isSCP && jQuery.isEmptyObject(this.request_info.accountcontract)) {	// in SCP contract is not manually associated and is based on Product and Account
	  			if($req.details.operational_data.links.associate_contract && this.request_info.is_request_contract_applicable != undefined) {
			  		$req.details.request_info.showAssociateContractMessage = this.request_info.is_request_contract_applicable;
	  			}
	  		}
	  		if(!jQuery('#msp-content-panel').length > 0) {
	  			Hide('MSPWorkOrderTopPanel');	// No I18N
	  		} else {
	  			Show('MSPWorkOrderTopPanel');	// No I18N
	  		}
  		}
		reqOperData.show_rpanel = $req.layout.show_rpanel;
		reqOperData.fromAdvSearch = window.fromAdvSearch;
		reqOperData.canTechEdit = $req.layout.can_tech_edit;
		reqOperData.isAdmin = ($req.sdp_user.ROLES.indexOf("SDAdmin") !== -1 || $req.sdp_user.ROLES.indexOf("HelpdeskConfig") !== -1) ? true : false;
		reqOperData.customize_btn = ((reqOperData.isAdmin || (reqOperData.canTechEdit && sdp_user.USERTYPE == "Technician")) && !window.externalframe ) ? true : false; // No I18N
		reqOperData.show_restore_delete_btn = jQuery('#Notifications').length == 1; //NO I18N
		headerCallBack = function () {
		    $req.details.bindEvents.templates.header_actions_templates(reqOperData);
		}
  		renderhbs("#WOHeader", "header-actions-template", reqOperData, false, 'requests', true, undefined, headerCallBack); //No I18N


  		//For load view tag link in actions menu
  		if($req.sdp_user.USERTYPE === "Technician"){
			var actionMenu = jQuery(".req-actions-menu");
			if(actionMenu.find(".sublist").length == 2){
				var ul = jQuery("<ul>", {"class": "sublist"});
				ul.append(jQuery("#Req_Det_Tag").parent());
				var li = jQuery("<li>");
				li.append(ul);
				actionMenu.append(li);
				actionMenu.addClass("req-actions-associate");
			}
			var rtxt = ($req.sdp_user.ROLES.indexOf("ModifyRequests") == -1) ? "sdp.tag.view" : ($req.tags.data.length > 0) ? "sdp.tag.view" : "sdp.tag.add";// No I18N
	    	jQuery("#Req_Det_Tag").show().text(getMessageForKey(rtxt)).attr("data-i18n-key",rtxt);// No I18N
		}
	},

  	/*
	 * Renders Request's Header Details
	 */
  	renderWOHeaderDetails: function(from) {
  	    //SD-124278: Skeleton loader are not need for print preview page as the element was not present.
		if (jQuery("#req_details_skloader").length) {
			jQuery("#req_details_skloader").skLoader({template: true, type: "detailspage"}); //No I18N
		}
  		var headerDetails = {};
			headerDetails.request_info = $req.details.request_info;
			headerDetails.showDCChat = $req.details.self_service_portal_settings.show_dc_chat == true ? true : false;
			headerDetails.server_time = $req.details.server_time;
			headerDetails.showLinkDet = window.showLinkDet;
			headerDetails.showDetails = window.showDetails;
			headerDetails.print_mode = window.print_mode ? true : false;
			headerDetails.show_rpanel = $req.layout.show_rpanel;
			headerDetails.externalframe = !!window.externalframe;
			headerDetails.portalURL = window.isMDHSetup && window.isMDHSetup === "true" ?  "&PORTALID="+window.PORTALID:""; // No I18N
			renderhbs("#headerbar", "details-header-template", headerDetails, false, 'requests', true, null, $req.details.bindEvents.templates.details_header_template); //No I18N
  		if(isMSPOrSCP) {
  			headerDetails.change_request_billing_contract = $req.details && $req.details.self_service_portal_settings ? $req.details.self_service_portal_settings.change_request_billing_contract : {};
  			headerDetails.contract_info = $req.details.contract_info;
	  		renderhbs("#MSPWOHeader", "msp-req-header-det-template", headerDetails, false, 'msprequest');	// No I18N
	  	}
  		if($req.details.request_info.service_sla) {
  			setTimeout(function() {
				jQuery("#service_sla").on("hover", function() {
					$req.details.addSLAInfo();
				});
  			}, 10);
  		}
		$req.common.setWarningHeader({element:"reqWarning"},$req.details.req_warning,$req.details.meta_info.fields);//NO i18N
  	},

  	/*
  	 * Renders Request's Tabs list
  	 */
  	renderTabs: function() {
  		this.constructAllowedTabs();
  		var tabsJSON = {};
  		tabsJSON.request_info = this.request_info;
  		tabsJSON.sdp_user = $req.sdp_user;
  		tabsJSON.operational_data = this.operational_data;
  		if($req.sdp_user.USERTYPE === "Technician") {
  			tabsJSON.request_metrics = $req.details.request_metrics;
  			if(window.isMSPOrSCP) {
  				$req.details.request_metrics.is_worklog_count_enabled=sdp_feature_status.is_worklog_count_enabled;
  			}
  		}
		tabsJSON.kb_shorcuts = sdp_user.KB_SHORTCUTS;
  		renderhbs("#tabs-primary", "wo-tabs-template", tabsJSON, false, 'requests', undefined, undefined, $req.details.bindEvents.property_templates.wo_tabs_template);	// No I18N
  		SdpWidgets.renderHelpers.renderWidgetHeader({
			location:"request.detail.tab",//No i18n
			element:"#tabs-primary-list",//No i18n
			type:"tab",//No i18n
			append:true,
			data:{
                module:"request",//No i18n
                containerId:"tab-content",//No i18n
                clearContainer:true,
                entity_id:$req.details.request_info.id
            }
		});
  		/* For getting resolution suggestion */
  		setTimeout(function() {
  			if(tabsJSON.operational_data.allowed_tabs && tabsJSON.operational_data.allowed_tabs.indexOf("resolution_sugg") > -1 && !tabsJSON.request_info.is_trashed) {
  				isSuggestionsAvailable(tabsJSON.request_info.id);
  			}
  		}, 100);
  	},

  	/*
  	 * Renders Request Description
  	 */
  	renderDescription: function() {
  		var templateData = this.request_info;
		templateData.usertype = $req.sdp_user.USERTYPE;
		if(!jQuery.isEmptyObject(this.operational_data)) {
			templateData.replyAllowed = this.operational_data.links && this.operational_data.links.reply && this.operational_data.links.reply.post ? true : false;
			templateData.showRecommendTemplate = this.operational_data.links && this.operational_data.links.recommend_template_button && this.operational_data.links.recommend_template_button.post ? true : false;
		}
		templateData.print_mode = window.print_mode ? true : false;
		templateData.externalframe = window.externalframe ? true : false;
		if(window.isMSPOrSCP) {
			templateData.is_unapproved_requester_enabled= typeof sdp_feature_status === 'undefined' ? parent.sdp_feature_status.is_unapproved_requester_enabled : sdp_feature_status.is_unapproved_requester_enabled;// unapproved requester feature check // No I18N
		}
		renderhbs("#desc-header", "desc-header-template", templateData, false, 'requests/properties', true, null, $req.details.bindEvents.property_templates.desc_header_template);	// No I18N
		renderhbs("#desc-body", "desc-body-template", templateData, false, 'requests/properties', null, null, $req.details.bindEvents.property_templates.desc_body_template);	// No I18N
		renderhbs("#desc-actions", "desc-actions-template", templateData, false, 'requests/properties', null, null, $req.details.bindEvents.property_templates.desc_actions_template);	// No I18N

		var attach_options = {
			"entity" : "requests", // No I18N
			"api" : false, // No I18N
			"is_odapi": true,	//No I18N
			"is_odapi_v2":true, //No I18N
			"upload_api" : true, //No I18N
			"direct_upload": true,	//No I18N
			"entity_id": $req.details.request_info.id, // No I18N
			"rerenderOnUpload": false,	//No I18N
			"description":true, // NO I18N
			"drop_element" : "#req-desc-panel", //No I18N
			/** Enable Role Check when upload attachments */
			"upload" :  (!$req.details.request_info.is_trashed && $req.details.operational_data.links && $req.details.operational_data.links.attachments && $req.details.operational_data.links.attachments.post) ? true : false , //No I18N
			"enable_delete" :  (!$req.details.request_info.is_trashed && $req.details.operational_data.links && $req.details.operational_data.links.edit && $req.details.operational_data.links.edit.put && $req.sdp_user.USERTYPE === "Technician") ? true : false, //No I18N
			"onupload": ['$req.details.updateAttachments', window],	//No I18N
			"ondelete": ['$req.details.updateAttachments', window],	//No I18N
			"description_viewimages": "req-desc-body",	//No I18N
		};
		if(window.print_mode) {
			$req.print.update("description");	// No I18N
			attach_options = {
				"upload": false, // No I18N
				"enable_delete" : false, //No I18N
				"download" : false, //No I18N
				"print_preview": true,	//No I18N
				"description_viewimages": "req-desc-body",	//No I18N
			};
		}
		try {
			this.attachInstance && this.attachInstance instanceof attachPreview && this.attachInstance.destroy();
			/** initializing the attachment component for the Request's Attachments */
			this.attachInstance = new attachPreview('#attachment-api',attach_options); //No I18N
			//118119 -- RTA section Zoho color contrast changes updated
			ThemeCustomizer.zcontrastcolorinit("#req-desc-body");// NO I18N
		} catch(ex) {
			console.error(ex);
		}
  	},

	requesterCloseRequest:function(closeRequest){
		if(!closeRequest){
			$req.prop.submitCloseAccepted();
			return;
		}
		this.renderCloseResolvedStatusPopUp();
		$req.prop.checkCloseAccept();
	},

  	renderCloseResolvedStatusPopUp: function(){
        //var closeJson = $req.prop.processedWOCloseJSON();
        var closeJson = {};
	    closeJson.request_info = $req.details.request_info;
	    closeJson.operational_data = $req.details.operational_data;
	    closeJson.self_service_portal_settings = $req.details.self_service_portal_settings;
	    closeJson.request_closing_rules = $req.details.request_closing_rules;
	    closeJson.sdp_user = sdp_user;
	    if(isSCP)
	    {
	    	 closeJson.closeWithoutNotif = $req.prop.closeWithoutNotif;
	    }
            renderhbs("#wo-close-options", 'close-popup-content', closeJson, false, 'requests/properties', null, null, $req.details.bindEvents.property_templates.close_popup_content); //NO I18N
    },

    renderOnholdStatusPopUp: function(){
        if(!$req.details.request_info.is_trashed && !window.print_mode) {
            var _woOnHoldJSON = {};
	        _woOnHoldJSON.request_info = $req.details.request_info;
            _woOnHoldJSON.operational_data = $req.details.operational_data;
            _woOnHoldJSON.self_service_portal_settings = $req.details.self_service_portal_settings;
            /* updated Values*/
            var schedule = getMessageForKey("sdp.requests.onhold.noschedule");
            var onHoldComments = getMessageForKey("sdp.requests.onhold.nocomments");
            var user = getMessageForKey("sdp.requests.onhold.nouser");
            var rowJSON = false;
            var scheduler = $req.details.request_info.onhold_scheduler;
            if(scheduler !== null && scheduler !== undefined && scheduler.scheduled_time !== null && scheduler.scheduled_time !== undefined){
	            if(!Object.keys($req.details.allowedValues).length){
                    $req.details.getAllowedValues();
                }
                schedule = getMessageForKey("sdp.workorder.onholdschedule.operation");
                var name = scheduler.change_to_status ? scheduler.change_to_status.name : "";
                schedule = schedule.replace('{0}','<b>'+e_html(name)+'</b>');
                schedule = schedule.replace('{1}','<b>'+scheduler.scheduled_time.display_value+'</b>');
                user = getMessageForKey("sdp.workorder.onholdschedule.user");
                if(scheduler.held_by) {
                	schedule = schedule.replace('{2}','<b>'+e_html(scheduler.held_by.name)+'</b>');
	                user = user.replace('{0}','<b>'+e_html(scheduler.held_by.name)+'</b>');
                }
                onHoldComments = scheduler.comments;
                if(onHoldComments !== null && onHoldComments !== undefined) {
                	onHoldComments = onHoldComments.replace(/&#10;/g,'\n');
                }
                rowJSON = true; // rowJson check that when we open the onhold image then we have to open onhold edit window or onhold scheduler popup
            }
            _woOnHoldJSON.schedule = schedule;
            _woOnHoldJSON.on_hold_comment = onHoldComments;
            _woOnHoldJSON.user = user;
            _woOnHoldJSON.rowJSON = rowJSON;
            _woOnHoldJSON.openStatusId = $req.details.operational_data.status_running;
            if($req.details.rlc.isEnabled){
            		sdpAjax({
            			url: '/api/v3/requests/'+woID+'/_get_connected_statuses',//No i18n
            			type: 'GET',//No i18n
            			async:false,
            			data: sdpAjaxInputData({"status_id":$req.prop.wizard.toStatus||$req.details.request_info.status.id,"nodes_list_info":{"row_count":100,"search_criteria":[{"field":"in_progress","value":true,"condition":"is"},{"field":"stop_timer","value":false,"condition":"is","logical_operator":"and"}]}}),//No i18n
            			success:function(data){
            				_woOnHoldJSON.openStatusId={};
            				for(var i=0;i<data.statuses.length;i++){
            					_woOnHoldJSON.openStatusId[data.statuses[i].id]=data.statuses[i].name;
            				}
            			}
            		});
            }
            var date = new Date();
            _woOnHoldJSON.currentMiliseconds = date.getTime();
            renderhbs('#wo-status-hold', 'status-onhold-template', _woOnHoldJSON, false, 'requests/properties'); //NO I18N
        }
    },

	/*
	SD - 82735 Fix
	Used to call the ReOpen Convienience Operation for Tech
	*/
	reOpenRequest:function(){
			sdpAjax({
    				headers: { Accept: 'application/v3+json' }, //NO I18N
    				type: 'PUT', //NO I18N
    				url: '/api/v3/requests/'+$req.details.request_info.id+'/_reopen',//No I18N
    				success:function(data){
    					$req.prop.checkSubmitMsg = data && data.response_status ? data.response_status.status : "";	//No I18N
    					if($req.prop.checkSubmitMsg === 'success') {
    						$req.utils.alert("success", getMessageForKey("request.updated"),"isAutoHide=true"); //NO I18N
    					}
    					if($req.prop.checkSubmitMsg === 'warning' && data && data.response_status && data.response_status.messages && data.response_status.messages[0] && data.response_status.messages[0].message) {
    						setTimeout(function() {
    							$req.utils.alert("warning", data.response_status.messages[0].message, "isAutoHide=true, delay=5"); //NO I18N
    						}, 2000);
    					}
    					setTimeout(function(){
    					    $req.details.navigateWO($req.details.request_info.id);
                        	},500);
    				}
    			});

  },



  	/*
  	 * Dynamic updation of the selective templates alone based on the recent operations performed
  	 */
  	updateRequestTemplates: function(module, options) {
  		if(module === "problem" || module === "change" || module === "project") {	//NO I18N
  			this.getRequestInfo(woID, ["_links"]);	//No I18N
		    if(module === "change") {
		    	this.getAssociationData(woID, "request_caused_by_change");	//No I18N
		    	this.getAssociationData(woID, "request_initiated_change");	//No I18N
		    } else {
		    	this.getAssociationData(woID, module);
		    }
			$req.rpanel.render();
			if(!$req.layout.show_rpanel || window.externalframe){
				var associationsData = $req.rpanel.techAssociations();
				if(associationsData.length){
					let afterRenderCallback =()=>{
						$req.details.bindEvents.templates.association_details(associationsData);
					}
				    renderhbs('#asso-section', 'association-details', associationsData, false, 'requests',null,null,afterRenderCallback); //No I18N
					jQuery("#asso-section").addClass("section-padding").prepend('<div class="ml10 mr15"><strong id="assoSecHeader" data-i18n-key="sdp.project.associations.tabname">'+getMessageForKey("sdp.project.associations.tabname")+'</strong><hr class="mt10 mb15"></div>');
				}
			}
		    this.renderWOHeader();
		} else if(module === "dependency" || module === "dissociate_dependency" || module === "remove_dependency") {	//No I18N
		    this.getRequestInfo(woID, ["_links", "summary"]);	//No I18N
		    this.renderTabs();
		    if(module == "remove_dependency") {
			    jQuery("#tab-content").empty();	//No I18N
			    jQuery("#WODependencyDetails_Impl").remove();	//No I18N
			    this.changeTab();
			    parent.frames[parent.ROOT_VIEW_ID + "_RESPONSEFRAME"].location.href = "about:blank";	//NO I18N
		    } else {
		    	this.changeTab("dependency");	//No I18N
		    }
		    woTabs.reInitialize();
		} else if(module === "link_requests") {	//No I18N
			this.getRequestInfo(woID, ["_links"]);	//No I18N
		    this.getRequestSummary(woID);
		    this.renderWOHeader();
			if($req.layout.show_rpanel){
				$req.rpanel.render();
			}
			else{
				var associationsData = $req.rpanel.techAssociations();
				if(associationsData.length){
					let afterRenderCallback =()=>{
						$req.details.bindEvents.templates.association_details(associationsData);
					}
				    renderhbs('#asso-section', 'association-details', associationsData, false, 'requests',null,null,afterRenderCallback); //No I18N
					jQuery("#asso-section").addClass("section-padding").prepend('<div class="ml10 mr15"><strong id="assoSecHeader" data-i18n-key="sdp.project.associations.tabname">'+getMessageForKey("sdp.project.associations.tabname")+'</strong><hr class="mt10 mb15"></div>');
				}
			}
		} else if(module === "attachments") {	//No I18N
			this.getRequestInfo(woID);
			this.renderDescription();
			$req.rpanel.render();
			jQuery("#_DIALOG_LAYER").empty();	//No I18N
		} else if (module === "assign_technician") {	//No I18N
			this.getRequestInfo(woID);
			$req.rpanel.render();
			this.updateTab();
		} else if(module === "purchase") {	//No I18N
			this.getRequestSummary(woID);
			this.getWOLinks(woID);
			if($req.layout.show_rpanel){
				$req.rpanel.render();
			}
			else{
				var associationsData = $req.rpanel.techAssociations();
				if(associationsData.length){
					let afterRenderCallback =()=>{
						$req.details.bindEvents.templates.association_details(associationsData);
					}
				    renderhbs('#asso-section', 'association-details', associationsData, false, 'requests',null,null,afterRenderCallback); //No I18N
					jQuery("#asso-section").addClass("section-padding").prepend('<div class="ml10 mr15"><strong id="assoSecHeader" data-i18n-key="sdp.project.associations.tabname">'+getMessageForKey("sdp.project.associations.tabname")+'</strong><hr class="mt10 mb15"></div>');
				}
			}
		} else if(module === "tasks") { //No I18N
			/** on updating any tasks status, we fetch the updated summary info and rerender the Right Panel */
			if($req.details.tab_name === "tasks") {	//No I18N
				this.getRequestSummary(woID);
				$req.rpanel.render();
			}

		} else if(module === "checklists") { //No I18N
			/** on updating any checklists status, we fetch the updated summary info and rerender the Right Panel */
			if($req.details.tab_name === "checklists") {	//No I18N
				this.getRequestSummary(woID);
				$req.rpanel.render();
			}

		} else if(module == "notes") {	//No I18N
				this.getRequestInfo(woID);	//No I18N
				$req.prop.render();
		} else if(module == "conversation") {	//No I18N
			this.getRequestInfo(woID, ["_links"]);	//No I18N
			this.renderWOHeader();
			this.updateTab();
			this.renderStaticMessage();
			$req.rpanel.render();
			if(!this.request_info.has_draft && jQuery("#drafts-content").is(":visible")) {
				jQuery("#drafts-content").empty();
				this.toggleDraft(false);
			}
			this.loadServerMessage();
		} else if(module == "draft") {	//No I18N
			this.getRequestInfo(woID);
			this.renderDescription();
			if(jQuery("#show-more-desc").hasClass("hide")) {
				/* wraps the description content, if it exceeds the height of 450px */
				$req.details.wrapDescriptionPanel();
			}
			if(this.request_info.has_draft) {
				this.renderDrafts(true);
			} else {
				if(jQuery("#drafts-content").is(":visible")) {
					jQuery("#drafts-content").empty();
					this.toggleDraft(false);
				}
			}
		} else if(module == "property") {	//No I18N
		      if ($notification_popup.isOpen) {
                   $req.prop.resetReplyTemplateStatus(); //Resting reply template status if popup is on open.
              }
			this.getWOLinks(woID);
			this.getRequestSummary(woID);
			window.setHTMLProperties();
			this.renderWOHeader();
			this.renderWOHeaderDetails();
			var scrollPos = window.pageYOffset;
			var afterRender = function(){
				$req.rpanel.render();
				window.scrollTo(window.pageXOffset, scrollPos);
				if($req.details.request_info.has_draft) {
					$req.details.renderDrafts();
				}
				if(options && options.indexOf("status") > -1) {
					$req.header.getPendingRequestCount();
				}
			}
			/** After clicking the more properties. while updating the request properties Conversation is loaded. This issue occurred in the released build also. that's why we have included the properties check **/
			if(($req.details.tab_name === "details" || $req.details.tab_name === "properties") && (!options || options.indexOf("assign_comments") === -1)){
				$req.prop.render();
			 	if(options && options.indexOf("description") > -1) {
			 		$req.details.renderDescription();
			 	}
			 	/** SD-87418 - Asset name automatically deleted on consecutive updation */
			 	if(options && options.indexOf("assets") > -1) {
			 		window.chosenCIs = $req.prop.setSelectedAssets();
			 	}
			 	afterRender();
			}else{
				this.updateTab(null, false, function() {
					afterRender();
				});
			}
			this.renderStaticMessage();
			if(!$req.layout.show_rpanel){
				var rlcData = $req.rpanel.rlcTransitions();
				if(rlcData.isEnabled){
				    let afterRenderCallback = function() {
					$req.details.bindEvents.templates.rlc_transitions(rlcData);
                    }
				    renderhbs('#rlc-section', 'rlc-transitions', rlcData, false, 'requests', true, null, afterRenderCallback); //No I18N
				}
			}
			//To re render the resources starts
			$req.resource.render();
			$CS.hideUnansweredFields(["resources"]); //No I18N
			//To re render the resources ends
		} else if(module == "approvals") {	// No I18N
			this.getRequestInfo(woID);
			this.renderWOHeader();
			this.updateTab("approvals", false, function() {	//No I18N
				$req.rpanel.render();
			});
		    woTabs.reInitialize();
		} else if(module == "add_closure") {	//No I18N
			this.getRequestInfo(woID);
			this.updateTab(null, false, function() {
				$req.rpanel.render();
			});
		}
		this.did_modify = true;
	},

	/*
	 * Wraps the description content based on the following conditions
	 * 1) if the conversation is present and the description height exceeds 200px, then restrict the description height to 150px
	 * 2) if the conversation is not present and the description height exceeds 450px, theb restrict the description height to 500px
	 */
	wrapDescriptionPanel: function() {
		if(this.request_info.has_conversation) {
			var descEle = jQuery("#desc-body .panel-body");	//No I18N
			var descHeight = jQuery("#desc-content").height();
			if(descHeight > 450) {
				descEle.css({"height": "400px", "overflow": "hidden"});	//No I18N
				jQuery("#show-more-desc").removeClass("hide");	//No I18N
			} else {
				jQuery("#show-more-desc").addClass("hide");	//No I18N
			}
			stickyRightPanel();
		}
	},

	/*
	 *	Unfurls the wrapped description content to display the full description
	 */
	showFullDescription: function() {
		var descEle = jQuery("#desc-body .panel-body");	//No I18N
		var descHeight = descEle.prop("scrollHeight");	//No I18N
		descEle.animate({
			"height": descHeight+"px"	//No I18N
		}, 500, function(){
			descEle.css({"height": "auto", "overflow": "auto"});	//No I18N
		});
		jQuery("#show-more-desc").addClass("hide");	//No I18N
	},

	/*
	 * Scrolls to the attachments section on clicking the attachment icon
	 */
    scrollToDescAttachments: function(element, event, container) {
        var self = this;
        var doScroll = function() {
            timeout = 1;
			/** If the show more is opened, give some time to open */
            if (jQuery("#show-more-desc").is(":visible")) {
                self.showFullDescription();
                timeout = 500;
            }
            setTimeout(function() {
                scrollToAttachments(element, container);
            }, timeout);
        };
		/** If the description is open */
        if (jQuery("#desc-header").closest('.zcollapsiblepanel').hasClass("is-selected")) {
            if (event) {
                event.stopPropagation();
            }
            doScroll();
        } else {
			/** If the description is closed, then give some time to open, then scroll to attachments */
            setTimeout(function() {
                doScroll(700);
            }, 500);
        }
    },

    /*
     * Fetches the drafts for the Request and renders them in to the document
     */
    renderDrafts: function(open) {
    	$req.utils.ajax("/api/v3/requests/"+woID+"/drafts", "GET", true, true, function(data) {	//No I18N
    		if(data && data.response_status && data.response_status.length > 0 && data.response_status[0].status === "success") {
    			var draftsJson = {};
				draftsJson.drafts = data.drafts;
    			draftsJson.user_id = sdp_user.LOGGEDIN_USERID;
    			draftsJson.woID = woID;
    			renderhbs("#drafts-content", "drafts-template", draftsJson, false, 'requests/properties', true, null, $req.details.bindEvents.property_templates.drafts_template);	//No I18N
    			jQuery("#drafts-content").slideDown(300);

    			/** checks whether to unfurl the drafts section after render */
    			if(open) {
    				$req.details.toggleDraft();
    			}
    		}
    	});
    },

    /*
     * Toggles the draft list section at the top of the request details
     */
    toggleDraft: function(open ){
    	if(open === false) {
    		if(jQuery("#drafts-content").is(":visible")) {
    			jQuery("#drafts-content").slideUp(300);
    		}
    		return;
    	}
		if(!this.request_info.has_draft) {
    		return;
    	}
    	if(jQuery("#draft-count-panel").is(":visible")) {
    		jQuery("#draft-count-panel").hide();
    		jQuery("#drafts-list").slideDown(300);
    	}

    	/** scrolls to the top of the page and highlights the draft section */
    	jQuery('html, body').animate({
			scrollTop: 0
		}, 300, function() {
			var draft_ele = jQuery("#drafts-content > div:first");	//No I18N
			var currentBorder = draft_ele.css("border-color");	//No I18N
			draft_ele.animate({
				"borderColor": "#a2d4ff"	//No I18N
			}, 300, function() {
				draft_ele.animate({
					"borderColor": currentBorder	//No I18N
				}, 300);
			});
		});
    },

    /*
     * Common function to remove the unnecessary elements and the actions from the elements to render the Trash view of the request based on the module passed as the argument
     */
    initWOTrash: function(template) {
    	switch(template) {
    		case 'WOHeader': 	// No I18N
    			jQuery('#actionsBar > div:first > div').remove();	// No I18N
    			jQuery('#actionsBar .watermark').removeClass('fr').addClass('fl');	// No I18N
    		break;
    		case 'worklog': 	// No I18N
    			jQuery('#worklogDetails table:first').find('tr:eq(1) div:first').css('margin-top','0px');	// No I18N
    			jQuery('#AddMileStone_Tasks_btn > span').remove();	// No I18N
    			jQuery('.tableComponent tr:first > th:last').find('td:eq(-1), td:eq(-2)').remove();	// No I18N
    		break;
    		case 'resolution': 	//No I18N
    			jQuery('#tab1').addClass('active').siblings().removeClass('active');	// No I18N
    			jQuery('.sugs-tabs .sdtabs-ui2').hide();	//No I18N
		    	jQuery('#resolutionDetails').find(".searchHide").hide();	// No I18N
    		break;
    		case 'share_request': 	// No I18N
    			jQuery('#share-request .share-edit').remove();	// No I18N
    		break;
    	}
    },

    /*
     * Loads the recent message from server that needs needs to be shown
     */
    loadServerMessage: function() {
    	jQuery("#dynamic-message").load("/workorder/WOMessage.jsp");	//No I18N
    },

    /*
  	 * Notifies the user about the operation done before loading this page
  	 */
	showOperationMessage :function(message, type) {
		if(!message) {
			return;
		}
		switch(message) {
	  		case "merge_request": 	// No I18N
	  			/** showing the message for the merging request action */
	  			if(oldWoID && oldWoID != "null") {
	  				$req.utils.alert("success", getMessageForKey('sdp.workorder.history.mergewith', [oldWoID]), "isAutoHide=true, delay=15");	// No I18N
	  			}
		  		break;
	  		default:
	  			/** for split as new request message, the newly created Request id should be shown with link */
	  			var split_msg = getMessageForKey("sdp.request.split.successmsge");
	  			if(message.indexOf(split_msg.substring(0, split_msg.length - 3)) > -1) {
	  				var split_id = message.substring(message.lastIndexOf(":") + 1, message.length);
	  				/** removing commas in the newly split request ID */
	  				var split_arr = split_id.split(",");
					split_id = split_arr.join("");
	  				message = message.substring(0, message.lastIndexOf(":") + 1) + " <b><a href='/WorkOrder.do?woMode=viewWO&woID=" + split_id + "' target='_blank' >" + split_id + "</a></b>";	//No I18N
	  			}
	  			type = type ? type : "info";	//No I18N
	  			$req.utils.alert(type, message, "isAutoHide=false");	//No I18N
	  			break;
	  	}
	},

    /*
     * Navigates to the details page of the given request ID
     * accountId param added for MSP
     */
    navigateWO: function(nextID, tab, event, scrollToTop, pushHistory,accountId) {
    	/** In approval pages, the next ticket should be opened in new tab */
    	if(typeof reqDataFromApprove !== 'undefined' || (typeof approval_key !== "undefined" && approval_key)) {
    		var win = window.open("/WorkOrder.do?woMode=viewWO&woID=" + nextID, "_blank");	//No I18N
    		win.focus();
    		return;
    	}

    	/** when the navigation is called from the pages other than Request details page, the page will be loaded through url loading */
    	/** reloads page only on if the request with different account case ***/
    	if(typeof req_details === 'undefined' || (isMSP && accountId != getAccountId()) ) {
			window.open('/WorkOrder.do?woMode=viewWO&woID='+nextID, (window.externalframe ? '_blank' : '_self', (window.externalframe ? 'nopener,noreferer': 'noopener')));
    		return false;
    	}

    	/** Handle request details page in kanban view */
    		var options = {
	            rpanel: false,
	            width: "70%"
			};
			var isInMinPreview = false;
			try {
				isInMinPreview = top.jQuery("#wo-details-frame").length > 0;
			} catch (error) {}

			if(window.externalframe){
				if(isInMinPreview){
					top.$ReqPreview.showRequestPreview(nextID, options);
				}else{
					window.open("/WorkOrder.do?woMode=viewWO&woID=" + nextID + (window.externalframe ? "&externalframe=true" : ""), (req_details ? "_self" : "_blank"), (req_details ? "noopener" : "noopener,noreferer"));
				}
			}
			$notification_popup.checkForUnsentNotifications(); //Closing reply window popups if  pop is on open and minimized
    	/** checks if the unsaved Resolution content is there, before navigating to other ticket */
    	if(!this.checkResolutionChange(event)) {
    		if(event && event.type === "popstate") {
				var stateObj = { "tab": "resolution", "id": this.request_info.id };	//No I18N
				var url = 'WorkOrder.do?woMode=viewWO&woID='+this.request_info.id+"#resolution";	//No I18N
    			window.history.replaceState(stateObj, "resolution", url);	//No I18N
    		}
			return false;
		} else {
			/** If the visible resolution content is chosen not to be saved, then hide it before navigating to avoid the unsaved resolution alert again */
			jQuery(".sdtab-content #ze_HTMLDesc_Focus").hide();
		}
		var oldID = woID;
		try {
			/** removes the entry from the collaboration list for the previous ticket */
			$req.details.updateCollaborationCount(oldID);
		} catch(ex) {
			console.error(ex);
		}
    	this.loadWO(nextID, tab, scrollToTop, function() {
    	/** dynamically changes the URL without loading the page and pushes the url in to the browser history */
    	if(oldID !== nextID && pushHistory !== false) {
			nextID = parseInt(nextID, 10).toString();
    		window.history.pushState({'id': nextID}, '', 'WorkOrder.do?woMode=viewWO&woID='+nextID);	//No I18N
    	}
    	$req.lpanel.selectItem(nextID, false);
    	},function() {
    	   	$req.header.getPendingRequestCount();
    	});
    	return true;
    },

    /*
     * Loads the required information for the given request ID and renders the details page without reloading
     */
    loadWO: function(nextID, tab, scrollToTop, callback, afterloadFn) {
		jQuery('.page-progressbar, #freeze-details').show(); //No I18N
		jQuery("#req_details_skloader").skLoader("show"); //No I18N
		jQuery("body").addClass("atp-open"); //No I18N
		jQuery("#req_details_right_skloader").skLoader("show"); //No I18N
		try {
			/** closes the opened pop up if any */
			if(jQuery('#_DIALOG_LAYER:visible').length > 0) {
				window.closeDialog();
			}
			$req.prop.closeJQueryDialog();
		} catch(ex) {
			console.error(ex);
		}

		woID = nextID;
		var _self = this;
		window.requestAnimationFrame(function() {
			_self.resetProperties();
			var is_loaded = _self.initialize(woID);
			if(!is_loaded) {
				jQuery('.page-progressbar,#freeze-details').hide(); //No I18N
				jQuery("#req_details_skloader").skLoader("hide"); //No I18N
				jQuery("body").removeClass("atp-open"); //No I18N
				return false;
			}
			tab = tab ? tab : 'default';	//No I18N
			_self.updateTab(tab, true, function() {
				try {
					if(_self.request_info.is_trashed) {
					_self.initWOTrash('WOHeader');	//No I18N
					}
					if(sdp_user.USERTYPE === "Technician" && !$req.details.request_info.is_trashed && (!$req.details.request_info.status.hasOwnProperty("type") || $req.details.request_info.status.type !== "Closed")) {
						/** Worklog timer details are already obtained while initializing the request itself, so no need to fetch again, just rendering is enough */
						$req.header.updateTimer(woID, true);
					}
					if($req.layout.rpanel.indexOf("tags") > -1) {
						$req.tags.render();
					}
					_self.renderStaticMessage();
					setHTMLProperties();
				} catch(ex) {
					console.error(ex);
				}
				jQuery('.page-progressbar,#freeze-details').hide(); //No I18N
				jQuery("body").removeClass("atp-open"); //No I18N
				jQuery("#req_details_skloader").skLoader("hide"); //No I18N

				if(scrollToTop !== false) {
					/** Scrolls to top of the page */
					jQuery('html,body').animate({
						scrollTop: 0,
						scrollLeft: 0
					});
				}
				if($req.layout.rpanel.indexOf("requester") > -1) {
					$req.rpanel.loadRequesterInfo();
				}
				CommonUIActions.toggleRHS();
				jQuery('#toggleRHS').on('click', function() {
				    toggleRightPanel();
			    });
				if($req.details.request_info.has_draft && !$req.details.request_info.is_trashed) {
					$req.details.renderDrafts();
				}
        isGlobalCountExists = false;
				if(typeof afterloadFn === "function") {
					afterloadFn();
				}
			});
			if(typeof callback === "function") {
				callback();
			}
			applyBrowserTitle();
		});
    },

    /*
     * Updates (usually removes) the entry of the collaboration list for the given ticket
     */
    updateCollaborationCount: function(oldID) {
    	pagenotif.updateViewPageCount(oldID);
    	jQuery("#viewers_names > ul > li").remove();
    	jQuery("#modification_details").addClass("hide");
    	jQuery("#collaboration_notifications").empty();
    	jQuery("#collaboration_header_notifications").slideUp(300);
    },

    /*
     * Resets to the default properties of the scope variables
     */
    resetProperties: function() {
    	$req.prop.init();
    	$req.details.allowedValues = {};
    	$req.share.sharedData = {};
    	$req.resource.init();
    },
	/*
    * Update Request Attachments after uplods or Delete
	*/
	updateAttachments: function(options) {
		var self = this;
		sdpAjax({
			type: 'GET', //NO I18N
			url: "/api/v3/requests/" + this.request_info.id  + "/attachments",	//No I18N
			data: sdpAjaxInputData({ list_info: {row_count: 100} }),
			cache:false,
			success: function(response) {
				if (response && response.response_status ) {
					var response_status = response.response_status.constructor === Array ? response.response_status[0] : response.response_status;
					if(response_status.status === 'success') {
						self.request_info.attachments = response.attachments;
						self.renderDescription();
						var attachmentEl = jQuery("#attachments-right-panel");	//No I18N
						if(options && options.action ==="AddAttach"){
							jQuery("#desc-body .ip-drag").trigger("click");
						}
						if(!self.request_info.attachments || self.request_info.attachments.length === 0) {
							attachmentEl.parent().addClass("hide");	//No I18N
							attachmentEl.empty();
						} else {
							attachmentEl.parent().removeClass("hide");	//No I18N
							attachmentEl.html( Handlebars.helpers.setRightPanelValue("attachments") );	//No I18N
							jQuery("#showPopover").remove();	//No I18N
							$req.rpanel.initRPAttachments();
						}
					} else {
						if (response_status.messages && response_status.messages.length > 0) {
							$req.utils.alert("failure", response_status.messages[0].message, "isAutoHide=true, delay=15"); //NO I18N
						}
					}
				}
			},
			error: function(json){
			    var response = json.responseJSON;
			    var response_status = response.response_status && response.response_status.constructor === Array ? response.response_status[0] : response.response_status;
			    if(response_status.status != 'success') {
			        if (response_status.messages && response_status.messages.length > 0) {
                        $req.utils.alert("failure", response_status.messages[0].message, "isAutoHide=true, delay=15"); //NO I18N
                    }
			    }
			}
		});
	},

	/*
	 * Deletes the Request and redirects to the List view
	 */
	deleteWO: function(id, alert, message) {
		id = id || woID;
		if(alert) {
			if(!window.confirm(message)) {
				return;
			}
		}
		jQuery("#freeze-details, .page-progressbar").show();
		var isFLVisible = true;	/** Freeze layer visibility */
		var url = "/api/v3/requests/"+id+"/_move_to_trash";	//No I18N
		var redirectURL = "/WOListView.do";	//No I18N
		var successMsg = getMessageForKey("sdp.requests.viewrequest.deletetotrashsuccessmsg");
		var failureMsg = getMessageForKey("sdp.requests.viewrequest.deletetotrashfailuremsg");

		/** Permanent Delete from trash */
		if(this.request_info.is_trashed) {
			url = "/api/v3/requests/"+id;	//No I18N
			redirectURL += "?viewName=TRASH";	//No I18N
			successMsg = getMessageForKey("sdp.requests.viewrequest.deletesuccessmsg");
			failureMsg = getMessageForKey("sdp.requests.viewrequest.deletefailuremsg");
		}

		sdpAjax({
			url: url,
			type: "DELETE",	//No I18N
			success: function(data) {
				successMsg = data.message || successMsg;
				showalert("success", successMsg, "isAutoHide=true");	//No I18N
				jQuery(".page-progressbar").hide();
				setTimeout(function() {
					window.location.href = redirectURL;
				}, 3000);
			},
			error: function (error) {
				var resp = error.responseJSON;
				if(resp.response_status && resp.response_status.constructor === Array){
					responseText = resp.response_status[0];
				}
				else{
					responseText = resp.response_status;
				}
				if(responseText && responseText.messages && responseText.messages[0].message){
					showalert("failure", e_html(responseText.messages[0].message),"isAutoHide=true"); // No I18N

				}
				if(isFLVisible) {
					jQuery("#freeze-details, .page-progressbar").hide();
					isFLVisible = false;
				}
			}
		}).always( function() {
			/** If the ajax call doesn't call the success hook due to any error, the frozen layer will be removed after 10s */
			setTimeout(function() {
				if(isFLVisible) {
					jQuery("#freeze-details, .page-progressbar").hide();
					isFLVisible = false;
				}
			}, 10000);
		});
	},

    /*
     * Restores the Request and redirects to the List view
     */
    restoreWO: function(id, alert, message) {
        id = id || woID;
        if(alert) {
            if(!window.confirm(message)) {
                return;
            }
        }
        jQuery("#freeze-details, .page-progressbar").show();
        var isFLVisible = true;	/** Freeze layer visibility */
        var url = "/api/v3/requests/"+id+"/_restore_from_trash";	//No I18N
        var redirectURL = "/WorkOrder.do?woMode=viewWO&woID="+id;	//No I18N
        var successMsg = getMessageForKey("sdp.requests.viewrequest.restoresuccessmsg");
        var failureMsg = getMessageForKey("sdp.requests.viewrequest.restorefailuremsg");

        var data = {};
        sdpAjax({
            url: url,
            type: "PUT",	//No I18N
            success: function(data) {
                successMsg = data.message || successMsg;
                showalert("success", successMsg, "isAutoHide=true");	//No I18N
                jQuery(".page-progressbar").hide();
                setTimeout(function() {
                    window.location.href = redirectURL;
                }, 3000);
            },
            error: function (error) {
                var resp = error.responseJSON;
                if(resp.response_status && resp.response_status.constructor === Array){
                    responseText = resp.response_status[0];
                }
                else{
                    responseText = resp.response_status;
                }
                if(responseText && responseText.messages && responseText.messages[0].message){
                    showalert("failure", e_html(responseText.messages[0].message),"isAutoHide=true"); // No I18N

                }
                if(isFLVisible) {
                    jQuery("#freeze-details, .page-progressbar").hide();
                    isFLVisible = false;
                }
            }
        }).always( function() {
            /** If the ajax call doesn't call the success hook due to any error, the frozen layer will be removed after 10s */
            setTimeout(function() {
                if(isFLVisible) {
                    jQuery("#freeze-details, .page-progressbar").hide();
                    isFLVisible = false;
                }
            }, 10000);
        });
    },

	/**Added title in sla button*/
	addSLAInfo:function() {
		var serviceSlaEle = jQuery("#service_sla"); //No I18N
		serviceSlaEle.removeAttr("title"); //No I18N
		$req.utils.ajax("/api/v3/requests/"+$req.details.request_info.id+"/service_sla/"+$req.details.request_info.service_sla.id+"", "GET", true, false, function(response) { //No I18N
			$req.details.request_info.service_sla.sla.info = response.service_template_sla_association.info;
			var title = "<span class='note1 mb5 disp-b'>" + e_html($req.details.request_info.service_sla.sla.name) + "</span>"; //No I18N
			if($req.details.request_info.service_sla.sla.info) {
				title += "<span class='text-color6'>" + e_html($req.details.request_info.service_sla.sla.info) + "</span>";	//No I18N
			}
			serviceSlaEle.attr("title", title); //No I18N
			serviceSlaEle.attr("rel", "uitip"); //No I18N
			serviceSlaEle.attr("mode_html", "true"); //No I18N
			initTooltip("#headerbar"); //No I18N
			if(jQuery('#service_sla:hover').length != 0) {
				serviceSlaEle.trigger("mouseenter"); //No I18N
			}
		});
		serviceSlaEle.off("hover"); //No I18N
	},

	destroy: function(destroyPage) {
		/** dissociate all the attached events to the document and window */
		for(var name in this.events) {
			this.unbindEvent(name);
		}

		/** remove the detail view id element and its children */
		if(destroyPage !== false) {
			jQuery("#detailview").remove();
		}
	},

	bindEvent: function(name, element, type, handler) {
		jQuery(element).on(type, handler);
		$req.details.events[name] = {
			element: element,
			type: type,
			handler: handler
	    };
	},

	unbindEvent: function(eventname) {
		var event;
		if(this.events.hasOwnProperty(eventname)) {
			var event = this.events[eventname];
			jQuery(event.element).off(event.type, event.handler);
		}
		delete this.events[eventname];
	},

	backToListview: function() {
		// if(window.temp_current_req_mode === "kanban") {
		// 	window.history.pushState({"page": "req_listview", "mode": "kanban"}, '', 'WOListView.do');    //No I18N
		// }
		if(window.current_req_mode === "kanban") {	//No I18N
			try {
				if(!!window.top.requestListViews.kan_col_id) {
					window.top.requestListViews.kan_col_id = null;
				}
			} catch (error) {}
			delete $req.details.exceptions;
		}
		if(window.externalframe) { // incase of of externalframe, find whether kanban is the current request mode or not
			var kanbanlistview = false;
			try {/**Back button click event: request details page loaded from kanban view, maintenance module or not  **/
				if(top.$ReqPreview.options.is_open) {
					if(window.current_req_mode === "kanban" || (!!window.top.requestListViews && window.top.requestListViews.viewMode === "kanban") || (window.is_from && window.is_from === "maintenance")) {
						kanbanlistview = true;
					}
				}
			} catch (error) {}
			if(kanbanlistview || window.is_from === 'dashboard' || window.is_from == 'global_search') {
				//dashboar check => 115643 -> List view filter in dashboard not retaining when we click back button of details page
                 //global_search check => SD-117852 -> To hide portal header in slider when opened from global_search
				jQuery('body').addClass('atp-open');//No I18N
				window.scrollTo(0, 0);
				$ReqPreview.closeRequestPreview();
				$req.details.destroy(false);
				if(window.WOID){
					$req.details.updateCollaborationCount(window.WOID);
				}
				try {
					top.$ReqPreview.closeRequestPreview('#req-details-preview'); //No I18N
				} catch (error) {
					window.location.href = "/WOListView.do?externalframe=true";
				}
				(window.is_from==='dashboard') && jQuery("#requests_list_refreshfreq").trigger("click");
			} else {
				var from = (is_from && is_from !== "null") ? "&from="+is_from : ""; //No I18N
				$spa.navigate("WOListView.do?externalframe=true"+from, "requests", "requests-list"); //No I18N
			}
		} else if(jQuery("#listview").length > 0) {	//No I18N
			window.scrollTo(0, 0);
			requestListViews.backToAjaxListview();
			$req.details.destroy(false);
		} else {
			window.location.href = "/WOListView.do";	//No I18N
		}
	},

  	//opening AddNotes Form
  	addNotes: function(){
  		if($req.details.conv){
  			$req.details.conv.openNoteForm($req.details.conv.module_id);
  		}
  	},
	/**
	 * Merge request
	 */
	 mergeRequest: function () {
		 if(jQuery('#wo-merge').length === 0){
			 jQuery('body').append('<div id="wo-merge" ></div>'); //No I18N
		 }
		 var height = window.outerHeight * 0.8;
		 var width = window.outerWidth * 0.96;
		 jQuery('#wo-merge').dialog({
			 title:getMessageForKey('sdp.requests.merge.title'),
			 modal:true,
			 resizable:false,
			 autoOpen:true,
			 width:width,
			 height:height,
			 open: function() {
				jQuery(this).dialog('option', 'position', 'center'); // NO I18N
				var url = '/WOListView.do?externalframe=true&from=merge&viewMode=table'; // NO I18N
				let ele =jQuery('<div id="wo-merge-loader">'+ajaxBar()+'</div><iframe frameBorder="0" id="wo-merge-iframe" class="fh noborder" style="width:'+width+'px" src="'+url+'"></iframe>');
 				jQuery(this).empty().append(ele)
				jQuery('#wo-merge-iframe').load(function () {
					jQuery('#wo-merge-loader').remove();
					document.querySelector('#wo-merge-iframe').contentDocument.body.style.overflowX="hidden !important"; //NO I18N
				});
				// TASK ID : 77228
				jQuery('#wo-merge').css({
					overflow:"hidden" // NO I18N
				})
			}
		 })
	 },
	 /**
	 * link request - popup construction from details page.
	 */
	 linkRequest: function () {
		 if(jQuery('#wo-link').length === 0){
			 jQuery('body').append('<div id="wo-link" ></div>'); //No I18N
		 }
		 var height = window.outerHeight * 0.8;
		 var width = window.outerWidth * 0.96;
		 jQuery('#wo-link').dialog({
			 title:getMessageForKey('sdp.requests.viewrequest.linkrequest'),
			 modal:true,
			 resizable:false,
			 autoOpen:true,
			 width:width,
			 height:height,
			 open: function() {
				jQuery(this).dialog('option', 'position', 'center'); // NO I18N
				var url = '/WOListView.do?externalframe=true&from=link_request&viewMode=table'; // NO I18N
				let ele= jQuery('<div id="wo-link-loader">'+ajaxBar()+'</div><iframe frameBorder="0" id="wo-link-iframe" class="fh noborder" style="width:'+width+'px" src="'+url+'"></iframe>');
				jQuery(this).empty().append(ele);
				jQuery('#wo-link-iframe').load(function () {
					jQuery('#wo-link-loader').remove();
					document.querySelector('#wo-link-iframe').contentDocument.body.style.overflowX="hidden !important"; //NO I18N
				});
				// TASK ID : 77228
				jQuery('#wo-link').css({
					overflow:"hidden" // NO I18N
				})
			}
		 })
	 },
	 bindEvents: {
	    templates: {
            rlc_transitions: function(rlcData) {
                if(rlcData.transitions){
                    for(let transition of rlcData.transitions){
                        let status_id = transition.target_node.entity_id;
                        jQuery(`#rlc-transition-status-${status_id}`).off('click').on('click', (event) => {
                            $req.prop.wizard.invokeAction(status_id);
                            return false;
                        });
                    }
                }
            },
            right_panel_template: function(rightPanelData) {
                /* Right panel details when Right panel is disabled */
                if(rightPanelData.rlc && rightPanelData.rlc.isEnabled){
                    this.rlc_transitions(rightPanelData.rlc);
                }
                 let properties = rightPanelData.techStaticArray;
                 if(properties.indexOf('group')!=-1 && !!$req.details.request_info.ola_due_by_time){
                	jQuery('#ola_due_timer').off('click').on('click',(event)=>{
                			event.stopImmediatePropagation();
                	});
                 }

                 	jQuery(`[name="rp_asset_info"]`).off('click').on('click', (event) => {//NO I18N
                 		let ele = jQuery(event.currentTarget);
                 		let id = ele && ele.data('asset_id');
                 		window.open('/Assets.do?entity_id='+id+'&mode=get','_blank','noopener');
                 		return false;
                 	});
                 	jQuery(`[name="rp_ci_info"]`).off('click').on('click', (event) => {//NO I18N
                    	let ele = jQuery(event.currentTarget);
                    	let id = ele && ele.data('ciId');       //No I18N
                    	$req.prop.openCIInfo(event,id);
                    	return false;
                    });
                 	jQuery(`[name="asset_rds"] , [name="asset_dc_opts"]`).off('click').on('click', (event) => {//NO I18N
                 		let ele = event.currentTarget;
                 		setRemotePosition(ele);
                 	});
                 	 jQuery(`[name="asset_pmp"] , [name="asset_bs_dropdown"]`).off('click').on('click', (event) => {//NO I18N
                    	let ele = event.currentTarget
                    	bsDropdown(ele, event);
                    });
                 	jQuery(`[name="asset_dc_chat"]`).off('click').on('click', (event) => {
                 		let ele = jQuery(event.currentTarget);
                 		let asset_name= ele.data('asset_name');//NO I18N
                 		initiateDCToolsAction('chat','DCServerSettings.do?operation=AssetAction&dcaction=Chat&wsName=' +asset_name +'','' +getMessageForKey("sdp.admin.dcconfig.Chat.title") + '');
                 	});
                 	jQuery(`[name="asset_dc_sys"]`).off('click').on('click', (event) => {
                 		let ele = jQuery(event.currentTarget);
                 		let asset_name= ele.data('asset_name');//NO I18N
                 	    DcToolsEssential.loadDcAssetAction('system manager', asset_name);
                 	});
                 	jQuery(`#asset-show-more ,#asset-hide-more`).off('click').on('click', (event) => {
                 		let show_more = (jQuery(event.currentTarget).attr('id')==="asset-show-more");
                 		$req.rpanel.toggleAssets(show_more);
                 	});
                 	jQuery(`#configuration_items-show-more ,#configuration_items-hide-more`).off('click').on('click', (event) => {      //No I18N
                    	let show_more = (jQuery(event.currentTarget).attr('id')==="configuration_items-show-more");                     //No I18N
                    	$req.rpanel.toggleConfItems(show_more);
                    });

                  (properties.indexOf('status')!=-1 &&  $req.prop.getCurrentStatus()==='Onhold') &&
                     jQuery(`#rp_onHoldIcon`).off('click').on('click', (event) => {
                 	$req.prop.loadOnHoldBox(event);
                      return false;
                  });
                  (rightPanelData.order.indexOf('account')!=-1) &&
                     jQuery(`#accountIcon`).off('click').on('click', (event) => {
                 	accountIconClickAction(event,$req.details.request_info.account.id);
                     return false;
                  });

                  (properties.indexOf('space')!=-1) &&
                 	jQuery(`#space-show-more ,#space-hide-more`).off('click').on('click', (event) => {
                 		let show_more = (jQuery(event.currentTarget).attr('id')==="space-show-more");
                 		$req.rpanel.toggleSpace(show_more);
                 	});
                  (rightPanelData.order.indexOf('share')!=-1) &&
                 	jQuery('[data-cs-field="share_request"]').off('click').on('click',(event)=>{
                 		$req.share.popup();
                 	});
                 (properties.indexOf('tasks')!=-1 && $req.details.request_metrics.task_total_count>0) &&
                 	jQuery('[name="task_count"]').off('click').on('click',(event)=>{
                 		jQuery('#tasks-tab').click();
                 	});
                 (properties.indexOf('checklists')!=-1 && $req.details.request_metrics.checklists_total_count) &&
                 	jQuery('[name="checkList_count"]').off('click').on('click',(event)=>{
                 		jQuery('#checklists-tab').click();
                    });
                  if(rightPanelData.technAssociateOperations){
                 	this.association_details(rightPanelData.technAssociateOperations);
                  }

                  jQuery("#categoryPopUp > .form-footer > .csi-update").off("click").on("click", $req.prop.assignRightPanelTechnician); //No I18N
                  jQuery("#categoryPopUp > .form-footer > .csi-cancel").off("click").on("click", $req.prop.cancelRightPanelTechnician); //No I18N

                  jQuery('#more-prop-btn').off('click').on('click', () => { //No I18N
                      $req.details.changeTab('properties'); //No I18N
                  });
                  jQuery('#unmarkfcr').off('click').on('click', () => { //No I18N
                      $req.prop.updateFCR(false);
                  });
                  jQuery('#markfcr').off('click').on('click', () => { //No I18N
                      $req.prop.updateFCR(true);
                  });
                  isMSPOrSCP && jQuery('#sign_off_btn').off('click').on('click', () => { //No I18N
                    displaySignoffDiv(this);
                  });
            },
            site_popup_template: function(){
                jQuery("#site_popup_details").off('click').on('click', '[data-attr="site_ids"]', function(event) {
                    let rowData = event.currentTarget.dataset;
                    $req.common.sitePopup.updateSelectedSite(rowData.id);
                });
                jQuery("#site-search-text").parent().off("submit").on("submit", () => { //No I18N
                    $req.common.sitePopup.search(this);
                });
                jQuery("#notAssociatedSite").off("click").on("click", () => { //No I18N
                    $req.common.sitePopup.updateSelectedSite(-1);
                });
            },
            association_popup: function(){
                jQuery("#space_association_popup").off('click').on('click', '[data-attr="space_ids"]', function(event) {
                    let rowData = event.currentTarget.dataset;
                    $req.common.spacePopup.handleSingleSelect(rowData.id,rowData.name);
                })
            },
            details_header_template: function() {
                if(isMSPOrSCP){
                    jQuery("#asso-request-contract").off('click').on('click', () => { //No I18N
                        associateRequestContractClick();
                    });
                }
                jQuery("#show-requester-det").off('click').on('click', (event) => { //No I18N
                    let reqData = $req.details.request_info;
                    window.NewWindow(`/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&apiEntity=requester&apiModule=requests&apiModuleId=${reqData.id}&userId=${reqData.requester.id}&key=${reqData.image_token}&minContent=true&module=requests&popupfor=detailspage`, getMessageForKey('sdp.inventory.wsRtPanel.userDetails'), '450', '500', 'yes', 'center');
                });
                jQuery("#show-obo-det").off('click').on('click', (event) => { //No I18N
                    let reqData = $req.details.request_info;
                    window.NewWindow(`/setup/UsersPopup.jsp?isUser=true&apiModule=requests&apiEntity=on_behalf_of&apiModuleId=${reqData.id}&key=${reqData.image_token}&viewType=mydetails&userId=${reqData.on_behalf_of.id}&minContent=true`, getMessageForKey('sdp.inventory.wsRtPanel.userDetails'), '450', '500', 'yes', 'center');
                });
                jQuery('[data-action-name="tech-req-sdp-chat"]').off('click').on('click', (event) => { //No I18N
                    requester_chat.openChatForRequesterOverRequest($req.details.request_info.id);
                });
                jQuery('[data-action-name="tech-req-dc-chat"]').off('click').on('click', (event) => { //No I18N
                    initiateDCToolsAction('chatUser',`/DCServerSettings.do?operation=AssetAction&dcaction=chatUser&wsName=${$req.details.request_info.requester.id}&requestId=${$req.details.request_info.id}`, 'Initiate Chat');
                });
                jQuery("#ctiCall").off('click').on('click', (event) => { //No I18N
                    let reqData = $req.details.request_info;
                    telephony.makeOutgoingCall((reqData.requester.mobile || reqData.requester.phone), reqData.requester.id);
                    return false;
                });
            },
            header_worklog_timer: function(timer_data, selector) {
                let eleId = `#${selector || 'worklog-timer'}`; //No I18N
                jQuery(eleId + ' button[data-action-name="close-worklog-timer"]').off('click').on('click', () => { //No I18N
                    $req.header.closeTimer();
                    return false;
                });
                jQuery(eleId + ' [data-action-name="toggle-timer"]').off('click').on('click', () => { //No I18N
                    $req.header.toggleTimer(timer_data.woId, timer_data.is_list_view);
                });
                jQuery(eleId + ' [data-action-name="load-worklog"]').off('click').on('click', () => { //No I18N
                    $tasks.loadWorkLog('form', 'request', timer_data.woId, '', '', '', '', 'reqTimer'); //No I18N
                });
			},
			association_details:function(associationData){
				(associationData.indexOf('linked_to_request')!=-1) &&
					jQuery('#rp-unlink-btn').off('click').on('click',(event)=>{//NO I18N
						detachFromRequestLink(''+$req.details.request_info.id+'', ''+$req.details.request_info.linked_to_request.request.id+'');
						return false;
					});
					(associationData.indexOf('linked_requests')!=-1) &&
                		jQuery('#linked-req-count').off('click').on('click',(event)=>{//NO I18N
                		showURLInDialog('/RemoveRequestLink.do?removeLink=getLinkedRequests&parentId='+$req.details.request_info.id+'&fromParent=true' + (window.externalframe ? '&externalframe=true' : '') + '',`position=absmiddle, width=1000, modal=yes, closeOnBodyClick=yes, title=${getMessageForKey("sdp.requests.view.linkedfrom.linked")}`);
                		return false;
                	});
				if(associationData.indexOf('associate_problem')!=-1){
					jQuery('#det-problem').off('click').on('click',(event)=>{//NO I18N
						$problemGlobal.manageRequestAssociations('DELETE',$req.details.request_info.id);//NO I18N
						return false;
					});
					jQuery('#asso-problem-new').off('click').on('click',(event)=>{//NO I18N
							$problemGlobal.showOverwritePopup('request',$req.details.request_info.id,3,null);//NO I18N
						return false;
					});
					jQuery('#asso-problem-search').off('click').on('click',(event)=>{//NO I18N
						$previewComponent.load('/ui/problems?mode=list&from=request&associatedEntityId='+$req.details.request_info.id+'&externalframe=true&operation=associateto',getMessageForKey("request.problem.associate"),(window.frameElement?'90%':null),null,null,'listview_popup');//NO I18N
						return false;
					});
				}
				if(associationData.indexOf('associate_change')!=-1){
					jQuery('#det-init-change').off('click').on('click',(event)=>{//NO I18N
						detachMappedId('change',$req.details.request_info.id);//NO I18N
						return false;
					});
					jQuery('#change-init-new').off('click').on('click',(event)=>{//NO I18N
						$previewComponent.load('/ui/changes?mode=add&from=request&associatedEntityId='+$req.details.request_info.id+'&externalframe=true',translate('sdp.change.listview.newchange'),'75%',null, null, 'newchange_popup');//NO I18N
						return false;
					});
					jQuery('#change-init-search').off('click').on('click',(event)=>{//NO I18N
						NewWindow('/FilteredChanges.cc?WORKORDERID='+$req.details.request_info.id+'&REQUESTTYPE=requestchange','New_Change','1200','800','yes','center');
						return false;
					});
					jQuery('#det-caused-change').off('click').on('click',(event)=>{//NO I18N
					    detachMappedId('causedbychange',$req.details.request_info.id);//NO I18N
					    return false;
					});
					jQuery('#change-caused-search').off('click').on('click',(event)=>{//NO I18N
						NewWindow('/FilteredChanges.cc?WORKORDERID='+$req.details.request_info.id+'&REQUESTTYPE=causedbychange','New_CausedByChange','1200','800','yes','center');
					    return false;
					});
				}
				if(associationData.indexOf('associate_project')!=-1){
					jQuery('#det-project').off('click').on('click',(event)=>{//NO I18N
						$req.header.dissociateProject();
						return false;
					});
					jQuery('#asso-project-new').off('click').on('click',(event)=>{//NO I18N
						NewWindow('/ProjectAction.do?submitaction=NewProject&workorderID=' + $req.details.request_info.id + '&from=ProjAssociation', 'New_Project', '1000', '600', 'yes', 'center');
						return false;
					});
					jQuery('#asso-project-search').off('click').on('click',(event)=>{//NO I18N
						$previewComponent.load('/ui/projects?mode=list&from=request&externalframe=true',translate('sdp.requests.projectdialog.associatetoproject'),null,null,null,'projAssoc_popup',null,null,'scrolling:no');//NO I18N
						return false;
					});
				}
				if(associationData.indexOf('associate_purchase_request')!=-1){
					jQuery('#asso-pr-new').off('click').on('click',(event)=>{//NO I18N
						createNewPR($req.details.request_info.id);
						return false;
					});
					jQuery('#asso-pr-search').off('click').on('click',(event)=>{//NO I18N
							showAssociatePRPage($req.details.request_info.id, false);
							return false;
					});
					jQuery(`#asso-pr-count`).off('click').on('click', (event) => { //For right panel associations.//NO I18N
						NewWindow('/PurchaseRequest.do?task=associated_purchase_details&workOrderID='+$req.details.request_info.id+'','associatePO','800','540','yes','center');
						return false;
					});
				}
				if(associationData.indexOf('associate_purchase_order')!=-1){
					jQuery('#asso-po-search').off('click').on('click',(event)=>{//NO I18N
						NewWindow('/POToWOList.do?operation=associate_po&workOrderID='+$req.details.request_info.id+'', 'associatePO','900','600','yes','center');
						return false;
					});
					jQuery(`#asso-po-count`).off('click').on('click', (event) => { //For right panel associations.//NO I18N
						NewWindow('/PurchaseRequest.do?task=associated_purchase_details&workOrderID='+$req.details.request_info.id+'','associatePO','800','540','yes','center');
						return false;
					});
				}
			},
            share_req_edit: function() {
                jQuery('#share-request-edit .form-footer .btn-primary').off('click').on('click', $req.share.update); //No I18N
                jQuery('#share-request-edit .form-footer .btn-default').off('click').on('click', $req.share.cancel); //No I18N
            },
            share_req_view: function() {
                jQuery('#shareWithTech').off('click').on('click', () => { //No I18N
                    $req.share.renderForm(true);
                });
                jQuery('#shareWithRequester').off('click').on('click', () => { //No I18N
                    $req.share.renderForm(false);
                });
                jQuery('#show-more-technicians').off('click').on('click', () =>{ //No I18N
                    jQuery(event.currentTarget).toggleClass('hide'); //No I18N
                    jQuery('#technicians-more-values').toggleClass('hide'); //No I18N
                });
                jQuery('#show-more-groups').off('click').on('click', () =>{ //No I18N
                    jQuery(event.currentTarget).toggleClass('hide'); //No I18N
                    jQuery('#groups-more-values').toggleClass('hide'); //No I18N
                });
                jQuery('#show-more-users').off('click').on('click', () =>{ //No I18N
                    jQuery(event.currentTarget).toggleClass('hide'); //No I18N
                    jQuery('#users-more-values').toggleClass('hide'); //No I18N
                });
                jQuery('#show-more-sites').off('click').on('click', () =>{ //No I18N
                    jQuery(event.currentTarget).toggleClass('hide'); //No I18N
                    jQuery('#sites-more-values').toggleClass('hide'); //No I18N
                });
                jQuery('#show-more-departments').off('click').on('click', () =>{ //No I18N
                    jQuery(event.currentTarget).toggleClass('hide'); //No I18N
                    jQuery('#departments-more-values').toggleClass('hide'); //No I18N
                });
            },
            static_header_msg: function() {
                jQuery('#changeTab').off('click').on('click', () => { //No I18N
                    $req.details.changeTab('dependency'); //No I18N
                });
            },
            requester_cancel_request: function() {
                jQuery('#revoke_cancel_requested_link').off('click').on('click', () => { //No I18N
                    cancel_request.showRevokeCancellationPopup($req.details.request_info.id);
                });
                jQuery('#cancel_reason_more').off('click').on('click', () => { //No I18N
                    cancel_request.showCancelRequestedMoreInfo();
                });
                jQuery('#cancel_request_accept_btn').off('click').on('click', () => { //No I18N
                    cancel_request.showCancelRequestPopup($req.details.request_info.id);
                });
                jQuery('#cancel_request_reject_btn').off('click').on('click', () => { //No I18N
                    cancel_request.showRevokeCancellationPopup($req.details.request_info.id);
                });
            },
            header_actions_templates: function (reqOperData) {
                if(previewSlider == 'false'){ //No I18N
                    if(reqOperData.externalframe){
                        jQuery('#back_to_list').off('click').on('click', $req.details.backToListview); //No I18N
                    }
                }
                if(reqOperData.externalframe){
                    jQuery('#WOHeader .dig-close-btn').off('click').on('click', $req.details.backToListview); //No I18N
                }
                if(sdp_user.USERTYPE != 'Technician' && reqOperData.links.reply && reqOperData.links.reply.post){ //No I18N
                    jQuery('#replymenu').off('click').on('click', () => { //No I18N
                        $req.notify.actions.emailReply($req.details.request_info.id,true,'',false,false);
                    });
                }
                if(reqOperData.links.pickup && reqOperData.links.pickup.put){
                    jQuery('#Req_Det_AssignTech').off('click').on('click', (event)=> { //No I18N
                        $req.sgt.openAssignDialog(event);
                    });
                }
                if(reqOperData.links.reopen && reqOperData.links.reopen.put){
                    jQuery('#Req_Det_Reopen').off('click').on('click', () => { //No I18N
                        $req.notify.actions.emailReply($req.details.request_info.id,true,'',false,false);
                    });
                }
                if(reqOperData.links.tech_reopen && reqOperData.links.tech_reopen.put){
                    jQuery('#Req_Det_Reopen').off('click').on('click', (event) => { //No I18N
                        $req.details.reOpenRequest();
                        event.preventDefault();
                    });
                }
                if(sdp_user.USERTYPE == "Requester" && reqOperData.links.close && reqOperData.links.close.put){ //No I18N
                    jQuery('#close_lnk').off('click').on('click', (event) => { //No I18N
                        $req.details.requesterCloseRequest(reqOperData.ssp.is_close_comment_mandatory);
                        event.preventDefault();
                    })
                }
                if(reqOperData.links.pickup && reqOperData.links.pickup.put){
                    if(!reqOperData.request_info.technician || (reqOperData.request_info.technician.id != sdp_user.LOGGEDIN_USERID)){
                        jQuery('#pickupTech').off('click').on('click', () => { //No I18N
                            // To disable the pickupTech button after clicking.
                        	jQuery('#pickupTech').addClass("ptr-ev-none"); //As this is implemented using <a> tag, the "ptr-ev-none" is used instead of "disabled" attribute // No i18n
                            $req.prop.setRightPanelEdit("pickUp"); //No I18N
                        });
                    }
                }
                if(reqOperData.isMSPOrSCP) {
                    jQuery('#zoho_assist_btn_id').off('click').on('click', () => { //No I18N
                        showURLInDialog('ZoomMeeting.do?woID='+$req.details.request_info.id, 'top=50, left=400,width=650,modal=yes,closeOnEscKey=yes, title=' + window.getMessageForKey("sdp.msp.admin.leftpanel.zoom.integration"));//No I18N
                        event.preventDefault();
                    });
                    jQuery('#zoho_assist_href_link_id_1').off('click').on('click', () => { //No I18N
                        showURLInDialog('ZoomMeeting.do?woID='+$req.details.request_info.id, 'top=50, left=400,width=650,modal=yes,closeOnEscKey=yes, title='+ window.getMessageForKey("sdp.msp.admin.leftpanel.assetmgmt.remote"));//No I18N
                        event.preventDefault();
                    });
                    jQuery('#zoho_assist_href_link_id_2').off('click').on('click', () => { //No I18N
                        showURLInDialog('ZoomMeeting.do?woID='+$req.details.request_info.id, 'top=50, left=400,width=650,modal=yes,closeOnEscKey=yes, title='+ window.getMessageForKey("sdp.msp.admin.leftpanel.zoom.integration"));//No I18N
                        event.preventDefault();
                    });
                    jQuery('#remotecontrolnonasset').off('click').on('click', () => { //No I18N
                        showURLInDialog('ZoomMeeting.do?woID='+$req.details.request_info.id, 'top=50, left=400,width=650,modal=yes,closeOnEscKey=yes, title='+window.getMessageForKey("sdp.msp.admin.leftpanel.zoom.integration"));//No I18N
                        event.preventDefault();
                    });
                    jQuery('#zoommeeting').off('click').on('click', () => { //No I18N
                        showURLInDialog('ZoomMeeting.do?woID='+$req.details.request_info.id, 'top=50, left=400,width=650,modal=yes,closeOnEscKey=yes, title='+ window.getMessageForKey("sdp.msp.admin.leftpanel.zoom.integration"));//No I18N
                        event.preventDefault();
                    });
                    if(reqOperData.links.associate_contract && reqOperData.links.associate_contract.post){
                        jQuery('#Req_Det_Contracts').off('click').on('click', () => { //No I18N
                            showURLInDialog('/AssociateContract.do?woId='+$req.details.request_info.id ,'width=300,position=absolute, top=200, left=300, title=' + window.getMessageForKey('msp.contract.associate.contract'));//No I18N
                            event.preventDefault();
                        });
                    }
                    if(isSCP && reqOperData.links.close_without_notif && reqOperData.links.close_without_notif.post){
                        jQuery('#Req_CloseWithoutNotif').off('click').on('click', () => { //No I18N
                            closeWithoutNotif();
                            event.preventDefault();
                        });
                    }
                    if(reqOperData.links.set_billablility && reqOperData.links.set_billablility.post){
                        jQuery('#Req_Det_Mark_NonBillable').off('click').on('click', () => { //No I18N
                            let str = $req.details.request_info.is_billable ? 'REQNONBILL' : 'REQBILL';//No I18N
                            NewWindow('MarkRequestForBilling.do?operation=' + str + '&workOrderID='+$req.details.request_info.id ,'AddDesc','500','300','yes','center');//No I18N
                            event.preventDefault();
                        });
                    }
                    if(reqOperData.links.install_software && reqOperData.links.install_software.put){
                        jQuery('#Req_Det_Install').off('click').on('click', () => { //No I18N
                            NewWindowP('/InstallSoftware.do?workOrderID={{request_info.id}}','','600','675','yes','center','yes','yes');//No I18N
                            event.preventDefault();
                        });
                    }
                    if(reqOperData.links.run_script && reqOperData.links.run_script.put){
                        jQuery('#Req_Det_EnableScript').off('click').on('click', () => { //No I18N
                            NewWindowP('/RunScript.do?workOrderID={{request_info.id}}','','800','375','yes','center','yes','yes');//No I18N
                            event.preventDefault();
                        });
                    }
                }
                jQuery('[data-cs-field="technician_layout"]').off('click').on('click', () => { //No I18N
                    $req.layout.open('Technician','tech_layout'); //No I18N
                });
                jQuery('[data-cs-field="requester_layout"]').off('click').on('click', () => { //No I18N
                    $req.layout.open('Requester','req_layout'); //No I18N
                });
                jQuery('[data-cs-field="individual_layout"]').off('click').on('click', () => { //No I18N
                    $req.layout.open('Technician','individual_layout'); //No I18N
                });
                if(reqOperData.request_info.is_trashed) {
                    jQuery('#request-delete-btn').off('click').on('click', () => { //No I18N
                        $req.details.deleteWO($req.details.request_info.id, true, window.getMessageForKey('sdp.requests.viewrequest.deletejserror1')); //No I18N
                    });
                    jQuery('#request-restore-btn').off('click').on('click', () => { //No I18N
                        $req.details.restoreWO($req.details.request_info.id, true, window.getMessageForKey('sdp.requests.viewrequest.restorejserror1')); //No I18N
                    });
                }
                jQuery('#nav_prev').off('click').on('click', () => { //No I18N
                    if(reqOperData.isMSPOrSCP){
                        $req.details.navigateWO(reqOperData.nav_prev,undefined,undefined,undefined,undefined,reqOperData.nav_prev_acc);
                    } else {
                        $req.details.navigateWO(reqOperData.nav_prev);
                    }
                });
                jQuery('#nav_next').off('click').on('click', () => { //No I18N
                    if(reqOperData.isMSPOrSCP){
                        $req.details.navigateWO(reqOperData.nav_next,undefined,undefined,undefined,undefined,reqOperData.nav_next_acc);
                    } else {
                        $req.details.navigateWO(reqOperData.nav_next);
                    }
                });
                jQuery('#timericon-request'+$req.details.request_info.id).off('click').on('click', () => { //No I18N
                    $req.header.openTimer($req.details.request_info.id);
                });
                jQuery('#reCreate a').off('click').on('click', (event) => { //No I18N
                    recreateClosedRequest(reqOperData.recreate_new);
                    event.preventDefault();
                });
                jQuery('#Req_Det_SMSTech').off('click').on('click', () => { //No I18N
                    $req.notify.actions.replyTech('SMS'); //No I18N
                });
                jQuery('#Req_Det_MailTech').off('click').on('click', () => { //No I18N
                    $req.notify.actions.replyTech('E-Mail'); //No I18N
                });
                jQuery('#Req_Det_ForwardReq').off('click').on('click', () => { //No I18N
                    $req.notify.actions.emailForward($req.details.request_info.id,'',false);
                });
                jQuery('#Req_Det_Reply').off('click').on('click', () => { //No I18N
                    $req.notify.actions.emailReply($req.details.request_info.id,true,'',false,false);
                });
                jQuery('#Req_Det_Reply_To').off('click').on('click', () => { //No I18N
                    $req.notify.actions.emailReply($req.details.request_info.id,false,'',false,false);
                });
                jQuery('#Req_Det_Tag').off('click').on('click', (event) => { //No I18N
                    $req.tags.openPopup();
                    event.preventDefault();
                });
                jQuery('#Req_Det_AssociateChecklists').off('click').on('click', (event) => { //No I18N
                    showURLInDialog('/common/ChecklistsListView.jsp?module=requests&id='+$req.details.request_info.id,'position=absmiddle, modal=yes, width=700, top=100, height=500, title=' + window.getMessageForKey('associate.checklists')); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_Share').off('click').on('click', (event) => { //No I18N
                    $req.share.popup('fromActionHeader'); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_SerachSol').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('resolution', ['tab2']); //No I18N
                    event.preventDefault();
                });
                jQuery('#AssociateProject').off('click').on('click', () => { //No I18N
                    $previewComponent.load('/ui/projects?mode=list&from=request&externalframe=true',window.getMessageForKey('sdp.requests.projectdialog.associatetoproject'),'1140px',null,null,'projAssoc_popup', null, null, 'scrolling:no'); //No I18N
                });
                jQuery('#DetachProject').off('click').on('click', () => { //No I18N
                    $req.header.dissociateProject();
                });
                jQuery('#AssociateProblem').off('click').on('click', (event) => { //No I18N
                    $previewComponent.load('/ui/problems?mode=list&from=request&associatedEntityId='+$req.details.request_info.id+'&externalframe=true&operation=associateto',window.getMessageForKey('request.problem.associate'),null,null,null,'listview_popup'); //No I18N
                    event.preventDefault();
                });
                jQuery('#DetachProblem').off('click').on('click', () => { //No I18N
                    $problemGlobal.manageRequestAssociations('DELETE',$req.details.request_info.id); //No I18N
                });
                jQuery('#Req_Det_DeleteReq').off('click').on('click', (event) => { //No I18N
                    if(reqOperData.isDemoDelete){
                        disableForDemo();
                        event.preventDefault();
                    } else {
                        $req.details.deleteWO($req.details.request_info.id);
                        event.preventDefault();
                    }
                });
                jQuery('#Req_Det_PrintPreview').off('click').on('click', (event) => { //No I18N
                    NewWindowP('/workorder/WOPrintPreview.jsp?printMode=true&woID='+$req.details.request_info.id,'','900','700','yes','center','yes','yes', null, null, true); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_ViewAssetOfRequester').off('click').on('click', (event) => { //No I18N
                    ShowUserAssetsPopup({'user_id' : $req.details.request_info.requester.id ,'user_name':  $req.details.request_info.requester.name.replace(/"/g, '\\"').replace(/'/g,"\\'") }); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_ViewReqByRequester').off('click').on('click', (event) => { //No I18N
                    NewWindow('/ListRequests.do?id='+$req.details.request_info.requester.id+'&popUserDetails=true&mode=edit','ListRequests','975','620','yes','center', null, null, null, true); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_ViewRequesterDet').off('click').on('click', () => { //No I18N
                    window.NewWindow('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+$req.details.request_info.requester.id+'&minContent=true', getMessageForKey('sdp.inventory.wsRtPanel.userDetails'), '450', '500', 'yes', 'center', null, null, null, true); //No I18N
                });
                jQuery('#Req_Det_ViewRemainder').off('click').on('click', () => { //No I18N
                    $header.invokeReminders({'mode':'list','entity':'request','entity_id':$req.details.request_info.id }); //No I18N
                });
                jQuery('#Req_Det_ViewTask').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('tasks'); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_ApprovalSubmit').off('click').on('click', () => { //No I18N
                    $req.notify.actions.sendApproval()
                });
                jQuery('#Recommend_Template').off('click').on('click', () => { //No I18N
                    $req.notify.actions.emailReply($req.details.request_info.id,true,'',true,false);
                });
                jQuery('#Req_Det_CreateSerReq').off('click').on('click', (event) => { //No I18N
                    showURLInDialog('/workorder/CreateService.jsp?module=Request&woID='+$req.details.request_info.id,'position=absmiddle, modal=yes, title=' + window.getMessageForKey('sdp.requests.createservice.create')); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_LinkReq').off('click').on('click', () => { //No I18N
                    $req.details.linkRequest($req.details.request_info.id);
                });
                jQuery('#Req_Det_AddClosureCode').off('click').on('click', (event) => { //No I18N
                    showURLInDialog('AddClosureCode.do?workorderID='+$req.details.request_info.id,'position=absmiddle, modal=yes, top=200, left=300,title=' + window.getMessageForKey('sdp.request.add.closurecode')); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_MergeReq').off('click').on('click', () => { //No I18N
                    $req.details.mergeRequest($req.details.request_info.id);
                });
                jQuery('#Req_Det_AddDependency').off('click').on('click', (event) => { //No I18N
                    NewWindow('/AssoDependencyRequest.do?mode=getWindow&WorkorderId='+$req.details.request_info.id, 'AddDependency','1000','600','yes','center'); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_AddWorkLog').off('click').on('click', () => { //No I18N
                    $tasks.loadWorkLog('form', 'request', $req.details.request_info.id, '', '', '', '', 'reqActions'); //No I18N
                });
                jQuery('#Req_Det_AddRemainder').off('click').on('click', () => { //No I18N
                    $header.invokeReminders({'mode':'add','entity':'request','entity_id':$req.details.request_info.id}); //No I18N
                });
                jQuery('#Req_Det_AddTask').off('click').on('click', (event) => { //No I18N
                    $tasks.loadTasks('form','request', $req.details.request_info.id,'','reqAction'); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_AddTaskByTemp').off('click').on('click', (event) => { //No I18N
                    $tasks.loadTasks('template','request', $req.details.request_info.id,'','reqAction'); //No I18N
                    event.preventDefault();
                });
                jQuery('#addnotes').off('click').on('click', () => { //No I18N
                    $req.details.addNotes();
                });
                jQuery('#Req_Det_AddAttach').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab("details", null, event, undefined, {action:"AddAttach"}); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_AddResolution').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('resolution',['tab1','&editResolution=true','', $req.details.request_info.status.name]); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_Det_StopTimer').off('click').on('click', (event) => { //No I18N
                    NewWindow('HoldRequest.do?woMode=hold&workorderID='+$req.details.request_info.id,'AddDesc','500','300','yes','center'); //No I18N
                    event.preventDefault();
                });
                jQuery('#Req_StartTimer').off('click').on('click', (event) => { //No I18N
                    NewWindow('HoldRequest.do?woMode=unhold&workorderID='+$req.details.request_info.id,'AddDesc','500','300','yes','center'); //No I18N
                    event.preventDefault();
                });
                jQuery('#Request_Cancel').off('click').on('click', () => { //No I18N
                    cancel_request.showCancelRequestPopup($req.details.request_info.id);
                });
                jQuery('#Requesting_Cancel').off('click').on('click', () => { //No I18N
                    cancel_request.showRequestForCancelPopup($req.details.request_info.id);
                });
                jQuery('#Revoke_Cancel').off('click').on('click', () => { //No I18N
                    cancel_request.showRevokeCancellationPopup($req.details.request_info.id);
                });
                jQuery('#change_actionMenu').off('click').on('click', (event) => { //No I18N
                    showChangeDialog($req.details.request_info.id);
                    event.preventDefault();
                });
                jQuery('#Req_Det_associatedChange').off('click').on('click', (event) => { //No I18N
                    showChangeDialog($req.details.request_info.id);
                    event.preventDefault();
                });
                jQuery('#Req_Det_purchaseOrderSearch').off('click').on('click', (event) => { //No I18N
                    NewWindow('/POToWOList.do?operation=associate_po&workOrderID='+$req.details.request_info.id, 'associatePO','800','540','yes','center'); //No I18N
                    event.preventDefault();
                });
                if(reqOperData.links.export_request_as_pdf && reqOperData.links.export_request_as_pdf.get){
                    jQuery('#Req_Exp_Pdf').off('click').on('click', () => { //No I18N
                        $req.header.exportAspdf('RequestDetails',$req.details.request_info.id); //No I18N
                    });
                }
                if(reqOperData.links.move_request && reqOperData.links.move_request.put){
                    jQuery('#Req_Det_Move').off('click').on('click', (event) => { //No I18N
                        jQuery('#moveRequestLoad').load('/workorder/moveRequest.jsp'); //No I18N
                        event.preventDefault();
                    })
                }
                if(reqOperData.links.survey) {
                    if(reqOperData.links.survey.post){
                        jQuery('#Req_Det_CreateSurvey').off('click').on('click', () => { //No I18N
                            surveyCommon.sendSurveyForRequest($req.details.request_info.id, $req.details.request_info.requester.id);
                        });
                    }
                    if(reqOperData.links.survey.get) {
                        jQuery('#Req_Det_ViewSurvey').off('click').on('click', (event) => { //No I18N
                            getMappedIdAndInvokeURL('survey','/survey/ViewResponse.jsp?responseID=', $req.details.request_info.id); //No I18N
                            event.preventDefault();
                        });
                    }
                }
                if(reqOperData.links.survey_skip && reqOperData.links.survey_skip.get) {
                    jQuery('#Req_Det_SkipSurvey').off('click').on('click', () => { //No I18N
                        showalert('info', getMessageForKey('sdp.admin.survey.fillsurvey.skipped'), 'isAutoHide=false'); //No I18N
                    });
                }
            },
            tag_template: function(parentDiv) {
                jQuery("#"+parentDiv+" "+"#tag_save").off("click").on("click", (event) => { //No I18N
                   $req.tags.save(event.currentTarget);
                   return false;
                });
                jQuery("#"+parentDiv+" "+"#tag_cancel").off("click").on("click", (event) => { //No I18N
                    $req.tags.cancel(event.currentTarget);
                    return false;
                });
                jQuery("#"+parentDiv+" "+".tags-list .tags-icon").off("click").on("click", (event) => { //No I18N
                    $req.tags.remove(jQuery(event.currentTarget).attr('data-id').replace('tags-close-',''), event.currentTarget); //No I18N
                });
                jQuery("#"+parentDiv).off("click").on("click",'[data-action-name="tag-details"]', (event) => { //No I18N
                    $req.tags.showTaggedRequests(jQuery(event.currentTarget).attr('data-id').replace('tag-text-',''), event.currentTarget); //No I18N
                });
                jQuery("#"+parentDiv+" "+"#tagsAddNew").off("click").on("click", () => { //No I18N
                    $req.tags.editMode(event.currentTarget);
                });
                jQuery("#"+parentDiv+" "+"#showLess").off("click").on("click", () => { //No I18N
                    $req.tags.showLessTags(event.currentTarget);
                });
                jQuery("#"+parentDiv+" "+"#showMore").off("click").on("click", () => { //No I18N
                    $req.tags.showMoreTags(event.currentTarget);
                });
            }
	    },
	    property_templates: {
            cost_preview_template: function() {
                jQuery('#technician_cost_view >button').off('click').on('click', () => { //No I18N
                    return costView.toggleView();
                })
            },
            desc_actions_template: function() {
                $req.details.request_info.has_draft && jQuery('#desc-actions [data-action-name="view-drafts"]').off('click').on('click', () => {
                    $req.details.toggleDraft();
                });
                if(sdp_user.USERTYPE === 'Technician'){
                    jQuery('#desc-actions [data-cs-field="reply_to_btn"]').off('click').on('click', () => {
                        $req.notify.actions.emailReply($req.details.request_info.id, false, '', false, false);
                    });
                    jQuery('#desc-actions [data-cs-field="forward_btn"]').off('click').on('click', () => {
                        $req.notify.actions.emailForward($req.details.request_info.id, '', false);
                    });
                    /* Will be set the request_info before rendering this hbs */
                    if($req.details.request_info.showRecommendTemplate){
                        jQuery('#desc-actions [data-cs-field="recommend_btn"]').off('click').on('click', () => {
                            $req.notify.actions.emailReply($req.details.request_info.id, true, '', true, false);                        });
                    }
                }
                jQuery('#desc-actions [data-cs-field="reply_btn"]').off('click').on('click', () => { //No I18N
                    $req.notify.actions.emailReply($req.details.request_info.id, true, '', false, false);
                });
            },
            desc_body_template: function() {
                jQuery("#show-more-desc >span").off('click').on('click', () => {
                    $req.details.showFullDescription();
                });
            },
            desc_header_template: function() {
                jQuery("#scroll-to-req-attachments").off('click').on('click', () => { //No I18N
                    $req.details.scrollToDescAttachments('#desc-attachments', event, window.externalframe ? '#req-details-preview' : undefined);
                });
                if(sdp_user.USERTYPE === 'Technician'){
                    jQuery('#desc-header [data-cs-field="reply_to_btn"]').off('click').on('click', () => {
                        $req.notify.actions.emailReply($req.details.request_info.id, false, '', false, false);
                        return false;
                    });
                    jQuery('#desc-header [data-cs-field="forward_btn"]').off('click').on('click', () => {
                        $req.notify.actions.emailForward($req.details.request_info.id, '', false);
                        return false;
                    });
                }
                jQuery('#desc-header [data-cs-field="reply_btn"]').off('click').on('click', () => { //No I18N
                    $req.notify.actions.emailReply($req.details.request_info.id, true, '', false, false);
                    return false;
                });
            },
            drafts_template: function() {
                jQuery("#draft-count-panel").off('click').on('click', () => {
                    $req.details.toggleDraft();
                });
                jQuery("#drafts-list").off('click').on('click', '[data-action-name="view-draft"]', (event) => {
                    let eleDataset = event.currentTarget.dataset;
                    $req.notify.actions.renderDraftWindow(eleDataset.id);
                })
                jQuery("#send-draft-for-review").off('click').on('click', (event) => { //No I18N
                    $review_window.openReviewDialog(false,$req.details.request_info.id);
                })
                jQuery("#delete-draft").off('click').on('click', (event) => { //No I18N
                    let eleDataset = event.currentTarget.dataset;
                    $req.notify.actions.deleteDraft(eleDataset.id);
                })
            },
            field_template: function() {
                /* Checking if alteast one element is construct with editable. If so, declaring event delegation */
                if(jQuery('#propertyDetailForm [data-action-name="edit-field-value"]').length){
                    jQuery('#propertyDetailForm').off('click').on('click', '[data-action-name="edit-field-value"],[data-action-name="save-inline-edit"],[data-action-name="cancel-inline-edit"]', (event) => {
                        let currentEle = event.currentTarget;
                        let actionName = currentEle.dataset.actionName;

                        if (actionName === 'edit-field-value') {
                            let eleDataset = currentEle.dataset;
                            $req.prop.setInlineEdit(eleDataset.name);
                        } else {
                            let parentActionsEle = currentEle.closest('.spot-actions');
                            let fieldKey = parentActionsEle.dataset.actionName;

                            if (actionName === 'save-inline-edit') {
                                $req.prop.inlineSave(fieldKey, true);
                            } else if (actionName === 'cancel-inline-edit') {
                                $req.prop.inlineCancel(fieldKey, true);
                            }
                        }
                        return false;
                    });
                }
                jQuery(`[name="asset_info"]`).off('click').on('click', (event) => {
                	let ele = jQuery(event.currentTarget);
                	let id = ele && ele.data('asset_id')
                	$req.prop.openAssetInfo(event,id);
                	return false;
                });
                jQuery(`[name="request_ci_info"]`).off('click').on('click', (event) => {            //No I18N
                	let ele = jQuery(event.currentTarget);
                	let id = ele && ele.data('ciId');                                               //No I18N
                	$req.prop.openCIInfo(event,id);
                	return false;
                });
                jQuery(`[name="toggle_show_more"]`).off('click').on('click', (event) => {
                  let ele= jQuery(event.currentTarget), field = ele.data('toggle_field');//No I18N
                  let moreClass = (field=="assets")?"asset-more":"show-more",  lessClass =(field=="assets")?"asset-less":"show-less";
                    let toggle_more= ele.hasClass(lessClass);
                	if(toggle_more){
                	  $req.prop.toggleMultiSelectOption(event,field,moreClass,lessClass);
                	}else if(ele.hasClass(moreClass)){
                		$req.prop.toggleMultiSelectOption(event,field,lessClass,moreClass);
                	}
                	return false;
                });
                jQuery(`[name="show_more_text"]`).off('click').on('click', (event) => {
                	   let ele= jQuery(event.currentTarget),field = ele.data('toggle_field');//No I18N
                    	$req.prop.showFullTextDialog(event,ele.get(0),field);
                	})
                	jQuery(`[name="maintenance_preview"]`).off('click').on('click', (event) => {
                	requestListViews.openMaintenancePreview($req.details.request_info.maintenance.id);
                });
            },
            property_section_template: function() {
                jQuery("#prop-edit-btn").off('click').on('click', () => { //No I18N
                    $req.prop.sectionalFieldsEdit();
                });
                jQuery("#propertyDetailForm").off('submit').on('submit', () => { //No I18N
                    return false;
                });
                jQuery("#bottom-property-action .sect-save").off('click').on('click', () => { //No I18N
                    $req.prop.inlineSave();
                    return false;
                });
                jQuery("#bottom-property-action .sect-cancel").off('click').on('click', () => { //No I18N
                    $req.prop.renderForm();
                    return false;
                });

                /* Binding the partial template's events */
                $req.details.bindEvents.property_templates.field_template();
            },
            resource_edit_template: function() {
                jQuery("#resource-action").off('click').on('click', () => { //NO I18N
                    $req.resource.setUpdatedResource();
                });
                jQuery("#resource-action-cancel").off('click').on('click', () => { //No I18N
                    $req.resource.closeResDialog();
                });
                jQuery("#resEditForm").off('click').on('click', 'span[name=infoIcon]', (event) => { //No I18N
                    let eleDataset = event.currentTarget.dataset;
                    getProductInfo2('select_' + eleDataset.actionKey); //No I18N
                });
                jQuery("#resEditForm").off('change').on('change', 'input[data-action-name="update-answers"],input[data-action-name="update-answers-and-cost"]', (event) => {
                    let eleDataset = event.currentTarget.dataset;
                    if(eleDataset.actionName === 'update-answers-and-cost'){
                        $req.resource.addRemoveCostDetails(event.currentTarget, eleDataset.field);
                    }
                    $req.resource.checkBoxOptionsLimit(event.currentTarget, event.currentTarget.getAttribute('name'));
                });
            },
            resource_view_template: function() {
                jQuery("#res-edit-btn").off('click').on('click', () => { //No I18N
                    $req.resource.resourcesformFieldsEdit();
                });
                jQuery("#resourceDetailsForm").off('click').on('click', '[data-cs-field=view_option_image]', (event) => { //No I18N
                    let eleDataset = event.currentTarget.dataset;
                    $req.resource.viewOptionImages(eleDataset.qstnId, eleDataset.ansId);
                });
            },
            close_popup: function() {
                jQuery("#clsReqLeftNav").off('click').on('click', '[data-action-name="navigate-tab"]', (event)=> {
                    $req.prop.wizard.changeWizard(jQuery(event.currentTarget).data('tab-index'), true); //No I18N
                });
                jQuery("#closeRequestPopUp .dialog-cancel").off('click').on('click', () => {  //No I18N
                    $req.prop.wizard.cancel=true;
                    jQuery('#closeRequestPopUp').dialog('close'); //No I18N
                    return false;
                });
            },
            close_popup_content: function() {
                if($req.details.request_info.is_fcr){
                    jQuery("#checkFCR_label").off('click').on('click', (event) => { //No I18N
                        clickFromFCR(event.currentTarget);
                    });
                }
                if(sdp_app.IS_SCP){
                    jQuery("#wotoClose [name=closeWithoutNotif]").off('click').on('click', (event) => { //No I18N
                        clickFromCloseWithoutNotif(event.currentTarget);
                    });
                }
                jQuery("form[name=WOCloseCheckForm] .form-footer [name=CloseAccept]").off('click').on('click', (event) => { //No I18N
                    $req.prop.submitCloseAccepted(event.currentTarget.form, $req.details.self_service_portal_settings.status_change_comment);
                });
                jQuery("form[name=WOCloseCheckForm] .form-footer [name=CancelAccept]").off('click').on('click', (event) => { //No I18N
                    let statusId = currentEle.dataset.id;
                    if($req.details.self_service_portal_settings.status_change_comment){
                        $req.prop.hideClosureCodeDetails(statusId);
                    }
                    else{
                        $req.prop.setPrevStatusId(statusId);
                    }
                });
                if($req.details.request_closing_rules.is_auto_close_enabled){
                    if($req.details.request_info.is_fcr){
                        jQuery("#reqCheckFCR_label").off('click').on('click', (event) => { //No I18N
                            clickFromFCR(event.currentTarget);
                        });
                    }
                    jQuery("form[name=closureForCompletedStatus] [name='resolved-status-update']").off('click').on('click', (event) => { //No I18N
                        $req.prop.updateClosureFields(event.currentTarget.form, $req.details.self_service_portal_settings.status_change_comment);
                    });
                    jQuery("form[name=closureForCompletedStatus] [name='resolved-status-cancel']").off('click').on('click', (event) => { //No I18N
                        let statusId = currentEle.dataset.id;
                        if($req.details.self_service_portal_settings.status_change_comment){
                            $req.prop.hideClosureCodeDetails(statusId);
                        }
                        else{
                            $req.prop.setPrevStatusId(statusId);
                        }
                    });
                }
            },
            view_option_details: function() {
                optionsViewer && optionsViewer.onChange && jQuery('#optionsSlider [data-action-name="update-answer"]').off('change').on('change', (event) => { //No I18N
                    let currentEle = event.currentTarget;
                    execFuncByName(optionsViewer.onChange, window, currentEle, currentEle.getAttribute('fafr-name'), jQuery(currentEle).val());
                });
            },
            sgt_popup: function() {
                jQuery('#technicianPopUp .form-footer .sgt-assign').off('click').on('click', $req.prop.assignRightPanelTechnician); //No I18N
                jQuery('#technicianPopUp .form-footer .sgt-cancel').off('click').on('click', () => { //No I18N
                    $req.prop.cancelRightPanelTechnician(true);
                });
                jQuery("#assign-notes .text-link").off("click").on("click", (event) => { //No I18N
                    $req.prop.openAssignComments();
                    event.preventDefault();
                });
            },
            status_onhold_template: function(woOnHoldJSON) {
                if($req.details.self_service_portal_settings.status_change_comment){
                    jQuery('[name="woOnHoldForm"] .form-footer [name="Update"]').off('click').on('click', () => { //No I18N
                        $req.prop.runOnHoldScheduler(event.currentTarget.form,$req.details.self_service_portal_settings.status_change_comment);
                    });
                }
                else{
                     jQuery('[name="woOnHoldForm"] .form-footer [name="Update"]').off('click').on('click', () => { //No I18N
                         $req.prop.runOnHoldScheduler(event.currentTarget.form);
                     });
                }
                jQuery('[name="woOnHoldForm"] .form-footer [name="cancel"]').off('click').on('click', () => { //No I18N
                    $req.prop.setPrevStatusId($req.details.request_info.id);
                });
                jQuery('#date1_Display').off('click').on('click', () => { //No I18N
                    initCalendar('date1'); //No I18N
                });
                jQuery('[forfieldid="date1"]').off('click').on('click', () => { //No I18N
                    initCalendar('date1'); //No I18N
                });
                jQuery('#changeStatusSelect').off('change').on('change', $req.prop.checkUncheck); //No I18N
                jQuery('#statusIdCheck').off('click').on('click', $req.prop.checkUncheck); //No I18N
            },
            wo_tabs_template : function() {
                jQuery('#details-tab').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('details', null, event); //No I18N
                });
                jQuery('#properties-tab').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('properties', null, event); //No I18N
                });
                jQuery('#approvals-tab').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('approvals', null, event); //No I18N
                });
                jQuery('#tasks-tab').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('tasks', null, event); //No I18N
                });
                jQuery('#checklists-tab').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('checklists', null, event); //No I18N
                });
                jQuery('#worklogs-tab').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('worklogs', null, event); //No I18N
                });
                jQuery('#dependency-tab').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('dependency', null, event); //No I18N
                });
                jQuery('#time_analysis-tab').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('time_analysis', null, event); //No I18N
                });
                jQuery('#history-tab').off('click').on('click', (event) => { //No I18N
                    $req.details.changeTab('history', null, event); //No I18N
                });
                if($req.details.operational_data.allowed_tabs.contains('resolution_sugg')){
                    jQuery('#resolution-sugg-tab').off('click').on('click', (event) => { //No I18N
                        $req.details.changeTab('resolution', ['tab2'], event); //No I18N
                    });
                    jQuery('#resolution-tab').off('click').on('click', (event) => { //No I18N
                        $req.details.changeTab('resolution', ['tab1'], event); //No I18N
                    });
                }
                if($req.details.operational_data.allowed_tabs.contains('resolution')){
                    jQuery('#resolution-tab').off('click').on('click', (event) => { //No I18N
                        $req.details.changeTab('resolution', ['tab1', '', '', $req.details.operational_data.req_status_type], event); //No I18N
                    });
                }
                if($req.details.operational_data.allowed_tabs.contains('resolution_req')){
                    jQuery('#resolution-tab').off('click').on('click', (event) => { //No I18N
                        $req.details.changeTab('resolution', ['tab1', '', 'requester'], event); //No I18N
                    });
                }
            }
  	    }
	 }
};


/**
 * Request top header actions
 */
$req.header = {
	//Export Pdf options
	exportAspdf:function(page,WOID){
		let url={'ArchivedRequestDetails':`/workorder/PrintConf.jsp?woID=${WOID}&woMode=PrintView&printModule=Archive Request&fromexportPDF=true`, // No I18N
			'RequestDetails':`/workorder/WOPrintPreview.jsp?woID=${WOID}&fromexportPDF=true` // No I18N
	};
		exportPdf({url:url[page],fileName:`${page}_${WOID}`});
	},
	/*
	 * Opens the Timer pop up and fetches the timer details and updates the content
	 * params {string} woID request ID
	 * params {string} selector when technician timer trigger from listview
	 */

	openTimer: function(woID, selector) {
		$req.details.timer_info = this.getTimer(woID)
		var timer_data = {};
		timer_data.self_timer = $req.details.operational_data.links && $req.details.operational_data.links.worklog_timer && $req.details.operational_data.links.worklog_timer.post ? false : true;
		timer_data.woId = $req.details.request_info.id;
		timer_data.techId = $req.sdp_user.LOGGEDIN_USERID;
		timer_data.worklog_timers = $req.details.timer_info;
		timer_data.can_add_wlog = $req.details.operational_data.links && $req.details.operational_data.links.worklog && $req.details.operational_data.links.worklog.post ? true : false;
		timer_data.is_list_view = selector ? true : false;
		let afterRenderfn = function() {
		    $req.details.bindEvents.templates.header_worklog_timer(timer_data, selector);
		}
		renderhbs(`#${selector || 'worklog-timer'}`, 'header-worklog-timer', timer_data, false, 'requests', true, null, afterRenderfn); //No I18N
		jQuery('#'+ (selector || 'worklog-timer')).removeClass('hide');
		/* updates the timer count in the WO Header */
		if($req.details.timer_info) {
			var timerCount = $req.details.timer_info.length;
			if(timerCount > 1 && jQuery('.wlt-tech-count').length > 0) {
				jQuery('.wlt-tech-count').removeClass("hide").text(timerCount);	//No I18N
			} else {
				jQuery('.wlt-tech-count').addClass("hide");
			}
		}
	},

	/*
	 * Closes the Timer pop up
	 */
	closeTimer: function() {
		jQuery('.worklog-timer').addClass('hide');
		return false;
	},

	/*
	 * starts / stops the Timer for the given Request ID
	 * param {boolean} isListview the function triggered from listview
	 */
	toggleTimer: function(woID, isListview) {
		var timer_comment = jQuery('#wl-timer-comment').val();
		sdpAjax({
			url: '/servlet/HdClientUtilServlet?command=stopTechTimer&woID='+woID+'&currenttechStatus='+encodeURIComponent(timer_comment),	//No I18N
			type: 'POST',	//No I18N
			dataType: 'text',	//No I18N
			success: function(data) {
				if (data.indexOf("success") > -1) {
					if(!isListview){
						$req.details.timer_info = $req.header.getTimer(woID);
						$req.details.getWOLinks(woID);
						$req.details.renderWOHeader();
						$req.header.updateTimer(woID, true);
					} else {
						jQuery("#worklog_timer_" + woID).addClass("hide");
						window.current_req_mode == "combined" ? table_combined_task.refreshTable("refresh") : table_comp_request.refreshTable("refresh"); //No I18N
					}
				}
			}
		});
	},

	/*
	 * Updates the Timer count in the Timer button in WO Header
	 * @param: woID - Request ID, for which timer details needs to be fetched
	 * @param: fetchFromLocal - Boolean, true denotes to get the info from already available data, else fetch from Server
	 */
	updateTimer: function(woID, fetchFromLocal) {
		var timerInfo;
		if(fetchFromLocal && $req.details.timer_info ) {
			timerInfo = $req.details.timer_info;
		} else {
			timerInfo = this.getTimer(woID);
		}
		if(timerInfo && timerInfo) {
			var timerCount = timerInfo.length;
			if(timerCount > 1 && jQuery('.wlt-tech-count').length > 0) {
				jQuery('.wlt-tech-count').removeClass("hide").text(timerCount);	//No I18N
			} else {
				jQuery('.wlt-tech-count').addClass("hide");
			}
		}
	},

	/* Fetches the timer information for the given Request ID */
	getTimer: function(woID) {
		var timerDetails;
		sdpAjax({
			url: '/api/v3/requests/'+woID+'/worklog_timers',	//No I18N
			type: 'GET',	//No I18N
			cache: false,
			async: false,
			success: function(data) {
				timerDetails = data.worklog_timers;
			}
		});
		return timerDetails;
	},

	/*
	 * Load the Collaboration Details
	 */
	loadCollabrationDetails:function() {
		if(sdp_user.USERTYPE == 'Technician') {
			pagenotif.register();
		}
	},
	// Get and set (pending Request Count)
	getPendingRequestCount: function(userId,userName){
		if(isMSPOrSCP && !sdp_feature_status.show_requester_pending_request_count) {
			// do not fetch the count if the feature isn't enabled
			return;
		}
		var inputObject = {},list_info = {}, result, requesterId, requesterName;
		requesterId = userId ? userId : $req.details.request_info.requester.id;
		requesterName = userName ? userName : $req.details.request_info.requester.name;
  		inputObject.list_info={"get_total_count":true,"search_criteria":{ field: 'requester.id', value: requesterId, condition: 'eq'},"filter_by":{"name":"All_Pending"}}; //No I18N
  		result=sdpAjaxInputData(inputObject);
  		sdpAjax({
			url: '/api/v3/requests', // No I18N
			type: 'GET',	//No I18N
			cache:false,
			data:result,
			success:function(data) {
				if(data.list_info.total_count != 0){
					var $title = getMessageForKey('sdp.home.summary.openRequestsTitle')+" - "+encodeHTMLAttribute(requesterName);
                    if(userId){
                    	jQuery("#showRequests").text(data.list_info.total_count+" "+getMessageForKey('sdp.home.summary.openRequestsTitle')).attr({title : $title}).off('click').on('click',(event)=>{
                    		NewWindow('/ListRequests.do?id='+requesterId+'&popUserDetails=true&mode=edit&filterBy=All_Pending','showrequestsforuser',900,600,'yes','center');
                    		return false;
                    	});
                    }
                    else{
                    	jQuery("#Req_Det_ViewReqByRequester").text(getMessageForKey('sdp.requests.viewrequest.viewreqRequests')+" ("+data.list_info.total_count+")").attr({title:$title}).off('click').on('click',(event)=>{
                    		NewWindow('/ListRequests.do?id='+requesterId+'&popUserDetails=true&mode=edit&filterBy=All_Pending','ListRequests',975,620,'yes','center');
                    		return false;
                    	});
                    }
				}
				else{
					if(userId){
						jQuery("#showRequests").text(getMessageForKey('sdp.request.requester.showrequests')).attr({title : getMessageForKey('sdp.requests.viewrequest.viewRequests')+" - "+encodeHTMLAttribute(requesterName)}).off('click').on('click',(event)=>{
							 showRequesterRequests();
							 return false
						});
					}
				}
				$req.details.pending_req_count = data.list_info.total_count;
            },
            ignorefailuremessage:true,
            error:function(){
            	return false;
            }
        });
  	},
  	// Construct list request URL
  	constructListReqUrl : function(param){
  		return "NewWindow('/ListRequests.do?id="+param.reqId+"&popUserDetails=true&mode=edit&filterBy=All_Pending','"+param.key+"','"+param.width+"','"+param.height+"','yes','center');return false;"
  	},
  	notifyOnReply:function(woId){
  		if ($notification_popup.checkMailConfigured) {
            sdpAjax({
                async: false,
                type:"POST",//No I18N
                url: "/servlet/SDAjaxServlet?action=notification-invoke&module=request&moduleid="+woId, //NO I18N
                ignorefailuremessage:true
            });
  	}
  	},
     dissociateProject: function(){
        var project = $req.details.request_associations["project_request_association"].project;
       sdpAjax({
           url:'/api/v3/requests/'+woID+'/projects',//No I18N
           type:"DELETE", data: sdpAjaxInputData({"projects":[{"project":{"id": project.id}}]}),//No I18N
           success: function(resp){
               showalert("success", translate("api.dissociate.success.msg", [translate("common.project")]), "isAutoHide=true");//No I18N
               $req.details.updateRequestTemplates('project');//No I18N
           }
       })
   }
};

$req.conv = {
	/**
	 * Constructs the basic configurations for conversation component in request details and list page
	 * @param {Object} $req_details Request details object
	 * @param {Boolean} fromListView Where config is constructed for list page. Used in email related methods
	 */
	constructConfig: function($req_details,fromListView){
		var woID = $req_details.request_info.id;
		var isRetiredHelpdesk = window.hasOwnProperty("esm_details") && window.esm_details.hasOwnProperty("current_portal") && window.esm_details.current_portal.isRetired; //No I18N
		var group_id = 0;
		var conv_config = {
			"module": "requests",	//No I18N
			"module_id": woID,	//No I18N
			"system_notifications": true,	//No I18N
			"notes": {	//No I18N
				has_linked_requests: function(){ return $req_details.request_info.has_linked_requests },
				mark_first_response: function(){ return !$req_details.request_info.hasOwnProperty("responded_time") },	//No I18N
				fields_required : ["added_by","added_time","last_updated_by","last_updated_time","request","show_to_requester","has_attachments"]	//No I18N
			},
			"expand": { 	//No I18N
				"expand_panel": window.print_mode ? true : false	//No I18N
			},
			"selected_filters": window.print_mode ? false : ["email", "notes"],	//No I18N
			"lazy_load": false,	//No I18N
			"sort": {	//No I18N
				"order": window.print_mode ? "asc" : "desc",  //No I18N
				"key": window.print_mode ? "" : "request_conv_sort" //No I18N
			},
			"show_count": window.print_mode ? 500 : 10,	//No I18N
			"notes_count": 25,	//No I18N
			"row_count": 500,	//No I18N
			"preview_mode": window.print_mode ||  $req_details.request_info.is_trashed || isRetiredHelpdesk,	//No I18N
			"externalframe": window.externalframe, 	//No I18N
			"visibility": true,	//No I18N
			"canChangeNotificationVisibility":sdp_user.ROLES.indexOf("ModifyRequests") > -1,//No I18N
			"allowed_operations":{	//No I18N
				"note": [],	//No I18N
				"email": []	//No I18N
			},
			"emailReply": function(data,replyAll){ //No I18N
				$req.notify.actions.emailReply(woID,replyAll,data.conv_id,false,fromListView,$req_details);
				//Zia popup will be opened default when there is any information. since event propogation is stopped in conversation.js, this is manually closed here.
				jQuery('#Request_zia_notify').hasClass('open') ? jQuery('#Request_zia_notify').removeClass('open') : '';//No I18N
			},
			"emailForward": function(data){ //No I18N
				$req.notify.actions.emailForward(woID,data.conv_id,fromListView,$req_details);
				//Zia popup will be opened default when there is any information. since event propogation is stopped in conversation.js, this is manually closed here.
				jQuery('#Request_zia_notify').hasClass('open') ? jQuery('#Request_zia_notify').removeClass('open') : '';//No I18N
			},
			"emailSplit": function(data){ //No I18N
				$req.notify.actions.emailSplit(woID,data.conv_id,fromListView);
			},
			"emailResend": function(data){ //No I18N
				$req.notify.actions.emailResend(woID,data,fromListView);
				//Zia popup will be opened default when there is any information. since event propogation is stopped in conversation.js, this is manually closed here.
				jQuery('#Request_zia_notify').hasClass('open') ? jQuery('#Request_zia_notify').removeClass('open') : '';//No I18N
			},
			"afterLoadConversations" : function() {	//No I18N
				setTimeout(function(){
					if(window.print_mode) {
					    $req.print.update('conversation');	//No I18N
					}
				}, 100);
			}
		};

		if(sdp_user.USERTYPE === "Requester") {
			conv_config.selected_filters = false;
			conv_config.emailReply = function(data){
				$req.notify.actions.emailReply(woID,true,data.conv_id,false,fromListView,$req_details);
			};
		}
		/* add the permissions */
		if($req_details && $req_details.operational_data && $req_details.operational_data.links){
			// check for note permission
			$req_details.operational_data.links.hasOwnProperty("notes")	//No I18N
			 && $req_details.operational_data.links.notes.hasOwnProperty("post")	//No I18N
			 && conv_config.allowed_operations.note.push("add");

			// check for reply permission
			$req_details.operational_data.links.hasOwnProperty("reply")	//No I18N
			 && $req_details.operational_data.links.reply.hasOwnProperty("post")	//No I18N
			 && conv_config.allowed_operations.email.push("reply");

			// check for forward permission
			$req_details.operational_data.links.hasOwnProperty("forward")	//No I18N
			 && $req_details.operational_data.links.forward.hasOwnProperty("post")	//No I18N
			 && conv_config.allowed_operations.email.push("forward");
		}

		sdp_user.USERTYPE === "Technician" && sdp_user.ROLES.indexOf("DeleteRequests") > -1 && conv_config.allowed_operations.email.push("delete");	//No I18N

		if(sdp_user.ROLES.indexOf("CreateRequests") > -1){
			conv_config.allowed_operations.email.push("split");
		}

		return conv_config;
	},
	//Below code is used only in details page
	init: function() {
		var group_id = 0;
		var conv_config = $req.conv.constructConfig($req.details,false);
		conv_config.container = "#conversation-container";	//No I18N
		conv_config.afterNoteAdd = function(response,noteReqData){
			parent.$req.details.updateRequestTemplates("notes");	//No I18N
		};
		conv_config.afterEmailDelete = function(){
			/* reloads the conversation content */
			$req.details.updateRequestTemplates('conversation');	//NO I18N
		};

		if(typeof reqDataFromApprove !== 'undefined') { //Approval
			var json = {
				"conversations": reqDataFromApprove.request_detail.conversations	//No I18N
			};
			for(var conv in json.conversations) {
				if(json.conversations.hasOwnProperty(conv)) {
					if(json.conversations[conv].type=="notes") {
						json.conversations[conv].performed_by=json.conversations[conv].added_by;
						json.conversations[conv].performed_time=json.conversations[conv].added_time;
					}
					else{
					    json.conversations[conv].from = {...json.conversations[conv].sender,profile_pic:null};
					    json.conversations[conv].show_to_requester=json.conversations[conv].is_public;
					}
				}
			}
			json.usertype = "Requester"; //No I18N
			json.replyAllowed = false;
			conv_config.showCount = reqDataFromApprove.request_detail.conversations.length;
			conv_config.has_data = true;
			conv_config.data = json;
		} else {
			/** for non-login approval, approval_key needs to be sent for the authorization in all API calls */
			if(typeof approval_key !== "undefined" && approval_key) {
				conv_config.extra_param = "APPROVAL_KEY=" + approval_key;	//No I18N
			}
		}

    	$req.details.conv = new Conversation(conv_config);
	}
}

$req.notify = {}
$req.notify.actions = {

		notifyConfig :{},
		initConfig : function(fromListView , woId){ //Common configs for all notifications will be constructed  in this method
			if(!$notification_popup.checkForUnsentNotifications(true)){ //If any other notification popup is open already throwing alert and returning false if user clicks cancel button.
				return false;
		    }
			var self=this;
        	self.notifyConfig={};
        	self.notifyConfig.module="request"; //No I18N
			self.notifyConfig.isReplyAssistEnabled = sdp_app.platformai_info.is_reply_assistance_enabled;	//To show GPT icon as reply assistance in the request reply editor
        	self.notifyConfig.module_id=(woId!=undefined)?woId: $req.details.request_info.id;
			/**
			 * SD - 118354 -> String trim overwrite issue fix
			 */
			self.notifyConfig.enableNativeTrim = true;
			if(sdp_user.USERTYPE=='Technician' && !fromListView){
                self.notifyConfig.freezelayer=true;//popup type modal with minimize icon. (As of now freezelayes will only work when popupModel is given modeless because minimize icon will only shown when modeless)
                self.notifyConfig.canMinimize=true;
                self.notifyConfig.popupModel='modeless'; //No I18N
			}
			self.notifyConfig.minimizeCallback= function(data){
                if($req.prop.replyTemplateStatus){ //Before minimizing. Checking whether reply template status is on open.
					if(!confirm(getMessageForKey('mailPopups.minimize'))){
                          return false;   // On clicking cancel button returning false. Minimize event won't  happen.
					}
					$req.details.updateRequestTemplates('property'); //On clicking OK Closing property section and reply template status //NO I18N
				}

				return true;  //Minimize event won't be stopped.
		}
		return true;
		},


	emailReply: function(woId,replyAll,notifyId,recommendTemplate,fromListView,$req_details,ziaTemplate){
		if(!$req.notify.actions.initConfig(fromListView,woId)){ //Building common config
			return false;
		}
		var mailConfig=$req.notify.actions.notifyConfig;
		if(fromListView){
			//To Close conversation popup.
			jQuery("#dialog_closeButton").trigger("click");
		}
		var copied_from = {}
		if(notifyId){
			copied_from.module="request_notification";//No I18N
			copied_from.id=notifyId;
		}
		else{
			copied_from.module="request",//No I18N
			copied_from.id=woId;
		}



			mailConfig.saveDraftCallback= this.saveDraftCallback;
			mailConfig.dialog_height= 550;
			mailConfig.fromListView= fromListView;
			mailConfig.closeOnEscKey= "no";//NO I18N
            mailConfig.user_fetch={
                  //SD-113636: End point changed for email field dropdown.
				  url : '/api/v3/requests/notifications/recipient',//No I18N
				  lookup_field : 'recipient',//No I18N
                  search_keys:['name','email_id']//NO I18N
             };
		if(notifyId){
				mailConfig.sub_module_id= notifyId;
			}
			if(recommendTemplate && ziaTemplate){

				mailConfig.zia_suggested_template = ziaTemplate

			}

		if(fromListView){
			mailConfig.module_info = $req_details;
		}
		else{
			mailConfig.module_info = $req.details;
		}
		mailConfig.copied_from = copied_from;
		mailConfig.imgParameters = {module:"request_notification", withURL: false, noForm: true};//No I18N
		mailConfig.afterNotificationSent = function(){
			if(fromListView){
				if(sdp_user.USERTYPE == "Technician" && $req.prop.replyTemplateStatus){
					$req.prop.inlineSave();
					$req.prop.replyTemplateStatus = false;
				}
				jQuery("#view_conversation_"+woId).get(0).click();
			}
			else{
				setTimeout(function() {
					parent.$req.details.updateRequestTemplates('conversation');	//No I18N
				},1000);
				if(sdp_user.USERTYPE == "Technician" && $req.prop.replyTemplateStatus){
					$req.prop.inlineSave();
					$req.prop.replyTemplateStatus = false;
				}
			}
		};
		mailConfig.afterNotificationCancel = function(){
			if(fromListView){
				jQuery("#view_conversation_"+woId).get(0).click();
			}else if($req.prop.replyTemplateStatus){
        		$req.prop.renderForm();
        	}
		};
		if(sdp_user.USERTYPE == "Technician"){
			mailConfig.type= "notify_request"; //No I18N

			mailConfig.autoDraft = true;
			mailConfig.enableDraft = true;
			mailConfig.saveDraftCallback = this.saveDraftCallback;
			mailConfig.has_bcc=true;
			if(fromListView){
				mailConfig.draftInterval = $req_details.self_service_portal_settings.auto_save_interval;
			}
			else{
				mailConfig.draftInterval = $req.details.self_service_portal_settings.auto_save_interval;
			}
			mailConfig.show_status_update = (sdp_user.ROLES.indexOf('ModifyRequests') > -1) ? true : false;
			if(recommendTemplate){
				mailConfig.template_type = "RecommendTemplate_E-Mail"; //No I18N
				mailConfig.recommend_template_window = true;
				mailConfig.custom_type= "recommend_template" ; //No I18N
				mailConfig.validateNotificationForm = function(form){
					if(!jQuery(form).find("#recommendtemplateid").val()){
						showalert('warning', translate("admp.choose.template"),'isAutoHide=true'); //No I18N
						return false;
					}
					return true;
				}

			}
			else{
				mailConfig.template_type = "RequestReply_E-Mail";//No I18N
				mailConfig.show_reply_templates = true;
				mailConfig.custom_type= "reply" ; //No I18N
			}

			if(!replyAll){
				mailConfig.populate_cc = false;
			}
			var can_create_reply_template = false;
			if(fromListView){
				can_create_reply_template = $req_details.self_service_portal_settings.can_create_reply_template;
			}
			else{
				can_create_reply_template = $req.details.self_service_portal_settings.can_create_reply_template;
			}
			mailConfig.allowTechCreateReplyTemplate = can_create_reply_template;

		}
		else{
			mailConfig.template_type = "RequestReply_E-Mail";//No I18N
			mailConfig.type = "conversation"; //No I18N
			mailConfig.custom_type= "conversation";//No I18N
			mailConfig.has_cc=false;
			mailConfig.has_to=false;

		}
		mailConfig.users_fields_required = ['id', 'name', 'email_id']; // No I18N
		if(isMSPOrSCP)
		{
			mailConfig = $req.notify.msp_actions.getMSPOrSCPSpecificConfig(mailConfig);
		}
		$notification_popup.openNotificationForm(mailConfig);
		if(replyAll){
			$CS.findElement("reply_btn").trigger("listen:click");//No I18N
		}else if(recommendTemplate){
			$CS.findElement("recommend_btn").trigger("listen:click");//No I18N
		}else{
			$CS.findElement("reply_to_btn").trigger("listen:click");//No I18N
		}
		$req.header.notifyOnReply(woId);

	},
	emailForward: function(woId,notifyId,fromListView,$req_details){
		if(!$req.notify.actions.initConfig(fromListView,woId)){ //Building common config
			return false;
		}
		if(fromListView){
			//To Close conversation popup.
			jQuery("#dialog_closeButton").trigger("click");
		}
		var mailConfig=$req.notify.actions.notifyConfig;
		var copied_from = {}
		if(notifyId){
			copied_from.module="request_notification";//No I18N
			copied_from.id=notifyId;
		}
		else{
			copied_from.module="request",//No I18N
			copied_from.id=woId;
		}

			mailConfig.type= "notify_request"; //No I18N
			mailConfig.custom_type= "forward";//No I18N
			mailConfig.template_type= "RequestForward_E-Mail";//No I18N
			mailConfig.module_info=$req_details;
			mailConfig.dialog_height= 550;
			mailConfig.fromListView= fromListView;
			mailConfig.closeOnEscKey= "no";//NO I18N
            mailConfig.focusField="to"; //NO I18N
             mailConfig.user_fetch={
                      //SD-113636: End point changed for email field dropdown.
					  url : '/api/v3/requests/notifications/recipient',//No I18N
					  lookup_field : 'recipient',//No I18N
                      search_keys:['name','email_id']//NO I18N
             };
		if(sdp_user.USERTYPE == "Technician"){//No I18N
			mailConfig.show_reply_templates = true;
			var can_create_reply_template = false;
			if(fromListView){
				can_create_reply_template = $req_details.self_service_portal_settings.can_create_reply_template;
			}
			else{
				can_create_reply_template = $req.details.self_service_portal_settings.can_create_reply_template;
			}
			mailConfig.allowTechCreateReplyTemplate = can_create_reply_template;
			mailConfig.autoDraft = true;
			mailConfig.enableDraft = true;
			mailConfig.saveDraftCallback = this.saveDraftCallback;
			if(fromListView){

                mailConfig.draftInterval = $req_details.self_service_portal_settings.auto_save_interval;
			}
			else{
				mailConfig.draftInterval = $req.details.self_service_portal_settings.auto_save_interval;
			}
			mailConfig.has_bcc=true;
		}
		if(notifyId){
				mailConfig.sub_module_id= notifyId;
			}
		mailConfig.copied_from = copied_from;

		mailConfig.imgParameters = {module:"request_notification", withURL: false, noForm: true};//No I18N
		mailConfig.afterNotificationSent = function(){
			if(fromListView){
				jQuery("#view_conversation_"+woId).get(0).click();
			}else{
				setTimeout(function() {
					parent.$req.details.updateRequestTemplates('conversation');	//No I18N
				},1000);
			}
		};
		mailConfig.afterNotificationCancel = function(){
			if(fromListView){
				jQuery("#view_conversation_"+woId).get(0).click();
			}
        };
		mailConfig.users_fields_required = ['id', 'name', 'email_id']; // No I18N
		if(isMSP)
		{
			mailConfig = $req.notify.msp_actions.getMSPOrSCPSpecificConfig(mailConfig);
		}
		$notification_popup.openNotificationForm(mailConfig);
		$CS.findElement("forward_btn").trigger("listen:click");//No I18N
	},
	emailSplit:function(woId,notifyId,fromListView){
		sdpAjax({
				url: "api/v3/requests/"+woId+"/notifications/"+notifyId+"/_split_as_new_request",//No I18N
				type: "PUT",//No I18N
				success: function(response){
					if(response.response_status.status === "success"){

						if(fromListView){
							$conversation.list.reinitialize();
						}
						else{
							$req.details.updateRequestTemplates('conversation');	//No I18N
						}
						setTimeout(function() {
							var requestId = response.request.id;
							var request_Link = "<strong><a href='/WorkOrder.do?woMode=viewWO&woID=" + requestId + "' target='_blank'>" + requestId + "</a></strong>";
							var split_msg = getMessageForKey("sdp.request.split.successmsge",[request_Link]);
	  						$req.utils.alert("success", split_msg, "isAutoHide=false");	//No I18N
						},1000);
					}
				},
				error: function(response){
				    // To re-enable the "Split As New Request" button in case of failure - SD-128553
                    jQuery("[data-cs-field='split_btn']").prop("disabled",false); // No i18N
					response = response.responseJSON;
					if(response.response_status.messages){
						if(typeof response.response_status.messages[0].message === "string"){
							showalert('failure', response.response_status.messages[0].message,"isAutoHide=true"); // No I18N
						}
					}

				}
			});
	},
	emailResend: function(woId,data,fromListView,$req_details){
		if(!$req.notify.actions.initConfig(true,woId)){ // Passing true as parameter .Because freezelayer and minimize icon not needed for resend /Building common config
			return false;
		}
		if(fromListView){
			//To Close conversation popup.
			jQuery("#dialog_closeButton").trigger("click");
		}
		var mailConfig=$req.notify.actions.notifyConfig;
		var copied_from = {
			id : data.conv_id,
			module : "request_notification"//No I18N
		}
            mailConfig.user_fetch={
              //SD-113636: End point changed for email field dropdown.
			  url : '/api/v3/requests/notifications/recipient',//No I18N
			  lookup_field : 'recipient',//No I18N
              search_keys:['name','email_id']//NO I18N
            };
			mailConfig.type= "notify_request"; //No I18N
			mailConfig.custom_type= "resend" ; //No I18N
			mailConfig.get_temp_content_url= data.content_url+"/_get_resend_mail_content"; //No I18N
			mailConfig.module_info= $req_details;
			mailConfig.dialog_height= 550;
			mailConfig.fromListView= fromListView;
			mailConfig.closeOnEscKey= "no";//NO I18N


		if(data.conv_id){
				mailConfig.sub_module_id= data.conv_id;
			}
		mailConfig.afterNotificationSent = function(){
			//TODO need to handle the details page render
			if(fromListView){
				jQuery("#view_conversation_"+woId).get(0).click();
			}
			else{
				setTimeout(function() {
					$req.details.updateRequestTemplates('conversation');	//No I18N
				},1000);
			}
		};
		mailConfig.afterNotificationCancel = function(){
			if(fromListView){
				jQuery("#view_conversation_"+woId).get(0).click();
			}
        };
		mailConfig.copied_from = copied_from;
		mailConfig.imgParameters = {module:"request_notification", withURL: false, noForm: true};//No I18N
		mailConfig.users_fields_required = ['id', 'name', 'email_id']; //No I18N
		if(isMSP)
		{
			mailConfig = $req.notify.msp_actions.getMSPOrSCPSpecificConfig(mailConfig);
		}
		mailConfig.has_bcc=true;$notification_popup.openNotificationForm(mailConfig);//No I18N
		$CS.findElement("resend_btn").trigger("listen:click");//No I18N
	},
	replyTech: function(mode){
		if(!$req.notify.actions.initConfig(true)){  // Passing true as parameter .Because freezelayer and minimize icon not needed for resend /Building common config
			return false;
		}
		var mailConfig=$req.notify.actions.notifyConfig;

		mailConfig.type= "notify_request"; //No I18N
		mailConfig.dialog_height= 550;
		mailConfig.closeOnEscKey= "no"; //NO I18N
        mailConfig.user_fetch={
              //SD-113636: End point changed for email field dropdown.
			  url : '/api/v3/requests/notifications/recipient',//No I18N
			  lookup_field : 'recipient', //No I18N
              search_keys:['name','email_id']//NO I18N
         };
		if(mode != undefined){
			if(mode == "E-Mail"){
				mailConfig.template_type = "ReqTechNotify_E-Mail";//No I18N
				mailConfig.custom_type = "email_technician";//No I18N
				mailConfig.has_bcc = true;
			}
			else if(mode == "SMS"){
				mailConfig.template_type = "Technician_SMS";//No I18N
				mailConfig.mode = "SMS"; //No I18N
				mailConfig.custom_type = "sms_technician";//No I18N
				mailConfig.has_cc = false;
				mailConfig.email_copy=false;
				mailConfig.email_draggable=false;
			}
		}
		mailConfig.imgParameters = {module:"request_notification", withURL: false, noForm: true};//No I18N
		mailConfig.afterNotificationSent = function(){
			setTimeout(function() {
				parent.$req.details.updateRequestTemplates('conversation');	//No I18N
			},1000);
		};
		mailConfig.users_fields_required = ['id', 'name', 'email_id']; // No I18N
		//SD-109330 : To maintain the old Behaviour, any number is accepted, when mode is SMS.
		mailConfig.is_sms_gateway = $req.details.self_service_portal_settings.is_sms_gateway;
		if(isMSP)
		{
			mailConfig = $req.notify.msp_actions.getMSPOrSCPSpecificConfig(mailConfig);
		}
		$notification_popup.openNotificationForm(mailConfig);   //No I18N
	},

	sendApproval:function(toEmails,approverIds,approvalLevelId,isAddLevel){
		if(!$req.notify.actions.initConfig(true)){ // Passing true as parameter .Because freezelayer and minimize icon not needed for resend /Building common config
			return false;
		}
		var options=$req.notify.actions.notifyConfig;
			options.type= "approval_requests"; //No I18N
			options.sub_module= "approval"; //No I18N
            options.has_attachments= false;
            options.has_cc= false;
            options.dialog_height= 500;
            options.is_tagging=true; //SD-109414
			options.recipientsLimit = 50;
			options.get_temp_content_url= "/api/v3/requests/"+$req.details.request_info.id+"/_get_approval_notification_content"; //No I18N
            options.modifySelect2data=function(e,opt){ //SD-109414
               if(e.object.id!=null && e.object.value!=null){ // if slected from dropdown returning without check.
                   		opt.push({
                   				id:e.object.id,
                   				text:e.object.text,
                   				value:e.object.value
                   			});
                }
               else{
                   	sdpAjax({
                   			url: "/api/v3/requests/"+$req.details.request_info.id+"/approval_levels/approvals/approver",  //NO I18N
                   			 async: false,
                   			cache: false,
                   			data: {
                   				input_data: sdpToJSON(
                   					   {list_info: {
                   								start_index: 1,
                   								row_count: 1,
                   								sort_field: "name", //No I18N
                   								fields_required: "[\"id\", \"name\", \"email_id\"]", //No I18N
                   								search_criteria: [
                   								  {
                   									field: "email_id", //No I18N
                   									condition: "like", //No I18N
                   									values: [e.object.text]
                   								  }
                   								]
                   							  },
                   							  for:"submit_for_approval"}) //No I18N
                   				},
                   				success: function(data) {
                   					var approver=data.approver[0];
                                         if(approver!=null&& approver.email_id===e.object.text){
                   						opt.push({
                   						  id:approver.id,
                   						  text:approver.email_id,
                   						  value:approver
                   						});
                   					 }
                   				}});
               }
            },
            options.user_fetch= {
                url: "/api/v3/requests/"+$req.details.request_info.id+"/approval_levels/approvals/approver"+ (isMSP?"?ACCOUNTID=0":"") , //No I18N
                lookup_field: "approver" ,//No I18N
                search_keys: ["name", "email_id"] //No I18N
            },
            options.is_add_level = isAddLevel;
            options.metaSearchParam= "submit_for_approval"; //No I18N
            options.notification_submit_url= "/api/v3/requests/"+$req.details.request_info.id+"/_submit_for_approval"+ (isMSP?"?ACCOUNTID=0":""); //No I18N
            options. api_type="POST";//No I18N
            options.beforeNotificationSend= function(notiObj,formObj){
                var aprover_ava = "";
                var aprover_ids = jQuery(formObj).find('#sendnotifyto').select2('data');//No I18N
                var ids = [];
               	if(!approverIds){
	               	jQuery.each(aprover_ids,function(i, val){
	               			//due to sdp select2 0 searchterm  case
	               			var id = parseInt(val.value.id) ? val.value.id : ( val.value.value && parseInt(val.value.value.id) ? val.value.value.id : val.value.id);
	               			ids.push(id);
		            });
               	}
                if(ids.length > 0){
                	var idArray = [];
                	ids.forEach(function(id)
                	{
                		idArray.push({"id" : id})
                	});
                	var json = {"approvers" : idArray}; //No I18N
                	var inputData = sdpAjaxInputData(json);

                    sdpAjax({
                        url:"/api/v3/backup_approvers/_check_availability",//No I18N
                        type:"GET",//No I18N
                        data : inputData,
                        async: false,
                        success: function(resp){

                            if(!resp.backup_approver.is_approver_available){
                                aprover_ava = getMessageForKey("sdp.backupapprover.approver.unavailable",resp.backup_approver.unavailable_approvers_info) ;
                            }
                        }
                    });
                    var approvalIDs = []
                    for(var i = 0;i< ids.length;i++){
                        approvalIDs.push({approver: {id: ids[i]}})
                    }
                	notiObj.input_data  = {
                        "approvals": approvalIDs, "notification": {"title":notiObj.input_data.subject, "description": notiObj.input_data.description}//No I18N
                    }
                    if(isAddLevel)
                    {
                    	notiObj.input_data["for"]="add_approval_level";//No I18N
                    }
                }
                if(aprover_ava){
                    !confirm(aprover_ava) ? (notiObj.is_formsubmit = false,formObj.sendnotification.disabled = false): undefined;
                }
            },
            options.afterNotificationSent=function(){
                $req.details.updateRequestTemplates("approvals");//No I18N
            }

		toEmails && (options.to = toEmails);
		if(approverIds && approvalLevelId){
			delete options.notification_submit_url;
			delete options.api_type;
			options.sub_module_id = approvalLevelId;
			options.approval_ids = approverIds;
		}
		options.users_fields_required = ['id', 'name', 'email_id']; // No I18N
		$notification_popup.openNotificationForm(options);
	},
	saveDraftCallback:function(resp,fromListView){
		if(fromListView == undefined || !fromListView){
			$req.details.updateRequestTemplates('draft'); //No I18N
		}
	},
	renderDraftWindow:function(draftId){
		if(!$req.notify.actions.initConfig(false)){ //Building common config
			return false;
		}
		var mailConfig=$req.notify.actions.notifyConfig;
		var copied_from = {
			id:draftId,
			module:"request_notification"//No I18N
		}


			mailConfig.dialog_height= 650,
			mailConfig.get_temp_content_url= "/api/v3/requests/"+$req.details.request_info.id+"/drafts/"+draftId, //No I18N
			mailConfig.closeOnEscKey= "no"//NO I18N
            mailConfig.user_fetch={
                //SD-113636: End point changed for email field dropdown.
				url : '/api/v3/requests/notifications/recipient',//No I18N
				lookup_field : 'recipient',//No I18N
                search_keys:['name','email_id']//NO I18N
            };
		    mailConfig.type= "notify_request"; //No I18N
			mailConfig.custom_type= "reply" ; //No I18N
			mailConfig.autoDraft = true;
			mailConfig.draftInterval = $req.details.self_service_portal_settings.auto_save_interval;
			mailConfig.enableDraft = true;
			mailConfig.show_status_update = (sdp_user.ROLES.indexOf('ModifyRequests') > -1) ? true : false;
			mailConfig.saveDraftCallback = this.saveDraftCallback;
			mailConfig.show_reply_templates = true;
			mailConfig.has_bcc=true;
			mailConfig.module_info=$req.details;
			if($req.details.self_service_portal_settings.can_create_reply_template != undefined){
				mailConfig.allowTechCreateReplyTemplate = $req.details.self_service_portal_settings.can_create_reply_template;
			}
			else{
				mailConfig.allowTechCreateReplyTemplate = false;
			}
			mailConfig.copied_from = copied_from;
			mailConfig.imgParameters = {module:"request_notification", withURL: false, noForm: true};//No I18N
			mailConfig.users_fields_required = ['id', 'name', 'email_id']; // No I18N
			if(isMSP)
			{
				mailConfig = $req.notify.msp_actions.getMSPOrSCPSpecificConfig(mailConfig);
			}
			$notification_popup.openNotificationForm(mailConfig);
			if(mailConfig.recommend_template_window){//recommend_template_window will be set in NotificationPopup.js
            	mailConfig.validateNotificationForm = function(form){
            		if(!jQuery(form).find("#recommendtemplateid").val()){
            			showalert('warning', translate("admp.choose.template"),'isAutoHide=true'); //No I18N
            			return false;
            		}
            		return true;
            	}
            }
			mailConfig.afterNotificationSent = function(){
				parent.$req.details.updateRequestTemplates('conversation');	//No I18N
				if(sdp_user.USERTYPE == "Technician" && $req.prop.replyTemplateStatus){
					$req.prop.inlineSave();
					$req.prop.replyTemplateStatus = false;
				}
			};
			mailConfig.afterNotificationCancel = function(){
            	if($req.prop.replyTemplateStatus){
            		$req.prop.renderForm();
            	}
            };
	},
	deleteDraft:function(draftId){
		sdpAjax({
            url:"/api/v3/requests/"+$req.details.request_info.id+"/drafts/"+draftId,//No I18N
            type:"DELETE",//No I18N
            async: false,
            success: function(resp){
                effect = new Effect.SwitchOff("draft-"+draftId);//No I18N
		$req.details.updateRequestTemplates('draft'); //No I18N
	}
        });
	}
}

/**
 * Reply template render in the notification popup
 */
var $reply_template = {
    load_rt:function(notiObj){
        // Function to create reply template list select box in request reply window for reply template selection
        // There is segrigation available my templates will be displayed first then others public templates will follow
			var list_info = {start_index: 1, row_count: 100, sort_field: 'name', fields_required: ['id', 'name', 'is_public'], search_criteria: [{ field: 'inactive', value: false, condition: 'eq' }]}; //No I18N
        var _self = this;
        jQuery('#rt_'+notiObj.module).show().sdp_select2({
            processSearchData: function(data, _self){
                if(data.list_info && data.list_info.search_criteria){
                    let rep_templates = [];
                    for(let template of data.reply_templates){
                        rep_templates.push({
                            text: template.name,
                            id: template.id,
                            is_public: template.is_public
                        });
                    }
                    return rep_templates;
                }
                else{
                    return data.reply_templates;
                }
            },
            placeholder:translate('sdp.admin.replytemplate.usetemplate.defoption'),
            url:[{
                url: '/api/v3/reply_templates', //No i18N
                cacheData: {},
                field: "reply_templates", //No I18N
                list_info: list_info,
                processResults: function(search_data, data, field, settings) {
                    search_data.push({
                        text: data.name,
                        id: data.id,
                        is_public: data.is_public
                    });
                }
            }],
            formatResult: _self.format_rt_list,
            formatSelection: _self.format_rt_list,
            escapeMarkup: function(m) { return m; }
        });
        jQuery('#rt_'+notiObj.module).off("change").on("change",function(){ //No I18N
        	if(confirm(translate('sdp.request.replytemplate.confirm'))){
	            var reply_id = this.value;
	            var url = "api/v3/"+notiObj.module+"/"+notiObj.module_id;//No I18N
	            if(notiObj.notification.parent_id !== undefined && notiObj.notification.parent_id !== ""){
	            	url = url + "/notifications/"+notiObj.notification.parent_id;//No I18N
				}
				sdpAjax({
	                url: url+"/_reply_templates/"+reply_id, //No I18N
	                type: "GET", //No I18N
	                data:sdpAjaxInputData({"for":$notification_popup.config.custom_type}),//No I18N
	                success: function(resp){
	                	window.ZEditor.notificationDescEditor.setHTML(resp.reply_templates.description || "");


	                	$notification_popup.attachComponent.destroy();
						$notification_popup.attachComponent.selector.html("");
						$notification_popup.notification.uploadedAttachments = [];
						if(resp.reply_templates.has_attachments) {
							$notification_popup.populateAttachments(resp.reply_templates.attachments);
						}
						//SD-110653
						if($notification_popup.config.copied_from &&  $notification_popup.notification.parent_id ){
                        	$notification_popup.config.copied_from.id = $notification_popup.notification.parent_id
                        }
						$notification_popup.formChanged=true;
				        $notification_popup.initialiseNotificationAttachPreview();

	                }
	            })
	        }
	        else{
                //To reset reply template to select option
                jQuery('#rt_'+notiObj.module).val('');
                jQuery('#rt_'+notiObj.module).parent('div').find(' .select2-chosen').html(translate('sdp.admin.replytemplate.usetemplate.defoption'));//No I18N
            }
        });
        if(notiObj.allowTechCreateReplyTemplate){
            jQuery("#addRT").remove(); // This element is not destroyed, so removed before initialization.
            jQuery('#rt_'+notiObj.module).select2("container").on("select2-opening", function() {}).find(".select2-drop") // NO I18N
                .append("<div class='select2-filter-option disp-t fw'><div class='disp-c pl10 w-50per'><a href='/' id='addRT'>" + translate('sdp.admin.replytemplate.addheading') + "</a></div></div>"); // NO I18N
        }

        jQuery('#addRT').off('click').on('click', function(e) {//No I18N
            $replyTemp.loadNewRT('', true);
            jQuery('#s2id_rt_requests').select2('close');//No I18N
            jQuery("#send-notification-section").addClass("hide").removeClass("show");
            jQuery("#add_target").addClass("show").removeClass("hide");
            jQuery('#add_target').animate({left: '0%'}, 200).removeClass('hide').end().find('#send-notification-section').hide().end().find('#rtList').select2('close'); // NO I18N
        });
    },
    format_rt_list: function(state) {
        var title = translate('sdp.dashboard.common.private'), css_class = 'cspr lock1 icon-sm top-2'; // NO I18N

        if (state.is_public) {
            title = translate('sdp.dashboard.common.public');
            css_class = 'cspr icon-sm user-group'; // NO I18N
        }
        return "<div title='" + title + "'><span class='" + css_class + "'></span> " + e_html(state.text?state.text:state.name) + "</div>"; // NO I18N
    }
}


var $review_window={
	getReviewContent:function(woId){
    	var review_content = {}
    	sdpAjax({
                url: "api/v3/requests/"+woId+"/_get_review_mail_content",//No I18N
                type: 'GET', // No I18N
                async: false
            }).done(function(data){
            	if (data.response_status.status === 'success') {
            		var notificationData = data.notification;
            		review_content.subject = notificationData.subject;
            		review_content.description = notificationData.content;
            	}
            });
        return review_content;
    },
    bind: function(fromNotification,woId) {
        var th = jQuery('#sendForReview');

        th.off('click', '[data-id="sendReview"]').on('click', '[data-id="sendReview"]', function(e) { // NO I18N
           event.stopPropagation();
           $review_window.sendReview(fromNotification,woId);
        }).off('click', '[data-id="cancel_review"]').on('click', '[data-id="cancel_review"]', function(e) { // NO I18N
            $review_window.handleCloseReviewDialog(fromNotification);
        });
    },
    handleCloseReviewDialog: function(fromNotification){
        event.preventDefault();
        if (fromNotification) {
			jQuery("#notification-component-popup-wrapperminimize").addClass("show").removeClass("hide");
            jQuery("#send-notification-section").removeClass("hide").addClass("show");
            jQuery("#sendForReview").addClass("hide").removeClass("show");
            jQuery("#notification-component-popup-wrapperclose").off('click').on('click',(event)=>{
			      $notification_popup.handleCloseDialog();
			});
        } else {
			jQuery("#notification-component-popup-wrapper").sdp_zcomponent_dialog("close");//No I18N
        }
    },
    openReviewDialog:function(fromNotification,woId){
    	var _self = this;
        event.preventDefault();

        var review_content = _self.getReviewContent(woId);

        window.scrollTo(0, 0);
        if(!fromNotification){
		        if(!$notification_popup.checkForUnsentNotifications(true)){ // Check whether any other reply popUps are open
                     return;
				}

        	var mailConfig = {
				config:{enableDraft : true}
        	};
            jQuery('.page-progressbar, #freeze-details').show(); //Progress bar load before opening dialog //No I18N

            $dialog = jQuery('<div id="notification-component-popup" class="fw"></div>')//No I18N
	            .html(renderhbs(null, 'notification-component',  mailConfig, false, 'components', null, null, null, true));//No I18N
				jQuery("body").append("<div id='notification-component-popup-wrapper' class='disp-h'></div>");
            jQuery("#notification-component-popup-wrapper").append($dialog);

            var options = {
                title: translate('sdp.change.actions.notifylink'),//No I18N
                minimizable: false, // Minimize not available for send for review
                maximizable: true,
                type: "modal", //No I18N
                closeOnEscKey: false,
                beforeclose: function(eve) {
                    if(jQuery("#notification-component-popup-wrapper").length>=1) {
                        jQuery("#notification-component-popup-wrapper").remove();
                    }
					$notification_popup.isOpen=false;
                },
				open:function(eve){
                       $notification_popup.isOpen=true;

					   jQuery('.page-progressbar,#freeze-details').hide(); // Stoping progress bar after opening the dialog //No I18N
						//Editor focus is already given in loadRTAforNotification() method.Since it is not working for zcomp-dialog
						//Giving editor focus manually.
						if(ZEditor && ZEditor.sendReviewDescEditor){
							ZE_Init.focus("sendReviewDescEditor"); //No I18N
						}
				},
                width:'950px',//No I18N
                height: jQuery(window).height(),
                position: {
                    right: "0px",//No I18N
                    top: "0px"//No I18N
                },
                draggable: false,
                resizable: {
                    directions: "w",//No I18N
					minWidth:920
                },
               animation:{
                     open:{
                        className:'zeffects--slideright', //No I18N
                        duration:300
                    }
               }
              };
             if(sdp_user.DIRECTION == "RTL"){ //No I18N
                          options.position = {
                            left: "0px", //No I18N
                             top:"0px", //No I18N
                          };
                          options.resizable = {
                             directions: "e" , //No I18N
                             minWidth: 920
                          };
                          options.animation={
                           open:{
                              className:'zeffects--slideleft', //No I18N
                              duration: 300
                           }
                          }
                        }
            jQuery("#notification-component-popup-wrapper").sdp_zcomponent_dialog(options); // Hiding minimize icon if opening send for review from notificaiton popup
        	jQuery("#send-notification-section").addClass("hide").removeClass("show");//No I18N
			jQuery("#sendForReview").addClass("show").removeClass("hide");//No I18N

        }
        else{
			jQuery("#notification-component-popup-wrapperminimize").addClass("hide").removeClass("show"); //Hiding minimize option for send for review.
        	jQuery("#send-notification-section").addClass("hide").removeClass("show");
			jQuery("#sendForReview").addClass("show").removeClass("hide");
        }

    	jQuery("#sendReviewSub").val(review_content.subject);
    	jQuery("#sendReviewDesc").val(review_content.description);
    	if(jQuery("#s2id_sendReviewTo").length == 0){
            var input_data = {
				maximumSelectionSize: 100,
                formatSearching: window.translate("ae.common.search.text"),
                formatNoMatches: window.translate("ae.common.select2nomatchesfound"),
                formatNoRecordsFound: window.translate("ae.common.select2norecordsfound"),
                tags: true,
                placeholder: translate("announcement.select.email"),
                multiple: true,
                minimumInputLength: 1,
                closeOnSelect: false,
                createSearchChoice:function(term, data) {
                	term =term.trim();
                    var matchFound = data.some(function(item){
                        return item.text.toLowerCase() === term.toLowerCase();
                    });
                    if(matchFound){return null;}
                    //Used while creating tags this used when we are providing tag options
                    var patt = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                    if(data.length==0 && patt.test(term)){
                        return {id:term,text:term};
                    }
                },
                url: [{
                    url: "api/v3/requests/notifications/recipient",//No I18N
                    field: "recipient",//No I18N
                    list_info : { fields_required : ['id', 'name', 'email_id'], sort_field: 'name'}, // No I18N
                    cache: [],
                    search_keys: ["name","email_id"],//No I18N
                    processResults: function (cacheData, data, field, i) {
                        if ((data.email_id && data.email_id.length) || (data.value && data.value.email_id && data.value.email_id.length)) {
                            cacheData.push({
                                id: data.text || data.email_id || data.value.email_id,
                                text: data.text || data.email_id || data.value.email_id,
                                value: data
                            });
                        }
                    },
					input_data_Callback: function(options, inputObj){
                        //SD-113636 : Search Criteria to get Email ID's which are not null.
                        if(inputObj.list_info.search_criteria){
                            inputObj.list_info.search_criteria.push({
                                field: 'email_id',//No I18N
                                condition: 'NEQ',//No I18N
                                values: null,
                                logical_operator: "and"//No I18N
                              })
                        }
                        else{
                            inputObj.list_info.search_criteria = [{
                                field: 'email_id',//No I18N
                                condition: 'NEQ',//No I18N
                                values: null,
                                logical_operator: "and"//No I18N
                              }];
                        }
						if(isMSP){
							inputObj.list_info.search_criteria.push({
								"field":"account",  //No I18N
								"values":[sdp_app.MSP_ORG,$req.mspform.getAccountID()], //No I18N
								"condition":"in", //No I18N
								"logical_operator": "and" //No I18N
							  })
						}
                        return inputObj;
                    }
                }],
                // formating the search data with user name and email
                formatResult: function(result, container, query, escapeMarkup){
                    if(!jQuery.isEmptyObject(result.value)){
                        var markup=[];
                        window.Select2.util.markMatch(result.value.name +","+result.text, query.term, markup, escapeMarkup);
                        if (result.isNew) {
                            return markup.join("");
                        } else {
                            return '<span class="post-tag">'+markup.join("")+'</span>';
                        }
                    }else{
                        return e_html(result.text);
                    }
                }
            };
            if(isMSP) {
                input_data.url[0].url = input_data.url[0].url+ '?ACCOUNTID=0';
            }
            var toEle = jQuery("#sendReviewTo");
	        if(sdp_user.USERTYPE == "Requester"){  //NO I18N
	            toEle.select2(input_data);
	        }else{
	            toEle.sdp_select2(input_data);
	        }
			toEle.on("change",function(e){
				jQuery(this).valid();//Error tool tip should be hided if any valid value added.
			});
        }else{
			jQuery("#sendReviewTo").select2("val","");//No I18N
		}

        var config = {
            element: 'sendReviewDesc', //No I18N
            isEnterKeyHandler: true,
            allowFullscreen: {
               title: getMessageForKey("sdp.common.description") //Description editor full screen allowed
            },
            avoidMoreOption: true,
            customName: "sendReviewDescEditor", //No I18N
            focus: true,
            maintainStructure: true,
            buttonsToHide:['image']
        };
        parent.window.zeditor(config);
        _self.bind(fromNotification,woId);
		$notification_popup.setValidatorForForm(document.getElementById("sendForReviewForm"));
		jQuery("#notification-component-popup-wrapperclose").off('click').on("click",(event)=>{//Close dialog on clicking close icon //No I18N
			$review_window.handleCloseReviewDialog(false);
		});
    },
    validateAndGetReviewDialog:function(formObj){
        var input_data = {}, returnObj = {},valid=true;
        returnObj.valid = jQuery(formObj).valid();
        var subject = jQuery('#sendReviewSub').val();
        if(returnObj.valid ){
            if (jQuery('#sendReviewTo').length > 0) {
            var toMails = jQuery('#sendReviewTo').select2('data'); //No I18N
            input_data.to=[]
            toMails.forEach(function(mail){
                input_data.to.push({
                    email_id: mail.id
                })
            });
        }

            input_data.subject = trimAll(subject);
            var desc = parent.sendReviewDescEditor ? sendReviewDescEditor.getHTML() : '';
            input_data.description = trimAll(desc);

            returnObj.input_data = input_data;
        }
        return returnObj;
    },
    sendReview:function(fromNotification,woId){
        var _self = this;
		var formData = _self.validateAndGetReviewDialog(document.getElementById("sendForReviewForm"));
        if(formData.valid){
            sdpAjax({
                type: "POST", //No I18N
                url: "/api/v3/requests/"+woId+"/_send_for_review", //No I18N
                data: sdpAjaxInputData(formData.input_data),
                success:function(resp){
                    if(resp.response_status.status === "success"){
                        showalert("success",translate("sdp.support.reportissue.successMsg"), "isAutoHide=true"); //No I18N
                        if(!fromNotification){
                        	jQuery("#notification-component-popup-wrapper").sdp_zcomponent_dialog('close'); // After sending review  closing dialog //No I18N
                        }
                        else{
							jQuery("#notification-component-popup-wrapperminimize").addClass("show").removeClass("hide"); //If send for review opened from notification , Showing notification window again after sending review.
                        	jQuery("#send-notification-section").addClass("show").removeClass("hide");
            				jQuery("#sendForReview").addClass("hide").removeClass("show");
            			}
                    }
                    else{
                        showalert("failure",translate("sdp.common.sendemail.failuremsg"),"isAutoHide=true");//No I18N
                    }
                },
                error: function(response){
                   $notification_popup.handleError(response);
                }
            })
        }
    }
}



//copy ticket details page  init code start here
jQ(function(){
	const initCopyTicketDetailsPage = ()=>{
		copyTicketConfig.initCopyText('requestDetailsTicket',function requestDetailsTicket(evt, holderData, callback) { //NO I18N

			var options = copyTicketConfig.getTemplateConfig('requests',{ //NO I18N
				getData:getModuleData,
				holderData:holderData
			});
			
			if (callback) {
				callback(options);
			}
		});
	}
	const isPrintPage = jQ('#preview-title').length > 0; //NO I18N
	const disableCopyTicket = ()=>{
		jQ('#request-id').removeClass('sdp-copy-text copy-ticket-holder sdp-init-component'); //NO I18N
	}
	//init copy ticket details page, if not print page
	isPrintPage ? disableCopyTicket() : initCopyTicketDetailsPage();
});
//copy ticket details page  init code end here

