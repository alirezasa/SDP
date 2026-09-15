// $Id$
var $maintenanceDetails = {
	
	init : function(options){
		jQuery("#maintenance-section").html('<div id="maintenance_detailview" class="fh"><span id="browserTitleInfo" data-module="spaces" data-page="detailsPage" class="hide"><span id="bt_id"></span><span id="bt_title"></span></span></div>');
		this.initialize(options);
		$maintenanceDetails.constructNavigationLinks();
		var promises=[];
		promises.push($maintenanceDetails.getLinksData());
		promises.push($maintenanceDetails.fetchMetaData());
		promises.push($maintenanceDetails.fetchEntityData());
		//promises.push($maintenanceDetails.getSspData());
		promises.push($maintenanceDetails.getPriorityMatrixData());
		promises.push($maintenanceDetails.getPriorityData());
		jQuery.when.apply(this, promises).then(function() {
			$maintenanceDetails.initDetailsComponent();
			jQuery(".page-progressbar").hide(); //No I18N
		});		
	},
	initialize : function(options){
		this.id=options.id;
		this.template=null;
		this.entityFields={};
		this.has_resource = false;
		this.resource_fields=[];
		this.cost = {};
		this.hash_url = window.location.hash?window.location.hash.substring(1):'';
		this.externalframe=options.externalframe;
	},
	initDetailsComponent : function () {
		var _self=this;
		var allowedTabs= $maintenanceDetails.getAllowedTabs();
		var activeTabName="details"; // No I18N
		if(_self.hash_url&&allowedTabs.includes(_self.hash_url))
		{
			activeTabName=_self.hash_url;
		}	
		var detailsConfig = {
			entity_id : _self.id,
			printPreview: false,
			module: "request_maintenance", // No I18N
			$rm : _self,
            data: {
                entity_data: _self.entity_data,
                metainfo: _self.metainfo,
                links: _self.links,
                sdp_user: sdp_user,
				navigationLinks: _self.navigationLinks,
				externalframe: _self.externalframe,
				canShowEdit : ((!_self.links.edit||(_self.links.edit&&(_self.entity_data.maintenancestate=='2'||(_self.entity_data.maintenancestate=='0'&&!$maintenance.resumeConfirmPopup.isResumeAllowed($maintenanceDetails.entity_data.scheduler)))))?false:true)
            },	
			container: "maintenance_detailview", // No I18N
			afterInitialRender : _self.afterInitialRender,
            panel_details: {
                content_panel: {
                    actions_panel: {
                        show: !_self.externalframe,
                        left_panel: {
                            show: !_self.externalframe,
							template_namespace:"maintenance", // No I18N
                            template: "maintenance_actions_template", // No I18N
                            afterRenderfunction: this.afterActionLeftPanelRender
                        },
                        right_panel: {
                            show: true,
							template_namespace:"maintenance", // No I18N
                            template: "maintenance_action_rightpanel_template" // No I18N
                        }
                    },
                    header_panel: {
                        show: true,
                        template: "maintenance_header_template",  // No I18N
						template_namespace:"maintenance", // No I18N
                        "class": "headerbar",  // No I18N
                        afterRenderfunction: this.afterHeaderPanelRender
                    },
                    details_panel: {
                        show: true
                    },
                    tabs_panel: {
                        show: true,
                        name: activeTabName,
                        tabs: allowedTabs,
                        active: activeTabName,
                        type: "tab", // No I18N
						class: "sdtabs-ui2 sdtabs-primary", // No I18N
						tabs_class: "pl20 pr20", // No I18N
						afterRenderfunction: this.gotoActiveTab,
						template_namespace:"maintenance", // No I18N
                        settings: {
                            "details": { // No I18N
                                show: true,
                                display_name: getMessageForKey("common.details"), // No I18N
                                template: "maintenance_details_template", // No I18N								
                                renderfunction: this.loadMaintenanceDetails,
                                afterRenderfunction: this.afterMaintenanceDetailsRender
                            },						
                            "requests": { // No I18N
                                show: true,
                                template: "maintenance_requests_template", // No I18N
                                renderfunction: this.loadRequests,
                                display_name: getMessageForKey("sdp.requests.common.requests") // No I18N
                            },
                            "history": { // No I18N
                                show: true,
                                display_name: getMessageForKey("common.history"),  // No I18N
								href: "/common/ViewHistory.jsp?id="+_self.id+"&module=request_maintenances&key=request_maintenance_history_sort_order&is_new_history=true&is_date_filter=true", //No I18N
                                afterRenderfunction: this.afterTabRenderHistory
                            }
                        }
                    },
                    right_panel: {
                        show: true,
                        toggle: !_self.externalframe,
                        "sections": ["maintenance_right_panel"], // No I18N
                        "settings": { // No I18N
							"maintenance_right_panel":{ // No I18N
								show:true,
								template_namespace:"maintenance", // No I18N
								template:"maintenance_right_panel_template", // No I18N
								afterRenderfunction: this.loadRightPanel
							}
                        }
                    }
                }
            }			
		};
		if(_self.externalframe){
			detailsConfig.panel_details.content_panel.right_panel.show=false;
		}
		if(window.isMSPOrSCP) {
			$mspMaintenanceDetails.modifyDetailsConfig(detailsConfig);
		}
		_self.$detailsComp = new DetailsComponent(detailsConfig, this);
		if(window.isMSP) {
			$mspMaintenanceDetails.setHeaderAccountForEntity(_self.entity_data);
		}
	},
	gotoActiveTab : function(tabName){
     	var _self = this;
        if(!tabName){
            tabName = _self.$detailsComp.options.panel_details.content_panel.tabs_panel.active || "details"; // No I18N
        }
        setTimeout(function(){
	            jQuery("#"+ _self.$detailsComp.options.container).find("[role='tablist']").find("li.active").trigger("click");
	        
        },1);
    },	
	afterInitialRender : function(){
		initTooltip("#maintenance_detailview"); // No I18N
    },	
	getAllowedTabs : function (){
		if(sdp_user.ROLES.indexOf("ViewRequests")>-1){
			return ["details","requests","history"]; //No I18N
		}
		else{
			return ["details","history"]; //No I18N
		}
	},
    loadMaintenanceDetails: function() {
		var _self=this;
		_self.loadDescriptionSection();
		_self.loadResolutionSection();
		if(_self.template){
			_self.loadEntityFields();
		}
		else{
			var promises=[_self.getTemplateInfo()];
			if(_self.entity_data.is_service_request){
				promises.push(_self.getResourceAllowedValues());
			}
			jQuery.when.apply(this, promises).then(function() {
				_self.loadEntityFields();
			});				
		}
		this.pushHashToURL("details"); // No I18N
		jQuery('#content-details-inner-request_maintenance').removeClass('oxa');  // No I18N
		if(_self.externalframe){
			jQuery("#middle-panel-inner-request_maintenance").css("min-height",window.innerHeight - 25);	// No I18N
		}

    },	
    hidePanelEditor: function(){
        jQuery('[data-name="edit-template"]').find('[name="Cancel"]').trigger("click");
    },	
    loadEntityFields: function() {

        var _self = this;
        var entityFields = _self.entityFields;
        entityFields.initFC = function(mode) {
            /* Destroy the old instances */
            _self.$entityFields_FC && _self.$entityFields_FC.destroy();
            /* Hide other sections which is in edit mode */
            _self.hidePanelEditor();
            /* Show/hide block edit icon when mode is switched */
            if(mode == "edit"){
                jQuery('[data-id="blockEditEntityFields"]').hide();
            }else{
                jQuery('[data-id="blockEditEntityFields"]').show();
            }
            var column_count = 2;
            var template = _self.constructTemplateInfo(column_count);
            //Remove color customization and label placement applied in template
            template.style_properties = null;
            /* Add context=udf_fields for the udf fields to render udf field */
            _self.modifyUDFFieldsProperty(template.layouts[0]);
            var nonEditable = ["requester","approvers","service_sla","created_time","created_by","template"]; 	//_self._links.edit&&_self._links.edit.put&&_self._links.edit.put.non_editable_fields?_self._links.edit.put.non_editable_fields:[]; //No I18N 
			/* Load FC for details sections*/
            var configJSON = {
				name: "RequestMaintenanceForm",	//No I18N
				entity: "request_maintenance", // No I18N
				entityName:getMessageForKey("common.maintenance"),
				entitypath: "/request_maintenances", // No I18N
				entitydata: jQuery.extend(true, {}, _self.entity_data),
				entitycontext: _self,
                template: template,				
				metadata: jQuery.extend(true, {}, _self.metainfo),
                container: "maintenanceDetails", // No I18N		
				allowedValuesCallback: "$maintenanceDetails.getAllowedValues",	//No I18N				
				formid: "request-maintenance-form", // No I18N
                canEdit: ((!_self.links.edit||(_self.links.edit&&(_self.entity_data.maintenancestate=='2'||(_self.entity_data.maintenancestate=='0'&&!$maintenance.resumeConfirmPopup.isResumeAllowed($maintenanceDetails.entity_data.scheduler)))))?false:true),
				skipFields: ["description"],
				additional_contexts: ["udf_fields"],	//No I18N
                skipEditFields: nonEditable,
                mode: mode ? mode : "view", // No I18N
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
					canEditCallback: "$maintenanceDetails.canEditFields",	//No I18N
                    defaults: {
                        lookup: {
                            placeholder: translate('sdp.change.sla.select')
                        }
                    },
					fields : {
						status : {
							allowClear :false
						},	
						site : {
							allowClear :false
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
						editor : {
							input_data_Callback: function (url_options,input_data,ajaxOptions) {
								input_data['template'] = {"id" : $maintenanceDetails.entity_data.template.id}; //No I18N
								return input_data;
							}
						},
						space: {
							maxvalues: $maintenanceDetails.ssp.max_number_of_spaces_per_request?$maintenanceDetails.ssp.max_number_of_spaces_per_request:5
						},
						configuration_items: {
							maxvalues: $maintenanceDetails.ssp.max_number_of_conf_items_per_request?$maintenanceDetails.ssp.max_number_of_conf_items_per_request:25
						},
						assets: {
							maxvalues: $maintenanceDetails.ssp.max_number_of_cis_per_request,
							selection_handler : $maintenanceDetails.externalframe? false : "$maintenanceDetails.openAssetModuleList"  // No I18N
						},
						multi_select: {
							maxvalues: $maintenanceDetails.ssp.multi_select_max_options_selected
						},
						CheckBox: {
							maxvalues: $maintenanceDetails.ssp.checkbox_field_max_options_selected
						}					
					},
					onchange: {
						impact: "$maintenanceDetails.setPriorityMatrixValue",	//No I18N
						urgency: "$maintenanceDetails.setPriorityMatrixValue" // No I18N
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
					url: "/api/v3/request_maintenances/"+_self.id, // No I18N
					submit: true,
					serializer: $maintenanceDetails.reviseUpdateInfo,					
					postsuccess: function (data) {
                        _self.entity_data = jQuery.extend(true, {}, data["request_maintenance"]);
						$maintenanceDetails.transFormEntityData($maintenanceDetails.entity_data);
						$maintenanceDetails.$detailsComp.options.data.entity_data = $maintenanceDetails.entity_data;
                        _self.entityFields.initFC("view");   // No I18N
						$maintenanceDetails.$detailsComp.loadCActionsPanel();
						$maintenanceDetails.$detailsComp.loadCHeaderPanel();
						initTooltip("#maintenance_detailview"); // No I18N
					},
					cancel: "$maintenanceDetails.entityFields.cancelForm"	//No I18N
				},
				//To Format the checkbox and radio refer fields in this format for better understanding.
				formatValues : function (search_data) {
					if(Array.isArray(search_data)){
						for (var i = 0; i < search_data.length; i++) {
						if (search_data[i].site && search_data[i].site.name && search_data[i].name && !search_data[i].name.endsWith(search_data[i].site.name)) {
								search_data[i].name = search_data[i].name + ", " + search_data[i].site.name;
						}
						}
					} else {
						if(search_data&&search_data.name&&search_data.site&&search_data.site.name&& !search_data.name.endsWith(search_data.site.name) ){
							search_data.name = search_data.name + ", " + search_data.site.name;
						}
					}
				},
                afterRenderCallback: function(form) {
                    jQuery("#" + form.container).find(".section-title").addClass("pl0");
										jQuery("#"+form.container).find("[data-name='form-footer']").addClass("sticky-form-footer");    //NO I18N 
										(jQuery("div[data-formid=form_request-maintenance-form]").length) ? jQuery("div[data-formid=form_request-maintenance-form]").css("padding-bottom","10px") : ''; //NO I18N 
										(jQuery("#resource-container").length) ? jQuery("#resource-container h4").addClass("font-base pl0 pb5") : ''; //NO I18N 
					if(_self.entity_data.is_service_request ) {
						/** render cost estimation details */
						$maintenanceDetails.processResourceAllowedValues();
						_self.renderCostEstimation();
					}
					if($maintenanceDetails.$entityFields_FC.fields.priority) {
						/** adding the priorityMatrix element to the Priority field */
						jQuery("#request-maintenance-form [data-name='priority']").parent()	//No I18N
							.append("<input type='hidden' value='" //No I18N
							+ (($maintenanceDetails.$entityFields_FC.fields.priority.current_value && $maintenanceDetails.$entityFields_FC.fields.priority.current_value.id) ? $maintenanceDetails.$entityFields_FC.fields.priority.current_value.id : 0)
							+ "' id='priorityMatrix' data-field='" + $maintenanceDetails.$entityFields_FC.fields.priority.fafr_key + "'>");	//No I18N
					}
                }
            };
            if(window.isMSPOrSCP) {
            	$mspMaintenanceDetails.modifyEntityFieldsConfig(configJSON);
            }
            _self.$entityFields_FC =  new FC(configJSON);
        };
        entityFields.cancelForm = function() {
            _self.entityFields.initFC('view'); // No I18N
        };
		_self.entityFields.initFC("view"); // No I18N
    },
	reviseUpdateInfo: function(payload, form, event){
		if(payload&&payload.request_maintenance&&payload.request_maintenance.udf_fields){
			var udf_fields_info = payload.request_maintenance.udf_fields;
			for(var key in udf_fields_info){
				if(key.indexOf("udf_pick")>-1&&udf_fields_info[key]==""){
					payload.request_maintenance.udf_fields[key]=null;
				}
			}
		}
		if(payload&&payload.request_maintenance&&payload.request_maintenance.resources){
			var resources_info = payload.request_maintenance.resources;
			for(var key in resources_info){
				var resObj = resources_info[key];
				for(var question in resObj) {
					if(question.indexOf("qstn_select_")>-1&&resObj[question]==""){
						payload.request_maintenance.resources[key][question]=null;
					}
				}
			}
		}			
		return 	payload;
	},	
	openAssetModuleList: function(){
		try{
			var user = $maintenanceDetails.entity_data.requester;
			var userId = user ? user.id : null;
			var siteId = $maintenanceDetails.$entityFields_FC.fields.site && $maintenanceDetails.$entityFields_FC.fields.site.current_value ? $maintenanceDetails.$entityFields_FC.fields.site.current_value.id : "-1";
			var siteName=translate('sdp.admin.technician.addtechnician.nosite');
			if(siteId!="-1" && siteId!=null && siteId!="0" ){
				siteName=$maintenanceDetails.$entityFields_FC.fields.site.current_value.name;
			}		
			assetsObj.fiter_requester_id=userId;
			assetsObj.fiter_department_id=user&&user.department?user.department.id:null;
			assetsObj.filter_site_id=siteId;
			assetsObj.filter_site_name=siteName;
			window.maxCICount=$maintenanceDetails.ssp.max_number_of_cis_per_request;
		}
		catch(error){
			console.error(error);
		}
		assetsObj.loadAttachAssetPopup('request_maintenance', 'attach_asset', 'asset');	//No I18N
	},
	canEditFields : function(fname, field){
		var _self=$maintenanceDetails;
		if(this.links.edit&&this.entity_data.maintenancestate!='2'){
			if(_self.entity_data.maintenancestate=='0'&&!$maintenance.resumeConfirmPopup.isResumeAllowed($maintenanceDetails.entity_data.scheduler)){
				return false;
			}
			if(fname=="priority"&&$maintenanceDetails.ssp.priority_matrix_techoverride==false){
				return false;;
			}
			return true;
		}
		return false;
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
		var currentVal = $maintenanceDetails.$entityFields_FC.fields.email_ids_to_notify.current_value;
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
		$maintenanceDetails.$entityFields_FC.setFieldValue("email_ids_to_notify", currentVal.concat(selectedEmails));	//No I18N
		jQuery('[name="email_ids_to_notify"]').trigger("change");       //No I18N
	},	
	    /**
     * Adds context=udf_fields inside fields property
     * @layouts - [Object] layouts which contains fields
     * @udf_fields - [Object] to identify udf_fields in template layout fields, udf_fields is passed
     */
    modifyUDFFieldsProperty: function(layouts) {
        var _self = this;
        /*as per component need to pass context = "udf_fields" then only udf_fields render in form*/
		var inputdataCB = _self.getInputDataCallback();
        for (var i = 0; i < layouts.sections.length; i++) {
            for (var j = 0; j < layouts.sections[i].fields.length; j++) {
                if (layouts.sections[i].fields[j].name.indexOf("udf_") > -1) {
                    layouts.sections[i].fields[j].context = "udf_fields";
					if(layouts.sections[i].fields[j].name.indexOf("udf_multiselect_") > -1){
						if(_self.metainfo&&_self.metainfo.fields&&_self.metainfo.fields.udf_fields&&_self.metainfo.fields.udf_fields.fields&&_self.metainfo.fields.udf_fields.fields[layouts.sections[i].fields[j].name]&&_self.metainfo.fields.udf_fields.fields[layouts.sections[i].fields[j].name].lookup_entity == "request_option"){
							layouts.sections[i].fields[j].selection_handler = "$maintenanceDetails.showBulkSelect";
						} else {
							layouts.sections[i].fields[j].selection_handler = false;
						}
					}
                }
				else if(layouts.sections[i].fields[j].name=="email_ids_to_notify"){
					layouts.sections[i].fields[j].tags = true;
					layouts.sections[i].fields[j].href = "/request_maintenances/requester";	// No I18N
					layouts.sections[i].fields[j].placeholder = getMessageForKey("request.form.emailids.select");	// No I18N
					layouts.sections[i].fields[j].selection_handler = "$maintenanceDetails.openEmailIDList";	// No I18N
				}
				else if(layouts.sections[i].fields[j].name=="space"){
					layouts.sections[i].fields[j].selection_handler = "$maintenanceDetails.openSpacePopup";	// No I18N
				}
				else if(layouts.sections[i].fields[j].name=="configuration_items"){
					layouts.sections[i].fields[j].selection_handler = $maintenanceDetails.externalframe? false : "$maintenanceDetails.openCIPopupWrapper";	// No I18N
				}
				else if(layouts.sections[i].fields[j].name=="editor"){
					layouts.sections[i].fields[j].selection_handler = "$maintenanceDetails.openEditorList";	// No I18N
					layouts.sections[i].fields[j].allowClear = true;
				}	
				else if(layouts.sections[i].fields[j].name=="approvers"){
					//layouts.sections[i].fields[j].title = window.getMessageForKey("sdp.requests.newrequest.approvers");	//No I18N
					layouts.sections[i].fields[j].type = "multi_select";	//No I18N
				}					
				else if(layouts.sections[i].fields[j].name=="service_sla"){
					layouts.sections[i].fields[j].value_path = "service_sla.sla.name";	//No I18N
				}					
				if(inputdataCB.hasOwnProperty(layouts.sections[i].fields[j].name)){
                    layouts.sections[i].fields[j].input_data_Callback = inputdataCB[layouts.sections[i].fields[j].name];
                }
                layouts.sections[i].fields[j].sort = false;
            }
        }
    },	
	/**
	 * Open the space selection popup 
	 */
	 openSpacePopup: function() {
		$req.common.spacePopup.open({
			selected: $maintenanceDetails.$entityFields_FC.fields.space.current_value,
			maximumSelectionSize: $maintenanceDetails.ssp.max_number_of_spaces_per_request?$maintenanceDetails.ssp.max_number_of_spaces_per_request:25,
			onSelect: function(value){
				value = value.map(function(item){
					return item+""; // NO I18N
				});
				try{
					$maintenanceDetails.$entityFields_FC.setFieldValue("space", value, "id"); // NO I18N
				}catch (error) {
					$req.form.handleError(error);
				}
			}
		})
	},	
	transformSite: function (data){
		if(data&&data.hasOwnProperty("site")){
			if(!data.site){
				data.site={"id":-1,"name":translate('common.site.nosite')}; // No I18N
			}
		}
	},
    /**
     * Wrapper method for Form showBulkSelect, which fetches api data before providing data to bulk select component
     */
    showBulkSelect: function(formalias, fname, isEdit, event){
        var field = FC_Mapper[formalias].fields[fname];
        var lookup_entity = field.response_field_name || field.fieldname || field.href.substr(field.href.lastIndexOf("/") + 1);
        var input_data = {"list_info":{"start_index": 1,"row_count": 100,"sort_field": "id"}}; //No I18N
        if(!field.allowedValues){
        sdpAjax({
            url: "/api/v3"+field.href, //No I18N
            cache:false,
            data:{input_data:sdpToJSON(input_data)},
            success:function(data){
				field.allowedValues = data[lookup_entity]||[];
				FC.showBulkSelect(formalias, fname, isEdit, event, true);
            }
        });
        }else{
            FC.showBulkSelect(formalias, fname, isEdit, event, true);
        }
    },	
	getInputDataCallback: function(){
		var self=this;
        var obj = {
            technician: function(urlOptions,input_data,searchText){
				input_data.list_info.search_criteria=[];
				if($maintenanceDetails.$entityFields_FC.fields.group&&urlOptions.formcomp.fields.values["group"]!=""&&urlOptions.formcomp.fields.values["group"]!=null)
				{
					 input_data.list_info.search_criteria= [{"field": "support_group", "condition": "is", "value":{"id":urlOptions.formcomp.fields.values["group"]},"logical_operator": "and"}]; //No I18N
				}
				else if($maintenanceDetails.$entityFields_FC.fields.site&&urlOptions.formcomp.fields.values["site"]!="")
				{
					input_data.list_info.search_criteria= [{"field": "associated_sites", "condition": "is", "value":urlOptions.formcomp.fields.values["site"],"logical_operator":"and"}]; //No I18N
				}
				if(searchText){
					input_data.list_info.search_criteria.push({"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"});
				}				
				delete input_data.list_info["search_fields"]; //No I18N
                return input_data;
            },
            group: function(urlOptions,input_data,searchText){
				input_data.list_info.search_criteria=[];
				var idVal=urlOptions.formcomp.fields.values["site"];
				if($maintenanceDetails.$entityFields_FC.fields.site)
				{
					input_data.list_info.search_criteria= [{"field": "site", "condition": "is", "value":(idVal=="-1"?null:{"id":idVal}),"logical_operator": "and"}]; //No I18N
				}
				if(searchText){
					input_data.list_info.search_criteria.push({"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"});
				}				
				delete input_data.list_info["search_fields"]; //No I18N
                return input_data;
            },
            subcategory: function(urlOptions,input_data,searchText){
				input_data.list_info.search_criteria=[];
				if($maintenanceDetails.$entityFields_FC.fields.category)
				{
					 input_data.list_info.search_criteria= [{"field": "category", "condition": "is", "value":{"id":urlOptions.formcomp.fields.values["category"]},"logical_operator": "and"}]; //No I18N
				}
				if(searchText){
					input_data.list_info.search_criteria.push({"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"});
				}				
				delete input_data.list_info["search_fields"]; //No I18N
                return input_data;
            },	
            item: function(urlOptions,input_data,searchText){
				input_data.list_info.search_criteria=[];
				if($maintenanceDetails.$entityFields_FC.fields.subcategory)
				{
					 input_data.list_info.search_criteria= [{"field": "subcategory", "condition": "is", "value":{"id":urlOptions.formcomp.fields.values["subcategory"]},"logical_operator": "and"}]; //No I18N
				}
				if(searchText){
					input_data.list_info.search_criteria.push({"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"});
				}				
				delete input_data.list_info["search_fields"]; //No I18N
                return input_data;
            },				
        }
        return obj;
    },	
	/**
	 * opens the Email ID selection list in the new window
	 */
	openEmailIDList: function() {
		showUserSearchPopup("Maintenance_EMailCC", true, "", "request_maintenances", "null", "requester");	//No I18N
	},	
	/**
	 * opens the Editor selection dialog in the new window
	 */
	openEditorList: function() {
		showUserSearchPopup(
			"Intermediate_Editing", true,	// No I18N
			($maintenanceDetails.$entityFields_FC.fields.editor.current_value ? $maintenanceDetails.$entityFields_FC.fields.editor.current_value.name : ""), "request_maintenances", "null", "editor"	// No I18N
		);
	},	
    constructTemplateInfo: function(column_count) {
        var _self = this;
        var template = jQuery.extend(true, {}, _self.template);
        var layouts = template.layouts;
		for(var k=0,kLen=template.layouts.length;k<kLen;k++){
			if(template.layouts[k].name=="technician_layout"){
				template.layouts[k].sections[0].name="";
				for(var i=0,iLen=template.layouts[k].sections.length;i<iLen;i++)
				{
					var section = template.layouts[k].sections[i];
					// If column_count is given, then alter the cols properties in template layout json
					column_count && (section.column_count = column_count);
					section.style_properties=null;			
					for(var j=0,jLen=section.fields.length;j<jLen;j++)
					{
						var field = section.fields[j];
						if (column_count) {
							var colCount = (j + 1) % column_count;
							var col = colCount ? colCount : column_count;
							field.position.col = col;
							field.style_properties=null;
						}		
						if(field.name.indexOf("udf_") > -1){
							this.modifyFieldConfig(field);	
						}							
					}
				}
				if(window.isMSPOrSCP) {
					template.layouts[k].sections.push($mspMaintenanceDetails.getAccountFields());
				}
				template.layouts[k].sections.push({"field_align":"left-right","column_count":"2","name":"-1","collapsed_state":"expanded","position":{"col":1,"col_size":2,"row":(template.layouts[k].sections.length-1),"row_size":1},"fields":[{"name":"created_by","position":{"col":1,"col_size":6,"row":1}},{"name":"created_time","position":{"col":2,"col_size":6,"row":1}},{"name":"template","position":{"col":1,"col_size":6,"row":2}}]});
				if($maintenanceDetails.entity_data.service_sla){
					template.layouts[k].sections[template.layouts[k].sections.length-1].fields.push({"name":"service_sla","position":{"col":2,"col_size":6,"row":2}});
				}
			}
			else if(template.layouts[k].name=="resource_layout"){
				/** setting custom properties in the resources layout */
				if(template.layouts[k].sections && template.layouts[k].sections.length > 0) {
					this.has_resource = true;
					template.layouts[k].id = "resource-container";	//No I18N
					template.layouts[k].widget = true;
					template.layouts[k].title = getMessageForKey("common.resources");	//No I18N
					template.layouts[k].view_type =template.layouts[k].resource_view;
					template.layouts[k].custom_class = "addresource";	//No I18N
					for(var j = 0, jLen = layouts[k].sections.length; j < jLen; j++) {
						if(layouts[k].sections[j].fields) {
							for(var i = 0, iLen = layouts[k].sections[j].fields.length; i < iLen; i++) {
								this.modifyFieldConfig(layouts[k].sections[j].fields[i], layouts[k].sections[j]);
							}
						}
					}	
				}
			}
		}
		/** adding Resources cost estimation layout */
		if(this.entity_data.is_service_request && this.isCostEnabled()) {
			layouts.push({
				custom_layout: true,
				html_container: true,
				container_id: "cost-list-preview"	//No I18N
			});
		}		
        return template;
    },	
	modifyFieldConfig: function(field, section) {
		if(field.name.indexOf("udf_") > -1)
		{
			let field_metadata = this.metainfo.fields['udf_fields'].fields[field.name];
			if(field_metadata){
			let is_refer_additional_field = field_metadata.lookup_entity != "request_option";
            //Format the Picklist and Multiselect refer fields in the understanding format.
			if((field_metadata.display_type=="Pick List" || field_metadata.display_type=="MultiSelect") && is_refer_additional_field  && (!field_metadata.field_group || field_metadata.field_group != "resources") )
            {
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
                    var name = e_html(data.name || data.text);
                    if(data.site&&data.site.name&&!name.endsWith(e_html(data.site.name))) {
                        name = name + ", " + e_html(data.site.name);
                    }
                    return name;
                };
                field.formatResult= function(data) {
                    var name = e_html(data.text||data.name);
                    if(data.site) {
                        name = name + ", " + e_html(data.site.name);
                    }
                    return name;
                };
            }
			}
		}
	    var field_metadata = this.metainfo['fields']['udf_fields'].fields[field.name];
		if(field.name.indexOf("udf_") > -1 && !field.is_deleted && field_metadata && field_metadata.field_group=='resources') {	//No I18N
			field.context = "udf_fields"	//No I18N
            field.disableSort = true;
			field.image_dimension = "100x80";	//No I18N
			field.show_details = true;
			if(this.isCostEnabled()) {
				field.item_info = "$maintenanceDetails.getCostText";	//No I18N
			}
			field.showDetailsCallback = "$maintenanceDetails.showResourceDetails";	//No I18N
			field_type = field_metadata.display_type;
			field.label = field_metadata.display_name;
			if(field_type.indexOf("Single Line") > -1){
				try {	
					(field_metadata["is_pii"])&&(field.autocomplete = "off");
				} catch (error) {}
			}
			if(this.isCostEnabled()) {
					field.onchange = "$maintenanceDetails.updateCostDetails";	//No I18N
				}			
			if(!(this.resource_fields.includes(field.context + "." + field.name))){ 
			this.resource_fields.push(field.context + "." + field.name);	//No I18N
			}
		}		
	},
	/**
	 * renders the cost estimation details
	 */
	renderCostEstimation: function() {
		if( this.isCostEnabled() ) {
			this.setCostData();
			renderhbs("#cost-list-preview", "maintenance_cost_estimation_template", this.cost, false, "maintenance",null,null,$maintenanceDetails.costEstTemplateCallback);// NO I18N
		}
	},
	costEstTemplateCallback : () => {
       	jQuery("#cost_show_more_maintenance_details").off('click').on('click', (event) => {                     //No I18N
       		jQuery('#sc-csum-items > .bottom-res-list-item').removeClass('hide');
    		jQuery(event.currentTarget).remove();
   		});
    },
	isCostEnabled : function(){
		if(this.entity_data.is_service_request && this.template.is_cost_enabled){
			return true;
		}
		return false;
	},
	/**
	 * returns the cost of the given item with the currency symbol
	 */
	getCostText: function(item, field) {
		if(!item || !item.hasOwnProperty("cost") || !field.has_cost) {
			return null;
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
		var templateId = this.entity_data.template.id;
		var qnId = field.name, optionId = id;
		var requestId =this.entity_data.id ;
		var image_token = $maintenanceDetails.image_token_for_qstn_option;
		var selectedIds = [];
		if (field.current_value && Array.isArray(field.current_value)) {
			for (var i = field.current_value.length - 1; i >= 0; i--) {
				selectedIds.push(field.current_value[i].id);
			}
		}
		/** checks the view options hbs templates are already fetched and loads it in to the DOM, if not */
		if(!window.optionsViewer ) {
			ResourceLoader({
                js: ['/scripts/viewOptionDetails.js'], //No I18N
                process: "series", //If parallel, scripts will be fetched via promise and async will not be considered.
                async: false //By default async is true
            });
		}

		element = jQuery(event.target);
		qnName = field.label;
		var allowedValues = $maintenanceDetails.$entityFields_FC.allowedValues[field.context+"."+field.name];
		var allOptions = [];
		var currentIndex = 0;
		if(allowedValues){
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
			woId: undefined ,//passing undefined to use requests/questions/6/options api requestId
			templateId : templateId,
			cur_index: currentIndex,
			onChange: "$maintenanceDetails.selectResource", // NO I18N
			showCost: this.isCostEnabled(),
			isMaintenance : true
		});
	},

	/**
	 * sets the cost data to the context and creates the cost item list
	 * also calculates the total cost of the cart
	 */
	setCostData: function() {
		var self = this;
		this.cost.service_cost = this.template.cost_details && this.template.cost_details.service_cost ?
									this.template.cost_details.service_cost : "0.00";	//No I18N
		if(this.entity_data && this.entity_data.service_cost && this.entity_data.template.id == this.template.id){
			this.cost.service_cost = this.entity_data.service_cost;
		}
		this.cost.service_cost_comment = this.template.cost_details && this.template.cost_details.cost_comments ?
									this.template.cost_details.cost_comments : "-";	//No I18N
		this.cost.total_cost = !isNaN( this.cost.service_cost ) ? getFormattedCost( this.cost.service_cost ) : 0;
		this.cost.items = [];
		this.cost.currency = sdp_app.CURRENCY_SYMBOL;


			
				for(var qn in this.entity_data.udf_fields) {
					var question = this.entity_data.udf_fields[ qn ];
					if(question) {
						var field = $maintenanceDetails.$entityFields_FC.fields[ "udf_fields."+ qn ];	//No I18N
						if(!field) {
							continue;
						}
						if(question.constructor === Object && question.hasOwnProperty("cost")) {
							this.includeCostItem(field, question);
							this.incrementTotalCost(question.cost);

						} else if(question.constructor === Array) {
							for(var i = 0, len = question.length; i < len; i++) {
								if(question[i].hasOwnProperty("cost")) {
									this.includeCostItem(field, question[i]);
									this.incrementTotalCost(question[i].cost);
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
		renderhbs("#cost-list-preview", "maintenance_cost_estimation_template", this.cost, false, "maintenance",null,null,$maintenanceDetails.costEstTemplateCallback);// NO I18N
	},

	/**
	 * includes the resource item data to the cost item list by fetching it from the allowed values
	 */
	includeCostItem: function(field, option) {
		if(!option || option.id == "0") {
			return;
		}
		var itemInfo;
		var id = option.id || option;
		if($maintenanceDetails.$entityFields_FC.allowedValues[field.context+"."+field.name]) {
			for(var i = 0, len = $maintenanceDetails.$entityFields_FC.allowedValues[field.context+"."+field.name].length; i < len; i++) {
				if(id === $maintenanceDetails.$entityFields_FC.allowedValues[field.context+"."+field.name][i].id) {
					itemInfo = $maintenanceDetails.$entityFields_FC.allowedValues[field.context+"."+field.name][i];
					break;
				}
			}
		}
		if(!itemInfo || !itemInfo.cost) {
			return;
		}
		this.cost.items.push({
			id: itemInfo.id,
			name: itemInfo.name,
			cost: itemInfo.cost,
			fafr_key: field.fafr_key,
			item_id: field.id,
			label: field.label,
			image: itemInfo.images ? appendDimensions(itemInfo.images[0], "100x80") : null	//No I18N
		});
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
			field = $maintenanceDetails.$entityFields_FC.fields[ fname ];
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
		var field = $maintenanceDetails.$entityFields_FC.fields[ fname ];
		if(!field) {
			return;
		}
		if(field.type === "multi_select") {
			$maintenanceDetails.$entityFields_FC.unsetFieldOptions(fname, itemId);
		} else {
			$maintenanceDetails.$entityFields_FC.unsetFieldValue(fname);
		}
	},
	
    loadDescriptionSection: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        //Description and attachments section displayed using Panel comp
        var opt = {};
        opt.id = _self.id;
        opt.name = "request_maintenance_description"; //No I18N
        opt.base_url = "/api/v3"; //No I18N
        opt.entity =  "request_maintenances"; //No I18N
		opt.lookup_entity="request_maintenance"; //No I18N
        opt.data = _self.entity_data;
        opt.metainfo = _self.metainfo;
        opt.canEdit = ((!_self.links.edit||(_self.links.edit&&(_self.entity_data.maintenancestate=='2'||(_self.entity_data.maintenancestate=='0'&&!$maintenance.resumeConfirmPopup.isResumeAllowed($maintenanceDetails.entity_data.scheduler)))))?false:true);
        opt.expand = true;
        opt.display_name = _self.metainfo.fields.description.display_name;
        opt.container = "request_maintenanceDescription"; // No I18N
        opt.detailsHbsTemplate = "entity_description_template"; // No I18N
        opt.panel = {
            pre_edit: function(){
 
            }
        };
        opt.save = {		
            postsuccess : function(data){
				_self.entity_data = data;
				$maintenanceDetails.transFormEntityData($maintenanceDetails.entity_data);
            }
        };
        opt.attachment={
            rerender: function(data){
                _self.entity_data.attachments = data;
            },
            container: "request_maintenanceDescription_attachment" //No I18N
        }
        _self.$descriptionPC = new PanelComponent(opt);
    },
    loadResolutionSection: function(tabName, tabSetting, tabs_panel){
        var _self = this;
		var entity_data_temp = jQuery.extend(true, {},_self.entity_data);	
		delete entity_data_temp["description"];
		entity_data_temp["description"]=entity_data_temp.resolution.content;
        //Description and attachments section displayed using Panel comp
        var opt = {};
        opt.id = _self.id;
        opt.name = "resolution_data"; //No I18N
        opt.base_url = "/api/v3"; //No I18N
        opt.entity =  "request_maintenances"; //No I18N
		opt.lookup_entity="request_maintenance"; //No I18N
        opt.data = entity_data_temp;
        opt.metainfo = _self.metainfo;
        opt.canEdit = ((!_self.links.edit||(_self.links.edit&&(_self.entity_data.maintenancestate=='2'||(_self.entity_data.maintenancestate=='0'&&!$maintenance.resumeConfirmPopup.isResumeAllowed($maintenanceDetails.entity_data.scheduler)))))?false:true);
        opt.expand = true;
        opt.display_name = _self.metainfo.fields.resolution.display_name;
        opt.container = "request_maintenanceResolution"; // No I18N
        opt.detailsHbsTemplate = {    "template" : "maintenance_resolution_template",    "namespace" : "maintenance"}; // No I18N
        opt.save = {
			serializer : function(data, pc){
				var obj= {"resolution":{"content":""}}; // No I18N
				if(data.description){
					obj.resolution.content=data.description;
				}
				if(data.images){
					obj.images={};
					obj.images["resolution.content"]=data.images.description;
				}
                return obj;
            },
            postsuccess : function(data){
				_self.entity_data = jQuery.extend(true, {}, data);
				$maintenanceDetails.transFormEntityData($maintenanceDetails.entity_data);
				var entity_data_temp2 = jQuery.extend(true, {},_self.entity_data);	
				delete entity_data_temp2["description"];
				entity_data_temp2["description"]=entity_data_temp2.resolution.content;				
				_self.$resolutionPC.data=entity_data_temp2;
            }
        };
		opt.attachment=false;
        _self.$resolutionPC = new PanelComponent(opt);
    },	
	loadRequests: function() {
		jQuery("body").trigger("resize");
		jQuery('#content-details-inner-request_maintenance').removeClass('oxa');
		$maintenance.initRequests({"id":this.id,"fromMiniCalendar":$maintenanceDetails.fromMiniCalendar,"start_time":$maintenanceDetails.startDateFromMniCalendar,"end_time":$maintenanceDetails.endDateFromMniCalendar}); //No I18N
		$maintenanceDetails.startDateFromMniCalendar=undefined;
		$maintenanceDetails.endDateFromMniCalendar=undefined;
		$maintenanceDetails.fromMiniCalendar=undefined;
		this.pushHashToURL("requests"); // No I18N
    },	
	afterTabRenderHistory : function(){
		jQuery("body").trigger("resize");
		this.pushHashToURL("history"); // No I18N
	},
	afterActionLeftPanelRender : (panelObj, data) => {
    	jQuery("#maintenance_generate_request").off('click').on('click', (event) => {       // No I18N
    		$maintenanceDetails.generateRequest();
    	});
    	jQuery("#details_delete_maintenance").off('click').on('click', (event) => {         // No I18N
    		$maintenanceDetails.deleteMaintenance();
    	});
    	jQuery("#suspendMenu [data-name='suspendMaintenance']").off('click').on('click', (event) => {         // No I18N
    		$maintenanceDetails.showSuspendResumePopup('suspend');                                          // No I18N
    	});
    	jQuery("#resumeMenu [data-name='resumeMaintenance']").off('click').on('click', (event) => {           // No I18N
    		$maintenanceDetails.showSuspendResumePopup('resume');                                           // No I18N
    	});
    },
    afterHeaderPanelRender : (panelObj, data) => {
    	jQuery("#maintenance_requester_info").off('click').on('click', (event) => {           //No I18N
       		$previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+data.created_by.id+'&minContent=true&externalframe=true',translate('sdp.inventory.wsRtPanel.userDetails'),'600px');   //No I18N
       	});
    },
    afterMaintenanceDetailsRender : () => {
    	jQuery('[data-id="blockEditEntityFields"]').off('click').on('click', (event) => {           //No I18N
    		$maintenanceDetails.entityFields.initFC('edit');                                        //No I18N
    	});
    },
	loadRightPanel :function () {
		if($maintenance.canShowCalendar()){
			$maintenanceCalendar.initMiniCalendar({'id':this.id,"request_events":this.entity_data.request_events,"events":this.entity_data.events}); // No I18N
		}
		if($maintenanceDetails.entity_data.scheduler){	
			this.maintenanceSchedulerView =new scheduleAPI('', {}); //NO I18N
			jQuery('#maintenance-schedule-details-container').html(this.maintenanceSchedulerView.viewDetails(jQuery.extend(true,{},$maintenanceDetails.entity_data.scheduler)));
		}
	},
	pushHashToURL: function(tabName){
		var urlStr = "/ui/maintenances?mode=details&id="+$maintenanceDetails.id+"#"+tabName; // No I18N
		window.history.replaceState({"hash" : tabName}, '', urlStr); // No I18N
	},	
	fetchMetaData : function () {
        var sdpOptions = {
            url: "/api/v3/request_maintenances/"+$maintenanceDetails.id+"/metainfo", // No I18N
            success: function(data) {
				$maintenanceDetails.metainfo = data.metainfo;
				$maintenanceDetails.processMetaInfo($maintenanceDetails.metainfo);
            },
            cache:false
        };
        return sdpAjax(sdpOptions);
    },	
    processMetaInfo: function(metainfo) {
        /**
         * For the Technician, the field email_ids_to_notify is in the form of select2
         * So we directly change the metainfo
         * */
        if (metainfo.fields.hasOwnProperty("email_ids_to_notify") && metainfo.fields.email_ids_to_notify) {
            metainfo.fields.email_ids_to_notify.constraints = {
                type: "email" //No I18N
            };
        }
		metainfo.fields.approvers={"display_name":window.getMessageForKey("sdp.requests.newrequest.approvers")};	//No I18N
    },
	getAllowedValues : function(){
		$maintenanceDetails.processResourceAllowedValues();
		$maintenanceDetails.processPriorityAllowedValues();
	},
	processPriorityAllowedValues : function(){
		if($maintenanceDetails.priorityAllowedValues){
			$maintenanceDetails.$entityFields_FC.allowedValues["priority"]=[];
			for(var i=0;i<$maintenanceDetails.priorityAllowedValues.length;i++){
				$maintenanceDetails.$entityFields_FC.allowedValues["priority"].push(Object.assign({}, $maintenanceDetails.priorityAllowedValues[i], {}));
			}
		}
	},
	processResourceAllowedValues : function(fieldObj){
		var fieldObj = $maintenanceDetails.resourceAllowedVales;
		for(var key in fieldObj) {
		    if(key === 'IMAGE_TOKEN'){
                $maintenanceDetails.image_token_for_qstn_option = fieldObj.IMAGE_TOKEN;
		        continue;
		    }
			var fname = null;
			for(var field in $maintenanceDetails.$entityFields_FC.fields) {
				if($maintenanceDetails.$entityFields_FC.fields[field].fafr_key === key) {
					fname = field;
					break;
				}
			}
			if(fname === null) {
				continue;
			}
			/* Special handling : adding image_token in fields for resource questions */
			if(fieldObj.IMAGE_TOKEN){
			    $maintenanceDetails.$entityFields_FC.fields[fname].image_token = fieldObj.IMAGE_TOKEN;
			}
			$maintenanceDetails.$entityFields_FC.allowedValues[fname] = [];
			var index = 0;
			// Get AllowedValues for the particular field
			var AllowedValues = fieldObj[key].AllowedValues;
			if(fieldObj[key].AllowedValues && !jQuery.isEmptyObject(fieldObj[key].AllowedValues)) {
				for(var id in fieldObj[key].AllowedValues) {
					
					if(($maintenanceDetails.$entityFields_FC.fields[fname].display_type === "CheckBox" || $maintenanceDetails.$entityFields_FC.fields[fname].display_type === "Radio") && id == "0") {
						continue;
					}
					
					var allowedvalue = fieldObj[key].AllowedValues[id];
					var option = {
						id: id,
						name: allowedvalue
					};
					if(typeof allowedvalue === "object") {
						for(var optionkey in allowedvalue) {
							if(optionkey === "value") {
								option.name = allowedvalue.value;
							} else {
								option[ optionkey ] = allowedvalue[ optionkey ];
							}
						}
					}					
					$maintenanceDetails.$entityFields_FC.allowedValues[fname].push(option);
					index++;
				}
			}
		}		
	},
	transFormEntityData: function(data) {
		$maintenanceDetails.transformSite($maintenanceDetails.entity_data);
		$maintenanceDetails.entity_data.approvers=[];
		if($maintenanceDetails.entity_data.service_approvers){
			if($maintenanceDetails.entity_data.service_approvers.org_roles){
				var orgApprovers= jQuery.extend(true, [],$maintenanceDetails.entity_data.service_approvers.org_roles);
				for(var iter1=0,iter1Len=orgApprovers.length;iter1<iter1Len;iter1++){
					$maintenanceDetails.entity_data.approvers.push({"id":orgApprovers[iter1].id+"_orgRoleId","name":orgApprovers[iter1].display_name||orgApprovers[iter1].name});
				}
			}
			if($maintenanceDetails.entity_data.service_approvers.users){
				var userApprovers= jQuery.extend(true, [],$maintenanceDetails.entity_data.service_approvers.users);
				$maintenanceDetails.entity_data.approvers=$maintenanceDetails.entity_data.approvers.concat(userApprovers);
			}
		}
		if($maintenanceDetails.entity_data.description&&$maintenanceDetails.entity_data.image_token){
			$maintenanceDetails.entity_data.description=appendImageToken($maintenanceDetails.entity_data.description,$maintenanceDetails.entity_data.image_token);
		}
		if($maintenanceDetails.entity_data.resolution&&$maintenanceDetails.entity_data.resolution.content&&$maintenanceDetails.entity_data.image_token){
			$maintenanceDetails.entity_data.resolution.content=appendImageToken($maintenanceDetails.entity_data.resolution.content,$maintenanceDetails.entity_data.image_token);
		}
	},
	fetchEntityData : function (callback) {
		var inputObject = {
            "add_recent_item": true // No I18N
        };
        var dataval = sdpAjaxInputData(inputObject);
        var sdpOptions = {
            url: "/api/v3/request_maintenances/"+$maintenanceDetails.id, // No I18N
			data: dataval,
            success: function(data) {
                 $maintenanceDetails.entity_data = data.request_maintenance;
				 $maintenanceDetails.transFormEntityData($maintenanceDetails.entity_data);
				 jQuery("#browserTitleInfo").find("#bt_id").text(data.request_maintenance.id).end().find("#bt_title").text(data.request_maintenance.name); // No I18N
				 applyBrowserTitle();
				 if(callback){
					 callback();
				 }
            },
            cache:false
        };
        return sdpAjax(sdpOptions);
    },		
    getLinksData : function(){
        var links_data = { "generate_request" : sdp_user.ROLES.indexOf("CreateRequests")>-1&&(sdp_user.ROLES.indexOf("CreateRequestMaintenances")>-1 || sdp_user.ROLES.indexOf("ModifyRequestMaintenances")>-1)?true:false}; // No I18N
        var url = "/api/v3/request_maintenances/"+$maintenanceDetails.id+"/_links";//NO I18N
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
				$maintenanceDetails.links=links_data;
            }
        });
    },
    getSspData : function(){
        return sdpAjax({
			url: '/api/v3/self_service_portal_settings', // No I18N
            success: function (response) {
				$maintenanceDetails.ssp=response["self_service_portal_settings"][0];
            }
        });
    },	
    getResourceAllowedValues : function(){
        return sdpAjax({
			url: "/servlet/SDAjaxServlet?action=getResourceJson&templateId=" + $maintenanceDetails.entity_data.template.id,	//No I18N
            success: function (response) {
				//$maintenanceDetails.processAllowedValues(response);
				$maintenanceDetails.resourceAllowedVales = response;
            }
        });
    },		
    getPriorityMatrixData : function(){
		var input_data = {"includes":["priority_matrices","self_service_portal"]};	//No I18N
        return sdpAjax({
			url: '/api/v3/requests/_newform',	//No I18N
			data: sdpAjaxInputData(input_data),
            success: function (response) {
				$maintenanceDetails.ssp=jQuery.extend(true,{},response["newform"]["self_service_portal"]);
				$maintenanceDetails.processPriorityMatrix(response["newform"]);
            }
        });
    },		
    getPriorityData : function(){
        return sdpAjax({
			url: '/api/v3/request_maintenances/priority',	//No I18N
            success: function (response) {
				$maintenanceDetails.priorityAllowedValues = response["priority"];
            }
        });
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
            $maintenanceDetails.priority_matrix = priority_matrices;
        }
    },	
	/**
	 * sets the priority value based on the Priority Matrix configuration
	 */
	setPriorityMatrixValue: function() {
		if(jQuery.isEmptyObject( $maintenanceDetails.priority_matrix)){
			return false;
		}
		var impact = $maintenanceDetails.$entityFields_FC.fields.impact || null;
		var urgency = $maintenanceDetails.$entityFields_FC.fields.urgency || null;
		var priority = $maintenanceDetails.$entityFields_FC.fields.priority || null;
		var impactEle = impact && impact.element && jQuery(impact.element).length > 0 ? jQuery(impact.element) : null;
		var urgencyEle = urgency && urgency.element && jQuery(urgency.element).length > 0 ? jQuery(urgency.element) : null;
		var priorityEle = priority && priority.element && jQuery(priority.element).length > 0 ? jQuery(priority.element) : null;
		var impactVal, urgencyVal, priorityVal, matrixId, currentPriorityVal;
		var priorityStockEle = jQuery('#priorityMatrix');	//No I18N

		currentPriorityVal = priorityStockEle.val();
		/** gets the available current Urgency and Impact field values */
		if(impactEle && urgencyEle) {
			impactVal = impact.current_value ? impact.current_value.id : null;
			urgencyVal = urgency.current_value ? urgency.current_value.id : null;
		} else if(impactEle) {
			impactVal = impact.current_value ? impact.current_value.id : null;
			urgencyVal = $maintenanceDetails.entity_data.urgency ? $maintenanceDetails.entity_data.urgency.id : null;
		} else if(urgencyEle) {
			impactVal = $maintenanceDetails.entity_data.impact ? $maintenanceDetails.entity_data.impact.id : null;
			urgencyVal = urgency.current_value ? urgency.current_value.id : null;
		}

		/** sets the priority value from the corresponding Priority matrix */
		if(impactVal !== null && impactVal !== undefined && urgencyVal !== null && urgencyVal !== undefined) {
			matrixId = impactVal + "##" + urgencyVal;	//No I18N
			priorityVal = $maintenanceDetails.priority_matrix[matrixId];
		}
		if(!priorityVal) {
			priorityVal = "0";	//No I18N
		}

		/** when the techoverride is disabled and either Urgency or Impact doesn't have any value, the priority will be reset to the original value */
		if((!urgencyVal || !impactVal) && $maintenanceDetails.ssp.priority_matrix_techoverride === false) {
			priorityVal = $maintenanceDetails.entity_data.priority ? $maintenanceDetails.entity_data.priority.id : "0";	//No I18N
		}

		/** set the value to the field if present or the stock field */
		if(priority && priorityVal !== undefined) {
			priorityStockEle.val(priorityVal);
			/** check for the presence of the priority field */
			if(priority.container && priority.container.length > 0) {
				var priorityText = null;
				if(priorityVal == "0") {
					priorityText = getMessageForKey("sdp.common.notassigned");	//No I18N
				} else {
					if(priority.allowed_values) {
						for(var i = 0, len = priority.allowed_values.length; i < len; i++) {
							if(priority.allowed_values[i].id == priorityVal) {
								priorityText = priority.allowed_values[i].name;
								break;
							}
						}
					}
					if(!priorityText) {
						priorityText = $maintenanceDetails.entity_data.priority ? $maintenanceDetails.entity_data.priority.name : getMessageForKey("sdp.common.notassigned");	//No I18N
					}
				}
				if(priorityText) {
					priority.container.find("[data-name='priority']").text(priorityText);	//No I18N
				}
				if(priorityEle && priorityEle.length > 0) {
					/**
					 * when the techoverride is disabled, select2 field won't be available
					 * in that case, we have to manually trigger the change event of Priority stock element for FAFR to get executed, if any
					 */
					if(priorityEle.data("select2")) {
						$maintenanceDetails.$entityFields_FC.fields.values.priority = priorityVal;
					} else if(currentPriorityVal != priorityVal) {
						priorityStockEle.trigger("change");	//No I18N
					}
				}
			}
		}
	},		
	generateRequest : function() {
		sdpAjax({
			url: '/api/v3/request_maintenances/'+$maintenanceDetails.id+'/_generate_request', // No I18N
			type: 'POST', // No I18N
            success: function (response) {
				var message='';
				if(response&&response.response_status&&response.response_status.messages&&response.response_status.messages[0]){
					message=response.response_status.messages[0].message;
				}
				window.showalert('success',message,'isAutoHide=true'); // No I18N
				if($maintenanceDetails.getAllowedTabs().includes("requests")){
					var container=jQuery("#"+ $maintenanceDetails.$detailsComp.options.container);
					container.find("[role='tablist']").find('li[data-name="requests"]').trigger("click");
				}
				$maintenanceDetails.fetchEntityData(function(){
					$maintenanceDetails.$detailsComp.options.data.entity_data = $maintenanceDetails.entity_data;
					$maintenanceDetails.$detailsComp.refreshPanel("panel","content-right"); // NO I18N
					initTooltip("#maintenance_detailview"); // No I18N
				});
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
							if($maintenanceDetails.metainfo.fields[fieldName]){
								fieldName=$maintenanceDetails.metainfo.fields[fieldName].display_name;
							}
							else if($maintenanceDetails.metainfo.fields&&$maintenanceDetails.metainfo.fields.udf_fields&&$maintenanceDetails.metainfo.fields.udf_fields.fields&&$maintenanceDetails.metainfo.fields.udf_fields.fields[fieldName]){
								fieldName=$maintenanceDetails.metainfo.fields.udf_fields.fields[fieldName].display_name;
							}
							message=message+" : "+fieldName;
						}
					}
					else{
						message=response.responseJSON.response_status.messages[0].message;
					}
				}
				}
				catch(e){
				}
				window.showalert('failure',e_html(message),'isAutoHide=true'); // No I18N				
			}
        });		
	},	
	deleteMaintenance : function() {
		showconfirm(true,'title='+window.getMessageForKey("any.maintenance",[window.getMessageForKey("sdp.common.delete")])+',message='+translate('maintenance.delete.confirm')+',submitbutton='+window.getMessageForKey("sdp.common.delete")+',cancelbutton='+translate('sdp.common.cancel')+',closebutton=yes,closeOnEscKey=yes',$maintenanceDetails.deleteMaintenanceCall);	 //No I18N		
	},
	deleteMaintenanceCall : function(canDelete){
		if(canDelete){
			sdpAjax({
				url: '/api/v3/request_maintenances/'+$maintenanceDetails.id, // No I18N
				type: 'DELETE', // No I18N
				success: function (response) {
					window.showalert('success',window.getMessageForKey("sdp.admin.common.delete.success",[window.getMessageForKey("common.maintenance")]),'isAutoHide=true'); // No I18N
					$spa.navigate('/ui/maintenances?mode=list','maintenances','maintenances-list',true);//No I18N
				}
			});
		}
	},
	showSuspendResumePopup : function(operation)
	{
		var id=$maintenanceDetails.id;
		if(operation=="resume"&&!$maintenance.resumeConfirmPopup.isResumeAllowed($maintenanceDetails.entity_data.scheduler,id,"details")){
			$maintenance.resumeConfirmPopup.showReschedulePopup();
			return ;
		}
		var titleKeys= {"suspend": window.getMessageForKey("any.maintenance",[window.getMessageForKey("suspend.operation")]),"resume":window.getMessageForKey("any.maintenance",[window.getMessageForKey("admin.optood.resume.migration")])}; // No I18N
		var footerKeys= {"suspend":window.getMessageForKey("suspend.operation"),"resume":window.getMessageForKey("admin.optood.resume.migration")}; // No I18N
		var htmlDiv = '<div id="suspendedHTMLlist" class="">'+
						'<div class="form-horizontal">'+
							'<div class="p15">'+
								'<label for="suspendedTxt" class="">'+window.getMessageForKey("sdp.common.comments")+'</label>'+ // No I18N
								'<textarea  maxlength="250" name="comments" id="suspendedTxt" rows="6" class="form-control resize-vertical"></textarea>'+
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
                    $maintenanceDetails.SuspendOrResume(operation,id);
                });
            	jQuery("#closeSuspendResumeMaintenanceDialog").off('click').on('click', (event) => {        // No I18N
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
				jQuery('#SuspendResumecontainer').dialog('close'); // No I18N
				window.showalert('success',messages[operation],'isAutoHide=true'); // No I18N
				$maintenanceDetails.fetchEntityData(function(){
					$maintenanceDetails.$detailsComp.options.data.entity_data = $maintenanceDetails.entity_data;
					$maintenanceDetails.$detailsComp.loadCActionsPanel();
					$maintenanceDetails.$detailsComp.loadCHeaderPanel();
					if(jQuery("#"+ $maintenanceDetails.$detailsComp.options.container).find("[role='tablist']").find("li.active").attr('data-name')=='history'){
						jQuery("#"+ $maintenanceDetails.$detailsComp.options.container).find("[role='tablist']").find("li.active").trigger("click");
					}
					$maintenanceDetails.$detailsComp.refreshPanel("panel","content-right"); // NO I18N
					initTooltip("#maintenance_detailview"); // No I18N
				});
            }
        });
	},
	constructNavigationLinks: function(){
		var _self=$maintenanceDetails;
		var navigationLinks={};
		if(window.hasOwnProperty("$maintenanceLoadedIDs")&&window.$maintenanceLoadedIDs.loadedIDs){
			var ids = Object.values(window.$maintenanceLoadedIDs.loadedIDs);
			var index = ids.indexOf(_self.id);
			var nextIndex = index+1;
			var prevIndex = index-1;
			(nextIndex != ids.length) && (navigationLinks.nextId = ids[nextIndex]);
			(prevIndex != -1) && (navigationLinks.prevId = ids[prevIndex]);
			 if(Object.keys(window.$maintenanceLoadedIDs.loadedIDs).length > 1){
				navigationLinks.navigation = true;
			}
        }
		$maintenanceDetails.navigationLinks=navigationLinks;
	},
    getTemplateInfo: function() {
        var _self = this;
        var params = undefined;	// variable introduced to send data for MSP/SCP
		if(window.isMSP) {
			// setting account ID as 0 for template fetch API to retrieve even when the maintenance request's template is now not associated to its account
			params = {"ACCOUNTID": "0"};    // No I18N
		}
        return sdpAjax({
			url: "/api/v3/request_maintenances/"+_self.entity_data.id+"/template/"+_self.entity_data.template.id, // No I18N
			data: params,
            success: function(resp) {
				_self.template = resp["request_template"];
            }
		});
    },
	openCIPopupWrapper: () => {
		let confSelectionLimit = $maintenanceDetails.ssp.max_number_of_conf_items_per_request?$maintenanceDetails.ssp.max_number_of_conf_items_per_request:25;
        $req.common.openCIPopup(confSelectionLimit);
	}
};
