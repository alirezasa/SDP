/* $Id$ */

function handleAjaxResponseForRequesterDelete(requestObj, module, form){
	handleAjaxResponseForUserDelete(requestObj, module, form, "REQ"); //No I18N
}

function handleAjaxResponseForUserDelete(requestObj, module, form, userType){
	var responseObj = JSON.parse(requestObj.responseText);

	var form = document.SearchUserForm;
	var formElementName = 'delUserList'; //No I18N
	var isGDPREnabled = responseObj.GDPR_COMPLIANCE_ENABLED;
	if(isGDPREnabled == true){
		var defaultAnonymousMap = responseObj.ANONYMOUS_MAP;
		var piiFields = responseObj.PII_FIELDS;
		showAnonymizationPopup(defaultAnonymousMap, piiFields);
	}
}

function handleAjaxResponseForUserAnonymization(requestObj, module, form, userType){
	var responseObj = JSON.parse(requestObj.responseText);
	var form = document.SearchUserForm;
	var isGDPREnabled = responseObj.GDPR_COMPLIANCE_ENABLED;
	if(isGDPREnabled == true){
		var defaultAnonymousMap = responseObj.ANONYMOUS_MAP;
		var piiFields = responseObj.PII_FIELDS;
		showAnonymizationPopup(defaultAnonymousMap, piiFields, module);
	}
	else{
		alert(getMessageForKey("sdp.gdpr.enable.error"));
		window.location.href = "/RequesterDef.do?changeTo=deletedUsers";
	}
}

function deleteUserHandler(ele, userType){
	var hideAccountManagerPopup = window.userList && userList.hideAnonymizePopup ? userList.hideAnonymizePopup : function () {};
	jQuery(ele).prop('disabled', true); //No I18N
	if("ANONYMIZATION_USER" == userType || (jQuery("[id*='_DIALOG_LAYER']").find('#deleteWithAnonymization') != null && jQuery("[id*='_DIALOG_LAYER']").find('#deleteWithAnonymization').prop('checked'))){
		var modifiedAnonymousMap = getModifiedAnonymousMap();
		userList.deleteTechnician("deletefromanonymize",'',modifiedAnonymousMap); //No I18N
		closeDialog();
			hideAccountManagerPopup();
		return ;
	}
	else if(jQuery("[id*='_DIALOG_LAYER']").find('#deleteWithoutAnonymization') != null && jQuery("[id*='_DIALOG_LAYER']").find('#deleteWithoutAnonymization').prop('checked')){
		if("REQ" == userType || "TECH" == userType){ //No I18N
			userList.deleteTechnician("deletefromanonymize"); //No I18N
			closeDialog();
			hideAccountManagerPopup();
		}
		else{
			alert(getMessageForKey('sdp.common.error.unknown'));
		}
	}
}
