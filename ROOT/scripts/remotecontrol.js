/* $Id$ */
var RemotecontrolAction = {
  url: "",
  templateList: {},
  workstationnametoID: {},
  uemProductName: "UEM Product", //no I18n
  previousworkstationname: "",
  isWindowsWorkstation: false,
  showUsers:false,
  init: function () {
    uemProductName = getUEMProdName(true, false).uem_integ_prod;
    RemotecontrolAction.displayLoadingMsg(getMessageForKey("sdp.common.loading"));
    jQuery("#userName").select2();
    jQuery("#submitbtn").prop("disabled", true); //NO I18N
    jQuery("#fetchuserbtn").css({
          "color": "grey",// No I18N
          "pointer-events": "none"// No I18N
    });
    jQuery("#loadingDiv").css({
        position: "fixed",
        zIndex: "999",
        display:"none"
    });
    var action = jQuery('#dcNameAction').text();
    var wsName = jQuery('#nameWs').text();
    var requestId = 'dcrequestId' in window && dcrequestId!="null" ? dcrequestId : null; //NO I18N
    if(requestId != null){
        jQuery("#rmcRequestId").val(requestId);
        jQuery("#rmcRequestId").prop('readonly', true);//NO I18N
          jQuery("#rmcRequestId").css({
              "color": "#696667",// No I18N
              "background-color": "#eeeeee"// No I18N
         });
    }
    if(wsName != 'null') {
        jQuery("#computer").prop('readonly', true); //NO I18N
          jQuery("#computer").css({
            "background-color": "#eeeeee"// No I18N
          });
        requestId = null;
        if(this.showUsers && this.isWindowsWorkstation){
          jQuery("#fetchuserbtn").removeClass("hide").show();
        }
    }
    var data = {
        action: "getComputersforId", // No I18N
        requestId: requestId,
        wsName : wsName,
        toolAction: "Remotecontrol" // No I18N
      };
    var items =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : data ; //NO I18N
      sdpAjax({
        type: "POST", // No I18N
        url: "/DCToolsActions.do?operation=AssetAction_Post",// No I18N
        data: {
            data: items
        },
        dataType: "json", // No I18N
        success: function (data) {
            RemotecontrolAction.hideLoadingMsg();
            if (data.sdp_status === "server_down") {
                RemotecontrolAction.showMessage(false, getMessageForKey("sdp.admin.tech.enabledclogin.dcstopped",[encodeHTML(getUEMPluginProdName(uemProductName))])); //NO I18N
                jQuery("#submitbtn").prop("disabled", true); //NO I18N
            } else if (data.sdp_status === "admin_server_down") {//NO I18N
                RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.tech.enabledclogin.admin.dcstopped",[encodeHTML(getUEMPluginProdName(uemProductName))])); //NO I18N
                jQuery("#submitbtn").prop("disabled", true); //NO I18N
            } else if (data.sdp_status === "auth_failed") {// No I18N
                RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.dcconfig.connection.apivalid",[encodeHTML(uemProductName)])); //NO I18N
                jQuery("#submitbtn").prop("disabled", true); //NO I18N
            } else if (data.sdp_status === "admin_auth_failed") {// No I18N
                RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.dcconfig.connection.admin.apivalid",[encodeHTML(uemProductName)])); //NO I18N
                jQuery("#submitbtn").prop("disabled", true); //NO I18N
            } else if (data.sdp_status === "incompatiable") {// No I18N
                var mess = getMessageForKey("sdp.admin.dcconfig.tools.dcincompatable",[encodeHTML(getUEMPluginProdName(uemProductName)), encodeHTML(uemProductName)]);
                mess = mess +'<a href="/" id="upgradelink">' +getMessageForKey("sdp.common.upgradenow") +"</a>";
                RemotecontrolAction.showMessage(false, mess);
                jQuery("#submitbtn").prop("disabled", true); //NO I18N
            } else if (data.sdp_status === "admin_incompatiable") {// No I18N
                var mess = getMessageForKey("sdp.admin.dcconfig.tools.dcincompatable",[encodeHTML(getUEMPluginProdName(uemProductName)), encodeHTML(uemProductName)]);
                mess =mess +'<a href="/" id="upgradelink2">' +getMessageForKey("sdp.common.upgradenow") +"</a>";
                RemotecontrolAction.showMessage(false, mess);
                jQuery("#submitbtn").prop("disabled", true); //NO I18N
            } else if (data.sdp_status === "usernot available") {// No I18N
                var userName = data.userName;
                var domainname = data.domainName;
                var errorMessage = getMessageForKey("sdp.admin.dcconfig.usernotavailableMsg",[encodeHTML(userName), encodeHTML(domainname), encodeHTML(uemProductName)]);
                errorMessage = errorMessage +'<a href="/" id="userretrylink">' +getMessageForKey("sdp.admin.dcconfig.retry") +"</a>";
                RemotecontrolAction.showMessage(false, errorMessage);
                jQuery("#submitbtn").prop("disabled", true); //NO I18N
            } else if (data.sdp_status === "adminusernot available") { // No I18N
                var userName = data.userName;
                var domainname = data.domainName;
                var errorMessage = getMessageForKey("sdp.admin.dcconfig.usernotavailableMsg",[encodeHTML(userName), encodeHTML(domainname), encodeHTML(uemProductName)]);
                errorMessage = errorMessage + '<a href="/" id="userretrylink2">' + getMessageForKey("sdp.admin.dcconfig.adminretry") + "</a>";
                RemotecontrolAction.showMessage(false, errorMessage);
                jQuery("#submitbtn").prop("disabled", true); //NO I18N
            } else {
                if (data.sdp_status === "onlyone") {
                    workstationnametoID = data.workstationnames;
                    RemotecontrolAction.addComputers(workstationnametoID);
            }
            jQuery("#submitbtn").prop("disabled", false); //NO I18N
            jQuery("#fetchuserbtn").css({
              "color": "",// No I18N
              "pointer-events": ""// No I18N
            });
        }
      }
    });
   RemotecontrolAction.eventbindings();
  },
  eventbindings: function(){
      jQuery("#tempassci").off("click.rc").on("click.rc","[data-name='errincomp']", function(){ //NO I18N
          return appendDID('//www.manageengine.com/products/desktop-central/service-packs.html?sdpi',true); //NO I18N
      }).on("click.rc","[data-name='isuseravailable']", function(){
          return appendDID('/SetUpWizard.do?forwardTo=technician',true); //NO I18N
      });
  },
  addComputers: function (workstationnametoID) {// used to add the computers while loading the remote control page
        var i;
        jQuery("#computerNameDiv a").remove();
        for (i in workstationnametoID) {
            if (workstationnametoID.hasOwnProperty(i)) {
                var computerValue = workstationnametoID[i].ComputerName;
                var wsID = workstationnametoID[i].workstationID;
                RemotecontrolAction.hideDropDownforComputer(computerValue, wsID, null);
            }
        }
    },
    hideDropDownforComputer: function (computerValue, wsID, isWindows) {//used to set the computer name to div while selecting the computer in dropdown list
        jQuery("#computer").val(computerValue);
        jQuery("#computer").text(wsID);
        //jQuery("#computer").css("color", "black"); // No I18N
        jQuery("#computerNameDiv").removeClass("show").addClass("hide");
        if (this.previousworkstationname == "") {
            this.previousworkstationname = computerValue;
            if(isWindows != null){
                if(isWindows == 'true' && this.showUsers){
                jQuery("#fetchuserbtn").removeClass("hide").show();
                }
                else{
                jQuery("#fetchuserbtn").removeClass("show").hide();
                }
            }
        }
        else if(this.previousworkstationname != computerValue)
        {
            jQuery("#userList").addClass("hide").removeClass("show");
            if(isWindows != null){
                if(isWindows == 'true'  && this.showUsers){
                jQuery("#fetchuserbtn").removeClass("hide").show();
                }
                else{
                jQuery("#fetchuserbtn").removeClass("show").hide();
                }
            }
            this.previousworkstationname = computerValue;
            RemotecontrolAction.clearUsers();
        }
    },
    hidedropdown: function () {//used to hide the computer drop down list
        jQuery("#computerNameDiv").removeClass("show").addClass("hide");
    },
    hideErrorMsg: function () {
        jQuery("#errorMsgFailed").removeClass("show").addClass("hide");
    },
    fillComputerList: function (searchString, event) {// get the computer list from SDP to display using search string
        var key = event.which;
        if (key != 40 && key != 38 && key != 13) {
            jQuery("#errorMsgFailed").removeClass("show").addClass("hide");
            var data = {
                action: "getComputers", // No I18N
                searchString: searchString,
                toolAction: "Remotecontrol" // No I18N
            };
            var items = typeof sdpToJSON != "undefined" ? sdpToJSON(data): data; //NO I18N
            sdpAjax({
                type: "POST", // No I18N
                url: "/DCToolsActions.do?operation=AssetAction_Post",// No I18N
                data: {
                    data: items
                },
                dataType: "json", // No I18N
                success: function (data) {
                    var templates = [];
                    var i;
                    templateList = data.computerList;
                    jQuery("#computerNameDiv a").remove();
                    for (i in templateList) {
                        if (templateList.hasOwnProperty(i)) {
                            jQuery("#computerNameDiv").append('<a href="/" class=\"admin-searchcolor\" id=\"' +e_attr(templateList[i].resourceId+'') +'\" data-isWindows=\"' +e_attr(templateList[i].isWindows) +'\" data-name="rcfillcomputerList">' +e_html(templateList[i].ComputerName) +"</a>");
                        }
                    }
                    jQuery("#computerNameDiv").removeClass("hide").addClass("show");
                    jQuery("#computerNameDiv").css("display", "block"); // No I18N
                    jQuery("#tempassci").off("click.rcfillcomputerList").on("click.rcfillcomputerList","[data-name='rcfillcomputerList']", function(e){ // No I18N
                        e.preventDefault();
                        RemotecontrolAction.hideDropDownforComputer(e.target.text, e.target.id, e.target.getAttribute('data-iswindows'));
                    });
                }
            });
        }
  },
  getUrlParameter: function (sParam) {
        var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split("&"),
        sParameterName,
        i;
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split("=");
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
  },
  save: function (wsName) {// executed while initating the remote control
        jQuery("#failureMsg,#successMsg").addClass("hide");
        var isValidated = true;
        var requestId = RemotecontrolAction.getUrlParameter("requestId"); //No I18N
        var computerName = jQuery("#computer").val();
        var resourceId = jQuery("#computer").text();
        var userName = jQuery("#userName").val();
        var reasonMsg = jQuery("#reasonMessage").val();
        var rmcRequestId = jQuery("#rmcRequestId").val();
        if (computerName == "") {
            jQuery("#errorMsgFailed").removeClass("hide").addClass("show");
            jQuery("#errorMsg").text(getMessageForKey("sdp.admin.dcconfig.wsnotavail")); //No I18N
            jQuery("#computer").focus();
            isValidated = false;
            return;
        }
        if (reasonMsg == "") {
            jQuery("#errorMsgFailed").removeClass("hide").addClass("show");
            jQuery("#errorMsg").text(getMessageForKey("sdp.admin.dcconfig.reasonMessageAlert")); //No I18N
            jQuery("#reasonMessage").focus();
            isValidated = false;
            return;
        }
        if (rmcRequestId != undefined && typeof rmcRequestId != 'number' && isNaN(rmcRequestId)){
            jQuery("#errorMsgFailed").removeClass("hide").addClass("show");
              jQuery("#errorMsg").text(getMessageForKey("sdp.request.externalaction.autoaction.numericval.alertmsg")); //No I18N
              jQuery("#rmcRequestId").focus();
              isValidated = false;
              return;
          }
        if (rmcRequestId != undefined && rmcRequestId != "" && rmcRequestId <= 0){
            jQuery("#errorMsgFailed").removeClass("hide").addClass("show");
            jQuery("#errorMsg").text(getMessageForKey("sdp.request.invalidrequestid.error")); //No I18N
            jQuery("#rmcRequestId").focus();
            isValidated = false;
            return;
        }
        if(requestId == undefined || requestId == ''){
            if(rmcRequestId != ''){
                requestId = rmcRequestId;
            }
        }
        if (isValidated) {
            RemotecontrolAction.displayLoadingMsg(getMessageForKey("sdp.admin.dcconfig.loading"));            jQuery("#submitbtn").prop("disabled", true); //NO I18N
            jQuery("#userName").prop("readonly", true); //NO I18N
            jQuery("#userName").css({
                "color": "#696667",// No I18N
                "background-color": "#eeeeee"// No I18N
             });
            jQuery("#fetchuserbtn").css({
                "color": "grey",// No I18N
                "pointer-events": "none"// No I18N
            });
            jQuery("#refreshUser").css({
                "color": "grey",// No I18N
                "pointer-events": "none"// No I18N
            });
            var data;
            data = {
                action: "remotecontrol", // No I18N
                computerName: computerName,
                requestId: requestId,
                resourceId: resourceId,
                userName: userName,
                reasonMessage: reasonMsg,
                rmcRequestId:rmcRequestId
            };
            var items =typeof sdpToJSON != "undefined"? sdpToJSON(data): JSON.stringify(data); //NO I18N
            jQuery.ajax({
                type: "POST", //NO I18N
                url: "/DCToolsActions.do?operation=AssetAction_Post", //NO I18N
                data: {
                    data: items
                },
                dataType: "json", //NO I18N
                success: function (result) {
                    RemotecontrolAction.hideLoadingMsg();
                    jQuery("#submitbtn").prop("disabled", false); //NO I18N
                    jQuery("#userName").prop("readonly", false); //NO I18N
                    jQuery("#fetchuserbtn").css({
                        "color": "",// No I18N
                        "pointer-events": ""// No I18N
                    });
                    jQuery("#refreshUser").css({
                        "color": "",// No I18N
                        "pointer-events": ""// No I18N
                    });
                    jQuery("#userName").css({
                        "color": "",// No I18N
                        "background-color": ""// No I18N
                    });
                    var windowOptions ="width=" +(screen.availWidth - 50) +"px,height=" +(screen.availHeight - 60) + "px, titlebar=yes, channelmode=yes, scrollbars=yes, resizable=yes, status=yes, menubar=channelmode"; //No I18N
                    if (result.sdp_status === "success") {
                        var url = result.rds_uri;
                        var viewerPopUp = window.open(url, "RemoteControl", windowOptions);
                        if (viewerPopUp != null) {
                            var timer = setInterval(function () {
                                if (viewerPopUp.opener == null) {
                                    clearInterval(timer);
                                     var workLogUrl = result.WorkLogUrl;
                                    if(workLogUrl != undefined && workLogUrl != null){
                                        var worklogPopup = window.open(workLogUrl, "RemoteControl", 'width=370, height=330, left=23, top=21, scrollbars=no, titlebar=yes, copyhistory=no');
                                        if(!worklogPopup){
                                            alert(getMessageForKey("sdp.admin.dcconfig.popupblockMsg")); //NO I18N
                                        }
                                    }
                                    setTimeout(function () {
                                        var connid = result.connection_id;
                                        var data = {
                                            action: "getRemoteControlHistory", // No I18N
                                            requestId: requestId,
                                            connectionid: connid
                                        };
                                        var items = typeof sdpToJSON != "undefined"? sdpToJSON(data): JSON.stringify(data); //NO I18N
                                        jQuery.ajax({
                                            type: "POST", //NO I18N
                                            url:"/DCToolsActions.do?operation=AssetAction_Post", //NO I18N
                                            data: {
                                                data: items
                                            },
                                            dataType: "json", //NO I18N
                                            success: function (data) {
                                                window.close();
                                                window.opener.location.reload();
                                            }
                                        });
                                    }, 5000);
                                }
                            }, 500);
                        }
                        jQuery("#submitbtn").prop("disabled", true); //NO I18N
                        if (viewerPopUp) {
                            RemotecontrolAction.showMessage(true,getMessageForKey("sdp.admin.dcconfig.remotecontrolsuccessMsg",[encodeHTML(uemProductName)]));
                        } else {
                            alert(getMessageForKey("sdp.admin.dcconfig.popupblockMsg")); //NO I18N
                        }
                    } else if (result.sdp_status === "computerisnotlive" || result.errorDesc === '70001') {// No I18N
                        RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.dcconfig.computernotlive")); //NO I18N
                    } else if (result.sdp_status === "agentnotinstalled") {//No I18N
                        var mess = getMessageForKey("sdp.admin.dcconfig.tools.computernotavailable");
                        mess = mess +'<a style="text-decoration:underline;" href="/" onclick="return appendDID(\'//www.manageengine.com/products/desktop-central/help/configuring_desktop_central/managing_computers_lan.html#Installing_Agents_from_Desktop_Central_Console\',true)">' +getMessageForKey("sdp.admin.dcconfig.tools.knowmore") +"</a>";
                        RemotecontrolAction.showMessage(false, mess);
                    } else if (result.sdp_status === "computernotavailable") {// No I18N
                        var mess = getMessageForKey("sdp.admin.dcconfig.tools.computernotavailable");
                        mess = mess +'<a style="text-decoration:underline;" href="/" onclick="return appendDID(\'//www.manageengine.com/products/desktop-central/help/configuring_desktop_central/managing_computers_lan.html#Installing_Agents_from_Desktop_Central_Console\',true)">' +getMessageForKey("sdp.admin.dcconfig.tools.knowmore") +"</a>";
                        RemotecontrolAction.showMessage(false, mess);
                       } else if (data.sdp_status === 'adminusernot available') {// No I18N
                         RemotecontrolAction.showMessage(false,getMessageForKey('sdp.admin.dcconfig.adminusernotavailable'));//NO I18N
                    } else if (data.sdp_status === 'usernot available') {// No I18N
                         RemotecontrolAction.showMessage(false,getMessageForKey('sdp.admin.dcconfig.usernotavailable',[encodeHTML(uemProductName)])); //NO I18N
                    } else if (result.sdp_status === "failed") {// No I18N
                        var errorDesc = result.errorDesc;
                        if (errorDesc ==="User is not authorized to access this API" || errorDesc == "USER0002") {
                            RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.dcconfig.remotecntrl"));
                        } else if(errorDesc == '1122') {
                            RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.dcconfig.agentincompatable"));
                        } else if (errorDesc == '1003' || errorDesc == '80007') {
                            RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.dcconfig.generalerror"));
                        } else if (errorDesc == '80002') {
                            RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.dcconfig.demomode",[encodeHTML(uemProductName)]));
                        } else if (errorDesc == '80006') {
                            RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.dcconfig.unauthorisedaccess"));
                        } else {
                            RemotecontrolAction.showMessage(false, encodeHTML(errorDesc));
                        }
                    } else if (data.sdp_status === "server_down") {  //NO I18N
                         RemotecontrolAction.showMessage(false, getMessageForKey("sdp.admin.tech.enabledclogin.dcstopped",[encodeHTML(getUEMPluginProdName(uemProductName))])); //NO I18N
                         jQuery("#submitbtn").prop("disabled", true); //NO I18N
                     } else if (data.sdp_status === "admin_server_down") {//NO I18N
                         RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.tech.enabledclogin.admin.dcstopped",[encodeHTML(getUEMPluginProdName(uemProductName))])); //NO I18N
                         jQuery("#submitbtn").prop("disabled", true); //NO I18N
                     }
                }
            });
        }
    },
    showMessage: function (isSuccess, message) {
        if (isSuccess) {
            jQuery("#successMsg").removeClass("hide").html(jQuery("<span class='msg'>").html(message)); //NO I18N
        } else {
            jQuery("#failureMsg").removeClass("hide").html(jQuery("<span class='msg'>").html(message)); //NO I18N
        }
    },
    getUsers: function (action) {
            var userObject = this;
            var computerName = jQuery("#computer").val();
            if (computerName == "") {
                jQuery("#errorMsgFailed").removeClass("hide").addClass("show");
                jQuery("#errorMsg").text(getMessageForKey("sdp.admin.dcconfig.wsnotavail")); //No I18N
                isValidated = false;
                return;
            }
            jQuery("#errorMsgFailed").removeClass("show").addClass("hide");
            if(action == "refreshUsers"){
                RemotecontrolAction.displayLoadingMsg(getMessageForKey("sdp.admin.dcconfig.loadingrefreshusers"));
            }
            else{
             RemotecontrolAction.displayLoadingMsg(getMessageForKey("sdp.admin.dcconfig.loadingfetchusers"));
            jQuery("#userList").removeClass("hide").show();
            jQuery("#fetchuserbtn").hide();
            }
            jQuery("#submitbtn").prop("disabled", true); //NO I18N
            jQuery("#userName").prop("readonly", true); //NO I18N
            jQuery("#userName").css({
                "color": "#696667",// No I18N
                "background-color": "#eeeeee"// No I18N
              });
            jQuery("#fetchuserbtn").css({
                "color": "grey",// No I18N
                "pointer-events": "none"// No I18N
            });
            jQuery("#refreshUser").css({
                "color": "grey",// No I18N
                "pointer-events": "none"// No I18N
            });
            var data = {
                action: action,
                resourceName: computerName
            };
            var items = sdpToJSON(data);
            sdpAjax({
                type: "POST", // No I18N
                url: "/DCToolsActions.do?operation=AssetAction_Post",// No I18N
                data: {
                    data: items
                },
                dataType: "json", // No I18N
                success: function (data) {
                    var users;
                    callCount = 0;
                    var userRefreshInitiated;
                    if (data.sdp_status === "success") {
                        if("userList" in data){
                        users = data.userList;
                        RemotecontrolAction.loadUsers(users,action);
                        }
                        else if("userRefreshInitiated" in data){
                        userRefreshInitiated = data.userRefreshInitiated;

                        if(userRefreshInitiated){
                            var timer = setInterval(function() {
                            sdpAjax({type: "POST", // No I18N
                            url: "/DCToolsActions.do?operation=AssetAction_Post",// No I18N
                            data: {
                                data: items
                            },
                            dataType: "json", // No I18N
                            success: function (data) {
                                callCount++;
                                if(callCount > 10){
                                    showalert("failure", getMessageForKey('sdp.admin.dcconfig.alert.refreshusersnotfetched'), "isAutoHide=true"); //NO I18N
                                    clearInterval(timer);
                                }
                                if("userList" in data){
                                    users = data.userList;
                                    clearInterval(timer);
                                    RemotecontrolAction.loadUsers(users,action);
                                 }

                            }
                            })
                            }, 2000);
                        }
                        }
                    }
                    else if (data.sdp_status === "computerisnotlive" || data.errorDesc === '70001') {// No I18N
                        RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.dcconfig.computernotlive")); //NO I18N
                    } else if (data.sdp_status === "agentnotinstalled") {//No I18N
                        var mess = getMessageForKey("sdp.admin.dcconfig.tools.computernotavailable");
                        mess = mess +'<a style="text-decoration:underline;" href="/" id="compnotavlink">' +getMessageForKey("sdp.admin.dcconfig.tools.knowmore") +"</a>";
                        RemotecontrolAction.showMessage(false, mess);
                    } else if (data.sdp_status === "computernotavailable") {// No I18N
                        var mess = getMessageForKey("sdp.admin.dcconfig.tools.computernotavailable");
                        mess = mess +'<a style="text-decoration:underline;" href="/" id="compnotavlink2">' +getMessageForKey("sdp.admin.dcconfig.tools.knowmore") +"</a>";
                        RemotecontrolAction.showMessage(false, mess);
                       } else if (data.sdp_status === 'adminusernot available') {// No I18N
                         RemotecontrolAction.showMessage(false,getMessageForKey('sdp.admin.dcconfig.adminusernotavailable'));//NO I18N
                    } else if (data.sdp_status === 'usernot available') {// No I18N
                         RemotecontrolAction.showMessage(false,getMessageForKey('sdp.admin.dcconfig.usernotavailable',[encodeHTML(uemProductName)])); //NO I18N
                    } else if (data.sdp_status === "server_down") {
                        RemotecontrolAction.showMessage(false, getMessageForKey("sdp.admin.tech.enabledclogin.dcstopped",[encodeHTML(getUEMPluginProdName(uemProductName))])); //NO I18N
                        jQuery("#submitbtn").prop("disabled", true); //NO I18N
                    } else if (data.sdp_status === "admin_server_down") {//NO I18N
                        RemotecontrolAction.showMessage(false,getMessageForKey("sdp.admin.tech.enabledclogin.admin.dcstopped",[encodeHTML(getUEMPluginProdName(uemProductName))])); //NO I18N
                        jQuery("#submitbtn").prop("disabled", true); //NO I18N
                    }
                     RemotecontrolAction.hideLoadingMsg();
                     jQuery("#submitbtn").prop("disabled", false); //NO I18N
                     jQuery("#userName").prop("readonly", false); //NO I18N
                     jQuery("#userName").css({
                         "color": "",// No I18N
                         "background-color": ""// No I18N
                     });
                     jQuery("#fetchuserbtn").css({
                         "color": "",// No I18N
                         "pointer-events": ""// No I18N
                     });
                     jQuery("#refreshUser").css({
                         "color": "",// No I18N
                         "pointer-events": ""// No I18N
                     });


                }
            });

        },
        loadUsers: function (users,action) {
            if(users != undefined && users != null && users!="null" && users !='' )
            {
                var userElement=jQuery("#userName");
                RemotecontrolAction.clearUsers();
                users.forEach(function(user) {
                    var newOption = jQuery('<option>', {
                        value: encodeHTML(user),
                        text: encodeHTML(user)
                    });
                    try {
                        userElement.append(newOption,null);
                    } catch(x) {
                        userElement.append(newOption);
                    }
                });
                if(users.length == 1){
                     userElement.val(users[0]).trigger('change');
                }
                else
                RemotecontrolAction.sortSelectList(userElement);

            }
            else if(users =='' && action == "getLoggedOnUsers"){
                showalert("failure", getMessageForKey('sdp.admin.dcconfig.alert.usersnotfetched'), "isAutoHide=true");
            }


    },
        clearUsers: function () {
            var defaultOptionValue = jQuery('#DefaultOption').val();
            // Remove all option elements except the default one
            jQuery('#userName option').each(function() {
                if (jQuery(this).val() !== defaultOptionValue) {
                    jQuery(this).remove();
                }
            });
            jQuery('#userName').val(defaultOptionValue).trigger('change');
        },
        displayLoadingMsg: function (loadingMsg) {

                    var iconPath = '/images/processing.gif';//No I18N
                    jQuery("#loadingDiv").html('<div class="block-bordered p10 pt8" style="border:solid black 1px;"><img src="' + iconPath + '" align=absmiddle"> &nbsp;<span style="font:14px bold verdana,helvetica,arial,sans-serif;" >'+encodeHTML(loadingMsg)+'</span></div>');
                    jQuery("#loadingDiv").removeClass("hide").addClass("show").addClass("disp-flex");

         },
         hideLoadingMsg: function (){
             jQuery("#loadingDiv").removeClass("show").addClass("hide").removeClass("disp-flex");

         },
         sortSelectList: function(selectList) {
            selectList = $(selectList);
            var selOptions = $A(selectList.options);
            var keys = $A([]);
            var values = $A([]);
            var currentValue = "";
            if(selectList.selectedIndex > -1 && selectList.options[selectList.selectedIndex] != null) {
                currentValue =  selectList.options[selectList.selectedIndex].text;
            }
            selOptions.inject(values, function(arr, val, idx) {arr.push(val.text); return arr;} );
            selOptions.inject(keys, function(arr, val, idx) {arr.push(val.value); return arr;} );
            var sortedValues =  values.clone();

            sortedValues.sort(function(x,y){
              var a = String(x).toUpperCase();
              var b = String(y).toUpperCase();
              if (a > b){
                 return 1;
                 }
              if (a < b){
                 return -1;
                 }
              return 0;
            });

            // clear list
            selectList.innerHTML = '';

            // reconstruct as sorted list
            for (i=0; i<sortedValues.size(); i++) {
                if(currentValue == sortedValues[i]) {
                addNewOption(selectList, keys[values.indexOf(sortedValues[i])],sortedValues[i],true );
            }
            else {
                addNewOption(selectList, keys[values.indexOf(sortedValues[i])],sortedValues[i] );
            }
            }
        },
        addNewOption: function(container, key, val, selected, title) {
            if(selected) {
                jQuery(container).append(jQuery("<option>", {"value" : key, "text" : val, "title" : val})); // No I18N
                jQuery(container).find('option[value="'+key+'"]').prop('selected',true); // No I18N
            }
            else {
                jQuery(container).append(jQuery("<option>", {"value" : key, "text" : val, "title" : val})); // No I18N
            }
        }



};
jQuery(document).ready(function () {
  RemotecontrolAction.init();
  jQuery(document).on('click', '#compnotavlink, #compnotavlink2', function(event) {
    return appendDID('//www.manageengine.com/products/desktop-central/help/configuring_desktop_central/managing_computers_lan.html#Installing_Agents_from_Desktop_Central_Console', true); //NO I18N
});
});