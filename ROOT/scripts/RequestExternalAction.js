/* $Id$ */

var critCont = "";
var liArray;
var triggerAllData;
var ExecutionAllData;
var notificationDetails;
var module;
var data_loading_text = "<span class='icon-sm spinner-icon1 mr5'></span>";
var executorValue='';
var dreScriptValue={};
var request_action ={
	// for loading default actions
	externalActionAutoEvents : function(){
					   var jDoc = jQuery(document);
					   module=$Html('module');//No I18N
					   jDoc.off('click','#popup').on('click','#popup',function(e){//No I18N
						   request_action.openPopup(this);
					   }).on('click','.minus-icon',function(e) {//No I18N 
						   request_action.removeSec(this);
					   }).find('#save_action').on('click',function(e){//No I18N
						   request_action.saveAction(this);
					   }).end().find('#c-action,list-view').on('click',function(e){//No I18N
						request_action.showActionList(this);
					   }).end().find('#executor_type').on('change',function(e){
							request_action.changeExample(this);
						});
	},  

				   
	// for change example
	changeExample : function(that){
				if(jQuery(that).val() == 'webhook'){
					showWebhook();
					jQuery('#script-message').hide();
					return;
				}
				if(jQuery(that).val() !== 'custom_function') {
					jQuery('#action_main').find("input[id='executor']").select2("destroy");	//No I18N
					jQuery("#example").show();
						if(jQuery(that).val() === 'script'){
						$Html('example', $Html('scriptExample'));//No I18N
						jQuery('#script-message').show();
					}
					else if(jQuery(that).val() === 'class'){
						$Html('example', $Html('classExample'));//No I18N
						jQuery('#script-message').hide();
					}
					if(executorValue != '') {
						jQuery('#action_main').find('#executor').val(executorValue);
					}
					//});
				}else{
					showDREFunction();
					jQuery('#script-message').hide();
					//showURLInDialog("../setup/DelugeEditor.jsp","width=1000,height=500,modal=true");
				}					
	},

	// for saving auto action
	saveAction: function(){
	    if(sdp_app.IS_DEMO_BUILD){
            window.showalert('failure', translate("sdp.setup.orgdef.demoonline.jserror"), "isAutoHide=false");      //NO I18N
                return
        }
		var jq = jQuery('#action_main');
		var ruleobj = {"details":[],"criteria":[],"action":[]};//No I18N
		var name  = getIdVal(jq,'action_name'),desc=getIdVal(jq,'action_desc'),trig = getIdVal(jq,'t_action'), e_time = getIdVal(jq,'e_time'),isError=false;//No I18N
		var details = {"name" : name, "desc" : desc, "trigger" : trig, "executiontime" : e_time, "cascade" : document.getElementById('r_cascade').checked },errMsg=$Html('disp_errors');//No I18N
		if(module=="change" || module=="task" || module=="project")
		{
			e_time="1";
		}
		if(name !== ''){			    
			ruleobj.details.push(details);
		}
		else{
			isError = true;
			errMsg = errMsg +$Html('name_errMsg');//No I18N
		}

        var isValidCriteria = true;
        if(module=="task" || module=="project"){
            ruleobj.criteria=cust_trigger.criteriaComponentOutput();
        }else{
            ruleobj = request_action.setCritObj(jq,ruleobj);
        }
		var len3 = ruleobj.criteria.length;
		if((len3 < 1 && module =='change' && !(trig=='4' || trig=='5' || trig=='6'))
		    || (module== 'task' && !sdp_app.IS_TCT_EMPTY_CRIT_ALLOWED && ruleobj.criteria[0].field=="-1") || (module== 'project' && !sdp_app.IS_PCT_EMPTY_CRIT_ALLOWED && ruleobj.criteria[0].field=="-1")){
			isError = true;
			if(errMsg === $Html('disp_errors')){
				errMsg = errMsg + $Html('crit_err_Msg');//No I18N
			}
			else{
				errMsg = errMsg +", "  +$Html('crit_err_Msg');//No I18N
			}
		}else if (((module== 'task' && !sdp_app.IS_TCT_EMPTY_CRIT_ALLOWED) || (module =='project' && !sdp_app.IS_PCT_EMPTY_CRIT_ALLOWED)) && !cust_trigger.isValidFilterCondition(ruleobj.criteria)){   //No I18N
		    isError=true;
		    isValidCriteria=false;
		}

        if (((module== 'task' && sdp_app.IS_TCT_EMPTY_CRIT_ALLOWED) || (module =='project' && sdp_app.IS_PCT_EMPTY_CRIT_ALLOWED)) && ruleobj.criteria[0].field=="-1" ){
        			ruleobj.criteria[0].condition="and";
        }

		var executor_type = getIdVal(jq,'executor_type');	//No I18N
		var value = getIdVal(jq,'executor');	//No I18N
		if(value != null && value !== '') {
			if('custom_function'=== executor_type) {
				value = "{\"function_id\":\""+value+"\"}";		//No I18N
			}
			if('webhook'=== executor_type) {
				value = "{\"webhook_id\":\""+value+"\"}";		//No I18N
			}
			var actobj = {"exe_type" : executor_type ,"executor" : value};//No I18N
			var executor = {"execute":actobj};//No i18N
			ruleobj.action.push(executor);
		}
		else{
			var notificationCount = jQuery('[data-name=ruleemail]').find('div[data-id *= rule_]').length;
			var notificationCount1 = jQuery('[data-name=rulesms]').find('div[data-id *= rule_]').length;
			//For Request module, if executor is not mention, check whether notifications are added, if not available then show alert
			if((module == "request" && notificationCount == 0)  || module == "change" || module == "task"  || module == "project"){
				isError = true;
				var action_error = $Html('action_errMsg');//No I18N
				if(module == "request"){
					action_error = $Html('action_exe_notification_errMsg');//No I18N
				}
				if(errMsg === $Html('disp_errors')){
					errMsg = errMsg + action_error;
				}
				else{
					errMsg = errMsg +", " +action_error;//No I18N
				}
			}
		}
		if(isError){
		   if(isValidCriteria){
			jQuery('#errdiv_Msg').css('display','block').find('#errormsgid').html(errMsg); //No I18N
		   }
			scroll(0,0);
			return false;
		}
		if(module=="request"){
					if('custom_function' !== executor_type && 'webhook' !== executor_type) {
						var executorVal = getIdVal(jq,'executor');//No I18N
						if(executorVal.include("$COMPLETE_V3_JSON_FILE") && (executorVal.include("$COMPLETE_JSON_FILE") || executorVal.include("$DIFF_JSON"))){
		                	errMsg = $Html('v3_argument_error');//No I18N
		                	jQuery('#errdiv_Msg').css('display','block').find('#errormsgid').html(errMsg); //No I18N
							scroll(0,0);   
							return false;
			        	}
			        }
			        ruleobj = request_action.setNotificationDetails(ruleobj);
			    }

			    var url = '/RequestExternalAction.do?method=saveAutoAction&module='+ encodeURIComponent(module); //No I18N
		var action_id = $Val('auto_actionid');//No I18N
		if(action_id !== null && action_id !== '' && action_id !== undefined){
						url = url+'&action_id='+encodeURIComponent(action_id); //No I18N
		}
		var items = Object.toJSON(ruleobj);
		var dataVal = {"items" :items}; //No I18N
		dataVal[getCSRFParamName()]=getCSRFParamValue();
		if(isMSP)
		{
			if(document.getElementsByName("customtriggerAllAccounts").length == 0 || document.getElementsByName("customtriggerAllAccounts")[0].checked)
			{
				dataVal["accountsList"]="";//No I18N
				dataVal["customtriggerAllAccounts"]="customtriggerAllAccounts";//No I18N
			}
			else{
				var selectedAccounts=document.getElementsByName("selectedAccountsBox")[0];
				var accountsList='';
				for (var i = 0; i < selectedAccounts.length; i++) {
					accountsList +=selectedAccounts[i].value + "#----#";//No I18N
				}
				dataVal["accountsList"]=accountsList;//No I18N
			}
		}
		jQuery.post(url, dataVal,  function( data ) {//No I18N
			if(data === 'samename'){
				jQuery('#errdiv_Msg').css('display','block').find('#errormsgid').html($Html('same_name_alertmsg')); //No I18N
				jQuery("#action_name").trigger('focus');
				return;
			}	
		if(data==='dataerror')
		{
			jQuery('#errdiv_Msg').css('display','block').find('#errormsgid').html($Html('save_error_mesg')); //No I18N
			return;
		}

		if(data==='empty_crit_not_allowed')
		{
			scroll(0,0);
			jQuery('#errdiv_Msg').css('display','block').find('#errormsgid').html($Html('empty_crit_mesg')); //No I18N
			return;
		}
		if (data.includes("RestrictedForDemo")) {
            window.showalert('failure', translate("sdp.setup.orgdef.demoonline.jserror"), "isAutoHide=false");      //NO I18N
            return
        }
		 if (data.includes("Restricted"))
		 {
            window.showalert('failure', data, "isAutoHide=true");      //NO I18N
            return ;
		 }
		 if (data.includes("invalid_executor_file"))
		 {
            window.showalert('failure', translate('api.customschedules.invalid.executor_file'), "isAutoHide=true");      //NO I18N
            return ;
		 }
		jQuery('#emptyCustomList').hide();
		jQuery('#actionList').find('tr[id^=action]').not('#actionDetails').remove(); //No I18N
		jQuery('[data-name=ruleemail]').find('div[data-id *= rule_]').remove();
		jQuery('[data-name=rulesms]').find('div[data-id *= rule_]').remove();
		request_action.showActionDetails();					    
		jQuery('#addaction').hide();
		jQuery('#actionlistview').show();
		if(data ==='success'){
			showMessageAndClose($Html('save_success_mesg'),4000); //No I18N
		}
		//To handle error's in proper way
		else if(data.includes("/jsp/AuthError.jsp?module=Error"))
		{
			window.location.href="/jsp/AuthError.jsp?module=Error";
		}
		else{
			showMessageAndClose($Html('save_error_mesg'),4000); //No I18N
		}

		});

	},
			
	// for opening organizing auto actions popup
	organizeActions :  function(){
		var url = "/RequestExternalAction.do?method=organizeActions&module="+encodeURIComponent(module); //No I18N
		NewWindow(url, 'OrganizeAction', '420', '325', 'yes', 'center');
	
	},
	
	// for saving organizing auto actions
	saveOrganizeActions : function(){
	    if(sdp_app.IS_DEMO_BUILD){
            window.showalert('failure', translate("sdp.setup.orgdef.demoonline.jserror"), "isAutoHide=false");      //NO I18N
                return
        }
		module=$Html('module');//No I18N
		var url = "/RequestExternalAction.do?method=saveReOrderActions&module="+encodeURIComponent(module); //No I18N
		var val = jQuery("#show_actions option"),len=val.length,ids='';//No I18N
		var forward;
		if(module == 'request')
			{
			forward="externalAutoAction";//No I18N
			}
		else if(module == 'change')
		{
			forward="changeautoaction";//No I18N
		}
		else if(module == 'task' || module == 'project'){
			forward=module+"autoaction";//No I18N
		}
		for(var i=0;i<len;i++){
			if(ids === ''){
				ids = val[i].value;
			}
			else{
				ids = ids +","+val[i].value
			}
		}
		var data={"reorderItems" :ids}; //No I18N
		data[getCSRFParamName()]=getCSRFParamValue();
		jQuery.post(url, data, function( data ) {//No I18N
			if(data === 'success'){
					window.opener.location.href="/SetUpWizard.do?forwardTo="+forward+"&isReorder=true"; // NO OUTPUTENCODING
					window.close();								
			}
			else if(data === 'failure'){
					window.opener.location.href="/SetUpWizard.do?forwardTo="+forward+"&isReorder=failure";// NO OUTPUTENCODING
					window.close();					
			}else if(data === "RestrictedForDemo"){//NO I18N
                window.showalert('failure', translate("sdp.setup.orgdef.demoonline.jserror"), "isAutoHide=false");      //NO I18N
            }
		});
	
	},
	alterMandatoryMark: function(that){
		if(module === 'change')
		{
			var d=jQuery('#t_action').val();
			if(d== '4' || d =='5' || d =='6')
			{
			jQuery('#mandatory_mark').removeClass();
			jQuery('#mandatory_mark').addClass("hide");
		 }
		 else
		 {
		 	jQuery('#mandatory_mark').removeClass();
			jQuery('#mandatory_mark').addClass("mandatory");
		 }
		}
	},
	// for reordering actions	
	
	reorderActions : function(from){
			if(from === 'up'){
				jQuery('#show_actions option:selected').each(function(i, selected) {
					if (!jQuery(this).prev().length){
					       	return false;
					}
					jQuery(this).insertBefore(jQuery(this).prev());
				});
				jQuery('#show_actions option').trigger('focus').trigger('blur');			
			}
			else if(from === 'down'){
				jQuery(jQuery('#show_actions option:selected').get().reverse()).each(function(i, selected) {
				if (!jQuery(this).next().length) {
					return false;
				}
				jQuery(this).insertAfter(jQuery(this).next());
				});
				jQuery('#show_actions option').trigger('focus').trigger('blur');		
			}
	},	

	setCritObj: function(jq,ruleobj){
			    jq.find('#critdiv').find('select[name=sel_crit]').each(function(){
				    var th = jQuery(this).parents('table').eq(0);//No I18N
				    var selcrit= getSelVal(th,'sel_crit');//No I18N
				    var selcon= getSelVal(th,'sel_cond');//No I18N
				    var comp= getSelVal(th,'comparator');//No I18N
				    var vals ;
                                    if(selcrit=='54' || selcrit=='6'){
                                            //Get the selected site's by getting the particular elementID
                                            var userSite = th.find('input[name=critId]').attr('id');
                                            vals=th.find('#'+userSite).val();
                                    }
                                    else
                                    {
                                            vals=th.find('#crit_vals').val();
                                    }
				    var critobj = {"selcrit" : selcrit ,"selcon" : selcon,"comp" : comp,"values" : vals};//No I18N
					if(selcrit != '0' && vals != '' && vals != undefined) { 
							ruleobj.criteria.push(critobj);
					}
			    });
			    return ruleobj;
	},
	setNotificationDetails: function(ruleobj){
		var notification_details=[];
		jQuery('[data-name=ruleemail]').find('div[data-id *= rule_]').each(function(){
			var value = jQuery(this).html();
			var template = JSON.parse(jQuery(this).find('input[data-id=template]').val());
			
			var notification = {}
			notification.template_id = template.id;
			//this mode is action type i.e., either EMAIL/SMS action
			notification.mode = 'EMAIL'; //No I18N

			var toAddr = jQuery(this).find('input[data-id=toAddr]').val();
			
			var to = request_action.processData(toAddr);
			
			notification.to = to;//getToAddress(jQuery(this).find('input[data-id=toAddr]').val());
			notification_details.push(notification);
		});
		jQuery('[data-name=rulesms]').find('div[data-id *= rule_]').each(function(){
			var value = jQuery(this).html();
			var template = JSON.parse(jQuery(this).find('input[data-id=template]').val());
			
			var notification = {}
			notification.template_id = template.id;
			//this mode is action type i.e., either EMAIL/SMS action
			notification.mode = 'SMS'; //No I18N

			var toAddr = jQuery(this).find('input[data-id=toAddr]').val();
			
			var to = request_action.processData(toAddr);
			
			notification.to = to;//getToAddress(jQuery(this).find('input[data-id=toAddr]').val());
			notification_details.push(notification);
		});
		if(ruleobj.action[0] !== undefined){
			ruleobj.action[0].notification_details = notification_details;
		}
		else{
			var notification = {'notification_details':notification_details};//No I18N
			ruleobj.action.push(notification);
		}
		return ruleobj;
	},
	// for removing section
	removeSec : function(that){
			    th = jQuery(that).parents('table').eq(0);//No I18N
			    if(th.parents('div').eq(0).find('table').length > 1){
				    th.remove();
			    }

	},

	// for opening popup
	openPopup :  function(that){
			     this.closePopup();
			     var cu = jQuery(that).parents('table').eq(1), sboxs = cu.find('select');//No I18N
			     var crit1 = sboxs.eq(0).val(), crit2 = sboxs.eq(1).val(), crit_vals = cu.find('input[name=crit_vals]').val(), critId = cu.find('input[name=critId]').attr('id'),divNum = parseInt(critId.substring(critId.indexOf('critId_')+7));//No I18N

			     if (crit1 == '0'){
				     alert($Html('txt_crit'));//No I18N
			     }else{
				     var url = 'RulePopUp.do?selVal='+encodeURIComponent(crit1)+'&element1='+encodeURIComponent(crit2)+'&element2='+encodeURIComponent(crit_vals)+'&critId='+encodeURIComponent(critId)+'&from=rule&mode=forautoaction&module='+encodeURIComponent(module);//No I18N
				     var params = '';
					 if(isMSP)
					 {
						if(document.getElementsByName("customtriggerAllAccounts").length == 0 || document.getElementsByName("customtriggerAllAccounts")[0].checked)
						{
							params={'accountsList' : '', 'customtriggerAllAccounts' : 'customtriggerAllAccounts'};//No I18N
						}
						else{
							var selectedAccounts=document.getElementsByName("selectedAccountsBox")[0];
							var accountsList="";
							for (var i = 0; i < selectedAccounts.length; i++) {
								accountsList +=selectedAccounts[i].value + "#----#";
							}
							params={'accountsList' : accountsList};//No I18N
						}
						
					 }
					 
				     var myAjax = new Ajax.Request(url, {method: 'get', parameters: params,
					     onComplete: function(resp, jsonObj){
						     jQuery('#crit_resp_'+divNum).css({"display":"block"}).html(resp.responseText);//No I18N
						     request_action.liObject();
						     jQuery('#textareaVal').trigger('focus').val(crit_vals);
						     return false;
					     }
				     });
			     }
	},
	loadOptions : function(element){

		var parent_element = jQuery(element).closest('tr');//No I18N
		var selected_field = parent_element.find("select#sel_crit");
		var selected_field_val = selected_field.val();
		if(selected_field_val.startsWith("udf_pick_") || selected_field_val.startsWith("udf_radio_")) {
			request_action.openPopup(parent_element.find("td#popup"));
		}
	},

	liObject :  function(){
			    if($ID('ulVals1') != null){
				    $ID('txtSearch').focus();//No I18N
				    jQuery('div[id=notify_obj]').css('overflow','');//No I18N
				    liArray = $ID('ulVals1').getElementsByTagName("li");
			    }
	},

	closePopup: function(){
			    jQuery('[id^=crit_resp_],[id^=act_resp_],[id^=cdropdown]').css("display","none").html('');// NO OUTPUTENCODING //No I18N 
			    jQuery('.c-table').css("background-color","transparent");//No I18N
			    return false;
	},

	// for searching li
	searchLi: function(that){
			  var searchVal = jQuery(that).val();
			  searchVal = searchVal.toLowerCase();
			  var doc=document;
			  if(searchVal.length > 2){
				  var finalTxt = '';
				  var liArr = liArray;
				  var len = liArr.length;
				  for (var i = 0; i < len; i++){
					  var plainText = liArr[i].innerText ?liArr[i].innerText :liArr[i].textContent;
					  if(plainText.toLowerCase().indexOf(searchVal) != -1){
						  var liID = liArr[i].getAttribute('id');
						  finalTxt = finalTxt +'<li class=fl id='+liID+'>'+liArr[i].innerHTML+'</li>';
					  }
				  }
				  doc.getElementById('ulVals2').innerHTML = finalTxt;
				  doc.getElementById('ulVals2').style.display = "block";
				  doc.getElementById('ulVals1').style.display = "none";
			  }else{
				  doc.getElementById('ulVals2').style.display = "none";
				  doc.getElementById('ulVals1').style.display = "block";	
			  }
	},
	
	cClass: function(that){
			var th = jQuery(that).find('img');
			if (th.is('.chbox-off')) {
				th.removeClass();
				th.addClass('chbox-on');
			}else{
				th.removeClass();
				th.addClass('chbox-off');
			}
	},

	updateSel: function(id){
			   var pHtml = jQuery('#'+id).parents('table').eq(0);//No I18N
			   var divId = 'critdiv', id1 ='crit_vals', id2= 'multiCVals', finalTxt = "";//No I18N
			   if(id.indexOf('action') != -1){
				   id1 ='action_vals';//No I18N
				   id2 = 'multiAVals';//No I18N
				   divId = 'actiondiv';//No I18N
			   }
			   var is_udf = jQuery(pHtml).find("select#sel_crit").val().startsWith("udf_");//No I18N

			   var ids= new Array();
				jQuery('#'+divId+' input:checked').each(function(){
				   var cu = jQuery(this).closest("li");	//No I18N
				   var id = cu.attr('id').substring(5);//No I18N
				   if(ids.indexOf(id) === -1){
				   	   if(is_udf) {
				   	   	id = id.replaceAll(",", ",,");
				   	   }
					   ids.push(id);
					   var liID = id1+"_"+id;
					   var txt = request_action.getLiHtml(cu.text(),liID);
					   if(finalTxt == ""){
						   finalTxt  = txt; 
					   }else{
						   finalTxt = finalTxt +txt;
					   }
				   }
			   });
			   pHtml.find('input[name='+id1+']').val(ids);
			   pHtml.find('#'+id2+' ul').html(finalTxt);
			   request_action.LIHtmlEventBinding();
			   this.closePopup();
	},
	
	getLiHtml : function(txt,id){
			    if(id != null && id != undefined){
				    return "<li id='"+id+"'><span class=\"fl\">"+e_html(txt)+"</span><a class=\"deletekey\" data-name='get_remove_sel_val' title=\"Delete\"><img border=\"0\" src=\"/images/spacer.gif\"></a></li>";//No I18N
			    }else{
				    return "<li><span class=\"fl\">"+e_html(txt)+"</span><a class=\"deletekey\" data-name='remove_txt_val' title=\"Delete\"><img border=\"0\" src=\"/images/spacer.gif\"></a></li>";//No I18N
			    }

				
	},

	LIHtmlEventBinding : function(){
		jQuery(document).off("click.getselval").on("click.getselval","[data-name='get_remove_sel_val']", function(){ //No I18N
			request_action.removeSelVal(this);
		});
		jQuery(document).off("click.removetxtval").on("click.removetxtval","[data-name='remove_txt_val']", function(){ //No I18N
			request_action.removeTxtVal(this);
		});
	},

	removeSelVal :function(that){
			      var id = jQuery(that).parent().attr('id'),ind = id.indexOf('vals_');//No I18N
			      var a_Id = id.substring(ind+5),m_Id = id.substring(0,ind+4);
			      var par = jQuery(that).parents('table').eq(1).find('#'+m_Id);//No I18N
			      var ids = new Array();
			      ids = par.val().split(',');
			      var r_Ind = ids.indexOf(a_Id);
			      if (r_Ind !== -1) {
				      ids.splice(r_Ind,1);
			      }
			      jQuery(that).parent().remove();
			      ids = request_action.cleanArray(ids);
			      par.val(ids);
	},
	
	cleanArray : function(ids){
			     var arr = new Array();
			     for(var i = 0, len =ids.length; i<len; i++){
				     if (ids[i]){
					     arr.push(ids[i]);
				     }
			     }
			     return arr;
	},
	
	removeTxtVal :function(that){
			      jQuery(that).parents('table').eq(1).find('#crit_vals').val('');//No I18N
			      jQuery(that).parent().remove();
	},
	
	updateTxtVal: function(that){
			      jQuery(that).parents('table').eq(1).find('#crit_vals').val(jQuery(that).val());//No I18N
	},
	
	removeText:function(that){
			   var th = jQuery(that),pl = $Html('srchTxt'),val = th.val().trim();//No I18N
			   if (pl != '' && val == pl) {
				   th.val('');
			   }
	},
	
	placeText:function(that){
			  var th = jQuery(that),pl = $Html('srchTxt'),val = th.val().trim();//No I18N
			  if (pl != '' && (val == '' || val == pl)) {
				  th.val(pl);
			  }
	},
		  
	updateTxt: function(id){
			   jQuery('#NumericError').css('display','none');//No I18N
			   var th = jQuery('#'+id).parents('table').eq(0);//No I18N
			   var txtVal =th.find('div[id^=crit_resp] textarea').val().trim();
			   var crit = getSelVal(th,'sel_crit');//No I18N
			   if(!checkUDFLongValue(txtVal) && ( (crit.indexOf("udf_long_")>=0))){
					jQuery('#NumericError').css('display','block');//No I18N
					return false;
			   }
			   if(!checkUDFDecimalValue(txtVal) && ( (crit.indexOf("udf_decimal_")>=0) || crit == "71" || crit == "72")){
					jQuery('#DoubleError').css('display','block');//No I18N
					return false;					
			   }
			   if(crit == "71" || crit == "72") {
				   if(txtVal < 0) {
					   jQuery('#DoubleError').css('display','block');//No I18N
					   return false;
				   }
				   txtVal = parseFloat(txtVal).toFixed(2)
			   }
			   if((crit.indexOf("udf_decimal_")>=0)){					
					txtVal = txtVal.replace("+",""); // NO OUTPUTENCODING					   
			   }
			   var fTxt = '';
			   if(txtVal != ''){
				   fTxt = request_action.getLiHtml(txtVal);
			   }
			   th.find('#crit_vals').val(txtVal).end().find('#multiCVals ul').html(fTxt);
			   request_action.LIHtmlEventBinding();
			   this.closePopup();
	},
	
	
	getValID: function (par){
		       var id = 'crit_vals';//No I18N
		       if(par.find('#action_vals').length > 0){
			       id = 'action_vals';//No I18N
		       }
		       return id;
	},
	
	getHtmlID: function (par){
			  var id = 'multiCVals';//No I18N
			  if(par.find('#multiAVals').length > 0){
				  id = 'multiAVals';//No I18N
			  }
			  return id;
	},
		   
	// For new Action
	showAddNewAction : function(){
				   $Val('auto_actionid',''); //No I18N
				   var main = jQuery('#action_main');
				   main.find('#action_name,#action_desc,#executor').val('');
				   executorValue='';
				   dreScriptValue={};      
				   if(module=="change" || module=="task" || module=="project")
						{
						main.find('#e_time').hide();
						}
					   else
					   	{
						   main.find('#e_time').val('1');
					   	}
				main.find('#t_action').val('1');
				main.find('#executor_type').val('custom_function'); //No I18N
				if('task'== module || 'project'==module) {
                    cust_trigger.initCritComp('addNewCriteria',module,null);		// No I18N
                }
                    jQuery("#container1").filterFields("reset"); //No I18N
				  showDREFunction();
								  
				   main.find('#r_cascade').attr("checked", true);

				   if(critCont !==''){
						jQuery('#critdiv').html(critCont);
						bindEventsForCriteriaElements('#critdiv');//No I18N
				   }
				   jQuery('#addaction').show();
				   jQuery('#actionlistview,#errdiv_Msg').hide();	
				   main.find('#action_name').trigger('focus');  

				   if(module=="change")
					{
					   jQuery('#mandatory_mark').removeClass();
						jQuery('#mandatory_mark').addClass("mandatory");
					   }
					    jQuery('#script-message').hide();
				   if(isMSP && !(module=="task" || module=="project"))
				   {
					    document.getElementsByName('customtriggerAllAccounts')[0].checked = false;
						main.find('#__multibox__render__availableAccountsBox__selectedAccountsBox').show();
						var selAccs = document.getElementsByName('selectedAccountsBox')[0];
						for (var i = 0; i < selAccs.length; i++) {
								selAccs.options[i].selected = true;
						}
						document.getElementsByName('__selectedAccountsBox_to_availableAccountsBox')[0].click();
				   }
				   if((module=="task" && sdp_app.IS_TCT_EMPTY_CRIT_ALLOWED) || (module=="project" && sdp_app.IS_PCT_EMPTY_CRIT_ALLOWED)){
				        jQuery('#mandatory_mark').removeClass();
                        jQuery('#mandatory_mark').addClass("hide");
				   }
	},
	
	showActionList : function(){
				   scroll(0,0);
				 jQuery("#container1").filterFields("reset"); //No I18N
			       jQuery('#actionlistview').show();
			       jQuery('#addaction').hide();
	},

	// For change options
	changeCrit : function(that,type,elementData){
			 
			     var cu = jQuery(that),cuVal = cu.val(),su = parseInt(cuVal);
			     cu.parents('table').eq(0).find('#sel_cond').html('').end().find('input[type=hidden]').val('').end().find('[id^=crit_resp],[id^=s2id_]').html('');// NO OUTPUTENCODING //No I18N 
			     var opts = {3 : $Html('txt_is'),4 : $Html('txt_isn')};//No I18N
			     //if(su!=null && ((su>='1' && su<='5') || (su >= '16' && su<= '39')))
			     var dynamicTd = cu.closest('table').find('#dynamicTd');//No I18N
			     var popup = cu.closest('table').find('#popup');//No I18N
			     var usersiteID = cu.closest('table').find('input[name=critId]').attr('id');//NO I18n
			     var siteselect2Elt = cu.closest('table').find('#s2id_'+usersiteID);//No I18N
			     if(su!=null && su !='54' && su!='6'){
				     //siteselect2Elt.removeClass().addClass("hide");   
				     popup.removeClass().addClass("show");         
				     dynamicTd.removeClass().addClass("show");
				     if(su!=null && cuVal!==null && ((su>='1' && su<='5') || (cuVal.indexOf("udf_")>=0) || su =='71' || su=='72'))
				     {
				     	if(su =='71' || su=='72' || (cuVal.indexOf("udf_long_")>=0) || (cuVal.indexOf("udf_decimal_")>=0)) {
				     		opts = {7 : getMessageForKey("sdp.condition.7"), 8 : getMessageForKey("sdp.condition.8"), 9 : getMessageForKey("sdp.condition.9"), 10 : getMessageForKey("sdp.condition.10"), 11 : getMessageForKey("sdp.condition.11"), 12 : getMessageForKey("sdp.condition.12")};//No I18N
				     	}else {
				     		opts = {1 : $Html('txt_con'),2 : $Html('txt_dcon'),3 : $Html('txt_is'),4 : $Html('txt_isn'),5 : $Html('txt_beg'),6 : $Html('txt_end')};//No I18N
				     	}

				     }
				     request_action.addOpts(opts,cu);
				     var htmlTxt = jQuery('#multi_Html').html(),popupCl = "show";// NO OUTPUTENCODING //No I18N 
				     if(su!=null && (su=='1' || su=='2' || su=='3' || su=='4' || su=='5' || su=='54')){
					     htmlTxt = jQuery('#txt_Html').html();// NO OUTPUTENCODING
					     popupCl = "hide";//No I18N
				     }
				     var cuTable = cu.parents('table').eq(0).find('#dynamicTd').html(htmlTxt).end().find('#popup'); //No I18N
				     cuTable.removeClass().addClass(popupCl);//No I18N
				     if(popupCl === 'show' && type==='new'){
					     request_action.openPopup(cuTable);
				     }
			     }
			     if(su!=null && (su=='54' || su=='6')){
				     popup.removeClass().addClass("hide");         
				     dynamicTd.removeClass().addClass("hide");
				     //siteselect2Elt.removeClass().addClass("show");
				     request_action.addOpts(opts,cu);
				     if(su=='54'){
					     var params = '"module" : "site", "dropdownLength" : "25"';	// variable introduced for modifying params for MSP/SCP	//NO I18N
					     if(!isMSP){
							params = '{' + params + ', "defaultDropdownData" : {"id" : -3, "text" : "' + getMessageForKey("sdp.admin.technician.addtechnician.nosite") +'"}}';//NO I18N
						 }
						 if(isMSP){
							 //Fix for MSP Issue #12598
							 params= '{' + params +',"forautoaction" : "true"' + '}'; //NO I18N
						 }
					     updateSelect2Dropdown({ elementId : usersiteID, 
						     selectedData : elementData,
						     placeHolder : getMessageForKey("sdp.common.placeholder.site"),
						     isMultiple : true,
						     isOnChangeEventRequired:false,
						     params: params
					     });
				     }
				     if(su=='6'){
					    var userSelectInitInput = {element : usersiteID, multiple : true, value : elementData};	// variable introduced for modifying the configuration os Select2 for MSP/SCP
					    if(isMSP) {
					     	// custom trigger account based
							userSelectInitInput.fromModule = "forAutoAction";	//NO I18N
						} else if(isSCP) {
						 	userSelectInitInput.excludeTech = true;
						}
						userSelect.initializeSelect2(userSelectInitInput);
				     }	
			     }

			    
	},

	addOpts: function(opts,cu){
			 jQuery.each(opts, function(val, text) {
				 var opt = new Option(text, val);
				 jQuery(opt).html(text);
				 cu.parent().next().find('select').append(opt);
			 });
	},
	
	// for adding add criteria section
	addSec : function(id,nam){
			 var cont, pre = jQuery('input[name='+nam+']'),pId,num=1;
			 if(pre.html() != null) { //NO OUTPUTENCODING
				 var ids = $A(pre).pluck('id');//No I18N
				 pId = ids[ids.length-1];
				 num = parseInt(pId.substring(pId.indexOf('_')+1))+num;
			 }
			 if(id === 'critdiv'){
				 cont = critCont;
				 cont = cont.replace(/critId_1/gi,'critId_'+num); // NO OUTPUTENCODING
				 cont = cont.replace(/crit_resp_1/gi,'crit_resp_'+num);// NO OUTPUTENCODING
			 }else{
				 cont = actionCont;
				 cont = cont.replace(/actionId_1/gi,'actionId_'+num);// NO OUTPUTENCODING
				 cont = cont.replace(/act_resp_1/gi,'act_resp_'+num);// NO OUTPUTENCODING
			 }
			 jQuery('#'+id).append(cont);
			 request_action.stopEvent();
			 request_action.hoverTable();
			 bindEventsForCriteriaElements('#'+id);//No I18N 
	},
	
	hoverTable: function(){
			    jQuery('.c-table').on('mouseenter', function () { //No I18N
				    jQuery(this).css("background-color","#f9f9f9");//No I18N 
			    }).on('mouseleave', function () { //No I18N
				    jQuery(this).css("background-color","transparent");//No I18N
			    });  
	},
	
	stopEvent :  function(){
			     jQuery('[id^=act_resp_],[id^=crit_resp_]').on('click', function(e) {e.stopPropagation();});
	},
	//ChangeCT::
	populateConditions:function(){


		var actionListURL = "/RequestExternalAction.do?method=getTriggerActionData&module="+encodeURIComponent(module);//No I18N
		jQuery.ajax({ type: "GET", cache: false, url: actionListURL}).done(function(data){//No I18N
			triggerAllData=data.triggerInfo;
			ExecutionAllData=data.operationHours;
			jQuery("#t_action").empty();
			jQuery.each(triggerAllData, function(k, actionItem) {
				if(actionItem!=null)
					{
				var triggerData=actionItem;			
				jQuery("#t_action").append('<option value='+(k+1)+'>'+triggerData.selectname+'</option>');
			}});
			var operationHoursLen=ExecutionAllData.length;
			if(operationHoursLen==1)
			{
				jQuery("#e_time").hide();
			}
			else
			{
				var id=1;
				jQuery("#e_time").empty();
				jQuery.each(ExecutionAllData, function(k, actionItem) {
					var operationData=actionItem.selectvalue;
					jQuery("#e_time").append('<option value='+id+'>'+actionItem.selectvalue+'</option>');
					id++;

				});
			}
			request_action.getAutoActionListView();
		});
	},
	// For List view
	showActionDetails : function(){
					scroll(0,0);
					jQuery("#container1").filterFields("reset"); //No I18N
					jQuery('#organize_actions').show();
					request_action.populateConditions();
	},

	getAutoActionListView : function(){
		var actionListURL = '/RequestExternalAction.do?method=getAutoActionListView&module='+encodeURIComponent(module);//No I18N
				    jQuery.ajax({ type: "GET", cache: false, url: actionListURL}).done(function(data){//No I18N
						request_action.addCriteriaElements();
					    var actionList = data.ACTIIONS;
						var len = actionList.length;
					    if(len == 0)
				    	{
					    	jQuery("#emptyCustomList").show();
							jQuery('#organize_actions').hide();
					    	return;
				    	}
						if(len == 1)
						{
							jQuery('#organize_actions').hide();
						}						
						jQuery.each(actionList, function(k, actionItem) {
							var actionRow = jQuery('#actionDetails').clone().removeClass('disp-h');
							actionRow.prop("id","action"+actionItem.ACTIONID);//No I18N
							actionRow.find('#actionDisp').text(actionItem.ACTION_NAME);		
							actionRow.find('#trigger_type').attr('title',triggerAllData[actionItem.TRIGGERID-1].tooltip); //No I18N
							actionRow.find('#trigger_type').text(triggerAllData[actionItem.TRIGGERID-1].lvname); //No I18N
							if(module != "change" && module != "task" && module != "project")
							{
							actionRow.find('#exectuion_time_type').attr('title',ExecutionAllData[actionItem.TIMETOEXECUTE].tooltip); //No I18N
							actionRow.find('#exectuion_time_type').text(ExecutionAllData[actionItem.TIMETOEXECUTE].selectvalue); //No I18N
								}
							else
								{
								actionRow.find('#exectuion_time_type').hide();
								}
							actionRow.find('#actionDisp').on("click", function(){request_action.editAction(actionItem.ACTIONID);});//No I18N
							actionRow.find('#actionDescDisp').text(actionItem.DESCRIPTION);
							if(module == "task" || module == "project"){
							    actionItem.SELECTCRIT= cust_trigger.getCriteriaString(actionItem.criteria);
							    actionItem.SELECTCRIT=actionItem.SELECTCRIT == ""?"-":actionItem.SELECTCRIT;
							}
							actionRow.find('#critDisp').html(actionItem.SELECTCRIT);    
							var actionExecutor = actionItem.EXECUTOR;
							if(actionExecutor !== undefined && actionExecutor !== ""){ 
								actionRow.find('#executorDisp').text(actionExecutor);
							}	
							else{
								actionRow.find('#executorDisp').text("-");
							}		
							actionRow.show();
							actionRow.find('#deleteicon').on("click", function(){request_action.deleteAction(actionItem.ACTIONID);});//No I18N
							actionRow.find('#editicon').on("click", function(){request_action.editAction(actionItem.ACTIONID);});//No I18N
							actionRow.find('#disableicon').on("click", function(){request_action.enableDisableAction(actionItem.ACTIONID);});//No I18N
							if(!actionItem.ISENABLED)
							{
								actionRow.find('#actionEnableDisable').removeClass("buli_cont pt10 pl10").addClass("buli_cont pt10 pl10 buli_disabled");
								actionRow.find('#disableicon').removeClass("exTmp-enabled").addClass("exTmp-disabled");
								actionRow.find('#disableicon').prop("title",$Html('disabled'));//No I18N
							}
							if(actionItem.ISCASCADE)
							{
								actionRow.find('#turn_on_off_execution').removeClass("deactivelinkicon").addClass("activelinkicon");
								actionRow.find('#turn_on_off_execution').prop("title",$Html('turn_off_execution'));//No I18N
							}
						jQuery('#actionList').append(actionRow);
				    });
				    		request_action.applyEditDelete();						
				    });
				},
	
	applyEditDelete :function(){
				 jQuery(".csAcnList").on('mouseenter', //No I18N
						 function () {
							 jQuery(this).css("background-color","#FCFCCE");//No I18N
						 }).on('mouseleave', //No I18N
						 function () {
							 jQuery(this).css("background-color","transparent");//No I18N
						 }
						 );

	},
	
	// for criteria section elements
	addCriteriaElements : function(){
				   var size = jQuery("#sel_crit").find("option").length;
				   if(size <2)
				   {
				   		var url = '/RequestExternalAction.do?method=getAutoActionCritVals&module='+encodeURIComponent(module);//No I18N
				   		jQuery.get(url,function(data){
				   		for(i=0; i<data.length; i++) {
				   			var criteriaObject = data[i].criteria;
				   			var options = "";
				   			for (var key in criteriaObject) {
				   				options += '<option value='+key+'>'+e_html(criteriaObject[key])+'</option>';
				   			}
				   			if(data[i]["group_name"] != undefined) {
				   				options = '<optgroup label="'+e_html(data[i]["group_name"])+'">' + options + '</optgroup>';	//NO I18N
				   			}
				   			jQuery("#sel_crit").append(options);
				   		}

						if(critCont.trim() == ""){
							critCont = jQuery('#critdiv').html();	
						}					
				   		});
				   }
	},

	// for delete Action

	deleteAction : function(actionId){
	        if(sdp_app.IS_DEMO_BUILD){
                window.showalert('failure', translate("sdp.setup.orgdef.demoonline.jserror"), "isAutoHide=false");      //NO I18N
                    return
            }
			if(confirm($Html('del_alert_msg')))
			{
			       var deleteURL = '/RequestExternalAction.do?method=deleteAutoAction'+'&action_id='+actionId+'&module='+encodeURIComponent(module);//No I18N
			       var data=getCSRFParamName()+'='+getCSRFParamValue();
			       jQuery.post(deleteURL,data,function( data ) {
				       	if(data === 'success'){
							jQuery('#actionList').find('tr[id^=action'+actionId+']').remove();
							var len = jQuery("#actionList tr[id*='action']").length
							if(len == 1)
              				{
                				jQuery("#emptyCustomList").show(); 
              				}
							if(len <=2)
							{
								jQuery('#organize_actions').hide();
							}
							showMessageAndClose($Html('del_success_mesg'),4000); //No I18N
						}else if(data === "RestrictedForDemo"){//NO I18N
                            window.showalert('failure', translate("sdp.setup.orgdef.demoonline.jserror"), "isAutoHide=false");      //NO I18N
                        }
						else{
							showFailureMessageAndClose('Error while deleting action',4000); //No I18N
						}
				       	
			       });
		    }
	},
	// enable or disable action

	enableDisableAction : function(actionId){
	        if(sdp_app.IS_DEMO_BUILD){
                window.showalert('failure', translate("sdp.setup.orgdef.demoonline.jserror"), "isAutoHide=false");      //NO I18N
                    return
            }
				      var url = '/RequestExternalAction.do?method=enableDisableAction'+'&action_Id='+actionId+'&module='+encodeURIComponent(module);//No I18N
				      var data=getCSRFParamName()+'='+getCSRFParamValue();
				      jQuery.post(url,data,function( data ) {
					     if(data === 'enable'){
							jQuery('#action'+actionId+ ' #actionEnableDisable').removeClass("buli_cont pt10 pl10 buli_disabled").addClass("buli_cont pt10 pl10");
               				jQuery('#action'+actionId+ ' #disableicon').removeClass("exTmp-disabled").addClass("exTmp-enabled");
							jQuery('#action'+actionId+ ' #disableicon').prop("title",$Html('enabled')); //No I18N
							showMessageAndClose($Html('enable_success_mesg'),4000); //No I18N
					     } 
					     else if(data === 'disable'){
						     	jQuery('#action'+actionId+ ' #actionEnableDisable').removeClass("buli_cont pt10 pl10").addClass("buli_cont pt10 pl10 buli_disabled");
                				jQuery('#action'+actionId+ ' #disableicon').removeClass("exTmp-enabled").addClass("exTmp-disabled");
								jQuery('#action'+actionId+ ' #disableicon').prop("title",$Html('disabled')); //No I18N
								showMessageAndClose($Html('disable_success_mesg'),4000); //No I18N
					     }else if(data === "RestrictedForDemo"){//NO I18N
                            window.showalert('failure', translate("sdp.setup.orgdef.demoonline.jserror"), "isAutoHide=false");      //NO I18N
                         }
						 else{
								showMessageAndClose('Error while performing action',4000); //No I18N
						}
				      }); 
				    
	},

	// For edit action

	editAction : function(actionId){
			  scroll(0,0);
			  if(critCont !==''){
				   jQuery('#critdiv').html(critCont);
			  }
			  var url = '/RequestExternalAction.do?method=editAutoAction'+'&action_id='+actionId+'&module='+encodeURIComponent(module);//No I18N
			  $Val('auto_actionid',actionId); //No I18N
			  jQuery.get(url,function( data ) {
				  	//critCont = jQuery('#critdiv').html();
					jQuery('#errdiv_Msg').hide();
					request_action.buildAction(data);
					 if(data.action[0].execute.exe_type!="script")
					 {
					 jQuery('#script-message').hide();
					 }
					 else
					 {
					 jQuery('#script-message').show();
					 }
			  });
			   
	},

	// For building edit action
	
	buildAction: function(json){
			     if(critCont !==''){
				     jQuery('#critdiv').html(critCont);
				     bindEventsForCriteriaElements('#critdiv');//No I18N
			     }
		
			     jQuery('#addaction').show();
			     jQuery('#actionlistview').hide();
			     if(json !== null && json !== undefined && json!=='null'){
				     var siz1 = json.criteria.length;
				     if(module!="task" && module!="project"){
				         for(var i=0; i < siz1-1; i++) {
                            this.addSec('critdiv','critId'); //No I18N
                         }
				     }

				     var main = jQuery('#action_main'),detail = json.details[0],timetoexe = detail.timetoexecute, trig = detail.trigger, name=detail.name, desc=detail.desc,iscascade=detail.iscascade;
				     var action=json.action[0].execute;
				     main.find('#t_action').val(trig);
				     if(module=="change" || module=="task"  || module=="project")
						{
						main.find('#e_time').hide();
						}
					else
						{
						main.find('#e_time').val(timetoexe);
						}	
				     main.find('#action_name').val(name);
				     main.find('#action_desc').val(desc);
				     if(action != undefined){

				     	 var exe_type=action.exe_type,executor=action.executor;
				     	 main.find('#executor_type').val(exe_type);
					 if("change" === module)
						 {
						 request_action.alterMandatoryMark(this);
						 }
						 executorValue = '';
						 dreScriptValue = {};
						 webhookValue= {};
						 if(exe_type !== 'custom_function' && exe_type !== 'webhook') {
						 	jQuery('#action_main').find("input[id='executor']").select2("destroy");	//No I18N
						 	jQuery("#example").show();
						 		if(exe_type === 'class'){
						     	$Html('example', $Html('classExample'));//No I18N
					     	}
						 	else if(exe_type === 'script'){
						     	$Html('example', $Html('scriptExample'));//No I18N
					     	}
					     	executorValue = executor;
					     	main.find('#executor').val(executorValue);
						 	//});
					     }
					     if(exe_type === 'custom_function'){
					     	var custom_function = executor;
					     	dreScriptValue.id = custom_function.function_id;
					     	dreScriptValue.name = custom_function.name;
					     	showDREFunction();
					     }
					     else if(exe_type === 'webhook'){
					     	var webhook = executor;
					     	webhookValue.id = webhook.webhook_id;
					     	webhookValue.name = webhook.name;
					     	showWebhook();
					     }

					 }else{
					 	if('task'== module || 'project'==module) {
						 		main.find('#executor_type').val(getMessageForKey("sdp.request.externalaction.executor.script"));//No I18N
						 } else {
					 	main.find('#executor_type').val('custom_function');//No I18N
					 	 showDREFunction();
					 }
					 
					 }
				    	 if(iscascade){
						main.find('#r_cascade').attr("checked", true);
				    	 }
				    	 else if(!iscascade){
						main.find('#r_cascade').removeAttr("checked");	
				    	 }
				     if('task'== module || 'project'==module) {
                        cust_trigger.initCritComp('editCriteria',module,json.criteria);		// No I18N
                     }else{
					 if(isMSP)
					 {
						document.getElementsByName('customtriggerAllAccounts')[0].checked = false;
						main.find('#__multibox__render__availableAccountsBox__selectedAccountsBox').show();
						var accObj = json.accounts[0];
						if(accObj.isGlobal)
						{
							document.getElementsByName('customtriggerAllAccounts')[0].checked = true;
							main.find('#__multibox__render__availableAccountsBox__selectedAccountsBox').hide();
						}
						else{
							MSPPopulateMultiBoxList(document.getElementsByName('availableAccountsBox')[0], (accObj.availableAccountIds).split('#----#'), (accObj.availableAccountNames).split('#----#'));
							MSPPopulateMultiBoxList(document.getElementsByName('selectedAccountsBox')[0], (accObj.selectedAccountIds).split('#----#'), (accObj.selectedAccountNames).split('#----#'));
						}
					 }
				     request_action.buildCritObj(main,json,siz1);
				    }
			     }
	},

	buildCritObj: function(obj,json,siz1){
			      obj.find('#critdiv select[name=sel_crit]').each(function(i){  //No I18N
				      if(siz1 > 0 ){
					      var th= jQuery(this), tb = th.parents('table').eq(0), critObj = json.criteria[i],compObj = json.criteria[i+1];
					      var vals=critObj.values, txtVal= critObj.critTxt, comp= "and";//No I18N
					      var selcrit=critObj.selcrit;
					      var is_udf = selcrit.startsWith("udf_pick_") || selcrit.startsWith("udf_radio_");//No I18N
					      if(is_udf) {
					      	txtVal = vals;
					      }
					      if(compObj != undefined) {comp = compObj.comp;}
					      var elementData;
					      if(selcrit!=null && (selcrit=='54' || selcrit=='6'))
					    	  {
					    	  elementData=critObj.selectedData;
					    	  }
					      var liID= "crit_vals_",finalTxt = '';//No I18N
					      if(txtVal != undefined && txtVal != null && txtVal != ''){
						      var txtValArr = txtVal.split("##SCP##");
						      var valsArr = [];
						      if(is_udf) {
						      	valsArr = vals.split("##SCP##");
						      	vals = valsArr;
						      }else {
						      	valsArr = vals.split(",")
						      }
						      for(var j=0,len =txtValArr.length; j < len; j++){
							      if(valsArr[j] != null && valsArr[j] != undefined && txtValArr[j] != undefined){
								      finalTxt = finalTxt+  request_action.getLiHtml(txtValArr[j],liID+valsArr[j]);
							      }
						      }
					      }
						  else{
						      finalTxt = request_action.getLiHtml(vals);
					      }
					      th.val(critObj.selcrit);
					      request_action.changeCrit(this,'edit',elementData); //No I18N
					      request_action.alterMandatoryMark(this);
					      tb.find('#sel_cond').val(critObj.selcon);   
					      tb.find('#crit_vals').val(vals);   
					      tb.find('select[name=comparator]').val(comp);
					      tb.find('#multiCVals ul').html(finalTxt+tb.find('#multiCVals ul').html());
					      tb.find('input[name=textval]').val(vals);
						  request_action.LIHtmlEventBinding();
				      }
			      });

		
	},
	processData: function(toAddr){
		var result = {};
		toAddr = JSON.parse(toAddr);
		var users = [], placeholders = [], org_roles=[];
		for(var i=0; i<toAddr.length; i++){
			var data = toAddr[i];
			var id = data.id;
			if(id.startsWith("users_")){
				users.push(id.substring(6));
			}
			else if(id.startsWith("placeholders_")){
				placeholders.push(id.substring(13));
			}
			else if(id.startsWith("orgroles_")){
				org_roles.push(id.substring(9));
			}
		}
		result.users = users;
		result.placeholders = placeholders;
		result.org_roles = org_roles;
		return result;
	}

}
function getSelVal(obj,nam){
	return obj.find('select[name='+nam+']').val();
}
function getIdVal(obj,id){
	return jQuery.trim(obj.find('#'+id).val());
}
function checkUDFLongValue(Name){
	re=/^[0-9\s]+$/;
	if(re.test(Name)){
		return true;
	}
	else{
		return false;
	}
}
function checkUDFDecimalValue(Name){
	
	if(isDecimal(Name) == false)
    {                
        return false;
    }
	var trimedVal = trimAll(Name);
	var actVal = trimedVal;
	if(trimedVal.startsWith("-")){
		actVal = trimedVal.toString().split("-");
		actVal = actVal[1];
	}
	if(trimedVal.startsWith("+"))
    {
        actVal = trimedVal.toString().split("+");
		actVal = actVal[1];
    }
	actVal = actVal.replace(/^[0]+/g,"");// NO OUTPUTENCODING
	var intValue = Name.split(".");
	if(intValue[0] == null || intValue[0] == "")
    {
        intValue[0] = 0;
    }
	if(intValue[0].length > 13)
	{
		return false;
	}
	return true;
}


/*Truncate event*/
var truncate = {
	more: function($this) {/*More Less click event*/
		var beforetxt = $this.parentNode.getAttribute('data-before');
		var aftertxt = $this.parentNode.getAttribute('data-after');
		if($this.parentNode.classList.contains('truncate-ellipsis')) {
			$this.parentNode.classList.remove('truncate-ellipsis');//No I18N
			$this.text = aftertxt;
			$this.classList.remove('right0');//No I18N
			$this.classList.remove('top0');//No I18N
		} else {
			$this.parentNode.classList.add('truncate-ellipsis');//No I18N
			$this.text = beforetxt;
			$this.classList.add('right0');//No I18N
			$this.classList.add('top0');//No I18N
		}
	},
	countlines: function(element) {
		var prevLH = element.style.lineHeight;
		var factor = 1000;
		element.style.lineHeight = factor + 'px';
		var height = element.getBoundingClientRect().height;
		element.style.lineHeight = prevLH;
		return Math.floor(height / factor);
	},
	ellipsis: function(data) {
		var count = truncate.countlines(data);
		if(count > 1) {
			data.classList.add('truncate-ellipsis');//No I18N
			data.querySelector('a').classList.remove('hide');//No I18N
			var wdh = data.querySelector('a').clientWidth;//No I18N
			if(jQuery.fn.getDirection() === 'ltr') {
				data.style.paddingRight = wdh + 'px';//No I18N
			} else if(jQuery.fn.getDirection() === 'rtl') {//No I18N
				data.style.paddingLeft = wdh + 'px';//No I18N
			}
		}
	},
	ellipsisall: function() {
		var xx = document.querySelector('[data-name=ruleemail]');//No I18N
		xx = xx.querySelectorAll('[data-id=truncate-ellipsis]');//No I18N
		for(var i=0; i<xx.length; i++) {
			truncateellipsis(xx[i])
		}
	}
};

function updateNotificationContentInPopUp(id, name, mode, subject, description){

//modevalue is used in UI differentiation
	var modeValue = 'email'; //No I18N
	if(mode == 'SMS'){
		modeValue = 'sms'; //No I18N
	}
	if(id == "-1"){
    		jQuery("#edit"+modeValue+"template").prop("disabled",true); //No I18N
    		jQuery("#workflow"+modeValue+" button[id='edit"+modeValue+"template']").addClass('cur-na');//No I18N
    		jQuery("#workflow"+modeValue+" button[id='edit"+modeValue+"template']").attr('title',getMessageForKey("sdp.admin.change.tooltip.selecttemplate"));//No I18N

    	}
    	else{
    		jQuery("#edit"+modeValue+"template").prop("disabled", false); //No I18N
    		jQuery("#workflow"+modeValue+" button[id='edit"+modeValue+"template']").removeClass('cur-na');//No I18N
    		jQuery("#workflow"+modeValue+" button[id='edit"+modeValue+"template']").attr('title',getMessageForKey("sdp.admin.change.tooltip.edittemplate"));//No I18N
    	}
	jQuery("#workflow"+modeValue+" span[data-name='subject']").html(encodeHTML(subject));
	if(modeValue == 'sms'){
    	jQuery("#workflow"+modeValue+" span[data-name='description']").html(encodeHTML(description));
    }else{
    	jQuery("#workflow"+modeValue+" span[data-name='description']").html(description);
    }
	jQuery("#workflow"+modeValue+" input[data-id='templateId']").val(id);
	
	jQuery("#workflow"+modeValue+" input[name='emailsub']").val(subject);
	jQuery("#workflow"+modeValue+" input[name='templateName']").val(name);
	jQuery("#workflow"+modeValue+" textarea[id='notificationDescription"+modeValue+"']").text(description);
	if(id !== "-1"){
		jQuery("#workflow"+modeValue+" input[name='notificationTemplate']").select2("data",{id:id,text:name});//No I18N
	}
}

function showDREFunction() {
	var $ele = jQuery('#action_main');
	$ele.find("input[id='executor']").val("").end().select2("destroy");
	$ele.find("input[id='executor']").sdp_select2({
        cache:{},
        url:[{
                url:"/api/v3/custom_functions",//NO I18N
                field:'custom_functions',//NO I18N
                list_info:{start_index:1, sort_field:"name",row_count:100,search_criteria:[{field:"module.name",condition:"is",value:module,logical_operator:"and"},{field:"function_type",condition:"is",value:"customaction",logical_operator:"and"},{field:"is_active",condition:"is",value:"true",logical_operator:"and"}]}//NO I18N
        }],
        multiple:false
        });
	var sel =$ele.find("input[id='executor']").select2("container").on("select2-opening",function(){}).find(".select2-drop"); //No I18N
	sel.append('<div class="select2-filter-option disp-t fw p0"><a id="create New" href="/" class="btn btn-default btn-xs p10 noborder tl" data-name="newcF" data-style="width:calc(100% - 20px)"><span class="common-sprite icon-xs common-add-icon4 mr10"></span class="sb">'+getMessageForKey("dre.create.new.function")+'</a></div>');
	if(!jQuery.isEmptyObject(dreScriptValue)) {
		$ele.find("input[id='executor']").select2("data",{id:dreScriptValue.id,text:dreScriptValue.name});//No I18N
	}
	jQuery("#example").hide();
	jQuery('#executor').on('select2-close', function (e){
		jQuery("#executor").data("sdp_select2").cache={};		//No I18N
	});
	sel.off("click.newcF").on("click.newcF","[data-name='newcF']", function(){ //No I18N
		custFun();
	});
}
function showWebhook() {
	var $ele = jQuery('#action_main');
	$ele.find("input[id='executor']").val("").end().select2("destroy");
	$ele.find("input[id='executor']").sdp_select2({
        cache:{},
        url:[{
                url:"/api/v3/app_service_actions",//NO I18N
                field:'app_service_actions',//NO I18N
                list_info:{"search_criteria":[{"condition":"eq","field":"service.name","logical_operator":"and","value":"webhooks"},{"condition":"is","field":"is_active","logical_operator":"and","value":"true","logical_operator":"and"},{"condition":"is","field":"module","logical_operator":"and","value":module,"logical_operator":"and"}],row_count:100}//NO I18N
        }],
        multiple:false
        });
	$ele.find("input[id='executor']").select2("container");//No I18N
	if(!jQuery.isEmptyObject(webhookValue)) {
		$ele.find("input[id='executor']").select2("data",{id:webhookValue.id,text:webhookValue.name});//No I18N
	}
	jQuery("#example").hide();
	jQuery('#executor').on('select2-close', function (e){
		jQuery("#executor").data("sdp_select2").cache={};		//No I18N
	});
}
function custFun(){
	if(module == 'request') {
		window.open('/app#/admin/custom-functions/rcf/custom-actions/new');
	} else if(module == 'change') {		//No I18N
		window.open('/app#/admin/custom-functions/ccf/custom-actions/new');
	} else if(module == 'task') {		//No I18N
		window.open('/app#/admin/custom-functions/tcf/custom-actions/new');
	} else if(module == 'project') {		//No I18N
		window.open('/app#/admin/custom-functions/pcf/custom-actions/new');
	}
}
function bindEventsForCriteriaElements(selector){
	jQuery(selector).find('[sdpJs="js-event-AddCriteriaHTML-0"]').on("change", function(event) { request_action.changeCrit(this,'new'); });
	jQuery(selector).find('[sdpJs="js-event-AddCriteriaHTML-1"]').on("change", function(event) { request_action.loadOptions(this); });
	jQuery(selector).find('[sdpJs="js-event-AddCriteriaHTML-2"]').on("keyup", function(event) { request_action.searchContact(this); });
	jQuery(selector).find('[sdpJs="js-event-AddCriteriaHTML-3"]').on("keyup", function(event) { request_action.updateTxtVal(this); });
}
