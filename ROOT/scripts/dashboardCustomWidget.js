if(typeof $dash == 'undefined') {
    var $dash = {};
}
$dash.newWidgets = {
    modifiedShareInfo: {}, checkFilters: {}, widgetData: {}, removedWidgets: {}, restoredWidgets: {},
    listviewFilterPromise: {}, metaInfoPromise: {}, tableCompObj: {},
    isCustomModulePopulated: false,
    defaultFilters: {asset: translate("sdp.inventory.assets.all"), project: translate("sdp.admin.projectroles.allowallprojects")}, //NO I18N
    entities: {
        request: {
            apiName: "requests", // NO I18N
            defaultColumn: ["id","subject","due_by_time","technician", "status","created_time"], // NO I18N
            role: "ViewRequests", // NO I18N
            displayName: translate("common.request"), // NO I18N
            isEnabled: true,
            skipColumnsForRequester: ["has_notes", "has_linked_requests", "sla", "is_fcr", "ola_due_by_time", "assigned_time", "is_shared", "has_dependency", "is_reopened", "first_response_due_by_time", "fr_sla_violated_group", "sla_violated_technician", "editor", "fr_sla_violated_technician", "sla_violated_group"] // NO I18N
        },
        asset: {
            apiName: "asset_assets", // NO I18N
            defaultColumn: ['name', 'product', 'module', 'asset_type', 'user', 'department'], // NO I18N
            role: "ViewInventoryWS", // NO I18N
            displayName: translate("common.asset"), // NO I18N
            isEnabled: sdp_app.IS_ASSET_MODULE
        },
        change: {
            apiName: "changes", // NO I18N
            defaultColumn: ["id","title","change_owner","category","priority","change_type","stage"], //NO I18N
            role: "ViewChanges", // NO I18N
            displayName: translate("common.change"), // NO I18N
            isEnabled: sdp_app.IS_CHANGE_ENABLED
        },
        release: {
             apiName: "releases", // NO I18N
             defaultColumn: ["id","title","release_type","stage","status","release_engineer"], //NO I18N
             role: "ViewReleases", // NO I18N
             displayName: translate("common.release"), // NO I18N
             isEnabled: sdp_app.IS_CHANGE_ENABLED
        },
        solution: {
            apiName: "solutions", // NO I18N
            defaultColumn: ["id","title","topic","approval_status","type","created_by"], //NO I18N
            role: "ViewSolutions", // NO I18N
            displayName: translate("common.newsolution"), // NO I18N
            isEnabled: true
        },
        request_maintenance: {
            apiName: "request_maintenances", // NO I18N
            defaultColumn: ["id","name","created_time","maintenancestate","group","technician"], //NO I18N
            role: "ViewRequestMaintenances", // NO I18N
            displayName: translate("common.maintenance"), // NO I18N
            isEnabled: true
        },
        project: {
            apiName: "projects", // NO I18N
            defaultColumn: ["title","status","priority","owner","scheduled_end_time","projected_end_time"], //NO I18N
            role: "Project Admin", // NO I18N
            displayName: translate("common.project"), // NO I18N
            isEnabled: sdp_app.IS_PROJECT_ENABLED
        },
        task: {
            apiName: "tasks", // NO I18N
            defaultColumn: ["title", "status", "priority", "owner", "scheduled_start_time", "scheduled_end_time"], // NO I18N
            displayName: translate("common.task"), // NO I18N
            roles: ["ViewRequests","ViewProblems","ViewChanges","ViewReleases"], // NO I18N
            isEnabled: true,
            mustInclude: ["request","project","change","problem","milestone","release","associated_entity"] // NO I18N
        }
    },

    initRemovedWidgetType: function(removedWidgets, widgetType) {
        if(!removedWidgets.hasOwnProperty(widgetType)) {
            removedWidgets[widgetType]=[];
            removedWidgets[widgetType].name = translate("dashboard."+widgetType.toLowerCase()+".widget"); // NO I18N
            removedWidgets[widgetType].isAllowedToDelete = true;
        }
        return removedWidgets;
    },

    //Get the removed Table and Graph widgets needed for exisitng widgets list
    loadTableGraphRemovedWidgets: function(options) {
      let removedWidgets = options.removedWidgets==undefined ? {} : options.removedWidgets; 
      let addEditDash =  options.addEditDash==undefined ? false : options.addEditDash;
      let _this = $dash.newWidgets;
      return new Promise(function(resolve, reject) {
        sdpAjax({
            url: "/api/v3/widgets/_get_removed_widgets", // NO I18N
            success: async function(response) {
                let widgets = response.widget.widgets;
                let widgetsCount = widgets.length;
                for(i=0;i<widgetsCount;i++) {
                    let widget = widgets[i];
                    let widgetType = widget.widget_type;
                    if(_this.restoredWidgets[widgetType+"_"+widget.id]==undefined) {
                        if(widgetType=="Table" || widgetType=="Graph") {
                            let allowed = await _this.checkModulePermission(widget.module, addEditDash);

                            let isExeWidget = JSON.parse(widget.properties).isExecutiveWidget;
                            if(!options.addEditDash) {
                                let isExeDash = $dash.newWidgets.isExecutiveDashboard();
                                if(widget.module=="request") {
                                    allowed = allowed && ((isExeDash && isExeWidget) || (!isExeDash && !isExeWidget));
                                }
                            }

                            if(allowed) {
                                _this.initRemovedWidgetType(removedWidgets, widgetType)
                                if(removedWidgets[widgetType].filter(addedWidget => addedWidget.id==widget.id).length == 0) {
                                    removedWidgets[widgetType].push({id: widget.id, name: widget.name, type: widgetType, module: widget.module, isExeWidget: isExeWidget});
                                }
                            }
                        }
                    }
                }
                resolve(removedWidgets);
            }
        });
      });
    },
    
    existingShareType: "Private", // NO I18N
    //Handling Toggle between private, public and shared Options
    toggleShareTo: async function() {
        let _this = this;
        const tab = _this.container.find("#NewWidgetsTabs >li.active").data("tab"); // NO I18N
        let shareContainer = _this.container.find("#sharingContainer_"+tab);
        if(shareContainer.length==0) {
            return;
        }

        let shareType = shareContainer.find('input[name=widgetShareType_'+tab+']:checked').val();
        function toggleMultiSelect() {
            let shareToElem = shareContainer.find('#shareToContainer_'+tab);
            if(shareType == 'Shared') {
                shareToElem.fadeIn();
                _this.container.find("#shareMultiSelectValidator_"+tab).rules('add', { // NO I18N
                    required: true,
                    messages: {
                        required: translate("sdp.dashboard.common.messages.shareinfonotchosen") //No I18n
                    }
                });
            }
            else if(shareToElem.length > 0){
                shareToElem.fadeOut();
                _this.container.find("#shareMultiSelectValidator_"+tab).rules("remove"); // NO I18N
            }
        }

        function updateFilterOptions() {
            if(_this.existingShareType=="Private" || shareType=="Private") {
                _this.refreshFilters(tab);
            }
            _this.existingShareType = shareType;
        }
        
        const module = _this.container.find("#widgetModule_"+tab).select2("val"); // NO I18N
        if(module && module!="asset" && !module.startsWith("cm_") && (_this.existingShareType=="Private" && shareType!="Private")) {
            let selectedFilters = [], privateSelectedFilters = [];
            _this.container.find("#listViewFilters_"+tab).find("#filtersList_"+tab+" input.lvfilter").each(function(index, item) {
                jQuery(item).val()!="" && selectedFilters.push(jQuery(item).val());
            });
            if(selectedFilters.length > 0) {
                let widgetFilters = await _this.checkListViewFilters(module, selectedFilters);
                _this.container.find("#listViewFilters_"+tab).find("#filtersList_"+tab+" input.lvfilter").each(function(index, item) {
                    item = jQuery(item);
                    let id = item.val();
                    if(id!="" && widgetFilters[id].scope==1) {
                         privateSelectedFilters.push(item);
                    }
                });
            }
            if(privateSelectedFilters.length > 0) {
                showconfirm(true,'title='+"Confirm"+',message='+getMessageForKey("dashboard.filters.confirm")+',submitbutton='+getMessageForKey('sdp.common.ok')+',cancelbutton='+getMessageForKey('sdp.common.cancel')+', closebutton=no, closeOnEscKey=no', function(ok) { //NO I18N
                    if(ok) {
                        toggleMultiSelect();
                        //Removing the private filters
                        let filtersConatiner = _this.container.find("#listViewFilters_"+tab).find("#filtersList_"+tab);
                        for(let item of privateSelectedFilters) {
                            if(filtersConatiner.find(">li input.lvfilter").length == 1) {
                                item.select2('val', ''); //NO I18N
                            }
                            else {
                                item.parents("div:first").find("a.removeFilter").click(); //NO I18N
                            }
                        }
                        _this.container.find("#graphPreviewLink").addClass('hide');
                        updateFilterOptions();
                    }
                    else {
                         _this.container.find("#Private_Mode_Table,#Private_Mode_Graph").prop("checked", true); //NO I18N
                    }
                });
            }
            else {
                toggleMultiSelect();
                updateFilterOptions();
            }
        }
        else {
            toggleMultiSelect();
            updateFilterOptions();
        }
    },

    //Check the dashboard is executive dashboard
    isExecutiveDashboard: function() {
        let urlParams = getSDPURLParams();
        if(urlParams["executivedashboard"]=="true") {
            return true;
        }
        if(urlParams["action"]=="embedWidget") {
            return false;
        }
        let isExecutive = false;
        if(jQuery("#dashboardTabsDiv li.active").data("view").startsWith("DashboardView_")) {
            let viewId = jQuery("#dashboardTabsDiv li.active").data("viewid"); // NO I18N
            isExecutive = jQuery("#dashboard-settings-dialog li[data-viewtype=DashboardView_"+viewId+"] span.executive-icon").length > 0;
        }
        return isExecutive;
    },

     //Loading the default and custom modules list in the new widget panel
    loadModuleList: async function() {
        let _this = $dash.newWidgets;
        _this.editMode = false;
        if(!_this.isCustomModulePopulated) {
            await _this.populateCustomModules();
        }
        
        let moduleSelect_Table = _this.container.find("#widgetModule_Table");
        let moduleSelect_Graph = _this.container.find("#widgetModule_Graph");
        delete _this.entities.task;
        Object.keys(_this.entities).forEach(async function(id) {
            if(await _this.checkModulePermission(id)) {
                moduleSelect_Table.append(new Option(_this.entities[id].displayName, id));
                moduleSelect_Graph.append(new Option(_this.entities[id].displayName, id));
            }
        });
        moduleSelect_Table.select2({
            formatNoMatches: translate("ae.common.select2nomatchesfound")
        });
        moduleSelect_Graph.select2({
            formatNoMatches: translate("ae.common.select2nomatchesfound")
        });
    },

    isNonExecutiveModule: function(module) {
        let tableGraphExecutiveModules = ["request", "project"]; // NO I18N
        if(module.startsWith("cm_") || tableGraphExecutiveModules.indexOf(module)!=-1) {
            return false;
        }
        return true;
    },

    //Check the logged use have module permission to list the module in the list and load the Table/Graph widget
    checkModulePermission: async function(module, fromAddEditDashboard = false) {
        let _this = $dash.newWidgets;

        if(_this.editMode) {
            return "EDIT_MODE"; //NO I18N
        }

        let isExecutiveDash = _this.isExecutiveDashboard();
        if(!fromAddEditDashboard && isExecutiveDash && _this.isNonExecutiveModule(module)) {
            return false;
        }

        if(module.startsWith("cm_")) {
            if(!_this.isCustomModulePopulated) {
                await _this.populateCustomModules();
            }
            return _this.entities[module] !== undefined;
        }
        else {
            const entity = _this.entities[module];
            if(entity.isEnabled) {
                if (entity.role) {
                    return sdp_user.ROLES.includes(entity.role);
                } else if (entity.roles) {
                    return entity.roles.some(role => sdp_user.ROLES.includes(role));
                }
            }
        }
        return false;
    },

    //Get the custom modules accessible to the logged in user
    populateCustomModules: function(tab) {
        let _this = this;
        if(sdp_app.IS_CUSTOM_MODULE_ENABLED == false) {
            _this.isCustomModulePopulated = true;
            return;
        }
        return new Promise(function(resolve, reject) {
            sdpAjax({
                url: "/api/v3/custom_modules/get_modules", //NO I18N
                success: function(response) {
                    response.modules.forEach(function(module) {
                        _this.entities[module.name] = {apiName: module.api_plural_name, displayName: module.display_name};
                    });
                    _this.isCustomModulePopulated = true;
                    resolve();
                }
            });
        });
    },

    //Event handler for module change in the Table/Graph widget customization
    moduleChange: function($this) {
        let module = jQuery($this).val();
        const tab = this.container.find("#NewWidgetsTabs >li.active").data("tab"); // NO I18N

        let filterContainer = this.container.find("#listViewFilters_"+tab);
        if(module.startsWith("cm_")) {
            filterContainer.empty();
        }
        else {
            this.clearListViewFilters(tab, module);
            this.updateListViewFilters(module);
        }

        this.container.find("#"+tab+"_FilterColumns").removeClass("hide");
        if(tab == "Table") {
            this.updateColumnChooser();
        }
        else if(tab == "Graph") {
            this.updateGraphTypes();
            this.updateGroupByColumns();
        }
        this.closeGraphPreview(true);
        let paneId = "#"+tab+"_WidgetPane"; // NO I18N
        initTooltip(paneId);
        this.container.find(paneId+" label.alert-danger").remove();
        $sdEventListener(filterContainer);
        $sdStyleConverter(filterContainer);
    },

    //Clear the list view filter dropdown in the Table/Graph widget customization
    clearListViewFilters: function(tab, module) {
        let filtersBase = this.container.find("#listViewFiltersBase >div").clone();
        jQuery(filtersBase).find("#filtersList_").attr("id", "filtersList_"+tab);
        this.container.find("#listViewFilters_"+tab).empty().append(filtersBase);
    },

    //Update the list view filter options in the new widget Table/Graph customization
    updateListViewFilters: function(module, selectedFilter, index=0, selectedValues=[]) {
        const tab = this.container.find("#NewWidgetsTabs >li.active").data("tab"); // NO I18N
        let dropdown = this.container.find("#listViewFilters_"+tab).find("#filterDropdown_"+index);
        dropdown.empty();
        let firstFilter = -1;
        if(selectedValues.length>0) {
            let pos = selectedValues.indexOf(selectedFilter);
            selectedValues = selectedValues.slice(0, pos).concat(selectedValues.slice(pos+1));
        }
        else {
            this.container.find("#listViewFilters_"+tab).find("#filtersList_"+tab+" input.lvfilter").each(function(index, item) { 
                jQuery(item).val()!="" && selectedValues.push(jQuery(item).val());
            });
        }
        let shareType = this.container.find("#sharingContainer_"+tab).find("input[name=widgetShareType_"+tab+"]:checked").val() || "Private"; // NO I18N

        let url = "/api/v3/list_view_filters"; //NO I18N
        let urlType = "list_view_filters"; //NO I18N
        let listInfo = {"row_count":"100","start_index":"1","get_total_count":true,"sort_order":"asc","sort_field":"id"};  // No I18N
        if(shareType!="Private") {
            listInfo.search_criteria = [{field: "scope", value: 2, condition: "in", logical_operator: "and"}];  // No I18N
        }

        if(module == "asset") {
            url = "/api/v3/asset_assets/module"; //NO I18N
            urlType = "module"; //NO I18N
            listInfo = {"row_count":"100","start_index":"1","get_total_count":true,"sort_order":"asc","sort_field":"id"};  //No I18N
        }

        let defaultOption;
        if(this.defaultFilters[module]) {
            defaultOption = {id: "0", text: this.defaultFilters[module]};
        }
        
        if(selectedFilter) {
            dropdown.val(selectedFilter.id);
            selectedValues = selectedValues.filter(id => id!=selectedFilter.id);
        }
        if(selectedValues.length>0) {
            (!listInfo.search_criteria) && (listInfo.search_criteria = []);
            listInfo.search_criteria.push({field: "id", values: selectedValues, condition: "not in", logical_operator: "and"});
        }
        let _this = this;
        let select2Input = {
            cache: {},
            multiple:false,
            placeholder: translate("form.select.placeholder", [translate("sdp.common.filter")]),  // No I18N
            value: selectedFilter,
            value_path: "display_name", // No I18N
            default_option: defaultOption,
            url:[]
        };
        let isExecutive = $dash.newWidgets.isExecutiveDashboard();
        if(module=="request" && isExecutive && (sdp_user.ROLES.includes("SDAdmin") || sdp_user.ROLES.includes("SDSiteAdmin"))) {
            let select2UrlInfo = {
                url: "/api/v3/widgets/_get_request_user_filters", // No I18N
                field: "request_user_filters", // No I18N
                list_info: {search_criteria: [{field: "id", values: selectedValues, condition: "not in", logical_operator: "and"}]} // No I18N
            };
            select2Input.url.push(select2UrlInfo);
        }
        let select2UrlInfo = {
            url: url,
            field: urlType,
            list_info: listInfo,
            input_data_Callback : function(url_options, input_data) {
                if(module!="asset") {
                    input_data.module = module;
                }
                return input_data;
            }
        };
        select2Input.url.push(select2UrlInfo);
        dropdown.sdp_select2(select2Input);

        dropdown.change(function() {
            _this.refreshFilters(tab);
            _this.graphFormChange(dropdown);
        });

        this.container.find("#listViewFilters_"+tab).find("#filtersList_"+tab).sortable({
            handle: 'span.allow-dd',   //No I18N
            stop: function(e,ui) {
                if(ui.item.find("input.lvfilter").val()=="" || ui.item.prev().find("input.lvfilter").val()=="") {
                    jQuery(this).sortable("cancel"); //No I18N
                }
                jQuery(this).find("a.removeFilter").removeClass("hide").end().find("a.addFilter").addClass("hide");
                jQuery(this).find("li:last").find("a.removeFilter").addClass("hide").end().find("a.addFilter").removeClass("hide");
            }
        });
    },



    //Add List view filter when plus icon is clicked
    addListViewFilter: function(_this, selectedFilterId, isPublicWidget, selectedFilters) {
        const tab = this.container.find("#NewWidgetsTabs >li.active").data("tab"); // NO I18N
        const module = this.container.find("#widgetModule_"+tab).select2("val"); // NO I18N
        let widgetFilters;
        selectedFilterId && (widgetFilters = this.checkListViewFilters(module, [selectedFilterId]));
        if(_this) {
            let prevFilter = jQuery(_this).parent().siblings('input.lvfilter'); // NO I18N


            prevFilter.rules( "add", { // NO I18N
                required: true,
                messages: {
                    required: translate("common.select.values.warning", [translate("sdp.common.filter")]) // NO I18N
                }
            });

            if(!prevFilter.valid()) {
                return;
            }



        }
        else if(widgetFilters && (widgetFilters[selectedFilterId]==undefined || (isPublicWidget && widgetFilters[selectedFilterId].scope==1))) {
            return;
        }

        const base = this.container.find("#listViewFiltersBase li");
        let filterContainer = this.container.find("#listViewFilters_"+tab);
        let filters = filterContainer.find("#filtersList_"+tab);
        filters.append(base.clone());

        let newFilterContainer = filterContainer.find("#filtersList_"+tab+" >li:last");
        let newFilter = newFilterContainer.find("input.lvfilter");
        let index = filters.find(">li").length-1;
        newFilter.attr("id", "filterDropdown_"+index);
        
        let filterData = selectedFilterId && widgetFilters[selectedFilterId] && {id: selectedFilterId, text: widgetFilters[selectedFilterId].display_name};
        this.updateListViewFilters(module, filterData, index, selectedFilters);
        if(filters.find("li").length == 10) {
            newFilterContainer.find(".removeFilter").removeClass("hide").end().find(".addFilter").addClass("hide");
        }

        if(_this) {
            jQuery(_this).addClass("hide").siblings().removeClass("hide");
            setTimeout(function() {
                jQuery("#WidgetNewPanel").parent().find(">.ui-widget-content[id^=ui-id-]:first").remove();
            },10);
        }
        setTimeout(function() { initTooltip("#filtersList_"+tab);}, 100); // NO I18N
        _this!=undefined && jQuery("#filtersList_"+tab).animate({scrollTop:(newFilterContainer.offset().top)},1000);
        $sdEventListener(filterContainer);
        $sdStyleConverter(filterContainer);
    },

    checkListViewFilters: function(module, filterIds) {
        const _this = $dash.newWidgets;
        if(module.startsWith("cm_")) {
            return {};
        }
        if(!_this.checkFilters[module]) {
            _this.checkFilters[module] = {};
        }

        let moduleFilters = _this.checkFilters[module];
        if(module == "request") {
            moduleFilters = {..._this.checkFilters[module], ..._this.checkFilters[module+"_user"]};
        }

        let hasFiltersData = true;
        let availableFilterIds = Object.keys(moduleFilters);
        for(let f=0;f<filterIds.length;f++) {
            if(availableFilterIds.indexOf(filterIds[f])==-1) {
                hasFiltersData = false;
                break;
            }
        }
        if(hasFiltersData) {
            return moduleFilters;
        }

        let url = "/api/v3/list_view_filters"; //NO I18N
        let type = "list_view_filters"; //NO I18N
        let inputData = {"module": module,"list_info":{"row_count":"100","start_index":"1","get_total_count":true,"sort_order":"desc","sort_field":"id", search_criteria: [{field: "id", values: filterIds, condition: "in", logical_operator: "or"}]}};  //No I18N

        let isExecutive = $dash.newWidgets.isExecutiveDashboard();
        if(module=="request" && isExecutive) {
            inputData.list_info.search_criteria.push({field: "name", value: "All_Requests", condition: "is", logical_operator: "or"});
        }
        inputData = sdpAjaxInputData(inputData);

        if(module == "asset") {
            url = "/api/v3/asset_assets/module"; //NO I18N
            type = "module"; //NO I18N
            inputData = sdpAjaxInputData({"list_info":{"row_count":"100","start_index":"1","get_total_count":true,"sort_order":"desc","sort_field":"id", search_criteria: [{field: "id", values: filterIds, condition: "in", logical_operator: "and"}]}});  //No I18N
        }

        if(_this.defaultFilters[module]) {
            _this.checkFilters[module]["0"] = {id: "0", display_name: _this.defaultFilters[module], name: _this.defaultFilters[module], scope: 2};
        }

        return new Promise(function(resolve, reject) {
            sdpAjax({
                url:  url,
                data: inputData,
                success: async function(response) {
                    let assetFilterScope = module=="asset" ? 2 : 1; //NO I18N
                    jQuery.each(response[type], function() {
                        _this.checkFilters[module][this.id] = {id: this.id, display_name: this.display_name || this.name, name: this.name, scope: this.scope || assetFilterScope};
                    });
                    if(module=="request" && isExecutive && (sdp_user.ROLES.includes("SDAdmin") || sdp_user.ROLES.includes("SDSiteAdmin"))) {
                        await _this.getRequesterListViewFilters(module);
                        resolve({..._this.checkFilters[module], ..._this.checkFilters[module+"_user"]});
                    }
                    else {
                        resolve(_this.checkFilters[module]);
                    }
                }
            });
        });
    },

    getRequesterListViewFilters: function(module) {
        let _this = this;
        return new Promise(function(resolve, reject) {
            sdpAjax({
                url: "/api/v3/widgets/_get_request_user_filters", // NO I18N
                data: sdpAjaxInputData({list_info: {}}),
                success: function(response) {
                    let filters = {};
                    jQuery.each(response.request_user_filters, function() {
                        filters[this.id] = {id: this.id, display_name: this.display_name , name: this.internal_name, scope: this.scope};
                    });
                    _this.checkFilters[module+"_user"] = filters;
                    resolve();
                }
            });
        });
    },

    //Remove a list view filter when minus icon is clicked
    removeListViewFilter: function(_this) {
        const tab = this.container.find("#NewWidgetsTabs >li.active").data("tab"); // NO I18N
        jQuery(_this).parents("li:first").remove(); // NO I18N
        $dash.newWidgets.refreshFilters(tab);
        if(this.container.find("#filtersList_"+tab).find("li input.lvfilter").length==1) {
            if(this.container.find("#filterDropdown_0").select2("val")=='') {
                this.closeGraphPreview();
                this.container.find("#graphPreviewLink").addClass('hide');
            }
        }
        this.container.find("#listViewFilters_"+tab).find("#filtersList_"+tab+" >li:last").find("a.removeFilter").addClass("hide").end().find("a.addFilter").removeClass("hide");
    },

    //Refresh each list view filter when there is a filter change to avoid duplicate filters
    refreshFilters: function(tab) {
        const module = this.container.find("#widgetModule_"+tab).select2("val"); // NO I18N
        this.container.find("#filtersList_"+tab).find("li input.lvfilter").off().each(function(index, element) {
            let selectedFilter = jQuery(element).attr("id", "filterDropdown_"+index).select2("data"); // NO I18N
            $dash.newWidgets.updateListViewFilters(module, selectedFilter, index);
        });
    },

    //update the columns chooser for the table widget customization
    updateColumnChooser: async function(columns) {
        const missingkeysInMeta = {"id": "sdp.common.id"}; //NO I18N
        const skipColumns = {
            custom: ["module"],
            //skiped bcoz of API Error
            request: ["age_after_sla_response_violation", "service_cost", "service_sla", "primary_asset"], //NO I18N
            release: ["deleted_time"],
            solution: ["deleted_time"],
            change: ["deleted_time"]
        }
        const skipTypes = ["html"];
        const _this = $dash.newWidgets;
        const module = _this.container.find("#widgetModule_Table").select2("val"); // NO I18N

        columns = columns || _this.entities[module].defaultColumn || [];
        if(columns.length==0 && module.startsWith("cm_")) {
            columns = ["id","title","created_by","created_time","updated_time"]; // NO I18N
        }
        
        let filteredColumns = [], processedColumns = [], selectedColumns =[], columnIdNames={};
        let udf_DisplayTypes = ["Pick List", "Date", "Date/Time", "Decimal", "Single Line", "Numeric", "Multi Line", "Email", "Url", "Phone", "Percentage", "Radio", "Boolean"]; // NO I18N
        
        function processColumns(fields, options={}) {
            let isUdfField = options.isUdfField;
            for(let id in fields) {
                if(fields[id].display_key && (fields[id].list_view || (isUdfField && udf_DisplayTypes.includes(fields[id].display_type)))) {
                    let fieldId = isUdfField ? options.prefix+id : id;
                    filteredColumns.push({...fields[id], id: fieldId});
                }
            }
        }

        let apiName = _this.entities[module].apiName;
        await _this.getMetaInfo(apiName);
        let fields = _this.moduleMetaInfo[apiName].fields;
        processColumns(fields);
        fields.udf_fields && processColumns(fields.udf_fields.fields, {isUdfField: true, prefix: "udf_fields."}); // NO I18N
        fields.cm_fields && processColumns(fields.cm_fields.fields, {isUdfField: true, prefix: "cm_fields."}); // NO I18N

        let colModule = module.startsWith("cm_") ? "custom" : module; // NO I18N
        filteredColumns = filteredColumns.filter(column => skipTypes.indexOf(column.type)==-1);
        if(skipColumns[colModule]) {
            filteredColumns = filteredColumns.filter(column => skipColumns[colModule].indexOf(column.id)==-1);
        }

        let isExecutive = $dash.newWidgets.isExecutiveDashboard();
        if(isExecutive && _this.entities[module].skipColumnsForRequester) {
            filteredColumns = filteredColumns.filter(column => _this.entities[colModule].skipColumnsForRequester.indexOf(column.id)==-1);
        }

        filteredColumns.forEach(function(column, index) {
            columnIdNames[column.id] = column.display_name;
        });
        
        columns.forEach(function(column) {
            selectedColumns.push({id: column, name: e_html(columnIdNames[column]) || translate(missingkeysInMeta[column]), selected: true});
        });
        
        filteredColumns.forEach(function(column, index) {
            if(columns.indexOf(column.id)==-1) {
                let isSelected = columns.length === 0 && index < 5;
                processedColumns.push({id: column.id, name: e_html(column.display_name), selected: isSelected});
            }
        });

        var columnChooser = new SortableColumnChooser('table_widget', { // No I18n
            columns: selectedColumns.concat(processedColumns), 
            isShowPopover: false,
            searchPlaceHolder: translate("search.prefix", [translate("sdp.common.columns")]),
            customizeLink: '<span closeOnBodyClick=false class="btn btn-default sdmenu-toggle" data-column-chooser="" data-switch="sdmenu" id="columnsort_table_widget" data-target-id="#showPopover_table_widget" rel="uitip" title="` + e_attr(translate("column.chooser.title")) + `"><span class="lsprite icon-sm li-clmchooser1" aria-hidden="true"></span></span>', // No I18n
            callBackFunc: function (selectedColumns) {
                _this.selectedColumns = selectedColumns;
            }
        });
        _this.container.find("#columnsort_table_widget").click().hide();
        _this.container.find("#columnchooser_table_widget").removeClass("sdmenu-dd").addClass("pl15").css({width: "520px"}); //NO I18N
        _this.container.find("#columnchooser_table_widget .form-footer").hide();
        _this.container.find("#columnchooser_table_widget_holder").parent().click();

        _this.container.find("#colsort_table_widget input").on("change", function() {
            _this.getColumnsChooser();
        });
    },

    //get the columns selected for saving the table widget
    getColumnsChooser: function(tab, module) {
        let errorMsg;
        this.container.find("#columnchooser_table_widget .form-footer .savecolumnchooser").click();
        if(this.container.find("#colsort_table_widget input:checked").length>15) {
            this.container.find("#configureColumns").val("");
            errorMsg = translate("dashboard.columns.maxcount", ["15"]); // NO I18N
        }
        else {
            this.container.find("#configureColumns").val(this.selectedColumns);
            errorMsg = translate("common.select.values.warning", [translate("sdp.common.columns")]); // NO I18N
        }
        this.container.find("#configureColumns").rules('add', { // NO I18N
            required: true,
            messages: {
                required: errorMsg
            }
        });
        return this.container.find("#configureColumns").valid();
    },

    //Save the Table/Graph widget when Creating/Editing
    saveTableGraphWidget: async function(widgetId) {
        const _this = this;
        const tab = this.container.find("#NewWidgetsTabs >li.active").data("tab"); // NO I18N
        const widgetPane = this.container.find("#"+tab+"_WidgetPane");

        let dashId = jQuery("#view-listing li.active").data("dvdid"); // NO I18N
        let inputData = {dashboard_id: dashId};
        if(widgetId && (await this.getWidgetData(widgetId))["dashboard_id"] == null) {
            inputData = {dashboard_id: ""}; //Edit a widget when not associated to a dashboard
        }
        
        inputData.name = widgetPane.find("#widgetName_"+tab).val();
        inputData.module = widgetPane.find("#widgetModule_"+tab).select2("val"); // NO I18N
        
        let filters, filterIdNames;
        if(!inputData.module.startsWith("cm_")) {
            filters = [], filterIdNames = [];                
            widgetPane.find("#filtersList_"+tab+" >li input.lvfilter").each(function(index, item) {
                let filterId = jQuery(item).select2("val"); // NO I18N
                let filterData = jQuery(item).select2('data'); // NO I18N

                if(filterId!='' && filterId!=null) {
                    filters.push(filterId);
                    filterIdNames.push(filterData);
                }
            });
        }

        if(tab == "Table") {
            if(inputData.module!='') {
                if(!_this.getColumnsChooser()) {
                    return;
                }
            }
            inputData.properties = {filters: filters, columns: this.selectedColumns};
        }
        else if(tab == "Graph") {
            const graphType = widgetPane.find("#newWidget_graphTypes").select2("val"); // NO I18N
            const groupBy = widgetPane.find("#graphWidget_groupBy").select2("val"); // NO I18N
            inputData.properties = {filters: filters, graphType: graphType, groupBy: groupBy};
        }

        if(inputData.module.startsWith("cm_")) {
            inputData.properties.apiName = this.entities[inputData.module].apiName;
        }
        if(inputData.module=="request") {
            inputData.properties.isExecutiveWidget = _this.isExecutiveDashboard();
        } 

        inputData.graph_type = "1";

        inputData.display_name = inputData.name;

        inputData.description = widgetPane.find("#widgetDescription_"+tab).val();

        inputData.widget_type = tab;

        let url = "/api/v3/widgets", type = "POST"; // NO I18N
        let share_id;
        if(widgetId) {
            url = "/api/v3/widgets/"+widgetId; // NO I18N
            type = "PUT"; // NO I18N
            share_id = (await this.getWidgetData(widgetId)).share_info.share_id
        }

        let shareData = {
            shared_to: [],
            widget_id: widgetId && {id: widgetId},
            share_type: this.container.find("#sharingContainer_"+tab).find("input[name=widgetShareType_"+tab+"]:checked").val() || "Private", //No I18n
            share_id: share_id
        };

        inputData.is_public = (shareData.share_type=="Public"); //No I18n
        if(shareData.share_type == "Shared") {
            let selectedIds = this["multiSelect_"+tab].getSelectedIds();
            let isSharedTo = Object.keys(selectedIds).length>0;
            this.container.find("#shareMultiSelectValidator_"+tab).val(isSharedTo ? "Shared" : ""); //No I18n
            function addToShareData(value) {
                var type = this;
                shareData.shared_to.push({reference_type: type, reference_id: value.id});
            }
            jQuery.each(selectedIds, function(type, values) {
                values.forEach(addToShareData, type);
            });
        }
        else if(shareData.share_type == "Public") {
            shareData.shared_to.push({reference_type: "All", reference_id: 0});
        }
        inputData.share_info = shareData;

        if(!this.container.find("#"+tab+"_WidgetForm").valid()) {
            return;
        }

        sdpAjax({
            url: url,
            data: sdpAjaxInputData({widget: inputData}),
            type: type,
            success: async function(response) {
                _this.widgetData[response.widget.id] = response.widget;
                if(widgetId) {
                    _this.updateWidgetUI(tab, response.widget, {filters: filterIdNames});
                }
                else {
                    _this.widgetsCount++;
                    await _this.renderWidget(response.widget, {isAddNew: true, wait: true});
                    $dash.customize.showCustomizationOptions(jQuery("a[data-name=organiseWidget]")[0]);
                    _this.restoredWidgets[tab+"_"+response.widget.id] = true;
                    $dash.gridster.dashboardScrollTo(jQuery("#dboard-content>li").last(), 1000);
                }
                showalert('success', widgetId ? translate("sdp.reports.customReport.widget.update.success") : translate("sdp.reports.customReport.widget.add.success"),'isAutoHide=true'); //No I18N
                $dash.common.closeDialog(true);
            }
        });
    },

    //JQuery validation for Table/Graph widget customization
    initJQueryValidation: function(tab) {
        let requiredObj = { required: true };
        let rules = {
                filterDropdown_0: requiredObj,
                newWidget_graphTypes: requiredObj,
                graphWidget_groupBy: requiredObj
            };
            rules["widgetName_"+tab] = {...requiredObj, maxlength: 250};
            rules["widgetModule_"+tab] = requiredObj;
        let messages = {
                filterDropdown_0: {
                    required: translate("common.select.values.warning", [translate("sdp.common.filter")]) //No I18n
                },
                newWidget_graphTypes: {
                    required: translate("common.select.values.warning", [translate("dashboard.graph.type")]) //No I18n
                },
                graphWidget_groupBy: {
                    required: translate("common.select.values.warning", [translate("sdp.reports.customReport.chooserowone")]) //No I18n
                }
            };
            messages["widgetName_"+tab] = { required: translate("missing.value.warning", [translate("sdp.home.ssp.customization.common.widgetname")]) }; //No I18n
            messages["widgetModule_"+tab] = { required: translate("sdp.reports.queryreports.pleaseselectmod") }; //No I18n

        $dash.newWidgets.container.find("#"+tab+"_WidgetForm").validate({ //No I18n
            rules: {...rules},
            messages: {...messages},
            errorClass: 'text-danger', //No I18n
            ignore: [],
            focusCleanup: true,
            errorPlacement: function(error, element) {
                let elementId = element.attr("id");
                
                error.addClass('alert alert-danger p5 fr').css({
                    position: 'absolute', // No I18N
                    overflow: 'visible', // No I18N
                    width: "auto", // No I18N
                    right: "0px", // No I18N
                    'z-index': '100', // No I18N
                });
                if(elementId.startsWith('filterDropdown_')) {
                    error.insertAfter(element.parents("li")); // No I18N
                    error.css({bottom: "-31px", right: "40px"}); // No I18N
                }
                else {
                    if(elementId=="configureColumns") {
                        error.css({right: "0px"}); // No I18N
                        error.insertAfter(element.siblings("#columnchooser_table_widget_holder").find("#search-input")); // No I18N
                    }
                    else {
                        if(elementId.startsWith("widgetModule") || elementId=="newWidget_graphTypes" || elementId=="graphWidget_groupBy") {
                            error.css({bottom: "-45px"}); // No I18N
                        }
                        error.insertAfter(element);
                    }
                }
                element.focus();
            }
        });
    },

    //Add a existing Table/Graph widget to a dashboard
    changeDashboard: function(widgetId, isAdded) {
        let _this = $dash.newWidgets;
        let widgetType = widgetId.startsWith("Table_") ? "Table" : widgetId.startsWith("Graph_") ? "Graph" : undefined; // NO I18N
        if(widgetType == undefined) {
            return;
        }
        widgetId = widgetId.replace("Table_", "").replace("Graph_", "");
        let data = {dashboard_id: ""};
        let dashId = "";
        if(isAdded) {
            dashId = jQuery("#view-listing li.active").data("dvdid"); // NO I18N
            if(sdp_user.ROLES.indexOf("SDCo-ordinator")!=-1 && jQuery("#view-listing li.active").data("view")=='Dashboard1') {
               data = {"is_public":true,"share_info":{"shared_to":[{"reference_type":"All","reference_id":0}],"share_type":"Public"}}; // NO I18N
            }
            data.dashboard_id = dashId;
        }
        sdpAjax({
            url: "/api/v3/widgets/"+widgetId, // NO I18N
            data: sdpAjaxInputData({widget: data}),
            type: "PUT", // NO I18N
            success: function() {
                _this.widgetData[widgetId].dashboard_id = isAdded ? dashId : null;
            }
        });
    },

    //Update the dashboard id in the widgets API for the removed/Restored widgets
    updateRemovedRestoredWidgets: function() {
        for(let widgetId in $dash.newWidgets.removedWidgets) {
            this.changeDashboard(widgetId, false);
        }
        $dash.newWidgets.removedWidgets = {};
        for(let widgetId in $dash.newWidgets.restoredWidgets) {
            this.changeDashboard(widgetId, true);
        }
        $dash.newWidgets.restoredWidgets = {};
        jQuery("#removedWidgets > li[data-module=Graph]").remove();
        jQuery("#removedWidgets > li[data-module=Table]").remove();
    },

    //Update the widget after editing the Table/Graph widget
    updateWidgetUI: function(tab, widget, options = {}) {
        let filters = options.filters;
        let _this = $dash.newWidgets;
        //For Edit Widget  - Rerender the table
        let selectedFilter;
        let selectEle = jQuery("#dboard-content li[data-widgetid="+tab+"_"+widget.id+"] #widgetDropdown_0");
        
        if(selectEle.length && filters) {
            selectedFilter = selectEle.select2("val"); // NO I18N
            let select2Data = [], isSelectedFilterRetained = false;
            filters.forEach(function(filter) {
                select2Data.push({text: filter.text, id: filter.id});
                if(filter.id == selectedFilter) {
                    isSelectedFilterRetained = true;
                }
            });
            selectEle.select2({data: select2Data});
            if(isSelectedFilterRetained) {
                selectEle.select2('val', selectedFilter); // NO I18N
            }
            else {
                selectEle.select2('val', select2Data[0].id);
            }
            selectedFilter = selectEle.select2("val"); // NO I18N
            filters.length>1 ? selectEle.parent().addClass("disp-ib").removeClass("hide") : selectEle.parent().addClass("hide").removeClass("disp-ib"); // NO I18N
        }
        const widgetBg = jQuery("#Graph_"+widget.id+"_div").parents(".widget-bg"); // NO I18N
        widgetBg.data("belongsto", widget.module); // NO I18N
        
        jQuery("#widgetHeader_"+widget.id).find(".widgets-hdr-txt").text(widget.name).attr('title', widget.name);

        let isExecutive = _this.isExecutiveDashboard();
        if(isExecutive && widget.module=="request" && _this.checkFilters[widget.module][selectedFilter]==undefined) {
            selectedFilter = undefined;
        }
        else {
            jQuery("#requester_filter_info_"+widget.widget_type+"_"+widget.id).addClass("hide");
        }

        if(tab == "Table") {
            _this.renderTable(widget, {selectedFilter: selectedFilter});
        }
        else if(tab == "Graph") {
            _this.renderGraph(widget, {selectedFilter: selectedFilter, container: widgetBg});
        }
    },

    //Render the table/graph widgets when dashboard load
    renderTableGraphWidgets: async function(widgets) {
        let _this = $dash.newWidgets;
        
        let tableGraphWidgetsCount = widgets!=null ? Object.keys(widgets).length : 0;
        _this.widgetsCount = tableGraphWidgetsCount + jQuery("#dboard-content li.widgets").length;
        setTimeout(function() {
            jQuery("#content-parent > .dashboard-empty").removeClass("hide");
        }, 500);

        _this.isTableGraphWidgetLoadeded = false;
        _this.widgetIds = [];
        _this.containsPermissionLessWidgets = false;
        if($dash.embed.isSingleWidget) {
            let widgetName = $dash.embed.singleWidgetName;
            if(widgetName && (widgetName.startsWith("Table_") || widgetName.startsWith("Graph_"))) {
                let widgetId = widgetName.replace("Table_", "").replace("Graph_", "");
                $dash.embed.widgetId = widgetId;
                $dash.embed.isTableGraphWidget = true;
                this.getWidgetData(widgetId, this.renderWidget, {loadFrameAlone:true, callBackFunc: $dash.embed.embededWidgetHandler});
            }
            return;
        }

        let widgetsArr = [];
        for(let id in widgets) {
            widgetsArr.push([id, widgets[id]]);
            let widgetId = id.replace("Table_", "").replace("Graph_", "");
        }
        var sortedWidgets = widgetsArr.sort(function(a, b) {
          return a[1][0] - b[1][0]; //Sorting the widgets by row in ascendign order
        });

        let widgetCount = sortedWidgets.length;
        for(let i=0;i<widgetCount;i++) {
            let id = sortedWidgets[i][0];
            let dim = sortedWidgets[i][1];
            let widgetId = id.replace("Table_", "").replace("Graph_", "");
            let widgetDiv = jQuery("#dboard-content li.widgets[data-widgetid="+id+"] .widget-bg");
            if(widgetDiv.length == 0) {
                _this.widgetIds.push(widgetId);
                if(i === widgetCount-1) {
                    await _this.getWidgetData(widgetId, this.renderWidget, {dim: dim, loadFrameAlone: true, widgets: sortedWidgets, wait: true});
                    _this.isTableGraphWidgetLoadeded = true;
                }
                else {
                    _this.getWidgetData(widgetId, this.renderWidget, {dim: dim, loadFrameAlone: true, widgets: sortedWidgets});
                }
            }
        }
        if(widgetCount==0) {
            _this.isTableGraphWidgetLoadeded = true;
        }
    },

    //get widget settings saved when creating/editing Table/Graph widget
    getWidgetData: function(widgetId, callBackFunc, params={}) {
        return new Promise(async function(resolve, reject) {
            let _this = $dash.newWidgets;
            let result = _this.widgetData[widgetId];
            if(result) {
                if(params.wait) {
                    callBackFunc && await callBackFunc(result, params);    
                }
                else {
                    callBackFunc && callBackFunc(result, params);
                }
                resolve(result);
            }
            else {
                sdpAjax({
                    url: "/api/v3/widgets/"+widgetId, // NO I18N
                    ignorefailuremessage: true,
                    success: async function(response) {
                        _this.widgetData[widgetId] = response.widget;
                        if(params.wait) {
                            callBackFunc && await callBackFunc(response.widget, params);  
                        }
                        else {
                            callBackFunc && callBackFunc(response.widget, params);
                        }
                        resolve(response.widget);
                    }
                });
            }
        });
    },

    repositionWidgets: function(widgets) {
        let widgetCount = widgets.length;
        for (const [id, dim] of widgets) {
            jQuery(`#dboard-content > li[data-widgetid=${id}]`).attr("data-row", dim[0]);
        }
        $dash.gridster.enableGridster();
    },

    //Render a widget in the dashboard
    renderWidget: async function(widget, options = {}) {
        const _this = $dash.newWidgets;
        let properties = JSON.parse(widget.properties);
        _this.widgetIds && _this.widgetIds.splice(_this.widgetIds.indexOf(widget.id),1);

        let isAuthorized = await _this.checkModulePermission(widget.module);
        if(options.loadFrameAlone && !isAuthorized) {
            _this.containsPermissionLessWidgets = true;
            return;
        }
        const widgetType = widget.widget_type;
        let filterIdNames = [];

        let selectedFilter;
        if(!widget.module.startsWith("cm_") && isAuthorized!="EDIT_MODE") {
            let personalizedFilter = await _this.getSelectedFilter(widget.id, widgetType, {properties: widget.properties, module: widget.module});
            let widgetFilters = await _this.checkListViewFilters(widget.module, properties.filters);
            let isPublicWidget = (widget.share_info.share_type=="Public" || widget.share_info.share_type=="Shared"); // NO I18N
            properties.filters.forEach(function(id) {
                if(widgetFilters[id] && (!isPublicWidget || (isPublicWidget && widgetFilters[id].scope==2))) {
                    filterIdNames.push({id: id, text: widgetFilters[id].display_name});
                    if(id == personalizedFilter) {
                        selectedFilter = id;
                    }
                }
            });
        }

        let isCustomizationEnabled = !$dash.embed.isSingleWidget && !$dash.gridster.parent.find("#dashSaveSection").hasClass("hide"); // NO I18N
        let isWidgetOwner = widget.created_by.id == sdp_user.LOGGEDIN_USERID;
        let isSDAdmin = sdp_user.ROLES.indexOf("SDAdmin")!=-1;
        let isSDCoordinatorHelpdesk = sdp_user.ROLES.indexOf("SDCo-ordinator")!=-1 && jQuery("#view-listing li.active").data("view")=='Dashboard1'; // NO I18N
        let isProjectAdmin = sdp_user.ROLES.indexOf("Project Admin")!=-1 && jQuery("#view-listing li.active").data("view")=='ProjectHome'; // NO I18N
        let isEditDashboard = $dash.util.isOptionPermittedForUser(jQuery("a[data-name=editDashbrd]").first());
        let filtersLength = properties.filters && properties.filters.length || 0;
        
        let template_data = {
            widgetGridId: widgetType+"_"+widget.id,
            widgetId: widget.id,

            widgetType: widgetType,
            isTable: widgetType=="Table", // NO I18N
            isGraph: widgetType=="Graph", // NO I18N
            entity: widget.module,
            
            widgetName: widget.id,
            widgetTitle: widget.name, 

            widgetTypeId: 3, 
            properties: widget.properties,
            isFiltersEnabled: filtersLength>0,
            hideFilterClass: filtersLength==1 ? "hide" : "disp-ib", // NO I18N
            isCustomizationEnabled: isCustomizationEnabled,
            showEdit: isCustomizationEnabled && !options.isAddNew,
            closeButton: isCustomizationEnabled ? $dash.gridster.removeWidgetBtn : "",
            
            isLimitedData: false, 
            dashboardTab: "",
            isAllowedToEdit: (isWidgetOwner || isSDAdmin || isEditDashboard || isSDCoordinatorHelpdesk || isProjectAdmin) && isAuthorized!="EDIT_MODE",  //NO I18N
            frameonly: isAuthorized=="EDIT_MODE",  //NO I18N
            frameonly_message: "dashboard.content.hidden", //NO I18N
            hide_error_icon: "",
            isTechnician: sdp_user.USERTYPE=='Technician'  //NO I18N
        };

        let frameonly = false;
        if(!widget.module.startsWith("cm_") && filterIdNames.length==0 && isAuthorized!="EDIT_MODE") {
            if(!isEditDashboard) {
                return; //If filters are not available then widget will not be loaded for non admin
            }
            if(!(sdp_user.ROLES.includes("SDAdmin") || sdp_user.ROLES.includes("SDSiteAdmin"))) {
                return;
            }
            frameonly = true;
            template_data.frameonly = true;
            template_data.hide_error_icon = "hide"; //NO I18N
            template_data.hideFilterClass = "hide"; //NO I18N
            template_data.isFiltersEnabled = false;
            template_data.frameonly_message = translate("widget.filter.error"); //NO I18N
        }

        let wdg_str = renderhbs(null, "widget-frame", template_data, false, "dashboard", true, true, null, true); // NO I18N
        let dim = options.dim || ((widgetType=="Table") ? [0, 0, $dash.gridster.options.numberOfColumns, 1] : [0, 0, 1, 1]);
        let addedExternalWidget = $dash.gridster.gridster.add_widget(wdg_str, dim[2], dim[3], dim[1], dim[0]);
        
        if(template_data.isFiltersEnabled) {
            let listViewFilter = addedExternalWidget.find("#widgetDropdown_0");
            listViewFilter.select2({
                data: filterIdNames,
                dropdownAutoWidth: true,
                minimumResultsForSearch: -1
            });
            if(selectedFilter==undefined && filterIdNames.length>0) {
                selectedFilter = filterIdNames[0].id;
            }
            listViewFilter.select2("val", selectedFilter); //NO I18N
        }

        options.callBackFunc && options.callBackFunc();
        const widgetBg = jQuery("#"+widgetType+"_"+widget.id+"_div").parents(".widget-bg");
        if(widgetBg.parent().data("frameonly")) {
            widgetBg.parent().data("isLoaded", true); //NO I18N
        }
        else {
            if(options.loadFrameAlone) {
                if($dash.embed.isSingleWidget) {
                    initTooltip("#dboard-content li[data-widgetid="+widgetType+"_"+widget.id+"] .widget-header"); //NO I18N 
                    return;
                }
                //If the widget is visible then loadwidgets will render the Table/Graph
                dashboardComp.loadWidgets();
                $dash.gridster.notifyEmptyDashboard();
            }
            else {
                let isExecutive = _this.isExecutiveDashboard();
                if(widget.module=="request" && isExecutive && _this.checkFilters[widget.module][selectedFilter]==undefined && (sdp_user.ROLES.includes("SDAdmin") || sdp_user.ROLES.includes("SDSiteAdmin"))) {
                    selectedFilter = undefined;
                }
                if(widgetType == "Table") {
                    _this.renderTable(widget, {selectedFilter: selectedFilter, frameonly: frameonly});
                }
                else if(widgetType == "Graph") {
                    _this.renderGraph(widget, {selectedFilter: selectedFilter, container: widgetBg, frameonly: frameonly});
                }
                widgetBg.parent().data("isLoaded", true); //NO I18N 
            }
        }

        initTooltip("#dboard-content li[data-widgetid="+widgetType+"_"+widget.id+"] .widget-header"); //NO I18N 
        let infoIcon = jQuery("#dashOrganizeSection #siteGroupInfo");
        _this.showFilterInfo ? infoIcon.removeClass("hide") : infoIcon.addClass("hide");
        if(options.widgets) {
            if(_this.widgetIds && _this.widgetIds.length==0) {
                _this.repositionWidgets(options.widgets);
            }
        }
        $sdEventListener(widgetBg);
        $sdStyleConverter(widgetBg);
    },

    getMetaInfo: function(module) {
        const _this = $dash.newWidgets;
        if(_this.moduleMetaInfo[module]) {
            return;
        }
        else if(_this.metaInfoPromise[module]) {
            return _this.metaInfoPromise[module];
        }
        else {
            let inputData;
            if(module=="requests") {
                inputData = sdpAjaxInputData({"for":"request_list_view"}); //NO I18N 
            }
            _this.metaInfoPromise[module] = new Promise(function(resolve, reject) {
                sdpAjax({
                    url: (module=="asset_assets") ? "/api/v3/"+module+"/_metainfo" : "/api/v3/"+module+"/metainfo", // NO I18N
                    data: inputData,
                    success: function(response) {
                        _this.moduleMetaInfo[module]=response.metainfo;
                        _this.metaInfoPromise[module] = undefined;
                        resolve();
                    }
                });
            });
            return _this.metaInfoPromise[module];
        }
    },

    moduleMetaInfo: {},
    //Render a table widget in the widget frame loaded using renderWidget
    renderTable: async function(widget, options = {}) {
        const _this = $dash.newWidgets;
        let widgetId = widget.widget_type+"_"+widget.id;
        let widgetBg = jQuery("#"+widgetId+"_div").parents(".widget-bg");
        if(widgetBg.length==0 && !options.frameonly) {
            let widgetLi = jQuery("#dboard-content >li[data-widgetid="+widgetId+"]");
            let gridster = $dash.gridster;
            let dims = ([gridster.get(widgetLi, "row"), gridster.get(widgetLi, "col"), gridster.get(widgetLi, "sizex"), gridster.get(widgetLi, "sizey")]);
            widgetLi.remove();
            $dash.gridster.enableGridster();
            _this.renderWidget(widget, {isAddNew: true, dim: dims});
            return;
        }
        if(widgetBg.parent().data("frameonly")) {
            return;
        }
        const module = widget.module;
        let properties = JSON.parse(widget.properties);
        let selectedFilter = options.selectedFilter || await _this.getSelectedFilter(widget.id, widget.widget_type, {properties: widget.properties, module: widget.module});
        let widgetFilters = await _this.checkListViewFilters(module, properties.filters);
        let userHaveSelectedFilter = widgetFilters && widgetFilters[selectedFilter];

        let header_metadata = {};
        //Height of a single row in the table is 45 px
        let defaultRowCount = Math.floor(widgetBg.find(".widget-panel").height()/45);
        if(widgetBg.parent().hasClass("fullScreen")) {
            jQuery("#pagination_comp_Table_"+widget.id).empty();
        }
        let rowCount = options.row_count || defaultRowCount || 10;
        let table_info = {list_info : {start_index: "1", row_count: rowCount}};
        if(userHaveSelectedFilter && selectedFilter && selectedFilter!="0") {
            if(module=="asset") {
                table_info.list_info.default_search_criteria = {field: "module", value: selectedFilter, condition: "is", logical_operator: "and"};  // No I18N
            }
            else {
                table_info.list_info.filter_by = {id: selectedFilter};
            }
        }
        properties.columns.length>0 && (table_info.fields_required = {});

        let titleBasedModules = ["asset", "solution", "change", "release", "request_maintenance", "project", "task"]; //NO I18N
        properties.columns.forEach(function(column) {
            let skipColumns = _this.entities[module].skipColumnsForRequester;
            if(skipColumns && sdp_user.USERTYPE=="Requester" && skipColumns.includes(column)) {
                return;
            }
            if(module=="request" && (column=="subject" || column=="id")) {
                let width = column=="subject" ? "300px" : "100px"; //NO I18N
                header_metadata[column] = {
                    dataCelltransformer : function(td) {
                        const detailsPageURL = "/WorkOrder.do?woMode=viewWO&woID="+td.row_data.id+"&fromListView=true"; //NO I18N
                        let title = td.row_data.subject ? 'title="'+e_html(td.row_data.subject)+'"' : ""; //NO I18N
                        if(getSDPURLParams().externalframe=='true') {
                            return '<a id="table_row_'+module+'_'+td.row_data.id+'" rel="noopener noreferrer uitip" mode_ellipsis="true" href="'+detailsPageURL+'" target="blank" '+title+'>'+e_html(td.row_data[column])+'</a>';
                        }
                        else {
                            return '<a id="table_row_'+module+'_'+td.row_data.id+'" rel="noopener noreferrer uitip" mode_ellipsis="true" data-spa="true" data-spa-page="request-details" data-spa-module="requests" href="'+detailsPageURL+'" data-event="click" data-handler="requestListViews.showRequestPreview('+td.row_data.id+', event);" nonce="'+sdpNonce+'" '+title+'>'+e_html(td.row_data[column])+'</a>';
                        }
                    },
                    width: width
                };
            }
            else if((column=="title" || column=="name" || column=="id") && (module.startsWith("cm_") || titleBasedModules.indexOf(module)!=-1)) {
                 header_metadata[column] = {
                    dataCelltransformer : function(td) {
                        let getAssetModule = null;
                        if(module=="asset"){
                            getAssetModule = td.row_data.module!=undefined ? td.row_data.module.api_plural_name : "asset_assets"; //NO I18N
                        }
                        let id = td.row_data.id;
                        let detailsPageURL = {
                            asset: "/ui/asset?module="+getAssetModule+"&entity_id="+id+"&mode=details", //NO I18N
                            change: "/ChangeDetails.do?CHANGEID="+id, //NO I18N
                            custom: "/ui/custom_module?module="+properties.apiName+"&mode=details&entity_id="+id+"#details", //NO I18N
                            release: "/ui/releases?entity_id="+id+"&mode=detail", //NO I18N
                            solution: "/ui/solutions?entity_id="+id+"&mode=detail", //NO I18N
                            request_maintenance: "/ui/maintenances?mode=details&id="+id, //NO I18N
                            project: "/ProjectAction.do?submitaction=ViewProject&fromListView=true&projectid="+id, //NO I18N
                        }
                        let moduleName = module.startsWith("cm_") ? "custom" : module; //NO I18N
                        let title = 'title="'+ (td.row_data["name"] ? e_html(td.row_data["name"]) : td.row_data["title"]? e_html(td.row_data["title"]) : "")+'"'; //NO I18N
                        if(module=="task") {
                            let moduleId = "";
                            let moduleDetails = td.row_data[td.row_data.associated_entity];
                            if(moduleDetails && moduleDetails.id) {
                                moduleId = moduleDetails.id;
                            }
                            let projectId = td.row_data.project && td.row_data.project.id;
                            return "<a id='table_row_"+moduleName+"_"+id+"' rel='uitip' mode_ellipsis='true' "+title+" href='/' data-event='click' data-handler='$tasks.loadTasks(\"detail\",\""+td.row_data.associated_entity+"\",\""+moduleId+"\",\""+id+"\",\"homeMyTasks\","+projectId+")' nonce='"+sdpNonce+"'>"+e_html(td.row_data[column])+"</a>";
                        }
                        else {
                            return '<a id="table_row_'+moduleName+'_'+id+'" rel="noopener noreferrer uitip" mode_ellipsis="true" href="'+detailsPageURL[moduleName]+'" target="blank" '+title+'>'+e_html(td.row_data[column])+'</a>';
                        }
                    },
                    width: column=="id" ? "50px" : undefined //NO I18N
                };
            }
            else if(module=="request_maintenance" && column=="maintenancestate") {
                let states = ["state.suspended", "sdp.contract.listViewI.active", "sdp.admin.statusDef.complete"] //NO I18N
                header_metadata[column] = {
                    dataCelltransformer : function(td) {
                        return td.row_data[column] && translate(states[td.row_data[column]]);
                    }
                };
            }
            else if(sdp_user.USERTYPE=="Requester" && module=="request" && column.startsWith("udf_fields.")) {
                header_metadata[column] = {
                    dataCelltransformer : function(td) {
                        let value = td.row_data.udf_fields[column.split(".")[1]];
                        if(value=="Not-Auth") {
                            return "-";
                        }
                        if(value && typeof value == "object" && value.display_value) {
                            value = value.display_value;
                        }
                        return "<div rel='uitip' mode_ellipsis='true' title='"+e_html(value)+"'>"+e_html(value)+"</div>";
                    }
                };
            }
            else if(module=="request" && column=="maintenance"){
                header_metadata[column] = {
                    dataCelltransformer : function(td) {
                        return td.row_data[column]!=null ? '<a class="cur-ptr" title="'+translate("maintenance.info.rlv")+'" rel="uitip" data-event="click" data-handler="requestListViews.openMaintenancePreview('+td.row_data[column].id+')" nonce="'+sdpNonce+'">'+translate("created.via.maintenance")+'</a>' : "-";
                    }
                };
            }
            else if(column.startsWith("udf_fields.url_") || column.startsWith("cm_fields.url_")) {
                header_metadata[column] = {
                    dataCelltransformer : function(td) {
                        let colName = column.split(".");
                        let value = td.row_data[colName[0]][colName[1]];
                        return value!=null ? `<a class="cur-ptr" target="_blank" rel="noopener noreferrer" href="${e_attr(value)}">${e_html(value)}</a>` : "-";
                    }
                };
            }
            else {
                header_metadata[column] = {};
            }
            table_info.fields_required[column] = "";
        });

        function rowdataConstruct(table_info) {
            let inputData = { list_info: table_info.list_info };
            if(table_info.fields_required) {
                inputData.fields_required = Object.keys(table_info.fields_required);
                if(_this.entities[widget.module].mustInclude) {
                    inputData.fields_required = [...inputData.fields_required, ..._this.entities[widget.module].mustInclude];
                }
            }
            return inputData;
        }

        let entityName = _this.entities[widget.module].apiName || properties.apiName;
        await _this.getMetaInfo(entityName);
        let table_options = {
            isODAPI : true,
            entity_name      : entityName,
            callbackURL      : module=="asset" ? "widgets/_table_graph_data?module=asset_asset" : "widgets/_table_graph_data?module="+module, // NO I18N
            tableHolder      : "Table_"+widget.id, //NO I18N
            meta_data        : JSON.parse(sdpToJSON(_this.moduleMetaInfo[entityName].fields)),
            
            paginationEnabled : true,
            searchEnabled     : true,
            sortingEnabled    : true,
            listSettingEnabled : false,
            inlineEditEnabled : false,
            columnChooserEnabled : false,
            columnFullWidth: true,
            isFR_ListInfo_Support: true,
            get_total_count: false,
            support_search_criteria: true,

            getmetaInfo : options.fromColumnChooser,
            staticHeader: true,
            discard_without_displayname : true,
            discarded_fields : ["primary_asset"],
            row_inputdata : rowdataConstruct(table_info),
            height: "100%",
            width: jQuery("#Table_"+widget.id+"_div").width(),
            must_included_fields: _this.entities[widget.module].mustInclude,

            default_sort_field : {
                sort_field : "id", // NO I18N
                sort_order : "desc" // NO I18N
            }
        };

        let table_content = {"header" : header_metadata }; // NO I18N
        table_info.column_order = table_options.row_inputdata.fields_required;
        if(module=="asset") {
            table_options.row_inputdata.fields_required.push("module"); // NO I18N
        }
        
        let tableObj = new tableComponent(table_info, table_content, table_options);
        _this.tableCompObj[widgetId] = tableObj;
        return tableObj;
    },

    //Render a graph widget in the widget frame loaded using renderWidget
    renderGraph: async function(widget, options={}) {
        let graphComp = Object.create(dashboardComp);
        const $container = options.container;
        const _this = $dash.newWidgets;

        if($container.length==0 && !options.frameonly) {
            let widgetId = widget.widget_type+"_"+widget.id;
            let widgetLi = jQuery("#dboard-content >li[data-widgetid="+widgetId+"]");
            let gridster = $dash.gridster;
            let dims = ([gridster.get(widgetLi, "row"), gridster.get(widgetLi, "col"), gridster.get(widgetLi, "sizex"), gridster.get(widgetLi, "sizey")]);
            widgetLi.remove();
            $dash.gridster.enableGridster();
            _this.renderWidget(widget, {isAddNew: true, dim: dims});
            return;
        }
        if($container.parent().data("frameonly")) {
            return;
        }
        let properties = widget.properties;
        if(typeof properties == "string") {
            properties = JSON.parse(properties);
        }
        const module = widget.module;
        const filterId = options.selectedFilter || await _this.getSelectedFilter(widget.id, widget.widget_type, {properties: widget.properties, module: widget.module});
        const groupBy = properties.groupBy;

        graphComp.apiName = "widgets/_table_graph_data"; //NO I18N
        graphComp.entityName = module=="asset" ? "asset_asset" : module; //NO I18N

        graphComp.moduleName = _this.entities[module].apiName || properties.apiName;
        graphComp.graphType = _this.getGraphType(properties.graphType);
        if(typeof graphComp.graphType == 'string') {
            graphComp.graphType = [graphComp.graphType];
        }
        graphComp.isGraphCustomWidget = true;
        graphComp.widgetDiv = $container;
        let widgetFilters = await _this.checkListViewFilters(module, properties.filters);
        let filterName = widgetFilters && widgetFilters[filterId] && widgetFilters[filterId].name;
        graphComp.widgetApiInfo = {
            list_info: {group_by:[groupBy], filter_by: filterName && {id: filterId}, row_count:100},
            chart: {name: widget.id },
            group_by: groupBy,
            seriesname: groupBy,
            xAxis: groupBy
        };

        if(groupBy.startsWith("udf_")) {
            graphComp.widgetApiInfo.xAxis = "udf_fields."+groupBy; //NO I18N
        }
        else if(module.startsWith("cm_") && groupBy.startsWith("pick_")) {
            graphComp.widgetApiInfo.xAxis = "cm_fields."+groupBy; //NO I18N
        }

        if(module == "request" || module == "asset") {
            graphComp.eventHandler = graphComp.openURL;
            if(module == "request" && filterName) {
                graphComp.widgetApiInfo.list_info.filter_by.name = filterName;
            }
            if(module == "asset") {
                delete graphComp.widgetApiInfo.list_info.filter_by;
                delete graphComp.widgetApiInfo.list_info.search_criteria;
                if(filterId != "0") {
                    // 0 -- All Assets -- so criteria not needed
                    graphComp.widgetApiInfo.list_info.search_criteria = {field: "module", value: filterId, condition: "is", logical_operator: "and"}; //NO I18N
                }
            }
        }

        graphComp.seriesNamesInOrder = [];
        let zCData = { categories: {}, chartData: [] };
        graphComp.apiIndex = 0;
        graphComp.getDataNProcess(graphComp.widgetApiInfo, [], zCData);
    },

    //Refresh a table/graph widget when refresh icon is clicked
    refreshWidget: async function(widgetId, options = {}) {
        let widgetDiv = options.container;
        if(!widgetDiv) {
            widgetDiv = jQuery(options.select).parents(".widget-bg"); //NO I18N
        }

        if(widgetDiv.parent().data("frameonly")==true) {
            return;
        }

        let widgetType = options.widgetType;
        if(!widgetType) {
            widgetType = widgetDiv.data("module"); //NO I18N
        }

        let selectedFilter = options.select && options.select.value;
        if(options.isUpdateFilter) {
            options.module =  options.select && jQuery(options.select).parents(".widget-bg").data("belongsto"); //NO I18N
            selectedFilter = await this.getSelectedFilter(widgetId, widgetType, options);
        }
        if(widgetType=="Table") {
            let tableComp = $dash.newWidgets.tableCompObj["Table_"+widgetId];
            let tableAvailable = widgetDiv.find("table#Table_"+widgetId).length > 0;
            if(tableComp && tableAvailable) {
                let listInfo = tableComp.t_obj.table_info.list_info;
                if(options.isUpdateFilter) {
                    listInfo.end_index = parseInt(listInfo.row_count);
                    listInfo.start_index = 1;
                    listInfo.page = 1;
                }
                else if(options.fullScreen) {
                    listInfo.row_count = Math.floor(widgetDiv.find(".widget-panel").height()/45);
                    tableComp.listControlsEvents();
                }

                if(options.select && selectedFilter!="0") {
                    if(options.module == "asset") {
                        tableComp.setDefaultSearchCriteria({field: "module", value: selectedFilter, condition: "is", logical_operator: "and"});  // No I18N
                    }
                    else {
                        listInfo.filter_by = {id: selectedFilter};
                    }
                }
                else if(options.module == "asset") {
                    tableComp.setDefaultSearchCriteria({});
                }
                options.isUpdateFilter && tableComp.changeFilterString("clearSearch");   // No I18N
                tableComp.refreshTable();
            }
            else {
                this.getWidgetData(widgetId, this.renderTable, {});
            }
        }
        else if(widgetType=="Graph") {
            this.getWidgetData(widgetId, this.renderGraph, {container: widgetDiv});
        }
    },

    //Get the List view filter personalized for a widget
    getSelectedFilter: async function(widgetId, widgetType, options = {}) {
        if(options.module && options.module.startsWith("cm_")) {
            return;
        }
        let dashboardId = $dash.embed.isSingleWidget ? "embed" : dashboardComp.getDashboardId(); // NO I18N
        let personalizeKey = "WidgetFilter-"+dashboardId+"_"+widgetType+widgetId; // NO I18N
        let personalizeValue = sdp_user.CLIENT_CONF[personalizeKey];
        let selectedFilter = personalizeValue && personalizeValue.selected;
        if(selectedFilter && options.properties && !JSON.parse(options.properties).filters.includes(selectedFilter)) {
            //if a personalized filter is removed from a widget filters list, then reset the personalizaiton
            await ClientUtil.addUserPersonalization("widgetFilter", {}, {internalKey: personalizeKey}); //No I18N
            return;
        }

        if(options.isUpdateFilter) {
            selectedFilter = jQuery(options.select).select2("val"); // NO I18N
            await ClientUtil.addUserPersonalization("widgetFilter", {selected: selectedFilter}, {internalKey: personalizeKey}); //No I18N
        }

        let _this = $dash.newWidgets;
        if(options.module && options.properties && !options.module.startsWith("cm_")) {
            let filters = JSON.parse(options.properties).filters;
            let widgetFilters = await _this.checkListViewFilters(options.module, filters);
            //If the selected Filter is not present (deleted)
            //then choose the a filter from widgets filter's list that is present in all filters
            if(!widgetFilters[selectedFilter]) {
                for(let i=0;i<filters.length;i++) {
                    let id = filters[i];
                    if(widgetFilters[id]) {
                        selectedFilter = id;
                        break;
                    }
                }
             }
         }

        if(options.module && _this.checkFilters) {
            //For Admin Requester list view filters will not work so changing the filter to All_Requests
            let isExecutive = $dash.newWidgets.isExecutiveDashboard();
            let widgetFilters = _this.checkFilters[options.module];
            if(isExecutive && options.module=="request" && widgetFilters[selectedFilter]==undefined && sdp_user.USERTYPE=="Technician") {
                selectedFilter = Object.entries(widgetFilters).filter(filter => filter[1].name=="All_Requests")[0][0];
                jQuery("#requester_filter_info_"+widgetType+"_"+widgetId).removeClass("hide");
            }
            else {
                jQuery("#requester_filter_info_"+widgetType+"_"+widgetId).addClass("hide");
            }
        }
        return selectedFilter;
    },

    editWidget: function(widgetId) {
        this.getWidgetData(widgetId, $dash.common.openSlider);
    },

    //Delete a widget from the existing widgets list
    deleteWidget: function(_this, widgetId) {
        sdpAjax({
            url: "/api/v3/widgets/"+widgetId, // NO I18N
            type: "delete",  // NO I18N
            success: function(response) {
                let listItem = jQuery(_this).parent();
                let list = listItem.parent();
                listItem.remove();
                if(list.find("li").length == 0) {
                    list.parents(".zcollapsiblepanel").remove(); // NO I18N
                }
                showalert("success", translate("sdp.dashboard.widget.delete.success.msg"), "isAutoHide=true"); // NO I18N
            }
        });
    },

    //Populate a table/graph widget data in the panel for customization
    populateEditWidget: function(widget) {
        const tab = widget.widget_type;
        this.container.find("#NewWidgetsTabs li[data-tab="+tab+"] a").click();

        let container = this.container.find("#"+widget.widget_type+"_WidgetPane");
        container.find("#widgetName_"+tab).val(widget.name);
        container.find("#widgetModule_"+tab).select2("val", widget.module); // NO I18N
        container.find("#widgetDescription_"+tab).val(widget.description);

        let properties = JSON.parse(widget.properties);
        const _this = $dash.newWidgets;

        let shareType = widget.share_info.share_type;
        this.existingShareType = shareType;
        container.find("#"+shareType+"_Mode_"+tab).click();
        
        if(properties.filters) {
            let isPublicWidget = (shareType=="Public" || shareType=="Shared"); // NO I18N
            this.clearListViewFilters(tab, widget.module);
            properties.filters.forEach(function(id, index) {
                if(index == 0) {
                    let widgetFilters = _this.checkListViewFilters(widget.module, [id]);
                    _this.updateListViewFilters(widget.module, {id: id, text: widgetFilters[id].display_name}, 0, properties.filters);
                }
                else {
                    _this.addListViewFilter(undefined, id, isPublicWidget, properties.filters);
                }
            });
            
            container.find("#filtersList_"+tab+" li span.cspr.drag1").addClass("allow-dd ui-sortable-handle");
            let allFilters = container.find("#listViewFilters_"+tab).find("#filtersList_"+tab+" >li:not(:last)");
            allFilters.find(".addFilter").addClass("hide").end().find(".removeFilter").removeClass("hide");
        }
        else {
            container.find("#listViewFilters_"+tab).empty();
        }

        container.find("#"+tab+"_FilterColumns").removeClass("hide");
        if(tab=="Table") {
            this.updateColumnChooser(properties.columns);
        }
        else if(tab=="Graph") {
            this.updateGraphTypes();
            container.find("#newWidget_graphTypes").select2("val", properties.graphType); // NO I18N
            this.updateGroupByColumns(properties.groupBy);
        }

        this.container.find("#newWidgetsSubTab").hide();
        this.container.find("#graphPreviewLink").removeClass('hide');

        if(shareType=="Shared") {
            let sharedList = widget.share_info.shared_to;
            let selectedIds = {};
            sharedList.forEach(function(shared) {
                let refType = shared.reference_type;
                if(selectedIds[refType]==undefined) {
                    selectedIds[refType]=[];
                }
                selectedIds[refType].push({id: shared.reference_id});
            });
            this["multiSelect_"+tab].setSelectedIds(selectedIds);
        }
    },

    //Update the graph types for graph widget customization
    updateGraphTypes: function() {
        let graphTypes = ["Bar", "Pie", "Line", "Area", "Doughnut", "Funnel", "Pyramid", "HorizontalBar"]; // NO I18N
        let graphTypeData = [];
        for(i=0;i<graphTypes.length;i++) {
            graphTypeData.push({id: graphTypes[i], text: translate("dashboard.graphtype."+graphTypes[i])});
        }
        this.container.find("#newWidget_graphTypes").select2({
            data: graphTypeData,
            placeholder: translate("form.select.placeholder", [translate("dashboard.graph.type")]),
            formatNoMatches: translate("ae.common.select2nomatchesfound")
        });
    },

    //Update the Groupby columns for graph widget customization
    updateGroupByColumns: async function(selectedGroup) {
        const _this = $dash.newWidgets;
        const module = _this.container.find("#widgetModule_Graph").select2("val"); // NO I18N
        const groupBy = _this.container.find("#graphWidget_groupBy");

        let apiName = _this.entities[module].apiName;
        await _this.getMetaInfo(apiName);
        
        let processedColumns = [];
        let fields = _this.moduleMetaInfo[apiName].fields;
        for(let id in fields) {
            if((id=='udf_fields' || id=="cm_fields") && fields[id].fields) {
                for(let udfId in fields[id].fields) {
                    fields[id].fields[udfId].id = udfId;
                    processedColumns.push(fields[id].fields[udfId]);
                }
            }
            else {
                fields[id].id = id;
                processedColumns.push(fields[id]);
            }
        }
        let skipColumns = {
            request: ["approval_status"],
            asset: ["primary_ip", "org_serial_number", "part_no", "ip_addresses", "description", "ci", "used_by_asset", "sys_uptime", "discovered_serial_number", "purchase_order_no"], //NO I18N
        }
        let skipDisplayTypes = ["Multi Line", "CheckBox", "MultiSelect", "Date/Time"]; //NO I18N
        let skipTypes =["double", "boolean", "date", "long"]; //NO I18N

        if(skipColumns[module]) {
            processedColumns = processedColumns.filter(column => skipColumns[module].indexOf(column.id)==-1);
        }

        let filteredColumns = processedColumns.filter(column => 
            column.display_type=='Pick List' || //NO I18N
            (module=='asset' && !column.unique &&
                skipDisplayTypes.indexOf(column.display_type)==-1 && skipTypes.indexOf(column.type)==-1) ||
            (module=='solution' && column.type=='lookup') || (module.startsWith("cm_") && column.display_type=="Radio")
        );
        
        let select2Data = [];
        filteredColumns.forEach(function(column) {
            select2Data.push({ id: column.id, text: column.display_name });
        });
        select2Data = select2Data.filter(column => column.text!=undefined);
        groupBy.select2({
            data: select2Data,
            placeholder: translate("form.select.placeholder", [translate("sdp.reports.customReport.chooserowone")]), // NO I18N
            formatNoMatches: translate("ae.common.select2nomatchesfound")
        });
        groupBy.val(selectedGroup).trigger('change'); // NO I18N
    },

    //Open the Graph preview in graph widget customization
    openGraphPreview: function() {
        const _this = $dash.newWidgets;
        _this.closeGraphPreview();
        _this.graphPreviewContainer = _this.container.find("#graphWidget_Preview").show().panelSlider({
            width: 500,
            header: false,
            placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
            position:{
                my: sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
                at: sdp_user.DIRECTION === "RTL" ? "right" : "left", // NO I18N
                of: jQuery("#WidgetNewPanel")
            },
            dialogClass: "tabui-rightpanel", // NO I18N
            modal: false,
            open:function() {
                _this.container.find("#graphPreviewLink").addClass("hide");
                _this.renderGraphPreview();
                jQuery(document).one('keydown', function(event) { // NO I18N
                   if (event.key == "Escape") {
                       event.stopPropagation();
                       _this.closeGraphPreview();
                   }
               });
            }
        });
    },

    //close the graph preview when close button is clicked
    closeGraphPreview: function(isHideLink=false) {
        if(this.container) {
            this.container.find("#graphPreviewLink").toggleClass('hide', isHideLink); //NO I18N
            if(this.graphPreviewContainer) {
                this.graphPreviewContainer.dialog('close'); //NO I18N
                this.graphPreviewContainer.dialog('destroy'); //NO I18N
                this.graphPreviewContainer.hide();
                delete this.graphPreviewContainer;

                const tab = this.container.find("#NewWidgetsTabs >li.active").data("tab"); // NO I18N
                this.container.find("#"+tab+"_WidgetPane input:first").focus();
            }
        }
    },

    //Render the graph preview in the preview panel
    renderGraphPreview: async function() {
        const _this = $dash.newWidgets;
        const tab = _this.container.find("#NewWidgetsTabs >li.active").data("tab"); // NO I18N
        const container = _this.container.find("#"+tab+"_WidgetPane");

        const widgetName = container.find("#widgetName_Graph").val() || "Untitled Widget"; // NO I18N
        const groupBy = container.find("#graphWidget_groupBy").select2('val'); // NO I18N
        const dropDown = container.find("#filtersList_"+tab+" >li input.lvfilter").first();
        let filterId;
        if(dropDown.length) {
            filterId = dropDown.select2('val'); // NO I18N
        }
        const module = container.find("#widgetModule_Graph").select2("val"); // NO I18N
        const graphType = container.find("#newWidget_graphTypes").select2('val'); // NO I18N

        const previewContainer = jQuery("#graphPreview_Containter");
        previewContainer.find(">div").data({
            belongsto: module,
            module: "Graph" //NO I18N
        });
        previewContainer.data({name: widgetName});

        let widget = {name: widgetName, id: new Date().getTime(), module: module, properties: {graphType: graphType, groupBy: groupBy, filters: [filterId]}};

        let isExecutive = $dash.newWidgets.isExecutiveDashboard();
        if(isExecutive && module=="request") {
            await _this.checkListViewFilters(module, [filterId]);
            if(_this.checkFilters[module][filterId]==undefined) {
                filterId = -1;
            }
        }
        _this.renderGraph(widget, {container: previewContainer, selectedFilter: filterId});
    },

    //get graph type need for rending the graph widget        
    getGraphType: function(graphType) {
        if(dashboardComp.chartTypes[graphType]) {
            return dashboardComp.chartTypes[graphType];
        }
        return graphType;
    },

    //Show Graph Preview Link if all the neccessary fields are selected
    graphFormChange: function(_this) {
        const tab = this.container.find("#NewWidgetsTabs >li.active").data("tab"); // NO I18N
        if(tab=="Graph") {
            const container = this.container.find("#"+tab+"_WidgetPane");
            const graphType = container.find("#newWidget_graphTypes").select2("val"); // NO I18N
            const groupBy = container.find("#graphWidget_groupBy").select2("val"); // NO I18N
            const isGraphPreviewOff = this.container.find("#graphWidget_Preview").css('display') == "none"; // NO I18N
            const filterId = container.find("#filterDropdown_0").select2('val'); // NO I18N

            if(graphType && groupBy && isGraphPreviewOff && filterId) {
                container.find("#graphPreviewLink").removeClass('hide');
            }
        }
        let elementId = jQuery(_this).attr("id");
        this.container.find("#"+elementId+"-error").remove();
        if(elementId.startsWith("filterDropdown_")) {
            jQuery(_this).siblings("span.cspr").addClass("allow-dd ui-sortable-handle"); //No I18n
        }
    }
};
