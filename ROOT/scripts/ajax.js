/* $Id$ */

// global variables
var sdp_reqForm = null;
var technicianObj = null;
var form_name = null;
var groupCommonOption = null;

var resourceBox = null;

function submitGroupID(form) {
    sdp_reqForm = form;
    groupID = sdp_reqForm.group.value;
    siteID = sdp_reqForm.siteID.value;
    technicianObj = sdp_reqForm.technician;
    groupCommonOption = $('selectGroup');//No i18N
    techCommonOption = $('selectTech');//No i18N
    form_name = sdp_reqForm.name;
    if(form_name == 'BulkEditRequestForm' && groupID == '-1') {
        groupID = 0;
    }
    url = "/servlet/HdClientUtilServlet?group="+encodeURIComponent(groupID)+"&siteID="+encodeURIComponent(siteID);//No i18N
    req = getXMLHttpRequest();
    if(req) {
        req.onreadystatechange = processStateChange;
        req.open("GET", url, true);//No i18N
        req.send(null);
    }
}

function processStateChange()
{
    if (req.readyState == 4)
    { // Complete
        if (req.status == 200)
        { // OK response

            var nameNode = req.responseXML.getElementsByTagName("technicians")[0];//No i18N
            var objNode = req.responseXML.getElementsByTagName("object")[0];//No i18N           var objTextNode = objNode.childNodes[0];
            var nameNode1 = req.responseXML.getElementsByTagName("details");//No i18N
            var nl= nameNode1.length;

            if(technicianObj!=null)
            {
                technicianObj.options.length = 0;
                if(form_name == 'BulkEditRequestForm')
                {
                    technicianObj.options[0] = new Option('Choose', "-1");//No i18N
                    technicianObj.options[1] = new Option('NONE', "0");//No i18N
                }
                else if(form_name == 'PasswordResetForm')
                {
                    technicianObj.options[0] = new Option(groupCommonOption.innerHTML, "-1");//No i18N
                    technicianObj.options[1] = new Option('NONE', "0");//No i18N
                }
                //Added the below check for adding the default value specific to the Tasks screen
                else if(form_name == 'CUDTask')
                {
                    technicianObj.options[0] = new Option(techCommonOption.value,"0");//No i18N
                }
                else
                {
                    if(groupCommonOption.value!=undefined){
                        technicianObj.options[0] = new Option(groupCommonOption.value, "0");//No i18N
                    }
                    else {
                        technicianObj.options[0] = new Option(getMessageForKey('sdp.common.choose2'), "0");//No i18N
                    }
                      jQuery(technicianObj).select2('val',technicianObj.options[0].value);//No i18N
                }
                for(i=0; i< nl;i++)
                {
                    var keyNode = req.responseXML.getElementsByTagName("key")[i];//No i18N
                    var keyTextNode = keyNode.childNodes[0];
                    var keyText = keyTextNode.nodeValue;

                    var valueNode = req.responseXML.getElementsByTagName("value")[i];//No i18N
                    var valueText = valueNode.childNodes[0];
                    var valText = valueText.nodeValue;

                    if(form_name == 'BulkEditRequestForm' || form_name == 'PasswordResetForm')
                    {
                        technicianObj.options[i+2] = new Option(valText, keyText);
                    }
                    else
                    {
                        technicianObj.options[i+1] = new Option(valText, keyText);
                    }
                }
            }
        }
        else
        {
            alert("Problem: " + req.statusText);//No i18N
        }
    }
}

var sdp_reqForm1 = null;
var siteValu = null;

function fillUserDetails1(form)
{
    sdp_reqForm1 = form;
    activeEle = jQuery(document.activeElement);//sd-67719 fix
    activeAsset = activeEle.closest('#multiasset');//No i18N
    if(activeEle.attr('id')) {
        dataId = parseInt(activeEle.attr('id').replace('s2id_autogen','')) + 1;//sd-67719 fix
    }
    // 21086 Issue in site population when we change requester name in new request form
    if(sdp_reqForm1.tempSiteValue != null)
    {
        siteValu = sdp_reqForm1.tempSiteValue.value;
    }
    //sd-47619 : group values set to null when null/space is requester name
    reqName= null;
    reqName = sdp_reqForm1.reqName.value;
    if(trim(reqName) == '')
    {
        if(document.getElementById("selectedCIs") != null && sdp_reqForm1.name != 'QuickCreateForm')
        {
            //document.getElementById("user_details_div").style.display = 'none';//No I18N
        jQuery('#user_details_div').addClass('hide');
        //Since in UI text is placed as text in a span no need to encode
        //Previously values are placed in div as html, so encode was needed
        jQuery('#contactNumber').text("");
            jQuery('#location').text("");
            jQuery('#jobTitle').text("");
            jQuery('#email').text("");
            jQuery("#user_details_more_div").addClass('hide');
            updateSelectedCIDropdown(jQuery("#selectedCIs"), 0, [], jQuery('#maxCICount')[0].value);//No I18N
            activeAsset.length > 0 ? setActive(dataId) : '';//sd-67719 fix
        }
            sdp_reqForm1.requesterID.value = "";
        if(sdp_reqForm1.oboID)
        {
            sdp_reqForm1.oboID.value = "";
        }
        return false;
    }
    reqName = sdp_reqForm1.reqName.value;
    reqName = encodeURIComponent(reqName);
    reqID = sdp_reqForm1.requesterID.value;
    var _userId = jQuery('#reqSearch').select2('val'); //NO I18N
    url = "/api/v3/users/"+_userId;  //NO I18N
    sdpAjax({
        url: url,
        async:false,
        ignoreFailureMessage:true,
        success:function(res){
            processStateChangeUD(res);
        }
    });
    //sd-67719 fix
    if(activeAsset.length > 0){
        setActive(dataId)
    }

}

//sd-67719 fix
function setActive(actId){
    dataNum = actId;
    setTimeout(function(){
        jQuery('#s2id_autogen'+dataNum).trigger('focus').closest('div').addClass('select2-container-active');//No i18N
    },100);
}
function fetchUserAssets(userID) {
    var result=[];
    sdpAjax({
        url: "/api/v3/users/" + userID + "/_associated_assets",	//No I18N
        data: { input_data: sdpToJSON({ list_info: { row_count: "100" } }) },
        cache: false,
        async:false,
        ignorefailuremessage:false,
        success: function(data) {
            if(data && data.response_status && data.response_status[0].status === "success") {
                data.associated_assets.forEach(function(item){
                    if(item.asset){
                        result.push({
                            id:item.asset.ci.id,
                            text:item.asset.name
                        })
                    }

                });
            }
        }
    })
    if(result.length === 1){
        return result;
    }else{
        return [];
    }
}

function processStateChangeUD(res) {
    if (res && res.user) {
        var contactNumber, dept, siteid, sitename = undefined;
        var reportUser, reportUserEmail, reportUserDept, deptHeadUser, deptHeadUserEmail, deptHeadUserDept, userId = undefined;
        /*** ME-SOLUTIONS CODE CHANGES STARTS HERE ***/
        var jobTitle = undefined;
        /*** ME-SOLUTIONS CODE CHANGES ENDS HERE ***/
        //wsID = 0;
        //console.debug("value ",value);
        var data = res.user
        //console.debug("data ", data);
        if (data) {
            contactNumber = data.phone;
            email = data.email_id;
            userId = data.id;
            if (data.department) {
                dept = data.department.name;
            }
            if (data.department && data.department.site) {
                siteid = data.department.site.id;
                sitename = data.department.site.name;
            } else {
                siteid = "0";
                sitename = getMessageForKey('sdp.admin.technician.addtechnician.nosite');
            }
            jobTitle = data.jobtitle;
            /*** ME-SOLUTIONS CODE CHANGES STARTS HERE ***/

            // This code will removed once the Service catelogue team changed thier implementation
            jQuery.ajax({
                async: false,
                url: "/servlet/AJaxServlet?action=getUserDetails&search=" + reqName + "&reqId=" + encodeURIComponent(reqID),//No i18N
                success: function (servletResponse) {
                    data.USER_ORGROLES = {};
                    if (servletResponse) {
                        var servletData;
                        try {
                            servletData = JSON.parse(servletResponse);
                        } catch (error) { 
                            servletData = servletResponse;
                        }
                        reportUser = servletData.USER_REPORTUSER;
                        reportUserEmail = servletData.USER_REPORTUSEREMAIL;
                        reportUserDept = servletData.USER_REPORTUSERDEPT;
                        deptHeadUser = servletData.USER_DEPTHEADUSER;
                        deptHeadUserEmail = servletData.USER_DEPTHEADEMAIL;
                        deptHeadUserDept = servletData.USER_DEPTHEADUSERDEPT;
                    }
                }
            });

            /*** ME-SOLUTIONS CODE CHANGES ENDS HERE ***/
            /* call again for updating the requesterDetails for Script use of FAFR*/
            var assets = fetchUserAssets(userId);

            if (document.getElementById("selectedCIs") != null && sdp_reqForm1.name != 'QuickCreateForm') //Fix for SD-41479
            {
                updateSelectedCIDropdown(jQuery("#selectedCIs"), userId, assets, jQuery('#maxCICount')[0].value);//No I18N
            }
        }

        if (!contactNumber) { contactNumber = "-" }
        if (!email) { email = "-" }
        if (!dept) { dept = "-" }
        if (!siteid) { siteid = "-1" }
        if (sitename == 'NOT_IN_SITE' || siteid == 'NOT_IN_SITE') {
            sitename = getMessageForKey('sdp.admin.technician.addtechnician.nosite');
        }
        if (sdp_reqForm1.selApprs !== null && sdp_reqForm1.selApprs !== undefined) {

            if (deptHeadUser !== "" && deptHeadUser !== undefined) {
                var tmpDeptHead = ' [' + deptHeadUser + ']';
                if (deptHeadUserEmail !== "" && deptHeadUserEmail !== undefined) {
                    tmpDeptHead = tmpDeptHead + ' [' + deptHeadUserEmail + ']';
                }
                if (deptHeadUserDept !== "" && deptHeadUserDept !== undefined) {
                    tmpDeptHead = tmpDeptHead + ' [' + deptHeadUserDept + ']';
                }
                data.USER_ORGROLES[1] = tmpDeptHead;
            }
            if (reportUser !== "" && reportUser !== undefined) {
                var tmpreportingUser = ' [' + reportUser + ']';
                if (reportUserEmail !== "" && reportUserEmail !== undefined) {
                    tmpreportingUser = tmpreportingUser + ' [' + reportUserEmail + ']';
                }
                if (reportUserDept !== "" && reportUserDept !== undefined) {
                    tmpreportingUser = tmpreportingUser + ' [' + reportUserDept + ']';
                }
                data.USER_ORGROLES[2] = tmpreportingUser;
            }
            var selectedApprStr = jQuery('#selApprs').val();
            var selectedApprIdsArray = [];
            if (typeof selectedApprStr === "string") {
                selectedApprIdsArray = selectedApprStr.split(',');
            }
            var selectedApproversArray = [];
            jQuery.each(Request.approverAllowedValues, function () {
                var role_id = this.id;
                if (role_id.indexOf('_orgRoleId') > -1) {
                    var id = role_id.split('_')[0];
                    var rolename = this.text.substr(1, this.text.indexOf('$', 1) - 1);
                    var role_user = data.USER_ORGROLES[id];
                    if (role_user == undefined) {
                        role_user = "";
                    }
                    this.text = '$' + rolename + '$ ' + role_user;
                }
                if (selectedApprIdsArray.contains(role_id)) {
                    var approverObj = {};
                    approverObj.id = this.id;
                    approverObj.text = this.text;
                    selectedApproversArray.push(approverObj);
                }
            });
            var $approver = jQuery("#selApprs");
            if ($approver.attr("data-dynamic-options") === "true") {
                var dynamicFieldName = $approver.attr("data-field-name");
                var displayName = $approver.parents(".fafr-row").find(".fafr-label").clone().children().remove().end().text().trim(); //No I18N
                var placeholder = getMessageForKey('sdp.leftpanel.search.title') + " " + displayName; //No I18N
                dynamicLoading.init($approver, {
                    allowedValues: udfAllowedValues[dynamicFieldName],
                    fieldName: dynamicFieldName,
                    selectedValues: selectedApproversArray,
                    multiple: true,
                    placeholder: placeholder
                });
            } else {
                var objectApprover = $approver.find('option');
                for (var i in objectApprover) {
                    var id = objectApprover[i].value;
                    if (id && id.indexOf('_orgRoleId') > -1) {
                        var rolename = objectApprover[i].text.substr(1, objectApprover[i].text.indexOf('$', 1) - 1);
                        var role_id = id.split('_')[0];
                        var role_user = data.USER_ORGROLES[role_id];
                        if (role_user == undefined) {
                            role_user = "";
                        }
                        objectApprover[i].text = '$' + rolename + '$ ' + role_user;
                    }
                }
                $approver.select2('destroy');  //NO I18N
                $approver.select2({ allowClear: true });//NO I18N
            }
        }
        /*** ME-SOLUTIONS CODE CHANGES STARTS HERE ***/
        if (!jobTitle) { jobTitle = "-" }
        /*** ME-SOLUTIONS CODE CHANGES ENDS HERE ***/

        //console.debug("sdp_reqForm1 ",sdp_reqForm1);
        /*if(sdp_reqForm1.contactNumber != null)
            sdp_reqForm1.contactNumber.value = contactNumber;
        if(sdp_reqForm1.location != null)
            sdp_reqForm1.location.value = dept;
        // ME-SOLUTIONS CODE CHANGES STARTS HERE 
        if (sdp_reqForm1.jobTitle!=null)
        {
            sdp_reqForm1.jobTitle.value = jobTitle;
        }*/
        if (sdp_reqForm1.name != 'QuickCreateForm') //Fix for SD-41479 starts here
        {
            document.getElementById("contactNumber").innerHTML = encodeHTML(contactNumber);
            document.getElementById("location").innerHTML = encodeHTML(dept);
            document.getElementById("jobTitle").innerHTML = encodeHTML(jobTitle);
            if ((siteid == 'NOT_IN_SITE') || trim(sdp_reqForm1.reqName.value) == '' || ((sdp_reqForm1.oboName != undefined) && (trim(sdp_reqForm1.oboName.value) == ''))) {
                //document.getElementById("user_details_div").style.display = 'none';
                jQuery('#user_details_div').addClass('hide');
                jQuery("#user_details_more_div").addClass('hide');
                sdp_reqForm1.requesterID.value = "";
                if (sdp_reqForm1.oboID) {
                    sdp_reqForm1.oboID.value = "";
                }
            }
            else {
                //Since in UI text is placed as text in a span no need to encode
                //Previously values are placed in div as html, so encode was needed
                jQuery('#contactNumber').text(contactNumber);
                jQuery('#location').text(dept);
                jQuery('#jobTitle').text(jobTitle);
                jQuery('#email').text(email);
                //document.getElementById("user_details_div").style.display = 'block';
                jQuery('#user_details_div').removeClass('hide');
                jQuery("#user_details_more_div").removeClass('hide');
                $req.header.getPendingRequestCount(userId, sdp_reqForm1.reqName.value);
                if (userId == undefined || userId == null) {
                    if (sdp_reqForm1.oboID) {
                        sdp_reqForm1.oboID.value = "";
                    }
                    else {
                        sdp_reqForm1.requesterID.value = "";
                    }
                }
            }
        }
        /*** ME-SOLUTIONS CODE CHANGES STARTS HERE ***/
        /* if(sdp_reqForm1.workstationID != null)
        sdp_reqForm1.workstationID.value = wsID; */
        if (sdp_reqForm1.siteID != null && siteid != 'NOT_IN_SITE') {
            // requester/technician site value should not overwrite the template site value(if site value is assigned)
            if (siteValu != "0" && siteValu != null && siteValu != "null") //No I18N
            {
                siteid = siteValu;
            }

            //Editing a request and modifying the requester should not change SGT.
            if (document.location.search.indexOf("editWO") == -1) {
                /* on change of the Requester Site Changed
                  var $siteUpdate = jQuery(sdp_reqForm1).find('#siteID');
                  var sitePreValue = $siteUpdate.val();
                  sdp_reqForm1.siteID.value = siteid;
                  //setting siteID to site select2 component
                  $siteUpdate.select2('val',siteid);//NO I18N */
                sdp_reqForm1.siteID.value = siteid;
                //setting siteID to site select2 component
                jQuery(sdp_reqForm1).find('#siteID').select2('val', siteid);//NO I18N
                //To show the respective site name of the requester in whole edit and quick create of request.
                if (sitename != undefined && sdp_reqForm1.siteID_siteSearch != null && (sdp_reqForm1.name == 'WorkOrderForm' || sdp_reqForm1.name == 'QuickCreateForm') && !(data.USER_SITEID != siteid)) {
                    sdp_reqForm1.siteID_siteSearch.value = sitename;
                }
                if (sdp_reqForm1.siteID_siteSearch == null && sdp_reqForm1.siteName != null) {
                    sdp_reqForm1.siteName.value = sitename;
                }


                var isMSPLicense = document.getElementById("isMSPLicense");
                if (isMSPLicense != null && isMSPLicense != 'undefined' && isMSPLicense == 'true') {
                    sdp_reqForm1.siteName.value = sdp_reqForm1.siteID.options[sdp_reqForm1.siteID.selectedIndex].text;
                }
                try {
                    var techList = $('TECHNICIANID');//No i18N
                    var grpList = $('GROUPID');//No i18N
                    if (techList) { populateListFromArray(techList, siteid, "Site"); }
                    if (grpList) { populateList(grpList, siteid, siteGrpModel.getSiteGroups, siteGrpModel); }

                    if (grpList.selectedIndex > 0) {
                        var grpId = grpList.options[grpList.selectedIndex].value;
                        populateListFromArray(techList, grpId);
                    }
                }
                catch (e) { /*
                        In IE when the HOME > My Schedule tab is selected and we add a requester through Ajax in QuickCreate form
                        then the above check "if(techList)" will be true. Because in IE getElementById also return values
                        if the name matches instead of an Id and we will have a field in scheduler page named TECHNICIANID.
                        So subsequently it will enter the if block and throw a JS error
                        THIS TRY CATCH BLOCK IS TO SUPPRESS THAT ERROR. DO NOT REMOVE... */
                    //alert(e.message);
                }
                /* on change of the Requester Site Changed According to acosiate with the Requester
                if(sitePreValue !== siteid){
                    triggerEvent(window.document.getElementById("siteID"),'change'); //No I18N
                }*/
            }
        }
        else if (siteid == 'NOT_IN_SITE' && sdp_reqForm1.siteID_siteSearch == null && sdp_reqForm1.siteName != null) {
            sdp_reqForm1.siteName.value = sitename;
        }

    }
}

/*function getResourcesByType(compnentListID, listBoxID)
{
    //get component type
    var componentListBox = $(compnentListID);
    var componentTypeID = componentListBox.value;
    resourceBox = $(listBoxID);
    //console.debug("in getResourcesByType :",componentListBox);
    //console.debug("",resourceBox);
    //url = "/servlet/HdClientUtilServlet?componentTypeId="+componentTypeID;
    var newUrl = '/servlet/HdClientUtilServlet';//No i18N
    var params = 'componentTypeId=' + componentTypeID;//No i18N
    var myAjax = new Ajax.Request(newUrl, {method: 'get', parameters: params, onComplete: populateResources});//No i18N
}*/

function getResourcesByType(compnentListID, listBoxID, siteId,tabName)
{
    //get component type
    var componentListBox = $(compnentListID);
    var componentTypeID = componentListBox.value;
    resourceBox = $(listBoxID);
    //console.debug("in getResourcesByType :",componentListBox);
    //console.debug("",resourceBox);
    //url = "/servlet/HdClientUtilServlet?componentTypeId="+componentTypeID;
    var newUrl = '/servlet/HdClientUtilServlet';//No i18N
    var params = 'command=getComponentTypes&componentTypeId=' + encodeURIComponent(componentTypeID);//No i18N
    if(siteId !=null && siteId!=undefined)
    {
        params = params + '&siteID=' + encodeURIComponent(siteId) ; // No I18N
    }
    if(tabName!=null && tabName != undefined)
    {
        params = params + '&TABNAME=' + encodeURIComponent(tabName); // No I18N
    }
    var myAjax = new Ajax.Request(newUrl, {method: 'get', parameters: params, onComplete: populateResources});//No i18N
}

function populateResources(resp, jsonObj)
{
    try{
        var nameNode = resp.responseXML.getElementsByTagName("ResourcesByType")[0];//No i18N

        var objNode = resp.responseXML.getElementsByTagName("object")[0];//No i18N
        var objTextNode = objNode.childNodes[0];

        var nameNode1 = resp.responseXML.getElementsByTagName("details");//No i18N
        var nl= nameNode1.length;
        //console.debug("length = ",nl);
        if(resourceBox!=null)
        {
            resourceBox.options.length = 0;
            //resourceBox.options[0] = new Option("All Assets", "0");
            for(i=0; i< nl;i++)
            {
                var keyNode = resp.responseXML.getElementsByTagName("key")[i];//No i18N
                var keyTextNode = keyNode.childNodes[0];
                var keyText = keyTextNode.nodeValue;

                var valueNode = resp.responseXML.getElementsByTagName("value")[i];//No i18N
                var valueText = valueNode.childNodes[0];
                var valText = valueText.nodeValue;

                resourceBox.options[i] = new Option(valText, keyText);
            }
        }
    }catch(e){alert(e);}
}

/* This is a common method to populate any Select List Box in the page given
* the XML response from the server and the DOM reference to the Select Box
*
* @PARAM xmlResp - XMLHttpRequest Object [REQUIRED]
* @PARAM targetListRef - DOM refernce to the the select box that needs to be updated [REQUIRED]
* @PARAM selectOptionMessage - A message String to display the first option eg. "Choose/Select Assets" [OPTIONAL]
* @PARAM noDataMeessage - A message string that will be populated to the Select box when no data is returned from the server [OPTIONAL]
* @PARAM exData - An array of keys. Exclusion data. keys matching values in this Array will not be populated
* @PARAM callback - A callback function reference
* @PARAM CBParams - An array of callback parameters
* @PARAM CBScope - Callback function scope. use window if nothing
*
* Expected XML response :
* <details> <key>1234</key> <value>navneet.india.adventnet.com</value> </details>  OR
* <entries> <key>1234</key> <value>navneet.india.adventnet.com</value> </entries>
*
* How to Use :
* [If using Prototype.js Ajax.Request()]
* onComplete: function(resp, jsonObj){ populateListBox(resp, targetListBox, "-- Choose Asset --", "No Asset Available")};
* [If using XMLHttpRequest Object directly] - req is an XMLHttpRequest Object
* req.onreadystatechange = function(){ populateListBox(req, targetListBox, "-- Choose Asset --", "No Asset Available")};
*
* The unnamed funtion block will create a closure over the parent function and will have access to its variables
* more on Closures : [See] http://blog.morrisjohns.com/javascript_closures_for_dummies
*/
function populateListBox(xmlResp, targetListRef, selectOptionMessage, noDataMeessage, exData, callback, CBParams, CBScope)
{
    try
    {
        if(xmlResp.status!='0') {  
        //console.debug("response",xmlResp.responseText);
        //console.debug("targetListRef",targetListRef);
        var dataNode = xmlResp.responseXML.getElementsByTagName("details");//No i18N
        if(dataNode.length == 0) {
            dataNode = xmlResp.responseXML.getElementsByTagName("entries");//No i18N
        }
        //console.debug("length = ", dataNode.length);
        if(dataNode.length != 0)
        {
            if(targetListRef != null)
            {
                // using selectBox.innerHTML to remove exsiting options. this is faster;
                // targetListRef.options.length = 0;
                targetListRef.innerHTML = "";

                // using DocumenFrangment to eliminate extra brower reflows while adding options
                var dd = d.createDocumentFragment();
                // var index = 0;

                if(dataNode.length != 1) {
                    if(selectOptionMessage != null) {
                        // targetListRef.options[index] = new Option(selectOptionMessage, "0");//No i18N
                        // ++index;
                        addNewOption(dd, '0', selectOptionMessage);
                    }
                }
                //SD-13163 asset will not be set selected by default for requester if configured in global config
                if(parent.setAsset!=null && parent.setAsset=='false' && dataNode.length == 1){
                    if(selectOptionMessage != null) {
                        // targetListRef.options[index] = new Option(selectOptionMessage, "0");//No i18N
                        // ++index;
                        addNewOption(dd, '0', selectOptionMessage);
                    }
                }

                var keyData = xmlResp.responseXML.getElementsByTagName("key");
                var valData = xmlResp.responseXML.getElementsByTagName("value");
                var dataSize = dataNode.length;
                var exDataSize = (exData != null) ? exData.length : 0;
                var matchCnt = 0;
                //sdlog("exclusion size ratio " + (exDataSize/dataSize));

                for(var i=0; i<dataSize; i++)
                {
                    //var keyNode = keyData[i];
                    //var keyTextNode = keyNode.childNodes[0];
                    var keyText = keyData[i].childNodes[0].nodeValue;

                    //var valueNode = valData[i];
                    //var valueText = valueNode.childNodes[0];
                    var valText = valData[i].childNodes[0].nodeValue;

                    // targetListRef.options[index] = new Option(valText, keyText);
                    // console.debug("targetListRef.options",targetListRef.options[index]);
                    // ++index;

                    var toAdd = true;
                    if(exData != null) {    // if exclusion list is given
                        // The following check optimizes for small exclusion data size. exDataSize <<< dataSize
                        // When all exclusions are matched, no need to check for more
                        if(matchCnt < exDataSize) {
                            // NOTE: this for loop is optimized for small exclusion list size with respect to the datasize
                            for(var j=0; j<exDataSize; j++) {
                                if(keyText == exData[j]) {
                                    toAdd = false;
                                    matchCnt++;
                                    //exData.remove([keyText]);
                                    //exDataSize--;
                                    break;
                                }
                            }
                        }
                    }
                    if(toAdd) {
                        addNewOption(dd, keyText, valText);
                    }
                }
                if(dataNode.length == 1) {
                    if(selectOptionMessage != null && parent.setAsset!=null && parent.setAsset!='false') {
                        // targetListRef.options[index] = new Option(selectOptionMessage, "0");//No i18N
                        // ++index;
                        addNewOption(dd, '0', selectOptionMessage);
                    }
                }
                targetListRef.appendChild(dd);
            }
        }
        else {
            if(noDataMeessage != null && targetListRef != null) {
                targetListRef.options.length = 0;
                targetListRef.options[0] = new Option(noDataMeessage, "0");//No i18N
            }
        }
        // remove DOM reference
        targetListRef = null;

        if(callback != null) {
            callback.apply(CBScope, CBParams);
        }

        // fix for closing search user window
        closeSearchWindow();
    }
    }
    catch(e)
    {
        showScriptError(e, "populateListBox");//No i18N
    }
}

function closeSearchWindow() {
    //console.debug("closeSearchWindow");
    // fix for closing search user window
    if(parent.selectuser != null) {
        //console.debug("22");
        parent.selectuser.close();
        parent.selectuser = null;
    }
}

function getSWF(movieName)
{
    if (navigator.appName.indexOf("Microsoft") != -1)
    {
        return window[movieName];
    }
    else
    {
        return document[movieName];
    }
}

function clearReportFormValues()
{
    document.getElementById("pendRequestCnt").innerHTML="";//No i18N
    document.getElementById("compRequestCnt").innerHTML="";//No i18N
    document.getElementById("slaViolatedCnt").innerHTML="";//No i18N
}

function getData()
{
    if (req1.readyState == 4)
    { // Complete
        if (req1.status == 200)
        { // OK response
            var val="";//No i18N
            var res=0;
            var value = req1.responseText;
            value = value.replace(/{/g,"");//No i18N
            value = value.replace(/}/g,"");//No i18N
            value1=value.split("&");//No i18N
            for(j=0;j<value1.length;j++){
                value2 = value1[j].split("~");//No i18N
                 if(value2[0]=="Stat") {
                    value3 = value2[1].split(",");//No i18N
                    for(i=0;i<value3.length;i++){
                        res = value3[i].split("=")[1];
                        if(value3[i].split("=")[0].match("Pending")) {
                            if(res!=null && res!=""){
                                document.getElementById("pendRequestCnt").innerHTML=encodeHTML(res);
                            } }else if(value3[i].split("=")[0].match("Completed")){
                            if(res!=null && res!=""){
                                document.getElementById("compRequestCnt").innerHTML=encodeHTML(res);
                        }}
                    }
                    document.getElementById("requestCnt").innerHTML=Number(document.getElementById("pendRequestCnt").innerHTML)+Number(document.getElementById("compRequestCnt").innerHTML);
                }
                else if(value2[0]=="SLA") {
                    value3 = value2[1].split(",");//No i18N
                    for(i=0;i<value3.length;i++){
                        res = value3[i].split("=")[1];
                        if(!value3[i].split("=")[0].match("Not Violated")) {
                            if(res!=null && res!=""){
                                document.getElementById("slaViolatedCnt").innerHTML=encodeHTML(res);
                                }
                        }
                    }
                }
            }
        }
        else
        {
            alert("Problem: " + req1.statusText);//No i18N
        }
    }
}

var mapURL;
var mapModule;
function getMappedIdAndInvokeURL(module,url,id)
{
    mapObj = getXMLHttpRequest();
    mapURL=url;
    mapModule=module;
    var ajaxURL="/servlet/SDAjaxServlet?module="+encodeURIComponent(module)+"&action=getRequestedID&search="+ encodeURIComponent(id); //No I18N
    mapObj.open("GET",ajaxURL,true); // No I18N
    mapObj.onreadystatechange = invokeURL;
    mapObj.send(null);

}
function invokeURL()
{
    if(mapObj!=null && mapObj.readyState==4)
    {
        var strID = mapObj.responseText;
        if(mapModule=="survey")
        {
            NewWindow(mapURL+strID,'SurveyResponse','800','700','yes','center');
        }//SD-45142 : Unable to open the associated problem / change for an incident in a new window / new tab.
        else if(mapModule == "problem" || mapModule == "change" || mapModule == "project" || mapModule == "causedbychange")
        {
            var newWindow = window.open( mapURL+strID, '_blank');
            newWindow.focus();
            return false;
        }
        //Technician assign/pickup tech conflict pop-up shown while changing technician
        else if(mapModule == "request"){
            dbTechnician(strID);
            dbspotTechnician(strID);
        }
        else
        {
            window.location.href=mapURL+strID;
        }
    }
}
function detachMappedId(module,id)
{

    detachObj = getXMLHttpRequest();
    var ajaxURL="/servlet/SDAjaxServlet?module="+encodeURIComponent(module)+"&action=detach&search="+ encodeURIComponent(id); //No I18N
    detachObj.open("POST",ajaxURL); // No I18N

    detachObj.onreadystatechange = ( function()
    {
        return function()
        {
            //SD-107688 Failure case handling for request change dissociation
            if(detachObj != null && detachObj.status == 401)
            {
                window.showalert("failure", getMessageForKey("sdp.common.operation.autherror"), "isAutoHide=true");   //No I18N
                return;
            }
            parent.showChangeDialog(id);
        }
    })();//Incident by Change

    detachObj.send(null);
}

function stopTechTimer(techStatus,requestId,techId)
{

url = '/servlet/HdClientUtilServlet';//No i18N
urlParams='command=stopTechTimer&woID='+encodeURIComponent(requestId)+'&currenttechStatus='+encodeURIComponent(techStatus)+'&techId='+encodeURIComponent(techId);//No i18N

req = getXMLHttpRequest();

if(req) {
        req.open("POST", url, true);//No i18N
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send(urlParams);
         req.onreadystatechange = function() {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    
                    getWorkingTechnicians(requestId);
                }
    }
}
}
}
function getWorkingTechnicians(requestId)
{
url = "/servlet/HdClientUtilServlet?command=getTechTimerDetails&woID="+encodeURIComponent(requestId);//No i18N
req = getXMLHttpRequest();
/*if(req) {
        req.open("GET", url, true);//No i18N
        req.send(null);
         req.onreadystatechange = function() {
            if (req.readyState == 4) 
            {
                if (req.status == 200) 
                {
                    ////console.log(req.responseText);
                    renderTechPopup(req.responseText,requestId);
                }
            }
        }
    }*/
    jQuery.getJSON(url).done(function(responseData)
    {
        ////console.log(responseData);
        renderTechPopup(responseData,requestId);
    }
    );
}

function addWorklog(requestId,userId)
{
url = "/servlet/HdClientUtilServlet?command=getWorklogDetails&woID="+encodeURIComponent(requestId);//No I18N
req = getXMLHttpRequest();
if(req) {
        req.open("GET", url, true);//No i18N
        req.send(null);
         req.onreadystatechange = function() {
            if (req.readyState == 4) 
            {
                if (req.status == 200) 
                {
                    autoFillWorkLogFromTimer(req.responseText,requestId,userId);
                }
                /*else
                {
                //console.log("Error while adding worklog . Check server log for details");
                }*/
            }
            }
        }
}
