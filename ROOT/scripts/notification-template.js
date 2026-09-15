//starting code for notification
var notificationEle = (function() {
    function notificationEle(action,val,changedval,options,callback){
    	var self = this;
    	/** Some default option added
    	 * showTemplatesection - Template add/edit needed or not
    	 * showAttachment - Attach section needed or not
    	 * placeholder - skip placeholder api in data
    	 *  **/
    	var globalVar = {
    		funcallback : null,
    		options : {
    			"showTemplatesection": true,//NO I18N
    			"showAttachment": true,//NO I18N
    			"placeholder": true//NO I18N
    		},
    		attachPreviewObj : null,
    		attachmentRemoved:[],
			newNotification: null,
			email_tocc: null,
			addedAttachmentfiles: []
    	};
    	self.globalVar = jQuery.extend(true,{},globalVar);
    	self.jQ = jQuery('body');
		self.module=options.modelopt == undefined ? "request" : options.modelopt.cf.module;//NO I18N
    	if(action=='delete'){
    		self.deleteNotification(val,changedval);
    	}
    	else{
    		self.showNotification(action,val,changedval,options,callback);
    	}
    }
    notificationEle.prototype.showNotification = function(action,val,changedval,options,callback) {
		var self = this, variableObj = self.globalVar;
			options = jQuery.extend({},variableObj.options,options)
			variableObj.options = options;
			variableObj.funcallback = callback;
			
		//dialog box for notification template
    	var opt = {autoOpen: false,modal: true,width: 950,height:"auto",left:172,"position": { my: "center top", at: "center top+0", of: window },//NO I18N
			/* open: function(){
				jQuery('body').css('overflow','auto');//NO I18N
			} */
			close: function(){
                rlc.subjectVarialbe = [];
                rlc.contentVarialbe = [];

				if(!variableObj.options.showTemplatesection) {
					self.jQ.find("#newnotification").dialog("destroy");//NO I18N
				}
            }
		};//NO I18N
		self.jQ.find("#newnotification").dialog(opt).dialog("open").show();//NO I18N
		
		if(changedval != null) {
			var id;
			if(action == 'true') {//Edit notitfication
				variableObj.email_tocc = changedval.notification_action;
				id = changedval.notification_action.notification_template.id;
			} else if(action == 'change') {//NO I18N
				id = variableObj.newNotification.id;//Template changes and click back button
			} else if(action=="back") {//NO I18N
				id = (variableObj.newNotification != null && variableObj.newNotification.id != undefined) ? variableObj.newNotification.id : (changedval.notification_action != undefined) ? changedval.notification_action.notification_template.id : changedval.id;//Template changes and click back button
			} else if(action == 'saveTemp') {//NO I18N
				id = changedval.id;//get saved template from form page
			}
			self.getTemplateContent(id);//get ajaxcall for render notification data
			val = variableObj.newNotification;
		}
		renderhbs('#notificationtemp','notificationTemplate',{"template":val,"options":options},false,"common"); // NO I18N
		
		var bkbtn = (options.notiTempbackbtnshow) ? '<a class="btn btn-default btn-xs mr10" href="/" data-id="back" data-name="templatepage"><span class="cspr go-back icon-xs top2"></span></a>' : '';
        self.jQ.find("#newrule,#newnotification").parent().find(".ui-dialog-title").html(bkbtn+translate("sdp.admin.change.stageandstatus.notificationtemplate"));//NO I18N
		self.jQ.find("#newrule [data-id='rulePart']").addClass('hide');//NO I18N//for RLC
		var $ele=jQuery('#emailNotification');
			$ele.removeClass('hide');
			if(options.showTemplatesection) {//Hide/show event for form field
				$ele.find("[data-type='unedit'] ").show().end()
					.find("[data-type='edit'] ").hide();//NO I18N
			} else {
				self.editTemplate();
			}
			$ele.find("input[name='notificationTemplate']").sdp_select2({
                cache:{},
                url:[{
                    //search_keys: [ "mode" ],    //No I18N
                    url:"/api/v3/notification_templates",//NO I18N
                    field:'notification_templates',//NO I18N
                    list_info:{start_index:1, sort_field:"name",row_count:100,search_criteria:[{field:"type",condition:"starts with",value:"custom_template"},{field:"module",condition:"is",value:self.module,logical_operator:"and"}]}//NO I18N
                }],
                filterRemoteData: function(item) {
                    return item && item.mode;
                },
                processResults: function(search_data, resdata, resfield) {
                    if(resdata && resdata.mode) {
                        search_data.push({
                            id: resdata.id,
                            name: resdata.name,
                            mode: resdata.mode
                        });
                    }
                },
                formatSelection: function(resdata) {
                    var name = resdata.name || resdata.text;
                    if (resdata.id == undefined) {
                        return '';
                    } else if(resdata.mode == "E-Mail") {//NO I18N
                        return '<span class="cspr email1 icon-sm thmmaskbg mr5"></span>' + e_html(name);
                    } else if(resdata.mode == "SMS") {//NO I18N
                        return '<span class="cspr outgoing-conv-off icon-sm vmiddle thmmaskbg mr5"></span>' + e_html(name);
                    }
                },
                formatResult: function(resdata,page) {
                    if(resdata.mode == "E-Mail") {
                        return '<span class="cspr email1 icon-sm thmmaskbg mr5"></span>' + e_html(resdata.name);
                    } else if(resdata.mode == "SMS") {//NO I18N
                        return '<span class="cspr outgoing-conv-off icon-sm thmmaskbg vbottom mr5"></span>' + e_html(resdata.name);
                    }
                },
                multiple:false
            });
			//add new button in template selection
			$ele.find("input[name='notificationTemplate']").select2("container").on("select2-opening",function(){}).find(".select2-drop").append('<div class="select2-filter-option"><a href="/" type="button" class="btn btn-link btn-sm" data-action="add_Notifcation_Template"><span class="common-sprite icon-xs common-add-icon4 mr5"></span>'+translate("common.new")+'</a></div>');//NO I18N
			
			//get org_roles using ajax call
            var roles=[], listInfo = {list_info:{start_index:1,row_count:100}};
			var groupid = [];
			var userGrpindex;
			function getroles(ajaxResponse, grpkey) {
				/** Select2 grouping configure in notification to/cc field **/
				var groups_meta = {//Static heading data for org_roles api call
					"ORG": "sdp.admin.leftpanel.helpdesk.organization.home1",//NO I18N
					"REGION": "sdp.admin.site.listview.location",//NO I18N
					"SITE": "common.site",//NO I18N
					"DEPARTMENT": "common.department",//NO I18N
					"GROUP": "common.group"//NO I18N
				};
				/** check if data have key "associated_entity" then only separate options to group  **/
				var checkDepartmentkeys = true;
				var roleid = grpkey == "roles" ? "orgroles_" : "placeholders_";//NO I18N
				for(var i=0;i<ajaxResponse.length;i++) {
					var ent = grpkey == "roles" ? "associated_entity" : "module.display_name";//NO I18N
					var groupkey = dotObjgetval(ajaxResponse[i], ent);
					if(groupkey) {
						if(groupid.indexOf(groupkey) == '-1') {
							if(groupkey == "GROUP" && (options.modelopt != undefined && options.modelopt['groupRolesDollarVarSupported'] === false) ) {
								continue;
							}
							if(window.checkIfMSP()) {
								// dollar variables which are resolved based on user (requester) attributes are skipped here
								// support introduced for MSP, for Missed Chat Notification feature where notifying requester's SITE MANAGER or DEPARTMENT INCHARGE doesn't make sense in MSP
								if((options.modelMspOpt != undefined && options.modelMspOpt['requesterBasedDollarVarSupported'] === false) && (groupkey == "SITE" || groupkey == "DEPARTMENT" || groupkey == "REGION")) {
									continue;
								}
							}
							groupid.push(groupkey);
							var childdata = [];
							if(groupkey == "DEPARTMENT") {
								childdata.push({"id":"orgroles_1","text":"$DEPT_HEAD$"});
								checkDepartmentkeys = false;
							}
							for(var j=0;j<ajaxResponse.length;j++) {
								if(window.checkIfMSP()) {
									if(groupkey == "ORG") {
										var displayname = ajaxResponse[j].display_name;
										if(displayname == "$ACCOUNT_MANAGERS$") {
											if( (options.modelMspOpt != undefined && options.modelMspOpt['requesterBasedDollarVarSupported'] === false) || !(self.module == "request" || self.module == "problem") ) {
												// $ACCOUNT_MANAGERS$ variable supported only for Request & Problem CT, RLC and Request Timer rules
												continue;
											}
										} else if(displayname == "$POINT_OF_CONTACT$") {    //NO I18N
											if(options.modelMspOpt != undefined && options.modelMspOpt['requesterBasedDollarVarSupported'] === false) {
												continue;
											}
										}
									}
								}
								if(dotObjgetval(ajaxResponse[j], ent) == groupkey) {
									childdata.push({id:roleid+ajaxResponse[j].id,text:ajaxResponse[j].display_name})
								}
							}
							var gname = grpkey == "roles" ? translate(groups_meta[groupkey]) : groupkey + " " + translate("sdp.helpdesk.common.user");//NO I18N
							var groupobj = {
								"text": gname,//NO I18N
								"children": childdata//NO I18N
							}
							roles.push(groupobj);
						}
					} else {
						roles.push({id:roleid+ajaxResponse[i].id,text:ajaxResponse[i].display_name});
					}
				}
				if(grpkey == "roles") {
					if ( !window.checkIfMSPOrSCP() || ( window.checkIfMSP() && (options.modelMspOpt == undefined || options.modelMspOpt['requesterBasedDollarVarSupported'] !== false) ) ) {
					// Always true for SDP
					// For MSP, Dept Head and Reporting To included  when requesterBasedDollarVarSupported option is not set to false.
					// Always false for SCP. Dept Head and Reporting To roles are not applicable for SCP
					if(checkDepartmentkeys) {
						roles.push({"text": translate("common.department"),"children":[{"id":"orgroles_1","text":"$DEPT_HEAD$"}]})
					}
					roles.push({"text": translate("sdp.helpdesk.common.user"),"children":[{"id":"orgroles_2","text":"$REPORTING_TO$"}]});
					}
				}
			}
			if(sdp_user.ROLES.includes('SDAdmin')) {//user has SDAdmin role then only we call org_roles API
			    //roles = [{id:"orgroles_1",text:"$DEPT_HEAD$"},{id:"orgroles_2",text:"$REPORTING_TO$"}];//NO I18N
			    var has_more_rows = false;
			    do{
			    //fetching all the org roles by looping
					var ajaxResponse = [];
					sdpAjax({
						url:"/api/v3/org_roles",//NO I18N
						type:'GET',//NO I18N
						data: {input_data:sdpToJSON(listInfo)},
						cache:false,
						async:false,
						success:function(response){
							has_more_rows = response[Object.keys(response)[2]].has_more_rows
							ajaxResponse = response[Object.keys(response)[1]];
						}
					});
					getroles(ajaxResponse, 'roles');//NO I18N
					if(has_more_rows){
						listInfo.list_info.start_index += 100;
					}
				}while(has_more_rows);
			}
			if(options.placeholder) {
				listInfo.module = self.module;
				listInfo.list_info["row_count"] = 100;
                listInfo["for"] = "wfnotification";//NO I18N
                listInfo.list_info["start_index"] = 1;//NO I18N
            	var ajaxResponse = self.ajaxCall("/api/v3/placeholders",'GET',listInfo);//NO I18N
            	/** Select2 grouping configure in notification to/cc field **/
            	getroles(ajaxResponse, 'placeholder');//NO I18N
			}
            var useindex;
            for(var i=0; i<roles.length; i++) {
            	if(roles[i].text == translate("sdp.helpdesk.common.user")) {
            		useindex = i;
            	}
            }
            //dropdown for notify to and notify cc
            var $to = self.jQ.find('#emailNotification [data-id="notify_users"]');
            var regexp="\\\$([,]*)$", users=[];//No i18n
            $to.val("").end().select2("destroy");
            $to.select2({
                data:roles,
                multiple:true,
                closeOnSelect:false,
                maximumSelectionSize: 25,
                formatNoMatches: translate("common.no.match.found"), //No I18N
                formatSelectionTooBig: function (limit) {
                    return translate('sdp.notification.too.selected.items');//NO I18N
                },
                cache: {},
                ajax: {
			        url: window.checkIfSCP() ? '/api/v3/notification_templates/users_to_notify' : '/api/v3/users',//NO I18N
			        dataType: 'json',//NO I18N
			        type: "GET",//NO I18N
			        quietMillis: 250,
			        data: function (data,_self) {/** Set listinfo to api call **/
			        	var rcount = _self * 100;
			        	var sindex = rcount - 100 + 1;
			        	var linfo = { start_index: sindex, row_count: rcount };
			        	if(data.trim() != "") {
			        		linfo["fields_required"] = ["id","name"];//NO I18N
			        		linfo["search_criteria"] = {field:"name",condition:"like",values:[data]};//NO I18N
			        	}
			        	var listInfo1 = sdpAjaxInputData({list_info:linfo});
			        	return listInfo1;
			        },
			        processResults: function(data, _self) {/** Get the response **/
						return {
							results: window.checkIfSCP() ? data.users_to_notify : data.users
						};
					},
			        results: function (data, index, _self) {/** Form the result and filter roles/placeholder options based on search term **/
			        	var optlist = [];
						data_field = window.checkIfSCP() ? data.users_to_notify : data.users;
			        	jQuery.each(data_field, function (index, item) {
							if(useindex && roles[useindex].children.length && roles[useindex].children.find(o => o.id == 'users_' + item.id) != undefined) {
								return false;
							}

			        		if(useindex) {
			        			roles[useindex].children.push({
			                        'id': 'users_'+item.id, //NO I18N
			                        'text': item.name //NO I18N
			                    });
			        		} else {
				        		optlist.push({
			                        'id': 'users_'+item.id, //NO I18N
			                        'text': item.name //NO I18N
			                    });
		                    }
			        	});
			        	if(index == 1) {//Index "1" set for component render initial time and key search event triggered, if lazy loading triggered index change plus one(+index) value
				            var rolesvalid = [];
				            if(_self.term.trim() !== "") {
								var term = _self.term;
						    	var rls = roles;
						    	for(var i=0;i<rls.length;i++) {
						    		if(rls[i].children) {
	                    /** Roles/placeholder data filter based on search term in Grouping **/
						    			if ( rls[i].text.toUpperCase().indexOf( term.toUpperCase().trim() ) != -1 ) {
							    			rolesvalid.push({"id":rls[i].id, "text": rls[i].text || rls[i].name,"children": rls[i].children});
							    		} else {
							    			var childvalid = [];
							    			for(var j=0; j<rls[i].children.length; j++) {
							    				if ( rls[i].children[j].text.toUpperCase().indexOf( term.toUpperCase().trim() ) != -1 ) {
									    			childvalid.push({"id":rls[i].children[j].id, "text": rls[i].children[j].text || rls[i].children[j].name});
									    		}
							    			}
							    			if(childvalid.length != 0) {
							    				rolesvalid.push({"text":rls[i].text,"children": childvalid});
							    			}
						    			}
						    		} else {
							    		if ( rls[i].text.toUpperCase().indexOf( term.toUpperCase().trim() ) != -1 ) {
							    			rolesvalid.push({"id":rls[i].id, "text": rls[i].text || rls[i].name});
							    		}
			        		}
						    	}
						    	optlist = rolesvalid.concat(optlist)
							} else {
								optlist = roles.concat(optlist)
							}
						}
			            var opt = {
			            	"more": data.list_info.has_more_rows,//NO I18N
			            	"results": optlist//NO I18N
			            };
			            return opt;
			        }
			    }
			});
			$to.prev().find(".select2-search-field").css("width", "auto");//NO I18N
		if(options.disbtempEditSele) {
			$ele.find("input[name='notificationTemplate']").select2('disable');//NO I18N
			$ele.find("#editTemp").addClass('opac3').css('pointer-events','none').closest('.right-col').attr({'title':translate("sdp.admin.notificationtemplate.selection.disable"),'rel':'uitip'});//NO I18N
			initTooltip('#emailNotification');//NO I18N
		}
		if(variableObj.newNotification != null) {//for render some changes
			if(variableObj.newNotification.id) {
				$ele.find("input[name='notificationTemplate']").select2("data",{id:variableObj.newNotification.id,name:variableObj.newNotification.display_name,mode:variableObj.newNotification.mode});//NO I18N
			}
			//append image_token to description inline images
			var notificationContent = (variableObj.newNotification.content != null && variableObj.newNotification.content.indexOf('?key='+variableObj.newNotification.image_token) == -1)?appendImageToken(variableObj.newNotification.content,variableObj.newNotification.image_token):variableObj.newNotification.content;
			$ele.find("#sub_desc").html(notificationContent).attr("data-content","rta");//NO I18N
			variableObj.newNotification.content ? $ele.find("#description").show() : $ele.find("#description").hide();
			
			if(variableObj.email_tocc != null) {
				var processReult=function(data){    
                    var result=[];
                    jQuery.each(data,function(index, data) {
                        for(var i=0;i<data.length;i++) 
                        {
                            if(index=="notify_users"){
                                result.push({id:"users_"+data[i].id,text:data[i].name||data[i].display_name});
                            }
                            if(index=="notify_placeholders"){
                                result.push({id:"placeholders_"+data[i].id,text:data[i].name||data[i].display_name});           
                            }
                            if(index=="notify_org_roles"){
                                result.push({id:"orgroles_"+data[i].id,text:data[i].display_name});
                            }
                        }
                    }); 
                    return result;
                };
                $ele.find('#notify_to').select2("data",processReult(variableObj.email_tocc.notify_to)).end()//NO I18N
                    .find('#notify_cc').select2("data",processReult(variableObj.email_tocc.notify_cc));//NO I18N
			}
			
			var attachObj = variableObj.newNotification.attachments;
			if(attachObj != undefined) {
				if(attachObj.length == 0) {
					//$ele.find("#notification-attachment").append('<p class="text-center text-muted" id="noAttach">'+translate('sdp.project.noattachment')+'</p>')
				} else {
					//Attachment initalize
					self.initAttachment(attachObj);
					$ele.find('#file-browser-area').addClass('hide');
					self.attachPreviewObj.destroy();//destroy attach event(not needed in template selection page)
					for(var j=0;j<attachObj.length;j++){//template page remove delete icon in attachments
						$ele.find('#attachment-api .btn-group:eq('+j+') .atdrpactn').remove();
					}
				}
			}
			ThemeCustomizer.zcontrastcolorinit("#description");//118119 -- RTA section Zoho color contrast changes updated
		}
			
		//Event start
		jQuery(document).find("input[name='notificationTemplate']").on('change',function(event,template) {//Template selection event
			self.getTemplateContent(event.val);
			self.getToCc(variableObj);//NO I18N
			self.showNotification('change',null,variableObj.newNotification,options,callback);
		});
		jQuery("[data-action='add_Notifcation_Template'").unbind('click').bind("click",function() {//add button in template dropdown for adding new template
			variableObj.newNotification = null;
			$ele.find("input[name='notificationTemplate']").select2("close");//NO I18N
			self.getToCc(variableObj);//NO I18N
			self.editTemplate("add");//NO I18N
		});
		jQuery("#editTemp").unbind('click').bind("click",function() {//clicking event for edit template
			self.getToCc(variableObj);//NO I18N
			self.editTemplate("edit");//NO I18N
		});
        jQuery("#newrule,#newnotification").parent().off("click").on("click",'[data-id="back"]',function(){//NO I18N
			//for clicking back button in dialog box
            if(jQuery(this).attr('data-name') == 'templatepage') {
				self.jQ.find("#newnotification").dialog('close').end().find("#newrule,#newnotification").parent().find(".ui-dialog-title").html(translate("common.new.label",[translate("sdp.requests.fieldFormRules.listview.rule")])).end().find("#newrule [data-id='rulePart']").removeClass('hide');
				$ele.addClass('hide');
            } else {
				variableObj.newNotification = (variableObj.newNotification.id == null) ? null : variableObj.newNotification;
				self.showNotification("back",variableObj.newNotification,changedval,options,callback);
            }
        });
		//clicking event for save/update in notification template
		jQuery(document).find('#uneditSave').unbind('click').bind("click",function(){
			self.saveNotification("action",variableObj.funcallback);//NO I18N
		});
		jQuery(document).find('#editSave').unbind('click').bind("click",function(){
			self.saveNotification("template");//NO I18N
		});
		jQuery(document).find('#editShow').unbind('click').bind("click",function(){
			self.showNotification('back',variableObj.newNotification,changedval,options,callback);
		});
		jQuery(document).on("click",'#uneditShow',function(){//template page cancel event
			self.jQ.find("#newnotification").dialog('close').end().find("#newrule,#newnotification").parent().find(".ui-dialog-title").html(translate("common.new.label",[translate("sdp.requests.fieldFormRules.listview.rule")])).end().find("#newrule [data-id='rulePart']").removeClass('hide');
            $ele.addClass('hide');
		});
		jQuery(document).find("input[name='templatemode']").on('change',function(e,val) {//Template mode change event (Email, SMS)
			(jQuery(this).attr('value') == 'SMS') ? jQuery('[data-id=E-mail],#notification-attachment').addClass('hide') : jQuery('[data-id=E-mail],#notification-attachment').removeClass('hide');//NO I18N
			(jQuery(this).attr('value') == 'SMS') ? jQuery('[data-id=SMS]').removeClass('hide') : jQuery('[data-id=SMS]').addClass('hide');//NO I18N
		});
		//Event end
	};
	notificationEle.prototype.getTemplateContent = function(id) {
		var _self = this, variableObj = _self.globalVar, attachmentLength=0;
			variableObj.newNotification = _self.ajaxCall("/api/v3/notification_templates/"+id,'GET');//NO I18N
	};
	notificationEle.prototype.editTemplate = function(data) {//Template add/edit event changes
		var self = this, variableObj = self.globalVar;
		var $ele = jQuery('#emailNotification');
		if(variableObj.options.showTemplatesection) {
			$ele.find("[data-type='edit']").show().end()
				.find("[data-type='unedit']").hide().end()
				.find('#file-browser-area').removeClass('hide');

			//back button
			jQuery("#newnotification,#newrule").parent().find(".ui-dialog-title").html('<a  href="/" class="btn btn-default btn-xs mr10" data-id="back" data-name="formpage"><span class="cspr go-back icon-xs top2"></span></a>'+translate("ae.cmdb.inventory.editNewCI",[translate("sdp.admin.requesttemplate.template")]));//NO I18N
		}
		if(!(rlc.contentVarialbe&&rlc.contentVarialbe.length)){
			var mjson = {
				"module": (variableObj.options && variableObj.options.module) ? variableObj.options.module : self.module //NO I18N
			};
			if(self.module == "request") {
				mjson["for"]="service"; //NO I18N
			}
			else if (self.module == "release") {
				mjson["for"] = "releases"; //NO I18N
			}
			if(variableObj.options && variableObj.options.for) {
				mjson["for"] = variableObj.options.for; //NO I18N
			}
			sdpAjax({
				url: '/api/v3/notification_templates/_subject_dollar_variables',//NO I18N
				type: 'GET',//NO I18N
				data:  {input_data:sdpToJSON(mjson)},
				cache:false,
				context:this,
				async:false,
				success: function(data) {
					rlc.subjectVarialbe=[];
					list=data.subject_dollar_variables;
					for(i=0;i<list.length;i++){
						var txt = list[i].display_name;
						if(list[i].service_category) {
							txt = list[i].display_name + '( ' + list[i].service_category + ')';
						}
						var selet_opt = {text:e_html(txt),value:list[i].name};
						/** check module option present/not then we add option module as key and use in autosuggestion function **/
						if(list[i].module && list[i].module.display_name) {
							selet_opt.module = list[i].module.display_name;
						}
						rlc.subjectVarialbe.push(selet_opt);
					}
				}
			});
			sdpAjax({
				url: '/api/v3/notification_templates/_content_dollar_variables',//NO I18N
				type: 'GET',//NO I18N
				data:  {input_data:sdpToJSON(mjson)},
				cache:false,
				context:this,
				async:false,
				success: function(data) {
					rlc.contentVarialbe=[];
					var list=data.content_dollar_variables;
					for(var i=0;i<list.length;i++){
						var txt = list[i].display_name;
						if(list[i].service_category) {
							txt = list[i].display_name + '( ' + list[i].service_category + ')';
						}
						var selet_opt = {text:e_html(txt),value:list[i].name};
						/** check module option present/not then we add option module as key and use in autosuggestion function **/
						if(list[i].module && list[i].module.display_name) {
							selet_opt.module = list[i].module.display_name;
						}
						rlc.contentVarialbe.push(selet_opt);
					}
				}
			});
			sdpAjax({
                url: '/api/v3/global_variable_groups/_get_variables_list',//NO I18N
                type: 'GET',//NO I18N
                data:sdpAjaxInputData({"for":"Others"}),  //NO I18N
                async:false,
                success: function(data) {
                    var list=data.global_variables_list;
                    for(i=0;i<list.length;i++){
                        var listData = {text:"GV."+list[i].group+"."+list[i].variable,value:"${GV."+list[i].group+"."+list[i].variable+"}"}; //No I18N
                        rlc.subjectVarialbe.push(listData);
                        rlc.contentVarialbe.push(listData);
                    }
                }
            });
		}
		//empty all input boxes while opening new template
		if(data=="add"){
			variableObj.newNotification = {name:"",display_name:"",subject:"",content:"",module:self.module,mode: "E-Mail"}
			$ele.find("[name='templatemode']").attr("disabled",false);
			$ele.find("input[name='notificationTemplateText']").val("").end()//template name
				.find("input[name='subject']").val("").end()//template subject
        		.find("#email-mode").prop("checked",true).end()//NO I18N
        		.find("#notification_Content").val("").end()//template email content
        		.find("[name=smscontent]").text("").end()//template sms content
        		.find("#editSave").text(translate("common.save"));//template save button
			jQuery("#newnotification").parent().find(".ui-dialog-title").html('<a href="/" class="btn btn-default btn-xs mr10" data-id="back" data-name="formpage"><span class="cspr go-back icon-xs top2"></span></a>'+translate("common.add.label",[translate("sdp.admin.requesttemplate.template")]));//NO I18N
			variableObj.addedAttachmentfiles = [];
		}
		if(data=="edit") {
			$ele.find("[name='templatemode']").attr("disabled",true);
			if(variableObj.newNotification.mode == 'E-Mail') {//NO I18N
				$ele.find("#email-mode").prop('checked',true).end()//NO I18N
					.find('[data-id=E-mail],#notification-attachment').removeClass('hide').end()//NO I18N
					.find('[data-id=SMS]').addClass('hide');//NO I18N
            } else {
				$ele.find("#sms-mode").prop('checked',true).end()//NO I18N
					.find('[data-id=E-mail],#notification-attachment').addClass('hide').end()
					.find('[data-id=SMS]').removeClass('hide');//NO I18N
            }
			variableObj.newNotification.mode=="E-Mail" ? $ele.find("#email-mode").prop('checked',true) : $ele.find("#sms-mode").prop('checked',true);//NO I18N
            $ele.find("input[name='subject']").val(variableObj.newNotification.subject);
            if(variableObj.newNotification.content != null && variableObj.newNotification.content.indexOf('?key='+variableObj.newNotification.image_token) == -1){
                //image_token getting appended multiple times, when content loaded to editor
                variableObj.newNotification.content = appendImageToken(variableObj.newNotification.content,variableObj.newNotification.image_token);
            }
		}
		
		jQuery("#noAttach").remove();
		var inlineurl = (data=="add") ? "/api/v3/notification_templates/images":"api/v3/notification_templates/"+variableObj.newNotification.id+"/images";//NO I18N
		zeditor({element:'notification_Content', isEnterKeyHandler:true,entity: "notification_templates",imgParameters:{module:'notification_template',formName:'notificationTempForm'},"inlineimagesAPI": inlineurl,"content":variableObj.newNotification.content,edithtml: true});//No i18n
		jQuery(editor.iframe).contents().find("body").attr({
			contentEditable: 'true'
		});
		
		//Attachment initalize
		var attachObj = variableObj.newNotification.attachments;
		self.initAttachment(attachObj);
		if(attachObj == undefined || attachObj.length == 0) {
			self.jQ.find('#attachment-api').prepend('<p class="sb" data-id="attachTitle">'+translate('sdp.requests.filedownload.header')+'</p><hr class="mt0 bglight5">').addClass('p10 clearfix');//NO I18N
		}
		$ele.find('#file-browser-area').removeClass('hide');
		var auto_sug = {
			sort:true,
			'zIndex':103,//NO I18N
			stratergy: {
				template: function(value) {/** change the result options in autosugestion function using module key **/
					var mod = (value.module) ? '<br><span class="font-xsmall text-hover">'+e_html(value.module)+'</span>' : ''
					return '<span class="sb">'+e_html(value.text) + '</span>' + mod;
				}
			}
		};
		setTimeout(function(){
			autoSuggestion(jQuery("#emailNotification [name=smscontent]"),rlc.subjectVarialbe,"\\\$([\\\S]*)$",auto_sug);//type $ editor for sms content//No I18N
			autoSuggestion(jQuery("#emailNotification [name=subject]"),rlc.subjectVarialbe,"\\\$([\\\S]*)$",auto_sug);//type $ editor for subject section//No I18N
			autoSuggestion(jQuery(editor.iframe).contents().find("body"),rlc.contentVarialbe,"\\\$([\\\S]*)$",auto_sug);//type $ editor for email RTA content//No I18N
			//jQuery(editor.iframe).contents().find("body").html(variableObj.newNotification.content);//RTA content section update content
		},400);
	};
	notificationEle.prototype.initAttachment = function(attachObj) {
        var _self = this, variableObj = _self.globalVar;
		jQuery("#notification-attachment").empty().append('<div id="attachment-api" class="pl5"></div>');
		/* var maxlen = 10; */
		if(attachObj != undefined) {
			variableObj.addedAttachmentfiles = attachObj;
			if(attachObj.length > 0) {
				for(var i=0;i<attachObj.length;i++){
					var fileSize = attachObj[i].size ? attachObj[i].size.display_value : "";
					$('#attachment-api').append('<button type="button" data-href="'+e_attr(attachObj[i].content_url)+'" data-attach-id='+e_attr(attachObj[i].id)+' data-attach-size="'+e_attr(fileSize)+'" data-attach-by="'+e_attr(attachObj[i].attached_by.name) +'" data-attach-on="'+e_attr(attachObj[i].attached_on.display_value)+'">'+e_html(attachObj[i].name)+'</button>'); //No I18N
				}
				/* maxlen = 10 - attachObj.length; */
			}
		}
		
        var attach_options = {
            api: false,
            upload_api : true,
            upload :  true,
            is_odapi: true,
            download: true,
            enable_delete: true,
            direct_upload: false,
			max_upload_length: 10,
			is_new_form: true,
            entity: "notification_templates",//No I18N
            drop_element: "#attachment-api"//No I18N
        }
		
		/** custom function to prevent the immediate update */
        attach_options.servlet_cb = function(response, attachmentEle) { 
            _self.addedAttachment(response,attachmentEle,variableObj);
        };
        attach_options.ondelete = function(context, attachmentEle,response) {
            _self.removedAttachment(context, attachmentEle,_self,variableObj.newNotification.id);
        };
        _self.attachPreviewObj = new attachPreview('#attachment-api', attach_options); //No I18N 
    };
	notificationEle.prototype.addedAttachment = function(response, attachmentEle, _self) {
		var isFailed = false;
        response && response.responseJSON && ( response = response.responseJSON );
        if(response && response.response_status) {
            if(response.response_status.status === "success") {
                //adding the attachment id from the attachment value
				_self.addedAttachmentfiles.push(response.attachment);
				setTimeout(function() {
					jQuery('#file-browser-area').removeClass('hide');
				},100);
            }
            else if(response.response_status.messages) {
                window.showalert("failure", response.response_status.messages[0].message, "isAutoHide=true");   //No I18N
                isFailed = true;
            } else {
                window.showalert("failure", translate("form.attachment.add.failed"), "isAutoHide=true");    //No I18N
                isFailed = true;
            }
        } else {
            window.showalert("failure", translate("form.attachment.add.failed"), "isAutoHide=true");    //No I18N
            isFailed = true;
        }

        if(isFailed && attachmentEle && attachmentEle.length > 0) {
            attachmentEle.parents(".btn-group:first").remove(); //No I18N
        }
        initTooltip("#notification-attachment"); //No I18N
	};
	notificationEle.prototype.removedAttachment=function(context, attachmentEle, _self,id) {
        var _self = this;
        if(!attachmentEle) {
            return;
        }
        var attachid = attachmentEle.data("attach-id"), attachurl;  //No I18N
        if(!attachid) {
            attachurl = attachmentEle.data("attach-url");   //No I18N
            if(attachurl) {
                attachurl = attachurl.split("/");   //No I18N
                attachid = attachurl[attachurl.length - 1];
            }
        }
        if(!attachid) {
            return;
        }
        attachid += ""; //No I18N
        var obj = {id:attachid}
        _self.globalVar.attachmentRemoved.push(obj);
		var eleIndex = {};
		jQuery.map(_self.globalVar.addedAttachmentfiles, function(ele, index) {
			if(ele.id == attachid) {
				eleIndex = ele;
			}
		});
        _self.globalVar.addedAttachmentfiles.splice(_self.globalVar.addedAttachmentfiles.indexOf(eleIndex),1);
		
        attachmentEle.parents(".btn-group:first").fadeOut("fast", function() {  //No I18N
            jQuery(this).remove();
        });
        (!_self.jQ.find('#notificationTempForm>[data-type="edit"]').is(":visible") && _self.globalVar.addedAttachmentfiles.length == 0) ? _self.jQ.find("#attachment-api").html('<p class="text-center text-muted" id="noAttach">'+translate('sdp.project.noattachment')+'</p>') : '';
    };
	notificationEle.prototype.saveNotification = function(data,funcallback) {//Save template form and selection
		var self = this, variableObj = self.globalVar, successId = "", attachments = "";
		var template = variableObj.newNotification;
        var $ele = jQuery('#emailNotification');
		var users = {};
		if(data.indexOf("action")>-1) {
			// fix for SD-114241 => validation moved to top to prevent the form from sumitting before selecting 'To' field
            users = {cc:jQuery('#emailNotification #notify_cc').select2("data"),to:jQuery('#emailNotification #notify_to').select2("data")};//NO I18N

			let selectedTemplate = jQuery("input[name='notificationTemplate']").select2("data");//NO I18N
            if(!selectedTemplate){
                showalert("failure",translate("common.validation",[translate("sdp.admin.requesttemplate.template")]),'isAutoHide=false,delay=3');//NO I18N
                return;
            }
            if(!users.to.length){
                showalert("failure",translate("common.select.users.msg"),'isAutoHide=false,delay=3');//NO I18N
                return;
            }
		}
        if(data.indexOf("template")>-1 || !variableObj.options.showTemplatesection) {
			$ele.find("#notificationTempForm").validate({
			    debug: true,
				ignore: '*:not([name])', //Fixes your name issue
			    errorClass: 'text-danger alert alert-danger alert-arrow p5 pos-abs',//NO I18N
			    validClass: 'success',//NO I18N
			    errorElement: 'span',//NO I18N
			    highlight: function(element, errorClass, validClass) {
			      	jQuery("#notificationTemplateText-error").addClass(errorClass).removeClass(validClass).css("position","absolute");//NO I18N
			    },
			    messages: {
                	notificationTemplateText: translate("sdp.admin.priority.empty.jserror"),
                	subject:{
						required: translate("sdp.common.mail.jsSubErr"),
						maxlength: translate("form.digits.exactlength.alert",150),
					}
            	},
				errorPlacement: function(error, element) {
					position = element.position();
					error.insertAfter(element)
					element.focus();
				}
			});
			if(!$ele.find("#notificationTempForm").valid()) {
				return false;
			}
		//}
        //if(data.indexOf("template")>-1) {//template selection
			if($ele.find("#notificationTempForm").valid()) {
				if(variableObj.options.showTemplatesection) {
					template.name = jQuery("input[name='notificationTemplateText']").val();
					template.mode = $ele.find("input[name='templatemode']:checked").val();//NO I18N
				}
				template.subject = jQuery("input[name='subject']").val();
				template.isenabled = true;//NO I18N

				template.mode = (template.mode == 'E-mail' || template.mode == 'E-Mail') ? 'E-Mail' : 'SMS';//NO I18N
				if(template.mode == 'E-Mail') {//NO I18N
					template.content = (ZEditor.editor.initobj.id == "ze_notification_Content") ? ZEditor.editor.getHTML() : jQuery(editor.iframe).contents().find("body").html();//NO I18N
					//var inlineimgopt = ZEditor.editor.doc.all;
					var inlineimgopt = jQuery('#INLINEIMAGES option');
					var inlineimg = [];
					for(var i=0; i<inlineimgopt.length; i++) {
						inlineimg.push(inlineimgopt[i].value)
						//(inlineimgopt[i].tagName == 'IMG') ? inlineimg.push(inlineimgopt[i].getAttribute('src').split('/')[inlineimgopt[i].getAttribute('src').split('/').length-1]) : '';//NO I18N
					}
					//(inlineimg.length != 0) ? template.images = {"content": inlineimg} : ''//NO I18N
					var vattach = variableObj.addedAttachmentfiles;
					var vattacharr = [];
					for(var i=0; i<vattach.length; i++) {
						vattacharr.push({"id":vattach[i].id});//NO I18N
					}
					template.attachments = vattacharr;
				} else {
					template.content = jQuery('[name=smscontent]').val();//NO I18N
				}
				
				delete template.display_name;
				delete template.image_token;//image token should be deleted before making API call

				var url="/api/v3/notification_templates";//NO I18N
				var type="POST";//NO I18N
				var msg = translate('api.added.success',[translate('sdp.admin.change.stageandstatus.notificationtemplate')]);
				if(template.id != undefined) {
					url="/api/v3/notification_templates/"+template.id;//NO I18N
					type="PUT";//NO I18N
					msg = translate('api.updated.success',[translate('sdp.admin.change.stageandstatus.notificationtemplate')]);
				}
				sdpAjax({
	        		url:url,
	        		type:type,
	        		data:{input_data:sdpToJSON({"notification_template":template})},//NO I18N
	        		async:false,
	        		context:this,
	        		success:function(data) {
						variableObj.newNotification = data.notification_template;
						if(variableObj.options.showTemplatesection) {
							//self.showNotification('saveTemp',null,data.notification_template,variableObj.options,variableObj.funcallback);
							self.showNotification('saveTemp',variableObj.newNotification,null,variableObj.options,variableObj.funcallback);
	        			}
	        			showalert("success",msg,'isAutoHide=true,delay=3');//NO I18N
					},
					error:function(data){
						if(data.responseJSON.response_status.messages) {
							if(data.responseJSON.response_status.messages[0].status_code==4008 && data.responseJSON.response_status.messages[0].field=="name") {
								showalert("failure",translate("common.already_exsist",[translate("sdp.common.name")]),'isAutoHide=false,delay=3');//NO I18N
							}
							if(data.responseJSON.response_status.messages[0].status_code==400) {
								showalert("failure",e_html(data.responseJSON.response_status.messages[0].message),'isAutoHide=false,delay=3');//NO I18N
							}
	        			} else if(data.responseJSON.response_status.status_code==4000 && data.responseJSON.response_status.messages[0].status_code==4009) {
	        				showalert("failure",data.responseJSON.response_status.messages[0].message,'isAutoHide=false,delay=3');//NO I18N
	        			}
					}
				});
			}
		}
		if(data.indexOf("action")>-1) {
			var notification_action={};

			//get notify cc and notify to and split it based on text and id
			jQuery.each(users,function(index, value) {
				var obj={notify_users:[],notify_org_roles:[],notify_placeholders:[]};
				for(var i=0;i<value.length;i++)
				{
					if(value[i].id.split("_")[0]=="users"){
						obj.notify_users.push({id:value[i].id.split("_")[1],name:value[i].text});
					}
					else if(value[i].id.split("_")[0]=="orgroles"){
						obj.notify_org_roles.push({id:value[i].id.split("_")[1],display_name:value[i].text});
					}
					else if(value[i].id.split("_")[0]=="placeholders"){
						obj.notify_placeholders.push({id:value[i].id.split("_")[1],display_name:value[i].text});
					}
				}
				(index=="cc") ? notification_action.notify_cc=obj : null;//NO I18N
				(index=="to") ? notification_action.notify_to=obj : null;//NO I18N
			});
			notification_action.notification_template=variableObj.newNotification;
			
			var templatearr = [];
			templatearr.push({"notification_action":notification_action});
			jQuery("#newnotification").dialog('close');//NO I18N
			if(variableObj.options.showTemplatesection) {
            	self.jQ.find("#newnotification").dialog('close').end().find("#newrule,#newnotification").parent().find(".ui-dialog-title").html(translate("common.new.label",[translate("sdp.requests.fieldFormRules.listview.rule")])).end().find("#newrule [data-id='rulePart']").removeClass('hide');
            	$ele.addClass('hide');
        	}

			funcallback(templatearr);//call back event
		}
	};
	//get to and cc for action events 
    notificationEle.prototype.getToCc = function(variableObj) {
		var users = {cc:jQuery('#emailNotification #notify_cc').select2("data"),to:jQuery('#emailNotification #notify_to').select2("data")};//NO I18N
		variableObj.email_tocc = (variableObj.email_tocc == null) ? {} : variableObj.email_tocc;
		//get notify cc and notify to and split it based on text and id
		jQuery.each(users,function(index, value) {
			var obj={notify_users:[],notify_org_roles:[],notify_placeholders:[]};
			for(var i=0;i<value.length;i++)
			{
				if(value[i].id.split("_")[0]=="users"){
					obj.notify_users.push({id:value[i].id.split("_")[1],name:value[i].text});
				}
				else if(value[i].id.split("_")[0]=="orgroles"){
					obj.notify_org_roles.push({id:value[i].id.split("_")[1],display_name:value[i].text});
				}
				else if(value[i].id.split("_")[0]=="placeholders"){
					obj.notify_placeholders.push({id:value[i].id.split("_")[1],display_name:value[i].text});
				}
			}
			(index=="cc") ? variableObj.email_tocc['notify_cc']=obj : null;//NO I18N
			(index=="to") ? variableObj.email_tocc['notify_to']=obj : null;//NO I18N
		});
	};
	//ajax function for all ajax calls
    notificationEle.prototype.ajaxCall = function(url,type,inputData) {
    	var responseResult = [];
    	sdpAjax({
			url:url,//NO I18N
			type:type,//NO I18N
			data: inputData ? {input_data:sdpToJSON(inputData)} : '',
			cache:false,
			async:false,
			success:function(response){
				responseResult = response[Object.keys(response)[1]];
			}
		});
		return responseResult;
    };
    return notificationEle;
}());
//ending code notification

/*Convert a JavaScript string in dot notation into an object reference*/
function dotObjgetval(obj, props) {
    if (!props) {
        return obj;
    }
    var propsArr = props.split('.');
    var prop = propsArr.splice(0, 1);
    return dotObjgetval(obj[prop], propsArr.join('.'));
}
