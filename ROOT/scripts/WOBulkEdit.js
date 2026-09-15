/* $Id $ */

$req.bulkedit = {
	is_initialized: false,
	template: {},
	metainfo: {},
	promise_data: null,

	initialize: function() {
		if(!window.template_settings){
			window.template_settings = $slc.getTemplatesData().responseJSON.template_settings;
		}
		$req.form.edit_mode = true;
		$req.form.bulk_mode = true;
		$req.form.templateID = $req.form.getDefaultTemplateID();	//No I18N
		$req.form.template = this.getBulkEditTemplate();
		var promisefns = [
			this.getMetainfo(),
			$req.form.fetchCombinedData(true, ["metainfo","self_service_portal","status","csi_model","priority_matrices"] )  //NO I18N
		]; 

		this.is_initialized = true;
		this.promise_data = jQuery.when.apply(this, promisefns);
	},

	initRendering: function() {
		var _self = this;
		if(this.promise_data !== null) {
			this.promise_data.then(function() {
				_self.renderUI();
			}, function() {
				/** TODO : Handle error */
			});
		} else {
			this.renderUI();
			return;
		}
	},

	renderUI: function() {
		this.constructTemplate($req.form.metainfo);
		$req.form.setCommonInfo();
		this.initForm();
	},
	getMetainfo: function(){
		var data = {}
		data['for']="request_bulk_edit";//No I18N
		return sdpAjax({
			url: "/api/v3/requests/_metainfo", //NO I18N
			method:"GET", //NO I18N
			data: sdpAjaxInputData(data),
			success: function(res){
				if(res.metainfo){
					$req.form.metainfo = res.metainfo;
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
                $req.form.errorHandler(10001, false, jqXHR, textStatus, errorThrown);
            }
		})
	},
	initForm: function() {
		var self = this;
		var template = $req.form.constructTemplateInfo();
		var sites = jQuery("#site_ids").text().split(", ");
		var sameSite = false;
		var formoptions = {
			name: "WorkOrderForm",	//No I18N
			customform: true,
			entity: "request",	//No I18N
			entityName: getMessageForKey("common.request"),	//No I18N
			entitypath: "/requests",	//No I18N
			entitydata: this.entitydata || null,
			template: template,
			metadata: $req.form.metainfo,
			mode: "edit",	//No I18N
			container: "form-container",	//No I18N
			formid: "req-form",	//No I18N
			inlineImagesEntity: "request",	//No I18N
			allowedValuesCallback: "$req.form.getAllowedValues",	//No I18N
			skipFields: [],
			additional_contexts: ["udf_fields", "onhold_scheduler", "closure_info", "resolution"],	//No I18N
			fafrDynamic: ["site", "technician", "group"],	// No I18N
			edit: {
				canEditCallback: "$req.form.canEditFields",	//No I18N
				fields: {
					status:{
						pre:"$req.form.getStatuses" //NO I18N
					},
					multi_select: {
						maxvalues: $req.form.ssp.multi_select_max_options_selected
					},
					CheckBox: {
						maxvalues: $req.form.ssp.checkbox_field_max_options_selected
					},
					space: {
						maxvalues: $req.form.ssp.max_number_of_spaces_per_request?$req.form.ssp.max_number_of_spaces_per_request:25
					},
					site: {
						processResults:function(search_data, data, field, self) {
							if(data && data.id == -1){
								data.id = 0;
							}
							search_data.push(data);
						},
					},
					group: {
						processResults:function(search_data, data, field, self) {
						    //SD-111114: Getting Site details from group api. If selected records were in same site.
							if(sameSite){
							    var siteId = data.site!=null?data.site.id:"0"; //No i18N
							    var siteName = data.site!=null?data.site.name:translate("common.site.nosite"); //No i18N
								sameSite=false;
								if(siteId == sites[0]){
									jQuery("#site_control>.select2-container").select2("data",{id: siteId, text: siteName}); //No i18N
								}
							}
							search_data.push(data);
						},
						input_data_Callback: function(urlOptions,input_data,searchText){
						    //SD-111114:Checking whether all the selected request are associated with same site.
							const allEqual = sites.every(val => val === sites[0]);
							sameSite = allEqual;
							input_data.list_info.sort_field="name";  //NO I18N
							input_data.list_info.sort_order="asc";  //NO I18N
							var search_criteria_to_return=[];
							if($rf.fields.site)
							{
								var siteVal = $rf.fields.values.site&&$rf.fields.values.site.id?$rf.fields.values.site.id:$rf.fields.values.site;
								if(siteVal=="0"){
									siteVal=null;
								}
								if(siteVal!="-1"){
									search_criteria_to_return.push({"field": "site", "condition": "is", "value":siteVal,"logical_operator": "and"}); //No I18N
								}
								//SD-111114 : Alerting user to fill Site Details before Group
								else if(siteVal=="-1"){
									if(allEqual){
										siteVal=sites[0]=="0"?null:sites[0]; //No i18N
										search_criteria_to_return.push({"field": "site", "condition": "is", "value":siteVal,"logical_operator": "and"}); //No I18N
									}
									else{
										alert(translate("bulkedit.site.required")); //No i18N
										jQuery("#group_control>.select2-container").select2("close"); //No i18N
										jQuery("#site_control>.select2-container").select2("open"); //No i18N
									}
								}
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
					technician: {
						input_data_Callback: function(urlOptions,input_data,searchText){
							input_data.list_info.sort_field="name";  //NO I18N
							input_data.list_info.sort_order="asc";	  //NO I18N
							var search_criteria_to_return=[];
							if(sdp_user.USERTYPE != "Requester"){
								input_data.list_info.fields_required = ["name","is_online"];	// No I18N
								if ($rf.fields.technician.online) {
									search_criteria_to_return.push({"field": "is_online", "condition": "is", "value": "1" ,"logical_operator":"and"});
								}
							}
							var groupVal=null;
							if($rf.fields.group){
								groupVal=$rf.fields.values.group&&$rf.fields.values.group.id?$rf.fields.values.group.id:$rf.fields.values.group;
							}
							if(groupVal!=""&&groupVal!=null&&groupVal!="0"&&groupVal!="-1")
							{
								 search_criteria_to_return.push({"field": "support_group", "condition": "is", "value":groupVal,"logical_operator": "and"}); //No I18N
							}
							else if($rf.fields.site)
							{
								var siteVal = $rf.fields.values.site&&$rf.fields.values.site.id?$rf.fields.values.site.id:$rf.fields.values.site;
								if(siteVal!="-1"){
									if(siteVal=="0"||siteVal==null||siteVal==""){
										siteVal="-1";
									}
									search_criteria_to_return.push({"field": "associated_sites", "condition": "is", "value": siteVal ,"logical_operator":"and"}); //No I18N
								}
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
					lookup:{
						/** If the Allowed values is load from href then,  */
						processSearchData: function(data, _self) {
							var field = _self.field;
							var options = data[field];
							if(_self.field=='technician'){
                                //For technician online/offline status, the processResult from the form component gets overridden
                                // So need to call the processResult for all options
                                var search_data = [];
                                if (typeof _self.url_options.processResults == "undefined" && _self.settings) {
                                    _self.url_options.processResults = _self.settings.processResults;
                                }
                                for (var i = 0; i < options.length; i++) {
                                    if(options[i].id!=-1){ // For "Leave it as it is", the online/offline icon need not be shown
										_self.url_options.processResults(search_data, options[i], _self.field, options);
									}
									else{
										search_data.push(options[i])
									}
								}
                                options = search_data;
                            }

							/** Not Speicified Options */
							var notSpecifiedOptions = {
								id: "0",
								name: getMessageForKey("sdp.common.notassigned"),
                                text: getMessageForKey("sdp.common.notassigned")
							}
							if(field !="site" && options && options.length ){
								if(options.length > 1 && options[1] && options[1].id != "0"){
									options.splice(1,0, notSpecifiedOptions);
								}
								if(options.length == 1){
									options.push(notSpecifiedOptions);
								}
							}
							for (var index = 0; index < options.length; index++) {
								var item  = options[index];
								item.text = item.name || item.text;
								if (item && !item.hasOwnProperty("id")){ // No I18N
									item.id = item.name;
									options[index] = item;
								}
							}
							return options;
						},
					}
				},
				defaults: {
					site: {
						id: "-1",	//No I18N
						name: getMessageForKey("sdp.request.bulk.nochange")	//No I18N
					},
					group: {
						id: "-1",	//No I18N
						name: getMessageForKey("sdp.request.bulk.nochange")	//No I18N
					},
					"onhold_scheduler.change_to_status":{}, //No I18N
					"closure_info.closure_code":{}, //No I18N
					lookup: {
						id: "-1",	//No I18N
						name: getMessageForKey("sdp.request.bulk.nochange"),	//No I18N
						dependent: {
							id: "-1",	//No I18N
							name: getMessageForKey("sdp.request.bulk.nochange")	//No I18N
						}
					},
				},
				onchange: {
					status: "$req.form.statusController"	//No I18N
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
				url: "/api/v3/requests?ids=" + jQuery("#req_ids").text().replace(/ /g, ''),	//No I18N
				submit: true,
				postsuccess: "$req.bulkedit.saveSuccessHandler",	//No I18N
				serializer: "$req.bulkedit.reviseUpdateInfo",	//No I18N
				forcesave: this.templateChanged,
				submitbutton: {
					add: window.getMessageForKey("sdp.requests.newrequest.addrequest"),	//No I18N
					edit: window.getMessageForKey("sdp.requests.newrequest.update")	//No I18N
				},
				cancel: "$req.bulkedit.cancelForm"	//No I18N
			},
            //To Format the checkbox and radio refer fields in this format for better understanding.
            formatValues : function (search_data, fieldName) {
                 for (var i = 0; i < search_data.length; i++) {
                    if (fieldName.includes('udf_') && search_data[i].site && search_data[i].site.name) {
                       search_data[i].name = search_data[i].name + ", " + search_data[i].site.name;
                    }
                 }
             },
			default_values_path: {},
			afterRenderCallback: function(form){
                /* Binding events for request partial templates */
                let templateListeners =  $req.form.bindEvents.templates;
                templateListeners.rf_req_close_form_footer();
                templateListeners.rf_req_onhold_form_template();
                templateListeners.rf_status_change_comment_template();
            }
		};

		/** skips the site field if there is no site configured in the application */
		if(!window.sdp_app.IS_SITE_CONFIGURE) {
			formoptions.skipFields.push("site");	//No I18N
		}

		if(minpreview) {
			formoptions.scrollContainer = "#request-form-dialog";	//No I18N
		}
		
		formoptions.edit.fields.site.syncDefault = true;
		formoptions.edit.fields.technician.techStatus = true;
		window.$rf = new FC(formoptions);
		jQuery("#form-container").on("editLoaded", function() {	//No I18N
			self.afterLoad();
		});
	},

	afterLoad: function() {		
		/**
		 * The allowed values of CSI field is get from the Combined API call,
		 * We can't set the allowed of CSI before Form Component Initialize,
		 * So we just set the allowed values of CSI after the page was rendered
		 */
		$req.form.setCSIAllowedValues($req.form.csi_model);

		if($rf.fields.priority) {
			/** adding the priorityMatrix element to the Priority field */
			jQuery("#req-form [data-name='priority']").parent()	//No I18N
				.append("<input type='hidden' value='" //No I18N
					+ (($rf.fields.priority.current_value && $rf.fields.priority.current_value.id) ? $rf.fields.priority.current_value.id : 0) 
					+ "' id='priorityMatrix' data-field='" + $rf.fields.priority.fafr_key + "'>");	//No I18N

			/** binding priority matrix */
			DataBinder.listen(["$rf.fields.values.impact", "$rf.fields.values.urgency"], function() {	//No I18N
				$req.common.setPriorityMatrixValue();
			}, "priority_matrix_listener");	//No I18N
		}

		/** Set the -1 value for the field status */
		if($rf.fields.status){
			$rf.safeSetFieldValue("status",{ 	//NO I18N
					id:"-1",	//NO I18N
		 			name: getMessageForKey('sdp.request.bulk.nochange') // NO I18N
			});
			$rf.fields.changed = $rf.fields.changed.splice($rf.fields.changed.indexOf('status'),-1);
		}
		this.proccessDependentFields();
	},
	proccessDependentFields: function(){
		var dependendFields = [
			{
			  level1: "category", // No I18N
			  level2: "subcategory", // No I18N
			  level3: "item" // No I18N
			}
		  ];

		  for (var dIndex = 0; dIndex < dependendFields.length; dIndex++) {
			  var ele = dependendFields[dIndex];
			  var level1 = $rf.allowedValues[ele.level1];
			  var level2 = $rf.allowedValues[ele.level2];
			  var level3 = $rf.allowedValues[ele.level3];
			/**
			 * A helper function to find the array of objects has not specified options
			 * @param {*} arr 
			 */
			  	var hasNotspecified = function(arr){
					var hasnotspecified = false;
					for (var index = 0; index < arr.length; index++) {
					if(arr[index].id && arr[index].id == "0"){
						hasnotspecified = true;
					}
					}
					return hasnotspecified;
				}
				/** Not Speicified Options */
				var notSpecifiedOptions = {
					id: "0",
					name: getMessageForKey("sdp.common.notassigned")
				}
			/** 
			 * If the not specified options are not present in level1 
			 * i.e site and category
			 * */
			if( level1 && level1[0] && level1[0].id != "0"){
				if(ele.level1 == "site"){
					if(!window.isMSP) {	// do not load not associated to any site for MSP
					level1.unshift({
						id:"0", 
						name:getMessageForKey("sdp.admin.technician.addtechnician.nosite")
					});
					}
				}else{
					level1.unshift(notSpecifiedOptions);
				}
				$rf.addAllowedValues(ele.level1,"0");
			}
			if(!level1){
				return;
			}
			/**
			 * If the not specified options are not present in level2 object
			 * i.e group and subcategory
			 */
			for (var level1Obj of level1) {
				var id = level1Obj.id;
				if(!level2[id]){
					if(id == "0" && ele.level1 === "category" ){
						continue;
					}
					level2[id] = [notSpecifiedOptions];
				}else if(!hasNotspecified(level2[id])){
					level2[id].unshift(notSpecifiedOptions);
				}
			}
			/** If the site is disabled, then the level1 object should be empty */
			if(!level1.length && level2 && level2[0]){
				level2[0].unshift(notSpecifiedOptions);
			}
			$rf.addAllowedValues(ele.level2,"0");

			/**
			 * If the not specified options are not present in level3 object
			 * i.e technician and item
			 */
			for (var key in level2) {
				if (Object.hasOwnProperty.call(level2, key)) {
					var level2obj = level2[key];
					if(!level3[key]){
						level3[key] = {};
					}
					for (var index = 0; index < level2obj.length; index++) {
						var level3ID = level2obj[index].id;
						if(!level3[key][level3ID]){
							level3[key][level3ID] = [notSpecifiedOptions];
						}else if(!hasNotspecified(level3[key][level3ID])){
							level3[key][level3ID].unshift(notSpecifiedOptions);
						}
					}
				}

			}
			$rf.addAllowedValues(ele.level3,"0");

			if(ele.level1 === "category"){
				level2["-1"] = [notSpecifiedOptions];
				level3["-1"] = {
					"-1":[notSpecifiedOptions]
				}
				$rf.setFieldValue("category","-1"); // No I18N

			}
		  }
	},
	constructTemplate: function(metainfo) {
		var self = this;
		if(!metainfo || !metainfo.fields) {
			return;
		}

		var reqFields = [ "request_type", "impact", "status", "impact_details", "mode", "urgency", "level", "priority" , "space"];	//No I18N
		if(isSCP && sdp_app.IS_PRODUCT_MODULE_ENABLED){
			reqFields.push("product");
		}
		var csisgtFields = [ "category", "group", "subcategory", "technician", "item" ];	//No I18N
		if(window.sdp_app.IS_SITE_CONFIGURE) {
			csisgtFields = [ "category", "site", "subcategory", "group", "item", "technician" ];	//No I18N
		}
		if(metainfo.fields.assets) {
			csisgtFields.push( "service_category" );	//No I18N
		}
		var additionalFields = metainfo.fields.udf_fields.fields ? Object.keys(metainfo.fields.udf_fields.fields) : [];

		var constructFields = function(fields) {
			if(!fields) {
				return;
			}
			var row_c = 1;
			var field_arr = [];
			for(var f = 0, len = fields.length; f < len; f++) {
			
				var obj = { 
					"name": fields[f],	//No I18N
					"requester_can_edit": false,	//No I18N
					"requester_can_view": true,	//No I18N
					"mandatory": false,	//No I18N
					"style_properties": {},	//No I18N
					"position": { "col": "1", "col_size": "1", "row": row_c.toString(), "row_size": "1" }	//No I18N 
				};
        /**
         * Need to sort the system fields alphabetically in the client side
         */
				if(fields[f] && fields[f].indexOf("udf_") === -1 && fields[f].indexOf("qstn_") === -1 && fields[f]!="site" && fields[f]!="group" && fields[f]!="technician" ){ // NO I18N
					obj.disableSort = false;
				}else{
					obj.disableSort = true;
				}
				if(fields[f] &&obj.name.indexOf("udf_")  !== -1) {	//No I18N
					try {
						($req.form.metainfo["fields"]["udf_fields"].fields[obj.name].is_pii) && (obj.autocomplete = "off"); // NO I18N
					} catch (error) {
						/* eslint-disable no-console */
							console.error(error);
						/* eslint-enable no-console */					
					}
				}


				if((f+1) % 2 == 0) {
					obj.position.col = "2";	//No I18N
					row_c = row_c + 1;
				}
				field_arr.push(obj);
			}
			return field_arr;
		};
		var addSection = function(name, col, row, fields) {
			self.template.layouts[0].sections.push({
				"field_align": "left-right",	//No I18N
				"column_count": "2",	//No I18N
				"name": name || "-1",	//No I18N
				"collapsed_state": "expanded",	//No I18N
				"position": {	//No I18N
					"col": col || "1",	//No I18N
					"row": row || "1"	//No I18N
				},
				"fields": constructFields(fields)	//No I18N
			});
		};
		this.template = {
			"layouts":[{	//No I18N
				"name": "technician_layout",	//No I18N
				"sections": []	//No I18N
			}]
		};
		addSection( getMessageForKey("sdp.requests.newrequest.requestdetails"), "1", "1", reqFields );	//No I18N
		addSection( getMessageForKey("request.csisgt.details.title"), "1", "2", csisgtFields );	//No I18N
		addSection( getMessageForKey("sdp.requests.fieldFormRules.scriptpopup.additionalFields"), "1", "3", additionalFields );	//No I18N
		$req.form.template = this.template;
		this.entitydata = null;
	},

	saveSuccessHandler: function(data, form) {
		window.opener.WOListActions.bulkEditUpdateHandler();
		setTimeout(function(){ window.close(); }, 100);
	},

	cancelForm: function(form) {
		window.close();
	},
	reviseUpdateInfo: function(payload, form, event) {
		var updateinfo = payload.request;
		//SD-103876
		$req.common.revisePriority(updateinfo);
		for(var key in updateinfo) {
		    //UDF Format change handling. Type change from 'String' -> 'Lookup'
			if(key.indexOf("udf_")  !== -1){
                if(updateinfo[key]){
                    for (var key in updateinfo.udf_fields) {
                        if(updateinfo.udf_fields[key] && updateinfo.udf_fields[key].id == "0"){
                                updateinfo.udf_fields[key] = null;
                        }
                    }
                }
            }
            else{
                if((key === "onhold_scheduler")){ 	//NO I18N
                    if(updateinfo.onhold_scheduler.change_to_status === null){
                        delete updateinfo.onhold_scheduler
                    }
                }
                if(updateinfo[key] && updateinfo[key].id == "0"){
                     updateinfo[key] = null;
                }
            }
		}
		
		return payload
	},
	getBulkEditTemplate: function(){
		return {
			layouts: [{
				name: "technician_layout", //NO I18N
				sections:[
					  {
						"field_align": "left-right", //NO I18N
						"column_count": "2", //NO I18N
						"name": "-1", //NO I18N
						"collapsed_state": "expanded", //NO I18N
						"position": { "col": "1", "row": "2" }, //NO I18N
						"fields": [], //NO I18N
						"style_properties": { "section_style": {}, "field_style": {} } //NO I18N
					  },
					  {
						"field_align": "left-right", //NO I18N
						"column_count": "1", //NO I18N
						"name": "-1", //NO I18N
						"collapsed_state": "expanded", //NO I18N
						"position": { "col": "1", "row": "3" }, //NO I18N
						"style_properties": { "section_style": {}, "field_style": {} }, //NO I18N
						"fields": [], //NO I18N
					  }
				]
			}]
		}
	}
};
