/* $Id$ */
var notesobject = null;

function addEditor(name, id){
        window.opener.document.getElementById("editorField").value = name;
        window.opener.document.getElementById("editorId").value = id;
        window.close();
}

function addNotes(url, id) {

    var entity_id = id.split("note")[1] || id.split("N_")[1];   //No I18N
    var title = entity_id ? "#"+entity_id+" - " : "";  //No I18N
    title += getMessageForKey("sdp.requests.viewrequest.addnotes"); //No I18N
 
    //23567 modified for arc requests notes title
    if(url.indexOf("ArcRequest") != -1)
    {
        title = getMessageForKey("sdp.requests.common.notes");
    }
    else if (url.indexOf("Change") !== -1 && navparamId === 'trashed_changes') {
        url = url + "&view=Trash";//NO I18N
    }
    notesobject = document.getElementById(id);
    var now = new Date();
    var timedURL = url+"&ct="+now.getTime(); // No I18N
      if(parent.sdp_user.DIRECTION == "RTL") {
        showURLInDialog(timedURL,'modal=yes,width=900px,title='+title); //No I18N
    }
    else {
        showURLInDialog(timedURL,'width=900px,modal=yes,title='+title); //No I18N
    }
}

function showConversationInDialog(url,entity_id){
    showURLInDialog(url,' top=50, left=400,width=900,height=580,modal=yes,closeOnEscKey=yes'); //No I18N
}

function emptyDialog(){
    jQuery("#_DIALOG_LAYER").html("");
}

function showConversationInDialog(url,entity_id){
    var opts = ' top=50, left=400,width=900,height=580,modal=yes,closeOnEscKey=yes,closeCallBack=notesClose'; //No I18N
    if(typeof emptyDialog === 'function') opts += ',emptyOnClose=true'; // 106491 & 111680 - fix
    showURLInDialog(url,opts,() => {
        if(typeof changelistview !== 'undefined')
        {
            if(sdp_user.CLIENT_CONF.changelistview == undefined) {
            //As changelitview is reset only on 'table view' reassigning that
                sdp_user.CLIENT_CONF.changelistview = {
                    current_view_mode: 'table' // No I18N
                };
            }
         }
            let activeParent = window.frameElement && $previewComponent.iframeActiveParent();
		    activeParent && (activeParent.$previewComponent.internalDialogs['notes'] = true);
        });
}
var notesClose=function(event) {
    let activeparent =  window.frameElement && $previewComponent.iframeActiveParent();
    setTimeout(function(){
        activeparent && (delete activeparent.$previewComponent.internalDialogs["notes"]);
    },10)
};

function emptyDialog(){
    jQuery("#_DIALOG_LAYER").html("");
}

function updateNotesIcon() {
    notesobject.className='tc-notes'; // No I18N
    notesobject = null;
}

function showAll(elementId, elementName) {
    var elements = document.getElementsByTagName(elementName);
    var isFirst = true;
    var firstId = null;
    for(var i=0; i<elements.length; i++) {
        if(elements[i].id != null && elements[i].id.indexOf(elementId) >= 0 ){
            if(isFirst) {
                isFirst = false;
                firstId = elements[i];
            }

            var selRowObj = elements[i];
            var gName = elements[i].id;
            var bulletObj=MM_findObj("bullet"+gName); // No I18N
            selRowObj.className = "show"; // No I18N
            selRowObj.style.display = "block"; // No I18N
            if(bulletObj != null){
                bulletObj.src="/images/threadcollapse.gif"; // No I18N
            }

        }
        var htc = document.getElementById("HTC_" + i);
        var hte = document.getElementById("HTE_" + i);
        if (htc!=null && htc != 'undefined')
        {
            htc.className="show";
        }
        if(hte!=null && hte != 'undefined')
        {
            hte.className="hide";
        }
    }
    //new Effect.ScrollTo(firstId);
}

function hideAll(elementId, elementName) {
    var elements = document.getElementsByTagName(elementName);
    for(var i=0; i<elements.length; i++) {
        if(elements[i].id != null && elements[i].id.indexOf(elementId) >= 0 ){
            var selRowObj = elements[i];
            var gName = elements[i].id;
            var bulletObj=MM_findObj("bullet"+gName); // No I18N
            selRowObj.className = "hide"; // No I18N
            selRowObj.style.display = "none"; // No I18N
            if(bulletObj != null){
                bulletObj.src="/images/threadexpand.gif"; // No I18N
            }
        }
        var htc = document.getElementById("HTC_" + i);
        var hte = document.getElementById("HTE_" + i);
        if (htc!=null && htc != 'undefined')
        {
            htc.className="hide";
        }
        if(hte!=null && hte != 'undefined')
        {
            hte.className="show";
        }
    }
}

function historyShowhideAsset(prefix,gName) {
    var selRowObj = document.getElementById(prefix+ "HIST_" + gName);
    var text = document.getElementById(prefix + "HT_" + gName);
    if (selRowObj.className == 'hide') {
        selRowObj.className = 'show'; // No I18N
        text.innerHTML = "<span class=\"cspr circle-arrow-down icon-sm\"></span>"; // No I18N
    }
    else if(selRowObj.className == 'show') {
        selRowObj.className = 'hide'; // No I18N
        text.innerHTML = "<span class=\"cspr circle-arrow-up icon-sm tf-rot90\"></span>"; // No I18N
    }
    else if(selRowObj.className == '') {
        selRowObj.className = 'show'; // No I18N
        text.innerHTML = "<span class=\"cspr circle-arrow-down icon-sm\"></span>";// No I18N
    }
}

function checkApprovalForm(formObj, isApprovalsForNextStage) {
    var mailIds = trimAll(formObj.TO.value);
    if(mailIds == "" || mailIds == null)
    {
        showalert('failure', getMessageForKey("sdp.mail.name.email.mandatory"),'isAutoHide=false,closeOnEscKey=yes,width=300,height=80');// No I18N
        formObj.TO.focus();
        return false;
    }
    if(mailIds.indexOf(";") > 0) {
        mailIds = mailIds.replace(/\;/g,",");// No I18N
        formObj.TO.value = mailIds;
    }
    var mails = mailIds.split(","); // No I18N
    for(var i = 0; i < mails.length; i++) {
        if(isNaN(mails[i])) {
            var index1 = trimAll(mails[i]).indexOf("@");// No I18N
            var index2 = trimAll(mails[i]).indexOf(".");// No I18N
            if(index1 < 0 || index2 < 0) {
                showalert('failure', getMessageForKey("sdp.mail.provide.valild.email"),'isAutoHide=false,closeOnEscKey=yes,width=250,height=80');// No I18N
                formObj.TO.focus();
                return false;
            }
        }
    }
    if(isApprovalsForNextStage) {
        return true;
    }
    var sub = formObj.SUBJECT.value;
    if(trimAll(sub) == "") {
        showalert('failure', getMessageForKey("sdp.mail.subject.mandatory"),'isAutoHide=false,closeOnEscKey=yes,width=200,height=80');// No I18N
        return false;
    }

    // To check whether the html formatting loss is acceptable. If not stop the execution. Applicable only when viewing in IPad. For rest, the default return is true.
    //if(!isHTMLContentChangeAcceptable()) {
        //return false;
    //}

    // the following code is required to transform the plain text
    // to html text when the user had toggled to plain editing
    var descVal = getHTMLDescription();
    formObj.DESCRIPTION.value = descVal;
    var apprDesc = descVal;//parent['editor'].getHTML(); // No I18N
    //SD:32129 open request details page. go to actions -> submit for approval. enable spell check. click send, showing alert message has been fixed.
    apprDesc =  apprDesc.replace('$<span  >ApprovalLink</span>','$ApprovalLink'); // No I18N

    // Since the form submit is done automatically, we need to set the modified content above to the rich text area. Spell check is available only for wysiwyg mode. So replacing only for that mode.
    if(parent['editor']._editor._editMode == "wysiwyg") {
        parent['editor'].setHTML(apprDesc);
    }
    // SD-46358 : Customers requested $ApprovalLink need not be made mandatory in the email as forwarding the email will
    // allow other person to approve the request.
    /*
    if(apprDesc.indexOf("$ApprovalLink") < 0) {
        alert(getMessageForKey("sdp.approve.linkerror"));
        return false;
    }
    */
    // The form values would have been submitted using the submit button itself. Specific form.submit is not needed.
    // formObj.DESCRIPTION.value = apprDesc; // No I18N
    // formObj.submit();
    return true;
}

function highlight(divClass) {
    $$(divClass).each( function(e) { e.visualEffect('highlight',{duration:3,startcolor:"#48FF48",endcolor:"#E5EDE6"}) }); // No I18N
}

var css_browser_selector = function() {
    var
        ua=navigator.userAgent.toLowerCase(),
        is=function(t){ return ua.indexOf(t) != -1; },
        h=document.getElementsByTagName('html')[0],
        b=(!(/opera|webtv/i.test(ua))&&/msie (\d)/.test(ua))?('ie ie'+RegExp.$1):is('gecko/')? 'gecko':is('opera/9')?'opera opera9':/opera (\d)/.test(ua)?'opera opera'+RegExp.$1:is('konqueror')?'konqueror':is('applewebkit/')?'webkit safari':is('mozilla/')?'gecko':'', os=(is('x11')||is('linux'))?' linux':is('mac')?' mac':is('win')?' win':''; // No I18N
    var c=b+os+' js'; // No I18N
    h.className += h.className?' '+c:c;
}();

// TASKS RELATED METHODS ENDS HERE
function showMenuInDialog(holder, source, aClose) {
    document.onmousemove = capturePos;

    var autoClose =  true;
    if(aClose != null) {
        autoClose = aClose;
    }
    var finalX = 0;// - document.getElementById(holder).offsetWidth + 25;
    var divObj = document.getElementById(source);
    if(parent.sdp_user.DIRECTION != null && parent.sdp_user.DIRECTION == "RTL") {
        finalX = 0 - document.getElementById(holder).offsetWidth - 10;
    }
    if(autoClose) {
        showDialog(document.getElementById(source).innerHTML,'position=relative,srcElement=' + holder + ',closeButton=no,left=' + finalX); // No I18N
        setTimeout(function() { closeMenusDialog(source) }, 1000);
    }
    else {
        showDialog(document.getElementById(source).innerHTML,'position=relative,srcElement=' + holder + ',closeOnBodyClick=yes,closeButton=no,left=' + finalX); // No I18N
    }
}

var xposition,yposition;


function capturePos(e) {
    if (window.ActiveXObject)
    {
        xposition = window.event.clientX;
        yposition = window.event.clientY;
    }
    else
    {
        xposition = e.pageX;
        yposition = e.pageY;
    }
}



function closeMenusDialog(source)
{
    var dialogElement = document.getElementById("_DIALOG_LAYER");
    var reqX = findPosX(dialogElement);
    var reqY = findPosY(dialogElement);
    var offsetHeight = dialogElement.offsetHeight;
    var offsetWidth = dialogElement.offsetWidth;
    // the below check is done without proper understanding, just done on a trial and error basis.
    if (window.ActiveXObject)
    {
        reqY = reqY - document.documentElement.scrollTop;
        reqX = reqX - document.documentElement.scrollLeft;
    }

    var reqEndX = reqX + offsetWidth;
    var reqEndY = reqY + offsetHeight;

    if(xposition < reqEndX && xposition > reqX && yposition < reqEndY && yposition > (reqY-20)) {
        setTimeout(function() {closeMenusDialog(source) }, 1000);
    }
    else {
        closeDialog();
    }
}

//functions selectGroup() and selectTechnician() added for selecting the item in the Group and Technician dropdown of Tasks screen
function selectGroup( value ){
    var len = document.CUDTask.GROUPID.options.length;
    for( var i=0 ; i<len ; i++){
        var opt = document.CUDTask.GROUPID.options[i];
        if( opt.value == value){
            opt.selected = true;
        }
    }
}
function selectTechnician( value ){
    var len = document.CUDTask.OWNERID.options.length;
    for( var i=0 ; i<len ; i++){
        var opt = document.CUDTask.OWNERID.options[i];
        if( opt.value == value){
            opt.selected = true;
        }
    }
}

function selectStatus( value ){
    var len = document.CUDTask.STATUSID.options.length;
    for( var i=0 ; i<len ; i++){
        var opt = document.CUDTask.STATUSID.options[i];
        if( opt.value == value){
            opt.selected = true;
        }
    }
}

function showAttachedMessageAndClose(holder, value, timeout, imgUrl){
    invokeProgressIndicator(holder, value, "completed", imgUrl); // No I18N
    if(timeout != null && timeout != 0) {
        setTimeout(closeDialog,timeout);
    }
}

var xpositionForQuickLink,ypositionForQuickLink;

function closeMenusDialogForQuickLink(source)
{
    var dialogElement = document.getElementById("_DIALOG_LAYER");

    var reqX = findPosX(dialogElement) + 305;
    var reqY = findPosY(dialogElement) - 20;
    var offsetHeight = dialogElement.offsetHeight - 10 ;
    var offsetWidth = dialogElement.offsetWidth - 325 ;

    if (window.ActiveXObject) { }

    var reqEndX = reqX + offsetWidth;
    var reqEndY = reqY + offsetHeight;

    if(xpositionForQuickLink < reqEndX && xpositionForQuickLink > reqX && ypositionForQuickLink < reqEndY && ypositionForQuickLink > (reqY-20)) {
        setTimeout(function(){ closeMenusDialogForQuickLink(source) }, 1000); // No I18N
    }
    else {
        closeDialog();
    }

}

/**
 * This function will take the error object and display it in a useful manner depending upon the browser, to the user
 * It can also take an optional function name to display in which function it was called (error happened)
 * It also takes custom message as an optional third parameter
 * We need this to be in English for debug. Hence do not I18n.
 */
function showScriptError(errorObject, funcName, userMessage)
{
    var msg = "";

    if(errorObject == null || errorObject.name == null) {
        // no error object supplied
        if(funcName != null) {
            msg += "UnSpecified Error occured in function "+funcName; // No I18N
            if(userMessage != null) {
                msg += "\nMessage: "+userMessage; // No I18N
            }
        }
        else {
            msg += "UnSpecified Error occured "; // No I18N
        }
        alert(msg);
        return;
    }

    if(funcName != null) {
        msg += "Error in function "+funcName+"\n"; // No I18N
    }

    if(is_gecko) {
        msg += errorObject.name+" [Line:"+errorObject.lineNumber+"]: "+errorObject.message; // No I18N
    }
    else {
        msg += errorObject.name+": "+errorObject.message; // No I18N
    }

    if(userMessage != null) {
        msg += "\nMessage: "+userMessage; // No I18N
    }

    // TODO: a dialog element can be displayed instead of an alert
    alert(msg);
}

/**
 * This function will show a tooltip next to the element whose element has been passed.
 */
function showToolTip(toolTipText, elementID) {
  invokeProgressIndicator(elementID, toolTipText, 'completed', 'no', 'no'); // No I18N
}

// Used in Req Quick Create
function loadScript(url) {
    if (document.layers) {
        window.location.href = url;
    }
    else if (document.getElementById) {
        var script = document.createElement('script'); // No I18N
        script.defer = true;
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
}

/********************************/
/** Common methods start here. **/
/********************************/

/**
 * Adds a new Option at the last with the given values.
 */
function addOptionsToSelect(selectObj, text, value) {
    selectObj.options[selectObj.options.length] = new Option(text, value, true, false);
}

/**
 * Add a new Option to the container. Preferably a documentFragment to avoid browser reflows
 * A Lazy evaluator function for broswer specific code.
 * @params container - container DOM node
 * @params key - option value
 * @params val - option text
 * @params selected - {true, false} to specify wheter the option has to be pre-selected. Optional.
 * @params title - option's title attribute. Optional.
**/
function addNewOption(container, key, val, selected, title) {
    // SD-48459 : IE 10 renders the test inside the option tags multiple times ( in normal view ). works fine in compatability mode.
    // So instead of manually adding to dom, used jquery to add the option values.
    // attr() is removed from jquery so prop is used insted of it.
    if(selected) {
        jQuery(container).append(jQuery("<option>", {"value" : key, "text" : val, "title" : val})); // No I18N
        jQuery(container).find('option[value="'+key+'"]').prop('selected',true); // No I18N
    }
    else {
        jQuery(container).append(jQuery("<option>", {"value" : key, "text" : val, "title" : val})); // No I18N
    }
}


/**
 * This function will sort the select options list
 * given the ID of the select box or its reference
 * uses Prototype.js methods
 */
function sortSelectList(selectList) {
    selectList = $(selectList);
    var selOptions = $A(selectList.options);
    var keys = $A([]);
    var values = $A([]);
    var currentValue = "";
    if(selectList.selectedIndex > -1 && selectList.options[selectList.selectedIndex] != null) {
        currentValue =  selectList.options[selectList.selectedIndex].text;
    }
    selOptions.inject(values, function(arr, val, idx) {arr.push(val.text); return arr;} );
    selOptions.inject(keys, function(arr, val, idx) {arr.push(val.value); return arr;} );
    //console.debug("keys ", keys); console.debug("values ", values);
    var sortedValues =  values.clone();

    // The default javascript sort functionality is case sensitive which means all the lower case strings will be listed after all the upper case strings.
    // So writing a custom sort method wherein the values will be changed to uppercase internally, and then sorted. Changing the values to uppercase internally will not have effect on the case of the sorted list.
    sortedValues.sort(function(x,y){
      var a = String(x).toUpperCase();
      var b = String(y).toUpperCase();
      if (a > b)
         return 1
      if (a < b)
         return -1
      return 0;
    });

    // clear list
    selectList.innerHTML = '';
    //selectList.options.length=0;

    // reconstruct as sorted list
    for (i=0; i<sortedValues.size(); i++) {
        //selectList.options[selectList.options.length] = new Option( sortedValues[i], keys[values.indexOf(sortedValues[i])] );
        if(currentValue == sortedValues[i]) {
        addNewOption(selectList, keys[values.indexOf(sortedValues[i])],sortedValues[i],true );
    }
    else {
        addNewOption(selectList, keys[values.indexOf(sortedValues[i])],sortedValues[i] );
    }
    }
}

function toggleInfoAlert(message,showing_near_elem,show)
{
    if(show)
    {
        jQuery("#cmt-txt").text(message); // No I18N
        jQuery('#ConfirmAlert').show();
    }
    else
    {
        jQuery('#ConfirmAlert').hide();
    }
}


function locateClarificationsSection()
{
    document.getElementById("approval-conv-details").scrollIntoView({ behavior: 'smooth', block: 'nearest' }); //No I18N
}

function validateApprovalForm(formObj, isApproved, mandateApprovalComments,actionNameForMandateComments) {
	if(mandateApprovalComments && isEmpty(formObj.COMMENTS.value)){
		if("all"===actionNameForMandateComments || ("reject"===actionNameForMandateComments && !isApproved)){
			// showalert('failure', getMessageForKey("sdp.approval.empty.comment.error"),'isAutoHide=false,closeOnEscKey=yes,width=450,height=80');// No I18N                       
            var infoTobeShown = getMessageForKey("sdp.approval.empty.comment.error");  // No I18N
            toggleInfoAlert(infoTobeShown,formObj.COMMENTS,true);
	        formObj.COMMENTS.value = '';
	        formObj.COMMENTS.focus();
	        return false;
		}
    }
	if(formObj.COMMENTS.value.length>2000){
		var args = [];
		args[0] = getMessageForKey('common.comments'); //No I18N
		args[1] = 2000;
		var infoToBeShown = getMessageForKey('sdp.app.common.maxlength.characters',args);
		toggleInfoAlert(infoToBeShown,formObj.COMMENTS,true);
		formObj.COMMENTS.focus();
	    return false;
	}
	else{
	   toggleInfoAlert();
	   var submitForm = function()
	   {
	
    formObj.action.value = isApproved ? "Approve" : "Reject"; //NO I18N
    //Sd- 66764 Approval action taken multiple times when 'Accept' or 'Reject' clicked multiple times.
    formObj.approve.disabled="true";
    formObj.reject.disabled="true";
    formObj.submit();
    return true;
}

        if($req.details.request_info.approval_status && $req.details.request_info.approval_status.name == "Pending Clarification")            
        {
        	var message = getMessageForKey('api.approval.action.confirmation.msg'); // No I18N
            var title = getMessageForKey('api.approval.action.confirmation.title'); // No I18N
            showconfirm(true,'title=' + title + ', message=' + message + ', submitbutton=' + translate("common.proceed") + ', cancelbutton=' + translate("sdp.common.back") + ', closebutton=yes, closeOnEscKey=yes', function(save) { // No I18N
                if(save) {
                    return submitForm();
                }
            });
        }
        else
        {
            return submitForm();
        }
    }
    
}



function deleteApprovals(approvalId, woID, stageId, confirm_delete, message) {

    if(message == undefined) {
        message = getMessageForKey("sdp.approval.delete.confirm");
    }
    showconfirm(true,'title=' + getMessageForKey("sdp.request.approval.deleteapproval") + ', message=' + message + ', submitbutton=' + getMessageForKey("sdp.change.submission.yes") + ', cancelbutton=' + getMessageForKey("sdp.change.submission.no") + ', closebutton=yes, closeOnEscKey=yes', function(save) { // No I18N
        if(save) {
            deleteRequestApproval(approvalId, woID, stageId, confirm_delete);
        }
    },true);
}
function deleteRequestApproval(approvalId, woID, stageId, confirm_delete) {
    var dataParams = "mode=delete&approvalId="+approvalId+"&woID="+woID+"&stageId="+stageId;	//NO I18N
    if(confirm_delete) {
        dataParams += "&delete_confirm=true";	//NO I18N
    }
    jQuery.ajax({
        type: "POST",		//NO I18N
        url: "/ApprovalList.do",		//NO I18N
        data: dataParams,   //NO I18N
        success:function(resp){
            if(resp.status == "success") {
            	updateApprovalList();
            }else if(resp.status == "warning"){		//NO I18N
                deleteApprovals(approvalId, woID, stageId, true, resp.message);
            }
        }
    });
}
function updateApprovalList() {
    if(parent.req_details) {
        parent.$req.details.updateRequestTemplates("approvals"); //No I18N
    } else {
        changeRequestTab('approvalDetails');//No I18N
    }
}

function showDropMnu(menu)
    {
    if (menu.className=='mnuNormal')
    {
    menu.className='mnuActive';
    }
}
function hideDropMnu(menu)
    {
    if (menu.className=='mnuActive')
    {
    menu.className='mnuNormal';
    }
}


// SDF -35452 site id get in workorder page.
function siteDetails(value) {
        var url = '/setup/SiteDetails.jsp'; // NO I18n
        if(value!= null && value != undefined)
        {
                url  = url+"?SITEID="+ encodeURIComponent(value); //No I18N
        }
        showURLInDialog(url,'position=relative, title='+getMessageForKey("sdp.admin.organization.sitedetails")); // No I18N
}
 /**
   @description Appends the current timestamp to the url. Avoids GET url's from being cached .
 */
function appendTimestamp(url) {

       var tm=new Date().getTime();
       if(url.indexOf("?") > 0) {
           url = url + "&tm=";    // No i18n
       }
       else {
           url = url + "?tm=";    // No i18n
       }
       url = url + tm;
       return url;
}

// this function will be used to retrive the value inside a child tag <child>ChildValue</child>
function validateTagValue(childTag, tagName)
{
    var childValue = "";
    try
    {
        if(is_gecko) {
            // since Mozilla does not allow text node of more than 4K - 4096 bytes
            childValue = childTag.getElementsByTagName(tagName)[0].textContent;
        }

        if( childValue == null || childValue == 'null') {
            return "";
        }
    }
    catch(e)
    {
    }
    return childValue;
}


// prevValue attribute should be loaded with the element value...while edit it will exclude the previous value..
// before DB check...
function checkUniqueExists(attrName , element){

    var attrValue = element.value.trim();
    var preValue = parent.jQuery(element).attr('preValue');

    var ajax_id = new Array();
    ajax_id[0] = attrName;
    ajax_id[1] = element;
    ajax_id[2] = preValue;
    ajax_id[3] = attrValue;

    if(attrValue==preValue){
        return false;
    }

    var params = "action=checkUniqueExists&attrName="+encodeURIComponent(attrName)+"&attrValue="+encodeURIComponent(attrValue);// No I18N
    callCustomAjaxRequest('/SDCommonAction.do',params,checkUniqueExistsOnSuccess,checkUniqueExistsOnSuccess,ajax_id,null,"true");// No I18N


}
function checkUniqueExistsOnSuccess( requestObj, ajax_id )
{
    var alertList = {
            "ProjectRoleName":getMessageForKey('sdp.project.projectrole.rolenameexists'),// No I18N
            "TaskType":getMessageForKey('sdp.project.tasktype.tasktypenameexists'),// No I18N
            "ProjectType":getMessageForKey('sdp.project.tasktype.projecttypenameexists'),// No I18N
            "ProjectCode":getMessageForKey('sdp.project.projectcode.projectcodeexists'),// No I18N
            "ProjectStatus":getMessageForKey('sdp.project.projectstatus.projectstatusexists'),// No I18N
            "SolutionTopicName":getMessageForKey('sdp.solutions.newtopic.add.failure.duplicate'),// No I18N
            "ProjectFilterName":getMessageForKey('sdp.api.customfilter.name.exists')//NO I18N
        }
        if(isMSP)
	{
		alertList.SolutionTopicGroupName=getMessageForKey('sdp.msp.solutions.topicGroups.failure.duplicate');//NO I18N
	}

    var childTag = requestObj.responseXML.getElementsByTagName("result").item(0); // No I18N
    var value = validateTagValue(childTag, 'is_exists'); // No I18N

    if(value=='true'){
        window.is_unique=false;
        alert(alertList[ajax_id[0]]);

        ajax_id[1].focus();

        // in the add new form the preValue will be undefined..
        if(ajax_id[2]!=null){
            ajax_id[1].value = ajax_id[2];
        }else{
            ajax_id[1].value = '';
        }
    }else{
        window.is_unique=true;
    }
}

// In case of request, problem , solution and change description, the targets for the links if any need to be set to "_blank" so that they open in a new window. This is done by calling a function on document ready.
jQuery(document).ready(setTargetForLinks);


/**
 * Search all the 'a' tags within specific elements and set the target as blank. This method will be called on all page load. When the page does not have any such tag, then jquery will not throw any exceotion. The catch is just a precaution.
 */
function setTargetForLinks() {
    try {
        // for the main descriptions in all the modules
        jQuery(".textareadesc").find("a").attr("target","_blank");
        // for the conversations in the problem and change modules
        jQuery(".repliesbox").find("a").attr("target","_blank");
    }
    catch(ex) {
    }
}

function ashtmlString(str)
{
    return jQuery('<div/>').text(str).html();
}
function getHtmlForTemplate(templateId, data,encode) {
    var $popupDiv = jQuery('#' + templateId).clone();// No I18N
    var tpl = $popupDiv.removeAttr("id").wrap("<div></div>").parent().html(); // No I18N
    var html = tpl.replace(/\$(?:\{|%7B)(.*?)(?:\}|%7D)/g, function($1, $2) {
    //var html = tpl.replace(/\$(?:\{|%7B)(.*?)(?:\}|%7D)/g, function($1, $2) {
        if(encode ===true){
        return ($2 in data) ? ashtmlString(data[$2]) : '';
        }else{
        return ($2 in data) ? data[$2] : '';
        }
    });
    return html;
}

function showsdpMessage(messageText, msgType, timeOut){
    var index = 3; //default message type - info
    if(msgType == 'success'){
        index=0;
    }
    else if(msgType == 'failure'){
        index=1;
    }
    else if(msgType == 'warning'){
        index=2;
    }

    if(timeOut == "" || timeOut == undefined || timeOut == null){
        timeOut=5000;
    }
    var status_class = ["alert-greenicon-yes","alert-redicon-no","alert-warn-icon","alert-green-icon"];    //NO I18N
    var status_msgbox_Type = ["successbox","failurebox","warnbox","infobox"]; // No I18N
    var wd = parent.getContentWidth(messageText);
    parent.showOperationalStatus(messageText,status_class[index],null,status_msgbox_Type[index],wd, timeOut);
}
function validateEmailIds(formObj, restrictionType, isApprovalsForNextStage){
    var isValid = checkApprovalForm(formObj, isApprovalsForNextStage);
    var emailIds = "";
    if(jQuery('#TO_FIELD').val() != undefined){
        emailIds = jQuery('#TO_FIELD').val().replace(/\s/g, ""); // No I18N
    }
    var emailIdsArray = emailIds.split(",");
    var approversIds = "";
    var emailIdsToValidate = "";
    for(i=0; i<emailIdsArray.length; i++) {
        if(isNaN(emailIdsArray[i].trim())) {
            emailIdsToValidate = (emailIdsToValidate == "") ? emailIdsArray[i].trim() : emailIdsToValidate + "," + emailIdsArray[i].trim();
        }else {
            approversIds = (approversIds == "") ? emailIdsArray[i] : approversIds + "," + emailIdsArray[i];
        }
    }
    if(isValid && restrictionType == "anyone"){
        if(emailIdsToValidate != "") {
            var restrictedList="";
            if(isApprovalsForNextStage) {
                if($req.details.request_info.requester != undefined){
                    restrictedList=$req.details.request_info.requester.id;
                }
                if($req.details.request_info.on_behalf_of != undefined){
                    restrictedList=restrictedList+","+$req.details.request_info.on_behalf_of.id; // No I18N
                }
                if(jQuery('[name=loggedUserID]').val() != undefined){
                    restrictedList=restrictedList+","+jQuery('[name=loggedUserID]').val();
                }
            }
            else {
                if(window.opener.$req.details.request_info.requester != undefined){
                    restrictedList=window.opener.$req.details.request_info.requester.id;
                }
                if(window.opener.$req.details.request_info.on_behalf_of != undefined){
                    restrictedList=restrictedList+","+window.opener.$req.details.request_info.on_behalf_of.id; // No I18N
                }
                if(window.opener.jQuery('[name=loggedUserID]').val() != undefined){
                    restrictedList=restrictedList+","+window.opener.jQuery('[name=loggedUserID]').val();
                }
            }

             var Url = appendTimestamp('/servlet/SDAjaxServlet'); //No I18N
             var Data = {action: "approvalCheck", module: "Request", To:emailIdsToValidate, RestrictedApprovers:restrictedList}; //No I18N
             Data[getCSRFParamName()]=getCSRFParamValue();
             var tempAjax = jQuery.ajax({
                dataType: "json",//No I18N
                url: Url,
                type: 'post', //No I18N
                async:false,
                data: Data,
                success: function (resp) {
                    if("undefined" !== typeof resp.invalidEmailIds && resp.invalidEmailIds.size()>0){
                        jQuery('#invalidEmails').text(resp.invalidEmailIds);
                        var restrictionType='';
                        var selfApproval='';
                        if(resp.restrictionType != null){
                            if(resp.restrictionType == "anyone"){
                                restrictionType=getMessageForKey("sdp.approvalRestriction.norestriction");
                            }else if(resp.restrictionType == "sysusers"){ //No I18N
                                restrictionType=getMessageForKey("sdp.approvalRestriction.sysusersonly");
                            }else if(resp.restrictionType == "srapprovers"){ //No I18N
                                restrictionType=getMessageForKey("sdp.approvalRestriction.srapproversonly");
                            }
                            jQuery('#restrictionType').text(restrictionType);
                        }
                        if(resp.selfApprovalRestricted != null){
                            if(resp.selfApprovalRestricted == true){
                                selfApproval=getMessageForKey("sdp.admin.notificationrules.enabled");
                            }else if(resp.selfApprovalRestricted == false){
                                selfApproval=getMessageForKey("sdp.admin.robo.disabled");
                            }
                            jQuery('#selfApproval').text(selfApproval);
                        }
                        jQuery('#failureMsg').removeClass('hide');
                        isValid = false;
                    }
                    else{
                        isValid = true;
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('sorry an error has occured'+thrownError); //No I18N
                }
            });
        }
    }
    if(isValid && approversIds != "" && !isApprovalsForNextStage) {
        jQuery.ajax({
            dataType: "json",//No I18N
            url: appendTimestamp('/servlet/SDAjaxServlet'),//No I18N
            type: 'get', //No I18N
            async:false,
            data: {action: "checkForApproverAvailability", approverIds:approversIds}, //No i18n
            success: function (resp) {
                if(!resp.is_approver_available){
                    isValid = confirm(resp.unavailable_approvers_info);
                }
            }
        });
    }
    if(isValid && !isApprovalsForNextStage)
    {
    formObj.SUBMIT1.disabled=true;
    formObj.submit();
    }
    return isValid;
}

/*********************************************Floating Table header construct start**************************************************/

var resizeTimeoutWO;
var list_view_id;
function initTableHeaderConstruct(table_id){
    list_view_id = table_id;
    var tableclass = jQuery('#'+table_id); //No I18N

    if(tableclass.find('>thead').length === 0) {
        var tableh = tableclass.find('tr:first'); //No I18N
        var srchrow = tableclass.find('.searchRow');    //No I18N
        var tableHeader = jQuery(document.createElement("thead"));  //No I18N
        tableHeader.append(tableh);
        tableHeader.append(srchrow);
        tableclass.prepend(tableHeader);
    }

    /* If there is no requests found, the message will be put inside the Listview table */
    if(tableclass.siblings('table').length > 0) {
        tableclass.find('tbody:first').prepend(tableclass.siblings('table').find('tr:first').detach()); //No I18N
        tableclass.find('tbody:first > tr').addClass('tc');    //No I18N
        tableclass.siblings('table').remove();  //No I18N
    }

    tableclass.parent().css('overflow', 'hidden');  //No I18N
    tableclass.css({'display':'inline-block', 'overflow':'auto'});    //No I18N
    tableclass.find('thead:first').css({'display':'inline-table','position':'relative', 'top':'0px', 'left':'0px', 'width':'100%', 'box-shadow': 'none'});    //No I18N
    tableclass.find('tbody:first').css({'display':'inline-table', 'width':'100%'}); //No I18N
    tableclass.find('tbody:first > tr:last-child td').css('border-bottom', '1px solid #f1f1f1');    //No I18N
    tableclass.attr('data-id', tableclass.attr('id'));  //No I18N

    var tbodyObj = tableclass.find('tbody:first');  //No I18N
    var theadObj = tableclass.find('thead:first');    //No I18N
    tbodyObj.css({'transform':'translate3d(0, 0, 0)', 'margin-bottom': '40px'}); //No I18N
    theadObj.css({'transform':'translate3d(0, 0, 0)'}); //No I18N
    tableclass.off('scroll');    //No I18N
    tableclass.on('scroll', function(event) {    //No I18N
            var marginTop = tbodyObj.css('margin-top'); //No I18N
            if(tableclass.scrollTop() > 0) {
                var isSearchOpen = tableclass.find('.searchRow:visible').length > 0;    //No I18N
                theadObj.css({'position':'absolute', 'top':'0px', 'left':-tableclass.scrollLeft()+'px', 'z-index':'1', 'box-shadow': '#d8d8d8 1px 0px 3px 1px'}); //No I18N
                if(isSearchOpen){
                    if(marginTop !== '70px') {
                        tbodyObj.css('margin-top', '70px'); //No I18N
                    }
                } else if(marginTop !== '40px'){    //No I18N
                    tbodyObj.css('margin-top', '40px'); //No I18N
                }
            } else {
                if(theadObj.css('position') !== 'relative' || marginTop !== '0px') {
                    theadObj.css({'position':'relative', 'top':'0px', 'left':'0px', 'box-shadow': 'none'});    //No I18N
                    tbodyObj.css('margin-top', '0px');  //No I18N
                }
            }
    });

    /* Events to toggle row Highlight on open/close dialog for Group/Technician */
    var header_chkbox = tableclass.find('input[type="checkbox"]:first'); //No I18N
    header_chkbox.attr('data-handler', header_chkbox.attr('data-handler')+'; selectAllToggle(true);'); //No I18N
    tableclass.find('.headercheckbox input[type="checkbox"]').on('change', function(event) {
        selectAllToggle(true);
    });
    setTimeout(function() {
        responsiveListControls();
        adjustWOTableHeight();
        selectAllToggle(false,true);
    }, 100);
    jQuery(window).on('resize', function() {    //No I18N
        clearTimeout(resizeTimeoutWO);
        resizeTimeoutWO = setTimeout(function() {
            responsiveListControls();
            adjustWOTableHeight();
        }, 400);
    });
}

/* Binding Esc key press event to toggle the selected row for assign popup */
jQuery(document).on('keydown',function(event) {
    if (browser_ie) {
        var keyCode = window.event.keyCode;
    } else if (browser_nn4 || browser_nn6) {
        var keyCode = event.which;
    }
    if (keyCode == 27) {
        if(typeof removeRowHighlight === "function") {
            removeRowHighlight();
        }
    }
});

function responsiveListControls() {
    if(sdp_user.USERTYPE === "Technician") {
        if(jQuery(window).width() <= 1600) {
            //classic combined view switches
            jQuery('#listcontrols').find('#ls_listviewswitch, #ls_listviewswitch_combined').removeClass('hide').addClass('bs-noconflict').end().find('#listviewswitch').addClass('hide').removeClass('bs-noconflict');//No I18N
            jQuery('#listcontrols').find('[data-id=ls_listviewswitch]').find('#listviewswitch').removeClass('hide');
        } else {
            // SD-104423
            jQuery('#listcontrols').find('#ls_listviewswitch, #ls_listviewswitch_combined').addClass('hide').removeClass('bs-noconflict').end().find('#listviewswitch').removeClass('hide').addClass('bs-noconflict');//No I18N
        }
        jQuery('#listcontrols').find('[data-id=ls_listviewswitch], #ls_listviewswitch_combined').removeClass('hide');
    }
    handleResizeBtnVal(jQuery("#listcontrols")); // No I18N
}

function adjustWOTableHeight() {
    if(typeof list_view_id !== "undefined"){
        var tableclass = jQuery("#"+list_view_id);
        var paddingRight = window.externalframe ? 0 : 10;
        var paddingBottom = window.externalframe ? 0 : 20;
        var td_c_h = 0;
            if(jQuery('#header-placeholder').length == 0) {
            // SD-103955
            td_c_h = jQuery(window).height() - jQuery('#top-header').height() - paddingBottom ;  //No I18N
            } else {
            td_c_h = jQuery(window).height() - jQuery('#header-placeholder').height() - paddingBottom ;  //No I18N
            }
            if ( jQuery( 'body' ).css( 'direction' ) == 'rtl'){
                var right = (jQuery(window).width() + jQuery(window).scrollLeft()) - (jQuery('#listview').offset().left + jQuery('#listview').outerWidth(true));
                var table_w = jQuery(window).width()-right;
            } else if(jQuery('#listview').length){
                var table_w = jQuery(window).width()-jQuery('#listview').offset().left;
            }
            tableclass.css({'width': ( table_w - paddingRight ) + 'px'});   //No I18N
            setTimeout(function() {
                var viewhgt = 0;
                if(jQuery("#task-list-sidebar #task-navigation-view").length == 1) {
                    viewhgt = 34;
                }
                /** Reset the chat bar height in the External Frame features */
                window.externalframe ? is_chathgt = 0 : "";
                var cvtask=jQuery("#task-list-sidebar > .cv-task-bg").length > 0 ? jQuery("#task-list-sidebar > .cv-task-bg").outerHeight(true, true) : 0 ;
                //The above line added to avoid NaN issue
                var tskHeight = td_c_h - jQuery("#task-list-sidebar > .listcontrols").outerHeight(true, true) - cvtask - viewhgt - is_chathgt;
            var reqHeight = td_c_h - jQuery("#listcontrols").outerHeight(true, true) - is_chathgt + 4;
                jQuery(document).find('#taskview-sidebar-list').css({'max-height':tskHeight+'px', 'height':tskHeight+'px'}); //NO I18N
                tableclass.css({'max-height':reqHeight+'px', 'height':reqHeight+'px'});   //No I18N
                if(WOListActions.scrollBarPosition != -1) {
                    jQuery("#"+WOListActions.uniqueFormId+"_TABLE").scrollTop(WOListActions.scrollBarPosition);
                    WOListActions.scrollBarPosition = -1;
                }
            }, 500);
        var requests_div =jQ("#requests_list_div").length > 0 ? jQ("#requests_list_div") : jQ("#activities_div");   //No I18N
                requests_div.css({'width': table_w-10+'px'});   //No I18N
        responsiveListControls();
        }
}

function highLightRow(ele) {
    if(jQuery('.tableComponent').find('#highlighted-row').length > 0) {
        removeRowHighlight();
    }
    setTimeout(function() {
        var t_row = jQuery(ele).closest('tr'); //No I18N
        t_row.attr('id', 'highlighted-row');    //No I18N
        t_row.find('td') .css('background-color','#F0F5F9'); //No I18N
    },100);
}

function removeRowHighlight() {
    if(!jQuery('#highlighted-row input[type="checkbox"]').is(':checked')) {
      jQuery('#highlighted-row').find('td').each(function(index, el) {
         var color = jQuery(this).css('background-color', jQuery(this).data('bg')); //No I18N
     });
    }
    jQuery('#highlighted-row').removeAttr('id');    //No I18N
    // Removing the events which are bound already for pop up
    jQuery('.closeButton').off('click'); //No I18N
}

function selectAllToggle(didSelect,isFirst) {
    var selected_arr = [], non_selected_arr = [], i=0, j=0;
    jQuery('.headercheckbox input[type="checkbox"]').each(function() {  //No I18N
        var row = jQuery(this).parents('tr:first'); //No I18N
        if(jQuery(this).is(':checked')) {
            selected_arr[i]=row;
            i++;
        } else {
            jQuery('#RequestsView_CheckBox').find('input[type=checkbox]').prop('checked',false); //No I18N
            non_selected_arr[j]=row;
            j++;
        }
    });
    for(var i=0; i<selected_arr.length; i++) {
        selected_arr[i].find('> td').css('background-color','#f0f5f9'); //No I18N
    }
    for(var j=0; j<non_selected_arr.length; j++) {
         non_selected_arr[j].find('>td').each(
            function(index, el) {
                var color = jQuery(this).data('bg') || ''; //No I18N
                if(color !== ''){
                    isFirst = false;
                }
              jQuery(this).css('background-color',isFirst ? '': color); //No I18N
           }
        );
    }
    if(selected_arr.length > 0) {
        if(jQuery("#lc-pickup, #lc-assign").hasClass("hide")) {
            jQuery("#lc-pickup, #lc-assign").addClass("bs-noconflict").removeClass("hide");
            if(didSelect) {
                adjustWOTableHeight();
            }
        }
        if(jQuery('[data-id=lc-selection]').length >= 1) {/*for change pickup, assign, delete action*/
            var actionButtons = jQuery('[data-id=lc-selection]');
            actionButtons.addClass("bs-noconflict").removeClass("hide");
            if (navparamId === 'trashed_changes') {
                var buttonsToHide = ["PICKUP", "assignAction", "CHG_BULK_CLOSE"];//NO I18N
                for (var i = 0; i < actionButtons.length; i++) {
                    if (buttonsToHide.includes(actionButtons[i].id)) {
                        jQuery(actionButtons[i]).removeClass("bs-noconflict").addClass("hide");
                    }
                }
                jQuery('#CHG_RESTORE').addClass("bs-noconflict").removeClass("hide");
            }
        }
        jQuery(".list-icon-groups").addClass("hide");
    } else {
        if(!jQuery("#lc-pickup, #lc-assign").hasClass("hide")) {
            jQuery("#lc-pickup, #lc-assign").removeClass("bs-noconflict").addClass("hide");
            if(didSelect) {
                adjustWOTableHeight();
            }
        }
        if(jQuery('[data-id=lc-selection]').length >= 1) {/*for change pickup, assign, delete action*/
            jQuery('[data-id=lc-selection]').removeClass("bs-noconflict").addClass("hide");
            jQuery('#CHG_RESTORE').removeClass("bs-noconflict").addClass("hide");
        }
        jQuery(".list-icon-groups").removeClass("hide");
        if (typeof navparamId !== "undefined" && navparamId === 'trashed_changes') {
            var delButton = getMessageForKey('sdp.common.delete.permanent');//No I18N
            jQuery("#DELETE").attr("title", e_attr(delButton));
            jQuery('#changeCalendarView').removeClass("bs-noconflict").addClass("hide");
            jQuery('#addNewChange').removeClass("bs-noconflict").addClass("hide");
            jQuery('#trashBanner').addClass("bs-noconflict").removeClass("hide");
        }
        else {
            var trashButton = getMessageForKey('sdp.common.delete');//No I18N
            jQuery("#DELETE").attr("title", e_attr(trashButton))
            jQuery('#changeCalendarView').addClass("bs-noconflict").removeClass("hide");
            jQuery('#trashBanner').removeClass("bs-noconflict").addClass("hide");
        }
    }
}

function initiateResizeColumns(id){
    jQuery("#"+id+' thead tr:first th').each(function (i){
          var _this =jQuery(this), col_id = _this.attr('id');
          if(_this.text() || col_id.indexOf('HASLINKEDREQUEST') != -1){
              var resize_div = '<div data-id="' + col_id + '" class="rc_d_h" data-index='+i+'></div>';
                  _this.append(resize_div);
          }
    });
    jQuery("div.rc_d_h").draggable( //No I18N
    {
        axis: "x", //No I18N
        stop: function(event, ui) {
            var this_ele = jQuery(this);
            var oldPos = ui.originalPosition.left;
            var newPos = ui.position.left;
            jQuery(this).removeAttr('style');
            resetColumnSizes(id, newPos - oldPos, this_ele.data("index"), this_ele.data("id"),"updateResizedColumnWidth"); //No I18N
        }
    });
}
function updateResizedColumnWidth(table,index){

    var columnId=table.find('TR:first TH').eq(index-1).attr('id');//NO I18N
    var unique_viewname = table.closest(".listview[unique_id]").attr("unique_id");//NO I18N
    var columnName=columnId.split(unique_viewname+"_")[1];
    var width=jQuery('#'+columnId).width();//NO I18N
    
    var data={
        width: Math.round(width),
        name:columnName,
        viewName:unique_viewname
    };
    data={widthJson: (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data)};//NO I18N
    data[getCSRFParamName()] = getCSRFParamValue();

    jQuery.post('/servlet/HdClientUtilServlet?command=updateColumnWidth',data);//NO I18N
    jQuery(window).trigger('resize');
}



/*********************************************Floating Table header construct End**************************************************/
function resetColumnSizes(tableId, change, columnIndex, colId, callback) { //To resize all the rows
    /*Setting width to Resized header and columns*/
    var table = jQuery('table #' + tableId);
    var myWidth = table.find('thead tr th').get(columnIndex).offsetWidth; //No I18N
    var direction = jQuery("body").css("direction").toLowerCase(); //NO I18N
    var newWidth = "";
    if(direction == "rtl"){
        newWidth = (myWidth - change);
    }else{
        newWidth = (myWidth + change);
    }
    if (newWidth < 31) {
        newWidth = 31; //Setting minimum width value as '31'
    }

    var head_tr = table.find('thead TR:first'); //No I18N
    head_tr.find('TH').eq(columnIndex).css('width', newWidth + 'px').find('>div.d_w').css('width', newWidth + 'px'); //No I18N
    table.find('.searchRow td').eq(columnIndex).css('width', newWidth + 'px').find('>div').css('width', newWidth + 'px'); //No I18N

    var body_ele = table.find('tbody');

    jQuery(body_ele).children().each(function() {
        jQuery(this).children().eq(columnIndex).css('width', newWidth + 'px').find('>div').css('width', newWidth + 'px'); //No I18N
    });
    if(typeof callback == "string"){
        parent[callback](table,columnIndex+1);
    }
}

/* Search codes start here*/
var search_widget = {

  init:function(params){
    var param = params;
    var templates=$slc.getServices("ssp");  //NO I18N
    if(!templates.service_category){
        templates=templates.responseJSON;
    }
    var template_data=  JSON.parse(sdpToJSON(templates.service_category));
    //checking if its service or incident and return their values only
    if(param.length == 1 && (param[0] == "service" || param[0] == "incident") ){
      var tp = tp2 =template_data;
      jQuery.each(tp,function(index,v){
        for(var i=v.templates.length - 1;i >=0;i--){
          if(!v.templates[i].is_service_template && param[0] == "service"){
            tp2[index].templates.splice(i,1);
          }
          else if(v.templates[i].is_service_template && param[0] == "incident"){
            tp2[index].templates.splice(i,1);
          }
        }
      })
      template_data = tp2;
    }
    search_widget.initializeTemplateSearch(template_data,param);
  },
  //Intializing the template search
  initializeTemplateSearch:function(template_data) {
    var $search = jQuery(".ssp-search");
    var $search_input = jQuery("#search-input");
    if($search.length === 0) {
        $search = $search_input.parent();
    }
    template_data = jQuery.map(template_data, function(obj) {
      obj.text = obj.text || obj.name;
      obj.children = obj.children || jQuery.map(obj.templates, function(children) {
        children.text = children.text || children.name;
        if(children.is_service_template) {
          children.parent_template = obj.id;
        }
        if(children.name) {
          delete children.name;
        }
        if(!isNaN(children.id)) {
          children.id = parseInt(children.id);
        }
        return children;
      });

      if(obj.name) {
        delete obj.name;
      }
      if(obj.templates) {
        delete obj.templates;
      }
      delete obj.id;  /* removing the id for making the heading not selectable */
      return obj;
    })
  $search_widget = jQuery("<input>", {"type":'text'});
  $search.append($search_widget);
  $search_widget.select2({
    data: template_data,
    allowClear: true,
    formatNoMatches: translate("common.no.match.found"), // No I18N
    containerCssClass:'hide fw', //NO I18N
    formatResult: function(data, container, escapeFn) {
      setTimeout(function(){ initTooltip('.select2-results'); }, 300);
      return "<div rel='uitooltip' title ='" + e_html(e_html(data.description)) + "'>" + e_html(data.text) + "</div>";
    },
    matcher: function(term, text, option) {
        if(text.toUpperCase().indexOf(term.toUpperCase())>=0){
            return true;
        }
        if(option.description != null){
            if(option.description.toUpperCase().indexOf(term.toUpperCase())>=0){
                return true;
            }
        }
    }
  }).on("change", function(event) {
    var isModule="",getparams,selected_data,from;
    getparams=$slc.getParseParams(window.location.search);
    selected_data = jQuery(this).select2("data"); //NO I18N
    jQuery(this).select2('val','')//Clearing selected value in select2 hence it can be clicked again to open form page again.//NO i18N
    if(!getparams.view){
      if(selected_data) {
        from = window.location.pathname;
        from = from.includes("home") ? "HomePage" : from.slice(1,from.length-3); //NO I18N
        if(getparams.module){
          isModule="&module="+e_html(getparams.module[0]); //NO I18N
        }
          var isAsset=""; //NO I18N
          if($slc.asset_id!="" && $slc.asset_id!="null"){
              isAsset="&assetId="+$slc.asset_id; //NO I18N
          }
          if(selected_data.is_service_template) {
              var url = "/WorkOrder.do?woMode=newWO&from="+e_html(from)+isModule+"&reqTemplate="+selected_data.id+"&requestServiceId="+selected_data.parent_template;//no i18n
			  if(window.externalframe) {
                window.open(url, '_blank', 'noopener,noreferer');
                return false;
			  }
              parent.$spa.navigate(url,"requests","requests-new"); // NO I18N
          }
          else {
              var url = "/WorkOrder.do?woMode=newWO&from="+e_html(from)+isModule+"&reqTemplate="+selected_data.id+isAsset;//no i18n
			  if(window.externalframe) {
                window.open(url, '_blank', 'noopener,noreferer');
                return false;
			  }
              parent.$spa.navigate(url,"requests","requests-new"); // NO I18N
          }

      }
    }

  }).on("select2-close", function (e)
    {
      jQuery(window).off('blur.templateSelection');//Select2 not closed when clicked out of iframe, Hence added blur event for window and removing it on close. //NO i18N
      $search.find(".select2-container").addClass('hide');
      $search_input.removeClass('hide');
      jQuery(".zc-pb-search-btn,.select2-choice").removeClass('hide'); //No I18N
      $search.find(".input-group-addon").removeClass('hide');
      e_html(window.location.search).indexOf("admin") != -1 ? jQuery(".select2-search-choice-close").trigger('click') : "";
  }).on('select2-open', function () {
    
    jQuery(".select2-active").removeClass("select2-active");//no i18n
    let isAdvancedSSP = jQuery(".zc-pb-search-inputfld").length > 0 ? true : false;
    jQuery(".select2-drop-active").css('margin-top', isAdvancedSSP ? '-42px' : '-50px'); //No I18N
     
      jQuery('.select2-results').on('mouseup', function (event) {//no i18n
        if (event.which == 3 || event.which == 2) {
          event.preventDefault();
          jQuery(this).find('.select2-result').removeClass("select2-result");//no i18n
        } else if (event.which == 1) {
          jQuery(this).find('.select2-result').addClass("select2-result");//no i18n
        }
      });
      jQuery(window).on('blur.templateSelection',function(event){//Select2 not closed when clicked out of iframe, Hence added blur event for window and removing it on close.
         $search_widget.select2('close');//Closing select2 //NO i18N
      });
  });
  $search.find(".select2-container").width($search.width()).end().find('.select2-input,.select2-container').height($search.height());
  /**
   * SD - 119958
   */
  jQuery("#search-input").on('focus', function (event) {
    $search.find(".select2-container").removeClass('hide');//no i18n
    $search_input.addClass('hide');
    $search.find(".input-group-addon").addClass('hide'); //No I18N
    jQuery(".zc-pb-search-btn,.select2-choice").addClass('hide'); //No I18N
    search_widget.select2_search($search_widget);
  });
    $search.find("span.input-group-addon").off("click.searchSlider").on('click.searchSlider', function (event) { //No I18N
        $home_page.ssp.live.loadSearchResult();
    });
  },
  select2_search:function($el) {
    $el.select2('open'); //No i18n
  }
}

/* Release Notification rules*/
function checkReleaseNotifications(formObj) {
    invokeProgressIndicator(null, "sdp.common.processing"); // No I18N
    formObj.submit();
}

function openNewChangeslider(entityName, entityId, childWindow){
	childWindow.close();
	$previewComponent.load('/ui/changes?mode=add&from='+entityName+'&associatedEntityId='+entityId+'&externalframe=true',translate('sdp.change.listview.newchange'),'75%',null, null, 'newchange_popup'); //NO I18N

}

