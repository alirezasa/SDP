/* $Id$ */
function toggleMenuStatus(ele){
	var params='';
	var url='';
	var message;
	var isenabled=jQuery(ele).is(':checked');//NO I18N	
	if(isenabled==true)		
		{
		params="module=advAnalyticPlus&action=enableMenu"; //NO I18N
		message=getMessageForKey("common.enabled.success.msg",[getMessageForKey("common.adv.analytics.menu")]);
		}
	else
		{
		params="module=advAnalyticPlus&action=disableMenu"; //NO I18N
		message=getMessageForKey("common.disabled.success.msg",[getMessageForKey("common.adv.analytics.menu")]);
		}	
	jQuery.ajax({
		async: false,
        url:"/servlet/ZRAJaxServlet",//NO I18N
        type: 'POST',//NO I18N
        data:params,
		success: function(data) { 
			showalert("success",message, 'isAutoHide=true');//NO I18N
			setTimeout(function(){
				var query= window.location.search;
				query += (query.lastIndexOf('&') == query.length-1 ) ? "PORTALID="+PORTALID : "&PORTALID="+PORTALID; //No I18N
				window.location.search=query;
				window.location.reload(true)
			},1500);       
		}
	});	
}

function getMenuStatus(){
	var params=
	jQuery.ajax({
        async: false,			
        url: "/servlet/ZRAJaxServlet",//NO I18N
        type: 'POST',//NO I18N
        data:"module=advAnalyticPlus&action=getMenuStatus", //NO I18N
        success: function(data) {            
        	var isenabled=data.adv_analytics_menu;
        	if(isenabled=="true")
            {	jQuery('#showAnalytics_TECHMenu').prop('checked',isenabled);} //No I18N
        }
    });
}


function checkZRConfigForm(form,mode)
{
	
	
	var isZROP =  (jQuery("#isZROP").is(':checked')); //No I18N
	form.mode.value=mode;
    if("removeall"==mode)
    {
    let message;
    if(document.getElementById("DataBaseID").value==="null"){
       message=getMessageForKey("zreports.alert.remove.message")
    }else{
       message=getMessageForKey("sdp.admin.zreports.removeall.message")
    }
        var r=confirm(message);
        if (r==true)
            {
                    form.rootUserEmailID.value="";
                    form.rootUserATKey.value="";
                    form.fromDate_Display.value="";
                    form.fromDate.value="";
                    form.action='/ZRConfigurationDef.do?'//No I18N                    	
                    form.submit();
                    return;
            }
    }
    else if("repopulate"==mode)
     {
         var r=confirm(getMessageForKey("sdp.admin.zreports.repopulate.message"));
         if (r==true)
         {
                 form.rootUserEmailID.value="";
                 form.rootUserATKey.value="";
                 form.fromDate_Display.value="";
                 form.fromDate.value="";
                 form.action='/ZRConfigurationDef.do?'//No I18N
                 form.submit();
                 return;
         }
     }
    else
    {   
//disabling all button of the zoho reports configuration page. 	
disableZRFormButton(form);
var gridIndexValue;
var anthTypeIndexValue=document.getElementById("aplusAuthTypeSelect").selectedIndex;
var isAssetBuild = (document.getElementById("isAssetBuild").value=='true');
    		var emailID = form.rootUserEmailID;
    		var message = "";
    		// constructing missed fields message for alert to users - start
    		//ZROP START
    		if( isZROP && form.zropHost.value=="")
			{
				message = getMessageForKey("sdp.admin.zreports.zropurl");
			}

			if(isZROP && form.zropPort.value=="")
			{
				if(message=="")
        			{
				message = getMessageForKey("sdp.admin.zreports.zropport");
				}else
        			{
        				message = message +" , "+ getMessageForKey("sdp.admin.zreports.zropport");
        			}
			}

			//ZROP END

			if(!isZROP)
				{

				gridIndexValue=document.getElementById("clientgridSelect").selectedIndex;
				if(gridIndexValue==0)
                {
                    message = translate("sdp.admin.zreports.choose.datacenter");//NO I18N
                }


				}
    		if(emailID.value=="")
    		{
    			//ZROP START
    			if(message=="")
        			{
        				message = isZROP ? getMessageForKey("sdp.admin.zreports.meemailid") : getMessageForKey("sdp.admin.zreports.emailid");
        			}else
        			{
        				message = message +" , "+ (isZROP ? getMessageForKey("sdp.admin.zreports.meemailid") : getMessageForKey("sdp.admin.zreports.emailid"));
        			}
        		//ZROP END
    		}
            if(isZROP && !isAssetBuild && anthTypeIndexValue==1 && form.rootUserATKey.value=="")
    		{
    			if(message=="")
    			{
    				message = isZROP ? getMessageForKey("sdp.admin.zreports.meatkey") : getMessageForKey("sdp.admin.zreports.atkey");
    			}else
    			{
    				message = message +" , "+(isZROP ? getMessageForKey("sdp.admin.zreports.meatkey") : getMessageForKey("sdp.admin.zreports.atkey"));
    			}
    		}
    		if(form.zrDbname.value=="")
            {
                if(message=="")
                {
                    message = getMessageForKey("sdp.admin.zreports.zrdbname");
                }else
                {
                    message = message +" , "+ getMessageForKey("sdp.admin.zreports.zrdbname");
                }
            }
            if((!isZROP && form.clientID.value=="") || (isZROP && (isAssetBuild || anthTypeIndexValue==0) && form.clientID.value==""))
            {
               if(message=="")
                {
                    message = getMessageForKey("sdp.admin.zreports.clientID");
                }else
                {
                    message = message +" , "+ getMessageForKey("sdp.admin.zreports.clientID");
                }
            }
            if((!isZROP && form.clientSecret.value=="") || (isZROP && (isAssetBuild || anthTypeIndexValue==0) && form.clientSecret.value==""))
            {
               if(message=="")
                {
                    message = getMessageForKey("sdp.admin.zreports.clientSecret");
                }else
                {
                    message = message +" , "+ getMessageForKey("sdp.admin.zreports.clientSecret");
                }
            }
    		//SD:58431 At Zoho Reports Configuration page, Proxy details to be removed
            if(form.fromDate_Display.value=="")
    		{
            	if(message=="")
    			{
    				message = getMessageForKey("sdp.admin.zreports.datefrom");
    			}else
    			{
    				message = message +" , "+ getMessageForKey("sdp.admin.zreports.datefrom");
    			}
    		}
            // constructing missed fields message for alert to users - end


            // focus missed fields - start
            if(message!="" && message!=null)
            {
            	alert(getMessageForKey("sdp.admin.zreports.fill.mandatory.fields.error.message",[message]));
            //ZROP START
            	if( isZROP && form.zropHost.value=="")
    			{
            		//ZROP START
    				document.getElementById("zropHost").focus();
                	enableZRFormButton(form);
                		return;

    			}
            	else if(emailID.value=="")
            	{
            		//ZROP END
            		document.getElementById("rootUserEmailID").focus();
            		//SD:58430 - Zoho reports functional changes,
            		//enabling all button of the zoho reports configuration page when email id is empty
            		enableZRFormButton(form);
            		return;
            	}
            	else if(form.clientID.value=="")
                {
                    document.getElementById("clientID").focus();
                    //enabling all button of the zoho reports configuration page when at key id is empty
                    enableZRFormButton(form);
                    return;
                }
                else if(form.clientSecret.value=="")
                {
                    document.getElementById("clientSecret").focus();
                    //enabling all button of the zoho reports configuration page when at key id is empty
                    enableZRFormButton(form);
                    return;
                }
            	else if(form.rootUserATKey.value=="")
            	{
            		document.getElementById("rootUserATKey").focus();
            		//enabling all button of the zoho reports configuration page when at key id is empty
            		enableZRFormButton(form);
            		return;
            	}
            	else if(form.zrDbname.value=="")
                {
                    document.getElementById("zrDbname").focus();
                    //enabling all button of the zoho reports configuration page when ZR DB name id is empty
                    enableZRFormButton(form);
                    return;
                }

            	if(form.fromDate_Display.value=="")
            		{
            			//enabling all button of the zoho reports configuration page when date id is empty
            			enableZRFormButton(form);
            			return;
            		}
            	if(gridIndexValue==0)
            		{
            		document.getElementById("clientgridSelect").focus();
            		enableZRFormButton(form);
            		return;
            		}
            }
            // focus missed fields - end

          //ZROP START
            if(!isZROP)
            {
            //ZROP END
                    if(!emailCheck(emailID))
                    {
            			  document.getElementById("rootUserEmailID").focus();
            			  //enabling all button of the zoho reports configuration page when email id is not valid.
            			  enableZRFormButton(form);
                          return;
                    }
            }

            if(form.fromDate_Display.value!="" && form.fromDate.value!=="" && form.currentTime.value!=="")
            {
            	if(form.fromDate.value>form.currentTime.value)
            	{
            		alert(getMessageForKey("sdp.admin.zreports.initialupload.date.error"));//No I18N
            		form.fromDate.value="";
            		form.fromDate_Display.value="";
            		enableZRFormButton(form);
            		return;
            	}
            }


            if(isZROP && ("save"==mode || "saveandsync"==mode ))
            {
            	var zropport = jQuery('#zropPort').val();
        		var zropurl = "https://"+jQuery('#zropHost').val()+":"+zropport; //No I18N
            	var newUrl = '/servlet/ZRAJaxServlet';//No i18N
            	var params = 'action=getZROPUrl&zropURL='+zropurl;//No i18N
            	var myAjax = jQuery.ajax({
                  async: false,
                   url:newUrl,
                    type: 'POST',//NO I18N
                     data:params,
                    success: function(resp)
            		{

            			form.zropAccountURL.value=resp.responseText;
            		}
            	});
            }
            if("save"!=mode && document.getElementById("DataBaseID").value==="null" && emailID.value!="" && form.rootUserATKey.value!="")
            {
            	var emailID = emailID.value;
            	var atKey = form.rootUserATKey.value;
            	var zrDBName = form.zrDbname.value;
            	var isKeyChange = document.getElementById("isATKeyChange").value;
            	var zropAccountURL=form.zropAccountURL.value;
            	var zropport = jQuery('#zropPort').val();
        		var zropurl = "https://"+jQuery('#zropHost').val()+":"+zropport; //No I18N
            	var newUrl = '/servlet/ZRAJaxServlet';//No i18N
            	if(!isZROP)
        		{
        			zropurl="";
        		}
        		if(isZROP)
        		{
            	var params = 'action=isDBExists&zropAccountsURL='+zropAccountURL+'&emailID='+emailID+'&atKey='+atKey+'&isKeyChange='+isKeyChange+'&isZROP='+isZROP+'&zropURL='+zropurl+'&clientGrid='+gridIndexValue+'&zrDBName='+zrDBName; //No i18N
            	var myAjax = new Ajax.Request(newUrl, {
            		type: 'POST',//NO I18N
            		parameters: params,
            		onComplete: function(resp)
            		{
            			if(isDBExists(resp))
            			{
            				alert(zrDBName + " " + getMessageForKey("sdp.admin.zreports.dbexists.confirm.message"));
                            enableZRFormButton(form);
                            deleteZROPATKey(zropurl);
                            return;
            			}
            			else
            			{
            				invokeSubmit(mode,form,isZROP);
            			}
            		}
            	});
            	}
            	else
            	{
            	    invokeSubmit(mode,form,isZROP);
            	}
            }
            else
            {
            	invokeSubmit(mode,form,isZROP);
            }
    }
}
function invokeSubmit(mode,form,isZROP)
{
	if("saveandsync"==mode || "resync"==mode)
	{
		var r="";
		if(isZROP || jQuery('#isZAInteg').val()!='true')
		{
			r=confirm(getMessageForKey("sdp.admin.zreports.datapopulation.analyticsplus.confirmation.message"));
		}
		else
		{
			r=confirm(getMessageForKey("sdp.admin.zreports.datapopulation.zreports.confirmation.message"));
		}
		//var r=confirm(getMessageForKey("sdp.admin.zreports.datapopulation.confirmation.message"));
		if (r!=true)
		{
			enableZRFormButton(form);
			return
		}
	}
    encryptPasswordFields(form,isZROP);
	if(isZROP)
	{
		var zropport = jQuery('#zropPort').val();
		var zropurl = "https://"+jQuery('#zropHost').val()+":"+zropport; //No I18N
		jQuery('#zropURL').val(zropurl);
	}
	form.action='/ZRConfigurationDef.do' //No I18N
	form.submit();
	return;
}
function encryptPasswordFields(form,isZROP)
{
    if(isZROP && form.rootUserATKey.value != null)
    {
        var pwd = form.rootUserATKey.value;
        form.rootUserATKey.value = encryptDataWithRSA(pwd);
    }
        if(form.clientID.value != null)
        {
            var clientid = form.clientID.value;
            form.clientID.value = encryptDataWithRSA(clientid);
        }
        if(form.clientSecret.value != null)
        {
            var clientsecret = form.clientSecret.value;
            form.clientSecret.value = encryptDataWithRSA(clientsecret);
        }
    }
function isDBExists(xmlresponse)
{
	if("true"==xmlresponse.responseText)
		{
			return true;
		}
	else
		{
			return false;
		}
}
function zrSaveScheduleInfo()
{
	var type = document.getElementById("everyDayType").value;//No I18N
	var time = document.getElementById("everyDayTime").value;//No I18N
	var hour = document.getElementById("everyDayHour").value;//No I18N
	var newUrl = '/servlet/ZRAJaxServlet';//No i18N
	    var params = 'action=zrSaveScheduleInfo&everyDayType='+type+'&everyDayTime='+time+'&everyDayHour='+hour; //No i18N
	    var myAjax = new Ajax.Request(newUrl, {
	                                  method: 'post',//No i18N
	                                  parameters: params,
	                                  onComplete: function(resp){ zrSaveScheduleSuccessInfo(resp); }
	    });


}
function zrSaveScheduleSuccessInfo(xmlresponse)
{
	showMessageAndClose(xmlresponse.responseText,5000);//No I18N
}
function scheduleRetentionPolicy()
{
	var month = document.getElementById("retentionDate").value;//No I18N
	var newUrl = '/servlet/ZRAJaxServlet';//No i18N
	    var params = 'action=zrSaveRetentionPolicy&month='+month; //No i18N
	    var myAjax = new Ajax.Request(newUrl, {
	                                  method: 'post',//No i18N
	                                  parameters: params,
	                                  onComplete: function(resp){ zrSaveRetentionScheduleSuccessInfo(resp); }
	    });
}
function zrSaveRetentionScheduleSuccessInfo(xmlresponse)
{
	showMessageAndClose(xmlresponse.responseText,5000);//No I18N
}
function zrDataUploadNow(form)
{
	//SD:58430 - Zoho reports functional changes,
	//validating the instant sync clicked count
	var instantCount = parseInt(document.getElementById('instanctcount').innerHTML);
	if(instantCount<7)
	{
		//if the count less than 7 , then disabling all the button.
		disableZRFormButton(form);
		//aksing user confirmation for instant sync
		var confirmationKey = document.getElementById("isAssetBuild").value=='true' ? "ae.admin.zreports.regularsync.confirmation.message" : "sdp.admin.zreports.regularsync.confirmation.message";//No I18N
		var r=confirm(isSCP ? document.getElementById(confirmationKey).innerHTML : getMessageForKey(confirmationKey));
		if (r==true)
		{
			// user clicked the ok button.
			var newUrl = '/servlet/ZRAJaxServlet';//No i18N
			var params = 'action=zrUploadNow'; //No i18N
			var myAjax = new Ajax.Request(newUrl, {
				method: 'post',//No i18N
				parameters: params,
				onComplete: function(resp){ zrUploadNowSuccess(resp,form,instantCount);
				}
			});
		}
		else
		{
			//user click on the cancel button, so enabling the form buttons.
			enableZRFormButton(form);
		}
	}else
	{
		alert(getMessageForKey("sdp.admin.zreports.uploadnow.limit.reached"));
	}
}
function zrUploadNowSuccess(xmlresponse,form,instantCount)
{
	var message = xmlresponse.responseText;
	//SD:58430 - Zoho reports functional changes,
	//checking the ajax response text.
	if(message.indexOf("Running")==0)
	{
		// changing the status to running when sync started.
		document.getElementById("instanctcount").innerHTML=instantCount+1;
		var result = message.substring(7);
		document.getElementById("sync_status").innerHTML="<strong>"+getMessageForKey("sdp.admin.zreports.periodic.running");+"</strong>" //No I18N
		showMessageAndClose(result,5000);//No I18N
	}
	else
	{
		//showing the message which is replied from server.
		showMessageAndClose(message,5000);//No I18N
	}
	//instant sync initiated.so enabling the all the buttons.
	enableZRFormButton(form);
}
function showConfigurationPage(form)
{
	form.action='/ZRConfigurationDef.do'; //No I18N
    form.submit();
    return;
}
//SD:58430 - Zoho reports functional changes, enabling all buttons of the zoho reports configuration page.
function enableZRFormButton(reqForm)
{
	if(trim(reqForm.name) == "ZRConfigurationDef")
    {
    	if(document.getElementById('saveandsync')!=null)
    		{
    			document.getElementById('saveandsync').disabled=false;
    		}
    	if(document.getElementById('save')!=null)
    		{
    			document.getElementById('save').disabled=false;
    		}
    	if(document.getElementById('resync')!=null)
    		{
    			document.getElementById('resync').disabled=false;
    		}
    	if(document.getElementById('removeall')!=null)
		{
    		document.getElementById('removeall').disabled=false;
		}
    	if(document.getElementById('syncnow')!=null)
		{
    		document.getElementById('syncnow').disabled=false;
		}
    }
}
//SD:58430 - Zoho reports functional changes, disabling all buttons of zoho reports configuration page.
function disableZRFormButton(reqForm)
{
    if(trim(reqForm.name) == "ZRConfigurationDef")
    {
    	if(document.getElementById('saveandsync')!=null)
    		{
    			document.getElementById('saveandsync').disabled=true;
    		}
    	if(document.getElementById('save')!=null)
    		{
    			document.getElementById('save').disabled=true;
    		}
    	if(document.getElementById('resync')!=null)
    		{
    			document.getElementById('resync').disabled=true;
    		}
    	if(document.getElementById('removeall')!=null)
    		{
    			document.getElementById('removeall').disabled=true;
    		}
    	if(document.getElementById('syncnow')!=null)
			{
				document.getElementById('syncnow').disabled=true;
			}
    }

}

//ZROP related function - Start
//TODO: Rename the method name ZRConfigShowHide()

function ShowHideZROPFields(obj,value)
{

 var zropurlfield = jQuery(document.getElementById(obj));

  if(value == 'true'){
	zropurlfield.removeAttr("style"); //No I18N
	zropurlfield.attr("style",""); //No I18N
  }
  if(value == 'false')
  {
	  zropurlfield.removeAttr("style"); //No I18N
	  zropurlfield.attr("style","display:none"); //No I18N
  }

  swapzrop();
}

function ShowHideClientDivForOP(isUserChange)
{
    if(document.getElementById("isAssetBuild").value=='true' || document.getElementById("aplusAuthTypeSelect").selectedIndex==0)
    {
        jQuery("#clientIDDiv,#clientSecretDiv,#redirectURIDiv").show();
        jQuery("#rootUserATKeyDiv,#authtokenselectOptionNote").hide();
        if (document.getElementById("isAssetBuild").value=='true')
        {
            jQuery("#authTypeSelect").hide();
        }
        else
        {
            jQuery("#oauthselectOptionNote").show();
        }
        var authkeyURL = jQuery("#authkeyURL");
        authkeyURL.attr("style","");  //No I18N
        if (isUserChange)
        {
            jQuery('#isATKeyChange').val("true"); //No I18N
            jQuery('#clientID,#clientSecret').val("");
            jQuery('#clientID,#clientSecret').prop("disabled", false); //No I18N
        }
    }
    else
    {
        jQuery("#clientIDDiv,#clientSecretDiv,#redirectURIDiv,#oauthselectOptionNote").hide();
         jQuery("#rootUserATKeyDiv,#authtokenselectOptionNote").show();
        var authkeyURL = jQuery("#authkeyURL");
        authkeyURL.attr("style","display:none");  //No I18N
        if (isUserChange)
        {
            jQuery('#isATKeyChange').val("true"); //No I18N
            jQuery('#rootUserATKey').val("");
            jQuery('#rootUserATKey').prop("disabled", false); //No I18N
        }
    }
}

/*
 * Switching the lable name for each filed based on the Report Engine context selection
 * showing/hiding signup, reset key url based on the Report Engine context selection
 * populating default value of username incase of MEReport context selection
 * populating default value of Report server URL incase of MEReport context selection
 */
function swapzrop() {
	if (jQuery("#isZROP").is(':checked'))
	{

		var signUpURL1 = jQuery("#zrmesignupurl1");
		signUpURL1.attr("style","display:none");  //No I18N
        if(document.getElementById("isAssetBuild").value=='true' || document.getElementById("aplusAuthTypeSelect").selectedIndex==0)
        {
            setCreateOAuthUrl();
        }


		var authkeyURL = jQuery("#authkeyURL");
		authkeyURL.attr("style","display:none");  //No I18N

		if(jQuery('#rootUserEmailID').val().length < 1)
		{
			jQuery('#rootUserEmailID').val('admin'); //No I18N
		}
		jQuery("#emailLabel").html('<label for="rootUserEmailID">'+getMessageForKey("sdp.admin.zreports.username")+'<span class="mandatory"> *</span></label>'); //No I18N
		jQuery("#atLabel").html('<label for="rootUserATKey">'+getMessageForKey("sdp.admin.zreports.meatkey")+'<span class="mandatory"> *</span></label>'); //No I18N
		jQuery("#gridSelect").hide();
		jQuery("#authTypeSelect").show();
        ShowHideClientDivForOP(false);
		toggleOauthFields(true);
	}
	else
	{
	    if (document.getElementById("clientgridSelect").selectedIndex==0)
	    {
            jQuery("#authkeyURL").addClass('opac3');//No I18N
        }
        else
        {
            setGridSelectValue();
        }
		var signUpURL1 = jQuery("#zrmesignupurl1");
		signUpURL1.attr("style","");  //No I18N

		var authkeyURL = jQuery("#authkeyURL");
		authkeyURL.attr("style","");  //No I18N

		if(jQuery('#rootUserEmailID').val().indexOf("@") == -1)
		{
			jQuery('#rootUserEmailID').val("");
		}

		jQuery('#zropURL').val(""); //No I18N
        var emailFieldName = getMessageForKey("sdp.admin.zreports.meemailid");
        if (jQuery('#isZAInteg').val()=='true')
        {
            emailFieldName = getMessageForKey("sdp.admin.zreports.emailid");
        }
		jQuery("#emailLabel").html('<label for="rootUserEmailID">'+emailFieldName+'<span class="mandatory"> *</span></label>'); //No I18N
		jQuery("#atLabel").html('<label for="rootUserATKey"><span class="mandatory">* </span>'+getMessageForKey("sdp.admin.zreports.atkey")+'</label>'); //No I18N
		jQuery("#gridSelect").show();
		jQuery("#authTypeSelect,#rootUserATKeyDiv").hide();
		toggleOauthFields(false)
	}


}

function toggleOauthFields(isZROP)
{
    if (!isZROP || document.getElementById("isAssetBuild").value=='true' || (document.getElementById("aplusAuthTypeSelect").selectedIndex==0 && isZROP)) {
       jQuery("#clientIDDiv,#clientSecretDiv").show();
        if(jQuery('#clientID').val().length > 0) {
           jQuery("#redirectURIDiv").hide();
        }
        else {
            jQuery("#redirectURIDiv").show();
        }
    }
    else
    {
            jQuery("#clientIDDiv,#clientSecretDiv,#redirectURIDiv").hide();        
    }
}

//If user pastes a URL of report server then this method will parse and populate the host and port fields
function autoFillPort(zrophost)
{
 var userInput = zrophost;
 var hostStartIndex = userInput.indexOf("://");
 if(hostStartIndex  > -1) //specified with protocol
 {
	  userInput = userInput.substring(hostStartIndex+3);
 }
 var portStartIndex = userInput.indexOf(":");
 if(portStartIndex > -1) // specified with port alone
 {
     zrophost =  userInput.substring(0,portStartIndex);
     userInput = userInput.substring(portStartIndex+1);
 }
 if(userInput > 0)
 {
	jQuery('#zropHost').val(zrophost);
  	jQuery('#zropPort').val(userInput);

 }
 else
 {
	jQuery('#zropHost').val(zrophost);
 }
}

function AddZRGridElements(gridJSON,tableId,urlType,dropDown)
{
for(index=0;index<gridJSON.length;index++)
{
var gridElement;
var name=translate(gridJSON[index].name);
var link=gridJSON[index][urlType];
if(dropDown)
{
gridElement=document.createElement("option");
jQuery(gridElement).html(name);
jQuery(gridElement).attr("url",link);
}
else
{
var anchorTag=document.createElement("a");
gridElement=document.createElement("li");
jQuery(gridElement).append(jQuery(anchorTag).attr({href:link,target:"_newtab",title:link}).text(name));
}
jQuery(tableId).append(gridElement);
}
}


//TODO:: I18n key for alert

//ZROP related function - End

function toggleZRDatabaseNameEdit() {
	jQuery("#zrDbname").toggleClass("opac3");//No I18N
	if(jQuery("#edit_zrdbname_link").hasClass("cspr spot-edit icon-sm")) {
		jQuery("#edit_zrdbname_link").removeClass("cspr spot-edit icon-sm");
		jQuery("#edit_zrdbname_link").addClass("cspr icon-sm failure3 ml2 top-1");
	}
	else {
		jQuery("#edit_zrdbname_link").removeClass("cspr icon-sm failure3 ml2 top-1");
		jQuery("#edit_zrdbname_link").addClass("cspr spot-edit icon-sm");
	}
	if (jQuery("#zrDbname").attr("disabled")) {
        jQuery("#zrDbname").prop("disabled",false).trigger("focus");//No I18N
    } else {
        jQuery("#zrDbname").prop("disabled", true);//No I18N
    }
}


function toggleZRRootUserNameEdit() {
    var isZROP =  (jQuery("#isZROP").is(':checked')); //No I18N
	if(jQuery("#rootUserEmailID").attr("disabled")) {
		var r=confirm(getMessageForKey("sdp.admin.zreports.admintakeover.message"));
		if(r == true)
		{
			jQuery("#edit_rootUsername").removeClass("cspr spot-edit icon-sm");
			jQuery("#edit_rootUsername").addClass("cspr icon-sm failure3 ml2 top-1");
			jQuery("#rootUserEmailID").prop("disabled",false).trigger("focus");//No I18N

			jQuery("#zrDbname").toggleClass("opac3");//No I18N
			jQuery("#zrDbname").prop("disabled",false);//No I18N
            jQuery("#isATKeyChange").val("true");

            if(isZROP) {
			    jQuery("#rootUserATKey").val("");
			    jQuery("#rootUserATKey").prop("disabled",false);//No I18N
			}
			else {
			    jQuery("#clientID").val("");
			    jQuery("#clientSecret").val("");
			    jQuery("#clientID").prop("disabled",false);//No I18N
			    jQuery("#clientSecret").prop("disabled",false);//No I18N
			    jQuery("#redirectURIDiv").show();
			}
		}
	}
	else {
		jQuery("#edit_rootUsername").removeClass("cspr icon-sm failure3 ml2 top-1");
		jQuery("#edit_rootUsername").addClass("cspr spot-edit icon-sm");
		jQuery("#rootUserEmailID").prop("disabled",true);//No I18N
		jQuery("#zrDbname").toggleClass("opac3");//No I18N
		jQuery("#zrDbname").prop("disabled", true);//No I18N
	}
}

function disableEditZRDatabaseName() {
	jQuery("#edit_zrdbname_link").removeAttr("class");//No I18N
}

function deleteZROPATKey(zropurl)
{
    if(zropurl !== "")
    {
        var url = '/servlet/ZRAJaxServlet';//No i18N
        var params = 'action=deleteZROPAtKey&zropURL='+zropurl; //No i18N
        var myAjax = new Ajax.Request(url, {
            type: 'POST',//NO I18N
            parameters: params,
            onComplete: function(resp)
            {

            }
        });
    }
}

function copyToClipboard(selectorId) {
    var copyText = document.getElementById(selectorId);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");   // No I18n
    showalert('success',getMessageForKey('auth.oauth.common.redirecturl.copied'),'isAutoHide=true,delay=1');    // No I18n
}
function setCreateOAuthUrl()
{
    var hostname=jQuery('#zropHost').val();
    var port=jQuery('#zropPort').val();
    if (jQuery("#isZROP").is(':checked')) {
        if(hostname.length>0 && port.length>0)
        {
            jQuery("#authkeyURL").attr('href','https://'+hostname+':'+port+'/iam/developerconsole').removeClass('opac3'); //No I18N
        }
        else{
            jQuery("#authkeyURL").addClass('opac3'); //No I18N
        }
    }
}

