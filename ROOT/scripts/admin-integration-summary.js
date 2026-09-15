/* $Id$ */
var $integrationSyncSummary = {
    init (model) {
        this.model = model;
        this.render();
    },
    //render integration sync rule failure summary
    render() {
        const entity = "integration_sync_failures"; //No I18N
        const options = {
            "container": document.getElementById("integration-summary-content"), //No I18N
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
                                "custom_class": "fl" //No I18N
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
                        "row_inputdata": "$integrationSyncSummary.getInputData", //No I18N
                        "callback-rowfunction": "$integrationSyncSummary.getInputData", //No I18N
                        "callback-inputdata": "$integrationSyncSummary.getInputData", //No I18N
                        "height": "fx:$integrationSyncSummary.getHeight", //No I18N
                        "width": "fx:$integrationSyncSummary.getWidth", //No I18N
                        "staticHeader": false
                    },
                    "cells": { //No I18N
                        "fields_required": { //No I18N
                            "device_id" : { "default": true }, //No I18N
                            "name": { "default": true }, //No I18N
                            "device_type": { //No I18N
                                "name": "device_type", // No I18N
                                "default": true, //No I18N
                            },
                            "sync_time": { "default": true },//No I18N
                            "reason": { "default": true, "width": "220px" } //No I18N
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
    getInputData(tableInfo) {
        const inputData = {};
        const listInfo = tableInfo.list_info;
        inputData.list_info = listInfo;
        inputData.service = {
            id: $integrationSyncSummary.model.id
        };
        return inputData;
    },
    getHeight() {
        function getHeightOf(ids) {
            return ids.reduce(function (totalHeight, id) {
                return totalHeight + (jQuery("#" + id).outerHeight() || 0);
            }, 0);
        }
        const ids = ["top-subheader", "header-placeholder", "securityrisk", "admin-wizard-header", "admintabui", "sdp-chat-bar"]; //No I18N
        return (jQuery(window).height() - (getHeightOf(ids) + 120)) + "px"; //No I18N
    },
    getWidth: () => "100%" //No I18N
}