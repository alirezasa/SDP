// This section contains code related to the chat actions functionality such as chat mentions, reply to, leave chat add member etc.
var chat_actions = {
    /* Removing text area and actions and removing edit chat title from the chat pop up if the chat is closed */
    removeActionsAndTextArea: function (id, is_completed) {
        const $chatObj = jQuery("#sdp-chat-bar").find("#" + id);
        chat_box.disableChatTextArea(id);
        chat_box.removeHighlightZone(id);
        const chat_entity = $chatObj.attr("data-chat-entity");
        if (is_completed != false && (chat_entity === 'requester_chat' || chat_entity === 'tech_req_chat')) {
            $chatObj.find(".chat-header1 #closechat").off('click').on('click.chatBox', function () { chat_box.closeChatBox(id.toString()); }); //No I18N
            $chatObj.find(".chat-mini-header #closechat").off('click').on('click.chatBox', function () { chat_box.closeChatBox(id.toString()); }); //No I18N
        }
        $chatObj.find("#edit_chat_title").off('click.chatBox'); //No I18N
    },
    /* Closing chats related to technicians */
    techChatCloseFn: function (a) {
        const $obj = jQuery(a).parents(".chatbar-maincontent"); //No I18N
        const chatID = $obj.attr("id"); //No I18N
        const $chatBox = jQuery("#sdp-chat-bar").find("#" + chatID);
        // removing onclick maximize function
        $chatBox.find(".chat-mini-header").off('click.sdevent'); //No I18N
        //disbaling the onclick close chat for ignoring close chat multiple times
        $chatBox.find(".chat-mini-header").find("#closechat").off("click.sdevent"); //No I18N
        $chatBox.find(".chat-header1").find("#closechat").off("click.sdevent"); //No I18N
        chat_actions.closeTechChat(chatID);
    },
    /* Closing a tech chat */
    closeTechChat: function (chatID) {
        let ajax_data = chat_util.constructAjaxData({
            url: "/chats/" + chatID + "/_remove_chat", //No I18N
            type: "PUT", //No I18N
            ignorefailuremessage: true
        });

        sdpAjax(ajax_data).complete(function (response) {
            chat_box.removeActiveChat(chatID);
            chat_box.closeChatBox(chatID);
            chat_util.updateChatInfo(chatID, "", "close");
        });
    },
    /* Append a new chat message in the respective chat box.
    Arguments:
    id: Chat Id
    user: user name
    userid : user id
    txt: Chat text
    time: Display time
    timestamp: Time in milliseconds
    type: Note or Attachment
    attachment_url: content_url for attachments
    prepend: If true, prepend template instead of appending.
    */

    isShowMessage: function (id, timestamp) {
        let showMessage = false;
        const $target = jQuery("#sdp-chat-bar #" + id + " .chat-content-wrapper .chat-wrapcont");
        if ($target.length > 0) {
            if (timestamp && timestamp != null) {
                /* If message with same timestamp is found, do not show the message to avoid repeatation. */
                if ($target.find("[data-timestamp='" + timestamp + "']").length == 0) {
                    showMessage = true;
                } else {
                    showMessage = false;
                }
                /* If timestamp is null, or defined for any message, show the message. */
            } else {
                showMessage = true;
            }

            /* If data is to me loaded, after maximizing the chat box, do not append the message. */
            if (jQuery("#sdp-chat-bar #" + id).find(".chat-mini-header").attr("data-loadchat") == "true") {
                showMessage = false;
            }
        }
        return showMessage;
    },
    /* appending a chat message to the chat pop up */
    showChatMessage: function (id, chat_infoid, user, userid, txt, time, timestamp, type, attachment_url, prepend, attach_size, is_from_history, trimmed_message, is_from_scroll, from_recent, from_channeldetails, message_info) {
        let showMessage = false;
        var $chat_obj = "", $target = "", $history_obj = "";
        if (is_from_history) {
            if (type !== "action") {
                showMessage = true;
            }
            $history_obj = jQuery('#common-container').find('#chat_content_area').find('.chat-content-wrapper');
            $target = $history_obj.find(".chat-wrapcont");
            $chat_obj = $target;
        }
        else {
            showMessage = chat_actions.isShowMessage(id, timestamp);
            $chat_obj = jQuery("#sdp-chat-bar").find("#" + id);
            $target = $chat_obj.find(".chat-content-wrapper .chat-wrapcont");
            if (from_channeldetails) {
                showMessage = true;
                $chat_obj = jQuery("#chat-cs-detail").find("#recentconv");
                $target = $chat_obj;
            }
        }
        if (showMessage) {
            var last_time_stamp = null, last_time = null, last_user = null;
            var active_len = sdp_chat.active_chatids.length;

            if (is_from_history) {
                last_time_stamp = $history_obj.find(".chat-wrapcont > #user_chat_mesg")[prepend ? "first" : "last"]().attr("data-timestamp");//No I18N
            } else {
                last_time_stamp = $chat_obj.find(prepend && active_len > 1 ? "#user_chat_mesg:first" : ".chat-wrapcont > #user_chat_mesg:last").attr("data-timestamp");
            }

            if (last_time_stamp !== null) {
                const $last = $chat_obj.find('[data-timestamp="' + last_time_stamp + '"]');
                last_user = $last.attr("data-userid");
                last_time = $last.find(".chat-time").html();
            }
            var $last_msg = $chat_obj.find(".chat-wrapcont").children('#user_chat_mesg').last();//No I18N
            var last_obj_time = $last_msg.attr('data-timestamp');
            var last_obj_user = $last_msg.attr('data-userid');
            var cont = false;
            if (timestamp - last_obj_time < 60000) {
                var last_mins = new Date(parseInt(last_obj_time)).getMinutes();
                var curr_mins = new Date(parseInt(timestamp)).getMinutes();
                if (last_mins == curr_mins) {
                    cont = true
                }
            }
            var new_time = time.split("||")[1];
            var username = "";
            if (userid == sdp_user.LOGGEDIN_USERID) {
                username = translate("common.common.you");
            } else {
                username = user;
            }
            if (type && type == "attachment") { //No I18N
                txt = txt.trim();
                var newAttachUrl = attachment_url;
                if (is_from_history == undefined || !is_from_history) {
                    const portalId = jQuery("#sdp-chat-bar #" + id).attr("data-portalid");
                    newAttachUrl = chtload.appendPortalParam(attachment_url, portalId);
                }
            }
            let need_pin = true;
            let need_replyTo = true;
            if (is_from_history || from_channeldetails) {
                need_pin = false;
                need_replyTo = false;
            }
            const chat_type = $target.parents().find("#" + id).attr("data-chat-entity");
            if (sdp_chat.pinMessageDeniedEntities.includes(chat_type) || type != `text`) {
                need_pin = false;
            }
            else if (chat_type == "channel" && !(is_from_history || from_channeldetails)) {
                need_pin = sdp_chat.active_channelactions[id].includes('pin_message') ? true : false;
            }
            input_data = { "id": id, "chat_infoid": chat_infoid, "user": user, "userid": userid, "txt": txt, "time": time, "timestamp": timestamp, "type": type, "attachment_url": newAttachUrl, "prepend": prepend, "attach_size": attach_size, "is_from_history": is_from_history, "trimmed_message": trimmed_message, "is_from_scroll": is_from_scroll, "sdp_user": sdp_user, "username": username, "new_time": new_time, "last_obj_user": last_obj_user, "cont": cont, "need_pin": need_pin, "need_replyTo": need_replyTo };//No I18N
            if (showMessage && type != 'action') {
                if (userid == sdp_user.LOGGEDIN_USERID) {
                    input_data.msgtype = "sent";// NO I18N
                }
                else {
                    input_data.msgtype = "received";// NO I18N
                }
                if (message_info.reply_to != null) {
                    input_data.replyTo = message_info.reply_to;
                }
                renderhbs($target, 'message', input_data, true, 'chat/Common/Chat', false, false, function () { // NO I18N
                    // Find the template element related to the current message using timestamp
                    const $template = $target.find(`[data-timestamp='${timestamp}']`);
                    if (message_info.reply_to != null) {
                        const mentions = message_info.reply_to.mentions;
                        const $element = $template.find("[data-name=parentMsgData]");
                        // Step 1: Get the raw text (e.g., from data or DOM)
                        const originalText = message_info.reply_to.text;
                        // Step 2: Encode all content to be HTML-safe
                        let encoded = e_html(originalText);
                        // Step 3: Replace {@id} patterns with safe HTML links
                        for (let i = 0; i < mentions.length; i++) {
                            const mention = mentions[i];
                            const token = `{@${mention.id}}`;
                            const encodedToken = e_html(token); 
                            const userProfileLink = chat_actions.getUserHrefLink(mention.id, mention.name); 
                            encoded = encoded.replaceAll(encodedToken, userProfileLink);
                        }
                        // Step 4: Inject into DOM
                        $element.html(encoded).attr('title', encoded);

                        $template.find("[data-name=parentMsgElem]").off("click.chatBox").on("click.chatBox", function () { chat_actions.navigateToMessage(this); }); // NO I18N
                        $template.find("[data-name=parentMsgTime]").each(function () {
                            let msgTimeEle = jQuery(this);
                            let msgTime = msgTimeEle.text();
                            if (msgTime.includes("||")) {
                                let newTimeVal = time.split("||")[0] + " " + time.split("||")[1] ; 
                                msgTimeEle.text(newTimeVal).attr("title",newTimeVal);
                            };
                        });
                    }
                    $target.find("[data-name=replyToElem]").off("click.chatBox").on("click.chatBox", function () { chat_actions.replyToMessage(this) }); // NO I18N
                    
                });
            }
            if (type == 'action') {
                chat_actions.showChatNotice(id, txt, "action", timestamp, prepend);//No I18N
            }
            var day_based_time = time.split("||")[0];
            var $time_separator = $target.find("span[data-name=chat-time-seaparator]:contains('" + day_based_time + "')");
            var time_separator_html = '<div class="chat-msgdate mb15 mt15 tc"><span data-name="chat-time-seaparator">' + day_based_time + '</span></div>';
            var $template = $chat_obj.find(".chat-wrapcont").children().last();
            if (is_from_history || from_channeldetails) {
                $template = $chat_obj.children().last();
            }
            if (prepend) {
                $template.prependTo($target);
                if ($time_separator.length > 0) {
                    $time_separator.parent("div").remove().end().remove(); //No I18N
                }
                $target.prepend(time_separator_html);
            } else {
                if ($time_separator.length == 0) {
                    $target.append(time_separator_html);
                }
                $template.appendTo($target);
                if ($target != undefined) {
                    $target.scrollTop($target.get(0).scrollHeight);
                }
            }
            $template.attr("from", "chat")
            if (sdp_chat.chatPinMessages.hasOwnProperty(id)) {

                if (sdp_chat.chatPinMessages[id].map(a => a.chatinfo_id).includes(chat_infoid)) {

                    $template.addClass("isPinned");
                    $template.attr("data-pin-id", sdp_chat.chatPinMessages[id].find(x => x.chatinfo_id == chat_infoid).pin_id);
                    const $chatUnpin = $template.find("[data-name=pinIcon]");
                    $chatUnpin.attr("title", translate("sdp.common.unpin"));
                    $chatUnpin.find("span").removeClass("cspr icon-sm pin-grey1").addClass("cspr icon-sm unpin-grey");
                }

            }
            if (userid == last_obj_user) {
                $chat_obj.find('[data-timestamp="' + timestamp + '"]').find(".chat-reqname").remove();
                if (cont) {
                    $last_msg.find(".chat-time").remove();
                }
            }
            //For creating hyperlinks
            chat_util.createHyperlinks(txt,$template,type);
            if(type == 'text' && message_info.mentions != null && message_info.mentions.length > 0) {
                chat_util.updateMentionsInMsg($template.find('[data-name="chat-reqques"] span'), message_info.mentions, "html");//No I18N                
            }
            $template.find("[data-type=userProfile]").each(function () {
                if (sdp_user.USERTYPE !== "Requester") {
                    const userId = this.dataset.userid;
                    jQuery(this).off("click.userProfile").on("click.userProfile", function () { //No I18N
                        $previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+userId+'&minContent=true&externalframe=true', translate('sdp.inventory.wsRtPanel.userDetails'), '600px'); //No I18N
                    });
                } else {
                    const $span = jQuery(this).find("span");
                    $span.removeClass();
                    $span.addClass("sb text-color1 p0 cur-def");
                }
            });
            $template.find("[data-name=replyToElem]").off("click.chatBox").on("click.chatBox", function () { chat_actions.replyToMessage(this) }); // NO I18N
            $sdEventListener($template);
            if (!(is_from_history || is_from_scroll || from_recent)) {
                // setting last message ping time
                var last_mesg_ping = $chat_obj.find(".chat-content-wrapper .chat-wrapcont #user_chat_mesg").last().attr("data-timestamp");
                $chat_obj.find(".chat-mini-header").parents('.chatmain-column,.chat-column').find('#last_mesg_ping').text(last_mesg_ping); //No I18N
                // appending last chat message if chats tab is opened
                chtload.appendLastChatMesg(id, trimmed_message, type, user, userid, time);
            }
        }

    },
    replyToMessage: function (msgElem) {
        const $chatmain = jQuery(msgElem).parents(".chatbar-maincontent"); //No I18N
        const chatID = $chatmain.attr("id"); //No I18N
        const $replyToDiv = $chatmain.find("div[data-name=replyTo]");
        $replyToDiv.removeClass("hide");
        const parentMsgDiv = jQuery(msgElem).parents("#user_chat_mesg"); // NO I18N
        const parentMsgId = parentMsgDiv.data("chat_infoid");// NO I18N
        let url = "/chats/" + chatID + "/messages/" + parentMsgId; //No I18N
        let ajax_data = chat_util.constructAjaxData({
            url: url
        });
        sdpAjax(ajax_data).done(function (response) {
            if (chat_util.checkAjaxResponse(response)) {
                $replyToDiv.attr("msg_id", response.chat_info.id);
                let byUserId = parseInt(response.chat_info.user.id);
                let byUserName = response.chat_info.user.name;
                if (sdp_user.LOGGEDIN_USERID === byUserId) {
                    byUserName = translate('common.common.you');
                }
                $replyToDiv.find("[data-name=cht-sender]").text(byUserName);
                $replyToDiv.find("[data-name=cht-msg]").text((response.chat_info.text));
                if(response.chat_info.mentions != null && response.chat_info.mentions.length > 0) {
                    chat_util.updateMentionsInMsg($replyToDiv.find("[data-name=cht-msg]"), response.chat_info.mentions, "html");//No I18N
                }
            }

        });
        $chatmain.find("#chat_input-" + chatID).focus();
    },
    cancelReplyToMessage: function (elem) {
        jQuery(elem).parent().addClass("hide");
    },
    navigateToMessage: function (element) {
        const $chatmain = jQuery(element).parents(".chatbar-maincontent"); //No I18N
        if ($chatmain.length > 0) {
            const chatID = $chatmain.attr("id"); //No I18N
            let parentMsgId = jQuery(element).attr("data-msgId");
            chat_actions.scrollToParentMsg(parentMsgId, chatID);
        }
    },
    /* Scroll to parent msg*/
    scrollToParentMsg: function (parentMsgId, chatId) {
        let $chat_obj = jQuery("#sdp-chat-bar").find("#" + chatId);
        const $parentMsg = $chat_obj.find('div[data-chat_infoid=' + parentMsgId + ']');
        // If the div is found, scroll to it
        if ($parentMsg.length > 0) {
            const rect = $parentMsg[0].getBoundingClientRect();
            $parentMsg[0].scrollIntoView({ behavior: 'smooth' });
            const elementToHighlight = $parentMsg.find(".reply-msg-wrapper").length > 0 ? $parentMsg.find(".reply-msg-wrapper") : $parentMsg.find(".cht-msg");
            elementToHighlight.addClass("backgroundOrange");
            setTimeout(() => {
                elementToHighlight.removeClass("backgroundOrange");
            }, 1000);
        } else {

            let end_index = parseInt($chat_obj.attr("msgEndIndex"));
            let input_data = {
                "list_info": {//No I18N
                    "start_index": end_index + 1, //No I18N
                    "row_count": row_count_global //No I18N
                }
            };
            let url = "";
            input_data.list_info.sort_order = "desc";//No I18N
            input_data.list_info.sort_field = "time";//No I18N
            url = "/chats/" + chatId + "/messages"; //No I18N
            const ajax_data = chat_util.constructAjaxData({
                url: url,
                input: input_data
            });
            sdpAjax(ajax_data).done(function (response) {
                if (chat_util.checkAjaxResponse(response)) {
                    chat_util.processmessages(chatId, response.messages, true, false, true);

                    if (response.list_info.has_more_rows) {
                        const startIndex = response.list_info.start_index;
                        const endIndex = startIndex + response.list_info.row_count - 1;
                        chat_box.bindInfiniteScroll(chatId, startIndex, endIndex, response.list_info.has_more_rows, false);
                        jQuery("#sdp-chat-bar #" + chatId).attr("msgEndIndex", endIndex);
                    }
                    chat_actions.scrollToParentMsg(parentMsgId, chatId);
                }
            });
        }
    },
    /* Show any notification text in chatbox */
    showChatNotice: function (id, txt, type, timestamp, prepend) {
        const $chatBox = jQuery("#sdp-chat-bar #" + id);
        const $target = $chatBox.find(".chat-content-wrapper .chat-wrapcont");
        const len = $target.find("#" + timestamp).length;
        if (len == 0) {
            let className = "chat-addedtech"; // No I18N
            if (type == "welcome") {
                className = "welcome-notice"; // No I18N
            }
            else if (type == 'transfer' || type == 'chat_closed') {
                className = "chat-transferaccpet text-muted tc"; // No I18N
            }
            const workorder_id = $chatBox.find('.chatuserid').find('span').text();
            let close_create_request = false;
            if (type === 'chat_closed' && workorder_id === "" && sdp_user.ROLES.indexOf("CreateRequests") > -1) {
                close_create_request = true;
            }
            let sub_action = false;
            let sub_txt = "";

            let isAddedaction = (txt.match(/\badded\b/g) || []).length > 0 ? true : false;
            if (isAddedaction) {
                /*when bulk userss are added the chat action is huge and + more and -less are added to the chat action to make it expandable and collapsible based o the regex */
                const count_regex = sdp_user.USERTYPE == "Requester" ? /,/g : /<\/a>/g; // No I18N
                /** chataction_memberscount is a global var and defines the number of members to be displayed by default (when 100 users are added only 5 are shown and +more is shown) */
                const reduction = sdp_user.USERTYPE !== "Requester" ? 1 : -1; // No I18N
                const count = (txt.match(count_regex) || []).length - sdp_chat.chataction_memberscount - reduction;
                if (count > 0) {
                    const regcount = sdp_user.USERTYPE !== "Requester" ? sdp_chat.chataction_memberscount + 1 : sdp_chat.chataction_memberscount; // No I18N
                    const text = sdp_user.USERTYPE !== "Requester" ? txt.match("^(?:.*?<\/a>){" + regcount + "}")[0] : txt.match("^(?:.*?,){" + regcount + "}")[0]; // No I18N
                    sub_txt = txt;
                    sub_action = true;
                    txt = text + `<span class="cur-ptr" nonce="` + sdpNonce + `"data-event="click" data-handler="chtload.expandaction(this)"><span class="text-danger mr5">  +${count} ${translate("sdp.common.more")} </span></span>`;
                }
            }
            txt = type === "welcome" ? e_html(txt) : txt;//No I18N
            var input_data = { "id": id, "txt": txt, "type": "action", "action_type": type, "timestamp": timestamp, "prepend": prepend, "close_create_request": close_create_request, "action_class": className, "sdp_user": sdp_user, "sub_action": sub_action, "sub_txt": sub_txt, "msgtype": "received" };// NO I18N
            renderhbs($target, 'message', input_data, true, 'chat/Common/Chat'); // NO I18N

            /* When a new chat message is added scroll up the older messages. */
            if ($target.get(0) != undefined && type !== "new_pin_message") {
                $target.scrollTop($target.get(0).scrollHeight);
            }

        }
    },
    /* New chat message */
    chatNewMessage: function (response) {

        /* Convert string with escape character to object */
        response.message = jQuery.parseJSON(response.message);
        const portalId = response.message.portalid;
        let msgStr = "";
        if (response.message.type === 'note') {
            msgStr = chat_util.unescapeForText(response.message.chat_note.note);
        } else if (response.message.type === 'attachment') {
            msgStr = response.message.attachment.name;
        } else {
            msgStr = response.message.text;
        }
        let recent_msg = msgStr;
        if(response.message.type === 'text' && response.message.recent_message){
            recent_msg = response.message.recent_message;
        }
        let attachment_url = null;
        let attachment_size = null;
        if (response.message.type && response.message.type == "attachment") { //No I18N
            attachment_url = response.message.attachment.content_url;
            attachment_size = response.message.attachment.size.value;
        }
        const chatID = response.id;
        if (!sdp_chat.active_chatids.includes(chatID)) {
            chat_box.loadUserNewChat(chatID, false, portalId);
            chtload.appendLastChatMesg(chatID, recent_msg.trim(), response.message.type, response.message.user.name, response.message.user.id, response.time_str);
        }
        else {
            if (jQuery("#sdp-chat-bar").find("#" + chatID).find(".chat-content-wrapper").attr("pin-messages") !== 'true') {
                chat_actions.showChatMessage(chatID, response.chat_infoid, response.message.user.name, response.message.user.id, msgStr, response.time_str, response.time, response.message.type, attachment_url, false, attachment_size, false, recent_msg.trim(), false, false, false, response.message);
            }
        }
        /**
         * Reinitialize the Attachment preview
         */
        chat_util.reinitateATP();

    },
    /* Method for checking the input file size */
    checkFileSize: function (file) {
        const fileSize = file.size;
        if (fileSize > sdp_app.MAX_FILE_SIZE * 1024 * 1024) {
            return true;
        }
        return false;
    },
    /* Upload attached image */
    chatattachimgfn: function (e, a) {
        const $this_obj = jQuery(a);
        const $chatmain = $this_obj.parents(".chatbar-maincontent"); //No I18N
        const chatID = $chatmain.attr("id"); //No I18N
        const portal_id = $chatmain.attr("data-portalid"); //No I18N
        let current_ts = Date.now();
        let filex = e.dropFile || e.target.files || e.target.src;
        if (!filex) {//for ie9
            return;
        } else {
            var f = filex[0];
            if (f != null) {
                if (!chat_actions.checkFileSize(f)) {

                    var ajax_data = new FormData();
                    for (var i = 0; i < filex.length; i++) {
                        current_ts = Date.now();
                        ajax_data.append('input_file', filex[i], filex[i].name);
                    }
                    var attachUrl = "/api/v3/chats/" + chatID + "/messages/upload"; //No I18N
                    attachUrl = chtload.appendPortalParam(attachUrl, portal_id);
                    sdpAjax({
                        url: attachUrl,
                        type: "POST", //No I18N
                        method: "POST", //No I18N
                        processData: false,
                        contentType: false,
                        data: ajax_data
                    }).done(function (response) {
                        if (response.response_status.status == "failed") {
                            let error_mesg = "";
                            response.response_status.messages.forEach(function (item, index, arr) {
                                error_mesg = error_mesg !== "" ? error_mesg + "</br>" + item.message : item.message;
                            });
                            if (!is_external_chat) {
                                showalert('failure', error_mesg, "isAutoHide=false"); // No I18N
                            } else {
                                alert(error_mesg);
                            }
                        } else {

                            // The message will be populated from poll.
                            // Poll is loaded first in case of attachment
                            var attachmentId = response.attachment.id;
                            var input_data = {
                                "chat_info": { // No I18N
                                    "type": "attachment", // No I18N
                                    "attachments": { // No I18N
                                        "id": attachmentId // No I18N
                                    }
                                }
                            };
                            let messagesUrl = "/chats/" + chatID + "/messages"; //No I18N
                            messagesUrl = chtload.appendPortalParam(messagesUrl, portal_id);
                            let ajax_data = chat_util.constructAjaxData({
                                url: messagesUrl,
                                type: "POST", // No I18N
                                input: input_data
                            });
                            sdpAjax(ajax_data).done(function (response) {
                                if (response.response_status.status == "failed") {
                                    chtload.showAjaxError(response.response_status.messages);
                                } else {
                                    $this_obj.val('');
                                }
                            });

                        }
                    }).fail(function (response) {
                        var resp = response.responseJSON;
                        if (resp.response_status.status == "failed") {
                            var error_mesg = "";
                            resp.response_status.messages.forEach(function (item, index, arr) {
                                if (error_mesg !== "") {
                                    error_mesg = error_mesg + "</br>" + item.message;
                                }
                                else {
                                    error_mesg = item.message;
                                }
                            });
                            if (!is_external_chat) {
                                showalert('failure', error_mesg, "isAutoHide=false"); // No I18N
                            } else {
                                alert(error_mesg);
                            }
                        }
                    });
                } else {
                    let error_mesg = translate("api.chat.attachment.upload.size.failed", [sdp_app.MAX_FILE_SIZE + "MB"]);
                    if (!is_external_chat) {
                        showalert('failure', error_mesg, "isAutoHide=false"); // No I18N
                    } else {
                        alert(error_mesg);
                    }
                    $this_obj.val('');

                }
            }
        }
    },
    /* Include visual notifications like chat sound, chat box header blinking, tab title toggling in this function. */
    /* Use visibly.js logic here for maintaining UX sanity across tabs. */
    notifyUser: function ($column, isMaster, id, user, mesg) {
        let counter = 0;
        /* Chat box header blinking */
        let chat_class = '.chat-header1'; //No I18N
        if (id !== "") {
            chat_class = '.chat-mini-header, .chat-header1'; //No I18N
        }
        let header_interval = setInterval(function () {
            $column.find(chat_class).toggleClass("backgroundOrange"); //No I18N
            counter++;
            if (counter == 6) {
                clearInterval(header_interval);
            }
        }, 100);
        $column.find(chat_class).addClass("backgroundOrange");
        if (is_external_chat) {
            changeWindowTitle(translate("chat.new.message"));
        }
        else if (isMaster && sdp_chat.title_interval == null) {
            /* Tab title toggling */
            sdp_chat.title_interval = setInterval(function () {
                var title = (document.title == browserTitleText) ? translate("chat.new.message") : browserTitleText;  //No I18N
                document.title = title;
            }, 900);

        }

        /* Change to default background once clicked on the respective chat box. */
        $column.off("click") //No I18N
            .on("click", function () {
                chat_box.changeDocTitle($column, id, true);
            })
            .find(".chattxt").on('keypress', function () {
                chat_box.changeDocTitle($column, id, true);
            });
    },
    /* Common function for contructing portal param iff user is on other portal */
    appendPortalParam: function (url, portalid) {
        if (portalid !== undefined && portalid != PORTALID) {
            url = url + "?PORTALID=" + portalid; // No I18N
        }
        return url;
    },
    getUserChatMessages: function (data) {
        const chatId = data.id;
        const portalId = data.message.portalid;
        if (chat_box.getActiveChatIndex(chatId) < 0) {
            chat_box.loadUserNewChat(chatId, false, portalId);
            chat_actions.notifyUser(jQuery("#sdp-chat-bar").find("#" + chatId), false, chatId);
            return;
        }
        let last_time = jQuery("#sdp-chat-bar").find("#" + chatId).find("#last_mesg_ping").text();
        if (last_time !== undefined && last_time.trim() != "" && parseInt(data.time) > parseInt(last_time)) {
            var input_data = {
                "list_info": {// No I18N
                    "time_stamp": "" // No I18N
                }
            };
            input_data.list_info.time_stamp = last_time;
            let url = "/chats/" + chatId; //No I18N
            url = chtload.appendPortalParam(url, portalId);
            let ajax_data = chat_util.constructAjaxData({
                url: url,
                input: input_data
            });
            let last_userid = null;
            sdpAjax(ajax_data).done(function (response) {
                if (chat_util.checkAjaxResponse(response)) {
                    response.chat.messages = response.chat.messages.reverse();
                    last_userid = chat_util.processmessages(chatId, response.chat.messages, false, false, isfrom);
                    if (last_userid != null && last_userid != sdp_user.LOGGEDIN_USERID) {
                        chat_actions.notifyUser(jQuery("#sdp-chat-bar").find("#" + chatId), true, chatId);
                    }
                }
            });
        }
    },
    selectTechs: function (entity, entity_id) {
        jQuery("#selective_tech_box").removeClass('hide');
        jQuery("#tech_list").addClass('hide');
        jQuery("#start_quick_chat").addClass('hide');

        var req_chat_title = jQuery("#request-id").text() + ' ' + jQuery("#req_subject").text();
        if (is_edit_page === "editWO") {
            req_chat_title = "#" + woID + " " + jQuery("#subject_control").find('.form-control').val();
        }
        jQuery("#req_chat_title").val(req_chat_title);
        let users = []
        let techsList = chtload.getTechnicianList();
        let tech_len = techsList.length;
        for (var i = 0; i < tech_len; i++) {
            var tech = {};
            tech.text = techsList[i].name;
            tech.id = techsList[i].id;
            if (tech.id != sdp_user.LOGGEDIN_USERID) {
                users.push(tech);
            }
        }
        jQuery("#selective_tech_box #cust_box").select2({
            multiple: true,
            width: 250,
            data: users
        }).val(pagenotif.req_viewing_tech_ids).trigger('change');
    },
    selectTechsCancel: function () {
        jQuery("#selective_tech_box").addClass('hide');
        jQuery("#tech_list").removeClass('hide');
        jQuery("#start_quick_chat").removeClass('hide');
    },
    startCollaboratorschat: function (entity, entity_id) {
        var req_chat_title = jQuery("#request-id").text() + ' ' + jQuery("#req_subject").text();
        if (is_edit_page === "editWO") {
            req_chat_title = "#" + woID + " " + jQuery("#subject_control").find('.form-control').val();
        }

        jQuery("#req_chat_title").val(req_chat_title);
        let users = []
        let techsList = chtload.getTechnicianList();
        let tech_len = techsList.length;
        for (var i = 0; i < tech_len; i++) {
            var tech = {};
            tech.text = techsList[i].name;
            tech.id = techsList[i].id;
            if (tech.id != sdp_user.LOGGEDIN_USERID) {
                users.push(tech);
            }
        }
        jQuery("#selective_tech_box #cust_box").select2({
            multiple: true,
            width: 250,
            data: users
        }).val(pagenotif.req_viewing_tech_ids).trigger('change');
        chat_actions.startEntityChat(entity, entity_id);
    },
    /* Method for starting a new entity chat technician chat/group chat/collaborators chat etc */
    startEntityChat: function (entity, entityId, input_data) {
        var url = "/chats"; //No I18N
        if (input_data == null) {
            input_data = {};
            let entityObj = {};
            entityObj[entity] = { "id": entityId };
            if ("request" == entity) {
                delete entityObj[entity];
                entityObj.request_chat_association = { "request": { "id": entityId } }; // No I18N
                let chatTitle = jQuery("#req_chat_title").val();
                let selectedTechs = jQuery("#selective_tech_box #cust_box").select2('val'); //No I18N
                if (!chatTitle) {
                    window.showalert('warning', translate("sdp.common.titleerrormessage"), "isAutoHide=true"); //No I18N
                    jQuery("#req_chat_title").focus();
                    return false;
                }
                if (selectedTechs.length == 0) {
                    window.showalert('warning', translate("sdp.common.emptymessage", [translate("sdp.admin.leftpanel.users.technician")]), "isAutoHide=true"); //No I18N
                    jQuery("#cust_box").select2("open"); //No I18N
                    return false;
                }
                chat_actions.selectTechsCancel();
                selectedTechs.push(sdp_user.LOGGEDIN_USERID + '');
                var selectedTechObjects = [];
                for (var i = 0; i < selectedTechs.length; i++) {
                    selectedTechObjects.push({ "id": selectedTechs[i] });
                }
                entityObj.technician_list = selectedTechObjects;
                if (chatTitle.length > 250) {
                    chatTitle = chatTitle.slice(0, 250);
                }
                entityObj.title = chatTitle;
            }
            if ("technician" == entity) {
                delete entityObj[entity];
                entityObj[entity] = { "id": entityId };
            }
            input_data.chat = entityObj;
        }
        if ("fluid_group_chat" == entity) {
            url = "/chats/" + entityId + "/_new_group"; //No I18N
        }

        var ajax_data = chat_util.constructAjaxData({
            url: url,
            type: "POST", // No I18N
            input: input_data
        });
        sdpAjax(ajax_data).done(function (response) {
            if (chat_util.checkAjaxResponse(response)) {
                const chatID = response.chat.id;
                if (sdp_chat.active_chatids.indexOf(chatID) > -1) {
                    chat_box.highlightChatPopUp(chatID);
                    chat_box.focusChatTextArea(chatID);
                }
            }
        }).fail(function (response) {
            chat_util.checkAjaxResponse(response.responseJSON);
        });
    },
    /*Method for loading the members for adding to the group chat*/
    getMembersToAdd: function (chatId, term) {
        let users = "";
        let input_data = {};
        if (term != '') {
            input_data.search_tag = term;
        }
        var ajax_data = chat_util.constructAjaxData({
            url: "/chats/" + chatId + "/_get_members_toadd", //No I18N
            input: input_data
        });
        sdpAjax(ajax_data).done(function (response) {
            if (chat_util.checkAjaxResponse(response)) {
                users = response.chat.users;
            }
        });
        return users;
    },
    getUsersForMention: function (chatId, term) {
        let users = [];
        let input_data = {};
        if (term != '') {
            input_data.search_tag = term;
        }
        var ajax_data = chat_util.constructAjaxData({
            url: "/chats/" + chatId + "/_get_members_for_mention", //No I18N
            input: input_data
        });
        if (sdp_user.USERTYPE == "Requester") {
            let channelId = jQuery("#sdp-chat-bar #" + chatId).attr("data-channelid");
            ajax_data = chat_util.constructAjaxData({
                url: "/channels/" + channelId + "/users" //No I18N
            });
        }
        sdpAjax(ajax_data).done(function (response) {
            if (chat_util.checkAjaxResponse(response)) {
                if (sdp_user.USERTYPE == "Requester") {
                    users = response.users;
                } else {
                    users = response.chat.users;
                }
            }
        });
        users = users.filter(user =>
            sdp_user.USERTYPE == "Requester" ? user.member.id !== sdp_user.LOGGEDIN_USERID.toString() : user.id !== sdp_user.LOGGEDIN_USERID.toString() //No I18N
        );
        if (sdp_user.USERTYPE == "Requester") {
            users = users.map(user => {
                user.member.status = user.status; // Update member status to user status
                return user;
            });
        }
        return users;
    },
    addNewCollaborator: function (a) {
        chat_actions.addNewMember(jQuery(a).attr("data-chatid"), jQuery(a).attr("data-techid"), jQuery(a).attr("data-techname"));
    },
    /* Method for adding a new member to the existing chat */
    addNewMember: function (chatID, techId, techName) {
        let input_data = {
            "chat": { // No I18N
                "technician": { // No I18N
                    "id": techId //No I18N
                }
            }
        }
        let ajax_data = chat_util.constructAjaxData({
            url: "/chats/" + chatID + "/_add_member", //No I18N
            type: "PUT", // No I18N
            input: input_data
        });

        sdpAjax(ajax_data).done(function (response) {
            if (chat_util.checkAjaxResponse(response)) {
                closeDialog();
                const $chatbox = jQuery("#sdp-chat-bar").find("#" + chatID);
                if ($chatbox.length !== 0) {
                    chat_entity = $chatbox.attr("data-chat-entity");
                }
                if (chat_entity !== "channel") {
                    //converting to group chat is done through web socket and is avoided here to reduce unneccessary calls
                    notifications.convertToGroupChat(chatID, techId);
                }
            }
        }).fail(function (response) {
            chat_util.checkAjaxResponse(response.responseJSON);
        });
    },
    /* Method for creating a new members group chat */
    createNewGroupChat: function (chatID, techId) {
        let input_data = {
            "chat": { // No I18N
                "technician": { // No I18N
                    "id": techId //No I18N
                }
            }
        }

        chat_actions.startEntityChat("fluid_group_chat", chatID, input_data); //No I18N
        closeDialog();
    },
    /* Method for adding new members to the chat */
    addNewMembers: function (a) {
        const $this_obj = jQuery(a);
        const chatID = $this_obj.parents('.chatbar-maincontent').attr("id");
        jQuery("#sdp-chat-bar").find("#" + chatID).find("#chat_input-"+chatID).trigger('focus');
        const chatInput = jQuery("#sdp-chat-bar").find("#" + chatID).find("#chat_input-"+chatID);
        chatInput.html('+');
        // Place cursor after the + symbol
        const range = document.createRange();
        const selection = window.getSelection();
        const textNode = chatInput[0].firstChild;
        range.setStart(textNode, 1); // Position after +
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        chat_actions.suggestAddMembers(chatID, true);
    },
    leaveGroupChat: function (chatId) {
        let ajax_data = chat_util.constructAjaxData({
            url: "/chats/" + chatId + "/_leave", //No I18N
            type: "PUT" // No I18N
        });
        let total_users_count = jQuery("#sdp-chat-bar").find("#" + chatId).find("#group_users_count").attr("data-total-users-count");

        sdpAjax(ajax_data).done(function (response) {
            if (chat_util.checkAjaxResponse(response)) {
                const $chatObj = jQuery("#sdp-chat-bar").find("#" + chatId);
                const chat_entity = $chatObj.attr("data-chat-entity");
                if (chat_entity === 'collaborators_chat') {
                    var request_id = $chatObj.attr("data-woid");
                    if (jQuery("#start_quick_chat").length > 0 && woID == request_id) {
                        content = "<div class='chat-link text-dark'><span class='cspr flat icon-sm wechat opac5 mr5'></span>" + translate("chat.one.active.chat") + "<span class='fr a-tag' data-name='joinCollabChat'>" + translate('chat.join') + "</span></div>";
                        jQuery("#start_quick_chat").html(content);
                        jQuery("#start_quick_chat").find("[data-name='joinCollabChat']").on("click.collabContainer", function () {
                            chat_actions.joinChat(chatId, request_id);
                        });
                        if (parseInt(total_users_count) == 1) {
                            var onStartChat = 'chat_actions.startCollaboratorschat("request",' + woID + ')'; //NO I18N
                            var onManageBtn = 'chat_actions.selectTechs("request",' + woID + ')'; //NO I18N
                            /* Changing 1 Active chat view to Start Chat/Manage Button format when all users left from the collaborators chat */
                            content = "<div><button class='btn btn-primary btn-sm' type='button' data-name='startChtBtn'>" + translate("common.chat.start") + "</button>"; //NO I18N
                            content += "<button class='btn-link ml5' data-name='manageBtn'>" + translate("common.manage") + "</button></div>";
                            jQuery("#start_quick_chat").html(content);
                            jQuery("#start_quick_chat").find("[data-name='startChtBtn']").on("click.collabContainer", function () {
                                chat_actions.startCollaboratorschat("request", woID); //No I18N
                            });
                            jQuery("#start_quick_chat").find("[data-name='manageBtn']").on("click.collabContainer", function () {
                                chat_actions.selectTechs("request", woID); //No I18N
                            });
                        }
                    }
                }
                if (jQuery("#sdp-chat-bar").find("#user_chats").parent('li').attr('class') === 'active') {
                    chtload.getUserChats("recent-chats", "my_recent_chats"); // No I18N
                    chtload.getUserChats("unread-chats", "unread_chats"); //No I18N
                    chtload.showHideNoChatNotifDiv();
                }
            }
        }).fail(function (response) {
            chat_util.checkAjaxResponse(response.responseJSON);
        });
    },
    //leave group confirmation pop up
    leaveGroupConfirmation: function (a) {
        let $this_obj = jQuery(a);
        let chatId = $this_obj.parents('.chatbar-maincontent').attr("id");

        function leaveGrp(boo, btn) {
            if (boo) {
                if (btn == 'submitButton') {
                    chat_actions.leaveGroupChat(chatId);
                }
            }
        }
        let message = translate("common.chat.leave.message");
        showconfirm(true, 'title=' + translate("common.confirm") + ', message=' + message + ', submitbutton=' + translate("common.chat.leave") + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', leaveGrp); //No I18N
    },
    /* Method to suggest members for adding to the group chat */
    suggestAddMembers: function (chatId, autoOpen) {
        let element = jQuery("#sdp-chat-bar").find("#" + chatId).find('[data-chatid="' + chatId + '"]');
        let regexp = /\+([\-+\w\s]*)$/;
        let options = {};
        let stratergy = {};
        let stratergy_mention = {};

        options.dropdownClassName = "sdmenu-dd textcomplete-dropdown chat-bar"; //NO I18N
        options.placement = 'top';  //NO I18N

        if (sdp_user.USERTYPE == "Requester") {
            return;
        }


        stratergy.search = function (term, callback) {
            const chat_entity = jQuery("#sdp-chat-bar").find("#" + chatId).attr("data-chat-entity");
            let searchVariable = chat_actions.getMembersToAdd(chatId, term);
            //api call to get techns"
            if (searchVariable !== "") {
                callback(jQuery.map(searchVariable, function (messageVar) {
                    if (messageVar.name.toLowerCase().indexOf(e_html(term.replace(/\s/g, ' ').toLowerCase())) >= 0 || messageVar.name.toLowerCase().indexOf(e_html(term.replace(/\s/g, ' ').toLowerCase())) >= 0) {
                        return messageVar;
                    } else {
                        return null;
                    }
                }
                ));
            }
        };

        stratergy.replace = function (value) {
            let userId = value.id;
            let user_name = value.name;

            function addMember(boo, btn) {
                if (boo) {
                    if (btn == 'submitButton') {
                        chat_actions.addNewMember(chatId, userId, user_name);
                    }
                    if (btn == 'submitButton2') {
                        chat_actions.createNewGroupChat(chatId, userId);

                    }
                    jQuery("#sdp-chat-bar").find("#" + chatId).find('.chattxt').html('');
                }
            }
            let message = translate("common.chat.add.member.warning", [e_html(user_name), e_html(user_name)]);
            const channel_msg = translate("channel.add.member.message");
            const chat_entity = jQuery("#sdp-chat-bar").find("#" + chatId).attr("data-chat-entity");
            if (chat_entity == "channel") {
                showconfirm(true, 'title=' + translate("common.confirm.submit") + ',message=' + channel_msg + ', submitbutton=' + translate("common.add") + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', addMember); //No I18N
            }
            else {
                showconfirm(true, 'title=' + translate("common.confirm.submit") + ', message=' + message + ', submitbutton=' + translate("common.add") + ', submitbutton2=' + translate("common.createnew") + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', addMember); //No I18N
            }
        };

        stratergy.template = function (value) {
            let user_status = "avaicon mr5"; //No I18N
            if (value.status === 'offline') {
                user_status = "waiticon mr5"; //No I18N
            }
            return '<span class="' + user_status + '"></span>' + e_html(value.name);
        };
        options.stratergy = stratergy;
        autoSuggestion(element, "", regexp, options);
        if (autoOpen) {
            setTimeout(function () {
                element.data('textComplete').trigger(); //No I18N
            }, 100);

        }
    },
    /* Method to suggest members for mentioning user */
    suggestToMentionMembers: function (chatId, autoOpen) {
        let element = jQuery("#sdp-chat-bar").find("#" + chatId).find('[data-chatid="' + chatId + '"]');
        let regexp = /\@([\-@\w]*)$/;
        let options = {};
        let stratergy_mention = {};
        let lastSearchTerm = null;
        let isSuggestionsAvailable = true;

        options.dropdownClassName = "sdmenu-dd textcomplete-dropdown chat-bar"; //NO I18N
        options.placement = 'top';  //NO I18N

        const chat_entity = jQuery("#sdp-chat-bar").find("#" + chatId).attr("data-chat-entity");
        if (chat_entity == "channel") {
            let searchTerm = "";

            stratergy_mention.search = function (term, callback) {
                let matches = term.match(regexp);
                if (matches != null) {
                    term = matches[1];
                }
                if (term === '' || term.length < (lastSearchTerm ? lastSearchTerm.length : 0)) {
                    lastSearchTerm = null;
                    isSuggestionsAvailable = true;
                }
                let index = term.indexOf(lastSearchTerm);
                let searchVariable = [];
                if (term == "" || index !== -1 || (isSuggestionsAvailable && index == -1)) {
                    searchVariable = chat_actions.getUsersForMention(chatId, term);
                }
                if (Array.isArray(searchVariable)) {
                    callback(jQuery.map(searchVariable, function (messageVar) {
                        if (sdp_user.USERTYPE == "Requester") {
                            messageVar = messageVar.member;
                        }
                        if (messageVar.name.toLowerCase().indexOf(e_html(term.replace(/\s/g, ' ').toLowerCase())) >= 0 || messageVar.name.toLowerCase().indexOf(e_html(term.replace(/\s/g, ' ').toLowerCase())) >= 0) {
                            return messageVar;
                        }
                    }
                    ));
                }
                isSuggestionsAvailable = searchVariable.length > 0;
                lastSearchTerm = term;
                initTooltip(".sdmenu-dd.textcomplete-dropdown.chat-bar");//NO I18N
            };

            stratergy_mention.replace = function (value) {
                let userId = value.id;
                let userName = value.name;
                // Find the start index of the mention
                let textAreaElem = jQuery("#sdp-chat-bar").find("#" + chatId).find('.chattxt');
                let text = textAreaElem.html();
                let cursorPos = chat_actions.getCursorPositionInContentEditable(textAreaElem[0]);
                const htmlText = chat_actions.getTextBeforeCursor(textAreaElem[0]);
                if (cursorPos < htmlText.length) {
                    cursorPos = htmlText.length;
                }
                let atIndex = text.lastIndexOf('@', cursorPos);
                if (atIndex === -1) { atIndex = 0; }
                if (!chat_actions.isChatMember(chatId, userId) && sdp_chat.active_channelactions[chatId].includes("add_member")) {
                    const message = translate("chat.new.member.add.suggestion", [e_html(userName), e_html(userName)]);
                    function addMember(boo, btn) {
                        if (boo) {
                            if (btn == 'submitButton') {
                                chat_actions.addNewMember(chatId, userId, userName);
                            }
                        }
                    }
                    showconfirm(true, 'title=' + e_html(translate("common.confirm.submit")) + ', message=' + message + ', submitbutton=' + translate("common.add") + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', addMember); //No I18N
                }
                const uniqueId = `${userId}-${Date.now()}`;
                // Replace @username with the span element
                element.html(function (_, html) {
                    return html.slice(0, atIndex) +
                        `<span contenteditable='false' data-name='mentionedUser' data-id='${uniqueId}' data-userId='${userId}'>@${e_html(userName)}</span>&nbsp;` +
                        html.slice(cursorPos);  // Add remaining text after the mention
                });

                const range = document.createRange();
                const selection = window.getSelection();
                const mentionedSpan = element.find(`span[data-id='${uniqueId}']`).get(0);
                // Create a range to place the cursor right after the span
                range.setStart(mentionedSpan.nextSibling, 1);
                range.collapse(true);

                // Remove any existing selections
                selection.removeAllRanges();

                // Add the new range to the selection
                selection.addRange(range);
                chat_actions.addMentionedUserToChat(chatId, userId, userName);
            };

            stratergy_mention.template = function (value) {
                let user_status = "avaicon mr5"; //No I18N
                if (value.status === 'offline') {
                    user_status = "waiticon mr5"; //No I18N
                }
                return '<span class="' + user_status + '"></span>' + 
'<span class="disp-ib text-overflow maxw-140px vmiddle" title="'+ e_html(value.name) +'" rel="uitip" mode_ellipsis="true">'+e_html(value.name)+'</span>';
            };
            options.stratergy = stratergy_mention;
            autoSuggestion(element, "", regexp, options);
        }
        if (autoOpen) {
            setTimeout(function () {
                element.data('textComplete').trigger(); //No I18N
            }, 100);

        }
    },
    /* Method to get the user Onclik function in NewWindow*/
    getUserOnClickFn: function (userId) {
        return function() {
            $previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+userId+'&minContent=true&externalframe=true', translate('sdp.inventory.wsRtPanel.userDetails'), '600px'); //No I18N
        }
    },

    /* Method to return user href link */
    getUserHrefLink: function (userId, userName) {
        return (userId == sdp_user.LOGGEDIN_USERID || userId == sdp_user.SYSTEM_USERID) ? 
            e_html(userName) : 
            "<a class='text-link' nonce='" + sdpNonce + "' data-event='click' data-handler='chat_actions.getUserOnClickFn(" + userId + ")()'><span class='text-link'>" + e_html(userName) + "</span></a>";
    },
    /* Method for removing the user from the chat */
    removeUserFromChat: function (response) {
        response.message = jQuery.parseJSON(response.message);
        chat_box.removeActiveChat(response.id);
        let mesg = translate("chat.new.member.removed.by", [chat_actions.getUserHrefLink(response.message.by_user.id, response.message.by_user.name), translate("common.common.you")]);
        chat_actions.showChatNotice(response.id, mesg, "member_removed", response.time, false);  //No I18N
        chat_actions.removeActionsAndTextArea(response.id, response.status === 'Completed');//No I18N
        jQuery("#sdp-chat-bar #" + response.id).find("#group_users_count").remove();
        jQuery("#sdp-chat-bar #" + response.id).find("#usersCount").remove();
    },
    /* Method for adding the user to the chat */
    addUserToChat: function (response) {
        response.message = jQuery.parseJSON(response.message);
        chat_box.removeActiveChat(response.id);
        chat_box.closeChatBox(response.id);
        chat_box.loadUserNewChat(response.id);
    },
    /* Method to get the chats shared b/w the user -> common chats */
    getCommonChats: function (a) {
        const $this_obj = jQuery(a);
        const techId = $this_obj.parents('.chatbar-maincontent').attr('data-userid'); //No I18N
        const userName = $this_obj.parents('.chatbar-maincontent').attr('data-user'); //No I18N
        const title = translate("chat.recent.chats.user", [e_html(userName)]);
        jQuery('body').append('<div id="common-chats"></div>');
        jQuery('#common-chats').dialog({
            'modal': true,//NO I18N
            'title': title,//NO I18N
            'width': 800,//NO I18N
            'height': 800,//NO I18N
            'position': { my: "center", at: "center", of: window },//NO I18N
            'resizable': false,//NO I18N
            'draggable': true,//NO I18N
            'closeOnEscape': true, //NO I18N
            open: function (event, ui) {
                var ele = jQuery(event.target);
                ele.css({ 'height': '100%' });// No I18N
                function codeblock() {
                    let input_data = {}
                    renderhbs('#common-chats', 'chat-history', input_data, true, 'chat/Technician/ChatOperations'); // NO I18N
                    document.getElementById('common-chats').setAttribute("is_from_common_chats", techId);
                    chtload.openChatHistory();
                }
                if (!sdp_chat.technician_chatops_hbs) {
                    ResourceLoader({
                        js: ["/scripts/hbs-template-technician-chatoperations.js"], // No I18N
                        success: function () { sdp_chat.technician_chatops_hbs = true; codeblock(); }
                    });
                }
                else { codeblock(); }
            },
            close: function (event, ui) {
                jQuery('#common-chats').remove();
            }
        });

    },
    /* Method for converting the tech to tech chat / group chat to group chat, if a new member is added to the group */
    convertToGroupChat: function (chatID, techId) {

        let ajax_data = chat_util.constructAjaxData({
            url: "/chats/" + chatID //No I18N
        });
        sdpAjax(ajax_data).done(function (response) {
            if (chat_util.checkAjaxResponse(response)) {
                const title = response.chat.title;
                chat_box.addActiveMembersCount(chatID);
                const $chat = jQuery("#sdp-chat-bar #" + chatID);
                chat_box.setChatGroupIcon(chatID);
                $chat.removeAttr('data-userid')
                $chat.removeAttr('data-user')
                $chat.attr("data-chat-entity", response.chat.entity_str)
                $chat.attr("data-title", e_attr(title))
                $chat.find(".chatusrnameact").text(title).end()
                    .find("#user_status").remove().end()
                    .find("#edit_chat_title").on('click', function () { chat_box.chateditusrname(this) }).end()
                    .find("#common_chats").remove()
                if ($chat.find("#actions-" + chatID).find("#leave_group").length < 1) {
                    $chat.find("#actions-" + chatID).append(`<li id="leave_group" class=""><span data-channelid="" data-title="" class="a-tag-sdmenu">` + translate("common.chat.leave.group") + `</span></li>`);
                    $chat.find("#actions-" + chatID).find("#leave_group span").on("click.chatBox", function () {
                        chat_actions.leaveGroupConfirmation(this);
                    });
                }
                $chat.find("#edit_chat_title").parent().prepend(`<input type="text" data-input="title_rename" value="" class="chatusrname-inp form-control hide" maxlength="250" data-chat-id="${chatID}">`);
                $chat.find("[data-input='title_rename']").on("keypress.chatBox", function (event) {
                    chat_box.chatusrname(event, this);
                });
                if (jQuery("#sdp-chat-bar").find("#user_chats").parent('li').attr('class') === 'active') {
                    const $recentObj = jQuery("#sdp-chat-bar").find('#recent-chats');
                    const chat_len = $recentObj.find('[data-chatid="' + chatID + '"]').length;
                    if (chat_len > 0) {
                        const $el = $recentObj.find('[data-chatid="' + chatID + '"]').find('.chat-dp').parent();
                        $el.find('.chat-dp').remove();
                        $el.prepend(`<div class="chat-dp"> <div class="chat-no-dp"> <svg width="22" height="22" class="thmicon-fill"> <use href="#group_icon"></use> </svg> </div> </div>`);
                        $recentObj.find('[data-chatid="' + chatID + '"]').find("#chat_title").text(title);
                    }
                }
                $chat.find("input[data-input=title_rename]").on("focusout", function () {
                    chat_box.chateditFocusOut(this);
                });
                // Removing add new member notificaiton
                chat_box.removeAddTechNotice(chatID, techId);

            }
        });


    },
    /* Method for suggesting the adding new collaborator to the existing collaboratros chat if chat exist */
    suggestNewCollaboratorToAdd: function (woId, techId, techName) {
        const chatId = jQuery("#sdp-chat-bar").find("[data-woid='" + woId + "']").attr("id");
        //checking if the logged in user's chat bar is enabled or not
        const chatTextArea = jQuery("#sdp-chat-bar #" + chatId).find('.chattxt').attr('disabled');
        if (typeof chatTextArea != "undefined" && chatTextArea == "disabled") {
            return false;
        }
        if (chatId !== undefined) {
            let $obj = jQuery("#sdp-chat-bar #" + chatId).find(".chat-header1");
            let user_len = $obj.find(".sdmenu-dd2 [data-userid='" + techId + "']").length;
            if (user_len == 0) {
                let onclickFn = 'chat_actions.addNewCollaborator(this)'; //NO I18N
                let cancelFn = 'chat_actions.cancelAddMemberMesg(this)'; //NO I18N
                let message = translate("chat.new.member.add.suggestion", [chat_actions.getUserHrefLink(techId, techName), chat_actions.getUserHrefLink(techId, techName)]);
                message = message + "<div class='mt3'><button data-chatid=" + chatId + " data-techid=" + techId + " data-techname='" + e_attr(techName) + "' class='btn btn-primary btn-xs mr10' data-event='click' nonce='" + sdpNonce + "' data-handler='" + onclickFn + "'>" + translate("common.add") + "</button> <button class='btn btn-default btn-xs' nonce='" + sdpNonce + "' data-event='click' data-handler='" + cancelFn + "'>" + translate("common.cancel") + "</button></div>";
                chat_actions.showChatNotice(chatId, message, "new_collaborator_member", techId, false);  //No I18N
            }

        }
    },
    /* Method for cancelling the add new member suggestion in collaborators chat */
    cancelAddMemberMesg: function (a) {
        jQuery(a).parents("#user_chat_mesg").remove(); //No I18N
    },
    /* Method for user joining the chat, this will happen in case of collaborators chat only */
    joinChat: function (chatId, pagewoID) {
        chat_box.closeChatBox(chatId);
        let ajax_data = chat_util.constructAjaxData({
            type: "PUT", //No I18N
            url: "/chats/" + chatId + "/_join" //No I18N
        });
        sdpAjax(ajax_data).done(function (response) {
            if (chat_util.checkAjaxResponse(response)) {
                chtload.openRecentChat(chatId);
                if (woID == pagewoID) {
                    chat_box.changeQuickStartChatAction(chatId);
                }
            }
            if (jQuery("#sdp-chat-bar #user_chats").parent('li').attr('class') === 'active') {
                chtload.getUserChats("recent-chats", "my_recent_chats"); //No I18N
                chtload.showHideNoChatNotifDiv();
            }
        }).fail(function (response) {
            chat_util.checkAjaxResponse(response.responseJSON);
        });
    },
    /* Method for removing the add new user suggestion from the collaborators chat if exist when user is left out from the request page */
    removeAddUserSuggestion: function (woId, userId) {
        const chatId = jQuery("#sdp-chat-bar [data-woid='" + woId + "']").attr("id");
        if (chatId !== undefined) {
            // Removing the add new tech message if exists
            chat_box.removeAddTechNotice(chatId, userId);
        }
    },
    /* The actions related to channels are redirected from this method */
    performchannelaction($element, action_type) {
        if (action_type == "channel_info") {
            redirect.viewChannelDetails($element, false);
        }
        else if (action_type == "leave_channel") {
            sdp_channels.leaveChannel($element, "actions");// NO I18N
        }
        else if (action_type == "add_member") {
            sdp_channels.addParticipantsToChannel($element, "actions");// NO I18N
        }
        else if (action_type == "archive_channel") {
            sdp_channels.getarchivenote($element, "actions");// NO I18N
        }
        else if (action_type == "delete_channel") {
            sdp_channels.deletechannel($element, "actions");//No I18N
        }
        else if (action_type == "share_link") {
            sdp_channels.copyLinktoclipboard($element);
        }
    },
    /**Pinned Messages tab in the chatbox is loaded from this method  */
    viewPinMessages(a) {
        const $chatbar = jQuery(a).parents().closest("div.chatbar-maincontent");//No I18N
        const chatId = $chatbar.attr("id");//No I18N
        const $target = jQuery(a).closest("div.chat-wrapper");//No I18N
        const title = $chatbar.attr("data-title");//No I18N

        let pin_count = $target.find("#chat-pin-msg").attr("pin-count");
        if (pin_count >= 1) {
            var input_data = {
                "list_info": { //No I18N
                    "row_count": "25" //No I18N
                }
            }
            var ajax_data = chat_util.constructAjaxData({
                url: "/chats/" + chatId + "/pin_messages", //No I18N
                input: input_data
            });
            sdpAjax(ajax_data).done(function (response) {
                if (chat_util.checkAjaxResponse(response)) {
                    let hbs_input = { "title": title, "messages": response.pin_messages }//No I18N
                    renderhbs($target, 'PinnedMessages', hbs_input, false, 'chat/Common/Chat'); // NO I18N
                    $chat_obj = $target.children().find("div.chat-wrapcont");
                    sdp_channels.loadPinMessages($chat_obj, response.pin_messages, chatId);
                }
            });
            initTooltip('.chat-wrapper'); //No I18N
        }
        else {
            window.showalert('warning', translate("channel.no.pin.messages"), "isAutoHide=true"); //No I18N
        }

    },
    isChatMember(chatId, userId) {
        let is_chat_mem;
        let input_data = {};
        input_data.list_info = {};
        input_data.list_info.search_criteria = { "field": "member.id", "condition": "is", "value": userId }; // No I18N
        var ajax_data = chat_util.constructAjaxData({
            url: "/chats/" + chatId + "/members",//No I18N
            input: input_data
        });
        sdpAjax(ajax_data).done(function (response) {
            if (chat_util.checkAjaxResponse(response)) {
                let row_count = response.list_info.row_count;
                if (row_count == 0) {
                    is_chat_mem = false;
                } else {
                    is_chat_mem = true;
                }
            }
        });
        return is_chat_mem;
    },
    /* Method to check file and confirmation with user using title */
    handleDrop: function (e, a) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        const errorMessage = translate("sdp.security.invalid.extension");
        // Handle cases where no files were dropped or invalid files were dropped
        if (files.length === 0) {
            showError(errorMessage, is_external_chat);
            return;
        }
        // check each file for validity
        for (const file of files) {
            if (file.type === "") {
                showError(errorMessage, is_external_chat);
                return;
            }
        }
        // Function to handle Error Display
        function showError(message, isExternal) {
            if (isExternal) {
                alert(message);
            } else {
                showalert('failure', e_html(message), "isAutoHide=false"); //NO I18N
            }
        }
        const $this_obj = jQuery(a);
        const $chatmain = $this_obj.parents(".chatbar-maincontent"); //No I18N
        let chat_title = $chatmain.attr("data-title");
        chat_title = chat_title.replace(/,/g, ' ');
        //A confirmation popup with user name after dropping a file with a shows with a title
        function sendDropFile(boo, btn, files) {
            if (!boo || btn !== 'submitButton' || files.length === 0) {
                return;
            }
            e.dropFile = files;
            chat_actions.chatattachimgfn(e, a);
        }
        let message = translate("common.chat.send.file", [chat_title]); // NO I18N
        showconfirm(true, 'title=' + translate("common.confirm") + ', message=' + e_attr(message) + ', submitbutton=' + translate('sdp.common.continue') + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', function (boo, btn) { // NO I18N
            sendDropFile(boo, btn, files);
        });
    },
    getTextBeforeCursor: function (contentEditableElement) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        // Clone the range to avoid affecting the user's current selection
        const preRange = range.cloneRange();
        preRange.selectNodeContents(contentEditableElement);
        preRange.setEnd(range.startContainer, range.startOffset);

        // Use a temporary container to extract HTML
        const container = document.createElement("div");
        container.appendChild(preRange.cloneContents());

        // Extract the HTML from the container
        const htmlBeforeCursor = container.innerHTML;
        return htmlBeforeCursor;
    },
    // Function to add a user to a chat
    addMentionedUserToChat: function (chatId, userId, username) {
        if (!sdp_chat.chatMentionUsers.has(chatId)) {
            sdp_chat.chatMentionUsers.set(chatId, []);
        }
        let users = sdp_chat.chatMentionUsers.get(chatId);
        users.push({ id: userId, name: username });
    },

    // Function to remove a chat from the Map
    removeChatmentionedUsers: function (chatId) {
        if (sdp_chat.chatMentionUsers.has(chatId)) {
            sdp_chat.chatMentionUsers.delete(chatId);
        }
    },

    // Get cursor position in a content-editable element
    getCursorPositionInContentEditable: function (element) {
        let selection = window.getSelection();
        if (!selection.rangeCount) {
            return -1; // No selection, cursor not present
        }

        let range = selection.getRangeAt(0); // Get the range of the selection
        let preCaretRange = range.cloneRange(); // Clone the range for position calculation

        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset); // Set range end to start of the selection

        return preCaretRange.toString().length; // Return the length of the text before the cursor
    }


};
