/* $Id $ */
$req.form = {
	template: {},
	udf_mapping_names:{},
	refer_fields:[],
	is_service_template: false,
	request_info: null,
	metainfo: {},
	allowed_values: {},
	ssp: {},
	edit_mode: false,
	promise_data: null,
	requester_info: null,
	status_mandatory: {},
	closing_rules: {},
	has_resource: false,
	cost: {},
	resource_fields: [],
	non_editable_props: [],
	sla_options: [],
	sla: {},
	did_fetch_sla: false,
	bulk_mode: false,
	chat_info: {},
	links: {},
	zia_properties:{},
	suggestion_seen: false,
	isFAFRExecuted : false, // SD-124890
	statuses: [],
	isAddIn: false,
	templateFields:{},
	request_info_ref:null,
	serviceName: null,
	rlc_notes:false,
	approver_allowed_values:[],
	// SD-95705
	// Create an copy of request description and load it after the page was rendering
	request_description: null,
 	request_resolution: null,
	ref:{
		description: null,
		resolution: null
	},
	fromSpace:false,
	spaceID:false,
    fromProject:false,
	isFromZiaBot: false,
	isFromIntegrationBot: false,
	integrationService:"",
	isMaintenance:false,
	fullAsset:false,
	/**
	 * Initializes the Request Form
	 * sets the basic properties (woID, edit_mode, templateID)
	 * invokes API calls - Template, Metainfo, SSP, Status info, Request info
	 */
	initialize: function(templateID, woID, addIn, serviceName) {
        jQuery(".page-progressbar").show(); //No I18N
        if(window.isMSPOrSCP) {
			$req.mspform.initialize();
		}
		this.woID = woID;
		this.fullAsset=false;
		this.edit_mode = !!(this.woID && !isNaN(this.woID) && window.isModeEdit);
		this.templateID = templateID ? templateID : (this.edit_mode ? null : this.getDefaultTemplateID());	//No I18N
		this.chatID = window.chatID || null;
		this.telephonyID=Store.getItem("call_id")||null; //No I18N
		this.requesterID = window.requesterID;
		this.isAddIn = !!addIn ? addIn : false;
		this.serviceName = serviceName ? serviceName : null;
		/** During form load, if any zia properties is available due to SPA navigation, we need to reset it. */
		this.zia_properties = {};
		this.req_warning = null;//While initializing
		if(window.isSCP) {
			this.accountID = window.accountIDFromParam;
		}
		if(window.isMSP && window.change_account_action) {
			// thread local account is set here as session account, changing that in client to set the header account as all accounts
			// this change is not visible in UI, but after this getAccountId() will return 0.
			setAllAccounts();
		}

		this.isFromZiaBot = window.isFromZiaBot;
		const integration_req = getSDPURLParams().isFromIntegrationBot;
        this.isFromIntegrationBot =  integration_req== undefined?false:integration_req;
        this.integrationService = getSDPURLParams().integrationService;
		this.isMaintenanceSchedulerInitialized=false;
		/* For edit maintenance, we dont have combined call. So promise functions will be executed
		in success function of maintenance get */
		if(!(this.isMaintenance&&this.edit_mode)){
		var promisefns = [
			this.fetchCombinedData(),
		];
		if(this.chatID) {
			promisefns.push(this.getChatInfo(this.chatID));
		}
		/*
		newform combined call will be used for maintenance which will links based on request module.
		So we make separate call for maintenance links
		*/
		if(window.duplicateRequest||this.isMaintenance){
			promisefns.unshift(this.fetchLinks());
		}
		}
		/* to fetch maintenance entity data in edit form*/
		if(this.isMaintenance&&this.edit_mode){
			this.fetchMaintenanceData();
		}
		this.request_description = null;
		this.request_resolution = null;
		this.ref = {
			description: {
				request:null,
				template:null
			},
			resolution: {
				request:null,
				template:null
			}
		}
		/*
		this promise wil be applied in success function of fetchMaintenanceData
		as we dont have combined call for edir. so we will skip it here
		*/
		if(!(this.isMaintenance&&this.edit_mode)){
		this.promise_data = jQuery.when.apply(this, promisefns);
		}
	},

	/**
	 * invokes rendering the form when the set of API calls' promise is resolved
	 */
	initRendering: function(rerender) {
		var _self = this;
		if(window.isMSPOrSCP) {
			$req.mspform.preUIRender();
		}
		if(this.promise_data !== null) {
			this.promise_data.then(function() {
				_self.renderUI(rerender);
			}, function() {
				/** TODO : Handle error */
			});
		} else {
			this.renderUI();
			return;
		}
	},

	/**
	 * renders the Request Form
	 */
	renderUI: function(rerender) {
		var _self = this;
		/**
		 * checks if the user has appropriate add / edit permission for accessing the form
		 * if not, failure alert thrown and redirects to the list view page
		 */
		if(this.edit_mode) {
			if(!this.links || !this.links.edit || !this.links.edit.put) {
				showalert("failure", getMessageForKey("sdp.requests.editrequest.autherror"), "isAutoHide=true");	//No I18N
				if(_self.isMaintenance){
					$spa.navigate('/ui/maintenances?mode=list','maintenances','maintenances-list',true); //NO I18N
				}else{
				setTimeout(function() {
					$spa.navigate("WOListView.do", "requests", "requests-list");	//No I18N
				}, 2000);
				}
				return;
			}
		} else {
			if((!this.templatePreview || (this.templatePreview && sdp_user.ROLES.indexOf("HelpdeskConfig") === -1) ) &&  (!this.links || !this.links.add || !this.links.add.post)) { //NO I18N
				showalert("failure", getMessageForKey("api.validation.request.operation.add.unauthorised"), "isAutoHide=true");	//No I18N
				if(_self.isMaintenance){
					$spa.navigate('/ui/maintenances?mode=list','maintenances','maintenances-list',true); //NO I18N
				}else{
				setTimeout(function() {
					$spa.navigate("WOListView.do", "requests", "requests-list");	//No I18N
				}, 2000);
				}
				return;
			}
		}

		if(!rerender) {
			this.renderHeader();
		}
		this.setCommonInfo();

		/**
		 * when the edit form contains reqTemplate parameter with different template id,
		 * then it is assumed that the template has to be changed by the Recommend Templates feature
		 */
		this.templateID = this.templateID+"";
		if(this.request_info && this.request_info.template){
			this.request_info.template.id = this.request_info.template.id+"";
		}

		if(this.edit_mode && !this.templateChanged && this.templateID !== this.request_info.template.id) {
            if (!window.isMSP || (window.isMSP && !$req.mspform.accountChangeEvent)) { // When the templateChanged is false to prevent repeated calling of changeTemplate in msp with accountChangeEvent as true
            	// this block is always executed for SDP
			this.changeTemplate(this.templateID);
			return;
		}
		}

		this.initForm();
		setTimeout(function() {
			_self.afterRender();
		});
	},

	/**
	 * sets the form props, to be used by the common code in WOCommon.js file
	 */
	setCommonInfo: function() {
		if(!$req.common) {
			return;
		}
		$req.common.page = "globalform";	//No I18N
		$req.common.mode = this.edit_mode ? "edit" : "new";	//No I18N
		$req.common.request_info = this.request_info || {};
		$req.common.prop = {
			non_editable_props: this.non_editable_props
		};
		$req.common.ssp = this.ssp;
		$req.common.is_service_template = this.is_service_template;
		$req.common.status_mandatory = this.statusMandatory;
		$req.common.template = this.template;
		$req.common.formname = "req-form";	//No I18N
		$req.common.resourceform = "resource-container";	//No I18N
		$req.common.links = this.links;
	},

	/**
	 * resets the form properties
	 */
	resetOptions: function(templateChanged) {
		this.templateChanged = false;
		this.template = {};
		this.fullAsset=false;
		this.is_service_template = false,
		this.metainfo = {};
		this.refer_fields=[];
		this.allowed_values = {};
		this.promise_data = null;
		this.status_mandatory = {};
		this.closing_rules = {};
		this.has_resource = false;
		this.cost = {};
		this.resource_fields = [];
		this.non_editable_props = [];
		this.sla_options = [];
		this.sla = {};
		this.did_fetch_sla = false;
		this.chatID = null;
		this.telephonyID=null;
		this.requesterID = null;
		this.bulk_mode = false;
		this.chat_info = {};
		this.suggestion_seen = false;
		this.isFAFRExecuted = false; // SD-124890
		this.rlcPromise = null;
		this.request_info && this.request_info.total_cost ? this.request_info.total_cost = undefined : "";

		if(window.isSCP) {
			this.accountID = null;
		}

		if(!templateChanged) {
			this.edit_mode = false;
			this.request_info = null;
			this.requester_info = null;
			this.ssp = {};
			this.links = {};
			this.statuses = [];
		}

		if(this.edit_mode){
			this.request_info = this.entitydata
		}
	},

	/**
	 * hook to be invoked after the Form is rendered.
	 */
	afterRender: function() {
		// this.renderFormHelpContent();
		this.showTemplateList();
	},
	/**
	 * Initializes the Form component for the Request form
	 */
	initForm: function() {
		var self = this;
		var template = this.constructTemplateInfo();
		var addLoggedInTech = true;	// var introduced for SCP
		/** In SCP setup, addLoggedInTech should be false by default  */
		if(window.isSCP ){
			addLoggedInTech = false;
			/**  addLoggedInTech can be enabled based on the sdp_app.isExcludeTech  */
			if(Object.prototype.hasOwnProperty.call(sdp_app,"isExcludeTech") && !sdp_app.isExcludeTech){  // NO I18N
				addLoggedInTech = true;
			}
		}
		var formoptions = {
			name: "WorkOrderForm",	//No I18N
			customform: true,
			entity: this.isMaintenance? "request_maintenance":"request",	//No I18N
			entityName: this.isMaintenance? getMessageForKey("common.maintenance"):getMessageForKey("common.request"),	//No I18N
			entitypath: this.isMaintenance?"/request_maintenances":"/requests",	//No I18N
			entitydata: this.entitydata || null,
			entitycontext: this,
			template: template,
			metadata: this.metainfo,
			mode: this.edit_mode ? "edit" : "new",	//No I18N
			container: "form-container",	//No I18N
			formid: "req-form",	//No I18N
			inlineImagesEntity: "WorkOrder",	//No I18N
			allowedValuesCallback: "$req.form.getAllowedValues",	//No I18N
			skipFields: [],
			//NOT NEEDED FOR Maintenance
			additional_contexts: ["udf_fields", "onhold_scheduler", "closure_info", "resolution"],	//No I18N
			isAddIn: this.isAddIn,
			external_frame: externalframe,
			canBeDynamic: ["approvers"], // No I18N
			preventReconstruct: ["CheckBox", "Radio"], // No I18N
			fafrDynamic: ["site", "technician", "group"],	// No I18N
			templateMetaMap: {
				requester_name: "requester",	//No I18N
				asset: "assets"	//No I18N
			},
			view: {
				defaults: {
					lookup: {
						text: getMessageForKey("sdp.common.notassigned")	//No I18N
					}
				}
			},
			edit: {
				canEditCallback: "$req.form.canEditFields",	//No I18N
				fields: {
					requester: {
						select2Type: "user",	//No I18N
						placeHolder: getMessageForKey("sdp.admin.requesterList.searchWord"),    //No I18N
						// SD-94779 - Unauthorized requesters are listed as allowed requesters while request.
						select2Opts: {
                            ignoreInitChk: true, // SD-106244 - to skip unnescessary api call if initially selected value's name is already available
                            isAPIInitSelect: true, // SD-106244 - use api url to set initial value instead of select2servlet url
                            initSelectCallback: function(data) { // SD-106244 - initial select callback to modify the api response
                                data = data.user;
                                return [{"id": data.id, "name": data.name}]; //No I18N
                            },
							isAPI:true,
							tooltip:true,
							url:"/api/v3/requests/requester", //No I18N
							entity_name:"requester", //No I18N
							criteriaCallback:$req.common.requesterCriteriaCallback,
							searchOptions: $req.common.getRequesterSearchOptions(),
							showAll: [ "email_id", "department","employee_id","name", "is_vipuser" ],	//No I18N
							placeHolder: getMessageForKey("sdp.admin.requesterList.searchWord"),	//No I18N
							multiple: false,
							formatSearching: window.translate("ae.common.search.text"),	//No I18N
							excludeTech: this.ssp.include_tech_as_requester !== "All" && this.ssp.include_tech_as_requester !== undefined,	//No I18N
							addLoggedInTech: window.isSCP ? addLoggedInTech : true,
							taggingNeeded:  window.sdp_user.USERTYPE === "Technician" && sdp_user.ROLES.indexOf("CreateRequester") > -1, //NO I18N
							siteFilterBehaviour: "SDP_Request" //No I18N
						},
						post: "$req.form.renderUserInfo"	//No I18N
					},
					on_behalf_of: {
						post: "$req.form.renderUserInfo",	//No I18N
						allowClear: true
					},
					description: {
						allowFullscreen: {
							title: window.translate('sdp.requests.common.desc')	//No I18N
						}
					},
					subject: {
						constraints:{
							max_length: 250
						}
					},
					impact_details:{
						constraints:{
							max_length: 250
						}
					},
					update_reason:{
						constraints:{
							max_length: 250
						}
					},
					sla_update_comments:{
						constraints:{
							max_length: 250
						}
					},
					approvers:{
						formatResult: function(item) {
							return e_html(item.display_name || item.name);
						},
						formatSelection: function(item) {
							return e_html(item.display_name || item.name);
						},
						matcher:function(term, text, option) {
							var name = option.name || "";
							var info = option.info || "";
							return name.toLowerCase().indexOf( term.toLowerCase() ) >= 0 || info.toLowerCase().indexOf( term.toLowerCase() ) >= 0 ;
						},
						renderField: function(item){
							return item.display_name || item.name;
						}
					},
					email_ids_to_notify: {
						search_keys: ["name", "email_id"],	//No I18N
						filterRemoteData: function(item) {
							return item && item.email_id;
						},
						processResults: function(search_data, data, field) {
							/** TODO::: This should be done in search_criteria itself */
							if(data && data.email_id) {
								search_data.push({
									id: data.email_id,
									name: data.name,
									email_id: data.email_id
								});
							}
						},
						formatSelection: function(item) {
							return e_html(item.email_id) || e_html(item.name);
						},
						formatResult: function(item) {
							if(item.email_id) {
								return e_html(item.name) + " &lt;" + e_html(item.email_id) + "&gt;";	// No I18N
							} else {
								return e_html(item.name);
							}
						}
					},
					technician: {
						techStatus: (sdp_user.USERTYPE != "Requester"),    //No I18N
						input_data_Callback: function(urlOptions,input_data,searchText){
							var search_criteria_to_return=[];
							if(sdp_user.USERTYPE != "Requester"){
								input_data.list_info.fields_required = ["name","is_online"];	// No I18N
								if ($rf.fields.technician.online) {
									search_criteria_to_return.push({"field": "is_online", "condition": "is", "value": "1" ,"logical_operator":"and"});
								}
							}
							if((sdp_user.USERTYPE != "Requester" && sdp_user.ROLES.indexOf("Restrict site access") > -1 ) && (!$req.form.edit_mode || $req.form.templateChanged)){
								input_data["template"]={"id":$req.form.templateID};	//No I18N
							}
							input_data.list_info.sort_field="name";  //NO I18N
							input_data.list_info.sort_order="asc";		  //NO I18N
							var groupVal=null;
							if($rf.fields.group){
								groupVal=$rf.fields.values.group&&$rf.fields.values.group.id?$rf.fields.values.group.id:$rf.fields.values.group;
							}
							if(groupVal!=""&&groupVal!=null&&groupVal!="0")
							{
								 search_criteria_to_return.push({"field": "support_group", "condition": "is", "value":groupVal,"logical_operator": "and"}); //No I18N
							}
							else if($rf.fields.site)
							{
								var siteVal = $rf.fields.values.site&&$rf.fields.values.site.id?$rf.fields.values.site.id:$rf.fields.values.site;
								if(siteVal=="0"||siteVal==null||siteVal==""){
									siteVal="-1";
								}
								if(siteVal=="-1" && $rf.fields.site.syncDefault && $rf.fields.site.default_id) {
									siteVal = $rf.fields.site.default_id;
								}
								search_criteria_to_return.push({"field": "associated_sites", "condition": "is", "value": siteVal ,"logical_operator":"and"}); //No I18N
							}
							if(searchText){
								search_criteria_to_return.push({"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"});
							}
							if(search_criteria_to_return.length>0){
								input_data.list_info.search_criteria=search_criteria_to_return[0];
								search_criteria_to_return.splice(0,1);
								if(search_criteria_to_return&&search_criteria_to_return.length>0){
									input_data.list_info.search_criteria.children=search_criteria_to_return ;
								}
							}
							if(input_data.list_info["search_fields"]){
								delete input_data.list_info["search_fields"]; //No I18N
							}
							return input_data;
						}
					},
					group: {
						//SD-119957 : To trigger allowed values call with search of name field.
						criteria_key:"name", //No I18N
						input_data_Callback: function(urlOptions,input_data,searchText){
							if((sdp_user.USERTYPE != "Requester" && sdp_user.ROLES.indexOf("Restrict site access") > -1 ) && (!$req.form.edit_mode || $req.form.templateChanged)){
								input_data["template"]={"id" : $req.form.templateID};	//No I18N
							}
							input_data.list_info.sort_field="name";  //NO I18N
							input_data.list_info.sort_order="asc";  //NO I18N
							var search_criteria_to_return=[];
							if($rf.fields.site)
							{
								var siteVal = $rf.fields.values.site&&$rf.fields.values.site.id?$rf.fields.values.site.id:$rf.fields.values.site;
								if(siteVal=="0"||siteVal=="-1"||siteVal==""){
									siteVal=null;
								}
								if(!siteVal && $rf.fields.site.syncDefault && $rf.fields.site.default_id) {
									siteVal = $rf.fields.site.default_id;
								}
								search_criteria_to_return.push({"field": "site", "condition": "is", "value":siteVal,"logical_operator": "and"}); //No I18N
							}
							if(searchText){
								search_criteria_to_return.push({"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"});
							}
							if(search_criteria_to_return.length>0){
								input_data.list_info.search_criteria=search_criteria_to_return[0];
								search_criteria_to_return.splice(0,1);
								if(search_criteria_to_return&&search_criteria_to_return.length>0){
									input_data.list_info.search_criteria.children=search_criteria_to_return ;
								}
							}
							if(input_data.list_info["search_fields"]){
								delete input_data.list_info["search_fields"]; //No I18N
							}
							return input_data;
						}
					},
					category: {
						pre: "$req.form.processCSI" //NO I18N
					},
					status: {
						pre: "$req.form.getStatuses"	//No I18N
					},
					editor : {
						input_data_Callback: function (url_options,input_data,ajaxOptions) {
							input_data['template'] = {"id" : $req.form.template.id}; //No I18N
							return input_data;
						}
					},
					space: {
						maxvalues: this.ssp.max_number_of_spaces_per_request?this.ssp.max_number_of_spaces_per_request:5
					},
					configuration_items: {
						maxvalues: this.ssp.max_number_of_conf_items_per_request?this.ssp.max_number_of_conf_items_per_request:25
					},
					assets: {
						placeholder: getMessageForKey("sdp.change.sla.select"), //No I18N
						pre: "$req.form.preAssetField",	//No I18N
						post: "$req.form.postAssetField",//No I18N
						maxvalues: this.ssp.max_number_of_cis_per_request,
						processResults: function(search_data, data, field) {
							if(data) {
								if(data.asset) {
									search_data.push({
										id: data.asset.id,
										name: data.asset.name
									});
								} else {
									search_data.push(data);
								}
							}
						},
						input_data_Callback : function (urlOptions,input_data,searchText) {
							input_data.list_info.search_criteria=[];
							if(searchText){
								input_data.list_info.search_criteria.push({"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"}); //NO I18N
								}
							if(!$req.form.fullAsset){
								if($rf.fields.on_behalf_of&&$rf.fields.values.on_behalf_of){
									input_data.list_info.search_criteria.push({"field": "user.id", "condition": "is", "value":$rf.fields.values.on_behalf_of,"logical_operator":"and"}); //NO I18N
										}
								else if($rf.fields.requester&&$rf.fields.values.requester){
									input_data.list_info.search_criteria.push({"field": "user.id", "condition": "is", "value":$rf.fields.values.requester,"logical_operator":"and"}); //NO I18N
									}
								}
							delete input_data.list_info["search_fields"];
							return input_data;
											}
					},
					site:{
						//SD-103440
						processResults:function(search_data, data, field, self) {
							// In Some case, the API have not specified id as "-1"
							// but the form component handle not specified value as "0"
							// For the uniformity, we changed the id from "-1" to "0"
							// This will eleminate handle the cases in plenty of place
							if(data.id == -1){
								data.id = 0;
										}
							if (search_data.length && self.settings && self.settings.default_option && self.settings.default_option.id == data.id) {
								return;
							}
							search_data.push(data);
									},
						input_data_Callback: function(form, listinfo, key){
							try {
								delete listinfo.list_info.search_fields;
							} catch (e) {}
							listinfo.list_info.sort_field="name";  //NO I18N
							listinfo.list_info.sort_order="asc";	  //NO I18N
							if((sdp_user.USERTYPE != "Requester" && sdp_user.ROLES.indexOf("Restrict site access") > -1 ) && (!$req.form.edit_mode || $req.form.templateChanged)){
								listinfo["template"]={"id" : $req.form.templateID};	//No I18N
							}
							if(key){
								listinfo.list_info.search_criteria = { "field":"name",	"values":[key],	"condition":"like",	"logical_operator":"and"};  //NO I18N
							}

                            if (window.isMSP) {
                              listinfo.list_info.sort_field = "account.name";  //NO I18N

                              if (sdp_user.USERTYPE != "Requester" && getAccountId() == '0') {
                                listinfo["template"] = { "id": $req.form.templateID };  //No I18N
                              }

                              if (key) {
                                listinfo.list_info.search_criteria = [{ "field": "name", "values": [key], "condition": "like", "logical_operator": "or" }, { "field": "account.name", "values": [key], "condition": "like", "logical_operator": "or" }] //NO I18N
                              }

                              if ($req.mspform.accountChangeEvent) {
                                 listinfo.list_info.search_criteria = { "field": "account", "values": [$req.mspform.getAccountID()], "condition": "is", "logical_operator": "and" };  //NO I18N
                              }
                            }

							return listinfo;
						}
					},
					multi_select: {
						maxvalues: this.ssp.multi_select_max_options_selected
					},
					CheckBox: {
						maxvalues: this.ssp.checkbox_field_max_options_selected
					}
				},
				defaults: {
					group: {
						id: "0",	//No I18N
						name: getMessageForKey("sdp.requests.fieldFormRules.rules.notspecified")	//No I18N
					},
					lookup: {
						dependent: {
							id: "0",	//No I18N
							name: getMessageForKey("sdp.requests.fieldFormRules.rules.notspecified")	//No I18N
						}
					}
				},
				onchange: {
					requester: "$req.form.renderUserInfo",	//No I18N
					on_behalf_of: "$req.form.renderUserInfo",	//No I18N
					approvers: "$req.form.onApproverChange", // NO I18N
					status: "$req.form.statusController",	//No I18N
					impact: "$req.common.setPriorityMatrixValue",	//No I18N
					urgency: "$req.common.setPriorityMatrixValue" // No I18N
				}
			},
			dependentFields: [{
				fields: ["category", "subcategory", "item"],	//No I18N
				order: true
			}, {
				fields: ["site", "group", "technician"],	//No I18N
				order: false
			}],
			save: {
				url: this.edit_mode ? (this.isMaintenance?"/api/v3/request_maintenances":"/api/v3/requests") + "/" + this.woID : (this.isMaintenance?"/api/v3/request_maintenances":"/api/v3/requests"),	//No I18N
				serializer: "$req.form.reviseUpdateInfo",	//No I18N
				submit: true,
				exit_alert: this.isAddIn ? false : true,
				postsuccess: "$req.form.saveSuccessHandler",	//No I18N
				//is_traces_link: window.externalframe ? "/WorkOrder.do?woMode=viewWO&woID=" : "",    //No I18N
				forcesave: this.templateChanged,
				onsubmit: "$req.form.preSaveHandler",	//No I18N
				submitbutton: {
					add: this.isMaintenance? window.getMessageForKey("sdp.common.next") : window.getMessageForKey("sdp.requests.newrequest.addrequest"),	//No I18N
					edit: this.isMaintenance? window.getMessageForKey("sdp.common.next") : window.getMessageForKey("sdp.requests.newrequest.update")	//No I18N
				},
				errorinterrupt:"$req.form.errorInterrupt", 	//No I18N
				posterror: "$req.form.handleError", 	//No I18N
				reset: (this.isAddIn||this.isMaintenance) ? false : true,
				onreset: "$req.form.resetForm",	//No I18N
				cancel: "$req.form.cancelForm",	//No I18N
				// SD-100344
				haveIDFormat:true,
				skipIDFormat: ["copied_from"] //NO I18N
			},
			//To Format the checkbox and radio refer fields in this format for better understanding.
			formatValues : function (search_data, fieldName) {
				for (var i = 0; i < search_data.length; i++) {
					if (fieldName.includes('udf_') && search_data[i].site && search_data[i].site.name) {
                        search_data[i].name = search_data[i].name + ", " + search_data[i].site.name;
                   }
               }
            },
			afterRenderCallback: function(form){
			    /* Binding events for request partial templates */
			    let templateListeners =  $req.form.bindEvents.templates;
			    if(!this.isMaintenance){
			       templateListeners.rf_req_close_form_footer();
			       templateListeners.rf_req_onhold_form_template();
			       templateListeners.rf_status_change_comment_template();
                }
               templateListeners.rf_requester_info_template();
            }
		};
		if(window.isMSPOrSCP) {
			$req.mspform.modifyFormOptions(formoptions);
		}
		/** for request new form, the template default values are set in the form component options */
		var default_values_path = {};
		if(!this.edit_mode && !window.duplicateRequest) {
			default_values_path = {
				description: "description.content"	//No I18N
			};
		}
		formoptions.default_values_path = default_values_path;

		/** skips the site field if there is no site configured in the application */
		if(!window.sdp_app.IS_SITE_CONFIGURE) {
			formoptions.skipFields.push("site");	//No I18N
		} else {
			if ((sdp_user.USERTYPE === "Requester" || !this.isSitesRestricted()) && !window.isMSP) {
				formoptions.edit.defaults.site = {
					id: "0",	//No I18N
					name: getMessageForKey("common.site.nosite")	//No I18N
				};
			} else if(!this.edit_mode && this.ssp.FIRST_SITE_OF_USER && (!template||!template.request||!template.request.site) || (this.edit_mode&&this.ssp.FIRST_SITE_OF_USER&&this.entitydata.site==null) ){
				formoptions.edit.defaults.site = jQuery.extend(true, {} , self.ssp.FIRST_SITE_OF_USER) ;
				formoptions.edit.fields.site.syncDefault = true;
			} else {
				formoptions.edit.defaults.site = false;
			}
			if(sdp_user.USERTYPE === "Requester" && !(window.isMSP && $req.mspform.isAccountManager())) { //No I18N
				formoptions.skipEditFields = ["site"];  //No I18N
		    }
		}

		// Technician helpcard is not needed for maintenance
		if(!this.isMaintenance){
		/** add form help content in the right pane of the Form Component */
		var hasHelpContent = sdp_user.USERTYPE === "Technician" ? this.template.technician_help_text : this.template.help_text;	//No I18N
		if(hasHelpContent) {
			formoptions.rightpane = {
				partial: "form-helpcontent-template",	//No I18N
				classes: "p10 form-cmtsection text-wrap vtop",	//No I18N
				width: "250px"	//No I18N
			};
		}
		}
		if(this.isAddIn){
			delete formoptions.rightpane;
		}
		/** for template preview, the save method should not do anything */
		if(this.templatePreview) {
			formoptions.save.exit_alert = false;
			formoptions.save.controller = function(payload, form, event) {
				event.stopPropagation();
				event.target.disabled = false;
			};
			formoptions.save.cancel = function(form) {
				event.stopPropagation();
				window.close();
			}
		}

		if(minpreview && !this.isFromZiaBot) {
			formoptions.scrollContainer = "#request-form-dialog";	//No I18N
		}
		/*
		Status change logics like statusmandatory,onhold,close,comments popup
		is not needed in maintenance
		*/
		if(this.isMaintenance){
			formoptions.def_entity="request";	//No I18N
			delete formoptions.edit.onchange.status;
			delete formoptions.inlineImagesEntity;
		}else if(this.fromProject){
            formoptions.save.successinterrupt = function(data){
                window.top.$associateProject.associateToProject(data.request.id);
                return true;
            }
        }

		//SD-107567
		formoptions.manualInit = true;
		window.$rf = new FC(formoptions);
		$rf.init();

		jQuery("#form-container").on("editLoaded", function() {	//No I18N
			self.afterLoad();
		});
	},
	setReqTemValue: function(item) {
        var self = this;
        var value;
        var fieldName = item.context ? item.context + "." + item.name : item.name;
        var TempHaveField = self.templateFields.hasOwnProperty(item.name);
        var reqDetail = (self.edit_mode) ? self.request_info : $rf.options.template.request;
        var reqHaveField = item.context && reqDetail[item.context] ? reqDetail[item.context].hasOwnProperty(item.name) : reqDetail.hasOwnProperty(item.name);
        // Description is alone, not in the context
        if (item.name === "description") {
            reqHaveField = reqDetail.hasOwnProperty("description"); // NO I18N
        }
        var templateValue, requestValue;
		var valueBeingSet="";
        requestValue = self.getRequestFieldValue(item.name, item.context);
        templateValue = self.getTemplateFieldValue(item.name, item.context);
        if (item.requester_can_edit) {
            value = requestValue;
			valueBeingSet = "request"; // NO I18N
            if (!value && templateValue) {
                value = templateValue;
				valueBeingSet = "template"; // NO I18N
            }
        } else {
            value = templateValue;
			valueBeingSet = "template"; // NO I18N
            if (!value && requestValue) {
				valueBeingSet = "request"; // NO I18N
                value = requestValue;
            }
        }
        if (TempHaveField && !reqHaveField) {
			valueBeingSet = "template"; // NO I18N
            value = templateValue;
		}
		try {
			if(fieldName=="group"&&value&&value.name!=null){
				value=value.name;
			}
			$rf.setFieldValue(fieldName, value);
		} catch (error) {
			/* eslint-disable no-console */
			console.error(error);
			/* eslint-enable no-console */
		}
    },
	/**
	 * hook to be invoked after the form is loaded completely (which means after all the field is loaded)
	 */
	afterLoad: function() {
		if(window.isMSP) {
			$req.mspform.afterLoad();
		}
		var self = this;
        var retain_fields_name = ["requester", // NO I18N
            "on_behalf_of", // NO I18N
            "subject", // NO I18N
            "assets", //No I18N
            "created_time", //No I18N
            "scheduled_start_time", //No I18N
            "scheduled_end_time", //No I18N
            "responded_time", //No I18N
            "due_by_time", //No I18N
            "resolved_time", //No I18N
            "completed_time", //No I18N
            "time_elapsed", //No I18N
            "first_response_due_by_time", //No I18N
            "closure_code", //No I18N
            "closure_comments", //No I18N
            "resolution.content", // <- Here, we skip resolution and handle below  //No I18N
            "editor", // NO I18N
            "site", // <- Here, we skip site and handle below  // NO I18N
            "approvers", // NO I18N
            "email_ids_to_notify" // We cann't able provide the default values for the this field, so we always retained the value // NO I18N
       ];
		this.setEditorContent();
		if ((this.edit_mode && this.templateChanged) || zia_cat_temp_suggestion.isSuggestedByZia) {
        		if(zia_cat_temp_suggestion.isSuggestedByZia) {
        			zia_cat_temp_suggestion.isSuggestedByZia = false;
        		}

    		if( $rf.fields.category && $req.form.zia_properties.category){
    			$rf.setFieldValue("category", $req.form.zia_properties.category); // NO I18N
    			delete $req.form.zia_properties.category;
    		}
            // Skip the dependent fields
            var dependentFields = [];
            jQuery.each($rf.options.dependentFields, function(index, item) {
                dependentFields = dependentFields.concat(item.fields);
            });
            retain_fields_name = retain_fields_name.concat(dependentFields);
            jQuery.each($rf.fields, function(index, item) {
                if (item && item.name && !item.ondemand) {
                    var fieldName = item.context ? item.context + "." + item.name : item.name;
                    if (retain_fields_name.indexOf(fieldName) === -1) {
                        self.setReqTemValue(item);
                    }
                }
            });
			/** Need to handle the Resolution alone */
			var reqValue = self.getRequestFieldValue("resolution","content"); // No I18N
			reqValue = reqValue ? reqValue.content : "";
			reqValue = "<div>"+reqValue+"</div>";

			var templateValue = self.getTemplateFieldValue("resolution","content"); 	//No I18N
			var resolutionVal = templateValue ? templateValue.content : "";
			if(!isEmpty(resolutionVal))
			{
			    document.getElementById("rfres-panels-zc").expandPanel("#rfres-panel1-zc"); //No I18N
			}
			$rf.setFieldValue("resolution.content",resolutionVal ); //No I18N
    }



		/** setting account based on the accountID parameter value */
		if(window.isSCP && !this.edit_mode && this.accountID && sdp_user.USERTYPE === "Technician"){
			$rf.setFieldValue("account", this.accountID + "");	//No I18N
		}

		if(this.is_service_template && !this.isAddIn) {
			/** render cost estimation details */
			this.renderCostEstimation();
			/** render service band with SLA and Cost details */
			this.renderServiceBand();
		}

		if($rf.fields.priority) {
			/** adding the priorityMatrix element to the Priority field */
			jQuery("#req-form [data-name='priority']").parent()	//No I18N
				.append("<input type='hidden' value='" //No I18N
					+ (($rf.fields.priority.current_value && $rf.fields.priority.current_value.id) ? $rf.fields.priority.current_value.id : 0)
					+ "' id='priorityMatrix' data-field='" + $rf.fields.priority.fafr_key + "'>");	//No I18N
		}
		if($rf.fields.assets && $rf.fields.assets.element) {
			$rf.fields.assets.element.setAttribute("id", "selectedCIs");	//No I18N
		}
		// Refer SD-89565
		if(
			($req.form.templateChanged) && (
				($req.form.request_info.is_service_request && !this.is_service_template) ||
				(!$req.form.request_info.is_service_request && this.is_service_template)
			)
		){
			if($rf.fields.due_by_time){
				try {
					$rf.setFieldValue("due_by_time",0); //No I18N
				} catch (error) {
					/* eslint-disable no-console */
					console.error(error);
					/* eslint-enable no-console */
				}
			}
			if($rf.fields.first_response_due_by_time){
				try {
					$rf.setFieldValue("first_response_due_by_time",0); //No I18N
				} catch (error) {
					/* eslint-disable no-console */
					console.error(error);
					/* eslint-enable no-console */
				}
			}
		}
		/**
		 * Need to hide the response due by time and due by time field in Incident to service template change
		 * and service to incident template change page
		 * SD-93115
		 */
		var templateChangeFlow = {};
		if (this.edit_mode && this.templateChanged) {
			templateChangeFlow.from = this.request_info.template.is_service_template ? "service":"incident";  // NO I18N
			templateChangeFlow.to = this.template.is_service_template ? "service":"incident";  // NO I18N
			if((templateChangeFlow.from === "incident" && templateChangeFlow.to ==="service")  // NO I18N
				|| (templateChangeFlow.from ==="service" && templateChangeFlow.to ==="incident")){  // NO I18N
					// Remove the due by time
				if($rf.fields.due_by_time){
					$rf.removeField("due_by_time");  // NO I18N
					jQuery('[data-cs-field="due_by_time"]').remove();  // NO I18N
				}
				//Remove first_response_due_by_time field
				if($rf.fields.first_response_due_by_time){
					$rf.removeField("first_response_due_by_time");   // NO I18N
					jQuery('[data-cs-field="first_response_due_by_time"]').remove();  // NO I18N
				}
			}
		}
		// Refer SD-89586
		if($req.form.templateChanged && $rf.fields.site){
			var siteValue;
			var siteNullValue= {
				id: "0",
				name:getMessageForKey("sdp.admin.technician.addtechnician.nosite")
			};
			// if requester, then we set request value
			if(sdp_user.USERTYPE === "Requester" && !(window.isMSP && $req.mspform.isAccountManager())){ // NO I18N
				siteValue = $req.form.request_info.site || siteNullValue;
				if((!window.isMSPOrSCP || !$req.form.request_info.site) && $req.form.template.request.site){
					siteValue = $req.form.template.request.site;
				}
				$rf.protectedSet("site", siteValue.id ? siteValue.id : siteValue); //NO I18N
				jQuery("p[data-name='site']").html(e_html(siteValue.name));      //No I18N
				// SD-95698
				$rf.reformDependentFields("site", $rf.getDependentFields("site").fields); // NO I18N
			// If "To" template have site value, then set that value
			}else if($req.form.template.request.site){
				siteValue = $req.form.template.request.site;
			}else{
				// otherwise, set the request value
				siteValue = $req.form.request_info.site || siteNullValue;
			}
			try {
				$rf.setFieldValue("site", siteValue); //No I18N
			} catch (error) {
				/* eslint-disable no-console */
				console.error(error);
				/* eslint-enable no-console */
			}
		}
		if(self.templateChanged){
			// Process the dependent fields seperatly
			jQuery.each($rf.options.dependentFields, function(index, obj){
				for (var i = 0; i < obj.fields.length; i++) {
					var item = $rf.fields[obj.fields[i]] || null;
					// site already handled
						if(item && obj.fields[i] !== "site"){ // No I18N
							self.setReqTemValue(item);
						}
					}
			});
		}

		/** Collapses Resolution box if the resolution content is not available */
		if( $rf.fields["resolution.content"] && !$rf.fields["resolution.content"].mandatory
			&& (!this.request_info || !this.request_info.resolution || !this.request_info.resolution.content) ) {
				document.getElementById("rfres-panels-zc").collapsePanel("#rfres-panel1-zc"); //No I18N
		}
		if(this.isAddIn==false){
			/** bind auto suggestions in Subject field */
			this.initAutoSuggestions();
		}

		/*
		For Maintennace Form, We dont need FAFR
		*/
		if(!this.isMaintenance){
		$req.common.setFieldAndFormRules("", "", "", true);	//No I18N
		}
		else{
			/*
			fixing the footer in schedule form
			error message show/hide for maintenance title field
			setting maintenance title and dscription from api
			*/
			fixedformfooter(jQuery("#schedule-formwrapper")[0], jQuery("#schedule-formwrapper").find("[data-name=schedule-form-footer]")[0], "fixedbtnpbottom=false");	// No I18N
			var jbdy = jQuery('body');
			charCounter.init();
			var titleEle=jbdy.find('#templName');
			titleEle.keyup(function(){
				if(titleEle.val()){
					jbdy.find('#templName-error').addClass("hide");
				} else{
					jbdy.find('#templName-error').removeClass("hide");
				}
			});
			if(this.edit_mode){
				if(self.maintenanceName){
					titleEle.val(self.maintenanceName);
				}
				if(self.maintenanceComments){
					jbdy.find('#templDesc').val(self.maintenanceComments);
				}
			}
		}

		var disableTemplateChange = function(){
			if(self.is_service_template) {
				jQuery("#rf-template-service-list").select2("disable");	//No I18N
			} else {
				jQuery("#rf-template-incident-list").select2("disable");	//No I18N
			}
		}
		/** for template preview, the attachment support should be disabled */
		if(this.templatePreview) {
			if(sdp_user.USERTYPE === "Requester") {
				jQuery("#rf-requester-details").find("p[data-name='requester']").text("Guest");	//No I18N
			}
			disableTemplateChange();
			jQuery("#request-attachment-container").removeAttr("data-drop-uuid").css("pointer-events", "none");	//No I18N
		}
		/*
		Disabling template change in maintenance edi and allowing in add(need to decide)
		*/
		if((!this.isMaintenance && window.sdp_user.ROLES.indexOf("CreateRequests") === -1)||(this.isMaintenance&&this.edit_mode)){ // NO I18N
			disableTemplateChange();
		}

		if(sdp_user.USERTYPE === "Requester") {
			/**
			 * when the status field is not available in the form for requester and RLC is configured,
			 * we have to get the status info and related mandatory fields
			 */
			 if(!$rf.fields.status && this.isRLCEnabled()) {
			 	this.getStatuses();
			 }
		}
		/** Disabling status field in outlook addin page */
		if(this.isAddIn) {
			$rf.disableFieldToggle("status", true);	//No I18N
		}


		/** focuses Requester field in add new form for Techs and Subject field for Requester */
		if(!this.edit_mode && !this.templatePreview && this.isAddIn==false) {
			/** wait for things to get settleed like setting values based on params and on form load FAFR */
			setTimeout( function() {
				if(sdp_user.USERTYPE === "Technician" || (window.isMSP && $req.mspform.isAccountManager())) {
					// setting focus on maintenance title as it is first mandatory field in form
					if(this.isMaintenance){
						jQuery('#templName').focus();
					}else{
					$rf.fields.requester && !$rf.fields.values.requester && jQuery('[data-field="REQUESTER"').select2("focus"); 	//No I18N
					}
				} else {
					$rf.focusField("subject");	//No I18N
				}
			}, 100 );
		}

		if(typeof this.afterLoadCallback === "function") {
			this.afterLoadCallback();
		}
		if(this.isFromZiaBot){
			ziac.loadResource().then(function () {
				ziabot.requestFormAfterLoad();
			});
		}
		/* request collabaration is not needed for maintenance*/

		/** registering the Request Collaboration count */
		if(this.edit_mode && sdp_user.USERTYPE === "Technician" &&!this.isMaintenance) {
			jQuery("#request_collaboration").insertBefore("#rf-req-collaboration");	//No I18N
			if(typeof pagenotif !== "undefined") {
				pagenotif.initialize(sdp_user.LOGGEDIN_USERID, "request", this.woID, handleWOPageMessages);	//No I18N
				pagenotif.register();
			}
			jQuery("#rf-header").css("position", "relative");	//No I18N
			if(sdp_user.DIRECTION === "RTL") {
				jQuery("#collaboration_icon").removeAttr("style").attr("style", "top:5px; right:10px");	//No I18N
			}
		}
		var taskTemplate = jQuery("#templateTask_div"); //No I18N
		var hasTaskVisible= sdp_user.USERTYPE === "Technician" || (sdp_user.USERTYPE==="Requester" && $req.form.template.task_configurations && $req.form.template.task_configurations.can_requester_view_tasks); //No I18N
		if(this.templateChanged && this.edit_mode &&  hasTaskVisible){
			var tasksEle = taskTemplate.find("input[name='tmplTaskId']");	//No I18N
			tasksEle.each(function(_index,el){
				jQuery(el).prop("checked",true); //NO I18N
			});
		}
		if(hasTaskVisible){ // NO I18N
			taskTemplate.closest(".widget-table").removeClass("hide"); // NO I18N
		}
		if(sdp_user.USERTYPE === "Requester"){ // NO I18N
			taskTemplate.find("input[name='tmplTaskId']").attr("disabled",true); // NO I18N
			taskTemplate.find("input[name='tmplTaskId']").not(':checked').closest('.row').addClass("hide") // NO I18N
		}
		$rf.fields.request_template_task_ids = { id:"request_template_task_ids"}; // NO I18N
		$rf.fields.values.request_template_task_ids = $rf.fields.request_template_task_ids;
		/**
		 * Bind the Task Events
		 */
		taskTemplate.find("input[name='tmplTaskId']").on('change',function(){ // NO I18N
			if($rf.fields.changed.indexOf("request_template_task_ids") === -1){ // NO I18N
				$rf.fields.changed.push('request_template_task_ids'); // NO I18N
			}
		});



		if(sdp_user.USERTYPE === "Requester") { // NO I18N
			var fromModule = $spa.getSearchParam("fromModule"); // NO I18N
			if(fromModule && fromModule === "RecreateRequest"){ // NO I18N
				jQuery(".page-progressbar").show(); //No I18N
				sdpAjax({
					url:"/api/v3/requests/"+$req.form.woID, //No I18N
					complete:function(){
						jQuery(".page-progressbar").fadeOut(); //No I18N
					},
					success:function(res){
						if(res && res.request){
							$rf.safeSetFieldValue("subject",res.request.subject); //No I18N
							// Giving some time for initialize the Z Editor
							setTimeout(function(){
								var description = res.request.description.context ? res.request.description.context:res.request.description;
								$rf.safeSetFieldValue("description",description); //No I18N
							},100);
						}
					}
				});
			}
		}

        if(this.chat_info && this.chatID && !jQuery.isEmptyObject(this.chat_info) && $rf.fields.mode){
            this.setModeAsChat();
        }

		if(window.isMSPOrSCP) {
			$req.mspform.loadFields(this);
		}

		/**
		 * We need to set the status value to the current status
     * If the "From" and "To" template both are configured same template
		 */

		 if(this.edit_mode && this.templateChanged && this.isRLCEnabled() && $rf.fields.status){
			var requestInfoLifeCycleId = this.request_info.lifecycle && this.request_info.lifecycle.id;
			var templateLifeCycleID = this.template.lifecycle && this.template.lifecycle.id;
			if(requestInfoLifeCycleId && templateLifeCycleID && (templateLifeCycleID == requestInfoLifeCycleId) ){
				this.safeSetStatusValue($rf.fields.status.value);
			}
		}

		if(window.isMSP) {
			$req.mspform.resetAccountChangeEventVariables();
		}

   var jQBody = jQuery("body");
   jQBody.find(".page-progressbar").hide(); //No I18N
   jQuery(window).off("popstate.zia_tcp").on("popstate.zia_tcp", function(e) { //No I18N
   /** Ziz template/category prediction is need to close*/
   jQBody.find("#ziasuggestion_submit").closest(".ui-dialog").remove(); //No I18N
   jQBody.find("#zia-notify-overlay").hide();
   jQBody.removeClass("atp-open"); // NO I18N
		});
	jQuery("#req-form").removeClass("ptr-ev-none");//No I18N
	},
	formatFieldValues:function(fieldType,value){
		/** When the date value is lesser than year 1970, the display_value is sent as null and value is in negative */
		/** But the Form Component will change as zero as string */
		if (fieldType === "datetime" && value) {
			value = value.value == "0" ? null : value;
			value =  value && value.value ? value.value : value;
		}else if((fieldType === "multi_select" || fieldType ==="CheckBox") && !value){ // NO I18N
			/** Default value for the multiselect and checkbox field is [] not null */
			value = [];
		}else if(fieldType === "html"){ // NO I18N
			// In some sinario, value has content in object format
			if(value && value.content){
				value = value.content;
			}
		}
		return value;
	},
	getTemplateFieldValue: function(name, context) {
		var value = null;
        var fieldName = context ? [context + "." + name] : name;
        var fieldType = $rf.fields[fieldName] && $rf.fields[fieldName].type;
        if (this.template && this.template.request) {
            if (context && this.template.request[context] && this.template.request[context][name]) {
                value = this.template.request[context][name];
            } else if (this.template.request && this.template.request[name]) {
                value = this.template.request[name];
            }
          value = this.formatFieldValues(fieldType,value);
        }
        return value;
    },
    getRequestFieldValue: function(name, context) {
        var fieldName = context ? [context + "." + name] : name;
        var fieldType = $rf.fields[fieldName] && $rf.fields[fieldName].type;
		var value = null;
		var request_info = (this.edit_mode) ? (this.request_info_ref || this.request_info) : $rf.options.template.request;
        if (request_info) {
            if (context && request_info[context] && request_info[context][name]) {
                value = request_info[context][name];
            } else if (request_info && request_info[name]) {
                value = request_info[name];
            }
			value = this.formatFieldValues(fieldType,value);
        }
        return value;
    },
	/** --- DATA FETCHING --- */

    /**
     * In order increase the page of intial rendering,
     * We have planned to go with combined API call - One Single API call for all different sorts data
     * This will give us siginificant improvement in the First Contentnful Paint Timing
     * @param {boolean} isTemplateChanged Template is changed to not
     * @param {Array<string>} required These will sent as includes in the input array regardless of condition
     * @returns {Promise<jQuery.ajax>} Promise object of jquery ajax will be return
     */
     fetchCombinedData: function(isTemplateChanged, required) {
        var apiUrl = "/api/v3/requests/_newform"; // NO I18N
        var urlAccountId = null;	// variable used for appending Account ID to URL for MSP
        var isEditMode = !!this.edit_mode;
        var infokey = "newform"; // NO I18N
        var sspkey = "self_service_portal_settings"; // NO I18N
        var templateKey = "template"; // NO I18N
		var udf_mapping="get_udf_mapping_names"; // NO I18N
		/* For maintenance edit, we use add requst newform combined call */
        if ((isEditMode || window.duplicateRequest)&&!this.isMaintenance) {
            /** For the Edit Page the API URL is different */
            apiUrl = "/api/v3/requests/" + this.woID + "/request_detail"; // NO I18N
            infokey = "request_detail"; // NO I18N
            sspkey = "self_service_portal"; // NO I18N
            templateKey = "request_template"; // NO I18N
			udf_mapping="udf_mapping_names"; // NO I18N
        }
        /** Input data for combined API */
        var input_data = {
            includes: [
                templateKey,
                "metainfo", // NO I18N
                "self_service_portal", // NO I18N
                "status", // NO I18N
                "_links", // NO I18N
                "priority_matrices", // NO I18N
                "csi_model", // NO I18N
                "get_connected_nodes", // NO I18N
                "status_mandatory_fields", // NO I18N
                udf_mapping
            ]
        };
        /** We need to pass template ID if the template is changed */
		/* For maintenance add and edit, we use add requst newform combined call so we always pss templateid */
        if ((!isEditMode && !window.duplicateRequest) || isTemplateChanged || this.isMaintenance) {
            /** For Duplicate request, we edit page of request in the new_page mode */
            input_data.template = {
                id: this.templateID
            };
        }
		// Issue fix for SD-98177
		if(this.edit_mode && this.bulk_mode){
			input_data["for"] = 'request_bulk_edit'; // NO I18N
			delete input_data.template;
		}
		// SD-102088 inactive template preview
		if(this.templatePreview){
			input_data["for"] = 'preview_template'; // NO I18N
		}
		//passing for as maintenance to fetch all statuses
		if(this.isMaintenance){
			input_data["for"] = 'maintenance'; // NO I18N
			if(this.edit_mode){
				input_data["request_maintenance"]={"id":this.woID}; // NO I18N
				if(window.isMSP) {
					// fetching template info from all templates for case where template is not associated maintenance request's account
					// template or account change is not allowed for maintenance entity on edit
					urlAccountId = 0;
				}
			}
		}
		//SD-119555 :  For param passed to get "open" status from allowed Values list of a details call.
		if(window.duplicateRequest) {
			input_data["for"] = "duplicate_request"; // No I18N
		}
        /**
         * If the data is template, we need status, metainfo and template info for the new template
         * So we are calling the same URL that one used in the new request page
         */
        if (isTemplateChanged) {
            input_data.includes = ["template", "metainfo"]; // NO I18N
            apiUrl = "/api/v3/requests/_newform"; // NO I18N
            infokey = "newform"; // NO I18N
            templateKey = "template"; // NO I18N
            if (window.isMSP) {
				input_data.includes.push("csi_model");
				if($req.mspform.accountChangeEvent) {
					// for account change
					urlAccountId = $req.mspform.form_account_id;
				} else {
					// for template change
					urlAccountId = getAccountId();
				}
			}
        }
        if (required && Array.isArray(required)) {
            input_data.includes = required;
        }
		    if(window.duplicateRequest){
			    input_data.includes.splice(input_data.includes.indexOf("_links"), 1); //NO I18N
		    }
			/* For maintenance add and edit, we use add request newform combined call which has
			links based on request module so we remove links from here and fetch separately */
		    if(this.isMaintenance&&input_data.includes.indexOf("_links")>-1){
			    input_data.includes.splice(input_data.includes.indexOf("_links"), 1); //NO I18N
		    }
		input_data.includes.push("techs_on_leave");
        if(window.isMSP && urlAccountId) {
            apiUrl = apiUrl + '?ACCOUNTID=' + urlAccountId; //No I18N
        }
        /** Show skeleton loader, before we make an API call and hide after the FAFR was done */
        this.skeletonLoader(true);
        var _self = this;
		var successHandler = (response)=>{
			if (infokey=="request_detail" && response.response_status.status=="warning"){
				_self.req_warning=response.response_status.messages[0];
			}
                /** Get the data from either newform or request_detail API key */
                if (response[infokey]) {
                    response = response[infokey];
                    if (infokey === "request_detail") {
                        // NO I18N
                        response = response[0];
                    }
                } else {
                    return false;
                }
               	if(response["udf_mapping_names"]){
               		_self.udf_mapping_names=response["udf_mapping_names"];
               	}
                /** Process the Template in a seperate function */
			_self.processTemplateInfo(response, templateKey);
                if (response.metainfo) {
                    /** Save the metainfo into the Reference */
				_self.metainfo = {
                        fields: response.metainfo
                    };
                    /**
                     * Process the Meta info in seperate function
                     * We must pass whole metainfo refernce, instead of response.metainfo
                     * Because the processMetaInfo method uses pass-by-reference
                     *  */
				_self.processMetaInfo(_self.metainfo);
                }
                /** Save the self service portal settings into the Reference */
                if (response["self_service_portal"]) {
				_self.ssp = response["self_service_portal"];
					if(this.ssp&&this.ssp.FIRST_SITE_OF_USER&&this.ssp.FIRST_SITE_OF_USER){
						if(this.ssp.FIRST_SITE_OF_USER.id=="-1"){
							this.ssp.FIRST_SITE_OF_USER.id="0";
						}
					}
                    /** This variable will help, If we choose the asset via popup */
				window.maxCICount = _self.ssp.max_number_of_cis_per_request ? parseInt(_self.ssp.max_number_of_cis_per_request, 10) : 0;
				window.maxSpaceCount = _self.ssp.max_number_of_spaces_per_request ? parseInt( _self.ssp.max_number_of_spaces_per_request ) : 5;
                }
				if(response.techs_on_leave){
				_self.techs_on_leave=response.techs_on_leave;
				//For form component reference
				FC.config.techs_on_leave = response.techs_on_leave;
				} else{
				_self.techs_on_leave={};
				}
                /** Process Status Info */
                if (response.status) {
                    /** Save the metainfo into the Reference */
				_self.statuses = response.status;
                    /**
                     * Save the status info WOCommon Pool and it used to for making
                     * opertional_data for the status
                     */
                    $req.common.setStatusInfo(response.status);
                }
                /** Process the Permission details */
                if (response._links) {
                    var links = response._links.links ? response._links.links : response._links;
                    links = links || [];
                    /**
                     * To construct the permission info json from the _links data to make the data
                     * more reachable rather than iterating every time
                     */
				_self.links = $req.common.constructLinksInfo(links);
                }
                /** Process the CSI Model */
                if (response.csi_model) {
                    /** Save the Model into the Reference*/
				_self.csi_model = response.csi_model;
                    /** Restructure the CSI model, for the FAFR */
				_self.csi_json = $req.common.formatCSI(response.csi_model.categories);
                }
                /** Process the priority matrix */
                if (response.priority_matrices) {
				_self.processPriorityMatrix(response);
                }
                /** Process the Request Info*/
                if (response.request) {
				_self.processRequestInfo(response);
                }
                /** If status mandatory field is available */
                if (response.status_mandatory_fields) {
                    // @todo
                }
		}
        return sdpAjax({
            url: apiUrl,
            data: sdpAjaxInputData(input_data),
            context: this,
            cache: false,
            success:successHandler,
            error: function(jqXHR, textStatus, errorThrown) {
		        var response = jqXHR.responseJSON;
				if(textStatus=="warning" && response[infokey]){ //In case of warnings,If the request data is provided in response Form will be rendered along with warning header.
                    successHandler(response);
				}
				else{//In case of errors or warnings with no data - Handlings done in errorHandler function
                   _self.errorHandler(10001, false, jqXHR, textStatus, errorThrown);
				}
            }
        });
    },
	fetchLinks: function(){
		var entity="requests"; //NO I18N
		var _self=this;
		if(this.isMaintenance){
			entity="request_maintenances"; //NO I18N
			if(this.edit_mode){
				entity=entity+"/"+this.woID;
			}
		}
		return sdpAjax({
			url:"/api/v3/"+entity+"/_links", //NO I18N
			context: this,
            cache: false,
			success: function(res){
				var links = res._links;
				if(_self.isMaintenance){
					links=links.links|| links;
				}
				_self.links = $req.common.constructLinksInfo(links);
			}
		})
	},
	/*
	The below function fetches maintenance entity data triggers the promise
	to fetch combined data and links once the promise is resolved form rendering will happen
	*/
	fetchMaintenanceData: function(){
		var self=this;
		sdpAjax({
			url:"/api/v3/request_maintenances/"+self.woID, //NO I18N
			context: this,
            cache: false,
			success: function(res){
				if(window.isMSP) {
					setAccountId(res.request_maintenance.account.id);
					$("__persistentAccountId__select").disabled = true; //NO I18N
				}
				self.maintenanceName=res.request_maintenance.name;
				self.maintenanceComments=res.request_maintenance.comments;
				self.schedule_info= jQuery.extend(true, {} ,res.request_maintenance.scheduler);
				var toProcess = {};
				toProcess.request = res.request_maintenance;
				self.processRequestInfo(toProcess);
				var promisefns = [	self.fetchCombinedData(),self.fetchLinks()];
				self.promise_data = jQuery.when.apply(self, promisefns);
				$req.form.initRendering();
			},
			error: function(res){
				$spa.navigate('/ui/maintenances?mode=list','maintenances','maintenances-list'); //NO I18N
				return;
			}
		})
	},
    /**
     * Process the template info from the Combined call
     * @param {object} response Response from the combined call API
     */
    processTemplateInfo: function(response, key) {
        /**
         * If the page is open via template preview page in the admin configuration,
         * We don't have template ID for the all time, this is case we have preview_json  variable from the Configuration
         */
        if (this.templatePreview) {
            if (window.opener.preview_json && window.opener.preview_json.request_templates) {
                this.template = window.opener.preview_json.request_templates;
                this.is_service_template = this.template.is_service_template ? true : false;
                return;
            }
        }
        try {
            if (response[key]) {
                /** Take the refrence of the request template data */
                this.template = response[key];
                /** In the edit page, the templateID is not present by default */
                !this.templateID && (this.templateID = this.template.id);
                /** Find out Is Service Request */
                this.is_service_template = this.template.is_service_template ? true : false;
					if(window.isMSP && sdp_user.USERTYPE === "Technician") {
						// for fetching the sites that are allowed for the template
						$req.mspform.loadTemplateSites(this.templateID, this.edit_mode, this.woID)
					}
            }
        } catch (error) {
            this.errorHandler(10001, true, data);
        }
		this.ensureEditorRef();
		// Get the reference of the description and delete it from the template
		if( this.template.request && this.template.request.description && this.template.request.description.content){
			if(!this.edit_mode){
					this.request_description  = appendImageToken(this.template.request.description.content, this.template.image_token);
			}
			this.ref.description.template = this.template.request.description.content;
			delete this.template.request.description;
		}
		// Get the reference of the resoltion and delete it from the template
		if( this.template.request && this.template.request.resolution && this.template.request.resolution.content){
			if(!this.edit_mode){
				this.request_resolution  = this.template.request.resolution.content;
			}
			this.ref.resolution.template = this.template.request.resolution.content;
			delete this.template.request.resolution.content;
		}
    },
    /**
     * processes the fetched meta info and makes required changes
     */
    processMetaInfo: function(metainfo) {
        if (!metainfo || !metainfo.fields) {
            return;
        }
        /**
         * For the Technician, the field email_ids_to_notify is in the form of select2
         * So we directly change the metainfo
         * */
        if (metainfo.fields.hasOwnProperty("email_ids_to_notify") && metainfo.fields.email_ids_to_notify) {
            metainfo.fields.email_ids_to_notify.constraints = {
                type: "email" //No I18N
            };
            /** For the Requester, the field email_ids_to_notify is in the form of plain text */
            if (sdp_user.USERTYPE === "Requester") {
                metainfo.fields.email_ids_to_notify.display_type = "string"; // NO I18N
            }
        }
        /**
         * If the new request page was loaded in Addin, like Outlook-SDP Addin
         * Then the description & resolution toolbar having minimal number of options
         *  */
        if (this.isAddIn) {
            if (!!metainfo.fields.description) {
                metainfo.fields.description.toolbar = "outlooktoolbar"; //No I18N
            }
            if (!!metainfo.fields.resolution && !!metainfo.fields.resolution.fields && !!metainfo.fields.resolution.fields.content) {
                metainfo.fields.resolution.fields.content.toolbar = "outlooktoolbar"; //No I18N
            }
        }
    },
    /**
     * Process the Priority Matrix
     * Basically, we generate the object called priority_matrices from the API response
     * In the data structure of [impact##urgency] = priority
     * So it will easier form the priority value based on the matrix
     */
    processPriorityMatrix: function(response) {
        var priority_matrices = {};
        var priority_matrix = [];
        if (response && response.priority_matrices) {
            priority_matrix = response.priority_matrices;
            /** Construct the priority matrix from the response */
            for (var i = 0, len = priority_matrix.length; i < len; i++) {
                var impact = priority_matrix[i].impact.id;
                var urgency = priority_matrix[i].urgency.id;
                var priority = priority_matrix[i].priority.id;
                priority_matrices[impact + "##" + urgency] = priority; //No I18N
            }
            /** Pass the formed data into the WOCommon's Operational Data */
            $req.common.operational_data.priority_matrix = priority_matrices;
        }
    },
    /**
     * Process the Request info
     */
    processRequestInfo: function(response) {
        /** Email ids to Notify field is input for requestor, so need to convert array into string */
        if (sdp_user.USERTYPE === "Requester" && response.request.hasOwnProperty("email_ids_to_notify")) {
            // NO I18N
            response.request.email_ids_to_notify = response.request.email_ids_to_notify.join(", ");
        }
        this.request_info = response.request;
        //append image token to html fields, when loading to editor
        this.request_info.description = appendImageToken(this.request_info.description, this.request_info.image_token);
        this.request_info.resolution.content = appendImageToken(this.request_info.resolution.content, this.request_info.image_token);

        /* To set the primary image for the dropdown question selected option in request_info (url will be under pictures, which need to be sent via images to the FC). */
        if(this.request_info.template && this.request_info.template.is_service_template && this.request_info.udf_fields){
            for(let field in this.request_info.udf_fields){
                let fieldValue = this.request_info.udf_fields[field];
                if(fieldValue){
                    /* Currently this is required only for the dropdown questions. But handling for multiselect/radio questions to maintain uniform data */
                    if(Array.isArray(fieldValue)){
                        for(let value of fieldValue){
                            Array.isArray(value.pictures) && value.pictures.length && (value.images = [value.pictures[0]['content-url']]);
                        }
                    }
                    else{
                        Array.isArray(fieldValue.pictures) && fieldValue.pictures.length && (fieldValue.images = [fieldValue.pictures[0]['content-url']]);
                    }
                }
            }
        }

        /** While duplicate resquest, status need to change open */
        if (window.duplicateRequest) {
            var status = this.getOpenStatus();
            if (this.request_info.hasOwnProperty("status")) {
                this.request_info.status = status;
            }
			// SD-100785
			this.request_description = this.request_info.description || "";
			try {
				this.request_resolution = this.request_info.resolution.content || "";
			} catch (error) {
				this.request_resolution = "";
			}
			if(this.request_info && this.request_info.configuration_items && this.request_info.configuration_items.length !== 0){
                this.request_info.configuration_items=this.request_info.configuration_items.filter(obj => obj.inactive !== true);
            }
        }
		/* setting the template id so that it will be used in making
		combined call for edit maintenance */
		if(this.isMaintenance){
			this.templateID= this.request_info.template.id;
		}
        /**
         * Getting a new copy of request info important,
         * because the entitydata is used to apply value for the field
         * */
        this.entitydata = JSON.parse(sdpToJSON(this.request_info));
    },
	/**
	 * fetches the allowed values of the fields available in the current template
	 */
	getAllowedValues: function(formPromise) {
		var self = this, promiseArr = [];
		// url split for MSP handling
		var base_url = "/servlet/SDAjaxServlet";	//No I18N
		var params = "?action=GetAllowedValues&module=INCIDENT&templateId=" + this.templateID+"&requiredFormat=array";	//No I18N
		if(isMSP) {
			base_url = "/servlet/MSPSDAjaxServlet";	//No I18N
			if(sdp_user.USERTYPE === "Technician") {
				var account_id = $req.mspform.getAccountID();
				params = params + "&WF_ACCOUNTID=" + account_id;	//No I18N
			}
		}
		var propPromise = sdpAjax({
			url: base_url + params,
			cache: false,
			success: function(data) {
				if(data && data.FIELDOBJECT) {
					self.allowed_values = data.FIELDOBJECT;
					self.processAllowedValues(data.FIELDOBJECT);
					//Set Site Allowed Values for Requester Login
					self.setSGTAllowedValues();
				} else {
					self.errorHandler(10004, true, data);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				self.errorHandler(10004, false, jqXHR, textStatus, errorThrown);
			}
		});
		promiseArr.push(propPromise);

		if(this.is_service_template) {
			var resPromise = sdpAjax({
				url: "/servlet/SDAjaxServlet?action=getResourceJson&templateId=" + this.templateID+"&requiredFormat=array",	//No I18N
				cache: false,
				success: function(data) {
					self.processAllowedValues(data);
				}
			});
			promiseArr.push(resPromise);
		}

		formPromise && (formPromise[0] = jQuery.when.apply(this, promiseArr));
	},


	/**
	 * Get status allowed values based on the conditions
	 * @param {object} field
	 * @param {FormInstance} form
	 * @param {event} event
	 * @param {Array} formPromise
	 * @returns {Promise}
	 */
	getStatuses: function(field, form, event, formPromise) {
		var setStatusAllowedValues = function(statuses) {
			$rf.allowedValues.status = statuses.map(function(status) {
				return {
					id: status.id,
					name: status.name
				};
			});
		};
		if( ( this.edit_mode && !this.templateChanged ) || !this.isRLCEnabled()) {
			if(this.statuses && this.statuses.length > 0) {
				setStatusAllowedValues(this.statuses);
			}
			//NOT NEEDED FOR Maintenance
			/** In edit mode, on field loading if the RLC is present, load the current status's mandatory fields */
			if(this.isRLCEnabled() && this.request_info && this.request_info.status && this.request_info.status.id) {
				this.setStatusMandatory( this.request_info.status.id );
			}
			return;
		}
		/**
		 * During the template change, both template have configured same template
		 * then we no need to change the status
		 */
		if(this.edit_mode && this.templateChanged && this.isRLCEnabled()){
			var requestInfoLifeCycleId = this.request_info.lifecycle && this.request_info.lifecycle.id;
			var templateLifeCycleID = this.template.lifecycle && this.template.lifecycle.id;
			if(requestInfoLifeCycleId && templateLifeCycleID && (templateLifeCycleID == requestInfoLifeCycleId) ){
				if(this.statuses && this.statuses.length > 0) {
					setStatusAllowedValues(this.statuses);
				}
				return;
			}
		}

		var url = "/api/v3/request_lifecycles/" + this.template.lifecycle.id + "/get_connected_nodes";	//No I18N
		var data = { input_data: sdpToJSON({ "node_entity_id": 0, "module": {name:"request"} }) };	//No I18N
		if($req.form.rlcPromise) {
			formPromise && (formPromise[0] = $req.form.rlcPromise);
			return;
		}
		var promise = sdpAjax({
			url: url,
			data: data,
			cache: false,
			success: function(data) {
				if(data && data.statuses) {
					setStatusAllowedValues(data.statuses);
					if($req.form.templateChanged && data.statuses && data.statuses[0] && data.statuses[0].id != $rf.fields.values.status) {
						/** sets back the value of the field after processing the alteration of the allowed values */
						$rf.protectedSet("status", data.statuses[0].id);
						$rf.setChangedInfo("status");	//No I18N
						$rf.fields.status.current_value = data.statuses[0];
						setTimeout(function() {
							showalert("info", getMessageForKey("request.template.change.conflict"), "isAutoHide=false, delay=5");	//No I18N
						}, 1000);
					}
					data.statuses && data.statuses[0] && $req.form.setStatusMandatory( data.statuses[0].id );
				} else {
					$req.form.errorHandler(10004, true, data);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$req.form.errorHandler(10004, false, jqXHR, textStatus, errorThrown);
			}
		}).always(function() {
			$req.form.rlcPromise = null;
		});
		formPromise && (formPromise[0] = $req.form.rlcPromise = jQuery.when(promise));
	},
	/**
	 * fetches the given status's mandatory fields and sets in the prop - this.status_mandatory[ status ]
	 */
	getStatusMandatory: function(status) {
		var url = this.edit_mode && this.woID && !this.templateChanged ? "/api/v3/requests/" + this.woID + "/_status_mandatory_fields" : "/api/v3/requests/_status_mandatory_fields";	//No I18N
		var data = { "status_id": status };	//No I18N
		(!this.edit_mode || this.templateChanged) && ( data.template_id = this.templateID );
		data = { input_data: sdpToJSON( data ) };
		return sdpAjax({
			url: url,
			type: "GET",	//No I18N
			data: data,	//No I18N
			cache: false,
			success: function(data) {
				if(data && data.status_mandatory_fields) {
					$req.form.status_mandatory[status] = data.status_mandatory_fields;
				} else {
					$req.form.errorHandler(10004, true, data);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$req.form.errorHandler(10004, false, jqXHR, textStatus, errorThrown);
				showalert('failure', getMessageForKey("sdp.dashboard.common.messages.outdatedpage"), 'isAutoHide=false, delay=5');	//No I18N
			}
		});
	},

	/**
	 * fetches the closing rules settings
	 */
	getClosingRules: function() {
	  	return sdpAjax({
			url: "/api/v3/request_closing_rules",	//No I18N
			type: "GET",	//No I18N
			cache: false,
			success: function(data) {
				if(data && data.request_closing_rules && data.request_closing_rules.length){
				var mandatory_fields = 	data.request_closing_rules[0].mandatory_fields;
					for (var i = 0; i < mandatory_fields.length; i++) {
						if(mandatory_fields[i].indexOf("udf_") !== -1){ // NO I18N
							mandatory_fields[i] = "udf_fields."+mandatory_fields[i]; // NO I18N
						}
						// fix for SD-102636
						if(mandatory_fields[i] === "priority" && !$req.form.ssp.priority_matrix_techoverride){ //NO I18N
							mandatory_fields.splice(i, 1);
							mandatory_fields.push("urgency"); //NO I18N
							mandatory_fields.push("impact"); //NO I18N
						}
					}
					data.request_closing_rules[0].mandatory_fields = mandatory_fields;
				}
				$req.form.closing_rules = data && data.request_closing_rules && data.request_closing_rules.length > 0 ? data.request_closing_rules[0] : {};
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$req.form.errorHandler(10004, false, jqXHR, textStatus, errorThrown);
				showalert('failure', getMessageForKey("sdp.dashboard.common.messages.outdatedpage"), 'isAutoHide=false, delay=5');	//No I18N
			}
		});
	},

	/**
	 * fetches the chat info of the given Chat ID
	 */
	getChatInfo: function(chatID) {
		var _self = this;
	  	return sdpAjax({
			url: "/api/v3/chats/" + chatID + "/transcript",	//No I18N
			cache: false,
			success: function(data) {
				if(data && data.response_status && data.response_status.status === "success") {
					_self.chat_info = data && data.chat ? data.chat : {};
				} else {
					_self.errorHandler(10004, true, data);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$req.form.errorHandler(10004, false, jqXHR, textStatus, errorThrown);
			}
		});
	},

	/**
	 * fetches the list of SLAs available in the current template
	 */
	fetchSLA: function() {
		//API based handling is done for fetching Service SLAs
		//SD-109078,109175 - SLAs not fetched properly in request form page
		var url = (this.edit_mode && this.templateID == this.request_info.template.id) ? "/api/v3/requests/" + this.woID + "/service_sla" : "/api/v3/requests/service_sla";	//No I18N
		if(this.isMaintenance){
        	url= "/api/v3/requests/service_sla"; //NO I18N
        }

		var	input_data = {
			"template" : {						//No I18N
				"id" : this.templateID			//No I18N
			},
			list_info: {
				row_count:99
			}
		}


		if($rf.fields.values.requester){
			var id = $rf.fields.values.requester.id ? $rf.fields.values.requester.id : $rf.fields.values.requester;
			var user={
                "id" : id //NO I18N
            }
            let isNewUser = $rf.fields.requester.current_value && $rf.fields.requester.current_value.isTag;
            !isNewUser && (input_data.user = user);
		}



		return jQuery.ajax({
			url: url,
			type: "GET",	//No I18N
			data: sdpAjaxInputData(input_data),
			cache: false,
			success: function(data) {
				var sla = data && data.service_sla ? data.service_sla : [];
				if(Array.isArray(data)){
					sla = data;
				}
				 $req.form.sla_options =sla;
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$req.form.errorHandler(10004, false, jqXHR, textStatus, errorThrown);
			}
		});
	},

	/**
	 * returns the default template ID based on the window.template_settings,
	 * when the template id is not available in the URL ( only in add form )
	 */
	getDefaultTemplateID: function() {
		var defaultTemplateId = "1";
		if(window.template_settings && window.template_settings.is_default_template_enabled && window.template_settings.default_template_id) {
			defaultTemplateId = window.template_settings.default_template_id;
		}
		return defaultTemplateId;
	},

	setStatusMandatory: function(status) {
		if(!status) {
			return;
		}
		var self = this;
		var mandateFields = function() {
			if (self.status_mandatory[ status ] && self.status_mandatory[ status ].fields.length > 0) {
				var mandatoryFields = self.status_mandatory[ status ].fields;
				/** mandating the fields based on the changed status */
				for(var i = 0, len = mandatoryFields.length; i < len; i++) {
					$rf.addMandatoryField(mandatoryFields[i], "status_change");	//No I18N
				}
			}
		};
		var setMandatory = function() {
			if($rf.editLoaded) {
				mandateFields();
			} else {
				jQuery("#form-container").on("editLoaded", function() {	//No I18N
					mandateFields();
				});
			}
		};
		if(self.status_mandatory[ status ]) {
			setMandatory();
		} else {
			this.getStatusMandatory(status).then(function() {
				setMandatory();
			}, function() {
				/** error handler */
			});
		}
	},

	isRLCEnabled: function() {
		/* For maintenance we allow all statuses as rlc will be applied in request creation anyway need to decide */
		if(this.isMaintenance){
			return false;
		}
		if(this.edit_mode && !this.templateChanged) {
			if(this.request_info && this.request_info.lifecycle) {
				return true;
			}
		} else {
			if(this.template && this.template.lifecycle) {
				return true;
			}
		}
		return false;
	},

    errorHandler: function(errorCode, isReqFailed, data, textStatus, errorThrown) {
        if (errorCode === 10001) {
            if (data && data.responseJSON && data.responseJSON.response_status && data.responseJSON.response_status.messages && data.responseJSON.response_status.messages.length) {
                window.showalert("failure", e_html(data.responseJSON.response_status.messages[0].message), "isAutoHide=true"); //No I18N
            }
			if($req.form.isMaintenance){
				$spa.navigate('/ui/maintenances?mode=list','maintenances','maintenances-list',true); //NO I18N
			}else{
            $spa.navigate("WOListView.do", "requests", "requests-list"); //No I18N
        }
        }
    },

	/**
	 * renders the header of the Request Form
	 */
	renderHeader: function() {
		var headerData = {};
		headerData.edit = this.edit_mode;
		headerData.fromRequestView = window.fromRequestView ? true : false;
		headerData.template = this.template;
		headerData.requestID = this.request_info && this.request_info.id ? this.request_info.id : null;
		headerData.usertype = window.sdp_user.USERTYPE;
		headerData.isAddIn = this.isAddIn;
		headerData.isFromZiaBot = this.isFromZiaBot;
		headerData.isFromIntegrationBot = this.isFromIntegrationBot;
		headerData.isMaintenance = this.isMaintenance;
		renderhbs('#rf-header', 'rf-header-template', headerData, false, 'requests/form', true, null, $req.form.bindEvents.templates.rf_header_template); //No I18N
		$req.common.setWarningHeader({element : 'reqFormWarning'},this.req_warning,this.metainfo.fields) //No I18N
	},

	/**
	 * renders service band - SLA options & Cost (chosen list)
	 */
	renderServiceBand: function(didUpdate) {
		var self = this;
		var userSelectionEnabled = self.ssp.sla_user_selection_enabled;
		var renderBand = function() {
			var costEnabled = self.isCostEnabled();
			var hasSLA = self.sla_options && self.sla_options.length > 0 && (self.ssp.show_sla_time|self.isMaintenance);
			if((userSelectionEnabled && hasSLA) || costEnabled) {
				var data = {};
				costEnabled && ( data.cost = self.cost );
				if(hasSLA) {
					data.sla = self.getSLAInfo();
					// #90925 update the SLA manually only when template is changed
					if(data.sla && data.sla.selected && self.templateChanged) {
						self.updateSLA(data.sla.selected.id);
					}
				}
				/**
				 * If one SLA is selected,in the request_info and selected diffrenent SLA
				 * Then the list is loaded, without those SLA.
				 * The sla will reset, however the following code is reset the SLA (for the safe checks)
				 */
				try {
					var currentSLA = (self.request_info && self.request_info.sla && self.request_info.sla.id) || "";
					var isSLAAvailable = false;
					var selectedID =  $req.form.sla.id || "";
					if(self.edit_mode && self.request_info && self.request_info.sla){
						selectedID = self.request_info.sla.id;
					}
					if ( data && data.sla && data.sla.options && data.sla.options.length) {
						for (var i = 0; i < data.sla.options.length; i++) {
							if (data.sla.options[i].sla_id === selectedID) {
								isSLAAvailable = true;
							}
						}
					}
					if (self.edit_mode && !isSLAAvailable) {
						self.updateSLA(currentSLA);
					}
				} catch (error) {
					/* eslint-disable no-console */
					console.error(error);
					/* eslint-enable no-console */
				}

				data.button_label = self.edit_mode ? window.getMessageForKey("sdp.requests.newrequest.update") : window.getMessageForKey("sdp.requests.newrequest.addrequest"); // NO I18N
				renderhbs('#rf-service-band', 'rf-service-band-template', data, false, 'requests/form', true, null, $req.form.bindEvents.templates.rf_service_band_template); //No I18N
				jQuery("#rf-service-band").slideDown(100, function() {	//No I18N
					/** binds the scroll event to stick the servic band at the window's top */
					self.initStickyServiceBand();
					/** renders the cost items list */
					costEnabled && renderhbs('#sc-cart-items-ul', 'rf-cost-item-list-template', self.cost, false, 'requests/form', null, null, $req.form.bindEvents.templates.rf_cost_item_list_template); //No I18N
					/** binds the click event on doc to close the sla list on clicking outside the options */
					if(hasSLA) {
						jQuery(document).on("click.close_slalist", function(e) {	//No I18N
							if( e.target.id !== "servicesla-selected" && e.target.parentNode.id !== "servicesla-selected" 	//No I18N
								&& e.target.parentNode.parentNode.id !== "servicesla-selected"){	//No I18N
								jQuery("#servicesla-options-list").slideUp(200);	//No I18N
							}
						});
					}
				});
			} else if(!hasSLA && !costEnabled){
				self.sla = null;
				jQuery("#rf-service-band").slideUp(); // NO I18N
			}
		};
		if(!this.did_fetch_sla && userSelectionEnabled) {
			this.fetchSLA().then(function() {
				self.did_fetch_sla = true;
				renderBand();
			})
			.fail(function(){
			    self.sla_options=[];
			    renderBand();
			});
		}
		else{
		    renderBand();
		}
	},

	/**
	 * renders the cost estimation details
	 */
	renderCostEstimation: function() {
		if( this.isCostEnabled() ) {
			this.setCostData();
			renderhbs('#cost-list-preview', 'rf-cost-estimation-template', this.cost, false, 'requests/form', null, null, $req.form.bindEvents.templates.rf_cost_estimation_template); //No I18N
		}
	},

	/**
	 * returns SLA list with computed delivery message and default option
	 */
	getSLAInfo: function() {
		if(!this.sla_options || this.sla_options.length === 0) {
			return null;
		}
		var self = this;
		var slaObj = {};
		var selected_sla = null;

		/** constructs SLA list by flattening the inner properties and sets the "selected" property */
		slaObj.options = this.sla_options.map(function(item) {
			var deliveryInfo = self.getSLADeliveryMessage(item);
			var obj = {
				id: item.id,
				sla_id: item.sla.id,
				name: item.sla.name,
				delivery_info: deliveryInfo,
				info: item.info || ""
			};
			if(self.edit_mode || window.duplicateRequest) {
				if ( self.request_info.service_sla && self.request_info.service_sla.id == item.id ) {
					selected_sla = obj;
					obj.selected = true;
					if(window.duplicateRequest) {
						self.sla = {
							id: self.request_info.service_sla.id
						};
					}
				}
				if(self.templateChanged && item.is_default_sla  ){
					selected_sla = obj;
					obj.selected = true;
				}
			} else {
				if ( item.is_default_sla ) {
					selected_sla = obj;
					obj.selected = true;
				}
			}
			return obj;
		});

		/** includes the default sla option to the list */
		var def_sla_option = {
			id: "0",	//No I18N
			sla_id: "0",	//No I18N
			name: getMessageForKey("sdp.change.sla.select"),	//No I18N
			delivery_info: "",	//No I18N
			selected: !selected_sla,
			info: ""	//No I18N
		};
		selected_sla = selected_sla || def_sla_option;
		slaObj.options.unshift(def_sla_option);
		slaObj.selected = selected_sla;
		return slaObj;
	},

	/**
	 * returns the SLA delivery message for the given SLA item based on the Days, Hours and Minutes
	 */
	getSLADeliveryMessage: function(slaItem) {
		var deliveryInfo = "";
		if (slaItem.sla.resolution_dueby_days != "0") {
			deliveryInfo += slaItem.sla.resolution_dueby_days + " " + getMessageForKey("common.day");	//No I18N
		}
		if (slaItem.sla.resolution_dueby_hours != "0") {
			deliveryInfo += slaItem.sla.resolution_dueby_hours + " " + getMessageForKey("common.hrs");	//No I18N
		}
		if (slaItem.sla.resolution_dueby_minutes != "0") {
			deliveryInfo += slaItem.sla.resolution_dueby_minutes + " " + getMessageForKey("common.mins");	//No I18N
		}
		if (slaItem.sla.ignore_operational_hours) {
			deliveryInfo +=" (" + getMessageForKey("common.exempt.operationalhours") + ")";	//No I18N
			count++;
		}
		return deliveryInfo;
	},

	/**
	 * unfurls the SLA options list
	 */
	showSLAList: function() {
		jQuery("#servicesla-options-list").slideDown(100);	//No I18N
	},

	/**
	 * on selecting the SLA from the list, this.sla details is updated
	 * when the SLA is changed in edit form, the reason dialog would be popped up
	 */
	selectSLA: function(id, event) {
		if(this.edit_mode) {
			var isSLAChanged = (!this.request_info.service_sla && id !== "0")	//No I18N
				|| (this.request_info.service_sla && id === "0")	//No I18N
					|| (this.request_info.service_sla && this.request_info.service_sla.id !== id);
			if(!this.isMaintenance&&isSLAChanged) {
				var dialogHTML = jQuery("#servicesla-changecomment-dialog").html();	// No I18N
				/** stores the selected SLA id to the hidden input's value temporarily, will be used only when the reason is provided */
				jQuery("#chosen-sla").val(id);
				 jQuery("#servicesla-changecomment-dialog").dialog({	//No I18N
					modal: true,
					closeOnEscape: true,
					title: getMessageForKey("srequest.sla.update.comments"),	//No I18N
					width: 420
				});
				event && event.stopPropagation();
				return;
			} else {
				this.sla && ( this.sla.comment = null );
				this.updateSLA(id);
			}
		} else {
			this.updateSLA(id);
		}
	},

	/**
	 * sets the SLA change comment and selected SLA
	 */
	updateSLAComment: function() {
		var id = jQuery("#chosen-sla").val();	//No I18N
		if(!id) {
			return;
		}
		!this.sla && ( this.sla = {} );
		this.sla.comment = jQuery("#sla-change-comment").val() || "";	//No I18N
		this.updateSLA(id);
		this.closeSLAComment();
	},

	/**
	 * closes the Service SLA reason dialog and resets the comment to empty in DOM
	 */
	closeSLAComment: function() {
		jQuery("#servicesla-changecomment-dialog").dialog("close");	//No I18N
		try {
			jQuery(".ui-dialog #servicesla-changecomment-dialog").closest(".ui-dialog").find(".ui-dialog-titlebar-close").trigger("click"); // NO I18N
		} catch (error) {}
		jQuery("#sla-change-comment").val("");	//No I18N
	},

	/**
	 * updates the selected SLA to "this.sla" object and updates the corresponding selection and delivery message in DOM
	 * and re-renders the SLA list
	 */
	updateSLA: function(id) {
		if(!this.sla_options || this.sla_options.length === 0) {
			return;
		}
		var slaObj = this.getSLAInfo();
		var chosenSLA;
		for(var i = 0, len = slaObj.options.length; i < len; i++) {
			if(slaObj.options[i].id == id) {
				slaObj.options[i].selected = true;
				chosenSLA = slaObj.options[i];
			} else {
				slaObj.options[i].selected = false;
			}
		}
		if(chosenSLA) {
			jQuery("#servicesla-selected").attr( "data-association-id", chosenSLA.id )	//No I18N
				.find(".servicesla_name").attr( "title", encodeHTMLAttribute( chosenSLA.name) ).text( chosenSLA.name );	//No I18N
			if(chosenSLA.delivery_info) {
				jQuery("#service_delivery_time").text( getMessageForKey("srequest.sla.deliverynote", [ chosenSLA.delivery_info ]) );	//No I18N
			} else {
				jQuery("#service_delivery_time").text( "" );	//No I18N
			}
			jQuery("#service_delivery_info").attr( "title", encodeHTMLAttribute(chosenSLA.info) ).text( chosenSLA.info );	//No I18N
			!this.sla && ( this.sla = {} );
			this.sla.id = id;
			// #90932 Update the form component fields object and values object manually everytime sla changes
			$rf.fields.service_sla = {id: this.sla.id};
			$rf.fields.sla_update_comments = this.sla.comment;
			$rf.fields.values.service_sla = $rf.fields.service_sla;
			$rf.fields.values.sla_update_comments = $rf.fields.sla_update_comments;
		}
		if(jQuery("#servicesla-options-list").length){
			renderhbs('#servicesla-options-list', 'rf-service-sla-list-template', slaObj, false, 'requests/form', true, null, $req.form.bindEvents.templates.rf_service_sla_list_template); //No I18N
		}
		// #90932 Adding the sla fields to changed values
		(!$rf.fields.changed.includes("service_sla")) && $rf.fields.changed.push("service_sla"); // No I18N
		(!$rf.fields.changed.includes("sla_update_comments")) && $rf.fields.changed.push("sla_update_comments"); // No I18N
	},

	/**
	 * renders the user information in the user details secion
	 * 1. User details, 2. Pending Requests info, 3. Asset population, 4. Site population
	 */
	renderUserInfo: function(field, form, event) {
		var _self = this;
		!field && ( field = $rf.fields.requester );
		if(!field) {
			return;
		}
		if(this.edit_mode && field.name === "requester" && this.request_info.on_behalf_of) {
			jQuery("#rf-requester-details").find(".user-info").addClass("hide");	//No I18N
		}
		var fname = field.name;
		var info_key = fname === "requester" ? "requester_info" : "obo_info";	//No I18N
		if(window.isMSPOrSCP && field.name === "account"){  // NO I18N
			/** In SCP, we need to fetch the user based on the choosen account  */
			info_key = "account";  // NO I18N
		}
		var userID = null, isNewUser = false;
		if(field.current_value) {
		    userID = field.current_value.id;
		    isNewUser = !!field.current_value.isTag;
		}
		if(!userID && fname === "requester") {
			userID = this.request_info && this.request_info.requester ? this.request_info.requester.id : null
		}
		if(window.isMSPOrSCP && event && event.type === "change" && field.name === "requester" && $rf.fields.account && field.current_value && field.current_value.id !== field.current_value.name){
			/** If the user manullay change the account field, we need to remove account field value */
			$rf.safeSetFieldValue("account",null); // No I18N
			jQuery("#accountIcon").addClass("hide"); // NO I18N
		}

		this[ info_key ] = null;
		//this.user_assets = null;

		if(fname === "on_behalf_of" || fname === "requester" && $rf.fields.approvers){
			_self.populateApproverFieldOptions(fname);
		}
		if(!userID || isNewUser) {
			this.updateUserInfo({}, field, form, event);
			if(sdp_user.USERTYPE === "Technician" || fname !== "requester" || !form.fields.on_behalf_of) {
				$se.requesterDetails = fname === "on_behalf_of" ? this.requester_info : {};	//No I18N
			}
			if( fname === "on_behalf_of" && event && window.sdp_app.IS_SITE_CONFIGURE){ //NO I18N
				var site = {
					id: "0",
					name : getMessageForKey("sdp.admin.technician.addtechnician.nosite") //No I18N
				};
				if(_self.template && _self.template.request && _self.template.request.site){
					site = _self.template.request.site;
				}else if(_self.requester_info && _self.requester_info.department && _self.requester_info.department.site){
					site = _self.requester_info.department.site;
				}

				//  SD-95698
				$req.form.setSGTAllowedValues();
				$rf.protectedSet("site", site.id); //NO I18N
				jQuery("p[data-name='site']").html(e_html(site.name));      //No I18N
				$rf.reformDependentFields("site", $rf.getDependentFields("site").fields); // NO I18N

			}
			return;
		}
		var userPromiseFns = [];
			if(window.isMSPOrSCP && fname === "account"){
				$req.mspform.renderInfoOnAccountChange();
				// for reloading user info on change of account
                userID = $rf.fields.values.requester && $rf.fields.values.requester.id ? $rf.fields.values.requester.id : $rf.fields.values.requester;
				info_key = "requester_info"; //No I18N
			}
			if(!window.isMSPOrSCP || userID){
				// this block is always executed for SDP
		        userPromiseFns.push( this.fetchUserInfo(userID, info_key) );
			}
        if (!window.isSCP) {
        	// this block is always executed for SDP
		if(sdp_user.USERTYPE === "Technician"&& !_self.isMaintenance ) {
			userPromiseFns.push( this.fetchUserRequests(userID, info_key) );
		}
		} else {
            $req.scpform.accountChange(info_key, userPromiseFns);
		}

			if($rf.fields.assets && !window.isSCP) {
			/** loading the assets in both add / edit form load as the associated assets will be used to segragate the user assets and other assets in asset dropdown */
			userPromiseFns.push( this.fetchUserAssets(userID, info_key) );
		}
		jQuery.when.apply(this, userPromiseFns)
		.then(function() {
			_self.updateUserInfo( $req.form[ info_key ], field, form, event );
		})
		.fail(function(e){
			/** In the OBO case, some of the API might fail due to the permission error, still we need to render the OBO details\ */
			_self.updateUserInfo( $req.form[ info_key ], field, form, event );
		});
	},

	/**
	 * fetch the given user's details and set the value to the appropriate key
	 * @param userID {String} - Selected Requester ID
	 * @param info_key {String} - API KeyName for get the properties
	 */
  fetchUserInfo: function (userID, info_key) {

		var _self = this;
		var url = "/api/v3/users/" + userID;	//No I18N
		info_key === "obo_info" && sdp_user.USERTYPE === "Requester" && ( url = "/api/v3/requests/on_behalf_of/" + userID );	//No I18N

		var input_data = null;	// var introduced for MSP/SCP
		if(window.isMSPOrSCP) {
      msp_params = $req.mspform.getParamsToFetchUserInfo(userID, info_key);
			if(msp_params.hasOwnProperty("info_key")) {
				info_key = msp_params.info_key;
			}
			if(msp_params.hasOwnProperty("url")) {
				url = msp_params.url;
			}
		}

		return sdpAjax({
			url: url,
			cache: false,
			async: isSCP ? false : true,
			data : window.isMSPOrSCP ? input_data && sdpAjaxInputData(input_data) : undefined,
			ignorefailuremessage:true,
			success: function(data) {
				if(window.isMSPOrSCP) {
					if(data && data.response_status && Array.isArray(data.response_status)){
						data.response_status = data.response_status[0];
					}
				}
				if(data && (!data.response_status || data.response_status.status === "success")) {
					var userInfo = data.user;
					if(window.isMSPOrSCP) {
						if(data.users && Array.isArray(data.users)){
							if(data.users.length){
								userInfo = data.users[0];
							}else{
								_self[ info_key ] = {};
							}
						}
					}
					if(_self[ info_key ]) {
						for(var key in userInfo) {
							_self[ info_key ][ key ] = userInfo[ key ];
						}
					} else {
						_self[ info_key ] = userInfo;
					}
					$se.requesterDetails = userInfo;
					$req.form.setSGTAllowedValues();
					if(sdp_user.USERTYPE == "Requester" && !(window.isMSP && $req.mspform.isAccountManager()) && !_self.edit_mode) {      //No I18N
						if((!userInfo.department || !userInfo.department.site) && (!$rf.template.request || !$rf.template.request.site)) {
							$rf.protectedSet("site", "0"); //NO I18N
							jQuery("p[data-name='site']").html(getMessageForKey("common.site.nosite"));      //No I18N
							  // SD-95698
							  $rf.reformDependentFields("site", $rf.getDependentFields("site").fields); // NO I18N
						}
					}
				} else {
					_self.errorHandler(10004, true, data);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				_self.errorHandler(10004, false, jqXHR, textStatus, errorThrown);
			}
		});
	},

	/**
	 * fetch the given user's pending requests list and set the value to the appropriate key
	 */
	fetchUserRequests: function(userID, info_key) {
		var _self = this;
		if (window.isSCP && userID && userID.id) {
			userID = userID.id;
		}
		var input_data = {
			list_info: {
				get_total_count: true,
				search_criteria: {
                    field : "requester.id", //No I18N
					value : userID,
					condition : 'eq' //No I18N
				},
				filter_by: {
					name: "All_Pending"	//No I18N
				}
			}
		};
		return sdpAjax({
			url: "/api/v3/requests",	//No I18N
			cache: false,
			ignorefailuremessage: true,
			data: sdpAjaxInputData(input_data),
			success: function(data) {
				if(data && data.response_status && data.response_status[0].status === "success") {	//No I18N
					if(_self[ info_key ]) {
						_self[ info_key ].req_count = data.list_info.total_count;
					} else {
						_self[ info_key ] = {
							req_count: data.list_info.total_count
						};
					}
				} else {
					_self.errorHandler(10004, true, data);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				_self.errorHandler(10004, false, jqXHR, textStatus, errorThrown);
			}
		});
	},

	/**
	 * fetch the given user's asset details and set the value to the appropriate key
	 */
	fetchUserAssets:  function(userID, info_key) {
		var _self = this;
		var input_data = {
			list_info: {
				search_criteria: [
					{"field": "user.id", "condition": "is", "value":userID,"logical_operator":"and"}	//No I18N
				]
			}
		};
		var options = {
			url: "/api/v3/requests/assets",	//No I18N
			data: sdpAjaxInputData({ list_info: { row_count: "100" } }),
			cache: false,
			success: function(data) {
				if(data && data.response_status && data.response_status.status === "success") {
					if(_self[ info_key ]) {
						_self[ info_key ].associated_assets = data.assets;
					} else {
						_self[ info_key ] = {
							associated_assets: data.assets
						};
					}
					/*_self.user_assets = data.associated_assets.map(function(asset) {
						return asset.asset.id;
					});*/
				} else {
					_self.errorHandler(10004, true, data);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				_self.errorHandler(10004, false, jqXHR, textStatus, errorThrown);
			}
		}
		/*
		When OBO user is selected we don't need to pass selectedAsset as it belongs to requester
		and the assets that we show will be for obo.
		*/
		if(window.selectedAsset  && selectedAsset !== "null" && info_key!="obo_info" ) {
			input_data.list_info.search_criteria.push({"field": "id", "condition": "is", "value":selectedAsset,"logical_operator":"and"}); //No I18N
					}
			options.data = sdpAjaxInputData(input_data);
		return sdpAjax(options);
	},

	/**
	 * selects the given user in the given field ( Requester | On behalf of )
	 * and updates the details section too
	 */
	selectUser: function(userInfo, field) {
		if(!userInfo || !userInfo.id || !field) {
			return;
		}
		if (window.isSCP) {
			$req.scpform.setAccountFieldOnUserSelect(userInfo);
		}
		$rf.setFieldValue(field, { id: userInfo.id, name: userInfo.name });
		$rf.validateField("requester"); //NO I18N
		this.updateUserInfo(userInfo, $rf.fields[ field ]);
		jQuery($rf.fields[field].element).trigger("change");
	},

	/**
	 * updates the user details, asset field, and site field
	 */
	updateUserInfo: function(userInfo, field, form, event) {
		if(window.isMSPOrSCP && !userInfo && field.name === "account" && event.type === "change"){ // NO I18N
			$req.mspform.populateAccountDetails(field, form, event);
			if (window.isSCP) {
				$req.scpform.reconstructProductField();
			}
		}
		if(!userInfo || (window.isMSPOrSCP && ('associated_assets' in userInfo) &&
			!Object.keys(userInfo).some(key => key !== 'associated_assets') && //No I18N
			(userInfo['associated_assets'].length === 0))) {
			return;
		}
        if (sdp_user.USERTYPE !== "Requester" || field.name !== "requester" || (window.isMSP && $req.mspform.isAccountManager()) || (window.isSCP && $req.scpform.isAccountManager())) {
			if(this.edit_mode && !field.current_value){
				userInfo = {};
			}
			this.populateUserDetails(userInfo, field, form, event);
		}

		if( !this.edit_mode || (event && event.type === "change") ) {
			/** setting the assets for the */
			this.populateAssetField(userInfo, field, form, event);

			/** setting site info */
			var t_site = this.template.request && this.template.request.site ?  this.template.request.site.id : "";	//No I18N
			var u_site = userInfo.department && userInfo.department.site ? userInfo.department.site.id : "";	//No I18N
			//SD-90816 check if requester chosen template has site already configured, if so don't update site unless it's same
			if(!(parent.sdp_user.USERTYPE == "Requester" && !!t_site && t_site != u_site)) {	//No I18N
				this.populateSiteField(userInfo, field, form, event);
			}
		}
		if(window.isMSPOrSCP) {
	        if (window.isMSP) {
	            $req.mspform.disable_setting_user_site = false;
	        }
			if(field.name === "requester" && $rf.fields.account){// NO I18N
				var account = $req.form.requester_info && $req.form.requester_info.account ? $req.form.requester_info.account  : null;

				if($req.form.requester_info  && $req.form.requester_info.hasOwnProperty('account')){
					$rf.setFieldValue("account", account); //No I18N
					const isAccountActive = !(account && account.inactive);
					jQuery("#rf-account [data-name='account-inactive']").toggleClass("hide", isAccountActive);  // NO I18N
					if(!account){
						$req.mspform.populateAccountDetails(field, form, event);
					}
				}
			}
		}

		var self = this;
		// This check cause error in change SLA with User group
		// Refer SD-91439
		// && $rf.fields.changed.indexOf("requester") !== -1

		if(window.isSCP){
			$req.scpform.reconstructProductField();
		}
		if($req.form.template.is_service_template && !this.isAddIn){
			self.did_fetch_sla = false;
			self.renderServiceBand();
		}
		if(window.isMSPOrSCP && field.name === "account"){ // NO I18N
			$req.mspform.populateAccountDetails(field, form, event);
		}
	},
	/**
	 * populates the given user details to the corresponding user section
	 */
	populateUserDetails: function(userInfo, field, form, event) {
		if(window.isMSPOrSCP && field.name === "account"){ // NO I18N
			return ;
		}
		var container = field && field.name !== "requester" ?  jQuery("#rf-on-behalf-of-details") : jQuery("#rf-requester-details");	//No I18N

		/**
		 * If SCP, we need to enable the user_details_div under account field and
		 * user_req_detail in requester Field;
		 */
		// Both userInfoContainer and userRequestContainer hold the same element for SDP. It is written separated for SCP purpose.
		var userInfoContainer =container;
		var userRequestContainer= container;


		if(window.isSCP){
			userRequestContainer = jQuery("#rf-requester-details"); // NO I18N
			userInfoContainer =  jQuery("#rf-account"); // NO I18N
		}

		if(jQuery.isEmptyObject(userInfo)) {
			userRequestContainer.find(".user_req_detail").addClass("hide");	//No I18N
			container.find("#user_details_div").addClass("hide");	//No I18N
        } else if ((sdp_user.USERTYPE == "Technician" || (window.isMSP && $req.mspform.isAccountManager()) || (window.isSCP && !$req.scpform.isAccountManager())) && !$req.form.isMaintenance) {  //No I18N
			var title_text;
			userRequestContainer.find(".user_req_detail").removeClass("hide");	//No I18N
			userInfoContainer.find("#user_details_div").removeClass("hide"); //No I18N

			if(userInfo.req_count > 0) {
				title_text = getMessageForKey("sdp.home.summary.openRequestsTitle") + "-" + encodeHTMLAttribute(userInfo.name);	//No I18N
				userRequestContainer.find('#rf-req_info_btn').text(userInfo.req_count + " " + getMessageForKey("sdp.home.summary.openRequestsTitle")).off('click').on('click', (event) => {
				    var url = "/ListRequests.do?id="+ userInfo.id + "&popUserDetails=true&mode=edit&filterBy=All_Pending";	//No I18N
                    NewWindow(url, 'ListRequests', '975', '620','yes','center', null, null, null, true);
                    return false;
				});
			} else {
				title_text = getMessageForKey("sdp.request.requester.showrequests");	//No I18N
				userRequestContainer.find('#rf-req_info_btn').text(getMessageForKey("sdp.request.requester.showrequests")).off('click').on('click', (event) => { //No I18N
                    var url = "/ListRequests.do?id="+ userInfo.id + "&popUserDetails=true&mode=edit";	//No I18N
                    NewWindow(url, 'showrequestsforuser', '900', '600','yes','center', null, null, null, true);
                    return false;
                });
			}
		}
		if(field.name === "on_behalf_of" || ( sdp_user.USERTYPE === "Technician" && !$rf.fields.values.on_behalf_of )) {
			if(userInfo && !jQuery.isEmptyObject(userInfo)) {
				userInfoContainer.find("#user_details_div").removeClass("hide");
			} else {
				userInfoContainer.find("#user_details_div").addClass("hide");
			}
		}
		userInfoContainer.find(".user-emailid").text(userInfo.email_id || "-");	//No I18N
		userInfoContainer.find(".user-phone").text(userInfo.phone || "-");	//No I18N
		if(!window.isSCP) {	// job title, department and site are not applicable for SCP
			// this block is always executed for SDP
		userInfoContainer.find(".user-jobtitle").text(userInfo.jobtitle || "-");	//No I18N
		userInfoContainer.find(".user-department").text(userInfo.department ? userInfo.department.name : "-");	//No I18N
		userInfoContainer.find(".user-site").text(userInfo.department && userInfo.department.site ? userInfo.department.site.name : "-");	//No I18N
		} else {
		// block executed only for SCP
			var subaccount = userInfo.subaccount && userInfo.subaccount.name || "-";
			userInfoContainer.find(".user-sub-account").text(subaccount);	//No I18N
			const isSubAccountActive = !(userInfo.subaccount && userInfo.subaccount.inactive);
			jQuery('[data-name="sub-account-inactive"]').toggleClass("hide", isSubAccountActive);  // NO I18N
		}
	},

	/**
	 * sets the site field automatically for the selected user.
	 * an alert will be shown to get confirmation from the user, whether to change the corresponding site value or not
	 */
	populateSiteField: function(userInfo, field, form, event) {
		/**
		* * Behaviour
		*  In Requestor Login
		*  Case 1: By default, the template site will be set, if the template does not have any site, then the requester site will be set
		*  Case 2: If the OBO selected and OBO have site, then OBO site will be set (if the template have site, then the template site will be set)
		*  Case 3: If the OBO selected and OBO doesn't have site, then will be empty (if the template have site, template will be set)
		*  Case 4:  If the OBO is removed, then the Template site will be set (if the template have any default site)
		*  Case 5:  If the OBO is removed, then the Requestor site will be set (if the template doesn't have any default site)
		*/
		if($rf.fields.site) {
			if(userInfo.department && userInfo.department.site) {
				if( (!$rf.fields.site.current_value || $rf.fields.site.current_value.id != userInfo.department.site.id)) {
					var set_user_site_alert_enabled = true;	// var introduced for MSP
						var siteData = {
							name : userInfo.department.site.name,
							id: userInfo.department.site.id+""
						}
						if(window.isMSP) {
							set_user_site_alert_enabled = $req.mspform.showAlertToSetUserSite(event, field, siteData)
						}
					if(!$rf.fields.site.current_value || (sdp_user.USERTYPE === "Requester" && !(window.isMSP && $req.mspform.isAccountManager()) && field.name === "requester")) {
						$rf.setFieldValue("site", siteData);	//No I18N
						$rf.validateField("site");	//No I18N
					} else {
						if(!window.isMSP || set_user_site_alert_enabled) {	// set_user_site_alert_enabled check is done only for MSP
							// this block is always executed for SDP
						if(sdp_user.USERTYPE === "Technician" && window.confirm(getMessageForKey("request.form.site.update.alert"))) {	//No I18N
							$rf.setFieldValue("site", siteData);	//No I18N
							$rf.validateField("site");	//No I18N
							} else if(window.isMSP && getAccountId() === "0") {
								// to check if the requester exists in the account of the site that is already selected.
								// if user with the selected name exists in the account of the selected site, then that user details are populated else set as like a new requester.
								// checking this only if all accounts is set in header, as only for across account we must check for the existence of the requester
								$req.mspform.checkRequesterExists();
							}
						}
					}
					if(sdp_user.USERTYPE == "Requester" && !(window.isMSP && $req.mspform.isAccountManager()) && siteData.name) {      //No I18N
						$rf.protectedSet("site", siteData.id); //NO I18N
						jQuery("p[data-name='site']").html(e_html(siteData.name));      //No I18N
						//  SD-95698
						$rf.reformDependentFields("site", $rf.getDependentFields("site").fields); // NO I18N
					}
				}
			} else if(event && event.type === "change") {
				if(sdp_user.USERTYPE === "Technician" && !this.isSitesRestricted()) {
					var siteData = {
						id: "0",
						name : getMessageForKey("sdp.admin.technician.addtechnician.nosite") //No I18N
					}
					if(this.template.request && this.template.request.site){
						siteData = this.template.request.site;
					}
					$rf.setFieldValue("site", siteData); //No I18N
					$rf.validateField("site");	//No I18N
				}
			}
			if(window.isMSP) {
				$req.mspform.disable_setting_user_site = false;
			}
		}
	},

	/**
	 * sets the asset field for the selected user - only if the user has only only one associated asset
	 */
	populateAssetField: function(userInfo, field, form, event) {
		if($rf.fields.assets) {
			$rf.reconstructField("assets");	//No I18N
			if(userInfo.associated_assets && userInfo.associated_assets.length === 1) {
				var associatedAssets = [];
				if(userInfo.associated_assets[0]) {
					associatedAssets.push({
						id: userInfo.associated_assets[0].id,
						name: userInfo.associated_assets[0].name
					});
				}
				$rf.setFieldValue("assets", associatedAssets);	//No I18N
				$rf.validateField("assets");	//No I18N
			} else if(event && event.type === "change") {
				$rf.unsetFieldValue("assets");	//No I18N
				$rf.validateField("assets");	//No I18N
			}
			//SD-102585 Requester's asset is maintained during the template change.Now if the OBO user has any no associated assets then the asset field values will be removed
			else if (!event && field.name === "on_behalf_of"){
				$rf.unsetFieldValue("assets");	//No I18N
				$rf.validateField("assets");	//No I18N
			}
		}
	},

	/**
	 * opens the Asset selection dialog in the new window
	 * the list will be filtered by the current selected site
	 */
	openAssetList: function() {
		var mode = "global";	//No I18N
		var user = $rf.fields.on_behalf_of ? ( $rf.fields.on_behalf_of.current_value || null ) : ( $rf.fields.requester.current_value || null );
		var userId = user ? user.id : null;
		var siteId = $rf.fields.site && $rf.fields.site.current_value ? $rf.fields.site.current_value.id : null;
		var assetElement = "selectedCIs";	//No I18N
		window.showCIsForAssociation(mode, userId, "", siteId, assetElement);	//No I18N
	},

	openAssetModuleList: function(){
		try{
			var self=this;
			var user = $rf.fields.on_behalf_of ? ( $rf.fields.on_behalf_of.current_value || null ) : ( $rf.fields.requester.current_value || null );
			var userId = user ? user.id : null;
			var siteId = $rf.fields.site && $rf.fields.site.current_value && $rf.fields.site.current_value.id!="0" ? $rf.fields.site.current_value.id : "-1";
			var siteName= translate('sdp.admin.technician.addtechnician.nosite');
			if(siteId!="-1" && siteId!=null && siteId!="0" ){
				siteName=$rf.fields.site.current_value.name;
			}
			assetsObj.fiter_requester_id=userId;
			assetsObj.fiter_department_id= $rf.fields.on_behalf_of? ($req.form.obo_info&&$req.form.obo_info.department? $req.form.obo_info.department.id:null) : (user&&user.department?user.department.id:null);
			assetsObj.filter_site_id=siteId;
			assetsObj.filter_site_name=siteName;

			//To load all site assets in MSP. Because MSP does not have assets without site.
            if(isMSP && (siteId == null || siteId == "-1" || siteId == "0")){
                assetsObj.filter_site_id= null;
                assetsObj.filter_site_name= null;
            }
		}
		catch(error){
		}
		assetsObj.loadAttachAssetPopup(self.isMaintenance?'request_maintenance':'request', 'attach_asset', 'asset');	//No I18N
	},
	/**
	 * opens the Email ID selection list in the new window
	 */
	openEmailIDList: function() {
		showUserSearchPopup("WorkOrder_EMailCC", true, "", "requests", "null", "requester");	//No I18N
	},

	/**
	 * opens the Editor selection dialog in the new window
	 */
	openEditorList: function() {
		showUserSearchPopup(
			"Intermediate_Editing", true,	// No I18N
			($rf.fields.editor.current_value ? $rf.fields.editor.current_value.name : ""), "requests", "null", "editor"	// No I18N
		);
	},

	isSitesRestricted: function() {
		return sdp_user.ROLES.indexOf("Restrict site access") > -1 && $req.sdp_user.ROLES.indexOf("ViewRequestsNotInAnySite") === -1;	//No I18N
	},

	/**
	 * sets the "Email Ids to notify" field with the  selected emails from the selection window
	 */
	addSelectedEmails: function(emails) {
		if(!emails) {
			return;
		}
		if(emails.constructor === String) {
			emails = emails.split(",");	//No I18N
		}
		var currentVal = $rf.fields.email_ids_to_notify.current_value;
		if(currentVal) {
			currentVal = currentVal.slice();
		} else {
			currentVal = [];
		}
		var selectedEmails = [];
		var emailExists = function(emailID) {
			return currentVal.some(function(item) {
				return item.id === emailID;
			});
		};
		for(var i = 0, len = emails.length; i < len; i++) {
			if( emailExists(emails[i]) ) {
				continue;
			}
			selectedEmails.push({
				id: emails[i],
				name: emails[i]
			});
		}
		$rf.setFieldValue("email_ids_to_notify", currentVal.concat(selectedEmails));	//No I18N
		jQuery('[name="email_ids_to_notify"]').trigger("change");       //No I18N
	},

	/**
	 * initializes the auto suggestions feature for the subject field
	 */
	initAutoSuggestions: function() {
		if(sdp_user.USERTYPE !== "Requester" || !this.ssp.suggest_enabled || this.is_service_template || this.isFromZiaBot) {
			return;
		}
		var element = null;
		$rf.fields.subject && $rf.fields.subject.element && ( element = $rf.fields.subject.element );
		if(!element) {
			element = document.getElementsByName("subject");
			if(element.length > 0) {
				element = element[0];
			} else {
				element = null;
			}
		}
		if(!element) {
			return;
		}

		/** renders the suggestions hidden container */
		renderhbs('#suggestions-container', 'rf-suggestions-template', {}, false, 'requests/form', true, null, $req.form.bindEvents.templates.rf_suggestions_template); //No I18N

		var suggListContainer = jQuery('#suggdropdownlist');	//No I18N
		var subjectEle = jQuery(element);

		/** hides the suggestions list on focusout event in Subject field */
		subjectEle.on("focusout", function() {	//No I18N
			setTimeout(function() {
				suggListContainer.hide();
			}, 400);
		});
		/** sets the default styles to the suggestion list container */
		window.requestAnimationFrame(function() {
			suggListContainer.css({
				"position": "absolute",	//No I18N
				"z-index": 99,	//No I18N
				"padding": 0,	//No I18N
				"top": subjectEle.offset().top + subjectEle.outerHeight() + "px",	//No I18N
				"left": subjectEle.offset().left,	//No I18N
				"width": element.offsetWidth	//No I18N
			});
		}, 1000);

		/** display suggestions on typing in the Subject field */
		jQuery(element).on("keyup", function(event) {	//No I18N
			suggest(event, this.name, this.form);
		});
	},

	/**
	 * handles the client side logic for Status change, such as -
	 * 1. Closing rules
	 * 2. Status change mandatory
	 * 3. Intermediate update ( when the change is pending from editor )
	 * 4. Invokes update form for - On Hold, Closed, Status change
	 */
	statusController: function(field, form, event) {
		var self = this, i, len;
		var fromStatus = event ? event.removed : form.fields.status.field_value;
		var toStatus = event ? event.added : form.fields.status.current_value;
		var statusType = $req.common.getStatusType(toStatus.id);

		var stopStatusChange = function(event) {
			if(event) {
				event.preventDefault();
				event.stopImmediatePropagation();
			}
			setTimeout(function() {
				self.safeSetStatusValue(fromStatus.id);
			},100);
		};

		/** when the request is raised for cancellation, the warning should be shown on moving to completed status */
		if(this.edit_mode && this.request_info && this.request_info.cancel_requested_is_pending && $req.common.isCompletedStatus(toStatus.id)) {
			if(!window.confirm(getMessageForKey("request.cancel.requested.status.change.warning"))) {
				stopStatusChange(event);
				return;
			}
		}

		/** When the editor editing is not completed, alert is shown if other Technician tries to change the status */
		if( this.edit_mode && this.request_info && this.request_info.is_editing_completed === false
			&& this.request_info.editor && this.request_info.editor.id != sdp_user.LOGGEDIN_USERID
			&& event && this.request_info.status.id !== event.val ) {
			if(!window.confirm(getMessageForKey("sdp.request.status.update.removeintermediate"))) {
				stopStatusChange(event);
				return;
			}
		}

		var promiseFn = [];

		/** fetching status mandatory rules for the given status */
		if(this.edit_mode && !this.templateChanged && !this.status_mandatory[toStatus.id] && !this.bulk_mode) {
			promiseFn.push( this.getStatusMandatory(toStatus.id) );
		}

		/** get closing rules if moving to the closed or resolved status */
		if($req.common.isCompletedStatus(toStatus.id) && jQuery.isEmptyObject( this.closing_rules )) {
			promiseFn.push( this.getClosingRules() )
		}

		jQuery.when.apply(this, promiseFn).then(function() {
			/** checks if the status can be changed to the selected value */
			if(!self.isStatusChangeAllowed(fromStatus.id, toStatus.id, statusType, event)) {
				/** TODO : show appropriate message */
				setTimeout(function() {
					self.safeSetStatusValue(fromStatus.id);
				});
				return;
			}

			/** removes the mandatory for the fields that are mandated by the previous status */
			$rf.removeMandatoryByRule("status_change");	//No I18N

			/** merge both status mandatory fields and closing rule mandatory fields */
			var mandatoryFields = [];
			if (self.status_mandatory[toStatus.id] && self.status_mandatory[toStatus.id].fields.length > 0) {
				mandatoryFields = self.status_mandatory[toStatus.id].fields;
			}
			if($req.common.isCompletedStatus(toStatus.id) && self.closing_rules.mandatory_fields && self.closing_rules.mandatory_fields.length > 0) {
				for(i = 0, len = self.closing_rules.mandatory_fields.length; i < len; i++) {
					if(mandatoryFields.indexOf(self.closing_rules.mandatory_fields[i] === -1)) {
						mandatoryFields.push(self.closing_rules.mandatory_fields[i]);
					}
				}
			}
			//SD-93435
			if(!self.bulk_mode){
				/** mandating the fields based on the changed status */
				for(i = 0, len = mandatoryFields.length; i < len; i++) {
					$rf.addMandatoryField(mandatoryFields[i], "status_change");	//No I18N
				}
			}

			/** resets all the status change forms */
			$req.common.resetStatusCommentForm();
			$req.common.resetOnHoldForm();
			$req.common.resetCloseForm();

			if(self.edit_mode && !self.bulk_mode && toStatus.id === self.request_info.status.id) {
				return;
			}

			// This is a edge case, when user remove the status while adding will change the status
			setTimeout(function(){
				var status = $rf.getFieldValue("status"); //NO I18N
				// If the selected status is removed by using FAFR ( 😬 worst case)
				//SD-112677 : Status Changed in Bulk-Edit "leave it as it is" should be ignored.
				if($rf.fields.status.allowedIds.indexOf(status) === -1 && status != -1 && !self.bulk_mode){
					//need to revert the status into open;
					status = $rf.fields.status.allowedValues.length ? $rf.fields.status.allowedValues[0] : $req.form.getOpenStatus();
					$rf.fields.status.current_value = {
						id: status.id,
						name: status.name
					};
					$rf.setFieldValue("status", {id:status.id, name: status.name}); // NO I18N
					// need to close any status related dialog that might open
					// remove close form dialog
					try {
						jQuery("#close-form").dialog("close"); //NO I18N
					} catch (error) {}
					// onhold form dialog
					try {
						jQuery("#onhold-form").dialog("close"); //NO I18N
					} catch (error) {}
					// status comment form
					try {
						jQuery("#statuscomment-form").dialog("close"); //NO I18N
					} catch (error) {}
				}
			},200);

			switch(statusType) {
				case "Resolved":	//No I18N
					if(!self.closing_rules.is_auto_close_enabled) {
						break;
					}
				case "Closed":	//No I18N
				   var showClosurePopUpForResolvedStatus = self.closing_rules.is_auto_close_enabled &&  $req.common.operational_data.resolved_status_id == toStatus.id;
				   if(self.closing_rules.is_close_comment_mandatory && ($req.common.operational_data.close_status_id == toStatus.id || showClosurePopUpForResolvedStatus ) ){
				   	 /** prompts the closure form dialog */
				  	 $req.common.promptCloseForm(fromStatus.id, toStatus.id, showClosurePopUpForResolvedStatus);
				   }
					return;
				case "Onhold":	//No I18N
				    if(isMSPOrSCP && !isOnholdScheduleMandatory) {
                        // if in SSP On Hold Scheduler is not enabled, do not show the On-Hold form dialog
                        break;
                    }
					/** prompts the On-Hold form dialog */
					$req.common.promptOnHoldForm(fromStatus.id, toStatus.id);
					return;
			}

			if(self.edit_mode && self.ssp.status_change_comment) {
				$req.common.promptStatusCommentForm(fromStatus.id, toStatus.id);
			}
			if(mandatoryFields.indexOf("note_comments") !== -1){
				self.rlc_notes = true;
				$req.common.promptRLCNotes();
			}

		});
	},

	/**
	 * reverts the status field to the default value
	 */
	revertStatus: function() {
		var statusId;
		if(this.edit_mode) {
			if(this.bulk_mode) {
				statusId ={
					id:"-1",	//NO I18N
		 			name: getMessageForKey('sdp.request.bulk.nochange') // NO I18N
				};
			} else {
				statusId = this.request_info.status.id;
			}
		} else {
			statusId = $rf.default_values && $rf.default_values.status && $rf.default_values.status.id ? $rf.default_values.status.id : "1";
		}
		$rf.setFieldValue("status", statusId);	//No I18N
	},

	/**
	 * sets the value of the Status field without invoking the bound callbacks in DataBinder
	 */
	safeSetStatusValue: function(value) {
		$rf.safeSetFieldValue("status", value);	//No I18N
	},

	/**
	 * returns if the selected status value is allowed or not
	 */
	isStatusChangeAllowed: function(fromId, toId, statusType, event) {
		var mandatoryRule = this.status_mandatory[toId];
		if(mandatoryRule) {
			if(mandatoryRule.depends_on_requests && mandatoryRule.depends_on_requests.length > 0) {
				this.statusChangeFailureHandler("dependency", event);	//No I18N
				return false;
			} else if(mandatoryRule.tasks && mandatoryRule.tasks.length > 0) {
				this.statusChangeFailureHandler("tasks", event);	//No I18N
				return false;
			} else if(mandatoryRule.to_be_filled && mandatoryRule.to_be_filled.indexOf("worklog") > -1) {	//No I18N
				this.statusChangeFailureHandler("worklogs", event);	//No I18N
				return false;
			} else if(mandatoryRule.checklists && mandatoryRule.checklists.length > 0) {
				this.statusChangeFailureHandler("checklists", event);	//No I18N
				return false;
			}
		}
		return true;
	},

	/**
	 * prompts the appropriate alert message when the status change is restricted due to the pending action
	 */
	statusChangeFailureHandler: function(failedEntity, event) {
		/** preventing FAFR from executing the status change rules */
		if(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}

		var alert_key;
		if(failedEntity === "tasks") {
			alert_key = getMessageForKey("request.tasks.notcompleted");	//No I18N
		} else if(failedEntity === "dependency") {	//No I18N
			alert_key = getMessageForKey("request.dependency.notclosed");	//No I18N
		} else  if(failedEntity === "worklogs") {	//No I18N
			alert_key = getMessageForKey("request.worklogs.notfound");	//No I18N
		} else if(failedEntity === "checklists") {	//No I18N
			alert_key = getMessageForKey("pending.checklists.checkliststab");	//No I18N
		}
		alert_key && window.showalert("warning", alert_key, "isAutoHide=true, delay=10");	//No I18N
	},

	/**
	 * return if any of the given fields is empty
	 */
	isAnyFieldEmpty: function(fields) {
		if(!fields || fields.length === 0) {
			return false;
		}
		for(var i = 0, len = fields.length; i < len; i++) {
			if($rf.isFieldEmpty(fields[i])) {
				return true;
			}
		}
		return false;
	},

	/**
	 * peforms UI changes to the Asset field before the field is initiated
	 */
	preAssetField: function(field, form, event, formPromise) {
		if(field) {
			field.classes = "";	//No I18N
			if(field.container) {
				field.container.find(".spot-form input.form-control").css({"height": "30px"});	//No I18N
			}
		}
	},
	postAssetField: function(field, form, event, formPromise) {
		var ele = jQuery(field.element);
		ele.on("select2-opening", function() {	//No I18N
			if(($req.form.ssp.can_requester_view_own_asset_only === false||sdp_user.USERTYPE === "Technician") &&
				($rf.fields.values.requester ||$rf.fields.values.obo)){
				var dropdown = ele.select2("dropdown");	//No I18N
				dropdown.find("#toggle1").remove();	//No I18N
				var checked = $req.form.fullAsset ? 'checked':''; // NO I18N
				dropdown.prepend('<div id="toggle1" class="p5" data-action-name="req-show-all-asset"> <label class="ptr-ev-none" ><input class="mt10" '+checked+' name="showallassets" value="yes" type="checkbox"/>'+getMessageForKey('sdp.common.assets.showall')+ '</label></div>'); //NO I18N
				jQuery("#toggle1[data-action-name=req-show-all-asset]").off('click').on('click', (event) => { //No I18N
				    $req.form.toggleAssetList(event.currentTarget);
				});
			}
		});
		if (field.container) {
			field.container.find(".control-holder").addClass("mti-select pos-rel");	//No I18N
		}
	},
	toggleAssetList: function(e){
		event.stopPropagation();
			var $el  = jQuery("#toggle1");
			var fullAsset = !$req.form.fullAsset;
			$req.form.fullAsset = fullAsset;
			$el.find("input[type='checkbox']").prop("checked",fullAsset ); //NO I18N
			$el.find("input[type='checkbox']").attr("checked",fullAsset ); //NO I18N
			var selectedVal = jQuery($rf.fields.assets.element).select2("data"); //No I18N
			jQuery($rf.fields.assets.element).select2("destroy"); //No I18N
			$rf.setEditMode("assets", undefined, undefined, true); //NO I18N
			setTimeout(function(){
				jQuery($rf.fields.assets.element).select2("data", selectedVal); //No I18N
				jQuery($rf.fields.assets.element).select2("close"); //NO I18N
				jQuery($rf.fields.assets.element).select2("open"); //NO I18N
			},100);
	},

	/**
	 * renders form help content in the right panel
	 */
	renderFormHelpContent: function() {
		var helpText = sdp_user.USERTYPE === "Technician" ? this.template.technician_help_text : this.help_text;	//No I18N
		if(helpText) {
			jQuery("#form-help-content").removeClass("hide").addClass("disp-c");	//No I18N
			renderhbs('#form-help-content', 'rf-form-help-content-template', { content: helpText }, false, 'requests/form'); //No I18N
		}
	},

	/**
	 * displays the template selection list and inits it.
	 */
	showTemplateList: function() {
		if(window.duplicateRequest) {
			return;
		}
		jQuery("#rf-template-list-section").removeClass("hide");	//No I18N
		this.initTemplateList(this.is_service_template ? "service" : "incident");	//No I18N

		/** disabling the template dropdown if the service request is already approved or in completed status */
		if(this.edit_mode && this.is_service_template && this.request_info &&
			((this.request_info.approval_status && this.request_info.approval_status.name === "Approved")	//No I18N
				|| $req.common.isCompletedStatus(this.request_info.status.id, true))) {
			var incidentList = jQuery("#rf-template-incident-list");	//No I18N
			var serviceList = jQuery("#rf-template-service-list");	//No I18N
			incidentList.data("select2") && incidentList.select2("disable");	//No I18N
			serviceList.data("select2") && serviceList.select2("disable");	//No I18N
		}
		try{
		if(this.fromSpace || $req.form.fromCMDB){
			jQuery("#rf-template-incident-list").select2("disable");	//No I18N
			jQuery("#rf-template-service-list").select2("disable");	//No I18N
		}
		}
		catch(e){
		}
	},

	/**
	 * initializes the Template list
	 * Two list is rendered - Service Templates and Incident Templates
	 * but only one will be visible at a time based on the current selection
	 */
	initTemplateList: function(type) {
		var _self = this;
		$req.common.initTemplateList(type,"woForm");//No I18N
		var listEle = (type === "service") ? jQuery("#rf-template-service-list") : jQuery("#rf-template-incident-list"); //No I18N
		if((this.is_service_template && type === "service") || (!this.is_service_template && type === "incident")) { //No I18N

			listEle.select2("data", {	//No I18N
				id: _self.template.id,
				text: _self.template.name
			});
		}
		/** binds the form template change handler on selecting the template form the list */
		listEle.on("change", function(event) {	//No I18N
			if(event.added && event.added.id === _self.template.id) {
				return;
			}
			_self.changeTemplateConfirm(event.added.id);
		});
	},

	/**
	 * resets the template to the default
	 */
	resetTemplate: function() {
		sdp_app.IS_SERVICECATALOG_ENABLED && $req.common.switchTemplateTab( this.is_service_template ? "service" : "incident", true, "woForm" );	//No I18N
		jQuery("#rf-template-" + (this.is_service_template ? "service" : "incident") + "-list").select2("data", { id: this.template.id, text: this.template.name });	//No I18N
	},

	/**
	 * prompts the template change confirmation dialog
	 * and invokes the corresponding method based on the action
	 */
	changeTemplateConfirm: function(templateID) {
		var _self = this;
		if(this.isAddIn) {
			if(_self.edit_mode) {
				/** copies the "this.request_info" data to "this.entitydata" (resets it) */
				_self.entitydata = JSON.parse(sdpToJSON( _self.request_info ));
			}
			this.changeTemplate(templateID);
			return;
		}
		var alertMessage = this.edit_mode ? getMessageForKey("sdp.edit.request.templatechange.help.msg.updated") : getMessageForKey("request.form.templatechange.dataloss.alert");	//No I18N
			alertMessage = alertMessage.replace(/,/g,"&#x2c;");
		showconfirm(true,
			"title=" + getMessageForKey("sdp.edit.request.templatechange.help") + "," +	//No I18N
			"message=" + alertMessage + "," +	//No I18N
			"submitbutton=" + getMessageForKey("common.proceed") + "," +	//No I18N
			"cancelbutton=" + getMessageForKey("common.no") + "," +	//No I18N
			"closebutton=yes," +	//No I18N
			"closeOnEscKey=yes", function(didConfirm) {	//No I18N
				if(didConfirm) {
					if(_self.edit_mode) {
						/** copies the "this.request_info" data to "this.entitydata" (resets it) */
						_self.entitydata = JSON.parse(sdpToJSON( _self.request_info ));
					}
					_self.changeTemplate(templateID);
				} else {
					_self.resetTemplate();
				}
			}
		);
	},

	/**
	 * changes the template the current form
 	 * sets the values of the fields to be retained and destory the form before initializing the form with the selected template
	 */
	changeTemplate: function(templateID, changedBy) {

		/** Show the loader */
        jQuery(".page-progressbar").show(); //No I18N
		/** Take the reference of request info*/
		this.request_info_ref = jQuery.extend(true, {} ,this.request_info);
		
		/** retaining the selected Requester on changing the Template */
		!this.retain_fields && ( this.retain_fields = {} );
		if(!this.edit_mode) {
			if (!window.isMSP || !$req.mspform.accountChangeEvent || !$req.mspform.retain_fields) {
			if($rf.fields.requester.current_value) {
				this.retain_fields.requester = {
					id: $rf.fields.requester.current_value.id,
					name: $rf.fields.requester.current_value.name
				};
			}
			}
			if($rf.fields.on_behalf_of && $rf.fields.on_behalf_of.current_value) {
				this.retain_fields.on_behalf_of = {
					id: $rf.fields.on_behalf_of.current_value.id,
					name: $rf.fields.on_behalf_of.current_value.name
				};
			}
		}
		
		//Deleting resource related values from reference object
		if(this.edit_mode && this.request_info.is_service_request && this.resource_fields.length > 0){
			for(var i = 0; i < this.resource_fields.length; i++) {
				var toDelete = this.resource_fields[i].substring(11); //To get the field name
				delete this.request_info_ref['udf_fields'][toDelete];
			}
		}
		
		this.destroyForm(true);
		if( this.edit_mode ) {
			if(templateID == this.request_info.template.id) {
				this.templateChanged = false;
			} else {
				this.templateChanged = true;
                if (window.isMSP && $req.mspform.accountChangeEvent && $req.mspform.retain_fields && $req.mspform.retain_fields.previous_template == templateID) {
                    //when the current template and the template from entity data are different but the current template and previous template are same - accountChangeEvent
                    $req.mspform.mspTemplateChanged = true;
					this.templateChanged = false;
				}
			}
		}
		// destory the description and resolution references
		this.request_description = null;
		this.request_resoltion = null;
		//safty check to ensure the editor ref
		this.ensureEditorRef();
		this.ref.description.template = null;
		this.ref.resolution.template = null;
		this.templateID = templateID;
		var promisefns = [
			this.fetchCombinedData(true)
		];
		this.promise_data = jQuery.when.apply(this, promisefns);
		this.initRendering();

		/** for add new form, url is replaced with the selected template's id */
		if(!this.edit_mode && !minpreview) {
			var url = this.isAddIn ? "/WorkOrder.do?woMode=newWO&service=OutlookAddIn&reqTemplate=" : "/WorkOrder.do?woMode=newWO&reqTemplate=";	//No I18N
			const externalFrameUrl = (window.externalframe) ? "&externalframe=true" : ""; //NO I18N
			if(this.isMaintenance){
				url="/ui/maintenances?mode=add&reqTemplate="; //NO I18N
			}
			window.history.replaceState({templateID: parseInt(this.templateID, 10)}, "", url + parseInt(this.templateID, 10) + externalFrameUrl);	//No I18N
		}
	},

	/**
	 * destorys the form and resets the form options
	 * also unbinds the event bound and removes the header service band from DOM
	 */
	destroyForm: function(templateChanged, emptyDOM) {
		if(typeof $rf !== "undefined" && $rf instanceof FC && !$rf.is_destroyed) {
			$rf.destroy(emptyDOM);
			delete window.$rf;
		}
		this.resetOptions(templateChanged);
		let retainProps = false;
		if(templateChanged) {
			retainProps = true;
		}
		$req.common.resetProps(retainProps);
		$req.common.resetFAFRProps();
		jQuery(document).off("click.close_slalist");	//No I18N
		jQuery(window).off("scroll.rf_sticky_header");	//No I18N
		jQuery("#rf-service-band").hide().children().remove();	//No I18N
		window.$se = new se.req();
		//SD-123387 : Destroying custom forms by removing the status change form dialog.
        jQuery("#statuscomment-form").remove();
        jQuery("#onhold-form").remove();
        jQuery("#close-form").remove();
		if(isMSP) {
			$req.mspform.destroyForm();
		}
	},

	/**
	 * constructs and returns the required layouts of the form
	 */
	constructTemplateInfo: function() {
		var template = JSON.parse(sdpToJSON(this.template));
		var layouts = template.layouts;

		/** set extra fields to the property */
		var extrasection = $req.common.getExtraFields();
		/** removing the other usertype's layout form the template */
		for(var i = 0; i < layouts.length; i++) {
			if(sdp_user.USERTYPE === "Technician") {
				if(layouts[i].name === "requester_layout") {
					layouts.splice(i, 1);
					i--;
					continue;
				} else if(layouts[i].name === "technician_layout") {	//No I18N
					layouts[i].name = "properties_layout";	//No I18N
					if(!this.bulk_mode) {
						layouts[i].sections.push(extrasection);
					}
				}
			} else {
				if(layouts[i].name === "technician_layout") {
					layouts.splice(i, 1);
					i--;
					continue;
				} else if(layouts[i].name === "requester_layout") {
					layouts[i].name = "properties_layout";	//No I18N
					if(!this.bulk_mode) {
						layouts[i].sections.push(extrasection);
					}
				}
			}

			/** modify the properties section configs */
			if(layouts[i].name === "properties_layout" && layouts[i].sections[0] && !this.bulk_mode) {
				layouts[i].sections[0].custom_section = true;
				layouts[i].sections[0].has_fields = true;
				layouts[i].sections[0].partial = "rf-requester-info-template";	//No I18N
                if (sdp_user.USERTYPE === "Requester" && !((window.isMSP && $req.mspform.isAccountManager()) || (window.isSCP && $req.scpform.isAccountManager())) && layouts[i].sections[0].fields && layouts[i].sections[0].fields.length > 0) {
					layouts[i].sections[0].fields[0].disabled = true;
					layouts[i].sections[0].fields[0].notenable = true;
				}

				if(window.isSCP) {
					$req.scpform.modifyTemplateLayoutForProperties(layouts[i]);
				}

				var is_obo_configured = this.edit_mode && this.request_info && this.request_info.on_behalf_of ? true : false;
				if(sdp_user.USERTYPE === "Requester" || is_obo_configured) {
					if(layouts[i].sections[0].fields && (this.ssp.on_behalf_of_user_field || is_obo_configured)) {
						var obo_pos = layouts[i].sections[0].fields.length > 0 ? 1 : 0;
						layouts[i].sections[0].fields.splice(obo_pos, 0, {
							name: "on_behalf_of",	//No I18N
							requester_can_edit: true,
							requester_can_view: true,
							edit: true,
							position: { col: 1, col_size: 1, row: 3, row_size: 1 },
							fafr_key: "REQUESTER.OBO"	//No I18N
						});
						layouts[i].sections[0].fields[ obo_pos ].disabled = sdp_user.USERTYPE !== "Requester";	//No I18N
					}
				}
			}

			if(layouts[i].name === "resource_layout") {
				/** setting custom properties in the resources layout */
				if(layouts[i].sections && layouts[i].sections.length > 0) {
					this.has_resource = true;
					layouts[i].id = "resource-container";	//No I18N
					layouts[i].widget = true;
					layouts[i].title = getMessageForKey("common.resources");	//No I18N
					layouts[i].view_type = this.isAddIn ? "2" : layouts[i].resource_view;	//No I18N
					layouts[i].custom_class = "addresource";	//No I18N
					if(this.isAddIn) {
						for(var m = 0; m < layouts[i].sections.length; m++) {
							layouts[i].sections[m].position.col = "1";	//No I18N
							layouts[i].sections[m].position.row = (m + 1).toString();
							for(var n = 0; n < layouts[i].sections[m].fields.length; n++) {
								layouts[i].sections[m].fields[n].position.col = "1";	//No I18N
								layouts[i].sections[m].fields[n].position.row = (n + 1).toString();
							}
						}
					}
				}
			}

			if(layouts[i].name === "properties_layout" || layouts[i].name === "resource_layout") {
				/** iterates and modifies the fields' template configs as required */
				for(var j = 0, jLen = layouts[i].sections.length; j < jLen; j++) {
					if(layouts[i].sections[j].fields) {
						for(var k = 0, kLen = layouts[i].sections[j].fields.length; k < kLen; k++) {
							if(this.modifyFieldConfig(layouts[i].sections[j].fields[k], layouts[i].sections[j]) === false) {
								layouts[i].sections[j].fields.splice(k, 1);
								k--;
								kLen--;
							}
							if(this.isAddIn) {
								layouts[i].sections[j].fields[k].style_properties = {};
								layouts[i].sections[j].fields[k].position.col = "1";	//No I18N
								layouts[i].sections[j].fields[k].position.row = (k + 1).toString();
							}
						}
					}
					if(this.isAddIn) {
						layouts[i].sections[j].style_properties = {};
						layouts[i].sections[j].column_count = "1";	//No I18N
					}
				}
			}
			if(this.isAddIn) {
				template.style_properties = {"field_style": {"field_align" : "top"}};	//No I18N
			}
		}

		/** adding Resources cost estimation layout */
		if(this.is_service_template && this.isCostEnabled() && !this.isAddIn) {
			layouts.push({
				custom_layout: true,
				html_container: true,
				container_id: "cost-list-preview"	//No I18N
			});
		}

		/** adding Attachments layout */
		var attachLayout = {};
		attachLayout.title = window.getMessageForKey("sdp.common.attachments");	//No I18N
		attachLayout.sections = [{
			type: "attachments",	//No I18N
			id: "attachments",	//No I18N
			container_id: "request-attachment",	//No I18N
			options: {
				api: false,
				upload_api : true,
				upload :  true,
				enable_delete : true,
				is_odapi: true,
				entity: "requests",	//No I18N
				skipPreview: this.isAddIn
			},
			fafr_key: "ATTACHMENT",	//No I18N
			title: window.getMessageForKey("sdp.common.attachments"),	//No I18N
			value_path: "attachments"	/** property in entity data from which the data should be fetched */	//No I18N
		}];
		if(this.isMaintenance){
			attachLayout.sections[0].options.entity="request_maintenances";
		}
		if(!this.bulk_mode) {
			layouts.push(attachLayout);
		}

		/** adding Tasks layout */
		if(template.task_templates && template.task_templates.length > 0) {
			layouts.push({
				custom_layout: true,
				partial: "rf-tasks-template"	//No I18N
			});
		}

		/** adding resolution the Resolution layout */
		if((sdp_user.USERTYPE === "Technician" && sdp_user.ROLES.indexOf("ModifyResolution") > -1 && !this.bulk_mode) || this.isMaintenance ) {
			var resolLayout = {};
			resolLayout.sections = [{
				custom_section: true,
				partial: "rf-resolution-template",	//No I18N
				has_fields: true,
				name: "-1",	//No I18N
				collapsed_state: "expanded",	//No I18N
				column_count: "1",	//No I18N
				field_align: "left-right",	//No I18N
				fields: [{
					name: "content",	//No I18N
					context: "resolution",	//No I18N
					edit: true,
					title: getMessageForKey("common.resolution"),	//No I18N
					position: {col: "1", col_size: "2", row: "1", row_size: "1"},	//No I18N
					images_api: true,
					showAsVideo: true,
					images_url: $req.form.isMaintenance?"/api/v3/request_maintenances/"+(this.edit_mode?this.woID+"/":"")+"images": this.edit_mode? "api/v3/requests/"+this.woID+"/images":"/api/v3/requests/images",	//No I18N
					/**
					 * SD - 118354 -> String trim overwrite issue fix
					 */
					enableNativeTrim : true
				}]
			}];
			resolLayout.has_fields = true;
			layouts.push(resolLayout);
		}

		/* For maintenance we dont need closeform,onholdform,status change form,reason field  */
		if(!this.isMaintenance){
		/** close form layout */
		var closeFormLayout = {
			has_fields: true,
			dialog: true,
			dialog_id: "close-form",	//No I18N
			name: "close-form-layout",	//No I18N
			column_count: "1",	//No I18N
			wrapper: false,
			sections: [{
				name: "-1",	//No I18N
				collapsed_state: "expanded",	//No I18N
				column_count: "1",	//No I18N
				field_align: "left-right",	//No I18N
				ondemand: true,
				fields: [{
					name: "is_fcr",	//No I18N
					requester_can_edit: false,
					requester_can_view: false,
					position: { col: "1", col_size: "1", row: "1", row_size: "1" },	//No I18N
					title: getMessageForKey("sdp.requests.viewrequest.fcr"),	//No I18N
					mandatory: false
				}, {
					name: "requester_ack_resolution",	//No I18N
					context: "closure_info",	//No I18N
					requester_can_edit: false,
					requester_can_view: false,
					position: { col: "1", col_size: "1", row: "2", row_size: "1" },	//No I18N
					title: getMessageForKey("sdp.requests.close.accepted"),	//No I18N
					mandatory: false
				}, {
					name: "requester_ack_comments",	//No I18N
					context: "closure_info",	//No I18N
					requester_can_edit: false,
					requester_can_view: false,
					display_type: "Multi Line",	//No I18N
					position: { col: "1", col_size: "1", row: "3", row_size: "1" },	//No I18N
					title: getMessageForKey("sdp.common.comments"),	//No I18N
					mandatory: false
				}, {
					name: "closure_code",	//No I18N
					context: "closure_info",	//No I18N
					requester_can_edit: false,
					requester_can_view: false,
					position: { col: "1", col_size: "1", row: "4", row_size: "1" },	//No I18N
					mandatory: false
				}, {
					name: "closure_comments",	//No I18N
					context: "closure_info",	//No I18N
					requester_can_edit: false,
					requester_can_view: false,
					position: { col: "1", col_size: "1", row: "5", row_size: "1" },	//No I18N
					mandatory: this.edit_mode && this.ssp.status_change_comment
				}]
			}, {
				custom_section: true,
				partial: "rf-req-close-form-footer",	//No I18N
				wrapper: false
			}]
		};
		if(window.isSCP) {
			$req.scpform.modifyCloseFormLayout(closeFormLayout);
		}
		layouts.push(closeFormLayout);

		/** on hold form layout */
		var onHoldFormLayout = {
			has_fields: true,
			dialog: true,
			dialog_id: "onhold-form",	//No I18N
			name: "onhold-form-layout",	//No I18N
			wrapper: false,
			sections: [{
				custom_section: true,
				partial: "rf-req-onhold-form-template",	//No I18N
				has_fields: true,
				name: "-1",	//No I18N
				collapsed_state: "expanded",	//No I18N
				column_count: "1",	//No I18N
				field_align: "left-right",	//No I18N
				wrapper: false,
				ondemand: true,
				fields: [{
					name: "status_change_comments",	//No I18N
					title: getMessageForKey("sdp.request.statusChange.comment"),	//No I18N
					position: {col: "1", col_size: "2", row: "1", row_size: "1"},	//No I18N
					edit: true,
					type: "string",	//No I18N
					display_type: "Multi Line",	//No I18N
					mandatory: this.edit_mode && this.ssp.status_change_comment,
					constraints:{
						max_length: 1000
					}
				}, {
					name: "comments",	//No I18N
					context: "onhold_scheduler",	//No I18N
					title: getMessageForKey("sdp.viewrequest.onhold.statuscomments"),	//No I18N
					position: {col: "1", col_size: "2", row: "1", row_size: "1"},	//No I18N
					edit: true,
					type: "string",	//No I18N
					display_type: "Multi Line",	//No I18N
					condition: "$req.form.checkOnHoldSchedulerFields"	//No I18N
				}, {
					name: "scheduled_time",	//No I18N
					context: "onhold_scheduler",	//No I18N
					position: {col: "1", col_size: "2", row: "1", row_size: "1"},	//No I18N
					edit: true,
					condition: "$req.form.checkOnHoldSchedulerFields",	//No I18N
					title: getMessageForKey("request.onholdform.scheduledtime")	//No I18N
				}, {
					name: "change_to_status",	//No I18N
					context: "onhold_scheduler",	//No I18N
					position: {col: "1", col_size: "2", row: "1", row_size: "1"},	//No I18N
					edit: true,
					condition: "$req.form.checkOnHoldSchedulerFields",	//No I18N
					title: getMessageForKey("sdp.requests.common.status")	//No I18N
				}]
			}]
		};
		layouts.push(onHoldFormLayout);

		/** status change comment layout */
		var statusCommentLayout = {
			has_fields: true,
			dialog: true,
			dialog_id: "statuscomment-form",	//No I18N
			name: "statuscomment-form-layout",	//No I18N
			wrapper: false,
			sections: [{
				custom_section: true,
				partial: "rf-status-change-comment-template",	//No I18N
				has_fields: true,
				name: "-1",	//No I18N
				collapsed_state: "expanded",	//No I18N
				column_count: "1",	//No I18N
				field_align: "left-right",	//No I18N
				wrapper: false,
				ondemand: true,
				fields: [{
					name: "status_change_comments",	//No I18N
					fafr_key: "status_change_comments",	//No I18N
					title: getMessageForKey("sdp.request.statusChange.comment"),	//No I18N
					position: {col: "1", col_size: "2", row: "1", row_size: "1"},	//No I18N
					edit: true,
					placeholder: getMessageForKey("sdp.request.statuscomment.mandatory"),	//No I18N
					type: "string",	//No I18N
					display_type: "Multi Line",	//No I18N
					mandatory: this.edit_mode && this.ssp.status_change_comment
				}]
			}]
		};
		layouts.push(statusCommentLayout);

		/** adding Reason for Update layout */
		if(this.edit_mode) {
			var updateReasonLayout = {
				has_fields: true,
				title: getMessageForKey("sdp.request.edit.reasonHeading"),	//No I18N
				sections: [{
					custom_section: true,
					partial: "rf-update-reason-template",	//No I18N
					has_fields: true,
					name: "-1",	//No I18N
					collapsed_state: "expanded",	//No I18N
					column_count: "1",	//No I18N
					field_align: "left-right",	//No I18N
					fields: [{
						name: "update_reason",	//No I18N
						fafr_key: "REASON",	//No I18N
						title: getMessageForKey("sdp.request.edit.reason"),	//No I18N
						position: {col: "1", col_size: "2", row: "1", row_size: "1"},	//No I18N
						edit: true,
						display_type: "Multi Line",	//No I18N
						mandatory: ( sdp_user.USERTYPE === "Requester"	//No I18N
									&& (( !this.request_info.editor || this.request_info.editor.id !== this.request_info.requester.id ) || this.bulk_mode)
									&& !!this.ssp.is_update_reason_mandatory )	//No I18N
					}]
				}]
			};
			layouts.push(updateReasonLayout);
		}
	}

		this.setDefaultValues(template);

		return template;
	},

	/**
	 * sets the default field values, which are available retain fields and other logics
	 */
	setDefaultValues: function(template) {
		var self = this;

		/** for duplicate request, the values of the fields in the existing ticket has to be retained */
		if(window.duplicateRequest || this.templateChanged) {
			if(this.entitydata.status && this.entitydata.status.color) {
				delete this.entitydata.status.color;
			}
			if(this.entitydata.priority && this.entitydata.priority.color) {
				delete this.entitydata.priority.color;
			}
			if(this.entitydata.requester) {
				delete this.entitydata.requester.is_vipuser;
				delete this.entitydata.requester.email_id;
				delete this.entitydata.requester.department;
			}
			if(this.entitydata.technician) {
				delete this.entitydata.technician.is_vipuser;
				delete this.entitydata.technician.email_id;
				delete this.entitydata.technician.department;
			}
		}

		if(!template.request) {
			template.request = {};
		}

		/** setting approver values */
		var setApprovers = function(targetObj) {
			var constructApprover = function(role) {
				return {
					id: role.id + "_orgRoleId",	//No I18N
					name: role.name
				};
			}
			if(self.template.approval_levels && self.template.approval_levels.constructor === Array && self.template.approval_levels.length > 0) {
				for(var i = 0, len = self.template.approval_levels.length; i < len; i++) {
					if(self.template.approval_levels[i].level === "1") {
						if(self.template.approval_levels[i].approvers) {
							targetObj.approvers = [];
							if(self.template.approval_levels[i].approvers.org_roles) {
								targetObj.approvers = self.template.approval_levels[i].approvers.org_roles.map(constructApprover);
							}
							if(self.template.approval_levels[i].approvers.users) {
								targetObj.approvers = targetObj.approvers.concat(  self.template.approval_levels[i].approvers.users );
							}
						}
						break;
					}
				}
			}
		};

		/** for the template changed edit form, only the fields that are not editable by requester will be changed to default template values */
		if(this.edit_mode && this.entitydata && this.templateChanged && this.entitydata.template.id !== this.template.id) {
			var requesterEditableFields = this.getRequesterEditableFields();
			if(!this.entitydata.udf_fields){
				this.entitydata.udf_fields = {}
			}
			setApprovers(this.entitydata);
		}
		if(this.isMaintenance && this.edit_mode && this.entitydata && this.entitydata.service_approvers ){
			this.entitydata.approvers=[];
			if(this.entitydata.service_approvers.org_roles){
				var orgApprovers= jQuery.extend(true, [],this.entitydata.service_approvers.org_roles);
				for(var iter1=0,iter1Len=orgApprovers.length;iter1<iter1Len;iter1++){
					this.entitydata.approvers.push({"id":orgApprovers[iter1].id+"_orgRoleId","name":orgApprovers[iter1].name});
				}
			}
			if(this.entitydata.service_approvers.users){
				var userApprovers= jQuery.extend(true, [],this.entitydata.service_approvers.users);
				this.entitydata.approvers=this.entitydata.approvers.concat(userApprovers);
			}
		}

		/** setting the template / ticket retaining values to the template default values */
		window.isMSP && $req.mspform.setDefaultSite(template);
		if(this.retain_fields) {
			var setRetainedObj = function(context, retainedObj) {
				for(var key in retainedObj) {
					if(context[ key ] && context[ key ].constructor === Object && retainedObj[ key ] && retainedObj[ key ] === Object ) {
						setRetainedObj( context[ key ], retainedObj[ key ] );
					} else {
						context[ key ] = retainedObj[ key ];
					}
				}
			};

			setRetainedObj(template.request, this.retain_fields);
			if (window.isMSP && $req.mspform.accountChangeEvent) {
				$req.mspform.restoreFieldInTemplate(template);
				if ($req.mspform.retain_fields.requester) {
					$req.mspform.restoreRequester(template, setRetainedObj);
				}
			}
			this.retain_fields = null;
		}

		/** setting Requester value for the Requesters */
		if(!this.edit_mode && sdp_user.USERTYPE === "Requester") {
        if (!window.isSCP || (window.isSCP && !$req.scpform.isAccountManager())) {
        	// this block is always executed for SDP
			!template.request && ( template.request = {} );
			template.request.requester = {
				id: sdp_user.LOGGEDIN_USERID,
				name: sdp_user.USERNAME
			};
			if(self.ssp.USER_DEPARTMENT_ID){
				template.request.requester.department={"id":self.ssp.USER_DEPARTMENT_ID}; //No I18N
		    }
		    }
        }

		if(!this.edit_mode) {
			if(!window.isMSP) {	// this block is always executed for SDP
			setApprovers(template.request);
			} else {
				// for MSP load approvers account based
				$req.mspform.setTemplateApprovers(template)
			}
		}

		/** Chat data --- setting default values based on the chat data when creating ticket from the Chat */
		if(this.chatID && this.chat_info && !jQuery.isEmptyObject( this.chat_info )) {
			/** client validation for the ticket creation from the chat */
			if( (this.chat_info.status === "Completed" || this.chat_info.status === "Missed" || this.chat_info.status === "Dropped") && !this.chat_info.request_id ) {
				!template.request && ( template.request = {} );
				if(this.chat_info.requester) {
					template.request.requester = {
						id: this.chat_info.requester.id,
						name: this.chat_info.requester.name
					};
					template.request.subject = "Chat #" + this.chatID + " from " + this.chat_info.requester.name;	//TODO : I18N	//No I18N
				}

				/** when "is_tech_auto_assign" is true, assign the current user as the technician */
				if(this.chat_info.is_tech_auto_assign) {
					template.request.technician = {
						id: sdp_user.LOGGEDIN_USERID.toString(),
						name: sdp_user.USERNAME
					};
				} else {
					if(this.chat_info.technician) {
						template.request.technician = {
							id: this.chat_info.technician.id.toString(),
							name: this.chat_info.technician.name
						};
					}
				}

				/** setting chat transcript as description */
				if(this.chat_info.transcript) {
					template.request.description = {
						content: this.chat_info.transcript
					}
					this.ref.description.template = this.chat_info.transcript;
					// Create the referernce for ticket description
					$req.form.request_description = this.chat_info.transcript;
				}
			}
        }

		/** selecting the requester based on the reqID parameter value */
		if(!this.edit_mode && this.requesterID) {
			!template.request && ( template.request = {} );
			template.request.requester = {
				id: this.requesterID
			};
		}

		/* Telephony -- When creating request from incoming phone call*/
		if(this.serviceName == "telephony"){
			var callDesc = Store.getItem("call_description"); //NO I18N
			var callSub = Store.getItem("call_subject"); //NO I18N

			 template.request.subject = callSub;

			 template.request.description = {
			 	content: callDesc
			 }
			 this.ref.description.template = template.request.description;
			 // Create the reference for ticket description on telephony integrations
			 $req.form.request_description = callDesc;

			Store.removeItem("call_description"); //NO I18N
			Store.removeItem("call_subject"); //NO I18N
			this.serviceName = null;
		}
	},

	/**
	 * returns the set of the fields that are editable by requrster
	 */
	getRequesterEditableFields: function() {
		var editableFields = [];
		var self = this;
		if(!this.template) {
			return editableFields;
		}
		var layout = (function() {
			for(var i = 0, len = self.template.layouts.length ; i < len; i++) {
				if((sdp_user.USERTYPE === "Technician" && self.template.layouts[i].name === "technician_layout")
					|| (sdp_user.USERTYPE === "Requester" && self.template.layouts[i].name === "requester_layout")) {
					return self.template.layouts[i];
				}
			}
		})();
		var templateFields = {};
		if(layout.sections) {
			for(var i = 0, ilen = layout.sections.length; i < ilen; i ++) {
				if(layout.sections[i] && layout.sections[i].fields) {
					for(var j = 0, jlen = layout.sections[i].fields.length; j < jlen; j++) {
						templateFields[layout.sections[i].fields[j].name] = layout.sections[i].fields[j];
						if(layout.sections[i].fields[j] && layout.sections[i].fields[j].requester_can_edit) {
							editableFields.push( layout.sections[i].fields[j].name );
						}
					}
				}
			}
		}
		self.templateFields = templateFields;
		return editableFields;
	},

	/**
	 * modifies the fields' default config in the template configuration object
	 */
	modifyFieldConfig: function(field, section) {

		/**
		 * Need to sort the system fields alphabetically in the client side
		 */
		if(field && field.name.indexOf("udf_") === -1 && field.name.indexOf("qstn_") === -1 && field.name!="site" && field.name!="group" && field.name!="technician" ){
			field.disableSort = false;
		}else{
			field.disableSort = true;
		}

		if(field.name.indexOf("udf_") > -1)
		{
			field.context = "udf_fields";	//No I18N
			let field_metadata = this.metainfo.fields[field.context].fields[field.name];
			let is_refer_additional_field = field_metadata && field_metadata.lookup_entity != "request_option"; //No I18N
            if(field_metadata &&field_metadata.lookup_entity && field_metadata.lookup_entity != "request_option"){
                this.refer_fields.push(field.name);
            }
            //Format the Picklist and Multiselect refer fields in the understanding format.
			if(field_metadata && (field_metadata.display_type=="Pick List" || field_metadata.display_type=="MultiSelect") && is_refer_additional_field && (!field_metadata.field_group || field_metadata.field_group != "resources"))
            {
                //Do not apply Sorting for allowed values in form
                field.sort = false;
                field.processResults= function(cacheData, data) {
                    var obj = {};
                    obj.text = data.name || data.text;
                    obj.id = data.id;
                    if(data.site) {
                        obj.site = data.site;
                    }
                    cacheData.push(obj);
                };
                field.formatSelection= function(data) {
                    var name = data.name || data.text;
                    if(data.site && data.site.name) {
                        name = name + ", " + data.site.name;
                    }
                    return e_html(name);
                };
                field.formatResult= function(data) {
                    var name = data.text;
                    if(data.site && data.site.name) {
                        name = data.text + ", " + data.site.name;
                    }
                    return e_html(name);
                };
            }

			/* Need to provide the allow clear only for the refer additional fields (Excluding product/software questions), as 'Not Specified' will not be present for those. */
			if(field_metadata && field_metadata.field_group!='resources' && is_refer_additional_field && (field.name.indexOf("date") > -1 || field.name.indexOf("pick") > -1))
            {
                field.allowClear = true;
            }

            if(this.bulk_mode && (field.name.indexOf("date") == -1)){ //SD-123198
                field.allowClear = false;
            }

			try {
				//Refer Additional Fields will not have a predefined selection box as local values will not be passed in allowed values.
                if(is_refer_additional_field){
                    field.selection_handler = false;
                }
				(field_metadata && field_metadata.is_pii) && (field.autocomplete = "off");
			} catch (error) {}
			if(field_metadata && field_metadata.field_group=='resources'){
			    /* field.image_token for resource question images will be added during the getResourceJSON allowed values servlet call processing @ processAllowedValues */
				field.image_dimension = "100x80";	//No I18N
				field.show_details = this.isAddIn ? false : true;
				if(this.isCostEnabled()) {
					field.item_info = "$req.form.getCostText";	//No I18N
					field.onchange = "$req.form.updateCostDetails";	//No I18N
				}
				field.showDetailsCallback = "$req.form.showResourceDetails";	//No I18N
				this.resource_fields.push(field.context + "." + field.name);	//No I18N
				field.label= field_metadata.display_name;
			}
		}
		switch(field.name) {
			case "asset":	//No I18N
				field.selection_handler = false;
				field.fafr_key = "REQUESTER.ASSETS";	//No I18N
				break;

			case "description":	//No I18N
				//field.images_save_path = "images.description";	//No I18N
				field.images_api = true;
				field.showAsVideo = true;//SD-113411: video copied to description field not shown in editor properly
				/**
				 * SD - 118354 -> String trim overwrite issue fix
				 */
				field.enableNativeTrim = true;
				field.images_url = $req.form.isMaintenance?"/api/v3/request_maintenances/"+($req.form.edit_mode ?$req.form.woID+"/":"")+"images":$req.form.edit_mode ? "/api/v3/requests/"+$req.form.woID+"/images":"/api/v3/requests/images";	//No I18N
				break;

			case "editor":	//No I18N
				field.selection_handler = this.isAddIn ? false : "$req.form.openEditorList";	//No I18N
				field.allowClear = true;
				break;

			case "approvers":	//No I18N
				if(!this.isMaintenance && this.edit_mode && (!this.templateChanged || this.entitydata.template.id === this.template.id)) {
					return false;
				}
				field.meta_path = "service_approvers.fields.org_roles";	//No I18N
				field.title = window.getMessageForKey("sdp.requests.newrequest.approvers");	//No I18N
				field.edit = true;
				field.type = "multi_select";	//No I18N
				field.fafr_key = "APPROVERS";	//No I18N
				break;

			case "created_time":	//No I18N
				field.args = this.constructDateArgs(
					null, null, null, null,
					"checkValidDate", "window",	//No I18N
					[ "created_time_EL", "due_by_time_EL", getMessageForKey("sdp.requests.newrequest.jserror1") ]	//No I18N
				);
				break;

			case "due_by_time":	//No I18N
				if(this.is_service_template) {
					field.args = this.constructDateArgs(
						null, null, null, null,
						"checkValidDate", "window",	//No I18N
						[ "created_time_EL", "due_by_time_EL", getMessageForKey("sdp.requests.newrequest.jserror1") ]	//No I18N
					);
				} else {
					field.args = this.constructDateArgs(
						null, null, null, null,
						"checkValidFrDate", "window",	//No I18N
						[ "created_time_EL", "first_response_due_by_time_EL", "due_by_time_EL", "SLA" ]	//No I18N
					);
				}
				!this.request_info.sla && ( field.allowClear = true );
				break;

			case "first_response_due_by_time":	//No I18N
				field.args = this.constructDateArgs(
					null, null, null, null,
					"checkValidFrDate", "window",	//No I18N
					[ "created_time_EL", "due_by_time_EL", "first_response_due_by_time_EL", "FR_SLA" ]	//No I18N
				);
				!this.request_info.sla && ( field.allowClear = true );
				break;

			case "scheduled_start_time":	//No I18N
			case "scheduled_end_time":	//No I18N
				field.fafr_key = field.name === "scheduled_start_time" ? "SCHEDULEDSTARTTIME" : "SCHEDULEDENDTIME";	//No I18N
				field.args = this.constructDateArgs(
					null, null, null, null,
					"checkValidSchDate", "window",	//No I18N
					[ field.name, "scheduled_start_time_EL", "scheduled_end_time_EL" ]	//No I18N
				);
				!this.request_info.sla && ( field.allowClear = true );
				break;

			case "email_ids_to_notify":	//No I18N
				field.tags = true;
				field.href = $req.form.edit_mode&&(!$req.form.isMaintenance) ? "/requests/"+$req.form.woID+"/requester" : "/requests/requester";	// No I18N
				field.placeholder = sdp_user.USERTYPE === "Requester" ? getMessageForKey("request.form.emailids.enter")  : getMessageForKey("request.form.emailids.select");	// No I18N
				//SD-129486 : Bulk Select option for email ids to notify is not required for Requester
				field.selection_handler = this.isAddIn || sdp_user.USERTYPE === "Requester" ? false : "$req.form.openEmailIDList";	// No I18N
				break;

			case "site":	//No I18N
				if(!(sdp_user.USERTYPE === "Technician" || (window.isMSP && $req.mspform.isAccountManager()))) {
					field.disabled = true;
				}
				break;
				// Issue fix for SD-90945. Need to remove when server side issue is fixed
			case "priority": //No I18N
				if(sdp_user.USERTYPE === "Requester" && !field.requester_can_edit ){
					return false;
				}
				break;
			case "space":	//No I18N
				if(!this.bulk_mode){
					field.selection_handler = "$req.form.openSpacePopup"; // No I18N
				}
				field.selection_icon_class = "aspr template-sm icon-sm pos-abs ml5 cur-ptr opac7 top10"; 	// No I18N
			    break;
			case "subject": //No I18N
			    //SDF-112486 : To avoid browser's suggestion, autocomplete is disabled by default.
			    field.autocomplete = "off"; //No I18N
			    break;
			case "configuration_items": // NO I18N
                		field.selection_handler = "$req.form.openCIPopupWrapper";    // NO I18N
            			break;
			default:
				break;
		}
		if(((this.metainfo.fields[field.name] && this.metainfo.fields[field.name].type == "date") || (!!field.context && this.metainfo.fields[field.context] && this.metainfo.fields[field.context].fields[field.name] && this.metainfo.fields[field.context].fields[field.name].type == "date")) && !field.args) {	//No I18N
			field.args = this.constructDateArgs(true, null, null, null,null, null, null, null,null, true);
		}
		if($req.form.isMaintenance&& (field.name=="site"||field.name=="group"||field.name=="technician") ){
			field.href="/request_maintenances/"+field.name;
		}
	},

	/**
	 * returns the cost of the given item with the currency symbol
	 */
	getCostText: function(item, field) {
		if(!item || !item.hasOwnProperty("cost")) {
			return null;	//No I18N
		}
		return sdp_app.CURRENCY_SYMBOL + " " + item.cost;	//No I18N
	},
	/**
	 * Select the resource, on the image viewer popup
	 */
	selectResource: function(element, name, value) {
		jQuery("input[name='" + name + "'][value='" + value + "']").prop("checked", jQuery(element).is(":checked")).trigger("change"); // NO I18N
	},
	/**
	 * shows the resource's details in dialog
	 */
	showResourceDetails: function(id, field, form) {
		var self = this;
		var options, element, qnName;
		var templateId = this.template.id;
		var qnId = field.name, optionId = id;
		var image_token = field.image_token;
		var requestId = this.edit_mode && this.request_info ? this.request_info.id : undefined;
		if(this.isMaintenance){
			requestId=undefined;
		}
		var selectedIds = [];
		if (field.current_value && Array.isArray(field.current_value)) {
			for (var i = field.current_value.length - 1; i >= 0; i--) {
				selectedIds.push(field.current_value[i].id);
			}
		}
		/* Need to load the scripts required for the option details popup only if it is not already present */
		if(!window.optionsViewer ) {
			ResourceLoader({
                js: ['/scripts/viewOptionDetails.js'], //No I18N
                process: "series", //If parallel, scripts will be fetched via promise and async will not be considered.
                async: false //By default async is true
            });
		}

		element = jQuery(event.target);
		qnName = field.label;
		var allowedValues = field.allowedValues;
		var allOptions = [];
		var currentIndex = 0;
		if(allowedValues){ // No I18N
			allowedValues = allowedValues.filter(function(item){
				return (item.id != "0"); //No I18N
			});
		}
		allOptions = allowedValues.map(function(item, index) {
			if (id === item.id) {
				currentIndex = index;
			}
			if (selectedIds.indexOf(item.id) !== -1) {
				item.selected = true;
			}else{
				item.selected = false;
			}
			item.fafr_key = field.id;
			if (!self.template.is_cost_enabled) {
				delete item.cost;
			}
			return item;
		});

		optionsViewer.init({
			question: {
				id: qnId,
				name: qnName,
				options: allOptions,
				image_token : image_token,
				type:  field.display_type === "Pick List" ? undefined : field.display_type // NO I18N
			},
			woId: requestId,
			templateId : templateId,
			cur_index: currentIndex,
			onChange: "$req.form.selectResource", // NO I18N
			showCost: this.isCostEnabled()
		});
	},

	/**
	 * return if the cost is enabled for this template and in the current request ( if already created )
	 */
	isCostEnabled: function() {
		/**
		 * Case 1: Cost is enabled, when the template is have cost details (New Page)
		 * Case 2: Cost is disabled, when the template is havn't cost details (New Page)
		 * Case 3: Cost is enabled, when request is created with cost details then disable the cost details of template (Edit Page)
		 * Case 4: Cost is disabled, when template is updated with cost details after the request is created (Edit Page)
		 * Case 5: Cost is enabled, above case with template and target template have cost details (Change Template)
		 * Case 6: Cost is enabled, when the request is having cost and target template have cost (Change Template)
		 * Case 7: Cost is disabled, when request is created with cost and target template doesn't have cost details (Change Template)
		 */
		var isCostEnabled = false;

		/** Case 1 */
		if(!this.edit_mode && this.is_service_template && this.template.is_cost_enabled){
			isCostEnabled = true;
		/** Case 2 */
		}else if(!this.edit_mode && this.is_service_template && !this.template.is_cost_enabled){
			isCostEnabled = false;
		/** Case 3*/
		}else if(this.edit_mode && !this.templateChanged && this.request_info.hasOwnProperty("service_cost")){ //No I18N
			isCostEnabled = true;
		/** Case 4 */
		}else if(this.edit_mode && !this.templateChanged && !this.request_info.hasOwnProperty("service_cost")){ //No I18N
			isCostEnabled = false;
		/** Case 5 && Case 6*/
		}else if(this.templateChanged && this.template.is_cost_enabled ){ //No I18N
			isCostEnabled = true;
		/** Case 7*/
		}else if(this.templateChanged && !this.template.is_cost_enabled){ //No I18N
			isCostEnabled = false;
		}

		if(sdp_user.USERTYPE === "Requester") { // No I18N
			if(this.ssp.service_cost_user_type !== "Requesters") { //No I18N
				isCostEnabled = false;
			}
			if(this.ssp.service_cost_user_type === "Approvers" && this.request_info && !this.request_info.total_cost) {	//No I18N
				isCostEnabled = false;
			}
		}
		return isCostEnabled;
	},

	/**
	 * sets the cost data to the context and creates the cost item list
	 * also calculates the total cost of the cart
	 */
	setCostData: function() {
		var self = this;
		this.cost.service_cost = this.template.cost_details && this.template.cost_details.service_cost ?
									this.template.cost_details.service_cost : "0.00";	//No I18N
		if(this.edit_mode && this.request_info && this.request_info.service_cost && this.request_info.template.id == this.template.id){
			this.cost.service_cost = this.request_info.service_cost;
		}
		this.cost.service_cost_comment = this.template.cost_details && this.template.cost_details.cost_comments ?
									this.template.cost_details.cost_comments : "-";	//No I18N
		this.cost.total_cost = !isNaN( this.cost.service_cost ) ? getFormattedCost( this.cost.service_cost ) : 0;
		this.cost.items = [];
		this.cost.currency = sdp_app.CURRENCY_SYMBOL;

		if(this.edit_mode || window.duplicateRequest) {
			
				for(var qn in this.request_info.udf_fields) {
					var question = this.request_info.udf_fields[ qn ];
					if(question && !this.templateChanged) {
						var field = $rf.fields[ "udf_fields." + qn ];	//No I18N
						if(!field || field.field_group!='resources') {
							continue;
						}
						if(question.constructor === Object) {
							var newQstnObj = this.includeCostItem(field, question, window.duplicateRequest);
							this.incrementTotalCost(window.duplicateRequest && newQstnObj && newQstnObj.cost ? newQstnObj.cost : question.cost);

						} else if(question.constructor === Array) {
							for(var i = 0, len = question.length; i < len; i++) {
                                var newQstnObj = this.includeCostItem(field, question[i], window.duplicateRequest);
                                this.incrementTotalCost(window.duplicateRequest && newQstnObj && newQstnObj.cost ? newQstnObj.cost : question[i].cost);
							}
						}
					}
				}
		
		}
	},

	/**
	 * updates the cost details everytime there is a change in the cost selection
	 */
	updateCostDetails: function(field, form, event) {
		if(!field || !field.has_cost) {
			return;
		}

		/** constructs the cost items list and calculate the total cost */
		this.setCostItems();

		/** updates the cost details in the header */
		jQuery(".sc-cart-totalcost").data("cost", this.cost.total_cost).text(this.cost.total_cost);	//No I18N
		jQuery("#header-costitem-count").text(this.cost.items.length);	//No I18N
		if(this.cost.items.length === 0) {
			jQuery("#sc-cart-showitems").addClass("hide");	//No I18N
			jQuery("#sc-cart-items").parents(".open:first").removeClass("open");	//No I18N
		} else {
			jQuery("#sc-cart-showitems").removeClass("hide");	//No I18N
		}
		renderhbs('#sc-cart-items-ul', 'rf-cost-item-list-template', this.cost, false, 'requests/form', null, null, $req.form.bindEvents.templates.rf_cost_item_list_template); //No I18N
		renderhbs('#cost-list-preview', 'rf-cost-estimation-template', this.cost, false, 'requests/form', null, null, $req.form.bindEvents.templates.rf_cost_estimation_template); //No I18N
	},

	/**
	 * includes the resource item data to the cost item list by fetching it from the allowed values
	 * @returns the itemInfo fetched from allowed values
	 */
	includeCostItem: function(field, option, includeCurrentCost = true) {
		if(!option || option.id == "0") {
			return;
		}
		var itemInfo;
		var id = option.id || option;
		if(field.allowedValues) {
			for(var i = 0, len = field.allowedValues.length; i < len; i++) {
				if(id === field.allowedValues[i].id) {
					itemInfo = field.allowedValues[i];
					break;
				}
			}
		}
		if(!itemInfo || !itemInfo.cost) { //Need to add cost entry for questions for which cost is enabled.
			return;
		}
		let image_token_str = $req.common.image_token_for_qstn_edit ? ('&key=' + $req.common.image_token_for_qstn_edit) : '';
		this.cost.items.push({
			id: itemInfo.id,
			name: itemInfo.name,
			cost: includeCurrentCost ? itemInfo.cost : option.cost,
			fafr_key: field.fafr_key,
			item_id: field.id,
			label: field.label,
			image: itemInfo.images && itemInfo.images.length ? (appendDimensions(itemInfo.images[0], "100x80") + image_token_str) : null	//No I18N
		});
		return itemInfo;
	},

	/**
	 * increments the total cost value by the given item cost
	 */
	incrementTotalCost: function(cost) {
		cost = parseFloat(cost);
		if(!isNaN(cost)) {
			this.cost.total_cost = getFormattedCost( parseFloat(this.cost.total_cost) + cost );
		}
	},

	/**
	 * decrements the total cost value by the given item cost
	 */
	decrementTotalCost: function(cost) {
		cost = parseFloat(cost);
		if(!isNaN(cost)) {
			this.cost.total_cost = getFormattedCost( parseFloat(this.cost.total_cost) - cost );
		}
	},

	/**
	 * constructs the cost items list and calculates the total cost of the selected items
	 */
	setCostItems: function() {
		if(!this.isCostEnabled()) {
			return null;
		}

		var fname, field, type, value;
		this.cost.items = [];
		this.cost.total_cost = !isNaN( this.cost.service_cost ) ? getFormattedCost(this.cost.service_cost) : 0;
		for(var i = 0, len = this.resource_fields.length; i < len; i++) {
			fname = this.resource_fields[i];
			field = $rf.fields[ fname ];
			if(!field || !field.has_cost) {
				continue;
			}
			type = field.type;
			field.display_type === "Radio" && ( type = field.display_type );	//No I18N
			switch( type ) {
				case "multi_select":	//No I18N
					if(field.current_value && field.current_value.length > 0) {
						for(var j = 0, jLen = field.current_value.length; j < jLen; j++) {
							this.includeCostItem(field, field.current_value[j]);
							this.incrementTotalCost(field.current_value[j].cost);
						}
					}
					break;
				case "Radio":	//No I18N
				case "lookup":	//No I18N
					if(field.current_value) {
						this.includeCostItem(field, field.current_value);
						this.incrementTotalCost(field.current_value.cost);
					}
					break;
			}
		}
	},

	/**
	 * unsets the given resource field
	 * incase of multiselect, the given item alone will be unset from the selection list
	 */
	unsetResourceItem: function(fname, itemId, event) {
		if(!fname || !itemId || !this.cost.items || this.cost.items.length === 0) {
			return;
		}
		if(event) {
			event.stopPropagation();
		}
		var field = $rf.fields[ fname ];
		if(!field) {
			return;
		}
		if(field.type === "multi_select") {
			$rf.unsetFieldOptions(fname, itemId);
		} else {
			$rf.unsetFieldValue(fname);
		}
	},

	/**
	 * initializes the sticky behaviour of the Service band at the top
	 */
	initStickyServiceBand: function() {
		var costBand = document.getElementById("rf-service-band");	//No I18N
		var rfHeader = document.getElementById("rf-header");	//No I18N
		var costBandTop = rfHeader.offsetTop + rfHeader.scrollHeight;
		costBand = jQuery(costBand);
		var costBandWidth = jQuery("#content-panel").width();	//No I18N
		var formContainer = jQuery("#rf-container");	//No I18N
		jQuery(window).on("scroll.rf_sticky_header", function() {
			if(window.pageYOffset >= costBandTop) {
				costBand.css({ "position": "fixed", "z-index": 3, "width": costBandWidth + "px", "top": "0px" });	//No I18N
				formContainer.css("padding-top", "44px");	//No I18N
			} else {
				costBand.css({ "position": "relative", "z-index": "none", "width": "auto" });	//No I18N
				formContainer.css("padding-top", "0px");	//No I18N
			}
		});
	},
	//SD-100755
	processCSI: function(){
		this.setCSIAllowedValues(this.csi_model);
	},
	/**
	 * sets the allowed values to the Category, Subcategory and Item fields in the form object ( $rf )
	 */
	setCSIAllowedValues: function(csi) {
		if(!csi || !csi.categories) {
			return false;
		}
		var category = [], subcategory = {}, item = {};
		var categoryIds = [];
		for(var catIndex = 0, catLen = csi.categories.length; catIndex < catLen; catIndex++) {
			var categoryObj = csi.categories[ catIndex ];
			categoryIds.push(categoryObj.id);
			category.push({
				id: categoryObj.id,
				name: categoryObj.name
			});
			if(categoryObj.sub_categories && categoryObj.sub_categories.length > 0) {
				subcategory[categoryObj.id] = [];
				for(var subcatIndex = 0, subcatLen = categoryObj.sub_categories.length; subcatIndex < subcatLen; subcatIndex++) {
					var subcategoryObj = categoryObj.sub_categories[subcatIndex];
					subcategory[categoryObj.id].push({
						id: subcategoryObj.id,
						name: subcategoryObj.name
					});
					if(subcategoryObj.items && subcategoryObj.items.length > 0) {
						!item.hasOwnProperty( categoryObj.id ) && ( item[categoryObj.id] = {} );
						item[categoryObj.id][subcategoryObj.id] = [];
						for(var itemIndex = 0, itemLen = subcategoryObj.items.length; itemIndex < itemLen; itemIndex++) {
							item[categoryObj.id][subcategoryObj.id].push({
								id: subcategoryObj.items[itemIndex].id,
								name: subcategoryObj.items[itemIndex].name
							});
						}
					}
				}
			}
		}

		/** Set the Allowed values of the CSI from the combined API call after render */
		if($rf.allowedValues){
			/** Set allowed of Category */
			$rf.allowedValues.category = category;
			/** Set allowed of Sub Category */
			$rf.allowedValues.subcategory = subcategory;
			/** Set allowed of Item */
			$rf.allowedValues.item = item;
			/** After override the allowed values, we need a trigger the form component to process the new allowed values */
			$rf.addAllowedValues("category", categoryIds); // NO I18N
		}
	},

	/**
	 * sets the allowed values to the Site, Group and Technician fields in the form object ( $rf )
	 */
	 setSGTAllowedValues: function (data) {
        if (sdp_user.USERTYPE === "Requester" && (!window.isMSP || !$req.mspform.isAccountManager()) && $rf.allowedValues) {
			$rf.allowedValues.site = this.getSiteAllowedValues();
		}
    },

	/**
	 * get Site Allowed values for Requester login
	 * @docs https://writer.zoho.com/writer/published/9t9z4a095d9f76ddd459bbb42556e92b2911d
	 */
	getSiteAllowedValues: function(){
		var that = this;
		var sites = [];
		var notAssociatedSite =  {
			id:"0",
			name:getMessageForKey("sdp.admin.technician.addtechnician.nosite")
		};
		var selectedIds = {};
		var requesterHaveSite = !!that.requester_info && that.requester_info.department && that.requester_info.department.site;
		if(that.template.request && that.template.request.site){
			selectedIds[that.template.request.site.id] = true;
			sites.push(that.template.request.site)
		}else if(that.ssp.on_behalf_of_user_field && $rf.fields.values.on_behalf_of){
			if(that.obo_info && that.obo_info.department && that.obo_info.department.site){
				sites.push(that.obo_info.department.site);
			selectedIds[that.obo_info.department.site.id] = true;

				if(requesterHaveSite && that.requester_info.department.site.id !== that.obo_info.department.site.id){
					sites.push(that.requester_info.department.site)
					selectedIds[that.requester_info.department.site.id] = true;

				}
			}else{
				selectedIds[notAssociatedSite.id] = true;
				sites.push(notAssociatedSite);
			}
		}else if(requesterHaveSite){
			selectedIds[that.requester_info.department.site.id] = true;

			sites.push(that.requester_info.department.site);
		}else{
			selectedIds[notAssociatedSite.id] = true;

			sites.push(notAssociatedSite);
		}
		if(that.edit_mode && that.request_info.site && !selectedIds[that.request_info.site.id] ){
			sites.push(that.request_info.site);
		}

		/**
		* If the selected is refer site, then that should also in the site list

		var refer=[];
		for (var index = 0; index < sites.length; index++) {
			var element = sites[index];
			var referredSite = siteRefModel.list[element.id];
			// if the site is refer from default
			if(!referredSite || referredSite!=="0" ) { //NO I18N
					referredSite = "0";     //No I18N
			}
			refer.push({
					id: referredSite
			});
		}
		// join the refer site and regular site
		sites = sites.concat(refer); */

		// filter the sites for remove duplicates;
		var filteredSite = [];
		var filterKey = {};
		sites.forEach(function(item, index){
			if(item.id && !filterKey[item.id]){
				filteredSite.push(item);
				filterKey[item.id] = true;
			}
		});

		return filteredSite;
	},

	/**
	 * revises and modifies the payload before saving the form
	 */
	reviseUpdateInfo: function(payload, form, event) {
		var updateinfo = payload.request;
		var udf_fields = {};
		var self = this;
		for(var key in updateinfo) {
			
			/** service approvers modification */
			if(key === "approvers") {
				updateinfo.service_approvers = {
					org_roles: [],
					users: []
				};
				if(updateinfo.approvers && updateinfo.approvers.length > 0) {
					for(var i = 0, len = updateinfo.approvers.length; i < len; i++) {
						if(!updateinfo.approvers[i] || !updateinfo.approvers[i].id || Array.isArray(updateinfo.approvers[i].id)) {
							continue;
						}
						if(updateinfo.approvers[i].id.endsWith("_orgRoleId")) {
							updateinfo.service_approvers.org_roles.push({
								id: updateinfo.approvers[i].id.substr(0, updateinfo.approvers[i].id.length - 10),
								name: updateinfo.approvers[i].name
							});
						} else {
							updateinfo.service_approvers.users.push(updateinfo.approvers[i]);
						}
					}
				}
				delete updateinfo.approvers;
			}
			if(key === "email_ids_to_notify" && sdp_user.USERTYPE === "Requester" && updateinfo.email_ids_to_notify){ 	//NO I18N
			var email_ids_to_notify = updateinfo.email_ids_to_notify.split(",");
			var email_ids_to_notify_sanitized = [];
			var item;
				for (var index = 0; index < email_ids_to_notify.length; index++) {
					item  = email_ids_to_notify[index] ? email_ids_to_notify[index].trim() : "";
					if(item){
						email_ids_to_notify_sanitized.push(item);
					}
				}
				updateinfo.email_ids_to_notify = email_ids_to_notify_sanitized;
			}
			if((key === "onhold_scheduler")){ 	//NO I18N
				if(updateinfo.onhold_scheduler.change_to_status === null){
					delete updateinfo.onhold_scheduler
				}
			}
			if(key==="closure_info"  && $rf.fields.values.status && $rf.fields.values.status === $req.common.operational_data.resolved_status_id){ 	//NO I18N
				if(updateinfo.closure_info.hasOwnProperty("requester_ack_resolution")){ 	//NO I18N
					delete updateinfo.closure_info.requester_ack_resolution;
				}
				if(updateinfo.closure_info.hasOwnProperty("requester_ack_comments")){	//NO I18N
					delete updateinfo.closure_info.requester_ack_comments;
				}
			}
			/** If the Request is raised via quickCreate -> addMore details with New requestor, then need to remove the id */
			if(key ==="requester" &&  updateinfo.requester && updateinfo.requester.id === updateinfo.requester.name ){
				delete updateinfo.requester.id;
			}
		}
		/** adding the associated tasks list to the payload */
		if(this.template.task_templates && this.template.task_templates.length > 0) {
			var associated_tasks = [];
			var tasksEle = jQuery("#templateTask_div").find("input[name='tmplTaskId']");	//No I18N
			if(tasksEle.length > 0) {
				tasksEle.each(function(element, index) {
					if(jQuery(this).is(":checked")) {
						associated_tasks.push({ id: this.value });
					}
				});
			}
			updateinfo.request_template_task_ids = associated_tasks;
		}

		/** add sla info to the payload */
		if(this.sla && this.sla.id) {
			if(this.sla.id === "0") {
				updateinfo.service_sla = null;
			} else {
				updateinfo.service_sla = {
					id: this.sla.id
				};
			}
			if(this.sla.comment) {
				updateinfo.sla_update_comments = this.sla.comment;
			}
		}

		/** template id appending for the add new request or when template is changed or when SLA is updated */
        if (!this.edit_mode || this.templateChanged || updateinfo.sla || (window.isMSP && $req.mspform.mspTemplateChanged)) {
			updateinfo.template = {
				id: this.template.id
			};
		}
		updateinfo.zia_properties = {
				prediction: this.zia_properties.prediction,
				appliedlist: this.zia_properties.appliedlist,
				discardedlist: this.zia_properties.discardedlist
			}

		/* If the user applies the zia suggested template, then zia property will be set with templateID after checking
		   whether the same template is updated before updating the request */
		if (this.edit_mode && typeof ziaSuggestedTemplateId !== 'undefined') {
			if (ziaSuggestedTemplateId == this.templateID) {
				updateinfo.zia_properties.ziaSuggestedTemplateId = ziaSuggestedTemplateId;
			}
		}

		/** in case of duplicating request, the original request id should be passed */
		if(window.duplicateRequest) {
			updateinfo.copied_from = {
				id: this.entitydata.id,
				module: "request"	//No I18N
			}
		}
		if(self.chatID){
			updateinfo.copied_from = {
				id: self.chatID+"", // NO I18N
				module:"chat" // NO I18N
			}
		}
		if(self.telephonyID&&serviceName=="telephony"){
			updateinfo.copied_from = {
				id: self.telephonyID+"", // NO I18N
				module:"telephony" // NO I18N
			}
		}
		if(updateinfo.resolution && updateinfo.resolution.content){
			var editor = window.ZEditor[$rf.fields["resolution.content"].zeditor_id];
			editor.setHTML(editor.getHTML())
			updateinfo.resolution.content = editor.getHTML()
		}
		if(updateinfo.site){
			updateinfo.site.id = updateinfo.site.id+"";
			if(updateinfo.site.id==="0"){
				updateinfo.site= null;
			}
		}
		if($req.common.rlc_notes&&!this.isMaintenance){
			updateinfo.note_comments = $req.common.getRLCNotes();
		}
		//SD-103876
		$req.common.revisePriority(updateinfo);

		/*
		In Maintenance we need to change the key of input_data from request to request_maintenance
		*/
		if(this.isMaintenance){
			delete payload.request.zia_properties;
		}

		if(window.isMSPOrSCP) {
			$req.mspform.modifyUpdateInfo(updateinfo);
		}

		return payload;
	},

	/**
	 * Method to handle functionality before saving data
	 */
	preSaveHandler: function(form, field, event, editType, callback) {
		var self = this, saveData;
		var promises = [];
		var canSave = true;
		// This check is important for ZIA template/category prediction flow
		var isManual = event && event.type === "click"; //NO I18N

		/**
		 * when the status is changed indirectly like template change or anything, the status change comment might have not been obtained from user
		 * in such scenarios, validate and show the status change comment dialog
		 */
		var isRequestStatusChanged = function(){
			return (
				self.edit_mode &&
				// Has Status Field
				($rf.fields.status && $rf.fields.values.status &&  $req.form.request_info.status)
				&& (
				// Has Status ID
					($rf.fields.values.status.id && $rf.fields.values.status.id !== $req.form.request_info.status.id) ||
					// Somwtimes status havn't ID
					(!$rf.fields.values.status.id && $rf.fields.values.status !== $req.form.request_info.status.id)
				)
				// SSP enabled and status change comments havn't set
				&& (self.ssp.status_change_comment && (!$rf.fields.values.status_change_comments && !$rf.fields.values["closure_info.closure_comments"] ))
			)
		}
//NOT NEEDED FOR Maintenance
		if(!this.isMaintenance&&isRequestStatusChanged()) {
			$req.common.promptStatusCommentForm(this.request_info.status.id, form.fields.values.status);
			canSave = false;
		}

		if(!this.isMaintenance && form && ( form.isValueChanged("technician") || !this.edit_mode )) {
			var selectedTech = form.fields.technician ? form.fields.technician.current_value : undefined ;
			if(this.edit_mode || selectedTech) {
				canSave = $req.common.isValidTech(selectedTech,"form");  //NO I18N
			}
		}
		//NOT NEEDED FOR Maintenance
		if(!this.isMaintenance&&self.rlc_notes){
			var notes = $req.common.getRLCNotes();
			if(!notes || !notes.description){
				canSave = false;
			}else if(notesDescEditor && notesDescEditor.isEmpty()){
				canSave = false;
			}
			if(!canSave){
				$req.common.promptRLCNotes();
			}
		}

		var new_account = window.isSCP && form.fields.account && form.fields.account.current_value && form.fields.account.current_value.id === form.fields.account.current_value.name;	// boolean var introduced for MSP/SCP
		if(isManual && form.fields.requester && form.fields.requester.current_value && form.fields.requester.current_value.id === form.fields.requester.current_value.name ){
			/** If the ESM portal is created, then we doesn't allow to user create an new requester via form */
			if(window.sdp_app.IS_MDH_SETUP && (!window.isSCP || sdp_user.ROLES.indexOf("CreateRequester") === -1)) {
				// if not SCP, this block is executed for MDH Setup
				// if SCP, this block is executed if user doesn't have permission to CreateRequester
				alert(getMessageForKey("sdp.requests.requester.not.exist"));
				canSave = false;
			} else if(window.isSCP && new_account && sdp_user.ROLES.indexOf("CreateAccounts") === -1) {
				// if user doesn't have permission to create account
				alert(getMessageForKey("scp.account.not.exist"));
				canSave = false;
			}else{
				var message = getMessageForKey("sdp.leftpanel.quickcreate.askreqvalidname");	// var introduced for modifying the message for MSP/SCP
				if(window.isSCP && new_account){
					message = getMessageForKey("scp.alert.add.contact.and.account");
				}
				if(confirmSubmit(message)) {
					canSave = true;
				}else{
					canSave = false;
				}
			}
			/** If the new account is added via form, we must show an confirm alert */
		}else if(window.isSCP && new_account){
			if(sdp_user.ROLES.indexOf("CreateAccounts") === -1) {	// if user doesn't have permission to create account
				alert(getMessageForKey("scp.account.not.exist"));
				canSave = false;
			} else {
				var message = getMessageForKey("scp.alert.add.contact.and.account");
				if(canSave) {	// already if not allowed to save, canSave should not be allowed to be set true
					if(confirmSubmit(message)) {
						canSave = true;
					}else{
						canSave = false;
					}
				}
			}
		}

		if(this.isMaintenance){
			var submitBtn = jQuery("#" + $rf.container).find("button[name='save-form']");	//No I18N
			submitBtn.length > 0 && ( submitBtn[0].disabled = false );
			if(!canSave) {
				typeof callback === "function" && callback(false);	//No I18N
				return true;
			}
			var titleEle = jQuery('#templName');
			if(!titleEle.val()){
				jQuery('#templName-error').removeClass("hide");
				jQuery('html, body').animate({
					'scrollTop' : titleEle.scrollTop() - titleEle.offset().top - 60  //NO I18N
				});
				titleEle.focus();
				return true;
			}
			// Check the form is valid before checking unsaved changes - this scenario is important for fafr
			if(!$rf.validateForm()) {
				$rf.scrollToErrorMsg();
				return true;
			}
			self.switchMaintenanceTabs('schedule-tab','formfield-tab'); //NO I18N
			return true;
		}
		if(canSave && this.edit_mode && sdp_user.USERTYPE === "Technician") {
			if(isManual && form && form.isValueChanged("site")) {
				/** when site is changed, check if the PRs are associated and show the alert that the PRs will disocciated if the site is changed */
				var pr_promise = jQuery.ajax({
					type: "POST",	//No I18N
					url: "/PurchaseRequest.do?task=getAssociatedPrsForSR&serviceRequestId=" + this.woID,	//No I18N
					contentType: "application/json; charset=utf-8",	//No I18N
					dataType: "text",	//No I18N
					success: function(responseJson) {
						responseJson = ( responseJson.trim() != "" ? responseJson.split(",") : [] );	//No I18N
						if( responseJson.length > 0 ) {
							if( !window.confirm(getMessageForKey("sdp.service.request.dissociate.pr.waringmessage", [ form.getFieldText("site") ])) ) {
								var siteValue = $rf.fields.values.site || { id:"0", name:getMessageForKey("sdp.admin.technician.addtechnician.nosite")} //NO I18N
								$rf.safeSetFieldValue("site", siteValue); //No I18N
								canSave = false;
							}
						}
					}
				});
				promises.push( pr_promise );
			}
		}

		jQuery.when.apply(this, promises).then(function() {
			if(!canSave) {
				typeof callback === "function" && callback(false);	//No I18N
				return;
			}
			//NOT NEEDED FOR Maintenance
			// SD-99741
			/**
			 * ZIA Template category prediction starts
			 */
			if(self.isAddIn!=true && window.canZiaSuggests && !$req.form.zia_properties.suggested_already && !$req.form.edit_mode){
				if($rf.mode === "new" || ($rf.options && $rf.options.save && $rf.options.save.forcesave)) {	//No I18N
					saveData = $rf.serialize();
				} else {
					saveData = $rf.getChangedValues();
			   }
				// Check the form is valid before checking unsaved changes - this scenario is important for fafr
				if(!$rf.validateForm()) {
				   $rf.scrollToErrorMsg();
					canSave = false;
			   }
			   if(jQuery.isEmptyObject(saveData)) {
				   window.showalert("warning", translate("common.nothing.to.save"), "isAutoHide=true, delay=15");	//No I18N
				   canSave = false;
			   }
			   if(canSave === false) {
				   typeof callback === "function" && callback(false);	//No I18N
				   return;
			   }
			   zia_cat_temp_suggestion.callForZiaSuggestion(document.getElementById($rf.formid), saveData);
			   return;
			}
			/**
			 * ZIA Template category prediction ends
			 */

			// SD-124890 When Solution popup comesup, the submit flow will be triggered twice and FAFR gets triggered twice.
			// So the flag isFAFRExecuted is checked if FAFR is executed the first time.
			if(!self.isFAFRExecuted){
			$se.checkOnSubmitCall();
			if(editType === "form-edit" && $rf.validateForm() && !$se.stopFormSubmission) {	//No I18N
				$se.onFormSubmit = true;
				//NOT NEEDED FOR Maintenance
				$se.executeOnFormSubmitScripts(function(){
					$se.onFormSubmit = false;
					if($se.stopFormSubmission) {
						typeof callback === "function" && callback(false);	//No I18N
						return;
					}
				self.isFAFRExecuted = true ;
				});
			}
			}

			 /** suggestion flow on submitting */
			if(self.isAddIn!=true && sdp_user.USERTYPE === "Requester" && self.ssp.suggest_enabled && !self.is_service_template && !self.edit_mode && self.suggestion_seen === false && !self.isFromZiaBot) {
				canSave = suggest(event, "addWOButton", document.getElementById($rf.formid));	//No I18N
				if(canSave === false) {
	                   typeof callback === "function" && callback(false,true);	//No I18N
							return;
	                }
	        }
	        //SD - 100365 Fix - Restricting Dummy Update with only Update Reason Field
	        if(editType === "form-edit" && $req.form.edit_mode){
                saveData = $rf.getChangedValues();
                updatedKeys=Object.keys(saveData);
                if(updatedKeys.length == 1 && updatedKeys.contains('update_reason') && !self.templateChanged){
                    window.showalert("warning", translate("common.nothing.to.save"), "isAutoHide=true, delay=15");	//No I18N
					self.isFAFRExecuted = false; // When dummy updating with only Update Reason field, FAFR need to be executed on the next submit.
                    typeof callback === "function" && callback(false);	//No I18N
                    return;
                }

            }

			if(typeof callback === "function") {	//No I18N
				var submitBtn = jQuery("#" + $rf.container).find("button[name='save-form']");	//No I18N
				if($se.stopFormSubmission) {
                    submitBtn.length > 0 && ( submitBtn[0].disabled = false );
					callback(false);
					return;
				} else {
					callback();
					if(submitBtn.length > 0 && ( submitBtn[0].disabled == false)){
						// If the submit button is enabled, then there is a valid case for submitting the request again. Here, need to execute FAFR again on the next submit.
						self.isFAFRExecuted = false;
					}
				}
			}
		});
		return true;
	},

	/**
	 * submits the form when needed explicitly
	 * in general, the Form component will take care of form submission through the save button
	 * when explicitly required to trigger the submission, this method can be called
	 */
	submit: function(triggeredBy, event) {
		closeDialog();
		// closeDialog won't close the zia, we manually close it
		try {
			jQuery("body").removeClass("atp-open");  // NO I18N
			var parentdiv = jQuery("#ziasuggestion").parent().parent(); // No I18N
			parentdiv.closest(".ui-dialog").addClass("notification-zoom-out"); //No I18N
			jQuery("#zia-notify-overlay").hide(); // No I18N
			setTimeout(function() {
				parentdiv.closest(".ui-dialog").remove(); // No I18N
			}, 100);
		} catch (error) {

		}

		if(triggeredBy === "suggestion") {
			this.suggestion_seen = true;
		}
		if(triggeredBy === "zia_suggestion"){
			$req.form.zia_properties.suggested_already = true;
			// SD-125059 fix moved from zia-tc.js to WoForm.js
			// After zia changes, need to validate the form and enable the submit button(when subcategory is mandated but after a category change from zia, the subcategory maybe made null)
			// The Form.js enables the button from event.target, which is the zia apply button(not the Request Form submit button)
			if(!$rf.validateForm()){
                var submitBtn = jQuery("#" + $rf.container).find("button[name='save-form']"); // No I18N
                submitBtn.length > 0 && (submitBtn[0].disabled = false);
            }
		}

		FC.submit($rf.form, event);
	},
	/**
	 * Manually submit the button
	 */
	manualSubmit:function () {
		var submitBtn = jQuery("#" + $rf.container).find("button[name='save-form']");	//No I18N
		submitBtn.click();
	},


	/**
	 * performs the actions after form submission is successfull
	 */
	saveSuccessHandler: function(data, form) {

		if(this.mode === "view") {
			return;
		}
		if(data.response_status && data.response_status.status==='failed'){
			showalert("failure", data.response_status.messages[0].message, "isAutoHide=false", "multi"); //NO I18N
			return false;
		}
		if(!this.woID || window.duplicateRequest) {
			woID = this.woID = data.request.id;
		}
		if(serviceName == "telephony"){
			var callID = Store.getItem("call_id"); // NO I18N
      		telephony.closeTelephonyPopUp(callID);
      		Store.removeItem("call_id"); //NO I18N
		}
		/* Linking Service Request with Incident Request*/
		if(linkWorkOrderId!=null){
			var link_data={
							    "link_requests": [					//NO I18N
							        {
							            "linked_request": {					//NO I18N
							                "id": linkWorkOrderId			//NO I18N
							            },
							            "comments": linkRequestComment,			//NO I18N
										"filter_by" : requestListViews.filter_by //No I18N
							        }
							    ]
							};
			link_data=window.sdpToJSON(link_data);
			sdpAjax({
				url: form.options.save.url+"/"+data.request.id+"/_link_requests",				//NO I18N
				type: "POST",	//No I18N
				data: { input_data: link_data }
			});
		}
		/** timeout is to confirm that the Form submission ajax's always is executed before destroying the form */
		setTimeout(function() {
			$req.form.destroyForm(undefined, false);
			if($req.form.isAddIn){
				externalCallback("ticket_created",{woID:$req.form.woID});//No I18N
			} else if($req.form.isFromZiaBot){
				ziabot.requestPostSuccess($req.form.woID,$req.form.templateID);
			}else if($req.form.isFromIntegrationBot){
				//If the request is created from Slack Integration Bot(using Zia) , then we need to send the confirmation to the Bot
                let data;
                data ={
					"action":"serviceRequestCallback",//NO I18N
                    "serviceObject":sdpToJSON({"isCreated":true,"woID":$req.form.woID}),//NO I18N
                    "service":$req.form.integrationService //No I18N
                }
                sdpAjax({
                    type: "POST",//NO I18N
                    async:false,
                    data:data,
                    url:`/ExternalIntegration.do?serviceName=pluginZia`
                });

                window.close();
            }else{
				try{
				if($req.form.fromSpace){
					$RFPreview.close();
					if($req.form.fromSpace=="details"){
						$sDetails.handlePostRequestCreation();
					}
					else if($req.form.fromSpace=="tree"&&$req.form.spaceID){
						$spaceTree.handlePostRequestCreation($req.form.spaceID);
					}
					return;
				}
				if($req.form.fromProject){ return; }
				if($req.form.fromCMDB){
					$RFPreview.close();
					assetsObj.loadCMDBRelatedFilesThenExecuteMethod("$ciAssociation.handlePostRequestCreation");    //No I18N
					return;
				}
				}
				catch(e){
				}
				const externalFrameUrl = (window.externalframe) ? "&externalframe=true" : ""; //NO I18N
				window.location.href = "/WorkOrder.do?woMode=viewWO&woID=" + $req.form.woID + externalFrameUrl;    //No I18N
			}
		}, 10);
	},

	/**
	 * performs the actions required on resetting the form
	 */
	resetForm:  function() {
		/** resets the suggestion viewed flag */
		this.suggestion_seen = false;
		/** resets the FAFR executed flag for solution popup SD-124890*/
		this.isFAFRExecuted = false;
		/** resets the zia suggestion */
		this.zia_properties = {};
		this.fullAsset=false;

		/** resets all the status change forms */
		$req.common.resetStatusCommentForm();
		$req.common.resetOnHoldForm();
		$req.common.resetCloseForm();

		/** Reset the Requestor UI */
		$req.form.renderUserInfo();

		/** resets the cost details and the cart details */
		jQuery(document).off("click.close_slalist");	//No I18N
		jQuery(window).off("scroll.rf_sticky_header");	//No I18N
		if(this.is_service_template && !this.isAddIn) {
			this.renderCostEstimation();
			this.renderServiceBand();
			this.sla = {};
		}
		if(this.ref){
			if(this.edit_mode ){
				this.ref.description.request && $rf.safeSetFieldValue("description", this.ref.description.request);	//No I18N
				this.ref.resolution.request && $rf.safeSetFieldValue("resolution.content", this.ref.resolution.request);	//No I18N
			}else{
				this.ref.description.template && $rf.safeSetFieldValue("description", this.ref.description.template);	//No I18N
				this.ref.resolution.template && $rf.safeSetFieldValue("resolution.content", this.ref.resolution.template);	//No I18N
			}
		}
		if($req.form.fromSpace){
			try{
				$rf.setFieldValue("space",[{"id":$req.form.spaceID,"name":$req.form.spaceID}]); //No I18N
			}
			catch(e){
			}
		}
		//NOT NEEDED FOR Maintenance
		if(!$req.form.isMaintenance){
		/** Execute on form load fafr rules on form reset */
		$se.addRulesToForm();
		}
	},

	/**
	 * performs the actions on cancelling the form
	 */
	cancelForm: function(form) {
		if(this.mode === "view") {
			return;
		}
		var isEditForm = this.edit_mode, woID = this.woID, chatID = this.chatID, isMaintenance = this.isMaintenance;
		//SD-131227: On Cancelling the Request form if it is opened from Templates page, then redirect to same page with category.
		var params = new URLSearchParams(window.location.search);
		var module = params.get('module'); //NO I18N
		var from = params.get('from'); //NO I18N
		var serviceCategoryId = params.get('requestServiceId'); //NO I18N

		this.destroyForm(undefined, false);

		if(minpreview) {
			if(this.isFromZiaBot) {
				ziabot.closeRequestPreview();
				var parentFrame = $previewComponent.iframeActiveParent()
                				parentFrame.ziaskills.sendMessage("stop"); // NO I18N
			}
			else if(this.isFromIntegrationBot){
				//if the request is created from Slack Integration Bot(using Zia) , then we callback the service that request is cancelled.
                let data;
                data ={
					"action":"serviceRequestCallback",//NO I18N
                    "serviceObject":sdpToJSON({"isCreated":false}),//NO I18N
                    "service":$req.form.integrationService //No I18N
                }
                sdpAjax({
                    type: "POST",//NO I18N
                    async:false,
                    data:data,
                    url:`/ExternalIntegration.do?serviceName=pluginZia`
                });

                window.close();
            }
			else {
			$RFPreview.close();
			}
			return;
		}
		if(this.isAddIn){
			externalCallback("request_listview");//No I18N
			return;
		}
		if(window.externalframe) {
			// when application is loaded via externalframe then redirect it to request details page instead
			var url = "/WOListView.do?externalframe=true";    //No I18N
			var toPage = "requests-list";    //No I18N
			if(isEditForm) {
				if(window.fromPage === "reqDetails") {
					url = "/WorkOrder.do?woMode=viewWO&woID=" + woID+"&externalframe=true";    //No I18N
					toPage = "requests-details";    //No I18N
				}
			}
			$spa.navigate(url, "requests", toPage); //No I18N
			return ;
		}
		// Reset the zia suggestions
		this.zia_properties = {};
		if(isEditForm) {
			if(isMaintenance){
				if(fromMaintenanceDetails){
					$spa.navigate('/ui/maintenances?mode=details&id='+woID,'maintenances','maintenances-details'); //NO I18N
				}else{
					$spa.navigate('/ui/maintenances?mode=list','maintenances','maintenances-list'); //NO I18N
				}
				return;
			}
			var url = "WOListView.do";	//No I18N
			var toPage = "requests-list";	//No I18N
			if(window.fromPage === "reqDetails") {
				url = "/WorkOrder.do?woMode=viewWO&woID=" + woID;	//No I18N
				toPage = "requests-details";	//No I18N
			}
			$spa.navigate(url, "requests", toPage);	//No I18N
		} else {
			if(isMaintenance){
				$spa.navigate('/ui/maintenances?mode=list','maintenances','maintenances-list'); //NO I18N
			}
			else{
			// SD-101627 if there is no history will redirect to WOListView.do
			if(!window.history.state){
				window.location.href = "/WOListView.do";
			}
			else if(from == 'Templates' && module && serviceCategoryId){
			    //SD-131227 : On Cancelling the Request form if it is opened from Templates page, then redirect to same page with category.
			    window.location.href = "/Templates.do?module="+module+"&serviceId=" + serviceCategoryId; //No I18N
			}
			else {
				window.history.back();
			}
		}
		}
	},

	/**
	 * returns if the current user can edit the given field
	 */
	canEditFields: function(fname, field) {
		if(!fname) {
			return;
		}
		var fafr_key = field.fafr_key;
		return $req.common.canEditField(fname, fafr_key);
	},

	/**
	 * IMPORTANT NOTE : The below method is just to convert the servlet allowed values to the api format - Only for Development purpose
	 * ----- Should be removed -----
	 */
	processAllowedValues: function(fieldObj) {
		var self = this;
		if(fieldObj.APPROVERS){
			self.approver_allowed_values = [];
		}
		for(var key in fieldObj) {
			var fname = null;
			if(key === "CATEGORY" || key === "SUBCATEGORY" || key === "ITEM" || key === "SITE" || key === "GROUP" || key === "TECHNICIAN" || key === "EMAILCC" || key === "STATUS" || key === "SPACE" || key === "IMAGE_TOKEN"  || key === "CONFIGURATION_ITEMS") {
				(key === 'IMAGE_TOKEN') && ($req.common.image_token_for_qstn_edit = fieldObj.IMAGE_TOKEN);
				continue;
			}
			for(var field in $rf.fields) {
				if($rf.fields[field].fafr_key === key) {
					fname = field;
					break;
				}
			}
			if(fname === null) {
				continue;
			}
			/* Special handling : adding image_token in fields for resource questions */
			if(fieldObj.IMAGE_TOKEN){
			    $rf.fields[fname].image_token = fieldObj.IMAGE_TOKEN;
			}
			$rf.allowedValues[fname] = [];
			if(fieldObj[key].AllowedValues && Array.isArray(fieldObj[key].AllowedValues)) {
					jQuery.each(fieldObj[key].AllowedValues, function(index, item){
						var id = item.id;
						if(fname.indexOf("udf_") > -1) {
							if($rf.fields[fname].display_type === "CheckBox"){
								$rf.fields[fname].maxvalues = self.ssp.checkbox_resource_question_max_options_selected;
							}
						if(($rf.fields[fname].display_type === "CheckBox" || $rf.fields[fname].display_type === "Radio") && id == "0") {
								return;
							}
						}
					var allowedvalue = item.name;
					if(item.value){
						allowedvalue = item.value;
						}
					//Removed the code to support {id: "_" , name: "_"} format
					var option = {
						id: id,
						name: allowedvalue
					};
					option = jQuery.extend(item, option);
					if(typeof allowedvalue === "object") {
						for(var optionkey in allowedvalue) {
							if(optionkey === "value") {
								option.name = allowedvalue.value;
							} else {
								option[ optionkey ] = allowedvalue[ optionkey ];
							}
						}
						if(allowedvalue.hasOwnProperty("sort_index") > -1) {
							sort_available = true;
						}
					}
					if(fname === "approvers"){
						self.approver_allowed_values.push(option);
					}
					$rf.allowedValues[fname].push(option);
					});
				}
		}
	},
	/**
	 * constructs the date arguments for the mehtod - initCalendar
	 */
	constructDateArgs: function() {
		return {
			displayTime: arguments[0],
			format: arguments[1],
			callback: arguments[2],
			cbArgs: arguments[3],
			validateFunction: arguments[4],
			validateContext: arguments[5],
			validateArguments: arguments[6],
			showNow_Today: arguments[7],
			setHrsMins: arguments[8],
			hideTime: arguments[9]
		};
	},

	/**
	 * Get the open status name
	 */
	getOpenStatus: function(){
		var status = $req.form.statuses || [];
		var openStatus ={};
		for (var i = status.length - 1; i >= 0; i--) {
			if(status[i].internal_name === "Open"){ // NO I18N
				openStatus =status[i];
			}
		}
		return openStatus;
	},
	errorInterrupt:function(data, _form){
		if(data && data.response_status && data.response_status.messages && data.response_status.messages.length){
			var message = data.response_status.messages[0];
			if(message.status_code === 4012 &&  message.field && (message.field==="status_change_comments" || message.field==="note_comments")){ // No I18N
				return false;
			} else if(message.status_code === 4001 &&  message.field==="attachments") { // No I18N
			    //subrequest error message is handled for attachments alone, add handling for other fields if required.
			    data.response_status.messages[0].message = translate("apicodes.4001");
                return true;
			}
		}
		return true;
	},
	handleError:function(data, form){
		var self = this;
    	self.isFAFRExecuted = false; // SD-129801
		var status_id = self.request_info && self.request_info.status ? self.request_info.status.id : null;
		if(data && data.response_status && data.response_status.messages && data.response_status.messages.length){
			var message = data.response_status.messages[0];
			if(message.status_code === 4012 &&  message.field ){ //No I18N
				if( message.field==="status_change_comments"){ // NO I18N
					$req.common.promptStatusCommentForm(status_id, form.fields.values.status);
				}else if(message.field==="note_comments"){ // NO I18N
					$req.common.promptRLCNotes();
				}else{
					responseText = resp.response_status;
					if(responseText && responseText.messages && responseText.messages[0].message){
						showalert('failure', e_html(responseText.messages[0].message),"isAutoHide=true"); // No I18N
					}
				}
			}
		}
	},
	/**
	 * @param {string} fieldName Name of the field, it should requester or on_behalf_of
	 */
	populateApproverFieldOptions: function(fieldName) {
		var allowedValues = jQuery.extend(true, [], this.approver_allowed_values);
		var itemValue = $rf.fields[fieldName].current_value || {};
		var isNewUser = $rf.fields[fieldName].current_value && $rf.fields[fieldName].current_value.isTag;
		/** A hook for update the allowed of approver to the form component */
		var updateAllowedValues = function(allowedValues) {
			$rf.allowedValues.approvers = allowedValues;
			$rf.addAllowedValues("approvers", 0); // NO I18N
		};
		/**
		 * If the user is requester, then we need to construct allowed values from allowed values servlet
		 */
		if (
			(fieldName === "requester" && window.sdp_user.USERTYPE == "Requester") || (fieldName === "on_behalf_of" && !$rf.fields.values.on_behalf_of)) { // NO I18N
			jQuery.each(allowedValues, function(index, item) {
				if (item.info) {
					item.display_name = item.name + " " + item.info;
				}
			});
			updateAllowedValues(allowedValues);
		} else if (itemValue && itemValue.id && !isNewUser) {
			/**
			 * For Technician, we need to call /servlet/AJaxServlet?action=getUserDetails
			 * For OBO users, we need to call /servlet/AJaxServlet?action=getOBOUserDetails
			 */
			var actionName = fieldName === "requester" ? "getUserDetails" : "getOBOUserDetails"; // NO I18N
			var url = "/servlet/AJaxServlet?action=" + actionName + "&search=" + itemValue.name + "&reqId=" + itemValue.id; // NO I18N
			jQuery.ajax({
				url: url,
				success: function(data) {
					/**
					 * Since the response of the servlet is very old and
					 * Format is not proper JSON, so we need to convert the lazy JSON into proper JSON
					 */
					var userRoles = data.replace(/(['"])?([a-z0-9A-Z_]+)\s?(['"])?:/g, '"$2": ');
					userRoles = JSON.parse(userRoles);
					var orgRoles = userRoles.USER_ORGROLES;
					for (var index = 0; index < allowedValues.length; index++) {
						var item = allowedValues[index];
						if(item.id.includes("_orgRoleId")){
							var id = item.id.replace("_orgRoleId", "");
							if (item.id && orgRoles[id]) {
								allowedValues[index].display_name = allowedValues[index].name + " " + orgRoles[id];
							}
						}
						else {
							allowedValues[index].display_name = allowedValues[index].name + " " + allowedValues[index].info;
						}
					}
					jQuery.each(allowedValues, function(index, item) {
					// ReportingTo, DEPT_HEAD is not in the USER_ORGROLES, so we need add them manually
						switch (item.name) {
							case "$REPORTING_TO$": // NO I18N
								if (userRoles["USER_REPORTUSER"]) {
									item.display_name = item.name + " [" + userRoles["USER_REPORTUSER"] + "]"; // NO I18N
									if(userRoles["USER_REPORTUSEREMAIL"]) {
										item.display_name += " [" + userRoles["USER_REPORTUSEREMAIL"] + "]"; // NO I18N
									}
									if(userRoles["USER_REPORTUSERDEPT"]) {
										item.display_name += " [" + userRoles["USER_REPORTUSERDEPT"] + "]"; // NO I18N
									}
								}
								break;
							case "$DEPT_HEAD$": // NO I18N
								if (userRoles["USER_DEPTHEADUSER"]) {
									item.display_name = item.name + " [" + userRoles["USER_DEPTHEADUSER"] + "]"; // NO I18N
									if(userRoles["USER_DEPTHEADUSEREMAIL"]) {
										item.display_name += " [" + userRoles["USER_REPORTUSEREMAIL"] + "]"; // NO I18N
									}
									if(userRoles["USER_DEPTHEADUSERDEPT"]) {
										item.display_name += " [" + userRoles["USER_REPORTUSERDEPT"] + "]"; // NO I18N
									}
								}
								break;
							default:
						}
					});
					updateAllowedValues(allowedValues);
				}
			});
		} else {
			updateAllowedValues(allowedValues);
		}
	},
	onApproverChange: function() {
		var self = this;
		if (window.sdp_user.USERTYPE === "Requester") {
			/** This function is necessary to update already selected field, if the obo was changed */
			var field = $rf.fields.values.on_behalf_of ? "on_behalf_of" : "requester"; // NO I18N
			setTimeout(function() {
				self.populateApproverFieldOptions(field);
			}, 0);
		}
	},
	// SD-95705 Editor is not loaded properly for request edit when description or resolution field contains huge content.
	// Due to performance issue, we are load the description and resoltion after the form is loaded.
	setEditorContent: function(){
		// safe checks to revert the values of description and resolution
		if(this.ref.description){
			if(this.ref.description.template){
				this.template.request.description = this.ref.description.template;
			}
			if(this.ref.description.request){
				this.request_info.description = this.ref.description.request;
			}
		}
		if(this.ref.resolution){
			if(this.ref.resolution.template){
				this.template.request.resolution.content = this.ref.resolution.template;
			}
			if(this.ref.resolution.request){
				 this.request_info.resolution.content = this.ref.resolution.request;
			}
		}

		if (this.request_description) {
			try {
				$rf.safeSetFieldValue("description", this.request_description); // No I18N
				$rf.fields.description.value = this.request_description;
				$rf.fields.changed.splice($rf.fields.changed.indexOf("description"),1); // NO I18N
				this.request_description = null;
			} catch (error) {}
		}
		if (this.request_resolution) {
			try {
				$rf.safeSetFieldValue("resolution.content", this.request_resolution); // No I18N
				$rf.fields["resolution.content"].value = this.request_resolution;
				$rf.fields.changed.splice($rf.fields.changed.indexOf("resolution.content"),1); // NO I18N
				this.request_resolution = null;
			} catch (error) {}
		}
	},
	/**
	 * @param {boolean} canShow If we want to show the skeleton loader
	 * then pass canShow true otherwise canShow will be false by default.
	 */
	skeletonLoader: function(canShow){
		// @TODO : Do the Skeleton Loader

	},
	/**
	 * A safety helper to ensure the editor refreces.
	 */
	ensureEditorRef: function(){
		var self = this;
		if(self.ref){
			if(self.ref.description){
				if(!self.ref.description.hasOwnProperty("request")){ //NO I18N
					self.ref.description.request = null;
				}
				if(!self.ref.description.hasOwnProperty("template")){ //NO I18N
					self.ref.description.template = null;
				}
			}else{
				self.ref.description = {
					template: null,
					request: null
				}
			}
			if(self.ref.resolution){
				if(!self.ref.resolution.hasOwnProperty("request")){ //NO I18N
					self.ref.resolution.request = null;
				}
				if(!self.ref.resolution.hasOwnProperty("template")){ //NO I18N
					self.ref.resolution.template = null;
				}
			}else{
				self.ref.resolution={
					template: null,
					request: null
				}
			}
		}
	},
	/**
	 * Open the space selection popup
	 */
	 openSpacePopup: function() {
		$req.common.spacePopup.open({
			selected: $rf.fields.space.current_value,
			maximumSelectionSize: this.ssp.max_number_of_spaces_per_request?this.ssp.max_number_of_spaces_per_request:25,
			onSelect: function(value){
				value = value.map(function(item){
					return item+""; // NO I18N
				});
				try{
					$rf.setFieldValue("space", value, "id"); // NO I18N
				}catch (error) {
					$req.form.handleError(error);
				}
			}
		})
	},

	switchMaintenanceTabs: function(toActivateTab,toHideTab) {
		var self=this;
		var jBody = jQuery("body");
		if(toActivateTab=="schedule-tab"){
			if(!self.edit_mode){
			if(self.is_service_template) {
				jQuery("#rf-template-service-list").select2("disable");	//No I18N
			} else {
				jQuery("#rf-template-incident-list").select2("disable");	//No I18N
			}
			}
			jBody.find('[data-name="schedule-form-footer"]').removeClass('hide');
			if(!self.isMaintenanceSchedulerInitialized){
				var options = {"repeats": {  //No I18N
    			"show": true,    //No I18N
    			"mandatory": true,   //No I18N
    			"display_name": translate("schedule.repeats"), //No I18N
    			"default_value": "once", //No I18N
    			"values": [  //No I18N
					{"id": "once", "text": translate("common.once")},  //No I18N
					{"id": "daily", "text": translate("common.daily")},    //No I18N
					{"id": "weekly", "text": translate("common.weekly")},  //No I18N
					{"id": "monthly", "text": translate("sdp.inventory.detailAsset.DepreciationMonthly")},     //No I18N
					{"id": "yearly", "text": translate("common.yearly")}  //No I18N
				]
				},
				"run_every": {   //No I18N
    			"on_the": {  //No I18N
    				"week": {   //No I18N
    					"values": [    //No I18N
    						{"id":"1", "text": translate("sdp.common.first")},    //No I18N
    						{"id":"2", "text": translate("common.second")},   //No I18N
    						{"id":"3", "text": translate("common.third")},    //No I18N
    						{"id":"4", "text": translate("common.fourth")}   //No I18N
    					]
    				}
    			}
    		},"to": {"show": false},"all_day": {"show": false}}; //No I18N
				if(!self.edit_mode || (self.edit_mode&&self.entitydata.maintenancestate=='2') || (self.edit_mode&&self.entitydata.maintenancestate=='0'&&!$maintenance.resumeConfirmPopup.isResumeAllowed(self.schedule_info)) ){
					options.mode="new"; //No I18N
				}
				else{
					options.mode="edit"; //No I18N
				}
				options.returnDateInServerTimeZone=true;
				self.maintenanceScheduler=new scheduleAPI('[data-name="schedule-container"]', options); //NO I18N
				self.isMaintenanceSchedulerInitialized=true;
				if(self.edit_mode&&self.schedule_info){
					var smode= (self.entitydata.maintenancestate=='2'||self.entitydata.maintenancestate=='0'&&!$maintenance.resumeConfirmPopup.isResumeAllowed(self.schedule_info)) ? "new" : "edit"; // No I18N
					self.maintenanceScheduler.update(self.schedule_info,smode);
				}
			}
			jBody.find("#maintenanceFormToggleTabs li, #formfield-tab").removeClass("active");
			jBody.find("a[href=#schedule-tab]").closest("li").addClass("active"); //NO I18N
			jBody.find("#schedule-tab").addClass("in active");
			jBody.find("#formfield-tab").removeClass("in active");
		}
		else{
			if(!self.edit_mode){
			if(self.is_service_template) {
				jQuery("#rf-template-service-list").select2("enable");	//No I18N
			} else {
				jQuery("#rf-template-incident-list").select2("enable");	//No I18N
			}
			}
			jBody.find("#maintenanceFormToggleTabs li, #schedule-tab").removeClass("active");
			jBody.find("a[href=#formfield-tab]").closest("li").addClass("active"); //NO I18N
			jBody.find("#formfield-tab").addClass("in active");
			jBody.find("#schedule-tab").removeClass("in active");
		}
			jQuery("html, body").animate({
				scrollTop : 1
			},300).scrollTop(0);	// Issue ID - 104843
	},

	saveSchedule: function() {
		var self=this;
		var data = self.maintenanceScheduler.getData();
		if(!data){
			return;
		}
		else{
			var submitData = {"request_maintenance":{}}; //NO I18N
			var saveData = {};
			var reqFormData = {};
			if(!self.edit_mode) {
				reqFormData = $rf.serialize(); //$rf.getChangedValues();
			} else {
				reqFormData = $rf.getChangedValues();
			}
			if(reqFormData&&!jQuery.isEmptyObject(reqFormData)){
				$rf.processPayload(reqFormData);
				saveData.request=reqFormData;
				saveData=self.reviseUpdateInfo(saveData);
				submitData.request_maintenance = saveData.request;
			}
			if(!self.edit_mode || self.edit_mode&&(data.ischanged||self.entitydata.maintenancestate=='2' || (self.entitydata.maintenancestate=='0'&&!$maintenance.resumeConfirmPopup.isResumeAllowed(self.schedule_info)) ) ) {
				if(data.hasOwnProperty("ischanged")){
					delete data["ischanged"];
				}
				submitData.request_maintenance.scheduler = jQuery.extend(true,{},data);
				submitData.request_maintenance.scheduler.schedule_name = "ScheduledRequest"; //NO I18N
			}
			submitData.request_maintenance.name=jQuery('#templName').val();
			submitData.request_maintenance.comments=jQuery('#templDesc').val();
			var strJson = sdpToJSON(submitData);
			var inputData = {
				input_data: strJson
			};
			jQuery('#maintenanceFormSubmitBtn').attr("disabled",true); //NO I18N
			sdpAjax({
				url: "/api/v3/request_maintenances"+(self.edit_mode?"/"+self.woID:""), //NO I18N
				data: inputData,
				type: (self.edit_mode?"PUT":"POST"), //NO I18N
				success: function(responseJson) {
					if (responseJson) {
						if(!self.edit_mode) {
							window.showalert("success", translate("api.added.success", [ translate("common.maintenance") ]), "isAutoHide=true");	//No I18N
						} else {
							window.showalert("success", translate("api.updated.success", [  translate("common.maintenance") ]), "isAutoHide=true");	//No I18N
						}
					}
					$req.form.destroyForm(undefined, false);
					$spa.navigate('/ui/maintenances?mode=details&id='+responseJson.request_maintenance.id,'maintenances','maintenances-details',true); //NO I18N
				},
				error: function(data)
				{
					jQuery('#maintenanceFormSubmitBtn').attr("disabled",false); //NO I18N
					try
					{
						var entityName = $rf.options && $rf.options.entityName ? $rf.options.entityName : translate("form.data");	//No I18N
						var formatError = function(errObj, haveID) {
							if(errObj.status_code === 4004) {
								return e_html(errObj.message);
							}
							if(errObj.status_code === 4510) {
								if(errObj.message) {
									return e_html(errObj.message);
								} else {
									return $rf.mode === "new" ? translate("api.added.failure", [ entityName ]) : translate("api.updated.failure", [ entityName ]);	//No I18N
								}
							} else {
								var fields = errObj.fields;
								if(!fields && errObj.field) {
									fields = [errObj.field];
								}
								var fieldArr = [], fieldTitle;
								if(fields) {
									for(var i = 0, len = fields.length; i < len; i++) {
										var fname = fields[i];
										fieldTitle = fname;
										if($rf.fields[fname]) {
											fieldTitle = $rf.fields[fname].title;
										}
										// @TODO: The only UDF checks in the Form Component, Try to Avoid It
										if(fname.indexOf("udf_") !== -1 && $rf.fields["udf_fields."+fname]){
											fieldTitle =$rf.fields["udf_fields."+fname].title;
										}
										if(fname == "name"){
											fieldTitle = translate("sdp.common.title");
										}
										if(fname == "module"){
											continue;
										}
										if(fieldTitle) {
											fieldArr.push(e_html(fieldTitle));
										}
									}
								}
								if(errObj.message) {
									var errorMsg = e_html(errObj.message);
									if(fieldArr.length > 0) {
										errorMsg += " : <strong>" + fieldArr.join(", ") + "</strong>";	//No I18N
									}
								} else {
									var errorMsg = translate("common.update.fields.failed");	//No I18N
									if(errObj.status_code === 4001) {
										errorMsg = translate("common.fields.invalid");	//No I18N
									}
									if(fieldArr.length > 0) {
										errorMsg += " : <strong>" + fieldArr.join(", ") + "</strong>";	//No I18N
									}
								}
								return errorMsg;
							}
						};
						data = data.responseJSON;
						if(data && data.response_status && data.response_status.messages) {
							var errmsg = formatError(data.response_status.messages[0]);
							window.showalert("failure", errmsg, "isAutoHide=false");	//No I18N
							var errobj = data.response_status.messages[0];
							/**
							 * If server throws error on mandatory field, check if field is hidden and show the field.
							*/
							if(errobj.status_code == "4012" && errobj.fields) {	//No I18N
								for(var i = 0; i < errobj.fields.length; i++) {
									if(errobj.fields[i].indexOf("udf") != -1 && !$rf.fields[errobj.fields[i]]) {
										errobj.fields[i] = "udf_fields." + errobj.fields[i];	//No I18N
									}
									if($rf.fields[errobj.fields[i]].mandated_by && $rf.fields[errobj.fields[i]].mandated_by[0] == "template" && $rf.fields[errobj.fields[i]].mandate_removed_by == "hidden_rule") {	//No I18N
										$rf.showField(errobj.fields[i]);
										jQuery(window).scrollTop(jQuery("[data-fname='" + errobj.fields[i] + "']").offset().top);	//No I18N
									}
								}
							}
						} else if(data && data.response_status && data.response_status.constructor === Array) {
							var successIds = [];
							// var errosrMsgs = ["<b>" + translate("form.update.failed.message") + " " + $rf.options.entityName + "</b>"];	//No I18N
							var errosrMsgs = [];
							for(var i = 0, len = data.response_status.length; i < len; i++) {
								if(data.response_status[i].status == "success") {	//No I18N
									successIds.push("#" + data.response_status[i].id);	//No I18N
								} else {
									var err = formatError(data.response_status[i].messages[0], data.response_status[i].id);
									//If id present, add in error
									data.response_status[i].id ? errosrMsgs.push("<b>#" + data.response_status[i].id + "</b> : " + err) : errosrMsgs.push(err);	//No I18N
								}
							}
							if(successIds.length) {
								window.showalert("success", "<strong>" + successIds.join(", ") + "</strong> " + getMessageForKey("sdp.requests.editrequest.bulkeditsuccessmsg"), "isAutoHide=true, delay=15");	//No I18N
							}
							if(errosrMsgs.length > 5) {
								if(!jQuery("#fc-alert").length) {
									jQuery("body").append('<div id="fc-alert"></div>');	//No I18N
								}
								setTimeout(function() {
									var err_txt = errosrMsgs.join("<br/><br/>");	//No I18N
									jQuery("#fc-alert").empty().html('<div class="p20">'+ err_txt +'</div>');	//No I18N
									jQuery("#fc-alert").dialog({	//No I18N
										title: "",
										modal: true,
										autoOpen: true,
										width: screen.width * 0.5,
										maxHeight : screen.height * 0.6,
										height: "auto",	//No I18N
										resizable: false,
										open: function(event, ui) {
											jQuery("body").addClass("atp-open");	//No I18N
											jQuery(this).closest(".ui-dialog").find(".ui-dialog-title").html('<span class="cspr failure1 icon-lg mr5"></span>&nbsp;'+getMessageForKey("sdp.requests.newrequest.updatefailuremsg"));	//No I18N
											jQuery(this).closest(".ui-dialog").find(".ui-dialog-titlebar").addClass('alert-danger');	//No I18N
										},
										close: function(event, ui) {
											jQuery("body").removeClass("atp-open");	//No I18N
										}
									})
								}, 100);
							} else if(errosrMsgs.length) {
								window.showalert("failure", "<div>"+ errosrMsgs.join("<br/>") +"</div>", "isAutoHide=false");	//No I18N
							}
						} else {
							if($rf.mode === "new") {
								window.showalert("warning", translate("api.added.failure", [ entityName ]), "isAutoHide=true, delay=15");	//No I18N
							} else {
								window.showalert("warning", translate("api.updated.failure", [ entityName ]), "isAutoHide=true, delay=15");	//No I18N
							}
						}
					}
					catch(e)
					{
					}
				}
			});
		}
	},

	setModeAsChat: function() {
        //The display name for Chat mode is got via API call, Since it cannot be retrieved from allowed values as display names would change.
        var criteria = {"list_info":{"search_criteria":{"field":"internal_name","condition":"is","value":"Chat"}}}; //No I18N
        sdpAjax({
            url: '/api/v3/requests/mode/', // No I18N
            type: 'GET', // No I18N
            async: true,
            cache: false,
            data: {input_data: sdpToJSON(criteria)},
            success: function success(data) {
                if(data.mode && data.mode.length === 1){
                    $rf.setFieldValue("mode", data.mode[0].name); // NO I18N
                }
            },
            error: function() {
                return false;
            }
        });
    },

    registerPartialTemplatesForWOForm: function() {
        Handlebars.registerPartial("rf-requester-info-template", renderhbs(null, 'rf-requester-info-template', null, false, 'requests/form', null, null, null, true));	//No I18N
        Handlebars.registerPartial("rf-userdetails-template", renderhbs(null, 'rf-user-details-template', null, false, 'requests/form', null, null, null, true));	//No I18N
        Handlebars.registerPartial("rf-tasks-template", renderhbs(null, 'rf-tasks-template', null, false, 'requests/form', null, null, null, true));	//No I18N
        Handlebars.registerPartial("rf-resolution-template", renderhbs(null, 'rf-resolution-template', null, false, 'requests/form', null, null, null, true));	//No I18N
        Handlebars.registerPartial("rf-update-reason-template", renderhbs(null, 'rf-update-reason-template', null, false, 'requests/form', null, null, null, true));	//No I18N
        Handlebars.registerPartial("rf-req-close-form-footer", renderhbs(null, 'rf-req-close-form-footer', null, false, 'requests/form', null, null, null, true));	//No I18N
        Handlebars.registerPartial("rf-req-onhold-form-template", renderhbs(null, 'rf-req-onhold-form-template', null, false, 'requests/form', null, null, null, true));	//No I18N
        Handlebars.registerPartial("rf-status-change-comment-template", renderhbs(null, 'rf-status-change-comment-template', null, false, 'requests/form', null, null, null, true));	//No I18N
        Handlebars.registerPartial("form-helpcontent-template", renderhbs(null, 'rf-form-help-content-template', null, false, 'requests/form', null, null, null, true));	//No I18N
        Handlebars.registerPartial("servicesla-list-template", renderhbs(null, 'rf-service-sla-list-template', null, false, 'requests/form', null, null, null, true));	//No I18N
    },
    bindEvents: {
        jspEvents: function() {
            //These elements will be added only for the maintenance tab alone.
            if(isMaintenance){
                jQuery('#maintenance-name-form').off('submit').on('submit', false); //No I18N
                jQuery("#maintenanceFormToggleTabs [data-name=formfield-tab-anchor]").off('click').on('click', (event) => { //No I18N
                    $req.form.switchMaintenanceTabs('formfield-tab','schedule-tab');
                });
                jQuery("#maintenanceFormToggleTabs [data-name=schedule-tab-anchor]").off('click').on('click', (event) => { //No I18N
                    FC.submit('form_req-form', event);
                    return false;
                });
                jQuery("#maintenanceFormPreviousBtn").off('click').on('click', (event) => { //No I18N
                    jQuery('[data-name=formfield-tab-anchor]').trigger('click');
                });
                jQuery("#maintenanceFormSubmitBtn").off('click').on('click', () => {$req.form.saveSchedule()}); //No I18N
                jQuery("#maintenanceFormCancelBtn").off('click').on('click', () => {$req.form.cancelForm()}); //No I18N
            }
            jQuery('#req-form').off('submit').on('submit', false); //No I18N
        },
        templates: {
            rf_cost_estimation_template: function() {
                jQuery('#sc-csum-showmore-label').off('click').on('click', (event) => { //No I18N
                    jQuery('#sc-csum-items > .bottom-res-list-item').removeClass('hide');
                    jQuery(event.currentTarget).remove();
                });
            },
            /* Using Event delegation for this template as this is dynamic and can be frequently modified */
             rf_cost_item_list_template: function() {
                jQuery("#sc-cart-items-ul").off('click').on('click', '.res-preview-deletebtn', function(event) {
                    let eleDataset = event.currentTarget.dataset;
                    $req.form.unsetResourceItem(eleDataset.id, eleDataset.optionId, event);
                });
            },
            rf_req_close_form_footer: function() {
                jQuery("#close-form [name=close-form-update]").off('click').on('click', (event) => {
                    $req.common.updateCloseForm();
                });
                jQuery("#close-form [name=close-form-cancel]").off('click').on('click', (event) => {
                    $req.common.closeCloseForm();
                });
            },
            rf_req_onhold_form_template: function(){
                jQuery("#onhold-sch-edit").off('click').on('click', (event) => { //No I18N
                    $req.common.showOnHoldForm();
                });
                jQuery("#enable-onhold-sch").off('click').on('click', (event) => { //No I18N
                    $req.common.toggleOnHoldScheduleForm(event.currentTarget);
                });
                jQuery("#onhold-form [name=onhold-sch-update]").off('click').on('click', (event) => {
                    $req.common.updateOnHoldForm();
                });
                jQuery("#onhold-form [name=onhold-sch-cancel]").off('click').on('click', (event) => {
                    $req.common.closeOnHoldForm();
                });
            },
            rf_requester_info_template: function() {
                jQuery("#rf-requester-info [data-name=associatemoreassets]").off('click').on('click', (event) => { //No I18N
                    $req.form.openAssetModuleList();
                    return false;
                });
                /* Partial template included in rf-requester-info-template. So invoking it here. */
                this.rf_user_details_template();
            },
            rf_status_change_comment_template: function() {
                jQuery("#statuscomment-form [name=status-change-cmt-update]").off('click').on('click', (event) => {
                    $req.common.updateStatusCommentForm();
                });
                jQuery("#statuscomment-form [name=status-change-cmt-cancel]").off('click').on('click', (event) => {
                    $req.common.closeStatusCommentForm();
                });
            },
            rf_user_details_template: function() {
                for(let field of $rf.layouts[0].sections[0].columns[0].fields){
                    if(['requester', 'on_behalf_of'].includes(field.name) && ('requester' != field.name || sdp_user.USERTYPE == 'Technician')){
                        jQuery(`#search-${field.name}-list`).off('click').on('click', (event) => { //No I18N
                            /* Even if the requester is changed, When opening search popup, the search user name will be the initial one (present in entityData) */
                            showUserSearchPopup('Request', true, ($req.form.entitydata && $req.form.entitydata.requester ? $req.form.entitydata.requester.name : ''), 'requests', 'null', field.name); //No I18N
                            return false;
                        });
                    }
                }
                jQuery("[data-id='rf-req_info_btn-requester']").off('click').on('click', (event) => { //No I18N
                    showRequesterRequests();
                    return false;
                });
                jQuery("[data-id='rf-req_info_btn-on_behalf_of']").off('click').on('click', (event) => { //No I18N
                    showRequesterRequests();
                    return false;
                });
                jQuery("#rf-more_info_btn").off('click').on('click', (event) => { //No I18N
                    let eleDataset = event.currentTarget.dataset;
                    let selector = "REQUESTER", fieldName = "requester";
                    eleDataset.fieldSelector === "REQUESTER.OBO" && (selector = "REQUESTER.OBO", fieldName = "on_behalf_of");
                    showUserDetailsBasedOnAllowedValues(`[data-field='${selector}']`, fieldName);
                });
            },
            rf_header_template: function() {
                jQuery("#back_to_rlv").off('click').on('click', () => { //No I18N
                    $req.form.cancelForm();
                    event.preventDefault();
                });
            },
            rf_service_band_template: function() {
                jQuery("#servicesla-selected").off('click').on('click', () => { //No I18N
                    $req.form.showSLAList();
                    return false;
                });
                jQuery("#submitFromViewDetails").off('click').on('click', () => { //No I18N
                    $req.form.manualSubmit();
                });
                jQuery("#servicesla-changecomment-dialog [data-name='sla-change-cmt-update']").off('click').on('click', () => { //No I18N
                    $req.form.updateSLAComment();
                    return false;
                });
                jQuery("#servicesla-changecomment-dialog [data-name='sla-change-cmt-cancel']").off('click').on('click', () => { //No I18N
                    $req.form.closeSLAComment();
                    return false;
                });
                /* This will be loaded as partial template. So invoking it from here */
                $req.form.bindEvents.templates.rf_service_sla_list_template();
            },
            rf_service_sla_list_template: function() {
                jQuery("#td_servicesla_select_options").off('click').on('click', '.servicesla_option', (event) => { //No I18N
                    let currentEleDataset = event.currentTarget.dataset;
                    $req.form.selectSLA(currentEleDataset.id , event);
                    event.preventDefault();
                });
            },
            rf_suggestions_template: function(parentEleId = '') {
                jQuery("#suggdropdownlist").off('click').on('click', '[data-action-name=suggestion]', (event) => { //No I18N
                    var currentEle = event.currentTarget;
                    showDetailedViewInDialog('subject', currentEle.id, currentEle.value);
                });
                parentEleId = (parentEleId ? (parentEleId + " ") : "") + "#suggestion-alert-popup";
                jQuery(parentEleId).off('click').on('click', '[data-action-name="view-suggestions"],[data-action-name="submit-request"]', (event) => {
                    let eleDataset = event.currentTarget.dataset;
                    if(eleDataset.actionName == "view-suggestions"){
                        showDetailedViewInDialog('submit', '', null); //No I18N
                    }
                    else{
                        continueRequest(event.currentTarget.id, event);
                        return false;
                    }
                });
            }
        }
    },
	openCIPopupWrapper: () => {
		let confSelectionLimit = $req.form.ssp.max_number_of_conf_items_per_request?$req.form.ssp.max_number_of_conf_items_per_request:25;
        $req.common.openCIPopup(confSelectionLimit);
	}
};
