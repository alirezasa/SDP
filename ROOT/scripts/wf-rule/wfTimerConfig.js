$wfRuleUtil.timerConfig = {
    request: {
        "module_name":"request", //No i18n
        "routeName":"request_timer", //No i18n
        "timer_url":"request_timers", //No i18n
        "timer_entity_name":"request_timers", //No i18n
        "entity_key_singular":"request_timer", //No i18n
        "has_templates":true, //No i18n
        "templates_response_key":"request_templates", //No i18n
        "helpCard":"timer_action", //No i18n
        "criteria_config":{//Timer initiation criteria config. //No i18n
            specialFormats: ["have_none"],
            ignoreNoneFields: ["created_by","status","template","requester"], //No i18n
            sub_field_list : ["closure_info","resolution","resources"],//To display these criteria as indendation in component in timer initiation criteria. //No i18n
            fieldTypeConditions: {
               "status":["is", "is_not"], //No i18n
               "site":["is", "is_not"], //No i18n
               "template":["is", "is_not"], //No i18n
               "created_by":["is", "is_not"], //No i18n
               "requester":["is", "is_not"], //No i18n
               "subject":["is", "is_not", "contains", "not_contains", "starts_with", "ends_with"], //No i18n
               "resolution.content":["is_empty", "is_not_empty"], //No i18n
               "description":["is_empty", "is_not_empty"] //No i18n
           },
            modifyFieldsCallBack : function(criField){
                 for (var i in criField) {
                     if(i == 'resources') {
                         criField[i].type = 'group';
                     }
                     if(criField[i].type == 'double') {
                         criField[i].type = 'decimal';
                     }
                     if(criField[i].read_only) {
                         criField[i].read_only = false;
                     }
                 }
             }
        },
        "default_data":{ //No i18n
            "is_active": true, //No i18n
            "associated_templates": { //No i18n
              "for_all_templates": true //No i18n
            },
            "stages":[{ //No i18n
              "repeat_configuration": { //No i18n
              },
              "initial_delay_configuration": { //No i18n
                "type": "user_defined_time" //No i18n
              },
              "apply_during" : "sla_hrs", //No i18n
              "stage_number": 1, //No i18n
              "during_rules":[], //No i18n
              "after_rules":[] //No i18n
            }]
        },
        "initial_delay_default_date":"due_by_time", //No i18n
        "initial_delay_default_relative_date":"created_time", //No i18n
        "during_rules_config" : { //No i18n
           "during_rule_route_name" : "request_pre_rules", //No i18n
           "during_rule_type" : "pre_rules", //No i18n
           "during_rule_url":"request_pre_rules", //No i18n
           "during_rule_entity_name":"request_pre_rules", //No i18n
           "entity_key_singular":"request_pre_rule", //No i18n
           "during_rules_params": { //No i18n
                name: "request_pre_rules", //No i18n
                i18n_si : "request Pre Rule", //No i18n
                rulesform: true,
                add : {
                        url: 'request_pre_rules', //No i18n
                        entity_name : "request_pre_rule", //No i18n
                        fields : [{"fields" :["name", "description"]}], //No i18n
                        fields_metainfo : {
                            "name" : { //No i18n
                                "display_name" : translate("sdp.common.name") //No i18n
                            },
                            "description" : { //No i18n
                                "display_name" : translate("sdp.common.description") //No i18n
                            }
                        },
                        resources : {
                            "js" : ["/scripts/notification-template.js"] //No i18n
                        }
                }
           }
        },
        "after_rules_config":{ //No i18n
            "after_rule_route_name" : "request_post_rules", //No i18n
            "after_rule_type" : "post_rules", //No i18n
            "after_rule_url":"request_post_rules", //No i18n
            "after_rule_entity_name":"request_post_rules", //No i18n
            "entity_key_singular":"request_post_rule", //No i18n
            "after_rules_params": { //No i18n
                            name: "request_post_rules", //No i18n
                            i18n_si : "request Post Rule", //No i18n
                            rulesform: true,
                            add : {
                                    url: 'request_post_rules', //No i18n
                                    entity_name : "request_post_rule", //No i18n
                                    fields : [{"fields" :["name", "description"]}], //No i18n
                                    fields_metainfo : {
                                        "name" : { //No i18n
                                            "display_name" : translate("sdp.common.name") //No i18n
                                        },
                                        "description" : { //No i18n
                                            "display_name" : translate("sdp.common.description") //No i18n
                                        }
                                    },
                                    resources : {
                                        "js" : ["/scripts/notification-template.js"] //No i18n
                                    }
                            }
                       }
        }
    }
};