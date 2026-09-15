/* $Id$ */

/** I18ned list items */
var tab_info = {
	"details": getMessageForKey("common.details"),	//No I18N
	"resolution": getMessageForKey("common.resolution"),	//No I18N
	"tasks": getMessageForKey("task.title"),	//No I18N
	"checklists":getMessageForKey("sdp.header.checklist"),	//No I18N
	"worklogs": getMessageForKey("common.worklogs"),	//No I18N
	"approvals": getMessageForKey("sdp.approve.approvals"),	//No I18N
	"dependency": getMessageForKey("sdp.requests.viewrequest.dependency"),	//No I18N
	"time_analysis": getMessageForKey("request.timeanalysis"),	//No I18N
	"history": getMessageForKey("common.history")	//No I18N
};
  
var details_sec_info = {
	"description": getMessageForKey("common.description"),	//No I18N
	"conversation": getMessageForKey("sdp.requests.viewrequest.conversations"),	//No I18N
	"properties": getMessageForKey("sdp.inventory.wsDetailView.hw.propertiesTitle"), //No I18N
	"tags": getMessageForKey("sdp.header.tags"),	//No I18N
	"share": getMessageForKey("sdp.request.share"),	//No I18N
	"associations": getMessageForKey("sdp.project.associations.tabname"), //NO I18N
	"rlc": getMessageForKey("rlc.transitions")	//No I18N
};

var rpanel_sec_info = {
	"rlc": getMessageForKey("rlc.transitions"),	//No I18N
	"properties": getMessageForKey("sdp.inventory.wsDetailView.hw.propertiesTitle"),	//No I18N
	"share": getMessageForKey("sdp.request.share"),	//No I18N
	"associations": getMessageForKey("sdp.project.associations.tabname"),	//No I18N
	"tags": getMessageForKey("sdp.header.tags"),	//No I18N
	"requester": getMessageForKey("common.requester.details")	//No I18N
};
if (window.isMSPOrSCP && sdp_app.IS_ACC_INFO_ICON_ENABLED) {
    details_sec_info.account = getMessageForKey("sdp.admin.leftpanel.users.customer") // NO I18N
    rpanel_sec_info.account = getMessageForKey("sdp.admin.leftpanel.users.customer") // NO I18N
}
var extra_prop_info = {
	"tasks": getMessageForKey("task.title"),	//No I18N
	"checklists": getMessageForKey("rightpanel.checklists"),	//No I18N
	"attachments": getMessageForKey("sdp.common.attachments")	//No I18N
};

/** Request Layout methods and variables */
$wolayout = {

	user_view: "Technician",	/** current view mode - Technician or Requester */	//No I18N

	technician: {
		tabs_default: ["details", "resolution", "tasks","checklists", "worklogs", "approvals", "dependency", "time_analysis", "history"],	/** default Tabs ordered list */	//No I18N
		details_default: ["description", "conversation", "properties"],	/** default Right panel properties ordered list to be rendered for technician */	//No I18N
		properties_default: ["status", "priority", "tasks", "checklists", "first_response_due_by_time", "technician", "group", "site", "attachments", "assets"],	/** default Details tab sections ordered list */	//No I18N
		rpanel_default: ["rlc", "properties", "share", "associations", "tags", "requester"],	/** default Right panel sections ordered list */	//No I18N
		show_rpanel_default : true, //No I18N
		rlc_position_default: "bottom", //No I18N
		can_tech_edit_default: false //No I18N
	},

	requester: {
		tabs_default: ["details", "resolution", "tasks","approvals", "history"],	/** default Tabs ordered list */	//No I18N
		details_default: ["description", "conversation", "properties"],	/** default Right panel properties ordered list to be rendered for technician */	//No I18N
		properties_default: ['status','assets','priority','due_by_time'],	/** default Details tab sections ordered list */	//No I18N
		rpanel_default: ["properties", "requester"],	/** default Right panel sections ordered list */	//No I18N
		show_rpanel_default : true//No I18N
	},

	requester_pers: {},

	technician_pers : {},

	restricted_props: ["requester", "subject", "on_behalf_of", "approval_status","maintenance"],	//No I18N

    //SD-106209 - Hiding unsupported fields in properties section of request layout customization
	hide_request_properties:["resolution","total_cost","ola_due_by_time","closure_info","email_cc","is_reopened","is_editing_completed", "sla_violated_group","fr_sla_violated_group","cancel_requested","is_overdue", "id", "sla_violated_technician","fr_sla_violated_technician","response_time_elapsed","has_linked_requests","age_after_violation","has_notes","service_cost","email_to","has_linked_requests","has_dependency","is_shared","completed_time","is_first_response_overdue","is_service_request","udf_fields","assigned_time","total_unassigned_time","primary_asset","reason_for_cancel","age_after_sla_response_violation","onhold_time","current_scheduled_timer","responded_time"], //No I18N

	metainfo: [],
    account_metainfo: [],	// variable introduced for MSP/SCP
	individual_pers: false,

	is_tech_customized: false,

	is_rqstr_customized: false,

	/**
	 * Initailizes the custom layout room. Fetches the layout info from the $req properties, if not found, takes the default values
	 */
	init: function(view) {
		var _self = this;
        if (isMSPOrSCP) {
            if(this.technician.rpanel_default.indexOf("account") == -1) {
                this.technician.rpanel_default.push("account");
            }
            if(!this.technician.hasOwnProperty("account_properties_default")) {
                this.technician.account_properties_default = ["account_manager", "industry", "country", "name", "weburl", "emailid", "landline"];	/** Default fields for the account section */	// NO I18N
            }
            // Removing site and asset field from default technician properties
            var siteIndex = this.technician.properties_default.indexOf("site"); //No I18N
            if (siteIndex !== -1) {
                var toSplice = 0;
                if (isSCP) {
                    toSplice = 1;
                }
                if(this.technician.properties_default.indexOf("account") == -1) {  //No I18N
                    // if account is not there in properties list - splice and add account
                    this.technician.properties_default.splice(siteIndex, toSplice, "account"); //No I18N
                } else if(toSplice > 0) {
                    // if account is there in properties list - splice only if to be spliced
                    this.technician.properties_default.splice(siteIndex, toSplice);
                }
            }
            if (isSCP) {
                var assetIndex = this.technician.properties_default.indexOf("asset"); //No I18N
                if (assetIndex !== -1) {
                    this.technician.properties_default.splice(assetIndex, 1);
                }
            }
	        if (!sdp_app.IS_RLC_MODULE_ENABLED) {
	            // RLC feature is license based for SCP.
	            var rlcIndex = this.technician.rpanel_default.indexOf("rlc");
	            if (rlcIndex !== -1) {
	                this.technician.rpanel_default.splice(rlcIndex, 1);
	            }
	            delete rpanel_sec_info.rlc;
	        }
	        if (!sdp_app.IS_REQUEST_SHARING_MODULE_ENABLED) {
	            // Request Sharing feature is license based for SCP.
	            var requestShareIndex = this.technician.rpanel_default.indexOf("share");
	            if (requestShareIndex !== -1) {
	                this.technician.rpanel_default.splice(requestShareIndex, 1);
	            }
	            delete rpanel_sec_info.share;
	        }
	        /** Disbale the account section, if the IS_ACC_INFO_ICON_ENABLED is false */
	        if (!sdp_app.IS_ACC_INFO_ICON_ENABLED) {
	            var accountIndex = this.technician.rpanel_default.indexOf("account");
	            if (accountIndex !== -1) {
	                this.technician.rpanel_default.splice(accountIndex, 1);
	            }
	            delete rpanel_sec_info.account;
	        }
        }
		if(view === undefined) {
			this.user_view = $req && $req.layout.user_view ? $req.layout.user_view : this.user_view;
		}
		this.is_tech_customized = $req && $req.layout.is_customized ? true : false;

		this.setLayoutValues();
		this.renderCustomLayout();
		
		/** loading properties section after the sections list is rendered */
		setTimeout(function() {
			_self.renderPropertiesLayout();
			if(window.isMSPOrSCP) {
				_self.renderAccountsLayout();
			}
			_self.bindEvents()
		}, 100);
	},
	/**
	 * Layout event binding
	 */
	bindEvents: function(){
		const container = "#request-layout-container"; //No I18N
		const _self = this;
		jQuery(container).off('click.wolayout').on('click.wolayout', '[data-dl-event]' ,function(){ //No I18N
			const eventName = jQuery(this).attr('data-dl-event');
            let param = jQuery(this).attr('data-event-param')
            param = param != undefined ? param.split(',') : [] ;
			if(param.includes('this')){
				param.shift();
				_self[eventName](this, ...param) // remove the this 
				return;
			}
            _self[eventName] && param.length > 0 ? _self[eventName](...param) : _self[eventName]();
		})
	},
	switchTo: function(view) {
		/** Stop switching if any unsaved changes are present in the layout. */
		if(this.didLayoutChange()) {
			if(!confirm(getMessageForKey("request.layout.switch.unsaved.alert"))) {
				return false;
			}
		}
		var _self = this;
		this.user_view = view;
		jQuery("#layout-inner").fadeOut(200, function() {
			_self.init(_self.user_view);
		});
		return true;
	},

	/**
	 * Renders the entire layout - Tab list, Details sections, Right Panel sections
	 * Skips Request Properties layout alone as it requires the list of all available fields, which is not fetched yet.
	 */
	renderCustomLayout: function() {
	  	var data = {
			tabs: this.utils.constructIdNamePair(this.tabs, tab_info),
			details: this.utils.constructIdNamePair(this.details, details_sec_info),
			rpanel: this.utils.constructIdNamePair(this.rpanel, rpanel_sec_info),
			show_rpanel: this.show_rpanel,
			rlc_position : this.rlc_position,
			can_tech_edit : this.can_tech_edit,
			user_view: this.user_view,
			layout_type: $req.layout.layout_type,
			is_admin: ($req.sdp_user.ROLES.indexOf("SDAdmin") != -1) ? true : false,
			is_tech_customized: this.is_tech_customized,
			is_rqstr_customized: this.is_rqstr_customized
		};
		var rpanel_avail_info = rpanel_sec_info;
		if(this.user_view !== "Technician") {
			rpanel_avail_info = {
				"properties": getMessageForKey("sdp.inventory.wsDetailView.hw.propertiesTitle"),	//No I18N
				"requester": getMessageForKey("common.requester.details")	//No I18N
			};
		}
		data.avail_sec = this.utils.constructAvailSection(rpanel_avail_info, this.rpanel);
		renderhbs("#request-layout-container", "layout-template", data, false, 'components/details-layout-settings'); // No I18N
	  	this.afterHeaderRender();
	  	this.afterTabRender();
	  	this.afterSectionRender();
	  	initTooltip("#request-layout-container");	//No I18N
	},
	/**
	 * Renders the Request Properties layout using the list of all fields, which are fetched through metainfo API.
	 * If the metainfo is already loaded, then the API network call will be skipped.
	 */
	renderPropertiesLayout: function() {
		var _self = this;
		var renderProperties = function() {
            var selector = "#shdialog"; // NO I18N
			var data = {
				selected_prop: _self.utils.constructIdNamePair(_self.properties, _self.metainfo, true, "display_name"),	//No I18N
                avail_prop: _self.utils.constructAvailProp(_self.metainfo, _self.properties,_self.hide_request_properties),
                selector: selector,
                section: "properities" // section variable introduced commonly during MSP development by client	// NO I18N
			};
			renderhbs("#layout-prop-container", "prop-template", data, false, 'components/details-layout-settings'); // No I18N
			renderhbs("#shdialog", "more-prop-template", data, false, 'components/details-layout-settings'); // No I18N
		  	_self.afterPropertiesRender();
            if(window.isMSPOrSCP) {
            	/** Need sometime before sortable get initialized **/
            	setTimeout(function() {
            	    _self.afterPropertiesRender("account"); // No I18N
            	}, 300);
            }
		};
		if($wolayout.metainfo.length === 0) {
            this.getAllMetaInfo(renderProperties, "/api/v3/requests/metainfo", "metainfo", true); // No I18N
		} else {
			renderProperties();
		}
	},
	// Function written for MSP/SCP
    renderAccountsLayout: function() {
    /** Render the account section, only if the account info is enabled **/
        if (window.isMSPOrSCP && sdp_app.IS_ACC_INFO_ICON_ENABLED) {
            var _self = this;
            var renderProperties = function() {
                var data = {
                    selected_prop: _self.utils.constructIdNamePair(_self.account_properties, _self.account_metainfo, true, "display_name"), //No I18N
                    avail_prop: _self.utils.constructAvailProp(_self.account_metainfo, _self.account_properties, []),
                    selector: "#shdialog-acc", // No I18N
                    section: "account" // section variable introduced commonly during MSP development by client	// No I18N
                };
				renderhbs("#layout-account-container", "prop-template", data, false, 'components/details-layout-settings'); // No I18N
				renderhbs("#shdialog-acc", "more-prop-template", data, false, 'components/details-layout-settings'); // No I18N
                _self.afterPropertiesRender();
            };
            if ($wolayout.metainfo.length === 0) {
                _self.getAllMetaInfo(renderProperties, "/api/v3/accounts/_metainfo?input_data=%7B%22conf_fields%22%3A%22true%22%7D", "account_metainfo"); // No I18N
            } else {
                renderProperties();
            }
        }
    },
	/**
	 * Gets the list of all fields available in the product through 'metainfo' API
	 * Method extended with url, name, isExtraNeed parameters for MSP/SCP
	 */
    getAllMetaInfo: function(callback, url, name) {
		try {
		    var _self = this;
			sdpAjax({
				url: url,	//No I18N
				type: "GET",	//No I18N
				cache: false,
				context: _self,
				beforeSend: function(){
					/** displays loading gif until the properties list are loaded. */

				},
				success: function(data) {
					if(data && data.metainfo && data.metainfo.fields) {
                        var metainfo = _self[name];
                        metainfo = data.metainfo.fields;
                        _self.utils.addAdditionalFields(metainfo);
                        if (!window.isMSPOrSCP || name !== "account_metainfo") {
                            _self.utils.addExtraProperties(metainfo);
                        }
                        _self.utils.removeRestrictedProps(metainfo, _self.restricted_props);
                        _self[name] = metainfo;
						if(typeof callback === "function") {
							callback();
						}
					} else {
						/** show error message */
					}
				}
			});
		} catch(exception) {
			console.error(exception);
		}
	},

	getRequesterLayout: function() {
		try {
			var layout = window.getGlobalPersonalization("request_details_requester_layout");	//No I18N
			if(layout) {
				var layout_items = ["tabs", "properties", "details", "rpanel", "show_rpanel"];	//No I18N
				if(layout.show_rpanel === undefined){
					layout.show_rpanel = true;
				}
				for(var i=0; i<layout_items.length; i++) {
					if(layout[layout_items[i]] && jQuery.isArray(layout[layout_items[i]]) || layout_items[i] == "show_rpanel") {
						this.requester_pers[layout_items[i]] = layout[layout_items[i]];
					}
				}
				this.is_rqstr_customized = true;
			}
		} catch(exception) {
			console.error("Error occurred while fetching Requester's layout. Hence, using the default configuration to render the Layout.");	//No I18N
			console.error(exception);
		}
	},
	getTechsLayout: function(layout) {
		if(layout) {
			var layout_items = ["tabs", "properties", "details", "rpanel", "show_rpanel","can_tech_edit","rlc_position"];	//No I18N
            if(window.isMSPOrSCP) {
            	layout_items.push("account_properties");
            }
			if(layout.show_rpanel === undefined){
				layout.show_rpanel = true;
			}
			for(var i=0; i<layout_items.length; i++) {
				if(layout_items[i] == "details"){
					this.technician_pers[layout_items[i]] = this.setDetailsArray(layout.show_rpanel,layout[layout_items[i]]);
				}
				else if(layout[layout_items[i]] && jQuery.isArray(layout[layout_items[i]]) || layout_items[i] == "show_rpanel" || layout_items[i] == "can_tech_edit" || layout_items[i] == "rlc_position") {
					this.technician_pers[layout_items[i]] = layout[layout_items[i]];
				}
			}
			this.is_tech_customized = true;
		}
	},
	setDetailsArray: function(showRpanel,detailsArr){
		if(showRpanel === true){
			 var rpanelSections = ["share", "tags", "associations", "rlc"]; //No I18N
            if(window.isMSPOrSCP) {
            	rpanelSections.splice(3, 0, "account");	// insert account in array index 3 of the rpanelSections	//No I18N
            }
			 var ful_arr = detailsArr;
			 rpanelSections.each(function(ele){
				 if(ful_arr.indexOf(ele) == -1){
					 ful_arr.push(ele);
				 }
			 })
			 return ful_arr;
		}
		else{
			return detailsArr;
		}
	},
	setLayoutValues: function() {
		var layout = window.getGlobalPersonalization("request_details_technician_layout");	//No I18N
		if($req.layout.layout_type == "tech_layout" && layout){
			if(jQuery.isEmptyObject(this.technician_pers)) {
				this.getTechsLayout(layout);
			}
			this.tabs = this.technician_pers.tabs || this.technician.tabs_default;
			this.details = this.technician_pers.details || this.technician.details_default;
			this.properties = this.technician_pers.properties || this.technician.properties_default;
			this.rpanel = this.technician_pers.rpanel || this.technician.rpanel_default;
			this.show_rpanel = this.technician_pers.hasOwnProperty("show_rpanel") ? this.technician_pers.show_rpanel : this.technician.show_rpanel_default; //No I18N
			this.rlc_position = this.technician_pers.rlc_position || this.technician.rlc_position_default;
			this.can_tech_edit = this.technician_pers.can_tech_edit || this.technician.can_tech_edit_default;
            if(window.isMSPOrSCP) {
            	this.account_properties = this.technician_pers.account_properties || this.technician.account_properties_default;
		}
        } else if (this.user_view === "Technician") { // No I18N
			this.tabs = $req && $req.layout.tabs ? $req.layout.tabs : this.technician.tabs_default;
			this.details = $req && $req.layout.details ? this.setDetailsArray($req.layout.show_rpanel,$req.layout.details) : this.technician.details_default;
			this.properties = $req && $req.layout.properties ? $req.layout.properties : this.technician.properties_default;
			this.rpanel = $req && $req.layout.rpanel ? $req.layout.rpanel : this.technician.rpanel_default;
			this.show_rpanel = $req && $req.layout.hasOwnProperty("show_rpanel") ? $req.layout.show_rpanel : this.technician.show_rpanel_default; //No I18N
			this.rlc_position = $req && $req.layout.rlc_position ? $req.layout.rlc_position : this.technician.rlc_position_default;
			this.can_tech_edit = $req && $req.layout.can_tech_edit ? $req.layout.can_tech_edit : this.technician.can_tech_edit_default;
            if(window.isMSPOrSCP) {
            	this.account_properties = $req && $req.layout.account_properties ? $req.layout.account_properties : this.technician.account_properties_default;
            }
		} else {
			if(jQuery.isEmptyObject(this.requester_pers)) {
				this.getRequesterLayout();
			}
			this.tabs = this.requester_pers.tabs || this.requester.tabs_default;
			this.details = this.requester_pers.details || this.requester.details_default;
			this.properties = this.requester_pers.properties || this.requester.properties_default;
			this.rpanel = this.requester_pers.rpanel || this.requester.rpanel_default;
			this.show_rpanel = this.requester_pers.hasOwnProperty("show_rpanel") ? this.requester_pers.show_rpanel : this.requester.show_rpanel_default; //No I18N
		}
	},

	didLayoutChange: function() {
		if($req.layout.layout_type == "req_layout"){
			var layout_obj = {
				tabs: this.getCustomTabs(),
				details: this.getCustomDetails(),
				properties: this.getCustomProperties(),
				rpanel: this.getCustomSections(),
				show_rpanel : this.getRpanel()
			}
		}
		else{
			var layout_obj = {
				tabs: this.getCustomTabs(),
				details: this.getCustomDetails(),
				properties: this.getCustomProperties(),
				rpanel: this.getCustomSections(),
				show_rpanel : this.getRpanel(),
				rlc_position : this.getRLCPos(),
				can_tech_edit: this.canTechEdit()
			};
		}
		for(var key in layout_obj) {
			if(this.didSectionChange(key, layout_obj[key])) {
				return true;
			}
		}
		return false;
	},

	didSectionChange: function(key, current_set) {

		if(key =="can_tech_edit" || key == "rlc_position" || key == "show_rpanel"){
			return false;
		}
		else if((current_set.length !== this[key].length) && (key !== "details")){
				return true;
			}
		for(var i=0, len=current_set.length; i<len; i++) {
			if(current_set[i] !== this[key][i]) {
				return true;
			}
		}
	},

	/**
	 * Gathers the customized list order of Tabs, Details section, Request Properties, Right Panel section and saves the Customization
	 */
	save: function() {
		var _self = this;
		var layout_obj = {
			tabs: this.getCustomTabs(),
			details: this.getCustomDetails(),
			properties: this.getCustomProperties(),
			rpanel: this.getCustomSections(),
			show_rpanel: this.getRpanel(),
			rlc_position : this.getRLCPos(),
			can_tech_edit: this.canTechEdit()
		};
		if(window.isMSPOrSCP) {
			layout_obj.account_properties = this.getAccountProperties();
		}
		try {
			var pers_view = this.user_view === "Technician" ? "request_details_technician_layout" : "request_details_requester_layout";	//No I18N
			if(($req.layout.layout_type == "individual_layout")){
				layout_obj.can_tech_edit = true;
				ClientUtil.addUserPersonalization("req_details_layout",layout_obj);//No I18N
				window.showalert("success", getMessageForKey("api.updated.success", [getMessageForKey("request.layout.custom")]), "isAutoHide=true"); 	//No I18N
				setTimeout(function(){
					window.location.reload(); 
				},2000)
			}
			else{
				var pers_obj = {
					"key": pers_view,	//No I18N
					"data": layout_obj,	//No I18N
					"async": false,	//No I18N
					success: function() {
						window.showalert("success", getMessageForKey("api.updated.success", [getMessageForKey("request.layout.custom")]), "isAutoHide=true");	//No I18N
						if(_self.user_view === "Technician") {
							/** once the Technician layout is saved, the Request details page is refreshed, assuming the current user is a Technician */
							setTimeout(function() {
								window.location.reload(); 
							}, 2000);
						} else {
							/** updating the current layout values once the Requester layout is saved */
							_self.tabs = layout_obj.tabs;
							_self.details = layout_obj.details;
							_self.properties = layout_obj.properties;
							_self.rpanel = layout_obj.rpanel;
							_self.show_rpanel = layout_obj.show_rpanel;
							_self.rlc_position = layout_obj.rlc_position;
							_self.can_tech_edit = layout_obj.can_tech_edit;
							if(window.isMSPOrSCP) {
								_self.account_properties = layout_obj.account_properties;
							}
							_self.is_rqstr_customized = true;
							jQuery("#show-history").removeClass("hide");
						}
					},
					error: function() {
						window.showalert("failure", getMessageForKey("sdp.home.ssp.customization.msg.savefail"), "isAutoHide=true, delay=15");	//No I18N
					}
				};
				window.setGlobalPersonalization(pers_obj);
			}
		} catch (exception) {
			window.showalert("failure", getMessageForKey("sdp.home.ssp.customization.msg.savefail"), "isAutoHide=true, delay=15");	//No I18N
			console.error(exception);
		}
	},

	/**
	 * Cancels the layout customization and closes the dialog
	 */
	cancel: function() {
		/** Stop closing window if any unsaved changes are present in the layout. */
		if($req.layout.layout_type != "individual_layout"){	
			if(this.didLayoutChange()) {
				if(!confirm(getMessageForKey("request.layout.close.unsaved.alert"))) {
					return;
				}
			}
		}
		$req.layout.layout_type = undefined;
		$req.layout.close();
		jQuery("#_DIALOG_LAYER").children().remove();
		window.closeDialog();
	},

	/**
	 * Resets all the customization to the default and renders in UI (But won't save yet)
	 */
	restore: function() {
		if(!window.confirm(getMessageForKey("request.layout.setdefault.confirm"))) {
			return false;
		}
		var layout_type = $req.layout.layout_type;
		if(layout_type == "individual_layout"){
			ClientUtil.deleteUserPersonalization("req_details_layout");//No I18N
			window.showalert("success", getMessageForKey("api.updated.success", [getMessageForKey("request.layout.custom")]), "isAutoHide=true");	//No I18N		
			/** once the Technician layout is saved, the Request details page is refreshed, assuming the current user is a Technician */
			setTimeout(function() {
				window.location.reload(); 
			}, 1000);
		}
		else{
			this.tabs = this.user_view === "Technician" ? this.technician.tabs_default : this.requester.tabs_default;	//No I18N
			this.details = this.user_view === "Technician" ? this.technician.details_default : this.requester.details_default;	//No I18N
			this.properties = this.user_view === "Technician" ? this.technician.properties_default : this.requester.properties_default;	//No I18N
			this.rpanel = this.user_view === "Technician" ? this.technician.rpanel_default : this.requester.rpanel_default;	//No I18N
			this.show_rpanel = this.user_view === "Technician" ? this.technician.show_rpanel_default : this.requester.show_rpanel_default;	//No I18N
			this.rlc_position = this.user_view === "Technician" ? this.technician.rlc_position_default : this.requester.rlc_position_default; // No I18N
			this.can_tech_edit = this.user_view === "Technician" ? this.technician.can_tech_edit_default : this.requester.can_tech_edit_default; // No I18N
			if(window.isMSPOrSCP) {
				this.account_properties = this.user_view === "Technician" ? this.technician.account_properties_default : this.requester.account_properties_default; // No I18N
			}
			if(this.user_view !== "Technician") {
				this.requester_pers.tabs = this.tabs;
				this.requester_pers.details = this.details;
				this.requester_pers.properties = this.properties;
				this.requester_pers.rpanel = this.rpanel;
				this.requester_pers.show_rpanel = this.show_rpanel;
				this.requester_pers.rlc_position = this.rlc_position;
			}
			this.renderCustomLayout();
			this.renderPropertiesLayout();
			if(window.isMSPOrSCP) {
				this.renderAccountsLayout();
			}
			this.save();
		}
	},
	setRLCPosition: function($this){
		if($this == "top"){
			this.rlc_position = "top"; //No I18N
		}
		else{
			this.rlc_position = "bottom"; //No I18N
		}
	},
	toggleSwitchAction: function($this) {
		var cur = jQuery($this);
		if(cur.find('span').hasClass('on')) {
			cur.find('#showRightPanel').removeClass('on').addClass('off');
			cur.find('span').removeClass('on').addClass('off');
			jQuery("#layout-rpanel-container").addClass('hide');
			jQuery("#layoutMainPanel").addClass("fw");
			jQuery(".toggleSection").addClass("disp-ib").removeClass("hide");
			this.show_rpanel = false;
		}
		else {
			cur.find('span').removeClass('off').addClass('on');
			cur.find('#showRightPanel').removeClass('off').addClass('on');
			jQuery("#layout-rpanel-container").removeClass('hide');
			jQuery("#layoutMainPanel").removeClass("fw");
			jQuery(".toggleSection").addClass("hide").removeClass("disp-ib");
			this.show_rpanel = true;
			jQuery("#rlcPosBottom").prop("checked",true); //No I18N
		}
	},
	getRpanel: function(){
       if(jQuery(".switch").hasClass("off")){
		   return false;
	   }
	   else{
		   return true;
	   }
	},
	getRLCPos  : function(){
		if(jQuery("#rlcPosTop").is(':checked')){
			return "top"; //No I18N
		}
		else {
			return "bottom"; //No I18N
		}
	},
	// function written for MSP/SCP
    getAccountProperties: function() {
        return this.getCustomList("#propList[data-section='account'] > li"); //No I18N
    },
	canTechEdit : function(){
		var ele = jQuery("#techCustomLayout");
		if(ele.length && ele.is(':checked') || $req.layout.layout_type == "individual_layout"){
			return true;
		}else{
			return false;
		};
	},
	/**
	 * Returns the array of current customized order of Tabs 
	 */
	getCustomTabs: function() {
		var tabs = this.getCustomList("#tabs-layout-list > li");	//No I18N
		/** fixing the missing tabs if any */
		var def_tabs = this.user_view === "Technician" ? this.technician.tabs_default : this.requester.tabs_default;	//No I18N
		if(!tabs) {
			return def_tabs;
		}
		if(tabs.length !== def_tabs.length) {
			var tab_item;
			for(var i = 0, len = def_tabs.length; i < len; i++) {
				tab_item = def_tabs[i];
				if(tabs.indexOf(tab_item) === -1) {
					tabs.push(tab_item);
				}
			}
		}
		return tabs;
	},

	/**
	 * Returns the array of current customized order of Details section 
	 */
	getCustomDetails: function() {
		var details = this.show_rpanel ? this.getCustomList("#details-list > li.disp-ib") : this.getCustomList("#details-list > li");	//No I18N

		/** fixing the missing details if any */
		var def_details = this.user_view === "Technician" ? this.technician.details_default : this.requester.details_default;	//No I18N
		if(!details) {
			return def_details;
		}
		if(details.length !== def_details.length) {
			var detail_item;
			for(var i = 0, len = def_details.length; i < len; i++) {
				detail_item = def_details[i];
				if(details.indexOf(detail_item) === -1) {
					details.push(detail_item);
				}
			}
		}
		return details;
	},

	/**
	 * Returns the array of current customized order of Request Properties list
	 */
	getCustomProperties: function() {
		if(window.isMSPOrSCP) {
			return this.getCustomList("#propList[data-section='properities'] > li"); //No I18N
		}
		return this.getCustomList("#propList > li");	//No I18N
	},

	/**
	 * Returns the array of current customized order of Right Panel section list
	 */
	getCustomSections: function() {
		return this.getCustomList("#rpanelList > li");	//No I18N
	},

	/**
	 * Returns the array of the selected items in order for the given element selector
	 */
	getCustomList: function(selector) {
		var selectedList = [];
		jQuery(selector).each(function(index, element) {
			selectedList.push(jQuery(element).data("id"));	//No I18N
		});
		return selectedList;
	},

	/**
	 * Displays the list of all the available fields (except the already selected properties) in the application (including UDF)
	 */
    showMoreProperties: function(selector, section) {
        this.closeMoreProperties("#shdialog", "properties"); // No I18N
        if(window.isMSPOrSCP) {
	        this.closeMoreProperties("#shdialog-acc", "account"); // No I18N
	    }
		this.closeMoreSections();
        jQuery(selector).show();
        jQuery("#" + section + "-prop #addnewProp").attr('data-dl-event', 'closeMoreProperties').attr('data-event-param', selector+","+section);
	},

	/**
	 * Closes the properties pool window
	 */
    closeMoreProperties: function(selector, section) {
        jQuery(selector).hide();
        jQuery("#" + section + "-prop #addnewProp").attr('data-dl-event', 'showMoreProperties').attr('data-event-param',  selector+","+section);
	},

	/**
	 * Displays the list of unselected sections
	 */
	showMoreSections: function() {
		this.closeMoreProperties("#shdialog", "properties"); // No I18N
		if(window.isMSPOrSCP) {
			this.closeMoreProperties("#shdialog-acc", "account"); // No I18N
		}
		jQuery("#sections-list-more").show();
		jQuery("#addnewSect").attr('data-dl-event', 'closeMoreSections')
	},

	/**
	 * Hides the unselected selections window
	 */
	closeMoreSections: function() {
		jQuery("#sections-list-more").hide();
		jQuery("#addnewSect").attr('data-dl-event', 'showMoreSections')
	},

	/**
	 * Initializes the select2 for the User switch in header
	 */
	afterHeaderRender: function() {
		var _self = this;
		jQuery("#user-layout-switch").select2({
			minimumResultsForSearch: -1,
			width: 120
		});
		jQuery("#user-layout-switch").off("select2-selecting").on("select2-selecting", function(event) {	//No I18N
			var changedVal = event.val;
			if(changedVal == "Technician"){
				$req.layout.layout_type = "tech_layout"; 	//No I18N
			}
			else{
				$req.layout.layout_type = "req_layout"; 	//No I18N
			}
			if(changedVal === _self.user_view) {
				return;
			}
			if(_self.switchTo(changedVal) === false) {
				event.stopImmediatePropagation();
				event.preventDefault();
				jQuery(this).select2("close");	//No I18N
				return;
			}
		});
		if(_self.rlc_position == "top"){
			jQuery("#rlcPosTop").prop("checked",true); //No I18N
		}  
		else{
			jQuery("#rlcPosBottom").prop("checked",true); //No I18N
		} 

	},

	/**
	 * Initializes the Tabs list and Details section list's jQuery UI sort after the Tab section is rendered.
	 */
	afterTabRender: function() {
		jQuery( "ul.tabsorder" ).sortable({
			items: "li:not(.active)",	//No I18N
			containment: "#tabs-layout-list",	//No I18N
			placeholder: "drag-placeholder",	//No I18N
			start: function( event, ui ) {
				ui.placeholder.width(ui.item.width());
				ui.placeholder.height(ui.item.height());
				jQuery(ui.item).css({"box-shadow": "#dadada 0px 0px 5px 0px"});	//No I18N
			},
			stop: function( event, ui ) { 
				jQuery(ui.item).css({"box-shadow": "none"});	//No I18N
			}
		}); 
		jQuery( "#details-list" ).sortable({
			containment: "#details-container",	//No I18N
			placeholder: "drag-placeholder",	//No I18N
			start: function( event, ui ) {
				ui.placeholder.width(ui.item.width());
				ui.placeholder.height(ui.item.height());
				jQuery(ui.item).css({"box-shadow": "#dadada 0px 0px 5px 0px"});	//No I18N
			},
			stop: function( event, ui ) { 
				jQuery(ui.item).css({"box-shadow": "none"});	//No I18N
			}
		});
	},

	/**
	 * Initializes the Request Properties list's jQuery UI sort after the Properties section is rendered.
	 */
    afterPropertiesRender: function(field) {
        if (window.isMSPOrSCP && field === "account") {
            this.initSortable("layout-account-container #propList", "shdialog-acc #ddpropList", "lay-acc .connectedProp", "shdialog-acc #srchfiltertxt"); //No I18N
        } else {
            this.initSortable("layout-prop-container #propList", "ddpropList", "lay-prop .connectedProp", "srchfiltertxt"); //No I18N
        }
	},

	/**
	 * Initializes the Right Panel section list's jQuery UI sort after the Right Panel section is rendered.
	 */
	afterSectionRender: function() {
		this.initSortable("rpanelList", "rpanelMoreList", "connectedSection");	//No I18N
	},

	/**
	 * Initializes the jQuery sortable functionality for the given Connected Drag and Drop windows
	 */
	initSortable: function(selectedList, availableList, connectedClass, searchAvailID) {
		var is_prop = selectedList.includes("propList"); //No I18N
		jQuery( "#" + selectedList ).sortable({
			connectWith: "." + connectedClass,
			handle: ".draggable",	//No I18N
			placeholder: "drag-placeholder",	//No I18N
			update: function(event, ui) {
				if(ui.sender != null) {
					if(is_prop) {
						jQuery(ui.item).find("a:first .sdp-glyph-trash-fill").removeClass("hide").addClass("list-item").attr('data-dl-event', 'removeItem').attr('data-event-param',  "this,#ddpropList");
						jQuery(ui.item).find("a:first").addClass("pl30");
					} else {
						jQuery(ui.item).find("a:first .sdp-glyph-trash-fill:first").removeClass("hide").addClass("visi-item").attr('data-dl-event', 'removeItem').attr('data-event-param',  "this,#rpanelMoreList");
					}
					if(jQuery(ui.item).attr("id") === "properties-prop") {
						jQuery("#layout-prop-container").show();
						jQuery("#layout-prop-container").parent().css("height", "auto");	//No I18N
					}
                    if (window.isMSPOrSCP && jQuery(ui.item).attr("id") === "account-prop") {
                        jQuery("#layout-account-container").show();
                        jQuery("#layout-account-container").parent().css("height", "auto"); //No I18N
                    }
				}
			},
			start: function( event, ui ) {
		    	ui.placeholder.height(ui.item.height());
		    	jQuery(ui.item).find("a:first").css({"box-shadow": "#eaeaea 0px 0px 2px 2px"});	//No I18N
		    	if(jQuery(ui.item).attr("id") === "properties-prop") {
					jQuery("#layout-prop-container").hide().parent().css("height", "35px");	//No I18N
				}
                if (window.isMSPOrSCP && jQuery(ui.item).attr("id") === "account-prop") {
                    jQuery("#layout-account-container").hide().parent().css("height", "35px"); //No I18N
                }
		    },
		    stop: function( event, ui ) {
		    	jQuery(ui.item).find("a:first").css({"box-shadow": "none"});	//No I18N
		    	if(jQuery(ui.item).parent().attr("id") === "rpanelList" && jQuery(ui.item).attr("id") === "properties-prop") {
					jQuery("#layout-prop-container").show().parent().css("height", "auto");	//No I18N
				}
                if (window.isMSPOrSCP && jQuery(ui.item).parent().attr("id") === "rpanelList" && jQuery(ui.item).attr("id") === "account-prop") {
                    jQuery("#layout-account-container").show().parent().css("height", "auto"); //No I18N
                }
		    }
		});

		jQuery( "#" + availableList ).sortable({
			connectWith: "." + connectedClass,
			handle: ".draggable",	//No I18N
			placeholder: "drag-placeholder",	//No I18N
			update: function(event, ui) {
				if(ui.sender != null) {
					if(is_prop) {
						jQuery(ui.item).find(".sdp-glyph-trash-fill").removeClass("list-item").addClass("hide")
						jQuery(ui.item).find("a:first").removeClass("pl30");
					} else {
						jQuery(ui.item).find(".sdp-glyph-trash-fill:first").removeClass("visi-item").addClass("hide")
					}
					if(jQuery(ui.item).attr("id") === "properties-prop") {
						jQuery("#layout-prop-container").hide().parent().css("height", "35px");	//No I18N
					}
                    if (window.isMSPOrSCP && jQuery(ui.item).attr("id") === "account-prop") {
                        jQuery("#layout-account-container").hide().parent().css("height", "35px"); //No I18N
                    }
				}
				if(jQuery(this).find("li").length > 0) {
					jQuery(this).find(".no-data-msg").addClass("hide");
				} else {
					jQuery(this).find(".no-data-msg").removeClass("hide");
				}
			},
			start: function( event, ui ) {
				jQuery(ui.item).find("a:first").css({"box-shadow": "#eaeaea 0px 0px 2px 2px"});	//No I18N
			},
			stop: function( event, ui ) {
				jQuery(ui.item).find("a:first").css({"box-shadow": "none"});	//No I18N
			}
		});

		if(searchAvailID) {
			jQuery( '#' + searchAvailID ).on('keyup', function() {
				var searchString = jQuery(this).val(), currentName;
				jQuery("#" + availableList + " li").each(function(index, value) {
					currentName = jQuery(value).text();
					if(currentName.toUpperCase().indexOf(searchString.toUpperCase()) > -1) {
						jQuery(value).show();
					} else {
						jQuery(value).hide();
					}
				});
			});
		}
	},

	/**
	 * Removes the item from the selected list and appends to the connected available section
	 * function parameter 'isSection' added for MSP/SCP
	 */
    removeItem: function(element, toElement, isSection) {
		var element = jQuery(element);
		if(window.isMSPOrSCP) {
			var propertiesEle = element.closest('[data-layout-properties="true"]');
			if (propertiesEle.length) {
				toElement = propertiesEle.data("droplist"); // No I18N
			}
		}
		var is_prop = element.parents(".propList:first").attr("id") === "propList" ? true : false;	//No I18N
		var trashClass =  is_prop ? "list-item" : "visi-item";	//No I18N
		var toElement = jQuery(toElement);
		if(is_prop) {
			element.parent().removeClass("pl30");
		}
		if(window.isMSPOrSCP) {
		// flow modified for MSP
        if (isSection) {
            propertiesEle = jQuery(element).closest("[data-id]"); // NO I18N
		}
        var propertiesId = propertiesEle.attr("id");
        var selector = "";
        if (propertiesId === "properties-prop") {
            selector = "#layout-prop-container"; // No I18N
        } else if (propertiesId === "account-prop") { // No I18N
            selector = "#layout-account-container"; // No I18N
        }
        jQuery(selector).hide().parent().css("height", "35px"); //No I18N
		} else {
		// SDP flow unchanged
		if(element.parent().parent().attr("id") === "properties-prop") {
			jQuery("#layout-prop-container").hide().parent().css("height", "35px");	//No I18N
		}
		}
		element.removeClass(trashClass).addClass("hide")
		element.closest("li").appendTo(toElement);	//No I18N
		toElement.find(".no-data-msg:first").addClass("hide");
	},

	/**
	 * Hides the History page and displays the Layout page of the current view
	 */
	 showLayout: function() {
	 	jQuery("#layout-history").hide();
		jQuery("#layout-inner").show();
		this.is_history_visible = true;
		jQuery("#header-history").hide();
		jQuery("#show-history, #header-info").show();
		jQuery("#request-layout-container .submit-row").removeClass('hide');
	 },

	/**
	 * Shows the history section for the current view
	 */
	showHistory: function() {
		var layoutID = window.global_personalization ? (this.user_view === "Technician" ? window.global_personalization.request_details_technician_layout : window.global_personalization.request_details_requester_layout) : null;	//No I18N
		if(!layoutID) {
			return false;
		}
		url = "/common/ViewHistory.jsp?id=" + layoutID + "&module=global_personalization&key=req_layout_history_sort";	//No I18N
		jQuery("#layout-inner").hide();
		jQuery("#layout-history").show().load(url);
		this.is_history_visible = true;
		jQuery("#show-history, #header-info").hide();
		jQuery("#header-history").show();
		jQuery("#request-layout-container .submit-row").addClass('hide');
	},

	processHistory: function(history) {
		if(!history && !history.history) {
			return false;
		}
		history = history.history;
		/** taking a reference of the history info to the layout scope */
		this.history = this.history || { "request_details_technician_layout": {}, "request_details_requester_layout": {}};	//No I18N
		var cur_history = this.user_view === "Technician" ? "request_details_technician_layout" : "request_details_requester_layout";	//No I18N
		this.history[cur_history] = history;

		/** processing the history to change the format that works in the History component */
		try {
			$history.processHistory(history);
		} catch(exception) {
			console.error(exception);
		}

		var renameListItems = function(values) {
			for(var section in values) {
				var list = values[section];
				if(!list || list.length === 0) {
					continue;
				}
				var renamed_list = [];
				for(var k=0, klen=list.length; k<klen; k++) {
					if(section === "tabs") {	//No I18N
						renamed_list.push(tab_info[list[k]]);
					} else if(section === "details") {	//No I18N
						renamed_list.push(details_sec_info[list[k]]);
					} else if(section === "rpanel") {	//No I18N
						renamed_list.push(rpanel_sec_info[list[k]]);
					} else if(section === "properties") {	//No I18N
						if($wolayout.metainfo[list[k]]) {
							renamed_list.push($wolayout.metainfo[list[k]].display_name || list[k]);
						}
                    } else if (window.isMSPOrSCP && section === "account_properties") { //No I18N
                        if ($wolayout.account_metainfo[list[k]]) {
                            renamed_list.push($wolayout.account_metainfo[list[k]].display_name || list[k]);
                        }
					}
				}
				values["display_"+section] = renamed_list;
			}
		}
		/** converting back the layout configuration to JSON     */
        var isAccountSectionEnabled = isMSPOrSCP && $req.layout.layout_type == "tech_layout";	// var is for MSP/SCP	//No I18N
		for(var i=0, len=history.length; i<len; i++) {
			if(history[i].diff) {
				for(var j=0, jlen=history[i].diff.length; j<jlen; j++) {

					if(history[i].diff[j].field.name=="global_personalization") {
						history[i].diff[j].current_value = null;
						continue;
					} 
					if(history[i].diff[j].current_value) {
						history[i].diff[j].current_value = JSON.parse(history[i].diff[j].current_value);
						renameListItems(history[i].diff[j].current_value);
					}
					if(history.diff && history.diff.previous_value) {
						history[i].diff[j].previous_value = JSON.parse(history[i].diff[j].previous_value);
						renameListItems(history[i].diff[j].previous_value);
					}
				}
			}
			history[i].sub_entity = "req_layout_cusomization";

			if(window.isMSPOrSCP) {
				//To hide/show account section in layout history
				history[i].is_account_section_enabled = isAccountSectionEnabled;
			}
		}
	},

	/**
	 * Copies the selected history version of configuration and renders the present layout
	 */
	setToVersion: function(versionId) {
		var cur_history = this.user_view === "Technician" ? "request_details_technician_layout" : "request_details_requester_layout";	//No I18N
		if(!versionId || !this.history || jQuery.isEmptyObject(this.history[cur_history])) {
			return false;
		}
		var history = this.history[cur_history];
		for(var i=0; i<history.length; i++) {
			if(versionId == history[i].id) {
				var versionVal = history[i].diff[0].current_value || history[i].diff[1].current_value;
				this.tabs = versionVal.tabs || this.tabs_default;
				this.details = versionVal.details || this.details_default;
				this.properties = versionVal.properties || this.properties_default;
				this.rpanel = versionVal.rpanel || this.rpanel_default;
				this.show_rpanel = versionVal.show_rpanel || this.show_rpanel_default;
				this.rlc_position = versionVal.rlc_position || this.rlc_position_default;
				if(window.isMSPOrSCP) {
					this.account_properties = versionVal.account_properties || this.account_properties_default;
				}
				this.renderCustomLayout();
				this.renderPropertiesLayout();
				if(window.isMSPOrSCP) {
					this.renderAccountsLayout();
				}
				break;
			}
		}
	},

	utils: {
		/**
		 * Returns the array of available properties using the info available in metainfo, that are not already selected
		 */
		constructAvailProp: function(metainfo, selected_prop,hide_request_properties) {
			var avail_prop = [];
			for(var key in metainfo) {
				/** metainfo contains all the fields including types html, multiline, unknown. Restricting the fields with types "html", "unknown", "multiline" */
				if(selected_prop.indexOf(key) === -1 
					&& metainfo[key].hasOwnProperty("display_name")	//No I18N
					&& metainfo[key].type !== "html"	//No I18N
					&& metainfo[key].type !== "unknown"	//No I18N
					&& metainfo[key].display_type !== "Multi Line"  //No I18N
					&& hide_request_properties.indexOf(key) === -1) {
					avail_prop.push({
						id: key,
						name: metainfo[key].display_name
					});
				}
			}
			return avail_prop;
		},

		/**
		 * Retuns the array of the unselected sections
		 */
		constructAvailSection: function(list, selected) {
			var avail_sec = [];
			for(var key in list) {
				if(selected.indexOf(key) === -1) {
					avail_sec.push({
						id: key,
						name: list[key]
					});
				}
			}
			return avail_sec;
		},

		/**
		 * Returns the array of id-name object of the already selected properties
		 * idArr - array of selected IDs
		 * nameObj - object that contains the meta information of all the properties. In this case, it is metainfo.
		 * nestedObj - true, if the id attribute is a object and name is present as one of its attributes.s
		 * nameProp - attribute name that represents the name of the id, if the nameObj is a nested object.
		 */
		constructIdNamePair: function(idArr, nameObj, nestedObj, nameProp) {
			var nameArr = [];
			for(var i=0; i<idArr.length; i++) {
				/** if one of the configured properties is not available in the product now (like deleted udf), the item will be skipped to show in the UI and will be removed from DB in the further configuration update */
				if(nestedObj && (!nameObj[idArr[i]] || !nameObj[idArr[i]][nameProp])) {
					idArr.splice(i,1);
					i--;
					continue;
				}
				// for SDP, instead of directly pusing into nameArr, assigning it to item variable and pushing.
				var item = {
					id: idArr[i],
					name: nestedObj ? nameObj[idArr[i]][nameProp] || idArr[i] : nameObj[idArr[i]] || idArr[i]
				};
				if (!window.isMSPOrSCP || item.name !== item.id) {
					// for SDP it is always true
					nameArr.push(item);
				}
			}
			return nameArr;
		},

		/**
		 * Adds Addtional Fields to the available Properties pool
		 */
		addAdditionalFields: function(metainfo) {
			if(metainfo.udf_fields && metainfo.udf_fields.fields) {
				for(var key in metainfo.udf_fields.fields) {
					metainfo[key] = metainfo.udf_fields.fields[key];
				}
			}
			if (window.isMSPOrSCP && metainfo.accountudf_fields && metainfo.accountudf_fields.fields) {
				for (var key in metainfo.accountudf_fields.fields) {
					metainfo[key] = metainfo.accountudf_fields.fields[key];
				}
			}
			if(metainfo.closure_info && metainfo.closure_info.fields) {
				for(var key in metainfo.closure_info.fields) {
					metainfo[key] = metainfo.closure_info.fields[key];
				}
			}
		},

		/**
		 * Adds extra Properties like Tasks, Attachments to the available Properties pool
		 */
		addExtraProperties: function(metainfo) {
			for(var key in extra_prop_info) {
				metainfo[key] = {
					"display_name": extra_prop_info[key]	//No I18N
				};
			}
		},

		/**
		 * Removes the restricted propeties like Desctiption from the available Propeties pool
		 */
		removeRestrictedProps: function(metainfo, restrictedProps) {
			if(!restrictedProps || restrictedProps.length === 0) {
				return;
			}	
			for(var key in metainfo) {
				if(restrictedProps.indexOf(key) > -1) {
					delete metainfo[key];
				}
				else if(key.indexOf("udf_") > -1 && metainfo[key].field_group == "resources"){
				    //question field is not allowed for properties customisation
                	delete metainfo[key];
                }
			}
		}
	}
};
jQuery(document).ready(function(){
	ResourceLoader({
		js: ["/scripts/hbs-template-details-layout-settings.js"],  //NO I18N
		success: function() {
			$wolayout.init();
		}
    });
});
