// $Id$
var $maintenance = {
    redirectTo: function (options, eve) {
		jQuery(".page-progressbar").show(); //No I18N
		var urlParams="";
		if(!$maintenance.canShowCalendar()){
			jQuery('#maintenance-static-msg-panel').removeClass('hide');
		}
		try{
            if(eve){
                eve.preventDefault();
            }
        }
        catch(e){}
		if(options&&options.mode){
			urlParams+="mode="+options.mode;// No I18N
			if(window.isMSP) {
				$accountCombo.removeOnChangeEvents();
			}
			if(options.mode=="add"||options.mode=="edit"){
				jQuery('body').removeClass('of-h'); // No I18N
				var params = ""; // No I18N	
				if(options.id&&options.id!="null"&&options.id!=undefined){
					params+="&woID="+options.id; //No I18N
					urlParams+="&id="+options.id; //No I18N
				}
				if(options.reqTemplate&&options.reqTemplate!="null"&&options.reqTemplate!=undefined){
					params+="&reqTemplate="+options.reqTemplate; //No I18N
					urlParams+="&reqTemplate="+options.reqTemplate; //No I18N
				}
				if(options.fromPage&&options.fromPage!="null"&&options.fromPage!=undefined){
					params+="&fromPage="+options.fromPage; //No I18N
					urlParams+="&fromPage="+options.fromPage; //No I18N
				}			
				applyBrowserTitle();
				jQuery("#maintenance-section").load("/workorder/WOForm.jsp?isMaintenance=true"+params, function() { //No I18N
				    if(window.isMSP) {
						$mspMaintenance.initHeaderAccountBoxForForm(options);
					}
					 jQuery(".page-progressbar").fadeOut(); //No I18N
				});
			}
			else if(options.mode=="list") {
				if(options.gsearch&&options.gsearch!="null"&&options.gsearch!=undefined){
					urlParams+="&gsearch="+options.gsearch; //No I18N
				}				
				jQuery("#maintenance-section").html('');
				jQuery('body').addClass('of-h'); // No I18N
				if(window.isMSP) {
					$mspMaintenanceList.initHeaderAccountBox();
				}
				$maintenanceList.init(options);
				applyBrowserTitle();
				jQuery("html").scrollTop(0);	// Header vanish issue - edit to list view
			}
			else if(options.mode=="details") {				
				jQuery("#maintenance-section").html('');
				jQuery('body').removeClass('of-h'); // No I18N
				if(options.id&&options.id!="null"&&options.id!=undefined){
					urlParams+="&id="+options.id; //No I18N
				}				
				$maintenanceDetails.init(options);
			}			
		}
    },
	initRequests: function(options){
		this.maintenanceId=options.id;
		this.hideDateFilter=options.hideDateFilter;
		this.fromMiniCalendar=options.fromMiniCalendar;
		this.start_time=options.start_time;
		this.end_time=options.end_time;
		if(this.fromMiniCalendar){
			if(this.start_time){
				var offset1 = getTimezoneDifference(this.start_time);
				this.start_time=this.start_time-offset1;
			}
			if(this.end_time){
				var offset2 = getTimezoneDifference(this.end_time);
				this.end_time=this.end_time-offset2;
			}
		}
        var componentName = "webc-maintenance_requests"; // No I18N
        delete WebComponents.instancePool[componentName];
        WebComponents.render(componentName);		
	},
	rowDataConstruct: function(table_info)
    {
        var inputObject = {};
        inputObject.list_info = table_info.list_info;
        var fields_required = table_info.fields_required;
        var fields_required_arr = Object.keys(fields_required);
        var newTabCellIndex = fields_required_arr.indexOf("newTabCell"); // No I18N
        newTabCellIndex > -1 && fields_required_arr.splice(newTabCellIndex, 1);
        var requestTypeIconIndex = fields_required_arr.indexOf("requestTypeIcon"); // No I18N
        requestTypeIconIndex > -1 && fields_required_arr.splice(requestTypeIconIndex, 1);	
        var generateRequestCellIndex = fields_required_arr.indexOf("generateRequestCell"); // No I18N
        generateRequestCellIndex > -1 && fields_required_arr.splice(generateRequestCellIndex, 1);
		fields_required_arr.push("is_service_request"); // No I18N
		if(!fields_required_arr.indexOf("category")>-1){ // No I18N
			fields_required_arr.push("category"); // No I18N
		}
		fields_required_arr.push("short_description"); // No I18N
        inputObject.fields_required = fields_required_arr;
		inputObject.list_info.search_criteria=[{"field":"maintenance.id","condition":"is","value":$maintenance.maintenanceId,"logical_operator":"and"}]; //No I18N
		if($maintenance.hideDateFilter||$maintenance.fromMiniCalendar){
			if($maintenance.start_time){
				inputObject.list_info.search_criteria.push({"field":"created_time","values":[$maintenance.start_time],"condition":"greater or equal","logical_operator":"and"});
			}
			if($maintenance.end_time){
				inputObject.list_info.search_criteria.push({"field":"created_time","values":[$maintenance.end_time],"condition":"lesser or equal","logical_operator":"and"});
			}
		}		
		else{
			/*
			In first render we should not append filter criteria for requests tab as datefilter would not have veen initialized
			so we check it using maintenanceRequestDateFilter_options element availability in DOM. AFter tab is loaded and if some date
			filter is chosen, if some fields are selected via column chooser then rowdataconstruct will be called again.
			so we have to append filter criteria at that time.
			*/
			try{
			if(jQuery("#maintenanceRequestDateFilter_options").length>0){
				inputObject.list_info.search_criteria=$maintenance.getCriteria();
			}
			}
			catch(e){
			}
		}
        return inputObject;
    },	
	constructNewTabCell:function(table_data){
       	return '<a href="/" data-request-id="'+table_data.row_data.id+'" data-action-name="newRequestTabLinkFromMaintenance"><span class="cspr flat icon-sm newtab vmiddle top0" rel="uitip" title="'+getMessageForKey("table.open.newtab")+'"></span></a>';
    },
	constructRequestTypeIconCell:function(table_data){
		var rd= table_data.row_data;
		if(rd.is_service_request){
			return '<span title="'+getMessageForKey("sdp.home.ssp.templates.tooltip.servicerequest")+'" rel="uitip" class="req-sprite service-req-icon"></span>';
		}
		else{
			return '<span title="'+getMessageForKey("sdp.requests.view.incidentrequest")+'" rel="uitip" class="req-sprite incident-req-icon" aria-describedby="ui-tooltip-25"></span>';
		}
	},	
    constructSite : function(table_data){
        var rd = table_data.row_data;
		var site = rd.site? e_html(rd.site.name) : getMessageForKey("sdp.admin.technician.addtechnician.nosite"); // No I18N
		var col_str;
		col_str='<span rel="uitip" mode_ellipsis="true" title="'+e_attr(rd.site? rd.site.name:getMessageForKey("sdp.admin.technician.addtechnician.nosite"))+'" >'+site+'</span>';
        return col_str;
    },		
	constructSubjectCell: function(table_data){
       	var rd= table_data.row_data;
       	return '<a href="/" data-request-id="'+rd.id+'" data-action-name="requestPreviewLinkFromMaintenance" data-spa-module="requests" data-spa-page="requests-details" data-spa="true" rel="uitip" mode_html="true" title="'+e_attr('<strong>'+getMessageForKey("sdp.requests.common.requestid")+' : </strong>'+rd.id+'<br><strong>'+getMessageForKey("sdp.requests.common.category")+' :</strong>'+e_html(rd.category&&rd.category.name?rd.category.name:'-')+'<br><strong>'+getMessageForKey("sdp.requests.common.title")+' :</strong>'+e_html(rd.subject)+'<br><strong>'+getMessageForKey("sdp.common.description")+' :</strong> '+e_html(rd.short_description))+'">'+e_html(rd.subject)+'</a>';
    },
	callbackSearchFunction : function(){
		var tablecomp = WebComponents.getInstance("webc-maintenance_requests"); //NO I18N
		var search_criteria = $maintenance.getCriteria();
		if(tablecomp.t_obj.table_info.list_info.search_criteria&&search_criteria&&search_criteria.length>0){
			if(tablecomp.t_obj.table_info.list_info.search_criteria.children){
				for(var i=0;i<search_criteria.length;i++){
					tablecomp.t_obj.table_info.list_info.search_criteria.children.push(search_criteria[i]);
				}
			}
			else{
				tablecomp.t_obj.table_info.list_info.search_criteria.children=search_criteria;
			}
		}
		else if(search_criteria&&search_criteria.length>0){
			tablecomp.t_obj.table_info.list_info.search_criteria=[];
			for(var i=0;i<search_criteria.length;i++){
				tablecomp.t_obj.table_info.list_info.search_criteria.push(search_criteria[i]);
			}
		}
		tablecomp.refreshTable("refresh"); // No I18N		
	},
	additionalMetaInfo : function(){
		var obj = {
            "urgency": {"value_path" : "urgency.name"}, //No I18N
            "group": {"value_path" : "group.name"}, //No I18N
            "item": {"value_path" : "item.name"}, //No I18N
            "impact": {"value_path" : "impact.name"}, //No I18N
            "priority": {"value_path" : "priority.name"}, //No I18N
            "category": {"value_path" : "category.name"}, //No I18N
            "subcategory": {"value_path" : "subcategory.name"}, //No I18N
			"site": {"value_path" : "site.name"}, //No I18N
			"service_category": {"value_path" : "service_category.name"}, //No I18N
			"level": {"value_path" : "level.name"}, //No I18N
			"requester": {"value_path" : "requester.name"}, //No I18N
			"mode": {"value_path" : "mode.name"}, //No I18N
			"request_type": {"value_path" : "request_type.name"}, //No I18N
			"template": {"value_path" : "template.name"}, //No I18N
			"technician": {"value_path" : "technician.name"}, //No I18N
			"department": {"value_path" : "department.name"}, //No I18N
            "status": {"value_path" : "status.name"}, //No I18N	
			"maintenance": {"text":"common.maintenance","disableSearching": true,"value_path" : "status.name"}, //No I18N			
		};
		if(window.isMSPOrSCP) {
			$mspMaintenance.modifyAdditionalMetaInfo(obj);
		}
		return obj;
    },	
	callbackAfterInitialRender: function(){
		if(!$maintenance.hideDateFilter){
			var dateMaxTime= new Date().getTime();
			var offset1 = getTimezoneDifference(dateMaxTime);
			dateMaxTime=dateMaxTime+offset1;
			var options={'type':'dateselect','calendar_options' : { "placeholder": translate("all.time") ,dateRangePickerOptions : { maxDate:new Date(dateMaxTime) }, datePickerOptions : { maxDate:new Date(dateMaxTime)}, calendarIconClassName : "cspr calendar icon-sm",'change': $maintenance.handleChange,'clear': $maintenance.dateFilterClearcallback}}; //No I18N
			if($maintenance.fromMiniCalendar&&$maintenance.start_time){
				var dt = new Date($maintenance.start_time + getTimezoneDifference($maintenance.start_time));
				//var dtValue=(dt.getDate()<10?'0'+dt.getDate():dt.getDate())+'/'+((dt.getMonth()+1)<10?'0'+(dt.getMonth()+1):(dt.getMonth()+1))+'/'+dt.getYear();
				options.calendar_options.value=dt;
			}
		jQuery("#maintenanceRequestDateFilter").ZSDPCalendar(options); //No I18N
		}
		jQuery("#maintenance_requests_div").removeClass("tablebrd1");	//No I18N
	},
	callbackAfterBodyRender: function() {
    	jQuery("#maintenance_requests_div [data-action-name='newRequestTabLinkFromMaintenance']").off('click').on('click', (event) => {                     //No I18N
        	window.open('/WorkOrder.do?woMode=viewWO&woID='+event.currentTarget.dataset.requestId,'_blank', 'noopener');
        });
        jQuery("#maintenance_requests_div [data-action-name='requestPreviewLinkFromMaintenance']").off('click').on('click', (event) => {             //No I18N
        	$maintenance.showRequestPreview(event.currentTarget.dataset.requestId);
        });
    },
	dateFilterClearcallback: function() {
		var tablecomp = WebComponents.getInstance("webc-maintenance_requests"); //NO I18N
		tablecomp.t_obj.table_info.list_info.search_criteria=$maintenance.getCriteria();
		tablecomp.refreshTable("refresh"); // No I18N	
	},
	getCriteria : function(){
		var search_criteria=[{"field":"maintenance.id","condition":"is","value":$maintenance.maintenanceId,"logical_operator":"and"}]; //No I18N
		if(this.hideDateFilter){
			if(this.start_time){
				search_criteria.push({"field":"created_time","values":[this.start_time],"condition":"greater or equal","logical_operator":"and"});
			}
			if(this.end_time){
				search_criteria.push({"field":"created_time","values":[this.end_time],"condition":"lesser or equal","logical_operator":"and"});
			}
		}
		else{
			var responseDate = jQuery("#maintenanceRequestDateFilter").ZSDPCalendar("getComponentDateObject"); //No I18N
			if(!jQuery.isEmptyObject(responseDate)){
				var fromDate = responseDate.from.fromValue.setHours(0,0,0,0);
				var toDate = responseDate.to.toValue.setHours(23,59,0,0);
				var offset1 = getTimezoneDifference(fromDate);
				fromDate=fromDate-offset1;
				var offset2 = getTimezoneDifference(toDate);
				toDate=toDate-offset2;				
				//if(responseDate.from&&responseDate.from.value){
					search_criteria.push({"field":"created_time","values":[fromDate],"condition":"greater or equal","logical_operator":"and"});
				//}
				//if(responseDate.from&&responseDate.to.value){
				//	var toValue= responseDate.to.value+(24*60*60*1000 - 1000 );
					search_criteria.push({"field":"created_time","values":[toDate],"condition":"lesser or equal","logical_operator":"and"});
				//}			
			}
		}
		return search_criteria;
	},
	handleChange:function(){
		var tablecomp = WebComponents.getInstance("webc-maintenance_requests"); //NO I18N
		tablecomp.t_obj.table_info.list_info.search_criteria=$maintenance.getCriteria();
		tablecomp.refreshTable("refresh"); // No I18N	
	},
	showRequestPreview: function(id, event) {
		if(externalframe){
			return false;
		}
        var options = {
            rpanel: false,
			from: "maintenance", // No I18N
            width: "70%",
			afterCloseCallback: function (){
				jQuery('body').removeClass('of-h'); // No I18N
			}
        };
		jQuery('body').addClass('of-h'); // No I18N
        $ReqPreview.showRequestPreview(id, options, event);
    },
	resumeConfirmPopup : {
		isResumeAllowed:function(schedule_data,id,from){
			this.id=id;
			this.from=from;
			if(schedule_data!=null){
				var freq = schedule_data.frequency;
				var rend=schedule_data.repeat_end;
				var stime= schedule_data.start_time;
				if(freq=="once"&&stime!=null&&stime.value!=null&&Number(stime.value)<((new Date()).getTime())){
					return false;
				}
				if(rend!=null&&rend.on!=null&&rend.on.value!=null&&Number(rend.on.value)<((new Date()).getTime())){
					return false;
				}
			}
			return true;
		},
		showReschedulePopup:function(){
			showconfirm(true,'title='+window.getMessageForKey("maintenance.schedule.timeelapsed")+',message='+translate('maintenance.schedule.rescheduleconfirm')+',submitbutton='+window.getMessageForKey("common.yes")+',cancelbutton='+translate('common.no')+',closebutton=yes,closeOnEscKey=yes',$maintenance.resumeConfirmPopup.reDirectCallBack);	 //No I18N	
		},
		reDirectCallBack:function(canRedirect){
			if(canRedirect){
				let url = '/ui/maintenances?mode=edit&id='+$maintenance.resumeConfirmPopup.id;//No I18N
				if($maintenance.resumeConfirmPopup.from=="details"){
					url = url + "&fromPage=maintenanceDetails"; // No I18N
				}
				$spa.navigate(url,'maintenances','maintenances-edit');//No I18N
			}
		}
	},
	generateRequestConfirm: function(callback){
		showconfirm(true,'title='+window.getMessageForKey("generate.request")+',message='+translate('maintenance.generate.request.confirm')+',submitbutton='+window.getMessageForKey("common.yes")+',cancelbutton='+translate('common.no')+',closebutton=yes,closeOnEscKey=yes', callback);	 //No I18N
	},
	setNoDataString : function(){
    	return '<div id="maintenance_requests_norecordsdivs" style="width:'+jQuery("#maintenance_requests_div").width()+'px;">'+translate("sdp.listview.nodataavailble")+'</div>';	 //No I18N
    },
	canShowCalendar: function(){
		/*
			javascript will return negative value for GMT+5:30
			java will return positive value.
			sdp_user.OFFSET and sdp_user.SERVER_OFFSET will be positive for GMT+4:30
			as they are constructed in server side. browserTimeZoneOffset will be negative as
			it is calculated by JavaScript in client. So we multiply browserTimeZoneOffset by -1
		*/
		var browserTimeZoneOffset= new Date().getTimezoneOffset()*60000*-1;
		var userPersonalizedTimeZoneOffset=sdp_user.OFFSET;
		if(userPersonalizedTimeZoneOffset!=browserTimeZoneOffset){
			return false;
		}
		return true;
	},
	tableCompAdditionalOptions: function(){
	    return {
	        "metaInfo_input": { //No I18N
	            "for": "request_list_view" //No I18N
            }
	    };
	}
}
