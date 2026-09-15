/* $Id$ */
var global_table_info = {
        "project_templates" : { // No I18N
            "fields_required" : {"name":{"width" :"275px"},"comment":{"width" :"300px"},"title":{"width" :"150px"},"type":"","priority":"","created_by":""}, // No I18N
            "list_info" : { // No I18N
                "row_count" : "10" // No I18N
            },
            "task_templates" : { // No I18N
                "fields_required": {"title": {"width": "240px"},"status": {"width": "70px"},"priority": {"width": "70px"},"milestone_template": {"width": "100px"},"type": {"width": "100px"},"additional_cost": {"width":"110px"},"comment": {"width": "120px"},"estimated_effort": {"width": "150px"}}, // No I18N
                "list_info": { // No I18N
                    "row_count": "10" // No I18N
                },
                "associate" :{      // No I18N
                    "fields_required": { "title": { "width": "270px" }, "name": { "width": "270px" }, "status": { "width": "70px" }, "priority": { "width": "70px" }, "type": { "width": "100px" }, "additional_cost": { "width": "110px" }, "comment": { "width": "120px" }, "estimated_effort": { "width": "150px" }}, // No I18N
                    "column_order" : ["title","name", "status", "priority", "type", "additional_cost", "comment", "estimated_effort"],// No I18N
                    "list_info": { "row_count": "10" }, // No I18N
                }
            },
            "milestone_templates" : { // No I18N
                "fields_required" : {"title":{"width" :"550px"},"status":"","priority":"","estimated_hours":""}, // No I18N
                "list_info" : { // No I18N
                    "row_count" : "10" // No I18N
                },
                "task_templates" : { // No I18N
                    "fields_required": { "title": { "width": "340px" }, "status": { "width": "70px" }, "priority": { "width": "70px" }, "type": { "width": "100px" }, "additional_cost": { "width": "110px" }, "comment": { "width": "120px" }, "estimated_effort": { "width": "150px" }}, // No I18N
                    "list_info": { "row_count": "10" }, // No I18N
                    "associate" :{      // No I18N
                        "fields_required": { "title": { "width": "270px" },"name": { "width": "270px" }, "status": { "width": "70px" }, "priority": { "width": "70px" }, "type": { "width": "100px" }, "additional_cost": { "width": "110px" }, "comment": { "width": "120px" }, "estimated_effort": { "width": "150px" }}, // No I18N
                        "column_order" : ["title","name", "status", "priority", "type", "additional_cost", "comment", "estimated_effort"],// No I18N
                        "list_info": { "row_count": "10" }, // No I18N
                    }
                }
            }
        },
        "technicians" : { // No I18N
            "fields_required" : {"name":"","citype":"","login_name":"","email_id":"","department":"","site":"","phone":"","mobile":"","jobtitle":"","project_roles":"","employee_id":"","first_name":"","middle_name":"","last_name":""}, // No I18N
            "list_info" : { // No I18N
                "row_count" : "25" // No I18N
            }
        },
        "orgusers" : { // No I18N
            "fields_required" : {"name":"","login_name":"","email_id":"","department":"","site":"","phone":"","mobile":"","jobtitle":"","employee_id":"","first_name":"","middle_name":"","last_name":""}, // No I18N
            "list_info" : { // No I18N
                "row_count" : "25" // No I18N
            }
         },
        "request_templates":{// No I18N
            "isDefaultSearch" : true,// No I18N
            "fields_required" : {"has_fafr":"","name":"","description":"","created_by":"","show_to_requester":""}, // No I18N
            "list_info":{// No I18N
                "row_count":25,// No I18N
                "sort_field":"name",// No I18N
                "search_fields":{// No I18N
                    "is_service_template":false,// No I18N
                    "is_service_category_required":false// No I18N
                 }
            },
            "task_templates" : { //No I18N
                "fields_required": {"name": {"width": "200px"},"title": {"width": "200px"},"description": {"width": "200px"},"comment": {"width": "70px"},"status": {"width": "70px"},"group": {"width": "100px"},"owner": {"width": "100px"},"priority": {"width": "70px"},"type": {"width": "100px"},"additional_cost": {"width":"110px"},"created_by": {"width":"110px"}, "created_time":{"width":"110px"},"estimated_effort": { "width": "150px" },"task_index":{"width": "70px" },"id":{"width": "80px" },"request_template":""}, // No I18N
                "list_info": { // No I18N
                    "row_count": "10" // No I18N
                },
                "associate" :{      // No I18N
                    "fields_required": { "title": { "width": "270px" },"name": { "width": "270px" }, "status": { "width": "70px" }, "priority": { "width": "70px" }, "type": { "width": "100px" }, "additional_cost": { "width": "110px" }, "comment": { "width": "120px" }, "estimated_effort": { "width": "150px" }}, // No I18N
                    "column_order" : ["title","name", "status", "priority", "type", "additional_cost", "comment", "estimated_effort"],// No I18N
                    "list_info": { "row_count": "10" }, // No I18N
                }
            }
        },
        "problem_templates":{// No I18N
            "isDefaultSearch" : true,// No I18N
            "fields_required" : {"name":"","comment":"","created_by":""}, // No I18N
            "list_info":{// No I18N
                "row_count":25,// No I18N
                "sort_field":"name"// No I18N
            },
            "task_templates" : { //No I18N
                "fields_required": {"name": {"width": "200px"},"title": {"width": "240px"},"status": {"width": "70px"},"priority": {"width": "70px"},"problem_template": {"width": "100px"},"type": {"width": "100px"},"additional_cost": {"width":"110px"},"comment": {"width": "120px"},"estimated_effort": {"width": "150px"}}, // No I18N
                "list_info": { // No I18N
                    "row_count": "10" // No I18N
                },
                "associate" :{      // No I18N
                    "fields_required": { "title": { "width": "270px" },"name": { "width": "270px" }, "status": { "width": "70px" }, "priority": { "width": "70px" }, "type": { "width": "100px" }, "additional_cost": { "width": "110px" }, "comment": { "width": "120px" }, "estimated_effort": { "width": "150px" }}, // No I18N
                    "column_order" : ["title","name", "status", "priority", "type", "additional_cost", "comment", "estimated_effort"],// No I18N
                    "list_info": { "row_count": "10" }, // No I18N
                }
            }
        },
        "fafr_list":{ //NO I18N
            "fields_required" :{"RULENAME":{"width":"150px"},"CRITERIAS":{"width":"225px"},"ACTIONS":{"width":"225px"},"OPERATIONTYPE":{"width":"125px"},"USERTYPE":{"width":"125px"}},//NO I18N
            "list_info" : { //No I18N
                "row_count" : "10"  //NO I18N
            }
        },
        "global_fafr_list":{ //NO I18N
            "fields_required" :{"RULENAME":{"width":"150px"},"CRITERIAS":{"width":"225px"},"ACTIONS":{"width":"225px"},"OPERATIONTYPE":{"width":"125px"},"USERTYPE":{"width":"125px"}},//NO I18N
            "list_info" : { //No I18N
                "row_count" : "10"  //NO I18N
            }
        },
        "departments":{ //NO I18N
            "fields_required" :{"name":"","site":"","department_head":""},//NO I18N
            "list_info" : { //No I18N
                "row_count" : "10"  //NO I18N
            }
        },
        "task_templates":{//No I18N
             "fields_required" :{"inactive":{"width":"10px"},"associated_modules":{"width":"10px"},"name":{"width":"200px"},"title":{"width":"200px"},"status":{},"group":{},"owner":{},"type":{},"priority":{},"additional_cost":{},"estimated_effort":{},"associated_entity" :{}},//No I18N
             "list_info": { // No I18N
                    "sort_field":"inactive",// No I18N
                    "row_count": "10" // No I18N
              }
        },
        "slas":{//NO I18N
            "isDefaultSearch" : true,//NO I18N
            "fields_required" : {"name":"","fulfillment_time":"","response_time":"","associated_templates":""}, // No I18N
            "list_info":{//NO I18N
                "search_fields":{//NO I18N
                    "is_service_sla":true//NO I18N
                 },
                 "row_count": "10" // No I18N
            },
            "service_template_sla_associations":{//NO I18N
                "fields_required" : {"template.name":"","is_default_sla":"","info":"","associated_templates":""}, // No I18N
                "list_info":{//NO I18N
                    "row_count":"10",//NO I18N
                    "sort_field":"template.name"//NO I18N
                 }
            }

        },
        "table_requests": { //No I18N
           "fields_required" : {"requester":"","created_time":"","edit":"","dependency_status":"","subject":"","notification_status":"","technician":"","priority":"","due_by_time":"","site":"","task":"","is_service_request":"","requests_list_head_chk":"","has_notes":"","id":"","status":"","group":""}, //No I18N
           "list_info": { // No I18N
                "row_count": "25", // No I18N
                "sort_field":"id", // No I18N
                "sort_order":"desc" // No I18N
            },
            "column_order":["requests_list_head_chk","notification_status","has_notes","edit","task","id","subject","requester","technician","due_by_time","status","created_time","site","priority","group","dependency_status","is_service_request","category","level","mode","completed_time","created_by","urgency","impact","request_type","subcategory","item","approval_status","template","department","service_category","first_response_due_by_time","last_updated_time","has_linked_requests","resolved_time","on_behalf_of","technician_timer","sla","total_cost","scheduled_start_time","scheduled_end_time","association_project"] //No I18N
        },
        "classic_requests" : { //No I18N
            "fields_required" : {"subject":"","due_by_time":"","requester":"","status":"","priority":"","group":"","site":"","notification_status" : "","has_notes" : "","is_service_request": "","technician":""}, //No I18N
            "list_info": { // No I18N
                "row_count": "25", // No I18N
                "sort_field":"id", // No I18N
                "sort_order":"desc" // No I18N
            }
        },
        "rq_leftpanel" : { //No I18N
            "fields_required" : {"subject":"","due_by_time":"","requester":"","notification_status" : "","has_notes" : "","is_service_request": ""}, //No I18N
            "list_info": { // No I18N
                "row_count": "20", // No I18N
                "sort_order":"desc" // No I18N
            }
        },
        "custom-actions" : { // No I18N
            "fields_required" : {"id" :"","is_active":"","module":"","name":"","description":"","function_type":""}, // No I18N
            "list_info": {"row_count": "10"} // No I18N
        },
        "changes" : { // No I18N
            "fields_required" : {"id":"","title":{"width": "320px"},"change_type":"","risk":"","impact":"","scheduled_start_time":"","scheduled_end_time":"","notes_present":"","services":"","category":"","status":""}, // No I18N
            "list_info" : { // No I18N
                "row_count" : "25" // No I18N
            }
        },
        "site_ip_mappings":{ // No I18N
            "fields_required": {"site":"","ipaddress":""}, // No I18N
            "list_info": {"row_count": "10"} // No I18N
       	},
        //solution default fields are available here.
         "solutions":{ //No I18N
            "fields_required": {"title" : "","topic" : "", "id": "", "approval_status" : "","is_public" : "","no_of_hits" : "","owner" : "","created_time" : "","last_updated_time" : ""}, // No I18N
            "list_info": { // No I18N
                "row_count": "25", // No I18N
                "sort_field":"created_time", // No I18N
                "sort_order":"desc" // No I18N
            }
        },
		"request_maintenances_classic" : { // No I18N
            "fields_required" : {"created_time":"","requester":"","category":"","impact":"","technician":""}, //No I18N
            "column_order" : ["created_time","requester","category","impact","technician"], // No I18N	
            "list_info": {"row_count": "10"} // No I18N			
		},
		"request_maintenances_table" : { // No I18N
            "fields_required" : {"id":"","name":"","created_time":"","scheduler.frequency":"","scheduler.next_schedule_time":"","maintenancestate":"","group":"","technician":""}, //No I18N
            "column_order" : ["id","name","created_time","scheduler.frequency","scheduler.next_schedule_time","maintenancestate","group","technician"], // No I18N	
            "list_info": {"row_count": "10"} // No I18N			
		},
		"global_request_maintenances_classic" : { // No I18N
            "fields_required" : {"created_time":"","requester":"","category":"","impact":"","technician":""}, //No I18N
            "column_order" : ["created_time","requester","category","impact","technician"], // No I18N	
            "list_info": {"row_count": "10"} // No I18N			
		},
		"global_request_maintenances_table" : { // No I18N
            "fields_required" : {"id":"","name":"","created_time":"","scheduler.frequency":"","scheduler.next_schedule_time":"","maintenancestate":"","group":"","technician":""}, //No I18N
            "column_order" : ["id","name","created_time","scheduler.frequency","scheduler.next_schedule_time","maintenancestate","group","technician"], // No I18N	
            "list_info": {"row_count": "10"} // No I18N			
		}
    };