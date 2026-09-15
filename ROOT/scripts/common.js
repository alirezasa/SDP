/* $Id$ */

/* global methods starts */
function $ID(id){
    return document.getElementById(id);
}
function $Val(targetId, value){
    if (value != undefined) {
        $ID(targetId).value = value;
    } else {
        return $ID(targetId).value;
    }
}
function $Html(targetId, html) {
    if (html != undefined) {
        $ID(targetId).innerHTML = html;
    } else {
        return $ID(targetId).innerHTML;
    }
}
/* global methods ends */

function BulkProjRoleAssign(URL,features,myForm){
    var checkedStatus = false;
    var params = "module=projectRoleBulkAssociate"; // No I18N
    //below code is to append the correct parameter seperator(?/&). Because sdp-msp is appending param in url
    params = (URL.split('?')[1] ? '&':'?') + params;// No I18N

    var formelement = myForm.delUserList;
    if(formelement.length){
        for(var i=0;i<formelement.length;i++){
            if(formelement[i].checked){
                params += "&CIID="+formelement[i].value; // No I18N
                checkedStatus = true;
            }
        }
    }else if(formelement.checked){

        params += "&CIID="+formelement.value; // No I18N
        checkedStatus = true;
    }
    if (checkedStatus){
        showURLInDialog(URL+params,features);
        return;
    }
    alert(getMessageForKey('sdp.admin.projectrole.selectuser'));// No I18N
}
//to allow only numbers
//to allow '.' change [46,8,9,27,13,110,190]
function allowNumbers(id)
{
    jQuery("#" + id).on('keydown', function (evt)
    {
        if (jQuery.inArray(evt.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 || (evt.keyCode == 65 && evt.ctrlKey === true) || (evt.keyCode >= 35 && evt.keyCode <= 39))
        {
            return true;
        }
        if ((evt.keyCode < 96 || evt.keyCode > 105) && (evt.shiftKey || (evt.keyCode < 48 || evt.keyCode > 57)) )
        {
            evt.preventDefault();
        }
    });
//  jQuery("#" + id).keypress(function(event) {
//      return /\d/.test(String.fromCharCode(event.keyCode));
//  });
    jQuery("#" + id).on(" cut copy paste",function(e) { //no i18n
          e.preventDefault();
    });
}

function selectUser(form, userId) {
    form.userList.value = userId;

    window.opener.$se.getUserDetails(userId);
    window.opener.jQuery('#email').text(window.opener.$se.requesterDetails.emailid);//No I18N
    /*
    var userdetails = window.opener.$se.requesterDetails;
    var select2Userdetails = {id: userdetails.userid, employeeId: userdetails.employeeid, deptName: userdetails.department, email: userdetails.emailid, name: userdetails.username};
    window.opener.jQuery("#reqSearch").select2('data', select2Userdetails); //NO I18N
    window.opener.reqSearchOnchange(null);
    */
    form.submit();

//    triggerEvent(window.opener.document.getElementById("reqSearch"),'change');//No I18N
    if(isMSP && window.opener.document.getElementById("reqSearch") != null) {
        window.opener.document.getElementById("reqSearch").focus();
    }
}

function showUserSearchPopup(module,isUser,searchText,apiModule,apiModuleId,apiEntity){

    if(searchText){
        searchText = "&searchText="+encodeURIComponent(searchText); // No I18N
    }else{
        searchText = ""; // No I18N
    }
    var apiData = "";
    if(apiModule && apiModule !== "null") {
        apiData += "&apiModule=" + apiModule;   //No I18N
    }
    if(apiModuleId && apiModuleId !== "null") {
        apiData += "&apiModuleId=" + apiModuleId;   //No I18N
    }
    if(apiEntity && apiEntity !== "null") {
        apiData += "&apiEntity=" + apiEntity;   //No I18N
    }
   NewWindow("/setup/UsersPopup.jsp?popupfor=searchuser&module="+module+"&isUser="+isUser+apiData+searchText,'selectuser','1200','600','yes','center'); // No I18N
}

function selectUserFromSearch(userId, userName) {
    getSetUserDetailsFromAPI(userId, userName);
    if(isMSP && window.opener.document.getElementById("reqSearch") != null) {
        window.opener.document.getElementById("reqSearch").focus();
    }
}

function getSetUserDetailsFromAPI(userId, userName) {
    var module = jQuery("#popupmodule").val();
    var entObj = {
        id: userId,
        name: userName
    };
    var entName = "user";   //NO I18N
    if(forwardfrom == "ESM"){
        entName = "orguser";    //NO I18N
    }

    if (userList.apiModule === "point_of_contact") {
        return userList.addPointOfContact(userId);
    }

    if(module === "Change"){ // No I18N
        var select2Userdetails = {id: userId,name: entObj.name};
        window.opener.$CRForm.setUsersPopupSelection(select2Userdetails);
    }else if(module === "Request"){ // No I18N
        if(userList && userList.apiEntity=="on_behalf_of"){
            var input_data={"list_info":{"fields_required":["name","email_id","department","phone","mobile","jobtitle","employee_id","first_name","middle_name","last_name"],"search_criteria":{"field":"id","values":[userId],"condition":"is"}}}//no i18n
            sdpAjax({
                url : "/api/v3/requests/on_behalf_of", // No I18N
                data:{input_data:sdpToJSON(input_data)},
                async : false,
                success : function(resp){
                    entObj = resp.on_behalf_of[0];
                }
            });
        }
        else{
           sdpAjax({
                url : "/api/v3/"+entName+"s/"+userId, // No I18N
                async : false,
                success : function(resp){
                    entObj = resp[entName];
                }
            });
        }
        if(window.opener.$req && window.opener.$req.form && window.opener.$rf) {
            if(sdp_user.USERTYPE === "Technician") {
                window.opener.$req.form.selectUser(entObj, "requester");    //No I18N
                jQuery(window.opener.document).find("#user_details_more_div").removeClass("hide");  // No I18N
            } else {
                window.opener.$req.form.selectUser(entObj, "on_behalf_of"); //No I18N
            }
            window.close();
            return;
        }
        if(sdp_user.USERTYPE == "Requester"){
             jQuery(window.opener.document).find('#oboID').val(userId);
             jQuery(window.opener.document).find('#oboSearch').val(entObj.name);
             //Setting select2 data for obo search
             window.opener.jQuery("#oboSearch").select2('data', {id: userId, text: entObj.name}); //NO I18N
             window.opener.jQuery("#oboSearch").trigger('change');
             var baseDiv = jQuery(window.opener.document).find("#user_details_div"); // No I18N
            baseDiv.find('#jobTitle').text(entObj.jobtitle || "");
            baseDiv.find('#location').text(entObj.department?entObj.department.name : ""); // No I18N
            baseDiv.find('#contactNumber').text(entObj.phone || "");
            baseDiv.find('#email').text(entObj.email_id || "");

            baseDiv.removeClass('hide');
        }else{
            jQuery(window.opener.document).find('#requesterID').val(userId);
            jQuery(window.opener.document).find('#reqSearch').val(entObj.name);

            var select2Userdetails = {id: userId, employeeId: entObj.employee_id, deptName: entObj.department?entObj.department.name:"", email: entObj.email_id, name: entObj.name};
            window.opener.jQuery("#reqSearch").select2('data', select2Userdetails); //NO I18N
            window.opener.reqSearchOnchange(null);

            if(window.opener.document.getElementById("siteID")) {
              //SD: 25807 -- selecting the requester from popup will not override the site once it is defined.
              if(window.opener.document.getElementById('tempSiteValue') != null && window.opener.document.getElementById('tempSiteValue').value != "0" && window.opener.document.getElementById('tempSiteValue').value != null && window.opener.document.getElementById('tempSiteValue').value != "null")
              {
                window.opener.document.getElementById("siteID").value=window.opener.document.getElementById('tempSiteValue').value;
              }
             /* else
              {
                //window.opener.document.getElementById("siteID").value = entObj.site.id;
              }*/
            }
            jQuery(window.opener.document).find("#user_details_more_div").removeClass("hide"); // No I18N
        }

    }else if(module === "Release"){ // No I18N
       var select2Userdetails = {id: userId, employeeId: entObj.employee_id, deptName: entObj.department?entObj.department.name:"", email: entObj.email_id, name: entObj.name};
       window.opener.$releaseForm.setUsersPopupSelection(select2Userdetails);

    }else if(module === "Problem"){ // No I18N
        var select2Userdetails = {id: userId, employeeId: entObj.employee_id, email: entObj.email_id, name: entObj.name};
        window.opener.$PBForm.setUsersPopupSelection(select2Userdetails);

    }else if(module === "QuickReq"){ // No I18N
        if(window.opener.QuickCreateRequest.setField !== undefined){
            window.opener.QuickCreateRequest.setField(entObj.id, entObj.name);
        }
    }else if(module === "Department"){//No i18N
      // flow will come here when requester pop up is invoked from Department listing and for setting department head for department.
      // set the department head field in department section
      window.opener.jQuery('#form_container_department [name="department_head"]').select2('data', entObj).trigger("change"); //NO I18N
    }else if(module === "reportingTo"){ // No I18N
            window.opener.userAdd.setReportingToField(entObj.id,entObj.name);
    }else if(module === "Intermediate_Editing"){//No i18N
    	if(window.opener.$rf != undefined){
            window.opener.$rf.setFieldValue("editor", {id: entObj.id, name: entObj.name}); //NO I18N
        }
		else if(window.opener.$maintenanceDetails != undefined&&window.opener.$maintenanceDetails.$entityFields_FC != undefined){
            window.opener.$maintenanceDetails.$entityFields_FC.setFieldValue("editor", {id: entObj.id, name: entObj.name}); //NO I18N
        }
        else{
            window.opener.document.getElementById("editorId").value = entObj.id;
            window.opener.document.getElementById("editorField").value = entObj.name;
        }
    }else if(module === "mc"){//No i18N
        window.opener.document.getElementById("reqID").value = entObj.id;
        window.opener.document.getElementById("reqName").value = entObj.name;
    }
    else if(module === "Assets"){
        var getUser = null;
        sdpAjax({
            url : "/api/v3/"+entName+"s/"+userId, // No I18N
            async : false,
            success : function(resp){
                getUser = resp[entName];
            }
        });
        var getCurrDepartmentVal = window.opener.jQuery('#asset-form-container [name=department]').val();
       
        if(!getCurrDepartmentVal || !getUser.department || (getUser.department && getCurrDepartmentVal!=getUser.department.id)){
            window.opener.jQuery('#asset-form-container [name=department]').val(null).trigger("change");
        }
        var select2Userdetails = {id: userId, name: entObj.name,department: getUser.department};
        window.opener.jQuery('#asset-form-container [name="user"]').select2('data', select2Userdetails).trigger("change"); //NO I18N
    }
    window.close();
}

function getSetAllUserData(module,neededField,elementId){

    if(module == "cab")
    {
        let data=userList.getTableObject().bulkSelect.selectedRecords;
        let modifiedUsersData = Object.values(data).map(user => ({
        id: user.id,
        name: user.name,
        email_id:user.email_id,
        department:user.department
        }));
    let cabForm=window.opener.FC_Mapper.form_cabs_form;
    //delete all old fields
    cabForm.fields.members.current_value.length = 0;
    cabForm.setFieldValue('members',cabForm.fields.members.current_value.concat(modifiedUsersData));//No i18N
    window.opener.jQuery('[name="members"]').trigger("change");
    window.close();
    }

    var fieldStr = ""; // No I18N
    var ids = jQuery("#userID").val(); // No I18N
    if(!ids){ // No I18N
        ids = userList && userList.getTableObject().bulkSelect.getSelectedIDs();
    }else{
        ids = [ids];
    }
    var input_obj = {};
        input_obj.list_info = {};
        input_obj.list_info.search_criteria = {"field" : "id", "condition" : "in", "values" : ids}; // No I18N
        input_obj.list_info.fields_required = ["email_id","name"]; // No I18N
        var dataVal  =  sdpAjaxInputData(input_obj);
        var url = "/api/v3/users";  // url var introduced for modifying it for MSP // No I18N
        if(isMSP && module == "WorkOrder_EMailCC") { // Temporary fix to E-mail Id(s) To Notify not set from popup
            url = "/api/v3/requests/requester"; // No I18N
        }
    sdpAjax({
        url : url,
        data : dataVal,
        async : false,
        success : function(resp){
            var entObj = (isMSP && module == "WorkOrder_EMailCC") ? resp.requester : resp.users;    // for SDP it always assigns resp.users // No I18N
            var fieldName = "email_id"; // No I18N
            var entObj = resp.users, fieldName = "email_id"; // No I18N
            if(neededField == "Name"){ // No I18N
                fieldName = "name"; // No I18N
            }
            for(var i=0; i < entObj.length ;i++){
                if(entObj[i][fieldName] != null){
                    fieldStr = fieldStr + entObj[i][fieldName] + ","; // No I18N
                }
            }
            if(fieldStr != ""){
                fieldStr = fieldStr.substring(0,fieldStr.length-1)
            }
        }
    });
    var fieldId = "";
    if(module == "WorkOrder_EMailCC"){ // No I18N
        if(window.opener.$req && window.opener.$req.form && window.opener.$rf) {
            window.opener.$req.form.addSelectedEmails(fieldStr);
            window.close();
            return;
        }
        fieldId = "#ccField"; // No I18N
    }else if(module == "UserGroups"){ // No I18N
       fieldId = jQuery(window.opener.document).find("#"+elementId).find("#criteriaVal");
    }
	else if(module=="Maintenance_EMailCC"){
        if(window.opener.$maintenanceDetails && window.opener.$maintenanceDetails.$entityFields_FC) {
            window.opener.$maintenanceDetails.addSelectedEmails(fieldStr);
            window.close();
            return;
        }
	}
    var field = jQuery(window.opener.document).find(fieldId);
    if(!field.length && window.opener.jQuery('[data-field="EMAILCC"]').length) {   // No I18N
        window.opener.$req.prop.addSelectedEmails(fieldStr);
        window.close();
        return;
    }
    var existsMail = field.val();
    var final_string=fieldStr;
    if(existsMail.trim() != ""){
        final_string=existsMail + "," + fieldStr;
    }
    field.val(final_string); //NO I18N
    if(module=="WorkOrder_EMailCC"){
        window.opener.jQuery("#ccField").trigger('customchange');
    }
    window.close();
}

var oPrevElement;

function styleSwap(oElement, sEvent, sOff, sOn) {
    var cssClass;
    if(sEvent == 'click') {
        if(oPrevElement != null) {
            oPrevElement.className = sOff;
        }
        if (oElement) { oElement.className = sOff; }
        oPrevElement = oElement;
    }
    else {
        if (sEvent=='hover') {
            cssClass = sOn;
        }
        else {
            cssClass = sOff;
        }
        if (oPrevElement==null) {
            oElement.className = cssClass;
        }
        else {
            if(oPrevElement.id != oElement.id) {
                oElement.className = cssClass;
            }
        }
    }
}

function loader(did){
    var mid = document.getElementById(did);
    if(Store.getItem(mid)=="show"){
        mid.style.display = 'block'; //No I18N

    }else if(Store.getItem(mid)=="hide"){ //No I18N
        mid.style.display = 'none'; //No I18N
    }
}

function ShowHide(divId) {
    var id = document.getElementById(divId);
    if (id.style.display == "none") {
        Store.setItem({
            key:id,
            value:"show", //No I18N
            days:30
        });
        id.style.display = ''; //No I18N
    }
    else {
        Store.setItem({
            key:id,
            value:"hide", //No I18N
            days:30
        });
        id.style.display = 'none'; //No I18N
    }
}

/**
 *Hides the Warning/information/error message by sliding up
 **/
function hideSimple()
{
    jQuery("#message").hide(1000);
}

function Hide(divId) {
    var id = document.getElementById(divId);
    if(!id) { return false; }
    id.style.display = 'none'; //No I18N
}

function Show(divId) {
    var id = document.getElementById(divId);
    if(!id) { return false; }
    id.style.display = 'block'; //No I18N
}

function ShowAndHideBasedOnLS() {
    var argCount = arguments.length;
    var i = 0;
	var element;   // variable introduced for MSP/SCP
    if(argCount>0){
    for(i=1;i<argCount;i++){
        Store.setItem({
            key:arguments[i],
            value: "hide",//No I18N
            days: 30
        });
    }
    for(i=1;i<argCount;i++){
        if(!isMSPOrSCP) {
            // this block is always executed for SDP
        document.getElementById(arguments[i]).style.display = 'none'; //No I18N
        } else {
            // for MSP/SCP
            element = document.getElementById(arguments[i]);
            if(element != null ){
                element.style.display = 'none'; //No I18N
            }
        }
    }
    Store.setItem({
        key:arguments[0],
        value: "show",//No I18N
        days: 30
    });

    document.getElementById(arguments[0]).style.display = 'block'; //No I18N
    document.getElementById(arguments[0]).style.height='180px'; //No I18N
    document.getElementById(arguments[0]).style.overflow='auto'; //No I18N
    }
}

function ShowProductTab(divIdToShow) {
    var idToShow = document.getElementById(divIdToShow);
    if(divIdToShow=="productDetails") {
        var idToHide = document.getElementById("associatedVendors");
        if(idToHide != null) {
            idToHide.style.display = 'none'; //No I18N
        }
    }
    else if(divIdToShow=="associatedVendors") {
        var idToHide = document.getElementById("productDetails");
        if(idToHide != null) {
            idToHide.style.display = 'none'; //No I18N
        }
    }
    else if(divIdToShow=="vendorDetails") {
        var idToHide = document.getElementById("associatedProducts");
        if(idToHide != null) {
            idToHide.style.display = 'none'; //No I18N
        }
        if(document.getElementById("associateproductlistview") != null)
        {
           document.getElementById("associateproductlistview").style.display = 'none';
        }
        var servicesDetails = document.getElementById("associatedServices");
        if(servicesDetails != null) {
            servicesDetails.style.display = 'none'; //No I18N
        }
    }
    else if(divIdToShow=="associatedProducts") {
        var idToHide = document.getElementById("vendorDetails");
        if(idToHide != null) {
            idToHide.style.display = 'none'; //No I18N
        }
        if(document.getElementById("associateproductlistview") != null)
        {
           document.getElementById("associateproductlistview").style.display = '';
        }
        var servicesDetails = document.getElementById("associatedServices");
        if(servicesDetails != null) {
            servicesDetails.style.display = 'none'; //No I18N
        }
    }
    if(idToShow != null) {
        idToShow.style.display = ''; //No I18N
    }
}

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString(); //No I18N
    }
    else {
       var expires = ""; //No I18N
    }
    document.cookie = encodeURIComponent(name) + "=" + value + expires + "; path=/";    //No I18N
}

function readCookie(name) {
    var ca = document.cookie.split(';'); //No I18N
    var nameEQ = name + "=";
    for(var i=0; i < ca.length; i++) {
        var c = decodeURIComponent(ca[i]);
        while (c.charAt(0)==' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function MM_findObj(n, d) {
    var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
        // We are trying to find the document in this case. We send id's only as the first argument. So this check need not be done. Hence commenting
//      d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);
    }
    if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
    for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
    if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function confirmSubmit(confirmStr) {
    var agree=confirm(confirmStr);
    if(agree) {
        return true ;
    }
    else {
        return false ;
    }
}

function loadme() {
    var e=document.getElementsByTagName("div");
    var temp1 = document.getElementsByName("tabName")[0]; //No I18N
    var temp2 = document.getElementsByName("loggedUserID")[0]; //No I18N
    if(temp1 != null && temp2 != null) {
        var module = document.getElementsByName("tabName")[0].value; //No I18N
        var userID = document.getElementsByName("loggedUserID")[0].value; //No I18N
        for(var i=0;i<e.length;i++) {
            if(e[i].id!=null) {
                var bulletObj=MM_findObj("bullet"+e[i].id); //No I18N
                if(readCookie(userID+module+e[i].id)==e[i].id+"show" ) {
                    e[i].style.display = 'block'; //No I18N
                    if(bulletObj != null) {
                        bulletObj.src="/images/spacer.gif"; //No I18N
                        bulletObj.className="actionitems_expand"; //No I18N
                    }
                }
                if(readCookie(userID+module+e[i].id)==e[i].id+"hide" ) {
                    e[i].style.display = 'none'; //No I18N
                    if(bulletObj != null) {
                        bulletObj.src="/images/spacer.gif"; //No I18N
                        bulletObj.className="actionitems_collapse"; //No I18N
                    }
                }
            }
        }
    }
}
//
function loadmeadmin() {
    return true;
}

function toggleSwipe(gName, $this) {
    var curr = $this;
    var selRowObj = document.getElementById(gName);
    var bulletObj=MM_findObj("bullet" + gName); //No I18N
    if (selRowObj.style.display == 'none') {
        selRowObj.style.display = 'block'; //No I18N
        if (bulletObj != null) {
            bulletObj.className="cspr icon-sm folder-o"; //No I18N
            jQuery(curr).closest('.reportsHeading').addClass('active'); //No I18N
        }
    }
    else {
        selRowObj.style.display = 'none'; //No I18N
        if (bulletObj != null) {
            bulletObj.className="cspr icon-sm folder-c"; //No I18N
            jQuery(curr).closest('.reportsHeading').removeClass('active'); //No I18N
        }
    }
    setMinLeftPanelHeight();
}

function toggleSwipeNew(gName) {
    var selRowObj = document.getElementById(gName);
    var module = document.getElementsByName("tabName")[0].value; //No I18N
    var userID = document.getElementsByName("loggedUserID")[0].value; //No I18N
    var bulletObj=MM_findObj("bullet"+gName); //No I18N
    if (selRowObj.style.display == 'none') {
        selRowObj.style.display = 'block'; //No I18N
        bulletObj.src="/images/spacer.gif"; //No I18N
        bulletObj.className="leftnavitems_expand"; //No I18N
    }
    else if(selRowObj.style.display == 'block') {
        selRowObj.style.display = 'none'; //No I18N
        bulletObj.src="/images/spacer.gif"; //No I18N
        bulletObj.className="leftnavitems_collapse"; //No I18N
    }
    else if(selRowObj.style.display == '') {
        selRowObj.style.display = 'none'; //No I18N
        bulletObj.src="/images/spacer.gif"; //No I18N
        bulletObj.className="leftnavitems_collapse"; //No I18N
    }
    setMinLeftPanelHeight();
}

function toggleSwipe1(gName) {
    var selRowObj = document.getElementById(gName);
    var module = document.getElementsByName("tabName")[0].value; //No I18N
    var userID = document.getElementsByName("loggedUserID")[0].value; //No I18N
    if (selRowObj.style.display == 'none') {
        selRowObj.style.display = 'block'; //No I18N
    }
    else if(selRowObj.style.display == 'block') {
        selRowObj.style.display = 'none'; //No I18N
    }
    else if(selRowObj.style.display == '') {
        selRowObj.style.display = 'none'; //No I18N
    }
}

function swapLayer(showDiv,HideDiv) {
    var showdiv = document.getElementById(showDiv);
    var hidediv = document.getElementById(HideDiv);
    if(showdiv != null) {
        showdiv.style.display = 'block'; //No I18N
    }
    if(hidediv != null) {
        hidediv.style.display = 'none'; //No I18N
    }
}

function onClickSwapLayer(showDiv,HideDiv) {
    swapLayer(showDiv,HideDiv);
    var id1 = document.getElementById("success_message");
    if(id1!=null) {
        id1.style.display = 'none'; //No I18N
    }
    var id2 = document.getElementById("error_message");
    if(id2!=null) {
        id2.style.display = 'none'; //No I18N
    }
    jQuery("#filterViewMenu").removeClass('hide');
}

function swap2Layer(toShow,toHide) {
    var idToShow = document.getElementById(toShow);
    var idToHide = document.getElementById(toHide);
    idToShow.style.display = 'block'; //No I18N
    idToHide.style.display = 'none'; //No I18N
}

function swap2LayerC(showDiv,HideDiv) {
    var showdiv = document.getElementById(showDiv);
    var hidediv = document.getElementById(HideDiv);
    var module = document.getElementsByName("tabName")[0].value; //No I18N
    var userID = document.getElementsByName("loggedUserID")[0].value; //No I18N
    if(showdiv!=null && showdiv!='') {
        showdiv.style.display = 'block'; //No I18N
    }
    if(hidediv!=null && hidediv!='') {
        hidediv.style.display = 'none'; //No I18N
    }
    Store.setItem({
        key:userID+module+showDiv,
        value:showDiv+"show", //No I18N
        days:30
    });
    Store.setItem({
        key:userID+module+HideDiv,
        value:HideDiv+"hide", //No I18N
        days:30
    });
}
 function checkForWSContractUDFNumeric()
     {
             var num5,num6,num7,num8,num9,num10;
             from =document.getElementsByName("FROM")[0]; //No I18N
             var fromModule = document.getElementById("fromModule");
             if((from!=null && from.value=='INLINE') ) {
                     num1 = document.getElementsByName("UDF_LONG1")[0]; //No I18N
                     num2 = document.getElementsByName("UDF_LONG2")[0]; //No I18N
                     num3 = document.getElementsByName("UDF_LONG3")[0]; //No I18N
                     num4 = document.getElementsByName("UDF_LONG4")[0]; //No I18N
                     num5 = document.getElementsByName("UDF_LONG5")[0]; //No I18N
                     num6 = document.getElementsByName("UDF_LONG6")[0]; //No I18N
                     num7 = document.getElementsByName("UDF_LONG7")[0]; //No I18N
                     num8 = document.getElementsByName("UDF_LONG8")[0]; //No I18N
             }
             else {
                     num1 = document.getElementsByName("udfName1")[0]; //No I18N
                     num2 = document.getElementsByName("udfName2")[0]; //No I18N
                     num3 = document.getElementsByName("udfName11")[0]; //No I18N
                     num4 = document.getElementsByName("udfName12")[0]; //No I18N
                     num5 = document.getElementsByName("udfName37")[0]; //No I18N
                     num6 = document.getElementsByName("udfName38")[0]; //No I18N
                     num7 = document.getElementsByName("udfName39")[0]; //No I18N
                     num8 = document.getElementsByName("udfName40")[0]; //No I18N
                     num9 = document.getElementsByName("udfName41")[0]; //No I18N
                     num10 = document.getElementsByName("udfName42")[0]; //No I18N
             }
             if(num1!=null && num1.value!=null && num1.value!='') {
                     trimAll(num1);
                     if(!checklong(num1)) {
                             num1.focus();
                             return false;
                     }
             }
             if(num2!=null && num2.value!=null && num2.value!='') {
                     trimAll(num2);
                     if(!checklong(num2)) {
                             num2.focus();
                             return false;
                     }
             }
             if(num3!=null && num3.value!=null && num3.value!='') {
                     trimAll(num3);
                     if(!checklong(num3)) {
                             num3.focus();
                             return false;
                     }
             }
             if(num4!=null && num4.value!=null && num4.value!='') {
                     trimAll(num4);
                     if(!checklong(num4)) {
                             num4.focus();
                             return false;
                     }
             }
             if(num5!=null && num5.value!=null && num5.value!='') {
                     trimAll(num5);
                     if(!checklong(num5)) {
                             num5.focus();
                             return false;
                     }
             }
             if(num6!=null && num6.value!=null && num6.value!='') {
                     trimAll(num6);
                     if(!checklong(num6)) {
                             num6.focus();
                             return false;
                     }
             }
             if(num7!=null && num7.value!=null && num7.value!='') {
                     trimAll(num7);
                     if(!checklong(num7)) {
                             num7.focus();
                             return false;
                     }
             }
             if(num8!=null && num8.value!=null && num8.value!='') {
                     trimAll(num8);
                     if(!checklong(num8)) {
                             num8.focus();
                             return false;
                     }
             }
             if(num9!=null && num9.value!=null && num9.value!='') {
                     trimAll(num9);
                     if(!checklong(num9)) {
                             num9.focus();
                             return false;
                     }
             }
             if(num10!=null && num10.value!=null && num10.value!='') {
                     trimAll(num10);
                     if(!checklong(num10)) {
                             num10.focus();
                             return false;
                     }
             }
             return true;
     }

     //This method works only for requester and cannot able to validate for Workstation and Contract,
     //The form names are different.

function checkForUDFNumeric() {
    var numFields = $A(jQuery('input[name*=UDF_LONG]'));            //No I18N
    var nosNumFields = numFields.length;
    for(i=0; i< nosNumFields; i++) {
        var nFl = numFields[i];
        if(nFl != null && nFl.value !='') {
            trimAll(nFl);
            if(!checklong(nFl)) {
                nFl.value = "";
                nFl.focus();
                return false;
            }
        }
    }
    return true
}

/**
 *  Checks valid decimal data in Template addition
 *  @@str- input string, to bbe checked as valid number
 */

function isDecimal(str){
    if(isNaN(str))
    {
        return false;
    }
    return true;
}

function checkForAssetUDFNumeric()
{
    from =document.getElementsByName("FROM")[0]; //No I18N
    if(from!=null && from.value=='INLINE')
    {
        num1 = trimAll(document.getElementsByName("assetUDF_LONG1")[0]); //No I18N
        num2 = trimAll(document.getElementsByName("assetUDF_LONG2")[0]); //No I18N
        num3 = trimAll(document.getElementsByName("assetUDF_LONG3")[0]); //No I18N
        num4 = trimAll(document.getElementsByName("assetUDF_LONG4")[0]); //No I18N
    }
    else
    {
        num1 = document.getElementsByName("assetudfName1")[0]; //No I18N
        num2 = document.getElementsByName("assetudfName2")[0]; //No I18N
        num3 = document.getElementsByName("assetudfName11")[0]; //No I18N
        num4 = document.getElementsByName("assetudfName12")[0]; //No I18N
        num5 = document.getElementsByName("assetudfName37")[0]; //No I18N
        num6 = document.getElementsByName("assetudfName38")[0]; //No I18N
        num7 = document.getElementsByName("assetudfName39")[0]; //No I18N
        num8 = document.getElementsByName("assetudfName40")[0]; //No I18N
        num9 = document.getElementsByName("assetudfName41")[0]; //No I18N
        num10 = document.getElementsByName("assetudfName42")[0]; //No I18N
    }
    if(num1!=null && num1.value!=null && num1.value!='')
    {
        if(!checklong(num1))
        {
            num1.focus();
            return false;
        }
    }

    if(num2!=null && num2.value!=null && num2.value!='')
    {
        if(!checklong(num2))
        {
            num2.focus();
            return false;
        }
    }

    if(num3!=null && num3.value!=null && num3.value!='')
    {
        if(!checklong(num3))
        {
            num3.focus();
            return false;
        }
    }

    if(num4!=null && num4.value!=null && num4.value!='')
    {
        if(!checklong(num4))
        {
            num4.focus();
            return false;
        }
    }
    if(num5!=null && num5.value!=null && num5.value!='')
    {
        if(!checklong(num5))
        {
            num5.focus();
            return false;
        }
    }
    if(num6!=null && num6.value!=null && num6.value!='')
    {
        if(!checklong(num6))
        {
            num6.focus();
            return false;
        }
    }
    if(num7!=null && num7.value!=null && num7.value!='')
    {
        if(!checklong(num7))
        {
            num7.focus();
            return false;
        }
    }
    if(num8!=null && num8.value!=null && num8.value!='')
    {
        if(!checklong(num8))
        {
            num8.focus();
            return false;
        }
    }
    if(num9!=null && num9.value!=null && num9.value!='')
    {
        if(!checklong(num9))
        {
            num9.focus();
            return false;
        }
    }
    if(num10!=null && num10.value!=null && num10.value!='')
    {
        if(!checklong(num10))
        {
            num10.focus();
            return false;
        }
    }

    return true;
}

function validateIP(ip) {
    return isIpAddress(ip);
}

function notOperatedForLinux()
{
    alert(getMessageForKey("sdp.admin.setup.ad.notsupported"));
}

function disableForDemo() {
    alert(getMessageForKey("sdp.setup.orgdef.demoonline.jserror"));
    return false;
}

function selectRow(elementId, onclass, offclass) {
    var eid = document.getElementById(elementId);
    var e=document.getElementsByTagName("tr");
    for(var i=0;i<e.length;i++) {
        if(eid[i].id!=null) {
            var eObj=MM_findObj(eid[i].id);
            eObj.className= offclass;
        }
    }
    eid.className = onclass ;
}

function threadShowhide(gName) {
    var selRowObj = document.getElementById(gName);
    var bulletObj=MM_findObj("bullet"+gName); //No I18N
    if (selRowObj.style.display == 'none') {
        selRowObj.className = 'show'; //No I18N
        selRowObj.style.display = 'block'; //No I18N
        bulletObj.className="cspr circle-arrow-down icon-sm"; //No I18N
    }
    else if(selRowObj.style.display == 'block') {
        selRowObj.className = 'hide'; //No I18N
        selRowObj.style.display = 'none'; //No I18N
        bulletObj.className="cspr circle-arrow-up icon-sm tf-rot90"; //No I18N
    }
    else if(selRowObj.style.display == '') {
        selRowObj.className = 'show'; //No I18N
        selRowObj.style.display = 'block'; //No I18N
        bulletObj.className="cspr circle-arrow-down icon-sm"; //No I18N
    }
}

function addIt(picklist,tf) {
    if(trim(tf.value) == "") {
        alert(getMessageForKey("sdp.admin.udf.emptystringjerror"));
        return false;
    }
    var NI = picklist.options.length++;
    picklist.options[NI]= new Option(tf.value, tf.value, true, false);
    //To display tooltip for larger text
    picklist.options[NI].title = encodeHTMLAttribute(tf.value);
    jQuery(picklist.options[NI]).attr('rel','uitooltip');
    initTooltip('#udfTextType table'); //NO I18N
    tf.value = "";
    return true;
}

function deSelect(picklist) {
    if(picklist.selectedIndex>=0) {
        picklist.selectedIndex = -1;
    }
    else {
        if(document.getElementById("noselection")!=null)
        {
            alert(document.getElementById('noselection').innerHTML);
        }
    }
}

//Method added to remove multiple elements from pick list -- thangamani
//Used in CIType-->Additional Fields -->Pick List Field
function removeValuesFromList(listField)
{
// The checks specified for both the alerts will not at all be satisfied
    if ( listField.length == -1) {  // If the list is empty
        alert(document.getElementById('nopicklist').innerHTML);
    }
    else
    {
        var selected = listField.selectedIndex;
        if (selected == -1) {
            alert(document.getElementById('choosepicklist').innerHTML);
        } else {  // Build arrays with the text and values to remain
            var replaceTextArray = new Array(listField.length-1);
            var replaceValueArray = new Array(listField.length-1);
            for (var i = 0; i < listField.length; i++)
            {
                 opt = listField.options[i];
                 if ( opt.selected )
                 {
                   replaceTextArray[i] = listField.options[i].value;
                 }
            }
            for (var i = 0; i < listField.length; i++)
            {
                opt = listField.options[i];
                for (j = 0; j < replaceTextArray.length; j++)
                {
                    if(replaceTextArray[j] == listField.options[i].value)
                    {
                        listField.options[i].remove();
                    }
                }
            }
        } // Ends the check to make sure something was selected
    } // Ends the check for there being none in the list
}


function removeFromList(listField) {
    // The checks specified for both the alerts will not at all be satisfied
    if ( listField.length == -1) {  // If the list is empty
        alert(document.getElementById('nopicklist').innerHTML);
    } else {
        var selected = listField.selectedIndex;
        if (selected == -1) {
            //alert(document.getElementById('choosepicklist').innerHTML);
        } else {  // Build arrays with the text and values to remain
            var replaceTextArray = new Array(listField.length-1);
            var replaceValueArray = new Array(listField.length-1);
            for (var i = 0; i < listField.length; i++) {
                // Put everything except the selected one into the array
                if ( i < selected) { replaceTextArray[i] = listField.options[i].text; }
                if ( i > selected ) { replaceTextArray[i-1] = listField.options[i].text; }
                if ( i < selected) { replaceValueArray[i] = listField.options[i].value; }
                if ( i > selected ) { replaceValueArray[i-1] = listField.options[i].value; }
            }
            listField.length = replaceTextArray.length;  // Shorten the input list
            for (i = 0; i < replaceTextArray.length; i++) { // Put the array back into the list
                listField.options[i].value = replaceValueArray[i];
                listField.options[i].text = replaceTextArray[i];
            }
        } // Ends the check to make sure something was selected
    } // Ends the check for there being none in the list
}

function chooseType(toShow,toHide1,toHide2) {
    var idToShow = document.getElementById(toShow);
    var idToHide1 = document.getElementById(toHide1);
    var idToHide2 = document.getElementById(toHide2);

    idToShow.style.display = 'block'; //No I18N
    idToHide1.style.display = 'none'; //No I18N
    idToHide2.style.display = 'none'; //No I18N
    var module = document.getElementsByName("tabName")[0].value; //No I18N
}

/* This function is used for ember, it will be overwritten by ember (header_common.js) in SDP.
 * Here we are using getMessageForKey internally since we don't have definition for this function yet. */
function getTranslation(key,args){
   return getMessageForKey(key, args);
}

function showLeftNav(state) {
    var url="/jsp/getLeftNav.jsp?LeftNav=" + state; //No I18N
    stateChanged(state);
    if(parent["toBeShown"] != null) {
        parent.checkAndLoadTypes();
    }
    window.open(url, "SDPHeaderFrame"); //No I18N

    //Users Listview resize width
    var userDiv = jQ("#users_div"); //No I18N
    var additionalWidth = 0;
    if(userDiv.length == 0){
        userDiv = jQ("#assets_list_div"); //No I18N
        additionalWidth = 20;
    }
    var PaddingVal = jQuery("body").css("padding-left"); // No I18N
    if(jQuery( 'body' ).css( 'direction' ) == 'rtl') {
        PaddingVal = jQuery("body").css("padding-right"); // No I18N
    }
    listViewWidth = parseInt(PaddingVal) + jQuery('.cmdb-leftnav-wrap').width() + 20;
    if(userDiv.length > 0){
        var userDivWidth = jQuery(window).width() -  listViewWidth;
        userDiv.css("width",userDivWidth+"px"); //No I18N
    }
}

function stateChanged(status) {
    if(status == 'Open') {
        document.getElementById('LeftOpen').style.display = 'none'; //No I18N
        document.getElementById('Left-Section').style.display = 'block'; //No I18N
        if(jQuery('#topicsTreeViewDiv')[0]!==undefined)
        {
            jQuery('#topicsTreeViewDiv')[0].style.width = jQuery('#TopicsPanel').width();
        }
        setTimeout(function(){
            jQuery("#citype-search").select2('focus'); // No I18N
        },1);
    }
    else {
        document.getElementById('Left-Section').style.display = 'none'; //No I18N
        document.getElementById('LeftOpen').style.display = 'block'; //No I18N
    }
}

/**
* Invokes a progress indicator near the element specified by the source
* attribute. The text to be displayed can be passed using the key attribute.
* If not passed, this defaults to a string 'Processing. Please Wait', else the
* i18ned values will be fetched using the getMessageForKey method. If source is passed
* _____________________________
* |                           |
* --  -------------------------
*   \/
*
* @source   the element id near which the indicator should be displayed.
* @key      the key of the key to be displayed.
* @type progress | completed where for progress a processing image will
*       be dislpayed and for completed a tick image will be displayed.
* @image    the url of the image that should be displayed. The url should
*       be relative to the context.
*/
function invokeProgressIndicator(source, key, type, imageUrl, showCloseButton, x, y , dialogWidth , ImgClass, refreshOnClose) {
    var reqType = 'progress'; //No I18N
    var image = '/images/processing.gif'; //No I18N
    var cssClass = 'shadow_tip'; //No I18N

    var newClass = 'cspr icon-lg'; //No I18N
	  var className = 'warnbox'; //No I18N
    if(type != null && type == "completed") {
        reqType = 'completed'; //No I18N
        image = '/images/spacer.gif'; //No I18N
        newClass = 'cspr success1 icon-lg'; //No I18N
		    className = 'successbox'; //No I18N
    }
    if(refreshOnClose == null || refreshOnClose == undefined || refreshOnClose == "undefined")//No I18N
    {
        refreshOnClose = false;
    }

    if(key == null) {
        // The key to be shown is not passed. Kindly pass it.
        // TODO: This should be removed during the release
        //alert("The key to be shown is not passed. Kindly pass it.");
    }
    if(source == null) {
        cssClass = 'shadow_ct'; //No I18N
    }
    if(imageUrl != null) {
        if(imageUrl == "no") {
            image = null;
        }
        else {
            image = imageUrl;
        }
    }
    if(showCloseButton != null && (showCloseButton == "no" || showCloseButton == false || showCloseButton =="false")) {
        showCloseButton = false;
    }
    else {
        showCloseButton = true;
    }

    /*var outerTable = "<table width='100%' border=0 cellspacing=0 cellpadding=0 id=Actions_tool_tip><tr><td class=top_lt></td><td class=top_ct colspan=2></td><td valign='top' class='top_ct'>";
    if(showCloseButton == true) {
        outerTable = outerTable + "<button type='button' class='pos-rel'><img id=closeImg border=0 src='/images/spacer.gif' class='pos-abs exit1 right10' hspace=6 ></button>";
    }
    outerTable = outerTable + "</td><td class=top_rt></td></tr><tr><td width=18 class=center_lt></td><td class=actions_color colspan=3>";

    var innerTable = "<table border=0 cellspacing=0 cellpadding=0><tr><td>";
    if(image != null) {
        innerTable = innerTable.concat("<img id=ProImage src='");
        innerTable = innerTable.concat(image);
        innerTable = innerTable.concat("' hspace=6 vspace=6>");
    }
    innerTable = innerTable.concat("</td><td id='OperationStatus' class=tooltip_working>&nbsp;</td></tr></table>");
    outerTable = outerTable.concat(innerTable);
    outerTable = outerTable.concat("</td><td class=center_rt>&nbsp;</td></tr><tr><td class=bottom_lt></td><td width=35 class=");//No I18N
    outerTable = outerTable.concat(cssClass);
    outerTable = outerTable.concat("></td><td width='200' class=shadow_ct>&nbsp;</td><td class=shadow_lt></td><td class=bottom_rt></td></tr></table>");*/

     //Popup message has been modified with different style.
    var outerTable = "<table width='100%' id='Actions_tool_tip' cellspacing='3' cellpadding='2' border='0' align='center' class='"+className+"'> <tbody><tr> <td valign='top' width='35'>";
    if(image !=null){

        if (ImgClass != null || ImgClass != undefined){

            outerTable = outerTable +"<img id=ProImage vspace='0' hspace='4' src='/images/spacer.gif' class='"+ImgClass+"'>";
        }else{
            newClass = (image == "/images/invalidoperationicon.gif") ? "cspr failure1 icon-lg top0 ml5" : (image == "/images/processing_done.gif") ? "cspr success1 icon-lg top0 ml5" : (image == "/images/processing.gif") ? "" : newClass; //No I18N
			      className = (image == "/images/invalidoperationicon.gif") ? "failurebox" : (image == "/images/processing_done.gif") ? "successbox" : (image == "/images/processing.gif") ? "warnbox" : className; //No I18N
            image = (image == "/images/invalidoperationicon.gif") ? "/images/spacer.gif" : (image == "/images/processing_done.gif") ? "/images/spacer.gif" : image; //No I18N
            outerTable = outerTable +"<img id=ProImage class='"+newClass+"' src='"+image+"'>";
        }
    }
    outerTable = outerTable.concat("</td><td id='OperationStatus' class='infobxmsg'></td> <td width='28' valign='top' class='tr'>");

    if( showCloseButton ){

        outerTable = outerTable.concat("<button type='button' class='a-tag-btn-ovwrt' title='hide'><span class=\"cspr icon-xs pos-rel remove-col top2 ml5 mr5\"></span></a>");
    }

    outerTable = outerTable.concat("</td> </tr> </tbody></table>");     //NO I18N
	
  	if(image !=null && !(ImgClass != null || ImgClass != undefined)){
  		outerTable = jQuery(outerTable).removeClass('warnbox successbox failurebox').addClass(className);
  		outerTable = outerTable[0].outerHTML;
  	}		

    var direct = parent.sdp_user.DIRECTION;
    var diaCont = getMessageForKey(key);
    var contWidth = "300";
    if(diaCont.length > 100) {
        contWidth = 500;
    }
    if (dialogWidth != null && dialogWidth != "undefined" && dialogWidth != undefined){
            contWidth = dialogWidth+"";
    }
    if(source != null) {
        var holderObj = document.getElementById(source);
        var posX = findPosX(holderObj);
        var posY = findPosY(holderObj);
        var finalY = posY - 30 - window.pageYOffset; // fix for SD-77539
        var finalX = posX - 35;
        if(x != null) {
            finalX = x;
        }
        if(y != null) {
            finalY = y;
        }
        if(direct != null && direct == "RTL") {
            showDialog(outerTable,"position=relative,closeButton=no,width="+contWidth+",left=" + finalX + ",top=" + finalY); //No I18N
        }
        else {
            showDialog(outerTable,"position=absolute,closeButton=no,width="+contWidth+",left=" + finalX + ",top=" + finalY); //No I18N
        }
    }
    else {
        if(direct != null && direct == "RTL") {
            showDialog(outerTable,"position=absmiddle,closeButton=no,width="+contWidth); // No I18N
        }
        else {
            showDialog(outerTable,"position=absmiddle,closeButton=no,width="+contWidth); // No I18N
        }
    }
    if (showCloseButton) {
        jQuery("#Actions_tool_tip").find("button").off("click.close").on("click.close", function () {   //NO I18N
            closeDialog();
            return false;
        });
    }
    // The Key is not set to the td while constructing itself, so that any
    // problems due to ' and " could be avoided while assigning then.
    if(document.getElementById('OperationStatus') && key!=null){
        document.getElementById('OperationStatus').innerHTML= getMessageForKey(key);
    }
}

function getContentWidth(content){
    var width = (7*content.length)+50;
    if (width < 250){
        width = 250;
    } else if (width > 550){
        width = 550;
    }
    return width;
}

/**
* Closes the progress indicator, after checking whether the operation is a
* success or failure which should be indicated by the result parameter. The
* text to be displayed can be specified through the key parameter. The
* indicator will be closed after a time gap of 1sec.
*
* @key      The i18n key for the key.
* @result   true | false [true]
*/
function closeProgressIndicator(key, result) {
    if(result == null) {
        result = true;
    }
    if(key == null) {
        // The key should be passed. Should be removed later.
        //alert("No key is specified while closing the indicator");
    }
    if(document.getElementById('OperationStatus')) {
        document.getElementById('OperationStatus').innerHTML = getMessageForKey(key);
        if(result) {
            document.getElementById('ProImage').src = "/images/spacer.gif"; //No I18N
            document.getElementById('ProImage').className = "cspr success1 icon-lg top0 ml5"; //No I18N
            document.getElementById('Actions_tool_tip').className = "successbox"; //No I18N
            setTimeout(function() { parent.closeDialog(); },1000);
        }
        else {
            document.getElementById('ProImage').src = "/images/spacer.gif"; //No I18N
            document.getElementById('ProImage').className = "cspr failure1 icon-lg top0 ml5"; //No I18N
            document.getElementById('Actions_tool_tip').className = "failurebox"; //No I18N
        }
    }
}

function showSuccessMessageAndClose( source, value, timeout){
    invokeProgressIndicator(source,value,"completed"); //No I18N
    if(timeout == null) {
        setTimeout(function() { closeDialog(); }, 2000); //No I18N
    }
    else {
        setTimeout(function() { closeDialog(); }, timeout); //No I18N
    }
}

function showMessageAndClose( value, timeout){
    invokeProgressIndicator(null,value,"completed"); //No I18N
    if(timeout == null) {
        setTimeout(function() { closeDialog(); }, 2000); //No I18N
    }
    else {
        setTimeout(function() { closeDialog(); }, timeout); //No I18N
    }
}

function PRStatusChangeFailureMessage( message ){
            closeDialog();
        jQuery( "#pr_operation_status_message" ).text( message );
        jQuery( "#info_message" ).css("display","block");//NO I18N
}

function showFailureMessageAndClose(value, timeout){
    invokeProgressIndicator(null, value, "completed", '/images/invalidoperationicon.gif'); //No I18N
    if(timeout == null)
    {
        setTimeout(function() { closeDialog(); }, 2000); //No I18N
    }
    else
    {
        setTimeout(function() { closeDialog(); }, timeout); //No I18N
    }
}

//Added to show failure message and refresh the page on clode of this message
function showFailureMessageAndRefreshOnClose(value){
    invokeProgressIndicator(null, value, "completed", '/images/invalidoperationicon.gif', true, null, null, null, null, true); //No I18N
}

function showProgressAndClose(value, timeout){
    invokeProgressIndicator(null,value,"processing"); //No I18N
    if(timeout == null) {
        setTimeout(function() { closeDialog(); }, 2000); //No I18N
    }
    else {
        setTimeout(function() { closeDialog(); }, timeout); //No I18N
    }
}
//Added to show warning message.
function showWarningMessageAndClose(value,timeout)
{
    invokeProgressIndicator(null, value, "completed", '/images/warningicon.gif'); //No I18N
    if(timeout == null) {
        setTimeout(function() { closeDialog(); }, 2000); //No I18N
    }
    else {
        setTimeout(function() { closeDialog(); }, timeout); //No I18N
    }

}

var attachForm = null;
//newModel is true for request module to show attachments in div model
function constructAttachInfo(formobj, newModel)  {
    attachForm = formobj;
    var attach = null;

    if( formobj.attach != undefined )
    {
        attach = formobj.attach.options;
    }
    else
    {
        attach = document.getElementById('attach').options;
    }
    var attachPath = null;

    if( formobj.attPath != undefined )
    {
        attachPath = formobj.attPath.options;
    }
    else
    {
        attachPath = document.getElementById('attPath').options;
    }

    var attSize = null;

    if( formobj.attSize != undefined && formobj.attSize.options != undefined )
    {
        attSize = formobj.attSize.options;
    }
    else
    {
        attSize = document.getElementById('attSize').options;
    }

    var description = null;

    if( formobj.att_desc != undefined )
    {
        description = formobj.att_desc.options;
    }
    else
    {
        description = document.getElementById('att_desc').options;
    }
    var module = null;
    if(formobj.module != undefined)
    {
        module=formobj.module.value;
    }
    for( i=0; i<attach.length; i++ )
    {
        attach[i].selected = true;
    }
    for( i=0; i<attachPath.length; i++ )
    {
        attachPath[i].selected = true;
    }
    for( i=0; i<attSize.length; i++ )
    {
        attSize[i].selected = true;
    }
    for( i=0; i<description.length; i++ )
    {
        description[i].selected = true;
    }

    var showDesc = parent["Show_Att_Desc"]; //No I18N
    if(showDesc == null) {
        showDesc = true;
    }
	var showDownload=parent.Att_Download;  //No I18N
    if(showDownload == null) {
        showDownload = false;
    }
    var content = "";
    if(newModel == null || !newModel) {
        content = "<table cellspacing='0' width='100%' cellpadding='4' border='0' id='AttDet'><tr class='attachcolhdr text-color4'><td width='15'>&nbsp;</td><td>" + getMessageForKey("sdp.common.file") + "</td>";
        if(showDesc) {
            content = content.concat("<td>" + getMessageForKey("sdp.common.desc") + "</td>"); //No I18N
        }
        content = content.concat("<td width='40%'>" + getMessageForKey("sdp.common.attachment.size") + "</td></tr>");
    }
    var spanObj = document.getElementsByTagName("span");
    var attachNames = new Array();
    var removeTitle = getMessageForKey("common.remove");
    for(var cnt = 0; cnt < spanObj.length; cnt++) {
        var spanId = spanObj[cnt].id;
        if(spanId != null && spanId.indexOf("ATT_ID") >= 0) {
            if(spanObj[cnt].getAttribute("isdeleted") == "false") {
                fs = parseInt(spanObj[cnt].getAttribute("attsize"));
                var suf = "B"; //No I18N
                if(fs > 1024) {
                    fs = parseInt(fs / 1024);
                    suf = "KB"; //No I18N
                }
                if(fs > 1024) {
                    fs = parseInt(fs / 1024);
                    suf = "MB"; //No I18N
                }

            attachNames[cnt] = spanObj[cnt].getAttribute("attname");
            if(newModel == null || !newModel) {
                        content = content.concat("<tr id='whitebg' class='whitebgin'><td width='31' align='center' class='pl0 pr0' nowrap='nowrap'><button type='button' class='a-tag-btn-ovwrt' data-id='" + spanObj[cnt].getAttribute("attid") +  "' data-exist='true'><img src='/images/spacer.gif' border='0' class='scat-delete'></button></td>");
                //content = content.concat("<td><span dir='ltr'>" + spanObj[cnt].getAttribute("attname") + "</span></td>");//No I18N
				 content = content.concat("<td>" );
                if(showDownload)
                {
                    content =content.concat("<a href=/servlet/HdFileDownloadServlet?KEY="+encodeURIComponent(spanObj[cnt].getAttribute("attkey"))+"&module="+module+"&ID="+spanObj[cnt].getAttribute("attid")+"&delete=false>");     //No i118n
                }
                content = content.concat("<span dir='ltr'>" + encodeHTML(spanObj[cnt].getAttribute("attname")) + "</span></td>");       //No I18N

                		if(showDesc) {
                                    content = content.concat("<td>" + encodeHTML(spanObj[cnt].innerText) + "</td>");
                		}
               			 content = content.concat("<td>" + fs + " " + suf + "</td></tr>");
			}
			else{
				content = content.concat("<div class='ath-fle'>" + spanObj[cnt].getAttribute("attname") + "<span class='ml10'>("+fs+" "+suf+")</span><button class='ml10 mr5 btn btn-link btn-xs flat' type='button' title='"+removeTitle+"' rel='uitip' data-id='" + spanObj[cnt].getAttribute("attid") +  "' data-exist='true'><span class='cspr icon-xs close2 top-1' aria-hidden='true'></span><span class='sr-only'>Close</span></button></div>");
			}

            }
        }
    }

    if( attSize != undefined )
    {
        for(var cnt = 0; cnt < attSize.length; cnt++) {
            var fs = attSize[cnt].value;
            var suf = "B"; //No I18N
            if(fs > 1024) {
                fs = parseInt(fs / 1024);
                suf = "KB"; //No I18N
            }
            if(fs > 1024) {
                fs = parseInt(fs / 1024);
                suf = "MB";//No I18N
            }

            if(attach[cnt].value != "" && jQuery.inArray(attach[cnt].value, attachNames) == -1) {
        if(newModel == null || !newModel) {
                    content = content.concat("<tr id='whitebg' class='whitebgin'>");
                    content = content.concat("<td width='31' id=att_del_"+cnt+" align='center' class='pl0 pr0' nowrap='nowrap'><button type='button' class='a-tag-btn-ovwrt' data-id='" + cnt + "'><img src='/images/spacer.gif' border='0' class='scat-delete'></button></td>");
                content = content.concat("<td id=att_name_"+cnt+">" + encodeHTML(attach[cnt].value) + "</td>");

                    if(showDesc) {
                        //cwf start
                    content = content.concat("<td id=att_desc_"+cnt+">" + encodeHTML(checkNullValue(formobj,cnt)) + "</td>");//NO I18N
                              //cwf end
                    }
                    content = content.concat("<td id=att_size_"+cnt+">" + fs + " " + suf + "</td></tr>");
        }
        else{
            content = content.concat("<div class='ath-fle' id=att_name_"+cnt+" > "+ encodeHTML(attach[cnt].value)+"<span class='ml10'>("+fs+" "+suf+")</span><button class='ml10 mr5 btn btn-link btn-xs flat' type='button' title='"+removeTitle+"' rel='uitip' data-id='" + cnt +  "'><span class='cspr icon-xs close2 top-1' aria-hidden='true'></span><span class='sr-only'>Close</span></button></div>");
        }
            }
        }
    }
    if(newModel == null || !newModel) {
        content = content.concat("</table>");
    }

    var att_div = jQuery('#displayAttachments');
    att_div.html(content);

    att_div.off('click.delete').on('click.delete', 'button', function(){    //No I18N
        var attId = jQuery(this).data('id').toString();    //No I18N
        var exist = jQuery(this).data('exist') ? "Existing" : null; //No I18N
        deleteFile(attId, exist, newModel);
    });

    //For new model, adding class hide displayAttachments if all attachments are deleted
    if(newModel != null && newModel) {
        var div = att_div.parent('div')[0];
    div = jQuery(div);
    if(att_div.children('div').length > 0) {
        div.removeClass('hide');
    }
    else if(!div.hasClass('hide')){
        div.addClass('hide');
    }
    }

}

function checkNullValue(formobj, cnt) {

    if(document.getElementById('att_desc') != null){
    var att_desc = document.getElementById('att_desc').options;

    if( formobj.att_desc != undefined )
    {
        att_desc = formobj.att_desc.options;
    }
    else
    {
        att_desc = document.getElementById('att_desc').options;
    }
    if( att_desc.length > 0 &&  att_desc[cnt] != null ) {
        return att_desc[cnt].value;
    }
    }
    else
    {
        return "";//NO I18N
    }
    return "";
}


function deleteFile(fileIndex, existing, newModel) {
    if( document.getElementById("deletealert") != null ) {
        if(confirm(document.getElementById("deletealert").innerHTML)) {
            if(existing == null ) {
                if( attachForm.attach != undefined )
                {
                    attachForm.attach.options[fileIndex] = null;
                    attachForm.attPath.options[fileIndex] = null;
                    attachForm.attSize.options[fileIndex] = null;
                    attachForm.att_desc.options[fileIndex] = null;
                    if(isMSPOrSCP){
                        if( attachForm.attToDisplay != undefined){
                            attachForm.attToDisplay.options[fileIndex] = null;
                        }
                        if(attachForm.attIsGlobal != undefined){
                            attachForm.attIsGlobal.options[fileIndex] = null;
                        }
                    }
                }
                else
                {
                    document.getElementById('attach').options[fileIndex] = null;
                    document.getElementById('attPath').options[fileIndex] = null;
                    document.getElementById('attSize').options[fileIndex] = null;
                    document.getElementById('att_desc').options[fileIndex] = null;
                    if(isMSPOrSCP){
                        if(document.getElementById('attToDisplay') != null){
                            document.getElementById('attToDisplay').options[fileIndex] = null;
                        }
                        if(document.getElementById('attIsGlobal') != null){
                            document.getElementById('attIsGlobal').options[fileIndex] = null;
                        }
                    }
                }
            }
            else {
                document.getElementById("ATT_ID_" + fileIndex).setAttribute("isdeleted", true); //No I18N
                if( attachForm.toBeDeleted != undefined )
                {
                    attachForm.toBeDeleted.options[attachForm.toBeDeleted.options.length] = new Option(fileIndex, fileIndex, true, false);
                    attachForm.toBeDeleted.options[attachForm.toBeDeleted.options.length-1].selected = true;
                }
                else
                {
                    var toBeDeletedObj = document.getElementById('toBeDeleted');
                    toBeDeletedObj.options[toBeDeletedObj.options.length] = new Option(fileIndex, fileIndex, true, false);
                    toBeDeletedObj.options[toBeDeletedObj.options.length-1].selected = true;
                }
            }
            constructAttachInfo(attachForm,newModel);
    }
    }
    else {
        if(existing == null ) {
            if( attachForm.attach != undefined )
            {
                attachForm.attach.options[fileIndex] = null;
                attachForm.attPath.options[fileIndex] = null;
                attachForm.attSize.options[fileIndex] = null;
                attachForm.att_desc.options[fileIndex] = null;
                if(isMSPOrSCP){
                    if( attachForm.attToDisplay != undefined){
                        attachForm.attToDisplay.options[fileIndex] = null;
                    }
                    if(attachForm.attIsGlobal != undefined){
                        attachForm.attIsGlobal.options[fileIndex] = null;
                    }
                }
            }
            else
            {
                document.getElementById('attach').options[fileIndex] = null;
                document.getElementById('attPath').options[fileIndex] = null;
                document.getElementById('attSize').options[fileIndex] = null;
                document.getElementById('att_desc').options[fileIndex] = null;
                if(isMSPOrSCP){
                    if(document.getElementById('attToDisplay') != null){
                        document.getElementById('attToDisplay').options[fileIndex] = null;
                    }
                    if(document.getElementById('attIsGlobal') != null){
                        document.getElementById('attIsGlobal').options[fileIndex] = null;
                    }
                }
            }
        }
        else {
            document.getElementById("ATT_ID_" + fileIndex).setAttribute("isdeleted", true); //No I18N
            if( attachForm.toBeDeleted != undefined )
            {
                attachForm.toBeDeleted.options[attachForm.toBeDeleted.options.length] = new Option(fileIndex, fileIndex, true, false);
                attachForm.toBeDeleted.options[attachForm.toBeDeleted.options.length-1].selected = true;
            }
            else
            {
                var toBeDeletedObj = document.getElementById('toBeDeleted');
                toBeDeletedObj.options[toBeDeletedObj.options.length] = new Option(fileIndex, fileIndex, true, false);
                toBeDeletedObj.options[toBeDeletedObj.options.length-1].selected = true;
            }
        }
        constructAttachInfo(attachForm,newModel);
}
}

function invokeFileAttachment(module,modId) {
    var url = "/common/FileAttachment.jsp?type=new&module="+module; //No I18N
    if(isMSPOrSCP && document.getElementById("fromAccTab")!=null){
     url = "/common/MSPFileAttachment.jsp?type=new&module="+module; //No I18N
	}
    if(modId)
    {
        url = url+"&modId="+modId; //No I18N
    }

    showURLInDialog(url + "&" + (new Date()).getTime(), "closeButton=no,position=relative"); //No I18N
}

function createMCSearchRow(referenceId, uniqueId) {
var mainRowTr = document.getElementById(referenceId + "_MainRow");
    // null check added because in some places these methods can be called without the main view being invoked.
    if(mainRowTr != null) {
        var mainRowTds = mainRowTr.getElementsByTagName("th");
        var mainLastCell = mainRowTds[mainRowTds.length - 1];

        var searchRowTr = document.getElementById(referenceId + "_SearchRow");
        if(searchRowTr != null) {
            searchRowTds = searchRowTr.getElementsByTagName("th");
            searchLastCell = searchRowTds[searchRowTds.length - 1];
        }
        var doc = document.getElementById("ACT_BTN_" + uniqueId);
        var elements = doc.getElementsByTagName("div");
        var mainCellData  = "<table width='100%' valign='top' cellspacing=0 cellpadding=0><tr><td nowrap>" + mainLastCell.innerHTML + "</td>";
        for(var i=0; i< elements.length; i++) {
            if(elements[i].id == "Div1" && searchLastCell != null) {
                searchLastCell.innerHTML = "<table width='100%'><tr><td width='90%'>" + searchLastCell.innerHTML + "</td><td align='right'>" + elements[i].innerHTML + "</td></tr></table>";
            }
            else {
                mainCellData = mainCellData + "<td align='right' valign='top' width='5px' nowrap>" + elements[i].innerHTML + "</td>";
            }
        }
        mainLastCell.innerHTML = mainCellData + "</tr></table>"
    }
}
function loadMCNavigator(uniqueId, rowCount) {
    try{
        // null check added because in some places these methods can be called without the main view being invoked.

    if( PORTALID != undefined && PORTALID != null && PORTALID > 0 )
    {
    	var existingParam = getState(uniqueId, "_D_RP");// No I18N

 	    var reqParams = ( (existingParam != null && (existingParam.toQueryParams('&').PORTALID==null)) ?  existingParam + "&PORTALID=" + PORTALID : (existingParam != null && (existingParam.toQueryParams('&').PORTALID!=null))?existingParam:"PORTALID="+ PORTALID );// No I18N

    	parent.addToOnLoadScripts( "updateState" , window, uniqueId, '_D_RP', reqParams); // No I18N
    }

    if( jQuery('div:visible[id^="'+uniqueId+'_HD_"]').length > 0 )
    {
    	uniqueId = jQuery('div:visible[id^="'+uniqueId+'_HD_"]').attr("id").split("_CT")[0];
    }

        if(document.getElementById(uniqueId + '_Navig') != null) {

	tempuniqueId = uniqueId;

	if( uniqueId.lastIndexOf("_HD_") > 0 )
	{
		uniqueId = uniqueId.substring( 0 , uniqueId.lastIndexOf("_HD_") );//NO I18N
	}

            if(parent.document.getElementById(uniqueId + '_NAV') == null){
                document.getElementById(uniqueId + '_NAV').innerHTML = document.getElementById(tempuniqueId + '_Navig').innerHTML;
                if(document.getElementById(uniqueId + '_NAV_BOT') != null) {
                    document.getElementById(uniqueId + '_NAV_BOT').innerHTML = document.getElementById(tempuniqueId + '_Navig').innerHTML;
                }
            }
            else {
                parent.document.getElementById(uniqueId + '_NAV').innerHTML = document.getElementById(tempuniqueId + '_Navig').innerHTML;
                if(parent.document.getElementById(uniqueId + '_NAV_BOT') != null) {
                    parent.document.getElementById(uniqueId + '_NAV_BOT').innerHTML = document.getElementById(tempuniqueId + '_Navig').innerHTML;
                }
                if(parent.document.getElementById(uniqueId + '_BOT') != null) {
                    if(rowCount > 15) {
                        parent.document.getElementById(uniqueId + '_BOT').className = "";
                    }
                    else {
                        parent.document.getElementById(uniqueId + '_BOT').className = "hide"; //No I18N
                    }
                }
            }
        }
        $sdEventListener(jQuery("#"+uniqueId + '_NAV'));
    }
    catch(e){}
}

function getSelectedCheckBoxes(form) {
    var selectedVals = new Array();
    var elems = form.elements;
    for(var i = 0; i < elems.length; i++) {
        if(elems[i].type == "checkbox" && elems[i].name == "checkbox") {
            if(elems[i].checked) {
                selectedVals[selectedVals.length] = elems[i].value;
            }
        }
    }
    return selectedVals;
}

/*
* Function for clearing the form text element(s) value
* @param formName - form name for the text field to be cleared
* @author Murugesn K
*/
function clearFormValues( formName ) {
    var form_length = document.forms.length;
    if( form_length > 0 ) {
        try {
            for( i=0; i<form_length; i++ ) {
                var formNameNew;
             if(document.forms[i].attributes.name!= undefined) {
                 formNameNew = document.forms[i].attributes.name.nodeValue;
             } else {
                 formNameNew = document.forms[i].name;
             }
             if( formNameNew == formName ) {
                    var elements = document.forms[i].elements;
                    var length = elements.length;
                    var element_type;
                    var element_name;
                    for( j=0; j<length; j++ ) {
                        element_type = elements[j].type;
                        if( element_type == 'text' || element_type == 'textarea') {
                            elements[j].value = "";
                            if(elements[j].getAttribute("default") != null) {
                                elements[j].value = elements[j].getAttribute("default");
                            }
                        }
                        else if(elements[j].nodeName == "SELECT" && elements[j].options.length > 0){
                            if(elements[j].hasClassName("form-select2")){
                              jQuery(elements[j]).select2("val",elements[j].options[0].value);
                            }
                            else{
                              elements[j].value = elements[j].options[0].value;
                            }
                            if(elements[j].getAttribute("default") != null) {
                                elements[j].value = elements[j].getAttribute("default");
                            }
                        }
                        else if(elements[j].nodeName == "INPUT") {
                            if(elements[j].checked) { elements[j].checked = false; }    // checkbox and radio buttons
                        }
                    }
                }
            }
        }
        catch(e) {
            alert( "[ " + formName + "] : " + e.message); //No I18N
        }
    }
    else {
        alert('clearFormValues() : No form(s) found!!!');
    }
}



var requestOne;
var ajax_request_id;
/*
* Function for calling ajax request
* @param url - request URL
* @param params - request parameter(s)
* @param requestID - to identify the ajax request
* author Murugesan K
*/
function callAjaxRequest(url, params, requestID) {
    ajax_request_id = requestID;
    requestOne = getXMLHttpRequest();
    if(requestOne)
    {
        try
        {
            requestOne.open("POST", url, true); //No I18N
            requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8"); //No I18N
            requestOne.setRequestHeader("Content-length", params.length); //No I18N
            requestOne.onreadystatechange = updateAjaxRequest;
            requestOne.send(params);
        }
        catch(e)
        {
            alert("Error while sending the request : " + e.message);
        }
    }
}

function callCustomAjaxRequest(url, params, callSuccess, callFailure, requestID, appendAccId,isSync) {
    if(isMSP && appendAccId!=false) {
        if(document.getElementById("__persistentAccountId__select")) {
            params = params + "&persistentAccountId="+document.getElementById("__persistentAccountId__select").value;   // No i18n
        }
    }
    	if(!params.includes(getCSRFParamName()))
    	{
		params = params + "&" + getCSRFParamName() + "=" + getCSRFParamValue();
	}
    var async=true;
    if(isSync=="true"){
        async=false;
    }
    ajax_request_id = requestID;
    requestOne = getXMLHttpRequest();
    if(requestOne)
    {
        try
        {
            requestOne.open("POST", url, async); //No I18N
            requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8"); //No I18N
            requestOne.setRequestHeader("Content-length", params.length); //No I18N
            requestOne.onreadystatechange = function() {updateCustomAjaxRequest(callSuccess, callFailure); };
            requestOne.send(params);
        }
        catch(e)
        {
            alert("Error while sending the request : " + e.message);//NO I18n
        }
    }
}

function callCustomAjaxRequestForGET(url, params, callSuccess, callFailure, requestID, appendAccId,isSync) {
    if(isMSP && appendAccId!=false) {
        if(document.getElementById("__persistentAccountId__select")) {
        	if(params != "") {
        		params = params + "&persistentAccountId="+document.getElementById("__persistentAccountId__select").value;   // No i18n
        	}else{
        		params = "persistentAccountId="+document.getElementById("__persistentAccountId__select").value;   // No i18n
        	}

        }
    }
    var async=true;
    if(isSync=="true"){
        async=false;
    }
    ajax_request_id = requestID;
    requestOne = getXMLHttpRequest();
    if(requestOne)
    {
        try
        {
        	if(params != "") {// MSP modified code for issue fix.
        		if(url.indexOf("?") > 0){
        			url = url+"&"+params;
        		}else{
        			url = url+"?"+params;
        		}
        	} //For Get operation we need to send the params in url itself.
	        params = "";
            requestOne.open("GET", url, async); //No I18N
            requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8"); //No I18N
            requestOne.setRequestHeader("Content-length", params.length); //No I18N
            requestOne.onreadystatechange = function() {updateCustomAjaxRequest(callSuccess, callFailure); };
            requestOne.send(params);
        }
        catch(e)
        {
            alert("Error while sending the request : " + e.message);//NO I18n
        }
    }
}


/*
* Function for calling sjax request [ Synchronous AJAX ]
* @param url - request URL
* @param params - request parameter(s)
* author Murugesan K
*/
var srequestOne;
function callSjaxRequest(url, params) {
    srequestOne = getXMLHttpRequest();
    if(srequestOne)
    {
        try
        {
            srequestOne.open("POST", url, false); //No I18N
            srequestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8"); //No I18N
            srequestOne.setRequestHeader("Content-length", params.length); //No I18N
            srequestOne.send(params);
            return srequestOne;
        }
        catch(e)
        {
            alert("Error while sending the request : " + e.message);
        }
    }
}
function callSjaxRequestForGET(url, params) {
    srequestOne = getXMLHttpRequest();
    if(srequestOne)
    {
        try
        {
            if(params != "") { url = url+"?"+params;} //For Get operation we need to send the params in url itself
            params = "";
            srequestOne.open("GET", url, false); //No I18N
            srequestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8"); //No I18N
            srequestOne.setRequestHeader("Content-length", params.length); //No I18N
            srequestOne.send(params);
            return srequestOne;
        }
        catch(e)
        {
            alert("Error while sending the request : " + e.message);//No I18N
        }
    }
}


/*
* Function for handling ajax response
* This function will invoke the ajaxRequestOnSuccess function if the ajax request success else it will
* invoke the ajaxRequestOnFailure
* User(s) have to implement these functions and it will give the two parameter(s) one will contain respose object
* and other will contain you ajax request identification number
* @author Murugesan K
*/
function updateAjaxRequest() {
    // only if req shows "loaded"
    try {
        if (requestOne.readyState == 4) {
            if (requestOne.status == 200) {
                ajaxRequestOnSuccess(requestOne, ajax_request_id);
            }
            else {
                ajaxRequestOnFailure(requestOne, ajax_request_id);
            }
        }
    }
    catch(e) {
        //Commenting the below alert to stop alerts in home page - 38802
        //alert("Error while fetching ajax response : " + e.message);
    }
}

function updateCustomAjaxRequest( callSuccess, callFailure )
{
    // only if req shows "loaded"
    try
    {
        if (requestOne.readyState == 4)
        {
            if (requestOne.status == 200)
            {
                if( callSuccess != undefined )
                {
                   callSuccess(requestOne, ajax_request_id);
                }
            }
            else
            {
                if( callFailure != undefined )
                {
                   callFailure(requestOne, ajax_request_id);
                }
            }
        }
    }
    catch(e)
    {
        //Commenting the below alert to stop alerts in home page - 38802
        //alert("Error while fetching ajax response : " + e.message);//NO I18n
    }
}

/*
* Function used for validating input fields
* @param control - Object of the input element
* @param comparevalue - value to be compared with the input element
* @param datatype - data type of the input element
* @param errorMsg - error message to be thrown in case of invalid data in input field
* @author Murugesan K
* @sample isValidData(document.sampleform.egelement,'','string', 'Invalid input')
*
*/
function isValidData(control, comparevalue, datatype, errorMsg) {
    var isvalid = true;
    if(trim(control.value) == comparevalue || trim(control.value) == null) {
        showErrorMessage(control, errorMsg);
        return false;
    }
    if( datatype == 'integer' ) {
        isvalid = isInteger(trim(control.value));
    }
    else if( datatype == 'pinteger' ) {
        isvalid = isPositiveInteger(trim(control.value));
    }
    else if( datatype == 'double' ) {
        isvalid = isDouble(trim(control.value));
    }
    if( isvalid == false ) {
        showErrorMessage(control, errorMsg);
    }
    return isvalid;
}
/*
* Function used to display the error message and set the focus to error element
* @param control - Element object
* @param errorMsg - message to be displayed
*/
function showErrorMessage(control, errorMsg) {
    alert(errorMsg);
    try
    {
        control.focus();
    }
    catch(e1)
    {
    }
    if( control.type !='select-one' && control.type !='select-multiple' && control.id != undefined && control.id != '' ) {
        try
        {
            new Effect.ScrollTo(control.id);
            control.selecr();
        }
        catch(e2)
        {
        }
    }
}

/*
* Function for constructing parameter name & value(s) for the requested form
* @param formName - request parameter(s) to be constructed for the form name
* @return this will return the chain of param name & value pair
*/
function constructParameters( formName ) {
    var params = "";
    try {
        var elements_list = formName.elements;
        var length = elements_list.length;
        var element_type;
        for( i=0; i<length; i++ ) {
            element_type = elements_list[i].type;
        if( element_type == 'textarea' || element_type == 'text' || element_type == 'select-one' || element_type == 'password' || (element_type == 'hidden' && (elements_list[i].name.indexOf("UDF_DATE") >= 0 || elements_list[i].name.indexOf('rowId') >= 0 || elements_list[i].name.indexOf('licenseId_') >= 0 ) || elements_list[i].name.indexOf("searchedLicenseId") >= 0 )) {

                params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].value); //No I18N
            }
            else if( element_type == 'checkbox' && elements_list[i].checked ) {
                params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].value); //No I18N
            }
            else if( element_type == 'select-multiple' ) {
                var size = elements_list[i].options.length;
                for( j=0 ;j<size; j++ ) {
                    if( elements_list[i].options[j].selected) {
                        params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].options[j].value); //No I18N
                    }
                }
            }
            else if( element_type == 'radio' )
            {
                if(elements_list[i].checked)
                {
                    params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].value); //No I18N
                }
            }

        }
    }
    catch(e) {
        alert( "Error while constructing request parameter : " + e.message );
    }
    return params;
}

function deleteAttachment(link,id) {
    if(confirm(document.getElementById("deletealert").innerHTML)) {
        document.getElementById(id).parentNode.removeChild(document.getElementById(id));
        sdpAjax({
            url:link,
            method:"POST", //NO I18N
            success:function(res){
                if(document.getElementById("attachmentList") != null && document.getElementById("attachmentList").rows != null && document.getElementById("attachmentList").rows.length == 0) {
                    document.getElementById("attachRow").parentNode.removeChild(document.getElementById("attachRow"));
                }
                else if (document.getElementById("attachments") != null && document.getElementById("attachments").rows != null && document.getElementById("attachments").rows.length == 0){
                    document.getElementById("attachRow").parentNode.removeChild(document.getElementById("attachRow"));
                }
            }
        })
    }
}

startList = function() {
    if(document.getElementById('startListMenuItems')!=null)
    {
        menubar1actions();
    }
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
window.onload=startList;
function validateAttach()
{
    var str=document.form1.filePath.value;
    if((str=="")||(str.charAt(str.length-1)=="/"))
    {
        return false;
    }
    else
    {
        document.form1.filename.value=str;
    }
    return true;
}



function validateConfForm(formObj) {
    var name = formObj.NAME.value;
    if(trimAll(name) == "") {
        alert(getMessageForKey("sdp.jserror.name"));
        formObj.NAME.value="";
        formObj.NAME.focus();
        return false;
    }
    formObj.NAME.value=trimAll(name);
    return true;
}

function showToolTip(toolTipText, elementID)
{
  //var tooltip =  "<div id=\"msg"+elementID+"\" style=\"position: absolute; left: 333px; top: 389px; opacity: 0.985062;\"><table cellspacing=\"0\" class=\"completeMessage\"><tbody><tr><td class=\"caTopLeft\"/><td colspan=\"2\" class=\"caTopCenter\"/><td class=\"caTopRight\"/></tr><tr><td class=\"caMiddleLeft\"/><td class=\"caMessage\"> "+toolTipText+" </td><td class=\"caClose\"><button id=\"normalbubbletooltip_close\" class=\"caCloseButton\"/></td><td class=\"caMiddleRight\"/></tr><tr><td class=\"caBottomLeft\"/><td colspan=\"2\" class=\"caBottomCenter\"></td><td class=\"caBottomRight\"/></tr></tbody></table></div>";
  //showDialog(tooltip, 'position=relative, closeButton=no, closeOnEscKey=yes, width=250, srcElement='+elementID);

  invokeProgressIndicator(elementID, toolTipText, 'completed', 'no', 'no'); //No I18N
}

function showWarningMessage(value){
    invokeProgressIndicator(null, value, "completed", '/images/warningicon.gif'); //No I18N
}
function showMenuAsDialogForDropLinks1(holder, source) {
    document.onmousemove = capturePos;

    var reqX = findPosX(document.getElementById(holder));
    var reqY = findPosY(document.getElementById(holder));
    var offsetHeight = document.getElementById(holder).offsetHeight;
    var offsetWidth = document.getElementById(holder).offsetWidth;
    var scrollingElement = document.scrollingElement || document.documentElement;
    var scrollTop = scrollingElement.scrollTop

    var leftX = 0;

    if( document.getElementById('tablemenus') != undefined )
    {
        if( document.getElementById('tablemenus').width != undefined )
        {
            leftX = document.getElementById('tablemenus').width;
        }
    }
    if( leftX == 0 )
    {
            showDialog(document.getElementById(source).innerHTML,'position=absolute,closeButton=no,left=' + (reqX-document.body.scrollLeft) + ',top=' + (reqY+offsetHeight-scrollTop));//No I18N
    }
    else
    {
        showDialog(document.getElementById(source).innerHTML,'position=absolute,closeButton=no,left=' + (reqX + offsetWidth - document.body.scrollLeft - leftX) + ',top=' + (reqY+ offsetHeight-scrollTop));//No I18N
    }
    setTimeout(function() { closeMenusDialog(source) }, 1000);
}

/**
      * ---NOTE--- This method is attached to the JavaScript Array global object
      * This method will remove the elements of the array from which it is called
      * given an array of elelments to be removed
      * Useful for set minus operation
      */
     Array.prototype.remove = function(array) {
         if(array && array.length) {
             var i=0;
             while( i < array.length) {
                 var j=0;
                 while( j < this.length) {
                     if(this[j] == array[i]) {
                         this.splice(j, 1);
                     }
                     else {
                         j++;
                     }
                 }
                 i++;
             }
         }
         return this;
     }

function showRowCount(isNewUI){
    parent.invokeProgressIndicator(null,document.getElementById("loadingMsg").value,'progress');//No i18n
    var url = "/servlet/AJaxServlet?action=getWOListViewCount";//NO i18N
    var myAjax = new Ajax.Request(url, {method: 'post',parameters: '',onComplete: function(resp, jsonObj){
            var objs = document.getElementsByName("showCount");//No i18n
            for(var i=0;i<objs.length;i++){
                if(isNewUI){
                    objs[i].innerHTML = encodeHTML(resp.responseText);
                }else{
                    objs[i].innerHTML ="<b>&nbsp;&nbsp;" + getMessageForKey("sdp.common.navigation.of") + "&nbsp;"+encodeHTML(resp.responseText)+"&nbsp;&nbsp;</b>|";//No i18n
                }
            }
            closeDialog();}//No i18n
            });
}

/* jQuery Multi-Level Dropdown Plug-in */
/**
 * MultiDropMenu- Plugin/Function name
 * animSpeed    - dropdown animation speed in milliseconds
 */




if(window.jQuery != null) {
(function($){
    $.fn.extend({
        QuickActionsMenu: function(options){
            var defaults = {
                animSpeed: 400,
                selector : 'li:first',//No I18N
                list : '#ActionsList',//No I18N
                activeClass: null,
                currentClass: null,
                setCurrentObj: false,
                isPropagate: false
            };
            var options = $.extend(defaults, options);
            return this.each(function(){

                var o = options;
                var obj = $(this);
                var actionsEle = null;
                //jQuery('ul', obj).css({display: "none"});//No I18N
                var quickframer = $('iframe', obj);
                var quickselector = $(o.selector, obj);
                var actionslist = $(o.list);
                if(o.setCurrentObj==true){
                    actionsEle = obj;
                }else{
                    actionsEle = actionslist;
                }
                quickselector.on('click', function(){
                        if ((actionslist).css("display") == "none" || actionslist.attr('tohide')) {
                        if(o.activeClass != null)
                        {
                            obj.removeClass(o.currentclass);
                            obj.addClass(o.activeClass);
                        }
                        quickframer.css({visibility: "visible",display:"block"}); //No I18N
                        actionslist.show(o.animSpeed,function(){
                        quickframer.width(($(this).width())+2).height(($(this).height())+2); //No I18N
                        //cwf start
                        if(!o.isPropagate)
                        {
                            actionslist.on('click', // No I18N
                            function()
                            {
                                jQuery(this).hide();
                            });
                        }
                        });
                        //cwf end
                actionslist.css('display','block');// No I18N
                        }
                        else {
                        quickframer.css({visibility: "hidden",display:"none"}); //No I18N
                        actionslist.hide(o.animSpeed);
                        if(o.activeClass != null)
                        {
                            obj.removeClass(o.activeClass);
                            obj.addClass(o.currentClass);
                        }
                        }
                });
                actionsEle.on('mouseleave', function(e) { // No I18N
            quickframer.css({visibility: "hidden",display:"none"}); //No I18N
            if((e.target.tagName != 'SELECT') && (parent.jQuery('#_CALDIALOG_LAYER').css('visibility') != 'visible'))
            {
                jQuery(actionslist).hide();

            }
            if(o.activeClass != null)
            {
                obj.removeClass(o.activeClass);
                obj.addClass(o.currentClass);
            }
        });
            });
        },
        ActionsComboMenu: function(options){
            var defaults = {
                animSpeed: 400,
                list: null,
                currentClass: null,
                activeClass: null,
                //cwf start
                isHover: false,
                parentObj:null,
                menuparent:null,
                selectorObj:null
                //cwf end

            };
            var options = $.extend(defaults, options);
            return this.each(function(){
                var o =options;
                var obj = $(this);
                if(o.list!=null)
                {
                    //cwf start
                    if(o.isHover==false)
                    {
                        obj.on('mouseenter', function(){
                                jQuery(this).attr('class',o.activeClass).find(o.list).show(o.animSpeed); //No I18N
                            }).on('mouseleave', function(){
                                jQuery(this).attr('class',o.currentClass).find(o.list).hide(); //No I18N
                        });
                    }
                    else
                    {
                        obj.on('click', function(e){
                                if(jQuery(o.menuparent).find(o.list).is(":visible")){
                                jQuery(o.menuparent).find(o.list).hide();
                                jQuery('.'+o.activeClass).attr('class',o.currentClass);
                                }
                                jQuery(this).attr('class',o.activeClass).find(o.list).show(o.animSpeed); //No I18N

                        e.stopPropagation();
                        jQuery('body').on('click', function(e){
                            if(e.target !== jQuery(o.parentobj) )
                            {
                                obj.attr('class',o.currentClass);
                                jQuery(this).find(o.list).hide(); //No I18N
                            }

                            });
                        });
                    }
                    jQuery(o.list).on('click', function(e){
                        e.stopPropagation();
                        jQuery(this).hide(); //No I18N
                        jQuery('.'+o.activeClass).attr('class',o.currentClass);
                    });
                    //cwf end
                    /*obj.hover(function(){

                            jQuery(this).removeClass(o.currentClass).addClass(o.activeClass);
                            jQuery(this).find(o.list).show(o.animSpeed); //No I18N
                        },function(){
                            jQuery(this).removeClass(o.activeClass).addClass(o.currentClass);
                            jQuery(this).find(o.list).hide(); //No I18N
                    });
                    jQuery(o.list).click(function(){

                        jQuery(this).hide(100); //No I18N
                    });*/
                }
                else
                {
                    jQuery('ul', obj).css({display: "none"});//No I18N
                    //var framer = $('iframe', obj);
                    var menuparent = jQuery('li.first', obj);
                    menuparent.on('mouseenter', function(){
                            jQuery(this).find('ul:first').css({visibility: "visible",display: "none"}).show(o.animSpeed); //No I18N
                        }).on('mouseleave', function(){
                            jQuery(this).find('ul:first').css({visibility: "hidden"}).hide(); //No I18N
                             jQuery('#submenu-item').hide(); //No I18N

                    });
                    jQuery('#submenu-item').hide(); //No I18N
                    jQuery('#submenu').off('click').on('click',function(){ // NO I18N
                        jQuery('#submenu-item').toggle();//NO I18N
                    });
                }
            });
        },
        MultiDropMenu: function(options){
            var defaults = {
                animSpeed: 400,
                classSelector: '.clickitem', //No I18N
                activeClass: null,
                currentClass: null
            };
            var options = $.extend(defaults, options);
            return this.each(function(){
                var o =options;
                var obj = $(this);
                $('ul', obj).css({display: "none"});
                var items = $('li', obj);
                var mainanchor = $(o.classSelector, obj);
                mainanchor.on('click', function(){
                    jQuery(obj).addClass(o.activeClass);
                        jQuery("li:first", obj).children('ul:first').show(); //No I18N
                        jQuery("li li", obj).on('mouseenter', function(){//No I18N
                                jQuery(this).find('ul:first').show(); //No I18N
                            }).on('mouseleave', function(){
                                jQuery(this).find('ul:first').hide(); //No I18N
                        });
                });
                jQuery("li:first", obj).on('mouseleave', function(){//No I18N
                    jQuery(obj).removeClass(o.activeClass);
                    jQuery(this).find('ul').hide(); //No I18N
                    jQuery("li", obj).on('mouseenter', function(){//No I18N
                        }).on('mouseleave', function(){
                    });
                });
            });
        },
        MultiDropMenu2: function(options){
            var defaults = {
                animSpeed: 100,
                classSelector: '.clickitem', //No I18N
                list : null,//No I18N
                activeClass: null,
                currentClass: null
            };
            var options = $.extend(defaults, options);
            return this.each(function(){
                var o =options;
                var obj = $(this);
                $('ul', obj).css({display: "none"});
                var items = $('li', obj);
                var mainanchor = $(o.classSelector, obj);
                var actionslist = $(o.list);
                mainanchor.on('click', function(){
                        actionslist.show();
                        jQuery(obj).addClass(o.activeClass);
                        jQuery("li:first", obj).find('ul:first').css({visibility: "visible",display: "none"}).show(o.animSpeed); //No I18N
                        jQuery("li li", obj).on('mouseenter', function(){//No I18N
                                jQuery(this).find('ul:first').css({visibility: "visible",display: "none"}).show(o.animSpeed); //No I18N
                            }).on('mouseleave', function(){
                                jQuery(this).find('ul:first').css({visibility: "hidden"}).hide(); //No I18N
                        });
                });
                jQuery("li:first", obj).on('mouseleave', function(){//No I18N
                    actionslist.hide();
                    jQuery(obj).removeClass(o.activeClass);
                    jQuery(this).find('ul').css({visibility: "hidden"}).hide(); //No I18N
                    jQuery("li", obj).on('mouseenter', function(){//No I18N
                        }).on('mouseleave', function(){
                    });
                });
            });
        },
        SingleDropDown: function(options){
            var defaults = {
                animSpeed: 400,
                classSelector : '.moredrop', //No I18N
                containerShow : '.assetDBMenus', //No I18N
                selectorMethod: null
            };
            var options = $.extend(defaults, options);
            return this.each(function(){
                var o               = options,
                    obj             = $(this),
                    framer          = $('iframe', obj),
                    containerElem   = $(o.containerShow, obj),
                    mainanchor      = null;
                //console.log(o.selectorMethod);
                if(o.selectorMethod != null){
                    mainanchor = o.selectorMethod(o.classSelector, obj);
                }else{
                    mainanchor = $(o.classSelector, obj);
                }
                mainanchor.on('click', function(){
                            containerElem.show(400); // No I18N
                            jQuery(this).parent().on('mouseenter', function(){
                            }).on('mouseleave', function(){
                            containerElem.hide(); //No I18N
                            });
                });
            });
        },
        LanguageMenu: function(options){
            var defaults = {
                animSpeed: 300,
                classSelector: '.dropmenu' //No I18N
            };
            var options = $.extend(defaults, options);
            return this.each(function(){
                var o =options;
                var obj = $(this);
                $('ul ul', obj).css({display: "none"});
                var items = $('li', obj);
                var framer = $('iframe', obj);
                var mainanchor = $(o.classSelector, obj);
                mainanchor.on('mouseenter mouseleave', function(){
                        framer.css({visibility: "visible",display:"block"}); //No I18N
                        jQuery("li:first", obj).children('ul:first').css({visibility: "visible"}).show(400); // No I18N
                        jQuery("li li", obj).on('mouseenter', function(){
                            jQuery(this).find('ul:first').css({visibility: "visible"}).show(400); //No I18N
                         }).on('mouseleave', function(){
                             jQuery(this).find('ul:first').css({visibility: "hidden"}).hide(); //No I18N
                        });
                });
                jQuery("li:first", obj).on('mouseleave', function(){//No I18N
                    framer.css({visibility: "hidden",display: "none"}).hide(); //No I18N
                    jQuery(this).find('ul').css({visibility: "hidden"}).hide(); //No I18N
                    jQuery("li", obj).on('mouseenter', function(){//No I18N
                        }).on('mouseleave', function(){
                    });
                });
            });
        }
    });
})(jQuery);
}

function loadAPIContent(curEle, sourceUrl) {
        var linkcount = jQuery('#api-navlist a').length;
        jQuery("#api_content_div").load(sourceUrl);
        for(var i=1; i<=linkcount; i++) {
            if(document.getElementById("lnk" + i) != undefined){
            document.getElementById("lnk" + i).className='api-navlist-link';
            }
        }
        document.getElementById("lnk" + curEle).className='api-navlist-link-active';
}

function changeNotificationSelection(notType, linkedParentsToOpen, linkedChildsToClose) {
    if(document.getElementById(notType) != null && document.getElementById(notType).checked) {
        document.getElementById(notType).checked = false;
        if(linkedChildsToClose != null) {
            for(var i=0; i<linkedChildsToClose.length; i++) {
                document.getElementById(linkedChildsToClose[i]).checked = false;
            }
        }
    }
    else {
        document.getElementById(notType).checked = true;
        document.getElementById(notType+"_IMG").src = "/images/checked_yes.gif";// No I18N
        if(linkedParentsToOpen != null) {
            for(var i=0; i<linkedParentsToOpen.length; i++) {
                document.getElementById(linkedParentsToOpen[i]).checked = true;
            }
        }
    }
}

function changeCheckboxSelection(notType, linkedParentsToOpen, linkedChildsToClose) {
    if(document.getElementById(notType) != null) {
        if(document.getElementById(notType).checked) {
            if(linkedParentsToOpen != null) {
                for(var i=0; i<linkedParentsToOpen.length; i++) {
                    document.getElementById(linkedParentsToOpen[i]).checked = true;
                }
            }
        }
        else {
            if(linkedChildsToClose != null) {
                for(var i=0; i<linkedChildsToClose.length; i++) {
                    document.getElementById(linkedChildsToClose[i]).checked = false;
                }
            }
        }
    }
}

//The below method is used for site icon changes. Used in sitecommon.jsp,siteajax.jsp and sitelistview.jsp.
function refView()
{
    if(parent['callBackJSVar']  != null){
        setTimeout(function() { 
            //parent.callBackJSVar(); 
            //Right now, there is no other way to fix this issue. We need to change the implementation in the JSP files
            jQuery.globalEval(parent.callBackJSVar);
        }, 100);
    }
}

// disable save button when click to avoid multiple requests
function disableButtonClick(buttonObj)
{
    parent.jQuery(buttonObj).prop("disabled",true); //No I18N
}

function escapeForUDF(value) {
    if(value != null) {
        value = value.replace(/&/g, "&amp;");//No I18N
        value = value.replace(/</g, "&lt;");//No I18N
        value = value.replace(/>/g, "&gt;");//No I18N
        value = value.replace(/"/g, "&#34;");//No I18N
    }
    return value;
}
//cwf start
//showOperationStatus moved from OperationStatus.jspf
function showOperationalStatus(messageString, imageClass, imageSrc, styleClass, width, timeout){

                var holder = parent.jQuery('#alert-holder');

                var B = parent.document.body;
                var D = parent.document.documentElement;
                var dheight;
                var dwidth;

                /*if(parent.document.height !== undefined) {
                        dheight = parent.document.height // For webkit browsers
                } else {
                        dheight = Math.max( B.scrollHeight, B.offsetHeight,D.clientHeight, D.scrollHeight, D.offsetHeight );
                }

                if(parent.document.width !== undefined) {
                        dwidth = parent.document.width // For webkit browsers
                } else {
                        dwidth = Math.max( B.scrollWidth, B.offsetWidth,D.clientWidth, D.scrollWidth, D.offsetWidth );
                }
                */

                dheight = window.innerHeight || parent.document.body.clientHeight;

                dwidth = window.innerWidth || parent.document.body.clientWidth;

                parent.jQuery('#alert-container').find('#operationstatus-table').attr('class', '');
                parent.jQuery('#alert-container').find('#statusimg').attr('class','');
                parent.jQuery('#alert-container').find('#statusimg').attr('src','images/spacer.gif');
                parent.jQuery('#alert-container').find('#infobboxmsg').empty();
                parent.jQuery('#alert-holder').empty();

                parent.jQuery('#operationstatus-table').attr('width',width);
                parent.jQuery('#operationstatus-table').attr('class',styleClass);

                if(imageClass != null && imageClass != undefined){      parent.jQuery('#statusimg').attr('class',imageClass);           }
        if(imageSrc != null && imageSrc != undefined){          parent.jQuery('#statusimg').attr('src',imageSrc);               }

                parent.jQuery('#infobboxmsg').html(messageString);
                parent.jQuery('#infobboxmsg').addClass('wrapcontent');

                var leftPosition = (parseInt(dwidth/2)-80)+jQuery(document).find('body').scrollLeft();
                var topPosition = (parseInt(dheight/2)-60)+jQuery(document).find('body').scrollTop();

                holder.css({ position:'absolute', left: leftPosition+'px', top: topPosition+'px' });//No I18N

                holder.html(parent.jQuery('#alert-container').html()).stop(true, true).show();  //NO I18N
                holder.html(parent.jQuery('#alert-container').html()).stop(true, true); //NO I18N
                //parent.setTimeout( function(){        holder.stop(true, true).hide(); } , timeout );

                if(timeout != null && timeout != undefined){            holder.fadeOut(timeout);                }
        }

/* changewf ends */
/*CHANGE API START*/
//This method is used to load the change api content in admin api->change section
function loadChangeAPIContent(curEle, sourceUrl) {
   var element=document.getElementById(curEle);
   var element1=null;

 //To display the corresponding div and to change the color of tab
    if(curEle=="changeapi_sampleFormats")
    {
        var displayContent=document.getElementById('Change_sampleInputFormats');
        displayContent.style.display='block';
        var nonDisplayContent=document.getElementById('Change_supportedFields');
        nonDisplayContent.style.display='none';
        element1=document.getElementById("changeapi_supportedFields");
    }
    else
    {
         var displayContent=document.getElementById('Change_supportedFields');
         displayContent.style.display='block';
         var nonDisplayContent=document.getElementById('Change_sampleInputFormats');
        nonDisplayContent.style.display='none';
        element1=document.getElementById("changeapi_sampleFormats");
    }

    element.className='subtabon';
    element1.className='subtaboff';


}
/* CHANGE API END */



function applyselect2hint( message )
{
    jQuery(document).find("div.select2Hint").remove();

    var $div = jQuery("<div class='select2Hint'>" + message + "</div>");    //No I18N
    $div.css({ "background": "#e2e2e2", "border-top": "solid 1px #ddd", "padding": "6px 0 8px", "text-align": "center", "font-size": "12px" }); //No I18N
    jQuery(document).find("div.select2-drop").append($div); //No I18N
}

/*
This function receives params as an argument.

params is a JSON object.



Required properties: elementId     ---- to which element this select2 has to be applied
                                        Note: The element Object must not be select type (i.e., input type= "select")

                     placeHolder   ---- The string to display if no item is selected, has to pass here.

                     selectedData  ---- default data or selected data which will be applied at the time of loading select2.
                                        single select2 data has to be like this ::: {"id" : "1", "text" : "jagadeesh"}
                                        multi select2 data has to be like this ::: [{"id" : "1", "text" : "xxxx"},{"id" : "2", "text" : "yyyy"}]

                     params        ---- All the params needed to send to server, must be given here as a JsonObject, module is mandatory parameter to be passed
                                        module ---- this will differentiate the results (i.e user data if module is user, technician data if module in technician)
                                                    Please make sure whether what you require is present in Select2Servlet.java or not. if it is not present please add the module name and send the data from there.
                                        dropdownLength ---- this is the default dropdown length of select2 dropdown. so, that if total number of results comes under defaultdropdown length,
                                                            select2 without ajax call be applied. Else, for each every keypress (difference between keypress > 200ms) ajax call will go to fetch data.
                                        defaultDropdownData ---- this is the default Dropdown data which will shown first in the dropdown (for this data id is given as 0 or -1 like that) this data won't be in database.
                                                                 This is an optional parameter.
Optional properties :

isAllowClear            ---- It will help in creating close button in selected Object so that on clicking that it will delete the selected object.
                             True, to enable. False, todisable. By default it will be false

isMultiple              ---- This will create multiselect or singleselect. True has to be given to create multiselect and false for singleselect.

closeOnSelect           ---- on selecting an option from dropdown, the dropdown will close as default, for making it not to close false has to be applied here.(Mostly useful for multiselect)
                             default - true (means dropdown will close on selecting a value)
                             false(not to close the dropdown on selecting an option)

minimumInputLength      ---- after typing how many characters ajax call has to be sent to fetch data. the length has to be given (Ex: 0 or 1 or 2 like that)

formatSearching         ---- this is the text which will be displayed at the time of searching (fetching data) (Ex:: Searching...)
                             Default String is (Searching...).
                             for other text this has to be added as parameter and i18n string has to be applied

noMatchesFormatString   ---- It means the text which will be displayed by select2 in dropdown list (can't be selected by user) when there is no match available for that searchString.
                             Default String is ( No Matches Found...)
                             for other text, this has to be added as parameter and i18n string has to be applied.

noOtherValuesFound      ---- It means the text which has to be displayed when all values are selected from the dropdown.
                             Default String is (No Records Found...)
                             for other text, this has to be added as parameter and i18n string has to be applied.
isChangeEventRequired   ----It means while applying data at the time of applying select2, do we need to trigger onchange event?
                            Default it is true.

example ( params = '{"module":"department","dropdownLength":"25", "defaultDropdownData" : { "id" : 1, "text" : "defaultString"}}';//NO I18N
updateSelect2Dropdown({ elementId:'department', // no i18n
placeHolder:getMessageForKey('text'),
selectedData: <%=selectedDepartmentData%>,
params: params,

closeOnSelect : false,
minimumInputLength : 3,
formatSearching : i18n string,
noMatchesFormatString : i18n string,
noOtherValuesFound : i18n string,
isAllowClear : false,
isMultiple : false,
isOnChangeEventRequired : false

});

Method moved to ui-components.min.js file for using the select2 servlet component for both ember and non ember pages

function updateSelect2Dropdown(params)

*/
function $Class(target, val)
{
    if (val !== undefined) {
        $ID(target).className = val;
    } else {
        return $ID(target).className;
    }
}
/* This method is to be used only in ChangeDetails page as of now. TODO : Need to move new dialog's html to a common file.
 param should contain a title string, an array 'type' with elements 'success'/'failure' and another array 'text' with the text.
 For eg :   parram =
                {
                    title:"...........",
                    messages:
                    [
                        {
                            type:"success",            //      success/failure
                            text:"............."
                        },
                        {
                            type:"failure",
                            text:"........."
                        }
                    ]
                }
*/
function showNewDialog(param,pwidth,phight)
{

    var messages = param.messages;
    if(param.title)
    {
        jQuery("#newDialogTitle").find("div").html(param.title);
    }

    var li = null,type,text;
    jQuery("#newDialogList").html("");
    for(var i = 0 ; i < messages.length ; i++)
    {
        li = null;
        type = messages[i].type;
        text = messages[i].text;
        if(type == "success")
        {
            li = document.getElementById("newDialogListSuccess");
        }
        else if (type == "failure")
        {
            li = document.getElementById("newDialogListFailure");
        }
        if(li != null)
        {
            li = jQuery.clone(li);
            jQuery(li).find("div").html(e_html(text));
            jQuery("#newDialogList").append(li);
        }
    }
    showDialog(document.getElementById("newDialog").innerHTML, "closeButton=no, position=center,modal=yes,width="+pwidth+",height="+phight+",closeOnBodyClick=no");    //No I18N
}

function supportPlaceholder(){
}
supportPlaceholder();


// Textarea, Input maxlength check
jQuery('textarea[maxlength], input[maxlength]').on('keyup', function(){
    var text = jQuery(this).val();
    var limit = jQuery(this).attr('maxlength');
    if(text.length > limit){ jQuery(this).val(text.substr(0, limit)); }
});


/**
 *
 * MICKEY2LITE:copied from old mickey client source
 * To show layers in different transition effects
 */

MC_Effect = function() {
};

MC_Effect.init = function(params) {
    if (typeof params != "undefined") {
        this.type = (typeof params.type != "undefined") ? params.type : "boxIn( { } )";
        this.speed = (typeof params.speed != "undefined") ? params.speed : 10;//No I18N

        this.layer = document.getElementById(params.layerId);
        this.layerId = params.layerId;
        this.layerLeft = params.layerLeft;
        this.layerTop = params.layerTop;

        if (typeof params.layerContent == "undefined" || params.layerContent == null || params.layerContent == ""){//No I18N
                         this.layerContent = this.layer.innerHTML;
        }else {this.layerContent = params.layerContent};

        if (typeof params.layerWidth == "undefined" || params.layerWidth == null || params.layerWidth == "") {//No I18N
            this.layerWidth = this.layer.offsetWidth;
        }else{ this.layerWidth = params.layerWidth};

        if (typeof params.layerHeight == "undefined" || params.layerHeight == null || params.layerHeight == "") {//No I18N
            this.layerHeight = this.layer.offsetHeight;
        }else {this.layerHeight = params.layerHeight};
    } else {
        this.speed = 10;
    }
};

var xPoint, yPoint;
MC_Effect.drawPath = function(x1, y1, x2, y2) {
    xPoint = new Array();
    yPoint = new Array();

    var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    var dx = (x2 - x1) / dist;
    var dy = (y2 - y1) / dist;

    for (var i = 0; i < dist; i++) {
        xPoint[i] = x1 += dx;
        yPoint[i] = y1 += dy;
    }
};

var wArray, hArray;
MC_Effect.buildSize = function() {
    wArray = new Array();
    hArray = new Array();
    var dimRatio = this.layerHeight / this.layerWidth;

    for (var i = 0, j = 0; i <= this.layerWidth; i += 1, j++) {
        wArray[j] = i;
        hArray[j] = i * dimRatio;
    }
};

var pitStops = 0, dim = 0, movCnt = 0, dimCnt = 0, effectIntvl;
MC_Effect.display = function() {
    var midX = this.layerLeft + parseInt(this.layerWidth / 2);
    var midY = this.layerTop + parseInt(this.layerHeight / 2);

    this.layer.style.left = midX + "px"
    this.layer.style.top = midY + "px"
    this.layer.style.width = this.layer.style.height = "0px";
    this.layer.style.overflow = "hidden";

    this.drawPath(this.layerLeft, this.layerTop, midX, midY);

    movCnt = xPoint.length - 1;
    pitStops = (xPoint.length > 5) ? (xPoint.length - 1) / 5 : 1;

    this.buildSize();
    dim = wArray.length / (movCnt / pitStops);
    let _self = this;
    effectIntvl = setInterval(function(){MC_Effect[_self.type]();}, this.speed);
};

MC_Effect.boxIn = function() {
    if (movCnt > 0) {
        MC_Effect.layer.style.left = xPoint[movCnt] + "px";
        MC_Effect.layer.style.top = yPoint[movCnt] + "px";

        if (wArray[dimCnt]) {
            MC_Effect.layer.style.width = wArray[dimCnt] + "px";
            MC_Effect.layer.style.height = hArray[dimCnt] + "px";
        }

        movCnt -= Math.round(pitStops);
        dimCnt += Math.round(dim);;
    } else {
        MC_Effect.layer.style.left = MC_Effect.layerLeft + "px";
        MC_Effect.layer.style.top = MC_Effect.layerTop + "px";
        MC_Effect.layer.style.width = MC_Effect.layerWidth + "px";
        MC_Effect.layer.style.height = MC_Effect.layerHeight + "px";
        MC_Effect.layer.style.overflow = "";

        pitStops = dim = movCnt = dimCnt = 0;
        window.clearInterval(effectIntvl);
    }
};

//to convert normal select elements to select2 - no ajax
//Param can be either an element or jquery selector
function convertElementToSelect2(jqueryElement){
    jQuery(jqueryElement).select2({
        formatSearching: function() { return getMessageForKey('ae.common.search.text'); }, //No I18N
        formatNoMatches: function() { return getMessageForKey('ae.select2.no.message'); } //No I18N
    })
}

/*Below method is to encode the html data in Ember and Non Ember pages */
function e_html(val){
  if(typeof Ember == "undefined") {
      val = encodeHTML(val);
  }
  else {
      val = Ember.Handlebars.Utils.escapeExpression(val);
  }
  return val;
}

/* This method is used in several places in ae. Previously this method was in mickeyclient/components/Utils.js. Now it is removed there.
*/
function getXMLHttpRequest(){
    if (typeof XMLHttpRequest!='undefined') {
        return new XMLHttpRequest();
    }
    var xmlhttp=false;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");//No i18N
    }
    catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");//No i18N
        }
        catch (E) {
            xmlhttp = false;
        }
    }
    return xmlhttp;
}
function getPortalViewName(viewName)
{
	if( PORTALID !=undefined && PORTALID > 1 && viewName != null && viewName.indexOf("_HD_") == -1 )
	{
		viewName = viewName + "_HD_" + PORTALID;//NO I18N
	}

	return viewName;
}


function delete_role(id)
{
    if(window.confirm(document.getElementById('confirmroledelete').innerHTML)==true)
    {
        var deleteRoleForm=createForm("/RoleDef.do","","POST","deleteRole");// No I18N
        document.body.appendChild(deleteRoleForm);
        addHiddenInput(deleteRoleForm,"mode","delete");// No I18N
        addHiddenInput(deleteRoleForm,"id",id);// No I18N
    addHiddenInput(deleteRoleForm,getCSRFParamName(),getCSRFParamValue());
        deleteRoleForm.submit();
    }
}

var mickeyListView = {
    exportView: function(options) {
        var stateDataForView = stateData[options.view_name];
        if (stateDataForView !== undefined && options.file_type !== undefined) {
            document.location = '/servlet/AJaxServlet?action=exportMickeyList&file_type=' + options.file_type + '&stateData=' + encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(stateDataForView) : JSON.stringify(stateDataForView) );
        }
    }
};

/**To get CSRF param and Value**/
function getCSRFParamValue()
{
   return getCSRFCookie(getCSRFCookieName());
}
function getCSRFCookieName()
{
     return "sdpcsrfcookie";//NO I18N
}
function getCSRFParamName()
{
    return "sdpcsrfparam";//NO I18N
}
/**Security Team code https://intranet.wiki.zoho.com/securitydev/CSRF.html#CSRF_Prevention**/
function getCSRFCookie(name)
{
    var cookie_name = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++)
    {
        var c = ca[i].trim();
        if (c.indexOf(cookie_name) === 0)
        {
            return c.substring(cookie_name.length, c.length);
        }
    }
    return "";
}
/**To get CSRF param and Value**/

/*function checkEmailIdsForValidityInSDP(toAddressFormEle, ccAddressFormEle){
    var toAddress = toAddressFormEle.value;
    var ccAddress = ccAddressFormEle != null? ccAddressFormEle.value : "";
    var result;
    jQuery.ajax(
        {
            url: '/servlet/SDAjaxServlet', //No I18N
            dataType: "json", //No I18N
            data: {"action": "getUnblockedEmailIds", "module": "checkEmailValidator", "toAddress": toAddress, "ccAddress": ccAddress}, //No I18N
            type: "post", //No I18N
            async:false,
            success: function(response)
            {
                var isEmailListUpdated = response.isUpdated;
                if(isEmailListUpdated){
                    toAddressFormEle.value = response.toAddress;
                    if(ccAddressFormEle != null){
                        ccAddressFormEle.value = response.ccAddress;
                    }
                    var filteredAddress = [response.filteredAddress]; //Defined as array since getMessageForKey method expects array as second argument. When the string is provided directly, it is processed as a char array.
                    alert(getMessageForKey('sdp.email.outgoing.filteredemailmsg', filteredAddress));
                    result = false;
                }
                else{
                    result = true;
                }
            }
        }
    );
    return result;
}*/

/**
 * Scrolls to the attachments section of the description / conversation and highlights the attachments
 */

function scrollToAttachments(element,container) {
    container = container || "html, body"; // NO I18N
    var attachEle = jQuery(element).find('.attachdrop');
    if(attachEle.length === 0 || attachEle.parents(".atp-container:first").length === 0) {
        return;
    }
    var scrollTop =0;
    if(jQuery(container).parents("#_DIALOG_LAYER").length){
        scrollTop = attachEle.closest('.conv-attachments').offset().top +  jQuery(container).scrollTop() - jQuery("#_DIALOG_LAYER").offset().top - 100; //NO I18N
    } else{
        scrollTop = attachEle.parents(".atp-container:first").offset().top - 100;//NO I18N
    }
    
    var el_bg_color = attachEle.css('background-color');    //NO I18N
	var	darklight_color = isDark() ? "#41483A" : "#fff6ea";  //NO I18N
    jQuery(container).animate({
        scrollTop: scrollTop
    }, 300, function(){
        attachEle.animate({
            backgroundColor: darklight_color
        }, 500, function(){
            attachEle.animate({
                backgroundColor: el_bg_color
            }, 200);
        });
    });
}

/** New multi assests input field with full view */
var multiasset = {
    toggleSelect2: function(el) {
        var t = jQuery(el),
            bt = t.find('span.cspr'),
            selContainMulti = bt.closest('[data-id=cus-sel]').find('.select2-container-multi'), //No I18N
            selChoice = bt.closest('[data-id=cus-sel]').find('.select2-container-multi .select2-choices'); //No I18N
        if(selChoice[0].scrollHeight > selChoice.height()) {
            selInner('auto'); //No I18N
        } else {
            selInner('60px'); //No I18N
        }
        function selInner(ht) {
            if(bt.hasClass('circle-arrow-down')){ //No I18N
                bt.closest('[data-id=cus-sel]').find('ul.select2-choices').css('cssText', 'height:'+ht+' !important; top:0; position:absolute; width:100%; z-index: 9;'); //No I18N
                bt.addClass('circle-arrow-up').removeClass('circle-arrow-down'); //No I18N
                t.prop('title', getMessageForKey('sdp.helpdesk.common.select2.showless')); //No I18N
            } else {
                bt.closest('[data-id=cus-sel]').removeClass('active').find('ul.select2-choices').removeAttr('style'); //No I18N
                bt.addClass('circle-arrow-down').removeClass('circle-arrow-up'); //No I18N
                t.prop('title', getMessageForKey('sdp.helpdesk.common.select2.showmore')); //No I18N
            }
        }
    }
};

/**
 *_allowInteraction issue on select2, spot-field edit , pop calendar , select, input and zeditor
*/
var ui_dialog_interaction = jQuery.ui.dialog.prototype._allowInteraction;
jQuery.ui.dialog.prototype._allowInteraction = function(e) {
    if (jQuery(e.target).closest('.select2-drop,.spot-field,.showCalPopUp,[class*="ze"],input,select').length){
      return true;
    }
    return ui_dialog_interaction.apply(this, arguments);
};
function aswidth(swh,awh)//Source Width, Asign Width
{
   var fswh = jQuery(swh).width();
   jQuery(awh).width(fswh);
}

function reloadPage(page)
{
	if(page != null)
	{
		var query = page.location.search;
		if (query.indexOf("PORTALID") == -1) {
			query += ( query.startsWith("?")  ? (query.endsWith("&") ? "" : "&") : "?" );
			query += "PORTALID="+ PORTALID;//No I18N
		}
		//while reloading the parent window, pathname is required.
		page.location = page.location.pathname + query;
	}

}


/*SELECT2 AJAX COMPONENT*/
function select2Dropdown(params){
    var formatResult , formatSelection , dropdownCssClass ;
    if(params.formatResult){
       formatResult= params.formatResult /* Checking for formatResult present or not */
    }
    if(params.formatSelection){
       formatSelection= params.formatSelection /* Checking for formatSelection present or not */
    }
    if(params.dropdownCssClass){
       dropdownCssClass= params.dropdownCssClass /* Checking for dropdownCssClass present or not */
    }
    jQuery("#"+params.elementId).select2({
        formatResult :formatResult,
        formatSelection: formatSelection ,
        dropdownCssClass: dropdownCssClass ,
        ajax: {
            url:params.url,
            dataType: params.dataType,
 			params: { headers: { "APICLIENT": "sdp_web"  } },// NO I18N
            data: function (search_text, page){
              var d_input = "";
                 var inputObject = {};
                 var list_info   = {};
                 params.listInfo.search_criteria.value = search_text;
                 params.listInfo.search_criteria.children = jQuery.map(params.listInfo.search_criteria.children, function( data, index ) {
                  data.value = search_text ; /* Included search_text in listinfo search_criteria */
                  return data;
                 });
                 list_info=params.listInfo;
                 inputObject.list_info=list_info;
                 //For pagination:
                 inputObject.list_info.start_index = ((page - 1) * params.listInfo.row_count) + 1;
                 d_input = sdpAjaxInputData(inputObject, params.escapeInputData); /* Encode url*/
               return d_input;
            },
            results: function (p_t, page){
                if(params.select2Result){
                  return params.select2Result(p_t,page,params);
                }
            }
        }
    }).on("change", function (e) {
        if(params.OnChangeFunction){
           params.OnChangeFunction(e)
     }
    });
}

function call_after_render(module_id){
  if(module_id.startsWith("RequestsView")) {
    $se.page_scripts.render("rlv_page");
  }
}

function historyExpandCollapse(){
	jQuery('.history-toggleheader em').off('click').on('click',function(){ // NO I18N
		if(jQuery(this).attr('class')=='ui-expand')
		{
			jQuery(this).removeAttr('class').addClass('ui-collapse');		// NO I18N
			jQuery(this).closest('.history-toggleheader').next().slideDown('slow');	// NO I18N
		}
		else
		{
			jQuery(this).removeAttr('class').addClass('ui-expand');		// NO I18N
			jQuery(this).closest('.history-toggleheader').next().slideUp('slow');	// NO I18N
		}
	});
}

function exportFlexiList( viewName, fileType )
{
    if(viewName!=null && (viewName=='softwareList' || viewName=='alllicenses' || viewName=='softwareInstallations' || viewName=='softwareusers' || viewName=='softwareHistory' || viewName=='purchaseOrderList')){
        viewName = 'Export'+viewName;//No I18N
    }
    exportlist(viewName, fileType);
}


/*
 * Custom sort function for select2 component
 * @args arguments of sortResults method in select2 component
 */
/*function sortResultsFn(results, container, query) {
    if (query.term) {
        var len = results.length;
        var parr = []; //placeholder array
        var barr = []; //begins with array
        var carr = []; //contains array
        for(var i = 0; i < len; i++) {
            if(results[i].id == "0") {  // NO I18N
                parr.push(results[i]);
            } else if(results[i].text.trim().toUpperCase().indexOf(query.term.toUpperCase()) == 0) {
                barr.push(results[i]);
            } else {
                carr.push(results[i]);
            }
        }
        return parr.concat(barr, carr);
    }
    return results;
} */

/* Mentions code should be moved as a component.. This will be taken later..*/
/**
 * Mention stratergy for users and placeholders for zeditor 
 * Used in Request Notes, Tech assign Notes
 * autoCheck {true|false} Auto Check 'Show to Requester' checkbox, if the Requester is tagged in notes. Used in Request notes. Ignored in Assign tech notes.
 * options.users.show - Loads users
 */
function getMentionStratergy(autoCheck, user_criteria, placeholder_criteria, options){
    
    // Mention stratergy object for zeditor,
    // search - get data for dropdown. Returns Promise object.
    // replace - defines the  template, after selecting item in dropdown
    var placeholders = [];
    var mentionStratergy = {
        search: function (term) {
            var searchInPlaceholder = function(term){
                var match = jQuery.map(placeholders,function(placeholder){
                    if(placeholder.display_name.toLowerCase().indexOf(e_html(term.replace(/\s/g, ' ').toLowerCase())) > 0 || placeholder.name.toLowerCase().indexOf(e_html(term.replace(/\s/g, ' ').toLowerCase())) > 0){
                        return placeholder;
                    }
                    else{
                        return null;
                    }
                });
                return match;
            };

            var modifyObjKeysForDropdown = function(data){

                var result = jQuery.map(data,function(obj){
                    if((obj.type && (obj.type === "User" || obj.type === "Technician")) || (obj.citype && (obj.citype.name === "User" || obj.citype.name === "Technician"))){ // No I18N
                        var res = {};
                        res.fn = obj.name;
                        res.eid = obj.email_id || "-"; // No I18N
                        //SD-119931 : Used default pic for the logins where profile pic is restricted.
                        res.photo = obj.profile_pic ? obj.profile_pic["content-url"] : "/images/default-profile-pic2.svg"; // No I18N
                        res.id = obj.id;
                        res.name = obj.name;
                        res.type = obj.type || obj.citype.name;
                        return res;
                    }
                    else{
                        var res = {}; 
                        res.id = obj.id;
                        res.name = obj.display_name;
                        return res;
                    }
                });
                return result;
            };

            /**
             * Searches for the user for the given term
             * @param {String} term - Search term
             */
            var getUsers = function(term){
                /**
                 * SD - 101737
                 */
                var data = {"list_info" : {"row_count" : "50", "sort_field" : "name", "sort_order" : "asc"}}; // NO I18N
                if(term){
                    var  search_criteria =[ {"condition": "like", "field": "name",  "logical_operator": "and", "value": term}]; // NO I18N
                    if(user_criteria){
                        search_criteria.push(user_criteria);
                    }
                    jQuery.extend(data.list_info, {search_criteria : search_criteria});
                }
                else{
                    if(user_criteria){
                        data.list_info.search_criteria = user_criteria;
                    } 
                }
                var dataStr = window.sdpToJSON(data);

                return sdpAjax({
                    type: "GET", // No I18N
                    dataType: 'json', // No I18N
                    url: options && options.hasOwnProperty("users") && options.users.hasOwnProperty("href") ? options.users.href : "/api/v3/users", // No I18N 
                    data: {
                        input_data: dataStr
                    }
                })
            };

            /**
             * Gets the placeholders from v3 api
             * @param {Function} callback Callback function after get placeholders
             */
            var getPlaceHolders = function(){
                var self = this;
                if(placeholders.length == 0){
                    var data = {"for" : "request_notes"}; // No I18N 
                    if(placeholder_criteria){
                        data.list_info = {};
                        data.list_info.search_criteria = [
                            placeholder_criteria
                        ];
                    }
                    var dataStr = window.sdpToJSON(data);
                    return sdpAjax({
                        type: "GET", // No I18N
                        dataType: 'json', // No I18N
                        url: "/api/v3/placeholders", // No I18N 
                        data: {
                            input_data: dataStr
                        }
                    });
                }
                else{
                    return placeholders;
                }
            };

            var getResponse = function(placeholderResponse,userResponse){
                var data = {};
                userResponse = userResponse && (jQuery.isArray(userResponse) ? userResponse[0] : userResponse);
                if(userResponse && userResponse.hasOwnProperty("response_status") && ((jQuery.isArray(userResponse.response_status) && userResponse.response_status[0].status === "success") || userResponse.response_status.status === "success")){
                    var usersData = options && options.users && options.users.lookup_entity ? userResponse[options.users.lookup_entity] : userResponse["users"];
                    data.Users = modifyObjKeysForDropdown(usersData);
                }
                if(placeholderResponse){
                    var pholders = jQuery.isArray(placeholderResponse) ? placeholderResponse[0] : placeholderResponse;
                    if(pholders && pholders.hasOwnProperty("response_status") && pholders.response_status[0].status === "success"){
                        placeholders = pholders.placeholders;
                    }
                }
                if(placeholders.length > 0){

                    if(term){
                        var match = searchInPlaceholder(term);
                        data.Placeholders = modifyObjKeysForDropdown(match);
                    }
                    else{
                        data.Placeholders = modifyObjKeysForDropdown(placeholders);
                    }
                    
                }
                return data; 
            };

            return new Promise(function(resolve, reject){
                
                if(sdp_user.USERTYPE === "Technician"){
                    if(options && options.users && options.users.show){
                        jQuery.when(getUsers(term)).done(
                            function(userResponse){
                                var result = getResponse(undefined,userResponse);
                                resolve(result);
                            }
                        );
                    }
                    else{
                        jQuery.when(getPlaceHolders(),getUsers(term)).done(
                            function(placeholderResponse,userResponse){
                                var result = getResponse(placeholderResponse,userResponse);
                                resolve(result);
                            }
                        );
                    }
                }
                else if(sdp_user.USERTYPE === "Requester"){ // No I18N 
                    if(options && options.users && options.users.show){
                        jQuery.when(getUsers(term)).done(
                            function(userResponse){
                                var result = getResponse(undefined,userResponse);
                                resolve(result);
                            }
                        );
                    }
                    else{
                        jQuery.when(getPlaceHolders()).done(
                           function(placeholderResponse){ 
                                var result = getResponse(placeholderResponse);
                                resolve(result);     
                            } 
                        );
                    }
                }
            });
        },
        replace: function (obj) {

            var type, name;
            obj.id = obj.id? obj.id : obj.name;

            //if requester is tagged, then auto check show to requester
            if(autoCheck && obj.type === "User" && !jQuery("#isPublicCheck").prop("checked")){
                showalert('info',getMessageForKey("sdp.requests.note.mentions"),"isAutoHide=true"); // No I18N 
                jQuery("#isPublicCheck").prop("checked",true); //No I18n
            }

            if(obj.type && (obj.type === "User" || obj.type === "Technician")){ // No I18N 
                type = 'user'; // No I18N 
                name = obj.name;
            }
            else{
                type = 'placeholder'; // No I18N 
                name = obj.name;
            }


            var mentionElement = jQuery("<span tabindex='0' mention-type='" + type + "' mention='" + obj.id + "'   contenteditable='false'>@" + e_html(name) + "</span>&nbsp;").css("color","#1a6ebd"); // No I18N
            var parentContainer = jQuery("<div>").append(mentionElement, document.createTextNode("\u00A0"));
            return parentContainer[0];
        }
    };
    
    return mentionStratergy;
}

/** returns the formatted cost based on the allowed decimal points length */
function getFormattedCost(cost) {
    return parseFloat( cost ).toFixed( sdp_app.MAX_ALLOWED_DECIMAL_POINTS );
}

function  triggerAddAttachment(entity, entity_id, container, callback) {
    if(!container){
        container = jQuery("#contianer");
    }else{
        container = jQuery(container);
    }
    if(!container.find("#hidden-div").length){
        container.append('<div id="hidden-div" class="hide"></div>');
    }
    var triggerInput = function() {
        jQuery(container).find('.ip-drag').trigger('click');
    };

    if (!jQuery("[data-attach-label]").length) {
        setTimeout(function(){
            var options = {
                entity: entity,
                entity_id: entity_id,
                upload: true,
                api: false,
                direct_upload: true,
                is_odapi: true,
                is_odapi_v2: true,
                rerenderOnUpload: false,
                browse_html: "<div class='hide'></div>"
            };
            /** Upload Callback */
            options.servlet_cb = function(res){
                showalert("success", getMessageForKey("Attachment Added successfully"), "isAutoHide=true"); //NO I18N
                if(jQuery.isFunction(callback)){
                        callback(res);
                }
            }
            var atpInstance = new attachPreview(container.find("#hidden-div"), options);
            /** Need to delay the trigger process for initializing the component */
            setTimeout(function() {
                triggerInput();
            }, 100);
        },100);
    } else {
        triggerInput();
    }
}
