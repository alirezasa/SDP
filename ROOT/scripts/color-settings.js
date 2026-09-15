/* $Id$ */
var colorSettings = {
    options: {},
    /**
     * A method which is used to initialize the color settings
     */
    init: function(options) {
        var self = this;
        var default_options = {
            /**
             * Entitiy for the color settings
             */
            module: "request", //No I18N
            /**
             * Color settings entity ID
             */
            cs_entitiy_id: "",
            /**
             *  Color settings data (if you already get the data)
             */
            cs_data: {},
            /**
             * Preview Table
             */
            table: [{
                name: '<div align="center"><input type="checkbox" /></div>', // NO I18N
                width: 35,
                isHtml: false
            }],
            /**
             * Default color settings (Getting from the server)
             */
            default: {},
            /**
             * Internal Object used for the internal checking and rendering purpose
             */
            internal_obj: {
                field: "status", // NO I18N
                selectedValues: [],
                options: [],
                dialogInterface: "",
                is_enabled_click: false,
                firstValue: false,
                initialState: false
            },
            is_enabled: true,
            columns: [],
            fields: [],
            cs_items: [],
            /**
             * Callback function when color settings is saved
             */
            onSave: "",
            appliesTo: [],
            default_settings: {
                columns: ["all_columns"],
                background_color: "#ffffff", //No I18N
                default_background: "#ffffff" //No I18N
            }
        };
        if (options.module == "request") {
            options.fields = [{
                id: "category", // NO I18N
                text: translate("sdp.requests.common.category") // NO I18N
            }, {
                id: "group", // NO I18N
                text: translate("common.group") // NO I18N
            }, {
                id: "priority", // NO I18N
                text: translate("sdp.itil.common.priority") // NO I18N
            }, {
                id: "status", // NO I18N
                text: translate("sdp.requests.common.status") // NO I18N
            }];
            options.columns = [{
                id: "all_columns", // NO I18N
                text: translate("sdp.request.listview.allcolumns") // NO I18N
            }, {
                id: "id", // NO I18N
                text: translate("sdp.common.id") // NO I18N
            }, {
                id: "checkbox", // NO I18N
                text: translate("common.checkbox.button") // NO I18N
            }, {
                id: "subject", // NO I18N
                text: translate("sdp.common.subject") // NO I18N
            }, {
                id: "status", // NO I18N
                text: translate("sdp.requests.common.status") // NO I18N
            }, {
                id: "priority", // NO I18N
                text: translate("sdp.requests.common.priority") // NO I18N
            }, {
                id: "group", // NO I18N
                text: translate("common.group") // NO I18N
            }, {
                id: "category", // NO I18N
                text: translate("sdp.requests.common.category") // NO I18N
            }, {
                id: "technician", // NO I18N
                text: translate("sdp.requests.viewrequest.listview.assignedto") // NO I18N
            }, {
                id: "due_by_time", // NO I18N
                text: translate("sdp.requests.common.dueby") // NO I18N
            }, {
                id: "created_time", // NO I18N
                text: translate("sdp.requests.common.createddate") // NO I18N
            }, {
                id: "level", // NO I18N
                text: translate("sdp.requests.common.level") // NO I18N
            }, {
                id: "completed_time", // NO I18N
                text: translate("sdp.requests.viewrequest.completeddate") // NO I18N
            }, {
                id: "mode", // NO I18N
                text: translate("sdp.requests.common.mode") // NO I18N
            }, {
                id: "created_by", // NO I18N
                text: translate("common.createdby") // NO I18N
            }, {
                id: "urgency", // NO I18N
                text: translate("sdp.itil.common.urgency") // NO I18N
            }, {
                id: "impact", // NO I18N
                text: translate("sdp.problem.impact") // NO I18N
            }, {
                id: "request_type", // NO I18N
                text: translate("sdp.requests.common.requesttype") // NO I18N
            }, {
                id: "subcategory", // NO I18N
                text: translate("sdp.common.subcategory") // NO I18N
            }, {
                id: "item", // NO I18N
                text: translate("sdp.common.item") // NO I18N
            }, {
                id: "department", // NO I18N
                text: translate("sdp.helpdesk.common.dept") // NO I18N
            }, {
                id: "template", // NO I18N
                text: translate("common.templatename") // NO I18N
            }, {
                id: "service_category", // NO I18N
                text: translate("sdp.itil.common.service.category") // NO I18N
            }];
            options.table = [{
                name: '<div align="center"><input type="checkbox" /></div>', //No I18N
                width: "35px", //No I18N
                gethtml: '<div align="center"><input type="checkbox" /></div>', //No I18N
                getcolortype: 'checkbox', //No I18N
                isHtml: true
            }, {
                name: " ", //No I18N
                gethtml: '<span class="list-sprite icon-sm outgoing-conv-icon-off" rel="uitip" title="'+translate("sdp.requests.listview.notifications.noconv.title")+'"></span>',
                getcolortype: '',
                width: "35px" //No I18N
            }, {
                name: " ", //No I18N
                gethtml: '<span class="list-sprite icon-sm notes-icon" rel="uitip" title="'+translate("common.view.notes")+'"></span>',
                getcolortype: '',
                width: "35px" //No I18N
            }, {
                name: " ", //No I18N
                gethtml: '<span class="cspr icon-sm tc-edit"></span>',
                getcolortype: '',
                width: "35px" //No I18N
            }, {
                name: " ", //No I18N
                gethtml: '<span class="list-sprite icon-sm tc-task"></span>',
                getcolortype: '',
                width: "35px" //No I18N
            }, {
                name: translate("sdp.common.id"), //No I18N
                gethtml: 1, //No I18N
                getcolortype: 'id', //No I18N
                width: "35px" //No I18N
            }, {
                name: translate("sdp.common.subject"), //No I18N
                gethtml: translate("sdp.common.subject"), //No I18N
                getcolortype: 'subject', //No I18N
                width: "200px" //No I18N
            }, {
                name: translate("sdp.requests.common.status"), //No I18N
                gethtml: translate("sdp.requests.common.status"), //No I18N
                getcolortype: 'status', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.requests.common.priority"), //No I18N
                gethtml: translate("sdp.requests.common.priority"), //No I18N
                getcolortype: 'priority', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("common.group"), //No I18N
                gethtml: translate("common.group"), //No I18N
                getcolortype: 'group', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.requests.common.category"), //No I18N
                gethtml: translate("sdp.requests.common.category"), //No I18N
                getcolortype: 'category', //No I18N
                width: "90px" //No I18N
            }];
            options.onSave = function() {
                color_setting.color_settings_data = undefined;
                sdpAjaxUrlHandler('/WOListView.do'); //No I18N
                jQuery("#requests_list_refreshfreq").trigger("click"); // NO I18N
            };
            if(isSCP) {
                // removing fields not applicable for SCP under applies to section
                rejected_columns = ["department"]; //No I18N
                for (var i = options.columns.length - 1; i >= 0; i--) {
                    if(rejected_columns.includes(options.columns[i].id)) {
                        options.columns.splice(i, 1);
                    }
                }
            }
        }
        if (options.module == "change") {
            options.fields = [{
                id: "risk", // NO I18N
                text: translate("sdp.admin.change.risk") // NO I18N
            }, {
                id: "stage", // NO I18N
                text: translate("sdp.admin.change.stage") // NO I18N
            }, {
                id: "impact", // NO I18N
                text: translate("sdp.problem.impact") // NO I18N
            },{
                id: "priority", // NO I18N
                text: translate("sdp.requests.common.priority") // NO I18N
            },{
                id: "change_type", // NO I18N
                text: translate("sdp.itil.common.changetype") // NO I18N
            },{
                id: "category", // NO I18N
                text: translate("sdp.requests.common.category") // NO I18N
            },{
                id: "emergency", // NO I18N
                text: translate("sdp.change.rfc.emergency") // NO I18N
            },{
                id: "urgency", // NO I18N
                text: translate("sdp.itil.common.urgency") // NO I18N
            }];
            options.columns = [{
                id: "all_columns", // NO I18N
                text: translate("sdp.request.listview.allcolumns") // NO I18N
            }, {
                id: "title", // NO I18N
                text: translate("sdp.common.title") // NO I18N
            }, {
                id: "change_owner", // NO I18N
                text: translate("sdp.change.rfc.changeowner") // NO I18N
            }, {
                id: "category", // NO I18N
                text: translate("sdp.requests.common.category") // NO I18N
            }, {
                id: "priority", // NO I18N
                text: translate("sdp.requests.common.priority") // NO I18N
            }, {
                id: "change_type", // NO I18N
                text: translate("sdp.itil.common.changetype") // NO I18N
            }, {
                id: "stage", // NO I18N
                text: translate("sdp.admin.change.stage") // NO I18N
            }, {
                id: "status", // NO I18N
                text: translate("sdp.requests.common.status") // NO I18N
            }, {
                id: "scheduled_end_time", // NO I18N
                text: translate("sdp.change.scheduledendtime") // NO I18N
            }, {
                id: "completed_time", // NO I18N
                text: translate("sdp.change.completedtime") // NO I18N
            }, {
                id: "scheduled_start_time", // NO I18N
                text: translate("sdp.common.scheduledstarttime") // NO I18N
            }, {
                id: "created_time", // NO I18N
                text: translate("sdp.change.createdtime") // NO I18N
            }, {
                id: "impact", // NO I18N
                text: translate("sdp.problem.impact") // NO I18N
            }, {
                id: "item", // NO I18N
                text: translate("sdp.common.item") // NO I18N
            }, {
                id: "subcategory", // NO I18N
                text: translate("sdp.common.subcategory") // NO I18N
            }, {
                id: "risk", // NO I18N
                text: translate("sdp.admin.change.risk") // NO I18N
            }, {
                id: "emergency", // NO I18N
                text: translate("sdp.change.rfc.emergency") // NO I18N
            }, {
                id: "urgency", // NO I18N
                text: translate("sdp.itil.common.urgency") // NO I18N
            }, {
                id: "change_manager", // NO I18N
                text: translate("sdp.admin.changemanager") // NO I18N
            }, {
                id: "change_requester", // NO I18N
                text: translate("sdp.change.rfc.changerequester") // NO I18N
            }, {
                id: "group", // NO I18N
                text: translate("common.group") // NO I18N
            }, {
                id: "id", // NO I18N
                text: translate("sdp.common.id") // NO I18N
            }, {
                id: "workflow", // NO I18N
                text: translate("common.workflow.label") // NO I18N
            }, {
                id: "template", // NO I18N
                text: translate("common.templatename") // NO I18N
            }];
            options.table = [{
                name: '<div align="center"><input type="checkbox" /></div>', //No I18N
                width: "35px", //No I18N
                gethtml: '<div align="center"><input type="checkbox" /></div>', //No I18N
                getcolortype: 'checkbox', //No I18N
                isHtml: true
            }, {
                name: " ", //No I18N
                gethtml: '<span class="tc-nonotes" rel="uitip" title="'+translate("common.add.notes")+'"></span>',
                getcolortype: '',
                width: "35px" //No I18N
            }, {
                name: " ", //No I18N
                gethtml: '<span class="tc-edit" rel="uitip" title="'+translate("common.edit")+'"></span>',
                getcolortype: '',
                width: "35px" //No I18N
            }, {
                name: translate("sdp.common.id"), //No I18N
                gethtml: 1, //No I18N
                getcolortype: 'id', //No I18N
                width: "35px" //No I18N
            }, {
                name: translate("sdp.common.title"), //No I18N
                gethtml: translate("sdp.common.title"), //No I18N
                getcolortype: 'title', //No I18N
                width: "200px" //No I18N
            }, {
                name: translate("sdp.admin.change.risk"), //No I18N
                gethtml: translate("sdp.admin.change.risk"), //No I18N
                getcolortype: 'risk', //No I18N
                width: "90px" //No I18N
            },{
                name: translate("sdp.itil.common.changetype"), //No I18N
                gethtml: translate("sdp.itil.common.changetype"), //No I18N
                getcolortype: 'change_type', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.admin.change.stage"), //No I18N
                gethtml: translate("sdp.admin.change.stage"), //No I18N
                getcolortype: 'stage', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.problem.impact"), //No I18N
                gethtml: translate("sdp.problem.impact"), //No I18N
                getcolortype: 'impact', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.requests.common.priority"), //No I18N
                gethtml: translate("sdp.requests.common.priority"), //No I18N
                getcolortype: 'priority', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.requests.common.category"), //No I18N
                gethtml: translate("sdp.requests.common.category"), //No I18N
                getcolortype: 'category', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.change.rfc.emergency"), // NO I18N, //No I18N
                gethtml: translate("sdp.change.rfc.emergency"), // NO I18N, //No I18N
                getcolortype: 'emergency', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.itil.common.urgency"), // NO I18N, //No I18N
                gethtml: translate("sdp.itil.common.urgency"), // NO I18N, //No I18N
                getcolortype: 'urgency', //No I18N
                width: "90px" //No I18N
            }];
            options.onSave = function() {
                color_setting.color_settings_data = undefined;
                //sdpAjaxUrlHandler("/Changes.cc")//No I18N
        		var url = "/Changes.cc";// No I18N
        		if (navparamId === "trashed_changes") {
        			url = "/Changes.cc?trashView=true";// No I18N
        		}
                changelistview.changeAjaxHandler(url);
            };
        }
		
		if (options.module == "release") {
            options.fields = [{
                id: "risk", // NO I18N
                text: translate("sdp.admin.change.risk") // NO I18N
            }, {
                id: "stage", // NO I18N
                text: translate("sdp.admin.change.stage") // NO I18N
            }, {
                id: "impact", // NO I18N
                text: translate("sdp.problem.impact") // NO I18N
            },{
                id: "priority", // NO I18N
                text: translate("sdp.requests.common.priority") // NO I18N
            },{
                id: "category", // NO I18N
                text: translate("sdp.requests.common.category") // NO I18N
            },{
                id: "emergency", // NO I18N
                text: translate("sdp.change.rfc.emergency") // NO I18N
            },{
                id: "urgency", // NO I18N
                text: translate("sdp.itil.common.urgency") // NO I18N
            }];
            options.columns = [{
                id: "all_columns", // NO I18N
                text: translate("sdp.request.listview.allcolumns") // NO I18N
            }, {
                id: "title", // NO I18N
                text: translate("sdp.common.title") // NO I18N
            }, {
                id: "release_type", // NO I18N
                text: translate("common.release") + " " + translate("common.type") // NO I18N
            }, {
                id: "category", // NO I18N
                text: translate("sdp.requests.common.category") // NO I18N
            }, {
                id: "priority", // NO I18N
                text: translate("sdp.requests.common.priority") // NO I18N
            }, {
                id: "stage", // NO I18N
                text: translate("sdp.admin.change.stage") // NO I18N
            }, {
                id: "status", // NO I18N
                text: translate("sdp.requests.common.status") // NO I18N
            }, {
                id: "impact", // NO I18N
                text: translate("sdp.problem.impact") // NO I18N
            }, {
                id: "risk", // NO I18N
                text: translate("sdp.admin.change.risk") // NO I18N
            }, {
                id: "emergency", // NO I18N
                text: translate("sdp.change.rfc.emergency") // NO I18N
            }, {
                id: "urgency", // NO I18N
                text: translate("sdp.itil.common.urgency") // NO I18N
            }, {
                id: "group", // NO I18N
                text: translate("common.group") // NO I18N
            }, {
                id: "id", // NO I18N
                text: translate("sdp.common.id") // NO I18N
            }];
            options.table = [{
                name: '<div align="center"><input type="checkbox" /></div>', //No I18N
                width: "35px", //No I18N
                gethtml: '<div align="center"><input type="checkbox" /></div>', //No I18N
                getcolortype: 'checkbox', //No I18N
                isHtml: true
            }, {
                name: " ", //No I18N
                gethtml: '<span class="crspr icon-md rls-workflow1"></span>',
                getcolortype: '',
                width: "35px" //No I18N
            }, {
                name: translate("sdp.common.id"), //No I18N
                gethtml: 1,
                getcolortype: 'id', //No I18N
                width: "35px" //No I18N
            }, {
                name: translate("sdp.common.title"), //No I18N
                gethtml: translate("sdp.common.title"), //No I18N
                getcolortype: 'title', //No I18N
                width: "200px" //No I18N
            }, {
                name: translate("sdp.admin.change.risk"), //No I18N
                gethtml: translate("sdp.admin.change.risk"), //No I18N
                getcolortype: 'risk', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.admin.change.stage"), //No I18N
                gethtml: translate("sdp.admin.change.stage"), //No I18N
                getcolortype: 'stage', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.problem.impact"), //No I18N
                gethtml: translate("sdp.problem.impact"), //No I18N
                getcolortype: 'impact', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.requests.common.priority"), //No I18N
                gethtml: translate("sdp.requests.common.priority"), //No I18N
                getcolortype: 'priority', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.requests.common.category"), //No I18N
                gethtml: translate("sdp.requests.common.category"), //No I18N
                getcolortype: 'category', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.change.rfc.emergency"), // NO I18N, //No I18N
                gethtml: translate("sdp.change.rfc.emergency"), // NO I18N, //No I18N
                getcolortype: 'emergency', //No I18N
                width: "90px" //No I18N
            }, {
                name: translate("sdp.itil.common.urgency"), // NO I18N, //No I18N
                gethtml: translate("sdp.itil.common.urgency"), // NO I18N, //No I18N
                getcolortype: 'urgency', //No I18N
                width: "90px" //No I18N
            }];
            options.onSave = function() {
				color_setting.color_settings_data = undefined;
				color_settings_helper.callApi("release",function(csObj){ //No I18N
					window["cs_enabled"] = csObj.is_enabled;
					color_settings_helper.color_settings = csObj;
					$releaseList.table_comp_release.t_obj.options.color_settings = csObj;
					$releaseList.table_comp_release.refreshTable("refresh"); //NO I18N
				});
            };
        }
        /**
         * Save the options to the option value
         */
        self.optionsSwitch = jQuery.extend(true, {}, default_options);
        options.isDark = isDark();
        options.setting_permission.isDark = isDark();
        options.isRTL = (sdp_user.DIRECTION == 'RTL'); //No I18N
        self.options = jQuery.extend(default_options, options);
		
		self.renderHeaderToggle = self.options.setting_permission.is_admin;
		self.closeSaveCall = false;
		
        self.open();
    },
    enableDisableCS: function() {
        var self = this;
        if (self.options.internal_obj.is_enabled_click && self.options.cs_entitiy_id) {
            var status = "mark_as_inactive"; //No I18N
            if (self.options.is_enabled) {
                status = "mark_as_active"; //No I18N
            }
            if (self.options.internal_obj.firstValue != self.options.is_enabled) {
                sdpAjax({
                    method: "PUT", //No I18N
                    async: false,
                    url: "/api/v3/color_settings/" + self.options.cs_entitiy_id + "/" + status, //No I18N
                    complete: function() {
                        self.options.internal_obj.firstValue = self.options.is_enabled;
						if(color_settings_helper.color_settings != undefined) {
							color_settings_helper.color_settings.is_enabled = self.options.is_enabled;
						}
						self.closeSaveCall = true;
                    }
                });
            }
        }
    },
    /**
     * A method is used to open the popup for the color settings
     */
    open: function() {
        var self = this,
            jQ = jQuery("body");
        self.options.internal_obj.dialogInterface = jQuery("#cs-dialog").dialog({
            modal: true,
			dialogClass: self.options.setting_permission.is_admin ? "colorset-dialog-tab" : "",//No I18N
            draggable:false,
            title: translate("sdp.colorsettings"),
            height: screen.height / 1.29955078861, // fix for IE center to the screen
            width: "1200px", //No I18N
			closeOnEscape: false,
            open: function() {
                // jQ.find(self.options.target).html('');
                jQ.find("#cs-dialog").closest(".ui-dialog").addClass("colorset-dialog"); //No I18N
                jQ.find('[data-sel="color-loader"]').html(ajaxBar());
                self.renderView();
            },
            beforeClose: function() {
                if ((self.options.internal_obj.is_enabled_click && self.options.cs_entitiy_id && self.options.internal_obj.initialState !== self.options.is_enabled) || self.closeSaveCall ) {
                    self.enableDisableCS();
                    if (jQuery.isFunction(self.options.onSave)) {
                        self.options.onSave();
                    }
                } else {
                    delete window["colorSettings"];
                }
				var tech_cust_person = sdp_user.CLIENT_CONF["Color_myPersonalize_"+self.options.module];//render technician own customization
				if(color_setting.setting_permission.is_mypersonalizeEnable && tech_cust_person && tech_cust_person != "false") {
					color_setting.setting_permission.render_tabs = "mypersonalize"; //No I18N
				} else {
					color_setting.setting_permission.render_tabs = "global"; //No I18N
				}
            },close:function(){
                jQuery("#cs-dialog").remove();
            }
        });
    },
    /**
     * Returns an array of matching objects
     * @param {*} obj
     * @param {*} key
     * @param {*} val
     */
    getObjects: function(obj, key, val) {
        var final = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (Array.isArray(val)) {
                    for (var j = 0; j < val.length; j++) {
                        if (obj[i][key] === val[j]) {
                            final.push(obj[i]);
                        }
                    }
                } else {
                    if (obj[i][key] === val) {
                        return obj[i];
                    }
                }
            }
        }
        return final;
    },
    /**
     * A method is used for call all the render methods
     */
    renderView: function() {
        var self = this;
        if (self.options["cs_data"]) {
            self.formatData();
			if(self.options.setting_permission.is_admin) {//Popup new tab UI 
				self.render("cs-tab-header", ".ui-dialog #cs-globaltab");
            }
            self.renderLeft();
            self.renderRight(self.options);
            var dialog = jQuery("#cs-dialog").closest(".ui-dialog"); //No I18N
			if(self.renderHeaderToggle) {
				dialog.find(".ui-dialog-title").append('<div id="matchtoggle" class="pos-abs ml10 mt-1 color-setting-toggle disp-ib"><label class="disp-iflex"><input type="checkbox" class="togglechk" name="radio1" checked><span class="slide-toggle togg-xl"><span class="switch-toggle"></span></span></label></div>'); // NO I18N
			}
			dialog.find(".ui-dialog-title #matchtoggle input").on("click", function() {
                self.options.internal_obj.is_enabled_click = true;
				self.options.is_enabled = jQuery(this).prop("checked"); // NO I18N
                if (self.options.is_enabled) {
					jQuery(".ui-dialog .csleft-inner,.ui-dialog #cs_tab_1_1,.ui-dialog .form-footer, #cs-globaltab").css({
                        opacity: 1,
                        "pointer-events": "auto" // NO I18N
                    });
                } else {
                    /**
                     * For disable reduce the opacity
                     */
					jQuery(".ui-dialog .csleft-inner,.ui-dialog #cs_tab_1_1,.ui-dialog .form-footer, #cs-globaltab").css({
                        opacity: 0.4,
                        "pointer-events": "none" // NO I18N
                    });
                }
                self.enableDisableCS();
            });
            setTimeout(function() {
                if (!self.options.cs_entitiy_id) {
                    self.options.is_enabled = true;
                }
                if (!self.options.is_enabled) {
                    jQuery("#cs-dialog").closest(".ui-dialog").find("#matchtoggle input").trigger("click"); //No I18N
                    self.options.internal_obj.is_enabled_click = false;
                }
            }, 100);
            if (!self.options.cs_entitiy_id) {
                // need to change component base
                self.options.internal_obj.field = "status"; // NO I18N
                if (self.options.module == "change" || self.options.module == "release") {
                    self.options.internal_obj.field = "stage"; // NO I18N
                }
                /**
                 * Add one empty row
                 */
                self.addRow();
            }
			
			if(self.options.setting_permission.render_tabs == "mypersonalize") {
				jQuery("[data-name=history_tab]").addClass("hide");
			} else {
				jQuery("[data-name=history_tab]").removeClass("hide");
			}
            self.bindEvents();
        }
    },
    /**
     * Bind events for color settings
     */
    bindEvents: function() {
        const csContainer = jQuery("#cs-dialog");
        const _self = this;
        csContainer.off('click.cscontainer').on('click.cscontainer', '[data-color-event]', function(){ // NO I18N
            const eventName = jQuery(this).attr('data-color-event');
            let param = jQuery(this).attr('data-event-param')
            param = param != undefined ? param.split(',') : [] ;
            _self[eventName] && param.length > 0 ? _self[eventName](...param) : _self[eventName]();
        })
    },
    /**
     *  A method is used to format data (i.e parse the json and assign the value to Options object)
     * @param {string} options
     */
    formatData: function() {
        var options = this.options;
        if (options["cs_data"] && options["cs_data"]["color_json"] && !jQuery.isEmptyObject(options["cs_data"]["color_json"])) {
            try {
                options = JSON.parse(options.cs_data.color_json);
            } catch (error) {
                options = options.cs_data.color_json;
            }
            this.options.internal_obj.firstValue = this.options.is_enabled;
            this.options.internal_obj.initialState = this.options.is_enabled;
            var cs_items = [];
            for (var i = options["other_settings"].length - 1; i >= 0; i--) {
                if (options["other_settings"][i].values.length) {
                    cs_items.push(options["other_settings"][i]);
                }
            }
            this.options.cs_items = cs_items;
            this.options.default = options["default_settings"];
            this.options.internal_obj.field = options["other_settings"].length ? options["other_settings"][0]["field"] : "status";
            this.options.appliesTo = options["default_settings"]["columns"];
            this.options.default_settings.columns = options["default_settings"]["columns"];
            this.options.default_settings.background_color = options["default_settings"]["background_color"] || "#fff"; // NO I18N
            this.options.default_settings.default_background = options["default_settings"]["default_background"] || "#fff"; // NO I18N
        } else {
            this.options.cs_items = [];
            this.options.default = {};
        }
    },
    renderLeft: function() {
        var self = this;
        var options = self.options;
        self.render("cs-left-template", ".ui-dialog .clrset-left");
        jQuery(".ui-dialog #applies-to").select2({
			closeOnSelect: false,
            placeholder: translate("sdp.searchitem.select", [
                translate("sdp.common.columns")
            ])
        }).select2("val", self.options.default_settings.columns).trigger("change").on("change", function() { //No I18N
            self.options.default_settings.columns = jQuery(this).select2("val"); //No I18N
            self.renderRight();
        });
        jQuery(".ui-dialog .clrset-left").find("#creteriaSel").select2({
            data: options["fields"],
            placeholder: translate("sdp.searchitem.select", [""])
        }).on("change", function() {
            self.options.color_json = {};
            /**
             * Save the field value on the internal object
             */
            var field = jQuery(".ui-dialog .clrset-left #creteriaSel").select2("data")["id"]; //No I18N
            self.options.internal_obj = {
                field: field,
                selectedValues: [],
                options: [],
                dialogInterface: self.options.internal_obj
            };
            self.options.cs_items = [{
                values: [],
                background_color: self.randomColor(),
                field: field
            }];
			if(self.options.setting_permission.render_tabs == "global") {
				self.techCustomCheck = jQuery("#techCustomColor").prop("checked"); //No I18N
			}
            self.renderLeft();
            self.renderRight();
        });
        /**
         * Set default background color
         */
        jQuery(".ui-dialog #defalut-color").find(".img-circle").css("backgroundColor", options.default.background_color); //No I18N
        /**
         * Set the selected field values
         */
        var datas = self.getObjects(options.fields, "id", options.internal_obj.field); //No I18N
        if (Array.isArray(datas)) {
            datas = {};
        }
		if (jQuery.isEmptyObject(datas) && self.options.cs_entitiy_id) {
			self.options.internal_obj.field = "status"; // NO I18N
			if (self.options.module == "change" || self.options.module == "release") {
				self.options.internal_obj.field = "stage"; // NO I18N
			}
			datas = self.getObjects(options.fields, "id", options.internal_obj.field); //No I18N
		}
        if (!jQuery.isEmptyObject(datas)) {
            jQuery(".ui-dialog .clrset-left #creteriaSel").select2("data", datas); //No I18N
        }
        /**
         * set the values for selected columns
         */
        var columns = self.getObjects(options.columns, "id", options.default_settings.columns); //No I18N
        if (columns) {
            jQuery(".ui-dialog .clrset-left #applies-to").select2("data", columns); //No I18N
        }
        self.renderListofRows();
        setTimeout(function() {
            self.initColorPicker(".ui-dialog #table-bg-color"); // NO I18N
            self.initColorPicker(".ui-dialog #defalut-bg-color"); // NO I18N
        }, 200);
        if (jQuery(".ui-dialog [data-sel='target'] :input.statusSel").length === 1) {
            jQuery(".ui-dialog .common-remove-icon2").closest(".btn").css({ // NO I18N
                visibility: "hidden" // NO I18N
            });
        } else {
            jQuery(".ui-dialog .common-remove-icon2").closest(".btn").css({ // NO I18N
                visibility: "visibile" // NO I18N
            });
        }
		if(self.options.setting_permission.render_tabs == "global") {
			jQuery("#techCustomColor").prop("checked",self.techCustomCheck); //No I18N
		}
    },
    renderRight: function() {
        var self = this;
        Handlebars.registerHelper("inc", function(value) { //No I18N
            return parseInt(value) + 1;
        });
        Handlebars.registerHelper("getColumnValueCS", function(value, options) {  //No I18N
            if (options === value["field"]) {
                return value["values"].length && value["values"][0]["text"] ? value["values"][0]["text"] : self.getObjects(self.options.fields, "id", options)["text"];
            } else {
                return self.getObjects(self.options.fields, "id", options)["text"]; //No I18N
            }
            // return parseInt(value) + 1;
        });
        Handlebars.registerHelper("getColor", function(value, options, isDefault) { //No I18N
            var color = isDark() ? '#121212' : self.options.default_settings.background_color;
            if (self.options.default_settings.columns.indexOf("all_columns") !== -1 || self.options.default_settings.columns.indexOf(options) !== -1) {
                if(isDark() && self.options.default_settings.columns.indexOf("all_columns") !== -1 && options != "checkbox"){
                    return '#121212'; //No I18N
                }
                if (isDefault && isDefault === "true") {
                    return isDark() ? '#121212' : self.options.default_settings["default_background"]; //No I18N
                }
                for (var i = 0; i < self.options.cs_items.length; i++) {
                    if (self.options.cs_items[i]["values"].length) {
                        if (value["values"].length && self.options.cs_items[i]["values"][0]["id"] === value["values"][0]["id"]) {
                            if (self.options.cs_items[i]["background_color"]) {
                                return self.options.cs_items[i]["background_color"];
                            } else {
                                return self.options.default_settings["default_background"];
                            }
                        }
                    }
                }
            }
            return color;
        });
        this.render("list-of-tables", ".ui-dialog #cs_tab_1_1");
        jQuery('.ui-dialog [data-name=priview_tab]').trigger('click');
        jQuery('#cs-dialog [data-sel="color-loader"]').remove();
    },
    renderListofRows: function() {
        var self = this;
        var target = jQuery('[data-sel="target"]');
        self.render('list-of-rows', '[data-sel="target"]');
        var dialog = jQuery(".ui-dialog");
        var placeholder = translate("sdp.searchitem.select", [""]);
        var fieldname = dialog.find("#creteriaSel").select2("data"); //No I18N
        if (fieldname) {
            placeholder = translate("sdp.searchitem.select", [fieldname.text]);
        }
        /**
         * Destroy the previous select2
         */
        target.find(".statusSel").select2("destroy"); //No I18N
        /**
         * Set the value for rows
         */
        target.find(".statusSel").each(function(itm, el) {
            if (self.options.internal_obj.field === "emergency") {//no i18n
                var dataname;
                function checkoption() {
                    dataname = [
                        {id: '1', text: "true"},
                        {id: '2', text: "false"}
                    ];
                    var dataname1 = [];
                    var item = self.options.cs_items;
                    for(var i=0; i<dataname.length; i++) {
                        var remain = true;
                        for(var j=0; j<item.length; j++) {
                            if(j < 2 && item[j].values.length != 0) {
                                if(parseInt(item[j].values[0].id) === parseInt(dataname[i].id) || item[j].values.length == 2) {
                                    remain = false;
                                }
                            }
                        }
                        if(remain) {
                            dataname1.push(dataname[i]);
                        }
                    }
                    return dataname = dataname1;
                }
                var checkoption1 = checkoption();
                function format(item) {
                    return item.text;
                }
                if(checkoption1) {
                    jQuery(el).select2({
                        multiple: true,
                        sort: false,
                        closeOnSelect: true,
                        placeholder: placeholder,
                        default_option: null,//no i18n
                        data: dataname,
                        formatSelection: format,
                        formatResult: format
                    });
                }
            } else {
                /**
                 * sdp_select2 components
                 * file : ui-components.min.js
                 */
                var def_option = (self.options.internal_obj.field !== "status")?({id: 0,text: translate("sdp.request.common.notassigned")}):null; //No I18N
				var criterialval = dialog.find("#creteriaSel").val() || colorSettings.options.internal_obj.field;
                var passurl = "/api/v3/requests/" + criterialval; //No I18N
				var search_criteria_arr = [
											{
												"field": "deleted",  //No I18N
												"condition": "is",  //No I18N
												"value": "false",  //No I18N
												"logical_operator": "and"  //No I18N
											  }
										  ];
                if (colorSettings.options.module == "release") {
                    def_option = null;
					var passurl = "/api/v3/releases/" + criterialval; //No I18N
					search_criteria_arr = [];
				} else if (colorSettings.options.module == "change") { //No I18N
                    def_option = null;
                    passurl = "/api/v3/changes/" + criterialval; //No I18N
					if(self.options.internal_obj.field == 'risk' || self.options.internal_obj.field == 'stage' || self.options.internal_obj.field == 'change_type') {
					search_criteria_arr = [
											{
												"field": "inactive",  //No I18N
												"condition": "is",  //No I18N
												"value": "false",  //No I18N
												"logical_operator": "and"  //No I18N
											  }
										  ];
					}
                }
                var input_data={
                    multiple: true,
                    sort: false,
                    closeOnSelect: true,
                    cache: self.options.internal_obj.options,
                    placeholder: placeholder,
                    default_option:def_option,//no i18n
                    url:[{
                                url: passurl, //No I18N
                                field: dialog.find("#creteriaSel").val(), //No I18N
                                list_info: {
                                    start_index: 1,
                                    sort_field: "name", //No I18N
                                    row_count: 10,
                                    search_criteria: search_criteria_arr
                                },
                                processResults: function(search_data, data, field,settings) {
                                    if (self.options.internal_obj.selectedValues.indexOf(data.id+"") === -1 ) {
                                        search_data.push({
                                            id: data.id,
                                            text: data.name || data.display_name||data.text
                                        });
                                    }
                                }
                    }]
                };
				if (colorSettings.options.module == "request" && self.options.internal_obj.field === "status") {
					input_data["for"] = "list_view_filter"; //No I18N
					input_data["include_inactive_value"] = true;
				}
                jQuery(el).sdp_select2(input_data);
                /** Handling for missing item when remove items in initial select2 element */
                jQuery(el).on("select2-removed", function(e) { //No I18N
                    self.options.internal_obj.options = [];
                })
            }
        });
        self.setAlreadySelectedValues();
        var totalRows = jQuery(".ui-dialog [data-sel='target'] .clr-pick-row").length;
        jQuery(".ui-dialog [data-sel='target'] .clr-pick-row").each(function(index, el) {
            var item = self.options.cs_items[index];
            if (item) {
                var values = self.options.cs_items[index]["values"];
                /**
                 * convert the DB data into select2 data
                 */
                values.map(function(itm) {
                    if (itm["name"]) {
                        itm["text"] = itm["name"];
                        delete itm["name"];
                    }
                    /**
                     * Save the selected values
                     */
                    if (self.options.internal_obj.selectedValues.indexOf(itm["id"] + "") === -1) {
                        self.options.internal_obj.selectedValues.push(itm["id"] + "");
                    }
                    return itm;
                });
                jQuery(el).find(".form-control.statusSel[type='text']").select2("data", values).on("change", function() { //No I18N
                    self.setAlreadySelectedValues();
                    self.setSelectOptions();
					if(self.options.setting_permission.render_tabs == "global") {
						self.techCustomCheck = jQuery("#techCustomColor").prop("checked"); //No I18N
					}
                    self.renderLeft();
                    self.renderRight();
                    if (totalRows == index + 1) {
                        jQuery(".csleft-inner").scrollTop(jQuery(".csleft-inner").prop("scrollHeight")); // NO I18N
                    }
                });
                /**
                 * Init the color picker
                 */
                setTimeout(function() {
                    self.initColorPicker(el);
                }, 300);
            }
        });
    },
    initColorPicker: function(el) {
        var currentRow = jQuery(el),
            self = this,
            picker = currentRow.find('[data-sel="color-palette"]'),
            palette_position = "left"; //No I18N
        if (currentRow.hasClass("auto")) { //No I18N
            palette_position = "auto"; //No I18N
        } else if (currentRow.hasClass("bottom")) {  //No I18N
            palette_position = "bottom"; //No I18N
        }
        picker.zcolorpicker({
            defaultPaletteType: "custom", // NO I18N
            closeOnBodyClick: true,
            opacity: false,
            rtl : (sdp_user.DIRECTION == 'RTL'), // NO I18N
            standardColors: false,
            noColorButton: false,
            advancedPickerButtonLabel: translate("sdp.colorsettings.more.color"),
            position: palette_position,
            defaultColorButton: false,
            advancedPickerOptions: {
                opacity: false,
                backButtonLabel: translate("sdp.common.navigation.back"),
                OKButtonLabel: translate("sdp.common.ok")
            },
            otherUsedColors: false,
            title: translate("sdp.colorsettings.theme.color"),
            valueColorModel: "hex", // NO I18N
            customPalette: {
                colors: [{
                    color: "rgb(226, 224, 224)" // NO I18N
                }, {
                    color: "rgb(204, 238, 255)" // NO I18N
                }, {
                    color: "rgb(204, 204, 255)" // NO I18N
                }, {
                    color: "rgb(228, 204, 254)" // NO I18N
                }, {
                    color: "rgb(255, 204, 255)" // NO I18N
                }, {
                    color: "rgb(255, 204, 238)" // NO I18N
                }, {
                    color: "rgb(255, 204, 203)" // NO I18N
                }, {
                    color: "rgb(255, 229, 203)" // NO I18N
                }, {
                    color: "rgb(255, 255, 204)" // NO I18N
                }, {
                    color: "rgb(204, 255, 203)" // NO I18N
                }],
                hasTones: true, // NO I18N
                tones: [{
                    "function": "tint", // NO I18N
                    percent: 40 // NO I18N
                }, {
                    "function": "tint", // NO I18N
                    percent: 60 // NO I18N
                }, {
                    "function": "tint", // NO I18N
                    percent: 70 // NO I18N
                }, {
                    "function": "tint", // NO I18N
                    percent: 80 // NO I18N
                }]
            }
        });
        /**
         * Set the forelement for positioning the picker
         */
        picker.zcolorpicker("setAttribute", "forElement", currentRow.find('[showpicker="true"]')); // NO I18N
        currentRow.find('[showpicker="true"]').off().on("click", function() { //No I18N
            /**
             * Set the default value
             */
            picker.zcolorpicker("setAttribute", "value", currentRow.find("[showpicker]").css("backgroundColor")); // NO I18N
            /**
             * If the picker is open we need to close otherwise need to open
             */
            if (picker.is(":visible")) {
                picker.zcolorpicker("close"); //No I18N
            } else {
                picker.zcolorpicker("open"); //No I18N
            }
        });
        /**
         * Event bindings for zcolor picker on change
         *
         */
        picker.off("zcolorpickerchange").on("zcolorpickerchange", function(origEvent) { //No I18N
            var data = origEvent.detail;
            var color = data.color;
            /**
             * On color change set that value into the nearest color
             */
            currentRow.find('[showpicker="true"]').css("backgroundColor", color).data("color", color); //No I18N
            /**
             * When the color is change need to re-render the preview table
             */
            self.setSelectOptions();
            self.renderRight();
        });
    },
    setAlreadySelectedValues: function() {
        var self = this;
        self.options.internal_obj.selectedValues = [];
        jQuery(".ui-dialog .statusSel[type='text']").each(function(index) {
            var item = self.options.cs_items[index];
            if (item) {
                var values = self.options.cs_items[index]["values"];
                /**
                 * convert the DB data into select2 data
                 */
                jQuery(values).each(function(index, itm) {
                    if (self.options.internal_obj.selectedValues.indexOf(itm["id"] + "") === -1) {
                        self.options.internal_obj.selectedValues.push(itm["id"] + "");
                    }
                });
            }
        });
    },
    setSelectOptions: function() {
        var self = this;
        jQuery(".ui-dialog .statusSel[type='text']").each(function(index, el) {
            self.options.cs_items[index]["values"] = jQuery(this).select2("data");
            self.options.cs_items[index]["background_color"] = jQuery(el).closest(".clr-pick-row").find(".img-circle").css("backgroundColor"); //No I18N
        });
        // table background color
        self.options.default_settings.background_color = jQuery(".ui-dialog #table-bg-color .img-circle").css("backgroundColor"); //No I18N
        // default background color
        self.options.default_settings.default_background = jQuery(".ui-dialog #defalut-bg-color .img-circle").css("backgroundColor"); // NO I18N
    },
    getSelect2Options: function() {
        var self = this;
        var fullList = self.options.internal_obj.options;
        var selectedList = self.options.internal_obj.selectedValues;
        var finalObj = [];
        for (var i = 0; i < fullList.length; i++) {
            if (selectedList.indexOf(fullList[i]["id"]) === -1) {
                finalObj.push(fullList[i]);
            }
        }
        return finalObj;
    },
    /**
     * A util method is used to render the handlebar templates
     */
    render: function(template, target) {
        var self = this;
        renderhbs(target, template, self.options, false, 'components/colorsettings'); // NO I18N
    },
    /**
     * A method is used to remove the row
     */
    removeRow: function(index) {
        var values = this.options.cs_items[index]["values"];
        /*
         * Remove the already selected values
         */
        for (var i = 0; i < values.length; i++) {
            this.options.internal_obj.selectedValues.splice(this.options.internal_obj.selectedValues.indexOf(values[i]["id"]), 1);
        }
        this.options.cs_items.splice(index, 1);
        this.setAlreadySelectedValues();
        /** Removed the cache values when removing the rows */
        this.options.internal_obj.options = [];
		if(this.options.setting_permission.render_tabs == "global") {
			this.techCustomCheck = jQuery("#techCustomColor").prop("checked"); //No I18N
		}
        this.renderLeft();
        this.renderRight();
    },
    /**
     * Add New row
     */
    addRow: function() {
        var self = this;
        self.options.cs_items.push({
            background_color: self.randomColor(),
            values: [],
            field: self.options.internal_obj.field
        });
		if(self.options.setting_permission.render_tabs == "global") {
			self.techCustomCheck = jQuery("#techCustomColor").prop("checked"); //No I18N
		}
        self.renderLeft();
        jQuery(".ui-dialog .statusSel:last").select2("open"); //No I18N
    },
    /**
     * A util method which is used to generate random color
     */
    randomColor: function() {
        var selectedColor = ["#E2E0E0", "#CCEEFF", "#CCCCFF", "#E4CCFE", "#FFCCFF", "#FFCCEE", "#FFCCCB", "#FFE5CB", "#FFFFCC", "#CCFFCB", "#F4F3F3", "#ECF8FF", "#ECECFF", "#F5ECFF", "#FFECFF", "#FFECF8", "#FFECEC", "#FFF5EC", "#FFFFEC", "#ECFFEC", "#F7F6F6", "#F1FAFF", "#F1F1FF", "#F7F1FF", "#FFF1FF", "#FFF1FA", "#FFF1F1", "#FFF8F1", "#FFFFF1", "#F1FFF1", "#FAF9F9", "#F6FCFF", "#F6F6FF", "#FAF6FF", "#FFF6FF", "#FFF6FC", "#FFF6F6", "#FFFAF6", "#FFFFF6", "#F6FFF6"]; //NO I18N
        return selectedColor[Math.floor(Math.random() * selectedColor.length)];
    },
    openHistory: function() {
        var id = this.options.cs_entitiy_id || 0;
        jQuery(".ui-dialog #cs_tab_2_1").load("/common/ViewHistory.jsp?id=" + id + "&module=color_settings&key=sort_order_color_settings"); //No I18N
    },
    rgbToHex: function(color) {
        if (color.indexOf("#") !== -1) {
            return color;
        }
        color = "" + color;
        if (!color || color.indexOf("rgb") < 0) {
            return;
        }
        if (color.indexOf("#") !== -1) {
            return color;
        }
        var nums = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(color),
            r = parseInt(nums[2], 10).toString(16),
            g = parseInt(nums[3], 10).toString(16),
            b = parseInt(nums[4], 10).toString(16);
        return ("#" + ((r.length == 1 ? "0" + r : r) + (g.length == 1 ? "0" + g : g) + (b.length == 1 ? "0" + b : b)));
    },
    /**
     * A method is used to save the color settings
     */
    save: function(admin_config_permission) {
        var self = this;
        var method = "POST"; //No I18N
        if (self.options.internal_obj.is_enabled_click && (self.options.initialState === self.options.internal_obj.is_enabled_click) && self.options.cs_entitiy_id) {
           jQuery('[aria-describedby="cs-dialog"] .ui-dialog-titlebar-close').trigger("click");  //No I18N
            return false;
        }
        var other_settings = self.options.cs_items;
        var validated_settings = [];
        jQuery(other_settings).each(function(index, item) {
            var values = [];
            if (item["values"] && item["values"].length) {
                jQuery(item["values"]).map(function(ind, itm) {
                    if (itm["text"]) {
                        itm["name"] = itm["text"];
                        delete itm["text"];
                    }
                    values.push(itm);
                    other_settings[index]["background_color"] = self.rgbToHex(other_settings[index]["background_color"]);
                    other_settings[index]["values"] = values;
                    return itm;
                });
                validated_settings.unshift(item);
            }
        });
        self.options.default_settings["default_background"] = self.rgbToHex(self.options.default_settings["default_background"]);
        var url = "/api/v3/color_settings"; // NO I18N
        if (self.options.cs_entitiy_id) {
            url = "/api/v3/color_settings/" + self.options.cs_entitiy_id; //No I18N
            method = "PUT"; //No I18N
        }
        self.options.default_settings["background_color"] = self.rgbToHex(self.options.default_settings["background_color"]);
		var enabletechcust = jQuery("#techCustomColor").prop("checked");//No I18N
        var inputdata = {
            color_setting: {
                module: self.options.module,
                color_json: {
                    other_settings: validated_settings,
                    default_settings: self.options.default_settings
                },
				tech_personalized: enabletechcust
                }
        };
        inputdata = (typeof sdpToJSON != 'undefined') ? sdpToJSON(inputdata) : JSON.stringify(inputdata);//NO I18N
        var input = sdpAjaxInputData(inputdata);
		if(admin_config_permission == "mypersonalize") {
			var clrjson = JSON.parse(input);
			var custinput = {
				"tech_personalized": true,//No I18N
				"is_enabled": true,//No I18N
				"color_json": sdpToJSON(clrjson.color_setting.color_json),//No I18N
			};
			if(self.options.cs_entitiy_id) {
				custinput["id"] = self.options.cs_entitiy_id.toString();//No I18N
                ClientUtil.addUserPersonalization("listview_color_user_personalize",custinput,{internalKey: "Color_myPersonalize_"+self.options.module});//No I18N
				if(!color_setting.setting_permission.is_admin) {
					jQuery("#cs-dialog").dialog("close"); //No I18N
					if (jQuery.isFunction(self.options.onSave)) {
						self.options.onSave();
					}
				} else {
					self.closeSaveCall = true;
				}
				var msg = translate("sdp.api.personalize.add.success"); //No I18N
                showalert("success", msg, 'isAutoHide=true'); // No I18N
			}
		} else {
			color_setting.setting_permission.is_mypersonalizeEnable = enabletechcust;
			self.options.setting_permission.is_mypersonalizeEnable = enabletechcust;
			self.techCustomCheck = enabletechcust;
			if(!enabletechcust) {
				color_setting.setting_permission.render_tabs = "global";//No I18N
			}
        sdpAjax({
            type: method,
            url: url,
            data: {
                input_data: input
            },
            success: function(res) {
                if(method === "POST"){ //No I18N
                    window["cs_id"] = res["color_setting"] ? res["color_setting"]["id"] : ""; //No I18N
                    window["cs_enabled"] = true; //No I18N
						
						jQuery("#cs-dialog").dialog("close"); //No I18N
						if (jQuery.isFunction(self.options.onSave)) {
							self.options.onSave();
                }
					} else {
						self.closeSaveCall = true;
						self.renderHeaderToggle = false;
						self.tabSwitch('global'); //No I18N
					}
					var msg = (method == "POST") ? translate("api.saved.success",[translate("sdp.colorsettings")]) : translate("api.updated.success",[translate("sdp.colorsettings")]); //No I18N
                    showalert("success", msg, 'isAutoHide=true'); // No I18N
				}
			});
		}
    },
    resetPersonalize: function(defaultpersonalize) {
		var self = this;
		function formsubmit(s) {
			if(s) {
				if(defaultpersonalize == "mypersonalize") {//My Color Personalize
                    ClientUtil.deleteUserPersonalization("Color_myPersonalize_"+self.options.module);//No I18N
					color_setting.setting_permission.render_tabs = "global";//No I18N
				}
                if (jQuery.isFunction(self.options.onSave)) {
					self.options.onSave();
                    jQuery("#cs-dialog").dialog("close"); //No I18N
                }
				var defaultkey = defaultpersonalize == "mypersonalize" ? translate("common.global.setting")  : translate("sdp.common.defaultsetting"); //No I18N
				var msg = translate("common.restored",[defaultkey]); //No I18N
				showalert("success", msg, 'isAutoHide=true'); // No I18N
            }
		}
		if(defaultpersonalize == "mypersonalize") {
			var defaultkey = translate("sdp.common.to") + " " + translate("common.global.setting");
			defaultkey = defaultkey.toLowerCase();
			var confirmkey = translate("common.restore.confirm",[defaultkey]);
		} else {
			var confirmkey = translate("form.reset.alert");
		}
		showconfirm(true,'title='+translate("common.confirm.submit.msg")+', message='+confirmkey+', submitbutton='+translate("common.proceed")+', cancelbutton='+translate("common.no")+', closebutton=yes, closeOnEscKey=yes',formsubmit); //No I18N
    },
    closePopup: function() {
        jQuery('[aria-describedby="cs-dialog"] .ui-dialog-titlebar-close').trigger("click");
    },
    processHistory: function(response, sort_order) {
        var finalData = [],
            self = this;
        /**
         * get the i18n string
         */
        var i18nData = self.geti18nColumnName();
        i18nData["add"] = translate("sdp.history.added"); //No i18N
        i18nData["edit"] = translate("sdp.requests.history.updated"); //No i18N
        for (var history_index = 0; history_index < response.history.length; history_index++) {
            var item = response.history[history_index],
                history_obj = "",
                isGohead = true,
                operation = item.operation;
            /**
             * Set the icon for the operation
             */
            if (item.operation === "add") {
                item.className = "common-sprite icon-sm common-add-icon1 opac7 vmiddle left1 cur-def";
                item.diff = [];
            } else if (item.operation === "edit") { //No i18N
                item.className = "cspr edit icon-sm opac7 vmiddle left1";
            }
            item.display_operation_name = i18nData[item.operation];
            if (item.diff.length&& operation!=="add") {
				function diffData(item1) {
					var history_obj1 = "";
					var prev_obj = JSON.parse(item1.previous_value);
					var current_obj = JSON.parse(item1.current_value);
                var i18nObj = {
                    prev: {
                        default_settings: {
                            columns: []
                        }
                    },
                    current: {
                        default_settings: {
                            columns: []
                        }
                    }
                };
					if (item1.previous_value != item1.current_value) {
                    if (JSON.stringify(prev_obj["default_settings"]) !== JSON.stringify(current_obj["default_settings"])) {
                        if (current_obj["default_settings"]["columns"].toString() !== prev_obj["default_settings"]["columns"].toString()) {
                            /**
                             * Get all i18n key
                             */
                            jQuery.each(current_obj["default_settings"]["columns"], function(_index, singleItem) {
                                if (i18nData[singleItem]) {
                                    i18nObj["current"]["default_settings"]["columns"].push(i18nData[singleItem]);
                                }
                            });
                            jQuery.each(prev_obj["default_settings"]["columns"], function(_index, singleItem) {
                                if (i18nData[singleItem]) {
                                    i18nObj["prev"]["default_settings"]["columns"].push(i18nData[singleItem]);
                                }
                            });
								var prevCol = i18nObj["prev"]["default_settings"]["columns"];
								var currentCol = i18nObj["current"]["default_settings"]["columns"];
								history_obj1 += "<p>" + translate("sdp.colorsettings.history.changed.from", [
									translate("sdp.admin.site.refer.radio.label"),
									prevCol == 0 ? "-" : prevCol.join(", "),
									currentCol == 0 ? "-" : currentCol.join(", ")
                            ]) + "</p>";
                        }
                        if (current_obj["default_settings"]["background_color"] !== prev_obj["default_settings"]["background_color"]) {
								history_obj1 += "<p> " + translate("sdp.dashboard.common.backgroundcolor") + ' <b>: </b> <em class="priority-badge borderBlack mr3" style="background-color:' + prev_obj["default_settings"]["background_color"] + '">&nbsp;</em> ' + prev_obj["default_settings"]["background_color"] + "&nbsp;" + translate("sdp.common.to1") + '&nbsp; <em class="priority-badge borderBlack mr3" style="background-color:' + current_obj["default_settings"]["background_color"] + '">&nbsp;</em>' + current_obj["default_settings"]["background_color"]+ "</p>"; //No i18N
							}
							if (current_obj["default_settings"]["default_background"] !== prev_obj["default_settings"]["default_background"]) {
								history_obj1 += '<p>' + translate("sdp.admin.css.default") + ' <b>: </b> <em class="priority-badge borderBlack mr3" style="background-color:' + prev_obj["default_settings"]["default_background"] + '">&nbsp;</em> ' + prev_obj["default_settings"]["default_background"] + "&nbsp;" + translate("sdp.common.to1") + '&nbsp; <em class="priority-badge borderBlack mr3" style="background-color:' + current_obj["default_settings"]["default_background"] + '">&nbsp;</em>' + current_obj["default_settings"]["default_background"]+ '</p>'; //No i18N
                        }

                    }
                    if (JSON.stringify(prev_obj["other_settings"]) !== JSON.stringify(current_obj["other_settings"])) {
							if (current_obj["other_settings"].length == 0 && prev_obj["other_settings"][0]["field"]) {
								history_obj1 += "<p> " + translate("sdp.colorsettings.history.changed.from", [
									translate("sdp.admin.requesttemplate.insertfield.constraint.message.part1"),
									i18nData[prev_obj["other_settings"][0]["field"]],
									"-"
								]) + " </p>";
							}
							if (prev_obj["other_settings"].length == 0 && current_obj["other_settings"][0]["field"]) {
								history_obj1 += "<p> " + translate("sdp.colorsettings.history.changed.from", [
									translate("sdp.admin.requesttemplate.insertfield.constraint.message.part1"),
									"-",
									i18nData[current_obj["other_settings"][0]["field"]]
								]) + " </p>";
							}
							if (current_obj["other_settings"][0] && current_obj["other_settings"][0]["field"]) {
								if (prev_obj["other_settings"][0] && prev_obj["other_settings"][0]["field"]) {
                        if (current_obj["other_settings"][0]["field"] !== prev_obj["other_settings"][0]["field"]) {
										history_obj1 += "<p> " + translate("sdp.colorsettings.history.changed.from", [
											translate("sdp.admin.requesttemplate.insertfield.constraint.message.part1"),
                                i18nData[prev_obj["other_settings"][0]["field"]],
                                i18nData[current_obj["other_settings"][0]["field"]]
                            ]) + " </p>";
                        }
								}
                        for (var os_index = 0; os_index < current_obj["other_settings"].length; os_index++) {
                            var element = current_obj["other_settings"][os_index];
                            for (var values_index = 0; values_index < element.values.length; values_index++) {
                                var cs = element.values[values_index];
										history_obj1 += " <p> " + e_html(cs["name"]) + '   <b>: </b>  <em class="priority-badge borderBlack mr3" style="background-color:' + e_html(element["background_color"]) + '">&nbsp;</em>  ' + e_html(element["background_color"]) + " </p> ";
									}
                            }
                        }
                    }
						if (item1.field.name === "is_enabled" && item1.current_value !== item1.previous_value) {
                        if (current_obj) {
								history_obj1 += translate("common.enabled.msg", [
									translate("sdp.colorsettings")
                            ]);
                        } else {
								history_obj1 += translate("common.disabled.msg", [
									translate("sdp.colorsettings")
                            ]);
                        }
                    }
						if (item1.field.name === "tech_personalized" && item1.current_value !== item1.previous_value) {//Allow technicians to personalize their Color Setting  -- option changes event in history
							var techstatus = (item1.current_value == "true") ? "common.enabled.msg" : "common.disabled.msg";//No I18N
							var techKey = translate(techstatus, [translate("allow.technician.personalize.colorsetting")]);
							history_obj1 += "<p>" + techKey + "</p>";
						}
						item1["current_value"] = history_obj1;
                } else {
                    isGohead = false;
                }
					return history_obj1;
            }
				history_obj += diffData(item.diff[0]);
				if(item.diff[1]) {
					history_obj += diffData(item.diff[1]);
				}
            }
            if (isGohead && item) {
                finalData.push(item);
            }
        }
        if (sort_order === "D") { // No I18N
            finalData = finalData.reverse();
        }
        return finalData;
    },
    /**
     * A varible that contains i18n key for color settings row
     *  @param key : string
     *  if the key is passed, it return the internationalized string, otherwise it return the full data
     */
    geti18nColumnName: function(key) {
        var i18nColumnName = {
            all_columns: translate("sdp.request.listview.allcolumns"), //NO I18N
            category: translate("sdp.requests.common.category"),
            checkbox: translate("common.checkbox.button"), //NO I18N
            completed_time: translate("sdp.requests.viewrequest.completeddate"), //NO I18N
            created_by: translate("common.createdby"), //NO I18N
            created_time: translate("sdp.requests.common.createddate"), //NO I18N
            department: translate("sdp.helpdesk.common.dept"), //NO I18N
            due_by_time: translate("sdp.requests.common.dueby"), //NO I18N
            group: translate("common.group"), //NO I18N
            id: translate("sdp.common.id"), //NO I18N
            impact: translate("sdp.problem.impact"), //NO I18N
            item: translate("sdp.common.item"), //NO I18N
            level: translate("sdp.requests.common.level"), //NO I18N
            mode: translate("sdp.requests.common.mode"), //NO I18N
            notassigned: translate("sdp.request.common.notassigned"), //NO I18N
            priority: translate("sdp.requests.common.priority"), //NO I18N
            request_type: translate("sdp.admin.common.requesttypelist"), //NO I18N
            service_category: translate("sdp.itil.common.service.category"), //NO I18N
            status: translate("sdp.requests.common.status"), //NO I18N
            subcategory: translate("sdp.common.subcategory"),
            subject: translate("sdp.common.subject"), //NO I18N
            technician: translate("sdp.requests.viewrequest.listview.assignedto"), //NO I18N
            template: translate("common.templatename"), //NO I18N
            urgency: translate("sdp.requests.common.level"), //NO I18N
            title: translate("sdp.common.title"), //NO I18N
            risk: translate("sdp.admin.change.risk"), //NO I18N
            stage: translate("sdp.admin.change.stage"), //NO I18N
			emergency: translate("sdp.change.rfc.emergency"), //NO I18N
            change_type: translate("sdp.itil.common.changetype"), //NO I18N
            release_type: translate("common.release") + " " + translate("common.type"), // NO I18N
        };
        if (key && i18nColumnName[key]) {
            return i18nColumnName[key];
        } else {
            return i18nColumnName;
        }
    },
	//Tab switch event Global/Personalize
    tabSwitch: function(tabopt) {
		var self = this;
		self.renderHeaderToggle = false;
		if(tabopt == "mypersonalize") {
			var tech_cust_person = sdp_user.CLIENT_CONF["Color_myPersonalize_"+self.options.module];//render technician own customization
			if(tech_cust_person && tech_cust_person != "false") {
                var csJSON = tech_cust_person.color_json;
                if(typeof csJSON === "string") {
                    csJSON = JSON.parse(csJSON);
                }
				self.options.cs_data = tech_cust_person;
				self.options.default_settings = csJSON.default_settings;
    }
			self.options.setting_permission.render_tabs = "mypersonalize";//No I18N
		} else {
			self.options.setting_permission.render_tabs = "global";//No I18N
			sdpAjax({
				async: false,
				ignorefailuremessage:true,
				url: "/api/v3/color_settings/" + self.options.cs_entitiy_id, //No I18N
				success: function(response) {
					try {
						var res = JSON.parse(response);

					} catch (error) {
						var res = response;
					}
					self.options.cs_data = res.color_setting;
				}
			});
		}
		this.renderView();
	},
};

