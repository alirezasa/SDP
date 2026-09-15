var scheduleScanSettings = {
  defaultTimeZone:'Asia/Calcutta',//No I18N
  init: function(){
      var self = scheduleScanSettings;
      window.name="wsListView"; //No I18N
  },

  /**************
     * This function gets schedule scan details form the server
  * **************/
  loadScheduleScanSettings: function () {
      var self = scheduleScanSettings;
      sdpAjax({
                async: false,
                success: function(response) {
                  if(response.uemScheduleSettings.status == "failure"){
                     self.disableUEMScheduleSettings();
                     if(response.uemScheduleSettings.remarks != undefined){
                       showalert("failure", translate(encodeHTML(response.uemScheduleSettings.remarks), [encodeHTML(response.uemScheduleSettings.uem_integ_prod)]), "isAutoHide=true"); //No I18N
                     }
                     else{
                       showalert("failure", translate( "uem.sched.unexpectederror",[encodeHTML(response.uemScheduleSettings.uem_integ_prod)]), "isAutoHide=true"); //No I18N
                     }
            self.setScheduleSettings(response);
                  }
                  else if(response.scheduleSettings.status == "failure"){
                    showalert("failure",translate("schedule.get.failure"),"isAutoHide=false"); //No I18N
                  }
                  else if(response.rediscoverySettings.status == "failure"){
                       showalert("failure",translate("schedule.rediscovery.get.failure"),"isAutoHide=false"); //No I18N
                  }
                  else if(response.auditCleanupSettings.status == "failure"){
                      showalert("failure",translate("schedule.auditcleanup.get.failure"),"isAutoHide=false"); //No I18N
                  }
                  else{
                      self.setScheduleSettings(response);
                  }
                },
                url: "/ScheduleScanning.do?action=getDetails" //No i18N
            });
    },

    /**************
       * This function is used to switch between the views in UEM schedule settings : Daily,Weekly,Monthly
    * **************/
    switchViewsByFreqType: function (toShow,toHide1,toHide2) {
      jQuery("[child="+toHide1+"],[child="+toHide2+"]").hide();
      jQuery("[child="+toShow+"]").show();
      if(toShow == 'Monthly_div'){
        jQuery('input[name=monthly_frequency_type][value=WeekDay]').click()
      }
    },



    /**************
             * This function is used to assign the values obtained in loadschedulesettings to respective fields
    * **************/
    setScheduleSettings: function(response) {

      var self = scheduleScanSettings;
      var scheduleType = response.scheduleSettings.scheduleType;
      response.isAssetBuild = isAssetBuild;
      response.dateFormat = dateFormat;
      renderhbs("#scheduleSettingsContainer","scan-schedule-scan-settings",response,false,"scan",null,null,function(){// No I18N
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-0']").on("click",function(){ // No I18N
                      scheduleScanSettings.switchViewsByFreqType('Daily_div','Weekly_div','Monthly_div');// No I18N
                  });
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-1']").on("click",function(){ // No I18N
                      scheduleScanSettings.switchViewsByFreqType('Weekly_div','Monthly_div','Daily_div');// No I18N
                  });
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-2']").on("click",function(){   // No I18N
                      scheduleScanSettings.switchViewsByFreqType('Monthly_div','Daily_div','Weekly_div');// No I18N
                  });
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-3']").on("click",function(){   // No I18N
                        initCalendar('uem_dailyDate');// No I18N
                  });
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-55']").on("click",function(){   // No I18N
                        initCalendar('dailyTime');// No I18N
                  });
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-4']").on("click",function(){   // No I18N
                        scheduleScanSettings.checkDays(true);
                    });
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-47']").on("click",function(){   // No I18N
                                            scheduleScanSettings.checkDays(false);
                                        });
                  jQuery(document).on("click","[sdpJs='js-event-scan-schedule-scan-settings-5'], [sdpJs='js-event-scan-schedule-scan-settings-6'], [sdpJs='js-event-scan-schedule-scan-settings-7'], [sdpJs='js-event-scan-schedule-scan-settings-8'], [sdpJs='js-event-scan-schedule-scan-settings-9'], [sdpJs='js-event-scan-schedule-scan-settings-10'], [sdpJs='js-event-scan-schedule-scan-settings-11']",function(){ // No I18N
                  scheduleScanSettings.checkEveryDayUEM();
                                    });
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-14']").on("click",function(){ // No I18N
                  scheduleScanSettings.blockInvalidMonths();
                                    });
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-15']").on("click",function(){ // No I18N
                  scheduleScanSettings.checkMonths(true);
                                    });

                jQuery(document).on("click","[sdpJs='js-event-scan-schedule-scan-settings-16'], [sdpJs='js-event-scan-schedule-scan-settings-17'], [sdpJs='js-event-scan-schedule-scan-settings-18'], [sdpJs='js-event-scan-schedule-scan-settings-19'], [sdpJs='js-event-scan-schedule-scan-settings-20'], [sdpJs='js-event-scan-schedule-scan-settings-21'], [sdpJs='js-event-scan-schedule-scan-settings-22'], [sdpJs='js-event-scan-schedule-scan-settings-23'], [sdpJs='js-event-scan-schedule-scan-settings-24'], [sdpJs='js-event-scan-schedule-scan-settings-25'], [sdpJs='js-event-scan-schedule-scan-settings-26'], [sdpJs='js-event-scan-schedule-scan-settings-27']",function(){ // No I18N
                scheduleScanSettings.checkEveryMonthUEM();
                                  });

                jQuery("[sdpJs='js-event-scan-schedule-scan-settings-28']").on("click",function(){ // No I18N
                viewModuleHistory(this);
                                  });

                jQuery("[sdpJs='js-event-scan-schedule-scan-settings-29']").on("click",function(){ // No I18N
                scheduleScanSettings.scanchoice('Once','Weekly','Daily','Monthly','Periodic','scanchoice1');closeCalDialog();// No I18N
                                                    });
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-30']").on("click",function(){ // No I18N
                  scheduleScanSettings.scanchoice('Daily','Weekly','Monthly','Once','Periodic','dailyLabel');closeCalDialog();// No I18N
                                    });
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-31']").on("click",function(){ // No I18N
                  scheduleScanSettings.scanchoice('Weekly','Monthly','Daily','Once','Periodic','weeklyLabel');closeCalDialog();// No I18N
                                    });

                jQuery("[sdpJs='js-event-scan-schedule-scan-settings-32']").on("click",function(){ // No I18N
                scheduleScanSettings.scanchoice('Monthly','Weekly','Daily','Once','Periodic','monthlyLabel');closeCalDialog();// No I18N
                                  });

                jQuery("[sdpJs='js-event-scan-schedule-scan-settings-33']").on("click",function(){ // No I18N
                scheduleScanSettings.scanchoice('Periodic','Monthly','Daily','Once','Weekly','periodicLabel');closeCalDialog()// No I18N
                                  });
                jQuery("[sdpJs='js-event-scan-schedule-scan-settings-34']").on("click",function(){ // No I18N
                    scheduleScanSettings.checkMonths(false);
                });
                jQuery(document).on("click","[sdpJs='js-event-scan-schedule-scan-settings-35'], [sdpJs='js-event-scan-schedule-scan-settings-39'], [sdpJs='js-event-scan-schedule-scan-settings-37'], [sdpJs='js-event-scan-schedule-scan-settings-38'], [sdpJs='js-event-scan-schedule-scan-settings-38'], [sdpJs='js-event-scan-schedule-scan-settings-40'], [sdpJs='js-event-scan-schedule-scan-settings-41'], [sdpJs='js-event-scan-schedule-scan-settings-42'], [sdpJs='js-event-scan-schedule-scan-settings-43'], [sdpJs='js-event-scan-schedule-scan-settings-44'], [sdpJs='js-event-scan-schedule-scan-settings-45'], [sdpJs='js-event-scan-schedule-scan-settings-46']",function(){ // No I18N
                scheduleScanSettings.checkEveryMonth();
                                                    });
                  jQuery(document).on("click","[sdpJs='js-event-scan-schedule-scan-settings-48'], [sdpJs='js-event-scan-schedule-scan-settings-49'], [sdpJs='js-event-scan-schedule-scan-settings-50'], [sdpJs='js-event-scan-schedule-scan-settings-51'], [sdpJs='js-event-scan-schedule-scan-settings-52'], [sdpJs='js-event-scan-schedule-scan-settings-53'], [sdpJs='js-event-scan-schedule-scan-settings-54']",function(){ // No I18N
                  scheduleScanSettings.checkEveryDay();
                                    });
                  jQuery("[sdpJs='js-event-scan-schedule-scan-settings-56']").on("click",function(){ // No I18N
                  showCalendar('onceDate',false,'%Y-%m-%d');// No I18N
                                    });

                jQuery("[sdpJs='js-event-scan-schedule-scan-settings-57']").on("click",function(){ // No I18N
                scheduleScanSettings.checkSubmission();
                                  });

                jQuery("[sdpJs='js-event-scan-schedule-scan-settings-58']").on("click",function(){ // No I18N
                scheduleScanSettings.resetScheduleForm();return false;
                                  });


      });

      jQuery("#weeklyTimeUEM").ZSDPCalendar({type : "timefield",calendar_options: {"placeholder": "HH:mm",width: 260},dateTimeFormat:"HH:mm", data:[{}]}); //No I18N
      jQuery("#monthlyTimeUEM").ZSDPCalendar({type : "timefield",calendar_options: {"placeholder": "HH:mm",width: 260},dateTimeFormat:"HH:mm", data:[{}]}); //No I18N
      jQuery("#OnceTime").ZSDPCalendar({type : "timefield",calendar_options: {"placeholder": "HH:mm",width: 160 },dateTimeFormat:'HH:mm', data:[{}]})  //No I18N
      jQuery("#weeklyTime").ZSDPCalendar({type : "timefield",calendar_options: {"placeholder": "HH:mm",width: 120},dateTimeFormat:"HH:mm", data:[{}]}); //No I18N
      jQuery("#monthlyTime").ZSDPCalendar({type : "timefield",calendar_options: {"placeholder": "HH:mm",width: 120},dateTimeFormat:"HH:mm", data:[{}]}); //No I18N
      jQuery('select[name="monthlyWeekNum"]').select2();
      jQuery('select[name="monthlyWeekNum"]').select2('val',1); //NO I18N
     if(scheduleType == "Once"){
        self.scanchoice('Once','Weekly','Daily','Monthly','Periodic','scanchoice1');  //No I18N
        jQuery("#onceDate").val(response.scheduleSettings.onceDate);
        jQuery("#OnceTime").ZSDPCalendar({type : "timefield",calendar_options: {width: 160,"placeholder": "HH:mm"},dateTimeFormat:'HH:mm', data:[{'display_value':response.scheduleSettings.onceTime}]})  //No I18N
      }
      else if(scheduleType == 'Weekly'){
        self.scanchoice('Weekly','Monthly','Daily','Once','Periodic','weeklyLabel');  //No I18N
        jQuery("#weeklyTime").ZSDPCalendar({type : "timefield",calendar_options: {"placeholder": "HH:mm",width: 120},dateTimeFormat:'HH:mm', data:[{'display_value':response.scheduleSettings.weeklyTime}]})  //No I18N
        var days = response.scheduleSettings.selectedDays;

        jQuery("#everyDayWeekly").prop('checked',false);  //No I18N
        self.checkDays(false);

        for(i=1;i<7;i++) {
          jQuery("input[name=selectedDays][value=" + i+ "]").prop('checked', false);  //No I18N
        }
        for(i=0,len=days.length;i<len;i++) {
          jQuery("input[name=selectedDays][value=" + encodeHTMLAttribute(days[i])+ "]").prop('checked', true);  //No I18N
        }
      }
      else if(scheduleType == 'Daily'){
        self.scanchoice('Daily','Weekly','Monthly','Once','Periodic','dailyLabel');  //No I18N
        jQuery('#dailyTime_Display').val(response.scheduleSettings.dailyTimeDisplayValue);
        jQuery('#dailyTime').val(response.scheduleSettings.dailyTime);
      }
      else if(scheduleType == 'Monthly'){
        self.scanchoice('Monthly','Weekly','Daily','Once','Periodic','monthlyLabel'); //No I18N
        jQuery("input[name='weekOrDay'][value="+encodeHTMLAttribute(response.scheduleSettings.weekOrDay)+"]").prop("checked",true);  //No I18N
        if(response.scheduleSettings.weekOrDay == 'Day'){
          jQuery("[name='dayOfMonth']").val(response.scheduleSettings.dayOfMonth);
        }
        else if(response.scheduleSettings.weekOrDay == 'WeekDay'){

          jQuery("[name='dayOfWeek']").val(response.scheduleSettings.dayOfWeek);
        }
        var months = response.scheduleSettings.selectedMonths
        for(var i=0;i<11;i++) {
          jQuery("input[name=selectedMonths][value=" + i+ "]").prop('checked', false); //No I18N
        }
        for(var i=0,len=months.length;i<len;i++) {
          jQuery("input[name=selectedMonths][value=" + encodeHTMLAttribute(months[i])+ "]").prop('checked', true);  //No I18N
        }
        jQuery("#monthlyTime").ZSDPCalendar({type : "timefield",calendar_options: {"placeholder": "HH:mm",width: 120},dateTimeFormat:'HH:mm', data:[{'display_value':response.scheduleSettings.monthlyTime}]})  //No I18N

      }
      else if(scheduleType == 'Periodic'){
        self.scanchoice('Periodic','Monthly','Daily','Once','Weekly','periodicLabel');  //No I18N
      }

      var uemSettings = response.uemScheduleSettings;
      if(uemSettings.is_installed == true && uemSettings.is_reachable && uemSettings.is_compatible && uemSettings.status != "failure"){
         if(uemSettings.is_schedule_configured == false){
          jQuery("#wcag-enbSch-uem").removeAttr("disabled"); //No I18N
          self.loadUEMTimeZones();
          self.enableUEMScheduleSettings();
          
      }
      else{

        var uemSchedType = uemSettings.scheduleType;
        jQuery("#wcag-enbSch-uem").prop("checked",!uemSettings.schedulerDisabled); //No i18N
        jQuery("input[name=uemScheduleType][value=" + uemSchedType + "]").prop('checked', true);  //No I18N
        if(uemSchedType == 'Daily'){
          self.switchViewsByFreqType('Daily_div','Weekly_div','Monthly_div');   //No I18N
          jQuery("[name='frequencyvalue_daily']").val(encodeHTMLAttribute(uemSettings.dailyIntervalType));
          jQuery("#uem_dailyDate_Display").val(uemSettings.dailyTimeDisplayValue);
          jQuery("#uem_dailyDate").val(uemSettings.dailyTime);
        }
        else if(uemSchedType == 'Weekly'){
          self.switchViewsByFreqType('Weekly_div','Monthly_div','Daily_div'); //No I18N
          jQuery("#weeklyTimeUEM").ZSDPCalendar({type : "timefield",calendar_options: {"placeholder": "HH:mm",width: 260},dateTimeFormat:"HH:mm", data:[{'display_value':uemSettings.weeklyTime}]})  //No I18N
          var days = uemSettings.daysOfWeek;
          jQuery("#everyDay").prop('checked',false);  //No I18N
          scheduleScanSettings.checkDays(true);
          for(var i=0,len=days.length;i<len;i++) {
            jQuery("input[name=uemSelectedDays][value=" + days[i]+ "]").prop('checked', true);  //No I18N
          }

        }
        else if(uemSchedType == 'Monthly'){ //Monthly
          self.switchViewsByFreqType('Monthly_div','Weekly_div','Daily_div');  //No I18N
          jQuery("#monthlyTimeUEM").ZSDPCalendar({type : "timefield",dateTimeFormat:'HH:mm',calendar_options: {"placeholder": "HH:mm",width: 260}, data:[{'display_value':uemSettings.monthlyTime}]})  //No I18N
          var monthlyPerform = uemSettings.monthlyPerform;
          if(monthlyPerform == 'WeekDay'){
            jQuery("#monthly_day").prop('checked',false);   //No I18N
            jQuery("#monthly_week").prop('checked',true).trigger("click");
            var monthlyArray = uemSettings.monthlyWeekNum.split(",");
            jQuery('select[name="monthlyWeekNum"]').select2('val',monthlyArray); //NO I18N
            jQuery("[name=monthlyWeekDay]").val(parseInt(uemSettings.monthlyWeekDay));

          }
          else{//day
            jQuery("#monthly_week").prop('checked',false);  //No I18N
            jQuery("[name=monthlyDay]").val(parseInt(uemSettings.monthlyDay));
            jQuery("#monthly_day").prop('checked',true).trigger("click");


          }
          var months = uemSettings.monthsList;
          jQuery("#everyMonthUEM").prop('checked',false); //No I18N
          scheduleScanSettings.checkMonths(true);
          for(var i=0,len=months.length;i<len;i++) {
            jQuery("input[name=monthsList][value=" + encodeHTMLAttribute(months[i])+ "]").prop('checked', true); //No I18N
          }
        }
        var taskTimeZoneObj = uemSettings.taskTimeZone;
        self.loadUEMTimeZones();
    if(taskTimeZoneObj != undefined && taskTimeZoneObj.id != undefined){
    jQuery('#taskTimeZone').select2('data',{"id":taskTimeZoneObj.id,"text":taskTimeZoneObj.displayName+ "(" + taskTimeZoneObj.id+ ")"},true); //NO I18N
    }
        self.enableUEMScheduleSettings();

       }
  }

      self.unfreezeScheduleSettingsSection();

  },

  /**************
    * This function is used to switch between view in schedule settings based on scan type
   * **************/
 scanchoice: function (toShow,toHide1,toHide2,toHide3,toHide4,choice)
  {
     jQuery("#"+toHide1+",#"+toHide2+",#"+toHide3+",#"+toHide4).hide();
     jQuery("#"+toShow).show();
  },
  /**************
    * This function is used to disable uem schedule settings section
   * **************/
  disableUEMScheduleSettings: function (){
      jQuery("#uem-schedule-table").addClass("disableDiv");
      jQuery("#wcag-enbSch-uem").attr("disabled", true);
   },
   /**************
     * This function is used to enable uem schedule settings section
    * **************/
   enableUEMScheduleSettings: function (){
       jQuery("#uem-schedule-table").removeClass("disableDiv");
       jQuery("#wcag-enbSch-uem").removeAttr("disabled");  //no i18n
   },
   /**************
      * This function is used to freeze schedule settings while getting schedule settings
     * **************/
   freezeScheduleSettingsSection: function () {
           jQuery("#schedule-table").addClass("disableDiv");
           jQuery("#freezeConfig .loading1").hide();
       },
  unfreezeScheduleSettingsSection: function (){
       jQuery("#schedule-table").removeClass("disableDiv");
       jQuery(".loading1").hide();
   },
   /**************
   * This function is used to get the list of UEM timezones to display in UEM settings.
   * **************/
   loadUEMTimeZones: function() {
      sdpAjax({
                url:"/DCActions.do", //NO I18N
                data : "action=getTimeZones",  //NO I18N
                type: "GET", //NO I18N
                dataType: "json", //NO I18N
                async: false,
                success: function(data){

                  if(data.timeZonesList != null)
                  {

                    var defaultID = data.default_id;
                    var defaultDisplayName = data.default_display_name;
                    var browserID = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    var timeZonesList = data.timeZonesList;
                    var modifiedList = new Array();

                    timeZonesList.forEach(function(s) {
                      var key = s.id;
                      var value = s.displayName;
                      if(key == browserID){
                              defaultID = browserID;
                              defaultDisplayName = value;
                            }

                            modifiedList.push({"id":key,"text":value}); //NO I18N

                    });
                    jQuery('#taskTimeZone').select2({
                          data: modifiedList
                      });
                    if(defaultID != undefined && defaultDisplayName){
                      defaultTimeZone = defaultID;
                      jQuery('#taskTimeZone').select2('data',{"id":defaultID,"text":defaultDisplayName},true); //NO I18N
                    }
                  }
                  else
                  {
                    showalert("failure",translate("sdp.api.errormessage.unknownerror"),'isAutoHide=false,delay=3,width=400') //NO I18N
                  }
                }
      })
  },

   /**************
   * This function is used to switch display and hide the field Monthly Days and Date in Monthly scan for UEM schedule settings
   * **************/
   switchViewsByMonthlyType: function(toShow,toHide) {
      jQuery("[child="+toHide+"]").hide();
      jQuery("[child="+toShow+"]").show();
      scheduleScanSettings.blockInvalidMonths();
  },
  /**************
   * This function is used to validate the schedule settings
   * **************/
  checkSubmission: function()
  {
  if(sdp_app.IS_DEMO_BUILD) {
      showalert('failure',getMessageForKey('sdp.setup.orgdef.demoonline.jserror'),'isAutoHide=true,delay=3');//No I18N
      return false;
  }
  var self = scheduleScanSettings;
  var form = document.forms.schedule_scan_settings;
  var data = {};
  if(jQuery("#wcag-enbSch-uem").is(":checked")){
      var uemScheduleSettings = {};

      var uemScheduleType = jQuery("input[name='uemScheduleType']:checked").val();
      uemScheduleSettings.taskTimeZone =jQuery("#taskTimeZone").val();
      uemScheduleSettings.scheduleType = uemScheduleType;
      uemScheduleSettings.schedulerDisabled = false;
      if(uemScheduleType == 'Daily'){
      var dailyTimeUEM = jQuery("#uem_dailyDate").val();
      if(dailyTimeUEM == undefined || dailyTimeUEM == ''){
              alert(translate("sdp.admin.auditsettings.scaninterval.choosedate"));

              jQuery("#uem_dailyDate").focus();
              return false;
          }
      uemScheduleSettings.dailyTimeUEM = dailyTimeUEM

      var dailyIntervalType = jQuery("[name='frequencyvalue_daily']").val();
      if(!(dailyIntervalType== 'everyDay' || dailyIntervalType== 'alternativeDays' || dailyIntervalType== 'weekDays')){

          jQuery("[name='frequencyvalue_daily']").focus();
          return false;
      }
      uemScheduleSettings.dailyIntervalType = dailyIntervalType;
      }
      else if(uemScheduleType == 'Monthly'){
      var monthlyTime = jQuery("#monthlyTimeUEM").ZSDPCalendar("getComponentDateObject").value.dateString   //No I18N
      if(monthlyTime == undefined || monthlyTime == ''){
          alert(translate("sched.invalid.startat.time"));

              jQuery("#monthlyTimeUEM").focus();
              return false;
      }
      uemScheduleSettings.monthlyTimeUEM = monthlyTime;
      var monthlyPerform = jQuery("input[name='monthly_frequency_type']:checked").val();

      if(monthlyPerform == 'WeekDay'){
         if(jQuery('select[name="monthlyWeekNum"]').select2("data").length <1){
            alert(translate("schedulesetting.monthlyweeknum.empty"));

            jQuery('#monthlyWeekNum').focus();
            return false;
         }
         uemScheduleSettings.monthlyWeekNum =  jQuery("[name='monthlyWeekNum']").val().join();
          uemScheduleSettings.monthlyWeekDay = form.monthlyWeekDay.value;
      }
      else if(monthlyPerform == 'Day'){
          uemScheduleSettings.monthlyDay = form.monthlyDay.value;
          scheduleScanSettings.blockInvalidMonths();
      }
      else{
          jQuery("#monthly_frequency_type").focus();
      }
      uemScheduleSettings.monthlyPerform = monthlyPerform;

      var monthsList = [];
      jQuery("input:checkbox[name=monthsList]:checked").each(function(){
          monthsList.push(jQuery(this).val().toString());
      });
      if(monthsList.length == 0){
          alert(translate("uem.monthslist.selectone"));

          jQuery("#selectedMonthsDiv").focus();
          return false;
      }
      uemScheduleSettings.monthsList = monthsList.join();
      }
      else {
      var weeklyTime = jQuery("#weeklyTimeUEM").ZSDPCalendar("getComponentDateObject").value.dateString   //No I18N
      if(weeklyTime == undefined || weeklyTime == ''){
          alert(translate("sched.invalid.startat.time"));

              jQuery("#weeklyTimeUEM").focus();
              return false;
      }
      uemScheduleSettings.weeklyTimeUEM = weeklyTime;
      var daysOfWeek = [];
      jQuery("input:checkbox[name=uemSelectedDays]:checked").each(function(){
          daysOfWeek.push(jQuery(this).val().toString());
      });
      if(daysOfWeek.length == 0){
          alert(translate("sdp.admin.auditsettings.scaninterval.chooseweek"));

          jQuery("#selectedDaysDiv").focus();
          return false;
      }
      uemScheduleSettings.daysOfWeek = daysOfWeek.join();
      }
      data.uemScheduleSettings = sdpToJSON(uemScheduleSettings);
  }
  else if((!sdp_app.IS_MSPOrSCP ||  sdp_feature_status.is_dc_enabled) && !jQuery("#wcag-enbSch-uem").prop('disabled') ){
      var uemScheduleSettings = {};
      uemScheduleSettings.schedulerDisabled = true;
      data.uemScheduleSettings = sdpToJSON(uemScheduleSettings);
  }


      if(form.enableSchedule.checked == true)
      {
      var scheduleSettings = {};
          var scheduleTypeValue= form.scheduleType.value;

      scheduleSettings.isEnabled = true;
      scheduleSettings.scheduleType = scheduleTypeValue;
          if (scheduleTypeValue == "Monthly")
          {

              //Check if atleast one item is selected.
              var monthlyMonthsCheck=false;
      var monthsSelected = [];
              for(var j = 0,len=form.selectedMonths.length; j <len ; j++)
              {
                  if (form.selectedMonths[j].checked == true)
                  {
                      monthlyMonthsCheck=true;
          monthsSelected.push(form.selectedMonths[j].value);
                  }
              }

              if(monthlyMonthsCheck == false)
              {
                  alert(translate("sdp.admin.auditsettings.scaninterval.choosemonth"));
                  return false;
              }
      scheduleSettings.selectedMonths = monthsSelected;


              var weekOrDay= form.weekOrDay.value;


              if(weekOrDay == 'WeekDay' || weekOrDay == 'Day')
              {
                  scheduleSettings.weekOrDay = weekOrDay;
          if(weekOrDay == 'WeekDay'){
          scheduleSettings.dayOfWeek =form.dayOfWeek.value;
          }
          else{
          scheduleSettings.dayOfMonth = form.dayOfMonth.value;
          }
              }
          else{
              alert(translate("sdp.admin.auditsettings.scaninterval.selectdayordate"));
                      return false;
          }
          monthlyTime = jQuery("#monthlyTime").ZSDPCalendar("getComponentDateObject").value.dateString   //No I18N
            if(monthlyTime == undefined || monthlyTime == ''){
                  alert( translate("auditsettings.scaninterval.enterTime"));
                  return false;
            }
          scheduleSettings.monthlyTime = monthlyTime;
      }

     else if(scheduleTypeValue == "Weekly")
          {
                var selectedDays = [];
              //Check any one of the item is selected.
              var daysOfWeekCheck=false;
              for(var j = 0,len=form.selectedDays.length; j < len; j++)
              {
                  if (form.selectedDays[j].checked == true)
                  {
                      daysOfWeekCheck=true;
          selectedDays.push(form.selectedDays[j].value);
                  }
              }


              if(daysOfWeekCheck == false)
              {
                  alert(translate("sdp.admin.auditsettings.scaninterval.chooseweek"));
                  return false;
              }
              weeklyTime = jQuery("#weeklyTime").ZSDPCalendar("getComponentDateObject").value.dateString   //No I18N
              if(weeklyTime == undefined || weeklyTime == ''){
                    alert( translate("auditsettings.scaninterval.enterTime"));

                    jQuery("#weeklyTime").focus();
                    return false;
              }
      scheduleSettings.selectedDays = selectedDays;
      scheduleSettings.weeklyTime = weeklyTime
          }

          else if(scheduleTypeValue == "Daily")
          {

              var dailyTime =  jQuery("#dailyTime").val(); //no i18n
              if(dailyTime == undefined || dailyTime == ''){
                  alert( translate("sdp.admin.auditsettings.scaninterval.choosedate") );
                  jQuery("#dailyTime").focus();
                  return false;
              }





              if(dailyTime <= new Date()){
                alert( translate("sdp.reports.errmsg.invalidtimedateexception") );
                jQuery("#dailyTime").focus();
                return false;
             }

              scheduleSettings.dailyTime = dailyTime;

          }

          else if(scheduleTypeValue == "Once")
          {

              if((form.onceDate.value == "") || (form.onceDate.value == null))
              {
                  alert(translate("sdp.admin.auditsettings.scaninterval.choosedate"));
                  form.onceDate.focus();
                  return false;
              }
              const onceDateRegex = /[0-9]{2,4}-[0-9]{1,2}-[0-9]{1,2}/

              var yyyymmdd = form.onceDate.value;
              if(!yyyymmdd.match(onceDateRegex)){
                alert(translate("schedulesetting.invaliddate"));
                form.onceDate.focus();
                return false;

              }
              var onceTime = jQuery("#OnceTime").ZSDPCalendar("getComponentDateObject").value.dateString   //No I18N
              if(onceTime == undefined || onceTime == ''){
                  alert( translate("auditsettings.scaninterval.enterTime"));
                  jQuery("#OnceTime_display-container").focus();
                  return false;
              }

              if( new Date() > new Date(yyyymmdd+" "+onceTime) ) {
                  alert( translate("sdp.reports.errmsg.invalidtimedateexception"));
                  form.onceDate.focus();
                  return false;
              }
      scheduleSettings.onceDate = yyyymmdd;
      scheduleSettings.onceTime = onceTime;
          }

          else if(scheduleTypeValue == "Periodic")
          {

              var x = form.scheduleInterval.value;
              var anum=parseInt(x);
              if (anum<1 || anum >1000)
              {
                  alert(translate('sdp.admin.auditsettings.rediscoverinterval.intervaljserror'));
                  form.scheduleInterval.focus();
                  return false;
              }
      scheduleSettings.scheduleInterval = x;

      }

      data.scheduleSettings = sdpToJSON(scheduleSettings);
      }

  var auditCleanupSettings = {};
      if(form.enableAuditCleanup.checked)
      {
          var x = form.auditCleanupInterval.value;
          var anum=parseInt(x);
          if (anum<1 || anum >1000)
          {
              alert(translate("sdp.admin.auditsettings.auditclean.intervaljserror"));
              form.auditCleanupInterval.focus();
              return false;
          }
      auditCleanupSettings.enableAuditCleanup = true;
      auditCleanupSettings.auditCleanupInterval = x;
      }
  else{
      auditCleanupSettings.enableAuditCleanup = false;
  }
  data.auditCleanupSettings = sdpToJSON(auditCleanupSettings);

  var rediscoverySettings = {};
      if(form.enableRediscovery.checked)
      {
          var x = form.rediscoveryInterval.value;
          var anum=parseInt(x);
          if (anum<1 || anum >1000)
          {
              alert(translate("sdp.admin.auditsettings.scaninterval.intervaljserror"));
              form.rediscoveryInterval.focus();
              return false;
          }
      rediscoverySettings.enableRediscovery = true;
      rediscoverySettings.rediscoveryInterval = x;
      }
  else{
      rediscoverySettings.enableRediscovery = false;
  }
  data.rediscoverySettings = sdpToJSON(rediscoverySettings);

  saveBtn = jQuery("#schedule_Submit").button('loading');

  sdpAjax({
                      method: 'POST',   //No I18N
                      url: '/ScheduleScanning.do?action=setDetails', //No i18N
                      data:  data ? sdpAjaxInputData(data) : null,
                      async: false,
                      success: function(response){

                      if (response.status === "failure" || response.rediscovery_save_status == "failure" || response.audit_cleanup_save_status == "failure" ) {
                          showalert("failure", translate("sdp.api.unknown.error"), "isAutoHide=true"); //No I18N
                          return;
                      }
                      else if(response.uem_schedule_save_status == "failure"){
                          if(response.remarks != undefined){
                          showalert("failure", encodeHTML(response.remarks), "isAutoHide=true"); //No I18N
                          }
                          else if(response.is_reachable == false){
                          showalert("failure", translate("sdp.dc.header.dcdown.admin",[encodeHTML(response.uem_integ_prod)]), "isAutoHide=true"); //No I18N
                          }
                          else{
                          showalert("failure", translate('admin.uemschedule.error'), "isAutoHide=true"); //No i18n
                          }

                          return;
                      }
                      else if(response.errorStr) {
                          showalert('failure',ZSEC.Encoder.encodeForHTML(response.errorStr),'isAutoHide=false,delay=3,width=400') //NO I18N
                          return;
                      }
                      var msg = translate("sdp.admin.auditset.save.success");
                      showalert("success", msg, "isAutoHide=true"); // No I18N
                      },
                      ignorefailuremessage:true,
                      error: function(){
                          showalert("failure", translate("sdp.api.unknown.error"), "isAutoHide=true"); //No I18N
                      }


                  });
      self.unfreezeScheduleSettingsSection();
      saveBtn.button('reset');

  },

  //For EveryDay Groups Checkbox
  checkDays: function(isUEM)
  {
  var form = document.forms.schedule_scan_settings;
  var section = isUEM ? form.uemSelectedDays : form.selectedDays;
  var isChecked = isUEM ? form.everyDay.checked : form.everyDayWeekly.checked;
  if(isChecked)
      {
          for(var j = 0,len=section.length; j < len; j++)
          {
              section[j].checked = true;
          }
      }
      else
      {
          for(var j = 0,len= form.selectedDays.length; j <len; j++)
          {
              section[j].checked = false;
          }
      }

  },

      //For Every Month Groups Checkbox
  checkMonths: function (isUEM)
  {
   var form = document.forms.schedule_scan_settings;
     var section = isUEM ? form.monthsList : form.selectedMonths;
       var isChecked = isUEM ? form.everyMonthUEM.checked : form.everyMonth.checked;
      if(isChecked)
      {
          for(var j = 0,len=section.length; j < len; j++)
          {
              if(!section[j].disabled){
               section[j].checked = true;
              }
          }
      }
      else
      {
          for(var j = 0,len=section.length; j < len; j++)
          {
              section[j].checked = false;
          }
      }
  },




  /**************
   * This function is used to disable the months that dont have the number of days selected
   * **************/
  blockInvalidMonths: function (){
      if(jQuery("#monthly_week").prop('checked')){
          jQuery('input[name=monthsList][value=1],input[name=monthsList][value=3],input[name=monthsList][value=5],input[name=monthsList][value=8],input[name=monthsList][value=10]').removeAttr('disabled') //No I18N
      }
      else{
          var daySelected = document.forms.schedule_scan_settings.monthlyDay.value;
          jQuery('#monthly_day_select').children('option').prop('disabled', false); //No I18N
          if(daySelected > 30){
              jQuery('input[name=monthsList][value=1],input[name=monthsList][value=3],input[name=monthsList][value=5],input[name=monthsList][value=8],input[name=monthsList][value=10]').attr('disabled',true)
              jQuery('input[name=monthsList][value=1],input[name=monthsList][value=3],input[name=monthsList][value=5],input[name=monthsList][value=8],input[name=monthsList][value=10]').removeAttr('checked') //No I18N

          }
          else if(daySelected >28){
               jQuery('input[name=monthsList][value=1]').attr('disabled',true);
               jQuery('input[name=monthsList][value=1]').removeAttr('checked');  //No I18N
               jQuery('input[name=monthsList][value=3],input[name=monthsList][value=5],input[name=monthsList][value=8],input[name=monthsList][value=10]').removeAttr('disabled') //No I18N
          }
          else{
              jQuery('input[name=monthsList][value=1],input[name=monthsList][value=3],input[name=monthsList][value=5],input[name=monthsList][value=8],input[name=monthsList][value=10]').removeAttr('disabled') //No I18N

          }
      }

  },


  resetScheduleForm: function(){
    document.forms.schedule_scan_settings.reset();
    scheduleScanSettings.switchViewsByFreqType('Daily_div','Weekly_div','Monthly_div'); //no I18n
    scheduleScanSettings.scanchoice('Once','Weekly','Daily','Monthly','Periodic','scanchoice1'); //no I18n
    jQuery('[name=scheduleType][value=Once').prop('checked',true); //no I18n
    jQuery('#taskTimeZone').select2('val',this.defaultTimeZone); //no I18n
    jQuery('#uem_dailyDate_Display').val('');
    jQuery('#wcag-enbSch-uem,#wcag-enbSch,#wcag-AudiClen,#wcag-RedCov').prop('checked',false); //no I18n
  },
  checkEveryMonth: function ()
  {
    var toBeChecked = true;
    var l = document.forms.schedule_scan_settings.selectedMonths.length;
    for(var j = 0; j < l; j++)
    {
      if (document.forms.schedule_scan_settings.selectedMonths[j].checked == false)
      {
        toBeChecked = false;
        break;
      }
    }
    document.forms.schedule_scan_settings.everyMonth.checked = toBeChecked;
  },
  //Function to check/uncheck everyDay
  checkEveryDay: function ()
  {
    var toBeChecked = true;
    var l = document.forms.schedule_scan_settings.selectedDays.length;
    for(var j = 0; j < l; j++)
    {
      if (document.forms.schedule_scan_settings.selectedDays[j].checked == false)
      {
        toBeChecked = false;
        break;
      }
    }
    document.forms.schedule_scan_settings.everyDayWeekly.checked = toBeChecked;
  },
  checkEveryMonthUEM: function ()
  {
    var toBeChecked = true;
    var l = document.forms.schedule_scan_settings.monthsList.length;
    for(var j = 0; j < l; j++)
    {
      if (document.forms.schedule_scan_settings.monthsList[j].checked == false)
      {
        toBeChecked = false;
        break;
      }
    }
    document.forms.schedule_scan_settings.everyMonthUEM.checked = toBeChecked;
  },
  //Function to check/uncheck everyDay
  checkEveryDayUEM: function ()
  {
    var toBeChecked = true;
    var l = document.forms.schedule_scan_settings.uemSelectedDays.length
    for(var j = 0; j < l; j++)
    {
      if (document.forms.schedule_scan_settings.uemSelectedDays[j].checked == false)
      {
        toBeChecked = false;
        break;
      }
    }
    document.forms.schedule_scan_settings.everyDay.checked = toBeChecked;
  }

}