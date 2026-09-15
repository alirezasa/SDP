//Zia list data loaded with table component

var zia_list = {
	zia_data: [],
	predic_mode: 'approval', //NO I18N
	moduleTblObj: {},
	globalTblObj: {},
	isFromModule: false,
	fromModule: 'global', //NO I18N
	entity_id: '', //NO I18N
	init: function (fromModule, id) {
		//TODO: check the zia is configure from server and client
		if (!(sdp_app.zia_info.IS_APPROVAL_NOT_YET_ENABLED && sdp_app.zia_info.IS_REOPEN_NOT_YET_ENABLED) || sdp_app.zia_info.IS_PARSER_ENABLED) {
			if (fromModule && fromModule == "Request") {
				if (jQuery("#Request_zia_notify").is(":empty")) {
					renderhbs("#Request_zia_notify", "request_zia_popup", {id: id}, false, 'zia/zia-prediction');// No I18N
                    var btn = jQuery("#request_zia_popup_button");
                    btn.off('click.ziapopup').on('click.ziapopup', function() { //No I18N
                        zia_list.loadZiaForEntity(this, "Request", btn.data('entity-id'));   // No I18N
                    });
				}
				jQuery("#" + fromModule + "_ziaripple .origin").text(reqzia_counts.approval_count + reqzia_counts.reopen_count + reqzia_counts.parser_count); //No I18N
//
				if(this.predic_mode == 'approval' && reqzia_counts.approval_count == 0) {
                    this.predic_mode = 'reopen'; //No I18N
                }
                if(this.predic_mode == 'reopen' && reqzia_counts.reopen_count == 0) {
                    this.predic_mode = 'parser'; //No I18N
				}
			}
			this.renderList(fromModule, id);
			this.onLoadingEvents(fromModule);
			fromModule == "Request" ? this.reqTabSwitch(reqzia_counts.approval_count, reqzia_counts.reopen_count, reqzia_counts.parser_count) : ""; //No I18N
		}
	},
	renderList: function (fromModule, id) {
		var _self = this;
		_self.isFromModule = false;
		_self.fromModule = 'global';//NO I18N
		var table_content = {},
			options = {};
		var list_info = {
			start_index: 1,
			row_count: 10
		}
		if (fromModule) {
			_self.isFromModule = true;
			_self.fromModule = fromModule;
			_self.entity_id = id;
			var search_criteria = [];
			search_criteria.push({
				"field": "entity",  //NO I18N
				"condition": "eq",  //NO I18N
				"value": id,    //NO I18N
				"logical_operator": "AND"   //NO I18N
			}, {
				"field": "module",  //NO I18N
				"condition": "eq",  //NO I18N
				"value": fromModule,    //NO I18N
				"logical_operator": "AND"   //NO I18N
			});
			list_info.search_criteria = search_criteria;
		}
		table_content.header = _self.headerdataConstruct(_self);
		options = {
			view: 'kanban', //No I18N
			width: '448', //NO I18N
			height: '400', //No I18N
			row_inputdata: {
				'list_info': list_info //No I18N
			},
			lazyloadingEnabled: true,
			column_settings: {
				default_position: 2,
				assign_label_width: false,
				columns: [{
					size: 1
				},
				{
					size: 11,
					row_count: 2,
					default_position: 2

				}
				]
			},
			icon_settings: {
				show_icons_Bottom: true,
				position: 2,
				rowPosition: 2,
				class: 'zia_feedback top0 pos-rel' //No I18N
			},
			callbackAfterBodyRender:this.onLoadingEventsVerification
		}
		if (_self.predic_mode == 'approval' && _self.globalTblObj.approval && !fromModule) {
			_self.globalTblObj.approval.t_obj.table_info.list_info.start_index = 1;
			_self.globalTblObj.approval.refreshTable();
		} else if (_self.predic_mode == 'reopen' && _self.globalTblObj.reopen && !fromModule) {  //NO I18N
			_self.predic_mode == 'reopen'; //NO I18N
			_self.globalTblObj.reopen.t_obj.table_info.list_info.start_index = 1;
			_self.globalTblObj.reopen.refreshTable();
			_self.predic_mode == 'approval'; //NO I18N
		} else if (fromModule && _self.predic_mode == 'approval' && //NO I18N
			!jQuery.isEmptyObject(_self.moduleTblObj.approval) &&
			_self.moduleTblObj.approval.t_obj.table_info.list_info.search_criteria[0].field === 'entity' &&
			_self.moduleTblObj.approval.t_obj.table_info.list_info.search_criteria[0].value == id) {
			_self.moduleTblObj.approval.t_obj.table_info.list_info.start_index = 1;
			_self.moduleTblObj.approval.t_obj.table_info.list_info.search_criteria = list_info.search_criteria;
			_self.moduleTblObj.approval.refreshTable();
			//Getting counts
			setTimeout(function () {
				// 	//updateing ripple count update and when no data to hide the zia
				_self.updateCount(fromModule);
			}, 1000)
		} else if (fromModule && _self.predic_mode == 'reopen' &&   //NO I18N
			!jQuery.isEmptyObject(_self.moduleTblObj.reopen) &&
			_self.moduleTblObj.reopen.t_obj.table_info.list_info.search_criteria[0].field === 'entity' &&
			_self.moduleTblObj.reopen.t_obj.table_info.list_info.search_criteria[0].value == id) {
			_self.moduleTblObj.reopen.t_obj.table_info.list_info.start_index = 1;
			_self.moduleTblObj.reopen.t_obj.table_info.list_info.search_criteria = list_info.search_criteria;
			_self.moduleTblObj.reopen.refreshTable();
			setTimeout(function () {
				_self.updateCount(fromModule);
			}, 1000)
		} else if (fromModule && _self.predic_mode == 'parser' && !jQuery.isEmptyObject(_self.moduleTblObj.parser) && _self.moduleTblObj.parser.data.entityid == id) { //No I18N
			zia_parser.init(fromModule, id);
			setTimeout(function () {
				zia_parser.afterInit();
				_self.updateCount(fromModule);
			},1000)
		}
		else {
			var tbObj;
			if (_self.predic_mode == 'approval') {
				options.callbackURL = 'zia_actions/_approval_notifications'; //No I18N
				options.entity_name = 'approval_notifications'; //No I18N
			} else if(_self.predic_mode == 'reopen') { //No I18N
				options.callbackURL = 'zia_actions/_reopen_notifications'; //No I18N
				options.entity_name = 'reopen_notifications'; //No I18N
			}
			//If its module specific we can store the table object in object for avoid reinitialization
			if (fromModule) {
				//Approval list
				options.height = 'auto'; //No I18N
				// delete options.column_settings;
				delete table_content.header.subject;
				delete table_content.header.module_icon;
				var entityOptions = jQuery.extend({}, options);
				var column_settings = entityOptions.column_settings;
				column_settings.default_position = 1;
				column_settings.columns = [
					{
						size: 12
					}
				];
				entityOptions.column_settings = column_settings;
				entityOptions.icon_settings.position = 1;
				entityOptions.icon_settings.rowPosition = 1;
				entityOptions.tableHolder = fromModule + "_zia_notify_approval"; //No I18N
				entityOptions.callbackURL = 'zia_actions/_approval_notifications'; //No I18N
				entityOptions.entity_name = 'approval_notifications'; //No I18N
				entityOptions.isFromModule = true;
				entityOptions.row_inputdata.list_info.get_total_count = true;
				entityOptions.height = 350;

				if (fromModule == "Request") {
					if(_self.predic_mode == 'reopen') {
					table_content.header = _self.headerdataConstruct(_self);
					delete table_content.header.subject;
					delete table_content.header.module_icon;
					entityOptions.callbackURL = 'zia_actions/_reopen_notifications'; //No I18N
					entityOptions.entity_name = 'reopen_notifications'; //No I18N
					entityOptions.tableHolder = "Request_zia_notify_reopen"; //No I18N
				}
					else if(_self.predic_mode == 'parser') {
						zia_parser.init(fromModule, id);
					}
				}

				if(_self.predic_mode == 'approval' || _self.predic_mode == 'reopen') {
				var tbObj;
				tbObj = new tableComponent({
					"list_info": list_info //NO I18N
				}, table_content, entityOptions, _self);
				_self.predic_mode == 'approval' ? _self.moduleTblObj.approval = tbObj : _self.moduleTblObj.reopen = tbObj; //NO I18N
				}
				setTimeout(function () {
					_self.updateCount(fromModule);
				}, 1000);
			} else {
				_self.predic_mode == 'approval' ? options.tableHolder = "zia_notify_approval" : options.tableHolder = "zia_notify_reopen"; //NO I18N
				tbObj = new tableComponent({
					'list_info': list_info //No I18N
				}, table_content, options, _self);
				_self.predic_mode == 'approval' ? _self.globalTblObj.approval = tbObj : _self.globalTblObj.reopen = tbObj; //NO I18N
			}

		}
	},
	updateCount: function (fromModule) {
		var _self = this;
		var apl_count = 0, ro_count = 0, pa_count = 0;
		!jQuery.isEmptyObject(_self.moduleTblObj.approval) ? apl_count = _self.moduleTblObj.approval.t_obj.table_info.list_info.total_count : "";
		if (fromModule == "Request") {
			apl_count = !jQuery.isEmptyObject(_self.moduleTblObj.approval) ? _self.moduleTblObj.approval.t_obj.table_info.list_info.total_count : reqzia_counts.approval_count;
			ro_count =  !jQuery.isEmptyObject(_self.moduleTblObj.reopen) ? _self.moduleTblObj.reopen.t_obj.table_info.list_info.total_count : ro_count = reqzia_counts.reopen_count;
			pa_count = !jQuery.isEmptyObject(_self.moduleTblObj.parser) ? _self.moduleTblObj.parser.list_info.total_count : reqzia_counts.parser_count;
		}
		if (apl_count == 0 && ro_count == 0 && pa_count == 0) {
			if(fromModule == "Request") {
				if(isAISetRemindLater) {
					let rnotify = jQuery('#Request_zia_notify');
					rnotify.find('#Request_ziaripple, #zia_navtabs_parent').addClass('hide'); //Hide the ripple div and the approval, reopen, parser tabs
					rnotify.find('#zia_view_all').removeClass('disp-ib').addClass('hide'); //Hide the View all
				}
				else {
					zia_list.clearZiaIcon();
				}
			} else {
				jQuery("#" + fromModule + "_zia_notify").remove(); //NO I18N
			}
		} else {
			if (fromModule == "Request") {
				apl_count != 0 ? jQuery("#Request_zia_notify_approval_count").text(" (" + apl_count + ")") : "";//NO I18N
				ro_count > 0 ? jQuery("#Request_zia_notify_reopen_count").text(" (" + ro_count + ")") : "";//NO I18N
				pa_count > 0 ? jQuery("#Request_zia_notify_parser_count").text(" (" + pa_count + ")") : "";
				reqzia_counts.approval_count = apl_count;
				reqzia_counts.reopen_count = ro_count;
				reqzia_counts.parser_count = pa_count;
				// when request has been closed approval has been removed in zia popup so need to remove the approval divs and show the reopen tabs
				if (apl_count == 0 && jQuery("#request_zia_approval").is(":visible")) {
					jQuery("#request_zia_approval").closest("li").addClass("hide"); //NO I18N
					if(ro_count > 0) {
					    jQuery("#request_zia_reopen").sdtab("show"); //NO I18N
				    }
					else if(pa_count > 0) {
						jQuery("#request_zia_parser").sdtab("show"); //NO I18N
					}
				}
				if(ro_count == 0 && jQuery('#request_zia_reopen').is(":visible")) {
					jQuery("#request_zia_reopen").closest("li").addClass("hide"); //NO I18N
					jQuery("#request_zia_parser").sdtab("show"); //NO I18N
				}
			} else {
				apl_count != 0 ? jQuery("#" + fromModule + "_zia_notify_approval_count").text(apl_count).closest('.zia-warp-sub').show() : jQuery("#" + fromModule + "_zia_notify_approval_count").closest('.zia-warp-sub').hide();//NO I18N
			}
			jQuery("#" + fromModule + "_ziaripple .origin").text(apl_count + ro_count + pa_count); //No I18N
		}
	},
	clearZiaIcon : function() {
		var rnotify = jQuery('#Request_zia_notify');
		if(rnotify.hasClass("ui-dialog-content")) {
			rnotify.dialog('close'); //No I18N
		}
		rnotify.before('<div class="btn-group bs-noconflict ml5 vbottom top10"><span>&nbsp;</span></div>').remove();
	},
	onLoadingEvents: function (fromModule) {
		var _self = this;
		jQuery('.zia-tabs,.zia-pdct').off('shown.sdp.sdtab').on('shown.sdp.sdtab', function (event) { //No I18N
			var tab_module_name = jQuery(this).attr("data-tab-entityname");
			var tab_module_id = jQuery(this).attr("data-tab-entityid");
			var ziapredic_mode = jQuery(event.target).attr('data-predic-mode');
			//The parser action, parser properties tab switch is leading here
			if(ziapredic_mode == undefined) {
				return;
			}
			_self.predic_mode = ziapredic_mode;

			/* Bot commands should be hidden when switching to different tab (Approval/reopen)*/
			if (ziabot.is_bot_command_init) {
				var display = ziapredic_mode != "bot" ? "none" : "";    //NO I18N
				jQuery('ul.invocationSentencesList').closest('.lytePopover').css("display", display);   //NO I18N
			}

			if (ziapredic_mode == "bot" || ziapredic_mode == "zia_content_approval" || ziapredic_mode == "zia_content_reopen") {
				return true;
			}
			else if (!fromModule && !jQuery.isEmptyObject(_self.globalTblObj[ziapredic_mode])) {
				return true;
			} else if (fromModule && !jQuery.isEmptyObject(_self.moduleTblObj[ziapredic_mode])) {
				return true;
			}
			_self.init(tab_module_name, tab_module_id);
		})
		if (fromModule == "Request") {
			//fix for popup closing on clicking the tab
			jQuery("#Request_zia_notify .nav-sdtabs li a").on("click.sdp.sdmenu", function (e) {
				jQuery(this).sdtab('show'); //No I18N
				e.stopPropagation();
			});
		}
	},

	onLoadingEventsVerification: function(){
		//Click event for showing the verification dropdown when clicking dislike/train zia button from zia notification list
		jQuery('#' + zia_list.fromModule + "_zia_notify .zia-verification-btn,#ziaglobal .zia-verification-btn").off('click.zia-verification').on('click.zia-verification', function (evt) { //NO I18N
			zia_list.showVerificationDropdown(this, evt);
		});
	},

	headerdataConstruct: function (_self) {
		var meta_data = {
			'module_icon': { //No I18N
				'column_settings': { //No I18N
					'position': 1 //No I18N
				},
				'hide_label': true, //No I18N
				'default': true, //No I18N
				'dataCelltransformer': _self.constructModIconCell //No I18N
			},
			'subject': { //NO I18N
				'default': true,//No I18N
				'dataCelltransformer': _self.constructSubjectCell, //No I18N
				'hide_label': true, //No I18N
				'column_settings': { //No I18N
					'rowposition': 1, //No I18N
					'view_type': 'row' //No I18N
				}
			},
			'mail_id': { //No I18N
				'text': translate('zianotification.mailid') //No I18N

			},
			'mail_content': { //No I18N
				'text': translate('zianotification.mailcontent'), //No I18N
				'dataCelltransformer': _self.constructMailContentCell  //No I18N
			},
			'predicted_action': { //No I18N
				'text': translate(_self.predic_mode == "approval" ? 'zianotification.approvalaction' : 'zianotification.reopenaction'), //No I18N
				'dataCelltransformer': _self.constructPredictActionCell //No I18N
			},
			'predication_feedback': { //No I18N
				'type': 'icon', //No I18N
				'dataCelltransformer': _self.constructPredicFeedback //No I18N
			}
		};
		if (_self.isFromModule) {
			meta_data.mail_id.dataCelltransformer = _self.constructMailID
		}
		return meta_data;
	},
	constructMailContentCell: function(rd) {
		var data = rd.row_data;
		return '<span class="disp-ib text-overflow" style="width:180px;" title="' + e_attr(data.mail_content) +'" rel="uitip">' + e_html(data.mail_content) +'</span>';
	},
	constructModIconCell: function (tb_data, _self) {
		var data = tb_data.row_data;
		if (_self.predic_mode && _self.predic_mode === "reopen") { //No I18N
			data.module = "request"; //No I18N
		}
		var modIcon = '', title = '',
			str = '';
		var modName = data.module.toLowerCase();
		switch (modName) {
			case "request": //No I18N
				modIcon = "ri-requ"; //No I18N
				title = translate("sdp.requests.common.requests"); //No I18N
				break;
			case "change": //No I18N
				modIcon = "ri-change"; //No I18N
				title = translate("sdp.common.change"); //No I18N
				break;
			case "release": //No I18N
				modIcon = "ri-release"; //No I18N
				title = translate("common.release"); //No I18N
				break;
			case "purchaseorder": //No I18N
				modIcon = "ri-puror"; //No I18N
				title = translate("sdp.header.newpo"); //No I18N
				break;
			case "purchaserequest": //No I18N
				modIcon = "ri-pureq"; //No I18N
				title = translate("common.purchase.request"); //No I18N
				break;
		}
		str = '<span class="hspr icon-md ' + modIcon + ' vmiddle mr5" aria-label="' + title + '" title="' + title + '" rel="uitip"></span>'; //No I18N
		return str;
	},
	constructSubjectCell: function (tb_data) {
		var data = tb_data.row_data, str = '';
		str = '<div class="disp-ib" style="width:230px"><span class="truncate-ellipsis"><a class="truncate-wrapper fw" title="' + e_attr(data.subject) + '" rel="uitip" href="' + data.helpdesk_Url + '">#' + data.entity_id + ' ' + e_html(data.subject) + '</a></span></div><span class="fr text-overflow text-muted pos-abs right10 pt1" style="max-width:60px" rel="uitip" title="' + e_attr(data.acted_on) + '">' + e_html(data.acted_on) + '</span>'
		return str;
	},
	constructPredictActionCell: function (tb_data) {
		var data = tb_data.row_data;
	var title = e_html(data.predicted_action);
	var value = e_html(data.predicted_action);
	return '<span class="text-overflow disp-ib vmiddle w-130px" title="'+ title +'" rel="uitip">'+ value + '</span>' ;
	},
	constructPredicFeedback: function (rd, _self) {
		var rd = rd.row_data, str = '', module = '', predic_mode = '';
		module = _self.isFromModule ? _self.fromModule : "global"; //No I18N
		predic_mode = _self.predic_mode == "approval" ? "approvalprediction" : _self.predic_mode == "reopen" ? "reopenprediction" : "parser"; //No I18N
		if (rd.predicted_action === 'Unable to predict') {
		str = '<div class="disp-c vtop fr pos-abs right0" style="bottom:-4px">' + '<button class="btn btn-link p0 sb zia-verification-btn" title="' + translate("zianotification.unknown.title") + '" data-mode="' + predic_mode + '" data-predicted-action="' + rd.predicted_action + '" data-id="' + rd.id + '" data-module="' + module + '" rel="uitip" aria-label="' + translate("zianotification.unknown.title") + '">' + translate('zia.trainzia.label') + '</button></div>';
		} else {
			str = '<div class="disp-c vtop fr pos-abs right0" style="bottom:-4px">' +
			'<button class="btn btn-link btn-sm flat ml5 zia-verification-btn" aria-label="' + translate("zianotification.feedback.title") + '" data-mode="' + predic_mode + '" data-predicted-action="' + rd.predicted_action + '" data-id="' + rd.id + '" data-module="' + module + '" data-like="true" title="' + translate("zianotification.feedback.title") + '" rel="uitip"><span class="cspr thumbs-up1 icon-md"></span></button>' +
				'<span class="sepvr pos-rel"></span>' +
			'<button class="btn btn-link btn-sm flat zia-verification-btn" aria-label="' + translate("zianotification.feedback.title") + '" data-mode="' + predic_mode + '" data-predicted-action="' + rd.predicted_action + '" data-id="' + rd.id + '" data-module="' + module + '" title="' + translate("zianotification.feedback.title") + '" rel="uitip"><span class="cspr thumbs-down1 icon-md"></span></button>' +
				'</div>'; //No I18N
		}
		return str;
	},
	constructMailID: function (rd) {
		var rd = rd.row_data;
		var mailid = rd.mail_id ? rd.mail_id : "-";
		return '<span class="text-overflow disp-ib vmiddle" style="width:150px" rel="uitip" title="' + e_attr(mailid) + '">' + e_html(mailid) + '</span>' + '<span class="fr text-overflow text-muted pos-abs right10 pt1" style="max-width:60px" rel="uitip" title="' + e_attr(rd.acted_on) + '">' + e_html(rd.acted_on) + '</span>';
	},
	// handle the tab switch between when the data present on the request module
	reqTabSwitch: function (ap_count, ro_count, pa_count) {
		var reqDiv = jQuery("#Request_adziareqcount");
		if(ap_count > 0 || ro_count > 0 || pa_count > 0) {
			this.updateZiaNotifyDiv("approval", "#Request_zia_notify_approval_div", "#request_zia_approval", "#Request_zia_notify_approval_count", ap_count); //No I18N
			this.updateZiaNotifyDiv("reopen", "#Request_zia_notify_reopen_div", "#request_zia_reopen", "#Request_zia_notify_reopen_count", ro_count); //No I18N
			this.updateZiaNotifyDiv("parser", "#Request_zia_notify_parser_div", "#request_zia_parser", "#Request_zia_notify_parser_count", pa_count); //No I18N
			var request_zia = this.predic_mode == "approval" ? "request_zia_approval" : (this.predic_mode == "reopen") ? "request_zia_reopen" : "request_zia_parser"; //No I18N
			jQuery("#" + request_zia).sdtab("show");
			show_bs_menu();
		}
		else {
			if(isAISetRemindLater) {
				//Hide all the tabs
				jQuery('#zia_navtabs_parent').addClass('hide');
			}
		else {
			//when no predictions available
			zia_list.clearZiaIcon();
		}
		}
	},
	updateZiaNotifyDiv: function(action, divId, liId, countId, count) {
		var reqDiv = jQuery("#Request_adziareqcount");
		if(count > 0) {
			reqDiv.find(divId).addClass("active").end().find(liId).closest("li").removeClass("hide").end().find(countId).text(" (" + count + ")").attr('title', count).end(); //No I18N
		}
		else if(count == 0) {
			reqDiv.find(divId).removeClass("active").end().find(liId).closest("li").removeClass("active").addClass("hide");//No I18N
			//switch to next tab when the current tab count is empty
			if(action == 'approval' && this.predic_mode == "approval") {
				this.predic_mode = "reopen"; //No I18N
			}
			else if(action == 'reopen' && this.predic_mode === "reopen") {
				this.predic_mode = "parser"; //No I18N
			}
			else if(action == 'parser' && this.predic_mode === "parser") {
				this.predic_mode = "approval"; //No I18N
			}
		}
	},
	clearTblCompDivs: function (fromModule) {
		var module = fromModule ? fromModule + "_" : ""; //NO I18N
		jQuery("#"+module+"zia_notify_approval_div, #"+module+"zia_notify_reopen_div, #"+module+"zia_notify_parser_div").html(""); //NO I18N
	},
	/**
      * Method to update the technician verification done for both approval and reopen prediction
      *
      * @param {string} predictionId    - Zia notification Id to be updated which was verified by the tech
      * @param {element} parentdata      - The whole notification element
      * @param {string} fromModule        - Global/Request/Change/Release/PurchaesOrder/PurchaseRequest
      * @param {string} actionname      - approvalprediction/reopenprediction
      * @param {boolean} isValid         - true: valid predicion & false: invalid prediction
      * @param {string} verified_action  - only used for approval prediction (Approve/Reject/Need Clarification)
      */
     updateTechVerification: function (predictionId, parentdata, fromModule, actionname, isValid, verified_action) {
		var data = {};
		data.command = "updateTechVerification";    //NO I18N
		data.verifiedas = isValid ? "valid" : "invalid"; //NO I18N
		data.ziaid = predictionId;
		data.frommodule = fromModule;
		data.action = actionname;
        if (verified_action) {
            data.verified_action = verified_action;
        }
		sdpAjax({
			url: "/servlet/AIAjaxServlet", //NO I18N
			data: data,
			type: 'POST', //No I18N
			success: function (response) {
				if (response != null) {
					if (response.status == "success") {
						var cls = fromModule != "global" ? "top5" : "top25"; //NO I18N
						var head = jQuery(parentdata).html() + '<div role="alert" class="alert alert-success mb0 mt10 pos-abs ' + cls + '"><span class="msg pl0">' + response.message + '</span></div>';
						jQuery(parentdata).html(head);
						jQuery(parentdata).find('.row').addClass('opac3');
						setTimeout(function () {
							parentdata.remove(zia_list.emptynotishow());
							startIndex = 1;
							if (fromModule == "global") {
								zia_list.loadzianotifications();
							} else {
								zia_list.loadzianotifications(fromModule, zia_list.entity_id);
							}
							ziac.updateUnverifiedCount();
						}, 3000);
					}
					if (response.status == 'alreadyverified') {
						var acls = fromModule != "global" ? "top10" : "top25"; //NO I18N
						var head = jQuery(parentdata).html() + '<div role="alert" class="alert alert-warning mb0 mt10 pos-abs ' + acls + '"><span class="msg pl0">' + response.message + '</span><button type="button" class="close pos-abs top10 right10 mt3" data-event="click" data-handler="zia_list.closemsgfn(this,event)" nonce="' + sdpNonce + '"><span class="cspr icon-xs close2" aria-hidden="true"></span><span class="sr-only">Close</span><div></div></button></div>';
						jQuery(parentdata).html(head);
						$sdEventListener(parentdata);
					}
				}
			}
		});
	},
	emptynotishow: function () {
		if (jQuery('#Request_adziareqcount').find('.tc-row').length == 0) {
			jQuery('#Request_adziareqcount').append('<div class="tc text-muted pt20 pb20" data-id="emptynotification">No Notification Available</div>');
		}
		if (jQuery('#PurchaseOrder_adziareqcount').find('.tc-row').length == 0) {
			jQuery('#PurchaseOrder_adziareqcount').append('<div class="tc text-muted pt20 pb20" data-id="emptynotification">No Notification Available</div>');
		}
		if (jQuery('#PurchaseRequest_adziareqcount').find('.tc-row').length == 0) {
			jQuery('#PurchaseRequest_adziareqcount').append('<div class="tc text-muted pt20" data-id="emptynotification">No Notification Available</div>');
		}
		if (jQuery('#Change_adziareqcount').find('.tc-row').length == 0) {
			jQuery('#Change_adziareqcount').append('<div class="tc text-muted pt20 pb20 font-normal" data-id="emptynotification">No Notification Available</div>');
		}
		if (jQuery('#Release_adziareqcount').find('.tc-row').length == 0) {
			jQuery('#Release_adziareqcount').append('<div class="tc text-muted pt20 pb20 font-normal" data-id="emptynotification">No Notification Available</div>');
		}
	},
	closemsgfn: function ($this, eve) {
		eve.preventDefault();
		eve.stopPropagation();
		var parentdata = jQuery($this).closest('.tc-row'); //NO I18N
		highlightfn(parentdata.get(0), 'highlight=true,delay=500'); //NO I18N
		setTimeout(function () {
			parentdata.remove(zia_list.emptynotishow());
		}, 600);
	},
	doGlobalZiaAppRipple: function (mess) {
		if (!sdp_app.zia_info.CAN_SHOW_ICON) {
			sdp_app.zia_info.CAN_SHOW_ICON = true;
			// Bug fix during SD-104938
			sdp_app.zia_info.TOTAL_NOTIFICATIONS_COUNT = mess.unverified_global;
			ziacallchat();
		} else {
			// SD-104938
			var global_count = mess.unverified_global;
			var reopen_count = mess.unverified_global_reopen;
			if (jQuery("#zianotification").is(":visible")) {
				jQuery("#global_ziadynamic").removeClass("hide").addClass("show")
				//Encode is not neccessary for the below line
				jQuery("#global_ziadynamic").html("<span class='msg pl0 disp-ib text-overflow' style='max-width: 374px;' title='" + mess.message + "' rel='uitip'>" + mess.message + "</span>");
				//The Below line used to add position and height changes inside zia bot
				jQuery('#ziaglobal,#zia_bot_container').addClass('zia-alrt-on'); //NO I18N
				initTooltip('.zia-alrt-on .alert-success'); //NO I18N
				setTimeout(function () {
					jQuery("#global_ziadynamic").removeClass("show").addClass("hide");
					//The Below line used to remove position and height changes inside zia bot
					jQuery('#ziaglobal,#zia_bot_container').removeClass('zia-alrt-on'); //NO I18N
				}, 3000);
				startIndex = 1;
				mess.action == "reopenprediction" ? zia_list.predic_mode = "reopen" : zia_list.predic_mode = "approval"; //No I18n
				jQuery("#zia_" + zia_list.predic_mode).closest("li").removeClass('hide'); //NO I18N
				zia_list.loadzianotifications();

				/* Bypassing all_notification call SD-104938 */
				ziac.bypassAllNotificationCall(global_count, reopen_count);
			} else {
				jQuery("#global_ziaripple").addClass("animate");
				setTimeout(function () {
					jQuery("#global_ziaripple").removeClass("animate");
				}, 6000);

				/* Bypassing all_notification call SD-104938 */
				ziac.bypassAllNotificationCall(global_count, reopen_count);
			}
		}
	},

	appendEntityZiaInNotification: function (ele, mess) {
		jQuery("#" + ele + "_ziadynamic").removeClass("hide").addClass("show")
		jQuery("#" + ele + "_ziadynamic").html("<span class='msg pl0'>" + mess.message + "</span>");
		setTimeout(function () {
			jQuery("#" + ele + "_ziadynamic").removeClass("show").addClass("hide");
		}, 3000);

		startIndex = 1;
        if("reopenprediction" == mess.action) {
            zia_list.predic_mode = "reopen"; //No I18N
        }
        else if("approvalprediction" == mess.action) {
            zia_list.predic_mode = "approval"; //No I18N
        }
        else if("parser" == mess.action) {
            zia_list.predic_mode = "parser"; //No I18N
        }

        if(ele == "Request") {
			jQuery('#Request_ziaripple.hide, #zia_navtabs_parent.hide').removeClass('hide');
			jQuery('#zia_view_all').addClass('disp-ib').removeClass('hide');
            if(jQuery('#Request_zia_notify').parent('div').hasClass('panel-slider')) {
				//Close previously opened mail details
				zia_parser.closePreviousMailDetails();
                setTimeout(function() {
                    zia_list.loadZiaNotificationsInPanel(mess.module, mess.entityid);
				}, 1000);
                return;
            }
        }
        zia_list.loadzianotifications(mess.module, mess.entityid);
	},

	rippleEntityZiaInNotification: function (ele, mess) {
		let zripple = jQuery('#' + ele + '_ziaripple');
		zripple.removeClass('hide').addClass("animate");
		jQuery('#zia_navtabs_parent, #zia_view_all').removeClass('hide');
        jQuery('#zia_view_all').addClass('disp-ib');
		setTimeout(function () {
			zripple.removeClass("animate");
		}, 6000);
		zripple.find('.origin').html(mess.unverified_entity);
	},
	addReqZiaInNotification: function (frommodule, mess) {
		var content = "", ziaClass = "sdmenu-dd showmenu p0 m0 mt15"; //NO I18N

		if (frommodule == "Request") {
            ResourceLoader({
                js: ["/scripts/hbs-template-zia-prediction.js"],//No I18N
                success: function () {
                    jQuery("#wrapper_Request_" + mess.entityid).prepend('<div class="btn-group bs-noconflict ml5 vbottom top10" id="Request_zia_notify"></div>');
                    renderhbs("#Request_zia_notify", "request_zia_popup", {id: mess.entityid}, false, 'zia/zia-prediction');    // No I18N
                    var btn = jQuery("#request_zia_popup_button");
                    btn.off('click.ziapopup').on('click.ziapopup', function() { //No I18N
                        zia_list.loadZiaForEntity(this, "Request", btn.data('entity-id'));   // No I18N
                    });
                    initTooltip('#' + frommodule + '_adziareqcount') //NO I18N
                    jQuery("#" + frommodule + "_ziaripple .origin").html(mess.unverified_entity); //NO I18N
                    zia_list.predic_mode = "approval"; //NO I18N
                    zia_list.clearTblCompDivs(frommodule);
                    zia_list.moduleTblObj = {};
                }
            });
		} else {
			frommodule == "Change" ? ziaClass = "sdmenu-dd showmenu p0 m0" : ""; //NO I18N
			content = '<div class="btn-group bs-noconflict vmiddle ml10 ' + (frommodule == "PurchaseOrder" ? "height19" : frommodule == "PurchaseRequest" ? "height19" : "") + '" id="' + frommodule + '_zia_notify">' +
				'<button class="btn btn-link btn-xs zia-chat" data-switch="sdmenu" type="button"><span class="cspr icon-lg zia-noti vmiddle mr2"></span><div id="'+frommodule+'_ziaripple" class="pulse danger lg high-pace loop-sm notif-ripple pos-abs left0 ml-15 top-10"><div class="first"></div><div class="second"></div><div class="third"></div><div class="fourth"></div><div class="origin"></div></div><em class="caret text-muted" style="border-top: 4px solid;border-right: 4px solid transparent;border-left: 4px solid transparent;"></em></button>' +
				'<div class="' + ziaClass + '" aria-labelledby="ziaaction" id="' + frommodule + '_adziareqcount">' +
				'<div class="alert alert-success m0 hide" id="' + frommodule + '_ziadynamic"></div>' +
				'<div class="oya nobold" style="max-height: 390px;overflow:hidden">' +
				'<div class="zia-warp-sub" style="display:none">' +
				'<p class="sb mb0 pt10 pl10 pb10">' + translate("sdp.approve.approvals") + ' (<span id="' + frommodule + '_zia_notify_approval_count"></span>)</p>' +
				'<div id="' + frommodule + '_zia_notify_approval_div">' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>';//NO I18N
			jQuery("#wrapper_" + frommodule + "_" + mess.entityid).prepend(content); //NO I18N
            jQuery("#" + frommodule + "_zia_notify > button").on('click', function () {
                zia_list.loadZiaForEntity(this, frommodule, mess.entityid);
            });
			initTooltip('#' + frommodule + '_adziareqcount') //NO I18N
            jQuery("#" + frommodule + "_ziaripple .origin").html(mess.unverified_entity); //NO I18N
            zia_list.predic_mode = "approval"; //NO I18N
            zia_list.clearTblCompDivs(frommodule);
            zia_list.moduleTblObj = {};
		}
	},
	loadzianotifications: function (module, id) {

		if ((!(sdp_app.zia_info.IS_APPROVAL_NOT_YET_ENABLED && sdp_app.zia_info.IS_REOPEN_NOT_YET_ENABLED) || sdp_app.zia_info.IS_PARSER_ENABLED) && sdp_app.zia_info.CAN_SHOW_UNVERIFIED_NOTIFICATION) {
			/**
			 * Scenario:
			 * 1. zia template suggestion is set to remind later, zia icon will be shown.
			 * 2. Zia parser is disabled
			 *
			 * Now zia_list.init will invoke the _parser_notifications call throwing error "For predictions, please enable Zia"
			 * Due to this error, template suggestion is not shown properly. So, catching the error and proceeding here.
			 */
			try {
			zia_list.init(module, id);
		}
			catch(e) {}
		}
		else {
			jQuery("#zia_content_approval").closest("li").removeClass('hide');   //NO I18N
			jQuery("#zia_content_reopen").closest("li").removeClass('hide');   //NO I18N
		}
		zia_list.showZiaSuggestionNotification(module, id);
		show_bs_menu();
	},
	showZiaSuggestionNotification: function(module, id) {
		/*
			This code will execute in 2 scenarios and will execute even if CAN_SHOW_UNVERIFIED_NOTIFICATION is set as false since this isn't a feedback notification but actionable content

			1. Template suggestion for technician login when "MayBe later" is selected
			2. Template suggestion for requester login when "MayBe later" is selected.

			Check: Notification will be shown when Module is request, woId in cat_temp_suggestion object same as the current workorderid, suggestedTemplate is non-empty
   		*/
		if("Request" === module && zia_cat_temp_suggestion && id == zia_cat_temp_suggestion.woId && zia_cat_temp_suggestion.suggestedTemplate != undefined && zia_cat_temp_suggestion.suggestedTemplate !== '') {
			let notifyDiv = jQuery("#Request_zia_notify");
			if (notifyDiv.is(":empty")) {
				renderhbs("#Request_zia_notify", "request_zia_popup", {id: id}, false, 'zia/zia-prediction', true);// No I18N
				var btn = jQuery("#request_zia_popup_button");
                btn.off('click.ziapopup').on('click.ziapopup', function() { //No I18N
                    zia_list.loadZiaForEntity(this, "Request", btn.data('entity-id'));   // No I18N
                });
			}
			notifyDiv.find("#Request_zia_remindlater").removeClass('hide').find('#suggestedTemplate').html(zia_cat_temp_suggestion.suggestedTemplate);
		}
	},
	loadZiaForEntity: function (ele, module, entityid) {
		if (jQuery("#" + module + "_adziareqcount").is(":visible")) {
			return;
		}
		startIndex = 1;
		if (module == "Request") {
			zia_list.clearTblCompDivs(module);
			zia_list.moduleTblObj = {};
		}
		zia_list.predic_mode = "approval"; //NO I18N
		zia_list.loadzianotifications(module, entityid);
		// The below line is used to check whether the zia bot is present or not on the screen, for zia bot icon border
		var entityCheck = jQuery('#zia_bot_container').hasClass('hide') ? 'entity' : ''; //NO I18N
		ziabot.zia_trigger_close_icon(entityCheck);
	},
	appendZiaActionRippleEffect: function (mess1) {
		if (mess1.module == "Request") {
			var canDoGlobalRipple = "parser" !== mess1.action; //No I18N
			if (jQuery("#wrapper_Request_" + mess1.entityid).length > 0) {
				if (typeof reqzia_counts != "undefined") {
					reqzia_counts.approval_count = mess1.unverified_entity_approval;
					reqzia_counts.reopen_count = mess1.unverified_entity_reopen;
					reqzia_counts.parser_count = mess1.unverified_entity_parser;
				}
				if (jQuery("#Request_ziaripple").length > 0) {
					if (jQuery("#Request_adziareqcount").is(":visible")) {
						zia_list.appendEntityZiaInNotification("Request", mess1);
					}
					else {
						zia_list.rippleEntityZiaInNotification("Request", mess1);
					}
				}
				else {
					zia_list.addReqZiaInNotification("Request", mess1);
				}
				if (mess1.action == 'approvalprediction') {
					$req.details.changeTab('approvals', null, event);//NO I18N
				}
				if(canDoGlobalRipple) {
				zia_list.doGlobalZiaAppRipple(mess1);
			}
			}
			else {
				if(canDoGlobalRipple) {
				zia_list.doGlobalZiaAppRipple(mess1);
			}
		}
		}
		if (mess1.module == "Change") {
			if (jQuery("#wrapper_Change_" + mess1.entityid).length > 0) {
				if (jQuery("#Change_ziaripple").length > 0) {
					if (jQuery("#Change_adziareqcount").is(":visible")) {
						zia_list.appendEntityZiaInNotification("Change", mess1);
					}
					else {
						zia_list.rippleEntityZiaInNotification("Change", mess1);
					}
				}
				else {
					zia_list.addReqZiaInNotification("Change", mess1);
				}
				reloadTab('Approval', 'approvaltab', '&changeId=' + mess1.entityid + '&tab=Approval', 'null', 'null', 'null', null)//NO I18N
				zia_list.doGlobalZiaAppRipple(mess1);
			}
			else {
				zia_list.doGlobalZiaAppRipple(mess1);
			}
		}
		if (mess1.module == "Release") {
			if (jQuery("#wrapper_Release_" + mess1.entityid).length > 0) {
				if (jQuery("#Release_ziaripple").length > 0) {
					if (jQuery("#Release_adziareqcount").is(":visible")) {
						zia_list.appendEntityZiaInNotification("Release", mess1);
					}
					else {
						zia_list.rippleEntityZiaInNotification("Release", mess1);
					}
				}
				else {
					zia_list.addReqZiaInNotification("Release", mess1);
				}
				// reloadTab('Approval','approvaltab','&releaseId='+mess1.entityid+'&tab=Approval','null','null','null', null)//NO I18N
				zia_list.doGlobalZiaAppRipple(mess1);
			}
			else {
				zia_list.doGlobalZiaAppRipple(mess1);
			}
		}
		if (mess1.module == "PurchaseOrder") {
			if (jQuery("#wrapper_PurchaseOrder_" + mess1.entityid).length > 0) {
				if (jQuery("#PurchaseOrder_ziaripple").length > 0) {
					if (jQuery("#PurchaseOrder_adziareqcount").is(":visible")) {
						zia_list.appendEntityZiaInNotification("PurchaseOrder", mess1);
					}
					else {
						zia_list.rippleEntityZiaInNotification("PurchaseOrder", mess1);
					}
				}
				else {
					zia_list.addReqZiaInNotification("PurchaseOrder", mess1);
				}
				showApprovalDetails(mess1.entityid, 'null', false, 'null', 'viewPage', 'null', null);//NO I18N
				zia_list.doGlobalZiaAppRipple(mess1);
			}
			else {
				zia_list.doGlobalZiaAppRipple(mess1);
			}
		}
		if (mess1.module == "PurchaseRequest") {
			if (jQuery("#wrapper_PurchaseRequest_" + mess1.entityid).length > 0) {
				if (jQuery("#PurchaseRequest_ziaripple").length > 0) {
					if (jQuery("#PurchaseRequest_adziareqcount").is(":visible")) {
						zia_list.appendEntityZiaInNotification("PurchaseRequest", mess1);
					}
					else {
						zia_list.rippleEntityZiaInNotification("PurchaseRequest", mess1);
					}
				}
				else {
					zia_list.addReqZiaInNotification("PurchaseRequest", mess1);
				}
				showPRDetails(mess1.entityid, true);
				setTimeout(function () {
					showSoftwareTab(document.getElementById("pr-approvals"));
				}, 1000);
				zia_list.doGlobalZiaAppRipple(mess1);
			}
			else {
				zia_list.doGlobalZiaAppRipple(mess1);
			}
		}
	},
	appendZiaActionVerifyMesg: function (mess) {
		var ziaId = mess.zia_approval_id;
		var entityId = mess.entityid;
		var unverified_global = mess.unverified_global;
		var unverified_entity = mess.unverified_entity;
		var frommodule = mess.from_module;
		var module = mess.module;
        var parserIds = mess.zia_parser_ids;
        var action = mess.action;

		// SD-104938
		var reopen_count = mess.unverified_global_reopen;
		var approval_count = unverified_global - reopen_count;

		var handleGlobalZia = "parser" !== action; //No I18N
		if(handleGlobalZia) {
		//Global Zia handling when socket call cames
		if (jQuery("#ziaglobal").is(":visible")) {
			//Display message in top of the list , Encode is not neccessary for the below line
			jQuery("#global_ziadynamic").removeClass("hide").addClass("show").html("<span class='msg pl0 disp-ib text-overflow' style='max-width: 374px;' title='" + mess.message + "' rel='uitip'>" + mess.message + "</span>"); //NO I18N
			//highlight the respective entity div if its visiable in list
			//The Below line used to add position and height changes inside zia bot
			jQuery('#ziaglobal,#zia_bot_container').addClass('zia-alrt-on'); //NO I18N
			initTooltip('.zia-alrt-on .alert-success'); //NO I18N
			var parentdata = jQuery("#ziaglobal .sdtab-pane").find('.tc-row[data-entityid="' + ziaId + '"]'); //NO I18N
			if (parentdata.length > 0) {
				highlightfn(parentdata[0], 'highlight=true,delay=3000');//NO I18N
				setTimeout(function () {
					parentdata.remove(zia_list.emptynotishow());
				}, 600);
			}
			//load the data
			setTimeout(function () {
				jQuery("#global_ziadynamic").removeClass("show").addClass("hide"); //NO I18N
				//The Below line used to remove position and height changes inside zia bot
				jQuery('#ziaglobal,#zia_bot_container').removeClass('zia-alrt-on'); //NO I18N
				mess.action == "reopenprediction" ? zia_list.predic_mode = "reopen" : zia_list.predic_mode = "approval"; //No I18n
				zia_list.loadzianotifications();
			}, 3000)
			unverified_global == 0 ? sdp_app.zia_info.IS_BOT_ENABLED ? jQuery("#global_ziaripple").hide() : jQuery("#sdp-chat-bar").find('.zia-chat').hide() : "";
		} else {
			// Rippling and count update when global zia list in minimized
			if (unverified_global != 0) {
				jQuery("#global_ziaripple").addClass("animate");
				setTimeout(function () {
					jQuery("#global_ziaripple").removeClass("animate");
				}, 6000);
				jQuery("#global_ziaripple .origin").text(unverified_global);
			} else {
				sdp_app.zia_info.IS_BOT_ENABLED ? jQuery("#global_ziaripple").hide() : jQuery("#sdp-chat-bar").find('.zia-chat').hide();
			}
		}
		}

		//Entity Based Zia handling
		//The zia notification changes inside entity will happen only if Zia is visible inside the entity
		if (jQuery("#wrapper_" + module + "_" + entityId).length > 0) {
			if (module == "Request" && typeof reqzia_counts != "undefined") {
				reqzia_counts.approval_count = mess.unverified_entity_approval;
				reqzia_counts.reopen_count = mess.unverified_entity_reopen;
				reqzia_counts.parser_count = mess.unverified_entity_parser;
			}
			var ziadynamic = module + "_ziadynamic"; //NO I18N
			if (jQuery("#" + module + "_adziareqcount").is(":visible")) {
				// display message in top of the list
				jQuery("#" + ziadynamic).removeClass("hide").addClass("show");
				jQuery("#" + ziadynamic).html("<span class='msg pl0'>" + mess.message + "</span>");
		if("parser" == action) {
			var parserRows = [];
			var ziasliderdiv = jQuery("#" + module + "_adziareqcount");
			parserIds.toArray().forEach(id => {
				var checkboxEle = ziasliderdiv.find('#zp_' + id);
				if("zp_actions" == checkboxEle.attr("data-type")) {
					parserRows.push(checkboxEle.closest('div'));
				}
				else {
					parserRows.push(checkboxEle.closest('li'));
				}
			});
			parserRows.forEach(row => {
				jQuery(row).addClass("highlight-anim");
				setTimeout(function() {
					jQuery(row).removeClass("highlight-anim");
				}, 1000);
			});
		}
		else {
				var parentdata = jQuery("#" + module + "_adziareqcount").find('.tc-row[data-entityid="' + ziaId + '"]'); //NO I18N
				highlightfn(parentdata[0], 'highlight=true,delay=3000');//NO I18N
				setTimeout(function () {
					parentdata.remove(zia_list.emptynotishow());
				}, 600);
		}
				setTimeout(function () {
					jQuery("#" + ziadynamic).removeClass("show").addClass("hide"); //NO I18N
					zia_list.loadzianotifications(module, entityId);
				}, 3000)
				unverified_entity == 0 ? jQuery("#" + module + "_zia_notify").html("") : ""; //NO I18N
			} else {
				if (unverified_entity != 0) {
					zia_list.rippleEntityZiaInNotification(module, mess);
				} else {
					jQuery("#" + module + "_zia_notify").html("");
				}
			}
		}

		// SD-104938 Bypassing all_notification call
		if("parser" !== action) {
		    ziac.bypassAllNotificationCall(unverified_global, reopen_count);
		}
	},
	removeZiaNotifGlobal: function (mess) {
		var unverified_global = mess.unverified_global;
		if (unverified_global == 0) {
			sdp_app.zia_info.IS_BOT_ENABLED ? jQuery("#global_ziaripple").hide() : jQuery("#sdp-chat-bar").find('.zia-chat').hide();
		} else {
			if (jQuery("#ziaglobal").is(":visible")) {
				zia_list.predic_mode = "approval"; //NO I18N
				zia_list.loadzianotifications();
				var app_count = mess.unverified_global - mess.unverified_global_reopen;
				jQuery("#zia_notify_approval_count").text(app_count);
				if (mess.module == 'Request') {
					zia_list.predic_mode = "reopen"; //NO I18N
					zia_list.loadzianotifications();
					jQuery("#zia_notify_reopen_count").text(mess.unverified_global_reopen);
				}
			}
			jQuery("#global_ziaripple .origin").text(unverified_global);
		}
	},
	/**
     * Function to show the verification dropwdown or verify the action directly based on the user action
     *
     * @param {Element} ele - The Like/Dislike/Train Zia button element
     * @param {Event} evt - Click event
     * @returns
     */
    showVerificationDropdown: function(ele, evt) {
    	evt.stopPropagation();
    	evt.preventDefault(); //To prevent the default action of the click event, Issue in PO/PR details page
    	var holder = ele;

    	//If the verification drop-down is already initialized, not needed to initialize again
    	if (holder && holder.init == true) {
    		return;
    	}
    	var buttonElement = jQuery(ele);
    	var actionName = buttonElement.attr('data-mode');
    	var actionTaken = buttonElement.attr('data-predicted-action');
    	var predictionId = buttonElement.attr('data-id');
    	var fromModule = buttonElement.attr('data-module');
    	var parentdata = buttonElement.closest('.tc-row');  //NO I18N
    	var isLikeButton = buttonElement.attr('data-like') === 'true';
    	var verifyingActionList = [];

    	/**
    	 * Update the tech verification directly when user clicks the like/dislike button based on below use cases:
    	 * 1. If it is a like for both actions (approval/reopen)
    	 * or
    	 * 2. If the action is reopenprediction and dislike
    	 */
    	if (isLikeButton || (actionName === 'reopenprediction' && actionTaken !== 'Unable to predict')) {
    		zia_list.updateTechVerification(predictionId, parentdata, fromModule, actionName, isLikeButton);
    		return;

    		/**
    		 * Drop-down data to be shown for approval prediction if user clicks dislike or train-zia button
    		 */
    	} else if (actionName == 'approvalprediction') {    //NO I18N
    		verifyingActionList = [
    			{
    				name: translate("approval.approve"),
    				value: "Approve"    //NO I18N
    			}, {
    				name: translate("approval.reject"),
    				value: "Reject" //NO I18N
    			}, {
    				name: translate("sdp.approve.needclarification"),
    				value: "Need Clarification" //NO I18N
    			}
    		];
    		if (actionTaken === 'Approve') {    //NO I18N
    			verifyingActionList.splice(0, 1);
    		} else if (actionTaken === 'Reject') {  //NO I18N
    			verifyingActionList.splice(1, 1);
    		} else if (actionTaken === 'Need Clarification') {  //NO I18N
    			verifyingActionList.splice(2, 1);
    		}

    		/**
    		 * Drop-down data to be shown for reopen prediction if user clicks train-zia button
    		 */
    	} else if (actionName === 'reopenprediction' && actionTaken === 'Unable to predict') {  //NO I18N
    		verifyingActionList = [
    			{
    				name: translate("zia.reopen.label"),
    				value: "reopen" //NO I18N
    			}, {
    				name: translate("zia.notreopen.label"),
    				value: "retainclosure"  //NO I18N
    			}
    		];
    	}
    	var dropdownId = "zia_verification_dropdown_" + predictionId + '_' + fromModule;   //NO I18N

    	var ziaContainerId = fromModule === 'global' ? 'zianotification' : fromModule + '_adziareqcount';   //NO I18N
    	var ziaContainer = document.getElementById(ziaContainerId);
    	jQuery(ziaContainer).append('<div class="p10 sdmenu-dd zia-verification-dropdown" id="' + dropdownId + '"></div>');

    	renderhbs('#' + dropdownId, 'verification_options', { "verifyingActionList": verifyingActionList, "predictionId": predictionId }, false, "zia");    //NO I18N

    	var dropdown = document.getElementById(dropdownId);

    	sdpDropDown(holder, dropdown, { removeDropOnClose: false, dropDownContainer: ziaContainer, initOpen: true, positionConfig: { within: '#' + ziaContainerId }, removeDropOnClose: true  });
    	holder.init = true;

    	if (fromModule !== 'global') {
    		//All the click event inside the verification drop-down will be handled here to stop closing the Zia dropdown container inside the entity
    		jQuery(ziaContainer).off('click.zia-dropdown').on('click.zia-dropdown', '.zia-verification-dropdown', function (evt) {  //NO I18N
    			zia_list.stopCloseDropdown(ziaContainer);
    		});
    	}

    	// The train-zia button click event will be handled here to update the tech verification based on the selected action
    	jQuery(dropdown).off('click.zia-dropdown').on('click.zia-dropdown', '.train-zia-' + predictionId, function (evt) {  //NO I18N
    		var selected_action = jQuery(dropdown).find('input:radio[name=verified_action]:checked').val();
    		if (!selected_action) {
    			showalert('warning', translate('no.options.selected.label'), 'isAutoHide=true,delay=3'); //NO I18N

    		} else {
    			if (actionName == 'approvalprediction') {
    				zia_list.updateTechVerification(predictionId, parentdata, fromModule, actionName, false, selected_action);
    			} else {
    				//For reopenprediction, the verified acttion is not required to update but valid is true for reopen and false for retain closure while verifying the 'Unable to Predict' data
    				var isValid = selected_action === 'reopen'; //NO I18N
    				zia_list.updateTechVerification(predictionId, parentdata, fromModule, actionName, isValid);
    			}
    		}
    	});
    },
    /**
     * Function to stop closing the Zia dropdown container inside the entity when the user clicks the verification drop-down
     *
     * @param {Element} ziaContainer - Zia Bot container inside the entity(Request/Change/Release/PO/PR)
     */
    stopCloseDropdown: function(ziaContainer) {
    	var $elem = jQuery(ziaContainer).parent();
    	$elem.one('hide.sdp.sdmenu', function (evt) {   //NO I18N
    		evt.preventDefault();
    	});
    	//off the event after the our click done  for scenario two call for checkbox label click
    	setTimeout(function () {
    		$elem.off('hide.sdp.sdmenu');
    	}, 10);
    },
	loadZiaNotificationsInPanel : function(module, id, callbacks) {
             if ((!(sdp_app.zia_info.IS_APPROVAL_NOT_YET_ENABLED && sdp_app.zia_info.IS_REOPEN_NOT_YET_ENABLED) || sdp_app.zia_info.IS_PARSER_ENABLED) && sdp_app.zia_info.CAN_SHOW_UNVERIFIED_NOTIFICATION) {
                 //Hide the current pop-up
                 if(!jQuery('#' + module + '_zia_notify').is(":empty")) {
                     zia_list.clearTblCompDivs(module);
                     zia_list.moduleTblObj = {};
                     if(jQuery('#' + module + '_zia_notify').parent('div').hasClass('panel-slider')) {
                         zia_list.init(module, id);
                         return;
                     }
                     else {
                         jQuery('#' + module + '_zia_notify').empty();
                     }
                 }
                 jQuery('#' + module + '_zia_notify').show().panelSlider({
                     title: translate("sdp.zia.notifications"), //NO I18N
                     width: 448,
                     header: true,
                     modal: true,
                     placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
                     dialogClass: "sdtabui-rightpanel ziaprsr-slider1", //No I18N
                     open: function() {
                         renderhbs('#' + module + '_zia_notify', "zia_prediction", {"id" : id}, false, "zia/zia-prediction"); //No I18N
                         jQuery('#request_zia_popup_button').hide();
                         zia_list.init(module, id);
                         setTimeout(function() {
                             if(callbacks != undefined && callbacks.hasOwnProperty("function")) {
                                let callBckFn = callbacks.function;
								callBckFn(callbacks.params.param1, callbacks.params.param2);
                             }
                         }, 500);
						 //When opened in panel, alert div classes needs to be removed
						 jQuery('#zpdct-alert').removeClass("fh fw");
                     },
                     close: function() {
						 zia_parser.closePreviousMailDetails();
                         jQuery('body').removeClass('subheader-of-h of-h');
						 var ziaNotify = jQuery('#' + module + '_zia_notify');
						 ziaNotify.empty();
						 ziaNotify.attr('class', 'btn-group bs-noconflict ml5 vbottom top10');
						 renderhbs('#' + module + '_zia_notify', module.toLowerCase() + '_zia_popup', {"id": id}, false, 'zia/zia-prediction'); //No I18N
						let btn = jQuery("#" + module.toLowerCase() + "_zia_popup_button");
						btn.off('click.ziapopup').on('click.ziapopup', function() { //No I18N
							zia_list.loadZiaForEntity(this, module, btn.data('entity-id'));   // No I18N
						});
                         zia_list.updateCount(module);
						 ziaNotify.dialog('destroy'); //No I18N
                     }
                 });
             }
			 zia_list.showZiaSuggestionNotification(module, id);
         }
}