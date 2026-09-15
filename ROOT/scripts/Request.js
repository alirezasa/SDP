/* $Id$ */
/**
* Request related scripts should be added here.
*/
/**
 * This is the Request global Object that will provide
 * all request related functions its NameSpace
 * Functions with similar name to other module functions
 * can use this NameSpace for unique Identification.
 *
 * Function calling nomenclature will change to Request.functionName()
 * All major request functions should be defined within this object.
**/
var Request = {
		selectedTemplateId : null,
		currentTemplateId: null,
        	previousStatusId : null,
        stageOneApprovers : [],
        approverAllowedValues : [],
        loadApproverFieldStatically : true,
        show_cost_for_user : false,
        workOrderId: null,
        cancelStatusId: null,
        isCancelFlagRaised: false,
        completedStatusIds: []
};
/*####################################################*/
var foundRequestIds=new Array();
var currencySymbol = encodeHTML(parent.sdp_app.CURRENCY_SYMBOL);
function confirmIncompleteStatusChange(select, incomplete, existingId){
    var res = true;
    if(incomplete != 'false'){
        var res = confirm(getMessageForKey("imcancel"));//No I18N
    }
    var selectedId = parseInt(select.value);
    if(Request.isCancelFlagRaised && selectedId != Request.cancelStatusId && Request.completedStatusIds.indexOf(selectedId) != -1) {
        var res = confirm(getMessageForKey("request.cancel.requested.status.change.warning"));//No I18N
    }
    if(!res){
        if(jQuery(select).data("select2") == undefined) {
            //From reply status change.
            select.value = "-1";
        }else {
            select.value = existingId;
            jQuery(select).select2('val',existingId);//No I18N
        }
    }
    return res;
}
//placeholder handling for status comment dialog boxes.
function hidePlaceHolder()
{
jQuery("#_DIALOG_LAYER #statusCommentText").hide();
}
function showPlaceholder(comment)
{
if(comment!=null && trim(comment)=="")
{
jQuery("#_DIALOG_LAYER #statusCommentText").show();
}
}
function hidePlaceHolderLabel(textAreaId)
{
jQuery("#_DIALOG_LAYER #"+textAreaId).trigger('focus');
}
//placeholder handling for stop/start timer pop up in Actions menu starts
function checkDesc()
{
comment=document.getElementById("statusCommentDesc");
if(comment!=null && trim(comment.value)=='')
{
alert(getMessageForKey("sdp.request.statuschange.addcomment"))
comment.focus();
return false;
}
}
function hideLabel()
{
if(document.getElementById("statusCommentDesc")!=null)
{
jQuery("#statusCommentDesc").trigger('focus');
}
}
function hideLabelOnFocus()
{
jQuery("#statusCommentText").hide();
}
function showLabelOnBlur(comment)
{
if(comment!=null && trim(comment)=='')
{
jQuery("#statusCommentText").show();
}
}
//@statusid - existing statusid
//to set the existing status id if cancel or close operation is performed in close dialog box.when status comment is mandatory.
function hideClosureCodeDetails(statusid){
     if(statusid!=null || statusid!=undefined){
        if(confirm(getMessageForKey("sdp.request.statuschange.cancel.alert"))==true){
        setPrevStatusId(statusid); //No I18N
        closeDialog();
    }
    else{
    jQuery("#_DIALOG_LAYER #closeCommentText").trigger('focus');
        return;
        }
    }
    //remove inputs added to the closureCodePlaceHolder div
    if($('closureCodePlaceHolder')){
        $('closureCodePlaceHolder').innerHTML = "";
    }
    if($('closureCodePlaceHolder_RES')){
        $('closureCodePlaceHolder_RES').innerHTML = "";
    }
    if($('closureCodePlaceHolder_GEDIT')){
        $('closureCodePlaceHolder_GEDIT').innerHTML = "";
    }
}
// To set previous status id if cancel or close operation is performed in onhold pop up when status comment is mandatory.
function setPreviousStatus(prevStatusID)
{
    if((document.getElementById("fromSpotEdit")!=null && document.getElementById("fromSpotEdit").value=='true') || (document.getElementById("EditComment")!=null && document.getElementById("EditComment").value=='true'))
    {
        initiateCopy();
        return;
    }
    if(confirm(getMessageForKey("sdp.request.statuschange.cancel.alert"))==true)
    {
       setPrevStatusId(prevStatusID);
       initiateCopy();
   }
   else
   {
     jQuery("#_DIALOG_LAYER #onHoldComments").trigger('focus');
   }
}
//to set existing status id if cancel or close operation is performed when status comment is mandatory.
function setPrevStatusId(prevStatusID)
{
    if(document.getElementById("woStatus_Id")!=null) //woStatus_id will exist only in resolution edit of request
    {
        document.getElementById("woStatus_Id").value=prevStatusID;
        jQuery('#woStatus_Id').select2('val',prevStatusID);//No I18N
    }
    else if(document.getElementById("STATUSID")!=null) // STATUSID will exist in global edit of request
    {
        document.getElementById("STATUSID").value=prevStatusID;
        jQuery('#STATUSID').select2('val',prevStatusID);//No I18N
    }
    else if(document.getElementById("Inline_STATUSID")!=null) // Inline_statusId will exist in inline edit of request
    {
        document.getElementById("Inline_STATUSID").value=prevStatusID;
        jQuery('#Inline_STATUSID').select2('val',prevStatusID);//No I18N
    }
}

function checkCloseAccept(form, box) {
     if(arguments.length == 0) {
        var html_src = $('wotoClose').innerHTML; // No I18N
        showDialog(html_src, "position=absolute,top=200,left=300, title=" + getMessageForKey("sdp.requests.viewrequest.closerequest")); // No I18N
    }
    else {
        if(!checkForRowSelection(form, box)) {
            alert(getMessageForKey('sdp.requests.listview.close.choose'));
            return false;
        }
        var selBox = $('woListBox@@@'); // No I18N
        selBox.options.length=0;
        var idx = 0;
        var cbArr = document.getElementsByName('checkbox'); // No I18N
        for(i=0; i<cbArr.length; i++){
            var cb = cbArr[i];
            if(cb.checked == true) {
                var val = cb.value;
                selBox.options[idx] = new Option(val, val, true, true);
                //selBox.options[idx].selected =true;       // for IE
                idx++;
            }
        }
        var html_src = $('wostoclose').innerHTML; // No I18N
        html_src = html_src.replace(/@@@/g, ''); // No I18N
        //alert(html_src);
        showDialog(html_src, "position=relative, title=" + getMessageForKey("sdp.requests.viewrequest.closerequest")); // No I18N
    }
}
//status comment are validated and if comment is not empty means additionaParams are added with form action and then the form is submited.
    function checkStatusComment(form,additionalParams)
{
    divClear("statusChangeComment");// NO I18N
   var comment=form.statusChangeComment;
   if(comment!=null && trim(comment.value)=="")
        {
            alert(getMessageForKey("sdp.request.statuschange.addcomment"));
            comment.focus();
            return false;
        }
        else
            {

                 if(document.getElementById("resStatusComment")!=null)
                     {
                        document.getElementById("resStatusComment").value=comment.value;
                     }
                else if( document.getElementById("statusChangeComment")!=null)
                {
                    document.getElementById("statusChangeComment").value=comment.value;
                }
                if(additionalParams!=null && additionalParams!=undefined)
                    {
                        form.action=form.action+additionalParams;
                        form.submit();
                    }
              closeDialog();
            }
}
//checkcmn return true /false if true means the status comments are mandated and comments are checked.
function submitCloseAccepted(form, additionalParams,checkcmnt) {
    if(checkcmnt==true || checkcmnt=='true' || checkcmnt=="true")
    {
      var comment=form.requestclosurecomment;
      var reqCloseComment=form.closeComment;
         if(comment!=null && trim(comment.value)=="")
          {
              alert(getMessageForKey("sdp.request.statuschange.close.addcomment"));
              form.requestclosurecomment.focus();
              return;
          }
          else if(comment==null && reqCloseComment!=null && trim(reqCloseComment.value)=="" )
              {
               alert(getMessageForKey("sdp.request.statuschange.close.addcomment"));
              reqCloseComment.focus();
              return;
              }
    }
    form.action = form.action + additionalParams;

    var selectElement = $('woListBox'); // No I18N
    if(selectElement) {
        for(i = 0; i < selectElement.options.length; i++) {
            selectElement.options[i].selected = true;
        }
    }
    // when a request is closed from the details page, the state data will not be available. It will be present only from the list view. Hence a null check is added.
    if(parent['stateData'] != null) {
        if(parent.stateData[parent.getPortalViewName('RequestsView')] != null) {
            handleStateForForm(form);
        }
    }
    form.submit(handler());
    return true;
}
function checkWOSelection(form, box, additionalParams) {
   if(!checkForRowSelection(form, box)) {
        if(additionalParams!=null && additionalParams.substring(13,17) == "pick") {
            alert(getMessageForKey("sdp.requests.listview.pickup.choose"));
        }
        else if(additionalParams!=null && additionalParams.substring(13,17) == "Clos") {
            alert(getMessageForKey("sdp.requests.listview.close.choose"));
        }
        else{
            alert(getMessageForKey("sdp.requests.listview.pickup.choose"));
        }
        return false;
    }
    var action1 = form.action;
    if(additionalParams !=null && additionalParams != "pickFromConflict") //No I18N:this additionalParams of pickFromConflict will be set from the WorkOrderPickUpConflict.jsp file while submiting the conflict request.
    {
        if(!form.action.includes('?')){
            form.action = form.action + "?" + additionalParams;
        }else{
            form.action = form.action + "&" + additionalParams;
        }
    }
    else
    {
        form.action = form.action;
    }
    var parentView = document.getElementById("parentView");
    if(parentView != undefined)
    {
        form.action="/WOAdvListView.do?requestViewChanged=true&"+ additionalParams;
    }
    jQuery('input[name=mergeParent]').remove();
    var addpar = additionalParams.substring(13,17);
    if(additionalParams!=null && addpar == "Pick") //No I18N
    {
        form.technician.value = "0"; //setting the assign dropdown to select-list.
        form.target = "SDPHeaderFrame"; //No I18N: Inorder to load the conflict requests in an iframe setting the target with SDPHeaderFrame. We have used the same existing headerframe instead of creating a new one.
        form.method = "post"; // NO I18N
        form.submit(handler());
        form.action = action1;
        return false;
    }
    else
    {
        handleStateForForm(form);
        form.submit(handler());
        return true;
    }
}

function formatMergeRequestList(state) {
    if (state.css == 'service') {
        return "<div title='" + getMessageForKey("sdp.home.ssp.templates.tooltip.servicerequest") + "'><span class='req-sprite service-req-icon pl5 vmiddle'></span>" + e_html(state.text) +"</div>";
    }
    else if (state.css == 'incident') {
        return "<div title='" + getMessageForKey("sdp.requests.view.incidentrequest")+ "'><span class='req-sprite incident-req-icon pl5 vmiddle'></span>" + e_html(state.text) +"</div>";
    }
    else {
        return "<div>" + state.text + "</div>";
    }
}


// to check if atlease one check box is selected or not..
function checkSelectionForDelink(thisForm, checkboxname)
{
    if(checkCheckboxSelection(thisForm, checkboxname, "sdp.requests.view.linkedfrom.removealert")){
        thisForm.removeLink.value='Remove Link'; // No I18N
        return true;
    }
    event.preventDefault();
    return false;
}
// to remove link between requests..  invoked from child request details page..
function detachFromRequestLink(workorderId, parentId)
{
    var url = "/RemoveRequestLink.do?childId="+encodeURIComponent(workorderId)+ "&parentId="+encodeURIComponent(parentId)+"&removeLink=Remove Link&fromChild=true"; // No I18N
    jQuery.ajax({
        url: url,
        type: "POST" // No I18N
    }).always(function(data, textStatus, jqXHR) {
        $req.details.updateRequestTemplates("link_requests");   // No I18N
        /** since we don't know whether the ajax request has detached the link successfully or not. So after fetching the request data, we need to check from that data */
        if($req.details.request_info.linked_to_request) {
            showalert("failure", getMessageForKey("request.unlink.failure"), "isAutoHide=false");   // No I18N
        } else {
            showalert("success", getMessageForKey("request.unlink.success"), "isAutoHide=true");    // No I18N
        }
    });
// SD-40538 : Because of issue in FF4,Code to reload the parent changed from Request.js to RemoveRequestLinkAction.java
//parent.window.location.href="/WorkOrder.do?woMode=viewWO&woID=" + workorderId; // No I18N
}
// check if the search string contains any value
function checkSearchText(element, errorMessage)
{
    var str = element.value;
    if(str == null || str == "" || str =="/")
    {
        alert(getMessageForKey(errorMessage));
        element.focus();
        return false;
    }
    return true;
}
//Function to focus search text box
function focSearchText(searchText)
{
    if(searchText.value == getMessageForKey("sdp.leftpanel.search.keyword"))
        {
        searchText.value = '';
        }
        else if(searchText.value == '')
        {
        searchText.value = getMessageForKey("sdp.leftpanel.search.keyword");
        }
}
// on select view change, empty the search text entry
function emptySearchStr(form)
{
    form.searchText.value = "";// No I18N
    form.submit();
}
//Function to associate dependent requests
function associateDepRequests(woId, reqDependencyGrpLimit, reqDepCount) {
    var elements = document.DependencyReqForm.elements;
    var query = "";
    var requestcount = 0;
    for(var i = 0; i < elements.length; i++) {
        var ele = elements[i];
        if(ele.type == "checkbox" && ele.name == "checkbox") {
            if(ele.checked == true) {
                requestcount = requestcount + 1;
                query = query.concat("DepWorkorderId=" + encodeURIComponent(ele.value) + "&"); // No I18N
            }
        }
    }
    if(query == "") {
        alert(getMessageForKey("sdp.requests.listview.dependency.choose"));
        return;
    }
    if (requestcount > 0)
    {
        var str = reqDepCount; // NO I18N
        str = str.substring(1,str.length-1);
        requestcount = requestcount  + parseInt(str) + 1;
        var depGroupLimit = parseInt(reqDependencyGrpLimit); // NO I18N
        if(requestcount > depGroupLimit)
        {
            alert(getMessageForKey("sdp.requests.listview.dependency.limit") + ' ' + reqDependencyGrpLimit); // NO I18N
            return;
        }
    }
    var form = document.getElementById('assoDepReqForm');
    form.action = form.action + "Associate=true&" + query;
    form.submit();
}

// check if atleast one of the check box is selected
function checkCheckboxSelection(form, checkboxname, errorMessage)
{
    isSelected = false;
    for(var i=0; i<form.elements.length; i++)
    {
        if(form.elements[i].name == checkboxname)
        {
            if(form.elements[i].checked)
            {
                isSelected = true;
            }
        }
    }
    if(!isSelected)
    {
        alert(getMessageForKey(errorMessage));  // No I18N
    }
    return isSelected;
}
function validateWOAssign(thisForm, module,event) {
    if(thisForm.getAttribute('module') && thisForm.getAttribute('module')=='Problem'){
        event.preventDefault();
        $problemGlobal.problemsBulkOperation('ASSIGN',thisForm,'#TechList1');
        var problems=getSelectedCheckBoxes(thisForm);
        var dateObj = parent.document.getElementsByTagName("Center");
		for(var i=0; i<dateObj.length; i++) {
			var obj = dateObj[i]
			var eleId = obj.id;
			var itemId = obj.getAttribute("itemid");
			if(eleId.indexOf("_Prb") >= 0 && problems.contains(itemId)) {
				obj.setAttribute("reassigned", "true");
			}
		}
        parent.loadCalendarForTech(thisForm.currtech.value);
        parent.constructDayList('Problem', null, false); //NO I18N
        return;
    }
    if(thisForm.technician.value=="0") {
        if(module != null && module == "Calendar") {
            alert(getMessageForKey("sdp.calendar.viewrequest.jserror1"));
        }
        else {
            alert(getMessageForKey("sdp.requests.viewrequest.jserror1"));
        }
        thisForm.technician.focus();
        return false;
    }
    if(!checkForRowSelection(thisForm,'checkbox')) {
        if(module != null && module == "Calendar") {
            alert(getMessageForKey("sdp.calendar.viewrequest.jserror2"));
        }
        else {
            alert(getMessageForKey("sdp.requests.listview.assign.choose"));
        }
        return false;
    }
    var objs = thisForm.elements;
    var action1 = thisForm.action;
    var url = "";
    for(var i=0; i<objs.length; i++) {
        var ele = objs[i];
        if(ele.name == 'checkbox') {
            var attr = ele.getAttribute('module');
            if(ele.checked) {
                if(attr == "Request") {
                    url = url + "&woId=" + encodeURIComponent(ele.value); // No I18N
                }
                else if(attr == "Change") {
                    url = url + "&CHANGEID=" + encodeURIComponent(ele.value); // No I18N
                }
                else if(attr == "Task") {
                    url = url + "&TASKID=" + encodeURIComponent(ele.value); // No I18N
                }
                else if(attr == "Reminder") {
                    url = url + "&remId=" + encodeURIComponent(ele.value); // No I18N
                }
            }
        }
    }
    thisForm.action = thisForm.action + url;
    //added in order to pass go parameter while assigning the tech to req from bulk edit.
    // if(thisForm.go){
    //     thisForm.go.checked=true;
    // }
    if(module == "Request")
    {
        thisForm.target = "SDPHeaderFrame";
        thisForm.method = "post"; // NO I18N
    }
    if(!thisForm.action.includes('?')){
        thisForm.action = thisForm.action + '?reqOperation=Assign' ;
    }else{
        thisForm.action = thisForm.action + '&reqOperation=Assign' ;
    }
    jQuery('input[name=mergeParent]').remove();
    var csrfElement = document.createElement("input");
    csrfElement.setAttribute("type","hidden");

    csrfElement.setAttribute("name", getCSRFParamName());

    csrfElement.setAttribute("value", getCSRFParamValue());
    thisForm.appendChild(csrfElement);
    thisForm.submit(WOHandler());
    thisForm.action = action1;
    if(module == "Request")//this is important to set the selected technician in the assign dropdown. Earlier the whole request listview page will get refreshed. Now it is not the case. Hence need to reset them otherwise the selection will be retained.If retained and perform pickup this selected technician is getting assigned instead of pickup.
    {
        if(jQuery('#isTechStatusEnabled').val() == "true"){
             jQuery('[name=technician]').select2('val',0); //No I18N
        }else{
            thisForm.technician.value="0";
        }

    }
}
function validateWOBulkEdit(thisForm,box,serReqIds,viewName) {
    var hasSerReq = false;
    var parentView = "";
    if(!checkForRowSelection(thisForm,'checkbox')) {
        alert(getMessageForKey("sdp.requests.listview.edit.choose"));
        return false;
    }
    if(!hasServiceRequest(thisForm, box,serReqIds,"edit")){
        hasSerReq = true;
        if(viewName!="Incident_Requests") {
            alert(getMessageForKey("sdp.requests.servicerequests.editerror")); //No I18N
        }
    }
    checkBoxCompName = 'checkbox'; // No I18N
    reqIDs = new Array();
    for(var i=0; i<thisForm.elements.length; i++) {
        if(thisForm.elements[i].name == checkBoxCompName) {
            if(thisForm.elements[i].checked) {
                var reqID = thisForm.elements[i].value;
                var tempID = thisForm.elements[i].getAttribute("templateid");
                reqIDs.push(reqID+"--"+tempID); // No I18N
            }
        }
    }
    reqIDs.sort();
    var reqList = reqIDs.join(","); // No I18N
    if(thisForm.id === "advSearchListForm")
    {
        parentView = "advancedsearch"; // No I18N
    }
    NewWindow('BulkEditRequest.do?reqIDs=' + reqList+"&hasSerReq=" +encodeURIComponent(hasSerReq)+"&globalView="+ encodeURIComponent(viewName) +"&parentView="+encodeURIComponent(parentView),'BulkEdit','875','750','yes','center'); // No I18N
}
function showHideTimeSpent() {
    if(isMSPOrSCP){
        showMSPTimeSpent();
    }else{
if(document.addResolutionForm  && document.addResolutionForm.timeSpent && document.addResolutionForm.timeSpent.checked) {
        if(jQuery("#RequestResolutionWorkLogDiv").parent("[name='WorkLogForm']").length === 0) {
            jQuery("#RequestResolutionWorkLogDiv").wrap("<form name='WorkLogForm'></form>");
        }
        var timeSpentParams = 'associatedEntity='+encodeURIComponent(jQuery('#Timespent_assocentity').val());        //NO I18N
        timeSpentParams += '&associatedEntityID='+encodeURIComponent(jQuery('#Timespent_associatedEntityID').val());//NO I18N
        timeSpentParams += '&from='+encodeURIComponent(jQuery('#Timespent_from').val());                            //NO I18N
        timeSpentParams += '&scopeid='+encodeURIComponent(jQuery('#Timespent_scopeid').val());                        //NO I18N
        timeSpentParams += '&module='+encodeURIComponent(jQuery('#Timespent_module').val());                        //NO I18N

        window.frames.SDPHeaderFrame.location.href = '/common/LoadRequestResolutionWorklog.jsp?_='+new Date().getTime()+'&SUBREQUEST=true&'+timeSpentParams;
    }
    else {
        parent.document.getElementById('RequestResolutionWorkLogDiv').innerHTML = '';
    }
    }
}
function isWOResolutionEmpty() {
    //var string=parent["editor"].getHTML();
    return isHTMLAreaEmpty("resolution_editor"); // No I18N
}
function isHTMLAreaEmpty(htmlEditorName) {
    var string  = parent[htmlEditorName].getHTML();
    return isEmptyHTMLString(string);
    }
function isEmptyHTMLString(string)
{
    string      = string.replace(/<br \/>/g,"\n"); // No I18N
    string      = string.replace(/<br>/g,"\n"); // No I18N
    string      = string.replace(/(<div[^>]+?>|<div>|<\/div>)/g, ""); // No I18N
    string      = string.replace(/(<p[^>]+?>|<p>|<\/p>)/g, ""); // No I18N
    //string    = string.replace(/(<([^>]+)>)/g,""); // No I18N
    //SD-100468 - Resolution Content UI Check
    string      = string.replace(/(<span[^>]+?>|<span>|<\/span>)/g, ""); // No I18N
    string      = string.replace(/(<i>|<\/i>)/g, ""); // No I18N
    string      = string.replace(/(<u>|<\/u>)/g, ""); // No I18N
    string      = string.replace(/(<b>|<\/b>)/g, ""); // No I18N
    string      = string.replace(/(<blockquote>|<\/blockquote>)/g, ""); // No I18N
    string      = string.replace(/(<sub>|<\/sub>)/g, ""); // No I18N
    string      = string.replace(/(<sup>|<\/sup>)/g, ""); // No I18N
    string      = string.replace(/\u200B/g, ""); // No I18N
    string      = string.replace(/&lt;/g,"<"); // No I18N
    string      = string.replace(/&gt;/g,">"); // No I18N
    string      = string.replace(/&nbsp;/g,""); // No I18N
    string      = string.replace(/^\s*|\s*$/g, "");  // No I18N
    if(string == ""){
        return true;
    }
    else {
        return false;
    }
}

function validateWOResSave() {
    window.onbeforeunload=null;
    var resolutionMand=true;
    if(document.getElementById("completedStatusId")!=null){
    var selectedId=JSON.parse(jQuery("#woStatus_Id").val());
    var completedIds=JSON.parse(document.getElementById("completedStatusId").value);
    }
    var resolutionEmpty =isWOResolutionEmpty();
    // if there is nothing in the html textarea the form bean it will set the form bean to null ---document.addResolutionForm.resolution.value = str;---this statement will not work here since the value to the resolution textarea will be set finally by parent["editor"]getHTML() function.
    if(resolutionEmpty){
        parent.resolution_editor.setHTML(""); // No I18N
    }
if(document.addResolutionForm && document.addResolutionForm.timeSpent && document.addResolutionForm.timeSpent.checked) {
        return true;
    }
    else {
        if(resolutionEmpty && resolutionMand ) {
            alert(getMessageForKey("sdp.requests.resolution.emptyResolution"));
            return false;
        }
        else {
            return true;
        }
    }
}
function cancelResolution() {
    window.onbeforeunload=null;
    return true;
}
/*
 *Technician assign/pickup conflict pop-up shown while conflict occurs.
 *Sets currently assinged tech as dbTtech
 **/
var dbTech;
function dbTechnician(dbTech1){
    dbTech = dbTech1;
}
/**
  * Technician conflict pop-up shown if persist while spot and inline edit
  * Sets changed technician while editing in spot and inline edit
 */
function setAlterTech(elem){
    document.getElementById('changedTech').value = elem.value;
}
/**
  * Technician conflict pop-up shown while Assign in details page
    * element is the dom object of button which triggers this method.
    * srcFrom has the value of source page from which this method is called.
 */
function assignTechCheck(element,workorderID,srcFrom){
    /**
        * Currently assigned technician is obtained using an ajax call. In the success function if there is no conflict the form is submitted.
        * If there is conflict, Confirm alert pops up and if the result is true the form is submitted else the page is refreshed.
        */
    var assignTech = true;
    sdpAjax({
        url:"/servlet/SDAjaxServlet?module=request&action=getRequestedID&search="+encodeURIComponent(workorderID),//NO I18N
        type: "GET",//NO i18N
        dataType: 'text',//NO I18N
        async: false,
        success: function(response) {
            dbTechnician(response);
            if(dbTech == 'null') {
                dbTech = '0';
            }
            var inViewTech;
            var changedTech;
            if(window.req_details || srcFrom === "WOListView") {
                inViewTech = $req.details.request_info.technician && $req.details.request_info.technician.id ? $req.details.request_info.technician.id : null;
                changedTech = jQuery("[name='technician']").length > 0 && jQuery("[name='technician']").select2("val") ? jQuery("[name='technician']").select2("val") : null;   //NO I18N
            } else {
                inViewTech = document.getElementById('initialTech').value;
                changedTech = document.getElementById('changedTech').value;
            }
            inViewTech = inViewTech == null || inViewTech == "" ? 0 : inViewTech; //NO I18N
            changedTech = changedTech == null || changedTech == "" ? inViewTech : changedTech; // NO I18N

            var conflictMsg="sdp.message.detailsconflict";//NO I18N
            if(srcFrom=="WOListView"){
                    conflictMsg="sdp.message.listview.conflict";//NO I18N
            }
            var result = validateTechConflict(inViewTech,dbTech,changedTech,conflictMsg);
            if(result) {
                if(!window.req_details && srcFrom !== "WOListView") {
                    document.getElementById('initialTech').value = changedTech;
                    parent.closeDialog();
                    jQuery(element).closest('form').submit();//NO I18N
                }
                assignTech = true;
                return;
            }
            if(srcFrom === "WOListView") {
                parent.refreshSubView(parent.getPortalViewName('RequestsView'));
                parent.closeDialog();
            }
            assignTech = false;
        }
    });
    return assignTech;
}

/**
  * Technicain conflict occurs while assigning technician from multiple ways
  * conflictMsg - optional. This method can be passed with conflict message as additional argument.
  dbTechName - Current Value of technician in DB 
  changedTech - Value chosen for technician field after form is loaded with a value
  inViewTech - value of technician on page load
  */
function validateTechConflict(inViewTech,dbTech,changedTech,conflictMsg,from)
{
    var dbTechName=new Array();
    if(inViewTech != 0){
		if(from && from=="form"){
			dbTechName[0] = inViewTech.name||inViewTech;
		} else {
			dbTechName[0] = techID_NameModel.list[inViewTech][1];
		}
    }
    else{
        dbTechName[0] = "-";
    }
    if(dbTech != 0){
		if(from && from=="form"){
			dbTechName[1] = dbTech.name||dbTech;
		} else {
			dbTechName[1] = techID_NameModel.list[dbTech][1];
		}
    }
    else{
        dbTechName[1] = "-";
    }
    if(changedTech != 0){
		if(from && from=="form"){		
			dbTechName[2] = changedTech.name||changedTech;
		} else {
			dbTechName[2] = techID_NameModel.list[changedTech][1];
		}
    }
    else{
        dbTechName[2] = "-";
    }
    var result = true;
    if(conflictMsg!=undefined && conflictMsg!=null){
        var conflictStr = getMessageForKey(conflictMsg,dbTechName);
    }
    else{
        var conflictStr = getMessageForKey('diffTech',dbTechName);
    }
	if(inViewTech&&inViewTech.id){
		inViewTech=inViewTech.id;
	}
	if(dbTech&&dbTech.id){
		dbTech=dbTech.id;
	}
	if(changedTech&&changedTech.id){
		changedTech=changedTech.id;
	}
    if ((inViewTech != dbTech) && (changedTech != dbTech)){
        result = confirm(conflictStr);
    }
    return result;
}
function checkForInlineUDFNumeric(form, spotEdit) {
    from = document.getElementById('From');
    //sdlog("num field length is :"+numFlen);
    var numField = null;
    var numFields = [];
    if(spotEdit  /* from != null && from.value == "SpotEdit" */) {
        numField = form.VALUE;
        numFields.push(numField);
    }
    else {
        numFields = $A(jQuery('input[validatemethod="isNumeric"]:visible'));
    }
    var numFlen = numFields.length;
    //sdlog("num field length is :"+numFlen);
    for(i=0; i < numFlen; i++) {
        numField = numFields[i];
        if(numField != null && numField.value !='') {
            trimAll(numField);
            if(!checklong(numField)) {
                numField.value = "";
                numField.focus();
                return false;
            }
        }
    }
    return true;
}
function checkAllowedDouble(elem,spot, customDecimalLimit){
    var value = elem.value;
    var name;
    if(spot == "WOInlineForm")
    {
        var id = elem.id;
        var ids = id.split(" ");
        name = ids[0];
    }
    else{
        name = elem.name;
    }
    var dis_span = document.getElementById("disp_"+name);
    var dec_points = 2;
    if(customDecimalLimit) {
        dec_points = sdp_app.MAX_ALLOWED_DECIMAL_POINTS || 2;
    }
    if(isDecimal(value) && value.indexOf(".") >= 0)
    {
        var intValue = value.split(".");
        if(intValue[1].length > dec_points){
            dis_span.innerHTML = getMessageForKey("sdp.jserror.requestcustomdecimallimit",[dec_points]);
            dis_span.className = "fontGray";
            elem.focus();
            return false;
        }
        else{
            dis_span.innerHTML = "";
            dis_span.className = "hide";
        }
    }
    else{
        dis_span.innerHTML = "";
        dis_span.className = "hide";
    }
    return true;
}

function validateAttach() {
    var str=document.form1.filePath.value;
    if((str=="")||(str.charAt(str.length-1)=="/")) {
        return false;
    }
    else {
        document.form1.filename.value=str;
    }
    return true;
}
/* ----Enabling Site Field in Request Template Form----- */
/* ----Enabling Site Field code starts------ */
var sitVal;
/* ----Enabling Site Field code ends------ */
var reqFrom = null;
var insite=null;
function checkUserExists(form)
{
    reqFrom = form;
    /* ----Enabling Site Field in Request Template Form----- */
    /* ----Enabling Site Field code starts------ */
    if(trim(reqFrom.name) == "WorkOrderForm") {
        sitVal = reqFrom.templateSite.value;
    }
    /* ----Enabling Site Field code ends------ */
    if(window.XMLHttpRequest)
    {
        reqObj = new XMLHttpRequest();
    }
    else if(window.ActiveXObject)
    {
        reqObj = new ActiveXObject("Microsoft.XMLHTTP"); // No I18N
    }
    /*
     * asynchronous has been changed to false because otherwise reqObj in handleCheckUser remains empty
     * Pls do not change to true
    */
    if(reqObj.readyState == 4 || reqObj.readyState == 0)
    {
        /* sd- 47619 : trimming the requester name before comparing whether it already exists? */
        var str = document.getElementById('reqSearch').value.trim();
        var formName=trim(reqFrom.name);
        var requestFrom="";//No I18N
        if(formName =="ChangeForm")
        {
            //is from change
            requestFrom="Change";//No I18N
        }
        else
        {
            //Assuming Request Module
            requestFrom="Request";//No I18N
            str = document.getElementById('reqName').value.trim();
            //If requester name is not changed then no need to check for valid user
            var oldReqID=jQuery("#oldRequesterID").val();
            var curReqID=jQuery("#requesterID").val();
            //SD-77817 - valid user id check is not considered only when the requester id is not null and requesterID!=0
            //At some cases in Edit page, the requester name may change but the old requester ID remains unchanged before onblur event of requester field
            var oldRequesterName=document.getElementById("oldRequesterName").value.trim()
            if( oldReqID == curReqID)
            {
                if(curReqID && curReqID!="0"  && str === oldRequesterName){
                    insite = true;
                    return;
                }
            }
        }
        reqObj.open("GET", '/servlet/AJaxServlet?action=checkUser&requestFrom='+encodeURIComponent(requestFrom)+'&search='+encodeURIComponent(str), false); // No I18N}
        reqObj.onreadystatechange = handleCheckUser;
        reqObj.send(null);
    }
}

function handleCheckUser()
{
    if(reqObj!=null && reqObj.readyState==4)
    {
        var str = reqObj.responseText;
        //alert(str);
        var data = JSON.parse(str);
        if(data && data.USER_PRESENT == 'true') {
            /* ----Enabling Site Field in Request Template Form----- */
            /* ----Enabling Site Field code starts------ */
            //Technician can create a request on behalf of requester irrespective of his site
            // data.IN_SITE check need not be done for SCP
            if(data.IN_SITE == 'true'|| (sitVal != null && sitVal != "null") || isSCP) { //No I18N
                /* ----Enabling Site Field code ends------ */
        //submit has been commented out because form submission happens without completing fieldcheck fully
        //instead, a variable called insite is defined and is set to true. Before submission, its value is checked to see if its true
                insite=true;
        //reqFrom.submit();
            }
            else {
                alert(getMessageForKey("sdp.request.add.error.notinsite"));
                enableFormButton(reqFrom);
                reqFrom.reqName.focus();
            }
        }
        else {
            if(isSCP && (reqFrom.name == "QuickCreateForm" || reqFrom.name == "WorkOrderForm")) {   // handling validation alerts for creating new Account in Request page
                if(reqFrom.name == "QuickCreateForm") {
                    accountElement = jQuery("#qc_accountID");
                } else {
                    accountElement = jQuery("#accountID");
                }
                if(accountElement.length > 0 && accountElement.select2('data') != null) {
                    // if account element exists and it being select2 and its value is not empty (not associated to any account)
                    var accountExists = true;
                    if(accountElement.select2('data').isTag != undefined && accountElement.select2('data').isTag) {
                        // to check whether an account is present in the name. Even when isTag is true i.e. for new option doing this check, as select2 doesn't trim and choose the option
                        var accountName = accountElement.select2('data').name.trim();   //No I18N
                        accountExists = accountExistsInName(accountName);
                    }
                    if(!accountExists) {
                        if(data.ADD_ACCOUNT == "true" && data.ADD_REQUESTER == 'true') {
                            if(confirmSubmit(getMessageForKey("scp.alert.add.contact.and.account"))) {
                                insite = true;
                            } else {
                                enableFormButton(reqFrom);
                                reqFrom.reqName.focus();
                            }
                            return;
                        } else if(data.ADD_ACCOUNT != "true") {
                            alert(getMessageForKey("scp.account.not.exist"));
                            enableFormButton(reqFrom);
                            reqFrom.accountID.focus();
                            return;
                        }
                    }
                }
            }
            if(data.ADD_REQUESTER == 'true'){
                //cwf started
                var alertMsg = getMessageForKey("sdp.leftpanel.quickcreate.askreqvalidname");
                if(reqFrom.name == "ChangeForm")
                {
                    alertMsg = getMessageForKey("sdp.change.quickcreate.askreqvalidname");
                }
                if(confirmSubmit(alertMsg)) {
                    //cwf ended
                        //SD-58797 form gets submitted before description is set to the form
                                //reqFrom.submit();
                        insite=true;
                }
                else {
                    enableFormButton(reqFrom);
                    reqFrom.reqName.focus();
                }
            }
            else {
                alert(getMessageForKey("sdp.requests.requester.not.exist"));
                enableFormButton(reqFrom);
                reqFrom.reqName.focus();
            }
        }
    }
}

//METHODS FOR AUTO SUGGEST-START
function suggest(event,id,form) {
    var searchstr="";
    var csiInclude = $req.form.ssp.can_include_csi;
    var descInclude = $req.form.ssp.suggest_description_enabled;
    if(csiInclude) {
        var csi = ["category", "subcategory","item"];    //No I18N
        for(var i = 0; i < 3; i++) {
           var csivalue = $rf.fields.values[ csi[i] ];
           if(csivalue !== null && csivalue != 0 && $rf.fields[ csi[i] ] && $rf.fields[ csi[i] ].current_value) {
               searchstr = searchstr + $rf.fields[ csi[i] ].current_value.name + " ";   //No I18N
           }
        }
    }
    if(id === "subject" && ((form.subject.value).trim().length) == 0) {
        jQuery("#suggdropdownlist").hide();
        return true;
    }
    searchstr = searchstr + form.subject.value.trim();    
    if(id === "subject" && event.keyCode === 32 && form.subject.value ) {    //No I18N
        searchstr = stripHtmlText(searchstr);
        searchForSuggestions(searchstr,id);
        if(solutionsearchresult.length === 0 && announcesearchresult.length === 0) {
            jQuery("#suggdropdownlist").hide();
        }
        return true;
    } else if(id==="addWOButton") { //No I18N
        if(!$rf.validateForm()) {
            return true;
        }
        if($req.form.suggestion_seen === false) {
            if(descInclude === "true") {
                // Below try catch is introduced to fix the issue id SD-58706. Do not remove.
                try {
                    var descText = "";
                    descText = window[ $rf.fields.description.zeditor_id ].getHTML();
                } catch(xion) {
                    // catching exception in case of getHTML() , case where description is not shown to requester.
                    // catching the eating the error silently.
                }
                searchstr = searchstr + " " + descText;
            }
            searchstr = stripHtmlText(searchstr);
            searchForSuggestions(searchstr, "submit");   //No I18N
            if(!(suggestedSolutions===null)||!(suggestedAnnouncements===null)) {
                showDialog(document.getElementById('suggestionAlert').innerHTML, 'modal=yes,closeButton=no, position=absmiddle,closeOnBodyClick=no');      //No I18N
                //When the DOM id duplicate need to add the listener once again so that events will be attached for the new duplicate elements.
                $req.form.bindEvents.templates.rf_suggestions_template("#_DIALOG_CONTENT"); //No I18N
                return false;
            }

            }
    }
    return true;
}
var solutionsearchresult=null;
var announcesearchresult=null;
//this method sends ajax calls to search for solutions and announcements
function searchForSuggestions(searchstr,id)
{
    announcesearchresult=new Array();
    solutionsearchresult=new Array();
        for(var i=1;i<=3;i++)
        {
               jQuery("#soln"+i.toString()).hide();
               jQuery("#ann"+i.toString()).hide();
        }
        //alert("searching with "+searchstr);
        //ajax call fr announcements
        var xhr1;
        //SD 60244 fix - Removing '&' from search string since this affects the ajax call parameters
        //other special characters handled in server
        //searchstr = searchstr.replace(/&/g,'');
        var announcementParams = "from="+encodeURIComponent(id)+"&module=announcement&action=getIds&searchstr="+encodeURIComponent(searchstr);  //No I18N
         // SD - 104392 Solution suggest popup alignment
         var subjectEle = jQuery('#subject_control');
             jQuery('#suggdropdownlist').css('top',subjectEle.offset().top + subjectEle.outerHeight() + "px"); //No I18N
             
    xhr1=new XMLHttpRequest();
    if(xhr1)
    {
        xhr1.onreadystatechange=function()
        {
            if(xhr1.readyState===4 && xhr1.status===200)
            {
                if(!(xhr1.responseText===null) && !(xhr1.responseText===undefined) && !(xhr1.responseText.length===0))
                {
                                    var j=1;
                                    var k=0;
                                    result = JSON.parse(xhr1.responseText);
                                    if(id==="submit")                           //No I18N
                                    {
                                            suggestedAnnouncements=result;
                                    }
                                    else
                                    {
                                            for(var key in result)
                                            {
                                                     announcesearchresult[k++]=result[key].id;
                                                     jQuery("#ann"+j.toString()).val(result[key].id);        //No I18N
                                                     jQuery("#anntitle"+j.toString()).html(encodeHTML(result[key].title));        //No I18N
                                                     jQuery("#annsd"+j.toString()).html(result[key].description); //No I18N
                                                     jQuery("#ann"+j.toString()).show();                //No I18N
                                                     j++;
                                            }
                                            //alert(announcesearchresult);
                                            jQuery("#headermsg").html(getMessageForKey("sdp.requests.newrequest.autosuggest.listview.message"));
                                            jQuery("#suggdropdownlist").show();
                                    }
                            }
                        }
                }
                xhr1.open("POST","/servlet/SDAjaxServlet",false);//No I18N
                xhr1.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
        xhr1.send(announcementParams);
        }

  //ajax call for solutions - solutions will be shown only if solutions tab can be seen by requesters
  if($req.form.ssp.can_requester_access_solution){
   //SD-132541
   searchstr=("keywords:").concat(searchstr);                                                                       //No I18N
   //alert(searchstr);
   var xhr2;
   var solutionParams = "from="+encodeURIComponent(id)+"&module=solution&action=getIds&searchstr="+encodeURIComponent(searchstr);                            //No I18N
   xhr2=new XMLHttpRequest();
   if(xhr2)
   {
      xhr2.onreadystatechange=function()
      {
       if(xhr2.readyState===4 && xhr2.status===200)
       {
          if(!(xhr2.responseText===null) && !(xhr2.responseText===undefined) && !(xhr2.responseText.length===0))
          {
            var j=1;
            var k=0;
            result = JSON.parse(xhr2.responseText);
            if(id==="submit")                                                               //No I18N
            {
              suggestedSolutions=result;
            }
            else
            {
              for(var key in result)
                {
                  solutionsearchresult[k++]=result[key].id;
                  jQuery("#soln"+j.toString()).val(result[key].id);    //No I18N
                  jQuery("#solntitle"+j.toString()).html(encodeHTML(result[key].title));    //No I18N
                  jQuery("#solnsd"+j.toString()).html(result[key].description); //No I18N
                  jQuery("#soln"+j.toString()).show();        //No I18N
                  j++;
                }
                //alert(solutionsearchresult);
                jQuery("#headermsg").html(getMessageForKey("sdp.requests.newrequest.autosuggest.listview.message"));
                jQuery("#suggdropdownlist").show();
            }
          }
        }
      }
      xhr2.open("POST","/servlet/SDAjaxServlet",false);//No I18N
      xhr2.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
      xhr2.send(solutionParams);
    }
  }
}
//this method opens the suggestions modal dialog
function showDetailedViewInDialog(from,id,value)
{
	var url = "/autoSuggestions.do?from="+encodeURIComponent(from)+"&id="+encodeURIComponent(id)+"&value="+encodeURIComponent(value);  //No I18N
    showURLInDialog(url,"modal=yes,closeButton=no,width=860,position=absmiddle");   //No I18N
}
//this method is used to load the suggestions on SolutionSuggest.jsp page load
function suggestionload(from,id,value)
{
    //alert(id+" "+title);
    if(from==="submit")                                                         //No I18N
        {
            announcementListViewInDialog(from);
            solutionListViewInDialog(from);
            jQuery(".suggestpop").css({'background': 'none'});            //No I18N
        }
    else
        {
            announcementload(from);
            solutionload(from);
            if(id.startsWith("ann")||id.startsWith("dann"))                     //No I18N
            {
                showAnnouncementDetails(from,value);
            }
            else if(id.startsWith("soln")||id.startsWith("dsoln"))              //No I18N
            {
                showSolutionDetails(from,value);
            }
        }
}
var suggestedAnnouncements=null;
var suggestedSolutions=null;
//this method will get the announcement details
function announcementload(from)
{
    suggestedAnnouncements=null;
    if(!(announcesearchresult===null)&&!(announcesearchresult.length===0))
        {
            var xhr1=new XMLHttpRequest();
            if(xhr1)
            {
        xhr1.onreadystatechange=function()
        {
            if(xhr1.readyState===4 && xhr1.status===200)
            {
                                if(!(xhr1.responseText===null)||!(xhr1.responseText.length===0))
                                  {
                                       //alert(xhr1.responseText);
                                       suggestedAnnouncements = JSON.parse(xhr1.responseText);
                                       announcementListViewInDialog(from);
                                   }
                         }
                }
                xhr1.open("GET","/servlet/SDAjaxServlet?module=announcement&from="+encodeURIComponent(from)+"&action=getDetails&announceids="+(announcesearchresult),false);//No I18N
        xhr1.send();
            }
        }
}
//this method will load the announcement details in the list view in the dialog
function announcementListViewInDialog(from)
{
        var j=1;
        for(var key in suggestedAnnouncements)
    {
                // this code is to strip the html tags in the description for the list view alone
                    var desc=suggestedAnnouncements[key].description;
                    desc=stripHtmlText(desc);
                    if(desc.length>200)
                    {
                        desc=desc.substring(0,200)+("...");
                    }
                 //strip code ends
                jQuery("#lannouncetitle"+j.toString()).html(encodeHTML(suggestedAnnouncements[key].title));                                 //No I18N
                jQuery("#lannouncesd"+j.toString()).html(desc);    //No I18N
                jQuery("#lannounce"+j.toString()).val(suggestedAnnouncements[key].id);                                 //No I18N
        jQuery("#lannounce"+j.toString()).on('click',function(){showAnnouncementDetails(from,this.value);});            //No I18N
        jQuery("#lannounce"+j.toString()).show();                                                                       //No I18N
                j++;
         }
         jQuery("#dialoglistview").show();                                      //No I18N
}
//this method will get the announcement details
function solutionload(from)
{
    suggestedSolutions=null;
    if(solutionsearchresult!==null&&solutionsearchresult.length!==0)
     {
            var xhr2=new XMLHttpRequest();
            if(xhr2)
            {
        xhr2.onreadystatechange=function()
        {
                    if(xhr2.readyState===4 && xhr2.status===200)
            {
                if(!(xhr2.responseText===null)||!(xhr2.responseText.length===0))
                {
                                    //alert(xhr2.responseText);
                                    suggestedSolutions = JSON.parse(xhr2.responseText);
                                    solutionListViewInDialog(from);
                                }
                        }
                }
                xhr2.open("GET","/servlet/SDAjaxServlet?module=solution&from="+encodeURIComponent(from)+"&action=getDetails&solnids="+(solutionsearchresult),false);    //No I18N
        xhr2.send();
            }
        }
}
//this method will load the solution details in the list view in the dialog
function solutionListViewInDialog(from)
{
            var j=1;
            //alert(suggestedSolutions);
            for(var key in suggestedSolutions)
            {
                    // this code is to strip the html tags in the description for the list view alone
                    var desc=suggestedSolutions[key].description;
                    desc=stripHtmlText(desc);
                    if(desc.length>200)
                    {
                        desc=desc.substring(0,200)+("...");
                    }
                    //strip code ends
                    jQuery("#lsolntitle"+j.toString()).html(encodeHTML(suggestedSolutions[key].title));                                 //No I18N
                    jQuery("#lsolnsd"+j.toString()).html(desc);       //No I18N
                    jQuery("#lsoln"+j.toString()).val(suggestedSolutions[key].id);                                 //No I18N
                    jQuery("#lsoln"+j.toString()).on('click',function(){showSolutionDetails(from,this.value);});            //No I18N
                    jQuery("#lsoln"+j.toString()).show();                                    //No I18N
                    j++;
            }
            jQuery("#dialoglistview").show();
}
//this method is used to strip html text from a string
function stripHtmlText(text)
{
    return text.replace(/<.[^<>]*?>/g, '').replace(/&nbsp;|&#160;/gi, '');
}
//this method will load and show the details of the announcement id given as key in the details view in the dialog
function showAnnouncementDetails(from,key)
{
    key=key.toString();
        if(key!=null&&key.length>0)
        {
            var previousid=null;
            var flag=false;
            //when this method is called by pressing > of the last announcement-first solution should be shown
            if(key==="soln")                                                        //No I18N
            {
                    key=Object.keys(suggestedSolutions)[0];
                    jQuery("#dannounce").hide();
                    showSolutionDetails(from,suggestedSolutions[key].id);
                    return;
            }
            //populating the detailed view of announcement
            jQuery("#dannounceprev").attr("name",null);
            jQuery("#dannouncenext").attr("name",null);
            for(var k in suggestedAnnouncements)
            {
                if(flag===true)
                {
                        flag=false;
                        jQuery("#dannouncenext").attr("name",suggestedAnnouncements[k].id);
                        break;
                }
                var a=k.toString();
                if(a==="key"+key)                                                   //No I18N
                {
                        jQuery("#dannouncetitle").html(encodeHTML(suggestedAnnouncements[k].title));
                        jQuery("#dannouncedesc").html(suggestedAnnouncements[k].description.replace(/\\"/g,"'"));
                        jQuery("#dannouncefrom").html(suggestedAnnouncements[k].from);
                        jQuery("#dannounceto").html(suggestedAnnouncements[k].to);
                        jQuery("#dannounceprev").attr("name",previousid);
                        flag=true;
                }
                else
                {
                        previousid=suggestedAnnouncements[k].id;
                        continue;
                }
            }
            //for the last announcement-next id is first id of solution
            if(flag===true&&!(suggestedSolutions===null))
            {
                jQuery("#dannouncenext").attr("name","soln");    //No I18N
            }
            //to enable/disable >
           if(jQuery("#dannounceprev").attr("name"))
            {
                   jQuery("#dannounceprev").removeClass("ui-opacity3");        //No I18N
            }
            else
            {
                   jQuery("#dannounceprev").addClass("ui-opacity3");        //No I18N
            }
            if(jQuery("#dannouncenext").attr("name"))
            {
                   jQuery("#dannouncenext").removeClass("ui-opacity3");        //No I18N
            }
            else
            {
                   jQuery("#dannouncenext").addClass("ui-opacity3");        //No I18N
            }
            if(from==="subject")                                            //No I18N
            {
                jQuery("#notokbutton").html(getMessageForKey("sdp.requests.newrequest.autosuggest.footer.continuebutton"));
        jQuery("#notokbutton").attr('title',getMessageForKey("sdp.requests.newrequest.autosuggest.footer.continue.tooltip"));
            }
            else if(from==="submit")                                        //No I18N
            {
                jQuery("#notokbutton").html(getMessageForKey("sdp.requests.newrequest.autosuggest.footer.submitbutton"));
        jQuery("#notokbutton").attr('title',getMessageForKey("sdp.requests.newrequest.autosuggest.footer.submit.tooltip"));
            }
            jQuery("#okbutton").attr('name','announcement');                    //No I18N
            jQuery("#dialoglistview").hide();
            jQuery("#dannounce").show();
            jQuery(".suggestpop").css({'background': '#fff'});                  //No I18N
            jQuery("#detailedview").show();
        }
        else
            {
                return;
            }
}
//this method will load and show the details of the announcement id given as key in the details view in the dialog
function showSolutionDetails(from,key)
{
    key=key.toString();
    if(key!==null&&key.length>0)
    {
        var previousid=null;
        var flag=false;
        //when this method is called  by pressing < of the first solution-last announcement must be shown
        if(key==="announce")                                            //No I18N
        {
                for(key in suggestedAnnouncements);
                jQuery("#dsoln").hide();                                    //No I18N
                showAnnouncementDetails(from,suggestedAnnouncements[key].id);
                return;
        }
        //for the first solution, previousid is the last announcementid
        if(!(suggestedAnnouncements===null))
        {
                previousid="announce";                                      //No I18N
        }
        //populating detailed view of solutions
        jQuery("#dsolnprev").attr("name",null);
        jQuery("#dsolnnext").attr("name",null);
        for(var k in suggestedSolutions)
        {
            if(flag===true)
            {
                    flag=false;
                    jQuery("#dsolnnext").attr("name",suggestedSolutions[k].id);
                    break;
            }
            if(k==="key"+key)//No I18N
            {
                    jQuery("#dsolnid").html("#"+suggestedSolutions[k].id);    //No I18N
                    jQuery("#dsolntopic").html(encodeHTML(suggestedSolutions[k].topic));
                    jQuery("#dsolntitle").html(encodeHTML(suggestedSolutions[k].title));
                    jQuery("#dsolndesc").html(suggestedSolutions[k].description.replace(/\\"/g,"'"));
                    jQuery("#dsolnupdated").html(suggestedSolutions[k].updatedon);
                    jQuery("#dsolnnewtab").attr("href","ui/solutions?entity_id="+encodeURIComponent(suggestedSolutions[k].id)+"&mode=detail&PORTALID="+PORTALID);    //No I18N  //SD-115741
                    jQuery("#dsolnprev").attr("name",previousid);
                    jQuery("#dsolnviews").html("("+suggestedSolutions[k].views+" "+getMessageForKey("sdp.common.views")+")");        //No I18N
                    flag=true;
            }
            else
            {
                    previousid=suggestedSolutions[k].id;
                    continue;
            }
          }
          //to enable/disable >
           if(jQuery("#dsolnnext").attr("name"))
            {
                   jQuery("#dsolnnext").removeClass("ui-opacity3");        //No I18N
            }
            else
            {
                   jQuery("#dsolnnext").addClass("ui-opacity3");        //No I18N
            }
            if(jQuery("#dsolnprev").attr("name"))
            {
                   jQuery("#dsolnprev").removeClass("ui-opacity3");        //No I18N
            }
            else
            {
                   jQuery("#dsolnprev").addClass("ui-opacity3");        //No I18N
            }
          //setting value of 2nd button
            if(from==="subject")
            {
                   jQuery("#notokbutton").html(getMessageForKey("sdp.requests.newrequest.autosuggest.footer.continuebutton"));
           jQuery("#notokbutton").attr('title',getMessageForKey("sdp.requests.newrequest.autosuggest.footer.continue.tooltip"));
            }
            else if(from==="submit")
            {
                   jQuery("#notokbutton").html(getMessageForKey("sdp.requests.newrequest.autosuggest.footer.submitbutton"));
           jQuery("#notokbutton").attr('title',getMessageForKey("sdp.requests.newrequest.autosuggest.footer.submit.tooltip"));
            }
            jQuery("#okbutton").attr('name','solution');                        //No I18N
            jQuery("#dialoglistview").hide();    //No I18N
            jQuery("#dsoln").show();
            jQuery(".suggestpop").css({'background': '#fff'});                  //No I18N
            jQuery("#detailedview").show();
            /**
             * For converting the image to video.
             * Unable to get value, If we are storing the "solution_ap" in a variable. thats why we have stored in window.
             */
            //SD-123915
            parent.solution_ap = new attachPreview(jQuery("#dsolndesc"), {target : 'img', layouts : false, attachWrap: true});	//NO I18N
      }
      else
          {
              return;
          }
}
//this method will either submit the request or close the suggestions dialog based on the id from which it is called
function continueRequest(id, event)
{
       $req.form.suggestion_seen = true;
       var msg=jQuery("#"+id).html();                                           //No I18N
       if(msg===getMessageForKey("sdp.requests.newrequest.autosuggest.footer.submitbutton") || id === "submitrequest")  //No I18N
        {
            //Zia should be invoked if continuing to add request after auto-suggestion
            if(canZiaSuggests && !$req.form.zia_properties.suggested_already) {
                closeDialog();
                zia_cat_temp_suggestion.callForZiaSuggestion(document.getElementById($rf.formid) );
            }
            else {
                $req.form.submit("suggestion", event);   //No I18N
            }
        }
       else
        {
            closeDialog();
        }
}
//this method will cancel request creation and direct to list view page
function cancelRequest(module)
{
        var currenttime=(new Date()).getTime();
        var xhr=new XMLHttpRequest();
        if(xhr)
        {
          xhr.onreadystatechange=function()
            {
            if(xhr.readyState===4 && xhr.status===200)
            {
                $req.form.destroyForm(undefined, false);
                closeDialog();
                const url = "WOListView.do?suggApproved=true" + (window.externalframe ? "&externalframe=true" : ""); //No I18N
                window.open(url, '_self', 'noopener')
                        }
                }
                xhr.open("GET","/servlet/SDAjaxServlet?module="+encodeURIComponent(module)+"&action=noteTime&from=submit&currenttime="+(currenttime),true);    //No I18N
        xhr.send();
    }
}
function triggerEvent(fieldObject,event){
        if (document.createEventObject){
            // dispatch for IE
            var evt = document.createEventObject();
            return fieldObject.fireEvent('on'+event,evt);//NO I18N
        }
        else{
            // dispatch for firefox + others
            var evt = document.createEvent("HTMLEvents");//NO I18N
            evt.initEvent(event, true, true ); // event type,bubbling,cancelable
            return !fieldObject.dispatchEvent(evt);
        }
    }
/**
* checkValidDate is a generic method to compare the values of two date fields
* it will throw an alert message and return false if date1 is greater than date2
* Can be used to check start and end date values and the like...
*
* dateFieldOrId        - date field or ID (both accepted) for which a new date has been selected
* checkDateFieldOrId   - date field whole value needs to be compared to check whether the new date is valid
* errorMessageOrId     - Message id or text to be notified to the user when the date combination is not valid
* errorCondition       - takes only one value "less" or can be left empty. reverses the condition check
*                        if less is specified then error is thrown when date1 is less then date2
*/
function checkValidFrDate(createdTimeObj, dueByTimeObj, frTimeObj, type)
{
    var createdTimeStr = createdTimeObj.value;
    var dueByTimeStr = dueByTimeObj.value;
    var frTimeStr = frTimeObj.value;
    if(frTimeStr == -1 || frTimeStr == "" || frTimeStr == 0) {
        return true;
    }
    var frTime = Number(frTimeStr);
    if(frTime == NaN) {
        fr = new Date(frTimeStr);
    }
    else {
        fr = new Date(frTime);
    }
    var createdTime = Number(createdTimeStr);
    if(createdTime == NaN) {
        created = new Date(createdTimeStr);
    }
    else {
        created = new Date(createdTime);
    }
    if(created > fr) {
        if(type == "FR_SLA") {
            alert(getMessageForKey("sdp.request.fr_createdtime.error"));
        }
        else {
            alert(getMessageForKey("sdp.requests.newrequest.jserror1"));
        }
        return false;
    }
    if(dueByTimeStr == -1 || dueByTimeStr == "" || dueByTimeStr == 0) {
        return true;
    }
    var dueByTime = Number(dueByTimeStr);
    if(dueByTime == NaN) {
        dueBy = new Date(dueByTimeStr);
    }
    else {
        dueBy = new Date(dueByTime);
    }
    if(type == "FR_SLA" && dueBy < fr) {
        alert(getMessageForKey("sdp.request.fr_duetime.error"));
        return false;
    }
    if(type == "SLA" && dueBy > fr) {
        alert(getMessageForKey("sdp.request.fr_duetime.error"));
        return false;
    }
    return true;
}
function checkValidSchDate(fieldId,scheduleStart,scheduleEnd,clear) {
    var scheduleStartStr = scheduleStart.value;
    var scheduleEndStr = scheduleEnd.value;
    var scheduleStartNum = Number(scheduleStartStr);
    var scheduleEndNum = Number(scheduleEndStr);
    var currentDate = new Date();
    if(fieldId == "scheduled_start_time"){
        if(scheduleEndNum != NaN && scheduleEndNum !=0){
            if(scheduleStartNum > scheduleEndNum){
                alert(getMessageForKey("sdp.schedule.validation.key3"));
                return false;
            }
        }
    }
    else{
        if(scheduleEndNum != NaN && scheduleEndNum !=0 && !clear){
            if(scheduleEndNum < scheduleStartNum){
                alert(getMessageForKey("sdp.schedule.validation.key4"));
                return false;
            }
        }
    }
    return true;
}

function enableFormButton(reqFrom)
{
    if(trim(reqFrom.name) == "ScheduleRequestForm") {
        if(reqFrom.save != null) {
            document.getElementById('savePMTask').disabled=false;
        }
    }
    if(trim(reqFrom.name) == "QuickCreateForm") {
        if(reqFrom.quickReqButton != null) {
            document.getElementById('quickReqButton').disabled=false;
        }
    }
    if(trim(reqFrom.name) == "ChangeForm") {
        reqFrom.Sub.disabled = false;
    }
}
function disableFormButton(reqFrom)
{
    if(trim(reqFrom.name) == "ScheduleRequestForm") {
        if(reqFrom.save != null) {
            document.getElementById('savePMTask').disabled=true;
        }
    }
    if(trim(reqFrom.name) == "QuickCreateForm") {
        if(reqFrom.quickReqButton != null) {
            document.getElementById('quickReqButton').disabled=true;
        }
    }
    if(trim(reqFrom.name) == "ChangeForm") {
        reqFrom.Sub.disabled = true;
    }
}
function deleteDCCollection(cId, tId) {
    var url = "/InstallSoftware.do?delete=true&collectionId=" + encodeURIComponent(cId) + "&taskId=" + encodeURIComponent(tId); // No I18N
    jQuery.ajax({url: url, success : showDCDeleteResult}); // No I18N
}
function showDCDeleteResult(data, status, response) {
    var result = false;
    // XML received will be like <Result>Success/Failure</Result>
    if(data != null && data.indexOf("Success") >= 0) {
        result = true;
    }
    // In case of success, we need to mark the completion of the savings stage and start the checking stage.
    if(result) {
        showMessageAndClose(getMessageForKey('sdp.admin.common.deletedsuccessfully'), 3000); // No I18N
        document.getElementById('taskDetails').innerHTML="";
        changeRequestTab('taskDetails'); // No I18N
    }
}
function hasServiceRequest(form, box,serReqIds,oper)
{
    var hasSerReq = false;
    serReqIds = serReqIds.replace("[","");
    serReqIds = serReqIds.replace("]","");
    serReqIds  =  serReqIds.split(",");
    for(var i=0; i<form.elements.length; i++)
    {
        if(form.elements[i].name == box && form.elements[i].checked)
        {
            for(var j=0;j<serReqIds.length;j++)
            {
                if(form.elements[i].value == serReqIds[j].trim())
                {
                    hasSerReq = true;
                    if(oper!="edit") {
                        form.elements[i].checked = false;
                    }
                }
            }
        }
    }
    if(hasSerReq){
        return false;
    }
    return true;
}
function updateAssetReqView(obj)
{
    updateState(getPortalViewName("WsRequestsHistory"),"TYPE",obj.value);
    refreshSubView(getPortalViewName("WsRequestsHistory"));
}
/*
 * SD-38762, exception while merging the same request from the request details page.
 * JS function for MergeRequest.jsp
 * param, selectId-Merging RequsetId, toId-parent RequestID
 */
function validateMergeForm(selectId, toId) {
    if(!toId){
        toId = top.window.woID;
    }
    if (selectId == toId) {
        alert(getMessageForKey("sdp.requests.MergeReq.jssameiderr")); // Alert message for merging same request.
        return;
    }
    if (confirmSubmit(getMessageForKey("sdp.requests.MergeReq.jsSelect",[selectId, selectId]))) {
        var url = "/api/v3/requests/" + selectId + "/_merge_requests"; // NO I18N
        var input_data = {
            merge_requests: [{
                id: toId
            }]
        };
        input_data = sdpAjaxInputData(input_data);
        // TASKID: 75171
        // API Based Merge Request
        sdpAjax({
            url: url,
            type: "PUT", // NO I18N
            data: input_data,
            success: function() {
                top.window.jQuery("#wo-assign").dialog("close"); // NO I18N
                top.window.location.assign("/WorkOrder.do?woMode=viewWO&woID=" + encodeURIComponent(selectId) + ""); //No i18N
            }
        });
    }
}
function focussed(srchid){
    var srchbox= document.getElementById(srchid);
    if (srchbox.value==getMessageForKey('sdp.leftpanel.search.title')) {srchbox.value=''}
}
function blurred(srchid){
    var srchbox= document.getElementById(srchid);
    if (srchbox.value=='') {srchbox.value = getMessageForKey('sdp.leftpanel.search.title')}
}
/**
 * Methods for showing and updading Service Approvers
**/
Request.showApprovers = function(event) {
    var element = Event.element(event);
    var x = findPosX(element);
    var y = findPosY(element) - 250;
    var finalX = x + element.offsetWidth - 550;
    populateSRapprovers();
    var htmlcode = jQuery('#selApprPop').html();
    var keyString=jQuery('#selApprs').val();
    var dataArray = [];
    if(typeof keyString === "string") {
        dataArray=keyString.split(',');
    }else {
        dataArray = keyString;
    }
    htmlcode = htmlcode.replace(/\SSSSRApproversSSS/g, 'SRApprovers');
    showDialog(htmlcode, "title="+getMessageForKey('sdp.admin.servicecatalog.template.approver.list.heading')+", closeButton=yes, position=relative, width=300");       //No I18N
    jQuery("#SRApprovers").val(dataArray);
}
/**
 * Methods for clearing all selected values in service approvers popup.
**/
Request.clearAllApproverList = function() {
    jQuery('#SRApprovers option').prop("selected", false); //No i18N
}
Request.updateApproverList = function() {

    var selectObj = jQuery('#SRApprovers');
    var applist = [];
   if(selectObj.val()){
    selectObj.children('option:selected').each(function()   //No I18N
    {
        var approvalobj = {};
        approvalobj.id = this.value;
        approvalobj.text = this.text;
        applist.push(approvalobj);
    });

        }
    jQuery("#selApprs").select2('data', applist);  //No I18N
    if( isMSPOrSCP && (document.getElementById("confirm-open-in-mobile-app-alert-div")==null || document.getElementById("confirm-open-in-mobile-app-alert-div")==undefined) ) {
        parent.closeDialog();
    }
}

function getProdDetails(id, name) {
    var url = '/servlet/HdClientUtilServlet?command=getProductInfo&productId=' + encodeURIComponent(id);   //No I18N
    var divhtml;       //No I18N
    //url += element.value;
    jQuery.get(url, function(data) {
            var opts = '';
            if(data == "") {data = getMessageForKey("sdp.viewuserdetails.nodesc");}
            jQuery('<div class="m20"></div>').html(data).dialog({
                'width':400,//NO I18N
                'height':300,//NO I18N
                'title':name,//NO I18N
                'dialogClass':'fix-box',//NO I18N
                'modal':false,//NO I18N
                'draggable': false,	//No I18N
                'close':function(){ //No I18N
                   jQuery(this).dialog('destroy').remove(); //NO I18N
                }
            });
    });
}
function getProductInfo2(elementId) {
    var element = document.getElementById(elementId);
    var prdName = element.options[element.selectedIndex].text;;
    var id = element.value;
    getProdDetails(id, prdName);
}
function setResourceModified() {
    if($('resourceModifiedOne')) {
        $('resourceModifiedOne').value = true;
    }
    if($('resourceModifiedTwo')) {
        $('resourceModifiedTwo').value = true;
    }
}
/**
 * Validates the XLS file onchanging the file
 */
function validateRequestXLSFile(elem)
{
    if( elem.value == '' || elem.value.endsWith('.xlsx') || !elem.value.endsWith('.xls'))
    {
        showBaloonToolTip('fileName', getMessageForKey('sdp.request.import.locatexls'));//No I18N
        return false;
    }
    document.getElementById("fileName").innerHTML = encodeHTML(elem.value);
    return true;
}
/**
 * Closing the Progress Div
 */
function closeSuccessBar(){
    jQuery(parent.document.getElementById('loadingdivid')).remove();
}
/**
 * Shows the progress Div
 */
function showProgressDiv(){
    document.getElementById("loadingDIV").className ="status-window showLoaded";
//jQuery('#loadingDIV').attr('class', 'showLoaded');
}
/**
 * Validate the Subject field and throws error if rowcount is zerp
 */
function validateRequestImportMandatoryFields()
{
    if(document.getElementById('subject').value == -1)
    {
        showBaloonToolTip('subject', document.getElementById('sdp.request.import.name.choose').innerHTML);//No I18N
        return false;
    }
    if (isMSPOrSCP) {
        if (document.getElementsByName('requester')[0].value == -1) {
            showBaloonToolTip('requester', getMessageForKey('sdp.request.import.name.choose.requester'));//No I18N
            return false;
        }
        if (!isSCP) {
            if (document.getElementById('account').value == -1) {
                showBaloonToolTip('account', document.getElementById('sdp.request.import.name.choose.account').innerHTML);//No I18N
                return false;
            }
            if (document.getElementById('site').value == -1) {
                showBaloonToolTip('site', document.getElementById('sdp.request.import.name.choose.site').innerHTML);//No I18N
                return false;
            }
        }
    }
    var rowCount = document.getElementById('rowcount').innerHTML
    rowCount = rowCount.substring(rowCount.indexOf(":")+1); // Issue in I18N so changed behaviour
    if(rowCount < 1)
    {
        showBaloonToolTip('sheetcount', getMessageForKey("sdp.request.import.norows"));//No I18N);
        return false
    }
    notificationDisableAlertBox();
}
/**
 * Imports request after clicking the notification popup proceeds submit
 **/
function importSubmitForm()
{
    document.importRequest.submit();
    closeDialog();
    showProgressDiv();
}
/**
 *
 **/
function notificationDisableAlertBox()
{
    var confirmStatus = $('warning_notification'); // template_box will be passed from workorder.jsp // NO I18N
    if ( confirmStatus != null) {
        var html_src = confirmStatus.innerHTML;
        var titleText = getMessageForKey("sdp.common.warning");
        //SD-44207: Script error while changing template while editing the request. It looks like position relative is referred in Utils.js and hence now modified to absmiddle.
        showDialog(html_src, "position=absmiddle, width=550,title="+titleText);//NO I18N
    }
}
/**
 * Validates the XLS form onsubmitting the request
 */
function validateXLSForm(elem)
{
    if(elem.value == '' || elem.value.endsWith('.xlsx') || !elem.value.endsWith('.xls'))
    {
        showBaloonToolTip('fileName', getMessageForKey('sdp.request.import.locatexls'));//No I18N
        return false;
    }
    showProgressDiv();
}
/**
 *In Internet explorer previous button is working in importcheck page. Reload operation performed.
 **/
function goBacktoParse()
{
    history.back();
    var browserName=navigator.appName;
    if (browserName=="Microsoft Internet Explorer")
    {
        window.location.reload(true);
    }
}
/**
 * Shows rowCount while selecting the sheet number
 */
function sheetRowCount(elem)
{
    if(elem.value != '-1')
    {
        var rowCount = document.getElementById("hashcount").innerHTML;
        var selectedCount = rowCount.substring(rowCount.indexOf(elem.value+"=")+2,rowCount.indexOf(',',rowCount.indexOf(elem.value+"=")));
        if(elem.value == '1')
        {
            selectedCount--;
        }
        document.getElementById("rowcount").innerHTML = getMessageForKey("sdp.support.debug.datacount") + " : "+selectedCount;
    }
}
/**
 * Disables the import button after clicking import and if not Presetfield checkbox clicked
 */
function showImportButton()
{
    var withoutField = document.getElementById('withoutField');
    if(withoutField.disabled == true)
    {
        withoutField.disabled = false;
    }
    else{
        withoutField.disabled = true;
    }
}
function autoFillSchedule()
{
    if(document.getElementById('existingScheduleId')!=null && document.getElementById('existingScheduleId').value=="true")
    {

        document.getElementById('statusIdCheck').checked=true;
        document.getElementById('changeStatusSelect').value=document.getElementById('changeToStatusId').value;
        document.getElementById('date1').value=document.getElementById('scheduledTimeId').value;
        checkUncheck();
        initCalendar('date1',null,null,null,null,null,null,null,null,null,null,true);//No I18N
    }
    if(document.getElementById('schedulerCommentsId')!=null && document.getElementById('schedulerCommentsId').value!=null)
    {
        jQuery("#onHoldComments").val(jQuery("#schedulerCommentsId").val());
    }
}
//schedulerCommentMand- to check comment is mandatory or not if true means the comments are mandated and validated
function runOnHoldScheduler(form,schedulerCommentMand)
{
    if(schedulerCommentMand!=null && schedulerCommentMand==true)
        {
         var schedulerComment=form.onHoldComments;
         if(schedulerComment!=null && trim(schedulerComment.value)=="")
             {
            alert(getMessageForKey("sdp.request.statuschange.addcomment"));
            schedulerComment.focus();
            return false;
        }

        }
    var currentTime=document.getElementById('currentTimeId').value;//No I18N
    var selectedTime=document.getElementById('date1').value;//No I18N
    var selectedStatus=document.getElementById('selectedStatus').value ;
    var copyParam="@@@";
    var extraParam=null;
    //to the same form
    divCopy('onHoldComments',copyParam);//No I18N
    divCopy('workID',copyParam);//No I18N
    divCopy('statusIdCheck',copyParam);//No I18N
    divCopy('selectedStatus',copyParam);//No I18N
    divCopy('changeStatusSelect',copyParam);//No I18N
    divCopy('currentTimeId',copyParam);//No I18N
    divCopy('date1',copyParam);//No I18N
    divCopy('date1_Display',copyParam);//No I18N
    var submit=true;//No I18N
    //global edit , inline edit, new incident
    if((document.getElementById('ProDetInFrame')!=null&&document.getElementById('ProDetInFrame').className===("show"))|| document.getElementById('RequestFormID')!=null)//No I18N
    {
        submit=false;
        extraParam="1";
    }
    //mail reply sdnotify
    if(document.getElementById('SDNOTIFYID')!=null && document.getElementById('SDNOTIFYID').className===("show"))//No I18N
    {
        submit=false;
        extraParam="3";
    }
    //resolution status change
    if(document.getElementById('resolutionDetails')!=null && document.getElementById('resolutionDetails').className===("show"))//No I18N
    {
        submit=false;
        extraParam="2";
    }
    document.getElementById('statusIdCheck@@@').checked=document.getElementById('statusIdCheck').checked;//No I18N
    divCopy('onHoldComments',copyParam+""+extraParam);//No I18N
    divCopy('selectedStatus',copyParam+""+extraParam);//No I18N
    divCopy('date1',copyParam+""+extraParam);//No I18N
    divCopy('onHoldSetId',extraParam);//No I18N
    if(selectedTime>currentTime)
    {
        if(submit)
        {
            form.submit();
        }
        else
        {
            closeDialog();
            closeCalDialog();
        }
    }
    else
    {
        if(selectedStatus==null||selectedStatus==="")//No I18N
        {
            if(submit)
            {
                form.submit();
            }
            else
            {
                closeDialog();
                closeCalDialog();
            }
        }
        else
        {
            alert("Schedule time cannot be prior to current time");//No I18N
        }
    }
}
function divCopy(element,extraParam)
{
    //used to copy element by @@@ div to dialog div -aakash.r
    var element1=element+""+extraParam;
    if(document.getElementById(element1)!=null)
    {
        document.getElementById(element1).value=document.getElementById(element).value;
    }
}
function divClear(element)
{
    //used to clear the value of a element.
    if(document.getElementById(element)!=null)
    {
        document.getElementById(element).value="";
    }
}
function initiateCopy()
{
    closeDialog();
    closeCalDialog();
}
var reqWO2PO;
var operationWO2PO = ""; //No I18N
function associatePOs(workOrderID)
{
    this.operationWO2PO = "associate_po";//No I18N
    var params = "operation=" + encodeURIComponent(this.operationWO2PO) + "&workOrderID=" + encodeURIComponent(workOrderID);//No I18N
    var checkbox = getCheckBoxValuesWO();
    var url = "/WOToPOAssociation.do";//No I18N
    if(checkbox != "")
    {
        params = params + checkbox;
    }
    else
    {
        alert(getMessageForKey("sdp.workorder.wotopo.nopoerrmsg"));//No I18N
        return;
    }
    sendAjaxRequestWO(url, params);
    if(parent.opener && parent.opener.$req) {
        $req.details.updateRequestTemplates('purchase');    //No I18N
    }
}
function detachPOs(workOrderID , purchaseOrderId )
{
    this.operationWO2PO = "detach_po"; //No I18N
    this.operationWOId = workOrderID ;
    this.operationPurchaseOrderId = purchaseOrderId ;
    var params = "operation=" + encodeURIComponent(this.operationWO2PO) + "&workOrderID="+encodeURIComponent(workOrderID);//No I18N
    //var checkbox = getCheckBoxValuesWO();
    var checkbox = "&checkbox="+encodeURIComponent(purchaseOrderId);//No I18N
    var url = "/WOToPOAssociation.do";//No I18N
    if(checkbox != "")
    {
        params = params + checkbox;
    }
    else
    {
        alert(getMessageForKey("sdp.workorder.wotopo.nopoerrmsg"));//No I18N
        return;
    }
    sendAjaxRequestWO(url, params);
}
function openPOPrintView(poId)
{
    this.operationWO2PO = "open_po_printview";//No I18N
    var params = "module=print_preview&poID="+encodeURIComponent(poId);//No I18N
    var url = "/PurchaseOrder.do?";//No I18N
    url=url+params;
    sendAjaxRequestWO(url,null,"GET"); //No I18N
}
//This function will take the url and parameters and form the HTTP POST request, send it to the server in async mode
//Make sure that url and params passed in are not null
function sendAjaxRequestWO(url, params,method)
{
    reqWO2PO = getXMLHttpRequest();
    if(reqWO2PO)
    {
        if(typeof(method)==='undefined')
        {
            method="POST"; //No I18N
        }
        reqWO2PO.open(method, url, true);//No I18N
        reqWO2PO.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
        reqWO2PO.onreadystatechange = handleAjaxRequestStateChangeWO;
        reqWO2PO.send(params);
    }
}
function handleAjaxRequestStateChangeWO()
{
    if(reqWO2PO.readyState == 4)
    {
        if(reqWO2PO.status == 200)
        {

            if("associate_po" == operationWO2PO) //No I18N
            {
                var xmlDoc = reqWO2PO.responseXML.childNodes[0];
                var result = xmlDoc.childNodes[0].childNodes[0].nodeValue;
                if(result == '200')//No I18N
                {
                	 window.showalert('success', getMessageForKey("sdp.workorder.wotopo.associate.success"), 'isAutoHide=true');//No I18N
                }
                else
                {
                	window.showalert('failure', getMessageForKey("sdp.workorder.wotopo.associate.failure"), 'isAutoHide=true');//No I18N
                }
                window.setTimeout(function(){
                    window.opener.$req.details.updateRequestTemplates('purchase');//No I18N
                    window.close();
                }, 500);
            }
            else if("detach_po" == operationWO2PO)//No I18N
            {
                var xmlDoc = reqWO2PO.responseXML.childNodes[0];
                var result = xmlDoc.childNodes[0].childNodes[0].nodeValue;
                if(result == '200')//No I18N
                {
                	window.showalert('success', getMessageForKey("sdp.workorder.wotopo.detach.success"), 'isAutoHide=true');//No I18N
                }
                else
                {
                	window.showalert('failure', getMessageForKey("sdp.workorder.wotopo.detach.failure"), 'isAutoHide=true');//No I18N
                }
                jQuery( document.getElementById( "associatedPurchaseItemDetails"+operationPurchaseOrderId ) ).fadeOut(400,function(){
                    jQuery( "#associatedPurchaseItemDetails"+operationPurchaseOrderId ).remove();
                });
                window.opener.$req.details.updateRequestTemplates('purchase');//No I18N
                if( jQuery( document.getElementById( "associatedpurchaseItem" ) ).children().length == 1 )
                {
                    window.setTimeout(function(){
                        window.close();
                    }, 500);
                }
            }
            else if("open_po_printview" == operationWO2PO)//No I18N
            {
                if ( jQuery( document.getElementById('associatedPurchaseDetails') ).length > 0 )
                {
                    document.getElementById('associatedPurchaseDetails').style.display = 'none';//No I18N
                    jQuery( document.getElementById('PurchaseHeaderInSRDetailsPage') ).text( getMessageForKey("sdp.workorder.wotopo.po.details.header") );//NO I18N
                    document.getElementById('associatedPOdetailsHeader').style.display = 'block';//No I18N
                }
                else
                {
                    document.getElementById('listview_div').style.display = 'none';//No I18N
                }
                document.getElementById('details_div').style.display = 'block';//No I18N
                document.getElementById('details_content').innerHTML = reqWO2PO.responseText;
            }
        }
    }
}
function showListViewWO()
{
    if ( jQuery( document.getElementById('associatedPurchaseDetails') ).length > 0 )
    {
        document.getElementById('associatedPurchaseDetails').style.display = 'block';//No I18N
        document.getElementById('associatedPOdetailsHeader').style.display = 'none';//No I18N
    }
    else
    {
        document.getElementById('listview_div').style.display = 'block';//No I18N
    }
    document.getElementById('details_content').innerHTML = '';//No I18N
    document.getElementById('details_div').style.display = 'none';//No I18N
}
function getCheckBoxValuesWO()
{
    var checkbox = "";
    var inputelmnts = document.getElementsByTagName("input");//No I18N
    for(var i = 0; i < inputelmnts.length; i++)
    {
        if(inputelmnts[i].name.toLowerCase() == "checkbox")//No I18N
        {
            if(inputelmnts[i].checked == true)
            {
                checkbox += "&checkbox=" + encodeURIComponent(inputelmnts[i].value);//No I18N
            }
        }
    }
    return checkbox;
}
/*it will call the corresponding alert messages for template unavailability while creating new request from closed request **/
function recreateClosedRequest(checkRecreate)
          {

              if(checkRecreate == "DefaultAlert")
                  {
                        showDefaultAlert();
                  }
                  else if(checkRecreate =="ServiceAlert")
                      {
                         showServiceAlert();
                      }
                      else if(checkRecreate =="IncidentAlert")
                      {
                          showIncidentAlert();
                      }
                  else
                      {
                          document.getElementById("reCreate").submit();
                      }
          }
/*alert functions for template which are not available for requester */
/*It will works if the service template is not available for new request creation it shows the alert message.*/
function showServiceAlert()
{
    if (confirm(getMessageForKey("sdp.request.recreate.servicealert"))== true) {
        parent.window.open('Templates.do?module=serviceRequest', '_self');
    }
}
/*if incident template is not available for further use it will show an alert message.*/
function showIncidentAlert()
{
    if (confirm(getMessageForKey("sdp.request.recreate.incidentalert"))== true) {
        parent.window.open('Templates.do?module=incident', '_self');
    }
}
/*if the default request was disabled it will show alert during new request creation from closed request.*/
function showDefaultAlert()
{
    if (confirm(getMessageForKey("sdp.request.recreate.defaultalert")) == true) {
            document.getElementById("reCreate").submit();
    }
  }

function createNewPR( workOrderId )
{
        NewWindow('/WorkOrder.do?woMode=newPR&woID=' + encodeURIComponent(workOrderId) + "&fromRequestPage=true", 'CreateNewPR','1100','600','yes','center'); // No I18N
}

function editFlexiRow(viewId, requestId)
{
    document.location = "/PurchaseRequest.do?task=editPR&requestId=" + encodeURIComponent(requestId);//NO I18N
}

function showAssociatePRPage( workOrderId, isArchivedRequest )
{
    closeDialog();
    jQuery('#_DIALOG_LAYER').remove();
    setTimeout(() => {
        showAssociatePage(workOrderId, "serviceRequests", isArchivedRequest);
    }, 1000);
}

associatedsrprs = false;
function updateSRPRAssociation( task, serviceRequestId , purchaseDetails , poId)
{
    //poId for multiple detach purchase Request.

    var additionalParams = '';//NO I18N
    if( task == 'showUnAssociatedPRs' )
    {
        jQuery('[name=purchaseRequestList]').each(function()
        {
            if( this.checked )
            {
                additionalParams += '&requestIds=' + encodeURIComponent(this.value);//NO I18N
            }
        });
    }
    else
    {
        if( typeof(purchaseDetails) == "object" )
        {
            var purchaseRequestIds = purchaseDetails[poId];

            for( i = 0 ; i<purchaseRequestIds.length ; i++ )
            {
                additionalParams += '&requestIds='+encodeURIComponent(purchaseRequestIds[i]);
            }

            var requestIdToHide =  purchaseRequestIds[0];

            var result = confirm( getMessageForKey("sdp.servicerequest.deassociate.multiple.pr.message") );
            if( !result )
            {
                return;
            }
        }
        else
        {
            //In the below line purchaseDetails contains the purchase request id to be detach.
            additionalParams = '&requestIds='+purchaseDetails;//NO I18N
            var requestIdToHide = purchaseDetails;
        }
    }

    if( additionalParams != '' )
    {
        if( task == 'showUnAssociatedPRs' )
        {
            jQuery.ajax({type: 'POST', url: '/PurchaseRequest.do?task=associatePRsToSR&serviceRequestId=' + encodeURIComponent(serviceRequestId) + additionalParams, data: '',contentType: 'application/json; charset=utf-8', dataType: 'text', success: function(responseText) { associatedsrprs = true ; associatePRSuccess(responseText, serviceRequestId) }});//NO I18N
        }
        else
        {
            jQuery.ajax({type: 'POST', url: '/PurchaseRequest.do?task=dissociatePRsFromSR&serviceRequestId=' + encodeURIComponent(serviceRequestId) + additionalParams, data: '',contentType: 'application/json; charset=utf-8', dataType: 'text', success: function(responseText) { associatedsrprs = true ; dissociatePRSuccess(responseText, serviceRequestId , requestIdToHide ) }});//NO I18N
        }
    }
    else
    {
        alert(getMessageForKey('sdp.purchase.request.choose.service.request'));
    }
}

function associatePRSuccess( response, serviceRequestId )
{
    if( response == 'success' )
    {
        jQuery('#ass_success_message').removeClass('hide').show();//No I18N
        jQuery('#success_message').text(getMessageForKey('sdp.purchase.request.associate.pr.success'));//NO I18N
        $req.details.updateRequestTemplates('purchase');//No I18N
        closeDialog();
    }
    else
    {
        jQuery('#ass_error_message').removeClass('hide').show();//NO I18N
        jQuery('#failure_message').text(response);//NO I18N
    }
}

function dissociatePRSuccess( response, serviceRequestId , purchaseRequestId )
{
    if( response == 'success' )
    {
        setTimeout(() => {
            window.showalert('success', getMessageForKey("sdp.workorder.prtopo.detach.success"), 'isAutoHide=true'); //NO I18N
        } ,100);

        jQuery( document.getElementById( "associatedPurchaseItemDetails-"+purchaseRequestId ) ).fadeOut(400,function(){
            jQuery( "#associatedPurchaseItemDetails-"+purchaseRequestId ).remove();
        });
        window.opener.$req.details.updateRequestTemplates('purchase');//No I18N
        if( jQuery( document.getElementById( "associatedpurchaseItem" ) ).children().length == 1 )
        {
            window.setTimeout(function(){
                window.close();
            }, 500);
        }

        jQuery('#ass_success_message').removeClass('hide').show();//NO I18N
        jQuery('#success_message').text(getMessageForKey('sdp.purchase.request.dissociate.pr.success'));//NO I18N
    }
    else
    {
        jQuery('#ass_error_message').removeClass('hide').show();//No i18N
        setTimeout(() => {
            showFailureMessageAndClose(encodeHTML(response), 1500);
        },100);
    }
}

function viewassociatedpurchaseDetails( serviceRequestId , isArchivedRequest)
{
    if ( !isArchivedRequest )
    {
        sdpAjax({type: 'GET', url: encodeURI('/api/v3/servicerequests/'+serviceRequestId+'?INPUT_DATA={ "fields_required" : ["service_request_id"],"include" : ["purchase_orders","purchase_requests","permissions"]}&date='+new Date().getTime()) , data: null , contentType: 'application/json; charset=utf-8', dataType: 'json', success: function(responseJson) { loadassociatedpurchaseDatatoSr( responseJson , serviceRequestId ) }});//NO I18N
    }
    else
    {
        sdpAjax({type: 'GET', url: '/api/v3/servicerequests/'+serviceRequestId+'?&date='+new Date().getTime() , data: null , contentType: 'application/json; charset=utf-8', dataType: 'json', success: function(responseJson) { loadassociatedpurchaseDatatoSr( responseJson , serviceRequestId , isArchivedRequest ) }});//NO I18N
    }
}

function loadassociatedpurchaseDatatoSr( json , serviceRequestId , isArchivedRequest )
{
    var associatedpurchasedetails = ( isArchivedRequest ? json.archived_requests[0] : json.servicerequests );
    var containsAssociatedPurchase = false;
    var purchaseOrderids = {};
    var mutiplePRIdsDeassociate = {};

    jQuery.each( associatedpurchasedetails , function( key , value ){
        if( typeof( value ) == "object" && value != null)
        {
            containsAssociatedPurchase = true;
            jQuery.each( value , function( index , item ){
                if ( key == "purchase_requests" )
                {
                    if(  item.hasOwnProperty( "purchase_order") )
                    {
                        if( purchaseOrderids.hasOwnProperty( item.purchase_order[0].id ) && !isArchivedRequest )
                        {
                            var prId = purchaseOrderids[item.purchase_order[0].id];

                            mutiplePRIdsDeassociate[item.purchase_order[0].id].push( item.request_id );

                            if( jQuery( "#requestedItems-"+prId ).find( "#deassociatePR"+prId ).length )
                            {
                                jQuery( "#requestedItems-"+prId ).find( "#deassociatePR"+prId ).off('click'); //NO I18N
                                if( jQuery( "#requestedItems-"+prId ).attr("isbundled") == undefined )
                                {
                                    jQuery( "#requestedItems-"+prId ).attr("isbundled","false");
                                    jQuery( "#requestedItems-"+prId ).find( "#deassociatePR"+prId ).on('click', function(){
                                        event.stopPropagation();
                                        updateSRPRAssociation("deAssociatedPR",serviceRequestId,mutiplePRIdsDeassociate , item.purchase_order[0].id );
                                    });
                                }
                            }
                        }
                        else
                        {
                            if( !isArchivedRequest )
                            {
                                purchaseOrderids[item.purchase_order[0].id] = item.request_id;
                                mutiplePRIdsDeassociate[item.purchase_order[0].id] = [item.request_id];
                            }

                            setValueForAssociatedPurchasetoSr( item.purchase_order[0] , (item.purchase_order[0]).pr_po_requesteditems ,"purchase_order" , serviceRequestId , item.request_id , json.permissions);
                        }
                    }
                    else
                    {
                        setValueForAssociatedPurchasetoSr( item , item.pr_requestedItems ,key , serviceRequestId, item.request_id , json.permissions );
                    }
                }
                else
                {
                    item.purchase_orders = ( isArchivedRequest ? item : item.purchase_orders );
                    setValueForAssociatedPurchasetoSr( item.purchase_orders , (item.purchase_orders).po_requesteditems ,key , serviceRequestId , null , json.permissions );
                }
            });
        }
    });

    if( !containsAssociatedPurchase )
    {
        jQuery( document.getElementById( "associatedpurchaseItem" ) ).append("<div class='p20 mt20' align='center'><p>"+getMessageForKey("sdp.requests.srassociation.listview.nopurchase")+"</p></div>").addClass("font14px");//NO I18N
    }
}

function setValueForAssociatedPurchasetoSr( itemObj , requestedItemObj , key  , servicerequestid , purchaseRequestId , permission )
{
    var associatePurchaseId = ( key == "associated_purchaseOrders" ?itemObj.id : "-"+purchaseRequestId );//No I18N
    var PurchaseId = ( purchaseRequestId!= null ? "( PR #"+purchaseRequestId+" )": "" );//No I18N
    var purchaseDetailsPageLink = "";
    var headerId = "associatedPurchaseItemDetails"+associatePurchaseId;//No I18N
    var itemCount= "requestedItems"+associatePurchaseId;//No I18N
    var dashedLineId = "dashedLineId"+associatePurchaseId;//No I18N
    var purchasestatusElementId = "purchasestatus"+associatePurchaseId;//No I18N
    var purchaseStatus = itemObj.status.name;
    jQuery( "#associatedpurchaseItem" ).append(jQuery("<div></div>").attr({"class":"pr-track-item" , "id": headerId}));//No I18N
    jQuery( "#"+headerId ).append(jQuery("<div></div>").attr({"class":"clearfix" , "id": itemCount}));
    jQuery( "#"+headerId ).append(jQuery("<ul></ul>").attr({"class":"pr-track clearfix" , "id" : dashedLineId}));
    jQuery( "#"+headerId ).append(jQuery("<ul></ul>").attr({"class":"pr-track-info clearfix" , "id" : purchasestatusElementId }));

    for( i =0 ; i<requestedItemObj.length;i++ )
    {
        jQuery( "#"+itemCount ).append("<p>"+encodeHTML(requestedItemObj[i].itemName)+"<span> ("+requestedItemObj[i].quantity+")</span></p><br>");
    }

    if( key == "associated_purchaseOrders" )
    {
        PurchaseId = "( PO #"+ZSEC.Encoder.encodeForHTML(itemObj.customid)+" )";//No I18N

        if( hasRole( permission, "viewPO" ) )
        {
            purchaseDetailsPageLink = '/PurchaseOrder.do?module=view&poID='+encodeURIComponent(itemObj.id)+'&sectionLoad=false';  //No I18N
        }

        if( hasRole( permission , "detachPO" ) && hasRole( permission , "modifyServiceRequest" ) && purchaseStatus != "Canceled" )
        {
            jQuery( "#"+itemCount ).append("<button type='button' id='detachPO"+associatePurchaseId+"' class='formStylebutton'>"+getMessageForKey("sdp.inventory.addAssetsToWS.deassign.attachedAssets")+"</button>");
            jQuery("#detachPO"+associatePurchaseId).off('click').on('click', (event) => {    // No I18N
                 event.stopPropagation();
                 detachPOs(servicerequestid,associatePurchaseId);
            })
        }
    }
    else
    {
        associatePurchaseId = -(parseInt(associatePurchaseId));

        if( key == "purchase_order" &&  hasRole( permission , "viewPO" ) )
        {
            purchaseDetailsPageLink = '/PurchaseOrder.do?module=view&poID='+encodeURIComponent(itemObj.id)+'&sectionLoad=false';  //No I18N
        }
        var prsitecheck = false;
        if(sdp_user.ROLES.indexOf("Restrict site access") > -1){
            if(itemObj.site == null){
                itemObj.site=0;
            }
            if(site_details.hasOwnProperty(itemObj.site)){
                prsitecheck = true;
            }
        }
        else{
            prsitecheck = true;
       }

        if( key !="purchase_order" && hasRole( permission , "viewPR" ) && prsitecheck)
        {
            purchaseDetailsPageLink = '/PurchaseRequest.do?task=viewPR&requestId='+encodeURIComponent(purchaseRequestId)+'&sectionLoad=false';  //No I18N
        }
        if(!prsitecheck){
            setTimeout(function(){
                let link = document.querySelector('[id^=open-purchase-details-purchasestatus-'+Number(purchaseRequestId)+']'); //No I18N
                if (link) {
                    link.style.pointerEvents = "none"; //No I18N
                }
            },0);
        }

        PurchaseId = ( key == "purchase_order" ? "( PO #"+ZSEC.Encoder.encodeForHTML(itemObj.customid)+" )" : PurchaseId );//No I18N

        var serviceRequestStatus = null;

        if( window.opener != null )
        {
            serviceRequestStatus = jQuery("#status_PH", window.opener.document ).text().trim();
        }

        if( hasRole( permission, "detachPR" ) && hasRole( permission , "modifyServiceRequest" ) && purchaseStatus != "Closed" && serviceRequestStatus != "Closed" && prsitecheck)
        {
            jQuery( "#"+itemCount ).append("<button type='button' id='deassociatePR"+associatePurchaseId+"' class='formStylebutton'>"+getMessageForKey("sdp.inventory.addAssetsToWS.deassign.attachedAssets")+"</button>");
            jQuery("#deassociatePR"+associatePurchaseId).off('click').on('click', (event) => {    // No I18N
                event.stopPropagation();
                updateSRPRAssociation('deAssociatedPR',servicerequestid,associatePurchaseId);  // No I18N
            })
        }
    }

    var isReceivedMss = getMessageForKey("sdp.purchase.status.poreceiveitems");
    var isorderedMss = getMessageForKey("sdp.purchase.workflow.order")+" <br><span>"+( itemObj.orderedDate!=null ? getMessageForKey("sdp.reports.default.createdonmsg")+" "+itemObj.orderedDate.display_value : '')+"</span>";//No I18N

    if( purchaseStatus == "Canceled" || ( purchaseStatus == "Closed" && key == "purchase_requests" ) || purchaseStatus == "Rejected" )
    {
        if( key != "purchase_requests" && itemObj.orderedDate != null &&  purchaseStatus == "Canceled" )
        {
            jQuery( "#"+dashedLineId ).append("<li class='success-dashed-line'><span class='success'></span></li>");
            jQuery( "#"+dashedLineId ).append("<li class='error-dashed-line'><span class='success'></span><span class='error after'></span></li>");
        }
        else
        {
            if( purchaseStatus == "Closed" )
            {
                jQuery( "#"+dashedLineId ).append("<li class='closed-dashed-line'><span class='success'></span></li>");
                jQuery( "#"+dashedLineId ).append("<li class='closed-dashed-line'><span class='closed after'></span></li>");
            }
            else
            {
                jQuery( "#"+dashedLineId ).append("<li class='error-dashed-line'><span class='success'></span></li>");
                jQuery( "#"+dashedLineId ).append("<li class='error-dashed-line'><span class='error after'></span></li>");
            }
            isorderedMss = "&nbsp;";//No I18N
        }
        isReceivedMss = purchaseStatus;
    }
    else if( key != "purchase_requests" )
    {

        if( purchaseStatus == "Ordered" )
        {
            jQuery( "#"+dashedLineId ).append("<li class='success-dashed-line'><span class='success'></span></li>");
            jQuery( "#"+dashedLineId ).append("<li class='dashed-line'><span class='success'></span><span class='after'></span></li>");
        }
        else if( purchaseStatus == "Items Received" || purchaseStatus == "Partially Received" || purchaseStatus == "Closed" || purchaseStatus == "Payment Done" || purchaseStatus == "Invoice Received" )
        {
            jQuery( "#"+dashedLineId ).append("<li class='success-dashed-line'><span class='success'></span></li>");

            if( itemObj.orderedDate != null )
            {
                jQuery( "#"+dashedLineId ).append("<li class='success-dashed-line'><span class='success'></span><span class='success after'></span></li>");
            }
            else
            {
                jQuery( "#"+dashedLineId ).append("<li class='success-dashed-line'><span class='success after'></span></li>");
                isorderedMss = "&nbsp;";//No I18N
            }

            if( purchaseStatus == "Partially Received" )
            {
                isReceivedMss = getMessageForKey("sdp.purchase.status.partialreceive");
            }

            if( itemObj.receivedDate != null )
            {
                isReceivedMss += "<br><span>"+getMessageForKey("sdp.reports.default.createdonmsg")+" "+itemObj.receivedDate.display_value+"</span>";//No I18N
            }
        }
        else
        {
            jQuery( "#"+dashedLineId ).append("<li class='dashed-line'><span class='success'></span></li>");
            jQuery( "#"+dashedLineId ).append("<li class='dashed-line'><span></span><span class='after'></span></li>");
        }
    }
    else
    {
        jQuery( "#"+dashedLineId ).append("<li class='dashed-line'><span class='success'></span></li>");
        jQuery( "#"+dashedLineId ).append("<li class='dashed-line'><span></span><span class='after'></span></li>");
    }

    jQuery( "#"+purchasestatusElementId ).append("<li>"+getMessageForKey("sdp.requests.history.created")+" <a id='open-purchase-details-"+purchasestatusElementId+"' href='/'>"+PurchaseId+"</a><br><span>on "+itemObj.created_date.display_value+"</span></li>");
    jQuery("#open-purchase-details-"+purchasestatusElementId).off('click').on('click', (event) => {    // No I18N
        if(window.opener.window.externalframe) {
            window.location.href=purchaseDetailsPageLink;
            window.resizeTo(screen.width-300,screen.height-100);
        }
        else{
            window.opener.location.href=purchaseDetailsPageLink;
            window.close();
        }
    })

    jQuery( "#"+purchasestatusElementId ).append("<li class='tc'>"+isorderedMss+"</li>");
    jQuery( "#"+purchasestatusElementId ).append("<li class='tr'>"+isReceivedMss+"</li>");
}

function showAssociatePage( id, module, isArchivedRequest )
{
        var url = "/PurchaseRequest.do?task=showUnAssociatedPRs&serviceRequestId=" + encodeURIComponent(id) + '&isArchivedRequest=' + encodeURIComponent(isArchivedRequest);  // NO I18N
        var options ="modal=yes,closeButton=no,position=absmiddle";  // NO I18N
        if(window.externalframe){
            options = options+', width=1000';  // NO I18N
        }
        showURLInDialog(url,options,function(){
            if(window.externalframe){
                jQuery("#_DIALOG_LAYER").css({ // NO I18N
                    position:"fixed", // NO I18N
                    top:10
                });
            }else{
                jQuery("#_DIALOG_LAYER").css({top:100});  // NO I18N
            }
        });  
 
}
/* Project Ends  hers */
/**
* Script for loading technician worklog timer details for list view
*/
function startTechnicianTimer(workorderId)
{
    var status = jQuery('#worklogComment'+workorderId).val();
  changeIcon("stop",workorderId);//No I18N
  status = status.substring(0,500);
    stopTechTimer(status,workorderId,null);//No I18N
}
function renderTechPopup(workingTechnicians,requestId)
{
    //console.log("working technicians"+JSON.stringify(workingTechnicians));
    var techJson=(workingTechnicians);
    //console.log("tech json"+JSON.stringify(techJson));
    //console.log(workingTechnicians.RENDERICON);
    if(workingTechnicians.RENDERICON === false)
    {
        return;
    }
    var worklogdiv = jQuery('#worklogdiv'+requestId);
    var commentsDiv = '';
    var techCount = techJson.TECHCOUNT;
    for(key in techJson)
    {
       if(key!=="CURRENTTECH" && key!=="CURRENTTECHSTART" && key!=="TECHCOUNT" && key!=="ISADMIN" && key!=="ADDWORKLOG")
       {
            var currentJson = techJson[key];
            //console.log(JSON.stringify(currentJson));
            if(currentJson.ISCURRENTTECH === "TRUE")
            {
                worklogdiv.attr('currentTech',currentJson.OWNERID);
            }
            var commentDiv = jQuery("#commentDiv").clone();
            var username = encodeHTML(currentJson.OWNERNAME);
            var startedTime = getMessageForKey("sdp.request.view.technician.timer.startedat")+' '+currentJson.STARTTIME;//No I18N
            var message = encodeHTML(currentJson.STATUS);
             //This is done to encode \r\n characters during xssecncoding
               message = message.replace(/&#xa;/g, "<br>");//No I18N
               message = message.replace(/&#xd;/g, "");  //No I18N
             // these lines are commented as these were encoded by webclientUtil.getEscapedStringForForm
             //message = message.replace(/</g, "&lt;");//No I18N
             //message = message.replace(/&#10;/g, "<br>");//No I18N

            var timeDiff = currentJson.ELAPSEDTIME;
            var hours;
            var minutes;
            var totalTime;
            var temp = timeDiff.split(':');
            hours = temp[0] + 'h';
            minutes = temp[1] + 'm';
            totalTime = hours + ' ' + minutes;
            commentDiv.find('.username').html(username);
            commentDiv.find('.startedTime').html(startedTime);
            commentDiv.find('.message').html(message);
            commentDiv.find('.timeDiff').html(totalTime);
            commentsDiv = commentsDiv + commentDiv.html();

       }
       if(key == "CURRENTTECH")
       {


            jQuery('#worklogdiv'+requestId).find('.wip-iy').html(getMessageForKey("sdp.request.view.technician.timer.stopyourworklogtimer"));//No I18N
            worklogdiv.find('.wlt-cmnt-div').hide();
            worklogdiv.find('.add-to-wl').off('click');//NO I18N
            if(techJson.hasOwnProperty('ADDWORKLOG'))
           {
            jQuery('#worklogdiv'+requestId).find('.add-to-wl').addClass('active');
          }
            if(!isMSPOrSCP || techJson.ADDWORKLOG) {
                // this block is always executed for SDP
            worklogdiv.find('.add-to-wl').on('click', function(){
                addWorklog(requestId,worklogdiv.attr('currenttech'));
            });
        }
            jQuery('#startTimer'+requestId).find('img').removeClass('list-sprite icon-sm start-timer-icon');
            jQuery('#startTimer'+requestId).find('img').addClass('list-sprite icon-sm stop-timer-icon');
            jQuery('#startTimer'+requestId).find('span').html('<img class="list-sprite icon-sm stop-timer-icon" src="/images/spacer.gif" width="16" height="19">'+getMessageForKey("sdp.request.view.technician.timer.stoptimer"));//No I18N
            jQuery('#startTimer'+requestId).find('span').attr('title',getMessageForKey("sdp.request.view.technician.timer.stopyourworklogtimer"));
            jQuery('.add-to-wl').attr('title',getMessageForKey("sdp.request.view.technician.timer.stoptimerandaddtoworklog"));
            jQuery('#startTimer'+requestId).off('click');//No I18N
            jQuery('#startTimer'+requestId).on('click', function(){
            stopTechTimer("",requestId,null);
            stopWorking(requestId);
            jQuery('#worklogdiv'+requestId).fadeOut();
            setTimeout(function(){
              jQuery('#worklogdiv'+requestId).find('.wlt-cmnt-div').show();
            },1000);
            jQuery('#worklogdiv'+requestId).remove();
                 });
         }
          }
    if(techCount === 0 )
    {
        jQuery('#worklogdiv'+requestId).find('.wip-iy').html(getMessageForKey("sdp.request.view.technician.timer.startyourworklogtimer"));
        jQuery('#startTimer'+requestId).attr('title',getMessageForKey("sdp.request.view.technician.timer.nooneisworkingonthisrightnow"));
    }
    if(commentsDiv != ''){
     commentsDiv = '<ul id=commentLength'+requestId+'>' + commentsDiv + '</ul>';
     worklogdiv.find('.wlt-comment').prepend(commentsDiv);
     if(!jQuery('#startTimer'+requestId).find('img').hasClass('stop-timer-icon'))
     {
     jQuery('#startTimer'+requestId).find('span').attr('title',getMessageForKey("sdp.request.view.technician.timer.startyourworklogtimer"));
     if(jQuery('#commentLength'+requestId+' li').length === 1)
        {
            jQuery('#startTimer'+requestId).find('span').attr('title',getMessageForKey("sdp.request.view.technician.timer.startyourworklogtimer"));
        }
        jQuery('#worklogdiv'+requestId).find('.wip-iy').html(getMessageForKey("sdp.request.view.technician.timer.startyourworklogtimer"));
    }
    }
    jQuery('#worklogdiv'+requestId).css('display','');//No I18N
    var oft = jQuery('#timericon-request'+requestId).offset().top;
        oh = jQuery('#worklogdiv'+requestId).height();
        wlb = oft+oh;
       // wloft = jQuery('#worklogdiv'+requestId).offset().top;
        rst = jQuery('#content').offset().top;
        rsh = jQuery('#content').height();
        rsb = rst + rsh;
    if(wlb>rsb){
      jQuery('#worklogdiv'+requestId).css('top',-(wlb-rsb)+2).find('span.wlt-tip').css('top',(wlb-rsb)-1);//NO I18N
    }

    else{
    	jQuery('#worklogdiv'+requestId).find('span.wlt-tip').css('top',8);//NO I18N
    }
    // Position the timer popup horizontally
    if (jQuery("body").css("direction").toLowerCase() == "rtl"){
        if((jQuery('#timericon-request'+requestId).offset().left)<400){
            jQuery('#timericon-request'+requestId).find('.worklog-timer').addClass('show-at-left');
        }
        else{
            jQuery('#timericon-request'+requestId).find('.worklog-timer').removeClass('show-at-left');
        }
    }
    else{
        if((jQuery(document).width()-jQuery('#timericon-request'+requestId).offset().left)<400){
            jQuery('#timericon-request'+requestId).find('.worklog-timer').addClass('show-at-left');
        }
        else{
            jQuery('#timericon-request'+requestId).find('.worklog-timer').removeClass('show-at-left');
        }
    }
    jQuery('#worklogdiv'+requestId).css('display','').find('textarea').trigger('focus');//No I18N
}
function changeIcon(to,requestId)
{
var selectElement=jQuery("#innertimericon-request"+requestId);
if(to==="stop"){
        jQuery("#timericon-request"+requestId).children("img").attr('src','images/timer-clock-icon.gif');//No I18N
        jQuery("#timericon-request"+requestId).children("img").removeClass("list-sprite icon-sm start-timer-icon"); //No I18N
        jQuery("#timericon-request"+requestId).children("img").attr('title',getMessageForKey("sdp.request.view.technician.timer.stopyourworklogtimer"));//No I18N
        if((jQuery('#wlt-item')!=='undefined'))
    {

        if(jQuery('#wlt-item').hasClass('pleft6'))
        {
            jQuery('#wlt-item').find('a').html(getMessageForKey("sdp.request.view.technician.timer.worklogtimer")+'<i class="pright40"></i>');
        }
    }
}
else if(to==="completed")
{
jQuery(selectElement).removeClass();
jQuery(selectElement).off("click");//No I18N
jQuery(selectElement).addClass("wklog-timenrml");
}
else if(to==="remove")
{
jQuery(selectElement).remove();
}
else if(to==="start")
{
    jQuery("#timericon-request"+requestId).addClass('active');

}
}
function autoFillWorkLogFromTimer(worklogDetails, requestId, userId, refresh) {
    if(window.req_details) {
        worklogDetails = JSON.parse(worklogDetails);
        worklogDetails.technicianid = sdp_user.LOGGEDIN_USERID;
        /* timerDetailsFetch is used in AddWorklog.jsp, as it is a common file, this variable is still maintained in window scope */
        if(worklogDetails) {
            window.timerDetailsFetch = worklogDetails
        } else {
            window.timerDetailsFetch = null;
        }
        if(refresh === false) {
            $req.details.changeTab('worklogs', ['createNewWorkLog']);  //No I18N
            window.showalert('info', getMessageForKey('sdp.request.view.technician.timer.autopopulating'), 'isAutoHide=true');  //No I18N
        } else {
            jQuery.ajax({
                url: "WorkOrder.do?woMode=viewWO&woID="+requestId+"&autoWorkLog=true",  //No I18N
                type: "GET",   //No I18N
                success: function(data) {
                    /*
                     * After clicking 'Add To Worklog', the timer has been stopped and the timer details are taken to populate the Worklog form to create a new Worklog
                     * The WO Header should be updated and the timer count also should be updated.
                     */
                    $req.details.timer_info = $req.header.getTimer(requestId);
                    $req.details.getWOLinks(requestId);
                    $req.details.renderWOHeader();
                    $req.header.updateTimer(requestId, true);
                    jQuery("iframe[name='DummyListView_RESPONSEFRAME']").ready(function(){
                         $req.details.changeTab('worklogs', ['createNewWorkLog']);  //No I18N
                         window.showalert('info', getMessageForKey('sdp.request.view.technician.timer.autopopulating'), 'isAutoHide=true');  //No I18N
                    });
                }
            });
        }
    } else {
        if(window.externalframe){
            // TASK-79859
            window.top.location.assign('/WorkOrder.do?woMode=viewWO&woID='+encodeURIComponent(requestId)+'&autoWorkLog=true&fromListView=true');//No i18N
        }else{
            //mode viewWO is not POST call so changing
            window.location.assign('/WorkOrder.do?woMode=viewWO&woID='+encodeURIComponent(requestId)+'&autoWorkLog=true&fromListView=true');//No i18N
        }        // jQuery("#autoPopWorkLogForm").attr("action","WorkOrder.do?woMode=viewWO&woID="+encodeURIComponent(requestId)+"&&fromListView=true");    //No I18N
        // jQuery("#addWorkLogInputField").val("true");    //No I18N
        // jQuery("#autoPopWorkLogForm").submit(); //No I18N
        // jQuery("#addWorkLogInputField").val("false");   //No I18N
    }
}

function initializeTechnicianTimer()
{
    foundRequestIds=[];
jQuery(document).find('[groupid]').each(function(index){
                var iconElement=this;
                var currentRequestId=jQuery(this).attr('requestid');
                foundRequestIds.push(currentRequestId);
                jQuery(this).attr('name','timerIconNav');

                jQuery(this).html("<img src='/images/spacer.gif' title="+"'"+getMessageForKey("sdp.request.view.technician.timer.nooneisworkingonthisrightnow")+"'"+"rel='uitip' width='20' height='20' class='list-sprite cur-ptr icon-sm start-timer-icon-off'><span class='wlt-tech-count pos-rel right0 top2' id=techCount"+currentRequestId+"></span>");//No I18N

                jQuery(this).find('img').on('click', function(){
                    jQuery(this).closest('.d_w').css('overflow','visible'); //NO I18N
                      var temp = jQuery('#worklogdiv').clone();
                      jQuery(temp).find('.add-to-wl').html(getMessageForKey("sdp.request.view.technician.timer.addtoworklog"));
                      jQuery(temp).find('.timerSpan').append(getMessageForKey("sdp.request.view.technician.timer.starttimer"));
                      jQuery('#timericon-request'+currentRequestId).parent().removeClass('sb');
                      jQuery(temp).attr('id',"worklogdiv"+currentRequestId);
                      jQuery('.worklog-active').remove();
                      jQuery(temp).addClass('worklog-active');
                      jQuery(temp).find('.wlt-close').attr('reqid',currentRequestId);
                      jQuery(temp).find('.wlt-start-action').attr('id','startTimer'+currentRequestId);
                      jQuery(temp).find('.wlt-start-action').attr('reqid',currentRequestId);
                      jQuery(temp).find('textarea').attr('id','worklogComment'+currentRequestId);
                      // jQuery(temp).find('textarea').attr('placeholder',getMessageForKey("sdp.request.view.technician.timer.commenthere"));
                      jQuery(temp).find('.mb5 b').text(getMessageForKey('sdp.request.view.technician.timer.addcomment'));
                      jQuery(temp).find('.mb5 .fontgray').text('('+getMessageForKey('sdp.request.view.technician.timer.characters',[500])+')');
                      if(jQuery('#worklogdiv'+currentRequestId).length)
                      {
                        jQuery('#worklogdiv'+currentRequestId).html(jQuery(temp).html());
                      }
                      else
                      {
                      jQuery(temp).appendTo(jQuery(this).parent());
                      }
                        getWorkingTechnicians(currentRequestId);
                        jQuery('.wlt-close').on('click', function(){
                        var reqid = jQuery(this).attr('reqid');
                        jQuery('#worklogdiv'+reqid).remove();
                    });
                        jQuery('#startTimer'+currentRequestId).on('click', function(){
                        var statusComment = jQuery('#worklogComment'+currentRequestId).val();
                        startTechnicianTimer(currentRequestId);
                        var wlt_div =jQuery(this).parent().closest('.worklog-timer');//No I18N
                        //t = wlt_div.find('textarea').val().replace(/\n\r?/g, '<br />');
                        tech_len = wlt_div.find('ul li').length;

                        count = jQuery(this).parent().closest('div.wlt-div').find('.wlt-tech-count').text();//No I18N
                        if(!count){ count = 1; }
                     if(tech_len==0){
                        wlt_div.find('ul').show();
                        wlt_div.find('textarea').hide();
                        wlt_div.find('.wlt-head h4').text(getMessageForKey("sdp.request.view.stopyourworklogtimer"));//No I18N
                        jQuery(this).parent().closest('div.wlt-div').find('img').addClass('list-sprite icon-sm stop-timer-icon').attr('title',getMessageForKey("sdp.request.view.technician.timer.stopyourworklogtimer")).attr('src','images/timer-clock-icon.gif').css('background-image','none');//No I18N
                        wlt_div.parent().addClass('active');
                         }

                     else{
                        wlt_div.parent().addClass('wlt-multi-tech');
                         jQuery(this).parent().closest('div.wlt-div').find('img').addClass('list-sprite icon-sm stop-timer-icon').attr('title',getMessageForKey("sdp.request.view.technician.timer.stopyourworklogtimer")).attr('src','images/timer-clock-icon.gif').css('background-image','none');//No I18N
                         jQuery(this).parent().closest('div.wlt-div').find('.wlt-tech-count').text(parseInt(count)+1);//No I18N
                         if((jQuery('#wlt-item')!=='undefined'))
                      {
                            var wltItem = jQuery('#wlt-item');
                            if(jQuery('#wlt-item').hasClass('pleft6'))
                           {
                               jQuery('#wlt-item').removeClass('wlt-no-count');
                           }
                       }
                        }
                         wlt_div.find('.add-to-wl').addClass('active');

                        jQuery('#timericon-request'+currentRequestId).find('img').removeClass('list-sprite icon-sm start-timer-icon');
                        var reqid = jQuery(this).attr('reqid');
                        jQuery('#worklogdiv'+reqid).remove();
                        });
                });

        });//No I18N
if((jQuery('#wlt-item')!=='undefined'))
                      {
                            var wltItem = jQuery('#wlt-item');
                            if(jQuery('#wlt-item').hasClass('pleft6'))
                           {
                               jQuery('#wlt-item').on('mouseenter mouseleave', function()
                                {
                                  var imgTitle =  jQuery('#wlt-item').find('img').attr('title');
                                  jQuery('#wlt-item').attr('title',imgTitle);
                                });
                           }
                       }
parent.initTooltip('#wlt-item'); //NO I18N
}
function stopWorking(requestId)
{
    jQuery('#timericon-request'+requestId).find('img').attr('src','images/spacer.gif');
    jQuery('#timericon-request'+requestId).find('img').removeClass('list-sprite icon-sm stop-timer-icon');
    jQuery('#timericon-request'+requestId).find('img').addClass('list-sprite icon-sm start-timer-icon');
    jQuery('#timericon-request'+requestId).find('img').css('background-image','');//No I18N
    var techCount = jQuery('#techCount'+requestId).html();
    if(techCount != '')
    {
        if(techCount == 2)
        {
            jQuery('#techCount'+requestId).html('');
            jQuery('#timericon-request'+requestId).find('img').attr('title',getMessageForKey("sdp.request.view.technician.timer.technicianisworkingonthisrightnow"));
            if((jQuery('#wlt-item')!=='undefined'))
                      {
                            var wltItem = jQuery('#wlt-item');
                            if(jQuery('#wlt-item').hasClass('pleft6'))
                           {
                               jQuery('#wlt-item').addClass('wlt-no-count');
                           }
                       }
        }
        else
        {
            var newCount = techCount-1;
            jQuery('#techCount'+requestId).html(String(newCount ));
            jQuery('#timericon-request'+requestId).find('img').attr('title',getMessageForKey("sdp.request.view.technician.timer.techniciansareworkingonthisrightnow",newCount));

        }
    }
    else
    {
        jQuery('#timericon-request'+requestId).removeClass('active');
        jQuery('#timericon-request'+requestId).find('img').attr('title',getMessageForKey("sdp.request.view.technician.timer.nooneisworkingonthisrightnow"));
    }

}
if (!workorder) {
    var workorder = {};
}
workorder.viewWO = function() {
        //you can define some global values here
}
workorder.viewWO.prototype = {
callAssess: function(jsonRes) {
        var otherInfoObj = jsonRes.otherInfo, overDueTime = otherInfoObj.Overdue,responseOverDueTime = otherInfoObj.FR_Overdue,  buildAsses = jQuery('#assessInfo');//No i18N
        if (otherInfoObj !== "") {
            if (overDueTime === "") {
                buildAsses.find("#t_due_label").html("");
                //buildAsses.find("#dueH,#dueV").remove();
            } else {
                buildAsses.find('#dueV').removeClass().addClass('show').end().find('#t_due').html(overDueTime);
            }
            if (responseOverDueTime === "") {
                buildAsses.find("#t_fr_overdue_label").html("");
                //buildAsses.find("#dueH,#dueV").remove();
            }
            //SD-63376 : For completed and not responded request, responseOverDueTime will contain message "Not Responded".Displaying the same in Assessment details page.
            else if(responseOverDueTime == getMessageForKey("sdp.admin.response.not.done")){
                buildAsses.find("#t_fr_overdue_label").html(responseOverDueTime);
            }else {
                buildAsses.find('#t_fr_due').html(responseOverDueTime);
            }
            buildAsses.find('#t_FR_SLA').html(otherInfoObj.FR_SLA).end().find('#t_SLA').html(otherInfoObj.SLA).end().find('#t_Grp').html(otherInfoObj.Group).end().find('#t_Tech').html(otherInfoObj.SRep).end().find("#allGrp tr").slice(1).remove().end().end().find("#allTech tr").slice(1).remove().end().end().find("#allGrp").append($viewWO.getTrNArr(jsonRes.groupSumation, "grp")).end().find("#allTech").append($viewWO.getTrNArr(jsonRes.techSumation, "tech"));//No I18N
               $viewWO.renderJSONData("dtId", "57", jsonRes.StatusChartInfo, "dummy_Bar", '');//No I18N
               $viewWO.renderJSONData("stId", "57", jsonRes.StatusChartInfo, "s_Bar", otherInfoObj);//No I18N
            $viewWO.populateStatusLegend(jsonRes.StatusChartInfo,otherInfoObj);//No I18N
               $viewWO.renderJSONData("gpId", "63", jsonRes.GroupChartInfo, "g_Bar", "");//No I18N
               $viewWO.renderJSONData("srId", "20", jsonRes.TechChartInfo, "t_Bar", "");//No I18N
            jQuery("#allGrp").off('click').on('click', '[data-attr="group_data_view"]', function(event) {
                let eleDataset = event.currentTarget.dataset;
                let group_name = eleDataset.group;
                let index = assessJson.groupSumation.findIndex(group => group.name === group_name);
                $viewWO.showAssessPeriod(index,group_name,assessJson.groupSumation[index].detailsinfo,'grp');
                showDialog(jQuery('#grp_div_' + index).html(), "position=relative,left=-150,draggable=no,closeButton=no,closeOnBodyClick=yes"); //No I18N
            });
            jQuery("#allTech").off('click').on('click', '[data-attr="tech_data_view"]', function(event) {
                let eleDataset = event.currentTarget.dataset;
                let tech_name = eleDataset.tech;
                let index = assessJson.techSumation.findIndex(tech => tech.name === tech_name);
                $viewWO.showAssessPeriod(index,tech_name,assessJson.techSumation[index].detailsinfo,'tech');
                showDialog(jQuery('#tech_div_' + index).html(), "position=relative,left=-150,draggable=no,closeButton=no,closeOnBodyClick=yes"); //No I18N
            });
        } else {
            buildAsses.find("#assessment_content").removeClass().addClass('hide');
            buildAsses.find("#noInfo").removeClass().addClass('show');
            //$Class("assessDetails", "hide");//No I18N
            //$Class("noInfo", "show");//No I18N
        }
    },
   getTrNArr: function(jsonObj, from) {
        var detailsObj = $ID("_det1"), obj = $ID("trObj").getElementsByTagName('tbody')[0], tdObj = obj.getElementsByTagName('tr')[0], len = jsonObj.length, i, tr = "";//No I18N
        for (i = 0; i < len; i++) {
            var name = encodeHTML(jsonObj[i].name), detailsinfo = jsonObj[i].detailsinfo, details = "";
            if (detailsinfo.length > 1) {
                var detObj = detailsObj.getElementsByTagName("a")[0], popUpLoc = "right";//No I18N
                detObj.setAttribute("id", from + "_det_" + i);//No I18N
                if(from==='tech'){
                    detObj.setAttribute("data-attr","tech_data_view"); //No I18N
                    detObj.setAttribute("data-tech",name); //No I18N
                }
                //IssueID 65952
                if (from === "grp") {
                    popUpLoc = "left"; //No I18N
                    detObj.setAttribute("data-attr","group_data_view"); //No I18N
                    detObj.setAttribute("data-group",name); //No I18N
                }
                details = detailsObj.innerHTML;
            }
            var result=getMessageForKey("sdp.common.notconfigured"),dueTime="",timeElapse,isViolated=false,setColor="";
            if(jsonObj[i].id == "-1"){
                result = "-";
            }
            if(jsonObj[i].ola_time != undefined){
                result = jsonObj[i].ola_time;
            }
            if(jsonObj[i].diff_status != undefined && jsonObj[i].diff_status != ""){
                dueTime=jsonObj[i].diff_status;
            }
            if(jsonObj[i].is_violated != undefined){
                isViolated=jsonObj[i].is_violated;
            }
            var _index;
            tdObj.getElementsByTagName("td")[0].innerHTML = name;//No I18N
            if(from === "grp"){
                tdObj.getElementsByTagName("td")[1].innerHTML = result;//No I18N
                _index=2;
                if(dueTime != ""){
                    if(isViolated==true){
                        setColor="<p class='text-warning sb'>("+dueTime+")</p>";
                    }
                    else{
                        setColor="<p class='text-success sb'>("+dueTime+")</p>";
                    }
                }
                timeElapse=jsonObj[i].time + details + setColor;
            }
            else{
                _index=1;
                if(tdObj.getElementsByTagName("td")[2]) {
                    tdObj.getElementsByTagName("td")[2].remove();
                }
                timeElapse=jsonObj[i].time + details
            }

            tdObj.getElementsByTagName("td")[_index].innerHTML = timeElapse;//No I18N
            tr += obj.innerHTML;
        }
        return tr;
    },
    showAssessPeriod: function(idSuffix, name, detailsObj, from) {
        var j, obj = JSON.stringify(detailsObj), len = Object.keys(detailsObj).length, cls, detailTrTd, id = from + "_div", oldId = $Html("oldId"), newId = id + "_" + idSuffix, idToWork = id;//No I18N
        if (oldId !== "") {
            idToWork = oldId;
        }
        $Html(idToWork, "");
        $ID("_detHdr").getElementsByTagName("span")[0].innerHTML = name;//No I18N
        $Html(from + "Header", $Html("_detHdr"));//No I18N
        detailTrTd = $Html("_" + from + "Header");//No I18N
        detailTrTd = detailTrTd.substring(0, (detailTrTd.trim().length - 22));
        for (j = len - 1; j >= 0; j--) {
            cls = "oddRow";//No I18N
            if (j % 2 !== 0) {
                cls = "evenRow";//No I18N
            }
            var timeObj = $ID("_detTimeObj").getElementsByTagName("tbody")[0], tdObj = timeObj.getElementsByTagName("tr")[0], obj = tdObj.getElementsByTagName("td");//No I18N
            obj[0].className = cls;
            obj[0].innerHTML = detailsObj[j].sTime + " - " + detailsObj[j].eTime;
            obj[1].className = cls;
            obj[1].innerHTML = detailsObj[j].period;
            detailTrTd += timeObj.innerHTML;
        }
        detailTrTd += "</tbody></table></div>";//No I18N
        $Html(idToWork, detailTrTd);
        var oldIdObj = jQuery("#" + idToWork);
        oldIdObj.find('div').css('width', 'auto');  //No I18N
        oldIdObj.removeAttr("id");//No I18N
        oldIdObj.attr("id", newId);//No I18N
        $Html("oldId", newId);//No I18N
    },
    showAssessTab: function(woId) {
        var requestTabs = new Array('request', 'account', 'timeEntry', 'history', 'resolution', 'approval', 'activity', 'assess'), i, tabsLen = requestTabs.length, tabName, woUrl = "/WorkOrder.do?woMode=assessWO&woID=" + encodeURIComponent(woId); //No I18N
        for (i = 0; i < tabsLen; i++) {
            var tabName = requestTabs[i] + "Details";
            if ($ID(tabName + "_tab") !== null) {
                var tab = "", cls = "hide";//No I18N
                if (tabName === "assessDetails") {//No I18N
                    tab = "currenttab";//No I18N
                    cls = "show"//No I18N
                }
                $Class(tabName, cls);
                $Class("a_" + tabName, tab);//No I18N
                $Class("span_" + tabName, tab);//No I18N
            }
        }
        AjaxAPI.sendRequest({METHOD:"GET", ASYNCHRONOUS:false, URL:woUrl, TARGET:"_div_assessDetails", EFFECT:null});//No I18N
    },
    renderJSONData: function(labelId, labelPadding, fusionInfo, toId, otherInfoObj) {
        var chartSeriesData = [], stime, etime=0, colors = [];
        for(var f=0;f<fusionInfo.length; f++) {
            var node = fusionInfo[f];
            stime = etime;
            etime = etime+5; //some time node.time is 0 so which causing issues so using static value 5
            var data = [node.label, [stime,etime], node.name, node.sTime, node.eTime, node.realTime];
            chartSeriesData.push(data);
            colors.push(node.color);
        }
        if(otherInfoObj && otherInfoObj.isClosed) {
            chartSeriesData.push(["Status", [etime, etime+1], otherInfoObj.closedName, "", "", ""]);
            colors.push(otherInfoObj.closedColor);
        }
        colors.reverse();
        $viewWO.renderGanttChart(chartSeriesData, toId, colors);
    },
    renderGanttChart: function(chartSeriesData, divId, colors) {
        var container = document.getElementById(divId);
        jQuery(container).empty();
        var chartData = {
            seriesdata: {
                chartdata: [ { type: "gantt", data: [ chartSeriesData ] } ] //No I18N
            },
            metadata: {
                axes: {
                    x: [0], y: [[1]],
                    tooltip: [ "<span class='font-small'><strong>{{val(2)}}, {{val(5)}}</strong><br>{{val(3)}} - {{val(4)}}</span>" ] //No I18N
                },
                columns: [
                    { dataindex: 0, columnname: "Task", datatype: "ordinal" }, //No I18N
                    { dataindex: 1, columnname: "Duration", datatype: "numeric" }, //No I18N
                    { dataindex: 2, columnname: "Name", datatype: "ordinal" }, //No I18N
                    { dataindex: 3, columnname: "Start Time", datatype: "ordinal" }, //No I18N
                    { dataindex: 4, columnname: "End Time", datatype: "ordinal" }, //No I18N
                    { dataindex: 5, columnname: "Real Time", datatype: "ordinal" } //No I18N
                ]
            },
            chart: {
                axes: {
                    rotated: true,
                    xaxis: { reversed: true, show: false, axisline: { show: false }, label: { show: false } },
                    yaxis: [ { show: false } ]
                },
                plot: {
                    plotoptions: {
                        gantt: {
                            multiColoring: true, maxBandWidth: 10, fillOpacity: 0.5,
                            border: { show: true, size: 1, style: "solid", color: "rgb(186, 186, 186)" } //No I18N
                        }
                    }
                }
            },
            legend: {
                colors: colors
            },
            tooltip: {
                backgroundColor: "white", //No I18N
                opacity: 1,
                layout: "horizontal", //No I18N
                maxWidth: 500,
                fontColor: "rgba(0,0,0,0.7)", //No I18N
                borderColor: "rgb(186, 186, 186)" //No I18N
            },
            canvas: {
                title: { show: false },
                subtitle: { show: false },
                border: { show: false },
                background: { alpha: 0 }
            }
        };
        var chartObj = new $ZC.charts(container, chartData);
    },
    populateStatusLegend: function(fusionInfo,otherInfoObj) {
        var statusLegendArray = {
    statuslegend: []
};
var uniqueStatus = [];
var closedName=otherInfoObj.closedName;
//If the status is moved from open to closed, closed info will not be available in json obj. hence, getting it from otherinfo JSON
if(closedName!==null && closedName!==undefined){
    uniqueStatus.push(closedName);
    statusLegendArray.statuslegend.push({
        "statusName" : closedName,//No i18N
        "statusColor"  : otherInfoObj.closedColor//No i18N
    });
}

jQuery.each(fusionInfo, function(index, item) {
    if (uniqueStatus.indexOf(item.name) < 0) {
        uniqueStatus.push(item.name);
        statusLegendArray.statuslegend.push({
            "statusName" : item.name,//No i18N
            "statusColor"  : item.color//No i18N
        });
    }
});

var tempArray=statusLegendArray.statuslegend;
var mainTr=document.getElementById('main_tr');
var template = document.getElementById('temp');
var clone = template.cloneNode(true);
for (var x=0;x<tempArray.length;x++)
{
        var clone = template.cloneNode(true);
        var children = clone.getElementsByTagName("span");
        for(var i =0; i < children.length;i++)
        {
            if(children[i].id === "leg_status_open_color")
            {
                children[i].style.backgroundColor = tempArray[x].statusColor;
                children[i].id = "leg_status_"+tempArray[x].statusName.toLowerCase()+"_color";
            }
            if(children[i].id === "leg_status_open_label")
            {
                var textNode = document.createTextNode(tempArray[x].statusName);
                children[i].appendChild(textNode);
                children[i].id = "leg_status_"+tempArray[x].statusName.toLowerCase()+"_label";
            }

        }
        clone.className = "legend-"+tempArray[x].statusName.toLowerCase();
        clone.style.display = "";
        clone.id = "legend-id-"+tempArray[x].statusName.toLowerCase();
        mainTr.appendChild(clone);
}
buildStatusLegend = jQuery('#statusLegendInfo');
    }
}
var $viewWO = new workorder.viewWO();
function loadRequestDependencies(module,entityid)
{
    var url = '/RequestDependencies.do?SubmitAction=getMap&Module='+ encodeURIComponent(module) +'&EntityId='+ encodeURIComponent(entityid) +'&';    // NO I18N
    // if the window size increased from >1300 in IE it is not aligning center..
    NewWindow(url,'RequestDependencies','1300','600','yes','center');
}
        //Fuction to call dissociate methods of Request Dependency Marking
        function dissociateReqDependency(form, woId){
        var elements = document.AssoReqForm.elements;
        var query = "";
        for(var i = 0; i < elements.length; i++) {
            var ele = elements[i];
            if(ele.type === "checkbox" && ele.name === "checkbox") {
                if(ele.checked === true) {
                    query = query.concat("&DepWorkorderId=" + encodeURIComponent(ele.value) ); // No I18N
                }
            }
        }
        if(query === "") {
            alert(getMessageForKey("sdp.requests.error.dissonoselection"));
            return;
        }
        var result = confirm(getMessageForKey("sdp.requests.error.dissoconfirm"));
        if(result) {
            // invokeProgressIndicator('dissociateDependency', "sdp.common.processing"); // No I18N
            showalert("info", getMessageForKey("sdp.common.processing"), "isAutoHide=false"); //No I18N
            var xmlHttp = getXMLHttpRequest();
            var url = "/WODependencyDef.do?SubmitAction=DissociateDependency&AssociatedEntityId=" + encodeURIComponent(woId) + query ; // No I18N
            xmlHttp.open("POST", url, true); // No I18N
            xmlHttp.onreadystatechange=function() {
                if(xmlHttp.readyState === 4) {
                    window.$req.details.updateRequestTemplates('dissociate_dependency');    //No I18N
                    jQuery("#alertbox").remove();
                    showalert("success", getMessageForKey("sdp.requests.history.removedependency"), "isAutoHide=true"); //No I18N
                    // closeProgressIndicator("sdp.common.processcomp"); // No I18N
                    // window.refreshSubView('DependencyRequests'); // No I18N
                }
            }
            xmlHttp.send(null);
        }
    }

    //Method to delete last dependent request in dependency group
    function deleteLastDependentReq(woId)
    {
        var toDelete = confirm(getMessageForKey("sdp.requests.dependency.confirmdelete.lastdependentrequest"));
        if(toDelete) {
            var xmlHttp = getXMLHttpRequest();
            var url = "/WODependencyDef.do?SubmitAction=DissociateLastDependency&AssociatedEntityId=" + encodeURIComponent(woId); // No I18N
            xmlHttp.open("POST", url, true); // No I18N
            xmlHttp.onreadystatechange=function() {
                if(xmlHttp.readyState === 4) {
                    window.$req.details.updateRequestTemplates('remove_dependency');//No I18N
                }
            }
            xmlHttp.send(null);
        } else if(document.getElementsByClassName('depent-alrt')[0] !== undefined) {
            document.getElementsByClassName('depent-alrt')[0].hide();
        }
    }
    //Method to check the dependency request count in a group
    function checkDependencyCount(woId)
    {
        if(TOTAL_DEPENDENCY_REQ + 1 >= DEPENDENCYGROUPLIMIT)
        {
            alert(getMessageForKey("sdp.requests.listview.dependency.limit") + ' ' + DEPENDENCYGROUPLIMIT); // NO I18N
            return false;
        }
        else
        {
            var url = '/AssoDependencyRequest.do?mode=getWindow&WorkorderId=' + encodeURIComponent(woId); // NO I18N
            NewWindow(url,'mergewo','990','450','yes','center');
            return true;
        }
    }
function clickFromFCR(element)
{
    if(!element){
        return;
    }
    if(element.checked){
        element.value=true
    }else{
        element.value=false
    }
}

//Method to convert the given field to select2 component
function convertToSelect2(fieldName, isOpenOnSelect){
    var data = {
        formatNoMatches: getMessageForKey('ae.select2.no.message'),
        sortResults: function(results, container, query) {
            return sortResultsFn(results, container, query);
        }
    };
    if(isOpenOnSelect) {
        data["closeOnSelect"]= false;
    }
    if(fieldName==="portalList")
    {
        data['formatResult']= function(item) {
            if(item.element[0].getAttribute('data-status')==="Pre-Production")
            {
                return '<div><span class="mr15 disp-ib">'+ZSEC.Encoder.encodeForHTML(item.text)+'</span><span class="text-color1">('+getMessageForKey("mdh.status.prepro")+')</span></div>';
            }
            else
            {
                return '<div><span class="mr15 disp-ib">'+ZSEC.Encoder.encodeForHTML(item.text)+'</span></div>';
            }
        };
    }
    jQuery('[name='+fieldName+']').select2(data); //No I18N
}
function getResolvedClosureCode() {
    var html_src = $('closureForCompletedStatus').innerHTML;
    //SD-60746 Status comment not mandated , in global edit.
    showDialog(html_src, "position=absmiddle,modal=yes,closeOnEscKey=no,closeButton=no,title=" + getMessageForKey("sdp.requests.viewrequest.resolveRequest")); // No I18N
}
function isSuggestionsAvailable(request_id){
    if((jQuery('#suggestion_avail').parent().length) && (jQuery('#suggestion_notavail').parent().length)) {
        var startIndex = 1;
        var endIndex = 1;
        var inputObject = {}, list_info = {};
        list_info.start_index = startIndex.toString();
        list_info.filter_by={name:"ApprovedSolutions"};  // No I18N
        var searchString = getSearchStringForSuggestSolutions();
        list_info.gsearch = searchString;
        inputObject.list_info = list_info;
        var dataVal = sdpAjaxInputData(inputObject);
        sdpAjax({
        url:'/api/v3/solutions',  // No I18N
        data: dataVal,
        success: function(jsonArray) {
            var sln_obj = jsonArray.solutions;
            if (sln_obj.length == 0) {
                parent.document.getElementById('suggestion_avail').classList.add('hide'); //No I18N
                parent.document.getElementById('suggestion_notavail').classList.remove('hide'); //No I18N
                if(window.location.hash.indexOf("resolution") > -1) {
                    jQuery("#resolution-tab").sdtab('show');  //No I18N
                }
            } else {
                parent.document.getElementById('suggestion_avail').classList.remove('hide'); //No I18N
                parent.document.getElementById('suggestion_notavail').classList.add('hide'); //No I18N
                if(window.location.hash.indexOf("resolution") > -1) {
                    jQuery("#resolution-sugg-tab").sdtab('show'); //No I18N
                }
            }
        }
        });
    }
}
//This function is used to get a searchString for Suggested Solution for a request
function getSearchStringForSuggestSolutions (){
    var searchString = "";
    if($req && $req.details){
        searchString = $req.details.request_info.subject;
        searchString = $req.details.request_info.category ? searchString + " " + $req.details.request_info.category.name : searchString;
        searchString = $req.details.request_info.subcategory ? searchString + " " + $req.details.request_info.subcategory.name : searchString;
        searchString = $req.details.request_info.item ? searchString + " " + $req.details.request_info.item.name : searchString;
    }
    return searchString;
}


//method to format select2 for technician online/offline

function formatResult (state) { //Indexes used in arrays are put according to current design .. ref://techID_NameModel in WorkOrderUtil.
        var online=1;
        var offline=2;
        var isTechOnline=false;
        var toolTip="";

        if(state.id >= 1){  //Stateid refers to the state of the 'option' tag that is passed at the time of construction of select2.

            if( techID_NameModel.list[state.id] === undefined)
                {
                    formattedState = "<div title='"+getMessageForKey('sdp.techMarking.logout')+"' id='status'  class='text-nowrap'><span class='logedicon mr5'></span> " + encodeHTML(state.text);
                }
            else
                {
      		  if(techID_NameModel.list[state.id][2] != 'logout' && techID_NameModel.list[state.id][2][0]==online){

           		 isTechOnline=true;
          		  toolTip=getMessageForKey('sdp.techMarking.online');
                    }else{
            toolTip=getMessageForKey('sdp.techMarking.offline');
                    }


                    if((techID_NameModel.list[state.id][3]!=undefined)&&(techID_NameModel.list[state.id][3]=='leave')){
                        isTechOnLeave=true;
                        toolTip=getMessageForKey('sdp.techMarking.leave');
                    }


                      //This Block is to check whether the tech is logged out/online/offline.
                      if(techID_NameModel.list[state.id][2] != 'logout'){
                        if(techID_NameModel.list[state.id][2][0]==online){
                          formattedState = "<div title='"+toolTip+"' id='status'  class='text-nowrap'><span  class='onlineicon mr5 btn-success'></span> " + encodeHTML(state.text); // No I18N
                        }
                        else if(techID_NameModel.list[state.id][2][0]==offline){
                          formattedState = "<div title='"+toolTip+"' id='status'  class='text-nowrap'><span class='offlineicon mr5 btn-secondary'></span> " + encodeHTML(state.text); // No I18N
                        }
                      }
                      else{
                          formattedState = "<div title='"+toolTip+"' id='status'  class='text-nowrap'><span class='logedicon mr5'></span> " + encodeHTML(state.text); // No I18N
                      }
                      //This Block is to check whether the tech is on leave today.
                      if((techID_NameModel.list[state.id][3]!=undefined)&&(techID_NameModel.list[state.id][3]=='leave')){
                        formattedState=formattedState+"<span><b> *</b></span></div>";
                      }
                      else{
                         formattedState=formattedState+"</div>";
                      }

                }
            return formattedState;
        }
        else{
          var $state = state.text   ; //returns state as such without any formatting
        }
        return $state;
};

//Function to add filter at bottom of technician assigment areas to filter techs online or to show all the techs .
function filterbyOnline(id){
    jQuery(id).select2("container").on("select2-opening", function() { //No I18N
                                  }).find(".select2-drop").append("<div class='select2-filter-option disp-t fw'><div class='disp-c pl25 w-50per'><label class='filterbyoption radio-inline'><input id='showAll' type='radio' value='' name='filter'>"+getMessageForKey('sdp.common.showall')+"</label></div><div class='disp-c'><label class='radio-inline'><input id='Online' value='' name='filter' type='radio'>"+getMessageForKey('sdp.techMarking.online')+"</label></div></div>");

    jQuery(id).on("select2-opening", function(e) { //No I18N
             jQuery("#showAll").prop("checked",true); //No i18N
           });

    jQuery('.select2-filter-option label').on('click', function(e) {
        e.stopPropagation();
        if(jQuery(this).find('input').attr('id') == 'Online'){
            jQuery('.select2-results li div').each(function(index){
              if(index >= 1){
                    jQuery(this).parent().removeClass('hide')
                    if(!jQuery(this).parent().find('span').hasClass('onlineicon')) {
                        jQuery(this).parent().addClass('hide');
                    }
                }
            });
        }
        if(jQuery(this).find('input').attr('id') == 'showAll'){
          jQuery('.select2-results li div').each(function(index){
                jQuery(this).parent().removeClass('hide');
          });
        }
        jQuery(window).trigger('resize');
    });
}

req = new XMLHttpRequest();

function populateShareDataForSelect2(sharedData)
{
    var shareJSON = (sharedData) ? sharedData : JSON.parse(req.responseText);
    var selectedSiteData = shareJSON.sites;
    var selectedGroupData = shareJSON.groups;
    var selectedUserData = shareJSON.users;
    var selectedTechnicianData = shareJSON.technicians;
    var selectedDepartmentData = shareJSON.departments;
    if(shareJSON.user_scope != undefined)
    {
        var values = shareJSON.user_scope;
        if(values.indexOf("requester") != -1)
        {
            var locked = false;
            if(jQuery.inArray('Restrict site access',sdp_user.ROLES) != -1)
            {
                locked = true;
            }
            if(selectedUserData != undefined)
            {
                if(Array.isArray(selectedUserData))
                {
                    selectedUserData.unshift({"id":"0","name":"$"+getMessageForKey("sdp.request.share.allrequester"),"locked":locked});//No I18N
                }
                else
                {
                    var jsonArray = [];
                    jsonArray.push({"id":"0","name":"$"+getMessageForKey("sdp.request.share.allrequester"),"locked":locked});
                    jsonArray.push(selectedUserData);
                    selectedUserData = jsonArray;
                }
            }
            else
            {
                selectedUserData = [];
                selectedUserData.push({"id":"0","name":"$"+getMessageForKey("sdp.request.share.allrequester"),"locked":locked});
            }
        }
        if(values.indexOf("technician") != -1)
        {
            if(selectedTechnicianData != undefined)
            {
                if(Array.isArray(selectedTechnicianData))
                {
                    selectedTechnicianData.unshift({"id":"0","name":"$"+getMessageForKey("sdp.request.share.alltechs")});//No I18N
                }
                else
                {
                    var jsonArray = [];
                    jsonArray.push({"id":"0","name":"$"+getMessageForKey("sdp.request.share.alltechs")});
                    jsonArray.push(selectedTechnicianData);
                    selectedTechnicianData = jsonArray;
                }
            }
            else
            {
                selectedTechnicianData = [];
                selectedTechnicianData.push({"id":"0","name":"$"+getMessageForKey("sdp.request.share.alltechs")});
            }
        }
    }
    if(selectedGroupData != undefined)
    {
        var values = [];
        if(Array.isArray(selectedGroupData))
        {
            for(var i=0;i<selectedGroupData.length;i++)
            {
                if("site" in selectedGroupData[i] && selectedGroupData[i].site != null)
                {
                    values.push({"id":selectedGroupData[i].id , "text":selectedGroupData[i].text + ", " + selectedGroupData[i].site.text});
                }
                else
                {
                    values.push({"id":selectedGroupData[i].id,"text":selectedGroupData[i].text});
                }
            }
        }
        else
        {
            if("site" in selectedGroupData && selectedGroupData.site != null)
            {
                values.push({"id":selectedGroupData.id , "text":selectedGroupData.text + ", " + selectedGroupData.site.text});
            }
            else
            {
                values.push({"id":selectedGroupData.id,"text":selectedGroupData.text});
            }
        }
        selectedGroupData = values;
    }
    if(selectedDepartmentData != undefined)
    {
        var values = [];
        if(Array.isArray(selectedDepartmentData))
        {
            for(var i=0;i<selectedDepartmentData.length;i++)
            {
                if("site" in selectedDepartmentData[i] && selectedDepartmentData[i].site != null)
                {
                    values.push({"id":selectedDepartmentData[i].id , "text":selectedDepartmentData[i].text + ", " + selectedDepartmentData[i].site.text, "locked":selectedDepartmentData[i].locked});
                }
                else
                {
                    values.push({"id":selectedDepartmentData[i].id,"text":selectedDepartmentData[i].text,"locked":selectedDepartmentData[i].locked});
                }
            }
        }
        else
        {
            if("site" in selectedDepartmentData && selectedDepartmentData.site != null)
            {
                values.push({"id":selectedDepartmentData.id , "text":selectedDepartmentData.text + ", " + selectedDepartmentData.site.text, "locked":selectedDepartmentData.locked});
            }
            else
            {
                values.push({"id":selectedDepartmentData.id,"text":selectedDepartmentData.text,"locked":selectedDepartmentData.locked});
            }
        }
        selectedDepartmentData = values;
    }

    if(selectedSiteData != undefined) {
        if(Array.isArray(selectedSiteData)){
            selectedSiteData.forEach(function(site, idx) {
                //SD-106244 | for 'Not associated to any site' id will be -1 when fetched through api, hence modifying it's id from 0 to -1
                if(site.id == 0) {
                    selectedSiteData[idx].id = -1;
                }
            });
        } else {
            if(selectedSiteData.id == 0) {
                selectedSiteData.id = -1;
            }
        }
    }

    // share request - requester select2 (userTechSelect2)
    params = {
        isAPI: true,
        url: '/api/v3/requests/requester',  //NO I18N
        entity_name: 'requester',   //NO I18N
        tooltip: true,
        showAll: ['email_id', 'department', 'employee_id', 'name', 'is_vipuser'], //NO I18N
        element: 'selectUser',  //NO I18N
        searchOptions: ['name', 'email_id'],    //NO I18N
        criteriaCallback: function(searchText, search_criteria){
            /** criteria to fetch only requesters and not technicians */
            var user_criteria = { field: 'type', condition: 'is', value: 'User', logical_operator: 'AND' }    //NO I18N
            if(jQuery.isEmptyObject(search_criteria)) {
                /** if search_criteria doesn't exists or is empty, construct new search_criteria array containing user_criteria */
                search_criteria = [user_criteria];
            } else if(Array.isArray(search_criteria)) {
                /** if search_criteria is an array, append user_criteria to it */
                search_criteria.push(user_criteria);
            } else {
                /** if search_criteria is a non-empty object, construct new search_criteria array containing existing criteria and user_criteria */
                search_criteria = [search_criteria];
                search_criteria.push(user_criteria);
            }
            return search_criteria;
        },
        value: selectedUserData,
        excludeTech: 'true',
        multiple: 'true',
        maximumSelection: jQuery('#maxUser').val(),
        placeHolder: getMessageForKey('common.placeholder.requester')
    };

    /** display AllRequesters dollar variable for technicians not having site restriction */
    if (jQuery.inArray('Restrict site access', sdp_user.ROLES) == -1) {
        params.extraOptions =  [{ id: '0', name: '$' + getMessageForKey('sdp.request.share.allrequester')}];
    }

    userSelect.initializeSelect2(params);

    // share request - support group select2
    jQuery('#selectGrp').sdp_select2({
        url: [
        {
          url: '/api/v3/requests/group',    //NO I18N
          field: 'group',   //NO I18N
          input_fields: {
              'for' : 'request_share'   //NO I18N
            }
        },
        ],
        multiple: true,
        placeholder: getMessageForKey('sdp.common.placeholder.supportgroup'),
        maximumSelectionSize: jQuery('#maxGroup').val(),
        value: selectedGroupData,
        closeOnSelect: false,
        processResults: function(search_data, data, field){
            /** append site name to support group */
            var processedResult = {
                id: data.id,
                text: data.text || data.name + (data.site ? ', ' + data.site.name : '')
            };
            search_data.push(processedResult);
        },
    });

    // share request - site select2
    jQuery('#selectSite').sdp_select2({
        url: [
          {
            url: '/api/v3/requests/site',   //NO I18N
            field: 'site',  //NO I18N
            input_fields: {
              'for' : 'request_share'   //NO I18N
            }
          },
        ],
        multiple: true,
        placeholder : getMessageForKey('sdp.common.placeholder.site'),
        maximumSelectionSize: jQuery('#maxSite').val(),
        value: selectedSiteData,
        closeOnSelect : false
    });

    // share request - department select2
    jQuery('#selectDept').sdp_select2({
        url: [
          {
            url: '/api/v3/requests/department', //NO I18N
            field: 'department',    //NO I18N
          },
        ],
        multiple: true,
        placeholder : getMessageForKey('sdp.common.placeholder.department'),
        maximumSelectionSize: jQuery('#maxDept').val(),
        value: selectedDepartmentData,
        closeOnSelect : false,
        processResults: function(search_data, data, field){
            /** append site name to department */
            var processedResult = {
                id: data.id,
                text: data.text || data.name + (data.site ? ', ' + data.site.name : '')
            };
            search_data.push(processedResult);
        },
    });

	params = {element : "selectTech", value : selectedTechnicianData,siteFilterBehaviour:"SDP_REQUEST",multiple:"true",maximumSelection : jQuery("#maxTech").val(),placeHolder : getMessageForKey("sdp.common.placeholder.user"),extraOptions:[{"id":"0","name":"$"+getMessageForKey("sdp.request.share.alltechs"),isTag:true}]}		//No I18N
    if(isMSP)
    {
        params.extraOptions.shift();
    }
            technicianSelect.initializeSelect2(params);
    jQuery("#techComment").html(encodeHTML(shareJSON.technician_comments));
    jQuery("#userComment").html(encodeHTML(shareJSON.user_comments));
}

//SD-98010 - OBO details not displayed when "more" link clicked in request form.
//Method is common to requester and OBO field
function showUserDetailsBasedOnAllowedValues(selector,field){
    var userId = jQuery(selector).val();
    if(userId!=undefined && userId!=null){
        var url;
        //If logged in user and obo user are same, on_behalf_of API will not work. Need to user API for such case.
        if(userId == sdp_user.LOGGEDIN_USERID && field == 'on_behalf_of'){
            url='/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+encodeURIComponent(userId);//No I18N
        }
        else{
            url='/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&apiModule=requests&apiEntity='+field+'&userId='+encodeURIComponent(userId);//No I18N
        }
        NewWindow(url,'showuserdetails','870','700','yes','center');
    }
}


function showRequesterRequests(){
    var jswoReqId=document.getElementById('requesterID');
    var url='ListRequests.do?&popUserDetails=true&mode=edit&id='+encodeURIComponent(jswoReqId.value);//No I18N

   NewWindow(url,'showrequestsforuser','900','600','yes','center');
  }




function canCalHeight(resourceportlet,spacediv,spotedit)
{
	var display = spacediv.css('display'); //No I18N
	//in FAFR when  spacediv css is none, make resourceportlet css also to none.
	if(display === 'none') {
		resourceportlet.css('display','none'); //No I18N
	}
	else {
		resourceportlet.css('display','block');  //No I18N
	}
	//var isexpand = isExpanded(resourceportlet, spotedit);
	var isValid = false;
	if(display === 'none') {
		isValid =  false;
	}
	else {
		isValid = true;
	}
	return isValid;
}

//This method will be called from add,view requet page and FAFR
function setHeight(spotedit){
	var parentelem = (spotedit) ? '#WOResourceForm .viewtype_1' : '#WOResourceDetails .viewtype_1'; //No I18N
	var parentelement = jQuery(parentelem);

	if(parentelement.length>0) {

		//parentelement.find('div.spacediv').css('height', '');//No I18N
		var i = 0; var reslen;
		reslen = parentelement.children('div.resourceportlet').length; //No I18N
		while(reslen > i){
			var resourceportlet = parentelement.find('div[resorder=resourceportlet'+i+']');
			var spacediv = resourceportlet.find('.spacediv');
			//making height to 0 at first
			spacediv.css('height', '');//No I18N
			var isValid = canCalHeight(resourceportlet,spacediv,spotedit);
			var isexpand = isExpanded(resourceportlet, spotedit);
			//console.log(i);
			if(!isValid || isexpand){
				//spacediv.css('height', '');//No I18N
				i++;
				continue;
			}

			var leftH, rightH, leftdiv, rightdiv;
			leftdiv = spacediv;
			leftH = leftdiv.height();


			i++;
			//to break the loop when i becomes more
			if(i>=reslen) {
				break;
			}

			resourceportlet = parentelement.find('div[resorder=resourceportlet'+i+']');
			spacediv = resourceportlet.find('.spacediv');
			var isSecondValid = canCalHeight(resourceportlet,spacediv,spotedit);
			//iterate till a valid resource found
			while(!isSecondValid && i<reslen) {
				i++;
				resourceportlet = parentelement.find('div[resorder=resourceportlet'+i+']');
				spacediv = resourceportlet.find('.spacediv');
				isSecondValid = canCalHeight(resourceportlet,spacediv,spotedit);

			}
			var isSecondexpand = isExpanded(resourceportlet, spotedit);
			var reachedLast = false;

			//check if the next resource is not expanded, then calculate height
			if(!isSecondexpand) {
				rightdiv = parentelement.find('div[resorder=resourceportlet'+i+'] .spacediv');
			        rightdiv.css('height','');//No I18N
				rightH = rightdiv.height();
				if(leftH >= rightH){
					rightdiv.height(leftH);
					leftdiv.height(leftH);
				}
				else{
					leftdiv.height(rightH);
					rightdiv.height(rightH);
				}
				i++;
			}

		}
	}

}
function isExpanded(resDiv, spotedit) {

	var isexpand = false;
	if(resDiv.hasClass('shrink') ||  resDiv.hasClass('col-xs-12')) {
		isexpand = true;
	}
	return isexpand;
}

var cancel_request = {
        showCancelRequestPopup : function(woId) {
            if(sdp_user.USERTYPE == 'Requester' || $req.details.self_service_portal_settings.status_change_comment) {
                var tableCont = '<form class="form-horizontal form-edit" id="crPopupForm"> <div data-id="form-fixed-wrapper"> <div class="form-wrapper"> ';
                tableCont += '<div id="info_txt_for_cancel" class="alert alert-info icon mb10 mt10" role="alert"><span class="msg">';
                tableCont += getMessageForKey("request.cancel.user.info") + '</span> </div>';
                tableCont += '<div class="col-fields mb10"> <label for="for_cancel_request"><span class="mandatory">*</span>' + getMessageForKey("sdp.common.comments") +'</label><div data-id="form-elem" class="mt5"><textarea maxlength="250" id="cancel_comments" class="form-control" name="cr-comments" data-id="crComment" rows="8" data-rule-required="true" aria-required="true"></textarea> </div></div></div></div><div class="submit-row mt0 pt10 pb10 form-footer" data-id="form-footer"><button class="btn btn-primary mr10" id="cancel_request_submit_btn" type="button" data-id="cr-btn" >';  // NO I18N
                tableCont += getMessageForKey("sdp.requests.newrequest.autosuggest.footer.cancelbutton") + '</button>'; // No I18N
                tableCont += '<button type="button" class="btn btn-default ml5" id="cancel_request_close_btn" >' + getMessageForKey("sdp.common.cancel") + '</button> </div></form>' ;
                showDialog(tableCont, "modal=yes, position=absmiddle, width=600, closeOnEscKey=yes, modal=yes, closeButton=yes, title=" + getMessageForKey('sdp.requests.newrequest.autosuggest.footer.cancelbutton')) // No I18N
                jQuery("#cancel_request_submit_btn").off('click').on('click', (event) => {  // No I18N
                    cancel_request.cancelRequest(woId);
                })
                jQuery("#cancel_request_close_btn").off('click').on('click', (event) => {  // No I18N
                    closeDialog();
                })
            }else {
                cancel_request.cancelRequest(woId);
            }
            
        },
        cancelRequest : function(workOrderID) {

            var desc = jQuery("#cancel_comments").val();
            if((sdp_user.USERTYPE == 'Requester' || $req.details.self_service_portal_settings.status_change_comment) && (desc == '' || trim(desc) == '')) {
                showalert('failure','<b>' + getMessageForKey("sdp.common.failed") + '!</b> ' + getMessageForKey("sdp.request.statuscomment.mandatory"),'isAutoHide=false,closeOnEscKey=yes,width=200,height=80');//NO I18N
                return false;
            }
            var jsonData = {"request":{"status_change_comments" : desc }};// NO I18N
            sdpAjax({
                url: "/api/v3/requests/" + encodeURIComponent(workOrderID) + "/_cancel",// NO I18N
                type: "PUT",// NO I18N
                data: sdpAjaxInputData(jsonData),
                success: function (response) {
                    if(response.response_status.status == "success"){
                        showalert('success', getMessageForKey("sdp.request.cancel.sucess"),'isAutoHide=true,delay=3,width=200');//NO I18N
                        $req.details.getStatusJson(woID);
                        $req.details.getRequestInfo(workOrderID);
                        $req.details.updateRequestTemplates('property'); //NO I18N
                        closeDialog();
                        try {
                            if(window.current_req_mode == "kanban" && !!window.top.kanban_comp_request && !!window.top.requestListViews.kan_col_id) {   //No i18n
                                window.top.kanban_comp_request.chkColRefresh(window.top.requestListViews.kan_col_id, $req.prop.sectionalUpdateJson, function(id) {
                                    window.top.requestListViews.kan_col_id = id;
                                });
                            }
                        } catch(ex) {
                            //console.error(ex);
                        }
                    }
                },
                error: function(response) {
                    data = response.responseJSON;
                    if(data && data.response_status && data.response_status.messages && data.response_status.messages[0].status_code === 4012) {

                        var fields = data.response_status.messages[0].fields;
                        if(!fields && data.response_status.messages[0].field) {
                            fields = [data.response_status.messages[0].field];
                        }
                        var fieldTitles = [], mappedFieldName;
                        if(fields) {
                            for(var i=0; i < fields.length; i++) {
                                if(fields[i].indexOf("udf_fields.") === 0) {
                                    mappedFieldName = $req.prop.key_title_mappingObject[fields[i].split("udf_fields.")[1]];
                                } else {
                                    mappedFieldName = $req.prop.key_title_mappingObject[fields[i]];
                                }
                                if(mappedFieldName) {
                                    fieldTitles.push(e_html(mappedFieldName));
                                }
                            }
                        }
                        var errorMsg = "";
                        if(fieldTitles.length > 0) {
                            errorMsg += "<b>" + fieldTitles.join(", ") + "</b>"; //No I18N
                        }
                        showalert('failure', getMessageForKey("sdp.request.cancel.failure.mandatory", [errorMsg]),'isAutoHide=false,closeOnEscKey=yes,width=500,height=80');//NO I18N
                    }
                    else if(data && data.response_status && data.response_status.messages && data.response_status.messages[0].status_code === 4510 && data.response_status.messages[0].message){
                        //SD-121408 : Alert message for cancel request negate operation.
                        showalert("failure", e_html(data.response_status.messages[0].message) ,"isAutoHide=false"); //NO I18N
                    }
                    else{
                        showalert('failure', getMessageForKey("sdp.request.cancel.failure"),'isAutoHide=false,closeOnEscKey=yes,width=260,height=80');//NO I18N
                    }
                }
            });
        },
        showRequestForCancelPopup : function(woId) {
            var tableCont = '<form class="form-horizontal form-edit" id="crPopupForm"> <div data-id="form-fixed-wrapper"> <div class="form-wrapper">';
            tableCont += '<div id="info_txt_for_cancel" class="alert alert-info icon mb10 mt10" role="alert"><span class="msg">';
            tableCont += getMessageForKey("reqeust.raise.cancel.user.info") + '</span></div>';
            tableCont += '<div class="col-fields mb10"> <label for="for_requesting_cancel"><span class="mandatory">*</span>' + getMessageForKey("sdp.common.comments") +'</label><div data-id="form-elem" class="mt5"><textarea id="reason_for_requesting_cancel" class="form-control" name="cr-comments" data-id="crComment" rows="8" maxlength="500" data-rule-required="true" aria-required="true"></textarea> </div></div></div></div><div class="submit-row mt0 pt10 pb10 form-footer" data-id="form-footer"><button class="btn btn-primary mr10" type="button" data-id="cr-btn" id="request_for_cancel_submit_btn" >';  // NO I18N
            tableCont +=  getMessageForKey("sdp.requesting.cancel") + '</button>'; // No I18N
            tableCont += '<button type="button" class="btn btn-default ml5" id="request_for_cancel_close_btn" >' + getMessageForKey("sdp.common.cancel") + '</button> </div></form>' ;
            showDialog(tableCont, "modal=yes, position=absmiddle, width=600, closeOnEscKey=yes, modal=yes, closeButton=yes, title=" + getMessageForKey('sdp.requesting.cancel')) // No I18N
            jQuery("#request_for_cancel_submit_btn").off('click').on('click', (event) => {  // No I18N
                cancel_request.requestForCancellation(woId);
            })
            jQuery("#request_for_cancel_close_btn").off('click').on('click', (event) => {  // No I18N
                closeDialog();
            })
        },
        requestForCancellation : function(workOrderID) {
            var desc = jQuery("#reason_for_requesting_cancel").val();
            if(desc == '' || trim(desc) == '') {
                showalert('failure','<b>' + getMessageForKey("sdp.common.failed") + '!</b> ' + getMessageForKey("sdp.request.statuscomment.mandatory"),'isAutoHide=false,closeOnEscKey=yes,width=300,height=80');//NO I18N
                return false;
            }
            var jsonData = {"request":{"reason_for_cancel" : desc}}; // NO I18N
            sdpAjax({
                url: "/api/v3/requests/" + encodeURIComponent(workOrderID) + "/_request_for_cancel",// NO I18N
                type: "PUT",// NO I18N
                data: sdpAjaxInputData(jsonData),
                success: function (response) {
                    if(response.response_status.status == "success"){
                        showalert('success', getMessageForKey('sdp.request.requesting.cancel.sucess'), 'isAutoHide=true,delay=3,width=300');//NO I18N
                        $req.details.getRequestInfo(workOrderID);
                        $req.details.updateRequestTemplates('property'); //NO I18N
                        closeDialog();
                    }else{
                        showalert('failure',getMessageForKey('sdp.request.requesting.cancel.failure') ,'isAutoHide=false,closeOnEscKey=yes,width=300,height=80');//NO I18N
                    }

                },
                error: function (response) {
                    showalert('failure',getMessageForKey('sdp.request.requesting.cancel.failure') ,'isAutoHide=false,closeOnEscKey=yes,width=300,height=80');//NO I18N
                }
            });
        },
        showRevokeCancellationPopup : function(woId) {
            var tableCont = '<form class="form-horizontal form-edit" id="crPopupForm"> <div data-id="form-fixed-wrapper"> <div class="form-wrapper">';
            tableCont += '<div id="info_txt_for_cancel" class="alert alert-info icon mb10 mt10" role="alert"><span class="msg">';
            tableCont += getMessageForKey("request.revert.raised.cancel.user.info") + '</span> </div>';
            tableCont += '<div class="col-fields mb10"> <label for="for_revoke_cancel">' + getMessageForKey("sdp.common.comments") +'</label><div data-id="form-elem" class="mt5"><textarea id="revoke_cancel_comments" class="form-control" maxlength="250" name="cr-comments" data-id="crComment" rows="8" data-rule-required="true"></textarea> </div></div></div></div><div class="submit-row mt0 pt10 pb10 form-footer" data-id="form-footer"><button class="btn btn-primary mr10" type="button" data-id="cr-btn" id="revoke_cancel_submit_btn" >';  // NO I18N
            tableCont += getMessageForKey("sdp.revoke.cancel") + '</button>'; // No I18N
            tableCont += '<button type="button" class="btn btn-default ml5" id="revoke_cancel_close_btn" >' + getMessageForKey("sdp.common.cancel") + '</button> </div></form>' ;
            showDialog(tableCont, "modal=yes, position=absmiddle, width=600, closeOnEscKey=yes, modal=yes, closeButton=yes, title=" + getMessageForKey('sdp.revoke.cancel')) // No I18N
            jQuery("#revoke_cancel_submit_btn").off('click').on('click', (event) => {  // No I18N
                cancel_request.revokeCancelRequested(woId);
            })
            jQuery("#revoke_cancel_close_btn").off('click').on('click', (event) => {  // No I18N
                closeDialog();
            })
        },
        revokeCancelRequested : function(workOrderID) {
            var desc = jQuery("#revoke_cancel_comments").val();
            var jsonData = {"request":{"cancel_requested": false , "update_reason" : desc}};    // NO I18N
            sdpAjax({
                url: "/api/v3/requests/" + encodeURIComponent(workOrderID) + "/_revoke_cancel_requested",// NO I18N
                type: "PUT",// NO I18N
                data: sdpAjaxInputData(jsonData),
                success: function (response) {
                    if(response.response_status.status == "success"){
                        showalert('success', getMessageForKey('sdp.request.revoke.cancel.sucess'), 'isAutoHide=true,delay=3,width=300');//NO I18N
                        $req.details.getRequestInfo(workOrderID);
                        $req.details.updateRequestTemplates('property'); //NO I18N
                        closeDialog();
                    }else{
                        showalert('failure',getMessageForKey('sdp.request.revoke.cancel.failure') ,'isAutoHide=false,closeOnEscKey=yes,width=310,height=80');//NO I18N
                    }
                },
                error:function (response) {
                    showalert('failure',getMessageForKey('sdp.request.revoke.cancel.failure') ,'isAutoHide=false,closeOnEscKey=yes,width=310,height=80');//NO I18N
                }
            });
        },
        showCancelRequestedMoreInfo : function() {
            jQuery("#cancel_reason_more").addClass("hide");
            jQuery("#cancel_reason_trimmed").addClass("hide");
            jQuery('span[id=cancel_reason]').removeClass("hide");
        }
}

var recommendedTemp = {
		jq_doc: jQuery(document),
		recomTempTab_service : '',
		recomSelectInit: function() {
			var self = this;
            self.recomTempTab_service = '<div class="sdtabs-ui2 mb10" id="recomSelTab"><ul class="nav nav-sdtabs req-template-type">';	// NO I18N
			if(jQuery("#incidentTemplateSel2").length > 0 && jQuery("#incidentTemplateSel2  > optgroup").length > 0) {
				self.recomTempTab_service += '<li id="incident_template_list" class="active"><a href="/" id="incidentTab" rel="uitip" title="'+ translate("common.incident.template") +'">' + translate("common.incident.template") +'</a></li>';		// NO I18N
			}
			if(jQuery("#serviceTemplateSel2").length > 0 && jQuery("#serviceTemplateSel2  > optgroup").length > 0) {
				self.recomTempTab_service +=  '<li id="service_template_list"><a href="/" id="serviceTab" rel="uitip" title="'+ translate("common.service.template") +'">' + translate("common.service.template") +'</a></li>';	// NO I18N
			}
			self.recomTempTab_service +=  '</ul></div>';	// NO I18N
			self.jq_doc.find('#incidentTemplateSel2,#serviceTemplateSel2').select2().end()
			.find('.recom-service-sel').hide();
			self.tabSwitch();
		},
		tabSwitch: function(){
			var self = this,
				seviceCommon = self.jq_doc.find('.servinc-common');
			self.jq_doc.find("#incidentTemplateSel2").select2("container").on("select2-opening").find(".select2-drop").prepend(self.recomTempTab_service); // NO I18N
			self.jq_doc.find("#serviceTemplateSel2").select2("container").on("select2-opening").find(".select2-drop").prepend(self.recomTempTab_service); // NO I18N
			seviceCommon.on('select2-open', function() {
				if(self.jq_doc.find(this).attr('id') === 'incidentTemplateSel2') {
					self.servIncCB('serviceTab','incidentTab','incidentTemplateSel2','recom-incident-sel','recom-service-sel','serviceTemplateSel2');	 // NO I18N
				}
				else if(self.jq_doc.find(this).attr('id') === 'serviceTemplateSel2') {
					self.servIncCB('incidentTab','serviceTab','serviceTemplateSel2','recom-service-sel','recom-incident-sel','incidentTemplateSel2'); // NO I18N
				}
			});
		},
		servIncCB: function() {
			var self = this,
				args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
			function tabActiveState() {
				self.jq_doc.find('#'+args[0]).closest('li').addClass('active').end().end()
				.find('#'+args[1]).closest('li').removeClass('active');
			}
			self.jq_doc.find('#recomSelTab li a#'+args[0]).on('click mouseup', function(e) { 
				e.stopPropagation();
				tabActiveState();
				self.jq_doc.find('#'+args[2]).select2('close').end()
				.find('.'+args[3]).hide().end()
				.find('.'+args[4]).show().end()
				.find('#'+args[5]).select2('open');
			});
		},
		setTemplateIdInTemplateList: function(selectedTemplateId) {
            if(selectedTemplateId > 0) {
                if(jQuery('#incidentTemplateSel2 option[value="' + selectedTemplateId + '"]').prop("selected", true).length > 0){
                    this.switchToIncidentTemplateTab();
                    jQuery('#incidentTemplateSel2').val(selectedTemplateId).trigger('change');
                }else{
                    this.switchToServiceTemplateTab();
                	jQuery('#serviceTemplateSel2').val(selectedTemplateId).trigger('change');
                }
            }
		},
		switchToIncidentTemplateTab: function() {
			jQuery("#recomSelTab #incident_template_list").addClass('active');	 // NO I18N
			jQuery("#recomSelTab #service_template_list").removeClass('active');	 // NO I18N
			jQuery('.recom-service-sel').hide();	 // NO I18N
			jQuery('.recom-incident-sel').show();	 // NO I18N
			jQuery('#serviceTemplateSel2').val('').trigger('change');
		},
		switchToServiceTemplateTab: function() {
			jQuery("#recomSelTab #service_template_list").addClass('active');	 // NO I18N
			jQuery("#recomSelTab #incident_template_list").removeClass('active');	 // NO I18N
			jQuery('.recom-incident-sel').hide();	 // NO I18N
			jQuery('.recom-service-sel').show();	 // NO I18N
			jQuery('#incidentTemplateSel2').val('').trigger('change');
		}
};
