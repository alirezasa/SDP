/* function get all schedule status */
getAllScheduleStatus = () => {
  const newUrl = '/servlet/AJaxServlet';//No i18N
  let response;
  sdpAjax({
    async: false,
    url: newUrl,
    type: 'get',//NO I18N
    data: { action: 'getAllScheduleStatus'},//NO I18N
    success: (resp) => {
      response = resp;
  }
  })
  if (response != null && response != undefined) {
    return response === true;
  }
}

//SDF - 22422 & SDF - 43984 - This js is used to construct schedule reports list view and to handle various actions
//supported by list view
var $schList={
  filter_by:{},
  isAllDisabled:getAllScheduleStatus(),
  row_count:10,
  webComponent:{
    row_inputdata:function(){
      table_info = getPersonalizeData("scheduledreports"); //no i18n
      list_info = {}
      if(jQuery.isEmptyObject(table_info)){
         list_info = {
           "list_info": { //NO I18N
             "start_index": 1, //NO I18N
             "row_count": $schList.row_count, //NO I18N
             "filter_by":jQuery.isEmptyObject($schList.filter_by)?{"name":"mine"}:$schList.filter_by //No I18N
           }
         }
        }else{
          list_info = {"list_info": table_info.list_info}//no i18n
        }
        return list_info;
       },
    width:{
      tableWidth:jQuery(window).width()-jQuery(window).width()*0.3,
      icon: function(){
        return ((this.tableWidth*1)/100)+"px";//NO I18N
      },
      toggle:function() {
        return ((this.tableWidth*8)/100)+"px";//NO I18N
      },
      reportname:function(){
          return ((this.tableWidth*19.5)/100)+"px";//NO I18N
      },
      createdby:function(){
        return ((this.tableWidth*19.5)/100)+"px";//NO I18N
      },
      nextschedule:function(){
        return ((this.tableWidth * 14) / 100) + "px";//NO I18N
      },
      lastschedule:function(){
        return ((this.tableWidth * 14) / 100) + "px";//NO I18N
      },
      mailid:function(){
        return ((this.tableWidth*19.5)/100)+"px";//NO I18N
      },
      schedulelocation:function(){
        return ((this.tableWidth*19.5)/100)+"px";//NO I18N
      }
    }
  },
  loadSchListView:function(){
    $schList.module='scheduled_report';//NO I18N
    if(WebComponents.instancePool["webc-schlist"]){
      this.filter_by = WebComponents.getInstance("webc-schlist").t_obj.table_info.list_info.filter_by;//NO I18N
      this.row_count = WebComponents.getInstance("webc-schlist").t_obj.table_info.list_info.row_count;//NO I18N
      delete WebComponents.instancePool["webc-schlist"];//NO I18N
    }
    WebComponents.render("webc-schlist");
    this.setDefaultFilterBy();
  },

  setDefaultFilterBy:function(){
    let listInfoObj=WebComponents.getInstance("webc-schlist").t_obj.table_info.list_info; //NO I18N
    let filterByValue,filterTextVal;

      if(listInfoObj.filter_by){
        filterByValue=listInfoObj.filter_by.name;
        switch(filterByValue){
          case 'all'://NO I18N
            filterTextVal=getMessageForKey('reports.schedule.allschedule');
            break;
          case 'mine'://NO I18N
            filterTextVal=getMessageForKey('reports.schedule.myschedule');
            break;
        }
      }
      else{
          filterTextVal=getMessageForKey('reports.schedule.myschedule');
      }
      jQuery("#schFilter").text(filterTextVal);
 },

  rowdataConstruct : function(table_info){
    let inputObject = {};
    inputObject.list_info = table_info.list_info;
    return inputObject;
  },

  row_construct_edit_icon:function(table_data,$schList){
    let rowData=table_data.row_data;
    let id=e_attr(rowData.id);
    let col_str = "";
    if(!(checkUserRole("ReportConfigAdmin") && rowData.created_by.id != sdp_user.LOGGEDIN_USERID )){
      col_str = '<button class="btn btn-link btn-xs clickaction pt5" type="button" title="' + translate("common.edit") + '" rel="uitip" data-action-param=' + id + ' data-action-name="$schList.editScheduledReport"><span aria-hidden="true" class="cspr edit icon-sm"></span></button>';
    }
    return col_str;
  },

  row_construct_delete_icon:function(table_data,$schList){
    let rowData=table_data.row_data;
    let id =e_attr(rowData.id);
    let col_str = '<button class="btn btn-link btn-xs clickaction pt5" type="button" title="' + translate("common.delete") + '" rel="uitip" data-action-param=' + id + ' data-action-name="$schList.deleteScheduledReport"><span aria-hidden="true" class="cspr trash icon-sm"></span></button>';
    return col_str;
  },

  row_construct_schedule_status: (table_data,$schList) => {
    const rowData=table_data.row_data;
    const taskId=rowData.id;
    let taskStatus=false;
    if(rowData.scheduler)
    {
      taskStatus=rowData.scheduler.status;
    }
    let col_str = '<label data-id="rulesenabled" data-action-param="1" rel="uitip" data-enable="false" class="disp-iflex ml5 mt3" title="' ; //No i18n
    /* SD-113751 - key displayed in message*/
    if(this.$schList.isAllDisabled){
      col_str += translate('reports.scheduledReport.suspend.info') + '"><input type="checkbox" class="togglechk" disabled><span class="slide-toggle togg-sm"><span class="switch-toggle"></span></span></label>';
    }
    else if(!rowData.scheduler || rowData.scheduler.next_schedule_time == null ){
      col_str += translate('common.disabled') + '"><input type="checkbox" class="togglechk" disabled><span class="slide-toggle togg-sm"><span class="switch-toggle"></span></span></label>';
    }
    else if(taskStatus==true){
 col_str += translate('sdp.common.enabled') + '"><input type="checkbox" data-event="change" data-handler="stausToggleChange(' + e_attr(taskId) + ',' + e_attr(''+taskStatus) + ')" nonce='+sdpNonce+' class="togglechk" checked><span class="slide-toggle togg-sm"><span class="switch-toggle"></span></span></label>';
   }
    else {
  col_str += translate('common.disabled') + '"><input type="checkbox" data-event="change"   data-handler="stausToggleChange(' + e_attr(taskId) + ',' + e_attr(''+taskStatus) + ')"  nonce='+sdpNonce+' class="togglechk"><span class="slide-toggle togg-sm"><span class="switch-toggle"></span></span></label>';
  }
    return col_str;
  },

  row_construct_reportname:function(table_data){
    let rowData=table_data.row_data;
    let reportname = rowData.report_name;
    let col_str;
    if(!rowData.scheduler || rowData.scheduler.next_schedule_time == null ) {
      col_str = '<span class="text-overflow disp-ib" rel="uitip" mode_ellipsis=true title="' + e_attr(reportname) + '" style="max-width:' + $schList.webComponent.width.reportname() + '"><strike>' + e_html(reportname) + '</strike></span>';
    } else {
      col_str = '<span class="text-overflow disp-ib" rel="uitip" mode_ellipsis=true title="' + e_attr(reportname) + '" style="max-width:' + $schList.webComponent.width.reportname() + '">' +e_html(reportname) + '</span>';
    }
    return col_str;
  },

  row_construct_createdby:function(table_data){
    let rowData=table_data.row_data;
    let createdby=rowData.created_by.name
    let col_str = '<span class="text-overflow disp-ib" rel="uitip" mode_ellipsis=true title="' + e_attr(createdby) + '" style="max-width:' + $schList.webComponent.width.createdby() + '">' + e_html(createdby) + '</span>';
    return col_str;
  },

  row_construct_nextschedule:function(table_data){
    let rowData=table_data.row_data;
    let startDate=!rowData.scheduler || rowData.scheduler.next_schedule_time == null?"[ "+ getMessageForKey("sdp.reports.reportHome.completed")+" ]":rowData.scheduler.next_schedule_time;
    let col_str = '<span class="text-overflow disp-ib" rel="uitip" mode_ellipsis=true title="' + e_attr(startDate) + '" style="max-width:' + $schList.webComponent.width.nextschedule() + '">' + e_html(startDate) + '</span>';
    return col_str;
  },

  row_construct_lastschedule:function(table_data){
    let rowData=table_data.row_data;
    let endDate=rowData.scheduler && rowData.scheduler.previous_schedule_time != undefined && rowData.scheduler.previous_schedule_time != "N/A" ? rowData.scheduler.previous_schedule_time : "-" ; //NO I18N
    let col_str = '<span class="text-overflow disp-ib" rel="uitip" mode_ellipsis=true title="' + e_attr(endDate) + '" style="max-width:' + $schList.webComponent.width.lastschedule() + '">' + e_html(endDate) + '</span>';
    return col_str;
  },

  row_construct_mailid:function(table_data){
    return this.construct_mail_fields(table_data.row_data.mail_id);
  },

  row_construct_cc_mail_id:function(table_data){
    return this.construct_mail_fields(table_data.row_data.cc_mail_id);
  },

  row_construct_bcc_mail_id:function(table_data){
    return this.construct_mail_fields(table_data.row_data.bcc_mail_id);
  },

  row_construct_schedulelocation: (table_data) => {
    let rowData = table_data.row_data;
    let scheduleLocation = rowData.schedule_location;
     /* Instead of displaying empty box '-' will be displayed */
    if('' == (scheduleLocation) || scheduleLocation == null){
      scheduleLocation = '-';
    }
    let col_str = '<span class="text-overflow disp-ib" rel="uitip" mode_ellipsis=true title="' + e_attr(scheduleLocation) + '" style="max-width:' + $schList.webComponent.width.schedulelocation() + '">' + e_html(scheduleLocation) + '</span>';
    return col_str;
  },

  construct_mail_fields: (mailId) =>{
    /* Instead of displaying empty box '-' will be displayed */
    if('' == (mailId) || mailId == null){
          mailId = '-';
    }
    let col_str = '<span class="text-overflow disp-ib" rel="uitip" mode_ellipsis=true title="' + e_attr(mailId) + '" style="max-width:' + $schList.webComponent.width.mailid() + '">' + e_html(mailId) + '</span>';
    return col_str;
  },

  changeFilter:function(all_schedule,ele){
    let tablecomp= WebComponents.getInstance("webc-schlist");//NO I18N
    let listInfoObj=tablecomp.t_obj.table_info.list_info;
    let filter_value=jQuery(ele).text();
    if(all_schedule){
      listInfoObj.filter_by={"name":"all"};// No I18N
    }
    else{
      listInfoObj.filter_by={"name":"mine"};// No I18N
    }
   jQuery("#schFilter").text(filter_value);
    tablecomp.refreshTable();
  },

  editScheduledReport:function(taskId) {
    displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true);//No I18N
    if(isMSP) {
        removeAccOnchangeinSchedule();
    }
    handleReportRequest("/ReportSchedule.do","mode=edit&task_id=" + encodeURIComponent(taskId), 'input_page');//No I18N
  },
  changeStatusScheduledReport: (taskId, taskStatus) => {
    /* prompt to get alert message */
    let confirmationPrompt = ""; // No I18N
    confirmationPrompt+= (taskStatus==true) ? "disable":"enable"; // No I18N
    confirmationPrompt+= ".tooltip"; //No I18N
    confirmationPrompt = translate(confirmationPrompt, [geti18nString("sdp.reports.customReport.schedulereport")]);
    /* prompt to dislay the reponse status*/
    let responseStatus = "common.action."; //No I18N
    let operation = taskStatus==true ? "disabled" : "enabled"; //No I18N
    let reqStatus = "failure"; //No I18N
    if (confirm(confirmationPrompt)) {
      const newUrl = '/servlet/AJaxServlet';//No i18N
      sdpAjax({
        async: false,
        url: newUrl,
        type: 'post',//NO I18N
        data: { action: 'changeReportScheduleStatus', task_id: taskId, report_status: taskStatus },//NO I18N
        success: (resp) => {
          if(resp != null && resp != undefined && resp==true){
            reqStatus = "success"; //No I18N
          }
        }
      });
      if('success' != reqStatus ){
        responseStatus += ("not."); //No I18N
      }
      responseStatus += operation;
      window.showalert(reqStatus, translate(responseStatus, [translate("sdp.reports.customReport.schedulereport")]), 'isAutoHide=true,delay=3');//NO I18N
      WebComponents.getInstance("webc-schlist").refreshTable(); // No I18N
    }
    else
    {
      WebComponents.getInstance("webc-schlist").refreshTable(); // No I18N
    }
  },
  deleteScheduledReport:function(taskId){
    if(confirm(geti18nString("sdp.reports.customReport.scheduledeletemsg")))
    {
      url = "/ReportSchedule.do"; //No I18N
      params = "mode=delete&task_id=" + encodeURIComponent(taskId); //No I18N
      requestObject = getXMLHttpRequest();
      if(requestObject)
      {
        try
        {
          requestObject.open("POST", url, true);//No I18N
          requestObject.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
          requestObject.onreadystatechange = function(){
            if(requestObject != null && requestObject.readyState == 4) {
              if(requestObject.responseText.indexOf("parent.window.open('/jsp/AuthError.jsp?module=Error', '_self');") >= 0) {
                window.showalert("failure", translate("api.deleted.failure",[getMessageForKey("sdp.reports.customReport.schedulereport")]), 'isAutoHide=true,delay=3');//NO I18N
              }else if(requestObject.status == 200){
                window.showalert("success", translate("api.deleted.success",[getMessageForKey("sdp.reports.customReport.schedulereport")]), 'isAutoHide=true,delay=3');//NO I18N
                WebComponents.getInstance("webc-schlist").refreshTable(); // No I18N
              }else{
                window.showalert("failure", translate("api.deleted.failure",[getMessageForKey("sdp.reports.customReport.schedulereport")]), 'isAutoHide=true,delay=3');//NO I18N
              }
              requestObject = undefined;
            }
          }
          requestObject.send(params);

        }
        catch(e)
        {
            alert(getMessageForKey("sdp.ajax.request.send.error") +" : " + e.message);//No I18N
        }
      }
    }
  }
}
/* method to change individual report status */
stausToggleChange = (taskId, taskStatus) => {
  $schList.changeStatusScheduledReport(taskId, taskStatus);
}

/* function to change all schedule text changes */
changeStatusText = () => {
  let icon;
  let prompt;
  let buttonText;
  let infoText;
  if($schList.isAllDisabled){
    prompt = 'state.suspended'; // No I18N
    buttonText = 'reports.scheduledReport.reinstate'; // No I18N
    icon = '<span class="aspr play-icon-sm icon-sm mr3"></span>';
    infoText = 'reports.scheduledReport.reinstated.info'; // No I18N
  }
  else{
    prompt = 'common.enabled'; // No I18N
    buttonText = 'suspend.operation'; // No I18N
    icon = '<span class="aspr stop-icon-sm icon-sm mr3"></span>';
    infoText = 'reports.scheduledReport.suspended.info'; // No I18N
  }
  let tooltip = translate("reports.scheduledReport.allScheduledReport", [translate(buttonText)]);
  jQuery('#allScheduledReportStatusInfo').attr('title', translate(infoText))
  jQuery('#allScheduledReportStatus').html(icon + translate(buttonText));
  jQuery('#allScheduledReportStatus').attr('title', tooltip);
  jQuery('#allScheduledReportStatus').prop('title', tooltip); // No i18n
  isMSP && jQuery('#allScheduledReportStatus').prop('disabled', getAccountId()!="0"); //No I18N
}
/* function to change all schedule Status*/
changeAllScheduleStatus = () => {
  const allScheduledReportStatus = $schList.isAllDisabled
  let buttonText;
  if (allScheduledReportStatus) {
    buttonText = 'reports.scheduledReport.reinstate'; // No I18N
  }
  else {
    buttonText = 'suspend.operation'; // No I18N
  }
  if (confirm(translate("reports.scheduledReport.allScheduledReport", [translate(buttonText)]))) {
  let response ;
  sdpAjax({
    async: false,
    url: '/servlet/AJaxServlet',//NO I18N
    type: 'post',//NO I18N
    data: { action: `changeAllScheduleStatus`, allScheduledReportStatus: !allScheduledReportStatus },
    success: (resp) =>{
      response = resp;
    }
  })
  if (response != null && response != undefined) {
    const isAllDisabled = response;
    let prompt;
    let buttonText;
    if (true  === isAllDisabled) {
      prompt = 'state.suspended'; // No I18N
      buttonText = 'reports.scheduledReport.reinstate'; // No I18N
    }
    else{
      prompt = 'reports.scheduledReport.reinstate'; // No I18N
      buttonText = 'suspend.operation'; // No I18N
    }
    window.showalert("success", translate("reports.scheduledReport.allScheduledReport",[translate(prompt)]), 'isAutoHide=true,delay=3');//NO I18N
    $schList.isAllDisabled = getAllScheduleStatus();
    changeStatusText();
    WebComponents.getInstance("webc-schlist").refreshTable(); // No I18N
    }
  }
}