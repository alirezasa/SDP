/* $Id$ */
var $associationList = {
    cardinalities: {
        "one_to_one": "One to One", //No I18N
        "one_to_many": "One to Many", //No I18N
        "many_to_one": "Many to One", //No I18N
        "many_to_many": "Many to Many" //No I18N
    },
    //to load particual source module list view by default
    fetchSourceModule() {
        return sdpAjax({
			url: "/api/v3/module_relationships/source_module/", //No I18N
			data: sdpAjaxInputData({
			  	list_info: {
					fields_required: ["api_plural_name", "display_name", "status"],  //No I18N
					row_count: 1
				}  
			})
		});
    },
    //to render association list view in association admin page(/app#/admin/associations)
    //initialized from admin/associations/route.js
    async init () {
        const { source_module } = await this.fetchSourceModule();

        if(source_module.length) {
            this.activeSourceModule = source_module[0];
            this.render();
        }

        jQuery("#empty-source-module-info").toggleClass("hide", source_module.length > 0); //No I18N
    },
    calcPercentage(percentage, total) {
        return percentage * total / 100;
    },
    getColumnPercentage(percentage) {
        const containerWidth = jQuery(".admin-wrapper").width();
        const width = containerWidth - containerWidth / 12;
        return this.calcPercentage(percentage, width - 180); //20 padding size
    },
    //render association list view using MC component.
    render() {
        var options = {
            "container": document.getElementById("associations_list_container"), //No I18N
            "mode": "list", //No I18N
            "name": "module_relationships", //No I18N
            "entity_name": "module_relationships", //No I18N
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
                            "custom_class": "fl mr10", //No I18N
                            "renderhtml": `<div class="fl mr10" data-non-action="module_relationships_list">
                                <input type="text" id="source-module-status" class="form-control" style="width: 130px">
                            </div>` //No I18N
                          },
                          "custom_action_2": { //No I18N
                            "enable": true, //No I18N
                            "custom_class": "fl mr10", //No I18N
                            "renderhtml": `<div class="fl mr10" data-non-action="module_relationships_list">` + //No I18N
                                `<input type="text" id="source-module-filter" class="form-control" style="width: 200px">
                            </div>`,
                          },
                          "custom_action_3": { //No I18N
                            "enable": true, //No I18N
                            "renderhtml": `<button association_add_btn class="btn btn-default btn-sm fl mr10" data-non-action="module_relationships_list" data-cs-field="new-association-btn">` + //No I18N
                                `<span id="association_add_btn_icon" class="common-sprite icon-xs common-add-icon4 mr5"></span>${translate("common.new")}` + //No I18N
                            `</button>`,
                          },
                          "custom_action_4": { //No I18N
                            "enable": true, //No I18N
                            "renderhtml": `<a class="cur-ptr mr15 thm-spr fr" id="associaton-history-btn" search-filter="module_relationship" entity-key="${translate("admin.association.name")}" data-id="module_relationships"> ` + //No I18N
                                `<span class="disp-ib vmiddle mt2 mr3">
                                    <svg width="20" height="20">
                                        <use href="#crspr-history-ic"></use>` + //No I18N
                                    `</svg>
                                </span>
                                ${translate("common.viewhistory")}
                            </a>`,
                          },
                          "deleteicon": { //No I18N
                            "enable": true, //No I18N
                            "custom_class": "fl" //No I18N
                          },
                          "pagination_comp": {//No I18N
                            "enable": true,//No I18N
                            "custom_class": "btn-group"//No I18N
                          },
                        },
                    },
                    "additional_options": { //No I18N
                        "personalize_key": "association_list", //No I18N
                        "callback-url": "module_relationships", //No I18N
                        "row_inputdata": "$associationList.getInputData", //No I18N
                        "callback-rowfunction": "$associationList.getInputData", //No I18N
                        "callback-after-initial-render": "$associationList.didHeaderRender",//No I18N
                        "other-options": "$associationList.getOptions", //No I18N
                        "width": "fx:$associationList.getWidth", //No I18N
                        "height": "fx:$associationList.getHeight", //No I18N
                        "nodatabanner_callback": "$associationList.getNoDataBanner", //No I18N
                    },
                    "cells": { //No I18N
                        "fields_required": { //No I18N
                            "module_relationships_list_head_chk": {//No I18N
                                "hide_label": true, //No I18N
                                "default": true,  //No I18N
                                "type": "checkbox", //No I18N
                                "callback-Columnoption": "fx:$associationList.getColumnSetting", //No I18N
                                "render": "$associationList.renderCheckbox" //No I18N
                            },
                            "action": { //No I18N
                                "callback-Columnoption": "fx:$associationList.getColumnSetting", //No I18N
                                "type": "icon", //No I18N
                                "hide_label": true, //No I18N
                                "default": true, //No I18N
                                "render": "$associationList.renderEditIcon", //No I18N
                                "td_class": "pos-rel" //No I18N
                            },
                            "source_display_name": { //No I18N
                                "width": "900px", //No I18N
                                "callback-Columnoption  ": "fx:$associationList.getSourceModuleColumnSetting", //No I18N
                                "render": "$associationList.renderSourceDisplayName" //No I18N
                            },
                            "association_type": { //No I18N
                                "labelwidth": "230", //No I18N
                                "width": this.getColumnPercentage(40) - 160 + "px",
                                "name": "association_type", // No I18N
                                "render": "$associationList.renderAssociationType", //No I18N
                                "callback-Columnoption": "fx:$associationList.getCommonFieldsColumnSetting", //No I18N
                            },
                            "cardinality": { //No I18N
                                "labelwidth": "100", //No I18N
                                "width": Math.max(this.getColumnPercentage(15), 110) + "px", //No I18N
                                "render": "$associationList.renderCardinality", //No I18N
                                "callback-Columnoption": "fx:$associationList.getCommonFieldsColumnSetting", //No I18N
                            },
                            "destination_display_name": { //No I18N
                                "labelwidth": "230", //No I18N
                                "width": this.getColumnPercentage(45) - 105 + "px",
                                "callback-Columnoption": "fx:$associationList.getCommonFieldsColumnSetting", //No I18N
                            }
                        }
                    }
                },
                "options": { //No I18N
                    "component": {} //No I18N
                }
            }
        };

        new MC(options);
    },
    //get additional options for list view
    getOptions(options) {
        options.column_settings = {
            default_position: 3,
            row_count: 2,
            assign_label_width: true,
            assign_content_width: true,
            row_custom_class: "kanban-list pt10", //No I18N
            columns: [{
                auto_resize: true,
                size: 1,
                row_count: 1,
                width : "80px", //No I18N
            },
            {
                size: 11,
                auto_resize: true,
                row_count: 2
            }]
        };
        options.view = "kanban"; //No I18N
        options.view_mode = "linear"; //No I18N
        options.columnlabelWidth = "240";
        options.bulkSelectionSetting = {
            constructSelectedListCB: (data) => {
                const text = e_html(data.source_display_name);
                return `<span rel="uitip" title="${text}" mode_ellipsis="true">${text}</span>`;
            }
        };
        options.callbackAfterBodyRender = this.didBodyRender;
        options.bulk_action_summary = {
            field: "source_display_name",
            entity_i18n: "association.source.display.name"
        };

        return options;
    },
    getInputData(tableInfo) {
        var inputData = {};
        tableInfo.list_info.sort_field = "source_display_name";
        if(typeof tableInfo.column_order == "string") { //No I18N
            tableInfo.column_order = JSON.parse(tableInfo.column_order);
        }
        inputData.list_info = tableInfo.list_info;
        inputData.list_info.search_criteria = this.getCriteria();
        return inputData;
    },
    //check if selected source module is active
    isActive() {
        const status = jQuery("#source-module-status"); //No I18N
        return status.data("select2") ? status.val() === "false" : this.isPulished(); //No I18N
    },
    getSourceModule() {
        const module = jQuery("#source-module-filter"); //No I18N
        return module.data("select2") ? module.select2("data") : this.activeSourceModule; //No I18N
    },
    //get critria for the selected source module and status
    getCriteria() {
        const id = this.getSourceModule().id;

        return {
            field: "inactive", //No I18N
            value: !this.isActive(),
            condition: "is", //No I18N
            children: [{
                field: "source_module.id", //No I18N
                condition: "is", //No I18N
                value: id,
                logical_operator: "AND"  //No I18N
            },
            {
                field: "destination_module.id", //No I18N
                condition: "is", //No I18N
                value: id,
                logical_operator: "OR" //No I18N
            }]
        };
    },
    //callback for destination module select2 in association form
    renderDestinationModule(value) {
        const associationTypeId = jQuery("#association_type").val(); //No I18N
        const sourceModuleId = $associationList.getSourceModule().id;
        const element = jQuery("#destination_module"); //No I18N

        element.sdp_select2({
            placeholder: translate("sdp.change.sla.select"), //No I18N
            url: [{
                url: "/api/v3/module_relationships/destination_module", //NO I18N
                field: "destination_module", //NO I18N
                search_field: "display_name", //NO I18N
                list_info: {
                    "fields_required": ["parent", "display_name", "api_plural_name"], //No I18N
                    "row_count": 100, //No I18N
                    "filter": { //No I18N
                        "association_type": associationTypeId, //No I18N
                        "source_module": sourceModuleId //No I18N
                    }
                }
            }],
            formatSelection: function (option) {
                var span = jQuery( "<span>", { "title": e_attr(option.display_name), "html": e_html(option.display_name) } );  //NO I18N
                span.uitooltip({
                    content: function () {
                        var element = jQuery(this);
                        if (element.parent()[0].offsetWidth >= element.parent()[0].scrollWidth) {
                            element.attr("title", "");   //NO I18N
                            return false;
                        }
                        return element.attr("title")    //NO I18N
                    },
                    track: true,
                    show: {
                        delay: 250
                    },
                    tooltipClass: "uitip" //NO I18N
                });
                return span;
            },
            processResults: (data, option) => {
                option.text = option.display_name;
                data.push(option);
            },
            value
        });
    },
    didHeaderRender() {
        this.setStatusFilter();
        this.setSourceModuleFilter();
        jQuery("#associaton-history-btn").off("click").on("click", function() { //No I18N
            viewModuleHistory(this);
        });
    },
    didBodyRender() {
        const self = $associationList;
        jQuery("[association_add_btn]").off("click.addAssociation").on("click.addAssociation", () => self.add()); //No I18N
        jQuery("[edit-association]").on("click", function() { //No I18N
            const id = jQuery(this).data("id"); //No I18N
            self.edit(id);
        });
        jQuery("#module_relationships_list_kanban_div").css("height", self.getHeight()); //No I18N

        
    },
    //custom render cardinality column as it's value not available in response but key
    renderCardinality(data) {
        const key = data.row_data.cardinality;
        return e_html($associationList.cardinalities[key]);
    },
    setStatusFilter() {
        const statusAllowedValues = [{
            id: "false", //No I18N
            text: translate("sdp.contract.listViewI.active") //No I18N
        },
        {
            id: "true", //No I18N
            text: translate("sdp.project.projectstatusattribute.isdeleted") //No I18N
        }];

        const canEnableStatusFilter = this.isPulished();
        const element = jQuery("#source-module-status"); //No I18N
        
        element.select2({
            data: statusAllowedValues,
            minimumResultsForSearch: Infinity
        });

        element.select2("val", "" + !canEnableStatusFilter); //No I18N
        element.select2("enable", canEnableStatusFilter); //No I18N
        element.toggleClass("ptr-ev-none", !canEnableStatusFilter); //No I18N

        element.off().on("change", () => { //No I18N
            this.enableNew();
            this.refreshList();
        });
        this.enableNew();
    },
    //enable new association button only if source module is active
    enableNew() {
        const isActive = this.isActive();
        jQuery("[association_add_btn]").prop("disabled", !isActive); //No I18N
        jQuery("#association_add_btn_icon").toggleClass("cur-na", !isActive); //No I18N
    },
    //check if selected source module is active
    isPulished() {
        const sourceModule = jQuery("#source-module-filter"); //No I18N

        const activeSourceModule = sourceModule.data("select2") ? sourceModule.select2("data") : this.activeSourceModule; //No I18N
        return activeSourceModule.status.internal_name === "published"; //No I18N
    },
    setSourceModuleFilter() {
        const value = this.activeSourceModule;
        const element = jQuery("#source-module-filter"); //No I18N
        const formatResult = (data) => e_html(data.display_name);

        element.sdp_select2({
            url: [{
                url: "/api/v3/module_relationships/source_module/", //No I18N
                field: "source_module", //No I18N
                search_field: "display_name", //NO I18N
                list_info: { start_index: 1, row_count: 25, fields_required: ["display_name", "api_plural_name", "status"] }, //No I18N
                sort_field: "display_name", //No I18N
                sort_order: "A", //No I18N
            }],
            processResults(data, option) {
                data.push(option);
            },
            formatSelection: function (option) {
                var span = jQuery( "<span>", { "title": e_attr(option.display_name), "html": e_html(option.display_name) } );  //NO I18N
                span.uitooltip({
                    content: function () {
                        var element = jQuery(this);
                        if (element.parent()[0].offsetWidth >= element.parent()[0].scrollWidth) {
                            element.attr("title", "");   //NO I18N
                            return false;
                        }
                        return element.attr("title")    //NO I18N
                    },
                    track: true,
                    show: {
                        delay: 250
                    },
                    tooltipClass: "uitip" //NO I18N
                });
                return span;
            },
            formatResult: formatResult,
            value
        });

        element.on("change", (e) => { //No I18N
            this.activeSourceModule = jQuery(e.target).select2("data"); //No I18N
            this.setStatusFilter();
            this.refreshList();
        });
    },
    getWidth() {
        return "100%"; //No I18N
    },
    getHeight() {
        function getHeightOf(ids) {
            return ids.reduce(function (totalHeight, id) {
                return totalHeight + (jQuery("#" + id).outerHeight() || 0)
            }, 0);
        }
        const ids = ["top-subheader", "header-placeholder", "securityrisk", "admin-wizard-header", "admintabui", "sdp-chat-bar"]; //No I18N
        return (jQuery(window).height() - (getHeightOf(ids) + 60)) + "px"; //No I18N
    },
    loadAssociationScript() {
        return new Promise((resolve) => {
            if(typeof $association !== "undefined") {
                return resolve();
            }
            ResourceLoader({
                js: ["/scripts/admin-association.js"],//No I18N
                success: () => resolve()
            });
        });
    },
    async add() {
        await this.loadAssociationScript();
        $association.init({
            association: {
                source_module: this.getSourceModule()
            },
            attachTo: "#association-container", //No I18N
            renderDestinationModule: this.renderDestinationModule,
            refreshList: this.refreshList,
            url: "/api/v3/module_relationships", //No I18N
            entity: "module_relationship", //No I18N
        });
    },
    async edit(id) {
        await this.loadAssociationScript();
        $association.init({
            association: { id },
            attachTo: "#association-container", //No I18N
            renderDestinationModule: this.renderDestinationModule,
            url: "/api/v3/module_relationships", //No I18N
            refreshList: this.refreshList,
            entity: "module_relationship", //No I18N
        });
    },
    getColumnSetting(options) {
        options.column_settings = { position : 1, rowposition: 1 };
        options.hide_label = true;
        return options;
    },
    getSourceModuleColumnSetting(options) {
        options.column_settings = { position: 2, rowposition: 1 };
        options.hide_label = true;
        return options;
    },
    getCommonFieldsColumnSetting(options) {
        options.column_settings = { position: 2, rowposition: 2 };
        return options;
    },
    renderCheckbox(table) {
        return `<input type="checkbox" class="mt5" aria-label="checkbox" value="${table.row_data.id}" data-table-checkbox>`;
    },
    renderEditIcon(table) {
        const isActive = this.isActive();
        const title = translate(isActive ? "sdp.common.edit" : "association.inactive.edit.disable.msg");
        return `<div class="disp-b tc ml10 ${isActive ? "cur-ptr" : "cur-na"}">
            <span role="img" class="tc-edit ${isActive ? "" : "ptr-ev-none"}" edit-association data-id=${table.row_data.id} title="${title}" rel="uitip">
            </span>
        </div>`;
    },
    renderSourceDisplayName(table) {
        const text = table.row_data.source_display_name;
        return `<span class="sb" title="${e_attr(text)}" mode_ellipsis="true">${e_html(text)}</span>`;
    },
    getColumnHtml(text) {
        return `<span rel="uitip" title="${e_attr(text)}" mode_ellipsis="true">${e_html(text)}</span>`;
    },
    renderAssociationType(table) {
        return this.getColumnHtml(table.row_data.association_type.name + " - " + table.row_data.association_type.inverse_name);
    },
    renderSourceModule(table) {
        return this.getColumnHtml(table.row_data.source_module.display_name);
    },
    renderDestinationModuleColumn(table) {
        return this.getColumnHtml(table.row_data.destination_module.display_name);
    },
    refreshList() {
        const table = WebComponents.instancePool["webc-module_relationships"]; //No I18N
        table.t_obj.table_info.list_info.search_criteria = $associationList.getCriteria();
        table.refreshTable();
    },
    getNoDataBanner() {
        const isActive = $associationList.isActive();
        const inactiveMsg = `<p class="form-control-static">${translate("association.no.inactive.msg")}</p>`;
        const activeMsg = `<p class="form-control-static">${translate("association.not.found.msg")}</p>
            <input association_add_btn type="button" class="btn btn-primary mt20 clickaction" value="${translate("common.new")}" rel="uitip">`;

        return `<div id="no-association-banner">
            <div class="tc pt30 pb30" data-id="open-screen"><span class="esspr empty-assoc"></span>
                ${isActive ? activeMsg : inactiveMsg}
            </div>
        </div>`;
    }
}