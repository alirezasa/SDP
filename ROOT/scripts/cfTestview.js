// $Id$
var cf_List = {
	table_compreq: null,
	moduleName: null,
	tableId: null,
	showListview: function(moduleName,tableId, cmPrimaryColumn, cmPrimaryColumnDispName) {
		var table_info = table_comp.getTableInfo(tableId+'_cf'); //No I18N
		var table_content = {};
		var _self = this;
		_self.moduleName = moduleName;
		_self.tableId = tableId;
		_self.cmPrimaryColumn = cmPrimaryColumn;
		_self.cmPrimaryColumnDispName = cmPrimaryColumnDispName;
		table_content.header = _self.headerdataConstruct(table_info);
		setTimeout(function() {
			var options = {};
			options.paginationEnabled = true;
			options.searchEnabled = true;
			options.sortingEnabled = true;
			options.personalize_key = tableId+'_cf'; // No I18N
			options.acceptODCompatible = true;
			options.row_inputdata = _self.rowdataConstruct(table_info, _self);
			options.callbackURL = tableId;
			options.callbackAfterBodyRender = _self.callbackAfterTableRender;
			options.entity_name = tableId;
			options.nodataString = translate(emptyMsg);
			options.isODAPI = true;
			options.support_search_criteria = true;
			if (moduleName == 'rcf') {
				table_info.list_info.filter_by = {"name": filterId}; // No I18N
			} else if (moduleName == 'pbcf') {// No I18N
				table_info.list_info['search_criteria'] = {"field": "status.name","condition": "is","value": filterId}; // No I18N
			}else {
			    if(!moduleName.startsWith('cm_')){
				table_info.list_info.filter_by = {"id": filterId}; // No I18N
				}
			}

			_self.table_compreq = new tableComponent(table_info, table_content, options);
		}, 0);
	},
	rowdataConstruct: function(table_info) {
		var inputObject = {};
		var list_info = table_info.list_info;
		inputObject.list_info = list_info;
		return inputObject;
	},
	headerdataConstruct: function(table_info) {
		if (this.moduleName == 'rcf') {
			var meta_data = {
				"head_chk": { // No I18N
					"type": "icon", // No I18N
					"default": true, // No I18N
					"dataCelltransformer": this.constructtemplateOpt // No I18N
				},
				"id": { // No I18N
					"text": translate("sdp.requests.MergeReq.id"), // No I18N
					"width":"90px", // No I18N
					"type": "long", // No I18N
				},
				"subject": {"text": translate("sdp.requests.common.title"),"dataCelltransformer" : this.constructtemplateSubject}, // No I18N
				"due_by_time": {"type":"date","text": translate("sdp.requests.common.dueby"),"disableSearching": true}, // No I18N
				"technician": { // No I18N
					"text": "sdp.requests.viewrequest.listview.assignedto", // No I18N
					"dataCelltransformer" : this.constructtemplateTech, // No I18N
					"type":"lookup",// No I18N
					"lookup_field":"name", // No I18N
					"value_path": "technician.name" // No I18N
				},
				"status": {"text": translate("sdp.requests.common.status"),"value_path":"status.name"}, // No I18N
				"created_time": {"type":"date","text": translate("sdp.common.date"),"disableSearching": true,}, // No I18N
			};
		} else if (this.moduleName == 'relcf') { //No I18N
					var meta_data = {
				"head_chk": { // No I18N
					"type": "icon", // No I18N
					"default": true, // No I18N
					"dataCelltransformer": this.constructtemplateOpt // No I18N
				},
				"id": { // No I18N
					"text": translate("sdp.common.id"), // No I18N
					"width": "90px", // No I18N
					"type": "long", // No I18N
				},
				"title": {"text": translate("sdp.common.title"), "dataCelltransformer": this.constructtemplateTitle}, // No I18N
				"release_type": {"text": translate("common.type"), "value_path": "release_type.name", "dataCelltransformer": this.constructtemplateReleaseType}, // No I18N
				"stage": {"text": translate("sdp.admin.change.stage"), "value_path": "stage.name"}, // No I18N
				"status": {"text": translate("common.status"), "value_path": "status.name"}, // No I18N
				"priority": {"text": translate("common.priority"), "value_path": "priority.name", "dataCelltransformer": this.constructtemplatePriority}, // No I18N
				"release_engineer": {"text": translate("api.release.user.engineer"), "value_path": "release_engineer.name"}, // No I18N
			};
		} else if (this.moduleName.startsWith("cm_")) { // No I18N
        			var meta_data = {
        				"head_chk": { // No I18N
        					"type": "icon", // No I18N
        					"default": true, // No I18N
        					"dataCelltransformer": this.constructtemplateOpt // No I18N
        				},
        				"id": { // No I18N
        					"text": translate("sdp.common.id"), // No I18N
        					"width":"90px", // No I18N
							"type": "long", // No I18N
        				},
        				"primary_column": {"text": this.cmPrimaryColumnDispName,"value_path": this.cmPrimaryColumn == "title" ? "title" :"cm_fields."+this.cmPrimaryColumn}, // No I18N
        				"created_by": { // No I18N
        					"text": "common.createdby", // No I18N
        					"value_path": "created_by.name" // No I18N
        				},
        				"created_time": {"type":"date","text": translate("custom.created_time"),"disableSearching": true}, // No I18N
        			};
        }else {//meta data for change, project, task
			var meta_data = {
				"head_chk": { // No I18N
					"type": "icon", // No I18N
					"default": true, // No I18N
					"dataCelltransformer": this.constructtemplateOpt // No I18N
				},
				"id": { // No I18N
                    "text": translate("sdp.common.id"), // No I18N
                    "width":"90px", // No I18N
					"type": "long", // No I18N
                },
				"title": {"text": translate("sdp.common.title"),"dataCelltransformer": this.constructtemplateTitle}, // No I18N
				"status": {"text": translate("common.status"),"value_path": "status.name"}, // No I18N
				"priority": {"text": translate("common.priority"),"dataCelltransformer": this.constructtemplatePriority,"value_path": "priority.name"}, // No I18N
			};
			if (this.moduleName == 'ccf') {
				meta_data["change_owner"] = {"text": translate("sdp.change.rfc.changeowner"),"value_path": "change_owner.name"}; // No I18N
				meta_data["category"] = {"text": translate("sdp.requests.common.category"),"value_path": "category.name"}; // No I18N
				meta_data["change_type"] = {"text": translate("sdp.itil.common.changetype"),"dataCelltransformer": this.constructtemplatecType,"value_path": "change_type.name"}; // No I18N
				meta_data["stage"] = {"text": translate("sdp.admin.change.stages"),"value_path": "stage.name"}; // No I18N
			}
			if (this.moduleName == 'pcf' || this.moduleName == 'tcf') { // No I18N
				meta_data["owner"] = {"text": translate("common.owner"),"value_path": "owner.name"}; // No I18N
				meta_data["scheduled_end_time"] = {"type":"date","text": translate("sdp.reports.tasks.scheduledendtime"),"disableSearching": true}; // No I18N
				meta_data["scheduled_start_time"] = {"type":"date","text": translate("sdp.reports.tasks.scheduledstarttime"),"disableSearching": true}; // No I18N
				if (this.moduleName == 'tcf') {
					meta_data["associated_entity"] = {"text": translate("sdp.project.taskattribute.module"),"dataCelltransformer": this.constructtemplateModule}; // No I18N
				}
			}
			if (this.moduleName == 'pbcf') {
				meta_data["reported_by"] = {"text": translate("sdp.problem.details.requestedby"),"value_path": "reported_by.name"}; // No I18N
				meta_data["category"] = {"text": translate("sdp.requests.common.category"),"value_path": "category.name"}; // No I18N
				meta_data["urgency"] = {"text": translate("sdp.itil.common.urgency"),"value_path": "urgency.name"}; // No I18N
			}
		}
		return meta_data;
	},
	constructtemplateTitle: function(table_data) {
		var rd = table_data.row_data;var dispTitle="";
		if (this.moduleName == 'ccf') {
			var url = '/ui/print?externalframe=true&module=change&entity_id='+ rd.id;  // No I18N
			var rd_urgency, rd_desc, rd_type;
			if(rd.change_type == null) {/*Type return null than show N/A with basic color*/
				rd_type = getMessageForKey('sdp.common.na');
			} else {
				rd_type = rd.change_type.name;
			}
			if(rd.urgency == null) {
				rd_urgency = '-'
			} else {
				rd_urgency = rd.urgency.name;
			}
			dispTitle = "<strong>"+getMessageForKey('sdp.change.changeId')+" : </strong>"+e_attr(rd.id)+"<br><strong>"+getMessageForKey('sdp.common.title')+" : </strong>"+ e_attr(rd.title) +"<br><strong>"+getMessageForKey('sdp.itil.common.changetype')+" : </strong>"+ e_attr(rd_type) +"<br><strong>"+getMessageForKey('sdp.itil.common.urgency')+" : </strong>"+ e_attr(rd_urgency);
		}
		if (this.moduleName == 'ccf') {
			return "<a title=\""+encodeHTMLAttribute(dispTitle)+"\" rel='noopener uitip' mode_html='true' href="+url+" target='PreviewFrame' id='preview_frame' data_id='"+rd.id+"'>"+e_html(rd.title)+"</a>";
		} else if(this.moduleName == 'pbcf') {//No i18N
			var url='/ui/print?module=problem&entity_id='+rd.id+'&externalframe=true';//No I18n
			var title='<b>'+translate("problem.id")+' :</b> '+rd.id+' <br><b>'+translate("problem.title")+' :</b>'+e_html(rd.title)+'</br><b>'+translate("sdp.common.description")+' :</b>'+rd.short_description
			return "<span rel='uitip' mode_html='true' title='"+e_attr(title)+"'>"+"<a href="+url+" target='PreviewFrame' rel='noopener' id='preview_frame' data_id='"+rd.id+"'> "+e_html(rd.title)+'</a>'+"</span>";
		} else if(this.moduleName == 'relcf') {//No i18N
			var emergency_color = rd.emergency ? "rls-rocket2" : "rls-rocket1"; // No I18N
			var scheduled_start_time = (rd.scheduled_start_time) ? rd.scheduled_start_time.display_value : "-";
			var scheduled_end_time   = (rd.scheduled_end_time) ? rd.scheduled_end_time.display_value : "-";
			var title_head = rd.emergency ? getMessageForKey("sdp.release.emergency") : getMessageForKey("sdp.release.general");// No I18N
			var title="<div class='ui-tooltip-style-1'><p class='text-color1 font-small'>"+ title_head+": RL - "+ rd.id +"</p> <span class='disp-t'> <span class='disp-c'><span class='crspr flip-x "+ emergency_color +" icon-md mr5'></span></span> <span class='sb vmiddle disp-c text-color4 wb-bw'>"+e_html(rd.title)+"</span> </span><p class='mt10 mb0 font-small'><label class='text-muted mr5'>"+ getMessageForKey("common.status") +":</label>"+ e_html(rd.status.name) +" /<span class='crspr icon-xs chn-stages2 top-1 mr3 ml3'></span>"+ e_html(rd.stage.name) +"</p><hr class='mb10 mt10'><p class='font-small'><label class='text-muted mr5'>"+ getMessageForKey("sdp.common.scheduledstarttime")+":</label>"+ scheduled_start_time +"</p><p class='font-small'><label class='text-muted mr5'>"+ getMessageForKey("sdp.change.scheduledendtime")+":</label>"+ scheduled_end_time +"</p><p class='mb0 font-small'><label class='text-muted mr5'>"+ getMessageForKey("sdp.change.createdtime") +":</label>"+ rd.created_time.display_value +"</p></div>";

			var url='/ui/print?externalframe=true&module=release&entity_id=' + rd.id;//No I18n

			return "<span rel='uitip' mode_html='true' title='"+e_attr(title)+"'>"+"<a href="+url+" rel='noopener' target='PreviewFrame' id='preview_frame' data_id='"+rd.id+"'> "+e_html(rd.title)+'</a>'+"</span>";
		} else {
			return e_html(rd.title);
		}
	},
	callbackAfterTableRender: function(){
	    let anchorNodes = document.querySelectorAll("a#preview_frame"); //No I18N
        anchorNodes.forEach((ele, ind) =>{
            ele.addEventListener('click', function(event) {
                cf_List.toggleView("#"+ele.getAttribute("data_id"), true);
            });
        });
	},
	constructtemplateSubject: function(table_data) {
		var row_data = table_data.row_data;
		var dispTitle = "<strong>"+getMessageForKey("sdp.requests.common.requestid") + ": </strong>"+row_data.id+"<br>";//No i18N
		dispTitle += "<strong>"+getMessageForKey("sdp.requests.common.title") +": </strong>"+e_html(row_data.subject)+"<br>";//No i18N
		if(row_data.short_description==null) {
			row_data.short_description = "-";
		}
		dispTitle += "<strong>"+getMessageForKey("sdp.requests.common.desc") +": </strong>"+e_html(row_data.short_description)+"</br>";//No i18N
		return "<a title=\""+encodeHTMLAttribute(dispTitle)+"\" rel='noopener uitip' mode_html='true' href='/workorder/WOPrintPreview.jsp?woID="+row_data.id+"&woMode=printWO&trimmed_details=request_details,resolution&isPreview=true' target=\"PreviewFrame\" id=\"preview_frame\" data_id=\""+row_data.id+"\">"+e_html(row_data.subject)+"</a>";
	},
	constructtemplateTech: function(table_data) {
		return (table_data.row_data.technician == null) ? getMessageForKey("sdp.reports.reportHome.unassigned") : e_html(table_data.row_data.technician.name);
	},
	constructtemplateOpt: function(table_data) {
		return '<input type="radio" name="' + this.tableId + '_head_chkd" value="' + table_data.row_data.id + '">'
	},
	constructtemplatecType: function(table_data) {
		var rd = table_data.row_data;
		var typecolor = 'background-color: #cccccc;';//No i18n
		var typekey = getMessageForKey('sdp.common.na');
		if(rd.change_type != null) {/*Type return not equal null than show N/A with basic color*/
			typecolor = 'background-color: '+e_attr(rd.change_type.color)+';';//No i18n
			typekey = e_html(rd.change_type.name);
		}
		return '<div class="disp-t fw" id="statusfixtable"><div class="disp-c vtop ctypebox" style="'+typecolor+ '"></div><div class="disp-c vtop fw">'+typekey+'</div></div>';
	},
	constructtemplateReleaseType: function(table_data) {
		var rd = table_data.row_data;
		var col_str;
		if( rd.release_type ){
			if( rd.release_type.color ){
				col_str = '<div class="d_w"><span class="arrowBG mt3 mr5 vmiddle" style="background:'+ e_attr(rd.release_type.color)+'"></span><span class="vmiddle">'+ e_html(rd.release_type.name)+'</span></div>';// No I18N
			}
			else{
				col_str = '<span class="vmiddle">'+ e_html(rd.release_type.name)+'</span>';// No I18N
			}
			return col_str;
		}
		return '-'; // No I18N
	},
	constructtemplatePriority: function(table_data) {
		var rd = table_data.row_data;
		var typeclass = '';
		var typecolor = '';
		var typekey = '-';
		if(this.moduleName == "relcf") {
			var col_str;
			if( rd.priority ){
				if( rd.priority.color ){
					col_str = '<div class="d_w"><span class="arrowBG mt3 mr5 vmiddle" style="background:'+e_attr(rd.priority.color)+'"></span><span class="vmiddle">'+ e_html(rd.priority.name)+'</span></div>';// No I18N
				}
				else{
					col_str = '<span class="vmiddle">'+ e_html(rd.priority.name)+'</span>';// No I18N
				}
				return col_str;
			}
		}
		if(rd.priority != null) {/*priority return not equal null than show - */
			typecolor = 'background-color: '+e_attr(rd.priority.color)+';';//No i18n
			typekey = e_html(rd.priority.name);
			typeclass = 'ctypebox';//No i18n
		}
		if (this.moduleName == 'ccf') {
			return '<div class="disp-t fw" id="statusfixtable"><div class="disp-c vtop '+typeclass+'" style="'+typecolor+ '"></div><div class="disp-c vtop fw">'+typekey+'</div></div>';
		} else {
			return typekey;
		}
	},
	constructtemplateModule: function(table_data) {
		return '<span style="text-transform: capitalize;">' + e_html(table_data.row_data.associated_entity) + '</span>';
	},
	filterCng: function(val) {
		if (this.moduleName == 'rcf') {
			this.table_compreq.t_obj.table_info.list_info.filter_by = {
				"name": val    // No I18N
			};
		} else if (this.moduleName == 'pbcf') {// No I18N
			if(val == 'All') {
				delete this.table_compreq.t_obj.table_info.list_info.search_criteria;
			} else {
				if(val == 'Open') {// No I18N
					var cri = {"field": "status.name", "condition": "is", "value": val};// No I18N
				} else {
					var cri = {"field": "status.in_progress", "condition": "eq", "value": val};// No I18N
				}
				this.table_compreq.t_obj.table_info.list_info['search_criteria'] = cri;// No I18N
			}
		} else {
			this.table_compreq.t_obj.table_info.list_info.filter_by = {
				"id": val    // No I18N
			};
		}
		this.table_compreq.t_obj.table_info.list_info.start_index = '1';//some time table start_index go to '-1' value
		this.table_compreq.refreshTable('refresh'); // No I18N
	},
	toggleView: function(heading, isShowIframe) {
		if(isShowIframe) {
			jQuery('#listview').addClass('hide');
			jQuery('#detailsiframe').removeClass('hide');
			jQuery('#detailsiframe [data-id=headid]').html(e_html(heading));
		}
		else {
			jQuery('#detailsiframe').addClass('hide');
			jQuery('#listview').removeClass('hide');
		}
	},
	iframeResize: function() {
		var h = jQuery(parent).height();
	    jQuery('iframe[name="PreviewFrame"]').attr('height',h-80);
	    }
};
	
