/* $Id$ */
/**
 * this js file containing reports related functions
 * @author Murugesan K
 * @date 18-01-2008
 */



var criteriaID = 1;

var selectedChartType = -1;

var reportScheduler = "";

 jQuery(document).on("click.reportWizard", '[sdpJs="js-event-ReportWizard1-4"]', function (event) {
            showCalendar('preFromDate_tmp', false, '%Y-%m-%d');   //NO I18N
        });

        jQuery(document).on("click.reportWizard", '[sdpJs="js-event-ReportWizard1-5"]', function (event) {
            showCalendar('preToDate_tmp', false, '%Y-%m-%d');  //NO I18N
        });

function moveUpListRow(index, selectTag) {
    if ((index > 0) && (index < selectTag.length)) {
        var tmp = selectTag.options[index - 1].text;
        var val = selectTag.options[index - 1].value;
        selectTag[index - 1].text = selectTag[index].text;
        selectTag[index - 1].value = selectTag[index].value;
        selectTag[index].text = tmp;
        selectTag[index].value = val;
        selectTag[index].selected = false;
        selectTag[index - 1].selected = true;
    }
}

function multiMoveUp(from) {
    var selectTag = document.getElementById(from);
    var selectedList = new Array();
    var j = 0;
    for (i = 0; i < selectTag.length; i++) {
        if (selectTag.options[i].selected == true) {
            if (i == 0) break;
            if (i > 0) {
                selectedList[j] = i;
                j++;
            }
        }
    }
    for (j = 0; j < selectedList.length; j++) {
        moveUpListRow(selectedList[j], selectTag)
    }
}

function moveDownListRow(index, selectTag) {
    var max = selectTag.length
    var min = 0;
    if (index < max - 1 && index >= min) {
        var tmp = selectTag.options[index + 1].text;
        var val = selectTag.options[index + 1].value;
        selectTag.options[index + 1].text = selectTag.options[index].text;
        selectTag.options[index + 1].value = selectTag.options[index].value;
        selectTag.options[index].text = tmp;
        selectTag.options[index].value = val;
        selectTag.options[index].selected = false;
        selectTag.options[index + 1].selected = true;
    }
}

function multiMoveDown(from) {
    var selectTag = document.getElementById(from);
    var max = selectTag.length;
    var min = 0;
    var selectedList = new Array();
    var j = 0;
    for (i = 0; i < max; i++) {
        if (selectTag.options[i].selected == true) {
            selectedList[j] = i;
            j++;
        }
    }
    if (selectedList[j - 1] < max && selectedList[j - 1] >= min) {
        for (j = selectedList.length; j >= 0; j--) {
            moveDownListRow(selectedList[j], selectTag);
        }
    }
}

function setDateFilterStatus(selectTag) {
    if (selectTag.value == -1) {
        document.reportfilter.preDateFilterType[0].disabled = true;
        document.reportfilter.preDateFilterType[1].disabled = true;
        document.reportfilter.dateFilterType.disabled = true;
    } else {
        document.reportfilter.preDateFilterType[0].disabled = false;
        document.reportfilter.preDateFilterType[1].disabled = false;
        document.reportfilter.dateFilterType.disabled = false;
    }
}

var selecteUniqueId = null;
//var sortId = null;

function getSelectedRowId() {
    return this.selecteUniqueId;
}

function getSelectedSortOrder() {
    return this.sortId;
}

function getCriteriaOperators(selectTag) {
    this.selecteUniqueId = selectTag.id.split("_")[2]; //No I18N
    this.sortId = selectTag.id.split("_")[0]; //No I18N
    if (selectTag.value == -1) {
        return false;
    }
    if (document.getElementById("sendRequest").value == 'true') {
        handleReportRequest("/CIHistoryReportHandler.do", "module=get_criteria_operator&column_id=" + selectTag.value, 'get_criteria_operator'); //NO I18N
    } else {
        handleReportRequest("/CustomReportHandler.do", "module=get_criteria_operator&column_id=" + selectTag.value, 'get_criteria_operator'); //No I18N
    }
}

function getAbsDate() {
    handleReportRequest("/CustomReportHandler.do", "module=get_abs_date&filter_id=" + document.reportfilter.dateFilterType.value, 'getabsdate'); //No I18N
}

function handleSuccessRequest(requestObj, action) {
    if (action == 'getabsdate') {
        var dates = requestObj.responseText.split("#"); //No I18N
        document.reportfilter.preFromDate_tmp.value = dates[0];
        document.reportfilter.preToDate_tmp.value = dates[1].trim();

    } else if (action == 'get_criteria_operator') { // no i18n
        var criObj = requestObj.responseXML.getElementsByTagName("ReportCriteria");
        var length = criObj.length;
        /* Remove all previous criteria(s) */
        var selectTag = document.getElementById('select_criteria_' + getSelectedRowId());
        removeAllOptionTags(selectTag);
        var optionSize = selectTag.options.length;
        for (i = 0; i < length; i++) {
            selectTag.options[optionSize + i] = new Option(criObj[i].getAttribute("criteria_name"), criObj[i].getAttribute("criteria_id"));
        }
        var criTypeObj = requestObj.responseXML.getElementsByTagName("ReportCriteriaType");
        setColumnDataType(criTypeObj[0].getAttribute("criteria_type"));

        /* Reset the previous column value */
        document.getElementById('criteriaValue_' + getSelectedRowId()).value = "";
    } else if (action == 'show_filter_page') { // no i18n
        var rcstep2 = document.getElementById('rcstep2');
        jQuery("#rcstep2").html(requestObj.responseText)
        storeAdvancedFilterId(jQuery("#filterRowId").attr("uniqueId"), 1000);
        if (document.reportfilter.preDateFilterType && document.reportfilter.preDateFilterType[0].checked == true) {
            getAbsDate();
        }
        if (document.reportfilter.dateFilterColumn && document.reportfilter.dateFilterColumn.value == -1) {
            document.reportfilter.preDateFilterType[0].disabled = true;
            document.reportfilter.preDateFilterType[1].disabled = true;
            document.reportfilter.dateFilterType.disabled = true;
        }
        //new Effect.BlindDown(rcstep2);
        rcstep2.style.display = 'block'; //No I18N
        setTimeout(function() { callDateDefaultEventfn();
        }, 200);

    } else if (action == 'show_grouping_page') { //no i18n
        var rcstep3 = document.getElementById('rcstep3');
        rcstep3.style.display = 'block'; //No I18N
        jQuery("#rcstep3").html(requestObj.responseText);
    } else if (action == 'show_summary_page') { //no i18n
        var rcstep4 = document.getElementById('rcstep4');
        rcstep4.innerHTML = requestObj.responseText;

        //new Effect.BlindDown(rcstep4);
        rcstep4.style.display = 'block'; //No I18N
        //document.getElementById('rcstep5').style.display = 'none';
    }
    else if( action == 'show_report_page'  || action == 'page_navigation')
    {
        if (document.getElementById('report_input_pages') != undefined) {
            //This element will not be available if the user run the report from listview page
            jQuery('#report_input_pages').slideUp(1300);
            jQuery('#report_result').html(requestObj.responseText);
        } else {
            //This code will be called if the user run the report from list view
            jQuery('#reportlistviewpage').html(requestObj.responseText);
        }
        if (document.getElementById("centerstatus") != undefined) {
            hideDiv("centerstatus"); //No I18N
        }
        if(action == 'show_report_page'){
            parent.chartData = undefined;
        }
        parent.closeDialog();
    } else if (action == 'show_matrix_report_page') {  //no i18n
        hideDiv("centerstatus"); //No I18N
        jQuery('#report_input_pages').slideUp(1300);
        jQuery('#report_result').html(requestObj.responseText);
    } else if (action == 'show_graph_page') {  //no i18n
        var rcstep5 = document.getElementById('rcstep5');
        rcstep5.style.display = 'block'; //No I18N
        jQuery("#rcstep5").html(requestObj.responseText);
        restoreChartProperties();
    } else if (action == 'create_new_folder') { //no i18n
        if (requestObj.responseText != "NA") {
            var folder_name = document.getElementById("folder_name").value;
            var folder = document.getElementById("folderId");
            folder.options[folder.options.length] = new Option(folder_name, requestObj.responseText);
            folder.value = requestObj.responseText;
            var obj = document.getElementById('success_message');
            obj.style.display = 'block'; //No I18N
            obj = document.getElementById('error_message');
            obj.style.display = 'none'; //No I18N
        } else {
            var obj = document.getElementById('error_message');
            obj.style.display = 'block'; //No I18N
            obj = document.getElementById('success_message');
            obj.style.display = 'none'; //No I18N
        }
        document.getElementById("addfolder").style.display = "none"; //No I18N

    } else if (action == 'create_duplicate_report') { //no i18n
        var response = requestObj.responseText;
        if( response.indexOf('success') == 0 )
        {
            var reportId = response.split("_")[1];
            var saveReportButton = document.getElementById('savereportbutton');
            if(saveReportButton) {
                jQuery('#savereportbutton').off().on("click",function(event) { event.preventDefault(); scheduleReport(reportId); });
            saveReportButton.innerHTML = getMessageForKey("sdp.reports.schedule.button");
            saveReportButton.title = getMessageForKey("sdp.reports.schedule.buttontitle");
            }
        document.getElementById('reportStatus').innerHTML = '<font class="text-success"><b>' + getMessageForKey('sdp.report.creation.duplicate') + '</b></font>';//No I18N
        }
        else{
            document.getElementById('reportStatus').innerHTML = '<font color="#EE0000"><b>' + getMessageForKey('sdp.common.failed') + ' : ' + encodeHTML(requestObj.responseText) + '</b></font>'; //No I18N
        }
        setTimeout(function() {parent.closeDialog();},1500);
        }
        else if (action == 'save_summary_report_as') { //no i18n
        var response = requestObj.responseText;

        if (response.indexOf('success') == 0) {
            var reportId = response.split("_")[1];
            updateReportPageLinks(reportId, '/SummaryReportHandler.do');//No I18N
             jQuery("[id='printpreviewlink']").each(function(){
                jQuery(this).off().on("click",function(event){event.preventDefault(); print_view(reportId, 'SummaryReport');});
            })
            var saveReportButton = document.getElementById('savereportbutton');
            jQuery('#savereportbutton').off().on("click",function(event) { event.preventDefault(); scheduleReport(reportId); });
            saveReportButton.innerHTML = getMessageForKey("sdp.reports.schedule.button");
            saveReportButton.title = getMessageForKey("sdp.reports.schedule.buttontitle");
            document.getElementById('editReport').onclick = function(){editReport(reportId, 5);};

        } else {
            //SD-96489 : JS XSS issue
            document.getElementById('reportStatus').innerHTML = '<font color="#EE0000"><b>' + getMessageForKey('sdp.common.failed') + ' : ' + encodeHTML(requestObj.responseText) + '</b></font>'; //No I18N
        }
    }
    else if( action == 'save_ci_report_as' )
    {
        var response = requestObj.responseText;

        if( response.indexOf('success') == 0 )
        {
            var reportId = response.split("_")[1];//No I18N
            updateReportPageLinks(reportId, '/CustomReportHandler.do');//No I18N
             jQuery("[id='printpreviewlink']").each(function(){
                jQuery(this).off().on("click",function(event){event.preventDefault(); print_view(reportId, 'CIHistory');});
            })
            var saveReportButton = document.getElementById('savereportbutton');
            jQuery('#savereportbutton').off().on("click",function(event) { event.preventDefault(); scheduleAuditReport(reportId); });
            saveReportButton.innerHTML = getMessageForKey("sdp.reports.schedule.button");
            saveReportButton.title = getMessageForKey("sdp.reports.schedule.buttontitle");
            document.getElementById('editFreshCIReport').onclick =  function(){editCIHistoryReportFrmFldr(reportId);};
        }
        else {
            document.getElementById('reportStatus').innerHTML = '<font color="#EE0000"><b>' + getMessageForKey('sdp.common.failed') + ' : ' + encodeHTML(requestObj.responseText) + '</b></font>'; //No I18N
        }
    }
  else if (action == 'save_audit_report_as') { //no i18n
        var response = requestObj.responseText;

        if (response.indexOf('success') == 0) {
            var reportId = response.split("_")[1]; //No I18N
            updateReportPageLinks(reportId, '/CustomReportHandler.do');//No I18N
            //SD-94832 fix for audit report
            jQuery("[id='printpreviewlink']").each(function() {
                jQuery(this).off().on("click",function(event){event.preventDefault(); print_view(reportId, 'true');});
            })
            var saveReportButton = document.getElementById('savereportbutton');
            jQuery('#savereportbutton').off().on("click",function(event) { event.preventDefault(); scheduleAuditReport(reportId); });
            saveReportButton.innerHTML = getMessageForKey("sdp.reports.schedule.button");
            saveReportButton.title = getMessageForKey("sdp.reports.schedule.buttontitle");
            document.getElementById('editFreshAuditReport').onclick = function(){editAuditReport(reportId);};
        } else {
            //SD-96489 : JS XSS issue
            document.getElementById('reportStatus').innerHTML = '<font color="#EE0000"><b>' + getMessageForKey('sdp.common.failed') + ' : ' + encodeHTML(requestObj.responseText) + '</b></font>'; //No I18N
        }
    } else if (action == 'save_report_as') { //no i18n
        var response = requestObj.responseText.trim();
        if( response.indexOf('success') == 0 ){
            var reportId = response.split("_")[1];//No I18N
            var isAPISupported = response.split("_")[2];//No I18N
            if(isAPISupported == "true") {
                parent.previousConfig = JSON.parse(response.substring(response.indexOf("true_") + 5));
                updateReportPageLinks(reportId, '/CustomReportHandler.do',true);//No I18N
                document.getElementById('editReport').onclick = function(){editReport(reportId,"",true);};
                /* SD-133600 fix */
                /* Handled in updateReportPageLinks :: document.getElementById('sendmaillink').onclick = function(){sendMail(reportId,event,true);}; */
            } else {
                updateReportPageLinks(reportId, '/CustomReportHandler.do',false);//No I18N
                document.getElementById('editReport').onclick = function(){editReport(reportId,"",false);};
            }
            var saveReportButton = document.getElementById('savereportbutton');
            jQuery('#savereportbutton').off().on("click",function(event) { event.preventDefault(); scheduleReport(reportId); });
            saveReportButton.innerHTML = getMessageForKey("sdp.reports.schedule.button");
            saveReportButton.title = getMessageForKey("sdp.reports.schedule.buttontitle");
            } else {
            document.getElementById('reportStatus').innerHTML = '<font color="#EE0000"><b>' + getMessageForKey('sdp.common.failed') + ' : ' + encodeHTML(requestObj.responseText) + '</b></font>';
        }
    }
    else if( action == 'save_query_report_as' )
    {
        var response = requestObj.responseText;

        if( response.indexOf('success') == 0 )
        {
            var reportId = response.split("_")[1];//No I18N
            updateReportPageLinks(reportId, '/CustomReportHandler.do');//No I18N
            var saveReportButton = document.getElementById('savereportbutton');
            jQuery('#savereportbutton').off().on("click",function(event) { event.preventDefault(); scheduleReport(reportId); });
            saveReportButton.innerHTML = getMessageForKey("sdp.reports.schedule.button");
            saveReportButton.title = getMessageForKey("sdp.reports.schedule.buttontitle");
            document.getElementById('editReport').onclick = function(){editReport(reportId,2);};
        }
        else
        {
            document.getElementById('reportStatus').innerHTML = '<font color="#EE0000"><b>' + getMessageForKey('sdp.common.failed') + ' : ' + encodeHTML(requestObj.responseText) + '</b></font>';
        }
    }
    else if (action == 'get_folder_desc') { //no i18n
        var obj = document.getElementById("desc");
        obj.value = requestObj.responseText;
    } else if (action == 'update_custom_settings') { //no i18n
        parent.closeDialog();
        showalert('success',getMessageForKey("report.customsettings.successmessage"),'isAutoHide=true,closeOnEscKey=yes'); //No I18N
    } else if (action == 'delete_schedule_report') {} else if (action == 'send_mail') { //no i18n
        var response = requestObj.responseText;

        if (response.indexOf('success') == 0) {
            showalert('success',translate('sdp.report.mail.sent.info'),'isAutoHide=true,delay=2'); //No i18n
            jQuery(reportDialogDivId).sdp_zcomponent_dialog("close"); //No i18n
        } else {
            jQuery('#mailFormSubmit').prop('disabled', false); //No i18n
            jQuery('#rldcancelMail').prop('disabled', false); //No i18n
            jQuery('#alertbox').remove();
            //SD-96489 : JS XSS issue
            let error_message = '<strong>' + getMessageForKey('sdp.admin.testmail.outgoing.failed') + '</strong>'; //No i18n
            let error_responseText = encodeHTML(requestObj.responseText);
            if(error_responseText && trim(error_responseText) != "" && trim(error_responseText) != "null") {
                error_message += " " + error_responseText; //No i18n
            }
            showalert('failure',  error_message ,'isAutoHide=false') //No i18n
        }
        jQuery('#mailFormSubmit').attr('disabled', false);
    } else if (action == 'makeAsWidget') { //No I18N
        var response = requestObj.responseText;

        if (response.indexOf('success') == 0) {
            document.getElementById('widgetStatus').innerHTML = '<font class="text-success"><b>' + getMessageForKey('sdp.reports.customReport.widget.add.success') + '</b></font>'; //No I18N
            var widgetId = response.substring(response.indexOf(':') + 1);
            setTimeout(function() {parent.closeDialog();}, 1500);
            jQuery('#addwidgetlink').off();
            parent.document.getElementById('addwidgetlink').onclick = function() { editWidget(widgetId, jQuery('#report_id').val()); return false; };
            parent.document.getElementById('addwidgetlink').title = getMessageForKey('sdp.reports.customReport.editdashboard.settings');
            parent.document.getElementById('addwidgetlink').innerHTML = getMessageForKey('sdp.reports.customReport.editdashboard.settings');
        } else {
            //SD-96489 : JS XSS issue
            document.getElementById('widgetStatus').innerHTML = '<font color="#EE0000"><b>' + getMessageForKey('sdp.common.failed') + ' : ' + encodeHTML(requestObj.responseText) + '</b></font>';
        }
    } else if (action == 'updateWidgetSettings') { //No I18N
        var response = requestObj.responseText;
        if (response.indexOf('success') == 0) {
            document.getElementById('widgetStatus').innerHTML = '<font class="text-success"><b>' + getMessageForKey('sdp.reports.customReport.widget.update.success') + '</b></font>'; //No I18N
            setTimeout(function() {parent.closeDialog();}, 1500);
        } else {
            //SD-96489 : JS XSS issue
            document.getElementById('widgetStatus').innerHTML = '<font color="#EE0000"><b>' + getMessageForKey('sdp.common.failed') + ' : ' + encodeHTML(requestObj.responseText) + '</b></font>';
        }
    } else if (action == 'run_from_listview') { //no i18n
        hideDiv("centerstatus");
        jQuery('#reportlistviewpage').html(requestObj.responseText);
        parent.closeDialog();
        parent.chartData = undefined;
    }
    else if( action == 'edit_report_page' || action == 'edit_qreport' )
    {
        jQuery('#reportlistviewpage').html(requestObj.responseText);
    }
    else if( action == 'show_folder_details' || action == 'update_folder' || action == 'delete_folder'  )
    {
        if( action == 'show_folder_details' )
        {
            if(document.getElementById("centerstatus") != null)
            {
                hideDiv("centerstatus");//No I18N
            }
        }
        var errorDiv = jQuery(requestObj.responseText).find('#error').html();
        if (typeof errorDiv !== 'undefined') {
            showalert('failure', errorDiv, 'isAutoHide=false,closeOnEscKey=yes,width=600,height=80'); //No I18N
        }
         jQuery('#reportlistviewpage').html(requestObj.responseText);
    } else if (action == 'show_summary_filter_page') { //no i18n
        try {
            hideDiv("centerstatus"); //No I18N
        } catch (e) {}
         jQuery('#reportlistviewpage').html(requestObj.responseText);
        storeAdvancedFilterId(jQuery("#filterRowId").attr("uniqueId"), 1000);
        if (document.reportfilter.preDateFilterType && document.reportfilter.preDateFilterType[0].checked == true) {
            getAbsDate();
        }
        if (document.reportfilter.dateFilterColumn && document.reportfilter.dateFilterColumn.value == -1) {
            document.reportfilter.preDateFilterType[0].disabled = true;
            document.reportfilter.preDateFilterType[1].disabled = true;
            document.reportfilter.dateFilterType.disabled = true;
        }
        setTimeout(function() { callDateDefaultEventfn();
            }, 200);
    } else if (action == 'show_audit_main_page' || action == "ci_history_page") { //no i18n
        try { hideDiv("centerstatus"); } catch (e) {} //No I18N
         jQuery('#reportlistviewpage').html(requestObj.responseText);
        if (action == "ci_history_page") {
            storeAdvancedFilterId(jQuery("#filterRowId").attr("uniqueId"), 1000);
            initClickEventForCIHistoryPage();
        }
        getAbsDate();
        setTimeout(function() { callDateDefaultEventfn();
            /** Added during csp inline activity for audit page event binding */
            if(action == 'show_audit_main_page'){
                document.querySelector('[sdpJs="js-event-AuditReportMainPage-0"]') && document.querySelector('[sdpJs="js-event-AuditReportMainPage-0"]').addEventListener("click", function(event) { this.style.display="none"; });
                document.querySelector('[sdpJs="js-event-AuditReportMainPage-1"]') && document.querySelector('[sdpJs="js-event-AuditReportMainPage-1"]').addEventListener("click", function(event) { runAuditHistoryReport(null);return false; });//NO I18N
                document.querySelector('[sdpJs="js-event-AuditReportMainPage-2"]') && document.querySelector('[sdpJs="js-event-AuditReportMainPage-2"]').addEventListener("click", function(event) { window.open('/CustomReportHandler.do', '_parent',"noopener");return false; });//NO I18N
                document.querySelector('[sdpJs="js-event-AuditReportMainPage-3"]') && document.querySelector('[sdpJs="js-event-AuditReportMainPage-3"]').addEventListener("click", function(event) {setDateFilterStatus(this) });//NO I18N
                document.querySelector('[sdpJs="js-event-AuditReportMainPage-4"]') && document.querySelector('[sdpJs="js-event-AuditReportMainPage-4"]').addEventListener("change", function(event) { getAbsDate();return false; });//NO I18N
                document.querySelector('[sdpJs="js-event-AuditReportMainPage-5"]') && document.querySelector('[sdpJs="js-event-AuditReportMainPage-5"]').addEventListener("click", function(event) { setDateFilterStatus(this) });//NO I18N
                document.querySelector('[sdpJs="js-event-AuditReportMainPage-6"]') && document.querySelector('[sdpJs="js-event-AuditReportMainPage-6"]').addEventListener("click", function(event) { showCalendar('preFromDate_tmp',false,'%Y-%m-%d') });//NO I18N
                document.querySelector('[sdpJs="js-event-AuditReportMainPage-7"]') && document.querySelector('[sdpJs="js-event-AuditReportMainPage-7"]').addEventListener("click", function(event) { showCalendar('preToDate_tmp',false,'%Y-%m-%d') });//NO I18N
                document.querySelector('[sdpJs="js-event-AuditReportMainPage-8"]') && document.querySelector('[sdpJs="js-event-AuditReportMainPage-8"]').addEventListener("click", function(event) { runAuditHistoryReport(null);return false });//NO I18N
                document.querySelector('[sdpJs="js-event-AuditReportMainPage-9"]') && document.querySelector('[sdpJs="js-event-AuditReportMainPage-9"]').addEventListener("click", function(event) { window.open('/CustomReportHandler.do', '_parent',"noopener");return false; });//NO I18N
            }
            /**End */
        }, 200);
    } else if (action == 'save_schedule') { //no i18n
        window.showalert("success", translate("api.saved.success",[translate("sdp.reports.customReport.schedulereport")]), 'isAutoHide=true,delay=3');//NO I18N

        //Resetting schedule information...
        document.getElementById('reportName').value = ""; //No I18N
        document.getElementById('toEmailSearch').value = "";
        document.getElementById('subject').value = "";
        document.getElementById('ScheduleReportDesc').innerHTML = "";
        //for diverting the page to schedule home after saving the details...
        showScheduledReportListView();
    } else if (action == 'input_page' || action == 'start_page' || action == 'show_available_subreports' || action == 'billingreports') { //no i18n
        try { hideDiv("centerstatus"); } catch (e) {} //No I18N
        //document.getElementById('reportlistviewpage').innerHTML = requestObj.responseText;
        jQuery('#reportlistviewpage').html(requestObj.responseText);
        //Updating date columns - java.util.Date
        var reportTypeObj = document.getElementsByName('reportType');
        var reportTypeId = -1;
        for (var i = 0; i < reportTypeObj.length; i++) {
            if (reportTypeObj[i].checked) {
                reportTypeId = reportTypeObj[i].id;
            }
        }
        if (reportTypeId != -1) {
            getAvailableModules(reportTypeId);
        }
        setTimeout(function() { callDateDefaultEventfn(); }, 200);
    } else if (action == 'show_advmatrix_page') { //no i18n
        jQuery('#advanced').html(requestObj.responseText);
    } else if (action == 'show_simplematrix_page') { //no i18n
        jQuery('#simple').html(requestObj.responseText);
    } else if (action == 'show_query_editor') { //no i18n
         jQuery('#reportlistviewpage').html(requestObj.responseText);
    } else if (action == 'browse_sample_reports') //No i18N
    {
         jQuery('#reportlistviewpage').html(requestObj.responseText);
    } else if (action == 'get_sql_columns') { //no i18n
        var status = requestObj.responseXML.getElementsByTagName("status")[0].childNodes[0].nodeValue;
        if (status == 'success') {
            var sqlCols = requestObj.responseXML.getElementsByTagName("columns");
            var length = sqlCols.length;
            removeAllOptionTags(document.getElementById('QGroupBy'));
            //removeAllOptionTags(document.getElementById('qsum'));
            //removeAllOptionTags(document.getElementById('qmin'));
            //removeAllOptionTags(document.getElementById('qmax'));
            //removeAllOptionTags(document.getElementById('qavg'));
            //removeAllOptionTags(document.getElementById('qcount'));
            //removeAllOptionTags(document.CustomReportHandlerForm.chartType);
            var optionSize = document.getElementById('QGroupBy').options.length;

            for (i = 0; i < length; i++) {
                document.getElementById('QGroupBy').options[i + 1] = new Option(sqlCols[i].getAttribute('name'), sqlCols[i].getAttribute('index'));
                var data_type = sqlCols[i].getAttribute('type');
                /*
                if( data_type == 'java.lang.Long' || data_type == 'java.lang.Integer' || data_type ==
                   'java.lang.Double' || data_type == 'javax.lang.Memory' || data_type == 'java.sql.Time'  )
                {
                    document.getElementById('qsum').options[optionSize] = new Option(sqlCols[i].getAttribute('name'),sqlCols[i].getAttribute('index'));
                    document.getElementById('qmin').options[optionSize] = new Option(sqlCols[i].getAttribute('name'),sqlCols[i].getAttribute('index'));
                    document.getElementById('qmax').options[optionSize] = new Option(sqlCols[i].getAttribute('name'),sqlCols[i].getAttribute('index'));
                    document.getElementById('qavg').options[optionSize] = new Option(sqlCols[i].getAttribute('name'),sqlCols[i].getAttribute('index'));
                    document.getElementById('qcount').options[optionSize] = new Option(sqlCols[i].getAttribute('name'),sqlCols[i].getAttribute('index'));
                    optionSize++;
                }
                */
            }
            document.getElementById('errorlog').value = '';
        } else {
            document.getElementById('errorlog').value = status;
        }
    } else if (action == 'run_query_editor') { //no i18n
        document.getElementById("errorlog").value = '';
        //Clear the loading icon in SQL query editor page
        hideDiv("queryreportgenmsg"); //No I18N
        jQuery('#report_input_pages').slideUp(1300);
         jQuery('#report_result').html(requestObj.responseText);
    } else if (action == 'can_delete') { //no i18n
        var report_id = requestObj.responseText.trim();
        if (report_id != "-1") {
            if (confirm(document.getElementById("reportdelconfirm").innerHTML)) {
                handleReportRequest("/CustomReportHandler.do", "module=delete_report&report_id=" + report_id, 'delete_report'); //No I18N
            }
        } else {
            //alert(geti18nString( "sdp.reports.customreport.defreportdelmsg" ));
            alert(document.getElementById("defreportdelmsg").innerHTML);
        }

    } else if (action == 'delete_report') { //no i18n
        if (requestObj.responseText != 'false') {
            deleteRow(document.getElementById("report_" + requestObj.responseText.trim()));
        } else {
            alert(getMessageForKey('sdp.report.delete.error'));
        }
    } else if (action == 'get_available_module') { //no i18n
        var tmp = requestObj.responseText.trim();
        tmp = tmp.substring(1, tmp.length - 1);
        tmp = tmp.split(',');
        var len = tmp.length;
        var moduleObj = document.getElementsByName('moduleID');
        for (i = 0; i < moduleObj.length; i++) {
            moduleObj[i].disabled = false;
        }
        for (i = 0; i < moduleObj.length; i++) {
            bool = true;
            for (j = 0; j < len; j++) {
                if ("_" + trim(tmp[j]) == moduleObj[i].id) {
                    bool = false;
                    break;
                }
            }
            if (bool) {
                var id = document.getElementById(moduleObj[i].id);
                id.disabled = true;
            }
        }
        for (i = 0; i < moduleObj.length; i++) {
            if (moduleObj[i].disabled == false) {
                moduleObj[i].checked = true;
                break;
            }
        }

        jQuery('.submodule').parent().parent().hide();
        for (j = 0; j < len; j++) {
            jQuery('#subModule_' + trim(tmp[j])).parent().parent().show();
        }
    }else if(action == 'email_autocomplete'){//no i18n
        source = htmlDecode(requestObj.responseText.replace(new RegExp('</li><li>','g'), " ")).split(" ");
        jQuery( "#toEmailSearch" ).autocomplete({
               source: source,
               autoFocus:true,
            })
    } else if(action == 'hideReportInfoPanel'){//no i18n
        jQuery('#reportStabilityNote').hide();
    }
    if (isMSPOrSCP) {
        addMSPAccountCriteria(action);
    }
    //SD-82943
    if (action == 'run_from_listview' || action == 'show_report_page' || action == 'run_query_editor') {
        jQuery("html, body").animate({ scrollTop: 0 }, "slow"); //No I18N
    }
}

function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, "text/html");//no i18n
  return doc.documentElement.textContent;
}

function removeInnerHTML(elementId) {
    document.getElementById(elementId).innerHTML = "";
}

updateReportPageLinks = (reportId, url, isAPISupported) => {
    document.getElementById('reportStatus').innerHTML = '<font class="text-success"><b>' + getMessageForKey('sdp.report.customsettings.save.info') + '</b></font>';
    setTimeout(function() {parent.closeDialog();}, 1500);
    try {
        //Error ignored here, while running report from list view page the property name
        //'navReportName' will not be there
        document.getElementById('navReportName').innerHTML = encodeHTML(document.getElementById('reportName').value);
    } catch (e) {}
    document.getElementById('headerReportName').innerHTML = '<span class="fontBigBold">' + encodeHTML(document.getElementById('reportName').value) + '</span>'; //No I18N
    try {
        document.getElementById('savereportaslink').innerHTML = getMessageForKey('sdp.reports.customReport.savereportas');
        document.getElementById('savereportaslink').onclick = (event) => { openSaveReportAsWindow(event, reportId, isAPISupported); };
    } catch (e) { /*Error ignored for audit report*/ }
    try {
        jQuery("#sendmaillink").each(function() {
            jQuery(this).removeAttr("href").removeAttr("onclick").off("click").on("click", function(event) { //No i18n
                sendMail(reportId, event, isAPISupported);
            });
        });
    } catch (e) { /*Error ignored for summary and audit report*/ }
    //SD-94832: There are two element's with below mentioned id previously getElementById() is used to get and update elements..
    //getElementById() returns only one element i.e first element in DOM with that id hence bottom tab element's attribute are not
    //updated, Now its been changed so that both element will be updated.

    const reportLinks = [
        { id: 'printpreviewlink', value: null }, //No I18N
        { id: 'exporthtml',  value: 'HTML' }, //No I18N
        { id: 'exportpdf',  value: 'PDF' }, //No I18N
        { id: 'exportxls',  value:  'XLS'}, //No I18N
        { id: 'exportxlsx',  value:  'XLSX'}, //No I18N
        { id: 'exportcsv',  value:  'CSV'}, //No I18N
        { id: 'exportxml',  value:  'XML'}, //No I18N
        { id: 'exportdoc',  value: 'DOC'}, //No I18N
        { id: 'exportdocx', value: 'DOCX'}, //No I18N
    ];

    /* SD-111783 - while clicking on exports redirects to home page. */
    reportLinks.forEach((reportLink) => {
        const $elems = jQuery('[id='+reportLink.id+']');
        if ($elems && $elems.length > 0) {
            $elems.each(function () {
                if(reportLink.id =='printpreviewlink'){
                jQuery(this).off().on("click",function(event){event.preventDefault(); print_view(reportId, null,isAPISupported);});
                }
                else{
                jQuery(this).off().on("click",function(event){ event.preventDefault(); exportReport(url, reportLink.value, reportId, isAPISupported);});
                }
            });
            return false;
        }
    });
}

function changeImage(reportTypeId) {
    if (reportTypeId == 3) {
        showDiv('summary'); //No I18N
        hideDiv('tabular'); //No I18N
        hideDiv('matrix'); //No I18N
    } else if (reportTypeId == 1) {
        hideDiv('summary'); //No I18N
        showDiv('tabular'); //No I18N
        hideDiv('matrix'); //No I18N
    } else if (reportTypeId == 2) {
        hideDiv('summary'); //No I18N
        hideDiv('tabular'); //No I18N
        showDiv('matrix'); //No I18N
    } else if (reportTypeId == 5) {
        hideDiv('summary'); //No I18N
        hideDiv('tabular'); //No I18N
        hideDiv('matrix'); //No I18N
    }
}

function showDiv(id) {
    var id = document.getElementById(id);
    if (id != null) {
        id.style.display = 'block'; //No I18N
    }
}

function hideDiv(id) {
    var id = document.getElementById(id);
    id.style.display = 'none'; //No I18N
}



function restoreChartProperties() {
    var chartType = this.selectedChartType;

    //Restoring chart details
    if (chartType != -1) {
        document.chart_types.chartType.value = chartType;
        changeChartType(document.chart_types.chartType);

        if( chartType == 1 || (chartType >= 14 && chartType <= 17) )
        {
            document.chart_types.pieChartGroupColumn.value = this.pieChartGroupColumn;
            document.chart_types.pieChartDisplayFormat.value = this.pieChartDisplayFormat;
        }
        else if( chartType == 4 || chartType == 6 || chartType == 18)
        {
            document.chart_types.barXGroup1.value = this.barXGroup1;
            if(chartType == 6){
            document.chart_types.barXGroup2.value = this.barXGroup2;
            }
            document.chart_types.barChartBy.value = this.barChartBy;
        }
        else if( chartType == 10  || chartType == 13 || chartType == 19 || chartType == 20 )
        {
            document.chart_types.lineXDate.value = this.lineXDate;
            document.chart_types.lineXDateFormat.value = this.lineXDateFormat;
            document.chart_types.lineXGroup.value = this.lineXGroup;
        } else if (chartType == 11) {
            document.chart_types.timeXDate.value = this.timeXDate;
            document.chart_types.timeXGroup.value = this.timeXGroup;
            document.chart_types.timeYCountColumn.value = this.timeYCountColumn;
            document.chart_types.timeXDateFormat.value = this.timeXDateFormat;
        } else if (chartType == 12) {
            document.chart_types.areaXDate.value = this.areaXDate;
            document.chart_types.areaXGroup.value = this.areaXGroup;
            document.chart_types.areaXDateFormat.value = this.areaXDateFormat;
        }
    } else {
        //Report chart all default column should be group column
        var group_column = -1;
        if (document.group_columns != undefined && document.group_columns.groupTabularColumn != null) {
            group_column = document.group_columns.groupTabularColumn.value;
        }
        if (group_column != -1){
            if (document.chart_types.areaXGroup.value == -1) {
            document.chart_types.areaXGroup.value = group_column;
            } else if (document.chart_types.timeXGroup.value == -1) {
            document.chart_types.timeXGroup.value = group_column;
            } else if (document.chart_types.lineXGroup.value == -1) {
            document.chart_types.lineXGroup.value = group_column;
            } else if (document.chart_types.barXGroup1.value == -1) {
            document.chart_types.barXGroup1.value = group_column;
            } else if (document.chart_types.pieChartGroupColumn.value == -1) {
            document.chart_types.pieChartGroupColumn.value = group_column;
        }
    }
}
    if(jQuery("#chartTypeId").val() == 17){
        jQuery('[name="pieChartDisplayFormat"]').children('option[value="2"]').attr('disabled','disabled');
    }
}

function changeChartType(obj) {
    for (i = 1; i <= 6; i++) {
        chart = document.getElementById("chart" + i);
        if (chart != null) {
            chart.style.display = 'none'; //No I18N
        }
    }

    chart = document.getElementById("chart21");
    if (chart != null) {
        chart.style.display = 'none'; //No I18N
    }

    var graph_image = document.getElementById("graph_image");
    var i = 0;
    if( obj.value == 1 || (obj.value >= 14 && obj.value <= 17) )
    {
        i = 1;
        if (obj.value == 1)
            graph_image.src = "images/reports/PieChart.svg";//No I18N
        else if (obj.value == 14)
            graph_image.src = "images/reports/RingChart.svg";//No I18N
        else if( obj.value == 15 )
            graph_image.src = "images/reports/Funnelchart.svg";//No I18N
        else if( obj.value == 16 )
            graph_image.src = "images/reports/PyramidChart.svg";//No I18N
        else if( obj.value == 17 ){
            graph_image.src = "images/reports/WebChart.svg";//No I18N
            jQuery("[name='pieChartDisplayFormat']>option:eq(0)").prop('selected', true);//no i18n
        }
    }
    else if( obj.value == 4 || obj.value == 6 || obj.value == 18)
    {
        if (obj.value == 4)
            graph_image.src = "images/reports/BarChart.svg";//No I18N
        else if (obj.value == 6)
            graph_image.src = "images/reports/StackbarChart.svg";//No I18N
        else if( obj.value == 18 )
            graph_image.src = "images/reports/ScatterdPlotChart.svg";//No I18N
        i = 2;
    }
    else if( obj.value == 10 || obj.value == 13 || obj.value == 19 || obj.value == 20 )
    {
        i = 3;
        if(obj.value == 10)
            graph_image.src = "images/reports/LineChart.svg";//No I18N
        else if(obj.value == 13)
            graph_image.src = "images/reports/StepChart.svg";//No I18N
        else if(obj.value == 19)
            graph_image.src = "images/reports/SunburstChart.svg";//No I18N
        else if(obj.value == 20)
            graph_image.src = "images/reports/PackedBubbbleChart.svg";//No I18N
    }
    else if( obj.value == 11 )
    {
        i = 4;
        graph_image.src = "images/reports/TimeSeriesChart.svg";//No I18N
    }
    else if( obj.value == 12 )
    {
        i = 5;
        graph_image.src = "images/reports/AreaChart.svg";//No I18N
    }else
    {
        graph_image.src = "images/chart_none_big.gif"; //No I18N
        return;
    }
    chart = document.getElementById("chart" + i);
    if (chart != null) {
        chart.style.display = 'block'; //No I18N
        /**
         *SD - 64324: Editing chart as bar chart from stacked bar chart generate bar chart in the wrong format
         *The barxGroup2 value is not reset while changing the chart type to bar chart from stacked bar chart
         *hence the barxgroup2 value will be sent to the server and the chart was wrongly generated.
         **/
        if (obj.value == 4 || obj.value == 5) {
            document.getElementById("barXGroup2").value = "-1";
        }
    }
    if (obj.value == 6 || obj.value == 7) {
        chart = document.getElementById("chart" + i + "1");
        if (chart != null) {
            chart.style.display = 'block'; //No I18N
        }
    }
    if(obj.value == 17){
        jQuery('[name="pieChartDisplayFormat"]').children('option[value="2"]').attr('disabled','disabled');
    }else {
        jQuery('[name="pieChartDisplayFormat"]').children('option[value="2"]').removeAttr('disabled');
}
}

var dataType = null;

function setColumnDataType(dataType) {
    this.dataType = dataType;
}

function showDataPicker(inputObj, e, sortOrder) {
    var uniqueRowId = -1;
    if (inputObj.id.indexOf("criteriaValue") >= 0) {
        uniqueRowId = inputObj.id.split("_")[1]; //No I18N
    } else if (inputObj.id.indexOf("button") >= 0) {
        uniqueRowId = inputObj.id.split("_")[1]; //No I18N
    }

    var col_id = document.getElementById(sortOrder + '_filterColumn_' + uniqueRowId).value;
    var cri_value = document.getElementById('select_criteria_' + uniqueRowId).value;
    if (col_id != -1 && cri_value != -1) {
        showURLInDialog('/CustomReportHandler.do?module=datapicker&column_id=' + col_id + "&row_index=" + uniqueRowId, 'closeButton=yes,width=350,title=' + getMessageForKey("sdp.reports.customReport.selectcoldata")); //No I18N
    } else {
        alert(getMessageForKey("sdp.reports.customReport.selectcolncriteria"));
        return false;
    }
}

function removeAllOptionTags(selectTagObj) {
    var length = selectTagObj.options.length;
    for (i = 1; i < length; i++) {
        selectTagObj.options[i] = null;
    }
    selectTagObj.options.length = 1;
}

var reportErrorAlertVisible = false;

function handleFailureRequest(requestObj, action) {
    if (jQuery('#canceltabularreport')[0] != undefined) {
        jQuery('#canceltabularreport').prop('disabled', false); //No I18N
    }
    if (jQuery('#cancelmatrixreport')[0] != undefined) {
        jQuery('#cancelmatrixreport').prop('disabled', false); //No I18N
    }
    if (jQuery('#exitauditreportheader')[0] != undefined) {
        jQuery('#exitauditreportheader').prop('disabled', false); //No I18N
    }
    if (jQuery('#exitcihistoryreportheader')[0] != undefined) {
        jQuery('#exitcihistoryreportheader').prop('disabled', false); //No I18N
    }
    if (jQuery('#exitcihistoryreportfooter')[0] != undefined) {
        jQuery('#exitcihistoryreportfooter').prop('disabled', false); //No I18N
    }
    if (jQuery('#exitsummaryreportfooter')[0] != undefined) {
        jQuery('#exitsummaryreportfooter').prop('disabled', false); //No I18N
    }
    if (jQuery('#exitsummaryreportheader')[0] != undefined) {
        jQuery('#exitsummaryreportheader').prop('disabled', false); //No I18N
    }
    if (jQuery('#cancelqueryreport')[0] != undefined) {
        jQuery('#cancelqueryreport').prop('disabled', false); //No I18N
    }
	//changes for report stability - start
	if(requestObj.responseText.startsWith("AlertUser: ")) {//No I18N
		//hide query editor loading image
		if( document.getElementById("queryreportgenmsg") != undefined ) {//No I18N
			hideDiv("queryreportgenmsg");//No I18N
		}
		//hide list-view/custom-report-page loading image
		if( document.getElementById("centerstatus") != undefined ) {//No I18N
			hideDiv("centerstatus");//No I18N
		}
		//hide show report page navigation loading image
		if( document.getElementById("reportnavigationload") != undefined ) {//No I18N
			hideDiv("reportnavigationload");//No I18N
		}
		//show dialog
        //SD-96489 : JS XSS issue
        document.getElementById("reportErrorDialogText").innerHTML = encodeHTML(requestObj.responseText.substring("AlertUser: ".length)); //No I18N
		showDialog(document.getElementById("reportErrorDialog").innerHTML, "modal=yes, closeButton=no, title=\'" + getMessageForKey("sdp.reports.reportUsage") + "\'"); //No I18N
		reportErrorAlertVisible = true;
        document.querySelectorAll('.report_dialog_12').forEach(function(element){element.addEventListener('click', function() {closeDialog(); reportErrorAlertVisible = false;})});//No I18N
		return;
	}
	//changes for report stability - end

    if (action == 'run_query_editor') {
        //SD-96489 : JS XSS issue
        try {
            document.getElementById("errorlog").innerHTML = encodeHTML(requestObj.responseText);
        } catch (e) {
            document.getElementById("errorlog").innerHTML = encodeHTML(requestObj.responseText);
        }
        hideDiv("queryreportgenmsg"); //No I18N
    } else if (action == 'run_from_listview' || action == 'show_report_page') { //no i18n
        my_window = window.open("", "mywindow1", "status=1,scrollbars=1,width=1100,height=450");
        my_window.document.write(requestObj.responseText);
        my_window.moveTo(100, 150);
    } else {
        showDialog(requestObj.responseText, 'closeButton=yes,position=absmiddle,width=600,height=300,left=250,top=150'); //No I18N
    }

    if (action == 'show_report_page') {
        if (document.getElementById("centerstatus") != undefined) {
            hideDiv("centerstatus"); //No I18N
        }
        if (document.getElementById("report_result") != undefined) {
            document.getElementById('report_result').innerHTML = ""; //No I18N
        }
    }
    if (document.getElementById("centerstatus") != undefined) {
        hideDiv("centerstatus"); //No I18N
    }
}

function validateDateFormat(obj) {
    var objRegExp = /[befgijnpqruvwxABCDFIJLNOPQRSTUVWXY()*^%$#@!`~_=+}{|;?[]/;

    if (objRegExp.test(obj.value)) {
        alert(getMessageForKey('sdp.report.invaliddate.error'));
        obj.focus();
        return false;
    }
    return true;
}

function updateCustomSettings(defaultColumnAliasLength) {
    if (!validateDateFormat(document.getElementsByName('dateFormat')[0]) || trim(document.getElementsByName('dateFormat')[0].value) == "") return false;
    if (!validate(document.getElementsByName('smallText')[0])) return false;
    if (!validate(document.getElementsByName('largeText')[0])) return false;
    if (!validate(document.getElementsByName('number')[0])) return false;
    if (!validate(document.getElementsByName('date')[0])) return false;
    if (!validate(document.getElementsByName('time')[0])) return false;
    if (!validate(document.getElementsByName('cellWidth')[0])) return false;
    if (!validate(document.getElementsByName('cellHeight')[0])) return false;

    if(document.getElementsByName('maxSingleSelectableColumns')[0] != undefined)
    {
        if(!validate(document.getElementsByName('maxSingleSelectableColumns')[0]))
        {
            return false;
        }
        if(document.getElementsByName('maxSingleSelectableColumns')[0].value > 25 || document.getElementsByName('maxSingleSelectableColumns')[0].value < 1)
        {
            alert(getMessageForKey('report.customsettings.maxSingleSelectableColumns.configure.errormsg'));
            document.getElementsByName('maxSingleSelectableColumns')[0].focus();
            return false;
        }
    }

    if(document.getElementsByName('maxMultiSelectableColumns')[0] != undefined)
    {
        if(!validate(document.getElementsByName('maxMultiSelectableColumns')[0]))
        {
            return false;
        }
        if( document.getElementsByName('maxMultiSelectableColumns')[0].value > 10 || document.getElementsByName('maxMultiSelectableColumns')[0].value < 1)
        {
            alert(getMessageForKey('report.customsettings.maxMultiSelectableColumns.configure.errormsg'));
            document.getElementsByName('maxMultiSelectableColumns')[0].focus();
            return false;
        }
    }

    //SD-93590 : Label of Bar chart's are overlapping so providing cx to configure label length from custom settings - validation
    var labelLengthSBC = document.getElementById('labelLengthSBC').value;
    if (labelLengthSBC != '-' && !validate(document.getElementById('labelLengthSBC'))) return false;
    labelLengthSBC = labelLengthSBC == '-' ? 0 : labelLengthSBC;
    if (!validate(document.getElementById('maxColsBC'))) return false;

    //SD-90680: Customizable Chart width and height.
    if (!validate(document.getElementById('chartHeight'))) return false;
    if (!validate(document.getElementById('chartWidth'))) return false;


    var args = "&smallText=" + document.getElementsByName('smallText')[0].value; //No I18N
    args = args + "&largeText=" + document.getElementsByName('largeText')[0].value; //No I18N
    args = args + "&number=" + document.getElementsByName('number')[0].value; //No I18N
    args = args + "&date=" + document.getElementsByName('date')[0].value; //No I18N
    args = args + "&time=" + document.getElementsByName('time')[0].value; //No I18N
    args = args + "&cellWidth=" + document.getElementsByName('cellWidth')[0].value; //No I18N
    args = args + "&cellHeight=" + document.getElementsByName('cellHeight')[0].value; //No I18N
    args = args + "&dateFormat=" + document.getElementsByName('dateFormat')[0].value; //No I18N
    args = args + "&labelLengthSBC=" + labelLengthSBC; //No I18N
    args = args + "&maxColsBC=" + document.getElementById('maxColsBC').value; //No I18N
    args = args + "&timespentformat=" + document.querySelector('input[name="timespentformat"]:checked').value; //No I18N
    args = args + "&chartHeight=" + document.getElementById('chartHeight').value; //No I18N
    args = args + "&chartWidth=" + document.getElementById('chartWidth').value; //No I18N

    var columnAliasLength = document.getElementById('columnAliasLength').value;
        if( columnAliasLength == '')
        {
            columnAliasLength = 0;
        }
        else if( (columnAliasLength <= defaultColumnAliasLength && columnAliasLength >= 10) && !columnAliasLength.includes("."))
        {
            columnAliasLength  =  columnAliasLength;
        }
        else
        {
           alert(document.getElementById("columnaliaslengthvalueerror").innerHTML);
            document.getElementsByName('columnAliasLength')[0].focus();
            return false;
        }

    args = args + "&columnAliasLength=" +columnAliasLength;//No I18N
    if (document.getElementsByName('disablelink')[0].checked) {
        args = args + "&disablelink=true"; //No I18N
    }
    var filetype="";
    const fileTypes = { "htmlfile": "html", "pdffile": "pdf" , "xlsfile": "xls" , "xlsxfile": "xlsx" , "csvfile": "csv" , "xmlfile": "xml" , "docfile": "doc" , "docxfile":"docx" }; //No i18n
    Object.entries(fileTypes).forEach(entry => {
        const [key, fileExtension] = entry;
        if(document.getElementsByName(key)[0].checked){
            filetype += (fileExtension + ','); //No i18n
        }
    });
    if(filetype!=null)
    {
        args = args + "&removetitle="+filetype;//No I18N
    }
    if( document.getElementsByName('groupperpage')[0].checked )
    {
        args = args + "&groupperpage=true";//No I18N
    }
    if (trim(document.getElementsByName('replaceNullValue')[0].value) != '') {
        args = args + "&replaceNullValue=" + encodeURIComponent(document.getElementsByName('replaceNullValue')[0].value); //No I18N
    } else {
        alert(getMessageForKey('sdp.report.emptyvalue.error'));
        document.getElementsByName('replaceNullValue')[0].focus();
        return false;
    }
    var fontPath = encodeURIComponent(document.getElementsByName('fontpath')[0].value);
    var sub_fontpath = fontPath.substring(fontPath.length-4,fontPath.length);
    if(sub_fontpath == "")
    {
        args = args + "&fontpath=-";//No I18N
    }
    else if( sub_fontpath == ".ttf" && fontPath.length > 4 )
    {
        args = args + "&fontpath=" + fontPath;//No I18N
    }
   else
    {
            alert(document.getElementById("fontpatherror").innerHTML);
            document.getElementsByName('fontpath')[0].focus();
            return false;
    }

    if (jQuery("#includeShare").prop("checked") != undefined && jQuery("#includeShare").prop("checked")) {
        args = args + "&includeShare=true"; // NO I18N
    }

    if(document.getElementsByName('maxSingleSelectableColumns')[0] != undefined )
    {
        args = args + "&maxSingleSelectableColumns=" +  document.getElementById('maxSingleSelectableColumns').value; //No I18N
    }
    if(document.getElementsByName('maxMultiSelectableColumns')[0] != undefined )
    {
        args = args + "&maxMultiSelectableColumns=" +  document.getElementById('maxMultiSelectableColumns').value; //No I18N
    }

    if(jQuery("#customizeExcel").prop("checked") != undefined && jQuery("#customizeExcel").prop("checked")) {
        args = args + "&customizeExcel=true" // NO I18N
    }
    callLoadingIcon('updatereportsettings', getMessageForKey('sdp.admin.backup.settings.save.progress.msg')); //No I18N
    handleReportRequest("/CustomReportHandler.do", "module=update_custom_settings" + args, 'update_custom_settings'); //No I18N
}

function saveReportNotifications(form){
    //Need to validate fields if we have any input fields in report notification rules
    if(form.elements[form.elements.length-1].name != getCSRFParamName()){
        var csrfElement = document.createElement("input");
        csrfElement.setAttribute("type","hidden");
        csrfElement.setAttribute("name", getCSRFParamName());
        csrfElement.setAttribute("value", getCSRFParamValue());
        form.appendChild(csrfElement);
    }
    invokeProgressIndicator(null, "sdp.common.processing"); // No I18N
    form.submit();
}

function validate(obj) {
    if (!isInteger(obj.value)) {
        alert(getMessageForKey('sdp.purchase.common.invalidnumber.errmsg'));
        obj.focus();
        return false;
    }
    return true;
}

function showSettingsPage(e) {
    showURLInDialog('CustomReportHandler.do?module=custom_settings', 'modal=yes,closeButton=yes,position=absmiddle,width=600,height=670,title=' + getMessageForKey("sdp.report.reportsettings"), dialogCallbackTooltip); //No I18N
}
var dialogCallbackTooltip = function(){  // Report Settings dialog tooltip init
    initTooltip("#_DIALOG_CONTENT");    //No I18N
}

function showReportReorder() {
    showURLInDialog('CustomReportHandler.do?module=report_reorder', 'modal=yes,closeButton=no,position=absmiddle,width=1000,height=685,closeOnEscKey=no', $reportReorder.startReorder); //No I18N
}

function showManageFolderPage(e) {
    parent.closeDialog();
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
    handleReportRequest("/CustomReportHandler.do", "module=show_folder_details", "show_folder_details"); //No I18N
}

var advFilterIds = []; //To maintain an array of the unique id's of the advanced filters
var advFilterIdsPrefix = []; //An array of the prefix id's added to the filter name field
function addNewRow(thisRow) {
    if (document.createElement && document.childNodes) {
        var gUniqueRowID = Math.round((999 - 100) * Math.random() + 1);
        //var thisRow = document.getElementById(rowId);
        var newElement = thisRow.cloneNode(true);
        newElement.id = "report_" + gUniqueRowID;
        //thisRow.parentNode.insertBefore(newElement,thisRow.nextSibling);
        thisRow.parentNode.insertBefore(newElement, thisRow.nextSibling);
        updateReportElementName(newElement, gUniqueRowID);
    }
}

function storeAdvancedFilterId(id, prefix) {
    if (id != undefined && id != '' && prefix != undefined && prefix != '') {
        advFilterIds.push(parseInt(id));
        advFilterIdsPrefix.push(parseInt(prefix));
    }

}

function updateReportElementName(rowObj, newId) {

    var uvhId = null;
    for (var i = 0; i < rowObj.childNodes.length; i++) {
        if (rowObj.childNodes[i].nodeName == 'TD') {
            for (var j = 0; j < rowObj.childNodes[i].childNodes.length; j++) {
                var tags = rowObj.childNodes[i].childNodes[j];
                if (tags.nodeName == 'SELECT' || tags.nodeName == 'INPUT' || tags.nodeName == 'IMG' || tags.nodeName =="SPAN") {
                    if (tags.name != undefined && tags.name.indexOf("filterColumn") >= 0) {
                        uvhId = 1100 + this.criteriaID;
                        tags.name = uvhId + "_filterColumn_" + newId; //No I18N
                        tags.id = uvhId + "_filterColumn_" + newId; //No I18N
                        tags.onchange = function(event) { getCriteriaOperators(this); };
                        this.criteriaID = this.criteriaID + 1;
                    } else if(tags.hasAttribute('sdpJs') && (tags.getAttribute('sdpJs')==='js-event-ReportWizard1-17' || tags.getAttribute('sdpJs')==='js-event-ReportWizard1-11' )){ //No I18N
                        tags.onclick = function(event) { removeRowWithID(this); };
                    }
                    else if(tags.hasAttribute('sdpJs') && tags.getAttribute('sdpJs')==='js-event-ReportWizard1-27'){
                        tags.onclick = function(event) { addNewRow(this.parentNode.parentNode); };
                    }
                    else if (tags.name != undefined && tags.name.indexOf("selectCriteria") >= 0) {
                        tags.name = "selectCriteria_" + newId; //No I18N
                        tags.id = "select_criteria_" + newId; //No I18N
                    } else if (tags.name != undefined && tags.name.indexOf("matchType") >= 0) {
                        tags.name = "matchType_" + newId; //No I18N
                        tags.id = "matchType_" + newId; //No I18N
                    } else if (tags.name != undefined && tags.name.indexOf("criteriaValue") >= 0) {
                        tags.name = "criteriaValue_" + newId; //No I18N
                        tags.id = "criteriaValue_" + newId; //No I18N
                        var browser = navigator.appName;
                        if (browser == "Netscape") {
                            tags.onclick = function(event) { showDataPicker(this, event, uvhId); };
                        } else {
                            tags.onclick = function() { showDataPicker(this, event, uvhId); };
                        }
                        tags.value = ""; //No I18N
                    } else if (tags.name != undefined && tags.name.indexOf("button") >= 0) {
                        tags.name = "button_" + newId; //No I18N
                        tags.id = "button_" + newId; //No I18N
                        var browser = navigator.appName;
                        if (browser == "Netscape") {
                            tags.onclick = function(event) { showDataPicker(this, event, uvhId); };
                        } else {
                            tags.onclick = function() { showDataPicker(this, event, uvhId); };
                        }
                    }
                }
            }
        }
    }
    storeAdvancedFilterId(newId, uvhId);
}

function removeRowWithID(theRow) {
    if (document.createElement && document.childNodes) {
        var thisRow = theRow.parentNode.parentNode;
        this.selectedRowId = thisRow.id
            //Issue Id : 64303 - Unable to delete column from advance filter when a custom filter is saved.
        var isDelete = true;
        jQuery(thisRow).siblings().each(function() {
            var selectLength = jQuery(this).find('select').length;
            if (selectLength > 1) {
                isDelete = false;
            }
        });
        var rowId = this.selectedRowId.split("_")[1];
        if (thisRow.parentNode.rows.length == 2 || isDelete) {
            //Reset all selected data
            //---SD-21807
            var filterId = getFilterColumnId(document.reportfilter).split("&")[1];

            document.getElementById(filterId + '_filterColumn_' + rowId).value = -1; //No I18N
            document.getElementById('select_criteria_' + rowId).value = -1; //No I18N
            document.getElementById('criteriaValue_' + rowId).value = ""; //No I18N
        } else {
            deleteRow(thisRow);
            if (rowId != undefined) {
                var idIndex = advFilterIds.indexOf(parseInt(rowId));
                if (idIndex >= 0) {
                    advFilterIds.splice(idIndex, 1);
                    advFilterIdsPrefix.splice(idIndex, 1);
                }
            }
            setTimeout(function() { clearRowData(); }, 1500);
        }
    }


}
// SD-21807 add new fuction for getting the ID of the select column filter.

function getFilterColumnId(formName) {
    var params = "";
    try {
        var elements_list = formName.elements;
        var length = elements_list.length;
        var element_type;
        for (i = 0; i < length; i++) {
            element_type = elements_list[i].type;
            if (element_type == 'select-one' && elements_list[i].name.indexOf("filterColumn") >= 0) {
                params += "&" + elements_list[i].name.split("_")[0]; //No I18N
            }
        }
    } catch (e) {}
    return params;
}



function scheduleReport(reportId) {
    //document.location = "/ReportSchedule.do?mode=new&reportName=" + reportId;
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true);
    params = "mode=new&report_id=" + reportId; //No I18N
    handleReportRequest("/ReportSchedule.do", params, 'start_page'); //No I18N
    if(isMSP){
        disableSiteFreeze();
    }
}

function clearRowData() {
    var thisRow = document.getElementById(this.selectedRowId);
    thisRow.parentNode.removeChild(thisRow);
}

function deleteRow(rowObj) {
    for (var j = 0; j < rowObj.childNodes.length; j++) {
        if (rowObj.childNodes.item(j).nodeName == 'TD') {
            rowObj.childNodes.item(j).setAttribute('bgcolor', '#FAF8CC');
            jQuery(rowObj.childNodes.item(j)).fadeOut(1150);
        }
    }
    jQuery(rowObj).fadeOut(1150);
}

function openMatrixReportWizard( tdTagId ,isAPISupported)
{
    var divObj = document.getElementById(tdTagId);
    if (tdTagId == 'rcstep2' && divObj.style.display == 'none') {
            if( document.getElementById('rcstep2').innerHTML == '' ) {
                param = "module=show_filter_page";  //No I18N
                param = isAPISupported ? $reports.appendPreviousConfig("module=show_filter_page") : param; //No I18N
                handleReportRequest("/CustomReportHandler.do",param, 'show_filter_page');//No I18N
        }
        toggleSwipe1(tdTagId);
        plusMinus(tdTagId);
    } else {
        toggleSwipe1(tdTagId);
        plusMinus(tdTagId);
    }
}

function openReportWizard(tdTagId, isAPISupported) {
    var len = document.CustomReportHandlerForm.displayColumnList.options.length;
    var showstep1 = false;
    if ((tdTagId == 'rcstep5' || tdTagId == 'rcstep4') && len == 0) {
        alert(getMessageForKey('sdp.report.newreport.error.selection'));
        //openReportWizard('rcstep1');
        tdTagId = 'rcstep1'; //No I18N
        showstep1 = true; //No I18N
        //return;
    }

    for (var i = 1; i <= 5; i++) {
        tdObj = document.getElementById("rcstep" + i);

        if (("rcstep" + i) == tdTagId) {
            if (tdObj.style.display == 'none') {
                tdObj.style.display = 'block'; //No I18N
                plusMinus(tdTagId);
                if (trim(tdObj.innerHTML) == '') {
                    if (tdTagId == 'rcstep2') {
                        callLoadingIcon(tdTagId, getMessageForKey('sdp.purchase.progress.indicator.openrecent'));
                        module = isAPISupported ? $reports.appendPreviousConfig("module=show_filter_page") : "module=show_filter_page"; //no i18n
                        handleReportRequest("/CustomReportHandler.do", module, 'show_filter_page'); //No I18N
                        return;
                    } else if (tdTagId == 'rcstep3') { //no i18n
                        callLoadingIcon(tdTagId, getMessageForKey('sdp.purchase.progress.indicator.openrecent'));
                        module = isAPISupported ? $reports.appendPreviousConfig("module=show_grouping_page") : "module=show_grouping_page"; //no i18n
                        handleReportRequest("/CustomReportHandler.do", module, 'show_grouping_page'); //No I18N
                        return;
                    } else if (tdTagId == 'rcstep4') { //no i18n
                        var dispCols = document.getElementById("displayColumnList");
                        var length = dispCols.options.length;
                        if (length > 0) {
                            var addParams = "&" + constructParameters(document.summary_columns);
                            callLoadingIcon(tdTagId, getMessageForKey('sdp.purchase.progress.indicator.openrecent'));
                            var param = "module=show_summary_page&loadSummaryColumn=true"; //No I18N
                            for (var i = 0; i < length; i++) {
                                param += "&displayColumnList=" + dispCols.options[i].value; //No I18N
                            }
                            param += addParams;
                            param = isAPISupported ? $reports.appendPreviousConfig(param) : param;
                            handleReportRequest("/CustomReportHandler.do", param, 'show_summary_page'); //No I18N
                        }
                        return;
                    } else if (tdTagId == 'rcstep5') { //no i18n
                        updateGraphDetails(tdTagId, len, true, isAPISupported);
                        return;
                    }
                } else if (tdTagId == 'rcstep4') { //no i18n
                    var dispCols = document.getElementById("displayColumnList");
                    var length = dispCols.options.length;
                    if (length > 0) {
                        var addParams = "&" + constructParameters(document.summary_columns); //No I18N
                        callLoadingIcon(tdTagId, getMessageForKey('sdp.purchase.progress.indicator.openrecent'));
                        var param = "module=show_summary_page"; //No I18N
                        for (var i = 0; i < length; i++) {
                            param += "&displayColumnList=" + dispCols.options[i].value; //No I18N
                        }
                        param += addParams;
                        param = isAPISupported ? $reports.appendPreviousConfig(param) : param;
                        handleReportRequest("/CustomReportHandler.do", param, 'show_summary_page'); //No I18N
                    }
                    return;
                } else if (tdTagId == 'rcstep5') { //no i18n
                    backupChartDetails(document.chart_types.chartType.value);
                    updateGraphDetails(tdTagId, len, false, isAPISupported);
                    return;
                }
                /*
                if( tdObj.style.display == 'none' )
                {
                    //tdObj.style.display = 'block';//No I18N
                    new Effect.BlindDown("rcstep" + i);//No I18N
                }*/
            } else {
                if (!showstep1) {
                    toggleSwipe1(tdTagId);
                    plusMinus(tdTagId);
                }
            }
        }
    }
}


function backupChartDetails(chartType) {
    //Backing up chart details
    if (chartType != -1) {
        this.selectedChartType = chartType;
        if (chartType == 1 || chartType == 2 || chartType == 14) {
            this.pieChartGroupColumn = document.chart_types.pieChartGroupColumn.value;
            this.pieChartDisplayFormat = document.chart_types.pieChartDisplayFormat.value;
        } else if (chartType >= 4 && chartType <= 9) {
            this.barXGroup1 = document.chart_types.barXGroup1.value;
            this.barXGroup2 = document.chart_types.barXGroup2.value;
            this.barChartBy = document.chart_types.barChartBy.value;
        } else if (chartType == 10) {
            this.lineXDate = document.chart_types.lineXDate.value;
            this.lineXDateFormat = document.chart_types.lineXDateFormat.value;
            this.lineXGroup = document.chart_types.lineXGroup.value;
        } else if (chartType == 11) {
            this.timeXDate = document.chart_types.timeXDate.value;
            this.timeXGroup = document.chart_types.timeXGroup.value;
            this.timeYCountColumn = document.chart_types.timeYCountColumn.value;
            this.timeXDateFormat = document.chart_types.timeXDateFormat.value;
        } else if (chartType == 12) {
            this.areaXDate = document.chart_types.areaXDate.value;
            this.areaXGroup = document.chart_types.areaXGroup.value;
            this.areaXDateFormat = document.chart_types.areaXDateFormat.value;
        }
    }
}

function updateGraphDetails(tdTagId, len, loadingFirstTime, isAPISupported) {
    callLoadingIcon(tdTagId, getMessageForKey('sdp.purchase.progress.indicator.openrecent'));
    var param = "module=show_graph_page"; //No I18N
    if (loadingFirstTime == true) {
        param += "&loadGraphDetails=true"; //No I18N
    }
    for (var i = 0; i < len; i++) {
        param += "&displayColumnList=" + document.CustomReportHandlerForm.displayColumnList.options[i].value; //No I18N
    }
    param = isAPISupported ? $reports.appendPreviousConfig(param) : param;
    handleReportRequest("/CustomReportHandler.do", param, 'show_graph_page'); //No I18N
}

function callLoadingIcon(tdTagId, message, adjustWidth)
{
    if( document.getElementById(tdTagId) != undefined )
    {
        width = adjustWidth == true ? " " : ' width="50%"';
        document.getElementById(tdTagId).innerHTML =  '<table width="100%"><tr><td'+ width + ' align="right"><div class="custom-loader mr10"></div></td><td align="left">' + message + '</td></tr></table>';//No I18N
        showDiv(tdTagId); //No I18N
    }
}

function updateItemListIntoText(selectTagObj, updateTo) {
    var len = selectTagObj.options.length;
    if (len > 0) {
        var textData = null;
        for (var i = 0; i < len; i++) {
            if (selectTagObj.options[i].selected) {
                if (textData == null) {
                    textData = '"' + selectTagObj.options[i].value + '"'; //No I18N
                } else {
                    textData += ',"' + selectTagObj.options[i].value + '"'; //No I18N
                }
            }
        }
        if (textData != null) {
            updateTo.value = textData.replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>'); //NO I18N
        }
    }
}

function geti18nString(key) {
    //SD-83959
    return getMessageForKey(key);
}

function validateFieldsForPerformance(){
     //Validating date filter column. If any column in grouping has date format as "Day" or "Time", date filter criteria is needed.
     //This is to avoid server stability issues.
        var size = document.reportfilter.preDateFilterType.length;
        var value= document.reportfilter.preDateFilterType[0].value;
        var maxAllowedDateFilterDays = jQuery("#maxDaysAllowedForDateFilter").val();
        for(index=0;index<size;index++){
            if(document.reportfilter.preDateFilterType[index].checked) {
                value = document.reportfilter.preDateFilterType[index].value;
                }
            }
            if(value == "customized") {
                //checking date values..
                var temp = document.reportfilter.preFromDate.value.split("-");
                var temp2 = document.reportfilter.preToDate.value.split("-");
                var startTimeAsLong = Date.parse(temp[0]+"/"+temp[1]+"/"+temp[2]);
                var endTimeAsLong = Date.parse(temp2[0]+"/"+temp2[1]+"/"+temp2[2]);
                if(startTimeAsLong < endTimeAsLong){
                    var diffInSec = (endTimeAsLong - startTimeAsLong)/1000;
                    var noOfDays = diffInSec/3600/24;
                    if(noOfDays>maxAllowedDateFilterDays){
                        return false;
                    }
                }
            }
            else{//This is for predefined dates
                //Date filter is not adviceable for more than configured  days.
                var predefinedValue = jQuery("#dateFilterType").val();
                var noOfDays = 1;
                if(predefinedValue == "2" || predefinedValue == "3" || predefinedValue == "11" || predefinedValue == "14"){
                    noOfDays = 7;
                }
                else if(predefinedValue == "4" || predefinedValue == "5"){
                    noOfDays = 30;
                }
                else if(predefinedValue == "13" || predefinedValue == "16"){
                    noOfDays = 30;
                }
                else if(predefinedValue == "6" || predefinedValue == "7"){
                    noOfDays = 90;
                }
                else if(predefinedValue == "9" || predefinedValue == "10"){
                    noOfDays = 365;
                }
                else if(predefinedValue == "12" || predefinedValue == "15"){
                    noOfDays = 15;
                }

                if(noOfDays > maxAllowedDateFilterDays){
                    return false;
                }
            }
    return true;
}

function openMatrixReportPage(siteid, isAPISupported)
{
    var matrixReportType = document.getElementById('matrixReportType').value; //No I18N

    var param = "module=generate_matrix_report&matrixReportType=" + matrixReportType; //No I18N

    if (isMSP) {
        if (siteid == null) {
            siteid = -1;
        }
        param += "&persistentAccountId=" + getAccountId(); //No I18N
        if (siteid != null) {
            param += "&site=" + siteid; // No i18n
        }
    }

    if (matrixReportType == "simple") {
        var LeftCol = document.getElementById('simpleLeftColumn').value;

        var TopCol = document.getElementById('simpleTopColumn').value;


        if (LeftCol == -1) {

            alert(document.getElementById("selectleftcol").innerHTML);
            return;

        }

        if (LeftCol == TopCol) {
            //alert("Please Select Different Columns");//No I18N
            alert(document.getElementById("samecolumns").innerHTML);
            return;

        }
    }

    if (matrixReportType == "advanced") {
        if (document.getElementById('matrixGroup1').value == -1) {
            //alert(geti18nString( "sdp.reports.customReport.selectrowgroupcolumn" ));
            alert(document.getElementById("selectrowgroupcolumn").innerHTML);
            return;
        }
        if (document.getElementById('matrixGroupColumn1').value == -1) {
            //alert(geti18nString("sdp.reports.customReport.selectdatecolumn"));
            //All columns will be supported in column grouping
            alert(getMessageForKey('advanced.matrix.no.column.grouping'));
            //alert(document.getElementById("selectdatecolumn").innerHTML);
            return;
        }

         //Has to check if any of the dateFields has "day/time" configured for date GroupBy.
        var isDayTimeFieldPresent = false;

        for(var i=1;i<=5;i++){
            var columnValue = jQuery("#matrixGroupColumn"+i).val();
            var groupByValue = jQuery("#matrixColumnGroupBy"+i).val();
            if(columnValue !=-1){
                if(groupByValue === "Day" || groupByValue === "Time"){
                    isDayTimeFieldPresent = true;
                    break;
                }

            }
        }

        if(isDayTimeFieldPresent){


            if(document.reportfilter.dateFilterColumn != undefined && document.reportfilter.dateFilterColumn.value != '-1'){

                if(!validateFieldsForPerformance()){
                    var maxAllowedDateFilterDays = jQuery("#maxDaysAllowedForDateFilter").val();
                    alert(getMessageForKey("advanced.matrix.performance.date.fields",[maxAllowedDateFilterDays]));
                    return;
                }
            }
            else{
                //If day or Time grouping is selected for any column, date criteria is mandatory.
                alert(getMessageForKey("advanced.matrix.date.filter.mandatory"));
                var divObj = document.getElementById("rcstep2");

                if(divObj.style.display == 'none' )
                {
                    openMatrixReportWizard("rcstep2", isAPISupported);//No I18N
                }
                jQuery("#dateFilterColumn").focus();
                return;
            }
        }


        //Updating matrix grouping column details
        if (document.advancedmatrix != undefined) {
            param += constructParameters(document.advancedmatrix);
        }
    } else {
        if (document.getElementById('simpleTopColumn').value == -1) {
            //alert(geti18nString( "sdp.reports.customReport.selecttopcol" ));
            alert(document.getElementById("selecttopcol").innerHTML);
            return;
        }
        if (document.getElementsByName('simpleLeftColumn').value == -1) {
            //alert(geti18nString( "sdp.reports.customReport.selectleftcol" ));
            alert(document.getElementById("selectleftcol").innerHTML);
            return;
        }
        //Updating matrix grouping column details
        if (document.simplematrix != undefined) {
            param += constructParameters(document.simplematrix);
        }
    }
    param = isAPISupported ? $reports.appendPreviousConfig(param.replaceAll("&=","")) : param;
    //Updating filter column details
    if (document.reportfilter.dateFilterColumn != undefined) {
        if (document.reportfilter.elements.length > 0) {
            param += "&filterEnabled=true"; //No I18N
        }
        if (!isAPISupported) {
            param += constructFilterParameters(document.reportfilter);
        } else {
            var filterParameters = jQuery("[name=reportfilter]");
            param += "&dateFilterColumn=" + filterParameters.find("#dateFilterColumn").val(); //no i18n
            param += "&dateFilterType=" + filterParameters.find("#dateFilterType").val(); //no i18n
            param += "&preDateFilterType=" + filterParameters.find("input[name='preDateFilterType']:checked").val(); //no i18n
            param += "&preFromDate=" + filterParameters.find("input[name='preFromDate']").val(); //no i18n
            param += "&preToDate=" + filterParameters.find("input[name='preToDate']").val(); //no i18n
            var criteria = filterParameters.find("#criteriabuilder").custom_filter("getFilterData");  //No I18N
            if (criteria) {
                param += "&criteriaJSON=" + encodeURIComponent(Object.toJSON ? Object.toJSON(criteria) : ((typeof sdpToJSON != 'undefined') ? sdpToJSON(criteria) : JSON.stringify(criteria))); //no i18n
            } else {
                obj = jQuery("#criteriabuilder").custom_filter("get_row_value", jQuery("#criteriabuilder").find("li")); //no i18n
                if(obj.field != 0 && obj.field != ''){ return false; }
            }
        }
    }


    displayFadeMsg(getMessageForKey("sdp.reports.common.generating.message"), true);
    jQuery('#cancelmatrixreport').prop('disabled', true); //No I18N
    if(isMSP){
        enableSiteFreeze();
    }
    handleReportRequest("/CustomReportHandler.do", param, 'show_matrix_report_page'); //No I18N
}

function runReport(param) {
    parent.closeDialog();
    displayFadeMsg(getMessageForKey("sdp.reports.common.generating.message"), true); //No I18N
    if (isMSP) {
        param += "&persistentAccountId=" + encodeURIComponent(getAccountId())+"&site="+encodeURIComponent(document.getElementById("account").value);    //No I18N
    }
    handleReportRequest("/CustomReportHandler.do", param, 'run_from_listview'); //No I18N
}

function openReportPage(siteid, isAPISupported) {
    //this.criteriaID = 1;
    var param = "module=show_report_page"; //No I18N
    if (isMSP) {
        param += "&persistentAccountId=" + getAccountId(); //No I18N
        if (siteid != null) {
            param += "&site=" + siteid; // No i18n
        }
    }
    //Validating display column details
    var len = document.CustomReportHandlerForm.displayColumnList.length;
    if (len == 0) {
        //alert(geti18nString("sdp.reports.customReport.selectcolserr"));
        alert(document.getElementById("selectcolserr").innerHTML);
        return false;
    }
    else{
        if(isMSP){
            enableSiteFreeze();
        }
    }
    //Validating chart details
    var chartType = -1;

    if (document.chart_types != undefined && document.chart_types.chartType != undefined) {
        chartType = document.chart_types.chartType.value;
        param += "&chartEnabled=true"; //No I18N
    }

    if (chartType != -1) {
        if( chartType == 1 || (chartType >= 14 && chartType <= 17) )
        {
            if (document.chart_types.pieChartGroupColumn.value == "-1") {
                //alert(geti18nString( "sdp.reports.customReport.mandatorymsg" ));
                alert(document.getElementById("mandatorymsg").innerHTML);
                return;
            }
        }
        else if( chartType == 4 || chartType == 6 || chartType == 18 )
        {
            if( document.chart_types.barXGroup1.value == "-1" )
            {
                //alert(geti18nString( "sdp.reports.customReport.mandatorymsg" ));
                alert(document.getElementById("mandatorymsg").innerHTML);
                return;
            }

            if( chartType == 6 && document.chart_types.barXGroup2.value == "-1" )
            {
                //alert(geti18nString( "sdp.reports.customReport.mandatorymsg" ));
                alert(document.getElementById("mandatorymsg").innerHTML);
                return;
            }
            }
        else if( chartType == 10  || chartType == 13 || chartType == 19 || chartType == 20)
        {
            var date_col = document.chart_types.lineXDate.value;
            var group_col = document.chart_types.lineXGroup.value;
            //var count_col = document.CustomReportHandlerForm.lineYCountColumn.value;
            if (date_col == "-1" || group_col == "-1") {
                //alert(geti18nString( "sdp.reports.customReport.mandatorymsg" ));
                alert(document.getElementById("mandatorymsg").innerHTML);
                return;
            }
        } else if (chartType == 11) {
            var date_col = document.chart_types.timeXDate.value;
            var group_col = document.chart_types.timeXGroup.value;
            var count_col = document.chart_types.timeYCountColumn.value;
            if (date_col == "-1" || group_col == "-1" || count_col == "-1") {
                //alert(geti18nString( "sdp.reports.customReport.mandatorymsg" ));
                alert(document.getElementById("mandatorymsg").innerHTML);
                return;
            }
        } else if (chartType == 12) {
            var date_col = document.chart_types.areaXDate.value;
            var group_col = document.chart_types.areaXGroup.value;
            //var count_col = document.CustomReportHandlerForm.areaYCountColumn.value;
            if( date_col == "-1" || group_col == "-1" )
            {
                //alert(geti18nString( "sdp.reports.customReport.mandatorymsg" ));
                alert(document.getElementById("mandatorymsg").innerHTML);
                return;
            }
        }
            }
    //Updating display column list
    for (var i = 0; i < len; i++) {
        param += "&displayColumnList=" + document.CustomReportHandlerForm.displayColumnList[i].value; //No I18N
    }
    //Updating filter column details
    if (document.reportfilter.dateFilterColumn != undefined) {
        if (document.reportfilter.dateFilterColumn.value != '-1') {
            var size = document.reportfilter.preDateFilterType.length;
            var value = document.reportfilter.preDateFilterType[0].value;
            for (index = 0; index < size; index++) {
                if (document.reportfilter.preDateFilterType[index].checked) {
                    value = document.reportfilter.preDateFilterType[index].value;
                }
            }
            if (value == "customized") {
                //checking date values..
                var temp = document.reportfilter.preFromDate.value.split("-");
                var temp2 = document.reportfilter.preToDate.value.split("-");
                var startTimeAsLong = Date.parse(temp[0] + "/" + temp[1] + "/" + temp[2]);
                var endTimeAsLong = Date.parse(temp2[0] + "/" + temp2[1] + "/" + temp2[2]);
                if (startTimeAsLong > endTimeAsLong) {
                    alert(getMessageForKey("sdp.contract.addNew.jsDateDiffErr")); //NO I18N
                    return;
                }
            }
        }
        if (document.reportfilter.elements.length > 0) {
            param += "&filterEnabled=true"; //No I18N
        }
        if (!isAPISupported) {
        param += constructFilterParameters(document.reportfilter);
        } else {
            var filterParameters = jQuery("[name=reportfilter]");
            param += "&dateFilterColumn=" + filterParameters.find("#dateFilterColumn").val(); //no i18n
            param += "&dateFilterType=" + filterParameters.find("#dateFilterType").val(); //no i18n
            param += "&preDateFilterType=" + filterParameters.find("input[name='preDateFilterType']:checked").val(); //no i18n
            param += "&preFromDate=" + filterParameters.find("input[name='preFromDate']").val(); //no i18n
            param += "&preToDate=" + filterParameters.find("input[name='preToDate']").val(); //no i18n
            var criteria = filterParameters.find("#criteriabuilder").custom_filter("getFilterData"); //No I18N
            if (criteria) {
                param += "&criteriaJSON=" + encodeURIComponent(Object.toJSON ? Object.toJSON(criteria) : ((typeof sdpToJSON != 'undefined') ? sdpToJSON(criteria) : JSON.stringify(criteria))); //no i18n
            } else {
                obj = jQuery("#criteriabuilder").custom_filter("get_row_value", jQuery("#criteriabuilder").find("li")); //no i18n
                if(obj.field != 0 && obj.field != ''){ return false; }
            }
        }
    }

    //Updating group column details
    if (document.group_columns != undefined) {
        if (document.group_columns.elements.length > 0) {
            param += "&groupEnabled=true"; //No I18N
        }
        param += constructParameters(document.group_columns);
    }
    //Updating summary column list

    if (document.summary_columns != undefined) {
        if (document.summary_columns.elements.length > 0) {
            param += "&summaryEnabled=true"; //No I18N
        }
        param += constructParameters(document.summary_columns);
    }
    //Updating chart details
    if (chartType != -1) {
        if (document.chart_types != undefined) {
            param += constructParameters(document.chart_types);
        }
    }


    //Passing addition parameter if the report is newly generated one
    if (document.CustomReportHandlerForm.newReport != null) {
        param += "&newReport=true&reportType=" + document.CustomReportHandlerForm.reportType.value; //No I18N
        param += "&moduleID=" + document.CustomReportHandlerForm.moduleID.value; //No I18N
        param += "&reportTitle=" + document.getElementById('reportTitle').value; //No I18N
    }

    displayFadeMsg(getMessageForKey("sdp.reports.common.generating.message"), true);
    jQuery('#canceltabularreport').prop('disabled', true); //No I18N
    param = isAPISupported ? $reports.appendPreviousConfig(param.replaceAll("&=","")) : param;
    handleReportRequest("/CustomReportHandler.do", param, 'show_report_page'); //No I18N
    return false;
}

function go_back() {
    document.location = "/CustomReportHandler.do?module=start_page&PORTALID=" + PORTALID;
}

function isDataTypeMaching(data_type, filter_type) {
    var len = filter_type.length;
    for (var i = 0; i < len; i++) {
        if (data_type == filter_type[i]) {
            return true;
        }
    }
    return false;
}

function isDateColumn(column_id) {
    var len = col_details.length;
    for (var i = 0; i < len; i++) {
        if (col_details[i].column_id == column_id && col_details[i].data_type == 6) {
            return true;
        }
    }
    return false;
}

function summaryReportPrintPreview(report_id) {
    var param = "/SummaryReportHandler.do?module=print_preview"; //No I18N
    if (report_id != null && report_id != "null") {
        param += "&report_id=" + encodeURIComponent(report_id); //No I18N
    }
    NewWindowP(param, '', '900', '750', 'yes', 'center', 'yes', 'yes'); //No I18N
}

function print_view(report_id, isAuditReport, isAPISupported) {
    param = isAPISupported ? $reports.appendPreviousConfig("module=print_preview") : "module=print_preview"; // no i18n
    var url = "/CustomReportHandler.do"; //No I18N

    if (isAuditReport != null && isAuditReport != "null") {
        url = "AuditHistoryReport.do"; //No I18N
    }
    if (isAuditReport == 'CIHistory') {
        url = "CIHistoryReportHandler.do"; //NO I18N
    }
    else if(isAuditReport == 'SummaryReport')
    {
        url= "/SummaryReportHandler.do"; //NO I18N
    }
    if (report_id != null && report_id != "null") {
        param += "&report_id=" + encodeURIComponent(report_id); //No I18N
    }
    if(url.startsWith("/Custom")){
            w = 900;h=750;
            LeftPosition=(screen.width)?(screen.width-w)/2:100;TopPosition=(screen.height)?(screen.height-h)/2:100;
            win = window.open(url+"?"+param,getMessageForKey("sdp.requests.viewrequest.printpreview"),'height='+h+',width='+w+',scrollbars=yes,status=yes,top='+TopPosition+',left='+LeftPosition+',location=no,directories=no,resizable=yes');

        }else{
            NewWindowP(url+"?"+param,'','900','750','yes','center','yes','yes');//No I18N
        }
}

function graph_view(module, report_id, isAPISupported) {
    if (report_id != null && report_id != "null") {
        if (isAPISupported) {
            NewWindow($reports.appendPreviousConfig("CustomReportHandler.do?module=graph_view&module_id=" + encodeURIComponent(module) + "&report_id=" + encodeURIComponent(report_id)), '', '900', '600', 'yes', 'center', 'yes', 'yes'); //No I18N
        } else {
        NewWindow("CustomReportHandler.do?module=graph_view&module_id=" + encodeURIComponent(module) + "&report_id=" + encodeURIComponent(report_id), '', '900', '600', 'yes', 'center', 'yes', 'yes'); //No I18N
        }
    } else {
        if (isAPISupported) {
            NewWindow($reports.appendPreviousConfig("CustomReportHandler.do?module=graph_view&module_id=" + encodeURIComponent(module)), '', '900', '600', 'yes', 'center', 'yes', 'yes'); //No I18N
        } else {
            NewWindow("CustomReportHandler.do?module=graph_view&module_id=" + encodeURIComponent(module), '', '900', '600', 'yes', 'center', 'yes', 'yes'); //No I18N
        }
    }
}

function editFreshSummaryReport() {
    if(isMSP){
        disableSiteFreeze();
    }
    var param = "module=show_available_subreports"; //No I18N
    handleReportRequest("/SummaryReportHandler.do", param, 'show_available_subreports'); //No I18N
}

function editFreshReport(reportType) {
    if (reportType === "Tabular Reports" || reportType === "Request Metrics Report") {
        jQuery('#canceltabularreport').prop('disabled', false); //No I18N
    } else if (reportType === "Matrix Reports" || reportType === "simple" || reportType === "advanced") { //no i18n
        jQuery('#cancelmatrixreport').prop('disabled', false); //No I18N
    } else if (reportType === "QTabular Reports") { //no i18n
        jQuery('#cancelqueryreport').prop('disabled', false); //No I18N
    }
    if(isMSP){
        disableSiteFreeze();
    }
    document.getElementById('report_input_pages').style.display = "block"; // No I18N
    //new Effect.BlindDown('report_input_pages');
    document.getElementById('report_result').innerHTML = ""; //No I18N
}

function editReport(reportId, reportTypeId, isAPISupported){
    //this.criteriaID = 1;
    if(isMSP){
        disableSiteFreeze();
    }
    parent.closeDialog();
    if (reportTypeId == "6") {
        editAuditReport(reportId);
    } else if (reportTypeId == "7") {
        editCIHistoryReportFrmFldr(reportId);
    } else if (reportTypeId == "5") {
        var param = "module=edit_report&report_id=" + encodeURIComponent(reportId); //No I18N
        handleReportRequest('/SummaryReportHandler.do', param, 'edit_report_page'); //No I18N
    } else if (reportTypeId != "2") {
        var param = "module=edit_report&report_id=" + encodeURIComponent(reportId); //No I18N
        param = isAPISupported ? $reports.setAPIFlag(param) : param
        handleReportRequest('/CustomReportHandler.do', param, 'edit_report_page'); //No I18N
    } else if (reportTypeId == "2") {
        var param = "module=edit_qreport&report_id=" + encodeURIComponent(reportId); //No I18N
        param = isAPISupported ? $reports.setAPIFlag(param) : param
        handleReportRequest('/CustomReportHandler.do', param, 'edit_qreport'); //No I18N
    }
}

function nextPage(page_index, total_pages, module, report_id, url, isAPISupported) {
    if (page_index != total_pages) {
        var param = "module=generate_next_report_page&PAGE_INDEX=" + encodeURIComponent(page_index) + "&TOTAL_PAGES=" + encodeURIComponent(total_pages) + "&module_id=" + encodeURIComponent(module) + "&report_id=" + encodeURIComponent(report_id); //No I18N
        param = isAPISupported ? $reports.appendPreviousConfig(param) : param;
        callLoadingIcon('reportnavigationload', getMessageForKey('sdp.report.genreport.info.loading')); //No I18N
        handleReportRequest(url, param, 'page_navigation');//No I18N
    }
}

function prevPage(page_index, total_pages, module, report_id, url, isAPISupported) {
    if (page_index != '-1') {
        var param = "module=generate_next_report_page&PAGE_INDEX=" + encodeURIComponent(page_index) + "&TOTAL_PAGES=" + encodeURIComponent(total_pages) + "&module_id=" + encodeURIComponent(module) + "&report_id=" + encodeURIComponent(report_id); //No I18N
        param = isAPISupported ? $reports.appendPreviousConfig(param) : param;
        callLoadingIcon('reportnavigationload', getMessageForKey('sdp.report.genreport.info.loading')); //No I18N
        handleReportRequest(url, param, 'page_navigation');//No I18N
    }
}

function showQuery(status, report_type, e, isAPISupported) {
    let param = 'module=show_query';//no i18n
    if (report_type == "QTabular Reports") {
        param += '&queryreport=true';
    } else if (status == 'fresh') { //no i18n
        param += '&freshreport=true';
    }
    param = isAPISupported ? $reports.appendPreviousConfig(param) : param;
    showURLInDialog('CustomReportHandler.do?'+param, 'closeButton=yes,position=relative,width=500,left=-200'); //No I18N
}

function setFocus() {
    try {
        document.getElementById('folder_name').focus();
    } catch (e) {}
}

function checkAvailabilityFolder() {
    var folder_name = document.getElementById("folder_name").value;
    if (trim(folder_name) != "") {
        handleReportRequest("/CustomReportHandler.do", "module=create_new_folder&folder_name=" + encodeURIComponent(folder_name), 'create_new_folder'); //No I18N
        document.getElementById('addFolderInput').style.display = "none";
        document.getElementById('addFolderLink').style.display = "";
    } else {
        showalert('failure', getMessageForKey("sdp.reports.customReport.savefolder.emptyfolder"), 'isAutoHide=true,closeOnEscKey=yes,width=500,height=80'); //No I18N
    }
}

function openSaveReportAsWindow(e, reportId, isAPISupported) {
    param = isAPISupported ? $reports.appendPreviousConfig("module=duplicate_report") : "module=duplicate_report"; // no i18n
    showURLInDialog('CustomReportHandler.do?' + param, 'closeButton=yes,position=relative,width=700,left=-200,title=' + getMessageForKey('sdp.reports.saveReport.saveSubmit') + ''); //No I18N
}

function openSaveReportWindow(e, isAPISupported) {
    param = isAPISupported ? $reports.appendPreviousConfig("module=save_report") : "module=save_report"; // no i18n
    showURLInDialog('CustomReportHandler.do?' + param, 'closeButton=yes,position=relative,width=700,left=-200,title=' + getMessageForKey('sdp.reports.saveReport.saveSubmit') + ''); //No I18N
}

function saveReport(reportType, isAPISupported) {
    var selectedReportFolder = document.getElementById('folderId').value;
    var reportName = document.getElementById('reportName').value;

    if (trim(reportName) == '') {
        alert(getMessageForKey('sdp.report.missing.reportname'));
        return;
    }
    var ispublic = "private"; //No I18N
    if (document.getElementById('public').checked) {
        ispublic = 'public'; //No I18N
    }
    var desc = document.getElementById('desc').value;

    callLoadingIcon('reportStatus', getMessageForKey('sdp.admin.backup.settings.save.progress.msg')); //No I18N

    //For matrix report
    var matrixReportType = ""; //No I18N
    if (document.reportfilter != undefined && document.getElementById('matrixReportType') != undefined) {
        matrixReportType = "&matrixReportType=" + document.getElementById('matrixReportType').value; //No I18N
    }

    var ajaxIdentifier = 'save_report_as'; //No I18N
    var url = "/CustomReportHandler.do"; //No I18N

    if (reportType == 'Summary Reports') {
        ajaxIdentifier = "save_summary_report_as"; //No I18N
    } else if (reportType == 'Audit Reports') { //no i18n
        url = "/AuditHistoryReport.do"; //No I18N
        ajaxIdentifier = 'save_audit_report_as'; //No I18N
    } else if (reportType == 'CIHistory Reports') { //no i18n
        url = "/CIHistoryReportHandler.do"; //NO I18N
        ajaxIdentifier = 'save_ci_report_as';//No I18N
    }
    else if( reportType == 'QTabular Reports')
    {
        ajaxIdentifier = 'save_query_report_as';//No I18N
    }

    param = isAPISupported ? $reports.appendPreviousConfig("module=save_report_as&folderId=" + selectedReportFolder + "&reportName=" + encodeURIComponent(reportName) + "&ispublic=" + encodeURIComponent(ispublic) + "&desc=" + encodeURIComponent(desc) + matrixReportType) : //No I18N
        "module=save_report_as&folderId=" + selectedReportFolder + "&reportName=" + encodeURIComponent(reportName) + "&ispublic=" + encodeURIComponent(ispublic) + "&desc=" + encodeURIComponent(desc) + matrixReportType; //No I18N

    handleReportRequest(url, param, ajaxIdentifier);
}

function isValidEmailId(toAddress) {
    var validto = validateEMailIDs(toAddress);
    if (!validto) {
        return false;
    }
    return true;
}

validateFileFormat = (fileType) => {
    var validTypes = ["CSV", "XLS", "XLSX", "HTML", "PDF", "INLINEHTML", "DOC", "DOCX", "XML"]; //No i18n
    return validTypes.includes(fileType.toUpperCase());
}

validateReportEmailForm = () => {
    let format = document.getElementById('file_type').value;

    if(!validateFileFormat(format)){
        showalert("failure",translate('api.invalid.input', [getMessageForKey('sdp.reports.customReport.format'), e_html(format)]), "isAutoHide=true"); //No i18n
        jQuery('#file_type').select2('open'); //No i18n
        return false;
    }

    if(document.getElementById('toEmailSearch').value.length == 0){
        showalert("failure", translate("sdp.common.error.empty", [translate("sdp.common.mail.to")]), "isAutoHide=true"); //No i18n
        jQuery('#toEmailSearch').select2('open'); //No i18n
        return false;
    }

    if(document.getElementById('toEmailSearch').value.length > 10000){
        showalert("failure", translate("sdp.app.common.maxlength.characters", [translate("sdp.common.mail.to"), 10000]), "isAutoHide=true"); //No i18n
        jQuery('#toEmailSearch').select2('open'); //No i18n
        return false;
    }

    if(!isValidEmailId(document.getElementById('toEmailSearch'))) {
        showalert("failure", translate("sdp.requests.fieldFormRules.invalidEmail"), "isAutoHide=true"); //No i18n
        jQuery('#toEmailSearch').select2('open'); //No i18n
        return false;
    }

    if (document.getElementById('toEmailSearchCC').value != null && document.getElementById('toEmailSearchCC').value.length > 0 && !isValidEmailId(document.getElementById('toEmailSearchCC'))) {
        if(document.getElementById('toEmailSearch').value.length > 10000){
            showalert("failure", translate("sdp.app.common.maxlength.characters", [translate("sdp.requests.viewrequest.cc"), 10000]), "isAutoHide=true"); //No i18n
        } else {
            showalert("failure", translate("sdp.requests.fieldFormRules.invalidEmail"), "isAutoHide=true"); //No i18n
        }
        jQuery('#toEmailSearchCC').select2('open'); //No i18n
        return false;
    }

    if (document.getElementById('toEmailSearchBCC').value != null && document.getElementById('toEmailSearchBCC').value.length > 0 && !isValidEmailId(document.getElementById('toEmailSearchBCC'))) {
        if(document.getElementById('toEmailSearch').value.length > 10000){
            showalert("failure", translate("sdp.app.common.maxlength.characters", [translate("common.bcc"), 10000]), "isAutoHide=true"); //No i18n
        } else {
            showalert("failure", translate("sdp.requests.fieldFormRules.invalidEmail"), "isAutoHide=true"); //No i18n
        }
        jQuery('#toEmailSearchBCC').select2('open'); //No i18n
        return false;
    }

    // Validate length of Subject
    if(document.getElementById('emailsubject').value == undefined || document.getElementById('emailsubject').value.trim().length == 0){
        showalert("failure", translate("sdp.common.error.empty", [translate("sdp.common.subject")]), "isAutoHide=true"); //No i18n
        jQuery('#toEmailSearch').select2('open'); //No i18n
        return false;
    }
    if(document.getElementById('emailsubject').value.length > 250 ){
        showalert("failure", translate('sdp.app.common.maxlength.characters', [translate('sdp.common.subject'), 250]), "isAutoHide=true"); //No i18n
        jQuery('#emailsubject').focus();
        //focus on the subject field
        return false;
    }

    //Validate length of description/Message
    if(editor.getHTML() == undefined || editor.getHTML().trim() == ""){
        showalert("failure", translate("sdp.common.error.empty", [translate("sdp.common.description")]), "isAutoHide=true"); //No i18n
        return false;
    }

    return true
}

function send(isAPISupported) {
    if (validateReportEmailForm()) {
        url = "/CustomReportHandler.do", action = 'send_mail';//no i18n
        let param = "module=emailthisreport&to=" + encodeURIComponent(document.getElementById('toEmailSearch').value)//No I18N
                              + "&toCc=" + encodeURIComponent(document.getElementById('toEmailSearchCC').value) //No I18N
                              + "&toBcc=" + encodeURIComponent(document.getElementById('toEmailSearchBCC').value) //No I18N
                              + "&Message=" + encodeURIComponent(editor.getHTML()) //No I18N
                              + "&emailsubject=" + encodeURIComponent(document.getElementById('emailsubject').value) //No I18N
                              + "&file_type=" + encodeURIComponent(document.getElementById('file_type').value); //No I18N
        if (document.getElementById('report_id') != null) {
            param+= "&report_id=" + encodeURIComponent(document.getElementById('report_id').value); //No I18N
            param = isAPISupported ? $reports.appendPreviousConfig(param + "&reportTitle=" + encodeURIComponent(parent.previousConfig.reportName)) : param;//No I18N
        }
        else {
            param = isAPISupported ? $reports.appendPreviousConfig(param) : param;
        }

        param += "&isDownloadableLink=" + jQuery('#isDownloadableLink')[0].checked; //No i18n
        showalert("info",getMessageForKey("sdp.purchase.newpo.sendmail.sending"), "isAutoHide=false");//NO I18N
        jQuery('#mailFormSubmit').prop('disabled', true); //No i18n
        jQuery('#rldcancelMail').prop('disabled', true); //No i18n
        handleReportRequest(url, param, action);
    }
}

function sendMail(reportId, e, isAPISupported) {
    param = isAPISupported ? new Date().getTime() + $reports.setAPIFlag("&report_title=" + encodeURIComponent(parent.previousConfig.reportName)) : '&report_title=' + new Date().getTime(); // no i18n
    if (reportId != null) {
        param = "report_id=" + reportId + "&" + param; //No i18n
    }
    let dialog_options = {
        autoOpen: false,
        maximizable: true,
        height: jQuery(window).height(),
        custom_options: { slider: true },
        position: {
            right: "0px", //No I18N
            top: "0px" //No I18N
        },
        draggable: false,
        resizable: {

            directions: "w",//No I18N
            minWidth: 920

        },
        animation: {
            open: {
                className: 'zeffects--slideright', //No I18N
                duration: 300
            }
        },
        open: () => {
            toReportEmailSearch();
            zeditor({
                element: 'Message',//No I18N
                edithtml: true,
                isEnterKeyHandler: true,
                resize: true,
                toolbar: "generalToolbar"//No I18N
            });
            jQuery('#file_type').select2();
            jQuery("#mailFormSubmit").on("click", () => {
                if (jQuery("#outgoingmailserver").attr("data-isMailConfigured") === "true") {
                    send(jQuery("#mailFormSubmit").attr("data-isapisupported") === "true");
                } else {
                    showalert('warning', translate("sdp.common.mail.serverErr"), "isAutoHide=true"); //No i18n
                }
                return false;
            });
            jQuery("#rldcancelMail").on("click", () => { jQuery(reportDialogDivId).sdp_zcomponent_dialog("close") });

            jQuery('#rld-MailForm').validate({
                rules: {
                    emailsubject: {
                        required: true,
                        maxlength: 250
                    }
                },
                messages: {
                    emailsubject: {
                        required: translate("sdp.common.error.empty", [translate("sdp.common.subject")]),
                        maxlength: translate('sdp.app.common.maxlength.characters', [translate('sdp.common.subject'), 250])
                    }
                },
                errorClass: 'text-danger', //No I18n
                ignore: [],
                focusCleanup: true,
                focusInvalid: true,
                onkeyup: function (element) {
                    jQuery(element).valid(); // Trigger validation on keyup
                },
                onkeydown: function (element) {
                    setTimeout(() => {
                        jQuery(element).valid(); // Validate on keydown
                    }, 0);
                },
                onfocusout: function (element) {
                    jQuery(element).valid(); // Validate when losing focus
                },
                errorPlacement: function (error, element) {
                    error.addClass('alert alert-danger p2 fr').css({
                        position: 'relative', // No I18N
                        overflow: 'visible', // No I18N
                        width: "auto", // No I18N
                        'z-index': '100' // No I18N
                    });
                    error.insertAfter(element);
                    element.focus();
                }
            });

            if (sdp_app.IS_FILE_PROTECTION_ENABLED) {
                showPrivacyPolicyInfo('#rld-mail > .wrapscroller'); //NO I18N
            }

            if (jQuery('#mail_warning').length != 0) {
                jQuery('#mail_warning').html(translate("sdp.common.mail.serverErr"));
                jQuery('#rld-mail').addClass('disableDiv');
            }
        },
        close: () => {
            jQuery('#alertbox').remove();
        },
        title: translate('sdp.reports.sendmail')
    };
    reportDialog("/reports/sendmail.jsp?" + param, dialog_options); //No i18n
}

function saveReportAs(reportId, isAPISupported) {
    var selectedReportFolder = document.getElementById('folderId').value;
    var reportName = document.getElementById('reportName').value;

    if (trim(reportName) == '') {
        alert(getMessageForKey('sdp.report.missing.reportname'));
        return;
    }
    var ispublic = "private"; //No I18N
    if (document.getElementById('public').checked) {
        ispublic = 'public'; //No I18N
    }
    var desc = document.getElementById('desc').value;

    callLoadingIcon('reportStatus', getMessageForKey('sdp.admin.backup.settings.save.progress.msg')); //No I18N

    param = isAPISupported ? $reports.appendPreviousConfig("module=create_duplicate_report&folderId=" + selectedReportFolder + "&reportName=" + encodeURIComponent(reportName) + "&ispublic=" + encodeURIComponent(ispublic) + "&desc=" + encodeURIComponent(desc)) : // no i18n
        "module=create_duplicate_report&folderId=" + selectedReportFolder + "&reportName=" + encodeURIComponent(reportName) + "&ispublic=" + encodeURIComponent(ispublic) + "&desc=" + encodeURIComponent(desc); // no i18n

    handleReportRequest("/CustomReportHandler.do", param, 'create_duplicate_report'); //No I18N
}

function gotoReportInputPage() {
    var report_selected = false;
    var report_name = "";
    var reportTypeObj = document.getElementsByName('reportType');
    for (i = 0; i < reportTypeObj.length; i++) {
        if (reportTypeObj[i].checked == true) {
            report_name = reportTypeObj[i].value;
            report_selected = true;
            break;
        }
    }
    if (!report_selected) {
        //alert(geti18nString("sdp.reports.customReport.reporttype"));
        alert(document.getElementById("reporttype").innerHTML);
        return;
    }
    var moduleIdObj = document.getElementsByName('moduleID');
    var module_selected = false;
    for (i = 0; i < moduleIdObj.length; i++) {
        if (moduleIdObj[i].checked == true) {
            module_selected = true;
            break;
        }
    }
    if (!module_selected) {
        //alert(geti18nString("sdp.reports.customReport.selectmodule"));
        alert(document.getElementById("selectmodule").innerHTML);
        return;
    }
    if (document.getElementById('reportTitle').value == "") {
        //alert(geti18nString( "sdp.reports.customReport.reporttitlerequest" ));
        alert(document.getElementById("reporttitlerequest").innerHTML);
        return;
    }
    if (report_name == "Matrix Reports") {
        var param = "module=show_matrix_page"; //No I18N
        param += "&" + getNewReportParameters(); //No I18N
        displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true);
        handleReportRequest('/CustomReportHandler.do', param, 'input_page'); //No I18N
    } else if (report_name == "Summary Reports" || report_name == "Audit Reports" || report_name == "CIHistory Report") { //no i18n
        var moduleID;
        for (i = 0; i < moduleIdObj.length; i++) {
            if (moduleIdObj[i].checked == true) {
                moduleID = moduleIdObj[i].value;
                break;
            }
        }
        if (report_name == "Summary Reports") {
            var param = "module=show_available_subreports&moduleID=" + moduleID; //No I18N
            param += "&reportTitle=" + document.getElementById('reportTitle').value; //No I18N

            displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
            handleReportRequest("/SummaryReportHandler.do", param, 'show_available_subreports'); //No I18N
        } else if (report_name == "Audit Reports") { //no i18n
            var param = "module=auditmainpage&moduleID=" + moduleID + "&reportTitle=" + document.getElementById('reportTitle').value; //No I18N
            displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
            handleReportRequest("/AuditHistoryReport.do", param, 'show_audit_main_page'); //No I18N
        } else if (report_name == "CIHistory Report") { //no i18n
            var param = "module=CIHistoryPage&moduleID=" + moduleID + "&reportTitle=" + document.getElementById('reportTitle').value; // No I18N
            displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
            handleReportRequest("/CIHistoryReportHandler.do", param, 'ci_history_page'); //No I18N
        }
    } else {
        var param = "module=show_input_page"; //No I18N

        param += "&" + getNewReportParameters();
        displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
        handleReportRequest('/CustomReportHandler.do', param, 'input_page'); //No I18N
    }
}

//Will be invoked this method when the user clicked the previous button from summary report criteria page
function showSubReportsPage() {
    advFilterIds = [];
    advFilterIdsPrefix = [];
    var param = "module=show_available_subreports"; //No I18N
    handleReportRequest("/SummaryReportHandler.do", param, 'show_available_subreports'); //No I18N
}

function getNewReportParameters() {
    var reportTypeObj = document.getElementsByName('reportType');
    var moduleIdObj = document.getElementsByName('moduleID');

    var param = "newReport=true"; //No I18N
    var length = moduleIdObj.length;
    for (var i = 0; i < length; i++) {
        if (moduleIdObj[i].checked) {
            param += "&moduleID=" + moduleIdObj[i].value; //No I18N
        }
    }
    length = reportTypeObj.length;
    for (var i = 0; i < length; i++) {
        if (reportTypeObj[i].checked) {
            param += "&reportType=" + reportTypeObj[i].value; //No I18N
        }
    }
    //SD-7188102: Report title not URL encoded
    param += "&reportTitle=" + encodeURIComponent(document.getElementById('reportTitle').value); //No I18N

    return param;
}

function createNew() {
    parent.closeDialog();
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
    handleReportRequest("/CustomReportHandler.do", "module=start_page", 'start_page'); //No I18N
}

function getAvailableModules(reportTypeId) {
    changeImage(reportTypeId);
    handleReportRequest('/CustomReportHandler.do', "module=get_available_module&report_type=" + reportTypeId, 'get_available_module'); //No I18N
}

function changeMatrixType( matrixType ,isAPISupported)
{
    jQuery('#matrixReportType').val(matrixType);

    if (jQuery('#subtabon').attr('class') == undefined || (jQuery('#subtabon').attr('class') == 'subtabon subtabon-first' && matrixType != "simple")) {
        jQuery('#subtabon').attr('class', 'subtaboff subtabon-first');
        jQuery('#subtaboff').attr('class', 'subtabon subtabon-first');
        if( jQuery('#advanced').html() == '' )
        {
            param = "module=show_advmatrix_page";  //No I18N
            param = isAPISupported?$reports.setAPIFlag(param+"&module_id="+parent.previousConfig.moduleId):param;  //No I18N
            handleReportRequest("/CustomReportHandler.do",param, 'show_advmatrix_page');//No I18N
        }

    }
    else if(matrixType!="advanced")
    {
        jQuery('#subtabon').attr('class', 'subtabon subtabon-first');
        jQuery('#subtaboff').attr('class', 'subtaboff subtabon-first');
        if( jQuery('#simple').html() == '' )
        {
            param = "module=show_simplematrix_page"; // No I18N
            param = isAPISupported?$reports.setAPIFlag(param+"&module_id="+parent.previousConfig.moduleId):param;  //No I18N
            handleReportRequest("/CustomReportHandler.do", param, 'show_simplematrix_page');//No I18N
        }
    }
}

function openQueryEditor() {
    parent.closeDialog();
    var param = "module=show_query_editor"; //No I18N
    if (document.getElementById('querytext') != undefined) {
        param += "&query=" + encodeURIComponent(jQuery("#querytext").text()); //No I18N
    }
    handleReportRequest("/CustomReportHandler.do", param, "show_query_editor"); //No I18N
}

function goReportHome() {
    //document.location = "/CustomReportHandler.do";
    if (isMSP) {
        disableSiteFreeze();
        removeAccOnchangeinSchedule();
    }
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
    handleReportRequest("/CustomReportHandler.do", "module=change_view&filterView=all_reports", 'input_page'); //No I18N
}

function runSQLReport() {
    if (trim(document.getElementById('query').value) == "") {
        //alert(geti18nString( "sdp.reports.queryreports.queryexcep" ));
        alert(document.getElementById("queryexcep").innerHTML);
        return;
    }
    if (trim(document.getElementById('reportTitle').value) == "") {
        //alert(geti18nString( "sdp.reports.queryreports.titleexcep" ));
        alert(document.getElementById("titleexcep").innerHTML);
        return;
    }

    jQuery('#cancelqueryreport').prop('disabled', true); //No I18N
    callLoadingIcon('queryreportgenmsg', getMessageForKey('sdp.report.common.generating.message')); //No I18N

    var param = "module=run_query_editor_query"; //No I18N
    param+="&reportTitle="+encodeURIComponent(document.queryreportform.reportTitle.value);//No I18N
    param+="&query="+encodeURIComponent(document.queryreportform.query.value);//No I18N
    if(document.queryreportform.report_id != undefined){
        param+="&report_id="+encodeURIComponent(document.queryreportform.report_id.value);//No I18N
    }
    if (isMSP) {
        param += "&persistentAccountId=" + getAccountId(); //No I18N
    }
    handleReportRequest("/CustomReportHandler.do", param, 'run_query_editor'); //No I18N
}

function getDynamicTableSchema(obj) {
    var module_id = obj;
    if (module_id != -1) {
        if (module_id === '101') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=IncidentTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '8') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=ProblemTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '9') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=ChangesTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '10') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=AssetsTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '40') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=ContractsTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '50') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=PurchaseTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '20') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=ComputersTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '70') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=SoftwareTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === 'CMDB') {//No I18N
            NewWindow("/reports/report-DB-viz.jsp?tableName=CMDBTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === 'User') {//No I18N
            NewWindow("/reports/report-DB-viz.jsp?tableName=UserTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center',null,null,null,true); //No I18N
        } else if (module_id === 'Technician' ) {//No I18N
            NewWindow("/reports/report-DB-viz.jsp?tableName=TechnicianTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '4') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=ProjectsTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '3') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=TasksTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '2' || module_id === 'sdp.requests.common.worklog') {//No I18N
            NewWindow("/reports/report-DB-viz.jsp?tableName=ChargesTable", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '102') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=IncidentTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id === '200') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=SWcomplianceBySite", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (module_id == '250') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=CMDBModuleHistory", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        } else if (isMSPOrSCP && module_id == '500'){
            NewWindow("/reports/report-DB-viz.jsp?tableName=AccountContractTab",'Dynamic_table_schema','950','600','yes','center');//No I18N
        }else if(isMSPOrSCP && module_id == '600'){
            NewWindow("/reports/report-DB-viz.jsp?tableName=AccountTab",'Dynamic_table_schema','950','600','yes','center');//No I18N
        }else if(isMSPOrSCP && module_id == '700'){
            NewWindow("/reports/report-DB-viz.jsp?tableName=ContactTab",'Dynamic_table_schema','950','600','yes','center');//No I18N
		}else if(module_id === 'admin.module.releases'){ //No I18N
            NewWindow("/reports/report-DB-viz.jsp?tableName=ReleasesTab", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        }else if(module_id === 'Department'){ //No I18N
            NewWindow("/reports/report-DB-viz.jsp?tableName=DepartmentTab",'Dynamic_table_schema','950','600','yes','center');//No I18N
        }
        else if (module_id == '251') {
            NewWindow("/reports/report-DB-viz.jsp?tableName=UserDeptHistoryDetails", 'Dynamic_table_schema', '950', '600', 'yes', 'center'); //No I18N
        }
    } else {
        //alert(geti18nString( "sdp.reports.queryreports.pleaseselectmod" ));
        alert(document.getElementById("pleaseselectmod").innerHTML);
        return;
    }
}

function deleteReport(reportId) {
    parent.closeDialog();
    var param = "module=can_delete&report_id=" + reportId; //No I18N
    handleReportRequest("/CustomReportHandler.do", param, 'can_delete'); //No I18N
}

function changeViewForReports(selectTag, userId) {
    parent.closeDialog();
    if (selectTag.value == 'all_schedule_reports') {
        showScheduledReportListView();
    } else {
        if (isMSP) {
            removeAccOnchangeinSchedule();
        }
        handleReportRequest("/CustomReportHandler.do", "module=change_view&filterView=" + selectTag.value, 'input_page'); //No I18N
    }
}

/** Class syntax for storing report column details */
function ColumnDetails(column_id, display_name, data_type, order_id) {
    this.column_id = column_id;
    this.display_name = display_name;
    this.data_type = data_type;
    this.order_id = order_id;
}

function deleteFolder(folder_id) {
    if (confirm(geti18nString("sdp.reports.customReport.folderdeletemsg"))) {
        handleReportRequest("/CustomReportHandler.do", "module=delete_folder&folder_id=" + folder_id, "delete_folder"); //No I18N
    }
}

function editFolderName(folderId, e) {
    var url;
    var titleId;
    if (folderId != null) {
        url = '/CustomReportHandler.do?module=edit_folder&folderId=' + folderId; //No I18N
        titleId = 'RenameFolderTitle'; //No I18N
    } else {
        url = '/CustomReportHandler.do?module=edit_folder'; //No I18N
        titleId = 'AddFolderTitle' //No I18N
    }
    jQuery("#folder-dialog").load(url).dialog({
        width: 350,
        title: document.getElementById(titleId).innerHTML,
        position: {
            my: 'left top', //No I18N
            at: 'bottom right', //No I18N
            of: event
        },
        open: function() {
            jQuery('body').addClass('pos-rel'); //No I18N
        },
        close: function() {
            jQuery('body').removeClass('pos-rel'); //No I18N
        }
    });
}

function saveFolderDetails() {
    var $folder_dialog = jQuery("#folder-dialog");
    var folderId = $folder_dialog.find("#edit_folderId").val();
    var folderName = $folder_dialog.find("#edit_folderName").val();
    var folderDesc = encodeURIComponent($folder_dialog.find("#edit_folderDesc").val());
    if (folderName != null) {
        folderName = trim(folderName);
    }

    folderName = encodeURIComponent(folderName);

    if (folderName == '') {
        showalert('failure', getMessageForKey("sdp.reports.customReport.savefolder.emptyfolder"), 'closeOnEscKey=yes,width=500,height=80'); //No I18N
        return false;
    }
    $folder_dialog.dialog('destroy').html("");
    if (folderId != "null") {
        handleReportRequest("/CustomReportHandler.do", "module=update_folder&folderId=" + folderId + "&folderName=" + folderName + "&folderDesc=" + folderDesc, "update_folder"); //No I18N
    } else {
        handleReportRequest("/CustomReportHandler.do", "module=update_folder&folderName=" + folderName + "&folderDesc=" + folderDesc, "update_folder"); //No I18N
    }
}

/*
 * Function for constructing parameter name & value(s) for the requested form
 * @param formName - request parameter(s) to be constructed for the form name
 * @return this will return the chain of param name & value pair
 */
function constructFilterParameters(formName) {
    var params = "";
    try {
        var elements_list = formName.elements;
        var length = elements_list.length;
        var element_type;
        for (i = 0; i < length; i++) {
            element_type = elements_list[i].type;
            if (element_type == 'textarea' || element_type == 'text' || element_type == 'password') {
                params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].value); //No I18N
            } else if (element_type == 'checkbox' && elements_list[i].checked) {
                params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].value); //No I18N
            } else if (element_type == 'select-one') { //no i18n
                if (elements_list[i].name.indexOf("filterColumn") >= 0) {
                    params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].value); //No I18N
                } else {
                    params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].value); //No I18N
                }
            } else if (element_type == 'select-multiple') { //no i18n
                var size = elements_list[i].options.length;
                for (j = 0; j < size; j++) {
                    if (elements_list[i].options[j].selected) {
                        params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].options[j].value); //No I18N
                    }
                }
            } else if (element_type == 'radio') { //no i18n
                if (elements_list[i].checked) {
                    params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].value); //No I18N
                }
            }
        }
    } catch (e) {
        //Technical error & called in lot of places so no need to i18n this line
        alert("Error while constructing request parameter : " + e.message); //No I18N
    }
    return params;
}

/**
 * Function to cenvert the long value into date format
 * @param longDate - containing date long value
 */
function getDate(longDate) {
    var browser = navigator.appName;
    var dateObj = new Date();
    if (longDate != '' && longDate != null && longDate > 0) {
        dateObj.setTime(longDate);
    }
    var year;
    if (browser == "Netscape" || browser == "Microsoft Internet Explorer") {
        if (document.all && !document.addEventListener) {
            year = dateObj.getYear();
        } else {
            year = dateObj.getYear() + 1900;
        }
    } else {
        year = dateObj.getYear();
    }
    var month = dateObj.getMonth() + 1;
    var date = dateObj.getDate();
    monthstr = (month < 10 ? "0" + month : month); //No I18N
    datestr = (date < 10 ? "0" + date : date); //No I18N
    return year + "-" + monthstr + "-" + datestr; //No I18N
}

/**
 * Function used in ReportColumnDataSelector.jsp
 */
function addToValueBox(index, dataType) {
    var seletedItemList;
    var criteriaName = document.getElementById('select_criteria_' + index);
    seletedItemList = document.getElementById('criteriaValue_' + index);

    var itemList = document.getElementById('itemList');

    if (dataType == "java.sql.Time") {
        var hours = trim(document.getElementById('TIMESPENTHH').value);
        var minutes = trim(document.getElementById('TIMESPENTMM').value);
        if (validatePickValues(hours, dataType) == "Y" || validatePickValues(minutes, dataType) == "Y") {
            //alert( "sdp.reports.errmsg.numberformatexception" );
            alert(document.getElementById("numberformatexception").innerHTML);
            return;
        }
        if (trim(hours) == "" && trim(minutes) == "") {
            //alert("sdp.reportcols.warnmessage.enterhhmm");
            alert(document.getElementById("enterhhmm").innerHTML);
            return;
        } else {
            seletedItemList.value = hours + " : " + minutes; //No I18N
        }
    } else if (dataType == "javax.lang.Memory") { //no i18n
        if (trim(itemList.value) == "") {
            itemList.value = 0;
        }

        if (itemList.value.indexOf("MB") == -1) {
            seletedItemList.value = itemList.value + " MB"; //No I18N
        } else {
            seletedItemList.value = itemList.value;
        }
    } else {
        if (trim(itemList.value) == "") {
            //alert("sdp.reports.errmsg.invalidtimedateexception");
            alert(document.getElementById("numberformatexception").innerHTML);
            return;
        }
        if (validatePickValues(itemList.value, dataType) != "Y") {
            seletedItemList.value = itemList.value;
        } else {
            //alert( "sdp.reports.errmsg.numberformatexception" );
            alert(document.getElementById("numberformatexception").innerHTML);
            return;
        }
    }
    parent.closeDialog();
}

function validatePickValues(value, dataType) {
    if (dataType == "java.lang.Double") {
        if (!isDouble(value)) {
            value = "Y"; //No I18N
        }
    } else if (dataType == "java.lang.Long" || dataType == "java.lang.Integer" || dataType == "javax.lang.Memory" || dataType == "java.sql.Time") { //no i18n
        if (!isInteger(value)) {
            value = "Y"; //No I18N
        }
    }
    return value;
}

function isDouble(str) {
    var objRegExp = /^\d\d*(\.\d\d*)?$/;
    return objRegExp.test(str);
}

function showSummaryCriteriaPage() {
    var selectedSubReports = document.getElementById('displaySubReportList');
    var len = selectedSubReports.length;
    if (len == 0) {
        //alert("sdp.reports.customReport.selectcolserr");
        alert(document.getElementById("selectcolserr").innerHTML);
        return false;
    }
    if (len > 0) {
        var param = "module=show_criteria_page"; //No I18N
        for (i = 0; i < len; i++) {
            param += "&displaySubReportList=" + selectedSubReports.options[i].value; //No I18N
        }
        displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
        handleReportRequest("/SummaryReportHandler.do", param, 'show_summary_filter_page'); //No I18N
    }
    return false;
}
//SD-39779: Missing date fields in summary report filter page
function openSummaryReportPage()
{
    if( document.reportfilter.dateFilterColumn != undefined )
    {
        if(document.reportfilter.dateFilterColumn.value != '-1'){
            var size = document.reportfilter.preDateFilterType.length;
            var value= document.reportfilter.preDateFilterType[0].value;
            for(index=0;index<size;index++){
                if(document.reportfilter.preDateFilterType[index].checked) {
                    value = document.reportfilter.preDateFilterType[index].value;
                }
            }
            if(value == "customized") {
                //checking date values..
                var temp = document.reportfilter.preFromDate.value.split("-");
                var temp2 = document.reportfilter.preToDate.value.split("-");
                var startTimeAsLong = Date.parse(temp[0]+"/"+temp[1]+"/"+temp[2]);
                var endTimeAsLong = Date.parse(temp2[0]+"/"+temp2[1]+"/"+temp2[2]);
                if(startTimeAsLong > endTimeAsLong){
                    alert(getMessageForKey("sdp.contract.addNew.jsDateDiffErr"));//NO I18N
                    return;
                }
            }
        }
    }
    runSummaryReport();
}
//Function to run the summary report
function runSummaryReport(reportId) {
    parent.closeDialog();
    var siteid = null;
    if (document.getElementById('account') != undefined) //No I18N
    {
        siteid = document.getElementById('account').value; //No I18N
    }
    if (reportId != undefined) {
        var param = "module=generate_report&report_id=" + reportId; //No I18N
        if (siteid != null) {
            param += "&site=" + siteid; //No I18N
        }
        displayFadeMsg(getMessageForKey("sdp.reports.common.generating.message"), true); //No I18N
        if(isMSP){
            enableSiteFreeze();
        }
        handleReportRequest("/SummaryReportHandler.do", param, 'show_report_page'); //No I18N
    } else {
        var param = "module=show_report_page"; //No I18N
        if (siteid != null) {
            param += "&site=" + siteid; //No I18N
        }
        if (document.reportfilter != undefined) {
            param += constructParameters(document.reportfilter);
        }

        jQuery('#exitsummaryreportheader').prop('disabled', true); //No I18N
        jQuery('#exitsummaryreportfooter').prop('disabled', true); //No I18N
        displayFadeMsg(getMessageForKey("sdp.reports.common.generating.message"), true); //No I18N
        if(isMSP){
            enableSiteFreeze();
        }
        handleReportRequest("/SummaryReportHandler.do", param, 'show_report_page'); //No I18N
    }
}

function runAuditHistoryReport(reportId) {
    parent.closeDialog();
    var accountid = null;
    var siteid = null;

    if (isMSP) {
        accountid = getAccountId();
        siteid = document.getElementById('account').value; // No i18n
    }

    if (reportId == null) {
        var historyReports = document.getElementsByName('historyReport');
        var len = historyReports.length;
        var flag = true;
        var historyreport = null;
        for (i = 0; i < len; i++) {
            if (historyReports[i].checked) {
                historyreport = historyReports[i].value;
                flag = false;
                break;
            }
        }
        if (flag) {
            alert(getMessageForKey('sdp.report.select.auditreport'));
            return false;
        }
        //date checking..
        if (document.reportfilter.preDateFilterType[1].checked) {
            if (document.reportfilter.preFromDate.value == '') {
                alert(getMessageForKey('sdp.reports.customReport.FromDate.Empty')); //No I18N
                return false;
            } else if (document.reportfilter.preToDate.value == '') {
                alert(getMessageForKey('sdp.reports.customReport.ToDate.Empty')); //No I18N
                return false;
            }
        }
        var param = "module=show_report_page&historyReport=" + historyreport; //No I18N

        if (document.reportfilter != undefined) {
            param += constructParameters(document.reportfilter);
        }
        if (isMSP && accountid != null) {
            param += "&persistentAccountId=" + accountid; //No I18N
        }
        if (siteid != null) {
            param += "&site=" + siteid; //No I18N
        }
        displayFadeMsg(getMessageForKey("sdp.reports.common.generating.message"), true); //No I18N
        jQuery('#exitauditreportheader').prop('disabled', true); //No I18N
        jQuery('#exitauditreportfooter').prop('disabled', true); //No I18N
        if(isMSP){
            enableSiteFreeze();
        }
        handleReportRequest("/AuditHistoryReport.do", param, 'show_report_page'); //No I18N
    } else {
        var param = "module=generate_report&report_id=" + reportId; //No I18N
        displayFadeMsg(getMessageForKey("sdp.reports.common.generating.message"), true); //No I18N
        if(isMSP){
            if (siteid != null) {
                param += "&site=" + siteid; //No I18N
            }
            enableSiteFreeze();
        }
        handleReportRequest("/AuditHistoryReport.do", param, 'show_report_page'); //No I18N
    }
}

function runCIHistoryReport(reportId,moduleId) {
    parent.closeDialog();
    if (reportId == null) {
        var historyReport = moduleId == 250 ? 1 : 2;
        if (document.reportfilter.preDateFilterType[1].checked) {
            if (document.reportfilter.preFromDate.value == '') {
                alert(getMessageForKey('sdp.reports.customReport.FromDate.Empty')); //No I18N
                return false;
            } else if (document.reportfilter.preToDate.value == '') {
                alert(getMessageForKey('sdp.reports.customReport.ToDate.Empty')); //No I18N
                return false;
            }
        }
        var param = "module=show_report_page&historyReport=" + historyReport; //No I18N
        if (document.reportfilter != undefined) {
            param += constructParameters(document.reportfilter);
        }
        displayFadeMsg(getMessageForKey("sdp.reports.common.generating.message"), true); //No I18N
        jQuery('#exitcihistoryreportheader').prop('disabled', true); //No I18N
        jQuery('#exitcihistoryreportfooter').prop('disabled', true); //No I18N
        handleReportRequest("/CIHistoryReportHandler.do", param, 'show_report_page'); //No I18N
    } else {
        var param = "module=generate_report&report_id=" + reportId; //No I18N
        displayFadeMsg(getMessageForKey("sdp.reports.common.generating.message"), true); //No I18N
        handleReportRequest("/CIHistoryReportHandler.do", param, 'show_report_page'); //No I18N
    }
}


function editAuditReport(reportId) {
    var param = "module=edit_report"; //No I18N
    if (reportId != "null" && reportId != null) {
        param += "&report_id=" + encodeURIComponent(reportId); //No I18N
    }
    if(isMSP){
       disableSiteFreeze();
    }
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
    handleReportRequest("/AuditHistoryReport.do", param, 'show_audit_main_page'); //No I18N
}

function editCIHistoryReportFrmFldr(reportId) {
    var param = "module=edit_report"; //No I18N
    if (reportId != "null" && reportId != null) {
        param += "&report_id=" + encodeURIComponent(reportId); //No I18N
    }
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
    handleReportRequest("/CIHistoryReportHandler.do", param, 'ci_history_page'); //No I18N
}

function editCIHistoryReport(reportType) {
    jQuery('#exitcihistoryreportheader').prop('disabled', false); //No I18N
    jQuery('#exitcihistoryreportfooter').prop('disabled', false); //No I18N
    document.getElementById('report_input_pages').style.display = "block"; // No I18N
    //new Effect.BlindDown('report_input_pages');
    document.getElementById('report_result').innerHTML = ""; //No I18N
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true);//No I18N
}


function saveAuditReport(e) {
    showURLInDialog('AuditHistoryReport.do?module=save_report', 'closeButton=yes,position=relative,width=580,left=i-200'); //No I18N
}

function saveCIHistoryReport(e) {
    showURLInDialog('CIHistoryReportHandler.do?module=save_report', 'closeButton=yes,position=relative,width=580,left=i-200'); //No I18N
}

function scheduleAuditReport(reportId) {
    //document.location = "/ReportSchedule.do?mode=new&reportName=" + reportId;
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
    params = "mode=new&report_id=" + reportId; //No I18N
    handleReportRequest("/ReportSchedule.do", params, 'start_page'); //No I18N
}

function openScheduleWindow() {
    parent.closeDialog();
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
    if (isMSP) {
        removeAccOnchangeinSchedule();
    }
    handleReportRequest("/ReportSchedule.do", "mode=new", 'start_page'); //No I18N
}

initializeScheduleAPI = (taskId) => {
    let options = {"repeats": {  //No I18N
                "show": true,    //No I18N
                "mandatory": true,   //No I18N
                "display_name": translate("schedule.repeats"), //No I18N
                "default_value": "once", //No I18N
                "values": [  //No I18N
                    {"id": "once", "text": translate("common.once")},  //No I18N
                    {"id": "daily", "text": translate("common.daily")},    //No I18N
                    {"id": "weekly", "text": translate("common.weekly")},  //No I18N
                    {"id": "monthly", "text": translate("sdp.inventory.detailAsset.DepreciationMonthly")},     //No I18N
                    {"id": "yearly", "text": translate("common.yearly")}, //No I18N
                    {"id": "hours", "text": translate("common.hourly")},   //No I18N
                    {"id": "minutes", "text": translate("sdp.change.sla.minutes")} //No I18N
                ]
                },
                "run_every": {   //No I18N
                "on_the": {  //No I18N
                    "week": {   //No I18N
                        "values": [    //No I18N
                            {"id":"1", "text": translate("sdp.common.first")},    //No I18N
                            {"id":"2", "text": translate("common.second")},   //No I18N
                            {"id":"3", "text": translate("common.third")},    //No I18N
                            {"id":"4", "text": translate("common.fourth")},   //No I18N
                            {"id":"-1", "text": translate("sdp.common.last")}  //No I18N
                        ]
                    }
                }
            },"to": {"show": false},"all_day": {"show": false}}; //No I18N
            if(taskId != null ){
                options.mode = "edit";//NO I18N
            }
            else{
                options.mode = "new";//NO I18N
            }
            reportScheduler = new scheduleAPI("#schedule_report_api", options); //NO I18N
            if(taskId != null){
                updateScheduleAPI(taskId)
            }

}

updateScheduleAPI = (taskId) => {
    sdpAjax({
    			url:"/api/v3/scheduled_reports/"+encodeURIComponent(taskId), //NO I18N
    			success: function(res){
    				let schedule_info= jQuery.extend(true, {} ,res.scheduled_report.scheduler);
                    reportScheduler.update(schedule_info,"edit");//NO I18N
    				}
    		})
}



function scanchoice(toShow, toHide1, toHide2, toHide3, choice) {
    document.getElementById(toHide1).style.display = "none"; //No I18N
    document.getElementById(toHide2).style.display = "none"; //No I18N
    document.getElementById(toHide3).style.display = "none"; //No I18N
    //document.getElementById(toHide4).style.display ="none";//No I18N
    document.getElementById(toShow).style.display = "block"; //No I18N

    document.getElementById("scanchoice1").className = "scanSchOFFchoice"; //No I18N
    document.getElementById("daily").className = "scanSchOFFchoice"; //No I18N
    document.getElementById("weekly").className = "scanSchOFFchoice"; //No I18N
    document.getElementById("monthly").className = "scanSchOFFchoice"; //No I18N
    document.getElementById(choice).className = "scanSchONchoice"; //No I18N
}

//Function to check/uncheck everyDay
function checkEveryDay() {
    var selectedDays = document.getElementsByName('selectedDays');
    var toBeChecked = true;
    for (var j = 0; j < selectedDays.length; j++) {
        if (selectedDays[j].checked == false) {
            toBeChecked = false;
        }
    }
    document.getElementById('everyDay').checked = toBeChecked;
}

//For Every Month Groups Checkbox
function checkMonths() {
    var everyMonth = document.getElementById('everyMonth');

    var selectedMonths = document.getElementsByName('selectedMonths');

    if (everyMonth.checked) {
        for (var j = 0; j < selectedMonths.length; j++) {
            selectedMonths[j].checked = true;
        }
    } else {
        for (var j = 0; j < selectedMonths.length; j++) {
            selectedMonths[j].checked = false;
        }
    }
}

//For EveryDay Groups Checkbox
function checkDays() {
    var everyDay = document.getElementById("everyDay");
    var selectedDays = document.getElementsByName("selectedDays");

    if (everyDay.checked) {
        for (var j = 0; j < selectedDays.length; j++) {
            selectedDays[j].checked = true;
        }
    } else {
        for (var j = 0; j < selectedDays.length; j++) {
            selectedDays[j].checked = false;
        }
    }
}

//Function to check/uncheck every month
function checkEveryMonth() {
    var selectedMonths = document.getElementsByName("selectedMonths");

    var toBeChecked = true;
    for (var j = 0; j < selectedMonths.length; j++) {
        if (selectedMonths[j].checked == false) {
            toBeChecked = false;
        }
    }
    document.getElementById('everyMonth').checked = toBeChecked;
}

validateReportSchedule = () => {
    let schedule_updated_data = reportScheduler.getData();
    if(schedule_updated_data.hasOwnProperty("ischanged")){
        delete schedule_updated_data["ischanged"];
    }
    if(!schedule_updated_data){
        return false;
    }

    let current_Time = +new Date();
    let startTimeValue = schedule_updated_data.start_time.value;
    let repeatEndsValue;
    if( jQuery(".repeat_ends").is(":visible") && schedule_updated_data.repeat_end.hasOwnProperty('on')){
        repeatEndsValue = schedule_updated_data.repeat_end.on.value;
        if(repeatEndsValue!='undefined' && repeatEndsValue < startTimeValue)
            return false;
    }
    if ( schedule_updated_data.frequency == 'once' && startTimeValue < current_Time){
        showalert('failure', translate("sdp.adschedule.time.greater"), "isAutoHide=true");	//NO I18N
        return false;
    }
    const reportTo = document.querySelectorAll('.reportTo:checked'); //No I18N
    let formsEnabled = [];
    for(let i=0; i<reportTo.length;i++){
        formsEnabled.push(reportTo[i].value);
    }

    if (document.getElementById('reportName').value == "") {
        showalert('failure', translate(document.getElementById("selectreporttoschedule").innerHTML), "isAutoHide=true");	//NO I18N
        return false;
    }

    if(formsEnabled.length == 0 || formsEnabled == null){
        showalert('failure', translate("reports.schedule.export.type.alert"), "isAutoHide=true");	//NO I18N
        return false;
    }
    if(formsEnabled.indexOf("LocationForm")!=-1){ //No I18N
        var path = document.getElementById('scheduleLocation').value;
        if(!checkIfAttachPathAccessible(path))         {
            return false;
        }
    }

    if(formsEnabled.indexOf("EmailForm")!=-1){
    if (!isValidEmailId(document.getElementById('toEmailSearch'))) {
        return false;
    }

    let toEmailSearchCCValue = document.getElementById('toEmailSearchCC');
    if(toEmailSearchCCValue.value != "" && !isValidEmailId(toEmailSearchCCValue)){
        return false;
    }

    let toEmailSearchBCCValue = document.getElementById('toEmailSearchBCC');
    if(toEmailSearchBCCValue.value != "" && !isValidEmailId(toEmailSearchBCCValue)){
        return false;
    }

    // Subject and messages were made mandatory for new schedule report
    if(jQuery("#subject").val().length == 0){
        jQuery("#subject").focus();
        showalert('failure', translate("reports.schedule.nosubject"), "isAutoHide=true");	//NO I18N
        return false;
    }
    if(editor.getHTML() != null && editor.getHTML() == ""){
        jQuery("#ScheduleReportDesc").focus();
        showalert('failure', translate("reports.schedule.nomessage"), "isAutoHide=true");	//NO I18N
        return false;
    }
    }


    let param = ""; //No I18N

    //for setting the mode dynamically..
    let mode111 = document.getElementById("mode111");
    if (mode111 != undefined && mode111.value != null) {
        param += "mode=" + mode111.value; //No I18N
        let task_id11 = document.getElementById("task_id11");
        if (task_id11 != undefined && task_id11.value != null) {
            param += "&task_id=" + encodeURIComponent(task_id11.value); //No I18N
        }
    } else {
        param += "mode=save"; //No I18N
    }

    param += $reports.constructScheduleParameters(document.schedule_details);

    if(formsEnabled.indexOf("LocationForm")!=-1){
        param += $reports.constructScheduleParameters(document.LocationForm);
    }
    if(formsEnabled.indexOf("EmailForm")!=-1){
        param += $reports.constructScheduleParameters(document.EmailForm);
    }

    if(sdpToJSON(schedule_updated_data) !== sdpToJSON(reportScheduler.update_data)){
        param += "&schedule_api_json=" + sdpToJSON(schedule_updated_data);//No I18N
    }

    callLoadingIcon('savereportschedule', getMessageForKey('sdp.report.schedule.settings.saving.msg')); //No I18N
    handleReportRequest("/ReportSchedule.do", param, 'save_schedule'); //No I18N
}

function getCurLongDate() {
    var cur_date = new Date();
    var dt = new Date();
    dt.setYear(cur_date.getFullYear());
    dt.setMonth(cur_date.getMonth());
    dt.setDate(cur_date.getDate());
    dt.setHours(cur_date.getHours());
    dt.setMinutes(cur_date.getMinutes());
    return dt.getTime();
}

function showScheduledReportListView() {
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
    if (isMSP) {
        var displayElement = document.getElementById("__persistentAccountId__select");
        jQuery(displayElement).on("select2-selected",accBasedScheduleList); //No I18N
    }
    handleReportRequest("/ReportSchedule.do", "", 'start_page'); //No I18N
}

function plusMinus(tdTagid) {
    var tdobj = document.getElementById(tdTagid);
    if (tdobj.style.display == 'none') {
        document.getElementById(tdTagid + "src").src = "/images/show-plus.gif"; //No I18N
    } else {
        document.getElementById(tdTagid + "src").src = "/images/hide-minus.gif"; //No I18N
    }
}

function showTooltip(referenceId) {
    var nodeId = referenceId;
    var displayText;
    var controls;
    var contentdivid = "content_" + referenceId; //No I18N

    displayText = '<div style="background:#FFFFCC; border:1px #C0C0C0 solid;">' + document.getElementById(contentdivid).innerHTML + '&nbsp;</div>'; //No I18N
    if (parent.sdp_user.DIRECTION == "RTL") {
        controls = "position=relative,top=20, left=-150,closeButton=no,srcElement=tooltip" + referenceId; //No I18N
    } else {
        controls = "position=relative,top=20, left=90,closeButton=no,srcElement=tooltip" + referenceId; //No I18N
    }
    showDialog(displayText, controls);
}

function openFolder(folderId) {
    if(isMSP){
        disableSiteFreeze();
    }
    if (folderId != "undefined" && folderId != "null" && folderId != null) {
        var params = "module=change_view&filterView=all_reports&folder_id=" + encodeURIComponent(folderId); //No I18N
        displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true); //No I18N
        handleReportRequest("/CustomReportHandler.do", params, 'input_page'); //No I18N
    } else {

        handleReportRequest("/CustomReportHandler.do", "module=change_view&filterView=all_reports", 'input_page'); //No I18N
    }
}

function validateEMailIDs(varEMail) {
    email = trimAll(varEMail.value);
    if (email == "" || email == null) {
        showalert('failure', translate("sdp.emailcheck.invalidmailjserror"), "isAutoHide=true,delay=4,closeOnEscKey=yes");	//NO I18N
        varEMail.value = email;
        varEMail.focus();
        return false;
    }
    if (email.indexOf(";") > 0) {
        email = email.replace(/\;/g, ","); //No I18N
    }
    var mailids = email.split(",");
    for (var i = 0; i < mailids.length; i++) {
        var result = emailCheckDuplicate(trimAll(mailids[i]));
        if (!result) {
            //alert(document.getElementById('enteremail').value);
            varEMail.value = email;
            varEMail.focus();
            return false;
        }
    }
    varEMail.value = email;
    return true;
}

var leading = /^\s*/g;
var trailing = /\s*$/g;

function emailCheckDuplicate(email) {
    var str = email;
    if (str == "" || !validateEmailValue(str)) {
        showalert('failure', translate("sdp.common.notify.invalidemailjserror", [encodeHTML(email)]), "isAutoHide=true");	//NO I18N
        return false;
    }

    return true;
}

validateEmailValue = (str) => {
    leadingremoved = str.replace(leading, ""); //No I18N
    str = leadingremoved.replace(trailing, ""); //No I18N
    if (str.length > 0) {
        var posadr1 = 0;
        var posdot = str.indexOf("."); //No I18N
        var posadr = str.indexOf("@"); //No I18N
        posadr1 = str.lastIndexOf("@"); //No I18N
        //if ( (posdot < 0) || (posadr < 0) || (posadr1 != posadr) )
        var posdot1 = str.lastIndexOf("."); //No I18N
        if ((posdot < 0) || (posadr < 0) || (posadr1 != posadr) || (posdot1 < posadr1)) {
            return false;
        }
    }
    //sd-26788 Unable to reply to a request containing an E-Mail address starting with an underscore
    var j = str.length;
    var strobj = new String(str);
    if (strobj.charAt(j - 1) == "." || strobj.charAt(0) == "@" || strobj.charAt(j - 1) == "@" || strobj.charAt(0) == "." || strobj.charAt(0) == "-" || strobj.charAt(j - 1) == "-" || strobj.charAt(j - 1) == "_" || strobj.charAt(j - 2) == "." || strobj.charAt(j - 2) == "-" || strobj.charAt(j - 2) == "_") {
        return false;
    }
    return true;
}

var calDialog;

function closeCalDialog(callBackFunc) {
    if (jQuery(calDialog).length > 0 && (document.getElementById(calDialog.replace(/#/g,'')).getAttribute("data-caltype").indexOf("field") == -1)) {
        jQuery(calDialog).remove();
        if (typeof callBackFunc != "undefined")	callBackFunc();
    }
    if (document.getElementById('_CUSTOMALERTFRAME') != null) {
        document.getElementById("_CUSTOMALERTFRAME").src = '/framework/html/blank.html'; //No I18N
    }
}

var requestObject;
var ajax_request_id;
/*
 * Function for calling ajax request
 * @param url - request URL
 * @param params - request parameter(s)
 * @param requestID - to identify the ajax request
 * author Murugesan K
 */
function handleReportRequest(url, params, requestID) {
    ajax_request_id = requestID;
    requestObject = getXMLHttpRequest();
    if (requestObject) {
        try {
            requestObject.open("POST", url, true); //No I18N
            requestObject.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8"); //No I18N

            requestObject.onreadystatechange = updateReportRequest;
            requestObject.send(params);
        } catch (e) {
            alert("Error while sending the request : " + e.message); //No I18N
        }
    }
}

function updateSelectedModuleId(moduleId, childId, firstParentId) {
    if (!document.getElementById('_' + firstParentId).disabled) {
        document.getElementById('_' + firstParentId).value = moduleId; //No I18N
        document.getElementById('_' + firstParentId).checked = true; //No I18N
    }
    document.getElementById('displayValue_' + childId).innerHTML = document.getElementById('subModule_' + moduleId).innerHTML; //No I18N
}

function resetToFilterBy(moduleId, childId, firstParentId, filterByValue) {
    if (!document.getElementById('_' + firstParentId).disabled) {
        document.getElementById('_' + firstParentId).value = moduleId; //No I18N
        document.getElementById('_' + firstParentId).checked = true; //No I18N
    }
    document.getElementById('displayValue_' + childId).innerHTML = filterByValue; //No I18N
}

/*
 * Function for handling ajax response
 * This function will invoke the handleSuccessRequest function if the ajax request success else it will
 * invoke the handleFailureRequest
 * User(s) have to implement these functions and it will give the two parameter(s) one will contain respose object
 * and other will contain you ajax request identification number
 * @author Murugesan K
 */
function updateReportRequest() {
    // only if req shows "loaded"
    try {
        if (requestObject != undefined && requestObject.readyState == 4) {
            if (requestObject.responseText.indexOf("parent.window.open('/jsp/AuthError.jsp?module=Error', '_self');") >= 0) {
                handleFailureRequest(requestObject, ajax_request_id);
                //fix: response text is retained later which causes unnecessary popups
                requestObject = undefined;
            } else if (requestObject.status == 200) {
                handleSuccessRequest(requestObject, ajax_request_id);
            } else {
                handleFailureRequest(requestObject, ajax_request_id);

                //fix: response text is retained later which causes unnecessary popups
                requestObject = undefined;
            }
        }
    } catch (e) {
        alert("Error while fetching ajax response : " + e.message); //No I18N
    }
    initTooltip('#Right-Section'); //No I18N
}

/*
 * SD-39275, Fuction for query_editor.jspf, used for the getting the link of forums and opens in new tab.
 * elem - element user chooses , searchStringElement - Search query string to remove after changing the forum.
 */

function open_link(elem, searchStringElement) {
    var searchString_prop = getMessageForKey("sdp.reports.forumsquery.choose");
    if (searchStringElement.options[0].title == searchString_prop) {
        searchStringElement.remove(0);
    }
    return appendDID(elem.title, true);
}

function browseSDPSampleQueries() {
    parent.closeDialog();
    var param = "module=browse_sample_reports"; //No I18N
    if (document.getElementById('querytext') != undefined) {
        param += "&query=" + encodeURIComponent(document.getElementById('querytext').innerHTML); //No I18N
    }
    handleReportRequest("/CustomReportHandler.do", param, "browse_sample_reports"); //No I18N
    loadScriptForSampleReports();
}

function openSampleQueryInEditor() {
    var queryId = "default_report_query_sql"; //No I18N
    var param = "module=show_query_editor"; //No I18N
    if (document.getElementById(queryId) != undefined) {
        var defaultQuery = document.getElementById(queryId).innerHTML;
        defaultQuery = replaceAll(defaultQuery, "<%--No I18N--%>", ""); //No i18N

        param += "&query=" + encodeURIComponent(document.getElementById(queryId).innerText); //No I18N
    }
    handleReportRequest("/CustomReportHandler.do", param, "show_query_editor"); //No I18N
}

function loadScriptForSampleReports() {
    if (window.jQuery != null) {
        jQuery('.query-sample-headertxt').on('click', function() {
            jQuery('.query-sample-headertxt').removeClass('query-sample-headertxt-active');
            jQuery('.query-sample-headertxt-inner').hide();
            jQuery(this).next().slideToggle(100);
            jQuery(this).addClass('query-sample-headertxt-active');
        });
    }
}

function toggleQueryHeader(ele) {
    jQuery('.query-sample-headertxt').removeClass('query-sample-headertxt-active');
    jQuery('.query-sample-headertxt-inner').hide();
    jQuery(ele).next().slideToggle(100);
    jQuery(ele).addClass('query-sample-headertxt-active');
}

function replaceAll(txt, replace, with_this) {
    return txt.replace(new RegExp(replace, 'g'), with_this);
}

function getReportQuery(id) {
    var newUrl = '/servlet/AJaxServlet'; //No i18N
    var params = 'reportID=' + id + '&'; //No i18N
    params = params + 'action=getDefaultReportQuery&'; //No i18N
    //params = params + 'fromDate='+fromDate+'&';//No i18N
    //params = params + 'toDate='+toDate;//No i18N
    //sdlog("params",params);
    jQuery.ajax({
        url: newUrl,
        type: 'post', //No I18N
        data: params,
        success: function(response){
            copyReportQuery(response);
        }
    });
}


function copyReportQuery(xmlresponse) {
    this.jQuery('#default_report_query_sql').get(0).innerHTML = xmlresponse; //No i18N
    openSampleQueryInEditor();
}

//the below variables are used in MSP
var fillSiteBox = true;
var isBillReport = false;
function addMSPAccountCriteria(action) {
    if(!isMSPOrSCP){
        return;
    }
    if (action == 'edit_report_page' || action == 'edit_qreport' || action == 'edit_report_page' || action == 'edit_qreport' || action == 'show_summary_filter_page' || action == 'show_audit_main_page' || action == 'input_page' || action == 'start_page' || action == 'show_available_subreports') {

        if(fillSiteBox)
		{
		var displayElement = document.getElementById("__persistentAccountId__select");    //No I18N
            if(displayElement != null && displayElement!=undefined){
        //Event.observe(displayElement,'change',fillSitesForMSP);         //No I18N
        fillSitesForMSP();
            }
        } else { //This will be execute for generate bill
            doGenerateBillWork();
        }
    } else if ((action=="show_report_page" || action=="page_navigation") && isBillReport) { //No i18n
        doBillPageWork();
    }
}

function fillSitesForMSP() {
  if(!isMSPOrSCP){
    return;
  }
  if(sdp_user.USERTYPE == "Technician"){
    __persistentAccountId__change__event();
  }
  else{
    loadSitesForRequesters();
  }
}
function addWidget(reportId, isAPISupported) {
    param = "module=addChartAsWidget&report_id=" + reportId; //no i18n
    param = isAPISupported ? $reports.setAPIFlag(param + "&report_title=" + encodeURIComponent(parent.previousConfig.reportTitle)) : param;// no i18n
    showURLInDialog("/CustomReportHandler.do?" + param + "&" + new Date().getTime(), 'closeButton=yes,position=relative,width=500,left=-200,title=' + getMessageForKey('sdp.reports.customReport.addtodashboard') + ''); //No I18N
}

function editWidget(widgetId, reportId) {
    showURLInDialog("/CustomReportHandler.do?module=addChartAsWidget&report_id=" + reportId + "&widget_id=" + widgetId + "&" + new Date().getTime(), 'closeButton=yes,position=relative,width=500,left=-200,title=' + getMessageForKey('sdp.reports.customReport.editdashboard.settings') + ''); //No I18N

}

function makeAsWidget() {
    var param = "module=makeAsWidget&widgetName=" + encodeURIComponent(document.getElementById('widgetName').value) + "&widgetDesc=" + encodeURIComponent(document.getElementById('widgetDesc').value) + "&dashboardTab=" + encodeURIComponent(document.getElementById('dashboardTab').value) + "&ispublic=" + getReportWidgetType() + "&report_id=" + encodeURIComponent(document.getElementById('report_id').value); //No I18N
    //callLoadingIcon('widgetLoadingDisplay', getMessageForKey('sdp.admin.ldap.import.error'));//No I18N

    handleReportRequest("/CustomReportHandler.do", param, 'makeAsWidget'); //No I18N
}

function updateWidgetSettings() {
    var dashboardTab = document.getElementById('dashboardTab').value;
    if(dashboardTab=='') {
        showalert('failure', translate("dashboard.tab.select"), 'isAutoHide=false'); //No I18n
        return;
    }
    var param = "module=updateWidgetSettings&widgetName=" + encodeURIComponent(document.getElementById('widgetName').value) + "&widgetDesc=" + encodeURIComponent(document.getElementById('widgetDesc').value) + "&dashboardTab=" + encodeURIComponent(dashboardTab) + "&ispublic=" + getReportWidgetType() + "&widget_id=" + encodeURIComponent(document.getElementById('widget_id').value) + "&report_id=" + encodeURIComponent(document.getElementById('report_id').value); //No I18N
    //callLoadingIcon('widgetLoadingDisplay', getMessageForKey('sdp.admin.ldap.import.error'));//No I18N

    handleReportRequest("/CustomReportHandler.do", param, 'updateWidgetSettings'); //No I18N
}

function getReportWidgetType() {
    var isPublicRadio = document.getElementsByName('ispublic');
    var widgetType = "private"; //No I18N
    for (var i = 0; i < isPublicRadio.length; i++) {
        if (isPublicRadio[i].checked) {
            widgetType = encodeURIComponent(isPublicRadio[i].value);
        }
    }
return widgetType;
}

function displayWidgetInDialog(url, title) {
    showURLInDialog(url, 'position=relative,closeButton=yes,width=600,height=400,title=' + title); // No I18N
}

function deleteReportWidget(widgetId, reportid, widgetType) {
    var confirmMsg = "sdp.dashboard.widget.delete.confirm"; // No I18N
    if (widgetType == 'public') { // No I18N
        confirmMsg = "sdp.dashboard.public.widget.delete.confirm"; // No I18N
    }
    if (confirm(getMessageForKey(confirmMsg))) {
        var url = "/servlet/AJaxServlet"; //No I18N
        var params = "action=deleteWidgetFromDashboard&widgetId=" + widgetId + "&reportId=" + reportid; //NO I18N
        callCustomAjaxRequest(url, params, reloadDashboardPage, reloadDashboardPage, 'deleteWidgetFromDashboard'); //No I18N
    }
}

function reloadDashboardPage(responseObj, key) {
    if (responseObj.responseText == 'Success') {
        showMessageAndClose(getMessageForKey("sdp.dashboard.widget.delete.success.msg"), 2000);
    } else {
        showFailureMessageAndClose(getMessageForKey("sdp.dashboard.widget.delete.failure.msg"), 2000);
    }
    window.setTimeout(function(){location.reload();}, 2000);

}

//the below variables are used in MSP
var fillSiteBox = true;
var isBillReport = false;
var regeneratedBill = false;
function showSummaryCriteriaPageForBill(ids,moduleID)
{
    if(!isMSPOrSCP){
        return;
    }
    var element = jQuery("#__persistentAccountId__select");
    if(element.val()==0)   //no i18n
    {
        alert(getMessageForKey("sdp.msp.selectAccount.error")); //no i18n
        return false;
    }

    var param = "module=show_criteria_page&moduleID="+moduleID;//No I18N
    var len = ids.length;
    for(i=0;i<len;i++)
    {
        param += "&displaySubReportList=" + ids[i];//No I18N
    }
    fillSiteBox= false;
    isBillReport=true;
    regeneratedBill = false;
    element.attr('disabled','disabled');
	element.removeClass('accountFormStyle'); // no i18n
	element.addClass('accountStyleDisabled'); // no i18n
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true);//No I18N
    handleReportRequest("/SummaryReportHandler.do", param, 'show_summary_filter_page');//No I18N
    return false;
}

function runBillReport()
{
    if(!isMSPOrSCP){
          return;
    }
    if(document.getElementById('dateFilterColumn').value ==-1)
    {
        alert(getMessageForKey("sdp.msp.bill.selectdate.column"));   //No i18n
        return false;
    }
    if(isSCP && document.getElementById('account').value ==0)
    {
        alert(getMessageForKey("sdp.msp.selectAccount.error"));   //No i18n
        return false;
    }
    if(document.getElementById('contractIdType').value ==0)
    {
        alert(getMessageForKey("sdp.msp.selectContract.error"));   //No i18n
        return false;
    }
    runSummaryReport();
}

function onMatrixReportsGroupChange(group1, group2, group3,group4,group5,type) {
    var value1 = jQuery(group1).val();
    var value2 = jQuery(group2).val();
    var value3 = jQuery(group3).val();
    var value4=jQuery(group4).val();
    var value5=jQuery(group5).val();

	if(value1!=-1 && (value1==value2 || value1==value3 || value1==value4 || value1==value5)){
            if(type == "column"){
                alert(getMessageForKey('duplicate.column.grouping')); //NO I18N
            } else{
		      alert(getMessageForKey('sdp.reports.customReport.matrixReport.groupBy.Duplicate')); //NO I18N
            }
		jQuery(group1).val(-1);
		jQuery(group1).select2("val",-1); //No I18N
		} else{
            if(value1!=-1){
                var uniqueDivToCheck = "#matrixGroupColumn";//NO I18N
                if(type == "column"){
                    uniqueDivToCheck = "#matrixGroup";//NO I18N
                }
                for(var i=1;i<=5;i++){
                    var fieldToCheck = jQuery(uniqueDivToCheck+i);
                    if(fieldToCheck!=undefined){
                        var loopValue = fieldToCheck.val();
                        if(loopValue!=-1 && value1==loopValue){
                            //This indicates column selected in column grouping getting repeated in groupby also.So throwing alert here.
                            alert(getMessageForKey('advanced.matrix.unique.groupby.columns'));
                            jQuery(group1).val(-1);
                            jQuery(group1).select2("val",-1); //No I18N
                        }
                    }
                }
            }
        }
}

validateAdvancedFilters = (maxFieldsCount) => {
    let customfilterform = document.CustomReportHandlerForm;
    if(customfilterform !== undefined)
    {
        let displayItemsOptions = customfilterform.displayColumnList.options;
        let displayItemsOptionsLength = displayItemsOptions.length;
        if(maxFieldsCount !== undefined && displayItemsOptionsLength > maxFieldsCount){
             alert(translate('reports.maxFieldsCount.error.message',[encodeHTML(maxFieldsCount),encodeHTML(displayItemsOptionsLength)]));
             return false;
         }
        if(displayItemsOptionsLength > 0)
        {
            var selectedOptionsIds = "";
            for (var i = 0; i < displayItemsOptionsLength ; i++)
            {
                var optionsvalue = displayItemsOptions[i].value;
                selectedOptionsIds = selectedOptionsIds+','+optionsvalue;
            }
            var regX = /(,\d+)+/;
            var selectedColumnRegex = new RegExp(regX, 'i');
            var match = selectedColumnRegex.test(selectedOptionsIds);
            if(match)
            {
            var jsonData;
            sdpAjax({
                type:'GET', // No I18N
                url:"/servlet/AJaxServlet?action=CheckRequestSelectableUDFColumnsAllowedLimit&selectedColumnIds="+selectedOptionsIds, // No I18N
                cache:false,
                async:false,
                success: function( data ) {
                    jsonData = data;
                    return data;
                }
            });


            var allRequestUDFColumnCount = jsonData.allRequestUDFColumnCount;
            if( allRequestUDFColumnCount > 0)
            {
                alert(getMessageForKey('report.requestudfmigration.notcompleted.msg'));
            }

            var singleSelectableColumnCount = jsonData.singleSelectableColumnCount;
            var multiSelectableColumnCount = jsonData.multiSelectableColumnCount;
            var maxSingleSelectableColumnsCount = jsonData.maxSingleSelectableColumnsCount;
            var maxMultiSelectableColumnsCount = jsonData.maxMultiSelectableColumnsCount;

            if(singleSelectableColumnCount > maxSingleSelectableColumnsCount)
            {
                alert(getMessageForKey('report.customsettings.maxSingleSelectableColumns.errormsg',[maxSingleSelectableColumnsCount,singleSelectableColumnCount]));
                return false;
            }

            if(multiSelectableColumnCount > maxMultiSelectableColumnsCount)
            {
                alert(getMessageForKey('report.customsettings.maxMultiSelectableColumns.errormsg',[maxMultiSelectableColumnsCount,multiSelectableColumnCount]));
                return false;
            }
            }
        }
    }

    var filterNames = [];
    var isEmpty = false;
    for (var index = 0; index < advFilterIds.length; index++) {
        var filterNameId = '#' + advFilterIdsPrefix[index] + '_filterColumn_' + advFilterIds[index];
        var filterName = jQuery(filterNameId).val();
        var filterCriteriaValue = jQuery('#' + 'criteriaValue_' + advFilterIds[index]).val();
        if (filterName != undefined && filterName != -1 && (filterCriteriaValue == undefined || filterCriteriaValue.trim() == ''))
        //User is alerted if a filter name has been chosen but no criteria value is given
        {
            filterNames.push(jQuery(filterNameId).find('#' + filterName).html());
            isEmpty = true;
        }
    }
    if (isEmpty) {
        alert(getMessageForKey('sdp.reports.customReport.advancedFilter.Empty', [filterNames])); //NO I18N
        return false;
    }
    return true;
}
var timer = SlideShow({
    interval: [12, 5, 5, 5, 5, 5]
});
function loadAplusBanner() {
    if (getPersonalizeData("is_aplus_banner") !== true) {
        jQuery.ajax({
            url: "servlet/AJaxServlet", //No I18N
            data: { "action": "getZRIntegrationStatus" }, //No I18N
            success: function(response) {
                if (response === 'false') {
                    jQuery("#aplus-banner").load("/html/aplusbanner.html", function(response, status, xhr) {//No I18N
                        if (status == 'success') {
                    jQuery("#aplus-banner").dialog({
                        width: 1300,
                        height: 700,
                        draggable: false,
                        title: "Advanced Analytics", //No I18N
                        closeOnEscape: false,
                        modal: true,
                        open: function() {
                            jQuery("#aplus-banner") //No I18N
                                .closest(".ui-dialog") //No I18N
                                .find(".ui-dialog-titlebar-close") //No I18N
                                .attr("class", "close pt5 close-link") //No I18N
                                .text("Don't show this again"); //No I18N
                        },
                        close: function() {
                            addPersonalization('is_aplus_banner', true); //No I18N
                        }
                    })
                    if(sdp_app.IS_AE){
                    setTimeout(function() { advancedAnalyticsPage(); }, 5000);
                    }
                    jQuery('#addWOButton').on('click',function(event){window.open('https://www.manageengine.com/products/service-desk/advanced-analytics.html?utm_source=SDP&utm_medium=product','noopener','noreferrer');});
                    timer.start();
                }
            });
                }
            }
        });
    }
    }
function SlideShow(config) {
    var interval = config.interval || [5, 1, 1, 1, 1];
    var counter = 0;
    var loop = 0;
    var fn = config.fn;
    var returnFn = {};
    var timerId;
    var isPause = false;
    function secToMS(sec) {
        return 1000 * sec;
    }
    function intervalSequence(time) {
        var ms = secToMS(time);
        timerId = setTimeout(function () {
            if (returnFn.onSlide) {
                returnFn.onSlide.call(config, counter + 1, loop);
            }
            intervalSequence(interval[counter]);
            counter++;
            if (counter >= interval.length) {
                counter = 0;
                loop++;
            }
        }, ms);
    }
    function start() {
        if (isPause) {
            intervalSequence(interval[counter]);
        } else {
            intervalSequence(0);
        }
    }
    function pause() {
        isPause = true;
        clearTimeout(timerId);
    }
    returnFn.stop = function () {
        counter = 0;
        loop = 0;
        clearTimeout(timerId);
    };
    returnFn.start = start;
    returnFn.pause = pause;
    returnFn.play = start;
    return returnFn;
}
timer.onSlide = function (counter, loop) {
    var elem = document.getElementById('zrop-slider');
    elem.dataset.slide = counter;
    elem.dataset.loop = loop;
    var activeElem = elem.querySelector('.zrop-slider-list.active');//No I18N
    if (activeElem) {
        activeElem.classList.remove('active');//No I18N
    }
    var currentSlider = elem.querySelector('.zrop-slider-' + counter);//No I18N
    currentSlider.classList.add('active');//No I18N
    findGif(currentSlider);
};
function findGif(currentSlider) {
    var img = currentSlider.getElementsByTagName('img')[0];
    if (img) {
        img.src = img.src;
    }
}
function advancedAnalyticsPage(){
    var introSliderHeight = document.getElementById('zrop-intro-slider').offsetHeight;
    var gifHolder = document.getElementsByClassName("zrop-slider-gif");//No I18N
    for(var i=0;i<gifHolder.length;i++){
        gifHolder[i].style.height = introSliderHeight+'px';
    }
}

function generateReport(reportTypeId, reportId, isAPISupported) {
    if (reportTypeId === 1) {
        param = 'module=generate_report&report_id=' + reportId + '&reportType=Tabular Reports'; //No I18N
        runReport( isAPISupported ? $reports.setAPIFlag(param) : param, reportId);
    } else if (reportTypeId === 2) {
        param = 'module=run_query_editor_query&report_id=' + reportId; //No I18N
        runReport(param,reportId);
    } else if (reportTypeId === 3 || reportTypeId === 4) {
        param = 'module=generate_report&report_id=' + reportId + '&reportType=Matrix Reports'; //No I18N
        runReport( isAPISupported ? $reports.setAPIFlag(param) : param, reportId);
    } else if (reportTypeId === 5) {
        runSummaryReport(reportId);
    } else if (reportTypeId === 6) {
        runAuditHistoryReport(reportId);
    } else if (reportTypeId === 7) {
        runCIHistoryReport(reportId);
    } else if (reportTypeId === 8) {
        runReport('module=generate_report&report_id=' + reportId + '&reportType=Request Metrics Report', reportId); //No I18N
    }
}

//SDF-91670 - Method to disable and enable orderby radio buttons upon selecting values in drop down
function toggleOrderby(ele){
    if(jQuery(ele).val() !=-1){
        jQuery("input[name=\""+jQuery(ele).attr("id")+"_ascOrder\"]").removeAttr("disabled"); // no i18n
    }else{
        jQuery("input[name=\""+jQuery(ele).attr("id")+"_ascOrder\"]").attr("disabled","true");
    }
}

//Report Reorder Starts
var $reportReorder = {
    enabledFolderId: null,
    renderReportReorder: function(json) {
        renderhbs('#folderList','folder-list-template', json, false, 'reports'); //No I18N
        renderhbs('#reportList','report-list-template', json, false, 'reports'); //No I18N
    },
    startReorder: function() {
        $reportReorder.enableReorder();
        $reportReorder.loadReports(jQuery('[data-name="reorderFolder"]').data("li")); //No I18N
        var dataname = jQuery('#folderList, #reportList');
        dataname.on('keypress', "[data-sort=reorderlist] input[data-name=reorderformcontrol]", function(e) {
            var val = jQuery(this).val();
            if ((val != '') && (e.keyCode == 13) && (!isNaN(val))) {
                var elm = jQuery(this).closest('[data-sort=reorderlist]:visible'); // No I18N
                if (jQuery(elm).attr('id').indexOf('Report') != -1) {
                    dataname = jQuery('#reportList');
                } else {
                    dataname = jQuery('#folderList');
                }
                var vl = elm.index();
                val = (val > vl) ? val : val - 1;
                if (val < 0) {
                    val = 0;
                }
                var elementSize = dataname.find('[data-sort=reorderlist]:visible').length;
                var position = vl + 1;
                if (position == val || (position == 1 && val <= 1) || (position == elementSize && val >= elementSize)) {
                    $reportReorder.updateOrder();
                } else {
                    var newEle = elm.clone();
                    if (val >= elementSize) {
                        val = elementSize;
                        dataname.find('[data-sort=reorderlist]:visible').eq(val - 1).after(newEle);
                        dataname.find('[data-sort=reorderlist]:visible').eq(val).addClass('reorderhiglite');
                        val = val - 1;
                    } else {
                        dataname.find('[data-sort=reorderlist]:visible').eq(val).before(newEle);
                        dataname.find('[data-sort=reorderlist]:visible').eq(val).addClass('reorderhiglite');
                    }
                    $reportReorder.initToolTip();
                    elm.remove();
                    dataname.animate({
                        scrollTop: dataname.find('.reorderhiglite').position().top - dataname.find('.reorderhiglite').height() - 20
                    }, 500);
                    $reportReorder.updateOrder();
                    jQuery('div.reorder-input-alert').fadeOut('medium'); //No I18N
                    jQuery('#reorderreset, #applyChanges').removeClass('disabled');
                }
            }
        });
        $reportReorder.initToolTip();
    },
    loadURL: function(id) {
        jQuery('[data-folder-id=' + id + ']').show();
        jQuery('[data-folder-id=' + enabledFolderId + ']').hide();
        enabledFolderId = id;
        this.updateOrder();
    },
    validateReorderCancel: function() {
        if (jQuery('#applyChanges').hasClass('disabled')) {
            closeDialog();
        } else {
            showconfirm(true, 'title=' + getMessageForKey("sdp.requestcatalog.reorder.save.title") + ', message=' + getMessageForKey("sdp.requestcatalog.reorder.save") + ', submitbutton=' + getMessageForKey("sdp.common.save") + ',submitbutton2=' + getMessageForKey("sdp.admin.requesttemplate.request.discard") + ' ,cancelbutton=' + getMessageForKey("sdp.common.cancel") + ', closebutton=yes, closeOnEscKey=yes', function(save, button) { // No I18N
                if (save) {
                    if (button == 'submitButton') {
                        $reportReorder.applyChanges();

                    }
                    if (button == 'submitButton2') { //No I18N
                        closeDialog();
                    }
                }
            });
        }
    },
    resetReorder: function() {
        showconfirm(true, 'title=' + getMessageForKey("sdp.common.reset") + ', message=' + getMessageForKey("sdp.requestcatalog.reorder.discard") + ', submitbutton=' + getMessageForKey("sdp.change.submission.yes") + ', cancelbutton=' + getMessageForKey("sdp.change.submission.no") + ', closebutton=yes, closeOnEscKey=yes', function(save, button) { // No I18N
            if (save) {
                this.showReportReorder();
            }
        });
    },
    loadReports: function(id) {
        if (enabledFolderId != id) {
            this.loadURL(id);
            jQuery('#FolderList_' + id).addClass('active').siblings().removeClass('active');
        }
    },
    updateOrder: function() {
        jQuery('[data-name=reorderFolder]').each(function(index) {
            jQuery(this).find('input[data-name=reorderformcontrol]').val(index + 1);
        });
        jQuery('[data-name=reorderReport]:visible').each(function(index) {
            jQuery(this).find('input[data-name=reorderformcontrol]:not(.hide)').val(index + 1);
        });
    },
    enableReorder: function() {
        this.updateOrder();
        jQuery("#reorderreset, #applyChanges").addClass('disabled');
        jQuery('.ui-sortable').sortable({
            axis: 'y', //No I18N
            placeholder: "move-state-highlight", //No I18N
            helper: 'clone', //No I18N
            start: function(e, ui) {
                ui.placeholder.height(ui.item.height());
                ui.placeholder.width(ui.item.width());
                ui.placeholder.css('visibility', 'visible'); //No I18N
            },
            update: function(event, ui) {
                $reportReorder.updateOrder();
                ui.item.addClass('reorderhiglite');
                jQuery('#reorderreset, #applyChanges').removeClass('disabled');
            }
        });
        enabledFolderId = null;
    },
    applyChanges: function() {
        jQuery("#reorderreset, #applyChanges").addClass('disabled');
        var folders = jQuery('#folderList').children();
        var json = {};
        for (var folderIter = 0; folderIter < folders.length; folderIter++) {
            var reportjson = {};
            var folder = jQuery(folders[folderIter]);
            var folderId = folder.data('li'); //No I18N
            var reports = jQuery('#Folder_' + folderId).children();
            for (var reportIter = 0; reportIter < reports.length; reportIter++) {
                var report = jQuery(reports[reportIter]);
                var reportId = report.data('report-id'); //No I18N
                reportjson[reportIter] = reportId;
            }
            var jsonObj = {};
            jsonObj.folderId = folderId;
            jsonObj.reportJSON = reportjson;
            json[folderIter] = jsonObj;
        }
        var jsonReorder = {};
        jsonReorder.reorderJSON = json;
        addPersonalization("report-reorder", jsonReorder, true); //No I18N
        showalert('success', getMessageForKey("sdp.requestcatalog.reorder.success"), 'isAutoHide=true,delay=2'); //No I18n
        setTimeout(function() {
            location.reload();
        }, 1000);
    },
    sortFolder: function() {
        this.sort(jQuery('#folderSorting'));
    },
    sortReport: function() {
        this.sort(jQuery('#reportSorting'));
    },
    sort: function(dataname) {
        var sdp_glyph = dataname.find('.sdp-glyph');
        if (sdp_glyph.hasClass('sdp-glyph-sort-down')) {
            sdp_glyph.removeClass('sdp-glyph-sort-down');
            sdp_glyph.addClass('sdp-glyph-sort-up');
            sdp_glyph.attr('title', getMessageForKey('sdp.purchase.request.listview.sortby.desc'));
            isAscending = false;
        } else {
            sdp_glyph.removeClass('sdp-glyph-sort-up');
            sdp_glyph.addClass('sdp-glyph-sort-down');
            sdp_glyph.attr('title', getMessageForKey('sdp.purchase.request.listview.sortby.asc'));
            isAscending = true;
        }
        this.sortList(dataname, isAscending);
        jQuery('#reorderreset, #applyChanges').removeClass('disabled');
    },
    sortList: function(dataname, isAscending) {
        dataname = jQuery(dataname);
        var list = dataname.find('.reorder-container');
        var listLi = dataname.find('li:visible', list);
        var parentList = jQuery(listLi[0]).parent();
        listLi.sort(function(a, b) {
            var keyA = jQuery(a).find('[data-name=namelist]').text().toLowerCase();
            var keyB = jQuery(b).find('[data-name=namelist]').text().toLowerCase();
            if (isAscending) {
                return (keyA > keyB) ? -1 : (keyA < keyB) ? 1 : 0;
            } else {
                return (keyA < keyB) ? -1 : (keyA > keyB) ? 1 : 0;
            }
        });
        jQuery.each(listLi, function(index, row) {
            parentList.append(row);
        });
        this.updateOrder();
    },
    initToolTip: function() {
        initTooltip('#reorderfn'); //No I18N
        jQuery('#reorderfn input').on('focus', function() {
            jQuery("#reorderfn li").uitooltip('close'); //No I18N
            jQuery(this).closest('li').uitooltip({ //No I18N
                content: function() {
                    return jQuery(this).prop('title'); //No I18N
                }
            });
        });
    }
};

//Report Reorder Ends

/**
 * Method to initialize search in report home page
 */
var $searchReport = {
    initSearchReport: function() {
        var reportLists = [];
        pushReports = (reportBody, _this) => {
            reportBody.push({
                id: $body.find(_this).data("report"), //No I18N
                text: $body.find(_this).text(),
                reportTypeId: $body.find(_this).data("reportType"), //No I18N
                isAPISupported: $body
                    .find(_this)
                    .attr("data-isAPISupported")
            });
        };

        var $body = jQuery("body");


        //Constructing the data JSON from the rendered list
        $body.find(".reportsHeading").each(function() {
            var reportSection = {};
            reportSection.text = jQuery.trim($body.find(this).text());
            var reportBody = [];
            $body.find(this).closest("table").find("[data-report]").each(function() { //No I18N
                if (checkUserRole("ReportConfigAdmin")) {
                    if ($body.find(this).attr("data-isEditable") == "true") {
                        pushReports(reportBody, this);
                    }
                } else {
                    pushReports(reportBody, this);
                }
            });
            reportSection.children = reportBody;
            if(reportSection.children.length >0){
                reportLists.push(reportSection);
            }
        });
        var $search = $body.find("#search-reports");
        $search.select2({
            data: reportLists,
            multiple: true,
            width: "resolve", //No I18N
            placeholder: getMessageForKey("reports.search.placeholder"),
            query: function(query) {
                var select2 = this;
                var filteredContent = reportLists.reduce(function(results, item) {
                    // items may contain children, so filter them, too
                    var filteredChildren = [];
                    if (item.children) {
                        filteredChildren = item.children.reduce(function(children, child) {
                            if (select2.matcher(query.term, child.text)) {
                                children.push(child);
                            }
                            return children;
                        }, []);
                    }
                    // apply the regular matcher
                    if (select2.matcher(query.term, item.text)) {
                        // keep this item either if itself matches
                        results.push(item);
                    } else if (filteredChildren.length) {
                        // or it has children that matched the term
                        var result = jQuery.extend({}, item, { children: filteredChildren });
                        results.push(result);
                    }
                    return results;
                }, []);
                query.callback({
                    results: filteredContent
                });
            },
            formatNoMatches: function () { return getMessageForKey('ae.select2.no.message'); }//No I18N
        }).on('change', function(e) {
            $body.find(".select2-search-choice").addClass("hide");
            generateReport(e.added.reportTypeId, e.val, e.added.isAPISupported === 'true');
        });
    }
};

function checkForDateFields(field, dateFields){
    var array=dateFields.substring(1, dateFields.length-1).split(",");
     var isDateField=false;
    if(field !== undefined && field.value !== "-1"){
        array.forEach(function(value) {
          var str = value.split("=");
          if(str[0].trim() == field.value){
            var id = field.id.substring(17);
            jQuery("#tr_matrixColumnGroupBy"+id).addClass("show").removeClass("hide");
            isDateField=true;
           }
        });
        if(!isDateField){
            var fieldGiven='#tr_matrixColumnGroupBy'+field.id.substring(17);//No I18N
            if(jQuery(fieldGiven).hasClass('show')){
                jQuery(fieldGiven).addClass("hide").removeClass("show");
            }
        }
    }
    else{
        //For cases like removing date column, has to remove corresponding group by column also.
        if(field !== undefined){
            var emptyField = '#tr_matrixColumnGroupBy'+field.id.substring(17);//No I18N
             if(jQuery(emptyField).hasClass('show')){
                jQuery(emptyField).addClass("hide").removeClass("show");
            }
        }
    }
}

function hideManageFolder(){
    jQuery("#Left-Section").hide();
}

//Function to check whether object is defined or not
function defined(obj) {
    return obj !== undefined && obj !== null;
}

function each(arr, fn) {
    return Array.prototype.forEach.call(arr, fn);
};

function exportReport(url, type, id, isAPISupported) {
    callLoadingIcon("exportStatus",getMessageForKey("sdp.reports.common.generating.message"), true)
    param = "module=export&file_type="+type;//no i18n
    if(id != undefined){
        param += "&report_id="+id//no i18n
    }
    param = isAPISupported ? $reports.appendPreviousConfig(param) : param;
    sendExportRequest(url, param);
}

function sendExportRequest(url, param){
    requestObj = getXMLHttpRequest();
    if(requestObj){
        try{
          requestObj.open("POST", url, true);//No I18N
          requestObj.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
          requestObj.responseType = "blob";//no i18n
          requestObj.onreadystatechange = function(){
            if(requestObj != null && requestObj.readyState == 4) {
              if(requestObj.status == 200){
                let customHeader = requestObj.getResponseHeader("custom-header");//no i18n
                if(customHeader == "isScheduled"){
                    window.showalert("success", getMessageForKey("reports.schedulingReportsOnExport.message"), 'isAutoHide=true,delay=5');//NO I18N
                }
                else{
                a = document.createElement('a');
                fileName = requestObj.getResponseHeader('content-disposition').match(/\d+\.\w+/);//no i18n
                var binaryData = [];
                a.href = window.URL.createObjectURL(requestObj.response);
                a.download = fileName;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                }
              }else{
                    if(requestObj.response.type == 'application/json'){
                        var reader = new FileReader();
                        reader.onload = function() {
                                 var jsonResponse = JSON.parse(this.result);
                                jQuery("body").append("<div id='exportpopup'></div>")
                                    let opt={
                                        title: translate("pdfexport.configuration.checker"),
                                            maximizable: false,
                                            height:300,
                                            width:500,
                                            position: { my: "center", at: "center", of: window },//NO I18N
                                            custom_options: {
                                                    url:`/debug/PdfExport.jsp?status=${jsonResponse.error.statuscode}&message=${jsonResponse.error.message}`
                                                }
                                        }
                                jQuery("#exportpopup").sdp_zcomponent_dialog(opt)
                        };
                        reader.readAsText(requestObj.response);
                    }
                else if (param.includes("DOC") || param.includes("DOCX")){
                      window.showalert("failure", translate("sdp.inventory.export.dataandpush.error1")+ " " + translate("reports.customreport.doc.export.message"), 'isAutoHide=true,delay=4');//NO I18N
                  }
                  else{
                    window.showalert("failure", translate("sdp.inventory.export.dataandpush.error1"), 'isAutoHide=true,delay=3');//NO I18N
                 }
              }
              hideDiv('exportStatus');
              requestObj = undefined;
            }
          }
          requestObj.send(param);
        }
        catch(e)
        {
            alert(getMessageForKey("sdp.ajax.request.send.error") +" : " + e.message);//No I18N
        }
      }

}

//Sets Show_Info_Message property as false in user preferences for logged in user.
//Used to hide info messages such as report stability info note.
function hideReportInfoPanel() {
    handleReportRequest("/servlet/AJaxServlet","action=hideReportInfoPanel", "hideReportInfoPanel");//no i18n
}

var $reports = {
     step1 : function()
     {
         var module_selected = false;
         for(i=0;i<document.SummaryReportHandlerForm.moduleID.length;i++)
         {
             if(document.SummaryReportHandlerForm.moduleID[i].checked == true)
             {
                 module_selected = true;
                 break;
             }
         }
         if( !module_selected )
         {
             alert(document.getElementById("sdp.reports.customReport.selectmodule").innerHTML);
             return;
         }
         document.SummaryReportHandlerForm.module.value = "show_filter_page";
         document.SummaryReportHandlerForm.submit();
     },

     preLoad : function()
     {
         document.SummaryReportHandlerForm.reportTitle.focus();
     },

    validateReportCustomSettingsField : function( obj ) {
    	if( !isInteger(obj.value) )
    	{
    		alert(document.getElementById("sdp.purchase.common.invalidnumber.errmsg").innerHTML);
    		obj.focus();
    		return false;
    	}
    	if((obj.value) < 1)
    	{
    		alert(document.getElementById("sdp.report.reportsetting.number.error").innerHTML);
    		obj.focus();
    		return false;
    	}
    return true;
    },

    /*
    Method to construct parameters with multiple report names for Scheduling multiple reports
    Existing constructParameter(var) method is overriden as to append multipl report names as comma separated value.
     */
    constructScheduleParameters : function( formName ) {
        var params = "";
        try {
            var elements_list = formName.elements;
            var length = elements_list.length;
            var element_type;
            for (i = 0; i < length; i++) {
                element_type = elements_list[i].type;
                /* SD-11757 - Unabel to save weekly and monthly due to new check box added for email and location form.*/
                if ('reportTo' != elements_list[i].name && elements_list[i].name != "") {
                    if (element_type == 'textarea' || element_type == 'text' || element_type == 'select-one' || element_type == 'password' ) {
                        if(elements_list[i].name == "message"){
                            params += "&" + elements_list[i].name + "=" + encodeURIComponent(editor.getHTML());
                        }
                        else{
                        params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].value); //No I18N
                        }
                    }
                    else if (element_type == 'checkbox' && elements_list[i].checked) {
                        params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].value); //No I18N
                    }
                    else if (element_type == 'select-multiple') {
                        var size = elements_list[i].options.length;
                        var reports = "";
                        for (j = 0; j < size; j++) {
                            if (elements_list[i].options[j].selected) {
                                reports += encodeURIComponent(elements_list[i].options[j].value) + ","; //No I18N
                            }
                        }
                        params += "&" + elements_list[i].name + "=" + reports.slice(0, -1);
                    }
                }
            }
        }
        catch (e) {
            alert("Error while constructing request parameter : " + e.message); //No I18N
        }
        return params;
    },

    //function to append previous report configuration
    appendPreviousConfig : function(params) {
        if (parent.previousConfig) {
            if (params) {
                params += "&previousConfig=" + encodeURIComponent(Object.toJSON ? Object.toJSON(parent.previousConfig) : JSON.stringify(parent.previousConfig)); //No I18N
            } else {
                params = "&previousConfig=" + encodeURIComponent(Object.toJSON ? Object.toJSON(parent.previousConfig) : JSON.stringify([parent.previousConfig])); //No I18N
            }
        }
        return params;
    },

    setAPIFlag : function(param) {
        return param += "&isAPISupported=true"; //No I18N
    },

    loadAPIReportGroupingPage : function()  {
        jQuery("#groupTabularColumn, #orderBy1, #orderBy2, #orderBy3").removeAttr("class");
        jQuery("#groupTabularColumn, #orderBy1, #orderBy2, #orderBy3").select2({
        width: '100%', // no i18n
        formatNoMatches: function () { return getMessageForKey('ae.select2.no.message'); }//No I18N
    });
    },

    loadAPIReportGraphingPage : function() {
    var style = "width:250px;padding:0px"; //no i18n
	var style1 = "width:150px;padding:0px"; //no i18n
    jQuery("#chartTypeId, #pieChartGroupColumn, #barXGroup1, #barXGroup2, #lineXDate, #lineXGroup, #timeXDate, #timeXGroup, #timeYCountColumn, #areaXDate, #areaXGroup").attr("style",style);
    jQuery("#pieChartDisplayFormat, #barChartBy, #lineXDateFormat, #timeXDateFormat, #areaXDateFormat").attr("style",style1);
    jQuery("#chartTypeId, #pieChartGroupColumn, #pieChartDisplayFormat, #barXGroup1, #barChartBy, #barXGroup2, #lineXDate, #lineXDateFormat, #lineXGroup, #timeXDate, #timeXDateFormat, #timeXGroup, #timeYCountColumn, #areaXDate, #areaXDateFormat, #areaXGroup").removeAttr("class"); //no i18n
    jQuery("#chartTypeId, #pieChartGroupColumn, #pieChartDisplayFormat, #barXGroup1, #barChartBy, #barXGroup2, #lineXDate, #lineXDateFormat, #lineXGroup, #timeXDate, #timeXDateFormat, #timeXGroup, #timeYCountColumn, #areaXDate, #areaXDateFormat, #areaXGroup").select2({
        formatNoMatches: function () { return getMessageForKey('ae.select2.no.message'); }//No I18N
    });
    },

    loadAPIAdvancedMatrixReportPage : function() {
        var style = "width:250px;padding:0px";
        jQuery("#matrixColumnGroupBy, #matrixGroup1, #matrixGroup2, #matrixGroup3, #matrixGroup4, #matrixGroup5, #matrixGroupColumn1, #matrixGroupColumn2, #matrixGroupColumn3, #matrixGroupColumn4, #matrixGroupColumn5, #matrixSummaryType, #matrixCountColumn").attr("style",style);  //No I18N
        jQuery("#matrixColumnGroupBy, #matrixGroup1, #matrixGroup2, #matrixGroup3, #matrixGroup4, #matrixGroup5, #matrixGroupColumn1, #matrixGroupColumn2, #matrixGroupColumn3, #matrixGroupColumn4, #matrixGroupColumn5, #matrixSummaryType, #matrixCountColumn").select2({
                formatNoMatches: function () { return getMessageForKey('ae.select2.no.message'); }//No I18N
        });
    },

     loadAPISimpleMatrixReportPage :function() {
        var style = "width:220px;padding:0px"; //no i18n
        jQuery("#simpleTopColumn, #simpleLeftColumn, #simpleMatrixCountColumn").attr("style",style);
   		jQuery("#simpleMatrixSummaryType").attr("style","padding:0px;width:120px;");
        jQuery("#simpleTopColumn, #simpleLeftColumn, #simpleMatrixCountColumn, #simpleMatrixSummaryType").select2({
                    formatNoMatches: function () { return getMessageForKey('ae.select2.no.message'); }//No I18N
        });
    },

    loadAPIReportFilterPage : function( fieldJSON ) {
    jQuery("#dateFilterType").removeAttr("class"); // no i18n
	jQuery("#dateFilterColumn").removeAttr("class"); // no i18n
    jQuery("#dateFilterType").select2({
        width: '100%',
        formatNoMatches: function () { return getMessageForKey('ae.select2.no.message'); }//No I18N
    });
	jQuery("#dateFilterColumn").select2({
        width: 'resolve', // no i18n
        formatNoMatches: function () { return getMessageForKey('ae.select2.no.message'); }//No I18N
    });
	jQuery("#criteriabuilder").custom_filter({"metainfo":fieldJSON,"haveNestedColumns": true,"specialFormats":["have_none"],"notMandatory":true, "metaOverride": { // no i18n
                    "udf_fields": {"display_name": translate("sdp.requests.fieldFormRules.scriptpopup.additionalFields")} //no i18n
                }, "maxrows" : 100, "allowReadOnly":true, "haveMultiString": true, "haveStrTypesUDF": true, "haveOtherUDF":true, //no i18n
                "skipFieldTypeConditions": {"memory": ["between", "not_between"]}, "metaKey":"/_metainfo"}); // no i18n
	if(parent.previousConfig.criteriaJSON != null && parent.previousConfig.criteriaJSON.length > 0){
		jQuery("#criteriabuilder").custom_filter("update", parent.previousConfig.criteriaJSON); // no i18n
	}
}
}

// SD - 108917 fix start
function showFolder(folderId) {
    window.location  = "/CustomReportHandler.do?folder_id=" + folderId;
}
// SD - 108917 fix end
/* Function to check is this a network path */
checkIfDefOrNetwork = (path) => {
    if (path == null || path.length < 2) { return; }
    else {
        if (!path.startsWith("\\\\")) {
            return false;
        }
        return true;
    }
}
/* Function to check if the scheduel location given is accessible from server side */
checkIfAttachPathAccessible = (path) => {
    let isOk = false;
    let isValidPath = false;
    let url = "/servlet/AJaxServlet"; // No I18N
    sdpAjax({
        async: false,
        url: url,
        type: 'get',//NO I18N
        data: { action: 'check_if_schedule_location_exists', attchPath: path },//NO I18N
        success: function (resp) {
            isOk = resp.status;
            isValidPath = resp.isValidPath;
        }
    })
    let flAttachExists = isValidPath && isOk;
    if (!flAttachExists) {
        showalert('failure', translate("sdp.settings.filePathExists.error.msg"), "isAutoHide=true,delay=5,closeOnEscKey=yes");	//NO I18N
    }
    let value = false;
    let flAttachPath = checkIfDefOrNetwork(path);
    if (flAttachPath === true || flAttachExists === true) {
        value = true;
    }
    else {
        value = false;
    }
    return value;
}
/* Method to switch or select email or schedule location or both in schedule form. */
reportToForm = (data) => {
    let forms = document.querySelectorAll('input[name="reportTo"]'); //No I18N
    const formsLen = forms.length;
    for (let i = formsLen - 1; i >= 0; i--) {
        let reportToFormId = forms[i].value;
        if (reportToFormId != null) {
            let table = document.getElementById(reportToFormId);
            if (table != null && table != undefined) {
                if (forms[i].checked) {
                    table.classList.remove("hide");//No I18N
                    if (reportToFormId == "EmailForm") {
                        if (sdp_app.IS_FILE_PROTECTION_ENABLED) {
                            showPrivacyPolicyInfo("#EmailForm");//No I18N
                        }
                        toReportEmailSearch();
                        loadMailIds();
                        zeditor({
                            element: 'ScheduleReportDesc',//No I18N
                            content: data,
                            edithtml: true,
                            isEnterKeyHandler: true,
                            resize: true,
                            toolbar: "generalToolbar"//No I18N
                        });
                    }
                } else {
                    table.classList.add("hide");//No I18N
                }
            }
        }
    }
    onChangeDownloadableLinkSchedulePage();
}

addBcc = () => {
    jQuery('#addBccButton').addClass('hide');
    jQuery('#BCC_Mail').removeClass('hide');
    jQuery('#s2id_toEmailSearchCC').css('width', '100%');//NO I18N
}

checkExportAvail = () => {
    const reports = document.getElementById('reportName');
    const selectedReports = Array.from(reports.selectedOptions).map(option => option.value);
    const url = '/servlet/AJaxServlet'; // no i18n
    if(selectedReports.length > 0){
        sdpAjax({
            async: false,
            url: url,
            type: 'get',//NO I18N
            data: { action: 'checkScheduleExportTypes', reportName: selectedReports.join(',') },//NO I18N
            success: (resp) => {
                if(!resp){
                    /* SD-111777 - XML format is not available for other tha Tabular & Matrix reports. so need not o show xml if selected. */
                    let exportType = jQuery("#scheduleExportTypes").val();
                    if(exportType == 'XML'){
                        /* SD-111777 - showing alert for XML export in schedule input page. */
                        window.showalert("info", translate("reports.xml.export.reportTypeLimitations"), 'isAutoHide=true,delay=3');//NO I18N
                        jQuery('#scheduleExportTypes').val("PDF").trigger("change");//No i18N
                    }
                    jQuery("#scheduleExportTypes option[value='XML']").remove();
                } else {
                    if (jQuery("#scheduleExportTypes option[value='XML']").length <= 0 ){
                            jQuery("#scheduleExportTypes").append('<option value="XML">XML</option>');
                    }
                }
            }
        });
    } else {
        if (jQuery("#scheduleExportTypes option[value='XML']").length <= 0) {
            jQuery("#scheduleExportTypes").append('<option value="XML">XML</option>');
        }
    }
}

getEmailIconClass = (text) => {
    let validEmailIcon = "cspr icon-sm sucess-bgtrans"; //NO i18n
    let invalidEmailIcon = "cspr icon-sm close-strk"; //NO i18n
    let emailWarningIcon = "cspr icon-sm dis-undiscover"; //NO i18n

    let returnText = '';

    switch (text) {
        case 'valid': returnText = validEmailIcon; break; //NO I18N
        case 'invalid': returnText = invalidEmailIcon; break; //NO I18N
        case 'warning': returnText = emailWarningIcon; break; //NO I18N
    }
    return returnText
}

getEmailIcon = (text, customAttributes) => {
    let spanText = '<span ';  //NO I18N
    switch (text) {
        case 'valid': spanText += 'class="' + getEmailIconClass('valid') + '" '; break; //NO I18N
        case 'invalid': spanText += 'class="' + getEmailIconClass('invalid') + '" '; break; //NO I18N
        case 'warning': spanText += 'class="' + getEmailIconClass('warning') + '" '; break; //NO I18N
    }
    if (customAttributes != undefined) {
        spanText += customAttributes;
    }
    spanText += '></span>&nbsp;'; //NO I18N
    return spanText;
}

/*SD-114805 - Multiple mail and suggestion. */
toReportEmailSearch = () => {
    var input_data = {
        formatSearching: window.translate("ae.common.search.text"),
        formatNoMatches: window.translate("ae.common.select2nomatchesfound"),
        formatNoRecordsFound: window.translate("ae.common.select2norecordsfound"),
        tags: true,
        placeholder: translate("announcement.select.email"),
        multiple: true,
        minimumInputLength: 1,
        createSearchChoice: function (term, data) {
            term = term.trim();
            var matchFound = data.some(function (item) {
                return item.text.toLowerCase() === term.toLowerCase();
            });
            if (matchFound) {
                return null;
            }
            if (data.length == 0) {
                return { id: term, text: term };
            }
        },
        url: [
            {
                //               As of now, modifying for msp in order to get the users based on resp account, can be used same for SDP too
                url: isMSPOrSCP ? "api/v3/scheduledreports/created_by" : "api/v3/users", //No I18N
                field: isMSPOrSCP ? "created_by" : "users", //No I18N
                list_info: {
                    fields_required: ["email_id", "name", "last_name", "login_name"], // No I18N
                    sort_fields: [{ "field": "email_id.sort_index", "order": "asc" }] // No I18N
                },
                cache: [],
                search_keys: ["email_id"], //No I18N
                processResults: function (cacheData, data, field, i) {
                    if (
                        (data.email_id && data.email_id.length) ||
                        (data.value && data.value.email_id && data.value.email_id.length)
                    ) {
                        cacheData.push({
                            id: data.text || data.email_id || data.value.email_id,
                            text: data.text || data.email_id || data.value.email_id,
                            value: data
                        });
                    }
                },
            },
        ],
        formatResult: function (result, container, query, escapeMarkup) {
            if (!jQuery.isEmptyObject(result.value)) {
                var markup = [];
                window.Select2.util.markMatch(
                    result.text,
                    query.term,
                    markup,
                    escapeMarkup
                );
                if (result.isNew) {
                    return markup.join("");
                } else {
                    let name = (result.name || result.value.name || '');
                    let last_name = (result.last_name || result.value.last_name || '');
                    if (last_name != undefined) {
                        name += ' ' + last_name
                    }
                    return isEmpty(name) ? e_html(result.text) : e_html(name) + ", " + markup.join("");
                }
            } else {
                return e_html(result.text);
            }
        }
    };

    const isSchedulePage = jQuery('#EmailForm').length > 0;

    // Based on select of link and file protection policy icons on the email should be displayed.
    input_data.formatSelection = (result) => {
        let customAttributes = 'name="invalidMail" '; //NO I18N
        if (!validateEmailValue(result.text)) {
            showalert('failure', translate("sdp.common.notify.invalidemailjserror", [encodeHTML(result.text)]), "isAutoHide=true");	//NO I18N
            return getEmailIcon('invalid', customAttributes) + e_html(result.text);
        }
        customAttributes = 'name="nonSDPUserMail" '; //NO I18N

        if (result.value && result.value.id && result.value.login_name) {
            return getEmailIcon('valid', undefined) + e_html(result.text);
        } else {
            const isChecked = jQuery('#isDownloadableLink').is(':checked');

            let spanText;

            if (isSchedulePage && ( isChecked || sdp_app.IS_FILE_PROTECTION_ENABLED) ) {
                let userIdObj = getUserIdForMail(result.text);
                if (userIdObj && userIdObj.id) {
                    spanText = getEmailIcon('valid', undefined);
                } else {
                    spanText = getEmailIcon('warning', customAttributes);
                }
            } else {
                if (isChecked || sdp_app.IS_FILE_PROTECTION_ENABLED) {
                    spanText = getEmailIcon('warning', customAttributes);
                } else {
                    spanText = getEmailIcon('valid', customAttributes);
                }
            }

            return spanText + e_html(result.text);
        }
    }

    jQuery("#toEmailSearch,#toEmailSearchCC,#toEmailSearchBCC").sdp_select2(input_data);
    jQuery("#toEmailSearch,#toEmailSearchCC,#toEmailSearchBCC").on("change", function () { handlePermalinkWarning(isSchedulePage ? '#EmailForm' : '#rld-mail'); });
};

handleEmailIconClass = (action, formId) => {
    const nonUserEmail = jQuery(formId).find('span[name="nonSDPUserMail"]');
    nonUserEmail.each(function () {
        jQuery(this).removeClass(getEmailIconClass('valid'))  // Remove the valid class
            .removeClass(getEmailIconClass('warning'))  // Remove the warning class
            .addClass(getEmailIconClass(action));  // Add the respective class
    });
};

handlePermalinkWarning = (formId) => {
    let isChecked = jQuery('#isDownloadableLink').is(':checked'); // No i18n
    if (isChecked) {
        const nonUserEmail = jQuery(formId).find('span[name="nonSDPUserMail"]');
        const permalinkAlertId = '#permalinkAlert'; // No i18n
        if (nonUserEmail.length > 0) {
            if (jQuery(permalinkAlertId).length == 0) {
                const permalink_warning_info = `<div class="alert alert-dismissible alert-warning icon mt5" id="permalinkAlert" role="alert">
                <span class="msg">${translate('reports.permalink.mail.warning')}</span>
            </div>`;
                if (formId == '#EmailForm') {
                    jQuery('form[name="EmailForm"]').prepend(permalink_warning_info);
                } else {
                    jQuery('#rld-mail > .wrapscroller').prepend(permalink_warning_info);
                }
            }
            handleEmailIconClass('warning', formId);  //No i18n
        } else {
            if (jQuery(permalinkAlertId).length > 0) {
                jQuery(permalinkAlertId).remove();
            }
            handleEmailIconClass('valid', formId);  //No i18n
        }
    }
};

onChangeDownloadableLinkSchedulePage = () => {
    let isChecked = jQuery('#isDownloadableLink').is(':checked'); // No i18n
    const isSchedulePage = jQuery('#EmailForm').length > 0;
    const formId = isSchedulePage ? '#EmailForm' : '#rld-mail'; // No i18n
    const permalinkAlertId = '#permalinkAlert'; // No i18n

    let formatDivId = isSchedulePage ? '#scheduleExportTypes' : '#file_type'; // No i18n

    const handleFormatChange = (isChecked) => {
        if(isChecked) {
            if (jQuery(formatDivId).val() == 'INLINEHTML') {
                jQuery(formatDivId).val('HTML').trigger('change'); //No i18n
                showalert('info', translate('sdp.requests.history.modified', [translate("sdp.reports.customReport.format"), "Inline HTML", "HTML"]), 'isAutoHide=true,delay=5'); //No I18N
            }
            jQuery(formatDivId + ' option[value="INLINEHTML"]').prop('disabled', true); //No i18n
        } else {
            jQuery(formatDivId + ' option[value="INLINEHTML"]').prop('disabled', false); //No i18n
        }
    }

    if (isChecked) {
        handlePermalinkWarning(formId);  // Handle warning or icon changes
        // Need to change export format to HTML if INLINEHTML is selected.
        let isEmailFormChecked = false;
        if(isSchedulePage){
            isEmailFormChecked = jQuery('input[name="reportTo"][value="EmailForm"]').is(':checked'); //No i18n
        }
        handleFormatChange(isSchedulePage ? isEmailFormChecked && isChecked :  isChecked);
    } else {
        if (jQuery(permalinkAlertId).length > 0) {
            jQuery(permalinkAlertId).remove();
        }
        handleEmailIconClass(sdp_app.IS_FILE_PROTECTION_ENABLED ? 'warning':'valid', formId);  //No i18n
        handleFormatChange(false);
    }
}

loadMailIds = () => {
    let mailFields = document.querySelectorAll('input.MailField');//NO I18N
    for (let i = 0; i < mailFields.length; i++) {
        let v1 = jQuery("#" + mailFields[i].id)[0].value.split(",")
        let valu = [];
        jQuery("#" + mailFields[i].id)[0].value.split(",").forEach(function (val) {
            if (val != "" && val != "null") {
                valu.push({ id: val.trim(), text: val.trim() });
            }
        });
        if (valu.length > 0) {
            jQuery("#" + mailFields[i].id).select2("data", valu); //NO I18N
        }
    }
}
function initClickEventForCIHistoryPage(){
    jQuery('[sdpJs="js-event-CIHistoryReportMainPage-0"]').on("click", function(event) {
        this.style.display="none";
    });
    jQuery('[name="run-ci-his-report"]').on("click", function(event) {
        const module = jQuery(this).attr('data-module');
        if(validateAdvancedFilters()){
            runCIHistoryReport(null, module);
        }
    });

    jQuery('[name="exit-ci-report"]').on("click", function(event) {
        event.preventDefault();
        window.open('/CustomReportHandler.do', '_parent');
    });
}


getUserIdForMail = (toMail) => {
    let returnObj;

    if (toMail != undefined && toMail.length > 0 && validateEmailValue(toMail)) {
        const url = '/servlet/AJaxServlet'; // no i18n
        sdpAjax({
            async: false,
            url: url,
            type: 'get',//NO I18N
            data: { action: 'getUserIdForEmail', toMail: toMail },//NO I18N
            success: (resp) => {
                returnObj = resp;
            }
        });
    }
    return returnObj
}


showPrivacyPolicyInfo = (divId) => {
    // TO DO : i18n
    if(jQuery('#privacyinfo').length == 0) {
        const privacy_info_box = '<div id="privacyinfo" class="alert alert-gray icon mt5" role="alert" role="alert"><span class="msg">' + translate('sdp.reports.fileprotection.help.message') + '<ul><li>' + getEmailIcon('valid', undefined) + translate('reports.privacy.info.personalized.password') + '</li><li>' + getEmailIcon('warning', undefined) + translate('reports.privacy.info.common.password') + '</li></ul></span></div>';
        if(divId == '#EmailForm') {
            jQuery('form[name="EmailForm"]').prepend(privacy_info_box)
        } else {
            jQuery(divId).prepend(privacy_info_box);
        }
    }
}

const reportDialogDiv = 'reportDialogDiv', reportDialogDivId = '#' + reportDialogDiv; // No i18n

// Method can be user for any report page with url to show the slider dialog.
reportDialog = (url, dialog_options) => {
    if (jQuery(reportDialogDivId).length == 0) {
        jQuery(document.body).append("<div id='" + reportDialogDiv + "'></div>");
    }
    jQuery(reportDialogDivId).load(url, () => {
        jQuery(reportDialogDivId).sdp_zcomponent_dialog(dialog_options);
        initTooltip(reportDialogDivId);
    });
};

handleMatrixSummaryTypeChange = (summaryTypeId, countColumnId) => {
    let summaryType = jQuery('#' + summaryTypeId).val();
    let countColumnSelect = jQuery('#' + countColumnId);
    
    // Constants from APIReportConstants.java
    let MEMORY_TYPE = 'javax.lang.Memory'; // No i18n
    let TIME_TYPE = 'java.sql.Time'; // No i18n
    
    // If summary type is Percentage or Average, hide Memory and Time data types
    if (summaryType === 'Percentage') {
        countColumnSelect.find('option').each(function() {
            let dataType = jQuery(this).attr('data-type');
            if (dataType === MEMORY_TYPE || dataType === TIME_TYPE) {
                jQuery(this).hide();
            }
        });
        
        // If currently selected option is Memory or Time, reset to default
        let selectedOption = countColumnSelect.find('option:selected');
        let selectedDataType = selectedOption.attr('data-type');
        if (selectedDataType === MEMORY_TYPE || selectedDataType === TIME_TYPE) {
            countColumnSelect.val('-1');
        }
    } else {
        // Show all options
        countColumnSelect.find("option").show();
    }
};

handleAdvancedMatrixSummaryTypeChange = () => {
    handleMatrixSummaryTypeChange('matrixSummaryType', 'matrixCountColumn'); //No i18n
};

handleSimpleMatrixSummaryTypeChange = () => {
    handleMatrixSummaryTypeChange('simpleMatrixSummaryType', 'simpleMatrixCountColumn'); //No i18n
};