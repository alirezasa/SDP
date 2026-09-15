/* $Id$ */
/*  This file has utility functions required for displaying Chnage History page.
 */
var changehistory = {
    fetchChangeRolesForHistory:function (changeId) { //Since change roles are dynamic, we get the change roles' ids on-demand to fill the operational_mapping
        var roles = ["INITIATORID", "CHANGEMANAGERID", "TECHNICIANID"]; //No I18N
        sdpAjax({
            url: "/api/v3/changes/" + changeId,//No I18N
            method: "GET",//No I18N
            success: function (response) {
                jQuery.each(response.change.roles, function (index, role) {
                    if(role.group != null){
                        roles.push("ROLEID_GRP_" + role.role.id.toString());
                    } else {
                        roles.push("ROLEID_" + role.role.id.toString());
                    }
                })
            }
        });
        return roles;
    },
    fetchFieldsMapForHistory:function () { // A method to fields_mapping for change history filters
        var fieldsMap = {
            "assets" : "ASSETID","configuration_items":"CIID", "attachments" : "ATT_Change_Details", "impact_details" : "IMPACTDESC", "roll_out_plan" : "ROLLOUTPLAN", "back_out_plan" : "BACKOUTPLAN", //No I18N
            "checklist" : "CHECKLIST", "category" : "CATEGORYID", "change_requester" : "INITIATORID", "change_owner" : "TECHNICIANID", "change_manager" : "CHANGEMANAGERID", //No I18N
            "change_type" : "CHANGETYPEID", "close_details" : "Close Comments", "closure_code" : "Close code", "completed_time" : "COMPLETEDTIME", "description" : "FULL_DESCRIPTION", //No I18N
            "impact" : "IMPACTID", "subcategory" : "SUBCATEGORYID", "item" : "ITEMID", "next_review_on" : "NEXT_REVIEW_ON", "priority" : "PRIORITYID",  "template" : "TEMPLATEID",//No I18N
            "reason_for_change": "REASONFORCHANGEID", "release_scheduled_end" : "RELEASE_SCHEDULEDENDTIME", "release_scheduled_start" : "RELEASE_SCHEDULEDSTARTTIME", "workflow" : "WFID", //No I18N
            "release_actual_start" : "RELEASE_ACTUALSTARTTIME", "retrospective" : "ISRETROSPECTIVE", "title" : "TITLE", "site" : "SITEID", "urgency" : "URGENCYID",  "created_time" : "CREATEDTIME",//No I18N
            "release_actual_end" : "RELEASE_ACTUALENDTIME", "review_details" : "REVIEW", "sla" : "SLAID", "sla_violation" : "ISOVERDUE", "scheduled_end_time" : "SCHEDULEDENDTIME",  //No I18N
            "services" : "SERVICEID", "uat_scheduled_start" : "UAT_SCHEDULEDSTARTTIME", "uat_scheduled_end" : "UAT_SCHEDULEDENDTIME", "uat_actual_start" : "UAT_ACTUALSTARTTIME", //No I18N
            "group": "GROUPID", "risk": "RISKID", "uat_description": "UAT_DESC", "release_description" : "RELEASE_DESC", "stage" : "WFSTAGEID",  "status" : "WFSTATUSID", //No I18N
            "scheduled_start_time" : "SCHEDULEDSTARTTIME",  "uat_actual_end" : "UAT_ACTUALENDTIME", "deleted_time" : "DELETEDTIME" }; //No I18N

        return fieldsMap;
    },
    modifyHistoryListInfo (input_data){
        let stageDeleteOper = ["stage_delete"];
        let fieldCrit = input_data.list_info && input_data.list_info.search_criteria && input_data.list_info.search_criteria.find(crit => crit.field === "field");
        if(fieldCrit && fieldCrit.values.includes('WFSTAGEID')){
            const operationCrit = input_data.list_info.search_criteria.find(crit => crit.field === "operation");
            if(operationCrit){
                operationCrit.values = operationCrit.values.concat(stageDeleteOper);
            }else{
                let obj = {
                    "field": "operation",//No I18N
                    "condition": "in",//No I18N
                    "values": stageDeleteOper//No I18N
                }
                if(input_data.list_info.search_criteria.length>0){
                    obj.logical_operator = "or"//No I18N
                }
                input_data.list_info.search_criteria.push(obj);
            }
        }
        return input_data;

    }
}