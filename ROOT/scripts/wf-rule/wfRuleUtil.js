/* Note: The below code was moved from webapps/jsapps/sdp/app/pods/admin/modules/index/business_rule/business_rule.js */

(() => {
  const Validate = require('sdp/utils/form-validation').default; //for form validation //No I18N
  let ctrl; //controller for rulesform
  $wfRuleUtil = {
  
        /* Load $wfRuleUtil properties added in other files
           1. wfRulesConfig.js
              rulesConfig object : Contains the rule configs mapped against the route-name, which are required to render rules list view & rules form page.
           2. wfTimerConfig.js
              timerConfig object : Contains the timer configs mapped against the route-name, which are required to render timer list view & timer form page.
           3. wfTimerStageRule.js
              timerStageRule object: Contains the functions used to render the timer during & after rules list view & from pages.
           4. wfTimerAction.js
              timerAction object: Contains the functions used to render the timer list view & timer form page.
        */
        ...$wfRuleUtil,

    	listviewRulesCountLoad: function(tableObjects,controller) {//Load Rules count function
    		var url = "/api/v3/"+controller.modelopt.rulesurl; //No i18n
    		$('[data-id=brloadcount]').html(ajaxBar());//rule count html element loading effect
    		var loadRec = tableObjects.visibleContents;//tabelcomponent loaded listview record
    		var tcount = [];
    		loadRec.map(function ( total, current ) {tcount.push(total.id);}, {});//loaded record get id and push to array for ajax listinfo
    		setTimeout(function() {
    			var json_data = {"search_criteria": [{"field": "group.id","values": tcount,"condition": "is","logical_operator": "and"}, {"field":"is_subrule", "value":false, "condition":"is", "logical_operator":"and"}],"group_by":["group"]}; //No i18n
    			sdpAjax({
    				url: url,
    				cache:false,
    				async:false,
    				data: sdpAjaxInputData({list_info:json_data}),
    				success:function(resp){
    					var resrules = resp[controller.modelopt.rulesurl];
    					var idobj = {};					
    					for(var i=0; i<resrules.length; i++) {
    						idobj[resrules[i].group.id] = resrules[i]["id:count"];
    					}
    					for(var i=0; i<tcount.length; i++) {
    						if(idobj[tcount[i]] == undefined) {
    							var count = 0;
    						} else {
    							var count = idobj[tcount[i]];
    						}
    						var gid = tcount[i];
    						//data-total-count attribute is used to store total rule count which is required while resetting the rule count of previously expanded rule group after a rule search
    						$('#'+controller.moduleName+'_kanban_div [data-entityid='+gid+'] [data-id=brloadcount]').html(count).attr("data-total-count", count);
    						if(count>=2) {
    							$("#org_"+gid).removeClass("hide");
    						}
    					}
    					if(tcount.length != 0) {//automaticaly open when one group section present
    						$('#'+controller.moduleName+'_kanban_div [data-entityid='+tcount[0]+'] [data-action-name=initSubEntity]').get(0).click();
    					}
    				}
    			});
    		},10);
    	},
    	delCommonfn: function(_self,opt) {//delete rules group event
    		var url = (opt == 'group') ? _self.modelopt.groupsurl : _self.modelopt.rulesurl; //No i18n
    		var tableDataObj = _self.tableObjects[_self.modelopt.groupsurl];
    		var sucmsg = translate('api.deleted.success',[_self.modelopt.keygroupname]);
    		var bulkmsg = translate("sdp.admin.rulegroup.deleted.confirm.msg",[_self.modelopt.keyrulename]);
    		if(opt == 'rule') {
    			bulkmsg = translate('sdp.admin.rules.action.confirmmsg',['<b>'+translate('sdp.common.delete')+'</b>',_self.modelopt.keyrulename]);
    			tableDataObj = _self.tableObjects[_self.modelopt.rulesurl];
    			sucmsg = translate('api.deleted.success',[_self.modelopt.keyrulename]);
    		}
    		function brformsubmit(s) {
    			if(s) {
    				var selRule = tableDataObj.bulkSelect.selectedRecords;//tablecomponent loaded list
    				var selRl = Object.keys(selRule);
    				sdpAjax({
    					url: '/api/v3/'+url+'?ids='+selRl.toString(), //No i18n
    					method: 'DELETE', //No i18n
    					cache:false,
    					async:false,
    					success:function(resp){
    						var tabObj = _self.tableObjects[_self.modelopt.groupsurl];
    						tabObj.refreshTable('refresh'); //No i18n
    						showalert('success',sucmsg,'isAutoHide=true,delay=3'); //No i18n
    					}
    				});
    			}
    		}
    		showconfirm(true,'title='+translate("common.confirm.submit.msg")+', message='+bulkmsg+', submitbutton='+translate("sdp.admin.translation.proceed")+', cancelbutton='+translate("common.no")+', closebutton=yes, closeOnEscKey=yes',brformsubmit,true); //No i18n
    	},
    	initOrganizeFun: {
    		_self: this,
    		//used to open organize dialog for business rules, custom triggers and groups.
    		openOrganizeDialog: function(indexCtrl,groupId) {
    			indexCtrl.setProperties({'orgGroupsInBRandCT': [],'organizeBRandCT': [],'st_index': 1}); //No i18n
    	        //function used to get rules and groups using ajax call
    	        this.getGroupsBrctFromAjax(indexCtrl,indexCtrl.moduleName,groupId);   
    	        //open dialog for organize popup
    			if(indexCtrl.orgGroupsInBRandCT.length>0) {
    				if($('#organize-popup').is(':visible')) {
    					$('#organize-popup').dialog('destroy');
    				}
    				var popEle = "organize-group-popup"; //No i18n
    			} else {
    				if($('#organize-group-popup').is(':visible')) {
    					$('#organize-group-popup').dialog('destroy');
    				}
    				var popEle = "organize-popup"; //No i18n
    			}
    	        //Give group title in rules popup eg. Miscellaneous - Organizing business rules
    			if(indexCtrl.organizeBRandCT && indexCtrl.organizeBRandCT.length>0) {
    				var popupTitle = indexCtrl.organizeBRandCT[0].group.name + " - " + translate("common.organize",[indexCtrl.modelopt.keyrulename]);
    			} else {
    				var popupTitle = translate("common.organize",[indexCtrl.modelopt.keygroupname])
    			}
    	        //jquery dialog
    	        jQuery("#"+popEle).dialog({
    	            width: 450,
                    resizable: false,
    				title: popupTitle,
    	            close:function(){
    	                jQuery(this).dialog("destroy"); //No I18N
    	            },
    				open: function(event,ui) {
    				    jQuery(event.target).parent().find(".ui-dialog-title").attr({"title":popupTitle,"rel":"uitip","mode_ellipsis":"true"});
    					setTimeout(function(){
    						initTooltip('.ui-dialog'); //No i18n
    					},10);
    				}
    	        });
    	        //used for sorting (re-order) rules and groups for organising 
    	        jQuery('[data-id=organizegroups] ul,[data-id=organizerules] ul').sortable({
    	            start: function(e, ui) {
    	                ui.placeholder.height(ui.item.height());
    	                ui.placeholder.css({'visibility':'visible'});//NO I18N
    	            },
    	            handle: ".drag1",//NO I18N
    	            axis: 'y',//NO I18N   
    	        });
    	    },
    	    //used to get rules and groups using ajax call
    	    getGroupsBrctFromAjax:function(indexCtrl,currModName,groupId) {
    	    	var self = this;
    	        //used to pass as input_data to get data under particular criterais
    	        var json_data = {sort_field:"order",sort_order:"asc",row_count:"100",start_index:indexCtrl.st_index}; //No i18n
    	        if(indexCtrl.modelopt.module_type != null){
    				json_data.search_criteria = [{"field":"module_type","condition":"eq","logical_operator":"and","value":indexCtrl.modelopt.module_type}]; //No i18n
    	        }
    	        else if(indexCtrl.modelopt.has_extended_module_filter){
                    var extendedModuleID = indexCtrl.extended_modules_data.filter_data.selected_filter.id;
                    // modify search criteria on organizing rules and groups whose extended module is null
                    var fieldName = "extended_module.id"; //No i18n
                    var fieldValue = extendedModuleID;
                    if(extendedModuleID == -1){
                        fieldName = "extended_module"; //No i18n
                        fieldValue = null;
                    }
                    json_data.search_criteria = [{"field":fieldName,"condition":"eq","logical_operator":"and","value":fieldValue}]; //No i18n
                }
    	        //get modulename rules/triggers under particular group
    	        if(groupId){
    	            var url = indexCtrl.modelopt.rulesurl;
    	            json_data = {"search_criteria": [{"field": "group.id","value": groupId,"condition": "is","logical_operator": "and"},{"field":"is_subrule", "value":false, "condition":"is", "logical_operator":"and"}],sort_field:"order",sort_order:"asc",row_count:"100",start_index:indexCtrl.st_index}; //No i18n
    	        }
    	        sdpAjax({
    	            url: url ? "/api/v3/"+url : "/api/v3/"+currModName, //No i18n
    	            async: false,
    	            data: sdpAjaxInputData({list_info:json_data}),
    	            success : function(response) {
    	            	//Getting API call, whenver scroll reaches the bottom of the div and "has_more_rows" is true
    	            	if(response.list_info.has_more_rows == true && response.list_info.start_index == 1){
    						indexCtrl.set('orgscrollevent',true); //No i18n
    	            		self.orgLoadingWhileScroll(indexCtrl,currModName,groupId);
    	            	} else if(!response.list_info.has_more_rows) {
    						indexCtrl.set('orgscrollevent',false); //No i18n
    					}
    	            	//store values to the controller property after getting data
    	            	var mergerdWithArr = groupId ? indexCtrl.organizeBRandCT.concat(response[url]) : indexCtrl.orgGroupsInBRandCT.concat(response[currModName]);
    	                groupId ? indexCtrl.set('organizeBRandCT',mergerdWithArr) : indexCtrl.set('orgGroupsInBRandCT',mergerdWithArr); //No i18n
    	            }
    	        });
    	    },
    	    //loading rules/groups/triggers while scroll 
    	    orgLoadingWhileScroll: function(indexCtrl,currModName,groupId) {
    	    	var self = this;
    	    	$('#organize-rule,#organize-group').off('scroll').on('scroll',function(){
    				var orgscroll = indexCtrl.get('orgscrollevent');
    	    		var divHeight = jQuery(this).scrollTop() + jQuery(this).innerHeight();
    	            var scrollHeight = jQuery(this)[0].scrollHeight;
    	            //Getting API call, whenver scroll reaches the bottom of the div and "has_more_rows" is true
    	            if(Math.abs(divHeight - scrollHeight) <= 1 && orgscroll) {
    	                indexCtrl.st_index = indexCtrl.st_index+100;
    	                self.getGroupsBrctFromAjax(indexCtrl,currModName,groupId);
    	            }
    			});
    	    },
    	    //used to save (organize) for business rules, custom triggers and groups.
    	    saveGroupsandBrct: function(indexCtrl) {
    	        var reorderFieldsArr = [], dataOrder = [], orgArrLength = indexCtrl.get('orgGroupsInBRandCT').length>0;
    	        var currOrgModObj = orgArrLength ? indexCtrl.get('orgGroupsInBRandCT') : indexCtrl.get('organizeBRandCT');
    	        var organizeList =  orgArrLength ? jQuery("[data-id=organizegroups] li") : jQuery("[data-id=organizerules] li"); 
    	     	//get all rules/groups/triggers list id's from organize after reordered 
    	        jQuery.each(organizeList,function(i,el){
    	        	var index=rlc.findIndex(currOrgModObj,el.getAttribute("data-group-id") || el.getAttribute("data-rule-id"));
    	            reorderFieldsArr.pushObject(currOrgModObj[index]);
    	        });
    	        //construct object format to update eg: {id:1,order:2} 
    	        jQuery.each(currOrgModObj,function(index,value){
    	            var obj = {"id":reorderFieldsArr[index].id,"order":value.order} //No i18n
    	            dataOrder.push(obj);
    	        });
    	        var url = orgArrLength ? indexCtrl.modelopt.groupsurl : indexCtrl.modelopt.rulesurl;
    			var splitDataOrder = dataOrder.slice(i,i+150);
    			var inputData = {};
    		        inputData[url] = dataOrder;
    		        //put or update organized data into related module 
    		        sdpAjax({
    		            type: 'PUT', //No i18n
    		            url: '/api/v3/'+url+'/_organize', //No i18n
    					data:sdpAjaxInputData(inputData),
    		            async:false,
    		            success:function(response) {
    						var tableDataObj = indexCtrl.tableObjects[orgArrLength ? indexCtrl.modelopt.groupsurl : indexCtrl.modelopt.rulesurl];
    						tableDataObj.t_obj.table_info.list_info.start_index = 1;
    						tableDataObj.refreshTable('refresh'); //No i18n
    						showalert('success', translate('common.organize.success',[indexCtrl.modelopt.keyrulename]),"isAutoHide=true"); //No i18n
    		            }
    		        });
    	        //for closing organizepopup after updated
    	        var popEle = orgArrLength ? "organize-group-popup" : "organize-popup"; //No i18n
    	        jQuery('#'+popEle).dialog('close');
    	    }
    	},
    	/*Listview kanban view cell render*/
    	/*BR, CT rules listview list render data*/
    	nameCelltransformerRulescascade: function(tableData,controller) {//BR, CT rules listview cascade dropdown 
    		var rd = tableData.row_data;
    		/*List view cascade dropdown*/
    		var nxtcasopt = rd.cascade_to_next_group;
    		var iscasopt = rd.is_cascade;
    		var casoptarr = [translate("sdp.admin.rules.execute.next.rule"),translate("sdp.admin.rules.skip.rules.this.group"),translate("sdp.admin.rules.skip.across.all.rules")];//for three cascade actions(Skip group, Execute next, Skip all)
    		var casimagecls = ["extnext","skipgroup","skipall"];//for three cascade actions object for save data //No i18n
    		if(iscasopt && nxtcasopt) {
    			var casoptid = 1;
    		} else if(iscasopt && !nxtcasopt) {
    			var casoptid = 0;
    		} else if(!iscasopt && !nxtcasopt) {
    			var casoptid = 2;
    		}
    		var resHtml = '<div class="btn-group bs-noconflict pos-abs">'
    						+'<a href="/" data-switch="sdmenu" id="list_view_option">'
    							+'<span class="cspr icon-sm cascade-'+casimagecls[casoptid]+' mr5" data-cascade="image"></span>'
    							+'<span data-cascade="val" class="text-overflow disp-ib vbottom" style="max-width: 180px;" title="'+casoptarr[casoptid]+'" rel="uitip">'+casoptarr[casoptid]+'</span><span class="caret ml5"></span>'
    						+'</a>'
    						+'<ul class="sdmenu-dd sdmenu-dd-right showmenu" aria-labelledby="list_view_option" id="cascade'+rd.id+'">'
    							+'<li><a href="/" data-action-param="'+rd.id+'" data-id="cascade" data-cascade="executenext" style="white-space: nowrap;"><span class="cspr icon-sm cascade-'+casimagecls[0]+' mr5"></span>'+casoptarr[0]+'</a></li>'
    							+'<li><a href="/" data-action-param="'+rd.id+'" data-id="cascade" data-cascade="skipgroup" style="white-space: nowrap;"><span class="cspr icon-sm cascade-'+casimagecls[1]+' mr5"></span>'+casoptarr[1]+'</a></li>'
    							+'<li><a href="/" data-action-param="'+rd.id+'" data-id="cascade" data-cascade="skipall" style="white-space: nowrap;"><span class="cspr icon-sm cascade-'+casimagecls[2]+' mr5"></span>'+casoptarr[2]+'</a></li>'
    						+'</ul>'
    					+'</div>';
    		return resHtml;
    	},
    	nameCelltransformerRulesTitle: function(tableData,controller) {//BR, CT rules listview title and description render
    		var rd = tableData.row_data;
    		var hasExtendedModule = false;
    		if(controller.parentController && controller.parentController.modelopt && !controller.parentController.modelopt.has_extended_module_filter &&controller.parentController.modelopt.has_extended_modules){
    		    hasExtendedModule = true;
    		}
    		var resHtml = '<div class="disp-t fw ti-fixed" style="table-layout: fixed;">'+
    							'<div class="text-overflow"><a href="/" data-action-param="'+rd.id+'" data-id="editRules" data-group-id="'+rd.group.id+'" class="sb text-link" title="'+e_attr(rd.name)+'" rel="uitip" mode_ellipsis="true">'+e_html(rd.name)+'</a></div>';
    
    							if(rd.description && rd.description.length>0){
                                    resHtml+='<div class="text-overflow pb10 pt5" title="'+e_attr(rd.description)+'" rel="uitip" mode_ellipsis="true">'+e_html(rd.description)+'</div>';
                                }
    
    
    
                                if(hasExtendedModule){//sdp.admin.site.refer.radio.label
                                    resHtml+='<div class="text-overflow" title="'+e_attr(rd.extended_module.display_name)+'">'+translate('applies.for',[''])+' : '+e_html(rd.extended_module.display_name)+'</div></div>';
                                }
                                else{
    						        resHtml+='</div>';
                                }
    		return resHtml;
    	},
    	nameCelltransformerRulesevent: function(tableData,controller) {//BR, CT rules listview checkbox and edit button
    		var rd = tableData.row_data;
    		return '<div class="disp-t fw ti-fixed" style="table-layout: fixed;"><input type="checkbox" class="m0 mt10 left2" id="chkbsreq'+rd.id+'" value="'+rd.id+'" templateid="'+rd.id+'" name="checkbox" data-table-checkbox="" aria-label="Rules Checkbox" data-column="brrules" data-id="'+rd.id+'"><span class="cspr icon-md edit-modern1 flat cur-ptr ml15 mt10 pos-rel left3" data-action-param="'+rd.id+'" data-id="editRules" data-group-id="'+rd.group.id+'" title="'+translate("sdp.common.edit")+'" rel="uitip"></span></div>';
    	},
    	nameCelltransformerRulesenable: function(tableData,controller) {//BR, CT rules listview enable disable html
    		var rd = tableData.row_data;
    		var chk = (rd.is_enabled) ? 'checked' : ''; //No i18n
    		var toolTipTitle = (rd.is_enabled) ? translate("common.enabled") : translate("common.disabled");	// Issue Fix - 98712
    		return '<label data-id="rulesenabled" data-action-param="'+rd.id+'" data-enable="'+rd.is_enabled+'" class="disp-iflex ml5" style="margin-top: 13px;" title="'+toolTipTitle+'" rel="uitip"><input type="checkbox" class="togglechk" '+chk+' name="radio_enable_head" id="bsradioYes'+rd.id+'" name="bsradio'+rd.id+'"><span class="slide-toggle togg-sm"><span class="switch-toggle"></span></span></label>';
    	},
    	/*BR, CT group listview list render data*/
    	nameCelltransformerGroupEvent: function(tableData,controller) {
    		var rd = tableData.row_data;
    		return '<input type="checkbox" class="m0 ml15 mt10" id="chkreq' + rd.id + '" value="' + rd.id + '"  templateid="' + rd.id + '" name="checkbox" aria-label="Group checkbox" data-table-checkbox><span class="cspr icon-md edit-modern1 flat cur-ptr clickaction ml15 mt10" title="'+translate("sdp.common.edit")+'" rel="uitip" data-action-name="loadEntityForm" data-module="' + controller.moduleName + '" data-action-param="' + rd.id + '"></span>';
    	},
    	nameCelltransformerGroupTitle: function(tableData,controller) {
    		var rd = tableData.row_data;
            // ruleurltype property if present will be set as urlname, else rulesurl will be taken. By this, the redundant ruleurltype property will be removed from all other rulesConfig except incident & service BR
    		var urlname = controller.modelopt.ruleurltype || controller.modelopt.rulesurl;
    		var btnname = translate('common.add.label',[controller.modelopt.keyformname]);
    		var siteNames = (rd.site && rd.site.length) ? rd.site.map(siteObj => siteObj.name) : null;
    		
    		//buttons (add rule, organize, rule search icon & rule search box)
    		var btn = '<button id="add_rule_' + rd.id + '" class="btn btn-default btn-xs pos-rel ml10 visi-item" data-temp-name="'+e_attr(rd.name)+'" data-id="' + rd.id + '" data-name="addRule" aria-label="Add rule"><span class="common-sprite icon-xs common-add-icon4 mr5 vtop"></span>'+btnname+'</button>'
    		            + '<button class="btn btn-default btn-xs pos-rel ml10 visi-item clickaction hide" id="org_' + rd.id + '" data-action-name="organizeBrCtInGroups" data-action-param="'+rd.id+'" aria-label="Organize"><span class="cspr sortable icon-xs mr5 vmiddle top-1"></span> '+translate('common.organize',[controller.modelopt.keyformname])+'</button>'
    		            + '<button id="rule_search_icon_' + rd.id + '" data-id="rule_search_icon_' + rd.id + '" type="button" class="btn btn-default btn-xs pos-rel ml10 visi-item" data-name="rule-search-icon" data-entityid="'+rd.id+'" aria-label="' +  translate('search.prefix', [controller.modelopt.keyrulename])  + '" title="' +  translate('search.prefix', [controller.modelopt.keyrulename]) + '"><span class="rspr flat icon-sm search1 vsub"></span></button>'
    		            + '<div id="rule_search_btn_group_' + rd.id + '" data-id="rule_search_btn_group_' + rd.id + '" class="btn-group pos-rel ml10 hide" data-name="rule-search-btn-group">'
                            + '<span class="rspr search1 icon-sm pos-abs left10 top3 opac5 cur-def"></span>'
                            + '<input id="rule_search_textinput_' + rd.id + '" data-id="rule_search_textinput_' + rd.id + '" data-name="rule-search-textinput" data-entityid="'+rd.id+'" type="text" class="form-control pl30 pr30" style="height:22px;" aria-label="' + translate('search.prefix', [controller.modelopt.keyrulename]) + '" placeholder="' +  translate('search.prefix', [controller.modelopt.keyrulename]) + '">'
                            + '<a id="rule_search_clear_' + rd.id + '" data-id="rule_search_clear_' + rd.id + '" data-entityid="'+rd.id+'" title="' + translate("sdp.common.close") + '" aria-label="' + translate("sdp.common.close") + '" href="/"  data-name="rule-search-clear" class="btn btn-link btn-xs pos-abs right2 top0 noborder"><span class="cspr close4 icon-sm opac top2"></span></a>'
                        + '</div>';
    
    		var resHtml = '<div class="clickaction cur-ptr" data-name="business_group_rules" data-action-name="initSubEntity" data-action-param="'+rd.id+'" data-stage-name="'+e_attr(rd.name)+'" data-stage-id="'+rd.id+'" data-module="'+controller.moduleName+'" data-route="'+urlname+'" style="table-layout: fixed;">'
    							+'<div class="disp-t fw ti-fixed" style="table-layout: fixed;">'
    								+'<span class="font-medium1 sb text-overflow vtop disp-ib" style="max-width: 60%;" title="'+e_attr(rd.name)+'" rel="uitip" mode_ellipsis="true">'+e_html(rd.name)+'</span>'
    								+'<span class="ml5 pos-rel">(<span id="brloadcount_' + rd.id + '" data-id="brloadcount" data-total-count=""></span>)</span>'+btn        //data-total-count is used to store total rule count of the rule group
    								+'<div class="disp-c vtop cur-ptr pl10" style="width: 40px">'
    									+'<span class="cspr icon-sm subsectionToggle circle-arrow-down"  id="subsection_'+rd.id+'_'+controller.entity_name+'" data-expand="true"></span>'
    								+'</div>'
    							+'</div>'
    							+ '<div class="text-overflow ' + (siteNames ?  rd.description  ? 'pt5 pr30' : '' : 'pt5 pb10 pr30') + '"><span title="'+e_attr(rd.description)+'" rel="uitip" mode_ellipsis="true">'+e_html(rd.description)+'</span></div>'
    							+ (siteNames ? '<div class="text-overflow pt5 pb10 pr30"><span class="text-link" data-name="rule-sites" data-entityid="'+rd.id+'" data-sites="'+e_attr(sdpToJSON(siteNames))+'">'+ translate("sdp.admin.org.technician.associatedsites") + ' (' + siteNames.length + ')' +'</span></div>' : '') //associated sites
    						+'</div>';
    		
    		return resHtml;
    	},
    	/*BR, CT group listview list render data*/
    	listviewCommonAction: function(opt, _self, id, ctrl) {//listview enable. disable, cascade (skip, excute) for single and bulk operation
    		var dataobj, bulkconfirmmsg;
    		switch (opt) {
    			case "enable": //No i18n
    				dataobj =	{ "is_enabled": true }; //No i18n
    				bulkconfirmmsg = translate('sdp.admin.rules.action.confirmmsg',['<b>'+translate('sdp.common.enable')+'</b>',ctrl.modelopt.keyrulename]);
    				break;
    			case "disable": //No i18n
    				dataobj =	{ "is_enabled": false }; //No i18n
    				bulkconfirmmsg = translate('sdp.admin.rules.action.confirmmsg',['<b>'+translate('sdp.common.disable')+'</b>',ctrl.modelopt.keyrulename]);
    				break;
    			case "skipgroup": //No i18n
    				dataobj =	{ "is_cascade": true, "cascade_to_next_group": true }; //No i18n
    				bulkconfirmmsg = translate('sdp.admin.rules.action.cascade.confirmmsg',['<b>'+translate('sdp.admin.rules.skip.rules.this.group')+'</b>',ctrl.modelopt.keyrulename]);
    				break;
    			case "executenext": //No i18n
    				dataobj =	{ "is_cascade": true, "cascade_to_next_group": false }; //No i18n
    				bulkconfirmmsg = translate('sdp.admin.rules.action.cascade.confirmmsg',['<b>'+translate('sdp.admin.rules.execute.next.rule')+'</b>',ctrl.modelopt.keyrulename]);
    				break;
    			case "skipall": //No i18n
    				dataobj =	{ "is_cascade": false, "cascade_to_next_group": false }; //No i18n
    				bulkconfirmmsg = translate('sdp.admin.rules.action.cascade.confirmmsg',['<b>'+translate('sdp.admin.rules.skip.across.all.rules')+'</b>',ctrl.modelopt.keyrulename]);
    				break;
    		}
    		var msg = translate('api.updated.success',[ctrl.modelopt.keyrulename]);
    		var reqform = ctrl.modelopt.ruleresp;
    		var json_data = {}; json_data[reqform] = dataobj;
    			
    		if(id != null && id != undefined) {//in single rules change event
    			var url = '/api/v3/'+ctrl.modelopt.rulesurl+'/'+id; //No i18n
    			this.listviewCommonAjax(url,json_data,msg);
    		} else {//in bulk rules changes events
    			var tableDataObj = _self.tableObjects[ctrl.modelopt.rulesurl];
    			var ruleArr = [];
    			$.each(tableDataObj.bulkSelect.selectedRecords, function(index, value) {ruleArr.push(index)});
    			if(ruleArr.length != 0) {
    				var url = '/api/v3/'+ctrl.modelopt.rulesurl+'?ids='+ruleArr.toString(); //No i18n
    				var _selfthis = this;
    				function bractsubmit(s) {
    					if(s) {
    						_selfthis.listviewCommonAjax(url,json_data,msg,tableDataObj);
    					}
    				}
    				showconfirm(true,'title='+translate("common.confirm.submit.msg")+', message='+bulkconfirmmsg+', submitbutton='+translate("sdp.admin.translation.proceed")+', cancelbutton='+translate("common.no")+', closebutton=yes, closeOnEscKey=yes',bractsubmit); //No i18n
    			}
    		}
    	},
    	listviewCommonAjax: function(url,json_data,msg,tableDataObj) {
    		sdpAjax({
    			url: url,
    			method: 'PUT', //No i18n
    			cache:false,
    			async:false,
    			data: sdpAjaxInputData(json_data),
    			success:function(resp){
    				showalert('success',msg,'isAutoHide=true,delay=3'); //No i18n
    				if(tableDataObj != null && tableDataObj != undefined) {
    					tableDataObj.refreshTable('refresh'); //No i18n
    				}
    			}
    		})
    	},
    	alleventgroup: function(tableObjects,controller) {
    		var _self = this;
    		$('[data-name=addRule]').off().click(function(e) {//add new service click event
    			e.preventDefault();e.stopPropagation();
    			_self.ajaxloaderfn();//ajax loading
    			var gid = $(this).attr('data-id');
    			setTimeout(function(){
    				window.location.href='/app#/admin/modules/'+controller.routeName+'/'+gid+'/newform';//No I18N
    			},500)
    		});
    	},
    	alleventrules: function(tableObjects,controller) {
    		var _self = this;
    		$('#'+tableObjects.tableId+'_div').on('click','[data-id=rulesenabled]',function(e) {
    			e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    			var opt = $(this).find('[name=radio_enable_head]').is(':checked');
    			var rulemsg = controller.parentController.modelopt.keyrulename;
    			var optmsg = (opt) ? translate('sdp.common.disable') : translate('sdp.common.enable');
    			var bulkconfirmmsg = translate('sdp.admin.rules.action.confirmmsg',['<b>'+optmsg+'</b>',rulemsg]);
    			var id = $(this).attr('data-action-param');
    			var _selfthis = $(this);
    			function bractsubmit(s) {
    				if(s) {
    					if(opt) {
    						_selfthis.attr('rel', 'uitip').attr('title',translate('common.disabled')).find('[name=radio_enable_head]').prop('checked',false); //No i18n
    						var opt1 = 'disable'; //No i18n
    					} else {
    						_selfthis.attr('rel', 'uitip').attr('title',translate('common.enabled')).find('[name=radio_enable_head]').prop('checked',true); //No i18n
    						var opt1 = 'enable'; //No i18n
    					}
    					_self.listviewCommonAction(opt1,tableObjects,id,controller.parentController);
    				}
    			}
    			showconfirm(true,'title='+translate("common.confirm.submit.msg")+', message='+bulkconfirmmsg+', submitbutton='+translate("sdp.admin.translation.proceed")+', cancelbutton='+translate("common.no")+', closebutton=yes, closeOnEscKey=yes',bractsubmit); //No i18n
    		});
    		$('#'+tableObjects.tableId+'_div').on('click','[data-id=cascade]',function(e) {
    			e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    			var id = $(this).attr('data-action-param');
    			var cascadeopt = $(this).attr('data-cascade');
    			var rulemsg = controller.parentController.modelopt.keyrulename;
    			var optmsg = (cascadeopt == 'skipall') ? translate('sdp.admin.rules.skip.across.all.rules') : (cascadeopt == 'executenext') ? translate('sdp.admin.rules.execute.next.rule') : translate('sdp.admin.rules.skip.rules.this.group'); //No i18n
    			var bulkconfirmmsg = translate('sdp.admin.rules.action.cascade.confirmmsg',['<b>'+optmsg+'</b>',rulemsg]);
    			var _selfthis = $(this);
    			function bractsubmit(s) {
    				if(s) {
    					_selfthis.closest('.btn-group').removeClass('open').find('[data-cascade=image]').attr('class',_selfthis.find('span').attr('class')); //No i18n
    					_selfthis.closest('.btn-group').find('[data-cascade=val]').html(_selfthis.text()).attr('title',_selfthis.text()); //No i18n
    					_selfthis.closest('.btn-group').find('.sdmenu-dd li').removeClass('active'); //No i18n
    					_self.listviewCommonAction(cascadeopt,tableObjects,id,controller.parentController);
    				}
    			}
    			showconfirm(true,'title='+translate("common.confirm.submit.msg")+', message='+bulkconfirmmsg+', submitbutton='+translate("sdp.admin.translation.proceed")+', cancelbutton='+translate("common.no")+', closebutton=yes, closeOnEscKey=yes',bractsubmit); //No i18n
    		});
    		$('#'+tableObjects.tableId+'_div').on('click','[data-id=editRules]',function(e) {//edit new service click event
    			e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    			_self.ajaxloaderfn();//ajax loading
    			var gid = $(this).attr('data-group-id');
    			var rid = $(this).attr('data-action-param');
    			setTimeout(function() {
    				window.location.href='/app#/admin/modules/'+controller.parentController.routeName+'/'+gid+'/'+rid;//No I18N
    			},500);
    		});
    		setTimeout(function() {
    			$(window).trigger('scroll')
    		},10);
    	},
    	listviewSubSectionPane: function(id, ele, ctrl, bulkcheckid) {//sublistview panel
    		if(ctrl.tableObjects[ctrl.moduleName].bulkSelect.getSelectedIDs().length > 0) {//Disbale bulk selection event
    			$('#bulk_unselect_'+ctrl.moduleName).trigger('click')
    		}
    		if($('[data-id=bulkrule]').length == 1) {//add rule bulk selection table component div deleted
    			$('[data-id=bulkrule]').remove();
    		}
    		$('#listcontrols').prepend('<div id="'+bulkcheckid+'" class="btn-group fl hide"  data-bulk-normal="rule" data-id="bulkrule"></div>');//add rule bulk selection table component div updated
    		
    		var search_criteria=[{"field": "group.id","value": id,"condition": "is","logical_operator": "and"},{"field": "is_subrule","value": false,"condition": "is","logical_operator": "and"}]; //No i18n
    		var cus_action = {
    			"view": "kanban", //No i18n
    			"search_criteria": search_criteria //No i18n
    		};
    		var cus_opt = {
    			"options": cus_action //No i18n
    		};
    		return cus_opt;
    	},
    	rulestoggleCheckboxfn: function(elm,controller) {//Group bulk select checkbox check event
    		var tabObj = controller.tableObjects[controller.entity_name];
    		var selectedIds = tabObj.bulkSelect.getSelectedIDs().length;
    		if (selectedIds > 0) {
    			$('#listcontrols [data-bulk-normal=true],#listcontrols [data-bulk-normal=rule]').addClass('hide');
    			$('#listcontrols [data-bulk-normal=group]').removeClass('hide');
    		} else {
    			$('#listcontrols [data-bulk-normal=true]').removeClass('hide');
    			$('#listcontrols [data-bulk-normal=group]').addClass('hide');
    		}
    		if($('#'+tabObj.tableId+'_kanban_div').find('.subsectionlist').length == 1) {//Sub section(Rule listview) listview checkbox enable/disable
    			if (selectedIds > 0) {
    				$('#'+tabObj.tableId+'_kanban_div').find('.subsectionlist').css('pointer-events','none').addClass('opac3').find('[data-table-checkbox]').prop('disabled',true); //No i18n
    			} else {
    				$('#'+tabObj.tableId+'_kanban_div').find('.subsectionlist').css('pointer-events','').removeClass('opac3').find('[data-table-checkbox]').prop('disabled',false); //No i18n
    			}
    		}
    	},
    	rulestoggleCheckboxrulesfn: function(elm,controller) {//Rule bulk select checkbox check event
    		var ruletable = controller.tableObjects[controller.modelopt.rulesurl];
    		var selectedIds = ruletable.bulkSelect.getSelectedIDs().length;
    		if (selectedIds > 0) {
    			$('#listcontrols [data-bulk-normal=true],#listcontrols [data-bulk-normal=group]').addClass('hide');
    			$('#listcontrols [data-bulk-normal=rule]').removeClass('hide');
    		} else {
    			$('#listcontrols [data-bulk-normal=true]').removeClass('hide');
    			$('#listcontrols [data-bulk-normal=rule]').addClass('hide');
    		}
    		var grouptable = controller.tableObjects[controller.modelopt.groupsurl];
    		var loadRuleGroup = grouptable.loadedRecords;//Group listview checkbox enable/disable event
    		$.each(loadRuleGroup, function( i, val ) {
    			var opt = $('#'+grouptable.tableId+'_kanban_div').find('[data-entityid='+i+'] [data-name=business_group_rules]');
    			if (selectedIds > 0) {
    				opt.closest('.row').css('pointer-events','none').addClass('opac3'); //No i18n
    			} else {
    				opt.closest('.row').css('pointer-events','').removeClass('opac3'); //No i18n
    			}
    		});
    	},
    	brulesMovecngfn: function(ctrl, val, tobj) {
    		var tableDataObj = tobj.tableObjects[tobj.modelopt.groupsurl];
    		var tableRuleDataObj = tobj.tableObjects[tobj.modelopt.rulesurl];
    		var ruleArr = [];
    		$.each(tableRuleDataObj.bulkSelect.selectedRecords, function(index, value) {ruleArr.push(index)});
    		var url = "/api/v3/"+tobj.modelopt.rulesurl+"?ids="+ruleArr.toString(); //No i18n
    		var msg = translate('api.updated.success',[tobj.modelopt.keyrulename]);
    		var json_data = {};
    			json_data[tobj.modelopt.ruleresp] = {"group":{"id":val.id}}; //No i18n
    		this.listviewCommonAjax(url,json_data,msg,tableDataObj);
    	},
    	brulesMovebtnfn: function(ctrl) {
    		var linfo = {
    			sort_field: "order", //No i18n
    			sort_order: "asc", //No i18n
    		}
    		if(ctrl.modelopt.module_type) {
    			var scri = [];
    				scri.push({condition: "eq", field: "module_type", logical_operator: "and", value: ctrl.modelopt.module_type});
    			linfo['search_criteria'] = scri;
    		}
    		if(ctrl.modelopt.has_extended_module_filter){
                var extendedModuleID = ctrl.extended_modules_data.filter_data.selected_filter.id;
                linfo.search_criteria = [{"field":"extended_module.id","condition":"eq","logical_operator":"and","value":extendedModuleID}]; //No i18n
            }
    		ctrl.set('movegroupmeta',linfo); //No i18n
    		setTimeout(function() {
    			$('#movegroup').select2('open');
    			$('#movegroup').on("select2-close", function() {
    				$("#movegrpRule .btn-group").removeClass("open")
    			});
    		},10)
    	},
        renderBRulesGroup: function(tableData,controller,tableObjects) {//BR, CT group callback event
            $wfRuleUtil.alleventgroup(tableObjects,controller);//listview table action events
            $wfRuleUtil.listviewRulesCountLoad(tableObjects,controller);//Load Rules count function
    
            //clear group search when navigating to different rule/trigger
            if(tableObjects.context.routeName != jQuery('#group-search-term').attr("data-route-name")){
                jQuery('#group-search-term').val('')
                    .attr("data-route-name", tableObjects.context.routeName)
                jQuery('#group-clear-search').addClass('hide');
            }
    
            //hide organize & move group buttons during group-search or when rule/trigger count is <= 1
            (tableObjects.visibleContents.length>1 && jQuery("#group-search-term").val() == '') ? $("#organize_groups,#movegrpRule").show() : $("#organize_groups,#movegrpRule").hide();
    
            // this boolean when set true will display brGroup-Site association info alert message in incident & service br list view page. This boolean is set based on the presence of site field in metainfo.
            controller.set('isSiteAssociationPresent', tableObjects && tableObjects.t_obj && tableObjects.t_obj.available_minfo_fields && tableObjects.t_obj.available_minfo_fields.site); //No i18n
    
            jQuery('.listcontrols [data-bulk-normal=true]').removeClass('hide');
            jQuery('.listcontrols [data-bulk-normal=rule],.listcontrols [data-bulk-normal=group]').addClass('hide');
    
            //rule search icon click event handler
            jQuery('[data-name="rule-search-icon"]').on('click', function(e) {
                var gid = jQuery(this).attr("data-entityid");
                var oldGid = jQuery("#" + controller.moduleName + "_kanban_div > .subsectionlist").attr("data-id");
                //if group is already expanded and search icon is clicked, need not collapse the group
                if(gid == oldGid) {
                    e.stopPropagation();
                }
                //hide addRule, organize and rule search buttons
                jQuery('#add_rule_' + gid).addClass('hide');
                jQuery('#org_' + gid).addClass('hide');
                jQuery('#rule_search_icon_' + gid).addClass('hide');
                //unhide rule search box and set focus
                jQuery('#rule_search_clear_' + gid).attr({
                    'data-action-param': 'close', //No i18n
                    'title': translate('sdp.common.close'), //No i18n
                    'aria-label': translate('sdp.common.close') //No i18n
                });
                jQuery('#rule_search_btn_group_' + gid).removeClass('hide');
                jQuery('#rule_search_textinput_' + gid).val('').trigger('focus');
            });
    
            //stop propagation on clicking rule search button group
            jQuery('[data-name="rule-search-btn-group"]').on('click', function(e) {
                e.stopPropagation();
            });
    
            //rule search
            jQuery('[data-name="rule-search-textinput"]').on('keyup', function(e) {
                var gid = jQuery(this).attr("data-entityid");
               $wfRuleUtil.searchGroupsListView(false, controller.tableComp, jQuery(this), jQuery('#rule_search_clear_'+ gid), gid);
            });
    
            //clear rule search
            jQuery('[data-name="rule-search-clear"]').on('click', function(e) {
               var gid = jQuery(this).attr("data-entityid");
               var actionParam = this.getAttribute("data-action-param");
               if(actionParam == 'close') {
                    //hide the rule search box
                    $wfRuleUtil.hideRuleSearchbox(gid);
               } else if(actionParam == 'text-clear') { //No i18n
                   //clear the search text and set action param as close
                    jQuery('#rule_search_textinput_'+ gid).val('');
                    jQuery('#rule_search_clear_'+ gid).attr({
                        'data-action-param': 'close', //No i18n
                        'title': translate('sdp.common.close'), //No i18n
                        'aria-label': translate('sdp.common.close') //No i18n
                    });
               } else {
                    //else clear the search
                    $wfRuleUtil.searchGroupsListView(true, controller.tableComp, jQuery('#rule_search_textinput_'+ gid), jQuery(this), gid);
               }
               e.preventDefault(); //Href Navigation Stopped
               e.stopPropagation();
            });
    
            //display associated sites list for the request rule group
            jQuery('[data-name="rule-sites"]').on('click', function(e) {
                var self = jQuery(this);
                var gid = self.attr("data-entityid");
                var oldGid = jQuery("#" + controller.moduleName + "_kanban_div > .subsectionlist").attr("data-id");
                //if group is already expanded and Associated Sites link is clicked, need not collapse the group
                if(gid == oldGid) {
                    e.stopPropagation();
                }
                var siteNames = JSON.parse(self.attr("data-sites"));
                var sitesHtml = siteNames.map(siteName => "<li class='text-wrap'>" + e_html(siteName) + "</li>");
                var dialog=jQuery('#associatedSitesDialog').dialog({
                    'draggable':false,// No I18N
                    'autoOpen':true,// No I18N
                    show: {
                        effect:'fade',// No I18N
                    },
                    'title': translate("sdp.admin.org.technician.associatedsites") + ' (' + siteNames.length + ')',// No I18N
                    'position': { my: "center top", at: "center top+50", of: window },// No I18N
                    'width': 400, //No i18n
                    'modal':true,// No I18N
                    open: function(event,ui){
                        jQuery(this).find("ul").html(sitesHtml);
                        jQuery(this).next(".ui-dialog-buttonpane").find(".ui-dialog-buttonset").addClass("tc"); // No i18n
                    },
                    buttons: [
                        {
                            text: translate('remove.all'),
                            class: 'btn btn-primary', // No i18n
                            click: function(){
                                $wfRuleUtil.updateSiteDataForRuleGroup(gid, 'associatedSitesDialog', controller.tableObjects.request_business_rule_groups); // No i18n
                            }
                        }
                    ]
                });
            });
        },
        renderBRulesRules: function(tableData,controller,tableObjects) {//BR, CT rules callback event
            $wfRuleUtil.ajaxloaderfn();//ajax loading
    
            $wfRuleUtil.alleventrules(tableObjects,controller);//listview table action events
    
            $wfRuleUtil.ajaxloaderfn(true);//stop ajax loading
        },
    	ajaxloaderfn: function(loadClose,callbackAfterRender) {
    
    	    if($('[data-popup=active]').get(0)){//For timer rules popup
    	        var popupElement = $('[data-popup=active]');
                if(loadClose) {
                    popupElement.removeClass('pos-rel').find('#popup_loader').html('');//page loading remove
                    return false;
                }
    	        var ajaxbar = '<div class="loading1" style="z-index:1;top: 45%;">' + //No I18N
                                                        '<div class="loading-bar1"></div>' +    //No I18N
                                                        '<div class="loading-bar1"></div>' +    //No I18N
                                                        '<div class="loading-bar1"></div>' +    //No I18N
                                                        '<div class="loading-bar1"></div>' +    //No I18N
                                                    '</div>'+
                                                    '<div class="freezeLayer fw fh bgwhite" style="z-index: 99;"></div>';
                popupElement.addClass('pos-rel').find('#popup_loader').append(ajaxbar);//ajax loading
    	    }
    	    else{
                if(loadClose) {
                    $('#content-inner .content-section').removeClass('pos-rel').find('#freezeload').html('');//page loading remove
                    return false;
                }
    		    $('#content-inner .content-section').addClass('pos-rel').find('#freezeload').append(ajaxBar()).append('<div class="freezeLayer fw fh bgwhite" style="z-index: 99;"></div>');//ajax loading
    		}
    		if(callbackAfterRender){
    		    setTimeout(function() {
                    callbackAfterRender();
                },300);
    		}
    	},
    	/* returns actual model data required for rendering rules. Moved from rulesform/route.js to reuse it in timeractions.
    	* @param routeName
    	* @param controller
    	* @param params - url params
    	* @param redirectToFn - a callback to use after submit, cancel or back buttons.
    	* @param forExtendedModuleRefresh - boolean to indicate if this method is used for refreshing the page when extended module dropdown value is changed. Eg. from User to Technician.
    	*/
    	getModelForRule: function(routeName,controller,params,redirectToFn,forExtendedModuleRefresh){
    
        ctrl = controller;
        var depFieldsList =  ["script","execute_class","custom_function"]; //No i18n
        controller.set('changegroupShow',false);//Change edit dropdown event hide in load //No i18n
        controller.set('url_params',params); //No i18n
        var ruledata = this.getMetaInfoRules(routeName,params,controller,forExtendedModuleRefresh);//get all api format
        ruledata.firstmet=false;
        if(params.rid == 'newform') {
            //set fieldcriteria as the default criteria for new rule or trigger
            ruledata.showFieldCriteria = true;
        } else {
            var dataevent = ruledata.options.events;
            if(dataevent!=null)
            {
             for(var i=0; i<dataevent.length; i++) {//if execute action 'edit' event selected the enable firstmet radio option in criteria section
                        if(dataevent[i].name == 'edited') {
                            ruledata.firstmet = true;
                        }
                    }
            }
            var actlen = ruledata.options.actions;
            if(actlen.length != 0) {//for custom actions option count add for edit form
                for(var i=0; i<actlen.length; i++) {
                    if(actlen[i].type == "sub_rules"){
                        ruledata.custom_actions[actlen[i].sub_type].count = parseInt(ruledata.custom_actions[actlen[i].sub_type].count) + 1;
                        //custom action option count for subrules for edit form
                        this.updateSubrulesCusActCount(actlen[i],depFieldsList);
                    }else{
                        ruledata.custom_actions[actlen[i].type].count = parseInt(ruledata.custom_actions[actlen[i].type].count) + 1;
                    }
                    if(depFieldsList.includes(actlen[i].type)) {
                        for(var j=0; j<depFieldsList.length; j++) {
                            if(depFieldsList[j] != actlen[i].type && ruledata.custom_actions[depFieldsList[j]] != undefined) {
                                ruledata.custom_actions[depFieldsList[j]].count = parseInt(ruledata.custom_actions[depFieldsList[j]].count) + 1;
                            }
                        }
                    }
                    //When any of if-if or if-else is selected, conditional action can be hidden
                    //and when conditional action is selected, if-if and if-else will be hidden
                    if((actlen[i].sub_type == 'if_if' || actlen[i].sub_type == 'if_else') && ruledata.custom_actions['conditional_action'] != undefined){
                        ruledata.custom_actions['conditional_action'].count = ruledata.custom_actions['conditional_action'].total;
                    }else if(actlen[i].sub_type == 'conditional_action'){
                        if(ruledata.custom_actions['if_if'] != undefined) { ruledata.custom_actions['if_if'].count = ruledata.custom_actions['if_if'].total; }
                        if(ruledata.custom_actions['if_else'] != undefined) { ruledata.custom_actions['if_else'].count = ruledata.custom_actions['if_else'].total; }
                        ruledata.cf_count = ruledata.cf_count - 1; //decrementing cf_count as conditional action is added
                    }
                }
            }
            //select appropriate criteria option for existing rules/triggers
            if(ruledata.options.criteria != null && ruledata.options.criteria.length > 0) {
                ruledata.showFieldCriteria = true;
            } else if(ruledata.options.criteria_custom_function != null) {
                ruledata.showCFCriteria = true;
            } else {
                if(ruledata.isEmptyCritAllowed) {
                    ruledata.showNoCriteria = true;
                } else {
                    // for problem ct, condition mandate can be enabled / disabled by modifying IS_EMPTY_CRIT_ALLOWED globalconfig param.
                    // hence for a rule previously created with 'no condition' but now condition is required, field criteria will be shown.
                    ruledata.showFieldCriteria = true;
                }
            }
        }
    
        controller.set("rdata",ruledata); //No i18n
        controller.set("redirectToFn",redirectToFn); //No i18n
    
        var _self = this;
        Ember.run.schedule('afterRender', this, function () { //No i18n
            $wfRuleUtil.ajaxloaderfn();
            setTimeout(function(){
            if(params.rid != 'newform') {//in edit form execute action 'Edited' options selected than special format criteria updated
                if(dataevent!=null && dataevent.length == 1 && dataevent[0].name == 'edited') {
                    initTooltip('[data-name=first-met-criteria]');
                    ruledata.all_criteria['havePreviousValue'] = true;
                    ruledata.all_criteria['specialFormats'] = ["have_none","is_changed","is_not_changed"]; //No i18n
                    ruledata.all_criteria.dateCustomize.date_conditions[0].children.pushObjects(controller.editedEventDateConditions);
                    controller.initSubRuleCriteria(ruledata,true,controller);
                }
            }
            var extended_modules_select2 = controller.get('extended_modules_data.extended_modules_select2');//Disabling dropdown for edit page or if there is only one value in the list.
            var options = _self.rulesConfig[routeName];
            if(params.rid != 'newform' || options.has_extended_module_filter || (extended_modules_select2!=null&& extended_modules_select2.length==1)){
                $('#extended_module').prop('disabled',true);
            }
            $("#rule_criteria").custom_filter(ruledata.all_criteria);//custom filter full api formate call
    
    
            //Execute action select2
            if(ruledata.modelopt.include_events){
                $('#exeAction').select2({
                    data: ruledata.execute_actions,
                    multiple: true,
                    placeholder: translate('sdp.searchitem.select',[translate('sdp.execute.actions')]),
                    sortResults: function(results, container, query) {
                        results = _self.actioncombination(results); // to restrict 'Execute on action' selection combinations. //No i18n
                        return results;
                    },
                    formatNoMatches: translate("common.no.match.found"), //No I18N
                    formatResult: function(resp) {
                        if(resp.disabled) {
                            var html = '<span rel="uitip" title="'+translate("sdp.admin.rules.combining.infomessage")+'">'+e_html(resp.text)+'</span>';
                        } else {
                            var html = '<span>'+e_html(resp.text)+'</span>';
                        }
                        return html;
                    }
                }).on("select2-selecting", function(e) {
                    controller.exeacttionSelectfn('add',e.choice);//rule criteria special format apply //No i18n
                }).on("select2-removed", function(e) {
                    controller.exeacttionSelectfn('delete',e.choice);//rule criteria special format apply //No i18n
                }).on('select2-focus', function(e) {
                    setTimeout(function(){
                        initTooltip('.select2-results'); //No i18n
                    },10);
                });
                $('#exeAction').prev().find(".select2-search-field").css("width", "auto");//for select2 alignment //No i18n
            }else
             {
               $('#executeOnActions').hide();
             }
    
            setTimeout(function() {
                if(params.rid != 'newform') {
                    if(ruledata.modelopt.include_events){
                      $('#exeAction').select2('data',ruledata.options.events);//update exeAction select2
                    }
                    $("#rule_criteria").custom_filter('update',ruledata.options.criteria);//update the custom filter option based for edit form
                } else if (ruledata.modelopt.include_events){
                    $('#exeAction').select2('data',ruledata.default_execute_actions);//update exeAction select2
                }
    
                if(!forExtendedModuleRefresh){ //Below code need not execute every time extended module is changed from UI.
                    var formele = {//from validation
                        "elementId": "brrules" //No i18n
                    };
                    if(routeName.indexOf('pre_rules') !== -1 || routeName.indexOf('post_rules') !== -1){
                       formele['noScroll']=true;
                    }
                    Validate.intialize(formele);
    
                    if(routeName.indexOf('pre_rules') == -1 && routeName.indexOf('post_rules') == -1){
                        fixedformfooter(document.querySelector('[name=brrules]'),document.querySelector('[name=brrules] .submit-row'));// No I18N
                    }
    
                    charCounter.init();
                }
                $wfRuleUtil.ajaxloaderfn(true);
    
            },10);
            },200);
        });
        if($('#newnotification #emailNotification').length == 1) {//notification template popup empty on page load
            // fix for notification popup not displayed again on 'save & add new' & reopening it after visiting list view page issue
            $('[aria-describedby=newnotification]').remove()
        }
        return {};
    	},
    	/* Method to initialize extended modules allowed values
    	*@param moduleopt - business rules config moduleopt
    	*@param params - has info about ruleid, groupid etc.
    	*@param metaInfo  - rules metainfo
    	*@param controller - rulsform controller
    	*/
    	initExtendedModules: function(moduleopt,params,metaInfo,controller){
    	    if(moduleopt.has_extended_modules&& !(moduleopt.rule_type == 'pre_rules' || moduleopt.rule_type == 'post_rules')){//No need to initialize extended module for pre and post rules, can be taken from timer form page
    
               var extended_modules;
               var extendedModulesListInfoData = {"sort_field":"id"}; //No i18n
               sdpAjax({
                  url: "/api/v3"+metaInfo.extended_module_href, // No I18N
                  data: sdpAjaxInputData({list_info:extendedModulesListInfoData}),
                  cache:false,
                  async: false,
                  success: function(data) {
                      extended_modules = data["extended_module"];
                  }
               });
                var extended_modules_data = controller.get('extended_modules_data');
                // to get entity name in the applies for filter whose extended_module set as null
                if(moduleopt.baseModuleConfig){
                    extended_modules.addObject(moduleopt.baseModuleConfig);
                }
                Ember.set(extended_modules_data,'extended_modules',extended_modules); //No i18n
                Ember.set(extended_modules_data,'extended_modules_select2',extended_modules.map(function(val){return {"id":val.id,"name":(val.display_name)?val.display_name:val.name}})); //No i18n
            }
    	},
    	// below member lists the route names for which MSP/SCP specific handling is required
            mspHandledMetaInfoRouteNames: ['businessrules', 'servicecatalogbrules', 'customtriggers', 'request_pre_rules', 'request_post_rules', 'request_post_rules', 'notebusinessrules', 'notecustomtriggers', 'notificationbusinessrules', 'notificationcustomtriggers', 'approvallevelcustomtriggers', 'approvalcustomtriggers'], //No i18n
    	/* Returns metainfo, rule data. Method moved from rulesform/route.js to reuse it in timeractions
    	* @param routeName
    	* @param controller
    	* @param forExtendedModuleRefresh - boolean to indicate if this method is used for refreshing the page when extended module dropdown value is changed. Eg. from User to Technician.
    	* INFO: When any changes done to rule metainfo has to be reflected in subrules also, kindly add the changes in this method
    	*/
        getMetaInfoRules: function(routeName,params,controller,forExtendedModuleRefresh) {
            var metaInfo = {
                'routeName': routeName, //No i18n
                'ruleid': params.rid, //No i18n
                'groupid': params.gid, //No i18n
            };
            var options = this.rulesConfig[routeName];
            metaInfo['modelopt'] = options;
            if(options.groupsurl!=null)
            {
               var group;
               sdpAjax({
                  url: "/api/v3/"+options.groupsurl+"/"+params.gid, // No I18N
                  cache:false,
                  async: false,
                  success: function(data) {
                      group = data[options.groupsresp];
                      // this boolean when set true will display brGroup-Site association info alert message in incident & service rule form page
                      metaInfo.isSiteAssociationPresent = group && group.site && group.site.length;
                  }
               });
            }
            /*Meta info start*/
            var json_data = (options.module_type == null) ? {} : {"module_type":options.module_type}; //No i18n
            if(options.has_extended_module_filter && options.groupsurl!=null){
                // for entities whose extended_module is null, set appropriate extended module
                if(group.extended_module != null){
                    json_data = {"extended_module":group.extended_module.name}; //No i18n
                }
                else{
                    json_data = {"extended_module":null}; //No i18n
                }
            }
            else if(!options.has_extended_module_filter && controller.extended_modules_data && controller.extended_modules_data.selected_extended_module){
                json_data = {"extended_module":controller.extended_modules_data.selected_extended_module.name}; //No i18n
            }
    
            var allmetainfo = {};
             var metaURL= "/api/v3/"+options.rulesurl+"/_metainfo"; //No i18n
    
            if(params.rid && params.rid != 'newform') {
                metaURL = "/api/v3/"+options.rulesurl+"/"+params.rid+"/_metainfo"; //No i18n
            }
            sdpAjax({
                url: metaURL,
                data: sdpAjaxInputData(json_data),
                cache:false,
                async: false,
                success: function(resp) {
                    allmetainfo = resp.metainfo;
                    var cusactfield = allmetainfo.fields.actions.fields;
                    var cusact={};
                    var cf_count = 0;
                    var dependentActionCount = 0;
                    if(cusactfield.field_update) {//maximum 2 count
                        cusact['field_update'] = {'name': translate("sdp.admin.fieldupdate"),'count': 0,'total': 2}; //No i18n
                        cf_count += cusact['field_update'].total;
                    }
                    if (cusactfield.set_sla && options.module_type == "service_request") {//maximum 1 count
                        cusact['set_sla'] = {'name': translate("sla.select"),'count': 0,'total': 1}; //No i18n
                        cf_count += cusact['set_sla'].total;
                    }
                    if(cusactfield.notification_action) {
                        cusact['notification'] = {'name': translate("notification.action"),'count': 0,'total': options.notifiCount}; //No i18n
                        cf_count += cusact['notification'].total;
                    }
                    if(cusactfield.custom_function) {//maximum 1 count
                        cusact['custom_function'] = {'name': translate("dre.custom.function"),'count': 0,'total': 1}; //No i18n
                        dependentActionCount += cusact['custom_function'].total;
                    }
                    if(cusactfield.script_action) {//maximum 1 count
                        cusact['script'] = {'name': translate("sdp.admin.rule.ruleaction.executescript"),'count': 0,'total': 1}; //No i18n
                        if(options.execute_class) {
                            cusact['execute_class'] = {'name': translate("sdp.request.externalaction.executor.class"),'count': 0,'total': 1}; //No i18n
                        }
                        if(dependentActionCount == 0){
                            dependentActionCount += cusact['script'].total;
                        }
                    }
                    cf_count += dependentActionCount;
    
                    if(cusactfield.negate_action) {//maximum 1 count
                        cusact['negate'] = {'name': translate("sdp.admin.negateaction"),'count': 0,'total': 1}; //No i18n
                    }
                    if(cusactfield.webhook) {//maximum 1 count
                        cusact['webhook'] = {'name': translate("common.webhook"),'count': 0,'total': 1}; //No i18n
                        cf_count += cusact['webhook'].total;
                    }
    
    
                    metaInfo['sub_rule_cf_count'] = cf_count;
    
                    if (cusactfield.sub_rules && cusactfield.sub_rules.sub_type) {
                        dependentActionCount = 0;
                        if(cusactfield.sub_rules.sub_type.includes('IF_IF')){
                            cusact['if_if'] = { 'name': translate("common.if")+"-"+translate("common.if"), 'count': 0, 'total': 1 }; //No i18n
                            dependentActionCount += cusact['if_if'].total;
                        }
                        if(cusactfield.sub_rules.sub_type.includes('IF_ELSE')){
                            cusact['if_else'] = { 'name': translate("common.if")+"-"+translate("common.else"), 'count': 0, 'total': 1}; //No i18n
                            dependentActionCount += cusact['if_else'].total
                        }
                        if(cusactfield.sub_rules.sub_type.includes('CONDITIONAL_ACTION')){
                            cusact['conditional_action'] = { 'name': translate("conditional.action"), 'count': 0, 'total': 1}; //No i18n
                            if(dependentActionCount == 0){
                                dependentActionCount += cusact['conditional_action'].total
                            }
                            }
                        cf_count += dependentActionCount;
                        }
                    metaInfo['cf_count'] = cf_count;
                    metaInfo['custom_actions'] = cusact;
                    metaInfo['criteria_href'] = allmetainfo.fields.criteria.href;
                    metaInfo['extended_module_href'] = allmetainfo.fields.extended_module.href;
                    metaInfo['field_update_href'] = (allmetainfo.fields.actions.fields.field_update)?allmetainfo.fields.actions.fields.field_update.href:null;
                    metaInfo.isCFCritAllowed = allmetainfo.fields.hasOwnProperty('criteria_custom_function');//ccf criteria is allowed only if criteria_custom_function field is present in metainfo //No i18n
                    if(window.checkIfSCP() && !sdp_app.IS_AUTOMATION_BUNDLE_ENABLED) {
                        // Custom Functions is based on Automation Bundle license for SCP.
                        // This handling needs to be done in MetaInfo API itself in server. Doing it temporarily here
                        metaInfo.isCFCritAllowed = false;
                    }
                    metaInfo.isEmptyCritAllowed = allmetainfo.fields.criteria.allow_empty ? allmetainfo.fields.criteria.allow_empty : false ;//empty criteria is allowed only if criteria field's allow_empty property is set as true in metainfo
                }
            });
            /*Meta info end*/
            var search_module = options.cf.module;
            if ('cm_base' == search_module && json_data.extended_module) {
                search_module = json_data.extended_module;
                //ext module display name for info message under actions 'When <ext module> arrives'
                metaInfo.modelopt.keyModuleName = (options.groupsurl!=null)?e_html(group.extended_module.display_name):e_html(controller.extended_modules_data.selected_extended_module.display_name);
            }
            /*conditional custom functions list info & properties*/
            metaInfo.ccfListInfo = {"search_criteria":[{"condition":"eq","field":"module.name","logical_operator":"and","value":search_module},{"condition":"eq","field":"function_type","logical_operator":"and","value":"conditional"},{"condition":"eq","field":"is_active","logical_operator":"and","value":true}]}; //ccf select2 listinfo //No i18n
            metaInfo.isSelectedCcfInactive = false;   //boolean to track if selected ccf is inactive
            metaInfo.isCcfListEmpty = null;  //boolean when set true hides the ccf select2 and displays no ccf available. Initially set as null - value can be set using ccf GET ALL call only when ccf radio button is clicked.
    
            /*available custom funtion start*/
            var json_data1 = {"search_criteria":[{"condition":"eq","field":"module.name","logical_operator":"and","value":search_module},{"condition":"eq","field":"function_type","logical_operator":"and","value":"customaction"},{"condition":"eq","field":"is_active","logical_operator":"and","value":true}]} //No i18n
            if(!window.checkIfSCP() || sdp_app.IS_AUTOMATION_BUNDLE_ENABLED) {
                // this block is always executed for SDP. // Custom Functions is based on Automation Bundle license for SCP
                sdpAjax({
                    url: "/api/v3/custom_functions", // No I18N
                    data: sdpAjaxInputData({list_info:json_data1}),
                    cache:false,
                    async: false,
                    success: function(resp) {
                        var cuf = resp.custom_functions;
                        var cuf_arr = [];
                        for(var i=0; i<cuf.length; i++) {
                            cuf_arr.push({"id": cuf[i].id,"text": cuf[i].name});
                        }
                        metaInfo.custom_functions = resp.custom_functions;
                        metaInfo.custom_functions_criteria = json_data1;
                        metaInfo.custom_functions_disable = true;
                    }
                });
            }
            var key_mapping={
        		"requests":"request", //No i18n
        		"changes":"change", //No i18n
        		"problems":"problem", //No i18n
        		"tasks":"task", //No i18n
        		"projects":"project", //No i18n
        		"release":"release" //No i18n
        	}
            var json_data_webhook = {"search_criteria":[{"condition":"eq","field":"service.name","logical_operator":"and","value":"webhooks"},{"condition":"is","field":"is_active","logical_operator":"and","value":"true","logical_operator":"and"},{"condition":"is","field":"module","logical_operator":"and","value":key_mapping[options.module],"logical_operator":"and"}],row_count:100}; //No i18n
            if(key_mapping[options.module]==undefined) {
                metaInfo['webhook'] = [];
                    metaInfo['webhook_criteria'] = json_data_webhook;
            }
            else{
            sdpAjax({
                url: "/api/v3/app_service_actions", // No I18N
                data: sdpAjaxInputData({list_info:json_data_webhook}),
                cache:false,
                async: false,
                success: function(resp) {
                    var cuf = resp.app_service_actions;
                    var cuf_arr = [];
                    for(var i=0; i<cuf.length; i++) {
                        cuf_arr.push({"id": cuf[i].id,"text": cuf[i].name});
                    }
                    metaInfo['webhook'] = cuf_arr;
                    metaInfo['webhook_criteria'] = json_data_webhook;
                }
            });
            }
            /*available custom funtion reles end*/
    
             if(options.include_events)
             {
                var eventHref = allmetainfo.fields.events.href;
                var eventInputData = null;
                if(eventHref.split('?').length>1){
                    eventInputData = sdpAjaxInputData(JSON.parse(eventHref.split('?')[1].split('=')[1]));
                    eventHref = eventHref.split('?')[0];
                }
                 /*Execute on actions start*/
                sdpAjax({
                    url: "/api/v3"+eventHref, // No I18N
                    cache:false,
                    async: false,
                    data: eventInputData,
                    success: function(resp) {
                        var eveObj = resp.events;
                        var eveArr = [];
                        var defaultSel={"id":eveObj[0].id,"text":eveObj[0].display_name,"name":eveObj[0].name}
                        for(var i=0; i<eveObj.length; i++) {
                            //SD-99145 - Populating name field also in select2 data to send details to server
                            // The defaultEvent property is configured in the rulesConfig. By default it is set as 'created' event. Hence eveObj[i].name=="created" check can be removed, which will also prevent any logical errors that may occur in case the created event occurs after the defaultEvent while looping.
                            if(eveObj[i].name === options.defaultEvent)
                            {
                                defaultSel = {"id":eveObj[i].id,"text":eveObj[i].display_name,"name":eveObj[i].name};
                            }
                            eveArr.push({"id":eveObj[i].id,"text":eveObj[i].display_name,"name":eveObj[i].name});
                        }
                        metaInfo['default_execute_actions']=defaultSel;
                        metaInfo['execute_actions'] = eveArr;
                    }
                });
                /*Execute on actions end*/
             }
            /*criteria start*/
            var _self = this;
            var critHrefParams = metaInfo.criteria_href.split('?')[1].split('=');
            sdpAjax({
                url: "/api/v3"+metaInfo.criteria_href.split('?')[0], //No i18n
                skipSUBREQUEST: true,
                cache:false,
                async:false,
                data: sdpAjaxInputData(JSON.parse(critHrefParams[1])),
                success:function(resp) {
                    var criField = resp.metainfo.fields;
    
                    function reconstructMetaInfo(fields){
                        for (var i in fields) {
                            if(fields[i].type&&fields[i].type == 'double') {
                                fields[i].type = 'decimal';
                            }
                            if(fields[i].read_only) {
                                fields[i].read_only = false;
                            }
                            if(fields[i].fields){
                                reconstructMetaInfo(fields[i].fields)
                            }
                        }
                    }
    
                    reconstructMetaInfo(criField);
    
                    var dollarVarInCrit = {//custom_filter add loggedinuser
                       "$_user": {"fields":["requester", "technician", "on_behalf_of", "editor", "created_by","reported_by"], "option":{"id":"$(current_user)", "text": "$"+translate("sdp.common.loggedinuser")}}, //No i18n
                        "$_group": {"fields":["group"], "option":{"id":"$(my_group)", "text":"$"+translate("sdp.requests.listview.allmyqueues")}} //No i18n
                    }
                    if(metaInfo.routeName.indexOf('pre_rules') !== -1 || metaInfo.routeName.indexOf('post_rules') !== -1)
                    {
                        dollarVarInCrit ={};
                    }
                    //**IMPORTANT** -- When setting any criteria callback functions, need to set the same for Subrule criteria metainfo in sub-rules/component.js -- initialize(), didRender()
                    //Reason: In action component cloning is done, which removes callback functions reference.
                    var cri_options = {
                        metainfo: resp.metainfo.fields,
                        haveNestedColumns: true,
                        innerCriteriaEnabled: true,
                        enableDragHandle: true,
                        innerCriteriaClass: "innerCriteriaRule",
                        cacheData: false,
                        notMandatory: true,
                        haveMultiString: true,
                        includeSubFields: ["closure_info","resolution","resources","current_scheduled_timer","cm_fields"],
                        haveRepeatedValues: true,
                        havePreviousValue: false,
                        haveDependentRules: true,
                        clrSelect2Cache: true,
                        maxrows: 50,
                        specialFormats: ["have_none"],
                        dollarSupport: dollarVarInCrit,
                        allowed_value: {"callback": _self.criteriacallback},
                        fieldTypeConditions: {
                            "status":["is", "is_not"],
                            //"site":["is", "is_not"],
                            "template":["is", "is_not"],
                            "created_by":["is", "is_not"],
                            "requester":["is", "is_not"],
                            "subject":["is", "is_not", "contains", "not_contains", "starts_with", "ends_with"],
                        },
                        changeURLData: _self.criteriaURLcallback,
                        defSubFields: ["current_user","request","approval_level","approval_level.request"],
                        ignoreNoneFields: ["created_by","status","template","requester"],
                        typeOverride : {"datetime":"date"},//No I18N
                        dateCustomize : {
                            "date_conditions": [
                                {
                                    "name":"date",
                                    "display_name":translate("sdp.common.date"),
                                    "children":[
                                        {"id":"on", "text":translate("sdp.condition.13")},
                                        {"id":"not on", "text":translate("sdp.condition.not.on")},
                                        {"id":"before", "text":translate("sdp.condition.15")},
                                        {"id":"after", "text":translate("sdp.condition.14")},
                                        {"id":"on or before", "text":translate("sdp.condition.on.before")},
                                        {"id":"on or after", "text":translate("sdp.condition.on.after")},
                                        {"id":"is empty", "text":translate("sdp.admin.rule.addrule.condition.isempty")},
                                        {"id":"is not empty", "text":translate("sdp.admin.rule.addrule.condition.isnotempty")},
                                        {"id":"between", "text":translate("sdp.criteria.26")},
                                        {"id":"not between", "text":translate("common.notbetween")}
                                    ]
                                },
                                {
                                    "name":"dur",
                                    "display_name":translate("admp.duration"),
                                    "children":[
                                        {"id":"dur.on", "text":translate("sdp.condition.13"), "type":"dateSelect"},
                                        {"id":"dur.not on", "text":translate("sdp.condition.not.on"), "type":"dateSelect"},
                                        {"id":"dur.before", "text":translate("sdp.condition.15"), "type":"dateSelect"},
                                        {"id":"dur.after", "text":translate("sdp.condition.14"), "type":"dateSelect"},
                                        {"id":"dur.on or before", "text":translate("sdp.condition.on.before"), "type":"dateSelect"},
                                        {"id":"dur.on or after", "text":translate("sdp.condition.on.after"), "type":"dateSelect"}
                                    ]
                                }
                            ],
                            "date_placeholders": [
                                {"id":"$(today)", "text":translate("sdp.common.today")},
                                {"id":"$(yesterday)", "text":translate("sdp.common.yesterday")},
                                {"id":"$(last_month)", "text":translate("sdp.common.lastmonth")},
                                {"id":"$(this_month)", "text":translate("sdp.common.thismonth")},
                                {"id":"$(last_week)", "text":translate("sdp.common.lastweek")},
                                {"id":"$(this_week)", "text":translate("sdp.common.thisweek")}
                            ]
                        }
                    };
                    if(options.module == 'problems') {
                        cri_options.defSubFields = ["root_cause","symptoms","impact_details"];
                        cri_options.fieldTypeConditions = {
                            "status":["is", "is_not"],
                            "root_cause.description":["is", "is_not", "contains", "not_contains", "is_empty", "is_not_empty"],
                            "symptom.description":["is", "is_not", "contains", "not_contains", "is_empty", "is_not_empty"],
                            "impact_details.description":["is", "is_not", "contains", "not_contains", "is_empty", "is_not_empty"],
                            "description":["is", "is_not", "contains", "not_contains", "is_empty", "is_not_empty"],
                            "title":["is", "is_not", "contains", "not_contains", "starts_with", "ends_with"],
                            "template":["is", "is_not", "contains", "not_contains", "starts_with", "ends_with"],
                        };
                    }
    				if(options.module == 'release') {
    					cri_options.defSubFields = ["back_out_plan","checklist","close_details","impact_details","roll_out_plan"];
    				}
    				if(metaInfo.modelopt.module=="requests" || (group && group.extended_module && group.extended_module.name.startsWith("request_"))){
    					cri_options.metaOverride = {"maintenance": {"read_only":false,"type":"boolean"}};
    					cri_options.serialize= _self.serializeDataCallBack;
    				}					
                    if(metaInfo.routeName.indexOf('pre_rules') !== -1 || metaInfo.routeName.indexOf('post_rules') !== -1)
                    {
                        cri_options.fieldTypeConditions["resolution.content"]=["is_empty", "is_not_empty"];
                        cri_options.fieldTypeConditions["description"]=["is_empty", "is_not_empty"];
                    }
    
                    if(group&&group.extended_module){
                         var existingUserDollarVar=cri_options.dollarSupport.$_user.fields;
                         var ignoreNoneFields=cri_options.ignoreNoneFields;
                         var subFieldsToInclude=["request.closure_info","request.resolution","request.resources","request.udf_fields"];
                         if(options.module=='notifications'){
                               subFieldsToInclude=subFieldsToInclude.concat(["to","cc","bcc"]);
                               existingUserDollarVar.push("sender");
                               ignoreNoneFields.push("sender");
                               cri_options.fieldTypeConditions["description"]=["is", "is_not", "contains", "not_contains", "starts_with", "ends_with"];
                         }
                         if(options.module=='notes'){
                               existingUserDollarVar=existingUserDollarVar.concat(["last_updated_by","added_by"]);
                               ignoreNoneFields.push("added_by");
                               cri_options.fieldTypeConditions["description"]=["is", "is_not", "contains", "not_contains", "starts_with", "ends_with"];
                               cri_options.fieldTypeConditions["added_by"]=["is", "is_not"];
                               cri_options.fieldTypeConditions["last_updated_by"]=["is", "is_not"];
                         }
                         if(options.module=='approval_levels'){
                               existingUserDollarVar=existingUserDollarVar.concat(["created_by"]);
                               subFieldsToInclude.push("approvals");
                         }
                         if(options.module=='approvals'){
                               existingUserDollarVar=existingUserDollarVar.concat(["sent_by","approver","action_by","obo_approver"]);
                               ignoreNoneFields.push("sent_by");
                               subFieldsToInclude=["approval_level.request.closure_info","approval_level.request.resolution","approval_level.request.resources","approval_level.request.udf_fields","approval_level.approvals"];
    
                             if(group.extended_module.name && group.extended_module.name.startsWith('request')){
                                cri_options.fieldTypeConditions["approval_level.request.resolution.content"]=["is_empty", "is_not_empty"];
                                cri_options.fieldTypeConditions["approval_level.request.description"]=["is_empty", "is_not_empty"];
                                cri_options.fieldTypeConditions["approval_level.request.status"]=["is", "is_not"];
                                cri_options.fieldTypeConditions["approval_level.request.template"]=["is", "is_not"];
                                cri_options.fieldTypeConditions["approval_level.request.created_by"]=["is", "is_not"];
                                cri_options.fieldTypeConditions["approval_level.request.requester"]=["is", "is_not"];
                                cri_options.fieldTypeConditions["approval_level.request.subject"]=["is", "is_not", "contains", "not_contains", "starts_with", "ends_with"];
                             }
                         }
                         if(group.extended_module.name && group.extended_module.name.startsWith('request')){
                            cri_options.fieldTypeConditions["request.resolution.content"]=["is_empty", "is_not_empty"];
                            cri_options.fieldTypeConditions["request.description"]=["is_empty", "is_not_empty"];
                            cri_options.fieldTypeConditions["request.status"]=["is", "is_not"];
                            cri_options.fieldTypeConditions["request.template"]=["is", "is_not"];
                            cri_options.fieldTypeConditions["request.created_by"]=["is", "is_not"];
                            cri_options.fieldTypeConditions["request.requester"]=["is", "is_not"];
                            cri_options.fieldTypeConditions["request.subject"]=["is", "is_not", "contains", "not_contains", "starts_with", "ends_with"];
                         }
                        if (group.extended_module.name && group.extended_module.name.startsWith('cm_')) {
                            subFieldsToInclude = ["cm_fields"];
                        }
                         cri_options.dollarSupport.$_user.fields=existingUserDollarVar;
                         cri_options.ignoreNoneFields=ignoreNoneFields;
                         cri_options.includeSubFields=subFieldsToInclude;
                    }
                    if(window.checkIfMSPOrSCP() && _self.mspHandledMetaInfoRouteNames.includes(metaInfo.routeName))
                    {
                        if(window.checkIfSCP()) {
                            // for including account additional fields for SCP
                            cri_options['subUDFFields'] = { "account": "accountudf_fields" };
                        }
                        if(!(metaInfo.routeName == 'businessrules' || metaInfo.routeName == 'servicecatalogbrules')){
                            //Not showing contract fields in BR criteria as they will only be available in bean post business rules executions
                            cri_options['includeSubFields'].push("accountcontract");
                        }
                        if(group && group.extended_module && group.extended_module.name && group.extended_module.name.startsWith('request')) {
                            // for Request related sub entities
                            if(options.module=='approvals') {
                                // for Approval sub entity, Request itself is a sub field of Approval Level in criteria
                                cri_options['includeSubFields'].push("approval_level.request.accountcontract");
                            } else {
                                cri_options['includeSubFields'].push("request.accountcontract");
                            }
                        }
                    }
                    metaInfo['all_criteria'] = cri_options;
                }
            });
            /*criteria end*/
            if(metaInfo.custom_actions.field_update) {
                /*field_update start*/
                var fieldUpdateHrefParams = metaInfo.field_update_href.split('?')[1].split('=');
                sdpAjax({
                    url: "/api/v3"+metaInfo.field_update_href.split('?')[0], //No i18n
                    skipSUBREQUEST: true,
                    cache:false,
                    async:false,
                    data: sdpAjaxInputData(JSON.parse(fieldUpdateHrefParams[1])),
                    success:function(resp){
                        var field = resp.metainfo.fields;
                        for (var i in field) {
                            if(i == 'resolution' || i=='current_scheduled_timer') {
                                field[i].type = 'group';
                            }
                        }
                        var actions_base = {
                            metainfo: resp.metainfo.fields
                        };
                        metaInfo["field_update"] = actions_base;
                    }
                });
                /*field_update end*/
            }
            //scroll Elelment for timer rules popup page
            metaInfo['scrollableElement'] = (metaInfo.routeName.indexOf("pre_rules") !== -1 || metaInfo.routeName.indexOf("post_rules") !== -1)?',scrollableElement=#brrules .form-wrapper,delay=6000':''; //No i18n
    
            if(!forExtendedModuleRefresh){
                this.initExtendedModules(options,params,metaInfo,controller);
            }
            if(params.rid == 'newform') {/*new rule pass parameters*/
                if(options.groupsurl!=null)
                {
                   metaInfo["options"] = {
                      "actions" : [], //No i18n
                      "cascade_to_next_group": false, //No i18n
                      "is_cascade": true, //No i18n
                      "execute_during": "anytime", //No i18n
                      "execute_on_first_match": false, //No i18n
                      "is_enabled": true, //No i18n
                      "group": { //No i18n
                          "id": group.id, //No i18n
                          "name": group.name, //No i18n
                      },
                      "module": { //No i18n
                          "name": group.module.name //No i18n
                      },
                      "module_type": group.module_type, //No i18n
                      "order": group.order, //No i18n
                      "is_subrule": false //No i18n
                   };
                }
                else
                {
                   metaInfo["options"] = {
                      "actions" : [], //No i18n
                      "cascade_to_next_group": false, //No i18n
                      "is_cascade": true, //No i18n
                      "execute_during": "anytime", //No i18n
                      "execute_on_first_match": false, //No i18n
                      "is_enabled": true, //No i18n
                      "group": null, //No i18n
                      "module": { //No i18n
                          // Removed duplicate key moduleVal from rulesConfig and used module_name instead.
                          "name": options.module_name, //No i18n
                      },
                      "module_type":  options.module_type //No i18n
                     // "order": group.order
                   };
                }
                if(group && group.extended_module && group.extended_module.id){
                    metaInfo["options"]["extended_module"]=group.extended_module;
                }
                else if(options.has_extended_modules && controller.extended_modules_data){
                    if(controller.extended_modules_data.selected_extended_module){
                        metaInfo["options"]["extended_module"]=controller.extended_modules_data.selected_extended_module;
                    }
                    else{
                        var selectedExtendedModule;
                        controller.extended_modules_data.extended_modules.forEach(function(eModule){
                            if(eModule.name == options.module_name){
                                selectedExtendedModule = eModule;
                            }
                        });
                        metaInfo["options"]["extended_module"]=cloneJson(selectedExtendedModule);
                    }
                }
                metaInfo["actionstype"] = true;
                if(forExtendedModuleRefresh){
                    var rData = controller.get('rdata');
                    var valuesToRetain = ["name","description","cascade_to_next_group","is_cascade","execute_during","execute_on_first_match","is_enabled"]; //No i18n
                    for(var i=0;i<valuesToRetain.length;i++){
                        metaInfo["options"][valuesToRetain[i]]= rData["options"][valuesToRetain[i]];
                    }
                }
               //For If-If/If-Else Metainfo
               this.getSubRuleMetainfo(metaInfo);
            } else {/*edit rule pass parameters*/
                var resp = {};
                sdpAjax({
                    url: "/api/v3/"+options.rulesurl+"/"+params.rid, // No I18N
                    cache:false,
                    async: false,
                    success: function(data) {
                            resp = data[options.ruleresp];
                            metaInfo["actionstype"] = (resp.actions.length == 0) ? true : (resp.actions[0].type == 'negate') ? false : true;//if negate action present in response then set variable as false
    
                        var evearr = [];
                        if(options.include_events){
                            for(var i=0; i<resp.events.length; i++) {
                                //SD-99145 - Name also has to be loaded in select2 -- To pass english string in input for validation
                                evearr.push({"id":resp.events[i].id,"text":resp.events[i].display_name,"name":resp.events[i].name});
                            }
                        }
                            resp.events = evearr;
                            
                        if(resp.criteria_custom_function) {
                            // to check if selected ccf is inactive
                            metaInfo.isSelectedCcfInactive = !resp.criteria_custom_function.is_active;
                            // if ccf is present it needs be displayed in ccf select2 even if it is disabled. hence setting isCcfListEmpty as false
                            metaInfo.isCcfListEmpty = false;
                        }
    
                        _self.modifyRuleResponse(resp,metaInfo);
                    }
                });
                if(resp.extended_module == null && options.baseModuleConfig){ // assigning this object to display entity name (whose extended_module is null) in applies for filter while rendering rules page
                    resp.extended_module = options.baseModuleConfig;
                }
                metaInfo["options"] = resp;
                //For If-If/If-Else Metainfo
                this.getSubRuleMetainfo(metaInfo,resp);
            }
            //metaInfo["ajaxurl"] = options;
            return metaInfo;
        },
        actioncombination: function(results) { // to restrict 'Execute on action' selection combinations. //No i18n
            if(ctrl.rdata && ctrl.rdata.routeName === 'customtriggers') {
                // In Request CT, when deprecated event ('Approved' / 'Rejected' / 'Reply Received') is selected, other events can't be added.
                var selectedEvents = $('#exeAction').select2('data');
                var isDeprecatedEventSelected = selectedEvents.map(event => event.name).some(eventName => ['approval_approved', 'approval_rejected', 'reply_received'].includes(eventName)); //No i18n
                results.forEach(event => event.disabled = isDeprecatedEventSelected);
            }
            return results;
        },
        /*
        metainfo - business rule metainfo, cloning the same for subrules as it is almost same for both
        resp - rules API response when called from edit rule flow
        IF-IF/IF-ELSE actions data for sub_rules field will be in the format of 'rdata' used for business rules
        'rdata' contains sub_rule metainfo and sub_rule data
        */
        getSubRuleMetainfo: function(metainfo, resp){
            var _self = this;
            var subRuleMetainfo = cloneJson(metainfo);
            subRuleMetainfo["actionstype"] = true;//In form page for If/Else-If/Else block actions, need to show custom actions dropdown
    
            //To list negate action under custom actions for subrule actions instead of showing it as rule actions.
            subRuleMetainfo["showNegate"] = true;
            subRuleMetainfo.modelopt.skipabort = true;//To avoid showing '"When a request arrives" div for If-If/If-Else - each subrule actions' //No i18n
    
            //Modifying criteria metainfo for subrules
            subRuleMetainfo.all_criteria.maxrows = 10;
            subRuleMetainfo.all_criteria.maxinnerrows = 5;
            //For If-Else Action, else subrule criteria is not mandatory
            subRuleMetainfo["isElseBlock"] = false;
    
            subRuleMetainfo['cf_count'] = metainfo['sub_rule_cf_count'];
    
            //For IF-If/IF-ELSE actions, notification count can be 3
            var notificationCusAction = subRuleMetainfo.custom_actions.notification;
            if(notificationCusAction && notificationCusAction.total > 0){
                subRuleMetainfo['cf_count'] -= notificationCusAction.total;
                notificationCusAction.total = 3;
                subRuleMetainfo['cf_count'] += notificationCusAction.total;
            }
    
            //deleting elements from rule metainfo which are not needed for subrule metainfo
            delete subRuleMetainfo.custom_actions.if_if;
            delete subRuleMetainfo.custom_actions.if_else;
            delete subRuleMetainfo.custom_actions.conditional_action;
            delete subRuleMetainfo.execute_actions;
    
            if(subRuleMetainfo.modelopt.rule_type == "custom_trigger"){
                subRuleMetainfo.modelopt.execute_class = false;
                delete subRuleMetainfo.custom_actions.execute_class;
            }
    
            if(resp != undefined){//When Edit form is loaded, transforming metainfo and response data for If-If/If-Else action subrules
    
                var subrule_options = {
                    "actions" : [], //No i18n
                    "cascade_to_next_group": false, //No i18n
                    "is_cascade": true, //No i18n
                    "execute_during": "anytime", //No i18n
                    "execute_on_first_match": false, //No i18n
                    "is_enabled": true, //No i18n
                    "module": { //No i18n
                        "name": resp.module.name //No i18n
                    },
                    "module_type": resp.module_type, //No i18n
                    "is_subrule": true, //No i18n
                    "rule_type":resp.rule_type, //No i18n
                    "extended_module":resp.extended_module //No i18n
                };
                subRuleMetainfo["options"] = subrule_options;
                if(subRuleMetainfo.modelopt.groupsurl != null){subRuleMetainfo.options["group"] = metainfo.options.group};
    
                //Fetching If-If/If-Else action data using /wfactions API
                for(var ind=0; ind<resp.actions.length; ind++){
                    var action = resp.actions[ind];
                    if(action.type == "sub_rules"){
                         sdpAjax({
                                url: "/api/v3/wfactions/"+action.id, // No I18N
                                cache:false,
                                async: false,
                                success: function(data) {
                                    var subRulesData = [];
                                    //If-If/If-Else/Conditional action, data will be replaced with proper data with metainfo required for UI component
                                    //Each subRule data will be replaced with metainfo required and metainfo.options will contain the subrule data.
                                    for(var j=0; j<data.wfaction.sub_rules.length; j++) {
                                    var sub_rule = data.wfaction.sub_rules[j];
                                    if(data.wfaction.sub_type == 'conditional_action'){
                                        _self.modifyRuleResponse(sub_rule, currentMeta);
                                        subRulesData.push(sub_rule);
                                    }else{
                                        var currentMeta = cloneJson(subRuleMetainfo);
                                        if(data.wfaction.sub_type == 'if_else' && (j == data.wfaction.sub_rules.length-1) && (sub_rule.criteria == null || sub_rule.criteria.length == 0)){
                                            currentMeta.isElseBlock = true;
                                        }
                                        _self.modifyRuleResponse(sub_rule, currentMeta);
                                        currentMeta.all_criteria.innerCriteriaClass = "innerCriteria_"+sub_rule.id;;//to avoid drag-drop criteria internally across if-blocks //No i18n
                                        currentMeta["options"] = sub_rule;
                                        subRulesData.push(currentMeta);
                                    }
                                    }
                                    //Setting the If-If/If-Else action data back in main rule data
                                    resp.actions[ind]["sub_rules"] = subRulesData;
    
                                }
                        });
                        if(resp.actions[ind].sub_type != 'conditional_action'){
                            //Subrules limit for each If-If/If-Else actions
                            resp.actions[ind]["subrule_count"] = 10;
                            resp.actions[ind]["randomID"] = (action.sub_type == "if_if")?1000:5000;//maintaining randomID for subrules tempID, to avoid math.round() usage
                        }
                    }
                }
                metainfo.options.actions = resp.actions;
            }else{
                //order will be set, while doing API call
                delete subRuleMetainfo.options.order;
                subRuleMetainfo.options["rule_type"] = subRuleMetainfo.modelopt.rule_type;
                subRuleMetainfo.options.is_subrule = true;
                if(subRuleMetainfo.modelopt.groupsurl == null){
                    delete subRuleMetainfo.options.group;
                }
            }
            //metainfo.sub_rules - used for each sub_rule when newly added. For Ex: If--If, when new if block is added, this metainfo will be cloned for it.
            metainfo["sub_rules"] = subRuleMetainfo;
    
            if(metainfo.custom_actions.conditional_action){
            var clonedMeta = cloneJson(subRuleMetainfo);
            //udf_fields not icluded in parent criteria metainfo, as it is done in custom_filter component
            if(clonedMeta.all_criteria.includeSubFields != undefined){ clonedMeta.all_criteria.includeSubFields.push("udf_fields"); }
            var conditionalActionMeta = {
                typeOverride : {"datetime":"date"},//No I18N
                sub_rule: clonedMeta.options,
                conditions: {
                    metainfo: clonedMeta.all_criteria.metainfo,
                    includeSubFields: true,
                    def_count: 1,
                    max_count: 5,
                    includeChildFields: clonedMeta.all_criteria.includeSubFields,
                    specialValues: ["is_empty", "is_not_empty"], //No i18n
                    skipTypesFields: ["string","text"], //No i18n
                    dollarSupport: clonedMeta.all_criteria.dollarSupport,
                    defSubFields: clonedMeta.all_criteria.defSubFields,
                    noSpecValFields: {"created_by":["is_empty", "is_not_empty"], "status":["is_empty", "is_not_empty"], "template":["is_empty", "is_not_empty"], "requester":["is_empty", "is_not_empty"]} //No i18n
                },
                actions: {
                    metainfo: clonedMeta.field_update.metainfo,
                    includeSubFields: false,
                    def_count: 1,
                    max_count: 5,
                    checkMetaKeys: true,
                    includeChildFields: ["closure_info", "resources", "udf_fields","cm_fields"], //No i18n
                    specialValues: ["same_value","no_value"], //No i18n
                    noSpecValFields: {"status":["no_value"], "template":["no_value"], "group_roles":["same_value","no_value"]} //No i18n
                },
                rows: {
                    def_count: 1,	//Number of default rows to be listed
                    max_count: 20 	//Maximum number of rows
                },
                changeURLData: _self.criteriaURLcallback,
                skipSelect2Cache: ["group"]//fields having different url for both criteria and actions. cache is used for accessing same urls for each field in CA
            };

            if(window.checkIfMSPOrSCP() && clonedMeta.modelopt.module=="requests" && clonedMeta.modelopt.rule_type=="business_rules") {
                // accountcontract is added as lookup field in meta info. To add only its name field in Action section of Conditional Action we are including it as child field, to add its sub-field 'Contract Name' in action.
                conditionalActionMeta.actions.includeChildFields.push("accountcontract");
            }

            if(clonedMeta.modelopt.module=="requests"){
                conditionalActionMeta.conditions["metaOverride"] = clonedMeta.all_criteria.metaOverride;
                conditionalActionMeta.conditions["serialize"]= _self.serializeDataCallBack;
            }
    
            if(clonedMeta.modelopt.rule_type != 'pre_rules'){
                conditionalActionMeta.actions['dollarSupport'] = {
                    "$_user": {"fields":["technician"], "option":{"id":"$(current_user)", "text":"$"+translate("sdp.common.loggedinuser")}} //No i18n
                };
            }
            metainfo["conditional_action"] = conditionalActionMeta;
            }
    
        },
        /*
        update custom action count in metainfo for If-If/Else-If/Else block actions
        subRuleAction - if-if/if-else action details
        depFieldsList - dependent actions list
        */
        updateSubrulesCusActCount: function(subRuleAction,depFieldsList){
    
            if(subRuleAction.sub_type == 'conditional_action'){
            return;
            }
            for(var ind=0; ind<subRuleAction.sub_rules.length; ind++){
                var sub_rule = subRuleAction.sub_rules[ind];
                var actlen = subRuleAction.sub_rules[ind].options.actions;
                if(actlen.length != 0) {
                    for(var i=0; i<actlen.length; i++) {
                        //updating custom action count
                        sub_rule.custom_actions[actlen[i].type].count = parseInt(sub_rule.custom_actions[actlen[i].type].count) + 1;
                        if(depFieldsList.includes(actlen[i].type)) {
                            for(var j=0; j<depFieldsList.length; j++) {
                                if(depFieldsList[j] != actlen[i].type && sub_rule.custom_actions[depFieldsList[j]] != undefined) {
                                    sub_rule.custom_actions[depFieldsList[j]].count = parseInt(sub_rule.custom_actions[depFieldsList[j]].count) + 1;
                                }
                            }
                        }
                        //For IF-IF/If-Else, negate will be displayed under custom actions (In case of BR and Timer pre rules)
                        //If negate is selected,no other custom action can be listed under custom actions.
                        if(actlen[i].type == "negate"){
                            sub_rule.actionstype = false;
                        }else if(sub_rule.custom_actions["negate"] != undefined){//If negate is present in allowed values.``
                            //other than negate if any action is already selected, negate should not be listed
                            sub_rule.showNegate = false;
                        }
                    }
                }
            }
        },
        /*
        returns urls to be called for criteria field values.
        id - field to which url to be returned for fetching allowed values of the field
        */
        criteriaURLcallback: function(id, href) {
            var ruledata = ctrl.get("rdata");
            if(href && href.indexOf('"for"') != '-1') {
                var url = href.split('?')[0];
                var split = href.split('?input_data=')[1];
                var splObj = jQuery.parseJSON(split);
                var data = {};
                    data['for'] = splObj.for;
                    if(splObj.list_info) {
                        data['list_info'] = splObj.list_info;
                        data.list_info['row_count'] = 100;
                    }
                return {"url":  "/api/v3"+url, "data":data, "field":id}; //No i18n
                /*
                criteriaURLcallback - will be used for
                */
            }else if (ruledata && ruledata.modelopt.module == 'release' && id == 'status') { //No i18n
             			return {"url": "/api/v3" + ruledata.all_criteria.metainfo[id].href, "data": {"for": "release_custom_trigger"}, "field": id } //No i18n
             }
        },
        /*
        modifies the listinfo for site based fields
        listinfo -
        id - field name
        */
        criteriacallback: function(listinfo, id) {//criteria callback event for site based options
            var ruledata = ctrl.get("rdata");
            if (ruledata.modelopt.module == 'release' && id == 'status') {
    			return { sort_field: "stage", sort_order: "asc", row_count: "20"}; //No I18N
            } else {
                return listinfo;
            }
        },
        initExtendedModuleFilter : function(controller,url,module_name,baseModuleConfig,params){
            var filter_data = {};
            var extended_modules_data = controller.get('extended_modules_data');
    
            Ember.set(extended_modules_data,'filter_data',filter_data); //No i18n
    
            var extended_modules;
            var extendedModulesListInfoData = {"sort_field":"id"}; //No i18n
            sdpAjax({
              url: "/api/v3/"+url+"/extended_module", // No I18N
              data: sdpAjaxInputData({list_info:extendedModulesListInfoData}),
              cache:false,
              async: false,
              success: function(data) {
                  extended_modules = data["extended_module"];
              }
            });
            if(baseModuleConfig){ // add base entity config to extended_modules if present
                extended_modules.addObject(baseModuleConfig);
            }
            filter_data.list_view_filters=extended_modules;
            filter_data.list_view_filters_display=extended_modules.map(function(val){return {"id":val.id,"name":(val.display_name)?val.display_name:val.name}}); //No i18n
    
            //get previously selected extended module name for the current route, find matching extended module json in extended_modules and set it as selected_filter. set the first extended module
            var selectedExtendedModuleName = controller.get("extendedModulesFilterData")[controller.routeName];
            var selectedExtendedModuleJSON = extended_modules.find(moduleJSON => selectedExtendedModuleName == moduleJSON.name);
            //if previously selected extended module name is not available, set module name as selected_filter if available
            if(!selectedExtendedModuleJSON) {
                selectedExtendedModuleJSON = extended_modules.find(moduleJSON => module_name);
            }
            //in case neither is available set the first extended module as selected_filter
            filter_data.selected_filter = cloneJson (selectedExtendedModuleJSON ? selectedExtendedModuleJSON : extended_modules[0]);
    
            //modify search_criteria value for entities whose extended_module is null
            var fieldValue = filter_data.selected_filter.name;
            var fieldName = "extended_module.name"; //No i18n
            if(filter_data.selected_filter.name === module_name){
                fieldName = "extended_module"; //No i18n
                fieldValue = null;
            }
            //set search_criteria to filter only the selected extended module's rules
            Ember.set(params.listview.options, "search_criteria", [ //No i18n
              {
                field: fieldName,
                condition: "is", //No i18n
                value: fieldValue,
              },
            ]);
    
        },
        /*
        actionData - If-IF/IF-ELse/Conditional action Data
        canUpdateData - whether to update the data or not (update will be called from actions component)
        skipIndex - To skip validation for that index (called when new condition added to else block, that index shouldn't be validated for adding condition)
        */
        validateAndUpdateSubRuleActionData: function(actionData, canUpdateData, skipIndex){
    
            var sub_type = actionData.sub_type;
            if(sub_type == 'conditional_action'){
                var sub_rules = jQuery('[data-id=action_options] [data-id='+actionData.id+']').find("#ca_filter").ca_filter("fetchData", true); //No i18n
                //for conditional actions, component will show alert messages
                if(sub_rules == undefined || !sub_rules || sub_rules.length == 0){
                    return false;
                }
                if(canUpdateData){//updating sub-actions override option to conditional action data
                    actionData.is_override = $('[data-id=action_options] [data-id='+actionData.id+']').find('#override_field_ca_filter').is(':checked') ? true : false;
                    actionData.sub_rules = sub_rules;
                }
                return true;
            }
            //IF-IF / IF-ELSE Actions start
            var subTypeKey = translate("common.if")+"-"+translate("common.if") + " " + translate('common.action') + ": ";
            if(sub_type == 'if_else'){
                subTypeKey = translate("common.if")+"-"+translate("common.else") + " " + translate('common.action') + ": ";
            }
            for(var i=0; i < actionData.sub_rules.length; i++){
                var sub_rule = actionData.sub_rules[i];
                if(!canUpdateData && i == skipIndex){//skips validation for that particular index
                    continue;
                }
                if(!sub_rule.isElseBlock){
                //extra params used for custom filter is to fetch id and name for placeholder values
                var criteria = $('[data-id='+actionData.id+'] [data-id=subrule_'+sub_rule.options.id+']').find('#sub_rule_criteria').custom_filter('getFilterData','', true);
                if(criteria == null || !criteria || criteria.length == 0){
                        highlightfn($('[data-id='+actionData.id+'] [data-id=subrule_'+sub_rule.options.id+']').find('#sub_rule_criteria .innerCriteria').get(0),'autoscroll=true,highlight=true'+sub_rule.scrollableElement); //No i18n
                        var msg = subTypeKey + translate('sdp.requests.fieldFormRules.fillAllFields');
                        showalert('failure',msg,'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
                        return false;
                }
    
                if(canUpdateData){
                    sub_rule.options.criteria = criteria;
                }
                }
                var actions = sub_rule.options.actions;
                if(actions.length == 0){
                    showalert('failure',subTypeKey + translate('sdp.admin.rules.custom.actions.mincount.valid'),'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
                    return false;
                }
                for(var j=0; j<actions.length; j++){
                    if(actions[j].type == "field_update"){
                        var fieldUpdateData = jQuery("#field_update_"+actions[j].id).custom_filter("getFilterData");//NO I18N
                        if(!fieldUpdateData && fieldUpdateData != null) {
                            var msg = translate('sdp.requests.fieldFormRules.fillAllFields');
                            highlightfn($('[data-id='+actionData.id+'] [data-id=subrule_'+sub_rule.options.id+']').find('[data-id=action_options] .row:eq('+j+') [data-name=fieldupdate] .innerCriteria').get(0),'autoscroll=true,highlight=true'+sub_rule.scrollableElement); //No i18n
                            showalert('failure',subTypeKey + msg,'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
                            return false;
                        } else if(canUpdateData){
                            actions[j].is_override =  $('[data-id='+actionData.id+'] [data-id=subrule_'+sub_rule.options.id+']').find('#override_field_'+actions[j].id).is(':checked') ? true : false;
                            if(fieldUpdateData == null){
                                fieldUpdateData = [];
                            }
                            for(var k=0; k<fieldUpdateData.length; k++) {
                                if(fieldUpdateData[k].values != null && fieldUpdateData[k].values[0] == "$(current_user)") {
                                    var respvalarr = []
                                    respvalarr.push({"id":fieldUpdateData[k].values[0],"name":"$"+translate("sdp.common.loggedinuser")});
                                    fieldUpdateData[k].values = respvalarr
                                }
                            }
                            actions[j].field_update = fieldUpdateData;
                        }
                    }
                }
            }
            return true;
        },
        /*
        Modifying API response accordingly for displaying in UI for rule and if-if/if-else actions
        data - rule/subrule data
        metaInfo - metainfo for data
        */
        modifyRuleResponse:function(data,metaInfo){
    
             var actArr = [];
             var act = data.actions;
             for(var i=0; i<act.length; i++) {
                 if(act[i].type=="custom_function") {
                    var cuf = true;
                        sdpAjax({//Code moved from rulesform/route.js after merge.
                            url: "/api/v3/custom_functions/" + act[i].custom_function.id,
                            cache: false,
                            ignorefailuremessage: true,
                            async: false,
                            success: function(resp) {
                                cuf = resp.custom_function.is_active;
                            },
                            error: function(resp) {
                                cuf = false;
                            }
                        });
                        metaInfo['custom_functions_disable'] = cuf;
    
                 }
                 if(act[i].type=="field_update") {
                     var fupdate = act[i].field_update;
                     var resparr = [], respvalarr = [];
                     for(var j=0; j<fupdate.length; j++) {
                         respvalarr = [];
                         var name = fupdate[j].name;
                         var displayValue = fupdate[j].display_value;
                         var fieldValue = fupdate[j].value;
                         if(fieldValue == "$(current_user)") {
                             respvalarr.push({"id":fieldValue,"name":"$"+translate("sdp.common.loggedinuser")});
                         } else {
                             if(displayValue != null && Array.isArray(displayValue)){
                                 respvalarr = displayValue;
                             }
                             else if(displayValue == null || displayValue.id == undefined) {
                                 if(name == 'site' && (fieldValue == '-1' || fieldValue == null)) {
                                     respvalarr.push({"id":"-1","name":translate("common.site.nosite")});
                                 } else {
                                     respvalarr.push(displayValue);
                                 }
                             }
                             else if(displayValue.id && displayValue.alias_entity != undefined){
                                 respvalarr.push({"id":displayValue.id,"name":displayValue.name, "alias_entity": displayValue.alias_entity});
                             }
                             else {
                                 respvalarr.push({"id":displayValue.id,"name":displayValue.name});
                             }
                         }
                         resparr.push({"condition": "is", "field": name,"logical_operator": "and","values":respvalarr,"update_config":fupdate[j].update_config});
                     }
                     act[i].field_update = resparr;resparr = [];
                 }
                 if(act[i].is_active) {
                     actArr.push(act[i]);
                 }
             }
             data.actions = actArr;
        },
        /*
        Hide rule search box and display rule icons
        groupId - groupId
        hideSearchIcon - whether to hide the search icon or not
        */
        hideRuleSearchbox: function(groupId){
            //hide rule search box
            jQuery("#rule_search_btn_group_"+groupId).addClass("hide");
            //unhide addNew, organize and search buttons
            jQuery('#add_rule_' + groupId).removeClass('hide');
            if(Number(jQuery('#brloadcount_'+groupId).attr("data-total-count")) >= 2) {
                jQuery('#org_' + groupId).removeClass('hide');
            }
            jQuery('#rule_search_icon_' + groupId).removeClass('hide');
        },
        /*
        Search for rules / rule groups
        clearSearch - whether clear search button is pressed or not
        tabObj - to add additional search criteria to list_info
        $textInput - search box jquery object
        $textInput - clear button jquery object
        gid - group id, groupId is passed only for rules and is null for groups
        */
        searchGroupsListView: function(clearSearch, tabObj, $textInput, $clearBtn, gid){
            var enter_key = event.keyCode || event.which;
            if (enter_key == 13 || clearSearch) {
                var search_val = $textInput.val();
                var listInfo = tabObj.t_obj.table_info.list_info;
                //get search criteria and remove previouly searched value if any
                var searchArr = listInfo.search_criteria;
                searchArr = searchArr ? searchArr.filter(el => el['field'] != "name") : []; //No i18n
                if (search_val && !clearSearch) {
                    //searchCriteria for name or description containing search term
                    var isSiteAssociationPresent = tabObj && tabObj.t_obj && tabObj.t_obj.available_minfo_fields && tabObj.t_obj.available_minfo_fields.site;
                    if(!gid && (tabObj.context.routeName === "businessrules" || tabObj.context.routeName === "servicecatalogbrules") && isSiteAssociationPresent) {
                        //site search for business rule group
                        searchArr.push({ "field": "name", "condition": "contains", "value": search_val, "logical_operator": "and", "children": [{ "field": "description", "condition": "contains", "value": search_val, "logical_operator": "or" }, { "field": "site.name", "condition": "contains", "value": search_val, "logical_operator": "or" }] });
                    } else {
                        searchArr.push({ "field": "name", "condition": "contains", "value": search_val, "logical_operator": "and", "children": [{ "field": "description", "condition": "contains", "value": search_val, "logical_operator": "or" }] });
                    }
                    if(gid) {
                        //for rule search, once search is perfomed set clear/close button title as clear and data-action-param as 'search-clear'
                        $clearBtn.attr({
                            'data-action-param': 'search-clear', //No i18n
                            'title': translate('sdp.common.clear'), //No i18n
                            'aria-label': translate('sdp.common.clear') //No i18n
                        });
                    }
                } else {
                    //when empty search is made or clear search is clicked.
                    if(gid) {
                        //change clear/close button title to close for rule search
                        $clearBtn.attr({
                            'data-action-param': 'close', //No i18n
                            'title': translate('sdp.common.close'), //No i18n
                            'aria-label': translate('sdp.common.close') //No i18n
                       });
                    } else {
                        //hide clear icon for group serach
                        $clearBtn.addClass('hide');
                    }
                    //clear search text
                    $textInput.val('');
                }
                listInfo.search_criteria = searchArr;
                //reset list info start index
                listInfo.start_index = 1;
                if(gid) {
                    //scroll to top for rule search and refresh table
                    jQuery('#'+tabObj.tableId+'_kanban_div').scrollTop(0);
                    tabObj.refreshTable('refresh'); //No i18n
                    //update group rules count
                    setTimeout(function(){
                        var searchResultCount = tabObj.t_obj.table_info.list_info.total_count;
                        jQuery('#brloadcount_'+gid).text(searchResultCount);
                    } , 300);
                } else {
                    //refresh table
                    tabObj.refreshTable('refresh'); //No i18n
                }
            } else {
                if(gid && $clearBtn.attr('data-action-param') != 'search-clear') {
                    if($textInput.val() == '') {
                        //in rule search, if search is not made & the search text input is empty, set data-action-param & title as close for the clear/close button
                        $clearBtn.attr({
                            'data-action-param': 'close', //No i18n
                            'title': translate('sdp.common.close'), //No i18n
                            'aria-label': translate('sdp.common.close') //No i18n
                        });
                    } else {
                        //else set data-action-param and title as clear
                        $clearBtn.attr({
                            'data-action-param': 'text-clear', //No i18n
                            'title': translate('sdp.common.clear'), //No i18n
                            'aria-label': translate('sdp.common.clear') //No i18n
                        });
                    }
                } else {
                    //display clear icon for group search
                    $clearBtn.removeClass('hide');
                }
            }
        },
    
        /* Apply SLA Popup in Service BR */
    
        /*
        To construct header data for apply sla popup
        table_info - contains table data
        */
        headerdataConstructForSelectSLA: function(table_info,component) {
                var meta_data = {
                      "slas_head_radio": {// No I18N
                        "type":"radio",//No I18N
                        "dataCelltransformer" : component.constructRadioForSLA, // No I18N
                        "hide_label": true, //No i18n
                        "column_settings": { //No i18n
                            position: 1
                        }
                      },
                      "name": { // No I18N
                        "dataCelltransformer" : component.constructSLADetails, // No I18N
                        "hide_label": true, //No i18n
                        "column_settings": { //No i18n
                            position: 2
                        }
                      }
                    };
                return meta_data;
            },
    
            /*
            To construct radio button for popup
            */
            constructRadioForSLA:function(table_data,component){
    
                var row_data=table_data.row_data;
                var slaId=e_attr(row_data.id);
                var col_str='<input class="ml20 mt15" type="radio" name="chooseslaval" id='+slaId+' data-table-radio>';
                return col_str;
            },
    
            /*
            To construct row with sla details
            table_data - contains table info
            */
            constructSLADetails:function(table_data,component){
    
                var rowData=table_data.row_data;
                var slaId=rowData.id;
                var slaLabelName = e_html(rowData.name);
        		var fullfillmentTime = e_html(component.getSlaTimeString(rowData.resolution_dueby_days, rowData.resolution_dueby_hours, rowData.resolution_dueby_minutes));
        		var responseTime = e_html(component.getSlaTimeString(rowData.fr_dueby_days, rowData.fr_dueby_hours, rowData.fr_dueby_minutes));
        		if(responseTime==""){
        		    responseTime="-";
        		}
        		var slaDescription = e_html(rowData.description);
    
                var col_str = "";
                col_str='<div class="mt10"><div class="truncate-ellipsis"><div><label class="sb text-overflow vmiddle mb0" style="max-width: 330px;" id="slaLabelName" for='+slaId+'>'+slaLabelName+'</label><span class="text-muted ml20 text-overflow disp-ib vmiddle" style="max-width: 120px;">'+translate("sdp.admin.servicesla.listview.fulfillmenttime")+' : </span><span class="ml5 vmiddle sb" id="fullfillmentTime">'+fullfillmentTime+'</span><span class="text-muted vmiddle ml10 mr10">|</span><span class="text-muted text-overflow disp-ib vmiddle" style="max-width: 120px;">'+translate("sdp.admin.sla.listview.responsetime")+' : </span><span class="ml5 vmiddle sb" id="responseTime">'+responseTime+'</span></div><div class="text-overflow mt5"><span class="text-muted" id="slaDescription">'+slaDescription+'</span></div></div></div>';
                return col_str;
            },
    
            rowdataConstructForSelectSLA : function(table_info,component){
                table_info.list_info.search_criteria=[{"field":"is_service_sla","value" : true,"condition":"is"},{"field":"deleted","value":false,"condition":"is","logical_operator":"and"}]; //No I18N
                return table_info;
            },
    
        	getSlaTimeString: function(days, hours, minutes){
                /* get service level agreements time format */
        		var timeString = '';
                const { rulesActionsComponent } = this;
                const { day_i18n_key, hrs_i18n_key, mins_i18n_key } = rulesActionsComponent.get("slaActionData");
        		if(days!=null && days!="0"){
        			timeString = days+" "+day_i18n_key;
        		}
        		if(hours!=null && hours!="0"){
        			timeString = timeString===""?(hours+" "+hrs_i18n_key):(timeString+" "+hours+" "+hrs_i18n_key);
        		}
        		if(minutes!=null && minutes!="0"){
        			timeString = timeString===""?(minutes+" "+mins_i18n_key):(timeString+" "+minutes+" "+mins_i18n_key);
        		}
        		return timeString;
        	},
    
        	renderSlaRuleAction: function(selSlaId){
                /*rendering sla rule's action */
        		var slaObj = null;
                const { rulesActionsComponent } = this;
                const { yes_i18n_key, no_i18n_key } = rulesActionsComponent.get("slaActionData");
        		sdpAjax({
        			url: '/api/v3/slas/'+selSlaId, //No i18n
                    type: "GET", //No i18n
                    async: false,
                    success: function(resp) {
                    	slaObj = resp.sla;
                    }
        		});
        		Ember.set(rulesActionsComponent.get('slaActionData'), 'sla', slaObj); //No i18n
        	},
        	renderSelectSLAList: function(rulesActionsComponent){/*renders all active SLAs in popup */
                var _self = this;
                /** Store rulesActionComponent reference in $wfRuleUtil for later use - coz some methods may be
                directly called from parent component and getting the rulesActions component object from there will
                add unnecessary complexity. Since 'renderSelectSLAList' method is called before calling any other
                method related to SLA, rulesActionsComponent will never be null in those methods. */
                _self.rulesActionsComponent = rulesActionsComponent;
                var row_count = 10;
                if(rulesActionsComponent.get('slaActionData.table_comp')!=null){
                    var table_compreq = rulesActionsComponent.get('slaActionData.table_comp');
                    row_count=table_compreq.t_obj.table_info.list_info.row_count;
                }
                var table_info = {"list_info":{"row_count": row_count ,"start_index":"1"}}; //NO I18N
                _self.loadSlaTableComponentInPopUp(table_info);
            },
            loadSlaTableComponentInPopUp : function(table_info){
             /* sla table component list view */
              const { rulesActionsComponent } = this;
                rulesActionsComponent.setProperties({
                    slaActionData: {
                        'day_i18n_key': translate('common.day'),// No I18N
                        'hrs_i18n_key': translate('common.hrs'),// No I18N
                        'mins_i18n_key': translate('common.mins'),// No I18N
                        'yes_i18n_key': translate('sdp.admin.settings.yes'),// No I18N
                        'no_i18n_key': translate('sdp.admin.settings.no')// No I18N
                    },
                });
              var table_content = {};
                  table_content.header = this.headerdataConstructForSelectSLA(table_info,this);
                  var _self = this;
                    var options = {};
                        options.paginationEnabled   = true;
                        options.searchEnabled       = true;
                        options.sortingEnabled      = false;
                        options.multiDeleteEnabled = false;
                        options.default_sort_field = {"sort_field" :"id", "sort_order" : "asc"}; //No i18n
                        options.callbackRowfunction = _self.rowdataConstructForSelectSLA;
                        options.row_inputdata       = _self.rowdataConstructForSelectSLA(table_info,_self);
                        options.callbackURL         = "slas"; // No I18N
                        options.entity_name         = "slas"; // No I18N
                        options.tableHolder         = "slas"; //No i18n
                        options.delete_entity_name  =translate('sdp.admin.sla.title'),
                        options.isODAPI             = true;
                        options.width               = jQuery("#chooseSLA").width()-75;
                        options.nodataString        = '<div class="pos-rel tc p10">'+translate("sdp.listview.nodataavailble")+'</div>',
                        options.staticHeader        = true;
                        options.view                = "kanban"; //No i18n
                        options.view_mode           = "linear"; //No i18n
                        options.isFR_ListInfo_Support = true;
                        options.column_settings = {
                        "default_position": 2,//No I18N
                        "assign_label_width": false,//No I18N
                        "assign_content_width":false,//No I18N
                        "columns": [{ //No i18n
                            "size": 1, //No i18n
                            "width": "50px",//No I18N
                        }, {
                            "size": 11 //No i18n
                        }]
                    };
                        var table_compreq = new tableComponent(table_info,table_content,options,_self);
                        $('#search-term').val('');
                        $('#sla-clear-search').addClass('hide');
                        Ember.set(rulesActionsComponent.get('slaActionData'), 'table_comp', table_compreq); //No i18n
          },
    
            searchlistViewInSLAPopup : function(clearSearch){
                /* Search from apply sla popup*/
                var _self = this;
                const { rulesActionsComponent } = _self;
                if(!clearSearch){
                    $('#sla-clear-search').removeClass('hide');
                }
                var enter_key = event.keyCode || event.which;
                if(enter_key == 13 || clearSearch){
                    var search_val = clearSearch ? "" : jQuery("#search-term").val();
                    if(clearSearch || search_val == ""){
                        jQuery('#search-term').val('');
                        $('#sla-clear-search').addClass('hide');
                    }
                    var table_compreq = rulesActionsComponent.get('slaActionData.table_comp');
                    var criteria = [{"field":"is_service_sla","value" : true,"condition":"is"},{"field":"deleted","value":false,"condition":"is","logical_operator":"and"},{"field":"name","value":search_val,"condition":"contains","logical_operator":"and"}]; //No I18N
                    table_compreq.t_obj.table_info.list_info.search_criteria = criteria;
                    table_compreq.refreshTable();
                }
            },
    
    
            selectSLA: function(){
                /* asssociating sla with br */
    
                var _self = this;
                var slaPopUpDialog = $('#slapopup');
                var selectedSla = slaPopUpDialog.find('div[id=slas_kanban_div]').find("input[name='chooseslaval']:checked");
                if(selectedSla.attr("id")===undefined){
                    showalert('failure',translate("sdp.admin.noslaselected"),'isAutoHide=true,closeOnEscKey=yes'); //No i18n
                    return false;
                }
                var selSlaId = selectedSla.attr("id");
                _self.renderSlaRuleAction(selSlaId);
                slaPopUpDialog.dialog('close'); //No i18n
            },
    
            cancelSlaPopupDialog: function(){
                /* for resetting the dialog popup and close */
    
                var _self = this;
                var slaPopUpDialog = $('#slapopup');
                slaPopUpDialog.dialog('close'); //No i18n
            },
    
            closeSlaPopupDialog: function(){
                /* for closing the dialog popup */
    
                var _self = this;
                const { rulesActionsComponent } = _self;
                var sla = rulesActionsComponent.get('slaActionData.sla');
                var slaPopUpDialog = $('#slapopup');
                slaPopUpDialog.dialog('close'); //No i18n
                /** Reset the slaActionData object. */
                Ember.set(rulesActionsComponent, 'slaActionData', null); //No i18n
                return sla;
    
            },
            /*
            *To transform field criteria value during save/get
            *data - field criteria data
            *type - API method
            */
            serializeDataCallBack: function(data,type){
                //SD-117288 Added check when approval criteria is set with approvallevel>request>maintenance
                if(data.field=="maintenance" || data.field=="request.maintenance" || data.field=="approval_level.request.maintenance"){
                    if(type=="get"){
                        if((data.condition=="is"&&data.values&&data.values[0]&&data.values[0]=='true')||(data.condition=="is not"&&data.values&&data.values[0]&&data.values[0]=='false'))
                        {
                            data.condition="is not"; //No i18n
                            data.values=[null];
                        }
                        else
                        {
                            data.condition="is"; //No i18n
                            data.values=[null];
                        }
                    }
                    else{
                        if(data.condition=="is"&&data.values&&data.values.length>0&&data.values[0]==null)
                        {
                            data.values=['false'];
                        }
                        else
                        {
                            data.condition="is"; //No i18n
                            data.values=['true'];
                        }
    
                    }
                    return data;
                }
                else{
                    return data;
                }
            },

        // renders remove all sites dialog
        renderRemoveSitesDialog: function(sites){
            const sitesHtml = sites.map(site => "<li class='text-wrap'>" + e_html(site.name) + "</li>");
            const containerHeight = jQuery('[aria-describedby="addnew_form"]').height();
            const containerWidth = jQuery('[aria-describedby="addnew_form"]').width();
            const title = '<a href="/" id="closeRemoveAllDialog" class="btn btn-default btn-xs fl mr10 top1"><span class="cspr go-back icon-xs"></span></a> ' + translate("remove.all.sites");
            const direction = window.sdp_user.DIRECTION === "RTL" ? "left" : "right";
            const pos = direction + " top";
            jQuery('#removeSitesDialog').dialog({
                'draggable':false,// No I18N
                'autoOpen':true,// No I18N
                'resizable':false,// No I18N
                show: {
                    effect:'slide',// No I18N
                    direction
                },
                'position': { my: pos, at: pos, of: '[aria-describedby="addnew_form"]' },// No I18N
                'width': 0.75 * containerWidth,
                'height': containerHeight,
                'modal':true,// No I18N
                 open (){
                    jQuery('#removeSitesDialog').prev(".ui-dialog-titlebar").find(".ui-dialog-title").html(title);
                    jQuery('#removeSitesDialog').find("ul").html(sitesHtml);
                    jQuery('#closeRemoveAllDialog').off('click').on('click',function (event){ //No I18N
                        jQuery('#removeSitesDialog').dialog('close'); //No I18N
                         event.preventDefault();
                         event.stopPropagation();
                    });

                 },
                  close () { // the dialog needs to be destroyed for proper binding of actions with events as it is constructed and rendered for every click event
                    jQuery('#removeSitesDialog').dialog('destroy');
                  },
            });
        },

        updateSiteDataForRuleGroup: function(groupId, dialogId, tableObject, self){
            showconfirm(true,'title='+translate('common.confirm')+', message='+translate('confirm.remove.sites')+', submitbutton='+translate('common.yes')+', cancelbutton='+translate('common.no')+', closebutton=yes, closeOnEscKey=yes', removeSiteMapping, true);
            function removeSiteMapping(confirmRemove){
                if(confirmRemove){
                    // make ajax call to update sites data
                    const input_data = {
                        "request_business_rule_group":{
                            "site":[]
                        }
                    };
                    sdpAjax({
                        url: '/api/v3/request_business_rule_groups/' + groupId, //NO I18N
                        type: 'PUT',
                        data:sdpAjaxInputData(input_data),
                        async: false,
                        cache: false,
                        success: function(data) {
                            showalert("success", getMessageForKey("remove.success.msg", [getMessageForKey("sdp.reports.globalview.allsites")]), 'isAutoHide=true');//NO I18N
                            jQuery('#' + dialogId).dialog('close');
                            // update sites in model as it is used for update API call
                            if(dialogId === 'removeSitesDialog' && self && self.get('model') != null){
                                const sites = self.get('model.site') ? self.get('model.site') : null;
                                if(sites != null){
                                    Ember.set(self, 'model.site', []);
                                }
                                jQuery('#request_business_rule_groups_site').parent().parent().removeClass('disp-ib').addClass('hidden');
                            }
                            // refresh rule groups table data
                            tableObject ? tableObject.refreshTable() : null;
                        }
                    });
                }
            }
        }
  }
})();
