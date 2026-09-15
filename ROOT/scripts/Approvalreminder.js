/* $Id$ */
function validateContent(form,tokenValue,notificationtype,editor_name,dialog_id)
{
var content="";
var token="$MyPendingApprovalLink";  //No I18N
if(tokenValue!=null){
	token=tokenValue;
}
if(ishtmlEnabled)
{
content=parent[editor_name].getHTML();

//SD-120201 : Converting the provided content into HTML
content = content.split('\n');
content = content.map(line => `<div>${line}<br></div>`).join('');
}
else{
if(form.name == 'ApprovalAckContent')
{
content=form.approvalAckDesc.value;
}
if(form.name == 'ApprovalRemContent')
{
content=form.ApprovalReminderDesc.value;
}
}
var subject=form.subject.value;
if(subject!=null && trim(subject)=='')
{
jQuery("#subject_div").addClass("has-error");
jQuery(".form-control").trigger('focus');
return false;
}
if(content!=null && content.indexOf(token.trim())==-1)
{
jQuery("#dialogInfo").hide();
jQuery("#tokenMissing").show();
return;
}
var desc=content;
if(form.name == 'ApprovalAckContent'){
saveApprovalAcknowledgement(subject,desc,notificationtype,dialog_id);
}
else{
	saveNotification(subject,desc,dialog_id);
}
}
function saveNotification(subject,content,dialog_id)
{
	var percentEncodedTokenVal = content.replace(/%/g, "%25");	
	percentEncodedTokenVal= percentEncodedTokenVal.replace(/\+/g, "%2B");
	subject=subject.replace(/%/g, "%25");  
	subject=subject.replace(/\+/g, "%2B");
	var approval_module = jQuery('#approval_module') != undefined ? jQuery('#approval_module').val() : "approval"; //NO I18N
	//The CSRF token has been added in sdpAjax() method in options.data
	sdpAjax({
		url: "/servlet/SDAjaxServlet?module=admin&action=saveApprovalReminderDesc&subjectVal="+encodeURIComponent(subject)+"&approval_module="+approval_module, //No I18N
		type: "POST",	//No I18N
		data: {"tokenValue" : encodeURIComponent(percentEncodedTokenVal)},  //No I18N
		async: false,
		success: function(){
			showalert('success',getMessageForKey("sdp.settings.approval.reminder.content.saved.info"),'isAutoHide=true');// No I18N
			setTimeout(function(){
				if(dialog_id != undefined){
					jQuery("#"+dialog_id).dialog("close");
				}else{
					closeDialog();
				}
			},3000);
		},
		error: function() {
			showalert('failure',xhr.responseText,'isAutoHide=true');// No I18N
			setTimeout(function(){
				if(dialog_id != undefined){
					jQuery("#"+dialog_id).dialog("close");
				}else{
					closeDialog();
				}
			},3000);
		}
	});
}
function saveApprovalAcknowledgement(subject,content,notificationtype,dialog_id)
{
	var percentEncodedTokenVal = content.replace(/%/g, "%25");
	percentEncodedTokenVal= percentEncodedTokenVal.replace(/\+/g, "%2B");
	subject=subject.replace(/%/g, "%25");  
	subject=subject.replace(/\+/g, "%2B");
	//The CSRF token has been added in sdpAjax() method in options.data
	sdpAjax({
		url: "/servlet/SDAjaxServlet?module=admin&action=saveApprovalAcknowledgement&notificationtype="+notificationtype+"&subjectVal="+encodeURIComponent(subject), //No I18N
		type: "POST",	//No I18N
		data: {"tokenValue" : encodeURIComponent(percentEncodedTokenVal)}, //No I18N
		async: false,
		success: function() {
			showalert('success',getMessageForKey("settings.approval.acknowledgement.content.saved.info"),'isAutoHide=true');// No I18N
			setTimeout(function(){
				if(dialog_id != undefined){
					jQuery("#"+dialog_id).dialog("close");
				}else{
					closeDialog();
				}
			},3000);
		}
	});
}
