/* $Id$ */
var $sDetails = {
    init: function(options) {
        var _self = this;
        /* Set the basic properties required for all methods */
        _self.setProp(options);
        _self.getInitData();
        _self.moduleName = _self.entity_name.charAt(0).toUpperCase() + _self.entity_name.slice(1);
        var allowedTabObj = _self.getAllowedTabs();
		var activeTabNamefromHash="details"; // No I18N
		if(_self.hash_url&&allowedTabObj.allowedTabs.includes(_self.hash_url))
		{
			activeTabNamefromHash=_self.hash_url;
		}
        var opt = {
            entity_id: _self.entity_data ? _self.entity_data.id : "", // No I18N
            module_options: options,
            printPreview: false,
            module: _self.entity_name, // No I18N
            moduleName: _self.moduleName,
            $spd: _self,
            data: {
                entity_data: _self.entity_data,
                tabData: _self.tabData,
                metainfo: _self.metainfo,
                _links: _self._links,
				summary: _self.summary,
                sdp_user: sdp_user,
				subModule : options.subModule,
				display_name : _self.display_name,
				display_name_capital : _self.display_name_capital,
				assetAssociationLinks : _self.assetAssociationLinks,
				requestAssociationLinks : _self.requestAssociationLinks,
				facilityAssociationLinks : _self.facilityAssociationLinks,
				DocumentLinks : _self.DocumentLinks
            }, // No I18N
            container: "space_detailview", // No I18N
			afterInitialRender : _self.afterInitialRender,
            panel_details: {
                content_panel: {
                    actions_panel: {
                        show: true,
                        left_panel: {
                            show: true,
							template_namespace:"spacemodule", // No I18N
                            template: "spaceactions_template", // No I18N
							afterRenderfunction : (panelObj, data)=>{
								jQuery('#create-request-from-space').off('click').on('click', (event) => { // No I18N
									$sDetails.openRequestForm();
								});
								jQuery('#copy-space-action').off('click').on('click', (event) => { // No I18N
									$sDetails.showCopyPopup();
								});
							}
                        },
                        right_panel: {
                            show: true,
							template_namespace:"spacemodule", // No I18N
                            template: "space_action_rightpanel_template" // No I18N
                        }
                    },
                    header_panel: {
                        show: true,
                        template: "space_header_template",  // No I18N
						template_namespace:"spacemodule", // No I18N
                        "class": "headerbar",  // No I18N
						afterRenderfunction : (panelObj, data)=>{
							jQuery('#personalize-space-tree-details-page').off('click').on('click', (event) => { // No I18N
								$sDetails.pesonalizeSpaceTree();
							});
						}
                    }, // No I18N
                    details_panel: {
                        show: true
                    },
                    tabs_panel: {
                        show: true,
                        name: "details", // No I18N
                        tabs: allowedTabObj.allowedTabs,
                        active: activeTabNamefromHash,
                        type: "tab", // No I18N
						"class" : "pr20 pl20 sdtabs-ui2 sdtabs-primary", // No I18N
                        afterRenderfunction: this.gotoActiveTab,
						template_namespace:"spacemodule", // No I18N
                        settings: {
                            "details": { // No I18N
                                show: true,
                                display_name: getMessageForKey("common.details"), // No I18N
                                template: "spacedetails_template", // No I18N								
                                renderfunction: this.loadSpaceDetails,
								"class": "pt10" // No I18N
                            },
							"partition": { // No I18N
                                show: true,
                                template: "roompartitions_template", // No I18N
								renderfunction: this.loadRoomPartitions,
                                display_name: getMessageForKey("space.partition")  // No I18N
                            },
							"structures": { // No I18N
                                show: true,
                                template: "structures_template", // No I18N
								renderfunction: this.loadStructures,
                                display_name: getMessageForKey("module.pluralname.structure")  // No I18N
                            },
							"floors": { // No I18N
                                show: true,
                                template: "floors_template", // No I18N
                                renderfunction: this.loadFloors,
                                display_name: getMessageForKey("module.pluralname.floor")  // No I18N
                            },
							"rooms": { // No I18N
                                show: true,
                                template: "rooms_template", // No I18N
                                renderfunction: this.loadRooms,
                               display_name: getMessageForKey("module.pluralname.room")  // No I18N
                            },							
                            "associations": { // No I18N
                                show: true,
                                template: "space_associations_template", // No I18N
                                renderfunction: this.loadSpaceAssociations,
                                display_name: getMessageForKey("sdp.project.associations.tabname"), // No I18N
                                afterRenderfunction: this.afterTabRender
                            },
                            "documents": { // No I18N
                                show: true,
                                display_name: translate("space.documents"), // No I18N
								template: "space_documents_list", // No I18N
                                renderfunction: this.loadDocuments,
								afterRenderfunction: this.afterTabRenderDocuments
                            },
                            "history": { // No I18N
                                show: true,
                                renderfunction: this.gotoTab,
                                display_name: getMessageForKey("common.history"),  // No I18N
								href: "/common/ViewHistory.jsp?id="+_self.id+"&module=spaces&sub_module="+_self.entity_name_pl+"&key=space_history_sort_order", //No I18N
                                afterRenderfunction: this.afterTabRenderHistory
                            }
                        }
                    },
                    right_panel: {
                        show: true,
                        toggle: true,
                        "sections": ["space_image","properties","criticalities", "associations"], // No I18N
                        "settings": { // No I18N
							"space_image":{ // No I18N
								show:true,
								template_namespace:"spacemodule", // No I18N
								template:"space_right_panel_image_template", // No I18N
								afterRenderfunction: this.loadRightImagePreview // No I18N
							},
							"criticalities":{ // No I18N
								show:true,
								template_namespace:"spacemodule", // No I18N
								template:"space_criticalities" // No I18N
							},
							"associations": { // No I18N
                                show: true,
                                "class": "form-horizontal form-section inplace-edit pos-rel top0 right0 p0", // No I18N
								template_namespace:"spacemodule", // No I18N
                                template: "space_associationsummary_template", // No I18N
								afterRenderfunction : (panelObj, data) => {
									jQuery('#requestSummary').off('click').on('click', (event) => { // No I18N
										$sDetails.gotoTab('associations','space-ar'); // No I18N
									});
									jQuery('#assetSummary').off('click').on('click', (event) => { // No I18N
										$sDetails.gotoTab('associations','space-aa'); // No I18N
									});
									jQuery('#serviceSummary').off('click').on('click', (event) => { // No I18N
										$sDetails.gotoTab('associations','space-af'); // No I18N
									});
								}
                            },
                            "properties": { // No I18N
                                show: true,
                                "class": "form-horizontal form-section inplace-edit pb10 pos-rel top0 right0 no-border pt10", // No I18N
                                "HTML": '<div id="right_propertysection"></div> ',
                                afterRenderfunction: this.loadRightPropertySection // No I18N
                            }
                        }
                    }
                }
            }
        };
        if (allowedTabObj.allowedTabsObjs) {
            opt.panel_details.content_panel.tabs_panel.settings = jQuery.extend(true, opt.panel_details.content_panel.tabs_panel.settings, allowedTabObj.allowedTabsObjs);
        }

        if (_self.$detailsComp) {
            _self.$detailsComp.rerenderDetails(opt, this);
        } else {
            _self.$detailsComp = new DetailsComponent(opt, this);
        }

    },
    setProp: function(options) {
		var moduleDisplayName={"campus":"space.campus","building":"space.building","nonbuilding":"space.nonbuilding","floor":"space.floor","room":"space.room","roompartition":"space.partition"}; // No I18N
		var moduleDisplayNameCapital={"campus":"space.campus.capital","building":"space.building.capital","nonbuilding":"space.nonbuilding.capital","floor":"space.floor.capital","room":"space.room.capital","roompartition":"space.roompartition.capital"}; // No I18N
        this.options = options;
        this.id = options.id;
		this.facilityFilter="";
        this.entity_name =options.entityName; // No I18N
        this.display_name = translate(moduleDisplayName[options.subModule]);
        this.display_name_capital = translate(moduleDisplayNameCapital[options.subModule]);		
        this.base_url = "/api/v3/spaces/"+options.entityNamePl; // No I18N
        this.entity_name_pl = options.entityNamePl; //No I18N
        this.hash_url = window.location.hash?window.location.hash.substring(1):'';
		this.subModule=options.subModule;
    },
    getInitData: function() {
        var _self = this;
        var dataval = ""; // No I18N
        var url = _self.base_url + "/" + _self.id;
        _self.getMetaInfo(url, _self);
        _self.constructMetaInfo(_self.metainfo.fields);
        _self.metainfo.display_name = _self.display_name;
        if (_self.id) {
            _self.fetchEntityData();
            _self.getLinks(_self.base_url + "/" + _self.id, _self);
			_self.getSummary(_self.base_url + "/" + _self.id, _self);
			_self.getDocumentsMetaInfo(_self.base_url + "/" + _self.id+"/space_documents", _self);
			if(_self.subModule=="roompartition"){
				_self.assetAssociationLinks={"canView":false}; // No I18N
				_self.requestAssociationLinks={"canView":false}; // No I18N
			}
			else{
				_self.assetAssociationLinks=_self.getAssociationLinks(_self.base_url + "/" + _self.id,"space_asset_associations");
				_self.requestAssociationLinks=_self.getAssociationLinks(_self.base_url + "/" + _self.id,"space_request_associations");
			}
			_self.facilityAssociationLinks=_self.getAssociationLinks(_self.base_url + "/" + _self.id,"space_facility_service_associations");
			_self.DocumentLinks=_self.getAssociationLinks(_self.base_url + "/" + _self.id,"space_documents");
        }
    },
    getMetaInfo: function(base_url, dataObj) {
        sdpAjax({
            url: base_url + "/metainfo", // No I18N
            success: function(resp) {
                dataObj.metainfo = resp.metainfo;
            },
            async: false
        });
    },
		    /* Modify metainfo to add the missing properties required for components */
    constructMetaInfo: function(metaFields,entityData) {
        /*Code for removing multiselect icon for all multiselect roles and udf_multiseelct fields*/
		var self=this;
        var metaKeys = Object.keys(metaFields);
        for (var i = 0; i < metaKeys.length; i++) {
            if (metaFields[metaKeys[i]].type == "lookup") {
                metaFields[metaKeys[i]].placeholder = getMessageForKey("form.select.placeholder", [metaFields[metaKeys[i]].display_name]);
            } else if (metaKeys[i] == "udf_fields") {
                var udfFields = metaFields[metaKeys[i]].fields;
                var udfFieldsObj = Object.keys(udfFields);
                for (var j = 0; j < udfFieldsObj.length; j++) {
                    if (udfFields[udfFieldsObj[j]].display_type == "MultiSelect") {
                        udfFields[udfFieldsObj[j]].selection_handler = false;
                    }
                }
            }
        }
    },	
	    /**
     * Adds context=udf_fields inside fields property
     * @layouts - [Object] layouts which contains fields
     * @udf_fields - [Object] to identify udf_fields in template layout fields, udf_fields is passed
     */
    modifyUDFFieldsProperty: function(layouts, udf_fields) {
        var self = this;
		var inputdataCB = self.getInputDataCallback();
        /*as per component need to pass context = "udf_fields" then only udf_fields render in form*/
        for (var i = 0; i < layouts.sections.length; i++) {
            for (var j = 0; j < layouts.sections[i].fields.length; j++) {
                if (udf_fields && udf_fields.hasOwnProperty(layouts.sections[i].fields[j].name)) {
                    layouts.sections[i].fields[j].context = "udf_fields";
                }
				if(inputdataCB.hasOwnProperty(layouts.sections[i].fields[j].name)){
                    layouts.sections[i].fields[j].input_data_Callback = inputdataCB[layouts.sections[i].fields[j].name];
                }
                layouts.sections[i].fields[j].sort = false;
            }
        }
    },
	getInputDataCallback: function(){
		var self=this;
        var obj = {
            supervisors: function(urlOptions,input_data,searchText){
				var idVal=self.entity_data.site;
				if(idVal==null){
					idVal="-1";
				}
                input_data.list_info.search_criteria= {"field": "associated_sites", "condition": "is", "value":idVal,"logical_operator":"and"}; //No I18N
				if(searchText){
					input_data.list_info.search_criteria.children=[{"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"}]; //NO I18N
				}				
				delete input_data.list_info["search_fields"];
                return input_data;
            },
			"department" : function(urlOptions,input_data,searchText){ //No I18N
				var idVal=self.entity_data.site;
				input_data.list_info.search_criteria= {"field": "site", "condition": "is", "value":idVal,"logical_operator":"and"}; //No I18N
				if(searchText){
					input_data.list_info.search_criteria.children=[{"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"}]; //NO I18N
				}					
				delete input_data.list_info["search_fields"];
				return input_data;						
			}
        }
        return obj;
    },
	getDocumentsMetaInfo: function(base_url, dataObj) {
        sdpAjax({
            url: base_url + "/metainfo", // No I18N
            success: function(resp) {
                dataObj.documents_metainfo = resp.metainfo;
            },
            async: false
        });
    },
    fetchEntityData: function(callback) {
        var _self = this;
        var respData = {};
        var inputObject = {
            "add_recent_item": true // No I18N
        }; // No I18N
        var dataval = sdpAjaxInputData(inputObject);
        sdpAjax({
            url: _self.base_url + "/" + _self.id, // No I18N
            data: dataval,
            success: function(resp) {
                if (resp.response_status && resp.response_status.status == "success") {
                    _self.entity_data = respData = resp[_self.entity_name];
					_self.entity_data.site = _self.entity_data.site ? _self.entity_data.site : {"id":-1,"name":translate('common.site.nosite')};//NO I18N
                }
                if(callback) {
                    callback();
                }				
            },
            async: false
        });
        jQuery("#browserTitleInfo").find("#bt_id").text(respData.id).end().find("#bt_title").text(respData.name); // No I18N
        applyBrowserTitle();
        return respData;
    },
    getLinks: function(url, dataObj) {
        var _self = this;
        sdpAjax({
            url: url + "/_links", // No I18N
            success: function(resp) {
                dataObj._links = resp._links;
                resp._links = resp._links.links ? resp._links.links : resp._links;
                var clientLinks = _self.constructLinksInfo(resp._links);
                dataObj._links = clientLinks;
            },
            async: false
        });
    },
    getSummary: function(url, dataObj) {
        var _self = this;
        sdpAjax({
            url: url+'/summary', // No I18N
            success: function(resp) {
                dataObj.summary = resp.space_summary;
            },
            async: false
        });
    },	
    constructLinksInfo: function(links) {
        var clientLinks = {},name, method, href;
        var linksLen = links ? links.length : 0;
		var _self=this;
        if (linksLen) {
            for (var i = 0; i < linksLen; i++) {
                if (!links[i]) {
                    continue;
                }
                name = links[i].name;
                method = links[i].method;
                href = links[i].href;
                if (!clientLinks[name]) {
                    clientLinks[name] = {};
                }
                clientLinks[name][method] = {};
                clientLinks[name][method] = links[i];
                clientLinks[name][method].href = href ? href : "";
            }
        }
		if(window.$SPObjLoadedIDs){
          var ids = Object.values(window.$SPObjLoadedIDs);
          var index = ids.indexOf(_self.id);
          var nextIndex = index+1;
          var prevIndex = index-1;
          (nextIndex != ids.length) && (clientLinks.nextId = ids[nextIndex])&& (clientLinks.nextModule = (window.$SPObjLoadedRecords[ids[nextIndex]].common_module).substring(6));
          (prevIndex != -1) && (clientLinks.prevId = ids[prevIndex])&& (clientLinks.prevModule = (window.$SPObjLoadedRecords[ids[prevIndex]].common_module).substring(6));
          if(Object.keys(window.$SPObjLoadedRecords).length > 1){
            clientLinks.navigation = true;
          }
        }
        return clientLinks;
    },
    loadSpaceDetails: function(tabName, tabSetting, tabs_panel) {
        var _self = this;
		_self.pushHashToURL("details"); // No I18N
        _self.getTemplateInfo();
        var template = _self.constructTemplateInfo(); // No I18N
        _self.loadEntityFields(tabName, tabSetting, tabs_panel);
    },
	pushHashToURL: function(tabName){
		var urlStr = "/ui/space?mode=details&module="+$sDetails.subModule+"&entity_id="+$sDetails.id+"#"+tabName; // No I18N
		window.history.replaceState({"hash" : tabName}, '', urlStr); // No I18N
		//window.location.hash="#"+tabName;
	},
    constructTemplateInfo: function(column_count) {
        var _self = this;
        var template = jQuery.extend(true, {}, _self.template);
        var layouts = template.layouts;
		if(_self.subModule=="room"||_self.subModule=="roompartition")
		{
			layouts[0].sections.pop();
		}
		if(template.layouts[0].sections[0].name==""||template.layouts[0].sections[0].name==null||template.layouts[0].sections[0].name=="-1")
		{
			template.layouts[0].sections[0].name=translate(_self.display_name)+" "+translate('sdp.about.details');
		}
		for(var i=0,iLen=template.layouts[0].sections.length;i<iLen;i++)
		{
			var section = template.layouts[0].sections[i];
            // If column_count is given, then alter the cols properties in template layout json
            column_count && (section.column_count = column_count);
			section.style_properties=null;			
			for(var j=0,jLen=section.fields.length;j<jLen;j++)
			{
				var field = section.fields[j];
                if (column_count) {
                    var colCount = (j + 1) % column_count;
                    var col = colCount ? colCount : column_count;
					if(field.name=="space_area")
					{
						field.name="area.space_area";
					}
                    field.position.col = col;
					field.style_properties=null;
                }				
			}
		}
		template.layouts[0].sections.push({"field_align":"left-right","column_count":"2","name":"-1","collapsed_state":"expanded","position":{"col":1,"col_size":2,"row":(template.layouts[0].sections.length-1),"row_size":1},"fields":[{"name":"created_by","position":{"col":1,"col_size":6,"row":1}},{"name":"created_time","position":{"col":2,"col_size":6,"row":1}},{"name":"last_updated_by","position":{"col":1,"col_size":6,"row":2}},{"name":"last_updated_time","position":{"col":2,"col_size":6,"row":2}},{"name":"template","position":{"col":1,"col_size":6,"row":3}}]});
        return template;
    },
    getTemplateInfo: function() {
        var _self = this,
            respData = {};
        if (_self.template) {
            respData = _self.template;
        } else {
            sdpAjax({
                url: "/api/v3"+_self.metainfo.fields.template.href+"/"+_self.entity_data.template.id, // No I18N
                success: function(resp) {
                    _self.template = respData = resp["space_template"];
                },
                async: false
            });
        }
        return respData;
    },
    loadEntityFields: function(tabName, tabSetting, tabs_panel) {

        var _self = this;
        _self.entityFields = {  };
        var entityFields = _self.entityFields;
        entityFields.initFC = function(mode) {

            /* Destroy the old instances */
            _self.$entityFields_FC && _self.$entityFields_FC.destroy();
            var column_count = 2;
            var template = _self.constructTemplateInfo(column_count); // No I18N	
            //Remove color customization and label placement applied in template
            template.style_properties = null;
            /* Add context=udf_fields for the udf fields to render udf field */
            _self.modifyUDFFieldsProperty(template.layouts[0], template[_self.entity_name].udf_fields);

            var nonEditable = _self._links.edit&&_self._links.edit.put&&_self._links.edit.put.non_editable_fields?_self._links.edit.put.non_editable_fields:[];
			nonEditable.push("available_capacity");
			nonEditable.push("created_by");
			nonEditable.push("created_time");
			nonEditable.push("last_updated_by");
			nonEditable.push("last_updated_time");
			if(_self.entity_data.common_module!="space_nonbuilding"&&_self.entity_data.common_module!="space_room"&&_self.entity_data.common_module!="space_roompartition")
			{
				nonEditable.push("total_capacity");
				nonEditable.push("occupied_capacity");
			}
			_self.entity_data.is_floating_capacity&(_self.entity_data.is_floating_capacity?_self.entity_data.is_floating_capacity={"id":1,"name":getMessageForKey("sdp.change.sla.emergency.yes")}:_self.entity_data.is_floating_capacity={"id":2,"name":getMessageForKey("sdp.change.sla.emergency.no")}); // No I18N
			_self.entity_data.is_room_partitionable&(_self.entity_data.is_room_partitionable?_self.entity_data.is_room_partitionable={"id":1,"name":getMessageForKey("sdp.change.sla.emergency.yes")}:_self.entity_data.is_room_partitionable={"id":2,"name":getMessageForKey("sdp.change.sla.emergency.no")}); // No I18N				
            /* Load FC for details sections*/
            var configJSON = {
                template: template,
                container: "spaceDetails", // No I18N
                canEdit: _self._links.edit && _self._links.edit.put?true:false,
                skipEditFields: nonEditable, // No I18N
                mode: mode ? mode : "view", // No I18N
				allowedValuesCallback: "$sDetails.getAllowedValues", //NO I18N
                edit: {
					fields:{
						"area.space_area": { //No I18N
							custom_render: _self.loadAreaField
						} 
					},
                    defaults: {
                        lookup: {
                            placeholder: translate('sdp.change.sla.select')
                        }
                    }
                },
                /*Inline save*/
                save: {
					onsave: "$sDetails.modifySaveData", //NO I18N
                    postsuccess: function(data, form) {
						_self.reinitDetailsComponent();
                    }
                },
                afterRenderCallback: function(form) {
                    jQuery("#" + form.container).find(".section-title").addClass("pl0");
					if(_self._links.edit){
						jQuery("#" + form.container+" #areaUnitView").off('click').on('click', (event) => {
							$sDetails.hideDiv('areaUnitView','areaUnitEdit',true);
						});
					}
					jQuery("#" + form.container+" #areaUnitEdit #space-area-data-save").off('click').on('click', (event) => {
						$sDetails.saveAreaData();
					});
					jQuery("#" + form.container+" #areaUnitEdit #space-area-data-cancel").off('click').on('click', (event) => {
						$sDetails.hideDiv('areaUnitEdit','areaUnitView',false);
					});
                }
            };
            if (mode == "edit") {

                configJSON.save = {
                    url: _self.base_url + "/" + _self.id, //NO I18N
					onsave: "$sDetails.modifySaveData", //NO I18N
                    entity: _self.entity_name,
                    submit: true,
                    cancel: "$spd.entityFields.cancelForm", // No I18N
                    postserializer: function(data, form) {
                        _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                        form.entitydata = data[_self.entity_name];
                    },
                    postsuccess: function(data) {
						_self.reinitDetailsComponent();
                    }
                };
            }
			configJSON.edit.fields["amenities"] = { selection_handler: "$space.showBulkSelect"}; //No I18N
			configJSON.edit.fields["criticalities"] = { selection_handler: "$space.showBulkSelect"}; //No I18N		
			configJSON.edit.fields["supervisors"] = { selection_handler: "$sDetails.showBulkSelectSupervisors"}; //No I18N					

            _self.$entityFields_FC = _self.initFormComponent(configJSON);
        };
        entityFields.cancelForm = function() {
            _self.entityFields.initFC('view'); // No I18N
        };

        _self.entityFields.initFC("view"); // No I18N
    },
    /*Passed this for bulk select for services once handled in component need to remove*/
    getAllowedValues: function(callback, formcomp) {
		formcomp.allowedValues.building_type=[{"id":1,"name":getMessageForKey("floors.and.rooms")},{"id":2,"name":getMessageForKey("rooms.only")}]; // No I18N
		formcomp.allowedValues.is_room_partitionable=[{"id":1,"name":getMessageForKey("sdp.change.sla.emergency.yes")},{"id":2,"name":getMessageForKey("sdp.change.sla.emergency.no")}]; // No I18N
		formcomp.allowedValues.is_floating_capacity=[{"id":1,"name":getMessageForKey("sdp.change.sla.emergency.yes")},{"id":2,"name":getMessageForKey("sdp.change.sla.emergency.no")}]; // No I18N
    },	
    initFormComponent: function(configJSON) {
        var _self = this;
        var config = {
            name: _self.entity_name,
            entity: _self.entity_name,
            entityName: _self.display_name, //I18Ned value
            entitypath: _self.entity_name,
            entitydata: jQuery.extend(true, {}, _self.entity_data),
            metadata: jQuery.extend(true, {}, _self.metainfo),
            mode: "view", // No I18N
            formid: _self.entity_name,
            /*Inline save*/
            save: {
                url: _self.base_url + "/" + _self.id, //NO I18N
                entity: _self.entity_name
            }
        };

        jQuery.extend(true, config, configJSON);
        return new FC(config);
    },
	afterInitialRender : function(param){
	initTooltip("#right-panel-space"); // No I18N
    SdpWidgets.renderHelpers.renderModuleWidgets({
        module:"space_campus", // No I18N
        moduleAlias:param.options.module,
        entity_id:param.options.entity_id,
        refreshPanel:()=>{
            $sDetails.$detailsComp.refreshPanel("panel","content-right"); // NO I18N
        },
		default_icon:"sspr sm-campus icon-md" // NO I18N
     });
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
	loadRightImagePreview:function()
	{
		let spaceImageElement = jQuery('#add-space-image');
			spaceImageElement.off('click').on('click', (event) => { // No I18N
				$sDetails.showAttachmentsPopup();
			});
		let photosPreviewElement = jQuery('[data-action-name="space-photos-preview-link"]');
			photosPreviewElement.off('click').on('click', (event) => { // No I18N
				jQuery('#firstImage').trigger('click');
			});
		let nodataShowAttachmentsElement = jQuery('[data-action-name="space-nodata-show-attachments-popup"]');
		if(nodataShowAttachmentsElement.length>0){
			nodataShowAttachmentsElement.off('click').on('click', (event) => { // No I18N
				$sDetails.showAttachmentsPopup();
			});
		}
		try {
			var attach_options = {
				"upload": true, // No I18N
				"enable_delete" : false, //No I18N
				"download" : true, //No I18N
				"print_preview": true	//No I18N
			};
			
			/** initializing the image viewer  */
			new attachPreview("#right-panel-image",{ //No I18N
				layouts:false,
				upload:false,
				external_links:true,
				target : 'img', //No I18N
				excludeChildOf:'a' //No I18N
			});
		} catch(ex) {
			console.error(ex);
		}
	},
	loadRightPropertySection: function()
    {
			var _self = this;
            var requiredfields = [];  // No I18N
			var nonEditable=[];
			if(_self.entity_data.common_module=="space_campus")
			{
				requiredfields = ["name","site","total_capacity","occupied_capacity","status"];  // No I18N
				nonEditable=["name","site","total_capacity","occupied_capacity"]; // No I18N
			}
			else if(_self.entity_data.common_module=="space_building"||_self.entity_data.common_module=="space_nonbuilding")
			{
				requiredfields = ["name","site","space_campus","total_capacity","occupied_capacity","status"];  // No I18N
				nonEditable=["name","site","space_campus","total_capacity","occupied_capacity"]; // No I18N
			}
			else if(_self.entity_data.common_module=="space_floor")
			{
				requiredfields = ["name","site","space_campus","space_building","total_capacity","occupied_capacity","status"];  // No I18N
				nonEditable=["name","site","space_campus","space_building","total_capacity","occupied_capacity"]; // No I18N
			}
			else if(_self.entity_data.common_module=="space_room")
			{
				requiredfields = ["name","site","space_campus","space_building","space_floor","total_capacity","occupied_capacity","status"];  // No I18N
				nonEditable=["name","site","space_campus","space_building","space_floor","total_capacity","occupied_capacity"]; // No I18N
			}
			else if(_self.entity_data.common_module=="space_roompartition")
			{
				requiredfields = ["name","site","space_campus","space_building","space_floor","space_room","total_capacity","occupied_capacity","status"];  // No I18N
				nonEditable=["name","site","space_campus","space_building","space_floor","space_room","total_capacity","occupied_capacity"]; // No I18N
			}			
            var column_count = "1";
            var template = _self.constructTemplate(requiredfields,column_count,null);
            _self._links.edit && _self._links.edit.put && _self._links.edit.put.non_editable_fields && (nonEditable = nonEditable.concat(_self._links.edit.put.non_editable_fields));            
            //Destroy the old instance
            _self.$rightpropertyfields_FC && _self.$rightpropertyfields_FC.destroy();
            /* Load FC for right property section */
            var rightPropFcConfig = {
                template: template,
                container: "right_propertysection",   // No I18N
                formid: "rightPanelProperty",   // No I18N
				preFix:"rpanel",// No I18N
                skipEditFields: nonEditable, // No I18N
                canEdit: _self._links.edit && _self._links.edit.put?true:false,
                edit: {
                    defaults: {
                        lookup:{
                             placeholder:translate('sdp.change.sla.select'),
                        }
                    }
                },
                afterRenderCallback: function(){
                  jQuery("#"+this.container).find('[data-id="form-fixed-wrapper"]').css("padding-bottom",'').end()
                    .find(".form-wrapper").removeClass("pb25").end()
                    .find(".form-section").addClass('noborder p0');

                },
                /*Inline save*/
                save: {
                    postsuccess: function(data, form) {
						_self.reinitDetailsComponent();
                    }
                },				
            };
            _self.$rightpropertyfields_FC = _self.initFormComponent(rightPropFcConfig);
	},
	constructTemplate : function(requiredfields,column_count,fieldsProperty)
    {
		var fieldsLayout = [];
		for(var i=0,iLen=requiredfields.length;i<iLen;i++)
		{
			field=requiredfields[i];
			var obj = {};
			obj.name = field;
			var colCount = (i+1)%column_count;
			var col = colCount ? colCount : column_count;
			obj.position = {"col": col,"col_size": 1,"row": i+1,"row_size": 1};
			if(fieldsProperty && fieldsProperty.hasOwnProperty(field)){
				jQuery.extend(true,obj,fieldsProperty[field]);
			}
			fieldsLayout.push(obj);
        }
        var template = {"layouts": [  {  "column_count": 1 ,  "sections": [{"column_count": column_count,"fields": fieldsLayout }] }] };   // No I18N
        return template;
	},
	getAllowedTabs : function()
	{
			var _self=this;
			var allowedTabObj ={};
			 if(_self.entity_data.common_module=="space_campus"){
				allowedTabObj = { "allowedTabs" : ["details", "structures",  "associations", "documents","history"] }; // No I18N
			 }
			 else if(_self.entity_data.common_module=="space_building"){
				 if(_self.entity_data.building_type=="Floors and Rooms"){
					allowedTabObj = { "allowedTabs": ["details", "floors", "rooms",  "associations", "documents","history"] }; // No I18N
				 }
				 else{
					 allowedTabObj = { "allowedTabs": ["details", "rooms",  "associations", "documents","history"] }; // No I18N
				 }
			 }
			 else if(_self.entity_data.common_module=="space_nonbuilding"){
				allowedTabObj = { "allowedTabs": ["details", "associations", "documents","history"] }; // No I18N
			 }	
			 else if(_self.entity_data.common_module=="space_floor"){
				allowedTabObj = { "allowedTabs": ["details",  "rooms",  "associations", "documents","history"] }; // No I18N
			 }
			 else if(_self.entity_data.common_module=="space_room"){
				 if(_self.entity_data.is_room_partitionable){
					 allowedTabObj = { "allowedTabs": ["details","partition", "associations", "documents","history"] }; // No I18N
				 }
				 else{
					allowedTabObj = { "allowedTabs": ["details", "associations", "documents","history"] }; // No I18N
				 }
			 }
			 else if(_self.entity_data.common_module=="space_roompartition"){
				allowedTabObj = { "allowedTabs": ["details", "associations", "documents","history"] }; // No I18N
			 }			 
			return allowedTabObj; 
	},
	modifySaveData: function(saveData) {
		var self=this;
		var inputKeys = Object.keys(saveData);
		for(var i=0;i<inputKeys.length;i++)
		{
			if(inputKeys[i]=="site"&&saveData["site"].id==-1)
			{
				saveData["site"]=null;
			}
			if(inputKeys[i]=="is_room_partitionable")
			{
				if(saveData["is_room_partitionable"].id==1)
				{
					saveData["is_room_partitionable"]=true;
				}
				else 
				{
					saveData["is_room_partitionable"]=false;
				}
			}
			if(inputKeys[i]=="is_floating_capacity")
			{
				if(saveData["is_floating_capacity"].id==1)
				{
					saveData["is_floating_capacity"]=true;
				}
				else 
				{
					saveData["is_floating_capacity"]=false;
				}
			}
			if(inputKeys[i]=="building_type")
			{
				if(saveData["building_type"].id==1)
				{
					saveData["building_type"]="Floors and Rooms";  // No I18N
				}
				else 
				{
					saveData["building_type"]="Rooms Only";  // No I18N
				}
			}
		}
        return saveData;
    },
	reinitDetailsComponent: function()
    {
		//When details component is rerendered, all form component instance should be destoryed, otherwise form instance conflict will occur
        if(FC_Mapper && FC_Mapper.count > 0){
			var forms = Object.keys(FC_Mapper);
            forms.splice(forms.indexOf("count"),1);
			for(var i=0,iLen=forms.length;i<iLen;i++)
			{
				form=forms[i];
                FC_Mapper[form].destroy();
            }
        }
        var opt = $sDetails.options;
        $sDetails.init(opt);
	},
	showCopyPopup : function(ele)
	{
		var htmlDiv = '<div id="copy_space_popup" >'+
'<form class="form-horizontal bubble-hor" name="newcopyspaceform" id="newcopyspaceform">'+
	'<div class="wrapscroller">'+
		'<div class="scroller">'+
			'<div class="alert alert-warning icon" role="alert">'+
				'<span class="msg">'+getMessageForKey("copy.space.info")+'</span>'+
            '</div>'+
            '<div class="form-group pos-rel">'+
				'<label for="noofcopies">'+getMessageForKey("sdp.requests.copy.number")+'<span class="mandatory">*</span></label>'+
                    '<input id="noofcopies" class="form-control" type="number" min="1" max="10" data-msg-required="'+ getMessageForKey('enter.valid.number.range',[1,10])+'" data-rule-required="true" aria-required="true" >'+
                '</div>'+
            '</div>'+
	'</div>'+
    '<div class="form-footer">'+
		'<button id="copy-space-footer" class="btn btn-primary" type="button"  id="copyspacesave">'+getMessageForKey("sdp.common.copy")+'</button>'+ // No I18N
        '<button id="cancel-copy-space-footer" class="btn btn-default"  type="button">'+getMessageForKey("sdp.common.cancel")+'</button>'+ // No I18N
	'</div></form></div>';		
		jQuery('#copy_space_popup_container').dialog({
			title:window.translate("copy.space"),
			autoOpen : false, 
			modal : true, 
			position: { my: "center top+50", at: "center top+50", of: window },//No I18N
			maxHeight: 300,
			open: function(event, ui){
				jQuery('#copy_space_popup_container #copy-space-footer').off('click').on('click', (event) => {
					$sDetails.copySpace();
				});
				jQuery('#copy_space_popup_container #cancel-copy-space-footer').off('click').on('click', (event) => {
					jQuery('#copy_space_popup_container').dialog('close');
				});
				jQuery('#copy_space_popup_container form').off('submit').on('submit', (event) => {
					$sDetails.copySpace();
					return false;
				});

			},
			close: function(event,ui){
				jQuery('#copy_space_popup').remove();
				jQuery('#copy_space_popup_container').dialog("destroy"); // No I18N
			},
			width: 500,
		}).html(htmlDiv).dialog("open"); // No I18N
	},
		copySpace : function(ele)
		{
			var _self=this;
			var n = jQuery('#noofcopies').val();
			if(n==null||n==""||!(["1","2","3","4","5","6","7","8","9","10"].includes(n)))
			{
				jQuery('#noofcopies').val("");
				showalert("failure", getMessageForKey('enter.valid.number.range',[1,10]) , "isAutoHide=true");  //No I18N
				return;
			}
			jQuery('#copyspacesave').prop("disabled", true);  //No I18N
			n = parseInt(n);
			var data = {"copy": {"number_of_spaces": n, "name_prefix": ""}}; // No I18N
		    var inputData = sdpAjaxInputData(data);
			sdpAjax({
				url: _self.base_url+ "/" +_self.id+ "/_copy" ,
                type: "POST", //No I18N
                data: inputData,
                success: function(resp){
					jQuery('#copy_space_popup_container').dialog('close'); // No I18N
						showalert("success", translate('sdp.requests.history.copied') , "isAutoHide=true");  //No I18N
					}
            });
		},
		showAttachmentsPopup : function(){
			var self=this;
			var attachOptions=  {
                api: true,
				direct_upload:true,
                upload_api: true,
                upload: true,
				allowed_ext:['jpeg','jpg','png','gif'],//No I18N
				accept_mimes: "image/png,image/jpeg", // No I18N
                enable_delete: true,
                is_odapi: true,
                download: true,
				is_odapi_v2:true,
				iconRender: true,
				markactivefn: function(id) {
					self.display_image=id;
				},
				onready: function() {
					setTimeout(function() {
						jQuery("#attachImagesButton").off().on("click",function() {
							jQuery("#attachments-popup-container :input[type='file']").trigger("click")
						})
					}, 200)
				},
				markactiveAttach:{"id":self.entity_data.display_image}, // No I18N
                entity: "spaces/" + self.entity_data.type.api_plural_name,//No I18N
				entity_id:self.entity_data.id,
				titleText: "<span>" + window.getMessageForKey("space.imageattachment") + '<button id="attachImagesButton" class="linkBorder ml10" data-attach-exclude="true">' + window.getMessageForKey("attach.images") + "</button></span>" // No I18N
            };
			jQuery('#attachments-popup-container').dialog({
				title:window.translate("zeditor.image"),
				autoOpen : false, 
				modal : true, 
				position: { my: "center top+50", at: "center top+50", of: window },//No I18N
				maxHeight: 'auto', // No I18N
				minWidth:'900',
				open: function(event, ui){
					self.attachInstanceSpace = new attachPreview('#attach-images-button',attachOptions); //No I18N		
					jQuery('#attachImagesButton').click(function() {
						jQuery("#attachments-popup-container :input[type='file']").trigger("click");
					});
				},
				close: function(event, ui){
					jQuery('#attach-images-button').html("");
                    self.fetchEntityData(function() {
						var isValidDisplayImage=false;
						if(self.display_image&&self.entity_data.attachments){
							for(var i=0;i<self.entity_data.attachments.length;i++){
								if(self.entity_data.attachments[i].id.toString()==self.display_image.toString()){
									isValidDisplayImage=true;
									break;
								}
							}
						}
						if(isValidDisplayImage==false){
							if(self.entity_data.attachments&&self.entity_data.attachments.length>0){
								self.display_image=self.entity_data.attachments[0].id;
							}else{
								self.display_image="";
							}
						}
						var data = { };
						data[self.entity_name]= {"display_image":(self.display_image?self.display_image:"")}; // No I18N
						var inputData = sdpAjaxInputData(data);
						sdpAjax({
							url: self.base_url+ "/" +self.id ,
							type: "PUT", //No I18N
							data: inputData,
							success: function(resp){
								self.entity_data.display_image=self.display_image;
								self.$detailsComp.options.data.entity_data = self.entity_data;
								self.$detailsComp.refreshPanel("panel","content-right"); // NO I18N
								initTooltip('.rhs-sections'); // NO I18N
							},
							async: false
						});
                    });
					jQuery('#attachments-popup-container').html("");
					jQuery('#attachments-popup-container').dialog("destroy"); // No I18N
				},
				width: 500,
			}).html('<div id="attachments-popup-container-dialog" class="pb20"><div id="attach-images-button"></div></div>').dialog("open");	 // No I18N
					
		},
	loadSpaceAssociations: function(){
		var _self=this;
		_self.pushHashToURL("associations"); // No I18N
		jQuery('#content-details-inner-'+_self.entity_name).removeClass('oxa');
		if(_self.requestAssociationLinks.canView){
			this.loadRequests();
		}
		if(_self.assetAssociationLinks.canView){
			this.loadAssets();
		}
		if(_self.facilityAssociationLinks.canView){
			this.loadServices();
		}
	},
	loadRequests: function()
	{
		var table_content = {};
		var _self=this;
		table_content.header = _self.headerdataConstructForAssociation(); 
		setTimeout(function()
		{
			var options = {};
			options.isFR_ListInfo_Support = true;
			options.support_search_criteria = true;
			options.paginationEnabled = true;
			options.searchEnabled = true;
			options.sortingEnabled = true;
			options.isODAPI             = true;
			options.nodatabanner_callback=_self.nodatabanner_callback_request;
			options.callbackRowfunction = _self.rowdataConstructForAssociation;
			options.row_inputdata = _self.rowdataConstructForAssociation(table_comp.getTableInfo());
			options.callbackURL = 'spaces/'+_self.entity_data.type.api_plural_name+'/'+_self.entity_data.id+'/space_request_associations'; // No I18N
			options.entity_name = "space_request_associations";  // No I18N
			options.tableHolder="space_request_associations"; // No I18N
			options.default_sort_field = {"sort_field" : "request.subject","sort_order" : "asc"};//No i18N
			options.staticHeader = true;
			options.height = 250;
			options.width = "100%"; //No I18N
			options.callbackAfterBodyRender= () => {
				jQuery('#space_request_associations_div [data-action-name="openRequestDetails"]').off('click').on('click', (event) => {// No I18N
					window.open('/WorkOrder.do?woMode=viewWO&woID='+event.currentTarget.dataset.requestId,'_blank','noopener');
				});
			}
			var table_compreq = new tableComponent(table_comp.getTableInfo(), table_content, options, _self);
			_self.requestAssociationTableComp=table_compreq;
			jQuery('#space_request_associations_tbody').css('position','relative'); // No I18N
		},0);
	},
	
	// to construct meta data 
    headerdataConstructForAssociation: function()
    {
		var tableWidth = jQuery("#space_request_associations_div").width() - 110 +"px"; // No I18N
		var meta_data = {};
		meta_data["linkCell"] = {
			"dataCelltransformer": this.constructRequestLink, // No I18N
			 "type": "icon", // No I18N
             "hide_label": true , //No I18N
			"width":"40px" // No I18N
			};
		meta_data["request.subject"] = {
			"dataCelltransformer": this.constructRequestSubject, // No I18N
                "text": "common.request", // No I18N
				"width":tableWidth // No I18N
        };
        return meta_data;
    },
	constructRequestLink: function(table_data)
	{
		var rd = table_data.row_data;
		return '<span class="tc"> <span class="cspr flat icon-sm newtab vbase cur-ptr" role="img" title="'+window.getMessageForKey('sdp.requests.newrequest.autosuggest.newwindow.open')+'" data-action-name="openRequestDetails" data-request-id="'+rd.request.id+'" rel="uitip"></span></span>';
	},
	rowdataConstructForAssociation: function(table_info,facilityFilter)
    {
        var inputObject = {};
		inputObject.list_info = table_info.list_info;
		if(facilityFilter&&facilityFilter!="")
		{
			inputObject.list_info.search_criteria={"field":"facility_service.template","condition":"is","value":facilityFilter}; // No I18N
		}
        return inputObject;
    },
	rowdataConstructForDocuments: function(table_info)
    {
        var inputObject = {};
		inputObject.list_info = table_info.list_info;
        var fields_required = table_info.fields_required;
        var fields_required_arr = Object.keys(fields_required);
        var actioncellIndex = fields_required_arr.indexOf("actioncell"); // No I18N
        actioncellIndex > -1 && fields_required_arr.splice(actioncellIndex, 1);
        var chkindex = fields_required_arr.indexOf("space_documents_head_chk"); // No I18N
        chkindex > -1 && fields_required_arr.splice(chkindex, 1);	
		fields_required_arr.push("name");
		fields_required_arr.push("created_by");		
		inputObject.fields_required = fields_required_arr;
        return inputObject;
    },	
	loadAssets: function()
	{
        jQuery('#space-aa #attach-assets-popup-button').off('click').on('click', (event) => { // No I18N
			$sDetails.showAssetsPopup();
		});
		jQuery('#space-aa #dettach-assets-popup-button').off('click').on('click', (event) => { // No I18N
			jQuery('#space_asset_associations_btn_delete').trigger('click');
		});
		var table_content = {};
		var _self=this;
		table_content.header = _self.headerdataConstructForAssetAssociation(); 
		setTimeout(function()
		{
			var options = {};
			options.isFR_ListInfo_Support = true;
			options.support_search_criteria = true;
			options.paginationEnabled = true;
			options.searchEnabled = true;
			options.sortingEnabled = true;
			options.isODAPI             = true;
			options.multiDeleteEnabled = true;
			options.callbackRowfunction = _self.rowdataConstructForAssociation;
			options.row_inputdata = _self.rowdataConstructForAssociation(table_comp.getTableInfo());
			options.nodatabanner_callback=_self.nodatabanner_callback_asset;
			options.callbackURL = 'spaces/'+_self.entity_data.type.api_plural_name+'/'+_self.entity_data.id+'/space_asset_associations'; // No I18N
			options.deleteURL=options.callbackURL;
			options.entity_name = "space_asset_associations";  // No I18N
			options.tableHolder="space_asset_associations"; // No I18N
			options.default_sort_field = {"sort_field" : "asset.name","sort_order" : "asc"};//No i18N
			options.staticHeader = true;
			options.height = 250;
			options.width = "100%"; //No I18N
			options.callbackAfterBodyRender= () => {
				jQuery('#space_asset_associations_div [data-action-name="openAssetDetails"]').off('click').on('click', (event) => {// No I18N
					window.open('/Assets.do?entity_id='+event.currentTarget.dataset.assetId,'_blank','noopener');
				});
				jQuery('#space_asset_associations_nodatabanner [data-action-name="showAssetsPopup"]').off('click').on('click', (event) => {// No I18N
					$sDetails.showAssetsPopup();
				});
			}
			options.delete_callback = function(data){ _self.updateAssociationsCount(); }
			var table_compreq = new tableComponent(table_comp.getTableInfo(), table_content, options, _self);
			_self.assetTableComp=table_compreq;
			jQuery('#space_asset_associations_tbody').css('position','relative'); //No I18N
		},0);
	},
	
	// to construct meta data 
    headerdataConstructForAssetAssociation: function()
    {
		var tableWidth = jQuery("#space_asset_associations_div").width() - 218 +"px"; // No I18N
		var meta_data = {};
		if($sDetails.assetAssociationLinks["delete"]){
		meta_data["space_asset_associations_head_chk"] = {
                "type": "checkbox", //No I18N
				"width":"40px" // No I18N
		};
		meta_data["actioncell"] = {
			 "dataCelltransformer": this.constructEditCell, // No I18N
			 "type": "icon", // No I18N
             "hide_label": true , //No I18N
			 "width":"40px", // No I18N
			 "td_class":"pos-rel" // No I18N
			};
		}
		meta_data["linkCell"] = {
			"dataCelltransformer": this.constructAssetLink, // No I18N
						 "type": "icon", // No I18N
             "hide_label": true , //No I18N
			"width":"40px" // No I18N
			};
		meta_data["asset.name"] = {
			"dataCelltransformer": this.constructAssetName, // No I18N
                "text": window.getMessageForKey("sdp.inventory.viewAssets.detailView.assetName"), // No I18N
				"width":tableWidth // No I18N
        };
        return meta_data;
    },
	constructRequestSubject: function(table_data)
	{
		var rd = table_data.row_data;
		return '<a rel="uitip" mode_ellipsis=true  title="'+e_attr(rd.request.subject)+'" class="cur-ptr" href="/" data-action-name="openRequestDetails" data-request-id="'+rd.request.id+'" >'+e_html(rd.request.subject)+'</a>';
	},	
	constructEditCell: function(table_data){
		return '<div class="btn-group tc-req-edit bs-noconflict pos-abs  ml10"> <span class="cur-ptr cspr menulist icon-xs flat  sdmenu-toggle vmiddle mt-2" role="img" title="'+window.getMessageForKey('common.actions')+'" rel="uitip" data-switch="sdmenu"></span>'+
                 '<ul class="sdmenu-dd whitebg btn-default p0">  <li><a href="/" data-table-delete data-entityid="'+table_data.row_data.id+'" >'+window.translate('sdp.common.dissociate')+'</a> </li></ul>  </div>';
	},
	constructAssetLink: function(table_data)
	{
		var rd = table_data.row_data;
		return '<span class="tc"> <span class="cspr flat icon-sm newtab vbase cur-ptr" role="img" title="'+window.getMessageForKey('sdp.requests.newrequest.autosuggest.newwindow.open')+'" data-action-name="openAssetDetails" data-asset-id="'+rd.asset.id+'" rel="uitip"></span></span>';
	},
	constructAssetName: function(table_data)
	{
		var rd = table_data.row_data;
		return '<a rel="uitip" mode_ellipsis=true title="'+e_attr(rd.asset.name)+'" href="/" class="cur-ptr" data-action-name="openAssetDetails" data-asset-id="'+rd.asset.id+'" >'+e_html(rd.asset.name)+'</a>';
	},	
	associateModule : function(entityKey,associateEntity,dialogId)
	{
		var ids= [];
		var eleId="facility_service"; //No I18N
		if(associateEntity=="asset"){
			eleId="asset"; //No I18N
		}
		jQuery('#'+eleId+'_body input[type="checkbox"]').each(function () {
			if (jQuery(this).is(':checked')) {
				ids.push(jQuery(this).val());
			}
		});
		var inputArray=[];
		if(ids!=null&&ids.length>0)
		{
			for(var i=0;i<ids.length;i++){
				var obj={};
				obj[associateEntity]={"id": ids[i]};
				inputArray.push(obj);
			}
		}
		var inputData={};
		inputData[entityKey]= inputArray; // No I18N
		sdpAjax({
            url: '/api/v3/spaces/'+$sDetails.entity_data.type.api_plural_name+'/'+$sDetails.entity_data.id+'/'+entityKey,// No I18N
            type: "post",// No I18N
			data: sdpAjaxInputData(inputData),
            success: function () {
                showalert('success', translate("sdp.checklist.associated"), "isAutoHide=true"); // No I18N
				jQuery('#'+dialogId).dialog('close'); // No I18N
				if(associateEntity=="asset"){
					$sDetails.assetTableComp.refreshTable("refresh"); // No I18N
				}
				else{
					$sDetails.facilityTableComp.refreshTable("refresh"); // No I18N
				}
				$sDetails.updateAssociationsCount();
            }
        });
	},
	showAssetsPopup : function(ele)
	{
		var self=this;
		var div= 	'<div id="space_assets_table"> <div class="uicomponent listview task-list-wrap fw"> <div class="listcontrols">'+
							'<div class="fl ml10 mr10" id="t_searchicon_asset"></div>'+
							'<div class="btn-group mr10 fl"><div id="pagination_comp_asset"></div></div>'+
						'</div> <div class="uicomponent listview task-list-wrap fw"><div class="tablelist" id="asset_div" ></div>'+
						'<div class="form-footer">'+
							'<button id="asset-popup-save" class="btn btn-primary" data-link="asset" type="button">'+window.getMessageForKey('sdp.common.choose')+'</button>'+ // No I18N
							'<button id="asset-popup-cancel"class="btn btn-default"  type="button">'+window.getMessageForKey('common.close')+'  </button>'+  //No I18N
						'</div></div>';		
			jQuery('#asset-popup').dialog({
					title:window.getMessageForKey("sdp.helpdesk.common.associateci.popup.title"),
					autoOpen : false, 
					modal : true, 
					position: { my: "center top+50", at: "center top+50", of: window },//No I18N
					width: 700,
					resizable: false,
					open: function(event, ui){
						self.loadAssetsPopupTable();
						jQuery('#asset-popup #asset-popup-save').off('click').on('click', (event) => {
							$sDetails.associateModule('space_asset_associations','asset','asset-popup');
						});
						jQuery('#asset-popup #asset-popup-cancel').off('click').on('click', (event) => {
							jQuery('#asset-popup').dialog('close');
						});
					},
					close: function(event, ui){
						jQuery('#space_assets_table').remove();
						jQuery('#asset-popup').dialog("destroy"); // No I18N
					}					
			}).html(div).dialog("open"); // No I18N
	},
	rowdataConstructForAssetPopup: function(table_info)
    {
        var inputObject = {};
		inputObject.list_info = table_info.list_info;
		var siteInput=null;
		if($sDetails&&$sDetails.entity_data&&$sDetails.entity_data.site&&$sDetails.entity_data.site.id!="-1"){
			siteInput=$sDetails.entity_data.site.id;
		}
		table_info.list_info.search_criteria = [{"field": "space", "condition": "is", "value": null,"logical_operator":"and"},{"field": "site", "condition": "is", "value": siteInput,"logical_operator":"and"}];  //No I18N
		inputObject.fields_required= ["name", "asset_tag", "location", "org_serial_number", "product_type", "integration_mappings", "type", "category", "site"]; //No I18N
        return inputObject;
    },	
	loadAssetsPopupTable: function()
	{
		var table_content = {};
		var _self=this;
		table_content.header = _self.headerdataConstructForAssetPopup(); 
		setTimeout(function()
		{
			var options = {};
			options.paginationEnabled = true;
			options.searchEnabled = true;
			options.sortingEnabled = true;
			options.isODAPI             = true;
			options.callbackRowfunction = _self.rowdataConstructForAssetPopup;
			options.row_inputdata = _self.rowdataConstructForAssetPopup(table_comp.getTableInfo());
			options.callbackURL = 'spaces/'+_self.entity_data.type.api_plural_name+'/asset'; // No I18N
			options.entity_name = "asset";  // No I18N
			options.tableHolder="asset"; // No I18N
			options.default_sort_field = {"sort_field" : "name","sort_order" : "asc"};//No i18N
			options.staticHeader = true;
			options.height = 400;
			options.width = 700;
			options.support_search_criteria=true;
			options.isFR_ListInfo_Support = true;
			options.callbackSearchFunction=$sDetails.assetCallbackSearchFunction;
			$sDetails.assetPopupTableComp = new tableComponent(table_comp.getTableInfo(), table_content, options, _self);
		},100);
	},
	assetCallbackSearchFunction:function(){
		var siteInput=null;
		if($sDetails&&$sDetails.entity_data&&$sDetails.entity_data.site&&$sDetails.entity_data.site.id!="-1"){
			siteInput=$sDetails.entity_data.site.id;
		}
		var spaceCriteria = {"field": "space", "condition": "is", "value": null,"logical_operator":"and"};  // No I18N
		var siteCriteria = {"field": "site", "condition": "is", "value": siteInput,"logical_operator":"and"};  // No I18N
		if(!$sDetails.assetPopupTableComp.t_obj.table_info.list_info.search_criteria){
			$sDetails.assetPopupTableComp.t_obj.table_info.list_info.search_criteria=spaceCriteria;
			$sDetails.assetPopupTableComp.t_obj.table_info.list_info.search_criteria.children=[siteCriteria];
		}
		else{
			if(!$sDetails.assetPopupTableComp.t_obj.table_info.list_info.search_criteria.children){
				$sDetails.assetPopupTableComp.t_obj.table_info.list_info.search_criteria.children=[];
				$sDetails.assetPopupTableComp.t_obj.table_info.list_info.search_criteria.children.push(spaceCriteria);
				$sDetails.assetPopupTableComp.t_obj.table_info.list_info.search_criteria.children.push(siteCriteria);				
			}
			else{
				$sDetails.assetPopupTableComp.t_obj.table_info.list_info.search_criteria.children.push(spaceCriteria);
				$sDetails.assetPopupTableComp.t_obj.table_info.list_info.search_criteria.children.push(siteCriteria);					
			}
		}
		$sDetails.assetPopupTableComp.refreshTable("refresh"); // No I18N		
	},
	
	// to construct meta data 
    headerdataConstructForAssetPopup: function()
    {
		var meta_data = {};
		meta_data["asset_head_chk"] = {
                "type": "checkbox", //No I18N
				"width":"40px" // No I18N
		};
		meta_data["name"] = {
                "text": window.getMessageForKey("sdp.inventory.viewAssets.detailView.assetName") // No I18N
        };
		meta_data["asset_tag"] = {
                "text": window.getMessageForKey("sdp.inventory.detailAsset.assetTag") // No I18N
        };
		meta_data["location"] = {
                "text": window.getMessageForKey("sdp.inventory.detailAsset.Location") // No I18N
        };
		meta_data["org_serial_number"] = {
                "text": window.getMessageForKey("sdp.inventory.asset.org.serialnumber") // No I18N
        };		
        return meta_data;
    },
	loadServices: function()
	{
		jQuery('#space-af #associate-facility-services-button').off('click').on('click', (event) => { // No I18N
			$sDetails.showFacilityPopup();
		});
		jQuery('#space-af #dissociate-facility-services-button').off('click').on('click', (event) => { // No I18N
			jQuery('#space_facility_service_associations_btn_delete').trigger('click');
		});
		var table_content = {};
		var _self=this;
		table_content.header = _self.headerdataConstructForServiceAssociation(); 
		setTimeout(function()
		{
			var options = {};
			options.isFR_ListInfo_Support = true;
			options.support_search_criteria = true;
			options.paginationEnabled = true;
			options.searchEnabled = true;
			options.sortingEnabled = true;
			options.isODAPI             = true;
			options.multiDeleteEnabled = true;
			options.callbackRowfunction = _self.rowdataConstructForAssociation;
			options.nodatabanner_callback=_self.nodatabanner_callback_facility;
			options.row_inputdata = _self.rowdataConstructForAssociation(table_comp.getTableInfo(),$sDetails.facilityFilter);
			options.callbackURL = 'spaces/'+_self.entity_data.type.api_plural_name+'/'+_self.entity_data.id+'/space_facility_service_associations'; // No I18N
			options.deleteURL=options.callbackURL;
			options.entity_name = "space_facility_service_associations";  // No I18N
			options.tableHolder="space_facility_service_associations"; // No I18N
			options.default_sort_field = {"sort_field" : "facility_service.name","sort_order" : "asc"};//No i18N
			options.previewSettings={"contentCB":$sDetails.contentCBFacility,"afterCB":$sDetails.afterCBFacility}; // No I18N
			options.staticHeader = true;
			options.height = 250;
			options.width = '100%'; //No I18N
			options.delete_callback = function(data){ _self.updateAssociationsCount(); }
			options.callbackAfterBodyRender= () => {
				jQuery('#space_facility_service_associations_nodatabanner [data-action-name="showFacilityPopupNodata"]').off('click').on('click', (event) => {// No I18N
					$sDetails.showFacilityPopup();
				});
			}
			var table_compreq = new tableComponent(table_comp.getTableInfo(), table_content, options, _self);
			_self.facilityTableComp=table_compreq;
			var ele = jQuery("#facility_association_filter");
			ele.sdp_select2({
				cache:{},
				closeOnSelect : false,
				multiple:false,
				placeholder: getMessageForKey("sdp.request.externalaction.allSerTemp"), // No I18N
				allowClear: true,
				url:[{
					url:"/api/v3/facility_services/template",//NO I18N
					field:'template'//NO I18N
				}]
			});
			jQuery("#facility_association_filter").on("change", function(e) { 
				$sDetails.facilityFilter=e.val;
				if(e.val!=null&&e.val!="")
				{
					var search_criteria = _self.facilityTableComp.t_obj.table_info.list_info.search_criteria;
					_self.facilityTableComp.t_obj.default_search_criteria = { "field":"facility_service.template", "value":e.val, "condition":"eq" }; // No I18N
					if(jQuery.isEmptyObject(search_criteria))
					{
						search_criteria = {"field":"facility_service.template","value":e.val,"condition":"is"}; // No I18N
					} else {
						search_criteria = $spaceList.clearSearchCriteria(search_criteria,"facility_service.template"); // No I18N
						if(search_criteria.children){
							search_criteria.children.push({"field":"facility_service.template","value":e.val,"condition":"is","logical_operator":"and"}); // No I18N
						} else {
							if(!jQuery.isEmptyObject(search_criteria)){
								search_criteria.children = [{"field":"facility_service.template","value":e.val,"condition":"is","logical_operator":"and"}]; // No I18N
							} else {
								search_criteria = {"field":"facility_service.template","value":e.val,"condition":"is"}; // No I18N
					        }
					    }
					}
					_self.facilityTableComp.t_obj.table_info.list_info.search_criteria = search_criteria;
					_self.facilityTableComp.refreshTable("refresh"); // No I18N
				}
				else{
					_self.facilityTableComp.setDefaultSearchCriteria(null);
                    var search_criteria = _self.facilityTableComp.t_obj.table_info.list_info.search_criteria;
					search_criteria = $spaceList.clearSearchCriteria(search_criteria,"facility_service.template"); // No I18N
					_self.facilityTableComp.t_obj.table_info.list_info.search_criteria=search_criteria;
					_self.facilityTableComp.refreshTable("refresh"); // No I18N
				}
			})
			jQuery('#space_facility_service_associations_tbody').css('position','relative'); //No I18N
		},1);
	},
			contentCBFacility : function(APIData){
				var fields=$space.getTemplateFields(this.facility_service.id,this.facility_service.template.id);
				var entityData=$space.getEntityData(this.facility_service.id);
				if(!$sDetails.facility_metainfo){
					var facility_metainfo={}
					$sDetails.getMetaInfo('/api/v3/facility_services/'+this.facility_service.id,facility_metainfo); // No I18N
					$sDetails.facility_metainfo=facility_metainfo.metainfo;
				}
				var html='<div class="listview"><h4 class="ml10">'+translate("ae.admin.vendorServices.serviceTab")+'</h4><hr class="m0 ml10 mr10">';
				for(var i=0,ilen=fields.length;i<ilen;i++)
				{
					var key="";
					var value="";
					if(fields[i].indexOf("dec_")>-1||fields[i].indexOf("num_")>-1||fields[i].indexOf("sline_")>-1||fields[i].indexOf("mline_")>-1||fields[i].indexOf("date_")>-1||fields[i].indexOf("pick_")>-1||fields[i].indexOf("multi_")>-1){
						if($sDetails.facility_metainfo.fields.udf_fields.fields[fields[i]]){
						key=$sDetails.facility_metainfo.fields.udf_fields.fields[fields[i]].display_name;
						value=$space.getValue(entityData.udf_fields[fields[i]]);
						}
						else{
							continue;
						}						
					}
					else{
						key=$sDetails.facility_metainfo.fields[fields[i]].display_name;
						value=$space.getValue(entityData[fields[i]]);
					}
					html+='<div class="row ml10 space-fs-detail">';		
					html+='<div class="col-sm-2 text-muted">'+e_html(key)+'</div>';
					html+='<div class="col-sm-3">'+e_html(value)+'</div>';
					i++;
					if(i<ilen)
					{
						var key="";
						if(fields[i].indexOf("dec_")>-1||fields[i].indexOf("num_")>-1||fields[i].indexOf("sline_")>-1||fields[i].indexOf("mline_")>-1||fields[i].indexOf("date_")>-1||fields[i].indexOf("pick_")>-1||fields[i].indexOf("multi_")>-1){
							key=$sDetails.facility_metainfo.fields.udf_fields.fields[fields[i]].display_name;
							value=$space.getValue(entityData.udf_fields[fields[i]]);
						}
						else{
							key=$sDetails.facility_metainfo.fields[fields[i]].display_name;
							value=$space.getValue(entityData[fields[i]]);
						}
						html+='<div class="col-sm-2 text-muted">'+e_html(key)+'</div>';
						html+='<div class="col-sm-3">'+e_html(value)+'</div>';						
					}
					html+='</div>';
				}
				if(entityData.attachments&&entityData.attachments.length>0)
				{
					html+='<div id="attachment-api-space" >';
					for(var j=0,jlen=entityData.attachments.length;j<jlen;j++)
					{
							  html+='<button type="button" data-href="'+e_attr(entityData.attachments[j].content_url)+'"  data-attach-size="'+e_attr(entityData.attachments[j].size.display_value)+'" data-attach-id="'+e_attr(entityData.attachments[j].id)+'" data-attach-by="' + e_attr(entityData.attachments[j].attached_by.name) + '" data-attach-on="' + e_attr(entityData.attachments[j].attached_on.display_value) +'">'+e_html(entityData.attachments[j].name)+'</button>'; // No I18N
					}
					html+='</div>';
				}
				html+='</div>';
				return html;
			},
			afterCBFacility : function(APIData){
				var id = APIData.id;
				var attach_options = {
					"entity" : "facility_services", // No I18N
					"api" : false, // No I18N
					"is_odapi": true,	//No I18N
					"entity_id": id, // No I18N
					"ondelete": ['refreshAttachmentSection', $sDetails],  //No I18N
					"enable_delete" :  ($sDetails._links.edit==undefined?false:true) // No I18N
				};
				this.attachInstance = new attachPreview('#attachment-api-space',attach_options); //No I18N
			},
	refreshAttachmentSection : function (){
		$sDetails.facilityTableComp.previewer.refresh();
	},			
	nodatabanner_callback_facility: function(table_data)
	{
		if(table_data && table_data.t_obj && table_data.t_obj.table_info.list_info.search_criteria){
            return false;
        }		
		var html= '<div class="alert-nodata mt0"> <span class="msg">'+window.getMessageForKey('common.noassociation',[getMessageForKey("facility.services.smallcase.plural")])+'.'+($sDetails.facilityAssociationLinks.add?' <a class="text-link" data-action-name="showFacilityPopupNodata" href="/" >'+window.translate('associate.facility')+'</a>':'')+'</span> </div>';
		return html;
	},
	
	nodatabanner_callback_asset: function(table_data)
	{
		if(table_data && table_data.t_obj && table_data.t_obj.table_info.list_info.search_criteria){
            return false;
        }			
		var html= '<div class="alert-nodata mt0"> <span class="msg">'+window.getMessageForKey('common.noassociation',[getMessageForKey("assets.smallcase.plural")])+'.'+($sDetails.assetAssociationLinks.add?' <a class="text-link" data-action-name="showAssetsPopup" href="/" >'+window.translate('sdp.helpdesk.common.associateci.popup.title')+'</a></span>':'')+' </div>';
		return html;
	},
	
	nodatabanner_callback_request: function(table_data)
	{
		if(table_data && table_data.t_obj && table_data.t_obj.table_info.list_info.search_criteria){
            return false;
        }			
		var html= '<div class="alert-nodata mt0"> <span class="msg">'+window.getMessageForKey('no.requests.associated')+'. </span> </div>';
		return html;
	},
	
	nodatabanner_callback_documents: function(table_data)
	{
		if(table_data && table_data.t_obj && table_data.t_obj.table_info.list_info.search_criteria){
            return false;
        }
		var html= '<div class="alert-nodata mt10"> <span class="msg">'+window.getMessageForKey('common.no.info.msg',[getMessageForKey("documents.smallcase.plural")])+($sDetails.DocumentLinks.add?' <a class="text-link" data-action-name="showDocumentsPopupNodata" href="/" >'+window.translate('add.documents')+'</a>':'')+'</span> </div>';
		return html;
	},
	
	// to construct meta data 
    headerdataConstructForServiceAssociation: function()
    {
		var tableWidth = jQuery("#space_facility_service_associations_div").width() - 156 +"px"; // No I18N
		var meta_data = {};
		if($sDetails.facilityAssociationLinks["delete"]){
		meta_data["space_facility_service_associations_head_chk"] = {
                "type": "checkbox", //No I18N
				"width":"40px" // No I18N
		};
		meta_data["actioncell"] = {
			 "dataCelltransformer": this.constructEditCell, // No I18N
			 "type": "icon", // No I18N
             "hide_label": true , //No I18N
			 "width":"40px", // No I18N
			 "td_class":"pos-rel" // No I18N
			};
		}
		meta_data["facility_service.name"] = {
                "text": window.getMessageForKey("sdp.itil.common.service.item.name"), // No I18N
				"dataCelltransformer": this.constructFacilityNameCell, // No I18N
				"preview":true, // No I18N
				"is_column_preview":true, // No I18N
				"width":tableWidth // No I18N
        };
        meta_data["facility_service.template"] = {
            "type":"long", // No I18N
            "isHidden":true // No I18N
        };
        return meta_data;
    },
	constructFacilityNameCell : function(table_data){
		var rd = table_data.row_data;
		return '<a href="/" rel="uitip" mode_ellipsis=true title="'+e_attr(rd.facility_service.name)+'" >'+e_html(rd.facility_service.name)+'</a>';
	},	
	loadDocuments: function()
	{
		var table_content = {};
		var _self=this;
		_self.pushHashToURL("documents"); // No I18N
		table_content.header = _self.headerdataConstructForDocuments(); 
		//jQuery('#content-details-inner-'+_self.entity_name).removeClass('oxa');
		setTimeout(function()
		{
			var options = {};
			var table_info = table_comp.getTableInfo("space_documents"); // No I18N
			if(!table_info.fields_required)
			{
				table_info.fields_required=["name","created_by"]; // No I18N
			}						
			options.paginationEnabled = true;
			options.columnChooserEnabled=true;
			options.discarded_fields=["id","space"]; // No I18N
			options.getmetaInfo=true;
			options.searchEnabled = true;
			options.sortingEnabled = true;
			options.isODAPI             = true;
			options.multiDeleteEnabled = true;
			options.personalize_key     = "space_documents"; // No I18N
			options.callbackRowfunction = _self.rowdataConstructForDocuments;
			options.row_inputdata = _self.rowdataConstructForDocuments(table_info);
			options.callbackURL = 'spaces/'+_self.entity_data.type.api_plural_name+'/'+_self.entity_data.id+'/space_documents'; // No I18N
			options.deleteURL=options.callbackURL;
			options.nodatabanner_callback=_self.nodatabanner_callback_documents;
			options.callbackAfterBodyRender= () => {
				jQuery('#space_documents [data-action-name="showDocumentsPopup"]').off('click').on('click', (event) => {// No I18N
					$sDetails.showDocumentsPopup(event.currentTarget.dataset.documentId);
				});
				jQuery('#space_documents_nodatabanner [data-action-name="showDocumentsPopupNodata"]').off('click').on('click', (event) => {// No I18N
					$sDetails.showDocumentsPopup();
				});
			}
			options.previewSettings={"contentCB":$sDetails.contentCB,"afterCB":$sDetails.afterCB}; // No I18N
			options.entity_name = "space_documents";  // No I18N
			options.tableHolder="space_documents"; // No I18N
			options.default_sort_field = {"sort_field" : "name","sort_order" : "asc"};//No I18N
			options.isFR_ListInfo_Support = true;
			options.support_search_criteria = true;
			var table_compreq = new tableComponent(table_info, table_content, options, _self);
			_self.documentTableComponent=table_compreq;
			jQuery('.listview').css({'min-height':'500px','padding-bottom':'80px'}); // No I18N
		},0);
	},
	
	// to construct meta data 
    headerdataConstructForDocuments: function()
    {
		var meta_data = {};
		if($sDetails.DocumentLinks["delete"]){
		meta_data["space_documents_head_chk"] = {
            "default": true, //No i18N
            "type": "checkbox", //No i18N
		};
		}
		if($sDetails.DocumentLinks.edit||$sDetails.DocumentLinks["delete"]){
		meta_data["actioncell"] = {
			"dataCelltransformer": this.constructDocumentsEditCell, // No I18N
			"default": true, //No i18N
			 "type": "icon", // No I18N
			"width":"40px", // No I18N
			"td_class":"pos-rel" // No I18N
		};	
		}		
		meta_data["name"] = {
			"default": true, // No I18N
			"preview":true, // No I18N
			"dataCelltransformer": this.constructDocumentsNameCell, // No I18N
			"is_column_preview":true // No I18N
        };
		meta_data["created_by"] = {
			"default": true, // No I18N
			"value_path":"created_by.name" // No I18N
        };
		meta_data["last_updated_by"] = {
			"value_path":"last_updated_by.name" // No I18N
        };		
        return meta_data;
    },
	constructDocumentsNameCell: function(table_data){
		return '<a href="/" rel="uitip" mode_ellipsis=true title="'+e_attr(table_data.row_data.name)+'" >'+e_html(table_data.row_data.name)+'<a/>'
	},
	constructDocumentsEditCell: function(table_data){
		return '<div class="btn-group tc-req-edit bs-noconflict ml10"> <span class="cur-ptr cspr menulist icon-xs flat  sdmenu-toggle vmiddle mt-4" role="img" title="'+window.getMessageForKey('common.actions')+'" rel="uitip" data-switch="sdmenu"></span>'+
                 '<ul class="sdmenu-dd whitebg btn-default p0"> '+($sDetails.DocumentLinks.edit?'<li><a href="/" data-action-name="showDocumentsPopup" data-document-id="'+table_data.row_data.id+'" >'+window.getMessageForKey('common.edit')+'</a> </li>':'')+
				 ($sDetails.DocumentLinks["delete"]?' <li><a href="/" data-table-delete data-entityid="'+table_data.row_data.id+'" >'+window.getMessageForKey('common.delete')+'</a> </li>':'')+' </ul>  </div>';
	},	
	showDocumentsPopup : function(documentId)
	{
			var container = "<div id='document-form'class='pt15'> </div>";
			var _self = this;
			var div= jQuery('#documents-popup').html();
			jQuery('#documents-popup').dialog({
					title:window.translate("add.documents"),
					autoOpen : false, 
					modal : true, 
					position: { my: "center top+50", at: "center top+50", of: window },//No I18N
					height: "auto", // No I18N
					open: function(event, ui){
						var requiredfields = ["name","description"];  // No I18N			
						var column_count = "1";
						var template = _self.constructTemplate(requiredfields,column_count,null);   
						var attachLayout = {};
						attachLayout.title = window.getMessageForKey("space.documents"); //No I18N
						attachLayout.sections = [{
							type: "attachments", //No I18N
							id: "attachments", //No I18N
							container_id: "document-form-attachment", //No I18N
							options: {
								api: false,
								upload_api: true,
								upload: true,
								enable_delete: true,
								is_odapi: true,
								download: true,
								entity: 'spaces/'+_self.entity_data.type.api_plural_name+'/'+_self.entity_data.id+'/space_documents' //No I18N
							}
						}];
						template.layouts.splice(1, 0, attachLayout);
						//Destroy the old instance
						_self.$documentFields_FC && _self.$documentFields_FC.destroy();
						/* Load FC for right property section */
						var documentConfig = {
							template: template,
							name:"Document", // No I18N
							entity: "space_document", //NO I18N
							entityName: window.translate("space.document"), //NO I18N
							entitypath:"space_document", //NO I18N
							container: "document-form",   // No I18N
							formid: "document-form-fields",   // No I18N
							metadata: jQuery.extend(true, {}, _self.documents_metainfo),
							entitydata: documentId ? _self.getDocumenData(documentId) : null,
							mode: documentId ? "edit" : "new", // No I18N
							canEdit: _self._links.edit && _self._links.edit.put, //CanEdit default's to true, and permission is controlled in skipEditFields
							/*Inline save*/
							save: {
								url: '/api/v3/spaces/'+_self.entity_data.type.api_plural_name+'/'+_self.entity_data.id+'/space_documents/'+(documentId?documentId:''), //NO I18N
								entity: "space_document", //NO I18N
								submit: true,
								cancel: "$sDetails.closePopupandLoadAttachments", //No I18N
								postsuccess: function(data) {
										_self.closePopupandLoadAttachments();
								},
								submitbutton: {
									add: window.getMessageForKey("sdp.common.save"), //No I18N
								}
							},
							afterRenderCallback: '$sDetails.documentFormCallback' //No I18N
						};
						_self.$documentFields_FC = new FC(documentConfig);;
					},
					close: function(event, ui){
						//$sDetails.documentTableComponent.refreshTable("refresh"); // No I18N
						_self.$documentFields_FC.destroy();
						jQuery('#documents-popup').dialog("destroy"); // No I18N
					},
					width: 600,
					}).html(container).dialog("open"); // No I18N
	},
	closePopupandLoadAttachments : function()
	{
		jQuery('#documents-popup').dialog('close'); // No I18N
		$sDetails.documentTableComponent.refreshTable("refresh"); // No I18N
	},
	documentFormCallback :  function(form){
		$sDetails.$documentFields_FC.addMandatoryField("attachments"); // No I18N
		jQuery("#"+form.container).find("[data-name='form-footer']").addClass("sticky-form-footer");    //NO I18N 
	},
	getDocumenData: function(documentId) {
        var _self = this,
            respData = {};
            sdpAjax({
                url: '/api/v3/spaces/'+_self.entity_data.type.api_plural_name+'/'+_self.entity_data.id+'/space_documents/'+documentId, // No I18N
                success: function(resp) {
                    respData = resp["space_document"];
                },
                async: false
            });
        return respData;
    },
	contentCB : function(APIData){
		var entityData=$sDetails.getEntityData(this.id);		
		if(!entityData.attachments||entityData.attachments.length==0)
		{
			return '<div class="text-center" >'+getMessageForKey("sdp.solution.common.noattachments")+'</div>';
		}
		var html='<div class="listview" id="document-attchments-preview"><div class="p0 list-nostyle documentlist"> ';
		for(var j=0,jlen=entityData.attachments.length;j<jlen;j++)
		{
			html+='<button type="button" data-href="'+e_attr(entityData.attachments[j].content_url)+'"  data-attach-size="'+e_attr(entityData.attachments[j].size.display_value)+'" data-attach-id="'+e_attr(entityData.attachments[j].id)+'" data-attach-by="' + e_attr(entityData.attachments[j].attached_by.name) + '" data-attach-on="' + e_attr(entityData.attachments[j].attached_on.display_value) +'">'+e_html(entityData.attachments[j].name)+'</button>';// No I18N
		}
		html+="</div></div>";
		return html;
	},
	afterCB : function(APIData){
		var id = APIData.id;
		var attach_options = {
			"entity" : "spaces/"+$sDetails.entity_data.type.api_plural_name+'/'+$sDetails.entity_data.id+'/space_documents', // No I18N
			"api" : false, // No I18N
			"is_odapi": true,	//No I18N
			"entity_id": id, // No I18N
			"enable_delete" : false, //No I18N
			titleText: '<span class="h4" class="ml10 font-medium">' + translate("space.documents") + "</span>"
		};
		this.attachInstanceDocuments = new attachPreview('#document-attchments-preview',attach_options); //No I18N
	},
	getEntityData : function(id){
		var responseData={};
		var self=this;
		sdpAjax({
			url: self.base_url+"/"+self.id+"/space_documents/"+id, // No I18N
            success: function(resp) {
					responseData=resp.space_document;
            },
            async: false
       });
	   return responseData;
	},		
	loadStructures: function(){
		var _self = this;
		_self.pushHashToURL("structures"); // No I18N
		var input_data= {"list_info":{"search_criteria":{"field":"space_campus.id","value":_self.entity_data.id,"condition":"is"}}}; // No I18N
		_self.setListProperties("StructuresFrame2",input_data,"structure"); // No I18N
		/*jQuery("#StructuresFrame2").load("/ui/space?mode=list&module=structure&externalframe=true&container=StructuresFrame&min_preview=true&customContainer=true&"+sdpAjaxInputData(input_data), function() { // No I18N
			});*/
	},
	loadFloors: function(){
		var _self = this;
		_self.pushHashToURL("floors"); // No I18N
		var input_data= {"list_info":{"search_criteria":{"field":"space_building.id","value":_self.entity_data.id,"condition":"is"}}}; // No I18N
		_self.setListProperties("FloorsFrame2",input_data,"floor"); // No I18N
		/*jQuery("#FloorsFrame2").load("/ui/space?mode=list&module=floor&externalframe=true&container=FloorsFrame&min_preview=true&customContainer=true&"+sdpAjaxInputData(input_data), function() { // No I18N
			});*/
	},
	loadRooms: function(){
		var _self=this;
		_self.pushHashToURL("rooms"); // No I18N
		var input_data= {"list_info":{"search_criteria":[]}};  // No I18N
		input_data.list_info.search_criteria={"field":_self.entity_data.common_module+".id","value":_self.entity_data.id,"condition":"is"}; // NO I18N
		_self.setListProperties("RoomsFrame2",input_data,"room"); // No I18N
		/*jQuery("#RoomsFrame2").load("/ui/space?mode=list&module=room&externalframe=true&container=RoomsFrame&min_preview=true&customContainer=true&"+sdpAjaxInputData(input_data), function() { // No I18N
			});*/
	},
	loadRoomPartitions: function(){
		var _self = this;
		_self.pushHashToURL("partition"); // No I18N
		var input_data= {"list_info":{"search_criteria":{"field":"space_room.id","value":_self.entity_data.id,"condition":"is"}}}; // No I18N
		$spaceList.site_id=(_self.entity_data.site?_self.entity_data.site.id:'-1');
		$spaceList.room_id=_self.entity_data.id;
		_self.setListProperties("RoomPartitionsFrame2",input_data,"roompartition"); // No I18N
		/*jQuery("#RoomPartitionsFrame2").load("/ui/space?mode=list&module=roompartition&externalframe=true&min_preview=true&site_id="+(_self.entity_data.site?_self.entity_data.site.id:'-1')+"&room_id="+_self.entity_data.id+"&container=RoomPartitionssFrame&customContainer=true&"+sdpAjaxInputData(input_data), function() { // No I18N
			});*/
	},	
	setListProperties: function(containerId,input_data,module){
		$spaceList.min_preview=true;
		$spaceList.fromPage='';
		$spaceList.containerId=containerId;
		$spaceList.input_data=input_data;
		$spaceList.init(module, "", true,true,input_data); // No I18N		
	},
	showFacilityPopup : function(ele)
	{
		var self =this;
		var div= 	'<div id="space_facility_table"> <div class="uicomponent listview task-list-wrap fw"> <div class="listcontrols">'+
							'<div class="fl ml10 mr10" id="t_searchicon_facility_service"></div>'+
							'<div class="btn-group mr10 fl"><div id="pagination_comp_facility_service"></div></div>'+
						'</div> <div class="uicomponent listview task-list-wrap fw"><div class="tablelist" id="facility_service_div" ></div>'+ 
			'<div class="form-footer">'+
				'<button id="facility-popup-save" class="btn btn-primary" data-link="facility_service" type="button">'+window.getMessageForKey('ae.common.attach')+'</button>'+ // No I18N
				'<button id="facility-popup-cancel" class="btn btn-default"  type="button">'+window.getMessageForKey('common.close')+'  </button>    </div></div>  ';		
			jQuery('#facility-popup').dialog({
					title:window.getMessageForKey("associate.facility"),
					autoOpen : false, 
					modal : true, 
					position: { my: "center top+50", at: "center top+50", of: window },//No I18N
					width: 700,
					resizable: false,
					open: function(event, ui){
						self.loadFacilityPopupTable();
						jQuery('#facility-popup #facility-popup-save').off('click').on('click', (event) => {
							$sDetails.associateModule('space_facility_service_associations','facility_service','facility-popup');
						});
						jQuery('#facility-popup #facility-popup-cancel').off('click').on('click', (event) => {
							jQuery('#facility-popup').dialog('close');
						});
					},
					close: function(event, ui){
						jQuery('#space_facility_table').remove();
						jQuery('#facility-popup').dialog("destroy"); // No I18N
					}					
			}).html(div).dialog("open"); // No I18N
	},
	rowdataConstructForFacilityPopup: function(table_info)
    {
        var inputObject = {};
		inputObject.list_info = table_info.list_info;
		inputObject.fields_required= ["name","template"]; //No I18N
        return inputObject;
    },	
	loadFacilityPopupTable: function()
	{
		var table_content = {};
		var _self=this;
		table_content.header = _self.headerdataConstructForFacilityPopup(); 
		setTimeout(function()
		{
			var options = {};
			options.paginationEnabled = true;
			options.isFR_ListInfo_Support = true;
			options.support_search_criteria = true;
			options.searchEnabled = true;
			options.sortingEnabled = true;
			options.isODAPI             = true;
			options.callbackRowfunction = _self.rowdataConstructForFacilityPopup;
			options.row_inputdata = _self.rowdataConstructForFacilityPopup(table_comp.getTableInfo());
			options.callbackURL = 'spaces/'+_self.entity_data.type.api_plural_name+'/'+_self.entity_data.id+'/facility_service'; // No I18N
			options.entity_name = "facility_service";  // No I18N
			options.tableHolder="facility_service"; // No I18N
			options.default_sort_field = {"sort_field" : "name","sort_order" : "asc"};//No i18N
			options.staticHeader = true;
			options.height = 400;
			options.width = 700;
			_self.facilityPopupTableComp = new tableComponent(table_comp.getTableInfo(), table_content, options, _self);
		},100);
	},
	
	// to construct meta data 
    headerdataConstructForFacilityPopup: function()
    {
		var meta_data = {};
		meta_data["facility_service_head_chk"] = {
                "type": "checkbox", //No I18N
				"width":"40px" // No I18N
		};
		meta_data["name"] = {
                "text": window.getMessageForKey("sdp.itil.common.service.item.name") // No I18N
        };	
		meta_data["template"] = {
                "text": window.translate("sdp.admin.requesttemplate.template"), // No I18N
				"value_path" : "template.name" // No I18N
        };			
        return meta_data;
    },	
    loadAreaField: function() {
		var _self=$sDetails;
        var html = "";
        var areaValue = e_html((_self.entity_data && _self.entity_data.area && _self.entity_data.area.space_area ) ? _self.entity_data.area.space_area : '-');
		var areaUnit = e_html((_self.entity_data && _self.entity_data.area && _self.entity_data.area.area_unit ) ? _self.entity_data.area.area_unit.name : '');
		html='<p id="areaUnitView" data-name="area.space_area" type="double" data-value="null" class="form-control-static spot-static">'+areaValue+' '+areaUnit+'</p>';
		html+='<div id="areaUnitEdit" class="spot-form hide" ><div id="area.space_area_control" class="control-holder">';
                    html+=                       '<input name="area.space_area" data-type="double" data-field="undefined" class="form-control valid disp-ib mr10 w-30per"  value="'+(areaValue!='-'?areaValue:'')+'" id="areaunit" data-area="val-unit">';
                          html+=              '<div class="form-control disp-ib mt-2 w-60per" id="areaUnitSelect2"  >';
                                html+=     '</div>';
                                      html+='</div>';
                                     html+='<div id="area.space_area_actions" class="spot-actions">';
           html+=                            '<button  id="space-area-data-save" class="spot-save btn btn-sm btn-link"  title="'+getMessageForKey('common.save')+'" rel="uitip" >'; //NO I18N
                 html+=                      '<span class="spot-icon success mr5"></span>';
                       html+=                  '</button>';
                             html+=           '<button id="space-area-data-cancel" class="spot-cancel btn btn-sm btn-link"  title="'+getMessageForKey('sdp.common.cancel')+'" rel="uitip" >'; //NO I18N
                                   html+=        '<span class="spot-icon failure icon-xs"></span>';
          html+=                                '</button>';
                html+=                       '</div>';
                      html+=                  '<!--/.spot-actions-->'; //NO I18N
                            html+=       '</div>';
        return html;
    },	
	hideDiv : function(id1,id2,initSelect2){
		jQuery('#'+id1).addClass("hide");
		jQuery('#'+id2).removeClass("hide");
		if(initSelect2){
			this.$entityFields_FC.fields["area.space_area"].constraints={"regex" : "^[-+]?[0-9]{0,13}(\\.[0-9]+)?"}; //NO I18N
			this.$entityFields_FC.bindDecimalValidator(this.$entityFields_FC.fields["area.space_area"]);
			this.$entityFields_FC.addValidator("area.space_area");  //NO I18N
			this.$entityFields_FC.setFormValidator();
			this.initAreaSelect2();
		}
	},
	initAreaSelect2 : function() {
		var self =this;
		var areaUnit = self.entity_data && self.entity_data.area && self.entity_data.area.area_unit ? {"id":self.entity_data.area.area_unit.id,"text":self.entity_data.area.area_unit.name} : null;//NO I18N
		jQuery('#areaUnitSelect2').sdp_select2({
				cache:{},
				value:areaUnit,
				closeOnSelect : false,
				multiple:false,
				allowClear: false,
				placeholder: getMessageForKey("form.select.placeholder",[getMessageForKey("space.areaUnit")]), // No I18N
				url:[{
					url:"/api/v3"+self.metainfo.fields.area.fields.area_unit.href,//NO I18N
					field:'area_unit',//NO I18N
					list_info:{start_index:1,row_count:25}
				}]
			});
	},
	saveAreaData: function(){
		var self=this;
		var data = jQuery('#areaUnitSelect2').select2('data'); //NO I18N
		var areaVal = jQuery('#areaunit').val();
		if(areaVal&&!data||!areaVal&&data)
		{
			showalert('failure',translate("area.info"),"isAutoHide=true"); // No I18N
			return false;
		}
		if(areaVal&&!(/^[0-9]+\.[0-9]+$/.test(areaVal))&&!(/^[+]{0,1}\d+$/.test(areaVal)))
		{
			showalert('failure',translate("enter.valid.decimal.positive"),"isAutoHide=true"); // No I18N
			return false;			
		}
		if(data&&data.text)
		{
			data.name=data.text;
			delete data["text"];
		}
		var input_data = {};
		input_data[self.entity_name]={"area":{ "space_area":areaVal,"area_unit":data}}; //NO I18N
		sdpAjax({
            url: '/api/v3/spaces/'+$sDetails.entity_data.type.api_plural_name+'/'+$sDetails.entity_data.id,// No I18N
            type: "PUT",// No I18N
			data: sdpAjaxInputData(input_data),
            success: function (resp) {
                window.showalert("success", translate("api.updated.success", [ self.display_name ]), "isAutoHide=true");	//No I18N
				self.entity_data.area =resp[self.entity_name].area;
				self.$detailsComp.options.data.entity_data = self.entity_data;
				$sDetails.$detailsComp.refreshPanel("panel","content"); // NO I18N
				initTooltip('.rhs-sections'); // NO I18N
            }
        });		
	},
	gotoTab : function(tabName,id){
     	var _self = this;
		var allIds=['space-ar','space-aa','space-af']; // No I18N
		allIds.splice(allIds.indexOf(id),1);
		var container=jQuery("#"+ _self.$detailsComp.options.container);
	    container.find("[role='tablist']").find('li[data-name="'+tabName+'"]').trigger("click");
        setTimeout(function(){
			var ele1 = jQuery("#"+allIds[0]+"-panel");
			if(ele1.length>0){
				ele1.trigger("click");
			}
			var ele2 = jQuery("#"+allIds[1]+"-panel");
			if(ele2.length>0){
				ele2.trigger("click");
			}
        },200);
    },
    getAssociationLinks: function(url,associationEntity) {
        var permissions = {"canView":false}; // No I18N
        sdpAjax({
            url: url+"/"+associationEntity+"/_links", // No I18N
            success: function(resp) {
				permissions.canView=true;
				var links = resp._links;
                links = links.links || links;
                links.forEach(function (link) {
					if(link.name){
						permissions[link.name]=true;
					}
                });
            },
			ignorefailuremessage: true,
            async: false
        });
		return permissions;
    },
	openRequestForm : function(){
		$space.openRequestForm('create_requst_popup','create_request_container',$sDetails.entity_data.id,$sDetails.entity_data.name,"details"); // No I18N
	},
    /**
     * Wrapper method for Form showBulkSelect, which fetches api data before providing data to bulk select component
     */
    showBulkSelectSupervisors: function(formalias, fname, isEdit, event){
        var field = FC_Mapper[formalias].fields[fname];
        var lookup_entity = field.response_field_name || field.fieldname || field.href.substr(field.href.lastIndexOf("/") + 1);
        var input_data = {"list_info":{"start_index": 1,"row_count": 100,"sort_field": "name"}}; //No I18N
		var idVal=$sDetails.entity_data.site;
		if(idVal==null){
			idVal="-1";
		}
        input_data.list_info.search_criteria= {"field": "associated_sites", "condition": "is", "value":idVal}; //No I18N		
        if(!field.allowedValues){
        sdpAjax({
            url: "/api/v3"+field.href, //No I18N
            async:false,
            cache:false,
            data:{input_data:sdpToJSON(input_data)},
            success:function(data){
              field.allowedValues = data[lookup_entity];
              FC.showBulkSelect(formalias, fname, isEdit, event, true);
            }
        });
        }else{
            FC.showBulkSelect(formalias, fname, isEdit, event, true);
        }
    },
	afterTabRenderHistory : function(){
		this.pushHashToURL("history"); // No I18N
	},
	afterTabRenderDocuments : () => {
		jQuery('#docadd').off('click').on('click', (event) => { // No I18N
			$sDetails.showDocumentsPopup(null);
		});
	},
	pesonalizeSpaceTree : function () {
		var _self=this;
		var personalization = {};
		var data = _self.entity_data;
		var common_module = data.common_module.substring(6);
		if(common_module=="campus")
		{
			personalization["space_campuses"]={"id":data.id}; // No I18N
		}
		else if(common_module=="structure"||common_module=="building"||common_module=="nonbuilding")
		{
			personalization["space_campuses"]={"id":data.space_campus.id};  // No I18N
			personalization["space_structures"]={"id":data.id}; // No I18N
		}
		else if(common_module=="floor")
		{
			personalization["space_campuses"]={"id":data.space_campus.id};  // No I18N
			personalization["space_structures"]={"id":data.space_building.id};  // No I18N
			personalization["space_floors"]={"id":data.id}; // No I18N			
		}
		else if(common_module=="room"){
			personalization["space_campuses"]={"id":data.space_campus.id};  // No I18N
			personalization["space_structures"]={"id":data.space_building.id};  // No I18N
			if(data.space_building.building_type!="Rooms Only"){
			personalization["space_floors"]={"id":data.space_floor.id};  // No I18N
			}
			personalization["space_rooms"]={"id":data.id}; // No I18N
		}
		else if(common_module=="roompartition"){
			personalization["space_campuses"]={"id":data.space_campus.id};  // No I18N
			personalization["space_structures"]={"id":data.space_building.id};  // No I18N
			if(data.space_building.building_type!="Rooms Only"){
			personalization["space_floors"]={"id":data.space_floor.id};  // No I18N
			}
			personalization["space_rooms"]={"id":data.space_room.id}; // No I18N
		}		
		addPersonalization("spacetree", personalization, true); // NO I18N
		window.open('/ui/space?mode=list&module=tree');
	},
	updateAssociationsCount : function(){
		var _self=this;
		_self.getSummary(_self.base_url + "/" + _self.id, _self);
		if(_self.requestAssociationLinks.canView){
			jQuery('#requestSummary').text(_self.summary.requests.all);
		}
		if(_self.assetAssociationLinks.canView){
			jQuery('#assetSummary').text(_self.summary.assets.all);
		}
		if(_self.facilityAssociationLinks.canView){
			jQuery('#serviceSummary').text(_self.summary.services.all);
		}		
	},
	handlePostRequestCreation: function(){
		$sDetails.updateAssociationsCount();
		var container=jQuery("#"+ $sDetails.$detailsComp.options.container);
	    container.find("[role='tablist']").find('li[data-name="associations"]').trigger("click");	
	}
};
