/* $Id:$ */
(function ($, undefined) {
	$.widget('ui.scheduler', { //NO I18N
		version: '1.0.1',
		serialNo: 0,
		options: {
			show_unscheduled_tasks: false,
			show_unassigned_tasks: false,
			show_utilization: true,
			max_event_count: 500,
			resource: 'technicians', //No I18N
			current_tab: 'home', //No I18N
			res_max_count_filter: 10,
			group_max_count_filter: 10,
			sdp_scheduler_scroll: true,
			scheduler: null,
			max_resource_count : 50,
			supported_types: {
				task: 'task' //NO I18N
			},
			time_resource_fields: {
				start: 'scheduled_start_time', //NO I18N
				end: 'scheduled_end_time', //NO I18N
				resource: 'owner' //NO I18N
			},
			zoom_level: 'hours', //No I18N
			starting_date: null,
			ending_date: null,
			scroll_resource_count : 50,
			scroll_ready : true,
			bar_color_field : "priority"	//No I18N
		},

		destroy: function () {
			$(document).off('click','.sdp-gantt-tooltip .tt-actions a span');
			scheduler.isactive = false;
			window.self = window;
			//reset settings while destroying
			this.reset_options();
		},

		reset_options: function () {
			var self = this,
				o = self.options;

			self._remove_all_events();
			o.filtered_resource = {};
			//if it is not set to hours, previous selected zoom level is taken and going to load readonly tasks
			o.zoom_level = 'hours'; //No I18N
			//reset readonly_width
			delete o.readonly_width;
		},

		_create: function () {
			var self = this,
				o = self.options,
				el = self.element;
			scheduler.isactive = true;
			window.schevents = {};

			self._set_tab();

			if(o.current_tab == "home"){
				var filterMenu = jQuery("#TasksFilterMenu")[0].outerHTML;
				jQuery("#TasksFilterMenu").remove();
				jQuery(".event-option-sch").before(filterMenu);
				jQuery(".event-option-sch").before("<span class='sep-pipe'></span>");
      			jQuery("#TasksFilterMenu").attr('style', 'display: inline-block !important; margin-top: 7px');
      		}

			o.scheduler = scheduler; //scheduler is a window variable in scheduler js file
			//cleared all scheduler events
			self._clear_all();

			//o.scheduler.config.icons_select = ["icon_details","icon_edit"];	//No I18N
			o.scheduler.config.drag_create = false;
			o.scheduler.config.start_on_monday = false;
			o.scheduler.config.dblclick_create = false;
			o.scheduler.config.mark_now = false,
			// o.scheduler.config.delay_render = 30;

				//Assigning label values and configuring properties
				o.scheduler.locale.labels.timeline_tab = getMessageForKey("sdp.scheduler.label.timeline"); //No I18N
			o.scheduler.xy.scale_height = 30;
			o.scheduler.xy.nav_height = 35;
			o.scheduler.xy.bar_height = 20; //If this is changed, line-height property of this css dhx_cal_event_line should be changed
			//o.scheduler.xy.min_event_height=10;
			o.scheduler.dhtmlXTooltip.config.className = 'dhtmlXTooltip tooltip';
			o.scheduler.dhtmlXTooltip.config.timeout_to_display = 1;
			o.scheduler.dhtmlXTooltip.config.delta_x = 10;
			o.scheduler.dhtmlXTooltip.config.delta_y = -10;

			if(sdp_user.DIRECTION == "RTL") {
                o.scheduler.config.rtl = true;
            }

			//For timeline and unit views, data - owner names
			o.scheduler.deleteMarkedTimespan();

			//var drag = false;
			o.scheduler.templates.event_class = function (start, end, ev) {
				//check for another css for readonly
				if (ev.readonly) {
					if (!o.readonly_width) {
						o.readonly_width = $('.dhx_data_table')[0].style.width;
						$('#readonly-bar-width-style').html('.readonly-bar-width{width : ' + o.readonly_width + ' !important}'); //No I18N
					}
					return 'readonly-bar readonly-bar-width'; //No I18N
				}
				//return drag ? "bar-drag" : ( ev.unscheduled ? "unscheduled_bar_shaded" : "");			//No I18N
				return ev.unscheduled ? "unscheduled_bar_shaded" : ""; //No I18N
			};

			if (!is_dhtmlxscheduler_initialized) {
				self._attach_events();
			}

			//create timeline view
			self._get_personalized_data_and_create_timeline_view(function() {
			$("#initial-loading-indicator").remove();
				$('#resource-mgmt').css('visibility','visible').hide().fadeIn(700);
				setTimeout(function() {
					jQuery(".dhx_scale_bar.dhx_second_scale_bar").css("width", jQuery(".dhx_scale_bar").width() + 17); // NO I18N
					$("#scheduler_container").trigger('focus');
					$(window).trigger("resize");
					o.scheduler.updateView();
				},950);
			});

			self._init_scroll_event();
			var width = jQuery("#filter-menu")[0].clientWidth;
			jQuery("#filter-menu").css("top", jQuery(".dhx_scale_bar").offset().top + 13); // NO I18N

			if(sdp_user.DIRECTION === "RTL") {
				jQuery("#filter-menu").css("right", ((200 - width)/2) + (jQuery(window).width() - (jQuery(".dhx_cal_header").offset().left + jQuery(".dhx_cal_header").outerWidth()))); // NO I18N
			} else {
				jQuery("#filter-menu").css("left", ((200 - width)/2) + jQuery(".dhx_cal_header").offset().left); // NO I18N
			}


			is_dhtmlxscheduler_initialized = true;
		},

		_fix_date_position: function() {
			var navWidth = jQuery(".dhx_cal_navline").width();

			if(sdp_user.DIRECTION === "LTR") {
				var dateWidth = jQuery(".dhx_cal_next_button")[0].getBoundingClientRect().right - jQuery(".dhx_cal_prev_button")[0].getBoundingClientRect().left;
				jQuery(".sch-displaydate-container").css("left", navWidth/2 - dateWidth/2); // NO I18N

				var right = jQuery("#res-filter-left")[0].getBoundingClientRect().right;
				var left = jQuery(".dhx_cal_prev_button")[0].getBoundingClientRect().left;
				if((left - right) < 40) {
					var left = jQuery("#res-filter-right")[0].getBoundingClientRect().left;
					jQuery(".sch-displaydate-container").css("left", right + ((left - right) /2) - dateWidth/2 - 15); // NO I18N
				}
			} else {
				var dateWidth = jQuery(".dhx_cal_prev_button")[0].getBoundingClientRect().right - jQuery(".dhx_cal_next_button")[0].getBoundingClientRect().left;
				jQuery(".sch-displaydate-container").css("left", navWidth/2 - dateWidth/2); // NO I18N

				var left = jQuery("#res-filter-left")[0].getBoundingClientRect().left;
				var right = jQuery(".dhx_cal_prev_button")[0].getBoundingClientRect().right;
				if((left - right) < 40) {
					var right = jQuery("#res-filter-right")[0].getBoundingClientRect().right;
					jQuery(".sch-displaydate-container").css("right", left + ((right - left) /2) - dateWidth/2 - 15); // NO I18N
				}
			}
		},

		_attach_events: function () {
			var self = this;
			var o = self.options;

			$("body").on("mouseover", ".rtm-user-name", function() {
				var $self = jQuery(this);
				if($self.outerWidth() < $self[0].scrollWidth){
					$self.attr("title", $self.text());
				}
			});

			$("body").on("click", "button", function () {
				/**
                 * SD:89316 - Fixed - Customize page doesn't close on clicking Cancel button in Home page -> My View.
                 * Reason: Body onclick & button events in resourcemgmt, triggers for my_view tab as well.
                 * filter-menu element not available for my_view tab                
                 */
				 if (!jQuery("#resource-mgmt > #filter-menu").length) {
                    return;
                }
				var width = jQuery("#filter-menu")[0].clientWidth;
				jQuery("#filter-menu").css("top", jQuery(".dhx_scale_bar").offset().top + 13);  // NO I18N
				if(o.zoom_level === "days") {
					jQuery("#filter-menu").css("top", jQuery(".dhx_scale_bar").offset().top);  // NO I18N
				}
				$(window).trigger("resize");
				if(sdp_user.DIRECTION === "RTL") {
					jQuery("#filter-menu").css("right", ((200 - width)/2) + (jQuery(window).width() - (jQuery(".dhx_cal_header").offset().left + jQuery(".dhx_cal_header").outerWidth()))); // NO I18N
				} else {
					jQuery("#filter-menu").css("left", ((200 - width)/2) + jQuery(".dhx_cal_header").offset().left); // NO I18N
				}
			});

			$(window).off("resize.rmgmt").on("resize.rmgmt", function() {
				if(!o.scheduler.expanded) {
					if(o.current_tab === "home" && jQuery(".headerbar").length) {
					var height = jQuery(".project-sch-footer").position().top - jQuery(".headerbar")[0].getBoundingClientRect().bottom;
					jQuery(".project-sch-container").height(height);
					$(".project-sch-footer").width(jQuery(".headerbar").width());
					} else if(o.current_tab === "projects") { // NO I18N
						if(o.projectId) {
							var height = jQuery(".project-sch-footer").position().top - jQuery("[data-id=ui-tabs1-pos]")[0].getBoundingClientRect().bottom - 14;
							jQuery(".project-sch-container").height(height);
							$(".project-sch-footer").width(jQuery("#ui-framework-design1").width() - 40);
						} else {
							var height = jQuery(".project-sch-footer").position().top - jQuery("#ui-framework-design1")[0].getBoundingClientRect().bottom;
							jQuery(".project-sch-container").height(height);
							$(".project-sch-footer").width(jQuery("#ui-framework-design1").width() - 20);
						}
					}
				}
				$('#readonly-bar-width-style').html('.readonly-bar-width{width : ' + $('.dhx_data_table')[0].style.width + ' !important}'); //No I18N
			});

			$("#scheduler_container").on('keydown', function(e) {
				switch(e.which) {
					case 70: // F key
						// triggering click with different namespace to prevent our click event from executing as events bubble in reverse order.
						$('.dhx_expand_icon').trigger('click.keypress'); // NO I18N
						self._fullscreen_toggle();
					break;

					case 27: // Esc key
						if(o.scheduler.expanded) {
							$('.dhx_expand_icon').trigger('click.keypress'); // NO I18N
							self._fullscreen_toggle();
						}
					break;

					case 37: // Left Arrow key
						$('.dhx_cal_prev_button').trigger('click');
					break;

					case 39: // Right Arrow key
						$('.dhx_cal_next_button').trigger('click');
					break;

					default: return; // exit this handler for other keys
				}
				e.preventDefault(); // prevent the default action (scroll / move caret)
			});

			var self = this;
			var o = self.options;
			var eventId;

			if(o.attached_events){
				self._remove_all_events();
			}
			o.attached_events = [];

			eventId = o.scheduler.attachEvent("onEventChanged", function(id, event) {
				if (event.readonly) {
					return false;
				}

				var fields = {};
				var backup_origitem = {}; //this can be used in case of failure
				$.extend(backup_origitem, event.origitem);
				$.extend(fields, o.time_resource_fields);
				//owner change
				var owner_changed = self._is_owner_changed(event);
				if (owner_changed) {
					fields.resource = 'owner'; //No I18n

				} else {
					delete fields.resource;
				}

				if (owner_changed && event.unscheduled) {
					//owner changed for an unscheduled event
					delete fields.start;
					delete fields.end;
					//task schedule can't be changed in client
					var state = o.scheduler.getState();
					if (event.origitem[fields.start] == null) {
						event.start_date = state.min_date;
					}
					if (event.origitem[fields.end] == null) {
						event.end_date = state.max_date;
					}

					self._before_inline_edit(event, backup_origitem, fields);

				} else if (owner_changed) {
                    fields.start = 'scheduled_start_time'; //No I18n
                    fields.end = 'scheduled_end_time'; //No I18n

					var oldStartDate = self._getDateAsString(o.prev_start_time, true);
					var newStartDate = self._getDateAsString(event.start_date, true);

					var oldEndDate = self._getDateAsString(o.prev_end_time, true);
					var newEndDate = self._getDateAsString(event.end_date, true);

					var confirmMessage = '<div><div class="pb5">' + translate('sdp.schedule.time.altered') + ' '  + translate('sdp.requestcatalog.reorder.save') + '</div>' + // NO I18N
                    translate('sdp.project.taskattribute.scheduledstarttime') + ': ' + oldStartDate + ' <strong>' + translate('sdp.common.to1') + '</strong> ' + newStartDate + '<br>' + // NO I18N
                    translate('sdp.project.taskattribute.scheduledendtime') + ': ' + oldEndDate + ' <strong>'+ translate('sdp.common.to1') + '</strong> ' + newEndDate + '</div>'; // NO I18N

                    if((oldStartDate !== newStartDate) || (oldEndDate != newEndDate)) {
                        showconfirm(true, 'title=' + translate('sdp.modified.time') + ',message=' + confirmMessage +  ',submitbutton=' + translate('sdp.admin.settings.yes') + ',cancelbutton=' + translate('sdp.admin.settings.no') + ',closebutton=no, closeOnEscKey=yes', function(boo) { //NO I18N
                            if (!boo) {
                                delete fields.start;
                                delete fields.end;
                            }

                                self._update_task(event, backup_origitem, fields);

                       });
                    } else {
                        self._update_task(event, backup_origitem, fields);
                    }

				} else {

					fields.start = 'scheduled_start_time'; //No I18n
					fields.end = 'scheduled_end_time'; //No I18n

					event.unscheduled = event.unscheduled ? false : event.unscheduled;

					self._before_inline_edit(event, backup_origitem, fields);
				}
			});
			
			eventId = scheduler.attachEvent("onEventCollision", function (ev, evs){
				return false;
			});
			o.attached_events.push(eventId);			

			eventId = scheduler.attachEvent("onEventDrag", function(dragId,dragMode,event){
				var tooltip = scheduler.tooltip;
				var task = scheduler.getEvent(dragId);
				var prev_start_date = new Date(o.prev_start_time).getTime();
				var prev_end_date = new Date(o.prev_end_time).getTime();
				var text = "<div class='res-drag-info' >";
				if(prev_start_date != task.start_date.getTime()  && prev_end_date == task.end_date.getTime()) {
					if(o.zoom_level == 'hours' || o.zoom_level == 'days'){
						text += sdpDate.format({"entire_date" : task.start_date , "type" : "HH:mm"}) + "</div>";
					} else {
						var date = sdpDate.format({"entire_date" : task.start_date , "type" : "DD"}); // NO I18N
						var month = sdpDate.format({"entire_date" : task.start_date , "type" : "MMM"}); // NO I18N
						text+= date + " " + month + " " + sdpDate.format({"entire_date" : task.start_date , "type" : "HH:mm"})+ "</div>";
					}
					tooltip.show(event,text);	//No I18N
				}
				else if(prev_start_date == task.start_date.getTime() && prev_end_date != task.end_date.getTime()) {
					if(o.zoom_level == 'hours' || o.zoom_level == 'days'){
						text += sdpDate.format({"entire_date" : task.end_date , "type" : "HH:mm"}) + "</div>";

					} else {
						var date = sdpDate.format({"entire_date" : task.end_date , "type" : "DD"}); // NO I18N
						var month = sdpDate.format({"entire_date" : task.end_date , "type" : "MMM"}); // NO I18N
						text+= date + " " + month + " " + sdpDate.format({"entire_date" : task.end_date , "type" : "HH:mm"})+ "</div>";
					}
					tooltip.show(event,text); //No I18N
				}
				var draggedElement = jQuery("[event_id='"+dragId+"']");
				if(draggedElement.length && dragMode == 'move'){
					var parentElement = draggedElement.parent();
					var minTop = 0;
					var maxTop = parentElement.height() - draggedElement.height() - 2;
					var parentTop = parentElement[0].getBoundingClientRect().top
					var top = event.pageY - parentTop - 1;
					top -= 5;
					top = (top < minTop) ? minTop : (top > maxTop) ? maxTop : top ;
					draggedElement.css({top : top});
				}
			});

			eventId = scheduler.attachEvent("onBeforeDrag", function (id, mode, e){
				if(id){
                    var task = scheduler.getEvent(id);
                        o.prev_start_time = task.start_date;
                        o.prev_end_time = task.end_date;
                    if(task.readonly){
                        return false;
                    }else{
                        return true;
                    }
				}
				return true;
			});
			o.attached_events.push(eventId);

			eventId = o.scheduler.attachEvent("onViewChange", function (new_mode , new_date){
				$.each(o.operational_hours, function (key, value) {
					delete value.total_op_mins;
				});

				//reset readonly_width
				delete o.readonly_width;

				self._load_readonly_tasks();

				//for all the events
				var state = o.scheduler.getState();
				var scheduler_events = o.scheduler.getEvents(state.min_date, state.max_date);
				var i = 0;
				for (i = 0; i < scheduler_events.length; i++) {
					var scheduler_event = scheduler_events[i];
					if (!scheduler_event.readonly) {
						self._set_scheduled_time(scheduler_event.origitem, scheduler_event);
					}
				}
			});




			//Event Handler for displaying the Edit Form
			o.scheduler.attachEvent("onClick", function (id, e) {
				//consider readonly events
				var event = o.scheduler.getEvent(id);
				window.schedulerEvent = event;
				var task = scheduler.getEvent(id);
				if (task.readonly) {
					return false;
				}

				if (event.origitem) {
					self._editItems(event);
				}
				return false;
			});

			jQBody.find("#navigation-menu input[type='radio'], #headerResetTheme").on("click", function() {
				setTimeout(function(){self._fix_technician_filter_position(); }, 1000);
			});

			o.scheduler.attachEvent("onDblClick", function (id, e) {
				return false;
			});

			scheduler.attachEvent("onDataRender", function () {
				if ($('.readonly-bar').find('.dhx_event_resize').length) {
					$('.readonly-bar').find('.dhx_event_resize').remove();
				}
			});

			scheduler.attachEvent("onCellClick", function (x_ind, y_ind, x_val, y_val, e) {
				if ($('.readonly-bar').find('.dhx_event_resize').length) {
					$('.readonly-bar').find('.dhx_event_resize').remove();
				}
			});

			//Event Handler for prepending event text with "Not scheduled" and its icon for  unscheduled events
			o.scheduler.attachEvent("onTemplatesReady", function () {
				o.scheduler.templates.event_bar_text = function (start, end, event) {
					if (event.readonly) {
						var total_op_hours;
						var op_hours;

						var state = scheduler.getState(); // TODO
						var h = translate("sdp.projects.daydiff.hour"); //NO I18N
						var m = translate("sdp.projects.daydiff.minute"); // NO I18N

						/* UI rendering part */
						var fullBarWidth = 100;
						var singleBarWidth = fullBarWidth / scheduler.matrix.timeline.x_size;
						var barHtml = "<table style='width:100%;border-collapse:collapse'><tr>";
						/* UI rendering part */

						var owners_tasks;
						/* Calculating op hours */
						// if(!o.owners_tasks){
						var tasks = scheduler.getEvents(state.min_date, state.max_date);
						//filter this owner's tasks
						var owners_tasks = tasks.filter(function (task) {
							return task.owner_id == event.owner_id;
						});
						// }


						var day_start = state.min_date;
						var day_end = new Date(day_start.getTime());

						var barWidth = parseInt($('.dhx_data_table')[0].clientWidth);
						var avgWidth = Math.floor(barWidth / scheduler.matrix.timeline.x_size);
						var modulus = barWidth % scheduler.matrix.timeline.x_size;
						var no_of_first_width_tds = scheduler.matrix.timeline.x;
						for (var i = 0,c = 0; i < scheduler.matrix.timeline.x_size; i++,c++) {
							if(jQuery("#zooming").val() == 'weeks'){
								no_of_first_width_tds = scheduler.matrix.timeline.x_size - modulus;
								total_op_hours = 0;
								op_hours = 0;
								var startDay = day_start.getDay();
								last_day = state.max_date;
								var remainingdays = 7 - startDay;
								var timeDiff = Math.abs(last_day.getTime() - day_start.getTime());
								var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
								if(diffDays < 7){
									remainingdays = last_day.getDay() - startDay;
								}

								var tdWidth = jQuery(".dhx_second_scale_bar:nth-child(" + (c + 1) + ")").width()
								i = i + remainingdays - 1;
								day_end = scheduler.date.add(day_start, remainingdays, scheduler.matrix.timeline.x_unit);

								//logic here
								var owners_tasks_for_current_time = self._get_events_between(day_start, day_end, owners_tasks);

								var total_op_minutes = self._calculate_total_op_hours_between(day_start, day_end, event.owner);
								total_op_hours = Math.floor(total_op_minutes / 60);
								var work_minutes = self._calculate_op_hours_between(day_start, day_end, owners_tasks_for_current_time);
								work_hours = Math.floor(work_minutes / 60);

								var percOrpx = 'px'; //No i18N

								var utilizationCss = (work_minutes > total_op_minutes) ? 'load-util-red' : 'load-util-blue';	//No I18N
								var utilizationTextCss = (work_minutes > total_op_minutes) ? 'load-util-text-red' : 'load-util-text-blue';	//No I18N

								var diffHrs = Math.floor(Math.abs((total_op_minutes - work_minutes)/60));
								var diffMins = Math.abs((total_op_minutes - work_minutes)%60);
								var workingHrsContent =  total_op_minutes ?  (diffHrs ? diffHrs+h : '') + ' ' + (diffMins ? diffMins + m: '') : '';     //NO I18N
								var padding = 'padding:0px;'; //No i18N
								var max_width = 'max-width:' + tdWidth + percOrpx + ';'; //No i18N
								var min_width = 'min-width:' + tdWidth + percOrpx + ';'; //No i18N
								var width = 'width:' + tdWidth + percOrpx + ';'; //No i18N
								var style = "style='" + padding + width + "'"; //No i18N
								var workingHrsSpan = total_op_minutes && (total_op_minutes != work_minutes) ? '<div data-totworkmin='+ work_minutes +' data-totopmin='+ total_op_minutes +' class="'+ utilizationCss +'"></div>' + '<span class="'+utilizationTextCss+'">'+workingHrsContent+ '</span>' : '';
								barHtml = barHtml + '<td' + ' ' + style + '>' + '<div class="disp-ib"> ' + workingHrsSpan + '</td>'; //No i18N
								day_start = scheduler.date.add(day_start, remainingdays, scheduler.matrix.timeline.x_unit);
							}
							else {
							total_op_hours = 0;
							op_hours = 0;

							day_end = scheduler.date.add(day_start, 1, scheduler.matrix.timeline.x_unit);

							var owners_tasks_for_current_time = self._get_events_between(day_start, day_end, owners_tasks);
								var tdWidth = jQuery(".dhx_scale_bar:nth-child(" + (c + 1) + ")").width()

							var total_op_minutes = self._calculate_total_op_hours_between(day_start, day_end, event.owner);
							total_op_hours = Math.floor(total_op_minutes / 60);
								var work_minutes = self._calculate_op_hours_between(day_start, day_end, owners_tasks_for_current_time);
								work_hours = Math.floor(work_minutes / 60);

							var percOrpx = 'px'; //No i18N
								var utilizationCss = (work_minutes > total_op_minutes) ? 'load-util-red' : 'load-util-blue';	//No I18N
								var utilizationTextCss = (work_minutes > total_op_minutes) ? 'load-util-text-red' : 'load-util-text-blue';	//No I18N

								var diffHrs = Math.floor(Math.abs((total_op_minutes - work_minutes)/60));
								var diffMins = Math.abs((total_op_minutes - work_minutes)%60);
								var workingHrsContent =  total_op_minutes ?  (diffHrs ? diffHrs+h : '') + ' ' + (diffMins ? diffMins + m: '') : '';     //NO I18N
							var padding = 'padding:0px;'; //No i18N
							var width = 'width:' + tdWidth + percOrpx + ';'; //No i18N
								var style = "style='" + padding + width + "'"; //No i18N
								var workingHrsSpan = total_op_minutes && (total_op_minutes != work_minutes) ? '<div data-totworkmin='+ work_minutes +' data-totopmin='+ total_op_minutes +' class="'+ utilizationCss +'"></div>' + '<span class="'+utilizationTextCss+'">'+workingHrsContent+ '</span>' : '';
							barHtml = barHtml + '<td' + ' ' + style + '>' + '<div class="disp-ib"> '+ workingHrsSpan + '</div></td>'; //No i18N
							day_start = scheduler.date.add(day_start, 1, scheduler.matrix.timeline.x_unit);
						}
						}

						barHtml += "</tr></table>";
						return barHtml;
					}
					return event.text;
				};

				o.scheduler.templates.timeline_second_scale_date = function (date) {
					var month = sdpDate.format({"entire_date" : date , "type" : "MMMM"}); // NO I18N					// NO I18N
					var year = sdpDate.format({"entire_date" : date , "type" : "YY"}); // NO I18N
					return month + " '" + year;
				};

				o.scheduler.templates.year_tooltip = function (start, end, event) {
					if (event.unscheduled) {
						return "<b>" + getMessageForKey('sdp.scheduler.notscheduled)') + "</b> - " + event.text;
					}
					return event.text;
				}
			});
			o.attached_events.push(eventId);

		},

		_update_task: function(event, backup_origitem, fields) {
			var self = this;
			//Start and End time change
			event.origitem[fields.start] = self._get_as_date(event.start_date.getTime());
			event.origitem[fields.end] = self._get_as_date(event.end_date.getTime());

			self._before_inline_edit(event, backup_origitem, fields);
		},

		_remove_all_events : function(){
			var self = this;
			var o = self.options;

			jQuery.each(o.attached_events, function(index, val){
				scheduler.detachEvent(val);
			});
		},

		_init_scheduler_with_other_config: function (callback) {

			var self = this;
			var o = self.options;

			self._get_op_hours();
			self._get_holidays();

			o.scheduler.config.load_date = "%d %M, %Y"; //NO I18N
			o.scheduler.init('scheduler_container', new Date(), "timeline"); //No I18N
			$('#scheduler_container .dhx_cal_navline').show();
			self._fullscreen_config();
			self._fullscreen_tooltip();

			self._load_op_hrs_and_holidays();

			if(o.start_date) {
				o.scheduler.setCurrentView(new Date(o.start_date));
			}

			var timeline_owners = scheduler.serverList('sections'); //No I18N
			if (!timeline_owners.length && !o.show_unassigned_tasks) {
				o.show_unassigned_tasks = true;
				self._set_personalization({ show_unassigned_tasks: true });
			}

			// Apply timespan for excluded days among all over the technicians
			var state = o.scheduler.getState();
			for(var i=0; i<timeline_owners.length; i++){
				self._apply_marked_timespan_for_excluded_days(state.min_date, state.max_date, timeline_owners[i].key, self._get_user_site_for_index(timeline_owners[i].orig));
			}
			self._config_tooltip_actions();
			self._config_prev_next_buttons();
			self._initiate_res_filters(function() {
				if(o.show_unassigned_tasks) {
					self.handle_unassigned(null, o.show_unassigned_tasks);
				}

				if(o.show_unscheduled_tasks) {
					self.handle_all_unscheduled(null, o.show_unscheduled_tasks);
				}
			self.change_bar_color();
			self._fix_date_position();
			self._fix_technician_filter_position();
            if(!o.scheduler.expanded) {
                if(o.current_tab === "home") {
                var height = jQuery(".project-sch-footer").position().top - jQuery(".headerbar")[0].getBoundingClientRect().bottom;
                jQuery(".project-sch-container").height(height);
                jQuery(".project-sch-footer").width(jQuery(".headerbar").width());
                } else if(o.current_tab === "projects") { // NO I18N
                    if(o.projectId) {
                        var height = jQuery(".project-sch-footer").position().top - jQuery("[data-id=ui-tabs1-pos]")[0].getBoundingClientRect().bottom - 14;
                        jQuery(".project-sch-container").height(height);
                        jQuery(".project-sch-footer").width(jQuery("#ui-framework-design1").width() - 40);
                    } else {
                        var height = jQuery(".project-sch-footer").position().top - jQuery("#ui-framework-design1")[0].getBoundingClientRect().bottom;
                        jQuery(".project-sch-container").height(height);
                        jQuery(".project-sch-footer").width(jQuery("#ui-framework-design1").width() - 20);
                    }
                }
            }
			callback();
			});


			$(".dhx_cal_navline").css("display", "block");

		},

		_getDateAsString: function(longDate, isTimeNeeded) {
			var date = sdpDate.format({"entire_date" : longDate , "type" : "DD"}); // NO I18N
			var month = sdpDate.format({"entire_date" : longDate , "type" : "MMM"}); // NO I18N
			var year = sdpDate.format({"entire_date" : longDate , "type" : "YYYY"}); // NO I18N
			var time = isTimeNeeded? sdpDate.format({"entire_date" : longDate , "type" : "hh:mm"}) : ""; //NO I18N
			var startTimeOfDay = isTimeNeeded? sdpDate.format({"entire_date" : longDate , "type" : "A"}) : ""; // NO I18N
			return (month + " " + date + " " + year + " " + time + " " + startTimeOfDay).trim();
		},

		_config_tooltip_actions: function () {

			var self = this;
			var o = self.options;

			$(document).on('click', '.sdp-gantt-tooltip .tt-actions a span', function () {
				var input = $(this);
				var id = input.attr('task_id'); //No I18N
				if (id) {
					o.scheduler.dhtmlXTooltip.hide();
					var event = o.scheduler.getEvent(id);

					if (event) {
						if (input.hasClass('edit-ico')) {
							self._editItems(event);
						} else if (input.hasClass('delete-ico')) { //NO I18N
							self._delete_item(event);
						} else if (input.hasClass('smartview-ico')) { //NO I18N
							self._details_view(event);
						}
					}
				}
			});
		},

		_change_scheduled_time_on_prev_next : function(){
			var self = this;
			var o = self.options;
			//change timeframe for all unscheduled tasks
			var state = scheduler.getState();
			var scheduler_events = scheduler.getEvents(state.min_date, state.max_date);
			var i=0;
			for(i=0; i<scheduler_events.length; i++){
				var scheduler_event = scheduler_events[i];
				if(!scheduler_event.readonly){
					self._set_scheduled_time(scheduler_event.origitem,scheduler_event);
				}

				//o.scheduler.updateEvent(scheduler_event.id);
			}
		},

		_config_prev_next_buttons: function () {
			var self = this;

			var o = self.options;
			//Previous button click
			o.scheduler._click.dhx_cal_prev_button = function () {
				scheduler._click.dhx_cal_next_button(0, -1);
			};
			o.scheduler._els.dhx_cal_prev_button[0].onclick = scheduler._click.dhx_cal_prev_button;
			//Next  button click
			o.scheduler._click.dhx_cal_next_button = function (dummy, step) {
				self.showProgressBar();
				var start_date;
				var end_date;
				if (step && step < 0) { //for prev button
					end_date = scheduler.date[scheduler._mode + "_start"](scheduler._date);
					start_date = scheduler.date.add(scheduler.date[scheduler._mode + "_start"](scheduler._date), step, scheduler._mode);
				} else { //for next button
					start_date = scheduler.date.add(scheduler.date[scheduler._mode + "_start"](scheduler._date), 1, scheduler._mode);
					end_date = scheduler.date.add(scheduler.date[scheduler._mode + "_start"](scheduler._date), 2, scheduler._mode);
				}

				//get scheduled events for the given start and end date
				self._load_tasks(start_date, end_date, o.show_unscheduled_tasks, function() {
					self._load_readonly_tasks(start_date, end_date);

					var state = o.scheduler.getState();
					var scheduler_events = o.scheduler.getEvents(state.min_date, state.max_date);
					var i = 0;
					for (i = 0; i < scheduler_events.length; i++) {
						var scheduler_event = scheduler_events[i];
						if (!scheduler_event.readonly) {
							self._set_scheduled_time(scheduler_event.origitem, scheduler_event,start_date, end_date);
						}
					}
					o.scheduler.updateView(scheduler.date.add(scheduler.date[scheduler._mode + "_start"](scheduler._date), (step || 1), scheduler._mode)); //NO I18N
					self.hideProgressBar();
					self._set_personalization(null, true);
				});
			};
			scheduler._els.dhx_cal_next_button[0].onclick = scheduler._click.dhx_cal_next_button;

		},

		_init_timeline_view_with_config: function () {

			var self = this;
			var o = self.options;

			//To add total working hours of tech in that view (appended with their name)
			o.scheduler.templates.timeline_scale_label = function (key, label, section) {

				var state = scheduler.getState();

				var work_minutes = self._calculate_op_mins(section);

				var owner = section.orig;
				var owner_site_id = self._get_user_site_for_index(owner);
				var image_token = section.image_token;

				// Apply timespan for excluded days for each technician (Triggers on any change in the UI)
				self._apply_marked_timespan_for_excluded_days(state.min_date, state.max_date, section.key, owner_site_id);

				if(o.operational_hours[owner_site_id]){
					o.operational_hours[owner_site_id].total_op_mins = self._calculate_total_op_mins(owner);
				} else {
					o.operational_hours[0].total_op_mins = self._calculate_total_op_mins(owner);
				}

				//var total_hrs = state.max_date - state.min_date;
				var total_op_minutes = o.operational_hours[owner_site_id]? o.operational_hours[owner_site_id].total_op_mins : o.operational_hours[0].total_op_mins;

				var utilizationTextCss = (work_minutes > total_op_minutes) ? 'text-danger ' : '';	//No I18N
				var work_hrs = Math.floor(work_minutes/60);
				var total_op_hrs = Math.floor(total_op_minutes/60);

				var rtm_total_time=jQuery("<div class='rtm_total_time_show "+ utilizationTextCss +"'><span class='" + utilizationTextCss +"sb'>" + translate('sdp.utilization.load') + " - "+ work_hrs + '/' + total_op_hrs + " " + translate('sdp.requests.view.short.hour') + "</span></div>");
				var return_html = "";
				//return_html = "<table class='timeline-cell-inner'><tr><td>";

				if (section.key == 'not-assigned') {
					var totalTaskCount = section.sch_tasks.length + section.unsch_tasks.length;
					return_html =  "<span class='rtm-user-name text-overflow'>"+  encodeHTML(section.label) + ' ' + "<span style='font-weight: bold'>(" + totalTaskCount + ")</span></span>";		//No I18n
				} else {
                    var profileObj=owner.profile_pic;
				    var photo_url = profileObj["content-url"];// NO I18N
				    if(photo_url.startsWith("/api/v3")){
				        photo_url = photo_url +"?key=" + image_token; //No I18N
				    }
			   		var photoSpan = '<span class="disp-c pos-rel mr5 usr-icon-block"><span style="background-size: contain;" class="user-circle vtop pos-abs top-4"><img style="height: 100%" class="fw whitebg img-circle" src=' + photo_url + '></span></span><div class="disp-c pl10 vtop"><span class="rtm-user-name text-overflow tl">' + encodeHTML(section.label) + '</span>' + rtm_total_time.prop("outerHTML") + '</div>'
			   		return photoSpan;
				}

				return return_html;
			};

			//Custom Tooltip Generation
			o.scheduler.templates.tooltip_text = function (start, end, event) {
				if (event.readonly) {
					return '';
				}
				var toolitp_template = $('#sdp-tooltip-template').clone();
				var classprefix = 'task'; //No I18N

				toolitp_template.find('div.sdp-gantt-tooltip').addClass(classprefix + '-tooltip');
				toolitp_template.find('div.tt-id').text(translate('sdp.task.taskid') + " #" + event.id); //No I18N
				toolitp_template.find('div.tt-main-info h1').html(event.text);
				if (event.origitem.status != null) {
					toolitp_template.find('span.svalue').text(event.origitem.status.name); //No I18N
					toolitp_template.find('span.scolor').css("background-color", event.origitem.status.color); //No I18N
				}
				if (event.origitem.priority) {
					toolitp_template.find('span.pvalue').text(event.origitem.priority.name); //No I18N
					toolitp_template.find('span.pcolor').css("background-color", event.origitem.priority.color); //No I18N
				}
				var sch_time = "";
				sch_time = event.origitem.scheduled_start_time? event.origitem.scheduled_start_time.display_value : "-";
				sch_time = sch_time + " - ";
				sch_time += event.origitem.scheduled_end_time? event.origitem.scheduled_end_time.display_value : "-";
				toolitp_template.find('td.sch-value').text(sch_time);

				var act_time = "";
				act_time = event.origitem.actual_start_time? event.origitem.actual_start_time.display_value : "-";
				act_time = act_time + " - ";
				act_time += event.origitem.actual_end_time? event.origitem.actual_end_time.display_value : "-";
				toolitp_template.find('td.act-value').text(act_time);

				//Getting owner name from available resources
				var resourceElements = self._get_resources_as_obj();
				var ownername;
				if (event.owner != null) {
					for (var i = 0; i < resourceElements.length; i++) {
						if (event.owner.id === resourceElements[i].key) {
							ownername = encodeHTML(resourceElements[i].label);
							break;
						}
					}
				}
				toolitp_template.find('td.owner-value').html((event.owner == null) ? getMessageForKey('sdp.common.notassigned') : ownername); //No I18N

				if(isMSPOrSCP)
				{
					let popupAccValue = (event.origitem.account)?event.origitem.account.name:getMessageForKey('sdp.common.notassigned');
					toolitp_template.find('td.account-value').text(popupAccValue); //No I18N
				}

				//setting parent and parent id
				var href;
				toolitp_template.find('td.project-label').html(translate("common." + event.parent));

				if (event.parent == 'general') {
					toolitp_template.find('#row-project-title').hide();
					toolitp_template.find('#row-milestone-title').hide();
				} else {
					var html;
					if (event.parent == 'request') {
						html = '<a target="_blank" href="/WorkOrder.do?woMode=viewWO&woID=' + event[event.parent].id + '">' + encodeHTML(event[event.parent].subject) + '</a>'; //No I18N
					} else if (event.parent == 'project') { //No I18N
						html = '<a target="_blank" href="/ProjectAction.do?submitaction=ViewProject&fromListView=true&projectid=' + event[event.parent].id + '">' + encodeHTML(event[event.parent].title) + '</a>'; //No I18N
					} else if (event.parent == 'milestone') { //No I18N
						html = '<a target="_blank" href="/MileStoneAction.do?submitaction=ViewMileStone&milestoneid=' + event[event.parent].id + '">' + encodeHTML(event[event.parent].title) + '</a>'; //No I18N
					} else if (event.parent == 'change') { //No I18N
						html = '<a target="_blank" rel="noopener" href="/ui/changes?entity_id='+event[event.parent].id+'&mode=detail">' + encodeHTML(event[event.parent].title) + '</a>'; //No I18N
					} else if (event.parent == 'problem') { //No I18N
						html = '<a target="_blank" rel="noopener" href="/ui/problems?mode=detail&entity_id=' + event[event.parent].id + '">' + encodeHTML(event[event.parent].title) + '</a>'; //No I18N
					} else if (event.parent == 'release') { //No I18N
						html = '<a target="_blank" href="/ui/releases?entity_id='+ event[event.parent].id + '&mode=detail">' + encodeHTML(event[event.parent].title) + '</a>'; //No I18N
					}else {
						html = event[event.parent].id;
					}

					toolitp_template.find('td.project-value').html(html);

					//toolitp_template.find('td.project-value').html(event[event.parent].id);//No I18N
					if (event.parent == 'milestone') {
						toolitp_template.find('td.milestone-label').html(translate("common.project")); //No I18N
						toolitp_template.find('td.project-label').html(translate("sdp.project.heading.milestone"));
						toolitp_template.find('td.milestone-value').html('<a target="_blank" href="/ProjectAction.do?submitaction=ViewProject&fromListView=true&projectid=' + event[event.grandparent].id + '">' + encodeHTML(event[event.grandparent].title) + '</a>'); //No I18N
					} else {
						toolitp_template.find('#row-milestone-title').hide();
					}
				}
				//setting parent finished


				toolitp_template.find('.print-icon').addClass(classprefix + '-print-icon');
				toolitp_template.find('.tt-actions a span').attr('task_id', event.id);

				var titleString = toolitp_template.html();
				return titleString;
			};

			o.scheduler.templates.date_format = function (date, event) {
				var format = o.date_format;
				if (o.time_format) {
					format = o.time_format;
				}
				if (date !== null) {
					var formatFunc = o.scheduler.date.date_to_str(format);
					return formatFunc(date);
				} else {
					return "-";
				}
			};

			//Hide unscheduled tasks
			o.scheduler.filter_timeline = function (id, event) {
				if (event.unscheduled && !o.show_unscheduled_tasks) {
					return false;
				}
				return true;
			};

			o.scheduler.templates.timeline_date = function (startDate, endDate) {

				var formatFunc = o.scheduler.date.date_to_str(o.date_format);
				var calendarComponent = '<span class="pos-rel" data-rescalendarstart="true" style="line-height: 31px"> <input class="pos-abs" type="hidden" id="date_select" name="date_range">  <input class="pos-abs" type="text" style="width:0px; height:0px;" readonly="true" class="form-control" id="date_select_Display" >   <input class="pos-abs" type="text" style="width:0px;height:0px;" readonly="true" class="form-control" id="date_range_select" >      <a href="/"><span class="cspr calendar pos-rel top2" title="' + translate("sdp.date.chooser") + '" style="vertical-align:unset" alt="Date Chooser"></span></a>      </span>';
				var dateString = '';
				if (o.zoom_level == 'hours') {
					var date = sdpDate.format({"entire_date" : startDate , "type" : "DD"}); // NO I18N
					var month = sdpDate.format({"entire_date" : startDate , "type" : "MMM"}); // NO I18N
					var year = sdpDate.format({"entire_date" : startDate , "type" : "YYYY"}); // NO I18N
					// dateString = formatFunc(startDate);

					dateString = month + " " + date + ", " + year;
				} else {
				    var calendarEndComponent = '<span class="pos-rel" data-rescalendarend="true" style="line-height: 31px"> <input class="pos-abs" type="hidden" id="date_select_end" name="date_range_end">  <input class="pos-abs" type="text" style="width:0px; height:0px;position: absolute;" readonly="true" class="form-control" id="date_select_end_Display" >   <input class="pos-abs" type="text" style="width:0px;height:0px;" readonly="true" class="form-control ml5" id="date_range_select_end" >      <a href="/"><span class="cspr calendar pos-rel top2" title="' + translate("sdp.date.chooser") + '" style="vertical-align:unset" alt="Date Chooser"></span></a>      </span>';
					var toDate = scheduler.date.add(endDate, -1, "day"); //No i18N
					var startdate = sdpDate.format({"entire_date" : startDate , "type" : "DD"}); // NO I18N
					var startmonth = sdpDate.format({"entire_date" : startDate , "type" : "MMM"}); // NO I18N
					var startyear = sdpDate.format({"entire_date" : startDate , "type" : "YYYY"}); // NO I18N
					var enddate = sdpDate.format({"entire_date" : toDate , "type" : "DD"}); // NO I18N
					var endmonth = sdpDate.format({"entire_date" : toDate , "type" : "MMM"}); // NO I18N
					var endyear = sdpDate.format({"entire_date" : toDate , "type" : "YYYY"}); // NO I18N

					dateString = startmonth + " " + startdate + ", " + startyear+ '<span class="ml5 mr5">&ndash;</span>' + calendarEndComponent + endmonth + " " + enddate + ", " + endyear; //No i18N
				}
                jQuery("#scheduler_container").off("click.datestart").on("click.datestart", "[data-rescalendarstart='true']", function(){ //NO I18N
                    jQuery("#scheduler_container").scheduler("construct_date_filter","date_select","date_range_select"); //NO I18N
                });
                jQuery("#scheduler_container").off("click.dateend").on("click.dateend", "[data-rescalendarend='true']", function(){ //NO I18N
                    jQuery("#scheduler_container").scheduler("construct_date_filter","date_select_end","date_range_select_end"); //NO I18N
                });
				return calendarComponent + dateString;
			};

			o.scheduler.templates.timeline_cell_class = function(evs, date, section){
				if( o.zoom_level == 'weeks'){
					total_op_hours = 0;
					op_hours = 0;
					var startDay = date.getDay();
					if(startDay == 0){
						return "week-start"; // NO I18N
					} else if(startDay == 6){
						return "week-end"; // NO I18N
					} else {
						return "week-day" // NO I18N
					}
				}
			}
		},

		//For initializing the timeline view
		_create_timeline_view: function (xunit, xdate, xstep, xsize, xstart, xlength, yunit, yproperty, secondscaleunit, secondscaledate) {
			var self = this;
			var o = self.options;
			o.scheduler.createTimelineView({
				section_autoheight: true,
				name: "timeline", //No I18N
				x_unit: xunit,
				x_date: xdate,
				x_step: xstep,
				x_size: xsize,
				x_start: xstart,
				x_length: xlength,
				y_unit: o.scheduler.serverList("sections", yunit), //No I18n
				y_property: yproperty,
				render: "tree", //No I18N
				folder_dy: 35,
				dy: 60,
				second_scale: {
					x_unit: secondscaleunit,
					x_date: secondscaledate
				},
				sort: function (a, b) {
					if (a.readonly) {
						return -1;
					} else if (b.readonly) {
						return 1;
					} else {
						if (a.start_date.valueOf() == b.start_date.valueOf()) {
							return 0;
						}
						return a.start_date > b.start_date ? 1 : -1;
					}
				}
			});
		},

		_load_all_tasks: function () {
			var self = this;
			var o = self.options;

			var state = o.scheduler.getState();
			var start_date = state.min_date;
			var end_date = state.max_date;
			var show_unscheduled = o.show_unscheduled_tasks;

			//load scheduled tasks
			var opts = {
				load_unscheduled: false,
				start_date: start_date,
				end_date: end_date
			};
			self._load_tasks_by_owner(opts);

			//load scheduled tasks
			if (o.show_unscheduled_tasks) {
				opts = {
					load_unscheduled: true
				};
				self._load_tasks_by_owner(opts);

			}
		},

		_initiate_res_filters: function (callback) {
			var self = this;
			var o = self.options;

			if (o.current_tab == 'projects') {
				o.filtered_module = [];
				$("[name='predefined-module-filter']").each(function (key, value) {
					o.filtered_module.push(this.value);
				});
				self.set_task_custom_filter(callback); //this populate tasks without custom filter
			} else {
				self._init_task_filter();
				self.set_task_custom_filter(callback); //this populate tasks without custom filter
			}
		},

		set_task_custom_filter: function (callback) {
			var self = this;
			var o = self.options;
			self._clear_all();
			self.refresh_scheduler_by_owner(undefined, function() { //loading tasks here
			self._load_readonly_tasks();
				callback();
			});
		},

		_get_personalized_data_and_create_timeline_view: function (callback) {
			var self = this;
			var o = self.options;

			var searchKey = 'res_filter'; //No I18N
			if (o.current_tab == 'projects') {
				searchKey = 'res_filter_proj'; //No I18N
			}
			//get personalized res filter
			if (o.current_tab != "projects") {
				delete o.res_filter;
				var data = getPersonalizeData('res_mgmt'); //NO I18N
				o.personalizedData = data;
				var personalizedData = getPersonalizeData("taskview_sidebar"); //NO I18N
				var filterId;
				if (personalizedData != null) {
					filterId = (personalizedData.list_info && personalizedData.list_info.filter_by) ? personalizedData.list_info.filter_by.id : null;
				}
				self.options.filter = {
					id: filterId
				}

				o.res_filter = data;
				o.task_filter = personalizedData;

			} else {
				var data = getPersonalizeData('res_mgmt_proj'); //NO I18N
				o.personalizedData = data;
				o.res_filter = data;

				if(o.projectId) {
					o.res_filter.resource = undefined;
				}
			}

			o.show_unassigned_tasks = data.show_unassigned_tasks;
			o.show_unscheduled_tasks = data.show_unscheduled_tasks;
			o.start_date = data.starting_date? data.starting_date: null;
			o.end_date = data.ending_date? data.ending_date: null;
			o.zoom_level = data.zoom_level? data.zoom_level: "hours"; // NO I18N

			self._get_users_and_init_timeline(callback);

		},

		_get_users_and_init_timeline: function (callback) {

			var self = this;
			var o = self.options;

			//get users for scheduler with required ids
			var timeline_owners = self._get_users();
			self._create_timeline_view("minute", "%H:%i", 60, 24, 0, 24, timeline_owners, "owner_id", "day", "%j %F"); //No I18N

			self._time_period_config(o.zoom_level, o.start_date, o.end_date);
			self._init_timeline_view_with_config();
			self._init_scheduler_with_other_config(callback);
		},

		_set_filters_with_personalization_data: function () {
			var self = this;
			var o = self.options;

			var site,group,resource;
			var data = o.res_filter;

			if(!isMSP || !o.res_filter.comboAccount || o.res_filter.comboAccount == getAccountId())
			{
			if(data && !o.projectId) {
				site = data.site;
				group = data.group;
				resource = data.resource;
			} else {
				resource = o.project_members;
			}
			}


			var url, criteria, params;
			var listInfo = {
				'start_index': 1, //NO I18N
				'row_count': 10 //NO I18N
			};


			if (o.current_tab == 'projects') {
				//res get
				var field = "user.id"; // NO I18N

				if (resource && resource.length) {
					url = self._get_resource_url();
					criteria = {
						field: field, // No I18N
						condition: 'is', // No I18N
						values: resource
					};
					listInfo.search_criteria = criteria;
					// var params = getAsInputData({
					// 	list_info: listInfo
					// });


					var dataVal = sdpAjaxInputData({
						"list_info": listInfo //NO I18N
					});
					sdpAjax({
						url: url,
						type: "GET", //NO I18N
						data: dataVal,
						acceptODCompatible: true,
						success: function (data) {
							var resourcesWithName = [];
							$.each(data[o.resource], function (key, item) {
								item = item.user;
								resourcesWithName.push({
									id: item.id,
									name: item.name,
									orig: item
								});
							});
							$('.popover #res-select').select2('data', resourcesWithName); //No I18N
						},
						async: false
					});


				}

			} else {
				//site get
				if (site && site != '') {
					url = self._get_sites_url();

					criteria = {
						field: 'id', // No I18N
						condition: 'is', // No I18N
						value: site
					};
					listInfo.search_criteria = criteria;
					var dataVal = sdpAjaxInputData({
						"list_info": listInfo, //NO I18N
						"for": "resource_mgmt" // NO I18N
					});
					sdpAjax({
						url: url,
						type: "GET", //NO I18N
						data: dataVal,
						skipSUBREQUEST:true,
						acceptODCompatible: true,
						success: function (data) {
							var resultSite = data.site[0];
							if(resultSite.id == -1) {
								if(isMSP)
								{
									return;
								}
								resultSite.name = translate("common.site.nosite");
							}
							$('.popover #site-select').select2('data', { //NO I18N
								id: resultSite.id,
								name: resultSite.name,
								orig: resultSite
							});
						},
						async: false
					});
				}

				//groups get
				if (group && group.length) {
					url = self._get_groups_url();
					criteria = {
						field: 'id', // No I18N
						condition: 'is', // No I18N
						values: group
					};
					listInfo.search_criteria = criteria;
					var dataVal = sdpAjaxInputData({
						"list_info": listInfo, //NO I18N
						"for": "resource_mgmt" // NO I18N
					});
					sdpAjax({
						url: url,
						type: "GET", //NO I18N
						skipSUBREQUEST:true,
						acceptODCompatible: true,
						data: dataVal,
						success: function (data) {
							var groupsWithName = [];
							$.each(data.group, function (key, item) {
								var name = item.name;
								if(item.site) {
									name += " (" + item.site.name + ")"
								}
								groupsWithName.push({
									id: item.id,
									name: name,
									orig: item
								});

							});
							$('.popover #group-select').select2('data', groupsWithName); //No I18N
						},
						async: false
					});

				}

				//res get
				if (resource && resource.length) {
					url = self._get_resource_url();
					criteria = {
						field: 'id', // No I18N
						condition: 'is', // No I18N
						values: resource
					};
					listInfo.search_criteria = criteria;

					var dataVal = sdpAjaxInputData({
						"list_info": listInfo //NO I18N
					});
					sdpAjax({
						url: url,
						type: "GET", //NO I18N
						data: dataVal,
						skipSUBREQUEST:true,
						acceptODCompatible: true,
						success: function (data) {
							var resourcesWithName = [];
							$.each(data[o.resource], function (key, item) {
								resourcesWithName.push({

									id: item.id,
									name: item.name,
									orig: item
								});
							});
							$('.popover #res-select').select2('data', resourcesWithName); //No I18N
						},
						async: false
					});
				}
			}


		},



		_calculate_total_op_mins: function (owner) {
			var self = this;
			var o = self.options;

			var state = scheduler.getState();
			var owner_site_id = self._get_user_site_for_index(owner);
			var now = new Date(state.min_date);
			now.setHours(0, 0, 0, 0);
			var total_time_in_millis = 0;
			var operational_hours, break_mins, operational_mins, op_millis, current_day, days_of_operation;
			//Both start and having 00:00 as start time. so, <= check considers additional one day
			while (now < state.max_date) {
				if(!(self._is_tech_weekend(now, owner_site_id) || self._is_tech_holiday(now, owner_site_id) || self._is_excluded_day(now, owner_site_id))){
					days_of_operation = o.operational_hours[owner_site_id]? o.operational_hours[owner_site_id].operational_hours.days_of_operation : o.operational_hours[0].operational_hours.days_of_operation;
					current_day = self._find_day_index(now, days_of_operation);
					operational_hours = days_of_operation[current_day].hours_of_operation;
					break_mins = ((operational_hours.break_end_time.hours * 60) + operational_hours.break_end_time.minutes) - ((operational_hours.break_start_time.hours * 60) + operational_hours.break_start_time.minutes);
					operational_mins = ((operational_hours.end_time.hours * 60) + operational_hours.end_time.minutes) - ((operational_hours.start_time.hours * 60) + operational_hours.start_time.minutes) - break_mins;
					op_millis = operational_mins * 60 * 1000;
					total_time_in_millis += op_millis;
				}
				//loop increment
				now.setDate(now.getDate() + 1);
			}
			return Math.floor(total_time_in_millis / (1000 * 60));
		},

		_calculate_op_mins : function(section){
			var self = this;
			var o = self.options;

			var owner = section.orig;
			var owner_site_id = self._get_user_site_for_index(owner);
			var operational_hours;

			var state = scheduler.getState();
			var millis = 0;

			var evs = scheduler.getEvents(state.min_date, state.max_date);
			section.unsch_tasks = [];
			section.sch_tasks = [];
			for (var i = 0; i < evs.length; i++) {
				var ev = evs[i];
				if (ev.owner_id == section.key && !ev.readonly) {

					if (ev.unscheduled) {
						section.unsch_tasks.push(ev.id);

					} else {
						section.sch_tasks.push(ev.id);

						//calculate start and end for this view
						var start_time_for_this_view = (ev.start_date < state.min_date) ? state.min_date : ev.start_date;
						var end_time_for_this_view = (ev.end_date > state.max_date) ? state.max_date : ev.end_date;

						var ev_start = start_time_for_this_view;
						var ev_end = end_time_for_this_view;
						var now = new Date(ev_start);

						now.setHours(0, 0, 0, 0);

						//can calculate this from total op hours
						while (now <= ev_end) {
							var is_it_holiday = self._is_tech_holiday(now, owner_site_id);
							var is_it_weekend = self._is_tech_weekend(now, owner_site_id);

							if (!is_it_holiday && !is_it_weekend && !self._is_excluded_day(now, owner_site_id)) {
								var days_of_operation = o.operational_hours[owner_site_id]? o.operational_hours[owner_site_id].operational_hours.days_of_operation : o.operational_hours[0].operational_hours.days_of_operation;
								var current_day = self._find_day_index(now, days_of_operation);
								operational_hours = days_of_operation[current_day].hours_of_operation;
								var break_mins = ((operational_hours.break_end_time.hours * 60) + operational_hours.break_end_time.minutes) - ((operational_hours.break_start_time.hours * 60) + operational_hours.break_start_time.minutes);
								var operational_mins = ((operational_hours.end_time.hours * 60) + operational_hours.end_time.minutes) - ((operational_hours.start_time.hours * 60) + operational_hours.start_time.minutes) - break_mins;
								millis += (operational_mins * 60 * 1000);
							}

							//loop increment
							now.setDate(now.getDate() + 1);
						}

						//==============adjust start op_hours=============//
						if (!(self._is_tech_weekend(ev_start, owner_site_id) || self._is_tech_holiday(ev_start, owner_site_id) || self._is_excluded_day(ev_start, owner_site_id))){

							var days_of_operation = o.operational_hours[owner_site_id]? o.operational_hours[owner_site_id].operational_hours.days_of_operation : o.operational_hours[0].operational_hours.days_of_operation;
							var current_day = self._find_day_index(ev_start, days_of_operation);
							operational_hours = days_of_operation[current_day].hours_of_operation;
							var op_hrs_start = new Date(ev_start);
							op_hrs_start.setHours(operational_hours.start_time.hours, operational_hours.start_time.minutes, 0, 0);
							var op_hrs_end = new Date(ev_start);
							op_hrs_end.setHours(operational_hours.end_time.hours, operational_hours.end_time.minutes, 0, 0);

							var op_break_hrs_start = new Date(ev_start);
							op_break_hrs_start.setHours(operational_hours.break_start_time.hours, operational_hours.break_start_time.minutes, 0, 0);
							var op_break_hrs_end = new Date(ev_start);
							op_break_hrs_end.setHours(operational_hours.break_end_time.hours, operational_hours.break_end_time.minutes, 0, 0);

							if (ev_start > op_hrs_start && ev_start < op_hrs_end){

							 	if(ev_start > op_break_hrs_start && ev_start < op_break_hrs_end) {
									//started inbetween of operational break hours
									millis -= (op_break_hrs_start - op_hrs_start);
								}
								else if(ev_start >= op_break_hrs_end){
									//started after operational break hours
									millis -= ((ev_start - op_break_hrs_end) + (op_break_hrs_start - op_hrs_start));
								}
								else{
									//started before operational break hours
									millis -= (ev_start - op_hrs_start);
								}
							}
							else if (ev_start > op_hrs_start) {
								//subtract op_hrs
								var break_mins = ((operational_hours.break_end_time.hours * 60) + operational_hours.break_end_time.minutes) - ((operational_hours.break_start_time.hours * 60) + operational_hours.break_start_time.minutes);
								var operational_mins = ((operational_hours.end_time.hours * 60) + operational_hours.end_time.minutes) - ((operational_hours.start_time.hours * 60) + operational_hours.start_time.minutes) - break_mins;
								millis -= (operational_mins * 60 * 1000);

							}
						}

						//==============adjust end op_hours=============//


						if (!(self._is_tech_weekend(ev_end, owner_site_id) || self._is_tech_holiday(ev_end, owner_site_id) || self._is_excluded_day(ev_end, owner_site_id))) {

							var days_of_operation = o.operational_hours[owner_site_id]? o.operational_hours[owner_site_id].operational_hours.days_of_operation : o.operational_hours[0].operational_hours.days_of_operation;
							var current_day = self._find_day_index(ev_end, days_of_operation);
							operational_hours = days_of_operation[current_day].hours_of_operation;
							var op_hrs_start = new Date(ev_end);
							op_hrs_start.setHours(operational_hours.start_time.hours, operational_hours.start_time.minutes, 0, 0);
							var op_hrs_end = new Date(ev_end);
							op_hrs_end.setHours(operational_hours.end_time.hours, operational_hours.end_time.minutes, 0, 0);

							var op_break_hrs_start = new Date(ev_end);
							op_break_hrs_start.setHours(operational_hours.break_start_time.hours, operational_hours.break_start_time.minutes, 0, 0);
							var op_break_hrs_end = new Date(ev_end);
							op_break_hrs_end.setHours(operational_hours.break_end_time.hours, operational_hours.break_end_time.minutes, 0, 0);

							if (ev_end <= op_hrs_end && ev_end > op_hrs_start) {

								if (ev_end < op_break_hrs_end && ev_end > op_break_hrs_start){
									//inbetween op break hours
									millis -= (op_hrs_end - op_break_hrs_end);
								}
								else if (ev_end <= op_break_hrs_start){
									//before op break hours
									millis-= ((op_hrs_end - op_break_hrs_end) + (op_break_hrs_start - ev_end));
								}
								else{
									//after op break hours
									millis-= (op_hrs_end - ev_end)
								}
							}
							else if (ev_end < op_hrs_end) {
								//subtract op_hrs
								var break_mins = ((operational_hours.break_end_time.hours * 60) + operational_hours.break_end_time.minutes) - ((operational_hours.break_start_time.hours * 60) + operational_hours.break_start_time.minutes);
								var operational_mins = ((operational_hours.end_time.hours * 60) + operational_hours.end_time.minutes) - ((operational_hours.start_time.hours * 60) + operational_hours.start_time.minutes) - break_mins;
								millis -= (operational_mins * 60 * 1000);
							}

					}
				}
			}
			  }
			  return Math.floor( millis/(1000*60) );
		},


		is_holiday: function (date) {
			var self = this;
			var o = self.options;

			var temp_date = new Date(date);
			temp_date.setHours(0, 0, 0, 0);
			var temp_ms = temp_date.getTime().toString();
			return o.holidays.indexOf(temp_ms) != -1;

		},

		_is_tech_holiday: function (date, owner_site_id) {
			var self = this;
			var o = self.options;

			var temp_date = new Date(date);
			temp_date.setHours(0, 0, 0, 0);
			var temp_ms = temp_date.getTime().toString();

			//get holidays from corresponding user
			var holidays = o.holidays[owner_site_id];

			return holidays && holidays.indexOf(temp_ms) != -1;

		},

		_is_tech_weekend: function (date, owner_site_id) {
			var self = this;
			var o = self.options;

			var weekends = o.operational_hours[owner_site_id]? o.operational_hours[owner_site_id].weekends : o.operational_hours[0].weekends;
			return weekends.indexOf(date.getDay()) != -1;
		},

		is_weekend: function (date) {
			var self = this;
			var o = self.options;

			return o.weekends.indexOf(date.getDay()) != -1;
		},

		_is_excluded_day: function (date, owner_site_id) {
			var self = this;
			var o = self.options;
			var excludedweeks = o.operational_hours[owner_site_id]? o.operational_hours[owner_site_id].excludedweeks : o.operational_hours[0].excludedweeks;
			var weekNum = Math.ceil(date.getDate()/7);
			var weekList = excludedweeks[date.getDay()];
			if (weekList === null || !weekList.includes(weekNum)){
				return false;
			}
			return true;
		},


		_find_day_index: function (date, days_of_operation) {

			var days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];//No I18n
			var current_day = days[date.getDay()];
			var index;

			for(var i=0; i<days_of_operation.length; i++){
				if (days_of_operation[i].week_day === current_day){
					index = i;
					break;
				}
			}
			return index;
		},

		_load_op_hrs_and_holidays : function(sections){
			var self = this;
			var o = self.options;

			if (!sections) {
				sections = scheduler.serverList('sections'); //No i18N
			}
			$.each(sections, function (key, item) {
				var site = null;

				if (item.orig.department) {
					site = item.orig.department.site;
				}

				if (site) {
					if(o.operational_hours[site.id]) {
					self._apply_marked_timespan_ophours(item.key, o.operational_hours[site.id]);
					} else {
						self._apply_marked_timespan_ophours(item.key, o.operational_hours[0]);
					}
					self._apply_marked_timespan_for_holidays(item.key, o.holidays[site.id]);

				} else {
					//for defualt site
					self._apply_marked_timespan_ophours(item.key, o.operational_hours[0]);
					self._apply_marked_timespan_for_holidays(item.key, o.holidays[0]);
				}
			});
		},


		_get_user_site : function(user){
			if(user.department && user.department.site && user.department.site.id){
				return user.department.site.id;
			}else{
				return null;
			}
		},

		_get_user_site_for_index : function(user){
			if(user && user.department && user.department.site && user.department.site.id){
				return user.department.site.id;
			}else{
				return 0;
			}
		},

		_get_op_hrs_site : function(opHrsObj){
			if(opHrsObj.site && opHrsObj.site.id){
				return opHrsObj.site.id;
			}else{
				return 0;
			}
		},

		_get_req_sites : function(){
			var self = this;
			var o = self.options;

			var sites = [null];		//add default site always - unassigned is shown as a user in default site
			jQuery.each(o.all_users, function(index, user){
				if(o.current_tab == 'projects'){
					user = user.user;
				}
				var site = self._get_user_site(user);
				if(sites.indexOf(site) == -1){
					sites.push(site);
				}
			});

			return sites;
		},

		_get_op_hours : function(){
			var self = this;
			var o = self.options;

			var onSuccess = function (data) {

				o.operational_hours = {};
				jQuery.each(data.operational_hours, function(index, item){
					var days_of_operation = item.days_of_operation;
					var hours_of_operation = item.hours_of_operation;
					var site = self._get_op_hrs_site(item);

					var days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];	//No I18n
					var weekends_index = [];
					var weekdays_index = [];
					var exclude_days_index = {};
					jQuery.each(days_of_operation, function(key, val){
						var excluded_days = [];
						if(val.is_working){
							var day = days.indexOf(val.week_day);
							weekdays_index.push(day);
						} else {
							var day = days.indexOf(val.week_day);
							weekends_index.push(day);
						}
						if (val.day_type === "24x7"){
							//To adjust round the clock from 23h 59m to 24h
							val.hours_of_operation.end_time.hours = 24;
							val.hours_of_operation.end_time.minutes = 0;
						}
						jQuery.each(val.exclude_weeks, function(key1, item){
							excluded_days.push(item.id);
						});

						exclude_days_index[days.indexOf(val.week_day)] = excluded_days;
					});

					//only one operational hour data for each site
					var operational_hours = data.operational_hours[index];
					var operational_hours_data = {
						operational_hours: operational_hours,
						weekends: weekends_index,
						weekdays : weekdays_index,
						excludedweeks : exclude_days_index,
						hours_of_operation : hours_of_operation
					};
						o.operational_hours[site] = operational_hours_data;
				});

			};

			var listInfo ={'start_index':1, 'row_count':100}; // No I18N
			var sites = self._get_req_sites();

			listInfo.search_criteria = {"field": "site", "values":sites , "condition": "is"} ;		//No I18n
				var dataVal = sdpAjaxInputData({
					"list_info": listInfo //NO I18N
				});
				sdpAjax({
				url: "/api/v3/operational_hours", // NO I18N
					type: "GET", //NO I18N
					data: dataVal,
					acceptODCompatible: true,
					success: function (data) {
						onSuccess(data);
					},
					async: false

			});
		},

		_get_holidays : function(){
			var self = this;
			var o = self.options;
			var listInfo ={'start_index':1, 'row_count':100}; // No I18N
			var sites = self._get_req_sites();

			listInfo.search_criteria = {"field": "site", "values":sites , "condition": "is"} ;		//No I18n

			var dataVal = sdpAjaxInputData({
				"list_info": listInfo //NO I18N
			});

			var onSuccess = function(data){
		    	jQuery.each(data.holidays,function(index,holiday){
		    		var site = self._get_op_hrs_site(holiday);
		    		if(!o.holidays[site]){
		    			o.holidays[site] = [];
			}
                jQuery.each(holiday.holidays,function(index,holiday){
                    o.holidays[site].push(holiday.holiday_date.value);
                });
		    	});
		    	if(data.list_info.has_more_rows == true){
		    		listInfo.start_index = data.list_info.start_index+100;
					sdpAjax({
						url: "/api/v3/holidays", // NO I18N
						type: "GET", //NO I18N
						data: dataVal,
						acceptODCompatible: true,
						success: function (data) {
							onSuccess(data);
						},
						async: false
						});
		    	}
		    };


			sdpAjax({
				url: "/api/v3/holidays", // NO I18N
				type: "GET", //NO I18N
				data: dataVal,
				acceptODCompatible: true,
				success: function (data) {
					onSuccess(data);
				},
				async: false

				});

		},

		_mapping_of_weekday_to_opdays: function (weekdays, days_of_operation){
			var weekday_to_op_days = []

			var days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];//No I18n

			$.each(weekdays, function (key, item) {
				for(var i=0; i<days_of_operation.length; i++){
					if (days_of_operation[i].week_day === days[item]){
						weekday_to_op_days.push(i);
						break;
					}
				}
			});
			return weekday_to_op_days;
		},
		_apply_marked_timespan_ophours: function (ownerId, operational_hours) {
			var self = this;
			var o = self.options;
			var weekdays = operational_hours.weekdays;
			var weekends = operational_hours.weekends;
			var excludedweeks = operational_hours.excludedweeks;
			var days_of_operation = operational_hours.operational_hours.days_of_operation;
			var weekday_to_op_days = self._mapping_of_weekday_to_opdays(weekdays, days_of_operation);

			$.each(weekdays, function (key, item) {
				var days_operational_hours = days_of_operation[weekday_to_op_days[key]].hours_of_operation;
				o.scheduler.addMarkedTimespan({
					days: item,
					zones: [0,(days_operational_hours.start_time.hours * 60) + days_operational_hours.start_time.minutes, (days_operational_hours.break_start_time.hours * 60) + days_operational_hours.break_start_time.minutes, (days_operational_hours.break_end_time.hours * 60) + days_operational_hours.break_end_time.minutes, (days_operational_hours.end_time.hours * 60) + days_operational_hours.end_time.minutes, 24*60],
					invert_zones: false,
					css: "working_time", //No I18N
					sections: {
						timeline: ownerId // list of sections
					}
				});
			});

			$.each(weekends, function (key, item) {
				o.scheduler.addMarkedTimespan({
					days: item,
					zones: "fullday", //No I18N
					css: "working_time", //No I18N
					sections: {
						timeline: ownerId // list of sections
					}
				});
			});

		},

		_get_operational_hours: function (siteId) {

			var self = this;
			var o = self.options;
			var listInfo = {
				'start_index': 1, //NO I18N
				'row_count': 100 //NO I18N
			};

			if (!siteId || siteId == "") {
				siteId = 0;
			}

			var onSuccess = function (data) {
				//only one operational hour data for each site
				o.operational_hours[siteId] = {};

				var operational_hours = o.operational_hours[siteId];
				operational_hours.operational_hours = data.operational_hours[0];

				//weekends
				var weekends = data.operational_hours[0].days_of_operation;
				operational_hours.weekends = [];
				operational_hours.weekdays = [];
				var days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']; //No I18n
				$.each(weekends, function (key, item) {
					if (item.is_working) {
						var day = days.indexOf(item.weekday);
						operational_hours.weekdays.push(day);
					} else {
						var day = days.indexOf(item.weekday);
						operational_hours.weekends.push(day);
					}
				});
			};



			if (o.operational_hours[siteId]) {
				var temp_string = ''; //avoid empty if
			} else {
				var dataVal = sdpAjaxInputData({
					"list_info": listInfo //NO I18N
				});
				sdpAjax({
					url: "/api/v3/sites/" + siteId + "/get_operational_hours", //NO I18N
					type: "GET", //NO I18N
					data: dataVal,
					acceptODCompatible: true,
					success: function (data) {
						onSuccess(data);
					},
					async: false
				});
			}

		},

		_load_operational_hours: function (siteId) {
			var self = this;
			var o = self.options;

			//only one operational hour data for each site
			var operational_hours = o.operational_hours[siteId];

			var weekdays = operational_hours.weekdays;
			var weekends = operational_hours.weekends;
			operational_hours = operational_hours.operational_hours;
			o.scheduler.addMarkedTimespan({
				days: weekdays,
				zones: [(operational_hours.start_time.hours * 60) + operational_hours.start_time.minutes, (operational_hours.end_time.hours * 60) + operational_hours.end_time.minutes],
				invert_zones: true,
				css: "working_time", //No I18N
		    	sections: {
					timeline: '100000000000023853' // list of sections
				}

			});
			o.scheduler.addMarkedTimespan({
				days: o.weekdays,
			    zones: [(operational_hours.end_time.hours*60)+operational_hours.end_time.minutes, 24*60],
			    css:   "working_time" //No I18N
			});

			//**************Custom Operational Hours Config*******************
			/*$.each(weekdays, function (key, item) {
				debugger
				var days_operational_hours = operational_hours.operational_hours.days_of_operation[item-1].hours_of_operation;
					o.scheduler.addMarkedTimespan({
						days: item,
						zones: [0,(days_operational_hours.start_time.hours * 60) + days_operational_hours.start_time.minutes, (days_operational_hours.break_start_time.hours * 60) + days_operational_hours.break_start_time.minutes, (days_operational_hours.break_end_time.hours * 60) + days_operational_hours.break_end_time.minutes, (days_operational_hours.end_time.hours * 60) + days_operational_hours.end_time.minutes, 24*60],
						invert_zones: false,
						css: "working_time", //No I18N
						sections: {
							timeline: '100000000000023853' // list of sections
						}
					});
			});
			*/
			jQuery.each(weekends, function(key,item){
				o.scheduler.addMarkedTimespan({
					days: item,
					zones: "fullday", //No I18N
					css: "working_time" //No I18N
				});
			});

			o.scheduler.updateView();
		},

		_apply_marked_timespan_for_holidays: function (ownerId, holidays) {
			var self = this;
			var o = self.options;
			$.each(holidays, function (key, value) {
				o.scheduler.addMarkedTimespan({
					days: new Date(parseInt(value)),
					zones: "fullday", //No I18N
					css: "working_time", //No I18N
					sections: {
						timeline: ownerId // list of sections
					}
				});
			});

		},

		_apply_marked_timespan_for_excluded_days: function (start_date, end_date, ownerId, owner_site_id) {
			var self = this;
			var o = self.options;

			var now = new Date(start_date);

			while(now < end_date){
				if(self._is_excluded_day(now, owner_site_id)){
					o.scheduler.addMarkedTimespan({
						days: new Date(now),
						zones: "fullday", //No I18N
						css: "working_time", //No I18N
						sections: {
							timeline: ownerId // list of sections
						}
					});
				}
				now.setDate(now.getDate() + 1);
			}
		},


		_init_scroll_event: function () {
			var self = this;
			var o = self.options;
			o.scroll_ready = true;
			o.sdp_scheduler_scroll = true;
			self._create_scroll_event();

		},

		_create_scroll_event: function () {
			var self = this;
			var o = self.options;

			$('.dhx_cal_data').on('scroll', function (event) {
				if ($('.dhx_cal_data').scrollTop() + $('.dhx_cal_data').height() > $('.dhx_cal_data table').height() - 5) {
					if (o.sdp_scheduler_scroll && $('#scheduler_container').length) {
						self._load_more_users(event, function() {
							self._load_readonly_tasks(o.scheduler.getState().min_date, o.scheduler.getState().max_date);
						 o.scheduler.updateView();
						});
					} else {
						$(document).off(event);
					}
				}
			});
		},

		remove_scroll_event: function (event) {
			var self = this;
			var o = self.options;

			o.sdp_scheduler_scroll = false;
			if (event) {
				$(document).off(event);
			}
		},

		construct_date_filter: function (dateElement, dateRangeElement) {
			var self = this;
			var o = self.options;

			var rangeForZoomVal = {

				'hours': [ // No I18N
					'today', // No I18N
					'yesterday', // No I18N
					'tommorow' // No I18N
				],

				'days': [ // No I18N
					'last_7_days', // No I18N
					'next_7_days' // No I18N
				],

				'weeks': [ // No I18N
					'this_week', // No I18N
					'last_week', // No I18N
					'next_week' // No I18N
				],

				'months': [ // No I18N
					'this_month', // No I18N
					'last_month', // No I18N
					'next_month', // No I18N
					'this_quarter', // No I18N
					'last_quarter', // No I18N
					'next_quarter' // No I18N
				]
			};

			var zoomVal = $('#zooming').val();

			window.self = window;
			jQuery("#date_select").val(self.options.scheduler.getState().min_date.getTime());
			jQuery("#date_select_start").val(self.options.scheduler.getState().min_date.getTime());
			jQuery("#date_select_end").val(new Date(self.options.scheduler.getState().max_date - 1).getTime());
			initCalendar(dateElement, null, null, null, null, null, null, null, null, null, true);

			$('#date_select,#date_select_end').on('change', function () {
				var st, ed;
				var zoomLevel = o.zoom_level;

				if (this.id === "date_select") {
					st = this.value;
				} else {
					st = self.options.scheduler.getState().min_date.getTime();
				}
				if (zoomLevel != 'hours') {
					if (this.id === "date_select_end") {
						ed = new Date(Number(this.value)).getTime();
					} else {
						ed = self.options.scheduler.getState().max_date.getTime();
					}
				}

				self.zoom_schedule(zoomLevel, st, ed);
			});

		},



		construct_group_filter: function (options) {
			var self = this;

			var row_count = 10;
			var listInfo = {
				'start_index': ((options.page - 1) * row_count) + 1, //NO I18N
				'row_count': row_count //NO I18N
			};

			var search_criteria = [];
			if (options.term && options.term != '') {
				var criteria = {
					field: 'name', // No I18N
					condition: 'like', // No I18N
					values: [options.term]
				};
				search_criteria.push(criteria);
			}

			var siteValues = $('.popover #site-select').select2('val'); // No I18N
			if (siteValues.length) {
				if(siteValues == -1) {
					siteValues = null;
				}
				var criteria = {
					field: 'site', //NO I18N
					condition: 'is', //NO I18N
					value: siteValues,
					logical_operator: 'AND' //NO I18N
				};
				search_criteria.push(criteria);
			}

			if (search_criteria.length) {
				listInfo.search_criteria = search_criteria;
			}

			var url = self._get_groups_url();

			var dataVal = sdpAjaxInputData({
				"list_info": listInfo, //NO I18N
				"for":"resource_mgmt" // NO I18N
			});
			sdpAjax({
				url: url,
				type: "GET", //NO I18N
				data: dataVal,
				acceptODCompatible: true,
				success: function (data) {
					var select2_group_list = {
						more: false,
						results: [],
						context: data.list_info
					};
					select2_group_list.more = data.list_info.has_more_rows;
					$.each(data.group, function (key, item) {
						var name = item.name;
						if(item.site) {
							name += " (" + item.site.name + ")"
						}
						select2_group_list.results.push({
							id: item.id,
							name: name,
							orig: item
						});
					});
					options.callback(select2_group_list);
				},
				async: false
			});
		},

		construct_site_filter: function (options) {
			var self = this;
			var o = self.options;
			var site_max_count = 1;

			var row_count = 10;
			var listInfo = {
				'start_index': ((options.page - 1) * row_count) + 1, //NO I18N
				'row_count': row_count //NO I18N
			};

			if (options.term && options.term != '') {
				var criteria = {
					field: 'name', // No I18N
					condition: 'like', // No I18N
					values: [options.term]
				};
				listInfo.search_criteria = criteria;
			}

			// var params=getAsInputData({list_info:listInfo});
			var url = self._get_sites_url();

			var dataVal = sdpAjaxInputData({
				"list_info": listInfo, //NO I18N
				"for": "resource_mgmt" // NO I18N
			});
			sdpAjax({
				url: url,
				type: "GET", //NO I18N
				data: dataVal,
				skipSUBREQUEST:true,
				acceptODCompatible: true,
				success: function (data) {
					var select2_site_list = {
						more: false,
						results: [],
						context: data.list_info
					};
					select2_site_list.more = data.list_info.has_more_rows;
					$.each(data.site, function (key, item) {
						if(item.id == -1) {
							if(isMSP)
							{
								return;
							}
							item.name = translate("common.site.nosite");
						}
						select2_site_list.results.push({
							id: item.id,
							name: item.name,
							orig: item
						});
					});
					options.callback(select2_site_list);
				},
				async: false
			});

		},

		construct_res_filter: function (options) {
			var self = this;
			var o = self.options;

			var res_max_count = o.res_max_count_filter;
			var row_count = 10;
			var listInfo = {
				'start_index': 1, //NO I18N
				'row_count': 10, //NO I18N
				"sort_field": "name", //NO I18N
				"sort_order": "asc" //NO I18N
			};

			if(o.current_tab === "projects") {
				listInfo.sort_field = "user.name"; // NO I18N
			}
			listInfo.start_index = ((options.page - 1) * row_count) + 1;
			listInfo.row_count = row_count;

			var search_criteria = [];
			if (options.term && options.term != '') {
				var criteria = {
					field: 'name', // No I18N
					condition: 'like', // No I18N
					values: [options.term]
				};
				if (o.current_tab == 'projects') {
					criteria.field = 'user.name'; // No I18N
				}
				search_criteria.push(criteria);
			}

			if ($('.popover #group-select').length && $('.popover #group-select').select2('val').length) {
				//apply group filter
				var groups = $('.popover #group-select').select2('val'); // No I18N

				if (groups && groups.length) {
					var criteria = {
						field: 'support_group', // No I18N
						condition: 'in', // No I18N
						values: groups,
						logical_operator: "AND" // No I18N
					};
					search_criteria.push(criteria);
				}
			}

			if ($('.popover #site-select').length && $('.popover #site-select').select2('val') && $('.popover #site-select').select2('val') != '') { // No I18N
				//apply site filter
				var site = $('.popover #site-select').select2('val'); // No I18N
				var criteria = {
					field: 'associated_sites', // No I18N
					condition: 'is', // No I18N
					value: site,
					logical_operator: "AND" // No I18N
				};
				search_criteria.push(criteria);
			} else if (o.current_tab == 'projects' && o.projectId) { // No I18N
				var criteria = {
					field: 'project', // No I18N
					condition: 'is', // No I18N
					value: o.projectId,
					logical_operator: "AND" // No I18N
				};
				search_criteria.push(criteria);
			}

			if (search_criteria.length) {
				listInfo.search_criteria = search_criteria;
			}

			var url = self._get_resource_url();

			var dataVal = sdpAjaxInputData({
				"list_info": listInfo //NO I18N
			});
			sdpAjax({
				url: url,
				type: "GET", //NO I18N
				data: dataVal,
				acceptODCompatible: true,
				success: function (data) {
					var select2_res_list = {
						more: false,
						results: [],
						context: data.list_info
					};
					select2_res_list.more = data.list_info.has_more_rows;
					$.each(data[o.resource], function (key, item) {
						var userObj;
						if (o.current_tab == 'projects') { //NO I18N
							userObj = item.user;
						} else {
							userObj = item;
						}
						select2_res_list.results.push({
							id: userObj.id,
							name: userObj.name,
							orig: userObj
						});
					});
					options.callback(select2_res_list);
				},
				async: false
			});


		},

		set_res_filter: function () {
			var self = this;
			var o = self.options;
			self.showProgressBar();
			var filter_data = {};

			if (!o.projectId) {

				if (o.current_tab == 'projects') {
					searchKey = 'res_filter_project'; //No I18N
					filter_data = {
						resource: $('.popover #res-select').select2('val')
					};
				} else {
					filter_data = {
						site: $('.popover #site-select').select2('val'),
						group: $('.popover #group-select').select2('val'),
						resource: $('.popover #res-select').select2('val')
					};
				}

				self._set_personalization(filter_data);
				self._clear_all();
				self.load_after_personalize();
			} else {
				self.load_after_personalize();
			}

		},

		_set_personalization: function(filter_data, saveTimeSettings) {
			var self = this;
			var o = self.options;
			var data;
			var pers_key = o.current_tab === "projects"? "res_mgmt_proj" : "res_mgmt"; // NO I18N
			data = o.personalizedData;
			if(filter_data) {
				if(filter_data.barcolor){
					data.barcolor = filter_data.barcolor
				} else if(typeof filter_data.show_unassigned_tasks != 'undefined') { // NO I18N
					data.show_unassigned_tasks=filter_data.show_unassigned_tasks;
				} else if(typeof filter_data.show_unscheduled_tasks != 'undefined') { // NO I18N
					data.show_unscheduled_tasks=filter_data.show_unscheduled_tasks;
				} else if(typeof filter_data.zoom_level != 'undefined') { // NO I18N
					data.starting_date = filter_data.starting_date;
					data.ending_date = filter_data.ending_date;
					data.zoom_level = filter_data.zoom_level;
				} else if(filter_data) {
					data.site = (filter_data.site && filter_data.site.length)>0?filter_data.site:0;
					data.group = filter_data.group;
					data.resource = filter_data.resource;
				}
			}

			if(saveTimeSettings) {
				var state = o.scheduler.getState();
				data.starting_date = state.min_date? state.min_date.getTime() : null;
				data.ending_date = state.max_date? state.max_date.getTime() : null;
				data.zoom_level = o.zoom_level;
			}

			if(isMSP)
			{
				data.comboAccount=getAccountId();
			}

			addPersonalization(pers_key, data, true); //NO I18N

			o.res_filter = data;
		},

		load_after_personalize: function () {
			var self = this;
			var o = self.options;
			var users_to_get_data = [];
			var timeline_owners = self._get_users(true);
			self._get_op_hours();
			self._get_holidays();

			if (!timeline_owners.length && !o.show_unassigned_tasks) {
				o.show_unassigned_tasks = true;
				self.handle_unassigned(null, o.show_unassigned_tasks);
			}

			if (o.show_unassigned_tasks) {
				var unassigned_res = self.get_unassigned_section();
				timeline_owners.splice(0, 0, unassigned_res);
			}

			for(var i=0; i < timeline_owners.length ; i++) {
				users_to_get_data[i] = timeline_owners[i].key;
			}

			self.refresh_scheduler_by_owner(users_to_get_data,function() { //loading tasks here
			self._load_readonly_tasks(null,null,timeline_owners);
			self.update_sections(timeline_owners);
				self.hideProgressBar();
			});

		},

		_set_options: function (opts) {
			this._setOptions(opts);
		},

		_add_all_owners: function (callback) {
			var self = this;
			var opts = {
				load_unscheduled: true
			};
			self._load_tasks_by_owner(opts,callback);
		},

		_is_field_changed: function (event, field, field_in_event) {
			var origData = event.origitem[field];
			var eventData = event[field_in_event];

			if (origData != null) {
				if (eventData !== origData) {
					return true;
				}
			}
			return false;
		},

		_clear_all: function () {
			var self = this;
			var o = self.options;

			o.scheduler.clearAll();
			var sections = scheduler.serverList('sections'); //No I18n
			$.each(sections, function (index, item) {
				item.unsch_tasks = [];
				item.sch_tasks = [];
			});
		},

		_is_owner_changed: function (event) {

			var oldOwnerObj = event.origitem.owner;
			if (event.origitem.marked_technician) {
				oldOwnerObj = event.owner.marked_technician;
			}
			var newOwner = event.owner_id;

			if (oldOwnerObj == null) {
				if (newOwner != "not-assigned") {
					return true;
				}
			} else {
				if (oldOwnerObj.id != newOwner) {
					return true;
				}
			}
			return false;
		},

		_create_scheduler_object: function (item, event) {
			var self = this,
				o = self.options,
				el = self.element;
			if (event == null || event === undefined) {
				event = {};
			}

			event.id = item.id;
			event.owner = item.owner;
			event.owner_id = (item.owner == null) ? "not-assigned" : item.owner.id; //No I18n
			if (item.marked_technician) {
				event.owner = item.marked_technician;
				event.owner_id = item.marked_technician.id;
			}
			event.text = encodeHTML(item.title);
			event.description = item.description;
			event.priority = item.priority === null ? "-" : item.priority.name;
			event.status = item.status === null ? "-" : item.status.name;
			event.readonly = item.status.internalname === "Closed" ? true : false, //No I18n
				//event.readonly = true;f
				event.origitem = item;

			event.markedtechnician = item.marked_technician;
			event.progress = item.percentage_completion / 100;

			self._set_scheduled_time(item, event); //set by reference
			if(!o.res_filter.barcolor) {
				o.res_filter.barcolor = "priority"; // NO I18N
			}
			self._set_color(item, event, o.res_filter.barcolor);
			self._set_parent_details(item, event);

			return event;
		},

		_set_parent_details: function (item, event) {
			//var associated_entity = item.associated_entity;
			var module = item.associated_entity.toLowerCase();
			if (module) {
				event.parent = module;
				event[module] = item[module];
				if (module == 'milestone') {
					event.grandparent = 'project'; //No I18N
					event.project = item.project;
				}
			} else {
				event.parent = '-';
			}

		},

		_get_color: function (field) {
			if (field && field.color) {
				return field.color.substring(0,7);
			} else {
				//apply default color for scheduler
				return null;
			}
		},


		_set_color: function (item, event, colorbasedon) {
			var self = this,
				o = self.options;

			if (!event.readonly) {
				event.color = encodeHTMLAttribute(self._get_color(item[colorbasedon]));
				event.textColor = "white"; //No I18N
			}

			return event;
		},

		change_bar_color: function (colorbasedon) {

			var self = this,
				o = self.options;

			if(!colorbasedon){
				if(o.res_filter && o.res_filter.barcolor){
					colorbasedon = o.res_filter.barcolor;
				} else {
					colorbasedon = o.bar_color_field; //NO I18N
				}
			} else {
				self._set_personalization({
					barcolor: colorbasedon
				});
			}
			self.showProgressBar();
			self.setBarColorAndLegends(colorbasedon, function() {
			$("#color-text").text($('.bar-settings a[name=' + colorbasedon + ']').text());

			var state = scheduler.getState();
			var scheduler_events = scheduler.getEvents(state.min_date, state.max_date);
			var i = 0;
			for (i = 0; i < scheduler_events.length; i++) {
				var scheduler_event = scheduler_events[i];
				self._set_color(scheduler_event.origitem, scheduler_event, colorbasedon);
			}
			o.scheduler.updateView();
				self.hideProgressBar();
			});


		},

		_set_scheduled_time: function (item, event, start_date, end_date) {
			var self = this,
				o = self.options;

			event.unscheduled = (item[o.time_resource_fields.start] == null || item[o.time_resource_fields.end] == null);
			event.start_date = self._get_date_value(item[o.time_resource_fields.start]);
			event.end_date = self._get_date_value(item[o.time_resource_fields.end]);

			var state = o.scheduler.getState();
			if (event.start_date == null) {
				event.start_date = start_date? start_date : state.min_date;
			}
			if (event.end_date == null) {
				event.end_date = end_date? end_date : state.max_date;
			}
		},

		_set_unscheduled_prev_next: function (origitem, event, start_date, end_date) {
			var self = this,
				o = self.options;

			event.unscheduled = (origitem[o.time_resource_fields.start] == null || origitem[o.time_resource_fields.end] == null);
			event.start_date = self._get_date_value(origitem[o.time_resource_fields.start]);
			event.end_date = self._get_date_value(origitem[o.time_resource_fields.end]);

			if (event.start_date == null) {
				event.start_date = start_date;
			}
			if (event.end_date == null) {
				event.end_date = end_date;
			}
		},

		//Converting time value of the json object to date
		_get_date_value: function (dtObj, fmt_func) {
			if (dtObj === null || dtObj === undefined || dtObj === "null") {
				return null;
			}
			var date = new Date();
			date.setTime(dtObj.value);

			var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
			if(parent.sdp_user.OFFSET) {
				utc = utc + (parent.sdp_user.OFFSET); //NO I18N
			}
			date.setTime(utc);
			return date;
		},

		_get_users:function(force_get) {
			var self = this;
			var o = self.options;

			var users = [];
			var image_token = null;
			var url = self._get_resource_url();
			if(force_get || !self._is_users_cache_available()){

			var listInfo = self._get_resource_list_info();
				listInfo.row_count = 50;
				// listInfo.start_index = scheduler.serverList['sections'].length + 1
			var dataVal = sdpAjaxInputData({
				"list_info": listInfo, //NO I18N
				include : ["image_token"]
			});
			if(url == '/api/v3/tasks/owner'){
			    dataVal = sdpAjaxInputData({
                				"list_info": listInfo, //NO I18N
                			});
			}
			sdpAjax({
				url: url,
				type: "GET", //NO I18N
				data: dataVal,
				acceptODCompatible: true,
				success: function (data) {
						self._set_users_in_cache(data[o.resource]);
						users = self._get_users_from_cache(0, 15);
						image_token = data.image_token;
						// users = data[o.resource];
					},
					async: false

				});
			}else{
				users = self._get_users_from_cache(0,15);
			}

			self._init_scroll_event();
			return self._get_as_schedueler_users(users, image_token);
		},

		_is_users_cache_available : function(){
			return !!this.options.all_users;
		},

		_get_as_schedueler_users : function(users, image_token){
			var self = this;
			var o = self.options;

			var unitelements = [];
			jQuery.each(users, function(key, user) {
						var userObj;
				if(o.current_tab == 'projects'){
							userObj = user.user;
							image_token = user.image_token;
						} else {
							userObj = user;
						}
						unitelements.push(self._get_user_obj(userObj, image_token));
					});

			return unitelements;
		},

		_get_users_from_cache : function(start_index, row_count){
			var self = this;
			var o = self.options;

			if(start_index == undefined){
				start_index = self._get_loaded_resources_count();
			}

			if(row_count == undefined){
				row_count = 10;
			}

			var users = o.all_users.slice(start_index, start_index+row_count);
			return users;
		},

		_set_users_in_cache : function(users){
		    this.options.all_users = users;
		},

		_get_sites_url: function () {
			var self = this;
			var o = self.options;

			if (o.filtered_module.indexOf('Request') != -1) {
				return 'requests/site'; //No I18N
			} else if (o.filtered_module.indexOf('Problem') != -1) {
				return 'problems/site'; //No I18N
			} else if (o.filtered_module.indexOf('Change') != -1) {
				return 'changes/site'; //No I18N
			} else if (o.filtered_module.indexOf('Release') != -1) {
				return 'releases/site'; //No I18N
			}
			else {
				return '/api/v3/tasks/site'; //No I18N
			}
		},

		_get_groups_url: function () {
			var self = this;
			var o = self.options;

			if (o.filtered_module.indexOf('Request') != -1) {
				return 'requests/group'; //No I18N
			} else if (o.filtered_module.indexOf('Problem') != -1) {
				return 'problems/group'; //No I18N
			} else if (o.filtered_module.indexOf('Change') != -1) {
				return 'changes/group'; //No I18N
			} else if (o.filtered_module.indexOf('Release') != -1) {
				return 'releases/group'; //No I18N
			}
			else {
				return '/api/v3/tasks/group'; //No I18N
			}
		},

		_get_resource_url: function () {
			var self = this;
			var o = self.options;

			if (o.current_tab == 'projects') {
				if (o.projectId) {
					return "/api/v3/projects/" + o.projectId + "/members"; //No I18N
				}
				return '/api/v3/projects/members'; //No I18N
			}
			return "/api/v3/tasks/owner"; //No I18N
		},

		_get_resource_list_info: function () {
			var self = this;
			var o = self.options;

			var listInfo = {
				'start_index': 1, //NO I18N
				'row_count': 10, //NO I18N
				"sort_field": "name", //NO I18N
				"sort_order": "asc" //NO I18N
			};
			var criteria = self.get_resource_criteria();
			if (criteria) {
				listInfo.search_criteria = criteria;
			}
			if (o.current_tab == 'projects') {
				listInfo.sort_field = "user.name"; // No I18N
			}
			return listInfo;
		},

		get_resource_criteria: function () {
			var self = this;
			var o = self.options;
			var criteria;

			if (o.projectId) {
				if ($('.popover #res-select').length && $('.popover #res-select').select2('val').length) { //without initialization select2 returns the its element in its val
					criteria = {
						field: 'user.id', //No I18N
						condition: 'eq', //No I18N
						values: $('.popover #res-select').select2('val') //No I18N
					}
				return criteria;
			}
			}

			if (o.res_filter && (!isMSP || !o.res_filter.comboAccount || o.res_filter.comboAccount == getAccountId())) {
				if (o.current_tab == 'projects') {

					if (o.res_filter.resource && o.res_filter.resource.length) {
						criteria = {
							field: 'user.id', //No I18N
							condition: 'eq', //No I18N
							values: o.res_filter.resource
						}
					}
				} else {
					if (o.res_filter.resource && o.res_filter.resource.length) {
						criteria = {
							field: 'id', //No I18N
							condition: 'eq', //No I18N
							values: o.res_filter.resource
						}
					} else if (o.res_filter.group && o.res_filter.group.length) {
						criteria = {
							field: 'support_group', //No I18N
							condition: 'eq', //No I18N
							values: o.res_filter.group
						}
					} else if (o.res_filter.site) {
						criteria = {
							field: 'associated_sites', //No I18N
							condition: 'eq', //No I18N
							value: o.res_filter.site
						}
					}
				}


			}

			return criteria;
		},

		_set_tab: function () {
			var self = this;
			var o = self.options;

			o.current_tab = jQuery("#top-header").find("#sdp-tabs").find("li.active").find("a").attr("id");			;
			if (o.current_tab == 'projects') {
				o.resource = 'members'; //No I18N
			}
			else {
				o.resource = 'owner'; //No I18N
			}
		},

		_get_loaded_resources_count: function () {
			var self = this,
				o = self.options;

			var sections = scheduler.serverList('sections'); //No I18N
			if (sections.length && sections[0].key == 'not-assigned') {
				return sections.length - 1;
			} else {
				return sections.length;
			}
		},

		_load_more_users: function (event, callback) {
			var self = this,
				o = self.options;

			var users = self._get_users_from_cache();
			if(users.length){

					var users_to_get_data = [];
				var sections = scheduler.serverList("sections").slice();			//No I18n
				jQuery.each(users, function(key, user) {

						var userObj;
					if(o.current_tab == 'projects'){
							userObj = user.user;
						} else {
							userObj = user;
						}
					if((self._get_loaded_resources_count() < o.max_resource_count)){
						var schUserObj = self._get_user_obj(userObj);
						sections.push(schUserObj);
						users_to_get_data.push(userObj.id);
					}

					});
				self.update_sections(sections);

					var state = o.scheduler.getState();
				if(o.show_unscheduled_tasks){
					self._load_tasks_by_owner({
						ownerIds : users_to_get_data,
						load_all_tasks : true,
						start_date : state.min_date,
						end_date : state.max_date
					}, callback);
				}else{
					self._load_tasks_by_owner({
						ownerIds: users_to_get_data,
						load_unscheduled : false,
						start_date: state.min_date,
						end_date : state.max_date
					}, callback);
				}
			}else{
						self.remove_scroll_event(event);
					}
				},

		_get_user_obj: function (user, image_token) {
			var userName = user.name? user.name: user.orig.name;

			var userObj = {
				key: user.id,
				label: userName,
				orig: user,
				image_token : image_token,
				unsch_tasks: [],
				sch_tasks: []
			};
			return userObj;
		},

		handle_all_unscheduled: function (element, switch_on) {
			var self = this;
			if(element) {
				is_checked = $(element).prop('checked'); //No I18N
				self._set_personalization({ show_unscheduled_tasks: is_checked });
			} else {
				jQuery("#include_unshceduled_tasks").prop("checked", switch_on); // NO I18N
				is_checked = switch_on;
			}

			if(jQuery("#toggleEnableDisableChat2").hasClass("on")) {
				jQuery("#toggleEnableDisableChat2").addClass("off");
				jQuery("#toggleEnableDisableChat2").removeClass("on")
			} else if(jQuery("#toggleEnableDisableChat2").hasClass("off")) { // NO I18N
				jQuery("#toggleEnableDisableChat2").addClass("on");
				jQuery("#toggleEnableDisableChat2").removeClass("off");
			}



			var opts = {
				show_unscheduled_tasks: is_checked
			};

				self._set_options(opts);

			self.showProgressBar();
			if (is_checked) {
					self._add_all_owners(function() {
						if(typeof switch_on == 'undefined') {
						scheduler.updateView();
						}
						self.hideProgressBar();
					});
			} else {
					var sections = scheduler.serverList('sections'); //No I18N
					$.each(sections, function (index, item) {
						$.each(item.unsch_tasks, function (index, id) {
							delete scheduler._events[id];
						});
						item.unsch_tasks = [];
					});
				if(typeof switch_on == 'undefined') {
			scheduler.updateView();
				}
			self.hideProgressBar();

			}
		},

		handle_unassigned: function (element, switch_on) {
			var self = this;
			if(element) {
				is_checked = $(element).prop('checked'); //No I18N
				self._set_personalization({ show_unassigned_tasks: is_checked });
			} else {
				jQuery("#include_unassigned_tasks").prop("checked", switch_on); // NO I18N
				is_checked = switch_on;
			}


			var o = self.options;

			if(jQuery("#toggleEnableDisableChat1").hasClass("on")) {
				jQuery("#toggleEnableDisableChat1").addClass("off");
				jQuery("#toggleEnableDisableChat1").removeClass("on");
			} else if(jQuery("#toggleEnableDisableChat1").hasClass("off")) { // NO I18N
				jQuery("#toggleEnableDisableChat1").addClass("on");
				jQuery("#toggleEnableDisableChat1").removeClass("off");
			}

			self.showProgressBar();
			if (is_checked) {
					self._add_unassigned(function() {
					if(typeof switch_on == 'undefined') {
				scheduler.updateView();
					}
						self.hideProgressBar();
					});
			} else {

				if (o.scheduler.serverList("sections").length <= 1) {
					self._set_personalization({ show_unassigned_tasks: true });
					$('#include_unassigned_tasks').prop('checked', true); //No I18N
					self.hideProgressBar();
					if(jQuery("#toggleEnableDisableChat1").hasClass("on")) {
						jQuery("#toggleEnableDisableChat1").addClass("off");
						jQuery("#toggleEnableDisableChat1").removeClass("on");
					} else if(jQuery("#toggleEnableDisableChat1").hasClass("off")) { // NO I18N
						jQuery("#toggleEnableDisableChat1").addClass("on");
						jQuery("#toggleEnableDisableChat1").removeClass("off");
					}
					if(o.current_tab === "projects") {
						showalert('warning', translate("sdp.members.not.available"), 'isAutoHide=true,delay=2') // NO I18N
					} else {
						showalert('warning', translate("sdp.calendar.notech"), 'isAutoHide=true,delay=2') // NO I18N
					}
					return false;
				}
					self._remove_unassigned();
					self.hideProgressBar();
			}
		},

		_remove_unassigned: function () {
			var self = this;
			var o = self.options;

			//setting configuration
			o.show_unassigned_tasks = false;

			//modify sections
			var sections = o.scheduler.serverList("sections").slice(); //No I18N
			var removedSection = sections.splice(0, 1);
			var unscheduled_tasks_ids = removedSection[0].unsch_tasks;
			var scheduled_tasks_ids = removedSection[0].sch_tasks;
			$.each(unscheduled_tasks_ids, function (index, id) {
				delete scheduler._events[id];
			});

			$.each(scheduled_tasks_ids, function (index, id) {
				delete scheduler._events[id];
			});
			self.update_sections(sections);
		},


		get_unassigned_section: function () {
			var tempObj = {
				key: 'not-assigned',//NO I18N
				label: translate('sdp.common.unAssign'),
				unsch_tasks: [],
				sch_tasks: [],
				orig: {}
			};
			return tempObj;
		},

		_add_unassigned: function (callback) {
			var self = this;
			var o = self.options;

			//setting configuration
			o.show_unassigned_tasks = true;

			//add to checked owners
			var tempObj = self.get_unassigned_section();

			//modify sections
			var sections = o.scheduler.serverList("sections").slice(); //No I18N
			if(sections.length && sections[0].key == "not-assigned") {
				return;
			}

			sections.splice(0, 0, tempObj);
			//o.scheduler.updateCollection("sections", sections);
			self.update_sections(sections);

			//load scheduled tasks - should give st date and end date - otherwise it loads for today
			var state = o.scheduler.getState();
			var opts = {
				ownerIds: [],
				start_date: state.min_date,
				end_date: state.max_date
			};

			//load unscheduled tasks
			if (o.show_unscheduled_tasks) {
				opts.load_all_tasks=true;
			}
			self._load_tasks_by_owner(opts,callback);

		},

		update_sections: function (sections) {
			var self = this;
			var o = self.options;

			o.scheduler.deleteMarkedTimespan();

			if(o.zoom_level !== "months"){
				self._load_op_hrs_and_holidays(sections);
				var state = o.scheduler.getState();
				//apply timespan for excluded days among all over the technicians
				for(var i=0; i<sections.length; i++){
					self._apply_marked_timespan_for_excluded_days(state.min_date, state.max_date, sections[i].key, self._get_user_site(sections[i].orig));
				}
			}

			o.scheduler.updateCollection("sections", sections);
		},

		_get_scheduler_resources: function () {
			var self = this;
			var o = self.options;
			var sections = o.scheduler.serverList("sections"); //No I18N

			return self._get_resources_as_array(sections);
		},

		_get_resource_key_value: function (sections) {
			var self = this;
			var o = self.options;
			sections = sections || o.scheduler.serverList("sections").slice(); //No I18N
			var returnObj = {};

			$.each(sections, function (key, val) {
				returnObj[val.key] = val.orig;
			});

			return returnObj;
		},

		_get_resources_as_array: function (sections) {
			var resourceElements = [];
			$.each(sections, function (key, val) {
				resourceElements.push(val.key);
			});
			return resourceElements;
		},

		_get_resources_as_key_value_pair: function (sections) {
			var resourceElements = {};
			$.each(sections, function (key, val) {
				resourceElements[val.key] = val;
			});
			return resourceElements;
		},

		_get_resources_as_obj: function () {
			var self = this;
			var o = self.options;

			var sections = o.scheduler.serverList("sections").slice(); //No I18N

			return sections;
		},

		_get_start_time_in_millis: function (start_date) {
			if (!start_date) {
				start_date = new Date();
				start_date.setHours(0, 0, 0, 0);
			}
			var start_ms = start_date.getTime();
			return start_ms;
		},

		_get_end_time_in_millis: function (end_date) {
			if (!end_date) {
				end_date = new Date();
				end_date.setHours(24, 0, 0, 0);
			}
			var end_ms = end_date.getTime();
			return end_ms;
		},

		//scheduled tasks only
		_load_scheduled_tasks : function(ownerIds, start_date, end_date, callback){
			var self = this,
				o = self.options;

			var start_ms = self._get_start_time_in_millis(start_date);
			var end_ms = self._get_end_time_in_millis(end_date);
			var listInfo = {'start_index':1,'row_count':100}; // No I18N
			listInfo.search_criteria = [];
			var scheduled_criteria = {
				field: "scheduled_start_time", //No I18N
				value: end_ms,
				condition: "lesser than", //No I18n
				children: [{
					field: "scheduled_end_time", //No I18N
					value: start_ms,
					condition: "greater than", //No I18N
					logical_operator: "AND" //No I18n
				}]
			};
			listInfo.search_criteria.push(scheduled_criteria);
			if(ownerIds.length){
				var owner_crit = {
						field: "owner",														//No I18N
			        	values: ownerIds,
			        	condition: "is",														 //No I18n
			        	logical_operator: "AND"														 //No I18n
				};
				listInfo.search_criteria.push(owner_crit);
			}


			self._attach_filter_modules(listInfo);
			self._attach_filter_by(listInfo);
			self._attach_pending_criteria(listInfo);
			// self._attach_not_deleted_criteria(listInfo);
			self._attach_sort_by(listInfo);
			self._get_tasks_from_server(listInfo, callback);
		},

		_load_unscheduled_tasks : function(ownerIds, callback){
			var self = this,
			o = self.options;
			var listInfo = {'start_index':1,'row_count':100}; // No I18N
			listInfo.search_criteria = [];
				var unscheduled_criteria = {
					field: "scheduled_start_time", //No I18N
					value: null,
					condition: "is", //No I18n
											    children:[
													{
						field: "scheduled_end_time", //No I18N
						value: null,
						condition: "is", //No I18N
						logical_operator: "OR" //No I18N
					}]
				};
				listInfo.search_criteria.push(unscheduled_criteria);
			if(ownerIds && ownerIds.length){
				var owner_crit = {
					field: "owner", //No I18N
					values: ownerIds,
					condition: "is", //No I18n
					logical_operator: "AND" //No I18n
				};
				listInfo.search_criteria.push(owner_crit);
			}

			self._attach_filter_modules(listInfo);
			self._attach_filter_by(listInfo);
			self._attach_pending_criteria(listInfo);
			// self._attach_not_deleted_criteria(listInfo);
			self._attach_sort_by(listInfo);
			self._get_tasks_from_server(listInfo, callback);
		},

		_load_both_tasks :  function(ownerIds, start_date, end_date, callback){
			var self = this,
				o = self.options;
			var start_ms = self._get_start_time_in_millis(start_date);
			var end_ms = self._get_end_time_in_millis(end_date);

			var listInfo = {'start_index':1,'row_count':100}; // No I18N
			listInfo.search_criteria = [];
			var unscheduled_criteria = {
				field: "scheduled_start_time", //No I18N
				value: null,
				condition: "is", //No I18n
				children: [{
					field: "scheduled_end_time", //No I18N
					value: null,
					condition: "is", //No I18N
					logical_operator: "OR" //No I18N
													},
													{
														field: "scheduled_start_time",						//No I18N
													    value: end_ms,
													    condition: "lesser than",							 //No I18n
													    children:[
															{
																field: "scheduled_end_time",							//No I18N
													    	    value: start_ms,
													    	    condition: "greater than",							//No I18N
													    	    logical_operator: "AND"									 //No I18n
															}
													    ],
														logical_operator: "OR"	//No I18N

													}
											    ]
			};
			listInfo.search_criteria.push(unscheduled_criteria);
			if (ownerIds && ownerIds.length) {
				var owner_crit = {
					field: "owner", //No I18N
					values: ownerIds,
					condition: "is", //No I18n
					logical_operator: "AND" //No I18n
				};

				listInfo.search_criteria.push(owner_crit);
			}

			self._attach_filter_modules(listInfo);
			self._attach_filter_by(listInfo);
			self._attach_pending_criteria(listInfo);
			// self._attach_not_deleted_criteria(listInfo);
			self._attach_sort_by(listInfo);
			self._get_tasks_from_server(listInfo, callback);
		},

		_attach_filter_by: function (listInfo) {
			var self = this,
				o = self.options;

			if (o.filter && o.filter.id && o.filter.id != 0) {
				listInfo.filter_by = {
					id: o.filter.id
				};
			}
		},

		_attach_filter_modules: function (listInfo) {
			var self = this,
				o = self.options;

			//if there is projectid - no need to attach module filters
			if(o.current_tab == 'projects'){
				var module_crit = {
					field: "associated_entity", //No I18N
			        	values: ['Project','Milestone'],					//No I18N
					condition: "is", //No I18n
					logical_operator: "AND" //No I18n
				};
				listInfo.search_criteria.push(module_crit);
			}
		},

		_set_filtered_module: function () {
			var self = this,
				o = self.options;

			o.filtered_module = [];
			$.each($("input[name='taskModule']:checked"), function () { //No I18N
				o.filtered_module.push($(this).val());
			});
		},

		_attach_pending_criteria: function (listInfo) {
			var self = this,
				o = self.options;

			var status_crit = {
				field: "status.in_progress", //No I18N
				value: "true", //No I18n
				condition: "is", //No I18n
				logical_operator: "AND" //No I18n
			};
			listInfo.search_criteria.push(status_crit);
		},

		_attach_not_deleted_criteria : function(listInfo){
			var self = this,
			o = self.options;

			var not_deleted_crit = {
					field: "deleted",						//No I18N
		        	value: false,
		        	condition: "is",									 //No I18n
		        	logical_operator: "AND"								 //No I18n
			};
			listInfo.search_criteria.push(not_deleted_crit);
		},

		_attach_sort_by: function (listInfo) {
			var self = this,
				o = self.options;

			listInfo.sort_field = "owner.id"; //No I18N
			listInfo.sort_order = "asc"; //No I18N
		},

		_get_tasks_from_server: function (listInfo, callback) {
			var self = this;
				o = self.options;
			// self._showProgressBar(null, "Loading tasks...", null , null, false);

			var url = self._get_tasks_url();
			
			var state = o.scheduler.getState();

			var onSuccess = function (data, isSuccess) {

				var tasksToAdd = [];
				$.each(data.tasks, function (key, task) {
					if (o.scheduler.getEvent(task.id) == undefined) {
						if ((o.scheduler.getEvents(state.min_date, state.max_date).length + tasksToAdd.length) > o.max_event_count) {

							var inappropriate_user = task.owner ? task.owner.name : 'not-assigned'; // No I18N
							// sdpShowIndicator({success:false,message:getMessageForKey("sdp.scheduler.task.count.exceeded.alert") + ' ' + inappropriate_user});// No I18N
							// self._showProgressBar(null, "Loading tasks...", null , null, false);

							return false;
						} else {
							var taskEvent = self._create_scheduler_object(task, {});
							//var addedtaskid = o.scheduler.addEvent(taskEvent);
							// tasksToAdd.push(taskEvent);
							o.scheduler.setEvent(taskEvent.id,taskEvent);
						}
					}
				});
				// o.scheduler.parse(tasksToAdd, 'json'); //No I18n

				if (data.list_info.has_more_rows) {
					//Tasks limit exceeded - check
					if (o.scheduler.getEvents(state.min_date, state.max_date).length > o.max_event_count) {
						//sdpShowIndicator({success:false,message:getMessageForKey("sdp.scheduler.task.count.exceeded.alert")});// No I18N
						// self._showProgressBar(null, "Loading tasks...", null , null, false);
						if(callback){
							callback();
						}
					} else {
						listInfo.start_index = listInfo.start_index + 100;
						var dataVal = sdpAjaxInputData({
							"list_info": listInfo //NO I18N
						});
						sdpAjax({
							url: url,
							type: "GET", //NO I18N
							data: dataVal,
							acceptODCompatible: true,
							success: function (data) {
								onSuccess(data);
							}
						});
					}
				} else {
					if(callback){
						callback();
				}
				}
			};
			listInfo.start_index = 1;
			var dataVal = sdpAjaxInputData({
				"list_info": listInfo //NO I18N
			});

			sdpAjax({
				url: url,
				type: "GET", //NO I18N
				data: dataVal,
				acceptODCompatible: true,
				success: function (data) {
					onSuccess(data);
				}
			});
		},

		showProgressBar: function () {
			$(".res-mgmt-loading").addClass("active");
			$(".res-mgmt-loading").removeClass("inactive");
		},

		hideProgressBar: function() {
			$(".res-mgmt-loading").addClass("inactive");
			$(".res-mgmt-loading").removeClass("active");
		},

		_get_tasks_url: function (task) {
			var self = this,
				o = self.options;

			var url;
			if (o.projectId) {
				url = '/api/v3/projects' + '/' + o.projectId + '/' + 'tasks'; //NO I18N
				if(task) {
					if(task.parent === "project") { //NO I18N
						url = '/api/v3/projects/' + task[task.parent].id + '/tasks'; //NO I18N
					} else {
						url = '/api/v3/projects/' + task.project.id + '/milestones/' + task.milestone.id + '/tasks'; //NO I18N
					}
				}
            } else {
                if(task) {
                    if(task.parent === "request") { //NO I18N
                        url = '/api/v3/requests/' + task[task.parent].id + '/tasks'; //NO I18N
                    } else if(task.parent === "change") { //NO I18N
                        url = '/api/v3/changes/' + task[task.parent].id + '/tasks'; //NO I18N
                    } else if(task.parent === "problem") { //NO I18N
                        url = '/api/v3/problems/' + task[task.parent].id + '/tasks'; //NO I18N
                    } else if(task.parent === "project") { //NO I18N
                        url = '/api/v3/projects/' + task[task.parent].id + '/tasks'; //NO I18N
                    } else if(task.parent === "milestone") { //NO I18N
                        url = '/api/v3/projects/' + task.project.id + '/milestones/' + task.milestone.id + '/tasks'; //NO I18N
                    } else if(task.parent === "release") { //NO I18N
                        url = '/api/v3/releases/' + task[task.parent].id + '/tasks'; //NO I18N
                    }
                    else {
						url = '/api/v3/tasks'; //NO I18N
                    }
			} else {
				url = '/api/v3/tasks'; //NO I18N
			}
            }
			return url;
		},

		//Edit url for task
		_getUrl: function (task, appendid) {
			var o = this.options;
			var url = this._get_tasks_url(task);
			url += "/" + task.id; //No I18n
			return url;
		},

		_load_tasks_by_owner: function (opts, callback) {
			//ownerIds, load_unscheduled, start_date, end_date
			var self = this;
				o = self.options;

			// sdpShowIndicator({message:getMessageForKey("sdp.common.loading")+o.supported_types.task}); //No I18N
			// self._showProgressBar(null, "Loading tasks...", null , null, false);

			if(opts.load_all_tasks){
				if (opts.ownerIds) {
					var unassigned_index = opts.ownerIds.indexOf('not-assigned');
					if (unassigned_index != -1) {
						opts.ownerIds.splice(unassigned_index, 1);
					}

					if (o.show_unassigned_tasks) {
						opts.ownerIds.push(null);
					}

					return self._load_both_tasks(opts.ownerIds, opts.start_date, opts.end_date, callback);

				} else {
					var users_to_get_data = self._get_scheduler_resources();

					//By default all the unassigned tasks are fetched while clicking unassigned checkbox
					var unassigned_index = users_to_get_data.indexOf('not-assigned');
					if (unassigned_index != -1) {
						users_to_get_data.splice(unassigned_index, 1);
					}

					//check for Not-Assigned
					if (o.show_unassigned_tasks) {
						users_to_get_data.push(null);
					}

					//loading 10 resource's tasks at a time
					var i = 0;
					var size = Math.ceil(users_to_get_data.length/100);
					while(users_to_get_data.length){
						i++;
						var ten_owners = users_to_get_data.splice(0,100);
						if(i === size){
							self._load_both_tasks(ten_owners, opts.start_date, opts.end_date, callback);
						} else {
						self._load_both_tasks(ten_owners, opts.start_date, opts.end_date);
					}
				}

				}
			}else if(opts.load_unscheduled){

				if(opts.ownerIds){
					var unassigned_index = opts.ownerIds.indexOf('not-assigned');
					if (unassigned_index != -1) {
						opts.ownerIds.splice(unassigned_index, 1);
					}

					if (o.show_unassigned_tasks) {
						opts.ownerIds.push(null);
					}

					self._load_unscheduled_tasks(opts.ownerIds, callback);

			} else {
					var users_to_get_data = self._get_scheduler_resources();

					//By default all the unassigned tasks are fetched while clicking unassigned checkbox
					var unassigned_index = users_to_get_data.indexOf('not-assigned');
					if (unassigned_index != -1) {
						users_to_get_data.splice(unassigned_index, 1);
					}

					//check for Not-Assigned
					if (o.show_unassigned_tasks) {
						users_to_get_data.push(null);
					}

					//loading 10 resource's tasks at a time
					var i = 0;
					var size = Math.ceil(users_to_get_data.length/100);
					while(users_to_get_data.length){
						i++;
						var ten_owners = users_to_get_data.splice(0,100);
						if(i === size){
							self._load_unscheduled_tasks(opts.ownerIds, callback);
						} else {
							self._load_unscheduled_tasks(opts.ownerIds);
					}
				}
					// return Promise.all(promiseChain);
				}
			}else{
				if(opts.ownerIds){
					var unassigned_index = opts.ownerIds.indexOf('not-assigned');
					if (unassigned_index != -1) {
						opts.ownerIds.splice(unassigned_index, 1);
					}

					if (o.show_unassigned_tasks) {
						opts.ownerIds.push(null);
					}

					return self._load_scheduled_tasks(opts.ownerIds, opts.start_date, opts.end_date, callback);
					if(!opts.ownerIds.length){
						sdpHideIndicator();
					}
				} else {
					var users_to_get_data = self._get_scheduler_resources();

					//By default all the unassigned tasks are fetched while clicking unassigned checkbox
					var unassigned_index = users_to_get_data.indexOf('not-assigned');
					if (unassigned_index != -1) {
						users_to_get_data.splice(unassigned_index, 1);
					}

					//check for Not-Assigned
					if (o.show_unassigned_tasks) {
						users_to_get_data.push(null);
					}

					//loading 10 resource's tasks at a time
					var i = 0;
					var size = Math.ceil(users_to_get_data.length/100);
					while(users_to_get_data.length){
						i++
						var ten_owners = users_to_get_data.splice(0,100);
						if(i === size){
							self._load_scheduled_tasks(ten_owners, opts.start_date, opts.end_date, callback);
						} else {
						self._load_scheduled_tasks(ten_owners, opts.start_date, opts.end_date);
					}
				}
				}
			}
		},

		_before_inline_edit: function (event, backup_origitem, fields) {
			var self = this;
			var o = this.options;

			self._inline_edit(event, fields, function (data) {
				if (data.response_status.status === "success") {
                    o.scheduler.dhtmlXTooltip.hide();
					if(o.projectId){
					loadResourceUtilization(o.projectId);
					}else{
					    (typeof loadHomePageTabContent !== 'undefined' && loadHomePageTabContent('resource') === undefined) || window.location.reload();// No I18N
					}
				} else {
					self.refresh_after_edit(backup_origitem);
					var errorMsg;
					if (data.response_status.messages) {
						errorMsg = data.response_status.messages[0] ? data.response_status.messages[0].message : undefined;
					}
					if (!errorMsg) {
						errorMsg = getMessageForKey('sdp.scheduler.edit.failure.message'); // No I18N
					}
				}
			});
		},

		//For drag end, drag and drop editing of tasks(events), inside scheduler
		_inline_edit: function (event, fieldschanged, callbackfunc) {
			var self = this;
			var o = this.options;
			var param = {};
			param.task = self._get_changed_fields(event, fieldschanged);

			var url = self._getUrl(event, true);
			var dataVal = sdpAjaxInputData(param);
			$.ajax({
				url: url,
				type: "PUT", //NO I18N
				data: dataVal,
				headers: {"accept": "vnd.manageengine.v3+json"}, // NO I18N
				success: function (data) {
					callbackfunc(data);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					var responseJsonCheck = XMLHttpRequest.responseJSON && XMLHttpRequest.responseJSON.response_status;
					if(responseJsonCheck){
						var responseStatus = XMLHttpRequest.responseJSON.response_status;
						if(responseJsonCheck && responseStatus.messages && responseStatus.messages[0].status_code == 4001){
							showalert('failure', translate("sdp.task.invalid.owner"), 'isAutoHide=true,delay=2') // NO I18N
						}
	            		else if (responseJsonCheck && responseStatus.status_code == 4000 && responseStatus.messages[0].status_code >= 60000 && responseStatus.messages[0].status_code <= 60005){
	                        showalert('failure', responseStatus.messages[0].message, 'isAutoHide=true,delay=5') // NO I18N
						}
						else if (responseJsonCheck && responseStatus.status_code == 4000){
	                        showalert('failure', translate("api.validation.unauthorised"), 'isAutoHide=true,delay=2') // NO I18N
						}
					}
					callbackfunc(XMLHttpRequest.responseJSON);
				},
				async: false
			});
		},

		_get_changed_fields: function (event, fieldschanged) {
			var self = this;

			var returnObj = {};
			if (fieldschanged !== undefined) {
				$.each(fieldschanged, function (key, item) {
					var val;
					if (item == 'owner') {
						val = (event.owner_id === "not-assigned") ? null : self._get_id_obj(event.owner_id); //No I18N
						if (event.origitem.marked_technician) {
							returnObj.marked_technician = val;
						} else {
							returnObj[item] = val;
						}
					} else if (item == 'scheduled_start_time') { //No I18N
						val = self._get_as_date(event.start_date.getTime());
						returnObj[item] = val;
					} else if (item == 'scheduled_end_time') { //No I18N
						val = self._get_as_date(event.end_date.getTime());
						returnObj[item] = val;
					}

				});
			}
			return returnObj;
		},

		_get_as_date: function (b) {
			var a = {};
			if (b === "") {
				return null
			}
			var val = new Date(b);
			var utc = val.getTime() - (val.getTimezoneOffset() * 60000);

			if(parent.sdp_user.OFFSET) {
				utc = utc - (parent.sdp_user.OFFSET); //NO I18N
			}
			a.value = utc;
			return a
		},

		//For editing of the task events, using LightBox
		_editItems: function (taskitem) {
			var taskId = taskitem.id, module = taskitem.parent, moduleId, projectId;
            if (module != 'general') { moduleId = taskitem[module].id; }
            if(module === 'milestone'){ projectId = taskitem['project'].id; }
            $tasks.loadTasks("detail",module, moduleId,taskId,'resMgmt',projectId);// NO I18N
		},

		refresh_after_edit: function (item) {
			var self = this;
			var o = self.options;
			var tid = item.id;	
			var task = o.scheduler.getEvent(tid);
			task = self._create_scheduler_object(item, task);
			o.scheduler.updateEvent(tid);
			scheduler.updateView();
		},

		set_filter_and_refresh: function (filterId) {
			var self = this;
			o = this.options;
			o.filter = {
				id: filterId
			}
			self._clear_all();
			self.showProgressBar();
			self.refresh_scheduler_by_owner(undefined, function() {
			self._load_readonly_tasks();
			o.scheduler.updateView();
				self._fix_date_position();
				self.hideProgressBar();
			});

		},

		refresh_scheduler_by_owner: function (users_to_get_data, callback) {
			var self = this,
				o = self.options;

			var opts = {
				ownerIds: users_to_get_data,
				start_date: o.scheduler.getState().min_date,
				end_date: o.scheduler.getState().max_date
			}
			if(o.show_unscheduled_tasks){
				opts.load_all_tasks = true;
			}
			self._load_tasks_by_owner(opts, callback);

		},

		_get_events_between: function (from, to, tasks) {
			var result = [];
			for (var a in tasks) {
				var ev = tasks[a];
				if (ev && !ev.readonly && !ev.unscheduled && ((!from && !to) || (ev.start_date < to && ev.end_date > from))) {
					result.push(ev);
				}
			}
			return result;
		},

		_calculate_op_hours_between: function (from, to, tasks) {
			var self = this;
			var o = self.options;

			var millis = 0;

			$.each(tasks, function (idx, task) {
				var start_date = (task.start_date < from) ? from : task.start_date;
				var end_date = (task.end_date > to) ? to : task.end_date;

				var owner = task.owner;
				var owner_site_id;
				if(owner){
					var users = self._get_users();
					var user = users.filter(function(user) { return user.key == owner.id });
					user = user.length? user[0].orig: null;
					owner_site_id = self._get_user_site_for_index(user);
				} else {
					owner_site_id = 0;
				}
		    	var operational_hours;

				var now = new Date(start_date);
				now.setHours(0, 0, 0, 0);

				while (now <= end_date) {

					var is_it_holiday = self._is_tech_holiday(now, owner_site_id);
					var is_it_weekend = self._is_tech_weekend(now, owner_site_id);
					if (!is_it_holiday && !is_it_weekend && !self._is_excluded_day(now, owner_site_id)) {
						var days_of_operation = o.operational_hours[owner_site_id]? o.operational_hours[owner_site_id].operational_hours.days_of_operation : o.operational_hours[0].operational_hours.days_of_operation;
						var current_day = self._find_day_index(now, days_of_operation);
						operational_hours = days_of_operation[current_day].hours_of_operation;
						var break_mins = ((operational_hours.break_end_time.hours * 60) + operational_hours.break_end_time.minutes) - ((operational_hours.break_start_time.hours * 60) + operational_hours.break_start_time.minutes);
						var operational_mins = ((operational_hours.end_time.hours * 60) + operational_hours.end_time.minutes) - ((operational_hours.start_time.hours * 60) + operational_hours.start_time.minutes) - break_mins;
						millis += (operational_mins * 60 * 1000);
					}
					now.setDate(now.getDate() + 1);
				}

				//==============adjust start op_hours=============//
				if (!(self._is_tech_weekend(start_date, owner_site_id) || self._is_tech_holiday(start_date, owner_site_id)) || self._is_excluded_day(start_date, owner_site_id)) {

					var days_of_operation = o.operational_hours[owner_site_id]? o.operational_hours[owner_site_id].operational_hours.days_of_operation : o.operational_hours[0].operational_hours.days_of_operation;
					var current_day = self._find_day_index(start_date, days_of_operation);
					operational_hours = days_of_operation[current_day].hours_of_operation;
					var op_hrs_start = new Date(start_date);
					op_hrs_start.setHours(operational_hours.start_time.hours, operational_hours.start_time.minutes, 0, 0);
					var op_hrs_end = new Date(start_date);
					op_hrs_end.setHours(operational_hours.end_time.hours, operational_hours.end_time.minutes, 0, 0);

					var op_break_hrs_start = new Date(start_date);
					op_break_hrs_start.setHours(operational_hours.break_start_time.hours, operational_hours.break_start_time.minutes, 0, 0);
					var op_break_hrs_end = new Date(start_date);
					op_break_hrs_end.setHours(operational_hours.break_end_time.hours, operational_hours.break_end_time.minutes, 0, 0);


					if (start_date > op_hrs_start && start_date < op_hrs_end){

					 	if(start_date > op_break_hrs_start && start_date < op_break_hrs_end) {
							//started inbetween of operational break hours
							millis -= (op_break_hrs_start - op_hrs_start);
						}
						else if(start_date >= op_break_hrs_end){
							//started after operational break hours
							millis -= ((start_date - op_break_hrs_end) + (op_break_hrs_start - op_hrs_start));
						}
						else{
							//started before operational break hours
							millis -= (start_date - op_hrs_start);
						}
					}
					else if (start_date > op_hrs_start) {
						var break_mins = ((operational_hours.break_end_time.hours * 60) + operational_hours.break_end_time.minutes) - ((operational_hours.break_start_time.hours * 60) + operational_hours.break_start_time.minutes);
						var operational_mins = ((operational_hours.end_time.hours * 60) + operational_hours.end_time.minutes) - ((operational_hours.start_time.hours * 60) + operational_hours.start_time.minutes) - break_mins;
						millis -= (operational_mins * 60 * 1000);

					}
				}

				if (!(self._is_tech_weekend(end_date, owner_site_id) || self._is_tech_holiday(end_date, owner_site_id) || self._is_excluded_day(end_date, owner_site_id))) {


					var days_of_operation = o.operational_hours[owner_site_id]? o.operational_hours[owner_site_id].operational_hours.days_of_operation : o.operational_hours[0].operational_hours.days_of_operation;
					var current_day = self._find_day_index(end_date, days_of_operation);
					operational_hours = days_of_operation[current_day].hours_of_operation;
					var op_hrs_start = new Date(end_date);
					op_hrs_start.setHours(operational_hours.start_time.hours, operational_hours.start_time.minutes, 0, 0);
					var op_hrs_end = new Date(end_date);
					op_hrs_end.setHours(operational_hours.end_time.hours, operational_hours.end_time.minutes, 0, 0);

					var op_break_hrs_start = new Date(end_date);
					op_break_hrs_start.setHours(operational_hours.break_start_time.hours, operational_hours.break_start_time.minutes, 0, 0);
					var op_break_hrs_end = new Date(end_date);
					op_break_hrs_end.setHours(operational_hours.break_end_time.hours, operational_hours.break_end_time.minutes, 0, 0);


					if (end_date < op_hrs_end && end_date > op_hrs_start) {

						if (end_date < op_break_hrs_end && end_date > op_break_hrs_start){
							//inbetween op break hours
							millis -= (op_hrs_end - op_break_hrs_end);
						}
						else if (end_date <= op_break_hrs_start){
							//before op break hours
							millis-= ((op_hrs_end - op_break_hrs_end) + (op_break_hrs_start - end_date));
						}
						else{
							//after op break hours
							millis-= (op_hrs_end - end_date)
						}
					} else if (end_date < op_hrs_end) {
						var break_mins = ((operational_hours.break_end_time.hours * 60) + operational_hours.break_end_time.minutes) - ((operational_hours.break_start_time.hours * 60) + operational_hours.break_start_time.minutes);
						var operational_mins = ((operational_hours.end_time.hours * 60) + operational_hours.end_time.minutes) - ((operational_hours.start_time.hours * 60) + operational_hours.start_time.minutes) - break_mins;
						millis -= (operational_mins * 60 * 1000);

					}
				}


			});
			return Math.floor(millis / (1000 * 60));
		},

		_calculate_total_op_hours_between: function (from, to, owner) {
			var self = this;
			var o = self.options;

			var now = new Date(from.getTime());
			now.setHours(0, 0, 0, 0);
			var total_time_in_millis = 0;

			//Both start and having 00:00 as start time. so, <= check considers additional one day
	    	var owner_site_id = self._get_user_site_for_index(owner);
	    	var operational_hours, break_mins, operational_mins, op_millis;

			while (now < to) {

				if (!self._is_tech_weekend(now, owner_site_id) && !self._is_tech_holiday(now, owner_site_id) && !self._is_excluded_day(now, owner_site_id)){

					var days_of_operation = o.operational_hours[owner_site_id]? o.operational_hours[owner_site_id].operational_hours.days_of_operation : o.operational_hours[0].operational_hours.days_of_operation;
					var current_day = self._find_day_index(now, days_of_operation);
					operational_hours = days_of_operation[current_day].hours_of_operation;
					break_mins = ((operational_hours.break_end_time.hours * 60) + operational_hours.break_end_time.minutes) - ((operational_hours.break_start_time.hours * 60) + operational_hours.break_start_time.minutes);
					operational_mins = ((operational_hours.end_time.hours * 60) + operational_hours.end_time.minutes) - ((operational_hours.start_time.hours * 60) + operational_hours.start_time.minutes) - break_mins;
					op_millis = operational_mins * 60 * 1000;
					total_time_in_millis += op_millis;
				}
				//loop increment
				now.setDate(now.getDate() + 1);
			}
			return Math.floor(total_time_in_millis / (1000 * 60));
		},

		_load_readonly_tasks: function (min_date, max_date, sections) {
			var self = this;
				o = self.options;

			var state = scheduler.getState();

			var users_key_val = self._get_resource_key_value(sections);

			if (o.show_utilization && (o.zoom_level == 'days' || o.zoom_level == 'weeks')) {
				$.each(users_key_val, function (userId, orig_item) {

					var newEvent = {
						id: userId + '_user', //No I18N
						owner: orig_item,
						text: 'work hours', //No I18N
						owner_id: userId,
						readonly: true,
						color: '#BDBDBD', //No I18N
						textColor: 'white', //No I18N
						start_date: min_date? min_date : state.min_date,
						end_date: max_date? max_date : state.max_date
					};

					if(userId !== "not-assigned") {
					    scheduler.setEvent(newEvent.id, newEvent);
					}

				});
				if (!o.utilMouseMoveEvent) {
					o.utilMouseMoveEvent = scheduler.attachEvent("onMouseMove", function (id, e) {
						if (id) {
							if (scheduler.getEvent(id).readonly) {
								if ($(e.target).hasClass('load-util-blue') || $(e.target).hasClass('load-util-red') || $(e.target).hasClass('load-util-text-red') || $(e.target).hasClass('load-util-text-blue')) {
									// hideAllSDPShowDialog(event,true);
									var element = e.target;
									if ($(element).hasClass('load-util-text-red') || $(element).hasClass('load-util-text-blue')) {
										element = $(element).prev();
									}
									var workMins = $(element).data('totworkmin'); //No I18N
									var opMins = $(element).data('totopmin'); //No I18N
									var heading, headingClassAdd, headingClassRemove, excessOrRemText;
									var excessTime = (Math.floor(Math.abs(opMins - workMins) / 60)) + translate("sdp.requests.view.short.hour") + ' ' + (Math.abs(opMins - workMins) % 60) + translate("sdp.requests.view.short.minute"); //No I18N

									var load = Math.floor(workMins / 60) + translate("sdp.requests.view.short.hour") + ' ' + workMins % 60 + translate("sdp.requests.view.short.minute") + ' /' + Math.floor(opMins / 60) + translate("sdp.requests.view.short.hour") + ' ' + opMins % 60 + translate("sdp.requests.view.short.minute"); //No I18N

									if (workMins > opMins) {
										heading = translate('sdp.over.utilized'); //No I18N
										excessOrRemText = translate('sdp.utilization.excess'); //No I18N
										headingClassAdd = 'rtm-over-util'; //No I18N
										headingClassRemove = 'rtm-under-util'; //No I18N
									} else {
										heading = translate('sdp.under.utilized');; //No I18N
										excessOrRemText = translate('sdp.remaining'); //No I18N
										headingClassAdd = 'rtm-under-util'; //No I18N
										headingClassRemove = 'rtm-over-util'; //No I18N
									}
									$('#rtm-hour-manage .rtm-load .rtm-wh-value').text(load);
									$('#rtm-hour-manage .rtm-excess-rem .rtm-wh-value').text(excessTime);
									$('#rtm-hour-manage .rtm-excess-rem .rtm-wh-label').text(excessOrRemText);
									$('#rtm-hour-manage .rtm-wh-heading').removeClass(headingClassRemove).addClass(headingClassAdd).text(heading);

									$(element).parent().attr("showpopover", true);
									$(element).parent().attr("data-popover", "mouseover");
									$(element).parent().attr("data-target-id", "#util-popup");
									$(element).parent().attr("custom-class", "res-popover");
									$(element).parent().attr("data-icon", "true");
									$(element).parent().off().on("mouseover", function(event) {
										showPopover(event, "mouseover"); // NO I18N
									    $('#showPopover').removeClass("popover-ui");
									});
								}
							}
						}
					});
				}

			} else {
				//deleting previous utilization (readonly) tasks for hours and year view
				var totalEvents = scheduler.getEvents(state.min_date, state.max_date);
				$.each(totalEvents, function (index, item) {
					if (item.readonly) {
						delete scheduler._events[item.id];
					}
				});

				delete o.utilMouseMoveEvent;
			}

		},

		//this is used by prev next and date filters
		_load_tasks: function (start_date, end_date, load_unscheduled, callback) {
			var self = this,
				o = self.options;



			var opts = {
				start_date: start_date,
				end_date: end_date,
			};

			if(load_unscheduled){
				opts.load_all_tasks=true
			}
			self._load_tasks_by_owner(opts, callback);
		},

		reload_task: function (id,event) {
			var self = this;
			var url = self._getUrl(event);
			setTimeout(function () {
				sdpAjax({
					url: url, //NO I18N
					type: "GET", //NO I18N
					acceptODCompatible: true,
					success: function (data) {
						var task = data.task;
						var event = self.options.scheduler.getEvent(id);
						var taskEvent = self._create_scheduler_object(task, event);
						self.options.scheduler.updateEvent(taskEvent);
						self.options.scheduler.updateView();
					},
					async: false
				});
			}, 500)
		},

		delete_task: function (id) {
			var self = this;
			self.options.scheduler.deleteEvent(id);
		},

		_get_id_obj: function (id) {
			var obj = {};
			if (id === "") {
				return null;
			}
			obj.id = id;
			return obj;
		},

		_fullscreen_config: function () {
			var self = this;
			var o = self.options;

			$('.dhx_expand_icon').on('click.fullscreen', function (e) {
				self._fullscreen_toggle();
			});
		},

		_fullscreen_toggle: function() {
				// TODO Need to Refactor later
			var self = this;
			var o = self.options;
				var width = jQuery("#filter-menu")[0].clientWidth;
				jQuery("#filter-menu").css("top", jQuery(".dhx_scale_bar").offset().top + 13); // NO I18N
				if(jQuery("#zooming").val() === "days") {
					jQuery("#filter-menu").css("top", jQuery(".dhx_scale_bar").offset().top); // NO I18N
				}
				jQuery("#filter-menu").css("z-index", "102");  // NO I18N

				if(sdp_user.DIRECTION === "RTL") {
					jQuery("#filter-menu").css("right", ((200 - width)/2) + (jQuery(window).width() - (jQuery(".dhx_cal_header").offset().left + jQuery(".dhx_cal_header").outerWidth()))); // NO I18N
				} else {
      				jQuery("#filter-menu").css("left", ((200 - width)/2) +  jQuery(".dhx_cal_header").offset().left); // NO I18N
				}

				self._fullscreen_tooltip();

				if (o.scheduler.expanded) {
					jQuery("#filter-menu").css("z-index", "103"); // NO I18N
					$('#res-filter-left').parent().css('z-index', '104'); //No I18N
					$('#res-filter-left').removeClass('res-filter-left'); //No I18N
				    $(".dhx_expand_icon").attr('style', 'background-position: -286px -75px !important'); //No I18N
				    $(".dhx_expand_icon").css("top", "13px")
					$('#res-filter-left').addClass('res-filter-left-expand'); //No I18N
					$('#res-filter-right').removeClass('res-filter-right'); //No I18N
					$('#res-filter-right').addClass('res-filter-right-expand'); //No I18N
					$('#res-filter-left,#res-filter-right').css('top', "-" + (Number(jQuery("#res-filter-left").parent().offset().top) - Number(jQuery("#disp_date").offset().top) + "px"));
					$('#scheduler_container').css('z-index', 100); //No I18N

					$('.dhx_cal_data').trigger('scroll');

					//change readonly bar width
					var readonly_width = $('.dhx_data_table')[0].style.width;
					$('#readonly-bar-width-style').html('.readonly-bar-width{width : ' + readonly_width + ' !important}'); //No I18N

				} else {
					jQuery("#filter-menu").css("z-index", "13"); // NO I18N
				    $('#res-filter-left,#res-filter-right').css('top', "1px");
					$('#res-filter-left').parent().css('z-index', '20'); //No I18N
				    $(".dhx_expand_icon").attr('style', 'background-position: -265px -75px !important'); //No I18N
				    $(".dhx_expand_icon").css("top", "12px")
					$('#res-filter-left').addClass('res-filter-left'); //No I18N
					$('#res-filter-left').removeClass('res-filter-left-expand'); //No I18N
					$('#res-filter-right').addClass('res-filter-right'); //No I18N
					$('#res-filter-right').removeClass('res-filter-right-expand'); //No I18N
					$('#scheduler_container').css('z-index', 5); //No I18N

					//loading readonly tasks as its width changes
					self._load_readonly_tasks();

					//reset readonly_width
					$('#readonly-bar-width-style').html('.readonly-bar-width{width : ' + $('.dhx_data_table')[0].style.width + ' !important}'); //No I18N
				}
		},

		_fullscreen_tooltip: function () {
			var self = this;
			var o = self.options;

			if (o.scheduler.expanded) {
				$('.dhx_expand_icon').attr('title', translate('sdp.exit.fullscreen'));
			} else {
				$('.dhx_expand_icon').attr('title', translate('sdp.fullscreen'));
			}
		},

		_fix_technician_filter_position: function() {
			var width = jQuery("#filter-menu")[0].clientWidth;
			if(o.zoom_level === "days") {
				jQuery("#filter-menu").css("top", jQuery(".dhx_scale_bar").offset().top);  // NO I18N
			} else {
				jQuery("#filter-menu").css("top", jQuery(".dhx_scale_bar").offset().top + 13);  // NO I18N
			}
			if(sdp_user.DIRECTION === "RTL") {
                jQuery("#filter-menu").css("right", ((200 - width)/2) + (jQuery(window).width() - (jQuery(".dhx_cal_header").offset().left + jQuery(".dhx_cal_header").outerWidth()))); // NO I18N
            } else {
                jQuery("#filter-menu").css("left", ((200 - width)/2) +  jQuery(".dhx_cal_header").offset().left); // NO I18N
            }
            jQuery(".dhx_cal_scale_placeholder").parent().parent().remove();
		},

		//Zooming in and out of timeline view
		zoom_schedule: function (val, starttime, endtime) {
			var starting_date = starttime ? new Date(Number(starttime)) : new Date();
			var self = this,
				o = self.options;
			self._clear_all();
			o.zoom_level = val;
			self.showProgressBar();
			self._time_period_config(val, starttime, endtime);

			o.scheduler.setCurrentView(starting_date);

			var state = o.scheduler.getState();
			var start_date = state.min_date;
			var end_date = state.max_date;
			self._load_tasks(start_date, end_date, o.show_unscheduled_tasks,function() {
				self._load_readonly_tasks(start_date, end_date);
				o.scheduler.updateView();
				self._fix_date_position();
				self._fix_technician_filter_position();
				self.hideProgressBar();
				var width = jQuery(".dhx_cal_header.dhx_second_cal_header").find(".dhx_scale_bar.dhx_second_scale_bar:last-child").width();
				jQuery(".dhx_cal_header.dhx_second_cal_header").find(".dhx_scale_bar.dhx_second_scale_bar:last-child")
					.css("width", width + 17); // NO I18N
				self._set_personalization(null, true);
			});

		},

		_set_timeline_matrix: function (timeline_config) {
			var self = this,
				o = self.options;

			o.scheduler.matrix.timeline.x_unit = timeline_config.x_unit;
			o.scheduler.matrix.timeline.x_step = timeline_config.x_step ? timeline_config.x_step : 1;
			o.scheduler.matrix.timeline.x_size = timeline_config.x_size;
			o.scheduler.matrix.timeline.x_start = 0;
			o.scheduler.matrix.timeline.x_length = timeline_config.x_size;
			o.scheduler.matrix.timeline.y_unit = self._get_resources_as_obj();
			o.scheduler.matrix.timeline.y_property = "owner_id"; //No I18N
			if (timeline_config.second_scale) {
				o.scheduler.matrix.timeline.second_scale = {};
				o.scheduler.matrix.timeline.second_scale.x_unit = timeline_config.second_scale.x_unit;
			} else {
				o.scheduler.matrix.timeline.second_scale = undefined;
			}

			if (timeline_config.x_date) {
				o.scheduler.matrix.timeline.x_date = timeline_config.x_date;
			}
			if (timeline_config.second_scale && timeline_config.second_scale.x_date) {
				o.scheduler.matrix.timeline.second_scale.x_date = timeline_config.second_scale.x_date;
			}
		},

		load_technician_filter: function (event) {

				var self = this;
				var site_max_count = 1;

				//  To store temporarily since single project view is not personalized.
				if(o.projectId) {
					o.project_members = $('.popover #res-select').select2('val');
				}

				showPopover(event, 'click'); //NO I18N
				$('#showPopover').removeClass("popover-ui");

				$('#showPopover #apply_filter').off('click').on('click', function() {
                    jQuery('#scheduler_container').scheduler('set_res_filter');closeDD(); //NO I18N
                })
                $('#showPopover #cancel-member-filter').off('click').on('click', function() {
                    closeDD();
                })

				jQuery('.popover #site-select').select2({
					placeholder:translate("sdp.admin.org.technician.allsite"),	//No I18N
					multiple : false,
					maximumSelectionSize: site_max_count,
					formatSelectionTooBig: function (limit) {return getMessageForKey('sdp.scheduler.sites.count.alert');},		//No I18n
					formatSelection:function(item){return ashtmlString(item.name);},
					formatNoMatches: translate("common.no.match.found"), // NO I18N
					formatResult:function(item){return ashtmlString(item.name);},
					allowClear:true,
					query:function(options){
						self.construct_site_filter(options);
					}
				}).on('change',function(event){
					jQuery('.popover #group-select').select2('val','');	// No I18N
					jQuery('.popover #res-select').select2('val','');	// No I18N
				}).on('select2-close',function(event){
					setTimeout(function() {
						jQuery(".tech-popover").css("display", "block"); // NO I18N
						jQuery("body").on("click", function() {
							closeDD();
						});
					}, 150);
				});

				var group_max_count = 10;

				jQuery('.popover #group-select').select2({
					placeholder: translate('sdp.admin.org.technician.allgroup'),	//No I18N
					multiple : true,
					maximumSelectionSize: group_max_count,
					formatSelectionTooBig: function (limit) {return translate('sdp.max.count');},		//No I18n
					formatSelection:function(item){return ashtmlString(item.name);},
					formatResult:function(item){return ashtmlString(item.name);},
					formatNoMatches: translate("common.no.match.found"), // NO I18N
					allowClear:true,
					closeOnSelect:false,
					containerCssClass: 'group-select',	//No I18n
					query:function(options){
						jQuery('#scheduler_container').scheduler("construct_group_filter",options);	//NO I18N
					}
				}).on('change',function(event){
					jQuery(".popover #res-select").select2("close");	//No I18N
					if((event.val.length == 1 && event.added) || event.removed){
						jQuery('.popover #res-select').select2('val','');	// No I18N
					}
				}).on('select2-close',function(event){
					setTimeout(function() {
						jQuery(".tech-popover").css("display", "block"); // NO I18N
						jQuery("body").on("click", function() {
							closeDD();
						});
					}, 150);
				});


				jQuery('.popover #res-select').select2({
					placeholder:  o.current_tab === "projects"? translate('sdp.all.project.members'):translate('sdp.calendar.alltechs'),	//No I18N
					multiple : true,
					maximumSelectionSize: 10,
					formatSelectionTooBig: function (limit) {return translate('sdp.max.count');},		//No I18n
					formatSelection:function(item){return ashtmlString(item.name);},
					formatResult:function(item){return ashtmlString(item.name);},
					formatNoMatches: translate("common.no.match.found"), // NO I18N
					allowClear:true,
					closeOnSelect:false,
					containerCssClass: 'res-select',	//No I18n
					query:function(options){
						jQuery('#scheduler_container').scheduler("construct_res_filter",options);	 //NO I18N

					}
				}).on('select2-close',function(event){
					setTimeout(function() {
						jQuery(".tech-popover").css("display", "block"); // NO I18N
						jQuery("body").on("click", function() {
							closeDD();
						});
					}, 150);
				});

				setTimeout(function(){
					jQuery("#filter-by").css("display", 'block'); //NO I18N
					jQuery("#filter-by").parent().css("width", "inherit"); //NO I18N
					jQuery("#_DIALOG_LAYER .DialogBox tbody").children().first().remove(); //NO I18N
				}, 1);

				self._set_filters_with_personalization_data();

		},


		_init_task_filter: function () {
			var o = this.options;
			var taskfilters;

			var dataVal = sdpAjaxInputData({
                "module": "task", //NO I18N
                "list_info": { //NO I18N
                    "row_count": "100", //NO I18N
                }
            });
			sdpAjax({
				url: "/api/v3/list_view_filters/show_all", //NO I18N
				type: "GET", //NO I18N
				acceptODCompatible: true,
				data: dataVal,
				success: function (data) {
                    data.show_all = data.show_all.filter(function (item) {
                      if(item.name != "my_completed_tasks" && item.name != "completed_tasks"){//No I18N
                        return item;
                      }
                    });
                    taskfilters = data;
				},
				async: false
			});
			$("#task_custom_filter").on('click', function () {
				var filterList_obj = new filterListComp();

				if(typeof closeDD !== 'undefined') {
                    closeDD();
                }
				filterList_obj.initComponent({
					element: "#TasksFilterMenu", //No I18N
					module: "task", //No I18N
					personalize_key: "task_filter_views", //No I18N
					skipPersonalization: true, //NO I18N
					filter_action: "setTaskFilterForRM", //No I18N
					managefilter_url: "/ListViewFilter.do?module=task&action=listview", //No I18N
					user_type: sdp_user.USERTYPE,
					favoritable: true,
					data: taskfilters,
					processFilters: function(data){
                        data = data.filter(function (item) {
                            if(item.name != "my_completed_tasks" && item.name != "completed_tasks"){//No I18N
                                return item;
                            }
                        });
                        return data;
                    }
				});
			});

			var filterId;
			if (o.task_filter != null) {
				filterId = (o.task_filter.list_info && o.task_filter.list_info.filter_by) ? o.task_filter.list_info.filter_by.id:null;
			}

			var filterName;
			var filters = taskfilters.show_all;
			var defaultFilterName;

			for(var i=0; i < filters.size(); i++) {
				var filter = filters[i];
				if(filter.id == 0) {
					defaultFilterName = filter.display_name;
				}
				if(filter.id == filterId) {
					filterName = filter.display_name;
					break;
				}
			}

			if(!filterName) {
				filterId = 0;
				o.filter = null;
				filterName = defaultFilterName;
			}

			$("#selected_tasklist_filter").text(filterName);

		},

		_time_period_config: function (val, starttime, endtime) {
			var self = this,
			o = self.options;
			var starting_date = starttime ? new Date(Number(starttime)) : new Date();
			o.starting_date = starting_date;
			var ending_date = endtime ? new Date(Number(endtime)) : endtime;
			jQuery("#zooming-text").text(translate('sdp.change.sla.' + val));
			jQuery("#zooming").val(val);
			o.zoom_level = val;
			if (!o.scheduler.matrix.timeline.second_scale) {
				o.scheduler.matrix.timeline.second_scale = {};
			}

			switch (val) {
				case "months": //No I18N
					var min_size = 32;
					var max_size = 92;
					var size;
					o.scheduler.deleteMarkedTimespan();
					if (starttime !== undefined && endtime !== undefined) {
						size = Math.ceil((ending_date - starting_date) / (1000 * 60 * 60 * 24));

						if (size < min_size) {
							self._time_period_config('weeks', starttime, endtime); //No I18N
							return;
						} else if (size > max_size) {
							size = max_size;
						}

					} else {
						size = max_size;
						o.ending_date = scheduler.date.add(starting_date, size, 'day'); //No I18n
					}

					var timeline_config = {
						x_unit: "day", //NO I18N
						x_size: size,
						x_date: "%j",//NO I18N
						second_scale: {
							x_unit: "month", //NO I18N
							x_date: "%M %Y" //NO I18N
						}
					};
					self._set_timeline_matrix(timeline_config);
					o.scheduler.ignore_timeline = null;
					break;

				case "weeks": //No I18N

					var min_size = 7;
					var max_size = 31;

					var size = 1;
					if (starttime !== undefined && endtime !== undefined) {
						size = Math.ceil((ending_date - starting_date) / (1000 * 60 * 60 * 24));
						if (size < min_size) {
							self._time_period_config('days', starttime, endtime); //No I18N
							return;
						} else if (size > max_size) {
							size = max_size;
						}

					} else {
						size = max_size;
						o.ending_date = scheduler.date.add(starting_date, size, 'day'); //No I18n
					}

					if($(window).width() > 1600) {
					var timeline_config = {
						x_unit: "day", //NO I18N
						x_size: size,
						x_date: "%j %M",//NO I18N
						second_scale: {
						x_unit: "week", //NO I18N
							x_date: "%F '%y" //NO I18N
						}
					};
					} else {
						var timeline_config = {
							x_unit: "day", //NO I18N
							x_size: size,
							x_date: "%j",//NO I18N
							second_scale: {
							x_unit: "week", //NO I18N
								x_date: "%F '%y" //NO I18N
							}
						};
					}

					o.scheduler.templates.timeline_second_scale_date = function (date) {
						var month = sdpDate.format({"entire_date" : date , "type" : "MMMM"}); // NO I18N
						var year = sdpDate.format({"entire_date" : date , "type" : "YY"}); // NO I18N
						return month + " '" + year;
					};

					o.scheduler.templates.timeline_scale_date = function (date) {
						var month = sdpDate.format({"entire_date" : date , "type" : "MMM"}); // NO I18N
						return sdpDate.format({"entire_date" : date , "type" : "DD"}) + " " + month; // NO I18N
					};

					self._set_timeline_matrix(timeline_config);
					o.scheduler.ignore_timeline = null;
					break;
				case "days": //No I18N

					//size in half hour
					var min_size = 2;
					var max_size = 7;

					var size = 1;

					if (starttime !== undefined && endtime !== undefined) {
						size = Math.ceil((ending_date - starting_date) / (1000 * 60 * 60 * 24)); //To show from and to date
						if (size < min_size) {
							$('#date_select').val(starttime);
							$('#date_select_Display').val(sdpDate.format({"entire_date" : starttime , "type" : "DD MM YYYY"}));
							self._time_period_config('hours', starttime, endtime); //No I18N
							return;
						} else if (size > max_size) {
							$('#date_select').val(starttime);
							$('#date_select_Display').val(sdpDate.format({"entire_date" : starttime , "type" : "DD MM YYYY"}));
							self._time_period_config('weeks', starttime, endtime); //No I18N
							return;
						}

					} else {
						size = max_size;
						o.ending_date = scheduler.date.add(starting_date, size, 'day'); //No I18n
					}

					//size = size*3;

					o.scheduler.matrix.timeline.x_unit = "day"; //No I18N
					o.scheduler.matrix.timeline.x_step = 1;
					o.scheduler.matrix.timeline.x_size = size;
					o.scheduler.matrix.timeline.x_start = 0;
					o.scheduler.matrix.timeline.x_length = size;
					o.scheduler.matrix.timeline.y_unit = self._get_resources_as_obj();
					o.scheduler.matrix.timeline.y_property = "owner_id"; //No I18N
					delete o.scheduler.matrix.timeline.second_scale;
					o.scheduler.matrix.timeline.x_date = "%j %M (%D)"; //No I18N
					o.scheduler.templates.timeline_scale_date = function (date) {
						var month = sdpDate.format({"entire_date" : date , "type" : "MMM"}); // NO I18N
						var day = sdpDate.format({"entire_date" : date , "type" : "ddd"}); // NO I18N
						var date = sdpDate.format({"entire_date" : date , "type" : "DD"}); // NO I18N
						return date + " " + month + " (" + day + ")";
					};

					o.scheduler.ignore_timeline = null;
					break;
				case "hours": //No I18N
					var timeline_config = {
						x_unit: "hour", //NO I18N
						x_size: 24,
						x_date: "%H:%i", //NO I18N
						second_scale: {
							x_unit: "day", //NO I18N
							x_date: "%j %F (%D)" //NO I18N
						}
					};
					o.scheduler.templates.timeline_scale_date = function (date) {
						return sdpDate.format({"entire_date" : date , "type" : "HH:mm"}); // NO I18N
					};

					o.scheduler.templates.timeline_second_scale_date = function (date) {
						var month = sdpDate.format({"entire_date" : date , "type" : "MMMM"}); // NO I18N
						var year = sdpDate.format({"entire_date" : date , "type" : "YY"}); // NO I18N
						return month + " '" + year;
					};

					self._set_timeline_matrix(timeline_config);
					o.scheduler.ignore_timeline = null;
					break;
			};


		},

		setZoomLevel: function(event) {
	var selected_option = jQuery(event).attr("name");
	jQuery("#zooming").val(selected_option);
	jQuery("#zooming-text").text(jQuery(event).text());
	jQuery('#scheduler_container').scheduler('zoom_schedule', selected_option); //No I18N
		},

		setEventOptions: function(event) { // attr('selected') is removed in jquery so selected is changed as data-selected. //NO I18N
	var selected_option = jQuery(event).attr("name");
	jQuery(".bar-settings a[data-selected]").removeAttr("data-selected"); //NO I18N
	jQuery(event).attr("data-selected",'true'); //NO I18N
	selected_option = selected_option.replace(" ", "_");
	jQuery('#scheduler_container').scheduler('change_bar_color', jQuery(".bar-settings a[data-selected]").attr("name")); //No I18N
		},

		setBarColorAndLegends: function(colorBasedOn, callback) {
			var self = this;
			o = self.options;
	jQuery('#scheduler_legends').html('');
	var label_text = jQuery('<span class="project-sch-footer-heading"/>');

	if (colorBasedOn != 'none') {
		label_text.text(label_text.text() + ' (' + jQuery("[name=" + colorBasedOn + "]").text() + '):');
		var listInfo = {
			'start_index': 1, //NO I18N
			'row_count': 100 //NO I18N
		};
		var url = '/api/v3/tasks/' + colorBasedOn; //NO I18N

		if(colorBasedOn == 'status') {
			listInfo.search_criteria = {
				'field' : "in_progress", //No I18N
				'condition': 'is', //No I18N
				'value': true //No I18N
			}
		}

		if(o.projectId) {
			url = '/api/v3/projects/' + o.projectId + '/tasks/' + colorBasedOn;  //NO I18N
		}

		var onSuccess = function (data, isSuccess) {
			if (colorBasedOn != 'status') {
						self.buildAndAppendLegend('#1796b0', translate('sdp.common.notassigned')); // No I18N
			}

			jQuery.each(data[colorBasedOn], function (key, item) {
						self.buildAndAppendLegend(item.color, item.name);
			});

			if (data.list_info.has_more_rows) {
				listInfo.start_index = data.list_info.start_index + 100;
				var dataVal = sdpAjaxInputData({
					"list_info": listInfo, //NO I18N
					"for": "resource_mgmt" // NO I18N
				});
				sdpAjax({
					url: url,
					type: "GET", //NO I18N
					data: dataVal,
					acceptODCompatible: true,
					success: function (data) {
						onSuccess(data);
					}
				});
			} else {
				if(!o.scheduler.expanded) {
					if(o.current_tab === "home") {
					var height = jQuery(".project-sch-footer").position().top - jQuery(".headerbar")[0].getBoundingClientRect().bottom;
					jQuery(".project-sch-container").height(height);
					jQuery(".project-sch-footer").width(jQuery(".headerbar").width());
					} else if(o.current_tab === "projects") { // NO I18N
						if(o.projectId) {
							var height = jQuery(".project-sch-footer").position().top - jQuery("[data-id=ui-tabs1-pos]")[0].getBoundingClientRect().bottom - 14;
							jQuery(".project-sch-container").height(height);
							jQuery(".project-sch-footer").width(jQuery("#ui-framework-design1").width() - 40);
						} else {
							var height = jQuery(".project-sch-footer").position().top - jQuery("#ui-framework-design1")[0].getBoundingClientRect().bottom;
							jQuery(".project-sch-container").height(height);
							jQuery(".project-sch-footer").width(jQuery("#ui-framework-design1").width() - 20);
						}
					}
				}
				callback();
			}
		};

		var dataVal = sdpAjaxInputData({
			"list_info": listInfo, //NO I18N
			"for": "resource_mgmt"  //NO I18N
		});

		sdpAjax({
			url: url,
			type: "GET", //NO I18N
			data: dataVal,
			acceptODCompatible: true,
			success: function (data) {
				onSuccess(data);
			}
		});
	} else {
		jQuery('#scheduler_legends').append(label_text[0].outerHTML); //NO I18N
		jQuery('#color-text').text(translate("common.none")); //NO I18N
		self.buildAndAppendLegend('#1796b0', translate("common.none"));
		callback();
	}
		},

		buildAndAppendLegend: function(color, text) {
			if(!color){
				color = '#1796b0';		//default color			// No I18N
			}
					var color_span = jQuery('<span class="wo-color-priority sch-color-holder ml5 mr5">');
			color_span.css('background-color', color); //No I18N
			var text_span = jQuery('<span class="project-sch-footer-txt">');
			text_span.text(text);
					var dispIb = jQuery('<div class="disp-ib"></div>');
					dispIb.append(color_span).append(text_span);
					jQuery('#scheduler_legends').append(dispIb);
			}
		});
})(jQuery);

var is_dhtmlxscheduler_initialized = false;
function resourceInit(options) {
	renderhbs("#resourceMgmt", "ResourceManagement", options, false, "task/resource");//No I18N
	jQuery(window).trigger("scroll");

	(options.projectId) ? initScheduler(options.projectId) : initScheduler();

	setTimeout(function(){
		jQuery("html, body").animate({ scrollTop: 100 });
		if(options.projectId){
			jQuery("#filter-menu").css("top", jQuery(".dhx_scale_bar").offset().top + 13);      //No I18N
		}
	}, 500);
	initTooltip("#resourceMgmt");//No I18N
}
function initScheduler(projectId) {
	var scheduler_config = {
		filtered_module: [],
		filtered_resource: {},
		operational_hours: {},
		holidays: {}
	};
	if (projectId && projectId != 'null' && projectId != '') {
		scheduler_config.projectId = projectId;
	}

	if (typeof globalsetting === 'undefined') {
		scheduler_config.time_format = "%d %M, %Y";  //NO I18N
		scheduler_config.date_format = "%D, %j %M";  //NO I18N
			setTimeout(function () {
				jQuery('#scheduler_container').scheduler(scheduler_config);
			}, 100);
    }
}


//=============autoscroll on drag=============//
(function () {
	if(typeof scheduler !== 'undefined') {
        scheduler.config.autoscroll_offset = 50;
        var scrollRangeTop = 150,
            scrollRangeBottom = 25,
            scrollStep = 30,
            scrollInterval = 10;

        var interval = null,
            startPos = null;


        function getRelativeCoordinates(e, parent) {

            var pos = {},
                offset = {},
                container = parent;

            pos.x = !!e.touches ? e.touches[0].pageX : e.pageX;
            pos.y = !!e.touches ? e.touches[0].pageY : e.pageY;


            offset.left = 0;
            offset.top = 0;

            while (container) {

                offset.left += container.offsetLeft;
                offset.top += container.offsetTop;

                container = container.offsetParent;
            }

            return {
                x: pos.x - offset.left,
                y: pos.y - offset.top
            };

        }

        function autoscrollInterval(event) {
            if (interval) {
                clearInterval(interval);
            }

            var eventPos = {
                pageX: !!event.touches ? event.touches[0].pageX : event.pageX,
                pageY: !!event.touches ? event.touches[0].pageY : event.pageY
            };
            interval = setInterval(function () {
                tick(eventPos);
            }, scrollInterval);
        }

        function tick(e) {
            if (!scheduler.getState().drag_id) {
                clearInterval(interval);
                startPos = null;
                return;
            }

            var viewport = scheduler._obj;
            var box = getRelativeCoordinates(e, viewport);
            var availWidth = viewport.offsetWidth;
            var availHeight = viewport.offsetHeight;

            var posX = box.x;
            var posY = box.y;

            var scrollLeft = 0; //
            var scrollTop = need_scroll(posY, availHeight, startPos ? startPos.y : 0, scrollRangeTop, scrollRangeBottom);

            if ((scrollTop || scrollLeft) && !startPos) {
                startPos = {
                    x: posX,
                    y: posY
                };

                scrollLeft = 0;
                scrollTop = 0;
            }

            scrollLeft = scrollLeft * scrollStep;
            scrollTop = scrollTop * scrollStep;

            if (scrollLeft && scrollTop) {
                if (Math.abs(scrollLeft / 5) > Math.abs(scrollTop)) {
                    scrollTop = 0;
                } else if (Math.abs(scrollTop / 5) > Math.abs(scrollLeft)) {
                    scrollLeft = 0;
                }
            }

            if (scrollLeft || scrollTop) {
                startPos.started = true;
                scroll(scrollLeft, scrollTop);
            } else {
                clearInterval(interval);
            }
        }

        function need_scroll(pos, boxSize, startCoord, scrollRangeTop, scrollRangeBottom) {
            if (pos < scrollRangeTop && (!startPos || startPos.started || pos < startCoord)) {
                return -1;
            } else if (boxSize - pos < scrollRangeBottom && (!startPos || startPos.started || pos > startCoord)) {
                return 1;
            }
            return 0;
        }

        function scroll(left, top) {
            var viewport = scheduler._obj;
            if (top) {
                var dataarea = viewport.querySelector(".dhx_cal_data"); //No I18N
                dataarea.scrollTop += top;
            }
            if (left) { // + 40 - adjust height of that movement was correct
                viewport.scrollLeft += left;
            }
        }

        var evId = scheduler.attachEvent("onSchedulerReady", function () {

            dhtmlxEvent(document.body, "mousemove", autoscrollInterval); //No I18N
            scheduler.detachEvent(evId);
        });
	}
})();
(function(e,t){e.widget("ui.scheduler",{version:"1.0.1",serialNo:0,options:{show_unscheduled_tasks:false,show_unassigned_tasks:false,show_utilization:true,max_event_count:500,resource:"technicians",current_tab:"home",res_max_count_filter:10,group_max_count_filter:10,sdp_scheduler_scroll:true,scheduler:null,max_resource_count:50,supported_types:{task:"task"},time_resource_fields:{start:"scheduled_start_time",end:"scheduled_end_time",resource:"owner"},zoom_level:"hours",starting_date:null,ending_date:null,scroll_resource_count:50,scroll_ready:true,bar_color_field:"priority"},destroy:function(){e(document).off("click",".sdp-gantt-tooltip .tt-actions a span");scheduler.isactive=false;window.self=window;this.reset_options()},reset_options:function(){var e=this,t=e.options;e._remove_all_events();t.filtered_resource={};t.zoom_level="hours";delete t.readonly_width},_create:function(){var t=this,r=t.options,a=t.element;scheduler.isactive=true;window.schevents={};t._set_tab();if(r.current_tab=="home"){var s=jQuery("#TasksFilterMenu")[0].outerHTML;jQuery("#TasksFilterMenu").remove();jQuery(".event-option-sch").before(s);jQuery(".event-option-sch").before("<span class='sep-pipe'></span>");jQuery("#TasksFilterMenu").attr("style","display: inline-block !important; margin-top: 7px")}r.scheduler=scheduler;t._clear_all();r.scheduler.config.drag_create=false;r.scheduler.config.start_on_monday=false;r.scheduler.config.dblclick_create=false;r.scheduler.config.mark_now=false,r.scheduler.locale.labels.timeline_tab=getMessageForKey("sdp.scheduler.label.timeline");r.scheduler.xy.scale_height=30;r.scheduler.xy.nav_height=35;r.scheduler.xy.bar_height=20;r.scheduler.dhtmlXTooltip.config.className="dhtmlXTooltip tooltip";r.scheduler.dhtmlXTooltip.config.timeout_to_display=1;r.scheduler.dhtmlXTooltip.config.delta_x=10;r.scheduler.dhtmlXTooltip.config.delta_y=-10;if(sdp_user.DIRECTION=="RTL"){r.scheduler.config.rtl=true}r.scheduler.deleteMarkedTimespan();r.scheduler.templates.event_class=function(t,a,s){if(s.readonly){if(!r.readonly_width){r.readonly_width=e(".dhx_data_table")[0].style.width;e("#readonly-bar-width-style").html(".readonly-bar-width{width : "+r.readonly_width+" !important}")}return"readonly-bar readonly-bar-width"}return s.unscheduled?"unscheduled_bar_shaded":""};if(!is_dhtmlxscheduler_initialized){t._attach_events()}t._get_personalized_data_and_create_timeline_view(function(){e("#initial-loading-indicator").remove();e("#resource-mgmt").css("visibility","visible").hide().fadeIn(700);setTimeout(function(){jQuery(".dhx_scale_bar.dhx_second_scale_bar").css("width",jQuery(".dhx_scale_bar").width()+17);e("#scheduler_container").trigger("focus");e(window).trigger("resize");r.scheduler.updateView()},950)});t._init_scroll_event();var i=jQuery("#filter-menu")[0].clientWidth;jQuery("#filter-menu").css("top",jQuery(".dhx_scale_bar").offset().top+13);if(sdp_user.DIRECTION==="RTL"){jQuery("#filter-menu").css("right",(200-i)/2+(jQuery(window).width()-(jQuery(".dhx_cal_header").offset().left+jQuery(".dhx_cal_header").outerWidth())))}else{jQuery("#filter-menu").css("left",(200-i)/2+jQuery(".dhx_cal_header").offset().left)}is_dhtmlxscheduler_initialized=true},_fix_date_position:function(){var e=jQuery(".dhx_cal_navline").width();if(sdp_user.DIRECTION==="LTR"){var t=jQuery(".dhx_cal_next_button")[0].getBoundingClientRect().right-jQuery(".dhx_cal_prev_button")[0].getBoundingClientRect().left;jQuery(".sch-displaydate-container").css("left",e/2-t/2);var r=jQuery("#res-filter-left")[0].getBoundingClientRect().right;var a=jQuery(".dhx_cal_prev_button")[0].getBoundingClientRect().left;if(a-r<40){var a=jQuery("#res-filter-right")[0].getBoundingClientRect().left;jQuery(".sch-displaydate-container").css("left",r+(a-r)/2-t/2-15)}}else{var t=jQuery(".dhx_cal_prev_button")[0].getBoundingClientRect().right-jQuery(".dhx_cal_next_button")[0].getBoundingClientRect().left;jQuery(".sch-displaydate-container").css("left",e/2-t/2);var a=jQuery("#res-filter-left")[0].getBoundingClientRect().left;var r=jQuery(".dhx_cal_prev_button")[0].getBoundingClientRect().right;if(a-r<40){var r=jQuery("#res-filter-right")[0].getBoundingClientRect().right;jQuery(".sch-displaydate-container").css("right",a+(r-a)/2-t/2-15)}}},_attach_events:function(){var t=this;var r=t.options;e("body").on("mouseover",".rtm-user-name",function(){var e=jQuery(this);if(e.outerWidth()<e[0].scrollWidth){e.attr("title",e.text())}});e("body").on("click","button",function(){if(!jQuery("#resource-mgmt > #filter-menu").length){return}var t=jQuery("#filter-menu")[0].clientWidth;jQuery("#filter-menu").css("top",jQuery(".dhx_scale_bar").offset().top+13);if(r.zoom_level==="days"){jQuery("#filter-menu").css("top",jQuery(".dhx_scale_bar").offset().top)}e(window).trigger("resize");if(sdp_user.DIRECTION==="RTL"){jQuery("#filter-menu").css("right",(200-t)/2+(jQuery(window).width()-(jQuery(".dhx_cal_header").offset().left+jQuery(".dhx_cal_header").outerWidth())))}else{jQuery("#filter-menu").css("left",(200-t)/2+jQuery(".dhx_cal_header").offset().left)}});e(window).off("resize.rmgmt").on("resize.rmgmt",function(){if(!r.scheduler.expanded){if(r.current_tab==="home"&&jQuery(".headerbar").length){var t=jQuery(".project-sch-footer").position().top-jQuery(".headerbar")[0].getBoundingClientRect().bottom;jQuery(".project-sch-container").height(t);e(".project-sch-footer").width(jQuery(".headerbar").width())}else if(r.current_tab==="projects"){if(r.projectId){var t=jQuery(".project-sch-footer").position().top-jQuery("[data-id=ui-tabs1-pos]")[0].getBoundingClientRect().bottom-14;jQuery(".project-sch-container").height(t);e(".project-sch-footer").width(jQuery("#ui-framework-design1").width()-40)}else{var t=jQuery(".project-sch-footer").position().top-jQuery("#ui-framework-design1")[0].getBoundingClientRect().bottom;jQuery(".project-sch-container").height(t);e(".project-sch-footer").width(jQuery("#ui-framework-design1").width()-20)}}}e("#readonly-bar-width-style").html(".readonly-bar-width{width : "+e(".dhx_data_table")[0].style.width+" !important}")});e("#scheduler_container").on("keydown",function(a){switch(a.which){case 70:e(".dhx_expand_icon").trigger("click.keypress");t._fullscreen_toggle();break;case 27:if(r.scheduler.expanded){e(".dhx_expand_icon").trigger("click.keypress");t._fullscreen_toggle()}break;case 37:e(".dhx_cal_prev_button").trigger("click");break;case 39:e(".dhx_cal_next_button").trigger("click");break;default:return}a.preventDefault()});var t=this;var r=t.options;var a;if(r.attached_events){t._remove_all_events()}r.attached_events=[];a=r.scheduler.attachEvent("onEventChanged",function(a,s){if(s.readonly){return false}var i={};var n={};e.extend(n,s.origitem);e.extend(i,r.time_resource_fields);var o=t._is_owner_changed(s);if(o){i.resource="owner"}else{delete i.resource}if(o&&s.unscheduled){delete i.start;delete i.end;var l=r.scheduler.getState();if(s.origitem[i.start]==null){s.start_date=l.min_date}if(s.origitem[i.end]==null){s.end_date=l.max_date}t._before_inline_edit(s,n,i)}else if(o){i.start="scheduled_start_time";i.end="scheduled_end_time";var _=t._getDateAsString(r.prev_start_time,true);var d=t._getDateAsString(s.start_date,true);var u=t._getDateAsString(r.prev_end_time,true);var c=t._getDateAsString(s.end_date,true);var h='<div><div class="pb5">'+translate("sdp.schedule.time.altered")+" "+translate("sdp.requestcatalog.reorder.save")+"</div>"+translate("sdp.project.taskattribute.scheduledstarttime")+": "+_+" <strong>"+translate("sdp.common.to1")+"</strong> "+d+"<br>"+translate("sdp.project.taskattribute.scheduledendtime")+": "+u+" <strong>"+translate("sdp.common.to1")+"</strong> "+c+"</div>";if(_!==d||u!=c){showconfirm(true,"title="+translate("sdp.modified.time")+",message="+h+",submitbutton="+translate("sdp.admin.settings.yes")+",cancelbutton="+translate("sdp.admin.settings.no")+",closebutton=no, closeOnEscKey=yes",function(e){if(!e){delete i.start;delete i.end}t._update_task(s,n,i)})}else{t._update_task(s,n,i)}}else{i.start="scheduled_start_time";i.end="scheduled_end_time";s.unscheduled=s.unscheduled?false:s.unscheduled;t._before_inline_edit(s,n,i)}});a=scheduler.attachEvent("onEventCollision",function(e,t){return false});r.attached_events.push(a);a=scheduler.attachEvent("onEventDrag",function(e,t,a){var s=scheduler.tooltip;var i=scheduler.getEvent(e);var n=new Date(r.prev_start_time).getTime();var o=new Date(r.prev_end_time).getTime();var l="<div class='res-drag-info' >";if(n!=i.start_date.getTime()&&o==i.end_date.getTime()){if(r.zoom_level=="hours"||r.zoom_level=="days"){l+=sdpDate.format({entire_date:i.start_date,type:"HH:mm"})+"</div>"}else{var _=sdpDate.format({entire_date:i.start_date,type:"DD"});var d=sdpDate.format({entire_date:i.start_date,type:"MMM"});l+=_+" "+d+" "+sdpDate.format({entire_date:i.start_date,type:"HH:mm"})+"</div>"}s.show(a,l)}else if(n==i.start_date.getTime()&&o!=i.end_date.getTime()){if(r.zoom_level=="hours"||r.zoom_level=="days"){l+=sdpDate.format({entire_date:i.end_date,type:"HH:mm"})+"</div>"}else{var _=sdpDate.format({entire_date:i.end_date,type:"DD"});var d=sdpDate.format({entire_date:i.end_date,type:"MMM"});l+=_+" "+d+" "+sdpDate.format({entire_date:i.end_date,type:"HH:mm"})+"</div>"}s.show(a,l)}var u=jQuery("[event_id='"+e+"']");if(u.length&&t=="move"){var c=u.parent();var h=0;var f=c.height()-u.height()-2;var p=c[0].getBoundingClientRect().top;var m=a.pageY-p-1;m-=5;m=m<h?h:m>f?f:m;u.css({top:m})}});a=scheduler.attachEvent("onBeforeDrag",function(e,t,a){if(e){var s=scheduler.getEvent(e);r.prev_start_time=s.start_date;r.prev_end_time=s.end_date;if(s.readonly){return false}else{return true}}return true});r.attached_events.push(a);a=r.scheduler.attachEvent("onViewChange",function(a,s){e.each(r.operational_hours,function(e,t){delete t.total_op_mins});delete r.readonly_width;t._load_readonly_tasks();var i=r.scheduler.getState();var n=r.scheduler.getEvents(i.min_date,i.max_date);var o=0;for(o=0;o<n.length;o++){var l=n[o];if(!l.readonly){t._set_scheduled_time(l.origitem,l)}}});r.scheduler.attachEvent("onClick",function(e,a){var s=r.scheduler.getEvent(e);window.schedulerEvent=s;var i=scheduler.getEvent(e);if(i.readonly){return false}if(s.origitem){t._editItems(s)}return false});jQBody.find("#navigation-menu input[type='radio'], #headerResetTheme").on("click",function(){setTimeout(function(){t._fix_technician_filter_position()},1e3)});r.scheduler.attachEvent("onDblClick",function(e,t){return false});scheduler.attachEvent("onDataRender",function(){if(e(".readonly-bar").find(".dhx_event_resize").length){e(".readonly-bar").find(".dhx_event_resize").remove()}});scheduler.attachEvent("onCellClick",function(t,r,a,s,i){if(e(".readonly-bar").find(".dhx_event_resize").length){e(".readonly-bar").find(".dhx_event_resize").remove()}});r.scheduler.attachEvent("onTemplatesReady",function(){r.scheduler.templates.event_bar_text=function(r,a,s){if(s.readonly){var i;var n;var o=scheduler.getState();var l=translate("sdp.projects.daydiff.hour");var _=translate("sdp.projects.daydiff.minute");var d=100;var u=d/scheduler.matrix.timeline.x_size;var c="<table style='width:100%;border-collapse:collapse'><tr>";var h;var f=scheduler.getEvents(o.min_date,o.max_date);var h=f.filter(function(e){return e.owner_id==s.owner_id});var p=o.min_date;var m=new Date(p.getTime());var v=parseInt(e(".dhx_data_table")[0].clientWidth);var g=Math.floor(v/scheduler.matrix.timeline.x_size);var y=v%scheduler.matrix.timeline.x_size;var w=scheduler.matrix.timeline.x;for(var x=0,k=0;x<scheduler.matrix.timeline.x_size;x++,k++){if(jQuery("#zooming").val()=="weeks"){w=scheduler.matrix.timeline.x_size-y;i=0;n=0;var b=p.getDay();last_day=o.max_date;var j=7-b;var D=Math.abs(last_day.getTime()-p.getTime());var Q=Math.ceil(D/(1e3*3600*24));if(Q<7){j=last_day.getDay()-b}var M=jQuery(".dhx_second_scale_bar:nth-child("+(k+1)+")").width();x=x+j-1;m=scheduler.date.add(p,j,scheduler.matrix.timeline.x_unit);var T=t._get_events_between(p,m,h);var C=t._calculate_total_op_hours_between(p,m,s.owner);i=Math.floor(C/60);var A=t._calculate_op_hours_between(p,m,T);work_hours=Math.floor(A/60);var E="px";var z=A>C?"load-util-red":"load-util-blue";var S=A>C?"load-util-text-red":"load-util-text-blue";var I=Math.floor(Math.abs((C-A)/60));var O=Math.abs((C-A)%60);var Y=C?(I?I+l:"")+" "+(O?O+_:""):"";var R="padding:0px;";var H="max-width:"+M+E+";";var B="min-width:"+M+E+";";var L="width:"+M+E+";";var P="style='"+R+L+"'";var N=C&&C!=A?"<div data-totworkmin="+A+" data-totopmin="+C+' class="'+z+'"></div>'+'<span class="'+S+'">'+Y+"</span>":"";c=c+"<td"+" "+P+">"+'<div class="disp-ib"> '+N+"</td>";p=scheduler.date.add(p,j,scheduler.matrix.timeline.x_unit)}else{i=0;n=0;m=scheduler.date.add(p,1,scheduler.matrix.timeline.x_unit);var T=t._get_events_between(p,m,h);var M=jQuery(".dhx_scale_bar:nth-child("+(k+1)+")").width();var C=t._calculate_total_op_hours_between(p,m,s.owner);i=Math.floor(C/60);var A=t._calculate_op_hours_between(p,m,T);work_hours=Math.floor(A/60);var E="px";var z=A>C?"load-util-red":"load-util-blue";var S=A>C?"load-util-text-red":"load-util-text-blue";var I=Math.floor(Math.abs((C-A)/60));var O=Math.abs((C-A)%60);var Y=C?(I?I+l:"")+" "+(O?O+_:""):"";var R="padding:0px;";var L="width:"+M+E+";";var P="style='"+R+L+"'";var N=C&&C!=A?"<div data-totworkmin="+A+" data-totopmin="+C+' class="'+z+'"></div>'+'<span class="'+S+'">'+Y+"</span>":"";c=c+"<td"+" "+P+">"+'<div class="disp-ib"> '+N+"</div></td>";p=scheduler.date.add(p,1,scheduler.matrix.timeline.x_unit)}}c+="</tr></table>";return c}return s.text};r.scheduler.templates.timeline_second_scale_date=function(e){var t=sdpDate.format({entire_date:e,type:"MMMM"});var r=sdpDate.format({entire_date:e,type:"YY"});return t+" '"+r};r.scheduler.templates.year_tooltip=function(e,t,r){if(r.unscheduled){return"<b>"+getMessageForKey("sdp.scheduler.notscheduled)")+"</b> - "+r.text}return r.text}});r.attached_events.push(a)},_update_task:function(e,t,r){var a=this;e.origitem[r.start]=a._get_as_date(e.start_date.getTime());e.origitem[r.end]=a._get_as_date(e.end_date.getTime());a._before_inline_edit(e,t,r)},_remove_all_events:function(){var e=this;var t=e.options;jQuery.each(t.attached_events,function(e,t){scheduler.detachEvent(t)})},_init_scheduler_with_other_config:function(t){var r=this;var a=r.options;r._get_op_hours();r._get_holidays();a.scheduler.config.load_date="%d %M, %Y";a.scheduler.init("scheduler_container",new Date,"timeline");e("#scheduler_container .dhx_cal_navline").show();r._fullscreen_config();r._fullscreen_tooltip();r._load_op_hrs_and_holidays();if(a.start_date){a.scheduler.setCurrentView(new Date(a.start_date))}var s=scheduler.serverList("sections");if(!s.length&&!a.show_unassigned_tasks){a.show_unassigned_tasks=true;r._set_personalization({show_unassigned_tasks:true})}var i=a.scheduler.getState();for(var n=0;n<s.length;n++){r._apply_marked_timespan_for_excluded_days(i.min_date,i.max_date,s[n].key,r._get_user_site_for_index(s[n].orig))}r._config_tooltip_actions();r._config_prev_next_buttons();r._initiate_res_filters(function(){if(a.show_unassigned_tasks){r.handle_unassigned(null,a.show_unassigned_tasks)}if(a.show_unscheduled_tasks){r.handle_all_unscheduled(null,a.show_unscheduled_tasks)}r.change_bar_color();r._fix_date_position();r._fix_technician_filter_position();if(!a.scheduler.expanded){if(a.current_tab==="home"){var e=jQuery(".project-sch-footer").position().top-jQuery(".headerbar")[0].getBoundingClientRect().bottom;jQuery(".project-sch-container").height(e);jQuery(".project-sch-footer").width(jQuery(".headerbar").width())}else if(a.current_tab==="projects"){if(a.projectId){var e=jQuery(".project-sch-footer").position().top-jQuery("[data-id=ui-tabs1-pos]")[0].getBoundingClientRect().bottom-14;jQuery(".project-sch-container").height(e);jQuery(".project-sch-footer").width(jQuery("#ui-framework-design1").width()-40)}else{var e=jQuery(".project-sch-footer").position().top-jQuery("#ui-framework-design1")[0].getBoundingClientRect().bottom;jQuery(".project-sch-container").height(e);jQuery(".project-sch-footer").width(jQuery("#ui-framework-design1").width()-20)}}}t()});e(".dhx_cal_navline").css("display","block")},_getDateAsString:function(e,t){var r=sdpDate.format({entire_date:e,type:"DD"});var a=sdpDate.format({entire_date:e,type:"MMM"});var s=sdpDate.format({entire_date:e,type:"YYYY"});var i=t?sdpDate.format({entire_date:e,type:"hh:mm"}):"";var n=t?sdpDate.format({entire_date:e,type:"A"}):"";return(a+" "+r+" "+s+" "+i+" "+n).trim()},_config_tooltip_actions:function(){var t=this;var r=t.options;e(document).on("click",".sdp-gantt-tooltip .tt-actions a span",function(){var a=e(this);var s=a.attr("task_id");if(s){r.scheduler.dhtmlXTooltip.hide();var i=r.scheduler.getEvent(s);if(i){if(a.hasClass("edit-ico")){t._editItems(i)}else if(a.hasClass("delete-ico")){t._delete_item(i)}else if(a.hasClass("smartview-ico")){t._details_view(i)}}}})},_change_scheduled_time_on_prev_next:function(){var e=this;var t=e.options;var r=scheduler.getState();var a=scheduler.getEvents(r.min_date,r.max_date);var s=0;for(s=0;s<a.length;s++){var i=a[s];if(!i.readonly){e._set_scheduled_time(i.origitem,i)}}},_config_prev_next_buttons:function(){var e=this;var t=e.options;t.scheduler._click.dhx_cal_prev_button=function(){scheduler._click.dhx_cal_next_button(0,-1)};t.scheduler._els.dhx_cal_prev_button[0].onclick=scheduler._click.dhx_cal_prev_button;t.scheduler._click.dhx_cal_next_button=function(r,a){e.showProgressBar();var s;var i;if(a&&a<0){i=scheduler.date[scheduler._mode+"_start"](scheduler._date);s=scheduler.date.add(scheduler.date[scheduler._mode+"_start"](scheduler._date),a,scheduler._mode)}else{s=scheduler.date.add(scheduler.date[scheduler._mode+"_start"](scheduler._date),1,scheduler._mode);i=scheduler.date.add(scheduler.date[scheduler._mode+"_start"](scheduler._date),2,scheduler._mode)}e._load_tasks(s,i,t.show_unscheduled_tasks,function(){e._load_readonly_tasks(s,i);var r=t.scheduler.getState();var n=t.scheduler.getEvents(r.min_date,r.max_date);var o=0;for(o=0;o<n.length;o++){var l=n[o];if(!l.readonly){e._set_scheduled_time(l.origitem,l,s,i)}}t.scheduler.updateView(scheduler.date.add(scheduler.date[scheduler._mode+"_start"](scheduler._date),a||1,scheduler._mode));e.hideProgressBar();e._set_personalization(null,true)})};scheduler._els.dhx_cal_next_button[0].onclick=scheduler._click.dhx_cal_next_button},_init_timeline_view_with_config:function(){var t=this;var r=t.options;r.scheduler.templates.timeline_scale_label=function(e,a,s){var i=scheduler.getState();var n=t._calculate_op_mins(s);var o=s.orig;var l=t._get_user_site_for_index(o);var _=s.image_token;t._apply_marked_timespan_for_excluded_days(i.min_date,i.max_date,s.key,l);if(r.operational_hours[l]){r.operational_hours[l].total_op_mins=t._calculate_total_op_mins(o)}else{r.operational_hours[0].total_op_mins=t._calculate_total_op_mins(o)}var d=r.operational_hours[l]?r.operational_hours[l].total_op_mins:r.operational_hours[0].total_op_mins;var u=n>d?"text-danger ":"";var c=Math.floor(n/60);var h=Math.floor(d/60);var f=jQuery("<div class='rtm_total_time_show "+u+"'><span class='"+u+"sb'>"+translate("sdp.utilization.load")+" - "+c+"/"+h+" "+translate("sdp.requests.view.short.hour")+"</span></div>");var p="";if(s.key=="not-assigned"){var m=s.sch_tasks.length+s.unsch_tasks.length;p="<span class='rtm-user-name text-overflow'>"+encodeHTML(s.label)+" "+"<span style='font-weight: bold'>("+m+")</span></span>"}else{var v=o.profile_pic;var g=v["content-url"];if(g.startsWith("/api/v3")){g=g+"?key="+_}var y='<span class="disp-c pos-rel mr5 usr-icon-block"><span style="background-size: contain;" class="user-circle vtop pos-abs top-4"><img style="height: 100%" class="fw whitebg img-circle" src='+g+'></span></span><div class="disp-c pl10 vtop"><span class="rtm-user-name text-overflow tl">'+encodeHTML(s.label)+"</span>"+f.prop("outerHTML")+"</div>";return y}return p};r.scheduler.templates.tooltip_text=function(r,a,s){if(s.readonly){return""}var i=e("#sdp-tooltip-template").clone();var n="task";i.find("div.sdp-gantt-tooltip").addClass(n+"-tooltip");i.find("div.tt-id").text(translate("sdp.task.taskid")+" #"+s.id);i.find("div.tt-main-info h1").html(s.text);if(s.origitem.status!=null){i.find("span.svalue").text(s.origitem.status.name);i.find("span.scolor").css("background-color",s.origitem.status.color)}if(s.origitem.priority){i.find("span.pvalue").text(s.origitem.priority.name);i.find("span.pcolor").css("background-color",s.origitem.priority.color)}var o="";o=s.origitem.scheduled_start_time?s.origitem.scheduled_start_time.display_value:"-";o=o+" - ";o+=s.origitem.scheduled_end_time?s.origitem.scheduled_end_time.display_value:"-";i.find("td.sch-value").text(o);var l="";l=s.origitem.actual_start_time?s.origitem.actual_start_time.display_value:"-";l=l+" - ";l+=s.origitem.actual_end_time?s.origitem.actual_end_time.display_value:"-";i.find("td.act-value").text(l);var _=t._get_resources_as_obj();var d;if(s.owner!=null){for(var u=0;u<_.length;u++){if(s.owner.id===_[u].key){d=encodeHTML(_[u].label);break}}}i.find("td.owner-value").html(s.owner==null?getMessageForKey("sdp.common.notassigned"):d);if(isMSPOrSCP){let e=s.origitem.account?s.origitem.account.name:getMessageForKey("sdp.common.notassigned");i.find("td.account-value").text(e)}var c;i.find("td.project-label").html(translate("common."+s.parent));if(s.parent=="general"){i.find("#row-project-title").hide();i.find("#row-milestone-title").hide()}else{var h;if(s.parent=="request"){h='<a target="_blank" href="/WorkOrder.do?woMode=viewWO&woID='+s[s.parent].id+'">'+encodeHTML(s[s.parent].subject)+"</a>"}else if(s.parent=="project"){h='<a target="_blank" href="/ProjectAction.do?submitaction=ViewProject&fromListView=true&projectid='+s[s.parent].id+'">'+encodeHTML(s[s.parent].title)+"</a>"}else if(s.parent=="milestone"){h='<a target="_blank" href="/MileStoneAction.do?submitaction=ViewMileStone&milestoneid='+s[s.parent].id+'">'+encodeHTML(s[s.parent].title)+"</a>"}else if(s.parent=="change"){h='<a target="_blank" rel="noopener" href="/ui/changes?entity_id='+s[s.parent].id+'&mode=detail">'+encodeHTML(s[s.parent].title)+"</a>"}else if(s.parent=="problem"){h='<a target="_blank" rel="noopener" href="/ui/problems?mode=detail&entity_id='+s[s.parent].id+'">'+encodeHTML(s[s.parent].title)+"</a>"}else if(s.parent=="release"){h='<a target="_blank" href="/ui/releases?entity_id='+s[s.parent].id+'&mode=detail">'+encodeHTML(s[s.parent].title)+"</a>"}else{h=s[s.parent].id}i.find("td.project-value").html(h);if(s.parent=="milestone"){i.find("td.milestone-label").html(translate("common.project"));i.find("td.project-label").html(translate("sdp.project.heading.milestone"));i.find("td.milestone-value").html('<a target="_blank" href="/ProjectAction.do?submitaction=ViewProject&fromListView=true&projectid='+s[s.grandparent].id+'">'+encodeHTML(s[s.grandparent].title)+"</a>")}else{i.find("#row-milestone-title").hide()}}i.find(".print-icon").addClass(n+"-print-icon");i.find(".tt-actions a span").attr("task_id",s.id);var f=i.html();return f};r.scheduler.templates.date_format=function(e,t){var a=r.date_format;if(r.time_format){a=r.time_format}if(e!==null){var s=r.scheduler.date.date_to_str(a);return s(e)}else{return"-"}};r.scheduler.filter_timeline=function(e,t){if(t.unscheduled&&!r.show_unscheduled_tasks){return false}return true};r.scheduler.templates.timeline_date=function(e,t){var a=r.scheduler.date.date_to_str(r.date_format);var s='<span class="pos-rel" data-rescalendarstart="true" style="line-height: 31px"> <input class="pos-abs" type="hidden" id="date_select" name="date_range">  <input class="pos-abs" type="text" style="width:0px; height:0px;" readonly="true" class="form-control" id="date_select_Display" >   <input class="pos-abs" type="text" style="width:0px;height:0px;" readonly="true" class="form-control" id="date_range_select" >      <a href="/"><span class="cspr calendar pos-rel top2" title="'+translate("sdp.date.chooser")+'" style="vertical-align:unset" alt="Date Chooser"></span></a>      </span>';var i="";if(r.zoom_level=="hours"){var n=sdpDate.format({entire_date:e,type:"DD"});var o=sdpDate.format({entire_date:e,type:"MMM"});var l=sdpDate.format({entire_date:e,type:"YYYY"});i=o+" "+n+", "+l}else{var _='<span class="pos-rel" data-rescalendarend="true" style="line-height: 31px"> <input class="pos-abs" type="hidden" id="date_select_end" name="date_range_end">  <input class="pos-abs" type="text" style="width:0px; height:0px;position: absolute;" readonly="true" class="form-control" id="date_select_end_Display" >   <input class="pos-abs" type="text" style="width:0px;height:0px;" readonly="true" class="form-control ml5" id="date_range_select_end" >      <a href="/"><span class="cspr calendar pos-rel top2" title="'+translate("sdp.date.chooser")+'" style="vertical-align:unset" alt="Date Chooser"></span></a>      </span>';var d=scheduler.date.add(t,-1,"day");var u=sdpDate.format({entire_date:e,type:"DD"});var c=sdpDate.format({entire_date:e,type:"MMM"});var h=sdpDate.format({entire_date:e,type:"YYYY"});var f=sdpDate.format({entire_date:d,type:"DD"});var p=sdpDate.format({entire_date:d,type:"MMM"});var m=sdpDate.format({entire_date:d,type:"YYYY"});i=c+" "+u+", "+h+'<span class="ml5 mr5">&ndash;</span>'+_+p+" "+f+", "+m}jQuery("#scheduler_container").off("click.datestart").on("click.datestart","[data-rescalendarstart='true']",function(){jQuery("#scheduler_container").scheduler("construct_date_filter","date_select","date_range_select")});jQuery("#scheduler_container").off("click.dateend").on("click.dateend","[data-rescalendarend='true']",function(){jQuery("#scheduler_container").scheduler("construct_date_filter","date_select_end","date_range_select_end")});return s+i};r.scheduler.templates.timeline_cell_class=function(e,t,a){if(r.zoom_level=="weeks"){total_op_hours=0;op_hours=0;var s=t.getDay();if(s==0){return"week-start"}else if(s==6){return"week-end"}else{return"week-day"}}}},_create_timeline_view:function(e,t,r,a,s,i,n,o,l,_){var d=this;var u=d.options;u.scheduler.createTimelineView({section_autoheight:true,name:"timeline",x_unit:e,x_date:t,x_step:r,x_size:a,x_start:s,x_length:i,y_unit:u.scheduler.serverList("sections",n),y_property:o,render:"tree",folder_dy:35,dy:60,second_scale:{x_unit:l,x_date:_},sort:function(e,t){if(e.readonly){return-1}else if(t.readonly){return 1}else{if(e.start_date.valueOf()==t.start_date.valueOf()){return 0}return e.start_date>t.start_date?1:-1}}})},_load_all_tasks:function(){var e=this;var t=e.options;var r=t.scheduler.getState();var a=r.min_date;var s=r.max_date;var i=t.show_unscheduled_tasks;var n={load_unscheduled:false,start_date:a,end_date:s};e._load_tasks_by_owner(n);if(t.show_unscheduled_tasks){n={load_unscheduled:true};e._load_tasks_by_owner(n)}},_initiate_res_filters:function(t){var r=this;var a=r.options;if(a.current_tab=="projects"){a.filtered_module=[];e("[name='predefined-module-filter']").each(function(e,t){a.filtered_module.push(this.value)});r.set_task_custom_filter(t)}else{r._init_task_filter();r.set_task_custom_filter(t)}},set_task_custom_filter:function(e){var r=this;var a=r.options;r._clear_all();r.refresh_scheduler_by_owner(t,function(){r._load_readonly_tasks();e()})},_get_personalized_data_and_create_timeline_view:function(e){var r=this;var a=r.options;var s="res_filter";if(a.current_tab=="projects"){s="res_filter_proj"}if(a.current_tab!="projects"){delete a.res_filter;var i=getPersonalizeData("res_mgmt");a.personalizedData=i;var n=getPersonalizeData("taskview_sidebar");var o;if(n!=null){o=n.list_info&&n.list_info.filter_by?n.list_info.filter_by.id:null}r.options.filter={id:o};a.res_filter=i;a.task_filter=n}else{var i=getPersonalizeData("res_mgmt_proj");a.personalizedData=i;a.res_filter=i;if(a.projectId){a.res_filter.resource=t}}a.show_unassigned_tasks=i.show_unassigned_tasks;a.show_unscheduled_tasks=i.show_unscheduled_tasks;a.start_date=i.starting_date?i.starting_date:null;a.end_date=i.ending_date?i.ending_date:null;a.zoom_level=i.zoom_level?i.zoom_level:"hours";r._get_users_and_init_timeline(e)},_get_users_and_init_timeline:function(e){var t=this;var r=t.options;var a=t._get_users();t._create_timeline_view("minute","%H:%i",60,24,0,24,a,"owner_id","day","%j %F");t._time_period_config(r.zoom_level,r.start_date,r.end_date);t._init_timeline_view_with_config();t._init_scheduler_with_other_config(e)},_set_filters_with_personalization_data:function(){var t=this;var r=t.options;var a,s,i;var n=r.res_filter;if(!isMSP||!r.res_filter.comboAccount||r.res_filter.comboAccount==getAccountId()){if(n&&!r.projectId){a=n.site;s=n.group;i=n.resource}else{i=r.project_members}}var o,l,_;var d={start_index:1,row_count:10};if(r.current_tab=="projects"){var u="user.id";if(i&&i.length){o=t._get_resource_url();l={field:u,condition:"is",values:i};d.search_criteria=l;var c=sdpAjaxInputData({list_info:d});sdpAjax({url:o,type:"GET",data:c,acceptODCompatible:true,success:function(t){var a=[];e.each(t[r.resource],function(e,t){t=t.user;a.push({id:t.id,name:t.name,orig:t})});e(".popover #res-select").select2("data",a)},async:false})}}else{if(a&&a!=""){o=t._get_sites_url();l={field:"id",condition:"is",value:a};d.search_criteria=l;var c=sdpAjaxInputData({list_info:d,for:"resource_mgmt"});sdpAjax({url:o,type:"GET",data:c,skipSUBREQUEST:true,acceptODCompatible:true,success:function(t){var r=t.site[0];if(r.id==-1){if(isMSP){return}r.name=translate("common.site.nosite")}e(".popover #site-select").select2("data",{id:r.id,name:r.name,orig:r})},async:false})}if(s&&s.length){o=t._get_groups_url();l={field:"id",condition:"is",values:s};d.search_criteria=l;var c=sdpAjaxInputData({list_info:d,for:"resource_mgmt"});sdpAjax({url:o,type:"GET",skipSUBREQUEST:true,acceptODCompatible:true,data:c,success:function(t){var r=[];e.each(t.group,function(e,t){var a=t.name;if(t.site){a+=" ("+t.site.name+")"}r.push({id:t.id,name:a,orig:t})});e(".popover #group-select").select2("data",r)},async:false})}if(i&&i.length){o=t._get_resource_url();l={field:"id",condition:"is",values:i};d.search_criteria=l;var c=sdpAjaxInputData({list_info:d});sdpAjax({url:o,type:"GET",data:c,skipSUBREQUEST:true,acceptODCompatible:true,success:function(t){var a=[];e.each(t[r.resource],function(e,t){a.push({id:t.id,name:t.name,orig:t})});e(".popover #res-select").select2("data",a)},async:false})}}},_calculate_total_op_mins:function(e){var t=this;var r=t.options;var a=scheduler.getState();var s=t._get_user_site_for_index(e);var i=new Date(a.min_date);i.setHours(0,0,0,0);var n=0;var o,l,_,d,u,c;while(i<a.max_date){if(!(t._is_tech_weekend(i,s)||t._is_tech_holiday(i,s)||t._is_excluded_day(i,s))){c=r.operational_hours[s]?r.operational_hours[s].operational_hours.days_of_operation:r.operational_hours[0].operational_hours.days_of_operation;u=t._find_day_index(i,c);o=c[u].hours_of_operation;l=o.break_end_time.hours*60+o.break_end_time.minutes-(o.break_start_time.hours*60+o.break_start_time.minutes);_=o.end_time.hours*60+o.end_time.minutes-(o.start_time.hours*60+o.start_time.minutes)-l;d=_*60*1e3;n+=d}i.setDate(i.getDate()+1)}return Math.floor(n/(1e3*60))},_calculate_op_mins:function(e){var t=this;var r=t.options;var a=e.orig;var s=t._get_user_site_for_index(a);var i;var n=scheduler.getState();var o=0;var l=scheduler.getEvents(n.min_date,n.max_date);e.unsch_tasks=[];e.sch_tasks=[];for(var _=0;_<l.length;_++){var d=l[_];if(d.owner_id==e.key&&!d.readonly){if(d.unscheduled){e.unsch_tasks.push(d.id)}else{e.sch_tasks.push(d.id);var u=d.start_date<n.min_date?n.min_date:d.start_date;var c=d.end_date>n.max_date?n.max_date:d.end_date;var h=u;var f=c;var p=new Date(h);p.setHours(0,0,0,0);while(p<=f){var m=t._is_tech_holiday(p,s);var v=t._is_tech_weekend(p,s);if(!m&&!v&&!t._is_excluded_day(p,s)){var g=r.operational_hours[s]?r.operational_hours[s].operational_hours.days_of_operation:r.operational_hours[0].operational_hours.days_of_operation;var y=t._find_day_index(p,g);i=g[y].hours_of_operation;var w=i.break_end_time.hours*60+i.break_end_time.minutes-(i.break_start_time.hours*60+i.break_start_time.minutes);var x=i.end_time.hours*60+i.end_time.minutes-(i.start_time.hours*60+i.start_time.minutes)-w;o+=x*60*1e3}p.setDate(p.getDate()+1)}if(!(t._is_tech_weekend(h,s)||t._is_tech_holiday(h,s)||t._is_excluded_day(h,s))){var g=r.operational_hours[s]?r.operational_hours[s].operational_hours.days_of_operation:r.operational_hours[0].operational_hours.days_of_operation;var y=t._find_day_index(h,g);i=g[y].hours_of_operation;var k=new Date(h);k.setHours(i.start_time.hours,i.start_time.minutes,0,0);var b=new Date(h);b.setHours(i.end_time.hours,i.end_time.minutes,0,0);var j=new Date(h);j.setHours(i.break_start_time.hours,i.break_start_time.minutes,0,0);var D=new Date(h);D.setHours(i.break_end_time.hours,i.break_end_time.minutes,0,0);if(h>k&&h<b){if(h>j&&h<D){o-=j-k}else if(h>=D){o-=h-D+(j-k)}else{o-=h-k}}else if(h>k){var w=i.break_end_time.hours*60+i.break_end_time.minutes-(i.break_start_time.hours*60+i.break_start_time.minutes);var x=i.end_time.hours*60+i.end_time.minutes-(i.start_time.hours*60+i.start_time.minutes)-w;o-=x*60*1e3}}if(!(t._is_tech_weekend(f,s)||t._is_tech_holiday(f,s)||t._is_excluded_day(f,s))){var g=r.operational_hours[s]?r.operational_hours[s].operational_hours.days_of_operation:r.operational_hours[0].operational_hours.days_of_operation;var y=t._find_day_index(f,g);i=g[y].hours_of_operation;var k=new Date(f);k.setHours(i.start_time.hours,i.start_time.minutes,0,0);var b=new Date(f);b.setHours(i.end_time.hours,i.end_time.minutes,0,0);var j=new Date(f);j.setHours(i.break_start_time.hours,i.break_start_time.minutes,0,0);var D=new Date(f);D.setHours(i.break_end_time.hours,i.break_end_time.minutes,0,0);if(f<=b&&f>k){if(f<D&&f>j){o-=b-D}else if(f<=j){o-=b-D+(j-f)}else{o-=b-f}}else if(f<b){var w=i.break_end_time.hours*60+i.break_end_time.minutes-(i.break_start_time.hours*60+i.break_start_time.minutes);var x=i.end_time.hours*60+i.end_time.minutes-(i.start_time.hours*60+i.start_time.minutes)-w;o-=x*60*1e3}}}}}return Math.floor(o/(1e3*60))},is_holiday:function(e){var t=this;var r=t.options;var a=new Date(e);a.setHours(0,0,0,0);var s=a.getTime().toString();return r.holidays.indexOf(s)!=-1},_is_tech_holiday:function(e,t){var r=this;var a=r.options;var s=new Date(e);s.setHours(0,0,0,0);var i=s.getTime().toString();var n=a.holidays[t];return n&&n.indexOf(i)!=-1},_is_tech_weekend:function(e,t){var r=this;var a=r.options;var s=a.operational_hours[t]?a.operational_hours[t].weekends:a.operational_hours[0].weekends;return s.indexOf(e.getDay())!=-1},is_weekend:function(e){var t=this;var r=t.options;return r.weekends.indexOf(e.getDay())!=-1},_is_excluded_day:function(e,t){var r=this;var a=r.options;var s=a.operational_hours[t]?a.operational_hours[t].excludedweeks:a.operational_hours[0].excludedweeks;var i=Math.ceil(e.getDate()/7);var n=s[e.getDay()];if(n===null||!n.includes(i)){return false}return true},_find_day_index:function(e,t){var r=["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];var a=r[e.getDay()];var s;for(var i=0;i<t.length;i++){if(t[i].week_day===a){s=i;break}}return s},_load_op_hrs_and_holidays:function(t){var r=this;var a=r.options;if(!t){t=scheduler.serverList("sections")}e.each(t,function(e,t){var s=null;if(t.orig.department){s=t.orig.department.site}if(s){if(a.operational_hours[s.id]){r._apply_marked_timespan_ophours(t.key,a.operational_hours[s.id])}else{r._apply_marked_timespan_ophours(t.key,a.operational_hours[0])}r._apply_marked_timespan_for_holidays(t.key,a.holidays[s.id])}else{r._apply_marked_timespan_ophours(t.key,a.operational_hours[0]);r._apply_marked_timespan_for_holidays(t.key,a.holidays[0])}})},_get_user_site:function(e){if(e.department&&e.department.site&&e.department.site.id){return e.department.site.id}else{return null}},_get_user_site_for_index:function(e){if(e&&e.department&&e.department.site&&e.department.site.id){return e.department.site.id}else{return 0}},_get_op_hrs_site:function(e){if(e.site&&e.site.id){return e.site.id}else{return 0}},_get_req_sites:function(){var e=this;var t=e.options;var r=[null];jQuery.each(t.all_users,function(a,s){if(t.current_tab=="projects"){s=s.user}var i=e._get_user_site(s);if(r.indexOf(i)==-1){r.push(i)}});return r},_get_op_hours:function(){var e=this;var t=e.options;var r=function(r){t.operational_hours={};jQuery.each(r.operational_hours,function(a,s){var i=s.days_of_operation;var n=s.hours_of_operation;var o=e._get_op_hrs_site(s);var l=["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];var _=[];var d=[];var u={};jQuery.each(i,function(e,t){var r=[];if(t.is_working){var a=l.indexOf(t.week_day);d.push(a)}else{var a=l.indexOf(t.week_day);_.push(a)}if(t.day_type==="24x7"){t.hours_of_operation.end_time.hours=24;t.hours_of_operation.end_time.minutes=0}jQuery.each(t.exclude_weeks,function(e,t){r.push(t.id)});u[l.indexOf(t.week_day)]=r});var c=r.operational_hours[a];var h={operational_hours:c,weekends:_,weekdays:d,excludedweeks:u,hours_of_operation:n};t.operational_hours[o]=h})};var a={start_index:1,row_count:100};var s=e._get_req_sites();a.search_criteria={field:"site",values:s,condition:"is"};var i=sdpAjaxInputData({list_info:a});sdpAjax({url:"/api/v3/operational_hours",type:"GET",data:i,acceptODCompatible:true,success:function(e){r(e)},async:false})},_get_holidays:function(){var e=this;var t=e.options;var r={start_index:1,row_count:100};var a=e._get_req_sites();r.search_criteria={field:"site",values:a,condition:"is"};var s=sdpAjaxInputData({list_info:r});var i=function(a){jQuery.each(a.holidays,function(r,a){var s=e._get_op_hrs_site(a);if(!t.holidays[s]){t.holidays[s]=[]}jQuery.each(a.holidays,function(e,r){t.holidays[s].push(r.holiday_date.value)})});if(a.list_info.has_more_rows==true){r.start_index=a.list_info.start_index+100;sdpAjax({url:"/api/v3/holidays",type:"GET",data:s,acceptODCompatible:true,success:function(e){i(e)},async:false})}};sdpAjax({url:"/api/v3/holidays",type:"GET",data:s,acceptODCompatible:true,success:function(e){i(e)},async:false})},_mapping_of_weekday_to_opdays:function(t,r){var a=[];var s=["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];e.each(t,function(e,t){for(var i=0;i<r.length;i++){if(r[i].week_day===s[t]){a.push(i);break}}});return a},_apply_marked_timespan_ophours:function(t,r){var a=this;var s=a.options;var i=r.weekdays;var n=r.weekends;var o=r.excludedweeks;var l=r.operational_hours.days_of_operation;var _=a._mapping_of_weekday_to_opdays(i,l);e.each(i,function(e,r){var a=l[_[e]].hours_of_operation;s.scheduler.addMarkedTimespan({days:r,zones:[0,a.start_time.hours*60+a.start_time.minutes,a.break_start_time.hours*60+a.break_start_time.minutes,a.break_end_time.hours*60+a.break_end_time.minutes,a.end_time.hours*60+a.end_time.minutes,24*60],invert_zones:false,css:"working_time",sections:{timeline:t}})});e.each(n,function(e,r){s.scheduler.addMarkedTimespan({days:r,zones:"fullday",css:"working_time",sections:{timeline:t}})})},_get_operational_hours:function(t){var r=this;var a=r.options;var s={start_index:1,row_count:100};if(!t||t==""){t=0}var i=function(r){a.operational_hours[t]={};var s=a.operational_hours[t];s.operational_hours=r.operational_hours[0];var i=r.operational_hours[0].days_of_operation;s.weekends=[];s.weekdays=[];var n=["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];e.each(i,function(e,t){if(t.is_working){var r=n.indexOf(t.weekday);s.weekdays.push(r)}else{var r=n.indexOf(t.weekday);s.weekends.push(r)}})};if(a.operational_hours[t]){var n=""}else{var o=sdpAjaxInputData({list_info:s});sdpAjax({url:"/api/v3/sites/"+t+"/get_operational_hours",type:"GET",data:o,acceptODCompatible:true,success:function(e){i(e)},async:false})}},_load_operational_hours:function(e){var t=this;var r=t.options;var a=r.operational_hours[e];var s=a.weekdays;var i=a.weekends;a=a.operational_hours;r.scheduler.addMarkedTimespan({days:s,zones:[a.start_time.hours*60+a.start_time.minutes,a.end_time.hours*60+a.end_time.minutes],invert_zones:true,css:"working_time",sections:{timeline:"100000000000023853"}});r.scheduler.addMarkedTimespan({days:r.weekdays,zones:[a.end_time.hours*60+a.end_time.minutes,24*60],css:"working_time"});jQuery.each(i,function(e,t){r.scheduler.addMarkedTimespan({days:t,zones:"fullday",css:"working_time"})});r.scheduler.updateView()},_apply_marked_timespan_for_holidays:function(t,r){var a=this;var s=a.options;e.each(r,function(e,r){s.scheduler.addMarkedTimespan({days:new Date(parseInt(r)),zones:"fullday",css:"working_time",sections:{timeline:t}})})},_apply_marked_timespan_for_excluded_days:function(e,t,r,a){var s=this;var i=s.options;var n=new Date(e);while(n<t){if(s._is_excluded_day(n,a)){i.scheduler.addMarkedTimespan({days:new Date(n),zones:"fullday",css:"working_time",sections:{timeline:r}})}n.setDate(n.getDate()+1)}},_init_scroll_event:function(){var e=this;var t=e.options;t.scroll_ready=true;t.sdp_scheduler_scroll=true;e._create_scroll_event()},_create_scroll_event:function(){var t=this;var r=t.options;e(".dhx_cal_data").on("scroll",function(a){if(e(".dhx_cal_data").scrollTop()+e(".dhx_cal_data").height()>e(".dhx_cal_data table").height()-5){if(r.sdp_scheduler_scroll&&e("#scheduler_container").length){t._load_more_users(a,function(){t._load_readonly_tasks(r.scheduler.getState().min_date,r.scheduler.getState().max_date);r.scheduler.updateView()})}else{e(document).off(a)}}})},remove_scroll_event:function(t){var r=this;var a=r.options;a.sdp_scheduler_scroll=false;if(t){e(document).off(t)}},construct_date_filter:function(t,r){var a=this;var s=a.options;var i={hours:["today","yesterday","tommorow"],days:["last_7_days","next_7_days"],weeks:["this_week","last_week","next_week"],months:["this_month","last_month","next_month","this_quarter","last_quarter","next_quarter"]};var n=e("#zooming").val();window.self=window;jQuery("#date_select").val(a.options.scheduler.getState().min_date.getTime());jQuery("#date_select_start").val(a.options.scheduler.getState().min_date.getTime());jQuery("#date_select_end").val(new Date(a.options.scheduler.getState().max_date-1).getTime());initCalendar(t,null,null,null,null,null,null,null,null,null,true);e("#date_select,#date_select_end").on("change",function(){var e,t;var r=s.zoom_level;if(this.id==="date_select"){e=this.value}else{e=a.options.scheduler.getState().min_date.getTime()}if(r!="hours"){if(this.id==="date_select_end"){t=new Date(Number(this.value)).getTime()}else{t=a.options.scheduler.getState().max_date.getTime()}}a.zoom_schedule(r,e,t)})},construct_group_filter:function(t){var r=this;var a=10;var s={start_index:(t.page-1)*a+1,row_count:a};var i=[];if(t.term&&t.term!=""){var n={field:"name",condition:"like",values:[t.term]};i.push(n)}var o=e(".popover #site-select").select2("val");if(o.length){if(o==-1){o=null}var n={field:"site",condition:"is",value:o,logical_operator:"AND"};i.push(n)}if(i.length){s.search_criteria=i}var l=r._get_groups_url();var _=sdpAjaxInputData({list_info:s,for:"resource_mgmt"});sdpAjax({url:l,type:"GET",data:_,acceptODCompatible:true,success:function(r){var a={more:false,results:[],context:r.list_info};a.more=r.list_info.has_more_rows;e.each(r.group,function(e,t){var r=t.name;if(t.site){r+=" ("+t.site.name+")"}a.results.push({id:t.id,name:r,orig:t})});t.callback(a)},async:false})},construct_site_filter:function(t){var r=this;var a=r.options;var s=1;var i=10;var n={start_index:(t.page-1)*i+1,row_count:i};if(t.term&&t.term!=""){var o={field:"name",condition:"like",values:[t.term]};n.search_criteria=o}var l=r._get_sites_url();var _=sdpAjaxInputData({list_info:n,for:"resource_mgmt"});sdpAjax({url:l,type:"GET",data:_,skipSUBREQUEST:true,acceptODCompatible:true,success:function(r){var a={more:false,results:[],context:r.list_info};a.more=r.list_info.has_more_rows;e.each(r.site,function(e,t){if(t.id==-1){if(isMSP){return}t.name=translate("common.site.nosite")}a.results.push({id:t.id,name:t.name,orig:t})});t.callback(a)},async:false})},construct_res_filter:function(t){var r=this;var a=r.options;var s=a.res_max_count_filter;var i=10;var n={start_index:1,row_count:10,sort_field:"name",sort_order:"asc"};if(a.current_tab==="projects"){n.sort_field="user.name"}n.start_index=(t.page-1)*i+1;n.row_count=i;var o=[];if(t.term&&t.term!=""){var l={field:"name",condition:"like",values:[t.term]};if(a.current_tab=="projects"){l.field="user.name"}o.push(l)}if(e(".popover #group-select").length&&e(".popover #group-select").select2("val").length){var _=e(".popover #group-select").select2("val");if(_&&_.length){var l={field:"support_group",condition:"in",values:_,logical_operator:"AND"};o.push(l)}}if(e(".popover #site-select").length&&e(".popover #site-select").select2("val")&&e(".popover #site-select").select2("val")!=""){var d=e(".popover #site-select").select2("val");var l={field:"associated_sites",condition:"is",value:d,logical_operator:"AND"};o.push(l)}else if(a.current_tab=="projects"&&a.projectId){var l={field:"project",condition:"is",value:a.projectId,logical_operator:"AND"};o.push(l)}if(o.length){n.search_criteria=o}var u=r._get_resource_url();var c=sdpAjaxInputData({list_info:n});sdpAjax({url:u,type:"GET",data:c,acceptODCompatible:true,success:function(r){var s={more:false,results:[],context:r.list_info};s.more=r.list_info.has_more_rows;e.each(r[a.resource],function(e,t){var r;if(a.current_tab=="projects"){r=t.user}else{r=t}s.results.push({id:r.id,name:r.name,orig:r})});t.callback(s)},async:false})},set_res_filter:function(){var t=this;var r=t.options;t.showProgressBar();var a={};if(!r.projectId){if(r.current_tab=="projects"){searchKey="res_filter_project";a={resource:e(".popover #res-select").select2("val")}}else{a={site:e(".popover #site-select").select2("val"),group:e(".popover #group-select").select2("val"),resource:e(".popover #res-select").select2("val")}}t._set_personalization(a);t._clear_all();t.load_after_personalize()}else{t.load_after_personalize()}},_set_personalization:function(e,t){var r=this;var a=r.options;var s;var i=a.current_tab==="projects"?"res_mgmt_proj":"res_mgmt";s=a.personalizedData;if(e){if(e.barcolor){s.barcolor=e.barcolor}else if(typeof e.show_unassigned_tasks!="undefined"){s.show_unassigned_tasks=e.show_unassigned_tasks}else if(typeof e.show_unscheduled_tasks!="undefined"){s.show_unscheduled_tasks=e.show_unscheduled_tasks}else if(typeof e.zoom_level!="undefined"){s.starting_date=e.starting_date;s.ending_date=e.ending_date;s.zoom_level=e.zoom_level}else if(e){s.site=(e.site&&e.site.length)>0?e.site:0;s.group=e.group;s.resource=e.resource}}if(t){var n=a.scheduler.getState();s.starting_date=n.min_date?n.min_date.getTime():null;s.ending_date=n.max_date?n.max_date.getTime():null;s.zoom_level=a.zoom_level}if(isMSP){s.comboAccount=getAccountId()}addPersonalization(i,s,true);a.res_filter=s},load_after_personalize:function(){var e=this;var t=e.options;var r=[];var a=e._get_users(true);e._get_op_hours();e._get_holidays();if(!a.length&&!t.show_unassigned_tasks){t.show_unassigned_tasks=true;e.handle_unassigned(null,t.show_unassigned_tasks)}if(t.show_unassigned_tasks){var s=e.get_unassigned_section();a.splice(0,0,s)}for(var i=0;i<a.length;i++){r[i]=a[i].key}e.refresh_scheduler_by_owner(r,function(){e._load_readonly_tasks(null,null,a);e.update_sections(a);e.hideProgressBar()})},_set_options:function(e){this._setOptions(e)},_add_all_owners:function(e){var t=this;var r={load_unscheduled:true};t._load_tasks_by_owner(r,e)},_is_field_changed:function(e,t,r){var a=e.origitem[t];var s=e[r];if(a!=null){if(s!==a){return true}}return false},_clear_all:function(){var t=this;var r=t.options;r.scheduler.clearAll();var a=scheduler.serverList("sections");e.each(a,function(e,t){t.unsch_tasks=[];t.sch_tasks=[]})},_is_owner_changed:function(e){var t=e.origitem.owner;if(e.origitem.marked_technician){t=e.owner.marked_technician}var r=e.owner_id;if(t==null){if(r!="not-assigned"){return true}}else{if(t.id!=r){return true}}return false},_create_scheduler_object:function(e,r){var a=this,s=a.options,i=a.element;if(r==null||r===t){r={}}r.id=e.id;r.owner=e.owner;r.owner_id=e.owner==null?"not-assigned":e.owner.id;if(e.marked_technician){r.owner=e.marked_technician;r.owner_id=e.marked_technician.id}r.text=encodeHTML(e.title);r.description=e.description;r.priority=e.priority===null?"-":e.priority.name;r.status=e.status===null?"-":e.status.name;r.readonly=e.status.internalname==="Closed"?true:false,r.origitem=e;r.markedtechnician=e.marked_technician;r.progress=e.percentage_completion/100;a._set_scheduled_time(e,r);if(!s.res_filter.barcolor){s.res_filter.barcolor="priority"}a._set_color(e,r,s.res_filter.barcolor);a._set_parent_details(e,r);return r},_set_parent_details:function(e,t){var r=e.associated_entity.toLowerCase();if(r){t.parent=r;t[r]=e[r];if(r=="milestone"){t.grandparent="project";t.project=e.project}}else{t.parent="-"}},_get_color:function(e){if(e&&e.color){return e.color.substring(0,7)}else{return null}},_set_color:function(e,t,r){var a=this,s=a.options;if(!t.readonly){t.color=encodeHTMLAttribute(a._get_color(e[r]));t.textColor="white"}return t},change_bar_color:function(t){var r=this,a=r.options;if(!t){if(a.res_filter&&a.res_filter.barcolor){t=a.res_filter.barcolor}else{t=a.bar_color_field}}else{r._set_personalization({barcolor:t})}r.showProgressBar();r.setBarColorAndLegends(t,function(){e("#color-text").text(e(".bar-settings a[name="+t+"]").text());var s=scheduler.getState();var i=scheduler.getEvents(s.min_date,s.max_date);var n=0;for(n=0;n<i.length;n++){var o=i[n];r._set_color(o.origitem,o,t)}a.scheduler.updateView();r.hideProgressBar()})},_set_scheduled_time:function(e,t,r,a){var s=this,i=s.options;t.unscheduled=e[i.time_resource_fields.start]==null||e[i.time_resource_fields.end]==null;t.start_date=s._get_date_value(e[i.time_resource_fields.start]);t.end_date=s._get_date_value(e[i.time_resource_fields.end]);var n=i.scheduler.getState();if(t.start_date==null){t.start_date=r?r:n.min_date}if(t.end_date==null){t.end_date=a?a:n.max_date}},_set_unscheduled_prev_next:function(e,t,r,a){var s=this,i=s.options;t.unscheduled=e[i.time_resource_fields.start]==null||e[i.time_resource_fields.end]==null;t.start_date=s._get_date_value(e[i.time_resource_fields.start]);t.end_date=s._get_date_value(e[i.time_resource_fields.end]);if(t.start_date==null){t.start_date=r}if(t.end_date==null){t.end_date=a}},_get_date_value:function(e,r){if(e===null||e===t||e==="null"){return null}var a=new Date;a.setTime(e.value);var s=a.getTime()+a.getTimezoneOffset()*6e4;if(parent.sdp_user.OFFSET){s=s+parent.sdp_user.OFFSET}a.setTime(s);return a},_get_users:function(e){var t=this;var r=t.options;var a=[];var s=null;var i=t._get_resource_url();if(e||!t._is_users_cache_available()){var n=t._get_resource_list_info();n.row_count=50;var o=sdpAjaxInputData({list_info:n,include:["image_token"]});if(i=="/api/v3/tasks/owner"){o=sdpAjaxInputData({list_info:n})}sdpAjax({url:i,type:"GET",data:o,acceptODCompatible:true,success:function(e){t._set_users_in_cache(e[r.resource]);a=t._get_users_from_cache(0,15);s=e.image_token},async:false})}else{a=t._get_users_from_cache(0,15)}t._init_scroll_event();return t._get_as_schedueler_users(a,s)},_is_users_cache_available:function(){return!!this.options.all_users},_get_as_schedueler_users:function(e,t){var r=this;var a=r.options;var s=[];jQuery.each(e,function(e,i){var n;if(a.current_tab=="projects"){n=i.user;t=i.image_token}else{n=i}s.push(r._get_user_obj(n,t))});return s},_get_users_from_cache:function(e,r){var a=this;var s=a.options;if(e==t){e=a._get_loaded_resources_count()}if(r==t){r=10}var i=s.all_users.slice(e,e+r);return i},_set_users_in_cache:function(e){this.options.all_users=e},_get_sites_url:function(){var e=this;var t=e.options;if(t.filtered_module.indexOf("Request")!=-1){return"requests/site"}else if(t.filtered_module.indexOf("Problem")!=-1){return"problems/site"}else if(t.filtered_module.indexOf("Change")!=-1){return"changes/site"}else if(t.filtered_module.indexOf("Release")!=-1){return"releases/site"}else{return"/api/v3/tasks/site"}},_get_groups_url:function(){var e=this;var t=e.options;if(t.filtered_module.indexOf("Request")!=-1){return"requests/group"}else if(t.filtered_module.indexOf("Problem")!=-1){return"problems/group"}else if(t.filtered_module.indexOf("Change")!=-1){return"changes/group"}else if(t.filtered_module.indexOf("Release")!=-1){return"releases/group"}else{return"/api/v3/tasks/group"}},_get_resource_url:function(){var e=this;var t=e.options;if(t.current_tab=="projects"){if(t.projectId){return"/api/v3/projects/"+t.projectId+"/members"}return"/api/v3/projects/members"}return"/api/v3/tasks/owner"},_get_resource_list_info:function(){var e=this;var t=e.options;var r={start_index:1,row_count:10,sort_field:"name",sort_order:"asc"};var a=e.get_resource_criteria();if(a){r.search_criteria=a}if(t.current_tab=="projects"){r.sort_field="user.name"}return r},get_resource_criteria:function(){var t=this;var r=t.options;var a;if(r.projectId){if(e(".popover #res-select").length&&e(".popover #res-select").select2("val").length){a={field:"user.id",condition:"eq",values:e(".popover #res-select").select2("val")};return a}}if(r.res_filter&&(!isMSP||!r.res_filter.comboAccount||r.res_filter.comboAccount==getAccountId())){if(r.current_tab=="projects"){if(r.res_filter.resource&&r.res_filter.resource.length){a={field:"user.id",condition:"eq",values:r.res_filter.resource}}}else{if(r.res_filter.resource&&r.res_filter.resource.length){a={field:"id",condition:"eq",values:r.res_filter.resource}}else if(r.res_filter.group&&r.res_filter.group.length){a={field:"support_group",condition:"eq",values:r.res_filter.group}}else if(r.res_filter.site){a={field:"associated_sites",condition:"eq",value:r.res_filter.site}}}}return a},_set_tab:function(){var e=this;var t=e.options;t.current_tab=jQuery("#top-header").find("#sdp-tabs").find("li.active").find("a").attr("id");if(t.current_tab=="projects"){t.resource="members"}else{t.resource="owner"}},_get_loaded_resources_count:function(){var e=this,t=e.options;var r=scheduler.serverList("sections");if(r.length&&r[0].key=="not-assigned"){return r.length-1}else{return r.length}},_load_more_users:function(e,t){var r=this,a=r.options;var s=r._get_users_from_cache();if(s.length){var i=[];var n=scheduler.serverList("sections").slice();jQuery.each(s,function(e,t){var s;if(a.current_tab=="projects"){s=t.user}else{s=t}if(r._get_loaded_resources_count()<a.max_resource_count){var o=r._get_user_obj(s);n.push(o);i.push(s.id)}});r.update_sections(n);var o=a.scheduler.getState();if(a.show_unscheduled_tasks){r._load_tasks_by_owner({ownerIds:i,load_all_tasks:true,start_date:o.min_date,end_date:o.max_date},t)}else{r._load_tasks_by_owner({ownerIds:i,load_unscheduled:false,start_date:o.min_date,end_date:o.max_date},t)}}else{r.remove_scroll_event(e)}},_get_user_obj:function(e,t){var r=e.name?e.name:e.orig.name;var a={key:e.id,label:r,orig:e,image_token:t,unsch_tasks:[],sch_tasks:[]};return a},handle_all_unscheduled:function(t,r){var a=this;if(t){is_checked=e(t).prop("checked");a._set_personalization({show_unscheduled_tasks:is_checked})}else{jQuery("#include_unshceduled_tasks").prop("checked",r);is_checked=r}if(jQuery("#toggleEnableDisableChat2").hasClass("on")){jQuery("#toggleEnableDisableChat2").addClass("off");jQuery("#toggleEnableDisableChat2").removeClass("on")}else if(jQuery("#toggleEnableDisableChat2").hasClass("off")){jQuery("#toggleEnableDisableChat2").addClass("on");jQuery("#toggleEnableDisableChat2").removeClass("off")}var s={show_unscheduled_tasks:is_checked};a._set_options(s);a.showProgressBar();if(is_checked){a._add_all_owners(function(){if(typeof r=="undefined"){scheduler.updateView()}a.hideProgressBar()})}else{var i=scheduler.serverList("sections");e.each(i,function(t,r){e.each(r.unsch_tasks,function(e,t){delete scheduler._events[t]});r.unsch_tasks=[]});if(typeof r=="undefined"){scheduler.updateView()}a.hideProgressBar()}},handle_unassigned:function(t,r){var a=this;if(t){is_checked=e(t).prop("checked");a._set_personalization({show_unassigned_tasks:is_checked})}else{jQuery("#include_unassigned_tasks").prop("checked",r);is_checked=r}var s=a.options;if(jQuery("#toggleEnableDisableChat1").hasClass("on")){jQuery("#toggleEnableDisableChat1").addClass("off");jQuery("#toggleEnableDisableChat1").removeClass("on")}else if(jQuery("#toggleEnableDisableChat1").hasClass("off")){jQuery("#toggleEnableDisableChat1").addClass("on");jQuery("#toggleEnableDisableChat1").removeClass("off")}a.showProgressBar();if(is_checked){a._add_unassigned(function(){if(typeof r=="undefined"){scheduler.updateView()}a.hideProgressBar()})}else{if(s.scheduler.serverList("sections").length<=1){a._set_personalization({show_unassigned_tasks:true});e("#include_unassigned_tasks").prop("checked",true);a.hideProgressBar();if(jQuery("#toggleEnableDisableChat1").hasClass("on")){jQuery("#toggleEnableDisableChat1").addClass("off");jQuery("#toggleEnableDisableChat1").removeClass("on")}else if(jQuery("#toggleEnableDisableChat1").hasClass("off")){jQuery("#toggleEnableDisableChat1").addClass("on");jQuery("#toggleEnableDisableChat1").removeClass("off")}if(s.current_tab==="projects"){showalert("warning",translate("sdp.members.not.available"),"isAutoHide=true,delay=2")}else{showalert("warning",translate("sdp.calendar.notech"),"isAutoHide=true,delay=2")}return false}a._remove_unassigned();a.hideProgressBar()}},_remove_unassigned:function(){var t=this;var r=t.options;r.show_unassigned_tasks=false;var a=r.scheduler.serverList("sections").slice();var s=a.splice(0,1);var i=s[0].unsch_tasks;var n=s[0].sch_tasks;e.each(i,function(e,t){delete scheduler._events[t]});e.each(n,function(e,t){delete scheduler._events[t]});t.update_sections(a)},get_unassigned_section:function(){var e={key:"not-assigned",label:translate("sdp.common.unAssign"),unsch_tasks:[],sch_tasks:[],orig:{}};return e},_add_unassigned:function(e){var t=this;var r=t.options;r.show_unassigned_tasks=true;var a=t.get_unassigned_section();var s=r.scheduler.serverList("sections").slice();if(s.length&&s[0].key=="not-assigned"){return}s.splice(0,0,a);t.update_sections(s);var i=r.scheduler.getState();var n={ownerIds:[],start_date:i.min_date,end_date:i.max_date};if(r.show_unscheduled_tasks){n.load_all_tasks=true}t._load_tasks_by_owner(n,e)},update_sections:function(e){var t=this;var r=t.options;r.scheduler.deleteMarkedTimespan();if(r.zoom_level!=="months"){t._load_op_hrs_and_holidays(e);var a=r.scheduler.getState();for(var s=0;s<e.length;s++){t._apply_marked_timespan_for_excluded_days(a.min_date,a.max_date,e[s].key,t._get_user_site(e[s].orig))}}r.scheduler.updateCollection("sections",e)},_get_scheduler_resources:function(){var e=this;var t=e.options;var r=t.scheduler.serverList("sections");return e._get_resources_as_array(r)},_get_resource_key_value:function(t){var r=this;var a=r.options;t=t||a.scheduler.serverList("sections").slice();var s={};e.each(t,function(e,t){s[t.key]=t.orig});return s},_get_resources_as_array:function(t){var r=[];e.each(t,function(e,t){r.push(t.key)});return r},_get_resources_as_key_value_pair:function(t){var r={};e.each(t,function(e,t){r[t.key]=t});return r},_get_resources_as_obj:function(){var e=this;var t=e.options;var r=t.scheduler.serverList("sections").slice();return r},_get_start_time_in_millis:function(e){if(!e){e=new Date;e.setHours(0,0,0,0)}var t=e.getTime();return t},_get_end_time_in_millis:function(e){if(!e){e=new Date;e.setHours(24,0,0,0)}var t=e.getTime();return t},_load_scheduled_tasks:function(e,t,r,a){var s=this,i=s.options;var n=s._get_start_time_in_millis(t);var o=s._get_end_time_in_millis(r);var l={start_index:1,row_count:100};l.search_criteria=[];var _={field:"scheduled_start_time",value:o,condition:"lesser than",children:[{field:"scheduled_end_time",value:n,condition:"greater than",logical_operator:"AND"}]};l.search_criteria.push(_);if(e.length){var d={field:"owner",values:e,condition:"is",logical_operator:"AND"};l.search_criteria.push(d)}s._attach_filter_modules(l);s._attach_filter_by(l);s._attach_pending_criteria(l);s._attach_sort_by(l);s._get_tasks_from_server(l,a)},_load_unscheduled_tasks:function(e,t){var r=this,a=r.options;var s={start_index:1,row_count:100};s.search_criteria=[];var i={field:"scheduled_start_time",value:null,condition:"is",children:[{field:"scheduled_end_time",value:null,condition:"is",logical_operator:"OR"}]};s.search_criteria.push(i);if(e&&e.length){var n={field:"owner",values:e,condition:"is",logical_operator:"AND"};s.search_criteria.push(n)}r._attach_filter_modules(s);r._attach_filter_by(s);r._attach_pending_criteria(s);r._attach_sort_by(s);r._get_tasks_from_server(s,t)},_load_both_tasks:function(e,t,r,a){var s=this,i=s.options;var n=s._get_start_time_in_millis(t);var o=s._get_end_time_in_millis(r);var l={start_index:1,row_count:100};l.search_criteria=[];var _={field:"scheduled_start_time",value:null,condition:"is",children:[{field:"scheduled_end_time",value:null,condition:"is",logical_operator:"OR"},{field:"scheduled_start_time",value:o,condition:"lesser than",children:[{field:"scheduled_end_time",value:n,condition:"greater than",logical_operator:"AND"}],logical_operator:"OR"}]};l.search_criteria.push(_);if(e&&e.length){var d={field:"owner",values:e,condition:"is",logical_operator:"AND"};l.search_criteria.push(d)}s._attach_filter_modules(l);s._attach_filter_by(l);s._attach_pending_criteria(l);s._attach_sort_by(l);s._get_tasks_from_server(l,a)},_attach_filter_by:function(e){var t=this,r=t.options;if(r.filter&&r.filter.id&&r.filter.id!=0){e.filter_by={id:r.filter.id}}},_attach_filter_modules:function(e){var t=this,r=t.options;if(r.current_tab=="projects"){var a={field:"associated_entity",values:["Project","Milestone"],condition:"is",logical_operator:"AND"};e.search_criteria.push(a)}},_set_filtered_module:function(){var t=this,r=t.options;r.filtered_module=[];e.each(e("input[name='taskModule']:checked"),function(){r.filtered_module.push(e(this).val())})},_attach_pending_criteria:function(e){var t=this,r=t.options;var a={field:"status.in_progress",value:"true",condition:"is",logical_operator:"AND"};e.search_criteria.push(a)},_attach_not_deleted_criteria:function(e){var t=this,r=t.options;var a={field:"deleted",value:false,condition:"is",logical_operator:"AND"};e.search_criteria.push(a)},_attach_sort_by:function(e){var t=this,r=t.options;e.sort_field="owner.id";e.sort_order="asc"},_get_tasks_from_server:function(r,a){var s=this;o=s.options;var i=s._get_tasks_url();var n=o.scheduler.getState();var l=function(_,d){var u=[];e.each(_.tasks,function(e,r){if(o.scheduler.getEvent(r.id)==t){if(o.scheduler.getEvents(n.min_date,n.max_date).length+u.length>o.max_event_count){var a=r.owner?r.owner.name:"not-assigned";return false}else{var i=s._create_scheduler_object(r,{});o.scheduler.setEvent(i.id,i)}}});if(_.list_info.has_more_rows){if(o.scheduler.getEvents(n.min_date,n.max_date).length>o.max_event_count){if(a){a()}}else{r.start_index=r.start_index+100;var c=sdpAjaxInputData({list_info:r});sdpAjax({url:i,type:"GET",data:c,acceptODCompatible:true,success:function(e){l(e)}})}}else{if(a){a()}}};r.start_index=1;var _=sdpAjaxInputData({list_info:r});sdpAjax({url:i,type:"GET",data:_,acceptODCompatible:true,success:function(e){l(e)}})},showProgressBar:function(){e(".res-mgmt-loading").addClass("active");e(".res-mgmt-loading").removeClass("inactive")},hideProgressBar:function(){e(".res-mgmt-loading").addClass("inactive");e(".res-mgmt-loading").removeClass("active")},_get_tasks_url:function(e){var t=this,r=t.options;var a;if(r.projectId){a="/api/v3/projects"+"/"+r.projectId+"/"+"tasks";if(e){if(e.parent==="project"){a="/api/v3/projects/"+e[e.parent].id+"/tasks"}else{a="/api/v3/projects/"+e.project.id+"/milestones/"+e.milestone.id+"/tasks"}}}else{if(e){if(e.parent==="request"){a="/api/v3/requests/"+e[e.parent].id+"/tasks"}else if(e.parent==="change"){a="/api/v3/changes/"+e[e.parent].id+"/tasks"}else if(e.parent==="problem"){a="/api/v3/problems/"+e[e.parent].id+"/tasks"}else if(e.parent==="project"){a="/api/v3/projects/"+e[e.parent].id+"/tasks"}else if(e.parent==="milestone"){a="/api/v3/projects/"+e.project.id+"/milestones/"+e.milestone.id+"/tasks"}else if(e.parent==="release"){a="/api/v3/releases/"+e[e.parent].id+"/tasks"}else{a="/api/v3/tasks"}}else{a="/api/v3/tasks"}}return a},_getUrl:function(e,t){var r=this.options;var a=this._get_tasks_url(e);a+="/"+e.id;return a},_load_tasks_by_owner:function(e,t){var r=this;o=r.options;if(e.load_all_tasks){if(e.ownerIds){var a=e.ownerIds.indexOf("not-assigned");if(a!=-1){e.ownerIds.splice(a,1)}if(o.show_unassigned_tasks){e.ownerIds.push(null)}return r._load_both_tasks(e.ownerIds,e.start_date,e.end_date,t)}else{var s=r._get_scheduler_resources();var a=s.indexOf("not-assigned");if(a!=-1){s.splice(a,1)}if(o.show_unassigned_tasks){s.push(null)}var i=0;var n=Math.ceil(s.length/100);while(s.length){i++;var l=s.splice(0,100);if(i===n){r._load_both_tasks(l,e.start_date,e.end_date,t)}else{r._load_both_tasks(l,e.start_date,e.end_date)}}}}else if(e.load_unscheduled){if(e.ownerIds){var a=e.ownerIds.indexOf("not-assigned");if(a!=-1){e.ownerIds.splice(a,1)}if(o.show_unassigned_tasks){e.ownerIds.push(null)}r._load_unscheduled_tasks(e.ownerIds,t)}else{var s=r._get_scheduler_resources();var a=s.indexOf("not-assigned");if(a!=-1){s.splice(a,1)}if(o.show_unassigned_tasks){s.push(null)}var i=0;var n=Math.ceil(s.length/100);while(s.length){i++;var l=s.splice(0,100);if(i===n){r._load_unscheduled_tasks(e.ownerIds,t)}else{r._load_unscheduled_tasks(e.ownerIds)}}}}else{if(e.ownerIds){var a=e.ownerIds.indexOf("not-assigned");if(a!=-1){e.ownerIds.splice(a,1)}if(o.show_unassigned_tasks){e.ownerIds.push(null)}return r._load_scheduled_tasks(e.ownerIds,e.start_date,e.end_date,t);if(!e.ownerIds.length){sdpHideIndicator()}}else{var s=r._get_scheduler_resources();var a=s.indexOf("not-assigned");if(a!=-1){s.splice(a,1)}if(o.show_unassigned_tasks){s.push(null)}var i=0;var n=Math.ceil(s.length/100);while(s.length){i++;var l=s.splice(0,100);if(i===n){r._load_scheduled_tasks(l,e.start_date,e.end_date,t)}else{r._load_scheduled_tasks(l,e.start_date,e.end_date)}}}}},_before_inline_edit:function(e,r,a){var s=this;var i=this.options;s._inline_edit(e,a,function(e){if(e.response_status.status==="success"){i.scheduler.dhtmlXTooltip.hide();if(i.projectId){loadResourceUtilization(i.projectId)}else{typeof loadHomePageTabContent!=="undefined"&&loadHomePageTabContent("resource")===t||window.location.reload()}}else{s.refresh_after_edit(r);var a;if(e.response_status.messages){a=e.response_status.messages[0]?e.response_status.messages[0].message:t}if(!a){a=getMessageForKey("sdp.scheduler.edit.failure.message")}}})},_inline_edit:function(t,r,a){var s=this;var i=this.options;var n={};n.task=s._get_changed_fields(t,r);var o=s._getUrl(t,true);var l=sdpAjaxInputData(n);e.ajax({url:o,type:"PUT",data:l,headers:{accept:"vnd.manageengine.v3+json"},success:function(e){a(e)},error:function(e,t,r){var s=e.responseJSON&&e.responseJSON.response_status;if(s){var i=e.responseJSON.response_status;if(s&&i.messages&&i.messages[0].status_code==4001){showalert("failure",translate("sdp.task.invalid.owner"),"isAutoHide=true,delay=2")}else if(s&&i.status_code==4e3&&i.messages[0].status_code>=6e4&&i.messages[0].status_code<=60005){showalert("failure",i.messages[0].message,"isAutoHide=true,delay=5")}else if(s&&i.status_code==4e3){showalert("failure",translate("api.validation.unauthorised"),"isAutoHide=true,delay=2")}}a(e.responseJSON)},async:false})},_get_changed_fields:function(r,a){var s=this;var i={};if(a!==t){e.each(a,function(e,t){var a;if(t=="owner"){a=r.owner_id==="not-assigned"?null:s._get_id_obj(r.owner_id);if(r.origitem.marked_technician){i.marked_technician=a}else{i[t]=a}}else if(t=="scheduled_start_time"){a=s._get_as_date(r.start_date.getTime());i[t]=a}else if(t=="scheduled_end_time"){a=s._get_as_date(r.end_date.getTime());i[t]=a}})}return i},_get_as_date:function(e){var t={};if(e===""){return null}var r=new Date(e);var a=r.getTime()-r.getTimezoneOffset()*6e4;if(parent.sdp_user.OFFSET){a=a-parent.sdp_user.OFFSET}t.value=a;return t},_editItems:function(e){var t=e.id,r=e.parent,a,s;if(r!="general"){a=e[r].id}if(r==="milestone"){s=e["project"].id}$tasks.loadTasks("detail",r,a,t,"resMgmt",s)},refresh_after_edit:function(e){var t=this;var r=t.options;var a=e.id;var s=r.scheduler.getEvent(a);s=t._create_scheduler_object(e,s);r.scheduler.updateEvent(a);scheduler.updateView()},set_filter_and_refresh:function(e){var r=this;o=this.options;o.filter={id:e};r._clear_all();r.showProgressBar();r.refresh_scheduler_by_owner(t,function(){r._load_readonly_tasks();o.scheduler.updateView();r._fix_date_position();r.hideProgressBar()})},refresh_scheduler_by_owner:function(e,t){var r=this,a=r.options;var s={ownerIds:e,start_date:a.scheduler.getState().min_date,end_date:a.scheduler.getState().max_date};if(a.show_unscheduled_tasks){s.load_all_tasks=true}r._load_tasks_by_owner(s,t)},_get_events_between:function(e,t,r){var a=[];for(var s in r){var i=r[s];if(i&&!i.readonly&&!i.unscheduled&&(!e&&!t||i.start_date<t&&i.end_date>e)){a.push(i)}}return a},_calculate_op_hours_between:function(t,r,a){var s=this;var i=s.options;var n=0;e.each(a,function(e,a){var o=a.start_date<t?t:a.start_date;var l=a.end_date>r?r:a.end_date;var _=a.owner;var d;if(_){var u=s._get_users();var c=u.filter(function(e){return e.key==_.id});c=c.length?c[0].orig:null;d=s._get_user_site_for_index(c)}else{d=0}var h;var f=new Date(o);f.setHours(0,0,0,0);while(f<=l){var p=s._is_tech_holiday(f,d);var m=s._is_tech_weekend(f,d);if(!p&&!m&&!s._is_excluded_day(f,d)){var v=i.operational_hours[d]?i.operational_hours[d].operational_hours.days_of_operation:i.operational_hours[0].operational_hours.days_of_operation;var g=s._find_day_index(f,v);h=v[g].hours_of_operation;var y=h.break_end_time.hours*60+h.break_end_time.minutes-(h.break_start_time.hours*60+h.break_start_time.minutes);var w=h.end_time.hours*60+h.end_time.minutes-(h.start_time.hours*60+h.start_time.minutes)-y;n+=w*60*1e3}f.setDate(f.getDate()+1)}if(!(s._is_tech_weekend(o,d)||s._is_tech_holiday(o,d))||s._is_excluded_day(o,d)){var v=i.operational_hours[d]?i.operational_hours[d].operational_hours.days_of_operation:i.operational_hours[0].operational_hours.days_of_operation;var g=s._find_day_index(o,v);h=v[g].hours_of_operation;var x=new Date(o);x.setHours(h.start_time.hours,h.start_time.minutes,0,0);var k=new Date(o);k.setHours(h.end_time.hours,h.end_time.minutes,0,0);var b=new Date(o);b.setHours(h.break_start_time.hours,h.break_start_time.minutes,0,0);var j=new Date(o);j.setHours(h.break_end_time.hours,h.break_end_time.minutes,0,0);if(o>x&&o<k){if(o>b&&o<j){n-=b-x}else if(o>=j){n-=o-j+(b-x)}else{n-=o-x}}else if(o>x){var y=h.break_end_time.hours*60+h.break_end_time.minutes-(h.break_start_time.hours*60+h.break_start_time.minutes);var w=h.end_time.hours*60+h.end_time.minutes-(h.start_time.hours*60+h.start_time.minutes)-y;n-=w*60*1e3}}if(!(s._is_tech_weekend(l,d)||s._is_tech_holiday(l,d)||s._is_excluded_day(l,d))){var v=i.operational_hours[d]?i.operational_hours[d].operational_hours.days_of_operation:i.operational_hours[0].operational_hours.days_of_operation;var g=s._find_day_index(l,v);h=v[g].hours_of_operation;var x=new Date(l);x.setHours(h.start_time.hours,h.start_time.minutes,0,0);var k=new Date(l);k.setHours(h.end_time.hours,h.end_time.minutes,0,0);var b=new Date(l);b.setHours(h.break_start_time.hours,h.break_start_time.minutes,0,0);var j=new Date(l);j.setHours(h.break_end_time.hours,h.break_end_time.minutes,0,0);if(l<k&&l>x){if(l<j&&l>b){n-=k-j}else if(l<=b){n-=k-j+(b-l)}else{n-=k-l}}else if(l<k){var y=h.break_end_time.hours*60+h.break_end_time.minutes-(h.break_start_time.hours*60+h.break_start_time.minutes);var w=h.end_time.hours*60+h.end_time.minutes-(h.start_time.hours*60+h.start_time.minutes)-y;n-=w*60*1e3}}});return Math.floor(n/(1e3*60))},_calculate_total_op_hours_between:function(e,t,r){var a=this;var s=a.options;var i=new Date(e.getTime());i.setHours(0,0,0,0);var n=0;var o=a._get_user_site_for_index(r);var l,_,d,u;while(i<t){if(!a._is_tech_weekend(i,o)&&!a._is_tech_holiday(i,o)&&!a._is_excluded_day(i,o)){var c=s.operational_hours[o]?s.operational_hours[o].operational_hours.days_of_operation:s.operational_hours[0].operational_hours.days_of_operation;var h=a._find_day_index(i,c);l=c[h].hours_of_operation;_=l.break_end_time.hours*60+l.break_end_time.minutes-(l.break_start_time.hours*60+l.break_start_time.minutes);d=l.end_time.hours*60+l.end_time.minutes-(l.start_time.hours*60+l.start_time.minutes)-_;u=d*60*1e3;n+=u}i.setDate(i.getDate()+1)}return Math.floor(n/(1e3*60))},_load_readonly_tasks:function(t,r,a){var s=this;o=s.options;var i=scheduler.getState();var n=s._get_resource_key_value(a);if(o.show_utilization&&(o.zoom_level=="days"||o.zoom_level=="weeks")){e.each(n,function(e,a){var s={id:e+"_user",owner:a,text:"work hours",owner_id:e,readonly:true,color:"#BDBDBD",textColor:"white",start_date:t?t:i.min_date,end_date:r?r:i.max_date};if(e!=="not-assigned"){scheduler.setEvent(s.id,s)}});if(!o.utilMouseMoveEvent){o.utilMouseMoveEvent=scheduler.attachEvent("onMouseMove",function(t,r){if(t){if(scheduler.getEvent(t).readonly){if(e(r.target).hasClass("load-util-blue")||e(r.target).hasClass("load-util-red")||e(r.target).hasClass("load-util-text-red")||e(r.target).hasClass("load-util-text-blue")){var a=r.target;if(e(a).hasClass("load-util-text-red")||e(a).hasClass("load-util-text-blue")){a=e(a).prev()}var s=e(a).data("totworkmin");var i=e(a).data("totopmin");var n,o,l,_;var d=Math.floor(Math.abs(i-s)/60)+translate("sdp.requests.view.short.hour")+" "+Math.abs(i-s)%60+translate("sdp.requests.view.short.minute");var u=Math.floor(s/60)+translate("sdp.requests.view.short.hour")+" "+s%60+translate("sdp.requests.view.short.minute")+" /"+Math.floor(i/60)+translate("sdp.requests.view.short.hour")+" "+i%60+translate("sdp.requests.view.short.minute");if(s>i){n=translate("sdp.over.utilized");_=translate("sdp.utilization.excess");o="rtm-over-util";l="rtm-under-util"}else{n=translate("sdp.under.utilized");_=translate("sdp.remaining");o="rtm-under-util";l="rtm-over-util"}e("#rtm-hour-manage .rtm-load .rtm-wh-value").text(u);e("#rtm-hour-manage .rtm-excess-rem .rtm-wh-value").text(d);e("#rtm-hour-manage .rtm-excess-rem .rtm-wh-label").text(_);e("#rtm-hour-manage .rtm-wh-heading").removeClass(l).addClass(o).text(n);e(a).parent().attr("showpopover",true);e(a).parent().attr("data-popover","mouseover");e(a).parent().attr("data-target-id","#util-popup");e(a).parent().attr("custom-class","res-popover");e(a).parent().attr("data-icon","true");e(a).parent().off().on("mouseover",function(t){showPopover(t,"mouseover");e("#showPopover").removeClass("popover-ui")})}}}})}}else{var l=scheduler.getEvents(i.min_date,i.max_date);e.each(l,function(e,t){if(t.readonly){delete scheduler._events[t.id]}});delete o.utilMouseMoveEvent}},_load_tasks:function(e,t,r,a){var s=this,i=s.options;var n={start_date:e,end_date:t};if(r){n.load_all_tasks=true}s._load_tasks_by_owner(n,a)},reload_task:function(e,t){var r=this;var a=r._getUrl(t);setTimeout(function(){sdpAjax({url:a,type:"GET",acceptODCompatible:true,success:function(t){var a=t.task;var s=r.options.scheduler.getEvent(e);var i=r._create_scheduler_object(a,s);r.options.scheduler.updateEvent(i);r.options.scheduler.updateView()},async:false})},500)},delete_task:function(e){var t=this;t.options.scheduler.deleteEvent(e)},_get_id_obj:function(e){var t={};if(e===""){return null}t.id=e;return t},_fullscreen_config:function(){var t=this;var r=t.options;e(".dhx_expand_icon").on("click.fullscreen",function(e){t._fullscreen_toggle()})},_fullscreen_toggle:function(){var t=this;var r=t.options;var a=jQuery("#filter-menu")[0].clientWidth;jQuery("#filter-menu").css("top",jQuery(".dhx_scale_bar").offset().top+13);if(jQuery("#zooming").val()==="days"){jQuery("#filter-menu").css("top",jQuery(".dhx_scale_bar").offset().top)}jQuery("#filter-menu").css("z-index","102");if(sdp_user.DIRECTION==="RTL"){jQuery("#filter-menu").css("right",(200-a)/2+(jQuery(window).width()-(jQuery(".dhx_cal_header").offset().left+jQuery(".dhx_cal_header").outerWidth())))}else{jQuery("#filter-menu").css("left",(200-a)/2+jQuery(".dhx_cal_header").offset().left)}t._fullscreen_tooltip();if(r.scheduler.expanded){jQuery("#filter-menu").css("z-index","103");e("#res-filter-left").parent().css("z-index","104");e("#res-filter-left").removeClass("res-filter-left");e(".dhx_expand_icon").attr("style","background-position: -286px -75px !important");e(".dhx_expand_icon").css("top","13px");e("#res-filter-left").addClass("res-filter-left-expand");e("#res-filter-right").removeClass("res-filter-right");e("#res-filter-right").addClass("res-filter-right-expand");e("#res-filter-left,#res-filter-right").css("top","-"+(Number(jQuery("#res-filter-left").parent().offset().top)-Number(jQuery("#disp_date").offset().top)+"px"));e("#scheduler_container").css("z-index",100);e(".dhx_cal_data").trigger("scroll");var s=e(".dhx_data_table")[0].style.width;e("#readonly-bar-width-style").html(".readonly-bar-width{width : "+s+" !important}")}else{jQuery("#filter-menu").css("z-index","13");e("#res-filter-left,#res-filter-right").css("top","1px");e("#res-filter-left").parent().css("z-index","20");e(".dhx_expand_icon").attr("style","background-position: -265px -75px !important");e(".dhx_expand_icon").css("top","12px");e("#res-filter-left").addClass("res-filter-left");e("#res-filter-left").removeClass("res-filter-left-expand");e("#res-filter-right").addClass("res-filter-right");e("#res-filter-right").removeClass("res-filter-right-expand");e("#scheduler_container").css("z-index",5);t._load_readonly_tasks();e("#readonly-bar-width-style").html(".readonly-bar-width{width : "+e(".dhx_data_table")[0].style.width+" !important}")}},_fullscreen_tooltip:function(){var t=this;var r=t.options;if(r.scheduler.expanded){e(".dhx_expand_icon").attr("title",translate("sdp.exit.fullscreen"))}else{e(".dhx_expand_icon").attr("title",translate("sdp.fullscreen"))}},_fix_technician_filter_position:function(){var e=jQuery("#filter-menu")[0].clientWidth;if(o.zoom_level==="days"){jQuery("#filter-menu").css("top",jQuery(".dhx_scale_bar").offset().top)}else{jQuery("#filter-menu").css("top",jQuery(".dhx_scale_bar").offset().top+13)}if(sdp_user.DIRECTION==="RTL"){jQuery("#filter-menu").css("right",(200-e)/2+(jQuery(window).width()-(jQuery(".dhx_cal_header").offset().left+jQuery(".dhx_cal_header").outerWidth())))}else{jQuery("#filter-menu").css("left",(200-e)/2+jQuery(".dhx_cal_header").offset().left)}jQuery(".dhx_cal_scale_placeholder").parent().parent().remove()},zoom_schedule:function(e,t,r){var a=t?new Date(Number(t)):new Date;var s=this,i=s.options;s._clear_all();i.zoom_level=e;s.showProgressBar();s._time_period_config(e,t,r);i.scheduler.setCurrentView(a);var n=i.scheduler.getState();var o=n.min_date;var l=n.max_date;s._load_tasks(o,l,i.show_unscheduled_tasks,function(){s._load_readonly_tasks(o,l);i.scheduler.updateView();s._fix_date_position();s._fix_technician_filter_position();s.hideProgressBar();var e=jQuery(".dhx_cal_header.dhx_second_cal_header").find(".dhx_scale_bar.dhx_second_scale_bar:last-child").width();jQuery(".dhx_cal_header.dhx_second_cal_header").find(".dhx_scale_bar.dhx_second_scale_bar:last-child").css("width",e+17);s._set_personalization(null,true)})},_set_timeline_matrix:function(e){var r=this,a=r.options;a.scheduler.matrix.timeline.x_unit=e.x_unit;a.scheduler.matrix.timeline.x_step=e.x_step?e.x_step:1;a.scheduler.matrix.timeline.x_size=e.x_size;a.scheduler.matrix.timeline.x_start=0;a.scheduler.matrix.timeline.x_length=e.x_size;a.scheduler.matrix.timeline.y_unit=r._get_resources_as_obj();a.scheduler.matrix.timeline.y_property="owner_id";if(e.second_scale){a.scheduler.matrix.timeline.second_scale={};a.scheduler.matrix.timeline.second_scale.x_unit=e.second_scale.x_unit}else{a.scheduler.matrix.timeline.second_scale=t}if(e.x_date){a.scheduler.matrix.timeline.x_date=e.x_date}if(e.second_scale&&e.second_scale.x_date){a.scheduler.matrix.timeline.second_scale.x_date=e.second_scale.x_date}},load_technician_filter:function(t){var r=this;var a=1;if(o.projectId){o.project_members=e(".popover #res-select").select2("val")}showPopover(t,"click");e("#showPopover").removeClass("popover-ui");e("#showPopover #apply_filter").off("click").on("click",function(){jQuery("#scheduler_container").scheduler("set_res_filter");closeDD()});e("#showPopover #cancel-member-filter").off("click").on("click",function(){closeDD()});jQuery(".popover #site-select").select2({placeholder:translate("sdp.admin.org.technician.allsite"),multiple:false,maximumSelectionSize:a,formatSelectionTooBig:function(e){return getMessageForKey("sdp.scheduler.sites.count.alert")},formatSelection:function(e){return ashtmlString(e.name)},formatNoMatches:translate("common.no.match.found"),formatResult:function(e){return ashtmlString(e.name)},allowClear:true,query:function(e){r.construct_site_filter(e)}}).on("change",function(e){jQuery(".popover #group-select").select2("val","");jQuery(".popover #res-select").select2("val","")}).on("select2-close",function(e){setTimeout(function(){jQuery(".tech-popover").css("display","block");jQuery("body").on("click",function(){closeDD()})},150)});var s=10;jQuery(".popover #group-select").select2({placeholder:translate("sdp.admin.org.technician.allgroup"),multiple:true,maximumSelectionSize:s,formatSelectionTooBig:function(e){return translate("sdp.max.count")},formatSelection:function(e){return ashtmlString(e.name)},formatResult:function(e){return ashtmlString(e.name)},formatNoMatches:translate("common.no.match.found"),allowClear:true,closeOnSelect:false,containerCssClass:"group-select",query:function(e){jQuery("#scheduler_container").scheduler("construct_group_filter",e)}}).on("change",function(e){jQuery(".popover #res-select").select2("close");if(e.val.length==1&&e.added||e.removed){jQuery(".popover #res-select").select2("val","")}}).on("select2-close",function(e){setTimeout(function(){jQuery(".tech-popover").css("display","block");jQuery("body").on("click",function(){closeDD()})},150)});jQuery(".popover #res-select").select2({placeholder:o.current_tab==="projects"?translate("sdp.all.project.members"):translate("sdp.calendar.alltechs"),multiple:true,maximumSelectionSize:10,formatSelectionTooBig:function(e){return translate("sdp.max.count")},formatSelection:function(e){return ashtmlString(e.name)},formatResult:function(e){return ashtmlString(e.name)},formatNoMatches:translate("common.no.match.found"),allowClear:true,closeOnSelect:false,containerCssClass:"res-select",query:function(e){jQuery("#scheduler_container").scheduler("construct_res_filter",e)}}).on("select2-close",function(e){setTimeout(function(){jQuery(".tech-popover").css("display","block");jQuery("body").on("click",function(){closeDD()})},150)});setTimeout(function(){jQuery("#filter-by").css("display","block");jQuery("#filter-by").parent().css("width","inherit");jQuery("#_DIALOG_LAYER .DialogBox tbody").children().first().remove()},1);r._set_filters_with_personalization_data()},_init_task_filter:function(){var t=this.options;var r;var a=sdpAjaxInputData({module:"task",list_info:{row_count:"100"}});sdpAjax({url:"/api/v3/list_view_filters/show_all",type:"GET",acceptODCompatible:true,data:a,success:function(e){e.show_all=e.show_all.filter(function(e){if(e.name!="my_completed_tasks"&&e.name!="completed_tasks"){return e}});r=e},async:false});e("#task_custom_filter").on("click",function(){var e=new filterListComp;if(typeof closeDD!=="undefined"){closeDD()}e.initComponent({element:"#TasksFilterMenu",module:"task",personalize_key:"task_filter_views",skipPersonalization:true,filter_action:"setTaskFilterForRM",managefilter_url:"/ListViewFilter.do?module=task&action=listview",user_type:sdp_user.USERTYPE,favoritable:true,data:r,processFilters:function(e){e=e.filter(function(e){if(e.name!="my_completed_tasks"&&e.name!="completed_tasks"){return e}});return e}})});var s;if(t.task_filter!=null){s=t.task_filter.list_info&&t.task_filter.list_info.filter_by?t.task_filter.list_info.filter_by.id:null}var i;var n=r.show_all;var o;for(var l=0;l<n.size();l++){var _=n[l];if(_.id==0){o=_.display_name}if(_.id==s){i=_.display_name;break}}if(!i){s=0;t.filter=null;i=o}e("#selected_tasklist_filter").text(i)},_time_period_config:function(r,a,s){var i=this,n=i.options;var o=a?new Date(Number(a)):new Date;n.starting_date=o;var l=s?new Date(Number(s)):s;jQuery("#zooming-text").text(translate("sdp.change.sla."+r));jQuery("#zooming").val(r);n.zoom_level=r;if(!n.scheduler.matrix.timeline.second_scale){n.scheduler.matrix.timeline.second_scale={}}switch(r){case"months":var _=32;var d=92;var u;n.scheduler.deleteMarkedTimespan();if(a!==t&&s!==t){u=Math.ceil((l-o)/(1e3*60*60*24));if(u<_){i._time_period_config("weeks",a,s);return}else if(u>d){u=d}}else{u=d;n.ending_date=scheduler.date.add(o,u,"day")}var c={x_unit:"day",x_size:u,x_date:"%j",second_scale:{x_unit:"month",x_date:"%M %Y"}};i._set_timeline_matrix(c);n.scheduler.ignore_timeline=null;break;case"weeks":var _=7;var d=31;var u=1;if(a!==t&&s!==t){u=Math.ceil((l-o)/(1e3*60*60*24));if(u<_){i._time_period_config("days",a,s);return}else if(u>d){u=d}}else{u=d;n.ending_date=scheduler.date.add(o,u,"day")}if(e(window).width()>1600){var c={x_unit:"day",x_size:u,x_date:"%j %M",second_scale:{x_unit:"week",x_date:"%F '%y"}}}else{var c={x_unit:"day",x_size:u,x_date:"%j",second_scale:{x_unit:"week",x_date:"%F '%y"}}}n.scheduler.templates.timeline_second_scale_date=function(e){var t=sdpDate.format({entire_date:e,type:"MMMM"});var r=sdpDate.format({entire_date:e,type:"YY"});return t+" '"+r};n.scheduler.templates.timeline_scale_date=function(e){var t=sdpDate.format({entire_date:e,type:"MMM"});return sdpDate.format({entire_date:e,type:"DD"})+" "+t};i._set_timeline_matrix(c);n.scheduler.ignore_timeline=null;break;case"days":var _=2;var d=7;var u=1;if(a!==t&&s!==t){u=Math.ceil((l-o)/(1e3*60*60*24));if(u<_){e("#date_select").val(a);e("#date_select_Display").val(sdpDate.format({entire_date:a,type:"DD MM YYYY"}));i._time_period_config("hours",a,s);return}else if(u>d){e("#date_select").val(a);e("#date_select_Display").val(sdpDate.format({entire_date:a,type:"DD MM YYYY"}));i._time_period_config("weeks",a,s);return}}else{u=d;n.ending_date=scheduler.date.add(o,u,"day")}n.scheduler.matrix.timeline.x_unit="day";n.scheduler.matrix.timeline.x_step=1;n.scheduler.matrix.timeline.x_size=u;n.scheduler.matrix.timeline.x_start=0;n.scheduler.matrix.timeline.x_length=u;n.scheduler.matrix.timeline.y_unit=i._get_resources_as_obj();n.scheduler.matrix.timeline.y_property="owner_id";delete n.scheduler.matrix.timeline.second_scale;n.scheduler.matrix.timeline.x_date="%j %M (%D)";n.scheduler.templates.timeline_scale_date=function(e){var t=sdpDate.format({entire_date:e,type:"MMM"});var r=sdpDate.format({entire_date:e,type:"ddd"});var e=sdpDate.format({entire_date:e,type:"DD"});return e+" "+t+" ("+r+")"};n.scheduler.ignore_timeline=null;break;case"hours":var c={x_unit:"hour",x_size:24,x_date:"%H:%i",second_scale:{x_unit:"day",x_date:"%j %F (%D)"}};n.scheduler.templates.timeline_scale_date=function(e){return sdpDate.format({entire_date:e,type:"HH:mm"})};n.scheduler.templates.timeline_second_scale_date=function(e){var t=sdpDate.format({entire_date:e,type:"MMMM"});var r=sdpDate.format({entire_date:e,type:"YY"});return t+" '"+r};i._set_timeline_matrix(c);n.scheduler.ignore_timeline=null;break}},setZoomLevel:function(e){var t=jQuery(e).attr("name");jQuery("#zooming").val(t);jQuery("#zooming-text").text(jQuery(e).text());jQuery("#scheduler_container").scheduler("zoom_schedule",t)},setEventOptions:function(e){var t=jQuery(e).attr("name");jQuery(".bar-settings a[data-selected]").removeAttr("data-selected");jQuery(e).attr("data-selected","true");t=t.replace(" ","_");jQuery("#scheduler_container").scheduler("change_bar_color",jQuery(".bar-settings a[data-selected]").attr("name"))},setBarColorAndLegends:function(e,t){var r=this;o=r.options;jQuery("#scheduler_legends").html("");var a=jQuery('<span class="project-sch-footer-heading"/>');if(e!="none"){a.text(a.text()+" ("+jQuery("[name="+e+"]").text()+"):");var s={start_index:1,row_count:100};var i="/api/v3/tasks/"+e;if(e=="status"){s.search_criteria={field:"in_progress",condition:"is",value:true}}if(o.projectId){i="/api/v3/projects/"+o.projectId+"/tasks/"+e}var n=function(a,l){if(e!="status"){r.buildAndAppendLegend("#1796b0",translate("sdp.common.notassigned"))}jQuery.each(a[e],function(e,t){r.buildAndAppendLegend(t.color,t.name)});if(a.list_info.has_more_rows){s.start_index=a.list_info.start_index+100;var _=sdpAjaxInputData({list_info:s,for:"resource_mgmt"});sdpAjax({url:i,type:"GET",data:_,acceptODCompatible:true,success:function(e){n(e)}})}else{if(!o.scheduler.expanded){if(o.current_tab==="home"){var d=jQuery(".project-sch-footer").position().top-jQuery(".headerbar")[0].getBoundingClientRect().bottom;jQuery(".project-sch-container").height(d);jQuery(".project-sch-footer").width(jQuery(".headerbar").width())}else if(o.current_tab==="projects"){if(o.projectId){var d=jQuery(".project-sch-footer").position().top-jQuery("[data-id=ui-tabs1-pos]")[0].getBoundingClientRect().bottom-14;jQuery(".project-sch-container").height(d);jQuery(".project-sch-footer").width(jQuery("#ui-framework-design1").width()-40)}else{var d=jQuery(".project-sch-footer").position().top-jQuery("#ui-framework-design1")[0].getBoundingClientRect().bottom;jQuery(".project-sch-container").height(d);jQuery(".project-sch-footer").width(jQuery("#ui-framework-design1").width()-20)}}}t()}};var l=sdpAjaxInputData({list_info:s,for:"resource_mgmt"});sdpAjax({url:i,type:"GET",data:l,acceptODCompatible:true,success:function(e){n(e)}})}else{jQuery("#scheduler_legends").append(a[0].outerHTML);jQuery("#color-text").text(translate("common.none"));r.buildAndAppendLegend("#1796b0",translate("common.none"));t()}},buildAndAppendLegend:function(e,t){if(!e){e="#1796b0"}var r=jQuery('<span class="wo-color-priority sch-color-holder ml5 mr5">');r.css("background-color",e);var a=jQuery('<span class="project-sch-footer-txt">');a.text(t);var s=jQuery('<div class="disp-ib"></div>');s.append(r).append(a);jQuery("#scheduler_legends").append(s)}})})(jQuery);var is_dhtmlxscheduler_initialized=false;function resourceInit(e){renderhbs("#resourceMgmt","ResourceManagement",e,false,"task/resource");jQuery(window).trigger("scroll");e.projectId?initScheduler(e.projectId):initScheduler();setTimeout(function(){jQuery("html, body").animate({scrollTop:100});if(e.projectId){jQuery("#filter-menu").css("top",jQuery(".dhx_scale_bar").offset().top+13)}},500);initTooltip("#resourceMgmt")}function initScheduler(e){var t={filtered_module:[],filtered_resource:{},operational_hours:{},holidays:{}};if(e&&e!="null"&&e!=""){t.projectId=e}if(typeof globalsetting==="undefined"){t.time_format="%d %M, %Y";t.date_format="%D, %j %M";setTimeout(function(){jQuery("#scheduler_container").scheduler(t)},100)}}(function(){if(typeof scheduler!=="undefined"){scheduler.config.autoscroll_offset=50;var e=150,t=25,r=30,a=10;var s=null,i=null;function n(e,t){var r={},a={},s=t;r.x=!!e.touches?e.touches[0].pageX:e.pageX;r.y=!!e.touches?e.touches[0].pageY:e.pageY;a.left=0;a.top=0;while(s){a.left+=s.offsetLeft;a.top+=s.offsetTop;s=s.offsetParent}return{x:r.x-a.left,y:r.y-a.top}}function o(e){if(s){clearInterval(s)}var t={pageX:!!e.touches?e.touches[0].pageX:e.pageX,pageY:!!e.touches?e.touches[0].pageY:e.pageY};s=setInterval(function(){l(t)},a)}function l(a){if(!scheduler.getState().drag_id){clearInterval(s);i=null;return}var o=scheduler._obj;var l=n(a,o);var u=o.offsetWidth;var c=o.offsetHeight;var h=l.x;var f=l.y;var p=0;var m=_(f,c,i?i.y:0,e,t);if((m||p)&&!i){i={x:h,y:f};p=0;m=0}p=p*r;m=m*r;if(p&&m){if(Math.abs(p/5)>Math.abs(m)){m=0}else if(Math.abs(m/5)>Math.abs(p)){p=0}}if(p||m){i.started=true;d(p,m)}else{clearInterval(s)}}function _(e,t,r,a,s){if(e<a&&(!i||i.started||e<r)){return-1}else if(t-e<s&&(!i||i.started||e>r)){return 1}return 0}function d(e,t){var r=scheduler._obj;if(t){var a=r.querySelector(".dhx_cal_data");a.scrollTop+=t}if(e){r.scrollLeft+=e}}var u=scheduler.attachEvent("onSchedulerReady",function(){dhtmlxEvent(document.body,"mousemove",o);scheduler.detachEvent(u)})}})();