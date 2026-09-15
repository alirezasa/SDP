/* $Id$ */
(function($){
        $.fn.extend({
disableTableRows3 : function( jsonArray ) {
                var element = jQuery( this ); //change tooltip content
                if ( element.hasClass( 'sdp-glyph-ok-circle' ) ){
                    element.attr( 'title' , jsonArray.disableTooltipText ).uitooltip({ content: jsonArray.disableTooltipText });//NO I18N
                }
                else{
                    element.attr( 'title' , jsonArray.enableTooltipText ).uitooltip({ content: jsonArray.enableTooltipText });//NO I18N
                }
                return this.on('click', function( event ){
                         var that = jQuery(this),
                         DisableEdit = that.closest( 'tr' );//NO I18N
                         if ( jsonArray.isClickEnabled == true ){ // diabling click event on anchor tags
                                        DisableEdit.find( 'td' ).on( 'click', function (e){//NO I18N
                                                    allElement = DisableEdit.find( 'td *' );
                                                    if ( that.hasClass( 'sdp-glyph-ok-circle' ) ){
                                                            allElement.removeAttr( 'style' ); //NO I18N
                                                    }
                                                    else{

                                                            allElement.css( 'cursor','default' ); //NO I18N
                                                            that.css( 'cursor','pointer' ); //NO I18N
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                    }
                                     });
                         }
                         //change icon and opacity
                         if ( that.hasClass( 'sdp-glyph-ok-circle' ) ){
                            if(jsonArray.disableAction){
                                jsonArray.disableAction(that);
                                                }
                                    that.attr({
                                        'class':'sdp-glyph sdp-glyph-ban-circle text-danger',//NO I18N
                                        'title':jsonArray.enableTooltipText//NO I18N
                                    }).uitooltip({ content: jsonArray.enableTooltipText });
                                    DisableEdit.find('td').attr( 'class' , 'opac5' ); //NO I18N
                                    if( jsonArray.disableIconColor == 'gray' ){
                                            that.addClass( 'text-muted' );//NO I18N
                                }
                         }
                         else{
                            if(jsonArray.enableAction){
                                jsonArray.enableAction(that);
                                                                    }
                                    that.attr({
                                        'class':'sdp-glyph sdp-glyph-ok-circle text-success',//NO I18N
                                        'title':jsonArray.disableTooltipText//NO I18N
                                    }).uitooltip({ content: jsonArray.disableTooltipText });
                                    DisableEdit.find('td').removeAttr( 'class' ); //NO I18N
                                    if( jsonArray.disableIconColor == 'gray' ){
                                            that.removeClass( 'text-muted' );//NO I18N
                                }
                         }
                         that.removeAttr( 'title' ); //NO I18N
                        });
            }
        });
})(jQuery);

function changeNotificationTab(module){
    jQuery("[data-type='content']").removeClass("show");
    jQuery("[data-type='content']").addClass("hide");
    jQuery("[data-id='"+module+"']").addClass("show");
    jQuery("[data-id='"+module+"']").removeClass("hide");

    jQuery("[data-type='tab']").removeClass("active");
    jQuery("#"+module+"_tab").addClass('active');
    if(module == "problem") {
        window.frames['NotFrame'].location.href = "/setup/ProblemNotifications.jsp?mode=view"; // No I18N
    }
    if(module == "change") {
        window.frames['NotFrame'].location.href = "/setup/ChangeNotifications.jsp?SaveNot=view"; // No I18N
    }
    if(module == "release") {
        window.frames['NotFrame'].location.href = "/setup/ReleaseNotifications.jsp?SaveNot=view"; // No I18N
    }
    if(module == "solution"){
        window.frames['NotFrame'].location.href = "/setup/SolutionNotifications.jsp?mode=view"; // No I18N
    }
    if(module == "tasks"){
        window.frames['NotFrame'].location.href = "/setup/TaskNotifications.jsp?mode=read"; // No I18N
    }
    if(module == "project"){
        window.frames['NotFrame'].location.href = "/setup/ProjectNotifications.jsp?mode=read"; // No I18N
    }
	if(module == "space") {
        window.frames['NotFrame'].location.href = "/setup/SpaceNotifications.jsp?mode=view"; // No I18N
    }
    if(module === "mobile"){
        window.frames.NotFrame.location.href = "/setup/MobileNotifications.jsp?mode=view"; // No I18N
    }
    else if(module == "asset")
    {
        jQuery("iframe[name=NotFrame]").attr("src","/setup/AssetNotifications.jsp");//NO I18N
    }
    else if(module == "purchase")
    {
        jQuery("iframe[name=NotFrame]").attr("src","/setup/PurchaseNotifications.jsp");//NO I18N
    }
    else if(module == "contract")
    {
        jQuery("iframe[name=NotFrame]").attr("src","/setup/ContractNotifications.jsp");//NO I18N
    }
    else if(module == "approval")
    {
        window.frames.NotFrame.location.href = "/ApprovalNotficationAction.do?isUpdate=false";//NO I18N
    }else if(module == 'report'){//no i18n
        // SDF - 22422 & SDF - 43984 - Configuring flag variable whether to trigger mail to owner of schedule report when
        //                    SDAdmin edit/delete other technician's schedule/private report
        window.frames.NotFrame.location.href = "/setup/ReportNotifications.jsp"; //No I18N
        ResourceLoader({js: [ "/scripts/reports.js"]});//No i18n
    }
    else if(module == "timesheet")
    {
        jQuery("iframe[name=NotFrame]").attr("src","/setup/TimesheetNotifications.jsp");//NO I18N
    }
	/*Loading module specific in URL hash tag and call fixed form footer function*/
    window.location.hash=module;
    jQuery("iframe[name=NotFrame]").load(function() {
        if(jQuery('[data-id='+module+']').length != 0 && jQuery('[data-id='+module+'] .submit-row').length != 0) {//No i18N
            fixedformfooter(jQuery('[data-id='+module+']').get(0), jQuery('[data-id='+module+'] .submit-row').get(0));//No i18N
        }
    });
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
    return true;//handleStateForForm(formObj);
 }
function showCABForm() {
    window.frames['CAB_FRAME'].location.href = "/setup/CABDefForm.jsp?"; // No I18N
}

//Sla and Business rule ordering methods.
function move_up(index,from,invoked_From)
{
    var box=null;
    if(invoked_From == 'SLA'){
        box = document.getElementsByName(from)[0];
    }
    else if(invoked_From =='Task'){
        box = document.getElementsByName(from)[0];
    }
    if (( index > 0)&&(index<box.length))
    {
        var tmp=box.options[index-1].text;
        var val=box.options[index-1].value;
        box.options[index-1].text=box.options[index].text;
        box.options[index-1].value=box.options[index].value;
        box.options[index].text=tmp;
        box.options[index].value=val;
        box.options[index].selected=false;
        box.options[index-1].selected=true;
    }
    for (i = 1; i < box.length - 1; i++)
    {
        Cat = box.options[i].value;
    }
}

function multimove_up(from,invoked_From)
{
    var box=null;
    if(invoked_From == 'SLA'){
        box = document.getElementsByName(from)[0];
    }
    else if(invoked_From =='Task'){
        box = document.getElementsByName(from)[0];
    }
    var selected=new Array();
    var j=0;
    for (i=0; i<box.length; i++) {
        if (box.options[i].selected==true) {
            if (i==0) break;
            if (i > 0) {
                selected[j]=i;
                j++;
            }
        }
    }
    for (j=0 ; j<selected.length ; j++) {
        move_up(selected[j],from,invoked_From)
    }
}

function move_down(index,from,invoked_From)
{
    var box=null;
    if(invoked_From == 'SLA'){
        box = document.getElementsByName(from)[0];
    }
    else if(invoked_From =='Task'){
        box = document.getElementsByName(from)[0];
    }
    var max=box.length
    var min = 0;
    if ( index < max-1 && index >= min)
    {
        var tmp=box.options[index+1].text;
        var val=box.options[index+1].value;
        box.options[index+1].text=box.options[index].text;
        box.options[index+1].value=box.options[index].value;
        box.options[index].text=tmp;
        box.options[index].value=val;
        box.options[index].selected=false;
        box.options[index+1].selected=true;
    }
    for (i = 1; i < box.length; i++)
    {
        Cat = box.options[i].value;
    }
}

function multimove_down(from,invoked_From)
{
    var box=null;
    if(invoked_From == 'SLA'){
        box = document.getElementsByName(from)[0];
    }
    else if(invoked_From =='Task'){
        box = document.getElementsByName(from)[0];
    }
    var max=box.length
    var min = 0;
    var selected=new Array();
    var j=0;
    for (i=0; i<max; i++)
    {
        if (box.options[i].selected==true)
        {
            selected[j]=i;
            j++;
        }
    }
    if (selected[j-1] < max && selected[j-1] >= min)
    {
        for (j=selected.length; j>=0 ; j--)
        {
            move_down(selected[j],from,invoked_From);
        }
    }
}

function selectAll_Order(invoked_From)
{
    var finalStr = "";
    var len =null;
    if(invoked_From == 'SLA'){
        len = document.SLADefForm.showFields.length;
    }
    else if(invoked_From =='Task'){
        len = document.TaskDefForm.showFields.length;
    }
    for (var i=0 ; i < len ; i++){
         if(invoked_From == 'SLA'){
            if(i == len-1)
                finalStr += document.SLADefForm.showFields[i].value;
            else
                finalStr += document.SLADefForm.showFields[i].value+","; // No I18N
            document.SLADefForm.colList.value = finalStr ;
        }
        else if(invoked_From =='Task'){
            if(i == len-1)
                finalStr +=  document.TaskDefForm.showFields[i].value;
            else
                finalStr +=  document.TaskDefForm.showFields[i].value+","; // No I18N
            document.TaskDefForm.colList.value = finalStr;
        }
    }
    // Activity : Capturing the dependencies among the tasks
    if(invoked_From =='Task'){
            jQuery('<input />').attr('type', 'hidden').attr('name',getCSRFParamName()).val(getCSRFParamValue()).appendTo('TaskDefForm')
            document.TaskDefForm.method='post'; // No I18N
            document.TaskDefForm.submit();
    }
}

function deactivateBR(selRules) {
    if(selRules==undefined) {
        if (!checkForRowSelection(document.RuleDefListForm, 'checkbox')) {
            alert(getMessageForKey("sdp.admin.brule.deactivatebr.selecterr"));
            return;
        }
        selRules = getSelectedCheckBoxes(document.RuleDefListForm);
    }

    // TODO check for already deactivated BRs
    var result = confirm(getMessageForKey("sdp.admin.brule.deactivatebr.confmessage"));
    if (!result) {
        return;
    }
    var params = "mode=deactivate"; // No I18N

    for (var i = 0; i < selRules.length; i++) {
        params = params+"&ruleID="+encodeURIComponent(selRules[i]); // No I18N
    }
    if(document.RuleDefAction.from!=null)
    {
   params = params + "&from="+document.RuleDefAction.from.value; // No I18N
    }
    params = appendParameter(params, getCSRFParamName(), getCSRFParamValue());
    callAjaxRequest('/BusinessRuleDef.do', params, 'deactivateBR'); // No I18N
}

function activateBR(selRules) {
    if(selRules==undefined) {
        if (!checkForRowSelection(document.RuleDefListForm, 'checkbox')) {
            alert(getMessageForKey("sdp.admin.brule.activatebr.selecterr"));
            return;
        }
        selRules = getSelectedCheckBoxes(document.RuleDefListForm);
    }

    // TODO check for already deactivated BRs
    var result = confirm(getMessageForKey("sdp.admin.brule.activatebr.confmessage"));
    if (!result) {
        return;
    }
    var params = "mode=activate"; // No I18N
    for (var i = 0; i < selRules.length; i++) {
        params = params+"&ruleID="+encodeURIComponent(selRules[i]); // No I18N
    }
    if(document.RuleDefAction.from!=null)
    {
   params = params + "&from="+document.RuleDefAction.from.value; // No I18N
    }
    params = appendParameter(params, getCSRFParamName(), getCSRFParamValue());
    callAjaxRequest('/BusinessRuleDef.do', params, 'activateBR'); // No I18N
}

// Holiday Specific methods
function validateHolidayForm(mode) {
    var name = trimAll(document.HolidayDefForm.date.value);
    if(name==null || name=="") {
        alert(getMessageForKey("sdp.admin.holiday.datejserror"));
        document.HolidayDefForm.date.focus();
        return false;
    }
    document.HolidayDefForm.date.value = name;
    document.HolidayDefForm.mode.value = mode;
    document.HolidayDefForm.submit();
}

function changeHolidayTitle() {
    showHideAddNewButton();
    document.getElementById("titlemessage").innerHTML = getMessageForKey("sdp.admin.holiday.listview.addholiday");
    clearHolidayFormData();
    document.HolidayDefForm.siteID.value = document.HolidayAction.SITEID.value;
}

function clearHolidayFormData() {
    document.HolidayDefForm.date.value = "";
    document.HolidayDefForm.description.value = "";
    // Note: document.HolidayAction will be null when no sites are configured.
    if(document.HolidayAction != null) {
        var site = document.HolidayAction.SITEID;
        document.HolidayDefForm.siteID.value = document.HolidayAction.SITEID.value;
        if(site.type == "hidden" && document.HolidayAction.SITEID_siteSearch)
        {
            document.getElementById('SiteText').innerHTML = encodeHTML(document.HolidayAction.SITEID_siteSearch.value);
        }
    }
    document.HolidayDefForm.isRecurring.checked = false;
    document.getElementById('addHButton').style.display = 'block'; // No I18N
    document.getElementById('updateHButton').style.display = 'none'; // No I18N
}

var HolidayAdmin = {
    siteDetails : {},
    holidaySiteChange : function(){
        var holidayFormObj = document.HolidayAction;
        if(holidayFormObj != null) {
            var siteId = holidayFormObj.SITEID.value;
            jQuery("#refer-msg").hide();

            //Check whether the selected site is a refer site.
            HolidayAdmin.siteDetails = checkReferSiteAjax(siteId,2);
            if(HolidayAdmin.siteDetails){
                var oldSiteID = HolidayAdmin.siteDetails.CHOOSENSITEID;
                var newSiteID = HolidayAdmin.siteDetails.SITEREFERID;
                var oldSiteName = HolidayAdmin.siteDetails.CHOOSENSITENAME;
                var newSiteName = HolidayAdmin.siteDetails.SITEREFERNAME;
                if(HolidayAdmin.siteDetails.parentSiteStatus != "InActive"){

                    //Default siteid is null.
                    if(newSiteID == "-1")
                    {
                        newSiteID = "null";//NO I18N
                    }

		if(isMSP) {
			setSiteRedirectionText(HolidayAdmin.siteDetails);
			oldSiteName = HolidayAdmin.siteDetails.CHOOSENSITENAME;
			newSiteName = HolidayAdmin.siteDetails.SITEREFERNAME;
		}

                    var label1 = getMessageForKey("sdp.admin.siterefer.dialog.label1").replace('{0}', encodeHTML(oldSiteName)).replace('{1}',encodeHTML(newSiteName));
                    var label2 = getMessageForKey("sdp.admin.siterefer.dialog.label2").replace('{0}', encodeHTML(newSiteName)).replace('{1}',getMessageForKey("sdp.admin.leftpanel.helpdesk.holidays"));
                    var label3 = getMessageForKey("sdp.admin.siterefer.dialog.label3").replace('{0}', encodeHTML(newSiteName));
                    var msg1 = getMessageForKey("sdp.admin.siterefer.dialog.label1").replace('{0}', encodeHTML(oldSiteName)).replace('{1}',encodeHTML(newSiteName));

                    var siteReferDialog = jQuery("#site-info-dialog");

                    siteReferDialog.find('#site-label1').html(label1);
                    siteReferDialog.find('#site-label2').html(label2);
                    siteReferDialog.find('#site-label3').html(label3);

                    jQuery("#refer-msg-span").html(msg1);
                    jQuery("#refer-msg").show();
                }else{
                    holidayFormObj.SITEID.value = "null"; // No I18N
                    if(holidayFormObj.SITEID_siteSearch)
                    {
                        holidayFormObj.SITEID_siteSearch.value = getMessageForKey("sdp.common.defaultsetting");
                    }
                    var label1 = getMessageForKey("sdp.admin.siterefer.dialog.label1").replace('{0}', encodeHTML(oldSiteName)).replace('{1}',encodeHTML(newSiteName));
                    var label2 = getMessageForKey("sdp.admin.siterefer.dialog.label4").replace('{0}', encodeHTML(newSiteName)).replace('{1}',getMessageForKey("sdp.admin.leftpanel.helpdesk.holidays"));
                    var siteReferDialog = jQuery("#site-info-dialog");
                    siteReferDialog.find('#site-label1').html(label1);
                    siteReferDialog.find('#site-label2').html(label2);
                    siteReferDialog.find('#site-label3').html("");
                    HolidayAdmin.siteDetails = null;
                }
                showDialog(siteReferDialog.html(),'title='+getMessageForKey("sdp.admin.siterefer.redirect.title")+', width=500, modal=yes, position=absmiddle');//No I18N

                document.querySelector('#_DIALOG_CONTENT #js-event-HolidayDef-3').addEventListener("click", function(event) { closeDialog(); })
            }
            HolidayAdmin.holidayReferSiteChange();
        }
    },
    holidayReferSiteChange : function(){
        //getting the new site details.
        if(HolidayAdmin.siteDetails){
            var newSiteID = HolidayAdmin.siteDetails.SITEREFERID;
            var newSiteName = HolidayAdmin.siteDetails.SITEREFERNAME;
            //Default siteid is null.
            if(newSiteID == "-1")
            {
                newSiteID = "null";//NO I18N
            }

            var holidayFormObj = document.HolidayAction;
            holidayFormObj.SITEID.value = newSiteID;
	if(isMSP) {
                redirectToSite(newSiteID);
        }
            if(holidayFormObj.SITEID_siteSearch)
            {
                holidayFormObj.SITEID_siteSearch.value = encodeHTML(newSiteName);
            }
            var referSiteID = HolidayAdmin.siteDetails.CHOOSENSITEID+"";
            updateState(getPortalViewName("HolidayListView"),"referSiteID", referSiteID); //   No I18N
        }
        updateHolidayListView(holidayFormObj);
    }
};

function updateHolidayListView(holidayFormObj) {
    var siteId = null;
    if(!holidayFormObj) {
        holidayFormObj = document.HolidayAction;
    }
    // Note: document.HolidayAction will be null when no sites are configured.
    if(holidayFormObj != null) {
        siteId = holidayFormObj.SITEID.value;
        $('siteID').value = siteId;
        if(holidayFormObj.SITEID.options){
            var site = holidayFormObj.SITEID;
            document.getElementById("SiteText").innerHTML = encodeHTML(site.options[site.selectedIndex].text);
        }
        else if(holidayFormObj.SITEID_siteSearch) {
            document.getElementById("SiteText").innerHTML = encodeHTML(holidayFormObj.SITEID_siteSearch.value);
        }
    }
    var newVal = "&SITEID="+encodeURIComponent(siteId); // No I18N
    updateState(getPortalViewName("HolidayListView"),"_D_RP", newVal); // No I18N
    updateState(getPortalViewName("HolidayListView"), "_PN", null); // No I18N
    updateFormValues("HolidayListView", document.HolidayListForm); // No I18N
    if(document.getElementById("sform").style.display != 'none') {
        new Effect.toggle($('sform'),'Slide'); // No I18N
        changeHolidayTitle();
    }
    return true;
}

function checkReferSiteAjax(siteID,configID){
    if(siteID != null && siteID > 0){
        var requestOne = callSjaxRequest('/servlet/AJaxServlet', 'action=checkReferSite&siteID='+siteID+'&configID='+configID); // no i18n
        try {
            if (requestOne.readyState == 4) {
                if (requestOne.status == 200) {
                    var siteDetails = JSON.parse(requestOne.responseText);
                    return siteDetails;
                }
            }
        }
        catch(e) {
            alert("Error while fetching ajax response : " + e.message);// No I18N
        }
    }
    return null;
}

function callHolidayEdit(id){
    var url = "/HolidayDef.do"; // No I18N
    var params = "mode=edit"; // No I18N
    params += "&itemID="+encodeURIComponent(id); // No I18N
    window.frames['SDPHeaderFrame'].location.href = url + "?" + params + "&" + (new Date()).getTime(); // No I18N
}

var req = null;

function callHolidayDelete() {
    if(!checkForRowSelection(document.HolidayListForm,'checkbox'))
    {
        alert(getMessageForKey("sdp.admin.common.deletemess"));
        return false;
    }
    var result = confirm(getMessageForKey("sdp.admin.holiday.listview.delete.confirmdelete"));
    if(!result) {
        return;
    }
    var deleteHolidayForm=createForm("/HolidayDef.do?"+(new Date()).getTime(),"SDPHeaderFrame","POST","deleteHoliday");// No I18N
    document.body.appendChild(deleteHolidayForm);
    addHiddenInput(deleteHolidayForm,"mode","delete");// No I18N
    addHiddenInput(deleteHolidayForm,getCSRFParamName(),getCSRFParamValue());
    var selVals = getSelectedCheckBoxes(document.HolidayListForm);
    for(var i = 0; i < selVals.length; i++) {
        addHiddenInput(deleteHolidayForm,"holidayID",selVals[i]);// No I18N
    }
    deleteHolidayForm.submit();
}
function addHoliday(result){
    updateHolidayListView(document.HolidayAction);
    if(result == "Success") {
        showSuccessMessageAndClose(null, getMessageForKey("sdp.admin.holiday.addholiday.success"), 2000);
        clearHolidayFormData();
        new Effect.toggle($('sform'),'Slide'); // No I18N
        changeHolidayTitle();
    }
    else {
        showFailureMessageAndClose(getMessageForKey("sdp.admin.holiday.holidayalreadyexists"), 2000);
    }
}

function editHoliday(){
//    document.getElementById("divmessage").innerHTML = getMessageForKey("sdp.common.cancel");
    // update by yoko
    showHideAddNewButton();
    document.getElementById("titlemessage").innerHTML = getMessageForKey("sdp.admin.holiday.editholiday");


    document.HolidayDefForm.date.value = document.getElementById("HDATE").innerHTML;
    document.HolidayDefForm.itemID.value = document.getElementById("HID").innerHTML;
    var desc = document.getElementById("HDESC").innerHTML;
    // Since the value is fetched as HTML, the & will be returned as &amp;. Hence the replace before setting.
    desc = desc.replace(/&amp;/g, "&"); // No I18N
    desc = desc.replace(/&lt;/g, "<"); // No I18N
    desc = desc.replace(/&gt;/g, ">"); // No I18N
    document.HolidayDefForm.description.value = desc;
    var isRec = document.getElementById("HISR").innerHTML;
    if(isRec == "true") {
        document.HolidayDefForm.isRecurring.checked = true;
    }
    else {
        document.HolidayDefForm.isRecurring.checked = false;
    }
    if(document.HolidayDefForm.siteID != null)
    {
        var site = document.HolidayAction.SITEID;
        document.HolidayDefForm.siteID.value = document.getElementById("HSITE").innerHTML;
        if(site.type == "hidden" && document.HolidayAction.SITEID_siteSearch)
        {
            document.getElementById('SiteText').innerHTML=encodeHTML(document.HolidayAction.SITEID_siteSearch.value);
        }
    }
    if(document.getElementById('sform').style.display == 'none'){
        new Effect.toggle($('sform'),'Slide'); // No I18N
    }
    document.getElementById('addHButton').style.display = 'none'; // No I18N
    document.getElementById('updateHButton').style.display = 'block'; // No I18N
}

function updateHoliday(result){
    if(result=='Success'){
        showSuccessMessageAndClose(null, getMessageForKey("sdp.admin.holiday.saveholiday.success"), 2000);
        updateHolidayListView(document.HolidayAction);
        clearHolidayFormData();
        new Effect.toggle($('sform'),'Slide'); // No I18N
        changeHolidayTitle();
    }else{
        showFailureMessageAndClose(document.getElementById("sdp.admin.holiday.holidayalreadyexists").innerHTML,2000);
    }
}

function deleteHoliday(){
    updateHolidayListView(document.HolidayAction);
    showSuccessMessageAndClose(null, getMessageForKey("sdp.admin.holiday.deleteholiday.success"),2000);
}

function clearSLAFormValues(forService) {
    if(!forService) {
        for(z = 1; z <= 20; z++) {
            removeSLACriteria(1);
        }
    }
    var form = document.SLADefForm;
    form.overrideOperatingHours.checked = false;
    form.dueByDays.value    = '0';
    form.dueByHours.value   = '0';
    form.dueByMinutes.value = '0';
        form.frDueByDays.value    = '0';
        form.frDueByHours.value   = '0';
        form.frDueByMinutes.value = '0';

    var z = 0;
    for(z; z <= 4; z++) {
        if(document.getElementById('checkbox'+z).checked){
            ShowHide('level'+z); // No I18N
        }
        document.getElementById('checkbox'+z).checked = false;
        document.getElementById('selectedID'+z).value ='';
    }
    form.slaName.value ='';
    form.comments.value ='';
    if(!forService) {
        form.selectCriteria.value ='0';
        form.criteriaValue.value ='';
    }
}

// SLA Methods
function slaOnLoad(oper, formName, opermins) {
    var form = document.SLADefForm;
    var forService = (formName == 'ServiceSLAForm'); // No I18N
    //console.debug("form is ",form);
    //console.debug("forService is ",forService);
    if (!forService) {
          var divToShow = form.divToShow.value;
          if(divToShow!=null && divToShow!="" && divToShow=="detView") {
              swapLayer('sform','listview'); // No I18N
          } else {
              swapLayer('listview','sform'); // No I18N
          }
    }


    //Check Operator
    if(oper!=null && oper=='on') {
        form.andor[0].checked = true;
    }
    else if(oper!=null && oper=='off') {
        form.andor[1].checked = true;
    }
    else {
        if(!forService) {
            form.andor[0].checked = true;
        }
    }

    if(!forService) {
        checkOperatorForSLA();
        showSLARowCriteria();
    }

    showSLAEscalation();
    loadmeadmin();
    //set escalation time for all levels in form onload
        setSLAInfoInSession(opermins);
    // SD-84532 This script focuses to "SLA Name" input field after the page gets loaded
    if(forService){
        form.elements['slaName'].focus();
    }
}

function showSLAEscalation() {
    var form = document.SLADefForm;
    //console.debug("form ", form);
    var startIdx = 0;
    var limit = 4;
    //console.debug("cb ",startIdx,limit);
    for(j = startIdx; j <= limit; j++) { // No I18N
        //console.debug("checkbox ", form['checkbox' + j]);
        var sel = form['checkbox' + j].checked;
        if(sel) {
            var div = document.getElementById('level'+j);
            div.style.display = 'block';
        }
    }

    for(k = 2; k <= 4; k++) {
        var sel1 = form['selectedID' + k];
        if (sel1 != null) {
            var div = document.getElementById('level'+(k-1)+'_ext'); // No I18N
            div.style.display = 'block';
        }
    }
}

function showSLARowCriteria() {
    for(j=1;j<=20;j++) {
        var rowVal  = document.getElementById('rowValID' + j);
        var rowText = document.getElementById('rowTextID' + j);
        if(rowVal.value!=null && rowVal.value!='' && rowText.value!=null && rowText.value!='') {
            var div = document.getElementById('row'+j);
            div.style.display = 'block';
        }
    }
}

function swapSLALayerAndSetFocus(formName) {
    onClickSwapLayer('sform','listview'); // No I18N
    document.SLADefForm.siteId.value = document.SLADefAction.LOCATION.value;
    var site = document.SLADefAction.LOCATION;
    if(site.type == "hidden")
    {
        if(document.SLADefAction.LOCATION_siteSearch){
            document.getElementById("SiteText").innerHTML = encodeHTML(document.SLADefAction.LOCATION_siteSearch.value);
        }
    }
    else
    {
        // SD-94402
        document.getElementById("SiteText").innerHTML = encodeHTML(document.SLADefAction.LOCATION.options[site.selectedIndex].text);
    }
    document.SLADefForm.slaName.focus();
    var forService = (formName == 'ServiceSLAForm'); // No I18N
    clearSLAFormValues(forService);
}

function toggleOverrideHolidays(){
             var isOpHoursChecked = document.getElementsByName('overrideOperatingHours')[0].checked;
         operHrPerDay = 24*60;
             if(!isOpHoursChecked){
             operHrPerDay = sessionStorage.getItem("baseOperHr");//NO I18N
                     document.getElementsByName('overrideHolidays')[0].checked=false;
                     document.getElementsByName('overrideHolidays')[0].disabled=true;
                     document.getElementsByName('overrideWeekends')[0].checked=false;
                     document.getElementsByName('overrideWeekends')[0].disabled=true;
             }
             else{
                     document.getElementsByName('overrideHolidays')[0].disabled=false;
                     document.getElementsByName('overrideWeekends')[0].disabled=false;
             }
        //store operational hours based on override in session.
                         sessionStorage.setItem("operHr", operHrPerDay); //NO I18N
                         var hrs = Math.floor(operHrPerDay/60);
                         var mins = operHrPerDay%60;
                         jQuery("#operspan").html("&nbsp;"+hrs+"&nbsp;"+getMessageForKey("sdp.common.hrs")+" "+mins+"&nbsp;"+getMessageForKey("sdp.common.mins"));//NO I18N
                         setSLAFrResponseTime();
                         setSLADueByTime();
                          calcL0Esc();
                          calcL1Esc();
                          calcL2Esc();
                          calcL3Esc();
                          calcL4Esc();
}

function validateSLAForm(formName) {
    var forService = (formName == 'ServiceSLAForm'); // No I18N
    var name = trimAll(document.SLADefForm.slaName.value);
    if(name == null || name == "") {
        alert(getMessageForKey('sdp.admin.sla.namejserror'));
        document.SLADefForm.slaName.focus();
        return false;
    }

    if(isMSPOrSCP && document.SLADefForm.servicePlanList!=null){
        var spId=document.SLADefForm.servicePlanList.value;
        if(spId==''){
	        alert(getMessageForKey('sdp.admin.sla.serviceplanjserror'));
            document.SLADefForm.servicePlanList.focus();
            return false;
        }
    }

    var form = document.SLADefForm;
    var criteriaPresent = false;

    if(!forService) {
        for(var i=1; i<=20;i++) {
            var value = form['rowName' + i].value;
            if(value != "") {
                criteriaPresent = true;
                break;
            }
        }
        if(!criteriaPresent) {
            var result = confirm(getMessageForKey("sdp.admin.sla.nocriteriamessage")); // No I18N
            if(!result) {
                return false;
            }
        }
    }
    form.slaName.value = name;
    if(!validateAndSetOLAValues()){
        return false;
    }
    if(!forService) {
        //escalation time checks are moved to its corresponding validation methods.
        return validateSLAEscInSave();
    }
    else
    {

    var anum=/(^\d+$)|(^\d+\.\d+$)/;

        var frDue = document.SLADefForm.frDueByDays.value;
        if(anum.test(frDue)) {
            testresult = true;
        }
        else {
            alert(getMessageForKey("sdp.admin.sla.frinvaliddatejserror"));
            document.SLADefForm.frDueByDays.focus();
            return false;
        }


    var due = document.SLADefForm.dueByDays.value
    if(anum.test(due)) {
        testresult = true;
    }
    else {
        alert(getMessageForKey("sdp.admin.sla.invaliddatejserror"));
        document.SLADefForm.dueByDays.focus();
        return false;
    }

    var resTime = (parseInt(document.SLADefForm.frDueByDays.value) * 24 * 60) + (parseInt(document.SLADefForm.frDueByHours.value) * 60) + parseInt(document.SLADefForm.frDueByMinutes.value);

    var resolutionTime = (parseInt(document.SLADefForm.dueByDays.value) * 24 * 60) + (parseInt(document.SLADefForm.dueByHours.value) * 60) + parseInt(document.SLADefForm.dueByMinutes.value);

    if(resTime >= resolutionTime) {
        alert(getMessageForKey("sdp.admin.sla.frdatelesserror"));
        document.SLADefForm.frDueByDays.focus();
        return false;
    }

    var locVar = document.SLADefForm.name.value;
    if(locVar==null || locVar== '' || locVar!="true") {
        if(document.SLADefForm.checkbox0.checked) {
            var a1 = document.SLADefForm.escalateAfterDays0.value;
            if(!checkintegervalue(a1)) {
                alert(getMessageForKey("sdp.admin.sla.invalidescalateafterjserror"));
                document.SLADefForm.escalateAfterDays0.focus();
                return false;
            }
        }
        if(document.SLADefForm.checkbox1.checked) {
            var a1 = document.SLADefForm.escalateAfterDays1.value;
            if(!checkintegervalue(a1)) {
                alert(getMessageForKey("sdp.admin.sla.invalidescalateafterjserror"));
                document.SLADefForm.escalateAfterDays1.focus();
                return false;
            }
        }
        if(document.SLADefForm.checkbox2.checked) {
            var a2 = document.SLADefForm.escalateAfterDays2.value;
            if(!checkintegervalue(a2)) {
                alert(getMessageForKey("sdp.admin.sla.invalidescalateafterjserror"));
                document.SLADefForm.escalateAfterDays2.focus();
                return false;
            }
        }
        if(document.SLADefForm.checkbox3.checked) {
            var a3 = document.SLADefForm.escalateAfterDays3.value;
            if(!checkintegervalue(a3)) {
                alert(getMessageForKey("sdp.admin.sla.invalidescalateafterjserror"));
                document.SLADefForm.escalateAfterDays3.focus();
                return false;
            }
        }
        if(document.SLADefForm.checkbox4.checked) {
            var a4 = document.SLADefForm.escalateAfterDays4.value;
            if(!checkintegervalue(a4)) {
                alert(getMessageForKey("sdp.admin.sla.invalidescalateafterjserror"));
                document.SLADefForm.escalateAfterDays4.focus();
                return false;
            }
        }
    }
    var comments = SLADefForm.comments.value;
	if(comments.length>2000){
		var args = [];
		args[0] = getMessageForKey("sdp.common.description");//No I18N
		args[1] = 2000;
		alert(getMessageForKey("sdp.app.common.maxlength.characters",args));//No I18N
		return false;
	}
    return true;
}

}

function openSLASearchItem() {
    var selectCriteria = document.SLADefForm.selectCriteria
    for (i=0;i<selectCriteria.options.length;i++) {
        var current = selectCriteria.options[i];
        if(current.selected) {
            if (current.value=='0') {
                alert(getMessageForKey("sdp.admin.sla.choosecriteria"));
            }
            else {
                openSLAPopUp(current.value,'add',i,'rule'); // No I18N
            }
        }
    }
}

function openSLAPopUp(value,mode,current,from) {
    var url, temp;
    if(mode=='edit') {
        url = '&element1=document.SLADefForm.rowTextID'+encodeURIComponent(current)+'&element2=document.SLADefForm.rowValID'+encodeURIComponent(current)+'&from='+encodeURIComponent(from)+'&mode='; // No I18N
    }
    else if(mode=='add') {
        url = '&element1=document.SLADefForm.criteriaValue&element2=document.SLADefForm.hid1'+'&from='+encodeURIComponent(from)+'&mode='; // No I18N
    }
    if(value== '1') {
        temp = 'HdSearchItem.do?criteria=Requester Name&'; // No I18N
    }
    else if(value== '2') {
        temp = 'HdSearchItem.do?criteria=Department Name&'; // No I18N
    }
    else if(value== '3') {
        temp = 'SearchItem.do?criteria=Asset Name&'; // No I18N
    }
    else if(value== '4') {
        temp = 'HdSearchItem.do?criteria=Priority&'; // No I18N
    }
    else if(value== '5') {
        temp = 'HdSearchItem.do?criteria=Category&'; // No I18N
    }
    else if(value== '6') {
        temp = 'HdSearchItem.do?criteria=Level&'; // No I18N
    }
    else if(value== '7') {
        temp = 'HdSearchItem.do?criteria=SubCategory&'; // No I18N
    }
    else if(value== '8') {
        temp = 'HdSearchItem.do?criteria=CategoryItem&'; // No I18N
    }
    else if(value== '9') {
        temp = 'HdSearchItem.do?criteria=Support Plan&'; // No I18N
    }
    else if(value== '10') {
        temp = 'HdSearchItem.do?criteria=Account&'; // No I18N
    }
    else if(value== '11') {
        temp = 'HdSearchItem.do?criteria=Site&'; // No I18N
    }
    else if(value== '12') {
        temp = 'HdSearchItem.do?criteria=Urgency&'; // No I18N
    }
    else if(value== '13') {
        temp = 'HdSearchItem.do?criteria=Impact&'; // No I18N
    }
    else if(value== '14') {
        temp = 'HdSearchItem.do?criteria=Request Type&'; // No I18N
    }
    else if(value== '15') {
        temp = 'HdSearchItem.do?criteria=IncidentService&'; // No I18N
    }
    else if(value== '16') {
        temp = 'HdSearchItem.do?criteria=Queue&'; // No I18N
    } else if(value== '17') {
        temp = 'HdSearchItem.do?criteria=ISVIPUSER&'; // No I18N
    } else if(isSCP && value== '203') {
        temp = 'HdSearchItem.do?criteria=Product&'; // No I18N
    }else if(isMSP && value== POCCRIT){ // For MSP POC feature
    	temp = 'HdSearchItem.do?criteria=ISPOC&'; // No I18N
    } else if(window.isMSPOrSCP) {
        // code added for sdp_feature_status.IS_REQ_ADD_FIELDS_IN_SLA__ENABLED  SCP IM #2230 request additional filelds inclusion in SLA criteria option list
        temp = 'RulePopUp.do?selVal='+encodeURIComponent(value); // NO I18N
    }

    var siteValue=document.SLADefForm.siteId.value;
    //if group, sitid is replaced by 0 for not in any site.
    if(value == '16' && siteValue=="null"){
        NewWindow(temp+url+encodeURIComponent(mode)+'&siteID=0','selectitem','400','450','yes','center'); // No I18N
    }else{
        if (window.isMSPOrSCP && window.sdp_feature_status.IS_REQ_ADD_FIELDS_IN_SLA__ENABLED && siteValue === 'null' && (value.indexOf("UDF_") == 0)) {
            siteValue = 0;
        }
        // document.SLADefForm.siteId.value assigned to siteValue reused as this value is modified for MSP. Value remains unmodified for SDP
        NewWindow(temp+url+encodeURIComponent(mode)+'&siteID='+encodeURIComponent(siteValue),'selectitem','400','450','yes','center'); // No I18N
    }
    }

function onSelectSLACriteriaChange() {
    document.SLADefForm.hid1.value = "";
    document.SLADefForm.hid2.value = "";
    document.SLADefForm.criteriaValue.value = "";
}

function addToSLACriteriaList() {
    selectCriteria = document.getElementsByName("selectCriteria")[0];
    criteriaValue = document.SLADefForm.criteriaValue.value;
    for (i=0;i<selectCriteria.options.length;i++) {
        var current = selectCriteria.options[i];
        if(current.selected) {
            if(current.value=='0' || criteriaValue==null || criteriaValue=='') {
                alert(getMessageForKey("sdp.admin.sla.setcriteria"));
            }
            else {
                isAlreadyExist = false;
                //Check whether a rule has been added for the same criteria already
                for(l=1;l<=20;l++) {
                    div = document.getElementById('row'+l);
                    divStyle = window.getComputedStyle(div);
                    if (divStyle.display == "none") {
                        break;
                    }
                    rowTextTemp = document.getElementById('rowTextID'+l);
                    rowTextTempValue = rowTextTemp.value;
            /*
            SD:42297-Unable to add category after adding service category in sla.
            Stil overwritten issue will be happen when the define rule name same in additionals fiels, like site and site for,so site will be written.
            Overwirtten issue will not happen write now as we are not listed the additionals fields the define rule list, any way these type of code to cleased in the clean up activity.
            */
            if(rowTextTempValue.startsWith(current.text))
            {
                        rowTextTemp.value = rowTextTempValue + " or " + criteriaValue; // No I18N
                        rowValTemp = document.getElementById('rowValID'+l);
                        rowValTemp.value = rowValTemp.value + "," + document.SLADefForm.hid1.value; // No I18N
                        isAlreadyExist = true;
                    }
                }
                if(!isAlreadyExist) {
                    for(j=1;j<=20;j++) {
                        div = document.getElementById('row'+j);
                        divStyle = window.getComputedStyle(div);
                        if (divStyle.display == "none") {
                            div.style.display = 'block'; // No I18N
                            break;
                        }
                    }

                    rowText = document.getElementById('rowTextID'+j);
                    if(rowText!=null) {
                        rowText.value = current.text + " " + getMessageForKey("sdp.admin.sla.addsla.is") + " " + criteriaValue; // No I18N
                        rowVal = document.getElementById('rowValID'+j);
                        rowVal.value = current.value + "," + document.SLADefForm.hid1.value; // No I18N
                    }
                }
            }
        }
    }
    checkOperatorForSLA();
    resetSLACriteria();
}

function resetSLACriteria() {
    selectCriteria = document.getElementsByName("selectCriteria")[0];
    for (i=0;i<selectCriteria.options.length;i++) {
        var current = selectCriteria.options[i];
        if(current.selected) {
            if (current.value=='0') {
                current.selected = true;
            }
            else {
                current.selected = false;
            }
        }
    }
    document.SLADefForm.criteriaValue.value = "";
    document.SLADefForm.hid1.value = "";
    document.SLADefForm.selectCriteria.value ="0";
    document.SLADefForm.selectCriteria.focus();
}

function editSLACriteria(current) {
    value = document.getElementById('rowValID'+current).value;
    text = document.getElementById('rowTextID'+current).value;
    val1 = value.substring(0,value.indexOf(','));
    val2 = value.substring(value.indexOf(',')+1,value.length);
    strTemp = getMessageForKey("sdp.admin.sla.addsla.is");
    lenTemp = strTemp.length + 1;
    text1 = text.substring(text.indexOf(strTemp)+lenTemp,text.length);
    openSLAPopUp(val1,'edit',current,'rule'); // No I18N
}

function removeSLACriteria(val) {
    next = val + 1;
    for(i=val;i<=20;i++) {
        next = i + 1;
        divCur = document.getElementById('row'+i);
        divNext = document.getElementById('row'+next);
        divCurStyle = window.getComputedStyle(divCur);
        divNextStyle = window.getComputedStyle(divNext);
        if(divCurStyle.display == "none" && divNextStyle.display == "none") {
            break;
        }
        else if(divCurStyle.display == "block" && divNextStyle.display == "none") {
            ele1 = document.getElementById('rowValID'+i);
            ele2 = document.getElementById('rowTextID'+i);
            ele1.value = "";
            ele2.value = "";
            divCur = document.getElementById('row'+i);
            divCur.style.display = 'none';
        }
        else if(divCurStyle.display == "block" && divNextStyle.display == "block") {
            ele1 = document.getElementById('rowValID'+i);
            ele2 = document.getElementById('rowTextID'+i);

            ele3 = document.getElementById('rowValID'+next);
            ele4 = document.getElementById('rowTextID'+next);

            ele1.value = ele3.value;
            ele2.value = ele4.value;

            ele3.value = "";
            ele4.value = "";
        }
    }

    divLast = document.getElementById('row'+next);
    if(divLast!=null) {
        divLast.style.display = 'none';
    }
}

function checkOperatorForSLA() {
    check = document.SLADefForm.andor[1].checked;
    if(check) {
        val = getMessageForKey("sdp.admin.common.or");// No I18N
    }
    else {
        val = getMessageForKey("sdp.admin.common.and");// No I18N
        document.SLADefForm.andor[0].checked = true;
    }
    for(j=2;j<=20;j++) {
        oper = document.getElementById('operatorID'+j);
        if(oper!=null) {
            oper.value = val;
        }
    }
}

var slaReferSiteDetails = null;

function updateSLADefListView(slaFormObj,mode){
    if(!slaFormObj){
        slaFormObj = document.SLADefAction;
    }
    var site = slaFormObj.LOCATION;
    jQuery("#refer-msg").hide();

    //Check whether the selected site is a refer site.
    slaReferSiteDetails = checkReferSiteAjax(site.value,6);
    if(slaReferSiteDetails){
	if(isMSP) {
		setSiteRedirectionText(slaReferSiteDetails);
	}
        if(slaReferSiteDetails.parentSiteStatus!="InActive"){
            var label1 = getMessageForKey("sdp.admin.siterefer.dialog.label1").replace('{0}', encodeHTML(slaReferSiteDetails.CHOOSENSITENAME)).replace('{1}',encodeHTML(slaReferSiteDetails.SITEREFERNAME));
            var label2 = getMessageForKey("sdp.admin.siterefer.dialog.label2").replace('{0}', encodeHTML(slaReferSiteDetails.SITEREFERNAME)).replace('{1}',getMessageForKey("sdp.admin.sla.title"));
            var label3 = getMessageForKey("sdp.admin.siterefer.dialog.label3").replace('{0}', encodeHTML(slaReferSiteDetails.SITEREFERNAME));

            var siteReferDialog = jQuery("#site-info-dialog");
            siteReferDialog.find('#site-label1').html(label1);
            siteReferDialog.find('#site-label2').html(label2);
            siteReferDialog.find('#site-label3').html(label3);
        }else{
            slaFormObj.LOCATION.value = "null"; // No I18N
            if(slaFormObj.LOCATION_siteSearch)
            {
                slaFormObj.LOCATION_siteSearch.value = getMessageForKey("sdp.common.defaultsetting");
            }
            var label1 = getMessageForKey("sdp.admin.siterefer.dialog.label1").replace('{0}', encodeHTML(slaReferSiteDetails.CHOOSENSITENAME)).replace('{1}',encodeHTML(slaReferSiteDetails.SITEREFERNAME));
            var label2 = getMessageForKey("sdp.admin.siterefer.dialog.label4").replace('{0}', encodeHTML(slaReferSiteDetails.SITEREFERNAME)).replace('{1}',getMessageForKey("sdp.admin.sla.title"));
            var siteReferDialog = jQuery("#site-info-dialog");
            siteReferDialog.find('#site-label1').html(label1);
            siteReferDialog.find('#site-label2').html(label2);
            siteReferDialog.find('#site-label3').html("");
            slaReferSiteDetails = null;
        }
        //Edit page refer site redirection popup not needed.
        if(!jQuery('#sform').is(':visible') || !mode) {
            showDialog(siteReferDialog.html(),'title='+getMessageForKey("sdp.admin.siterefer.redirect.title")+', width=500, modal=yes, position=absmiddle');//No I18N
        }
    }
        loadSLADefListView(slaFormObj);
}


function loadSLADefListView(slaFormObj){
    if(!slaFormObj){
        slaFormObj = document.SLADefAction;
    }
    var site = slaFormObj.LOCATION;
    if(slaReferSiteDetails){
        //Edit page refer site redirection info not needed
        if(!jQuery('#sform').is(':visible') || (jQuery('#sform').is(':visible') && arguments.callee.caller)){
            var msg1 = getMessageForKey("sdp.admin.siterefer.dialog.label1").replace('{0}', encodeHTML(slaReferSiteDetails.CHOOSENSITENAME)).replace('{1}',encodeHTML(slaReferSiteDetails.SITEREFERNAME));
            jQuery("#refer-msg-span").html(msg1);
            jQuery("#refer-msg").show();
        }

        var newSiteID = slaReferSiteDetails.SITEREFERID;
        //Default siteid is null.
        if(newSiteID == "-1")
        {
            newSiteID = "null";//NO I18N
        }
        slaFormObj.LOCATION.value = newSiteID;
	if(isMSP) {
		redirectToSite(newSiteID);
	}
        if(slaFormObj.LOCATION_siteSearch)
        {
            slaFormObj.LOCATION_siteSearch.value = encodeHTML(slaReferSiteDetails.SITEREFERNAME);
        }
        var newVal = slaReferSiteDetails.CHOOSENSITEID+"";
        updateState(getPortalViewName("SLADefListView"),"referSiteID", newVal); // No I18N
    }

    if (site.selectedIndex!=undefined) {
        document.getElementById("SiteText").innerHTML = encodeHTML(site.options[site.selectedIndex].text);
    }
    var newVal = '&SITEID='+encodeURIComponent(site.value); // No I18N
    updateState(getPortalViewName("SLADefListView"),"_D_RP", newVal); // No I18N
    updateState(getPortalViewName("SLADefListView"), "_PN", null); // No I18N
    updateFormValues("SLADefListView", document.SLADefListView); // No I18N
    onClickSwapLayer('listview','sform'); // No I18N
    return true;
}

function callSLAAjax(operation, formName) {
    req = getXMLHttpRequest();
    if(req){
        if(operation == 'Delete') {
            if(!checkForRowSelection(document.forms[formName], 'checkbox'))
            {
                alert(getMessageForKey("sdp.admin.common.deletemess"));
                return false;
            }
            var result = confirm(getMessageForKey("sdp.setup.sla.confirm"));
            if(!result) {
                return;
            }
            var url = '/SLADef.do'; // No I18N
            var params = 'mode=delete'+getCSRFParamURL(); // No I18N

            var selVals = getSelectedCheckBoxes(document.forms[formName]);
            for(var i = 0; i < selVals.length; i++) {
                params += "&slaID="+encodeURIComponent(selVals[i]); // No I18N
            }
            params = appendParameter(params, getCSRFParamName(), getCSRFParamValue());
            req.open("POST", url, true); // No I18N
            req.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8"); // No I18N
            req.setRequestHeader("Content-length", params.length); // No I18N
            req.onreadystatechange = function() {deleteSLA(formName);};
            req.send(params);
        }
    }
    else{
        alert('Your browser doesnot support this'); // No I18N
    }

}

function deleteSLA(formName) {
    if (req.readyState == 4){
        // only if "OK"
        if (req.status == 200){
            var xmlDoc = req.responseXML;
            var status = xmlDoc.childNodes[0].childNodes[0].childNodes[0].nodeValue;
            if(status == 200 || status == 300){
                var mess = (req.responseXML.getElementsByTagName("MESSAGE"))[0].childNodes[0].nodeValue;
                updateState(getPortalViewName(formName), "_D_RP", null); // No I18N
                parent.refreshSubView(parent.getPortalViewName(formName));
                showSuccessMessageAndClose(null, mess,2000);
            }
        }
        else{
            showFailureMessageAndClose(null, 'Unable to get details',2000); // No I18N
        }
    }
}

function saveChanges(theForm) {
    //Submit the form after enabling the orgID html component
    theForm.orgID.disabled=false;
    theForm.submit();
}


var ITService = {
    showServiceForm: function (elem1) {
            var goToSCHome = document.getElementById('goToSCHome');
            if(goToSCHome!=null)
            {
                goToSCHome.style.display='none';
            }
            window.frames.CONF_FRAME.location.href = "/AddCI.do?mode=showForm&ciTypeId="+encodeURIComponent(elem1)+"&from=SCatalog&onCancel=ITService.cancelServiceForm()";// No I18N
    },
    cancelServiceForm: function(){
            var goToSCHome = document.getElementById('goToSCHome');
            if(goToSCHome!=null)
            {
                goToSCHome.style.display='block';
            }
            window.location.href = "/SetUpWizard.do?forwardTo=servicecategorylist";// No I18N
    }
    ,
    validateServiceForm: function (formObj) {
        var name = formObj.serviceName.value;
        var filename = formObj.serviceCatLogo.value;
        if(trimAll(name) == "") {
            alert(getMessageForKey('sdp.jserror.name'));
            formObj.serviceName.value="";
            formObj.serviceName.focus();
            return false;
        }
        if(filename!="")
        {
            return validateImage();
        }
        formObj.serviceName.value=trimAll(name);
        /* var obj = document.getElementsByName("OWNERNAME");
        for(var i = 0; i < obj.length; i++){
            var op = obj[i];
            if(op.selected){
                document.getElementsByName("OWNERID")[0].value = op.value;
                break;
            }
        } s*/

        return true; //handleStateForForm(formObj);
    },
    updateServiceList: function() {
        parent.refreshSubView(parent.getPortalViewName('ServiceList')); //No I18N
    }
}

function assignscatimage(imgname)
{
    $('scatimage').src=$(imgname).src;
    $('serviceImageName').value=imgname;
}


function validateImage()
{
    var fname = $('serviceCatLogo').value;
    var temp=fname.toString();

    var i=0;
    var len= temp.length;
    var z = len-1;
    var y = len-2;
    var x = len-3;
    var w = len-4;
    var start= temp.lastIndexOf(".");
    var end = temp.length;
    var substr = temp.substring(start,(end));

    if( (substr == ".gif") || (substr == ".GIF")|| (substr == ".Gif")) {
        return true;
    }
    else if( (substr == ".jpg") || (substr == ".JPG") ||(substr == ".Jpg")) {
        return true;
    }
    else if( (substr == ".png") || (substr == ".PNG") ||(substr == ".Png")) {
        return true;
    }
    else if( (substr == ".wmf") || (substr == ".WMF") ||(substr == ".Wmf")) {
        return true;
    }
    else if( (substr == ".pcx") || (substr == ".PCX") ||(substr == ".Pcx")) {
        return true;
    }
    else if( (substr == ".tiff") || (substr == ".TIFF") ||(substr == ".Tiff") ) {
        return true;
    }
    else if( (substr == ".jpeg") || (substr == ".JPEG") ||(substr == ".Jpeg") ) {
        return true;
    }
    else {
        alert(getMessageForKey("sdp.setup.orgdef.image.format.jserror"));//No I18N
        return false;
    }
}

var resultDiv = " ";
var dcForm = null;

/**
* This wil invoke the dialog with the content available in the Display_Result
* div and set it to empty string. This iw done to avoid 2 id's in the same
* dom.( The original one and the copied one in the dialog)
*/
function saveDCSettings(formObj) {
    dcForm = formObj;
    var sDCMenu = dcForm.showDCMenu.checked;
    var sDCMDMMenu = document.getElementById("showDCMDMMenu").checked;
    if(document.getElementById("compatible_OFF"))
    {
        if(!sDCMenu && !sDCMDMMenu)
        {

            document.getElementById("compatible_OFF").style.display = "none";  // No I18N
        }else
            {
            document.getElementById("compatible_OFF").style.display = "block";  // No I18N
    }
    }

    var isSDEnabled = dcForm.isSDEnabled.value;

    resultDiv = document.getElementById("Display_Result").innerHTML;
    document.getElementById("Display_Result").innerHTML = "";
    showDialog(resultDiv, "closeButton=no"); // No I18N
    // A time delay of 1 sec is given for the ui appeal.
    setTimeout(function() { invokeSaveDCSettings(); }, 1000);
}

/**
* Will invoke the DCSettings.do and save the configurations alone.
*/
function invokeSaveDCSettings() {
    var sName = dcForm.serverName.value;
    var sPort = dcForm.serverPort.value;
    var sDCMenu = dcForm.showDCMenu.checked;
    var sDCMDMMenu = dcForm.showDCMDMMenu.checked;
	var apiKeyVal = dcForm.apiKey.value;
    if(dcForm.serverProtocol[1].checked) {
        sProtocol = dcForm.serverProtocol[1].value;
    }
    else {
        sProtocol = dcForm.serverProtocol[0].value;
    }
    jQuery.ajax({type: "POST",url: "/DCServerSettings.do", success : showDCOperationResult, data:{operation:configureDC,serverName:sName, serverPort:sPort, serverProtocol:sProtocol,showDCMenu:sDCMenu,showDCMDMMenu:sDCMDMMenu, save:"Save",apiKey:apiKeyVal}}); // No I18N
}
// MSP modifed this function for dc integration
function showDCOperationResult( data, status, response) {
    var result = false;
    // XML received will be like <Result>Success/Failure</Result>
    if(data != null && data.indexOf("Success") >= 0) {
        result = true;
    }
    // In case of success, we need to mark the completion of the savings stage and start the checking stage.
    if(result) {
        document.getElementById("settings_ON").style.display = "none";  // No I18N
            document.getElementById("settings_OK").style.display = "block";  // No I18N
        document.getElementById("checking_ON").style.display = "block";  // No I18N
        document.getElementById("checking_OFF").style.display = "none";  // No I18N
        setTimeout(function() {jQuery.ajax({url: "/DCServerSettings.do", success : showDCConnectionResult, data:{operation:"CheckConnection"}})}, 1000);  // No I18N
            setTimeout(function(){location.reload();},3000);
        }
	else if(data.indexOf("isAIKeyValid") >= 0)
	{
		document.getElementById("closeButton").style.display = "block";  // No I18N
            document.getElementById("closeButton").className = "closebtnr3";  // No I18N
		document.getElementById("settings_ON").style.display = "none";  // No I18Ns
        document.getElementById("checking_API_FAIL").style.display = "block";  // No I18N
        document.getElementById("Display_Result").innerHTML = resultDiv;
    }
        else {
            // exception occured while saving, so enable the close button and display the error dialog
            document.getElementById("closeButton").className = "closebtnr3";  // No I18N
            document.getElementById("settings_ON").style.display = "none";  // No I18N
            document.getElementById("settings_FAIL").style.display = "block";  // No I18N
            document.getElementById("Display_Result").innerHTML = resultDiv;
    }

}

//MSP modifed this function for dc integration
function showDCConnectionResult(data, status, reponse) {
    var result = false;
    if(data != null && data.indexOf("Success") >= 0) {
        result = true;
    }
    if(result) {
        // On success, complete the current stage and move to the next one
        document.getElementById("checking_ON").style.display = "none";  // No I18N
        document.getElementById("checking_OK").style.display = "block"; // No I18N
        var isSDEnabled = document.getElementById("isSDEnabled").value;
        if(isSDEnabled == "true")
        {
            document.getElementById("fetching_ON").style.display = "block"; // No I18N
            document.getElementById("fetching_OFF").style.display = "none"; // No I18N
            setTimeout(function() {jQuery.ajax({url: "/DCServerSettings.do", success : showDCSoftwareFetchResult, data:{operation:"FetchSoftware"}})}, 1000);  // No I18N
        }else
            {
                var sDCMenu = document.getElementById("showDCMenu").checked;
		var sDCMDMMenu = document.getElementById("showDCMDMMenu").checked;
                if(sDCMenu || sDCMDMMenu)
                {
                    document.getElementById("compatible_ON").style.display = "block"; // No I18N
                    document.getElementById("compatible_OFF").style.display = "none"; // No I18N
                    setTimeout(function() {jQuery.ajax({url: "/DCServerSettings.do", success : showDCCompatableResult, data:{operation:"CheckDCBuildCompatability"}})}, 1000);  // No I18N
                }else
                {
                    setTimeout(function() { closeDialog(); }, 2000);
                    document.getElementById("Display_Result").innerHTML = resultDiv;
                }

            }

    }
    else {
        document.getElementById("closeButton").className = "closebtnr3";  // No I18N
        document.getElementById("checking_ON").style.display = "none";  // No I18N
    document.getElementById("settings_OK").style.display = "none";  // No I18N
        if(data.indexOf("Failure-HTTPS") >= 0) {
            document.getElementById("checking_FAIL_HTTPS").style.display = "block";  // No I18N
        }else if(data.indexOf("APIFailure") >= 0)
    {
        document.getElementById("checking_API_FAIL").style.display = "block";  // No I18N
		document.getElementById("Display_Result").innerHTML = resultDiv;
    }
        else {
            document.getElementById("checking_FAIL").style.display = "block";  // No I18N
        }
        document.getElementById("Display_Result").innerHTML = resultDiv;
    }
}

//MSP modifed this function for dc integration
function showDCSoftwareFetchResult(data, status, reponse) {
    var result = false;
    if(data != null && data.indexOf("Success") >= 0) {
        result = true;
    }
    var sDCMenu = document.getElementById("showDCMenu").checked;
    var sDCMDMMenu = document.getElementById("showDCMDMMenu").checked;
    if(result) {
        document.getElementById("fetching_ON").style.display = "none";  // No I18N
        document.getElementById("fetching_OK").style.display = "block";  // No I18N
        if(sDCMenu || sDCMDMMenu)
        {
            document.getElementById("compatible_ON").style.display = "block"; // No I18N
            document.getElementById("compatible_OFF").style.display = "none"; // No I18N
            setTimeout(function() {jQuery.ajax({url: "/DCServerSettings.do", success : showDCCompatableResult, data:{operation:"CheckDCBuildCompatability"}})}, 1000);  // No I18N
        }else
        {
            setTimeout(function() { closeDialog(); }, 2000);
        }
    }
    else {
        document.getElementById("closeButton").className = "closebtnr3";  // No I18N
        document.getElementById("fetching_ON").style.display = "none";  // No I18N
        document.getElementById("fetching_FAIL").style.display = "block";  // No I18N
    }
    // Update the content to the Display_Result div, for use, when the save button is clicked immediately without refreshing the page.
        if(!sDCMenu)
        {
            document.getElementById("Display_Result").innerHTML = resultDiv;  // No I18N
            dcForm = null;
        }
}

function showDCCompatableResult(data, status, reponse) {
    var result = false;
    if(data != null && data.indexOf("Success") >= 0) {
        result = true;
    }
    if(result) {
        document.getElementById("compatible_ON").style.display = "none";  // No I18N
        document.getElementById("compatible_OK").style.display = "block";  // No I18N
        setTimeout(function() {closeDialog();}, 2000);
    }
    else {
        document.getElementById("closeButton").className = "closebtnr3";  // No I18N
    document.getElementById("compatible_ON").style.display = "none";  // No I18N
    document.getElementById("compatible_FAIL").style.display = "block";  // No I18N
    }
    var sDCMenu = document.getElementById("showDCMenu").checked;
    var sDCMDMMenu = document.getElementById("showDCMDMMenu").checked;
    // Update the content to the Display_Result div, for use, when the save button is clicked immediately without refreshing the page.
   if(sDCMenu || sDCMDMMenu)
    {
        document.getElementById("Display_Result").innerHTML = resultDiv;  // No I18N
        dcForm = null;
}

}


/*
 * MSP code for dc integration
 */
var syncResultDiv = "";
function syncDataToDC(formObj) {

    dcForm = formObj;

     var portNumber = document.AssociatedApplicationsForm.serverPort.value;
    var serverName = document.AssociatedApplicationsForm.serverName.value;
     var sDCMenu = document.getElementById("showDCMenu").checked;
    if(!sDCMenu)
    {
            alert(getMessageForKey("sdp.admin.dcserversettings.integration_mode_req")); // No I18N
            return false;

    }
    if(trim(serverName) == "") {
        alert(getMessageForKey("sdp.admin.dcserversettings.servername")); // No I18N
        return false;
    }
    if(portNumber != "") {
        var result = isInteger(portNumber);
        if(!result) {
            alert(getMessageForKey("sdp.common.error.nonnumeric")); // No I18N
            document.AssociatedApplicationsForm.serverPort.focus();
            return false;
        }
    }
    //alert("sass")
     syncResultDiv = document.getElementById("Display_Sync_Result").innerHTML;
      document.getElementById("Display_Sync_Result").innerHTML = "";
        showDialog(syncResultDiv, "closeButton=no"); // No I18N
     setTimeout(function() { invokeSyncToDC(); }, 1000);

}
function invokeSyncToDC()
{
    if(dcForm.serverProtocol[1].checked) {
        sProtocol = dcForm.serverProtocol[1].value;
    }
    else {
        sProtocol = dcForm.serverProtocol[0].value;
    }
    jQuery.ajax({url: "/DCServerSettings.do", success : syncShowDCOperationResult, data:{operation:"CheckConnection"}} ); // No I18N

}
function syncShowDCOperationResult( data, status, response) {

    var result = false;
    // XML received will be like <Result>Success/Failure</Result>

    if(data != null && data.indexOf("Success") >= 0) {
        result = true;
    }


     // In case of success, we need to mark the completion of the savings stage and start the checking stage.
    if(result) {
        document.getElementById("sync_checking_ON").style.display = "none";  // No I18N
        document.getElementById("sync_checking_OK").style.display = "block";  // No I18N
        document.getElementById("sync_compatible_OFF").style.display = "none";  // No I18N
        document.getElementById("sync_compatible_ON").style.display = "block";  // No I18N
        setTimeout(function() {jQuery.ajax({url: "/DCServerSettings.do", success : syncShowDCConnectionResult, data:{operation:"CheckDCBuildCompatability"}})}, 1000);  // No I18N
    }
    else {
        // exception occured while saving, so enable the close button and display the error dialog
        document.getElementById("sync_checking_ON").style.display = "none";  // No I18N
        document.getElementById("sync_checking_FAIL").style.display = "block";  // No I18N
        document.getElementById("Display_Sync_Result").innerHTML = encodeHTML(syncResultDiv);
    }

}
function syncShowDCConnectionResult( data, status, response) {

    var result = false;
    // XML received will be like <Result>Success/Failure</Result>

    if(data != null && data.indexOf("Success") >= 0) {
        result = true;
    }
     if(result) {
        document.getElementById("sync_compatible_ON").style.display = "none";  // No I18N
        document.getElementById("sync_compatible_OK").style.display = "block";  // No I18N
        document.getElementById("sync_mail_OFF").style.display = "none";  // No I18N
        document.getElementById("sync_mail_ON").style.display = "block";  // No I18N
        setTimeout(function() {jQuery.ajax({url: "/DCServerSettings.do", success : showDCSyncMailResult, data:{syncToDC : "sync" , syncDataToDC : "mail"}})}, 1000); // No I18N
    }else
    {
        document.getElementById("sync_compatible_OFF").style.display = "none";  // No I18N
        document.getElementById("sync_compatible_FAIL").style.display = "block";  // No I18N
        document.getElementById("Display_Sync_Result").innerHTML = encodeHTML(syncResultDiv) ;
    }

}

function showDCSyncMailResult( data, status, response)
{
     var result = false;
    // XML received will be like <Result>Success/Failure</Result>

    if(data != null && data.indexOf("Success") >= 0) {
        result = true;
    }

   if(result) {
        document.getElementById("sync_mail_ON").style.display = "none";  // No I18N
        document.getElementById("sync_mail_OK").style.display = "block";  // No I18N
        document.getElementById("sync_site_OFF").style.display = "none";  // No I18N
        document.getElementById("sync_site_ON").style.display = "block";  // No I18N
        setTimeout(function() {jQuery.ajax({url: "/DCServerSettings.do", success : showDCSyncSiteResult, data:{syncToDC : "sync" , syncDataToDC : "sites"}})}, 1000); // No I18N
    }else
    {
        document.getElementById("sync_mail_ON").style.display = "none";  // No I18N
        document.getElementById("sync_mail_FAIL").style.display = "block";  // No I18N
        document.getElementById("Display_Sync_Result").innerHTML = encodeHTML(syncResultDiv) ;

    }
}

function showDCSyncSiteResult(data , status , response)
{
     var result = false;
    // XML received will be like <Result>Success/Failure</Result>

    if(data != null && data.indexOf("Success") >= 0) {
        result = true;
    }

   if(result) {
        document.getElementById("sync_site_ON").style.display = "none";  // No I18N
        document.getElementById("sync_site_OK").style.display = "block";  // No I18N
        setTimeout(function() { closeDialog(); }, 2000);
    }else
    {

      document.getElementById("sync_site_ON").style.display = "none";  // No I18N
      document.getElementById("sync_site_FAIL").style.display = "block";  // No I18N

    }
    document.getElementById("Display_Sync_Result").innerHTML = encodeHTML(syncResultDiv) ;
    syncResultDiv = "";

}
/*
 * MSP code ends for dc integration
 */

function checkEmptyFields() {
    var titleValue = document.CUDTask.TITLE.value;
    if(trim(titleValue) == '') {
        alert(getMessageForKey('sdp.common.titleerrormessage'));
        return false;
    }

    return true;
}

function showUserGroups(source) {
  $('configureRequester').toggle();
  if(source.checked == true) {
    $('usrGrpdisable').hide();    //No I18N
    document.getElementById('usrGrp').style.margin= '0px 0px 0px 0px';          //No I18N
  }
  else {
    $('usrGrpdisable').show();  //No I18N
    document.getElementById('usrGrp').style.margin= '-154px 0px 0px 0px';       //No I18N
  }
}

// ****************************************************************************
// Start of methods for Admin LeftNav
// ****************************************************************************
function sidebarnav(th){
    var selectedHeaderClass=th.getAttribute('class'); // No I18N
    if(selectedHeaderClass=="lnav-headeractive") // No I18N
    {
        jQuery(th).attr('class','lnav-header'); // No I18N
        jQuery('.lnav-itemslist').slideUp(300); // No I18N
    }
    else
    {
        var current_childblock = jQuery(th).next('div.lnav-itemslist'); // No I18N
        var current_header = jQuery(th);
        jQuery(th).attr('class','lnav-headeractive').next("div").slideDown(300); // No I18N
        jQuery('.lnav-itemslist').not(current_childblock).slideUp(300); // No I18N
        setTimeout(function() {jQuery('.lnav-itemslist').not(current_childblock).stop(true, true).hide();}, 200); // No I18N
        jQuery('.lnav-headeractive').not(current_header).attr('class','lnav-header'); // No I18N
    }
    return false;
}

// ****************************************************************************
// End of methods for Admin LeftNav
// ****************************************************************************


/*SDI - 45962
 *
 *  Text Area Expandable Script Begin
 *  e.g. <textarea name="textarea1" rows="3" cols="40" class="expand"></textarea>
 *  Or assign a class of "expandMIN-MAX" to set the <textarea> minimum and maximum height.
 *  e.g. <textarea name="textarea1" rows="3" cols="40" class="expand50-200"></textarea>
 *
 */
(function(jQuery) {
    // jQuery plugin definition
    jQuery.fn.TextAreaExpander= function(minHeight, maxHeight) {

        var CheckH = !(jQuery.browser.msie || jQuery.browser.opera);

        // resize a textarea
        function Textareasize(e) {

            // event or initialize element?
            e = e.target || e;

            // find content length and box width
            var findlength = e.value.length, ewidth = e.offsetWidth;
            if (findlength != e.valLength || ewidth != e.boxWidth) {

                if (CheckH && (findlength < e.valLength || ewidth != e.boxWidth)) e.style.height = "0px";
                var h = Math.max(e.expandMin, Math.min(e.scrollHeight, e.expandMax));

                e.style.overflow = (e.scrollHeight > h ? "auto" : "hidden");
                e.style.height = h + "px";

                e.valLength = findlength;
                e.boxWidth = ewidth;
            }

            return true;
        };

        // initialize
        this.each(function() {

            // is a textarea?
            if (this.nodeName.toLowerCase() != "textarea") return;

            // set height restrictions
            var p = this.className.match(/expand(\d+)\-*(\d+)*/i);
            this.expandMin = minHeight || (p ? parseInt('0'+p[1], 10) : 0);
            this.expandMax = maxHeight || (p ? parseInt('0'+p[2], 10) : 99999);

            // initial resize
            Textareasize(this);

            // zero vertical padding and add events
            if (!this.Initialized) {
                this.Initialized = true;
                jQuery(this).css("padding-top", 0).css("padding-bottom", 0);//NO I18N
                jQuery(this).on("keyup", Textareasize).on("focus", Textareasize);//NO I18N
            }
        });

        return this;
    };

})(jQuery);

// initialize all expanding textareas
jQuery(document).ready(function() {
    jQuery("textarea[class*=expand]").TextAreaExpander();//NO I18N
});

// SDI - 45962 This is used to autocompleter div overwrite the height, in request details reply window textarea field.
function changePosition(ev,divID,textareaID)
{
    key = getEventKey(ev);
    var divobj = jQuery('#'+divID);
    var acdiv = jQuery('#'+textareaID);
    var t = acdiv.offset().top + acdiv.outerHeight();
    var l = acdiv.offset().left;
    divobj.css({'to-p':t , 'left': l}) //NO I18N
}

function cancelProductSettings()
{
    jQuery("#productlist").show();
    jQuery("#productdetails").hide();
    jQuery( '.zca-maincontent' ).show();
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
            jQuery.ajax({
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
    showconfirm(true, 'title=' + getMessageForKey("admin.proxy.delete.title") + ', message=' + getMessageForKey('admin.proxy.delete.confirmation') + ', submitbutton=' + getMessageForKey("sdp.common.delete") + ', cancelbutton=' + getMessageForKey("sdp.common.cancel") + ', closebutton=yes, closeOnEscKey=yes', showconfirmcallback,true); //No I18N
    function showconfirmcallback(result){
        if(result){
            if(forwardfrom === "ESM"){
                jQuery.ajax({
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

function disableWebLoginNotification(elem){

    if( ! jQuery(elem).is(':checked') ){

        jQuery("[name='"+jQuery(elem).attr('name')+"_force']").prop( 'checked', false ).prop('disabled', true);     //NO I18N

    } else{

        jQuery("[name='"+jQuery(elem).attr('name')+"_force']").prop('disabled', false);      //NO I18N
    }
}
// Old method moved from jsp to js for common purpose
function callTemplatesOnReadyFn(servId, templatesCount, module, templateid, fromPMTask, fromReorder)
{
    var templatesDiv = "#templateList";//No i18N
    var categoryDiv = "#categoryList";//No i18N
    if(fromReorder){
        templatesDiv = "#templateListReorder";//No i18N
        categoryDiv = "#categoryListReorder";//No i18N
    }
    jQuery(templatesDiv).children('div').hide();//No i18N
    jQuery(templatesDiv +':first').show();//No i18N
    if(servId!="null" && servId!="" && templatesCount>0)
    {
        jQuery(categoryDiv+' #categoryList_'+servId).trigger('click');//No i18N
        jQuery(categoryDiv+' #categoryList_'+servId).attr('class','clearfix disp-t fw active');//No i18N
    }
    else if(servId == "null" && templateid != "null" && templateid != undefined)
    {
        //This block is added for "others" category section.
        var selected = jQuery(categoryDiv+" #categoryList_0");//No i18N
        if(selected.index() < 0)
        {
            selected = jQuery(categoryDiv+' li:first');//No i18N
        }
        selected.trigger('click');
        selected.attr('class','temp-cat-leftnav-items temp-cat-leftnav-items-active');
    }
    else
    {
        if(servId=="null" && init_temp_msg.show)
        {
            jQuery("#template_Message").removeClass("hide");//No i18n
        }
        else
        {
            jQuery(categoryDiv+' li:first').attr('class','clearfix disp-t fw active');//No i18N
            jQuery(categoryDiv+' li:first').trigger('click');//No i18N
            jQuery(window).trigger('resize');
        }
    }
    jQuery(categoryDiv+' li').on('click', function(){//No i18N
    jQuery(this).addClass("active").siblings().removeClass('active');//No i18N
        });
    initTooltip('#categoryListReorder');//No i18N
}

//Method used to place the selected template based on operation (Add/Edit)
function templateSelected(tempId, tempName, mode, currentrow)
{
    //SD-76320 Issue fixed
    //Template name is replaced with special character and encoded
    tempName=decodeHTML(tempName);
    if(mode === "add")
    {
        window.opener.document.BusinessRuleDefForm.actionValue.value = " \""+ tempName + "\"";
        window.opener.document.BusinessRuleDefForm.hid2.value = tempId;
        window.opener.addToBRActionList();
    }
    else
    {
        window.opener.jQuery("#rowActionTextID"+currentrow).val(getMessageForKey("sdp.admin.rule.ruleaction.template")+" "+ "\""+ tempName + "\"");
        window.opener.jQuery("#rowActionValID"+currentrow).val("56,"+tempId);
    }
    window.close();

}

//SLA escalation level check started ## SD-57160, SD-62508 ## sla esc issue fixed
// declaring SLA based global params
var L1Esc;
var L2Esc;
var L3Esc;
var L4Esc;
var L1Option;
var L2Option;
var L3Option;
var L4Option;
var dueByTime;
var frResponseTime;
var frResponseEscTime;
var escBeforeMsg = getMessageForKey("sdp.admin.sla.errormsg.escbefore");
var escAfterMsg = getMessageForKey("sdp.admin.sla.errormsg.escafter");
var operHrPerDay = 24*60; // by default 24 hrs/day
var L0ErrShown = false;
// SLA level esc time check started
// setting escalation time for all levels during form load
function setSLAInfoInSession(opermins)
{
        var overrideOH = document.getElementsByName('overrideOperatingHours')[0].checked;
        if(!overrideOH)
        {
                operHrPerDay = opermins;
        }
        sessionStorage.setItem("baseOperHr", opermins); //site based operational hrs  //NO I18N
        sessionStorage.setItem("operHr", operHrPerDay); //operational hrs based on override check //NO I18N
        calcFrResponse();
        calcL0Esc();
        calcDueByTime();
        calcL1Esc();
        calcL2Esc();
        calcL3Esc();
        calcL4Esc();
        setDefaultEscOption();
}
function setDefaultEscOption()
{
        for(var i=0 ; i<=4; i++)
        {
                        var element = jQuery('input:radio[name=escalateBefore'+i+']:checked');
                        var selOption = element.val();
                        if(selOption === undefined)
                        {
                                jQuery('input:radio[name=escalateBefore'+i+']')[1].checked = true;
                        }
        }
}
//calculating first response escalation time
function calcFrResponse()
{
                        var responseDays = jQuery("input[name='frDueByDays']").val();
                        var responseHrs = jQuery("select[name='frDueByHours']").val();
                        var responseMins = jQuery("select[name='frDueByMinutes']").val();
                        frResponseTime = parseInt(responseDays*operHrPerDay) + parseInt(responseHrs*60) + parseInt(responseMins);
                        if(frResponseTime > 0)
                        {
                                        var hrs = Math.floor(frResponseTime/60) + "&nbsp;"+getMessageForKey("sdp.common.hrs"); //NO I18N
                                        var mins = frResponseTime%60 +"&nbsp;"+getMessageForKey("sdp.common.mins"); //NO I18N
                                        var timeStr = getMessageForKey("sdp.admin.sla.listview.responsetime")+"&nbsp;:&nbsp;"+hrs+"&nbsp;"+mins; //NO I18N
                                        jQuery("#frspan").css("visibility","visible").html(timeStr);//NO I18N
                        }
                        else{
                                        jQuery("#frspan").css("visibility","hidden");//NO I18N
                        }
}
//calculating duebytime
function calcDueByTime()
{
                        var dueByDays = jQuery("input[name='dueByDays']").val();
                        var dueByHrs = jQuery("select[name='dueByHours']").val();
                        var dueByMins = jQuery("select[name='dueByMinutes']").val();
                        dueByTime = parseInt(dueByDays*operHrPerDay) + parseInt(dueByHrs*60) + parseInt(dueByMins);
                        if(dueByTime > 0)
                                {
                                        var hrs = Math.floor(dueByTime/60) + "&nbsp;"+getMessageForKey("sdp.common.hrs"); //NO I18N
                                        var mins = dueByTime%60 +"&nbsp;"+getMessageForKey("sdp.common.mins"); //NO I18N
                                        var timeStr = getMessageForKey("sdp.admin.sla.listview.resolutiontime")+"&nbsp;:&nbsp;"+hrs+"&nbsp;"+mins; //NO I18N
                                        jQuery("#duespan").css("visibility","visible").html(timeStr);//NO I18N
                                }
                                else
                                {
                                        jQuery("#duespan").css("visibility","hidden");//NO I18N
                                }
}
//first responsetime valiation and calculation.
function setSLAFrResponseTime()
{
                        hideErrMsgSpan("errorMsgFr"); //NO I18N
                        hideErrMsgSpan("errorMsgDue"); //NO I18N
                        var responseDays = jQuery("input[name='frDueByDays']").val();
                        calcFrResponse();
                        calcDueByTime();
                        if(!checkintegervalue(responseDays) && responseDays !== "")
                        {
                                showErrMsgSpan("errorMsgFr",getMessageForKey("sdp.admin.sla.frinvaliddatejserror"),"textalone"); //NO I18N
                                return false;
                        }
                        else if(dueByTime > 0 && frResponseTime >= dueByTime)
                        {
                                showErrMsgSpan("errorMsgDue", getMessageForKey("sdp.admin.sla.duetime.errmsg")); //NO I18N
                                return false;
                        }
                        else
                        {
                                if(L0ErrShown)
                                {
                                        if(frResponseEscTime < frResponseTime)
                                        {
                                                hideErrMsgSpan("errorMsg0"); //NO I18N
                                        }
                                }
                                return true;
                        }
}
//duebytime validation and calculation
function setSLADueByTime()
{
                        hideErrMsgSpan("errorMsgDue"); //NO I18N
                        var dueByDays = jQuery("input[name='dueByDays']").val();
                        calcDueByTime();
                        responseTime = calcFrResponse();
                        if(!checkintegervalue(dueByDays) && dueByDays!== "")
                        {
                                showErrMsgSpan("errorMsgDue",getMessageForKey("sdp.admin.sla.invaliddatejserror"),"textalone"); //NO I18N
                                return false;
                        }
                        else if(dueByTime > 0 && frResponseTime >= dueByTime)
                        {
                                showErrMsgSpan("errorMsgDue", getMessageForKey("sdp.admin.sla.duetime.errmsg")); //NO I18N
                                return false;
                        }
                        else
                        {
                                reCheckBeforeEsc();
                                return true;
                        }
}
//first response escalation time calculation.
function calcL0Esc()
{
                var days0= jQuery("input[name='escalateAfterDays0']").val();
                var hrs0 = jQuery("select[name='escalateAfterHours0']").val();
                var mins0 = jQuery("select[name='escalateAfterMinutes0']").val();
                frResponseEscTime = parseInt(days0*operHrPerDay) + parseInt(hrs0*60) + parseInt(mins0);
                if(frResponseEscTime > 0)
                {
                        var hrs = Math.floor(frResponseEscTime/60) + "&nbsp;"+getMessageForKey("sdp.common.hrs"); //NO I18N
                        var mins = frResponseEscTime%60 +"&nbsp;"+getMessageForKey("sdp.common.mins"); //NO I18N
                        var timeStr = getMessageForKey("sdp.admin.sla.responseesctime")+"&nbsp;"+hrs+"&nbsp;"+mins; //NO I18N
                        jQuery("#level0span").css("visibility","visible").html(timeStr);//NO I18N
                }
                else
                {
                        jQuery("#level0span").css("visibility","hidden");//NO I18N
                }
                return frResponseEscTime;
}
//Level1 esc time calculation
function calcL1Esc()
{
        var days1= jQuery("input[name='escalateAfterDays1']").val();
        var hrs1 = jQuery("select[name='escalateAfterHours1']").val();
        var mins1 = jQuery("select[name='escalateAfterMinutes1']").val();
        L1Esc = parseInt(days1*operHrPerDay) + parseInt(hrs1*60) + parseInt(mins1);
        L1Option = jQuery("input[name='escalateAfterDays1']").closest("tr").find("td :checked").val();//NO I18N
        if(L1Esc > 0)
        {
                var hrs = Math.floor(L1Esc/60) + "&nbsp;"+getMessageForKey("sdp.common.hrs"); //NO I18N
                var mins = L1Esc%60 +"&nbsp;"+getMessageForKey("sdp.common.mins"); //NO I18N
                var timeStr = getMessageForKey("sdp.admin.sla.level1esctime")+"&nbsp;"+hrs+"&nbsp;"+mins; //NO I18N

                jQuery("#level1span").css("visibility","visible").html(timeStr);//NO I18N
        }
        else
        {
                jQuery("#level1span").css("visibility","hidden");//NO I18N
        }
}
//Level2 esc time calculation
function calcL2Esc()
{
        var days2= jQuery("input[name='escalateAfterDays2']").val();
        var hrs2 = jQuery("select[name='escalateAfterHours2']").val();
        var mins2 = jQuery("select[name='escalateAfterMinutes2']").val();
        L2Esc = parseInt(days2*operHrPerDay) + parseInt(hrs2*60) + parseInt(mins2);
        L2Option = jQuery("input[name='escalateAfterDays2']").closest("tr").find("td :checked").val();//NO I18N
        if(L2Esc > 0)
        {
                var hrs = Math.floor(L2Esc/60) + "&nbsp;"+getMessageForKey("sdp.common.hrs"); //NO I18N
                var mins = L2Esc%60 +"&nbsp;"+getMessageForKey("sdp.common.mins"); //NO I18N
                var timeStr = getMessageForKey("sdp.admin.sla.level2esctime")+"&nbsp;"+hrs+"&nbsp;"+mins; //NO I18N
                jQuery("#level2span").css("visibility","visible").html(timeStr);//NO I18N
        }
        else
        {
                jQuery("#level2span").css("visibility","hidden");//NO I18N
        }
}
//Level3 esc time calculation
function calcL3Esc()
{
        var days3= jQuery("input[name='escalateAfterDays3']").val();
        var hrs3 = jQuery("select[name='escalateAfterHours3']").val();
        var mins3 = jQuery("select[name='escalateAfterMinutes3']").val();
        L3Esc = parseInt(days3*operHrPerDay) + parseInt(hrs3*60) + parseInt(mins3);
        L3Option = jQuery("input[name='escalateAfterDays3']").closest("tr").find("td :checked").val();//NO I18N
        if(L3Esc > 0)
        {
                var hrs = Math.floor(L3Esc/60) + "&nbsp;"+getMessageForKey("sdp.common.hrs"); //NO I18N
                var mins = L3Esc%60 +"&nbsp;"+getMessageForKey("sdp.common.mins"); //NO I18N
                var timeStr = getMessageForKey("sdp.admin.sla.level3esctime")+"&nbsp;"+hrs+"&nbsp;"+mins; //NO I18N
                jQuery("#level3span").css("visibility","visible").html(timeStr);//NO I18N
        }
        else
        {
                jQuery("level3span").css("visibility","hidden");//NO I18N
        }
}
//Level4 esc time calculation
function calcL4Esc()
{
        var days4= jQuery("input[name='escalateAfterDays4']").val();
        var hrs4 = jQuery("select[name='escalateAfterHours4']").val();
        var mins4 = jQuery("select[name='escalateAfterMinutes4']").val();
        L4Esc = parseInt(days4*operHrPerDay) + parseInt(hrs4*60) + parseInt(mins4);
        L4Option = jQuery("input[name='escalateAfterDays4']").closest("tr").find("td :checked").val();//NO I18N
        if(L4Esc > 0)
        {
                var hrs = Math.floor(L4Esc/60) + "&nbsp;"+getMessageForKey("sdp.common.hrs"); //NO I18N
                var mins = L4Esc%60 +"&nbsp;"+getMessageForKey("sdp.common.mins"); //NO I18N
                var timeStr = getMessageForKey("sdp.admin.sla.level4esctime")+"&nbsp;"+hrs+"&nbsp;"+mins; //NO I18N
                jQuery("#level4span").css("visibility","visible").html(timeStr);//NO I18N
        }
        else
        {
                jQuery("#level4span").css("visibility","hidden");//NO I18N
        }
}
//check esc time for all levels while saving
function validateSLAEscInSave()
{
        if(setSLAFrResponseTime())
        {
                if(setSLADueByTime())
                {
                        if( validateEscTime0())
                        {
                                if(validateEscTime1())
                                {
                                        if(validateEscTime2())
                                        {
                                                if(validateEscTime3())
                                                {
                                                        if(validateEscTime4())
                                                        {
                                                                if(jQuery("input[name='frDueByDays']").val() === "")
                                                                {
                                                                        jQuery("input[name='frDueByDays']").val("0");
                                                                }
                                                                if(jQuery("input[name='dueByDays']").val() === "")
                                                                {
                                                                        jQuery("input[name='dueByDays']").val("0");
                                                                }
                                                                for(var i=0 ; i<=4; i++)
                                                                {
                                                                        var element = jQuery('input[name=escalateAfterDays'+i+']');
                                                                        if(element.val() === "")
                                                                        {
                                                                                element.val("0");
                                                                        }
                                                                }
                                                                return true;
                                                        }
                                                }
                                        }
                                }
                        }
                }
        }
    alert(getMessageForKey("sdp.admin.sla.saverr"));
        return false;
}
//showing error message span
function showErrMsgSpan(errorspan, message , textalone)
{
                jQuery("#"+errorspan).show();
                jQuery("#"+errorspan).find("span").text(message);
                if(textalone !== undefined)
                {
                        jQuery("#"+errorspan).prev().find("input[type=text]").css({'border':  'solid 1px #ff0000'});
                }
                else
                {
                        jQuery("#"+errorspan).prev().find(":input").css({'border':  'solid 1px #ff0000'});
                }
}
//Hiding error message span
function hideErrMsgSpan(errorspan)
{
                jQuery("#"+errorspan).hide();
                jQuery("#"+errorspan).find("span").text("");
                jQuery("#"+errorspan).prev().find(":input").css({'border':  ''});
}
//validate first response escalation time
function validateEscTime0()
{
        if(document.SLADefForm.checkbox0.checked)
        {
                hideErrMsgSpan("errorMsg0"); //NO I18N
                var selOption = jQuery('input:radio[name=escalateBefore0]:checked').val();//NO I18N
                //calculating frresponse escalation time
                frResponseEscTime = calcL0Esc();
                var a0 = document.SLADefForm.escalateAfterDays0.value;
                if(!checkintegervalue(a0) && a0 !== "")
                {
                                showErrMsgSpan("errorMsg0", getMessageForKey("sdp.admin.sla.invalidescalateafterjserror"),"textalone"); //NO I18N
                                L0ErrShown = true;
                return false;
                }
                if(frResponseEscTime>0 && selOption === "escbefore")
                {
                        //checking frresponse escalation time and frresponse time
                        if(frResponseTime !== null && frResponseTime>0 && (frResponseEscTime >= frResponseTime))
                        {
                                showErrMsgSpan("errorMsg0", getMessageForKey("sdp.admin.sla.level0.errmsg")); //NO I18N
                                L0ErrShown = true;
                                return false;
                        }
                        else
                        {
                                return true;
                        }
                }

        }
        return true;
}
//validating Level1 esc time
function validateEscTime1()
{
    if(document.SLADefForm.checkbox1.checked)
    {
        hideErrMsgSpan("errorMsg1"); //NO I18N
        var selOption = jQuery('input:radio[name=escalateBefore1]:checked').val();//NO I18N
        calcL1Esc();
        var L2EscEnabled = document.SLADefForm.checkbox2.checked;
        var L3EscEnabled = document.SLADefForm.checkbox3.checked;
        var L4EscEnabled = document.SLADefForm.checkbox4.checked;
        var a1 = document.SLADefForm.escalateAfterDays1.value;
        if(!checkintegervalue(a1) && a1 !== "")
        {
                showErrMsgSpan("errorMsg1",getMessageForKey("sdp.admin.sla.invalidescalateafterjserror"),"textalone"); //NO I18N
                return false;
        }
        //checking level1esc time with dueByTime for esc before option
        if(L1Esc >0 && selOption === "escbefore" )
        {
            // setting L1EscalationTime
            if(dueByTime !== null && (L1Esc >= dueByTime))
            {
                showErrMsgSpan("errorMsg1", escBeforeMsg);//NO I18N
                return false;
            }
            else if((L2EscEnabled && L2Option === "escbefore" && L2Esc > 0 && L1Esc <= L2Esc) || (L3EscEnabled && L3Option === "escbefore" && L3Esc > 0 && L1Esc<=L3Esc) || (L4EscEnabled && L4Option === "escbefore" && L4Esc > 0 && L1Esc <= L4Esc))
            {
                showErrMsgSpan("errorMsg1", escBeforeMsg);//NO I18N
                return false;
            }
            else
            {
                reCheckBeforeEsc();
                return true;
            }
        }
        if(L1Esc > 0 && selOption === "escafter" )
        {
            // setting L1EscalationTime
            if((L2EscEnabled && L2Option === "escafter" && L2Esc > 0 && L1Esc >= L2Esc) || (L3EscEnabled && L3Option === "escafter" && L3Esc > 0 && L1Esc >= L3Esc) ||(L4EscEnabled && L4Option === "escafter" && L4Esc > 0 && L1Esc >= L4Esc))
            {
                showErrMsgSpan("errorMsg1", escAfterMsg);//NO I18N
                return false;
            }
            else
            {
                reCheckAfterEsc();
                return true;
            }
        }
    }
    return true;
}
//validating Level2 esc time
function validateEscTime2()
{
    if(document.SLADefForm.checkbox2.checked)
    {
        hideErrMsgSpan("errorMsg2"); //NO I18N
        var selOption = jQuery('input:radio[name=escalateBefore2]:checked').val();//NO I18N
        calcL2Esc();
        var L1EscEnabled = document.SLADefForm.checkbox1.checked;
        var L3EscEnabled = document.SLADefForm.checkbox3.checked;
        var L4EscEnabled = document.SLADefForm.checkbox4.checked;
        var a2 = document.SLADefForm.escalateAfterDays2.value;
        if(!checkintegervalue(a2) && a2 !== "")
        {
                showErrMsgSpan("errorMsg2",getMessageForKey("sdp.admin.sla.invalidescalateafterjserror"),"textalone"); //NO I18N
                return false;
        }
        //checking level2 esc time with level1/resolved time for esc BEFORE option
        if(L2Esc >0 && selOption === "escbefore" )
        {
            // setting L2EscalationTime
            if((L1EscEnabled && L1Option === "escbefore"  && L1Esc>0 && L2Esc >= L1Esc) || (dueByTime > 0 && L2Esc >= dueByTime))
            {
                showErrMsgSpan("errorMsg2", escBeforeMsg);//NO I18N
                return false;
            }
            else if((L3EscEnabled && L3Option === "escbefore" && L3Esc > 0 && L2Esc <= L3Esc) || (L4EscEnabled && L4Option === "escbefore" && L4Esc > 0 && L2Esc <= L4Esc))
            {
                showErrMsgSpan("errorMsg2", escBeforeMsg);//NO I18N
                return false;
            }
            else
            {
                reCheckBeforeEsc();
                return true;
            }
        }
    //checking level2 esc time with level1 esc for esc AFTER option
        if(L2Esc > 0 && selOption === "escafter" )
        {
            // setting L2EscalationTime
            if(L1EscEnabled && L1Option === "escafter" && L1Esc > 0  && L2Esc <= L1Esc)
            {
                showErrMsgSpan("errorMsg2", escAfterMsg);//NO I18N
                return false;
            }
            else if((L3EscEnabled && L3Option === "escafter" && L3Esc>0 && L2Esc >= L3Esc) || (L4EscEnabled && L4Option === "escafter" && L4Esc>0 && L2Esc >= L4Esc))
            {
                showErrMsgSpan("errorMsg2", escAfterMsg);//NO I18N
                return false;
            }
            else
            {
                reCheckAfterEsc();
                return true;
            }
        }
    }
    return true;
}
//validating level3 esc time
function validateEscTime3()
{
    if(document.SLADefForm.checkbox3.checked)
    {
        hideErrMsgSpan("errorMsg3"); //NO I18N
        var selOption = jQuery('input:radio[name=escalateBefore3]:checked').val();//NO I18N
        calcL3Esc();
        var a3 = document.SLADefForm.escalateAfterDays3.value;
        var L1EscEnabled = document.SLADefForm.checkbox1.checked;
        var L2EscEnabled = document.SLADefForm.checkbox2.checked;
        var L4EscEnabled = document.SLADefForm.checkbox4.checked;
        if(!checkintegervalue(a3) && a3 !== "")
        {
                showErrMsgSpan("errorMsg3",getMessageForKey("sdp.admin.sla.invalidescalateafterjserror"),"textalone"); //NO I18N
                return false;
        }
        //checking level3 esc time with level2/level1/resolved time for esc BEFORE option
        if(L3Esc>0 && selOption === "escbefore" )
        {
            // setting L3EscalationTime
            if((L2EscEnabled && L2Option === "escbefore" && L2Esc>0 && L3Esc >= L2Esc) ||(L1EscEnabled && L1Option === "escbefore" && L1Esc>0 && L3Esc >= L1Esc) || (dueByTime !==null && dueByTime > 0 && L3Esc >= dueByTime))
            {
                showErrMsgSpan("errorMsg3", escBeforeMsg);//NO I18N
                return false;
            }
            else if(L4EscEnabled && L4Option === "escbefore" && L4Esc>0 && L3Esc <= L4Esc)
            {
                showErrMsgSpan("errorMsg3", escBeforeMsg);//NO I18N
                return false;
            }
            else{
                reCheckBeforeEsc();
                return true;
            }
        }
    //checking level3 esc time with level2 esc for esc AFTER option
        if(L3Esc>0 && selOption === "escafter" )
        {
            // setting L3EscalationTime
            if((L2EscEnabled && L2Option === "escafter" && L2Esc>0 && L3Esc <= L2Esc) || (L1EscEnabled && L1Option === "escafter" && L1Esc >0 && L3Esc <= L1Esc))
            {
                showErrMsgSpan("errorMsg3", escAfterMsg);//NO I18N
                return false;
            }
            else if(L4EscEnabled && L4Option === "escafter" && L4Esc>0 && L3Esc >= L4Esc)
            {
                showErrMsgSpan("errorMsg3", escAfterMsg);//NO I18N
                return false;
            }
            else
            {
                reCheckAfterEsc();
                return true;
            }
        }
    }
    return true;
}
//validating level4 esc time
function validateEscTime4()
{
    if(document.SLADefForm.checkbox4.checked)
    {
        hideErrMsgSpan("errorMsg4"); //NO I18N
        var selOption = jQuery('input:radio[name=escalateBefore4]:checked').val();//NO I18N
        calcL4Esc();
        var a4 = document.SLADefForm.escalateAfterDays4.value;
        var L1EscEnabled = document.SLADefForm.checkbox1.checked;
        var L2EscEnabled = document.SLADefForm.checkbox2.checked;
        var L3EscEnabled = document.SLADefForm.checkbox3.checked;
        if(!checkintegervalue(a4) && a4 !== "")
        {
                showErrMsgSpan("errorMsg4",getMessageForKey("sdp.admin.sla.invalidescalateafterjserror"),"textalone"); //NO I18N
                return false;
        }
        //checking level4 esc time with level3/level2/level1/resolved time for esc BEFORE option
        if(L4Esc>0 && selOption === "escbefore" )
        {
            // calculating L4EscalationTime
            if((L3EscEnabled && L3Option === "escbefore" && L3Esc>0 && L4Esc >= L3Esc) ||(L2EscEnabled && L2Option === "escbefore" && L2Esc >0 && L4Esc >= L2Esc) ||(L1EscEnabled && L1Option === "escbefore" && L1Esc>0 && L4Esc >= L1Esc) || (dueByTime !==null && dueByTime>0 && L4Esc >= dueByTime))
            {
                showErrMsgSpan("errorMsg4", escBeforeMsg);//NO I18N
                return false;
            }
            else
            {
                reCheckBeforeEsc();
                return true;
            }

        }

        //checking level4 esc time with level3/level2/level1  esc for esc AFTER option
        if(L4Esc>0 && selOption === "escafter" )
        {
            // calculating L4EscalationTime
            if((L3EscEnabled && L3Option === "escafter" && L3Esc >0 && L4Esc <= L3Esc)||(L2EscEnabled && L2Option === "escafter" && L2Esc>0 && L4Esc <= L2Esc) || (L1EscEnabled && L1Option === "escafter"  &&  L1Esc>0 && L4Esc <= L1Esc))
            {
                showErrMsgSpan("errorMsg4", escAfterMsg);//NO I18N
                return false;
            }
            else
            {
                reCheckAfterEsc();
                return true;
            }
        }
    }
    return true;
}
function reCheckBeforeEsc()
{
    var L1Status = true;
    var L2Status = true;
    var L3Status = true;
    var L4Status = true;
    var checkL1 = false;
    var checkL2 = false;
    var checkL3 = false;
    var checkL4 = false;
    if(L1Option === "escbefore" && L1Esc >0)
    {
        checkL1 = true;
    }
    if(L2Option === "escbefore" && L2Esc >0)
    {
        checkL2 = true;
    }
    if(L3Option === "escbefore" && L3Esc >0)
    {
        checkL3 = true;
    }
    if(L4Option === "escbefore" && L4Esc >0)
    {
        checkL4 = true;
    }
    if(checkL1)
    {
        if(checkL2 && L2Esc >= L1Esc )
        {
            L2Status = false;
        }
        if(checkL3 && L3Esc >= L1Esc)
        {
            L3Status = false;
        }
        if(checkL4 && L4Esc >= L1Esc)
        {
            L4Status = false;
        }
        if(L1Status && L2Status && L3Status && L4Status)
        {
            if(L1Esc < dueByTime)
            {
                hideErrMsgSpan("errorMsg1");//NO I18N
            }
        }
    }
    if(checkL2)
    {
        if(checkL1 && L1Esc <= L2Esc )
        {
            L1Status = false;
        }
        if(checkL3 && L3Esc >= L2Esc)
        {
            L3Status = false;
        }
        if(checkL4 && L4Esc >= L2Esc)
        {
            L4Status = false;
        }
        if(L1Status && L2Status && L3Status && L4Status)
        {
            if(L2Esc < dueByTime)
            {
                hideErrMsgSpan("errorMsg2");//NO I18N
            }
        }
    }
    if(checkL3)
    {
        if(checkL1 && L1Esc <= L3Esc)
        {
            L1Status = false;
        }
        if(checkL2 && L2Esc <= L3Esc )
        {
            L2Status = false;
        }
        if(checkL4 && L4Esc >= L3Esc)
        {
            L4Status = false;
        }
        if(L1Status && L2Status && L3Status && L4Status)
        {
            if(L3Esc < dueByTime)
            {
                hideErrMsgSpan("errorMsg3");//NO I18N
            }
        }
    }
    if(checkL4)
    {
        if(checkL1 && L1Esc <= L4Esc)
        {
            L1Status = false;
        }
        if(checkL2 && L2Esc <= L4Esc )
        {
            L2Status = false;
        }
        if(checkL3 && L3Esc <= L4Esc)
        {
            L3Status = false;
        }
        if(L1Status && L2Status && L3Status && L4Status)
        {
            if(L4Esc < dueByTime)
            {
                hideErrMsgSpan("errorMsg4");//NO I18N
            }
        }
    }

}
function reCheckAfterEsc()
{
    var L1Status = true;
    var L2Status = true;
    var L3Status = true;
    var L4Status = true;
    var checkL1 = false;
    var checkL2 = false;
    var checkL3 = false;
    var checkL4 = false;
    if(L1Option === "escafter" && L1Esc >0)
    {
        checkL1 = true;
    }
    if(L2Option === "escafter" && L2Esc >0)
    {
        checkL2 = true;
    }
    if(L3Option === "escafter" && L3Esc >0)
    {
        checkL3 = true;
    }
    if(L4Option === "escafter" && L4Esc >0)
    {
        checkL4 = true;
    }
    if(checkL1)
    {
        if(checkL2 && L2Esc <= L1Esc )
        {
            L2Status = false;
        }
        if(checkL3 && L3Esc <= L1Esc)
        {
            L3Status = false;
        }
        if(checkL4 && L4Esc <= L1Esc)
        {
            L4Status = false;
        }
        if(L1Status && L2Status && L3Status && L4Status)
        {
            hideErrMsgSpan("errorMsg1");//NO I18N
        }
    }
    if(checkL2)
    {
        if(checkL1 && L1Esc >= L2Esc )
        {
            L1Status = false;
        }
        if(checkL3 && L3Esc <= L2Esc)
        {
            L3Status = false;
        }
        if(checkL4 && L4Esc <= L2Esc)
        {
            L4Status = false;
        }
        if(L1Status && L2Status && L3Status && L4Status)
        {
            hideErrMsgSpan("errorMsg2");//NO I18N
        }
    }
    if(checkL3)
    {
        if(checkL1 && L1Esc >= L3Esc)
        {
            L1Status = false;
        }
        if(checkL2 && L2Esc >= L3Esc )
        {
            L2Status = false;
        }
        if(checkL4 && L4Esc <= L3Esc)
        {
            L4Status = false;
        }
        if(L1Status && L2Status && L3Status && L4Status)
        {
            hideErrMsgSpan("errorMsg3");//NO I18N
        }
    }
    if(checkL4)
    {
        if(checkL1 && L1Esc >= L4Esc)
        {
            L1Status = false;
        }
        if(checkL2 && L2Esc >= L4Esc )
        {
            L2Status = false;
        }
        if(checkL3 && L3Esc >= L4Esc)
        {
            L3Status = false;
        }
        if(L1Status && L2Status && L3Status && L4Status)
        {
            hideErrMsgSpan("errorMsg4");//NO I18N
        }
    }

}
//SLA time esc check ended

//Validations for OLA Group Name and its Time
function validateAndSetOLAValues(){
    var olaDetails = {};
    var set = 1;
    var groupSet = [];//Used to find same group names multiple times
    var validOLA = true;
    jQuery("#ola-section").find('div[data-id *= olasec_]').each(function(){
      var groupJson = {}
      var sectionId=jQuery(this).attr("data-id").split('_')[1];//OLA section Id

      var groupSelect2Data = jQuery("#groupNameSel_"+sectionId).select2("data");//No I18N
      groupSelect2Data.each(function (group) {
          if(groupSet.indexOf(group.text) > -1) {
            var groupName = new Array();
            groupName[0] = group.text;
            showalert('failure',getMessageForKey('multiple.group.alert',groupName),'isAutoHide=false,closeOnEscKey=yes,width=500,height=80');//No I18N
            validOLA = false;
          } else {
              groupSet.push(group.text);
          }
      });
      groupJson.groups = groupSelect2Data;
      if(groupJson.groups.length > 0){
          var res_day = 0, res_hour = 0, res_min = 0;
          if(jQuery('#olasec_'+sectionId+' #res_day').val() !== ""){
            res_day = parseInt(jQuery('#olasec_'+sectionId+' #res_day').val()); //No I18N
            if(parseInt(res_day) > 31){
                showalert('failure',getMessageForKey("sdp.requests.requestcost.errorDD"),'isAutoHide=false,closeOnEscKey=yes,width=500,height=80');//No I18N
                validOLA = false;
            }
          }
          if(jQuery('#olasec_'+sectionId+' #res_hour').val() !== ""){
            res_hour = parseInt(jQuery('#olasec_'+sectionId+' #res_hour').val()); //No I18N
            if(parseInt(res_hour) > 23){
                showalert('failure',getMessageForKey("sdp.requests.requestcost.errorHH"),'isAutoHide=false,closeOnEscKey=yes,width=500,height=80');//No I18N
                validOLA = false;
            }
          }
          if(jQuery('#olasec_'+sectionId+' #res_min').val() !== ""){
            res_min = parseInt(jQuery('#olasec_'+sectionId+' #res_min').val()); //No I18N
            if(parseInt(res_min) > 59){
                showalert('failure',getMessageForKey("sdp.requests.requestcost.errorMM"),'isAutoHide=false,closeOnEscKey=yes,width=500,height=80');//No I18N
                validOLA = false;
            }
          }
          var olaTime = parseInt(res_day * 24 * 60) + parseInt(res_hour * 60)+ parseInt(res_min);
          var resolutionTime = (parseInt(document.SLADefForm.dueByDays.value) * 24 * 60) + (parseInt(document.SLADefForm.dueByHours.value) * 60) + parseInt(document.SLADefForm.dueByMinutes.value);
          if((resolutionTime == 0 && olaTime > 0) || (olaTime > resolutionTime)){
            showalert('failure',getMessageForKey("invalid.ola.time"),'isAutoHide=false,closeOnEscKey=yes,width=500,height=80');//No I18N
            validOLA = false;
          }
          if(olaTime == 0){
            showalert('failure',getMessageForKey("ola.no.time.error"),'isAutoHide=false,closeOnEscKey=yes,width=500,height=80');//No I18N
            validOLA = false;
          }
          groupJson.days = res_day;
          groupJson.hours = res_hour;
          groupJson.minutes = res_min;
          groupJson.description = jQuery('#olasec_'+sectionId+' #olaDescription').val();
          olaDetails[set] =groupJson;
          set = set + 1;
        }
    });

    jQuery("#olaDetails").val(sdpToJSON(olaDetails));
    return validOLA;
}
