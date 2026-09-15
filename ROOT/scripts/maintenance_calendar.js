// $Id$
var $maintenanceCalendar = {
	
	loadCalendarView:function(){
		this.initialize();
		this.initializeCalendarProperties();
		addPersonalization("request_maintenances_currentview",{"view":"calendar"});
		this.renderCalendar();
		//this.calendarObj.getEventsCall();
	},
	initialize: function(){
		this.MiniCalendar=undefined;
		this.MaintenanceScheduler=undefined;
		this.mini_calendar=undefined;
		this.SchedulerMonth=undefined;
		this.sch_months = [
			"Jan", "Feb", "Mar",//no i18n
			"Apr", "May", "Jun", "Jul",//no i18n
			"Aug", "Sep", "Oct",//no i18n
			"Nov", "Dec"//no i18n
		];
		this.months_fullname=[
			getMessageForKey("sdp.month.jan"),getMessageForKey("sdp.month.feb"),
			getMessageForKey("sdp.month.mar"),getMessageForKey("sdp.month.apr"),
			getMessageForKey("sdp.month.may"),getMessageForKey("sdp.month.jun"),
			getMessageForKey("sdp.month.jul"),getMessageForKey("sdp.month.aug"),
			getMessageForKey("sdp.month.sep"),getMessageForKey("sdp.month.oct"),
			getMessageForKey("sdp.month.nov"),getMessageForKey("sdp.month.dec")
		];
		this.days_fullname=[
			getMessageForKey("sdp.days.sun"),getMessageForKey("sdp.days.mon"),
			getMessageForKey("sdp.days.tue"),getMessageForKey("sdp.days.wed"),
			getMessageForKey("sdp.days.thu"),getMessageForKey("sdp.days.fri"),
			getMessageForKey("sdp.days.sat")
		];
		this.days_shortname=[
			getMessageForKey("sdp.days.short.sun"),getMessageForKey("sdp.days.short.mon"),
			getMessageForKey("sdp.days.short.tue"),getMessageForKey("sdp.days.short.wed"),
			getMessageForKey("sdp.days.short.thu"),getMessageForKey("sdp.days.short.fri"),
			getMessageForKey("sdp.days.short.sat")
		];		
		this.months_shortname = [
			getMessageForKey("sdp.Jan"), getMessageForKey("sdp.Feb"), getMessageForKey("sdp.Mar"),//no i18n
			getMessageForKey("sdp.Apr"), getMessageForKey("sdp.May"), getMessageForKey("sdp.Jun"), getMessageForKey("sdp.Jul"),//no i18n
			getMessageForKey("sdp.Aug"), getMessageForKey("sdp.Sep"), getMessageForKey("sdp.Oct"),//no i18n
			getMessageForKey("sdp.Nov"), getMessageForKey("sdp.Dec")//no i18n
		];		
		this.days_short_label = ['S','M','T','W','T','F','S']; //no i18n
	},
	initializeCalendarProperties:function(){

		$maintenanceCalendar.options={
			sd_total_rows:undefined,
			sd_start_index:1,
			sd_total_pages:undefined,
			sd_current_page:undefined
		};
		// sdp.module.maintenance.listView.delete_search_fields=false;
		$maintenanceCalendar.global_filter=undefined;
		$maintenanceCalendar.global_filter_name=getMessageForKey('all.maintenance');
		$maintenanceCalendar.site_filter={id:'all'};// No i18N
		$maintenanceCalendar.templateFilter='all';// No i18N
		$maintenanceCalendar.initial_load=true;
		$maintenanceCalendar.current_month=undefined;
		$maintenanceCalendar.mode="month_timeline";// No i18N
		$maintenanceCalendar.filter_change=false;
		$maintenanceCalendar.onclick_timer=null;
		$maintenanceCalendar.wrapperCalObj = undefined;		
	}
};

	$maintenanceCalendar.renderCalendar=function(){
		$maintenanceCalendar.MaintenanceScheduler=Scheduler.getSchedulerInstance();
		$maintenanceCalendar.setFilters();
		var promises=[$maintenanceCalendar.fetchMetaData()];
		if($maintenanceCalendar.global_filter){
			promises.push($maintenanceCalendar.getListViewFilterDetails($maintenanceCalendar.global_filter));
		}
		jQuery.when.apply(this, promises).then(function() {
		$maintenanceCalendar.sketchCalendarOutline();
		//$maintenanceCalendar.site_filter=sdp.module.maintenance.listView.site_filter;
		//$maintenanceCalendar.templateFilter=sdp.module.maintenance.listView.templateFilter;
		$maintenanceCalendar.renderTopFilters();
		$maintenanceCalendar.getEventsCall();
		});
	};
	
	$maintenanceCalendar.fetchMetaData = function () {
        var sdpOptions = {
            url: "/api/v3/request_maintenances/metainfo", // No I18N
            success: function(data) {
                 $maintenanceCalendar.fieldsMetaInfo = data.metainfo.fields;
            },
            cache:false
        };
        return sdpAjax(sdpOptions);
    };			

	$maintenanceCalendar.renderTopFilters=function(){

		jQuery("#maintenance_listview_btn").on('click',function(){         // No I18N
               var filterList_obj = new filterListComp();
               filterList_obj.initComponent({
                   element : "#ListViewFilterMenu",  // No I18N
                   module :"request_maintenance",  // No I18N
                   personalize_key : "maintenance_filter_views",// No I18N
                   filter_action : "$maintenanceCalendar.switchFilterView", //No I18N
                   isTrashEnabled: false,
                   favoritable : false,
                   custom_filters : false,
                   skipPersonalization : true,
				   hideFilterSearch :true
               });
		});
		if(sdp_app.IS_SITE_CONFIGURE){
			var ele = jQuery('[data-name="siteFilter"]');
			var options = {
				cache:{},
				closeOnSelect : false,
				multiple:false,
				allowClear: true,
				include_inactive_value : true,
				placeholder: translate("sdp.admin.org.technician.allsite"),
				url:[{
					url:"/api/v3/request_maintenances/site",//NO I18N
					field: "site" // No I18N
				}]
			};
			ele.sdp_select2(options);
			ele.on("change", function(e) { 
				if(e.val!=null&&e.val!=""){
					$maintenanceCalendar.site_filter.id=e.val;
					if(e.val=="-1"){
						$maintenanceCalendar.site_filter.id=null;
					}
				}
				else{
					$maintenanceCalendar.site_filter.id='all';
				}
				$maintenanceCalendar.updateListAfterFilterchange();
			});
		}
	}
	/*$maintenanceCalendar.showTooltip=function(element){
    	var $element=jQuery(element);
    	var themes = SdpDialog.getDefaultThemes();
        themes.push('sdp-dialog-tooltip');
        var cell_dialog = new SdpDialog({
    		referrer: $element,
    		content: $element.data('tooltip'),	//No I18N
    		pointer: false,
    		popoutonhover: false,
    		followcursor: true,
    	    detect_collision : true,
    	    themes:themes
    	});
       $element.off( "mouseleave" );            //No I18N
       $element.mouseleave(function(){
			SdpDialog.clearAllInstances();
		});
    }*/

	$maintenanceCalendar.updateListAfterFilterchange=function(){
		jQuery(".page-progressbar").show(); //No I18N
		$maintenanceCalendar.MaintenanceScheduler.clearAll();
		$maintenanceCalendar.options={
			sd_total_rows:undefined,
			sd_start_index:1,
			sd_total_pages:undefined,
			sd_current_page:1
		};

		var criteria=$maintenanceCalendar.getSearchCriteriaForSite();
		var filter_by=$maintenanceCalendar.getFilterByWithStartAndEndTime();
		$maintenanceCalendar.getFilterBy(filter_by);
		var listInfoObj = 	{ 	list_info:{
									start_index:$maintenanceCalendar.options.sd_start_index,
									row_count:10,
									get_total_count: "true",
									search_criteria:criteria,
									filter_by:filter_by,
									fields_required: ["events","subject","name","is_service_request","status","category","comments","request_events","maintenancestate"],// NO i18N
									sort_field: "name", "sort_order":"asc" } //no i18n
							};
		if(window.isMSPOrSCP) {
            $mspMaintenanceCalendar.modifyPMDataListInfo(listInfoObj);
        }
		
        sdpAjax({
            url: "/api/v3/request_maintenances", //No I18N
            cache:false,
            data:sdpAjaxInputData(listInfoObj),
            success:function(data){
				if(data){
					$maintenanceCalendar.options.sd_total_rows=data.list_info.total_count;
					var quotient =Math.floor($maintenanceCalendar.options.sd_total_rows/10);
					var reminder =$maintenanceCalendar.options.sd_total_rows%10;
					$maintenanceCalendar.options.sd_total_pages=quotient;
					if(reminder!=0){
						$maintenanceCalendar.options.sd_total_pages=$maintenanceCalendar.options.sd_total_pages+1;
						$maintenanceCalendar.options.sd_current_page=1;
					}
					if($maintenanceCalendar.options.sd_total_rows==0){
						$maintenanceCalendar.options.sd_total_pages=0;
						$maintenanceCalendar.options.sd_current_page=0;
					}
					var data_obj = $maintenanceCalendar.changeToCollection(data);
					
					$maintenanceCalendar.current_month=new Date();
					$maintenanceCalendar.filter_change=true;
					$maintenanceCalendar.MaintenanceScheduler.pmdata=data_obj.dataarr;
					$maintenanceCalendar.loadEventsData(data_obj.dataarr,data_obj.schedule_events);
					jQuery(".page-progressbar").fadeOut(); //No I18N
				}
			}
		});
	}


	$maintenanceCalendar.sketchCalendarOutline=function(){
	
		var data ={'templateFilter':$maintenanceCalendar.templateFilter,'IS_SERVICECATALOG_ENABLED':sdp_app.IS_SERVICECATALOG_ENABLED,'global_filter_name':$maintenanceCalendar.global_filter_name,'IS_SITE_CONFIGURE':sdp_app.IS_SITE_CONFIGURE,'ViewRequests':sdp_user.ROLES.indexOf("ViewRequests")>-1?true:false};	//No I18N
		renderhbs('#maintenance-section', 'pm_calendar_outline',data, false, 'maintenance',null,null,$maintenanceCalendar.pmCalendarOutlineCallback); //no i18n
        initTooltip('#maintenance-section');//no i18n
		var wrapper=jQuery('body').find('#scheduler_here_container');

		var $prev=wrapper.find('#prev_scheduler');
		var $next=wrapper.find('#next_scheduler');

		$next.click( function() {
				$maintenanceCalendar.navigatepage_sd('next');//no i18n
		});
		$prev.click(function() {
				$maintenanceCalendar.navigatepage_sd('previous');//no i18n
		});
		jQuery("#scheduler_here").height(window.innerHeight - ( jQuery("#scheduler_here").offset().top + jQuery("#scheduleLegends").outerHeight() + 45 )); 	// calc maintenance calendar view height, 45 - chat + body pad
	}

	$maintenanceCalendar.pmCalendarOutlineCallback = () => {
    	jQuery("#calendar_all_filter").off('click').on('click', (event) => {        //no i18n
    		$maintenanceCalendar.handleRequestTypeFilter('all');                    //no i18n
    	});
    	jQuery("#calendar_incident_filter").off('click').on('click', (event) => {   //no i18n
    		$maintenanceCalendar.handleRequestTypeFilter('incident');               //no i18n
    	});
    	jQuery("#calendar_service_filter").off('click').on('click', (event) => {    //no i18n
    		$maintenanceCalendar.handleRequestTypeFilter('service');                //no i18n
    	});
    	jQuery("#maintenance-section [data-id='tableViewBtn']").off('click').on('click', (event) => {         //no i18n
    		$maintenanceCalendar.switchMaintenanceView('table');                                            //no i18n
    	});
    	jQuery("#maintenance-section [data-id='classicViewBtn']").off('click').on('click', (event) => {       //no i18n
    		$maintenanceCalendar.switchMaintenanceView('classic');                                          //no i18n
    	});
    	jQuery("#maintenance-section [data-id='calendarViewBtn']").off('click').on('click', (event) => {      //no i18n
    		$maintenanceCalendar.loadCalendarView();
    	});
    }

	$maintenanceCalendar.getSearchCriteriaForSite=function(){
		var site_id=$maintenanceCalendar.site_filter.id;
        var crit=[];

        if(site_id !="all"){
            if(site_id == null){
                crit.push({"field": "site","condition": "EQ","value":null,"logical_operator": "and"});
            }else{
                crit.push({"field": "site.id","condition": "EQ","value":site_id,"logical_operator": "and"});   
            }
        }
        var template_id=$maintenanceCalendar.templateFilter;
        if(template_id !="all"){
            if(template_id == "incident"){																									
				crit.push({field:"is_service_request", condition:"is", value:"false","logical_operator": "and"});																	//No i18N
			}else {																												
				crit.push({field:"is_service_request", condition:"is", value:"true","logical_operator": "and"});																	//No i18N
			}
        }
        return crit;
	};
	$maintenanceCalendar.setOptionsToLastPage=function(){
		$maintenanceCalendar.options.sd_current_page=Math.ceil($maintenanceCalendar.options.sd_total_rows/10);
		$maintenanceCalendar.options.sd_start_index=($maintenanceCalendar.options.sd_current_page-1)*10+1;
        
	};
	$maintenanceCalendar.getEventsCall=function(){
		jQuery(".page-progressbar").show(); //No I18N
		$maintenanceCalendar.wrapperCalObj=jQuery('#maintenance-section').find('#scheduler_here_container');
		/*if(sdp.module.maintenance.listView.fromDetailsPage){
			$maintenanceCalendar.getPageData();
			$maintenanceCalendar.setPageData(true);
			sdp.module.maintenance.listView.fromDetailsPage=false;
		}
		sdp.module.maintenance.listView.renderTemplateFilterIcon();*/
		var criteria=$maintenanceCalendar.getSearchCriteriaForSite();
		var filter_by=$maintenanceCalendar.getFilterByWithStartAndEndTime();
		$maintenanceCalendar.getFilterBy(filter_by);
		var listInfoObj = 	{ 	list_info:{
									start_index:$maintenanceCalendar.options.sd_start_index,
									row_count:10,
									get_total_count: "true",
									search_criteria:criteria,
									filter_by:filter_by,
									fields_required: ["events","subject","name","is_service_request","status","category","comments","request_events","maintenancestate"],// NO i18N
									sort_field: "name", "sort_order":"asc" } //no i18n
							};
		if(window.isMSPOrSCP) {
		    $mspMaintenanceCalendar.modifyPMDataListInfo(listInfoObj);
		}
		
        sdpAjax({
            url: "/api/v3/request_maintenances", //No I18N
            cache:false,
            data:sdpAjaxInputData(listInfoObj),
            success:function(data){
				if(data){
					$maintenanceCalendar.options.sd_total_rows=data.list_info.total_count;
					var quotient =Math.floor($maintenanceCalendar.options.sd_total_rows/10);
					var reminder =$maintenanceCalendar.options.sd_total_rows%10;
					var showLastPage=false;
					$maintenanceCalendar.options.sd_total_pages=quotient;
					if(reminder!=0){
						$maintenanceCalendar.options.sd_total_pages=$maintenanceCalendar.options.sd_total_pages+1;
					}
					if(!$maintenanceCalendar.options.sd_current_page){
						$maintenanceCalendar.options.sd_current_page=1;
					}
					else{
						if(data.request_maintenances.length==0 && $maintenanceCalendar.options.sd_current_page>1 && $maintenanceCalendar.options.sd_total_rows!=0 && $maintenanceCalendar.options.sd_start_index>1){
							showLastPage=true;
						}
					}
					if($maintenanceCalendar.options.sd_total_rows==0){
						$maintenanceCalendar.options.sd_total_pages=0;
						$maintenanceCalendar.options.sd_current_page=0;
					}
					if(!showLastPage){
						var data_obj = $maintenanceCalendar.changeToCollection(data);
						$maintenanceCalendar.current_month=new Date();
						$maintenanceCalendar.drawSchedule(data_obj.dataarr,data_obj.schedule_events);
						jQuery(".page-progressbar").fadeOut(); //No I18N
					}
					else{
						$maintenanceCalendar.setOptionsToLastPage();
						$maintenanceCalendar.getEventsCall();
					}
				}
			}
		});
	};

	/*$maintenanceCalendar.showEvents=function(){
		sdp.module.maintenance.customFilter.show(function(filter_by){
				sdp.module.maintenance.customFilter.render(jQuery('.filter-cal'));
			},{search_needed : false ,add_new : false,show_favorites:false,group_data:false,secondaryFilter : sdp.module.maintenance.utils.templateFilter},undefined);
	};*/

	$maintenanceCalendar.drawSchedule=function(pmdata,eventsdata){

		$maintenanceCalendar.MaintenanceScheduler.pmdata = pmdata;
		/*$maintenanceCalendar.MaintenanceScheduler.date.week_start = function(date){ 
            var shift=date.getDay(); // gets the week or months start date's day.
            if(shift != sdp_app.WEEK_START_DAY){
                shift = (shift < sdp_app.WEEK_START_DAY) ? (shift + (7 - sdp_app.WEEK_START_DAY)) : (shift - sdp_app.WEEK_START_DAY); // here shift is no of days need to be shifted to get user's  week_start_day(i.e calendar start_day is Wednesday and user week_start_day is Monday then shift is 2(we will start week or month from previous week_start_day not the next week_start_day)).
                return this.date_part(this.add(date,-1*shift,"day")); // No I18N
            }
            return this.date_part(date);
        };*/
		$maintenanceCalendar.MaintenanceScheduler.config.start_on_monday=false;
		if(sdp_user.DIRECTION == "RTL") {
			$maintenanceCalendar.MaintenanceScheduler.config.rtl = true;
		}
		$maintenanceCalendar.MaintenanceScheduler.config.xml_date="%Y-%m-%d %H:%i"; //no i18n
		$maintenanceCalendar.MaintenanceScheduler.config.fix_tab_position = false;
		$maintenanceCalendar.MaintenanceScheduler.locale.labels.timeline_tab =getMessageForKey("common.single.day"); //no i18n
		$maintenanceCalendar.MaintenanceScheduler.locale.labels.week_timeline_tab =getMessageForKey("sdp.reports.customReport.week"); //no i18n
		$maintenanceCalendar.MaintenanceScheduler.locale.labels.month_timeline_tab =getMessageForKey("sdp.reports.customReport.month"); //no i18n
		$maintenanceCalendar.MaintenanceScheduler.locale.labels.dhx_cal_today_button =getMessageForKey("sdp.common.today"); //no i18n
		$maintenanceCalendar.MaintenanceScheduler.locale.date.month_full= jQuery.extend(true, [] , $maintenanceCalendar.months_fullname);
		$maintenanceCalendar.MaintenanceScheduler.locale.date.day_short= jQuery.extend(true, [] , $maintenanceCalendar.days_shortname);
		$maintenanceCalendar.MaintenanceScheduler.locale.date.month_short= jQuery.extend(true, [] , $maintenanceCalendar.months_shortname);
		$maintenanceCalendar.MaintenanceScheduler.locale.date.day_full= jQuery.extend(true, [] , $maintenanceCalendar.days_fullname);		
		$maintenanceCalendar.MaintenanceScheduler.xy.scale_height = 25;
		$maintenanceCalendar.MaintenanceScheduler.xy.scale_width = 20;
		$maintenanceCalendar.MaintenanceScheduler.xy.nav_height  = 50;
		$maintenanceCalendar.MaintenanceScheduler.config.limit_drag_out = true;
		$maintenanceCalendar.MaintenanceScheduler.xy.menu_width = 0;
		$maintenanceCalendar.MaintenanceScheduler.config.drag_create = false;
		$maintenanceCalendar.MaintenanceScheduler.config.dblclick_create = false;
		$maintenanceCalendar.MaintenanceScheduler.config.drag_resize= false;
		$maintenanceCalendar.MaintenanceScheduler.config.drag_move = false;
		$maintenanceCalendar.MaintenanceScheduler.config.collision_limit = 1;
		$maintenanceCalendar.MaintenanceScheduler.config.check_limits = true;
		$maintenanceCalendar.MaintenanceScheduler.config.repeat_date = "%y-%m-%d";//no i18n
		$maintenanceCalendar.MaintenanceScheduler.config.include_end_by = true;
		$maintenanceCalendar.MaintenanceScheduler.config.repeat_precise = true;
		$maintenanceCalendar.MaintenanceScheduler.config.mark_now=false;
		$maintenanceCalendar.MaintenanceScheduler.xy.scroll_width=0;
		$maintenanceCalendar.MaintenanceScheduler.config.event_duration = 0.5;
		$maintenanceCalendar.MaintenanceScheduler.date.month_timeline_start = $maintenanceCalendar.MaintenanceScheduler.date.month_start;
		$maintenanceCalendar.MaintenanceScheduler.date.week_timeline_start = $maintenanceCalendar.MaintenanceScheduler.date.timeline_start = $maintenanceCalendar.MaintenanceScheduler.date.week_start;
		$maintenanceCalendar.MaintenanceScheduler.serverList("sections");//no i18n

		$maintenanceCalendar.initializeTimelineViews();
		$maintenanceCalendar.attachEvents();
		$maintenanceCalendar.overrideTemplates();

		$maintenanceCalendar.MaintenanceScheduler.init('scheduler_here', new Date(),$maintenanceCalendar.mode);//no i18n
		$maintenanceCalendar.SchedulerMonth=new Date();
		$maintenanceCalendar.loadEventsData(pmdata,eventsdata);
	}

	$maintenanceCalendar.event_css=function(view){
		$maintenanceCalendar.MaintenanceScheduler.templates.event_class = function (start, end, event) {
			var day = new Date();
			if(event.is_request === true){
				return "beforescheduler "+view+"";//no i18n
			}else if(event.start_date>day){
				return "nextscheduler "+view+"";//no i18n
			}else{
				return "beforescheduler_hidden vhide "+view+"";//no i18n
			}
		};
	};

	$maintenanceCalendar.overrideTemplates=function(){
		$maintenanceCalendar.MaintenanceScheduler.templates.timeline_scalex_class = function(date){
		    return "scheduler_scale_label";//no i18n
		};
		$maintenanceCalendar.MaintenanceScheduler.templates.week_timeline_scalex_class = function(date){
		    return "scheduler_scale_label";//no i18n
		};
		$maintenanceCalendar.MaintenanceScheduler.templates.month_timeline_scalex_class = function(date){
		    return "scheduler_scale_label";//no i18n
		};

		$maintenanceCalendar.MaintenanceScheduler.templates.month_timeline_date =function(a,b){
			return $maintenanceCalendar.months_fullname[a.getMonth()]+" "+a.getFullYear();

		};

		$maintenanceCalendar.MaintenanceScheduler.templates.timeline_scale_date = function(date){
		   return date.getHours()+":00";
		};

		$maintenanceCalendar.MaintenanceScheduler.templates.month_timeline_second_scale_date = function(date){
		   return $maintenanceCalendar.days_short_label[date.getDay()];
		};

		$maintenanceCalendar.MaintenanceScheduler.date.add_month_timeline = function(date, step){
		    if(step > 0){
		        step = 1;
		    }else if(step < 0){
		        step = -1;
		    }
		    return $maintenanceCalendar.MaintenanceScheduler.date.add(date, step, "month"); //no i18n
		};

		$maintenanceCalendar.MaintenanceScheduler.templates.timeline_scale_label =
		    $maintenanceCalendar.MaintenanceScheduler.templates.week_timeline_scale_label =
		        $maintenanceCalendar.MaintenanceScheduler.templates.month_timeline_scale_label = function(key,label, section){

		        	var data={};
		        	data.swoid=key;
					data.frequency=section.frequency;
					data.next_schedule_time=section.next_schedule_time;
		        	data.subject=label;
                    data.category=section.category;
					data.status=section.status;
                    data.comments=section.comments;
                    data.is_service_request=section.is_service_request;
					data.name=section.name;
					data.generate_request = sdp_user.ROLES.indexOf("CreateRequests")>-1&&(sdp_user.ROLES.indexOf("CreateRequestMaintenances")>-1 || sdp_user.ROLES.indexOf("ModifyRequestMaintenances")>-1)?true:false;
					if(window.isMSPOrSCP) {
					    $mspMaintenanceCalendar.modifyContextDataForCalendarRow(data, section);
					}
		        	var row_title_template=renderhbs(null,'pmCalendar_row_data',data,false,"maintenance",null,null,null,true); //no i18n
		        	
					return row_title_template;
		};
	};

	$maintenanceCalendar.initializeTimelineViews=function(){
		/* DayView config*/
		$maintenanceCalendar.MaintenanceScheduler.createTimelineView({
		    name:"timeline",//no i18n
		    x_unit:"minute",//no i18n
		    x_date:"%H", //no i18n
		    x_step:60,      
		    x_size:24,    
		    x_start:0,    
		    x_length:24,  
		    render:"bar",	//no i18n 
			dx: 320,
		  	dy: 28,
		 	fit_events: false,
		  	event_dy: 26,
		  	full_event__dy: true,
		  	section_autoheight: false, 
			y_unit: $maintenanceCalendar.MaintenanceScheduler.serverList("maintenances"),//no i18n
			y_property: "maintenance",//no i18n
		    render:"bar" ,         //no i18n 
			second_scale:{
		        x_unit: "day", //no i18n
		        x_date: "%l" //no i18n
		    },
			round_position:true
		});

		/* WeekView config*/
		$maintenanceCalendar.MaintenanceScheduler.createTimelineView({
		  fit_events: true,
		  name: "week_timeline",//no i18n
		  render: "bar",//no i18n
		  x_unit: "day",//no i18n
		  x_date: "%j",//no i18n
		  x_step: 1,
		  x_size: 7,
		  x_length: 7,
		  dx: 320,
		  dy: 28,
		  fit_events: false,
		  event_dy: 26,
		  full_event__dy: true,
		  section_autoheight: false, 
			 	 y_unit: $maintenanceCalendar.MaintenanceScheduler.serverList("maintenances"),//no i18n
				 y_property: "maintenance",//no i18n
			 second_scale:{
		        x_unit: "day",//no i18n
		        x_date: "%D" //no i18n
		    },
			round_position:true
		});

		/* MonthView config*/
		$maintenanceCalendar.MaintenanceScheduler.createTimelineView({
		  fit_events: true,
		  name: "month_timeline",//no i18n
		  render: "bar",//no i18n
		  x_unit: "day",//no i18n
		  x_date: "%j",//no i18n
		  x_step: 1,
		  x_size: 8,
		  x_length: 7,
		  dx: 320,
		  dy: 28,
		  fit_events: false,
		 event_dx:"full",//no i18n
		  event_dy:"full",//no i18n
		 full_event__dy: true,
		  section_autoheight: false, 
			 	 y_unit: $maintenanceCalendar.MaintenanceScheduler.serverList("maintenances"),//no i18n
				 y_property: "maintenance",//no i18n
			  second_scale:{
		        x_unit: "day",//no i18n
		        x_date: "%D" //no i18n
		    },
		round_position:true
			 
		});

		$maintenanceCalendar.MaintenanceScheduler.templates.month_timeline =  $maintenanceCalendar.MaintenanceScheduler.date.date_to_str("%F %Y");//no i18n
		$maintenanceCalendar.MaintenanceScheduler.date.week_timeline_start = $maintenanceCalendar.MaintenanceScheduler.date.week_start;
		$maintenanceCalendar.MaintenanceScheduler.date.month_timeline_start = $maintenanceCalendar.MaintenanceScheduler.date.month_start;
		
	};

	$maintenanceCalendar.getEventsForDayView=function(start,end){
		jQuery(".page-progressbar").show(); //No I18N
		var criteria=$maintenanceCalendar.getSearchCriteriaForSite();
		var offset1 = getTimezoneDifference(start);
		var offset2 = getTimezoneDifference(end);
		start=start-offset1;
		end=end-offset2;
		var filter_by=$maintenanceCalendar.getFilterByWithStartAndEndTime();
		$maintenanceCalendar.getFilterBy(filter_by);
		var listInfoObj = 	{ 	list_info:{
									start_index:$maintenanceCalendar.options.sd_start_index,
									row_count:10,
									get_total_count: "true",									
									search_criteria:criteria,
									filter_by:filter_by,
									fields_required: ["events","subject","name","is_service_request","status","category","comments","request_events","maintenancestate"],// NO i18N
									sort_field: "name", "sort_order":"asc" } //no i18n
							};
		if(window.isMSPOrSCP) {
		    $mspMaintenanceCalendar.modifyPMDataListInfo(listInfoObj);
		}
		
        sdpAjax({
            url: "/api/v3/request_maintenances", //No I18N
            cache:false,
            data:sdpAjaxInputData(listInfoObj),
            success:function(data){
				if(data){
					var events_array=[];
					jQuery.each(data.request_maintenances,function(key,val){
						events_array=events_array.concat(val.request_events).concat(val.events);
					});

					var temp_json={};
					temp_json.data=events_array;		
					$maintenanceCalendar.MaintenanceScheduler.parse(temp_json,"json");//no i18n
				}
				jQuery(".page-progressbar").fadeOut(); //No I18N
			}
		});
	};

	$maintenanceCalendar.bindEvents = () => {
        jQuery("#scheduler_here [data-action-name='generateRequestLink']").off('click').on('click', (event) => {              //No I18N
    		$maintenanceCalendar.generateRequestConfirm(event.currentTarget.dataset.maintenanceId);
        });
    	jQuery("#scheduler_here [data-action-name='maintenanceDetailsLink']").off('click').on('click', (event) => {           //No I18N
    		$maintenanceCalendar.showMaintenanceDetailsPopup('',event.currentTarget.dataset.maintenanceId);
        });
		jQuery("#calscroll").off("mouseenter").on("mouseenter", e => {	//No I18N
			initTooltip('#dhxTooltipFix');								//No I18N
		})
    };

	$maintenanceCalendar.attachEvents=function(){
		
		$maintenanceCalendar.MaintenanceScheduler.attachEvent("onSchedulerReady", function(){
			var element = jQuery('body').find("#scheduler_here");
			$maintenanceCalendar.wrapperCalObj.find('.collection_label').remove();
		/*	var header = document.createElement("div");
			header.className = "collection_label";
			header.style.position = "absolute";
			header.style.top = "52px";
			header.style.width = "320px";
			header.style.height = "40px";*/
			
			var descriptionHTML = "<div class='collection_label pos-abs h-auto w-320px z-ind15 top50'><h4 class='tc text-muted mt15 pt2'>"+getMessageForKey("common.maintenance")+"</h4>";
            //header.innerHTML = descriptionHTML;
            element.append(descriptionHTML);
		});

		$maintenanceCalendar.MaintenanceScheduler.attachEvent("onXLE", function(){
        	$maintenanceCalendar.bindEvents();
        });

        $maintenanceCalendar.MaintenanceScheduler.attachEvent("onAfterSchedulerResize", function(){
        	$maintenanceCalendar.bindEvents();
        });


		$maintenanceCalendar.MaintenanceScheduler.attachEvent("onBeforeViewChange", function(old_mode,old_date,mode,date) {
			if(mode == "month_timeline") {
			    var year = date.getFullYear();
			    var month = (date.getMonth() + 1);
			    var d = new Date(year, month, 0);
			    var days = d.getDate();//numbers of day in month
			    $maintenanceCalendar.MaintenanceScheduler.matrix.month_timeline.x_size = days;
			    $maintenanceCalendar.MaintenanceScheduler.matrix.month_timeline.x_length = days;
				$maintenanceCalendar.event_css('month_view_event');//no i18n
			}
			if(mode == "week_timeline"){
				$maintenanceCalendar.event_css("week_view_event");//no i18n
			}
			if(mode=="timeline"){
				$maintenanceCalendar.event_css("day_view_event");//no i18n
			}
			return true;
		});


	    $maintenanceCalendar.MaintenanceScheduler.attachEvent('onViewChange',function(mode,date_now){
	    	if($maintenanceCalendar.filter_change==true){
	    		$maintenanceCalendar.filter_change=false
	    		if(!$maintenanceCalendar.MaintenanceScheduler.pmdata.length){
		    		var divnodata = jQuery('<div class="no-data pos-abs fw tc font-base top130 z-ind10">'+window.getMessageForKey("common.noitems",[window.getMessageForKey("common.maintenance")])+'</div>');
		    	    if(!$maintenanceCalendar.wrapperCalObj.find('#scheduler_here').find('.no-data').length){
		    	    $maintenanceCalendar.wrapperCalObj.find('#scheduler_here').append(divnodata);	}	//no i18n
		    	}
	    		else{$maintenanceCalendar.wrapperCalObj.find('#scheduler_here').find('.no-data').remove();}
	    		if($maintenanceCalendar.mode=="timeline"){
					var calendar_day=$maintenanceCalendar.MaintenanceScheduler.getState().date
					calendar_day.setHours(0,0,0,0);
			    	var start=calendar_day.getTime();
			    	calendar_day.setHours(23,59,59,999);
			    	var end=calendar_day.getTime();
			    	$maintenanceCalendar.MaintenanceScheduler.clearAll();
					$maintenanceCalendar.getEventsForDayView(start,end);
				}
	    	}else{
		    	if(!$maintenanceCalendar.MaintenanceScheduler.pmdata.length){
		    		var divnodata = jQuery('<div class="no-data pos-abs fw tc font-base top130 z-ind10">'+window.getMessageForKey("common.noitems",[window.getMessageForKey("common.maintenance")])+'</div>');
		    		if(!$maintenanceCalendar.wrapperCalObj.find('#scheduler_here').find(".no-data").length){
		    		$maintenanceCalendar.wrapperCalObj.find('#scheduler_here').append(divnodata);}
		    	}

		    	if(mode=="timeline"){
			    		$maintenanceCalendar.MaintenanceScheduler.clearAll();
			    		date_now.setHours(0,0,0,0);
			    		var start=date_now.getTime();
			    		date_now.setHours(23,59,59,999);
			    		var end=date_now.getTime();
			    		$maintenanceCalendar.getEventsForDayView(start,end);
			    		$maintenanceCalendar.mode=mode;
		    	}else{
		    		if($maintenanceCalendar.current_month.getMonth()==date_now.getMonth() && $maintenanceCalendar.current_month.getFullYear() == date_now.getFullYear() && $maintenanceCalendar.current_month.getDate()== date_now.getDate()){
		    			if($maintenanceCalendar.mode=="timeline"){
		    				var dummy;
		    			}else{
		    				$maintenanceCalendar.mode=mode;
		    			}
		    		}
		    		$maintenanceCalendar.current_month=date_now;
		    		if($maintenanceCalendar.mode=="timeline"){
		    			$maintenanceCalendar.MaintenanceScheduler.clearAll();
		    			$maintenanceCalendar.getApiOnModeChange($maintenanceCalendar.options.sd_start_index);
		    		}else {
		    			$maintenanceCalendar.getApiOnMonthChange($maintenanceCalendar.options.sd_start_index);
		    		}
		    		$maintenanceCalendar.mode=mode;
		    	}
		    }
	    });

		$maintenanceCalendar.MaintenanceScheduler.attachEvent("onClick", function (id, e){
			if($maintenanceCalendar.onclick_timer == null){
				$maintenanceCalendar.onclick_timer=window.setTimeout(function(){$maintenanceCalendar.eventOnClick(id,e)},500);
			}
		});

		$maintenanceCalendar.MaintenanceScheduler.attachEvent("onEventLoading", function(ev){ 
		    return $maintenanceCalendar.MaintenanceScheduler.checkCollision(ev);    
		});

		$maintenanceCalendar.MaintenanceScheduler.attachEvent("onDblClick", function (id, e){
				window.clearTimeout($maintenanceCalendar.onclick_timer);
				$maintenanceCalendar.onclick_timer=null;
		    	return false;
		});

		$maintenanceCalendar.MaintenanceScheduler.attachEvent("onBeforeTooltip", function (id){
		    	return false;
		});
	};

	$maintenanceCalendar.isApiCallNeeded=function(){
		if((new Date().getMonth()==$maintenanceCalendar.current_month.getMonth()) && (new Date().getFullYear()==$maintenanceCalendar.current_month.getFullYear())){
			return true;
		}else if($maintenanceCalendar.current_month.getTime()< new Date().getTime()){
			return true;
		}else{
			return false;
		}
	}

	$maintenanceCalendar.eventOnClick=function(id,e){
		$maintenanceCalendar.onclick_timer=null;
		var event_id=id.split("#");
		var event=$maintenanceCalendar.MaintenanceScheduler.getEvent(event_id[0]);
		var sworkorderid=event.maintenance;
		var $target_element=e.target;
		var day_label=$target_element.getAttribute("class").split(" ");
		day_label=day_label[1];
		if($maintenanceCalendar.mode=="timeline"){
			var current_date=event.start_date;
			current_date.setMinutes(0);
			var start_of_hour=current_date.getTime();
			current_date.setMinutes(59);
			current_date.setSeconds(59);
			var end_of_hour=current_date.getTime();
			if(day_label=="beforescheduler"){
				$maintenanceCalendar.showAssociatedReqPopup(start_of_hour,end_of_hour,sworkorderid,event.start_date);
			}else if(day_label=="nextscheduler"){//no i18n
				var clickedEventDate = $maintenanceCalendar.MaintenanceScheduler.getActionData(e).date.getTime();
				$maintenanceCalendar.showMaintenanceDetailsPopup(clickedEventDate,sworkorderid);
			}
		}else{			
			var current_date=event.start_date;
			current_date.setHours(0,0,0,0);
			var start_of_day=current_date.getTime();
			current_date.setHours(23,59,59,999);
			var end_of_day = current_date.getTime();


			if(day_label=="beforescheduler"){
				$maintenanceCalendar.showAssociatedReqPopup(start_of_day,end_of_day,sworkorderid,event.start_date);
			}else if(day_label=="nextscheduler"){//no i18n
				var clickedEventDate = $maintenanceCalendar.MaintenanceScheduler.getActionData(e).date.getTime();
				$maintenanceCalendar.showMaintenanceDetailsPopup(clickedEventDate,sworkorderid);
			}
		}

	}

	$maintenanceCalendar.showAssociatedReqPopup=function(start_of_day,end_of_day,pmid,actual_start_date){
		var offset1 = getTimezoneDifference(start_of_day);
		var offset2 = getTimezoneDifference(end_of_day);
		start_of_day=start_of_day-offset1;
		end_of_day=end_of_day-offset2;
		var htmlDiv = '<div id="generated-requests-popup" ></div>';		
		jQuery('#generated-requests-popup-dialog').dialog({
			//title: getMessageForKey('requests.created.on',[getClientTimeZoneDateObject(start_of_day)]),
			autoOpen : false, 
			modal : true,
			width : "80%", // No I18N
			height :'500',
			//minHeight: '500',
			resize : false,
			open: function(event, ui){
				var data = {"hideGeneratedRequests":true};	// variable introduced for modifying handlebar data for MSP/SCP	//No I18N
				if(window.isMSPOrSCP) {
					data.additonal_data = {};
					$mspMaintenanceDetails.appendRequestListAdditionalData(data.additonal_data);
				}
				renderhbs('#generated-requests-popup', 'maintenance_requests_template',data, false, 'maintenance'); //no i18n
				jQuery('[aria-describedby="generated-requests-popup-dialog"]').find("span.ui-dialog-title").append('<span >'+getMessageForKey('requests.created.on',['<span class="text-muted">'+ZComponents.Date.formatDate(actual_start_date,$maintenanceObject.date_format_to_use)+'</span>'])+'</span>');
				$maintenance.initRequests({"id":pmid,"hideDateFilter":true,"start_time":start_of_day,"end_time":end_of_day}); //No I18N
			},
			beforeClose: function(event,ui){
				if($ReqPreview.options.is_open) {/**Before close dialog check Request preview popup opened or not**/
					return false;
				}
			},
			close: function(event,ui){
				jQuery('body').addClass('of-h'); // No I18N
				jQuery('#generated-requests-popup').remove();
				jQuery('#generated-requests-popup-dialog').dialog("destroy"); // No I18N
			}
		}).html(htmlDiv).dialog("open"); // No I18N		
		
	};

	$maintenanceCalendar.showMaintenanceDetailsPopup=function(start_of_day,pmid){
		var title='';
		if(start_of_day){
			title=getMessageForKey('maintenance.scheduled.on',[ZComponents.Date.formatDate(new Date(start_of_day),$maintenanceObject.date_format_to_use)]);
		}
		else{
			title=getMessageForKey('sdp.app.asset.details',[getMessageForKey('common.maintenance')]);
		}
		$previewComponent.load('/ui/maintenances?mode=details&externalframe=true&id='+pmid,title, "70%", parseInt(jQuery(window).height()) - 65, null, "maintenance-details-dialog", false,98,'closecallback:$maintenanceCalendar.afterClosePreview');  // No I18N
	};

	$maintenanceCalendar.changeToCollection=function(data){
		var dataarr = [];
		var events_array=[];
		jQuery.each(data.request_maintenances,function(key,val){
		if(val.comments=="null")
		{
		val.comments=null;
		}
		var dataobject = {
				"value":val.id,//no i18n
				"label":val.subject,//no i18n
				"category":val.category,//no i18n
				"status":val.status,//no i18n
				"is_service_request":val.is_service_request,//no i18n
				"comments":val.comments,//no i18n
				"name":val.name,//no i18n
				"frequency": val.scheduler&&val.scheduler.frequency?val.scheduler.frequency:"",//no i18n
				"next_schedule_time": val.scheduler&&val.scheduler.next_schedule_time?val.scheduler.next_schedule_time:""//no i18n
			}	
		if(window.isMSPOrSCP) {
		    $mspMaintenanceCalendar.modifyDataForCalendarRow(dataobject, val);
		}
		dataarr.push(dataobject);
		events_array=events_array.concat(val.events).concat(val.request_events);
		});
		var data_obj={};
		data_obj.dataarr=dataarr;
		data_obj.schedule_events=events_array;
		return data_obj;
	};

	$maintenanceCalendar.navigatepage_sd=function(trigger){

		var $prev=$maintenanceCalendar.wrapperCalObj.find('#prev_scheduler');
		var $next=$maintenanceCalendar.wrapperCalObj.find('#next_scheduler');
		$maintenanceCalendar.MaintenanceScheduler.clearAll();

			$prev.addClass('disableDiv');//no i18n
			$next.addClass('disableDiv');//no i18n

		if(trigger=="next"){
			$maintenanceCalendar.options.sd_start_index=$maintenanceCalendar.options.sd_start_index+10;
			$maintenanceCalendar.options.sd_current_page=$maintenanceCalendar.options.sd_current_page+1;
		}else{
			$maintenanceCalendar.options.sd_start_index=$maintenanceCalendar.options.sd_start_index-10;
			$maintenanceCalendar.options.sd_current_page=$maintenanceCalendar.options.sd_current_page-1;
		}
		$maintenanceCalendar.getApiOnNavigation($maintenanceCalendar.options.sd_start_index);
	}

	$maintenanceCalendar.getApiOnMonthChange=function(sd_start_index){
		jQuery(".page-progressbar").show(); //No I18N

			var criteria=$maintenanceCalendar.getSearchCriteriaForSite();
			var filter_by=$maintenanceCalendar.getFilterByWithStartAndEndTime();
			$maintenanceCalendar.getFilterBy(filter_by);
			var listInfoObj = 	{ 	list_info:{
										start_index:$maintenanceCalendar.options.sd_start_index,
										row_count:10,
										get_total_count: "true",
										search_criteria:criteria,
										filter_by:filter_by,
										fields_required: ["events","subject","name","is_service_request","status","category","comments","request_events","maintenancestate"],// NO i18N
										sort_field: "name", "sort_order":"asc" } //no i18n
								};
			if(window.isMSPOrSCP) {
			    $mspMaintenanceCalendar.modifyPMDataListInfo(listInfoObj);
			}
        sdpAjax({
            url: "/api/v3/request_maintenances", //No I18N
            cache:false,
            data:sdpAjaxInputData(listInfoObj),
            success:function(data){
				if(data){
						$maintenanceCalendar.updateRowData(data);
						var events_array=[];
						jQuery.each(data.request_maintenances,function(key,val){
							events_array=events_array.concat(val.request_events).concat(val.events);
						});
						var temp_json={};
						temp_json.data=events_array;		
						$maintenanceCalendar.MaintenanceScheduler.parse(temp_json,"json");//no i18n
						jQuery(".page-progressbar").fadeOut(); //No I18N
					}
				}
			});	
	}

	$maintenanceCalendar.getApiOnModeChange=function(sd_start_index){
		jQuery(".page-progressbar").show(); //No I18N
		var scheduler_date=$maintenanceCalendar.MaintenanceScheduler.getState().date;
			var criteria=$maintenanceCalendar.getSearchCriteriaForSite();
			var filter_by=$maintenanceCalendar.getFilterByWithStartAndEndTime();
			$maintenanceCalendar.getFilterBy(filter_by);
			var listInfoObj = 	{ 	list_info:{
										start_index:$maintenanceCalendar.options.sd_start_index,
										row_count:10,
										get_total_count: "true",
										search_criteria:criteria,
										filter_by:filter_by,
										fields_required: ["events","subject","name","is_service_request","status","category","comments","request_events","maintenancestate"],// NO i18N
										sort_field: "name", "sort_order":"asc" } //no i18n
								};
			if(window.isMSPOrSCP) {
			    $mspMaintenanceCalendar.modifyPMDataListInfo(listInfoObj);
			}
        sdpAjax({
            url: "/api/v3/request_maintenances", //No I18N
            cache:false,
            data:sdpAjaxInputData(listInfoObj),
            success:function(data){
				if(data){
						var events_array=[];
						jQuery.each(data.request_maintenances,function(key,val){
							events_array=events_array.concat(val.request_events).concat(val.events);
						});
						var temp_json={};
						temp_json.data=events_array;		
						$maintenanceCalendar.MaintenanceScheduler.parse(temp_json,"json");//no i18n
						jQuery(".page-progressbar").fadeOut(); //No I18N
					}
				}
			});	
	}

	$maintenanceCalendar.updateCalendarAfterReqCreation=function(sd_start_index){
		jQuery(".page-progressbar").show(); //No I18N
		if($maintenanceCalendar.mode=="timeline"){
			var calendar_day=$maintenanceCalendar.MaintenanceScheduler.getState().date
			calendar_day.setHours(0,0,0,0);
	    	var start=calendar_day.getTime();
	    	calendar_day.setHours(23,59,59,999);
	    	var end=calendar_day.getTime();
	    	$maintenanceCalendar.MaintenanceScheduler.clearAll();
			$maintenanceCalendar.getEventsForDayView(start,end);
		}
		var scheduler_date=$maintenanceCalendar.MaintenanceScheduler.getState().date;
		var criteria=$maintenanceCalendar.getSearchCriteriaForSite();
		var filter_by=$maintenanceCalendar.getFilterByWithStartAndEndTime();
		$maintenanceCalendar.getFilterBy(filter_by);
		var listInfoObj = 	{ 	list_info:{
									start_index:$maintenanceCalendar.options.sd_start_index,
									row_count:10,
									get_total_count: "true",
									search_criteria:criteria,
									filter_by:filter_by,
									fields_required: ["events","subject","name","is_service_request","status","category","comments","request_events","maintenancestate"],// NO i18N
									sort_field: "name", "sort_order":"asc" } //no i18n
							};
		if(window.isMSPOrSCP) {
		    $mspMaintenanceCalendar.modifyPMDataListInfo(listInfoObj);
		}
        sdpAjax({
            url: "/api/v3/request_maintenances", //No I18N
            cache:false,
            data:sdpAjaxInputData(listInfoObj),
            success:function(data){
				if(data){
					$maintenanceCalendar.MaintenanceScheduler.clearAll();
					var events_array=[];
					jQuery.each(data.request_maintenances,function(key,val){
						events_array=events_array.concat(val.request_events).concat(val.events);
					});
					var temp_json={};
					temp_json.data=events_array;		
					$maintenanceCalendar.MaintenanceScheduler.parse(temp_json,"json");//no i18n
					jQuery(".page-progressbar").fadeOut(); //No I18N
				}
			}
		});	
	}

	$maintenanceCalendar.updateRowData=function(pmdata){
		var events_array=[];
		jQuery.each(pmdata.request_maintenances,function(key,val){
			events_array=events_array.concat(val.request_events);
		});

		var temp_json={};
		temp_json.data=events_array;		
		$maintenanceCalendar.MaintenanceScheduler.parse(temp_json,"json");//no i18n
	}

	$maintenanceCalendar.getApiOnNavigation=function(sd_start_index){
		jQuery(".page-progressbar").show(); //No I18N
		var criteria=$maintenanceCalendar.getSearchCriteriaForSite();
		var filter_by=$maintenanceCalendar.getFilterByWithStartAndEndTime();
		$maintenanceCalendar.getFilterBy(filter_by);
		var listInfoObj = 	{ 	list_info:{
									start_index:$maintenanceCalendar.options.sd_start_index,
									row_count:10,
									get_total_count: "true",
									search_criteria:criteria,
									filter_by:filter_by,
									fields_required: ["events","subject","name","is_service_request","status","category","comments","request_events","maintenancestate"],// NO i18N
									sort_field: "name", "sort_order":"asc" } //no i18n
							};
		if(window.isMSPOrSCP) {
		    $mspMaintenanceCalendar.modifyPMDataListInfo(listInfoObj);
		}
        sdpAjax({
            url: "/api/v3/request_maintenances", //No I18N
            cache:false,
            data:sdpAjaxInputData(listInfoObj),
            success:function(data){
				if(data){
					$maintenanceCalendar.MaintenanceScheduler.clearAll();
					var data_obj = $maintenanceCalendar.changeToCollection(data);
					$maintenanceCalendar.MaintenanceScheduler.pmdata=data_obj.dataarr;
					$maintenanceCalendar.updateListData(data_obj.dataarr,data_obj.schedule_events);
					$maintenanceCalendar.render_table_summary($maintenanceCalendar.options.sd_start_index);
					jQuery(".page-progressbar").fadeOut(); //No I18N
				}
			}
		});	
	}

	$maintenanceCalendar.updateListData=function(pmdata,schedule_events){
		var temp_json={};
		$maintenanceCalendar.MaintenanceScheduler.pmdata = pmdata;
		temp_json.data=schedule_events;
		var collections={};
		collections.maintenances=pmdata;
		temp_json.collections=collections;		
		$maintenanceCalendar.MaintenanceScheduler.parse(temp_json,"json");//no i18n
	}

	$maintenanceCalendar.loadEventsData=function(pmdata,schedule_events){
			var temp_json={};
			temp_json.data=schedule_events;
			var collections={};
			collections.maintenances=pmdata;
			temp_json.collections=collections;	
			$maintenanceCalendar.MaintenanceScheduler.parse(temp_json,"json");//no i18n
			$maintenanceCalendar.wrapperCalObj.find('#schedule_loader').hide;//no i18n
			$maintenanceCalendar.wrapperCalObj.find('#scheduler_here').css("visibility", "visible");//no i18n
			$maintenanceCalendar.render_table_summary($maintenanceCalendar.options.sd_start_index);
	}

	$maintenanceCalendar.render_table_summary=function(start_index){
		var from=start_index;
		if($maintenanceCalendar.MaintenanceScheduler.pmdata.length==0){
			from=0;
			var to=0;
		}else if($maintenanceCalendar.options.sd_current_page==$maintenanceCalendar.options.sd_total_pages){
			var to=$maintenanceCalendar.options.sd_total_rows;
		}else{
			var to=start_index+9;
		}

		//var summary_string=from.toString()+" - "+to.toString()+' of '+$maintenanceCalendar.options.sd_total_rows.toString();//no i18n
		var summary_string='<span name="start">'+from.toString()+'</span> - <span name="end">'+to.toString()+'</span> of <span id="showCount" name="showCount">'+$maintenanceCalendar.options.sd_total_rows.toString()+'</span>';
		var $summary=$maintenanceCalendar.wrapperCalObj.find('#sdpTableSummary');
		$summary.html(summary_string);

		var $prev=$maintenanceCalendar.wrapperCalObj.find('#prev_scheduler');
		var $next=$maintenanceCalendar.wrapperCalObj.find('#next_scheduler');

		if($maintenanceCalendar.MaintenanceScheduler.pmdata.length==0){
			$next.removeClass();
			// $next.addClass('pagenav-next-off disableDiv');
			$next.addClass('disableDiv');
			$prev.removeClass();
			// $prev.addClass('pagenav-previous-off disableDiv');
			$prev.addClass('disableDiv');
		}else if($maintenanceCalendar.options.sd_current_page==1 && $maintenanceCalendar.options.sd_total_rows <=10) {
			$next.removeClass();
			// $next.addClass('pagenav-next-off disableDiv');
			$next.addClass('disableDiv');
			$prev.removeClass();
			// $prev.addClass('pagenav-previous-off disableDiv');
			$prev.addClass('disableDiv');
			
		}else if($maintenanceCalendar.options.sd_current_page==1){
			$prev.removeClass();
			// $prev.addClass('pagenav-previous-off disableDiv');
			$prev.addClass('disableDiv');
			$next.removeClass();
			$next.addClass('pagenav-next');
			
		} else if($maintenanceCalendar.options.sd_current_page==$maintenanceCalendar.options.sd_total_pages) {
			$next.removeClass();
			// $next.addClass('pagenav-next-off disableDiv');
			$next.addClass('disableDiv');
			$prev.removeClass();
			$prev.addClass('pagenav-previous');
			
		} else{
			$prev.removeClass();
			$prev.addClass('pagenav-previous');
			$next.removeClass();
			$next.addClass('pagenav-next');	
		}
		$prev.addClass('btn btn-default');
		$next.addClass('btn btn-default btn-rad-rgt');
	}	
	
	$maintenanceCalendar.getFilterBy=function(obj){
		if($maintenanceCalendar.global_filter){
			obj.id=$maintenanceCalendar.global_filter;
		}
		else{
			obj.name="all_maintenances";
		}
	}
	$maintenanceCalendar.setFilters=function(){
		var filterPersonlize = {};
		var filterViewKey = "request_maintenances_filterview"; // No I18N
        if(sdp_user.CLIENT_CONF[filterViewKey]){
            filterPersonlize = Object.assign({}, sdp_user.CLIENT_CONF[filterViewKey]);
        }		
		if(filterPersonlize.quick_filter&&sdp_app.IS_SERVICECATALOG_ENABLED){
			$maintenanceCalendar.templateFilter=filterPersonlize.quick_filter;	
		}	
		if(filterPersonlize.list_view_filter&&filterPersonlize.list_view_filter.id){
			$maintenanceCalendar.global_filter=filterPersonlize.list_view_filter.id;	
		}		
	}
	$maintenanceCalendar.switchFilterView=function(viewId,viewName){
		var filterPersonlize = {};
		var viewKey = "request_maintenances_filterview"; // No I18N
		filterPersonlize.templateFilter=$maintenanceCalendar.templateFilter;
		filterPersonlize.list_view_filter={"id":viewId,"name":viewName}; // No I18N
		$maintenanceCalendar.global_filter=viewId;
		$maintenanceCalendar.global_filter_name=viewName;
		addPersonalization(viewKey,filterPersonlize);
		jQuery('#maintenances-filters').text(viewName); // No I18N
		jQuery('#maintenance_listview_btn').attr("title",viewName);// No I18N		
		$maintenanceCalendar.updateListAfterFilterchange();
	}
	$maintenanceCalendar.handleRequestTypeFilter = function (request_type) {
		var filterHtml = {
        	'all':'<span class="req-sprite all-req-icon2-off icon-lg ml10"></span>',
        	'incident':'<span class="req-sprite incident-req-icon2-off icon-lg ml5 mt-5" style="width: 32px;height: 32px"></span>',
        	'service':'<span class="req-sprite service-req-icon2-off icon-lg ml5 mt-5" style="width: 32px;height: 32px"></span>'
        };
        jQuery('[data-id="showFilterIcon"]').html(filterHtml[request_type]);
        var attributes=["all_templateFilter","incident_templateFilter","service_templateFilter"]; // No I18N
		attributes.splice(attributes.indexOf(request_type+"_templateFilter"),1);
		jQuery('[data-name="'+attributes[0]+'"]').addClass("hide").prev("em").removeClass("hide"); // No I18N
		jQuery('[data-name="'+attributes[1]+'"]').addClass("hide").prev("em").removeClass("hide"); // No I18N
		jQuery('[data-name="'+request_type+'_templateFilter"]').removeClass("hide").prev("em").addClass("hide"); // No I18N
		var filterPersonlize = {};
		var viewKey = "request_maintenances_filterview"; // No I18N
		filterPersonlize.quick_filter=request_type;
		filterPersonlize.list_view_filter={"id":$maintenanceCalendar.global_filter,"name":$maintenanceCalendar.global_filter_name}; // No I18N
		$maintenanceCalendar.templateFilter=request_type;
		addPersonalization(viewKey,filterPersonlize);	
		$maintenanceCalendar.updateListAfterFilterchange();
	}
	$maintenanceCalendar.generateRequestConfirm=function(id){
		this.maintenanceid_to_generate_request=id;
		$maintenance.generateRequestConfirm($maintenanceCalendar.generateRequest);
	}	
	$maintenanceCalendar.generateRequest = function(canGenerate) {
		if(canGenerate){
			sdpAjax({
				url: '/api/v3/request_maintenances/'+$maintenanceCalendar.maintenanceid_to_generate_request+'/_generate_request', // No I18N
				type: 'POST', // No I18N
				success: function (response) {
					var message='';
					if(response&&response.response_status&&response.response_status.messages&&response.response_status.messages[0]){
						message=response.response_status.messages[0].message;
					}
					window.showalert('success',message,'isAutoHide=true'); // No I18N
					$maintenanceCalendar.updateCalendarAfterReqCreation();
				},
				error: function(response){
					var message=translate('sdp.common.failed');
					try{
					if(response&&response.responseJSON&&response.responseJSON.response_status&&response.responseJSON.response_status.messages&&response.responseJSON.response_status.messages[0]){
						if(response.responseJSON.response_status.messages[0].message&&response.responseJSON.response_status.messages[0].message.message){
							message=response.responseJSON.response_status.messages[0].message.message;
							var fieldN=response.responseJSON.response_status.messages[0].message.field;
							if(fieldN){
								var fieldName=fieldN;
								if($maintenanceCalendar.fieldsMetaInfo[fieldName]){
									fieldName=$maintenanceCalendar.fieldsMetaInfo[fieldName].display_name;
								}
								else if($maintenanceCalendar.fieldsMetaInfo&&$maintenanceCalendar.fieldsMetaInfo.udf_fields&&$maintenanceCalendar.fieldsMetaInfo.udf_fields.fields&&$maintenanceCalendar.fieldsMetaInfo.udf_fields.fields[fieldName]){
									fieldName=$maintenanceCalendar.fieldsMetaInfo.udf_fields.fields[fieldName].display_name;
								}
								message=message+" : "+fieldName;
							}
						}
						else{
							message=response.responseJSON.response_status.messages[0].message;
						}
					}
					}
					catch(e){}
					window.showalert('failure',e_html(message),'isAutoHide=true'); // No I18N				
				}	
			});		
		}
	}	
	$maintenanceCalendar.switchMaintenanceView=function(view){
		addPersonalization("request_maintenances_currentview",{"view":view});
		$maintenanceList.init();
	}
	$maintenanceCalendar.getListViewFilterDetails = function(list_view_filter_id){
		return sdpAjax({
			url: '/api/v3/list_view_filters/'+list_view_filter_id, // No I18N
            success: function(resp) {
				$maintenanceCalendar.global_filter_name=resp.list_view_filter.display_name;
            }
        });
	}
	$maintenanceCalendar.afterClosePreview=function(){
		jQuery('body').addClass('of-h'); // No I18N
		//$maintenanceCalendar.updateCalendarAfterReqCreation();
		$maintenanceCalendar.updateListAfterFilterchange();
	}
	
	$maintenanceCalendar.getFilterByWithStartAndEndTime=function(){
		var filter_by = {};
		if($maintenanceCalendar.mode=="timeline"){
			filter_by.day_show=true;
		}
		filter_by.start_time=$maintenanceCalendar.MaintenanceScheduler.getState().min_date.getTime();
		filter_by.end_time=$maintenanceCalendar.MaintenanceScheduler.getState().max_date.getTime()-1;
		return filter_by;
	}	

	$maintenanceCalendar.initMiniCalendar = function(options){
		this.initialize();
		this.options=options;
		$maintenanceCalendar.MiniCalendar=Scheduler.getSchedulerInstance();
		renderhbs('#maintenance-minicalendar-container', 'pm_minicalendar',{'ViewRequests':sdp_user.ROLES.indexOf("ViewRequests")>-1?true:false}, false, 'maintenance'); //no i18n
		$maintenanceCalendar.MiniCalendar.config.xml_date="%Y-%m-%d %H:%i";// NO i18N
		$maintenanceCalendar.MiniCalendar.config.start_on_monday=false;
		const dayDate = $maintenanceCalendar.MiniCalendar.date.date_to_str("%j");// NO i18N
		$maintenanceCalendar.MiniCalendar.templates.calendar_date = function (date) {
			return dayDate(date);
		};
		/*$maintenanceCalendar.MiniCalendar.date.week_start = function(date){ 
            var shift=date.getDay(); // gets the week or months start date's day.
            if(shift != sdp_app.WEEK_START_DAY){
                shift = (shift < sdp_app.WEEK_START_DAY) ? (shift + (7 - sdp_app.WEEK_START_DAY)) : (shift - sdp_app.WEEK_START_DAY); // here shift is no of days need to be shifted to get user's  week_start_day(i.e calendar start_day is Wednesday and user week_start_day is Monday then shift is 2(we will start week or month from previous week_start_day not the next week_start_day)).
                return this.date_part(this.add(date,-1*shift,"day")); // No I18N
            }
            return this.date_part(date);
        };*/
		if(sdp_user.DIRECTION == "RTL") {
			$maintenanceCalendar.MiniCalendar.config.rtl = true;
		}
		var today_date=new Date();
		$maintenanceCalendar.MiniCalendar.locale.date.day_short= jQuery.extend(true, [] , $maintenanceCalendar.days_shortname);
		$maintenanceCalendar.MiniCalendar.locale.date.month_full= jQuery.extend(true, [] , $maintenanceCalendar.months_fullname);
		$maintenanceCalendar.MiniCalendar.init('scheduler_here',today_date,"month");// NO i18N
		$maintenanceCalendar.getRequestsForMonth();
	}
	$maintenanceCalendar.getRequestsForMonth=function(){
		var events_array=[];
		var futureEvents=this.options.events;
		var requestEvents=this.options.request_events;
		events_array=events_array.concat(requestEvents).concat(futureEvents);
		
		$maintenanceCalendar.MiniCalendar.parse(events_array,"json");// NO i18N
		$maintenanceCalendar.mini_calendar = $maintenanceCalendar.MiniCalendar.renderCalendar({
		    container:"innerSchDetails", // NO i18N
		    navigation:true,
		    handler:function(date){
		    	var wrapperObj=jQuery('#maintenance-minicalendar-container').find('#innerSchDetails');
		    	wrapperObj.find('[aria-label]').removeClass('miniCalEventOnFocus');//No i18N
		    	var date_str=date.getDate()+" "+$maintenanceCalendar.sch_months[date.getMonth()]+" "+date.getFullYear();
				var $day_div=wrapperObj.find('[aria-label="'+date_str+'"]');
				$day_div_child=wrapperObj.find($day_div.children()[0]);
				if($day_div_child.hasClass("req-bg-mini")){
					$day_div.addClass('miniCalEventOnFocus');
					//sdp.module.maintenance.detailsPage.add_criteria(date);
					var detailsContainer=jQuery("#"+ $maintenanceDetails.$detailsComp.options.container);
					$maintenanceDetails.startDateFromMniCalendar=date.getTime();
					$maintenanceDetails.endDateFromMniCalendar=date.getTime()+24*60*60*1000-1000;
					$maintenanceDetails.fromMiniCalendar=true;
					detailsContainer.find("[role='tablist']").find('li[data-name="requests"]').trigger("click");					
				}else{
					// $day_div_child.removeClass("dhx_calendar_click");
				}
		    }
		});
		
		jQuery('#maintenance-minicalendar-container').find('#scheduler_here').remove();
		$maintenanceCalendar.MiniCalendar.linkCalendar($maintenanceCalendar.mini_calendar);
		$maintenanceCalendar.beautifyCalendar();
		$maintenanceCalendar.fetchEventsCalendar();
		$maintenanceCalendar.MiniCalendar.attachEvent("onBeforeViewChange", function(old_mode,old_date,mode,date) {
			$maintenanceCalendar.MiniCalendar.templates.event_class = function (start, end, event) {
				var day = new Date();
				if(event.is_request === true){
					return "req-bg-mini cur-ptr ";//no i18n
				}else if(event.start_date>day){
					return "scheduled-bg-mini";//no i18n
				}else{
					return "beforescheduler_hidden vhide ";//no i18n
				}
			};
		});

	}

	$maintenanceCalendar.beautifyCalendar=function(){
		var wrapperObj=jQuery('#maintenance-minicalendar-container').find('#innerSchDetails');
		var $prev_button=wrapperObj.find('.dhx_cal_prev_button');
		var $next_button=wrapperObj.find('.dhx_cal_next_button');
		$prev_button.on('click', function(){// NO i18N
			jQuery("body>div[role=tooltip]").remove();
			$maintenanceCalendar.beautifyCalendar();
			$maintenanceCalendar.fetchEventsCalendar();
		});
		$next_button.on('click', function(){// NO i18N
			jQuery("body>div[role=tooltip]").remove();
			$maintenanceCalendar.beautifyCalendar();
			$maintenanceCalendar.fetchEventsCalendar();
		});
		$prev_button.addClass('pagenav-previous');
		$next_button.addClass('pagenav-next');
		// $prev_button.html('<span class="rspr icon-sm chevron-left1 opac5"></span>');
		// $next_button.html('<span class="rspr icon-sm chevron-right1 opac5"></span>');
		$prev_button.html('<span rel="uitip" title="'+getMessageForKey("sdp.gantt.quickselect.previousmonth")+'" class="rspr icon-sm chevron-left1 vtop opac5"></span>');
		$next_button.html('<span rel="uitip" title="'+getMessageForKey("sdp.common.nextmonth")+'" class="rspr icon-sm chevron-right1 vtop opac5"></span>');

		var $miniCal=wrapperObj.find('.dhx_mini_calendar');
		var curr_month=new Date($miniCal.attr('date'));
		var firstDay = new Date(curr_month.getFullYear(), curr_month.getMonth(), 1);
		var lastDay = new Date(curr_month.getFullYear(), curr_month.getMonth() + 1, 0,23,59,59);
		var events = $maintenanceCalendar.MiniCalendar.getEvents(firstDay,lastDay);

		initTooltip("#maintenance-minicalendar-container");	// NO i18N

		var today_date=new Date();

		for(var x=0;x<events.length;x++){
			var event=events[x];
			var date_str=event.start_date.getDate()+" "+$maintenanceCalendar.sch_months[event.start_date.getMonth()]+" "+event.start_date.getFullYear();
			var $day_div=wrapperObj.find('[aria-label="'+date_str+'"]');
			var $body_div=$day_div.children()[0];
			if(event.is_request === true){
				$body_div.addClassName('req-bg-mini');// NO i18N
			}else if(event.start_date>today_date){
				$body_div.addClassName('scheduled-bg-mini');// NO i18N
			}else{
				$body_div.removeClassName('dhx_year_event');// NO i18N
			}	
		}
	} 

	$maintenanceCalendar.fetchEventsCalendar=function(){
		var $miniCal=jQuery('#maintenance-minicalendar-container').find('.dhx_mini_calendar');
		var minical_date=new Date($miniCal.attr('date'));

			var firstDay = new Date(minical_date.getFullYear(), minical_date.getMonth(), 1);
			var lastDay = new Date(minical_date.getFullYear(), minical_date.getMonth() + 1, 1);
			var pmid=this.options.id;

			var filterBy={"name":"all_maintenances","start_time":firstDay.getTime(),"end_time":(lastDay.getTime()-1)}	//No I18N
			var crit=[];
			crit.push({"field": "id","condition": "EQ","value":pmid,"logical_operator": "and"});

			var listInfoObj = 	{ 	list_info:{
										search_criteria:crit,
										filter_by:filterBy,
										fields_required: ["events","subject","name","name","is_service_request","status","category","comments","request_events","maintenancestate"]// NO i18N
									} 
								};
			if(window.isMSPOrSCP) {
			    $mspMaintenanceCalendar.modifyPMDataListInfo(listInfoObj);
			}
		
			sdpAjax({
            url: "/api/v3/request_maintenances", //No I18N
            cache:false,
            data:sdpAjaxInputData(listInfoObj),
            success:function(data){
				if(data){
						var events_array=[];
						jQuery.each(data.request_maintenances,function(key,val){
							events_array=events_array.concat(val.request_events);
							events_array=events_array.concat(val.events);
						});		
						$maintenanceCalendar.MiniCalendar.parse(events_array,"json");// NO i18N
						$maintenanceCalendar.MiniCalendar.updateCalendar($maintenanceCalendar.mini_calendar,minical_date);
						$maintenanceCalendar.beautifyCalendar();
					}
				}
			});
	}
Handlebars.registerHelper('getToolTipHTML', function(rd) { //NO I18N 
	var typeKeys= {"once":"common.once","daily":"common.daily","weekly":"common.weekly","monthly":"sdp.inventory.detailAsset.DepreciationMonthly","yearly":"common.yearly"}; // No I18N
	if(window.isSCP) {
        return '<div class="ui-tooltip-style-1"><span class="disp-t mb3"><span class="disp-c pr5"><span class="cspr icon-md '+(rd.is_service_request?"service":"incident")+'-request"></span></span><span class="sb vmiddle disp-c text-color4 wb-bw">'+e_html(rd.name)+'</span> </span><p class="font-small text-color1 lh-normal wb-bw">'+e_html(rd.comments?rd.comments:'')+'</p><hr class="mb10 mt10">'+'<p class="font-small"><label class="text-muted mr5">'+window.getMessageForKey("sdp.msp.common.account")+':</label>'+e_html(rd.account&&rd.account.name?rd.account.name:'-')+'</p>'+'<p class="font-small"><label class="text-muted mr5">'+window.getMessageForKey("sdp.requests.common.category")+':</label>'+e_html(rd.category&&rd.category.name?rd.category.name:'-')+'</p><p class="font-small"><label class="text-muted mr5">'+window.getMessageForKey("sdp.itil.common.status")+':</label>'+e_html(rd.status&&rd.status.name?rd.status.name:'-')+'</p><p class="font-small"><label class="text-muted mr5">'+window.getMessageForKey("schedule.type")+':</label>'+window.getMessageForKey(rd.frequency?typeKeys[rd.frequency]:'-')+'</p><p class="font-small mb3"><label class="text-muted mr5">'+window.getMessageForKey("custom.schedule.next.schedule")+':</label>'+(rd.next_schedule_time?rd.next_schedule_time:'-')+'</p></div>';
        // any change made in the below HTML, should be reflected above also
    }
	return '<div class="ui-tooltip-style-1"><span class="disp-t mb3"><span class="disp-c pr5"><span class="cspr icon-md '+(rd.is_service_request?"service":"incident")+'-request"></span></span><span class="sb vmiddle disp-c text-color4 wb-bw">'+e_html(rd.name)+'</span> </span><p class="font-small text-color1 lh-normal wb-bw">'+e_html(rd.comments?rd.comments:'')+'</p><hr class="mb10 mt10"><p class="font-small"><label class="text-muted mr5">'+window.getMessageForKey("sdp.requests.common.category")+':</label>'+e_html(rd.category&&rd.category.name?rd.category.name:'-')+'</p><p class="font-small"><label class="text-muted mr5">'+window.getMessageForKey("sdp.itil.common.status")+':</label>'+e_html(rd.status&&rd.status.name?rd.status.name:'-')+'</p><p class="font-small"><label class="text-muted mr5">'+window.getMessageForKey("schedule.type")+':</label>'+window.getMessageForKey(rd.frequency?typeKeys[rd.frequency]:'-')+'</p><p class="font-small mb3"><label class="text-muted mr5">'+window.getMessageForKey("custom.schedule.next.schedule")+':</label>'+(rd.next_schedule_time?rd.next_schedule_time:'-')+'</p></div>';
});	
