 /* $Id$ */
var WOListActions={
    scrollBarPosition: -1,
    init:function(requestListData){ //To initialize Request Listview
        if(sdp_user.USERTYPE==='Technician' && (!window.externalframe) || (window.externalframe && window.current_req_mode == "combined")){
            jQuery("#task-comb-view").show();
            taskcombinedViewObj.initCombinedView({
                isFilterEnabled : true,
                isColumnChooserEnabled : true,
                isSearchEnabled : true,
                isNavigationEnabled : true,
                isSortingEnabled : true,
                personalize_key: "taskview_sidebar", //NO I18N
                module: window.current_req_mode == "combined" ? "combined" :"", //NO I18N
                initHeight: jQuery('#header-placeholder').length == 0 ? (jQuery(window).height() - jQuery('#top-header').height() - 135) : (jQuery(window).height() - jQuery('#header-placeholder').height() - 135), //NO I18N
                from: "reqListView" //NO I18N
            });
            if (jQuery('#combined-task-view').parent().hasClass('hide-sidebar')) {
                taskcombinedViewObj.showTotalCount();
            }            
        }
        WOListActions.render(requestListData);
        requestAnimationFrame(function(){
            show_bs_menu();
            initTooltip('.listcontrols'); //NO I18N
        });
    },
    render:function(){
        if(window["cs_id"] && window["cs_enabled"]){
            requestListData["cs_id"] = window["cs_id"];
        }
        if(sdp_user.ROLES.indexOf("SDAdmin") !== -1 || sdp_user.ROLES.indexOf("HelpdeskConfig") !== -1){
            requestListData["is_admin"] = true;
        }
        if(sdp_user.ROLES.indexOf("CreateRequests") !== -1){
            requestListData["can_create_request"] = true;
        }
        requestListData.showback_homepage = false;
        if(window.externalframe) {
            requestListData.showback_homepage = true;
            requestListData.externalframe = true;
            /* Requet listview action enable in externalframe url */
            if(!requestListData.allowed_operations) {
                requestListData.allowed_operations = {};
            }
            /* Check permissions for request list view action */
            var operation = {
                "CreateRequests": true, //NO I18N
                "AddingRequestTasks": sdp_user.ROLES.indexOf('AddingRequestTasks') > -1, //NO I18N
                "DeletingRequestTasks": sdp_user.ROLES.indexOf('DeletingRequestTasks') > -1 //NO I18N
            }
            if(is_from == "dashboard" || is_from == "admin" || is_from == "merge" || is_from == "link_request") {
                operation["CreateRequests"] = false;
                requestListData.showback_homepage = false;
            }
            requestListData.allowed_operations = jQuery.extend({}, requestListData.allowed_operations, operation);
        }
        // Enable/Disable the filter
        requestListData.filterEnabled = true;
        //FIXME: Need to remove this hardcoding
        if($spa.getSearchParam("from") === "dashboard" || requestListData.input_data != null){ // No I18N
            requestListData.filterEnabled = false;
            requestListData.hideFilter = true;
        }
        requestListData.addIn = !!window.isAddin;
        var allowUnApprovedReq = window.isMSPOrSCP ? ( sdp_feature_status.is_unapproved_requester_enabled  ? requestListData.current_view.id != "UNAPPROVED" : true  ) : true ;  // No I18N
requestListData.allowUnApprovedReq = allowUnApprovedReq;
        var dlgContent=renderhbs("", "request-listview-header", requestListData, false, "requests", true, false, "",true);
        jQuery('#listcontrols').prepend(dlgContent);
        jQuery('#request-list').removeClass("hide");
        jQuery('#activeState-All-Requests').off('click').on('click', function (event) { //NO I18N
            activeState(event.currentTarget,'All_Requests');//NO I18N
        });
        jQuery('#activeState-Incident-Requests').off('click').on('click', function (event) { //NO I18N
            activeState(event.currentTarget,'Incident_Requests'); //NO I18N
        });
        jQuery('#activeState-Service-Requests').off('click').on('click', function (event) {//NO I18N
            activeState(event.currentTarget,'Service_Requests');//NO I18N
        });
        jQuery('#activeState-archive-req').off('click').on('click', function (event) {//NO I18N
            activeState(event.currentTarget,'archive_req');//NO I18N
        });
        jQuery('#activeState-TRASH').off('click').on('click', function (event) {//NO I18N
            activeState(event.currentTarget,'TRASH');//NO I18N
        });
        jQuery('#deleteFromTrash').off('click').on('click', function (event) {//NO I18N
            requestListViews.deleteFromTrash();
        });
        jQuery('#restoreFromTrash').off('click').on('click', function (event) {//NO I18N
            requestListViews.restoreTrashRequest();
        });
        jQuery('#lc-pickup').off('click').on('click', function (event) { //NO I18N
            jQuery("#lc-pickup").prop("disabled",true); // Disable the button after clicking  // No I18N
            WOListActions.pickupRequest();
        });
        jQuery('#assignMenu').off('click').on('click', function (event) { //NO I18N
            WOListActions.openTechnicianDropdown();
        });
        jQuery('#request-lv-bulkCloseRequest').off('click').on('click', function (event) {//NO I18N
            requestListViews.bulkCloseRequest();
        });
        jQuery('#request-lv-bulkEditRequests').off('click').on('click', function (event) {//NO I18N
            requestListViews.bulkEditRequests();
        });
        jQuery('#request-lv-mergeRequest').off('click').on('click', function (event) {//NO I18N
            requestListViews.mergeRequest(true);
        });
        jQuery('#request-lv-linkToRequest').off('click').on('click', function (event) {//NO I18N
            requestListViews.linkToRequest(true);
        });
        jQuery('#request-lv-linkToRequest-fromLink').off('click').on('click', function (event) {//NO I18N
            requestListViews.linkToRequest(true,requestListViews.from);
        });
        jQuery('#request-lv-demo-delete').off('click').on('click', function (event) {//NO I18N
            disableForDemo(); return false;
        });
        jQuery('#request-lv-delete').off('click').on('click', function (event) {//NO I18N
            requestListViews.bulkOrSingleDelete();
        });

        jQuery('#add-req-cont').off('click').on('click', function (event) {//NO I18N
            requestListViews.openAjaxForm();
        });
        jQuery('#UniAddNewTask').off('click').on('click', function (event) {//NO I18N
                    $tasks.loadTasks('form','general'); //NO I18N
                });
                jQuery('#bulkDeleteTask').off('click').on('click', function (event) {//NO I18N
                    requestListViews.deleteTask('',true);
                });
        if(window.isMSPOrSCP) {
            jQuery('#rlv-activestate-unapproved').off('click').on('click', function (event) { //NO I18N
                activeState(this,'UNAPPROVED'); //NO I18N
            });
            jQuery('#rlv-print-job-sheet').off('click').on('click', function (event) { //NO I18N
                printJobsheet();
            });
        }

        jQuery(".columnEditButton" ).addClass("hide");//No I18N
        /*For Assign Technician Select2 construct - start*/
        jQuery('select#technician').width('200px');   //No I18N
        if(jQuery("#techavailEnabled").val() == "true"){
            jQuery('select#technician').select2({
                placeholder : getMessageForKey('sdp.requests.common.select.technician'), //No I18N
                formatNoMatches: getMessageForKey('ae.select2.no.message'), //No I18N
                formatResult: formatResult,
                formatSelection: formatResult,
                escapeMarkup: function(m) { return m; }
            });
            filterbyOnline("select#technician");//No I18N
        }else{
            jQuery('select#technician').select2({
                placeholder : getMessageForKey('sdp.requests.common.select.technician'), //No I18N
                formatNoMatches: getMessageForKey('ae.select2.no.message'), //No I18N
                escapeMarkup: function(m) { return m; }
            });
        }
        jQuery("#technician").on('change', function () {
            var selected_technician = jQuery(this).val();
            WOListActions.assignRequests(selected_technician);
        }).on('select2-close',function(){
            jQuery(".assign-menu-cnt").removeClass('open');
        });
        /*For Assign Technician Select2 construct - End*/
        jQuery('#TaskGroupTechLayer').remove();
    },
    changeListViewFilter:function(globalViewName){
        jQuery('#' + globalViewName + '_Label').prop('checked', true);//No I18N
        /** personalize the globalview for classic view */
        var perObj = sdp_user.CLIENT_CONF.requestlistview ? sdp_user.CLIENT_CONF.requestlistview : {} ;
        perObj.global_view_name = globalViewName;
        sdp_user.CLIENT_CONF.requestlistview ? sdp_user.CLIENT_CONF.requestlistview.global_view_name = globalViewName : undefined;
        addPersonalization("requestlistview", perObj); //No I18N
        var viewID = requestListViews.filter_by && requestListViews.filter_by.id ? "viewID="+requestListViews.filter_by.id : "viewName="+requestListViews.filter_by.name; //No I18N
        var listViewUrl='/WOListView.do?'+viewID+'&globalViewName='+globalViewName; //No I18N
        if(listviewFrom && listviewFrom!=''){listViewUrl=listViewUrl+'&from='+listviewFrom;}
        sdpAjaxUrlHandler(listViewUrl);
    },
    changeListView:function(viewName){
        if(viewName=='archive_req'){
            location.href='/SDArchiveWOListView.do?mode=getWindow';//No I18N
            return;
        }
        var url = '/WOListView.do?viewName='+viewName+'&globalViewName='+requestListData.global_view_name;//No I18N
        if(viewName !=='TRASH' && (!window.isMSPOrSCP || !(window.sdp_feature_status && window.sdp_feature_status.is_unapproved_requester_enabled) || viewName !=='UNAPPROVED')){
            // viewName !=='UNAPPROVED' condition checked only for MSP/SCP
            url = url +'&requestViewChanged=true';//No I18N
        }
        sdpAjaxUrlHandler(url);
    },
    closeRequests:function(){
        if(requestListData.is_close_comment_mandatory){
            checkCloseAccept(document.getElementById('ReqListForm'),'checkbox');//No I18N
        }
        else{
            this.checkWOSelection(document.getElementById('ReqListForm'),'checkbox','reqOperation=Close&');//No I18N
        }
    },
    bulkEditRequests:function(){
        validateWOBulkEdit(document.getElementById('ReqListForm'),'checkbox',requestListData.service_requests_ids,requestListData.global_view_name);//No I18N
    },

    //checkcmn return true /false if true means the status comments are mandated and comments are checked.
    submitCloseAccepted:function(form, additionalParams,checkcmnt) {
        jQuery("[name=CloseAccept]").prop("disabled",true);  // No I18N
        var closureComment = (form.requestclosurecomment.value == "null" || form.requestclosurecomment.value == "")  ? null : form.requestclosurecomment.value; //No I18N
        var reqCloseComment=(form.closeComment.value == "null" || form.closeComment.value == "") ? null : form.closeComment.value; //No I18N
        var isCloseAccepted=false;
        if(form.closeAccepted.value == 'true'){
            isCloseAccepted=true;
        }
        var closureCode=(form.closurecode.value == "null" || form.closurecode.value == "") ? null : {"id": form.closurecode.value}; //No I18N

        //Validation to handle close comment mandatory
        if(checkcmnt==true){
          if(closureComment!=null && trim(closureComment.value)==""){
              alert(getMessageForKey("sdp.request.statuschange.close.addcomment"));
              form.requestclosurecomment.focus();
              return;
          }
          else if(closureComment==null && reqCloseComment!=null && trim(reqCloseComment.value)=="" ){
              alert(getMessageForKey("sdp.request.statuschange.close.addcomment"));
              reqCloseComment.focus();
              return;
          }
        }

        var closureInfo={"request":{"status":{"id":closedStatusID},"closure_info":{"requester_ack_resolution":isCloseAccepted,"requester_ack_comments":reqCloseComment,"closure_code":closureCode,"closure_comments":closureComment}}}; //No I18N
        requestListViews.closeRequests(closureInfo);
        return true;
    },
    openTechnicianDropdown : function(){
        setTimeout(function(){
            jQuery("#technician").select2("val", "");   //No I18N
            jQuery("#technician").select2("open"); //NO I18N
        },1);
    },
    closeStatusPopup : function(clsBtn){
        jQuery(clsBtn).parents('.inline-edit').find("[name='status']").select2("destroy");//NO I18N
        jQuery(clsBtn).parents('.inline-edit').addClass('hide').prev().removeClass('hide'); //NO I18N
    },
    closePriorityPopup : function(clsBtn){
        jQuery(clsBtn).parents('.inline-edit').find("[name='priority']").select2("destroy");//NO I18N
        jQuery(clsBtn).parents('.inline-edit').addClass('hide').prev().removeClass('hide'); //NO I18N
    },
    getFieldnameName: function(fieldname) {
        var data = {
            "priorities": getMessageForKey("sdp.itil.common.priority"),  // No I18N
            "group": getMessageForKey("common.group"),  // No I18N
            "categories": getMessageForKey("sdp.requests.common.category"),  // No I18N
            "statuses": getMessageForKey("sdp.requests.common.status")  // No I18N
        }
        return data[fieldname];
    },
    /**
    * A methos is used to show the color settings popup loader
    */
    showCSLoader:function(){
            jQuery("#cs-popup-cont").html('<div class="layer-box atp-box  freezelayerbg" style="background:rgba(255,255,255,0.5)"><div class="pos-rel" style="top:45%">'+ajaxBar()+'</div></div>');

    },
    /*
     * Method callback from child window
     */
    bulkEditUpdateHandler: function() {
        var tableObj = !requestListViews.isUnified ? table_comp_request : table_combined_task;
        tableObj.refreshTable("refresh"); //NO I18N
        msg = getMessageForKey("sdp.success") + " " + getMessageForKey("sdp.requests.editrequest.bulkeditsuccessmsg");  // NO I18N
        showalert("success", msg, 'isAutoHide=true'); // NO I18N
    },
    /**
     * Pickup Request
     */
     pickupRequest: function() {
        this.assignRequests(sdp_user.LOGGEDIN_USERID, true);
    },
    /**
     * Assign the request to the selected user
     * @param {Number} technician id of the selected tech
     * @param {boolean} isPickup is it a pickup request or assign request
     * */
    assignRequests: function(technicianID, isPickup) {
        var getTechName = function(technicianID) {
            try {
                if (!technicianID) {
                    return {
                        id: 0,
                        name: getMessageForKey("sdp.common.notassigned") // NO I18N
                    };
                } else {
                    var tech = {
                        id: technicianID,
                        name: techID_NameModel["list"][technicianID][1]
                    };
                }
                return tech;
            } catch (error) {}
        };
        jQuery(".page-progressbar").show(); //No I18N
        // get the all selected requests
        var currentViewData = {};
        var technician_to_assign = getTechName(technicianID);
        var tableObj = !requestListViews.isUnified ? table_comp_request : table_combined_task;
        var selectedRows = requestListViews.getSelectedRowValues();
        var selectedRequests = tableObj.bulkSelect.selectedRecords;
        // TASKID: 75871
        jQuery.each(selectedRequests, function(index, value) {
            if(requestListViews.isUnified){
                value = value.request;
            }
            currentViewData[index] = {
                subject: value.subject,
                technician_in_view: value.technician || getTechName(),
                technician_to_assign: technician_to_assign,
                technician_in_db: getTechName(),
                id: index
            };
        })

        var input_data = {
            list_info: {
                row_count: 100,
                search_criteria: [{
                    field: "id", // NO I18N
                    condition: "in", // NO I18N
                    values: selectedRows
                }],
                fields_required: ["technician"], // NO I18N
                sort_field: tableObj.t_obj.table_info.list_info.sort_field,
                sort_order: tableObj.t_obj.table_info.list_info.sort_order,
                start_index: 1
            }
        };
        var isDiff = function(view, db) {
            if (!view && !db) {
                return false;
            }
            if (!db && view.id == 0) {
                return false;
            }
            if (!db && view.id) {
                return true;
            }
            if (!view && db.id == 0) {
                return false;
            }
            if (!view && db.id) {
                return true;
            }
            if (view.id != db.id) {
                return true;
            } else {
                return false;
            }
        };
        sdpAjax({
            url: "/api/v3/requests", // NO I18N
            data: sdpAjaxInputData(input_data),
            success: function(res) {
                var requests = res.requests;
                var reqLen = requests.length;
                var diff = [];
                for (var index = 0; index < reqLen; index++) {
                    var element = requests[index];
                    if (element.technician) {
                        currentViewData[element.id].technician_in_db = element.technician;
                    }
                    if (isDiff(currentViewData[element.id].technician_in_view, currentViewData[element.id].technician_in_db)) {
                        diff.push(currentViewData[element.id]);
                    }
                }
                if (diff.length > 0) {
                    if (jQuery("#assign-tech-conflict").length === 0) { // NO I18N
                        jQuery("body").append('<div id="assign-tech-conflict" class="conflict-dialog"></div>'); // NO I18N
                    }
                    jQuery("#assign-tech-conflict").dialog({ // NO I18N
                        width: 1000,
                        modal: true,
                        height:  screen.height / 1.29955078861,
                        autoOpen: true,
                        closeonEscape: false,
                        draggable:false,
                        title: getMessageForKey("sdp.assign.conflict"), // NO I18N
                        open: function() {
                            jQuery(".ui-dialog-titlebar-close").hide(); // NO I18N
                            renderhbs("#assign-tech-conflict.ui-dialog-content", "tech-conflicts", { // NO I18N
                                rows: diff,
                                options: {
                                    isPickup: !!isPickup
                                }
                            },false,"requests");
                            jQuery("#tech-conflict-selectAll").off("click").on("click", function (event) { //No I18N
                                WOListActions.selectAll(event.currentTarget);
                            });
                            jQuery("#tech-conflict-pickup").off("click").on("click", function (event) { //No I18N
                                WOListActions.assignTechConflict(true);
                            });
                            jQuery("#tech-conflict-assign").off("click").on("click", function (event) { //No I18N
                                WOListActions.assignTechConflict();
                            });
                            jQuery("#tech-conflict-close").off("click").on("click", function (event) { //No I18N
                                WOListActions.cancelTechConflict();
                            });
                            jQuery("#assign-tech-conflict").dialog( "option", "closeOnEscape", false ); // NO I18N
                                // set height of container
                                var height = jQuery("#assign-tech-conflict").closest(".ui-dialog").height() - 70; // NO I18N
                                var factor = 0.8032520325;
                                var height_new = Math.round(height * factor);
                                jQuery("#assign-tech-conflict .tablelist ").height(height_new); // NO I18N
                        }
                    });
                } else {
                    if (isPickup) {
                        requestListViews.pickUpRequests();
                    } else {
                        requestListViews.assignRequests();
                    }
                }
            }
        });
    },
    selectAll: function(element) {
        var checked = element.checked;
        var table = jQuery(element).closest("table"); // NO I18N
        var rows = table.find('tbody input[type="checkbox"]'); // NO I18N
        rows.each(function(index, ele) {
            jQuery(ele).attr("checked", checked).prop("checked", checked); // NO I18N
        });
    },
    assignTechConflict: function(isPickup) {
        var rows = jQuery('#assign-tech-conflict table tbody input[type="checkbox"]:checked'); // NO I18N
        if (rows.length === 0) {
            showalert("warning", getMessageForKey("sdp.requests.listview.edit.choose"), "isAutoHide=true"); // NO I18N
        } else {
            if (isPickup) {
                requestListViews.pickUpRequests();
            } else {
                requestListViews.assignRequests();
            }
            setTimeout(function() {
                jQuery("#assign-tech-conflict").dialog("close"); // NO I18N
            }, 100);
        }
    },
    cancelTechConflict: function() {
        jQuery("#assign-tech-conflict").dialog("close");    // NO I18N
        var tableObj = !requestListViews.isUnified ? table_comp_request : table_combined_task;
        tableObj.refreshTable("refresh"); //NO I18N
    }
};


function activeState(elem,id){
    //jQuery(elem).addClass('act').siblings().removeClass('act');//NO I18N
    if (id=='archive_req' || id=='TRASH' || (window.isMSPOrSCP && window.sdp_feature_status && window.sdp_feature_status.is_unapproved_requester_enabled && id=='UNAPPROVED')) {
        WOListActions.changeListView(id);
    }
    else{
        WOListActions.changeListViewFilter(id);
    }
}

 function afterRequestListRender(uniq_id, row_count){
    jQuery(window).on('resize', function(){
        taskCompResize(uniq_id)
    });
    taskCompResize(uniq_id);
 }
 function taskCompResize(){
      var td_c_h = jQuery(window).height() - 205 - jQuery('#top-evalband').height();
    if(jQuery('#taskview-sidebar-list').height() !== td_c_h) {
        jQuery('#taskview-sidebar-list').css({'height':td_c_h-20+'px'}); //NO I18N
    }
}
 /**
  * Opens the spot search fields. 
  *
  * @param {DOMElement} sourceEl    The source invokeing this function.
   */
 function openReqSearch(sourceEl)
 {
    var uniqueId = DOMUtils.getParentWithAttr(sourceEl,"unique_id").getAttribute("unique_id");//No I18N
      var tblDOMModel = TableModel.getInstance(uniqueId);  
      var searchRow =DOMUtils.getChildElsWithAttr(DOMUtils.getParentWithAttr(sourceEl,"unique_id"),"table_el","SEARCHROW")[0];//No I18N
            
   var searchRowCombo = tblDOMModel.getNamedEl("SEARCHROWCOMBO");//No I18N
   searchRow.className = "searchRow";  
    if(searchRowCombo != undefined)
    {
        searchRowCombo.className = "searchRow";
    }
    if(tblDOMModel.getNamedEl("OSBTN")) {
        tblDOMModel.getNamedEl("OSBTN").className = "hide";
    }
    if(tblDOMModel.getNamedEl("CSBTN")) {
        tblDOMModel.getNamedEl("CSBTN").className = "tableSearchCloseButton";
    }
   var inputs = searchRow.getElementsByTagName("input");
   var formatSpan = searchRow.getElementsByTagName("span");
    //-------------------only for advanced search
    if(searchRowCombo!=undefined)
    {
        if(searchRowCombo.getElementsByTagName("select")!=null)
        {
            var searchInputsCombo = searchRowCombo.getElementsByTagName("select");
            for(var i = 0; i < inputs.length; i++)
            {
                if(searchInputsCombo[i]){
                    var opt = searchInputsCombo[i].getElementsByTagName("option");
                    var valComb;
                    for(var k = 0; k < opt.length; k++)
                    {
                        var isComboSelected = opt[k].selected;
                        if(isComboSelected)
                        {
                            valComb = opt[k].text;
                            if(valComb=="--------------"){
                                inputs[i].disabled=true;
                                formatSpan[i].style.visibility='hidden';
                            }
                        }
                    }
                }
            }
        }
    }
    inputs[0].focus();
 }
 /**
  * Closes the spot search fields and reloads the table with out the spot search
  * criteria. 
  *
  * @param {DOMElement} sourceEl    The source element invoking this function.
  */
 function closeReqSearch(sourceEl, id, url)
 {
   var uniqueId = DOMUtils.getParentWithAttr(sourceEl,"unique_id").getAttribute("unique_id");//No I18N
   var tblDOMModel = TableModel.getInstance(uniqueId);  
   var searchRow =DOMUtils.getChildElsWithAttr(DOMUtils.getParentWithAttr(sourceEl,"unique_id"),"table_el","SEARCHROW")[0];//No I18N
   
   var searchRowCombo = tblDOMModel.getNamedEl("SEARCHROWCOMBO");//No I18N
   if(tblDOMModel.getNamedEl("OSBTN")) {
      tblDOMModel.getNamedEl("OSBTN").className = "tableSearchCloseButton";
   }
   if(tblDOMModel.getNamedEl("CSBTN")) {
    tblDOMModel.getNamedEl("CSBTN").className = "hide";
   }

   var isValPresent = false;
   var inputs = searchRow.getElementsByTagName("input");
   var inputsCombo;
   var valueCombo;
   if(searchRowCombo != undefined)
   {
       inputsCombo = searchRowCombo.getElementsByTagName("select"); 
   }
   var size = inputs.length;
   for(var count = 0; count < size; count++)
   {
     var element = inputs[count];
     if(inputsCombo != undefined && !(count >= inputsCombo.length))
     {
        valueCombo = inputsCombo[count].value;
     }
     if(element.disabled || ((element.value != "")&& (element.value != null)))
     {
       element.value = "";
       isValPresent = true;
     }
   }
   if(isValPresent)
   {
       if(searchRowCombo == undefined)
       {
           if(RESTFUL == true)
           {
               fetchSpotSearchData(sourceEl, id, url);    
           }
           else
           {
               fetchSpotSearchData(sourceEl);
           }
       }
       else
       {
         uniqueId = getPortalViewName(uniqueId);
         updateStateAndUrlState(uniqueId, "SEARCH_COLUMN", "");//No I18N
         updateStateAndUrlState(uniqueId, "SEARCH_VALUE","");//No I18N
         updateStateAndUrlState(uniqueId, "SEARCHCOMBO_VALUE", "");//No I18N
         updateStateAndUrlState(uniqueId, "SEARCHVAL_COMB", "");//No I18N
         // fix for SD-IssueID : 73043
         var newVal = "&PORTALID=" + PORTALID;//HELPDESKID;//No I18N
         updateState(uniqueId,"_D_RP", newVal);//No I18N

         refreshSubView(uniqueId);
       }
   }
   else
   {
     searchRow.className = "hide";
     if(searchRowCombo != undefined)
    {
        searchRowCombo.className = "hide";
    }
     
   }
}

function handler(){
    jQuery('input[name=Priority]').remove();
    jQuery('input[name=WOID]').remove();
    jQuery('input[name=Title]').remove();
    jQuery('input[name=Requester]').remove();
    jQuery('input[name=Owner]').remove();
    jQuery('input[name=Status]').remove();
    jQuery('input[name=Site]').remove();
    jQuery('input[name=Group]').remove();
    jQuery("input[name='Created By']").remove();
    jQuery('input[name=Category]').remove();
    jQuery('input[name=Level]').remove();
    jQuery('input[name=Mode]').remove();
    jQuery('input[name=Urgency]').remove();
    jQuery('input[name=Impact]').remove();
    jQuery('input[name=RequestType]').remove();
    jQuery("input[name='Sub Category']").remove();
    jQuery('input[name=Item]').remove();
    jQuery('input[name=Department]').remove();
    jQuery('input[name=Service]').remove();
    jQuery('input[name=OnBehalfOf]').remove();
    jQuery('input[name=PROJECTID]').remove();
    jQuery('input[name=TOTAL_COST]').remove();
    jQuery("input[name^='UDF_']").remove();
    jQuery("input[name^='GUDF_']").remove();
    jQuery("#loadingMsg").remove();
    jQuery("#rowcount").remove();
    jQuery("#loadingMsg").remove();
    jQuery("#rowcount").remove();
 }
 window.WOHandler = handler;
function updateRequestTable(viewToRefreshEl) {
    var toReplaceViewId = viewToRefreshEl.getAttribute("unique_id");
    var currentEl = document.getElementById(toReplaceViewId + "_CT");
    if(!currentEl) {
        throw new Error("The corresponding html content for " + toReplaceViewId + " not present in parent window.");    //No I18N
    }
    jQuery('#'+toReplaceViewId + '_CT').children().remove();    //No I18N
    currentEl.parentNode.replaceChild(viewToRefreshEl,currentEl);
}
 /* Switching list view mode into table, classic and combined */
 function switchRequestView(current_view_mode) {
    /**
     * Remove all Alert Message before route Transition
     */
    jQuery("#alertbox").html(""); // NO I18N
    if(!jQuery("#cancel_translations").hasClass("hide")){
        closeTranslations();
    }
     var perObj = sdp_user.CLIENT_CONF.requestlistview ? sdp_user.CLIENT_CONF.requestlistview : {} ;
    perObj.previous_mode = window.current_req_mode;
    perObj.current_view_mode = current_view_mode;
    switch(current_view_mode){
        case "classic"://No I18N
            window.current_req_mode = "classic";//No I18N
        break;
        case "combined"://No I18N
            window.current_req_mode = "combined";//No I18N
            if(jQuery("[data-view='combined']").find(".newview").length > 0){
                perObj.isCombined_viewed = true;
            }
        break;
        case "table"://No I18N
            window.current_req_mode = "table"; //No I18N
        break;
         case "kanban"://No I18N
            window.current_req_mode = "kanban";  //No I18N
            //when changing kanban view from combined view  (low resolution screen), reset the unified check
            requestListViews && requestListViews.isUnified && (requestListViews.isUnified = false);
            break;
    }
    if(table_combined_task) { //SD-112572
        table_combined_task = null;
    }
    addPersonalization("requestlistview",perObj); //No I18N
    sdpAjaxUrlHandler("/WOListView.do") //No I18N
    tooltipFix(2000);
}
//This code should be removed after mickey client movement
jQuery(document).ready(function(){
    jQuery(document).on('click','#ArchiveRequestsView_CCBtn',function(){
        setTimeout(function(){
            if(window.location.pathname != '/WorkOrder.do'){//No I18N
                    jQuery('#_DIALOG_LAYER').addClass('temp-digpos');
            }
        },100);
    });
});
//This code should be removed after mickey client movement
