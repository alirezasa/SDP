if(typeof $dash == 'undefined') {
    var $dash = {};
}
if(typeof $dash.newWidgets == 'undefined') {
    $dash.newWidgets = {
        removedWidgets: {}, restoredWidgets: {}
    };
}
$dash.common = {
    widgetNameMaxLength: 100,
    //initialize the table/graph widget sharing multiselect field
    initSharingField: function(sharingField, options={}) {
        let isDeptHeadSelected = options.isDeptHeadSelected;
        let isExecutive = options.isExecutive;
        let isHome = options.isHome;
        let isDashboard = options.isDashboard;
        if(isExecutive == undefined) {
            isExecutive = $dash.newWidgets.isExecutiveDashboard();
        }
        let isHomeorDash = isHome || isDashboard;

        let config = {
            add_first: false,
            choose_display_name: translate("dashboard.shareto"), //No I18n
            holder: sharingField,
            view_type : "dropdown-search", //No I18n
            max_selection: 100,
            type_transformer: {
                groups: isHomeorDash ? "SUPPORTGROUP" : "supportGroup", //No I18n
                orgRoles: isHomeorDash ? "ORGROLE" : "orgRole", //No I18n
                users: isHomeorDash ? "SDUSER" : "user", //No I18n
                roles: isHomeorDash ? "USERROLE" : "userRole", //No I18n
                user_groups: isHomeorDash ? "USERGROUP" : "userGroup" //No I18n
            },
            multi_select: [
                {
                    type: "users", //No I18n
                    display_name: isExecutive ? translate("dashboard.usertech") : translate("sdp.admin.leftpanel.users.technician"), //No I18n
                    api_url: [
                        {
                            url: !isExecutive ? "technicians": "users", //No I18n
                            search_placeholder: isExecutive ? translate("ae.header.search.users") : translate("sdp.requests.search.technician"), //No I18n
                            entity_key: !isExecutive ? "technicians": "users" //No I18n
                        }
                    ],
                    row_count: 100,
                    values: []
                },
                {
                    type: "roles", //No I18n
                    display_name: translate("dashboard.techRoles"), //No I18n
                    api_url: [
                        {
                            url: "technicians/associated_roles", //No I18n
                            search_placeholder: translate("search.prefix", [translate("dashboard.techRoles")]), //No I18n
                            entity_key: "associated_roles" //No I18n
                        }
                    ],
                    updateInputData: function(inputData) {
                        if(inputData.list_info.search_criteria.children == undefined) {
                            inputData.list_info.search_criteria.children = [];
                        }
                        inputData.list_info.search_criteria.children.push({field : 'name',condition:"is not",values: ["MDMPAdmin", "MDMPGuest", "DCAdmin", "DCGuest"],logical_operator:'and'}); //No I18n
                    },
                    row_count: 100,
                    values: []
                },
                {
                    type: "groups", //No I18n
                    parent_entity:'site', //No I18n
                    display_name: translate("sdp.admin.leftpanel.helpdesk.queues"), //No I18n
                    api_url: [
                        {
                            url: "support_groups", //No I18n
                            search_placeholder: translate("search.prefix", [translate("sdp.admin.leftpanel.helpdesk.queues")]), //No I18n
                            entity_key: "support_groups" //No I18n
                        }
                    ],
                    updateInputData: function(inputData) {
                        if(inputData.list_info.search_criteria.children == undefined) {
                            inputData.list_info.search_criteria.children = [];
                        }
                        inputData.list_info.search_criteria.children.push({field : 'deleted',condition:"is",value: false,logical_operator:'and'});
                    },
                    row_count: 100,
                    values: [],
                    formatResult: this.formatSupportGroup,
                    formatSelection: this.formatSupportGroup,
                },
                ... !isHome ? [{
                    type: "user_groups", //No I18n
                    display_name: translate("sdp.admin.group.user"), //No I18n
                    api_url: [
                        {
                            url: "user_groups", //No I18n
                            search_placeholder: translate("search.prefix", [translate("sdp.admin.group.user")]), //No I18n
                            entity_key: "user_groups" //No I18n
                        }
                    ],
                    row_count: 100,
                    values: []
                }]:[],
                {
                    type: "orgRoles", //No I18n
                    display_name: translate("sdp.admin.leftpanel.helpdesk.orgroles"), //No I18n
                    api_url: [{
                        items_to_add: function (item, parentItem, option) {
                            var defaultItem = { associated_entity: 'DEPARTMENT', name: 'Department Head', description: 'Department Head', id: '1', display_name: '$DEPT_HEAD$' }; //No I18n
                            if (item) {
                                var deptIdx = item.findIndex(ele => ele.associated_entity === 'DEPARTMENT'); // No I18N
                                item.splice(deptIdx == -1 ? item.length : deptIdx, 0, { associated_entity: 'DEPARTMENT', name: 'Department Head', description: 'Department Head', id: '1', display_name: '$DEPT_HEAD$' }); //No I18n
                            } else if (isDeptHeadSelected) {
                                return [defaultItem];
                            }
                        },
                        url: "org_roles", //No I18n
                        search_placeholder: translate("search.prefix", [translate("sdp.admin.leftpanel.helpdesk.orgroles")]), //No I18n
                        entity_key: "org_roles" //No I18n
                    }],
                    row_count: 100,
                    values: []
                }
            ]
        };
        return sdpMultiSelect(config);
    },

    //Format support group with site name in the brackets for table/graph widget sharing multiselect
    formatSupportGroup: function(group) {
        let groupName = group.name;
        if(group.site) {
            groupName = groupName + " ("+group.site.name+")";
        }
        return e_html(groupName);
    },

    //Opens the new widget panel for both dashboard and Homepage
    openSlider: async function(widget) {
        if(jQuery("#addNewWidget a").data("isNotPermitted")) {
            return;
        }
        const _this = $dash.newWidgets;
        let isHome = $dash.gridster.options.isHomePage;
        $dash.common.closeDialog();
        _this.isAdmin = sdp_user.ROLES.indexOf("SDSiteAdmin")!=-1 || sdp_user.ROLES.indexOf("SDAdmin")!=-1;
        let isSDCoordinatorHelpdesk = sdp_user.ROLES.indexOf("SDCo-ordinator")!=-1 && jQuery("#view-listing li.active").data("view")=='Dashboard1'; // NO I18N
        let isProjectAdmin = sdp_user.ROLES.indexOf("Project Admin")!=-1 && jQuery("#view-listing li.active").data("view")=='ProjectHome'; // NO I18N
        let isExecutive = isHome ? false : _this.isExecutiveDashboard();
        _this.showAccessiblity = isSDCoordinatorHelpdesk || isProjectAdmin;

        let externalWidgetTypes = [{value: "URL", i18nKey: "common.url", isChecked: "checked"}, {value: "Editor", i18nKey: "common.html"}, {value: "Attach", i18nKey: "sdp.common.file"}]; // NO I18N
        if(isSDCoordinatorHelpdesk && !_this.isAdmin) {
            externalWidgetTypes.pop(); //Restricting file widget for SDCO-ordinator for Helpdesk Dashboard
        }
        let tabs = [
            {tab: "Existing", width: "145", i18nKey: 'sdp.dashboard.common.existingwidgets', active: "active"}, // NO I18N
            {tab: "External", width: "140", i18nKey: 'sdp.dashboard.common.externalwidgets'}, // NO I18N
            {tab: "Table", width: "115", i18nKey: 'dashboard.table.widget'}, // NO I18N
            {tab: "Graph", width: "115", i18nKey: 'dashboard.graph.widget'} // NO I18N
        ];
        let widgetTypes = ["Table", "Graph"]; // NO I18N

        let newWidgetHTML;
        let templateData = {showAccessiblity: _this.showAccessiblity, isAdmin: _this.isAdmin, isExecutiveDashboard: isExecutive, externalWidgetTypes: externalWidgetTypes, tabs: tabs, widgetTypes: widgetTypes, widgetNameLength: $dash.common.widgetNameMaxLength};
        if(widget) {
            widget.display_name = " - "+widget.name;
            templateData = {...templateData, showAccessiblity: _this.showAccessiblity, isHome, isAdmin: _this.isAdmin,  isEdit: true, widget: widget, title: "sdp.dashboard.common.editwidget", isExecutiveDashboard: isExecutive}; // NO I18N
            newWidgetHTML = renderhbs(null, "new-widget", templateData, false, "dashboard", true, true, null, true); // NO I18N
        }
        else {
            let removedWidgets = await $dash.common.populateRemovedWidgets(isExecutive);
            const isRemovedWidgetsAvailable = Object.keys(removedWidgets).length>0;
            templateData = {...templateData, showAccessiblity: _this.showAccessiblity, isHome, isAdmin: _this.isAdmin, removedWidgets: removedWidgets, isRemovedWidgetsAvailable: isRemovedWidgetsAvailable, title: "sdp.dashboard.common.newwidget", isExecutiveDashboard: isExecutive}; // NO I18N
            newWidgetHTML = renderhbs(null, "new-widget", templateData, false, "dashboard", true, true, null, true); // NO I18N
        }

        _this.container = jQuery(newWidgetHTML);
        if(templateData.isRemovedWidgetsAvailable==false) {
            _this.container.find("#emptyExistingWidgetsMsg").removeClass("hide");
        }
        _this.container = _this.container.show().panelSlider({
            width: 570,
            header: false,
            placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
            dialogClass: "tabui-rightpanel pos-fix", // NO I18N
            open: async function() {
                zcomponent.collapsible_init("#ExistingWidgetsList"); //No I18n
                $header.searchCategories(jQuery("#ExistingWidgetsSearchBar"));

                $sdStyleConverter(_this.container);
                $sdEventListener(_this.container);
                
              if (!isHome) {
                widgetTypes.forEach(function(type) {
                    _this.container.find("#widgetForm_"+type).append(_this.container.find("#widgetBaseForm_"+type+" >div"));
                    _this.initJQueryValidation(type);

                    if(_this.isAdmin || _this.showAccessiblity) {
                        let shareContainer = _this.container.find("#sharingContainer_"+type);
                        shareContainer.append(_this.container.find("#shareWidgetBase_"+type+" >div"));
                        if(_this.shareType == $dash.SHARE_TYPE.PUBLIC || _this.showAccessiblity) {
                            shareContainer.find("#Public_Mode_"+type).click();
                            _this.existingShareType = "Public"; // NO I18N
                        }
                        else {
                            shareContainer.find("#Private_Mode_"+type).click();
                            _this.existingShareType = "Private"; // NO I18N
                        }
                        if(_this.showAccessiblity && !_this.isAdmin) {
                            shareContainer.find("input[type=radio]").attr("disabled", true);
                        }
                        let sharingField = _this.container.find("#sharingContainer_"+type).find("#shareMultiSelect_"+type);
                        _this["multiSelect_"+type] = $dash.common.initSharingField(sharingField);
                        jQuery(sharingField).off('click').on("click", function() {
                            _this.container.find("#"+type+"_WidgetPane label.alert-danger").remove();
                        });
                    }
                });
                await _this.loadModuleList();
              }
                if(widget && widget.widget_type) {
                    _this.populateEditWidget(widget); //for table graph widget
                }
                else {
                    $dash.common.changeTab("Existing"); // NO I18N
                }
                initTooltip("#WidgetNewPanel"); // NO I18N
                _this.isSliderOpen = true;
                $sdEventListener(_this.container);
            },
            beforeClose: function() {
                if(_this.isCloseButtonClick) {
                    return true;
                }
                let close = false;
                if(!widget) {
                    const tab = _this.container.find("#NewWidgetsTabs >li.active").data("tab"); // NO I18N
                    if(tab=="Table" || tab=="Graph") {
                        let module = _this.container.find("#widgetModule_"+tab).select2("val"); // NO I18N
                        if(module) {
                            showconfirm(true,'title='+"Confirm"+',message='+getMessageForKey("sdp.requestcatalog.reorder.discard")+',submitbutton='+getMessageForKey('common.yes')+',cancelbutton='+getMessageForKey('common.no')+', closebutton=no, closeOnEscKey=no', function(ok) { //NO I18N
                                if(ok) {
                                    $dash.common.closeDialog();
                                }
                            });
                        }
                        else {
                            close = true;
                        }
                    }
                    else {
                        close = true;
                    }
                }
                return close;
            }
        });
    },

    populateRemovedWidgets: async function(isExecutive) {
        const _this = $dash.newWidgets;
        let isHome = $dash.gridster.options.isHomePage;
        let removedWidgets = {};
        jQuery("#removedWidgets > li").each(function(i, v) {
            let widgetId = jQuery(v).data("widgetid"); // NO I18N
            let widgetName = jQuery(v).data("name"); // NO I18N
            let module = jQuery(v).data("module"); // NO I18N
            if(module=="Table" || module=="Graph") {
                _this.initRemovedWidgetType(removedWidgets, module);
                let widgetModule = jQuery(v).find(".widget-bg").data("belongsto"); // NO I18N
                widgetId = widgetId.replace(module+"_", "");
                removedWidgets[module].push({id: widgetId, name: widgetName, type: module, module: widgetModule, isExeWidget: isExecutive});
            }
            else {
                if(module==undefined && jQuery(v).data("external")==true) {
                    module = "external"; //NO I18N
                }
                else if (module==undefined && isHome) {
                    module = "default";  //No I18n
                }
                if(!removedWidgets.hasOwnProperty(module)) {
                    var key = (module === "custom_widget") ? "sdp.dashboard.customwidget.header.label" : "sdp.dashboard.common."+module+"widgets"; // NO I18N
                    removedWidgets[module]=[];
                    removedWidgets[module].name = translate(module == "default" ? "sdp.home.ssp.customization.common.defaultwidgets" : key); // NO I18N
                }
                removedWidgets[module].push({id: widgetId, name: widgetName});
            }
        });
        (!isHome) && (removedWidgets = await _this.loadTableGraphRemovedWidgets({removedWidgets: removedWidgets}));
        return removedWidgets;
    },

    //Handling switching of tabs -- Existing, External, Table & Graph Widgets
    changeTab: function(tab) {
        let _this = $dash.newWidgets;
        $dash.gridster.options.isDashboard && _this.closeGraphPreview();
        setTimeout(function() {
            let firstInput = _this.container.find("#"+tab+"_WidgetPane input:first");
            if(firstInput.length > 0) {
                firstInput.get(0).focus();
            }
        }, 200);
    },

    //Close the new widget panel
    closeDialog: function(close) {
        let _this = $dash.newWidgets;
        $dash.gridster.options && $dash.gridster.options.isDashboard && _this.closeGraphPreview();
        if(_this.container) {
            if(close) {
                _this.isCloseButtonClick = true;
                _this.container.dialog('close'); //NO I18N
                _this.isCloseButtonClick = false;
            }
            _this.container.dialog('destroy'); //NO I18N
            delete _this.container;
        }
        _this["multiSelect_Graph"] = _this["multiSelect_Table"] = null;
        jQuery("#alertbox").remove();
    },

    //Toggle between ULR, HTML & File widget types
    toggleExternalWidgetTypes: function(_this) {
        $dash.newWidgets.container.find('#widtabcontent > .active').removeClass("active").end().find("#maintab_"+_this.value).addClass("active");
        if(_this.value=="Editor") {
            zeditor({element:'externalWidget',edithtml:true,customName:'editor2',toolbar:'generalToolbar'}); //No I18n
        }
    },

    //Open Embed widget dialog
    openEmbedDialog: function(_this) {
        let title = jQuery(_this).parents("div.widget-bg").find(".widgets-hdr-txt,.new-header,.widget-title").first().text().trim(); //No I18N
        if(title=='') {
            title = jQuery(_this).parents("div.widget-bg").find("#widgetDropdown_0").val(); //No I18N
        }
        jQuery('#shareWidgetHeader #widgetName').text(title);
        var widgetDiv = jQuery(_this).parents("div.widget-bg"); //No I18N
        var widgetName = widgetDiv.data("widgetname"); //No I18N

        var siteEnabled = jQuery("#siteSelection").length>0 && !jQuery(".site-selection-container").hasClass("hide"); //No I18N
        var groupEnabled = jQuery("#groupSelection").length>0 && !jQuery(".group-selection-container").hasClass("hide"); //No I18N
        if(widgetDiv.data("module")=="problemchange") {
            groupEnabled = false;
        }

        var filtersEnabled = siteEnabled || groupEnabled;
        var siteGroupDisabledModules = ["custom_widget", "custom_report", "asset", "project", "Table", "Graph"]; //No I18N
        if(siteGroupDisabledModules.indexOf(widgetDiv.data("module"))!=-1 || widgetName=="DrillDownAnalysis") {
            filtersEnabled = false;
        }
        
        var enableSiteGroupText = "widget.embed.sitegroup.filter"; //No I18N
        if(filtersEnabled) {
            if(siteEnabled && !groupEnabled) {
                enableSiteGroupText = "widget.embed.sitefilter"; //No I18N
            }
            else if(!siteEnabled && groupEnabled) {
                enableSiteGroupText = "widget.embed.groupfilter"; //No I18N
            }
        }

        var url = $dash.common.constructEmbedUrl(widgetDiv, filtersEnabled);
        let templateData = {url: url, widgetName: widgetName, siteFilterEnabled: filtersEnabled, enableSiteGroupText: enableSiteGroupText};
        var widgetSharing = renderhbs(null, 'widget-sharing', templateData, false, 'dashboard', true, true, null, true); // NO I18N
        widgetSharing = jQuery(widgetSharing).dialog({
            width: '700px', //No I18N
            modal: true,
            resize: false,
            position: { my: 'top', at: 'top+100' }, //No I18N
            open: function() {
                jQuery(this).closest('.ui-dialog').find('.ui-dialog-titlebar .ui-dialog-title').html(jQuery('#shareWidgetHeader').html()); //No I18N
                jQuery(".ui-dialog-titlebar-close").attr({"rel": "uitip", "title": translate('sdp.common.close')}); //No I18N
                initTooltip(".ui-dialog "); //No I18N
            },
            close: function(event, ui) {
                jQuery(this).dialog('destroy').remove(); //No I18N
            }
        });
        $sdEventListener(widgetSharing);
        $sdStyleConverter(widgetSharing);
    },

    //Construct Embed widget URL
    constructEmbedUrl: function(widgetDiv, filtersEnabled) {
        var module = widgetDiv.data("module"); //No I18N
        var isReport = module === "custom_report"; //No I18N
        var view = jQuery("#view-listing li.active").data("view"); //No I18N
        var shareUrl = window.location.protocol+"//"+sdp_app.ALIAS_URL+window.location.pathname+"?action=embedWidget&externalframe=true&"; //No I18N
        var isHomePage = typeof $home_page != "undefined"; //No I18N
        if (!isHomePage) {
             shareUrl += "view="+view; //No I18N
             shareUrl += "&show_filters="+encodeURIComponent(filtersEnabled); //No I18N
         } else {
             shareUrl += "widget="+widgetDiv.closest("li").attr("id"); //No I18N
         }
         
        if (!isHomePage) {
          if(isReport) {
              shareUrl += "&isReport=true"; //No I18N
              shareUrl += "&reportId="+encodeURIComponent(widgetDiv.parent().data("widgetid")); //No I18N
          }
          else if(module=="Table" || module=="Graph") {
              shareUrl += "&widget="+encodeURIComponent(widgetDiv.parent().data("widgetid")); //No I18N
          }
          else if (module === "custom_widget") { //No I18N
            shareUrl += "&widget="+widgetDiv.data("widgetname"); //No I18N
            shareUrl += "&widgetId=" +widgetDiv.data("actualwidgetid"); //No I18N
          }
          else {
              var widgetName = widgetDiv.data("widgetname"); //No I18N
              shareUrl += "&widget="+encodeURIComponent(widgetName); //No I18N

              var dropdownName = "type"; //No I18N
              if(widgetName=="Software" || widgetName=="WorkStations") {
                  dropdownName = "widgetId"; //No I18N
              }
              else if(widgetName=="ProblemChart") {
                  dropdownName = "MOD"; //No I18N
              }

              var selectedWidgetId = widgetDiv.find("#widgetDropdown_0[name="+dropdownName+"]").find(":checked").data("value"); //No I18N
              if(selectedWidgetId && (isInteger(selectedWidgetId) || dropdownName=="MOD")) {
                  shareUrl += "&widgetId="+encodeURIComponent(selectedWidgetId); //No I18N
              }
              var selectedTime = widgetDiv.find("select[name=time]").find(":checked").data("value"); //No I18N
              if(selectedTime) {
                  shareUrl += "&time="+encodeURIComponent(selectedTime); //No I18N
              }else{// Msp code for msp dash boards use type
                selectedTime = widgetDiv.find("#widgetDropdown_0[name=type]").find(":checked").data("value"); //No I18N
                if(selectedTime && selectedTime.toString().indexOf("_")!=-1) {
                    shareUrl += "&time="+encodeURIComponent(selectedTime); //No I18N
                }else{
                    selectedTime = widgetDiv.find("#widgetDropdown_0[name=contract]").find(":checked").data("value"); //No I18N
                    if(selectedTime) {
                        shareUrl += "&time="+encodeURIComponent(selectedTime); //No I18N
                    }
                }
            }
              var graphType = widgetDiv.find("#widget-menu .graph-type a.active").data("graphtype"); //No I18N
              if(graphType) {
                  shareUrl += "&graph="+encodeURIComponent(graphType); //No I18N
              }
              if(filtersEnabled) {
                  shareUrl = $dash.embed.attachSiteGroupinUrl(shareUrl, widgetDiv);
              }
          }
          shareUrl += "&executivedashboard="+$dash.newWidgets.isExecutiveDashboard(); //No I18N
          if(isMSP){
            shareUrl +="&persistentAccountId="+getAccountId()+"&ACCOUNTID="+getAccountId()+"&persistAccountID=true"; //No I18N
          }
        }
        shareUrl += "&PORTALID="+sdp_app.PORTAL_ID; //No I18N
        return shareUrl;
    },

    //Bulk select in create dashboard and home tab
    toggleBulkSelection: function(e, selectAllToggleBtn) {
        e.stopPropagation();
        if (jQuery(selectAllToggleBtn).prop("checked") == true) {
            jQuery(selectAllToggleBtn).closest(".report-container").find('input[type=checkbox].dashboard-include-report').prop('checked', 'checked'); //No I18n
            jQuery(selectAllToggleBtn).attr("data-selected", "true");
        } else {
            jQuery(selectAllToggleBtn).closest(".report-container").find('input[type=checkbox].dashboard-include-report').prop('checked', ''); //No I18n
            jQuery(selectAllToggleBtn).attr("data-selected", "false");
        }
    },

    toggleModuleBulkOperationButton: function($reportContainer, totalReports, selectedReports) {
        if (!(totalReports - selectedReports)) {
            $reportContainer.find("[action='selection-toggle']").prop("checked", true); //No I18n
        } else {
            $reportContainer.find("[action='selection-toggle']").prop("checked", false); //No I18n
        }
    },

    toggleBulkSelectionOnchange: function (e) {
        e.stopPropagation();
        var $reportContainer = jQuery(e.target).closest(".report-container"); //No I18n
        var totalCheckBoxesCount = $reportContainer.find("input[type='checkbox'].dashboard-include-report").length;
        var selectedCheckBoxesCount = $reportContainer.find("input[type='checkbox'].dashboard-include-report:checked").length;
        $dash.common.toggleModuleBulkOperationButton($reportContainer, totalCheckBoxesCount, selectedCheckBoxesCount);
    },

    //Copy the embed URL when copy icon is clicked
    copyEmbedCode: function(_this) {
        var temp = document.createElement("textarea");
        temp.textContent = jQuery(_this).siblings("#embedCode").val(); //No I18N
        temp.style.position = "fixed";
        document.body.appendChild(temp);
        window.getSelection().selectAllChildren(temp);
        document.execCommand("copy"); //No I18N
        document.body.removeChild(temp);
        showalert('success', translate("msteams.copied"),'isAutoHide=true');//No I18N
    },
};
