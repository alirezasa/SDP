/* $Id$ */

var telephony = {
  fillCallTemplate: function(callerJSON, type) {
    var requesterID = callerJSON.callerid;
    var callID = callerJSON.callId;
    var $telephony = jQuery(renderhbs(null,"telephony-template",{},false,"admin",false,false,false,true)); //No I18N
    $telephony.attr("data-callid", e_attr(callerJSON.callId));
    var callerName = window.translate("com.me.common.telephony.caller.unknown"),
      callStatus,
      createRequest = "",
      callStatusColor; //NO I18N
    var callAction = "hang_up"; //NO I18N

    if (type === "new-call") {
      callStatus = window.translate("com.me.common.telephony.incoming.call"); //NO I18N
      callStatusColor = "danger"; //NO I18N
      callAction = "pick_up"; //NO I18N
    } else if (type === "ongoing-call") { //NO I18N
      callStatus = window.translate("com.me.common.telephony.ongoing.call"); //NO I18N
      callStatusColor = "success"; //NO I18N
      $telephony.find("#call_notes").removeClass("hide");
    } else if (type === "outgoing-call") { //NO I18N
      callStatus = window.translate("com.me.common.telephony.outgoing.call")+" "+window.translate("com.me.request.telephony.pick.receiver"); //NO I18N
      callStatusColor = "warning"; //NO I18N
    }

    $telephony.find("#user_name").html(e_html(callerName + " (" + callerJSON.callerNumber + ")")).end()
      .find("#call_status").html(e_html(callStatus)).end()
      .find(".notif-ripple").addClass(callStatusColor).end()
      .find("#close_telephony").on("click", function(){telephony.closeTelephonyPopUp(e_attr(callID))});

    if (callerJSON.isAvaya) {
      if(type === "new-call"){
        $telephony.find("#" + callAction).removeClass("hide").on("click", function(){telephony.pickUpCall(e_attr(callID))});
      }
      else{
        $telephony.find("#" + callAction).removeClass("hide").on("click", function(){telephony.hangUpCall(e_attr(callID))});
      }
    }
    else if(type==="new-call"){
      $telephony.find("#call_notes").removeClass("hide");
    }

    if (requesterID !== -1) {
      sdpAjax({
        url: "/api/v3/users/" + requesterID, //NO I18N
        async: false,
        ignorefailuremessage: true,
        success:function(response) {
                  if (response.user) {
                    var restricted_string="";
                    var requesterDetails = response.user;
                    callerName = requesterDetails.name;
                    if(isSCP){//Added sub account in CTI pop up for scp
						if (requesterDetails.subaccount ) {
						  var userSubAccount = requesterDetails.subaccount.name;
						  $telephony.attr("data-reqid", requesterID).find("#user_name").html(e_html(callerName + " (" + callerJSON.callerNumber + ")")).end()
						  .find("#user_site").html("<span>"+window.translate("scp.account.subaccount")+": </span>" + e_html(userSubAccount)); //NO I18N
						}
					}else{ //site shonw in CTI pop up is not required for scp.
                    var userSite = window.translate("common.site.nosite");
                    if (requesterDetails.department && requesterDetails.department.site) {
                      userSite = requesterDetails.department.site.name;
                    }
                    //UFR changes
                    if(response.user.phone||response.user.mobile){
                      restricted_string=" (" + callerJSON.callerNumber + ")";
                    }
                    $telephony.attr("data-reqid", requesterID).find("#user_name").html(e_html(callerName + restricted_string)).end()
                      .find("#user_site").html("<span>"+window.translate("common.site")+": </span>" + e_html(userSite)); //NO I18N
					}
					if(isMSPOrSCP){// Added account in CTI pop up for msp and scp.
						var userAccount = window.translate("sdp.common.notassigned");
						var userAccountID = 0;
						if (requesterDetails.account ) {
						  userAccount = requesterDetails.account.name;
						  userAccountID = requesterDetails.account.id;
						}

						$telephony.attr("data-reqid", requesterID).find("#user_name").html(e_html(callerName + " (" + callerJSON.callerNumber + ")")).end()
						  .find("#user_account").attr("data-accid", userAccountID).html("<span>"+window.translate("sdp.msp.common.account")+": </span>" + e_html(userAccount)); //NO I18N
						  $telephony.find("#user_account").removeClass("hide");
					}

                    if (requesterDetails.profile_pic["content-url"]) {
                      $telephony.find("#telephony-icon-default").addClass("hide").end()
                        .find("#telephony-icon").attr("src", requesterDetails.profile_pic["content-url"]).removeClass("hide");
                    }

                    if (sdp_user.ROLES.includes("ViewRequester")) {
                      $telephony.find("#user_name").on('click', function(){window.NewWindow('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=' + requesterID + '&minContent=true', e_html(translate("sdp.inventory.wsRtPanel.userDetails")), "450", "500", "yes", "center",null,null,null,true);}).css("cursor", "pointer"); //NO I18N
                    }

                    if (sdp_user.ROLES.includes("ViewRequests")) {
                      $telephony.find("#view_request").on("click", function(){window.NewWindow('/ListRequests.do?id=' + requesterID + '&popUserDetails=true&mode=edit&filterBy=All_Pending',"ListRequests","975","620","yes","center",null,null,null,true);}).removeClass("hide");
                    }
                    if (!isSCP && sdp_user.ROLES.includes("ViewInventoryWS")) {// Asset is not available in SCP
                      var escapedcallerName=callerName.replace(/"/g,'\\"'). replace(/'/g,"\\'");
                      $telephony.find("#view_asset").on("click", function(){return telephony.popupClosure(requesterID,escapedcallerName)}).removeClass("hide");
                    }

                    if (sdp_user.ROLES.includes("CreateRequests")) {
                      $telephony.find("#create_request").on("click", function(){telephony.redirectToCreateRequest(e_attr(callID))}).removeClass("hide");
                    }
                    if (sdp_user.ROLES.includes("ModifyRequests")) {
                      $telephony.find("#existing_request").on("click", function(){telephony.redirectToReqList(e_attr(callID))}).removeClass("hide");
                    }
                    if(!(sdp_user.ROLES.includes("ModifyRequests") || (sdp_user.ROLES.includes("CreateRequests")))){
                      $telephony.find("#call-ended").remove();
                    }

                    $telephony = telephony.translateTemplate($telephony);
                    jQuery('#CallAlertDiv').html($telephony[0]);
                  }
                },
          error: function(response,event){
                  if(response.responseJSON){
                    var responseJSON = response.responseJSON.response_status.messages[0];
                    if(responseJSON.status_code === 4002){
                        return null;
                    }
                  }
                }});

    } else {
      $telephony.find("#user_site").addClass("hide");

      if (sdp_user.ROLES.includes("CreateRequests")) {
        $telephony.find("#create_request").on("click",function(){ telephony.redirectToCreateRequest(e_attr(callID))}).removeClass("hide");
      }

      if (sdp_user.ROLES.includes("CreateRequester")) {
        $telephony.find("#add_requester").on("click", function(){window.NewWindow('/setup/UsersPopup.jsp?isUser=true&popupfor=telephony&viewType=add&mobile=' + callerJSON.callerNumber ,"CreateRequester","1200","600","yes","center",null,null,null,true);}).removeClass("hide");
      }

      if (sdp_user.ROLES.includes("ModifyRequests")) {
        $telephony.find("#existing_request").on("click", function(){telephony.redirectToReqList(e_attr(callID))}).removeClass("hide");
      }

      if(!(sdp_user.ROLES.includes("ModifyRequests") || (sdp_user.ROLES.includes("CreateRequests")))){
        $telephony.find("#call-ended").remove();
      }
      $telephony = telephony.translateTemplate($telephony);
      jQuery('#CallAlertDiv').html($telephony[0]);
    }

  },
  popupClosure:function(id,name){
    if(jQuery('[aria-describedby=asset_dialog]').length!=0){
      jQuery('#asset_dialog').dialog("close");      //No I18N
    }
    ShowUserAssetsPopup({'user_id' : id ,'user_name': name });      //No I18N
  },
  makeOutgoingCall: function(requesterMobile, requesterID) {
    if(sdp_app.TELEPHONY_SERVICE == "ZohoTelephony"){
      if(typeof(ZPB) != 'undefined' && ZPB.clickToDial.isEnabled()){
        ZPB.clickToDial.trigger({number:requesterMobile})
      }
      else{
        window.showalert("failure",e_html(translate("sdp.zohotelephony.ctd.disabled")), "isAutoHide=false"); //NO I18N
      }
    }
    else{
      var outgoingCall = "/TelephonyDef.do?action=makeCall&requesterMobile=" + requesterMobile; //NO I18N
      var callJSON = {
        callerid: requesterID,
        callId: "outgoing-call", //NO I18N
        callerNumber: requesterMobile
      };
      telephony.fillCallTemplate(callJSON, "outgoing-call"); //NO I18N
      sdpAjax({
        url:outgoingCall,
        method:"post" //NO I18N
      }).done(function(response) {
        var responseData = response;
        if(responseData.status == "success"){
          var element = jQuery("#CallAlertDiv").find("[data-callid=outgoing-call]");
          if (element.length) {
            telephony.callSucceeded(element);
          }
        }
        else if(responseData.status == "failure"){
          var element = jQuery("#CallAlertDiv").find("[data-callid=outgoing-call]");
          if (element.length) {
            telephony.callFailed(element);
          }
        }
      }).fail(function(response) {
        var responseData = response.responseJSON;
        if(responseData.status == "disabled" || responseData.status == "failure"){
          showalert("failure",e_html(translate("api.user.not.authorized")),"isAutoHide=false"); //NO I18N
          telephony.closeTelephonyPopUp("outgoing-call"); //NO I18N
        }
      });
    }
  },

  callSucceeded : function(element){
    element.find("#call_status").text(window.translate("com.me.common.telephony.ongoing.call")).end()
      .find(".notif-ripple").removeClass("danger warning").addClass("success").end();
  },

  callFailed: function(element) {
    element.find("#call_status").removeClass("blink_me").text(window.translate("com.me.admin.telephony.dialer.error")).end() //NO I18N
      .find(".notif-ripple").removeClass("warning notif-ripple").addClass("danger");
  },

  pickUpCall: function(callID) {
    var pickUpCall = "/TelephonyDef.do?action=pickUpCall&callID=" + callID; //NO I18N
    sdpAjax({
      url:pickUpCall,
      method:"post" //NO I18N
    });
  },

  hangUpCall: function(callID) {
    var hangUpCallURL = "/TelephonyDef.do?action=hangUpCall&callID=" + callID; //NO I18N
    sdpAjax({
      url:hangUpCallURL,
      method:"post" //NO I18N
    });
  },

  callPickedUp: function(callID, isAvaya, element) {
    element.find("#call_status").text(window.translate("com.me.common.telephony.ongoing.call")).end()
      .find("#call_notes").removeClass("hide").end()
      .find(".notif-ripple").removeClass("danger warning").addClass("success").end();
    if (isAvaya) {
      element.find("#pick_up").addClass("hide").end()
        .find("#hang_up").removeClass("hide").on("click", function(){telephony.hangUpCall(e_attr(callID));}).end();
    }
  },

  /*createRequest : function(callID){
    var createRequestLink = "/WorkOrder.do?woMode=newWO"
    var element = jQuery("#CallAlertDiv").find("[data-callid=" + callID + "]");
    if(element.length){
      noteContent =   'Call received from ' + element.find("#user_name").text();
      reqID= element.attr("data-reqid");
      if(reqID!=undefined){
        createRequestLink+="&reqID="+reqID;
      }
      noteContent += '\nCall description: '+element.find("#call_notes").text();
    }

    window.open(createRequestLink);
  },*/

  callHungUp: function(callID, element) {
    element.find("#call_status").text(window.translate("com.me.common.telephony.end.call")).removeClass("blink_me").end() //No I18N
      .find("#call-ended").removeClass("hide").end()
      .find(".notif-ripple").removeClass("notif-ripple").addClass("hide").end()
      .find("#pick_up").addClass("hide").end()
      .find("#hang_up").addClass("hide");

  },

  closeTelephonyPopUp: function(callID) {
    jQuery('#CallAlertDiv').find("[data-callid=" + callID + "]").fadeOut(400, function() {
      jQuery("#CallAlertDiv").find("[data-callid=" + callID + "]").remove(); //NO I18N
    });
    if (callID === "outgoing-call") {
      return;
    }
    var data = {
      'module': 'TelephonyNotifications', //NO I18N
      'type': 'close-popup', //NO I18N
      'message': '{"callId":"' + callID + '"}' //NO I18N
    }; //No I18N
    if (is_broadcast_channel_support) {
      channel.postMessage((typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data)); //NO I18N
    } else {
      notifications.updateClientDataStorage(data);
    }
    var removeActiveCall = "/TelephonyDef.do?action=removeCall&callID=" + callID; //NO I18N
    sdpAjax({
      url:removeActiveCall,
      method:"post" //NO I18N
    });
  },

  redirectToReqList: function(callID){
    var element = jQuery('#CallAlertDiv').find("[data-callid=" + callID + "]");
    var reqLink = "/ListRequests.do?id=1&telephony=true"; //NO I18N
    if (element.attr("data-reqid") !== undefined) {
      reqLink += "&reqId=" + element.attr("data-reqid"); //NO I18N
    }
    if (element.length) {
      var noteContent = window.translate("com.me.common.telephony.call.received",[element.find("#user_name").text()]);
      noteContent += '<br>'+window.translate("com.me.common.telephony.call.description",[e_html(element.find("#call_notes").val())]);
      Store.setItem({key: "call_description", value: noteContent, days: 1}); // NO I18N
      Store.setItem({key: "call_id", value: callID, days: 1}); // NO I18N
    }
    window.NewWindow(reqLink, "ViewAssets", "975", "620", "yes", "center",null,null,null,false);
  },

  redirectToCreateRequest : function(callID){
    var element = jQuery('#CallAlertDiv').find("[data-callid=" + callID + "]");
    var createRequestLink = "/WorkOrder.do?woMode=newWO&service=telephony"; //NO I18N
    if (element.attr("data-reqid") !== undefined) {
      createRequestLink+="&reqID="+element.attr("data-reqid"); //NO I18N
    }
    if (isMSPOrSCP && jQuery('#user_account').attr("data-accid") !== undefined) {
      createRequestLink+="&accountID="+jQuery('#user_account').attr("data-accid"); //NO I18N
    }
    if (element.length) {
      var subContent = window.translate("com.me.common.telephony.call.received",[element.find("#user_name").text()]);
      var descContent = window.translate("com.me.common.telephony.call.description",[e_html(element.find("#call_notes").val())]);
      Store.setItem({key: "call_subject", value: subContent, days: 1}); // NO I18N
      Store.setItem({key: "call_description", value: descContent, days: 1}); // NO I18N
      Store.setItem({key: "call_id", value: callID, days: 1}); // NO I18N
    }
    window.open(createRequestLink);
  },

  associateToRequest: function() {
    var requestID = jQuery('[name="requests_radio"]:checked').val();
    if (requestID == undefined) {
      window.showalert("failure", window.translate("com.me.admin.telephony.norequest.error"), "isAutoHide=false"); //NO I18N
      return;
    }
    var description = Store.getItem("call_description"); // NO I18N
    var input_data = {
      note: {
        description: description
      }
    };
    input_data = sdpAjaxInputData(input_data);
    sdpAjax({
      url: "/api/v3/requests/" + requestID + "/notes", //NO I18N
      method: "post", //NO I18N
      data: input_data
    }).done(function(response) {
      Store.removeItem("call_description"); //NO I18N
      window.opener.showalert('success', window.translate("sdp.app.request.note.add.success"), "isAutoHide=true"); //NO I18N
      var callID = Store.getItem("call_id"); // NO I18N
      telephony_history.updateEntityId(callID,"request",requestID); //NO I18N
      window.opener.telephony.closeTelephonyPopUp(callID);
      Store.removeItem("call_id"); //NO I18N
      window.close();
    });
  },

  translateTemplate: function(telephony) {
    var key = null;
    telephony.find("[data-i18n-placeholder]").each(function(){
      key = jQuery(this).attr("data-i18n-placeholder");
      jQuery(this).attr("placeholder",window.translate(key));
    });
    telephony.find("[data-i18n]").each(function() {
      key = jQuery(this).attr("data-i18n");
      jQuery(this).text(window.translate(key));
    });
    return telephony;
  }
}

var telephonic_data = {
		model:{},
		contentHidden:false,
  toggleService: function ($this) {
                var isEnabled =jQuery($this).attr("checked") === undefined ;
                var telephonyIconSelector=jQuery('#telephony_icon');
                var telephonyConfigSelector=jQuery('#telephony-config');
                var telephonyDisableSelector=jQuery('#telephonydisabled');
                var telephonyToggleSelector=jQuery($this).parent().find("#telephonyToggle");
                var telephonyTitleKey=translate("com.me.admin.telephony.title");
                if(isEnabled) {
                  telephonyIconSelector.removeClass("hide");
                  telephonyConfigSelector.removeClass("hide");
                  telephonyDisableSelector.addClass("hide");
                  telephonyToggleSelector.addClass("on").removeClass("off");
                  jQuery("#telephony_onoff").text(translate("common.action.enabled",[telephonyTitleKey])); //NO I18N
                }
                else {
                  telephonyConfigSelector.addClass("hide");
                  telephonyDisableSelector.removeClass("hide");
                  telephonyIconSelector.addClass("hide");
                  telephonyToggleSelector.addClass("off").removeClass("on");
                  jQuery("#telephony_onoff").text(translate("common.action.disabled",[telephonyTitleKey])); //NO I18N
                }
			service=this.model.selectedService;
			this.model.selectedService.isEnabled=false;
			if(document.getElementById("isEnabled").checked==true){
				this.model.selectedService.isEnabled=true;
			}
			inputData ={
                "enabled": isEnabled,			//No I18N
                "serviceID": service.id,									//No I18N
                "action": "toggleService"									//No I18N
			};
            addCSRF(inputData);
            sdpAjax({
                method: "POST",									//No I18N
                context: this,
                data: inputData,
                url: "/TelephonyDef.do"									//No I18N
            }).then(function(data) {
                if (data && data.status === "success") {
                    if (isEnabled) {
                        window.showalert("success", e_html(translate("com.me.admin.telephony.enable.success")), "isAutoHide=true"); //No I18N
                    } else {
                        window.showalert("success", e_html(translate("com.me.admin.telephony.disable.success")), "isAutoHide=true"); //No I18N
                    }									//No I18N
                } else {
                    window.showalert("failure", e_html(translate("com.me.admin.telephony.setting.update.error")), "isAutoHide=false"); //No I18N
                }
                window.location.reload();
            });
        },
        changeService: function(serviceName) {
            var serviceObject = this.model.telephony[serviceName];
            this.model.selectedService=serviceObject;
            if(serviceObject.id){
              setTimeout(function(){ jQuery("#telephony-config").valid(); }, 10);
            }
            this.disp();
            this.checkforAvaya(serviceName);
        },
        toggleChangePassword: function() {
				this.model.selectedService.username=jQuery("#username")[0].value;
				this.model.selectedService.server=jQuery("#server")[0].value;
				this.model.selectedService.port=jQuery("#port")[0].value;
				if(this.model.selectedService.changePassword){
					this.model.selectedService.changePassword=false;
				}
				else{
					this.model.selectedService.changePassword=true;
				}
				if(jQuery("#tLink").length>0){
					this.model.selectedService.tLink=jQuery("#tLink")[0].value;
        }

				this.disp();
        },
        changeSipType : function(sip){
          this.model.selectedService.sipType= sip;
        },
        getTLink: function() {
			form=jQuery("#telephony-config");
            var server = document.getElementById("server").value;
			this.model.selectedService.server=server;
			this.model.selectedService.port=jQuery("#port")[0].value;
            var port = this.model.selectedService.port;
            if(jQuery("#username").length>0){
            	this.model.selectedService.username=jQuery("#username")[0].value;
            	if(jQuery("#password").length>0){
            		this.model.selectedService.password=jQuery("#password")[0].value;
            	}
            }
            if(jQuery("#tLink").length>0){
        		this.model.selectedService.tLink=jQuery("#tLink")[0].value;
			}
            var serverField = jQuery("#server");	//No I18N
            var portField = jQuery("#port");	//No I18N
			if(!serverField.valid() || !portField.valid()){
				jQuery("#server").valid();
        serverField.focus();
				jQuery("#port").valid();
              return false;
            }
				sdpAjax({
					method: "GET",									//No I18N
					context: this,
					url: "/TelephonyDef.do?action=getTLinkArray&server=" + server + "&port=" + port									//No I18N
				}).then(function(data) {
					if (data) {
						try {
							var tLinkArray = sdpToJSON(data);
							tLinkArray = JSON.parse(tLinkArray);
							if (tLinkArray.length === 0) {
								this.model.selectedService.tLinkArray= [];
								this.model.selectedService.tLink= null;
								this.model.selectedService.oldTLink= null;
								window.showalert("failure", translate("com.me.admin.telephony.unableToGetTLink"), "isAutoHide=false"); //No I18N
							} else {
								this.model.selectedService.tLinkArray= tLinkArray;
								window.showalert("success", translate("com.me.admin.telephony.TLink.success"), "isAutoHide=true"); //No I18N
							}
						} catch (e) {
							window.showalert("failure", translate("com.me.admin.telephony.unableToGetTLink"), "isAutoHide=false"); //No I18N
						}
					} else {
						window.showalert("failure", translate("com.me.admin.telephony.unableToGetTLink"), "isAutoHide=false"); //No I18N
					}
					this.disp();
				});

        },
        changeTLink: function(value) {
        	this.model.selectedService.oldTLink= value;
			this.model.selectedService.tLink= value;
			jQuery("#tLink-error").addClass("hidden");			//No I18N
        },
		commonValidation:function(){
			jQuery.validator.addMethod("numberonly", function(value, element) { 			//No I18N
			  return this.optional( element ) || /^[0-9]+$/g.test( value );
			});
			 var validateJson = {
				rules: {
					port:{
						required:true,
						numberonly:true
					},
					server:{
						required:true
					},
					tLink:{
						required:true
					},
					username:{
						required:true
					},
					password:{
						required:true
					},
					executorFile:{
						required:true
					}
				},
				messages: {
					server:{
						required:getMessageForKey("sdp.common.emptymessage",[getMessageForKey("common.server")])						//No I18N
					},
					port:{
						required:getMessageForKey("sdp.common.emptymessage",[getMessageForKey("common.port.no")]),							//No I18N
						numberonly:getMessageForKey("common.invalid.field.error.msg",[getMessageForKey("common.port.no")])					//No I18N
					},
					tLink:{
						required:getMessageForKey("sdp.admin.survey.emptyvalue")							//No I18N
					},
					username:{
						required:getMessageForKey("sdp.common.emptymessage",[getMessageForKey("common.username")])						//No I18N
					},
					password:{
						required:getMessageForKey("sdp.common.emptymessage",[getMessageForKey("common.password")])						//No I18N
					},
					executorFile:{
						required:getMessageForKey("sdp.common.emptymessage",[getMessageForKey("custom.schedule.script.file.placeholder")])						//No I18N
					}
				},
				 errorClass: 'text-danger', //NO I18N
				errorPlacement: function(error, element) {
				  var top='30px';//NO I18N
				  error.insertAfter( element );
				  error.addClass( 'alert alert-danger alert-arrow p5' ).css({ 'top':top,'position':'absolute','z-index':'1', 'display':'block', 'white-space':'nowrap'}); 				//NO I18N
				}
			};
			jQuery("#telephony-config").validate(validateJson);					//No I18N
		},
        saveIntegration: function() {
			event.preventDefault();
			if(sdp_app.IS_DEMO_BUILD){
              window.showalert("failure", translate("sdp.demo.errormsg"), "isAutoHide=false"); //No I18N
              return;
            }
      jQuery("#saveIntegration").attr("disabled",true);
			var checkbox=jQuery("#telephony-config").find("#create-request").prop('checked');//NO I18N
			form=jQuery("#telephony-config");
			if(!form.valid()){
        jQuery(form.find(".alert,alert-danger")[0]).parent().find('input').focus();
        jQuery("#saveIntegration").attr("disabled",false); //No I18N
				return false;
			}
			if(this.model.selectedService.name!="Custom"){
				this.model.selectedService.username=document.getElementById("username").value;
				if(jQuery("#password").length>0){
					this.model.selectedService.password=document.getElementById("password").value;
				}
				else{
					this.model.selectedService.password=null;
				}
				this.model.selectedService.server=document.getElementById("server").value;
				if(jQuery("#tLink").length>0){
        			this.model.selectedService.tLink=jQuery("#tLink")[0].value;
				}
				this.model.selectedService.port=jQuery("#port")[0].value;
			}
			else{
        if(jQuery("#executorFile")[0].value.substring(jQuery("#executorFile")[0].value.lastIndexOf(".")+1)!="txt"){
          window.showalert("failure",translate("api.customschedules.invalid.executor_file"),"isAutoHide=true");                 //No I18N
          return false;
        }
				this.model.selectedService.scriptFile=jQuery("#executorFile")[0].value;
			}
      this.model.selectedService.createRequest=checkbox;
			this.postTelephonyData();
        },
		postTelephonyData:function(){
			var form = jQuery("#telephony-config");	//No I18N
			var serviceObject=JSON.parse(sdpToJSON(this.model.selectedService));
			var serviceConfig = serviceObject;
			var enabledServiceID = null;
			if(!this.model.enabledService==null){
				enabledServiceID=this.model.enabledService.id
			}
			if ((serviceObject.id===undefined) && enabledServiceID) {
				window.showalert("failure",translate("com.me.admin.telephony.update.existingerror"),"isAutoHide=true");									//No I18N
				return;
			}
			var savepassword=this.model.selectedService.password;
			var password = serviceConfig.password;
			if(password) {
				//Encrypting the password
        password = encryptDataWithRSA(password);
				serviceConfig.password = password;
			}
			var changePassword=this.model.selectedService.changePassword;
			var isEnabled=this.model.selectedService.isEnabled;
			var oldTLink=this.model.selectedService.oldTLink;
			delete serviceConfig['tLinkArray'];
			delete serviceConfig['changePassword'];
			delete serviceConfig['oldTLink'];
			delete serviceConfig['isEnabled'];
			delete serviceConfig['id'];
			delete serviceConfig['alert'];
			var inputData = {
				"input_data": sdpToJSON(serviceConfig),									//No I18N
				"action":"saveIntegration"									//No I18N
			};
			addCSRF(inputData);
			sdpAjax({
				method: "POST",									//No I18N
				context: this,
				data: inputData,
				url: "/TelephonyDef.do"									//No I18N
			}).then(function(data) {
        jQuery("#saveIntegration").attr("disabled",false);
				if (data && data.status === "success") {
					window.showalert("success", e_html(translate("com.me.admin.email.telephonysettings.update.success")), "isAutoHide=true"); //No I18N
					this.route_model();
				} else {
					if(jQuery("#removeIntegration").length!=0){
						this.model.selectedService.isEnabled=isEnabled;


						if(this.model.selectedService.name!="Custom"){
							this.model.selectedService.changePassword=changePassword;
						}
					}
					this.model.selectedService.oldTLink=oldTLink;
					this.model.selectedService.tLinkArray=oldTLink;
					this.model.selectedService.password=savepassword;
					window.showalert("failure", e_html(translate("com.me.admin.telephony.setting.update.error")), "isAutoHide=false"); //No I18N
				}
			});
		},
        removeIntegration: function() {
			event.preventDefault();
			serviceID=this.model.selectedService.id;
            var inputData = {
                "serviceID": serviceID,									//No I18N
                "action": "removeIntegration"									//No I18N
            };
            addCSRF(inputData);
            sdpAjax({
                method: "POST",									//No I18N
                context: this,
                data: inputData,
                url: "/TelephonyDef.do"									//No I18N
            }).then(function(data) {
				if (data && data.status === "success") {
                    window.showalert("success", e_html(translate("com.me.admin.telephony.remove.success")), "isAutoHide=true"); //No I18N
                    telephony_settingspage.default_service = null;
					this.route_model();
				} else {
                    window.showalert("failure", e_html(translate("com.me.admin.telephony.remove.failure")), "isAutoHide=false"); //No I18N
                }
            });
        },
	route_model:function(){
		var responseData = {};
		var passcode;
        var telephony = {};
        var selectedService = null;
        var enabledService = null;
        return sdpAjax({
            url:`/TelephonyDef.do?action=getIntegrations`,
            method: "GET", //No I18N
            cache: false,
            context: this
        }).then(function(data) {
            if (data.response_status[0].status == "success") {
				var integrations = data.integrations;
                for (var i in integrations) {
                  if(!integrations.hasOwnProperty(i)){
                     break;
                  }
				  if (integrations[i].name === "Telephony") {
                      var integration = integrations[i];
                      var serviceName = integration.configuration.name
                      telephony[serviceName] = {};
                      telephony[serviceName].name = integration.configuration.name;
                      telephony[serviceName].id = integration.id;
                      telephony[serviceName].isEnabled = integration.isEnabled;
                      telephony[serviceName].createRequest = integration.configuration.createRequest;
                      if(integration.configuration.alert){
                        telephony[serviceName].alert = integration.configuration.alert;
                      }
                      if(integration.configuration.template){
                        telephony[serviceName].template = integration.configuration.template;
                       }
                      if(integration.configuration.name != "Custom" && integration.configuration.name != "ZohoTelephony"){
                        telephony[serviceName].server = integration.actions[0].request_configs.request_params.url;
                        telephony[serviceName].port = integration.actions[0].request_configs.request_params.port;
                        telephony[serviceName].username = integration.actions[0].request_configs.auth_details.username;
                        telephony[serviceName].changePassword = false;
                        if (integration.configuration.name === "Avaya") {
                            telephony[serviceName].oldTLink = integration.actions[0].request_configs.request_params.tLink;
                            telephony[serviceName].tLink = integration.actions[0].request_configs.request_params.tLink;
                        }
                        if (integration.configuration.name === "Asterisk") {
                            telephony[serviceName].sipType = integration.configuration.sipType;
                        }
                      }
                      else{
                        telephony[serviceName].scriptFile = integration.configuration.scriptFile;
					  }
                      selectedService = telephony[serviceName];
                      enabledService = {
                          'id':selectedService.id,									//No I18N
                          'name':selectedService.name,									//No I18N

                      };
                    }
                    if(integrations[i].name == "ZohoTelephony"){
                      let req_params = integrations[i].actions[0].request_configs.request_params;
                      let ZT_integration = {};
                      ZT_integration.DC = req_params.DC;
                      ZT_integration.jsDomains = req_params.domains;
                      ZT_integration.integration_data = integrations[i];
                      this.model.ZohoTelephony = ZT_integration;
                    }
                }
                responseData.selectedService = selectedService;
                responseData.enabledService = enabledService;
            }
            if (!telephony.hasOwnProperty("Avaya")) {
                telephony["Avaya"] = {
                    "name": "Avaya",									//No I18N
                    "port": 450,									//No I18N
                    "changePassword": false									//No I18N
                };
            }
            if (!telephony.hasOwnProperty("Asterisk")) {
                telephony["Asterisk"] = {
                    "name": "Asterisk",									//No I18N
                    "port": 5038,									//No I18N
                    "changePassword": false,									//No I18N
                    "sipType": "sip"									//No I18N
                };
            }
            if (!telephony.hasOwnProperty("Custom")) {
                telephony["Custom"] = {
                    "name": "Custom"									//No I18N
                };
            }
            responseData.telephony = telephony;
			this.model.telephony=telephony;
			this.model.responseData=responseData;
			this.model.selectedService=selectedService;
			this.model.enabledService=enabledService;
			this.model.integrations=integrations;
			if(telephony_settingspage.default_service == "ZohoTelephony"){
        let $el = jQuery("#ZTSettings");
        telephony_settingspage.switchTab($el);
      }
      else{
         
        this.disp();
      }
		});
	},
	helpToggle:function(){
		this.contentHidden=!this.contentHidden;

		//this.disp();
		let titleContent = translate("hide.helpcard.label");
		if(this.contentHidden){
			titleContent = translate("view.helpcard.label");
			jQuery("#helpcardContent").addClass("hidden");
		}
		else{
			jQuery("#helpcardContent").removeClass("hidden");
		}
		jQuery("#helpcardToggle").attr("contentHidden",this.contentHidden).attr("title",titleContent);

	},
	disp:function(){
		let selectedServicejson = jQuery.extend({},telephonic_data.model.selectedService);
    let enabledServicejson = jQuery.extend({},telephonic_data.model.enabledService);
    if(telephonic_data.model.selectedService !== null && telephonic_data.model.selectedService !== undefined){
      this.checkforAvaya(telephonic_data.model.selectedService.name);
    }
    let telephonyjson = jQuery.extend({},telephonic_data.model.enabledService);
    let add_params = false;
    if(telephonic_data.model.enabledService != null && telephonic_data.model.enabledService.name == "ZohoTelephony"){
      add_params = true;
      telephonic_data.model.selectedService = selectedServicejson.name == "ZohoTelephony" ? null: selectedServicejson;
      telephonic_data.model.enabledService = enabledServicejson.name == "ZohoTelephony" ? null:enabledServicejson;
      delete telephonic_data.model.telephony["ZohoTelephony"];
    }
     
    let $cont = jQuery("#telephonic_container").find("#telephonysettings_container");
    renderhbs($cont,'telephony_settings',telephonic_data,false,'admin',false,false,function(){telephony_settingspage.telephony_settings_events();});			//No I18N


    if(add_params){
      telephonic_data.model.selectedService = selectedServicejson;
      telephonic_data.model.enabledService = enabledServicejson;
      telephonic_data.model.telephony["ZohoTelephony"] = telephonyjson;
    }
    initTooltip('#telephonic_settings');//No I18N
    this.commonValidation();
    if(jQuery("#port").length > 0){
      jQuery("#port").valid();	
    }
	},
  checkforAvaya:function(serviceName){
    let avaya_jar = sdp_app.IS_AVAYA_TRUE;
    if(serviceName == "Avaya" && !avaya_jar){
      let $fields = jQuery("#telephony-config").find("div.col-fields");
      //find the service field and disable others
      $fields.each(function(){
        let $fld = jQuery(this);
        if("selectService" !== $fld.find('label').attr('for')){
          $fld.addClass("opac5 ptr-ev-none");
        }
      });
      jQuery("#saveIntegration").attr("disabled",true);
      let $banner = `<div id="avaya_warning" class="alert alert-danger icon mt20" role="alert" > <span class="msg"> ${translate("sdp.avaya.needed")} <a href="https://help.servicedeskplus.com/telephony-integration$jar-files-for-avaya" target="_blank" rel="noopener noreferrer">${translate("sdp.dc.header.learnmore")}</a></span></div>`;
      jQuery("#telephony-config").find("#avaya_warning").remove();
      jQuery("#telephony-config").prepend($banner);
      //disable toggleservice if avaya is enabled
      if(jQuery("#telephonyToggle").length > 0){
       jQuery("#telephonyToggle").parent().addClass("opac5 ptr-ev-none");
      }
    }
  },
  redirectPhonebridge:function(){
      if(sdp_app.IS_DEMO_BUILD){
          window.showalert("failure", translate("sdp.demo.errormsg"), "isAutoHide=false"); //No I18N
          return;
      }
      let link = encodeURIComponent(window.location.origin+`/ui/home?action=ZTAuth`);
      link = encodeURIComponent(link);
      let homepageURL = `https://www.${sdp_user.useLocalZoho ? "localzoho" : "zoho"}.com/phonebridge/signup.html?onpremiseurl=${link}`;//No I18N
      jQuery("[data-id='form-footer']").remove();
      window.open(homepageURL,"_blank","noopener,noreferrer");
    }
}

/*
template_settings_dup - Storing template settings object value inorder to access inside telephony_history variable
*/
var template_settings_dup;
if (template_settings) {
  template_settings_dup = jQuery.extend(true, [], template_settings);
}
else{
  template_settings_dup = top.template_settings_dup;
}

var telephony_history = {
  model: {},
  contentHidden: false,
  temp: template_settings_dup,
  call: {
    "callerName": "", //No I18N
    "callerNumber": "", //No I18N
    "callerId": "", //No I18N
    "callId": "" //No I18N
  },
  is_service_catalog: typeof(template_settings) != "undefined" ? template_settings_dup.is_service_catalog_enabled : false , //No I18N

  route_model: function (from) {
    jQuery("#helpcard").hide();
    this.disp(from);

  },
  /*
  * Method to render hbs file and display Telephony Logs table.
  */
  disp: function (from) {
    var _self = this;
    var telephonyCallsKey=translate("com.me.admin.telephony.calls");
    var callHistoryFilter = [
      {"key": 'history', "value" : translate("all.entity.templates",[telephonyCallsKey])},//No I18N
      {"key": 'completed', "value" : translate("telephony.status.completed",[telephonyCallsKey])},//No I18N
      {"key": 'outgoing', "value" : translate("telephony.status.dialed",[telephonyCallsKey])},//No I18N
      {"key": 'missed', "value" : translate("telephony.status.missed",[telephonyCallsKey])},//No I18N
      {"key": 'active', "value" : translate("telephony.status.ongoing",[telephonyCallsKey])}//No I18N
    ];
    renderhbs('#telephonic_history', 'telephony_history',callHistoryFilter, false, 'admin', true, "", function () {
      setTimeout(function () {
        _self.renderCallLogTable(from)
      }, 160)
    });
    jQuery("#telephonic_history").removeClass("hide");
    initTooltip('#telephony_logs'); //No I18N

  },
  /*
  * Method to switch filter among Call Types(Completed calls,Missed calls etc)
  */
  getFilterCriteria: function (stateName) {
    var filter={};
    filter.condition="is";//No I18N
    if(stateName!="history"){
      filter.values=[stateName];
        if (stateName == "outgoing") {
           filter.field="type";//No I18N
        }
        else  {
           filter.field="status";//No I18N
        }
    }
    else{
        filter.field="type"; //No I18N
        filter.values=["incoming","outgoing"];//No I18N
    }
   return filter;
  },
 /*
 * Method to render logs according to the Call Types selected in the dropdown
 */
  switchFilter: function (stateName) {
    jQuery("#call_log_filter li.active").removeClass("active");
    jQuery("#call_log_filter li[data-id='" + stateName + "']").addClass("active");
    telephonyLogsTableId=jQuery("#" + telephony_history.TelephonyLogsTable.tableId + "_div");
    telephonyLogsTableId.find(".searchRow input").val("");
    telephonyLogsTableId.find(".searchRow").hide();
    telephony_history.TelephonyLogsTable.t_obj.table_info.list_info.search_criteria = telephony_history.getFilterCriteria(stateName);
    telephony_history.switchFilterDisplay(stateName);
    telephony_history.TelephonyLogsTable.refreshTable("refresh"); //NO I18N
  },
  /*
  * Method to dispay name of the Call Types in the dropdown
  */
  switchFilterDisplay: function(stateName) {
    var callsKey=translate("com.me.admin.telephony.calls");
    var telephonyHistoryDropText=jQuery("#telephony_history_droptext");
    switch(stateName){
      case "missed": //No I18N
        telephonyHistoryDropText.text(translate("telephony.status.missed", [callsKey])); //NO I18N
        break;
      case "active":   //NO I18N
        telephonyHistoryDropText.text(translate("telephony.status.ongoing", [callsKey])); //NO I18N
        break;
      case "completed":  //NO I18N
        telephonyHistoryDropText.text(translate("telephony.status.completed", [callsKey])); //NO I18N
        break;
      case "outgoing":  //NO I18N
        telephonyHistoryDropText.text(translate("telephony.status.dialed", [callsKey])); //NO I18N
        break;
      case "history":   //NO I18N
        telephonyHistoryDropText.text(translate("all.entity.templates", [callsKey])); //NO I18N
        break;
      }
  },
  /*
  * Method to display Telephony Logs table
  */
  renderCallLogTable: function (from) {
    var _self = this;
    var header_metadata = {

      "create_ticket_icon": { //NO I18N
        "default":true,//NO I18N
        "dataCelltransformer": _self.createTicketIconTransformer, //NO I18N
        "type": "icon" //NO I18N
      },

      "caller": { // No I18N
        "default":true,//NO I18N
        "dataCelltransformer": _self.NameTransformer, //NO I18N
        "disableSorting": true, //NO I18N
        "type": "lookup", //No I18N
        "lookup_field": "name" //No I18N

      }
      };
    // Account data shown for msp and scp
    if(checkIfMSPOrSCP()){
    	header_metadata.calleraccount= { 
    	        "default":true,//NO I18N
    	        "dataCelltransformer": _self.AccNameTransformer, //NO I18N
    	        "disableSorting": true, //NO I18N
    			"disableSearching": true, //NO I18N
    	        "type": "lookup", //No I18N
    	        "lookup_field": "name" //No I18N

    	      }
    }
	
    header_metadata.caller_number= { 
        "default":true,//NO I18N
        "disableSorting": true //NO I18N

      }
   	header_metadata.receiver={ 
          "default":true,//NO I18N
          "dataCelltransformer": _self.NameTransformer, //NO I18N
          "disableSorting": true, //NO I18N
          "type": "lookup", //No I18N
          "lookup_field": "name" //No I18N

        }
    
  if(checkIfMSPOrSCP()){
  	// Account data shown for msp and scp
    header_metadata.receiveraccount= { 
        "default":true,//NO I18N
        "dataCelltransformer": _self.AccNameTransformer, //NO I18N
        "disableSorting": true, //NO I18N
		"disableSearching": true, //NO I18N
        "type": "lookup", //No I18N
        "lookup_field": "name" //No I18N

      }
  }
    
    header_metadata.receiver_number ={ 
         "default":true,//NO I18N
        "disableSorting": true //NO I18N

      }
    header_metadata.status= { 
        "default":true,//NO I18N
        "text": translate("telephony.call.type"), // No I18N
        "dataCelltransformer": _self.callTypeTransformer, //NO I18N
        "disableSorting": true, //NO I18N
        "disableSearching": true, //NO I18N

      }
    header_metadata.start_time= {
        "default":true,//NO I18N
        "text": translate("sdp.admin.zreports.time"), // No I18N
        "type": "date-time", //NO I18N


      }
    header_metadata.duration= { 
        "default":true,//NO I18N
        "text": translate("sdp.project.taskattribute.duration"), //NO I18N
        "dataCelltransformer": _self.durationTransformer, //NO I18N
        "disableSearching": true, //NO I18N
        "disableSorting": true //NO I18N

      }
    
    var table_height,
    table_width,
    windowJQ = jQuery(window);
    if (from == "telephonyicon") {
      table_height = "480px";//No I18N
      table_width = '100%';
    } else {
      table_height = windowJQ.height() - (jQuery('#header-placeholder').height() + 350);
      table_height = (table_height < 200) ? 200 : table_height;
      table_height = (table_height > 330) ? 330 : table_height;
      table_width = windowJQ.width() - 290;
      var div = jQuery('#telephony_history_div').parent();
      div.css('width', table_width); //No I18N
      div.removeClass("brdtop0");
    }
    var table_info;
    table_info = getPersonalizeData("telephony_history_listview");
    if (!table_info || jQuery.isEmptyObject(table_info)) {
      table_info = {
        "list_info": {  //NO I18N
          "row_count": 25  //NO I18N
        }
      };
    }
    table_info.fields_required = {};
    var table_content = {
      "header": header_metadata  //NO I18N
    };
    var options = {
      entity_name: "telephony_history", //NO I18N
      tableHolder: "telephony_history", //NO I18N
      callbackURL: "telephony_history", //NO I18N
      paginationEnabled: true,
      searchEnabled: true,
      sortingEnabled: true,
      listSettingEnabled: false,
      isODAPI: true,
      getmetaInfo:true,
      hidePageLength: false,
      staticHeader: true,
      width: table_width,
      height: table_height,
      personalize_key: "telephony_history_listview", //NO I18N
      callbackSearchFunction: _self.callbackSearchFunction,

      default_sort_field: {
        "sort_field": "start_time", //NO I18N
        "sort_order": "desc"  //NO I18N
      },

      row_inputdata: {
        list_info: table_info.list_info
      }
    }

    _self.TelephonyLogsTable = new tableComponent(table_info, table_content, options);


  },
  /*
  * Method to search data in Telephony Logs table
  */
  callbackSearchFunction: function () {
    var search_criteria = telephony_history.getFilterCriteria(jQuery("#call_log_filter .active").attr("data-id"));
    var search_fields = telephony_history.TelephonyLogsTable.t_obj.table_info.list_info.search_fields;
    if (search_fields) {
    search_criteria.children = [];
    var searchFieldArr = ["caller.name", "receiver.name", "caller_number", "receiver_number"];//No I18N
    for (var index = 0; index < searchFieldArr.length; index++) {
//    var contains = "contains";//No I18N
//      if(searchFieldArr[index] == "caller_number" || searchFieldArr[index] == "receiver_number"){
//         contains = "contains";             //No I18N
//      }
      if(search_fields[searchFieldArr[index]]){
      search_criteria.children.push({
          "logical_operator": "and", //No I18N
          "field": searchFieldArr[index], //No I18N
          "condition": "contains", //No I18N
          "values": [ //No I18N
              search_fields[searchFieldArr[index]]
          ]
      });
      }
    }
   }
    delete telephony_history.TelephonyLogsTable.t_obj.table_info.list_info.search_fields;
    telephony_history.TelephonyLogsTable.t_obj.table_info.list_info.search_criteria = search_criteria;
    telephony_history.TelephonyLogsTable.refreshTable("search"); //No I18N
  },
  /*
  * Method to display call status in Telephony Logs table
  */
  callTypeTransformer: function (table_data) {
    var rd = table_data.row_data;
    if (rd.type == "outgoing") {
      if (rd.status == "success") //NO I18N
        return '<div class="d_w" rel="uitip" mode_ellipses="true" title="' + translate("sdp.common.success") + '" style="width:100px;">' + translate("sdp.common.success") + '</div>';
      else
        return '<div class="d_w" rel="uitip" mode_ellipses="true" title="' + translate("sdp.common.failed") + '" style="width:100px;">' + translate("sdp.common.failed") + '</div>';
    } else {
      var callKey=translate("com.me.admin.telephony.call");
      switch(rd.status){
      case "missed": //No I18N
        return '<div class="d_w text-danger" rel="uitip" mode_ellipses="true" title="' + translate("telephony.status.missed", [callKey]) + '" style="width:100px;">' + translate("telephony.status.missed", [callKey]) + '</div>';
      case "completed"://No I18N
        return '<div class="d_w" rel="uitip" mode_ellipses="true" title="' + translate("telephony.status.completed", [callKey]) + '" style="width:100px;">' + translate("telephony.status.completed", [callKey]) + '</div>';
      case "outgoing"://No I18N
        return '<div class="d_w" rel="uitip" mode_ellipses="true" title="' + translate("telephony.status.outgoing", [callKey]) + '" style="width:100px;">' + translate("telephony.status.outgoing", [callKey]) + '</div>';
      case "active"://No I18N
        return '<div class="d_w" rel="uitip" mode_ellipses="true" title="' + translate("telephony.status.ongoing", [callKey]) + '" style="width:100px;">' + translate("telephony.status.ongoing", [callKey]) + '</div>';
      case "ringing"://No I18N
        return '<div class="d_w"  rel="uitip" mode_ellipses="true" title="' + translate("telephony.status.ringing", [callKey]) + '" style="width:100px;">' + translate("telephony.status.ringing", [callKey]) + '</div>';
      }
    }
  },
  /*
  * Method to display Create ticket icon for missed calls in Telephony Logs table
  */
  createTicketIconTransformer: function (table_data) {
    var callerName = translate("sdp.change.initiator.unknown"); //NO I18N
    var callerId = -1;

     var rd = table_data.row_data;

     if (rd.entity == "request" && sdp_user.ROLES.includes("ViewRequests")) {
       return `<span title="${translate("sdp.requests.common.requestlink.tooltip")}" rel="uitip" class="${rd.entity_portal_id == null ? 'req-sprite incident-req-icon cur-ptr ptr-ev-none opac5' : 'req-sprite incident-req-icon cur-ptr '}" ${rd.entity_portal_id == null ? '' : `data-event="click" data-handler="telephony_history.viewrequest(${e_attr(rd.entity_id)},${e_attr(rd.entity_portal_id.toString())})" nonce="${sdpNonce}"`}></span>`;
     }

     if (rd.status == "missed" && sdp_user.ROLES.includes("CreateRequests")) {
        if (rd.caller) {
        callerName = rd.caller.name;
        callerId = rd.caller.id;
        }
        return '<span class="cspr icon-md create-request cur-ptr flat" title="' + translate("common.create.new.ticket") + '" rel="uitip" role="img" data-event="click" data-handler="telephony_history.createDialogBox(\'' + e_attr(callerName) + '\',' + e_attr(rd.caller_number) + ',' + e_attr(callerId.toString()) + ','+e_attr(rd.id)+');" nonce="'+sdpNonce+'" data-cusposition="center" data-target="createrequest"></span>';
     }

  },
  /*
  * Method to display name of the caller and receiver in Telephony Logs table
  */
  NameTransformer: function (table_data) {

    var rd = table_data.row_data;
    var hd = table_data.head_data;
    if (hd.id == "caller") {
      if (!rd.caller) {
        return translate("sdp.change.initiator.unknown"); //NO I18N
      } else {
        return '<a href="/" style="width:100px;" rel="uitip" mode_ellipses="true" title="' + e_attr(rd.caller.name) + '" data-event="click" data-handler="telephony_history.callerDetails(' + e_attr(rd.caller.id) + ')" nonce="'+sdpNonce+'">' + e_html(rd.caller.name) + '</a>';

      }
    } else {
      if (!rd.receiver) {
        return translate("sdp.change.initiator.unknown"); //NO I18N
      }
        else{
        return '<a href="/" style="width:100px;" rel="uitip" mode_ellipses="true" title="' + e_attr(rd.receiver.name) + '" data-event="click" data-handler="telephony_history.callerDetails(' + e_attr(rd.receiver.id) + ')" nonce="'+sdpNonce+'">' + e_html(rd.receiver.name) + '</a>';
      }
    }

  },
  /*
  * Method to display account name of the caller in Telephony Logs table
  */
  AccNameTransformer: function (table_data) {

    var rd = table_data.row_data;
    var hd = table_data.head_data;
    if (hd.id == "calleraccount") {
      if (!rd.caller) {
        return translate("sdp.change.initiator.unknown"); //NO I18N
      } 
      else if(!rd.caller.account){
			return "-";
    }else {
        return '<a style="width:100px;" rel="uitip" mode_ellipses="true" title="' + e_attr(rd.caller.account.name) + '" ">' + e_html(rd.caller.account.name) + '</a>';
      }
    }  else {
      if (!rd.receiver) {
        return translate("sdp.change.initiator.unknown"); //NO I18N
      }
      else if(!rd.receiver.account){
			return "-";
      }
        else{
			return '<a style="width:100px;" rel="uitip" mode_ellipses="true" title="' + e_attr(rd.receiver.account.name) + '" ">' + e_html(rd.receiver.account.name) + '</a>';
      }
    }

  },
  /*
  * Method to display details of the caller and receiver in Telephony Logs table
  */
  callerDetails: function (id) {

    window.NewWindow("/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=" + id + "&minContent=true", getMessageForKey("sdp.inventory.wsRtPanel.userDetails"), "450", "500", "yes", "center",null,null,null,true);

  },
  /*
  * Method to display duration of the call in Telephony Logs table
  */
  durationTransformer: function (table_data) {

    var rd = table_data.row_data;
    var str = "";
    if (rd.duration) {
      if (rd.duration.hours != "00")
        str = str + rd.duration.hours +" "+translate("sdp.requests.view.hour")+" ";
      if (rd.duration.minutes != "00")
        str = str + rd.duration.minutes +" "+translate("sdp.events.mins")+" ";
      if (rd.duration.seconds != "00")
        str = str + rd.duration.seconds +" "+translate("telephony.duration.seconds");

      return str;
    } else {
      return "-";
    }

  },
  /*
  * Method to display create request pop up when create request icon is clicked in Telephony Logs table
  */
  createDialogBox: function (callername, callernumber, callerId,callId) {
    template_settings = this.temp
    is_service_catalog_enabled = this.is_service_catalog;
    var $template = jQuery(renderhbs(null,"telephony-create-request",{"sdp_nonce":sdpNonce},false,"admin",false,false,false,true)); //No I18N
    //As html is extracted from hbs nonce attr is stripped hence adding nonce attr to all the elements with attr "nonce"
    $template.find("[nonce='']").attr("nonce",sdpNonce);
    var templates_element = template_obj.cloneCategories();
    var key = "templates"; //No I18N
    createRequestPopUp($template, templates_element, key);
    $sdEventListener("#_DIALOG_LAYER");//No I18N
    telephony_history.call = {
      "callerName": callername, //No I18N
      "callerNumber": callernumber, //No I18N
      "callId": callId, //No I18N
      "callerId": callerId //No I18N
    }
  },
  /*
  * Method to create request via create request pop up in Telephony Logs table
  */
  createRequest: function (a) {

    var $this_obj = jQuery(a);
    var $parentObj = $this_obj.parents("#create_req"); //No I18N
    var templateID = $parentObj.find("#temp_selection").val(); //NO I18N
    var url = "/WorkOrder.do?woMode=newWO&service=telephony"; //No I18N
    if (templateID != 0) {
      url = url + "&reqTemplate=" + templateID; //NO I18N
    }
    if (telephony_history.call.callerId != -1) {
      url = url + "&reqID=" + telephony_history.call.callerId; //No I18N
    }
    var subContent = window.translate("com.me.common.telephony.call.received", [e_html(telephony_history.call.callerName) + " (" + e_html(telephony_history.call.callerNumber) + ")"]);
    Store.setItem({
      key: "call_subject", //NO I18N
      value: subContent,
      days: 1
    });
    Store.setItem({
      key: "call_id",  //NO I18N
      value: telephony_history.call.callId,
      days: 1
    });
    telephony_history.call = {
      "callerName": "", //No I18N
      "callerNumber": "", //No I18N
      "callId": "", //No I18N
      "callerId": "", //No I18N
    };

    window.open(url);
    closeDialog();

  },
  /*
  * Method to view request associated with the call in Telephony Logs table
  */
  viewrequest: function (entity_id,entity_portal_id) {
    var url = "/WorkOrder.do?woMode=viewWO&woID="+ entity_id+"&PORTALID="+entity_portal_id; //NO I18N
    window.open(url);

  },
  /*
  * Method to display Telephony Logs table via call Logs icon using preview component
  */
  ShowCallLogPreview: function (element) {
    //If  User is an SDOrgAdmin and is viewing logs in settings page 
    let is_esm_setting = window.top.sdp_app.IS_ESMDIR && window.top.sdp_user.ROLES.includes("SDOrgAdmin"); //NO I18N
    let is_telephony_settings = jQuery(element).attr("id") == "telephony_call_logs" && sdp_user.ROLES.includes("SDAdmin"); //NO I18N
    if(sdp_app.IS_TELEPHONY_ENABLED || is_esm_setting || is_telephony_settings){
        jQuery("#telephonic_history").remove();
        jQuery('body').append('<div id="telephonic_history"></div>');
        jQuery("#telephonic_history").show().panelSlider({
        width: "80%",
        header: true,
        placement: "right", //NO I18N
        title: translate("telephony.logs"),//No I18N
        dialogClass: "tabui-rightpanel channel-dialog", // NO I18N
        modal: true,
        open: function () {
            telephony_history.route_model("telephonyicon");//NO I18N
        },
        close: function () {
            jQuery("#telephonic_history").remove();
            if(jQuery('.ui-dialog').length <1){
            jQuery('body').removeClass('of-h'); // NO I18N
            jQuery('body').removeClass('subheader-of-h'); // NO I18N
            }
        }
        });
    }
  },
  /*
  * Method to update entity name and ID in DB associated with the call
  */
  updateEntityId: function (callId, entity_name, entity_id) {

    var telephony_history = {
      "telephony_history": { //NO I18N
        "entity": entity_name, //NO I18N
        "entity_id": entity_id //NO I18N

      }
    };
    var input_data = sdpAjaxInputData(telephony_history);
    sdpAjax({
      method: "PUT", //No I18N
      url: "/api/v3/telephony_history/" + callId, //NO I18N
      data: input_data,

    });

  }

}

var zoho_telephony={
  access_token:"",
  access_expiry:"",
  initpage : function(){
    /** No Access Token will be generated and no js will be loaded untill all the Users are synced in PB Org   */
    if(sdp_user.ZohoTelephony.showMarketPlace != null && !sdp_user.ZohoTelephony.showMarketPlace){
      return;
    }
    zoho_telephony.access_token = sdp_user.ZohoTelephony.pbaccessToken;
    if(zoho_telephony.access_token == ""){
      this.makeAccountsCall();
    }
    window.addEventListener('message', function(e){
      //when a phonecall is recieved , PB searches for the user using this message
      let info = typeof e.data == 'object' ? e.data : JSON.parse(e.data); //NO I18N
      if('action' in info){
        let action = info.action;
        let phoneBridgeDomain = `https://${zoho_telephony.getdomain(null,true)}`;
        if(action == "searchCaller" && e.origin == phoneBridgeDomain ){
          let phonenumber = info.phonenumber;
          let msg_id = info.id;
          let user = zoho_telephony.getUserDetails(phonenumber);
          if(user != null){
            let response = {
              "action" : "updateCaller",//NO I18N
              "id": msg_id,//NO I18N
              "phonenumber":phonenumber,//NO I18N
              "details": user.details, //NO I18N
            }
            jQuery("#zpbsdk")[0].contentWindow.postMessage(sdpToJSON(response),phoneBridgeDomain); //NO I18N
          }
          
        }
      }
    }, false);
    this.loadPhonebridge();

  },
  /** pass "accounts" to get "accounts.zoho.com" , is PB if PB URL required */
  getdomain : function(URL,isPB){
    let domain = null;
    if(isPB){
      return sdp_user.ZohoTelephony.pbDC
    }
    else{
      //slice from 1 to handle .com.cn or .com.au domains
      let subdomain = sdp_user.ZohoTelephony.pbDC.split('.').slice(1).join('.'); 
      domain = URL + "." + subdomain;
      return domain;
    }
  },
  makeAccountsCall: function(){
    //accounts.localzohoportal.com for localzoho and accounts.zohoportal.com|in|eu|com.cn|com.au|jp for live
    let domain = sdp_user.useLocalZoho ? `accounts.localzohoportal.com` : `accounts.zohoportal.${sdp_user.ZohoTelephony.pbDC.split('.').slice(2).join('.')}`;
    jQuery.ajax({
      url: `https://${domain}/accounts/op/${sdp_user.ZohoTelephony.pbclientzaaid}/oauth/v2/remote/auth?client_id=${sdp_user.ZohoTelephony.pbclientid}&scope=PhoneBridge.onpremiseclient.useroperation&response_type=remote_token&jwt_token=${sdp_user.ZohoTelephony.phoneBridgejwt}&orgtype=57`,
      method: "POST",
      async: false,
      success: function(data) {
        zoho_telephony.access_token = data.access_token;
        let input = {
          "accessToken": data.access_token, //No I18N
          "accessExpiry": Date.now()+(data.expires_in_sec*1000), //No I18N 
          "serviceName": "ZohoTelephony" //No I18N
        };
        
        sdpAjax({
          url: "/TelephonyDef.do?action=updatePBTokens", // NO I18N 
          method: "POST", //No I18N
          data: input
        });
      }
    });
  },
  loadPhonebridge: function () {
    if(typeof(sdp_user.ZohoTelephony.pbDomain) == 'undefined'){
      const darkMode = typeof(sdp_user.CLIENT_CONF.userTheme) != "undefined" ? sdp_user.CLIENT_CONF.userTheme.nightMode : false; //No I18N
      let configJson = {
        "serviceName":"SDPOnPremise",//NO I18N
        "darkmode": darkMode,//NO I18N
        "serviceId":sdp_user.ZohoTelephony.pbclientzaaid,//NO I18N
        "doNotDisturb":false,//NO I18N
        "pbDomain": `https://${zoho_telephony.getdomain(null,true)}`,//NO I18N
        "pbzaaid": sdp_user.ZohoTelephony.pbclientzaaid,//NO I18N
        "access_token" : zoho_telephony.access_token, //No I18N
        "zpbContainerId": "ZT-dialpad" //NO I18N
      };
      var pbjs = document.createElement('script');
      pbjs.setAttribute("nonce",sdpNonce);

      jQuery.ajax({
        url: `${configJson.pbDomain}/phonebridge/users/loadJS`,
        method: 'GET', //NO I18N
        async: true,
        headers: {
          'Authorization': 'Zoho-oauthtoken ' + zoho_telephony.access_token, //NO I18N
          'X-PB-ZAAID': sdp_user.ZohoTelephony.pbclientzaaid //NO I18N
        },
        success: function(response) {
          //check if the cdn is of PhoneBridge to avoid loading spam cdns
          if(response.includes("phonebridge")) {
            pbjs.src = 'https:' + response;
            pbjs.onload = function () {
              PB.jsurl = pbjs.src.substring(0,
              pbjs.src.lastIndexOf('/'));
              PB.init(configJson); 
            }
            document.head.appendChild(pbjs);
          }
        }
      });
    }
  },
  getUserDetails : function(phone){
    let input ={"phone" : phone}//NO I18N
    let response = null;
    sdpAjax({
      url:`/TelephonyDef.do?action=searchUser`,
      method:"POST",//NO I18N
      data:input,
      async : false,
      success:function(data){
        response = data;
      }
    });
    return response;
  },
  loadMarketplace:function(){
    jQuery(window).ready(function() {
      jQuery("#MKplace").addClass("block-bordered");
      renderhbs('#MKplace','telephony_marketplace',{},true,'admin');//NO I18N
      setTimeout(function(){ PB.loadSetup(700,"PBmarketplace"); }, 1000);
    });
  }
}
/** callback function from phonebridge setup after all the scripts are loaded */ 
function callbackZPB(){
  if(jQuery("#ZT-dialpad").children().length > 0) {
    jQuery("#ZT-dialpad").children().addClass("btn-link btn btn-sm bottombar-btn"); //NO I18N
  }
  //adjusting dialpad styles if dialpad exists
  if(jQuery("#ZT-dialpad > #zpbdialpadicon").length > 0){
    jQuery("#ZT-dialpad").find("#zpbdialpadicon > .pbDialerIco").css("width","16px"); //NO I18N
    jQuery("#ZT-dialpad").find("#zpbdialpadicon")[0].style.removeProperty('border-top'); //NO I18N
  }
  if(jQuery("#ZT-dialpad > #zpbstatusicon").length > 0){
    jQuery("#ZT-dialpad").find("#zpbstatusicon")[0].style.removeProperty('border-top'); //NO I18N
  }
  //Align the chats after rendering dialpad 
  if(typeof(chtload) != "undefined"){
    chtload.chatpickalignmentfn();
  }
  //If User is in Marketplace page then load the marketplace
  if(jQuery("#MKplace").length > 0){
    zoho_telephony.loadMarketplace();
  }
}

var telephony_settingspage={
  default_service : sdp_app.TELEPHONY_SERVICE,
  switchTab: function(el){
     
    let $curr = jQuery(el);
    let page = $curr.attr("data-id");


    let $tab = page == "Legacy" ? jQuery("#ZTSettings"): jQuery("#legacySettings"); //NO I18N
    $curr.addClass("active");
    $tab.removeClass("active");

    let $settings = jQuery("#telephonysettings_container");

    $settings.removeClass("hide");
    jQuery("#telephonic_history").addClass("hide");
    
    if(page == "ZohoTelephony"){
      //If the user is in legacy telephony settings page and is switching to ZohoTelephony
      let $cont = jQuery("#telephonic_container").find("#telephonysettings_container");
      let is_default = this.default_service == "ZohoTelephony";
      let is_integrated = sdp_app.IS_ZOHOTELEPHONY_ENABLED;
		  renderhbs($cont,'zohotelephony_settings',{"DMS":sdp_app.IS_DMS_ALIVE,"IS_DEFAULT":is_default,is_integrated},false,'admin',true,false,function(){telephony_settingspage.zohotelephony_settings_events();  });			//No I18N
      if(is_default){
        jQuery("#enableZT").prop("checked",true);
      }
      if(telephonic_data.model.hasOwnProperty("ZohoTelephony") && telephonic_data.model.ZohoTelephony.hasOwnProperty("integration_data")){
        let ZT_data = telephonic_data.model.ZohoTelephony;
        let selectedDC = ZT_data.DC;
        let $edit = jQuery("#editZTelephony");
        //hide edit page and show info page 
        $edit.removeClass("hide");
        jQuery("#startZTelephony").addClass("hide");
        //update in the info page
        $edit.find("#edit_DC").text(selectedDC);
        const status = ZT_data.integration_data.isDMSAlive ? "Connected" : "Disconnected"; //No I18N
        $edit.find("#DMS_status").text(status);

        //disable uneditable fields
        $cont.find("#jsDomains").val(ZT_data.jsDomains).attr("disabled",false);
        $cont.find("#gotoZTdetails").removeClass("hide");
        $cont.find("#authorizeZT").remove();

        jQuery("#TelephonyDC").attr("disabled",true);//NO I18N
        
        if(is_default){
          //load PhoneBridge files
          if(sdp_user.ZohoTelephony.showMarketPlace){
            zoho_telephony.initpage();
          }
          else{
            //unhide loading screen until the user sync is completed
            jQuery('#TelephonyLoadingDiv').removeClass("hide");
          } 
        }
      }

    }
    else if(page == "Legacy"){
      //If the user is in Zohotelephony Settings page and is switching to legacy Telephony settings 
      
      telephonic_data.disp();

    }
  },
  editZTsettings: function(a){
    let $edit_page = jQuery("#editZTelephony");
    let $start_page = jQuery("#startZTelephony");
    let a_id = jQuery(a).attr("id")
    if(a_id == "editZTdomains"){
      $edit_page.addClass("hide");
      $start_page.removeClass("hide");
    }
    else if(a_id =="gotoZTdetails"){
      $start_page.addClass("hide");
      $edit_page.removeClass("hide");
    }
    
  },
  updatedefaultTelephonyService:function(serviceName){
    sdpAjax({
      url: "/TelephonyDef.do?action=updateService", //No I18N
      type: "POST", //No I18N
      async: false,
      data:{"serviceName":serviceName}, //No I18N
      success: function(data) {
        telephony_settingspage.default_service = serviceName;
        const message = serviceName != "null" ? e_html(translate("sdp.zohotelephony.enabled",[serviceName])) : e_html(translate("sdp.zohotelephony.disabled",[serviceName])); //No I18N
        if(serviceName != "null"){
          window.showalert("success", message , "isAutoHide=true"); //NO I18N
        }
      }
    });
  },
  enableZohoTelephony: function(el){
    let $el = jQuery(el);
    //check if toggle is enabled or disabled
    let enabled = $el.attr("checked") != undefined ;
    if(!enabled){
      //use ZohoTelephony
      telephony_settingspage.updatedefaultTelephonyService("ZohoTelephony"); //No I18N
    }
    else{
      //disable ZohoTelephony
      this.updatedefaultTelephonyService("null"); //No I18N
      telephony_settingspage.default_service = null;
    }
    window.location.reload();
  },

  telephony_settings_events: function(){
    const $page = jQuery("#telephonic_settings");

    $page
      .off("click change") // Unbind all relevant events in one call
      .on("click", "[data-id='getTLink']", () => telephonic_data.getTLink())
      .on("click", "[data-id='asterisk_siptype']", () => telephonic_data.changeSipType("sip"))
      .on("click", "[data-id='asterisk_pjsiptype']", () => telephonic_data.changeSipType("pjsip"))
      .on("click", "[data-id='changepassword_field']",() => telephonic_data.toggleChangePassword())
      .on("click", "[data-id='changepassword_button']",() => telephonic_data.toggleChangePassword())
      .on("click", "#saveIntegration", () => telephonic_data.saveIntegration())
      .on("click", "#removeIntegration", () => telephonic_data.removeIntegration())
      .on("change", "#isEnabled", function () {
        telephonic_data.toggleService(this);
      })
      .on("change", "#selectService", function () {
        telephonic_data.changeService(this.value);
      })
      .on("change", "#tLink", function () {
        telephonic_data.changeTLink(this.value);
      });  

  },
  zohotelephony_settings_events: function(){
    const $page = jQuery("#startZTelephony");

    $page.find("#ZT_signup").off('click').on('click',function(el){ //No I18N
      telephonic_data.redirectPhonebridge();
    });

    $page.parent().find("#enableZT").off('change').on('change',function(el){ //No I18N
      telephony_settingspage.enableZohoTelephony(this);
    });

  }
  
}
