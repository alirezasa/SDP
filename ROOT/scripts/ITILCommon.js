/* $Id$ */
// Special Effects Functions
function highlightNote() {
    var color1 = "#FFFF66", color2 = "#E5EDE6";//No i18N
    if(isDark()){
        color1 = "#254312";//No i18N
        color2 = "#121212";//No i18N
    }
    $$('div.HiliteProNote').each(
            function(e) {
            e.visualEffect('highlight',{duration:3,startcolor:color1,endcolor:color2});//No i18N
            });
}

function hiliteImpact() {
    new Effect.ScrollTo("ImpactDetailsAnc");//No i18N
    $$('td.HiliteImpact').each(
            function(e) {
            e.visualEffect('highlight',{duration:3,startcolor:"#48FF48",endcolor:"#ECECEC"});//No i18N
            })//No i18N
}

function scrollToNote(noteId) {
    if(noteId != null && document.getElementById("NOTE_"+noteId) != null) {
        new Effect.ScrollTo('NOTE_' + noteId);//No i18N
    }
    else if(noteId == "notes"){
        new Effect.ScrollTo("notes");//No i18N
    }
}

function scrollToNotificationId(id) {
    threadShowhide(id);
    new Effect.ScrollTo(id);
    $$('div.HiliteNotification').each( function(e) { e.visualEffect('highlight',{duration:3,startcolor:"#48FF48",endcolor:"#ECECEC"}) })//No i18N
}

// Delete functions
function deleteNote(url,params,noteId, module) {
	var result = confirm(getMessageForKey("sdp.itil.error.deletenoteconfirm"));
    if(result) {
        document.getElementById("NOTE_" + noteId).className = "HiliteProNote";//No i18N
        new Effect.SlideUp(document.getElementById("NOTE_" + noteId));
        setTimeout(function() {
        	var myAjax = new Ajax.Request(url, {
        		method: 'post',//NO I18N
        		parameters: params + "&"+ new Date().getTime()
        		}) } , 1000)
    }
}

// Form Validations
function validateNotes(formObj) {
    var notes = formObj.notesText.value;
    if(notes == null || trimAll(notes) == "") {
        alert(getMessageForKey("sdp.itil.error.enternotes"));
        return false;
    }
    formObj.Submit.disabled = true;
    return true;
}



function updateUserName(formObj) {
    var options = formObj.OWNERID.options;
    var hasSelected = false;

    for(var i=0; i<options.length; i++) {
        if(options[i].selected == true) {
            formObj.USER_NAME.value = options[i].text;
            hasSelected = true;
        }
    }
    if (hasSelected != true)
    {
        alert(getMessageForKey("sdp.requests.requestcost.errorTechname"));
        return false;
    }
    return true;
}

function showDetailsInDialog(displayId) {
        var data = document.getElementById(displayId+'1').innerHTML;
    var code = "<table border=0 cellpadding=0 cellspacing=0><tr><td class=caTopLeft></td><td class=caTopCenter></td><td class=caTopRight></td></tr>";//No i18N
    code = code.concat("<tr><td class=caMiddleLeft>&nbsp;</td><td class=caMessage>");//No i18N
    code = code.concat(data);
    code = code.concat("</td><td class=caMiddleRight>&nbsp;</td></tr>");//No i18N
    code = code.concat("<tr><td class=caBottomLeft></td><td class=caBottomCenter></td><td class=caBottomRight></td></tr></table>");//No i18N
        showDialog(code, 'closeButton=no,position=relative,width=300,srcElement=' + displayId);//No i18N
}

function deleteCharge(url, module) {
        var result = confirm(getMessageForKey("sdp.requests.requestcost.errorDeleteConfirm"));
        if(result) {
        window.open(url + "&" + (new Date()).getTime(),module + "Frame");//No i18N
    }
}

function invokeSitePopup() {
     var siteWindowURL = "/SiteLookup.do?configID=0&SELECTSITE=SPOT_SITEID&userConfigID="+encodeURIComponent(document.getElementsByName('loggedUserID')[0].value)+"&SELECTEDSITEID=0&SELECTEDSITENAME="+getMessageForKey('sdp.admin.technician.addtechnician.nosite');//No i18N
     window.open(siteWindowURL,'site', 'width=900,height=500,scrollbars=1');
}

function resetInlineEditForm(form)
{
    var elem;

    // reset select boxes
    $A(form.getElementsByTagName('select')).each(function(x) {   //console.debug("",x.name);No i18N
                                                        //Setting the values for select2 components
                                                        val=(val == "" || val == null || val == "null")? 0 : val;//No i18N
                                                        jQuery(elem).select2('val',val);//No i18N
    });

    // Reset UDF text fields
    var ips = $A(form.getElementsByTagName('input'));//No i18N
    var xx = $A([]);
    ips.inject(xx, function(x, i){
                       //Multi Select UDF will be handled separately
               return x;
    });
    xx.each(function(x) {
            elem = $A($('Spot_' + x.name).getElementsByTagName('INPUT')).find(function (i) {//No i18N
                                                                              if(i.name == x.name) {
                                                                                  return i;
                                                                              }
            });
            elem.value = $(x.name + '_CUR').getAttribute('val');//No i18N
    });

    // Reset TextArea fields
    $A(form.getElementsByTagName('textarea')).each(function(x) {//No i18N
                                                          elem = $A($('Spot_' + x.name).getElementsByTagName('textarea')).find(function (i) {//No i18N
                                                                                                                               if(i.name == x.name) {
                                                                                                                                   return i;
                                                                                                                               }
                                                          });
                                                          elem.value = $(x.name + '_CUR').getAttribute('val').replace(/-/, '');//No i18N
    });

    // reset Priority Phrase
    if($('Priority_Phrase') && $('Priority_Phrase_CUR')) {
        $('Priority_Phrase').update($('Priority_Phrase_CUR').innerHTML); //No i18N
    }

    // reset asset
    if($('WORKSTATIONID') && $('Inline_WORKSTATIONID')) {
        $('WORKSTATIONID').value = $("WORKSTATIONID_CUR").getAttribute('val');//No i18N
        $('Inline_WORKSTATIONID').value = $("WORKSTATIONID_CUR").innerHTML;//No i18N
    }
    if(jQuery('#selectedCIs') != null && jQuery('#selectedCIs').length > 0)
    {
        updateSelectedCIDropdown(jQuery("#selectedCIs"), requesterID, chosenCI, maxCICount);
    }
    //Reset for Multi Select UDF
    //SD-63378 : MultiSelect reset will be called only if fieldList available
    if(jQuery('#MultiSelectFieldsList').val() != undefined)
    {
        destroyAndCallSelect2MultiSelect(jQuery('#MultiSelectFieldsList').val());
    }
    // reset created time and due by time, only for SDAdmin
    if($('CREATEDTIME') && $('CREATEDTIME_CUR')){
        $('CREATEDTIME').value = $('CREATEDTIME_CUR').getAttribute('val');//No i18N
    }
    if($('DUEBYTIME') && $('DUEBYTIME_CUR'))    {
        $('DUEBYTIME').value = $('DUEBYTIME_CUR').getAttribute('val'); //No i18N
    }
    //CWF START
    if($('SCHEDULEDSTARTTIME') && $('SCHEDULEDSTARTTIME_CUR')){
    $('SCHEDULEDSTARTTIME').value = $('SCHEDULEDSTARTTIME_CUR').getAttribute('val');//No i18N
    }
    if($('SCHEDULEDENDTIME') && $('SCHEDULEDENDTIME_CUR')){
    $('SCHEDULEDENDTIME').value = $('SCHEDULEDENDTIME_CUR').getAttribute('val');//No i18N
    }
    if($('COMPLETEDTIME') && $('COMPLETEDTIME_CUR')){
    $('COMPLETEDTIME').value = $('COMPLETEDTIME_CUR').getAttribute('val');//No i18N
    }
    //CWF -END
    elem = undefined;

    try {
        $$('img.date').each(function(date) {//No i18N
                            displayClientTime(date.getAttribute('forFieldId')); //No i18N
        });
    }
    catch (e) {}
}


function replaceOldValuesForField(fieldName, module){
        if(document.getElementById('onHoldIcon')!=null)
        {
            document.getElementById('onHoldIcon').style.display="inline";
        }
    if(module == "WorkOrder") {
    
        document.getElementById(fieldName + "_RCUR").className = "spotEdit";//No i18N
        document.getElementById(fieldName + "_RPH").className = "hide";//No i18N
    }
    else {
        document.getElementById(fieldName + "_CUR").className = "spotEdit";//No i18N
        document.getElementById(fieldName + "_PH").className = "hide";//No i18N
    }
    if(fieldName == 'CATEGORYID' || fieldName == 'SUBCATEGORYID' || fieldName == 'ITEMID') {
        document.getElementById("CATEGORYID_CUR").className = "spotEdit";//No i18N
        document.getElementById("CATEGORYID_PH").className = "hide";//No i18N
        if(document.getElementById("SUBCATEGORYID_CUR")){
            document.getElementById("SUBCATEGORYID_CUR").className = "spotEdit";//No i18N
            document.getElementById("SUBCATEGORYID_PH").className = "hide";//No i18N
        }
        if(document.getElementById("ITEMID_CUR")){
            document.getElementById("ITEMID_CUR").className = "spotEdit";//No i18N
            document.getElementById("ITEMID_PH").className = "hide";//No i18N
        }
    }
    if(($A(['OWNERID', 'QUEUEID', 'SITEID']).include(fieldName)) && (module == "WO")) {
        if(document.getElementById("QUEUEID_CUR")){
            document.getElementById("QUEUEID_CUR").className = "spotEdit";//No i18N
            document.getElementById("QUEUEID_PH").className = "hide";//No i18N
        }
        if(document.getElementById("SITEID_CUR")){
            document.getElementById("SITEID_CUR").className = "spotEdit";//No i18N
            document.getElementById("SITEID_PH").className = "hide";//No i18N
        }

    }

    if(($A(['TECHNICIANID', 'GROUPID', 'SITEID']).include(fieldName)) && module == "Change") {
        if(document.getElementById("TECHNICIANID_CUR")){
            document.getElementById("TECHNICIANID_CUR").className = "spotEdit";//No i18N
            document.getElementById("TECHNICIANID_PH").className = "hide";//No i18N
        }
        if(document.getElementById("GROUPID_CUR")){
            document.getElementById("GROUPID_CUR").className = "spotEdit";//No i18N
            document.getElementById("GROUPID_PH").className = "hide";//No i18N
        }
        if(document.getElementById("SITEID_CUR")){
            document.getElementById("SITEID_CUR").className = "spotEdit";//No i18N
            document.getElementById("SITEID_PH").className = "hide";//No i18N
        }
        if(document.getElementById("change_vbf_fldname_ChangeOwner")){
            var techDisplayVal = $("change_vbf_fldname_ChangeOwner");//No i18N
            var techFieldVal = $("TECHNICIANID_CUR");
            techDisplayVal.className = 'hide';//No i18N
            techFieldVal.className = 'hide';//No i18N
        }        
    }
    if(fieldName == "WORKSTATIONID" && $('woWSValue') != null) {
        var wsValue = $('woWSValue').innerHTML;//No i18N
        if(wsValue != null || wsValue == "" || wsValue == "-1" || wsValue == "0") {
            if($('WorkStationLink')){
                $('WorkStationLink').show(); //No i18N
            }
            if($('RemoteWorkStationLink')){
                $('RemoteWorkStationLink').show();//No i18N
            }
        }
        else {
            if($('WorkStationLink')){
                $('WorkStationLink').hide();//No i18N
            }
            if($('RemoteWorkStationLink')){
                $('RemoteWorkStationLink').hide(); //No i18N
            }
        }
    }
    if(fieldName == "OWNERID" || fieldName == "TECHNICIANID") {
        if(module == "Change") {
            if(parent['changeTechId'] != null) {
                document.getElementById(module + "OwnerLink").className = "viewreqstrdet";//No i18N
            }
        }
    }
    // fix for date fields not setting in inline edit if opend and closed in spot edit
    if(document.getElementById(fieldName + "_PH")) {
        document.getElementById(fieldName + "_PH").innerHTML = ""; //No i18N
    }
    fixRowHeightForSpotEdit(jQuery('#'+fieldName + "_CUR"));//NO I18N
}

/*function showAssets() {
     NewWindow('/common/SelectAssets.jsp','SelectAssets','750','450','yes','center');//No i18N
}*/

function showAssets(siteId,tabName) {
    //CWF START
    var url  = "/common/SelectAssets.jsp?"; //No I18N
    if(tabName!= null && tabName != undefined)
    {
    url  = url+"TABNAME="+encodeURIComponent(tabName); //No I18N
    }
    if(siteId!= null && siteId != undefined)
    {
    url  = url+"&SITEID="+encodeURIComponent(siteId); //No I18N
    }
    //CWF END
    NewWindow(url,'SelectAssets','750','450','yes','center');//No i18N
}

function getAccQS(el,ent) {
    if(isMSP) {
      return ent+"&persistentAccountId="+getAccountId(); //No I18N
    } else {
      return;
    }
 }

function fillCSIValues(formObj) {
    if(document.getElementById("ITEMID_PH")){
        document.CSIForm.CATEGORYID.value = document.CATForm.CATEGORYID.value;
        document.CSIForm.SUBCATEGORYID.value = document.SUBCATForm.SUBCATEGORYID.value;
    }else{
        document.SUBCATForm.CATEGORYID.value=document.CATForm.CATEGORYID.value;
    }
    var fieldNameArr = [];
       fieldNameArr[0] = "CATEGORYID"; //No I18N
       fieldNameArr[1] = "SUBCATEGORYID"; //No I18N
       fieldNameArr[2] = "ITEMID"; //No I18N
    for(var i=0;i<fieldNameArr.length;i++)
    {
        var fieldName = fieldNameArr[i];
        var catManObj = document.getElementById(fieldName + "_MANDATORY");
        if(catManObj != null)
        {
            var catObjMan = catManObj.value;
            if(catObjMan == 'true')
            {
                var value;
                   if(fieldName == 'CATEGORYID')
                   {
                       if(document.CSIForm)
                       {
                           value = document.CSIForm.CATEGORYID.value;
                       }
                       //cwf start - when item element is removed, the form name is CATForm
                       else if(document.CATForm)
                       {
                           value = document.CATForm.CATEGORYID.value;
                       }
                       //cwf end
                   }
                   else if(fieldName == 'SUBCATEGORYID')
                   {
                       if(document.CSIForm)
                       {
                           value = document.CSIForm.SUBCATEGORYID.value;
                       }
                       //cwf start - when item element is removed, the form name is SUBCATForm
                       else if(document.SUBCATForm)
                       {
                           value = document.SUBCATForm.SUBCATEGORYID.value;
                       }
                       //cwf end
                   }
                else if(fieldName == 'ITEMID')
                {
                    //cwf:commented
                       //value = 1;//document.getElementById('CS_ITEMID').value;
                    //cwf: added sunilg: not sure why value was hardcoded to 1.   
                    value = document.CSIForm.CS_ITEMID.value;
                }
                if(value == 0)
                {
                    alert(getMessageForKey(document.getElementById(fieldName + "_DISPLAYNAME").value) + " " + getMessageForKey('mandatoryUDF'));
                    return false;
                }
            }
        }
    }
}

//Technician conflict pop-up shown while conflict occurs in spot edit
var dbTech;
function dbspotTechnician(dbTech1){
    dbTech = dbTech1;
}
// SD: 66802 Technician keeps getting updated/changed on saving the technician field to ‘Unassigned’ status more than once while the page is loading, when tech auto assign is enabled.
function fillSGTValues(formObj,$this) {
    jQuery($this).addClass('hide');
    jQuery($this).parent().find('img').addClass('hide');
    if(formObj.name == 'techForm') {
        document.techForm.SITEID.value = (document.siteForm) ? document.siteForm.SITEID.value : '0';
    
    var ajaxResponseSucces = false;
    if( document.techForm.SITEID.value != "0" )
    {
        jQuery.ajax({type: 'POST', url: '/PurchaseRequest.do?task=getAssociatedPrsForSR&serviceRequestId='+WOID , data: '', async: false ,contentType: 'application/json; charset=utf-8', dataType: 'text', success: function(responseJson) { responseJson = ( responseJson.trim() != "" ? responseJson.split(",") : [] );if( responseJson.length > 0 ) {if( confirm(getMessageForKey( "sdp.service.request.dissociate.pr.waringmessage", [jQuery(document.siteForm).find("[name='SITEID'] :selected").text().trim()]))){ ajaxResponseSucces = true }else{ replaceOldValuesForField('SITEID', 'WO');}}else{ajaxResponseSucces = true; } }});//NO I18N

        if( !ajaxResponseSucces )
        {
            return false;
        }
    }
        document.techForm.QUEUEID.value = (document.groupForm) ? document.groupForm.QUEUEID.value : '0';
    }
    else if(formObj.name == 'groupForm') {
        document.groupForm.SITEID.value = (document.siteForm) ? document.siteForm.SITEID.value : '0';//document.techForm changed to document.groupForm as techForm does not exist if tech field is disbled.
    }
    /*SD-28974 Mandatory check for Group and Tech */
    var fieldNameArr = [];
       fieldNameArr[0] = "QUEUEID"; //No I18N
       fieldNameArr[1] = "OWNERID"; //No I18N
    for(var i=0;i<fieldNameArr.length;i++)
    {
        var fieldName = fieldNameArr[i];
        var sgtManObj = document.getElementById(fieldName + "_MANDATORY");
        if(sgtManObj != null)
        {
            var sgtObjMan = sgtManObj.value;
            if(sgtObjMan == 'true')
            {
                var value;
                if(fieldName == 'QUEUEID')
                {
                    /*If techForm is present, taking QUEUEID from techForm else from groupForm*/
                   if(document.techForm)
                   {
                       value = document.techForm.QUEUEID.value;
                   }
                   else if(document.groupForm)
                   {
                       value = document.groupForm.QUEUEID.value;
                   }
                }
                else if(fieldName == 'OWNERID')
                { 
                    value = document.techForm.OWNERID.value;
                }
                if(value == 0)
                {
                    alert(getMessageForKey(document.getElementById(fieldName + "_DISPLAYNAME").value) + " " + getMessageForKey('mandatoryUDF'));
                    return false;
                }
            }
        }
    }
    //Technician conflict pop-up shown while spot editing. 
    if(document.getElementById('module')!=null){
        if(document.getElementById('module').value == "WO"){
            var inViewTech = document.getElementById('initialTech').value == null || document.getElementById('initialTech').value == "" ? 0 : document.getElementById('initialTech').value;
            var changedTech = document.getElementById('changedTech').value == null || document.getElementById('changedTech').value == "" ? inViewTech : document.getElementById('changedTech').value;    
            if(dbTech == 'null'){
                dbTech = '0';
            }            
                var result = validateTechConflict(inViewTech,dbTech,changedTech);
                if(result){
                    return true;
                }
                else{
                    replaceOldValuesForField('OWNERID', 'WO'); //No I18N
                    window.location = '/WorkOrder.do?woMode=viewWO&woID='+ WOID+'&&fromListView=true';
                }
            }            
        }
    /* if(document.getElementById("OWNERID_PH")){
        document.techForm.SITEID.value = document.siteForm.SITEID.value;
        document.techForm.QUEUEID.value = document.groupForm.QUEUEID.value;
        //console.debug(" S: %s  G: %s  T: %s",document.techForm.SITEID.value, document.techForm.QUEUEID.value, document.techForm.OWNERID.value);
    }
    else{
        document.groupForm.SITEID.value = document.siteForm.SITEID.value;
    } */
}

function fillSGTValues4Change(formObj) {
    if(formObj.name == 'techForm') {
        document.techForm.SITEID.value = (document.siteForm) ? document.siteForm.SITEID.value : '';
        document.techForm.GROUPID.value = (document.groupForm) ? document.groupForm.GROUPID.value : '';
        //console.debug(" S: %s  G: %s  T: %s",document.techForm.SITEID.value, document.techForm.GROUPID.value, document.techForm.TECHNICIANID.value);
    }
    else if(formObj.name == 'groupForm') {
        document.groupForm.SITEID.value = (document.siteForm) ? document.siteForm.SITEID.value : '';
    }
    /* if(document.getElementById("OWNERID_PH")){
        document.techForm.SITEID.value = document.siteForm.SITEID.value;
        document.techForm.QUEUEID.value = document.groupForm.QUEUEID.value;
        //console.debug(" S: %s  G: %s  T: %s",document.techForm.SITEID.value, document.techForm.QUEUEID.value, document.techForm.OWNERID.value);
    }
    else{
        document.groupForm.SITEID.value = document.siteForm.SITEID.value;
    } */
}

function showChangeTypeForm(configType) {
        window.frames.ChangeType_FRAME.location.href = "/setup/ChangeTypeForm.jsp?" + "&forwardTo=" + encodeURIComponent(configType) + "&TYPE=New&" + (new Date()).getTime();//No i18N
    parent.onClickSwapLayer('ChangeType_FORM','ChangeType_LIST');//No i18N
}

function SetColour(color){
    document.getElementById("ColorPreview").style.backgroundColor = '#' + color;//No i18N
    document.getElementById("colorName").value = '#' +color;//No i18N
    closeDialog();
}

function showcolors()
{
    var data = document.getElementById("SelectColour").innerHTML;//No i18N
    showDialog(data, 'closeButton=no,position=relative,srcElement=imageId');//No i18N

    parent.jQuery('[data-colorid]').on('click', function() {
        parent.SetColour(parent.jQuery(this).attr('data-currentcolor'));   //No I18N
     });
    parent.jQuery('[sdpJs="js-event-changetypeform-7"]').on("click", function(event) {   //No I18N
        parent.closeDialog();
    });
}

function validateChangeTypeForm(formObj) {
    var name = formObj.NAME.value;
    var colourid = formObj.colorName.value;
    if(trimAll(name) == "") {
        alert(getMessageForKey("sdp.itil.change.changetype.name"));//No i18N
        formObj.NAME.focus();
        return false;
    }
    formObj.NAME.value = trimAll(name);
    formObj.colorName.value = trimAll(colourid);
    return true;//handleStateForForm(formObj);
}
function changeTypeBulkOperation(type, configType) {    
    var formObj = document.ChangeTypeListForm;
    var selVals = getSelectedCheckBoxes(document.ChangeTypeListForm);    
    if(selVals.length == 0) {   
        alert(getMessageForKey("sdp.admin.common.deletemess"));
        return;
    }
    if(type == "DELETE") {
        var result = confirm(getMessageForKey("sdp.admin.common.deleteconfmess",[configType]));
        if(!result) {
            return;
        }
    }
    invokeProgressIndicator(null,getMessageForKey("sdp.common.processing"));//No i18N
     
    //71674 , 71675 , 71676 - for change type , leave type , priority Vul Issues to be fixed - GET POST URLs 
    var url = "SetUpWizard.do?forwardTo=" + encodeURIComponent(configType); //No I18N
    
    var method="POST"; //No I18N
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", url);  

    var typeElement = document.createElement("input");
    
    typeElement.setAttribute("type", "hidden");
    typeElement.setAttribute("name", "TYPE");
    typeElement.setAttribute("value", encodeURIComponent(type));
    form.appendChild(typeElement);

    var csrfElement = document.createElement("input");		
    csrfElement.setAttribute("type", "hidden");		
    csrfElement.setAttribute("name", getCSRFParamName());		
    csrfElement.setAttribute("value", getCSRFParamValue());		
    form.appendChild(csrfElement);

    var valuesElement = document.createElement("input");
    
    valuesElement.setAttribute("type", "hidden");
    valuesElement.setAttribute("name", "CONFIGID");
    valuesElement.setAttribute("value",  selVals);
    form.appendChild(valuesElement);              

    document.body.appendChild(form);
    
    form.submit();
    
    // The form needs to be a part of the document in
    // order for us to be able to submit it.
}

function removeSelected(selObj) {
    alert(selobj);
    var opts = selObj.options;
    for(var cnt = 0; cnt < opts.length; cnt++) {
        if(opts[cnt].selected) {
            opts[cnt] = null;
            cnt--;
        }
    }
}

function invokeFileAttachment(module,modId) {
    var url = "/common/FileAttachment.jsp?type=new&module="+encodeURIComponent(module);//No i18N
    if(modId)
    {
        url = url+"&modId="+modId; //No i18N
    }

    showURLInDialog(url + "&" + (new Date()).getTime(), "closeButton=no,position=relative");//No i18N

}

/**
    this method takes the select object of the originating list and puts its values to the destinationlist
    whose select object is passed as the second parameter
*/
function copyListValuesFromTo(selectObj, destinationObj)
{
    try
    {
        //alert("called copyListValuesFromTo");
        //alert(selectObj.options+":"+selectObj.options.length);
        var toList = destinationObj;
        var fromList = selectObj;
        toList.innerHTML = '';
        //toList.options.length = 0;
        /* if(fromList.options.length == 0)
        {
            //alert("Please select some value");
            return false;
        } */
        var frmLstSz = fromList.options.length;
        var dd = document.createDocumentFragment();
        for (i=0; i<frmLstSz; i++) {
            var current = fromList.options[i];
            // do not add value -1 generally associated with 'choose' and 'select'
            if (current.value == '-1')
            {
                /* alert ("You cannot move this text");
                return false; */
                continue;
            }
            txt = current.text;
            val = current.value;
            addNewOption(dd, val, txt);
            //alert(toList.name+">>"+toList.options+":"+toList.options.length);
            //toList.options[toList.options.length] = new Option(txt,val,true,false);
            //console.debug("option[",toList.options.length-1,"]:",toList.options[toList.options.length-1]);
        }
        toList.appendChild(dd);
        //list.options[list.options.length] = new Option("a","1",true,false);
        //list.options[list.options.length] = new Option("b","2",true,false);
    }
    catch(e)
    {
        //alert("Error: ",e);
    }
}


function changeColor() {
    var colorCode = document.getElementById("colorName").value;
    if(colorCode.indexOf("#") < 0 && colorCode.trim().length > 0) {

        colorCode = "#" + colorCode;//No i18N

    }else if(colorCode.indexOf("#") >= 0 && colorCode.trim().length == 1){

        colorCode = "";
    }
    try {
        document.getElementById("ColorPreview").style.backgroundColor = colorCode;
    }
    catch(e){
        // IE will accept only when the color is correct. Else he will throw an exception.
    }
    document.getElementById("colorName").value = colorCode;
}

function checkTechAssign()
{
alert(getMessageForKey('sdp.request.autoapproval.techwarning'));
  checkTechAssign = function(){};
}

//CWF START
//TODO: change the name 
     function goTop()
     {
             jQuery('html, body').animate({scrollTop:0}, 'slow');//no i18n
             return false;
     }
//TODO: Change the name
     function selectAll(thisForm, checkBoxCompName)
     {
         toSelectAll = false;
         if(thisForm.checkbox23.checked)
         {
             toSelectAll = true;
         }
         for(var i=0; i<thisForm.elements.length; i++)
         {
             if(thisForm.elements[i].name == checkBoxCompName)
             {
                 thisForm.elements[i].checked = toSelectAll;
             }
         }
     }
var itsChangeCmdb = false;
function toggleForShowHide(showId,hideId)
    {
        document.getElementById(hideId).className ="hide";
        document.getElementById(showId).className = "show";
    }
//CWF END

