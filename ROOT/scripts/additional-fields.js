/* $Id$ */
/* 
	1. Additonal field listview API based (User, Technician, Release)
	2. Ember (admin/additional-field/edit/controller.js) file moved here 
		a. used for Ember and Non Ember page form additional-fields popup
		b. also include (components/form-settings/component.js, components/import-options/component.js) file code copied and used
*/
var $udfcommon = {
    options: {
        'routeUDFfields': [ //No I18N
            {
                'id': 'asset_asset', //No I18N
                'label': 'common.asset', //No I18N
                'type': 'category', //No I18N
                'submodule': false, //No I18N
                "showFieldCount" : true, //No I18N
                "fieldDisplayLabel" : getMessageForKey("additional.field.count.fieldusage"), //No I18N
            },
            {
                'id': 'cmdb', //No I18N
                'label': 'common.cmdb', //No I18N
                'type': 'category', //No I18N
                'submodule': false, //No I18N
                "showFieldCount": true, //No I18N
                "fieldDisplayLabel": translate("sdp.requests.viewrequest.summary"), //No I18N
                'selectsubmodule': { //No I18N
                    'id': 'cmdb'//No I18N
                }
            },
            {
                'id': 'department', //No I18N
                'label': 'sdp.header.user', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                'id': 'user', //No I18N
                'label': 'sdp.header.user', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                'id': 'technician', //No I18N
                'label': 'sdp.common.technician', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                'id': 'vendor', //No I18N
                'label': 'sdp.admin.leftpanel.assetmgmt.vendor', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                'id': 'release', //No I18N
                'label': 'common.release', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                'id': 'request', //No I18N
                'label': 'common.request', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
                'showFieldCount': true, //No I18N
            },
             {
                'id': 'problem', //No I18N
                'label': 'common.problem', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
             {
                'id': 'custom_module', //No I18N
                'entity_id': 'cm_', //No I18N
                'label': 'Custom Modules', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                'id': 'project', //No I18N
                'label': 'common.project', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                 'id': 'worklog', //No I18N
                 'entity_id': 'worklog', //No I18N
                 'label': 'common.worklog', //No I18N
                 'type': 'module', //No I18N
                 'submodule': false, //No I18N
             },
             {
             'id': 'task', //No I18N
             'label': 'common.task', //No I18N
              'type': 'module', //No I18N
              'submodule': false, //No I18N
            },
             {
                'id': 'space', //No I18N
                'label': translate('space.field'), //No I18N
                'text': translate('common.addiotnalfield', [translate('space.field')]), //No I18N
                'type': 'module', //No I18N
                'submodule': true, //No I18N
                'submoduleData': [{ //No I18N
                    'id': 'space_campus',//No I18N
					'childModule':false, //No I18N
                    'label': translate('space.campus')//No I18N
                }, {
                    'id': 'space_structure',//No I18N
					'childModule':'building', //No I18N
                    'label': translate('space.structure')//No I18N
                }, {
                    'id': 'space_floor',//No I18N
					'childModule':false, //No I18N
                    'label': translate('space.floor')//No I18N
                }, {
                    'id': 'space_room',//No I18N
					'childModule':false, //No I18N
                    'label': translate('space.room')//No I18N
                }],
                'selectsubmodule': { //No I18N
                    'id': 'space_campus',//No I18N
					'childModule':false, //No I18N
                    'label': translate('space.campus')//No I18N
                },
            },
            {
                'id': 'facility_service', //No I18N
                'label': translate('space.facility'),//No I18N
                'text': translate('common.addiotnalfield', [translate('space.facility')]), //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                'id': 'support_group', //No I18N
                'label': 'ae.cmdb.admin.leftnav.supportGroup', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                'id': 'account', //No I18N
                'label': 'sdp.admin.leftpanel.users.customer', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                'id': 'product', //No I18N
                'label': 'sdp.msp.integration.Product', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                'id': 'sale', //No I18N
                'label': 'scp.account.sale', //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                'id': 'account_group', //No I18N
                'label': translate('msp.account.group'), //No I18N
                'type': 'module', //No I18N
                'submodule': false, //No I18N
            },
            {
                "id": "associations", //No I18N
                "type": "module", //No I18N
                "callback": { //No I18N
                    "beforeInit": (table_info, table_content, options) => { //No I18N
                        const didRender = options.callbackAfterBodyRender;
                        const association = $udfcommon.$udflview.udf.options.selectRoute;

                        if(association.row_inputdata) {
                            options.row_inputdata = jQuery.extend(options.row_inputdata, association.row_inputdata);
                        }
                        options.personalize_key = association.personalize_key || options.personalize_key;

                        table_info.list_info.default_search_criteria = association.default_search_criteria;

                        options.personalize_key = association.personalize_key || options.personalize_key;

                        options.callbackAfterBodyRender = () => {
                            didRender();
                            $udfcommon.$udflview.udf.options.selectRoute.didRender();
                        }

                        options.callbackAfterInitialRender = association.callbackAfterInitialRender;
                        
                        return options;
                    },
                    "getMetaInfo": (meta) => {//No I18N
                        const fieldsMeta = {
                            "udf_fields_head_chk": {//No I18N
                                "type": "checkbox", //No I18N
                                "default": true//No I18N
                            }
                        };
                        if(!$udfcommon.$udflview.udf.options.selectRoute.actionName) {
                            return meta;
                        }

                        return jQuery.extend(true, {}, fieldsMeta, meta);
                    }
                },
                "submodule": false, //No I18N
            }
        ],
        'selectRoute': { //No I18N
            'id': 'user',//No I18N
            'label': 'sdp.header.user', //No I18N
            'type': 'module',//No I18N
            'submodule': false//No I18N
        },
        'routeName': '', //No I18N
        'ESM': false, //No I18N
        'renderListview': false, //No I18N
    },
    init: function(routeName, esm, loadlistview, cntrl) {
        if(typeof $udfHelper === 'undefined'){
            ResourceLoader({
                js: ["/scripts/additional-fields-helper.js"] //No I18N
            });
        }
        if(typeof CriteriaChildren === 'undefined'){//AE IM - 400002789 Criteria UI changes rendered from wfeditor.js file
            ResourceLoader({
                js: ["/scripts/wfeditor.js"],//No I18N
                success :function() {}
            });
        }
        var fields = this.options.routeUDFfields;
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].id == routeName) {
                this.options.selectRoute = fields[i];
            }
        }

        this.options.routeName = routeName;
        this.options.esm = esm;
        this.options.renderListview = loadlistview;
        if(cntrl && cntrl.model && cntrl.model.name && routeName=='custom_module'){/** In admin template and additional field route both have in custom module template section so the reason we include it **/
			this.options.selectRoute.entity_id='cm_'+cntrl.model.name;
		} else if(routeName=='associations') { //No I18N
            this.options.selectRoute = jQuery.extend(this.options.selectRoute, cntrl.udfOptions);
		}
        for (var i in this) { //function convert into objects
            if (typeof this[i] == 'object') {
                this[i].udf = this;
            }
        }
        this.load();
        return this;
    },
    renderTablefn: function() { //Render Listview content(html structure)
        let pkey = (this.options && this.options.selectRoute && this.options.selectRoute.personalize_key) ? this.options.selectRoute.personalize_key : this.options.routeName;
        var table_info = getPersonalizeData(pkey);
        var usertechdrop = false;
        if (jQ.isEmptyObject(table_info)) {
            var list_info = {
                "row_count": "10",//No I18N
                "start_index": "1"//No I18N
            };
            table_info.list_info = list_info;
        }
        table_info[this.options.selectRoute.type] = {
            "name": this.options.routeName //No I18N
        };
        if(this.options.routeName == 'request'){
            var searchCriteria = [{'field':'field_group','condition':'is not','value':'resources','logical_operator':'AND'}];//No I18N
            table_info.list_info.search_criteria=searchCriteria;
        }
        else if( this.options.routeName=="custom_module"){/** In admin template and additional field route both have in custom module template section so the reason we include it **/
        			table_info[this.options.selectRoute.type] = {
        		      "name": this.options.selectRoute.entity_id //No I18N
                    };
		}else if( this.options.routeName=="asset_asset"){ //No I18N
		    table_info.category = {
		        "name": "asset" //No I18N
		    };
        } else if( this.options.routeName=="associations"){ //No I18N
            if($udfcommon.options.selectRoute.isAssociatedList) {
            table_info[this.options.selectRoute.type] = {
                "name": $udfcommon.options.selectRoute.entity_id //No I18N
            }
            } else {
                table_info[this.options.selectRoute.type] = undefined;
            }
        }
		else if( this.options.routeName=="space"){
			        table_info[this.options.selectRoute.type] = {
            "name": this.options.selectRoute.selectsubmodule.id //No I18N
        };
		}else if( this.options.routeName=="cmdb"){ //No I18N
            table_info.category = {
             "name": "cmdb" //No I18N
            };
		}
        else if (this.options.routeName == 'user' || this.options.routeName == 'technician') {
            var adminjson = ClientUtil.getUserPersonalization('admin_json');//No I18N
            adminjson = (adminjson && adminjson.mode) ? adminjson.mode : adminjson;
            usertechdrop = (adminjson == 'old' || sdp_app.IS_AE) ? true : false; //No I18N
        }
		if(sdp_app.IS_ESMDIR) {
			if(sdp_app.IS_SCP && this.options.routeName=="account"){
				table_info[this.options.selectRoute.type] = {
				"name": "account" //No I18N
			};
			}else if(table_info.module.name=="department"){
				table_info[this.options.selectRoute.type] = {
					"name": "department" //No I18N
				};
			}
			else
			{
			table_info[this.options.selectRoute.type] = {
				"name": "orguser" //No I18N
			};
			}
		}

        
        if(jQuery('[data-id=udflist]').length == 0) {/** skip to render listview when proper element not present in DOM **/
            return;
        }
        renderhbs('[data-id=udflist]', 'listview-template', {//No I18N
            "routeName": this.options.routeName,//No I18N
            "module": "udf_fields",//No I18N
            "ESM": this.options.esm,//No I18N
            'routeUDFfields': this.options.routeUDFfields,//No I18N
            'selectRoute': this.options.selectRoute,//No I18N
            'usertechdrop': usertechdrop,//No I18N
            'entity_name': this.options.selectRoute.entity_id // NO I18N
        }, false, "additionalfields", false, false, null, false, true); // NO I18N
        this.$udflview.init(table_info, this.options.routeName);
    },
    load: function() {
        var _self = this;
		ResourceLoader({
			js: ["/scripts/hbs-template-additionalfields.js"],//No I18N
			success :function() {
				if (_self.options.renderListview) {
					_self.renderTablefn();
				}
			}
		});

        jQuery.validator.addMethod('apinamecheck', function(value, element) { //No I18N
            /**
             * SD-126363 fix => API Name shoudn't start or end with undescore
             */
            let isValid = true;
            value = value ? value.trim() : value;
            if(value && (value.startsWith('_') || value.endsWith('_'))) {
                isValid = false;
            }
            return (this.optional(element) != false) || isValid;
        }, translate('additional.field.apiname.prefix.erorr'));
    },
    newFieldType: function(field_type, type) { //field type check event in edit action icon
        var oldfieldtype = ["single_line", "multi_line", "pick_list", "multi_select", "radio", "checkbox", "decimal", "numeric", "date/time", "color", "boolean", "date", "attachment", "email", "url", "phone", "percentage", "html"]; //No I18N
        var newfieldtype = ["Single Line", "Multi Line", "Pick List", "MultiSelect", "Radio", "CheckBox", "Decimal", "Numeric", "Date/Time", "Color", "Boolean", "Date", "Attachment", "Email", "Url", "Phone", "Percentage", "Html"]; //No I18N
        var selectedtype;
		var ftype = (type == 'get') ? newfieldtype : oldfieldtype; //No I18N
		for(var i=0; i<ftype.length; i++) {
			if (ftype[i] == field_type) {
                selectedtype = (type == 'get') ? oldfieldtype[i] : newfieldtype[i];
            }
		}
        
        return selectedtype;
    },
    loadRender: function(data, childObj) { //Render hbs template popup header, section, picklist options
        var _self = this;
        data = data.options;
        //for reassign api name as fieldKey while editing
        if(data && data.popup_action==="updateField" && data.routeName==='department'){
            data.layoutField.fieldKey=data.layoutField.response.name.split(data.fieldKeyobj)[1];
        }
        
        var rnd = {
            sectionrender: function() {
                const CB = childObj.pickOptionrender ? rnd.renderPicklist : rnd.otherOptions;
                renderhbs('.formpopup-queswrapper', 'form-content-section', data, false, "additionalfields", false, false, CB, false, true); // NO I18N
                _self.$udfform.hbskeyevents(data);
                setTimeout(function(){
                //126211 - Additional field popup zindex over zohocomponent dialog
                    if(jQuery('.zdialog--overlay').is(":visible")) { //No I18N
                        jQuery('.ui-widget-overlay').css("z-index","100"); //No I18N
                    }
                },1)
            },
            otherOptions: function() {
                /** Get the information from field response and updated **/
                if(data.is_new_api) {
                    var layout = data.layoutField;
                    if(layout && data.layoutField.display_type == "decimal") {//change this select to select2 component
                        var val = layout.response && layout.response.additional_attributes && layout.response.additional_attributes.precision ? layout.response.additional_attributes.precision : layout.precision || "2";
                        jQuery('[name=decimal_digit]').val(val);
                    }
                }
                initTooltip('.formpopup-queswrapper'); //No I18N
            },
            renderPicklist: function() {
                if (childObj.editFormrender) { //Edit form (customization)
                    _self.$udfformsettings.editFormfn(childObj);
                } else if (childObj.customizationrender) {
                    _self.$udfformsettings.customizationTabRender('customization'); //No I18N
                } else {
                    if(data && data.layoutField && data.layoutField.allowed_values) {
                        /*
                        https://connect.zoho.com/portal/intranet/task/105001099181468/105001104841681
                        Atleast one active field should be there in picklist options
                        */
                       const layoutField = data.layoutField;
                       const isUDF = layoutField.udfid ? true : layoutField.id.includes('udf_'); //No I18N
                        _self.$udfform.deconstructAllowedValues(layoutField.allowed_values, null, isUDF);
                    }
                    renderhbs('[data-id=picklistOpt]', 'picklist-template', data, false, "additionalfields",false, false, function() { //No I18N
                        /*** If Options have refer entity option, then render criteria based UI ***/
                        if(data.refer_entity) {
                            rnd.renderhbs_referentity(data);
                        }
                        _self.$udfform.allowedValSelectionformat();
                        const parent = jQuery('#dropdownSection');

                        parent.find('[data-name="removedropdownfield"]').off('click.af').on('click.af', (evt) => { //No I18N
                            const btn = jQuery(evt.currentTarget);
                            const optId = btn.attr('data-option-id'); //No I18N
                            if (btn.attr('data-deleted') === 'true') {
                                showconfirm(true, {
                                    title: translate('sdp.admin.orgrole.association.confirmdelete'),  //No I18N
                                    message: translate('additional.field.inactiveoption.delete'), //No I18N
                                    submitbutton: translate('common.proceed'),  //No I18N
                                    cancelbutton: translate('common.cancel'),  //No I18N
                                    closebutton: 'yes', //No I18N
                                    closeOnEscKey: 'yes' //No I18N
                                }, (confirm) => {
                                    confirm && _self.$udfform.deleteAllowedValues(optId);
                                })
                            }
                            else {
                                _self.$udfform.deleteAllowedValues(optId);
                            }
                        });
                    });
                }
                initTooltip('.formpopup-queswrapper'); //No I18N
            },
            renderhbs_referentity: function(data) {
                /** Render refer Entity criteria section UI
                 * data -- Field options
                 * **/
                let isLayout = true;
                if(jQuery("#criteria-layout").length == 1) {
                    renderhbs('#criteria-layout', 'form-refer-criteria', {"entities_to_refer": data.entities_to_refer,"udfid":data.layoutField.udfid,"layout":isLayout}, false, "additionalfields",false, false, function() {//NO I18N
                        if(jQuery("#refer_entity").length === 1) {
                            if(data.entities_to_refer.is_show) {
                                var ajaxurl = data.entities_to_refer.api;
                                var opt = {
                                    cache: {},
                                    processResults: function(search_data,data,field) {
                                        //For SCP the term technician is not used. So changed it as Support Rep/s. No impact for SDP.
                                        if(sdp_app.IS_SCP && data.name === 'technician') {
											data.display_name = 'Support Reps';// NO I18N
											data.display_plural_name = 'Support Reps';// NO I18N
										}
                                        data["text"] = data.display_name;
                                        search_data.push(data);
                                    }
                                };
                                opt = jQuery.extend(true, ajaxurl, opt);
                                jQuery("#refer_entity").sdp_select2(opt);
                                if(data.entities_to_refer.value.length != 0) {
                                    jQuery("#refer_entity").select2("data",data.entities_to_refer.value); // NO I18N
                                }
                            }
                            _self.$udfform.refer_criteria_events(isLayout);
                        }
                    });
                }
            },
        };
        if (childObj.popupload) { //Load template popup header
            renderhbs('#templatePopUp', 'form-template', data, false, "additionalfields", false, false, rnd.sectionrender, false, true); // NO I18N
        } else if (childObj.sectionrender) { //Render form section
            rnd.sectionrender();
        } else if (childObj.pickOptionrender) { //Render form picklist options
            rnd.renderPicklist();
        }
    },
    ajaxloaderfn: function(loadClose) {
        if (loadClose) {
            jQuery('.admin-panel').find('#freezeload').html(''); //page loading remove
        } else {
            const freezeLayer = jQuery('<div class="freezeLayer fw fh bgwhite"></div>').css({'z-index': '99'});// NO I18N
            jQuery('.admin-panel').find('#freezeload').append(ajaxBar()).append(freezeLayer); //ajax loading// NO I18N
        }
    },
    /**
     * @example
     * getfieldKey('pick_list')
     * // returns 'pick'
     * @param {string} type - field type
     * @returns string
     */
    getfieldKey: function(type) {
        var fKeyobj = {
            "single_line": "sline",//No I18N
            "multi_line": "mline",//No I18N
            "pick_list": "pick",//No I18N
            "multi_select": "multi",//No I18N
            "radio": "pick",//No I18N
            "checkbox": "multi",//No I18N
            "decimal": "dec",//No I18N
            "numeric": "num",//No I18N
            "date/time": "date",//No I18N
            "color": "color",//No I18N
            "boolean": "bool",//No I18N
            "date": "date",//No I18N
            "attachment": "attach",//No I18N
            "email": "email",//No I18N
            "url": "url",//No I18N
            "phone": "pho",//No I18N
            "percentage": "per",//No I18N
            "html": "html",//No I18N
        };
        return fKeyobj[type];
    },
    /**
     * // To Get allowed fields with id and display name
     *
     * @example
     * getfieldTypes(['Single Line', 'Pick List'])
     * // returns [{id: 'single_line', name: 'Single Line'}, {id: 'pick_list', name: 'Pick List'}]
     * @example
     * getfieldTypes()
     * // returns {single_line: {id: 'single_line', name: 'Single Line'}, pick_list:{id: 'pick_list', name: 'Pick List'}}
     * @param {Array} ftype - List of field types
     * @returns Array of objects when ftype is provided
     * @returns object when ftype is not provided (or undefined)
     */
    getfieldTypes: function(ftype, module) {
        var deffieldTypeMap = {
            "single_line": {//No I18N
                "id": "single_line",//No I18N
                "name": "common.single_line"//No I18N
            },
            "multi_line": {//No I18N
                "id": "multi_line",//No I18N
                "name": "common.multi_line"//No I18N
            },
            "pick_list": {//No I18N
                "id": "pick_list",//No I18N
                "name": "common.pick_list"//No I18N
            },
            "multi_select": {//No I18N
                "id": "multi_select",//No I18N
                "name": "common.multi-select"//No I18N
            },
            "radio": {//No I18N
                "id": "radio",//No I18N
                "name": "common.radio.button"//No I18N
            },
            "checkbox": {//No I18N
                "id": "checkbox",//No I18N
                "name": "sdp.admin.udf.checkbox.label"//No I18N
            },
            "decimal": {//No I18N
                "id": "decimal",//No I18N
                "name": "common.decimal"//No I18N
            },
            "numeric": {//No I18N
                "id": "numeric",//No I18N
                "name": "common.numeric"//No I18N
            },
            "date/time": {//No I18N
                "id": "date/time",//No I18N
                "name": 'common.date_time'//No I18N
            },
            "color": {//No I18N
                "id": "color",//No I18N
                "name": "sdp.common.colour"//No I18N
            },
            "boolean": {//No I18N
                "id": "boolean",//No I18N
                "name": (module && module == "checklist") ? "sdp.decision.box" : "common.boolean"//No I18N
            },
            "date": {//No I18N
                "id": "date",//No I18N
                "name": "sdp.common.date"//No I18N
            },
            "attachment": {//No I18N
                "id": "attachment",//No I18N
                "name": "common.file.upload"//No I18N
            },
            "email": {//No I18N
                "id": "email",//No I18N
                "name": "advance.license.email.label"//No I18N
            },
            "url": {//No I18N
                "id": "url",//No I18N
                "name": "common.url"//No I18N
            },
            "phone": {//No I18N
                "id": "phone",//No I18N
                "name": "sdp.viewuserdetails.phone"//No I18N
            },
            "percentage": {//No I18N
                "id": "percentage",//No I18N
                "name": "sdp.reports.customReport.percentage"//No I18N
            },
            "html": {//No I18N
                "id": "html",//No I18N
                "name": "common.html"//No I18N
            }
        };
        var fieldTypeMap = [];
        if(ftype) {
            for (var i = 0; i < ftype.length; i++) {
                var ftype1 = this.newFieldType(ftype[i], 'get');
                if(deffieldTypeMap[ftype1]) {
                   deffieldTypeMap[ftype1].name = translate(deffieldTypeMap[ftype1].name);
                    fieldTypeMap.push(deffieldTypeMap[ftype1]);
                }
            }
        } else {
            jQuery.each(deffieldTypeMap,function(i, val){
                val.name = translate(val.name);
            })
            fieldTypeMap = deffieldTypeMap;
        }
        return fieldTypeMap;
    },
    getConfig: function(rname) {/* get api call for module specific field information */
        var _self = this,
            field_info = {};
        const key = rname === "ci_type_association" ? "category" : "module";//No I18N

        var input_data = sdpAjaxInputData({
            "get_config": {//No I18N
                [key]: rname
            }
        });
        if($udfcommon.options.module_config && $udfcommon.options.module_config.config_name == rname) {//Skip api call for multiple time render
            field_info = $udfcommon.options.module_config.field_info
        } else {
            sdpAjax({
                url: '/api/v3/udf_fields/get_config', // No I18N
                async: false,
                cache: false,
                data: input_data,
                success: function(res) {
                    var fieldTypeMap = [];
                    var ftype = res.config.field_types;
                    var fieldTypeMap = _self.getfieldTypes(ftype);
                    field_info['config'] = {//No I18N
                        'fieldTypeMap': fieldTypeMap,//No I18N
                        'refer_entity': res.config.reference_entity_allowed ? true : false//No I18N
                    };
                    field_info.config = jQuery.extend(true,field_info.config, res.config);
                    field_info['get_config'] = true;//No I18N
                },
                error: function() {
                    field_info = {};
                    return field_info;
                }
            });
            $udfcommon.options["module_config"] = {"field_info": field_info,"config_name":rname};
        }
        return field_info;
    },
    /*UDF Listview Start*/
    $udflview: {
        options: {
            personalize_key: null //Personalization key to be passed in list view table component
        },
        table_compreq: null,
        routeName: null,
        fieldUpdated: false,/*** Additional field route when we have add entry then set as 'true' for refresh module/template ***/
        init: function(table_info, routeName) {
            this.udf.ajaxloaderfn(false); //Listview loading effect for render all data
            this.routeName = routeName;
            this.options = this.getListViewOpt(routeName);
            var table_content = {};
            table_content.header = this.headerdataConstruct(table_info, this, routeName);
            var _self = this;
            setTimeout(function() {
                var options = {
                    paginationEnabled: true,
                    searchEnabled: true,
                    columnchooser: true,
                    personalize_key: _self.options.personalize_key,
                    callbackRowfunction: _self.rowdataConstruct,
                    row_inputdata: _self.rowdataConstruct(table_info, _self),
                    callbackURL: "udf_fields", // No I18N
                    entity_name: "udf_fields", // No I18N
                    sortingEnabled: true,
                    isODAPI: true,
					support_search_criteria : true,
                    callbackAfterBodyRender: function(ui,self,table) {
                        _self.udf.ajaxloaderfn(true); //Stop loading effect after render all data
                        let cbr = $udfHelper && $udfHelper[routeName] && $udfHelper[routeName].callbackAfterBodyRender;
                        if(cbr && typeof cbr === "function") {// No I18N
                            cbr.apply(_self, [table]);
                        }
                    },
                };
                if(routeName == 'request'){
                     options.support_search_criteria = true;
                     options.callbackSearchFunction = _self.urlSearchCallBackFunction;
                }
                const list = $udfcommon.options.selectRoute;

                if(list.callback && list.callback.beforeInit) {
                    list.callback.beforeInit(table_info, table_content, options);
                }
                _self.table_compreq = new tableComponent(table_info, table_content, options, _self);
            }, 1);
        },
        getListViewOpt: function(rname) {
            let options = {
                personalize_key: rname, //Personalization key to be passed in list view table component
                adjustedHght: true, //Height adjustment when opening popup in listview
                insidePopup: false, //Listview inside popup
                popupContainer: null //Container for listview when inside popup
            };
            let module_opt = {};

            if($udfHelper[rname] && $udfHelper[rname].listViewOpt) {
                module_opt = $udfHelper[rname].listViewOpt();
            }

            options = jQuery.extend(true, options, module_opt);
            return options;
        },
        urlSearchCallBackFunction : function(type,tObj){
             var searchCrit = tObj.table_compreq.t_obj.table_info.list_info.search_criteria;
             var resCrit =[{'field':'field_group','condition':'is not','value':'resources','logical_operator':'AND'}];//No I18N
             if(searchCrit){
                   Array.isArray(searchCrit) ? resCrit.push(...searchCrit) : resCrit.push(searchCrit);
             }
             tObj.table_compreq.t_obj.table_info.list_info.search_criteria = resCrit;
             tObj.table_compreq.refreshTable('search'); // No I18N
        },
        rowdataConstruct: function(table_info, controller) {
            var inputObject = {};
            inputObject.list_info = table_info.list_info;

            if(!table_info.list_info.sort_field) {
                inputObject.list_info.sort_field = 'display_name'; // No I18N
            }
            if(!table_info.list_info.sort_order) {
                inputObject.list_info.sort_order = 'asc'; // No I18N
            }
            if(table_info.category) {
                inputObject.category = table_info.category;
            }
            return inputObject;
        },
        headerdataConstruct: function(table_info, controller, routeName) {
            var meta_data = {
                "delete": { //No I18N
                    "id": "delete_" + routeName, //No I18N
                    "dataCelltransformer": this.constructdeleteCell, //No I18N
                    "type": "icon", //No I18N
                    "hide_label": true, //No I18N
					"type": "icon" //No I18N
                },
                "edit": { //No I18N
                    "id": "edit_" + routeName, //No I18N
                    "dataCelltransformer": this.constructeditCell, //No I18N
                    "type": "icon", //No I18N
                    "hide_label": true, //No I18N
					"type": "icon" //No I18N
                },
                "display_name": {//No I18N
                    "text": translate("gdpr.field.name")//No I18N
                },
                "description": {//No I18N
                    "text": translate("sdp.common.description"),//No I18N
                    "sortable": false,//No I18N
                    "searchable": false//No I18N
                },
                "field_type": {//No I18N
                    "text": translate("common.type")//No I18N
                },
                "default_value": {//No I18N
                    "text": translate("common.predefined.value"),//No I18N
                    "dataCelltransformer": this.constructDefaultValueCell, //No I18N
                    "sortable": false,//No I18N
                    "searchable": false//No I18N
                },
                "name": {//No I18N
                    "text": translate("sdp.admin.customfields.api.name")//No I18N
                },
            };

            const options = this.udf.options.selectRoute;

            if(options.callback && options.callback.getMetaInfo) {
                meta_data = options.callback.getMetaInfo(meta_data);
            }

            return meta_data;
        },
        constructDefaultValueCell: function(rdata) {
            var rd = rdata.row_data;
            if(rd.default_value){
                if(rd.field_type == "Date"){
                    return translate('common.current.date.defaultvalue');
                }
                else if(rd.field_type == "Radio" || rd.field_type == "Pick List"){
                    return `<span rel="uitip" mode_ellipsis="true" title="`+ e_attr(rd.default_value.name) + `">` + e_html(rd.default_value.name) + `</span>`;
                }
                else{
                    return `<span rel="uitip" mode_ellipsis="true" title="`+ e_attr(rd.default_value) + `">` + e_html(rd.default_value) + `</span>`;;
                }
            }else{
                return "-";
            }
        },
        constructdeleteCell: function(rdata) { //Delete icon in listview
            var rd = rdata.row_data;
            if(sdp_app.IS_MDH_SETUP && !sdp_app.IS_ESMDIR && ((this.$udfcommon.options.routeName === "user" || this.$udfcommon.options.routeName === "department") || (sdp_app.IS_SCP && this.$udfcommon.options.routeName === "account") ) && rd.portal == null) { //No I18N
				return '<span></span>'; //No I18N
			} else {
				return '<span id="' + rd.id + '" class="cspr delete2 icon-sm vtop cur-ptr a11yemphasize" title="' + translate("common.delete") + '" rel="uitip" data-event="click" data-handler="$udfcommon.$udflview.templatecallDelete(' + rd.id + ')" nonce="' + window.sdpNonce + '"></span>'; //No I18N
			}
        },
        constructeditCell: function(rdata) { //Edit icon in listview
            var rd = rdata.row_data;
            var dtype = "'" + rd.field_type + "'";
			if(sdp_app.IS_MDH_SETUP && !sdp_app.IS_ESMDIR && ((this.$udfcommon.options.routeName === "user" || this.$udfcommon.options.routeName === "department") || (sdp_app.IS_SCP && this.$udfcommon.options.routeName === "account") ) && rd.portal == null) { //No I18N
                const key = $udfcommon.$udflview.moduleDisplayName(this.$udfcommon.options.routeName) || 'sdp.header.user'; //No I18N
				return '<span class="disp-ib rounded-circle udf-commonfield" title="' + translate('sdp.common.additionalfields.status', [translate(key)])+ '" rel="uitip"></span>'; //No I18N
			}
			else {
				return '<span class="cspr edit-modern1 icon-md cur-ptr a11yemphasize" title="' + translate("common.edit") + '" rel="uitip" data-display-type="' + rd.field_type + '" data-event="click" data-handler="$udfcommon.$udflview.templatecallEdit(' + rd.id + ',' + dtype + ')" nonce="' + window.sdpNonce + '"></span>'; //No I18N
			}
        },
        submoduleCng: function(module, rname, $this) {// Right now not used. Used for space module feature
            var table_info = table_comp.getTableInfo();

            var options = this.udf.options;
            var fields = options.routeUDFfields;
            var fieldsIndex;
            for (var i = 0; i < fields.length; i++) {
                if (fields[i].submodule) {
                    var submd = fields[i].submoduleData;
                    for (var j = 0; j < submd.length; j++) {
                        if (submd[j].id == rname) {
                            fields[i].selectsubmodule = submd[j];
                            fieldsIndex = i;
                        }
                    }
                }
            }
            table_info[options.selectRoute.type] = {
                "name": options.routeUDFfields[fieldsIndex].selectsubmodule.id//No I18N
            };

            renderhbs('[data-id=udflist]', 'listview-template', {//No I18N
                "routeName": module,//No I18N
                "module": "udf_fields",//No I18N
                "ESM": options.ESM,//No I18N
                'routeUDFfields': options.routeUDFfields,//No I18N
                'selectRoute': options.selectRoute//No I18N
            }, false, "additionalfields", false, false, null, false, true); // NO I18N
            this.init(table_info, rname);
        },
        usrtechCng: function(rname) {//User/Technician additional field change event for OLD grouping
            var table_info = table_comp.getTableInfo();

            var options = this.udf.options;
            var fields = options.routeUDFfields;
            for (var i = 0; i < fields.length; i++) {
                if (fields[i].id == rname) {
                    options.selectRoute = fields[i];
                }
            }
            table_info[options.selectRoute.type] = {
                "name": rname//No I18N
            };

            renderhbs('[data-id=udflist]', 'listview-template', {//No I18N
                "routeName": rname,//No I18N
                "module": "udf_fields",//No I18N
                "ESM": options.ESM,//No I18N
                'routeUDFfields': options.routeUDFfields,//No I18N
                'selectRoute': options.selectRoute,//No I18N
                'usertechdrop': true//No I18N
            }, false, "additionalfields", false, false, null, false, true); // NO I18N
            this.init(table_info, rname);
        },
        addNew: function(rname, module) {
			if(sdp_app.IS_MDH_SETUP && sdpheader_data.esm_details && sdpheader_data.esm_details.current_portal.isRetired) {
				showconfirm(true,'title='+translate("common.confirm.submit.msg")+', message='+translate("mdh.restricted.portals.cud.msg")+', cancelbutton='+translate("sdp.common.ok")+', closebutton=yes, closeOnEscKey=yes',function(){});// No I18N
			} else {
				var popupTitle = translate('common.new.field.label'); // No I18N
				var activeField = jQuery("[data-field-id='new_field']"); // No I18N
				var field_info = {
					"help_text": "", //No I18N
					"description": "", //No I18N
					"display_type": "single_line", //No I18N
					"id": "new_field", //No I18N
					"label": "", //No I18N
					"allowed_values": [], //No I18N
					"default_value": null, //No I18N
					"mandatory": false, //No I18N
					"right_side_shown": true, //No I18N
					'get_config': false, //No I18N
				};
				//var _self = this;
				var finfo;
                if(rname=='custom_module'){
                	finfo = this.udf.getConfig(this.table_compreq.t_obj.table_info.module.name);
                } else if(rname==='associations'){ // No I18N
                	finfo = this.udf.getConfig($udfcommon.options.selectRoute.entity_id);
                }
                else{
                	finfo = this.udf.getConfig(rname);
                }
				if (!jQuery.isEmptyObject(finfo)) {
					field_info = jQuery.extend(false, field_info, finfo);
				}
				var route = {
					'routeName': rname//No I18N
				};
				var udfform = this.udf.$udfform;
				udfform.fieldKeyobj = "sline_"; //No I18N
				udfform.options.routeName = rname;
				udfform.setPopUpFormValues(field_info, 'newField', popupTitle, null, module || 'udf_fields', false, false, route); // No I18N
				this.udf.loadRender(udfform, {
					'popupload': true//No I18N
				}); //render popup header and section
				udfform.showPopUp(activeField); // No I18N
			}
        },
        udfAllowedVal: function(id) { //Allowed values api call
            var resp = [];
            var hasmorerows = false;
            var linfo = {
                "list_info": {//No I18N
                    "row_count": 100//No I18N
                }
            };
            sdpAjax({
                url: '/api/v3/udf_fields/' + id + '/options', // No I18N
                type: 'GET', // No I18N
                async: false,
                cache: false,
                data: sdpAjaxInputData(linfo),
                success: function(res) {
                    resp = res.options;
                    hasmorerows = res.list_info.has_more_rows;
                }
            });
            return {"options": resp, "pick_hasmorerows": hasmorerows}; //No I18N
        },
        templatecallEdit: function(id, dispType, admintemplate) {
            var field_info = {};
			if(sdp_app.IS_MDH_SETUP && sdpheader_data.esm_details && sdpheader_data.esm_details.current_portal.isRetired) {
				showconfirm(true,'title='+translate("common.confirm.submit.msg")+', message='+translate("mdh.restricted.portals.cud.msg")+', cancelbutton='+translate("sdp.common.ok")+', closebutton=yes, closeOnEscKey=yes',function(){});// No I18N
			} else {
				var allowed_values = [];
				var _self = this;
				var editModule = "udf_fields"; //No I18N
				sdpAjax({
					url: '/api/v3/udf_fields/' + id, // No I18N
					type: 'GET', //No I18N
                    async: false,
                    cache: false,
					success: function(res) {
						var finfo = res.udf_field;
                        let udfOpt = _self.udf.$udfform.options;

                        udfOpt.is_pii = finfo.is_pii;

                        if (finfo.field_type == 'Pick List' || finfo.field_type == 'MultiSelect' || finfo.field_type == 'Radio' || finfo.field_type == 'CheckBox') { // No I18N //add allowed values for the edit operation
                            if(finfo.reference_entity == null || finfo.reference_entity == undefined) {
                                var resudf = _self.udf.$udflview.udfAllowedVal(id);
                                allowed_values = resudf.options;
                                if(resudf.pick_hasmorerows) {
                                    _self.udf.$udfform.options.pick_hasmorerows = resudf.pick_hasmorerows;
                                }
                            }

                            if(finfo.status && finfo.status.internal_name && finfo.status.internal_name == 'retired') {
                                udfOpt.retired_field = true;
                            }
                            else {
                                udfOpt.retired_field = false;
                            }
                        }

                        if(!admintemplate) {//condition for additional field entities
                             var f_info;
                             if(_self.routeName=='custom_module'){/** custom module alone include routename for separate additional field route and template route **/
                            	f_info = _self.udf.getConfig(_self.table_compreq.t_obj.table_info.module.name);
                             } else if(_self.routeName=='associations'){ //No I18N
                                f_info = _self.udf.getConfig($udfcommon.options.selectRoute.entity_id || $udfcommon.options.selectRoute.moduleName);
                             }
                             else{
                            	f_info = _self.udf.getConfig(_self.udf.options.routeName);;
                             }
                            if (!jQuery.isEmptyObject(f_info)) {
                                finfo = jQuery.extend(false, finfo, f_info);
                                finfo['get_config'] = true;//No I18N
                            }
                        }
						var activeField = jQuery("[data-field-id='new_field']"); // No I18N
						var ftype = _self.udf.newFieldType(finfo.field_type, 'get'); //field type// No I18N
						if (finfo.description == null || finfo.description == undefined) {
							var helptext = '';
						} else {
							var helptext = finfo.description;
						}
						field_info = {
							"label": finfo.display_name, //No I18N
							"description": helptext, //No I18N
							"help_text": helptext, //No I18N
							"display_type": ftype, //No I18N
							"id": finfo.name, //No I18N
							"allowed_values": allowed_values, //No I18N
							"default_value": finfo.default_value, //No I18N
							"mandatory": false, //No I18N
							"right_side_shown": true, //No I18N
							"udfid": finfo.id, //No I18N
							"is_encrypted": finfo.is_encrypted, //No I18N
							"allow_numbers_only": finfo.only_numeric, //No I18N
							"is_pii": finfo.is_pii, //No I18N
						};

						if (finfo.fixed_length != -1) {
							field_info.fixed_length = finfo.fixed_length;
						}
                        field_info["is_api"] = true;
                        if(finfo.field_type == "Numeric") {
                            if(finfo.additional_attributes && finfo.additional_attributes.num_range) {
                                var range = finfo.additional_attributes.num_range.split(":");
                                finfo.additional_attributes["min-len"] = range[0];
                                finfo.additional_attributes["max-len"] = range[1];
                            }
                        }
                        field_info["response"] = finfo;

						field_info['initial_value'] = _self.udf.$udfform.getDuplicateJSON(field_info); // No I18N // for compare the diff in newly added/update options
                        if(finfo.refer_field){
                            field_info.refer_field_value=finfo.refer_field.id;
                        }
                        					/*trigger additional field popup event in additional field entities*/
                        if(!admintemplate) {
    						var route = {
    							'routeName': _self.routeName//No I18N
    						};
                            var popupTitle = translate('common.edit.label', [translate('sdp.admin.common.addiotnalfield')]); // No I18N
    						_self.udf.$udfform.setPopUpFormValues(field_info, 'updateField', popupTitle, null, 'udf_fields', true, true, route); // No I18N
    						var renderloadObj = {
    							'popupload': true //No I18N
    						};
    						if (ftype == "pick_list" || ftype == "multi_select" || ftype == "radio" || ftype == "checkbox") {
    							renderloadObj['pickOptionrender'] = true;
    						}
    						_self.udf.loadRender(_self.udf.$udfform, renderloadObj); //render popup header and section, picklist option render in the above type present
    						_self.udf.$udfform.showPopUp(activeField); // No I18N
                        }
					}
				});
			}
            return field_info;
        },
        templatecallDelete: function(id) {
            var _self = this;
            $udfcommon.$udflview.fieldUpdated = true;
			if(sdp_app.IS_MDH_SETUP && sdpheader_data.esm_details && sdpheader_data.esm_details.current_portal.isRetired) {
				showconfirm(true,'title='+translate("common.confirm.submit.msg")+', message='+translate("mdh.restricted.portals.cud.msg")+', cancelbutton='+translate("sdp.common.ok")+', closebutton=yes, closeOnEscKey=yes',function(){});// No I18N
			} else {
				function udfDeletesubmit(s) {
					if (s) {
						sdpAjax({
							url: '/api/v3/udf_fields/' + id, // No I18N
							type: 'DELETE', //No I18N
							success: function(res) {
								_self.udf.$udflview.table_compreq.refreshTable('refresh'); //No I18N
								showalert('success', translate("api.deleted.success", [translate("sdp.admin.common.addiotnalfield")]), 'isAutoHide=true,delay=3'); //No I18N
							}
						});
					}
				}
				showconfirm(true, 'title=' + translate("sdp.backupapprover.conformdelete") + ', message=' + translate("sdp.admin.common.deleteconfirm") + ', submitbutton=' + translate("common.proceed") + ', cancelbutton=' + translate("common.cancel") + ', closebutton=yes, closeOnEscKey=yes', udfDeletesubmit,true); //No I18N
			}
        },
        getFieldCount: function(module_name) {
            let _self = this, options = {};
            const defaults = {
                dialogTitle: _self.moduleDisplayName(module_name) +' - '+ translate('additional.field.count.fieldusage'),
                inputData: {"type_wise_count":{"module" : module_name}}, //No I18N
                showInfoIcon: false,
            };

            if($udfHelper[module_name].getFieldCount) {
                options = $udfHelper[module_name].getFieldCount();
            }
            const conf = jQuery.extend({}, defaults, options);

            if(jQuery(document.body).children().find('#addFieldUsuage').length == 0) {
                /* Zoho Dialog removes the target element from DOM once we close the dialog.
                  So create a new div & append it everytime whenever we open the popup
                */
                jQuery('body').append('<div id="addFieldUsuage"></div>');
            }

            sdpAjax({
                url: "/api/v3/udf_fields/type_wise_count", //No I18N
                data: sdpAjaxInputData(conf.inputData),
                success: function(response) {
                    var res = response['type_wise_count'];
                    const opt = {
                        showInfoIcon: conf.showInfoIcon,
                        infoIconContent: conf.infoIconContent,
                        titleCount: {
                            total: res.max_fields,
                            available: res.available_fields || 0,
                            added: res.total_fields || 0,
                        },
                        tableData: [],
                    };

                    $udfcommon.getConfig($udfcommon.options.routeName);

                    Object.keys(res).forEach(key => {
                        const display_key = _self.fieldCountDisplayKey(key);
                        if(display_key) {
                            opt.tableData.push({display_key, count: res[key]});
                        }
                    });

                    renderhbs('#addFieldUsuage', 'field-count-popup', opt, false, "additionalfields", false, false, function() { //No I18N
                        const popUpOpt = {
                            title: conf.dialogTitle,
                            minimizable: true,
                            maximizable: true,
                            type: "modal", //No I18N
                            width: '40%',//No I18N
                            closeOnEscKey: true,
                            open: () => {
                                initTooltip('#addFieldUsuage'); //No I18N
                            },
                            height: jQuery(window).height(),
                            position: {
                                right: "0px", //No I18N
                                top: "0px" //No I18N
                            },
                            draggable: false,
                            resizable: {
                                directions: "w" ,//No I18N
                                minWidth: 300
                            },
                            animation:{
                                open:{
                                    className:'zeffects--slideright', //No I18N
                                    duration:300
                                }
                            },
                            className: 'sdpzcompdialog pos-fix cust-width', //No I18N
                            resizeWindow: true,
                            closeOnEscKey: true
                        }
                        if(sdp_user.DIRECTION == "RTL"){ //No I18N
                            popUpOpt.position = {
                                left: "0px", //No I18N
                            };
                            popUpOpt.resizable.directions = "e"; //No I18N
                            popUpOpt.animation.open.className = 'zeffects--slideleft'; //No I18N
                        }
                        jQuery('#addFieldUsuage').sdp_zcomponent_dialog(popUpOpt);
                    })
                }
            })
        },
        fieldCountDisplayKey(key) {
            const supportedFields = $udfcommon.options.module_config.field_info.config.field_types;

            const fieldMap = {
                text_fields: {
                    prefix: translate('sdp.admin.customfields.text'),
                    map: {
                        'Single Line': 'common.single_line',
                        'Phone': 'sdp.viewuserdetails.phone',
                        'Email': 'advance.license.email.label',
                        'Url': 'common.url',
                        'Color': 'sdp.common.colour',
                    }
                },
                numeric_fields: {
                    prefix: translate('sdp.reports.customReport.number'),
                    map: {
                        'Numeric': 'common.numeric',
                        'Decimal': 'common.decimal',
                        'Percentage': 'sdp.reports.customReport.percentage',
                    }
                },
                date_fields: {
                    prefix: translate('sdp.common.date'),
                    map: {
                        'Date/Time': 'common.date_time',
                        'Date': 'sdp.common.date',
                    }
                },
                attachment_fields: {
                    prefix: translate('common.attachment'),
                    map: {}
                },
                large_text_fields: {
                    prefix: translate('sdp.reports.customReport.largetext'),
                    map: {
                        'Multi Line': 'common.multi_line',
                        'Html': 'common.html',
                    }
                },
                boolean_fields: {
                    prefix: translate('common.boolean'),
                    map: {}
                },
                single_select_fields: {
                    prefix: translate('additional.field.single_select'),
                    map: {
                        'Pick List': 'common.pick_list',
                        'Radio': 'common.radio.button',
                    }
                },
                multi_select_fields: {
                    prefix: translate('common.multi-select'),
                    map: {
                        'CheckBox': 'sdp.admin.udf.checkbox.label',
                        'MultiSelect': 'common.multi-select',
                    }
                }
            };

            const { prefix, map } = fieldMap[key] || { prefix: '', map: {} };

            const availableFields = Object.keys(map).filter(el => supportedFields.includes(el)).map(el => (translate(map[el])));

            const suffix = availableFields.length > 0 ? `(${availableFields.join(', ')})` : '';

            return `${prefix}${suffix}`;
        },
        moduleDisplayName(key) {
            const map = {
                "user": "sdp.header.user", //No I18N
                "technician": "sdp.common.technician", //No I18N
                "request": "common.request", //No I18N
                "release": "common.release", //No I18N
                "project": "common.project", //No I18N
                "worklog": "sdp.requests.common.worklog", //No I18N
                "department": "common.department", //No I18N
                "cmdb": "ae.cmdb.admin.citype.citype", //No I18N
                "asset_asset": "common.asset", //No I18N
            }
            return translate(map[key]);
        },
        processHistory(history) {
            const i18n = {
                'option_add': 'udf.options.added', //No I18N
                'option_edit': 'udf.options.updated', //No I18N
                'option_delete': 'udf.options.deleted' //No I18N
            };
            Object.keys(i18n).forEach((key) => i18n[key] = translate(i18n[key]));

            let modifiedHistory = history.map((obj) => {
                if(typeof obj.operation === 'string') {
                    if(obj.operation.includes('option_add')) {
                        obj.operation = {name: obj.operation, display_name: i18n.option_add};
                    }
                    else if(obj.operation.includes('option_edit')) {
                        obj.operation = {name: obj.operation, display_name: i18n.option_edit};
                    }
                    else if(obj.operation.includes('option_delete')) {
                        obj.operation = {name: obj.operation, display_name: i18n.option_delete};
                    }
                }
                return obj;
            });
            $history.processHistory(modifiedHistory);
            return modifiedHistory;
        }
    },
    /*UDF Listview End*/
    /*UDF Form popup start (code get from release module branch admin/additional-field/edit/controller.js file)*/
    $udfform: {
        options: {
            module: '',
            /*Ember controller config based on setPopUpFormValues and setSectionFormValues in adminTemplate varibale true false condition*/
            parent: '', //NO I18N

            // we need checklist edit page controller and checklistitems listview controller to take action after closing the dditional field popup
            checklistController: '', //NO I18N
            checklistitemController: '', //NO I18N
            udflistviewController: '', //NO I18N
            popup_action: '',
            new_field: {},
            layoutField: {},
            section_form: {},
            header_section: {},
            popup_title: '',
            show_formSettings: false,
            showCopyDescOption: false,
            copyDescContent: false,
            isPII: false,
            encrypt_field: false,
            allow_numbers_only: false,
            descShown: false,
            popupType: '',
            selFieldType: null,
            isServiceTemplate: false,
            moduleId: null,
            option_text: '',
            showPIIField: false,
            showEncryptField: false,
            showPermissions: true,
            // to hide the needless picklist configurations for checklist module this key will be set to false based on module
            showPicklistCOnfigurations: true,
            name_disabled: false, //field_name disabled in update field popup
            disable_udf_fixed_length: false, //editing the udf field fixed length
            disable_udf_allownumber: false, //editing the udf field Allow number only checkbox option
            // to show the field type in disabled mode in update field popup for checklist module
            fieldtype_enabled: true,
            showCommonField: false,
            showUnique: false,
			showPrimaryField: false,
            pick_hasmorerows: false,
            // boolean field should be included in field type map
            fieldTypeMap: {//Used for old api method(Incident, Service, Checklist template)
                "single_line": {//No I18N
                    "id": "single_line",//No I18N
                    "name": translate("common.single_line")//No I18N
                },
                "boolean": {//No I18N
                    "id": "boolean",//No I18N
                    "name": translate("common.boolean")//No I18N
                },
                "multi_line": {//No I18N
                    "id": "multi_line",//No I18N
                    "name": translate("common.multi_line")//No I18N
                },
                "numeric": {//No I18N
                    "id": "numeric",//No I18N
                    "name": translate("common.numeric")//No I18N
                },
                "decimal": {//No I18N
                    "id": "decimal",//No I18N
                    "name": translate("common.decimal")//No I18N
                },
                "pick_list": {//No I18N
                    "id": "pick_list",//No I18N
                    "name": translate("common.pick_list")//No I18N
                },
                "multi_select": {//No I18N
                    "id": "multi_select",//No I18N
                    "name": translate("common.multi-select")//No I18N
                },
                "radio": {//No I18N
                    "id": "radio",//No I18N
                    "name": translate("common.radio.button")//No I18N
                },
                "checkbox": {//No I18N
                    "id": "checkbox",//No I18N
                    "name": translate("sdp.admin.udf.checkbox.label")//No I18N
                },
                "date/time": {//No I18N
                    "id": "date/time",//No I18N
                    "name": translate('common.date_time')//No I18N
                },
                "color": {//No I18N
                    "id": "color",//No I18N
                    "name": translate('sdp.common.colour')//No I18N
                }
            },
            select2_fieldTypes: [],
            sectionTypes: [{
                "id": 1,//No I18N
                "name": translate("common.single.column")//No I18N
            }, {
                "id": 2,//No I18N
                "name": translate("common.double.column")//No I18N
            }, {
                "id": 3,//No I18N
                "name": translate("common.three.column")//No I18N
            }, {
                "id": 4,//No I18N
                "name": translate("common.four.column")//No I18N
            }, {
                "id": 5,//No I18N
                "name": translate("common.flexible.column")//No I18N
            }],
            optionDispayTypes: [{
                "id": "Horizontal",//No I18N
                "name": translate("sdp.requests.common.chart_hori")//No I18N
            }, {
                "id": "Vertical",//No I18N
                "name": translate("sdp.requests.common.chart_vert")//No I18N
            }],
            dateValue: null,
            override_pm: false, //whether priority matrix is overridden
            fieldKeyobj: "sline_", //No I18N
            labeltofieldkeyCopy: true,
            optionlist_selectenable: false, //picklist allowed value options show preview only
            asc_order: false, //Ascending order
            allowReordering: true,
            adminTemplate: false, //Used for Template section(incident/service) and Other section
            // Options to be present in the Style properties Popup
            form_options: {
                "font_family": true, // No I18N
                "font_size": true, // No I18N
                "bg_color": true, // No I18N
                "label_color": true, // No I18N
                "label_align": true, // No I18N
                "font_decoration": true // No I18N
            },
            section_options: {
                "font_family": true, // No I18N
                "font_size": true, // No I18N
                "label_color": true, // No I18N
                "label_align": true, // No I18N
                "font_decoration": true, // No I18N
                "bg_color": true // No I18N
            },
            header_options: {
                "font_family": true, // No I18N
                "font_size": true, // No I18N
                "label_color": true, // No I18N
                "font_decoration": true, // No I18N
                "bg_color": true // No I18N
            },
            field_options: {
                "font_family": true, // No I18N
                "font_size": true, // No I18N
                "bg_color": true, // No I18N
                "label_color": true, // No I18N
                "font_decoration": true // No I18N
            },
            currentTab: 'properties', // No I18N
            has_duplicate_option: false,
            // this key is used to identify whether the additional_field popup is controlled from checklistedit or checklistitem page
            fromChecklistEditPage: false,
            dataMsg: "sdp.admin.additionalfields.fieldname.emptyerrmessage", //No I18N
            showImportWizard: false,
            formWidth: 1880,
            routeName: '',
            popupClose: true,//Save and Close button show/hide
			sortAllowedValues: [],//Jquery sortable method change the id in template section
            /** New Options Start**/
            is_new_api: true,//Separate call for new and old api also used to render UI
            refer_entity: false,
            tablerefresh: false,//Option operation and reder via API then refresh the listview when close the popup
            /** New Options End**/
            showFieldTabs: false, // Option to show properties & customization tab (for field)
            showFieldCustomization: false, // Option to show customization  tab for a field or not
            showSectionTabs: true, // Option to show properties & customization tab (for section)
            showSectionCustomization: true, // Option to show customization  tab for a section or not
            hideDefaultVal: false, // Option to show default value input in right side of the popup
            autoSelectEncryptField: false, // Option to auto select encrypted field when PII field is selected
            retired_field: false,
            field_helptext_maxlength: 250, // Field Helptext Maxlength -  250 for all modules that follow template framework, 1500 for request template
            section_helptext_maxlength: 250, // Section Helptext Maxlength -  250 for all modules that follow template framework, 2500 for request template
            sendDefValue: true // Whether to send default value in payload
        },

        // Check the datatype of Numeric and Decimal Field, shows alert if invalid datatype is found
        checkData: function(fieldType, defaultValue, arg) {
            this.checkDataType(fieldType, defaultValue, arg);
        },
        /*Additional field popup options initalize Start*/
        isPIIField: function(display_type, types) {
            /*** PII enable for fields
             * display_type(String) -- field type's
             * types(Array) -- list of field's ["single_line", "email"]
             * ***/
            var isPIIField = true;
            if(types && types.length != 0) {
                if(types.indexOf(display_type) == "-1") {
                    isPIIField = false;
                }
            } else {
                const unsupportedFields = ["decimal", "multi_select", "checkbox", "boolean", "attachment", "color", "url", "percentage"];//No I18N
                if(unsupportedFields.indexOf(display_type) > "-1") {
                    isPIIField = false;
                }
            }
            return isPIIField;
        },
        isEncryptField: function(display_type, mopt) {
            var isEncryptField = false;
            mopt = mopt ? mopt : this.options;
            let default_encryptField = mopt.default_encryptField ? mopt.default_encryptField : ['single_line', 'multi_line']; //No I18N
            if (default_encryptField.indexOf(display_type) != "-1" || (mopt.encryptField_extrafiled && mopt.encryptField_extrafiled.indexOf(display_type) != "-1")) {
                isEncryptField = true;
            }
            if(mopt.skipEncryptField) {
                isEncryptField = false;
            }
            return isEncryptField;
        },
        isValidDefValue: function(field_type, default_value, fixed_length) {
            if (field_type === "single_line" && (fixed_length > 250 || (default_value && default_value.length > 250))) {
                let warning = window.translate('sdp.admin.customfields.fixedlength.textlimit');
                showalert('failure', warning, 'isAutoHide=false'); //NO I18N
                return false;
            }
            if (field_type === "numeric" && (fixed_length > 19 || (default_value && default_value.length > 19))) {
                let warning = window.translate('sdp.admin.customfields.fixedlength.numericlimit');
                showalert('failure', warning, 'isAutoHide=false'); //NO I18N
                return false;
            }

            if (default_value) {
                if ((field_type == "numeric" || field_type == "decimal") && default_value.length > 0) {
                    if (!this.checkDataType(field_type, default_value)) {
                        return false;
                    }
                }

                if (field_type === "decimal" && default_value.split('.')[0].length > 13) {
                    let warning = window.translate('sdp.admin.common.decimalValidation.msg');
                    showalert('failure', warning, 'isAutoHide=false'); //NO I18N
                    return false;
                }
            }
            return true;
        },
        setFieldTypes: function(isServTemplate, fieldInfo, module) {
            /*fieldInfo variable used for get_config api call*/
            // initializing the allowed field types for checklist module 
            if (fieldInfo.get_config) { //Server side new api call triggered for allowed fieldtype
                var fieldType = fieldInfo.config.fieldTypeMap;
            } else {
                if (module == 'checklist') {
                    var ftype = ["Single Line","Numeric","Radio","Boolean"]; // No I18N
                } else if(module == 'problem'){
                    var ftype = ["Single Line","Multi Line","Pick List","Numeric","Date/Time"];// No I18N
                }else {
                    var ftype = ["Single Line","Multi Line","Numeric","Decimal","Pick List","Date/Time"]; // No I18N
                    if (!isServTemplate) {
                        var ftype = ["Single Line","Multi Line","Numeric","Decimal","Pick List","Date/Time","MultiSelect","Radio","CheckBox"]; // No I18N
                    }
                }
                var fieldType = this.udf.getfieldTypes(ftype, module);
            }
            //this.set('select2_fieldTypes',fieldType);// No I18N
            return fieldType;
        },
        checkDataType: function(field_type, value, arg) {
            var rules = ".*";
            if (arg && arg != "fieldvalue") { // No I18N
                var arg1 = e_html(arg);
            } else {
                var arg1 = window.translate("common.predefined.value"); // No I18N
            }
            var msgKey, matchList, rules_msg;
            if (field_type == "numeric") {
                rules = "^[0-9]*$";
                msgKey = "common.numeric.value.error.msg"; //NO I18N
            } else if (field_type == "decimal") { //No I18N
                rules = "^[-+]?[0-9]{0,13}(\\.[0-9]+)?"; // No I18N
                msgKey = "common.decimal.value.error.msg"; //NO I18N
            }
            rules_msg = window.translate(msgKey, [arg1]);
            rules = new RegExp(rules);
            matchList = value.match(rules);
            if (matchList == null || matchList[0] != value) {
                showalert('failure', rules_msg, 'isAutoHide=false'); //NO I18N
                return false;
            }
            return true;
        },
        isAllowedValuesExists: function(allowed_values, newValue) {
			//SD-97580: Case insensitive check
            return allowed_values.find(option => !option.deleted && (option.name.toLowerCase() == newValue.toLowerCase()));
        },
        getDuplicateJSON: function(input_json) {
            var duplicate_json = input_json;
            if (input_json != null) {
                var stringified_field = sdpToJSON(input_json);
                duplicate_json = JSON.parse(stringified_field);
            }
            return duplicate_json;
        },
        udffieldEntities: function(cntrl, popup_action, fieldInfo) {//UDF field listview Module specific options added
            var opt = {};
            let sub_opt = {}, _self = this, _opt = _self.options;
            if(cntrl && cntrl.routeName) {

                if($udfHelper[cntrl.routeName] && $udfHelper[cntrl.routeName].udffieldEntities) {
                    sub_opt = $udfHelper[cntrl.routeName].udffieldEntities.apply(_self, arguments);
                }

                opt = {
                    is_udf_prefix_supported : fieldInfo.config ? fieldInfo.config.is_udf_prefix_supported : undefined,
                    showPIIField: (cntrl && cntrl.routeName == "department") ? true : false,//No I18N
                    piiI18: "sdp.gdpr.pii.fieldinfo", //No I18N
                    piiI18Title: "sdp.gdpr.pii.info", //No I18N
                    isPII: (popup_action == "updateField") ? fieldInfo.is_pii : false,//No I18N
                    fieldtype_enabled: (popup_action == "updateField") ? false : true, //No I18N
                    name_disabled: false,
                    disable_udf_fixed_length: false,
                    disable_udf_allownumber: false,
                    showDesc: true,
                    showCopyDescOption: false,
                    showPermissions: false,
                    showHelpText: false,
                    requestercanEdit: false,
                    requestercanView: false,
                    descmultiHgt: false,
                    freezelayer: true,
                    datepickerdisable: true,
                    fieldKey: false,
                    allownumbers_show: (fieldInfo.display_type == "single_line") ? true : false, //No I18N
                    mline_maxlength: (fieldInfo.display_type == "multi_line") ? 500 : 250, //No I18N
                    field_helptext_maxlength: 250,
                    section_helptext_maxlength: 250,
                    disable_defval: (fieldInfo.display_type == "decimal") ? true : false, //NO I18N
                    saveAndAddBtn: false,
                    helpContent: (fieldInfo.display_type == "single_line" || fieldInfo.display_type == "numeric" || fieldInfo.display_type == "decimal") ? true : false,//No I18N
                    helpContentTemplate: true,
                    retired_field: (popup_action == "updateField") ? _opt.retired_field : false, //NO I18N
                    fieldKey_disabled: false,
		    sendDefValue: true
                };
                if(!jQuery.isEmptyObject(sub_opt)) {
                    opt = jQuery.extend({}, opt, sub_opt);
                }
            }
            return opt;
        },
        setPopupConditions: function(popup_action, fieldInfo, module, service_catalog_module_enabled, cntrl) {
            var field_type = fieldInfo.display_type;
            let mopt = {}, _self = this, _opt = _self.options;
            mopt = $udfHelper[module].setPopupConditions.apply(_self, arguments);

            var copt = {
                is_udf_prefix_supported : fieldInfo.config ? fieldInfo.config.is_udf_prefix_supported : undefined,
                field_name_length: "100", //No I18N
                piiI18: "sdp.gdpr.pii.fieldinfo", //No I18N
                piiI18Title: "sdp.gdpr.pii.info", //No I18N
                showPIIField: (popup_action == 'newField') ? this.isPIIField(field_type) : false, //No I18N
                isPII: (popup_action == "updateField") ? (fieldInfo.hasOwnProperty('response') && (jQuery.isPlainObject(fieldInfo.response) && fieldInfo.response.hasOwnProperty('is_pii')) ? fieldInfo.response.is_pii : fieldInfo.is_pii) : false,//No I18N
                showEncryptField: (popup_action == 'newField') ? this.isEncryptField(field_type, mopt) : false, //No I18N
                encrypt_field: false,
                allow_numbers_only: fieldInfo.allow_numbers_only || false,
                allownumbers_show: (fieldInfo.display_type == "single_line" && popup_action == "newField") ? true : false, //No I18N
                option_text: '',
                show_s_common_field: false,
                showPermissions: (fieldInfo.id == 'site' || fieldInfo.id == 'subject') ? false : true, //No I18N SD-102590
                isServiceTemplate: false, //NO I18N
                popupType: 'field', //NO I18N
                showDesc: (popup_action == 'newField') ? true : false, //No I18N
                name_disabled: (popup_action == 'newField') ? false : true, //No I18N
                disable_udf_fixed_length: (popup_action == "newField") ? false : true, //No I18N
                disable_udf_allownumber: (popup_action == "newField") ? false : true, //No I18N
                max_field_length: (fieldInfo.display_type == "single_line") ? ((fieldInfo.config && fieldInfo.config.sline_char_limit) ? parseInt(fieldInfo.config.sline_char_limit) : 250) : (fieldInfo.display_type == "numeric" ? 19 : null), //No I18N
                mline_maxlength: 250, //No I18N
                field_helptext_maxlength: 250,
                section_helptext_maxlength: 250,
                showCommonField: false,
                copyDescContent: false,
                showCopyDescOption: (popup_action == 'newField') ? true : false, //No I18N
                fieldtype_enabled: true,
                dataMsg: "sdp.admin.additionalfields.fieldname.emptyerrmessage", //No I18N
                showHelpText: true,
                requestercanEdit: true,
                requestercanView: true,
                descmultiHgt: true,
                datepickerdisable: false,
                fieldKey: false,
                freezelayer: false,
                apiFieldMsg: "sdp.release.addl.field.apifield.msg", //No I18N
                disable_defval: false,
                fileupload: true,
                helpContent: false,
                helpContentTemplate: true,
				saveAndAddBtn: !_opt.adminTemplate,
				disableRightsec: false,
                sline_char_limit: fieldInfo.sline_char_limit || 250,
                mline_char_limit: fieldInfo.mline_char_limit || 250,
                retired_field: false,
                sendDefValue: !_opt.adminTemplate
            };
			if(module=="space"){
				copt.udfSubModule=this.udf.options.selectRoute.selectsubmodule.id;
				if(this.udf.options.selectRoute.selectsubmodule.childModule){
					copt.childModule=this.udf.options.selectRoute.selectsubmodule.childModule;
				}
			}
            copt = jQuery.extend({}, copt, mopt);
            var fieldType = this.setFieldTypes(copt.isServiceTemplate, fieldInfo, module); /*fieldInfo variable used for get_config api call*/
            copt['select2_fieldTypes'] = fieldType; // No I18N

            if (copt.refer_field) {
                var url = '/api/v3/udf_fields'; // No I18N
                url += fieldInfo.udfid ? '/'+fieldInfo.udfid : ''; // No I18N
                url += '/refer_field'; // No I18N
                let coptfor = copt.refer_field_for ? copt.refer_field_for : {};
                var input_data = sdpAjaxInputData(coptfor);
                var refer_field_options = [], refer_field_value=null;
                sdpAjax({
                    url: url,
                    async: false,
                    cache: false,
                    data: input_data,
                    success: function(res) {
                        refer_field_options.push({
                            id: 0,
                            name: translate('sdp.requests.fieldFormRules.selectField') // No I18N
                        });
                        res.refer_field.forEach( field => {
                            field.name = field.display_name;
                            refer_field_options.push(field);
                            if (field.id == fieldInfo.refer_field_value){
                                refer_field_value = field;
                            }
                        });
                    },
                    error: function() {
                    }
                });
                copt.refer_field_options = refer_field_options;
                copt.refer_field_value = refer_field_value;
            }
            copt['fieldKeyobj'] = this.udf.getfieldKey(field_type) + "_";

            return copt;
        },
        setValuesForFieldTypes: function(popup_action, fieldInfo) {//Need to verfiy all options and module also
            // getting the current module
            var module = this.options.module;
            var field_type = fieldInfo.display_type;
            var fieldId = fieldInfo.id ? fieldInfo.id : "";
            var popupFieldId = "popup" + fieldId; //NO I18N
            var is_pick_list_shown = (field_type == "pick_list" || field_type == "multi_select" || field_type == "radio" || field_type == "checkbox") ? true : false; //No I18N
            // all fields are udfs for checklist module

            var fieldOpts = {
                show_display_options: (field_type === 'checkbox' || field_type === 'radio') ? true : false, //No I18N
                isConstraintsShown: (field_type == "pick_list" || field_type == "multi_select" || field_type == "radio" || field_type == "checkbox") ? false : true, //No I18N
                isUDF: (popup_action == 'newField') ? true : (fieldId.indexOf("udf_") != -1),
            };

            if($udfHelper[module].setValuesForFieldTypes) {
                let opts = $udfHelper[module].setValuesForFieldTypes(...arguments);
                fieldOpts = jQuery.extend({}, fieldOpts, opts);
            }
            // req_view_disabled  configuration is not needed for checklist module
            var req_view_disabled = (fieldInfo.label == 'Description' || fieldInfo.id == 'approvers' || module == 'checklist') ? true : false;
            // defaultvalue configuration is not needed for checklist module so no need to add observer
            if (module != 'checklist' && module != 'udf_fields') { // No I18N
                if (field_type == 'date/time') {
					if (fieldInfo.default_value === null || fieldInfo.default_value === undefined) {
						fieldInfo.default_value = {
							"value": 0 //No I18N
						};
					}
					this.options.dateValue = fieldInfo.default_value.value || null;
                }
            }
            // If Rich text area is resized, update the height in the object
            if (fieldInfo.display_type == "rich_text_area") { // No I18N
                var editorHeight = jQuery('#reqTempHTMLDesc .ui-resizable .ze_area').outerHeight(); // No I18N
                if (this.options.adminTemplate) {
                    Ember.set(fieldInfo, "height", String(editorHeight)); // No I18N
                } else {
                    fieldInfo.height = String(editorHeight); // No I18N
                }
            }
            // few picklistconfigurations are to be hidden for checklist module
            if (module == 'checklist') {
                this.options.showPicklistCOnfigurations = false;
            }
            var new_field = {
                "fixed_length": fieldInfo.fixed_length, //NO I18N
                "help_text": fieldInfo.help_text, //NO I18N
                "e_help_text": e_html(fieldInfo.help_text).replace(/\r\n|\r|\n/g, "<br>"), //NO I18N
                "isConstraintsShown": fieldOpts.isConstraintsShown, //NO I18N
                "is_pick_list_shown": is_pick_list_shown, //NO I18N
                "isUdfField": fieldOpts.isUDF, //NO I18N
                "right_side_shown": fieldInfo.right_side_shown, //NO I18N
                "initial_value": fieldInfo.initial_value, //NO I18N
                "id": popupFieldId, //NO I18N
                "s_common_field": (module == 'checklist') ? false : true, // No I18N
                "req_view_disabled": req_view_disabled, //NO I18N
                "show_display_options": fieldOpts.show_display_options, //NO I18N
                "style_properties": fieldInfo.style_properties, // No I18N
                "fieldKey": fieldInfo.fieldKey, // No I18N
            };
            const allowedModules = ['udf_fields', 'release', 'task', 'space', 'facility_service','request', 'problem', 'support_group']; //NO I18N
            if (allowedModules.includes(module) && this.options.showDesc) {
                new_field.description = fieldInfo.help_text;
            }
            this.options.new_field = new_field;
			if(popup_action == "newField" && this.options.saveAndAddBtn) { //NO I18N
				/*Below options used for reset the fields when popup not closing*/
				var formresetopt = {
					layoutField : cloneJson(this.options.layoutField),
					labeltofieldkeyCopy: true,
					encrypt_field: false,
					allow_numbers_only: false,
					isPII: false,
					new_field: cloneJson(new_field)
				};
				this.options['formReset'] = formresetopt;
			}
            if (module == 'checklist') {
                if (popup_action != 'newField' && field_type == 'radio') {
                    jQuery(document).ready(function() {
                        jQuery('#addAllowedValuesTextBox').addClass('disp-ib mb20');
                    });
                }
                setTimeout(function() {
                    if (fieldInfo.right_side_shown == false) {
                        jQuery('.alert-dialog-ui1').addClass('single-form');
                    } else {
                        jQuery('.alert-dialog-ui1').removeClass('single-form');
                    }
                }, 200);
            }
        },
        setPopUpFormValues: function(fieldInfo, popup_action, popup_title, moduleId, module, override_pm, service_catalog_module_enabled, ctrl) {//Need to verfiy all options and module also
            var _self = this;
            this.options.adminTemplate = ctrl.adminTemplate ? ctrl.adminTemplate : false;
            var wdh = fieldInfo.max_width || this.options.formWidth;
            this.options.is_new_api = (module == 'checklist' || module == 'incident' || module == 'service') ? false : true;//NO I18N
            if(this.options.adminTemplate && this.options.is_new_api) {//Get API call for field specific information
                this.options.modelname = (module == "custom_modules") ? "cm_" + ctrl.model.name : (module == "customize_ag_form") ? ctrl.entity_name : module;//NO I18N
                var finfo = $udfcommon.getConfig(this.options.modelname);
                if (!jQuery.isEmptyObject(finfo)) {
                    fieldInfo = jQuery.extend(true, fieldInfo, finfo);
                }
            }
            fieldInfo["allowed_values_limit"] = this.options.is_new_api ? 100 : 500;
            if(!fieldInfo.config && fieldInfo.response && fieldInfo.response.config) {
                fieldInfo["config"] = fieldInfo.response.config;
                fieldInfo["get_config"] = fieldInfo.response.get_config;
            }
            if(this.options.is_new_api && fieldInfo.get_config && fieldInfo.config) {//get_config api call to render the field properties
                var fieldTypeMap = _self.udf.getfieldTypes();//Get allowed fields with id and display name
            } else {
                var fieldTypeMap = this.options.fieldTypeMap;
                if(module == 'checklist') {
                    fieldTypeMap["boolean"].name = translate("sdp.decision.box");
                }
            }
            var defaultFieldType = fieldTypeMap[fieldInfo.display_type];
            var selectenable = (fieldInfo.optionlist_selectenable) ? fieldInfo.optionlist_selectenable : this.optionlist_selectenable;
            var opt = {
                'popup_title': popup_title, //NO I18N
                'popup_action': popup_action, //NO I18N
                'module': module, //NO I18N
                'layoutField': fieldInfo, //NO I18N
                'moduleId': moduleId, //NO I18N
                'override_pm': override_pm, //NO I18N
                'maxWidth': wdh, // No I18N
                'routeName': this.options.routeName || ctrl.routeName, // No I18N
                "selFieldType": defaultFieldType, // No I18N
                "filter": '', // No I18N
                "optionlist_selectenable": selectenable, // No I18N
                "checklistitemController": ctrl, // No I18N
            };
            if (this.options.adminTemplate) { //Set admin tab controller
                var cntrlopt = {
                    'controller': ctrl, // No I18N
                    'parent': ctrl.parent, // No I18N
                    'checklistController': ctrl.checklistController, // No I18N
                    'checklistitemController': ctrl.checklistitemController, // No I18N
                    'maxWidth': (ctrl.parent.model == undefined) ? this.options.formWidth : ctrl.parent.model.style_properties.max_width, // No I18N
                };
                opt = jQuery.extend({}, cntrlopt, opt);
            }
            if(this.options.is_new_api) {
                var resobj = fieldInfo.response;
                if (this.options.adminTemplate && fieldInfo.udfid) {
                    var getresobj = _self.udf.$udflview.templatecallEdit(fieldInfo.udfid, fieldInfo.display_type,this.options.adminTemplate);
                    resobj = getresobj.response;
                    if(getresobj.allowed_values && getresobj.allowed_values.length != 0) {
                        Ember.set(opt.layoutField,"allowed_values",getresobj.allowed_values);// No I18N
                        Ember.set(fieldInfo.initial_value,"allowed_values",getresobj.allowed_values);// No I18N
                    }
                }
                opt.layoutField["response"] = resobj;

                //entities_to_refer to handle
                if(fieldInfo.display_type == "pick_list" || fieldInfo.display_type == "multi_select" || fieldInfo.display_type == "radio" || fieldInfo.display_type == "checkbox") {
                    if(fieldInfo.config && fieldInfo.config.refer_entity && (fieldInfo.udfid || fieldInfo.id== "new_field")) {
                        _self.entityreferoption(fieldInfo);
                    }
                    if(fieldInfo.response && fieldInfo.response.reference_entity) {
                        _self.entityreferfn_value(module,fieldInfo.response);
                    }
                }
            }



            var copt = this.setPopupConditions(popup_action, fieldInfo, module, service_catalog_module_enabled, ctrl);
            opt = jQuery.extend({}, opt, copt);
            if (popup_action == 'editForm') { // No I18N
                opt['popupType'] = 'form'; // No I18N
                opt['show_formSettings'] = true; // No I18N
            }
			if (popup_action == 'newField') { // No I18N
				this.options.fieldKeyobj = "sline_"; //No I18N
			}
            this.options = jQuery.extend({}, this.options, opt);
            this.setValuesForFieldTypes(popup_action, fieldInfo);
            this.checkForNumbers();
        },
        setSectionRolesValues: function(fieldInfo, popup_action, popup_title, module, ctrl) {
            /* Release module "Roles" popup */
            this.options.adminTemplate = ctrl.adminTemplate ? ctrl.adminTemplate : false;
            var opt = {
                'popup_title': popup_title, //NO I18N
                'popup_action': popup_action, //NO I18N
                'module': module, //NO I18N
                'layoutField': fieldInfo, //NO I18N
            };
            if (this.options.adminTemplate) { //Set admin tab controller
                var cntrlopt = {
                    'parent': ctrl.parent, // No I18N
                    'checklistController': ctrl.checklistController, // No I18N
                    'checklistitemController': ctrl.checklistitemController, // No I18N
                };
                opt = jQuery.extend({}, cntrlopt, opt);
            }
            this.options['popupType'] = 'Roles'; // No I18N
            var copt = this.setPopupConditions(popup_action, fieldInfo, module);
            opt = jQuery.extend({}, opt, copt);
            this.options = jQuery.extend({}, this.options, opt);
            this.checkForNumbers();
        },

        setSectionFormValues: function(sectionInfo, popup_action, popup_title, module, ctrl) {
            this.options.adminTemplate = ctrl.adminTemplate ? ctrl.adminTemplate : false;
            var opt = {
                'popupType': 'section', //NO I18N
                'section_form': sectionInfo, //NO I18N
                'popup_title': popup_title, //NO I18N
                'popup_action': popup_action, //NO I18N
                'module': module, //NO I18N
                'freezelayer': false, //NO I18N
                'section_helptext_maxlength': 250 // No I18N
            };

            if($udfHelper[module] && $udfHelper[module].setSectionFormValues) {
                const conf = $udfHelper[module].setSectionFormValues.apply(this, arguments);
                opt = jQuery.extend({}, opt, conf);
            }

            if (this.options.adminTemplate) {
                var cntrlopt = {
                    'parent': ctrl.parent, // No I18N
                    'checklistController': ctrl.checklistController, // No I18N
                    'checklistitemController': ctrl.checklistitemController, // No I18N
                };
                opt = jQuery.extend({}, cntrlopt, opt);
            }
            // Assign the Section style properties to Section form
            this.options = jQuery.extend({}, this.options, opt);
            this.options['section_form']['style_properties'] = sectionInfo.style_properties; // No I18N
        },

        /*Additional field popup options initalize End*/
        /*Additional field popup Show Start*/
        showPopUp: function(activeField) {
            var module = this.options.module;
            var wdt = jQuery(document).width();
            var hgt = jQuery(document).height();
            var popupAction = this.options.popup_action;
            var popUpType = this.options.popupType;
            var popUpData = jQuery("[data-name=formpopup]"); // No I18N
            const rName = this.options.routeName;

            let lViewOpt = $udfcommon.$udflview.options;

            if(this.options.module=='custom_modules' || this.options.module=='customize_ag_form'){ //No I18N
            	this.options['labeltofieldkeyCopy'] = this.options.labeltofieldkeyCopy; //No I18N
            }
            else{
                this.options['labeltofieldkeyCopy'] = true; //No I18N
            }
            this.options["show_formSettings"] = true; // No I18N
            this.options['showImportWizard'] = false; // No I18N

            jQuery(".freezeLayer").removeClass('hide').css({//No I18N
                "width": wdt,//No I18N
                "height": hgt,//No I18N
                'background': 'none'//No I18N
            });

            setTimeout(function() {
                // for checklist module active field is not there so positioning is done relative to the window without calculating offset from active field.
                if (module != 'checklist' && module != 'udf_fields' && activeField && activeField.length && jQuery('#content-panel').length) {
                    var popUpDataWidth = (popUpType == "field") ? 780 : 480; //NO I18N
					var latesthgt = jQuery('#content-panel').offset().top; //NO I18N
                    var staticHgt = jQuery(activeField).attr("data-type") == "rich_text_area" ? 40 :  activeField.outerHeight(); // No I18N
                    var topPos = parseInt(activeField.offset().top + staticHgt - latesthgt) + "px"; // No I18N
                    var leftPos = parseInt(activeField.offset().left + 10);
                    var direction = sdp_user.DIRECTION;
                    var contentPanelWidth = jQuery('.content-panel').width();
                    var pos;

                    if (direction == "LTR") {
                        pos = leftPos;
                    } else {
                        pos = contentPanelWidth - (leftPos + activeField.width());
                    }
                    if (parseInt(contentPanelWidth) < (parseInt(popUpDataWidth) + parseInt(pos))) { //Side left or right
                        var x = (parseInt(pos) + parseInt(popUpDataWidth)) - parseInt(jQuery('.content-panel').width()) - jQuery('.content-panel').offset().left;
                        pos = parseInt(pos) - x - 30;
                    }
                    pos = pos + "px"; //NO I18N

                    if (direction == 'LTR') {
                        popUpData.css({
                            'top': topPos,//No I18N
                            'left': pos//No I18N
                        });
                    } else {
                        popUpData.css({
                            'top': topPos,//No I18N
                            'right': pos//No I18N
                        });
                    }
                }
                jQuery('#templatePopUp').removeClass('hide'); //NO I18N
                initTooltip("#fieldPopup"); //NO I18N
            }, 100);

            setTimeout(function() {
                // for checklist module there is no active field
                if (module === 'checklist' || module === 'udf_fields') { // No I18N
                    popUpData.center().fadeIn(100, function() {
                        jQuery(".freezeLayer").css("height", jQuery(document).height()); // No I18N
                    });

                    if(lViewOpt.insidePopup) { //SD-129744 fix
                        popUpData.position({
                            my: 'center', // No I18N
                            at: 'center', // No I18N
                            of: lViewOpt.popupContainer
                        })
                    }
                    else if (lViewOpt.adjustedHght) {
                        var udflist = jQuery('[data-id="udflist"]');
                        var scrollTp = jQuery(window).scrollTop() > udflist.position().top ? (jQuery(window).scrollTop() - udflist.position().top + 20) : 20;
                        var left = (screen.width - popUpData.width()) / 4;

                        popUpData.css({
                            'top': scrollTp + 'px',//No I18N
                            'left': left + 'px'//No I18N
                        });
                    }
                } else {
                    popUpData.slideDown(100, function() {
                        jQuery(".freezeLayer").css("height", jQuery(document).height()); // No I18N
                    }).show();
                    var direction = sdp_user.DIRECTION;
                }

                // Make the Popup Draggable
                setTimeout(function() {
                    const containment = lViewOpt.insidePopup ? lViewOpt.popupContainer : 'body';// No I18N
                    popUpData.draggable({
                        containment, //SD-129745 fix
                        handle: ".widget-header" // No I18N
                    })
                }, 1000);

                let leftDiv = jQuery("#popupLeftSec");
                let rightDiv = jQuery("#popupRightSec");
                if (leftDiv !== undefined && rightDiv !== undefined) {
                    if (leftDiv.height() > 480) {
                        rightDiv.height(leftDiv.height());
                    } else {
                        rightDiv.height(480);
                        leftDiv.height(480);
                    }
                }
                if (popupAction == 'newField' || popupAction == 'editSection') {
                    jQuery("#fieldName").trigger('focus');
                }
            }, 150);
            var _self = this;
            setTimeout(function() {
                _self.init_av_scroll(); //No I18N
                _self.initAddAllowedValues();

                _self.init_pickList_default_value_change(); //NO I18N

                if (!_self.options.override_pm) {
                    jQuery("[name='popup_radio']").prop('disabled', true); //No I18N
                }
                _self.adjustPopupHeight();
            }, 170);
            setTimeout(function() {
                // When popup is closed by clicking '.close' button, A tooltip is displayed by default when popup is opened next time.
                // To avoid it, focussing out the close button while closing the popup
                jQuery(".widget-header #digCloseBtn").trigger('blur'); // No I18N
                var optionFields = [{
                    "id": "name",//No I18N
                    "mandatory": true,//No I18N
                    "type": "string",//No I18N
                    "name": translate("sdp.common.name")//No I18N
                }];
                _self.options["optionFields"] = optionFields; //No I18N
                if(!_self.options.is_new_api) {
                    importXLS(jQuery("#fileUpload"), _self.setXLSJson, _self.options, jQuery("#qnFormLoadIcon"));
                }
            }, 200);
            setTimeout(function() {
                if (_self.options.popupType == "field") {
                    /*Field type select2*/
                    _self.defaultOptSelect2(_self.options.select2_fieldTypes, _self.options.selFieldType, jQuery('#field_types'));

                    //Loading select2 for refer field
                    _self.referFieldSelect2();

                    //Field popup key events
                    _self.field_apikey_value_change(); //input key event
                }
                if (_self.options.popupType == "section") {
                    if(jQuery(popUpData).find('input:enabled, select:enabled, textarea:enabled').length == 0) { //No I18N
                        jQuery(popUpData).find('.form-footer button').prop('disabled', true); //No I18N
                    }
                    /*Section type select2*/
                    _self.defaultOptSelect2(_self.options.sectionTypes, _self.options.section_form.sec_type, jQuery('#segment_types'));

                    //Section popup key events
                    _self.section_key_value_change(); //input key event
                }
				if(_self.options.layoutField.display_type == "date/time") {
					displayClientTime("dateField");//No I18N
				}
            }, 200);
        },
        defaultOptSelect2: function(allowedVal, selectVal, $this) {
			var allow = allowedVal;
			var sel = selectVal;
            for (var i = 0; i < allowedVal.length; i++) {
                allowedVal[i]['text'] = allowedVal[i].name;
            }
            $this.select2({
                data: allowedVal,
                dropdownCssClass: 'text-wrap' //SD-126652
            });
            if(selectVal && selectVal.name) {
                selectVal['text'] = selectVal.name;
                $this.select2('data', selectVal); //No I18N
            }
			this.allowedValSelectionformat();
        },
        referFieldSelect2: function() {
            var _self = this;
            if (_self.options.refer_field) {
                if(!_self.options.refer_field_value) {
                    _self.options.refer_field_value = {
                        id: 0,
                        name: translate('sdp.requests.fieldFormRules.selectField')
                    };
                }
                _self.defaultOptSelect2(_self.options.refer_field_options, _self.options.refer_field_value, jQuery('#refer_field_options_display'));
            }
        },
        /**
         * function is a utility function used to perform AJAX operations for managing operation
         *
         * url - specifies the URL to which the AJAX request should be made.
         * type - specifies the HTTP request type, such as "PUT" or "DELETE".
         * linfo - is an optional parameter that contains data to be sent with the request.
         * extraparam - is an optional parameter that contains additional parameters to be
         *
         * **/
        optionspotoperation: function(url, type, linfo, extraparam) {
            let ajaxurl = {
                url: url,
                type: type,
                async: false,
                cache: false,
            };
            if(linfo) {
                ajaxurl.data = sdpAjaxInputData(linfo);
            }
            if(extraparam) {
               ajaxurl = jQuery.extend({},extraparam,ajaxurl);
            }
            return sdpAjax(ajaxurl);
        },
        /**
         * function is used to handle the edit operation for a picklist option
         *
         * id (option ID), name (option name), and udfid (UDF ID).
         *
         * **/
        optioneditfn: function(id, name, udfid) {
            let _self = this;
            let parentnode = jQuery("#formfieldselect");
            parentnode.find("#editDynamicField").select2("close").select2('enable', false); //No I18N
            parentnode.find(".formpopup-dropdownaction").addClass("opac3").css("pointer-events","none"); //No I18N
            let actioninput = jQuery('[data-id=spoteditaction]');

            if(this.options.layoutField.default_value) {
                //It selects the default value for the select2 dropdown
                parentnode.find("#editDynamicField").select2("data",this.options.layoutField.default_value); //No I18N
            }
            actioninput.addClass("edit").find("input").val(name).focus();

            actioninput.find('.failure3').off('click').on('click',function() { //No I18N
                actioninput.removeClass("edit").find("input").val('');
                parentnode.find("#editDynamicField").select2('enable', true); //No I18N
                parentnode.find(".formpopup-dropdownaction").removeClass("opac3").css("pointer-events",""); //No I18N
            });
            actioninput.find('.success').off('click').on('click',function() { //No I18N
                let val = actioninput.find('input').val();
                if(val.trim() == '') {
                    return;
                }
                let info = {"options":[{"name":val,"id":id}]}; //No I18N
                let extraparam = {};
                    extraparam.success = function(res) {
                        let renderloadObj = {
                            'pickOptionrender': true, //No I18N
                        };
                        _self.udf.loadRender(_self, renderloadObj); //popup section and picklist option render
                        initTooltip('.form-group'); //No I18N
                        if(_self.options.layoutField.default_value) {
                            if(_self.options.layoutField.default_value.id == res.options.id) {
                                res.options["text"] = res.options.name;
                                _self.options.layoutField.default_value = res.options;
                                parentnode.find("#editDynamicField").select2("data",res.options);//No I18N
                            }
                        }
                        actioninput.removeClass("edit").find("input").val('');
                        parentnode.find("#editDynamicField").select2('enable', true);//No I18N
                        parentnode.find(".formpopup-dropdownaction").removeClass("opac3").css("pointer-events",""); //No I18N
                        showalert('success',translate('api.updated.success',[translate('common.option')]),'isAutoHide=true');//No I18N
                        _self.options.tablerefresh = true;
                    };
                    extraparam.error = function(res) {
                        let resmsg = res.responseJSON.response_status && res.responseJSON.response_status[0].messages;
                        if(resmsg) {
                            const fields = resmsg[0].fields;
                            if(fields.indexOf("field") != -1) {
                                showalert('failure', translate('duplicate.option.msg'), 'isAutoHide=false'); //No I18N
                            }
                        }
                    };
                _self.optionspotoperation('/api/v3/udf_fields/' + udfid + '/options','PUT',info,extraparam);//No I18N
            });
        },
        /**
         * function is responsible for handling the deletion of a picklist option
         *
         * id (option ID), name (option name), and udfid (UDF ID)
         * **/
        optiondeletefn: function(id, name, udfid, option) {
            jQuery("#editDynamicField").select2("close");//No I18N
            let _self = this;
            const msg = option.deleted ? translate('additional.field.inactiveoption.delete') : translate('sdp.admin.change.commonlistview.deleteConform',['<strong>'+e_html(name)+'</strong>']);
            const opt  = {
                title: translate('common.delete'),  //No I18N
                message: msg,
                submitbutton: translate('sdp.common.ok'),  //No I18N
                cancelbutton: translate('common.cancel'),  //No I18N
                closebutton: 'yes', //No I18N
                closeOnEscKey: 'yes' //No I18N
            };
            showconfirm(true, opt, function(s){
                if(s) {
                    let extraparam = {};
                        extraparam.success = function(res) {
                              let renderloadObj = {
                                'pickOptionrender': true, //No I18N
                            };
                            _self.udf.loadRender(_self, renderloadObj); //popup section and picklist option render
                            initTooltip('.form-group'); //No I18N
                            if(_self.options.layoutField.default_value) {
                                if(_self.options.layoutField.default_value.id == id) {
                                    delete _self.options.layoutField.default_value;
                                    jQuery("#editDynamicField").select2("data",_self.options.layoutField.default_value);//No I18N
                                }
                            }
                            showalert('success',translate('api.deleted.success',[translate('common.option')]),'isAutoHide=true');//No I18N
                            _self.options.tablerefresh = true;
                        };
                    _self.optionspotoperation('/api/v3/udf_fields/' + udfid + '/options/'+id,'DELETE',undefined,extraparam);//No I18N
                }
            //true -- showconfirm function proceed button show in 'red' color
            }, true);
        },
        /**
         * function is responsible for setting a picklist option as the default value
         *
         * e (event object), id (option ID), and udfid (UDF ID)
         *
         * **/
        optiondefaultfn: function(id, udfid, name) {
            let _self = this;
            if(_self.options.adminTemplate) {
                return;
            }
            let info = {"options":[{"default": true, "id": id, "name": name}]};//No I18N
            let extraparam = {};
                extraparam.success = function(res) {
                    res.options["text"] = res.options.name;
                    _self.options.layoutField.default_value = res.options;
                    jQuery("#editDynamicField").select2("data",res.options).select2("close");//No I18N
                    showalert('success',translate('api.updated.success',[translate('common.default.value')]),'isAutoHide=true');//No I18N
                    _self.options.tablerefresh = true;
                };
            _self.optionspotoperation('/api/v3/udf_fields/' + udfid + '/options','PUT',info,extraparam);//No I18N
        },
		allowedValSelectionformat: function() {
			if(this.options.layoutField.optionlist_selectenable || (this.options.layoutField.allowed_values && this.options.layoutField.allowed_values.length > this.options.layoutField.allowed_values_limit) || this.options.pick_hasmorerows) {
                var _self = this;
                var selectele = jQuery("#editDynamicField");
				if(this.options.layoutField.href) {
					var sc = [];
					if(_self.options.layoutField.list_info && _self.options.layoutField.list_info.search_criteria) {
						sc.push(_self.options.layoutField.list_info.search_criteria);
					}
					var li = {"search_criteria": sc};//NO I18N
					selectele.sdp_select2({
						url:[{
							url: "/api/v3"+_self.options.layoutField.href,//NO I18N
							field: _self.options.layoutField.entityname,
							list_info: li
						}],
					});
				} else if(this.options.pick_hasmorerows && this.options.layoutField.response) {
                    /***
                     * construct options into select2
                     * select2 result render add Edit/Delete/Default option added
                     * render based in deleted to strikeout or not
                     *
                     * ***/
                    let url = "/api/v3/udf_fields/"+this.options.layoutField.response.id+"/options";//No I18N
                    let list_info = { "row_count": "100","start_index": "1","sort_order": (this.options.asc_order ? "asc" : "desc")};//No I18N
                    const layoutField = this.options.layoutField;
                    const udfid = layoutField.udfid;
                    const display_type = layoutField.display_type;

                    const defaulti18n = translate("common.default");
                    const defaulttitle = translate("sdp.admin.change.setasdefault");
                    const editi18n = translate("common.edit");
                    const deletei18n = translate("common.delete");

                    const multiple = ['multi_select', 'checkbox'].includes(display_type);//No I18N
                    selectele.sdp_select2({
                        url:[{
                            url: url,
                            field: "options",//No I18N
                            list_info: list_info,
                            processResults: function(search_data, data, field) {
                                let processedResult = {
                                    id:  data.id,
                                    text: data.name || data.text,
                                    deleted: data.deleted
                                };
                                search_data.push(processedResult);
                            }
                        }],
                        allowClear: true,
                        multiple,
                        closeOnSelect: !multiple,
                        formatResult: function(res, data) {
                            const name = `${res.text}`;
                            const id = `${res.id}`;//No I18N

                            const edit = _self.options.retired_field ? '' :
                                `<span class="ml10 tc" data-id="action_btn"><span class="cspr edit-white icon-sm opt-action" data-opt-action="edit"  title="${editi18n}" rel="uitip"></span></span>`;
                            const remove = _self.options.retired_field ? '' :
                                `<span class="ml5" data-id="action_btn"><span class="cspr close-white icon-sm opt-action" data-opt-action="delete" title="${deletei18n}" rel="uitip"></span></span>`;

                            const defaultkey = (_self.options.retired_field || ((layoutField.default_value && (layoutField.default_value.id == res.id)) || (_self.options.adminTemplate || (display_type == "multi_select" || display_type == "checkbox")))) ? '' :
                                `<span data-id="delete_btn"><button class="btn btn-default btn-xs rounded3 opt-action text-overflow disp-ib" data-opt-action="set_default" data-id="delete_btn" title="${defaulttitle}" rel="uitip" mode_ellipsis="true">${defaulti18n}</button></span>`;
                            const actionwidth = ((layoutField.default_value && (layoutField.default_value.id == res.id)) || (_self.options.adminTemplate || (display_type == "multi_select" || display_type == "checkbox"))) ? "60px" : "120px"; //NO I18N
                            const actionhtml = `<span class="opt-action-grp" data-id="opt-action-grp">${(res.deleted) ? '' : defaultkey + edit }${remove}</span>`;
                            let option = `<div id="${res.id}" class="pos-rel visi-parent1 disp-flex"><span class="fw pr10 text-overflow disp-ib" title="${e_attr(name)}" rel="uitip" mode_ellipsis="true">${res.deleted ? `<del>`+e_html(name)+`</del>` : e_html(name)}</span>${actionhtml}</div>`;

                            option = jQuery(option)
                                .find('[data-id="action_btn"]').css({ 'width': '16px' }).end()//No I18N
                                .find('[data-id="delete_btn"]').css({ 'max-width': '68px' }).end()//No I18N
                                .find('[data-id="opt-action-grp"]').css('width', () => res.deleted ? 'auto' : actionwidth ).end()//No I18N
                                .off('click.af').on('click.af', '[data-opt-action]', (event) => {
                                    const action = event.target.dataset.optAction;
                                    if (action === 'edit') {
                                        $udfcommon.$udfform.optioneditfn(id, name, udfid);
                                    }
                                    else if (action === 'delete') {
                                        $udfcommon.$udfform.optiondeletefn(id, name, udfid, res);
                                    }
                                    else if (action === 'set_default') {
                                        $udfcommon.$udfform.optiondefaultfn(id, udfid, name);
                                    }
                                })
                                .uitooltip({
                                    content: function () {
                                        var element = jQuery(this);
                                        return e_html(element.attr("title")); //NO I18N
                                    },
                                    track: true,
                                    tooltipClass: "uitip" //No I18N
                                });
                            return option;
                        },
                    });
                    selectele.off('select2-clearing').on('select2-clearing', function (e) {//No I18N
                        if(_self.options.adminTemplate) {
                            return;
                        }
                        if(_self.options.layoutField.default_value) {
                            if(jQuery(this).select2("data") && jQuery(this).select2("data").id == _self.options.layoutField.default_value.id) {//No I18N
                                var info = {"options":[{"default": false, "id": _self.options.layoutField.default_value.id, "name": _self.options.layoutField.default_value.name}]};//No I18N
                                var extraparam = {};
                                    extraparam.success = function(res) {
                                        delete _self.options.layoutField.default_value
                                        showalert('success',translate('common.restored',[translate('common.default.value')]),'isAutoHide=true');//No I18N
                                        _self.options.tablerefresh = true;

                                    };
                                _self.optionspotoperation('/api/v3/udf_fields/' + udfid + '/options','PUT',info,extraparam);//No I18N
                            } else {
                                setTimeout(function() {//This function needed for select2(thirdparty component take some time to remove the selected value)
                                    selectele.select2('data', _self.options.layoutField.default_value); //No I18N
                                },100);
                            }
                        }
                    });
                    selectele.off('select2-selecting').on('select2-selecting', function (e) {//No I18N
                        var $target = jQuery(event.srcElement);
                        var trigSubField = jQuery($target).hasClass("opt-action");   //NO I18N
                        if(trigSubField) {
                            e.preventDefault();
                            //e.stopPropagation();
                        }
                    });
                    if(this.options.layoutField.default_value) {
                        this.options.layoutField.default_value["text"] = this.options.layoutField.default_value.name;
                        selectele.select2('data', this.options.layoutField.default_value); //No I18N
                    }
                } else {
					var allow = cloneJson(this.options.layoutField.allowed_values);
					var seledata = {};
					for (var i = 0; i < allow.length; i++) {
						allow[i]['text'] = allow[i].name;
						if(i==0) {
							seledata = allow[i]
						}
					}
					selectele.select2({
						data: allow,
					});
					selectele.select2('data', seledata); //No I18N
				}
			}
        },
        init_av_scroll: function() {
            let dropDownheight = 340;
            if (jQuery("#options_display").length && jQuery("#ddSearchBox").length) {
                dropDownheight = dropDownheight - 40;
            }
            if (jQuery("#dropdownSection").height() > 340) {
                dropDownheight = jQuery('.formpopup-queswrapper').height() - jQuery('.formpopup-dropdownaction').height() - jQuery('#addAllowedValuesTextBox').height() - 80;
            }
            if (this.module == 'checklist') {
                jQuery('.formpopup-dropdownsection').height(dropDownheight - 10).niceScroll({
                    horizrailenabled: false
                }); // Resize nicescroll
            } else {
                jQuery('.formpopup-dropdownsection').height(dropDownheight).niceScroll({
                    horizrailenabled: false
                }); // Resize nicescroll
            }
        },
        formpopupalign: function() {
            var popUpTop, popUpLeft;
            setTimeout(function() {
                if (jQuery('.col-fields').hasClass('active')) {
					var latesthgt = jQuery('#content-panel').offset().top; //NO I18N
                    popUpTop = parseInt(jQuery('.col-fields.active').offset().top + jQuery('.col-fields.active').outerHeight() - latesthgt) + "px"; // No I18N
                    popUpLeft = parseInt(jQuery('.col-fields.active').offset().left + 10) + "px"; // No I18N
                    if (parseInt(jQuery('.content-panel').width()) < parseInt(jQuery('[data-name=formpopup]').width()) + parseInt(popUpLeft)) {
                        var x = parseInt(popUpLeft) + parseInt(jQuery('[data-name=formpopup]').width()) - parseInt(jQuery('.content-panel').width());
                        popUpLeft = parseInt(popUpLeft) - x;
                    }
                }

                jQuery('[data-name=formpopup]').css({
                    'top': popUpTop, // No I18N
                    'left': popUpLeft // No I18N
                });
            }, 210);
        },
        adjustPopupHeight: function() {
            let fieldType = this.options.layoutField.display_type;
            var module = this.options.module;
            let leftDiv = jQuery("#popupLeftSec");
            let rightDiv = jQuery("#popupRightSec");
            jQuery(leftDiv, rightDiv).css('height', ''); //No I18N
            let leftDivHeight = leftDiv.children().height();
            leftDivHeight = leftDivHeight + 100; //for error alert message

            if (fieldType == "pick_list" || fieldType == "multi_select" || fieldType == "radio" || fieldType == "checkbox") {
                if (module != 'checklist' || fieldType == "radio") {
                    if (leftDivHeight <= 450) {
                        leftDivHeight = 450;
                    }
                } else {
                    leftDivHeight = 270;
                }
                setTimeout(function() {
                    if (module == "checklist") {
                        jQuery('.formpopup-dropdownsection').height(330).niceScroll({
                            horizrailenabled: false
                        }); // Resize nicescroll
                    } else {
                        jQuery('.formpopup-dropdownsection').niceScroll({
                            horizrailenabled: false
                        }); // Resize nicescroll
                    }
                }, 210);
				if (leftDivHeight > 530) {
					leftDivHeight = 530;
				}
            }
            if(rightDiv.children().height() > leftDivHeight) {
                leftDivHeight = rightDiv.children().height();
            }
            leftDiv.height(leftDivHeight);
            rightDiv.height(leftDivHeight);

        },
        /*Additional field popup Show End*/
        onDateChange: function(fieldId, newVal) {
            var parent = this.options.parent;
            var layoutField = this.options.layoutField;
            this.emberSet(layoutField, 'default_value', { //No I18N
                'value': newVal //No I18N
            });
            if (this.options.module != 'udf_fields') {
                parent.send('defValChange', layoutField, null); //NO I18N
            }
        },
        /*Popup header section Click/Change Events Start*/
        section_type_chng: function($this) {
            var sec_json = this.options.section_form;
            var prev_sec_type = sec_json.sec_type;
            sec_json.initial_value ? sec_json.initial_value : {};
            if(sec_json.initial_value) {
                sec_json.initial_value["singlecolumn"] = this.options.sectionTypes[0];
            }
            var parent = this.options.parent;

            var sectypesel = jQuery($this).select2('data'); //No I18N
            sec_json.sec_type = sectypesel;

            parent.send('section_type_change', sec_json); //NO I18N
        },
        //used when there is a change in disply options for checkbox / radio
        options_display_chng: function($this) {
            var layout_field = this.options.layoutField;
            var parent = this.options.parent;
            if (layout_field.display_type === 'checkbox' || layout_field.display_type === 'radio') {
                this.emberSet(layout_field, 'options_display', { "id" : jQuery($this).val() }); //No I18N
                parent.send('options_display_change', layout_field.options_display); // No I18N
            }
            this.formpopupalign();
        },
        // This action is triggered when the style properties of any individual field is changed
        field_values_chng: function(attr, prop) {
            var newField = this.options.new_field; // No I18N
            var layoutField = this.options.layoutField; // No I18N
            if (!layoutField.style_properties) {
                if (this.options.adminTemplate) {
                    this.emberSet(layoutField, 'style_properties', {}); //No I18N
                } else {
                    layoutField.style_properties = {}; // No I18N
                }
            }
            if (this.options.adminTemplate) {
                if (newField.style_properties && newField.style_properties[attr] !== undefined) {
                    this.emberSet(layoutField.style_properties, attr, newField.style_properties[attr]);
                }
                if (attr == "style_properties") { // No I18N
                    this.emberSet(layoutField, 'style_properties', prop.style_properties); //No I18N
                    this.emberSet(newField, 'style_properties', prop.style_properties); //No I18N
                }
            }
        },
        // when we change field type, some properties of old field type persists in options. this function is used to remove that
        cleanupFieldAttributes(old_field, new_field) {
            let _self = this, opt = _self.options, ref_field_types = ['pick_list', 'multi_select', 'checkbox', 'radio'];// No I18N
            if(ref_field_types.indexOf(old_field) > -1) {
                //SDP-AF-1445 - when we switch from one ref_field to another (for eg: from picklist to multiselect), allowed values needs to be retained
                if(ref_field_types.indexOf(new_field) > -1) {
                    _self.options.disableRightsec = (opt.layoutField.refer_field_value && opt.layoutField.allowed_values.length > 0) ? true : false;
                } else {
                    opt.layoutField.refer_field_value = undefined;

                    if (_self.options.adminTemplate) {
                        this.emberSet(opt.layoutField, 'allowed_values', []); //No I18N
                    }
                    else {
                        opt.layoutField.allowed_values = [];
                    }

                    _self.options.disableRightsec = false;
                    if(opt.layoutField.config && (opt.layoutField.config.entities_to_refer || opt.layoutField.config.reference_entity_allowed)) {
                        // when we switch from one ref_field to another non ref_field (for eg: from picklist to single_line), reference entity and criteria needs to be reset
                        _self.entityreferoption(opt.layoutField);
                    }
                }
            }
            else if(ref_field_types.indexOf(new_field) > -1) {
                // https://connect.zoho.com/portal/intranet/stream/105000878067951/105000884958409
                // set referfield options when we switch from non refer_field to refer_field
                if(opt.layoutField.config && (opt.layoutField.config.entities_to_refer || opt.layoutField.config.reference_entity_allowed)) {
                    _self.entityreferoption(opt.layoutField);
                }
            }
            else {
                _self.options.disableRightsec = false;
            }

            if(opt.layoutField.primary_field) {
                //when changing field type, we don't retain primary field
                jQuery('#popupLeftSec [name=mandatory]').prop('disabled', false);// No I18N
                _self.emberSet(opt.layoutField, 'primary_field', false);// No I18N
            }

            opt.layoutField.default_value && (opt.layoutField.default_value = null);

            /* min & max value persists when changing field type from Numeric to SingleLine or vice versa */
            if(new_field.max_length) delete new_field.max_length;
            if(new_field.min_length) delete new_field.min_length;
            if(new_field.fixed_length) delete new_field.fixed_length;
            /* min max value persists - ends here */
            opt.autoSelectEncryptField = false;
        },

        //when field type is changed in the popup,popup right pane should be changed
        on_field_type_change: function() { //field dropdown change event select2 //Need to verfiy all options and module also
            var popup_action = this.options.popup_action;

            if (popup_action == 'newField') {
                var isConstraintsShown = (moduleName == 'checklist') ? false : true; //No I18N
                var is_pick_list_shown = false;
                var fieldtypesel = jQuery('#field_types').select2('data'); //No I18N
                var defaultFieldType = fieldtypesel;
                var new_field = this.options.new_field;
                var layout_field = this.options.layoutField;
                var fieldTypeId = defaultFieldType.id;
                var _self = this;
                var moduleName = this.options.module;
                var display_type;

                var old_field = layout_field.display_type;

                this.cleanupFieldAttributes(old_field, fieldTypeId);

                // for checklist module rightside section is shown only for radio fields
                if (moduleName == 'checklist') {
                    layout_field.display_type = fieldTypeId;
                    var oldvalue = new_field.right_side_shown;
                    if (fieldTypeId == 'radio') {
                        Ember.setProperties(new_field, {
                            "right_side_shown": true//No I18N
                        });
                    } else {
                        Ember.setProperties(new_field, {
                            "right_side_shown": false//No I18N
                        });
                    }
                    var newvalue = new_field.right_side_shown;
                    if (oldvalue == true && newvalue == false) {
                        jQuery('.alert-dialog-ui1').addClass('single-form');
                    } else if (oldvalue == false && newvalue == true) {
                        jQuery('.alert-dialog-ui1').removeClass('single-form');
                    }
                } else if(moduleName=='space'||moduleName=='facility_service') { //No I18N
					if(fieldTypeId=="multi_line"||fieldTypeId=="decimal"||fieldTypeId=="date/time") {
						Ember.setProperties(new_field,{"right_side_shown":false}); //No I18N
					} else {
						Ember.setProperties(new_field,{"right_side_shown":true}); //No I18N
					}
				}
                //updating the new_field json
                display_type = fieldTypeId;

                var chn_option = {
                    "mline_maxlength": 250, //No I18N
                    "field_helptext_maxlength": 250, //No I18N
                    "section_helptext_maxlength": 250, //No I18N
                    "allownumbers_show": (fieldTypeId == "single_line") ? true : false, //No I18N
                    "showPIIField": this.isPIIField(display_type), //No I18N
                    "showEncryptField": this.isEncryptField(display_type), //No I18N
                    "show_display_options": (fieldTypeId == "radio" || fieldTypeId == "checkbox") ? true : false, //No I18N
                    "disable_defval": false, //No I18N
                    "max_field_length": (fieldTypeId == "single_line") ? ((layout_field.config && layout_field.config.sline_char_limit) ? parseInt(layout_field.config.sline_char_limit) : 250) : (fieldTypeId == "numeric" ? 19 : null), //No I18N
                };
                let mdl_options = {};

                if($udfHelper[moduleName].get_mdl_options) {
                    mdl_options = $udfHelper[moduleName].get_mdl_options.apply(_self, [display_type, fieldTypeId, _self.options.routeName]);
                }

                if(!jQuery.isEmptyObject(mdl_options)) {
                    chn_option = jQuery.extend({}, chn_option, mdl_options);
                }

                this.options = jQuery.extend({}, this.options, chn_option);

                //constraints field to be shown or not
                if (fieldTypeId == "pick_list" || fieldTypeId == "multi_select" || fieldTypeId == "radio" || fieldTypeId == "checkbox") { //No I18N
                    is_pick_list_shown = true;
                    isConstraintsShown = false;
                    layout_field["allowed_values_limit"] = this.options.is_new_api ? 100 : 500;
                    if(this.options.is_new_api && layout_field.get_config && layout_field.config) {//get_config api call to render the field properties
                        if(sdp_app.IS_ESMDIR) {
                            layout_field["display_type"] = fieldTypeId; //NO I18N
                        } else {
                            Ember.set(layout_field,"display_type",fieldTypeId); //NO I18N
                        }
                    }
                    setTimeout(function() {
                        _self.initAddAllowedValues();
                        _self.init_pickList_default_value_change(); //NO I18N
                        initTooltip('.form-group'); //No I18N
                    }, 150);
                    //entities_to_refer to handle
                    if(layout_field.config && (layout_field.config.entities_to_refer || layout_field.config.reference_entity_allowed)) {
                        _self.entityreferoption(layout_field);
                    }
                }


                if (fieldTypeId == "date/time") {
                    this.options['dateValue'] = null; //No I18N
                }
                this.options.new_field.isConstraintsShown = isConstraintsShown;
                this.options.new_field.is_pick_list_shown = is_pick_list_shown;
                this.options.new_field.show_display_options = this.options.show_display_options;


                if (this.options.adminTemplate) {
                    var parent = moduleName == "checklist" ? this.options.checklistController : this.options.parent;//NO I18N
                    parent.send('displayTypeChange', display_type, layout_field.id); //NO I18N
                }
                // calling checklist controller functions for checklist module 
                if (moduleName == "checklist" && this.fromChecklistEditPage == true) {
                    var checklistController = this.options.checklistController;
                    checklistController.send('displayTypeChange', display_type, layout_field.id); //No I18N
                }
                if(this.options.fieldKey) {
                    this.options['fieldKeyobj'] = this.udf.getfieldKey(fieldTypeId) + "_";
                }
                if(moduleName=='custom_modules' || (moduleName == "udf_fields" && this.options.routeName == "custom_module")){
                    var cm_options = {
                        'showPIIField': this.isPIIField(fieldTypeId, ["email","phone","date"]), //No I18N
                        'showUnique': (fieldTypeId == 'single_line') &&(moduleName!='udf_fields')? true: false, //NO I18N
                        'showPrimaryField': (fieldTypeId == 'single_line') &&(moduleName!='udf_fields') ? true: false, //NO I18N
                        'showEncryptField': (fieldTypeId == 'email' || fieldTypeId == 'phone') ? true : false, //NO I18N
                        'fieldtype_enabled': (popup_action == "updateField") ? false : true, //NO I18N
                        'requestercanEdit': false, //NO I18N
                        'requestercanView': false, //NO I18N
                        'name_disabled': false, //NO I18N
                        'descmultiHgt': false, //NO I18N
                        'fieldKey': (popup_action == 'newField') ? true : false, //NO I18N
                        'labeltofieldkeyCopy': true,  //NO I18N
                        'allownumbers_show': (fieldTypeId == "single_line") ? true : false, //NO I18N
                        'mline_maxlength': (fieldTypeId == "multi_line") ? 500 : 250, //NO I18N
                        'field_helptext_maxlength': 250, //No I18N
                        'section_helptext_maxlength': 250, //No I18N
                        'helpContent': true, //NO I18N
                        'datepickerdisable': true, //NO I18N
                        'disable_defval': (fieldTypeId == "decimal" || fieldTypeId == "date/time") ? true : false, //NO I18N
                        'disableRightsec': false, //NO I18N
                        'refer_field': (fieldTypeId == "pick_list" || fieldTypeId == "multi_select" || fieldTypeId == "radio" || fieldTypeId == "checkbox") ? true : false, //NO I18N
                        'refer_field_for': { for: 'custom_module' },// No I18N
                        'showPermissions': fieldTypeId == "boolean" || (moduleName=='udf_fields')? false : true, //NO I18N
                        'sendDefValue': true //NO I18N
                    };
                    this.options = jQuery.extend({}, this.options, cm_options);
                } else if(this.options.routeName == "associations") { //No I18N
                    this.options.showPIIField = this.isPIIField(fieldTypeId, ["email","phone","date"]); //No I18N
                }
                if(this.options.adminTemplate) {
                    Ember.setProperties(layout_field,{"display_type":display_type});//NO I18N
                } else {
                    _self.options.layoutField.display_type = display_type;
                }

                if (this.options.refer_field) {
                    var url = '/api/v3/udf_fields'; // No I18N
                    url += '/refer_field'; // No I18N
                    let coptfor = this.options.refer_field_for ? this.options.refer_field_for : {};
                    var input_data = sdpAjaxInputData(coptfor);
                    var refer_field_options = [], refer_field_value=null;
                    var fieldInfo = layout_field;
                    sdpAjax({
                        url: url,
                        async: false,
                        cache: false,
                        data: input_data,
                        success: function(res) {
                            refer_field_options.push({
                                id: 0,
                                name: translate('sdp.requests.fieldFormRules.selectField') // No I18N
                            });
                            res.refer_field.forEach( field => {
                                field.name = field.display_name;
                                refer_field_options.push(field);
                                if(fieldInfo) {
                                    if (field.id == fieldInfo.refer_field_value){
                                        refer_field_value = field;
                                    }
                                }
                            });
                        },
                        error: function() {
                        }
                    });
                    this.options.refer_field_options = refer_field_options;
                    this.options.refer_field_value = refer_field_value;
                }

                setTimeout(function() {
                    _self.adjustPopupHeight();
                    _self.referFieldSelect2();
                    _self.field_apikey_value_change(); //input key event
                }, 100);

                /*Render hbs file*/
                var renderloadObj = {
                    'sectionrender': true //No I18N
                };
                if (is_pick_list_shown) {
                    renderloadObj['pickOptionrender'] = true;
                }
                _self.udf.loadRender(_self, renderloadObj); //popup section and picklist option render//NO I18N
                initTooltip('.form-group'); //No I18N
            }
            jQuery('#fieldName').focus();
        },
        checkForNumbers: function() {
            jQuery(document).on('keypress', '.formpopup-queswrapper input[data-item=numeric],[data-item=decimal],[name=fieldmaxlength],[name=fieldminlength]', function(evt) {
                var eleVal = jQuery(this).attr('data-item');
                var isDecimal = false;
                var value = jQuery(this).val();

                if (eleVal == 'decimal') {
                    isDecimal = true;
                    if (value.length > 15) {
                        return false;
                    }
                }

                var maxNumberLength = (eleVal == 'maxlengthNumeric' && value.charAt(0) == "-") ? 19 : 18;
                if(eleVal == 'maxlengthNumeric' && value.length > maxNumberLength) {
                    return false;
                }

                if (eleVal == 'numeric' && value.length > 18) {
                    return false;
                }
                if (eleVal == 'maxlength' && value.length > 250) {
                    return false;
                }
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                var allcopyreloadpaste = ((evt.ctrlKey && charCode == 97) || (evt.ctrlKey && charCode == 114) || (evt.ctrlKey && charCode == 118) || (evt.ctrlKey && charCode == 99) || (evt.ctrlKey && charCode == 120));
                if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 82 && !allcopyreloadpaste) {
                    if (eleVal == 'maxlength' && charCode == 45) {/*skip '-1' key value in Fixed Length*/
						return false;
					}
                    if (isDecimal && charCode == 46 || charCode == 45) {
                        return true;
                    }
                    return false;
                }
                return true;
            });
        },
        /*Events*/
        allowedvalues_validation: function(layoutField, type) {
            var isvalid = true, message = "";
            var optlimit = this.setudfallowedvaluelength(layoutField);//Check and option limit(pick list, multi select, checkbox, radio) in getconfig
            var length = (type == "input_text") ? layoutField.allowed_values.length + 1 : layoutField.allowed_values.length;//No I18N
            if(optlimit < parseInt(length)) {
                message = 'apicodes.16001';//No I18N
                isvalid = false;
            }
            return {isvalid: isvalid, message: message};
        },
        addAllowedValues: function(val) {
            var layoutField = this.options.layoutField;
            var allowed_values = layoutField.allowed_values;

            var text = val || this.options.option_text;
            text = text.trim();
            var id = text + "_id"; // No I18N
            if(text.at(-1) == ",") {
                id = text.replace(',', 'comma') + "_id"; // No I18N
            }
            var _self = this;
            if(this.options.pick_hasmorerows && layoutField.udfid) {
                /**
                 * IF pick/multiselect/check/radio fields have more than 100 options then include spot option call invoked
                 *
                 ****/
                let info = {"options":[{"name": text}]};//No I18N
                let actioninput = jQuery('[data-id=spoteditaction]');//No I18N
                if(actioninput.hasClass("edit")) {//No I18N
                    jQuery(".opt-spotbtn.success").trigger("click");//No I18N
                    return;
                }
                let renderloadObj = {
                    'pickOptionrender': true, //No I18N
                };
                _self.udf.loadRender(_self, renderloadObj); //popup section and picklist option render
                let extraparam = {};
                    extraparam.success = function(res) {
                        showalert('success',translate('api.added.success',[translate('common.option')]),'isAutoHide=true');//No I18N
                        _self.options.tablerefresh = true;
                        jQuery('#addAllowedValuesTextBox').val("");//No I18N
                    };
                    _self.optionspotoperation('/api/v3/udf_fields/' + layoutField.udfid + '/options','POST',info,extraparam);//No I18N
                    return;
            }
            if(this.options.is_new_api) {
                var optionlimit = this.allowedvalues_validation(layoutField, "input_text");//No I18N
                if(!optionlimit.isvalid) {
                    showalert('failure', translate(optionlimit.message), 'isAutoHide=false'); //NO I18N
                    return
                }
            }

            //if they simply press enter
            if (text.trim().length <= 0) {
                return;
            }

            //check for the value
            var result = this.isAllowedValuesExists(allowed_values, text);
            if (result !== undefined) {
                var msg = window.translate("duplicate.option.msg"); // No I18N
                showalert('failure', msg, 'isAutoHide=false'); // No I18N
                return;
            }
            var json = {
                "id": id,//No I18N
                "name": text//No I18N
            };
            allowed_values.push(json);

            allowed_values = this.deconstructAllowedValues(allowed_values).allowed_values;

            var dup_allowed_val = this.getDuplicateJSON(allowed_values);
            if (this.options.adminTemplate) {
                this.emberSet(layoutField, 'allowed_values', dup_allowed_val); //No I18N
                this.emberSet(layoutField, 'default_value', null); //No I18N

                _self.options.option_text = ''; // No I18N
                _self.options.filter = ''; // No I18N
            } else {
                layoutField.allowed_values = dup_allowed_val;
                layoutField.default_value = null;

                _self.options.allowReordering = true; // No I18N
            }
            jQuery('#addAllowedValuesTextBox').val('');
            jQuery('[data-id=disp-opt]').removeClass('hide'); //Radio checkbox option vertical/horizontal
            setTimeout(function() {
                _self.formpopupalign(); // No I18N
                //_self.editOptionVal();
                _self.udf.loadRender(_self, {
                    'pickOptionrender': true//No I18N
                }); //picklist option render
                _self.init_pickList_default_value_change(); //No I18N
                _self.allowedValSelectionformat();
                initTooltip('.form-group'); //No I18N
            }, 60);
        },
        initAddAllowedValues: function() {
            /*Picklist right panel add value and search options events*/
            var _self = this;
            var layout_field = this.options.layoutField;
            var parentCntrlr = this.options.parent;
            jQuery('#templatePopUp #addAllowedValuesTextBox').off().on('keypress', function(event) { //picklist add option
                if (event.which == 13) {
                    _self.addAllowedValues(jQuery(this).val()); // No I18N
                    // no need to call clearSelValue for checklist module
                    if (_self.options.module != 'checklist' && _self.options.module != 'udf_fields') {
                        parentCntrlr.clearSelValue();
                    }
                }
            });
            jQuery('#templatePopUp #searchOptionList').off().on('keyup', function(event) { //picklist search option
                var searchString = jQuery(this).val();
                if (searchString === '') {
                    _self.options['allowReordering'] = true; //No I18N
                } else {
                    _self.options['allowReordering'] = false; //No I18N
                }
                var opt = jQuery('[data-id=picklistOpt]');
                opt.find("ul li:not([data-name=select-option])").each(function(index, el) {
                    if (jQuery(this).find('[name=dropdownvalue]').val().toUpperCase().indexOf(searchString.toUpperCase()) > -1) {
                        jQuery(this).show().addClass('show');
                    } else {
                        jQuery(this).hide().removeClass('show');
                    }
                });
            });
        },
        /**
         * Deconstructs the allowed values into allowed_values, all_val, del_av and returns the combined array
         * if there is only one active val, then it is marked as `disableDelete`
         * @param {Array} av - Allowed values
         * @returns {Object} - allowed_values, all_val, del_av
         */
        deconstructAllowedValues(av, _for, isUDF) {
            var allowed_values = av;
            var all_val = [], all_del_val = [];
            for(var i=0; i<allowed_values.length; i++) {
                if(allowed_values[i].deleted) {
                    all_del_val.push(allowed_values[i]);
                } else {
                    all_val.push(allowed_values[i]);
                }
                if(allowed_values[i].disableDelete) {
                    delete allowed_values[i].disableDelete;
                }
                delete allowed_values[i].tempDelete;
            }
            if(isUDF && _for !== 'payload' && all_val.length === 1) {
                all_val[0].disableDelete = true;
            }
            return {"all_val": all_val, "del_av": all_del_val, "allowed_values": all_val.concat(all_del_val)};
        },
        //default value when changed in the popup,it is updated in the layout
        init_pickList_default_value_change: function() {
            var _self = this;
            var parent = this.options.parent;
            var layout_field = this.options.layoutField;
            var new_field = this.options.new_field;

            jQuery('#dropdownSection').off().on('change', 'input[name="popup_radio"]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                var value = this.value;
                var optionId = jQuery(this).attr('data-option-id');
                var optionIndex = layout_field.allowed_values.findIndex(function(ele) {
                    return ele.id === optionId
                });
                // var optionIndex=jQuery(this).attr('data-index');
                var display_type = layout_field.display_type;
                var finalValue = (!_self.options.is_new_api && display_type == "radio") ? value : { //No I18N
                    "id": optionId, //No I18N
                    "name": value //No I18N
                };

                if (optionId == "selectOption") {
                    finalValue = null;
                }
                if (_self.options.adminTemplate) {
                    _self.emberSet(layout_field, 'default_value', finalValue); //No I18N
                } else {
                    layout_field.default_value = finalValue;
                }
                if (_self.options.module != 'udf_fields') {
                    parent.send('defValChange', layout_field, optionIndex); // No I18N
                }
            });
            setTimeout(function() {
                if (_self.options.module == 'udf_fields') {
                    if (layout_field.default_value != null) {
                        var selCheckBox = jQuery("[data-option-id='" + layout_field.default_value.id + "']");
                        if (selCheckBox !== undefined) {
                            selCheckBox.prop("checked", true); //NO I18N
                            selCheckBox.trigger('focus');
                        }
                    }
                }
                jQuery('#dropdownSection').niceScroll({
                    horizrailenabled: false
                });
                _self.editOptionVal();
                _self.init_options_sortable();
            }, 100);
        },
        editOptionVal: function() {
            var _self = this;
            setTimeout(function() {
                jQuery('#dropdownSection input[type=text]').off().on('blur', function(event) {
                    var ele = this;
                    setTimeout(function() {
                        _self.saveOptionVal(jQuery(ele), jQuery(ele).val().trim());
                    }, 50);
                })
            }, 500);
        },
        saveOptionVal: function(ele, text) {
            var eleId = ele.parents('li').attr('id'); //NO I18N
            var index = eleId.substring(eleId.indexOf("_") + 1);
            var layoutField = this.options.layoutField;
            var allowed_values = layoutField.allowed_values;
            var option = allowed_values[index];
            var parentCntrlr = this.options.parent;
            var _self = this;

            text = text.trim();
            ele.val(text);

            //If option value is empty, return to old value
            if (text == '' || text.length <= 0) {
                ele.val(option.name);
                return;
            }

            //check for the duplicate value
            var dup_allowed_val = _self.getDuplicateJSON(allowed_values);
            dup_allowed_val.splice(index, 1);
            var result = _self.isAllowedValuesExists(dup_allowed_val, text);
            if (result !== undefined) {
                var msg = window.translate("duplicate.option.msg"); // No I18N
                showalert('failure', msg, 'isAutoHide=false'); // No I18N
                if(option) {
                    _self.options['has_duplicate_option'] = true; // No I18N
                }
                return;
            } else {
                if (_self.options.adminTemplate) {
                    _self.emberSet(option, 'name', text); //No I18N
                    var optiontext;
                    if (_self.options.is_new_api) {
                        optiontext = option.id;
                    } else {
                        optiontext = text;
                    }
                    _self.emberSet(option, 'id', optiontext); //No I18N
                    _self.options['has_duplicate_option'] = false; // No I18N
                    _self.emberSet(layoutField, 'default_value', null); //No I18N
                } else {
                    option.name = text;
                    const notAllowedModules = ['udf_fields', 'release', 'space', 'facility_service', 'problem','support_group']; //NO I18N
                    if (!(notAllowedModules.includes(_self.options.module)) || _self.options.isProjectModule) {
                        option.id = text;
                    }
                    _self.options['has_duplicate_option'] = false; // No I18N
                    layoutField.default_value = null; //NO I18N
                }
                setTimeout(function() {
                    _self.init_pickList_default_value_change(); //No I18N
                }, 60);
            }
        },
        //delete selected allowed values on delete btn click
        deleteAllowedValues: function(optionId) {
            var _self = this;
            var layout_field = this.options.layoutField;
            var parent = this.options.parent;

            var allowed_values = layout_field.allowed_values;
            var dup_allowed_val = this.getDuplicateJSON(allowed_values);

            let deleted_id = [];

            if (this.options.adminTemplate) {
                const arr = this.emberGet(layout_field, 'deleted_id'); //No I18N
                if(!Array.isArray(arr)) {
                    this.emberSet(layout_field, 'deleted_id', []); //No I18N
                }
                else {
                    deleted_id = arr;
                }
            }
            else {
                deleted_id = Array.isArray(layout_field.deleted_id) ? layout_field.deleted_id : [];
            }

            var index = allowed_values.findIndex(function(ele) {
                return ele.id === optionId
            });
            const removed_val = dup_allowed_val.splice(index, 1);
            if(removed_val.length) {
                deleted_id.push(`${removed_val[0].id}`);
            }

            if (this.options.adminTemplate) {
                this.emberSet(layout_field, 'allowed_values', dup_allowed_val); //No I18N
                this.emberSet(layout_field, 'deleted_id', deleted_id); //No I18N
            } else {
                layout_field.allowed_values = dup_allowed_val; //NO I18N
                layout_field.deleted_id = deleted_id;
            }
            // clearSelValue is not needed for checklist 
            if (this.options.module != 'checklist' && this.options.module != 'udf_fields')
                parent.clearSelValue();

            setTimeout(function() {
                _self.udf.loadRender(_self, {
                    'pickOptionrender': true//No I18N
                }); //picklist option render
                _self.init_pickList_default_value_change(); //No I18N
                //_self.editOptionVal();
                initTooltip('.form-group'); //No I18N
            }, 150);
        },
        //sort allowed_values based on the sort_order chosen
        toggleProperty: function(keyName) {
            return this.options[keyName] = !this.options[keyName];
        },
        sortOptionsfn: function(element, order) {
            if(order == "desc") {
                var classname = "desc1"; // No I18N
                var title = 'picklist.options.sort.asc'; // No I18N
            } else {
                var classname = "asc"; // No I18N
                var title = 'picklist.options.sort.desc'; // No I18N
            }
            title = translate(e_attr(title));
            jQuery(element).removeClass('desc1 asc').addClass(classname).data('ui-tooltip-title', title).uitooltip({ // No I18N
                content: title
            });
            return classname == "asc" ? "desc" : "asc"; // No I18N
        },
        sortOptions_referfield: function() {
            this.options.entities_to_refer.sort_order = this.sortOptionsfn('[data-id=optToogle1] .cspr',this.options.entities_to_refer.sort_order); // No I18N
        },
        sortOptions: function() {
            var _self = this;
            let parent = this.options.parent;
            this.toggleProperty("asc_order"); // No I18N
            var isAsc = this.options.asc_order;
            var layout_field = this.options.layoutField;
            var allowed_values = this.getDuplicateJSON(layout_field.allowed_values);
            var selectedOption = 'selectOption'; //NO I18N

            if (layout_field.default_value === undefined || layout_field.default_value !== '') {
                if (layout_field.default_value) {
                    selectedOption = layout_field.default_value.name;
                }
            }

            allowed_values.sort(function(a, b) {
                var x = a.name.toUpperCase();
                var y = b.name.toUpperCase();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
            this.sortOptionsfn('[data-id=optToogle] .cspr',isAsc ? "desc" : "asc"); // No I18N
            if (!isAsc) {
                allowed_values.reverse();
            }

            var all_val = [], all_del_val = [];
            for(var i=0; i<allowed_values.length; i++) {
                if(allowed_values[i].deleted) {
                    all_del_val.push(allowed_values[i]);
                } else {
                    all_val.push(allowed_values[i]);
                }
            }
            allowed_values = all_val.concat(all_del_val);

            if (this.options.adminTemplate) {
                _self.emberSet(layout_field, 'allowed_values', allowed_values); //No I18N
            } else {
                layout_field.allowed_values = allowed_values; //NO I18N
            }
            setTimeout(function() {
                var selCheckBox = jQuery("[data-option-id='" + selectedOption + "']");
                if (selCheckBox !== undefined) {
                    selCheckBox.prop("checked", true); //NO I18N
                    selCheckBox.trigger('focus');
                }
                _self.udf.loadRender(_self, {
                    'pickOptionrender': true//No I18N
                }); //picklist option render
                _self.init_pickList_default_value_change(); //NO I18N
            }, 600);
        },
        //sortable is initialized over the pick list options
        init_options_sortable: function() {
            var _self = this;
            jQuery('.formpopup-dropdownsection ul').sortable({
                items: '> li:not([id=-select-option])', //NO I18N
                handle: ".drag1", // No I18N
                placeholder: "ui-state-highlight", //NO I18N
                start: function(e, ui) {
					if(_self.options.adminTemplate && _self.options.sortAllowedValues.length == 0) {
						_self.options.sortAllowedValues = _self.getDuplicateJSON(_self.options.layoutField.allowed_values);
					}
                    //This is to first complete the blur event of inline-edit operation
                    jQuery('#dropdownSection input[type=text]').each(function() {
                        if(this === document.activeElement) {
                            jQuery(this).blur();
                            return false; //To break the each loop
                        }
                    });
                    ui.placeholder.height(ui.item.height());
                    ui.placeholder.css('visibility', 'visible'); // No I18N
                    var start_pos = ui.item.index();
                    ui.item.data('start_pos', start_pos); // No I18N
                },
				beforeStop: function ( event, ui ){
					if(_self.options.adminTemplate && _self.options.sortAllowedValues.length != 0) {
						var layout_field = _self.options.layoutField;
                        _self.emberSet(layout_field, 'allowed_values', _self.options.sortAllowedValues); //No I18N
						_self.options.sortAllowedValues = [];
					}
				},
                update: function(e, ui) {
                    var start_pos = ui.item.data('start_pos'); // No I18N
                    var end_pos = ui.item.index();
                    _self.drag_and_drop_options(start_pos, end_pos);
                }
            });
        },

        drag_and_drop_options: function(start_pos, end_pos) {
            var _self = this;
            var parent = this.options.parent;
            var layout_field = this.options.layoutField;
            var allowed_values = this.getDuplicateJSON(layout_field.allowed_values);

            if (layout_field.display_type == "pick_list" || layout_field.display_type == "multi_select") {
                start_pos--;
                end_pos--;
                //because of the --select option
            }

            if (end_pos <= -1) {
                return;
            }

            var dragged_field = allowed_values[start_pos];
            allowed_values.splice(start_pos, 1);
            allowed_values.splice(end_pos, 0, dragged_field);
            if (this.options.adminTemplate) {
                this.emberSet(layout_field, 'allowed_values', allowed_values); //No I18N
            } else {
                layout_field.allowed_values = allowed_values; //NO I18N
            }
            // no need to call clearSelValue for checklist module
            if (this.options.module != 'checklist' && this.options.module != 'udf_fields')
                parent.clearSelValue();

            setTimeout(function() {
                _self.udf.loadRender(_self, {
                    'pickOptionrender': true//No I18N
                }); //picklist option render
                _self.init_pickList_default_value_change(); //NO I18N
                initTooltip('.form-group'); //No I18N
            }, 60);
        },
        addBulkOptions: function() {
            if(this.options.is_new_api) {
                var txt = '';
            } else {
                var txt = '';
                var layout_field = this.options.layoutField;

                if (layout_field.allowed_values.length > layout_field.allowed_values_limit) {
                    for (var a = 0, n = layout_field.allowed_values.length; n > a; a++) {
                        txt += layout_field.allowed_values[a].name + "\n";
                    }
                } else {
                    jQuery('.formpopup-dropdownvalue').find('.formpopup-dropdowncontent ul li').each(function() {
                        //used for inline edit
                        var curtxt = jQuery(this).find('input[type=text]').val(); // No I18N
                        var selectPH = window.translate('common.select.placeholder');
                        if (curtxt != undefined && curtxt != selectPH) {
                            txt = txt + curtxt + '\n'; //NO I18N
                        }
                    });
                }
            }
            jQuery('.formpopup-dropdownvalue').addClass('hide');
            setTimeout(function() {
                jQuery('.formpopup-bulkaddlist textarea.form-control').val('').trigger('focus').val(txt);
                jQuery('[data-name=field_types], [data-id=field_preview]').prop('disabled', true); //No I18N
                jQuery('.form-footer .btn[data-name=saveformpopup],.form-footer .btn[data-name=formCancel]').addClass('hide');
                jQuery('.form-footer .btn[data-name=formbulkcancel],.form-footer .btn[data-name=formbulkaddsubmit],button[name="backbtn"]').removeClass('hide');
            }, 250);
            /** additional field bulk add option animate event **/
            if(sdp_user.DIRECTION == "LTR") {
                jQuery('.formpopup-bulkaddlist').animate({
                    left : '-100%'
                }, 200);
            } else {
                jQuery('.formpopup-bulkaddlist').animate({
                    right : '-100%'
                }, 200);
            }
        },
        //add allowed values when options are added through bulk add
        saveBulkOptions: function() {
            let allowed_values = [];
            let _self = this;
            let layout_field = this.options.layoutField;
            let parent = this.options.parent;
            jQuery.each(jQuery('.formpopup-bulkaddlist textarea.form-control').val().split('\n'), function(i, line) { //NO I18N
                if (line) {
                    line = line.trim();
                    if(layout_field.config && layout_field.config.max_option_name_char_limit) {
                        line = line.substring(0,layout_field.config.max_option_name_char_limit)
                    }
                    let result = _self.isAllowedValuesExists(allowed_values, line);
                    let result1 = _self.isAllowedValuesExists(layout_field.allowed_values, line);
                    if(result || result1) {
                        showalert('failure', translate('duplicate.option.msg'), 'isAutoHide=false'); //NO I18N
                    }
                    if (line.length > 0 && result === undefined && result1 === undefined) {
                        var optionObj = {
                            "id": line + "_id",//No I18N
                            "name": line//No I18N
                        };
                        allowed_values.push(optionObj);
                    }
                }
            });
            if(_self.options.pick_hasmorerows && layout_field.udfid) {
                /**
                 * IF pick/multiselect/check/radio fields have more than 100 options then include spot option call invoked
                 *
                 ****/
                var alval = allowed_values;
                for(var i=0; i<alval.length; i++) {
                    delete alval[i].id;
                }
                var udfopt = [];
                function saveallfn(udfoption, $this, layout_fields) {
                    var info = {"options":udfoption}; //No I18N
                    var extraparam = {};
                        extraparam.success = function(res) {
                            showalert('success',translate('api.added.success',[translate('common.option')]),'isAutoHide=true');//No I18N
                            $this.options.tablerefresh = true;
                            $this.backFrombulkAddPage();
                        };
                    _self.optionspotoperation('/api/v3/udf_fields/' + layout_fields.udfid + '/options','POST',info,extraparam);//No I18N
                }
                for (var i = 0; i < alval.length; i++) {
                    if(i == 0 || (i % 100 === 0)) {
                        if(i == 0) {
                            udfopt.push(alval[i]);
                        } else {
                            operationStatus = saveallfn(udfopt, _self, layout_field);
                            udfopt = [];
                            udfopt.push(alval[i]);
                        }
                    } else {
                        udfopt.push(alval[i]);
                    }
                }
                if(udfopt.length != 0) {
                    operationStatus = saveallfn(udfopt, _self, layout_field);
                }
                var renderloadObj = {
                    'pickOptionrender': true, //No I18N
                };
                _self.udf.loadRender(_self, renderloadObj); //popup section and picklist option render

                return;
            }
            var alval = layout_field.allowed_values.concat(allowed_values);

            if(this.options.is_new_api) {
                var optlimit = this.setudfallowedvaluelength(layout_field);//Check and option limit(pick list, multi
                if(optlimit < parseInt(alval.length)) {
                    showalert('failure', translate('apicodes.16001'), 'isAutoHide=false'); //NO I18N
                    return
                }
            }
            var all_val = [], all_del_val = [];
            for(var i=0; i<alval.length; i++) {
                if(alval[i].deleted) {
                    all_del_val.push(alval[i]);
                } else {
                    all_val.push(alval[i]);
                }
            }
            alval = all_val.concat(all_del_val);

            if (_self.options.adminTemplate) {
                _self.emberSet(layout_field, 'allowed_values', alval); //No I18N
            } else {
                layout_field.allowed_values = alval;
            }
            // clearSelValue is not needed for checklist 
            if (this.options.module != 'checklist' && this.options.module != 'udf_fields')
                parent.clearSelValue();

            this.backFrombulkAddPage(); //NO I18N

            setTimeout(function() {
                _self.formpopupalign(); // No I18N
                //_self.editOptionVal();
                _self.udf.loadRender(_self, {
                    'pickOptionrender': true //No I18N
                }); //picklist option render//No I18N
                _self.init_pickList_default_value_change(); //NO I18N
                _self.allowedValSelectionformat();
                initTooltip('.form-group'); //No I18N
                jQuery('[data-id=disp-opt]').removeClass('hide'); //Radio checkbox option vertical/horizontal
            }, 10);
        },
        //callback when some xls file is chosen and json returned after xls parsing
        setXLSJson: function(xls_json, xlsSheetName, cntrl) {
            jQuery('[data-name="saveformpopup"]').prop("disabled", true); //No I18N
            this.$udfcommon.$udfimportoptions.setXLSJsonLatest(xls_json, xlsSheetName, cntrl);
        },
        cancelImport: function() {
            jQuery('[data-name="saveformpopup"]').prop("disabled", false); //No I18N
            this.options['showImportWizard'] = false; // No I18N

            this.udf.loadRender(this, {
                'sectionrender': true,//No I18N
                'pickOptionrender': true//No I18N
            }); //popup section and picklist option render
            this.init_pickList_default_value_change(); //NO I18N
            this.init_av_scroll(); //No I18N
            this.initAddAllowedValues();
        },

        //call back from import_options
        //imported xls json will be updated in the question options json
        updateImportedOptions: function(importedOptions) {
            var _self = this;
            jQuery("div[name='importSuccess']").slideDown(70);
            jQuery('[data-name="saveformpopup"]').prop("disabled", false); //No I18N
            var importNewopt = this.options.layoutField.allowed_values.concat(importedOptions);
            if (this.options.adminTemplate) {
                var layoutField = this.options.layoutField;
                this.emberSet(layoutField, 'allowed_values', importNewopt); //No I18N
                this.emberSet(this.options, 'showImportWizard', false); //No I18N
            } else {
                this.options.layoutField.allowed_values = importNewopt;
                this.options.showImportWizard = false;
            }
            setTimeout(function() {
                _self.udf.loadRender(_self, {
                    'sectionrender': true,//No I18N
                    'pickOptionrender': true//No I18N
                }); //popup section and picklist option render
                _self.init_pickList_default_value_change(); //NO I18N
                _self.init_av_scroll(); //No I18N
                _self.initAddAllowedValues();
				_self.allowedValSelectionformat();
				_self.field_apikey_value_change(); //input key event
                initTooltip('.form-group'); //No I18N
            }, 20);
        },

        field_apikey_value_change: function() { //if field api key press then stop copy content form label
            var _self1 = this;
            var _self = this.options;
            const $fldPopupForm = jQuery('#fieldPopup'), $rightSec = jQuery('#popupRightSec'), $leftSec = jQuery('#popupLeftSec');
            jQuery('#popupRightSec [name=popupDateField]').off().on('change', function(event) {
                var parent = _self.parent;
                var layoutField = _self.layoutField;
                _self1.emberSet(layoutField, 'default_value', {//No I18N
                    'value': jQuery(this).val()//No I18N
                });
                if (_self.module != 'udf_fields') {
                    parent.send('defValChange', layoutField, null); //NO I18N
                }
            });
            jQuery('#popupRightSec [name=allow_numbers_only]').off().on('change', function(event) {
                _self.allow_numbers_only = this.checked;
            });
            jQuery('#popupRightSec [name=fieldvalue]').off().on('keyup', function(event) {
                var layoutField = _self.layoutField;
                if (_self.adminTemplate) {
                    _self1.emberSet(layoutField, 'default_value', jQuery("[name=fieldvalue]").val()); //No I18N

                    var parent = _self.parent;
                    var field_type = layoutField.display_type;
                    if (field_type == 'numeric' || field_type == 'single_line' || field_type == 'decimal' || field_type == 'multi_line' || field_type == 'date/time') {
                        parent.send('defValChange', layoutField, null); //NO I18N
                    }
                } else {
                    layoutField.default_value = jQuery(this).val();
                }
            });

            const handleMinMaxChange = (event) => {
                const $field = jQuery(event.target), type = $field.data('for');

                _self.new_field['' + type + '_length'] = $field.val();
                if(type === 'max') _self.new_field.fixed_length = $field.val();

                if (_self.adminTemplate) {
                    let layoutField = _self.layoutField;
                    let constraints = _self1.emberGet(layoutField, 'constraints');//NO I18N
                    if(!constraints) {
                        constraints = jQuery.isEmptyObject(constraints) ? constraints : {};

                        const display_type = $field.data('display-type');//NO I18N
                        const $parent = $field.closest('#divMinMax'),
                                $minField = $parent.find('[name="fieldminlength"]'),
                                $maxField = $parent.find('[name="fieldmaxlength"]');
                        let obj = display_type == 'numeric' ? //NO I18N
                                    {min: $minField.val(), max: $maxField.val()} :
                                    {min_length: $minField.val(), max_length: $maxField.val()};

                        constraints = jQuery.extend( {}, constraints, obj );
                    }
                    _self1.emberSet(layoutField, 'constraints', constraints);//NO I18N
                }
            }

            jQuery('#popupRightSec [name=fieldminlength]').off().on('change', handleMinMaxChange);
            jQuery('#popupRightSec [name=fieldmaxlength]').off().on('change', handleMinMaxChange);

            jQuery('#popupLeftSec #fieldName').off().on('keyup', function(event) {
                var labelval = jQuery(this).val();
                var layoutField = _self.layoutField;
                if (_self.adminTemplate) {
                    _self1.emberSet(layoutField, 'label', labelval); //No I18N
                } else {
                    layoutField.label = labelval;
                }
                var copylabel = _self.labeltofieldkeyCopy;
                var reg = new RegExp('^[a-zA-Z0-9]'); // regex to check if a string contains only alphanumeric characters & underscore
                var laststr = layoutField.label.substr(layoutField.label.length - 1);
                var firststr = layoutField.label.charAt(0); 

                if(reg.test(laststr) == false) { //if last char is not an accepted char then remove it
                    labelval = labelval.slice(0,-1);
                }

                if(reg.test(firststr) == false) { //SD-111456 fix => if first char of 'API Field Name' is not an accepted char then remove it
                    labelval = labelval.slice(1);
                }

                if (copylabel) { //Check if field key input keypres event trigger or not / label value check last character in string in regular expression
                    var fkey = labelval.replace(/[^A-Z0-9]+/ig, "_").toLowerCase();
                    if(fkey.substr(fkey.length - 1) == "_") { // if last char is underscore then remove it
                        fkey = fkey.slice(0, -1);
                    }

                    if (_self.adminTemplate) {
                        _self1.emberSet(layoutField, 'fieldKey', fkey); //No I18N
                    } else {
                        layoutField.fieldKey = fkey;
                    }
                    jQuery('#popupLeftSec #fieldKey').val(layoutField.fieldKey);
                }
            });
            jQuery('#popupLeftSec #fieldKey').off().on('keyup', function(event) {
                _self['labeltofieldkeyCopy'] = false; //No I18N

                var labelval = jQuery(this).val();
                var layoutField = _self.layoutField;
                var fkey = labelval.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()
                if (_self.adminTemplate) {
                    _self1.emberSet(layoutField, 'fieldKey', fkey); //No I18N
                } else {
                    layoutField.fieldKey = fkey;
                }
                jQuery('#popupLeftSec #fieldKey').val(layoutField.fieldKey);

            });
            jQuery('#popupLeftSec #refer_field_options_display').off().on('change', function(event) {
                var fieldVal = jQuery(this).val();
                var layoutField = _self.layoutField;
                if (_self.adminTemplate) {
                    _self1.emberSet(layoutField, 'refer_field_value', fieldVal); //No I18N
                } else {
                    layoutField.refer_field_value = fieldVal;
                }
                if(fieldVal!=0){
			        sdpAjax({
						url: '/api/v3/udf_fields/'+fieldVal+'/options', // No I18N
						async: false,
						cache: false,
						//data: input_data,
						success: function(res) {
							if (_self.adminTemplate) {
                                _self1.emberSet(layoutField, 'allowed_values', res.options); //No I18N
							} else {
								layoutField.allowed_values = res.options;
							}
						},
						error: function() {}
					});
                }else{
                	if (_self.adminTemplate) {
                        _self1.emberSet(layoutField, 'allowed_values', []); //No I18N
                	} else {
                		layoutField.allowed_values = [];
                	}
                }
            });
            //Need to verfiy all options and module also
            jQuery('#popupLeftSec [name=description]').off().on('keyup', function(event) {
                var desc = jQuery(this).val();
                var layout_field = _self.layoutField;
                var new_field = _self.new_field;
                if (_self.adminTemplate) {
                    var copyDescContent = _self.copyDescContent;
                    _self1.emberSet(new_field, 'description', desc); //No I18N

                    if (copyDescContent) {
                        //var desc=new_field.description;
                        if (desc && desc.length > 0) {
                            _self1.emberSet(layout_field, 'help_text', desc); //No I18N
                            _self1.emberSet(new_field, 'help_text', desc); //No I18N
                            var e_helptext = e_html(desc).replace(/\r\n|\r|\n/g, "<br>"); //NO I18N
                            _self1.emberSet(layout_field, 'e_help_text', e_helptext); //No I18N
                            _self1.emberSet(new_field, 'e_help_text', e_helptext); //No I18N

                            jQuery('#popupLeftSec [name=helptext]').val(desc);
                        }
                    }
                } else {
                    layout_field.description = desc;
                    new_field.description = desc;
                }
            });
            jQuery('#popupLeftSec [name=copyHelpText]').off().on('change', function(event) {
                if (_self.adminTemplate) {
                    _self.copyDescContent = this.checked;

                    var layout_field = _self.layoutField;
                    var new_field = _self.new_field;
                    var isCopyDesc = _self.copyDescContent;
                    var desc = new_field.description;

                    if (isCopyDesc) {
                        _self1.emberSet(layout_field, 'help_text', desc); //No I18N
                        _self1.emberSet(new_field, 'help_text', desc); //No I18N
                        var e_helptext = e_html(desc).replace(/\r\n|\r|\n/g, "<br>"); //NO I18N
                        _self1.emberSet(layout_field, 'e_help_text', e_helptext); //No I18N
                        _self1.emberSet(new_field, 'e_help_text', e_helptext); //No I18N

                        jQuery('#popupLeftSec [name=helptext]').val(desc);
                    } else {
                        _self1.emberSet(layout_field, 'help_text', ''); //No I18N
                        _self1.emberSet(new_field, 'help_text', ''); //No I18N
                        _self1.emberSet(layout_field, 'e_help_text', ''); //No I18N
                        _self1.emberSet(new_field, 'e_help_text', ''); //No I18N

                        jQuery('#popupLeftSec [name=helptext]').val('');
                    }
                }
            });
            jQuery('#popupLeftSec [name=helptext]').off().on('keyup', function(event) {
                var desc = jQuery(this).val();
                var layout_field = _self.layoutField;
                var new_field = _self.new_field;
                if (_self.adminTemplate) {
                    _self1.emberSet(layout_field, 'help_text', desc); //No I18N
                    _self1.emberSet(new_field, 'help_text', desc); //No I18N

                    var e_helptext = e_html(desc).replace(/\r\n|\r|\n/g, "<br>"); //NO I18N
                    _self1.emberSet(layout_field, 'e_help_text', e_helptext); //No I18N
                    _self1.emberSet(new_field, 'e_help_text', e_helptext); //No I18N
                } else {
                    layout_field.description = desc;
                    new_field.description = desc;
                }
            });

            jQuery('#popupLeftSec [name=isPII]').off().on('change', function(event) {
				var piival = jQuery("input[name='isPII']").is(':checked');//NO I18N
				if(_self.autoSelectEncryptField) {
					if(piival && jQuery("input[name='encrypt_field']").is(':visible')) {
						jQuery("input[name='encrypt_field']").prop('checked', true);//NO I18N
						_self['encrypt_field'] = true;
					}
				}
                _self['isPII'] = piival; //No I18N
            });
            jQuery('#popupLeftSec [name=encrypt_field]').off().on('change', function(event) {
                _self['encrypt_field'] = jQuery("input[name='encrypt_field']").is(':checked'); //No I18N
            });

            jQuery('#popupLeftSec [name=requester_can_view]').off().on('change', function(event) {
                var layout_field = _self.layoutField;
                layout_field.requester_can_view = jQuery("input[name='requester_can_view']").is(':checked'); //No I18N
                var requester_can_view = layout_field.requester_can_view;

                if (layout_field != null && !requester_can_view) {
                    _self1.emberSet(layout_field, 'requester_can_edit', false); //No I18N
                    layout_field.requester_can_edit = false;
                    jQuery("input[name='requester_can_edit']").prop('checked', false); //No I18N
                }
            });
            jQuery('#popupLeftSec [name=requester_can_edit]').off().on('change', function(event) {
                var layout_field = _self.layoutField;
                _self1.emberSet(layout_field, 'requester_can_edit', jQuery("input[name='requester_can_edit']").is(':checked')); //No I18N

                //var requester_can_edit=layout_field.requester_can_edit;
                var requester_can_edit = jQuery("input[name='requester_can_edit']").is(':checked'); //No I18N
                var override_pm = _self.override_pm;

                if (layout_field != null && requester_can_edit) {
                    if (!override_pm && layout_field.id == 'priority') {
                        showalert('failure', translate('sdp.admin.requesttemplate.prioritymatrix.constraint.message'), 'isAutoHide=false,delay=10'); //NO I18N
                        _self1.emberSet(layout_field, 'requester_can_edit', false); //No I18N
                        jQuery("input[name='requester_can_edit']").prop("checked", false); //No I18N
                        return;
                    }
                    _self1.emberSet(layout_field, 'requester_can_view', true); //No I18N
                    layout_field.requester_can_view = true;
                    jQuery("input[name='requester_can_view']").prop('checked', true); //No I18N
                }
            });

            jQuery('#popupLeftSec [name=common_field]').off().on('change', function(event) {
                var layout_field = _self.layoutField;
                _self1.emberSet(layout_field, 'is_common', jQuery("input[name='common_field']").is(':checked')); //No I18N
                layout_field.is_common = jQuery("input[name='common_field']").is(':checked'); //No I18N
            });

            jQuery('#popupLeftSec [name=s_common_field]').off().on('change', function(event) {
                var new_field = _self.new_field;
                 _self1.emberSet(new_field, 's_common_field', jQuery("input[name='s_common_field']").is(':checked')); //No I18N
                new_field.s_common_field = jQuery("input[name='s_common_field']").is(':checked'); //No I18N
            });
            
            jQuery('#popupLeftSec [name=mandatory]').off().on('change', function(event) {
                var layout_field = _self.layoutField;
                let ischecked = jQuery("input[name='mandatory']").is(':checked');//No I18N
                _self1.emberSet(layout_field, 'mandatory', ischecked); //No I18N
                if(!ischecked){
                	$('#popupLeftSec [name=primary_field]').prop('checked', false);
                }
                if(_self.controller){
                    _self1.emberSet(_self.controller, 'isFormChanged', true); //No I18N
                }
                var override_pm = _self.override_pm;
                if (!override_pm) {
                    if (layout_field.mandatory && layout_field.id == 'priority') {
                        showalert('failure', translate('sdp.admin.requesttemplate.prioritymatrix.constraint.message'), 'isAutoHide=false,delay=10'); //NO I18N
                        _self1.emberSet(layout_field, 'mandatory', false); //No I18N
                        jQuery("input[name='mandatory']").prop("checked", false); //No I18N
                        return;
                    }
                }
            });

            jQuery('#popupLeftSec [name=unique]').off().on('change', function(event) {
                var layout_field = _self.layoutField;
                _self1.emberSet(layout_field, 'unique', jQuery("input[name='unique']").is(':checked')); //No I18N
                if(_self.controller){
                    _self1.emberSet(_self.controller, 'isFormChanged', true); //No I18N
                }
            });

            jQuery('#popupLeftSec [name=primary_field]').off().on('change', function(event) {
                var prifield = jQuery("input[name='primary_field']").is(':checked'); //No I18N
                function submitfn() {
                    if(prifield){
                        jQuery('#popupLeftSec [name=mandatory]').prop('checked', true).prop('disabled', true); //No I18N
                    }
                    else {
                        jQuery('#popupLeftSec [name=mandatory]').prop('disabled', false); //No I18N
                    }
                    _self1.emberSet(layout_field, 'primary_field', prifield); //No I18N
                    _self1.emberSet(layout_field, 'partial_field', prifield); //No I18N
                    _self1.emberSet(layout_field, 'mandatory', jQuery("input[name='mandatory']").is(':checked')); //No I18N
                    if(_self.controller){
                        _self1.emberSet(_self.controller, 'isFormChanged', true); //No I18N
                    }
                }
                var layout_field = _self.layoutField;
                if(_self.controller.model.primary_field == layout_field.id)  {
                    submitfn();
                } else {
                    if(prifield) {
                        showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + translate("additional.primary.field.confirm.msg") + ', submitbutton=' + translate("common.proceed") + ', cancelbutton=' + translate("common.cancel") + ', closebutton=yes, closeOnEscKey=yes', function(s){ //No I18N
                                if(s) {
                                    submitfn();
                                } else {
                                    jQuery('#popupLeftSec [name=primary_field]').prop('checked', false); //No I18N
                                }

                        });
                    } else {
                        submitfn();
                    }
                }
            });

			if(sdp_app.IS_ESMDIR && this.options.routeName == "user") {// No I18N
				//ESM Directory form validation
				jQuery("#fieldPopup").validate({// No I18N
						rules: {
							fieldName: {
								required: true
							}
						},
						messages: {
							fieldName: {
								required: translate("sdp.admin.additionalfields.fieldname.emptyerrmessage")// No I18N
							}
						},
						errorClass: 'text-danger', //NO I18N
						errorElement: 'span', // No I18N
						focusInvalid: true,
						errorPlacement: function (error, element) {
							var position = element.position();
							error.insertAfter(element);
							error.addClass('alert alert-danger alert-arrow p5 mt20').css({'position': 'absolute', 'z-index': '1', 'top': element.outerHeight() + 5, 'display': 'block', 'width': 'auto', 'left': 'auto', 'white-space': 'nowrap'}); //NO I18N
						}
					})
				}

                jQuery('#popupRightSec [name=default_value_decision]').off().on('change', function(event) {
                    var new_field = _self.new_field;
                    var layout_field = _self.layoutField;
                    let checkboxprop = jQuery(this).is(':checked'); //No I18N
                    if (_self.adminTemplate) {
                        var selCheckBox = jQuery(".col-fields.active.selected [data-item=boolean]");
                        !selCheckBox.length && (selCheckBox = jQuery(`[data-field-id="${layout_field.id}"]`).find('[data-item=boolean]'));
                        const parent = _self.parent;
                        if (selCheckBox !== undefined) {
                            selCheckBox.prop("checked", checkboxprop); //NO I18N
                            selCheckBox.trigger('focus');
                        }
                        _self1.emberSet(new_field, 'default_value', checkboxprop); //No I18N
                        _self1.emberSet(layout_field, 'default_value', checkboxprop); //No I18N

                        parent.send('defValChange', layout_field, null); //NO I18N
                    }
                    else {
                        new_field.default_value = checkboxprop;
                        layout_field.default_value = checkboxprop;
                    }
                });
                jQuery('#popupRightSec [name=default_value_date]').off().on('change', function(event) {
                    var new_field = _self.new_field;
                    var layout_field = _self.layoutField;
                    let checkboxprop = jQuery(this).is(':checked'); //No I18N
                    var def = checkboxprop ? "$(created_time)" : null;
                    if(typeof Ember != 'undefined') {
                        _self1.emberSet(new_field, 'default_value', def); //No I18N
                    }
                    new_field.default_value = def;
                    layout_field.default_value = def;
                });

                $rightSec.find('#dateField_Display').siblings('span').off('click.af').on('click.af', () => {
                    window.initCalendar('dateField', null, null, null, null, null, null, null, null, null, null);
                });

                $leftSec.find('input[dataid=pickListreferenceentity]').off('click.af').on('click.af', (evt) => {
                    _self1.referEntityEnable(evt.target);
                });
                $leftSec.find('#refer_field_options_display').off('change.af').on('change.af', (evt) => {
                    _self1.refer_field_change(evt.target);
                });
                
                const $import = jQuery('#import-screen');
                $import.find('#import').off('click.af').on('click.af', () => $udfcommon.$udfimportoptions.importOptions()); //No I18N
                $import.find('#cancelClick').off('click.af').on('click.af', () => $udfcommon.$udfimportoptions.cancelImport()); //No I18N
                $import.find('#sheetNo').off('change.af').on('change.af', (evt) => $udfcommon.$udfimportoptions.onSheetsChange(evt.target)); //No I18N

        },
        section_key_value_change: function() { //section addObserver key events
            var _self = this;
            const $fldPopupForm = jQuery('#fieldPopup');
            jQuery('.formpopup-segement #fieldName').off().on('keyup', function(event) {
                var sec_json = _self.options.section_form;
                _self.emberSet(sec_json, 'name', jQuery(this).val()); //No I18N
                var parent = _self.options.parent;
                parent.send('updateSection', sec_json, 'name'); //NO I18N
            });
            // Api_Name is only supported in Custom Module Sub forms.
            jQuery('.formpopup-segement [name=apiname]').off('keyup.apiname').on('keyup.apiname', function(event) {//No I18N
                var labelval = jQuery(this).val();
                var fkey = labelval.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()
                var sec_json = _self.options.section_form;
                _self.emberSet(sec_json, 'api_name', fkey); //No I18N
                var parent = _self.options.parent;
                parent.send('updateSection', sec_json, 'api_name'); //NO I18N
                jQuery('.formpopup-segement [name=apiname]').val(fkey);
            });

            // Max Records is only supported in Custom Module Sub forms.
            jQuery('.formpopup-segement [name=maxrecords]').off().on('change', function(event) {
                var sec_json = _self.options.section_form;
                Ember.set(sec_json, 'max_records', jQuery(this).val()); //No I18N
                var parent = _self.options.parent;
                parent.send('updateSection', sec_json, 'max_records'); //NO I18N
            });
            jQuery('.formpopup-segement [name=helptext]').off().on('keyup', function(event) {
                var sec_json = _self.options.section_form;
                _self.emberSet(sec_json, 'help_text', jQuery(this).val()); //No I18N
                var parent = _self.options.parent;
                parent.send('updateSection', sec_json, 'help_text'); //NO I18N
            });
            // Display Mode is only supported in Custom Module Sub forms.
            jQuery('.formpopup-segement [name=formformat]').off().on('change', function(event) {
                var sec_json = _self.options.section_form;
                Ember.set(sec_json, 'form_type', jQuery(this).val()); //No I18N
                var parent = _self.options.parent;
                parent.send('updateSection', sec_json, 'form_type'); //NO I18N
            });
            $fldPopupForm.find('#section_tabs > li').off('click.af').on('click.af', (evt) => {
                const $this = jQuery(evt.target), tabName = $this.data('tab-name') || $this.closest('li').data('tab-name');
                _self.changeTab(tabName);
            });
        },
        refer_criteria_events(isLayout) {
            const _self = this;
            if(isLayout) {
                const $baseDiv = jQuery('#criteria-layout');
                $baseDiv.find('#refer_entity').off('change.af').on('change.af', (evt) => { _self.changeReferentity(evt.target);});
                $baseDiv.find('#referEntAdd').off('click.af').on('click.af', _self.referEntityAddCriteria.bind(_self));
                $baseDiv.find('#referEntEdit').off('click.af').on('click.af', _self.referEntityEditCriteria.bind(_self));
                $baseDiv.find('#referEntDelete').off('click.af').on('click.af', _self.referEntityDeleteCriteria.bind(_self));
            }
            else {
                const $baseDiv = jQuery('#refer_criteria');
                $baseDiv.find('#digCloseBtn').off('click.af').on('click.af', _self.closePopUp.bind(_self));
                $baseDiv.find('[data-name="formSave"]').off('click.af').on('click.af', _self.saveCriteriaSection.bind(_self));
                $baseDiv.find('[data-name="formCancel"]').off('click.af').on('click.af', _self.closeCriteriaSection);
                $baseDiv.find('button[data-name="backbtn"]').off('click.af').on('click.af', _self.closeCriteriaSection.bind(_self));//No I18N
            }
        },
        importfromservlet: function() {
            var _self = this;
            var id = this.options.layoutField.udfid;
            var input_object = {"list_info": {"row_count" : "100"}}//NO I18N
            sdpAjax({
                url: '/api/v3/udf_fields/'+id+'/options', // No I18N
                async: false,
                cache: false,
                data:sdpAjaxInputData(input_object),
                success: function(resp) {
                    var layout_field = _self.options.layoutField;
                    if (_self.options.adminTemplate) {
                        _self.emberSet(layout_field, 'allowed_values', resp.options); //No I18N
                        _self.emberSet(layout_field.initial_value, 'allowed_values', resp.options); //No I18N
                    } else {
                        layout_field.allowed_values = resp.options;
                        layout_field.initial_value.allowed_values = resp.options;
                    }
                    if(resp.list_info.has_more_rows) {
                        _self.options.pick_hasmorerows = true;
                    }
                    _self.udf.loadRender(_self, {
                        'sectionrender': true, //No I18N
                        'pickOptionrender': true//No I18N
                    });
                    showalert("success",translate("api.added.success",[translate("common.options")]),"isAutoHide=true");//No I18N
                }
            });
        },
        importfromapi: function(ele, data, targetEle) {//not used right, maybe used in feature change api format in import
            var formData,files,_self=this,fileName;
            jQuery(ele).off().on('change', function(){
                formData=new FormData();
                files=jQuery(this)[0].files;
                if(files.length>0){
                    var id = data.layoutField.udfid;
                    fileName=files[0].name;
                    formData.append("input_file",files[0],fileName);
                    formData.append(getCSRFParamName(),getCSRFParamValue());
                    sdpAjax({
                        url: "/api/v3/udf_fields/"+id+"/options/upload?for=import",//NO I18N
                        type: "POST", // No I18N
                        async: false,
                        cache: false,
                        dataType: "json", // NO I18N
                        contentType: false,
                        data: formData,
                        processData: false,
                        success: function(res) {
                            var inputData = sdpAjaxInputData({"attachment_id": res.attachment.id}); // No I18N

                            sdpAjax({
                                url: '/api/v3/udf_fields/'+id+'/options/import', // No I18N
                                type: "POST", // No I18N
                                data: inputData,
                                async: false,
                                cache: false,
                                ignorefailuremessage: true,
                                success: function(response) {

                                    /** after import upload option in right panel **/
                                    var input_object = {"list_info": {"row_count" : "100"}}//NO I18N
                                    sdpAjax({
                                        url: '/api/v3/udf_fields/'+id+'/options', // No I18N
                                        async: false,
                                        cache: false,
                                        data:sdpAjaxInputData(input_object),
                                        success: function(resp) {
                                            var layout_field = _self.options.layoutField;
                                            if (_self.options.adminTemplate) {
                                                Ember.set(layout_field, 'allowed_values', resp.options); //NO I18N
                                                Ember.set(layout_field.initial_value, 'allowed_values', resp.options); //NO I18N
                                            } else {
                                                layout_field.allowed_values = resp.options;
                                                layout_field.initial_value.allowed_values = resp.options;
                                            }
                                            _self.udf.loadRender(_self, {
                                                'pickOptionrender': true//No I18N
                                            });
                                            showalert("success",translate("api.added.success",[translate("common.options")]),"isAutoHide=true");//No I18N
                                        }
                                    });
                                },
                                error: function(resp) {
                                    showalert("failure",translate("apicodes.16001"),"isAutoHide=false");//No I18N
                                }
                            });
                        },
                        error: function(resp) {
                            showalert("failure",translate("apicodes.16001"),"isAutoHide=false");//No I18N
                        }
                    });
                }
            });
        },
        hbskeyevents: function(data) {
            var _self = this;
            if(!this.options.is_new_api) {
                importXLS(jQuery("#fileUpload"), _self.setXLSJson, data, jQuery("#qnFormLoadIcon"));
            }
            setTimeout(function() {
                _self.init_av_scroll(); //No I18N
                _self.initAddAllowedValues();
                if (_self.options.module != 'checklist') {
                    _self.init_pickList_default_value_change(); //NO I18N
                }
                if (_self.options.popupType == "field") {
                    _self.adjustPopupHeight();
                    _self.referFieldSelect2();
                    _self.field_apikey_value_change(); //input key event
                }
                if (_self.options.popupType == "section") {
                    _self.section_key_value_change(); //input key event
                }
            }, 200);
        },
        /*Popup footer section Save, Update, Cancel Events*/
        popUpValid: function(element, rules) { //Popup Form validation
            var defaults = {
                errorClass: 'text-danger', //NO I18N
                errorElement: 'span', // No I18N
                focusInvalid: false,
                ignore: '.formpopup-dropdownvalue', // No I18N
                // to ignore validation in picklist/multiselect options
                onkeyup: function(element) {
                    jQuery(element).valid();
                },
                onchange: function(element) {
                    this.element(element); //To trigger change event once validation is initialized to form.
                },
                errorPlacement: $udfcommon.$udfform.errorPlacementCB,
                success: function(label, element) {
                    jQuery(label).remove();
                },
                invalidHandler: function(form, validator) { //https://connect.zoho.com/portal/intranet/stream/105001043240269/105001051937364 => To focus on error field
                    validator.numberOfInvalids() && (validator.errorList[0].element.focus())
                },
            };

            let options = {};
            if(jQuery(element).data('inline-validation')) {
                if(!jQuery.isEmptyObject(rules)) {
                    options = rules;
                }
            }
            element.validate(jQuery.extend( {}, defaults, options ));
        },
        errorPlacementCB: function(error, element) {
            if (!error.text()) {
                return;
            }
            var styleClass = element.attr('data-errorClass');
            var position = element.position();
            var isSelect2Input = element.data('select2-input'); //No I18N
            if ((element.prop("tagName") === "SELECT" || element.prop("tagName") === "INPUT") && element.data("select2")) { //No I18N
                element = element.siblings(".select2-container"); //No I18N
            }
            if (styleClass == undefined) {
                styleClass = '';
            }
            error.insertAfter(element);
            var classname = (element.hasClass("error-msg-small")) ? "alert-danger p3 pl10 pr10 font-xsmall left0" : "alert alert-danger " + (element.hasClass('error-msg-noarrow') ? '' : 'alert-arrow') + " p5 "+styleClass; //No I18N

            var cssstyle = {
                'position': 'absolute', //No I18N
                'z-index': '1', //No I18N
                'top': isSelect2Input ? element.outerHeight() + element.innerHeight() : element.outerHeight() + 3, //No I18N
                'display': 'block', //No I18N
                'width': 'auto', //No I18N
                'left': 'auto', //No I18N
                'white-space': 'nowrap' //No I18N
            }
            if (element.hasClass("error-msg-nowrap")) {
                delete cssstyle['white-space']; //No I18N
            }
            if (element.hasClass("error-msg-small")) {
                element.parent().css("position", "relative"); //No I18N
            }
            error.addClass(classname).css(cssstyle);
        },
        duplicateValuesCheck: function(options) {
            var unique_values = {};
            for (i = 0; i < options.length; i++) {
				//SD-97580: Case insensitive duplicate validation done
                if (!unique_values[(options[i].id).toLowerCase()]) {
                    unique_values[(options[i].id).toLowerCase()] = true;
                } else {
                    var msg = window.translate("common.repeated.option.names"); // No I18N
                    showalert('failure', msg, 'isAutoHide=false'); // No I18N
                    return false;
                }
            }
        },
        parentCall: function(module, layout_field, operation) {
            var parent = this.options.parent;
            operation = operation.toUpperCase();
            if (['request', 'release', 'space', 'facility_service', 'problem', 'custom_modules','asset_asset','cmdb', 'customize_ag_form', 'support_group'].includes(module) || this.options.isProjectModule) {
                if (operation == 'POST') {
                    parent.send('afterNFAddition', layout_field); // No I18N
                }
            } else if (module === "asset_asset" || module == "cmdb") { // No I18N
                parent.send('afterNFAddition', layout_field); // No I18N
            }
            // for checklist module based on the page from which popup is opened we have to send update to parent controller
            if (module == "checklist" && operation == "POST") {
                if (this.options.fromChecklistEditPage == true) {
                    var checklistController = this.options.checklistController;
                    checklistController.send('afterNFAddition', layout_field); //No I18N
                } else {
                    var checklistitemController = this.options.checklistitemController;
                    var table_info = table_comp.getTableInfo(checklistitemController.get('personalize_key')); // No I18N 
                    checklistitemController.send('showListView', table_info); //No I18N
                }
            }
        },
        //additional fields
        addOrUpdateFields: function(operation) {//Old format udf field save function(Incident, Service, Checklist
            // json construction is different for checklist module 
            if (this.options.module == 'checklist') {
                var newF = this.options.new_field;
                var helpT = newF.description;
                if(this.options.adminTemplate) {
                    helpT = newF.description ? newF.description : newF.help_text;
                }
                var layout_field = this.options.layoutField;
                var field_type = layout_field.display_type;
                var input_json = {
                    "additional_fields": { //NO I18N
                        "module": "checklist", //NO I18N
                        "name": layout_field.label, //NO I18N
                        "field_type": field_type, //NO I18N
                        "description": helpT //NO I18N
                    }
                };
                if (field_type == "radio") {
                    input_json.additional_fields.allowed_values = this.deconstructAllowedValues(layout_field.allowed_values, 'payload').allowed_values; //NO I18N
                    if (layout_field.allowed_values == null || layout_field.allowed_values.length == 0) {
                        let msg = window.translate("dropdown.options.specify.warning");
                        showalert('failure', msg, 'isAutoHide=false'); //NO I18N
                        return;
                    }
                }
            } else {
                var _self = this,
                    sub_module = null;
                var new_field = this.options.new_field;
                var layout_field = this.options.layoutField;

                var default_value = layout_field.default_value;
                var field_type = layout_field.display_type;
                var isPII = this.options.isPII;
                var encrypt_field = this.options.encrypt_field;

                var is_common = layout_field.is_common;
                var fixed_length = new_field.fixed_length;
                var allow_numbers_only = this.options.allow_numbers_only;
                var s_common_field = new_field.s_common_field;

                var isServTemplate = this.options.isServiceTemplate;
                var moduleId = this.options.moduleId;
                var description = new_field.description;

                if (!is_common) {
                    sub_module = (isServTemplate) ? "Service" : "Incident"; // No I18N
                }

                if (description) {
                    description = description.trim();
                }

                if (!this.isValidDefValue(field_type, default_value, fixed_length)) {
                    return;
                }

                if (field_type == "single_line" || field_type == "numeric") {
                    if (default_value) {
                        if (fixed_length !== undefined && fixed_length !== '' && default_value.length > 0 && default_value.length != parseInt(fixed_length)) {
                            let warning = window.translate('predefined.value.fixed.length.check.msg');
                            showalert('failure', warning, 'isAutoHide=false'); //NO I18N
                            return;
                        }
                    }
                }

                if (field_type == "pick_list" || field_type == "checkbox" || field_type == "radio" || field_type == "multi_select") {
                    if (layout_field.allowed_values.length === 0) {
                        let msg = window.translate("dropdown.options.specify.warning");
                        showalert('failure', msg, 'isAutoHide=false'); //NO I18N
                        return;
                    }
                }

                var input_json = {
                    "additional_fields": { //NO I18N
                        "module": "request", //NO I18N
                        "sub_module": sub_module, //NO I18N
                        "name": layout_field.label, //NO I18N
                        "description": description, //NO I18N
                        "field_type": field_type //NO I18N
                    }
                };

                if (isServTemplate && !s_common_field) {
                    input_json.additional_fields.service_category = {
                        "id": moduleId //No I18N
                    };
                }

                //fixed_length
                if (field_type === "single_line" || field_type === "numeric") {
                    if (fixed_length !== '' && fixed_length !== undefined) {
                        var constraints = {
                            "fixed_length": fixed_length //No I18N
                        };
                        input_json.additional_fields.constraints = constraints;
                    }
                    //allow_numbers_only
                    if (field_type === "single_line" && allow_numbers_only) {
                        if (constraints !== undefined) {
                            input_json.additional_fields.constraints.allow_numbers_only = allow_numbers_only;
                        } else {
                            var constraints = {
                                "allow_numbers_only": allow_numbers_only //No I18N
                            };
                            input_json.additional_fields.constraints = constraints;
                        }
                    }
                }

                //default_value
                if (field_type == "single_line" || field_type == "multi_line" || field_type == 'pick_list' || field_type == 'radio') {
                    if (default_value) {
                        if (typeof(default_value) == "object") {
                            default_value = default_value.name;
                        }
                        default_value = default_value.trim();
                        if (default_value !== '') {
                            input_json.additional_fields.default_value = default_value;
                        }
                    }
                }

                //allowed_values
                if (field_type == 'pick_list' || field_type == "multi_select" || field_type == "radio" || field_type == "checkbox") {
                    input_json.additional_fields.allowed_values = layout_field.allowed_values;
                    if (this.duplicateValuesCheck(input_json.additional_fields.allowed_values) === false) {
                        return;
                    };
                }

                if (isPII) {
                    input_json.additional_fields.isPII = isPII;
                }
                if (encrypt_field) {
                    input_json.additional_fields.encrypt_field = encrypt_field;
                }

                if (field_type === 'date/time' && default_value === undefined) {
                    layout_field.default_value = {
                        'value': 0 //No I18N
                    };
                }

                if (field_type == 'multi_line') {
                    let height = jQuery("input[name='heightfield']").val();
                    if (height == undefined || height == "" || height == null) {
                        height = 40;
                        jQuery("input[name='heightfield']").val(height);
                    }
                    layout_field.height = height; // No I18N
                }
            }
            this.udfAPICall(input_json, operation, layout_field, this.options.module);
        },
        udfAPICall: function(input_json, operation, layout_field, moduleName) {
			var inputData = sdpAjaxInputData(input_json);
            var message, type, _self = this;
            sdpAjax({
                url: '/api/v3/additional_fields', // No I18N
                type: operation,
                data: inputData,
                async: false,
                cache: false,
                success: function(res) {
                    type = res.response_status.status;
                    message = res.response_status.messages[0].message;
                    if (type == "success") {
                        if (_self.options.adminTemplate) {
                            Ember.set(layout_field, 'id', res.additional_field.api_key); // No I18N
                            // need udf_field id for adding that field to checklist
                            Ember.set(layout_field, 'udfid', res.additional_field.id); // No I18N
                        } else {
							layout_field.id = res.additional_field.api_key; // No I18N
							layout_field.udfid = res.additional_field.id; // No I18N
						}
                        showalert("success", e_html(message), ''); // No I18N
                        _self.hidePopUp(); // No I18N
                        _self.parentCall(moduleName, layout_field, operation); // No I18N
                    } else {
                        showalert("failure", e_html(message), 'isAutoHide=false'); // No I18N
                        return;
                    }
                },
                error: function(resp) {
                    //this is for failure msg raised by security.xml
                    message = resp.responseJSON.response_status.messages[0].message;
                    showalert("failure", e_html(message), 'isAutoHide=false'); //NO I18N
                }
            });
        },
        updateChecklistUDF: function(field) { // to update checklist of UDF incase of any changes
            var allowed_values = field.allowed_values;
            var fieldId = field.id;
            var checklistitemController = this.options.checklistitemController;
            var checklistController = this.options.checklistController;
            var fromChecklistEditPage = this.options.fromChecklistEditPage;
            var udfId = fieldId.substring(fieldId.lastIndexOf("_") + 1);
            var newF = this.options.new_field;
            var helpT = newF.description;
            if(this.options.adminTemplate) {
                helpT = newF.description ? newF.description : newF.help_text;
            }
            var input_json = {
                "additional_fields": { //No I18N
                    "module": "checklist", //No I18N
                    "name": field.label, //No I18N
                    "field_type": field.display_type, //No I18N
                    "description": helpT //No I18N
                }
            };
            if (field.display_type == 'radio') {
                if (field.allowed_values.length === 0) {
                    let msg = window.translate("dropdown.options.specify.warning");
                    showalert('failure', msg, 'isAutoHide=false'); //NO I18N
                    return;
                } else {
                    input_json.additional_fields.allowed_values = allowed_values;
                }
            }
            var _self = this;
            var url = '/api/v3/additional_fields/' + udfId; // No I18N
            var input_data = sdpAjaxInputData(input_json);
            sdpAjax({
                url: url,
                type: 'PUT', //No I18N
                data: input_data,
                success: function(res) {
                    var message = res.response_status.messages[0].message;
                    var status = res.response_status.status;
                    jQuery('[data-name="saveformpopup"]').text(window.translate("common.save")).prop("disabled", false); //No I18N
                    if (status != "success") {
                        showalert("failure", message, 'isAutoHide=false,delay=30'); // No I18N
                    } else if (status == "success") { //No I18N
                        if (fromChecklistEditPage) {
                            checklistController.send('fieldUpdate', field); //No I18N
                        } else {
                            var table_info = table_comp.getTableInfo(checklistitemController.get('personalize_key')); // No I18N 
                            checklistitemController.send('showListView', table_info); //No I18N
                        }
                        _self.hidePopUp(); // No I18N
                    }
                },
                error: function(resp) {
                    var message = resp.responseJSON.response_status.messages[0].message;
                    showalert("failure", message, 'isAutoHide=false'); //NO I18N
                    jQuery('[data-name="saveformpopup"]').text(window.translate("common.save")).prop("disabled", false); //No I18N
                },
            });
        },
        updateUDFAllowedValues: function(field) { // update allowed values of UDF field in case of changes
            var module = this.options.module;
            var parent = this.options.parent;
            var allowed_values = field.allowed_values;
            var fieldId = field.id;
            var udfId = fieldId.substring(fieldId.lastIndexOf("_") + 1);
            var input_json = {
                "additional_fields": { //No I18N
                    "module": "request", //No I18N
                    "name": field.label, //No I18N
                    "field_type": field.display_type, //No I18N
                    "allowed_values": allowed_values //No I18N
                }
            };
            var _self = this;
            var url = '/api/v3/additional_fields/' + udfId; // No I18N
            var iscommon = field.is_common;

            if (!iscommon) {
                input_json.additional_fields.sub_module = module;
            }

			var input_data = sdpAjaxInputData(input_json);

            sdpAjax({
                url: url,
                type: 'PUT', //No I18N
                data: input_data,
                success: function(res) {
                    var message = res.response_status.messages[0].message;
                    var status = res.response_status.status;
                    jQuery('[data-name="saveformpopup"]').text(window.translate("common.save")).prop("disabled", false); // No I18N
                    if (status != "success") {
                        showalert("failure", e_html(message), 'isAutoHide=false,delay=30'); // No I18N
                    } else if (status == "success") { //No I18N
                        parent.send('fieldUpdate', field); // No I18N
                        _self.hidePopUp(); // No I18N
                    }
                },
                error: function(resp) {
                    var message = resp.responseJSON.response_status.messages[0].message;
                    showalert("failure", e_html(message), 'isAutoHide=false'); //NO I18N
                    jQuery('[data-name="saveformpopup"]').text(window.translate("common.save")).prop("disabled", false); //No I18N
                }
            });
        },
        updateFields: function() { // common function to update field properties
            var parent = this.options.parent;
            var field = this.options.layoutField;
            var fieldId = field.id;
            var default_value = field.default_value;
            var field_type = field.display_type;
            var isUdf = (fieldId.indexOf("udf") != -1) ? true : false; //NO I18N

            if (!this.isValidDefValue(field_type, default_value, 0)) {
                return;
            }

            //get the value of height field
            if (fieldId == 'description' || field_type == 'multi_line') {
                var height = jQuery("[name='heightfield']").val();
                if (height == undefined || height == "" || height == null) {
                    if (field.height == undefined || field.height == "" || field.height == null) {
                        if (field_type == 'multi_line') {
                            Ember.set(field, 'height', 40); // No I18N
                        } else {
                            Ember.set(field, 'height', 250); // No I18N
                        }
                    }
                    height = field.height;
                    jQuery("[name='heightfield']").val(height);
                }
                if (field.height != height) {
                    Ember.set(field, 'heightChanged', true); // No I18N
                }
                Ember.set(field, 'height', height); // No I18N
            }

            if (isUdf && (field_type == "pick_list" || field_type == "checkbox" || field_type == "radio" || field_type == "multi_select")) {
                if (field.allowed_values.length === 0) {
                    let msg = window.translate("dropdown.options.specify.warning");
                    showalert('failure', msg, 'isAutoHide=false'); //NO I18N
                    return;
                }
                if (this.options.has_duplicate_option === true) {
                    var msg = window.translate("duplicate.option.msg"); // No I18N
                    showalert('failure', msg, 'isAutoHide=false'); // No I18N
                    return;
                }
                if (this.duplicateValuesCheck(field.allowed_values) === false) {
                    return;
                };
                jQuery('[data-name="saveformpopup"]').text(window.translate("sdp.admin.common.saving")).prop("disabled", true); // No I18N
                if (this.options.has_duplicate_option === false) {
                    this.updateUDFAllowedValues(field); //NO I18N
                }
            } else {
                parent.send('fieldUpdate', field); // No I18N
                this.hidePopUp(); // No I18N
            }
        },
        //udf filds add new event
        isvalid_single_line: function(options, input_json) {//Need to verfiy all options and module also
            var isvalid = true;
            var min_length = parseInt(options.new_field.hasOwnProperty('min_length') ? options.new_field.min_length : ((options.layout_field.response && options.layout_field.response.additional_attributes) ? options.layout_field.response.additional_attributes['min-len'] : ""));
            var max_length = parseInt(options.new_field.hasOwnProperty('max_length') ? options.new_field.max_length : ((options.layout_field.response && options.layout_field.response.additional_attributes) ? options.layout_field.response.additional_attributes['max-len'] : ""));
            var max_lengthlimit = options.layout_field.config && options.layout_field.config.sline_char_limit ? parseInt(options.layout_field.config.sline_char_limit) : 250;

            if(input_json) {
                if(!input_json.udf_field.additional_attributes) {
                    input_json.udf_field["additional_attributes"] = {};
                }
                input_json.udf_field.additional_attributes = {
                    "min-len": min_length ? min_length : -1, // NO I18N
                    "max-len": max_length ? max_length : -1 // NO I18N
                };
                //allow_numbers_only
                input_json.udf_field.only_numeric = options.allow_numbers_only;
                if(options.layout_field!=null && options.layout_field.unique) {
                    input_json.udf_field.additional_attributes.unique=true
                }
                if(options.layout_field!=null && options.layout_field.partial_field) {
                    input_json.udf_field.additional_attributes.partial_field=true
                }

                if (options.default_value) {
                    if (typeof(options.default_value) == "object") {
                        default_value = options.default_value.name;
                    }
                    default_value = options.default_value.trim();
                    if (default_value !== '') {
                        input_json.udf_field.default_value = options.default_value;
                    }
                }
                isvalid = input_json;
            } else {//i18n need to add
                var validMinLength = (min_length !== undefined && min_length !== '' && isNaN(min_length) == false) ? true : false;
                var validMaxLength = (max_length !== undefined && max_length !== '' && isNaN(max_length) == false) ? true : false;
                if (validMinLength) {
                    if (min_length > max_lengthlimit) {
                        showalert('failure', translate('form.digits.minimumlength.alert',[max_lengthlimit]), 'isAutoHide=false'); //NO I18N
                        return false;
                    }
                }
                if (validMaxLength) {
                    if (max_length > max_lengthlimit) {
                        showalert('failure', translate('form.digits.maximumlength.alert',[max_lengthlimit]), 'isAutoHide=false'); //NO I18N
                        return false;
                    }
                }
                if ((validMinLength) && (validMaxLength)) {
                    if(min_length > max_length) {
                        showalert('failure', translate('additional.field.range.greater'), 'isAutoHide=false'); //NO I18N
                        return false;
                    }
                }
                if (options.default_value) {
                    const defaultValLen = options.default_value.length, bothEqual = (validMinLength && validMaxLength) && (min_length == max_length);
                    if (validMinLength && !bothEqual) {
                        if(defaultValLen > 0 && defaultValLen < min_length) {
                            showalert('failure', translate('common.value.lessthan.min',[translate('common.default.value')]), 'isAutoHide=false'); //NO I18N
                            return false;
                        }
                    }
                    if (validMaxLength && !bothEqual) {
                        if(defaultValLen > 0 && defaultValLen > max_length) {
                            showalert('failure', translate('common.value.greaterthan.max',[translate('common.default.value')]), 'isAutoHide=false'); //NO I18N
                            return false;
                        }
                    }
                    if((validMinLength && validMaxLength) && (validMinLength == validMaxLength) && (defaultValLen < min_length) || (defaultValLen > max_length)) {
                        var len = validMinLength ? min_length : max_length;
                        showalert('failure', translate('additional.field.default.range.equals', [len]), 'isAutoHide=false'); //NO I18N
                        return false;
                    }
                }

                if (options.allow_numbers_only) {
                    //Allow number only Check box checked same time default value have string
                    var msgKey = "common.numeric.value.error.msg"; //NO I18N
                    var rules_msg = window.translate(msgKey, [window.translate("common.predefined.value")]);
                    var rulescon = "^[0-9]*$";
                    var rules = new RegExp(rulescon);
                    if (options.default_value != null) {
                        var matchList = options.default_value.match(rules);
                        if (matchList == null || matchList[0] != options.default_value) {
                            showalert('failure', rules_msg, 'isAutoHide=false'); //NO I18N
                            isvalid = false;
                        }
                    }
                }
            }
            return isvalid;
        },
        isvalid_numeric: function(options, input_json) {
            var isvalid = true;
            var min_length = options.new_field.hasOwnProperty('min_length') ? options.new_field.min_length : ((options.layout_field.response && options.layout_field.response.additional_attributes) ? options.layout_field.response.additional_attributes['min-len'] : "");
            var max_length = options.new_field.hasOwnProperty('max_length') ? options.new_field.max_length : ((options.layout_field.response && options.layout_field.response.additional_attributes) ? options.layout_field.response.additional_attributes['max-len'] : "");

            if(input_json) {
                if(!input_json.udf_field.additional_attributes) {
                    input_json.udf_field["additional_attributes"] = {};
                }
                var numrange = (min_length || min_length == 0 ? min_length : '') + ":" + (max_length ? max_length : '');
                if(numrange == ":") {
                    numrange = null
                }
                input_json.udf_field.additional_attributes = {
                    "num_range": numrange // NO I18N
                };
                if (options.default_value) {
                    if (typeof(options.default_value) == "object") {
                        default_value = options.default_value.name;
                    }
                    default_value = options.default_value.trim();
                    if (default_value !== '') {
                        input_json.udf_field.default_value = options.default_value;
                    }
                }
                isvalid = input_json;
            } else {//i18n need to add
                var validMinLength = (min_length !== undefined && min_length !== '') ? true : false;
                var validMaxLength = (max_length !== undefined && max_length !== '') ? true : false;
                var isMinPositive = validMinLength ? !(min_length.charAt(0) == "-") : true;
                var isMaxPositive = validMinLength ? !(max_length.charAt(0) == "-") : true;
                var defVal = options.default_value;

                min_length = BigInt(min_length); // convert to big int for comparison
                max_length = BigInt(max_length);

                if (validMinLength) {
                    if (min_length.toString().length > (isMinPositive ? 19 : 20)) {
                        showalert('failure', translate('form.digits.minimumlength.alert',['19']), 'isAutoHide=false'); //NO I18N
                        isvalid = false;
                    }
                }
                if (validMaxLength) {
                    if (max_length.length > (isMaxPositive ? 19 : 20)) {
                        showalert('failure', translate('form.digits.maximumlength.alert',['19']), 'isAutoHide=false'); //NO I18N
                        isvalid = false;
                    }
                }

                if ((validMinLength) && (validMaxLength)) {
                    if(min_length >= max_length) {
                        var errKey = (min_length == max_length) ? 'additional.field.range.invalid' : 'additional.field.range.greater'; //NO I18N
                        showalert('failure', translate(errKey), 'isAutoHide=false'); //NO I18N
                        isvalid = false;
                    }
                }

                if (isvalid && defVal) {
                    var pattern = /^(|-?\d+)$/, validDefValue = false, isDefPositive;
                    if(pattern.test(defVal) === false) {
                        showalert('failure', translate('common.numeric.value.error.msg', [translate('common.default.value')]), 'isAutoHide=true'); //NO I18N
                        isvalid = false;
                    } else {
                        validDefValue = true;
                        isDefPositive = validDefValue ? !(defVal.charAt(0) == "-") : true;

                        if(validDefValue) {
                            if(String(defVal).length > (isDefPositive ? 19 : 20)) {
                                showalert('failure', translate('additional.default.value.alert', ['19']), 'isAutoHide=false'); //NO I18N
                                isvalid = false;
                            } else {
                                defVal = BigInt(defVal);
                            }
                        }
                    }
                    if (validMinLength) {
                        if(defVal < min_length) {
                            showalert('failure', translate('form.defaultvalue.minimumvalue.alert',[min_length]), 'isAutoHide=false'); //NO I18N
                            isvalid = false;
                        }
                    }
                    if (validMaxLength) {
                        if(defVal > max_length) {
                            showalert('failure', translate('form.defaultvalue.maximumvalue.alert',[max_length]), 'isAutoHide=false'); //NO I18N
                            isvalid = false;
                        }
                    }
                }
            }
            return isvalid;
        },
        isvalid_multi_line: function(options, input_json) {
            var isvalid = true;
            if(input_json) {
                if (options.default_value) {
                    if (typeof(options.default_value) == "object") {
                        default_value = options.default_value.name;
                    }
                    default_value = options.default_value.trim();
                    if (options.default_value !== '') {
                        input_json.udf_field.default_value = options.default_value;
                    }
                }

                let height = jQuery("input[name='heightfield']").val();
                if (height == undefined || height == "" || height == null) {
                    height = 40;
                    jQuery("input[name='heightfield']").val(height);
                }
                var layout_field = this.options.layoutField;
                if(options.moduleName=="space" || options.moduleName=="custom_modules" || options.moduleName == 'request') {
                    this.emberSet(layout_field, 'height', height); //No I18N
                } else {
                    layout_field.height = height;
                }

                isvalid = input_json;
            }
            return isvalid;
        },
        isvalid_decimal: function(options, input_json) {
            var isvalid = true;
            if(input_json) {
                delete input_json.udf_field.default_value;
                if(jQuery('[name="decimal_digit"]')) {
                    if(!input_json.udf_field.additional_attributes) {
                        input_json.udf_field["additional_attributes"] = {};
                    }
                    input_json.udf_field.additional_attributes = {
                        "precision": jQuery('[name="decimal_digit"]').val() // No I18N
                    };
                }
                isvalid = input_json;
            }
            return isvalid;
        },
        isvalid_date: function(options, input_json) {
            var isvalid = true;
            if(input_json) {
                delete input_json.udf_field.default_value;
                if (options.hasOwnProperty('new_field') && options.new_field.hasOwnProperty('default_value')) {
                    input_json.udf_field["default_value"] = options.new_field.default_value;
                }
                isvalid = input_json;
            }
            return isvalid;
        },
        isvalid_boolean: function(options, input_json) {
            var isvalid = true;
            if(input_json) {
                if (options.hasOwnProperty('new_field') && options.new_field.hasOwnProperty('default_value')) {
                    input_json.udf_field["default_value"] = options.new_field.default_value;
                }
                isvalid = input_json;
            }
            return isvalid;
        },
        isvalid_attachment: function(options, input_json) {
            var isvalid = true;
            if(input_json) {
                delete input_json.udf_field.default_value;
                isvalid = input_json;
            }
            return isvalid;
        },
        isvalid_email: function(options, input_json) {
            var isvalid = true;
            if(input_json) {
                delete input_json.udf_field.default_value;
                isvalid = input_json;
            }
            return isvalid;
        },
        isvalid_url: function(options, input_json) {
            var isvalid = true;
            if(input_json) {
                delete input_json.udf_field.default_value;
                isvalid = input_json;
            }
            return isvalid;
        },
        isvalid_phone: function(options, input_json) {
            var isvalid = true;
            if(input_json) {
                delete input_json.udf_field.default_value;
                isvalid = input_json;
            }
            return isvalid;
        },
        isvalid_percentage: function(options, input_json) {
            var isvalid = true;
            if(input_json) {
                delete input_json.udf_field.default_value;
                isvalid = input_json;
            }
            return isvalid;
        },
        isvalid_html: function(options, input_json) {
            var isvalid = true;
            const layout_field = options.layout_field;
            if(input_json) {
                delete input_json.udf_field.default_value;
                isvalid = input_json;
            }
            const hgtfield = jQuery("input[name='heightfield']");//No I18N
            if(hgtfield.length != 0) {
                //get the value of height field
                let height = hgtfield.val();
                if (height == undefined || height == "" || height == null) {
                    height = 247;
                    hgtfield.val(height);
                }
                let modename = ["request", "custom_modules"];//No I18N
                if (modename.includes(options.moduleName)) {
                    this.emberSet(layout_field, 'height', height); //No I18N
                } else {
                    layout_field.height = height;
                }
                layout_field.heightChanged = true;
            }
            return isvalid;
        },
        isvalid_pick_list: function(options, input_json) {
            var isvalid = true;
            if(input_json) {
                if (options.layout_field.allowed_values) {
                    var alval = [];
                    for (var i = 0; i < options.layout_field.allowed_values.length; i++) {
                        if(options.layout_field.allowed_values[i].deleted) {
                            delete options.layout_field.allowed_values[i];
                        } else {
                            if(options.layout_field.allowed_values[i].deleted != undefined) {
                                delete options.layout_field.allowed_values[i].deleted;
                            }
                            if ((options.layout_field.allowed_values[i].id != undefined && typeof options.layout_field.allowed_values[i].id != 'number') && options.layout_field.allowed_values[i].id.indexOf('_id') != -1) {
                                delete options.layout_field.allowed_values[i].id;
                            }
                            if (options.default_value != null) {
                                var defname = options.default_value.name;
                                if (defname == options.layout_field.allowed_values[i].name) {
                                    options.layout_field.allowed_values[i].default = true;
                                }
                            }
                            alval.push(options.layout_field.allowed_values[i]);
                        }
                    }
                    if(this.options.adminTemplate) {
                        this.emberSet(options.layout_field, 'allowed_values', alval); //No I18N
                    } else {
                        options.layout_field.allowed_values = alval;
                    }
                }
                if(jQuery('input[name=popup_radio]:checked').data('option-id') === 'selectOption') { //SD-127413 fix
                    input_json.udf_field.default_value = null;
                }
                if(this.options.entities_to_refer && this.options.entities_to_refer.is_enabled) {
                    delete input_json.udf_field.refer_field;
                    input_json.udf_field.default_value = null; //Default value null always
                    var cri = this.getCriteriadata(this.options.entities_to_refer.criteria.data,"save");//NO I18N
                    var datacri = this.options.entities_to_refer.criteria.data.length > 0 ? this.options.entities_to_refer.criteria : [];
                    input_json.udf_field.criteria = datacri.length == 0 
                                                                ? [] 
                                                                : this.criteriaWithId(datacri.data); //SD-120024 fix => To send criteria as array of string instead of array of objects
                    if(!this.options.entities_to_refer.value.name) {
                        var refer = jQuery("#refer_entity").select2("data");//NO I18N
                        this.options.entities_to_refer.value = refer;
                    }
                    input_json.udf_field.reference_entity = { "name": this.options.entities_to_refer.value.name };//NO I18N
                    input_json.udf_field.fk_constraint = "restrict";//NO I18N
                    input_json.udf_field.additional_attributes = { "sort_order" : this.options.entities_to_refer.sort_order || "asc" };//NO I18N
                }
                isvalid = input_json;
            } else {
                var isUdf = (options.moduleName == "udf_fields" || options.layout_field.udfid != undefined || options.moduleName == "custom_modules") ? true : false; //NO I18N
                if (isUdf || (this.options.entities_to_refer && this.options.entities_to_refer.is_enabled)) {
                    var allowedval = this.options.optionlist_selectenable;
                    var referFieldVal = options.layout_field.refer_field_value;
                    var skiprefer_entity = false;
                    if(this.options.entities_to_refer && this.options.entities_to_refer.is_enabled) {
                        skiprefer_entity = this.options.entities_to_refer.is_enabled;
                        if(jQuery("#refer_entity").length != 0 && jQuery("#refer_entity").select2("data")) {
                            var refer = jQuery("#refer_entity").select2("data");//NO I18N
                            this.options.entities_to_refer.value = refer;
                        }
                        if(this.options.entities_to_refer.value.length == 0) {
                            showalert('failure', translate('additional.reference.select'), 'isAutoHide=false'); //NO I18N
                            isvalid = false;
                            return;
                        }
                    }
                    if (!allowedval && (referFieldVal==undefined || referFieldVal==0) && !skiprefer_entity) {
                        if(options.layout_field.allowed_values.length !== 0) {
                            var optionlimit = this.allowedvalues_validation(options.layout_field);
                            if(!optionlimit.isvalid) {
                                showalert('failure', translate(optionlimit.message), 'isAutoHide=false'); //NO I18N
                                return
                            }
                        }
                    }
                }
            }
            return isvalid;
        },
        formvalidfn: function(options, input_json) { // To validate given field satisfy all conditions
            var isvalid = true;
            if(input_json) {
                if(jQuery('[name=isPII]').length == 0) {
                    delete input_json.udf_field.is_pii;
                }
                if(jQuery('[name=encrypt_field]').length == 0) {
                    delete input_json.udf_field.is_encrypted;
                }
            }
            if(options.field_type == "pick_list" || options.field_type == "checkbox" || options.field_type == "radio" || options.field_type == "multi_select") {
                isvalid = this.isvalid_pick_list(options, input_json);
            } else {
                if(options.field_type == "date/time") {
                    isvalid = this.isvalid_date(options, input_json);
                }
                else if(options.field_type == "rich_text_area") {//NO I18N
                    isvalid = this.isvalid_html(options, input_json);
                }
                else if(this["isvalid_"+options.field_type] && typeof this["isvalid_"+options.field_type] == "function" ) {
                    isvalid = this["isvalid_"+options.field_type](options, input_json);
                }
            }
            return isvalid;
        },
        addOrUpdateUDFFields: function(operation) {//Need to verfiy all options and module also
            var new_field = this.options.new_field;
            var layout_field = this.options.layoutField;
            var moduleName = this.options.module;

            var default_value = layout_field.default_value;
            var field_type = layout_field.display_type;

            var fixed_length = new_field.fixed_length;
            var allow_numbers_only = this.options.allow_numbers_only;

            var description = new_field.description || layout_field.description;
            if (description) {
                description = description.trim();
            }

            const selectRoute = this.udf.options.selectRoute;

            var field_options = {
                "new_field": new_field,//NO I18N
                "layout_field": layout_field,//NO I18N
                "moduleName": moduleName,//NO I18N
                "default_value": default_value,//NO I18N
                "field_type": field_type,//NO I18N
                "fixed_length": fixed_length,//NO I18N
                "allow_numbers_only": allow_numbers_only//NO I18N
            };
            if(!this.formvalidfn(field_options)) {
                return;
            }

            var isUdf = (moduleName == "udf_fields" || layout_field.udfid != undefined || moduleName == "custom_modules" || operation == "POST") ? true : false; //NO I18N

            if(isUdf && field_type == "color" && operation == 'POST' && this.udf.options.selectRoute.id !== "associations"){
                var fields=this.options.controller && this.options.controller.fieldDetails || [];
            	for(let field in fields){
            		if(fields[field].id &&  fields[field].id!="new_field"&& fields[field].display_type && fields[field].display_type=='color' && field.indexOf(".") == -1){
            			let msg = window.translate("custom.color.field");
            			showalert('failure', msg, 'isAutoHide=false'); //NO I18N
            			return;
            		}
            	}
            }

            var input_json_allowedvalues = {};
            layout_field.label = layout_field.label.trim();
            var input_json = {
                "udf_field": { //NO I18N
                    "display_name": layout_field.label, //NO I18N
                    "description": description, //NO I18N
                    "default_value": default_value, //NO I18N
                    "additional_attributes":{} //NO I18N
                }
            };
            const udf_field = input_json.udf_field;
            if(this.options.layout_field!=null && this.options.layout_field.partial_field) {
               input_json.udf_field.additional_attributes.partial_field=true
            }
            if (field_type == "decimal" || field_type == "checkbox" || field_type == "multi_select" || field_type == "color" || field_type == "pick_list" || field_type == "radio") {
                delete input_json.udf_field.default_value;
            }
            if (operation == 'POST') {
                var new_field_type = this.udf.newFieldType(field_type, 'post'); //field type// No I18N
                if(this.options.fieldKey) {//107600 -- some module skip name field option post call
                    var labelname = layout_field.fieldKey;
                    input_json.udf_field['name'] = labelname;
                }
                var opt = this.udf.options.selectRoute;
				var c_name = opt.entity_id && !isEmpty(opt.entity_id) ? opt.entity_id : opt.id
				input_json.udf_field[opt.type] = {
					"name": c_name //No I18N
				};
                
				if((this.options.routeName == "user" && !sdp_app.IS_MDH_SETUP) || sdp_app.IS_ESMDIR || this.options.routeName == "department") {
					if(input_json.udf_field.module.name!="department"){
					if(sdp_app.IS_SCP && this.options.routeName=="account"){
						input_json.udf_field[opt.type] = {
						"name": "account" //No I18N
					};
					}
					else{
					input_json.udf_field[opt.type] = {
						"name": "orguser" //No I18N
					};
					}
				}
				}
                if (opt.submodule) {
					input_json.udf_field[opt.type] = {
						"name": opt.selectsubmodule.id //No I18N
					};
                    //input_json.udf_field['field_group'] = opt.selectsubmodule.id;
                }
                if(this.options.routeName === "asset_asset" || moduleName === "asset_asset"){
                    input_json.udf_field[opt.type] = {
                        "name": "asset" //No I18N
                    }
                }
                if(moduleName === "cmdb") {
                    input_json.udf_field[opt.type] = {
                        "name": "cmdb" //No I18N
                    }
                }
                input_json.udf_field['field_type'] = new_field_type;
                input_json.udf_field['is_encrypted'] = jQuery('[name=encrypt_field]').prop('checked'); //No I18N
            }
            if(operation == 'PUT' && this.options.routeName == "department"){
                var opt = this.udf.options.selectRoute;
                input_json.udf_field[opt.type] = {
                    "name": opt.id //No I18N
                };
            }
            if(operation == 'PUT' && (moduleName == "custom_modules" || (moduleName == "request" ||this.options.routeName == "request"))) {
            	var opt = this.udf.options.selectRoute;
            	var c_name = opt.entity_id && !isEmpty(opt.entity_id) ? opt.entity_id : opt.id
            	input_json.udf_field[opt.type] = {
            	   "name": c_name //No I18N
            	};
            }else if(operation == 'PUT' && (this.udf.options.selectRoute.id == "custom_module" || this.udf.options.selectRoute.id === "associations")){
                var c_name = this.udf.options.selectRoute.entity_id;
                input_json.udf_field[this.udf.options.selectRoute.type] = {
                    "name": c_name //No I18N
                };
            }

            //when new field type is different form list view, can use add_type
            if(selectRoute.add_type) {
                udf_field.module = udf_field.category = undefined; //reset type
                input_json.udf_field[selectRoute.add_type] = { "name": selectRoute.add_name }; //No I18N
            }
            
            input_json.udf_field.is_pii = this.options.isPII;
           
            var getpayloaddata = this.formvalidfn(field_options,input_json);
            if(getpayloaddata.udf_field) {
                input_json = getpayloaddata;
            }
            var _self = this;
            //default_value
            if (field_type == 'pick_list' || field_type == "radio" || field_type == "multi_select" || field_type == "checkbox") {
                if(this.options.entities_to_refer && this.options.entities_to_refer.is_enabled) {
                    delete input_json.udf_field.refer_field;
                    delete layout_field.refer_field_value;//109523 -- Refer entries values added in reference entity options
                    if(operation !== 'POST' && input_json.udf_field.fk_constraint) {
                        delete input_json.udf_field.fk_constraint;
                    }
                } else if ((!layout_field.refer_field_value || layout_field.refer_field_value==0) && isUdf) {
                    var l_value = layout_field.allowed_values;
                    var optindex;
                    if(l_value && layout_field.config && layout_field.config.max_option_name_char_limit) {
                        for(var i=0; i<l_value.length; i++) {
                            if(!optindex && l_value[i].name && l_value[i].name.length > parseInt(layout_field.config.max_option_name_char_limit)) {
                                optindex = (!optindex && optindex == 0) ? 0 : i;
                            }
                        }
                    }
                    if(optindex || optindex == 0) {
                        highlightfn(jQuery("#dropdownSection #option_"+optindex).get(0),'autoscroll=true,highlight=true,popup=true,popupparentnode=#dropdownSection,scrollableElement=#dropdownSection #option_'+optindex); //NO I18N
                        showalert('failure', translate('form.udf.options.char.length', [layout_field.config.max_option_name_char_limit]), 'isAutoHide=false'); //NO I18N
                        return false;
                    }
                    input_json_allowedvalues['options'] = layout_field.allowed_values;
                } else {
                    input_json.udf_field.refer_field = {
                        id: layout_field.refer_field_value
                    };
                }
            }


            if (layout_field.udfid == undefined && operation != 'POST') {
                if (moduleName == 'release' && (layout_field.id == "site" || layout_field.id == "group" || layout_field.id == "stage" || layout_field.id == "status")) {
                    Ember.set(layout_field, 'default_value', new_field.initial_value.default_value); //Default value set initial_value options//No I18N
                }
                var parent = this.options.parent;
                parent.send('fieldUpdate', layout_field); //No I18N
                this.hidePopUp(); //No I18N
            } else {
                if(operation == "POST" && input_json.udf_field.reference_entity && (layout_field.display_type == "radio" || layout_field.display_type == "checkbox")) {
                    showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + translate("additional.reference.warning.info") + ', submitbutton=' + translate("common.proceed") + ', cancelbutton=' + translate("common.cancel") + ', closebutton=yes, closeOnEscKey=yes', function(s) { // No I18N
                        if(s) {
                            _self.udfAPICallNew(input_json, input_json_allowedvalues, operation, _self.options.module, layout_field.udfid);
                        }

                    });
                } else {
                    this.udfAPICallNew(input_json, input_json_allowedvalues, operation, this.options.module, layout_field.udfid);
                }
            }
        },
        udfAPICallNew: function(input_json, input_json_allowedvalues, operation, moduleName, id) {//Need to verfiy all options and module also
            var urlaction = (operation == 'POST') ? '/api/v3/udf_fields' : '/api/v3/udf_fields/' + id; // No I18N
            var message, _self = this;
            if(input_json.udf_field && input_json.udf_field.name) {
                // SD-111456 fix when api_name contains special character as first character then show error
                var api_name = input_json.udf_field.name;
                var pattern = /^[a-z][a-z\d]*(?:_[a-z\d]+)*$/;
                /**
                 * pattern => 'API Field Name' should only contain lowercase alphanumeric characters. no special charcter except underscore is allowed. first and last character shouldn't be underscore
                */ 
                if(!pattern.test(api_name)) {
                    showalert('failure', translate('sdp.admin.customfields.api.name') + ' - ' + translate('sdp.admin.udffield.apikey.info'), 'isAutoHide=false'); // No I18N
                    return;
                }
            }
            if ((moduleName == 'release' || moduleName == 'problem' || moduleName === 'request' || this.options.isProjectModule) && operation != 'POST') {
                delete input_json.udf_field.default_value;
            }
            $udfcommon.$udflview.fieldUpdated = true;
            if(operation === 'POST' && (moduleName === 'worklog' || (input_json.udf_field.module && input_json.udf_field.module.name === 'worklog')) ){
                input_json.udf_field.module.name='base_worklog';
            }
            sdpAjax({
                url: urlaction, // No I18N
                type: operation,
                data: sdpAjaxInputData(input_json),
                async: false,
                cache: false,
                success: function(res) {
                    /* 107097 -- UDF option api calls skip for no changes in options, 107096 -- UDF option skip api call once previous call failed */
                    var operationStatus = {"status": true,"message": "sdp.api.operation.error"}; //NO I18N
                    if (res.response_status.status == "success") {
                        var layout_field = _self.options.layoutField;
                        if ((res.udf_field.field_type == 'Pick List' || res.udf_field.field_type == 'MultiSelect' || res.udf_field.field_type == 'Radio' || res.udf_field.field_type == 'CheckBox') && (!layout_field.refer_field_value || layout_field.refer_field_value==0)) { //Save allowed_values to Server
                            if(!res.udf_field.reference_entity) {
                                if (operation == 'PUT') {
                                    operationStatus = _self.separateUDFAllowedval(input_json_allowedvalues.options, operation, layout_field, res.udf_field.id, moduleName);
                                }
                                if (operation == 'POST') {
                                    operationStatus = _self.saveUDFAllowedval(input_json_allowedvalues.options, operation, layout_field, res.udf_field.id, moduleName);
                                }
                            } else {
                                var referred_values = [];
                                var cri = _self.getCriteriadata(res.udf_field.criteria,"save"), list = {}; //No I18N
                                list = {
                                    "module": { // No I18N
                                        "name": _self.udf.options.selectRoute.entity_id ? _self.udf.options.selectRoute.entity_id : _self.udf.options.selectRoute.id // No I18N
                                    },
                                    "list_info": { //No I18N
                                        "search_criteria": cri,//No I18N
                                        "row_count": "100",//No I18N
                                    },
                                    "reference_entity": {"name" : res.udf_field.reference_entity.name}, // No I18N
                                    "additional_attributes" : {"sort_order" : res.udf_field.additional_attributes.sort_order}, // No I18N
                                    "name" : res.udf_field.name // No I18N
                                };

                                if(_self.udf.options.routeName === "cmdb") {
                                    list.category = { name: "cmdb" }; // No I18N
                                    list.module = undefined;
                                }        

                                sdpAjax({
                                    url: "/api/v3/udf_fields/reference_entity_preview",// No I18N
                                    async: false,
                                    cache: false,
                                    data: sdpAjaxInputData(list),
                                    success: function(resp) {
                                        referred_values = resp[res.udf_field.name];
                                        if(_self.options.adminTemplate) {
                                            _self.emberSet(layout_field, 'allowed_values', referred_values); //No I18N
                                        } else {
                                            layout_field.allowed_values = referred_values;
                                        }
                                    }

                                });
                            }
                        }
                        if(operationStatus.status) {
                            showalert("success", _self.options.layoutField.udfid ? translate('sdp.release.template.field.updated') : translate('sdp.release.template.field.added'), 'isAutoHide=true'); // No I18N
                            if (['request','release', 'space', 'facility_service', 'problem', 'custom_modules', 'customize_ag_form','asset_asset','cmdb', 'support_group'].includes(moduleName) || _self.options.isProjectModule) {
                                _self.emberSet(layout_field, 'id', res.udf_field.name); //No I18N
                                _self.emberSet(layout_field, 'udfid', res.udf_field.id); //No I18N
                                if (res.udf_field.field_type == 'Single Line') { //Save options to server
                                    Ember.setProperties(layout_field, {
                                        "default_value": res.udf_field.default_value, //No I18N
                                        "min_length": res.udf_field.additional_attributes && res.udf_field.additional_attributes["min-len"] ? res.udf_field.additional_attributes["min-len"] : null, //No I18N
                                        "max_length": res.udf_field.additional_attributes && res.udf_field.additional_attributes["max-len"] ? res.udf_field.additional_attributes["max-len"] : null, //No I18N
                                        "only_numeric": res.udf_field.only_numeric //No I18N
                                    });
                                    var isPrimary=jQuery("input[name='primary_field']").is(':checked');//No I18N
                                    if(moduleName == 'custom_modules' && isPrimary){
                                        var fieldDetails=_self.options.controller.fieldDetails;
                                        for(let f in fieldDetails){
                                            if(fieldDetails[f].id!=res.udf_field.name && fieldDetails[f].display_type=='single_line' && fieldDetails[f].primary_field){
                                                fieldDetails[f].primary_field=false;
                                                fieldDetails[f].partial_field=false;
                                                _self.options.controller.fieldDetails[f].primary_field=false;
                                                _self.options.controller.fieldDetails[f].partial_field=false;
                                                break;
                                            }
                                        }
                                    }
                                }
                                const ft = res.udf_field.field_type;
                                if (res.udf_field.field_type == 'Numeric') { //Save options to server
                                    var min = null, max = null;
                                    if(res.udf_field.additional_attributes && res.udf_field.additional_attributes.num_range) {
                                        var range = res.udf_field.additional_attributes.num_range.split(":");
                                        min = range[0];
                                        max = range[1];
                                    }
                                    Ember.setProperties(layout_field, {
                                        "default_value": res.udf_field.default_value, //No I18N
                                        "min_length": min, //No I18N
                                        "max_length": max, //No I18N
                                    });
                                }
                                if (res.udf_field.field_type == 'Decimal') {
                                    if(res.udf_field.additional_attributes && res.udf_field.additional_attributes.precision) {
                                        Ember.setProperties(layout_field, {
                                            "precision": res.udf_field.additional_attributes.precision, //No I18N
                                            "constraints": {"decimal": res.udf_field.additional_attributes.precision}, //No I18N
                                        });
                                    }
                                }
                                if (res.udf_field.field_type == 'Date') {
                                    let dvalue = res.udf_field.default_value;
                                    if(!dvalue && layout_field && layout_field.default_value) {
                                        dvalue = layout_field.default_value;
                                    }
                                    if(dvalue == "$(created_time)"){
                                        dvalue = {"value" : new Date().getTime()}; //No I18N
                                    }
                                    Ember.setProperties(layout_field, {
                                        "default_value": dvalue //No I18N
                                    });
                                }
                                if (res.udf_field.field_type == 'Boolean') {
                                    Ember.setProperties(layout_field, {
                                        "default_value": res.udf_field.default_value //No I18N
                                    });
                                }
                                else if (ft == 'Pick List' || ft == "Radio" || ft == "MultiSelect" || ft == "CheckBox") {
                                    if(res.udf_field.reference_entity) {
                                        Ember.setProperties(layout_field, {
                                            "has_href": true //No I18N
                                        });
                                    }
                                }
                            } 
                            if($udfcommon.$udflview.udf.options.selectRoute.saveCallback) {
                                $udfcommon.$udflview.udf.options.selectRoute.saveCallback(res, operation);
                            } else if (moduleName == 'udf_fields') { //No I18N
                                _self.udf.$udflview.table_compreq.refreshTable('refresh'); //No I18N
                            }
    						if(_self.options.popupClose) {//Popup Close event
    							_self.hidePopUp();
    						} else {//Popup retain and reset the field
    							_self.options = jQuery.extend({}, _self.options, cloneJson(_self.options.formReset));
    							_self.on_field_type_change();
    						}
                            _self.parentCall(moduleName, layout_field, operation); // No I18N
                        } else {
                            var msg = (operationStatus.message) ? operationStatus.message : "sdp.api.operation.error"; // No I18N
                            showalert("failure", translate(msg), 'isAutoHide=false'); // No I18N
                        }
                    } else {
                        if (['request','release', 'space', 'facility_service', 'problem', 'support_group'].includes(moduleName) || _self.options.isProjectModule) {
                            showalert("failure", translate('sdp.api.operation.error'), 'isAutoHide=false'); // No I18N
                        } else {
                            message = res.response_status.messages[0].message;
                            showalert("failure", message, 'isAutoHide=false'); // No I18N
                        }
                        return;
                    }
                },
                error: function(resp) {
                    //this is for failure msg raised by security.xml
                    var msg = resp.responseJSON.response_status.messages[0];
                    if (msg && msg.status_code == 4008) {
                        var fieldval = msg.fields ? msg.fields[0] : msg.fields || msg.field;
                        var fieldName = (fieldval === 'display_name') ? translate('sdp.admin.additionalfields.fieldname') : (fieldval === 'name') ? translate('sdp.admin.customfields.api.name') : msg.fields; // No I18N
                        message = translate("common.duplicate.error", [fieldName, fieldName]);
                    } else if (msg && msg.status_code == 4012) {
                        var fieldval = msg.fields ? msg.fields[0] : msg.fields || msg.field;
                        var fieldName = (fieldval === 'display_name') ? translate('sdp.admin.additionalfields.fieldname') : (fieldval === 'name') ? translate('sdp.admin.customfields.api.name') : msg.fields; // No I18N
                        message = '<strong>' + fieldName + '</strong> - ' + e_html(msg.message);
                    } else {
                        if (msg.field) {
                            message = msg.field
                        } else if (msg.fields) {
                            message = msg.fields
                        }
                        message = message && message.length ? e_html(message + " - " + msg.message) : e_html(msg.message);
                    }
                    showalert("failure", message, 'isAutoHide=false'); //NO I18N
                }
            });
        },
        udfnewlyAddOpt: false, //PUT option newly added options
        separateUDFAllowedval: function(udfOptions, operation, layout_field, id, moduleName) {//Need to verfiy all options and module also
            var _self = this;
            var allowedVal = layout_field.allowed_values;
            var init_allowedVal = layout_field.initial_value.allowed_values;
            /** Get deleted option **/

            var delOldOpt;
            let arr = [];
            if (this.adminTemplate) {
                arr = this.emberGet(layout_field, 'deleted_id'); //No I18N
            } else {
                arr = layout_field.deleted_id;
            }

            if(Array.isArray(arr)) {
                delOldOpt = arr.filter(el => !`${el}`.includes('_id')); //No I18N
            }

            var diff = {
                "added": [], //NO I18N
                "edited": [], //NO I18N
                "deleted": delOldOpt, //NO I18N
                "indexchange": [], //NO I18N
                "default_value": {} //NO I18N
            };

            /** Check customized values based on response data
                 * Check the difference between initial value with option and filter the difference
                 * 1. added -- filter the added options
                 * 2. edited -- filter the edited options
                 * 3. deleted -- filter the deleted options
                 * 4. indexchange -- list down sorting changes
                 * 5. default_value -- get the default value
                 *
                 *  **/
            var diffopt1 = allowedVal.filter(function(obj1, index) {
                if(obj1.id == undefined) {
                    diff.added.push(obj1);
                } else if(obj1.default) {
                    diff.default_value = obj1;
                } else {
                    return init_allowedVal.some(function(obj2, index1) {
                        if(obj1.id === obj2.id) {
                            if(obj1.name !== obj2.name) {
                                diff.edited.push(obj1);
                            }
                            if(index !== index1) {
                                diff.indexchange.push(obj1.id);
                            }
                        }
                    });
                }
            });

            /**
             * check and set default value is present in edited option's or not, then add the value to edited option's
             *  **/
            if(!jQuery.isEmptyObject(diff.default_value)) {
                var defedited = diff.edited.filter(function(obj1, index) {
                    return obj1.id == diff.default_value.id
                });
                if(defedited.length == 0) {
                    diff.edited.push(diff.default_value);
                }
            }

            var operationStatus = true, operationmsg = false, interchange = false;

            if(this.options.is_new_api) {
                var optionlimit = this.allowedvalues_validation(layout_field);
                if(!optionlimit.isvalid) {
                    operationmsg = optionlimit.message;
                    operationStatus = optionlimit.isvalid;
                }
            }

            /**
             * Delete option API call trigger
             *  **/
            if(Array.isArray(diff.deleted) && diff.deleted.length != 0) {
                var delOpt = [];
                for (var i = 0; i < diff.deleted.length; i++) {
                    if(typeof diff.deleted[i] === 'string') {
                        delOpt.push(diff.deleted[i]);
                    }
                    else {
                        delOpt.push(diff.deleted[i].id);
                    }
                }
                delOpt = delOpt.filter((item, pos) => delOpt.indexOf(item) == pos); //remove duplicates
                sdpAjax({
                    url: '/api/v3/udf_fields/' + id + '/options?ids=' + delOpt.toString(), // No I18N
                    type: 'DELETE', //No I18N
                    async: false,
                    cache: false,
                    success: function(res) {
                        //_self.saveUDFAllowedval(allowedVal,operation,layout_field,id);
                        if (_self.options.adminTemplate) {
                            _self.emberSet(layout_field, 'deleted_id', []); //No I18N
                        } else {
                            layout_field.deleted_id = [];
                        }
                    }
                });
                interchange = true;
            }
            /**
             * Delete option API call trigger
             *  **/
            if(diff.added.length != 0 && operationStatus) {
                this.udfnewlyAddOpt = true;
                var opr = this.saveUDFAllowedval(diff.added, 'POST', layout_field, id, moduleName); //No I18N
                operationStatus = opr.status;
                operationmsg = opr.message;
                interchange = true;
            }
            /**
             * Edited option API call trigger
             *  **/
            if(diff.edited.length != 0 && operationStatus) {
                var opr = this.saveUDFAllowedval(diff.edited, operation, layout_field, id, moduleName);
                operationStatus = opr.status;
                operationmsg = opr.message;
            }
            if(diff.indexchange.length != 0) {
                interchange = true;
            }
            /**
             * Organize option API call trigger
             *  **/
            if(operationStatus && interchange) {
                this.saveUDFAllowedOrgval(layout_field.allowed_values, id); //api call for organize option 
                if (this.options.adminTemplate) {
                    /**
                     * get all allowed values to template section
                     * **/
                    var _self = this;
                    sdpAjax({
                        url: '/api/v3/udf_fields/' + id + '/options', // No I18N
                        data: sdpAjaxInputData({list_info: {row_count: 100}}),
                        async: false,
                        cache: false,
                        success: function(res) {
                            _self.allowedDefaultValfn(udfOptions, res.options, layout_field);
                        }
                    });
                }
            }
            return {"status": operationStatus, "message": operationmsg}; // No I18N
        },
        saveUDFAllowedval: function(udfOptions, operation, layout_field, id, moduleName) {//Need to verfiy all options and module also
            var udfopt = [];
            var _self = this;
            var operationStatus = true;
            var operationmsg = false;
            if (operation == 'POST') {
                var optionlimit = this.allowedvalues_validation(layout_field);
                if(!optionlimit.isvalid) {
                    operationmsg = optionlimit.message;
                    operationStatus = optionlimit.isvalid;
                }
            }
            if(operationStatus) {
                for (var i = 0; i < udfOptions.length; i++) {
                    if (operation == 'POST') {
                        if (udfOptions[i].id) {
                            delete udfOptions[i].id;
                        }
                    }
                    if(!_self.options.sendDefValue && operation === 'PUT') {
                        delete udfOptions[i].default;
                    }
                    if(udfOptions[i].disableDelete) {
                        delete udfOptions[i].disableDelete;
                    }
                    if(i == 0 || (i % 100 === 0)) {
                        if(i == 0) {
                            udfopt.push(udfOptions[i]);
                        } else {
                            operationStatus = saveallfn(udfopt, operation, layout_field, id, moduleName, _self);
                            udfopt = [];
                            udfopt.push(udfOptions[i]);
                        }
                    } else {
                        udfopt.push(udfOptions[i]);
                    }
                }
                if(udfopt.length != 0) {
                    operationStatus = saveallfn(udfopt, operation, layout_field, id, moduleName, _self);
                }
            }
            function saveallfn(udfOptions, operation, layout_field, id, moduleName, _self) {
                var operationStatus1 = true;
                    var opt = {
                        "options": udfOptions //No I18N
                    };
                    sdpAjax({
                        url: '/api/v3/udf_fields/' + id + '/options', // No I18N
                        type: operation,
                        data: sdpAjaxInputData(opt),
                        async: false,
                        cache: false,
                        success: function(res) {
                            if (_self.udfnewlyAddOpt) {
                                var allval = layout_field.allowed_values;
                                if (jQuery.isArray(res.options)) {
                                    for (var i = 0; i < allval.length; i++) {
                                        for (var j = 0; j < res.options.length; j++) {
                                            if (allval[i].name == res.options[j].name) {
                                                allval[i]['id'] = res.options[j].id;
                                            }
                                        }
                                    }
                                } else {
                                    for (var i = 0; i < allval.length; i++) {
                                        if (allval[i].name == res.options.name) {
                                            allval[i]['id'] = res.options.id;
                                        }
                                    }
                                }
                                _self.udfnewlyAddOpt = false;
                            } else if((['release','request', 'space', 'facility_service', 'problem', 'custom_modules', 'customize_ag_form', 'support_group'].includes(moduleName) || _self.options.isProjectModule) && operation == 'POST') {// No I18N
        						if(jQuery.isArray(res.options)) {
        							var allval = res.options;
        						} else {
        							var allval = [];
        							allval.push(res.options);
        						}
        						_self.allowedDefaultValfn(udfOptions,allval,layout_field);
        					}
                        },
                        error: function() {
                            operationStatus1 = false;
                        }
                    });
                return operationStatus1;
            }
            return {"status": operationStatus, "message": operationmsg}; // No I18N
        },
        saveUDFAllowedOrgval: function(options, id) {//Need to verfiy all options and module also
            var orgOpt = [];
            var info;
            if(options.length == 0) {
                return;
            }
            if(options.length <= 100 && !this.options.pick_hasmorerows) {
                for (var i = 0; i < options.length; i++) {
                    if(options[i]) {
                        orgOpt.push(options[i].id);
                    }
                }
                info = {"ids":orgOpt.toString()}; // No I18N
            } else {
                //jQuery('.formpopup-dropdownaction [data-id=optToogle]')
                info = {"sort_order": (this.options.asc_order ? "asc" : "desc")}; // No I18N
            }
            sdpAjax({
                url: '/api/v3/udf_fields/' + id + '/options/organize', // No I18N
                type: 'PUT', //No I18N
                data: sdpAjaxInputData(info),
                async: false,
                cache: false,
                success: function(res) {}
            });
        },
        allowedDefaultValfn: function(udfOptions, options, layout_field) {
            var _self = this;
            var parent = this.options.parent;

            if(Array.isArray(options)) {
                options = options.map(({ id, name }) => ({
                    id: id || `${name}_id`,
                    name,
                }));
            }

            this.emberSet(layout_field, 'allowed_values', options); //No I18N
            //layout_field.allowed_values = options; //NO I18N
            for (var i = 0; i < udfOptions.length; i++) {
                if (udfOptions[i].default) {
                    for (var j = 0; j < options.length; j++) {
                        if (options[j].name == udfOptions[i].name) {
                            _self.emberSet(layout_field, 'default_value', options[j]); //No I18N
                            layout_field.default_value = options[j]; //NO I18N
                            parent.send('defValChange', layout_field, options[j].id); // No I18N
                        }
                    }
                }
            }
        },
        popUpSave: function(stopDialogclose) {
            if(this.options.retired_field) {
                showalert('failure', translate('additional.field.retired_warning'), 'isAutoHide=false');//NO I18N
                return;
            }
            var popup_action = this.options.popup_action;
            var module = this.options.module;
			this.options.popupClose = (stopDialogclose != undefined && !stopDialogclose) ?  false: true;//Save and Close button show/hide
            //getting the layoutfield to construct input json for checklist
            var field = this.options.layoutField;
			this.popUpValid(jQuery("#fieldPopup")); //popup form validation
            if (jQuery("#fieldPopup").valid()) {
                //needed for checklist module also 
                if (this.options.is_new_api) {
                    if (popup_action === "newField") { // No I18N
                        this.addOrUpdateUDFFields('POST'); // No I18N
                    } else if (popup_action === "updateField") { //No I18N
                        this.addOrUpdateUDFFields('PUT'); // No I18N
                    } else if (popup_action == "editSection") { //No I18N
                        let parent = this.options.parent;
                        var sec_json = this.options.section_form;
                        let rt_status = true;
                        if(sec_json && (sec_json.sec_type == "sub_form" || sec_json.sec_type == "sub_entity")) {
                            var api_name = sec_json.api_name;
                            var pattern = /^[a-z][a-z\d]*(?:_[a-z\d]+)*$/;
                            if(!pattern.test(api_name)) {
                                showalert('failure', translate('sdp.admin.customfields.api.name') + ' - ' + translate('sdp.admin.udffield.apikey.info'), 'isAutoHide=false'); // No I18N
                                rt_status = false;
                            }
                        }
                        if(rt_status) {
                            parent.send('updateSection', sec_json, 'help_text'); // No I18N
                            this.hidePopUp();
                        }
                    } else if (popup_action == "editForm") { // Update the Form with the new values//No I18N
                        if(!jQuery("#fieldPopup").valid()) { return;}
                        let parent = this.options.parent;
                        var width = jQuery('#formMaxWidth').val(); // No I18N
                        if (width >= 1366 && width <= 1880) {//Range for admin tempalte max_width style properties validation
                            Ember.set(parent.model.style_properties, 'max_width', width); //No I18N
                        }
                        parent.send('updateForm', this.options.layoutField.field_style); // No I18N
                        this.hidePopUp();
                    }
                } else {
                    if (popup_action === "newField") { // No I18N
                        this.addOrUpdateFields('POST'); // No I18N
                    } else if (popup_action === "updateField") { //No I18N
                        // for checklist module calling a different method for update udf
                        if (module == 'checklist')
                            this.updateChecklistUDF(field);
                        else
                            this.updateFields(true); //NO I18N
                    } else if (popup_action == "editSection") { //No I18N
                        let parent = this.options.parent;
                        var sec_json = this.options.section_form; // No I18N
                        parent.send('updateSection', sec_json, 'help_text'); // No I18N
                        this.hidePopUp(); // No I18N
                    }
                    // Update the Form with the new values
                    else if (popup_action == "editForm") { // No I18N
                        let parent = this.options.parent; // No I18N
                        var width = jQuery('#formMaxWidth').val(); // No I18N
                        if (width >= 1366 && width <= 1880) {//Range for admin tempalte max_width style properties validation
                            Ember.set(parent.model.style_properties, 'max_width', width); //No I18N
                        }
                        parent.send('updateForm', this.options.layoutField.field_style); // No I18N
                        this.hidePopUp(); // No I18N
                    }
                }
            }
        },
        // This action is used to Set the styles of a particular Form/Section/Field
        updateFormProperties: function(prop, action, attr) {
            var parent = this.options.parent; // No I18N
            // Prevent prop to be sent as undefined
            prop = prop || {};
            if (typeof prop.font_family == "object" && prop.font_family.name) { // No I18N
                this.emberSet(prop, 'font_family', prop.font_family.name); //No I18N
            }
            if (typeof prop.font_size == "object" && prop.font_size.name) { // No I18N
                this.emberSet(prop, 'font_size', prop.font_size.name); //No I18N
            }
            if (action == "form") { // No I18N
                parent.send('updateForm', prop); // No I18N
            } else if (action == "section") { // No I18N
                parent.send('updateSection', prop, 'field_style'); // No I18N
            } else if (action == 'field') { // No I18N
                this.field_values_chng(attr, prop);
            } else if (action == 'header') { // No I18N
                if (this.options.popupType == "form") { // No I18N
                    parent.send('updateFormHeader', prop); // No I18N
                } else {
                    parent.send('updateSection', prop, 'section_style'); // No I18N
                }
            }
        },
        // This action is used to Reset the styles of a particular Form/Section/Field
        resetStyles: function(type) {//Need to verfiy all options and module also
            var parent = this.options.parent,
                defaultProp = {
                    "style_properties": {} //No I18N
                };
            if (this.options.popupType == "form") { // No I18N
                if (type == "default") { // No I18N
                    defaultProp.style_properties = parent.model.default_styles || {};
                }
                defaultProp = this.getDuplicateJSON(defaultProp);
                parent.send('resetAllStyles', type); // No I18N
                Ember.set(this, 'layoutField', defaultProp.style_properties); // No I18N
                Ember.set(parent.model.style_properties, 'max_width', this.options.maxWidth); // No I18N
                setTimeout(function() {
                    jQuery(window).trigger('scroll'); // No I18N
                }, 100)
            } else if (this.options.popupType == "section") { // No I18N
                Ember.setProperties(this.options.section_form, {
                    'style_properties': { //No I18N
                        "field_style": {}, //No I18N
                        "section_style": {} //No I18N
                    }
                });
				this.updateFormProperties({}, 'header'); // No I18N
                this.updateFormProperties({}, this.options.popupType, 'style_properties');// No I18N
                var sections = parent.layouts,
                    section_index = parent.cur_sec_index,
                    column_count = sections[section_index].column_count,
                    columns = sections[section_index].columns || sections[section_index].rows; // No I18N
                var count = (column_count != 12) ? column_count : columns.length;
                for (var i = 0; i < count; i++) {
                    var current_column = columns[i];
                    for (var j = 0; j < current_column.length; j++) {
                        var field_id = current_column[j].id;
                        if (!field_id) {
                            continue;
                        }
                        defaultProp = this.getDuplicateJSON({});
                        if (type == "default") { // No I18N
                            Ember.setProperties(defaultProp, parent.fieldDetails[field_id].default_styles); // No I18N
                        }
                        Ember.setProperties(parent.fieldDetails[field_id], {
                            'style_properties': defaultProp //No I18N
                        });
                    }
                }
            } else {
                if (type == "default") { // No I18N
                    defaultProp = this.getDuplicateJSON(this.options.layoutField.default_styles || {});
                }
                this.updateFormProperties({
                    'style_properties': {} //No I18N
                }, this.options.popupType, 'style_properties'); // No I18N
            }
            this.hidePopUp(); // No I18N
            if (type == 'clear') { // No I18N
                showalert('success', window.translate('common.clearstylesmessage', [this.options.popupType]), 'isAutoHide=true,delay=3'); //NO I18N
            }
        },
        /*Popup footer section Save, Update, Cancel Events End*/
        closePopUp: function() {
            // 109544 - if criteria section is opened, then close criteria section only
            if(jQuery('#refer_criteria').children().length > 0) {
                return this.closeCriteriaSection();
            }

            var _self = this;
            var popupAction = this.options.popup_action;
            var module = this.options.module;
            var layout_field = this.options.layoutField;
            var parent = this.options.parent;
            // getting fromChecklistEditPage and checklistcontroller
            var fromChecklistEditPage = this.options.fromChecklistEditPage;
            var checklistController = this.options.checklistController;

            jQuery('[data-name="saveformpopup"]').removeAttr("disabled"); //No I18N
            // to be executed for checklist module also
            let smodule = ["request","checklist","release","udf_fields","space","facility_service","problem","custom_modules","asset_asset","cmdb","customize_ag_form","support_group"]; //NO I18N
            if (smodule.includes(module) || this.options.isProjectModule) {
                if (popupAction.indexOf("Field") > 0 && jQuery('.formpopup-dropdownvalue').hasClass('hide')) {
                    _self.backFrombulkAddPage(); //NO I18N
                }

                //edit section popup
                if (popupAction == "editSection") {
                    var sec_json = this.options.section_form;
                    parent.send('cancelSectionUpdation', sec_json); // No I18N
                    _self.hidePopUp(); //NO I18N
                }
                //New Field PopUp
                else if (popupAction == "newField") {
                    if (module == 'udf_fields') {
                        _self.hidePopUp(); //NO I18N
                    } else {
                        let confirmMsgTitle = window.translate("common.discard");
                        let confirmMsg = window.translate("sdp.requestcatalog.reorder.discard");
                        let proceedMsg = window.translate("sdp.common.picklistvalues.yes");
                        let cancelMsg = window.translate("sdp.common.picklistvalues.no");
                        showconfirm(true, 'title=' + confirmMsgTitle + ', message=' + confirmMsg + ', submitbutton=' + proceedMsg + ', cancelbutton=' + cancelMsg + ', closebutton=yes, closeOnEscKey=yes', showconfirmcommit); // No I18N
                        function showconfirmcommit(s) {
                            if (s) {
                                _self.hidePopUp(); // No I18N
                                // for checklist module delte field should be called on checklistController
                                if (module == 'checklist') {
                                    if (fromChecklistEditPage == true)
                                        checklistController.send('deleteField'); //No I18N
                                } else {
                                    parent.send('deleteField'); // No I18N
                                }
                                //_self.send('addOrUpdateFields','POST');// No I18N
                            } else {
                                closeDialog();
                            }
                        }
                    }
                }
                // Update Form properties with the initial value
                else if (popupAction == "editForm") { // No I18N
                    //let parent = this.get('parent'); // No I18N
                    parent.send('cancelFormUpdation', layout_field); // No I18N
                    _self.hidePopUp(); // No I18N
                } else if (popupAction == 'release-roles') { //No I18N
                    parent.send('deleteField'); // No I18N
                }
                //Update Field PopUp
                else {
                    let parent = this.options.parent;
                    // cancelFieldUpdation is nt needed for checklist module
                    if (module != 'checklist' && module != 'udf_fields'){
                        parent.send('cancelFieldUpdation', layout_field); // No I18N
                    }
                    _self.hidePopUp(); //NO I18N
                }
            }
            if (_self.options.tablerefresh) {
                if (module == 'udf_fields') {
                    _self.udf.$udflview.table_compreq.refreshTable('refresh'); //No I18N
                    _self.options.tablerefresh = false;
                }
                if (_self.options.adminTemplate && layout_field.udfid) {
                      sdpAjax({
                          url: '/api/v3/udf_fields/' + layout_field.udfid + '/options', // No I18N
                          async: false,
                          cache: false,
                          success: function(res) {
                                _self.emberSet(layout_field, 'allowed_values', res.options); //No I18N
                                _self.emberSet(layout_field, 'deleted_id', []); //No I18N
                          }
                      });
                }
            }
        },
        // trigered after completion of adding elements via bulk add
        backFrombulkAddPage: function() {
            jQuery('.formpopup-dropdownvalue').removeClass('hide');
            if(sdp_user.DIRECTION == "LTR") {
                jQuery('.formpopup-bulkaddlist').animate({
                    left : '100%'
                }, 200);
            } else {
                jQuery('.formpopup-bulkaddlist').animate({
                    right : '100%'
                }, 200);
            }
            jQuery('.form-footer .btn[data-name=formbulkcancel],.form-footer .btn[data-name=formbulkaddsubmit],button[name="backbtn"]').addClass('hide');
            if (this.options.fieldtype_enabled) {
                jQuery('[data-name=field_types]').prop('disabled', false); //No I18N
            }
            jQuery('[data-id=field_preview]').prop('disabled', false); //No I18N
            jQuery('.form-footer .btn[data-name=saveformpopup],.form-footer .btn[data-name=formCancel]').removeClass('hide');
            setTimeout(function() {
                jQuery('.formpopup-dropdownsection').niceScroll({
                    horizrailenabled: false
                }); // Resize nicescroll
            }, 210);
        },
        hidePopUp: function() {
            jQuery("#fieldPopup").validate().resetForm();
            jQuery('.col-fields.active').removeClass("active selected"); // No I18N
            jQuery('.form-section.selected').removeClass("selected"); // No I18N
            jQuery("#templatePopUp").addClass("hide");
            this.options["show_formSettings"] = false; // No I18N
            this.options["pick_hasmorerows"] = false; // No I18N
            jQuery(".freezeLayer").addClass("hide");
            //jQuery("[href='#properties']").trigger("click"); // No I18N
            if(sdp_user.DIRECTION == "LTR") {
                jQuery('.formpopup-bulkaddlist').animate({
                    left : '100%'
                }, 200);
            } else {
                jQuery('.formpopup-bulkaddlist').animate({
                    right : '100%'
                }, 200);
            }
            setTimeout(function() {
                jQuery('.ui-tooltip').remove();
            }, 400);
        },
        /*Popup Tab Events Start*/
        changeTab: function(tabName) {
            var currentTab = this.options.currentTab,
                _self = this; // No I18N
            if (tabName == currentTab) {
                return;
            } else {
                this.options['currentTab'] = tabName; // No I18N
                this.changeTabRender(tabName); //Latest handle parent render data
            }
            setTimeout(function() {
                _self.adjustPopupHeight();
            }, 300)
        },
        // handle tab change
        changeTabRender: function(tabName) {
            var renderloadObj = {
                'sectionrender': true, //No I18N
                'pickOptionrender': true //No I18N
            };
            if (this.options.popupType == 'section' && tabName != 'customization') {
                renderloadObj['pickOptionrender'] = false;
            }
            if (tabName == 'customization') {
                renderloadObj['customizationrender'] = true;
                // re-enable preview when the tab is customization
                jQuery('[data-id=field_preview]').prop('disabled', false); //No I18N
            }
            if (tabName == 'properties') {
				var ftype = this.options.layoutField.display_type;
				if (ftype == "pick_list" || ftype == "multi_select" || ftype == "radio" || ftype == "checkbox") {
					renderloadObj['pickOptionrender'] = true;
				} else {
					renderloadObj['pickOptionrender'] = false;
				}
            }
            this.udf.loadRender(this, renderloadObj);
        },
        cusSelect2fn: function(style, _self) {
			/*** Get and set Application available fonts lists to Template popup section ***/
			var app_fontfamily = [];//Skip dublication for already available font name
			//set default selected value "Roboto" if font available in application font list
			var setdefaultvalue = {};
			var seldataff = {};//set personalized font
			jQuery.each(sdp_app.FONTS, function( index, value ) {
				value["text"] = value.name;
				app_fontfamily.push(value);
				if(_self.layoutColField.font_family == value.style) {
					seldataff = value;
				}
				if(value.name == 'Roboto' && value.style == 'Roboto, Arial') {
					setdefaultvalue = value;
				}
			});
			if(jQuery.isEmptyObject(seldataff)) {
				seldataff = setdefaultvalue;
			}
			app_fontfamily = $fontapi.fontSortOrder(app_fontfamily);
            jQuery('#fontFamily_' + _self.type).select2({
                data: app_fontfamily,
                formatResult: function(item, cntrl) {
                    return '<span style="font-family: ' + e_attr(item.style) + '" class="text-wrap">' + e_html(item.name) + '</span>';
                }
            });
            jQuery('#fontFamily_' + _self.type).select2('data', seldataff); //No I18N

            var fs = _self.defoptions.fontSize;
            var seldatafs;
            for (var i = 0; i < fs.length; i++) {
                fs[i]['text'] = fs[i].name;
                if (fs[i].name == _self.layoutColField.font_size) {
                    seldatafs = fs[i];
                }
            }
            jQuery('#form_fontSize_' + _self.type).select2({
                data: _self.defoptions.fontSize
            });
            jQuery('#form_fontSize_' + _self.type).select2('data', seldatafs); //No I18N
        },
        /*Popup Tab Events End*/
        /*Release Roles add popup changes Start*/
        //additional roles
        closeRolesPopup: function() {
            /*Add new rolse popup close event trigger*/
            this.closePopUp(); // No I18N
        },
        popuprolesNamecng: function(val) {
            /*Add new roles popup name trigger*/
            var layout_field = this.options.layoutField;
            this.emberSet(layout_field, 'label', val); //No I18N
        },
        // common function to add/edit roles
        addOrUpdateRoles: function(rolesId) {
            /*Add new roles popup add event trigger*/
            var layout_field = this.options.layoutField;
            var moduleName = this.options.module;
            var parent = this.options.parent;
            if (rolesId.user_type == 'ALL') {
                this.emberSet(layout_field, 'href', '/releases/release_requester'); //No I18N
                this.emberSet(layout_field, 'entityname', 'release_requester'); //No I18N
            } else {
                var rel = parent.model.release;
                if (rel.site == undefined || rel.site == null || rel.site.id == '0') {
                    var relsite = '-1';
                } else {
                    var relsite = rel.site.id;
                }
                if (rel.group == undefined || rel.group == null) {
                    var relgroup = null;
                } else {
                    var relgroup = rel.group.id;
                }
                this.emberSet(layout_field, 'href', '/releases/release_engineer'); //No I18N
                this.emberSet(layout_field, 'entityname', 'release_engineer'); //No I18N
                if (rolesId.user_type == 'SGT') {
                    var linfo = {
                        "search_criteria": { //No I18N
                            "field": "associated_sites", //No I18N
                            "condition": "is", //No I18N
                            "value": { //No I18N
                                "id": relsite //No I18N
                            },
                            "children": [{ //No I18N
                                "field": "support_group", //No I18N
                                "condition": "is", //No I18N
                                "value": { //No I18N
                                    "id": relgroup //No I18N
                                },
                                "logical_operator": "and" //No I18N
                            }]
                        },
                        "row_count": 100 //No I18N
                    };
                    this.emberSet(layout_field, 'list_info', linfo); //No I18N
                } else if (rolesId.user_type == 'ST') { //No I18N
                    var linfo = {
                        "search_criteria": { //No I18N
                            "field": "associated_sites", //No I18N
                            "condition": "is", //No I18N
                            "value": { //No I18N
                                "id": relsite //No I18N
                            }
                        },
                        "row_count": 100 //No I18N
                    };
                    this.emberSet(layout_field, 'list_info', linfo); //No I18N
                }
                this.emberSet(layout_field, 'display_type', 'multi_select'); //No I18N
            }
            this.emberSet(layout_field, 'label', rolesId.name); //No I18N
            this.emberSet(layout_field, 'description', rolesId.description); //No I18N
            this.emberSet(layout_field, 'rolesid', 'rolestab'); //No I18N
            this.emberSet(layout_field, 'id', 'roles_' + rolesId.id); //No I18N
            this.parentCall(moduleName, layout_field, 'POST'); // No I18N
        },
        /*Release Roles add popup changes End*/
        /*** New function **/
        /***
         * Check and get option limit(pick list, multi select, checkbox, radio) in getconfig API
         * fieldInfo -- Object ( Field information )
         * ***/
        setudfallowedvaluelength: function(fieldInfo) {
            var type_config = {
                "checkbox":"checkbox_options_limit", // No I18N
                "multi_select": "multi_select_options_limit", // No I18N
                "pick_list":"picklist_options_limit", // No I18N
                "radio":"radio_options_limit" // No I18N
            };
            return (type_config[fieldInfo.display_type] && fieldInfo.config) ? fieldInfo.config[type_config[fieldInfo.display_type]] : {};
        },
        /**
         * Configure/Reset udfform options(Reference entity) in fieldinfo
         * fieldInfo -- Object ( Field information )
         * **/
        entityreferoption: function(fieldInfo) {
            var dataobj = {
                "entities_to_refer": { //NO I18N
                    "is_show": true,//NO I18N
                    "is_enabled": false,//NO I18N
                    "info": "",//NO I18N
                    "value": [], // NO I18N
                    "api": {//NO I18N
                        "url": [{//NO I18N
                            "url": "/api/v3/udf_fields/reference_entity",//NO I18N
                            "field": "reference_entity",//NO I18N
                            "list_info": {"sort_field":"display_name","row_count":100},//NO I18N
                        }],
                        "include_inactive_value": true,//NO I18N
                        "for": this.udf.options.module_config.config_name//NO I18N
                    },
                    "criteria": {//NO I18N
                        "is_added": false,//NO I18N
                        "info": "",//NO I18N
                        "data": [],//NO I18N
                    },
                    "sort_order": "asc"//NO I18N
                }
            };
            if("request" == this.udf.options.module_config.config_name){
                 //product and software type is supported only for resource questions currently.
                 dataobj.entities_to_refer.api.url[0].list_info.search_criteria=[{"field":"name","condition":"is not","values":["software","product"]}];//NO I18N
            }
            var refer_entity = fieldInfo.id == 'new_field' ? true : false; // refer fields like technician, priority, category, etc  => shouldn't have Reference entity dropdown
            if(fieldInfo.udfid) {
                refer_entity = !jQuery.isEmptyObject(fieldInfo.response.reference_entity);
            }
            this.options.refer_entity = refer_entity;
            this.options["entities_to_refer"] = dataobj.entities_to_refer;
            if(fieldInfo.response && fieldInfo.response.additional_attributes) {
                this.options.entities_to_refer.sort_order = fieldInfo.response.additional_attributes.sort_order;
            }
        },
        /***
         * Get metainfo for criteia and Set the response value to option
         * module -- module check now work alone CM
         * response -- Edit field API response
         * ***/
        entityreferfn_value: function(module, response) {
                var refer_criteria = {};
                var input_data = {
                    for: "udf_refer_entity_fields" // No I18N
                }
                sdpAjax({
                    url: "/api/v3/"+response.reference_entity.api_plural_name+"/_metainfo",//NO I18N
                    async: false,
                    cache: false,
                    data: sdpAjaxInputData(input_data),
                    success: function(resmeta) {
                        //For technician only showing the MSP account departments. No impact for SDP.
                        if(sdp_app.IS_MSP && resmeta.metainfo.entity === "technician") {
                            resmeta.metainfo.fields.department.href += "?ACCOUNTID=" + sdp_app.MSP_ORG;//NO I18N
                        }
                        refer_criteria = resmeta.metainfo.fields;
                    }
                });
                response.reference_entity["text"] = response.reference_entity.display_name;
                var renderopt = {
                    "entities_to_refer": {//NO I18N
                        "is_show": true,//NO I18N
                        "is_enabled": true,//NO I18N
                        "info": "",//NO I18N
                        "value": response.reference_entity,//NO I18N
                        "api": {//NO I18N
                            "url": [{//NO I18N
                                "url": "/api/v3/udf_fields/reference_entity",//NO I18N
                                "field": "reference_entity",//NO I18N
                            }],
                            "include_inactive_value": true,//NO I18N
                            "for": this.udf.options.module_config.config_name//NO I18N
                        },
                        "criteria": {//NO I18N
                            "is_added": true,//NO I18N
                            "info": "",//NO I18N
                            "data": response.criteria ? response.criteria : [],//NO I18N
                            "metainfo": refer_criteria//NO I18N
                        }
                    }
                };
                this.options.entities_to_refer = jQuery.extend({},this.options.entities_to_refer,renderopt.entities_to_refer);
            //}
        },
        /** Reference enetity checkbox click event **/
        referEntityEnable: function($this) {
            var layoutField = this.options.layoutField;
            if(this.options.refer_field) {
                this.options.refer_field_value = null;
                this.referFieldSelect2();

                delete layoutField.refer_field_value;
            }

            if(sdp_app.IS_ESMDIR) { //SD-117947 fix
                layoutField['allowed_values'] = []; //NO I18N
            }
            else {
                this.emberSet(layoutField, 'allowed_values', []); //No I18N
                if(this.options.module == 'request') {
                    this.emberSet(layoutField, 'read_only', $this.checked); //No I18N
                    this.emberSet(layoutField, 'isDisable', $this.checked); //No I18N
                }
            }
            var renderloadObj = {
                'pickOptionrender': true //No I18N
            }
            this.udf.loadRender(this, renderloadObj); //popup section and picklist option render

            if($this.checked) {
                jQuery('[data-freeze=picklistCriteria]').addClass("hide");
                jQuery('[data-freeze=picklistOption]').removeClass("hide");
                jQuery('[data-id="optToogle1"]').prop('disabled', false); //No I18N
                jQuery('#popupRightSec').attr("style", "pointer-events: none; opacity: 0.3;"); //No I18N
                jQuery('input[name="encrypt_field"]').prop('checked', false).prop('disabled', true) //No I18N
            } else {
                jQuery('[data-freeze=picklistCriteria]').removeClass("hide");
                jQuery('[data-freeze=picklistOption]').addClass("hide");
                jQuery('[data-id="optToogle1"]').prop('disabled', true); //No I18N
                jQuery('#popupRightSec').attr("style", ""); //No I18N
                jQuery('input[name="encrypt_field"]').prop('checked', false).prop('disabled', false) //No I18N
                this.adjustPopupHeight();
            }
            this.options.entities_to_refer.is_enabled = $this.checked;
        },
        /** Reference enetity edit criteria event **/
        referEntityEditCriteria: function() {
            let _self = this, isLayout = false;
            renderhbs('#refer_criteria', 'form-refer-criteria', {"entities_to_refer": _self.options.entities_to_refer,"udfid":_self.options.layoutField.udfid,"layout":isLayout}, false, "additionalfields",false, false, function() { //No I18N
                jQuery("#refer_criteria").removeClass("hide");
                var opt = {
                    "showNoError": true,//NO I18N
                    "metainfo": _self.options.entities_to_refer.criteria.metainfo,//NO I18N
                    "includeSubFields": ["users_udf_fields","ci_default_fields","cm_fields"], //No I18N
                    "ignoreTypes": ["Html","Attachment"], //No I18N
                    "haveOtherUDF": true //NO I18N
                };
                opt["skipFieldTypeConditions"] = _self.criteriaCondition(_self.options.entities_to_refer.value.name);
                opt["allowed_value"] = _self.criteriaCallback();//NO I18N
                jQuery("#rule_criteria").custom_filter(opt);//NO I18N
                var cridata = _self.getCriteriadata(_self.options.entities_to_refer.criteria.data,"form"); //No I18N
                setTimeout(function() {
                    jQuery("#rule_criteria").custom_filter("update",cridata);//NO I18NinitTooltip('#refer_criteria'); //No I18N
                },100)
                _self.refer_criteria_events(isLayout);
            });
        },
        /** Reference enetity delete criteria event **/
        referEntityDeleteCriteria: function() {
            let _self = this, isLayout = true;
            _self.options.entities_to_refer.criteria.data = [];
            if(_self.options.layoutField.response) {
                _self.options.layoutField.response.criteria = [];
            }
            renderhbs('#criteria-layout', 'form-refer-criteria', {"entities_to_refer": _self.options.entities_to_refer,"udfid":_self.options.layoutField.udfid,"layout":isLayout}, false, "additionalfields",false, false, function() { //No I18N
                    if(jQuery("#refer_entity").length === 1) {
                        var ajaxurl = _self.options.entities_to_refer.api;
                        var opt = {
                            cache: {},
                            processResults: function(search_data,data,field) {
                                data["text"] = data.display_name;
                                search_data.push(data);
                            }
                        }
                        opt = jQuery.extend(true, ajaxurl, opt);
                        jQuery("#refer_entity").sdp_select2(opt);
                        if(_self.options.entities_to_refer.value.length != 0) {
                            jQuery("#refer_entity").select2("data",_self.options.entities_to_refer.value);//NO I18N
                        }
                    }
                    initTooltip('#fieldPopup'); // NO I18N
                    _self.refer_criteria_events(isLayout);
            });
        },
        /** Reference enetity change options event **/
        changeReferentity: function(data) {
            var data = jQuery(data).select2("data"); // NO I18N
            if(data && data.category && data.category.name == "custom_module") {//Selected options is custom module then only show the warning message
                showconfirm(true, 'message=' + translate("additional.reference.custom.config.info") + ', cancelbutton=' + translate("sdp.common.ok") + ', closebutton=no, closeOnEscKey=yes', function(){}); // NO I18N
            }
            this.options.entities_to_refer.value = data;
            this.referEntityDeleteCriteria(); // delete the previous criteria
        },
        /** Reference enetity criteria skip field option callback event for options specific **/
        criteriaCallback: function() {
            var _self = this;
            return {
                "callback": function(listinfo, id) {//NO I18N
                    if(_self.options.entities_to_refer.value.name == "asset" && id == "state") {//NO I18N
                        return {"search_criteria":[{"field":"name","condition":"is not","values":["disposed"]}],sort_order: "asc", row_count: "100"}; //No I18N//NO I18N
                    } else {
                        return listinfo;
                    }
                }
            }
        },
        criteriaCondition: function(type) {
            var skipfield = {};
            switch(type) {
                case "department": //NO I18N
                    skipfield = {
                      "site" : ["is_empty","is_not_empty"], //NO I18N
                      "name" : ["is_empty","is_not_empty"]//NO I18N
                    };
                    break;
                case "status"://NO I18N
                    skipfield = {
                        "stop_timer" : ["is_not"],//NO I18N
                        "in_progress" : ["is_not"],//NO I18N
                        "name" : ["is_empty","is_not_empty"]//NO I18N
                    };
                    break;
                case"asset"://NO I18N
                    skipfield = {
                       "state" : ["is_empty","is_not_empty"],//NO I18N
                       "product" : ["is_empty","is_not_empty"],//NO I18N
                       "site" : ["is_empty","is_not_empty"]//NO I18N
                    };
                    break;
                case "vendor"://NO I18N
                    skipfield = {
                       "currency" : ["is_empty","is_not_empty"],//NO I18N
                       "name" : ["is_empty","is_not_empty"]//NO I18N
                    };
                    break;
                case "site"://NO I18N
                    skipfield = {
                       "city" : ["is_empty","is_not_empty"],//NO I18N
                       "postal_code" : ["is_empty","is_not_empty"],//NO I18N
                       "state" : ["is_empty","is_not_empty"],//NO I18N
                       "description" : ["is_empty","is_not_empty"],//NO I18N
                       "country" : ["is_empty","is_not_empty"]//NO I18N
                    };
                    break;
                case "user"://NO I18N
                     skipfield = {
                       "cost_per_hour" : ["is_empty", "is_not_empty"],//NO I18N
                       "description" : ["is_empty", "is_not_empty"],//NO I18N
                       "name" : ["is_empty", "is_not_empty"],//NO I18N
                       "purchase_approval_limit" : ["is_empty","is_not_empty"],//NO I18N
                       "type" : ["is_not","is_empty","is_not_empty","contains","not_contains","starts_with","ends_with"] //NO I18N
                     }
                    break;
                case "technician"://NO I18N
                    skipfield = {
                        "cost_per_hour" : ["is_empty", "is_not_empty"],//NO I18N
                        "description" : ["is_empty", "is_not_empty"],//NO I18N
                        "name" : ["is_empty", "is_not_empty"],//NO I18N
                        "purchase_approval_limit" : ["is_empty","is_not_empty"],//NO I18N
                        "associated_sites" : ["is_empty","is_not_empty"]//NO I18N
                    }
                    break;
            };
            return skipfield;
        },
        /** Reference enetity add criteria event **/
        referEntityAddCriteria: function() {
            let _self = this, isLayout = false;
            var refer = jQuery("#refer_entity").select2("data");//NO I18N
            this.referCriterOpt = [];
            if(!refer) {
                showalert("failure",translate("additional.reference.select"),"isAutoHide=false");//NO I18N
                return;
            }
            _self.options.entities_to_refer.value = [];
            renderhbs('#refer_criteria', 'form-refer-criteria', {"entities_to_refer": _self.options.entities_to_refer,"udfid":_self.options.layoutField.udfid,"layout":isLayout}, false, "additionalfields",false, false, function() { //No I18N
                    _self.options.entities_to_refer.value = refer;
                    jQuery("#refer_criteria").removeClass("hide");
                    var input_data = {
                        for: "udf_refer_entity_fields" // No I18N
                    };
                    sdpAjax({
                        url: "/api/v3/"+refer.api_plural_name+"/_metainfo",//NO I18N
                        async: false,
                        cache: false,
                        data: sdpAjaxInputData(input_data),
                        success: function(res) {
                            //For technician only showing the MSP account departments. No impact for SDP.
                            if(sdp_app.IS_MSP && refer.name === "technician") {
                                res.metainfo.fields.department.href += "?ACCOUNTID=" + sdp_app.MSP_ORG; //NO I18N
                            }
                            _self.options.entities_to_refer.criteria["metainfo"] = res.metainfo.fields;
                            var opt = {
                                "showNoError": true,//NO I18N
                                "metainfo": res.metainfo.fields,//NO I18N
                                "includeSubFields": ["users_udf_fields","ci_default_fields","cm_fields"], //No I18N
                                "ignoreTypes": ["Html","Attachment"], //No I18N
                                "haveOtherUDF": true //No I18N
                            };
                            opt["skipFieldTypeConditions"] = _self.criteriaCondition(refer.name);
                            opt["allowed_value"] = _self.criteriaCallback();//NO I18N
                            jQuery("#rule_criteria").custom_filter(opt);//NO I18N
                        }
                    });
                    initTooltip('#refer_criteria'); //No I18N
                    _self.refer_criteria_events(isLayout);
            });
        },
        /**
         * Get and set criteria data and append to innerHTML
         * **/
        getCriteriadata: function(data, type) {
            var groups = ["cm_fields"];
            var meta = this.options.entities_to_refer.criteria.metainfo;
            for(var i=0; i<data.length; i++) {
                if(data[i].values) {
                    var val = data[i].values;
                    var field = data[i].field;
                    for(var j=0; j<val.length; j++) {
                        if(type == "html" || type == "save") {
                            if(typeof val[j] === "string") {
                                try {
                                    var val_arr = JSON.parse(val[j]);
                                } catch(e){
                                    var val_arr = val[j];
                                }
                                val[j] = val_arr;
                            }
                        }
                        if(type == "form") {
                            if(typeof val[j] === "boolean") {
                                val[j] = val[j].toString();
                            }
                        }
                    }
                }
                if(type == "html" || type == "save") {
                    delete data[i].display_value;
                }
            }
            return data;
        },
        /**
         * Callback event for append innerHTML
         * **/
        criteriaInner: function() {
            var data = this.options.entities_to_refer.criteria.data;
            if(data) {
                data = this.getCriteriadata(data,"html"); //No I18N
                let meta = this.options.entities_to_refer.criteria.metainfo, udfKey = '';
                if(meta.hasOwnProperty('user_udf_fields')) {
                    udfKey = 'user_udf_fields'; //No I18N
                }
                else if(meta.hasOwnProperty('department_udf_fields')) {
                    udfKey = 'department_udf_fields'; //No I18N
                }
                else if(meta.hasOwnProperty('udf_fields')) {
                    udfKey = 'udf_fields'; //No I18N
                }

                if(meta.hasOwnProperty('technician_udf_fields')) {
                    udfKey = 'technician_udf_fields'; //No I18N
                }

                let args = [this.options.entities_to_refer.criteria.data, meta, meta, null];
                udfKey.length && args.push(udfKey);
                return CriteriaChildren.apply(null, args);
            }
        },
        criteriaWithId(cri) {
            let criteria = cri;
            function formatChild(criteria, hasChild) {
                for(var i = 0, len = criteria.length; i < len; i++) {
                    if(!!criteria[i].values) {
                        var ids = [];
                        for(var j =0, len1 = criteria[i].values.length; j < len1; j++) {
                            if(criteria[i].values[j] != null && criteria[i].values[j].id) {
                                ids.push(criteria[i].values[j].id);
                            } else {
                                ids.push(criteria[i].values[j]);
                            }
                        }
                        criteria[i].values = ids;
                    }
                    if(!!criteria[i].children) {
                        criteria[i].children = formatChild(criteria[i].children, true);
                    }
                }
                if(hasChild) {
                    return criteria;
                }
            }

            formatChild(criteria);
            return criteria;
        },
        /** Reference enetity save criteria event **/
        saveCriteriaSection: function() {
            let criteriaEle = jQuery("#rule_criteria");
            let getdata = criteriaEle.custom_filter("getFilterData");//NO I18N
            let hasError = criteriaEle.find('span.err').length > 0; //SD-109572 fix => check if advanced filter already showing error message or not
            if(hasError) return;
            if((!getdata || getdata.length == 0) && !hasError) {
                showalert("failure", translate("additional.reference.criteria.choose") ,"isAutoHide=false"); // NO I18N
                return;
            }
            this.options.entities_to_refer.criteria.data = getdata;
            this.options.entities_to_refer.criteria.is_added = true;
            var renderloadObj = {
                'sectionrender': true, //No I18N
                'pickOptionrender': true//NO I18N
            };
            this.udf.loadRender(this.udf.$udfform, renderloadObj); //render popup header and section, picklist option render in the above type present

        },
        /** Reference enetity close/cancel criteria event **/
        closeCriteriaSection: function() {
            jQuery("#refer_criteria").addClass("hide").html("");
        },
        /** Refer field select field change event **/
        refer_field_change: function($this) {
        	let _self = this;
			setTimeout(function() {
                _self.formpopupalign();
                //_self.editOptionVal();
                _self.udf.loadRender(_self, {
                    'pickOptionrender': true //No I18N
                }); //picklist option render
                _self.init_pickList_default_value_change();
                initTooltip('.form-group'); //No I18N
            }, 10);
			var layoutField = this.options.layoutField;
			if(this.options.layoutField.refer_field_value>0){
				this.options.disableRightsec=true;
				for(let i=0; i<this.options.refer_field_options.length; i++){
					if(this.options.layoutField.refer_field_value==this.options.refer_field_options[i].id){
						this.options.refer_field_value=this.options.refer_field_options[i];
					}
				}
			}
			else{
				this.options.disableRightsec=false;
				this.options.refer_field_value=undefined;
			}
			if(layoutField.allowed_values.length==0){
				jQuery('#popupRightSec').attr("style", ""); //No I18N
			}
			else{
				jQuery('#popupRightSec').attr("style", "pointer-events: none; opacity: 0.3;"); //No I18N
			}
            setTimeout(function() {
                initTooltip('#criteria-layout'); //No I18N
            }, 100)
        },
        /* Open preview panel of a field */
        fieldpreview: function() {
            var _self = this;
            this.popUpValid(jQuery("#fieldPopup")); //popup form validation
            if (jQuery("#fieldPopup").valid()) {

                var new_field = this.options.new_field;
                var layout_field = this.options.layoutField;
                var moduleName = this.options.module;
                var default_value = layout_field.default_value;
                var field_type = layout_field.display_type;

                var fixed_length = new_field.fixed_length;
                var allow_numbers_only = this.options.allow_numbers_only;

                var field_options = {"new_field":new_field,"layout_field":layout_field,"moduleName":moduleName,"default_value":default_value,"field_type":field_type,"fixed_length":fixed_length,"allow_numbers_only":allow_numbers_only};//NO I18N
                if(!this.formvalidfn(field_options)) {
                    return;
                }

                var lopt = cloneJson(layout_field);
                var apistatus = true;
                var list = {};
                if(field_type == "radio" || field_type == "checkbox" || field_type == "pick_list" || field_type == "multi_select") {//No I18N
                    if(jQuery('[dataid=pickListreferenceentity]').is(':checked')) {
                        lopt.allowed_values = [];
                        if(lopt.id == "new_field") {
                            if(jQuery("#refer_entity").length == 1) {
                                var refent = jQuery("#refer_entity").select2("data"); //NO I18N
                                refent = refent && refent.name ? refent.name : [];
                            } else {
                                refent = _self.options.entities_to_refer.value.name;
                            }
                            var ref = lopt;
                            var name = ref.fieldKey || "newfield"; //NO I18N
                            var ent_name = refent;
                        } else {
                            var ref = lopt.response;
                            var name = ref.name;
                            var ent_name = ref.reference_entity.name;
                        }

                        list = {
                            "module": { // No I18N
                                "name": _self.udf.options.selectRoute.entity_id ? _self.udf.options.selectRoute.entity_id : _self.udf.options.selectRoute.id // No I18N
                            },
                            "list_info": { // No I18N
                                "search_criteria": _self.options.entities_to_refer && _self.options.entities_to_refer.criteria.is_added ? _self.options.entities_to_refer.criteria.data : ref.criteria,//No I18N
                                "row_count": "100",//No I18N
                            },
                            "reference_entity": {"name" : ent_name}, // No I18N
                            "additional_attributes" : {"sort_order" : _self.options.entities_to_refer.sort_order}, // No I18N
                            "name" : name // No I18N
                        };

                        if(_self.udf.options.routeName === "cmdb") {
                            list.category = { name: "cmdb" }; // No I18N
                            list.module = undefined;
                        }

                            sdpAjax({
                                url: "/api/v3/udf_fields/reference_entity_preview",// No I18N
                                async: false,
                                cache: false,
                                data: sdpAjaxInputData(list),
                                success: function(res) {
                                    const av = res[name];
                                    if(av.length > 0) {
                                        lopt.allowed_values = av;
                                    }
                                    else {
                                        showalert('failure', translate('apicodes.21003'), 'isAutoHide=false'); // No I18N
                                        apistatus = false;
                                    }
                                },
                                error: function(res) {
                                    apistatus = false;
                                }
                            });
                    }
                }

                if(!apistatus) {
                    return;
                }

                var validation = {}, fName = 'fld_' + field_type; // No I18N
                lopt['field_name'] = fName;

                validation = _self.setValidationRules(field_type, lopt);

                jQuery('#preview_load').removeClass("hide");
                    jQuery('.formpopup-preview').animate({//No I18N
                        right : '0'//No I18N
                    }, 200, function() {
                        renderhbs('#preview-field', 'form-field-preview', lopt, false, "additionalfields", false, false, function(){//No I18N
                            const $prevForm = jQuery('#previewForm');
                            $prevForm.off('submit.af').on('submit.af', () => false); //No I18N
                            
                            if(field_type == "pick_list" || field_type == "multi_select") {//No I18N
                                var opt = {
                                    placeholder: translate("form.select.placeholder",[translate("common.options")]),
                                    formatResult: function(ui) {
                                        var siteref = "";
                                        if(ui.site && ui.site.name) {
                                            siteref = ', ' + ui.site.name;
                                        }
                                        return e_html(ui.name + siteref);
                                    },
                                    formatSelection: function(ui, b, c) {
                                        var siteref = "";
                                        if(ui.site && ui.site.name) {
                                            siteref = ', ' + ui.site.name;
                                        }
                                        return e_html(ui.name + siteref);
                                    }
                                };
                                if(field_type == "multi_select") {//No I18N
                                    opt["multiple"] = true;//No I18N
                                    opt["closeOnSelect"] = false; //No I18N
                                }
                                if(jQuery('[dataid=pickListreferenceentity]').is(':checked')) {
                                    var opt1 = {
                                        url: [{
                                            url: "/api/v3/udf_fields/reference_entity_preview",    //No I18N
                                            field: list.name,
                                            input_data_Callback: function(urlopt, listin) {
                                                var clonelist = cloneJson(list);
                                                if(listin.list_info && listin.list_info.search_criteria) {
                                                    if(!clonelist.list_info.search_criteria
                                                        ) {
                                                            clonelist.list_info.search_criteria = [];
                                                        }
                                                        clonelist.list_info.search_criteria.push(listin.list_info.search_criteria[0]);
                                                }
                                                clonelist.list_info.start_index = listin.list_info.start_index;
                                                return clonelist;
                                            }
                                            //list_info: list
                                        }],
                                        processResults:function(term,page){
                                            term.push(page);
                                        }
                                    };
                                    opt = jQuery.extend({}, opt1, opt);
                                    jQuery("[data-id=field_preview_input]").sdp_select2(opt);
                                } else {
                                    var al_val = [];
                                    if(typeof lopt.allowed_values == "string") {//110804 -- ESM directory allowe value's option render as string then convert to array using JSON parese
                                        try {
                                            lopt.allowed_values = JSON.parse(lopt.allowed_values);
                                        } catch(e){}
                                    }
                                    for(var j=0; j<lopt.allowed_values.length; j++) {
                                        if(!lopt.allowed_values[j].deleted) {
                                            al_val.push(lopt.allowed_values[j]);
                                        }
                                    }
                                    opt["data"] =  { results: al_val, text: 'name' }; //No I18N
                                    if(_self.options.pick_hasmorerows) {/** Allowed value have more than 100 "pick_hasmorerows" as true set in component based on this change to select2 as API based **/
                                        var url = "/api/v3/udf_fields/"+_self.options.layoutField.response.id+"/options";//No I18N
                                        var list_info = { "row_count": "100","start_index": "1"};//No I18N
                                        jQuery("[data-id=field_preview_input]").sdp_select2({
                                          url:[{
                                              url: url,
                                              field: "options",//No I18N
                                              list_info: list_info
                                          }],
                                          multiple: opt.multiple,
                                          closeOnSelect: opt.closeOnSelect
                                        });
                                    } else {
                                        jQuery("[data-id=field_preview_input]").select2(opt);
                                    }
                                    if(lopt.default_value) {
                                        jQuery("[data-id=field_preview_input]").select2("data", lopt.default_value); //no i18n
                                    }
                                }
                            }
                            if(field_type == "html" || field_type == "rich_text_area") {
                                if(lopt.buttonsToHide && lopt.buttonsToHide.length>1){
                                    lopt.buttonsToHide=lopt.buttonsToHide.split(" ");
                                }
                                zeditor({
                                    entity: lopt.entity,
                                    iframeheight: lopt.editorHeight,
                                    element: lopt.id+"_fieldpreview",//No I18N
                                    customName: lopt.id+"_fieldpreview",//No I18N
                                    ember: true,
                                    inlineimagesAPI: lopt.inlineimagesAPI,
                                    toolbar: "generalToolbar", // No I18N
                                    buttonsToHide:lopt.buttonsToHide,
                                    content:lopt.value,
                                    edithtml: lopt.edithtml,
                                    resizeOuterdiv: lopt.resizeOuterdiv,
                                    avoidMoreOption: lopt.avoidMoreOption,
                                    afterload: function() {
                                        if(lopt.disabled) {
                                            jQuery(window[lopt.id].editordiv).addClass("ui-opacity5 disableDiv")
                                            .find(".ze_SCmb").css("opacity", 0.6).end()
                                            .find("iframe.ze_area").css("background", "#F3F3F3");//No I18N
                                            window[lopt.id] && window[lopt.id].doc && window[lopt.id].doc.body.removeAttribute("contenteditable");//No I18N
                                        }
                                    }
                                });
                            }
                            else if (field_type == "checkbox" || field_type == "radio") {
                                initTooltip('#preview_load'); //No I18N
                            }
                            else if(field_type === 'date' || field_type === 'date/time') {
                                $prevForm.find('#dateField_preview_Display').off('focus.af').on('focus.af', () => {
                                    $prevForm.find('#openDateField').trigger('click');
                                });

                                const args = ['dateField_preview', null, null, null, null, null, null, null, null, null, null, null, null, null];
                                const dateOpt = {
                                    calendarType: (field_type == 'date/time' ? 'datetime' : 'date'),// No I18N
                                    close: () => {
                                        $prevForm.find('#dateField_preview_Display').trigger('blur');
                                    }
                                };
                                args[14] = dateOpt;
                                $prevForm.find('#openDateField').off('click.af').on('click.af', () => { // No I18N
                                    initCalendar.apply(window, args);
                                });
                            }
                            else if(field_type === 'file_upload') {
                                $prevForm.find('#openAttachField').off('click.af').on('click.af', (evt) => {
                                    evt.preventDefault();
                                });
                            }

                            _self.popUpValid(jQuery('#previewForm'), validation);
                        });
                    });
            }
        },

        setValidationRules(field_type, lopt) {
            cl_form.addRules();
            var validation = {}, errRules = {}, errMessages = {};
            var new_field = this.options.new_field;
            var layout_field = this.options.layoutField;
            var fName = lopt.field_name;

            if(field_type == "numeric" || field_type == "single_line") {
                errRules.noBlankSpace = true;
                var min_length = new_field.hasOwnProperty('min_length') ? new_field.min_length : ((layout_field.response && layout_field.response.additional_attributes) ? layout_field.response.additional_attributes['min-len'] : layout_field['min_length']); //No I18N
                var max_length = new_field.hasOwnProperty('max_length') ? new_field.max_length : ((layout_field.response && layout_field.response.additional_attributes) ? layout_field.response.additional_attributes['max-len'] : layout_field['max_length']); //No I18N
                var max_lengthlimit = layout_field.config && layout_field.config.sline_char_limit ? BigInt(layout_field.config.sline_char_limit) : 250;
                var length, allow_numbers_only = this.options.allow_numbers_only;

                min_length ? BigInt(min_length) : min_length;
                max_length ? BigInt(max_length) : max_length;

                if(field_type == "single_line") {

                    if(field_type == "single_line") {
                        if(!max_length) {
                            max_length = max_lengthlimit;
                        }

                        if(allow_numbers_only) {
                            errRules.regex = /^\d+$/;
                            errMessages.regex = translate("sdp.common.invalidnumber");	//No I18N
                        }
                    }

                    if (min_length && max_length && min_length == max_length) {
                        length = min_length;
                        max_length = null;
                        min_length = null;
                    }

                    if(length) {
                        errRules.length = length;
                        errMessages.length = translate("form.character.exactlength.alert", [ length ]);	//No I18N
                    }

                    if(!length && max_length) {
                        var key = allow_numbers_only ? "form.digits.maximumlength.alert" : "form.character.maximumlength.alert"; //No I18N
                        errRules.max_length = max_length;
                        errMessages.max_length = translate(key, [ max_length ]);
                        lopt['max_length'] = max_length;
                    }

                    if(!length && min_length) {
                        var key = allow_numbers_only ? "form.digits.minimumlength.alert" : "form.character.minimumlength.alert"; //No I18N
                        errRules.min_length = min_length;
                        errMessages.min_length = translate(key, [ min_length ]);
                    }
                }
                else if(field_type == "numeric") {  //No I18N
                    var max_value = max_length, min_value = min_length;
                    errRules.regex = /^[-,+]{0,1}\d+$/;
			              errMessages.regex = translate("sdp.common.invalidnumber");	//No I18N
                    if(max_value && min_value) {
                        min_value = String(min_value).length < 16 ? Number(min_value) : BigInt(min_value);
                        max_value = String(max_value).length < 16 ? Number(max_value) : BigInt(max_value);
                        if (Number.isSafeInteger(min_value) && Number.isSafeInteger(max_value)) {
                            errRules.max = max_value;
                            errRules.min = min_value;
                            errMessages.max = errMessages.min = translate("form.value.rangevalue.alert", [min_value, max_value]); // No I18N
                        } else if (Number.isSafeInteger(min_value) && !Number.isSafeInteger(max_value)) {
                            errRules.max_bigint = max_value;
                            errRules.min = min_value;
                            errMessages.max_bigint = errMessages.min = translate("form.value.rangevalue.alert", [min_value, max_value]); // No I18N
                         } else {
                            errRules.max_bigint = max_value;
                            errRules.min_bigint = min_value;
                            errMessages.max_bigint = errMessages.min_bigint = translate("form.value.rangevalue.alert", [min_value, max_value]); // No I18N
                        }
                    } else if(max_value) {
                        max_value = String(max_value).length < 16 ? Number(max_value) : BigInt(max_value);
                        if (Number.isSafeInteger(max_value)) {
                            errRules.max = max_value;
                            errMessages.max = translate("ae.asset.max.num.limit", [max_value]); // No I18N
                        } else {
                            errRules.max_bigint = max_value;
                            errMessages.max_bigint = translate("ae.asset.max.num.limit", [max_value]); // No I18N
                        }
                    } else if(min_value) {
                        min_value = String(min_value).length < 16 ? Number(min_value) : BigInt(min_value);
                        if (Number.isSafeInteger(min_value)) {
                            errRules.min = min_value;
                            errMessages.min = translate("ae.asset.min.num.limit", [min_value]); // No I18N
                        } else {
                            errRules.min_bigint = min_value;
                            errMessages.min_bigint = translate("ae.asset.min.num.limit", [min_value]); // No I18N
                        }
                    }
                }
            }
            else if(field_type === "multi_line") {  //No I18N
                errRules.noBlankSpace = true;
            }
            else if (field_type == "url") {  //No I18N
                errRules.url2 = true;
                errMessages.url2 = translate("sdp.home.ssp.customization.msg.urlinvalid");	//No I18N
                errRules.max_length = 500;
                errMessages.max_length = translate("form.character.maximumlength.alert", ['500']);
                lopt['max_length'] = 500;
            } else if (field_type == "phone") {  //No I18N
                errRules.regex = /^([0-9A-Za-z\-\(\)\ \+])+$/;
                errMessages.regex = translate("ads.login.twofactor.enter_valid_phone_number");	//No I18N
                errRules.max_length = 30;
                errMessages.max_length = translate("form.character.maximumlength.alert", ['30']);
                lopt['max_length'] = 30;
            } else if (field_type == "percentage") {  //No I18N
                errRules.regex = /^[+-]?\d{0,5}(?:\.\d{1,2})?$/;
                errMessages.regex = translate("form.decimal.msg", [5, 2]);	//No I18N
            } else if (field_type == "email") {  //No I18N
                errRules.regex = /^[\w]([\w\-\.\+\'\/]*)@([\w\-\.]*)(\.[a-zA-Z]{2,22}(\.[a-zA-Z]{2}){0,2})$/;
                errMessages.regex = translate("sdp.common.email.id.invalid");	//No I18N
                errRules.max_length = 100;
                errMessages.max_length = translate("form.character.maximumlength.alert", ['100']);
                lopt['max_length'] = 100;
            } else if(field_type == "decimal") {  //No I18N
                var precision, selector = 'select[name="decimal_digit"]'; //No I18N
                if(jQuery(selector).length == 0) {
                    precision = layout_field.response && layout_field.response.additional_attributes && layout_field.response.additional_attributes.precision ? layout_field.response.additional_attributes.precision : layout_field.precision || "2";
                } else {
                    precision = jQuery(selector).val();
                }

                errRules.regex = "^[+-]?\\d{0,13}(?:\\.\\d{1," + precision + "})?$"; //No I18N
                errMessages.regex = translate('form.decimal.msg', ['13', '' + precision]); //No I18N
            } else if(field_type == "boolean") { //No I18N
                lopt['boolean_checked'] = jQuery('input[name="default_value_decision"]').is(':checked') ? "checked" : "unchecked"; //No I18N
            } else if(field_type == "date" || field_type == "date/time") { //No I18N
                lopt['calendarType'] = field_type == "date/time" ? "datetime" : "date"; // No I18N
                let display_date;

                if(typeof new_field.default_value == "string") {
                    display_date = new_field.default_value;
                }
                else if(lopt.default_value) {
                    display_date = lopt.default_value.display_value ? lopt.default_value.display_value : getFormattedDateTime(new Date(parseInt(lopt.default_value.value) + getTimezoneDifference(parseInt(lopt.default_value.value))), true);
                }
                else {
                    display_date = null;
                }

                if(display_date == "$(created_time)") {
                    display_date = getFormattedDateTime(new Date(), false);
                }
                lopt['display_date'] = display_date; // No I18N
            }

            if(!jQuery.isEmptyObject(errRules)) {
                validation.rules = {};
                validation.rules[fName] = jQuery.extend( {}, {}, errRules );
            }

            if(!jQuery.isEmptyObject(errMessages)) {
                validation.messages = {};
                validation.messages[fName] = jQuery.extend( {}, {}, errMessages )
            }
            return validation;
        },
        /* close the preview panel */
        fieldpreviewclose: function() {
            jQuery('#preview_load .formpopup-preview').animate({
                right : '-100%'
            }, 200, function() {
                jQuery('#preview_load').addClass("hide");
            });
        },
        emberSet: function(field, options, value) {
            Ember.set(field,options,value);
        },
        emberGet: function(field, options) {
            return Ember.get(field,options);
        }
        /*** New function end **/
    },
    /*UDF Form popup End (code get from release module admin/additional-field/edit/controller.js file)*/
    /*UDF Customization form page start (code get from release module components/form-settings/component.js file)*/
    $udfformsettings: {
        defoptions: {
            type: '',
            // Available font Sizes to be listed in the drop down
            fontSize: [{
                    "id": "12px", //No I18N
                    "name": "12px" //No I18N
                },
                {
                    "id": "13px", //No I18N
                    "name": "13px" //No I18N
                },
                {
                    "id": "14px", //No I18N
                    "name": "14px" //No I18N
                },
                {
                    "id": "15px", //No I18N
                    "name": "15px" //No I18N
                }
            ],
            // Available font families to be listed in the drop down
            fontFamilies: [{
                    "id": "Serif", //No I18N
                    "name": "Serif", //No I18N
                    "style": "Serif, Arial" //No I18N
                },
                {
                    "id": "Arial", //No I18N
                    "name": "Arial", //No I18N
                    "style": "Arial, Verdana" //No I18N
                },
                {
                    "id": "Courier New", //No I18N
                    "name": "Courier New", //No I18N
                    "style": "Courier New, Arial" //No I18N
                },
                {
                    "id": "Georgia", //No I18N
                    "name": "Georgia", //No I18N
                    "style": "Georgia, Arial" //No I18N
                },
                {
                    "id": "Tahoma", //No I18N
                    "name": "Tahoma", //No I18N
                    "style": "Tahoma, Arial" //No I18N
                },
                {
                    "id": "Times New Roman", //No I18N
                    "name": "Times New Roman", //No I18N
                    "style": "Times New Roman, Arial" //No I18N
                },
                {
                    "id": "Trebuchet", //No I18N
                    "name": "Trebuchet", //No I18N
                    "style": "Trebuchet MS, Arial" //No I18N
                },
                {
                    "id": "Verdana", //No I18N
                    "name": "Verdana", //No I18N
                    "style": "Verdana, Arial" //No I18N
                },
                {
                    "id": "Roboto", //No I18N
                    "name": "Roboto", //No I18N
                    "style": "Roboto, Arial" //No I18N
                },
                {
                    "id": "Comic Sans MS", //No I18N
                    "name": "Comic Sans MS", //No I18N
                    "style": "Comic Sans MS', Arial" //No I18N
                },
                {
                    "id": "Calibri", //No I18N
                    "name": "Calibri", //No I18N
                    "style": "Calibri, Arial" //No I18N
                },
                {
                    "id": "ZohoPuvi", //No I18N
                    "name": "Zoho Puvi", //No I18N
                    "style": "Zoho Puvi, Arial" //No I18N
                }
            ],
            // Default font if user didnt select any font
            defaultFont: {
                "id": "Roboto", //No I18N
                "name": "Roboto" //No I18N
            },
            // Default font size
            defaultFontSize: {
                "id": "13px", //No I18N
                "name": "13px" //No I18N
            },
            // This function is called when there is a change in the field values
        },
        // This function is called when there is a change in the field values
        value_chng: function($this, prop, type) {
            this.options.type = type; //No I18N
            var style = (type == "header") ? 'section_style' : (type == "section" || type == "form") ? 'field_style' : ''; //No I18N
            var options = this.udf.$udfform.options;
            var lfield = (options.popupType == 'form') ? options.parent.model.style_properties[style] : (options.popupType == 'field') ? options.new_field.style_properties : options.section_form.style_properties[style];

            var val = jQuery($this).select2('data'); //No I18N
			var fieldval = (prop == "font_family") ? val.style : val.name;// No I18N
            Ember.set(lfield, prop, fieldval);
        },
        // This action is triggered when Field align Radio button is clicked
        label_align_chng: function(value, type) {
            this.options.type = type; //No I18N
            jQuery(".alignOptions li").removeClass("active"); // No I18N
            jQuery(".alignOptions ." + value).addClass("active"); // No I18N

            var style = (type == "header") ? 'section_style' : (type == "section" || type == "form") ? 'field_style' : ''; // No I18N
            var options = this.udf.$udfform.options;
            var lfield = (options.popupType == 'form') ? options.parent.model.style_properties[style] : options.section_form.style_properties[style];
            Ember.set(lfield, 'field_align', value); // No I18N
        },
        // This action is triggered when color picker is opened
        bg_colorpicker: function(pickerId, buttonId, typeClr, type) {
            this.options.type = type; //No I18N
            var picker = jQuery("#" + pickerId + "_" + type), // No I18N
                inputBox = jQuery("#" + buttonId + "_" + type).siblings('input'), // No I18N
                button = $("formBg_colorpicker"), // No I18N
                rightOffset = 'initial', // No I18N
                _self = this,
                setBgColor = function(color) {
                    color = (color === 'none' || color === 'transparent') ? '' : color; // No I18N
                    inputBox.val(color).trigger('change'); // No I18N
                    bgColor = color;

                    var style = (type == "header") ? 'section_style' : (type == "section" || type == "form") ? 'field_style' : ''; //No I18N
                    var options = $udfcommon.$udfform.options;
                    var sprop = (options.popupType == 'form') ? options.parent.model.style_properties[style] : (options.popupType == 'field') ? options.new_field.style_properties : options.section_form.style_properties[style];
                    color = color == "" ? typeClr == 'bg_color' ? "#ffffff" : "#000000" : color; //No I18N
                    if (typeClr == 'bg_color') {
                        Ember.setProperties(sprop, {
                            'bg_color': color //No I18N
                        });
                    } else if (typeClr == 'label_color') { //No I18N
                        Ember.setProperties(sprop, {
                            'label_color': color //No I18N
                        });
                    }

                    if (typeClr == 'bg_color') {
                        jQuery('#formBg_colorpicker_' + type).css('background-color', color).attr('data-color-attr', color); //No I18N
                    } else if (typeClr == 'label_color') { //No I18N
                        jQuery('#form_labelColorpicker_' + type).css('background-color', color).attr('data-color-attr', color); //No I18N
                    }
                };
            if (typeClr == 'bg_color') {
                var bgColor = jQuery('#formBg_colorpicker_' + type).attr('data-color-attr');
            } else if (typeClr == 'label_color') { //No I18N
                var bgColor = jQuery('#form_labelColorpicker_' + type).attr('data-color-attr');
            }
            picker.zcolorpicker("destroy"); // No I18N
            if (pickerId.indexOf("label") != -1 && type != "field") { // No I18N
                rightOffset = '0px'; // No I18N
            }
            // Initialising Zohocomponents Colorpicker
            jQuery('#' + pickerId + "_" + type).zcolorpicker({ // No I18N
                "valueColorModel": "hex", // No I18N
                "defaultColorButton": false, //No I18N
                'advancedPickerOptions': { // No I18N
                    'opacity': false, // No I18N
                    'OKButtonLabel': window.translate('sdp.common.ok') // No I18N
                },
                'offset': { // No I18N
                    'right': rightOffset // No I18N
                },
                'opacity': false, // No I18N
                'otherUsedColors': false // No I18N
            });
            // Linking the colorpicker to open on click of the color button
            picker.zcolorpicker('setAttribute', 'forElement', button); // No I18N
            if (picker.is(':visible')) { // No I18N
                picker.zcolorpicker('close'); // No I18N
            } else {
                // Set color when change in the colorpicker
                picker.off('zcolorpickerchange').on('zcolorpickerchange', function(origEvent) { // No I18N					
                    var data = origEvent.detail;
                    setBgColor(data.color);
                });
                if(bgColor == "") {/*106520 -- 'No fill' click bgcolor value return empty string, now change to #fff*/
                    bgColor = typeClr == "bg_color" ? "#ffffff" : "#000000"; // No I18N
                }
                picker.zcolorpicker('setAttribute', 'value', bgColor); // No I18N
                picker.zcolorpicker('open'); // No I18N
            }
            // Preventing button click event from refreshing the page
            jQuery('#' + pickerId + "_" + type + " button").on('click', function(e) { // No I18N
                e.preventDefault();
            })
        },
        // Action to be called when Bold button is clicked
        font_decoration: function(buttonClass, type) {
            this.options.type = type; //No I18N
            var parent = ""; // No I18N
            if (type == "header") { // No I18N
                parent = ".header_customization"; // No I18N
            } else if (type == "section" || type == "form") { // No I18N
                parent = ".label_customization"; // No I18N
            }
            jQuery(parent + ' .' + buttonClass).toggleClass('btn-primary'); // No I18N

            var style = (type == "header") ? 'section_style' : (type == "section" || type == "form") ? 'field_style' : ''; //No I18N
            var options = this.udf.$udfform.options;
            var lfield = (options.popupType == 'form') ? options.parent.model.style_properties[style] : (options.popupType == 'field') ? options.new_field.style_properties : options.section_form.style_properties[style];
            if (jQuery(parent + ' .' + buttonClass).hasClass('btn-primary')) { // No I18N
                Ember.set(lfield, 'font_weight', 'bold'); // No I18N
            } else {
                Ember.set(lfield, 'font_weight', 'normal'); // No I18N
            }
			setTimeout(function() {
				var fieldId = options.layoutField.id.startsWith("roles.") ? options.layoutField.initial_value.options_display.rolestaticid : options.layoutField.id; // No I18N
				jQuery('[data-field-id=' + fieldId + ']').addClass('active');
			},5);
        },
        editFormfn: function(opt) {
            var _self = this.udf.$udfform.options;
            var self = this;
            var selfopt = this.options;

            function renderInnerPick1() {
                self.udf.$udfform.cusSelect2fn('section_style', self); //No I18N
                function renderInnerPick2() {
                    self.udf.$udfform.cusSelect2fn('field_style', self); //No I18N
                    opt.disableMaxWidth && (jQuery('#formMaxWidth').prop('disabled', true)); //No I18N
                    setTimeout(function() {
                        let align = jQuery("#requestTemplateContent").attr("data-label-align") || "right"; // No I18N
                        jQuery(".alignOptions li").removeClass("active"); // No I18N
                        jQuery(".alignOptions .option." + align).addClass('active'); // No I18N
                    }, 100);
                }

                var styleprop = _self.parent.model.style_properties.field_style;
                var font_family = styleprop.font_family || "Roboto"; //No I18N
                var font_size = styleprop.font_size || "13px"; //No I18N
                var bold = styleprop.font_weight || 'normal'; //No I18N
                var color = styleprop.label_color || "#000000";
                var bgColor = styleprop.bg_color || "#ffffff"; //No I18N
                jQuery.each(styleprop, function(i, val) {
                    Ember.set(styleprop, i, val)
                });

                styleprop = {
                    'bg_color': bgColor, //No I18N
                    'font_family': font_family, //No I18N
                    'font_size': font_size, //No I18N
                    'font_size': font_size, //No I18N
                    'font_weight': bold, //No I18N
                    'label_color': color //No I18N
                };

                Ember.setProperties(self, {
                    'options': _self.form_options, //No I18N
                    'type': 'form', //No I18N
                    'updateData': 'updateFormProperties', //No I18N
                    'layoutColField': styleprop, //No I18N
                    'sec_index': _self.parent.cur_sec_index, //No I18N
                    'popUpType': _self.popupType //No I18N
                });
                renderhbs('[data-name=form_options]', 'form-settings-template', self, false, "additionalfields", false, false, renderInnerPick2); //form setting for 'Customization' tab//No I18N
            }
            var styleprop = _self.parent.model.style_properties.section_style;
            var font_family = styleprop.font_family || "Roboto"; //No I18N
            var font_size = styleprop.font_size || "15px"; //No I18N
            var bold = styleprop.font_weight || 'bold'; //No I18N
            var color = styleprop.label_color || "#000000";
            var bgColor = styleprop.bg_color || "#ffffff"; //No I18N
            jQuery.each(styleprop, function(i, val) {
                Ember.set(styleprop, i, val)
            });

            styleprop = {
                'bg_color': bgColor, //No I18N
                'font_family': font_family, //No I18N
                'font_size': font_size, //No I18N
                'font_size': font_size, //No I18N
                'font_weight': bold, //No I18N
                'label_color': color //No I18N
            };

            Ember.setProperties(self, {
                'options': _self.header_options, //No I18N
                'type': 'header', //No I18N
                'updateData': 'updateFormProperties', //No I18N
                'layoutColField': styleprop, //No I18N
                'sec_index': _self.parent.cur_sec_index, //No I18N
                'popUpType': _self.popupType //No I18N
            });

            renderhbs('[data-name=header_options]', 'form-settings-template', self, false, "additionalfields", false, false, renderInnerPick1); //form setting for 'Customization' tab//No I18N
        },
        customizationTabRender: function(tabName) {
            var _self = this.udf.$udfform.options;
            var self = this;
            if (_self.popupType == 'field') {
                function renderInnerPick1() {
                    self.udf.$udfform.cusSelect2fn('style_properties', self); //No I18N
                    setTimeout(function() {
                        var activeField = (_self.layoutField.rolesid == "rolestab") ? '[data-roles-id=' + _self.layoutField.rolestaticid + ']' : '[data-field-id=' + _self.layoutField.id + ']'; //No I18N
                        jQuery(activeField).addClass('active');
                    }, 100);
                }
				if(_self.new_field.style_properties == undefined || _self.layoutField.style_properties == undefined) {
					_self.new_field.style_properties = {};
					_self.layoutField.style_properties = {};
				}
                var styleprop = _self.new_field.style_properties;

                var styleprop1 = (_self.parent.layouts[_self.parent.cur_sec_index].style_properties == undefined || jQuery.isEmptyObject(_self.parent.layouts[_self.parent.cur_sec_index].style_properties.field_style)) ? _self.parent.model.style_properties.field_style : _self.parent.layouts[_self.parent.cur_sec_index].style_properties.field_style;
                var font_family = styleprop.font_family || styleprop1.font_family || "Roboto"; //No I18N
                var font_size = styleprop.font_size || styleprop1.font_size || "13px"; //No I18N
                var bold = styleprop.font_weight || styleprop1.font_weight || 'normal'; //No I18N
                var color = styleprop.label_color || styleprop1.label_color || "#000000";
                var bgColor = styleprop.bg_color || styleprop1.bg_color || "#ffffff"; //No I18N

                jQuery.each(styleprop, function(i, val) {
                    Ember.set(styleprop, i, val)
                });

                styleprop = {
                    'bg_color': bgColor, //No I18N
                    'font_family': font_family, //No I18N
                    'font_size': font_size, //No I18N
                    'font_size': font_size, //No I18N
                    'font_weight': bold, //No I18N
                    'label_color': color //No I18N
                };

                Ember.setProperties(self, {
                    'options': _self.field_options, //No I18N
                    'updateData': 'updateFormProperties', //No I18N
                    'layoutColField': styleprop, //No I18N
                    'sec_index': _self.parent.cur_sec_index, //No I18N
                    'col_index': _self.parent.cur_col_index, //No I18N
                    'field_index': _self.parent.cur_field_index, //No I18N
                    'popUpType': _self.popupType, //No I18N
                    'row_index': parent.cur_row_index, //No I18N
                    'type': 'field' //No I18N
                });
                renderhbs('[data-name=label_customization]', 'form-settings-template', self, false, "additionalfields", false, false, renderInnerPick1); //form setting for 'Customization' tab//No I18N
            } else if (_self.popupType == 'section') { //No I18N
                function renderInnerPick1() {
                    self.udf.$udfform.cusSelect2fn('section_style', self); //No I18N
                    var styleprop = _self.section_form.style_properties.field_style;
                    var styleprop1 = jQuery.isEmptyObject(styleprop) ? _self.parent.model.style_properties.field_style : styleprop;
                    var align = styleprop.field_align || styleprop1.field_align || "right"; //106515 -- section field align input get  // No I18N

                    function renderInnerPick2() {
                        self.udf.$udfform.cusSelect2fn('field_style', self); //No I18N
                        setTimeout(function() {
                            jQuery(".alignOptions li").removeClass("active"); // No I18N
                            jQuery(".alignOptions .option." + align).addClass('active'); // No I18N
                            jQuery('[data-section-index=' + _self.parent.cur_sec_index + ']').addClass('selected');
                        }, 100);
                    }
                    var font_family = styleprop1.font_family || "Roboto"; //No I18N
                    var font_size = styleprop1.font_size || "13px"; //No I18N
                    var bold = styleprop1.font_weight || 'normal'; //No I18N
                    var color = styleprop1.label_color || "#000000";
                    var bgColor = styleprop1.bg_color || "#ffffff"; //No I18N
                    jQuery.each(styleprop1, function(i, val) {
                        Ember.set(styleprop, i, val)
                    });

                    styleprop = {
                        'bg_color': bgColor, //No I18N
                        'font_family': font_family, //No I18N
                        'font_size': font_size, //No I18N
                        'font_size': font_size, //No I18N
                        'font_weight': bold, //No I18N
                        'label_color': color //No I18N
                    };

                    Ember.setProperties(self, {
                        'options': _self.section_options, //No I18N
                        'type': 'section', //No I18N
                        'updateData': 'updateFormProperties', //No I18N
                        'layoutColField': styleprop, //No I18N
                        'sec_index': _self.parent.cur_sec_index, //No I18N
                        'popUpType': _self.popupType //No I18N
                    });
                    renderhbs('[data-name=section_options]', 'form-settings-template', self, false, "additionalfields", false, false, renderInnerPick2); //form setting for 'Customization' tab//No I18N
                }
                var styleprop = _self.section_form.style_properties.section_style;

                var styleprop1 = jQuery.isEmptyObject(styleprop) ? _self.parent.model.style_properties.section_style : styleprop;
                var font_family = styleprop1.font_family || "Roboto"; //No I18N
                var font_size = styleprop1.font_size || "15px"; //No I18N
                var bold = styleprop1.font_weight || 'bold'; //No I18N
                var color = styleprop1.label_color || "#000000";
                var bgColor = styleprop1.bg_color || "#ffffff"; //No I18N

                jQuery.each(styleprop1, function(i, val) {
                    Ember.set(styleprop, i, val)
                });

                styleprop = {
                    'bg_color': bgColor, //No I18N
                    'font_family': font_family, //No I18N
                    'font_size': font_size, //No I18N
                    'font_size': font_size, //No I18N
                    'font_weight': bold, //No I18N
                    'label_color': color //No I18N
                };

                Ember.setProperties(self, {
                    'options': _self.header_options, //No I18N
                    'type': 'header', //No I18N
                    'updateData': 'updateFormProperties', //No I18N
                    'layoutColField': styleprop, //No I18N
                    'sec_index': _self.parent.cur_sec_index, //No I18N
                    'popUpType': _self.popupType //No I18N
                });
                renderhbs('[data-name=header_options]', 'form-settings-template', self, false, "additionalfields", false, false, renderInnerPick1); //form setting for 'Customization' tab//No I18N
            }
        },
    },
    /*UDF Customization form page end (code get from release module components/form-settings/component.js file)*/

    /*UDF Import page start (code get from release module components/import-options/component.js file)*/
    $udfimportoptions: {
        defoptions: {
            selSheet: null,
        },
        //selSheet:null,
        /*sample xls json:
        {"sheets":[{"name":"Sheet1","id":"Sheet1","rows":[["HP","120"],["MAC","240"],["DELL","120"],["LENOVO","100"],["SONY","250"]]}]}
        */

        checkFieldType: function(value, type) {
            var validDataType = true,
                result;

            if (type == 'number') {
                result = value.match('^([0-9]+(\.[0-9][0-9])|[0-9]+)$');
                validDataType = (result && result.length > 0);
            }
            return validDataType;
        },

        populateRows: function(sheetRows) {
            if (sheetRows.length > 0) {
                var columns = sheetRows[0],
                    obj;
                var colArr = [],
                    col_id;
                for (i = 0; i < columns.length; i++) {
                    col_id = 'col_' + i; //NO I18N
                    obj = {
                        'id': col_id, //No I18N
                        'name': columns[i], //No I18N
                        'order': i //No I18N
                    };
                    colArr.push(obj);
                }
                this.defoptions['noRows'] = false; //NO I18N
                this.defoptions['sheetColumns'] = colArr; //NO I18N
                this.defoptions['sheetRows'] = sheetRows; //NO I18N
            } else {
                this.defoptions['noRows'] = true; //NO I18N
            }
        },

        checkColumnsMapping: function() {
            var fields = this.defoptions.option_fields,
                isColumnsMapped = true;
            for (var i = 0; i < fields.length; i++) {
                if (fields[i].column == undefined) {
                    isColumnsMapped = false;
                    break;
                }
            }

            if (!isColumnsMapped) {
                showalert('failure', translate('map.columns.msg'), 'isAutoHide=false'); // No I18N
                return false;
            }
            return true;
        },

        onSheetsChange: function($this) {
            var xs = this.defoptions.xlsJson;
            var sel = jQuery($this).select2('data'); // No I18N
            var value;
            for (var i = 0; i < xs.length; i++) {
                if (xs[i].id == sel.id) {
                    value = xs[i];
                }
            }
            this.populateRows(value.rows);
            this.udf.$udfform.defaultOptSelect2(this.defoptions.sheetColumns, this.defoptions.sheetColumns[0], jQuery('[name=fieldNo]'));
        },

        //construct options from xls json returned from the servlet
        /*
        sheet rows- [["HP","120"],["DELL","120"],["LENOVO","100"]]
        option_fields-[{"id":"name","name":"Name","column":{"id":"col_0","name":"HP","order":0}},{"id":"cost","name":"Cost","column":{"id":"col_1","name":"120","order":1}}]
        */
        importOptions: function() {
            var fno = jQuery('[name=fieldNo]').select2('data'); // No I18N
            var obj = {
                'id': 'col_' + fno.order, //No I18N
                'name': fno.name, //No I18N
                'order': fno.order //No I18N
            };
            this.defoptions.option_fields[0]['column'] = obj;

            var sheetRows = this.defoptions.sheetRows,
                sheetRow, options = [],
                field, optionObj = {};;
            var option_fields = this.defoptions.option_fields,
                value, mandatoryAttr;

            if (this.checkColumnsMapping()) {
                for (var i = 1; i < sheetRows.length; i++) {
                    sheetRow = sheetRows[i];
                    optionObj = {}, mandatoryAttr = true;
                    for (var j = 0; j < option_fields.length; j++) {
                        field = option_fields[j];
                        if (field.column.order !== undefined) {
                            value = sheetRow[field.column.order];
                            if (value && this.checkFieldType(value, field.type)) {
                                optionObj[field.id] = value;
                            }

                            if (field.mandatory && (value == undefined || value.trim().length == 0)) {
                                mandatoryAttr = false;
                                break;
                            }
                        }
                    }
                    if (this.defoptions.copyIdsFrom) {
                        optionObj.id = optionObj[this.defoptions.copyIdsFrom] + '_id';
                    }
                    var dublicateobj = true; //Skip dublicate name append to option list
                    for (var j = 0; j < options.length; j++) {
                        if (options[j].name == optionObj.name) {
                            dublicateobj = false;
                        }
                    }
                    if (mandatoryAttr && dublicateobj) {
                        options.push(optionObj);
                    }
                }
                this.udf.$udfform.updateImportedOptions(options);
            }
        },

        cancelImport: function() {
            this.udf.$udfform.cancelImport();
        },

        onChangeXLSFile: function() {
            if (this.defoptions.xlsSheets.length > 0) {
                this.defoptions['selSheet'] = this.defoptions.xlsSheets[0];
                this.populateRows(this.defoptions.selSheet.rows);
            }
        },
        setXLSJsonLatest: function(xls_json, xlsSheetName, cntrl) { //Render handlebar
            var _self = this;
            //Import option initalize value
            this.defoptions['selSheet'] = xls_json[0];
            this.populateRows(xls_json[0].rows);

            var optionFields = [{
                "id": "name", //No I18N
                "mandatory": true, //No I18N
                "type": "string", //No I18N
                "name": translate("sdp.common.name") //No I18N
            }];

            _self.udf.$udfform.options['showImportWizard'] = true; // No I18N
            this.defoptions['xlsJson'] = xls_json; // No I18N
            this.defoptions['xlsSheetName'] = xlsSheetName; // No I18N
            this.defoptions['xlsSheets'] = xls_json; // No I18N
            this.defoptions['option_fields'] = optionFields; // No I18N
            this.defoptions['copyIdsFrom'] = 'name'; // No I18N

            function renderInnerPick() {
                renderhbs('[data-id=import]', 'import-options', _self.defoptions, false, "additionalfields"); //No I18N
                setTimeout(function() {
                    _self.udf.$udfform.field_apikey_value_change(); //input key event
                    _self.udf.$udfform.adjustPopupHeight();

                    _self.udf.$udfform.defaultOptSelect2(_self.defoptions.xlsSheets, _self.defoptions.selSheet, jQuery('#sheetNo'));
                    _self.udf.$udfform.defaultOptSelect2(_self.defoptions.sheetColumns, _self.defoptions.sheetColumns[0], jQuery('[name=fieldNo]'));
                }, 100);
            }
            renderhbs('.formpopup-queswrapper', 'form-content-section', _self.udf.$udfform.options, false, "additionalfields", false, false, renderInnerPick, false, true); // NO I18N
            _self.udf.$udfform.init_pickList_default_value_change(); //No I18N
        },
    },
};

