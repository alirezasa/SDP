/* $Id$ */
var $problemDetails = jQuery.extend(true, $problemCommon, (function () {
    var probDetails = {
        // Initializes Details Component of details page
        init: function (options) {
            try {
                renderhbs('#problem-section', 'problem_detail_section', null, false, 'problems');//No I18N
                //This object helps to find from which page, form is invoked
                //Fix SD-98473
                jQuery('body').addClass("pos-rel"); // No I18N
                var _self = this;
                /* Set the basic properties required for all methods */
                _self.initialize(options);
                _self.externalframe = options.externalframe;
                _self.printPreview = window.print_mode = options.printPreview || false;
                _self.previewSlider = options.previewSlider;
                var isValidUrl = _self.getInitData();
                if (isValidUrl == false) {
                    /**
                     * SD - 118632
                     */
                    $spa.navigate('/ui/problems?mode=list','problems', "", true); // No I18N
                    return false;
                }
                _self.moduleName = _self.entity_name.capitalize();
                var allowedTabObj = _self.getAllowedTabs();
                var opt = {
                    entity_id: _self.entity_data ? _self.entity_data.id : "", // No I18N
                    module_options: options,
                    printPreview: _self.printPreview,
                    module: _self.entity_name,
                    moduleName: _self.moduleName,
                    $problemDetails: _self,
                    data: { entity_data: _self.entity_data, tabData: _self.tabData, metainfo: _self.metainfo, _links: _self._links, sdp_user: sdp_user, system_userid: sdp_user.SYSTEM_USERID.toString() },
                    container: "problem_detailview", // No I18N
                    panel_details: {
                        content_panel: {
                            left_panel: {
                                show: false
                            },
                            actions_panel: {
                                show: !_self.printPreview && !_self.externalframe,
                                left_panel: {
                                    show: true,
                                    dataCallback: this.getActionsTemplateData,
                                    template: "problemactions_template",  // No I18N
                                    template_namespace: "problems",// No I18N
                                    afterRenderfunction: this.afterQuickActionsRender
                                },
                                middle_panel: {
                                    show: false
                                }
                            },
                            header_panel: {
                                show: true,
                                template: "problemheader_template", // No I18N
                                "class": "headerbar", // No I18N
                                "template_namespace": "problems" // No I18N
                            },
                            details_panel: { show: true },
                            tabs_panel: {
                                show: true,
                                name: "problem", // No I18N
                                id: "problem_details", // No I18N
                                tabs_class: "pl20 pr20", // No I18N
                                "tabs": _self.getTabs(), // No I18N
                                active: _self.getActiveSubTab(),
                                custom: true,
                                template_namespace: "problems",// No I18N
                                type: "tab",// No I18N
                                settings: {
                                    "details": { // No I18N
                                        show: true,
                                        internal_name: "details",// No I18N
                                        display_name: translate("common.details"), // No I18N
                                        dataCallback: this.getEntityTemplateData,
                                        template: "problemdetails_template", // No I18N
                                        template_namespace: "problems",// No I18N
                                        renderfunction: this.loadProblemDetails,
                                        href_style: "overflow-x:auto;min-height:450px",// No I18N
                                        style: { "min-height": "500px" }, // No I18N
                                        afterRenderfunction: this.afterTabRender,
                                        "class":'p5 pt0'//No I18N
                                    },
                                    "analysis": { // No I18N
                                        show: true,
                                        internal_name: "analysis",// No I18N
                                        display_name: translate("sdp.problem.analysistab"), // No I18N
                                        template: "analysis_template", // No I18N
                                        template_namespace: "problems",// No I18N
                                        renderfunction: this.loadAnalysisDetails,
                                        href_style: "overflow-x:auto;min-height:450px",// No I18N
                                        style: { "min-height": "500px" }, // No I18N
                                        afterRenderfunction: this.afterTabRender
                                    },
                                    "tasks": { // No I18N
                                        show: true,
                                        internal_name: "tasks",// No I18N
                                        display_name: translate("task.title"), // No I18N
                                        HTML: '<div id="task_listview"></div>',
                                        style: { "min-height": "500px" }, // No I18N
                                        renderfunction: this.renderTask.bind(this),
                                        afterRenderfunction: this.afterTabRender,
                                                                         "class":"pt10 task-list-wrap fw"  //No I18N
                                    },
                                    "worklogs": {// No I18N
                                        show: !_self.printPreview,
                                        internal_name: "worklogs",// No I18N
                                        display_name: translate("common.worklogs"), // No I18N
                                        HTML: '<div id="worklog_listview"></div>',
                                        renderfunction: this.renderWorkLog,
                                        style: { "min-height": "500px" }, // No I18N
                                        afterRenderfunction: this.afterTabRender,
                                                                                                                        "class":"pt10 task-list-wrap fw" //No I18N
                                    },
                                    "solution": { // No I18N
                                        show: true,
                                        internal_name: "solution",// No I18N
                                        display_name: translate("sdp.header.solutions"), // No I18N
                                        template: "solutions_template",// No I18N
                                        template_namespace: "problems",// No I18N
                                        renderfunction: this.renderSolutionDetails,
                                        href_style: "overflow-x:auto;min-height:450px",// No I18N
                                        style: { "min-height": "500px" }, // No I18N
                                        afterRenderfunction: this.afterTabRender
                                    },
                                    "associations": { // No I18N
                                        show: true,
                                        internal_name: "associations",// No I18N
                                        display_name: translate("sdp.project.associations.tabname"), // No I18N
                                        template: "pb_module_associations", // No I18N
                                        template_namespace: "problems",// No I18N
                                        renderfunction: this.loadAssociations,
                                        href_style: "overflow-x:auto;min-height:450px",// No I18N
                                        style: { "min-height": "500px" }, // No I18N
                                        afterRenderfunction: this.afterTabRender,
                                        "class":"task-list-wrap fw" //No I18N
                                    },
                                    "history": { // No I18N
                                        show: !_self.printPreview,
                                        internal_name: "history",// No I18N
                                        display_name: translate("common.history"), // No I18N
                                        href: "/common/ViewHistory.jsp?id=" + this.id + "&module=problems&is_new_history=true&key=problem_history_sort_order&print_view=" + _self.printPreview, // No I18N
                                        href_style: "overflow-x:auto;min-height:450px",// No I18N
                                        style: { "min-height": "500px" }, // No I18N
                                        afterRenderfunction: this.afterTabRender
                                    }
                                }
                            },

                            right_panel: {
                                show: !_self.externalframe,
                                toggle: !_self.externalframe,
                                "sections": ["properties", "associations"], // No I18N
                                "settings": { // No I18N
                                    "associations": { // No I18N
                                        show: this.hasAssociationsAccess(),
                                        "class": "form-horizontal form-section inplace-edit pos-rel top0 right0", // No I18N
                                        dataCallback: this.getEntitySummary,
                                        template: "problem_associationsummary_template", // No I18N
                                        template_namespace: "problems"// No I18N
                                    },
                                    "properties": { // No I18N
                                        show: true,
                                        dataCallback: this.getEntitySummary,
                                        "class": "form-horizontal form-section inplace-edit pb10 pos-rel top0 right0", // No I18N
                                        template: "rightpanel_properties_template",// No I18N
                                        template_namespace: "problems",// No I18N
                                        afterRenderfunction: this.loadRightPropertySection
                                    }
                                }
                            }
                        }
                    }
                };
                if(window.checkIfMSP() && sdp_user.USERTYPE === 'Requester'){
                	delete opt.panel_details.content_panel.tabs_panel.settings.tasks;
                	if(sdp_user.ROLES.indexOf("ViewWorkLog")==-1) {// No I18N
                	    delete opt.panel_details.content_panel.tabs_panel.settings.worklogs;
                	}
                }
                if (allowedTabObj.allowedTabsObjs) {
                    opt.panel_details.content_panel.tabs_panel.settings = jQuery.extend(true, opt.panel_details.content_panel.tabs_panel.settings, allowedTabObj.allowedTabsObjs);
                }
                if (_self.printPreview) {
                    var print_details = {};
                    print_details.print_sections = ["header_panel", "details", "analysis", "solutions", "associations"];// No I18N
                    /* check for associations permission */
                    if (!this.hasAssociationsAccess()) {
                        print_details.print_sections.splice(print_details.print_sections.indexOf("associations"), 1);
                    }
                    print_details.print_metainfo = this.getPrintableSectionsMeta();
                    opt.print_details = print_details;
                    opt.print_hideFilter = opt.print_hideFooter = _self.externalframe ? true : false;
                    if(_self.previewSlider){
                        opt.afterRenderfunction = function(){
                            jQuery('#print-header-problem').remove();
                            jQuery('#print-footer').remove();
                            jQuery("#preview-panel").css({
                                "padding-top": "0", //NO I18N
                                "padding-bottom": "0" //NO I18N
                            });
                    }}
                }
                if (_self.$detailsComp) {
                    _self.$detailsComp.rerenderDetails(opt, this);
                } else {
                    _self.$detailsComp = new DetailsComponent(opt, this);
                }
				if(isMSP) {
					window.getCustomAccID = function(url) {
						if(url && url.startsWith('/api/v3/problems/') && url.indexOf('associated_incidents')!=-1) { //NO I18N
							return 0;
						}
						return getAccountFromCombo();
					};
				}
            } catch (e) {
                console.error(e);
            }
            //Fix - When problem's title is updated, then announcement title shows old data only
            jQuery("#announceDialogDiv").remove();

        },
        // Initializes Print View for Problem Details
        callPrintPreview: function () {
            NewWindowP('/ui/print?entity_id=' + this.id + '&module=problem&printMode=true', '', '1100', '700', 'yes', 'center', 'yes', 'yes');// No I18N
        },
        // Return the meta of tabs to be printed
        getPrintableSectionsMeta: function () {
            var print_options = {
                "header_panel": { // No I18N
                    path: "content_panel.header_panel", // No I18N
                    "default": true // No I18N
                },
                "details": { path: "content_panel.tabs_panel.settings.details" },// No I18N
                "analysis": { path: "content_panel.tabs_panel.settings.analysis" },// No I18N
                "solutions": { path: "content_panel.tabs_panel.settings.solution" },// No I18N
                "associations": { path: "content_panel.tabs_panel.settings.associations" }, // No I18N

            };
            return print_options;
        },
        //Adds hash to url
        afterTabRender: function (a, b, panelObj) {
            var _self = this;
            if (this.printPreview) {
                return;
            }
            var hashURL = panelObj.active;
            if ($problemGlobal.doPush) {
                window.history.pushState({ "tabname": hashURL, entity_id: _self.id, "spa_skipstate": true }, '', '/ui/problems?mode=detail&entity_id=' + _self.id + '#' + hashURL); // No I18N
            } else {
                window.history.replaceState({ "tabname": hashURL, entity_id: _self.id, "spa_skipstate": true }, '', '/ui/problems?mode=detail&entity_id=' + _self.id + '#' + hashURL); // No I18N
                $problemGlobal.doPush = true;
            }
        },
        //Return the list of tabs in order to render in details component
        getAllowedTabs: function () {
            var allowedTabs = ["details", "analysis", "solution", "tasks", "worklogs", "associations", "history"];// No I18N
            return { allowedTabs: allowedTabs };
        },
        //Return the tab's route id to be identified by the details component
        getTabPathHash: function (hash) {
            var params = this.getHashParams(hash);
            if (params) {
                return "content_panel.tabs_panel.settings." + params;// No I18N
            }
        },
        /**
         * On click handling for all Actions
         */
        invokeActions: function (actionName) {
            var _self = this;
            if(!_self.checkForActiveEditors()){
                return;
            }
            switch (actionName) {
                case "note":   // No I18N
                    _self.initConversationForQuickAddNote();
                    break;
                case "impact_details":   // No I18N
                    _self.$detailsComp.gotoTabByPath(_self.getTabPathHash("#analysis"), function () {   // No I18N
                        setTimeout(function () {
                            _self.$impact_details_PC.refreshPanel();
                            _self.$impact_details_PC.showEditTemplate();
                        }, 100);
                    });
                    break;
                case "root_cause":   // No I18N
                    _self.$detailsComp.gotoTabByPath(_self.getTabPathHash("#analysis"), function () {   // No I18N
                        setTimeout(function () {
                            _self.$root_cause_PC.refreshPanel();
                            _self.$root_cause_PC.showEditTemplate();
                        }, 100);
                    });
                    break;
                case "symptoms":   // No I18N
                    _self.$detailsComp.gotoTabByPath(_self.getTabPathHash("#analysis"), function () {   // No I18N
                        setTimeout(function () {
                            _self.$symptoms_PC.refreshPanel();
                            _self.$symptoms_PC.showEditTemplate();
                        }, 100);
                    });
                    break;
                case "workaround":   // No I18N
                    _self.$detailsComp.gotoTabByPath(_self.getTabPathHash("#solution"), function () {   // No I18N
                        setTimeout(function () {
                            _self.solutionPopUp("WORKAROUND", _self.id, _self.entity_data.workaround);// No I18N
                        }, 100);
                    });
                    break;
                case "resolution":   // No I18N
                    _self.$detailsComp.gotoTabByPath(_self.getTabPathHash("#solution"), function () {   // No I18N
                        setTimeout(function () {
                            _self.solutionPopUp("RESOLUTION", _self.id, _self.entity_data.resolution);// No I18N
                        }, 100);
                    });
                    break;
                case "associations":   // No I18N
                    _self.$detailsComp.gotoTabByPath(_self.getTabPathHash("#associations"));  // No I18N
                    break;
                case "worklogs": // No I18N
                    _self.$detailsComp.gotoTabByPath(_self.getTabPathHash("#worklogs"), function () {   // No I18N
                        setTimeout(function () {
                            $tasks.loadWorkLog('form', 'problem', _self.id); //NO I18N
                        }, 100);
                    });
                    break;
                case "addtask":// No I18N
                    _self.$detailsComp.gotoTabByPath(_self.getTabPathHash("#tasks"), function () {   // No I18N
                        setTimeout(function () {
                            $tasks.loadTasks('form', 'problem', _self.id); //NO I18N
                        }, 100);
                    });
                    break;
            }
            jQuery('#actions_list').removeClass('open');
        },
        /**
         * Get all permissions required to show Actions
         */
        getActionsTemplateData: function () {
            var _self = this;
            var permissions = {};
            if (_self._links) {
                _self._links.edit && _self._links.edit.put && (permissions.canEditEntity = true) && (_self.canEdit = true);
                _self._links.notes && _self._links.notes.post && (permissions.canAddNote = true);
                _self._links["delete"] && _self._links["delete"]["delete"] && (permissions.canDeleteEntity = true);
            }
            if (window.hasOwnProperty("$problemGlobal") && window.$problemGlobal.loadedRecords) {
                var index = -1;
                //Find the next and prev problem id with the loaded data in listview
                index = window.$problemGlobal.loadedRecords.indexOf(_self.id);
                if (index != -1) {
                    var nextIndex = index + 1;
                    var prevIndex = index - 1;
                    (nextIndex != window.$problemGlobal.loadedRecords.length) && (permissions.nextId = window.$problemGlobal.loadedRecords[nextIndex]);
                    (prevIndex != -1) && (permissions.prevId = window.$problemGlobal.loadedRecords[prevIndex]);
                }
                //If the details page is refreshed or problem is newly added, need not show navigation
                if (window.$problemGlobal.loadedRecords.length > 1 && index != -1) {
                    permissions.navigation = true;
                }
            }
            permissions.canAddReminder = true;
            permissions.canViewReminders = true;
            permissions.canAddTask = _self.canEdit;
            permissions.canAddWorklog = _self.canEdit;
            permissions.canUpdateAnalysis = _self.canEdit;
            permissions.canAssociateIncident = _self._links.associated_incidents && _self._links.associated_incidents.post;
            permissions.canViewChange = _self._links.associated_change && _self._links.associated_change.get;
            if(window.checkIfMSP() && sdp_user.USERTYPE!='Technician') { // No I18N
            	permissions.canAddReminder = false;
            	permissions.canViewReminders = false;
	            permissions.isRequester = true;
            }
            permissions.canClose = _self.canEdit && _self._links.close;
            if (permissions.canViewChange) {
                permissions.canEditChange = _self._links.associated_change.post ? true : false;
            }
            _self.canEdit && (permissions.canSendNotification = true);
            _self.canEdit && _self._links.make_announcement && _self._links.make_announcement.post && (permissions.canMakeAnnouncement = true);
            jQuery.extend(true, permissions, this.getSolutionAccess());

            return { "allowed_actions": permissions, "summary": this.getEntitySummary().summary };   // No I18N
        },
        //Removing sub section when no action is listed in it
        afterQuickActionsRender: function () {
            jQuery("#actions_list").find(".sublist:not(:has(*))").parent().remove();
        },
        /**
         * Pre-data to construct problem details template
         */
        getEntityTemplateData: function (tabName, tabSetting, tabs_panel) {
            var _self = this;
            _self.entityFields = {
                canEdit: _self.canEdit && !_self.printPreview,
                canAddNote: !_self.printPreview && _self._links.notes && _self._links.notes.post
            };
            return _self.entityFields;
        },
        /**
         * Loads Problem details tab
         */
        loadProblemDetails: function (tabName, tabSetting, tabs_panel) {
            var _self = this;
            _self.getTemplateInfo(_self.entity_data.template.id);
            _self.loadDescriptionSection(tabName, tabSetting, tabs_panel);
            _self.loadConversations(tabName, tabSetting, tabs_panel);
            _self.loadEntityFields(tabName, tabSetting, tabs_panel);
        },
        //When Popup is closed the form is not destroyed properly, thus common method for closing popups
        destroyFormAndClosePopUp: function (form, popupContainer) {
            if (form) {
                form.destroy();
            }
            jQuery('#' + popupContainer).dialog('close'); // No I18N
        },
        //SGT Popup (Assign Button, Right Section[Site, Group, Tech] edit)
        loadAssignPopup: function () {
            var _self = this;
            //Destroy the old instance
            _self.$assign_FC && _self.$assign_FC.destroy();
            var requiredfields = ["site", "group", "technician"];   // No I18N
            _self.getTemplateInfo(_self.entity_data.template.id);
            var column_count = "1";
            var callbackfields = $PBForm.getInputDataCallback();
            var fieldsProperty = {
                group: {
                    input_data_Callback: callbackfields.group,
                    sort: false
                },
                technician: {
                    input_data_Callback: callbackfields.technician,
                    sort: false
                },
            }
            var style_properties = {"field_style":{"field_align":"top"}}; // No I18N
            var template = _self.constructTemplate(requiredfields, column_count, fieldsProperty,style_properties);
            var form = "assign_form"; // No I18N
            var title = translate("sdp.requests.viewrequest.assigntitle"); // No I18N
            jQuery("#" + form).attr("title", title).addClass(" form-template"); // No I18N
            var skipEditFields = (_self._links.edit && _self._links.edit.put && _self._links.edit.put.non_editable_fields) ? _self._links.edit.put.non_editable_fields : [];
            /* Load FC for editing technician*/
            var configJSON = {
                template: template,
                entitydata: jQuery.extend(true, {}, _self.entity_data),
                metadata: jQuery.extend(true, {}, _self.metainfo),
                container: form,
                skipEditFields: skipEditFields,
                canEdit: true,
                mode: "edit", // No I18N
                formid: form + "_wrapper",   // No I18N
                dependentFields: [{
                    fields: ["site", "group", "technician"], // No I18N
                    order: false
                }],
                edit: {
                    fields: {
                        group: {
                            allowClear: true
                        },
                        technician: {
                            allowClear: true
                        },
                        site: {
                            allowClear: false
                        }
                    },
                    defaults: {
                        lookup: {
                            placeholder: translate('sdp.change.sla.select')
                        }
                    },
                },
                save: {
                    url: "/api/v3/problems/" + _self.id + "/_assign",//No I18N
                    submit: true,
                    submitbutton: {
                        edit: window.translate("common.assign") //No I18N
                    },
                    exit_alert: false,
                    onsubmit: function (form) {
                        var changedValues = form.getChangedValues();
                        if (jQuery.isEmptyObject(changedValues)) {
                            _self.destroyFormAndClosePopUp(form, 'assign_form');//No I18N
                            return true;
                        } else {
                            return false;
                        }
                    },
                    cancel: function (fc) {
                        _self.destroyFormAndClosePopUp(fc, 'assign_form');//No I18N
                    },
                    postsuccess: function (data, form) {
                        _self.fetchEntityData();
                        (_self.getActiveSubTab()=='details') && _self.entityFields.initFC('view');// No I18N
                        _self.$rightpropertyfields_FC && _self.$rightpropertyfields_FC.renderForm();
                        _self.destroyFormAndClosePopUp(form, 'assign_form');//No I18N
                    }
                },
                afterRenderCallback: function (form) {
                    jQuery("#" + form.container).find('[data-id="form-fixed-wrapper"]').find(".form-wrapper").removeClass("pb25").addClass("pb10 pt10");
                }
            };
            _self.$assign_FC = _self.initFormComponent(configJSON);
            setTimeout(function () {
                showModal(form, 350, false, false, false, true, 280);
                initTooltip("#assign_form_wrapper"); // No I18N
            }, 1);
        },
        //Known Error Form Popup('Mark As KnownError' action, Right section Known_error edit)
        loadKnownErrorPopup: function () {
            var _self = this;
            //Destroy the old instance
            _self.$knownError_FC && _self.$knownError_FC.destroy();
            var requiredfields = ["known_error_details.is_known_error", "known_error_details.comments"];   // No I18N
            _self.getTemplateInfo(_self.entity_data.template.id);
            var column_count = "1";
            var style_properties = {"field_style":{"field_align":"top"}}; // No I18N
             var fieldsProperty = {
               "known_error_details.is_known_error": {// No I18N
                field_only:true,
                    custom_render: function (tabindex) {
                        return '<div id="known_error_details.is_known_error_control" data-fname="known_error_details.is_known_error" class="right-col"><label class="checkbox-inline"><input name="known_error_details.is_known_error" type="checkbox" data-field="known_error_details.is_known_error" '+(_self.entity_data.known_error_details.is_known_error?'checked':'')+' tabindex="'+tabindex+'" class="mr10"><span data-i18n-key="problem.knownerror">'+translate("problem.knownerror")+'</span></label></div>';
                    }
                },
                "known_error_details.comments":{// No I18N
                    resize:'none;',// No I18N
                    height:100
                }
            }
            var template = _self.constructTemplate(requiredfields, column_count,fieldsProperty,style_properties);
            var form = "known_error_form"; // No I18N
            var title = translate("sdp.problem.markknownerror"); // No I18N
            jQuery("#" + form).attr("title", title); // No I18N
            var configJSON = {
                template: template,
                entitydata: jQuery.extend(true, {}, _self.entity_data),
                metadata: jQuery.extend(true, {}, _self.metainfo),
                container: form,
                canEdit: true,
                mode: "edit", // No I18N
                formid: form + "_wrapper",   // No I18N
                edit: {
                    defaults: {
                        lookup: {
                            placeholder: translate('sdp.change.sla.select')
                        }
                    },
                },
                save: {
                    submit: true,
                    exit_alert: false,
                    onsubmit: function (form) {
                        var changedValues = form.getChangedValues();
                        if (jQuery.isEmptyObject(changedValues)) {
                            _self.destroyFormAndClosePopUp(form, 'known_error_form');//No I18N
                            return true;
                        } else {
                            return false;
                        }
                    },
                    cancel: function (fc) {
                        _self.destroyFormAndClosePopUp(fc, 'known_error_form');//No I18N
                    },
                    postsuccess: function (data, form) {
                        if (data.problem) {
                            _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                        }
                        _self.$rightpropertyfields_FC && _self.$rightpropertyfields_FC.renderForm();
                        _self.destroyFormAndClosePopUp(form, 'known_error_form');//No I18N
                    }
                },
                afterRenderCallback: function (form) {
                    jQuery("#" + form.container).find('[data-id="form-fixed-wrapper"]').find(".form-wrapper").removeClass("pb25").addClass("pb10 pt10");
                }
            };
            _self.$knownError_FC = _self.initFormComponent(configJSON);
            setTimeout(function () {
                showModal(form, 525, false, false, false, true, 280);
                initTooltip("#known_error_form_wrapper");// No I18N
            }, 1);
        },
        //Closure Actions popup('Close Problem' action, change status to closed from right section)
        loadClosureActionsPopup: function () {
            var _self = this;
            var closure_actions = _self.getClosureActions();
            if (closure_actions && closure_actions.length > 0) {
                renderhbs('#closureAction_form', 'closure_actions_form_template', closure_actions, false, 'problems');//No I18N
                setTimeout(function () {
                    jQuery("#closureAction_form").attr("title", translate("sdp.problem.closurerule.optfields.dialogheader"));//No I18N
                    showModal("closureAction_form", 525, false, false, false, true, 280);//No I18N
                    initTooltip("#closureAction_form");// No I18N
                }, 1);//Need to handled for form alone not for whole popupdiv
            }
        },
        //Returns the list of enabled closure action
        getClosureActions: function () {
            var _self = this;
            var closureActions;
            sdpAjax({
                url: _self.base_url + "/" + _self.id + "/_closure_action",
                type: "GET",  // No I18N
                async: false,
                success: function (resp) {
                    if (resp.closure_action) {
                        closureActions = resp.closure_action
                    }
                }
            });
            return closureActions;
        },
        //Execution of choosed closure actions
        handleClosureActions: function (event, btn) {
            var _self = this;
            var form = btn.form;
            if (event === 'save') {
                var input_data = {};
                input_data.closure_action = [];
                jQuery("#closure_actions_form_wrapper").find(":checked").each(function (i, action) {
                    var obj = {};
                    obj.name = action.getAttribute("data-value");
                    input_data.closure_action.push(obj);
                })
                if (input_data.closure_action.length > 0) {
                    input_data = sdpAjaxInputData(input_data)
                    sdpAjax({
                        url: _self.base_url + "/" + _self.id + "/_closure_action",
                        type: "PUT",  // No I18N
                        async: false,
                        data: input_data,
                        success: function (resp) {
                            var status = Array.isArray(resp.response_status) ? resp.response_status[0].status : resp.response_status.status;
                            var noerr = false;
                            if (resp.closure_action) {
                                noerr = _self.showClosureActionErrorMessages(resp.closure_action)
                            }
                            if (status === "success" || noerr) {
                                    showalert("success", translate("problem.closure.action.success"), "isAutoHide=true");  //No I18N
                                form.remove();
                                jQuery('#closureAction_form').dialog('close');//No I18N
                            }

                        }
                    })
                    return false;
                }
                else {
                    event = 'cancel';//No I18N
                }

            }
            if (event === 'cancel') {//No I18N
                form.remove();
                jQuery('#closureAction_form').dialog('close');//No I18N
            }
        },
        //Since dynamic message possiblities for different actions, special error handling is made
        showClosureActionErrorMessages: function (message) {
            var errors = [];
            if (!Array.isArray(message)) {
                message = [message];
            }
            message.forEach(function (individualOpr) {
                for (var key in individualOpr) {
                    var individualOprMsg = individualOpr[key];
                    if (Array.isArray(individualOprMsg)) {
                        individualOprMsg.forEach(function (individualEntityMsg) {
                            if (individualEntityMsg.operation_status == 'failed') {
                                line = '';
                                if (individualEntityMsg.id) {
                                    line += (translate('sdp.requests.common.requestid') + ':' + individualEntityMsg.id + '.&nbsp;');
                                }
                                line += individualEntityMsg.message;
                                if (individualEntityMsg.fields) {
                                    line += ':&nbsp;' + individualEntityMsg.fields.map(function (field) { return '<strong>'+e_html(field.display_name ? field.display_name : field.name)+'</strong>' });// No I18N
                                }
                                errors.push(line);
                            }
                        })
                    } else {
                        if (individualOprMsg.operation_status == 'failed') {
                           errors.push(individualOprMsg.message);
                        }
                    }
                }
            })
            if (errors.length>0) {
                alertMsg='<h5 class="bgtransp mt0">' + translate('problem.closure.action.failure') + '</h5> <ol class="pl15">'
                errors.each(function(e,i){
                    alertMsg+=('<li>'+e+'</li>');
                })
                alertMsg+='</ol>';
                showalert('warning', alertMsg, 'isAutoHide=false,closeOnEscKey=yes');// No I18N
                return false;
            }
            return true;
        },
        //Renders Right Panel Properties Section(Inline Edit Form)
        loadRightPropertySection: function () {
            var _self = this;
            var template = _self.getTemplateInfo(_self.entity_data.template.id);
            var requiredfields = ["id", "status", "template", "known_error_details.is_known_error", "priority", "site", "group", "technician", "tasks"];   // No I18N
            var fieldsProperty = {
                id: {
                    custom_render: function () {
                        return '<p class="form-control-static">PB-' + e_html(_self.entity_data.id) + '</p>'; // No I18N
                    }
                },
                status: {
                    custom_render: function () {
                        var obj = {
                            field_value: _self.entity_data.status.name,
                            canEdit: _self._links.edit && _self._links.edit.put ? true : false,
                            color: _self.entity_data.status.color,
                            field_name: 'status',// No I18N
                            inlineEdit: _self.canEdit,
                            data_value: _self.entity_data.status.id,
                            display_name: _self.metainfo.fields.status.display_name
                        }
                        return _self.renderRightSectionPropertiesFields(obj);
                    }
                },
                'known_error_details.is_known_error': {// No I18N
                    custom_render: function () {
                        var obj = {
                            field_value: _self.entity_data.known_error_details.is_known_error ? translate('common.yes') : translate('common.no'),
                            canEdit: _self._links.edit && _self._links.edit.put ? true : false,
                            field_name: 'is_known_error',// No I18N
                            display_name: _self.metainfo.fields.known_error_details.fields.is_known_error.display_name,
                            actionFunc: '$problemDetails.loadKnownErrorPopup()'// No I18N
                        }
                        if (_self.entity_data.known_error_details.updated_by) {
                            obj.tooltip = {
                                title:translate('sdp.app.asset.details',[translate('problem.knownerror')])
                            }
                        }
                        return _self.renderRightSectionPropertiesFields(obj);
                    }
                },
                priority: {
                    custom_render: function () {
                        var obj = {
                            field_value: _self.entity_data.priority ? _self.entity_data.priority.name : '-',
                            canEdit: _self._links.edit && _self._links.edit.put ? true : false,
                            color: _self.entity_data.priority ? _self.entity_data.priority.color : false,
                            field_name: 'priority',// No I18N
                            inlineEdit: _self.canEdit,
                            data_value: _self.entity_data.priority ? _self.entity_data.priority.id : null,
                            display_name: _self.metainfo.fields.priority.display_name
                        }
                        return _self.renderRightSectionPropertiesFields(obj);
                    }
                },
                site: {
                    custom_render: function () {
                        var obj = {
                            field_value: _self.entity_data.site ? _self.entity_data.site.name : '-',
                            canEdit: _self._links.edit && _self._links.edit.put ? true : false,
                            field_name: 'site',// No I18N
                            display_name: _self.metainfo.fields.site.display_name,
                            actionFunc: '$problemDetails.loadAssignPopup()'// No I18N
                        }
                        return _self.renderRightSectionPropertiesFields(obj);
                    }
                },
                group: {
                    custom_render: function () {
                        var obj = {
                            field_value: _self.entity_data.group ? _self.entity_data.group.name : '-',
                            canEdit: _self._links.edit && _self._links.edit.put ? true : false,
                            field_name: 'group',// No I18N
                            display_name: _self.metainfo.fields.group.display_name,
                            actionFunc: '$problemDetails.loadAssignPopup()'// No I18N
                        }
                        return _self.renderRightSectionPropertiesFields(obj);
                    }
                },
                technician: {
                    custom_render: function () {
                        var obj = {
                            field_value: _self.entity_data.technician ? _self.entity_data.technician.name : '-',
                            canEdit: _self._links.edit && _self._links.edit.put ? true : false,
                            field_name: 'technician',// No I18N
                            display_name: _self.metainfo.fields.technician.display_name,
                            actionFunc: '$problemDetails.loadAssignPopup()'// No I18N
                        }
                        return _self.renderRightSectionPropertiesFields(obj);
                    }
                },
                tasks: {
                    custom_render: function () {
                        var obj = {
                            tasks: _self.summary,
                            $problemDetails: _self
                        }
                        return renderhbs(null,'rightPanel_task_count_template',obj,null,'problems',null,true,null,true); // No I18N
                    }
                }

            };
			if(window.checkIfMSP() && sdp_user.USERTYPE === 'Requester'){// No I18N
				requiredfields.splice(requiredfields.indexOf("tasks"), 1);// No I18N
			}
            var column_count = "1";
            var template = _self.constructTemplate(requiredfields, column_count, fieldsProperty);
            var nonEditable = ["id", "template", "tasks"];    // No I18N
            _self._links.edit && _self._links.edit.put && _self._links.edit.put.non_editable_fields && (nonEditable = nonEditable.concat(_self._links.edit.put.non_editable_fields));

            //Destroy the old instance
            _self.$rightpropertyfields_FC && _self.$rightpropertyfields_FC.destroy();
            _self.resetSiteValue(_self.entity_data);
            /* Load FC for right property section */
            var rightPropFcConfig = {
                template: template,
                entitydata: jQuery.extend(true, {}, _self.entity_data),
                metadata: jQuery.extend(true, {}, _self.metainfo),
                container: "right_propertysection",   // No I18N
                preFix:"rpanel",// No I18N
                formid: "rightPanelProperty",   // No I18N
                skipEditFields: nonEditable,
                canEdit: _self.canEdit, //CanEdit default's to true, and permission is controlled in skipEditFields
                edit: {
                    fields:{
                        status :{
                            allowClear:false
                        }
                    },
                    defaults: {
                        lookup: {
                            placeholder: translate('sdp.change.sla.select'),
                        }
                    }
                },
                afterRenderCallback: function () {
                    jQuery("#" + this.container).find('[data-id="form-fixed-wrapper"]').css("padding-bottom", '').end()
                        .find(".form-wrapper").removeClass("pb25").end()
                        .find(".form-section").addClass('noborder p0');
                    jQuery("#" + this.container).find('[data-fname="tasks"] [class*="spot-field"]').addClass('pl10');//Task render alignment
                    initTooltip('#right_propertysection');// No I18N

                },
                save: {
                    pre: function (payload, formcomp, event, promise) {
                        formcomp.options.save.url = _self.base_url + "/" + _self.id; // No I18N
                        formcomp.options.save.type = "PUT";
                    },
                    postsuccess: function (data, form, fieldName) {
                        if (data.problem) {
                            if (fieldName && fieldName == 'status' && data.problem.status.id != _self.entity_data.status.id) {
                                if(data.problem.status.id == _self.getClosedStatusId()){
                                    delete _self._links.close
                                    if (_self.getEntitySummary().summary.associated_incidents > 0) { _self.loadClosureActionsPopup(); }
                                }else{
                                    _self.getLinks(_self.base_url + "/" + _self.id, _self);
                                }
                                _self.refreshActionsDropDown();
                            }
                            _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                        }
                        (_self.getActiveSubTab()=='details') && _self.entityFields && _self.entityFields.initFC('view');// No I18N
                        _self.$rightpropertyfields_FC && _self.$rightpropertyfields_FC.renderForm();
                    },
                    error: function(data,form){
                        if(data && data.response_status && data.response_status.messages) {
                            var errmsg = _self.formatError(data.response_status.messages[0],form.metadata);
                            window.showalert("failure", errmsg, "isAutoHide=false");	//No I18N
                        }
                        _self.$rightpropertyfields_FC && _self.$rightpropertyfields_FC.renderForm();
                    }
                }
            };

            _self.$rightpropertyfields_FC = _self.initFormComponent(rightPropFcConfig);
        },
        /**
         * Constructs template with given fields, if the template is not available in api for form component
         * @requiredfields - fields with which layout will be construct
         * @column_count - no. of columns
         * @fieldsProperty - obj for specifying field extra property
         */
        constructTemplate: function (requiredfields, column_count, fieldsProperty,style_properties) {
            var fieldsLayout = [], _self = this;
            var fields = _self.fields;
            if (!fields) {
                fields = []
                _self.template.layouts.collect(function (l) {
                    l.sections.collect(function (s) {
                        s.fields.each(function (f) {
                            fields.push(f.name)
                        });
                    })
                })
                _self.fields = fields;
            }
            var filledFieldsCount = 0;
            jQuery.each(requiredfields, function (i, field) {
                if ((field != 'group' && field != 'priority') || fields.contains(field)) {
                    var obj = {};
                    obj.name = field;
                    var colCount = (filledFieldsCount % column_count) + 1;
                    var rowCount = (filledFieldsCount / column_count) + 1;
                    var col = colCount ? colCount : column_count;
                    obj.position = { "col": col, "col_size": 1, "row": rowCount, "row_size": 1 };
                    if (fieldsProperty && fieldsProperty.hasOwnProperty(field)) {
                        jQuery.extend(true, obj, fieldsProperty[field]);
                    }
                    fieldsLayout.push(obj);
                    filledFieldsCount++;
                }
            });
            var template = { "layouts": [{ "column_count": 1, "sections": [{ "column_count": column_count, "fields": fieldsLayout , "style_properties":style_properties}] }] };   // No I18N
            return template;
        },
        /**
         * Actions - close(complete/cancel) problem
         * @status - values can be completed/cancelled
         */
        closeEntity: function () {
            var _self = this;
            sdpAjax({
                url: _self.base_url + "/" + _self.id + "/_close",
                type: "PUT",  // No I18N
                success: function (resp) {
                    let response = Array.isArray(resp.response_status) ? resp.response_status[0] : resp.response_status;
                    if (response && response.status === "success") {
                        showalert("success", response.messages[0].message, "isAutoHide=true");  //No I18N
                        _self.fetchEntityData();
                        delete _self._links.close;
                        _self.$detailsComp.refreshPanel('panel', 'content-right');//No I18N
                        _self.refreshActionsDropDown();
                        if (_self.getEntitySummary().summary.associated_incidents > 0) {
                            setTimeout(function () {
                                _self.loadClosureActionsPopup();
                            }, 10);
                        }
                    }
                },
                error:function(resp){
                    let response = Array.isArray(resp.responseJSON.response_status) ? resp.responseJSON.response_status[0] : resp.responseJSON.response_status;
                    if(response && response.messages) {
                        var errmsg = _self.formatError(response.messages[0],_self.metainfo);
                        window.showalert("failure", errmsg, "isAutoHide=false");	//No I18N
                    }
                }
            });
        },
        //Invoke Change association List View as popup Window
        changeAssociationPopup: function (isForm) {
            var _self = this;
            var url = isForm ? '/AddNewChange.cc?PROBLEMID=' + _self.entity_data.id : '/FilteredChanges.cc?PROBLEMID=' + _self.entity_data.id + (_self.entity_data.category != null ? '&CATEGORYID=' + _self.entity_data.category.id : '');// No I18N
            //Since parent window is controlled for refreshing right section, noopener cannot be added
             NewWindow(url, 'New_Change', '1200', '800', 'yes', 'center');
        },
        renderRightSectionPropertiesFields: function (obj) {
            return renderhbs(null, 'rightpanel_properties_value_template', obj, false, "problems", null, true, null, true);//No I18N
        },
        //Detaches change from problem
        detachChange: function (changeId) {
            var _self = this;
            if (_self._links.associated_change && _self._links.associated_change.post) {
                var input_data = { associated_change: { change: { id: changeId } } };
                input_data = sdpAjaxInputData(input_data);
                sdpAjax({
                    url: _self.base_url + "/" + _self.id + "/associated_change",
                    type: "DELETE",  // No I18N
                    data: input_data,
                    success: function (resp) {
                        if (resp.response_status.status == 'success') {
                            showalert("success", translate("ae.detach.success"), "isAutoHide=true");// No I18N
                            _self.refreshRightSectionProperties('associations');// No I18N
                        }
                    }
                });
            }
        },
        //Refreshes Right panel properties section (Post Task Addition, Post Incident associations)
        refreshRightSectionProperties: function (property) {
            var _self = this;

            switch (property) {
                case 'associations':// No I18N
                    _self.fetchEntitySummary(['associated_incidents','associated_change']);// No I18N
                    renderhbs(jQuery('#associations_summary').parent(), 'problem_associationsummary_template', { additonal_data: _self.getEntitySummary() }); // No I18N
                    _self.refreshActionsDropDown(false);
                    break;
                case 'tasks':// No I18N
                    _self.fetchEntitySummary(['tasks']);
                    _self.$rightpropertyfields_FC.renderField('tasks');// No I18N
                    _self.$rightpropertyfields_FC.afterRender();
                    $sdEventListener(jQ('#'+_self.$rightpropertyfields_FC.container).find('[data-fname="tasks"]'));
                    break;

            }
        },
        //More Properties Link in Right Panel
        scrollToProperties: function () {
            var _self = this;
            if (_self.getActiveSubTab() != 'details') {
                _self.gotoActiveTab('details');// No I18N
            }
            var showLess = jQuery('#hide_more_content');
            if (showLess && showLess.is(':visible')) {
                showLess.trigger('click');
            }
            if (_self.$convComp.isExpanded) {
                _self.$convComp.toggleConversation();
            }
            setTimeout(function () {
                var ele = jQuery('#propertiesSection');
                var container = window.externalframe ? jQuery("#content-details-problem") : jQuery('html, body');	//No I18N
                container.stop(true, true).animate({
                    scrollTop: ele.offset().top - 100
                }, 500, function () {
                    /** Highlights Properties section by blinking the border of the Properties section */
                    ele.css({ boxShadow: "#ffefe4 0px 2px 5px 8px" });	//NO I18N
                    setTimeout(function () {
                        ele.css({ boxShadow: "none" });	//NO I18N
                    }, 700);
                });
            }, 20);
        },
        /*
        A function to load task listview in details component.
        */
        renderTask: function () {
            jQuery('#task_listview').html($tasks.loadTasks('list', this.entity_name, this.id, null, this.printPreview ? "printView" : null)); // No I18N
        },
        /*
        A function to load worklog listview in details component.
        */
        renderWorkLog: function () {
            jQuery('#worklog_listview').html($tasks.loadWorkLog('list', this.entity_name, this.id, null, null, null, null, null, this.printPreview)); // No I18N
        }
    };
    return probDetails;
}()));
 //To avoid multiple popstate event binding
 if (!window.$problemGlobal.isPopStateAvailable) {
    window.$problemGlobal.isPopStateAvailable = true;
    jQuery(window).on('popstate', function (event) { // No I18N
        var state = event.originalEvent.state;
        $problemGlobal.doPush = false;
        if (state && !state.spa && state.entity_id && (typeof $problemDetails != "undefined" && $problemDetails.$detailsComp) && state.tabname) { //No I18N
            window.location.hash = "#" + state.tabname;// No I18N
            if ($problemGlobal.entity_id == state.entity_id) {
                var objectPath = $problemDetails.getTabPathHash(window.location.hash);
                $problemDetails.$detailsComp.gotoTabByPath(objectPath);
            } else {
                delete $problemDetails.$detailsComp;
                $problemDetails.init({ id: state.entity_id });
            }
        }else if($spa.isHashChange || (state && state.spa_skipstate)){
            $spa.navigate('/ui/problems?mode=list','problems'); //No I18N
        }
    });
}