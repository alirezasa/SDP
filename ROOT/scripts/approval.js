/* $Id$ */

var prev_approval = {
    appr_data: {},
    table_comp: {},
    approvers:{},

    initTC: function (approvals) {
        prev_approval.appr_data = approvals;
        var table_content = {};
        table_content.header = prev_approval.constructHeader();
        var options = {};
        options.callbackRowfunction = prev_approval.constructRowData;
        options.row_inputdata = prev_approval.constructRowData();
        options.callbackDataGet = prev_approval.callbackDataGet;
        options.entity_name = "previous_approvals";  // No I18N
        prev_approval.table_comp = new tableComponent(table_comp.getTableInfo(), table_content, options);  
    },

    callbackDataGet: function () {
        var responseData = {};
        responseData.previous_approvals = prev_approval.appr_data;
        responseData.list_info = {"sort_field":"order","sort_order":"asc", "start_index" : 1}; //NO I18N
        responseData.list_info.row_count = responseData.previous_approvals.length;
        responseData.list_info.total_count = responseData.previous_approvals.length;
        responseData.list_info.has_more_rows = false;

        return responseData;
    },

    constructRowData: function() {
        var inputObject = {"list_info":{"sort_field":"order","sort_order":"asc"}}; //No I18N
        return inputObject;
    },

    constructHeader: function () {
        var  meta_data = {
          "approver" : {  // No I18N
              text: getMessageForKey('sdp.approval.approver'),
              wrapped: true,
              dataCelltransformer: function (arg) {
            	 let head_data = arg.head_data;
                 let row_data = arg.row_data;
                 let orgRoleName=row_data.org_role?row_data.org_role.display_name:null;
 				 let approverName = row_data[head_data.id]?row_data[head_data.id].name:null;
 				 let email = row_data[head_data.id]?row_data[head_data.id].email_id:row_data["email"];//No I18N
 				 let disp_str="";//No I18N
 				 if(approverName){
 					 disp_str=approverName+((orgRoleName && row_data.obo_approver==null)?" ("+orgRoleName+")":"")+ (email?" - "+email:"");//No I18N
 					 let approverId=row_data[head_data.id].id;
					 this.prev_approval.approvers[approverId] = row_data[head_data.id];
 				 }
 				 else if(email){
 					 disp_str = email;
 				 }
 				 else if(orgRoleName){
 					 disp_str = orgRoleName;
 				 }
 				let toRet;
 				if(userLoggedIn && approverName){
 					let onclickAction = 'href="/" data-event="click" data-handler="window.NewWindow(\'/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+e_attr(row_data[head_data.id].id)+'&minContent=true\', getMessageForKey(\'sdp.inventory.wsRtPanel.userDetails\'), \'450\', \'500\', \'yes\', \'center\');" nonce='+sdpNonce;//No I18N
					toRet = "<span class='text-wrap' rel='uitip' title='" + e_attr(disp_str) + "'> <a "+onclickAction+">" + e_html(disp_str) + "</a></span>";//No I18N
				}
 				else{
 					toRet = "<span class='text-wrap' rel='uitip' title='" + e_attr(disp_str) + "'>" + e_html(disp_str) + "</span>";//No I18N
				}
 				 if(row_data.obo_approver){
 					 let args = [e_html(row_data.obo_approver.name)];
 					 let oboApproverDetails = "("+getMessageForKey("sdp.backupapprover.approver.view.info",args)+")";//No I18N
 					 toRet = toRet + "<br/><span rel='uitip' title='" + e_attr(oboApproverDetails) + "'>" + e_html(oboApproverDetails) + "</span>";//No I18N
 				 }
 				 return toRet;
              },
              "width":"275px"  // No I18N
             },
          "sent_on.display_value" : {  // No I18N
             text: getMessageForKey('sdp.approval.senton'), // No I18N
             "width":"150px"  // No I18N
             },
          "status.name": {  // No I18N
             text: getMessageForKey('sdp.approval.status'), //NO I18N
             dataCelltransformer(arg){
				 let statusName = arg.row_data.status.name;
				 var statusNames = {"To Be Sent" : {"display_name":"sdp.approval.status.tobesent"}, "Pending Approval" : {"display_name":"sdp.purchase.status.pendingapproval"},"Approved" : {"display_name":"sdp.common.status.approved"}, "Denied" : {"display_name":"sdp.change.approval.rejected"},"Pending Clarification": {"display_name":"api.approval.clarification.status.name"}}; // No I18N
				 return "<span rel='uitip' title='" + e_attr(statusName) + "'>" + e_html(getMessageForKey(statusNames[statusName].display_name)) + "</span>";//No I18N
			 },
             "width":"80px"  // No I18N
             },
          "action_taken_on.display_value": {  // No I18N
             text: getMessageForKey('sdp.approval.actedon'), //NO I18N
             "width":"150px"  // No I18N
             },
          "comments": {  // No I18N
             text: getMessageForKey('sdp.requests.common.desc'),
             "width":"100px"  // No I18N
             },
          "approval_level.name": {  // No I18N
             text: getMessageForKey('sdp.requests.common.level'),
             "width":"75px"  // No I18N
             }
        };

       return meta_data;
    }
}