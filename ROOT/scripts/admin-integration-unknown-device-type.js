/* $Id$ */
var $unknownSyncRuleDeviceTypes = {
    container: "unknown-device-type-list", //No I18N
    init(model) {
        this.model = model;
        this.isAsset = model.sync_to === "asset"; //No I18N
        this.render();
    },
    //render unknown device type sync rule
    render() {
        const entity = "integration_unknown_device_types"; //No I18N
        $integrationSyncRuleForm.options = { container: this.container };
        $integrationSyncRuleForm.toggle(true);
        var options = {
            "container": document.getElementById(this.container), //No I18N
            "mode": "list", //No I18N
            "name": entity, //No I18N
            "entity_name": entity, //No I18N
            "additional_details": { //No I18N
                "custom_class": "p0 oxy-inrt" //No I18N
            },
            "list": { //No I18N
                "meta": { //No I18N
                    "view": "table", //No I18N
                    "getmetainfo": "false", //No I18N
                    "header": {//No I18N
                        "actions": { //No I18N
                            "t_searchicon": { //No I18N
                                "enable": true, //No I18N
                                "custom_class": "fl", //No I18N
                            },
                            "pagination_comp": {//No I18N
                                "enable": true,//No I18N
                                "custom_class": "btn-group"//No I18N
                            }
                        },
                    },
                    "additional_options": { //No I18N
                        "personalize_key": "association_list", //No I18N
                        "callback-url": entity, //No I18N
                        "row_inputdata": "$unknownSyncRuleDeviceTypes.getInputData", //No I18N
                        "callback-rowfunction": "$unknownSyncRuleDeviceTypes.getInputData", //No I18N
                        "height": "fx:$unknownSyncRuleDeviceTypes.getHeight", //No I18N
                        "width": "fx:$unknownSyncRuleDeviceTypes.getWidth", //No I18N
                        "callback-after-initial-render": "$unknownSyncRuleDeviceTypes.setDeviceTypeSearchWidth",//No I18N
                        "staticHeader": false //No I18N
                    },
                    "cells": { //No I18N
                        "fields_required": { //No I18N
                            "device_type": { //No I18N
                                "default": true, //No I18N
                                "width": "50%", //No I18N
                                "name": "device_type", // No I18N
                                "render": "$unknownSyncRuleDeviceTypes.renderDeviceType" //No I18N
                            }
                        }
                    }
                },
                "options": { //No I18N
                    "component": {} //No I18N
                }
            }
        };

        setTimeout(() => {
            const mc = new MC(options);
        });
    },
    //render device type column
    renderDeviceType(table) {
        const data = table.row_data;

        return `<span style="width: 50%;" class="disp-ib text-overflow vmiddle">${e_html(data.device_type.name)}</span>
            <a class="cur-ptr mr15 thm-spr" data-event="click" data-handler="$unknownSyncRuleDeviceTypes.configure(${data.id})" nonce=${sdpNonce} search-filter="module_relationship">
                ${translate("common.configure", [translate("ae.cmdb.sync.rule")])}
            </a>`;
    },
    //configure an unknown device type sync rule
    configure(id) {
        const self = $unknownSyncRuleDeviceTypes;
        const { device_type } = WebComponents.instancePool['webc-integration_unknown_device_types'].loadedRecords[id];
        $integrationSyncRuleForm.init({
            source_module: device_type,
            container: self.container,
            redirectToList: self.refresh,
            isAsset: self.isAsset,
            model: self.model
        });
    },
    getInputData(tableInfo) {
        var inputData = {
            list_info: tableInfo.list_info,
            service: {
                id: $unknownSyncRuleDeviceTypes.model.id
            }
        };
        return inputData;
    },
    refresh() {
        WebComponents.instancePool['webc-integration_unknown_device_types'].refreshTable(); //No I18N
    },
    setDeviceTypeSearchWidth() {
        jQuery('#integration_unknown_device_types_list_head [data-id="device_type"]').css("width", "23%"); //No I18N
    },
    getHeight() {
        function getHeightOf(ids) {
            return ids.reduce(function (totalHeight, id) {
                return totalHeight + (jQuery("#" + id).outerHeight() || 0)
            }, 0);
        }
        const ids = ["top-subheader", "header-placeholder", "securityrisk", "admin-wizard-header", "admintabui", "sdp-chat-bar"]; //No I18N
        return (jQuery(window).height() - (getHeightOf(ids) + 120)) + "px"; //No I18N
    },
    getWidth: () => "100%" //No I18N
}