// $Id$
var manageCalendarView = {
    init: function(calendarOptions){ // calendar options contains all required configurattions for calendar to display.
        var _self = manageCalendarView;
        _self.options = calendarOptions;
        _self.options["areSitesConfigured"] = sdp_app.IS_SITE_CONFIGURE; // specifies weather to show sites dropdown.
        _self.initOptions(); // initializes calendar default options.
        _self.getModuleTypes(); // gets all module types.
    },
    // compiles calendar template and places it in required html id present in calendarOptions.
    compileCalendarTemplate: function(){
        // container id will be send in calendarOptions.
        renderhbs("#" + manageCalendarView.options.containerId,'calendar_template', manageCalendarView.options, false, 'common');
    },
    // gets all module types.
    getModuleTypes: function(){
        var typesUrl = ''; // contains url to get all module types.
        if(manageCalendarView.entity_name == "releases"){
            typesUrl = "/api/v3/releases/release_type"; // No I18N
        }else{
            typesUrl = "/api/v3/change_types"; // No I18N
        }
        var input_data = {
            "include_inactive_value": true, // No I18N
            "list_info": { // No I18N
                "row_count":"100", // No I18N
                "start_index": 1 // No I18N
            }
        };
        sdpAjax({
            url: typesUrl, // No I18N
            async: false,
            data: sdpAjaxInputData(input_data),
            acceptODCompatible: true,
            success: function(response) {
                var na_type = { // creating a type for all entity_data which is not associated to any type.
                    "id": "n/a", // No I18N
                    "name": getMessageForKey('sdp.common.na'), // No I18N
                    "color": "#66b3ff" // No I18N
                };
                response.release_type.push(na_type);
                var type_name = ''; // used to display in UI for module types heading.
                var type_object = ''; // module object in which data is present in responce.
                if(manageCalendarView.entity_name == 'releases'){
                    type_name = getMessageForKey('common.release');
                    type_object = 'release_type'; // No I18N
                }else{
                    type_name = getMessageForKey('sdp.module.singularname.change');
                    type_object = 'change_types'; // No I18N
                }
                manageCalendarView.options.module_types = getMessageForKey('common.types',[type_name])
                manageCalendarView.options["types"] = response[type_object];
                var module_types = {}; // contains all module types as object.
                jQuery.each(response[type_object],function(i, type){
                    module_types[type.id] = type;
                });
                manageCalendarView.entityTypes = module_types;
                manageCalendarView.entity_types_object = jQuery.extend({}, module_types);
                manageCalendarView.compileCalendarTemplate();
                jQuery('#module_types [name="type"]').on('change', function(){
                    if(jQuery(this).is(":checked")){
                        manageCalendarView.entity_types_object[jQuery(this).val()] = true; // adds checked module types into entity_types_object.
                    }else{
                        delete manageCalendarView.entity_types_object[jQuery(this).val()]; // deletes un-checked module types from entity_types_object.
                    }
                    manageCalendarView.filterSelectedTypes();
                    manageCalendarView.setCalendarData();
                });
                $releaseList.callbackInitialRender(manageCalendarView.options.viewMode); // initiates all releases dropdown.
                manageCalendarView.personalizeData();
            }
        });
    },
    // initializes calendar default options.
    initOptions: function(){
        var _self = manageCalendarView;
        _self.entity_name = _self.options.module; // contains module name.
        // contains shorcut name of module to display for entity_data.
        _self.entity__name_alias  = _self.entity_name == 'releases' ? 'RL' : 'CHNG'; // No I18N
        // contains personalized key for module calendar.
        _self.personalize_key = _self.entity_name + '_calendar'; // No I18N
        // contains field on which color for entity_data is set.
        _self.color_field = _self.entity_name == 'releases' ? 'release_type' : 'change_type'; // No I18N
        // contains file name for preview URL.
        _self.previewURl = _self.entity_name == 'releases' ? 'ui/releases' : 'Change.do'; // No I18N
        // contains personalized data like site and view_type(month or week).
        _self.personalized_data = {};
        _self.entityTypes = {}; // contains all module_types.
        _self.entity_types_object = {}; // contains all checked module_types.
        _self.siteWeekOffs= []; // contains selected site weekoffs.
        _self.siteHolidays= []; // contains selected site holidays.
        _self.months = {'january':"sdp.month.jan","february":"sdp.month.feb","march":"sdp.month.mar","april":"sdp.month.apr","may":"sdp.month.may","june":"sdp.month.jun","july":"sdp.month.jul","august":"sdp.month.aug","september":"sdp.month.sep","october":"sdp.month.oct","november":"sdp.month.nov","december":"sdp.month.dec"}; // No I18N
        _self.short_months = {'jan':"sdp.Jan","feb":"sdp.Feb","mar":"sdp.Mar","apr":"sdp.Apr","may":"sdp.May","jun":"sdp.Jun","jul":"sdp.Jul","aug":"sdp.Aug","sep":"sdp.Sep","oct":"sdp.Oct","nov":"sdp.Nov","dec":"sdp.Dec"}; // No I18N
        _self.weekdays = {'sunday':{'index':'0','i18n_key':'sdp.days.sun'}, 'monday':{'index':'1','i18n_key':'sdp.days.mon'}, 'tuesday':{'index':'2','i18n_key':'sdp.days.tue'}, 'wednesday':{'index':'3','i18n_key':'sdp.days.wed'}, 'thursday':{'index':'4','i18n_key':'sdp.days.thu'}, 'friday':{'index':'5','i18n_key':'sdp.days.fri'}, 'saturday':{'index':'6','i18n_key':'sdp.days.sat'}}; // No I18N
        _self.short_weekdays = {'sun':'sdp.days.short.sun', 'mon':'sdp.days.short.mon', 'tue':'sdp.days.short.tue', 'wed':'sdp.days.short.wed', 'thu':'sdp.days.short.thu', 'fri':'sdp.days.short.fri', 'sat':'sdp.days.short.sat'}; // No I18N
        _self.views = {'week_tab':'sdp.reports.customReport.week','month_tab':'sdp.reports.customReport.month'}; // No I18N
        _self.allEntityData = []; // contains all module data.
        _self.availableEntityObjects = {};
        _self.filteredEntityData = []; // contains filterd module data(varies with allEntityData when selected any change type).
    },
    // gets and verifies personalization(weather any personalized site is deleted).
    personalizeData: function(){
        var _self = manageCalendarView;
        _self.processPersonalization();
        if(_self.personalized_data.site){
            if(_self.personalized_data.site.id != -1){
                sdpAjax({
                    url: "/api/v3/" + _self.entity_name + "/site/" + _self.personalized_data.site.id, // No I18N
                    acceptODCompatible: true,
                    ignorefailuremessage:true,
                    async: false, // need to wait till responce to check weather site is deleted.
                    success: function(response) {
                        _self.personalized_data.site.name = response.site.name;
                    },
                    error: function(){
                        _self.personalized_data.site = null;
                        addPersonalization(_self.personalize_key,_self.personalized_data);
                    }
                });
            }else{
                _self.personalized_data.site.name = getMessageForKey('sdp.admin.technician.addtechnician.nosite');
            }
        }
        _self.initCalendarProperties();
    },
    // adds all required properties of scheduler and initializes.
    initCalendarProperties: function(){
        var _self = manageCalendarView;
        _self.overWriteDHXTemplates();
        _self.bindPreviousNextEvent();
        _self.overWriteDHXEvents();
        _self.setWeekStartDay();
        // atmost 4 releases are shown per day( if more releases are generated they will be displayed as 'showmore' option).
        scheduler.config.max_month_events = 3; // No I18N
        // %j indicates 1,2,3 format instead of 01,02,03 for dates.
        scheduler.config.month_day="%j"; // No I18N
        scheduler.config.mark_now = false; // disables default functionality of indicating current time in a day.
        scheduler.config.dblclick_create = false; // disables the default functionality of creating new events.
        scheduler.config.readonly = true; // disables the default functionality to edit entity data from UI.
        // to check and configure if it's RTL mode.
        if(sdp_user.DIRECTION=="RTL"){ // No I18N
            scheduler.config.rtl = true; // No I18N
        }

        // initializing the scheduler with default view as month.
        scheduler.xy.nav_height  = 48;
        scheduler.xy.scale_height = 20;
        scheduler.config.fix_tab_position = false; 
        _self.setCalHeight(); // adding width and height onloading the page(even before data is loaded).
        setTimeout(function() { // to resolve ajax loading issues.
          _self.setCalHeight(); //No I18N
        }, 500);
        jQuery(window).on('resize',function(){  // No I18N
            _self.setCalHeight();
        });
        // initializes calendar with default view as month.
        scheduler.init('scheduler_here', new Date(), _self.personalized_data.view_type);  // No I18N /*need to check time */
        jQuery("#scheduler_here .dhx_expand_icon").css('display', 'none'); // No I18N
        if(sdp_app.IS_SITE_CONFIGURE){
            _self.initCalendarSites(); // will call only when sites are configured.
            _self.setCalHeight();       // calendar height issue fix on site enabled
        }
        _self.getHolidaysandWeekoffs();
        _self.initCustomMonthPicker();
    },
    // sets calendar height.
    setCalHeight: function(){
        if (jQuery("#footerEntityTypes").length === 0) {
            return;
        }
        jQuery("#footerEntityTypes").width(jQuery("#listcontrols").width() + 1); // No I18N
        var calheightset = jQuery("#footerEntityTypes").position().top - jQuery(".dhx_cal_navline")[0].getBoundingClientRect().top;  // No I18N
        jQuery("#scheduler_here").height(calheightset); // No I18N

        var gapResize = jQuery("#footerEntityTypes").position().top - jQuery(".dhx_cal_data")[0].getBoundingClientRect().bottom + 1; // No I18N
        if(gapResize>3){
            jQuery(".dhx_cal_data").height(jQuery(".dhx_cal_data").height() + gapResize);   // No I18N
        }
    },
    // over writes default functionality of required calendar template.
    overWriteDHXTemplates: function(){
        var _self = manageCalendarView;
        // returns tooltip text.
        scheduler.templates.tooltip_text = function(start, end, event) {
            var hoveredEntityData = _self.availableEntityObjects[event.id];
            var emergency_color = hoveredEntityData.emergency ? (_self.entity_name == 'releases' ? "rls-rocket2" : "chng-rocket2") : (_self.entity_name == 'releases' ? "rls-rocket1" : "chng-rocket1"); // No I18N
            var title_head = hoveredEntityData.emergency ? (_self.entity_name == 'releases' ? getMessageForKey("sdp.release.emergency") : getMessageForKey("sdp.change.emergencychange")) : (_self.entity_name == 'releases' ? getMessageForKey("sdp.release.general") : getMessageForKey("sdp.change.emergencychange"));// No I18N
            return "<div class='sdp-gantt-tooltip tl task-tooltip'> "+ $releaseList.constructTooltipTitle(hoveredEntityData, hoveredEntityData.scheduled_start_time.display_value, hoveredEntityData.scheduled_end_time.display_value, emergency_color, title_head) +"</div>";
        };
        // returns viewmore text(will appear when there are more then 'max_month_events' entity_name data per day).
        scheduler.templates.month_events_link = function(date, count){
            return "<a>" + getMessageForKey('sdp.project.history.viewmore') + "</a>"; // No I18N
        };
    },
    // sets the functionality of next and previous buttons of calendar.
    bindPreviousNextEvent: function(){
        var _self = manageCalendarView;
        scheduler._click.dhx_cal_prev_button = function () {
            if(scheduler._mode == "month"){
                var scheduledMonth = scheduler._min_date.getMonth(); // gets the month which calendar is displayed.
                var scheduledCalendarStartDate = scheduler._min_date.getDate(); // gets calendar starting date.
                var previousMonthofCalendar = (scheduledCalendarStartDate > 1 ? scheduledMonth : (scheduledMonth - 1)); //if scheduledCalendarStartDate is greater than 1 it concludes calendar is being started from a date of previous month hence we can set previous month as scheduledCalendarStartDate's month else should decrease month by 1(i.e previous month).
                if(previousMonthofCalendar < 0){ //will occur if schedulercheduledCalendarStartDate is Jan 1 then previous month will be -1 then adding 12 to it makes 11(i.e dec).
                    previousMonthofCalendar = 12 + previousMonthofCalendar;
                }
                var previousYearofCalendar = ((scheduledMonth == 0 && scheduledCalendarStartDate == 1)  ? (scheduler._min_date.getFullYear() - 1) : scheduler._min_date.getFullYear()); //if scheduledmonth is Jan and startingDate of calendar is 1 then we need to decrease the year by 1(i.e previous year).
                scheduler.updateView(new Date(previousYearofCalendar,previousMonthofCalendar,1)); //updating the view to previous month.
                _self.getCalendarData(scheduler._min_date, scheduler._max_date); //gets and sets data between _min_date and _max_date.
                manageCalendarView.manageTodayFunctionality(previousMonthofCalendar);
            }
            else{
                var scheduledCalendarStartDate = scheduler._min_date;
                scheduler.updateView(new Date(scheduledCalendarStartDate.setDate(scheduledCalendarStartDate.getDate() - 7))); // updates view to previous week.
                _self.getCalendarData(scheduler._min_date, scheduler._max_date); //gets and sets data between _min_date and _max_date.
                manageCalendarView.manageTodayFunctionality();
            }
        };
        scheduler._click.dhx_cal_next_button = function () {
            if(scheduler._mode == "month"){
                var scheduledMonth = scheduler._min_date.getMonth();
                var scheduledCalendarStartDate = scheduler._min_date.getDate();
                var nextMonthofCalendar = (scheduledMonth + (scheduledCalendarStartDate > 1 ? 2 : 1)) % 12; // if calendar start date is from last month then we need to increase month twice or else only once
                var nextYearofCalendar = (((scheduledMonth == 11 && scheduledCalendarStartDate > 1) || (scheduledMonth == 11 && scheduledCalendarStartDate == 1) || (scheduledMonth == 10 && scheduledCalendarStartDate > 1))  ? (scheduler._min_date.getFullYear() + 1) : scheduler._min_date.getFullYear()); // if any of the condition is satisfied then we need to increase year (i.e first day of calendar belongs to previous year).
                scheduler.updateView(new Date(nextYearofCalendar,nextMonthofCalendar,1)); // updates view to next month.
                _self.getCalendarData(scheduler._min_date, scheduler._max_date); //gets and sets data between _min_date and _max_date.
                manageCalendarView.manageTodayFunctionality(nextMonthofCalendar);
            }
            else{
                var scheduledCalendarStartDate = scheduler._min_date;
                scheduler.updateView(new Date(scheduledCalendarStartDate.setDate(scheduledCalendarStartDate.getDate() + 7))); // updates view to next week.
                _self.getCalendarData(scheduler._min_date, scheduler._max_date); //gets and sets data between _min_date and _max_date.
                manageCalendarView.manageTodayFunctionality();
            }
        };
    },
    // attaches required events to calendar.
    overWriteDHXEvents: function(){
        var _self = manageCalendarView;
        // triggers when view is changed between week and month.
        scheduler.attachEvent("onViewChange", function(new_mode,new_date){ // triggers when view is changed from month to week and viceversa.
            _self.personalized_data.view_type = new_mode;
            addPersonalization(_self.personalize_key,_self.personalized_data);
            if(new_mode == 'month'){
                jQuery('.dhx_cal_prev_button')[0].title = getMessageForKey('sdp.gantt.quickselect.previousmonth'); // No I18N
                jQuery('.dhx_cal_next_button')[0].title = getMessageForKey('sdp.common.nextmonth'); // No I18N
                _self.manageTodayFunctionality(scheduler._date.getMonth());
            }else{
                jQuery('.dhx_cal_prev_button')[0].title = getMessageForKey('sdp.gantt.quickselect.previousweek'); // No I18N
                jQuery('.dhx_cal_next_button')[0].title = getMessageForKey('sdp.common.nextweek'); // No I18N
                _self.manageTodayFunctionality();
            }
            _self.getCalendarData(scheduler._min_date, scheduler._max_date); //gets and sets data between _min_date and _max_date.
        });
        // triggers when 'month_events_link' text is clicked.
        scheduler.attachEvent("onViewMoreClick", function(date){ // here date is on which date 'month_events_link' text is clicked.
            _self.getScheduledDaysReleases(date);
            // return false indicates scheduler not to implement it's default functionality when clicked on 'month_events_link' text.
            return false; // No I18N
        });
        // triggers when any event is clicked.
        scheduler.attachEvent("onClick", function (id, e){
            var previewUrl = "/ui/print?externalframe=true&module=release&entity_id="+ id; // No I18N
            $previewComponent.load(previewUrl,e_param(getMessageForKey('sdp.release.details')));
            return false;
        });
    },
    // gets selected date's releases
    getScheduledDaysReleases: function(date){
        var _self = manageCalendarView;
        date = new Date(date);
        date.setHours(0,0,0,0);
        var daysEntityData = _self.getCalendarData(date, new Date(date.getFullYear(), date.getMonth(), (date.getDate() + 1)), false); // gets all entity_name data of selected date.
    },
    // shows selected date's releases in popup
    showScheduledDaysReleases: function(date, daysEntityData){
        var _self = manageCalendarView;
        var dialogTitle = date.getDate() + ' ' + getMessageForKey(_self.months[date.toLocaleString('default', { month: 'long' }).toLowerCase()]) + ', ' + date.getFullYear(); // constructs dialob box title.
        jQuery.each(daysEntityData, function(i, selectedEntityData){
            selectedEntityData.color = selectedEntityData[_self.color_field] ? _self.getCalendarViewDisplayColor(selectedEntityData[_self.color_field].id) : "#66b3ff";
            var emergency_color = selectedEntityData.emergency ? (_self.entity_name == 'releases' ? "rls-rocket2" : "chng-rocket2") : (_self.entity_name == 'releases' ? "rls-rocket1" : "chng-rocket1"); // No I18N
            var title_head = selectedEntityData.emergency ? (_self.entity_name == 'releases' ? getMessageForKey("sdp.release.emergency") : getMessageForKey("sdp.change.emergencychange")) : (_self.entity_name == 'releases' ? getMessageForKey("sdp.release.general") : getMessageForKey("sdp.change.emergencychange"));// No I18N
            selectedEntityData.tooltip_text = $releaseList.constructTooltipTitle(selectedEntityData, selectedEntityData.scheduled_start_time.display_value, selectedEntityData.scheduled_end_time.display_value, emergency_color, title_head);
        });
        var releases = {
            "entity_data": daysEntityData, // No I18N
            "title": dialogTitle, // No I18N
            "module_alias": _self.entity__name_alias, // No I18N
            "href": "/" + _self.previewURl + "?mode=detail&entity_id=" // No I18N
        };
        renderhbs('#viewmore_container','calendar_viewmore_template', releases, false, 'common');
        jQuery("#calendarViewMore").dialog({  // No I18N
            width : 450,
            resizable: false,
            draggable : false,
            modal: true,
            dialogClass : 'modulenew',  // No I18N
            open : function(){
                initTooltip("#calendarViewMore");   // No I18N
            },
            close : function(){
                jQuery("body").addClass("of-h");  // No I18N
                jQuery(this).dialog("destroy"); // No I18N
            }
        });
        //showDialog(compiledHtml, "closeOnEscKey=yes, closeButton=yes, height=auto, width=450px, title=" + dialogTitle); // No I18N
        initTooltip("#_DIALOG_CONTENT"); // No I18N
    },
    //sets week start day to user selected week_start_day from admin tab.
    setWeekStartDay: function(){
        scheduler.date.week_start = function(date){ 
            var shift=date.getDay(); // gets the week or months start date's day.
            if(shift != sdp_app.WEEK_START_DAY){
                shift = (shift < sdp_app.WEEK_START_DAY) ? (shift + (7 - sdp_app.WEEK_START_DAY)) : (shift - sdp_app.WEEK_START_DAY); // here shift is no of days need to be shifted to get user's  week_start_day(i.e calendar start_day is Wednesday and user week_start_day is Monday then shift is 2(we will start week or month from previous week_start_day not the next week_start_day)).
                return this.date_part(this.add(date,-1*shift,"day")); // No I18N
            }
            return this.date_part(date);
        };
    },
    // manages weather to enable or disable today butoon.
    manageTodayFunctionality : function(month){
        if(scheduler._min_date <= new Date() && scheduler._max_date >= new Date()){
            jQuery('.dhx_cal_today_button').addClass('disabled'); // No I18N
        }else{
            jQuery('.dhx_cal_today_button').removeClass('disabled'); // No I18N
        }
    },
    // initializes custom date picker.
    initCustomMonthPicker : function(){
        ZComponents.custommonthpicker("#month_picker", {// No I18N
          forElement: "#month_picker_display", // No I18N
          beforemonthchange:function(){return false;},
          drilldownLevelOnOpen: "months", // No I18N
          monthselect: function(event, data) {
            scheduler.updateView(data.value);
            manageCalendarView.getCalendarData(scheduler._min_date, scheduler._max_date);
            manageCalendarView.manageTodayFunctionality(data.value.getMonth());
            var picker = document.getElementById('month_picker');
            ZComponents.custommonthpicker(picker).close();
          }
         });
        
         var picker = document.getElementById('month_picker');
         document.getElementById("month_picker_display").addEventListener("click", function() {
          if (jQuery(picker).is(":visible")) {
           ZComponents.custommonthpicker(picker).close();
          } else {
           ZComponents.custommonthpicker(picker).open();
           ZComponents.custommonthpicker(picker).setValue(scheduler.getState().date);
          }
         });
    },
    // gets the data between start_date and end_date.
    getCalendarData: function(start_date,end_date,setCalendar = true){
        var _self = manageCalendarView;
        var input_data = {
              "list_info": { // No I18N
                "row_count":"100", // No I18N
                "search_criteria": { // No I18N
                    "field": "scheduled_start_time", // No I18N
                    "condition": "neq", // No I18N
                    "value": null, // No I18N
                    "children": [ // No I18N
                      {
                        "logical_operator": "and", // No I18N
                        "field": "scheduled_end_time", // No I18N
                        "condition": "neq", // No I18N
                        "value": null // No I18N
                      },
                      {
                        "field": "scheduled_end_time", // No I18N
                        "condition": "between", // No I18N
                        "values": [ // No I18N
                          start_date.getTime(),
                          end_date.getTime()
                        ],
                        "children": [ // No I18N
                          {
                            "logical_operator": "or", // No I18N
                            "field": "scheduled_start_time", // No I18N
                            "condition": "between", // No I18N
                            "values": [ // No I18N
                              start_date.getTime(),
                              end_date.getTime()
                            ]
                          },
                          {
                            "logical_operator": "or", // No I18N
                            "field": "scheduled_start_time", // No I18N
                            "condition": "lt", // No I18N
                            "value": start_date.getTime(), // No I18N
                            "children": [ // No I18N
                              {
                                "logical_operator": "and", // No I18N
                                "field": "scheduled_end_time", // No I18N
                                "condition": "gte", // No I18N
                                "value": end_date.getTime() // No I18N
                              }
                            ]
                          }
                        ],
                        "logical_operator": "and" // No I18N
                      }
                    ]
                  },
                  "sort_field": "scheduled_start_time", // No I18N
                  "sort_order": "asc", // No I18N
              }
            };
            input_data.list_info.fields_required = _self.options.fields_required;
        if(_self.personalized_data.site){ // if sites are configured and user selected any site this will be added to search criteria.
            var site_search_criteria = {
                "field": (_self.personalized_data.site.id == -1 ? "site" : "site.id"), // No I18N
                "condition": "is", // No I18N
                "value": (_self.personalized_data.site.id == -1 ? null : _self.personalized_data.site.id), // No I18N
                "logical_operator":"AND" // No I18N
            }
            input_data.list_info.search_criteria.children.push(site_search_criteria);
        }
        if($releaseList.searchText){
            input_data.list_info.gsearch = $releaseList.searchText;
        }
        // if sepcific kind of releases is selected by user this will be added to search criteria (default all releases will be shown).
        var current_view = sdp_user.CLIENT_CONF.releases_currentview;// No I18N
        if(current_view && current_view.filter_by){
            input_data.list_info.filter_by = current_view.filter_by; // No I18N
            if(setCalendar){
                sdpAjax({
                    url: '/api/v3/list_view_filters/'+current_view.filter_by.id, // No I18N
                    success: function(resp) {
                        jQ('#releases-filters').text(resp.list_view_filter.display_name); // No I18N
                    }
                });
            }
        }
        sdpAjax({
            url: "/api/v3/" + _self.entity_name, // No I18N
            data: sdpAjaxInputData(input_data),
            acceptODCompatible: true,
            success: function(response) {
                if(setCalendar){
                    allEntityData = filteredEntityData = response[_self.entity_name]; // contains all entity data returned by api.
                    if(Object.keys(_self.entity_types_object).length != Object.keys(_self.entityTypes).length){ // if any type is un-selected entity_types_object will have less length than entityTypes(contains all types) length.
                        _self.filterSelectedTypes(); // will call when user unchecks any change type (default all types are checked).
                    }
                    _self.availableEntityObjects = {}; // clears the object data.
                    _self.setCalendarData();
                }else{
                    var entity_data = response[_self.entity_name];
                    if(entity_data.length > 0){
                        if(Object.keys(_self.entity_types_object).length != Object.keys(_self.entityTypes).length){ // if any type is un-selected entity_types_object will have less length than entityTypes(contains all types) length.
                            entity_data = _self.filterSelectedData(entity_data); // will call when user unchecks any change type (default all types are checked).
                        }
                    }
                    _self.showScheduledDaysReleases(start_date, entity_data);
                }

            }
        });
    },
    // sets the filtered entity data in calendar.
    setCalendarData: function(){
        var _self = manageCalendarView;
        scheduler.clearAll(); // clears the entity data present in calendar.
        var calendar_data = [];
        for(var i = 0 ; i < filteredEntityData.length ; i++){
            var entityObject = filteredEntityData[i];
            _self.availableEntityObjects[entityObject.id] = entityObject;
            var event_data = {
                "id": entityObject.id, // No I18N
                "text" : '<a><span> ' + _self.entity__name_alias + '-' + entityObject.id + ' ' + e_html(entityObject.title) + '</span></a>', // No I18N
                "start_date":_self.getDateUsingValue(entityObject.scheduled_start_time.value), // No I18N
                 "end_date":_self.getDateUsingValue(entityObject.scheduled_end_time.value), // No I18N
                 "color":entityObject[_self.color_field] ? _self.getCalendarViewDisplayColor(entityObject[_self.color_field].id) : "#66b3ff", // No I18N
                "textColor":"#666666", // No I18N
                "title":  e_attr(entityObject.title) // No I18N
            };
            calendar_data.push(event_data);
        }
        scheduler.parse(calendar_data,"json"); // No I18N
        setTimeout(function(){  // Warp not occur in firefox so setTimeout added
            _self.setI18nForCalendar();
        });
    },
    // set required I18n keys in dhtmlx scheduler.
    setI18nForCalendar: function(){
        var _self = manageCalendarView;
        jQuery(".dhx_month_head").each(function(){
            if(this.innerHTML.length < 3){
                var full_date = this.parentNode.getAttribute("data-cell-date");
                this.innerHTML = `<a class="dhx_date" nonce="${sdpNonce}" data-event="click" data-handler="manageCalendarView.getScheduledDaysReleases('${full_date}')">` + this.innerHTML + '</a>';
            }
        });
        $sdEventListener(jQuery('#calscroll'));
        jQuery(".dhx_cal_event_line_start.dhx_cal_event_line_end").each(function(){
            jQuery(this).width(jQuery(this).width() - 5);
        });
        jQuery(".dhx_cal_today_button").each(function(){
            this.innerHTML = getMessageForKey('sdp.reports.today');
        });
        if(scheduler._mode == 'month'){
            jQuery(".dhtmlgroup .dhx_cal_tab").each(function(){
                this.innerHTML = getMessageForKey(_self.views[this.getAttribute('name')]);
            });
            jQuery(".dhx_cal_header .dhx_scale_bar").each(function(){
                this.innerHTML = getMessageForKey(_self.weekdays[this.innerHTML.toLowerCase()].i18n_key);
            });
            jQuery(".dhx_cal_date").each(function(){
                var month = this.innerHTML.split(' ');
                this.innerHTML = getMessageForKey(_self.months[month[0].toLowerCase()]) + ' ' + month[1];
            });
        }else if(scheduler._mode == 'week'){ // No I18N
            jQuery(".dhtmlgroup .dhx_cal_tab").each(function(){
                this.innerHTML = getMessageForKey(_self.views[this.getAttribute('name')]);
            });
            jQuery(".dhx_cal_header .dhx_scale_bar").each(function(){
                var date = this.innerHTML.split(',');
                var day = getMessageForKey(_self.short_weekdays[date[0].toLowerCase()]);
                var month = getMessageForKey(_self.months[date[1].split(' ')[1].toLowerCase()]);
                this.innerHTML = day + ', ' + month+ ' ' +date[1].split(' ')[2];
            });
            jQuery(".dhx_cal_date").each(function(){
                var dateRange = this.innerHTML.split("–");
                var startMonth = dateRange[0].split(' ');
                var endMonth = dateRange[1].split(' ');
                this.innerHTML = startMonth[0] + ' ' + getMessageForKey(_self.short_months[startMonth[1].toLowerCase()]) + ' ' + startMonth[2] + ' – ' + endMonth[1] + ' ' + getMessageForKey(_self.short_months[endMonth[2].toLowerCase()]) + ' ' + endMonth[3];
            });
        }
    },
    // initializes calendar sites dropdown.
    initCalendarSites: function(){
        var _self = manageCalendarView;
        var options = {
          'cache':{}, // No I18N
          'multiple':false, // No I18N
          'allowClear': true, // No I18N
          'placeholder': getMessageForKey("sdp.admin.org.technician.allsite"), // No I18N
          'url':[{ // No I18N
            url:"/api/v3/" + _self.entity_name + "/site",//NO I18N
            field:'site',//NO I18N
            list_info:{start_index:1,row_count:25}
          }]
        }
        if(_self.personalized_data.site){
            options.value = {'id': _self.personalized_data.site.id, 'text':_self.personalized_data.site.name}; // No I18N
        }
        jQuery("#" + _self.entity_name + "_sites").sdp_select2(options); // adds sdp_select2 for 
        jQuery("#" + _self.entity_name + "_sites").on('change', function(){ // triggers when any site is selected or changed.
            if(jQuery("#" + _self.entity_name + "_sites").val() != ''){
                _self.personalized_data.site = {"id":parseInt(jQuery("#" + _self.entity_name + "_sites").val())}; // No I18N
            }else{
                _self.personalized_data.site = null;
            }
            addPersonalization(_self.personalize_key,_self.personalized_data);
            _self.getCalendarData(scheduler._min_date, scheduler._max_date);
            _self.getHolidaysandWeekoffs();
        });
    },
    //gets all holidays and weekoffs for selected site.
    getHolidaysandWeekoffs : function(){
        var _self = manageCalendarView;
        var opHrSiteId = (_self.personalized_data.site != null ? (_self.personalized_data.site.id != -1 ? _self.personalized_data.site.id : null) : null);
        //need to check if personalised site is refer. If yes, parent site needs to be fetched for oper hrs data.
        if(opHrSiteId!=null && opHrSiteId!='-1'){
            sdpAjax({
                 url: '/servlet/AJaxServlet?action=checkReferSite&siteID='+opHrSiteId+'&configID=1', // No I18N
                 type: "POST", // No I18N
                 async : false,
                 dataType : "text",//No I18N
                 success: function(response) {
                       if(response != 'null') {
                            var ref = JSON.parse(response);
                            opHrSiteId = ref.SITEREFERID;
                       }
                 }
            });
        }
        if(opHrSiteId == '-1'){
            opHrSiteId = null;
        }
        var input_data = {
          "list_info": { // No I18N
            "search_criteria": { // No I18N
                "field": "site", // No I18N
                "condition": "is", // No I18N
                "value": opHrSiteId // No I18N
            }
          }
        };
        sdpAjax({
            url: "/api/v3/operational_hours", // No I18N
            data: sdpAjaxInputData(input_data),
            async: false,
            success: function(response) {
                var weekOffDays = [];
                var site_weekoffs = response.operational_hours[0].days_of_operation.filter(day => !day.is_working);
                jQuery.each(site_weekoffs,function(i, offDay){
                    weekOffDays.push(parseInt(_self.weekdays[offDay.week_day.toLowerCase()].index));
                });
                _self.siteWeekOffs = weekOffDays;
            }
        });
        input_data.list_info.search_criteria.children =  [
             {
                "logical_operator": "and", // No I18N
                "field": "holiday_date", // No I18N
                "condition": "lte", // No I18N
                "value": scheduler._max_date.getTime(), // No I18N
                "children": [ // No I18N
                 {
                    "logical_operator": "and", // No I18N
                    "field": "holiday_date", // No I18N
                    "condition": "gte", // No I18N
                    "value": scheduler._min_date.getTime() // No I18N
                } 
                ]
            } 
        ];
        sdpAjax({
            url: "/api/v3/holidays", // No I18N
            async: false,
            data: sdpAjaxInputData(input_data),
            success: function(response) {
                var holiday_days = [];
                if(response.holidays.length != 0){
                    var holidays = response.holidays[0].holidays;
                    jQuery.each(holidays,function(i, holiday){
                        holiday_days.push(holiday.holiday_date.value)
                    });
                }
                _self.siteHolidays = holiday_days;
            }
        });
        _self.setHolidaysandWeekoffs();
    },
    // sets holidays and weekoffs in calendar(days will appear with different bg color).
    setHolidaysandWeekoffs : function(){
        var _self = manageCalendarView;
        scheduler.templates.month_date_class = function(date){
            if(_self.siteWeekOffs.filter(weekDay => weekDay == date.getDay()).length != 0 || _self.siteHolidays.filter(holiday => holiday == date.getTime()).length != 0){
                return "dhx_holiday_cell"; // No I18N
            }
            return "";
        };
        scheduler.templates.week_date_class = function(start, today){
            if(_self.siteWeekOffs.filter(weekDay => weekDay == start.getDay()).length != 0 || _self.siteHolidays.filter(holiday => holiday == start.getTime()).length != 0){
                return "dhx_holiday_cell"; // No I18N
            }
            return "";
        };
        scheduler.updateView();
    },

    // called when user checks or unchecks any change type and filters entity data based on checked types.
    filterSelectedTypes: function(){
        var selectedTypes = Object.keys(manageCalendarView.entity_types_object);
        filteredEntityData = manageCalendarView.filterSelectedData(allEntityData);
    },

    // called when user clicks on any date(for specific dates data).
    filterSelectedData: function(entity_data){
        var selectedTypes = Object.keys(manageCalendarView.entity_types_object);
        return entity_data.filter(rel => selectedTypes.find(typeId =>
        {
            if(!rel[manageCalendarView.color_field]){
                return typeId == "n/a"; // No I18N
            }else{
                return typeId == rel[manageCalendarView.color_field].id;
            }
        } ) != null);
    },

    // gets entity data's calendar display color based on it's type.
    getCalendarViewDisplayColor: function(entityTypeId){
        return manageCalendarView.entityTypes[entityTypeId].color;
    },
    //gets date using value.
    getDateUsingValue: function(value){
        return new Date(parseInt(value));
    },
    // gets the module personalization if empty sets the default one.
    processPersonalization: function(){
        var _self = manageCalendarView;
        var cal_per = getPersonalizeData(_self.personalize_key); // No I18N
        if(jQuery.isEmptyObject(cal_per)){
            cal_per = {'site':null,'view_type':'month'}; // No I18N
        }
        else if(window.checkIfMSP()){
        	cal_per.site = null;//Resetting Site Personalization for MSP
        }
        manageCalendarView.personalized_data = cal_per;  
    }
};
