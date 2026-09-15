/* $Id$ */
var ts_timesheetData = {};
var timesheet = {
  init: function() {
    var _self = this, progress = ""; // No I18N
    this.getData(); // Stores the Timesheet Json value in ts_timesheetData object
    this.checkStatus(ts_timesheetData.timesheet.status.name); // Checks the timesheet status and hides unnecessary buttons
    // Display start and end date in the timeperiod mentioned above the Gantt chart
    jQuery("#ts_start_date").text(this.dateFormatDisplay(parseInt(ts_timesheetData.timesheet.start_date.value))); // No I18N
    jQuery("#ts_end_date").text(this.dateFormatDisplay(parseInt(ts_timesheetData.timesheet.end_date.value))); // No I18N
    // Enable or Disable the next prev button
    var idArr = Object.keys(this.table.bulkSelect.loadedRecords).reverse();
    jQuery("#timesheetView .chevron-left, #timesheetView .chevron-right").removeClass("opac5"); // No I18N
    if(idArr.indexOf(String(this.timesheetId)) == 0) {
      jQuery("#timesheetView .chevron-left").addClass("opac5"); // No I18N
    } 
    if(idArr.indexOf(String(this.timesheetId)) == idArr.length-1) {
      jQuery("#timesheetView .chevron-right").addClass("opac5"); // No I18N
    } 
    if(ts_timesheetData.timesheet && ts_timesheetData.timesheet.timecards.length) {
      this.getTimesheetConfig(); // Display the timesheet config - Week/2 Weeks/Daily in the Timesheet view
      // Gantt chart is initialised only if the timecard is present
      gantt.config.autofit = true;
      gantt.config.autosize = true;
      gantt.config.drag_links = false;
      gantt.config.drag_resize = false;
      gantt.config.drag_progress = false;
      gantt.config.drag_move = false;
      gantt.config.readonly = true;
      gantt.config.grid_width = 500;
      gantt.config.scale_height = 50;
      // Prevent triggering of any popups from gantt chart
      gantt.attachEvent("onBeforeLightbox", function() { // No I18N
        return false;
      });
      // Check if the Cell falls on a weekend and add a class to it, just to add CSS for the particular class
      gantt.templates.task_cell_class = function(task,date) {
        if(date.getDay() == 0 || date.getDay() == 6) {
          return "weekend_cell" // No I18N
        }
      }
      // This function allows us to modify the content to be displayed in each row
      gantt.templates.task_text = function(start, end, task){
        if (!task.hoursArray) {task.hoursArray = [];}
        var task_hours = ""; // No I18N
        var cell_width = jQuery(gantt.$task_scale).find(".gantt_scale_cell.gantt_last_cell")[0].getWidth(); // No I18N
        // Split the row into tasks, to display the hours in each cell
        for(var i=0; i<=_self.totalColumnIndex(); i++) {
          task.hoursArray[i] = task.hoursArray[i] || "00:00"; // No I18N
          task_hours = task_hours + "<div class='gantt_task_line' style='width: "+cell_width+"px; left: "+i*cell_width+"px'>" + task.hoursArray[i] + "</div>"; // No I18N
        }
        return task_hours;
      };
      // In case of any error from Gantt plugin, insert a debugger; inside this function and check
      gantt.attachEvent("onError", function(errorMessage){ // No I18N
        return true;
      });
      // Events to be triggered, when the Gantt DOMs are available on the page
      gantt.attachEvent("onGanttRender", function(){ // No I18N
        // Last column is used to display Total hours, So manually changing the column title to "Total"
        jQuery(".gantt_scale_cell.gantt_last_cell").text(getMessageForKey("sdp.common.total")).css("line-height","40px"); // No I18N
        // Populating the Timesheet summary
		if(window.checkIfMSPOrSCP()){
        jQuery("#ts_billable_hours").text(ts_timesheetData.timesheet.billable_time.hours+":"+ts_timesheetData.timesheet.billable_time.minutes); // No I18N
        jQuery("#ts_non_billable_hours").text(ts_timesheetData.timesheet.nonbillable_time.hours+":"+ts_timesheetData.timesheet.nonbillable_time.minutes); // No I18N
		}
        jQuery("#ts_total_logged_hours").text(ts_timesheetData.timesheet.timespent.hours+":"+ts_timesheetData.timesheet.timespent.minutes); // No I18N
        jQuery("#ts_recordsCount").text(getMessageForKey("timesheet.recordsCount",[jQuery(gantt.$grid_data).find(".gantt_row").length])); // No I18N        
      });
      // Date display format in the column title
      gantt.config.date_scale = "%D<br>%d %M"; // No I18N
      // Event triggered before the Gantt chart is rendered, setting the date range to be displayed on the Column title
      gantt.attachEvent("onBeforeGanttRender", function(){
        // configure the left column grids to be displayed in the timesheet
        gantt.config.columns = _self.columns;
        if(sdp_user.USERNAME == ts_timesheetData.timesheet.technician.name) {
          gantt.config.columns[3].hide = true;
        } else {
          gantt.config.columns[3].hide = false;
          gantt.config.columns[3].width = 30;
        }
		if(!window.checkIfMSPOrSCP()){
			gantt.config.columns[0].hide=true;
		}
       gantt.config.start_date = new Date(parseInt(ts_timesheetData.timesheet.start_date.value));
       gantt.config.end_date = gantt.date._add_days(new Date(parseInt(ts_timesheetData.timesheet.end_date.value)),1);
      });
      // Initialising the Gantt chart
      gantt.init("gantt_here"); // No I18N
      // Parsing the data to Gantt chart
      gantt.parse(this.taskJson());
      jQuery("#timesheetSummary").removeClass("hide"); // No I18N
      // populate total time Arr obj
      jQuery(".gantt_task_line.gantt_dependent_task").css("width", gantt.$task_bars.getWidth()); // No I18N
      var totalSpent = (ts_timesheetData.timesheet.timespent.hours*60*60) 
	  if(window.checkIfMSPOrSCP()){
	  totalSpent = totalSpent + (ts_timesheetData.timesheet.nonbillable_time.minutes*60);
	  }
      var totalTime = this.hoursPerPeriod * 60 * 60;
      if(totalTime == NaN) {
        totalTime = totalSpent;
      }
      var percent = totalSpent * 100/totalTime;
      if(percent > 100) {
        percent = 100;
      }
      if(this.hasApproverAccess) { 
        jQuery("#ts_progress-bar").html(this.constructProgressBar(totalSpent, totalTime)+"<span class='badge btn-success'>"+Math.floor(percent)+"%</span>"); // No I18N
      }
      jQuery("#noTimecard").addClass("hide"); // No I18N
    } else { // If there are no Timcards to display
      jQuery("#gantt_here, #recordsCount").empty().attr("style", ""); // No I18N
      jQuery("#timesheetSummary, #submitBtn").addClass("hide"); // No I18N      
      jQuery("#noTimecard").removeClass("hide"); // No I18N
      jQuery("#ts_recordsCount").text(""); // No I18N 
    }
  },
  columns: [
    {
      name: "account", // No I18N
      label: getMessageForKey("timesheet.accountProject"), // No I18N
      resize: false,
      align: "center", // No I18N
      width: 200,
      template: function(obj) {
        var project = "", isDirty = "hide"; // No I18N
        if(obj.project) {
          project = "/"+ e_html(obj.project); // No I18N
        }
        if(obj.is_dirty) {
          isDirty = ""; // No I18N
        }
        return "<span class='btn-danger vmiddle mr3 "+isDirty+"' style='display: inline-block; width: 5px; border-radius: 50%; height: 5px;'></span><span rel='uitip noopener' title='"+e_attr(obj.account)+"'>"+e_html(obj.account)+project+"</span>"; // No I18N
      }
    },
    {
      name: "title", // No I18N
      label: getMessageForKey("timesheet.entityColumnName"), // No I18N
      resize: false,
      align: "center", // No I18N
      width: 210,
      template: function(obj) {
        var hyperLink = ""; // No I18N
        if(obj.module == "Request") { // No I18N
          hyperLink = "/WorkOrder.do?woMode=viewWO&woID="+obj.entityid; // No I18N
        } else if(obj.module == "Change") { // No I18N
          hyperLink = "/ChangeDetails.do?CHANGEID="+obj.entityid; // No I18N
        } else if(obj.module == "Problem") { // No I18N
          hyperLink = "/ProblemDetails.cc?PROBLEMID="+obj.entityid; // No I18N
        } else if(obj.module == "Task") { // No I18N
          hyperLink = "/ui/tasks?mode=detail&from=showAllTasks&taskId="+obj.entityid;// No I18N
        }
        return "<a href="+hyperLink+"><span rel='uitip noopener' title='"+e_attr(obj.title)+"' target='_blank'>"+e_html(obj.title)+"</span></a>"; // No I18N
      }
    },
    {
      name: "status", // No I18N
      label: getMessageForKey("sdp.requests.common.status"), // No I18N
      resize: false,
      width: 60,
      align: "center", // No I18N
      template: function(obj) {
        return "<span rel='uitip noopener' title='"+e_attr(obj.status)+"'>"+e_html(obj.status)+"</span>"; // No I18N
      }
    },
    {
      name:"review", // No I18N
      label: "", // No I18N
      width: "30px", // No I18N
      resize:false,
      hide:false,
      template: function(obj) {
        var isvisible = "", clickable=""; // No I18N
        if(obj.hideReview) {
          isvisible = " hide"; // No I18N
        }
        if(ts_timesheetData.timesheet.status.name == "Submitted" ) { //No I18N
          clickable = "data-event="click" data-handler="timesheet.reviewTimecard("+obj.id+", event)" nonce="+sdpNonce+""; // No I18N
        }
        var className = obj.is_reviewed ? "enable" : "disable"; // No I18N
        className = className + isvisible;
        var title = obj.is_reviewed ? getMessageForKey("timesheet.markAsReviewed") : getMessageForKey("timesheet.notReviewed"); // No I18N
        return "<span rel='uitip noopener' title='"+title+"' role='img' class='reviewCard cspr icon-sm "+className+" mr3 vbase' id='review_"+obj.id+"' "+clickable+"></span>"; // No I18N
      }
    }
  ],
  timesheetId: "", // No I18N
  currentTab: "myTimesheet", // No I18N
  // Stores the Timesheet data to the object ts_timesheetData
  getData: function() {
    var is_reviewed = jQuery("#timesheetFilter").select2("data").id; // No I18N
    if(this.timesheetId) {
      sdpAjax({
        url: "/api/v3/timesheets/"+this.timesheetId, // No I18N
        method: "GET", // No I18N
        async: false,
        success: function(data) {
          ts_timesheetData = data;
        },
        error: function(data) {
          jQuery("#ts_approveStatus > div, #approverBtn, #myTimesheetBtn, #recordsCount, #recallBtn, #submitBtn").addClass("hide");// No I18N
        }
      });
    }
  },
  // Get the date in format - dd mmm yyyy
  dateFormat: function(date) {
    var date = new Date(Number(date)), day = gantt.date.to_fixed(date.getDate()), month = gantt.locale.date.month_short[date.getMonth()], year = date.getFullYear();
    return day+" "+month+" "+year; // No I18N
  },
  // Formats the ts_timesheetData to a json used to initialise the Gantt chart
  taskJson: function() {
    var taskArray = [], 
    lastRow = {
      account: getMessageForKey("timesheet.recordsCount",[ts_timesheetData.timesheet.timecards.length]), // No I18N
      title: "", // No I18N
      status: getMessageForKey("sdp.common.total"), // No I18N
      hoursArray: [],
      hideReview: true,
      start_date: new Date(parseInt(ts_timesheetData.timesheet.start_date.value)),
      end_date: gantt.date._add_days(new Date(parseInt(ts_timesheetData.timesheet.end_date.value)),4)
    };
    for(var i=0; i<ts_timesheetData.timesheet.timecards.length; i++) {
      let task = ts_timesheetData.timesheet.timecards[i];
      task.start_date = new Date(parseInt(ts_timesheetData.timesheet.start_date.value));
      task.end_date = gantt.date._add_days(new Date(parseInt(ts_timesheetData.timesheet.end_date.value)),4);
      task.hoursArray = this.hoursFormat(task.timecard_details);
      taskArray.push(task);
    }
    for(var i=0; i<=this.totalColumnIndex(); i++) {
      var totalHours = 0, totalMin =0;
      for(var j=0; j<ts_timesheetData.timesheet.timecards.length;j++) {
        var curArr = ts_timesheetData.timesheet.timecards[j].hoursArray;
        if(!curArr[i]) {
          curArr[i] = "00:00"; // No I18N
        }
        var curHour = curArr[i].split(":")[0]; // No I18N
        var curMin = curArr[i].split(":")[1]; // No I18N
        totalHours = totalHours + Number(curHour);
        totalMin = totalMin + Number(curMin);
        if (totalMin > 59) {
          totalHours = totalHours + Math.floor(totalMin/60);
          totalMin = totalMin%60;
        }
        this.totalTimeSpentArr[i] = gantt.date.to_fixed(totalHours)+":"+gantt.date.to_fixed(totalMin); // No I18N
      }
    }
    lastRow.hoursArray = this.totalTimeSpentArr;
    taskArray[ts_timesheetData.timesheet.timecards.length] = lastRow;
    return {data: taskArray};
  },
  // adds "0" to single digit and calculates total hours and total minutes
  hoursFormat: function(timecards) {
    var hourArray = [];
    var totalHours=0, totalMin=0;
    for(var i=0;i<timecards.length;i++) {
      if(String(timecards[i].dayoffset)) {
        let hours = timecards[i].hours || 0;
        let minutes = timecards[i].minutes || 0;
        if(Number(hours) < 10) {
          hours = "0" + String(hours); // No I18N
        }
        if(Number(minutes) < 10) {
          minutes = "0" + String(minutes); // No I18N
        }
        hourArray[timecards[i].dayoffset] = hours+":"+minutes; // No I18N
        totalHours = totalHours + Number(hours);
        totalMin = totalMin + Number(minutes);
      }
    }
    if (totalMin > 59) {
      totalHours = totalHours + Math.floor(totalMin/60);
      totalMin = totalMin%60;
    }
    if(Number(totalHours) < 10) {
      totalHours = "0" + String(totalHours); // No I18N
    }
    if(Number(totalMin) < 10) {
      totalMin = "0" + String(totalMin); // No I18N
    }
    hourArray[this.totalColumnIndex()] = String(totalHours)+":"+String(totalMin); // No I18N
    return hourArray;
  },
  calculateTotalTimeSpent: function() {
    var tasks = gantt.getTaskByTime(), totalColumn = this.totalColumnIndex(), totalTimePerDay = this.hoursPerDay*60*60, totalTimeSpentperDay = 0;
    var template = jQuery(".gantt_task_content").first().clone(); // No I18N
    for(var i=0; i<=totalColumn; i++) {
      var totalHours= 0, totalMin = 0;
      for(var j=0; j<tasks.length; j++) {
        var curArr = tasks[j].hoursArray;
        var curHour = curArr[i].split(":")[0]; // No I18N
        var curMin = curArr[i].split(":")[1]; // No I18N
        totalHours = totalHours + Number(curHour);
        totalMin = totalMin + Number(curMin);
        if (totalMin > 59) {
          totalHours = totalHours + Math.floor(totalMin/60);
          totalMin = totalMin%60;
        }
        this.totalTimeSpentArr[i] = gantt.date.to_fixed(totalHours)+":"+gantt.date.to_fixed(totalMin); // No I18N
      }
      template.find(".gantt_task_line")[i].innerText = this.totalTimeSpentArr[i]; // No I18N
      totalTimeSpentperDay = totalHours*60*60 + totalMin*60;
      var percent = totalTimeSpentperDay*100/totalTimePerDay;
      if(percent >= 100) {
        template.find(".gantt_task_line")[i].style.backgroundColor = "#b7f3be"; // No I18N
      } else if(percent > 50) {
        template.find(".gantt_task_line")[i].style.backgroundColor = "#ccffcb"; // No I18N
      } else {
        template.find(".gantt_task_line")[i].style.backgroundColor = "#ffbfc4"; // No I18N
      }
    }
    jQuery(".ts_total_logged_hours_data").html(template); // No I18N
  },
  // Total number of columns displayed
  totalColumnIndex: function() {
    var start_date = new Date(parseInt(ts_timesheetData.timesheet.start_date.value)).getTime();
    var end_date = new Date(parseInt(ts_timesheetData.timesheet.end_date.value)).getTime();
    return Math.floor((end_date - start_date)/(60*60*24*1000))+1;
  },
  totalTimeSpentArr: [],
  // Function triggered when submit for approval is clicked
  submitForApproval: function() {
    var _self = this;
    sdpAjax({
      url: "/api/v3/timesheets/"+_self.timesheetId+"/_submit", // No I18N
      method: "PUT", // No I18N
      success: function(data) {
        if(data.response_status.status == "success") { // No I18N         
          showalert('success',data.response_status.messages[0].message,'isAutoHide=true,delay=3,width=auto'); // No I18N
          _self.checkStatus("Submitted"); // No I18N
          // Refreshing the table component once the timesheet is submitted
          _self.table.refreshTable();
        }
      }
    })
  },
  refreshTimesheet: function() {
    var _self = this;
    sdpAjax({
      url: "/api/v3/timesheets/"+_self.timesheetId+"/_refresh", // No I18N
      method: "PUT", // No I18N
      success: function(data) {
        if(data.response_status.status == "success") { // No I18N         
          showalert('success',data.response_status.messages[0].message,'isAutoHide=true,delay=3,width=auto'); // No I18N
          gantt.clearAll();
          _self.init();
        }
      }
    })
  },
  // Function triggered when recall button is clicked
  recallTimesheet: function() {
    var _self = this;
    sdpAjax({
      url: "/api/v3/timesheets/"+_self.timesheetId+"/_recall", // No I18N
      method: "PUT", // No I18N
      success: function(data) {
        if(data.response_status.status == "success") {   // No I18N
          showalert('success',data.response_status.messages[0].message,'isAutoHide=true,delay=3,width=auto'); // No I18N
          _self.checkStatus("Recalled"); // No I18N
        }
      } 
    })
  },
  // Checks the Timesheet status - Shows/Hides buttons based on the status
  checkStatus: function(status) {
    jQuery("#ts_approveStatus > div, #approverBtn, #myTimesheetBtn, #recordsCount, #recallBtn, #submitBtn, #recallStatus").addClass("hide");// No I18N
    if(ts_timesheetData.timesheet && ts_timesheetData.timesheet.timecards.length) {
      if(sdp_user.USERNAME == ts_timesheetData.timesheet.technician.name) {
        jQuery("#myTimesheetBtn").removeClass("hide");// No I18N
        jQuery("#approverBtn").addClass("hide");// No I18N
      } else {
        jQuery("#myTimesheetBtn").addClass("hide");// No I18N
        if(sdp_user.ROLES.indexOf("ApproveTimesheet") > -1 || (ts_timesheetData.timesheet.approver!= null && sdp_user.USERNAME == ts_timesheetData.timesheet.approver.name)) { // No I18N
          jQuery("#approverBtn").removeClass("hide");// No I18N
        }
      }
      if(status == "Unsubmitted") {// No I18N
        jQuery("#ts_draft, #submitBtn").removeClass("hide");// No I18N
      } else if(status == "Submitted") {// No I18N
        jQuery("#ts_pending").removeClass("hide");// No I18N
        setTimeout(function() {
          jQuery("#recallBtn").removeClass("hide"); // No I18N
        }, 2000);
      } else if(status == "Recalled"){// No I18N
        jQuery("#ts_recall, #ts_draft").removeClass("hide");// No I18N
        jQuery("#approverBtn").addClass("hide"); // No I18N
        if(sdp_user.USERNAME == ts_timesheetData.timesheet.technician.name) {
          jQuery("#recallStatus").removeClass("hide"); // No I18N
        }
        if(this.add_worklog_after_timesheet_approval == "false") { // No I18N
          jQuery("#refreshBtn").addClass("hide"); // No I18N
        } else {
          jQuery("#refreshBtn").removeClass("hide"); // No I18N
        }
      } else if(status == "Approved") {// No I18N
        jQuery("#ts_approved").removeClass("hide");// No I18N
        jQuery("#myTimesheetBtn, #approverBtn").addClass("hide"); // No I18N
      } else if(status == "Rejected") {// No I18N
        jQuery("#ts_rejected").removeClass("hide");// No I18N
        jQuery("#approverBtn").addClass("hide"); // No I18N
        if(sdp_user.USERNAME == ts_timesheetData.timesheet.technician.name) {
          jQuery("#recallStatus").removeClass("hide");// No I18N
          if(this.add_worklog_after_timesheet_approval == "false") { // No I18N
            jQuery("#refreshBtn").addClass("hide"); // No I18N
          } else {
            jQuery("#refreshBtn").removeClass("hide"); // No I18N
          }
        }
      }
    }
  },
  // Function triggered when Reject button in Reject Timesheet popup has been clicked
  rejectTimesheet: function() {
    var inputData = {
      timesheet: {
        "timesheet_reject_comments": jQuery("#rejectComments").val() // No I18N
      }
    }, _self = this;
    sdpAjax({
      url: "/api/v3/timesheets/"+_self.timesheetId+"/_reject", // No I18N
      method: "PUT", // No I18N
      data: sdpAjaxInputData(inputData),
      success: function(data) {
        showalert('success', data.response_status.messages[0].message, 'isAutoHide=true,delay=3,width=auto'); // No I18N
        _self.checkStatus("Rejected"); // No I18N
        jQuery(".reviewCard").removeAttr('onclick'); // No I18N
      }
    });
  },
  // Opens Reject Timesheet popup
  rejectPopup: function() {
    var _self = this;
    jQuery('#reDialog').removeClass('hide');// No I18N
    jQuery( "#reDialog" ).dialog({// No I18N
      width:500,
      modal: true,
      title: getMessageForKey("timesheet.rejectTimesheet"), // No I18N
      resizable: false,
      buttons: {
        "Reject": {// No I18N
          click: function () {
              jQuery('#reDialog').dialog( 'close' );  // No I18N
              _self.rejectTimesheet();                
            },
            text: getMessageForKey('sdp.approve.reject'),// No I18N
            class: 'btn btn-primary'// No I18N
          },
        "Cancel": {// No I18N
            click: function () {
              jQuery('#reDialog').dialog( 'close' );// No I18N
            },
            text: getMessageForKey('sdp.common.cancel'),// No I18N
            class: 'btn btn-default ml10'// No I18N
        }
      }
    });
  },
  // Approves Timesheet
  approveTimesheet: function() {
    var _self = this;
    sdpAjax({
      url: "/api/v3/timesheets/"+_self.timesheetId+"/_approve", // No I18N
      method: "PUT", // No I18N
      success: function(data) {
        showalert('success', data.response_status.messages[0].message, 'isAutoHide=true,delay=3,width=auto'); // No I18N
        _self.checkStatus("Approved"); // No I18N
        jQuery(".reviewCard").removeAttr('onclick'); // No I18N
      }
    });
  },
  // While creating new Timesheet, checks whether the end date is not less than the start date
  validTimePeriod: function() {
    var start_date = new Date(jQuery("#customFromDate").val()).getTime(), end_date = new Date(jQuery("#customToDate").val()).getTime(); // No I18N
    if(start_date != "" && !isNaN(start_date) && end_date != "" && !isNaN(end_date) && end_date<start_date) { // No I18N
      alert(getMessageForKey('sdp.admin.operatinghours.greaterendtimejserror')); // No I18N
      jQuery("#customToDate").val(jQuery("#customFromDate").val()); // No I18N
    }
  },
  // reviews Single Timecard
  reviewTimecard: function(id, e) {
    e.stopPropagation();
    var is_reviewed = false;
    if(jQuery("#review_"+id).hasClass("disable")) {
      is_reviewed = true;
    }
    var inputData = {
      timecard: {
        "is_reviewed": is_reviewed // No I18N
      }
    }
    sdpAjax({
      url: "/api/v3/timecards/"+id, // No I18N
      method: "PUT", // No I18N
      data: sdpAjaxInputData(inputData),
      success: function(data) {
        showalert('success', data.response_status.status, 'isAutoHide=true,delay=3,width=auto'); // No I18N
        if(data.timecard.is_reviewed) { 
          jQuery("#review_"+id).removeClass("disable").addClass("enable").attr("title", getMessageForKey("timesheet.markAsReviewed")); // No I18N
        } else {
          jQuery("#review_"+id).addClass("disable").removeClass("enable").attr("title", getMessageForKey("timesheet.notReviewed")); // No I18N
        }
        initTooltip();
      }
    })
  },
  excludedTech: [],
  getTimesheetConfig: function() {
    var _self = this;
    sdpAjax({
      url: "/api/v3/timesheet_configurations", // No I18N
      method: "GET", // No I18N
      async: false,
      success: function(resp) {
        if(resp.timesheet_configurations) {
          jQuery(".configPeriod").addClass("hide"); // No I18N
          if(resp.timesheet_configurations[0].period) {
            var period = resp.timesheet_configurations[0].period.toLowerCase().replace(" ",""); // No I18N
            jQuery(".configPeriod#ts_"+period).removeClass("hide"); // No I18N
          }
          _self.startPeriod = resp.timesheet_configurations[0].config_start_of_period;
          _self.excludedTech = resp.timesheet_configurations[0].exclude_technicians;
          _self.timesheetCycle = resp.timesheet_configurations[0].period;
          _self.hoursPerDay = resp.timesheet_configurations[0].total_hours_per_day;
          _self.hoursPerPeriod = resp.timesheet_configurations[0].total_hours_per_period;
          _self.add_worklog_after_timesheet_approval = resp.timesheet_configurations[0].add_worklog_after_timesheet_approval
        }
      }
    })
  },
  allowedDates: [],
  getAllowedDates: function() {
    var _self = this;
    var year = new Date().getFullYear();
    sdpAjax({
      url: "/servlet/SDAjaxServlet?module=timesheet&action=getStartDates", // No I18N
      method: "GET", // No I18N
      async: false,
      success: function(resp) {
        if(resp.timesheet.start_dates.allowed_values.length) {
          _self.allowedDates = _self.allowedDates.concat(resp.timesheet.start_dates.allowed_values);
        }
      }
    })
  },
  setEndDate: function() {
    var start_date = jQuery("#eventStartTime").val(), end_date = start_date; // No I18N
    if(this.timesheetCycle == "Week") { // No I18N
      end_date = gantt.date._add_days(new Date(start_date), 6);
      end_date = this.dateFormat(new Date(end_date).getTime());
    } else if(this.timesheetCycle == "2 Weeks") { // No I18N
      end_date = gantt.date._add_days(new Date(start_date), 13);
      end_date = this.dateFormat(new Date(end_date).getTime());
    }
    jQuery("#eventEndTime").val(end_date); // No I18N
  },
  // Code for Timesheet list view starts
  table: {},
  init_tableComponent: function() {
    var _self = this, search = null;
    this.populateTechnicians();
    this.getTimesheetConfig();    
    jQuery("#ts_status").select2({ // No I18N
      minimumResultsForSearch: -1
    }).change(function() {
      _self.searchFilter();
    });
    jQuery("#filterPeriod").select2({ // No I18N
      minimumResultsForSearch: -1
    }).change(function() {
      var id = jQuery("#filterPeriod").select2("data").id; // No I18N
      if(id == "6") { // No I18N
        _self.openCustomRangePopup();
      } else {
        _self.searchFilter();
      }
    })
    if(this.currentTab == "myTimesheet") { // No I18N
      search = this.myTimesheet_defaultSearch;
      jQuery(".addnewtemplate").removeClass("hide"); // No I18N
    } else {
      search = this.timesheetApproval_defaultSearch;
      jQuery(".addnewtemplate").addClass("hide"); // No I18N
    }
    // Check if the user is excluded
    for(var i=0; i< this.excludedTech.length; i++) {
      if(sdp_user.USERNAME == this.excludedTech[i].name) {
        jQuery(".addnewtemplate").addClass("hide"); // No I18N
      }
    }
    this.table = new tableComponent(this.table_info(search), this.table_content(), this.options(search), this);
    this.table.t_obj.options.callbackAfterBodyRender = function () {
      jQuery(document).find("#timesheets_body").off().on("click","[data-timesheetid]", function() { // No I18N
        var id = jQuery(this).data().timesheetid;
        _self.switchView(id, "timesheetView"); // No I18N
      })
    }
    this.isApprover();
    if(!this.hasApproverAccess) { 
      jQuery(".nav-sdtabs li:last-child").addClass("hide"); // No I18N
      jQuery(".ts_performance").removeClass("disp-ib").addClass("hide"); // No I18N
    }
    this.getLastTimesheetDates();
  },
  myTimesheet_defaultSearch: [{
    field: "technician", // No I18N
    values: [{
      id: sdp_user.LOGGEDIN_USERID.toString()
    }],
    condition: "is", // No I18N
    logical_operator: "and" // No I18N
  }],
  timesheetApproval_defaultSearch: [{
    field: "technician", // No I18N
    values: [
      {
        "id": sdp_user.LOGGEDIN_USERID.toString()   // No I18N         
      }
    ],
    condition: "is not",// No I18N
    logical_operator: "and"// No I18N
  },
  {
    field: "status", // No I18N
    values: [
      {
        "id": "1" // No I18N
      }
    ],
    condition: "is not", // No I18N
    logical_operator: "and" // No I18N
  }],
  table_info: function(search) {
    var info = {
      fields_required: {
        end_date: {},
        technician: {},
        status: {},
        approver: {},
        billable_time: {},
        nonbillable_time: {},
        start_date: {},
        timespent: {}
      },
      list_info: {
        get_total_count: true,
        row_count: 25
      }
    }
	if(!window.checkIfMSPOrSCP()){
		delete info.fields_required.billable_time;
		delete info.fields_required.nonbillable_time;
	}
    if(search) {
      info.list_info.search_criteria = search;
    }
    return info;
  },
  table_content: function() {
    var _self = this;
    var content =  {
      header: {
        "start_date": { // No I18N
          "text": getMessageForKey("sdp.dashboard.common.select.title.timeperiod"), // No I18N
          "value_path" : "start_date.value", // No I18N
          "dataCelltransformer": _self.constructPeriod, // No I18N
          "width": "180px" // No I18N
        },
        "technician": { // No I18N
          "text": getMessageForKey("common.technician") // No I18N
        },
        "status": { // No I18N
          "text": getMessageForKey("common.status"), // No I18N
          "dataCelltransformer": _self.constructStatus // No I18N
        },
        "timespent": {// No I18N
          "text": getMessageForKey("timesheet.timespentTotalHours"), // No I18N
          "dataCelltransformer": _self.constructTimeSpent, // No I18N
          "width": "180px" // No I18N
        },
        "billable_time": { // No I18N
          "text": getMessageForKey("timesheet.billableHours"), // No I18N
          "dataCelltransformer": _self.constructHours // No I18N
        },
        "nonbillable_time": { // No I18N
          "text": getMessageForKey("timesheet.nonBillableHours"), // No I18N
          "dataCelltransformer": _self.constructHours // No I18N
        },
        "approver": { // No I18N
          "text": getMessageForKey("sdp.approval.approver") // No I18N
        }
      }
    }
	if(!window.checkIfMSPOrSCP()){
		delete content.header.billable_time;
		delete content.header.nonbillable_time;
	}
    if(_self.currentTab == "myTimesheet") { // No I18N
      delete content.header.technician;
    }
    return content;
  },
  options: function(search) {
    var _self = this;
    return {
      "paginationEnabled": true, // No I18N
      "searchEnabled": false, // No I18N
      "columnChooserEnabled": false, // No I18N
      "sortingEnabled": true, // No I18N
      "multiDeleteEnabled": true, // No I18N
      "personalize_key": "timesheet_list", // No I18N
      "callbackRowfunction": _self.rowdataConstruct, // No I18N
      "row_inputdata": _self.rowdataConstruct(_self.table_info(search)), // No I18N
      "callbackURL":"", // No I18N
      "entity_name": "timesheets", // No I18N
      "bulkSelectionSetting" : {   // No I18N
        isBulkSelectEnabled : true
      },
      "defaultpath": "/api/v3/timesheets", // No I18N
      "isFR_ListInfo_Support":true, // No I18N
      "support_search_criteria":true, // No I18N
      "isODAPI": true // No I18N
    }
  },
  rowdataConstruct: function(table_info) {
    var fields_required = table_info.fields_required;
    var inputObject = {};
    var fields_required_arr = Object.keys(fields_required);
    fields_required_arr.push('id'); // No I18N
    inputObject.fields_required = fields_required_arr;
    inputObject.list_info = table_info.list_info;
    return inputObject;
  },
  // New Timesheet button click functionality
  openPopup: function() {
    var _self = this;
    jQuery('#newTimesheet').removeClass('hide'); // No I18N
    if(!this.allowedDates.length) {
      this.getAllowedDates();
    }
    jQuery( "#newTimesheet").dialog({ // No I18N
      width:500,
      modal: true,
      resizable: false,
      title: getMessageForKey("timesheet.newTimesheet"), // No I18N
      open : function(){
          jQuery("div[aria-describedby=newTimesheet]").find("div.ui-dialog-buttonset").addClass("tc");
      },
      buttons: {
        "Create": { // No I18N
          click: function () {
            _self.submitNewTimesheet();
            jQuery('#newTimesheet').dialog( 'close' ); // No I18N
          },
          text: getMessageForKey('sdp.common.add'), // No I18N
          class: 'btn btn-primary' // No I18N
        },
        "Cancel": { // No I18N
          click: function () {
            jQuery('#newTimesheet').dialog( 'close' ); // No I18N
          },
          text: getMessageForKey('sdp.common.cancel'), // No I18N
          class: 'btn btn-default' // No I18N
        }
      },
      close: function(event, ui) {
        _self.closePopup();
      }
    });
    jQuery("#ts_techName").text(sdp_user.USERNAME); // No I18N
  },
  // Empty the input values in New Timesheet popup while closing
  closePopup: function() {
    jQuery("#eventStartTime").val(""); // No I18N
    jQuery("#eventEndTime").val(""); // No I18N
  },
  constructProgressBar: function(timespent, totalTime) {
    var percent;
    if(timespent == 0) {
      percent = 0.001;
    } else {
      percent = timespent*100/totalTime;
    }
    return "<span class='progress-bar time-progress mt3' style='width: 100px;height: 10px; background-color: #cfcfcf;overflow: hidden; border-radius: 10px;'><span class='progress-bar-success' style='display: table;height: 10px;width:"+(percent || 100)+"%'></span></span>"; // No I18N
  },
  // Function triggered on submit of New Timesheet popup
  submitNewTimesheet: function() {
    var _self = this;
    var dataVal = {
      timesheet: {
        start_date: {
          value: new Date(jQuery("#eventStartTime").val()).getTime().toString() // No I18N
        },
        end_date: {
          value: new Date(jQuery("#eventEndTime").val()).getTime().toString() // No I18N
        }
      }
    }
    if(jQuery("#eventStartTime").val() != "" && jQuery("#eventEndTime").val() != "") { // No I18N
      sdpAjax({
        url: "/api/v3/timesheets", // No I18N
        method: "POST", // No I18N
        data: sdpAjaxInputData(dataVal),
        success: function(data) {
          showalert("success",data.response_status.messages[0].message,'isAutoHide=true,delay=3,width=auto'); // No I18N
          // Opens the created Timesheet view once New Timesheet is created
          _self.switchView(data.timesheet.id, "timesheetView"); // No I18N
        },
        async: false
      });
    } else {
      showalert('failure',getMessageForKey("api.validation.mandatory"),'isAutoHide=true,delay=3,width=auto'); // No I18N
    }
  },
  // Table component - Period column construction
  constructPeriod: function(table_data, ctl) {
    var start_date = ctl.dateFormatDisplay(Number(table_data.row_data.start_date.value));
    var end_date = ctl.dateFormatDisplay(Number(table_data.row_data.end_date.value));
    return "<a class='' href='#"+table_data.row_data.id+"' data-timesheetId='"+table_data.row_data.id+"'>"+start_date+" - "+end_date+"</a>" // No I18N
  },
  // Table component - Hours related column construction
  constructHours: function(table_data, ctl) {
    var id = table_data.head_data.id;
    var minutes = table_data.row_data[id].minutes;
    var hours = table_data.row_data[id].hours;
    return hours+"h "+minutes+"m"; // No I18N
  },
  constructTimeSpent: function(table_data, ctl) {
    var id = table_data.head_data.id;
    var minutes = table_data.row_data[id].minutes;
    var hours = table_data.row_data[id].hours;
    var totalHoursPerPeriod = ctl.hoursPerPeriod * 60 * 60;
    var timeSpent = (hours*60*60) + (minutes*60);
    var progressbar = ""; // No I18N
    if(totalHoursPerPeriod == NaN) {
      totalHoursPerPeriod = timeSpent;
    }
    if(this.hasApproverAccess) { 
      progressbar = ctl.constructProgressBar(timeSpent, totalHoursPerPeriod);
    }
    return "<span class='fl mr5'>"+hours+"h "+minutes+"m</span>"+ progressbar; // No I18N
  },
  // Table component - Status column construction
  constructStatus: function(table_data, ctl) {
    var status = "", statusName = table_data.row_data.status.displayname; // No I18N
    if(table_data.row_data.status.name == "Approved") { // No I18N
      status = "sta-appr" // No I18N
    } else if(table_data.row_data.status.name == "Rejected") { // No I18N
      status = "sta-rej"; // No I18N
    } else if(table_data.row_data.status.name == "Submitted"){ // No I18N
      status = "sta-pen-appr"; // No I18N
    } else {
      status= "sta-pen-appr"; // No I18N
    }
    if(table_data.row_data.status.name == "Unsubmitted"){ // No I18N
      statusName = "timesheet.draft"; // No I18N
    }
    return "<span class='cspr icon-sm "+status+" mr5 top0' aria-label='"+getMessageForKey(statusName)+"' role='img'></span>" + getMessageForKey(statusName); // No I18N
  },
  // Format a given date in this format - Sep 20 2019
  dateFormatDisplay: function(date) {
    var formattedDate = new Date(date).toDateString();
    return formattedDate.slice(4);
  },
  // populate technicians in the Technician filter dropdown
  populateTechnicians: function() {
    var _self = this;
    // Fetching the Technician list for the exclude Technician field
    var url = "/servlet/Select2Servlet?module=technician"; // No I18N
    sdpAjax({
      url: url,
      type: 'GET', // No I18N
      contentType: "application/x-www-form-urlencoded; charset=utf-8", // No I18N
      dataType: "json", // No I18N
      success: function(resp) {
        var technicians = resp;
        var technicianList = [{id: "0", text: getMessageForKey("sdp.requests.common.select.technician"), name: getMessageForKey("sdp.requests.common.select.technician")}]; // No I18N
        for(var i=0; i<technicians.length;i++) {
          if(_self.currentTab != "myTimesheet" && sdp_user.LOGGEDIN_USERID == technicians[i].id) {  // No I18N   
            continue;        
          }
          technicianList.push({
            id: technicians[i].id,
            text: e_html(technicians[i].name),
            name: e_html(technicians[i].name)
          })
        }
        jQuery("#ts_technician").select2({ // No I18N
          placeholder: getMessageForKey("sdp.requests.common.select.technician"), // No I18N
          data: technicianList,
          escapeMarkup: function(m) { return m; }
        }).change(function(){
          _self.searchFilter();
        });
        if(_self.currentTab == "myTimesheet" && Object.keys(_self.table).length) { // No I18N
          jQuery("#ts_technician").val(sdp_user.LOGGEDIN_USERID.toString()).trigger("change"); // No I18N
          jQuery("#ts_technician_div").addClass("hide").removeClass("disp-ib"); // No I18N
        }
      }
    })
  },
  // Filter data by Technician or Status
  filterByFields: function(id) {
    var search_criteria = false;
    if(jQuery("#ts_"+id).select2("data") && jQuery("#ts_"+id).select2("data").id != "-1" && jQuery("#ts_"+id).select2("data").id != "0") { // No I18N
      search_criteria = {
        field: id,
        values: [{
          id: String(jQuery("#ts_"+id).select2("data").id)   // No I18N         
        }],
        condition: "is",// No I18N
        logical_operator: "and"// No I18N
      }
    }               
    return search_criteria;
  },
  // Filter data by a specific date range
  filterPeriod: function(customStart, customEnd) {
    var id = jQuery("#filterPeriod").select2("data") && jQuery("#filterPeriod").select2("data").id; // No I18N
    var configday = this.startPeriod;
    var first = null;
    var start_date = null;
    var end_date = null;
    var search_criteria = false;
    var currentDay = new Date();
    var currentCalendarDay = currentDay.getDay() +1;
    if(id == "1") { // No I18N
      start_date = currentDay;
      end_date = gantt.date._add_days(start_date, 1);
    } else if(id == "2") { // No I18N
      start_date = gantt.date._add_days(currentDay, -1);
      end_date = gantt.date._add_days(start_date, 1);
    } else if(id == "3") { // No I18N
     //calculate this week dates with respect to the start day in timesheet configuration	
      if(currentCalendarDay>=configday){
             first = currentDay.getDate() - (currentCalendarDay-configday);          
         }else{
             first = currentDay.getDate() + (configday-currentCalendarDay)  -7 ;
         }  
      start_date = new Date(currentDay.setDate(first));
      end_date = gantt.date._add_days(start_date, 6);
    } else if(id == "4") { // No I18N
      //calculate previous week dates with respect to the start day in timesheet configuration	
      if(currentCalendarDay>=configday){
             first = currentDay.getDate() - (currentCalendarDay-configday) -7 ;
         }else{
             first = currentDay.getDate() + (configday-currentCalendarDay) -7 -7 ;
         } 
      start_date = new Date(currentDay.setDate(first));
      end_date = gantt.date._add_days(start_date, 6);
    } else if(id == "5") { // No I18N
      //calculate last 2 weeks with respect to the start day in timesheet configuration
      if(currentCalendarDay>=configday){
             first = currentDay.getDate() - (currentCalendarDay-configday) -7 -7 ;
         }else{
             first = currentDay.getDate() + (configday-currentCalendarDay) -7 -7 -7 ;
         } 
      start_date = new Date(currentDay.setDate(first));
      end_date = gantt.date._add_days(start_date, 13);
    } else if(id == "6") { // No I18N
      if(customStart) {
        start_date = new Date(customStart);
      } else if(jQuery("#customFromDate").val() != "") { // No I18N
        start_date = new Date(jQuery("#customFromDate").val()); // No I18N
      }
      if(customEnd) {
        end_date = new Date(customEnd);
      } else if(jQuery("#customToDate").val() != "") { // No I18N
        end_date = new Date(jQuery("#customToDate").val()); // No I18N
      }
    }
    if(!start_date) {
      return search_criteria;
    }
    search_criteria = [
      {
        field: "start_date", // No I18N
        values: [start_date.getTime()],
        condition: "greater than", // No I18N
        logical_operator: "and", // No I18N
        children:[
      {
        field: "start_date", // No I18N
        values: [end_date.getTime()],
        condition: "lesser than", // No I18N
        logical_operator: "and", // No I18N
       }]},
      {
        field: "end_date", // No I18N
        values: [end_date.getTime()],
        condition: "lesser than", // No I18N
        logical_operator: "or", // No I18N
        children:[
      {
        field: "end_date", // No I18N
        values: [start_date.getTime()],
        condition: "greater than", // No I18N
        logical_operator: "and" // No I18N
      }]}
    ]
    if(jQuery("#filterPeriod").attr("data-selected") != id) { // No I18N
      if(id != "1" && !customStart && !customEnd) { // No I18N
        jQuery("#s2id_filterPeriod .select2-chosen").append(": <span class='sb'>"+this.dateFormatDisplay(start_date)+" - "+ this.dateFormatDisplay(end_date)+"</span>"); // No I18N
      } else if(id == "1"){ // No I18N
        jQuery("#s2id_filterPeriod .select2-chosen").append(": <span class='sb'>"+this.dateFormatDisplay(start_date)+"</span>"); // No I18N
      }
    }
    jQuery("#filterPeriod").attr("data-selected",id); // No I18N
    return search_criteria;
  },
  // This function is called whenever any filter is done through the Status/Technician/Period dropdowns
  searchFilter: function(customStart, customEnd) {
    var _self = this;
    var search_criteria = [];
    var tech_filter = _self.filterByFields("technician"); // No I18N
    var status_filter = _self.filterByFields("status"); // No I18N
    var period_filter = _self.filterPeriod(customStart, customEnd);
    period_filter && (search_criteria=period_filter);
    tech_filter && (search_criteria.push(tech_filter));
    status_filter && (search_criteria.push(status_filter));
    //period_filter && (search_criteria = search_criteria.concat(period_filter));
    if(!Object.keys(this.table).length) {
      return search_criteria;
    }
    if(this.currentTab != "myTimesheet") { // No I18N
      search_criteria = search_criteria.concat(this.timesheetApproval_defaultSearch);
    }
    _self.table.t_obj.table_info.list_info.search_criteria = search_criteria;
    _self.table.refreshTable();
  },
  // switches the view between Table component and Gantt view
  switchView: function(id, className) {
    var title = ""; // No I18N
    if(gantt.$container) {
      gantt.clearAll();
    }
    jQuery(".switchView").addClass("hide"); // No I18N
    className && jQuery("#"+className).removeClass("hide"); // No I18N
    if(jQuery("#ts_listview").hasClass("hide")) {  // No I18N        
      this.timesheetId = id;
      timesheet.init();
      if(ts_timesheetData.timesheet.technician.id == sdp_user.LOGGEDIN_USERID) {
        title = getMessageForKey("timesheet.myTimesheet"); // No I18N
      } else {
        title = getMessageForKey("timesheet.timesheetForApproval",[ts_timesheetData.timesheet.technician.name]); // No I18N
      }
      jQuery("#timesheetView .wizardHeader").text(title); // No I18N
    } else if(this.table.tableId) {
      this.table.refreshTable();
    } else {
      this.init_tableComponent();
    }
  },
  navigateTimesheet: function(direction) {
    var timesheetArr = this.table.visibleContents;
    for(var i=0; i<timesheetArr.length; i++) {
      if(timesheetArr[i].id == String(this.timesheetId)) {
        var cur_index = i;
      }
    }
    var added_index = -1;
    if(direction) {
      added_index = 1;
    }
    if(cur_index + added_index > -1 && cur_index + added_index < timesheetArr.length) {
      this.switchView(timesheetArr[cur_index + added_index].id,"timesheetView"); // no I18N
    }
  },
  tabChange: function(tabName) {
    this.currentTab = tabName;
    jQuery("#customPopover").addClass("hide").removeClass("disp-b"); // No I18N
    if(tabName == "myTimesheet") { // No I18N
      jQuery("#ts_technician").val(sdp_user.LOGGEDIN_USERID.toString()).trigger("change"); // No I18N
      jQuery("#ts_technician_div").addClass("hide").removeClass("disp-ib"); // No I18N
      if(!jQuery("#ts_status option[value='1']").length) { // No I18N
        jQuery("#ts_status").append('<option value="1">'+getMessageForKey("timesheet.draft")+'</option>'); // No I18N
      }
    } else {
      jQuery("#ts_status option[value='1']").remove(); // No I18N
      jQuery("#ts_technician").val(0).trigger("change"); // No I18N
      jQuery("#ts_technician_div").removeClass("hide").addClass("disp-ib"); // No I18N
    }
    this.init_tableComponent();
  },
  openCustomRangePopup: function() {
    jQuery("#customToDate, #customFromDate").val(this.nextTimesheetDate); // No I18N
    jQuery("#customPopover").removeClass("hide").addClass("disp-b"); // No I18N
  },
  closeCustomRangePopup: function(action) {
    var fromDate = jQuery("#customFromDate").val(), toDate = jQuery("#customToDate").val(); // No I18N
    if(action) {
      if(fromDate == "" || toDate == "") { // No I18N
        showalert('failure',getMessageForKey("api.validation.mandatory"),'isAutoHide=true,delay=3,width=auto'); // No I18N
        return false;
      } else {
        jQuery("#s2id_filterPeriod .select2-chosen").append(": <span class='sb'>"+this.dateFormatDisplay(fromDate)+" - "+ this.dateFormatDisplay(toDate)+"</span>"); // No I18N
        this.searchFilter(fromDate, toDate);
        jQuery("#customPopover").addClass("hide").removeClass("disp-b"); // No I18N 
      }
    } else {
      jQuery("#customPopover").addClass("hide").removeClass("disp-b"); // No I18N  
    }
  },
  populateToDate: function() {
    var to = jQuery("#customToDate").val(), from = jQuery("#customFromDate").val(), fromDate = new Date(from).getTime(); // No I18N
    var toDate = new Date();
    if(to != "") { // No I18N
      toDate = new Date(to).getTime();
    }
    if(to == "" || toDate < fromDate) { // No I18N
      jQuery("#customToDate").val(from); // No I18N
    }
  },
  getLastTimesheetDates: function() {
    var inputData = {
      "list_info":{"row_count":"25","start_index":1,"get_total_count":true,"search_criteria":[],"sort_field":"start_date.value","sort_order":"desc"} // No I18N
    }, _self = this;
    inputData.list_info.fields_required=["end_date","technician","status","approver","billable_time","nonbillable_time","start_date","timespent","id"]; // No I18N

    if(this.currentTab == "myTimesheet") { // No I18N
      inputData.list_info.search_criteria = this.myTimesheet_defaultSearch;
    } else {
      inputData.list_info.search_criteria = this.timesheetApproval_defaultSearch;
    }
	if(!window.checkIfMSPOrSCP()){
		delete inputData.fields_required.billable_time;
		delete inputData.fields_required.nonbillable_time;
	}
    sdpAjax({
      url:  "/api/v3/timesheets", // No I18N
      type: 'GET', // No I18N
      dataType: "json", // No I18N
      data: sdpAjaxInputData(inputData),
      success: function(resp) {
        if(resp.timesheets.length) {
          var fullDate =  gantt.date._add_days(new Date(parseInt(resp.timesheets[0].end_date.value)),1), nextDay = fullDate.getDate(), month = fullDate.getMonth(), year = fullDate.getFullYear();
          _self.nextTimesheetDate = gantt.locale.date.month_short[month]+" "+nextDay+" "+year; // No I18N
        }
      }
    })
  },
  isApprover: function() {
    var inputData = {
      "list_info":{"fields_required":["approver"], "start_index":1,"get_total_count":true,"search_criteria":[{"condition": "is", "field": "approver", "logical_operator": "and", "values":[{"id": String(sdp_user.LOGGEDIN_USERID)}]}]} // No I18N
    }, _self = this;
    sdpAjax({
      url:  "/api/v3/timesheets", // No I18N
      type: 'GET', // No I18N
      dataType: "json", // No I18N
      data: sdpAjaxInputData(inputData),
      async: false,
      success: function(resp) {
        if(resp.timesheets.length || sdp_user.ROLES.indexOf("ViewTimesheet") > -1) { // No I18N
          _self.hasApproverAccess = true;
        }
      }
    })
  }
}