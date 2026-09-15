/* $Id$ */
var perfSet = {
  performanceSettings: {},
  statustoggle: function($this) {
    thisSpan = jQuery($this).find('span');
    thisSpan.toggleClass('on off'); //NO I18N
    jQuery("#frequencyDiv,#startsFromDiv").toggleClass("disableDiv"); //NO I18N
    if(thisSpan.hasClass('on')) {
      jQuery('#swithChange').text(getMessageForKey("common.creatorlinks.enabled"));
    }else{
      jQuery('#swithChange').text(getMessageForKey("common.creatorlinks.disabled"));
    }
  },
  changeTab: function(tabName) {
    var isChanged = false;
    if(tabName=='reportsTab') {
      var dbStat = performanceSettings.GeneralPerformanceSettings;

      var enableType = jQuery('#updateStatistics').hasClass("on") ? 'enable' : 'disable'; //NO I18N
      var scheduleFrequency = jQuery("input[name='scheduleFrequency']:checked").val();
      var scheduleHour = jQuery("#scheduleHour").val();
      var scheduleMinutes = jQuery("#scheduleMinutes").val();
      var weekDay = (scheduleFrequency == 'daily')? -1 : jQuery("#weekDay").val();
      var diskspaceThreshold = jQuery("#diskspaceThreshold").val();
      var cpuThreshold=jQuery("#cpuThreshold").val();
      var isPerformanceEmailEnabled=jQuery("#performanceEmailNotification").is(":checked"); //NO I18N
      var memoryThreshold=jQuery("#memoryThreshold").val();
      
      if(dbStat) {
        if(perfSet.DBserver=='postgres'){
          if(dbStat.diskspaceThreshold!=diskspaceThreshold || dbStat.cpuThreshold!=cpuThreshold || dbStat.isPerformanceEmailEnabled!=isPerformanceEmailEnabled || dbStat.memoryThreshold!=memoryThreshold) {
            showconfirm(true, 'title=' + getMessageForKey('common.confirm.submit.msg') + ', message=' + getMessageForKey('sdp.requestcatalog.reorder.save') + ', submitbutton=' + getMessageForKey('sdp.common.save') + ', cancelbutton=' + getMessageForKey('common.discard') + ', closebutton=yes, closeOnEscKey=yes', perfSet.saveDBStatisticsSettings); //NO I18N
            return false;
          }
        }
        else {
          if (dbStat.enableType != enableType || dbStat.scheduleMinutes != scheduleMinutes || dbStat.scheduleFrequency != scheduleFrequency || dbStat.weekDay != weekDay || dbStat.scheduleHour != scheduleHour || dbStat.diskspaceThreshold != diskspaceThreshold || dbStat.cpuThreshold != cpuThreshold || dbStat.isPerformanceEmailEnabled != isPerformanceEmailEnabled || dbStat.memoryThreshold != memoryThreshold) {
            showconfirm(true, 'title=' + getMessageForKey('common.confirm.submit.msg') + ', message=' + getMessageForKey('sdp.requestcatalog.reorder.save') + ', submitbutton=' + getMessageForKey('sdp.common.save') + ', cancelbutton=' + getMessageForKey('common.discard') + ', closebutton=yes, closeOnEscKey=yes', perfSet.saveDBStatisticsSettings); //NO I18N
            return false;
          }
         }
        }
    } 
    else if(tabName=='generalTab') {
      var maxReportUsers = jQuery("#maxReportUsers").val();
      var reportTimeOut = jQuery("#reportTimeOut").val();
      var udfCharRowsLimit = jQuery("#udfCharRowsLimit").val();
      var maxRowsLimit = jQuery("#maxRowsLimit").val();
      var descRowsLimit = jQuery("#descRowsLimit").val();
      var maxWorkstation = jQuery("#maxWorkstation").val();
      var criteriaValuesLimit = jQuery("#criteriaValuesLimit").val(); //SD-99938 : Maximum number of report criteria values to be displayed
      var descCharactersSizeLimit = jQuery("#descCharactersSizeLimit").val(); //SD-99068: Maximum number of characters to be displayed for Description/Resolution columns
      var maxRowsPerPage = jQuery("#maxRowsPerPage").val();
      var maxRowsToBeExported = jQuery("#maxRowsToBeExported").val();
      let maxFieldsCount = jQuery("#maxFieldsCount").val();

      var repSet = performanceSettings.reportsSettings;
      if(repSet) {
        if(repSet.maxReportUsers!=maxReportUsers || repSet.reportTimeOut!=reportTimeOut || repSet.maxRowsLimit!=maxRowsLimit || repSet.maxWorkstation!=maxWorkstation || repSet.criteriaValuesLimit!=criteriaValuesLimit || repSet.maxRowsPerPage!=maxRowsPerPage || repSet.maxRowsToBeExported!=maxRowsToBeExported || repSet.maxFieldsCount != maxFieldsCount|| (sdp_app.IS_SDP && (repSet.udfCharRowsLimit!=udfCharRowsLimit || repSet.descRowsLimit!=descRowsLimit || repSet.descCharactersSizeLimit!=descCharactersSizeLimit))) {
          showconfirm(true, 'title=' + getMessageForKey('common.confirm.submit.msg') + ', message=' + getMessageForKey('sdp.requestcatalog.reorder.save') + ', submitbutton=' + getMessageForKey('sdp.common.save') + ', cancelbutton=' + getMessageForKey('common.discard') + ', closebutton=yes, closeOnEscKey=yes', perfSet.saveReportsStabilitySettings); //NO I18N
          return false;
        }
      }
    }
    return true;
  },
  toggleStartsFrom: function(frequency) {
    if(frequency=='daily') {
      jQuery('#weekInput').addClass('hide');
    }
    else if(frequency=='weekly') {
      jQuery('#weekInput').removeClass('hide');
    }
  },
  initialize: function() {
    perfSet.getPerformanceSettings();
    jQuery('[data-name=number]').on('keypress', function(e) {
      if(e.which != 8 && isNaN(String.fromCharCode(event.which))){
        e.preventDefault();
      }
    });
    jQuery('[data-switch=sdtab]').off();
    jQuery('[data-switch=sdtab]').on('click', function (event) {
        return perfSet.changeTab(event.target.id);
    });
  },
  getPerformanceSettings: function() {
    sdpAjax({
      url: '/servlet/ConfigurePerformance',  //NO I18N
      success: function(data) { 
        performanceSettings = data;
        var dbStat = data.GeneralPerformanceSettings;
        var value=dbStat.selectedRoleOrUser;
        var roleDisplayName=getMessageForKey('admin.performancesettings.roleOrUserSelection.user.role');
        var userDisplayName=getMessageForKey('admin.performancesettings.roleOrUserSelection.User');
        var previousportalid=Store.getCookie('PORTALID');//NO I18N
        //Only technicians should be listed for MSP or scp
		var userapi="users"; //NO I18N
		if(isMSP){
			userapi="technicians"; //NO I18N
		}
        var opttabs = {
          tabs: {
              list: [{"id":"userrole","display_name":roleDisplayName},{"id":"users","display_name":userDisplayName}], //NO I18N
              meta: {
                  userrole: {
                      url: [{
                          url: "/api/v3/"+userapi+"/associated_roles?PORTALID="+perfSet.PORTALID ,//NO I18N
                          field: "associated_roles", //NO I18N

                          //"list_info": {}
                      }]
                  },
                  users: {
                      url: [{
                          url:sdp_app.IS_ESMDIR? "/api/v3/orgusers":"/api/v3/"+userapi, //NO I18N
                          field: sdp_app.IS_ESMDIR? "orgusers":userapi //NO I18N
                      }]
                  }
              },
              active_tab: {"id":"userrole","display_name":roleDisplayName},//NO I18N
          },
          multiple: true,

          value:value,
          //"value":[{"id":"73","text":"AERemoteControl"}],
          processResults:function(search_data,data,c){
            var key = "text";//No i18n
            var name = ""; //No i18n
            if (!name) {
              name = data.name || data.display_name || data.text || data.value;
            }

        var roletype;
        roletype=(data.type==undefined ||data.type ==""||data.type==null||data.type=="userrole")? "userrole" :"User";//NO I18N

            /** for some fields like id will not be available, only name is present */
            var processedResult = {
              id: data.id || name,
              type:roletype

            };

            if(roletype=="User"){
              processedResult.email_id=data.email_id;
              processedResult.employee_id=data.employee_id;
            }

            processedResult[key] = name;

            search_data.push(processedResult);

           },
           formatResult: function (data) {
            let name = e_html(data.text);

            let toolTip = "";
            toolTip += `<b>${getMessageForKey("sdp.common.name")} : </b><span>${name}</span><br />`; // NO I18N
            if(data.type==="User"){
            let email = (data.email_id==null ||data.email_id =="")? getMessageForKey("sdp.common.na") : e_html(data.email_id);
            let employeeId = (data.employee_id==null ||data.employee_id =="")? getMessageForKey("sdp.common.na") : e_html(data.employee_id);
            toolTip += "<b>" + getMessageForKey("sdp.common.email") + " : </b><span>" + email + "</span><br />"; // NO I18N
            toolTip += "<b>" + getMessageForKey("sdp.common.empid.is") + " : </b><span>" + employeeId + "</span>"; // NO I18N
            }
            else{
              let orgid = (data.id==null ||data.id =="")? getMessageForKey("sdp.common.na") : e_html(data.id);
              toolTip += "<b>" + getMessageForKey("sdp.common.id") + " : </b><span>" + orgid + "</span>"; // NO I18N
            }
            let option = '<span title="'+toolTip +'" mode_html="true" rel="uitip">' + name + '</span>';

            option = jQuery(option).uitooltip({
              content: function() {
                var element = jQuery(this);
                return element.attr("title"); //NO I18N
              },
              track: true,
              show: {
                delay: 250
              },
              tooltipClass: "uitip" //No I18N
            });
            return option;

           },
          element: "#roleOrUserSelection", //NO I18N
          placeholder:getMessageForKey('admin.performancesettings.roleOrUserSelection.placeholder') //NO I18N
        };
        jQuery("#roleOrUserSelection").custom_select2(opttabs);
        jQuery("#roleOrUserSelection").on('select2-selecting', function (evt) {

          if(evt.choice.type=='User' && evt.choice.email_id == null) {
            javascript: showalert('failure', getMessageForKey('admin.performancesettings.roleOrUserSelection.email.error'),'isAutoHide=false,delay=5,width=300'); // NO I18N
            return false;
          }
        });
        if(dbStat) {
          if(perfSet.DBserver!='postgres') {
            var enableType = jQuery('#updateStatistics').hasClass("on") ? 'enable' : 'disable'; //NO I18N
            if (dbStat.enableType != enableType) {
              jQuery("#updateStatistics").parent().trigger('click');
            }

            if (dbStat.scheduleFrequency == "weekly") {
              jQuery("#weeklyFrequency").trigger('click');
            } else {
              jQuery("#dailyFrequency").trigger('click');
            }

            if (dbStat.weekDay != -1) {
              jQuery("#weekDay").val(dbStat.weekDay);
            }
            jQuery("#scheduleHour").val(dbStat.scheduleHour);
            jQuery("#scheduleMinutes").val(dbStat.scheduleMinutes);
          }
          jQuery("#diskspaceThreshold").val(dbStat.diskspaceThreshold);
          jQuery("#cpuThreshold").val(dbStat.cpuThreshold);
          jQuery("#performanceEmailNotification").prop("checked",dbStat.isPerformanceEmailEnabled);//NO I18N
          jQuery("#memoryThreshold").val(dbStat.memoryThreshold);
          if(dbStat.databaseLogFileSizeThreshold) {
            jQuery("#databaseLogFileSizeThreshold").val(dbStat.databaseLogFileSizeThreshold);
          }
          else {
            jQuery("#databaseLogFileSizeThresholdDiv").hide();
          }
          if(jQuery("#performanceEmailNotification").prop("checked")==true){
            jQuery("#selectDisableDiv").removeClass("disableDiv").parent("div").removeClass("cur-na").end()//NO I18N
                .find("#ipSelect2User").select2("enable", true);//NO I18N
            jQuery("#selectTooltip").addClass("hide");
          }else{
            jQuery("#selectDisableDiv").addClass("disableDiv").parent("div").addClass("cur-na").end()//NO I18N
                .find("#ipSelect2User").select2("enable", false);//NO I18N
            jQuery("#selectTooltip").removeClass("hide");
          }
        }

        var repSet = data.reportsSettings;
        if(repSet) {
          jQuery("#maxReportUsers").val(repSet.maxReportUsers);
          jQuery("#reportTimeOut").val(repSet.reportTimeOut);
          jQuery("#udfCharRowsLimit").val(repSet.udfCharRowsLimit);
          jQuery("#maxRowsLimit").val(repSet.maxRowsLimit);
          jQuery("#descRowsLimit").val(repSet.descRowsLimit);
          jQuery("#maxWorkstation").val(repSet.maxWorkstation);
          jQuery("#reportLinkExpiry").val(repSet.reportLinkExpiry);
          jQuery("#criteriaValuesLimit").val(repSet.criteriaValuesLimit); //SD-99938 : Maximum number of report criteria values to be displayed
          jQuery("#descCharactersSizeLimit").val(repSet.descCharactersSizeLimit); //SD-99068: Maximum number of characters to be displayed for Description/Resolution columns
          jQuery("#maxRowsPerPage").val(repSet.maxRowsPerPage);
          jQuery("#maxRowsToBeExported").val(repSet.maxRowsToBeExported);
          jQuery("#maxFieldsCount").val(repSet.maxFieldsCount);
        }
      } 
    });
  },
  saveReportsStabilitySettings: function(isSave) { 
    if(isSave) {
      var maxReportUsers = jQuery("#maxReportUsers").val();
      var reportTimeOut = jQuery("#reportTimeOut").val();
      var udfCharRowsLimit = jQuery("#udfCharRowsLimit").val();
      var maxRowsLimit = jQuery("#maxRowsLimit").val();
      if(parseInt(jQuery("#maxRowsLimit").val(), 10) > perfSet.maxRowsLimit){
          showalert('failure', translate('reports.maxRowsLimitLabel.error.message'),'isAutoHide=false,delay=5,width=300'); //NO I18N
          return;
      }
      var descRowsLimit = jQuery("#descRowsLimit").val();
      var maxWorkstation = jQuery("#maxWorkstation").val(); //SD-89681 : ReportStability for audit history by workstation report
      var reportLinkExpiry = jQuery('#reportLinkExpiry').val();
      var criteriaValuesLimit = jQuery("#criteriaValuesLimit").val(); //SD-99938 : Maximum number of report criteria values to be displayed
      var descCharactersSizeLimit = jQuery("#descCharactersSizeLimit").val(); //SD-99068: Maximum number of characters to be displayed for Description/Resolution columns
      var maxRowsPerPage = jQuery("#maxRowsPerPage").val();
      var maxRowsToBeExported = jQuery("#maxRowsToBeExported").val();
      let maxFieldsCount = jQuery('#maxFieldsCount').val();

    if(maxReportUsers < 1 || reportTimeOut < 1 || udfCharRowsLimit < 1 || maxRowsLimit < 1 || descRowsLimit < 1 || (maxWorkstation != '-' && maxWorkstation <1) || (criteriaValuesLimit != '-' && criteriaValuesLimit <0) || (descCharactersSizeLimit != '-' && descCharactersSizeLimit <1) || maxRowsPerPage < 1 || (maxRowsToBeExported != '-' && maxRowsToBeExported < 1) || maxFieldsCount < 1 || reportLinkExpiry < 1 )
	  {
	  	javascript:showalert('failure', getMessageForKey('sdp.report.reportsetting.number.error'),'isAutoHide=false,delay=5,width=300'); //NO I18N
	  	return;
	  }

      //SD-89681 : ReportStability for audit history by workstation report
      var input_data={
        "operation":"configure_ReportsStabilitySettings", //NO I18N
        "reportsSettings":{ //NO I18N
          "maxReportUsers": maxReportUsers, //NO I18N
          "reportTimeOut": reportTimeOut, //NO I18N
          "maxRowsLimit": maxRowsLimit, //NO I18N
          "descRowsLimit": descRowsLimit, //NO I18N
          "udfCharRowsLimit": udfCharRowsLimit, //NO I18N
          "maxWorkstation" : maxWorkstation == '-'? 0 : maxWorkstation, //No I18N
          "reportLinkExpiry" : reportLinkExpiry,  //No i18n
          "criteriaValuesLimit" : criteriaValuesLimit == '-' ? 0 : criteriaValuesLimit, //No I18N
          "descCharactersSizeLimit" : descCharactersSizeLimit == '-' ? 0 : descCharactersSizeLimit, //No I18N
          "maxRowsPerPage" : maxRowsPerPage, //No I18N
          "maxRowsToBeExported" : maxRowsToBeExported == '-' ? 0 : maxRowsToBeExported, //No I18N
          "maxFieldsCount" : maxFieldsCount //No I18N
        }
      };
      var dataVal = sdpAjaxInputData(input_data);
      sdpAjax({
        url: '/servlet/ConfigurePerformance',  //NO I18N
        type: "POST", //NO I18N
        data: dataVal,
        success: function(data) {
          if(data.status == "failed" && data.message !== undefined){
            showalert('failure', encodeHTML(data.message), "isAutoHide=false,delay=4,closeOnEscKey=yes");	//NO I18N
            return false;
          }
          performanceSettings = data;
          javascript:showalert('success', getMessageForKey('sdp.admin.dcconfig.settings.saved'),'isAutoHide=true,delay=3,width=300'); //NO I18N
        }
      });
    }
    else {
      perfSet.initialize();
    }
  },
  saveDBStatisticsSettings: function(isSave) {
    if(isSave) {
      var enableType = jQuery('#updateStatistics').hasClass("on") ? 'enable' : 'disable'; //NO I18N
      var scheduleFrequency = jQuery("input[name='scheduleFrequency']:checked").val();
      var scheduleHour = jQuery("#scheduleHour").val();
      var scheduleMinutes = jQuery("#scheduleMinutes").val();
      var weekDay = jQuery("#weekDay").val();
      var databaseLogFileSizeThreshold = jQuery("#databaseLogFileSizeThreshold").val();
      var diskspaceThreshold = jQuery("#diskspaceThreshold").val();
      var cpuThreshold=jQuery("#cpuThreshold").val();
      var isPerformanceEmailEnabled=jQuery("#performanceEmailNotification").is(":checked"); //NO I18N
      var memoryThreshold=jQuery("#memoryThreshold").val();
      var selectedRoleOrUser=jQuery("#roleOrUserSelection").select2('data');//NO I18N


      if((databaseLogFileSizeThreshold!= '' && databaseLogFileSizeThreshold < 1) || diskspaceThreshold < 1 || cpuThreshold < 1||(memoryThreshold!= '' && memoryThreshold < 1))
      {
      	javascript: showalert('failure',getMessageForKey('sdp.report.reportsetting.number.error'),'isAutoHide=false,delay=5,width=300'); // NO I18N
      	return;
      }
      if(diskspaceThreshold > 100 || cpuThreshold > 100||memoryThreshold > 100)
      {
        javascript: showalert('failure',getMessageForKey('admin.performancesettings.thresholdSettings.number.error'),'isAutoHide=false,delay=5,width=300'); // NO I18N
        return;
      }

      if(isPerformanceEmailEnabled==true && selectedRoleOrUser.length === 0){
        javascript: showalert('failure',getMessageForKey('admin.performancesettings.roleOrUserSelection.error'),'isAutoHide=false,delay=5,width=300'); // NO I18N
        return;
      }

      var input_data={
        "operation":"configure_GeneralPerformanceSettings", //NO I18N
        "GeneralPerformanceSettings":{ //NO I18N
          "diskspaceThreshold": diskspaceThreshold, //NO I18N
          "cpuThreshold": cpuThreshold, //NO I18N
          "isPerformanceEmailEnabled": isPerformanceEmailEnabled, //NO I18N
          "memoryThreshold":memoryThreshold, //NO I18N
         "selectedRoleOrUser":selectedRoleOrUser //NO I18N

        }
      };
      if(perfSet.DBserver!='postgres') {
        input_data.GeneralPerformanceSettings.enableType = enableType;
        input_data.GeneralPerformanceSettings.scheduleFrequency = scheduleFrequency;
        input_data.GeneralPerformanceSettings.scheduleHour = scheduleHour;
        input_data.GeneralPerformanceSettings.scheduleMinutes = scheduleMinutes;
        if (scheduleFrequency == 'weekly') {
          input_data.GeneralPerformanceSettings.weekDay = weekDay;
        }
      }
      if(!isEmpty(jQuery("#databaseLogFileSizeThreshold").val())) {
        input_data.GeneralPerformanceSettings.databaseLogFileSizeThreshold = databaseLogFileSizeThreshold;
      }

      var dataVal = sdpAjaxInputData(input_data);
      sdpAjax({
        url: '/servlet/ConfigurePerformance',  //NO I18N
        type: "POST", //NO I18N
        data: dataVal,
        success: function(data) {
          performanceSettings = data;
          //failure case is not handled in sdp
		  if(performanceSettings.status == "success"){
			  javascript:showalert('success', getMessageForKey('sdp.admin.dcconfig.settings.saved'),'isAutoHide=true,delay=3,width=300'); //NO I18N
		  }else{
			  javascript:showalert('failure', getMessageForKey('sdp.admin.dcconfig.settings.error.message'),'isAutoHide=true,delay=3,width=300'); //NO I18N
		  }
        }
      });
    }
    else {
      perfSet.initialize();
    }
  },
  submitData: function() {
    if(jQuery("#PerformanceSettingsTabs li.active a").attr("id")=='generalTab') {
      perfSet.saveDBStatisticsSettings(true);  
    }
    else if(jQuery("#PerformanceSettingsTabs li.active a").attr("id")=='reportsTab') {
      perfSet.saveReportsStabilitySettings(true);
    }
  },
  checkEmailNotification: function(){
    jQuery("#performanceEmailNotification").on("change",function(){
      if(jQuery(this).prop("checked")==true){
        jQuery("#selectDisableDiv").removeClass("disableDiv").parent("div").removeClass("cur-na").end()//NO I18N
          .find("#ipSelect2User").select2("enable", true); //NO I18N
          jQuery("#selectTooltip").addClass("hide"); //NO I18N
      }else{
        jQuery("#selectDisableDiv").addClass("disableDiv").parent("div").addClass("cur-na").end()//NO I18N
          .find("#ipSelect2User").select2("enable", false);//NO I18N
          jQuery("#selectTooltip").removeClass("hide");//NO I18N
      }
    });

  }
};