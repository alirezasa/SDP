/* $Id $ */
/**
 * Version: 1.0.0
 */
 var scheduleAPI = (function() {
	/**
	 * Method to define the defaults of schedule API component
	 * @param {String} selector parent div in which component needs to be loaded 
	 * @param {Object} options options passed for the component
	 */
    function scheduleAPI(selector, options) {
    	var _self = this;
    	var defaults = {
			"mode": "new",	//No I18N
    		"from": { //No I18N
    			"show": true,    //No I18N
    			"mandatory": true,   //No I18N
    			"display_name": translate("sdp.common.date.from")    //No I18N
    		},
    		"to": {   //No I18N
                "show": true,    //No I18N
    			"mandatory": true,   //No I18N
    			"display_name": translate("sdp.common.date.to")  //No I18N
    		},
    		"all_day": {  //No I18N
    			"show": true,    //No I18N
    			"display_name": translate("schedule.allday")   //No I18N
    		},
    		"repeats": {  //No I18N
    			"show": true,    //No I18N
    			"mandatory": true,   //No I18N
    			"display_name": translate("schedule.repeats"), //No I18N
    			"default_value": "once", //No I18N
    			"values": [  //No I18N
					{"id": "once", "text": translate("common.once")},  //No I18N
					{"id": "daily", "text": translate("common.daily")},    //No I18N
					{"id": "weekly", "text": translate("common.weekly")},  //No I18N
					{"id": "monthly", "text": translate("sdp.inventory.detailAsset.DepreciationMonthly")},     //No I18N
					{"id": "yearly", "text": translate("common.yearly")},  //No I18N
					{"id": "hours", "text": translate("common.hourly")},   //No I18N
					{"id": "minutes", "text": translate("sdp.change.sla.minutes")} //No I18N
				]
    		},
    		"repeat_ends": {  //No I18N
    			"show": true,    //No I18N
    			"display_name": translate("schedule.repeatends"),  //No I18N
    			"default_value": "never",    //No I18N
    			"values": [  //No I18N
					{"id": "never", "text": translate("sdp.requests.viewrequest.noRefresh")},  //No I18N
					{"id": "after_occurrences", "text": translate("sdp.change.sla.after")},    //No I18N
					{"id": "on", "text": translate("sdp.common.capson")}   //No I18N
    			],
    			"occurence": {   //No I18N
    				"default_value": "1"    //No I18N
    			},
				"min_val": 1,	//No I18N
				"max_val": 100	//No I18N
    		},
			"run_every": {   //No I18N
    			"display_name": translate("schedule.runevery"),    //No I18N
    			"daily": {   //No I18N
    				"default_value": "1",   //No I18N
						"range":[1,7300],	//No I18N
    			},
    			"weekly": {  //No I18N
    				"default_value": "1", //No I18N
						"range":[1,365],	//No I18N
    			},
    			"monthly": { //No I18N
    				"default_value": "1", //No I18N
						"range":[1,365],	//No I18N
    			},
    			"yearly": {  //No I18N
    				"default_value": "1", //No I18N
						"range":[1,365],	//No I18N
    			},
    			"minutes": { //No I18N
    				"default_value": "5",   //No I18N
    				"values": getArr(5, 45, "", 5)	//No I18N
    			},
    			"hours": {   //No I18N
    				"default_value": "1", //No I18N
						"range":[1,365],	//No I18N
    			},
    			"on_the": {  //No I18N
    				"week": {   //No I18N
    					"default_value": "1",  //No I18N
    					"values": [    //No I18N
    						{"id":"1", "text": translate("sdp.common.first")},    //No I18N
    						{"id":"2", "text": translate("common.second")},   //No I18N
    						{"id":"3", "text": translate("common.third")},    //No I18N
    						{"id":"4", "text": translate("common.fourth")},   //No I18N
    						{"id":"-1", "text": translate("sdp.common.last")}  //No I18N
    					]
    				},
    				"day": {    //No I18N
    					"default_value": "1", //No I18N
    					"placeholder": translate("sdp.home.day"),  //No I18N
    					"values": [    //No I18N
    						{"id": "1", "text": translate("sdp.days.sun")},   //No I18N
							{"id": "2", "text": translate("sdp.days.mon")},  //No I18N
							{"id": "3", "text": translate("sdp.days.tue")},  //No I18N
							{"id": "4", "text": translate("sdp.days.wed")},  //No I18N
							{"id": "5", "text": translate("sdp.days.thu")},  //No I18N
							{"id": "6", "text": translate("sdp.days.fri")},  //No I18N
							{"id": "7", "text": translate("sdp.days.sat")},   //No I18N
							{"id": "-1", "text": translate("common.single.day")}   //No I18N
    					]
    				}
    			},
    			"on_day": {  //No I18N
    				"values": getArr(1, 32)	//No I18N
    			}
    		},
    		"adv_opts": { //No I18N
    			"show": "true"   //No I18N
    		},
    		"returnDateInServerTimeZone": true, //Defaultly server time will be considered in scheduler.
			"update_data": null	//No I18N
    	};
    	//Deep clone options
		this.options = jQuery.extend(true, {}, defaults, options);
		if(options.repeats && options.repeats.values) {
			this.options.repeats.values = options.repeats.values;
		}
		if(options.repeat_ends && options.repeat_ends.values) {
			this.options.repeat_ends.values = options.repeat_ends.values;
		}
		if(options.run_every && options.run_every.minutes && options.run_every.minutes.values) {
			this.options.run_every.minutes.values = options.run_every.minutes.values;
		}
		if(options.run_every && options.run_every.on_day && options.run_every.on_day.values) {
			this.options.run_every.on_day.values = options.run_every.on_day.values;
		}
		if(options.run_every && options.run_every.on_the && options.run_every.on_the) {
			if(options.run_every.on_the.week && options.run_every.on_the.week.values) {
				this.options.run_every.on_the.week.values = options.run_every.on_the.week.values;
			}
			if(options.run_every.on_the.day && options.run_every.on_the.day.values) {
				this.options.run_every.on_the.day.values = options.run_every.on_the.day.values;
			}
		}
		if(options.run_every) { // we cannot change the ranges of run_every.
			if(options.run_every.daily && options.run_every.daily.range){
				this.options.run_every.daily.range = [1, 7300];
			}
			if(options.run_every.weekly && options.run_every.weekly.range){
				this.options.run_every.weekly.range = [1, 365];
			}
			if(options.run_every.monthly && options.run_every.monthly.range){
				this.options.run_every.monthly.range = [1, 365];
			}
			if(options.run_every.yearly && options.run_every.yearly.range){
				this.options.run_every.yearly.range = [1, 365];
			}
			if(options.run_every.hours && options.run_every.hours.range){
				this.options.run_every.hours.range = [1, 365];
			}
		}
		if(selector) {
			jQuery(selector).css("width", this.options.width).html("<div class='pt20 pb20 form-horizontal'></div>");	//No I18N
			this.grid = jQuery(selector).find("> div");	//No I18N
			_self.init();
		}
		if(options.update_data) {
			_self.update(options.update_data);
		}
    }

    /**
     * Initialization method for schedule API UI component
     */
    scheduleAPI.prototype.init = function() {
    	var _self = this;
    	var $timezone_div = jQuery("<div>", {"class": "form-horizontal"});  //No I18N
    	$timezone_div.html(`<div class="form-group mb0"><label class="col-sm-4"></label><div class="col-sm-8"><div class="alert alert-info icon mb20" role="alert"><span class="msg">` + translate("common.scheduler.timezone") + ` - ` + sdp_app.SERVER_TIMEZONE + `</span></div></div></div>`);    //No I18N
    	_self.grid.append($timezone_div);
    	if(_self.options.from.show) {
    		_self.addDate("from_date", "eventStartTime", _self.options.from); //No I18N
    	}
    	if(_self.options.to.show) {
    		_self.addDate("to_date", "eventEndTime", _self.options.to);   //No I18N
    	}
    	if(_self.options.all_day.show) {
    		var $div = jQuery("<div>", {"class": "form-group mb15 all_day"});  //No I18N
    		$div.html('<div class="checkbox"><label class="tr pt5 col-sm-4">&nbsp;</label>'+  //No I18N
                  '<label class="ml15"><input id="allDay" type="checkbox"> &nbsp;'+_self.options.all_day.display_name+'</label></div>');    //No I18N
    		_self.grid.append($div);

    		// Time won't be shown if All Day is selected
    		_self.grid.find("#allDay").on("click", function() {   //No I18N
    			if(jQuery(this).is(':checked')) {    //No I18N
				    _self.grid.find('.diff-oper-hrs').hide();   //No I18N
				} else {
				    _self.grid.find('.diff-oper-hrs').show();   //No I18N
				}
    		});
    	}
    	if(_self.options.repeats.show) {
    		var $div = jQuery("<div>", {"class": "form-group mb15 repeats"});  //No I18N
    		var $label = jQuery("<label>", {"class": "tr pt5 col-sm-4", "text": _self.options.repeats.display_name, "for": "repeats_pick"});  //No I18N
    		if(_self.options.repeats.mandatory) {
				$label.prepend('<span class="mandatory mr5 font-medium">*</span>'); //No I18N
			}
    		$div.append($label);
    		var $div_pick = jQuery("<div>", {"class":"col-sm-8"});    //No I18N
    		$div_pick.html('<div data-id="form-elem">'+   //No I18N
    						'<input type="text" class="form-control w-120px" aria-required="true" id="repeats_pick" />'+  //No I18N
                            '<div class="disp-ib ml15">'+    //No I18N
                              '<label for="AdvanceOption" adv-option="Yes" class="checkbox-inline ml5 pt0 mb0 hide"><input type="checkbox" id="AdvanceOption">'+translate('admp.advanced_options')+'</label>'+    //No I18N
                            '</div>'+   //No I18N
                        '</div>');  //No I18N
    		if(!_self.options.adv_opts.show) {
    			$div_pick.find(".disp-ib").remove(); //No I18N
    		}
    		$div.append($div_pick);
    		_self.grid.append($div);

    		_self.initSelect2("repeats_pick", {   //No I18N
	    			data: _self.options.repeats.values
    			}, _self.options.repeats.default_value);

    		//Handle change in repeats dropdown
    		_self.grid.find("#repeats_pick").on("change", function() {    //No I18N
    			_self.grid.find("#AdvanceOption").length && _self.grid.find("#AdvanceOption").prop("checked", false).trigger("change");  //No I18N
    			switch(jQuery(this).val()) {
    				case "once":    //No I18N
    					_self.grid.find(".repeats").find(".checkbox-inline").addClass("hide")   //No I18N
    					_self.grid.find(".repeat_ends").hide();    //No I18N
    					break;
    				case "hours":   //No I18N
    				case "minutes":     //No I18N
    					_self.grid.find(".repeats").find(".checkbox-inline").addClass("hide");   //No I18N
    					_self.grid.find(".repeat_ends").show();    //No I18N
    					_self.grid.find("#repends_pick").select2("val", _self.options.repeat_ends.default_value).trigger("change");    //No I18N
    					_self.constructAdvOpts();
    					break;
    				default: 
	    				_self.grid.find(".repeats").find(".checkbox-inline").removeClass("hide");   //No I18N
	    				_self.grid.find(".repeat_ends").show();    //No I18N
	    				_self.grid.find("#repends_pick").select2("val", _self.options.repeat_ends.default_value).trigger("change");    //No I18N
    			}
    		});

    		//Handle change in advanced options checkbox 
    		jQuery("#AdvanceOption").on("change", function() {    //No I18N
    			if(this.checked) {
    				_self.constructAdvOpts();
    			} else {
    				_self.grid.find("#adv_opts").length && _self.grid.find("#adv_opts").remove();   //No I18N
    			}
    		});
    	}
    	if(_self.options.repeat_ends.show) {
    		var $div = jQuery("<div>", {"class": "form-group mb15 repeat_ends"});  //No I18N
    		var $label = jQuery("<label>", {"class": "tr pt5 col-sm-4", "text": _self.options.repeat_ends.display_name, "for": "repeats_pick"});  //No I18N
    		$div.append($label);
    		var $div_pick = jQuery("<div>", {"class":"col-sm-8"});    //No I18N
    		$div_pick.html('<div data-id="form-elem">'+   //No I18N
                            '<div class="row m0 disp-flex">'+   //No I18N
                            	'<input type="text" class="form-control w-120px" id="repends_pick"/>'+   //No I18N
                                '<span class="vmiddle disp-h" data-action="After">'+    //No I18N
                                  '<span class="disp-ib ml10 mr5 w-40px">'+ //No I18N
                                      '<input class="form-control" id="Occurence" type="text" value="'+_self.options.repeat_ends.occurence.default_value+'">'+  //No I18N
                                  '</span>'+    //No I18N
                                  '<label for="Ocuurence" class="vmiddle">'+translate('common.plural.occurence')+'</label>'+    //No I18N
                                '</span>'+  //No I18N
                                '<span class="vmiddle ml10 disp-h w-180px" data-action="On">'+    //No I18N
                                  	'<input id="onTime" name="onTime" type="hidden" value="" class="form-control" elementType="date">'+ //No I18N
									'<div id="onTimeDisplayContent" class="input-group date">'+ //No I18N
						      			'<input type="text" class="form-control cur-ptr" aria-label="' + _self.options.repeat_ends.display_name + '" id="onTime_Display" readonly placeholder="'+translate('sdp.common.date')+'"/>'+    //No I18N
						      			'<span class="input-group-addon cur-ptr"><span class="cspr calendar icon-sm top0"></span></span>'+ //No I18N
						          	'</div>'+  //No I18N
                                '</span>'+  //No I18N
                            '</div>'+   //No I18N
                        '</div>');  //No I18N
    		$div.append($div_pick);
    		_self.grid.append($div);

    		jQuery("#onTimeDisplayContent").off("click.scheduler_ontime").on("click.scheduler_ontime", function(){
    			initCalendar("onTime", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
    		});

        var dd = new Date();
        _self.grid.find("#onTime").val(+dd.setHours(0,0,0,0));    //No I18N
        displayClientTime("onTime");    //No I18N

    		//If repeats dropdown value is 'once' hide repeat ends section
    		if(_self.grid.find("#repeats_pick").val() == "once") {    //No I18N
				_self.grid.find(".repeat_ends").hide(); //No I18N
			}

		    _self.initSelect2("repends_pick", {   //No I18N
    			data: _self.options.repeat_ends.values
			}, _self.options.repeat_ends.default_value);

    		//Handle change in repeat ends dropdown
    		_self.grid.find("#repends_pick").on("change", function() { //No I18N
    			_self.grid.find(".repeat_ends").find("span.vmiddle").hide(); //No I18N
    			if(jQuery(this).val() == "on") { //No I18N
    				_self.grid.find(".repeat_ends").find("[data-action='On']").show();  //No I18N
    			} else if(jQuery(this).val() == "after_occurrences") {   //No I18N
    				_self.grid.find(".repeat_ends").find("[data-action='After']").show();   //No I18N
    			}
    		});
    	}
    };

    /**
     * Method to create date & time field
     * @param {String} grid_class parent class to be added
     * @param {String} date_id id with which date field needs to be constructed
     * @param {Object} data Object containing label data
     */
    scheduleAPI.prototype.addDate = function(grid_class, date_id, data) {
    	var _self  = this;
	    var $main_div = jQuery("<div>", {"class": "form-group mb15 "+grid_class+" "}); //No I18N
		var $label = jQuery("<label>", {"class": "tr pt5 col-sm-4", "text": data.display_name, "for": date_id});  //No I18N
		if(data.mandatory) {
			$label.prepend('<span class="mandatory mr5 font-medium">*</span>');  //No I18N
		}
		$main_div.append($label);
		var $div = jQuery("<div>", {"class":"col-sm-8"});//No I18N
		var $div_date = jQuery("<div>", {"class":"col-sm-8 p0", "css": {"width": "180px"}});//No I18N
		$div_date.html(''+
			'<input id="'+date_id+'" name="'+date_id+'" type="hidden" value="" class="form-control" elementType="date">'+//No I18N
			'<div id="' + date_id + 'DisplayContent" class="input-group date">'+	//No I18N
      		'<input type="text" class="form-control cur-ptr" aria-required="true" aria-label="' + data.display_name + '" id="'+date_id+'_Display" readonly/>'+      //No I18N
          	'<span class="input-group-addon cur-ptr"><span class="cspr calendar icon-sm top0"></span></span>'+ //No I18N
          	'</div>');   //No I18N

		var $div_time = jQuery("<div>", {"class":"col-sm-4 diff-oper-hrs"});    //No I18N
		$div_time.html('<div class="res-time cur-ptr form-control pos-rel fw">'+  //No I18N
            '<span class="selected-time">00 : 00</span>'+   //No I18N
            '<span class="caret fr mt10"></span>'+  //No I18N
            '<div class="res-select-time disp-h">'+ //No I18N
              '<div class="res-input clearfix">'+   //No I18N
                '<span class="fl"><input data-res-plc="false" data-invalid="00" type="text" maxlength="2" data-res-digitchange="false" data-res="res-hours" data-res-unit=" :" placeholder="'+translate('common.hrs')+'" class="active" res-tmp="00"></span>'+  //No I18N
                '<span class="fl last"><input data-res-plc="false" data-invalid="00" type="text" maxlength="2" data-res-digitchange="false" data-res="res-mins" data-res-unit="" placeholder="'+translate('common.mins')+'" class="" res-tmp="00"></span>'+ //No I18N
              '</div>'+ //No I18N
              '<div class="sub-selection clearfix">'+   //No I18N
				'<ul class="tl" data-res-unit=" :" rel="res-hours" data-res-plc="false" data-res-digitchange="false">'+getArr(0, 24, "li", 1, true)+'</ul>'+  //No I18N
				'<ul class="tr disp-h" data-res-unit="" rel="res-mins" data-res-plc="false" data-res-digitchange="false" data-last="last-res">'+getArr(0, 60, "li", 1, true)+'</ul>'+   //No I18N
              '</div></div></div>');    //No I18N

		$div.append($div_date);
		$div.append($div_time);
		$main_div.append($div);
		_self.grid.append($main_div);

		$div_time.find("[data-res='res-hours'], [data-res='res-mins']").on("keypress", function(event){
			return allowOnlyNumber(event);
		});
		jQuery("#" + date_id + "DisplayContent").off("click.scheduler_" + date_id).on("click.scheduler_" + date_id, function(){
			initCalendar(date_id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
		});

    //Set default value for date
    var dd = _self.options.returnDateInServerTimeZone ? new Date(new Date().getTime() + getTimezoneDifferenceWithServer()) : new Date();
    var hr = dd.getHours() + 1;
    _self.grid.find("#"+date_id).val(+dd);    //No I18N
    displayClientTime(date_id);
    if(grid_class == "to_date") {   //No I18N
        hr = hr + 1;
    }
    _self.grid.find("."+grid_class).find(".selected-time").text(hr+" : 00");  //No I18N
    _self.grid.find("."+grid_class).find("[data-res='res-hours']").val(hr);  //No I18N
    _self.grid.find("."+grid_class).find("[data-res='res-mins']").val("00");  //No I18N

		cancelEvents.addSlaEvents();
		//Method to initialize time picker
		addSlaEvents();
    };

    /**
     * Method to construct advanced options based on repeats value
     */
    scheduleAPI.prototype.constructAdvOpts = function() {
    	var _self = this;
    	var rep_val = _self.grid.find("#repeats_pick").val();  //No I18N
    	_self.grid.find("#adv_opts").length && _self.grid.find("#adv_opts").remove();  //No I18N
    	var $div = jQuery("<div>", {"id": "adv_opts"});    //No I18N
        var dd = new Date();
    	switch(rep_val) {
			case "daily":    //No I18N
                $div.html('<div class="form-group mb15">'+   //No I18N
                    '<label class="tr pt5 col-sm-4">'+translate("schedule.runevery")+'</label>'+  //No I18N
                    '<div class="col-sm-8">'+   //No I18N
                        '<div data-id="form-elem">'+    //No I18N
                            '<span class="disp-ib mr5 w-40px">'+    //No I18N
                                '<input class="form-control" type="text" id="days" value="'+_self.options.run_every.daily.default_value+'"></span>'+ //No I18N
                            '<label for="days">'+translate('sdp.contract.addNew.day')+'</label>'+   //No I18N
                        '</div>'+   //No I18N
                    '</div>'+   //No I18N
                '</div>'); //No I18N
                /* 
                //Phase 2 changes 
                $div.html('<div class="form-group mb15">'+   //No I18N
                    '<label class="tr pt5 col-sm-4">'+translate("schedule.runevery")+'</label>'+  //No I18N
                    '<div class="col-sm-8">'+   //No I18N
                        '<div data-id="form-elem">'+    //No I18N
                            '<span data-schstyle="true" class="disp-ib mr5 vsub">'+   //No I18N
                                '<input type="radio" class="vmiddle mr5 ml0" name="Daily" checked="" valus="dailyrun">'+     //No I18N
                                '<input class="form-control disp-ib w-40px" type="text" id="days" value="'+_self.options.run_every.daily.default_value+'">'+  //No I18N
                            '</span>'+  //No I18N
                            '<label for="days">'+translate('sdp.contract.addNew.day')+'</label>'+   //No I18N
                        '</div>'+   //No I18N
                    '</div>'+   //No I18N
                '</div>'+   //No I18N
                '<div class="form-group mb15">'+ //No I18N
                    '<label class="tr pt5 col-sm-4">'+translate("schedule.exclude.weekends")+'</label>'+  //No I18N
                    '<div class="col-sm-8">'+   //No I18N
                        '<div data-id="form-elem">'+    //No I18N
                            '<span class="disp-ib mr5 vsub w-40px"><input type="radio" class="vmiddle mr5 ml0" name="Daily" value="dailyexclude"></span>'+   //No I18N
                        '</div>'+   //No I18N
                    '</div>'+   //No I18N
                '</div>'); //No I18N
                */
        //$div.find("[data-schstyle='true']")css("width", "68px"); // for phase-2 changes.
				_self.grid.find(".repeats").after($div);    //No I18N
				break;
			case "weekly":   //No I18N
				$div.html('<div class="form-group mb15">'+   //No I18N
                    '<label class="tr pt5 col-sm-4">'+translate("schedule.runevery")+'</label>'+  //No I18N
                    '<div class="col-sm-8">'+   //No I18N
                        '<div data-id="form-elem">'+    //No I18N
                            '<span class="disp-ib mr5 w-40px">'+    //No I18N
                              	'<input class="form-control" type="text" id="weeks" value="'+_self.options.run_every.weekly.default_value+'">'+    //No I18N
                            '</span>'+  //No I18N
                            '<label>'+translate('common.plural.week')+'</label>'+   //No I18N
                        '</div>'+   //No I18N
                    '</div>'+   //No I18N
                '</div>'+   //No I18N
                '<div class="form-group mb15">'+ //No I18N
                    '<label class="tr pt5 col-sm-4">'+translate('schedule.runon')+'</label>'+ //No I18N
                  	'<div class="col-sm-8 pr0">'+    //No I18N
                      	'<div data-id="form-elem">'+ //No I18N
                        	'<div class="row m0">'+    //No I18N
                          		'<table cellspacing="0" cellpadding="0" width="100" class="monthlyview table m0" border="0">'+  //No I18N
                              		'<tbody><tr>'+  //No I18N
	                                    '<td data-id="1">'+translate("sdp.days.sun")+'</td>'+  //No I18N
	                                    '<td data-id="2">'+translate("sdp.days.mon")+'</td>'+  //No I18N
	                                    '<td data-id="3">'+translate("sdp.days.tue")+'</td>'+  //No I18N
	                                    '<td data-id="4">'+translate("sdp.days.wed")+'</td>'+  //No I18N
	                                    '<td data-id="5">'+translate("sdp.days.thu")+'</td>'+  //No I18N
	                                    '<td data-id="6">'+translate("sdp.days.fri")+'</td>'+  //No I18N
	                                    '<td data-id="7">'+translate("sdp.days.sat")+'</td>'+  //No I18N
                              		'</tr></tbody>'+    //No I18N
                              	'</table>'+  //No I18N
                        	'</div>'+  //No I18N
                      	'</div>'+    //No I18N
                  	'</div>'+    //No I18N
              	'</div>');   //No I18N
				_self.grid.find(".repeats").after($div);    //No I18N

                var day = dd.getDay() + 1;
                _self.grid.find("#adv_opts").find("td[data-id="+day+"]").addClass("selectedbg");   //No I18N
				break;
			case "monthly":  //No I18N
				$div.html('<div class="form-group mb15">'+   //No I18N
                      	'<label class="tr pt5 col-sm-4">'+translate("schedule.runevery")+'</label>'+   //No I18N
                      	'<div class="col-sm-8">'+    //No I18N
                          	'<div data-id="form-elem">'+ //No I18N
                            	'<div class="row m0">'+    //No I18N
                              		'<div data-id="form-elem">'+    //No I18N
                                  		'<span class="disp-ib mr5 w-40px">'+    //No I18N
                                    		'<input class="form-control" type="text" id="months" value="'+_self.options.run_every.monthly.default_value+'">'+   //No I18N
                                  		'</span>'+  //No I18N
                                  		'<label>'+translate('common.plural.month')+'</label>'+  //No I18N
                              		'</div>'+   //No I18N
                            	'</div>'+  //No I18N
                            	'<div class="row m0 mt15">'+   //No I18N
                                	'<span class="disp-ib mr5 vmiddle w-180px">'+  //No I18N
                                  		'<label class="radio-inline" for="OnMonth">'+   //No I18N
                                    		'<input type="radio" name="OnMonth" id="OnMonth" value="daysofmonth" checked="true">'+translate('schedule.plural.daysofmonth')+''+    //No I18N
                                  		'</label>'+ //No I18N
                                	'</span>'+ //No I18N
                                	'<table cellspacing="0" cellpadding="0" width="100" class="monthlyview table" border="0">'+    //No I18N
                                    	'<tbody>'+ //No I18N
											'<tr>'+getArr(1, 8, "td")+'</tr>'+	//No I18N
											'<tr>'+getArr(8, 15, "td")+'</tr>'+	//No I18N
											'<tr>'+getArr(15, 22, "td")+'</tr>'+	//No I18N
											'<tr>'+getArr(22, 29, "td")+'</tr>'+	//No I18N
											'<tr>'+getArr(29, 32, "td")+'</tr>'+	//No I18N
                                		'</tbody>'+   //No I18N
                                	'</table>'+    //No I18N
                            	'</div>'+  //No I18N
                            	'<div class="row m0 mb10">'+    //No I18N
	                              	'<span class="disp-ib mr5 vmiddle w-180px">'+   //No I18N
	                                	'<label class="radio-inline" for="Onday">'+   //No I18N
	                                  		'<input class="" type="radio" name="OnMonth" id="Onday" value="onthe">'+   //No I18N
	                                  	''+translate('common.onthe')+'</label>'+    //No I18N
	                              	'</span>'+  //No I18N
	                              	'<div class="pl25 mt10">'+  //No I18N
	                              		'<input type="text" id="mon_onthe_count" class="form-control w-120px"/>'+    //No I18N
	                              		'<input type="text" id="mon_onthe_day" class="ml10 form-control w-120px"/>'+   //No I18N
	                              	'</div>'+   //No I18N
                            	'</div>'+  //No I18N
                          	'</div>'+    //No I18N
                      	'</div>'+    //No I18N
                  	'</div>');   //No I18N
				_self.grid.find(".repeats").after($div);    //No I18N

	    		_self.initSelect2("mon_onthe_count", {   //No I18N
	    			data: _self.options.run_every.on_the.week.values
				}, _self.options.run_every.on_the.week.default_value);

         _self.handleDayListChange("#mon_onthe_count", "mon_onthe_day", _self.options.run_every.on_the.day);

                var date = dd.getDate();
                _self.grid.find("#adv_opts").find("td").eq(date-1).addClass("selectedbg");   //No I18N
				break;
			case "yearly":   //No I18N
				$div.html('<div class="form-group mb15">'+   //No I18N
                  	'<label class="tr pt5 col-sm-4">'+translate("schedule.runevery")+'</label>'+   //No I18N
                  	'<div class="col-sm-8">'+    //No I18N
                      	'<div data-id="form-elem">'+ //No I18N
                        	'<div class="row m0">'+    //No I18N
                          		'<div data-id="form-elem">'+    //No I18N
                              		'<span class="disp-ib mr5 w-40px">'+    //No I18N
                                		'<input class="form-control" type="text" id="years" value="'+_self.options.run_every.yearly.default_value+'">'+ //No I18N
                              		'</span>'+  //No I18N
                              		'<label>'+translate('sdp.asset.depreciationDetails.usefullifeInYears')+'</label>'+   //No I18N
                          		'</div>'+   //No I18N
                        	'</div>'+  //No I18N
                      	'</div>'+    //No I18N
                  	'</div>'+    //No I18N
              	'</div>'+    //No I18N
              	'<div class="form-group mb15">'+  //No I18N
                  	'<label class="tr pt5 col-sm-4">'+translate('schedule.plural.selectedmonth')+'</label>'+   //No I18N
                  	'<div class="col-sm-8">'+    //No I18N
                        '<table cellspacing="0" cellpadding="0" width="100" class="monthlyview table ml0" border="0">'+ //No I18N
                            '<tbody>'+  //No I18N
                            '<tr>'+ //No I18N
                                '<td data-id="0">'+translate("sdp.month.jan")+'</td>'+  //No I18N
                                '<td data-id="1">'+translate("sdp.month.feb")+'</td>'+  //No I18N
                                '<td data-id="2">'+translate("sdp.month.mar")+'</td>'+  //No I18N
                                '<td data-id="3">'+translate("sdp.month.apr")+'</td>'+  //No I18N
                            '</tr>'+    //No I18N
                            '<tr>'+ //No I18N
                                '<td data-id="4">'+translate("sdp.month.may")+'</td>'+  //No I18N
                                '<td data-id="5">'+translate("sdp.month.jun")+'</td>'+  //No I18N
                                '<td data-id="6">'+translate("sdp.month.jul")+'</td>'+  //No I18N
                                '<td data-id="7">'+translate("sdp.month.aug")+'</td>'+  //No I18N
                            '</tr>'+    //No I18N
                            '<tr>'+ //No I18N
                                '<td data-id="8">'+translate("sdp.month.sep")+'</td>'+  //No I18N
                                '<td data-id="9">'+translate("sdp.month.oct")+'</td>'+ //No I18N
                                '<td data-id="10">'+translate("sdp.month.nov")+'</td>'+ //No I18N
                                '<td data-id="11">'+translate("sdp.month.dec")+'</td>'+ //No I18N
                            '</tr>'+    //No I18N
                        	'</tbody>'+    //No I18N
                        '</table>'+ //No I18N
                        '<div class="row m0 mt20">'+    //No I18N
                          	'<span class="disp-ib mr5 vmiddle">'+    //No I18N
                            	'<label class="radio-inline pt0" for="OndayYear">'+    //No I18N
                              		'<input type="radio" name="OnMonthYear" id="OndayYear" value="daysofmonth" checked="true">'+   //No I18N
                              	''+translate('schedule.ondayofmonth')+'</label>'+  //No I18N
                          	'</span>'+   //No I18N
                          	'<span>'+    //No I18N
                            	'<input type="text" id="year_day_mon" class="form-control w-80px"/> '+    //No I18N
                          	'</span>'+   //No I18N
                        '</div>'+   //No I18N
                        '<div class="row m0 mt15 mb10">'+    //No I18N
                          	'<span class="disp-ib mr5 vmiddle">'+    //No I18N
                            	'<label class="radio-inline pt0" for="OndayYear2">'+   //No I18N
                              		'<input type="radio" name="OnMonthYear" id="OndayYear2" value="onthe">'+    //No I18N
                              	''+translate('common.onthe')+'</label>'+ //No I18N
                          	'</span>'+   //No I18N
                          	'<span>'+    //No I18N
                          		'<input type="text" id="year_onthe_count" class="form-control w-120px"/>'+ //No I18N
	                            '<input type="text" id="year_onthe_day" class="ml10 form-control w-120px"/>'+  //No I18N
                          	'</span>'+   //No I18N
                        '</div>'+   //No I18N
                  	'</div>'+    //No I18N
              	'</div>');   //No I18N
				_self.grid.find(".repeats").after($div);    //No I18N

				_self.initSelect2("year_day_mon", { //No I18N
	    			data: _self.options.run_every.on_day.values
				}, dd.getDate());

				_self.initSelect2("year_onthe_count", { //No I18N
	    			data: _self.options.run_every.on_the.week.values
				}, _self.options.run_every.on_the.week.default_value);

          _self.handleDayListChange("#year_onthe_count", "year_onthe_day", _self.options.run_every.on_the.day);

                var month = dd.getMonth();
                _self.grid.find("#adv_opts").find("td[data-id="+month+"]").addClass("selectedbg");   //No I18N
				break;
			case "hours":	//No I18N
                $div.html('<div class="form-group mb15">'+   //No I18N
                    '<label class="tr pt5 col-sm-4">'+translate("schedule.runevery")+'</label>'+  //No I18N
                    '<div class="col-sm-8">'+   //No I18N
                        '<div data-id="form-elem">'+    //No I18N
                            '<span class="disp-ib mr5 w-40px">'+    //No I18N
                              	'<input class="form-control" type="text" value="'+_self.options.run_every.hours.default_value+'" id="hours">'+ //No I18N
                            '</span>'+  //No I18N
                            '<label>'+translate('common.plural.hour')+'</label>'+   //No I18N
                        '</div>'+   //No I18N
                    '</div>'+   //No I18N
                '</div>');  //No I18N
                _self.grid.find(".repeats").after($div);    //No I18N
				break;
			case "minutes":  //No I18N
				$div.html('<div class="form-group mb15">'+   //No I18N
                    '<label class="tr pt5 col-sm-4">'+translate("schedule.runevery")+'</label>'+  //No I18N
                    '<div class="col-sm-8">'+   //No I18N
                        '<div data-id="form-elem">'+    //No I18N
                            '<span class="disp-ib mr5">'+   //No I18N
                            	'<input class="w-60px" type="text" id="mins_pick" />'+   //No I18N
                            '</span>'+  //No I18N
                            '<label>'+translate('common.plural.min')+'</label>'+    //No I18N
                        '</div>'+   //No I18N
                    '</div>'+   //No I18N
                '</div>');  //No I18N
                _self.grid.find(".repeats").after($div);    //No I18N

				_self.initSelect2("mins_pick", {    //No I18N
	    			data: _self.options.run_every.minutes.values
				}, _self.options.run_every.minutes.default_value);

				break;
    	}
		_self.grid.find('.monthlyview tr td').off('click.scheduler_selectbg').on('click.scheduler_selectbg',function() { //No I18N
	        if(jQuery(this).hasClass('selectedbg') && _self.grid.find('.monthlyview tr td.selectedbg').length != 1) {  //No I18N
	            jQuery(this).removeClass('selectedbg');    //No I18N
	        } else {
	            jQuery(this).addClass('selectedbg');   //No I18N
	        }
        });
    };

    /**
     * Method to get data constructed
	 * @param {Boolean} chk whether to check date condition
	 * @returns {Object} selected data in object format 
     */
    scheduleAPI.prototype.getData = function(chk) {
    	var _self = this;
    	var data = {};
    	if(_self.options.from.show) {
    		var from_val = +_self.grid.find("#eventStartTime").val();  //No I18N
			from_val = new Date(from_val);
			from_val.setHours(0,0,0,0);
			from_val = from_val.getTime();
			var offset = _self.options.returnDateInServerTimeZone ? getTimezoneDifferenceWithServer(): getTimezoneDifference(from_val);
				from_val = from_val - offset;
    		if(_self.grid.find(".from_date").find(".diff-oper-hrs").is(":visible")) { //No I18N
				var time_val = _self.grid.find(".from_date").find(".selected-time").html();  //No I18N
	    		var hrs_mins = time_val.split(":");  //No I18N
				if(isNaN(hrs_mins[0]) || !hrs_mins[1]) {
					window.showalert("failure", translate("sdp.adschedule.hrs.invalid"), "isAutoHide=true");	//No I18N
					return false;
				} else if(hrs_mins[1] && !hrs_mins[1].trim()) {
					window.showalert("failure", translate("sdp.adschedule.mins.invalid"), "isAutoHide=true");	//No I18N
					return false;
				}
	    		from_val += +hrs_mins[0] * 3600 * 1000;
	    		from_val += +hrs_mins[1] * 60 * 1000;
	    	}
	    	data.start_time = {"value": from_val}; //No I18N
    	}
    	if(_self.options.to.show) {
    		var to_val = +_self.grid.find("#eventEndTime").val();    //No I18N
			to_val = new Date(to_val);
			to_val.setHours(0,0,0,0);
			to_val = to_val.getTime();
			var offset = _self.options.returnDateInServerTimeZone ? getTimezoneDifferenceWithServer() : getTimezoneDifference(to_val);
				to_val = to_val - offset;
    		if(_self.grid.find(".to_date").find(".diff-oper-hrs").is(":visible")) {   //No I18N
				var time_val = _self.grid.find(".to_date").find(".selected-time").html();  //No I18N
	    		var hrs_mins = time_val.split(":");  //No I18N
				if(isNaN(hrs_mins[0]) || !hrs_mins[1]) {
					window.showalert("failure", translate("sdp.adschedule.hrs.invalid"), "isAutoHide=true");	//No I18N
					return false;
				} else if(hrs_mins[1] && !hrs_mins[1].trim()) {
					window.showalert("failure", translate("sdp.adschedule.mins.invalid"), "isAutoHide=true");	//No I18N
					return false;
				}
	    		to_val += +hrs_mins[0] * 3600 * 1000;
	    		to_val += +hrs_mins[1] * 60 * 1000;
	    	}
	    	data.end_time = {"value": to_val};   //No I18N
            if(from_val > to_val) {
                window.showalert("failure", translate("common.validation.start.end", [_self.options.from.display_name, _self.options.to.display_name]), "isAutoHide=true");    //No I18N
                return false;
            }
    	}
    	if(_self.options.repeats.show) {
    		var rep_data = _self.grid.find("#repeats_pick").select2("val");   //No I18N
    		data.frequency = rep_data;
			data.advanced = false;
			if(rep_data == "hours") {
				data.repeat_every = _self.grid.find("#hours").val(); //No I18N
			}
			else if(rep_data == "minutes") {
				data.repeat_every = _self.grid.find("#mins_pick").select2("val"); //No I18N
			}
    		if(_self.grid.find("#adv_opts").length) { //No I18N
				data.advanced = true;
	    		switch(rep_data) {
	    			case "daily":   //No I18N
                        data.repeat_every = _self.grid.find("#days").val();    //No I18N
                        /* 
                        //Phase 2 changes 
                        var dopts = _self.grid.find("[name='Daily']:checked").val(); //No I18N
                        if(dopts == "dailyexclude") {   //No I18N
                            data.daily = { "exclude_nonworkingdays" : true };   //No I18N
                        } else if(dopts == "dailyrun") {    //No I18N
                            data.repeat_every = _self.grid.find("#days").val();    //No I18N
                        }
                        */
                        break;
					case "weekly": //No I18N
						data.repeat_every = _self.grid.find("#weeks").val();  //No I18N
						_self.grid.find('.monthlyview tr td').each(function(ind, tdd) {   //No I18N
							if(jQuery(tdd).hasClass("selectedbg")) { //No I18N
								if(!data.weekly) {
									data.weekly = {"days_of_week": []};    //No I18N
								}
								data.weekly.days_of_week.push(jQuery(tdd).attr("data-id")); //No I18N
							}
						});
						break;
					case "monthly": //No I18N
						data.repeat_every = _self.grid.find("#months").val(); //No I18N
						var opts = _self.grid.find("[name='OnMonth']:checked").val(); //No I18N
						if(opts == "daysofmonth") { //No I18N
							_self.grid.find('.monthlyview tr td').each(function(ind, tdd) { //No I18N
								if(jQuery(tdd).hasClass("selectedbg")) { //No I18N
									if(!data.monthly) {
										data.monthly = {"days_of_month": []}; //No I18N
									}
									data.monthly.days_of_month.push(jQuery(tdd).html());
								}
							});
						} else if(opts == "onthe") {  //No I18N
						    var week = _self.grid.find("#mon_onthe_count").select2("val");    //No I18N
						    var day = _self.grid.find("#mon_onthe_day").select2("val");   //No I18N
						    if(!data.monthly) {
										data.monthly = {}; //No I18N
									}
               	data.monthly = _self.getDaysOfTheMonth(week, day, data.monthly);
						}
						break;
					case "yearly":     //No I18N
						data.repeat_every = _self.grid.find("#years").val();  //No I18N
						_self.grid.find('.monthlyview tr td').each(function(ind, tdd) {   //No I18N
							if(jQuery(tdd).hasClass("selectedbg")) { //No I18N
								if(!data.yearly) {
									data.yearly = {"months_of_year": []};  //No I18N
								}
								data.yearly.months_of_year.push(jQuery(tdd).attr("data-id"));   //No I18N
							}
						});
						var y_opts = _self.grid.find("[name='OnMonthYear']:checked").val();   //No I18N
						if(y_opts == "daysofmonth") {   //No I18N
							data.yearly.days_of_month = [_self.grid.find("#year_day_mon").select2("val")];  //No I18N
						} else if(y_opts == "onthe") {  //No I18N
						    var week = _self.grid.find("#year_onthe_count").select2("val");   //No I18N
						    var day = _self.grid.find("#year_onthe_day").select2("val");  //No I18N
	              data.yearly = _self.getDaysOfTheMonth(week, day, data.yearly);
						}
						break;
	    		}
	    	} else {
				var cur_date = new Date(from_val);
				switch(rep_data) {
					case "weekly": //No I18N
						var cur_week_day = cur_date.getDay() + 1;
						data.weekly = {"days_of_week": [cur_week_day]};    //No I18N
						break;
					case "monthly": //No I18N
						var cur_day = cur_date.getDate();
						data.monthly = {"days_of_month": [cur_day]}; //No I18N
						break;
					case "yearly":     //No I18N
						var cur_month = cur_date.getMonth();
						var cur_day = cur_date.getDate();
						data.yearly = {
							"months_of_year": [ cur_month ],
							"days_of_month": [ cur_day ]
						};
						break;
	    		}
			}
			if(rep_data != "minutes" && data.hasOwnProperty("repeat_every")) {
				var repeat_every_options = _self.options.run_every[rep_data];
				repeat_every_options.min_val = repeat_every_options.range[0];
				repeat_every_options.max_val = repeat_every_options.range[1];
				repeat_every_options.display_name = _self.options.run_every.display_name;
				if(!_self.validateNum(data.repeat_every, repeat_every_options)) {
					return false;
				}
			}
    	}
    	if(_self.options.repeat_ends.show && _self.grid.find(".repeat_ends").is(":visible")) { //No I18N
    		var repends_data  = _self.grid.find("#repends_pick").select2("val");  //No I18N
    		if(repends_data == "never") { //No I18N
    			data.repeat_end = {"never": true};   //No I18N
    		} else if(repends_data == "after_occurrences") {  //No I18N
    			var occ_count = _self.grid.find("#Occurence").val(); //No I18N
    			data.repeat_end = {"after_occurrences": +occ_count}; //No I18N
				if(!_self.validateNum(occ_count, _self.options.repeat_ends)) {
					return false;
				}
    		} else if(repends_data == "on") { //No I18N
    			var on_time = _self.grid.find("#onTime").val();  //No I18N
				var isTimeChg = _self.update_data && _self.update_data.repeat_end && _self.update_data.repeat_end.on && _self.update_data.repeat_end.on.value != on_time;
				if(_self.options.mode == "new" || isTimeChg) {
					//23.59 time in milliseconds, 86340000, added to on time
					on_time = parseInt(on_time) + 86340000;
				}
				if(on_time < from_val) {
					window.showalert("failure", translate("time.greater.than.time", [ _self.options.repeat_ends.display_name ,_self.options.from.display_name]), "isAutoHide=true");    //No I18N
					return false;
				}
    			data.repeat_end = {"on": {"value": on_time}};    //No I18N
    		}
    	}
		if(!chk && _self.options.from.show && from_val < +new Date()) {
			if(_self.options.mode == "edit") {
				if(JSON.stringify(data) !== JSON.stringify(_self.update_data)) {
					data.ischanged = true;
					window.showalert("failure", _self.options.from.display_name +": " +translate("sdp.adschedule.time.greater"), "isAutoHide=true");    //No I18N
					return false;
				}
			} else {
				window.showalert("failure", _self.options.from.display_name +": " +translate("sdp.adschedule.time.greater"), "isAutoHide=true");    //No I18N
				return false;
			}
		}
		if(!chk && _self.options.mode == "edit" && JSON.stringify(data) !== JSON.stringify(_self.update_data)) {
			data.ischanged = true;
		}
        return data;
    };

    /**
     * Method to construct select2 component
     * @param {String} ele_id id of the element on which select2 needs to be initiated
     * @param {Object} options options to be passed for initializing select2
     * @param {String} value value to be set on the field 
     */
    scheduleAPI.prototype.initSelect2 = function(ele_id, options, value) {
    	var _self = this;
    	_self.grid.find("#"+ele_id).select2(options);  //No I18N
    	if(value) {
    		_self.grid.find("#"+ele_id).select2("val", value);    //No I18N
    	}
    };

    /**
     * Method to update component
     * @param {Object} data data to be updated in component
     * @param {String} mode mode to be set(new, edit, view)
     */
    scheduleAPI.prototype.update = function(data, mode) {
        var _self = this;
		_self.options.mode = mode || "edit";	//No I18N
        var dd, hr, min, offset, t_dd;
        if(data.start_time) {
            dd = new Date(+data.start_time.value);
			offset = _self.options.returnDateInServerTimeZone ? getTimezoneDifferenceWithServer() : getTimezoneDifference(dd.getTime());
			t_dd = new Date(dd.getTime() + offset);
            hr = t_dd.getHours();
            min = t_dd.getMinutes();
			min  = (min == 0) ? "00" : min;	//No I18N
            _self.grid.find("#eventStartTime").val(+dd);    //No I18N
            displayClientTime("eventStartTime");    //No I18N
            _self.grid.find(".from_date").find(".selected-time").text(hr+" : "+min);  //No I18N
            _self.grid.find(".from_date").find("[data-res='res-hours']").val(hr);  //No I18N
            _self.grid.find(".from_date").find("[data-res='res-mins']").val(min);  //No I18N
        }
        if(data.end_time) {
            dd = new Date(+data.end_time.value);
			offset = _self.options.returnDateInServerTimeZone ? getTimezoneDifferenceWithServer() : getTimezoneDifference(dd.getTime());
			t_dd = new Date(dd.getTime() + offset);
            hr = t_dd.getHours();
            min = t_dd.getMinutes();
			min  = (min == 0) ? "00" : min;	//No I18N
            _self.grid.find("#eventEndTime").val(+dd);    //No I18N
            displayClientTime("eventEndTime");  //No I18N
            _self.grid.find(".to_date").find(".selected-time").text(hr+" : "+min);  //No I18N
            _self.grid.find(".to_date").find("[data-res='res-hours']").val(hr);  //No I18N
            _self.grid.find(".to_date").find("[data-res='res-mins']").val(min);  //No I18N
        }
        if(data.frequency) {
            _self.grid.find("#repeats_pick").select2("val", data.frequency).trigger("change");   //No I18N
			if(data.advanced) {
				_self.grid.find("#AdvanceOption").prop("checked", true).trigger("change");  //No I18N
			}
            switch(data.frequency) {
                case "daily":   //No I18N
                    if(data.advanced && data.repeat_every) {
                        _self.grid.find("#days").val(data.repeat_every);    //No I18N
                    }
                    break;
                case "weekly": //No I18N
                    if(data.advanced && data.repeat_every) {
                        _self.grid.find("#weeks").val(data.repeat_every);  //No I18N
                    }
                    if(data.advanced && data.weekly && data.weekly.days_of_week && data.weekly.days_of_week.length) {
                        _self.grid.find('.monthlyview tr td').removeClass("selectedbg");    //No I18N
                        jQuery.each(data.weekly.days_of_week, function(ind, val) {
                            _self.grid.find('.monthlyview tr td[data-id='+val+']').addClass("selectedbg");  //No I18N
                        });
                    }
                    break;
                case "monthly": //No I18N
                    if(data.advanced && data.repeat_every) {
                        _self.grid.find("#months").val(data.repeat_every);  //No I18N
                    }
                     _self.checkWeekOfTheMonth(data, "monthly", "mon_onthe_day");
                    if(data.advanced && data.monthly && data.monthly.days_of_month && data.monthly.days_of_month.length) {
                        _self.grid.find('.monthlyview tr td').removeClass("selectedbg");    //No I18N
                        jQuery.each(data.monthly.days_of_month, function(ind, val) {
                            _self.grid.find('.monthlyview tr td').eq(val-1).addClass("selectedbg");  //No I18N
                        });
                    } else if(data.advanced && data.monthly && data.monthly.weeks_of_month) {
                        _self.grid.find("[name='OnMonth'][value='onthe']").prop("checked", true);   //No I18N
                        _self.grid.find("#mon_onthe_count").select2("val", data.monthly.weeks_of_month[0].week_of_month);  //No I18N
                        _self.grid.find("#mon_onthe_day").select2("val", data.monthly.weeks_of_month[0].day_of_week);   //No I18N
                    }
                    break;
                case "yearly":     //No I18N
                    if(data.advanced && data.repeat_every) {
                        _self.grid.find("#years").val(data.repeat_every);  //No I18N
                    }
                    if(data.advanced && data.yearly && data.yearly.months_of_year && data.yearly.months_of_year.length) {
                        _self.grid.find('.monthlyview tr td').removeClass("selectedbg");    //No I18N
                        jQuery.each(data.yearly.months_of_year, function(ind, val) {
                            _self.grid.find('.monthlyview tr td[data-id='+val+']').addClass("selectedbg");  //No I18N
                        });
                    }
                     _self.checkWeekOfTheMonth(data, "yearly", "year_onthe_day");
                    if(data.advanced && data.yearly && data.yearly.days_of_month) {
                        _self.grid.find("#year_day_mon").select2("val", data.yearly.days_of_month[0]);  //No I18N

                    } else if(data.advanced && data.yearly && data.yearly.weeks_of_month) {
                        _self.grid.find("[name='OnMonthYear'][value='onthe']").prop("checked", true);   //No I18N
                        _self.grid.find("#year_onthe_count").select2("val", data.yearly.weeks_of_month[0].week_of_month);  //No I18N
                        _self.grid.find("#year_onthe_day").select2("val", data.yearly.weeks_of_month[0].day_of_week);   //No I18N
                    }
                    break;
                case "hours": //No I18N
                    _self.grid.find("#hours").val(data.repeat_every); //No I18N
                    break;
                case "minutes": //No I18N
                    _self.grid.find("#mins_pick").select2("val", data.repeat_every); //No I18N
                    break;
            }
        }
        if(data.repeat_end) {
            _self.grid.find(".repeat_ends").show(); //No I18N
            if(data.repeat_end.never) {
                _self.grid.find("#repends_pick").select2("val", "never");  //No I18N
            } else if(data.repeat_end.after_occurrences) {  //No I18N
                _self.grid.find("#repends_pick").select2("val", "after_occurrences").trigger("change");  //No I18N
                _self.grid.find("#Occurence").val(data.repeat_end.after_occurrences); //No I18N
            } else if(data.repeat_end.on) { //No I18N
                _self.grid.find("#repends_pick").select2("val", "on").trigger("change");  //No I18N
                _self.grid.find("#onTime").val(data.repeat_end.on.value);  //No I18N
                displayClientTime("onTime");    //No I18N
            }
        }
		setTimeout(function() {
			_self.update_data = _self.getData(true);
		},100);
    };

    /**
     *  Method to format data for view mode.
     */
    scheduleAPI.prototype.viewDetails = function(data) {
    	var _self = this;
    	var dataHtml = '<div class="form-section noborder"><div class="form-group mb10 mt10"><span class="text-color1 sb">'+translate("sdp.app.asset.details", [translate("sdp.admin.survey.schedule")])+'</span></div><div class="lh-normal wb-bw">';
    	if(data){
    		if(data.start_time){
    			dataHtml += _self.getFieldHtml(_self.options.from.display_name, data.start_time.display_value);
    		}
    		if(data.end_time){
    			dataHtml += _self.getFieldHtml(_self.options.to.display_name, data.end_time.display_value);
    		}
    		if(data.frequency){
	    		dataHtml += _self.getFieldHtml(_self.options.repeats.display_name, _self.options.repeats.values.find(function(v){ return v.id == data.frequency}).text);
    			if(data.frequency == 'yearly'){
    				if(data.repeat_every){
			    		dataHtml += _self.getFieldHtml(_self.options.run_every.display_name, (data.repeat_every + ' ' + translate('sdp.asset.depreciationDetails.usefullifeInYears')));
		    		}
		    		if(data[data.frequency] && data[data.frequency].months_of_year){
		    			var months = [translate("sdp.month.jan"),translate("sdp.month.feb"),translate("sdp.month.mar"),translate("sdp.month.apr"),translate("sdp.month.may"),translate("sdp.month.jun"),translate("sdp.month.jul"),translate("sdp.month.aug"),translate("sdp.month.sep"),translate("sdp.month.oct"),translate("sdp.month.nov"),translate("sdp.month.dec")];
		    			var selectedMonths = '';
		    			data[data.frequency].months_of_year.forEach(function(month){
		    				selectedMonths =  selectedMonths + ((selectedMonths.length != 0) ? ', ' : '') + (months[month]);
		    			});
		    			dataHtml += _self.getFieldHtml(translate('sdp.admin.productvendor.warranty.months'), selectedMonths);
		    		}
		    		dataHtml += _self.addDaysOfTheMonth(data, dataHtml);
	    		}
	    		else if(data.frequency == 'monthly'){
	    			if(data.repeat_every){
		    			dataHtml += _self.getFieldHtml(_self.options.run_every.display_name, (data.repeat_every + ' ' + translate('common.plural.month')));
		    		}
		    		dataHtml += _self.addDaysOfTheMonth(data, dataHtml);
	    		}
	    		else if(data.frequency == 'weekly'){
	    			if(data.repeat_every){
			    		dataHtml += _self.getFieldHtml(_self.options.run_every.display_name, (data.repeat_every + ' ' + translate('common.plural.week')));
		    		}
		    		if(data[data.frequency]){
		    			var days = [translate("sdp.days.sun"),translate("sdp.days.mon"),translate("sdp.days.tue"),translate("sdp.days.wed"),translate("sdp.days.thu"),translate("sdp.days.fri"),translate("sdp.days.sat")];
		    			var selectedDays = '';
		    			data[data.frequency].days_of_week.forEach(function(day){
		    				selectedDays =  selectedDays + ((selectedDays.length != 0) ? ', ' : '') + (days[day-1]);
		    			});
		    			dataHtml += _self.getFieldHtml(translate('sdp.contract.addNew.day'), selectedDays);
		    		}
	    		}
	    		else if(data.frequency == 'daily'){
	    			if(data.repeat_every){
			    		dataHtml += _self.getFieldHtml(_self.options.run_every.display_name, (data.repeat_every + ' ' + translate('common.plural.day')));
		    		}
	    		}
	    		else if(data.frequency == 'hours'){
	    			if(data.repeat_every){
			    		dataHtml += _self.getFieldHtml(_self.options.run_every.display_name, (data.repeat_every + ' ' + translate('common.plural.hour')));
		    		}
	    		}
	    		else if(data.frequency == 'minutes'){
	    			if(data.repeat_every){
			    		dataHtml += _self.getFieldHtml(_self.options.run_every.display_name, (data.repeat_every + ' ' + translate('common.plural.min')));
		    		}
	    		}
    		}
    		if(data.repeat_end){
    			var endData = '';
    			if(data.repeat_end.after_occurrences){
    				endData = ' ' + data.repeat_end.after_occurrences + ' ' + translate("common.plural.occurence");
    			}else if(data.repeat_end.on){
    				endData = ' ' + data.repeat_end.on.display_value;
    			}
    			dataHtml += _self.getFieldHtml(_self.options.repeat_ends.display_name, (_self.options.repeat_ends.values.find(function(v){ return v.id === Object.keys(data.repeat_end).find(function(key){ return data.repeat_end[key] !== null})}).text + endData));
    		}
    		if(data.next_schedule_time){
    			dataHtml += _self.getFieldHtml(translate('custom.schedule.next.schedule'), data.next_schedule_time);
    			dataHtml += _self.getFieldHtml(translate('sdp.header.personalize.timezone'), data.timezone);
    		}
    		dataHtml += '</div></div>';
    	}
    	return dataHtml;
    };

    /**
     * Method returns field and lable html for viewdetails
     */
    scheduleAPI.prototype.getFieldHtml = function(label, value) {
    	return '<div class="disp-t mb10 fw"><div class="disp-c pr15 w-40per"><p class="m0 text-muted">' + label + '</p></div><div class="disp-c pr15 w-60per"><p class="m0">' + value + '</p></div></div>'
    };

    /**
     * Method to reset component
     */
    scheduleAPI.prototype.reset = function() {
        this.grid.empty();
        this.init();
    };

	/**
	 * Method to validate numeric fields
	 * @param {String} count value provided by user
	 * @param {Object} opts options for specific field
	 */
	scheduleAPI.prototype.validateNum = function(count, opts) {
		var numberPattern = /^\d+$/;
		if(!numberPattern.test(count)) {
			window.showalert("failure", opts.display_name +": "+ translate("sdp.common.invalidnumber"), "isAutoHide=true");    //No I18N
			return false;
		} else if(count < opts.min_val || count > opts.max_val) {
			window.showalert("failure", opts.display_name +": "+ translate("form.value.rangevalue.alert", [opts.min_val, opts.max_val]), "isAutoHide=true");    //No I18N
			return false;
		}
		return true;
	};

	/**
    * Method to get Days of the month schedule has to be executed.
    * @param {Object} data for fetching and altering the day.
    */
  scheduleAPI.prototype.addDaysOfTheMonth = function(data) {
   	var _self = this,dataHtml = "";
   	if(data[data.frequency] && data[data.frequency].days_of_month){
			var selectedDays = '';
			if(data[data.frequency].days_of_month.length == 1 && data[data.frequency].days_of_month[0] == "-1"){
         selectedDays = translate("sdp.common.last") + " " + translate("common.single.day");
      }else{
         data[data.frequency].days_of_month.forEach(function(day){
             selectedDays =  selectedDays + ((selectedDays.length != 0) ? ', ' : '') + (day);
         });
      }
			dataHtml += _self.getFieldHtml(translate('schedule.plural.daysofmonth'), selectedDays);
		}
		if(data[data.frequency] && data[data.frequency].weeks_of_month){
			var selectedDays = '';
			selectedDays = _self.options.run_every.on_the.week.values.find(function(v){ return v.id == data[data.frequency].weeks_of_month[0].week_of_month}).text;
			selectedDays = selectedDays + ' ' + _self.options.run_every.on_the.day.values.find(function(v){ return v.id == data[data.frequency].weeks_of_month[0].day_of_week}).text;
			dataHtml += _self.getFieldHtml(translate('common.onthe'), selectedDays);
		}
		return dataHtml;
  };

	/**
    * Method to check the saved week of the month data and alter the daylist dropdown.
    * @param {Object} data for fetching and altering the day.
    * @param {String} period of repetition.
    * @param {String} dayListId days dropdown id to alter dropdown data.
    */
  scheduleAPI.prototype.checkWeekOfTheMonth = function(data, period, dayListId) {
   	var _self = this;
   	if(data.advanced && data[period] && data[period].days_of_month && data[period].days_of_month.length == 1 && data[period].days_of_month[0] == -1){
         data[period].weeks_of_month = [{
             "week_of_month": "-1",    //No I18N
             "day_of_week": "-1"    //No I18N
         }];
         delete data[period].days_of_month;
         _self.initDayList(dayListId, _self.options.run_every.on_the.day, true);
     }
  };

  /**
    * Method to check the saved week of the month data and alter the daylist dropdown.
    * @param {Number} selected week of the month.
    * @param {Number} selected week day of the month.
    * @param {Object} data of saved frequency.
    */
  scheduleAPI.prototype.getDaysOfTheMonth = function(week, day, data) {
   	var _self = this,dayData = {};
   	if(week == "-1" && day == "-1"){
       data["days_of_month"] = [ -1 ];
   	}else{
	     data["weeks_of_month"] = [{
	         "week_of_month": week,    //No I18N
	         "day_of_week": day    //No I18N
	     }];
   	}
   	return data;
  };

	/**
    * Method to initialize days dropdown in monthly/yearly repeats and hanlde data change based when day count changes.
    * @param {String} selector for adding change event on which days list will be altered.
    * @param {String} dayListId days dropdown id to alter dropdown data.
    * @param {Object} dayList dropdown options for initialisation
    */
   scheduleAPI.prototype.handleDayListChange = function(selector, dayListId, dayList) {
   	var _self = this;
      jQuery(selector).off("change."+dayListId).on("change."+dayListId, function(){ // change event to hanlde days dropdown values.
        let selectedValue = this.value;
        let includeDay = (selectedValue == -1);
          _self.initDayList(dayListId, dayList, includeDay);
     	});
     	_self.initDayList(dayListId, dayList);
   };

	/**
    * Method to initialize days dropdown in monthly/yearly repeats
    * @param {String} id value for dropdown
    * @param {Object} data options for initialisation
    * @param {Boolean} includeDay option to include an option called day or not
    */
   scheduleAPI.prototype.initDayList = function(id, data, includeDay = false) {
       var _self = this,dayValues = [...data.values], valueIndex = -1;
       if(!includeDay){ // when ever Last option is selected in week number only then day option shoukd be shown in day dropdown.
           let dayIndex = dayValues.findIndex(function(item, i){ return item.id === "-1" });
           if(dayIndex != -1){
               dayValues.splice(dayIndex, 1);
           }
       }else{ // when ever last option is selected in week number then only "Day" option alone should be shown( we are not allowing Last Sunday, Last Monday kind of).
       	dayValues = dayValues.filter(function(item, i){ return item.id === "-1" });
       }
       if(jQuery("#"+id).length){
           let selectedValue = jQuery("#"+id).select2("val");
           valueIndex = dayValues.findIndex(function(item, i){ return item.id === selectedValue });
       }
       // when already selected day of the week is present in new dropdown values no need to change weekday selected value.
       // when already selected day of the week is "not" present in new dropdown values, need to select default weekday value.
       // if default value is also not present in new dropdown values we are fetching id from the first index weekday and selecting it by default.
       let default_value = valueIndex != -1 ? undefined : (dayValues.findIndex(function(item, i){ return item.id === data.default_value }) == -1 ? dayValues[0].id : data.default_value);
       _self.initSelect2(id, {    //No I18N
           data: dayValues,
           placeholder: data.placeholder
       }, default_value);
   };

	/**
	 * Method to return arrays of data
	 * @param {Number} start number to start the loop
	 * @param {Number} end number to end the loop
	 * @param {HTML} wrap html tag to be used to wrap the values
	 * @param {Number} inc_count increment count for the loop
	 * @param {Boolean} add_zero whether to add zero if value is single digit
	 */
	function getArr(start, end, wrap, inc_count, add_zero) {
		var strArr  = wrap ? "" : [];	//No I18N
		inc_count = !inc_count ? 1 : inc_count;
		for(var i = start; i < end; i = i + inc_count) {
			var val = i.toString();
			if(add_zero && val.length == 1) {
				val  = "0" + val;	//No I18N
			}
			if(wrap) {
				strArr += "<"+wrap+">"+val+"</"+wrap+">";	//No I18N
			} else {
				strArr.push({"id": val, "text": val});	//No I18N
			}
		}
		return strArr;
	}

    return scheduleAPI;
}()); 
