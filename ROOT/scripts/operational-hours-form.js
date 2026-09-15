//$Id$
var $operHr = {
    global_hours_of_operation: {},
    daysOfOperation: [],
    siteType: '',
    accId:'',
    chosenSiteName:'',
    refruleSite: false,
    selruleSite: '',
    excludeList: [],
    allDayList: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],//No I18N
    weekNoList: [{
        id: 'first',//No I18N
        text: translate("sdp.common.first")
    }, {
        id: 'second',//No I18N
        text: translate("common.second")
    }, {
        id: 'third',//No I18N
        text: translate("common.third")
    }, {
        id: 'fourth',//No I18N
        text: translate("common.fourth")
    }, {
        id: 'last',//No I18N
        text: translate("sdp.common.last")
    }],
    allDayListForSelect2: [{
            id: 'Monday',//No I18N
            text: translate("sdp.days.mon")
        }, {
            id: 'Tuesday',//No I18N
            text: translate("sdp.days.tue")
        }, {
            id: 'Wednesday',//No I18N
            text: translate("sdp.days.wed")
        }, {
            id: 'Thursday',//No I18N
            text: translate("sdp.days.thu")
        }, {
            id: 'Friday',//No I18N
            text: translate("sdp.days.fri")
        },
        {
            id: 'Saturday',//No I18N
            text: translate("sdp.days.sat")
        }, {
            id: 'Sunday',//No I18N
            text: translate("sdp.days.sun")
        }
    ],
    //Method loads site based on personalization if available, else on default option
    loadSite: function() {
        var defopt = {
            "id": "-1",//No I18N
            "name": translate("sdp.common.defaultsetting")//No I18N
        };
        var site_personalize = (sdp_app.IS_SITE_CONFIGURE) ? getPersonalizeData("ADMIN_USERSITEPREFERENCE") : {};
        //Hiding site drop down if no site available.
        if (!sdp_app.IS_SITE_CONFIGURE) {
            jQuery("#opHrSiteFilter").addClass("hide");
            jQuery("#opHrsHeader").addClass("hide");
        } else {
            jQuery("#opHrSiteFilter").removeClass("hide");
            jQuery("#opHrsHeader").removeClass("hide");
			var site_url = '/api/v3/requests/site';//No I18N
				if(sdp_app.IS_MSP){
					var accountId = $operHr.accId;
					if(document.getElementById("persAccId")){
						accountId=document.getElementById("persAccId").value;
					}
					if(window.checkIfMSP() && accountId && accountId!=0){
					defopt=undefined;
					site_url+= '?ACCOUNTID='+accountId;//No I18N
					}
				}
            //For sdsiteadmin default site is not applicable. So, for default option, first response will be taken
            //In case of sdsiteadmin, default value will be selected based on first value available in the list
            if (sdp_user.ROLES.indexOf("SDSiteAdmin") > -1) {

                var linfo = {
                    "for": "operational_hours"//No I18N
                };
				
                sdpAjax({
                    url: site_url,
                    cache: false,
                    async: false,
                    data: sdpAjaxInputData(linfo),
                    success: function(resp) {
                        if (resp.site.length != 0) {
                            defopt = {
                                "id": resp.site[0].id,
                                "name":resp.site[0].name
                            };
                        }
                    }
                });
            }
            if(!window.checkIfMSP() || (sdp_user.ROLES.indexOf("SDSiteAdmin") > -1)){
                var listInfo = {"search_criteria":[{ field:"deleted",condition:'is',value:"false",logical_operator:"and"},{ field:"id",condition:'is not',value:defopt.id,logical_operator:"and"}]};//No I18N
            }
            else{
                var listInfo = {"search_criteria":[{ field:"deleted",condition:'is',value:"false",logical_operator:"and"}]};//No I18N
            }
            jQuery("#opHrSiteFilter").sdp_select2({
                multiple: false,
                default_option: defopt,
                url: [{
                    url: site_url, 
                    field: 'site', //NO I18N
                    list_info:listInfo
                }],
                include_inactive_value: true,
                for: 'operational_hours'//No I18N
            });

        }
        if (jQuery.isEmptyObject(site_personalize) || site_personalize == null) { //personalization key is null or -1 then navigate to Default setting
            site_personalize = defopt;
        }

        $operHr.opHrSiteChange(site_personalize, "siteload");//No I18N
    },
    // Add hours and minutes Li to Ul html - common to all time elements
    generateTime: function() {

        var hrsLi = '';
        var minLi = '';
        for (var i = 0; i < 24; i++) {
            (i <= 9) ? hrsLi += '<li>0' + i + '</li>': hrsLi += '<li>' + i + '</li>';
        }
        for (var j = 0; j < 60; j++) {
            (j <= 9) ? minLi += '<li>0' + j + '</li>': minLi += '<li>' + j + '</li>';
        }
        jQuery('#diff-oper-hrs').find('ul[rel="res-hours"]').html(hrsLi).end()
            .find('ul[rel="res-mins"]').html(minLi);
        jQuery('#breakhours').find('ul[rel="res-hours"]').html(hrsLi).end()
            .find('ul[rel="res-mins"]').html(minLi);
    },
    //Initialises select2 for weeks selection
    initWeekList: function(id) {
        jQuery("#" + id).select2({
            data: $operHr.weekNoList,
            multiple: true,
            placeholder: translate("specify.weeks"),
            formatNoMatches:function(){
                 return translate('ae.select2.no.message')
            }
        });
    },
    //Initialises days object for exclusion rule
    initExcludeDaysList: function(id) {
        jQuery("#excludeWeekDays_" + id).select2({
            data: $operHr.allDayListForSelect2,
            placeholder: translate('sdp.change.sla.select'),
            formatNoMatches:function(){
                 return translate('ae.select2.no.message')
            }
        }).off("change").on('change', function() {//No I18N
            var idToReplace = 'excludeWeekDays_1';//No I18N
            if(id == '1'){
                idToReplace = 'excludeWeekDays_2';//No I18N
            }
            $operHr.excludeWeeksHandling('excludeWeekDays_' + id, idToReplace);//No I18N
        });
        //initialising add/remove button functions.
        jQuery("#addBtn_" + id).off('click').on("click", function() {
            $operHr.addExcludeRowFn();
        });
        jQuery("#removeBtn_" + id).off("click").on("click", function() {//No I18N
            $operHr.removeExcludeRowFn('exclude_' + id);//No I18N
        });
    },
    // Runs on Remove break hours clicked
    removeBreakHours: function(day) {
        if (day == 'standardHrs') {
            var ele = jQuery("#stdhrsBreakTime").removeClass('disp-h');//No I18N
            jQuery("#stdHrsBreakTime_BreakHours").closest('tr').addClass('hide');//No I18N
            var allDayList = $operHr.allDayList;
            allDayList.forEach(function(day) {
                var currentEle = jQuery('#' + day + '_details').find('#dayType');
                if ('standard' == currentEle.val()) {
                    jQuery("#" + day + "_breakHours").closest('tr').addClass('hide');
                    //Need to remove add break hours sign.
                    jQuery("#" + day + "_details").closest('tr').find("td:last-child div").addClass("hide");
                }
            });
        } else {
            jQuery("#" + day + "_breakHours").closest('tr').addClass('hide');
            jQuery("#" + day + "_details").closest('tr').find("td:last-child div").removeClass("hide");
        }
    },
    updateGlobalConfigDetails:function(id){
            if (id == 'standardHrsip') {//No I18N
                jQuery("#stdhr-start-template").removeClass('disp-h');
                jQuery('#round24hrsip').prop('checked', false);//No I18N
                jQuery('#standardHrsip').prop('checked', true);//No I18N
                jQuery("#stdhr-end-template").removeClass('disp-h');//No I18N
                jQuery("#stdhr-hyphen").removeClass('disp-h');//No I18N

                if (jQuery("#stdHrsBreakTime_BreakHours").hasClass('hide')) {
                    jQuery("#stdhrsBreakTime").removeClass('disp-h');//No I18N
                } else {
                    jQuery("#stdhrsBreakTime").addClass('disp-h');//No I18N
                }
                //jQuery("#stdHrsBreakTime_BreakHours").addClass('hide');
                jQuery("#stdTotalTime").removeClass('hide');
                $operHr.updateTimeDiffInElement('standardHrs');//No I18N

            } else {
                jQuery('#round24hrsip').prop('checked', true);//No I18N
                jQuery('#standardHrsip').prop('checked', false);//No I18N
                jQuery("#stdhr-start-template").addClass('disp-h');//No I18N
                jQuery("#stdhr-end-template").addClass('disp-h');//No I18N
                jQuery("#stdhr-hyphen").addClass('disp-h');//No I18N
                jQuery("#stdhrsBreakTime").addClass('disp-h');//No I18N
                jQuery("#stdHrsBreakTime_BreakHours").addClass('hide');//No I18N
                jQuery("#stdTotalTime").addClass('hide');

            }

        },
    //This is called when there is change in global site option. On changing the global option, all days with default also has to be modified
    toggleGlobalOption: function(id) {
        var ele = jQuery("#" + id);
        var allDayList = $operHr.allDayList;
        var dayType = 'standard';//No I18N
        if (id == 'standardHrsip') {//No I18N
            $operHr.updateGlobalConfigDetails(id);

        } else {
             $operHr.updateGlobalConfigDetails(id);
             dayType = '24x7';//No I18N

        }
        allDayList.forEach(function(day) {
            var currentEle = jQuery('#' + day + '_details').closest('tr').find('#' + day + '_workingType');
            if (currentEle.is(':checked')) {
                //checking for dayType - standard alone has to be changed
                var valueToChange = dayType == 'standard' ? '24x7' : 'standard';//No I18N
                if (jQuery('#' + day + '_details').closest('tr').find('#dayType').val() == valueToChange) {

                    //In day type dropdown, round the clock has to be removed and standard has to be added.
                    $operHr.replaceMenuToggle(dayType, day);

                    $operHr.changeDayType(day, dayType);
                    //In case of 24x7, if break hours available, that also has to be deleted for each day
                    jQuery("#" + day + '_breakHours').closest('tr').addClass("hide");

                } else {
                    //For custom specific days also toggle option needs to be changed.
                    $operHr.replaceMenuToggle(dayType, day);
                }
            } else {
                //For non-working days also toggle menu needs to be changed.
                $operHr.replaceMenuToggle(dayType, day);
            }
        });
    },
    removeExcludeRowFn: function(id) {
        if (jQuery("#excludeSectionsList").find("div[data-section=excludeon]").length > 1) {
            //If length is greater than 1, any one row can be deleted and remaining row should have id as 1
            jQuery("#excludeSectionsList").find("button[data-name=addExcludeRow]").removeAttr("disabled").end()
                .closest("span").removeClass("cur-na").end();//No I18N
            jQuery("#" + id).remove();
            //Making id to 1
            jQuery("#excludeSectionsList").find("input[id^='weekCount_']").attr("id", "weekCount_1").end()
                .find("input[id^='excludeWeekDays_']").attr("id", "excludeWeekDays_1").end()
                .find("button[name='addExcludeRow']").removeAttr("disabled").end();
             //In case of removing row also, first row has to be filled with all values.
            $operHr.excludeWeeksHandling('excludeWeekDays_2', 'excludeWeekDays_1');//No I18N
        } else {
            //If only one element is available, value will be set as null;
            jQuery("#excludeSectionsList").find("#weekCount_1").select2('val', "").end()
                .find("#excludeWeekDays_1").select2('val', "").end()
                .find("button[name='addExcludeRow']").removeAttr("disabled").end();
        }
    },
    //Data modification on page load/site change and initialises exclude option
    initFormDetails: function() {
        var operHrTable = jQuery('table#diff-oper-hrs');

         //Setting the sitetype on based on global site type
         var siteType = $operHr.siteType;
         if(siteType == 'standard'){
              $operHr.updateGlobalConfigDetails('standardHrsip');//No I18N
              //updating standard hours also to new site values
              var startHr = $operHr.global_hours_of_operation.start_time.hours,
                  startMins = $operHr.global_hours_of_operation.start_time.minutes,
                  endHr = $operHr.global_hours_of_operation.end_time.hours,
                  endMins = $operHr.global_hours_of_operation.end_time.minutes;
              startHr = startHr.length == 1 ? '0'+startHr:startHr;
              startMins = startMins.length == 1 ? '0'+startMins:startMins;
              endHr = endHr.length == 1 ? '0'+endHr:endHr;
              endMins = endMins.length == 1 ? '0'+endMins:endMins;    
              var standardEle = jQ("#standardHrs").closest("tr");//No I18N
              standardEle.find('div.res-time input').eq(0).val(startHr).end()
                .eq(1).val(startMins).end()
                .eq(2).val(endHr).end()
                .eq(3).val(endMins);
            jQuery("#stdhr-start-template span.selected-time").text(startHr + " : " + startMins);
            jQuery("#stdhr-end-template span.selected-time").text(endHr + " : " + endMins);

            if($operHr.global_hours_of_operation.break_start_time.hours >0 || $operHr.global_hours_of_operation.break_start_time.minutes >0 || $operHr.global_hours_of_operation.break_end_time.hours >0
                || $operHr.global_hours_of_operation.break_end_time.minutes >0){
                jQuery("#stdHrsBreakTime_BreakHours").closest('tr').removeClass('hide');//No I18N
                jQuery("#stdhrsBreakTime").addClass('disp-h');//No I18N
                var breakstartHr = $operHr.global_hours_of_operation.break_start_time.hours,
                  breakstartMins = $operHr.global_hours_of_operation.break_start_time.minutes,
                  breakendHr = $operHr.global_hours_of_operation.break_end_time.hours,
                  breakendMins = $operHr.global_hours_of_operation.break_end_time.minutes;

                  breakstartHr = breakstartHr.length == 1 ? '0'+breakstartHr:breakstartHr;
                  breakstartMins = breakstartMins.length == 1 ? '0'+breakstartMins:breakstartMins;
                  breakendHr = breakendHr.length == 1 ? '0'+breakendHr:breakendHr;
                  breakendMins = breakendMins.length == 1 ? '0'+breakendMins:breakendMins;    
                  var standardEle = jQ("#stdHrsBreakTime_BreakHours").closest("tr");//No I18N
                  standardEle.find('div.res-time input').eq(0).val(breakstartHr).end()
                    .eq(1).val(breakstartMins).end()
                    .eq(2).val(breakendHr).end()
                    .eq(3).val(breakendMins);
                jQuery("#stdhr-start-template-b span.selected-time").text(breakstartHr + " : " + breakstartMins);
                jQuery("#stdhr-end-template-b span.selected-time").text(breakendHr + " : " + breakendMins);

            }
            else{
                if(!jQuery("#stdHrsBreakTime_BreakHours").closest('tr').hasClass('hide')){
                    jQuery("#stdHrsBreakTime_BreakHours").closest('tr').addClass('hide');//No I18N
                }
                jQuery("#stdhrsBreakTime").removeClass('disp-h');//No I18N
                
            }

         }
         else{
              $operHr.updateGlobalConfigDetails('round24hrsip');//No I18N
         }

        //For standard day type, readonly has to be enabled.
        var allDayList = $operHr.allDayList;
        allDayList.forEach(function(day) {
            var jThis = jQuery('#' + day + '_details').closest('tr');
            if (jThis.find("#dayType").val() == 'standard') {
                jThis.find("div.res-time").attr("readonly", '').end()
                    .find("td:last-child div").addClass("hide").end();
                //If break hours available, there also readonly has to be appended
                jQuery("#" + day + '_breakHours').closest('tr').find('div.res-time').attr('readonly', 'true');
            } else if (jThis.find("#dayType").val() == 'custom') {//No I18N
                jThis.removeAttr("data-stdvalue").end()
                    .addClass('std-ophr custhrs').end();
                //For break hrs div also class needs to be added
                jQuery("#" + day + "_breakHours").closest('tr').addClass("custhrs");
            }
        });

        var excludeList = $operHr.excludeList;
        //initialising first row elements
        $operHr.initWeekList('weekCount_1');//No I18N
        $operHr.initExcludeDaysList('1');
        if (excludeList != '') {
            jQ("#exclude_2").remove();//No I18N
            for (var i = 0; i < excludeList.length; i++) {
                var excludeObj = excludeList[i];
                if (i == 0) {
                    var workingWeekStr = [];
                    excludeObj.exclude_weeks.forEach(function(week) {
                        workingWeekStr.push(week.name);
                    });
                    jQuery("#weekCount_1").select2('val', workingWeekStr);//No I18N
                    jQuery("#excludeWeekDays_1").select2("val", excludeObj.day);//No I18N
                    if (excludeList.length == 1) {
                        jQuery("#excludeSectionsList").find("button[name='addExcludeRow']").removeAttr("disabled");
                    }
                } else {
                    $operHr.addExcludeRowFn();
                    var workingWeekStr = [];
                    excludeObj.exclude_weeks.forEach(function(week) {
                        workingWeekStr.push(week.name);
                    });
                    jQuery("#weekCount_2").select2('val', workingWeekStr);//No I18N
                    jQuery("#excludeWeekDays_2").select2("val", excludeObj.day);//No I18N
                }
            }
        } else {
            jQuery("#weekCount_1").select2('val', "");
            jQuery("#excludeWeekDays_1").select2("val", "");//No I18N
            //while initialising if second row available, that also has to be removed.
            jQuery("#excludeSectionsList").find("button[name='addExcludeRow']").removeAttr("disabled");
            jQ("#exclude_2").remove();//No I18N
        }

        $operHr.initialiseAllEvents();

        //initialising day details
        //Populating time difference for already updated values.
        //1. global standard difference.
        if (jQuery("#standardHrsip").is(':checked')) {
            jQuery("#stdTotalTime").removeClass('hide');//No I18N

            $operHr.updateTimeDiffInElement('standardHrsip');//No I18N
            //calculating break hours diff onload
            if (!jQuery("#stdHrsBreakTime_BreakHours").hasClass("hide")) {
                $operHr.updateTimeDiffInElement('stdHrsBreakTime_BreakHours');//No I18N
            }
        } else {
            $operHr.updateTimeDiffInElement('standardHrsip');//No I18N
            jQuery("#stdTotalTime").addClass('hide');//No I18N

        }

        var allDayList = $operHr.allDayList;
        allDayList.forEach(function(day) {
            var jThis = jQuery("#" + day + "_details"),
                closesttr = jThis.closest('tr');//No I18N
            //checking for working days.
            if (closesttr.find("#" + day + "_workingType").is(':checked')) {
                if (closesttr.find("#dayType").val() == 'standard' || closesttr.find("#dayType").val() == 'custom') {
                    $operHr.updateTimeDiffInElement(day + '_details');//No I18N

                    //calculating diff for break time also if enabled.
                    if (!jQuery("#" + day + "_breakHours").closest('tr').hasClass("hide")) {
                        $operHr.updateTimeDiffInElement(day + '_breakHours');//No I18N
                    }
                }
            }
        });

    },

    validateTimeRange : function(hrs,mins,type){
        if(hrs > 23 || mins >59){
            showalert("failure",translate("apicodes.4001")+" : "+type,"isAutoHide=true");//No I18N
            return false;
        }
        return true;
    },
    //On save method. Does all validation with time and exclude lists
    opHrsDataSubmit: function(operationalHrId) {
        //constructing input_json
        var inputJson = {};
        var siteType = '24x7';//No I18N
        if (jQuery("#standardHrsip").is(':checked')) {
            siteType = 'standard';//No I18N
        }
        inputJson.site_type = siteType;
        var globalHrs = {};
        var zeroValueObj = {
            'hours': 0,//No I18N
            'minutes': 0//No I18N
        };
        if (siteType == '24x7') {
            globalHrs = {
                'start_time': {//No I18N
                    'hours': 0,//No I18N
                    'minutes': 0//No I18N
                },
                'end_time': {//No I18N
                    'hours': 23,//No I18N
                    'minutes': 59//No I18N
                },
                'break_start_time': {//No I18N
                    'hours': 0,//No I18N
                    'minutes': 0//No I18N
                },
                'break_end_time': {//No I18N
                    'hours': 0,//No I18N
                    'minutes': 0//No I18N
                }
            };
        } else {
            //data needs to be constructed from html.
            var globalEle = jQuery("#standardHrs").closest('tr').find("div.res-time input");
            var startTimeHr = parseInt(globalEle.eq(0).val().trim());
            var startTimeMins = parseInt(globalEle.eq(1).val().trim());
            var endTimeHr = parseInt(globalEle.eq(2).val().trim());
            var endTimeMins = parseInt(globalEle.eq(3).val().trim());
            if (!$operHr.validateTimeObj(startTimeHr, startTimeMins, endTimeHr, endTimeMins, translate('standard.hours'), false)) {
                return;
            }
            if(!$operHr.validateTimeRange(startTimeHr,startTimeMins,translate("standard.hours"))){
                return;
            }
            if(!$operHr.validateTimeRange(endTimeHr,endTimeMins,translate("standard.hours"))){
                return;
            }
            globalHrs = {
                'start_time': {//No I18N
                    'hours': startTimeHr,//No I18N
                    'minutes': startTimeMins//No I18N
                },
                'end_time': {//No I18N
                    'hours': endTimeHr,//No I18N
                    'minutes': endTimeMins//No I18N
                }
            };
            var isBreakEnabled = !jQuery("#stdHrsBreakTime_BreakHours").hasClass('hide');//No I18N
            if (isBreakEnabled) {
                var breakEle = jQuery("#stdHrsBreakTime_BreakHours").closest('tr').find("div.res-time input");
                if(!$operHr.validateTimeRange(parseInt(breakEle.eq(0).val().trim()),parseInt(breakEle.eq(1).val().trim()),translate("standard.hours"))){
                    return;
                }
                if(!$operHr.validateTimeRange(parseInt(breakEle.eq(2).val().trim()),parseInt(breakEle.eq(3).val().trim()),translate("standard.hours"))){
                    return;
                }
                if (!$operHr.validateTimeObj(parseInt(breakEle.eq(0).val().trim()), parseInt(breakEle.eq(1).val().trim()), parseInt(breakEle.eq(2).val().trim()), parseInt(breakEle.eq(3).val().trim()), translate('standard.hours'), true)) {
                    return;
                }

                if (!$operHr.validateBreakTimeObj(startTimeHr, startTimeMins, parseInt(breakEle.eq(0).val().trim()), parseInt(breakEle.eq(1).val().trim()), endTimeHr, endTimeMins, parseInt(breakEle.eq(2).val().trim()), parseInt(breakEle.eq(3).val().trim()), translate('standard.hours'))) {
                    return;
                }

                globalHrs.break_start_time = {
                    'hours': parseInt(breakEle.eq(0).val().trim()),//No I18N
                    'minutes': parseInt(breakEle.eq(1).val().trim())//No I18N
                };
                globalHrs.break_end_time = {
                    'hours': parseInt(breakEle.eq(2).val().trim()),//No I18N
                    'minutes': parseInt(breakEle.eq(3).val().trim())//No I18N
                };
            } else {
                globalHrs.break_start_time = zeroValueObj;
                globalHrs.break_end_time = zeroValueObj;
            }
        }
        inputJson.hours_of_operation = globalHrs;
        var daysOfOperation = [];
        var allDayListForSelect2 = $operHr.allDayListForSelect2;
        var allDays = JSON.parse(JSON.stringify(allDayListForSelect2));
        //constructing exclude list
        var excludeDiv = jQuery("#excludeSectionsList").find('div[data-section="excludeon"]');
        var rule1Weeks = excludeDiv.find("#weekCount_1").val(),
            rule1Day = excludeDiv.find("#excludeWeekDays_1").val(),
            rule2Weeks = excludeDiv.find("#weekCount_2").val(),
            rule2Day = excludeDiv.find("#excludeWeekDays_2").val();

        if (rule1Day == rule2Day) {
            showalert("failure",translate("duplicate.exclusion.rule"),'isAutoHide=true');//No I18N
            return;
        }
        //validating exclusion rules
        if (rule1Day != undefined && rule1Weeks != undefined) {
            if ((rule1Day.trim() == '' && rule1Weeks.trim() != '') || (rule1Day.trim() != '' && rule1Weeks.trim() == '')) {
                showalert("failure",translate("novalues.exclusion.rule"),'isAutoHide=true');//No I18N
                return;
            }
        }
        if (rule2Day != undefined && rule2Weeks != undefined) {
            if ((rule2Day.trim() == '' && rule2Weeks.trim() != '') || (rule2Day.trim() != '' && rule2Weeks.trim() == '')) {
                showalert("failure",translate("novalues.exclusion.rule"),'isAutoHide=true');//No I18N
                return;
            }
        }
        for (var i = 0; i < allDays.length; i++) {
            var day = allDays[i].id;
            var keyToDisplay = allDays[i].text;
            var dayEle = jQuery('#' + day + '_details').closest('tr');
            var dayObj = {};
            var isWorking = dayEle.find('td:eq(0) input[type="checkbox"]').is(':checked');//No I18N
            dayObj.is_working = isWorking;
            dayObj.week_day = day.toUpperCase();
            if (day == rule1Day || day == rule2Day) {
                var workingWeekObj = [];
                if (!isWorking) {
                    showalert("failure",translate("exclusion.rule.day.not.working", [keyToDisplay]),'isAutoHide=true');//No I18N
                    return false;
                }
                var weeksToAdd = day.toLowerCase() == rule1Day.toLowerCase() ? rule1Weeks : rule2Weeks;
                weeksToAdd.split(",").forEach(function(week) {
                    workingWeekObj.push({
                        name: week.toLowerCase()
                    });
                });
                dayObj.exclude_weeks = workingWeekObj;
            }
            if (isWorking) {
                dayObj.day_type = dayEle.find('#dayType').val();
                if (dayObj.day_type == '24x7') {
                    dayObj.hours_of_operation = {
                        'start_time': {//No I18N
                            'hours': 0,//No I18N
                            'minutes': 0//No I18N
                        },
                        'end_time': {//No I18N
                            'hours': 23,//No I18N
                            'minutes': 59//No I18N
                        },
                        'break_start_time': {//No I18N
                            'hours': 0,//No I18N
                            'minutes': 0//No I18N
                        },
                        'break_end_time': {//No I18N
                            'hours': 0,//No I18N
                            'minutes': 0//No I18N
                        }
                    };
                } else {
                    var dayHrsEle = dayEle.find("div.res-time input");
                    var dayStartTimeHr = parseInt(dayHrsEle.eq(0).val().trim());
                    var dayStartTimeMins = parseInt(dayHrsEle.eq(1).val().trim());
                    var dayEndTimeHr = parseInt(dayHrsEle.eq(2).val().trim());
                    var dayEndTimeMins = parseInt(dayHrsEle.eq(3).val().trim());
                     if(!$operHr.validateTimeRange(dayStartTimeHr,dayStartTimeMins,keyToDisplay)){
                            return;
                        }
                        if(!$operHr.validateTimeRange(dayEndTimeHr,dayEndTimeMins,keyToDisplay)){
                            return;
                        }
                    if (!$operHr.validateTimeObj(dayStartTimeHr, dayStartTimeMins, dayEndTimeHr, dayEndTimeMins, keyToDisplay, false)) {
                        return;
                    }
                    var dayHrs = {
                        'start_time': {//No I18N
                            'hours': parseInt(dayHrsEle.eq(0).val().trim()),//No I18N
                            'minutes': parseInt(dayHrsEle.eq(1).val().trim())//No I18N
                        },
                        'end_time': {//No I18N
                            'hours': parseInt(dayHrsEle.eq(2).val().trim()),//No I18N
                            'minutes': parseInt(dayHrsEle.eq(3).val().trim())//No I18N
                        }
                    };

                    //checking for break time
                    var isDayBreakEnabled = !jQuery("#" + day + "_breakHours").hasClass('hide');
                    if (isDayBreakEnabled) {
                        var daybreakEle = jQuery("#" + day + "_breakHours").closest('tr').find("div.res-time input");
                        if(!$operHr.validateTimeRange(parseInt(daybreakEle.eq(0).val().trim()),parseInt(daybreakEle.eq(1).val().trim()),keyToDisplay)){
                            return;
                        }
                        if(!$operHr.validateTimeRange(parseInt(daybreakEle.eq(2).val().trim()),parseInt(daybreakEle.eq(3).val().trim()),keyToDisplay)){
                            return;
                        }

                        if (!$operHr.validateTimeObj(parseInt(daybreakEle.eq(0).val().trim()), parseInt(daybreakEle.eq(1).val().trim()), parseInt(daybreakEle.eq(2).val().trim()), parseInt(daybreakEle.eq(3).val().trim()), keyToDisplay, true)) {
                            return;
                        }
                        if (!$operHr.validateBreakTimeObj(dayStartTimeHr, dayStartTimeMins, parseInt(daybreakEle.eq(0).val().trim()), parseInt(daybreakEle.eq(1).val().trim()), dayEndTimeHr, dayEndTimeMins, parseInt(daybreakEle.eq(2).val().trim()), parseInt(daybreakEle.eq(3).val().trim()), keyToDisplay)) {
                            return;
                        }

                        dayHrs.break_start_time = {
                            'hours': parseInt(daybreakEle.eq(0).val().trim()),//No I18N
                            'minutes': parseInt(daybreakEle.eq(1).val().trim())//No I18N
                        };
                        dayHrs.break_end_time = {
                            'hours': parseInt(daybreakEle.eq(2).val().trim()),//No I18N
                            'minutes': parseInt(daybreakEle.eq(3).val().trim())//No I18N
                        };
                    } else {
                        dayHrs.break_start_time = zeroValueObj;
                        dayHrs.break_end_time = zeroValueObj;
                    }
                    dayObj.hours_of_operation = dayHrs;

                }


            }
            daysOfOperation.push(dayObj);
        }
        inputJson.days_of_operation = daysOfOperation;
        var opHrInputObj = {
            'operational_hour': inputJson//No I18N
        };
        var inputData = sdpAjaxInputData(opHrInputObj);
        sdpAjax({
            url: '/api/v3/operational_hours/' + operationalHrId,//No I18N
            type: 'PUT',//No I18N
            data: inputData,
            async: false,
            cache: false,
            success: function(res) {
                var message = translate("sdp.admin.operatinghours.savedmsg");
                showalert("success", message, 'isAutoHide=true'); // No I18N
            }
        });

    },
    addExcludeRowFn: function() {
        //Before adding new row need to check the prev row has values.
        var prevWeekNo = jQuery("#weekCount_1").val();
        if (prevWeekNo == undefined || prevWeekNo == '') {
            showalert("failure",translate("exclusion.rule.not.proper"),'isAutoHide=true');//No I18N
            return;
        }
        var weekDay = jQuery("#excludeWeekDays_1").val();
        if (weekDay == undefined || weekDay == '') {
            showalert("failure",translate("exclusion.rule.not.proper"),'isAutoHide=true');//No I18N
            return;
        }

        var clonerow = jQuery("#templateExclude").find("div[data-section=excludeon]").clone(true);
        jQuery("addBtn_1").attr("disabled", '');
        clonerow.attr("id", "exclude_2").end();
        clonerow.find("#weekCount_template").attr("id", "weekCount_2");
        clonerow.find("#excludeWeekDays_template").attr("id", "excludeWeekDays_2");
        clonerow.find("#addBtn_template").attr("id", "addBtn_2");
        clonerow.find("#removeBtn_template").attr("id", "removeBtn_2");
        jQuery("#excludeSectionsList").find("div[data-section=excludeon]").after(clonerow).end()
            .find("button[name='addExcludeRow']").attr('disabled', '').end();

        $operHr.initWeekList('weekCount_2');//No I18N
        $operHr.initExcludeDaysList('2');

        $operHr.excludeWeeksHandling('excludeWeekDays_1', 'excludeWeekDays_2');//No I18N

        initTooltip("#excludeSectionsList");//No I18N
    },
     // Generate break hours time - common to all time elements
    breakHourGenerator: function(starthr, endhr, startMins, endMins, brkTr) {

        var starthrLi = '',
            startminLi = '',
            endhrLi = '',
            endminLi = '';

        // Generate Start Hrs & Min List

         for (var j = starthr; j <= endhr; j++) {
                (j <= 9) ? starthrLi += '<li>0' + j + '</li>': starthrLi += '<li>' + j + '</li>';
                (j <= 9) ? endhrLi += '<li>0' + j + '</li>': endhrLi += '<li>' + j + '</li>';
            }
            for (var j = 0; j < 60; j++) {
                (j <= 9) ? startminLi += '<li>0' + j + '</li>': startminLi += '<li>' + j + '</li>';
                (j <= 9) ? endminLi += '<li>0' + j + '</li>': endminLi += '<li>' + j + '</li>';
            }

        // Add the generated result of break hours HTML and input values
        brkTr.find('ul[rel="res-hours"]').eq(0).html(starthrLi).end()
            .eq(1).html(endhrLi);
        brkTr.find('ul[rel="res-mins"]').eq(0).html(startminLi).end()
            .eq(1).html(endminLi);

        starthr = (starthr <=9)?'0'+starthr:starthr;
        endhr = (endhr <=9)?'0'+endhr:endhr;
        startMins = (startMins <=9)?'0'+startMins:startMins;
        endMins = (endMins <=9)?'0'+endMins:endMins;

        brkTr.find('.selected-time').eq(0).text(starthr + " : "+startMins).end()
            .eq(1).text(endhr + " : "+endMins);
        brkTr.find('.res-time input').eq(0).val(starthr).end()
            .eq(1).val(startMins).end()
            .eq(2).val(endhr).end()
            .eq(3).val(endMins);
    },
    //Initialises all events for time components like change,click and focusout
    initialiseAllEvents: function() {
        jQ('div.res-select-time ul[rel="res-hours"] li').off('click').on('click', function() {//No I18N
            var jThis = jQuery(this),
                value = jThis.text().trim();
            jThis.closest("div.res-select-time").find(".res-input input").eq(0).val(value);//No I18N
            setTimeout(function() {
                jThis.closest("td").find("div.res-select-time input").change();//No I18N
            }, 100);
        });

        jQ('div.res-select-time ul[rel="res-mins"] li').off('click').on('click', function() {//No I18N
            var jThis = jQuery(this),
                value = jThis.text();
            jThis.closest("div.res-select-time").find(".res-input input").eq(1).val(value);//No I18N
            setTimeout(function() {
                jThis.closest("td").find("div.res-select-time input").change();//No I18N
                jThis.closest("td").find("div.res-select-time input").trigger('focusout');//No I18N
            }, 100);

        });

        //restricting pasting values to time component - Fix suggested by UI team
        jQ('div.res-select-time input').off('paste').on('paste',function(){//No I18N
            return false;
        });


        // Runs on when the start time / end time changed and calculate the time difference
        jQ('tr div.res-select-time input').off('change').on('change', function() {//No I18N
            var trId = jQuery(this).closest('tr').attr("id");
            $operHr.updateTimeDiffInElement(trId);
        });

        //validating break hours on all scenarios
        jQ('tr[id*="_breakHours"] div.res-time, #stdHrsBreakTime_BreakHours div.res-time').off('focusout').on('focusout', function() {//No I18N
            var jThis = jQuery(this);
            var closesttr = jThis.closest("tr");//No I18N
            var trId = closesttr.attr("id");//No I18N
            var resinput = closesttr.find("div.res-time input"),
                starthr = parseInt(resinput.eq(0).val()),
                startMins = parseInt(resinput.eq(1).val()),
                endhr = parseInt(resinput.eq(2).val()),
                endMins = parseInt(resinput.eq(3).val());
            //Before generating break hrs, time validation needs to be done.
            if (starthr > endhr || (starthr == endhr && startMins >= endMins)) {
                //alert("Start time has to be lesser than end time");
                jQuery("#" + trId).closest('tr').find(".alert-danger").removeClass("hide").text(translate("time.greater.than.time", [translate("break.end.time"), translate("break.start.time")]));
            } else {
                //Need to check if break time falls within operational time.
                var toCheck = '';
                if (trId == 'stdHrsBreakTime_BreakHours') {
                    toCheck = 'standardHrs';//No I18N
                } else {
                    toCheck = trId.split("_")[0] + "_details";
                }
                var detailsInput = jQuery("#" + toCheck).closest('tr').find("div.res-time input");
                var detailStartHr = parseInt(detailsInput.eq(0).val()),
                    detailStartMins = parseInt(detailsInput.eq(1).val()),
                    detailEndHr = parseInt(detailsInput.eq(2).val()),
                    detailEndMins = parseInt(detailsInput.eq(3).val());
                if (starthr < detailStartHr || endhr > detailEndHr || (starthr == detailStartHr && startMins <= detailStartMins) || (endhr == detailEndHr && endMins >= detailEndMins)) {
                    jQuery("#" + trId).closest('tr').find(".alert-danger").removeClass("hide").text(translate("break.time.within.operational.time"));
                } else {
                    if (!jQuery("#" + trId).closest('tr').find(".alert-danger").hasClass("hide")) {
                        jQuery("#" + trId).closest('tr').find(".alert-danger").addClass("hide");
                    }
                }

            }
        });
        // Update the Exiting corresponding Break hours List & validate time
        jQ('tr[id*="_details"] div.res-time, #standardHrs div.res-time').off('focusout').on('focusout', function() {//No I18N
            var jThis = jQuery(this);
            var brkTr = '';
            var closesttr = jThis.closest("tr"),//No I18N
                trId = closesttr.attr("id") || 'standardHrs';//No I18N
            if (trId == 'standardHrs') {
                brkTr = jQuery("#stdHrsBreakTime_BreakHours").closest('tr');//No I18N
            } else {
                brkTr = jQuery("#" + trId.split("_")[0] + "_breakHours").closest('tr');
            }
            var resinput = closesttr.find("div.res-time input"),
                starthr = parseInt(resinput.eq(0).val().trim()),
                startMins = parseInt(resinput.eq(1).val().trim()),
                endhr = parseInt(resinput.eq(2).val().trim()),
                endMins = parseInt(resinput.eq(3).val().trim());

            //Before generating break hrs, time validation needs to be done.
            if (starthr > endhr || (starthr == endhr && startMins >= endMins)) {
                //alert("Start time has to be lesser than end time");
                jQuery("#" + trId).closest('tr').find(".alert-danger").removeClass("hide").text(translate("time.greater.than.time", [translate("sdp.admin.operatinghours.workingtime.endtime"), translate("sdp.admin.operatinghours.workingtime.starttime")]));
            } else {
            jQuery("#" + trId).closest('tr').find(".alert-danger").addClass("hide");

                if (!brkTr.hasClass('hide')) {
                    //Before generating break hrs, checking for previously configured breaktime with changed start/end time. If previously configured is outside operational hrs,break hrs can be regenerated again
                    var prevbreakResinput = brkTr.find("div.res-time input"),
                        prevbreakStarthr = parseInt(prevbreakResinput.eq(0).val().trim()),
                        prevbreakStartmin = parseInt(prevbreakResinput.eq(1).val().trim()),
                        prevbreakEndhr = parseInt(prevbreakResinput.eq(2).val().trim()),
                        prevbreakEndmin = parseInt(prevbreakResinput.eq(3).val().trim());
                    if (starthr > prevbreakStarthr || endhr < prevbreakEndhr || (starthr == prevbreakStarthr && startMins >= prevbreakStartmin) ||
                        (endhr == prevbreakEndhr && endMins <= prevbreakEndmin)) {
                        //if (confirm(translate("breaktime.outbound.operational.time"))) {
                            $operHr.breakHourGenerator(starthr, endhr, startMins, endMins, brkTr);
                            if (trId == 'standardHrs') {
                                  $operHr.updateTimeDiffInElement("stdHrsBreakTime_BreakHours");//No I18N
                            } else {
                                   $operHr.updateTimeDiffInElement(trId.split("_")[0] + "_breakHours");//No I18N
                            }


                            if (trId == 'standardHrs') {
                                var breakResinput = brkTr.find("div.res-time input"),
                                    breakStarthr = breakResinput.eq(0).val().trim().length == 1 ? "0" + breakResinput.eq(0).val() : breakResinput.eq(0).val(),
                                    breakStartmin = breakResinput.eq(1).val().trim().length == 1 ? "0" + breakResinput.eq(1).val() : breakResinput.eq(1).val(),
                                    breakEndhr = breakResinput.eq(2).val().trim().length == 1 ? "0" + breakResinput.eq(2).val() : breakResinput.eq(2).val(),
                                    breakEndmin = breakResinput.eq(3).val().trim().length == 1 ? "0" + breakResinput.eq(3).val() : breakResinput.eq(3).val();



                                //All days with standard as type needs to have same break time as global.
                                var allDayList = $operHr.allDayList;
                                allDayList.forEach(function(day) {
                                    var dayDetails = jQuery('#' + day + '_details').closest('tr');
                                    if (dayDetails.find("#dayType").val() == 'standard') {
                                        //taking break time element for the day.
                                        var dayBreakEle = jQuery("#" + day + "_breakHours").closest('tr');
                                        dayBreakEle.find("#breakStartTime .selected-time").text(breakStarthr + " : " + breakStartmin);
                                        dayBreakEle.find("#breakEndTime .selected-time").text(breakEndhr + " : " + breakEndmin);
                                        var timeDiff = $operHr.timediffcalc('00', breakStarthr, breakStartmin, breakEndhr, breakEndmin);

                                        dayBreakEle.find("span[rel='stdbrkhrs-tot-time']").text(timeDiff);
                                    }
                                })
                            }
                        //}
                    }
                }
            }
        });

        jQ('div.res-select-time input').off('focusout').on('focusout', function() {//No I18N
            var _self = jQuery(this),
                trID = _self.closest("tr").attr("id"),//No I18N
                tdID = _self.closest("td").attr("id"),//No I18N
                initialTD;
            _self.trigger("change");

            // Maintain 2 digit format
            (isNaN(parseInt(_self.val()))) ? _self.val("00"): '';
            (_self.val().length == 1 && _self.val() <= 9) ? _self.val("0" + _self.val()): '';

            // Replace all day with default Standard working hours
            var operHrTable = jQuery('#diff-oper-hrs');
            if (trID == 'stdHrsBreakTime_BreakHours') {
                operHrTable.find("#stdHrsBreakTime_BreakHours td").eq(2).attr('id', 'stdhr-start-template-b').end()
                    .eq(4).attr('id', 'stdhr-end-template-b');
            }
            if (tdID == 'stdhr-start-template' || tdID == 'stdhr-end-template' || tdID == 'stdhr-start-template-b' || tdID == 'stdhr-end-template-b') {

                (tdID == 'stdhr-start-template' || tdID == 'stdhr-start-template-b') ? initialTD = 0: initialTD = 1;//No I18N
                jQuery("#" + tdID + " input").eq(0).attr('value', jQuery("#" + tdID + " input").eq(0).val())
                jQuery("#" + tdID + " input").eq(1).attr('value', jQuery("#" + tdID + " input").eq(1).val())
                var startHrNoId = jQuery("#" + tdID + " div.res-time").html(),
                    calcTime = jQuery("#standardHrs span[rel=stdhrs-tot-time]").text(),
                    type = 'data-stdvalue';//No I18N
                if (tdID == 'stdhr-start-template-b' || tdID == 'stdhr-end-template-b') {
                    type = 'data-stdbrkvalue';//No I18N
                    calcTime = operHrTable.find("#stdHrsBreakTime_BreakHours span[rel=stdbrkhrs-tot-time]").text();
                }
                var allDayList = $operHr.allDayList;
                allDayList.forEach(function(day) {
                    var currentEle = jQuery('#' + day + '_details').closest('tr');
                    if ('standard' == currentEle.find('#dayType').val()) {
                        //For standard, parallel sync is necessary
                        if (tdID == 'stdhr-start-template') {
                            currentEle.find('div.res-time').eq(0).html(startHrNoId).end()
                                .find("div.res-select-time").removeAttr("style").end()
                                .find("input").removeClass("active");
                            currentEle.find("span[rel=stdhrs-tot-time]").text(calcTime);
                            currentEle.find(".alert-danger").addClass("hide");

                        } else if (tdID == 'stdhr-start-template-b') {//No I18N
                            jQuery('#' + day + '_breakHours').closest('tr').find('div.res-time').eq(0).html(startHrNoId).end()
                                .find("div.res-select-time").removeAttr("style").end()
                                .find("input").removeClass("active");
                            jQuery('#' + day + '_breakHours').closest('tr').find("span[rel=stdbrkhrs-tot-time]").text(calcTime);
                            jQuery('#' + day + '_breakHours').closest('tr').find(".alert-danger").addClass("hide");

                        } else if (tdID == 'stdhr-end-template-b') {//No I18N
                            jQuery('#' + day + '_breakHours').closest('tr').find('.res-time').eq(1).html(startHrNoId).end()
                                .find(".res-select-time").removeAttr("style").end()
                                .find("input").removeClass("active");
                            jQuery('#' + day + '_breakHours').closest('tr').find("span[rel=stdbrkhrs-tot-time]").text(calcTime);
                            jQuery('#' + day + '_breakHours').closest('tr').find(".alert-danger").addClass("hide");

                        } else {
                            currentEle.find('div.res-time').eq(1).html(startHrNoId).end()
                                .find("div.res-select-time").removeAttr("style").end()
                                .find("input").removeClass("active");
                            currentEle.find("span[rel=stdhrs-tot-time]").text(calcTime);
                            currentEle.find(".alert-danger").addClass("hide");

                        }

                    }
                });
            }
        });

        initTooltip("#opHrsContentSec");//No I18N

    },
    checkForWorkingDay: function(obj) {
        if(obj!=null && obj!=undefined && obj.value!=null){
            var day = obj.value;
            var ele = jQuery("#" + day + "_details").closest('tr').find('td:eq(0) input[type="checkbox"]');
            if (ele.is(':checked')) {
                //value will be sent based on global site Type
                var siteType = 'standard';//No I18N
                if (jQuery("#round24hrsip").is(':checked')) {
                    siteType = '24x7';//No I18N
                }
                $operHr.changeDayType(day, siteType);
            } else {
                $operHr.changeDayType(day, 'not-set');//No I18N
            }
        }
    },
    setTimeValueInHtml: function(ele) {

        var standardEle = jQuery("#standardHrs").closest('tr').find("div.res-time input");
        ele.find('div.res-time input').eq(0).val(standardEle.eq(0).val().trim()).end()
            .eq(1).val(standardEle.eq(1).val().trim()).end()
            .eq(2).val(standardEle.eq(2).val().trim()).end()
            .eq(3).val(standardEle.eq(3).val().trim());
    },
    // Runs on Standard / custom menu clicked
    changeDayType: function(day, type) {
        var ele = jQuery("#" + day + "_details").find("#dayType");
        var htmlDropDown = '<span class="caret ml5"></span>';
        //Finding closest tr element
        var closestTr = ele.closest('tr');//No I18N
        var trChild = closestTr.find('td').length;
        for (var i = 2; i < trChild; i++) {
            closestTr.find('td').eq(2).remove();
        }
        if (type == 'standard') {
            ele.html(translate("standard.hours") + htmlDropDown);
            ele.val('standard');//No I18N
            closestTr.find("#" + day + "_workingType").prop('checked', true);
            closestTr.prop('class', 'std-ophr').end()//No I18N
                     .attr('data-rowtype', 'stdhrs').end()
                     .attr('data-stdvalue', "true").end();
            //Need to get global standard time htmls
                closestTr.append('<td>' + jQuery("#stdhr-start-template").html() + '</td><td class="tc">–</td><td width="140">' + jQuery("#stdhr-end-template").html() + '</td><td width="150" colspan="2">' + jQuery("#stdTotalTime").html() + '</td>');//No I18N
            //In case of standard time readonly attribute has to be enabled.
            closestTr.find('div.res-time').attr('readonly', 'true');
            jQuery("#" + day + "_details").closest('tr').find(".alert-danger").addClass("hide");
            jQuery("#" + day + "_breakHours").closest('tr').find(".alert-danger").addClass("hide");

            //In case of standard,if break hours is available in global, that also has to be appended in readonly format.
            if (jQuery("#stdHrsBreakTime_BreakHours").closest('tr').hasClass('hide')) {
                //In case of hide, add break hrs button has to be enabled.
                jQuery("#" + day + "_details").closest('tr').find("td:last-child div").removeClass("hide");

                jQuery("#" + day + '_breakHours').closest('tr').addClass("hide");

            } else {
                var breakBtnDiv = jQuery("#" + day + "_details").closest('tr').find("td:last-child div");
                breakBtnDiv.addClass('hide');

                var breakHr = jQuery("#" + day + '_breakHours').closest('tr');
                breakHr.removeClass("hide").end()
                       .find("td:last-child div").addClass("hide").end()
                       .find('div.res-time').attr('readonly', 'true');
                //sync global site break time with day break time.
                var jThis = jQuery("#stdHrsBreakTime_BreakHours"),
                    closesttr = jThis.closest('tr'),//No I18N
                    resinput = closesttr.find("div.res-time input"),
                    starthr = resinput.eq(0).val().trim().length == 1 ? "0" + resinput.eq(0).val() : resinput.eq(0).val(),
                    startmin = resinput.eq(1).val().trim().length == 1 ? "0" + resinput.eq(1).val() : resinput.eq(1).val(),
                    endhr = resinput.eq(2).val().trim().length == 1 ? "0" + resinput.eq(2).val() : resinput.eq(2).val(),
                    endmin = resinput.eq(3).val().trim().length == 1 ? "0" + resinput.eq(3).val() : resinput.eq(3).val();
                var breakThis = jQuery("#" + day + "_breakHours"),
                    breakClosesTr = breakThis.closest('tr'),//No I18N
                    breakresinput = breakClosesTr.find("div.res-time input");
                breakClosesTr.prop('class', 'std-ophr');//No I18N
                jQuery("#" + day + "_breakHours").find("#breakStartTime .selected-time").text(starthr + " : " + startmin);
                jQuery("#" + day + "_breakHours").find("#breakEndTime .selected-time").text(endhr + " : " + endmin);
                breakresinput.eq(0).val(starthr);
                breakresinput.eq(1).val(startmin);
                breakresinput.eq(2).val(endhr);
                breakresinput.eq(3).val(endmin);
                //Has to update break time diff also
                jQuery("#" + day + "_breakHours").closest('tr').find("span[rel=stdbrkhrs-tot-time]").text(closesttr.find("span[rel=stdbrkhrs-tot-time]").text());
            }
        } else if (type == '24x7') {//No I18N
            ele.html(translate('round.clock') + htmlDropDown);
              ele.val('24x7');//No I18N

            closestTr.find("#" + day + "_workingType").prop('checked', true);
            closestTr.prop('class', 'round-ophr').end()//No I18N
                     .attr('data-rowtype', 'roundhrs').end()
                     .removeAttr('data-stdvalue');
            closestTr.append('<td colspan="3"><span class="def-hr-line activeline"></span></td><td width="150" colspan="2"><span rel="stdhrs-tot-time">24' + translate("sdp.projects.daydiff.hours") + '</span></td>');
            jQuery("#" + day + '_breakHours').closest('tr').addClass("hide");

        } else if (type == 'not-set') {//No I18N
            ele.html(translate('do.not.set') + htmlDropDown).end();
              ele.val('not-set');//No I18N
            closestTr.prop('class', 'std-ophr notset').end()//No I18N
                     .attr('data-rowtype', 'stdhrs').end()

                     .removeAttr('data-stdvalue');
            closestTr.append('<td colspan="3"><span class="def-hr-line"></span></td><td  width="150" colspan="2"><span rel="stdhrs-tot-time">--</span></td>');
            var breakHrDiv = jQuery("#" + day + '_breakHours').closest('tr');
            breakHrDiv.addClass('hide');
            //In case of not-set, is working has to be set as false
            closestTr.find("#" + day + "_workingType").prop('checked', false);
        } else {
            ele.html(translate("custom.hours") + htmlDropDown);
               ele.val('custom');//No I18N

            closestTr.find("#" + day + "_workingType").prop('checked', true);
            jQuery("#" + day + "_details").closest('tr').prop('class', 'std-ophr custhrs');
            closestTr.attr('data-rowtype', 'stdhrs').end()
                     .removeAttr('data-stdvalue').end()
                  closestTr.append('<td>' + jQuery("#stdhr-start-template").html() + '</td><td class="tc">–</td><td width="140">' + jQuery("#stdhr-end-template").html() + '</td><td width="100">' + jQuery("#stdTotalTime").html() + '</td><td>' +//No I18N
                jQuery("#stdhrsBreakTime").html() + '</td>');
                jQuery("#" + day + "_details").closest('tr').find(".alert-danger").addClass("hide");
                 jQuery("#" + day + "_breakHours").closest('tr').find(".alert-danger").addClass("hide");

            var breakHrDiv = jQuery("#" + day + '_breakHours').closest('tr');
            breakHrDiv.addClass('hide');
            closestTr.find('div.res-time').removeAttr("readonly");
            var lastTd = closestTr.find('td:last-child a');
            lastTd.on('click', function(e) {
                $operHr.addBreakHours(day);
            });


        }
        $operHr.setTimeValueInHtml(closestTr);

        //once the cloning over, all time related events has to be initialised
        $operHr.initialiseAllEvents();

    },
    // Add break hours
    addBreakHours: function(day) {
        if (day == 'standardHrs') {
            jQuery("#stdhrsBreakTime").addClass('disp-h');//No I18N
            jQuery("#stdHrsBreakTime_BreakHours").closest('tr').removeClass('hide');//No I18N
            //calculating break hrs based on chosen time.
            var resinput = jQuery("#stdhrsBreakTime").closest('tr').find("div.res-time input");
            $operHr.breakHourGenerator(parseInt(resinput.eq(0).val().trim()), parseInt(resinput.eq(2).val().trim()), parseInt(resinput.eq(1).val().trim()), parseInt(resinput.eq(3).val().trim()), jQuery("#stdHrsBreakTime_BreakHours").closest('tr'));//No I18N
            $operHr.updateTimeDiffInElement('stdHrsBreakTime_BreakHours');//No I18N
            //If break time selected for global standard hrs, all day with standard has to be populated the same.
            var allDayList = $operHr.allDayList;
            allDayList.forEach(function(day) {
                var currentEle = jQuery('#' + day + '_details').closest('tr').find('#dayType');
                if ('standard' == currentEle.val()) {
                    jQuery("#" + day + "_breakHours").closest('tr').removeClass('hide').end()
                        .find('div.res-time').attr('readonly', 'true').end()
                        .find("td:last-child div").addClass("hide");
                    //Need to remove add break hours sign.
                    var closestTr = jQuery("#" + day + "_details").closest('tr');
                    closestTr.find("td:last-child div").addClass("hide");
                    closestTr.find("span[rel='stdhrs-tot-time']").removeClass('hide').text(jQuery("#stdhrsBreakTime").closest('tr').find("span[rel='stdhrs-tot-time']").text());
                    resinput = closestTr.find("div.res-time input");
                    $operHr.breakHourGenerator(parseInt(resinput.eq(0).val().trim()), parseInt(resinput.eq(2).val().trim()), parseInt(resinput.eq(1).val().trim()), parseInt(resinput.eq(3).val().trim()), jQuery("#" + day + "_breakHours").closest('tr'));
                    jQuery("#" + day + "_breakHours").closest('tr').find("span[rel='stdbrkhrs-tot-time']").removeClass('hide').text(jQuery("#stdHrsBreakTime_BreakHours").closest('tr').find("span[rel='stdbrkhrs-tot-time']").text());
                }
            });
        } else {
            //custom hours
            jQuery("#" + day + "_breakHours").closest('tr').removeClass('hide').end()
                .find('div.res-time').removeAttr('readonly');
            //Need to remove add break hours sign.
            var closestTr = jQuery("#" + day + "_details").closest('tr');
            closestTr.find("td:last-child div").addClass("hide");
            //Here break hours has to be generated.
            var resinput = closestTr.find("div.res-time input");
            $operHr.breakHourGenerator(parseInt(resinput.eq(0).val().trim()), parseInt(resinput.eq(2).val().trim()), parseInt(resinput.eq(1).val().trim()), parseInt(resinput.eq(3).val().trim()), jQuery("#" + day + "_breakHours").closest('tr'));

            if (jQuery('#' + day + '_details').closest('tr').find('#dayType').val().trim() == 'custom') {
                //Adding spl class for custom type
                jQuery('#' + day + '_breakHours').closest('tr').prop('class', 'std-ophr custhrs');
                    //need to enable remove btn also
                    jQuery('#' + day + '_breakHours').closest('tr').find("td:last-child div").removeClass("hide");
                //time diff also needs to be calculated.
                $operHr.updateTimeDiffInElement(day + '_breakHours');//No I18N
            } else {
                //standard.
                jQuery('#' + day + '_breakHours').closest('tr').prop('class', 'std-ophr');
            }
        }
        initTooltip("#opHrsContentSec");//No I18N
        //on cloning new rows, initialising the events
        $operHr.initialiseAllEvents();
    },
    validateTimeObj: function(startTimeHr, startTimeMins, endTimeHr, endTimeMins, type, isBreak) {
        if (startTimeHr > endTimeHr) {
            if (isBreak) {
                showalert('failure',type + " " + translate("time.validation.common", [translate("break.start.time"), translate("break.end.time")]),'isAutoHide=true');//No I18N
                return false;
            } else {
                showalert("failure",type + " " + translate("time.validation.common", [translate("sdp.admin.operatinghours.workingtime.starttime"), translate("sdp.admin.operatinghours.workingtime.endtime")]),'isAutoHide=true');//No I18N
                return false;
            }

        } else if (startTimeHr == endTimeHr) {
            if (startTimeMins >= endTimeMins) {
                if (isBreak) {
                    showalert("failure",type + " " + translate("time.validation.common", [translate("break.start.time"), translate("break.end.time")]),'isAutoHide=true');//No I18N
                    return false;
                } else {
                    showalert("failure",type + " " + translate("time.validation.common", [translate("sdp.admin.operatinghours.workingtime.starttime"), translate("sdp.admin.operatinghours.workingtime.endtime")]),'isAutoHide=true');//No I18N
                    return false;
                }
            }
        }
        return true;
    },
    validateBreakTimeObj: function(startTimeHr, startTimeMins, breakStartTimeHr, breakStartTimeMins, endTimeHr, endTimeMins, breakEndTimeHr, breakEndTimeMins, type) {
        if (breakStartTimeHr < startTimeHr) {
            showalert("failure",translate("break.time.within.operational.time") + " : " + type,'isAutoHide=true');//No I18N
            return false;

        } else if (breakStartTimeHr == startTimeHr) {
            if (breakStartTimeMins <= startTimeMins) {
                showalert("failure",translate("break.time.within.operational.time") + " : " + type,'isAutoHide=true');//No I18N
                return false;

            }

        }

        if (breakEndTimeHr > endTimeHr) {
            showalert("failure",translate("break.time.within.operational.time") + " : " + type,'isAutoHide=true');//No I18N
            return false;

        } else if (breakEndTimeHr == endTimeHr) {
            if (breakEndTimeMins >= endTimeMins) {
                showalert("failure",translate("break.time.within.operational.time") + " : " + type,'isAutoHide=true');//No I18N
                return false;

            }
        }
        return true;
    },
    excludeWeeksHandling: function(currentId, idToReplace) {

        //On changing day in rule1, rule2 value also needs to be modified.
        var selectedValue = jQuery("#" + currentId).val();
        var allDayListForSelect2 = $operHr.allDayListForSelect2;
        var dataToModify = JSON.parse(JSON.stringify(allDayListForSelect2));
        var valueToCheck = jQuery("#" + idToReplace).val();
        if (selectedValue != undefined && selectedValue != '' && jQuery("#" + idToReplace).length > 0) {
            for (var i = 0; i < allDayListForSelect2.length; i++) {
                if (selectedValue == allDayListForSelect2[i].id) {
                    dataToModify.splice(i, 1);
                }
            }
        }
        jQuery("#" + idToReplace).select2("destroy").val("");
        jQuery("#" + idToReplace).select2({
            data: dataToModify,
            formatNoMatches: translate("common.no.match.found"), //No I18N
            placeholder: translate('sdp.change.sla.select')
        });
        if (valueToCheck != undefined && valueToCheck != '' && valueToCheck != selectedValue) {
            jQuery("#" + idToReplace).select2('val', valueToCheck);
        }

    },
    // Time Difference Calculator
    timediffcalc: function(invalidval, starthr, startmin, endhr, endmin) {
        var sc1, sc2, totsc, minDiff = 0,
            hrDiff = 0;
        starthr = parseInt(starthr) || 0;
        endhr = parseInt(endhr) || 0;
        startmin = parseInt(startmin) || 0;
        endmin = parseInt(endmin) || 0;

        sc1 = starthr * 60 + startmin;
        sc2 = endhr * 60 + endmin;
        totsc = sc2 - sc1;
        hrDiff = totsc / 60;
        minDiff = totsc % 60;

        hrDiff = Math.floor(Math.abs(hrDiff));
        minDiff = Math.floor(Math.abs(minDiff));

        var timediff = '';
        if (hrDiff !== 0 && minDiff === 0) {
            timediff = hrDiff + translate("sdp.projects.daydiff.hours") + ' ';
        } else if (hrDiff === 0 && minDiff !== 0) {
            timediff = minDiff + translate("sdp.projects.daydiff.minutes");
        } else {
            timediff = hrDiff + translate("sdp.projects.daydiff.hours") + ' ' + minDiff + translate("sdp.projects.daydiff.minutes");
        }
        return timediff;
    },
    replaceMenuToggle: function(dayType, day) {
        var closestTr = jQuery('#' + day + '_details').closest('tr');
        if (dayType == 'standard') {
            closestTr.find(".sdmenu-dd li").eq(1).replaceWith('<li data-text="Standard Hours"><a href="/">' + translate("standard.hours") + '</a></li>');
            closestTr.find(".sdmenu-dd li a").eq(1).off('click').on('click', function() {//No I18N
                $operHr.changeDayType(day, 'standard');//No I18N

            });
        } else {
            closestTr.find(".sdmenu-dd li").eq(1).replaceWith('<li data-text="Round the clock"><a href="/">' + translate("round.clock") + '</a></li>');
            closestTr.find(".sdmenu-dd li a").eq(1).off('click').on('click', function() {//No I18N
                $operHr.changeDayType(day, '24x7');//No I18N

            });
        }
    },
    updateTimeDiffInElement: function(id) {

            var closesttr = jQuery("#" + id).closest('tr'),
            resinput = closesttr.find("div.res-time input"),
            starthr = resinput.eq(0).val().trim().length == 1 ? "0" + resinput.eq(0).val() : resinput.eq(0).val(),
            startmin = resinput.eq(1).val().trim().length == 1 ? "0" + resinput.eq(1).val() : resinput.eq(1).val(),
            endhr = resinput.eq(2).val().trim().length == 1 ? "0" + resinput.eq(2).val() : resinput.eq(2).val(),
            endmin = resinput.eq(3).val().trim().length == 1 ? "0" + resinput.eq(3).val() : resinput.eq(3).val();

        resinput.eq(0).val(starthr);
        resinput.eq(1).val(startmin);
        resinput.eq(2).val(endhr);
        resinput.eq(3).val(endmin);

        var breakDiv = "span[rel='stdhrs-tot-time']";//No I18N

        if (id === 'standardHrsip' || id == 'standardHrs') {
            jQuery("#stdhr-start-template span.selected-time").text(starthr + " : " + startmin);
            jQuery("#stdhr-end-template span.selected-time").text(endhr + " : " + endmin);
        } else if (id == 'stdHrsBreakTime_BreakHours') {//No I18N
            jQuery("#stdhr-start-template-b span.selected-time").text(starthr + " : " + startmin);
            jQuery("#stdhr-end-template-b span.selected-time").text(endhr + " : " + endmin);
            breakDiv = "span[rel='stdbrkhrs-tot-time']";//No I18N
        } else if (id.indexOf("_details") > -1) {
            jQuery("#" + id).find("#startTime span.selected-time").text(starthr + " : " + startmin);
            jQuery("#" + id).find("#endTime span.selected-time").text(endhr + " : " + endmin);
        } else {
            jQuery("#" + id).find("#breakStartTime span.selected-time").text(starthr + " : " + startmin);
            jQuery("#" + id).find("#breakEndTime span.selected-time").text(endhr + " : " + endmin);
            breakDiv = "span[rel='stdbrkhrs-tot-time']";//No I18N
        }
        var timediff = $operHr.timediffcalc('00', starthr, startmin, endhr, endmin);
        closesttr.find(breakDiv).text(timediff);
    },
    opHrSiteChange: function(selval, opType) { //site dropdown change event
        sdpAjax({
            url: '/servlet/AJaxServlet?action=checkReferSite&siteID=' + selval.id + '&configID=1', // No I18N
            type: "POST", // No I18N
            async: false,
            dataType: "text",//No I18N
            success: function(response) {
                if (response == 'null') {
                    var selsiteId = selval.id;
                    var selsitename = selval.text || selval.name;
                    $operHr.refruleSite = false;
                    //Not a refer site
                    addPersonalization("ADMIN_USERSITEPREFERENCE", {
                        "id": selsiteId,//No I18N
                        "text": selsitename//No I18N
                    });
                } else {
                    var ref = JSON.parse(response);
                    var siteres = {
                        "SITEREFERID": ref.SITEREFERID,//No I18N
                        "CHOOSENSITENAME": e_html(ref.CHOOSENSITENAME),//No I18N
                        "SITEREFERNAME": e_html(ref.SITEREFERNAME),//No I18N
                        "CHOOSENSITEID": ref.CHOOSENSITEID,//No I18N
                    };
                    var selsiteId = siteres.SITEREFERID;
                    var selsitename = ref.SITEREFERNAME;
                    addPersonalization("ADMIN_USERSITEPREFERENCE", {
                        "id": ref.CHOOSENSITEID,//No I18N
                        "text": ref.CHOOSENSITENAME//No I18N
                    });
                    $operHr.refruleSite = true;
                    $operHr.refruleSitedata = siteres;

                }
                var siteId = (selsiteId == '-1') ? null : selsiteId;
                $operHr.selruleSite = siteId;
                if (selsiteId == '-1' || siteId == null) {
                    selsitename = translate("sdp.common.defaultsetting");
                }
                //if sitename is null, needs to be taken via api call using siteId
                if(selsitename == undefined || selsitename ==''){
                    selsitename = $operHr.chosenSiteName;
                }
                $("#opHrSiteFilter").select2('data', {//No I18N
                    "id": selsiteId,//No I18N
                    "text": selsitename//No I18N
                });

            }
        });
    }
}
