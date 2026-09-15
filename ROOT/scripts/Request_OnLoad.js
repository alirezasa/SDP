/* $Id$ */

// Used in Details View
var requestTabs = new Array('requestDetails', 'historyDetails', 'resolutionDetails', 'approvalDetails', 'taskDetails','assessDetails', 'dependencyDetails'); // No I18N

function subtab_click(){
     if ((jQuery("#resolutionDetails_tab").hasClass("subtabon")) & jQuery('.sdtab-content #ze_HTMLDesc_Focus').is(':visible') & (!jQuery(this).closest('ul').hasClass('nav-sdtabs')) & getResolnDescription() != "") {
            var r = confirm(getMessageForKey("sdp.requests.resolution.content.notsaved.alert"));// No I18N
            if (r == false) {
               e.preventDefault();
               e.stopPropagation();
            }
        } 
}
function changeRequestTab(selectedTab, params){
    subtab_click(); // to check resolution content is saved before navigation
    for(var i = 0; i < requestTabs.length; i++) {
            
        var tabName = requestTabs[i];
        if(document.getElementById(tabName + "_tab") != null) {
            if(tabName == selectedTab) {
         if(document.getElementById(tabName)){
                    document.getElementById(tabName).className = "show"; // No I18N
        }
                document.getElementById(tabName + "_tab").className = "subtabon"; // No I18N
            }
            else {
          //  alert(tabName);
         if(document.getElementById(tabName)){
                    document.getElementById(tabName).className = "hide"; // No I18N
        }
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

    // while doing inline update the parent["SITEID"] not updated.
    if( parent.jQuery('#SITEID_CUR')[0] && parent.jQuery('#SITEID_CUR').attr('val') != undefined ){

            parent["SITEID"] = parent.jQuery('#SITEID_CUR').attr('val');        // No I18N
    }

    if(selectedTab == "historyDetails") {
        jQuery('document').ready(function(){
            jQuery('#historyDetails').load('/common/ViewHistory.jsp?id='+ parent.WOID + '&module=requests');    //NO I18N
        });
    }
    if(selectedTab === "assessDetails") {
        window.WOFrame.location.href = "/WorkOrder.do?woMode=viewAssessmentHistory&woID=" + encodeURIComponent(parent.WOID); // No I18N
    }
    if(selectedTab == "resolutionDetails")
    {
        if(window.isMSPOrSCP) {
            //fix for msp #8942
            document.getElementById("taskDetails").innerHTML='';
        }

        var owner = document.getElementById('OWNERID').value;
        var url = "/AddResolution.do?mode=viewWOResolution&associatedEntity=request&associatedEntityID="+ encodeURIComponent(parent.WOID) +"&module=request&woID=" + encodeURIComponent(parent.WOID) + "&technicianID=" + encodeURIComponent(owner) +"&from=WOResolution&scopeid="+ encodeURIComponent(parent.SITEID); // No I18N
        if(params != null) {
            url = url + params;
            jQuery("#resolution_url").val(url);
        }
        if(parent["FromListView"] != null) {
            url = url + "&fromListView=true"; // No I18N
        }
        window.frames['WOFrame'].location.href = url; // No I18N
        jQuery('#attachfiles').addClass('hide');
    }
    if(selectedTab === "dependencyDetails") {
        var url = "/WODependencyDef.do?SubmitAction=getDependencyDetails&Module=request&AssociatedEntityId=" + encodeURIComponent(parent.WOID) +"&scopeid="+ encodeURIComponent(parent.SITEID); // No I18N
        if(params !== null && params !== 'undefined') { url = url + params; }
        window.frames.SDPHeaderFrame.location.href =  url;     //No I18N
    }
    if(parent["SHOWAPPTAB"] != null) {
        if(selectedTab == "approvalDetails") {
            //window.frames['WOFrame'].location.href = "/WorkOrder.do?woMode=viewWOApproval&woID=" + parent["WOID"]; // No I18N
        window.frames.SDPHeaderFrame.location.href = "/WorkOrder.do?woMode=viewWOApproval&woID=" + encodeURIComponent(parent.WOID); // No I18N
        }
    }
}

function threadshowhide(val) {
    window.name="main"; // No I18N
    var e=document.getElementsByTagName("div");
    var module = document.getElementsByName("tabName")[0].value; // No I18N
    for(var i=0;i<e.length;i++) {
        divID = e[i].id;
        ind = divID.indexOf("thread"); // No I18N
        if(e[i].id!=null && ind==0) {
            var bulletObj=MM_findObj("bullet"+e[i].id); // No I18N
            if(val!=null && val=='show') {
                e[i].style.display = 'block'; // No I18N
                bulletObj.src="/images/threadcollapse.gif"; // No I18N
            }
            else if(val!=null && val=='hide') {
                e[i].style.display = 'none'; // No I18N
                bulletObj.src="/images/threadexpand.gif"; // No I18N
            }
        }
    }
}

function callToSolutionsTab(ele,params,loggedin,reqStatusType,isSaveClicked){
    if(!isSaveClicked){
        if(!resolutiontab_click()) {
            return false;
        }
    }
    selectedTab = "resolutionDetails"; // No I18N
    var url="/workorder/requestResolution.jsp?woID="+parent.WOID+"&isDetailsPage=true&";// No I18N
    if(params){
        url = url+params+"&";   // No I18N
    }
    for(var i = 0; i < requestTabs.length; i++) {
        var tabName = requestTabs[i];
        if(document.getElementById(tabName + "_tab") != null) {
            if(tabName == selectedTab) {
                if(document.getElementById(tabName)){
                document.getElementById(tabName).className = "show"; // No I18N
                }
                document.getElementById(tabName + "_tab").className = "subtabon"; // No I18N
                }
            else {
                if(document.getElementById(tabName)){
                document.getElementById(tabName).className = "hide"; // No I18N
                }
               
                if(document.getElementById(tabName + "_tab").className.indexOf("hide") < 0) {
                document.getElementById(tabName + "_tab").className = "subtaboff"; // No I18N
                }
            }
        }
    }
    if( reqStatusType!=null && (reqStatusType == "Resolved" || reqStatusType == "Closed")) {
        url=url+"reqStatusClose=true";  // No I18N
    }
    jQuery("#resolutionDetails").load(url,function(){ // No I18N
        // Detect Page navigation 
        window.onbeforeunload = function() { 
                    if ((jQuery("#resolutionDetails_tab").hasClass("subtabon")) & jQuery('.sdtab-content #ze_HTMLDesc_Focus').is(':visible') & (!jQuery(this).closest('ul').hasClass('nav-sdtabs')) & getResolnDescription() != "") {
                        return "Changes are not saved"; // No I18N
                    }
                }
                onloadResolutionEvents(jQuery("#requestId").text(),getResolutionURL(params));
                jQuery('.nav-sdtabs li').on('click', function(e){// No I18N
                   if(jQuery('.sdtab-content #ze_HTMLDesc_Focus').is(':visible')  && getResolnDescription() != ""){
                       var rslt = confirm(getMessageForKey("sdp.requests.resolution.content.notsaved.alert"));// No I18N
                       if (rslt == false) {
                          e.preventDefault();
                       }else{
                        if(window.req_details) {
                            $req.prop.closure_info = {};
                        }
                        jQuery("#resolution_url").val(getResolutionURL());
                         jQuery("#sln_Obj").val("");
                         req_rsln.tabSwitching(this,loggedin);
                       }
                   }else{
                       req_rsln.tabSwitching(this,loggedin);
                   }
              });
              jQuery(".sugs-tabs").find('li[data-switch="'+ele+'"]').trigger('click');
            });

}

function getResolutionURL(params){
    var owner = document.getElementById('OWNERID').value;
    var url = "/AddResolution.do?mode=viewWOResolution&associatedEntity=request&associatedEntityID="+parent.WOID+"&module=request&woID=" + parent.WOID + "&technicianID=" + owner+"&from=WOResolution&scopeid="+parent.SITEID; // No I18N    
    if(params != null) {
        url = url + params;
    }
    if(parent.FromListView != null) {
        url = url + "&fromListView=true"; // No I18N
    }
    return url;
}
 
 function resolutiontab_click(){
    if(jQuery('.sdtab-content #ze_HTMLDesc_Focus').is(':visible')  && getResolnDescription() != ""){
        var rslt = confirm(getMessageForKey("sdp.requests.resolution.content.notsaved.alert"));// No I18N
        return rslt;
    }
 }

function getResolnDescription(){
    var string = "";
    if(parent.resolution_editor != undefined)
    {
        string  = parent.resolution_editor.getHTML();
    }
    string      = string.replace(/<br \/>/g,"\n"); // No I18N
    string      = string.replace(/<br>/g,"\n"); // No I18N
    string      = string.replace(/(<div[^>]+?>|<div>|<\/div>)/g, ""); // No I18N
    string      = string.replace(/(<p[^>]+?>|<p>|<\/p>)/g, ""); // No I18N
    //string    = string.replace(/(<([^>]+)>)/g,""); // No I18N
    string      = string.replace(/&lt;/g,"<"); // No I18N
    string      = string.replace(/&gt;/g,">"); // No I18N
    string      = string.replace(/&nbsp;/g,""); // No I18N
    string      = string.replace(/^\s*|\s*$/g, "");  // No I18N
    return string;
}
