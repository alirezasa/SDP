//$Id$

var wo_page_chatId = null;

var isMaster = false;
var ws_timer;
var lastPing;
var is_broadcast_channel_support = false;
var skip_ping_clear_timer = false;
var areBellNotificationFilesLoaded = false;
var isBCMDialogOpened = false;
var isNotificationPanelOpened = false;
var isActiveClassAdded = false;
var activeClassID = -1;
var areNotificationTonesFilesLoaded = false;

if("BroadcastChannel" in window) {
	is_broadcast_channel_support = true;
}
var chat_notification_tone_type = ["new_chat_message","new_chat_request","new_transfer_chat"]; //No I18N

var is_tech = false;

var $notification = {
		data : {},
		setNotificationPanelOpenStatus : function(bool){
			isNotificationPanelOpened = bool;
		},
		setBroadCastDialogOpenedStatus : function(bool){
			isBCMDialogOpened = bool;
		},
		setActiveClass : function(bool){
			isActiveClassAdded = bool;
		},
		setPreviousActiveClassID : function(val){
			activeClassID = val;
		},getDynamicNotificationURL: function(data, param) {
            let notifyUrl = '/DynamicNotification.do?method=redirectModuleUrl&moduleId=' + data.module_id + '&notifyType=' + data.type + '&dynamicNotifId=' + data.id; //NO I18N

            if (data.type == 'req-approved' || data.type == 'req-rejected') { //NO I18N
                notifyUrl = '/DynamicNotification.do?method=redirectModuleUrl&moduleId=' + data.module_id + '&notifyType=req-assign&dynamicNotifId=' + data.id; //NO I18N
                return notifyUrl;
            }

            let newTab = '';
            if (data.type == 'req-count' || data.type == "req-approval" || data.type == 'tech-count' || data.type == 'user-delete' || data.type == 'failed-user-count' || data.type == 'user-count' || data.type == 'domain-error' || data.type == 'pwd-policy-mismatch' || data.type == 'user-count-with-failure' || data.type == 'azure-user-count' || data.type == 'azure-user-delete' || data.type == 'azure-req-count' || data.type == 'azure-tech-count' || data.type == 'azure-failed-user-count' || data.type == 'azure-user-count-failure' || data.type == 'azure-domain-error' || data.type == 'user-merge' || data.type == 'site-association' || data.type == 'cmdb-post-migration-started' || data.type == 'cmdb-post-migration-failed') { //NO I18N
                if (data.type == 'req-count' || data.type == 'tech-count' || data.type == 'azure-req-count' || data.type == 'azure-tech-count')
                {
                    notifyUrl = '/DynamicNotification.do?method=redirectModuleUrl&moduleId=' + data.domain_id + '&notifyType=' + data.type + '&dynamicNotifId=' + data.id; //NO I18N
                }
                //SD-77858,77853
                if ((data.type == "tech-count" || data.type == "azure-tech-count") && data.helpdesk.id != null) { //NO I18N
                    notifyUrl = notifyUrl + '&helpdeskid=' + data.helpdesk.id; //NO I18N
                }
                if (isMDHSetup == 'true' && (data.type == 'req-count' || data.type == 'azure-req-count')) { //NO I18N
                    newTab = "javascript:window.open('" + notifyUrl + "','_self') ;" ; rel="noopener"; //NO I18N
                }
                if (data.type == "req-approval") { //NO I18N
                    let width = (jQuery(window).width() / 15) * 14;
                    let height = jQuery(window).height();
                    newTab = "javascript:NewWindow('" + notifyUrl + "','SystemLogViewer'," + width + "," + height + ",'yes','center','350','100');"; rel="noopener"; //NO I18N
                } else {
                    newTab = "javascript:NewWindow('" + notifyUrl + "','SystemLogViewer',800,500,'yes','center','350','100') ; $bellNotifications.removeHighlight(" + data.id + ");"; rel="noopener" ; //NO I18N
                }
                if (typeof Ember == "undefined") { //NO I18N
                    notifyUrl = "javascript:void(0);"; //NO I18N
                } else {
                    notifyUrl = "javascript:NewWindow('" + notifyUrl + "','SystemLogViewer',800,500,'yes','center','350','100') ; $bellNotifications.removeHighlight(" + data.id + ");"; rel="noopener"; //NO I18N
                }
            }

            if (data.type == 'account-locked') {
                notifyUrl = "javascript:showAccountLockedDetails(" + data.is_account_locked + "," + data.is_read + "," + data.module_id + "," + data.id +"); $bellNotifications.removeHighlight(" + data.id + ")"; //NO I18N
            } else if (data.type == 'throttle-exceed') {
                notifyUrl = "javascript:$bellNotifications.handleOpenDialogNotifications(" + data.id + ",'rateLimit'); $bellNotifications.handleThrottleNotification(" + data.module_id + "," + data.is_read + "," + data.id + "," + data.helpdesk.id + ",false); $bellNotifications.removeHighlight(" + data.id + ") ; $bellNotifications.updateLocalHbsRenderedData(" + data.id + ")"; //NO I18N
            } else if (data.type == 'broadcast_message') {
                notifyUrl = "javascript:$bellNotifications.handleOpenDialogNotifications(" + data.id + ",'broadcast'); javascript:$broadcast_mesg.showBroadcastMessage(" + data.module_id +"); ; $bellNotifications.updateLocalHbsRenderedData(" + data.id + ") ; $bellNotifications.removeHighlight(" + data.id + ");"; //NO I18N
            } else if (data.type == 'Announcement_ADD' || data.type == "Announcement_UPDATE" || data.type == "dc-announcement-failure") {
                if (typeof Ember !== "undefined") {
                    notifyUrl = "javascript:$bellNotifications.handleOpenDialogNotifications(" + data.id + ",'announcement'); javascript:closeAnnouncement(" + data.module_id + ",'announcement'); window.open('/ui/home?view_type=my_view&announcementId=" + data.module_id + "&portal_id=" + data.helpdesk.id + "&dynamicNotifId=" + data.id + "','_self', 'noopener'); $bellNotifications.removeButtons(); $bellNotifications.updateLocalHbsRenderedData(" + data.id + ") ; $bellNotifications.removeHighlight(" + data.id + ")"; //NO I18N
                } else {
					if(data.helpdesk.id != sdp_app.PORTAL_ID){
						notifyUrl = "javascript:$bellNotifications.handleOpenDialogNotifications(" + data.id + ",'announcement'); window.open('/HomePage.do?view_type=my_view&announcementId=" + data.module_id + "&PORTALID=" + data.helpdesk.id + "&dynamicNotifId=" + data.id + "','_blank', 'noopener,noreferrer'); $bellNotifications.removeHighlight(" + data.id + "); $bellNotifications.removeButtons(); $bellNotifications.updateLocalHbsRenderedData(" + data.id + ")"; //NO I18N
					}else{
						notifyUrl = "javascript:$bellNotifications.handleOpenDialogNotifications(" + data.id + ",'announcement'); javascript:$announcements.viewAnnouncement(" + data.module_id + ",'dynamicNotifications'," + data.id + "," + data.helpdesk.id + "); $bellNotifications.removeHighlight(" + data.id + "); $bellNotifications.removeButtons(); $bellNotifications.updateLocalHbsRenderedData(" + data.id + ")"; //NO I18N
					}
                }
            }

            if (data.helpdesk.is_owner !== undefined && (!data.helpdesk.is_owner && data.helpdesk.status !== 'Production')) { //NO I18N
                notifyUrl = "javascript:showRestrictedNotificationAlert(); $bellNotifications.removeHighlight(" + data.id + ")"; //NO I18N

                if(data.helpdesk.status == "License expired"){ //NO I18N
                    notifyUrl = data.helpdesk.status;
                }
            }
            if (param == "href") {
                return notifyUrl == "javascript:void(0);" || notifyUrl.length == 0 ? newTab : notifyUrl; //NO I18N
            } else {
                let redirectLink = '';
                newTab = (newTab == "javascript:void(0);" || newTab.length == 0 ? notifyUrl : newTab); //NO I18N

                if('prob-note-mention' == data.type){
                    redirectLink = '/ui/problems?mode=detail&entity_id='+ data.module_id; //NO I18N
                }else if('task-assign' == data.type || 'task-comment-mention' == data.type || 'task-comment-reply' == data.type){ //NO I18N
                    redirectLink = '/ui/tasks?mode=detail&from=showAllTasks&taskId='+data.module_id; //NO I18N
                }else if('release-notes-mention' == data.type){ //NO I18N
                    redirectLink = '/ui/releases?entity_id='+data.module_id+'&mode=detail#submission/notes'; //NO I18N
                }

                if (newTab.indexOf("NewWindow") == -1 && newTab.indexOf("DynamicNotification.do") != -1) { //NO I18N
                    const isCntUpdateRequired = (data.type === 'project-comment-mention' || data.type === 'project-comment-reply' || data.type === 'change-notes-mention'); //NO I18N
                    const redirectUrl = (redirectLink.length === 0) ? newTab : redirectLink;

                    newTab = `$bellNotifications.methodStop(event); window.open('${redirectUrl}', '_blank', 'noopener'); $bellNotifications.removeHighlight(${data.id});`; //NO I18N

                    // Add 'mark as read' if the notification type is not a specific mention or reply type
                    if (!isCntUpdateRequired) {
                        newTab += ` $bellNotifications.markNotificationAsRead(${data.is_read}, ${data.id});`;
                    }
                    return newTab;
                }
                return newTab;
            }
        }
}

var notifications = {
	modules : {},
	subscribe : function(mod, processHandler) {
		this.modules[mod] = processHandler;
	},
	stopNewChatMessage : function(chatid){
		var data = {'module':'chat','type':'stop_chat_mesg','id':chatid}; //No I18N
		if (is_broadcast_channel_support) {
			chat_box.stopChatMessage(chatid);
			channel.postMessage( (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) ); //NO I18N
		}

	},
	convertToGroupChat : function(chatId,techId){
		var data = {'module':'chat','type':'convert_to_group_chat','id':chatId,'techId':techId}; //No I18N
		if (is_broadcast_channel_support) {
			channel.postMessage(JSON.stringify(data));
		}

	},
	closeBCMDialog : function(){
		var data = {'module':'GeneralNotifications','type':'close_broad_cast_mesg'}; //No I18N
        isBCMDialogOpened = jQuery("#bcm-notificationbox").hasClass("anim-scalehide"); //NO I18N
        if(isNotificationPanelOpened && !isBCMDialogOpened){
	    $notifContainer.find('[data-id=' + activeClassID + ']').removeClass("active"); //NO I18N
        $notif.find("[data-action='close']").addClass("disp-ib").removeClass("vhide"); //NO I18N
	    $notification.setPreviousActiveClassID(-1);
        $notification.setBroadCastDialogOpenedStatus(false);
        }
		processGeneralNotification(data,isMaster);
		if (is_broadcast_channel_support) {
			channel.postMessage( (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) ); //NO I18N
		}
	},
	updateNotifCount : function(count){
		var data = {'module':'DynamicNotifications','from':'dynNotif','type':'notifCount','message':count}; //No I18N
		processDynamicNotification(data);
		if (is_broadcast_channel_support) {
			channel.postMessage( (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) ); //NO I18N
		}
	},
	processNotifMessage : function(data,isMaster) {
		/* message handler for messages received from the websocket */
		if(this.modules[data.module]) { //No I18N
			this.modules[data.module](data,isMaster);
		}
	}

};

var pagenotif = {
//    chatTechList : [],
	modules : {},
	req_viewing_tech_ids : [],
	isActive : false,
	userid : 0,
	initialize : function(userid, module, id, messageProcessor) {
		this.userid = userid;
		this.modules = { "module" : module, "id" : id, "processor" : messageProcessor }; //No I18N
		this.isActive = true;
	},

	updateViewPageCount : function(woId){
		pagenotif.deRegiserPageUser(woId);
	},

	register : function() {
		var woId = pagenotif.modules.id;
		if((!checkIfSCP() || sdp_app.IS_REQUEST_COLLABORATION_MODULE_ENABLED) && woId!=undefined){
			updateViewPageCount(woId,'add'); //No I18N
			sdpAjax({
				async: false,
				url: "/servlet/SDAjaxServlet",//NO I18N
				data: {"action": "register_page_user","moduleid":woId,"module":"request"},//NO I18N
				type: 'GET', //No I18N
				success: function(response) {
					pagenotif.processRegisterUser(response);
				}
			});
		}

	},

	deRegiserPageUser : function(woId){
		if(!checkIfSCP() || sdp_app.IS_REQUEST_COLLABORATION_MODULE_ENABLED) {
		var count = getValue("REQ_COUNT_"+woId); //No I18N
		if(parseInt(count) == 1){ // means only one tab is viewing the page so send call to server for deregister user
			removeItem("REQ_COUNT_"+woId); //No I18N
			var url = "/servlet/SDAjaxServlet?action=remove_page_user&moduleid="+woId+"&module=request";//NO I18N
			sdpAjax({
				url: url,
				type: 'POST', // No I18N 
				async: true
			});
		}
		else{
			updateViewPageCount(woId,'remove'); //No I18N
		}
	}
	},

	processRegisterUser : function(data){
		pagenotif.req_viewing_tech_ids=[];
		pagenotif.addNewPageUser(userID,translate('common.common.you'));
		jQuery.each(data.users, function(ind, val) {
			pagenotif.addNewPageUser(val.id,val.name);
			pagenotif.refreshUI();
		});
		pagenotif.startQuickChatFn(pagenotif.modules.id,data);
		if(data.hasOwnProperty("unread_count")){
			showDynamicNotifCount(data.unread_count.notifCount.toString());
			if(is_broadcast_channel_support) {
				//Sending message to other tabs
				var data = {'module':'DynamicNotifications','type':'notifCount','message':data.unread_count.toString()}; //No I18N
				if (typeof channel !== 'undefined' && channel) {
				channel.postMessage(JSON.stringify(data));
				}
			}
		}
	},


	processPageMessage : function(data) {
		if(this.modules.module == data.module) {
			switch(data.type) {
				case "newPageUser" : //No I18N
				pagenotif.addNewPageUser(data.from,data.message);
				this.refreshUI();
					if(sdp_app.IS_SDP_CHAT_ENABLED && sdp_app.IS_TECH_CHAT_ENABLED && sdp_app.IS_COLLABORATORS_CHAT_ENABLED && !window.externalframe){
						chat_actions.suggestNewCollaboratorToAdd(pagenotif.modules.id,data.from,data.message);
					}
				break;
				case "removePageUser" :  //No I18N
				pagenotif.removePageUser(data.from);
					if(!window.externalframe && sdp_app.IS_SDP_CHAT_ENABLED){
                    	chat_actions.removeAddUserSuggestion(data.id,data.from);
					}
				this.refreshUI();
				break;
				default :
				this.modules.processor(data); //No I18N
				break;
			}

		}

	},

	addNewPageUser : function(userid,username){
		var element = jQuery("#collaboration_details").find("#viewers_names").find('ul');
		if(element.find('[data-userid='+userid+']').length == 0){
			var anchorTag = '<span class="text-muted">'+e_html(username)+'</span>';
			if(sdp_user.ROLES.indexOf("ModifyRequests")!=-1){
				anchorTag = '<a href="/" data-name="newPageUser">'+e_html(username)+'</a>';
			}
			element.append('<li data-userid='+userid+'>'+anchorTag+'</li>'); //No I18N
			element.off("click.collabContainer").on("click.collabContainer","[data-name=newPageUser]", function(){//No I18N
				const userprofileId = jQuery(this).parent().attr("data-userid");
				NewWindow('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+encodeURIComponent(userprofileId),'showuserdetails','450','500','yes','center');
				return false;
			});
            //adding the user to collaborator manage chat
            if(sdp_user.LOGGEDIN_USERID != userid && pagenotif.req_viewing_tech_ids.indexOf(userid) == -1) {
                pagenotif.req_viewing_tech_ids.push(userid);
                var selectedItems = jQuery("#selective_tech_box #cust_box").select2('val'); //No I18N
                selectedItems.push(userid);
                jQuery("#selective_tech_box #cust_box").select2('val',selectedItems); //No I18N
            }
		}
	},

	removePageUser : function(userid){
		jQuery("#collaboration_details").find("#viewers_names").find('ul').find('[data-userid='+userid+']').remove();
		var selectedTechs = jQuery("#selective_tech_box #cust_box").select2('val'); //No I18N
		//removing the user to collaborator manage chat
		for(var i=0;i<selectedTechs.length;i++) {
        		    if(selectedTechs[i] == userid) {
        		        selectedTechs.splice(i,1);
        		        jQuery("#selective_tech_box #cust_box").select2('val',selectedTechs); //No I18N
        		        break;
        		    }
        		}
        var reqViewingTechsLen = pagenotif.req_viewing_tech_ids.length;
        for(var i=0;i<reqViewingTechsLen;i++) {
            if(pagenotif.req_viewing_tech_ids[i] == userid) {
                pagenotif.req_viewing_tech_ids.splice(i,1);
                break;
            }
        }
	},

	refreshUI : function(count) {
		var count = jQuery("#collaboration_details").find("#viewers_names").find('ul').find('li').length;
		jQuery("#collaboration_icon").find(".badge-count").html(count);
		jQuery("#collaboration_details").find("#viewers_count").html("( "+count+ " )");
		var needAlign = window.externalframe || ($req && $req.layout && !$req.layout.show_rpanel);

		if(count > 1 ){
			if(needAlign){
					var property = sdp_user.DIRECTION === "LTR" ? "right:80px":"left:80px"; // NO I18N
 					jQuery("#WOHeader .status-badge").attr("style","max-width: 250px; "+property+"!important"); // NO I18N
			}
			jQuery("#collaboration_icon").removeClass('hide').end();
			jQuery("body").find("#request_collaboration").removeClass('hide').end()
			.find("#collaboration_icon").removeClass('hide').end()
			.find("#viewers_names,#viewing_header").removeClass('hide').end()
			.find("#modification_details").find("#close_detail").addClass('hide');

		}
		else if(count == 1){
			if(needAlign){
					var property = sdp_user.DIRECTION === "LTR" ? "right:80px":"left:80px"; // NO I18N
					jQuery("#WOHeader .status-badge").attr("style","max-width: 250px; "+property+" !important"); // NO I18N
			}

			if(jQuery("#collaboration_notifications").find('li').length == 0){
				jQuery("#request_collaboration").addClass('hide');
				jQuery("#collaboration_details").attr('style','display:none');
				jQuery("#collaboration_icon").addClass('hide');
			}
			else{
				jQuery("#viewers_names,#viewing_header,#collaboration_icon").addClass('hide');
				jQuery("#modification_details").find("#close_detail").removeClass('hide');
			}

		}
	},

	/* Method for adding the start quick chat option to the collaborators */

	startQuickChatFn : function(woId, dataObj){
            var chatId = null;
            var isActiveChatUser = false;
            if(dataObj.chat && dataObj.chat.id){
                chatId = dataObj.chat.id;
                var chatUsers = dataObj.chat.users;
                if(chatUsers.indexOf(userID) >= 0){
                    isActiveChatUser = true;
				}
            }
            pagenotif.appendCollaboratorsChatFn(woId,chatId,isActiveChatUser);
	},

	/* Method for showing start quick chat or join chat based on the user associated to existing collaborators chat or not*/


	appendCollaboratorsChatFn : function(woId,chatId,isActvieChatUser){
        var count = jQuery("#collaboration_details").find("#viewers_names").find('ul').find('li').length;
        if(count > 0 && sdp_app.IS_SDP_CHAT_ENABLED && sdp_app.IS_TECH_CHAT_ENABLED && sdp_app.IS_COLLABORATORS_CHAT_ENABLED){
            // appending quick start after viewers
            var $target = jQuery("#collaboration_details").find("#viewers_names");
			var target_len = $target.find('#start_quick_chat').length;
			if(target_len == 0 && !window.externalframe) {
					var content = "";
					if(chatId!==null && !isActvieChatUser){
                    		var onclickFn = function() {
            					chat_actions.joinChat(chatId, woId);
        					};
                    		content = "<div class='chat-link text-dark'><span class='cspr flat icon-sm wechat opac5 mr5'></span>"+translate("chat.one.active.chat")+"<a href='/' class='fr' data-name='joinChatLink' >"+translate('chat.join')+"</a></div>"
					}
                	else if(chatId!==null && isActvieChatUser){
                    		var onclickFn = function() {
            					chtload.openRecentChat(chatId);
        					};
                    		content = "<div class='chat-link text-dark'><span class='cspr flat icon-sm wechat opac5 mr5'></span>"+translate("chat.one.active.chat")+"<a href='/' class='fr' data-name='openRecentChatLink'>"+translate('sdp.common.view')+"</a></div>"
                	}
					else{
                     		var onStartChat = function() {
            					chat_actions.startCollaboratorschat("request", woId);// NO I18N
        					};
        					var onManageBtn = function() {
            					chat_actions.selectTechs("request", woId);// NO I18N
        					};

                            content = "<div><button class='btn btn-primary btn-sm' type='button' data-name='startChatBtn'>"+translate("common.chat.start")+"</button>"; //NO I18N
                            content+="<button class='btn-link ml5' data-name='manageBtn'>"+translate("common.manage")+"</button></div>";
					}
                var $content = jQuery("<div class='divider p0 m0'></div><div id='start_quick_chat' class='p10 mb5'>"+content);
                $content.insertAfter($target.find('ul'));
                 // Bind click events after inserting content
			    if (chatId !== null && !isActvieChatUser) {
			        $content.find('[data-name=joinChatLink]').off('click.collabContainer').on('click.collabContainer', onclickFn);//No I18N
			    } else if (chatId !== null && isActvieChatUser) {
			        $content.find('[data-name=openRecentChatLink]').off('click.collabContainer').on('click.collabContainer', onclickFn);//No I18N
			    } else {
			        $content.find('[data-name=startChatBtn]').off('click.collabContainer').on('click.collabContainer', onStartChat);//No I18N
			        $content.find('[data-name=manageBtn]').off('click.collabContainer').on('click.collabContainer', onManageBtn);//No I18N
			    }
            }
            }
	}
}

var ws;

// Process the websocket response when page loads in iframe
function processOutputMessageFromIframe(message){
	try{
	var parseMesg = JSON.parse(message);
	var module =  JSON.parse(message).module;
	if(pagenotif.modules.id!==undefined && module === 'request' && pagenotif.modules.id == parseMesg.id){
		pagenotif.processPageMessage(parseMesg);
	}
	}
	catch(e){

	}
}

function processOutputMessage(message)
{
	var parseMesg = JSON.parse(message);
	var module =  JSON.parse(message).module;
	if(pagenotif.modules.id!==undefined && module === 'request' && pagenotif.modules.id == parseMesg.id){
		pagenotif.processPageMessage(parseMesg);
	}
	else{
		notifications.processNotifMessage(parseMesg);
	}
	if (jQuery("#wo-details-frame").length > 0) {
		document.getElementById("wo-details-frame").contentWindow.postMessage(message, window.origin); //No I18N
	}
}

function startWebSocketConnection()
{
	
	if(ws == undefined)
	{
		//console.log("inside startWebSocketConnection......");
		ws = new WebSocket(getWebSocketURL());
		ws.onopen = function(){
			//Perform actions on opening the websocket connection
		};
		ws.onmessage = function(message){
			var parseMesg = JSON.parse(message.data);
			var type = parseMesg.type;
			processOutputMessage(message.data);
			if(type !== 'close_websocket'){				
				if (is_broadcast_channel_support) {
					// posting the websocket response to child tabs using BroadcastChannel API
					channel.postMessage(message.data);
				}
			}
		};

		ws.onerror = function(message){
			skip_ping_clear_timer = false;
			ws.close();    //Terminates the websocket connection

		};

		ws.onclose = function(message){			
            //Perform actions on closing the websocket connection
			// Clearing the update ping in case of websocket close(this happens when user logout from the application / closing the tab / reloading the page
			// and changing isMaster=false
            isMaster = false;
			ws = null;
			if(!skip_ping_clear_timer){
            	clearTimeout(ws_timer);
			}

		};

		window.addEventListener("beforeunload", function (e) {
			if(ws != undefined){
				ws.close();
			}
			if(isMaster){
				setValue("ping", "0"); //No I18N
			}

		});
	}
}
function isWebSocketEnabled()
{
	    if(sdp_app.IS_AE && (sdp_app.NOTIFY_LAST_LOGIN_TIME != undefined || sdp_app.IS_TECH_SPACE_ENABLED))
	    {
	        return true;
	    }
	    if(PORTALID>0 && sdp_app.IS_SDP && (sdp_app.IS_TECH_SPACE_ENABLED || sdp_app.IS_PAGE_NOTIFICATIONS_ENABLED || sdp_app.IS_CHAT_ENABLED ||sdp_app.zia_info.IS_NOTIFICATION_AVAILABLE || sdp_app.NOTIFY_LAST_LOGIN_TIME != undefined))
	    {
	        return true;
	    }
	    return false;
}
function registerNotifications(){
	function onloadRegister(){
	    if(sdp_user.USERTYPE === 'Technician'){
		    is_tech = true;
	    }
    if(isWebSocketEnabled()){

			jQuery(document).ready(function() {
				jQuery(window).on('beforeunload',function(){ //No I18N
					if(isMaster){
						setValue("ping", "0"); //No I18N
					}
					if (is_broadcast_channel_support) {
						channel.close();
					}
					var woId = pagenotif.modules.id;
					if(woId!=undefined){
						pagenotif.deRegiserPageUser(woId);
					}
				});
				var ping = getValue("ping"); //No I18N
				//Pings every 6 seconds
				var newDate = new Date().getTime();
				if(ping === null || (Math.abs(Number(ping) ==0)) || (Math.abs(Number(ping) - newDate) > 6000)) {
					setValue("ping",newDate); //No I18N
					isMaster = true;
				}
				else {
					isMaster = false;
				}
				updatePing();
				if (is_broadcast_channel_support) {
					channel = new BroadcastChannel('get-notif-features'); //No I18N
					channel.onmessage = function(message) {
						processOutputMessage(message.data);
					};
				}
				if(isMaster){
					startWebSocketConnection();
				}
			});

			function subscribeAndPoll(){
				if(sdp_user.USERTYPE === 'Technician'){
					notifications.subscribe('EventNotification', processEventNotification); //No I18N
					//pagenotif.register();
					if(sdp_app.IS_TELEPHONY_ENABLED){
						notifications.subscribe('TelephonyNotifications', processTelephonyNotification); //No I18N
					}
				}
				notifications.subscribe('DynamicNotifications', processDynamicNotification); //No I18N
				// When external chat is disabled and chat is transferred_to_tech from inside SDP, chat is opened in external site too
        		if (sdp_app.IS_SDP_CHAT_ENABLED && (!is_external_chat || (is_external_chat && sdp_app.IS_SDP_EXT_CHAT_ENABLED))) {
                    notifications.subscribe('chat', processChatNotification); //No I18N
                }
				notifications.subscribe('GeneralNotifications', processGeneralNotification); //No I18N
				notifications.subscribe('UserPersonalization', processUserPersonalization); //No I18N
                        }

			subscribeAndPoll();

		}
	}
	function addLoadEvent(func) {
		var oldonload = window.onload;
		if (typeof window.onload != 'function') {
			window.onload = func;
		} else {
			window.onload = function() {
				if (oldonload) {
					oldonload();
				}
				func();
			}
		}
	}
	if(typeof Ember == "undefined"){
		/*
		Adding below code to execute on onload event since we are using same for description (HTML) field otherwise description is not loaded while data is fetched from communication framework.
		*/
		jQuery(document).ready(function(){addLoadEvent(onloadRegister)});
	}
	else{
		jQuery(document).ready(onloadRegister);
	}
}


function handleWOPageMessages(message) {
	if((userID+"") !== message.from && pagenotif.modules.id == message.id) {
		var anchorTag = '<span class="text-muted">'+e_html(message.message)+'</span>';
		if(sdp_user.ROLES.indexOf("ModifyRequests")!=-1){
			anchorTag = '<a href="/" data-name="userProfileLnk">'+e_html(message.message)+'</a>';
		}
		var argsArray = new Array();
		argsArray[0] = anchorTag;
		var mess = translate("request."+message.type,argsArray);
		mess = mess + "<p class='text-muted'>"+message.time_str+"</p>";
		var element  = jQuery("#collaboration_details").find("#collaboration_notifications").find('ul');
		var countElement = jQuery("#collaboration_icon").find("#collaboration_count");
		if(element.find('[data-timestamp='+message.time+']').length == 0){
			var liElement = element.find('li');
			if(liElement.length >0){
				liElement.next("br").remove();  //No I18N
				element.append('<li data-timestamp='+message.time+'>'+mess+'</li> <br>'); //No I18N
			}
			else{
				element.append('<li data-timestamp='+message.time+'>'+mess+'</li>'); //No I18N
			}
			element.find("[data-name=userProfileLnk]").on("click.collabNotification",function(){
				NewWindow('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+encodeURIComponent(message.from),'showuserdetails','450','500','yes','center');
				return false;
			});
			jQuery("#collaboration_header_notifications").css('display','block').removeClass('rt-sideview').find("#header_notiff").find('ul').append('<li>'+mess+'</li>'); //No I18N
			jQuery("#request_collaboration,#modification_details,#collaboration_notifications").removeClass('hide');
		}
		if(parseInt(countElement.html()) == 1){
			countElement.addClass('hide');
			jQuery("#viewing_header,#viewers_names").addClass('hide');
		}

	}
}

function processDynamicNotification(message) {
	var type = message.type;
	var mess = JSON.parse(message.message);
    var inappSupported = {"Request" :["req-rejected","req-approval","req-assign","notes-add","req-approved"]}; //No I18N
	if(type === 'desktop_notif'){

	     isAppActiveTab(message.time);
	     setTimeout(function(){
	      var isActive = window.localStorage.getItem('isActive'); //No I18N
	    if("visible" == document.visibilityState && inappSupported[mess.module]  &&  inappSupported[mess.module].indexOf(mess.type)!=-1 )
	    {
            if((mess.type == "notes-add" || mess.type == "req-assign" ) && window.woID==mess.module_id )
            {
                return ;
            }
            var sub = mess.sub;
            var dueby = mess.dueby == '-1' ? '-' : mess.dueby;
            var priority = mess.priority == undefined ? '-' : mess.priority.name;
            var priorityColor = (mess.priority == undefined) ? 'transparent' : mess.priority.color; //No I18N
            var woId = mess.module_id;
            var requester = mess.req;
            var title = mess.title;
            var desc = "";
            if(mess.module!="Request" || mess.type!="notes-add")
            {
            desc = mess.desc;
            }
            notifTime = message.time;
            woNotifId =  mess.actionId+mess.module_id+message.time%100;
            url = $notification.getDynamicNotificationURL(mess,"href"); //No I18N
            requesterI18N = translate('common.requester');
            dueByI18N = translate('sdp.admin.settings.duebyonly');
            priorityI18N = translate('common.priority');
                    var reqNotifData={
                        id:woNotifId,
                        title:title,
                        priority:priority,
                        priorityColor:priorityColor,
                        subject:sub,
                        requester:requester,
                        url:url,
                        dueBy:dueby,
                        desc:decodeHTML(desc),
                        requesterI18N:requesterI18N,
                        dueByI18N:dueByI18N,
                        priorityI18N:priorityI18N,
                        helpdeskName:mess.helpdesk.name
                    };
                    if(isMSPOrSCP){
                        reqNotifData.ismsporscp = true;
                        reqNotifData.account = mess.account == undefined ? '-' : mess.account.name;
                        reqNotifData.accountI18N = translate("sdp.admin.leftpanel.users.customer");
                    }
                    $inAppNotif.init(reqNotifData);
                     setTimeout(function(){
                        initTooltip("#inAppReqNotifWrapper"); //No I18N
                        if(!sdp_app.IS_MDH_SETUP){
                        jQuery("#inAppReqNotifWrapper").find(".font-small").hide();
                        }

                    },100);
	    }
                else if(isMaster && isActive === 'false' )
	    {
            message.message = jQuery.parseJSON(message.message);
            notifyMe(message.message);
	    }
                },500);
	}
	else{
	const notifJSON = JSON.parse(message.message);
	const is_dont_disturb_enabled = notifJSON.is_dont_disturb_enabled;
    const cnt = parseInt(notifJSON.COUNT);
    const skipNotif = notifJSON.skipNotif;
    const notifCountText = jQuery('#notifCount').text();
    const old_cnt = isNaN(parseInt(notifCountText)) ? 0 : parseInt(notifCountText);
    if((old_cnt<cnt || jQuery('#notifCount').css('display') == "none") && (!skipNotif || typeof skipNotif == 'undefined') && is_dont_disturb_enabled == 'false'){
        playSound("DynamicNotifications","notifCount"); // No I18N
    }
    jQuery('#notifCount').show()
	if(cnt != 0)
	{
		jQuery('#notifCount').show().text(cnt); //No I18N
		jQuery('#notifList').hide(); //No I18N
	}
	else
	{
		jQuery("#noti-alert").find("#notifCount").html('');
		jQuery('#notifCount').hide(); //No I18N
	}
		//To apply the 'mr5' class to the bell notification icon only when the count is displayed, ensuring it does not overlap with others and provides additional space.
		jQuery('#bellIconCountCheck').toggleClass('mr5', cnt !== 0); //NO I18N
		updateNotificationCountInBrowserTitle(cnt);
}
}

function processEventNotification(message)
{
	var count = message.message;
	var msg = translate("common.event.systemUpdates");//NO I18N
	var a_msg = '';
	if(count > 0)
	{
		if(count == 1 ) {
			msg  =  count + " " + translate("common.event.systemUpdate");//NO I18N
		}else{
			msg =  count + " " + msg;
		}
		a_msg= '<span class="badge badge-count btn-danger" action="active">'+count+'</span>';//NO I18N
	}
	jQuery('#eventNotificationLink,.email-icon.ov-upd-icon').find('.event-btn span.badge').remove().end().append(a_msg).attr('title', msg);
}

function processUserPersonalization(message) {
	sdp_user.CLIENT_CONF[message.key] = message.data;
}


function appendBroadCastMesg(message)
{
	var mess =message.message;
	mess = JSON.parse(mess);
	var previousMessages = "";
	var bcmId =  mess.broadcast_id;
	if(jQuery("#bcm-notificationbox").find("#message_list").find('[data-bcmid='+bcmId+']').length == 0){
		//stores the previousMessages, if many broadcast messges are recieved at once
		if(jQuery('#bcm-notificationbox').hasClass('anim-scalehide') === false){
			previousMessages = jQuery('#message_list').find("#latest_message").attr('id', 'older_message').end().html(); //previousMessages will be appended before the new message
		}
		mess.previousMessages = previousMessages;
		mess.created_time = {"display_value": message.time_str}; //NO I18N

		$broadcast_mesg.showBroadcastMessage(mess);
	}

}

function processGeneralNotification(message, isMaster){
	var type = message.type;
	if(type == 'WOupdate'){
		if(window.location.pathname.includes('WOListView')){
			//refreshSubView('RequestsView');
		}
	}
	else if(type == 'PendingApprovalsCount' && !is_external_chat){
	    // need to stop this notification from being executed in external site.
 	    showPendingApprovalsCount(message.message);
	}
	else if(type == 'broad_cast_mesg'){
		appendBroadCastMesg(message);
	}
	else if(type === "close_broad_cast_mesg"){
		closeBroadCastMesg();
	}
	else if (type  == 'Announcement') //NO I18N
	{
		appendAnnouncementMesg(message);
	}
	else if (type === "close_announcement")
	{
		adjustAnnouncementNotifi(message.id,"announcement");//No I18N
	}
	else if(type === "color_settings_update" && window.location.pathname.includes('WOListView')){
		var helpdeskId = message.helpdeskId;
		if(helpdeskId == PORTALID){
			var color_info = jQuery("#alertbox").find('.alert-info .msg a').attr('data-attr');
			if(color_info == undefined){
				var mesg = translate('api.updated.success',[translate('sdp.colorsettings')])+ " <a data-attr='color_settings_update' href\='javascript\:refreshRequestListView()'>"+translate('sdp.admin.ad.ou.refresh')+"</a>";
				window.showalert('info',mesg,"isAutoHide=false"); // No I18N
			}
		}
	}
	else if (type.startsWith('zia')) {
		ziac.handleSocketNotification(type, message);
	}
	else if(type == 'notify_last_login_time'){
		showNotifyLastLoginTimeBanner(message);
	}
	else if(type === 'close_websocket'){
		skip_ping_clear_timer = true;
		if(ws != undefined){
			ws.close();
		}
		
	}else if(type === 'sample_data'){ // No I18N
	    processSampleEntries(JSON.parse(message.message));
	}
	else{
		jQuery("#"+message.type).removeClass('hide').find('span').html(message.message);
	}
		playSound("GeneralNotifications",type); // No I18N
}

function processSampleEntries(outputJSON)
{
	const resultMessage = outputJSON.RESULT;
	const operation = outputJSON.Operation;
	const license = operation === "DELETE" ? outputJSON.License : "null"; //No I18N
	if(resultMessage === 'SUCCESS' && operation === 'ADD'){ // No I18N
		handleSampleDataOutput("remove", translate("sample.data.rem"), translate("sample.data.overview.content.populate") , 'sample.data', 'sample.data.notification.content', 'sample.data,api.added.success', false, resultMessage, license); //No I18N
	}else if(resultMessage === 'FAILED' && operation === 'ADD'){ // No I18N
		handleSampleDataOutput("remove", translate("sample.data.rem"), translate("sample.data.overview.content.populate") , 'sample.data', 'sample.data.population.failed', 'sample.data,api.added.success', true, resultMessage, license); // No I18N
	}

	if(operation === "DELETE"){ // No I18N
		handleSampleDataOutput("add", translate("sample.data.populate"), translate("sample.data.overview.content") , 'sample.data', 'sample.data.notification.content.delete', 'sample.data,api.deleted.success', false, resultMessage, license); // No I18N
	}
	}

function handleSampleDataOutput(operation, value, textTranslate, title, content, successMsg, areEntitiesFailed, resultMessage, license){
	jQuery('#sampleDataBtn').attr('data-operation', operation); // No I18N
    // Remove existing event listeners
    let sampleDataBtn = document.querySelector('#sampleDataBtn'); //NO I18N
	if(sampleDataBtn != null){
		let newBtn = sampleDataBtn.cloneNode(true);
		sampleDataBtn.parentNode.replaceChild(newBtn, sampleDataBtn);

		// Update the sdpJs attribute
		if (onclick === "add") { //NO I18N
			newBtn.setAttribute("sdpJs", "add-data-event"); //NO I18N
		} else {
			newBtn.setAttribute("sdpJs", "remove-data-event"); //NO I18N
		}
		const $sampleData = jQuery("#sampleDataBtn");
		if (newBtn.getAttribute("sdpJs") === "remove-data-event") { //NO I18N
			newBtn.addEventListener("click", function(event) { //NO I18N
				$impl_asst.showSampleDataPopUp($sampleData);
			});
		} else {
			newBtn.addEventListener("click", function(event) { //NO I18N
				$impl_asst.showSampleDataPopUp($sampleData);
			});
		}
	}
	jQuery("#sampleDataBtn").html("<span id='spanSampleBtn' class=''></span>" + value); // No I18N
	jQuery("#sampleHeaderContent").text(textTranslate); //No I18N
	if(areEntitiesFailed){
		notifySampleData(title, content, successMsg, areEntitiesFailed, resultMessage, operation, license);
	}else{
		notifySampleData(title,content, successMsg, areEntitiesFailed, resultMessage, operation, license);
	}
	}

function notifySampleData(title, content, successMsg, areEntitiesFailed, resultMessage, operation, license){
	let failedMessageClass = '';
	if(areEntitiesFailed){
		failedMessageClass = "mandatory fontNormal"; //NO I18N
	}

	//if the language is chniese or arabic, We need to skip the splitting part or else we can split the content.
	//SD-131727 Issue Fix
	let part1 = "", part2 = "", part3 = "";
	const userLanguage = sdp_user.LOCALE;
	const isSpecialLang = userLanguage === "ar_AR" || userLanguage === "zh_CN"; //NO I18N

	const translatedContent = translate(content);

	if (isSpecialLang) {
		part1 = translatedContent;
	} else {
		const [firstSegment, secondSegment = ""] = translatedContent.split(', ');
		part1 = firstSegment;
		part2 = ",";
		part3 = secondSegment;

		if (resultMessage === "FAILED") { //NO I18N
			const [mainPart, rest = ""] = translatedContent.split('. ');
			const [subPart1 = "", subPart2 = ""] = rest.split(', ');

			part1 = mainPart + ".";
			part2 = subPart1 ? subPart1 + "," : "";
			part3 = subPart2;
		}
	}

	const messageContent = isSpecialLang
    ? `<div class='p10'><p class='mt0 mb3'><span class='${failedMessageClass}'>${part1}</span></p></div>` // NO I18N
    : `<div class='p10'><p class='mt0 mb3'><span class='${failedMessageClass}'>${part1}</span><span>${part2} </span><br><span class='sb'>${part3}</span></p></div>`; // NO I18N

	jQuery('#sampleDataBtn').attr('disabled', false);
	jQuery('#spanSampleBtn').removeClass('mr10 task-loading');
	jQuery.fn.notifyWidget({
		title: '<span class="vsub cspr bell1 mr10"></span> '+translate(title),
		content: messageContent,
		autoClose : false,
		timeDelay : 100
	});
	if(!areEntitiesFailed){
	window.showalert('success',translate(successMsg.split(",")[1], [translate(successMsg.split(",")[0])]),"isAutoHide=true"); // No I18N
    }
	sdpAjax({
		type: 'GET', //NO I18N
		url: '/api/v3/impl_plans', //NO I18N
		success : function(responseObj){
			const impl_asst_status = responseObj.impl_plans.length == 0 ? "" : responseObj.impl_plans.get(0).status; //NO I18N
			if(operation == 'remove'){ //NO I18N
				if(impl_asst_status == 'inactive' || impl_asst_status == 'completed'){ //NO I18N
					jQuery("#edit_impl_span").addClass('cur-na'); //NO I18N
					jQuery("#edit_impl").addClass('ptr-ev-none opac5'); //NO I18N
				}else{
					jQuery("#setupPlan").addClass('ptr-ev-none opac5 cur-na'); //NO I18N
				}
			}else{
				if(operation == 'add'){ //NO I18N
					if((impl_asst_status == 'ongoing' || impl_asst_status == 'completed')){ //NO I18N
						jQuery("#edit_impl_span").removeClass('cur-na'); //NO I18N
						jQuery("#edit_impl").removeClass('ptr-ev-none opac5'); //NO I18N
					}else{
						jQuery("#setupPlan").removeClass('ptr-ev-none opac5 cur-na'); //NO I18N
					}
				}

				if(license != 'null' && license != 'T'){ //NO I18N
					jQuery('#overview-container').removeClass('new-user'); //NO I18N
					jQuery("#admin-wizard").find("#impl_page").css("width", "1100px").end().find("#impl_sampledata").removeClass("disp-c").addClass("hi"); //NO I18N
					return;
				}
			}
		},
		error: function(err) {
			showalert('failure', e_html(err.responseJSON.response_status.messages[0].message), 'isAutoHide=false'); // No I18N
		}
	});

    //automatically navigating the user to homepage if the data is populated and user remains to stay on the same page
    const intervalId = setInterval(() => {
        const pageName = window.location.hash.split('/').pop();
        if (pageName === 'landing' && operation === 'remove') { //NO I18N
            setTimeout(() => {
                const currentPageName = window.location.hash.split('/').pop();  //NO I18N
                if (currentPageName === 'landing') {
                    window.location.href = "/ui/home?view_type=my_view"; //NO I18N
                }
                clearInterval(intervalId);
            }, 5000);
        } else {
            clearInterval(intervalId);
        }
    }, 1000);
}

function refreshRequestListView()
{
	jQuery("#refreshfreq").trigger('click');

	jQuery("#alertbox").html('');
	if(jQuery("#cs-dialog").length){
		jQuery("#cs-dialog").dialog("close"); // No I18N
	}

}

function closeBroadCastMesg(){
	jQuery('#bcm-notificationbox').addClass('anim-scalehide');
}

function processChatNotification(message){
	if (typeof chtload == "undefined") {
		return;
	}
	var type = message.type;

	function loadInternalChat(type){
		if(jQuery("#user_chats").parent().hasClass("active")){
			requester_chat.loadtimerdiv(message, type);
		}else{
		  const $userChatsParent = jQuery(".chatmain-column #user_chats").parent('li');// No I18N
		  if(!$userChatsParent.hasClass("active")){
		    $userChatsParent.find('a').trigger("click");
		  }
		}
	}
	if(message.time && chtload !== "undefined") {/*"chtload" condition apply for External frame, chat bar not present that time "chtload" chat load key missing*/
		if (type !== "stop_chat_mesg") {
		  last_ping = message.time;
		}
		const msg_id = message.id;
		switch (type) {
		  case "new_chat_request"://No I18N
			if (sdp_user.USERTYPE === "Technician" && sdp_app.IS_CHAT_ENABLED) {
			  loadInternalChat("requester_chat"); //NO I18N
			  notifyUserForChat(message, true);
			} else {
			  chat_box.loadUserNewChat(message);
			}
			break;
		  case "new_chat_message"://No I18N
			// Removing chat badge count from recent chats is exists
			if (is_external_chat) {
			  var is_message_to_be_shown = chat_box.checkChatMessageToBeShown(msg_id);
			  if (!is_message_to_be_shown) {
				return;
			  }
			}
			chat_box.alignChatPopups(msg_id);
			chat_actions.chatNewMessage(message);
			notifyUserForChat(message, true);
			break;
		  case "chat_dropped"://No I18N
			requester_chat.closeChat(message);
			break;
		  case "chat_accepted"://No I18N
			requester_chat.chatMessageAccepted(message);
			break;
		  case "chat_closed"://No I18N
			requester_chat.closeChat(message);
			if (chtload.options.usertype == "Technician") {
			  if (message.from != chtload.options.userid) {
				requester_chat.removeActiveChatFromList(msg_id);
				jQuery(".sdp-glyph-rotate-left").trigger("click"); //No I18N
			  }
			}
			break;
		  case "new_transfer_chat"://No I18N
			loadInternalChat("transfer_chat"); //NO I18N
			notifyUserForChat(message, true);
			break;
		  case "transfer_chat_dropped"://No I18N
		  case "transfer_chat_rejected"://No I18N
			requester_chat.transferChatDropped(message);
			break;
		  case "transfer_chat_accepted"://No I18N
			requester_chat.closeChat(message);
			break;
		  case "my_chat_transfered"://No I18N
			requester_chat.myChatTransfered(message);
			break;
		  case "my_new_chat"://No I18N
			chat_box.loadUserNewChat(msg_id);
			if (message.message && message.message !== "") {
			  chat_actions.showChatNotice(msg_id,message.message,"welcome",message.time,false); //No I18N
			}
			chat_box.focusChatTextArea(msg_id);
			if (is_external_chat) {
				const $chatBar = jQuery("#sdp-chat-bar");
				$chatBar.find('div.chatmain-column').addClass('hide');//No I18N
				$chatBar.closest("div.chat-mini-header").addClass("hide"); //No I18N
			}
			break;
		  case "my_chat_txt"://No I18N
			chtload.myChatNewMessage(message, "text"); //No I18N
			break;
		  case "my_chat_note"://No I18N
			chtload.myChatNewMessage(message, "note"); //No I18N
			break;
		  case "my_chat_closed"://No I18N
			setTimeout(function () {
			  chat_box.removeActiveChat(msg_id);
			  chat_box.closeChatBox(msg_id);
			}, Math.random() * 1000);
			break;
		  case "my_closed_chat"://No I18N
			requester_chat.closeChat(message);
			break;
		  case "transfer_rejected"://No I18N
			requester_chat.removeActiveChatFromList(msg_id);
			break;
		  case "transfer_accepted"://No I18N
			// closing the old chat pop up id exists
			var parseMesg = JSON.parse(message.message);
			chat_box.removeActiveChat(msg_id);
			chat_box.closeChatBox(msg_id);
			var portalId = parseMesg.portalid;
			chat_box.loadUserNewChat(msg_id, false, portalId);
			break;
		  case "update_title"://No I18N
			chat_box.updateChatTitle(message);
			break;
		  case "my_new_transfer_chat"://No I18N
			chat_actions.showChatNotice(msg_id,translate("chat.transfer.request.sent"),"action",message.time,false); //No I18N
			break;
		  case "my_chat_transfer_msg"://No I18N
			chat_actions.showChatNotice(msg_id,message.message,"welcome",message.time,false); //No I18N
			break;
		  case "transfer_chat_closed"://No I18N
			requester_chat.removeActiveChatFromList(msg_id);
			window.showalert("success",translate("chat.closed.by", [e_html(message.message)]),"isAutoHide=true"); // No I18N
			break;
		  case "my_new_tech_chat"://No I18N
			chat_box.loadUserNewChat(msg_id);
			break;
		  case "user_logout"://No I18N
		  case "user_login"://No I18N
			if (sdp_app.IS_SDP_CHAT_ENABLED) {
			  chtload.reArrange(msg_id, type);
			}
			break;
		  case "my_new_req_chat"://No I18N
			var parseMesg = JSON.parse(message.message);
			chat_box.loadUserNewChat(msg_id, true, parseMesg.portalid);
			chat_box.focusChatTextArea(msg_id);
			break;
		  case "new_member_added"://No I18N
		  case "member_removed"://No I18N
		  case "member_left"://No I18N
			// first reload the chat
			const chtID = msg_id;
			var chat_entity;
			var $chatbox = jQuery("#" + chtID);
			if ($chatbox.length !== 0) {
			  chat_entity = $chatbox.attr("data-chat-entity");
			}
			if (chat_entity == "channel") {
			  const channelId = $chatbox.attr("data-channelid");
	  
			  const viewMembers = $chatbox.find("#viewmembers" + channelId);
			  let count = parseInt(viewMembers.text());
	  
			  count = type === "new_member_added" ? ++count : --count; //No I18N
			  viewMembers.text(count);
			  viewMembers.attr("title",count);
			} else {
			  if ($chatbox.attr("data-chat-entity") !== "fluid_group_chat") {
				chat_actions.convertToGroupChat(chtID);
			  }
			}
	  
			chat_box.showAddRemoveMemberNotice(message, type);
			break;
		  case "iam_removed"://No I18N
			chat_actions.removeUserFromChat(message);
			break;
		  case "i_left"://No I18N
			chat_box.showUserLeftMessage(message);
			break;
		  case "iam_added"://No I18N
			chat_actions.addUserToChat(message);
			if (
			  jQuery("#sdp-chat-bar")
				.find("#user_chats")
				.parent("li")//No I18N
				.attr("class") === "active" //No I18N
			) {
			  chtload.getUserChats("recent-chats", "my_recent_chats"); //No I18N
			  chtload.showHideNoChatNotifDiv();
			}
			break;
		  case "chat_entity_deleted"://No I18N
			chat_box.showChatEntityDeleted(message);
			break;
		  case "user_joined"://No I18N
			var chat_entity;
			var $chatbox = jQuery("#" + msg_id);
			if ($chatbox.length !== 0) {
			  chat_entity = $chatbox.attr("data-chat-entity");
			}
			if (chat_entity != "channel") {
			  chat_actions.convertToGroupChat(msg_id);
			}
			else{
				let count = parseInt($chatbox.find("#viewmembers"+msg_id).text()) + 1;
				$chatbox.find("#viewmembers"+msg_id).text(count);
				$chatbox.find("#viewmembers"+msg_id).attr("title",count);
			}
	  
			chat_box.showUserJoinedMesg(message);
			break;
		  case "quick_chat_started"://No I18N
			var pageWoid = pagenotif.modules.id;
			var woId = message.message;
			if (pageWoid == woId) {
			  chat_box.changeQuickStartChatAction(msg_id);
			}
			break;
		  case "all_users_left"://No I18N
			var woId = message.message;
			var $target = jQuery("#collaboration_details").find("#viewers_names");
			var target_len = $target.find("#start_quick_chat").length;
	  
			if (target_len > 0 && woId == woID) {
			  /* Changing 1 Active chat view to Start Chat/Manage Button format when all users left from the collaborators chat */
			  content ="<div><button class='btn btn-primary btn-sm' type='button' data-name='startChatBtn' >" +translate("common.chat.start") +"</button>"; //NO I18N
			  content +="<button class='btn-link ml5' data-name='manageBtn' >" +translate("common.manage") +"</button></div>";
			  jQuery("#start_quick_chat").html(content);
			  jQuery("#start_quick_chat").find('[data-name=startChatBtn]').off("click.collabContainer").on("click.collabContainer",function(){//NO I18N
			  		chat_actions.startCollaboratorschat("request",woId);// NO I18N
			  });
			  jQuery("#start_quick_chat").find('[data-name=manageBtn]').off("click.collabContainer").on("click.collabContainer",function(){//NO I18N
			  		chat_actions.selectTechs("request", woId);// NO I18N
			  });
			}
			var $chatObj = jQuery("#sdp-chat-bar").find("#" + msg_id);
			$chatObj
			  .find(".chat-header1")
			  .find("#closechat")
			  .off("click.chatBox").on("click.chatBox", function(){chat_box.closeChatBox(msg_id );});//No I18N
			$chatObj
			  .find(".chat-mini-header")
			  .find("#closechat")
			  .off("click.chatBox").on("click.chatBox", function(){chat_box.closeChatBox( msg_id );});//No I18N
			break;
		  case "collaborators_not_active_in_chat"://No I18N
			var pageWoid = pagenotif.modules.id;
			var woId = message.message;
			if (pageWoid == woId) {
				content =`<div class='chat-link text-dark'><span class='cspr flat icon-sm wechat opac5 mr5'></span>${translate("chat.one.active.chat")} <a href='/' class='fr' data-name='joinChatLink'>${translate("chat.join")}</a></div>`;
			  jQuery("#start_quick_chat").html(content);
			  jQuery("#start_quick_chat").find("[data-name=joinChatLink]").off("click.collabContainer").on("click.collabContainer",function(){// No I18N
			  		chat_actions.joinChat(msg_id, woId);
			  });
			}
			break;
		  case "stop_chat_mesg"://No I18N
			chat_box.stopChatMessage(msg_id);
			break;
		  case "chat_notification"://No I18N
			var parseMesg = JSON.parse(message.message);
			const chatid = parseMesg.chatid;
			if (parseMesg.portalid == PORTALID) {
			  chtload.showUnreadCount(parseMesg.chatcount);
			  if (sdp_user.USERTYPE === "Requester" &&jQuery("#sdp-chat-bar").find("#missed-chat-tab").parent("li").attr("class") === "active") {
				chtload.openMissedChats();
			  }
			  if (
				sdp_user.USERTYPE === "Technician" && //No I18N
				jQuery("#sdp-chat-bar").find("#user_chats").parent("li").attr("class") === "active" //No I18N
			  ) {
				const $unread_wrap = jQuery("#sdp-chat-bar").find("#unread-chats");
				$unread_wrap.find(`[data-chatid="` + chatid + `"]`).remove();
				chtload.showHideNoChatNotifDiv();
			  }
			}
			break;
		  case "convert_to_group_chat"://No I18N
			chat_actions.convertToGroupChat(msg_id, message.techId);
			break;
		  case "collaborators_chat_closed"://No I18N
			chat_actions.removeActionsAndTextArea(msg_id);
			break;
		//notification actions after a message is pinned
		  case "new_pin_message"://No I18N
		  	redirect.handlePinMessages(message, "new_pin"); // No I18N
			const userID = message.from;
			const user = JSON.parse(message.message).action;
			var userName = user;
			if (userID == sdp_user.LOGGEDIN_USERID) {
			  userName = translate("sdp.common.you"); // No I18N
			}
			const tags =sdp_user.USERTYPE !== "Requester" ? chat_actions.getUserHrefLink(userID, userName) : e_html(userName); // No I18N
			const msg = translate("chat.action.pin.message", [tags]);
			const time = message.time;
			chat_actions.showChatNotice(msg_id, msg, type, time, false);
			break;
		//notification actions after a message is Unpinned
		  case "deleted_pin_message"://No I18N
		  	redirect.handlePinMessages(message, "deleted_pin"); // No I18N
			break;
		//notification actions after a channel is trashed (or) archived
		  case "trashed_channel"://No I18N
		  case "archived_channel"://No I18N
			const chtid = msg_id;
			redirect.showTemporaryChatAction(message, type);
			const msgObj = JSON.parse(message.message);
			const channelStatus = type === "archived_channel" ? "Archived" : "Trashed"; // No I18N
			jQuery("#" + chtid).attr("channel-status", channelStatus);
			const portalid = msgObj.portalid;
			if (portalid == sdp_app.PORTAL_ID) {
			  jQuery("#channellist").find("li[data-chat-id='" + chtid + "']").remove();
			  if(jQuery("#channellist").children().length == 0){
				jQuery("#data-channel").addClass("hide");
				jQuery("#nodata-channel").removeClass("hide");
			  }
				if(jQuery("#chat-cs-list").length >0){
					let chnlId = JSON.parse(message.message).channel_id;
					let $li= jQuery("#all-channels-data").find(`li[data-channelid='${chnlId}']`);
					if(type == "archived_channel"){
					$li.find(`#title-id-${chnlId}`).append(`<span class="text-danger ml5 disp-ib vmiddle mt2 max-w140px text-overflow" title="${(translate("sdp.archive.dView.purchase.arcReq.header"))}" mode_ellipsis="true">( ${(translate("sdp.archive.dView.purchase.arcReq.header"))} )</span>`);
				}else{
					$li.remove();
				}
				}
				chat_box.removeHighlightZone(chtid);
			}
			break;
		  case "ro_mode"://No I18N
			chat_box.disableChatTextArea(msg_id);
		//notification actions after a channel is edited (to show the chat_action in chatBox)
		  case "edited_channel"://No I18N
			redirect.showTemporaryChatAction(message, type);
			break;
			//notification actions after editing channel_info ( adding entry in channels-tab and updating chatBox )
		  case "edited_channel_info"://No I18N
			const data = JSON.parse(message.message);
			const chtId = data.id;
			if (sdp_chat.active_channelactions.hasOwnProperty(chtId)) {
			  delete sdp_chat.active_channelactions[chtId];
			  sdp_chat.active_channelactions[chtId] = data.allowed_channelactions;
			}
			sdp_channels.updatechanneldetailspage(message, type);
			sdp_channels.renderchatactions(message, type);
			break;
			//notification actions after a channel is restored (updating chatBox and channels-tab)
		  case "restored_channel"://No I18N
			const timestamp = message.time;
			let messageBy = JSON.parse(message.message).by;
			messageBy = (message.from == sdp_user.LOGGEDIN_USERID)? translate("sdp.common.you") : messageBy;// No I18N
			messageBy = sdp_user.USERTYPE !== "Requester" ? chat_actions.getUserHrefLink(parseInt(message.from), messageBy) : e_html(messageBy);// No I18N
			//chat-box actions
			const txt = translate("chat.action.channel.restore", [messageBy]);
			if (sdp_chat.active_chatids.indexOf(msg_id) > -1) {
			  chat_actions.showChatNotice(msg_id,txt,"restored_channel",timestamp,false); //No I18N
			  jQuery("#" + msg_id).attr("channel-status", "Running");
			  sdp_channels.renderchatactions(message, type);
			}
			//channels-tab actions
			redirect.handlenewchannel(message, type);
			//all-channels tab actions
			if(jQuery("#chat-cs-list").length >0){
				let chnlId = JSON.parse(message.message).channel_id;
				let $li= jQuery("#all-channels-data").find(`li[data-channelid='${chnlId}']`);
				$li.find(`#title-id-${chnlId}`).find(`span[title="Archived"]`).remove();
			}
			break;
			//notification actions after a member's role is changed (update channel count,actions ) 
		  case "channel_role_change"://No I18N
			const msgdata = JSON.parse(message.message);
			const channelactions = msgdata.allowed_channelactions;
			const chanelId= msgdata.channel_id;
			const chatId = message.id;
			if (sdp_chat.active_channelactions.hasOwnProperty(chatId)) {
			  delete sdp_chat.active_channelactions[chatId];
			  sdp_chat.active_channelactions[chatId] = channelactions;
			}
			if (parseInt(message.from) !== sdp_user.LOGGEDIN_USERID) {
			  if (
				parseInt(
				  jQuery("#view-members").find("#memberstate").attr("data-chat-id")
				) == parseInt(chatId)
			  ) {
				redirect.closehbsdialog(jQuery("#view-members"));
			  }
			}
	  
			redirect.renderchatactions(message, type);
			break;
			//notification actions after bulk addding users( show chatAction)
		  case "bulk_add_members"://No I18N
			if (parseInt(message.from) == sdp_user.LOGGEDIN_USERID) {
			  if (jQuery("#view-members").length !== 0) {
				redirect.closehbsdialog(jQuery("#view-members"));
				chat_box.focusChatTextArea(msg_id);
			  }
			}
			if (!sdp_chat.active_chatids.contains(msg_id)) {
			  chtload.openRecentChat(msg_id);
			}else{
				redirect.showTemporaryChatAction(message, type);
			}
			break;
			//notification actions after adding a new channel (updating channels-tab)
		  case "new_channel"://No I18N
			redirect.handlenewchannel(message, type);
			break;
		}
	}
	if (message.from != sdp_user.LOGGEDIN_USERID) {
		playSound("chat", type); // No I18N
	}

}

function notifyUserForChat(data,isMaster){
	var type = data.type;
	if(type === 'new_transfer_chat' || type === 'new_chat_message' || type === 'new_chat_request'){
		var $column = jQuery(".chatmain-column");
		var chatId = "";
		var mesg = "", userName = "";
		if(type === 'new_chat_message'){
			var content = data.message;
			userName = content.from_user;
			mesg =  content.trimmed_message;
			chatId = data.id;
			$column = jQuery(".chat-column").find("#" + chatId);
		}
		if(data.from != sdp_user.LOGGEDIN_USERID) {
			chat_actions.notifyUser($column,isMaster,chatId,userName,mesg);
		}
	}
}


function notifyMe(message, id) {
	if (!Notification) {
		return;
	}
	if (Notification.permission === "default"){
		Notification.requestPermission();
	}
	else if (Notification.permission === "granted"){
		var notif_header = '',icon = '',tag = '';
			notif_header = sdp_app.ORG_NAME;
			if(sdp_app.IS_MSP){
                notif_header = sdp_app.MSP_ORG_NAME;
            }
            else if(sdp_app.IS_SCP){
                notif_header = sdp_app.SCP_ORG_NAME
            }
			icon = document.location.origin+'/images/desktop-notification.gif';//No I18N
			tag = 'notif_'+message.id;  //No I18N
		var notification = new Notification(notif_header, {
			icon: icon,
			body: message.display_message,
			tag: tag
		});

		notification.onclick = function(){
			window.focus();
			executeFunction(message);
			this.close();
		};
		setTimeout(function(){ notification.close(); },5000);
	}

}

function executeFunction(data){
	var notifyUrl = '/DynamicNotification.do?method=redirectModuleUrl&moduleId='+data.module_id+'&notifyType='+data.type+'&dynamicNotifId='+data.id;//NO I18N
	if(data.type == 'req-count' || data.type == "req-approval" || data.type == 'tech-count' || data.type == 'user-delete' || data.type == 'failed-user-count' || data.type == 'user-count' || data.type == 'domain-error' || data.type == 'pwd-policy-mismatch' || data.type == 'user-count-with-failure' || data.type == 'user-merge' || data.type == 'site-association'){
		if(data.type == "tech-count" && data.helpdesk.id!=null)
		{
			notifyUrl=notifyUrl+'&helpdeskid='+data.helpdesk.id;//NO I18N
		}
		if(isMDHSetup == 'true' && data.type == 'req-count')
		{
			var w=window.open(notifyUrl, "target=_blank");
			w.opener=null;
			return;
		}		
		NewWindow(notifyUrl,'SystemLogViewer',800,500,'yes','center','350','100','',true);
		return;
	}
	if(data.type == 'account-locked') {
        showAccountLockedDetails(data.is_account_locked,data.is_read,data.module_id, data.id);
		return;
    }
    else if( data.type == 'throttle-exceed' ){
		if(typeof rateLimitDetails === 'undefined'){
			const getScript = (sdp_app.IS_DEVELOPMENT_MODE) ? ["/scripts/rate_limit_details.js"] : ["/scripts/hbs-template-throttle.js", "/scripts/rate_limit_min.js"] ; //NO I18N
          	ResourceLoader({
            	js: getScript,
            	success: function() {
					rateLimitDetails.showSuspiciousNotificationAlert(data.module_id,data.is_read,data.id,data.helpdesk.id,false,true);
             	}
			});
        }
		else {
			rateLimitDetails.showSuspiciousNotificationAlert(data.module_id,data.is_read,data.id,data.helpdesk.id,false,true);
		}
		return;
    }
	else if(data.type == 'broadcast_message'){
		$broadcast_mesg.showBroadcastMessage(data.module_id);
		return;
	}
	if( data.helpdesk.is_owner !== undefined && ( !data.helpdesk.is_owner && data.helpdesk.status !== 'Production') ){
		showRestrictedNotificationAlert(); 
		return;
	}
	var w=window.open(notifyUrl, "target=_blank");
	w.opener=null;
}

function getWebSocketURL()
{
	var url = window.location.origin;
	url = url.replace("http","ws");
	url = url.replace("https","wss");
	url = url + "/getNotifications"; //No I18N
	if(PORTALID != undefined){
		url = url +"?PORTALID="+PORTALID; //No I18N
	}
	return url;

}

var LS = {
	set : function(key, value) {
		if ("onstorage" in document) {
			localStorage.setItem('_last_storage_event_key', key); //No I18N
		}
		localStorage.setItem(key, value);
	},
	get : function(key) {
		return localStorage.getItem(key);
	},
	remove : function(key){
		localStorage.removeItem(key);
	},

	onStorage : function(func) {
		//Event handler for storage event
		jQuery(window).on("storage", func); //No I18N

		//Fix provided for IE
		if ('onstorage' in document) { //No I18N
			jQuery(document).on('storage', function(e) { //No I18N
				var key = localStorage.getItem('_last_storage_event_key'); //No I18N
				e.originalEvent.key = key;
					func(e);

			});
		}
	},

	clearLocalStorage : function(){
		//localStorage.clear();
	}

};

function handleMultiTabMessage(key, data) {
	if(key === "ping" && isMaster) { //No I18N
		if(lastPing != data) {
			clearTimeout(ws_timer);
			isMaster = false;
			//document.title = isMaster;
			updatePing();
		}
	}
}

function updatePing() {
	var ping = getValue("ping"); //No I18N
	var newDate = new Date().getTime();
	if(isMaster === true){
		lastPing = newDate;
		setValue("ping",newDate); //No I18N
	}
	if((Math.abs(Number(ping)== 0)) || (Math.abs(Number(ping) - newDate ) <= 5500 && isMaster) || (Math.abs(Number(ping) - newDate) > 6500)){
		if(isMaster === false) {
			isMaster = true;
			lastPing = newDate;
			setValue("ping",newDate); //No I18N
			startWebSocketConnection();
		}
		isMaster = true;
	}
	else {
		isMaster = false;
	}
	//document.title = isMaster;
	ws_timer = setTimeout(function() { updatePing(); }, 4000);

}

function getValue(name){
	return LS.get(name);
}

function setValue(name,value){
	LS.set(name,value);	
}

function removeItem(name){	
	LS.remove(name);
}

function updateViewPageCount(id,type){
        if(sdp_user.IS_REQ_PAGE_OPENED === "false"){
		removeLSOrCKValues();
	}
	var count = getValue("REQ_COUNT_"+id); //No I18N
	if(type === 'remove'){
		count =  parseInt(count) - 1;
		if(isNaN(count)){
			removeItem("REQ_COUNT_"+id); //No I18N
		}
		else{
			setValue("REQ_COUNT_"+id,count);	//No I18N
		}
	}
	else if(type === 'add'){
		if(count == null || count === "null"||isNaN(count)){
			count = 1;
		}
		else{
			count =  parseInt(count) + 1;
		}
		setValue("REQ_COUNT_"+id,count);	 //No I18N
	}
}

/* Function for removing REQ_COUNT_ keys from localstorage */
function removeLSOrCKValues()
{
	var req_list =[];
	
		var len = localStorage.length;
		for (var i = 0; i < len; i++){
			var key = localStorage.key(i);
			if(key.indexOf("REQ_COUNT_")>=0){
				req_list.push(key);
			}
		}
	
	var req_len = req_list.length;
	for (var i = 0; i < req_len; i++){
		removeItem(req_list[i]);
	}
}

//adding the notification form the content in message(param)
function appendAnnouncementMesg(message)
{
	var mess =message.message;
	parsedMesg = JSON.parse(mess)
	mess = parsedMesg.announcement;
	var portalId = parsedMesg.portalId?parsedMesg.portalId:mess.portalId;
	var timestamp = parsedMesg.time_str? parsedMesg.time_str:message.time_str;
	//removes any notification present that belongs to this announcement and rearrange the notifications
	adjustAnnouncementNotifi(mess.id,"announcement");//No I18N
	//triming the announcement content to show in the notification
	var content = mess.content.length>150?mess.content.substring(0,150)+"...<a  href='/' rel='noopener'>"+translate("sdp.purchase.status.canceled.info.more")+"</a>":mess.content;//No I18N
	var name = mess.created_by?mess.created_by.name:mess.user.name;
	setTimeout(function(){
		jQuery.fn.notifyWidget({
			title: "<h5 style='background: none;' class='p0'>"+translate("sdp.home.announcement.addnew.headTitle")+"</h5>",
			autoClose : false,
			position : 'TM',  //No I18N
			headericon : '<span class="fl vsub cspr bell1 mr10" data-type="announcement" data-id = '+mess.id+' ></span>',
			content: '<div  class="p10"><p class="mt0 mb3 sb" ><a id="announcement-notif-title-'+mess.id+'" href="/" title="'+e_attr(mess.title)+'">'+e_attr(mess.title)+'</a> </p><p class="mt0 mb3"><span class="text-muted">'+translate("sdp.common.by") +' : </span><span  class="mt0 mb3 sb" >'+e_attr(name)+'</span><span class="text-muted">'+" "+translate("sdp.common.on")+' : </span><span class="mt0 mb3 sb" >'+timestamp+'</span></p><p id="announcement-notif-content-'+mess.id+'" class="mt0 mb3 sb" title="'+mess.content+'" >'+content+'</p></div>',
			callbackfn: function() {
				/** Callback funtion for announcement widget after render 
				 * Widget position alignment 
				 * Close click event for announcement 
				**/
				var notifications = jQuery("[id^=tech-notification-]")
				if(notifications.length!=0) {
				    var top = 140;
					for(var i= notifications.length-1;i>0;i--) {
						jQuery(notifications[i]).css({"top": "" + top + "px"}); //No I18N
						top += 140;
					}
				}
				
				//adding the functionality of removing the notificaiton in all tabs if its removed in a single tab
				jQuery(jQuery('[data-id="'+mess.id+'"]').parents("[id^=tech-notification-]")[0]).find("[id^=close-detail-main-tech-]").click(function(){ //No I18N
					closeAnnouncement(mess.id,"announcement");//No I18N
				});
                  				//binding events for announcement
                  				jQuery('#announcement-notif-title-'+mess.id+', #announcement-notif-content-'+mess.id).on('click',function(){
                  				    closeAnnouncement(mess.id,'announcement');//No I18N
                  					if( typeof Ember !== "undefined" )
                  					{
                  						window.open('/ui/home?view_type=my_view&announcementId='+mess.id+'&portal_id='+portalId,'_blank', 'noopener,noreferrer');
                  					}
                  					else{
                  						$announcements.viewAnnouncement(mess.id,'inAppNotif',null,portalId);//No I18N
                  					}
                  				});
			}
		});
	}, 600);

}

// adjust the notifications of type like remoivng the notification of id and rearrange the notifications
function adjustAnnouncementNotifi(id,type) {
	var notifications = jQuery("[id^=tech-notification-]")
	//checking if any noti
	if(notifications.length!=0) {
		var deleted = 0;
		var length = notifications.length;
		//default top of the first notification
	    var top = 140;
		for(var i= notifications.length-1;i>0;i--)
		{
			if (deleted == 1) {
				//adjusting the top of all notifications that are below the removed notification
				jQuery(notifications[i]).css({"top": "" + top + "px"}); //No I18N
			} else if (jQuery(notifications[i]).find('[data-id='+id+']').filter('[data-type='+type+']').length>0) { //No I18N
				notifications[i].parentNode.removeChild(notifications[i]);
				deleted = 1;
				top -= 140;
			}

			top += 140;
		}
	}

}
// calls adjustfunction and pass the message to remaining tabs to close the respective type notification
function closeAnnouncement(id,type)
{
	jQuery(".announcement-dialog").css("z-index","9999");//No I18N
	adjustAnnouncementNotifi(id,type);
	var data = {'module':'GeneralNotifications','type':'close_announcement','id':id}; //No I18N
	if(is_broadcast_channel_support) {
		channel.postMessage(JSON.stringify(data));
	}
}

//********************Telephony Integration********************//

function processTelephonyNotification(message, isMaster)
{
	if(message.message){
		var type = message.type;
		var caller_mesg = JSON.parse(message.message);
		if(type === 'new-call'){
			var $telephony = telephony.fillCallTemplate(caller_mesg,type);
		}
		else if(type === 'ongoing-call'){
			var element = jQuery("#CallAlertDiv").find("[data-callid=" + caller_mesg.callId + "]");
			if(element.length){
				telephony.callPickedUp(caller_mesg.callId,caller_mesg.isAvaya,element);
			}
			else{
				var $telephony = telephony.fillCallTemplate(caller_mesg,type);
			}
		}
		else if(type === 'hangup-call'){
			var element = jQuery("#CallAlertDiv").find("[data-callid=" + caller_mesg.callId + "]");
			if(element.length){
				telephony.callHungUp(caller_mesg.callerId,element);
			}
			else{
				//in case of caller close the outgoing call popup (SD-123518)
				const element = jQuery("#CallAlertDiv").find("[data-callid=outgoing-call]");
				element.find("#close_telephony").trigger("click");
			}
		}
		else if(type === 'close-popup'){
			jQuery("#CallAlertDiv").find("[data-callid='" + caller_mesg.callId + "']").remove();
		}
		else if (type === 'outgoing-call'){
			var element = jQuery("#CallAlertDiv").find("[data-callid=outgoing-call]");
			var status = caller_mesg.status;
			if(status==="success"){
				telephony.callSucceeded(element);
			}
			else if(status==="failure"){
				telephony.callFailed(element);
			}
		}
	}
}

function showNotifyLastLoginTimeBanner(message) {
	var notifyLastLoginTime = JSON.parse(message.message);
	showLastLoginBanner.init(notifyLastLoginTime, false);
	jQuery('#header-notify-login-time-success').text(notifyLastLoginTime.SUCCESS).attr('title', notifyLastLoginTime.SUCCESS);
	jQuery('#header-notify-login-time-failed').text(notifyLastLoginTime.FAILED).attr('title', notifyLastLoginTime.FAILED);
}
function playSound(module,type)
{
    notificationToneObj = sdp_user.CLIENT_CONF.notificationTone;
    if(isMaster && notificationToneObj && notificationToneObj[module]){
    	var tone = null;
	    if(module === "chat"){
	    	//Since we for the all type of chat notifications playing same sound and we are maintaining the type also in client.
	    	if(chat_notification_tone_type.indexOf(type)!== -1)
		    {
		    	tone = notificationToneObj[module].new_chat_message;
		    }
	    }else if(notificationToneObj[module][type]){
			tone = notificationToneObj[module][type];
		}
		if(tone != null){
			new Audio('/sounds/'+tone+".mp3").play(); //No I18N
		}
	}
}

function isAppActiveTab(isActive_time){
 var isTabActive = ("visible" == document.visibilityState); //No I18N
  if(localStorage.getItem("isActive_time") < isActive_time){
   localStorage.setItem("isActive",false); //No I18N
  }
     if(isTabActive){
        localStorage.setItem("isActive",true); //No I18N
        localStorage.setItem("isActive_time",isActive_time); //No I18N
     }
}


/* In-app notification code starts */
var $inAppNotif = {
	count: 0,
	queue: [],

	init: function(notifData){
        if(jQuery('#'+notifData.id).length == 0){
			var extFrameCB = function() { //callback to setOptions after notification poped up
				setTimeout(function() { $extFrame.setOptions(); }, 500);
			}
            if(jQuery('#inAppReqNotifWrapper').length == 0){
                renderhbs(jQuery('body'),"in-app-notif",notifData,true,"common", false, false, extFrameCB);//No I18N
            }else{
                renderhbs("#inAppReqNotifWrapper","in-app-notif",notifData,true,"common", false, false, extFrameCB);//No I18N
            }
            setTimeout(function(){
                $inAppNotif.remove(notifData.id);
            },30000);

            $inAppNotif.add(notifData.id);
        }
        if(notifData.priorityColor=="transparent")
        {
            jQuery('#'+notifData.id +" em").hide();
        }
	},
	add: function(notifId){
		if(this.count >= 3){
			this.remove();
		}
		this.count++;
		this.queue.push(notifId);
		this.rearrange();

	},
	remove: function(notifId){
		if(this.queue.length > 0){
			if(notifId===undefined){
				notifId = this.queue[0];
				this.queue.shift();
				this.count--;
			}
			else if(this.queue.indexOf(notifId) > -1){
				var indexToRemove = this.queue.indexOf(notifId);
				this.queue.splice(indexToRemove,1);
				this.count--;
			}
			jQuery('#'+notifId).removeClass('notify-dialog-anim').removeClass('rt-toprightview').fadeOut();
			this.rearrange();
		}
	},
	rearrange: function(){
		var height = 50;
		for(var i=this.count-1; i>=0; i--){
			jQuery('#'+this.queue[i]).addClass('rt-toprightview').css('display','');
			jQuery('#'+this.queue[i]).removeClass('notify-dialog-anim').css({top : height+'px'}).addClass('notify-dialog-anim');

			height += jQuery('#'+this.queue[i]).height()+13; //13px for the top margin
		}
	}
}

