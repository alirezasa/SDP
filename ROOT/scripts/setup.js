/* $Id$ */

function saveDept()
{
    if($('addButton').style.display=='block') {
        validateDeptForm('Add');//No I18N
    }
    else if($('updateButton').style.display=='block') {
        validateDeptForm('Update');//No I18N
    }
}
function validateDeptForm(mode)
{
    var name = trimAll(document.DepartmentDefForm.departmentName.value);

    if(name===null || name==="")
    {
        name = document.DepartmentDefForm.ciName.value ;
        document.DepartmentDefForm.departmentName.value = trimAll(name);
    }
    if(name==null || name=="")
    {
        alert(document.getElementById("enterdepartmentname").innerHTML);
        if(isCMDB == 'true'){
            document.DepartmentDefForm.ciName.focus();
        }else{
            document.DepartmentDefForm.departmentName.focus();
        }
        return false;
    }
    document.DepartmentDefForm.departmentName.value = name;
    if(document.DeptActions != null && document.DeptActions != undefined && document.DeptActions.SITEID != null && document.DeptActions.SITEID != undefined)
    {
        if(forwardfrom === "ESM"){
            if(!document.DepartmentDefForm.location.value){
                document.DepartmentDefForm.location.value = "-1";
            }
        }else{
            document.DepartmentDefForm.location.value = document.DeptActions.SITEID.value;
        }
    }
    /*if(mode == 'Add'){
        callDeptAjax('Add');//No I18N
    }
    else if(mode == 'Update'){
        callDeptAjax('Update');//No I18N
    }*/
    return true;
}
function showHideAddNewButton(){
    if(document.getElementById("sform").style.display == 'none'){
      jQuery("#divmessage").parent().hide();
    }
    else{
      jQuery("#divmessage").parent().show();
    }
}

function updateDeptListView(form){
    var siteId = null;
    if(document.DeptActions.SITEID){
        siteId = document.DeptActions.SITEID.value;
        document.DepartmentDefForm.location.value = document.DeptActions.SITEID.value;
    }
        var newVal = "&SITEID="+siteId;//No I18N
    updateState(getPortalViewName("DepartmentEntry"),"_D_RP", newVal);//No I18N
    updateState(getPortalViewName("DepartmentEntry"), "_PN", null);//No I18N
        updateFormValues("DepartmentEntry", document.DepartmentListForm);//No I18N
    return true;
}
function updateDeptListView_CMDB(form){
    var siteId = null;
    if(form.SITEID){
        siteId = form.SITEID.value;
        //document.DepartmentDefForm.location.value = form.SITEID.value;
    }
        var newVal = "&SITEID="+siteId;//No I18N
    updateState(getPortalViewName("DepartmentEntry"),"_D_RP", newVal);//No I18N
    updateState(getPortalViewName("DepartmentEntry"), "_PN", null);//No I18N
        updateFormValues("DepartmentEntry", form);//No I18N
    return true;
}
function updateTechnicianView_CMDB(form){
    var siteId = null;
    if(form.SITEID){
        siteId = form.SITEID.value;
    }
    updateState(getPortalViewName("TechnicianView"), "techViewName",siteId); // I18N
    parent.refreshSubView(parent.getPortalViewName("TechnicianView")); // I18N
    return true;
}
function showOperHours()
{
    val = document.OperHoursForm.is24X7[1].checked;
    if(val)
    {
        var idToHide = document.getElementById('hours');
        idToHide.style.display = 'block';//No I18N
    }
    else
    {
        document.OperHoursForm.is24X7[0].checked = true;
        var idToHide = document.getElementById('hours');
        idToHide.style.display = 'none';//No I18N
    }
}
//ajax script to get values..
function callOperAjax(operation){
    if(operation == 'getValue'){
        var url = "/OperHoursDef.do?mode=getValue";//No I18N
        if(document.OperHoursForm.SITEID) {
            url += "&SITEID="+encodeURIComponent(document.OperHoursForm.SITEID.value);//No I18N
            // This is to show the dialog only on changing the values in the drop down
            if(parent["IsNotFirstTime"]) {
                invokeProgressIndicator(null, "sdp.common.ajaxoperation.fetchingdata.msg");//No I18N
            }
            parent["IsNotFirstTime"] = true;
        }
        window.frames['SDPHeaderFrame'].location.href = url + "&" + (new Date()).getTime();//No I18N
    }
    if(operation == 'addValue'){
        var url = "/OperHoursDef.do?mode=addValue";//No I18N
        if(document.OperHoursForm.SITEID != null) {
            url += "&SITEID=" + document.OperHoursForm.SITEID.value;//No I18N
        }
        document.OperHoursForm.action = url;
        document.OperHoursForm.submit();
    }
}

function addOperValue(){
    showMessageAndClose(getMessageForKey("sdp.admin.operatinghours.savedmsg"), 2000);
}
//ends for operational hours js
/* * methods added for LDAP */
function enableLdap()
{
    if(document.getElementById("ldapauth").checked == true)
    {
            document.getElementById("module1").value = "enableLdap";//No I18N
            document.getElementById("ldapauth").value = "true";//No I18N
    }
    else
    {
            document.getElementById("module1").value = "disableLdap";//No I18N
            document.getElementById("ldapauth").value = "false";//No I18N
    }
    document.LdapEnableForm.submit();
}
function validateLdapForm(operation)
{
    if(sdp_app.IS_DEMO_BUILD){
        parent.disableForDemo();
        return false;
    }
    //Domain Name field is added for AE/SDP/SDP-MSP.
    if(sdp_feature_status.is_ldap_domainbox_enabled)
    {
    var ldapDomainName = document.getElementById("ldapDomainName").value;
    if(ldapDomainName == null || ldapDomainName.trim() =="")
    {
        alert(document.getElementById("ldapDomainMsg").innerHTML);
        document.getElementById("ldapDomainName").value = "";
        document.getElementById('ldapDomainName').focus();
        return false;
    }
	else
	{
		//Setting the domain Name in uppercase before saving inorder to process it in uppercase throughout the product as in AD
		document.getElementById("ldapDomainName").value = ldapDomainName.toUpperCase();
	}
    }
	//Domain Name field is added for AE/SDP/SDP-MSP.
    var val = document.getElementById("domainController").value;
    if(val == null || val.trim() =="")
    {
        alert(document.getElementById("selDCMsg").innerHTML);
        document.getElementById("domainController").value = val.trim();
        document.getElementById('domainController').focus();
        return false;
    }
/*    var val1 = document.getElementById("userName").value;
    if(val1 == null || val1 =="")
    {
        alert(document.getElementById("selUsrMsg").innerHTML);
        document.getElementById('userName').trigger('focus');
        return false;
    }
    var val2 = document.getElementById("userPassword").value;
    if(val2 == null || val2 == "")
    {
        alert(document.getElementById("selPwdMsg").innerHTML);
        document.getElementById('userPassword').trigger('focus');
        return false;
    }*/
    var val3 = document.getElementById("baseDn").value;
    if(val3 == null || val3.trim() == "")
    {
        alert(document.getElementById("selBasednMsg").innerHTML);
        document.getElementById("baseDn").value = val3.trim();
        document.getElementById('baseDn').focus();
        return false;
    }
    var val4 = document.getElementById("searchFilter").value;
    if(val4 == null || val4.trim() == "")
    {
        alert(document.getElementById("selSFMsg").innerHTML);
        document.getElementById("searchFilter").value = val4.trim();
        document.getElementById('searchFilter').focus();
        return false;
    }
    if(document.getElementById("changePwd").value == "true")
    {
        var val = document.getElementById("userPassword").value;
        if(val==null || val.trim()=='')
        {
            alert(document.getElementById('selPwdMsg').innerHTML);
            document.getElementById("userPassword").value = val.trim();
            document.getElementById("userPassword").focus();
            return false;
        }
    }
    var loginAttr = document.getElementById("loginAttribute").value;
    if(loginAttr == null || loginAttr.trim() == "")
    {
        alert(document.getElementById("loginAttrMsg").innerHTML);
        document.getElementById('loginAttribute').focus();
        return false;
    }
    var mailAttr = document.getElementById("mailAttribute").value;
    if(mailAttr == null || mailAttr.trim() == "")
    {
        alert(document.getElementById("mailAttrMsg").innerHTML);
        document.getElementById('mailAttribute').focus();
        return false;
    }
    var dnAttr = document.getElementById("dnAttribute").value;
    if(dnAttr == null || dnAttr.trim() == "")
    {
        alert(document.getElementById("dnAttrMsg").innerHTML);
        document.getElementById('dnAttribute').focus();
        return false;
    }

    document.getElementById('loginAttribute').disabled = false;
    document.getElementById('mailAttribute').disabled = false;
    document.getElementById('dnAttribute').disabled = false;
    if(operation == "import")
    {
        if(!isLoginNotifcation_Outgoing_Enabled()){
            return false;
        }
        invokeProgressIndicator(null, "sdp.admin.requesterImportWiz.importingReq");//No I18N
    }
    else
    {
        invokeProgressIndicator(null, "sdp.admin.backup.settings.save.progress.msg");//No I18N
    }
    document.getElementById("addNewDomain").style.display = "inline";

    var passwordElement = document.getElementById("userPassword");
    if(passwordElement.value != null && passwordElement.value.trim() != '') {
        passwordElement.value = encryptDataWithRSA(passwordElement.value);
    }
    return true;
}
function addnewldapdomain()
{
		parent.closeDialog();
        document.getElementById('loginAttribute').value = "sAMAccountName";//No I18N
        document.getElementById('mailAttribute').value = "mail";//No I18N
        document.getElementById('dnAttribute').value = "distinguishedName";//No I18N
        document.getElementById("rstPwd").className = "hide";//No I18N
        document.getElementById("newPassword").className = "show";//No I18N
        document.getElementById("delBtn").className = "hide";//No I18N
        document.getElementById("ldapId").value = "";//No I18N
        document.getElementById("loginAttribute").disabled=true;//No I18N
        document.getElementById("mailAttribute").disabled=true;//No I18N
        document.getElementById("dnAttribute").disabled=true;//No I18N
        document.getElementById("loginAttribute").className='form-control form-control-auto';//No I18N
        document.getElementById("mailAttribute").className='form-control form-control-auto';//No I18N
        document.getElementById("dnAttribute").className='form-control form-control-auto';//No I18N
}
function changeLDAPType()
{
    var sel = document.getElementById('LDAP_TYPE');
    var samAccountName = document.getElementById('loginAttribute');
    var mail = document.getElementById('mailAttribute');
    var distinguishedName = document.getElementById('dnAttribute');
    var val = sel.value;
    if(val=="Microsoft Active Directory")
    {
        samAccountName.value="sAMAccountName";//No I18N
        mail.value="mail";//No I18N
        distinguishedName.value="distinguishedName";//No I18N
        samAccountName.className = "form-control form-control-auto";//No I18N
        samAccountName.disabled = true;
        mail.className = "form-control form-control-auto";//No I18N
        mail.disabled = true;
        distinguishedName.className = "form-control form-control-auto";//No I18N
        distinguishedName.disabled = true;//No I18N
    }
    else if(val=="Novell eDirectory")
    {
        samAccountName.value="uid";//No I18N
        mail.value="mail";//No I18N
        distinguishedName.value="-";//No I18N
        samAccountName.className = "form-control form-control-auto";//No I18N
        samAccountName.disabled = true;//No I18N
        mail.className = "form-control form-control-auto";//No I18N
        mail.disabled = true;
        distinguishedName.className = "form-control form-control-auto";//No I18N
        distinguishedName.disabled = true;
    }
    else if(val=="OpenLDAP")
    {
        samAccountName.value="uid";//No I18N
        mail.value="mail";//No I18N
        distinguishedName.value="-";//No I18N
        samAccountName.className = "form-control form-control-auto";//No I18N
        samAccountName.disabled = true;
        mail.className = "form-control form-control-auto";//No I18N
        mail.disabled = true;
        distinguishedName.className = "form-control form-control-auto";//No I18N
        distinguishedName.disabled = true;
    }
    else{
        samAccountName.value="";//No I18N
        mail.value="";//No I18N
        distinguishedName.value="";//No I18N
        samAccountName.className = "form-control form-control-auto";//No I18N
        samAccountName.disabled = false;
        mail.className = "form-control form-control-auto";//No I18N
        mail.disabled = false;
        distinguishedName.className = "form-control form-control-auto";//No I18N
        distinguishedName.disabled = false;
    }
}
function confirmLDAPDeleteFromList(form, checkBoxCompName, deleteConfirmObj, selectRowObj, additionalParams) {

    if(sdp_app.IS_DEMO_BUILD){
        parent.disableForDemo();
        return false;
    }

    if(confirmDelete(form, checkBoxCompName, deleteConfirmObj.innerHTML,selectRowObj.innerHTML))
    {
        document.domainlist.module.value = "deleteLDAP";//No I18N
        removeUnwantedDataFromLDAPForm();
        document.domainlist.submit();
    }
    else {
        return false;
    }
}
function importLdapfromListView(id)
{
    if(!isLoginNotifcation_Outgoing_Enabled()){
            return false;
    }
    invokeProgressIndicator(null, "sdp.admin.requesterImportWiz.importingReq");
    document.domainlist.module.value = "importLDAP";//No I18N
    document.domainlist.ldap_id.value = id;
    removeUnwantedDataFromLDAPForm();
    document.domainlist.submit();
}

/*Function to initiate select2 component for select the templates mapping for the changeUDFs
Params description :
val --> JSONArray values of selected items from DB to repopulate.
elt --> Change UDF Select2 Template Mapping Element Id.
placeHolder --> PlaceHolder value for Change UDF Select2 Component.
size --> Total Templates Count.
*/
function initSelect2ForChangeUDF(val, placeHolder, elt , size, udfName){
	jQuery(elt).select2({
        placeholder:placeHolder,
        closeOnSelect: false,
        formatSearching: function() { return getMessageForKey('ae.common.search.text'); }, //No I18N
		formatNoMatches: function() { return getMessageForKey('ae.select2.no.message'); },//No I18N
		containerCssClass: 'wspace-normal sel2-mul-break', //No I18N
        matcher: function(params, data) {
            // Check if the option is hidden
            if (params !==""  && data === getMessageForKey('sdp.common.notneeded') ) {
              return null;
            }else if(jQuery("." + udfName + "_optionMappedTemplates").hasClass("hide") && data !== getMessageForKey('sdp.common.notneeded')) {
               return null;
            }
            return jQuery(elt).select2.defaults.matcher(params, data);
          }
        });

	jQuery(elt).on('change', function (e) {
		  var selectedItems = jQuery(this).select2('data'); //No I18N
          var isAllTemplatesSelected = false;
          var selectedItemsSize = (Array.isArray(selectedItems))? selectedItems.size() : 0;
		  for(var i=0 ; i<selectedItemsSize ; i++)
		  {
			if(selectedItems[i].id == "-1")
			{
                jQuery("." + udfName + "_optionMappedTemplates").addClass("hide");
                jQuery("." + udfName + "_no_results").removeClass("hide");
				jQuery(elt).select2("val",//No I18N
						selectedItems[i].id);
                isAllTemplatesSelected = true;
				break ;
			}
		  }
          if(!isAllTemplatesSelected){
            jQuery("." + udfName + "_optionMappedTemplates").removeClass("hide");
            jQuery("." + udfName + "_no_results").addClass("hide");
          }
          setTimeout(function() {
            jQuery("#" + udfName + "_TemplateMapping").select2('open');
          }, 50);
		});
    if(elt.indexOf('StageMapping') == -1){
    	if(val!=null && val.length == size)
    	{
    		val = -1 ;
            jQuery("." + udfName + "_optionMappedTemplates").addClass("hide");
            jQuery("." + udfName + "_no_results").removeClass("hide");
        } else {
            jQuery("." + udfName + "_optionMappedTemplates").removeClass("hide");
            jQuery("." + udfName + "_no_results").addClass("hide");
        }
    }
	jQuery(elt).select2("val",//No I18N
			   val);
}
function getAllChangeTemplates() {
    var allChangeTemplateIds = [];
    var data = {
        "list_info": {//No I18N
            "row_count": 100,//No I18N
        },
        "include_inactive_value": true //No I18N
    }
  sdpAjax({
        url: "/api/v3/changes/template",   //NO I18N
        async:false,
        cache:false,
        data: sdpAjaxInputData(data),
        success:function(response){
           jQuery.each(response.template,function(ind, template){
                  allChangeTemplateIds.push(parseInt(template.id));
           });
        }
    });
    return allChangeTemplateIds;
}

function removeUnwantedDataFromLDAPForm()
{
    if(document.domainlist.DOMAINCONTROLLER != null)
    {
        document.domainlist.DOMAINCONTROLLER.disabled=true;
    }
    if(document.domainlist.USERNAME != null)
    {
        document.domainlist.USERNAME.disabled=true;
    }
    if(document.domainlist.BASE_DN != null)
    {
        document.domainlist.BASE_DN.disabled=true;
    }
    if(document.domainlist.SEARCH_FILTER != null)
    {
        document.domainlist.SEARCH_FILTER.disabled=true;
    }
    if(document.domainlist.LDAP_ID != null)
    {
        document.domainlist.LDAP_ID.disabled=true;
    }
    if(document.domainlist.LOGIN_ATTRIBUTE != null)
    {
        document.domainlist.LOGIN_ATTRIBUTE.disabled=true;
    }
    if(document.domainlist.MAIL_ATTRIBUTE != null)
    {
        document.domainlist.MAIL_ATTRIBUTE.disabled=true;
    }
    if(document.domainlist.DN_ATTRIBUTE != null)
    {
        document.domainlist.DN_ATTRIBUTE.disabled=true;
    }
}
function submitPDFValues(moduleName,categoryVal)
{
    if(moduleName == 'PurchaseOrder_Fields' || moduleName == 'SoftwareLicense_Fields' || moduleName == 'LicenseAgreement_Fields' )
    {
        for(var i=1;i<=4;i++)
        {
            if(document.getElementById('UDF_COST'+i+'_TYPEADD').disabled)
            {
                var ele = document.getElementsByName('UDF_COST'+i+'_TXT')[0];
                var val = ele.value;
                if(val !=null && trim(val) == '')
                {
                    alert(getMessageForKey("sdp.resourcecost.cannotdelete"));
                    ele.focus();
                    return false;
                }
            }
        }
    }
    var daob = new DataObject();
    var fields = new Array("UDF_CHAR1","UDF_CHAR2","UDF_CHAR3","UDF_CHAR4","UDF_CHAR5","UDF_CHAR6","UDF_CHAR7","UDF_CHAR8","UDF_CHAR9","UDF_CHAR10","UDF_CHAR11","UDF_CHAR12","UDF_LONG1","UDF_LONG2","UDF_LONG3","UDF_LONG4","UDF_DATE1","UDF_DATE2","UDF_DATE3","UDF_DATE4");//No I18N
    var fieldsLabel = new Array("Text Field 1","Text Field 2", "Text Field 3","Text Field 4","Text Field 5","Text Field 6","Text Field 7","Text Field 8","Text Field 9","Text Field 10","Text Field 11","Text Field 12","Numeric Field 1","Numeric Field 2","Numeric Field 3","Numeric Field 4","Date/Time Field 1", "Date/Time Field 2","Date/Time Field 3","Date/Time Field 4");//No I18N
    if(moduleName == "PurchaseOrder_Fields" || moduleName == "SoftwareLicense_Fields" || moduleName == "LicenseAgreement_Fields" )
    {
        fields = new Array("UDF_CHAR1","UDF_CHAR2","UDF_CHAR3","UDF_CHAR4","UDF_CHAR5","UDF_CHAR6","UDF_CHAR7","UDF_CHAR8","UDF_CHAR9","UDF_CHAR10","UDF_CHAR11","UDF_CHAR12","UDF_LONG1","UDF_LONG2","UDF_LONG3","UDF_LONG4","UDF_DATE1","UDF_DATE2","UDF_DATE3","UDF_DATE4","UDF_COST1","UDF_COST2","UDF_COST3","UDF_COST4");//No I18N
        fieldsLabel = new Array("Text Field 1","Text Field 2", "Text Field 3","Text Field 4","Text Field 5","Text Field 6","Text Field 7","Text Field 8","Text Field 9","Text Field 10","Text Field 11","Text Field 12","Numeric Field 1","Numeric Field 2","Numeric Field 3","Numeric Field 4","Date/Time Field 1", "Date/Time Field 2","Date/Time Field 3","Date/Time Field 4","Cost Field 1","Cost Field 2", "Cost Field 3", "Cost Field 4");//No I18N
    }
    if(moduleName.indexOf("WorkOrder_Fields") > 0)
    {
        var fields2 = new Array("UDF_CHAR1","UDF_CHAR2","UDF_CHAR3","UDF_CHAR4","UDF_CHAR5","UDF_CHAR6","UDF_CHAR7","UDF_CHAR8","UDF_CHAR9","UDF_CHAR10","UDF_CHAR11","UDF_CHAR12","UDF_CHAR13","UDF_CHAR14","UDF_CHAR15","UDF_CHAR16","UDF_CHAR17","UDF_CHAR18","UDF_CHAR19","UDF_CHAR20","UDF_CHAR21","UDF_CHAR22","UDF_CHAR23","UDF_CHAR24","UDF_LONG1","UDF_LONG2","UDF_LONG3","UDF_LONG4","UDF_LONG5","UDF_LONG6","UDF_LONG7","UDF_LONG8","UDF_DATE1","UDF_DATE2","UDF_DATE3","UDF_DATE4","UDF_DATE5","UDF_DATE6","UDF_DATE7","UDF_DATE8","UDF_DOUBLE1","UDF_DOUBLE2","UDF_DOUBLE3","UDF_DOUBLE4","UDF_DOUBLE5","UDF_DOUBLE6","UDF_DOUBLE7","UDF_DOUBLE8");//No I18N
        var fieldsLabel2 = new Array("Text Field 1","Text Field 2", "Text Field 3","Text Field 4","Text Field 5","Text Field 6","Text Field 7","Text Field 8","Text Field 9","Text Field 10","Text Field 11","Text Field 12","Text Field 13","Text Field 14","Text Field 15","Text Field 16","Text Field 17","Text Field 18","Text Field 19","Text Field 20","Text Field 21","Text Field 22","Text Field 23","Text Field 24","Numeric Field 1","Numeric Field 2","Numeric Field 3","Numeric Field 4","Numeric Field 5","Numeric Field 6","Numeric Field 7","Numeric Field 8","Date/Time Field 1", "Date/Time Field 2","Date/Time Field 3","Date/Time Field 4","Date/Time Field 5","Date/Time Field 6","Date/Time Field 7","Date/Time Field 8","Decimal Field 1","Decimal Field 2","Decimal Field 3","Decimal Field 4","Decimal Field 5","Decimal Field 6","Decimal Field 7","Decimal Field 8");//No I18N
        fields = fields2;
        fieldsLabel =fieldsLabel2;
    }
    if(moduleName.indexOf("ServiceCatalog_Fields") > 0)
    {
        var fields2 = new Array("GUDF_CHAR1", "GUDF_CHAR2", "GUDF_CHAR3", "GUDF_CHAR4", "GUDF_CHAR5", "GUDF_CHAR6", "GUDF_CHAR7", "GUDF_CHAR8", "GUDF_CHAR9", "GUDF_CHAR10", "GUDF_CHAR11", "GUDF_CHAR12", "GUDF_CHAR13", "GUDF_CHAR14", "GUDF_CHAR15", "GUDF_CHAR16", "GUDF_CHAR17", "GUDF_CHAR18", "GUDF_CHAR19", "GUDF_CHAR20", "GUDF_CHAR21", "GUDF_CHAR22", "GUDF_CHAR23", "GUDF_CHAR24", "GUDF_LONG1", "GUDF_LONG2", "GUDF_LONG3", "GUDF_LONG4", "GUDF_LONG5", "GUDF_LONG6", "GUDF_LONG7", "GUDF_LONG8", "GUDF_DATE1", "GUDF_DATE2", "GUDF_DATE3", "GUDF_DATE4", "GUDF_DATE5", "GUDF_DATE6", "GUDF_DATE7", "GUDF_DATE8","GUDF_DOUBLE1","GUDF_DOUBLE2","GUDF_DOUBLE3","GUDF_DOUBLE4","GUDF_DOUBLE5","GUDF_DOUBLE6","GUDF_DOUBLE7","GUDF_DOUBLE8"); //No I18N
        var fieldsLabel2 = new Array("Text Field 1","Text Field 2", "Text Field 3","Text Field 4","Text Field 5","Text Field 6","Text Field 7","Text Field 8","Text Field 9","Text Field 10","Text Field 11","Text Field 12","Text Field 13","Text Field 14","Text Field 15","Text Field 16","Text Field 17","Text Field 18","Text Field 19","Text Field 20","Text Field 21","Text Field 22","Text Field 23","Text Field 24","Numeric Field 1","Numeric Field 2","Numeric Field 3","Numeric Field 4","Numeric Field 5","Numeric Field 6","Numeric Field 7","Numeric Field 8","Date/Time Field 1", "Date/Time Field 2","Date/Time Field 3","Date/Time Field 4","Date/Time Field 5","Date/Time Field 6","Date/Time Field 7","Date/Time Field 8","Decimal Field 1","Decimal Field 2","Decimal Field 3","Decimal Field 4","Decimal Field 5","Decimal Field 6","Decimal Field 7","Decimal Field 8");//No I18N
        fields = fields2;
        fieldsLabel =fieldsLabel2;
    }
    if(moduleName.substr(0,11) == "ServiceReq_")
    {
        var fields2 = new Array("UDF_CHAR1", "UDF_CHAR2", "UDF_CHAR3", "UDF_CHAR4", "UDF_CHAR5", "UDF_CHAR6", "UDF_CHAR7", "UDF_CHAR8", "UDF_CHAR9", "UDF_CHAR10", "UDF_CHAR11", "UDF_CHAR12", "UDF_CHAR13", "UDF_CHAR14", "UDF_CHAR15", "UDF_CHAR16", "UDF_CHAR17", "UDF_CHAR18", "UDF_CHAR19", "UDF_CHAR20", "UDF_CHAR21", "UDF_CHAR22", "UDF_CHAR23", "UDF_CHAR24", "UDF_LONG1", "UDF_LONG2", "UDF_LONG3", "UDF_LONG4", "UDF_LONG5", "UDF_LONG6", "UDF_LONG7", "UDF_LONG8", "UDF_DATE1", "UDF_DATE2", "UDF_DATE3", "UDF_DATE4", "UDF_DATE5", "UDF_DATE6", "UDF_DATE7", "UDF_DATE8","UDF_DOUBLE1","UDF_DOUBLE2","UDF_DOUBLE3","UDF_DOUBLE4","UDF_DOUBLE5","UDF_DOUBLE6","UDF_DOUBLE7","UDF_DOUBLE8"); //No I18N
        var fieldsLabel2 = new Array("Text Field 1","Text Field 2", "Text Field 3","Text Field 4","Text Field 5","Text Field 6","Text Field 7","Text Field 8","Text Field 9","Text Field 10","Text Field 11","Text Field 12","Text Field 13","Text Field 14","Text Field 15","Text Field 16","Text Field 17","Text Field 18","Text Field 19","Text Field 20","Text Field 21","Text Field 22","Text Field 23","Text Field 24","Numeric Field 1","Numeric Field 2","Numeric Field 3","Numeric Field 4","Numeric Field 5","Numeric Field 6","Numeric Field 7","Numeric Field 8","Date/Time Field 1", "Date/Time Field 2","Date/Time Field 3","Date/Time Field 4","Date/Time Field 5","Date/Time Field 6","Date/Time Field 7","Date/Time Field 8","Decimal Field 1","Decimal Field 2","Decimal Field 3","Decimal Field 4","Decimal Field 5","Decimal Field 6","Decimal Field 7","Decimal Field 8");//No I18N
        fields = fields2;
        fieldsLabel =fieldsLabel2;
    }
    if(moduleName == "WorkLog_Fields")
    {
        var fields4 = new Array("UDF_CHAR1","UDF_CHAR2","UDF_CHAR3","UDF_CHAR4","UDF_CHAR5","UDF_CHAR6","UDF_CHAR7","UDF_CHAR8","UDF_CHAR9","UDF_CHAR10","UDF_CHAR11","UDF_CHAR12","UDF_CHAR13","UDF_CHAR14","UDF_CHAR15","UDF_CHAR16","UDF_CHAR17","UDF_CHAR18","UDF_CHAR19","UDF_CHAR20","UDF_CHAR21","UDF_CHAR22","UDF_CHAR23","UDF_CHAR24","UDF_LONG1","UDF_LONG2","UDF_LONG3","UDF_LONG4","UDF_LONG5","UDF_LONG6","UDF_LONG7","UDF_LONG8","UDF_DATE1","UDF_DATE2","UDF_DATE3","UDF_DATE4","UDF_DATE5","UDF_DATE6","UDF_DATE7","UDF_DATE8");//No I18N
        var fieldsLabel4 = new Array("Text Field 1","Text Field 2", "Text Field 3","Text Field 4","Text Field 5","Text Field 6","Text Field 7","Text Field 8","Text Field 9","Text Field 10","Text Field 11","Text Field 12","Text Field 13","Text Field 14","Text Field 15","Text Field 16","Text Field 17","Text Field 18","Text Field 19","Text Field 20","Text Field 21","Text Field 22","Text Field 23","Text Field 24","Numeric Field 1","Numeric Field 2","Numeric Field 3","Numeric Field 4","Numeric Field 5","Numeric Field 6","Numeric Field 7","Numeric Field 8","Date/Time Field 1", "Date/Time Field 2","Date/Time Field 3","Date/Time Field 4","Date/Time Field 5","Date/Time Field 6","Date/Time Field 7","Date/Time Field 8");//No I18N
        fields = fields4;
        fieldsLabel =fieldsLabel4;
    }
    if(moduleName == "Change_Fields")
    {

        var fields5 = [] ;
        constructUDFFieldData(fields5, "UDF_CHAR", 100);   //No I18N
        constructUDFFieldData(fields5, "UDF_LONG", 50);   //No I18N
        constructUDFFieldData(fields5, "UDF_DATE", 50);   //No I18N
        fields = fields5;

        var fieldsLabel5 = [];
        constructUDFFieldData(fieldsLabel5, "Text Fields ", 100);   //No I18N
        constructUDFFieldData(fieldsLabel5, "Numeric Field ", 50);   //No I18N
        constructUDFFieldData(fieldsLabel5, "Date/Time Field ", 50);   //No I18N
        fieldsLabel = fieldsLabel5;

        //Initialising variables for ChangeUDFs
        var allTemplateIds  = getAllChangeTemplates();
        var isTemplateEmpty = false ;
        var isStageEmpty = false;
        var templateUnMappedAliasesNames = [] ;
        var templateUnMappedTypes = [] ;
        var stageUnMappedAliasesNames = [] ;
        var stageUnMappedTypes = [] ;
        var isPickListOptionEmpty = false;
        var PickListOptionEmptyAliasesNames = [] ;
        var PickListOptionEmptyTypes = [] ;
    }
    var bkslashchk = "no";//No I18N
    var bkeditpage = "no";//No I18N




    var aliasNameObject={};
    for(var cnt=0; cnt<fields.length;cnt++) {
        var fixedLength;
        var onlyNum = "false";
        var colName = fields[cnt];
        var adminLabel = fieldsLabel[cnt];
        var aliasName = document.UDFForm[colName + "_TXT"].value;//No I18N
        var columnAliasesId;


            columnAliasesId = document.UDFForm[colName + "_TXT"].id;//No I18N
            columnAliasesId = columnAliasesId.split('_').last();

        if(trim(aliasName) != "") {
        	var stageMappingId ;
            var templateIds = [];
            var desc = document.UDFForm[colName + "_DESC"].value;//No I18N
            var fieldType = "Single Line";//No I18N
            var defaultValue = "";
            if(colName.indexOf("UDF_LONG") >= 0) {
                fieldType = "Numeric Field";//No I18N
                if(document.UDFForm[colName+"_LGTH"]!= null && document.UDFForm[colName+"_LGTH"].value != '0' && document.UDFForm[colName+"_LGTH"].value != '-1')             // Getting length of the Numeric field.
                {
                    fixedLength = document.UDFForm[colName+"_LGTH"].value; // No I18N
                }
                else
                {
                    fixedLength = -1;
                }
            }
            else if(colName.indexOf("UDF_DATE") >= 0){
                fieldType = "Date/Time Field";//No I18N
            }
            else if(colName.indexOf("UDF_COST") >= 0){
                var types = document.UDFForm[colName + "_TYPE"];//No I18N
                fieldType="ADD";//No I18N
                for(var i=0; i<types.length; i++) {
                    if(types[i].checked == true) {
                        fieldType = types[i].value;
                    }
                }
                if(fieldType == "ADD") {
                    defaultValue = document.UDFForm[colName + "_ADD_DEFAULT"].value;//No I18N
                }
                else if(fieldType == "SUBSTRACT") {
                    defaultValue = document.UDFForm[colName + "_SUBSTRACT_DEFAULT"].value;//No I18N
                    if( trim(defaultValue) == '' )
                    {
                        defaultValue = document.UDFForm[colName + "_ADD_DEFAULT"].value;//No I18N
                    }
                }
                defaultValue = trim(defaultValue)
                if(defaultValue!= '' && isDouble(defaultValue)==false)
                {
                    //Calling from saving UDF fields page
                    alert(getMessageForKey("sdp.purchase.common.invalidnumber.errmsg"));//No I18N
                    document.UDFForm[colName + "_"+fieldType+"_DEFAULT"].focus();//No I18N
                    return false;
                }
            }
            else if( colName.indexOf("UDF_DOUBLE") >= 0 ) { // Getting decimal additional field entry.
                fieldType = "Decimal Field";//No I18N
            }
            else {
                var types = document.UDFForm[colName + "_TYPE"];//No I18N
                for(var i=0; i<types.length; i++) {
                    if(types[i].checked == true) {
                        fieldType = types[i].value;
                    }
                }
                if(fieldType == "Single Line") {
                    defaultValue = document.UDFForm[colName + "_SLINE_DEFAULT"].value;//No I18N
                    if(document.UDFForm[colName+"_LGTH"] != null && document.UDFForm[colName+"_LGTH"].value != '0' && document.UDFForm[colName+"_LGTH"].value != '-1')             // Getting length of the Numeric field.
                    {
                        fixedLength = document.UDFForm[colName+"_LGTH"].value; // No I18N
                    }
                    else
                    {
                        fixedLength = -1;
                    }
                    if(document.UDFForm[colName+"_LGTH"] != null && document.UDFForm[colName+"_NUM"].checked)             // Getting length of the Numeric field.
                    {
                        onlyNum = "true"; // No I18N
                    }
                }
                else if(fieldType == "Multi Line") {
                    defaultValue = document.UDFForm[colName + "_MLINE_DEFAULT"].value;//No I18N
                    defaultValue = defaultValue.replace(/\n/g,"##N##");//No I18N
                }
                else if(fieldType == "Pick List") {
                //without this fix columnAliasesId will be TXT which updates incorrect field_id in udf_pickliatvalues table
                    if(columnAliasesId == "TXT"){
                          columnAliasesId = columnAliasesId+cnt;
                    }
                    defaultValue = document.UDFForm[colName + "_LIST_SELECTED"].value;//No I18N
                    var selObj = document.UDFForm[colName + "_LIST_SELECTED"];//No I18N
                    var sortArray = new Array(selObj.options.length);
                    for(var j = 0; j < selObj.options.length; j++) {
                        var val =  selObj.options[j].value;
                        if(val.indexOf("\\")!=-1)
                        {
                            if(bkslashchk == "no")
                            {
                                allowreplac = confirm(getMessageForKey("sdp.admin.additionfields.replacemsg"));//No I18N
                                if(allowreplac)
                                {
                                    bkslashchk = "yes";//No I18N
                                }
                                else
                                {
                                    bkeditpage ="yes";//No I18N
                                    break;
                                }
                            }
                            if(bkslashchk == "yes")
                            {
                                val = val.replace(/\\/g, "\/");
                            }
                        }
                        val = encodeHTML(val);
                        sortArray[j]=val;
                    }
                    if(moduleName=='Change_Fields' && sortArray.length == 0){
                    isPickListOptionEmpty=true;
                    PickListOptionEmptyAliasesNames.push(aliasName);
                    PickListOptionEmptyTypes.push(fieldType);
                    }
                    sortArray.sort();
                    for(var j = 0; j < selObj.options.length; j++){
                        var val = sortArray[j];
                        daob.addRowsForTable("UDF_PickListValues",new Array(new Array("TABLENAME",moduleName),new Array("FIELD_ID", columnAliasesId),new Array("COLUMNNAME", colName), new Array("VALUE", val)));//No I18N
                    }
                }
            }
            if(aliasName.indexOf("\\")!=-1 || desc.indexOf("\\")!=-1 || defaultValue.indexOf("\\")!=-1)
            {
                if(bkslashchk == "no")
                {
                    allowreplac = confirm(getMessageForKey("sdp.admin.additionfields.replacemsg"));//No I18N
                    if(allowreplac)
                    {
                        bkslashchk = "yes";//No I18N
                    }
                    else
                    {
                        bkeditpage ="yes";//No I18N
                        break;
                    }
                }
                if(bkslashchk == "yes")
                {
                    aliasName = aliasName.replace(/\\/g, "\/");
                    desc = desc.replace(/\\/g, "\/");
                    defaultValue = defaultValue.replace(/\\/g, "\/");
                }
            }
            notEncodedAliasName = aliasName;
            aliasName = encodeHTML(aliasName);
            desc = encodeHTML(desc);
            defaultValue = encodeHTML(defaultValue);

            if(moduleName=="Change_Fields" )
            {
                //Getting Valid ColAliasId from server for newly added changeUDFs
            	if(columnAliasesId === "TXT" || columnAliasesId === "")
                {

                    columnAliasesId =  colName ;
                }
                //Adding columnaliasid in case of change module in order to prevent creation of new ids everytime we save additional fields.
                var columnAliasArray = [["COLUMNALIASESID",columnAliasesId], ["TABLENAME",moduleName], ["COLUMNNAME", colName], ["ALIASNAME", aliasName], ["COLUMNDESC", desc], ["DEFAULT_VALUE", defaultValue], ["FIELD_TYPE", fieldType], ["ADMINLABEL", adminLabel]];
            	if(colName.indexOf("UDF_LONG") >= 0)
                {
                    columnAliasArray.push(["FIXED_LENGTH", fixedLength]);
                    daob.addRowsForTable("ColumnAliases",columnAliasArray);  // Inserting fixed length in columnalias table //No I18N
                }
                else if(colName.indexOf("UDF_CHAR") >= 0 && fieldType == "Single Line") // Adding length and allowed numeric  details only for single line additional field
                {
                    columnAliasArray.push(["FIXED_LENGTH", fixedLength], ["ONLY_NUMERIC", onlyNum]);
                    daob.addRowsForTable("ColumnAliases",columnAliasArray);  // Inserting fixed length in columnalias table //No I18N
                }
                else
                {
                    daob.addRowsForTable("ColumnAliases",columnAliasArray);//No I18N
                }
                //Adding changetemplate and stage mapping for changeUDFs
            	stageMappingId = document.getElementById(colName + "_StageMapping").value ;//No I18N
                if(!stageMappingId){
                    isStageEmpty = true;
                    stageUnMappedAliasesNames.push(notEncodedAliasName);
                    stageUnMappedTypes.push(fieldType);
                }

                templateIds = jQuery("#"+colName + "_TemplateMapping").val();//No I18N
                var isAllTemplatesSelected = false ;
                if(templateIds.length != 0)
                {
                    if(templateIds[0] == -1)
                    {
                        isAllTemplatesSelected = true ;
                    }
                    if(isAllTemplatesSelected)
                    {
                        for(var i=0 ; i<allTemplateIds.length ; i++)
                        {
                          var tempId = allTemplateIds[i] ;
                          daob.addRowsForTable("ChangeTemplate_UDF_Mapping",new Array(new Array("COLUMN_ALIASES_ID",columnAliasesId),new Array("TEMPLATEID",tempId), new Array("STAGEID",stageMappingId)));//Adding templates and stage mappings //No I18N
                        }
                    }
                    else
                    {
                        for(var i=0 ; i<templateIds.length ; i++)
                        {
                          var tempId = templateIds[i] ;
                          daob.addRowsForTable("ChangeTemplate_UDF_Mapping",new Array(new Array("COLUMN_ALIASES_ID",columnAliasesId),new Array("TEMPLATEID",tempId), new Array("STAGEID",stageMappingId)));//Adding templates and stage mappings //No I18N
                        }
                    }
                }
                else
                {
                    isTemplateEmpty = true ;
                    templateUnMappedAliasesNames.push(notEncodedAliasName) ;
                    templateUnMappedTypes.push(fieldType) ;
                }
            }
            else
            {
                if(colName.indexOf("UDF_LONG") >= 0)
                {
                    daob.addRowsForTable("ColumnAliases",new Array(new Array("COLUMNALIASESID",columnAliasesId),new Array("TABLENAME",moduleName),new Array("COLUMNNAME", colName), new Array("ALIASNAME", aliasName), new Array("COLUMNDESC", desc), new Array("DEFAULT_VALUE", defaultValue), new Array("FIELD_TYPE", fieldType), new Array("ADMINLABEL", adminLabel), new Array("FIXED_LENGTH", fixedLength) ));  // Inserting fixed length in columnalias table //No I18N
                }
                else if(colName.indexOf("UDF_CHAR") >= 0 && fieldType == "Single Line"){    // Adding length and allowed numeric  details only for single line additional field
                    daob.addRowsForTable("ColumnAliases",new Array(new Array("COLUMNALIASESID",columnAliasesId),new Array("TABLENAME",moduleName),new Array("COLUMNNAME", colName), new Array("ALIASNAME", aliasName), new Array("COLUMNDESC", desc), new Array("DEFAULT_VALUE", defaultValue), new Array("FIELD_TYPE", fieldType), new Array("ADMINLABEL", adminLabel), new Array("FIXED_LENGTH", fixedLength), new Array("ONLY_NUMERIC", onlyNum) ));  // Inserting fixed length in columnalias table //No I18N
                }
                else{
                    daob.addRowsForTable("ColumnAliases",new Array(new Array("COLUMNALIASESID",columnAliasesId),new Array("TABLENAME",moduleName),new Array("COLUMNNAME", colName), new Array("ALIASNAME", aliasName), new Array("COLUMNDESC", desc), new Array("DEFAULT_VALUE", defaultValue), new Array("FIELD_TYPE", fieldType), new Array("ADMINLABEL", adminLabel)));//No I18N
                }
            }


        }
        /*
         * aliasNameObject format example - {pick1: "Pick List", text1: "Single Line", text2: "Single Line"}
         */

        if(trim(aliasName) in aliasNameObject){
            showalert("failure",getMessageForKey("sdp.problemchange.additionalfield.duplicate.error",[trim(aliasName),fieldType,trim(aliasName),aliasNameObject[aliasName]]),"isAutoHide");//NO I18N
            return false;
        }
        if(trim(aliasName)!=""){
            aliasNameObject[aliasName]=fieldType;
        }
    }
    if(isTemplateEmpty) // Setting appropriate error messages for empty template mapped changeUDFs
    {
        var templateErrorMessage = getMessageForKey("sdp.change.additionalfield.mapping.error") ; //No I18N
        for(var i=0; i<templateUnMappedAliasesNames.length ; i++)
        {
        	var oneFieldErrorMessage = templateUnMappedAliasesNames[i] + "-" + templateUnMappedTypes[i] ; //No I18N
        	templateErrorMessage = templateErrorMessage + "<br>" + encodeHTML(oneFieldErrorMessage) ; //No I18N
        }
    	showalert("failure",templateErrorMessage,"isAutoHide");//NO I18N
        return false ;
    }
    if(isStageEmpty) // Setting appropriate error messages for empty stage mapped changeUDFs
    {
        var stageErrorMessage = getMessageForKey("sdp.change.additionalfield.stagemapping.error") ; //No I18N
        for(var i=0; i<stageUnMappedAliasesNames.length ; i++)
        {
            var oneFieldErrorMessage = stageUnMappedAliasesNames[i] + "-" + stageUnMappedTypes[i] ; //No I18N
            stageErrorMessage = stageErrorMessage + "<br>" + encodeHTML(oneFieldErrorMessage) ; //No I18N
        }
        showalert("failure",stageErrorMessage,"isAutoHide");//NO I18N
        return false ;
    }
    if(isPickListOptionEmpty)
    {
    var pickListErrorMessage = getMessageForKey("sdp.change.additionalfield.picklist.error") ; //No I18N
            for(var i=0; i<PickListOptionEmptyAliasesNames.length ; i++)
            {
                var oneFieldErrorMessage = PickListOptionEmptyAliasesNames[i] + "-" + PickListOptionEmptyTypes[i] ; //No I18N
                pickListErrorMessage = pickListErrorMessage + "<br>" + encodeHTML(oneFieldErrorMessage) ; //No I18N
            }
            showalert("failure",pickListErrorMessage,"isAutoHide");//NO I18N
            return false ;
    }
    if(bkeditpage=="yes")
    {
        return false;
    }
    document.SubmitForm.XML.value = daob.constructXML();
    if(categoryVal!=null)
    {
        document.SubmitForm.serviceCategory.value = categoryVal;
    }
    document.SubmitForm.submit();
    return false;
}


/**
 * For udf field array construction
 * @param {*[]} fieldArray
 * @param {string} fieldType
 * @param {number} count
 */
var constructUDFFieldData=function (fieldArray, fieldType, count){
    for(var i =1 ; i<=count ; i++){
        fieldArray.push(fieldType + i);
    }
}
function changeUDFTab(id, id1, id2, id3, id4)
{
    if( id != undefined && id != 'null' ){
    document.getElementById(id).className = "show";//No I18N
        document.getElementById(id + "_tab").className = "subtabon";//No I18N
    }
    if( id1 != undefined && id1 != 'null' ){
        document.getElementById(id1).className = "hide";//No I18N
        document.getElementById(id1 + "_tab").className = "subtaboff";//No I18N
    }
    if( id2 != undefined && id2 != 'null' ){
        document.getElementById(id2).className = "hide";//No I18N
        document.getElementById(id2 + "_tab").className = "subtaboff";//No I18N
    }
    if( id3 != undefined && id3 != 'null' )
    {
        document.getElementById(id3).className = "hide";//No I18N
        document.getElementById(id3 + "_tab").className = "subtaboff";//No I18N
    }
    if( id4 != undefined && id4 != 'null' && document.getElementById(id4) != null) // showing decimal tab
    {
        document.getElementById(id4).className = "hide";//No I18N
        var tab = document.getElementById(id4 + "_tab");
        if(tab != null)
        {
            document.getElementById(id4 + "_tab").className = "subtaboff";//No I18N
        }
    }
    /*79616 -- window scroll event trigger for fixedformfooter in tab change event*/
    if(jQuery('[data-id=form-footer]').length == 1 && jQuery('[name=UDFForm]').length == 1) {
		jQuery('[data-id=form-footer],[name=UDFForm]').removeAttr('style');//No I18N
	}
    if(id=="autosite"){
        jQuery("#autosite").load("/asset/AutoSiteAllocation.jsp");// NO I18N
    }
}
function populateUDFFields(jsdo) {
    var colAli = jsdo.getRowsForTable("ColumnAliases");//No I18N
    if(colAli == null) {
        return;
    }
    for(var cnt=0; cnt < colAli.length; cnt++) {
        var colName = colAli[cnt].COLUMNNAME;
        var ftype = colAli[cnt].FIELD_TYPE;
        var def = colAli[cnt].DEFAULT_VALUE;
        document.UDFForm[colName + "_TXT"].value = colAli[cnt].ALIASNAME;//No I18N
        if(colAli[cnt].TABLENAME.toLowerCase()=="change_fields" || colAli[cnt].TABLENAME.toLowerCase()=="problem_fields" || colAli[cnt].TABLENAME.toLowerCase()=="contract_fields"){
        document.UDFForm[colName+"_TXT"].id=colAli[cnt].TABLENAME+"_"+colAli[cnt].COLUMNALIASESID;//No I18N
        }
        document.UDFForm[colName + "_DESC"].value = colAli[cnt].COLUMNDESC;//No I18N
        if(colName.indexOf("UDF_CHAR") >= 0 || colName.indexOf("UDF_COST") >= 0) {
            var types = document.UDFForm[colName + "_TYPE"];//No I18N
            for(var i=0; i<types.length; i++) {
				if(colAli[cnt].TABLENAME.toLowerCase()=="purchaseorder_fields" && colName.indexOf("UDF_COST") >= 0) {
					var costType = JSON.parse(colAli[cnt].CONFIG_JSON);
					if(types[i].value == costType.OPERATION) {
						types[i].checked = true;
					}
			    }
				else {
				    if(types[i].value == ftype) {
						types[i].checked = true;
            }
				}
            }
        }
        else if (colName.indexOf("UDF_LONG") >= 0){
            if(colAli[cnt]["FIXED_LENGTH"]!=-1)
            {
                document.UDFForm[colName + "_LGTH"].value = colAli[cnt]["FIXED_LENGTH"];    // populating fixed length in Numeric fileds. //No I18N
            }
        }
        if(ftype == "Single Line") {
            chooseType(colName + "_SLINE", colName + "_MLINE", colName + "_SELECTFIELD");//No I18N
            document.UDFForm[colName + "_SLINE_DEFAULT"].value = def;//No I18N
            if(colAli[cnt]["FIXED_LENGTH"]!=-1)
            {
                document.UDFForm[colName + "_LGTH"].value = colAli[cnt].FIXED_LENGTH;    // populating fixed length in text fields. //No I18N
            }
            if(colAli[cnt]["ONLY_NUMERIC"] == "true" ){
                document.UDFForm[colName + "_NUM"].checked='true';    // Allowing numeric //No I18N
            }
        }
        else if(ftype == "Multi Line") {
            chooseType(colName + "_MLINE", colName + "_SLINE", colName + "_SELECTFIELD");//No I18N
            document.UDFForm[colName + "_MLINE_DEFAULT"].value = def;//No I18N
        }
        else if(ftype == "ADD") {
            chooseType(colName + "_ADD", colName + "_SUBSTRACT", colName + "_SELECTFIELD");//No I18N
            document.UDFForm[colName + "_ADD_DEFAULT"].value = def;//No I18N
        }
        else if(ftype == "SUBSTRACT") {
            chooseType(colName + "_SUBSTRACT", colName + "_ADD", colName + "_SELECTFIELD");//No I18N
            document.UDFForm[colName + "_SUBSTRACT_DEFAULT"].value = def;//No I18N
        }
        else if(ftype == "Pick List") {
            chooseType(colName + "_SELECTFIELD", colName + "_SLINE", colName + "_MLINE");//No I18N
            var pickList = jsdo.getRows("UDF_PickListValues","COLUMNNAME",colName);//No I18N
            var selObj = document.UDFForm[colName + "_LIST_SELECTED"];//No I18N
            for(var j=0; j<pickList.length; j++) {
                selObj.options[j] = new Option(pickList[j].VALUE, pickList[j].VALUE, true, false);
                jQuery(selObj.options[j]).attr('title',encodeHTMLAttribute(pickList[j].VALUE)).attr('rel','uitooltip');
                if(pickList[j]["VALUE"] == def){
                    selObj.options[j].selected = true;
                }
            }
            initTooltip('#udfTextType'); //NO I18N
        }
    }
}
/**
 * Check length limit for text and numeric additional field
 * @elem - sends element value, @field - differentiate text and numeric field
 **/
function checkLengthLimit(elem,field)
{
    var value = elem.value.toString().trim();
    if(value !='')
    {
        if(field == 'Text')
        {
            if(value > 250 || !checklong(elem) || value =='0' )
            {
                alert(getMessageForKey("sdp.admin.customfields.fixedlength.textlimit"));//No I18N
                elem.value="";
                elem.focus();
            }
        }
        else if(field == 'Numeric')
        {
            if(value > 19  || !checklong(elem) || value =='0')
            {
                alert(getMessageForKey("sdp.admin.customfields.fixedlength.numericlimit"));//No I18N
                elem.focus();
                elem.value="";
            }
        }
    }
}

function showHideMoveAssetTDS(siteId) {
    if(document.getElementById('updateButton') != null && document.getElementById('updateButton').style.display != 'none') {
        var previousSite = document.getElementById("previousSiteId").value;
        if(previousSite != siteId) {
            $('moveAssetsAlsoId1').style.display= '';
            $('moveAssetsAlsoId2').style.display= '';
        }
        else {
            Hide('moveAssetsAlsoId1');//NO I18N
            Hide('moveAssetsAlsoId2');//NO I18N
        }
    }
}
function deleteAccessLogs(form)
{
    var valid = checkForDelete(form,"checkbox");//NO I18N
    if(valid)
    {
        valid = confirm(document.getElementById("sdp.admin.api.accesslogs.delete.confirmmsg").innerHTML);//NO I18N
        if(valid)
        {
            displayLoadingInformation(null,document.getElementById('sdp.admin.settings.technician.deletelogin.message').innerHTML, false);//NO I18n
            var selectedObj = document.getElementsByName("checkbox");//NO I18N
            var param = "action=deleteaccesslogs";//No I18N
            for( i=0; i<selectedObj.length; i++ )
            {
                if( selectedObj[i].checked )
                {
                    param += "&logIds=" + selectedObj[i].value;//NO I18N
                }
            }
        }
    }
    else
    {
        alert(getMessageForKey('sdp.admin.api.accesslogs.delete.choosemsg'));//No I18N
        return false;
    }
}

function getDepartmentCheckBoxes(form) {
    var selectedVals = new Array();
    var elems = form.elements;
    for(var i = 0; i < elems.length; i++) {
        if(elems[i].type == "checkbox" && elems[i].name == 'delDepList') {
            if(elems[i].checked) {
                selectedVals[selectedVals.length] = elems[i].value;
            }
        }
    }
    return selectedVals;
}



//Method used in AdminErrorLogListView.jsp
function validateSystemLogDelete(formObj) {
    var result = confirmDelete(formObj,'checkbox',document.getElementById('confirmerrdelete').innerHTML,document.getElementById('chooseerrorlog').innerHTML);//No i18N
    if(result) {
        var action = formObj.action;
        if(action.indexOf("?") > 0) {
            action = action + "&mode=delete";//No i18N
        }
        else {
            action = action + "?mode=delete";//No i18N
        }
        formObj.action = action;
        formObj.submit();
    }
}
//Method used in AdminErrorLogListView.jsp
function confirmLogDeleteAll(formObj) {
    var result = confirmSubmit(document.getElementById('confirmalldelete').innerHTML);//No i18N
    if(result) {
        var action = formObj.action;
        if(action.indexOf("?") > 0) {
            action = action + "&mode=deleteAll";//No i18N
        }
        else {
            action = action + "?mode=deleteAll";//No i18N
        }
        formObj.action = action;
        formObj.submit();
    }
}
/*
 *This function included for settings.jsp,
 *SD-40142, Hiding the 'My details' tab from the requester
 */
function checkShowEdit(fromEdit)
{
    var showEdit = document.getElementById("shownedit");
    var show = document.getElementById("ShowDetail");
    var hide = document.getElementById("hide");
    var showAddFields = document.getElementById("showWithAdditionalFields");
    if(show) {
        if(showEdit && showEdit.checked)
        {
            show.checked = true ;
            show.disabled = true ;
        }
        else
        {
            show.disabled = false ;
        }
    }
    if(fromEdit==undefined) {
        fromEdit = true;
    }
    checkShow(fromEdit);
}
function checkShow(fromEdit)
{
    var showEdit = document.getElementById("shownedit");
    var show = document.getElementById("ShowDetail");
    var hide = document.getElementById("hide");
    var showAddFields = document.getElementById("showWithAdditionalFields");
    if(showEdit && show) {
        if (showEdit.checked == false && show.checked == false ) {
            hide.className = 'show mandatory nobold';
        }
        else{
            hide.className = 'hide';
        }

        if (showEdit.checked == true) {
            showAddFields.disabled = true;
            showAddFields.checked = true;
            jQuery(showAddFields.next('label')).removeClass("text-muted");
        }
        else {
            if(fromEdit == true) {
                showAddFields.checked = true;
            }
            else if(fromEdit != false) {
                showAddFields.checked = false;
            }
            showAddFields.disabled = !show.checked;
            if(showAddFields.disabled) {
                jQuery(showAddFields.next('label')).addClass("text-muted");
            }
            else {
                jQuery(showAddFields.next('label')).removeClass("text-muted");
            }
        }
    }
}
function checkLoginDetails(userName, userDomain)
{
    try {
        if(!userDomain){
            userDomain = "None"; // No I18N
        }
        parent.invokeProgressIndicator(null,'sdp.common.check.duplicatelogin','progress'); // No I18N
        var module = "CheckLogin"; // No I18N
                var params = "module=" + module; // No I18N
        params += "&userName=" + encodeURIComponent(userName); // No I18N
        params += "&userDomain=" + encodeURIComponent(userDomain); // No I18N
        params += getCSRFParamURL(false);
                callAjaxRequest('/TechnicianDef.do',params, module); // No I18N
         }
         catch(e) {
                 alert("Error while invoking ajax request : " + e.message); // No I18N
         }
}
function validateReplyMailID()
{
    // issue ID  SD-13818
    if (document.queueForm.senderName.value !=null && !isEmpty(document.queueForm.senderName.value) ) {
        if (document.queueForm.senderEMail.value ==null || isEmpty(document.queueForm.senderEMail.value) ) {
            alert(getMessageForKey("sdp.jserror.senderemail"));
            document.queueForm.senderEMail.focus();
            return false;
        }
    }
    // issue ID  SD-13818
    if (document.queueForm.senderEMail.value !=null && !isEmpty(document.queueForm.senderEMail.value)) {
        if(validateFullName(document.queueForm.senderName))
        {
            if(document.queueForm.senderEMail.value != null && !isEmpty(document.queueForm.senderEMail.value) )
            {
                var sendermail = document.queueForm.senderEMail.value;
                var index = sendermail.indexOf(";");//No i18N
                if (index <= -1) {
                    index = sendermail.indexOf(",");//No i18N
                }
                if (index <= -1) {
                    if(validateEMailIDs(document.queueForm.senderEMail))
                    {
                        return true;
                    }
                    return false;
                }
                else {
                    alert(getMessageForKey("sdp.jserror.multiplesenderemail"));
                    return false;
                }
            }
        }
        return false;
    }
    // issue ID  SD-13818
    document.queueForm.senderEMail.value = trimAll(document.queueForm.senderEMail.value);
    document.queueForm.senderName.value = trimAll(document.queueForm.senderName.value);
    return true;
}

function addNetworkDeviceManufacturer(formObj) {
    if(formObj.manufacturerName.value.trim() == '') {
        alert(document.getElementById("ae.cmdb.cidetails.addInstanAttr.jserrorForAttributeName").innerHTML);
        formObj.manufacturerName.value = formObj.manufacturerName.value.trim();
        formObj.manufacturerName.focus();
        return false;
    }
    var vendorDropId = formObj.vendorDropId.value;

    var param="action=AddNetworkDeviceManaufacturer&manufacturer="+encodeURIComponent(formObj.manufacturerName.value.trim());//No I18N
    callCustomAjaxRequest('/servlet/AJaxServlet', param, addNetworkDeviceManufacturerSuccess, addNetworkDeviceManufacturerFailure,vendorDropId);//NO I18N
    return false;
}
function addNetworkDeviceManufacturerSuccess( requestObj, key )
{
    var responseObj = JSON.parse(requestObj.responseText);
    var manufacturerId = responseObj.manufacturerId;
    var selects = document.getElementsByTagName("select");
    for (var i=0;i<selects.length;i++)
    {
        var sel = selects[i];
        if (sel.name.indexOf("Vendor_") == 0)
        {
            var selectedId = sel.id;
            var selectedValue = sel.value;
            jQuery('select#'+selectedId).loadOptions(responseObj);//NO I18N
            if (sel.id.trim() == key.trim())
            {
                sel.value=manufacturerId;
            }
            else
            {
                sel.value = selectedValue;
            }
        }
    }
    closeDialog();
}
function addNetworkDeviceManufacturerFailure( requestObj, key )
{
    alert(requestObj.responseText);
}
var request = new XMLHttpRequest();
//Ajax method to retrieve details of UDF with columnAliasID

// Sort PickList & MultiSelect Values
function alphaSort(el){
    var people = jQuery('#'+el+' #select_list'),
      peopleli = people.children('option');//No I18N

    peopleli.sort(function(a,b){
      var an = a.text.toLowerCase(),
          bn = b.text.toLowerCase();

      if(an > bn){ return 1; }
      if(an < bn){ return -1; }
      return 0;
    });
    peopleli.detach().appendTo(people);
}

// Number Input
function validate(evt) {
    var theEvent = evt || window.event;
    key = theEvent.keyCode || theEvent.which;
    regex = /[0-9]|\./;
    TAB = 9, BACKSPACE = 8, DEL = 46, ARROW_KEYS = {left: 37, right: 39};
    if (key === TAB || key === BACKSPACE || key === DEL || key === ARROW_KEYS.left || key === ARROW_KEYS.right) { return true; }
    key = String.fromCharCode( key );
    if( !regex.test(key) ) {
    theEvent.returnValue = false;
    if(theEvent.preventDefault){ theEvent.preventDefault(); }
    }
}
var request = new XMLHttpRequest();
  ////Script for Secondary Email Id for Requester
var validateEmail = {
        getInvalidEmail: function(outArr){
            var leading = /^\s*/g;
            var trailing =/\s*$/g;
            var temp,len=outArr.length,invalidMail="";
            for (temp=0;temp<len;temp++) {

                var str = outArr[temp];
                leadingremoved = str.replace(leading,"");
                str = leadingremoved.replace(trailing,"");
                if (str.length > 0) {
                    var posadr1 = 0;
                    var posdot = str.indexOf(".");
                    var posadr = str.indexOf("@");
                    posadr1=str.lastIndexOf("@");//No I18N
                    if ( (posdot < 0) || (posadr < 0) || (posadr1 != posadr) ) {
                        invalidMail=invalidMail+encodeHTML(str) + "<br>";
                        continue;
                    }
                }
                var j = str.length;
                var strobj = str;
                if (strobj.charAt(j-1)=="." || strobj.charAt(0)=="@" || strobj.charAt(j-1)=="@" || strobj.charAt(0)=="." || strobj.charAt(0)=="-" ||  strobj.charAt(j-1)=="-" || strobj.charAt(j-1)=="_" || strobj.charAt(j-2)=="." || strobj.charAt(j-2)=="-" || strobj.charAt(j-2)=="_") {
                    //SD-131167 : Encoding email address string to prevent xss issue (hacksaw)
                    invalidMail=invalidMail+encodeHTML(str) + "<br>";
                    continue;
                }
            }
            return invalidMail;
        },
        validate: function(outArr) {
            var isOauth = document.getElementById("incAuthType").value == "oauth";      // No I18n
            var alertId = isOauth ? "incJavaOauthEmailAlert" : "invalidEmailAlert";     // No I18n
            var invalidListId = isOauth ? "incJavaOauthInvalidEmailList" : "invalidMailList";       // No I18n
            var invalidMailList = validateEmail.getInvalidEmail(outArr)
            if(invalidMailList == "") {
                document.getElementById(alertId).style.display='none';
                if(outArr.length != 0) {
                    RequesterDefForm.email.value = outArr[0];
                    //removing first element from a array
                    outArr.shift();
                    RequesterDefForm.mailList.value =outArr;
                    return true;
                } else {
	           /*  SD-62207 */
		   //Support ID : 7359308- issue in updating the requester details.if the e-mail address field is left blank and saved.
		   // The mail address is not left blank
		   RequesterDefForm.email.value="";
		}
            } else {
                document.getElementById(alertId).style.display='';
                validateEmail.hideNoteBox();
                document.getElementById(invalidListId).innerHTML = invalidMailList;
                return false;
            }
        },

        eliminateDuplicates: function(arr){
            var i,
                    len=arr.length,
                    out=[],
                    obj={};

            for (i=0;i<len;i++) {
                obj[arr[i]]=0;
            }
            for (i in obj) {
                if(i != "" && i != null) {
                    out.push(i);
                }
            }
            return out;
        },
    showNoteBox: function (ele) {
        var element = jQuery(ele);
        if(element.next('div').attr('id') != "invalidEmailAlert") {
            var st = "display:inline-block; z-index:10;"; //No I18N
            var elementId = element.attr('id');
            if("incGraphEmail" === elementId) {
                st += "top: 20px;"; //No I18N
            }
            element.after('<div id="email-notebox" class="form-inline-info pos-rel wspace-normal" style="' + st +'"><p id="email-notebox-p">' + getMessageForKey("sdp.admin.emailSeperation")+ '</p></div>');
        }
    },
    hideNoteBox: function () {
        jQuery('#email-notebox').remove();
    },
    hideAlert: function () {
        var isOauth = document.getElementById("incAuthType").value == "oauth";      // No I18n
        var alertId = isOauth ? "incJavaOauthEmailAlert" : "invalidEmailAlert";     // No I18n
        document.getElementById(alertId).style.display = 'none';
        validateEmail.hideNoteBox();
    },
        getTextToArray: function(){
            var textarea = document.getElementById("emailIDsList").value;
            textarea =textarea.replace(/(\r\n|\n|\r|\s)/gm,",");
            var mailArr = (textarea.trim()).split(",");
            mailArr =validateEmail.eliminateDuplicates(mailArr);
            mailArr =validateEmail.validate(mailArr);
            return mailArr;
        },
        addKeyListener: function() {
            var textarea = document.getElementById("emailIDsList");
            try {
                    textarea.addEventListener("keydown", validateEmail.keyPress, false);
            } catch (e) {
                    textarea.attachEvent("onkeydown", validateEmail.keyPress);
            }
        },
        keyPress:function(e) {
            // 13 --> Enter Action,32 for space , 188 for comma
            // 38 --> up key ,40 --> down key ,left key - 37, right key - 39
            if (e.keyCode === 13 || e.keyCode === 32 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40  || e.keyCode === 188 ) {
                    validateEmail.getTextToArray();
            } else {
                       return;
                }
        }


    }

//Defining some private constants.
var SITE_ADMIN_CONSTANTS = (function() {
     var privateVar = {
        //This below constant is used to mention the row count of the site list in the 'Change Site Association' popup during the site deletion.
        'REASSOC_SITELIST_ROWCOUNT': 5,//No I18N

        //String Constants.
        'COPY': 'copy',//No I18N
        'REFER': 'refer',//No I18N
        'CUSTOM': 'custom'//No I18N
     };

     return {
        get: function(name) { return privateVar[name]; }
    };
})();

var SiteAdmin = {
    //At last, remove all these global variables
    dataJson : {},
    choosenSites : {},
    outputJson : {},
    siteAssocParams : {},
    pageNumber : 0,
    
    checksiteassociation: function(selSites) {
        Try.these(
                function(){req = new XMLHttpRequest();},
                function(){req = new ActiveXObject("Msxml2.XMLHTTP");}
             );
        if(req){
            var url = "/SiteDef.do";//No I18N
                var params = "mode=siteassoc";//No I18N
            for(var i = 0; i < selSites.length; i++) {
                params += "&checkbox="+selSites[i];//No I18N
            }
            callCustomAjaxRequest('/SiteDef.do', params, SiteAdmin.showSiteAssociation, ajaxRequestOnFailure, selSites);//NO I18N
        }
    },
    showSiteAssociation: function(mess,selSites) {
        closeDialog(); //this is to close progress indicator
        //Setting global variables.
        SiteAdmin.dataJson = mess;
        SiteAdmin.choosenSites = selSites;
        if(mess.successCount>0) {
            jQ('.site-delete-success span').text(mess.successCount +" "+ getMessageForKey("sdp.admin.site.deletesite.success"));
            jQ('.site-delete-success').removeClass('hide'); //NO I18N
        }
        else {
            jQ('.site-delete-success').addClass('hide'); //NO I18N
        }
        if(Object.keys(mess.assocConfig).length !== 0)
        {
            showDialog(jQuery('#site-modify-dialog').html(),'title='+getMessageForKey("sdp.admin.site.changesite")+', width=1000, modal=yes, top=10, position=absmiddle');//No I18N
            //To populate site select list options.
            SiteAdmin.loadSiteAdminAssocPopup(mess,selSites);
        }        
        else
        {
            SiteAdmin.showParentSiteAssociation(mess, selSites);
        }




    },
    loadSiteAdminAssocPopup: function(mess,selSites){

        if(!mess) {mess=SiteAdmin.dataJson;}
        if(!selSites) {selSites=SiteAdmin.choosenSites;}

        var siteAssocDialog = jQuery("[id*='_DIALOG_CONTENT']");
        var assocConfig = mess.assocConfig;
        var assocConfigSiteMapLength = mess.assocConfigSiteMapLength;
        var assocConfigSiteKeyArray = mess.assocConfigSiteKeyArray;
        var assocConfigSiteValueArray = mess.assocConfigSiteValueArray;
        var siteAssocParams = SiteAdmin.siteAssocParams;
        siteAssocDialog.find('#site-modify-dialog').show();
        var opt = document.createElement("Option");
        var docFragment = document.createDocumentFragment();
        var tempOpt;

        var configname=null;
        if(assocConfig.users === true) {
            for (var i = 0; i < assocConfigSiteMapLength; i++) {
                key = assocConfigSiteKeyArray[i];
                value = assocConfigSiteValueArray[i];

                tempOpt = opt.cloneNode(false);
                tempOpt.title = value;
                tempOpt.innerText = value;
                tempOpt.value = key;
                docFragment.appendChild(tempOpt);
            }
            siteAssocDialog.find('#site-delete-assoc-requester').append(docFragment);
            siteAssocDialog.find('#site-delete-assoc-requester-tr').show();
            //To select already selected value on moving next/previous.
            if(siteAssocParams.reqdeptid) {
                siteAssocDialog.find('#site-delete-assoc-requester').val(siteAssocParams.reqdeptid);
            }
        }
        if(assocConfig.asset === true) {
            for (var i = 0; i < assocConfigSiteMapLength; i++) {
                key = assocConfigSiteKeyArray[i];
                value = assocConfigSiteValueArray[i];

                tempOpt = opt.cloneNode(false);
                tempOpt.title = value;
                tempOpt.innerText = value;
                tempOpt.value = key;
                docFragment.appendChild(tempOpt);
            }
            siteAssocDialog.find('#site-delete-assoc-assets').append(docFragment);
            siteAssocDialog.find('#site-delete-assoc-assets-tr').show();
            //To select already selected value on moving next/previous.
            if(siteAssocParams.assetsite) {
                siteAssocDialog.find('#site-delete-assoc-assets').val(siteAssocParams.assetsite);
            }
        }
        if(assocConfig.request_template === true) {
            for (var i = 0; i < assocConfigSiteMapLength; i++) {
                key = assocConfigSiteKeyArray[i];
                value = assocConfigSiteValueArray[i];

                tempOpt = opt.cloneNode(false);
                tempOpt.title = value;
                tempOpt.innerText = value;
                tempOpt.value = key;
                docFragment.appendChild(tempOpt);
            }
            siteAssocDialog.find('#site-delete-assoc-requesttemplate').append(docFragment);
            siteAssocDialog.find('#site-delete-assoc-requesttemplate-tr').show();
            //To select already selected value on moving next/previous.
            if(siteAssocParams.reqtempsite) {
                siteAssocDialog.find('#site-delete-assoc-requesttemplate').val(siteAssocParams.reqtempsite);
            }
        }
        if(assocConfig.pm_task === true) {
            for (var i = 0; i < assocConfigSiteMapLength; i++) {
                key = assocConfigSiteKeyArray[i];
                value = assocConfigSiteValueArray[i];

                tempOpt = opt.cloneNode(false);
                tempOpt.title = value;
                tempOpt.innerText = value;
                tempOpt.value = key;
                docFragment.appendChild(tempOpt);
            }
            siteAssocDialog.find('#site-delete-assoc-srequest').append(docFragment);
            siteAssocDialog.find('#site-delete-assoc-srequest-tr').show();
            //To select already selected value on moving next/previous.
            if(siteAssocParams.pmtasksite) {
                siteAssocDialog.find('#site-delete-assoc-srequest').val(siteAssocParams.pmtasksite);
            }
        }
        //Setting Heading Label
        var stepLabel1=1, stepLabel2 = 1;
        if(mess.parentSiteCount > 0) {
            stepLabel2++;
        }
        if(mess.hasInactiveSiteDept) {
            stepLabel2++;
        }
        var headingString = getMessageForKey("sdp.admin.siterefer.heading.label1").replace('{0}', stepLabel1).replace('{1}', stepLabel2) + " :";
        siteAssocDialog.find('[refer-entity]').html(headingString);

        if(!sdp_app.IS_AE){
            document.querySelector('#_DIALOG_CONTENT #js-event-SiteDef-24').addEventListener("click", function(event) { SiteAdmin.changeSiteAssociation() });  //No I18N
            document.querySelector('#_DIALOG_CONTENT #js-event-SiteDef-25').addEventListener("click", function(event) { SiteAdmin.cancelAll(); closeDialog(); });  //No I18N
            } else{
                document.querySelector('#_DIALOG_CONTENT #js-event-SiteDef_ae-3').addEventListener("click", function(event) { SiteAdmin.changeSiteAssociation() }); //No i18N
                document.querySelector('#_DIALOG_CONTENT #js-event-SiteDef_ae-4').addEventListener("click", function(event) { closeDialog(); }); //No i18N
            }
    },
    populateSelectBoxOptions: function(dialogBox){
        var opt = document.createElement("Option");
        var docFragment = document.createDocumentFragment();
        var tempOpt;
        var key, value;

        var parentOperHourSiteReferLength = SiteAdmin.dataJson.parentOperHourSiteReferLength;
        var parentOperHourSiteReferKeyArray = SiteAdmin.dataJson.parentOperHourSiteReferKeyArray;
        var parentOperHourSiteReferValueArray = SiteAdmin.dataJson.parentOperHourSiteReferValueArray;
        for (var i = 0; i < parentOperHourSiteReferLength; i++) {
            key = parentOperHourSiteReferKeyArray[i];
            value = parentOperHourSiteReferValueArray[i];

            tempOpt = opt.cloneNode(false);
            tempOpt.title = value;
            tempOpt.innerText = value;
            tempOpt.value = key;
            docFragment.appendChild(tempOpt);
        }
        dialogBox.find('#site-delete-select-oper').append(docFragment);

        var parentHoliSiteReferLength = SiteAdmin.dataJson.parentHoliSiteReferLength;
        var parentHoliSiteReferKeyArray = SiteAdmin.dataJson.parentHoliSiteReferKeyArray;
        var parentHoliSiteReferValueArray = SiteAdmin.dataJson.parentHoliSiteReferValueArray;
        for (var i = 0; i < parentHoliSiteReferLength; i++) {
            key = parentHoliSiteReferKeyArray[i];
            value = parentHoliSiteReferValueArray[i];

            tempOpt = opt.cloneNode(false);
            tempOpt.title = value;
            tempOpt.innerText = value;
            tempOpt.value = key;
            docFragment.appendChild(tempOpt);
        }
        dialogBox.find('#site-delete-select-holi').append(docFragment);

        var parentRestSiteReferLength = SiteAdmin.dataJson.parentRestSiteReferLength;
        var parentRestSiteReferKeyArray = SiteAdmin.dataJson.parentRestSiteReferKeyArray;
        var parentRestSiteReferValueArray = SiteAdmin.dataJson.parentRestSiteReferValueArray;
        for (var i = 0; i < parentRestSiteReferLength; i++) {
            key = parentRestSiteReferKeyArray[i];
            value = parentRestSiteReferValueArray[i];

            tempOpt = opt.cloneNode(false);
            tempOpt.title = value;
            tempOpt.innerText = value;
            tempOpt.value = key;
            docFragment.appendChild(tempOpt);
        }
        dialogBox.find('#site-delete-select-rest').append(docFragment);
    },
    loadSiteAssocPopup: function(mess,selSites){
        if(!mess) {mess=SiteAdmin.dataJson;}
        if(!selSites) {selSites=SiteAdmin.choosenSites;}

        var siteAssocDialog = jQuery("[id*='_DIALOG_CONTENT']");
        
        var operSelectDiv = siteAssocDialog.find('#site-delete-div-oper');
        var holiSelectDiv = siteAssocDialog.find('#site-delete-div-holi');
        var restSelectDiv = siteAssocDialog.find('#site-delete-div-rest');
        
        var parentSiteKeyArray = mess.parentSiteKeyArray;
        var parentSiteValueArray = mess.parentSiteValueArray;
        var parentSiteLength = mess.parentSiteCount;
        var siteConfigJSON = mess.siteConfigJSON;
        var siteReferCountJSON = mess.siteReferCountJSON;
        var outputJson = SiteAdmin.outputJson;

        siteAssocDialog.find('#site-delete-div-header span').text(getMessageForKey("sdp.admin.siterefer.siteassoc.header").replace('{0}', parentSiteLength));

        var rowNumber, siteConfigRow, outputConfigRow, currentSiteID;
        var elementNumber = SiteAdmin.pageNumber*SITE_ADMIN_CONSTANTS.get('REASSOC_SITELIST_ROWCOUNT');

        for (var i = elementNumber; i < parentSiteLength && i < elementNumber+SITE_ADMIN_CONSTANTS.get('REASSOC_SITELIST_ROWCOUNT'); i++) {
            rowNumber = i%SITE_ADMIN_CONSTANTS.get('REASSOC_SITELIST_ROWCOUNT')+1;

            currentSiteID = parentSiteKeyArray[i];
            siteConfigRow = siteConfigJSON[currentSiteID];
            outputConfigRow = outputJson[currentSiteID];

            siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(1) > input').attr( 'data-siteid', currentSiteID );
            siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(2)').text(parentSiteValueArray[i]);

            if(siteConfigRow.OH === SITE_ADMIN_CONSTANTS.get('REFER') || (siteConfigRow.OH !== SITE_ADMIN_CONSTANTS.get('REFER') && !siteReferCountJSON[currentSiteID].ohChildSiteArrayLen)) {
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(3)').html("--");
            }
            else {
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(3)').html(operSelectDiv.html());
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(3) > a').text(getMessageForKey("sdp.admin.siterefer.siteassoc.count").replace('{0}', siteReferCountJSON[currentSiteID].ohChildSiteArrayLen));

                //Setting the sitename
                var trimmedLabelString, labelString = getMessageForKey("sdp.calendar.backuptech.moveto")+' '+siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(3) select option:first').text();
                trimmedLabelString = SiteAdmin.getTrimmedSiteName(labelString);
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(3)').find('.customselect > .csoverlay > span').text(trimmedLabelString).attr('title', labelString);
            }
            
            if(siteConfigRow.HOLI === SITE_ADMIN_CONSTANTS.get('REFER') || (siteConfigRow.HOLI !== SITE_ADMIN_CONSTANTS.get('REFER') && !siteReferCountJSON[currentSiteID].holiChildSiteArrayLen)) {
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(4)').html("--");
            }
            else {
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(4)').html(holiSelectDiv.html());
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(4) > a').text(getMessageForKey("sdp.admin.siterefer.siteassoc.count").replace('{0}', siteReferCountJSON[currentSiteID].holiChildSiteArrayLen));

                //Setting the sitename
                var trimmedLabelString, labelString = getMessageForKey("sdp.calendar.backuptech.moveto")+' '+siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(4) select option:first').text();
                trimmedLabelString = SiteAdmin.getTrimmedSiteName(labelString);
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(4)').find('.customselect > .csoverlay > span').text(trimmedLabelString).attr('title', labelString);
            }

            if(siteConfigRow.REST === SITE_ADMIN_CONSTANTS.get('REFER') || (siteConfigRow.REST !== SITE_ADMIN_CONSTANTS.get('REFER') && !siteReferCountJSON[currentSiteID].restChildSiteArrayLen)) {
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(5)').html("--");
            }
            else {
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(5)').html(restSelectDiv.html());
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(5) > a').text(getMessageForKey("sdp.admin.siterefer.siteassoc.count").replace('{0}', siteReferCountJSON[currentSiteID].restChildSiteArrayLen));

                //Setting the sitename
                var trimmedLabelString, labelString = getMessageForKey("sdp.calendar.backuptech.moveto")+' '+siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(5) select option:first').text();
                trimmedLabelString = SiteAdmin.getTrimmedSiteName(labelString);
                siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(5)').find('.customselect > .csoverlay > span').text(trimmedLabelString).attr('title', labelString);
            }

            //Load already selected values if any, when moving between next/previous button.
            if(outputConfigRow) {
                if(outputConfigRow.CHECKED !== undefined && !outputConfigRow.CHECKED ) {
                    siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(1) > input').prop( "checked", false );//NO I18N
                }
                else {
                    if(outputConfigRow.OH) {
                        siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(3) select').val(outputConfigRow.OH);

                        //Setting the sitename
                        var trimmedLabelString, labelString = getMessageForKey("sdp.calendar.backuptech.moveto")+' '+siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(3) select option:selected').text();
                        trimmedLabelString = SiteAdmin.getTrimmedSiteName(labelString);
                        siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(3)').find('.customselect > .csoverlay > span').text(trimmedLabelString).attr('title', labelString);
                    }
                    if(outputConfigRow.HOLI) {
                        siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(4) select').val(outputConfigRow.HOLI);

                        //Setting the sitename
                        var trimmedLabelString, labelString = getMessageForKey("sdp.calendar.backuptech.moveto")+' '+siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(4) select option:selected').text();
                        trimmedLabelString = SiteAdmin.getTrimmedSiteName(labelString);
                        siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(4)').find('.customselect > .csoverlay > span').text(trimmedLabelString).attr('title', labelString);
                    }
                    if(outputConfigRow.REST) {
                        siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(5) select').val(outputConfigRow.REST);

                        //Setting the sitename
                        var trimmedLabelString, labelString = getMessageForKey("sdp.calendar.backuptech.moveto")+' '+siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(5) select option:selected').text();
                        trimmedLabelString = SiteAdmin.getTrimmedSiteName(labelString);
                        siteAssocDialog.find('#siteassoctr'+rowNumber+' > td:nth-child(5)').find('.customselect > .csoverlay > span').text(trimmedLabelString).attr('title', labelString);
                    }
                }
            }
            siteAssocDialog.find('#siteassoctr'+rowNumber).show();
        }

        //Setting the next button.
        if( ((SiteAdmin.pageNumber+1)*SITE_ADMIN_CONSTANTS.get('REASSOC_SITELIST_ROWCOUNT')) >= parentSiteLength) {
            siteAssocDialog.find('#nextArrow').prop("disabled", true); //No I18N
        }
        else if (siteAssocDialog.find('#nextArrow').prop("disabled")) {
            siteAssocDialog.find('#nextArrow').prop("disabled", false);//No I18N
        }

        //Setting the previous button.
        if(SiteAdmin.pageNumber < 1) {
            siteAssocDialog.find('#previousArrow').prop("disabled", true); //No I18N
        } else if (siteAssocDialog.find('#previousArrow').prop("disabled")) { //No I18N
            siteAssocDialog.find('#previousArrow').prop("disabled", false);//No I18N
        }
        //Setting the page navigation.
        if(parentSiteLength > 5) {
            var pagerowNumberStart = elementNumber+1;
            var pagerowNumberEnd = elementNumber+SITE_ADMIN_CONSTANTS.get('REASSOC_SITELIST_ROWCOUNT');
            if(pagerowNumberEnd > parentSiteLength) {
                pagerowNumberEnd = parentSiteLength;
            }
            siteAssocDialog.find('#siteassocnavig').show();
            siteAssocDialog.find('#siteassocnavig > button:first').text(getMessageForKey("sdp.admin.siterefer.navigation.label1").replace('{0}', pagerowNumberStart).replace('{1}', pagerowNumberEnd).replace('{2}', parentSiteLength));
        }

        //Setting Heading Label
        var stepLabel1 =1, stepLabel2 = 1;
        if(Object.keys(mess.assocConfig).length !== 0) {
            siteAssocDialog.find('#previousButton').prop("disabled", false);//No I18N
            stepLabel1++;
            stepLabel2++;
        }
        else {
            siteAssocDialog.find('#previousButton').hide();
        }
        if(mess.hasInactiveSiteDept) {
            stepLabel2++;
        }
        var headingString = getMessageForKey("sdp.admin.siterefer.heading.label1").replace('{0}', stepLabel1).replace('{1}', stepLabel2) + " :";
        siteAssocDialog.find('[refer-entity]').html(headingString);
        SiteAdmin.attachSiteAssocPopupEvents();
    },
    sendDeleteRequest: function() {
        var update_site_referring_configurations = [];
        for(siteId in SiteAdmin.outputJson) {
            if(SiteAdmin.outputJson[siteId].CHECKED!=false) {
                var node = { 
                    refer_referring_operational_hours_from : {"id": SiteAdmin.outputJson[siteId].OH}, 
                    refer_referring_holidays_from : {"id": SiteAdmin.outputJson[siteId].HOLI}, 
                    refer_referring_tech_group_sla_from : {"id": SiteAdmin.outputJson[siteId].REST},
                    id : siteId
                };
                update_site_referring_configurations.push(node); 
            }
        }
        
        
        var update_site_related_entities = {}; //NO I18N
        if(SiteAdmin.siteAssocParams.assetsite) {
            update_site_related_entities.move_asset_to = {"id": SiteAdmin.siteAssocParams.assetsite};  //NO I18N
        }
        if(SiteAdmin.siteAssocParams.reqdeptid) {
            update_site_related_entities.move_user_to = {"id": SiteAdmin.siteAssocParams.reqdeptid};  //NO I18N
        }
        if(SiteAdmin.siteAssocParams.pmtasksite) {
            update_site_related_entities.move_pm_task_to = {"id": SiteAdmin.siteAssocParams.pmtasksite};  //NO I18N
        }
        if(SiteAdmin.siteAssocParams.reqtempsite) {
           update_site_related_entities.move_template_to = {"id": SiteAdmin.siteAssocParams.reqtempsite}; //NO I18N
        }
        
        var input_data = {"update_site_related_entities": update_site_related_entities}; //NO I18N
        if(SiteAdmin.portal_user_criteria) {
            input_data.update_portal_user_criteria = SiteAdmin.portal_user_criteria;
        }
        if(update_site_referring_configurations.length > 0) {
            input_data.update_site_referring_configurations = update_site_referring_configurations;

        }

        showProgressBar(getMessageForKey("sdp.common.processing")+"..."); //NO I18N
        jQuery("[id*='_DIALOG_CONTENT'] #form-footer").hide();

        sdpAjax({
            type: "delete",   //NO I18N
            url: "/api/v3/sites",   //NO I18N
            data: {ids: SiteAdmin.choosenSites.toString(), 'input_data': (typeof sdpToJSON != 'undefined') ? sdpToJSON(input_data) : JSON.stringify(input_data) }, //NO I18N
            success: function(response) { 
                if(isMDHSetup=="true" && forwardfrom!="ESM") {
                    siteDeleteResponseHandler("success", getMessageForKey("sdp.admin.technician.siteasocciated.success"), response, true); //NO I18N
                }
                else {
                    siteDeleteResponseHandler("success", getMessageForKey('sdp.admin.site.deletesite.success'), response, true); //NO I18N
                }
             },
             error: function(response) {
                siteDeleteResponseHandler("failure", getMessageForKey("sdp.admin.site.errorinsiteassoc"), response.responseJSON, true); //NO I18N
             }
        });
    },
    redirectToListViewAfterDelete: function() {
        if(location.pathname === "/SetUpWizard.do"){
            window.top.location.href = "/SetUpWizard.do?forwardTo=site";// No I18N
        }
    },
    firstAssocPage: function() {
        SiteAdmin.checkPageVerification();
        SiteAdmin.pageNumber=0;
        SiteAdmin.resetDataInPopup();
        jQuery('[id*="_DIALOG_CONTENT"]').html(jQuery('#site-modify-dialog').html());
        SiteAdmin.loadSiteAdminAssocPopup();
    },
    previousPage: function() {
        if(SiteAdmin.pageNumber < 1) { return };

        SiteAdmin.checkPageVerification();
        SiteAdmin.pageNumber--;
        SiteAdmin.resetDataInPopup();
        SiteAdmin.loadSiteAssocPopup();
        jQuery('[refer-site-popup]').hide();
    },
    nextPage: function() {
        var parentSiteLength = SiteAdmin.dataJson.parentSiteCount;
        var elementNumber = SiteAdmin.pageNumber*SITE_ADMIN_CONSTANTS.get('REASSOC_SITELIST_ROWCOUNT');

        if(elementNumber > parentSiteLength) { return };

        SiteAdmin.checkPageVerification();
        SiteAdmin.pageNumber++;
        SiteAdmin.resetDataInPopup();
        SiteAdmin.loadSiteAssocPopup();
        jQuery('[refer-site-popup]').hide();
    },
    finishAll: function() {
        SiteAdmin.checkPageVerification();
        SiteAdmin.deleteDisassociationAlert();
        //All the unselected values will be marked to 'default setting'.
        SiteAdmin.checkAndPopulateOutputValues();
        if(SiteAdmin.dataJson.hasInactiveSiteDept) {
            SiteAdmin.showPortalUserCriteriaDialog();
            return;
        }
        SiteAdmin.sendDeleteRequest();
        SiteAdmin.resetGlobalValues();
    },
    cancelAll: function() {
        if(SiteAdmin.dataJson && SiteAdmin.dataJson.successCount>0) {
            refreshSubView(getPortalViewName('SiteListView'));
        }
        SiteAdmin.resetGlobalValues();
    },
    resetGlobalValues: function() {
        SiteAdmin.dataJson = {};
        SiteAdmin.choosenSites = {};
        SiteAdmin.siteAssocParams = {};
        SiteAdmin.outputJson = {};
        SiteAdmin.pageNumber = 0;
    },
    checkPageVerification: function() {
        //Check the selected checkboxes and check the selected select list here.
        var siteAssocDialog = jQuery('[id*="_DIALOG_CONTENT"]');
        var valueOH, valueHoli, valueRest, siteID;
        var outputJson = SiteAdmin.outputJson;
        var siteConfigRow = {};

        for (var i = 1; i < 6; i++) {
            if(siteAssocDialog.find('#siteassoctr'+i).css('display') != 'none') { 
                siteID = siteAssocDialog.find('#siteassoctr'+i+' > td:nth-child(1) > input').attr('data-siteid');

                if(siteAssocDialog.find('#siteassoctr'+i+' > td:nth-child(1) > input').prop('checked')) {
                    
                    valueOH = siteAssocDialog.find('#siteassoctr'+i+' > td:nth-child(3) select').val();
                    valueHoli = siteAssocDialog.find('#siteassoctr'+i+' > td:nth-child(4) select').val();
                    valueRest = siteAssocDialog.find('#siteassoctr'+i+' > td:nth-child(5) select').val();

                    if(valueOH) {siteConfigRow.OH = valueOH;}
                    if(valueHoli) {siteConfigRow.HOLI = valueHoli;}
                    if(valueRest) {siteConfigRow.REST = valueRest;}

                }
                else {
                    siteConfigRow.CHECKED = false;
                }

                outputJson[siteID] = siteConfigRow;
                siteConfigRow = {};
                valueOH, valueHoli, valueRest, siteID = 0;
            }
        }
        SiteAdmin.outputJson = outputJson;
    },
    deleteDisassociationAlert: function() {
        var parentSiteLength = SiteAdmin.dataJson.parentSiteCount;
        var parentSiteKeyArray = SiteAdmin.dataJson.parentSiteKeyArray;
        var outputJson = SiteAdmin.outputJson;
        var deleteRemoved = false;
        var currentSiteID, outputJsonRow;
        for (var i = 0; i < parentSiteLength; i++) {
            currentSiteID = parentSiteKeyArray[i];
            outputJsonRow = outputJson[currentSiteID];
            if(outputJsonRow.hasOwnProperty("CHECKED") && !outputJsonRow.CHECKED) {
                alert(getMessageForKey("sdp.admin.siterefer.siteassoc.delete.unselect"));
                break;
            }
        }
    },
    checkAndPopulateOutputValues: function() {
        var parentSiteKeyArray = SiteAdmin.dataJson.parentSiteKeyArray;
        var parentSiteLength = SiteAdmin.dataJson.parentSiteCount;        
        var siteConfigJSON = SiteAdmin.dataJson.siteConfigJSON;
        var outputJson = SiteAdmin.outputJson;

        var currentSiteID,siteConfigRow,outputJsonRow, rowModified;
        var dataModified = false;
        for (var i = 0; i < parentSiteLength; i++) {
            currentSiteID = parentSiteKeyArray[i];
            rowModified = false;
            siteConfigRow = siteConfigJSON[currentSiteID];
            outputJsonRow = outputJson[currentSiteID];

            if(!outputJsonRow || !outputJsonRow.CHECKED) {
                if(!outputJsonRow) { outputJsonRow = {};}
                if(siteConfigRow.OH !== SITE_ADMIN_CONSTANTS.get('REFER')) {
                    if(!jQuery.isNumeric(outputJsonRow.OH)) {
                        outputJsonRow.OH = null;
                        rowModified = true;
                    }
                }
                if(siteConfigRow.HOLI !== SITE_ADMIN_CONSTANTS.get('REFER')) {
                    if(!jQuery.isNumeric(outputJsonRow.HOLI)) {
                        outputJsonRow.HOLI = null;
                        rowModified = true;
                    }
                }
                if(siteConfigRow.REST !== SITE_ADMIN_CONSTANTS.get('REFER')) {
                    if(!jQuery.isNumeric(outputJsonRow.REST)) {
                        outputJsonRow.REST = null;
                        rowModified = true;
                    }
                }
                if(rowModified) {
                    outputJson[currentSiteID] = outputJsonRow;
                    dataModified = true;
                }
            }

        }
        if(dataModified) {
            SiteAdmin.outputJson = outputJson;
        }
    },
    resetDataInPopup: function() {
        var siteAssocDialog = jQuery('[id*="_DIALOG_CONTENT"]');
        for (var i = 1; i < 6 ; i++) {

            if(siteAssocDialog.find('#siteassoctr'+i).css('display') != 'none'){ 
                siteAssocDialog.find('#siteassoctr'+i).hide();
                siteAssocDialog.find('#siteassoctr'+i+' > td:nth-child(1) > input').prop('checked', true);//No I18N
                siteAssocDialog.find('#siteassoctr'+i+' > td:nth-child(1) > input').removeAttr('data-siteid');//No I18N
                siteAssocDialog.find('#siteassoctr'+i+' > td:nth-child(2)').text("");
                siteAssocDialog.find('#siteassoctr'+i+' > td:nth-child(3)').html("--");
                siteAssocDialog.find('#siteassoctr'+i+' > td:nth-child(4)').html("--");
                siteAssocDialog.find('#siteassoctr'+i+' > td:nth-child(5)').html("--");
            }
        }
    },
    gotoStep2: function() {
        SiteAdmin.closeDeptDissociatePopup();
        if(SiteAdmin.dataJson.parentSiteCount > 0) {
            SiteAdmin.showParentSiteAssociation(SiteAdmin.dataJson, SiteAdmin.choosenSites);
        }
        else if(Object.keys(SiteAdmin.dataJson.assocConfig).length > 0) {
            SiteAdmin.showSiteAssociation(SiteAdmin.dataJson, SiteAdmin.choosenSites);
        }
    },
    showParentSiteAssociation: function(mess,selSites) {
        if(mess.parentSiteCount > 0) {
            showDialog(jQuery('#site-delete-dialog').html(),'title='+getMessageForKey("sdp.admin.site.changesite")+', width=1000, modal=yes, top=10, position=absmiddle');//No I18N
            //To populate site select list options.
            SiteAdmin.populateSelectBoxOptions(jQuery("[id*='_DIALOG_CONTENT']"));
            SiteAdmin.loadSiteAssocPopup(mess,selSites);
            if(mess.hasInactiveSiteDept) {
                jQuery("[id*='_DIALOG_LAYER'] #finishAllButtton:visible").text(getMessageForKey("sdp.common.continue"));
            }
        }
        else if(mess.hasInactiveSiteDept) {
            SiteAdmin.showPortalUserCriteriaDialog();
        }
        else {
            SiteAdmin.sendDeleteRequest();
        }

        if(!sdp_app.IS_AE && SiteAdmin.dataJson.parentSiteCount > 0){
            document.querySelector('#_DIALOG_CONTENT #previousButton').addEventListener("click", function(event) { SiteAdmin.firstAssocPage() });  //No I18N
            document.querySelector('#_DIALOG_CONTENT #finishAllButtton').addEventListener("click", function(event) { SiteAdmin.finishAll() });  //No I18N
            document.querySelector('#_DIALOG_CONTENT #js-event-SiteDef-18').addEventListener("click", function(event) { SiteAdmin.cancelAll(); closeDialog(); SiteAdmin.closeSRList(); });  //No I18N
            if(SiteAdmin.dataJson.parentSiteCount > 5){
                document.querySelector('#_DIALOG_CONTENT #previousArrow').addEventListener("click", function(event) { SiteAdmin.previousPage(); });  //No I18N
                document.querySelector('#_DIALOG_CONTENT #nextArrow').addEventListener("click", function(event) { SiteAdmin.nextPage(); });  //No I18N
            }

            const siteAssocId = jQuery('#_DIALOG_CONTENT [id*=siteassoctr] [id*=js-event-SiteDef-]'); // No I18N
            if(siteAssocId && siteAssocId.length > 0){
                siteAssocId.each(function() {
                    jQuery(this).on("click", function(event) {
                        SiteAdmin.showSRList(this);
                    });
                });
            }
        }
    },
    showPortalUserCriteriaDialog: function() {
        closeDialog();
        jQuery('#userCriteriaContainer [id*=criteriaRow_]').remove();
        jQuery('#userCriteriaContainer').dialog({
            title: getMessageForKey("sdp.admin.site.changesite"),
            resizable: false,
            height: 'auto', //NO I18N
            width: 1100,
            modal: true
        });
        populateRequesterCriteria();
        addUserCriteriaListeners();

        setTimeout(function(){  //time to load the select2
            //Removing inactive sites & departments from select2
            for(var c=0;c<2;c++) {
                var activeSites = [];
                var inactiveSites = Object.keys(SiteAdmin.dataJson.portal_user_inactive_sites);
                var idsList = [];
                if(jQ("#criteriaValue_"+c).next().attr("data-import")=='department') {
                    inactiveSites = Object.keys(SiteAdmin.dataJson.portal_user_inactive_depts);
                }
                var selectedSites = jQ("#criteriaValue_"+c).select2('data'); //NO I18N
                for(var i=0;i<selectedSites.length;i++) { 
                    if(inactiveSites.indexOf(selectedSites[i].id.toString())==-1) { 
                        activeSites.push(selectedSites[i]); 
                        idsList.push(selectedSites[i].id.toString());
                    }
                }
                jQ("#criteriaValue_"+c).select2('data', activeSites); //NO I18N
                if(jQ("#criteriaValue_"+c).next().attr("data-import")=='department') {
                    jQ("#DepartmentsIdsStr").val(idsList); //NO I18N
                }
                else {
                    jQ("#siteIdsStr").val(idsList); //NO I18N
                }
            }
        }, 500);

        var step = 1;
        if(Object.keys(SiteAdmin.dataJson.assocConfig).length !== 0) {
            step++;
        }
        if(SiteAdmin.dataJson.parentSiteCount > 0) {
            step++;
        }
        var headingString = getMessageForKey("sdp.admin.siterefer.heading.label1", [step, step]) + " :";
        if(step > 1) {
            jQuery("#portalusercriteria_previousButton").removeClass("hide");
        }
        jQuery("#userCriteriaContainer [refer-entity]").html(headingString);
    },
    inactiveSiteDeptPopup: function(eleSelector, type){
        //list of deleted sites/departments used in user criteria
        var itemList = "";
        var inactiveList = SiteAdmin.dataJson.portal_user_inactive_sites; //list of all inactive depts
        var dialogTitle = "sdp.admin.site.listview.inactive"; //NO I18N
        if(type=='departments') {
            inactiveList = SiteAdmin.dataJson.portal_user_inactive_depts;
            dialogTitle = "common.departments.inactive"; //NO I18N
        }      
        var removedList = []; //names of sites/depts common in both the previous arrays
        for(id in inactiveList) {
            removedList.push(e_html(inactiveList[id]));
        }
        for(var i=0; i<removedList.length; i++){
            itemList += '<div class="form-group mt15" data-siteid="0">'+ removedList[i] +'</div>';
        }
        jQuery("#inactiveSiteContainer").html(itemList);
        var pos = jQuery('.ui-dialog').position(); //NO I18N
        var hgt = jQuery('.ui-dialog').height(); //NO I18N
        var wdt = jQuery('.ui-dialog').width(); //NO I18N
        var lft = pos.left + wdt;
        jQuery('#inactiveSitePopup').dialog({
            title: getMessageForKey(dialogTitle),
            resizable: false,
            height: hgt + 3,
            width: 400,
            modal: true
        });
        lft = lft - 395;
        jQuery('#inactiveSitePopup').closest('.ui-dialog').css({ //NO I18N
            'left': lft, //NO I18N
            'top': pos.top //NO I18N
        });
    },
    userCriteriaTypeChange: function(ele){
        var optionSelected = jQuery(ele).data("rel"); //NO I18N
        if(optionSelected === "instance-one"){
            jQuery(".instance-two").hide();
            jQuery(".instance-one").show();
        }else if(optionSelected === "instance-two"){ //NO I18N
            jQuery(".instance-one").hide();
            jQuery(".instance-two").show();
        }
    },
    submitUserCriteria: function(){
        var requesterCriteria = {};
        var criteria_details = [];
        var criteriaElement = jQuery('tr[id^=criteriaRow_]');//NO I18N
      
        if( jQuery(".importchose[data-rel='instance-one']").is(":checked") ){
          if( validateRequesterDynamicCriteria() ){
              for( i = 0; i < criteriaElement.length; i++ ){
                      var criteria = {};
                      var rowElement = jQuery(criteriaElement[i]);
                      criteria.field = jQuery(rowElement).find('select[id^=field_]').find('option:selected').text();//NO I18N
                      criteria.condition = jQuery(rowElement).find('select[id^=criteria_]').find('option:selected').text();//NO I18N
                      var values = [];
                      var fld = jQuery(rowElement).find('input[id^=criteriaValue_]');
                      if(criteria.field == "Site"){
                          values = jQuery("#siteIdsStr").val().split(',');
                      }else{
                          values = jQuery("#DepartmentsIdsStr").val().split(',');
                      }

                      criteria.values = values;
                      if( i == 0 ){
                              criteria.logical_operator = '-';//NO I18N
                      }
                      else{
                              var operator = jQuery(rowElement).find('div[id^=operatorTxt_]').text();//NO I18N
                              criteria.logical_operator = ( operator == "AND" ? "AND" : "OR");//NO I18N
                      }
                      criteria_details.push(criteria);
              }
              if( criteria_details.length > 0 ){
                  requesterCriteria.requester_conditions = criteria_details;
              }
              requesterCriteria.is_alluser_as_requester = false;
          }
          else{
              return false;
          }
        }
        else if( jQuery(".importchose[data-rel='instance-two']").is(":checked") ){
            requesterCriteria.is_alluser_as_requester = true;
        }
        else{
          showalert('failure', getMessageForKey("mdh.user.import.choose.import.type"), 'isAutoHide=true');//NO I18N
          return;
        }
        //validating the inactive side/depts are removed in criteria
        var isInactiveIdNotRemoved = false;
        var criteria = requesterCriteria.requester_conditions;
        for(var j=0;j<criteria.length;j++) {
            var inactiveIds = Object.keys(SiteAdmin.dataJson.portal_user_inactive_sites);
            if(criteria[j].field=='Department') {
                inactiveIds = Object.keys(SiteAdmin.dataJson.portal_user_inactive_depts);
            }
            for(var i =0; i<inactiveIds.length; i++) { 
                if(criteria[j].values.indexOf(inactiveIds[i])!=-1) { 
                    isInactiveIdNotRemoved = true;
                }
            }
        }
        if(isInactiveIdNotRemoved) {
            showalert('failure', getMessageForKey("sitedept.inactive.notremoved"), 'isAutoHide=false'); //NO I18N
            return;
        }
        SiteAdmin.portal_user_criteria = requesterCriteria;
        jQuery("#loader-div").html('<div data-id="cview-freeze" class="cview-freeze" style="z-index: 10;">'+ajaxBar("white")+'</div>');//NO I18N
        SiteAdmin.sendDeleteRequest();
    },
    closeDeptDissociatePopup: function() {
        if(jQuery("#userCriteriaContainer").hasClass("ui-dialog-content")) {
            jQuery('#userCriteriaContainer').dialog('close'); //NO I18N
        }
    },
    changeSiteAssociation: function() {
        var siteAssocDialog = jQuery("[id*='_DIALOG_CONTENT']");
        var params = {};
        params.mode = "changesiteassoc";//No I18N
        if(siteAssocDialog.find('#site-delete-assoc-requester-tr').is(':visible'))
        {
            params.reqdeptid = siteAssocDialog.find('#site-delete-assoc-requester').val();
        }
        if(siteAssocDialog.find('#site-delete-assoc-assets-tr').is(':visible'))
        {
            params.assetsite = siteAssocDialog.find('#site-delete-assoc-assets').val();
        }
        if(siteAssocDialog.find('#site-delete-assoc-requesttemplate-tr').is(':visible'))
        {
            params.reqtempsite = siteAssocDialog.find('#site-delete-assoc-requesttemplate').val();
        }
        if(siteAssocDialog.find('#site-delete-assoc-srequest-tr').is(':visible'))
        {
            params.pmtasksite = siteAssocDialog.find('#site-delete-assoc-srequest').val();
        }
        SiteAdmin.siteAssocParams = params;
        SiteAdmin.showParentSiteAssociation(SiteAdmin.dataJson, SiteAdmin.choosenSites);

    },
    showSRList: function(el){
        var elm = jQuery(el);
        var elmOffset = elm.offset();
        var siteid = elm.closest('tr').find('input').attr('data-siteid');//NO I18N

        var siteReferCountVar = SiteAdmin.dataJson.siteReferCountJSON;
        var siteConfigRow = siteReferCountVar[siteid];

        var siteReferDivPop = jQuery('[refer-site-popup]');


        // Position the timer popup horizontally
        if (jQuery("body").css("direction").toLowerCase() == "rtl"){
            siteReferDivPop.show().addClass('show-at-left').css({'top': elmOffset.top-6, 'left': elmOffset.left+elm.width(), 'z-index':10000});//No I18N
        }
        else{
            siteReferDivPop.show().css({'top': elmOffset.top-6, 'left': elmOffset.left+elm.width()+10, 'z-index':10000});//No I18N

            if((jQuery(el).closest('[id*="_DIALOG_CONTENT"]').width()-elmOffset.left)<200){
                siteReferDivPop.show().addClass('show-at-left').css('left',elmOffset.left-elm.width()-200);//NO I18N
            }
            else{
                siteReferDivPop.show().removeClass('show-at-left');
            }
        }

        var selectNameVar = elm.parent().find('select').prop('id');//NO I18N

        var start = Date.now();
        var divVar = document.createElement("div");
        var docFragment = document.createDocumentFragment();
        var tempDiv;
        if(selectNameVar.indexOf("oper") != -1){
            jQuery.each(siteConfigRow.ohChildSiteNameArray, function(i, value) {
                tempDiv = divVar.cloneNode(false);
                tempDiv.title = value;
                tempDiv.innerText = value;
                tempDiv.className = "mb10";
                docFragment.appendChild(tempDiv);
            });
            siteReferDivPop.find('[refer-site-delete-head]').text(getMessageForKey("sdp.admin.siterefer.siteassoc.count").replace('{0}', siteConfigRow.ohChildSiteArrayLen));
        }
        else if(selectNameVar.indexOf("holi") != -1){
            jQuery.each(siteConfigRow.holiChildSiteNameArray, function(i, value) {
                tempDiv = divVar.cloneNode(false);
                tempDiv.title = value;
                tempDiv.innerText = value;
                tempDiv.className = "mb10";
                docFragment.appendChild(tempDiv);
            });
            siteReferDivPop.find('[refer-site-delete-head]').text(getMessageForKey("sdp.admin.siterefer.siteassoc.count").replace('{0}', siteConfigRow.holiChildSiteArrayLen));
        }
        else if(selectNameVar.indexOf("rest") != -1){
            jQuery.each(siteConfigRow.restChildSiteNameArray, function(i, value) {
                tempDiv = divVar.cloneNode(false);
                tempDiv.title = value;
                tempDiv.innerText = value;
                tempDiv.className = "mb10";
                docFragment.appendChild(tempDiv);
            });
            siteReferDivPop.find('[refer-site-delete-head]').text(getMessageForKey("sdp.admin.siterefer.siteassoc.count").replace('{0}', siteConfigRow.restChildSiteArrayLen));
        }
        siteReferDivPop.find('[refer-site-list]').html("");
        siteReferDivPop.find('[refer-site-list]').append(docFragment);
    },
    closeSRList: function(){
        jQuery('[refer-site-popup]').hide();
    },
    //Scripts and Events needed after loading the site association popup during the site deletion can be added in below function.
    attachSiteAssocPopupEvents: function() {
        // Show Move to Site select box
        jQuery('.customselect').on('click', function(){
            jQuery(this).hide().next('select.refer-site-select').show();//NO I18N
        });
        // Move to Site select on change
        jQuery(document).on('change','select.refer-site-select',function(){
            var trimmedLabelString, labelString = getMessageForKey("sdp.calendar.backuptech.moveto")+' '+jQuery(this).find(':selected').text();
            trimmedLabelString = SiteAdmin.getTrimmedSiteName(labelString);

            jQuery(this).hide().prev('.customselect').show().find('.csoverlay>span').text(trimmedLabelString).attr('title', labelString);//NO I18N
        });
        jQuery(document).ready(function(){
            jQuery(document).on('click','.closebutton',function(){//NO I18N
                SiteAdmin.closeSRList();
            });

            jQuery(document).on('keydown', function(event){
                if(event.keyCode==27){
                  SiteAdmin.closeSRList();
                }
            });
        });

        const siteAssocId = jQuery('#_DIALOG_CONTENT [id*=siteassoctr] [id*=js-event-SiteDef-]'); // No I18N
            if(siteAssocId && siteAssocId.length > 0){
                siteAssocId.each(function() {
                    jQuery(this).on("click", function(event) {
                        SiteAdmin.showSRList(this);
                    });
                });
            }
    },
    getTrimmedSiteName: function(labelString) {
        //Site Names are trimmed to length of 25 chars.
        var trimmedLabelString;
        if(labelString.length > 25) {
            trimmedLabelString = labelString.substring(0, 25) + '...';
        }
        else {
            trimmedLabelString = labelString;
        }
        return trimmedLabelString;
    },
    confirmSiteDelete: function(form, isConfirm, puc_siteId){ 
        var selSites = getSelectedCheckBoxes(form);
        if(puc_siteId) {
            selSites = [puc_siteId];   
        }
        if(isConfirm || confirmDelete(form, 'checkbox', getMessageForKey('confirmreqdelete'),getMessageForKey('sdp.admin.site.delete.selectsite'))){
               //SiteAdmin.checksiteassociation(selSites);
               sdpAjax({
                type: "delete", //NO I18N
                url: "/api/v3/sites", //NO I18N
                ignorefailuremessage: true,
                data: "ids="+selSites, //NO I18N
                success: function(response) {
                    var msg = getMessageForKey('sdp.admin.site.deletesite.success');
                    if(isConfirm) {
                        msg = getMessageForKey("sdp.admin.site.deletesite.noassociation");
                    }
                    siteDeleteResponseHandler("success", msg, response, false); //NO I18N
                },
                error: function(response) {
                    var associatedSites = {};
                    associatedSites.assocConfig={};
                    associatedSites.siteReferCountJSON = {};
                    associatedSites.siteConfigJSON = {};

                    associatedSites.parentSiteCount = 0;
                    associatedSites.parentSiteKeyArray = [];
                    associatedSites.parentSiteValueArray = [];

                    associatedSites.parentOperHourSiteReferLength = 0;
                    associatedSites.parentOperHourSiteReferKeyArray = [];
                    associatedSites.parentOperHourSiteReferValueArray = [];
                    
                    associatedSites.parentHoliSiteReferLength = 0;
                    associatedSites.parentHoliSiteReferKeyArray = [];
                    associatedSites.parentHoliSiteReferValueArray = [];
                    
                    associatedSites.parentRestSiteReferLength = 0;
                    associatedSites.parentRestSiteReferKeyArray = [];
                    associatedSites.parentRestSiteReferValueArray = [];
                    associatedSites.portal_user_inactive_sites = {};
                    associatedSites.portal_user_inactive_depts = {};
                    associatedSites.hasInactiveSiteDept = false;
                    associatedSites.failedIds = [];
                    associatedSites.successCount = 0;
                    
                    for(var i=0;i<response.responseJSON.response_status.length;i++) {
                        if(response.responseJSON.response_status[i].id && response.responseJSON.response_status[i].messages) {
                            var associatedEntities=response.responseJSON.response_status[i].messages[0].message.associated_entities;
                            if(associatedEntities) {
                                for(var j=0;j<associatedEntities.length;j++) {
                                    associatedSites.assocConfig[associatedEntities[j]]=true; 
                                }
                            }
                            var configurations_being_referred_by_other_sites = response.responseJSON.response_status[i].messages[0].message.configurations_being_referred_by_other_sites;
                            if(configurations_being_referred_by_other_sites) {
                                
                                var siteReferCountJSONNode = {};
                                siteReferCountJSONNode.holiChildSiteArrayLen = 0;
                                siteReferCountJSONNode.holiChildSiteNameArray = [];
                                siteReferCountJSONNode.ohChildSiteArrayLen = 0;
                                siteReferCountJSONNode.ohChildSiteNameArray = [];
                                siteReferCountJSONNode.restChildSiteArrayLen = 0;
                                siteReferCountJSONNode.restChildSiteNameArray = [];

                                var siteConfigJSONNode = { HOLI: "refer", OH: "refer", REST: "refer" };  //NO I18N

                                for(type in configurations_being_referred_by_other_sites) {
                                    for(siteId in configurations_being_referred_by_other_sites[type]) {
                                        if(type=='holidays') {
                                            siteReferCountJSONNode.holiChildSiteNameArray.push(configurations_being_referred_by_other_sites[type][siteId]);
                                            siteConfigJSONNode.HOLI = 'custom';  //NO I18N
                                        }
                                        else if(type=='operational_hours') {
                                            siteReferCountJSONNode.ohChildSiteNameArray.push(configurations_being_referred_by_other_sites[type][siteId]);
                                            siteConfigJSONNode.OH = 'custom';  //NO I18N
                                        }
                                        else if(type=='tech_group_sla') {
                                            siteReferCountJSONNode.restChildSiteNameArray.push(configurations_being_referred_by_other_sites[type][siteId]);
                                            siteConfigJSONNode.REST = 'custom';  //NO I18N
                                        }
                                    }
                                }
                                associatedSites.parentSiteCount++;
                                associatedSites.parentSiteKeyArray.push(response.responseJSON.response_status[i].id);
                                associatedSites.parentSiteValueArray.push(configurations_being_referred_by_other_sites.name);
                                siteReferCountJSONNode.holiChildSiteArrayLen = siteReferCountJSONNode.holiChildSiteNameArray.length;
                                siteReferCountJSONNode.ohChildSiteArrayLen = siteReferCountJSONNode.ohChildSiteNameArray.length;
                                siteReferCountJSONNode.restChildSiteArrayLen = siteReferCountJSONNode.restChildSiteNameArray.length;
                                associatedSites.siteReferCountJSON[response.responseJSON.response_status[i].id] = siteReferCountJSONNode;
                                associatedSites.siteConfigJSON[response.responseJSON.response_status[i].id] = siteConfigJSONNode;
                            }

                            var portal_user_inactive =  response.responseJSON.response_status[i].messages[0].message.portal_user_criteria;
                            if(portal_user_inactive) {
                                for(siteId in portal_user_inactive.inactive_site) {
                                    associatedSites.portal_user_inactive_sites[siteId] = portal_user_inactive.inactive_site[siteId];
                                    associatedSites.hasInactiveSiteDept = true;
                                }
                                for(siteId in portal_user_inactive.inactive_department) {
                                    associatedSites.portal_user_inactive_depts[siteId] = portal_user_inactive.inactive_department[siteId];
                                    associatedSites.hasInactiveSiteDept = true;
                                }
                            }
                        }
                        if(response.responseJSON.response_status[i].status=='failed') {
                            associatedSites.failedIds.push(response.responseJSON.response_status[i].id);
                        }
                        else if(response.responseJSON.response_status[i].status=='success') {
                            associatedSites.successCount++;
                        }
                    }                
                    
                    sdpAjax({
                        type: "GET",  //NO I18N
                        url: "/api/v3/sites/valid_sites_for_modify_association",  //NO I18N
                        data: "ids="+associatedSites.failedIds, //NO I18N
                        success: function(response) {
                           var assocaited_entity = response.response_status[0].messages[0].message.input_for_assocaited_entity;
                            associatedSites.assocConfigSiteKeyArray = [];
                            associatedSites.assocConfigSiteValueArray = [];
                            if(assocaited_entity) {
                                for(var i = 0; i < assocaited_entity.length; i++) {
                                   associatedSites.assocConfigSiteKeyArray.push(assocaited_entity[i].id);
                                   associatedSites.assocConfigSiteValueArray.push(assocaited_entity[i].name);
                                }
                            }

                            var input_for_configuration_entity = response.response_status[0].messages[0].message.input_for_configuration_entity;
                            if(input_for_configuration_entity) {
                                for(type in input_for_configuration_entity) {
                                     for(var i = 0; i < input_for_configuration_entity[type].length; i++) {
                                        if(type=='holidays') {
                                            associatedSites.parentHoliSiteReferKeyArray.push(input_for_configuration_entity[type][i].id);
                                            associatedSites.parentHoliSiteReferValueArray.push(input_for_configuration_entity[type][i].name);
                                        }
                                        else if(type=='operational_hours') {
                                            associatedSites.parentOperHourSiteReferKeyArray.push(input_for_configuration_entity[type][i].id);
                                            associatedSites.parentOperHourSiteReferValueArray.push(input_for_configuration_entity[type][i].name);
                                        }
                                        else if(type=='tech_group_sla') {
                                            associatedSites.parentRestSiteReferKeyArray.push(input_for_configuration_entity[type][i].id);
                                            associatedSites.parentRestSiteReferValueArray.push(input_for_configuration_entity[type][i].name);
                                        }
                                    }
                                }
                            }
                            
                            associatedSites.assocConfigSiteMapLength = associatedSites.assocConfigSiteKeyArray.length;
                            associatedSites.parentOperHourSiteReferLength = associatedSites.parentOperHourSiteReferKeyArray.length;
                            associatedSites.parentHoliSiteReferLength = associatedSites.parentHoliSiteReferKeyArray.length;
                            associatedSites.parentRestSiteReferLength = associatedSites.parentRestSiteReferKeyArray.length;
                            SiteAdmin.showSiteAssociation(associatedSites, associatedSites.failedIds);
                        }
                    });
                } 
            });
        }
    },
    changeReferedSettings: function(){
        var siteIds = document.SiteListView.checkbox;
        var params = null;
        if(siteIds!=null && siteIds.length){
          for(var i=0;i<siteIds.length;i++){
            if(document.SiteListView.checkbox[i].checked){
              if(params==null){
                params = "checkbox="+siteIds[i].value; // No I18N
              }else{
                params = params + "&checkbox="+siteIds[i].value; // No I18N
              }
            }
          }
        }else if(siteIds!=null && document.SiteListView.checkbox.checked){
          params = "checkbox="+siteIds.value; // No I18N
        }
        if(params==null){
          alert(getMessageForKey('sdp.admin.site.modifyrelatedsettings.selectsite'));
        }else{
          params = params + "&mode=bulkedit"; // No I18N
          showURLInDialog('/setup/SiteListActions.jsp?'+params,'closeButton=yes,width=980,title='+getMessageForKey("sdp.admin.settings.site.related")); // No I18N
		  initTooltip('#SiteListActions *'); // No I18N
        }
    },
    //Scripts and Events needed after loading the Admin -> Site page can be added in below function.
    attachSitePageOnReadyEvents: function() {

        //initTooltip();

        //SD-38860 - To show pop message to users if Site settings is changed in edit site details page.
        jQuery("[name='assocTechSetting']").attr('oldValue',jQuery("[name='assocTechSetting']:checked").val());
        jQuery("[name='holidaysSetting']").attr('oldValue',jQuery("[name='holidaysSetting']:checked").val());
        jQuery("[name='operationalHoursSetting']").attr('oldValue',jQuery("[name='operationalHoursSetting']:checked").val());

        // Set label text on select change
        jQuery('.refer-site-row select').on('change', function(){
            jQuery(this).attr("modified", "modified");
            var $selected = jQuery(this).find(':selected');   

            //On add new site page, on selecting a site for operation hours select box, same will be applied for the other two select box below.
            if(jQuery(this).attr('id') == 'siteReferOper' && jQuery('#addSiteHeading').css('display') == 'block' && !jQuery('#siteRefer').attr("modified") && !jQuery('#siteReferHoli').attr("modified")){
              jQuery('#siteReferHoli').val(jQuery('#siteReferOper').val());
              jQuery('#siteRefer').val(jQuery('#siteReferOper').val());
              jQuery('#siteReferHoli').closest('td').find('[refer-site-name]').text(jQuery('#siteReferHoli option[value="'+jQuery('#siteReferHoli').val()+'"]').text());
              jQuery('#siteRefer').closest('td').find('[refer-site-name]').text(jQuery('#siteRefer option[value="'+jQuery('#siteRefer').val()+'"]').text());
            }
            jQuery(this).closest('.refer-site-row').find('[refer-site-name]').text(jQuery(this).find("option:selected").text()).end().find('[refer-site-label]').show()
                        .end().find('div.refer-site-list, [cancel-refer-site]').hide();
        });

        // Show site field on clicking on label
        jQuery('.refer-site-row').on('click','[refer-site-label]',function(){//NO I18N
            if(jQuery(this).closest('.refer-site-row').find('input').is(':checked')){
              jQuery(this).closest('.refer-site-row').find('div.refer-site-list, [cancel-refer-site]').show().end().find('[refer-site-label]').hide();//NO I18N
            }
        });

        // Show site name text on clicking cancel icon
        jQuery('.refer-site-row').on('click','[cancel-refer-site]',function(){//NO I18N
            jQuery(this).closest('.refer-site-row').find('div.refer-site-list, [cancel-refer-site]').hide().end().find('[refer-site-label]').show();//NO I18N
        });

        // Show select bg on hover
        jQuery('[site-refer-column]').on('mouseenter', function(){
            jQuery('[site-refer-column]').each(function(){
              if(jQuery(this).find('.refer-site-row').find('input').is(':checked')){
                jQuery(this).find('.csoverlay').addClass('hover');
              }
            });
        }).on('mouseleave',function(){
            jQuery('[site-refer-column]').find('.csoverlay').removeClass('hover');
        });

        // Show select bg on change
        jQuery('[site-refer-column] input').on('change', function(){
            jQuery(this).closest('td').trigger('mouseenter');//NO I18N
        });

        //Hide ui-popup when the parent delete popup is closed.
        jQuery(document).on('click','[id*="_DIALOG_LAYER"] .closeButton',function(){
            jQuery('.ui-popup').hide();
        });

        //This will set the label for the site select lists.
        jQuery('#siteReferOper').closest('td').find('[refer-site-name]').text(jQuery('#siteReferOper option[value="'+jQuery('#siteReferOper').val()+'"]').text());
        jQuery('#siteReferHoli').closest('td').find('[refer-site-name]').text(jQuery('#siteReferHoli option[value="'+jQuery('#siteReferHoli').val()+'"]').text());
        jQuery('#siteRefer').closest('td').find('[refer-site-name]').text(jQuery('#siteRefer option[value="'+jQuery('#siteRefer').val()+'"]').text());
    },
    selectOptions : function(a) {
      if (document.getElementById(a).checked = true)
      {
        if(a=='referSettings'){
          document.getElementById('referSettings1').checked = true;
          document.getElementById('referSettings2').checked = true;
          //refer for depet is not provided.
          document.getElementById('customSettings3').checked = true;
          document.getElementById('referSettings7').checked = true;

          document.getElementById('customSettings4').checked = false;
          document.getElementById('customSettings6').checked = false;
        }
        else {
          var startIndex=1;
          //Incrementing the start index of loop to 2 as operational hrs doesnt have copy site config 
          //(From operational hrs feature enhancement -- behavior change)
          if(a!=undefined && "copySettings" === a){
            startIndex=2;
          } 
          for (i=startIndex;i<=7;i++) {
          if(i==5){
            continue;
          }
              document.getElementById(a+i).checked = true;
          }
        }
      }
    },
    selectReferSet : function(){
      for (i=4;i<=7;i++) {
        if(i==5){
          continue;
        }
        document.getElementById('customSettings'+i).checked = false;
      }      
    },
    removeReferSet : function(e){
      // For MSP, do not copy Tech-Site association
      if(document.getElementById('referSettings7').checked){
        document.getElementById('customSettings7').checked = true;
        document.getElementById('customSettings4').checked = true;
        document.getElementById('customSettings6').checked = true;
        document.getElementById(e.id).checked = true;
      }
      if(!document.getElementById('customSettings4').checked && !document.getElementById('referSettings7').checked){
        document.getElementById('customSettings4').checked = true;
        document.getElementById('customSettings6').checked = true;
      }
    },
    showAlert : function(e){
      document.getElementById(e).style.visibility="visible";
    },
    hideAlert : function(e){
      document.getElementById(e).style.visibility="hidden";
    },
    selectDefaultOption : function() {
      SiteAdmin.selectOptions('referSettings');//No I18N
      //Resetting the sitename field present in the refer site select boxes in the add new page.
      jQuery('#siteReferOper').closest('td').find('[refer-site-name]').text(jQuery('#siteReferOper option[value="'+jQuery('#siteReferOper').val()+'"]').text());
      jQuery('#siteReferHoli').closest('td').find('[refer-site-name]').text(jQuery('#siteReferHoli option[value="'+jQuery('#siteReferHoli').val()+'"]').text());
      jQuery('#siteRefer').closest('td').find('[refer-site-name]').text(jQuery('#siteRefer option[value="'+jQuery('#siteRefer').val()+'"]').text());
    }
    
    /*setSiteAssociation.prototype = {
        getValue() {
            return this.value;
        },
        setValue(val){
            this.value = val;
        }
    };*/
};
    function siteDeleteResponseHandler(type, successFailMsg, response, isFromAssociation) {
        if(isFromAssociation) {
            jQuery("#loadingdivid").hide();
            jQuery("[id*='_DIALOG_CONTENT'] #form-footer").show();
            closeDialog();
            SiteAdmin.closeDeptDissociatePopup();
        }
        refreshSubView(getPortalViewName('SiteListView'));
        var msgs = {};
        var tempDeleteSiteDiv = jQuery("#deletesitemsgpopup").clone();
        tempDeleteSiteDiv.attr('id', 'tempDeleteSiteDiv');
        for(j=0;j<response.response_status.length;j++) {
            if(response.response_status[j].messages) {
                for(i=0;i<response.response_status[j].messages.length;i++) {
                    var msg = response.response_status[j].messages[i].message;
                    if(typeof msg != 'string' && response.response_status[j].messages[i].type == 'failed') {
                        msg = getMessageForKey("sdp.admin.site.errorinsiteassoc");
                    }
                    if(msg.message && typeof msg.message == 'string') {
                        if(msgs[msg.message]) {
                            msgs[msg.message].push(msg.name);
                        }
                        else {
                            msgs[msg.message] = [msg.name];
                        }
                    }
                }
            }
            else if(response.response_status[j].status=='success'){
                tempDeleteSiteDiv.find("#successSiteMsg").removeClass('hide').find(".msg").text(successFailMsg);
            }
        }
        var haveBigMsg = false;
        for(msg in msgs) {
            var sites = msgs[msg];
            var tempMsgDiv = jQuery("#siteDeleteMsgDiv").clone();
            tempMsgDiv.find("#displayMsg").text(msg);
            for(i=0;i<sites.length;i++) {
               tempMsgDiv.find("#sitesList").append("<li>"+encodeHTML(sites[i])+"</li>");
            }
            tempDeleteSiteDiv.append(tempMsgDiv.children());
            haveBigMsg = true;
        }
        if(haveBigMsg) {
            tempDeleteSiteDiv.removeClass("hide").dialog({width: 580, minHeight: 'auto', modal: true, resizable: false, title: getMessageForKey("sdp.admin.site.delete")}); //NO I18N
        }
        else {
            var autoHide = 'false';
            if(type='success') {
                autoHide = 'true';
            }
            showalert(type, successFailMsg,'isAutoHide='+autoHide); //No I18N
        }
    }
	// Form validation for delimiter settings
function validateDelimiterSettings(el) {
  var delimiter = jQuery('#base-delimiter').val();
  if(delimiter == ''){
    var msg = getMessageForKey("common.empty.msg", [getMessageForKey("sdp.admin.email.delimiter.basedelimiter")]);
    showalert('failure',msg,'isAutoHide=false,width=500,height=80');//NO I18N
    jQuery('#base-delimiter').parent().addClass('has-error');
    return false;
  }
 else if(delimiter.length > 10)
  {
    var msg =  getMessageForKey("sdp.admin.email.delimiter.charlength");
    showalert('failure',msg,'isAutoHide=false,width=500,height=80');//NO I18N
    jQuery('#base-delimiter').parent().addClass('has-error');
    return false;
  }
  else{
	var old = jQuery('#olddelimiter').val();
	var newval = jQuery('#base-delimiter').val();
	if(newval != old)
	{
		if(isValidChar(jQuery('#base-delimiter').val()))
		{
			updateDelimiters();
		}
		else
		{
			var msg = getMessageForKey("sdp.admin.email.delimiter.allowedchars1")+" "+getMessageForKey("sdp.admin.email.delimiter.allowedchars2");
			showalert('failure',msg,'isAutoHide=false,width=500,height=80');//NO I18N
		}
	}
	else
	{
		var msg = getMessageForKey("sdp.common.nochangestosave");
		showalert('success', msg ,'isAutoHide=true,width=500,height=80');//NO I18N

	}
  }
}
function isValidChar(delimiterValue) {
 var allowedChars = "!@#$%^&";//NO I18N
 for (i=0;i<delimiterValue.length;i++) 
 { 	
	var chars = delimiterValue.charAt(i);
	if(allowedChars.indexOf(chars) <= -1) 
	{
		return false;
	}
	 
 }
return true;
}
function updateDelimiters()
{
	var base = jQuery("#base-delimiter").val();
//	var jsonData = {"basedelimiter":base,"request":"RE","change":"CH"};
   	var jsonData = {"basedelimiter":base};//NO I18N
    jsonData[getCSRFParamName()]=getCSRFParamValue(); //CSRF Param
	var response="";
	jQuery.ajax({
		url: "/EMailDef.do?mailType=delimiter&mode=updateDelimiters", //NO I18N
		data: jsonData,
		type: "POST", //NO I18N
		dataType:"json", //NO I18N
		complete : function(jqxhr)
			{
				response = jqxhr.responseText;
				if(response === "success")
				{
					showDelimiterSuccessMsg();
				}
				else
				{
					showDelimiterErrMsg();
				}
			}
		}); 
}
function showDelimiterSuccessMsg()
{
	var msg = getMessageForKey("api.updated.success", [getMessageForKey("sdp.admin.email.delimiter.basedelimiter")]);
        showalert('success',msg,'isAutoHide=true,width=500,height=80');//NO I18N
        jQuery('#base-delimiter').parent().removeClass('has-error');
	var newval = jQuery('#base-delimiter').val();
        jQuery('#olddelimiter').val(newval);
}
function showDelimiterErrMsg(data)
{
	var msg = getMessageForKey("sdp.admin.email.delimiter.saveerror");
	showalert('failure',msg,'isAutoHide=false,width=500,height=80');//NO I18N
}
function resetDelimiterSettings(isAsset)
{
	var old = jQuery('#olddelimiter').val();
	jQuery("#base-delimiter").val(old);
	var preview = old+"RE-$EntityId"+old;//NO I18N
	if(isAsset == 'true')
	{
		preview = old + "PR-$EntityId"+old;//NO I18N
	}
	jQuery('#delchar').html(preview);
}
function delimiterKeyDownFn(event)
{
	var delimiter = jQuery("#base-delimiter").val();
	var keyCode = event.keyCode || event.which;
	if (keyCode ==8 || keyCode ==9 || (keyCode >=49 && keyCode <= 55) && isNaN(parseInt(event.key)) || keyCode ==37 || keyCode ==39 || keyCode ==46)
	{
		return
 	} //!, @, #, $, %, ^, & BACKSPACE DEL ARROW_KEYS
	else
	{
    		event.preventDefault();  return false;
  	}
}
function delimiterKeyUpFn(event, isAssetBuild)
{
  	var del = jQuery("#base-delimiter").val();
  	var str = del+"RE-$EntityID"+del;//NO I18N 
	if(isAssetBuild == 'true')
	{
		str = del+"PR-$EntityID"+del;//NO I18N
	}
  	jQuery('#delchar').html(str);
}
//MICKEY2LITE: This method has been coipied from old MickeyClient Code. Sample usage of this method:- changing site filter in Admin->Department
function updateFormValues(id, formObj){
	var uniqueId = getUniqueId(id);
    var searchColumns = "";
    var searchValues = "";
    if(formObj!=null && formObj != undefined){
	var length = formObj.elements.length;
	if(!validateForm(formObj)){
		return false;
	}	
	var initial = true;
	for(i = 0; i < length; i++){
		var type = formObj.elements[i].type;
		if(type == "text"){
			var name = formObj.elements[i].name;
			var value = formObj.elements[i].value;
			if(value != null && value.trim() != ""){
				if(!initial){
					searchColumns = searchColumns + ",";
					searchValues = searchValues + ",";
				}
				searchColumns = searchColumns + name;
				searchValues = searchValues + value;
				initial = false;
			}
		}
	}
    }
	uniqueId = getPortalViewName(uniqueId);
	updateState(uniqueId, "SEARCH_COLUMN", searchColumns);
	updateState(uniqueId, "SEARCH_VALUE", searchValues);
	updateState(uniqueId, "_SB", null);
	//Commented the below line as it is throwing undefined error, older code copied from mickeyclient 
	//stateData[uniqueId]._VMD= '1';
	updateState(uniqueId, "_FI", "1");
	updateState(uniqueId, "_TI", null);
	refreshSubView(uniqueId);
	return false;
}

function populatePendingCount()
{
  jQuery('#pendingCountBtn').prop('disabled',true); //No I18N
  loadShow(jQuery('.load-ref'));
  disableMoveMailsLink();
  var data = {"command" : "getPendingCount"};    //No I18N
  jQuery.ajax({
      url : '/servlet/testmail',  //No I18N
      method : "GET",  //No I18N
      data : data,
      async : true,
      success : function(response)
      {
        if(response.inbox)
        {
            if(response.inbox.status == 'success')
            {
                updatePendingCount(response.inbox.pendingCount);
            }
            else
            {
                updatePendingCount("-");
                updateConnectivityMsgSpan(response.inbox.message);
            }
        }
        if(response.errorFolder)
        {
            if(response.errorFolder.status == 'success')
            {
                updateErrorMailCount(response.errorFolder.errorMailsCount);
            }
            else
            {
                updateErrorMailCount("-");
                updateConnectivityMsgSpan(response.errorFolder.message);
            }
        }
        if(response.additionalwarning) { //SD-110372
            if("failure" == response.additionalwarning.status) {
                updateConnectivityMsgSpan(response.additionalwarning.message, 'additionalwarning'); //No I18N
            }
        }
      },
      complete : function(){
        loadHide();
        jQuery('#pendingCountBtn').prop('disabled',false); //No I18N
        enableMoveMailsLink();
      }
    });
}

function updateConnectivityMsgSpan(msg, type)
{
    var ele = type == "additionalwarning" ? jQuery('#additionalWarningMsgSpan') : jQuery('#connectivityMsgSpan'); //No I18N
    if(!jQuery(ele.find('span.msg')).length > 0)
    {
        jQuery(ele).append(jQuery('#errorMsgContent').html());
    }
    jQuery(ele.find('span.msg')).html(msg);
    ele.removeClass('hide');
}

function moveMails(ele)
{
    if(ele && !jQuery(ele).attr('progress')) //To prevent multiple clicks before getting the response for the first ajax call
    {
        showconfirm(true, 'title=' + getMessageForKey("mail.error.folder.move.confirm") + ', message=' + getMessageForKey("mail.error.folder.move.confirm.content") + ', submitbutton=' + getMessageForKey("sdp.common.yes.uppercase") + ', cancelbutton=' + getMessageForKey("sdp.common.no.uppercase") + ', closeOnEscKey=false', function(resp){ //NO I18N
            if(resp)
            {
                disableMoveMailsLink();
                var data = {"command" : "moveMails"}; //NO I18N
                jQuery.ajax({
                    url : '/servlet/testmail',  //No I18N
                    method : "GET",  //No I18N
                    data : data,
                    async : true,
                    success : function(response){
                        if(response.status === 'success' || response.status === 'info')
                        {
                            if(response.count)
                            {
                                updatePendingCount(response.count.inbox);
                                updateErrorMailCount(response.count.errorFolder);
                            }
                            showalert(response.status, response.message, 'timeout=5'); //NO I18N
                        }
                        else
                        {
                            showalert(response.status, response.message, 'isAutoHide=false'); //NO I18N
                        }
                    },
                    error : function(response)
                    {
                        showalert('failure', getMessageForKey('mail.error.folder.move.failure'), 'isAutoHide=false'); //NO I18N
                    },
                    complete : function()
                    {
                        enableMoveMailsLink();
                    }
                });
            }
        });
    }
}

function disableMoveMailsLink()
{
  var ele = jQuery('#moveMailLink');
  jQuery(ele).attr('progress', 'true');
  jQuery(ele).addClass("disableDiv");
  jQuery('#moveMailsLoading').show();
}

function enableMoveMailsLink()
{
  var ele = jQuery('#moveMailLink');
  jQuery('#moveMailsLoading').hide();
  jQuery(ele).removeAttr('progress'); //NO I18N
  jQuery(ele).removeClass("disableDiv");
}

function updateErrorMailCount(count)
{
    if(count != undefined)
    {
        jQuery('#errorMailsCount').html(count);
        jQuery('#errorMailsCount1').html(count);
        if(count > 0)
        {
            jQuery('#errorMailsCount1').addClass("text-danger sb");
        }
        else
        {
            jQuery('#errorMailsCount1').removeClass("text-danger sb");
        }
    }
}

function updatePendingCount(count)
{
    if(count != undefined)
    {
        jQuery('#pendingCount').html(count);
    }
}

function attachErrorNotificationInfoDiv()
{
    jQuery('#errorNotification').on('click', function()
    {
        if(jQuery(this).prop('checked') == true)
        {
            showErrorNotificationInfoDiv();
        }
        else
        {
            jQuery('#errorNotificationInfoDiv').slideUp();
        }
    });
}

function loadErrorNotificationInfoDiv()
{
    if(jQuery('#errorNotification').prop('checked') == true)
    {
        showErrorNotificationInfoDiv();
    }
}

function showErrorNotificationInfoDiv()
{
    var notification = jQuery('#seNotificationConfigured');
    if(notification && notification.html() == 'false')
    {
        jQuery('#errorNotificationInfoDiv').slideDown();
    }
}

function loadErrorFolderSection()
{
    spInit();
    loadErrorNotificationInfoDiv();
    attachErrorNotificationInfoDiv();
    var checkbox = jQuery('#errorFolderOption');
    var isPOP = false;
    if(jQuery('input[name="mailtype"]:checked').val() == "javamail")
    {
        var authType = jQuery('#incAuthType').val();
        var protocol = ""; //No I18N
        if("basic" === authType)
        {
            protocol = jQuery('#incomingEmailType').val();
            if(protocol == 'pop3' || protocol == 'pop3s')
            {
                isPOP = true;
            }
        }
        else
        {
            protocol = jQuery('#incJavaOauthProto').val();
            if(protocol == 'pop3' || protocol == 'pop3s')
            {
                isPOP = true;
            }
        }
    }
    if(isPOP)
    {
        showErrorFolderSection(false);
        checkbox.prop('disabled', 'disabled'); //NO I18N
        jQuery('#errorFolderOptionInfo').prop('title', getMessageForKey("mail.error.folder.pop"));
    }
    else
    {
        checkbox.removeAttr('disabled'); //NO I18N
        jQuery('#errorFolderOptionInfo').removeAttr('title'); //NO I18N
        if(checkbox.prop('checked'))
        {
            showErrorFolderSection(true);
        }
        else
        {
            showErrorFolderSection(false);
        }
    }
}

function toggleErrorFolderOption(ele)
{
    if(ele.checked)
    {
        showErrorFolderSection(true);
    }
    else
    {
        showErrorFolderSection(false);
    }
}

function checkErrorFolderOption(ele)
{
    if(ele != undefined && ele.value != undefined)
    {
        var val = ele.value.toLowerCase();
        if(val === "imap" || val === "imaps")
        {
            var checkbox = jQuery('#errorFolderOption');
            checkbox.removeAttr('disabled'); //NO I18N
        }
        else
        {
            if(jQuery('#errorFolderOption').prop('checked'))
            {
                alert(getMessageForKey("mail.error.folder.pop.msg"));
            }
            showErrorFolderSection(false);
        }
    }
}

function showErrorFolderSection(show)
{
    var form = jQuery(document).find('form[name="EMailDefForm"]')[0];
    if(show)
    {
        jQuery(form).find('tr[errorfoldersect]').show();
    }
    else
    {
        jQuery(form).find('tr[errorfoldersect]').hide();
        jQuery('#errorFolderOption').removeAttr('checked'); //NO I18N
    }
}

function populateOutgoingTestResponse(response, ele)
{
    if(response != null)
    {
        response.isFetchSampleMail = false;
        renderhbs('#outgoingResult', 'fetch-send-sample-mail', response, false, 'admin'); //No I18N
        jQuery('#outgoingResult').show();
    }
    ele.button('reset');
}

function populateIncomingTestResponse(response,ele)
{
    if(response != null)
    {
        response.isFetchSampleMail = true;
        renderhbs('#incomingResult', 'fetch-send-sample-mail', response, false, 'admin'); //No I18N
        jQuery('#incomingResult').show();
    }
    ele.button('reset');
}

function testmail(command, toaddress, ele, mailServer, authType)
{
    var data = {};
    data.command = command;
    data.mailServer = mailServer;
    data.authType = authType;
    var method = "GET"; //No I18N
    if("sendSampleMail" == command)
    {
        data.testMailAddress = toaddress;
        method = "POST"; //No I18N
    data[getCSRFParamName()] = getCSRFParamValue();
        if(window.isMSP) {
            // MSP - outgoing mail server can be configured account specific
            data.accountId = $mspOutgoing.getAccountId();
        }
    }
    jQuery.ajax({
        url : '/servlet/testmail',  //No I18N
        method : method,
        data : data,
        async : true,
        success : function(response){
            if("fetchSampleMail" == command)
            {
                populateIncomingTestResponse(response,ele);
            }
            else
            {
                populateOutgoingTestResponse(response, ele);
            }

        },
        error : function(){
            populateErrorMsgInTestMail(command);
            ele.button('reset');
        }
    });
}

function populateErrorMsgInTestMail(command)
{
    var compileElement, scriptElement, message;
    if("fetchSampleMail" == command)
    {
        compileElement = 'incomingResult'; //No I18N
        scriptElement = 'incomingTest'; //No I18N
        message = getMessageForKey('sdp.admin.testmail.incoming.failed');
    }
    else
    {
        compileElement = 'outgoingResult'; //No I18N
        scriptElement = 'outgoingTest'; //No I18N
        message = getMessageForKey('sdp.admin.testmail.outgoing.failed');
    }
    var response = {"response_status" : { "status" : "failure", "message" : message, "exception" : getMessageForKey("sdp.vulnerability.error.unknownexception.msg")+" "+getMessageForKey("common.referlogs")}}; //No I18N
    response.isFetchSampleMail = (scriptElement == 'incomingTest' ? true : false);
    renderhbs('#' + compileElement, 'fetch-send-sample-mail', response, false, 'admin');
    jQuery('#'+compileElement).show();
}


//To set value for hidden input element mode as add|update|cancel operations which is used as operation-param in security configurations
function setOperationParamValue(form,mode){
form.mode.value=mode;
}
var dynamicLoadingHelpers = {
    dynamicLoading: false,
    optionList: [],
    fieldType: "",
    $currentTab: "",
    default_value: "",
    default_value_obj: null,

    init:function(fieldType, options, default_value){
        this.fieldType = fieldType;
        this.optionList = options;
        this.dynamicLoading = true;
        this.$currentTab = jQuery("#"+fieldType);
        if(default_value){
            this.default_value_obj = {"id":default_value, "text":default_value}; //No I18N
            this.default_value = default_value;
        }
        this.constructSearchBox();
        this.populateOptionList("");
        this.constructSelect2Preview();
    },
    /* construct and reconstruct the select2 preview using the optionList array*/
    constructSelect2Preview:function(){
        var enclosingDiv = this.$currentTab.find("#select_list").parent();
        this.$currentTab.find("#select_list").select2("destroy"); //No I18N
        enclosingDiv.html(""); //clearing the container div
        enclosingDiv.append('<input id="select_list" data-dynamic-options="true"/ style="width:350px">');

        var $fieldObject = this.$currentTab.find("#select_list");
        var multiple = (this.fieldType.indexOf("Pick") > -1) ? false : true;

        var allowedValues = [];
        for(var i=0; i<this.optionList.length; i++){
            allowedValues.push({id:this.optionList[i], text:this.optionList[i], disabled:true});
        }

        dynamicLoading.init($fieldObject,{
            allowedValues: allowedValues,
            multiple: multiple,
            selectedValues: this.default_value_obj
        });
    },
    constructSearchBox:function(){
        //add search box
        var _self = this;
        this.$currentTab.find(".list_values").append('<li><input type="text" id="optionSearch" placeholder="Search in options list" style="width:100%"></li>');
        jQuery("#optionSearch").on("keypress blur", function(event){
            if((event.type === "keypress" && event.which === 13) || event.type === "blur"){
                var searchTerm = this.value;
                _self.populateOptionList(searchTerm);
            }
        });
    },
    populateOptionList:function(term){
        //remove all existing options
        jQuery(".dynamicOptionList").remove();
        if(!term || term.trim() === ""){
            matchedArray = this.optionList;
        }else{
            var matchedArray = this.optionList.filter(function(option){
                return option.toLowerCase().indexOf(term.toLowerCase()) > -1
            });
        }

        var code = '</span><div><label title=\''+getMessageForKey("sdp.admin.picklist.default.title")+'\'>'+getMessageForKey("sdp.inventory.detailWS.default")+'</label><em class='+"'edit_entry'"+' title='+getMessageForKey("sdp.common.edit")+'>'+getMessageForKey("sdp.common.edit")+'</em>'+'<em class='+"'close_icon'"+' title='+getMessageForKey("sdp.requests.config.delete")+'>X</em></div></li>'; //No I18N
        if(this.fieldType === "MultiSelect"){
            code = '</span><div><em class='+"'edit_entry'"+' data-form='+"'form7'"+' title='+getMessageForKey("sdp.common.edit")+'>'+getMessageForKey("sdp.common.edit")+'</em>'+'<em data-form='+"'form7'"+' class='+"'close_icon'"+' title='+getMessageForKey("sdp.requests.config.delete")+'>X</em></div></li>'; //No I18N
        }

        //set max number of options to 500
        var len = matchedArray.length > 500 ? 500 : matchedArray.length;
        for(var i=0; i<len; i++){
            this.$currentTab.find(".list_values").append("<li data-name='"+matchedArray[i]+"' class='dynamicOptionList'><span title='"+matchedArray[i]+"'>"+matchedArray[i]+code);//No I18N
            if(matchedArray[i] == this.default_value)
            {
                var sm_val = matchedArray[i].toLowerCase();
                this.$currentTab.find('.list_values li[data-name="' + sm_val + '"] label').addClass('default cur');
            }
        }
    }
}



function fillScope(ele, scopeEleName)
{
    var authurl = ele.value;
    var scopeEle = jQuery('#'+scopeEleName);
    if(authurl.indexOf("google") !== -1)
    {
        scopeEle.val('https://mail.google.com'); //NO I18N
    }
    else if(authurl.indexOf("microsoft") !== -1)
    {
        name = ele.name;
        if(name === 'incJavaOauthAuthUrl')
        {
            scopeEle.val('https://outlook.office365.com/IMAP.AccessAsUser.All,offline_access'); //NO I18N
        }
        else if(name === 'incEwsOauthAuthUrl' || name === 'outEwsOauthAuthUrl')
        {
            scopeEle.val('https://outlook.office365.com/EWS.AccessAsUser.All,offline_access'); //NO I18N
        }
        else if(name === 'outJavaOauthAuthUrl') //SD-88208
        {
            scopeEle.val('https://outlook.office365.com/SMTP.Send,offline_access'); //No I18N
    }
}
}
function showHideAutoAssignNotification()
{
	if(isMSP && document.getElementById('accountAutoAdditionYes').checked){
		jQuery('#autoAssignNotificationDiv').show();
	}
	else {
		jQuery('#autoAssignNotificationDiv').hide();
	}
}
function showHideTechSelectDiv()
{
	if(document.getElementById('autoAssignNotificationYes').checked){
		jQuery('#techNotificationDiv').show();
	}
	else {
		jQuery('#techNotificationDiv').hide();
	}
}
function escalateToList(nameList, idList, noTicketOwner)
{
  var mode = 'add';//No i18N

  var evalStr = document.getElementsByName(nameList)[0]
  var values = evalStr.value;

  evalStr = document.getElementsByName(idList)[0];
  var ids = evalStr.value;

  if(values!=null && values!='' && ids!=null && ids!='')
  {
    mode = 'edit';//No i18N
  }

  url = 'SearchItem.do?criteria=Technician Name&element1=document.SettingsForm.'+encodeURIComponent(nameList)+'&element2=document.SettingsForm.'+encodeURIComponent(idList)+'&from=escalate&mode='+encodeURIComponent(mode);//NO I18N
  if(noTicketOwner == 'true')  {
    url = url + "&noTicketOwner=true";//No i18N
  }
  NewWindow(url,'selectitem','320','350','yes','center');
}

function trimToEmail(element)
{
    var emails = element.value;
    emails = removeComma(emails);
    element.value = emails;
}

function removeComma(emails)
{
    emails = emails.trim();
    if(emails.length == 0)
    {
        return emails;
    }
    var start = emails.indexOf(",");
    while(start == 0)
    {
        emails = emails.substring(1);
        start = emails.indexOf(",");
    }

    var length = emails.length;
    var end = emails.lastIndexOf(",");
    while(length != 0 && (end == length-1))
    {
        emails = emails.substring(0, end);
        length = emails.length;
        end = emails.lastIndexOf(",");
    }
    return emails;
}

/**
 * The method is to populate port, show / hide tls element, disable error folder option based on protocol change
 * @param {*} isIncoming - true if this is for "Incoming" else false
 * @param {*} authType - "basic" / "oauth"
 */
function loadProtocolDetails(serverType, authType)
{
    var protocolEle, tlsElementName, portElementName;
    if("incoming" === serverType)
    {
        if("basic" === authType)
        {
            protocolEle = document.getElementById('incomingEmailType');
            tlsElementName = 'tlsEnabled'; //No I18N
            portElementName = 'incomingPort'; //No I18N
        }
        else
        {
            protocolEle = document.getElementById('incJavaOauthProto');
            tlsElementName = 'incJavaOauthTls'; //No I18N
            portElementName = 'incJavaOauthPort'; //No I18N
        }
    }
    else
    {
        if("basic" === authType)
        {
            protocolEle = document.getElementById('outgoingEmailType');
            tlsElementName = 'outgoingTlsEnabled'; //No I18N
            portElementName = 'outgoingPort'; //No I18N
        }
        else
        {
            protocolEle = document.getElementById('outJavaOauthProto');
            tlsElementName = 'outJavaOauthTls'; //No I18N
            portElementName = 'outJavaOauthPort'; //No I18N
        }
    }
    var protocol = protocolEle.value;
    var mailtype = protocolDetails[authType][protocol];
    var tlsValue = mailtype.tls == true ? "true" : "false";

    //Populate port value based on the selected protocol
    jQuery('#' + portElementName).val(mailtype.port);
    /*
        If selected protocol is pop, pops, imap -> select tls as 'false' and hide tls element
        Else, select configured tls element and remove 'hide' class.
    */
    if(protocol === 'pop3' || protocol === 'pop3s' || protocol === 'imap')
    {
        jQuery("input[name=" + tlsElementName + "]").closest("tr").addClass("hide"); //No I18N
        jQuery("input[name=" + tlsElementName + "][value='false']").prop("checked", true); //No I18N
    }
    else
    {
        jQuery("input[name=" + tlsElementName + "][value='" + tlsValue + "']").prop("checked", true); //No I18N
        jQuery("input[name=" + tlsElementName + "]").closest("tr").removeClass("hide"); //No I18N
    }

    if("incoming" === serverType)
    {
        //To show "disable error folder" alert on protocol change
        checkErrorFolderOption(protocolEle);

        //Load error folder section based on the protocol change
        loadErrorFolderSection();
    }
}

function confirmSubmission(theForm) {
    if(valIncomingEmail(theForm))
    {
        if(!isEmailDebugEnabledOnLoad && theForm.enableDebug.checked) {
            showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + translate("sdp.admin.email.debug.consent") + ', submitbutton=' + translate('sdp.admin.translation.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=no, closeOnEscKey=no', function(proceed) {//NO I18N
                if (proceed) {
                    checkScheduleAndSubmit(theForm);
                }
            });
        } else {
            checkScheduleAndSubmit(theForm);
        }
    }
    return false;
}

function checkScheduleAndSubmit(theForm) {
     var isSave = theForm.Email_Save_Btn ? true : false;
    //Check if mail fetching schedule is running
    if(schedule) {
        var features = "title=" + getMessageForKey("common.confirm.submit") + ",message=" + getMessageForKey("mail.save.warning") + ",submitbutton=" + getMessageForKey("common.yes") + ",cancelbutton=" + getMessageForKey("common.no") + ",closebutton=no,closeOnEscKey=no"; //No I18N
        showconfirm(true, features, function(option) {
            if(option)
            {
                if(isSave) {
                    theForm.Email_Save_Btn.disabled = true;
                } else {
                    theForm.Email_Update_Btn.disabled = true;
                }
                theForm.submit();
            }
            else
            {
                window.location.href = "/EMailDef.do?mailType=incoming&mode=view";
            }
        });
    } else {
        if(isSave) {
            theForm.Email_Save_Btn.disabled = true;
        } else {
            theForm.Email_Update_Btn.disabled = true;
        }
        theForm.submit();
    }
    return false;
}

function handleSMTPSForJavaOauth(event){
    var outJavaOauthHost = jQuery('#outJavaOauthHost').val().trim();
    if('smtp.office365.com' === outJavaOauthHost || 'outlook.office365.com' === outJavaOauthHost)
    {
        if('onchange' === event)
        {
            changeOutJavaProto();
        }
        jQuery('#outJavaOauthProto option[value=smtps]').hide();
    }
    else {
        jQuery('#outJavaOauthProto option[value=smtps]').show();
    }
}

function changeOutJavaProto()
{
    var javaOauthProtoEle = jQuery('#outJavaOauthProto');
    var outJavaOauthProto = javaOauthProtoEle.val();
    if('smtps' === outJavaOauthProto)
    {
        javaOauthProtoEle.children('option[value=smtp]').prop("selected", true); //No I18N
        javaOauthProtoEle.trigger('onchange');
    }
}
//commented code will be removed after got review
function checkProxySettings(proxyForm){
 //SD:58911-Need to remove the mandatory check for username and password for proxy settings under admin.

   if(proxyForm.proxyHost.value == null || proxyForm.proxyHost.value.trim() == "" ){

        alert( getMessageForKey("sdp.admin.proxysettings.validation.mandatory", [ getMessageForKey("sdp.admin.proxy.host") ]) );

        proxyForm.proxyHost.focus();    return;
    }
    if(proxyForm.proxyPort.value == null || proxyForm.proxyPort.value.trim() == "" ){

        alert( getMessageForKey("sdp.admin.proxysettings.validation.mandatory", [ getMessageForKey("sdp.admin.proxy.port") ]) );

        proxyForm.proxyPort.focus();    return;
    } else if( ! checkNumeric(proxyForm.proxyPort, 'int', false) ){     return;     }       //NO I18N
    /*
    if( proxyForm.proxyPassword.value!="" && (proxyForm.proxyUserName.value == null || proxyForm.proxyUserName.value.trim() == "" )){

        alert( getMessageForKey("sdp.admin.proxysettings.validation.mandatory", [ getMessageForKey("sdp.admin.proxy.username") ]) );

        proxyForm.proxyUserName.trigger('focus');    return;
    }
    if((proxyForm.proxyUserName.value!="") proxyForm.proxyPassword.value == null || proxyForm.proxyPassword.value.trim() == "" ){

        alert( getMessageForKey("sdp.admin.proxysettings.validation.mandatory", [ getMessageForKey("sdp.admin.proxy.password") ]) );

        proxyForm.proxyPassword.trigger('focus');    return;
    }*/
    var proxyPassword = proxyForm.proxyPassword.value;
    //Only in the update mode the 'proxyPwdChanged' element will be rendered.
    if(jQuery('#proxyPwdChanged').length){
        if(checkProxyOldValues(proxyForm)){
            showconfirm(true, 'title=' + getMessageForKey("admin.proxy.update.title") + ', message=' + getMessageForKey('admin.proxy.update.confirmation') + ', submitbutton=' + getMessageForKey("sdp.common.update") + ', cancelbutton=' + getMessageForKey("sdp.common.cancel") + ', closebutton=yes, closeOnEscKey=yes', showconfirmcallback); //No I18N
            function showconfirmcallback(result){
                if(result){
                    if(proxyPassword != null && proxyPassword.trim() != '') {
                        proxyForm.proxyPassword.value = encryptDataWithRSA(proxyPassword);
                    }
                    addUpdateProxySettings(proxyForm);
                }
            }
        }
    }
    else{
        if(proxyPassword != null && proxyPassword.trim() != '') {
            proxyForm.proxyPassword.value = encryptDataWithRSA(proxyPassword);
        }
        addUpdateProxySettings(proxyForm);
    }
}
function addUpdateProxySettings(proxyForm){
    if(forwardfrom === "ESM"){
            sdpAjax({
                url: "/ProxySettings.do",  //No I18N
                async:false,
                cache:false,
                type: 'POST', //No I18N
                data: jQuery(proxyForm).serialize(),
                complete: function (resp) {
                    jQuery("#mdhSection-content").html(resp.responseText);
                }
            });
    }else{
        proxyForm.submit();
    }
}
function showProxyEditForm(){
    jQuery('#save').removeClass('hide');
    jQuery('#edit').addClass('hide');
}
function showProxyViewForm(){
    jQuery('#edit').removeClass('hide');
    jQuery('#save').addClass('hide');
}
function showNewProxyPassword(){
    jQuery('#resetProxyPassword').addClass('hide');
    jQuery('#newProxyPassword').removeClass('hide');
    jQuery('#proxyPwdChanged').val('true');
    document.ProxySettingsForm.proxyPassword.focus();
}
function showResetProxyPassword(){
    jQuery('#resetProxyPassword').removeClass('hide');
    jQuery('#newProxyPassword').addClass('hide');
    jQuery('#proxyPwdChanged').val('false');
}
function deleteProxySettings(proxyForm){
    showconfirm(true, 'title=' + getMessageForKey("admin.proxy.delete.title") + ', message=' + getMessageForKey('admin.proxy.delete.confirmation') + ', submitbutton=' + getMessageForKey("sdp.common.delete") + ', cancelbutton=' + getMessageForKey("sdp.common.cancel") + ', closebutton=yes, closeOnEscKey=yes', showconfirmcallback); //No I18N
    function showconfirmcallback(result){
        if(result){
            if(forwardfrom === "ESM"){
                sdpAjax({
                    url: "/ProxySettings.do",  //No I18N
                    async:false,
                    cache:false,
                    type: 'POST', //No I18N
                            data: jQuery(proxyForm).serialize(),
                    complete: function (resp) {
                    jQuery("#mdhSection-content").html(resp.responseText);
                    }
                });
            }
            else {
                proxyForm.submit();
            }
        }
    }
}
function checkNumeric(element, type, allowNegativeValue){

	if( allowNegativeValue == null ){		allowNegativeValue = false;		}

	if( type == null ){	type = 'int'; }

	if (element.value.trim() != ""){
		if('int'==type && !isNumeric(element.value)){

			if( allowNegativeValue && ! isNaN(element.value) ){		return true;	}

			element.value = '';

			window.numeric_check_failed=true;

			alert(getMessageForKey('sdp.common.number.validation.msg'));

			// this is to avoid cross browser issue..
			setTimeout(function() { element.focus(); }, 10);

			return false;
		}else if('Double'==type && !isDouble(Number(element.value))){//NO I18N

			if( allowNegativeValue && ! isNaN(element.value) ){		return true;	}

			element.value = '';

			window.numeric_check_failed=true;

			alert(getMessageForKey('sdp.common.number.validation.msg'));

			// this is to avoid cross browser issue..
			setTimeout(function() { element.focus(); }, 10);

			return false;
		}
	}
	window.numeric_check_failed=false;
	return true;
}
//SD-105010
function isOffice365BasicAuth(isIncoming, theForm) {
    if(isIncoming) {
        var mailOption = theForm.incomingMailOption.value;
        hostEle = (mailOption == "javamail") ? theForm.incomingHost : theForm.incomingEwsUrl; //No I18N
    }
    else {
        var mailOption = theForm.outgoingMailOption.value;
        hostEle = (mailOption == "javamail") ? theForm.outgoingHost : theForm.outgoingEwsUrl; //No I18N
    }
    host = hostEle.value;
    if(host && host.toLowerCase().indexOf("office365") > 0) {
        hostEle.focus();
        return true;
    }
}

//SD-117985
function isOffice365EWSConfigured(isIncoming, theForm, authType) {
    if(authType === "oauth") {
        var host, hostEle;
        hostEle = isIncoming ? theForm.incEwsOauthConnectUrl : theForm.outEwsOauthConnectUrl;
        host = hostEle.value;
        if(host && host.toLowerCase().indexOf("office365") > 0) {
            return true;
        }
    }
    return false;
}

function modifyHistoryElement(mailType) {

    try {
        var historyId;
        var entity;
        var entityDataId;
        var entityKey;
        if("incoming-mailAPI" === mailType) {
            historyId = "incoming_history_id"; //No I18N
            entity = "incoming_javamail"; //No I18N
            entityDataId = "incoming_javamails"; //No I18N
            entityKey = getMessageForKey('mail.incoming.javamail.entity');
        }
        else if("incoming-ewsAPI" === mailType) {
            historyId = "incoming_history_id"; //No I18N
            entity = "incoming_ewsmail"; //No I18N
            entityDataId = "incoming_ewsmails"; //No I18N
            entityKey = getMessageForKey('mail.ews.entity');
        }
        else if("incoming-graphAPI" === mailType) {
            historyId = "incoming_history_id"; //No I18N
            entity = "incoming_graphmail"; //No I18N
            entityDataId = "incoming_graphmails"; //No I18N
            entityKey = getMessageForKey('mail.graph.api');
        }
        else if("outgoing-mailAPI" === mailType) {
            historyId = "outgoing_history_id"; //No I18N
            entity = "outgoing_javamail"; //No I18N
            entityDataId = "outgoing_javamails"; //No I18N
            entityKey = getMessageForKey('mail.outgoing.javamail.entity');
        }
        else if("outgoing-ewsAPI" === mailType) {
            historyId = "outgoing_history_id"; //No I18N
            entity = "outgoing_ewsmail"; //No I18N
            entityDataId = "outgoing_ewsmails"; //No I18N
            entityKey = getMessageForKey('mail.ews.entity');
        }
        else if("outgoing-graphAPI" === mailType) {
             historyId = "outgoing_history_id"; //No I18N
             entity = "outgoing_graphmail"; //No I18N
             entityDataId = "outgoing_graphmails"; //No I18N
             entityKey = getMessageForKey('mail.graph.api');
        }

        var historyEle = jQuery('#' + historyId);
        historyEle.attr('search-filter', entity);
        historyEle.attr('entity-key', entityKey);
        historyEle.attr('data-id', entityDataId);
    }
    catch(err) {

    }
}

function showOutgoingGraph() {

    //Hide other forms
    jQuery('[data-change=outgoing-mailrow]').addClass('hide');
    jQuery('[data-change=connect-outgoing-auth]').addClass('hide');
    jQuery('[data-change=connect-outgoing-auth-ews]').addClass('hide');
    jQuery('[data-change=outgoing-ewsrow]').addClass('hide');

    //Show graph form
    jQuery('[data-change=outgoing-graph]').removeClass('hide');

    //hide the outgoing authtype select option
    jQuery('#outAuthType').val('oauth'); //No I18N
    jQuery('#outAuthType').closest('tr').addClass('hide'); //No I18N

    //Handle style for form td and send sample mail td
    jQuery('#send-sample-mail-td').attr('style', 'max-width:366px; top: -7px;');
    jQuery('#outgoing-parent-td').attr('style', 'max-width: 386px; top: -4px;');

    //Set graph scope as readonly
    jQuery('input[name=outGraphOauthScope]').prop("readonly", "readonly"); //No I18N

    // //Hide other proxy elements
    // jQuery('#outGraphOauthProxy').removeClass('hide');
    // jQuery('#outEwsOauthProxy').addClass('hide');
    // jQuery('#outEwsBasicProxy').addClass('hide');
    // jQuery('#outJavaOauthProxy').addClass('hide');
    // jQuery('#outJavaBasicProxy').addClass('hide');
    // jQuery('#incGraphOauthProxy').addClass('hide');

    jQuery('.sdtab-pane').find('[data-error-name=errormsg]').remove();
    jQuery('#outgoingResult').hide();

    //Setting outgoing mailoption as "graph"
    document.EMailDefForm.outgoingMailOption.value = "graph";//NO I18n
}

function hideOutgoingGraph() {

    //Reverting the showOutgoingGraph() changes

    jQuery('[data-change=outgoing-graph]').addClass('hide');
    jQuery('#outAuthType').closest('tr').removeClass('hide'); //No I18N

    //Resetting the style values
    jQuery('#send-sample-mail-td').attr('style', 'max-width:366px;top:-61px;');
    jQuery('#outgoing-parent-td').attr('style', 'max-width: 386px; top: -14px;');
}

function showIncomingGraph() {

    //Hide other forms
    jQuery('[data-change=incoming-mailrow]').addClass('hide');
    jQuery('[data-change=incoming-ewsrow]').addClass('hide');
    jQuery('[data-change=connect-auth]').addClass('hide');
    jQuery('[data-change=connect-auth-ews]').addClass('hide');

    //Show graph form
    jQuery('[data-change=incoming-graph]').removeClass('hide');

    //hide the incoming authtype select option
    jQuery('#incAuthType').val('oauth'); //No I18N
    jQuery('#incAuthType').closest('tr').addClass('hide'); //No I18N

    //handle style for td
    jQuery('#fetch-sample-mail-td').attr('style', 'max-width:384px; top:-6px; left: 2px;');
    //jQuery('#incoming-parent-td').removeClass("top-10");

    //set graph scope as readonly
    jQuery('input[name=incGraphOauthScope]').prop("readonly", "readonly"); //No I18N


    //setting incoming mailoption as "graph"
    document.EMailDefForm.incomingMailOption.value = "graph";//NO I18n

    //Hide other proxy elements
    jQuery('#incGraphOauthProxy').removeClass('hide');
    jQuery('#incEwsOauthProxy').addClass('hide');
    jQuery('#incEwsBasicProxy').addClass('hide');
    jQuery('#incJavaOauthProxy').addClass('hide');
    jQuery('#incJavaBasicProxy').addClass('hide');

    jQuery('.sdtab-pane').find('[data-error-name=errormsg]').remove();
    jQuery('#incomingResult').hide();

    document.EMailDefForm.incomingMailOption.value = "graph";//NO I18n
}

function hideIncomingGraph() {
    //Reverting the showOutgoingGraph() changes

    jQuery('[data-change=incoming-graph]').addClass('hide');
    jQuery('#incAuthType').closest('tr').removeClass('hide'); //No I18N
    jQuery('#incGraphOauthProxy').addClass('hide');

    //Resetting the style values
    jQuery('#fetch-sample-mail-td').attr('style', 'max-width:386px; top:-51px;');
    //jQuery('#incoming-parent-td').addClass("top-10");
}
function showTrustStoreWarning(){
  var mailConfig=document.EMailDefForm.mailType.value;
  var customTrustDiv=document.getElementById(mailConfig.substring(0,3)+"CustomTrustStoreDiv");
  if(customTrustDiv!=undefined)
  {
    customTrustDiv.scrollIntoView( {behavior: 'smooth' });//No I18n
  }
}

function disableOnClick(disableButton,button) {
    if(disableButton) {
        button.style.pointerEvents = 'none'; //No I18N
        button.style.opacity = '0.5';
    }
    return disableButton;
}

// check for e-mail notification for self-service login.
function isLoginNotifcation_Outgoing_Enabled(){
    var result=true;
    sdpAjax({
        url: "/servlet/AJaxServlet?action=checkLoginNotification_Outgoing",  //No I18N
        async:false,
        type: 'GET', //No I18N
        complete: function (resp) {
           var response = JSON.parse(resp.responseText);
           var status=response.status;
           if(status=="failure"){
               showalert('failure', getMessageForKey("sdp.announcement.mail.configureserver.jserror") + "<a class='text-link' style='cursor:pointer' data-event='click' data-handler='javascript:redirectToOutgoingMailServer();' nonce=" + sdpNonce + "> " + getMessageForKey("sdp.inventory.home.scan.configurenow") + "</a>",'isAutoHide=false');//NO I18N
               $sdEventListener("#alertbox");  //No I18N
               result=false;
           }
        }
    });
    return result;
}

/* Part of SD-100780 fix */
function showClientSecret(eleId, showDeleteButton)
{
    jQuery('#old_'+ eleId).addClass('hide');
    jQuery('#new_' + eleId).removeClass('hide');
    if(showDeleteButton)
    {
        showClientSecretDeleteButton(eleId);
        setClientSecretTrue(); // Set changeClientSecret value as true when clicking the "Enter client secret" link  //No I18N
    }
    jQuery('#' + eleId).focus();
}

function resetClientSecret(eleId)
{
    jQuery('#old_'+ eleId).removeClass('hide');
    jQuery('#new_' + eleId).addClass('hide');
    jQuery('#changeClientSecret').val('false');
}

function showClientSecretDeleteButton(eleId)
{
    jQuery('#db_' + eleId).removeClass('hide');
}

function setClientSecretTrue()
{
    jQuery('#changeClientSecret').val('true');
}
/* Fix for SD-100780 ends */