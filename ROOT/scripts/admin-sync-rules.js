/* $Id$ */
//# sourceURL=admin-sync-rule.js
var $syncRules = {
    shouldShowReorder: false,
    isReorderEnabled: false,
    syncRuleIdOrder: [],
    //init sync rule list view
    async init (options) {
        this.api = "/api/v3/" + options.entity + "/"; //No I18N

        this.options = options;
        this.container = options.container;
        this.entity = options.entity;
        const links = await this.fetchLinks();
        this.links = links._links.reduce((links, link) => {
            links[link.name] = link;
            return links;
        }, {});
        this.render();
    },
    fetchLinks() {
        return sdpAjax({
			url: this.api + "_links"//No I18N
		});
    },
    //check if sync rule order is changed
    hasReorderChanged() {
        return this.isReorderEnabled && this.hasUnsavedChanges();
    },
    disableListActionableColumn(canAddClass) {
        const actions = jQuery("#" + this.entity + "_list_body").find("[sync-rule-toggle-icon]"); //No I18N
        actions.toggleClass("disableDiv", canAddClass); //No I18N
    },
    getSyncRuleIdOrder() {
        let syncRuleIdOrder = [];
        jQuery("#ci_sync_rules_list_body").find('[data-entityid]').each(function () {
          syncRuleIdOrder.push(jQuery(this).data("entityid")); //No I18N
        });
        return syncRuleIdOrder;
    },
    toggleFilter() {
        const toggleFilter = (element) => element.select2("container").find(".select2-search-choice-close").toggleClass("hide", this.isReorderEnabled); //No I18N

        toggleFilter(jQuery("#source-module-filter"));
        toggleFilter(jQuery("#sub-module-filter"));
    },
    toggleReorder(isReorderView) {
        const entity = this.entity;
        const listElements = ["sync-rule-add-btn", entity + "_list_btn_delete", "sync-rule-history", "destination-module", `bulk_selection_${entity}_list`]; //No I18N
        this.isReorderEnabled = isReorderView;

        this.toggleFilter();
        jQuery("#" + listElements.join(",#")).toggleClass("hide", isReorderView);//No I18N
    },
    canChangeFilter(evt) {
        const element = jQuery(evt.target);

        element.select2("close"); //No I18N

        if (this.hasReorderChanged()) {
          this.confirmFilterChange(() => {
            element.select2("data", evt.choice); //No I18N
            this.switchReorder();
            this.refreshList();
          });
          return false;
        }
        return true;
    },
    //confirm if filter can be changed when reorder is enabled for a source module
    confirmFilterChange(confirmCallback) {
        if (jQuery("#show_alert_info_message:visible").length) {
            return;
        }
        showconfirm(true, `
            title=${translate('common.confirm.submit')},
            message=${translate("cmdb.sync.rule.discard.changes")},
            submitbutton=${translate('common.proceed')},
            cancelbutton=${translate("common.discard")},
            closebutton=yes,
            closeOnEscKey=yes`,
            (canDiscard) => canDiscard && confirmCallback()
        );
    },
    //check if required list view filter is applied to enable reorder
    enableReorder(canEnable) {
        if(!this.isReorderEnabled) {
            return false;
        }
        const sourceModule = jQuery("#source-module-filter");
        const subModule = jQuery("#sub-module-filter");

        const isSourceModuleValid = sourceModule.valid();
        const isSubModuleValid = subModule.valid();

        if (!isSourceModuleValid) {
          sourceModule.select2("open"); //No I18N
        } else if(!isSubModuleValid) {
            setTimeout(() => {
                subModule.select2("open");//No I18N
            }, 100);
        }

        if(isSourceModuleValid && isSubModuleValid) {
            if(canEnable) {
                this.switchReorder();
            }
            return true;
        }

        return false;
    },
    switchReorder() {
        this.afterRenderCallback = () => jQuery("#" + this.entity + "_list_reorder_enable_btn").trigger("click");
    },
    hasUnsavedChanges () {
        const loadedOrder = this.syncRuleIdOrder;
        const currentOrder = this.getSyncRuleIdOrder();

        return loadedOrder.some((id, index) => id !== currentOrder[index]);
    },
    //render association list view using MC component.
    render() {
        const serviceId = this.options.getServiceId ? this.options.getServiceId() : undefined;
        const module_value_for_history = serviceId ? "module-value=" + serviceId : ""; //No I18N
        const links = this.links;
        const options = {
            "container": document.getElementById(this.container), //No I18N
            "mode": "list", //No I18N
            "name": this.entity, //No I18N
            "entity_name": this.entity, //No I18N
            "additional_details": { //No I18N
                custom_class: "p0 oxy-inrt mt-5" //No I18N
            },
            "list": { //No I18N
                "meta": { //No I18N
                    "view": "table", //No I18N
                    "getmetainfo": "false", //No I18N
                    "header": {//No I18N
                        "actions": { //No I18N
                            "bulk_selection": { //No I18N
                                "enable": true //No I18N
                            },
                            "custom_action_1": { //No I18N
                                "enable": true, //No I18N
                                "renderhtml":  //No I18N
                                    `<div id="sync-filter-container">
                                        <div class="pos-rel fl mr10"><input type="text" id="source-module-filter" name="source-module-filter" class="form-control" style="width: 180px"></div>
                                        <div class="pos-rel fl mr10"><input type="text" id="sub-module-filter" name="sub-module-filter" class="form-control hide" style="width: 220px"></div>
                                        <input type="text" id="destination-module" class="fl form-control ${links.edit ? "mr10" : ""}" style="width: 180px">
                                    </div>
                                `
                            },
                            "custom_action_2": { //No I18N
                                "enable": links.add, //No I18N
                                "renderhtml": `<button type="button" id="sync-rule-add-btn" class="btn btn-default btn-sm fl mr10">` + //No I18N
                                    `<span class="common-sprite icon-xs common-add-icon4 mr5"></span>${translate("common.new")}` + //No I18N
                                `</button>`,
                            },
                            "custom_action_3": { //No I18N
                                "enable": links.edit, //No I18N
                                "renderhtml": `<div id="reorder_${this.entity}_list" class="fl"></div>`,
                            },
                            "custom_action_4": { //No I18N
                                "enable": true, //No I18N
                                "renderhtml": `<a id="sync-rule-history" class="cur-ptr mr15 thm-spr fr" data-event="click" data-handler="viewModuleHistory(this)" ${module_value_for_history} nonce=${sdpNonce} search-filter="${this.entity.slice(0, -1)}" entity-key="${translate("ae.cmdb.sync.rule")}" data-id="${this.entity}"> ` + //No I18N
                                    `<span class="disp-ib vmiddle mt2 mr3">
                                    <svg width="20" height="20">
                                        <use href="#crspr-history-ic"></use>` + //No I18N
                                    `</svg>
                                </span>
                                ${translate("common.viewhistory")}
                            </a>`,
                            },
                            "deleteicon": { //No I18N
                                "enable": links.delete, //No I18N
                                "custom_class": "fl ml10" //No I18N
                            },
                            "pagination_comp": {//No I18N
                                "enable": true,//No I18N
                                "custom_class": "btn-group"//No I18N
                            },
                        }
                    },
                    "additional_options": { //No I18N
                        "personalize_key": this.entity + "_list", //No I18N
                        "callback-url": this.entity, //No I18N
                        "row_inputdata": "$syncRules.getInputData", //No I18N
                        "callback-rowfunction": "$syncRules.getInputData", //No I18N
                        "callback-after-initial-render": "$syncRules.didHeaderRender",//No I18N
                        "other-options": "$syncRules.getOptions", //No I18N
                        "width": "fx:$syncRules.getWidth", //No I18N
                        "height": "fx:$syncRules.getHeight", //No I18N
                        "sorting-enabled": false, //No I18N
                        "reorder-enabled": true //No I18N
                    },
                    "cells": { //No I18N
                        "fields_required": { //No I18N
                            "integration_sync_rules_list_head_chk": {//No I18N
                                "hide_label": true, //No I18N
                                "default": true,  //No I18N
                                "type": "checkbox", //No I18N
                            },
                            "action": { //No I18N
                                "type": "icon", //No I18N
                                "hide_label": true, //No I18N
                                "default": true, //No I18N
                                "render": "$syncRules.renderActionColumn", //No I18N
                            },
                            "source_module": { //No I18N
                                "name": "source_module", // No I18N
                                "default": true, //No I18N
                                "render": "$syncRules.renderSourceModule" //No I18N
                            },
                            "destination_module": {//No I18N
                                "name": "destination_module", // No I18N
                                "default": true, //No I18N
                                "width": "250px", //No I18N
                                "render": "$syncRules.renderDestinationModule" //No I18N
                            },
                            "description": {//No I18N
                                "name": "description", // No I18N
                                "default": true //No I18N
                            },
                            "is_enabled": { //No I18N
                                "name": "is_enabled", // No I18N
                                "render": "$syncRules.renderStatus", //No I18N
                                "width": "100px", //No I18N
                                "default": true //No I18N
                            }
                        }
                    }
                },
                "options": { //No I18N
                    "component": {} //No I18N
                }
            }
        };

        const column = options.list.meta.cells.fields_required;
        if(!links.edit && !links.delete && !links.run_through_filter) {
            delete column.action;
        }

        if(!links.delete) {
            delete column.integration_sync_rules_list_head_chk;
        }

        new MC(options);
        if(this.options.sourceModule) {
            jQuery("#sub-module-filter").removeClass("hide"); //No I18N
            jQuery("#source-module-filter").addClass("hide"); //No I18N
            this.renderSubModule(this.options.sourceModule.id);
        }
    },
    callbackReorderPreSave: function(inputData) {
        inputData.reorder.source_module = { id: jQuery("#source-module-filter").val() };
        if(jQuery("#sub-module-filter").is(":visible")) {
            inputData.reorder.sub_module = { id: jQuery("#sub-module-filter").val() };
        }
        return inputData;
    },
    //get additional options for list view
    getOptions(options) {
        options.reorderURL = true;
        options.reorderEnabled = true;
        options.callbackReorderURL = this.entity + "/_reorder"; //No I18N
        options.callbackAfterBodyRender = this.didBodyRender;
        options.staticHeader = false;
        options.hidePageLength = true;

        options.sortingEnabled = false;
        options.callbackReorderPreSave = this.callbackReorderPreSave;

        options.bulkSelectionSetting = { //to enable bulk select.
            enabled: true,
            constructSelectedListCB: this.constructSelectedListCB,
        }

        return options;
    },
    constructSelectedListCB: (data) => {
        const { source_module, destination_module } = data;
        const text = (source_module.display_name || source_module.name) + " > " + destination_module.display_name;
        return `<span rel="uitip" mode_ellipsis=true title='${e_attr(text)}'>${e_html(text)}</span>`
    },
    getInputData(tableInfo) {
        let inputData = {};
        const listInfo = tableInfo.list_info;

        listInfo.sort_fields = [{ field: "index", order: "asc" }, { field: "id", order: "asc" }];//No I18N
        listInfo.has_more_rows = undefined;
        listInfo.row_count = 100;

        if(typeof tableInfo.column_order == "string") { //No I18N
            tableInfo.column_order = JSON.parse(tableInfo.column_order);
        }

        listInfo.search_criteria = $syncRules.getCriteria();
        inputData.list_info = listInfo;
        const serviceFilter = this.options.getServiceFilter ? this.options.getServiceFilter() : undefined;
        if(serviceFilter) {
            inputData.service = serviceFilter
        }
        return inputData;
    },
    getSourceModule() {
        const module = jQuery("#source-module-filter"); //No I18N
        return module.data("select2") ? module.select2("data") : this.activeSourceModule; //No I18N
    },
    didHeaderRender() {
        const self = $syncRules;
        this.renderDestinationModuleFilter();
        this.renderSourceModuleFilter();

        jQuery("#sync-rule-add-btn").on("click", () => { //No I18N
            self.options.add();
        });

        const destinationModule = jQuery("#destination-module"); //No I18N

        jQuery("#" + self.entity + "_list_reorder_enable_btn").on("click", function (e) { //No I18N
            self.toggleReorder(true);
            if(self.enableReorder()) {
                if(destinationModule.val()) {
                    e.preventDefault();
                    destinationModule.select2("val", "");//No I18N

                    self.switchReorder();
                    self.refreshList();
                } else {
                    self.syncRuleIdOrder = self.getSyncRuleIdOrder();
                    self.disableListActionableColumn();
                }
            } else {
                e.preventDefault();
            }
        });


        jQuery("#" + self.entity + "_list_reorder_apply_btn").on("click", () => {
            self.toggleReorder(false);
        });

        const cancelButton = jQuery("#" + self.entity + "_list_reorder_cancel_btn");

        cancelButton.off("click.cancelSyncRule").on("click.cancelSyncRule", () => {//No I18N
            if(!self.hasReorderChanged()) {
                self.toggleReorder(false);
            } else {
                self.confirmFilterChange(() => {
                    cancelButton.trigger("click");
                });
            }
        });

        this.alignHeader();
        this.setValidation();
    },
    didBodyRender() {
        const self = $syncRules;

        jQuery("[delete-sync-rule]").off("click.deleteSyncRule").on("click.deleteSyncRule", (evt) => { //No I18N
            if (confirm(translate("common.delete.confirm"))) {
                self.deleteSyncRule(jQuery(evt.target).data("id")); //No I18N
            }
        });
        
        jQuery("[edit-sync-rule]").off("click.editSyncRule").on("click.editSyncRule", (evt) => { //No I18N
            self.options.edit(jQuery(evt.target).data("id")); //No I18N
        });
        
        jQuery("[run-through-sync-rule]").off("click.runThroughSyncRule").on("click.runThroughSyncRule", (evt) => { //No I18N
            const id = jQuery(evt.target).data("id"); //No I18N
            const data = self.getList().bulkSelect.loadedRecords[id];
            self.runThroughFilter(data);
        });
        
        jQuery("[integration-sync-rule-status-toggle]").off("click.toggleSyncRuleStatus").on("click.toggleSyncRuleStatus", async function(evt) { //No I18N
            if (evt.isTrigger) { return };
            const id = jQuery(this).data("id"); //No I18N
            const element = jQuery(evt.target);
            const toggle = ((disable) => element.parent().toggleClass("disableDiv", disable)); //No I18N
            toggle(true);
            evt.preventDefault();
            const isUpdated = await new Promise((resolve) => {
                const promise = self.updateSyncRuleStatus(id, element.is(":checked")); //No I18N
                promise.then(() => resolve(true));
                promise.catch(() => resolve(false));
            });
        
            // Enable toggle once request completed.
            toggle(false);
        
            if (isUpdated) {
                element.click();
            }
        });        

        jQuery(window).on('resize', () => {
            self.alignHeader();        
        });

        self.afterRenderCallback ? self.afterRenderCallback() : undefined;
        self.afterRenderCallback = undefined;
        self.syncRuleIdOrder = self.getSyncRuleIdOrder();
    },
    alignHeader: function() {
        jQuery("#sync-filter-container").toggleClass("disp-flex valign-center mb10", window.innerWidth <= (this.options.widthToResize || 1750)); //No I18N
    },
    runThroughFilter: function(data) {
        sdpAjax({
            url: this.api + data.id + "/_run_through_filter",//No I18N
            type: "post" }). //NO I18N
          then(function () {
            showalert("success", translate("ae.cmdb.sync.rules.run.through.succ.msg"), "isAutoHide=true"); // No I18N
          });
    },
    cancelReorder() {
        this.setReorderActions();
        this.setCriteria(); //reset criteria that applied for reorder
        this.getList().toggleReorder();
    },
    loadhierarchySelect2() {
        return new Promise((resolve) => {
            if(typeof hierarchySelect2 !== "undefined") {
                return resolve();
            }
        });
    },
    renderSourceModuleFilter() {
        const _self = this;
        const element = jQuery("#source-module-filter"); //No I18N
        const sort_field = _self.options.getServiceFilter ? "name" : "display_name";//No I18N

        const formatSelection = (data) => e_html(data.display_name || data.name);
        element.sdp_select2({
            url: [{
                url: _self.api + "source_module/", //No I18N
                field: "source_module", //No I18N
                list_info: {
                    search_criteria: _self.options.getSourceModuleFilterCriteria ? _self.options.getSourceModuleFilterCriteria() : undefined,
                    sort_field: sort_field,
                    sort_order: "asc" //No I18N
                },
                search_field: this.options.source_module_field ||  "display_name", // no i18n
                input_data_Callback : (url_options,input_data,term) => {
                    if(_self.options.getServiceFilter) {
                        input_data.service = _self.options.getServiceFilter();
                    }
                    return input_data;
                }
            }],
            formatSelection,
            formatResult: formatSelection,
            processResults: (data, option) => data.push(option),
            placeholder: translate("sdp.cmdb.markasci.source.module"),
            allowClear: true,
            width: "240px" //No I18N
        });

        element.on("select2-selecting", (evt) => _self.canChangeFilter(evt));
        element.on("change", (evt) => {
            element.valid();
            const sourceModule = jQuery(evt.target).select2("data"); //No I18N
            const canShowSubModule = sourceModule ? (sourceModule.name === "asset_asset" || sourceModule.name === "cmdb") : false;
            _self.activeSourceModule = sourceModule;

            jQuery("#sub-module-filter").toggleClass("hide", !canShowSubModule); //No I18N
            if(canShowSubModule) {
                _self.renderSubModule(sourceModule.id);
            }
            setTimeout(() => {
                _self.enableReorder(true);
                _self.refreshList();
            });
        });
    },
    renderSubModule(id) {
        const element = jQuery("#sub-module-filter");
        //to check if filter is rendered or not, if not render it
        if (element.hasClass("select2-offscreen")) { // No I18N
            return;
        }
        this.loadhierarchySelect2().then(()=> {
            hierarchySelect2.init({
                id: "sub-module-filter", // No I18N
                url: this.api + "sub_module", //No I18N
                entity: "sub_module", //No I18N
                list_info: {
                    fields_required: ["parent", "display_name", "api_plural_name"], //No I18N
                    filter_by: id ? { id } : undefined,
                    row_count: 100
                },
                width: "200px", // No I18N
                allowClear: true,
                disabled: false,
                placeholder: this.entity == "asset_sync_rules" ? translate("ae.cmdb.admin.citype.citype") : translate("sdp.helpdesk.common.citype"), //No I18N
                displayField: true,
                events: {
                    change: () => {
                        if(this.isReorderEnabled) {
                            jQuery("#destination-module").select2("val", "");//No I18N
                        }
                        this.enableReorder(true);
                        this.refreshList();
                    }
                }
            });

            element.off("select2-selecting").on("select2-selecting", (evt) => this.canChangeFilter(evt)); //No I18N
        });
    },
    renderDestinationModuleFilter() {
        const formatResult = (result) => {
            return e_html(result.display_name || result.name);
        }

        const options = {
            id: "destination-module", // No I18N
            url: this.api + "destination_module", //No I18N
            entity: "destination_module", //No I18N
            inputData : {
                list_info: {
                    fields_required: ["parent", "display_name", "api_plural_name"], //No I18N
                    row_count: 100
                },
            },
            width: "200px", // No I18N
            allowClear: true,
            disabled: false,
            placeholder: translate(this.options.destinationModulePlaceHolder || "sdp.cmdb.citypes.listview.markasci.destinationmodule"),
            formatResult: formatResult,
            formatSelection: formatResult,
            events: {
                change: $syncRules.refreshList
            }
        };
        if(this.options.getServiceFilter) {
            options.inputData.service = this.options.getServiceFilter();
        }
        hierarchySelect2.init(options);
    },
    getWidth: () => "100%", //No I18N
    getHeight() {
        function getHeightOf(ids) {
            return ids.reduce(function (totalHeight, id) {
                return totalHeight + (jQuery("#" + id).outerHeight() || 0)
            }, 0);
        }
        const ids = ["top-subheader", "header-placeholder", "securityrisk", "admin-wizard-header", "admintabui", "sdp-chat-bar", "listcontrolsDiv"]; //No I18N
        return (jQuery(window).height() - getHeightOf(ids)) + "px"; //No I18N
    },
    getColumnSetting(options) {
        options.column_settings = { position : 1, rowposition: 1 };
        options.hide_label = true;
        return options;
    },
    getSecondColumnSetting(options) {
        options.column_settings = { position: 2, rowposition: 1, pipe_separation: true };
        return options;
    },
    renderActionColumn(rule) {
        const self = $syncRules;
        const links = self.links;

        let options = [];
        const data = rule.row_data;
        const id = data.id;
        if(links.edit) {
            options.push(`<li>
                <li>
                    <span edit-sync-rule data-id=${id} class="a-tag-sdmenu">
                        ${translate("sdp.common.edit")}
                    </span>
                </li>
            </li>`);
        }
        if(links.delete) {
            options.push(`<hr class="m3">
                <li>
                    <span delete-sync-rule data-id=${id} class="a-tag-sdmenu">
                        ${translate("sdp.common.delete")}
                    </span>
                </li>`
            );
        }

        if(data.source_module.name != "asset_sub_switch_port" && links.run_through_filter) {
            options.push(`<hr class="m3">
                <li id="run-through-sync-rule-${id}" class="${data.is_enabled ? "" : "hide"}">
                    <span run-through-sync-rule=${id} data-id="${id}" class="a-tag-sdmenu">
                        ${translate("ae.cmdb.sync.rules.run.through")}
                    </span>
                </li>`
            );
        }

        return `<span sync-rule-toggle-icon class="btn-group bs-noconflict pos-rel pos-rel">
            <button type="button" title="${translate("sdp.common.actions")}" data-switch="sdmenu" rel="uitip" class="pr5 pl5 glyph-buttonbg" aria-expanded=false>` + //No i18n
                `<span class="cspr menulist icon-xs sdmenu-toggle vtop pos-rel mt2"></span>
            </button>
            <ul class="sdmenu-dd showmenu p0">
                ${options.join("")}
            </ul>
        </span>`;
    },
    renderSourceModule(rule) {
        const data = rule.row_data;
        const sourceModule = data.source_module;
        const subModule = data.sub_module ? " > " + data.sub_module.display_name : "";
        const html = (sourceModule.display_name || sourceModule.name) + subModule;
        return `<span rel="uitip" mode_ellipsis="true" title="${e_attr(html)}">${e_html(html)}</span>`;
    },
    renderDestinationModule(table) {
        const { display_name } = table.row_data.destination_module;
        return `<span rel="uitip" mode_ellipsis="true" title="${e_attr(display_name)}">${e_html(display_name)}</span>`
    },
    renderStatus(rule) {
        const data = rule.row_data;
        return `<label class="disp-iflex mr5 vtop ${$syncRules.links.edit ? "" : "disableDiv"}" sync-rule-toggle-icon>` + //No I18N
            `<input ${data.is_enabled ? "checked" : ""} class="togglechk" integration-sync-rule-status-toggle data-id="${data.id}" type="checkbox">
            <span class="slide-toggle togg-sm">
                <span class="switch-toggle">
                </span>
            </span>
        </label>`;
    },
    deleteSyncRule: function (id) {
        sdpAjax({
          url: this.api + id,
          type: "DELETE", //NO I18N
        }).then(() => {
          showalert("success", translate("common.delete.success"), "isAutoHide=true"); // No I18N
          this.refreshList();
        });
    },
    updateSyncRuleStatus(id, status) {
        return sdpAjax({
          url: this.api + id,
          type: "PUT", //NO I18N
          data: sdpAjaxInputData({
            [this.entity.slice(0, -1)]: { is_enabled: status }
          })
        }).then(() => {
            const message = status ? "common.enabled.success.msg" : "common.disabled.success.msg"; //No I18N
            jQuery(`[run-through-sync-rule=${id}]`).parent().toggleClass("hide", !status);//No I18N
            showalert("success", translate(message, [translate("ae.cmdb.sync.rule")]), "isAutoHide=true"); // No I18N
        });
    },
    setValidation() {
        const message = {
            "required": translate("cmdb.sync.rule.reorder.enable.msg") //No I18N
        };
        //source module and associated sub modules are required for reorder
        initFormValidator("sync-rules-form", { //No I18N
            "source-module-filter": { //No I18N
              "required": (element) => {//No I18N
                return this.isReorderEnabled && element.value === "";
              }
            },
            "sub-module-filter": { //No I18N
                "required": () => {//No I18N
                    return jQuery("#sub-module-filter").is(":visible") && this. isReorderEnabled;//No I18N
                }
            }
          },
          {
            "source-module-filter": message, //No I18N
            "sub-module-filter": message //No I18N
          }
        );
    },
    getCriteria() {
        const sourceModuleId = jQuery("#source-module-filter").val(); //No I18N
        const destinationModuleId = jQuery("#destination-module").val(); //No I18N
        const subModuleId = jQuery("#sub-module-filter:visible").val(); //No I18N

        const criteria = [];

        if(sourceModuleId) {
            criteria.push({
                field: "source_module.id", //No I18N
                condition: "is", //No I18N
                value: sourceModuleId,
                logical_operator: "AND"  //No I18N
            });
        }

        if(destinationModuleId) {
            criteria.push({
                field: "destination_module.id", //No I18N
                condition: "is", //No I18N
                value: destinationModuleId,
                logical_operator: "AND"  //No I18N
            });
        }

        if(subModuleId) {
            criteria.push({
                field: "sub_module.id", //No I18N
                condition: "is", //No I18N
                value: subModuleId,
                logical_operator: "AND"  //No I18N
            });
        }

        return typeof this.options.getCriteria === "function" ? this.options.getCriteria(criteria) : criteria;//No I18N
    },
    getList() {
        return WebComponents.instancePool["webc-" + this.entity]; //No I18N
    },
    setCriteria() {
        const criteria = this.getCriteria();
        const table = this.getList();
        table.t_obj.table_info.list_info.search_criteria = criteria;
    },
    refreshList() {
        const self = $syncRules;
        if(self.isReorderEnabled) {
            self.getList().setReorderState(false);
        }
        self.setCriteria();
        self.getList().refreshTable("search");//No I18N
    },
    getNoDeviceTypeHtml() {
        return `<div id="no-association-banner">
            <div class="tc pt30 pb30" data-id="open-screen"><span class="esspr empty-assoc"></span>
                <p class="form-control-static">${translate("integration.no.device.type")}</p>
            </div>
        </div>`;
    }
}
