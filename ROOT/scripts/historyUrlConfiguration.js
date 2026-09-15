/**
 * urlConfigs is added for construction of history URLs for various modules, each with different URL requirements.
 * @param {string} start_index 
 * @param {object} options 
 * @returns object
 */
$history.urlConfigs = (start_index, options) => {
    /**
     * urlConfigs is added for construction of history urls for udf_fields and other modules that does have different requirements in historyurl construction
     */
    const taskURL = (typeof $taskDetails != "undefined" && typeof $taskDetails.options != "undefined") ? $taskDetails.options.url : "";  //No I18N
    /**
     * Define an object named urlConfigs with keys representing different modules and their corresponding URL configurations
     */
    const urlConfigs = {
        "udf_fields": { //No I18N
            "history_url": '/api/v3/'+options.entity+'/_history', //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history', //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history',  //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time", "sort_order": $historyvar.sort, "get_total_count": true}, "module": {"name": options.module_value}}, //No I18N
            "asset_asset" : { //No I18N
                "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field" :"time", "sort_order": $historyvar.sort, "get_total_count": true}, "category": {"name": "asset"}} //No I18N
            },
            "cmdb": { //No I18N
                "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field" :"time", "sort_order": $historyvar.sort, "get_total_count": true}, "category": {"name": "cmdb"}} //No I18N
            },
            "associations": { //No I18N
                "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field" :"time", "sort_order": $historyvar.sort, "get_total_count": true}, "category": {"name": "ci_type_association"}} //No I18N
            }
        },

        "custom_functions": {//No I18N
            "history_url": '/api/v3/'+options.entity+'/_history', //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history', //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history', //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time", "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },

        "app_service_actions": {//No I18N
            "history_url": '/api/v3/'+options.entity+'/_history', //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history', //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history', //No I18N
            "input_data": {"list_info":{"sort_order":"desc","sort_field":"time","start_index":"1","row_count":"100"},"module":options.module_value} //No I18N
        },

        "list_view_filters": {//No I18N
            "history_url": '/api/v3/list_view_filters/_history', //No I18N
            "performed_by_url": '/api/v3/list_view_filters/_get_performed_by_for_history', //No I18N
            "entity_url": '/api/v3/list_view_filters/_get_records_for_history', //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },

        "ziaconfigurations": { //No I18N
            "history_url": '/api/v3/admin/_history', //No i18N
            "input_data": {"list_info": {"search_criteria": {"field": "entity", "condition": "is", "value": options.entity}, "sort_order": $historyvar.sort, "sort_field": "time", "start_index": start_index, "row_count": "100"}} //No I18N
        },

        "oauth_providers": { //No I18N
            "history_url": '/api/v3/' + options.entity + '/_history', //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "for": options.module_value} //No I18N
        },

        "space_templates": {//No I18N
            "history_url": '/api/v3/'+options.entity+'/_history',  //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history',  //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history',  //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },

        "request_templates": {//No I18N
            "history_url": '/api/v3/'+options.entity+'/_history',  //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history',  //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history',  //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },

        "request_business_rule_groups": {//No I18N
            "history_url": '/api/v3/'+options.entity+'/_history',  //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history',  //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history',  //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },

        "note_business_rule_groups": {//No I18N
            "history_url": '/api/v3/'+options.entity+'/_history',  //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history',  //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history',  //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },
        "note_custom_trigger_groups": {//No I18N
            "history_url": '/api/v3/'+options.entity+'/_history',  //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history',  //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history',  //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },
        "notification_business_rule_groups": {//No I18N
            "history_url": '/api/v3/'+options.entity+'/_history',  //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history',  //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history',  //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },
        "notification_custom_trigger_groups": {//No I18N
            "history_url": '/api/v3/'+options.entity+'/_history',  //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history',  //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history',  //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },
        "approval_custom_trigger_groups": {//No I18N
            "history_url": '/api/v3/'+options.entity+'/_history',  //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history',  //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history',  //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },
        "approval_level_custom_trigger_groups": {//No I18N
            "history_url": '/api/v3/'+options.entity+'/_history',  //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history',  //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history',  //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },
        "ffr": { //No I18N
            "history_url": '/api/v3/'+options.entity+'/_history', //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history', //No I18N
            "entiry_url": '/api/v3/'+options.entity+'/_get_records_for_history', //No I18N
            "input_data": {"list_info": {"row_count": "100", "sort_field": "time", "start_index": start_index, "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },
        "problems":{//No I18N
            "history_url":'/api/v3/'+options.entity+'/'+options.entityID+'/_history',//No I18N
            "input_data":{"list_info":{"row_count":"100","start_index":start_index,"sort_field":"time","sort_order":$historyvar.sort,"get_total_count":true}}//No I18N
        },
        "survey_mains":{//No I18N
            "history_url":'/api/v3/'+options.entity+'/'+options.entityID+'/_history',//No I18N
            "input_data":{"list_info":{"row_count":"100","start_index":start_index,"sort_field":"time","sort_order":$historyvar.sort,"get_total_count":true}}//No I18N
        },
        "survey_translations":{//No I18N
            "history_url":'/api/v3/'+options.entity+'/'+options.entityID+'/_history',//No I18N
            "input_data":{"list_info":{"row_count":"100","start_index":start_index,"sort_field":"time","sort_order":$historyvar.sort,"get_total_count":true}}//No I18N
        },
        "projectRecentUpdates":{   //No I18N
            "history_url": '/api/v3/projects/_history', //No I18N
            "performed_by_url": '/api/v3/projects/members', //No I18N
            "entity_url": '/api/v3/projects', //No I18N
            "fields_url": '/api/v3/projects/_metainfo', //No I18N
            "input_data": {"list_info": {"row_count": "100","sort_field": "time","start_index": start_index, "sort_order": $historyvar.sort}}, //No I18N
            "entity_input_data" : {"field":"projects","search_field":"title","sort_order":"asc","sort_field":"title","row_count":50,"maximumSelection":25,"fields_required" : ["id","title"]},     //No I18N
            "performed_by_input_data" : {"field":"members","search_field":"user.name","sort_order":"asc","row_count":50,"sort_field":"user.name","valuePath": "user","maximumSelection":25,"fields_required" : ["user"]}   //No I18N
        },
        "projects": {   //No I18N
            "history_url": '/api/v3/projects/' + options.entityID + '/_history', //No I18N
            "performed_by_url": '/api/v3/projects/' + options.entityID + '/members', //No I18N
            "fields_url": '/api/v3/projects/' + options.entityID + '/_metainfo', //No I18N
            "input_data": {"list_info": {"row_count": "100","sort_field": "time","start_index": start_index, "sort_order": $historyvar.sort}}, //No I18N
            "performed_by_input_data" : {"field":"members","search_field":"user.name","sort_order":"asc","row_count":50,"sort_field":"user.name","valuePath": "user","maximumSelection":25,"fields_required" : ["user"]}   //No I18N
        },
        "milestones": { //No I18N
            "history_url": '/api/v3/projects/'+ options.project_id + '/' + options.entity + '/' + options.entityID + '/_history', //No I18N
            "performed_by_url": '/api/v3/projects/'+ options.project_id + '/' + options.entity + '/' + options.entityID + '/owner', //No I18N
            "fields_url": '/api/v3/projects/'+ options.project_id + '/' + options.entity + '/' + options.entityID + '/_metainfo', //No I18N
            "input_data": {"list_info": {"row_count": "100","sort_field": "time","start_index": start_index, "sort_order": $historyvar.sort}}, //No I18N
            "performed_by_input_data" : {"field":"owner","search_field":"name","sort_order":"asc","row_count":50,"sort_field":"name","valuePath": "user","maximumSelection":25,"fields_required" : ["name"]}   //No I18N
        },
        "tasks": {  //No I18N
            "history_url": '/api/v3/' + taskURL + '/_history', //No I18N
            "performed_by_url": '/api/v3/' + taskURL + '/owner', //No I18N
            "fields_url": '/api/v3/' + taskURL + '/_metainfo', //No I18N
            "input_data": {"list_info": {"row_count": "100","sort_field": "time","start_index": start_index, "sort_order": $historyvar.sort}}, //No I18N
            "performed_by_input_data" : {"field":"owner","search_field":"name","sort_order":"asc","row_count":50,"sort_field":"name","valuePath": "user","fields_required" : ["name"]}   //No I18N
        },
        "custom_views": {//No I18N
            "history_url": '/api/v3/custom_views/history', //No I18N
            "performed_by_url": '/api/v3/custom_views/get_performed_by_for_history', //No I18N
            "entity_url": '/api/v3/custom_views/get_records_for_history', //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time",  "sort_order": $historyvar.sort, "get_total_count": true}, "module": options.module_value} //No I18N
        },
        "asset_assets":{//No I18N
            "asset_history":{//No I18N
                "input_data":{"list_info": {"sort_fields":[{"field": "time", "order": $historyvar.sort}, {"field": "id", "order": $historyvar.sort}], "start_index": start_index, "row_count": 100, "search_criteria":[{field:"asset_operation_source_entity", condition:"is not", value: assetsObj && assetsObj.operationSource && assetsObj.operationSource.SCAN}]}},//No I18N
                "history_url":"/api/v3/"+options.sub_entity+"/"+options.entityID+"/_history"//No I18N
            },
            "state_history":{//No I18N
                "history_url":"/api/v3/"+options.sub_entity+"/"+options.entityID+"/"+"_state_history"//No I18N
            },
            "scan_history":{//No I18N
                "input_data":{"list_info": {"sort_fields":[{"field": "time", "order": $historyvar.sort}, {"field": "id", "order": $historyvar.sort}], "start_index": start_index, "row_count": 100, "search_criteria":[{field:"asset_operation_source_entity", condition:"is", value: assetsObj && assetsObj.operationSource && assetsObj.operationSource.SCAN}]}},//No I18N
                "history_url":"/api/v3/"+options.sub_entity+"/"+options.entityID+"/_history"//No I18N
            },
            "remote_session_history":{//No I18N
                "history_url":"/api/v3/"+options.sub_entity+"/"+options.entityID+"/"+options.module_value//No I18N
            },
            "print_history":{//No I18N
                "input_data":{"list_info": {"sort_fields":[{"field": "time", "order": $historyvar.sort}, {"field": "id", "order": $historyvar.sort}], "start_index": start_index, "row_count": 100}},//No I18N
                "history_url":"/api/v3/"+options.sub_entity+"/"+options.entityID+"/_history"//No I18N
            },
            "history_url":"/api/v3/"+options.sub_entity+"/"+options.entityID+"/_history"//No I18N
        },
        "integration_sync_rules": { //No I18N
            "history_url": '/api/v3/'+options.entity+'/_history', //No I18N
            "performed_by_url": '/api/v3/'+options.entity+'/_get_performed_by_for_history', //No I18N
            "entity_url": '/api/v3/'+options.entity+'/_get_records_for_history',  //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time", "sort_order": $historyvar.sort, "get_total_count": true}, "service": {"id": options.module_value}} //No I18N
        },
        "all_product_types": { //No I18N
            "history_url": '/api/v3/all_product_types/_history', //No I18N
            "input_data": {"list_info": {"row_count": "100", "start_index": start_index, "sort_field"  :"time", "sort_order": $historyvar.sort, "get_total_count": true}} //No I18N
        }
    }
    /**
     * Return the URL configuration for the specified entity/module
     */

    let config = urlConfigs[options.entity];

    return config;
};