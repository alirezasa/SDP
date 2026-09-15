/**
 * Define a function named $history.config with a parameter named options
 * @param {*} options - An object containing configuration options
 * @returns Returns a configuration object based on the entity provided in options
 */
$history.config = (options) => {
	/**
	 * Define an object named result to store configuration settings for different modules based on options.entity
	 */
	var result = {
		"udf_fields": { //No I18N
			diffInPopupFields : ["additional_attributes.description"], //No I18N
			encodeCB: function(field) {
				if(field.name == "additional_attributes.description") {
					return false;
				}
				return true;
			},
			processHistory: (data) => {
				return $udfcommon.$udflview.processHistory(data);
			}
		},
		"projectRecentUpdates": {       //No I18N
		 	is_new_history : true,
			acceptODCompatible : true,
            is_new_icon : true,
			parentInfo : true,
			backtotop : true,
			diffInPopupFields : ["description","Comments"], //No I18N
		    key : "projects_history_sort_order",  //No I18N
		    search_filter : "project",  //No I18N
		    showOnly_filter : "showonly", //No I18N
		    entity_key : translate("common.projects"),
		    showOnlyData : [{'text':translate("common.project"),'id':'project'},{'text':translate("project.milestone"),'id':'milestone'},{'text':translate("common.task"),'id':'task'},{'text':translate("sdp.requests.common.worklog"),'id':'worklog'},{'text':translate("sdp.project.projectworklogattribute.userid"),'id':'member'},{'text':translate("sdp.project.projectattribute.comment"),'id':'comment'}]  //No I18N
		},
		"projects": {       //No I18N
		 	is_new_history : true,
			acceptODCompatible : true,
            is_new_icon : true,
			parentInfo : true,
			backtotop : true,
			diffInPopupFields : ["description","Comments"], //No I18N
		    key : "projects_history_sort_order",  //No I18N
		    skip_filter_options : options.isViewPermitted ? "entity" : "entity,performedBy,fields", //No I18N
		    showOnly_filter : "showonly", //No I18N
		    showOnlyData : [{'text':translate("common.project"),'id':'project'},{'text':translate("project.milestone"),'id':'milestone'},{'text':translate("common.task"),'id':'task'},{'text':translate("sdp.requests.common.worklog"),'id':'worklog'},{'text':translate("sdp.project.projectworklogattribute.userid"),'id':'member'},{'text':translate("sdp.project.projectattribute.comment"),'id':'comment'}]  //No I18N
		},
		"milestones": {     	//No I18N
		 	is_new_history : true,
			acceptODCompatible : true,
		 	is_new_icon : true,
			parentInfo : true,
			backtotop : true,
			diffInPopupFields : ["description","Comments"], //No I18N
		    key : "milestones_history_sort_order",  //No I18N
		    skip_filter_options : options.isViewPermitted ? "entity" : "entity,performedBy,fields", //No I18N
		    showOnly_filter : "showonly", //No I18N
		    projectID : document.getElementById('projectid')!= null?document.getElementById('projectid').innerHTML: null,
		    entity_key : translate("common.projects"),
		    showOnlyData : [{'text':translate("project.milestone"),'id':'milestone'},{'text': translate("common.task"),'id':'task'},{'text':translate("sdp.requests.common.worklog"),'id':'worklog'},{'text':translate("sdp.project.projectattribute.comment"),'id':'comment'}] //No I18N
		},
		"tasks": {      //No I18N
		 	is_new_history : true,
			is_new_icon : true,
			parentInfo : true,
			acceptODCompatible : true,
			diffInPopupFields : ["description","Comments"], //No I18N
		    key : "tasks_history_sort_order",  //No I18N
		    skip_filter_options : options.isViewPermitted || (((typeof $taskDetails != "undefined") && (typeof $taskDetails.entity_data != "undefined") && ($taskDetails.entity_data.owner != null)) ? ($taskDetails.entity_data.owner.id == sdp_user.LOGGEDIN_USERID) : false) ? "entity" : "entity,performedBy,fields", //No I18N
		    showOnly_filter : "showonly", //No I18N
		    backtotop : ((typeof $taskDetails != "undefined") && (typeof $taskDetails.options != "undefined") && ($taskDetails.options.module == "project" || $taskDetails.options.module == "milestone")),         //No I18N
		    showOnlyData : ((typeof $taskDetails != "undefined") && (typeof $taskDetails.options != "undefined") &&  $taskDetails.options.module.startsWith("cm_") ) ? [{'text': translate("common.task"),'id':'task'},{'text':translate("sdp.requests.common.worklog"),'id':'worklog'}] : [{'text': translate("common.task"),'id':'task'},{'text':translate("sdp.requests.common.worklog"),'id':'worklog'},{'text':translate("sdp.project.projectattribute.comment"),'id':'comment'}] //No I18N
		},
		"requests" : {  //No I18N
			enableFilter : true,
		},
		"saml_auth" : {  //No I18N
			enableFilter : true,
			filterPlaceHolder : "saml.history.filter.placeholder", //No I18N
			url : "/Saml.do?method=getHistory", //No I18N
		},
		"checklists" : {  //No I18N
			enableFilter : (!options.admin_entity) ? true : false,
			key : "checklist_histort_order", //No I18N
			filterPlaceHolder : "checklist.history.filter.placeholder" //No I18N
		},
		"tour_details" : {  //No I18N
			key : "tour_details_history_order" //No I18N
		},
		"solutions" : {  //No I18N
			diffInPopupFields : ["description", "comments"], //No I18N
			filterPlaceHolder : "solution.history.filter.placeholder", //No I18N
			enableFilter : true,
			optionsUrl : `/api/v3/${options.entity}/${options.entityID}/_metainfo`,
			filterFields : [
				{
					text : translate("sdp.release.history.operations"), //No I18N
					children : [
						{ id : "association", text : translate("sdp.project.associations.tabname"), value : "operation" }, //No I18N
						{ id : "attachment", text : translate("sdp.common.attachments"), value : "operation" }, //No I18N
						{ id : "created", text : translate("sdp.requests.history.created"), value : "operation" }, //No I18N
						{ id : "edited", text : translate("sdp.solution.commentoperation.edit"), value : "operation" }, //No I18N
						{ id : "solution_forward", text : translate("sdp.common.navigation.forward"), value : "operation" }, //No I18N
						{ id : "restored", text : translate("sdp.requests.history.restored"), value: "operation"},//No I18N
						{ id : "status", text : translate("sdp.activesession.status"), value : "operation" }, //No I18N
						{ id : "solution_submit_for_approval", text : translate("sdp.purchase.addNew.view.submit"), value : "operation" }, //No I18N
                        { id : "trashed", text : translate("sdp.tasks.header.requesttrashed"), value: "operation"},//No I18N
					]
				}
			],
			operations_mapping : {
				attachment : ["attachment_add", "attachment_delete"], //No I18N
				status : ["active", "expire", "approve", "reject"], //No I18N
				association : ["solution_relation_add", "solution_relation_delete"], //No I18N
				created : ["add","Created","import_add"],//No I18N
                edited : ["edit","Edited","import_edit"],//No I18N
                trashed : ["move_to_trash"],//No I18N
                restored : ["restore_from_trash"]//No I18N
			},
			moduleproperty_mapping : {
				attachment_operation : ["attachment_add", "attachment_delete"], //No I18N
				outgoing_operation : ["solution_forward", "solution_submit_for_approval"], //No I18N
				success : ["approve"], //No I18N
				failure : ["reject"], //No I18N
				add : ["Created", "add_Comment"], //No I18N
				edit : ["Edited", "edit_Comment"], //No I18N
				delete : ["delete_Comment","move_to_trash","restore_from_trash"], //No I18N
				disable_operation : ["Disable_Comments"], //No I18N
				enable_operation : ["Enable_Comments", "resetratings"], //No I18N
				link_operation : ["solution_relation_add", "solution_relation_delete"] //No I18N
			}
		},
		"request_maintenances" : {  //No I18N
			filterPlaceHolder : translate("maintenance.history.filter.placeholder", [translate("common.maintenance")]),
			enableFilter : true,
			setOptions : true,
			key : options.entity+"_history_sort_order",//No I18N
			diffInPopupFields : ["description", "content"], // No I18N
			optionsUrl : `/api/v3/${options.entity}/${options.entityID}/_metainfo`,
			moduleproperty_mapping : {
				add : ["newrequest"], // No I18N
				edit : ["maintenancestate_update", "schedule_update"] // No I18N
			},
			filterFields : [
				{
					text : translate("common.history.operations"), // No I18N
					children : [
						{ id : "newrequest", text : translate("common.request.created"), value : "operation" }, // No I18N
						{ id : "maintenancestate_update", text : translate("maintenance.history.state.updated"), value : "operation" }, // No I18N
						{ id : "schedule_update", text : translate("maintenance.history.schedule.updated"), value : "operation" }, // No I18N
						{ id : "attachment_add", text : translate("sdp.solutions.attachments.addedby"), value : "operation" }, // No I18N
						{ id : "attachment_delete", text : translate("sdp.solutions.attachments.deletedby"), value : "operation" }, // No I18N
						{ id : "task_add", text : translate("common.taskadded"), value : "operation" }, // No I18N
						{ id : "task_delete", text : translate("common.taskdeleted"), value : "operation" } // No I18N
					]
				}
			]
		},
		"releases" : {  //No I18N
			filterPlaceHolder : "common.history.filter.placeholder", // No I18N
			enableFilter : true,
			setOptions : true,
			key : "release_history_sort_order", // No I18N
			diffInPopupFields : ["description", "notes"], // No I18N
			optionsUrl : `/api/v3/${options.entity}/${options.entityID}/_metainfo`,
			moduleproperty_mapping : {
				edit : [
					"release_approval_approve", // No I18N
					"release_approval_reject", // No I18N
					"release_approval_notification_sent", // No I18N
					"release_task_assign", // No I18N
					"TRIGGER_taskcustomaction", // No I18N
					"RESULT_taskcustomaction" // No I18N
				],
				notes_add : ["release_note_add"],
				notes_edit : ["release_note_edit"],
				tasks_add : ["release_task_add"],
				tasks_delete : ["release_task_delete"],
				delete : ["move_to_trash", "restore_from_trash", "stage_remove"], // No I18N
				failure : ["WF_EXECUTION_FAILURE"],
				success : ["APPROVAL_VERIFIED"]
			},
			filterFields : [
				{
					text : translate("sdp.release.history.operations"),
					children : [
						{ id : "Approval Levels" , text : translate("sdp.change.history.approvallevels"), value : "operation" }, // No I18N
						{ id : "Approvals" , text : translate("sdp.approve.approvals"), value : "operation" }, // No I18N
						{ id : "Associations" , text : translate("sdp.project.associations.tabname"), value : "operation" }, // No I18N
						{ id : "Attachments" , text : translate("sdp.common.attachments"), value : "operation" }, // No I18N
						{ id : "Conversations" , text : translate("sdp.requests.viewrequest.conversations"), value : "operation" }, // No I18N
						{ id : "Deployment Schedule" , text : translate("sdp.change.deployment.details"), value : "operation" }, // No I18N
						{ id : "Descriptive Field" , text : translate("common.descriptive_field"), value : "operation" }, // No I18N
						{ id : "Notes" , text : translate("common.notes"), value : "operation" }, // No I18N
						{ id : "Release Roles" , text : translate("admin.releaseconf.roles"), value : "operation" }, // No I18N
						{ id : "Stage Data" , text : translate("sdp.release.stagedata"), value : "operation" }, // No I18N
						{ id : "Task" , text : translate("common.task"), value : "operation" }, // No I18N
						{ id : "Work Logs" , text : translate("common.worklogs"), value : "operation" } // No I18N
					]
				}
			],
			operations_mapping : {
				"Approval Levels":["release_approval_level_add","release_approval_level_edit","release_approval_level_delete"], // No I18N
				Approvals : ["release_approval_add", "release_approval_delete", "release_approval_approve", "release_approval_reject", "release_approval_notification_sent"], // No I18N
				"Deployment Schedule" : ["release_downtime_add", "release_downtime_edit", "release_downtime_delete"], // No I18N
				"Descriptive Field" : ["release_descriptive_field_edit"], // No I18N
				Associations : ["release_change_association_add", "release_change_association_delete", "release_project_association_add", "release_project_association_delete"], // No I18N
				Attachments : ["attachment_add", "attachment_delete"], // No I18N
				"Release Roles" : ["release_to_release_role_add", "release_to_release_role_delete"], // No I18N
				Notes : ["release_note_add", "release_note_delete", "release_note_edit"], // No I18N
				Drafts : ["release_draft_add", "release_draft_delete"], // No I18N
				Conversations : ["release_notification_add"], // No I18N
				Task : ["release_task_add", "release_task_assign", "release_task_delete", "TRIGGER_taskcustomaction", "RESULT_taskcustomaction"], // No I18N
				"Work Logs" : ["release_worklog_add", "release_worklog_delete", "release_worklog_edit"], // No I18N
				"Stage Data" : ["release_stage_data_edit"] // No I18N
			}
		},
		"problems" : {  //No I18N
			filterPlaceHolder : "common.history.filter.placeholder", // No I18N
			enableFilter : true,
			setOptions : true,
			key : "problem_history_sort_order", // No I18N
			diffInPopupFields : ["description", "problem_note", "Description"], // No I18N
			optionsUrl : `/api/v3/${options.entity}/${options.entityID}/_metainfo`,
			moduleproperty_mapping : {
				edit : [
					"attach_change", // No I18N
					"detach_change", // No I18N
					"attach_incident", // No I18N
					"detach_incident", // No I18N
					"problem_task_assign", // No I18N
					"TRIGGER_taskcustomaction", // No I18N
					"RESULT_taskcustomaction" // No I18N
				],
				notes_add : ["notes_add"],
				notes_edit : ["notes_edit"],
				tasks_add : ["ADD_problemtask"],
				tasks_delete : ["DELETE_problemtask"],
				worklogs_add : ["ADD_problemworklog"],
				worklogs_edit : ["UPDATE_problemworklog"],
				worklogs_delete : ["DELETE_problemworklog"],
				delete : ["notes_delete"]
			},
			filterFields : [
				{
					text : translate("common.history.showonly"),
					children : [
						{ id : "Associations", text : translate("sdp.project.associations.tabname"), value : "operation" }, // No I18N
						{ id : "Attachments", text : translate("sdp.common.attachments"), value : "operation" }, // No I18N
						{ id : "Impact_Detail", text : translate("sdp.problem.impactdetails"), value : "operation" }, // No I18N
						{ id : "Notes", text : translate("common.notes"), value : "operation" }, // No I18N
						{ id : "Rootcause", text : translate("sdp.problem.rootcause"), value : "operation" }, // No I18N
						{ id : "Symptom", text : translate("sdp.problem.symptoms"), value : "operation" }, // No I18N
						{ id : "Task", text : translate("common.task"), value : "operation" }, // No I18N
						{ id : "Work_Logs", text : translate("common.worklogs"), value : "operation" }, // No I18N
						{ id : "Custom_Trigger", text : translate("sdp.request.externalaction.autoaction"), value : "operation" } // No I18N
					]
				}
			],
			operations_mapping : {
				Associations : ["attach_incident", "detach_incident", "attach_change", "detach_change"], // No I18N
				Attachments : ["attachment_add", "attachment_delete"], // No I18N
				Impact_Detail : ["impact_details_add", "impact_details_edit", "impact_attachment_add", "impact_attachment_delete"], // No I18N
				Notes : ["notes_add", "notes_delete", "notes_edit", "notes_attachment_add", "notes_attachment_delete"], // No I18N
				Rootcause : ["root_cause_add", "root_cause_edit", "rootcause_attachment_add", "rootcause_attachment_delete"], // No I18N
				Symptom : ["symptoms_add", "symptoms_edit", "symptom_attachment_add", "symptom_attachment_delete"], // No I18N
				Task : ["ADD_problemtask", "DELETE_problemtask"], // No I18N
				Work_Logs : ["ADD_problemworklog", "UPDATE_problemworklog", "DELETE_problemworklog"], // No I18N
				Custom_Trigger : [
					"WORKFLOW_E_MAIL_NOTIFICATION", // No I18N
					"WORKFLOW_SMS_NOTIFICATION", // No I18N
					"WORKFLOW_APPLIED_CUSTOM_TRIGGER", // No I18N
					"WORKFLOW_EXTERNAL_ACTION" // No I18N
				]
			}
		},
		"spaces" : {  //No I18N
			filterPlaceHolder : "space.history.filter.placeholder", // No I18N
			enableFilter : true,
			setOptions : true,
			multiSelectFields : ["Amenities", "Criticality", "Supervisors", "Documents"], // No I18N
			optionsUrl : `/api/v3/${options.entity}/${options.sub_entity}/_metainfo`,
			filter_field_name : "diff.field", // No I18N
			moduleproperty_mapping : {
				add : [
					"building_added", // No I18N
					"non_building_added", // No I18N
					"floor_added", // No I18N
					"room_added", // No I18N
					"partition_added", // No I18N
					"created", // No I18N
					"image_attached", // No I18N
					"document_added", // No I18N
					"document_attachment_added" // No I18N
				],
				edit : [
					"space_edited", // No I18N
					"asset_associate", // No I18N
					"asset_dissociate", // No I18N
					"service_associate", // No I18N
					"service_dissociate", // No I18N
					"document_edited", // No I18N
					"notification_add" // No I18N
				],
				delete : [
					"building_deleted", // No I18N
					"non_building_deleted", // No I18N
					"floor_deleted", // No I18N
					"room_deleted", // No I18N
					"partition_deleted", // No I18N
					"image_deleted", // No I18N
					"document_deleted", // No I18N
					"document_attachment_deleted" // No I18N
				],
			},
			filterFields : [
				{
					text : translate("common.history.operations"), // No I18N
					children : [
						{ id : "space_asset_association_add", text : translate("space.historyOperation.asset.associate"), value : "operation" }, // No I18N
						{ id : "space_asset_association_delete", text : translate("space.historyOperation.asset.dissociate"), value : "operation" }, // No I18N
						{ id : "space_document_add", text : translate("space.historyOperation.spaceDocumentAdd"), value : "operation" }, // No I18N
						{ id : "space_document_attachment_add", text : translate("space.historyOperation.spaceDocumentAttachmentAdd"), value : "operation" }, // No I18N
						{ id : "space_document_attachment_delete", text : translate("space.historyOperation.spaceDocumentAttachmentDelete"), value : "operation" }, // No I18N
						{ id : "space_document_delete", text : translate("space.historyOperation.spaceDocumentDelete"), value : "operation" }, // No I18N
						{ id : "space_document_edit", text : translate("space.historyOperation.spaceDocumentEdit"), value : "operation" }, // No I18N
						{ id : "attachment_add", text : translate("space.historyOperation.attachmentAdd"), value : "operation" }, // No I18N
						{ id : "attachment_delete", text : translate("space.historyOperation.attachmentDelete"), value : "operation" }, // No I18N
						{ id : "notification_add", text : translate("space.historyOperation.notifySent"), value : "operation" }, // No I18N
						{ id : "space_to_service_association_add", text : translate("space.historyOperation.service.associate"), value : "operation" }, // No I18N
						{ id : "space_to_service_association_delete", text : translate("space.historyOperation.service.dissociate"), value : "operation" }, // No I18N
						/**
						 * The children array using the spread operator (...) to merge arrays conditionally. This way, the code is more organized within the options object.
						 */
						...(options.sub_entity == "space_campuses" // No I18N
							? [
								{ id : "space_building_add", text : translate("space.historyOperation.spaceBuilding.add"), value : "operation" }, // No I18N
								{ id : "space_building_delete", text : translate("space.historyOperation.spaceBuilding.delete"), value : "operation" }, // No I18N
								{ id : "space_nonbuilding_add", text : translate("space.historyOperation.spaceNonbuilding.add"), value : "operation" }, // No I18N
								{ id : "space_nonbuilding_delete", text : translate("space.historyOperation.spaceNonbuilding.delete"), value : "operation" } // No I18N
							]
							: options.sub_entity == "space_buildings" // No I18N
								? [
									{ id : "space_floor_add", text : translate("space.historyOperation.spaceFloor.add"), value : "operation" }, // No I18N
									{ id : "space_floor_delete", text : translate("space.historyOperation.spaceFloor.delete"), value : "operation" } // No I18N
								]
								: options.sub_entity == "space_floors" // No I18N
									? [
										{ id : "space_room_add", text : translate("space.historyOperation.spaceRoom.add"), value : "operation" }, // No I18N
										{ id : "space_room_delete", text : translate("space.historyOperation.spaceRoom.delete"), value : "operation" } // No I18N
									]
									: options.sub_entity == "space_rooms" // No I18N
										? [
											{ id : "space_roompartition_add", text : translate("space.historyOperation.spaceRoompartition.add"), value : "operation" }, // No I18N
											{ id : "space_roompartition_delete", text : translate("space.historyOperation.spaceRoompartition.delete"), value : "operation" } // No I18N
										]
										: []
						)
						// End of conditional code
					],
				}
			]
		},
		"changes" : {  //No I18N
			filterPlaceHolder : "change.history.filter.placeholder", // No I18N
			enableFilter : true,
			setOptions : true,
			optionsUrl : `/api/v3/${options.entity}/${options.entityID}/_metainfo`,
			skipFields : ['id', 'comment', 'emergency', 'initiated_by_requests', 'initiated_requests', 'projects', 'problems', 'approval_status', 'roles', 'notes', 'attachments'], // No I18N
			key : "change_history_sort_order", // No I18N
			diffInPopupFields : ["description", "Description", "notes_description", "note", "roll_out_plan", "back_out_plan", "checklist", "impact_details", "close_details", "review_details", "short_description", "UAT_DESC", "udf_mline", "RELEASE_DESC", "downtime", "DT_DESC"], // No I18N
			moduleproperty_mapping : {
				"add" : ["APPROVAL_REMINDER", "COPY", "ADD", "ATTACH", "ADD_parentChangeAssociation", "ADD_parentProjectAssociation", "change_worklog_add", "ADD_changeworklog"], // No I18N
				"edit" : ["EDIT", "UPDATE", "change_approval_approve", "change_approval_reject", "change_approval_notification_sent", "change_task_assign", "TRIGGER_taskcustomaction", "RESULT_taskcustomaction", "change_worklog_edit", "ACTION_TRIGGER_RESULT", "ACTION_TRIGGER_INVOCATION", "UPDATE_changeworklog"], // No I18N
				"notes_add" : ["change_note_add"], // No I18N
				"notes_edit" : ["change_note_update"], // No I18N
				"tasks_add" : ["ADD_changetask"], // No I18N
				"tasks_delete" : ["DELETE_changetask"], // No I18N
				"delete" : ["move_to_trash", "restore_from_trash", "DELETE", "delete", "REMOVE", "remove", "DETACH", "DELETE_changeworklog", "REMOVE_parentChangeAssociation", "REMOVE_parentProjectAssociation"], // No I18N
				"failure" : ["WF_EXECUTION_FAILURE"], // No I18N
				"success" : ["APPROVAL_VERIFIED"] // No I18N
			},
			filterFields : [
				{
					"text" : translate("sdp.change.history.showonly"), // No I18N
					"children" : [ // No I18N
						{"id" : "Approval Levels" ,"text" : translate("sdp.change.history.approvallevels"),"value" : "operation"}, // No I18N
						{"id" : "Approvals" ,"text" : translate("sdp.approve.approvals"),"value" : "operation"}, // No I18N
						{"id" : "Associations" ,"text" : translate("sdp.project.associations.tabname"),"value" : "field"}, // No I18N
						{"id" : "Attachments" ,"text" : translate("sdp.common.attachments"),"value" : "field"}, // No I18N
						{"id" : "Conversations" ,"text" : translate("sdp.requests.viewrequest.conversations"),"value" : "operation"}, // No I18N
						{"id" : "Deployment Schedule" ,"text" : translate("sdp.change.deployment.details"),"value" : "field"}, // No I18N
						{"id" : "Notes" ,"text" : translate("common.notes"),"value" : "operation"}, // No I18N
						{"id" : "ChangeRoles" ,"text" : translate("sdp.admin.change.changeroles"),"value" : "field"}, // No I18N
						{"id" : "Stage Data" ,"text" : translate("sdp.change.statedetails"),"value" : "field"}, // No I18N
						{"id" : "Task" ,"text" : translate("common.task"),"value" : "operation"}, // No I18N
						{"id" : "Work Logs" ,"text" : translate("common.worklogs"),"value" : "operation"} // No I18N
					]
				}
			],
			operations_mapping : {
				"Approval Levels" : ["change_approval_level_add", "change_approval_level_edit", "change_approval_level_delete"], // No I18N
				"Approvals" : ["approval_add", "approval_delete", "approval_approve", "approval_reject", "change_approval_notification_sent"], // No I18N
				"Deployment Schedule" : ["DT_ID","DT_DESC", "DT_STARTTIME", "DT_ENDTIME", "DT_ACTUALSTARTTIME", "DT_ACTUALENDTIME", "DT_DESC_DEL", "DT_TYPE","DOWNTIME_STARTTIME","DOWNTIME_ENDTIME","DOWNTIME_ACTUALSTARTTIME","DOWNTIME_ACTUALENDTIME","DT_STARTTIME","DEPLOYMENT_STARTTIME","DEPLOYMENT_ENDTIME","DEPLOYMENT_ACTUALSTARTTIME","DEPLOYMENT_ACTUALENDTIME","DOWNTIME_SERVICES","DOWNTIME_CIINVOLVED","DOWNTIME_PATCHVERSION","DOWNTIME_ISDOWNTIME"], // No I18N
				"Associations" : ["Problem", "Incident", "PROJECTID", "RELEASEID"], // No I18N
				"Attachments" : ["ATT_Change_Details", "ATT_Change_IMPACTDESC", "ATT_Change_ROLLOUTPLAN", "ATT_Change_BACKOUTPLAN", "ATT_Change_CHECKLIST", "ATT_Change_Note", "ATT_Change_uat_issues", "ATT_Change_uat_testplan", "ATT_Change_release_issues", "ATT_Change_REVIEW", "ATT_Change_CLOSEDESC"], // No I18N
				"Notes" : ["change_note_add", "change_note_edit", "change_note_delete"], // No I18N
				"Conversations" : ["change_notification_add"], // No I18N
				"Task" : ["ADD_changetask", "change_task_assign", "DELETE_changetask", "TRIGGER_taskcustomaction", "RESULT_taskcustomaction"], // No I18N
				"Work Logs" : ["ADD_changeworklog", "DELETE_changeworklog", "UPDATE_changeworklog", "change_worklog_add", "change_worklog_edit", "change_worklog_delete"], // No I18N
				"Stage Data" : ["WFSTAGEID", "WFSTATUSID"], // No I18N
				"ChangeRoles" : (typeof changehistory != "undefined" && options.entity == "changes") ? changehistory.fetchChangeRolesForHistory(options.entityID) : [], // No I18N
			},
			fields_mapping : (typeof changehistory != "undefined" && options.entity == "changes") ? changehistory.fetchFieldsMapForHistory() : "", // No I18N
			constructListInfoCB: function(inputData){ return changehistory.modifyHistoryListInfo(inputData);}
		},
		"change_roles":{// No I18N
		constructSearchCriteriaCB:(inputData)=>{
        			let operationCriteria = inputData.list_info.search_criteria.find(criterion => criterion.field === "operation");// No I18N

        			if (operationCriteria && operationCriteria.values.includes("edit") && !operationCriteria.values.includes("change_role_permissions_edit")) {// No I18N
        				operationCriteria.values.push("change_role_permissions_edit");// No I18N
        			}
        			}
        },
        "change_stages":{// No I18N
        diffInPopupFields : ["description","content","subject"], //No I18N
        constructSearchCriteriaCB:(inputData)=>{
                			let operationCriteria = inputData.list_info.search_criteria.find(criterion => criterion.field === "operation");// No I18N

                			if (operationCriteria && operationCriteria.values.includes("edit") && !operationCriteria.values.includes("change_status_edit")) {// No I18N
                				operationCriteria.values.push("change_status_edit");// No I18N
                			}
                			if (operationCriteria && operationCriteria.values.includes("add") && !operationCriteria.values.includes("change_status_add")) {// No I18N
                                            				operationCriteria.values.push("change_status_add");// No I18N
                            }
                            if (operationCriteria && operationCriteria.values.includes("delete") && !operationCriteria.values.includes("change_status_delete")) {// No I18N
                                                                        				operationCriteria.values.push("change_status_delete");// No I18N
                            }
                			}
        },
		/**
		 * When used in an array or object literal, it spreads the elements of an iterable (like an array or object) into a new array or object. It allows you to easily copy the contents of one array or object into another.
		 */
		...(options.entity.startsWith('cm_') ? {  //No I18N
			[options.entity] : {
				is_new_history : true,
				enableFilter : window.printmode ? false : true,
				diffInPopupFields : $CMCommon.appendFieldInHTML(['description', 'comments'], options.entity), // No I18N
				moduleproperty_mapping : {
					tasks_add : ["cm_task_add"],
                    tasks_delete : ["cm_task_delete"],
					delete : ['delete', 'move_to_trash'], // No I18N
					edit : [
					'edit', // No I18N
					'restore_from_trash', // No I18N
					'WORKFLOW_APPLIED_BUSINESS_RULE', // No I18N
					'WORKFLOW_APPLIED_CUSTOM_TRIGGER', // No I18N
					'WORKFLOW_EXTERNAL_ACTION', // No I18N
					'WORKFLOW_E_MAIL_NOTIFICATION', // No I18N
					'WORKFLOW_SMS_NOTIFICATION', // No I18N
					'WORKFLOW_NEGATE' // No I18N
					]
				},
				filterPlaceHolder : 'custom.history.filter.placeholder', // No I18N
				filterFields : [
					{
					text : translate("common.history.operations"),
					children : jQuery.merge($CMCommon.appendFieldInDesc(options.entity, options.entity_key),[
						{
						id : 'add', value : 'operation', text : translate('sdp.history.added') // No I18N
						},
						{
						id : 'edit', value : 'operation', text : translate('sdp.requests.history.updated') // No I18N
						},
						{
						id : 'restore_from_trash', value : 'operation', text : translate('sdp.requests.history.restored') // No I18N
						},
						{
						id : 'move_to_trash', value : 'operation', text : translate('sdp.tasks.header.requesttrashed') // No I18N
						},
						{
						id : 'WORKFLOW_APPLIED_BUSINESS_RULE', value : 'operation', text : translate('sdp.requests.history.rule.applied') // No I18N
						},
						{
						id : 'WORKFLOW_APPLIED_CUSTOM_TRIGGER', value : 'operation', text : translate('request.applied.ct') // No I18N
						},
						{
						id : 'WORKFLOW_EXTERNAL_ACTION', value : 'operation', text : translate('external.action') // No I18N
						},
						{
						id : 'WORKFLOW_E_MAIL_NOTIFICATION', value : 'operation', text : translate('sdp.admin.security.settings.email.notification') // No I18N
						},
						{
						id : 'WORKFLOW_SMS_NOTIFICATION', value : 'operation', text : translate('notification.sms.action') // No I18N
						},
						{
						id : 'WORKFLOW_NEGATE', value : 'operation', text : translate('request.history.operationdenied') // No I18N
						}
					])
					}
				]
				}
		} : {}),
		"ziaconfigurations" : {  //No I18N
			isAdmin : true
		},
		"zia-bot" : {  //No I18N
			isAdmin : true
		},
		"tfa" : {  //No I18N
			isAdmin : true,
			diffInPopupFields : ["description","description_sensitive_resources"] //No I18N
		},
		"color_settings" : {  //No I18N
			enableSortOnly : true
		},
		"global_personalization" : {  //No I18N
			enableSortOnly : true
		},
		"asset_replenishments" : {  //No I18N
			enableSortOnly : true
		},
		"products" : {//No I18N
			/**Option to display given name in history product fields dropdown header */
			ae_filter : {
				entity : {
					dropdownLabel : translate("sdp.contract.listViewI.active")
				}
			}
		},
		"asset_modules":{//No I18N
             is_new_history : true
         },
         "consumable_modules":{//No I18N
             is_new_history : true
         },
         "software_modules":{//No I18N
             is_new_history : true
         }
	};
	/**
	 * Return the options for the specified entity/module
	 */
	return result[options.entity];
};
