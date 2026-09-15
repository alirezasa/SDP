/* $Id$ */
var DesktopCentralToolsAction = {
	url: '',
	computerList: {},
	chatURL: '',
	workstationnametoID: {},
	userFilled: '',
	dcAction: '',
	dcWsName: '',
	fromSDPpage: '',
    uemProductName: "UEM Product", //no I18n
	init: function () {
        uemProductName = getUEMProdName(true, false).uem_integ_prod;
        var nameAction;
            
        if(DcToolsEssential.dcAction != 'system manager' ){
            this.dcAction = jQuery('#dcNameAction').text();
           
            this.dcWsName = jQuery('#nameWs').text();
        }else{
            jQuery.extend( DesktopCentralToolsAction, DcToolsEssential);
            jQuery("#loadingdivid").removeClass("hide").addClass("show");//NO I18N
        }
    var requestId = 'dcrequestId' in window && dcrequestId!="null" ? dcrequestId :null; // No I18N
                if(this.fromSDPpage != 'true') {
            jQuery('#loadingMsg').show(); //NO I18N
            var toolButtonElem = jQuery('#ToolsButton');
            toolButtonElem.prop('disabled', true); //NO I18N
            var actionName =this.dcAction.toLowerCase();
            if(actionName == 'wake on lan' || actionName == 'wakeonlan'){
                nameAction = getMessageForKey("sdp.admin.dcconfig.wakeonlan");
                toolButtonElem.val( getMessageForKey('sdp.admin.dcconfig.wakeonlanbutton'));//No I18N
            }else if(actionName == 'chat' || actionName == 'chatuser'){//NO I18N
                nameAction = getMessageForKey("sdp.admin.dcconfig.Chat");
                toolButtonElem.val( getMessageForKey('sdp.admin.dcconfig.chatbutton'));//No I18N
            }else if(actionName =='system manager'){ //NO I18N
                nameAction = getMessageForKey("sdp.admin.dcconfig.sysmanager");
                toolButtonElem.val( getMessageForKey('sdp.admin.dcconfig.sysmanagebutton'));//No I18N
            }else if(actionName == 'standby' ){ //NO I18N
                nameAction = getMessageForKey("sdp.admin.dcconfig.StandBy");
                toolButtonElem.val( getMessageForKey('sdp.admin.dcconfig.standbybutton') );//No I18N
            }else if(actionName == 'lock'){ //NO I18N
                nameAction = getMessageForKey("sdp.admin.dcconfig.lock");
                toolButtonElem.val( getMessageForKey('sdp.admin.dcconfig.lock') );//No I18N
            }else if(actionName == 'shutdown'){ //NO I18N
                 nameAction = getMessageForKey("sdp.admin.dcconfig.ShutDown");
                 toolButtonElem.val( getMessageForKey('sdp.admin.dcconfig.ShutDown') );//No I18N
            }else{
                nameAction = getMessageForKey("sdp.admin.dcconfig."+this.dcAction);
                toolButtonElem.val( getMessageForKey('sdp.admin.dcconfig.'+this.dcAction));
            }
            jQuery('#nameAction').val(nameAction);
        }
        this.dcAction =this.dcAction.toLowerCase();
        var src = this;
		var data = {// get the computers name which mapped to the particular request id
			action: 'getComputersforId',// No I18N
			requestId: requestId,
			toolAction : this.dcAction,
			wsName : this.dcWsName
		};
		var items =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) ; //NO I18N
		jQuery.ajax({
			type: 'POST',// No I18N
			url: "/DCToolsActions.do?operation=AssetAction_Post",// No I18N
			data: {
				data: items
			},
			dataType: 'json',// No I18N
			success: function (data) {
				jQuery('#loadingMsg').hide();
				if (data.sdp_status === 'server_down') {
					showFailureMessageAndClose(getMessageForKey('sdp.admin.tech.enabledclogin.dcstopped',[encodeHTML(getUEMPluginProdName(uemProductName))]),20000); //NO I18N
				} else if (data.sdp_status === 'admin_server_down') { //NO I18N
					showFailureMessageAndClose(getMessageForKey('sdp.admin.tech.enabledclogin.admin.dcstopped',[encodeHTML(getUEMPluginProdName(uemProductName))]),20000); //NO I18N
				} else if (data.sdp_status === 'incompatiable' ) {// No I18N
				    var errorMessage=getMessageForKey('sdp.admin.dcconfig.tools.dcincompatable',[encodeHTML(getUEMPluginProdName(uemProductName)), encodeHTML(uemProductName)]);
				    errorMessage=errorMessage+'<a href="/" id="upgradelink">'+getMessageForKey('sdp.common.upgradenow')+'</a>';
					showFailureMessageAndClose(errorMessage,20000);
				} else if (data.sdp_status === 'admin_incompatiable') {// No I18N
				    var errorMessage=getMessageForKey('sdp.admin.dcconfig.tools.dcincompatable',[encodeHTML(getUEMPluginProdName(uemProductName)), encodeHTML(uemProductName)]);
				    errorMessage=errorMessage+'<a href="/" id="upgradelink2">'+getMessageForKey('sdp.common.upgradenow')+'</a>';
					showFailureMessageAndClose(errorMessage,20000);
				} else if (data.sdp_status === 'adminusernot available') {// No I18N
                    var userName=data.userName;
                    var domainname=data.domainName;
                    var errorMessage=getMessageForKey('sdp.admin.dcconfig.usernotavailableMsg',[encodeHTML(userName),encodeHTML(domainname),encodeHTML(uemProductName)]);
                    errorMessage=errorMessage+'<a href="/" id="userretrylink">'+getMessageForKey('sdp.admin.dcconfig.adminretry')+'</a>';
					showFailureMessageAndClose(errorMessage,20000);
				} else if (data.sdp_status === 'usernot available') {// No I18N
					var userName=data.userName;
                    var domainname=data.domainName;
                    var errorMessage=getMessageForKey('sdp.admin.dcconfig.usernotavailableMsg',[encodeHTML(userName),encodeHTML(domainname),encodeHTML(uemProductName)]);
                    errorMessage=errorMessage+'<a href="/" id="userretrylink2">'+getMessageForKey('sdp.admin.dcconfig.retry')+'</a>';
                    showFailureMessageAndClose(errorMessage,20000);
				} else if (data.sdp_status === 'admin_auth_failed') {// No I18N
					showFailureMessageAndClose(getMessageForKey('sdp.admin.dcconfig.connection.admin.apivalid',[encodeHTML(uemProductName)]),20000);
				} else if (data.sdp_status === 'auth_failed') {// No I18N
					showFailureMessageAndClose(getMessageForKey('sdp.admin.dcconfig.connection.apivalid',[encodeHTML(uemProductName)]),20000); //NO I18N
				}
				else{
                    jQuery('#ToolsButton').prop('disabled', false); //NO I18N
                    jQuery('#loadingMsg').hide(); //NO I18N
                    jQuery("#loadingdivid").removeClass("show").addClass("hide");//NO I18N
                    if (data.sdp_status === 'morethanone' ) {// No I18N
                        workstationnametoID = data.workstationnames;
                        DesktopCentralToolsAction.getComputersforMultipleMapped(workstationnametoID);
                        jQuery('#multiplecomputer').removeClass('hide').addClass('show');
                    } else if (data.sdp_status === 'onlyone') {// No I18N
                        jQuery('#onlyonecomputer').removeClass("hide").addClass('show');
                        
                        workstationnametoID = data.workstationnames;
                        for (i in workstationnametoID) {
                            if (workstationnametoID.hasOwnProperty(i)) {
                                var computerName = workstationnametoID[i].ComputerName;
                                var wsID = workstationnametoID[i].workstationID;
                                var confrmaction= getMessageForKey('sdp.admin.dcconfig.toolscnfrmmsg',[encodeHTML(nameAction)]);
                                jQuery('#onlyone').val(encodeHTML(wsID)).text(encodeHTML(computerName));
                                jQuery('#operation').text(confrmaction);
                                if (src.dcAction == 'chat' || src.dcAction == 'chatuser') {
                                    DesktopCentralToolsAction.fillUserList();
                                } else if(src.dcAction == 'system manager'){ //NO I18N
                                    if (src.fromSDPpage == 'true'){
                                        jQuery("#loadingdivid").removeClass("hide").addClass("show");//NO I18N
                                    }
                                    DesktopCentralToolsAction.save();
                                }
                            }
                        }
                    }
                    else {
                        workstationnametoID = data.workstationnames;
                        
                        DesktopCentralToolsAction.addComputers(workstationnametoID);
                        if(src.dcAction == 'chatuser'){ //NO I18N
                            //Means no asset associated to the request, so showing the error message
                            var errorMessage=translate('sdp.requests.viewrequest.noworkstation');
				            showFailureMessageAndClose(errorMessage,20000);
                            
                        }else{
                            jQuery('#computerList').removeClass('hide').addClass('show');
                        }
                    }
				}
            }
        });
        DesktopCentralToolsAction.eventbindings();
	},
    eventbindings: function(){
        jQuery("#_DIALOG_LAYER").off("click.dctools").on("click.dctools","[data-name='dcincomp']", function(){ //NO I18N
            return appendDID('//www.manageengine.com/products/desktop-central/service-packs.html?sdpi',true); //NO I18N
        }).on("click.dctools","[data-name='computernotavailable']", function(){
           return appendDID('//www.manageengine.com/products/desktop-central/help/configuring_desktop_central/managing_computers_lan.html#Installing_Agents_from_Desktop_Central_Console',true); //NO I18N
        }).on("click.dctools","[data-name='isuseravailable']", function(){
            return appendDID('/SetUpWizard.do?forwardTo=technician',true); //NO I18N
        });
    },
	addComputers: function (workstationnametoID) {
		var i;
		jQuery('#computerNameDiv a').remove();
		for (i in workstationnametoID) {
			if (workstationnametoID.hasOwnProperty(i)) {
				var computerName = workstationnametoID[i].ComputerName;
				var wsID = workstationnametoID[i].workstationID;
				DesktopCentralToolsAction.hidedropdownforcomputer(computerName, wsID);
			}
		}
	},
	hidedropdownforcomputer: function (computerName, wsID) {
		jQuery('#computer').val(computerName);
		jQuery('#computer').text(wsID);
		jQuery('#computerNameDiv').removeClass('show').addClass('hide');
		jQuery('#errorMsgFailed').removeClass('show').addClass('hide');
	},
	hidedropdown: function () { //used to hide the computer drop down list
		jQuery('#computerNameDiv').removeClass('show').addClass('hide');
	},
	getComputersforMultipleMapped: function (computerList) {
		var computers = [];
		var i;
		jQuery('#computerLists').find('option').not('[value=-1]').remove(); //NO I18N
		computers.push(jQuery("<option>",{text:getMessageForKey('sdp.admin.dcconfig.choosecomputer'), value:0}));
		for (i in computerList) {
			if (computerList.hasOwnProperty(i)) {
				var name = computerList[i].ComputerName;
				computers.push(jQuery("<option>", {
						text: encodeHTML(name),
						value: encodeHTML(i)
				}));
			}
		}
		jQuery('#computerLists').append(computers);
		jQuery('#computerList').removeClass('show').addClass('hide');
		jQuery('#multiplecomputer').removeClass('hide').addClass('show');
	},
	fillcomputerList: function (searchString,event) {
	    var key = event.keyCode;
	    if ((key != 40 &&key != 38&&key != 13) ){
		    var data = {
			    action: 'getComputers',// No I18N
			    searchString: searchString,
			    toolAction : this.dcAction
		    };
		    var items =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) ; //NO I18N
		    jQuery.ajax({
			    type: 'POST',// No I18N
			    url: "/DCToolsActions.do?operation=AssetAction_Post",// No I18N
			    data: {
				    data: items
			    },
			    dataType: 'json',// No I18N
			    success: function (data) {
				    var i;
				    computerList = data.computerList;
				    jQuery('#computerNameDiv a').remove();
				    for (i in computerList) {
					    if (computerList.hasOwnProperty(i)) {
					        const computerBtn = jQuery('<a href="/" class="admin-searchcolor" data-computername="'+e_attr(computerList[i].ComputerName)+'" data-computerid='+e_attr(computerList[i].resourceId)+' id="' +e_attr(computerList[i].resourceId) +'" >' +e_html(computerList[i].ComputerName) +'</a>');
					        computerBtn.on('click', function(event){
                              event.preventDefault();
                              DesktopCentralToolsAction.hidedropdownforcomputer(jQuery(this).data('computername'), jQuery(this).data('computerid')); //NO I18N
                            });
						    jQuery('#computerNameDiv').append(computerBtn);
					    }
				    }
				    jQuery('#computerNameDiv').removeClass('hide').addClass('show');
				    jQuery('#computerNameDiv').css("display", "block"); // No I18N
                    jQuery("#_DIALOG_LAYER").off("click.dcfillworksationname").on("click.fillworksationname","[data-name='fill-computerList']", function(e){ // No I18N
                        e.preventDefault();
                        DesktopCentralToolsAction.hidedropdownforcomputer(encodeHTML(computerList[i].ComputerName), encodeHTML(computerList[i].resourceId));
                    });
			    }
		    });
        }
	},
	fillUserList: function () {
		var computerName = jQuery('#computer').val();
		var resourceId = jQuery('#computer').text();
		var inThis = this;
		if (computerName == "") {
			computerName = jQuery("#onlyone").text();
			resourceId = jQuery("#onlyone").val();
		}
		if (computerName == "") {
			computerName = jQuery('#computerLists option:selected').text();
			resourceId = jQuery('#computerLists option:selected').val();
            if(resourceId == '0'){     
                return;
            }
		}
		if(this.dcAction == 'chat' || this.dcAction == 'chatuser'){
		    var data = {
                action: 'getChatUsers',// No I18N
                computerName: computerName,
                resourceId: resourceId
            };
		}else{
		    id = this.dcWsName;
            var data = {
                action: "getLoggedInComp", // No I18N
                computerName: computerName,
                userId: id
            };
		}

		var items =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) ; //NO I18N
		jQuery.ajax({
			type: 'POST',// No I18N
			url: "/DCToolsActions.do?operation=AssetAction_Post",// No I18N
			data: {
				data: items
			},
			dataType: 'json',// No I18N
            async: false,
			success: function (data) {
				var users = [];
				var i;
				inThis.chatURL = data.chat_uri;
				inThis.userFilled = 'added';//NO I18N
				if (data.sdp_status === 'computernotavailable') {
					var errorMessage=getMessageForKey('sdp.admin.dcconfig.computernotavailable',[encodeHTML(uemProductName)]);
				    errorMessage=errorMessage+'<a href="/" id="compnotavlink">'+getMessageForKey('sdp.admin.dcconfig.tools.knowmore')+'</a>';
					showFailureMessageAndClose(errorMessage,20000);
				} else if (data.sdp_status === 'computerisnotlive'){ //NO I18N
					showFailureMessageAndClose(getMessageForKey('sdp.admin.dcconfig.usercompnotavailable'),20000); //NO I18N
				}else if(data.sdp_status === 'No loginName'){ //NO I18N
                    showFailureMessageAndClose(getMessageForKey('sdp.admin.dcconfig.nologinerror', [encodeHTML($req.details.request_info.requester.name)]),20000); //NO I18N
                }else if(data.sdp_status === 'No users'){ //NO I18N
                    showFailureMessageAndClose(getMessageForKey('sdp.admin.dcconfig.nousers'),20000); //NO I18N 
                }
                else if(data.sdp_status === 'User not available'){ //NO I18N
                    showFailureMessageAndClose(getMessageForKey('sdp.admin.dcconfig.usernotloggedin', [encodeHTML($req.details.request_info.requester.name)]),20000); //NO I18N sdp.admin.dcconfig.usernotavail
                }else if(data.sdp_status === 'User not in product'){ //NO I18N
                    showFailureMessageAndClose(getMessageForKey('sdp.admin.dcconfig.usernotavail', [encodeHTML($req.details.request_info.requester.name)]),20000); //NO I18N
                }else if (data.sdp_status === 'agentnotinstalled'){ //NO I18N
				    var errorMessage=getMessageForKey('sdp.admin.dcconfig.computernotavailable',[encodeHTML(uemProductName)]);
				    errorMessage=errorMessage+'<a href="/" id="compnotavlink2">'+getMessageForKey('sdp.admin.dcconfig.tools.knowmore')+'</a>';
					showFailureMessageAndClose(errorMessage,20000);
				}else if (data.sdp_status === "build below 100596" ) { //NO I18N
				    var reqName = data.requesterName;
				    var resId = id;
                    DesktopCentralToolsAction.save(reqName, resId, false);
                }else if (data.sdp_status === 'success') {// No I18N
					computerList = data.computerList;
					if(inThis.dcAction == 'userchat'){
					    jQuery('#userListLabel').text(getMessageForKey('sdp.admin.dcconfig.workstation'));
					}else{
					    jQuery('#userListLabel').text(getMessageForKey('sdp.admin.dcconfig.username'));
					}
					jQuery('#userLists').find('option').not('[value=-1]').remove(); //NO I18N
					users.push(jQuery("<option>",{text:this.dcAction == 'userchat' ? getMessageForKey('sdp.admin.dcconfig.choosecomputer') : getMessageForKey('sdp.admin.dcconfig.chooseuser')}));
					for (i in computerList) {
						if (computerList.hasOwnProperty(i)) {
							var name = computerList[i].username;
							var userResId = computerList[i].userresourceId;
							users.push(jQuery("<option>", {
									text: encodeHTML(name),
									value: encodeHTML(userResId)
							}));
						}
					}
					jQuery('#userLists').append(users);
					jQuery('#userLists').removeClass('hide').addClass('show');
					jQuery('#userValue').removeClass('hide').addClass('show');
				} else if(data.sdp_status==='onlyoneuser'){//NO I18N
				    computerList = data.computerList;
				    for (i in computerList) {
						if (computerList.hasOwnProperty(i)) {
							var name = computerList[i].username;
							var userResId = computerList[i].userresourceId;
							jQuery('#userLists').append(jQuery("<option selected></option>").val(encodeHTML(userResId)).text(encodeHTML(name)));
						}
						break;
					}
					//DesktopCentralToolsAction.save();
				}else {
                     var errorDesc = data.errorDesc;
                     var errorCode = data.error_code;
                     if (errorCode == "1010") {
                         showFailureMessageAndClose(getMessageForKey("sdp.admin.dcconfig.toolsnotauth", [getMessageForKey("sdp.admin.dcconfig.Chat")]),20000); // No I18N
                     } else {
                         showFailureMessageAndClose(encodeHTML(errorDesc), 20000);
                     }
                 }
			}
		});
        DesktopCentralToolsAction.eventbindings();
	},
	getUrlParameter: function (sParam) {
		var sPageURL = window.location.search.substring(1),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;
		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	},
	save: function (param1, param2, decider) {
	    jQuery('#ToolsButton').prop('disabled', true); //NO I18N
        jQuery('#loadingMsg').show(); //NO I18N
		var requestId = DesktopCentralToolsAction.getUrlParameter("woID"); //NO I18N
		var actionName = this.dcAction;
		var displayAction;
		var computerName = jQuery('#computer').val();
		var resourceId = jQuery('#computer').text();
		if (computerName != "" && actionName == 'chat' && this.userFilled == ''){
            DesktopCentralToolsAction.fillUserList();
        }if (!decider) {
            var requesterName = param1;
             var requesterId = param2;
        }if (computerName == "") {
			computerName = jQuery("#onlyone").text();
			resourceId = jQuery("#onlyone").val();
		}if (computerName == "") {
			computerName = jQuery('#computerLists option:selected').text();
			resourceId = jQuery('#computerLists option:selected').val();
		}if (computerName == undefined) {
            computerName = this.dcWsName;
        }
        if ((computerName == getMessageForKey('sdp.admin.dcconfig.choosecomputer')|| computerName == "" || resourceId == '-1' ) && (actionName != 'chatuser')) {//NO I18N
		    jQuery('#loadingMsg').hide(); //NO I18N
			jQuery('#errorMsgFailed').removeClass('hide').addClass('show');
			jQuery('#errorMsg').text(getMessageForKey("sdp.admin.dcconfig.wsnotavail"));//No I18N
			jQuery('#ToolsButton').prop('disabled', false); //NO I18N
		    return;
		}
		jQuery('#errorMsgFailed').removeClass('show').addClass('hide');
        if( actionName == 'system manager'){
            displayAction = getMessageForKey("sdp.admin.dcconfig.sysmanager");
        }else{
            displayAction = jQuery('#nameAction').val();
        }
        jQuery('#ToolsButton').prop('disabled', true); //NO I18N
        if (actionName == 'chat' || actionName == 'chatuser') {
            jQuery('#ToolsButton').prop('disabled', false); //NO I18N
            var userName = jQuery('#userLists option:selected').text();
            var userResourceId = jQuery('#userLists option:selected').val();
            if((requesterName && requesterName != '') || (requesterId && requesterId != '')){
                userName = requesterName;
                userResourceId = requesterId;
            }
            if ((userResourceId == '-1' || userName == getMessageForKey('sdp.admin.dcconfig.chooseuser') || userName == getMessageForKey('sdp.admin.dcconfig.choosecomputer')) ) {
                jQuery("#errorMsgFailed").removeClass("hide").addClass("show");
                if(actionName == "chatuser"){
                    jQuery("#errorMsg").text(getMessageForKey("sdp.admin.dcconfig.wsnotavail"));
                }else{
                    jQuery("#errorMsg").text(getMessageForKey("sdp.admin.dcconfig.userselect"));
                }
            } else {
                if (this.chatURL != undefined && this.chatURL != '') {
                    url = (actionName == "chat" || actionName == "chatuser") ? this.chatURL + encodeURIComponent(userName): this.chatURL.replace("resource_id",encodeURIComponent(userResourceId)); //NO I18N
                    if (requestId && requestId != 'null') {
                        url = url +"&requestID=" +encodeURIComponent(requestId); //No i18n
                    }
                } else if( userResourceId != null && userResourceId != undefined){
                    if (requestId && requestId != 'null') {
                        url = "/DCHomePage.do?operation=dcchat&requesterName=" + encodeURIComponent(userName) +"&requesterID=" +userResourceId +"&requestID=" +encodeURIComponent(requestId); //No i18n
                    } else {
                        url = "/DCHomePage.do?operation=dcchat&requesterName=" + encodeURIComponent(userName) + "&requesterID=" + userResourceId; //No i18n
                    }
                }else {
                     showFailureMessageAndClose(getMessageForKey('sdp.admin.dcconfig.usernotavailable',[encodeHTML(uemProductName)]),20000); //NO I18N
                }
                if(actionName == 'chatuser'){
                    computerName = userName;
                }
                var newwindow = window.open( url, encodeHTML("DesktopcentralChat"), "height=550,width=425", 'noopener,noreferrer');
                if (window.focus) { newwindow.focus(); }
                var succMsg =  getMessageForKey('sdp.admin.dcconfig.toolsactionsuccMsg',[encodeHTML(displayAction), encodeHTML(computerName), encodeHTML(uemProductName)]);
                showSuccessMessageAndClose(null,succMsg,5000);
                if (requestId && requestId != 'null') {
                    var data = {
                        action: 'Chat', //NO I18N
                        computerName: computerName,
                        requestId: requestId
                    };
                    var items =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) ; //NO I18N
                    jQuery.ajax({
                        type: 'POST', //NO I18N
                        url: "/DCToolsActions.do?operation=AssetAction_Post",// No I18N
                        data: {
                            data: items
                        },
                        dataType: 'json', //NO I18N
                    success: function (result) {}});
                }
            }
        }
        else{
            var data = {
                action: actionName,
                computerName: computerName ,
                requestId: requestId
            };
            var items =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) ; //NO I18N
            jQuery.ajax({
                type: 'POST', //NO I18N
                url: "/DCToolsActions.do?operation=AssetAction_Post",// No I18N
                data: {
                    data: items
                },
                dataType: 'json', //NO I18N
                success: function (result) {
                    jQuery('#loadingMsg').hide();
                    jQuery('#ToolsButton').prop('disabled', false); //NO I18N
                    jQuery("#loadingdivid").removeClass("show").addClass("hide");//NO I18N
                    var url = result.sdp_status;
                    var windowOptions = "width=" + (screen.availWidth - 50) + "px,height=" + (screen.availHeight - 60)+ "px, titlebar=yes, channelmode=yes, scrollbars=yes, resizable=yes, status=yes, menubar=channelmode"; //No I18N
                    var succMsg =  getMessageForKey('sdp.admin.dcconfig.toolsactionsuccMsg',[encodeHTML(displayAction), encodeHTML(computerName), encodeHTML(uemProductName)]);
                    if (url != undefined && url.includes("http")) {
                        var viewerPopUp =window.open(url, encodeHTML('ToolsAction'), windowOptions, 'noopener,noreferrer');
                        if(viewerPopUp){
                            showSuccessMessageAndClose(null,encodeHTML(succMsg),5000);
                        }else{
                            alert(getMessageForKey('sdp.admin.dcconfig.popupblockMsg'));
                            showSuccessMessageAndClose(null,encodeHTML(succMsg),5000);
                        }
                    } else if (result.sdp_status === 'computernotavailable') {// No I18N
                        var errorMessage=getMessageForKey('sdp.admin.dcconfig.computernotavailable',[encodeHTML(uemProductName)]);
                            errorMessage=errorMessage+'<a href="/" id="compunavlink">'+getMessageForKey('sdp.admin.dcconfig.tools.knowmore')+'</a>';
                        showFailureMessageAndClose(errorMessage,20000);
                    } else if (result.sdp_status === 'computerisnotlive'){ //NO I18N
                        showFailureMessageAndClose(getMessageForKey('sdp.admin.dcconfig.compnotavailtool'),20000); //NO I18N
                    } else if (data.sdp_status === 'adminusernot available') {// No I18N
                        showFailureMessageAndClose(getMessageForKey('sdp.admin.dcconfig.adminusernotavailable'),20000); //NO I18N
                    } else if (data.sdp_status === 'usernot available') {// No I18N
                        showFailureMessageAndClose(getMessageForKey('sdp.admin.dcconfig.usernotavailable',[encodeHTML(uemProductName)]),20000); //NO I18N
                    } else if (result.sdp_status === 'agentnotinstalled') {// No I18N
                        var errorMessage=getMessageForKey('sdp.admin.dcconfig.computernotavailable',[encodeHTML(uemProductName)]);
                        errorMessage=errorMessage+'<a href="/" id="compunavlink2">'+getMessageForKey('sdp.admin.dcconfig.tools.knowmore')+'</a>';
                        showFailureMessageAndClose(errorMessage,20000);
                    } else if (result.sdp_status === 'success') {// No I18N
                        showSuccessMessageAndClose(null,succMsg,5000);
                    } else if (result.sdp_status === 'failed') {// No I18N
                        var errorDesc = result.errorDesc;
                        var errorCode = result.error_code;
                        if (errorCode == "1010") {
                            showFailureMessageAndClose(getMessageForKey("sdp.admin.dcconfig.toolsnotauth", [encodeHTML(displayAction)]),20000); // No I18N
                        } else {
                            showFailureMessageAndClose(encodeHTML(errorDesc), 20000);
                        }
                    }
                }
            });
            DesktopCentralToolsAction.eventbindings();
        }

		return;
	}
};

jQuery(document).ready(function () {
	DesktopCentralToolsAction.init();
    jQuery("#computerLists").change(function() {
        DesktopCentralToolsAction.fillUserList();
    });
    jQuery(document).on('click', '#upgradelink, #upgradelink2', function(event) {
        return appendDID('//www.manageengine.com/products/desktop-central/service-packs.html?sdpi', true); //NO I18N
    });
    jQuery(document).on('click', '#userretrylink, #userretrylink2', function(event) {
        return appendDID('/SetUpWizard.do?forwardTo=technician', true); //NO I18N
    });
    jQuery(document).on('click', '#compnotavlink, #compnotavlink2, #compunavlink, #compunavlink2', function(event) {
        return appendDID('//www.manageengine.com/products/desktop-central/help/configuring_desktop_central/managing_computers_lan.html#Installing_Agents_from_Desktop_Central_Console', true); //NO I18N
    });
});

