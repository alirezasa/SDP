/* $Id$ */
var changelistview = {
	table_tech_changes: null, /*Table component call variable*/
	resizetimer: '', /*Table component call variable*/
	init: function() {/*Initialise table component and leftnav height calculation*/
		this.initTablecomponent();
		this.leftnavhgt();
	},
	leftnavhgt: function() {/*Change Listview Leftpanel(Calender) and rightpanel(Table) height calculation use for onchange the screen*/
		var _self = this;
		
		clearTimeout(_self.resizetimer);
			_self.resizetimer = setTimeout(function() {
			var dynHeight = jQuery('#listview .listcontrols').outerHeight() + jQuery('#listview .listcontrols').offset().top + is_chathgt + 20; /*Height Calculation for table*/ //No I18N
			var leftwdh = jQuery('#task-list-sidebar').width() + 30;/*Leftpanel width + spacing*/ //No I18N
			if(jQuery('#combined-task-view').hasClass('hide-sidebar')) {/*Leftpanel is hide*/
				leftwdh = 50;
			}
			if(sdp_user.CLIENT_CONF.changelistview == undefined) {
				sdp_user.CLIENT_CONF.changelistview = {
					current_view_mode: 'table' // No I18N
				};
			}
			if(sdp_user.CLIENT_CONF.changelistview.current_view_mode == "classic") {
				if(table_tech_changes != undefined && table_tech_changes != null) {
					table_tech_changes.setTableWidth(jQuery("#td-container").width() - leftwdh);/*Table component width trigger event*/ //NO I18N
					table_tech_changes.setTableHeight(jQuery(window).height() - dynHeight);/*Table component height trigger event*/
				}
			} else {
				window.adjustWOTableHeight(jQuery(".tableComponent"));/*width and height calculation in table view*/  //NO I18N
			}
			jQuery('#taskview-sidebar-list').height(jQuery(window).height() - jQuery('#taskview-sidebar-list').offset().top - is_chathgt - 10); /*Leftpanel Height set, is_chathgt -- fixed chat bar height*/ //No I18N
		},400);
	},
	initTablecomponent: function() {/*Change Listview table component initialize*/
    	if(sdp_user.CLIENT_CONF.changelistview == undefined) {
			/* Check if tablecompoent classic or table view 
				if not than go with table view
			*/
		    sdp_user.CLIENT_CONF.changelistview = {
		    	current_view_mode: 'table' // No I18N
		    };
    	}
	    var tableInfo = table_comp.getTableInfo('changes'); // No I18N

	    var table_content = {};
	        table_content.header = this.headerDataConstruct(); //No I18N
	    
	    var leftwdh = jQuery('#task-list-sidebar').width() + 30;/*Leftpanel width + spacing*/ //No I18N
		if(jQuery('#combined-task-view').hasClass('hide-sidebar')) {/*Leftpanel is hide*/
			leftwdh = 50;
		}
	    var dynHeight = jQuery('#listview .listcontrols').outerHeight() + jQuery('#listview .listcontrols').offset().top + is_chathgt + 20;/*Height Calculation for table*/ //No I18N
		
	    var options = {
	        callbackURL          : "changes", // No I18N
	        entity_name          : "changes", // No I18N
	        paginationEnabled    : true,
	        searchEnabled        : true,
	        sortingEnabled       : true,
	        multiDeleteEnabled   : true,
	        columnChooserEnabled : true,
	        getmetaInfo          : true,
	        metaInfo_input		 : {'for':'list_view'}, // No I18N
	        staticHeader         : true,
	        isODAPI				 : true,
	        bulkSelectionSetting : {
	        	selectionDisplayField: "title", // No I18N
                selectionCallBack: this.toggleCheckbox,
                unSelectionCallback: function (elm) {
                    changelistview.toggleCheckbox(elm);
                },
                selectionCallback: function (elm) {
                    changelistview.toggleCheckbox(elm);
                }
	        },
	        width                : jQuery("#td-container").width() - leftwdh,
	        height               : jQuery(window).height() - dynHeight,
			included_fields 	 : ['stage', 'short_description','change_type','urgency'], //No I18N
	        callbackRowfunction  : this.rowDataConstruct,
			isFR_ListInfo_Support : true,
	        row_inputdata        : this.rowDataConstruct(tableInfo, {}),
	        discarded_fields	 : ['description', 'deleted_time'], //No I18N
			default_sort_field	: {"sort_field": "id","sort_order":"desc"},//No I18N
	        personalize_key      : 'changes' //No I18N
	    };
		if(sdp_user.CLIENT_CONF.changelistview.current_view_mode == "classic") {
			col_set = {
			    "default_position": 2,//No I18N
			    "assign_label_width": false,//No I18N
			    "assign_content_width":false,//No I18N
			    "columns": [{//No I18N
			        "size": 1 //No I18N
			      },{
			        "size": 9,//No I18N
			        "row_count": 2, //No I18N
					"pipe_separation": true, //No I18N
			        "default_rowposition": 2//No I18N
			    },{
					"size": 2 //No I18N
				}]
			};
			
			var emptyhtml = '<div class="req-empty-list empty-state text-center fh"><div class="empty-svg"><div class="empty-content"><span class="empty-title">'+ getMessageForKey('common.emptytext1') + '</span><p class="mt5">'+getMessageForKey('common.emptytext2')+'</p></div></div></div>';
			if (changelistview.trashView) {
				var trashTitle = getMessageForKey("filter.trashed.changes");
				jQuery("#listview_btn").attr("title", e_attr(trashTitle)); //No I18N
				jQuery("#ListProListHdr").html(e_html(trashTitle)); //No I18N
				tableInfo.list_info.filter_by = {"name": "trashed_changes"};// No I18N
				navparamId = "trashed_changes";// No I18N
			}
			else {
			sdpAjax({/*change filter name using render table*/
				url: '/api/v3/changes/get_filter',// No I18N
				async:false,
				success: function(data) {
					var id = data.list_view_filter.id;
					navparamId = id;
					jQuery("#listview_btn").attr("title", e_attr(data.list_view_filter.display_name)); //No I18N
					jQuery("#ListProListHdr").html(e_html(data.list_view_filter.display_name)); //No I18N
					tableInfo.list_info.filter_by = { "id": id };// No I18N
				}
			});
			}
			var icon_settings = {
                "show_icons_Bottom": true, //No I18N
                "position": 2, //No I18N
                "isPrepend":true,  //No I18N
                "rowPosition" : 2,  //No I18N
                "class": "disp-ib vmiddle" //No I18N
            };
			var c_opt = {"column_settings" : col_set,"view" : "kanban", "view_mode": "linear", "nodataString": emptyhtml, "icon_settings" : icon_settings, "callbackAfterBodyRender" : changelistview.callAfterEveryRender}; //No I18N
			
			options = jQuery.extend(options, c_opt);
		}
	    table_tech_changes = new tableComponent(tableInfo, table_content, options, {});
		var _self = this;
		if(sdp_user.CLIENT_CONF.changelistview.current_view_mode == 'classic') {
			jQuery('#changes_sortorder span').addClass('vtop');
			jQuery('#changes_sortfield button').removeClass('pt1')
			jQuery('#changes_sortfield button span:first').removeClass('vmiddle').addClass('vtop');
			setTimeout(function(){
				_self.bindEvents();
				initTooltip("#listcontrols"); //No I18N
			},1000);
			
			/*Custom filter call event*/
			var meta_info = {};
			var meta = table_tech_changes.t_obj.meta_info;
			jQuery.each(meta, function (field, Obj) {
				if(field.indexOf('udf_fields') == '-1') {//skip udf fields
					meta_info[field] = Obj;
				}
			});
			var meta_info1 = {"metainfo": {"fields":meta_info}};//No i18n
			var viewoptions = {
				metaInfoData: meta_info1,
				parentDiv: "ad_search_changes", //No i18n
				entityComponent: changelistview,
				applyFn: changelistview.applyFilterView,
				cancelFn: changelistview.cancelFilterView,
				customView: {
					dialog_title_text: translate('common.advance.search')
				},
				allowReadOnly:true,
				haveMultiString:true
			};
			viewFilterComponent.initComponent(viewoptions);
		}
	},
	callAfterEveryRender: function() {/*After load classic view hide page loader and progress bar and visible the containter*/
		jQuery('.listloader').hide();
        jQuery('.page-progressbar').hide();
        jQuery("#listview.listview").css("visibility","inherit"); //No I18N
		if (navparamId === 'trashed_changes') {
			var delButton = getMessageForKey('sdp.common.delete.permanent');//No I18N
			jQuery("#DELETE").attr("title", e_attr(delButton));
			jQuery('#changeCalendarView').removeClass("bs-noconflict").addClass("hide");
			jQuery('#addNewChange').removeClass("bs-noconflict").addClass("hide");
			jQuery('#trashBanner').addClass("bs-noconflict").removeClass("hide");
		}
		else {
			var trashButton = getMessageForKey('sdp.common.delete');//No I18N
			jQuery("#DELETE").attr("title", trashButton);
			jQuery('#changeCalendarView').addClass("bs-noconflict").removeClass("hide");
			jQuery('#addNewChange').addClass("bs-noconflict").removeClass("hide");
			jQuery('#trashBanner').removeClass("bs-noconflict").addClass("hide");
		}
		let closeActionMenus = jQuery("[id='CHG_CLOSE_MENU']");

		closeActionMenus.each(function() {
			jQuery(this).off("click").on('click', function(event) { //NO I18N
				let changeId = event.target.getAttribute("changeId");
				changesBulkOperation('CLOSE',changeId,true);
			});
		});
	},
	toggleCheckbox: function (elm) {
		/*Check box 'checked' event 
			if checked count is greater '0' 
				hide fields 'add, filter' 
				show fileds 'pickup, assign, delete'
		*/
		var _self = this;
		var selectedIds = table_tech_changes.bulkSelect.getSelectedIDs().length;
		if (elm.length != 0) {
			if(selectedIds > 0) {
                if(jQuery('[data-id=lc-selection]').length >= 1) {
					var actionButtons = jQuery('[data-id=lc-selection]');
					actionButtons.addClass("bs-noconflict").removeClass("hide");
					if (navparamId === 'trashed_changes') {
						var buttonsToHide = ["PICKUP", "assignAction", "CHG_BULK_CLOSE"];//NO I18N
						for (var i = 0; i < actionButtons.length; i++) {
							if (buttonsToHide.includes(actionButtons[i].id)) {
								jQuery(actionButtons[i]).removeClass("bs-noconflict").addClass("hide");
							}
						}
						jQuery('#CHG_RESTORE').addClass("bs-noconflict").removeClass("hide");
					}
                }
                jQuery(".list-icon-groups").addClass("hide");
			} else {
                if(jQuery('[data-id=lc-selection]').length >= 1) {
                    jQuery('[data-id=lc-selection]').removeClass("bs-noconflict").addClass("hide");
					jQuery('#CHG_RESTORE').removeClass("bs-noconflict").addClass("hide");
                }
                jQuery(".list-icon-groups").removeClass("hide");
				if (navparamId === 'trashed_changes') {
					jQuery('#changeCalendarView').removeClass("bs-noconflict").addClass("hide");
					jQuery('#addNewChange').removeClass("bs-noconflict").addClass("hide");
				}
				else {
					jQuery('#changeCalendarView').addClass("bs-noconflict").removeClass("hide");
				}
			}
			setTimeout(function(){
				_self.leftnavhgt();
			},100);
		}else {
			if(selectedIds==0){
				if(jQuery('[data-id=lc-selection]').length >= 1) {
					jQuery('[data-id=lc-selection]').removeClass("bs-noconflict").addClass("hide");
					jQuery('#CHG_RESTORE').removeClass("bs-noconflict").addClass("hide");
				}
				jQuery(".list-icon-groups").removeClass("hide");
				if (navparamId === 'trashed_changes') {
					jQuery('#changeCalendarView').removeClass("bs-noconflict").addClass("hide");
					jQuery('#addNewChange').removeClass("bs-noconflict").addClass("hide");
				}
				else {
					jQuery('#changeCalendarView').addClass("bs-noconflict").removeClass("hide");
				}
				setTimeout(function(){
					_self.leftnavhgt();
				},100);
			}

		}
	},
    rowDataConstruct: function(table_info) {
		var inputObject = {};
		var fields_required = table_info.fields_required;

		var fields_required_arr = Object.keys(fields_required);
			inputObject.list_info = table_info.list_info;

		var editindex = fields_required_arr.indexOf("edit"); // No I18N
			editindex > -1 && fields_required_arr.splice(editindex, 1);
		  
		if (color_settings_helper.color_settings && color_settings_helper.color_settings.is_enabled  && !isDark()) {
            if (fields_required_arr.indexOf(color_settings_helper.color_settings.field) === -1) {
                fields_required_arr.push(color_settings_helper.color_settings.field);
            }
        }

		var stindex = fields_required_arr.indexOf("status"); // No I18N
		if(stindex > -1){
			fields_required_arr.push("stage"); // No I18N
		}
		if (fields_required_arr.indexOf("title") != -1) {
			fields_required_arr.push("short_description");// No I18N
			fields_required_arr.push("change_type");// No I18N
			fields_required_arr.push("urgency");// No I18N
		}
		fields_required_arr.push("template"); // No I18N
		if(navparamId === 'trashed_changes')	
		{
			fields_required_arr.push("deleted_time"); // No I18N
		}

		inputObject.fields_required = fields_required_arr;
		return inputObject;
	},
	headerDataConstruct: function() {/*Using table component data construct and event for fields*/
        var metaData = {
			"changes_head_chk": { //No I18N
				"dataCelltransformer": this.constructChkboxCell, //No I18N
				"type" : "checkbox", // No I18N
				"column_settings": {"view_type": "row", "position": 1}, //No I18N
				"hide_label": true, //No I18N
				"default" : true // No I18N
			},
            edit : { 
                "dataCelltransformer" : this.constructeditCell, //No I18N
				"column_settings": {"position": 1}, //No I18N
                "hide_label": true, //No I18N
                "default": true, //No I18N
                "disableSorting": true //No I18N
            },
            notes_present : { 
                "dataCelltransformer" : this.constructnotesCell, //No I18N
                "type" : "icon", //No I18N
                "hide_label": true, //No I18N
                "default": true //No I18N
            },
            title: {
            	"default": true, //No I18N
            	"searchingEnabled": true, //No I18N
            	"sortingEnabled": true, //No I18N
            	"column_settings": { "view_type": "row" ,"rowposition":1 }, //No I18N
            	"dataCelltransformer": this.titlenav, //No I18N
            	"hide_label": true //No I18N
            },
            id: {
            	"display_name": getMessageForKey("sdp.common.id"), //No I18N
                "sortingEnabled":true // No I18N
            },
            approval_status: {"sortingEnabled": true}, //No I18N
            category: {"sortingEnabled": true}, //No I18N
            change_manager: {"sortingEnabled": true}, //No I18N
            change_owner: {"sortingEnabled": true}, //No I18N
            change_requester: {"sortingEnabled": true}, //No I18N
            change_type: {"dataCelltransformer": this.changeTypeCell,"sortingEnabled": true}, //No I18N
            created_time: {"sortingEnabled": true}, //No I18N
            completed_time: {"sortingEnabled": true}, //No I18N
            group: {"sortingEnabled": true}, //No I18N
            impact: {"sortingEnabled": true}, //No I18N
            item: {"sortingEnabled": true}, //No I18N
            risk: {"sortingEnabled": true}, //No I18N
            subcategory: {"sortingEnabled": true}, //No I18N
            template: {"sortingEnabled": true}, //No I18N
            urgency: {"sortingEnabled": true}, //No I18N
            scheduled_start_time: {"sortingEnabled": true}, //No I18N
            scheduled_end_time: {"sortingEnabled": true}, //No I18N
            priority: {"dataCelltransformer": this.changePriorityCell,"sortingEnabled": true}, //No I18N
            emergency: {"dataCelltransformer": this.changeEmergencyCell},// No I18N
            sla_violation: {"dataCelltransformer": this.changeSLAviolation},// No I18N
            stage: { "default": true, "disableSorting": true },//No I18N
            status: {// No I18N
				"default" : true, // No I18N
				"dataCelltransformer": this.constructstatusCell, //No I18N
				"hide_label": true, //No I18N
				"column_settings": {// No I18N
					"view_type": "row", "position":3// No I18N
				},
				"sortingEnabled": true// No I18N
			},
			closure_code: { "disableSorting": true }, // No I18N
			next_review_on: { "disableSorting": true }, // No I18N
			workflow: { "disableSorting": true }, // No I18N
			site: { "disableSorting": true }, // No I18N
			sla: { "disableSorting": true }, // No I18N
			reason_for_change: { "disableSorting": true } // No I18N
        };
        return metaData;
	},
	constructChkboxCell: function (table_data) {/*Checkox field construct for classic view use flip container*/
	    var rd = table_data.row_data;
		if(sdp_user.CLIENT_CONF.changelistview.current_view_mode == 'table') {
			return "<input type='checkbox' name='checkbox' value=" + rd.id + " templateid=" + rd.template.id + " data-table-checkbox>"; //No I18N
		} else {
			return '<input type="checkbox" id="chkreq' + rd.id + '" value="' + rd.id + '"  templateid="' + rd.template.id + '" name="checkbox" class="mt20" data-table-checkbox>'; // No I18N
		}
	},
	constructeditCell: function(table_data) {/*construct edit icon and click event for table*/
	    var rd = table_data.row_data;
		var html = "";// No I18N
		var isTrash = navparamId === 'trashed_changes'; //NO I18N
		if (sdp_user.ROLES.indexOf("ModifyChanges") != -1 || sdp_user.ROLES.indexOf("DeleteChanges") != -1) {
			html = '<div class="btn-group tc-req-edit bs-noconflict"> <a class="cur-ptr cspr menulist icon-xs flat2 sdmenu-toggle vtop" data-switch="sdmenu" title="' + getMessageForKey("sdp.common.actions") + '" ></a><ul class="sdmenu-dd" role="menu">';// No I18N
			
			html += sdp_user.ROLES.indexOf("ModifyChanges") != -1 && !window.externalframe && !isTrash  ? '<li><a data-cs-field="edit_change" rel="noopener" href="/ui/changes?mode=edit&entity_id=' + rd.id + '">' + getMessageForKey("sdp.common.edit") + ' </a></li>':"";// No I18N
			
			var rd_pick = "changesBulkOperation('PICKUP',"+rd.id+","+true+")";
			html += sdp_user.ROLES.indexOf("ModifyChanges") != -1 && !window.externalframe && !isTrash ? '<li><a data-cs-field="pickup_change" nonce='+sdpNonce+' data-event="click" data-handler="'+rd_pick+'" href="/">' + getMessageForKey("common.pickup") + ' </a></li>':"";// No I18N
			
			html += sdp_user.ROLES.indexOf("ModifyChanges") != -1 && !window.externalframe && !isTrash ? '<li><a data-cs-field="close_change" id="CHG_CLOSE_MENU" class="cur-ptr" changeId="'+rd.id+'">' + translate("common.close") + ' </a></li>':"";// No I18N

			var rd_delete = "changelistview.deleteChangeBulk("+rd.id+")";// No I18N
			html += sdp_user.ROLES.indexOf("DeleteChanges") != -1 ? (isTrash ? '' : '<li class="divider"></li>')+'<li><a  data-cs-field="delete_change" nonce='+sdpNonce+' data-event="click" data-handler="'+rd_delete+'" href="/">' + getMessageForKey("sdp.common.delete") + '</a></li>':"";// No I18N

			var rd_restore = "changelistview.restoreChangeBulk("+rd.id+")";// No I18N
			html += sdp_user.ROLES.indexOf("DeleteChanges") && isTrash ? '<li><a data-cs-field="restore_change" nonce='+sdpNonce+' data-event="click" data-handler="'+rd_restore+'" href="/">' + getMessageForKey("sdp.requests.restorerequests") + '</a></li>':"";

			html +='</ul></div>';// No I18N
		}
		return html;
	},
	constructnotesCell: function(table_data) {/*construct notes icon and click event for table view*/
		if (navparamId === "trashed_changes") {
			return '';
		}
		var rd = table_data.row_data;		
		var fncall = "showConversationInDialog('/common/ViewConversationsFromList.jsp?mode=view&currentView=Open_System&module=changes&id="+ rd.id+ "&view=notes','"+ rd.id +"');";  //No I18N
		if(rd.notes_present) {/*New notes*/
			return '<a href="/" nonce='+sdpNonce+' data-event="click" data-handler="'+fncall+'" title="'+getMessageForKey('common.view.notes')+'" class="list-sprite icon-sm notes-icon mr10" rel="uitip" id="N_'+rd.id+'" target="_self"></a>';
		} else {/*Added notes*/
			return '<a href="/" nonce='+sdpNonce+' data-event="click" data-handler="'+fncall+'" title="'+getMessageForKey('common.add.notes')+'" class="tc-nonotes vmiddle mr10" rel="uitip" id="N_'+rd.id+'" target="_self"></a>';
		}
	},
	titlenav: function(table_data) {/*construct title(subject) and click event for table view*/
		var color="transparent",rd = table_data.row_data;//No I18N
		if (color_settings_helper.color_settings && color_settings_helper.color_settings.is_enabled && !isDark()) {/*Color setting colors apply for list*/
		    var colorSetting = color_settings_helper.color_settings;
		    var csField = colorSetting.field;
		    if (rd[csField] != null) {
				var curFieldval = rd[csField].id;
				if(!curFieldval && typeof rd[csField] === 'boolean') {
					curFieldval = rd[csField] ? "1" : "2"; //No I18N
				}
				if (colorSetting[csField]) {
		            if (colorSetting[csField][curFieldval]) {
		                color = colorSetting[csField][curFieldval].background_color;
		            } else {
		                color = colorSetting.default_color;
		            }
		        }
		    } else {
		        color = colorSetting.default_color;
		    }
		    color = e_attr(color);
		}
		var rd_urgency, rd_desc, rd_type, rd_category;
		if(rd.change_type == null) {/*Type return null than show N/A with basic color*/
			rd_type = getMessageForKey('sdp.common.na');
		} else {
			rd_type = rd.change_type.name;
		}
		if(rd.short_description == null || rd.short_description == '') {
            rd_desc = '-';
        } else {
        	rd_desc = rd.short_description;
        }
		if(rd.urgency == null) {
			rd_urgency = '-'
		} else {
			rd_urgency = rd.urgency.name;
		}
		if(rd.category == null) {
			rd_category = '-'
		} else {
			rd_category = rd.category.name;
		}
		var titleAttr = "<strong>"+getMessageForKey('sdp.change.changeId')+" : </strong>" + e_attr(rd.id) + "<br><strong>"+getMessageForKey('sdp.common.title')+" : </strong>" + e_attr(rd.title) + "<br><strong>"+getMessageForKey('sdp.itil.common.changetype')+" : </strong>" + e_attr(rd_type) + "<br><strong>"+getMessageForKey('sdp.itil.common.urgency')+" : </strong>" + e_attr(rd_urgency) + "<br><strong>"+getMessageForKey('sdp.common.category')+" : </strong>"+e_attr(rd_category)+"<br><strong>"+getMessageForKey('sdp.common.description')+" : </strong>" + rd_desc;
		if(rd.deleted_time)
		{
			titleAttr=titleAttr+"<br><strong>"+translate('change.deletedtime')+" : </strong>" + e_attr(rd.deleted_time.display_value)
		}
		var chg_title = e_html(rd.title);
		
		if(sdp_user.CLIENT_CONF.changelistview.current_view_mode != 'table') {
			chg_title = '#'+rd.id+' '+e_html(rd.title);
	    }
	    return '<span class="disp-ib p3 truncate-ellipsis"><span class="truncate-wrapper"><a href="/ui/changes?entity_id='+ rd.id +'&mode=detail" rel="uitip" mode_html="true" title="'+e_attr(titleAttr)+'" class="truncate-wrapper uni-heading" style="background-color:'+color+'">'+chg_title+'</a></span></span>';;
	},
	changeTypeCell: function(table_data) {/*construct change type for table view*/
		var rd = table_data.row_data;
		var typecolor = 'background-color: #cccccc;';//No i18n
		var typekey = getMessageForKey('sdp.common.na');
		if(rd.change_type != null) {/*Type return not equal null than show N/A with basic color*/
			typecolor = 'background-color: '+rd.change_type.color+';';//No i18n
			typekey = e_html(rd.change_type.name);
		}
		return '<div class="disp-t fw" id="statusfixtable"><div class="disp-c vtop ctypebox" style="'+typecolor+ '"></div><div class="disp-c vtop">'+typekey+'</div></div>';
	},
	changeSLAviolation: function(table_data) {
		return (table_data.row_data.sla_violation == null) ? '-' : (table_data.row_data.sla_violation) ? getMessageForKey('sdp.change.submission.yes') + '<img align="absmiddle" class="overdue-icon2 vtop ml5" src="/images/spacer.gif" hspace="2" title="SLA Violated">' : getMessageForKey('sdp.change.submission.no');//No i18n
	},
	changeEmergencyCell: function(table_data) {
		return (table_data.row_data.emergency) ? getMessageForKey('sdp.common.true').toLowerCase() : getMessageForKey('sdp.common.false').toLowerCase();
	},
	changePriorityCell: function(table_data) {/*construct priority for table view*/
		var rd = table_data.row_data;
		var typeclass = '';
		var typecolor = '';
		var typekey = '-';
		if(rd.priority != null) {/*priority return not equal null than show - */
			typecolor = 'background-color: '+rd.priority.color+';';//No i18n
			typekey = e_html(rd.priority.name);
			typeclass = 'ctypebox';//No i18n
		}
		return '<div class="disp-t fw" id="statusfixtable"><div class="disp-c vtop '+typeclass+'" style="'+typecolor+ '"></div><div class="disp-c vtop">'+typekey+'</div></div>';
	},
	constructstatusCell: function(table_data) {/*construct status for table view*/
		var rd = table_data.row_data;
		if(sdp_user.CLIENT_CONF.changelistview.current_view_mode == 'table') {
			return e_html(rd.status.name);
		} else {/*in classic view third column we show status with stage*/
			return '<div class="mt3 wspace-normal pl30 ml10 font-medium1">'+e_html(rd.stage.name)+' / '+e_html(rd.status.name)+'</div>';
		}
	},
	deleteChangeBulk: function(id) {
		jQuery('#delEntityid').val(id);// No I18N
		showDialog(jQuery('#deleteEntitydiv').html(),'closeButton=no, position=absmiddle');// No I18N
			document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-DeleteEntityDialogue-0"]').addEventListener('mousedown', function(event) {// No I18N
                			captureDialog(event);
                		});

                document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-DeleteEntityDialogue-1"]').addEventListener('click', function(event) {// No I18N
                    deleteEntity('change', null, true);// No I18N
                });

               document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-DeleteEntityDialogue-2"]').addEventListener('click', function(event) {// No I18N
                			closeDialog();
                		});
	},
	restoreChangeBulk: function(id) {
		jQuery('#restoreChangeid').val(id);// No I18N
		showDialog(jQuery('#restoreChangeDiv').html(),'closeButton=no, position=absmiddle',function(){// No I18N
			let dialogDiv=document.getElementById('_DIALOG_CONTENT');
			dialogDiv.querySelector('[sdpJs="js-event-RestoreChangeDialogue-0"]').addEventListener("mousedown", function(event) { captureDialog(event) });// No I18N
			let element=dialogDiv.querySelector('[sdpJs="js-event-RestoreChangeDialogue-1"]');// No I18N

			if(element)
			{
				element.addEventListener("click", function(event) { restoreBulk() });// No I18N
			}
			let element2=dialogDiv.querySelector('[sdpJs="js-event-RestoreChangeDialogue-2"]')// No I18N

			if(element2)
			{
				element2.addEventListener("click", function(event) { restoreChange() });// No I18N
			}

			dialogDiv.querySelector('#restoreDialog_Cancel').addEventListener("click", function(event) { closeDialog(); });

		});
	},
	bindEvents: function() {/*Change classic listview search event*/
		var _self = this;
		jQuery("#changes_listSearch").off().on("click", function () {
            _self.constructSearchPop();
        });
	},
	applyFilterView: function(criteria) {/*Custom filter apply event*/
		const cri = criteria.map(a => ({...a}));
		for(var i=0; i<cri.length; i++) {
			if(cri[i].field == "title") {
				cri[i].condition = "contains";
			}
			if(cri[i].field == "site") {
				var val = cri[i].values;
				var valarr = [];
				for(var j=0; j<val.length; j++) {
					if(val[j].id == "-1") {
						valarr.push(null);
					} else {
						valarr.push(val[j]);
					}
				}
				cri[i].values = valarr;
			}
		}
        table_tech_changes.t_obj.table_info.list_info.search_criteria = cri;
        table_tech_changes.refreshTable('refresh');// No I18N
	},
	cancelFilterView: function() {/*Custom filter cancel event*/
		delete table_tech_changes.t_obj.table_info.list_info.search_criteria;
        table_tech_changes.refreshTable('refresh');// No I18N
	},
	switchChangeView: function(current_view_mode) {/*mode change (classic/table view)*/
	    var perObj = sdp_user.CLIENT_CONF.changelistview ? sdp_user.CLIENT_CONF.changelistview : {} ;
	    perObj.previous_mode = current_view_mode;
	    perObj.current_view_mode = current_view_mode;
	    switch(current_view_mode){
	        case "classic"://No I18N
	            window.current_change_mode = "classic";//No I18N
	        break;
	        case "table"://No I18N
	            window.current_change_mode = "table";//No I18N
	        break;
	    }
	    addPersonalization("changelistview",perObj);//No I18N
	    //sdpAjaxUrlHandler("/Changes.cc")//No I18N
		var url = "/Changes.cc";// No I18N
		if (navparamId === "trashed_changes") {
			url = "/Changes.cc?trashView=true";// No I18N
		}
	    changelistview.changeAjaxHandler(url)
	},
	changeAjaxHandler: function(url) {/*Change Listview Ajax Handler refer from ajaxHistory.js file*/
		var _self = this;
		jQuery('.page-progressbar').show();
		window.history.pushState({url:url}, '', url);
		if(url.indexOf("?") === -1) {
			url = url + "?noheader=true";//No I18N
		} else {
			url+="&noheader=true";//No I18N
		}
		var pl_h = jQuery("#td-container");
		jQuery.ajax({
			type: "GET",// No I18N
			url: url, 
			success: function(data) { // No I18N
				if (data.indexOf("j_username") > 0 && data.indexOf("j_password") > 0) {// When the session times out and then the user clicks on any link, then the page will be refreshed
				  location.href = url;
				} else {
				  pl_h.html(data);
				  jQuery('.page-progressbar').hide();
				}
				setTimeout(function(){
					if(sdp_user.CLIENT_CONF.changelistview == undefined) {
						/* Check if tablecompoent classic or table view 
							if not than go with table view
						*/
						sdp_user.CLIENT_CONF.changelistview = {
							current_view_mode: 'table' // No I18N
						};
					}
					requestAnimationFrame(function(){
						show_bs_menu();
					});
					_self.leftnavhgt();
				},100);
			}
		});
	}
};
