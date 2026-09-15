/* $Id$ */

function validateDCTaskForm() {
	var formObj = document.InstallForm;

	if(formObj.installerType != null) {
		var isSelected = false;
		for (var i=0; i<formObj.installerType.length; i++)  {
			if (formObj.installerType[i].checked)  {
				isSelected = true;
			}
		} 

		if(!isSelected) {
			showWarningMessage(getMessageForKey("sdp.common.error.noselection.installerType")); // No I18N
			return false;
		}

		if(formObj.packageName.value == null || formObj.packageName.value == "") {
			showWarningMessage(getMessageForKey("sdp.common.error.noselection.packagename")); // No I18N
			return false;
		}

		var runAs = formObj.runAs.value;
		var pass = formObj.password.value;
		if(runAs != null && trimAll(runAs) != '' && trimAll(pass) == '') {
			showWarningMessage(getMessageForKey("sdp.common.error.noselection.password")); // No I18N
			return false;
		}
	}
	if(formObj.scriptName != null) {
		var selScript = formObj.scriptName.value;
		if(selScript == "0") {
			showWarningMessage(getMessageForKey("sdp.common.error.noselection.scriptname"));
			return false;
		}
	}

	var selType = formObj.installFor.value;
	if(selType == "User") {
		if(jQuery(formObj.userNames).val() == ""){
			showWarningMessage(getMessageForKey("sdp.common.error.noselection.user")); // No I18N
			return false;
		}
	}
	else if(selType == "Workstation"){
		if(jQuery(formObj.workstationNames).val() == "") {
			showWarningMessage(getMessageForKey("sdp.common.error.noselection.workstation")); // No I18N
			return false;
		}	
	}
	return true;
}

function loadScriptDescription() {
	var selected = document.InstallForm.scriptName.value;
	var desc = getMessageForKey("sdp.requests.runscript.nodesc");
	if(selected == "0") {
		   var uemProductName = encodeHTML(getUEMProdName(true, false).uem_integ_prod);
			desc=getMessageForKey("sdp.requests.runscript.help",[uemProductName,uemProductName]);
		}else{
		desc = document.getElementById(selected).innerHTML;
		if(desc == "") {
			desc = getMessageForKey("sdp.requests.runscript.nodesc");
		}
		}
	
	
	document.getElementById("descPH").innerHTML = desc;
}
