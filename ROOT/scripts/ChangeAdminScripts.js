/* $Id$ */


//----------------------------------------Change template tabs----------------------------------------------------------------------


function scrollToTab(id) {
	var scrlPos = jQuery("#" + id).offset().top - 70;
	if (browser_ie) {
		var scrlTop = document.body.scrollTop;
		scrlPos =  scrlPos + scrlTop;
	}
	jQuery('html,body').animate({scrollTop: scrlPos}, 0); //no i18n
}

var chgTpltCurrentTab = "details"; //no i18n
var chgTpltGoToTab = "details"; //no i18n
var chgTpltTabNames = ["details", "roles", "fieldformrules"]; //no i18n
var stageIndexMapping  = stageIndexMapping ? stageIndexMapping : {};

//If tab name is passed moves to that tab, else moves to 'chgTpltGoToTab' tab
function changeChgTpltTabs(tab) {
	if(tab == null) {
		tab = chgTpltGoToTab;
	}

	if(chgTpltCurrentTab == "details") { //no i18n
		Canvas.resetActions(); //discard all changes in roles
		restoreChangeTemplateDetails(); // discard all changes on top
		Canvas.saved = true;
		disableChangeTemplateTopPanel(true);
	} else if(chgTpltCurrentTab == "roles") { //no i18n
		discardAllChangesInChangeTemplateRoles(); //discard all changes in roles
	}

	jQuery.each(chgTpltTabNames, function(t) {
		document.getElementById("changetemp-tab-" + chgTpltTabNames[t]).style.display = "none";
	});
	document.getElementById("changetemp-tab-" + tab).style.display = "";

	if(tab == "details") { //no i18n
		disableChangeTemplateTopPanel(false);
		Canvas.reDraw();
		Canvas.saved = true;
		jQuery('#TopPanelMask').removeClass('MaskTopPanel').removeAttr('style');//no i18n
		jQuery('#TopPanel').removeClass('ShowTopPanel').removeAttr('style');//no i18n
	} else if(tab == "roles") { //no i18n
		loadChangeTemplateRoles({
			beforeInitComp: function() {
				checkChangeTemplateRoleTechSites(false);
			}
		});
		jQuery('#TopPanelMask').addClass('MaskTopPanel').height(jQuery('#TopPanel').height());//no i18n
		jQuery('#TopPanel').addClass('ShowTopPanel').css('margin-top',-jQuery('#TopPanel').height());//no i18n
	} else if(tab == 'fieldformrules') { //no i18n
		getFieldFormRulesDiv();
		jQuery('#TopPanelMask').addClass('MaskTopPanel').height(jQuery('#TopPanel').height());//no i18n
		jQuery('#TopPanel').addClass('ShowTopPanel').css('margin-top',-jQuery('#TopPanel').height());//no i18n
	}
	scrollToTab("changetemp-tab-" + tab); //no i18n
	jQuery("." + "changetemp-tabname-" + chgTpltCurrentTab).removeClass("active");
	jQuery("." + "changetemp-tabname-" + tab).addClass("active");
	chgTpltCurrentTab = tab;
}

//OnClick event for tab clicks, moves to tabname passed
//Throws confirmation dialog if necessary
function onClickChgTpltTab(tab) {
	if(tab === chgTpltCurrentTab) {
		return;
	}
	if(isMSP && !mspValidateTemplateForm(document.ChangeTemplateForm,document.getElementsByName('templateAllAccounts')[0].checked)){
		return;
	} 
	chgTpltGoToTab = tab;
	if(chgTpltCurrentTab == "details") { //no i18n
		if(!editmode) { //check if new template
			if(validateTemplateForm()) {
				showDialog(document.getElementById("saveTemplateDialog").innerHTML, "modal=yes, title=" + document.getElementById("saveTemplateDialog").title,()=>{// No i18N
                    document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateForm-10"]').addEventListener("click", function(event) { saveTemplate() });// No i18N
                    document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateForm-11"]').addEventListener("click", function(event) { closeDialog() });// No i18N
                    });
			    }
			return;
		} else if(!Canvas.saved || Canvas.hasLayoutChanged() || changeTemplateDetailsChanged) { //check if details section is saved
			showDialog(document.getElementById("saveDetailsTabDialog").innerHTML, "modal=yes, title=" + document.getElementById("saveDetailsTabDialog").title,()=>{// No i18N

				document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateForm-10"]').addEventListener("click", function(event) { saveTemplate() });// No i18N


				document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateForm-11"]').addEventListener("click", function(event) { closeDialog() });// No i18N


				document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateForm-13"]').addEventListener("click", function(event) { closeDialog(); changeChgTpltTabs(); });//No i18N
							});
			return;
		}
	} else if(chgTpltCurrentTab == "roles") { //no i18n
		if(!isChangeTemplateRoleSaved) { //check if roles section is saved
			showDialog(document.getElementById("saveRolesTabDialog").innerHTML, "modal=yes, title=" + document.getElementById("saveRolesTabDialog").title,()=>{//No i18N
				document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateRoleForm-13"]').addEventListener("click", function(event) { saveChangeTemplateRole(true); });//No i18N
				document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateRoleForm-14"]').addEventListener("click", function(event) { closeDialog(); changeChgTpltTabs(null); });//No i18N
				document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateRoleForm-15"]').addEventListener("click", function(event) { closeDialog() });//No i18N
			});
			return;
		}
	}
	changeChgTpltTabs(tab);
}

//----------------------------------------Change template: Field and form rules----------------------------------------------------------------------

function getFieldFormRulesDiv() {
	var module = "CHANGE"; //NO I18N
	var tempID = document.ChangeTemplateForm.CHANGETEMPLATEID.value;
	var fieldFormRulesDiv = "fieldFormRulesDiv"; //NO I18N
	var url = "/FieldFormRules.do?action=getRulesList&module="+encodeURIComponent(module)+"&templateId="+encodeURIComponent(tempID)+"&FieldFormRulesDiv="+encodeURIComponent(fieldFormRulesDiv)+'&rulesRequired=templateSpecific';    //NO I18N
	jQuery.ajax({
		type: "GET",  //NO I18N
		url: url,
		success: function(data) {
			jQuery('#'+fieldFormRulesDiv).html(data); //NO I18N
		}
	});
}

//----------------------------------------Change details in change template----------------------------------------------------------------------

//changed when template name/workflow/default/emergency/description changes
var changeTemplateDetailsChanged = false;

//used for tracking if site and group are changed in first tab
var changeTemplateSiteId = null;
var changeTemplateGroupId = null;

var saveRolesTriggerdBySiteChange = false;

//used to backup changes on fields on top
var changeTemplateBackup = {"tempName": null, "workflow": null, "isEmergency": null, "isDefault": null, "isDeleted": null, "tempComments": null}; //no i18n

function disableChangeTemplateTopPanel(value) {
	jQuery("#tempName,#workflow,#isEmergency,#isDefault,#isDeleted,#tempComments").prop("disabled", value); //NO I18N
}

//backup changes on fields on top, used while saving details tab
function backupChangeTemplateDetails() {
	changeTemplateDetailsChanged = false;
	changeTemplateBackup.tempName = document.getElementById("tempName").value; //no i18n
	changeTemplateBackup.workflow = document.getElementById("workflow").value; //no i18n
	changeTemplateBackup.isEmergency = document.getElementById("isEmergency").checked; //no i18n
	if(document.getElementById("isDefault") != null) {
		changeTemplateBackup.isDefault = document.getElementById("isDefault").checked; //no i18n
	}
	if(document.getElementById("isDeleted") != null) {
		changeTemplateBackup.isDeleted = document.getElementById("isDeleted").checked; //no i18n
	}
	changeTemplateBackup.tempComments = document.getElementById("tempComments").value; //no i18n
}

//restore changes on fields on top, used when changes discarded
function restoreChangeTemplateDetails() {
	changeTemplateDetailsChanged = false;
	document.getElementById("tempName").value = changeTemplateBackup.tempName; //no i18n
	document.getElementById("workflow").value = changeTemplateBackup.workflow; //no i18n
	document.getElementById("isEmergency").checked = changeTemplateBackup.isEmergency; //no i18n
	if(document.getElementById("isDefault") != null) {
		document.getElementById("isDefault").checked = changeTemplateBackup.isDefault; //no i18n
	}
	if(document.getElementById("isDeleted") != null) {
		document.getElementById("isDeleted").checked = changeTemplateBackup.isDeleted; //no i18n
	}
	document.getElementById("tempComments").value = changeTemplateBackup.tempComments; //no i18n
}

//set onchangeCallback to true on change of each components on top
function setChangeTemplateDetailsOnChangeCallbacks() {
	jQuery("#tempName,#workflow,#isEmergency,#isDefault,#isDeleted,#tempComments").on('change', function() {
		changeTemplateDetailsChanged = true;
	});
	backupChangeTemplateDetails();
}
function deleteTemplateEntry(id,button)
{
    name = encodeURIComponent(document.getElementById("list_"+id).innerHTML);
    if(window.confirm(getMessageForKey('sdp.admin.change.commonlistview.deleteConform',[button])))
    {
	var newUrl = "/ChangeTemplate.do";//NO I18N
	var params = 'mode=deleteChangeTemplate&id='+encodeURIComponent(id);//NO I18N
	var myAjax = new Ajax.Request(newUrl, {
method: 'post',//NO I18N
parameters: params,
onComplete: function(resp, jsonObj){ successHdlrForDeleteTempEntry(resp,id,name); }
});
}

}
function successHdlrForDeleteTempEntry(resp,id,name)
{
    var result = JSON.parse(resp.responseText);
    var succ = decodeURIComponent(result.successMsg);
    var greyed = decodeURIComponent(result.greyedMsg);
    var fail = decodeURIComponent(result.failedMsg);
    if(result.status == "success")
    {
	jQuery("#Row_"+id).empty();
	//      showSuccessMessageAndClose("Row_"+id,succ,3000);//NO I18N
	showMessageAndClose(encodeHTML(succ),3000);
	refreshSubView(getPortalViewName("ShowChangeTemplate"));
    }
    else if(result.status == "greyedout")
    {
	jQuery("#Row_"+id).find(".listNormal").addClass("fontgray");
	jQuery("#Row_"+id).find(".subhead").addClass("fontgray");
	jQuery("#Row_"+id).find(".notes1").addClass("fontgray");
	jQuery("#Row_"+id).find(".notes2").addClass("fontgray");
	jQuery("#Row_"+id).find(".tag").addClass("fontgray");
	jQuery("#deleterow_"+id).find("a").removeClass("servicecat-delete").addClass("servicecat-delete-dis");
	jQuery("#deleterow_"+id).find("a").removeAttr("href");//NO I18N

	showFailureMessageForChange("Row_"+id,encodeHTML(greyed),3000);//NO I18N
    }
    else
    {
	showFailureMessageAndClose(encodeHTML(fail),5000);
    }
}
function showEmergencyWF(wfid,wfid_name)
{
    var div = document.getElementById("workflow");
    div.options.length = 0;
    //var wflist = JSON.parse(wfid_name) ;
    var wflist;
    try{
        wflist = JSON.parse(wfid_name);
	}
	catch(err){
        wflist = wfid_name;
    }
    div.options[0] = new Option(getMessageForKey("sdp.change.admin.changetemplate.selectworkflow"),"0");//NO I18N
    if(document.ChangeTemplateForm.isEmergency.checked)
    {
	var list = wflist.EMERGENCY;
	var vals = list.WORKFLOW_LIST;
	for(var i=0;i<vals.length;i++)
	{
	    var aList1 = vals[i].ANENTRY;
	    //replacing <,> symbol
	    var wfName = aList1[1].replace(/&lt;/g, '<'); //  No I18N
	    wfName = wfName.replace(/&gt;/g, '>'); //  No I18N

	    if(wfid == aList1[0])
	    {

		div.options[i+1]=new Option(wfName,aList1[0]);
		div.options[i+1].selected = true;
	    }
	    else
	    {
		div.options[i+1]=new Option(wfName,aList1[0]);
	    }
	}
    }
    else
    {
	var list = wflist.GENERAL;
	var vals = list.WORKFLOW_LIST;
	for(var i=0;i<vals.length;i++)
	{
	    var aList1 = vals[i].ANENTRY;
	    //replacing <,> symbol
	    var wfName = aList1[1].replace(/&lt;/g, '<'); //  No I18N
	    wfName = wfName.replace(/&gt;/g, '>'); //  No I18N

	    if(wfid == aList1[0])
	    {
		div.options[i+1]=new Option(wfName,aList1[0]);
		div.options[i+1].selected = true;
	    }
	    else
	    {
		div.options[i+1]=new Option(wfName,aList1[0]);
	    }
	}
    }
}

function goToTempListView()
{
    document.location="/app#/admin/change-templates";
}
function clickTempListView()
{
    if(!Canvas.saved || Canvas.hasLayoutChanged() || changeTemplateDetailsChanged || !isChangeTemplateRoleSaved) {
    	showDialog(document.getElementById("viewListConfirmDialog").innerHTML, "modal=yes, title=" + document.getElementById("viewListConfirmDialog").title,()=>{//No i18N
			document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateForm-17"]').addEventListener("click", function(event) { goToTempListView(); });//No i18N
			document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateForm-18"]').addEventListener("click", function(event) { closeDialog() });//No i18N
		});

    } else {
    	document.location="/app#/admin/change-templates";
    }
}
function checkValAndReplace(string) {
    string = string.replace(/&quot;/g, '\\\"'); // No I18N
	string = string.replace(/&#39;/g, '\\\"'); // No I18N
	string = string.replace(/#/g, '@@hash@@'); // No I18N
    string = string.replace(/&/g, '@@ampersand@@'); // No I18N
    string = string.replace(/%/g, '@@percentage@@'); // No I18N
    string = string.replace(/</g, '@@leftarrow@@'); // No I18N
    string = string.replace(/>/g, '@@rightarrow@@'); // No I18N
    string = string.replace(/\?/g, '@@question@@'); // No I18N
    return string;
}

function checkDefaultTemplate()
{
    var isDefault = document.getElementById("isDef").value;
    var def  = document.getElementById("defName").value;
    if(isDefault == "false")
    {
        if(document.ChangeTemplateForm.isDefault.checked && confirmSubmit(getMessageForKey("sdp.admin.change.listview.default.msg",[def])))
	{
	    document.ChangeTemplateForm.isDefault.checked = true;
	}
	else
	{
	    document.ChangeTemplateForm.isDefault.checked = false;
	}
    }
    else
    {
	alert(getMessageForKey("sdp.admin.change.listview.default.notdisable.msg"));
	document.ChangeTemplateForm.isDefault.checked = true;
    }

}
function loadme_chtemp(wfid,emerModel)
{

	//Stage and status allowed values will be loaded based on the workflow in the template
	if(wfid){
		Change_Canvas.renderStageStatusBasedonWorkflow(wfid);
	}
	
//Status listed based on stage selected. Missed to get stage based status from cmqueryutil. temp. fix done here.
Change_Canvas.change_populateChild("onload","_ev"+Canvas.viewObjects.WFSTAGEID.INDEX_NO);//NO I18N
    showEmergencyWF(wfid,emerModel);
}

function saveTemplate(callback, callbackParam)
{

    Canvas.Element.saveHTMLDescription();
    if(validateTemplateForm()) {
	var tname = trimAll(document.ChangeTemplateForm.tempName.value);
	var ttype = trimAll(document.ChangeTemplateForm.TEMPLATETYPE.value);
	var comment = document.ChangeTemplateForm.tempComments.value;
	var isEmergency = document.ChangeTemplateForm.isEmergency.checked;
	//Issue : For deleted templates, isdefault field will not be rendered
	var isDefault = false;
	var defaultField=document.ChangeTemplateForm.isDefault;
	var mode = document.ChangeTemplateForm.MODE.value;
	if(defaultField!=null && defaultField.checked)
	{
		isDefault=true;

	    document.getElementById("isDef").value = "true";
	    document.getElementById("defName").value = tname;
	}
	// var isRetrospective = document.ChangeTemplateForm.isRetrospective.checked;
	var wfid = document.getElementById("workflow").value;
	var resolution = "";

	var removedFieldList = Canvas.getRemovedFields();
	if(mode != "add" && removedFieldList.length > 0 ) {
	    var msz = getMessageForKey('sdp.admin.formcustom.removefield.confirmation.msz1') + " ";
	    msz = msz + "[" + removedFieldList + "] ";
	    msz = msz + getMessageForKey('sdp.admin.formcustom.removefield.confirmation.msz2') + " ";
	    msz = msz + getMessageForKey('sdp.admin.change.formcustom.removefield.confirmation.msz3') + " ";
	    msz = msz + getMessageForKey('sdp.admin.formcustom.removefield.confirmation.msz4') + "\n\n "; //No I18N
	    msz = msz + getMessageForKey('sdp.admin.formcustom.removefield.confirmation.msz5') + " ";
	    var ok = confirm(msz);
	    if(!ok) {
	    	return;
	    }
	}

	// disable form controls
	$A($('formControls').getElementsByTagName('input')).each( function(button) { button.disabled = true; });

	invokeProgressIndicator(null, getMessageForKey("sdp.common.processing"));

	tname = checkValAndReplace(tname);
	comment = checkValAndReplace(comment);

	var isDeleted = false;
	if(document.ChangeTemplateForm.isDeleted) {
	    isDeleted = document.ChangeTemplateForm.isDeleted.checked;
	}

	var newUrl = '/servlet/HdClientUtilServlet'; // No I18N
	var params = '';
	if(editmode) {
	    var tid = document.ChangeTemplateForm.CHANGETEMPLATEID.value;
	    params = params + 'command=updateTemplate&' ; // No I18N
	    params = params + 'templateID='+encodeURIComponent(tid)+'&' ; // No I18N
	    params = params + 'isDeleted='+encodeURIComponent(isDeleted)+'&' ; // No I18N
	}
	else {
	    params = params + 'command=saveTemplate&' ; // No I18N
	}
	params = params + 'templateName='+encodeURIComponent(tname)+'&' ; // No I18N
	params = params + 'templateType='+encodeURIComponent(ttype)+'&' ; // No I18N
	params = params + 'templateComment='+encodeURIComponent(comment)+'&'; // No I18N
	params = params + 'isEmergency=' + encodeURIComponent(isEmergency)+'&'; // No I18N
	params = params + 'isDefault=' + encodeURIComponent(isDefault)+'&'; // No I18N
	if(chgTpltDuplicateMode) {
		params = params + 'duplicate=true&'; // No I18N
		params = params + 'originalTid=' + encodeURIComponent(chgTpltCopyFromTid)+'&'; // No I18N
	}
	//  params = params + 'isRetrospective=' + isRetrospective+'&'; // No I18N
	params = params + 'wfid=' + encodeURIComponent(wfid)+'&'; // No I18N


	var images = $('INLINEIMAGES'); // No I18N
	if(images.length > 0 ) {
	    for(i=0; i < images.length; i++) {
		if(images[i].selected == true) {
		    params += "INLINEIMAGES=" + encodeURIComponent(images[i].value) + "&"; // No I18N
		}
	    }
	}

	if(isMSP){
		var selectedAccounts = document.ChangeTemplateForm.selectedAccounts.value.split('#----#'); //No i18n
		if(selectedAccounts != "")
		{
			params += "selectedAccountIds="+ selectedAccounts + "&";        //No i18n
		}
		if($('checkbox').checked) {  //No i18n
			params += "templateAllAccounts="+ $('checkbox').checked+ "&";   //No i18n
		}
	}

	// Get the VIEWID : DEFAULTVALUE pairs
	var tempDefaults = $H(Canvas.viewObjects).values().pluck('VIEWID').zip($H(Canvas.viewObjects).values().pluck('DEFAULTVALUE')); // No I18N
	$H(Canvas.viewObjects).values().each(function (item) {
		// unset ListValues. No need to send long Lists
		item.LISTVALUES = {};
		// if field is not on canvas then do not save its value
		if(item.INDEX_NO == -1 && item.VIEWID != 'RESOLUTION') {
		item.DEFAULTVALUE = "";
		if($A(['CHANGETYPEID', 'IMPACTID', 'URGENCYID', 'PRIORITYID','TECHNICIANID', 'CATEGORYID', 'SUBCATEGORYID', 'ITEMID','SITEID','ASSETID','CIID','SERVICEID','GROUPID']).include(item.VIEWID)) { item.DEFAULTVALUE = "0"; } // No I18N
		}
		});
	var items = Object.toJSON(Canvas.viewObjects);
	items = escapeJSONString(items);

	params = params + 'allFields=' + encodeURIComponent(items) +'&'; // No I18N

	params = params.replace(/&quot;/g, '\\\"'); // No I18N
	    params = params.replace(/&#39;/g, '\\\"'); // No I18N

	    var myAjax = new Ajax.Request(newUrl, {
method: 'post',//NO I18N
parameters: params,
onComplete: function(resp, jsonObj){ successHandlerForSaveTemp(resp, callback, callbackParam); }
});

// Restore the default values
tempDefaults.each(function (a) { Canvas.viewObjects[a[0]].DEFAULTVALUE = a[1]; });
images.options.length = 0;
}
}

function successHandlerForSaveTemp(resp, callback, callbackParam)
{
	 var result = JSON.parse(resp.responseText) ;

    var succ = false;
    if(result.status == 'success') {
		//alert("saved");
		Canvas.saved = true;
		var currentViews = [];
		$A(Canvas.viewNames).inject(currentViews, function(cv, vn) {if(vn.indexOf("Dumm") < 0) {cv.push(vn);} return cv;});
		Canvas.originalViewNames = currentViews;
		// after adding new template, change mode to Edit template
		if(!editmode) {
		    editmode = true;
		    document.ChangeTemplateForm.CHANGETEMPLATEID.value = result.id;
		    //        $('taskDetails_tab').className = 'show'; // No I18N
		    //      $('taskDetails_tab').className = 'subtaboff'; // No I18N
		}

		if(editmode) {
			if(document.ChangeTemplateForm.isEmergency.checked)
			{
				$("emergencySpan").innerHTML = "<span class='servicelist-infoicn'></span>";
			}
		    $("chtemplateOp").innerHTML = encodeHTML(trimAll(document.ChangeTemplateForm.tempName.value))+" "+"-"+" "+getMessageForKey("sdp.common.update"); // No I18N
		}
		succ = true;
		var descVal = result.description;
		if(descVal){
			if(descVal  == "&nbsp;" || descVal == "<br /> ") { descVal = "" } //No i18N
            Canvas.viewObjects.DESCRIPTION.DEFAULTVALUE = descVal;
		}

		backupChangeTemplateDetails();
    }

    // enable form controls
    $A($('formControls').getElementsByTagName('input')).each( function(button) { button.disabled = false; });

    if(succ) {
		if(callback) {
		    callback.apply(this, callbackParam);
		}
		else {
		    showMessageAndClose(getMessageForKey("sdp.admin.changetemplate.save.message.success"), 3000); // No I18N
		}
		Canvas.markAction();

		//If site changed delete techs,delete group not in current site and save change roles tab
		//Also if the group is changed,delete techs not present in the current group
		var isSiteChanged = isChangeTemplateSiteChanged();
			if(isChangeTemplateSiteChanged() || isChangeTemplateGroupChanged()){
			loadChangeTemplateRoles({
				beforeInitComp: function() {
					checkChangeTemplateRoleTechSites(isSiteChanged);
				},
				onComplete: function() {
					if(!isChangeTemplateRoleSaved) {
						saveChangeTemplateRole(false);
					}
				}
			});
			}

		changeChgTpltTabs(); //Move to clicked tab

		changeTemplateSiteId = getSiteIdFromChangeTemplateForm();
		changeTemplateGroupId = getGroupIdFromChangeTemplateForm();
    }
    else {
    	//alert('failed');
		if(result.message == null) {
		    showFailureMessageAndClose(getMessageForKey("sdp.admin.changetemplate.save.message.failure"), 3000); // No I18N
		}
		else if(result.message == "Dup Name") {
		    showFailureMessageAndClose(getMessageForKey("sdp.admin.changetemplate.name.duplicate.failure"), 3000); // No I18N
		}
		else {
		    showFailureMessageAndClose(getMessageForKey("sdp.admin.changetemplate.save.message.failure") + ": "+result.message, 3000); // No I18N
		}
    	if(result.message == "AuthError") {
    		parent.window.open('/AuthError.jsp', '_self');
    	}
    }
}
function validateTemplateForm()
{
    var name = trimAll(document.ChangeTemplateForm.tempName.value);

    //      var title = trimAll(document.ChangeTemplateForm.tempName.value);
    if(name==null || name=="")
    {
    	showDialog(document.getElementById("noTemplateNameDialog").innerHTML, "modal=yes, title=" + document.getElementById("noTemplateNameDialog").title,()=>{//No i18N
			document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateForm-15"]').addEventListener("click", function(event) { closeDialog(); document.ChangeTemplateForm.tempName.focus(); });//No i18N
		});
		return false;
    } else if(!isNaN(name)) {
    	showDialog(document.getElementById("numericTemplateNameDialog").innerHTML, "modal=yes, title=" + document.getElementById("numericTemplateNameDialog").title,()=>{//No i18N
			document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateForm-16"]').addEventListener("click", function(event) { closeDialog(); document.ChangeTemplateForm.tempName.focus(); });//No i18N
		});
		return false;
    }
    // set text value from HTML text
    // document.ChangeTemplateForm.title.value
    document.ChangeTemplateForm.tempName.value = name;

    return true;
}

function isChangeTemplateSiteChanged() {
	changeTemplateSiteIdNew = getSiteIdFromChangeTemplateForm();
	return (changeTemplateSiteId != changeTemplateSiteIdNew);
}

function isChangeTemplateGroupChanged() {
	changeTemplateGroupIdNew = getGroupIdFromChangeTemplateForm();
	return (changeTemplateGroupIdNew!=changeTemplateGroupId);
}



//----------------------------------------Change roles in change template------------------------------------------------------------------------

function showEditButton(obj)
{
	jQuery(obj).find('.editMandatoryButton').css('visibility','visible');//No I18N
}
function hideEditButton(obj)
{

	jQuery(obj).find('.editMandatoryButton').css('visibility','hidden');//No I18N
}



function showMandatoryOption(roleId,caller){
	var dimensions =FormDragDrop.getElementPosition(caller);
    var ps = $('PropertySheet_PH');//No I18N
    $('propertyID').value = "role_"+roleId;//No I18N
    ps.style.top  = dimensions.bottom+"px";
    ps.style.left = dimensions.left+"px";
    var cbox = $A($('PropertySheet_PH').getElementsByTagName('input')).find(function(item){return item.type == 'checkbox'});//No I18N
    cbox.checked = (changeTemplateRoles[roleId].mandatory=='true' || changeTemplateRoles[roleId].mandatory==true);
    cbox = null;
    ps.show();
}


function setPropertyForRoles(cbox){
	var pid = $('propertyID').value;//No i18N
    //var vname = $(pid).getAttribute('viewName');//No i18N
    //var field = Canvas.viewObjects[vname];
    var selected = cbox.checked;
    var roleId=pid.substr(5);
    // set value
    changeTemplateRoles[roleId].mandatory = selected;
    pushMandatoryChangeActionInUndoStack(roleId,selected);
    isChangeTemplateRoleSaved=false;

    if(cbox.name == 'MANDATORY'){
        //selected == true ? $('Man'+pid).show() : $('Man'+pid).hide();
        //var parent = $('Man' + pid).ancestors().first();        //No i18N
        if(selected == true) { showStar(pid); }
        else                 { hideStar(pid); }
    }


}

function showStar(elem){
	$(elem).getElementsByClassName('mandatory')[0].show();
}

function hideStar(elem){
	$(elem).getElementsByClassName('mandatory')[0].hide();
}

//var bHideRolePropertySheet = hideRolePropertySheet.bindAsEventListener();
/*
Event.observe(window, 'load', function() {
    Event.observe(document, 'mousedown', bHideRolePropertySheet);
});
*/

//contains SGT model datastructures (initialized in loadChangeTemplateRoles())
var SGT = null;

//JSON object for all role section data
var changeTemplateRoles = null;

//true if roles section is saved
var isChangeTemplateRoleSaved = true;

//maximum number of roles to be added to a template
var MAX_ROLES_IN_TEMPLATE = 20;

//number of roles currently added to template
var nChangeTemplateRoles = 0;

//Template id to copy roles from (default template in add mode, original template in duplicate mode)
var chgTpltCopyFromTid = null;

//------------ load/unload contents

function initChangeTemplateRoleComponents(callbacks) {
	if(callbacks.beforeInitComp) {
		callbacks.beforeInitComp.call();
	}
    document.getElementById("changeRolesList").innerHTML = "";
    document.getElementById("changeRolesCanvas_col1").innerHTML = "";
    document.getElementById("changeRolesCanvas_col2").innerHTML = "";

	//create components
	createChangeTemplateRolesList();
	createChangeTemplateRolesCanvas();
	handleFullCanvas();

	if(callbacks.onComplete) {
		callbacks.onComplete.call();
	}
	setSortablesHeight();
}

//loads roles section content from server and load on UI
function loadChangeTemplateRoles(callbacks) {
	if(changeTemplateRoles == null) {
		//initialize SGT model
		SGT = {
			"siteGrp": Canvas.sitGrp, //no i18n
			"siteTech": Canvas.siteTech, //no i18n
			"grpTech": Canvas.grpTech, //no i18n
			"techID_Name": Canvas.techID_Name //no i18n
		};

		//send AJAX request to get roles
		var newUrl = "/servlet/HdClientUtilServlet"; // No I18N
		var params = "";
	    params = params + "command=getTemplateRoles&"; // No I18N
	    var tid = document.ChangeTemplateForm.CHANGETEMPLATEID.value;
	    //in case of duplicate get roles from original template, not current one
	    //in case of add get roles from default template, not current one
	    if(chgTpltCopyFromTid != null) {
	    	tid = chgTpltCopyFromTid;
	    	isChangeTemplateRoleSaved = false;
	    }
	    if(tid!=null && tid!="null"){
	    	params = params + "templateID=" + encodeURIComponent(tid); // No I18N
	    }
	    var myAjax = new Ajax.Request(newUrl, {
			method: "get",//NO I18N
			parameters: params,
			onComplete: function(resp) {
				var respJSON = JSON.parse(resp.responseText) ;
		    	if(respJSON.message == "AuthError") {
			    	parent.window.open('/AuthError.jsp', '_self');
		    	} else {
					changeTemplateRoles = respJSON.roles;
					initChangeTemplateRoleComponents(callbacks);
		    	}
			}
		});
	} else {
		initChangeTemplateRoleComponents(callbacks);
	}
}

/*remove techs from techonly and sgt roles default value if they dont belong to configured site/group.
Similarly remove the groups from default values if they donot belong to the configured site in support group based role.*/

function checkChangeTemplateRoleTechSites(isSiteChanged) {
	var siteId = getSiteIdFromChangeTemplateForm();
	var groupId = getGroupIdFromChangeTemplateForm();
	//refer site
	if(SGT.siteTech.list[siteId] != undefined && SGT.siteTech.list[siteId][0] == -1) {
		siteId = 0;
	}
	//refer group
	if(SGT.grpTech.list[groupId] != undefined && SGT.grpTech.list[groupId][0] == -1 ){
		groupId = 0;
	}
	//delete unwanted techs/groups
	for(var roleid in changeTemplateRoles) {
		var toBeDeleted = [];
		if(changeTemplateRoles[roleid].techonly || changeTemplateRoles[roleid].isCoTech) {
			jQuery.each(changeTemplateRoles[roleid].users, function(index, userId) {
				if(userId != -1) {
					if(!isSiteContainsTech(siteId, userId)) {
						toBeDeleted.push(userId);
					}
					if(!isGroupContainsTech(groupId,userId) && changeTemplateRoles[roleid].isCoTech){
						toBeDeleted.push(userId);
					}
				}
			});

			changeTemplateRoles[roleid].users.remove(toBeDeleted);
			//Update UI
			jQuery("#select-role-" + roleid).select2("val", changeTemplateRoles[roleid].users); //no i18n
		}
		else if(changeTemplateRoles[roleid].isSupportGroup && changeTemplateRoles[roleid].groups !== undefined && isSiteChanged){
			jQuery.each(changeTemplateRoles[roleid].groups, function(index, groupId) {
				toBeDeleted.push(groupId);
			});
			changeTemplateRoles[roleid].groups.remove(toBeDeleted);
			//Update UI
			jQuery("#select-role-" + roleid).select2("data", changeTemplateRoles[roleid].groups); //no i18n
		}
			//if anything is deleted set saved false
			if(toBeDeleted.length > 0) {
				isChangeTemplateRoleSaved = false;
				saveRolesTriggerdBySiteChange = true;
			}
		}
	}

//----------- SGT related functions

//returns site id from change details form (0 if field not added or value not selected)
function getSiteIdFromChangeTemplateForm() {
	if(Canvas.viewObjects.SITEID == undefined //site is configured or not
			|| Canvas.viewObjects.SITEID.DEFAULTVALUE == undefined //site value is defined or not
			) {
		return 0;
	} else {
		return Canvas.viewObjects.SITEID.DEFAULTVALUE;
	}
}

//returns group id from change details form
function getGroupIdFromChangeTemplateForm() {
	if(Canvas.viewObjects.GROUPID == undefined //checks group is configured or not
			|| Canvas.viewObjects.GROUPID.DEFAULTVALUE == undefined  //group value is defined or not
			|| !Canvas.viewNames.include('GROUPID')	//NO I18N
			) {
		return 0;
	} else {
		return Canvas.viewObjects.GROUPID.DEFAULTVALUE;
	}

}


//return true if user contains in site
function isSiteContainsTech(siteId, userId) {
	return jQuery.inArray(parseInt(userId), SGT.siteTech.list[parseInt(siteId)]) >= 0;
}

//return true if user is present in the group
function isGroupContainsTech(groupId, userId) {
	return jQuery.inArray(parseInt(userId), SGT.grpTech.list[parseInt(groupId)]) >= 0;
}



//----------- ui

//returns HTML for drag link for a role that is not in canvas
function setChangeTemplateRoleDragLinkNode(node, roleid) {
	var role = changeTemplateRoles[roleid];
	var html = document.getElementById("dummyChangeRolesDragLink").innerHTML;
	html = html.replace(/ROLEID/g, roleid); //no i18n
	html = html.replace(/ROLENAME/g, encodeHTML(role.name.replace(/[$]/g, '$$$$'))); //no i18n
	node.innerHTML = html;
	node.className = 'truncate-ellipsis disp-ti';
	node.id = "role-" + roleid;
	node.roleid = roleid;
	node.querySelector('[sdpJs="js-event-ChangeTemplateRoleForm-5"]').addEventListener("mousedown", function(event) { onChangeRoleDragLinkDrag() });//No i18N
}
//returns HTML for field for a role that is in canvas
function setChangeTemplateRoleFieldNode(node, roleid) {
	var role = changeTemplateRoles[roleid];
	var html = document.getElementById("dummyChangeRolesField").innerHTML;
	html = html.replace(/ROLEID/g, roleid); //no i18n
	html = html.replace(/ROLENAME/g, encodeHTML(role.name.replace(/[$]/g, '$$$$'))); //no i18n
	node.innerHTML = html;
	node.id = "role-" + roleid;
	node.className = '';
	node.roleid = roleid;
	if(changeTemplateRoles[roleid].mandatory=="true" || changeTemplateRoles[roleid].mandatory==true){
		jQuery(node).find(".mandatory").css('display','inline');//No I18N
}
	let roleButton=node.querySelector('[sdpJs="js-event-ChangeTemplateRoleForm-7"]');//No i18N
	roleButton.addEventListener("mouseover", function(event) { showEditButton(this) });//No i18N
	roleButton.addEventListener("mouseout", function(event) { hideEditButton(this) });//No i18N
	node.querySelector('[sdpJs="js-event-ChangeTemplateRoleForm-10"]').addEventListener("click", function(event) { removeChangeTemplateRole(roleid) });//No i18N
	node.querySelector('[sdpJs="js-event-ChangeTemplateRoleForm-12"]').addEventListener("click", function(event) { showMandatoryOption(roleid,this) });//No i18N
}
//initialize select values for field for given role in canvas & initialize select2 component
function initChangeTemplateRoleSelect(roleid) {
	var role = changeTemplateRoles[roleid];
	var selectId = "select-role-" + roleid; //NO I18N


	var dropdownLength = 25;
	var params = null;
	var element;
	if(role.IsShareAllTech)
		{
		var siteId = getSiteIdFromChangeTemplateForm();
		element = technicianSelect.initializeSelect2({element : selectId, placeHolder : getMessageForKey("sdp.change.share.placeHolder"),multiple : true, siteId: siteId, value : role.users.toString(),"extraOptions":role.extraOptions});//No I18N
		}
	else if(role.techonly) {
		var siteId = getSiteIdFromChangeTemplateForm();
		element = technicianSelect.initializeSelect2({element : selectId, multiple : true, siteId: siteId,value : role.users.toString()});
	}
	else if(role.isCoTech) {
		var groupId = getGroupIdFromChangeTemplateForm();
		var siteId = getSiteIdFromChangeTemplateForm();
		element = technicianSelect.initializeSelect2({element : selectId, multiple : true, siteId: siteId, groupId: groupId,value : role.users.toString()});
	}

	else if(role.isSupportGroup)
	{
		var siteId = getSiteIdFromChangeTemplateForm();
		if(siteId == 0 || siteId == undefined){
			 siteId = -1;
		 }
		var params = '{"module" : "group", "dropdownLength" : "25","selectedSiteIds" : "'+siteId +'","selectAllGroups" : "true"}'; //NO I18N

		selectedData = role.groups;
	    updateSelect2Dropdown({ elementId : selectId,
			placeHolder : getMessageForKey("select2.groups.placeholder"),
			isMultiple : true,
			closeOnSelect: false,
			selectedData : selectedData,
			params: params,
			isOnChangeEventRequired:true
		});
	    element = jQuery(jQuery("#"+selectId)[0]);
		element.data('original-value',role.groupValue);//no I18N
	}
	else {
		if(isMSP){
			element = userSelect.initializeSelect2({element : selectId, multiple : true, value : role.users.toString(), fromModule : "changeTemplate"});//no i18n
		}
		else{
		element = userSelect.initializeSelect2({element : selectId, multiple : true, value : role.users.toString()});
	}
	}

	element.on("change", function(event) { //no i18n
		if(event.added != undefined) {
			pushChangeValueActionInChangeTemplateRoleUndoStack(roleid, event.added.id, null,role.groups,role.isSupportGroup);
			//add user id and name to user name list for future reference
		} else {
			pushChangeValueActionInChangeTemplateRoleUndoStack(roleid, null, event.removed.id,role.groups,role.isSupportGroup);
		}
		setSortablesHeight();
    });
}

//----------- UI initialization

//initialize role drag links list
function createChangeTemplateRolesList() {
	var ul = document.getElementById("changeRolesList");
	for(var roleid in changeTemplateRoles) {
		if(changeTemplateRoles[roleid].index == -1) {
			var li = document.createElement("li");
			setChangeTemplateRoleDragLinkNode(li, roleid);
			ul.appendChild(li);
		}
	}
	handleEmplyList();
}
//initialize canvas
function createChangeTemplateRolesCanvas() {
	//get all roles associated to template
	var roles = [];
	nChangeTemplateRoles = 0;
	for(var role in changeTemplateRoles) {
		if(changeTemplateRoles[role].index != -1) {
			roles[nChangeTemplateRoles++] = changeTemplateRoles[role];
		}
	}
	//put odd indexed roles on left column & even indexed roles on right column
	var ul1 = document.getElementById("changeRolesCanvas_col1");
	var ul2 = document.getElementById("changeRolesCanvas_col2");
	for(i = 0, len = nChangeTemplateRoles; i < len; ++i) {
		var role = roles[i];
		var li = document.createElement("li");
		setChangeTemplateRoleFieldNode(li, role.roleid);
		if(role.index % 2 == 0) {
			//pad with blank elements
			while(role.index/2 >= ul1.childNodes.length) {
				ul1.appendChild(document.createElement("li"));
			}
			//replace blank elements
			ul1.replaceChild(li, ul1.childNodes[role.index/2]);
		} else {
			//pad with blank elements
			while(role.index/2 >= ul2.childNodes.length) {
				ul2.appendChild(document.createElement("li"));
			}
			//replace blank elements
			ul2.replaceChild(li, ul2.childNodes[(role.index-1)/2]);
		}
		//initialize select2 component
		initChangeTemplateRoleSelect(role.roleid);
	}
	//Remove empty elements
	jQuery("#changeRolesCanvas_col1,#changeRolesCanvas_col2").find("li:empty").remove();
	//Show Info message if no roles configured yet
	if(roles.length == 0) {
		jQuery("#info_norolesconfigured").css("display", "block");		//NO I18N
	}
}


//----------- drag & drop

//Increases the sortable ul height to match the parent table height
function setSortablesHeight() {
	jQuery("#changeRolesCanvas_col1, #changeRolesCanvas_col2").height("100%");
	//jQuery("#changeRolesCanvas_col1, #changeRolesCanvas_col2").height(jQuery("#ctroles-rightpanel").height());
}

jQuery(function() {
	//initialize sortables
	jQuery("#changeRolesList, #changeRolesCanvas_col1, #changeRolesCanvas_col2").sortable({
		connectWith: "#changeRolesList, #changeRolesCanvas_col1, #changeRolesCanvas_col2", //no i18n
		placeholder: "emptyCellHover placeholder", //no i18n
		revert: true,
		//when dragging starts
		start: function(event, ui) {
			//start tracking field move action to push into undo stack
			startMoveActionForChangeTemplateRole(event, ui);//no i18n
			//disable select2 while dragging
			var roleid = ui.item[0].roleid;
			var select = document.getElementById("select-role-" + roleid);
			if(select != undefined) {
				jQuery(select).select2("enable", false) //no i18n
			}
		},
		//when field position changed
		update: function(event, ui) {
			//push last field move action into undo stack
			pushMoveActionInChangeTemplateRoleUndoStack(event, ui);
			handleEmplyList();
			handleFullCanvas();
			handleEmptyRoleCanvasInfo();
		},
		//when dragging stops
		stop: function(event, ui) {
			//fix for: remove button disabled when removed field while dragging
			//when dragging stops, reset undo/redo actions
			actionIncomplete = false;
			//re-enable select2 when dragging stops
			var roleid = ui.item[0].roleid;
			var select = document.getElementById("select-role-" + roleid);
			if(select != undefined) {
				jQuery(select).select2("enable", true) //no i18n
			}
		},
		change: function(event, ui) {
			setSortablesHeight();
		}
	});
	//when field is removed from list
	jQuery("#changeRolesList").on("sortremove", function(event, ui) { // no i18n
		//change role HTML to field
		var roleid = ui.item[0].roleid;
		setChangeTemplateRoleFieldNode(ui.item[0], roleid);
		initChangeTemplateRoleSelect(roleid);
		//calculate number of roles in canvas
		nChangeTemplateRoles++;
	});
	//when field is added to list
	jQuery("#changeRolesList").on("sortreceive", function(event, ui) { // no i18n
		//change role HTML to drag link
		var roleid = ui.item[0].roleid;
		setChangeTemplateRoleDragLinkNode(ui.item[0], roleid);
		//calculate number of roles in canvas
		nChangeTemplateRoles--;
	});

	//disable selection for lists
	jQuery("#changeRolesList, #changeRolesCanvas_col1, #changeRolesCanvas_col2, #addNewRoleLink").disableSelection();
});


//-----------save

//gets roles field indices from GUI to JSON object to be sent to server
function getChangeTemplateRolesFieldIndicesFromUI() {
	for(var roleid in changeTemplateRoles) {
		changeTemplateRoles[roleid].index = -1;
	}
	//even indices for left column
	var children = document.getElementById("changeRolesCanvas_col1").childNodes;
	jQuery.each(children, function(index, node) {
		if(node.id != undefined && node.id.startsWith("role-")) {
			var roleid = node.roleid;
			changeTemplateRoles[roleid].index = index * 2;
		}
	});
	//odd indices for right column
	children = document.getElementById("changeRolesCanvas_col2").childNodes;
	jQuery.each(children, function(index, node) {
		if(node.id != undefined && node.id.startsWith("role-")) {
			var roleid = node.roleid;
			changeTemplateRoles[roleid].index = index * 2 + 1;
		}
	});
}
//gets roles field values from GUI to JSON object to be sent to server
function getChangeTemplateRolesFieldValuesFromUI() {
	for(var roleid in changeTemplateRoles) {
		var isGroup = changeTemplateRoles[roleid].isSupportGroup;
		if(changeTemplateRoles[roleid].index != -1) {
			var val = jQuery("#select-role-" + roleid).select2("val"); //no i18n
			if(!isGroup){
			var users = [];
			//remove duplicate values
			jQuery.each(val, function(userIdIndex, userId) {
				if(jQuery.inArray(userId, users) < 0) {
					users[users.length] = userId;
				}
			});
			changeTemplateRoles[roleid].users = users;
			}
		  else{
			  var selectedGroups = jQuery("#select-role-" + roleid).select2('data');//No i18n
			  changeTemplateRoles[roleid].groups = selectedGroups ;
		  }
		} else {
			if(!isGroup){
			changeTemplateRoles[roleid].users = [];
			}
			else{
			changeTemplateRoles[roleid].groups = [];
			}
		}
	}
}

function updateChangeTemplateRoleJSON() {
	getChangeTemplateRolesFieldIndicesFromUI();
	getChangeTemplateRolesFieldValuesFromUI();
}

//saves content of roles section to database
function saveChangeTemplateRole(tabChanged) {
	//check if saved
	if(isChangeTemplateRoleSaved) {
		showFailureMessageAndClose(getMessageForKey("sdp.admin.change.template.changesAlreadySaved"), 3000); // No I18N
    		if(tabChanged) {
    			changeChgTpltTabs(); //move to clicked tab
    		}
		return;
	}

	//synchronize JSON to be sent with values in GUI
	updateChangeTemplateRoleJSON();

	//sent AJAX request to save to server
	var newUrl = "/servlet/HdClientUtilServlet"; // No I18N
	var params = "";
    params = params + "command=updateTemplateRoles&"; // No I18N
    var tid = document.ChangeTemplateForm.CHANGETEMPLATEID.value;
    params = params + "templateID=" + encodeURIComponent(tid) + "&"; // No I18N
    var rolesStr =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(changeTemplateRoles) : JSON.stringify(changeTemplateRoles) ; //NO I18N
    rolesStr = escapeJSONString(rolesStr);
	params = params + "changeTemplateRoles=" + encodeURIComponent(rolesStr) + "&"; // No I18N
    var myAjax = new Ajax.Request(newUrl, {
		method: "post", //NO I18N
		parameters: params,
		onComplete: function(resp) {
		    var result = JSON.parse(resp.responseText) ;
		    if(result.status == "success") {
		    	isChangeTemplateRoleSaved = true;
		    	clearChangeTemplateRoleUndoStack();
		    	clearChangeTemplateRoleRedoStack();
		    	if (saveRolesTriggerdBySiteChange) {
		    		showMessageAndClose(getMessageForKey("sdp.admin.change.template.detailsandroles.save.success"), 3000); // No I18N
		    	} else {
		    		showMessageAndClose(getMessageForKey("sdp.admin.change.template.rolesSaveSuccess"), 3000); // No I18N
		    	}
		    	if(tabChanged) {
		    		changeChgTpltTabs(); //move to clicked tab
		    	}
		    } else {
		    	showFailureMessageAndClose(getMessageForKey("sdp.admin.change.template.rolesSaveFailure") + ": "+result.message, 3000); // No I18N
		    	if(result.message == "AuthError") {
		    		parent.window.open('/AuthError.jsp', '_self');
		    	}
		    }
		    saveRolesTriggerdBySiteChange = false;
		}
	});
}
//-------------Undo, Redo

//when an action is performed, it is pushed into UndoStack
//when undo is performed an action is pushed into RedoStack from UndoStack.
var changeTemplateRoleUndoStack = [];

//when redo is performed an action is pushed into UndoStack from RedoStack.
//when an action is performed RedoStack is cleared
var changeTemplateRoleRedoStack = [];

//actionid is used to handle case of remove and receive events of same event.
//when a move starts, ie when a field is removed actionid is incremented and set to that action. (startMoveActionForChangeTemplateRole)
//when a move ends if actionid is same as last action then last last action is replaced (pushMoveActionInChangeTemplateRoleUndoStack)
var changeTemplateRoleCanvasActionId = 0;

//is true only when dragging of an element starts. Used for removing misbehaviuor when dragging holding the remove button
var actionIncomplete = false;

//starts tracking field move action to push into undo stack
function startMoveActionForChangeTemplateRole(event, ui) {
	ui.item.data("actionId", changeTemplateRoleCanvasActionId++);//no i18n
	ui.item.data("fromIndex", ui.item.index());//no i18n
	ui.item.data("fromList", event.target.id);//no i18n
	ui.item.data("roleid", ui.item[0].roleid);//no i18n
	ui.item.data("val", jQuery("#select-role-" + ui.item[0].roleid).select2("val"));//no i18n
	actionIncomplete = true;
}
//pushes a field move action into undo stack
function pushMoveActionInChangeTemplateRoleUndoStack(event, ui) {
	var action = {
		"actionType": "move", //no i18n
		"roleid": ui.item.data("roleid"), //no i18n
		"actionId": ui.item.data("actionId"), //no i18n
		"fromList": ui.item.data("fromList"), //no i18n
		"fromIndex": ui.item.data("fromIndex"), //no i18n
		"toList": event.target.id, //no i18n
		"toIndex": ui.item.index(), //no i18n
		"val": ui.item.data("val") //no i18n
	};
	if(changeTemplateRoleUndoStack.length > 0 && changeTemplateRoleUndoStack.last().actionId == action.actionId) {
		changeTemplateRoleUndoStack[changeTemplateRoleUndoStack.length - 1] = action;
	} else {
		changeTemplateRoleUndoStack[changeTemplateRoleUndoStack.length] = action;
	}
	//clear redo stack when a new action is performed
	clearChangeTemplateRoleRedoStack();
	isChangeTemplateRoleSaved = false;
	actionIncomplete = false;
	updateChangeTemplateRoleJSON();
}
//pushes a field remove action into undo stack
function pushRemoveActionInChangeTemplateRoleUndoStack(roleid, fromList, fromIndex, val) {
	var action = {
			"actionType": "move", //no i18n
			"roleid": roleid, //no i18n
			"fromList": fromList, //no i18n
			"fromIndex": fromIndex, //no i18n
			"toList": "changeRolesList", //no i18n
			"toIndex": document.getElementById("changeRolesList").childNodes.length - 1, //no i18n
			"val": val //no i18n
	};
	changeTemplateRoleUndoStack[changeTemplateRoleUndoStack.length] = action;
	//clear redo stack when a new action is performed
	clearChangeTemplateRoleRedoStack();
	isChangeTemplateRoleSaved = false;
	actionIncomplete = false;
	updateChangeTemplateRoleJSON();
}

//pushes a mandatory option change into undo stack
function pushMandatoryChangeActionInUndoStack(roleid,newMandatory){
	var action={
		"actionType" : "mandatory change",//No I18N
		"roleid" : roleid,//No I18N
		"newMandatory" : newMandatory,//No I18N
	};
	changeTemplateRoleUndoStack[changeTemplateRoleUndoStack.length] = action;
	//clear redo stack when a new action is performed
	clearChangeTemplateRoleRedoStack();
	isChangeTemplateRoleSaved = false;
	actionIncomplete = false;
}

//pushes a field value change action into undo stack
function pushChangeValueActionInChangeTemplateRoleUndoStack(roleid, added, removed,groups,isSupportGroup) {
	var action = {
		"actionType": "change value", //no i18n
		"roleid": roleid, //no i18n
		"added": added, //no i18n
		"removed": removed, //no i18n
	    "groups" : groups,//no i18n
	    "isSupportGroup" : isSupportGroup //no i18n
	};
	changeTemplateRoleUndoStack[changeTemplateRoleUndoStack.length] = action;
	//clear redo stack when a new action is performed
	clearChangeTemplateRoleRedoStack();
	isChangeTemplateRoleSaved = false;
	actionIncomplete = false;
	updateChangeTemplateRoleJSON();
}

//remove a role from canvas
//LOGIC: field style is backed up.
//       when the puff effect for deletion is finished the element is moved from canvas to list
//       and previous style is restored as puff leaves display and position styles changed
function removeChangeTemplateRole(roleid) {
	if(!actionIncomplete) {
		var node = document.getElementById("role-" + roleid);
		var val = jQuery("#select-role-" + roleid).select2("val"); //no i18n
		if (changeTemplateRoles[roleid].isSupportGroup) {
		    val = jQuery("#select-role-" + roleid).select2("data"); //no i18n
		}
		//puff effect
		Effect.Puff(node.id, {
			duration: 0.5,
			afterFinish: function(effect) { //remove node on effect finish
				var fromList = node.parentNode.id;
				var fromIndex = [].indexOf.call(node.parentNode.childNodes, node);
				//remove field from canvas
				document.getElementById("changeRolesList").appendChild(node);
				//change role HTML to drag link
				setChangeTemplateRoleDragLinkNode(node, roleid);
				//calculate number of roles in canvas
				nChangeTemplateRoles--;
				//push this remove action to undo stack
				pushRemoveActionInChangeTemplateRoleUndoStack(roleid, fromList, fromIndex, val);
				actionIncomplete = false;
				//reset node style
				node.style.display = "block"; //NO I18N
				//remove "No roles avilable" text
				handleEmplyList();
				handleFullCanvas();
				setSortablesHeight();
				handleEmptyRoleCanvasInfo();
			}
		});
	}
}

//returns true if it is possible to undo a action
function isChangeTemplateRoleUndoAvailable() {
	if(changeTemplateRoleUndoStack.length > 0) {
		return true;
	}
	return false;
}
//undoes last action
function undoChangeTemplateRole() {
	if(isChangeTemplateRoleUndoAvailable()) {
		//last action in undo stack is moved to redo stack
		var action = changeTemplateRoleUndoStack.last();
		if(action.actionType == "move") {
			//----move field
			var existingNode;
			//get which node to be moved
			var newNode = document.getElementById(action.toList).childNodes[action.toIndex];
			//get where to move
			if(action.fromList == action.toList && action.fromIndex > action.toIndex) {
				//if moved from bottom to top of same list
				existingNode = document.getElementById(action.fromList).childNodes[action.fromIndex + 1];
			} else {
				//if moved from top to bottom of same list
				existingNode = document.getElementById(action.fromList).childNodes[action.fromIndex];
			}
			//move the node
			if(action.fromIndex < document.getElementById(action.fromList).childNodes.length) {
				//insert node anywhere but end of the list
				document.getElementById(action.fromList).insertBefore(newNode, existingNode);
			} else {
				//insert at end of list
				//insertBefore() can"t insert at end of list in ie8
				document.getElementById(action.fromList).appendChild(newNode);
			}

			//----change inner HTML of field as needed
			if(action.fromList == "changeRolesList") { //no i18n
				var roleid = document.getElementById(action.fromList).childNodes[action.fromIndex].roleid;
				setChangeTemplateRoleDragLinkNode(document.getElementById(action.fromList).childNodes[action.fromIndex], roleid);
				nChangeTemplateRoles--;
			} else if(action.toList == "changeRolesList") { //no i18n
				var roleid = document.getElementById(action.fromList).childNodes[action.fromIndex].roleid;
				setChangeTemplateRoleFieldNode(document.getElementById(action.fromList).childNodes[action.fromIndex], roleid);
				initChangeTemplateRoleSelect(roleid);
				nChangeTemplateRoles++;
			}

			//----restore field value
			if (changeTemplateRoles[roleid].isSupportGroup) {
			    jQuery("#select-role-" + action.roleid).select2("data", action.val); //no i18n
			}
			else {
			    jQuery("#select-role-" + action.roleid).select2("val", action.val); //no i18n
			}
		}
		else if(action.actionType == "change value") { //no i18n
			var val = jQuery("#select-role-" + action.roleid).select2("val"); //no i18n
			var data = jQuery("#select-role-" + action.roleid).select2("data"); //no i18n
			if(action.added != null) {
				if(action.isSupportGroup == false){
					val.remove([action.added]);
					jQuery("#select-role-" + action.roleid).select2("val",val); //no i18n
				}
				else{
					//action.groups value is updated for use in redo.
					action.groups = jQuery("#select-role-" + action.roleid).select2("data"); //no i18n
					var newData = data.filter(function(group) {
						   return group.id != action.added;
						});
					jQuery("#select-role-" + action.roleid).select2('data', newData); //no i18n

				}
			}
			else {
				if(action.isSupportGroup == false){
					val[val.length] = action.removed;
					jQuery("#select-role-" + action.roleid).select2("val",val); //no i18n
				}
				else{
					for(var j=0;j<action.groups.length;j++){
					if(action.removed == action.groups[j].id){
						data.push({"id":action.removed,"text":action.groups[j].text});
					  	}
					}
					jQuery("#select-role-" + action.roleid).select2('data', data); //no i18n
					//action.groups value updated for use in redo.
					action.groups = jQuery("#select-role-" + action.roleid).select2("data"); //no i18n
				}

			}
		} else if(action.actionType=="mandatory change"){//No I18N
			if(action.newMandatory=="false" || action.newMandatory==false){
				showStar("role_"+action.roleid);//No I18N
				action.newMandatory=true;
			}
			else if(action.newMandatory=="true" || action.newMandatory==true){
				hideStar("role_"+action.roleid);//No I18N
				action.newMandatory=false;
		}
			var cbox = $A($('PropertySheet_PH').getElementsByTagName('input')).find(function(item){return item.type == 'checkbox'});//No I18N
		    cbox.checked = (changeTemplateRoles[action.roleid].mandatory=='true' || changeTemplateRoles[action.roleid].mandatory==true);
		    cbox = null;
		}
		changeTemplateRoleRedoStack[changeTemplateRoleRedoStack.length] = action;
		changeTemplateRoleUndoStack.remove([changeTemplateRoleUndoStack.last()]);
		isChangeTemplateRoleSaved = false;

		handleChangeTemplateRolesUndoRedoButtonState();
		updateChangeTemplateRoleJSON();
		handleEmplyList();
		handleFullCanvas();
		handleEmptyRoleCanvasInfo();
	}
}
function undoAllChangeTemplateRole() {
	while(changeTemplateRoleUndoStack.length > 0) {
		undoChangeTemplateRole();
	}
}
//clear undo stack
function clearChangeTemplateRoleUndoStack() {
	changeTemplateRoleUndoStack.clear();
	handleChangeTemplateRolesUndoRedoButtonState();
}

//returns true if it is possible to redo a action
function isChangeTemplateRoleRedoAvailable() {
	if(changeTemplateRoleRedoStack.length > 0) {
		return true;
	}
	return false;
}
//redoes last action
function redoChangeTemplateRole() {
	if(isChangeTemplateRoleRedoAvailable()) {
		//last action in redo stack is moved to undo stack
		var action = changeTemplateRoleRedoStack.last();

		if(action.actionType == "move") {
			//----move field
			var existingNode;
			//get which node to be moved
			var newNode = document.getElementById(action.fromList).childNodes[action.fromIndex];
			//get where to move
			if(action.fromList == action.toList && action.fromIndex < action.toIndex) {
				//if moved from bottom to top of same list
				existingNode = document.getElementById(action.toList).childNodes[action.toIndex + 1];
			} else {
				//if moved from top to bottom of same list
				existingNode = document.getElementById(action.toList).childNodes[action.toIndex];
			}
			//move the node
			if(action.toIndex < document.getElementById(action.toList).childNodes.length) {
				//insert node anywhere but end of the list
				document.getElementById(action.toList).insertBefore(newNode, existingNode);
			} else {
				//insert at end of list
				//insertBefore() can"t insert at end of list in ie8
				document.getElementById(action.toList).appendChild(newNode);
			}

			//----change inner HTML of field as needed
			if(action.fromList == "changeRolesList") { //no i18n
				var roleid = document.getElementById(action.toList).childNodes[action.toIndex].roleid;
				setChangeTemplateRoleFieldNode(document.getElementById(action.toList).childNodes[action.toIndex], roleid);
				initChangeTemplateRoleSelect(roleid);
				nChangeTemplateRoles++;
			} else if(action.toList == "changeRolesList") { //no i18n
				var roleid = document.getElementById(action.toList).childNodes[action.toIndex].roleid;
				setChangeTemplateRoleDragLinkNode(document.getElementById(action.toList).childNodes[action.toIndex], roleid);
				nChangeTemplateRoles--;
			}

			//----restore field value
			if (changeTemplateRoles[roleid].isSupportGroup) {
            	jQuery("#select-role-" + action.roleid).select2("data", action.val); //no i18n
            }
            else {
			    jQuery("#select-role-" + action.roleid).select2("val", action.val); //no i18n
			}
		} else if(action.actionType == "change value") { //no i18n
			var val = jQuery("#select-role-" + action.roleid).select2("val"); //no i18n
			var data = jQuery("#select-role-" + action.roleid).select2("data");// no i18n
			if(action.added != null) {
				if(action.isSupportGroup == false){
					val[val.length] = action.added;
					jQuery("#select-role-" + action.roleid).select2("val",val); //no i18n
					}
				else{
					for(var j=0;j<action.groups.length;j++){
						if(action.added == action.groups[j].id){
							data.push({"id":action.added,"text":action.groups[j].text});
						}
					}
					jQuery("#select-role-" + action.roleid).select2('data', data); //no i18n
				}
			}
			else {
				if(action.isSupportGroup == false){
					val.remove([action.removed]);
					jQuery("#select-role-" + action.roleid).select2("val",val); //no i18n
				}
				else{
					var newData = data.filter(function(group) {
						return group.id != action.removed;
					});
					jQuery("#select-role-" + action.roleid).select2('data', newData); //no i18n
				}
			}
		} else if(action.actionType=="mandatory change"){//No I18N
			if(action.newMandatory=="false" || action.newMandatory==false){
				showStar("role_"+action.roleid);//No I18N
				action.newMandatory=true;
		}
			else if(action.newMandatory=="true" || action.newMandatory==true){
				hideStar("role_"+action.roleid);//No I18N
				action.newMandatory=false;
			}
			var cbox = $A($('PropertySheet_PH').getElementsByTagName('input')).find(function(item){return item.type == 'checkbox'});//No I18N
		    cbox.checked = (changeTemplateRoles[action.roleid].mandatory=='true' || changeTemplateRoles[action.roleid].mandatory==true);
		    cbox = null;
		}
		changeTemplateRoleUndoStack[changeTemplateRoleUndoStack.length] = action;
		changeTemplateRoleRedoStack.remove([changeTemplateRoleRedoStack.last()]);
		isChangeTemplateRoleSaved = false;

		handleChangeTemplateRolesUndoRedoButtonState();
		updateChangeTemplateRoleJSON();
		handleEmplyList();
		handleFullCanvas();
		handleEmptyRoleCanvasInfo();
	}
}
//clear redo stack
function clearChangeTemplateRoleRedoStack() {
	changeTemplateRoleRedoStack.clear();
	handleChangeTemplateRolesUndoRedoButtonState();
}

//discards all changes in change roles section
function discardAllChangesInChangeTemplateRoles() {
	undoAllChangeTemplateRole();
	clearChangeTemplateRoleUndoStack();
	clearChangeTemplateRoleRedoStack();
	isChangeTemplateRoleSaved = true;
}

//------------------- ui change

//changes undo/redo enable/disable button state based on current possibility of undo/redo
function handleChangeTemplateRolesUndoRedoButtonState() {
	//undo
	if(isChangeTemplateRoleUndoAvailable()) {
		//enable
		document.getElementById("roles-undoEnable").style.display = ""; //no i18n
		document.getElementById("roles-undoDisable").style.display = "none"; //no i18n
	} else {
		//disable
		document.getElementById("roles-undoEnable").style.display = "none"; //no i18n
		document.getElementById("roles-undoDisable").style.display = ""; //no i18n
	}
	//redo
	if(isChangeTemplateRoleRedoAvailable()) {
		//enable
		document.getElementById("roles-redoEnable").style.display = ""; //no i18n
		document.getElementById("roles-redoDisable").style.display = "none"; //no i18n
	} else {
		//disable
		document.getElementById("roles-redoEnable").style.display = "none"; //no i18n
		document.getElementById("roles-redoDisable").style.display = ""; //no i18n
	}
}

//enable/disable "No Roles available" text checking if field list is empty or not
function handleEmplyList() {
	if(document.getElementById("changeRolesList").childNodes.length <= 0) {
		document.getElementById("textNoRolesAvailable").style.display = "";
		document.getElementById("textAvailableRoles").style.display = "none";
	} else {
		document.getElementById("textNoRolesAvailable").style.display = "none";
		document.getElementById("textAvailableRoles").style.display = "";
	}
}

function handleFullCanvas() {
	if(nChangeTemplateRoles >= MAX_ROLES_IN_TEMPLATE) {
		jQuery("#changeRolesList").sortable("option", "disabled", true); // no i18n
	} else {
		jQuery("#changeRolesList").sortable("option", "disabled", false); // no i18n
	}
}

function handleEmptyRoleCanvasInfo() {
	if(document.getElementById("changeRolesCanvas_col1").childNodes.length <= 0
			&& document.getElementById("changeRolesCanvas_col2").childNodes.length <= 0) {
		jQuery("#info_norolesconfigured").show(800);
	} else {
		jQuery("#info_norolesconfigured").hide(800);
	}
}

//called when dragging roles dragLink
function onChangeRoleDragLinkDrag() {
	if(nChangeTemplateRoles >= MAX_ROLES_IN_TEMPLATE) {
		showDialog(document.getElementById("rolesCanvasFullDialog").innerHTML, "modal=yes, title=" + document.getElementById("rolesCanvasFullDialog").title,()=>{//No i18N
			document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateRoleForm-16"]').addEventListener("click", function(event) { closeDialog(); document.ChangeTemplateForm.tempName.focus(); });//No i18N
		});
	}
}

//-------------------- common functions

function escapeJSONString(str) {
	str = str.replace(/&quot;/g, '\\\"'); // No I18N
    str = str.replace(/&#39;/g, '\\\"'); // No I18N
    str = str.replace(/#/g, '@@hash@@'); // No I18N
    str = str.replace(/&/g, '@@ampersand@@'); // No I18N
    str = str.replace(/%/g, '@@percentage@@'); // No I18N
    str = str.replace(/</g, '@@leftarrow@@'); // No I18N
    str = str.replace(/>/g, '@@rightarrow@@'); // No I18N
    str = str.replace(/\?/g, '@@question@@'); // No I18N
    return str;
}

function showAddStatusRow(id)
{


    jQuery("#operation_status").html("");
    jQuery("#ispro").val("false");
    var newUrl = '/servlet/CmClientUtilServlet';//NO I18N
    var params = 'command=getDefaultStatus_TemplateInfo';//NO I18N
    var myAjax = new Ajax.Request(newUrl, {
method: 'get',//NO I18N
parameters: params,
onComplete: function(resp, jsonObj){ successHdlrForAddStatusInfo(resp,id); }
});
}
function successHdlrForAddStatusInfo(resp,id)
{
	id = Number(id);
    var browser = navigator.appName;
    var result = JSON.parse(resp.responseText) ;

    var subject = decodeURIComponent(result.subject);
    var desc = decodeURIComponent(result.message);
    jQuery("#currentstage").val(id);
    jQuery("#mode").val("add");//NO I18N
    jQuery("#notifyto").val("");//NO I18N
    // closing other addboxes
    if(jQuery("#openedaddrow").val() == "")
    {
	jQuery("#openedaddrow").val(id);
    }
    else
    {
	var openedrow = jQuery("#openedaddrow").val();
	jQuery("#addrow_"+openedrow)[0].style.display="none";
	jQuery("#addbutton_"+openedrow)[0].style.display = "";
	jQuery("#openedaddrow").val(id);
    }
    /*      if(jQuery("div[name='addrows']:visible")[0] != null)
	    {
	    var stageid = jQuery("div[name='addrows']:visible")[0].id;
	    jQuery("div[name='addrows']:visible")[0].style.display = "none";
	    var sid = stageid.split("_");
	    jQuery("#addbutton_"+sid[1])[0].style.display = "";
	    }*/
    // closing other editboxes
    if(jQuery("div[name='editrows']:visible")[0] != null)
    {
	var statusids = jQuery("div[name='editrows']:visible")[0].id;
	jQuery("div[name='editrows']:visible")[0].style.display = "none";
	var sid = statusids.split("_");
	jQuery("#detailsrow_"+sid[1])[0].style.display = "";
    }
    /*      if(browser == "Netscape")
	    {
	    setTimeout(function(){ jQuery("#HTMLDesc").html(desc);},1000);

	    }
	    else
	    {
	    setTimeout(function(){ jQuery("#HTMLDesc").val(desc);},1000);
	    }*/
	jQuery("#addbutton_"+id).fadeOut("fast",function(){//NO I18N
	jQuery("#addrow_"+id).fadeIn("slow");//NO I18N
	jQuery("#addrow_"+id).addClass("stagestatus-editform");
	jQuery("#addrow_"+id).html(jQuery("#editblock").html());
    /*jQuery("#addrow_"+id).html(jQuery("#editblock").html());
    jQuery("#addbutton_"+id).fadeOut("fast",function(){//NO I18N
		jQuery("#addrow_"+id).addClass("stagestatus-editform");
	    jQuery("#addrow_"+id).fadeIn("slow");//NO I18N*/
	    var title = getMessageForKey("sdp.setup.stage.add");//NO I18N
	    //jQuery(".stgedithdr").html(title);
		jQuery(".stagestatus-editform-h").html(title);
	    var adddiv = "addrow_"+id;//NO I18N
	    jQuery("input[name='subject']:visible")[0].value = subject;
	    $(adddiv).getElementsByTagName("textarea")[2].id = "HTMLDescAdd_"+id;
	    zeditor({element:"HTMLDescAdd_"+id,edithtml:true,isEnterKeyHandler:true,resize:true,inlineimagesAPI: "/api/v3/user_notification_templates/images"});//NO I18N
	    setTimeout(function() {
	    	jQuery(parent.editor.iframe.contentWindow.document.body).on('mousedown', function() {
	    		msgconvar();
	    	})
	    }, 1000);
	    setTimeout(function(){
		jQuery("input[name='statusname']:visible")[0].focus();
		parent.editor.setHTML(desc);
		}, 1000);
	    setTimeout(function(){init_change_textComplete();},400);
	    });
}
function addUsersForChangeNotification(notName) {

		var mode = 'add'; // No I18N
		var values, ids, url;
		if(notName == "ChangeClosed") {
			values = document.ChangeNotForm.ChangeClosed_UserDisplay.value;
			ids = document.ChangeNotForm.ChangeClosed_USERS.value;
			url = '/SearchItem.do?criteria=Technician Name&element1=document.ChangeNotForm.ChangeClosed_UserDisplay&element2=document.ChangeNotForm.ChangeClosed_USERS&from=escalate&type=Change'; // No I18N
		}
		else if(notName == "ChangeCreated") {
			document.ChangeNotForm.ChangeCreated_UserDisplay.value;
			ids = document.ChangeNotForm.ChangeCreated_USERS.value;
			url = '/SearchItem.do?criteria=Technician Name&element1=document.ChangeNotForm.ChangeCreated_UserDisplay&element2=document.ChangeNotForm.ChangeCreated_USERS&from=escalate&type=Change'; // No I18N
		}
		if(values!=null && values!='' && ids!=null && ids!='')
		{
			mode = 'edit'; // No I18N
		}
		if(isMSP){
	  	        url = url + '&WF_ACCOUNTID=0&WFfromNotificationRulesPage=MSPtrue';      // No i18n
	  	}
		url = url + '&mode=' + mode; // No I18N

		NewWindow(url,'selectitem','320','350','yes','center'); // No I18N
	}

function checkChangeNotifications(formObj) {

		if(formObj.ChangeCreated.checked == true || formObj.ChangeCreated_SMS.checked == true) {
			if(formObj.ChangeCreated_USERS.value == "" && formObj.ChangeCreated_SMS_USERS.value == "") {
				alert(getMessageForKey("sdp.admin.changenotification.techchoose.newchange.js"));
				return false;
			}
			else if (formObj.ChangeCreated_USERS.value == "") {
				formObj.ChangeCreated_USERS.value = formObj.ChangeCreated_SMS_USERS.value;

			}
			else {
				formObj.ChangeCreated_SMS_USERS.value = formObj.ChangeCreated_USERS.value;
			}
		}
		if(formObj.ChangeCreated_SMS.checked == true) {
			formObj.ChangeCreated_SMS_USERS.value = formObj.ChangeCreated_USERS.value
				formObj.ChangeCreated_SMS_UserDisplay.value = formObj.ChangeCreated_UserDisplay.value
		}
		if(formObj.ChangeClosed.checked == true) {
			if(formObj.ChangeClosed_USERS.value == "") {
				alert(getMessageForKey("sdp.admin.changenotification.techchoose.changeclosed.js"));
				return false;
			}
		}
		invokeProgressIndicator(null, "sdp.common.processing"); // No I18N
		formObj.submit();
	}
function validateCABForm(formObj) {

		var name = formObj.NAME.value;
		if(trimAll(name) == "") {
			alert(getMessageForKey("sdp.setup.cab.name"));
			return false;
		}
		formObj.NAME.value = trimAll(name);
		var options = formObj.CABUSERS.options;

		var present = false;
		for(var cnt=0; cnt < options.length; cnt++) {
			if(options[cnt].selected == true) {
				present = true;
			}
		}
		if(!present) {
			alert(getMessageForKey("sdp.setup.cab.user"));
			return false;
		}
		return true;
	}
/*
 * Admin: On Saving Change Closure Rules.
 */
function updateChangeClosureRules()
{
	//Object to hold closure rules enabled/disabled status.
	var closurefields={};
	//Ready the enabled/disabled status of closure rules.
	var closure_rules = jQuery('form[name="ClosingRules"] :checkbox');
	for(var i=0;i<closure_rules.length;i++)
	{
		var fieldName = closure_rules[i].name;
		fieldName = fieldName.replace('change_closure_', '');	//NO I18N
		closurefields[fieldName]=closure_rules[i].checked;
	}
	var ajaxData="command=updateCloseMandFields&closure_rules="+JSON.stringify(closurefields); //NO I18N
	jQuery.ajax({
		url:"/servlet/CmClientUtilServlet",	// No I18N
		type:"POST",	// No I18N
		data:"command=updateCloseMandFields&closure_rules="+ ((typeof sdpToJSON != 'undefined') ? sdpToJSON(closurefields) : JSON.stringify(closurefields))  , // No I18N
		dataType:"json" // No I18N
	}).done(function(data){
		showMessageAndClose(encodeHTML(data.message), 3000);
	}).fail(function(jqXHR){
		var errorMsg = JSON.parse(jqXHR.responseText).message;
		showFailureMessageAndClose(encodeHTML(errorMsg), 3000);
	});
}
/* changeworkflow start */

function successHdlrForEditCommonList(resp,module)
{
    var result = JSON.parse(resp.responseText) ;
    if(result.status == "success")
    {
	var id = result.id;
	if(jQuery("div[name='editrow']:visible")[0] != null)
	{
	    var ids = jQuery("div[name='editrow']:visible")[0].id;
	    var rowid = ids.split("_");
	    jQuery("div[name='editrow']:visible")[0].style.display = "none";
	    jQuery("#edit_"+rowid[1]).html("");
	    document.getElementById("Row_"+rowid[1]).style.display = "";
	}
	document.getElementById("addboxrow").style.display = "none";
	var count = document.getElementById("rowcount").value;
	if(jQuery("#btmaddbutton")[0] != null && count >=7)
	{
		jQuery("#btmaddbutton").fadeOut("slow");//NO I18N
	}
	var val = jQuery('#addboxrow').html();
	jQuery("#edit_"+id).html(val)
	jQuery("#Row_"+id).fadeOut("slow",function(){//NO I18N
	jQuery("#edit_"+id).fadeIn("slow");//NO I18N
	var stageIndexArray = Object.keys(stageIndexMapping);
		if(module == "changeroles")
		{
		if(result.usertype == "ALL")
		{
		 jQuery("#edit_"+id).find('input:radio[name=usertype]')[0].checked="true";
		 }
		else if(result.usertype == "TECH")
		{
		 jQuery("#edit_"+id).find('input:radio[name=usertype]')[1].checked="true";
		}
		else if(result.usertype == "COTECH")
		{
			jQuery("#edit_"+id).find('input:radio[name=usertype]')[2].checked="true";
		}
		else if(result.usertype == "SUPGRP")
		{
			jQuery("#edit_"+id).find('input:radio[name=usertype]')[3].checked="true";
		}
		jQuery('#edit_'+id).find('#currusertype').val(result.usertype);
			//submission view is enabled
			var submissionStageId = stageIndexMapping[1].id;
		var txt = "";
		var defaulttxt = "";
		var internalName = result.internalName;
		if(internalName == "ChangeManager")
		{
			txt = getMessageForKey("sdp.admin.changerole.changemanager.defaulttext");
			// static text will be removed after confirming this text
			defaulttxt = getMessageForKey("sdp.admin.change.roles.playedby")+" "+txt;//NO I18N
		     jQuery("#edit_"+id).find("#userTypeVal").html(defaulttxt);
		     //The usertype of Change Manager is always undefined.
			jQuery('#currusertype').remove();
		     //To remove onClick property , cursor symbol to arrow
		     jQuery("#all").attr('disabled','disabled');
		   jQuery("#chg_admin_stageperm").attr('style','opacity:.7').addClass("chnmgrdisabled");
		   jQuery(".chnmgrdisabled input[type='checkbox']").attr("disabled","disabled");
		   //TEmp : need to configure stage.length
		   //To remove the cursor proprty in stage/role matrix

			for(var j=0;j<stageIndexArray.length;j++)
			{
				var stageId = stageIndexMapping[stageIndexArray[j]].id;
		     	jQuery("#approve_id"+stageId).removeAttr("onclick");//NO I18N
		     	jQuery("#view_id"+stageId).removeAttr("onclick");//NO I18N
		     	jQuery("#edit_id"+stageId).removeAttr("onclick");//NO I18N
		     }
		}
		else if(internalName == "ChangeOwner")
		{
			txt = getMessageForKey("sdp.admin.change.changerole.usertype.co");
			defaulttxt = getMessageForKey("sdp.admin.change.roles.playedby") + " <input type='radio' id='usertype_TECH' name='usertype' value='TECH' class='hide' checked>" + txt;//NO I18N
			 jQuery("#edit_"+id).find("#userTypeVal").html(defaulttxt);
			jQuery('#currusertype').val('TECH');//NO I18N

		}
		else if(internalName == "CAB")
		{
			var stageId = stageIndexMapping[3].id;
			jQuery("#edit_"+id).find("#userTypeVal").addClass("hide");
			jQuery('#currusertype').val('ALL');//NO I18N
		    jQuery("#view_id"+stageId).attr('disabled','disabled');
		}
		else if(internalName == "ChangeRequester")
		{
			txt = getMessageForKey("sdp.admin.change.changerole.usertype.allusers");
			defaulttxt = getMessageForKey("sdp.admin.change.roles.playedby") + " <input type='radio' name='usertype' id='usertype_ALL' value='ALL' class='hide' checked>" + txt;//NO I18n
			jQuery("#edit_"+id).find("#userTypeVal").html(defaulttxt);
			jQuery('#currusertype').val('ALL');//NO I18N
		}
		 else if(internalName == "SDSharedRole")
			 {
			 defaulttxt =getMessageForKey("sdp.change.sharedRole.helpText")+" <input type='radio' name='usertype' id='usertype_ALL' value='ALL' checked class='hide'>";//NO I18N
			 jQuery("#edit_"+id).find("#userTypeVal").html(defaulttxt);
			 jQuery('#currusertype').val('ALL');//NO I18N
			for(var j=0;j<stageIndexArray.length;j++){
				var stageId = stageIndexMapping[stageIndexArray[j]].id;
				jQuery("#approve_id"+stageId).attr("disabled","disabled");	// NO I18N
				jQuery("#edit_id"+stageId).attr("disabled","disabled");	// NO I18N
		     }
			  jQuery("#all").attr("disabled","disabled");	// NO I18N
			 }
		if(internalName != "ChangeManager" && internalName != "ChangeApprover")
		{
			var stageId = stageIndexMapping[3].id;
			jQuery("#approve_id"+stageId).attr("disabled","disabled");	//NO I18N
		}
		var permissions = result.permissionmodel;
		var perm = permissions;
		var editenabled = perm.editenabled;
		for(var i=0;i<editenabled.length;i++)
		{
		    jQuery("#edit_id"+editenabled[i]).prop("checked",true);//NO I18N
		}
		var viewenabled = perm.viewenabled;
		for(var i=0;i<viewenabled.length;i++)
		{
		    jQuery("#view_id"+viewenabled[i]).prop("checked",true);//NO I18N
		}
		var approveenabled = perm.approveenabled;
		for(var i=0;i<approveenabled.length;i++)
		{
		    jQuery("#approve_id"+approveenabled[i]).prop("checked",true);//NO I18N
		}
		if(editenabled.length == "8" && viewenabled.length == "8" && (((internalName == "ChangeManager"||internalName == "ChangeApprover") && approveenabled.length == "8") || ((internalName != "ChangeManager" || internalName != "ChangeApprover") && approveenabled.length == "7")))
		{
		    jQuery("#all").prop("checked",true);//NO I18N
		}
		}
	});
	jQuery("#edit_"+id).find("#saveSection").hide();
	jQuery("#edit_"+id).find("#updateSection").show();
	jQuery("#edit_"+id).find("#name").val(decodeURIComponent(result.name));
	jQuery("#edit_"+id).find("#description").val(decodeURIComponent(result.desc));
	jQuery("#edit_"+id).find("#commonid").val(id);
	if(result.isdeleted == true || result.isdeleted == "true")
	{
		jQuery("#edit_"+id).find("#isdeletedrow").show();
		jQuery("#edit_"+id).find("#isdeletedcheck").prop("checked",true); //NO I18N
		//setusdefault hidden when isdeleted=true
		jQuery("#edit_"+id).find("#defSpan").hide();
		jQuery("#edit_"+id).find("#updateandconfigure").parent().hide();
		//jQuery("#edit_"+id).find("#update").parent().removeClass("formcancelbtn-label-ui1").addClass("formsubmitbtn-label-ui1")
		//jQuery("#edit_"+id).find("#update").removeClass("formcancelbtn-ui1").addClass("formsubmitbtn-ui1");
	}
	else
	{
		jQuery("#edit_"+id).find("#isdeletedrow").hide();
	}
	setTimeout(function(){ jQuery("#edit_"+id).find("#name").trigger('focus')}, 1000);
    }
    else
    {
	parent.showFailureMessageAndClose("sdp.change.exception.msg",5000);//NO I18N
    }
    $sdEventListener("#edit_"+id);//NO I18N
}

function resetCheckBoxes()
{
    jQuery("#all").prop("checked",false); //NO I18N
    var stageIndexArray = Object.keys(stageIndexMapping);
    for(var j=0;j<stageIndexArray.length;j++){
		var stageId = stageIndexMapping[stageIndexArray[j]].id;
	jQuery("#edit_id"+stageId).prop("checked",false); //NO I18N
	jQuery("#view_id"+stageId).prop("checked",false); //NO I18N
	jQuery("#approve_id"+stageId).prop("checked",false); //NO I18N
    }
}

function changePermissionSelection(notType,id)
{

    var notifytype = notType.split("_")[0];
    if(document.getElementById(notType) != null) {
	    if(document.getElementById(notType).checked)
	    {
			var editpermission = true;
			var viewpermission = true;
			var approvepermission= true;
			if(notType.indexOf("edit")!=-1 || notType.indexOf("approve")!= -1)
			{
			    var notify = notType.split("_");
			    var view = "view_"+notify[1];
			    document.getElementById(view).checked=true;
			}

			for(var i=0;i<6;i++)
			{
			    if(jQuery("input[name='editperm']:visible")[i].checked == false)
			    {
					editpermission = false;
			    }
			    if(jQuery("input[name='viewperm']:visible")[i].checked == false)
			    {
					viewpermission = false;
			    }
			}
			for(var i=0;i<6;i++)
			{
			    if(i == 2)
			    {
					continue;
			    }
			    if(jQuery("input[name='approveperm']:visible")[i].checked == false)
			    {
					approvepermission = false;
			    }
			}

			if(editpermission && viewpermission && approvepermission)
			{
			    document.getElementById("all").checked = true; // No I18N
			}
	    }
	    else {
	    	if(notifytype == "view") {
				document.getElementById("approve_id"+id).checked = false;
				document.getElementById("edit_id"+id).checked = false;
			}
			document.getElementById("all").checked = false;
	    }
	}
}
function showAddBox(forwardto)
{

	jQuery("#divid").val("addboxrow");//NO I18N
    jQuery("#operation_status").html("");
    if(document.getElementById("selectedAsDefaultwf") != null)
    {
	document.getElementById("selectedAsDefaultwf").value="false";
    }
    if(jQuery("div[name='editrow']:visible")[0] != null)
    {
	var ids = jQuery("div[name='editrow']:visible")[0].id;
	var rowid = ids.split("_");
	jQuery("div[name='editrow']:visible")[0].style.display = "none";
	document.getElementById("Row_"+rowid[1]).style.display = "";
	document.getElementById("edit_"+rowid[1]).innerHTML="";
    }
    jQuery("#btmaddbutton").fadeOut("slow",function(){//NO I18N
	    jQuery("#addboxrow").fadeIn("slow");//NO I18N
	    if(forwardto == "changeroles")
	    {
	    var stageId = stageIndexMapping[3].id;
	    jQuery('input:radio[name=usertype]')[0].checked="true";
		jQuery("#approve_id"+stageId).attr("disabled","disabled");	// NO I18N
			//submission view is enabled
			var submissionStageId = stageIndexMapping[1].id;
	    }
	    });
    document.getElementById("mode").value = "add";//No I18N
	jQuery("#addboxrow").find("#saveSection").show();
	jQuery("#addboxrow").find("#updateSection").hide();
	jQuery("#addboxrow").show();
	 var scrlPos = jQuery("#addboxrow").offset().top-70;
	 if (browser_ie) {
	 	var scrlTop = document.body.scrollTop;
		scrlPos =  scrlPos + scrlTop;
	 }
	 setTimeout(function() { jQuery('html,body').animate({ scrollTop:scrlPos},'slow');jQuery("#addboxrow").find("#name").trigger('focus'); } ,1000);//NO I18N
}

function selectAllCheckboxes(size,rolemodel)
{

    //var roleidnamelist = JSON.parse(rolemodel) ;
    var roleidnamelist;
	try{
		roleidnamelist = JSON.parse(rolemodel);
    }
    catch(err){
            roleidnamelist = rolemodel;
    }
    var commonid = document.getElementById("commonid").value;
    var rolename = roleidnamelist[commonid];
	var stageIndexArray = Object.keys(stageIndexMapping);
    if(document.getElementById("all").checked)
    {
		for(var j=0;j<stageIndexArray.length;j++)
		{
			var stageId = stageIndexMapping[stageIndexArray[j]].id;
			jQuery("#edit_id"+stageId).prop("checked",true); //NO I18N
			jQuery("#view_id"+stageId).prop("checked",true); //NO I18N
			jQuery("#approve_id"+stageId).prop("checked",true); //NO I18N
		}
    }
    else
    {
	for(var j=0;j<stageIndexArray.length;j++)
	{
		var stageId = stageIndexMapping[stageIndexArray[j]].id;
		jQuery("#edit_id"+stageId).prop("checked",false); //NO I18N
		jQuery("#view_id"+stageId).prop("checked",false); //NO I18N
		jQuery("#approve_id"+stageId).prop("checked",false); //NO I18N
	}

    }
    if(rolename != "ChangeManager" && rolename != "ChangeApprover")
    {
    	var stageId = stageIndexMapping[3].id;
	jQuery("#approve_id"+stageId).attr("disabled","disabled"); //NO I18N
	jQuery("#approve_id"+stageId).prop("checked",false); //NO I18N
    }
    if(rolename == "CAB")
    {
    	var stageId = stageIndexMapping[3].id;
	    jQuery("#view_id"+stageId).prop("checked",true); //NO I18N
	    jQuery("#view_id"+stageId).attr('disabled','disabled');  //NO I18N
    }
}

function msgconvar() {
    jQuery("#focusedElement").val("message");//NO I18N
    jQuery("div[id='convar']:visible").animate({"top": "68px"}, "slow");//NO I18N
}
function deleteStatus(id,stageid)
{

    jQuery("#operation_status").html("");
    if(window.confirm(getMessageForKey('sdp.admin.statusDefI.deleteConform')))
    {
	var newUrl = "/StageandStatus.do";//NO I18N
	var params = 'mode=delete&commonid='+encodeURIComponent(id);//NO I18N
	var myAjax = new Ajax.Request(newUrl, {
method: 'post',//NO I18N
parameters: params,
onComplete: function(resp, jsonObj){ successHdlrForDeleteStatus(resp,id); }
});
}

}
function successHdlrForDeleteStatus(resp,id)
{
    var result = JSON.parse(resp.responseText) ;

    var succ = decodeURIComponent(result.successMsg);
    var greyed = decodeURIComponent(result.greyedMsg);
    var fail = decodeURIComponent(result.failedMsg);
    if(result.status == "success")
    {
	jQuery("#detailsrow_"+id).empty();
	//              showSuccessMessageAndClose("detailsrow_"+id,succ,3000);//NO I18N
	showMessageAndClose(encodeHTML(succ),3000);
    }
    else if(result.status == "greyedout")
    {
	jQuery("#detailsrow_"+id).find(".stagests").addClass("fontgray");
	jQuery("#detailsrow_"+id).find(".serviceCatDet").addClass("fontgray");
	jQuery("#detailsrow_"+id).find(".stgacnnm").addClass("fontgray");
	jQuery("#deleterow_"+id).find("a").removeClass("servicecat-delete").addClass("servicecat-delete-dis");
	jQuery("#deleterow_"+id).find("a").removeAttr("href");//NO I18N
	showFailureMessageForChange("detailsrow_"+id,greyed,3000);//NO I18N

    }
    else
    {
	showFailureMessageAndClose(encodeHTML(fail),5000);
    }
}
function showStatusDetails(id,stageid)
{

    jQuery("#operation_status").html("");
    jQuery("#currentstage").val(stageid);
	var newUrl = '/servlet/CmClientUtilServlet';//NO I18N
    var params = 'command=getStatusInfo&';//NO I18N
    params = params + 'statusid='+encodeURIComponent(id)+'&stageid='+encodeURIComponent(stageid);//NO I18N
    var myAjax = new Ajax.Request(newUrl, {
method: 'get',//NO I18N
parameters: params,
onComplete: function(resp, jsonObj){ successHdlrForGetStatusInfo(resp,id,stageid); }
});
}
function successHdlrForGetStatusInfo(resp,id,stageid)
{
	id = Number(id);
    var browser = navigator.appName;
    var result = JSON.parse(resp.responseText) ;

    var isprominent = result.isprominent;
    var isdeleted = result.isdeleted;
    jQuery("#ispro").val(isprominent);
    var actionname = decodeURIComponent(result.actionname);
    var statusname = decodeURIComponent(result.statusname);
    var desc = decodeURIComponent(result.description);
    var notifyto_id= result.notify_id;
    var notifyto_name=decodeURIComponent(result.notify_name);
    var subject =decodeURIComponent(result.subject);
    var notify_desc = decodeURIComponent(result.notify_desc);
    var notification_template_id = decodeURIComponent(result.notification_template_id);
    var editdiv = "editrow_"+id;//NO I18N
	jQuery('tr.show').attr('class', 'hide'); //NO I18N
	jQuery('#'+editdiv).closest('tr').attr('class', 'show'); //NO I18N
	jQuery("#currentstatus").val(id);
    jQuery("#mode").val("edit");//NO I18N
    jQuery("#addbutton_"+stageid).fadeOut("slow");//NO I18N
    //closing other edit blocks
    for(var i=0;i<jQuery("div[name='editrows']").length;i++)
    {
	if(jQuery("div[name='editrows']")[i].style.display == "")
	{
	    var statusids = jQuery("div[name='editrows']")[i].id;
	    jQuery("div[name='editrows']")[i].style.display = "none";
	    var sid = statusids.split("_");
	    jQuery("#detailsrow_"+sid[1])[0].style.display = "";
	}
    }

    //closing other add blocks
    for(var i=0;i<jQuery("div[name='addrows']").length;i++)
    {
	if(jQuery("div[name='addrows']")[i].style.display == "")
	{
	    var stageid = jQuery("div[name='addrows']")[i].id;
	    jQuery("div[name='addrows']")[i].style.display = "none";
	    var sid = stageid.split("_");
	    jQuery("#addbutton_"+sid[1])[0].style.display = "";
	}
    }

    /*      if( browser == "Netscape" )
	    {
	    jQuery("#HTMLDesc").html(notify_desc);
	    }
	    else
	    {
	    jQuery("#HTMLDesc").html(notify_desc);
	    }*/

    jQuery("#detailsrow_"+id).fadeOut("slow",function(){//NO I18N
	    jQuery("#editrow_"+id).fadeIn("slow");//NO I18N
		jQuery("#editrow_"+id).addClass("stagestatus-editform");
	    jQuery("#editrow_"+id).html(jQuery("#editblock").html());
	    $(editdiv).getElementsByTagName("textarea")[2].id = "HTMLDesc_"+id;
        zeditor({element:"HTMLDesc_"+id,edithtml:true,isEnterKeyHandler:true,resize:true,inlineimagesAPI: "/api/v3/user_notification_templates/"+notification_template_id+"/images"});//NO I18N
	    jQuery("input[name='statusname']:visible")[0].value = statusname;
	    jQuery("input[name='actionname']:visible")[0].value = actionname;
	    jQuery("textarea[name='notify_name']:visible")[0].value=notifyto_name;
	    document.getElementById("notifyto").value=notifyto_id;
		jQuery("textarea[name='description']:visible")[0].innerHTML = encodeHTML(desc);
	    jQuery("input[name='subject']:visible")[0].value = subject;
	    var title = "Edit Status - "+ jQuery("#statusname_"+id).html();//NO I18N
	    jQuery(".stagestatus-editform-h").html(title);
		if(isprominent == "true")
		{
		 jQuery("#editrow_"+id).find("#actionname_mand").show();
		 jQuery("#editrow_"+id).find("#actionname_mand").html("*&nbsp;");//NO I18N
		 }
		 else
		 {
		 jQuery("#editrow_"+id).find("#actionname_mand").hide();
		 jQuery("#editrow_"+id).find("#actionname_mand").html("");
		 }
	    setTimeout(function() {
	    	jQuery(parent.editor.iframe.contentWindow.document.body).on('mousedown', function() {
	    		msgconvar();
	    	})
	    }, 1000);
	    //setTimeout(function(){
		parent.editor.setHTML(notify_desc);
		jQuery("input[name='statusname']:visible")[0].focus();
		//},1000);

	    jQuery("input[id='save']:visible").val(getMessageForKey("sdp.home.reminderDisplay.update"));
	    jQuery("input[id='save']:visible").attr("title", getMessageForKey("sdp.home.reminderDisplay.update"));
		if(isdeleted == "true")
	    {
		jQuery("#isdeletedrow")[0].style.display="";
		jQuery("#isdeletedcheck").prop("checked",true); //NO I18N
		//                              jQuery("#isdeletedcheck").checked="true";
	    }
	    setTimeout(function(){init_change_textComplete();},400);

    });
}
function cancelStatusEditDiv()
{
	var stageid = document.getElementById("currentstage").value;

	jQuery('tr.show').attr('class', 'hide');//NO I18N
    if(jQuery("#mode").val() == "edit")
    {
	var id=jQuery("#currentstatus").val();

	jQuery("#editrow_"+id).fadeOut("slow",function(){//NO I18N
		jQuery("#detailsrow_"+id).fadeIn("slow");//NO I18N
		jQuery("#editrow_"+id).html("");
		jQuery("#addbutton_"+stageid).fadeIn("slow");//NO I18N
		updateEffect(document.getElementById("detailsrow_"+id));
		});
    }
    else
    {
	var id=jQuery("#currentstage").val();

	jQuery("#addrow_"+id).fadeOut("fast",function(){//NO I18N
		jQuery("#addbutton_"+id).fadeIn("slow");//NO I18N
		});
    }

}

function saveStatusInfo(dupMsg)
{
    var confirm = "true";
    var ispro = document.getElementById("ispro").value;
    var stageid = document.getElementById("currentstage").value;
   var addedStatus = jQuery("input[name='statusname']:visible")[0].value.trim();
//already exist statusname check is done in client side.
   var stagerowname = "stagerow_"+stageid; //NO I18N
	var spanLength = jQuery("tr[name='"+stagerowname+"']").find(".stagests").find("span:visible").length;
	var spans = jQuery("tr[name='"+stagerowname+"']").find(".stagests").find("span:visible");
	toReturn = false;
	spans.each(function(){
	    if(jQuery(this).text().toLowerCase() == addedStatus.toLowerCase()) // #67928 xss issue fix
        {
            showFailureMessageAndClose(encodeHTML(dupMsg),5000);
            jQuery("input[name='statusname']:visible")[0].focus();
            toReturn = true;
            return false;
        }
	});
	if(toReturn)
	{
	    return false;
	}
    if(jQuery("input[name='statusname']:visible")[0].value.trim() == "")
    {
	alert(getMessageForKey("sdp.admin.statusDef.jsNameErr"));
	jQuery("input[name='statusname']:visible")[0].focus();
	return false;
    }
    if(ispro == "true")
    {
	if(jQuery("input[name='actionname']:visible")[0].value.trim() == "")
	{
	    alert(getMessageForKey("sdp.admin.change.stagestatus.actiondelete.errmsg"));
	    jQuery("input[name='actionname']:visible")[0].focus();
	    return false;
	}
	if(jQuery("input[name='subject']:visible").val().trim() == "")
	{
	    alert(getMessageForKey("sdp.admin.change.stagestatus.subdelete.errmsg"));
	    jQuery("input[name='subject']:visible").focus();
	    return false;
	}
	if(isHtmlAreaEmpty())
	{
	    alert(getMessageForKey("sdp.admin.change.stagestatus.messdelete.errmsg"));
	    parent.editor._editor.focus();
	    return false;
	}
    }
    else
    {
	if(!isHtmlAreaEmpty() && jQuery("input[name='subject']:visible").val().trim() == "")
	{
  	    alert(getMessageForKey("sdp.admin.change.subject.mandate"));
            jQuery("input[name='subject']:visible").trigger('focus');
            return false;
	}
    }

	var id = document.getElementById("currentstatus").value;
	var mode = document.getElementById("mode").value;
	var statusname = "";
	var actionname = "";
	var description = "";
	var notify_name = "";
	var notify_id = "";
	var subject = "";
	var message = "";
	var isdeleted = "";

	if(mode == "edit")
	{
	    var newUrl = '/servlet/CmClientUtilServlet';//NO I18N
	    var params = 'command=saveStatusInfo';//NO I18N
	    var editdiv = "editrow_"+id;//NO I18N
	    statusname = encodeURIComponent(jQuery("input[name='statusname']:visible")[0].value.trim());
	    actionname = encodeURIComponent(jQuery("input[name='actionname']:visible")[0].value.trim());
	    description =encodeURIComponent(jQuery("textarea[name='description']:visible")[0].value);
	    notify_id = document.getElementById("notifyto").value;
	    isdeleted = document.getElementById("isdeletedcheck").checked;
	    subject = encodeURIComponent(jQuery("input[name='subject']:visible")[0].value);
		if(isHtmlAreaEmpty())
		{
			message = "";
		}
		else
		{
			message = encodeURIComponent(parent.editor.getHTML());
		}
	    params = params + '&mode='+mode+'&statusid='+encodeURIComponent(id);//NO I18N
	    params = params + '&statusname='+statusname+'&stageid='+stageid; //NO I18N
	    if(actionname != "")
	    {
		params = params + '&actionname='+actionname; //NO I18N
	    }
	    params = params + '&description='+description+'&notify_name='+notify_name+'&notify_id='+notify_id;//NO I18N
	    params = params + '&subject='+subject+'&message='+message+'&isdeleted='+isdeleted;  //NO I18N

		var myAjax = new Ajax.Request(newUrl, {
method: 'post',//NO I18N
parameters: params,
onComplete: function(resp){
	if(resp.responseText.indexOf("AuthError.jsp") !== -1)
	{
		parent.window.open('/jsp/AuthError.jsp?module=Error', '_self');
	}
	else
	{
	successHdlrForSaveStatusInfo(resp,id,stageid);
	jQuery('tr.show').attr('class', 'hide');//no i18n
	}
}
});
}
if(mode ==  "add")
{
	id = document.getElementById("currentstage").value;

    var adddiv = "addrow_"+id;//NO I18N
    statusname = jQuery("input[name='statusname']:visible")[0].value.trim();
    actionname = jQuery("input[name='actionname']:visible")[0].value.trim();
    description = jQuery("textarea[name='description']:visible")[0].value;
   notify_name = jQuery("textarea[name='notify_name']:visible")[0].value;
    notify_id = document.getElementById("notifyto").value;
    subject = jQuery("input[name='subject']:visible")[0].value;
	if(isHtmlAreaEmpty())
	{
		message = "";
	}
	else
	{
		message = parent.editor.getHTML();
	}
    document.StageandStatusForm.stageid.value = Number(id);
    document.StageandStatusForm.notify_id.value = encodeHTMLAttribute(notify_id);
    document.StageandStatusForm.description.value = encodeHTMLAttribute(description);
    document.StageandStatusForm.statusname.value = encodeHTMLAttribute(statusname);
    document.StageandStatusForm.notify_name.value = encodeHTMLAttribute(notify_name);
    document.StageandStatusForm.subject.value = encodeHTMLAttribute(subject);
    document.StageandStatusForm.message.value = message;
    document.StageandStatusForm.actionname.value = encodeHTMLAttribute(actionname);
    document.StageandStatusForm.submit();
}

}
function successHdlrForSaveStatusInfo(resp,id,stageid)
{
    var result = JSON.parse(resp.responseText) ;

    var statusname = result.statusname;
	var actionname = result.actionname;
    var isprominent = result.isprominent;
    var isdeleted = result.isdeleted;
    if(actionname == " " || actionname == "null" || actionname==undefined)
    {
	actionname = "-";
    }
    var desc =result.desc;
    if(desc == " ")
    {
	desc = "-";
    }
    var notify_to = result.notify_name;
    if(notify_to == " ")
    {
	notify_to = "-";
    }
    var contentid = result.contentid;

    if(result.status == "success")
    {
	var succMsg = result.successMsg;

	jQuery("#addbutton_"+stageid).fadeIn("slow");//NO I18N
	id=document.getElementById("currentstatus").value;
	document.getElementById("statusname_"+id).innerHTML = "<span>"+encodeHTML(statusname)+"</span>";//NO I18N
	document.getElementById("actionname_"+id).innerHTML = encodeHTML(actionname);
	document.getElementById("description_"+id).innerHTML = encodeHTML(desc);


	jQuery("#editrow_"+id).fadeOut("slow",function(){//NO I18N
		jQuery("#detailsrow_"+id).fadeIn("slow");//NO I18N
		if(isdeleted == "false")
		{
		jQuery("#detailsrow_"+id).find(".stagests").removeClass("fontgray");
		jQuery("#detailsrow_"+id).find(".serviceCatDet").removeClass("fontgray");
		jQuery("#detailsrow_"+id).find(".stgacnnm").removeClass("fontgray");
		jQuery("#deleterow_"+id).find("a").removeClass("servicecat-delete-dis").addClass("servicecat-delete");
		jQuery("#deleterow_"+id).find("a").attr("href","javascript:deleteStatus("+id+")");
		}
		if(isprominent == "true")
		{
		jQuery("#deleterow_"+id).find("a").removeClass("servicecat-delete").addClass("servicecat-delete-dis");
		jQuery("#deleterow_"+id).find("a").removeAttr("href");//NO I18N

		}
		//jQuery('html,body').animate({ scrollTop: 80*id }, 'slow');
		updateEffect(document.getElementById("detailsrow_"+id));
		});
		showMessageAndClose(encodeHTML(succMsg), 3000);
    }
    else if(result.status == "failure")
    {
    	if(result.message!=null||result.message!="null"||result.message!="")
    	{
    		showFailureMessageAndClose(encodeHTML(result.message),3000);
    	}

    }
    else
    {
    	//result.status is considered failure
    	if(result.message!=null||result.message!="null"||result.message!="")
    	{
    		showFailureMessageAndRefreshOnClose(encodeHTML(result.message));
    	}

    }
    jQuery("#editrow_"+id).html("");

}
function showRolesList(from)
{

    var nextSt = $("stageStatusDisplayID").value;

    if(from == "notify_next" && nextSt == "0,0")
    {
	alert(getMessageForKey("sdp.admin.changeworkflow.nextstage.emptymsg"));
	return false;
    }
    if(from == "notify_current")
    {
	id=document.getElementById("notify_currentid").value;

    }
    else if(from == "notify_next")
    {
	id=document.getElementById("notify_nextid").value;

    }
    else
    {
	id = jQuery("#notifyto").val();

    }
    showURLInDialog('/change/ShowRolesList.jsp?from='+from+'&notifyid='+encodeURIComponent(id),'top=100,width=400 left=300,title='+getMessageForKey("sdp.admin.changeroles.list.title")+',position=absmiddle');//NO I18N
}

    function updateSelecteStyleAndData(jsonStr){
        jQuery(jQueryCachedLiObject).attr('className','current');//NO I18N
        var stageid_name = jsonStr;
        //var stageidnamelist = JSON.parse(stageid_name) ;
        var stageidnamelist;
    	try{
    		stageidnamelist = JSON.parse(stageid_name);
    	}
    	catch(err){
    		stageidnamelist = stageid_name;
    	}
        $('stageStatusDisplayID').value = jQuery(jQueryCachedLiObject).attr('stagestatusid');//NO I18N
        var stagelist = $('stageStatusDisplayID').value.split(",");
        var stagename= stageidnamelist[stagelist[0]];
        var trunc = stagename+" - "+jQuery(jQueryCachedLiObject).text();
        jQuery("span[id='stageStatusDisplayValue']:visible").attr("title",trunc);//NO I18N
        if(trunc.length > 26)
        {
    	trunc = trunc.truncate(26,"...");
        }
        //   jQuery("span[id='stageStatusDisplayValue']:visible").text((stagename+" - "+jQueryCachedLiObject.firstChild.innerHTML).truncate('18','...'));
        jQuery("span[id='stageStatusDisplayValue']:visible").text(trunc);
        //jQuery("span[id='stageStatusDisplayValue']:visible").text(stagename+" - "+jQuery(jQueryCachedLiObject).text());
        var count = jQuery(jQueryCachedLiObject).attr('count');//NO I18N
        $('stageStatusDisplayID').value = jQuery(jQueryCachedLiObject).attr('stagestatusid');//NO I18N
        if( count > 10 ){
    	jQuery("div[id='mnuContent']:visible").animate({ scrollTop: count* 18 - 18 }, 'slow');//NO I18N
        }
        else{
    	jQuery("div[id='mnuContent']:visible").animate({ scrollTop: 0 }, 'slow');//NO I18N
        }
    }

    function constructMigrateParameters(params)
    {
    	var tags = document.getElementsByName("stageStatusDisplay");
    	for(var i=0;i<tags.length;i++)
    	{

    		params += "&" + tags[i].id + "=" + encodeURIComponent(tags[i].value); //No I18N
    	}
    	return params;
    }
    function saveMigrateStatus()
    {
    	var result = confirm(getMessageForKey("sdp.admin.change.migrationwiz.alert"));
        if(result)
        {
    	var newUrl = '/servlet/CmClientUtilServlet';// No I18N
    	var params = 'command=saveMigrateStatus';// No I18N
    	params = constructMigrateParameters(params);

    	var myAjax = new Ajax.Request(newUrl, {
    method: 'post',// No I18N
    parameters: params,
    onComplete: function(resp, jsonObj){ successHdlrForSaveMigrateStatus(resp); }
    });
    	}
    }
    function successHdlrForSaveMigrateStatus(resp)
    {
        var result = JSON.parse(resp.responseText) ;

        if(result.status == "success")
        {
    	document.location="/Changes.cc";
    	showMessageAndClose("sdp.changedetails.status.updatesuccess.msg",3000);//NO I18N
        }
        else
        {
    	showFailureMessageAndClose("sdp.change.exception.msg",5000);//NO I18N
        }

    }

    startListForChange = function() {

    	//change wf started
    	if(document.getElementById('changestartListMenuItems')!=null)
    	{
    		menubar2actions(true);
    	}
    	// changewf end
    	if (document.all&&document.getElementById) {
    		var ulelems = document.getElementsByTagName("ul");
    		for(var k=0; k<ulelems.length; k++) {
    			if(ulelems[k].id == 'nav') {
    				navRoot = ulelems[k];
    				for (i=0; i<navRoot.childNodes.length; i++) {
    					node = navRoot.childNodes[i];
    					if (node.nodeName=="LI") {
    						node.onmouseover=function() {
    							this.className+=" over"; //No I18N
    						}
    						node.onmouseout=function() {
    							this.className=this.className.replace(" over", ""); //No I18N
    						}
    					}
    				}
    			}
    		}
    	}
    }

    function textareaMaxlengthCheck(textarea2, maxlen) {
    	  var txts = document.getElementById(textarea2)
    	      var func = function() {
    	        if(this.value.length > maxlen) {
    	          this.value = this.value.substr(0, maxlen);
    	          return false;
    	        }
    	      }

    	      txts.onkeyup = func;
    	      txts.onblur = func;
    	}
  //method added for workflow and roles helpcard tab navigation
    var helpTabs = new Array('changeRoles_doc', 'addRoles_doc','addWorkflow', 'configureWorkflow', 'duplicateWorkflowHelp'); // No I18N

    function changeHelpTab(selectedTab, params){
    	for(var i = 0; i < helpTabs.length; i++) {
    		var tabName = helpTabs[i];
    		if(document.getElementById(tabName + "_tab") != null) {
    			if(tabName == selectedTab) {
    				document.getElementById(tabName).className = "show"; // No I18N
    				document.getElementById(tabName + "_tab").className = "subtabon"; // No I18N
    			}
    			else {
    				document.getElementById(tabName).className = "hide"; // No I18N
    				// Tasks by default will be hidden. i.e when
    				// count is 0. In that case, the class should
    				// not be set to subtaboff. Hence checking
    				// whether the existing className does not
    				// contains a hide class in it.
    				if(document.getElementById(tabName + "_tab").className.indexOf("hide") < 0) {
    					document.getElementById(tabName + "_tab").className = "subtaboff"; // No I18N
    				}
    			}
    		}
    	}
}
    	function duplicateChangeTemplate(tempid)
    	{

    		document.location="/ChangeTemplate.do?mode=duplicate&id="+encodeURIComponent(tempid);
    	}
    	function clickDuplicateChangeTemplate(tempid) {
    		if(!Canvas.saved || Canvas.hasLayoutChanged() || changeTemplateDetailsChanged || !isChangeTemplateRoleSaved) {
    			showDialog(document.getElementById("templateDuplicateConfirmDialog").innerHTML, "modal=yes, title=" + document.getElementById("templateDuplicateConfirmDialog").title,()=>{// No i18N
                    document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateForm-19"]').addEventListener("click", function(event) { duplicateChangeTemplate(tempid) });//No i18N
                    document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-ChangeTemplateForm-11"]').addEventListener("click", function(event) { closeDialog() });// No i18N
    			});
    		} else {
    			duplicateChangeTemplate(tempid);
    		}
    	}
