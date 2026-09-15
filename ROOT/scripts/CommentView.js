// $Id$ //
(function($) {

    var config = {
        module: {
            PROJECT: 'projects', // No I18N
            MILESTONE: 'milestones', // No I18N
            TASK: 'tasks', // No I18N
            SOLUTION: 'solutions' // No I18N
        },
        comment_types: {
            NEW_COMMENT: 'newComment', // No I18N
            NEW_REPLY: 'newReply', // No I18N
            EDIT_COMMENT: 'editComment', // No I18N
            EDIT_REPLY: 'editReply' // No I18N
        }
    }

    var parentmodule, parentSingularName, parentmoduleId, parentmoduleOwner, readonly, mentionSupport = true;
    /* To add a option to the show_to_requester checkbox in the comment box */
    var enableShowToRequesterCheckbox = false;
    /* To enable comments filter using this option need to write filters option based codes separately */
    var enableCommentsFilter = false;
    /* Dynamic name for new comment box save button */
    var newCommentBoxSaveButtonName;
    /* Dynamic name for edit comment box save button */
    var editCommentBoxSaveButtonName;
    /* Need a focus comment box when open a comments tab */
    var focusCommentBoxWhenOpenCommentsTab;
    /* This is the call back function to check a technician comment scope of the particular entity */
    var technicianCommentsScope;
    /* This is the call back function to check a requester comment scope of the particular entity */
    var requesterCommentsScope;
    /* This is callback function to trigger every comment add / addReply/ Delete Operations */
    var callbackAfterCommentsRender;

    var navInfo;

    var list_info = {
        start_index: 1,
        row_count: 5,
        total_count: null,
        end_index: null
    }

    var templates = {
        getHeaderRow: function(totalCount) {
            var header = $([
                '<div id="header">',
                '   <span>',
                '       <a href="/" class="text-link viewMore" id="viewMore">' + translate('sdp.comment.viewmore') + '(' + totalCount + ')</a>',
                '   <hr class="mt10 mb10">',
                '   </span>',
                '</div>'
            ].join("\n")); //NO I18N

            if (!totalCount || totalCount <= 0) {
                $(header).find(".viewMore").parent().remove();
            }

            return header[0].outerHTML;
        },

        getReplyRow: function(reply, owner, replyType, parentCommentID) {
            reply.content = appendImageToken(reply.content, reply.image_token);
            var replyRow = $([
                    '<div data-id=' + reply.id + ' class="reply-row visi-parent">',
                    '   <div class="proj-comment-owner pt10 text-muted">',
                    ( sdp_user.USERTYPE == "Technician" ? '<a href="/" class="user-name" user-id=' + reply.created_by.id + '>' + encodeHTML(reply.created_by.name) + '</a>'  : '<span class="sb">'+encodeHTML(reply.created_by.name)+ '</span>'),
                    '       ' + translate("sdp.common.repliedto") +  ' ',
                    ( sdp_user.USERTYPE == "Technician" ?' <a href="/" class="user-name" id="replyto' + reply.id + '" parent-id='+ parentCommentID +' user-id=' + owner.id + '>' + encodeHTML(owner.name) + '</a>'  : '<span class="sb">'+encodeHTML(owner.name)+ '</span>')+ ' ' + translate('sdp.common.comment') + ' ' + translate("sdp.common.on") + ' ' + reply.created_time.display_value, // No I18N
                    '   </div>',
                    '   <div class="proj-comment-detail ml0 pt10 of-a">',
                    '       <div class="proj-comment-desc pos-rel" data-content="rta">' + reply.content + '</div>',
                    '   </div>',
                    '   <div class="proj-comment-editsect replyEdit pt10" id="ui-framework-design1">',
                    '   </div>',
                    '</div>'
                ].join("\n")) //No I18N

            var seperator = '<div id="seperator"><hr class="mt10 mb20"></div>';
            var editbutton = '<a href="/" class="p10 pl0 pt0" data-name="EditReply"><span class="cspr icon-sm edit"></span><span class="pl4 thm-spr">' + translate('sdp.common.edit') + '</span></a>';
            var deleteButton = '<a href="/" class="p10 pt0" data-name="replyDelete"><span class="cspr icon-sm trash"></span><span class="pl4 thm-spr">' + translate('sdp.common.delete') + '</span></a>';

            if (replyType === 'lastReply') {
                $(replyRow).append(seperator);
            }


            //if solution module and technician login, need to hide the edit and delete button for comment, if solution trashed/expired/comment disabled globally/comment enabled globally but disabled for that particular solution.
           if((sdp_user.USERTYPE == "Technician") && technicianCommentsScope)
            {
                if(reply.show_to_requester == false)
                {
                $(replyRow).find(".proj-comment-owner").append("<button title='"+translate("solution.private")+"' rel='uitip' class='btn-link btn-xs ml5' type='button' data-name='conv-visisbility' isprivate='true'><span class='cspr icon-sm lock-line-clr top0'></span></button>");
                }
                 $(replyRow).find(".proj-comment-editsect").remove();
                 return replyRow[0].outerHTML;
            }

            //if solution module and requester login need to hide the edit and delete button for comment, if requester comment scope disabled globally/comment disabled for that particular solution.
            else if((sdp_user.USERTYPE == "Requester") && requesterCommentsScope)
            {
                 $(replyRow).find(".proj-comment-editsect").remove();
                 return replyRow[0].outerHTML;
            }

            //if solution module and technician login, and private solution, need to show the private solution icon
            if(sdp_user.USERTYPE == "Technician" && reply.show_to_requester == false )
            {
                $(replyRow).find(".proj-comment-owner").append("<button title='"+translate("solution.private")+"' rel='uitip' class='btn-link btn-xs ml5' type='button' data-name='conv-visisbility' isprivate='true'><span class='cspr icon-sm lock-line-clr top0'></span></button>");
            }



            if (sdp_user.LOGGEDIN_USERID == reply.created_by.id) {
                $(replyRow).find(".proj-comment-editsect").append(editbutton + deleteButton);
            } else if (parentmoduleOwner == sdp_user.LOGGEDIN_USERID) {
                deleteButton = $(deleteButton).addClass("pl0");
                $(replyRow).find(".proj-comment-editsect").append(deleteButton);
            } else {
                $(replyRow).find(".proj-comment-editsect").remove();
            }

            if (readonly) {
                $(replyRow).find(".proj-comment-editsect").remove();
            }
            return replyRow[0].outerHTML;
        },

        getCommentRow: function(comment) {
            if(sdp_user.USERTYPE == "Requester"){
                if(comment.content.indexOf('mention-type="user"') != -1){
                    comment.content = comment.content.replaceAll('style="color: rgb(26, 110, 189)','');     // No I18N
                    comment.content = comment.content.replaceAll('contenteditable="false"','');
                    comment.content = comment.content.replaceAll('mention-type="user"','class="text-muted sb"');    // No I18N
                    comment.content = comment.content.replaceAll('mention=','user-id=');    // No I18N
                }
            }
            comment.content = appendImageToken(comment.content, comment.image_token);
            var editButton = '<a href="/" class="p10" data-name="editComment"><span class="cspr icon-sm edit"></span><span class="pl4 thm-spr">' + translate('sdp.common.edit') + '</span></a>';
            var deleteButton = '<a href="/" class="p10" data-name="commentDelete"><span class="cspr icon-sm trash"></span><span class="pl4 thm-spr">' + translate('sdp.common.delete') + '</span></a>';

            var commentRow = $([
                    '<div id=comment' + comment.id + ' data-id=' + comment.id + ' data-owner="' + encodeHTML(comment.created_by.name) + '" data-owner-id="' + comment.created_by.id + '" class="proj-comment-row" >',
                    '   <div class="proj-comment-rowinner visi-parent">',
                    '       <div class="proj-comment-owner text-muted pt10">',
                    ( sdp_user.USERTYPE == "Technician" ? '<a href="/" class="user-name" user-id=' + comment.created_by.id + '>' + encodeHTML(comment.created_by.name) + '</a> ' : '<span class="sb">'+encodeHTML(comment.created_by.name)+'</span> ')+ translate("sdp.common.on") + ' ' + comment.created_time.display_value,// No I18N
                    '       </div>',
                    '       <div class="proj-comment-detail ml0 pt10">',
                    '           <div class="proj-comment-desc pos-rel wb-bw" data-content="rta">' + comment.content + '</div>',
                    '       </div>',
                    '       <div class="proj-comment-editsect pb20" id="ui-framework-design1">',
                    '           <span class="disp-ib"><a href="/" class="p10 pl0" data-name="comment-reply"><span class="cspr reply1"></span><span class="pl4 thm-spr">' + translate('sdp.requests.common.reply') + '</span></a></span>',
                    '               <div class="hoverstyle visi-item disp-ib">',
                    '               </div>',
                    '        </div>',
                    '   </div>',
                    '</div>'
                ].join("\n")) // No I18N

             //if solution module and technician login, need to hide the edit and delete button for comment, if solution trashed/expired/comment disabled globally/comment enabled globally but disabled for that particular solution.
            if((sdp_user.USERTYPE == "Technician") && technicianCommentsScope)
            {
                if(comment.show_to_requester == false)
                {
                 $(commentRow).find(".proj-comment-owner").append("<button title='"+translate("solution.private")+"' rel='uitip' class='btn-link btn-xs ml5' type='button' data-name='conv-visisbility' isprivate='true'><span class='cspr icon-sm lock-line-clr top0'></span></button>");
                }
                 $(commentRow).find(".proj-comment-editsect").remove();
                 return commentRow;
            }

            //if solution module and requester login need to hide the edit and delete button for comment, if requester comment scope disabled globally/comment disabled for that particular solution.
            else if((sdp_user.USERTYPE == "Requester") && requesterCommentsScope)
            {
                 $(commentRow).find(".proj-comment-editsect").remove();
                 return commentRow;
            }

            //if solution module and technician login, and private solution, need to show the private solution icon
            if(sdp_user.USERTYPE == "Technician" && comment.show_to_requester == false)
            {
                  $(commentRow).find(".proj-comment-owner").append("<button title='"+translate("solution.private")+"' rel='uitip' class='btn-link btn-xs ml5' type='button' data-name='conv-visisbility' isprivate='true'><span class='cspr icon-sm lock-line-clr top0'></span></button>");
            }

            if (sdp_user.LOGGEDIN_USERID == comment.created_by.id) {
                $(commentRow).find(".hoverstyle").append(editButton + deleteButton);
            } else if (parentmoduleOwner == sdp_user.LOGGEDIN_USERID) {
                deleteButton = $(deleteButton).addClass("pl0");
                $(commentRow).find(".hoverstyle").append(deleteButton);
            }
            if (readonly) {
                $(commentRow).find(".proj-comment-editsect").remove();
            }
            return commentRow;
        },

        getCommentBox: function(type, comment, mentionSupport) {
            switch (type) {
                case 'newComment': // No I18N
                    {
                     //if requester and requester comment scope disabled/comment disabled for that particular solution, need to hide the adcomment box.
                     if((sdp_user.USERTYPE == "Requester") && requesterCommentsScope){
                          return $([
                             '<div id="commentBox" class="comment-box-cnt newComment fw">',
                             '</div>'
                         ].join("\n")); // No I18N
                         break;
                     }
                     //if technician and solution trashed/expired/comment disabled globally/comment enabled globally but disabled for that particular solution, need to hide the adcomment box.
                     else if((sdp_user.USERTYPE == "Technician") && technicianCommentsScope){
                          return $([
                             '<div id="commentBox" class="comment-box-cnt newComment fw">',
                             '</div>'
                         ].join("\n")); // No I18N
                         break;
                    }
                     return $([
                             '<div id="commentBox" class="comment-box-cnt newComment fw">',
                             '   <div class="proj-comment-form mb5" id="ui-framework-design1">',
                             '       <div class="proj-add-commenthdr" id="CommentHeader" data-i18n-key="sdp.project.common.addcomment">',
                             '           <span>' + translate('sdp.project.common.addcomment') + '</span>',
                             '           <span class="fr pr10' + (mentionSupport ? '' : ' hide') + '"><span class="cspr info icon-sm mr5 top0 pr5"><span class="path1"></span></span>' + translate('sdp.comment.mention.helptext') + '</span>',
                             '       </div>',
                             '       <div id="newComment" class="formtextarea" style="height:150px"></div>',
                             '       <div class="submit-row pt10 bgtransp">',
                             (sdp_user.USERTYPE == "Technician" && enableShowToRequesterCheckbox ? '<div><label class="checkbox-inline mt5 mb20" data-i18n-key="solution.requester.show"><input type="checkbox" name="showthiscomment" id="showthiscomment1" value="true">'+translate('solution.requester.show')+'</label></div>':''),//No I18N
                             '           <button data-name="add-comment" class="btn btn-primary" id="add-comment" name="Submit" type="button">'+newCommentBoxSaveButtonName+'</button>',//No I18N
                             '           <button id="cancelButton" class="hide btn btn-default" name="Cancel" type="button">'+translate('common.cancel')+'</button>',//No I18N
                             '       </div>',
                             '   </div>',
                             '</div>'
                         ].join("\n")); // No I18N
                        break;
                    }
                case 'newReply': // No I18N
                    {
                      //if parent comment is public need to display the show_to_requester checkbox fore reply
                      return $([
                          '<div class="comment-box-cnt mt15 hide" data-name="replyEditform">',
                          '   <div class="proj-comment-form mb5" id="ui-framework-design1">',
                          '       <div class="proj-add-commenthdr" id="CommentHeader">',
                          '           <span>' + translate('sdp.comment.replyto') + ' <a class="user-name" parent-id="'+ comment.id +'" user-id="' + comment.created_by.id + '" href="/">' + encodeHTML(comment.created_by.name) + '</a> ' + translate('sdp.common.comment') + '</span>', // No I18N
                          '           <span class="fr pr10' + (mentionSupport ? '' : ' hide') + '"><span class="cspr info icon-sm mr5 top0 pr5"><span class="path1"></span></span>' + translate('sdp.comment.mention.helptext') + '</span>',
                          '       </div>',
                          '       <div class="submit-row pt10 bgtransp">',
                          (sdp_user.USERTYPE == "Technician" && enableShowToRequesterCheckbox ? '<div><label class="checkbox-inline hide mt5 mb20"><input type="checkbox" name="showthiscomment" id="showthiscomment1" value="true">'+translate('solution.requester.show')+'</label></div><div>':''),//No I18N
                          '           <button class="btn btn-primary" data-name="replySavefom" name="Submit" type="button">'+newCommentBoxSaveButtonName+'</button>',//No I18N
                          '           <button data-name="newReplyCancel" class="btn btn-default" name="Cancel" type="button">'+translate('common.cancel')+'</button>',//No I18N
                          '       </div>',
                          (sdp_user.USERTYPE == "Technician" && enableShowToRequesterCheckbox ? '</div>':''),
                          '   </div>',
                          '</div>'
                      ].join("\n")); // No I18N
                      break;
                    }
                case 'editComment': // No I18N
                    {
                        return $([
                            '<div class="comment-box-cnt hide pb10" data-name="comment-box">',
                            '   <div class="proj-comment-form mb5" id="ui-framework-design1">',
                            '       <div class="proj-add-commenthdr" id="CommentHeader">',
                            '           <span>' + translate('sdp.project.common.editcomment') + '</span>', // No I18N
                            '           <span class="fr pr10' + (mentionSupport ? '' : ' hide') + '"><span class="cspr info icon-sm mr5 top0 pr5"><span class="path1"></span></span>' + translate('sdp.comment.mention.helptext') + '</span>',
                            '       </div>',
                            '       <div class="submit-row pt10 bgtransp">',
                            (sdp_user.USERTYPE == "Technician" && enableShowToRequesterCheckbox ? '<div><label class="checkbox-inline hide mt5 mb20"><input type="checkbox" name="showthiscomment" id="showthiscomment1" value="true" data-i18n-key="solution.requester.show">'+translate('solution.requester.show')+'</label></div><div>':''),//No I18N
                            '           <button class="btn btn-primary" data-name="commentSave" name="Submit" type="button">'+editCommentBoxSaveButtonName+'</button>',//No I18N
                            '           <button data-name="cancelButton" class="btn btn-default" name="Cancel" type="button">'+translate('common.cancel')+'</button>',//No I18N
                            '       </div>',
                            '</div>',
                            (sdp_user.USERTYPE == "Technician" && enableShowToRequesterCheckbox ? '</div>':''),
                            '</div>'
                        ].join("\n"))[0].outerHTML;
                        break;
                    }
                case 'editReply': // No I18N
                    {
                        return $([
                            '<div class="comment-box-cnt hide" data-name="replyEdit">',
                            '   <div class="proj-comment-form mb5" id="ui-framework-design1">',
                            '       <div class="proj-add-commenthdr" id="CommentHeader">',
                            '           <span>' + translate('sdp.project.common.editcomment') + '</span>', // No I18N
                            '           <span class="fr pr10' + (mentionSupport ? '' : ' hide') + '"><span class="cspr info icon-sm mr5 top0 pr5"><span class="path1"></span></span>' + translate('sdp.comment.mention.helptext') + '</span>',
                            '       </div>',
                            '       <div class="submit-row pt10 bgtransp">',
                            (sdp_user.USERTYPE == "Technician" && enableShowToRequesterCheckbox ? '<div><label class="checkbox-inline hide mt5 mb20"><input type="checkbox" name="showthiscomment" id="showthiscomment1" value="true" data-i18n-key="solution.requester.show">'+translate('solution.requester.show')+'</label></div><div>':''),//No I18N
                            '           <button class="btn btn-primary" data-name="replySave" name="Submit" type="button">'+editCommentBoxSaveButtonName+'</button>',//No I18N
                            '           <button data-name="editReplyCancel" class="btn btn-default" name="Cancel" type="button">'+translate('common.cancel')+'</button>',//No I18N
                            '       </div>',
                            (sdp_user.USERTYPE == "Technician" && enableShowToRequesterCheckbox ? '</div>':''),
                            '   </div>',
                            '</div>'
                        ].join("\n"))[0].outerHTML;
                    }
            }
        }
    }

    function getCommentUrl() {
        var url = "";
        if(navInfo.grandParentEntity) {
            url += '/api/v3/' + navInfo.grandParentEntity + "/" + navInfo.grandParentEntityId + "/" + navInfo.parentEntity
                + "/" + navInfo.parentEntityId + "/" + navInfo.entity + "/" + navInfo.entityId + "/comments"
        } else if(navInfo.parentEntity) {
            url += '/api/v3/' + navInfo.parentEntity // NO I18N
                + "/" + navInfo.parentEntityId + "/" + navInfo.entity + "/" + navInfo.entityId + "/comments" // NO I18N
        } else {
            url += '/api/v3/' + navInfo.entity + "/" + navInfo.entityId + "/comments"
        }

        return url;
    }

    function loadComments(entity, entityId) {
        var data;
        var input_data = {
            list_info: {
                get_total_count: true,
                start_index: list_info.start_index,
                row_count: list_info.row_count,
                sort_field: "created_time", //NO I18N
                sort_order: "desc" //NO I18N
            },
            include : ["image_token"]
        }

        //Need to get the comments based on the filter selected (all comments/private)
        if(enableCommentsFilter == true)
        {
            var search_criteria_arr = [
                {
                    "field": "show_to_requester",  //No I18N
                    "condition": "is",  //No I18N
                    "value": "false" //No I18N
                }
            ];
            input_data.list_info["search_criteria"]= search_criteria_arr
        }

        sdpAjax({
            type: "GET", //No I18N
            data: sdpAjaxInputData(input_data),
            dataType: "json", // No I18N
            url: getCommentUrl(), // No I18N
            acceptODCompatible: true,
            success: function(response) {
                data = response;
                list_info.start_index += 5;
                list_info.end_index = data.list_info.start_index + data.list_info.row_count - 1;
            },
            async: false
        });
        return data;
    }

    function deleteComment(id) {
        var data;
        sdpAjax({
            type: "delete", //No I18N
            dataType: "json", // No I18N
            url: getCommentUrl() + "/" + id, // No I18N
            acceptODCompatible: true,
            success: function(response) {
                data = response;
                showalert('success', translate("sdp.api.comment.delete.successmessage"), 'isAutoHide=true,delay=1'); //No I18N
            },
            async: false
        });

        //Solution module -->after comment deletion need to update the comment count in feedback tab
         if(typeof callbackAfterCommentsRender == "function"){
            callbackAfterCommentsRender();
         }
        return data;
    }

    function updateComment(id, content) {

        var input_data = {
            comment: {
                content: content
            }
        }
        //Need to set private/public comment based on the show_to_requester checkbox selection
        if(enableShowToRequesterCheckbox){
            var ispublic_comment =jQuery('input[data-comment-checkbox=' + id + ']').length >0 ? jQuery('input[data-comment-checkbox=' + id + ']').is(':checked') : $sol.details.commentData.show_to_requester; // No I18N
            input_data.comment.show_to_requester = ispublic_comment;
        }
        var data;
        sdpAjax({
            type: "PUT", //No I18N
            dataType: "json", // No I18N
            data: sdpAjaxInputData(input_data),
            acceptODCompatible: true,
            url: getCommentUrl() + "/" + id, // No I18N
            success: function(response) {
                data = response;
                showalert('success', translate("sdp.api.comment.update.successmessage"), 'isAutoHide=true,delay=1'); //No I18N
            },
            async: false
        });
        return data;
    }


    function addComment(entity, id, content) {
        if (!content) {
            showalert('failure', getMessageForKey('sdp.project.entercommnet'), 'isAutoHide=true,delay=2'); //No I18N
        } else {
            var data;
            list_info.start_index++;
            list_info.total_count++;

            var input_data = {
                comment: {
                    content: content
                }
            }
            //Need to set private/public comment based on the show_to_requester checkbox selection
            if(enableShowToRequesterCheckbox){
                var ispublic_comment = $('.newComment').find('.submit-row').find('.checkbox-inline').find("input[name='showthiscomment']").is(":checked"); // No I18N
                input_data.comment.show_to_requester = ispublic_comment;
            }

            sdpAjax({
                url: getCommentUrl(), // No I18N
                data: sdpAjaxInputData(input_data),
                type: "POST", // No I18N
                dataType: "json", // No I18N
                acceptODCompatible: true,
                async: false,
                success: function(response) {
                    data = response;
                    showalert('success', translate("sdp.api.comment.addnew.successmessage"), 'isAutoHide=true,delay=1'); //No I18N
                }
            })
            //jQuery("#INLINEIMAGES").val([]);
            if(typeof callbackAfterCommentsRender == "function"){
                callbackAfterCommentsRender();
            }
            return data;
        }
        return null;
    }

    function addReply(id, content) {
        var input_data = {
            comment: {
                content: content
            }
        }
        //Need to set private/public comment based on the show_to_requester checkbox selection
        if(enableShowToRequesterCheckbox){
            var ispublic_comment = jQuery('[data-id=' + id +']').find('[data-name=replyEditform]').find('.submit-row').find('.checkbox-inline').find("input[name='showthiscomment']").is(":checked"); // No I18N
            input_data.comment.show_to_requester = ispublic_comment;
        }
        var data;
        sdpAjax({
            url: getCommentUrl() + "/" + id + '/_reply', // No I18N
            data: sdpAjaxInputData(input_data),
            type: "POST", // No I18N
            async: false,
            dataType: "json", // No I18N
            acceptODCompatible: true,
            success: function(response) {
                data = response;
                showalert('success', translate("sdp.api.comment.addnew.successmessage"), 'isAutoHide=true,delay=1'); //No I18N
            }
        })
        

        //Solution module --> after adding reply need to update the comment count
        if(typeof callbackAfterCommentsRender == "function"){
            callbackAfterCommentsRender();
        }
        return data;
    }


    function renderNewComment(comment, isNew) {
        showMentions(comment);

        if (isNew) {
            $(".newComment").before(templates.getCommentRow(comment));
        } else {

            $("#header").after(templates.getCommentRow(comment));
            if ($("#comment" + comment.id).find('.proj-comment-desc').height() > 300) {
                $("#comment" + comment.id).find('.proj-comment-desc').append("<span class='see-more'>" + translate('sdp.comment.seemore') + "...</span>");
                $("#comment" + comment.id).find('.proj-comment-desc').addClass("limit-height");
            }
        }

        $(".proj-comment-row#comment" + comment.id).append(templates.getCommentBox(config.comment_types.EDIT_COMMENT, null, mentionSupport) + '<div id="comment' + comment.id + // No I18N
            '" class="proj-reply-row ml25 mb20"></div>');
        if (comment.replies && comment.replies.length > 0) {
            for (var i = 0; i < comment.replies.length; i++) {
                showMentions(comment.replies[i]);
                if (i === comment.replies.length - 1) {
                    var replyRow = templates.getReplyRow(comment.replies[i], comment.created_by, null, comment.id);
                } else {
                    var replyRow = templates.getReplyRow(comment.replies[i], comment.created_by, 'lastReply', comment.id);
                }

                $(".proj-reply-row#comment" + comment.id).append(replyRow + templates.getCommentBox(config.comment_types.EDIT_REPLY, null, mentionSupport));

                if ($(".reply-row[data-id=" + comment.replies[i].id + ']').find('.proj-comment-desc').height() > 300) {
                    $(".reply-row[data-id=" + comment.replies[i].id + ']').find('.proj-comment-desc').append("<span class='see-more'>" + translate('sdp.comment.seemore') + "...</span>");
                    $(".reply-row[data-id=" + comment.replies[i].id + ']').find('.proj-comment-desc').addClass("limit-height");
                }
            }
        } else {
            $(".proj-comment-row#comment" + comment.id).find('.proj-comment-editsect').removeClass('pb20');
        }
        $(".proj-reply-row#comment" + comment.id).append(templates.getCommentBox(config.comment_types.NEW_REPLY, comment, mentionSupport));
        //118119 -- RTA section Zoho color contrast changes updated
        ThemeCustomizer.zcontrastcolorinit(".proj-comment-row#comment" + comment.id);// NO I18N
    }

    function showMentions(comment) {
        if (comment.mentions) {
            for (var i = 0; i < comment.mentions.length; i++) {
                comment.comment = comment.comment.replace('@' + comment.mentions[i].name + '&nbsp;', "<span>@" + comment.mentions[i].name + "</span> ");
            }
        }
        return comment;
    }

    function showComments(navigationInfo, modalEle) {
        parentmodule = navigationInfo.entity;
        parentmoduleId = navigationInfo.entityId;
        parentmoduleOwner = navigationInfo.entityOwner;
        parentSingularName = navigationInfo.parentSingularName;
        navInfo = navigationInfo;
        ZE_Init.mentions_module = parentmodule;
        ZE_Init.mentions_moduleId = parentmoduleId;
        mentionSupport = navigationInfo.mentionSupport != undefined ? navigationInfo.mentionSupport : true;
        enableShowToRequesterCheckbox = navigationInfo.enableShowToRequesterCheckbox != undefined ? navigationInfo.enableShowToRequesterCheckbox : false;
        enableCommentsFilter = navigationInfo.enableCommentsFilter != undefined ? navigationInfo.enableCommentsFilter : false;
        newCommentBoxSaveButtonName = navigationInfo.newCommentBoxSaveButtonName != undefined ? navigationInfo.newCommentBoxSaveButtonName : translate('common.save');
        editCommentBoxSaveButtonName = navigationInfo.editCommentBoxSaveButtonName != undefined ? navigationInfo.editCommentBoxSaveButtonName : translate('common.save');
        focusCommentBoxWhenOpenCommentsTab = navigationInfo.focusCommentBoxWhenOpenCommentsTab != undefined ? navigationInfo.focusCommentBoxWhenOpenCommentsTab : true;
        technicianCommentsScope = typeof navigationInfo.technicianCommentsScope == "function" ? navigationInfo.technicianCommentsScope() : false;   // No I18N
        requesterCommentsScope = typeof navigationInfo.requesterCommentsScope == "function" ? navigationInfo.requesterCommentsScope() : false;  // No I18N
        if(typeof navigationInfo.callbackAfterCommentsRender == "function"){    // No I18N
            callbackAfterCommentsRender = navigationInfo.callbackAfterCommentsRender;
        }
        readonly = navigationInfo.readonly;
        switch (parentmodule) {
            case config.module.PROJECT:
                divId = "#ProjectComments_DIV"; // No I18N
                break;
            case config.module.MILESTONE:
                divId = '#MileStoneComments_DIV'; // No I18N
                break;
            case config.module.TASK:
                divId = '#TaskComments_DIV'; // No I18N
                break;
            case config.module.SOLUTION:
                divId = '#SolutionComments_DIV'; // No I18N
                break;
            default:
                divId = '#Comments_DIV'; //No I18N
        }
        list_info.start_index = 1;
        list_info.total_count = 0;
        var data = loadComments(parentmodule, parentmoduleId);
        list_info.total_count = data.list_info.total_count;
        list_info.end_index = data.list_info.start_index + data.list_info.row_count - 1;
        $(divId).html("");

        /* For Inline Images */
        $(divId).append('<form name="CommentForm"><input type="hidden" value="comment" id="' + parentmodule + '_MOD_IND" name="' + parentmodule + '_MOD_IND"/><input type="hidden" value="CommentForm" id="FORMNAME" name="FORMNAME"/></select></form>');

        $(divId).append(templates.getHeaderRow(list_info.total_count - list_info.end_index));
        if (!readonly) {
            $(divId).append(templates.getCommentBox(config.comment_types.NEW_COMMENT, null, mentionSupport)[0].outerHTML);
        }

        if (data.comments) {
            $.each(data.comments, function(index, comment) {
                renderNewComment(comment, false);
            })
        }
        attachViewMoreEvents(divId, parentmodule, parentmoduleId);

        if (!readonly) {
            attachEvents(divId, parentmodule, parentmoduleId, modalEle);

            newCommentBox = loadRichTextArea('newComment', undefined, '', true); // No I18N
            commentBox = newCommentBox;
        } else if (data.comments.length == 0) {
            $(divId).append(getMessageForKey('sdp.changedetails.comments.nocomments')); //No I18N
        }
        //118119 -- RTA section Zoho color contrast changes updated
        ThemeCustomizer.zcontrastcolorinit(divId);// NO I18N
    }

    function attachEvents(divId, module, moduleId, modalEle) {
        /* Add new Comment */
        $(divId).on('click', '[data-name=add-comment]', function() {
            if(newCommentBox.isEmpty()){
                showalert('failure', getMessageForKey('sdp.project.entercommnet'), 'isAutoHide=true,delay=2'); //No I18N
            } else {
                var response = addComment(module, moduleId, newCommentBox.getContent())
                if (response.response_status.status === "success") {
                    var comment = showMentions(response.comment);
                    renderNewComment(comment, true);
                    newCommentBox.setContent("");
                    if(parentmodule == "solutions"){
                    $('.newComment').find('.submit-row').find('.checkbox-inline').find("input[name='showthiscomment']").prop("checked",false); // No I18N
                    }
                    ZE_Init.focus("commentBox"); //No I18N
                }
            }
            initTooltip(".proj-comment-owner"); //No I18N
        });

        /*---------------Comment Edit Button click------------------*/
        $(divId).on('click', '[data-name=editComment]', function() {
            $(this).parents('.proj-comment-rowinner').find('.see-more').trigger('click');
            hideRichTextArea();
            var datanowcomment = $(this).parents('.proj-comment-rowinner').find('.proj-comment-desc').html();
            $(this).closest('.proj-comment-row').find('[data-name=comment-box]').removeClass('hide');
            $(this).parents('.proj-comment-rowinner').next('[data-name=comment-box]').find('#CommentHeader').after(
                '<div id="commentEditBox" class="formtextarea" style="height:150px" data-name="userText"></div>');
            var id = $(this).closest('.proj-comment-row').data('id');
            $(this).closest('.proj-comment-row').find('[data-name=comment-box]').find('.submit-row').find('.checkbox-inline').addClass('hide')
            if(parentmodule == "solutions" ){
            $sol.details.commentData =null;
                if(($sol.feedback.checkCommentScope(id,"scope") == false || $sol.feedback.checkCommentScope(id,"scope") == true && $sol.feedback.checkCommentScope(id,"count")==0))
                {
                    var editCommentRow =$(this).closest('.proj-comment-row').find('[data-name=comment-box]').find('.submit-row').find('.checkbox-inline');
                    if(sdp_user.USERTYPE == "Technician"){
                    var commentStatus = $sol.details.commentData.show_to_requester;
                    editCommentRow.removeClass('hide');
                    editCommentRow.find("input[name='showthiscomment']").attr('data-comment-checkbox',id);
                    editCommentRow.find("input[name='showthiscomment']").prop("checked",commentStatus);//No I18N
                    }

                }
            }

            commentBox = loadRichTextArea("commentEditBox",id,datanowcomment); // No I18N
            $(this).closest('.proj-comment-row').find('.proj-comment-rowinner').addClass('hide');
            $('[data-name=replyEdit]').addClass('hide');
        });
        /*---------------Comment Save Button click------------------*/
        $(divId).on('click', '[data-name=commentSave]', function() {
            var editedComment = commentBox.getContent().trim();
            var id = $(this).closest('.proj-comment-row').data('id');

            if (!commentBox.isEmpty()) {
                var response = updateComment(id, editedComment);
                if (response.response_status.status === "success") {
                    $('.proj-comment-rowinner').removeClass('hide');
                    var content = appendImageToken(response.comment.content, response.comment.image_token);
                    $(this).parents('.comment-box-cnt').addClass('hide').prev('.proj-comment-rowinner').find( // No I18N
                        '.proj-comment-desc').html(content); // No I18N
                    $('.proj-comment-row').find('[data-name=comment-box]').addClass('hide');
                    if(parentmodule=="solutions" )
                    {
                    $('.proj-comment-row').filter("[data-id='"+response.comment.id+"']").find('.proj-comment-rowinner').find('.proj-comment-owner').find('button').remove()
                        if(response.comment.show_to_requester==false)
                        {
                           $('.proj-comment-row').filter("[data-id='"+response.comment.id+"']").find('.proj-comment-rowinner').find('.proj-comment-owner').append("<button title='"+translate("solution.private")+"' rel='uitip' class='btn-link btn-xs ml5' type='button' data-name='conv-visisbility' isprivate='true'><span class='cspr icon-sm lock-line-clr top0'></span></button>");
                        }
                    }

                } else {
                    showalert('failure', 'ERROR', // No I18N
                        'isAutoHide=false,closeOnEscKey=yes,width=500,height=80'); // No I18N
                }
                $(this).next().trigger('click')
                if(parentmodule == "solutions"){
                    $('.newComment').find('.submit-row').find('.checkbox-inline').find("input[name='showthiscomment']").prop("checked",false); // No I18N
                }

            } else {
                showalert('failure', getMessageForKey('sdp.project.entercommnet'), 'isAutoHide=true,delay=2'); //No I18N
            }
            initTooltip(".proj-comment-owner"); //No I18N
            ThemeCustomizer.zcontrastcolorinit(divId);
        });
        /*---------------EditComment Cancel Button click------------------*/
        $(divId).on('click', '[data-name=cancelButton]', function(e, triggered) {
            if (!triggered) {
                commentBox = newCommentBox;
                $('.newComment').removeClass('hide');
                if(parentmodule == "solutions"){
                    $('.newComment').find('.submit-row').find('.checkbox-inline').find("input[name='showthiscomment']").prop("checked",false); // No I18N
                }
            }
            $('[data-name=comment-box]').find('#ze_commentEditBox,#commentEditBox').remove();
            $('.proj-comment-rowinner').removeClass('hide');
            $('.proj-comment-row').find('[data-name=comment-box]').addClass('hide');
            ThemeCustomizer.zcontrastcolorinit(divId);// NO I18N
        });
        /*---------------EditReply Button click------------------*/
        $(divId).on('click', '[data-name=EditReply]', function(e) {
            $(this).parents('.reply-row').find('.see-more').trigger('click')
            hideRichTextArea();
            var datanow = $(this).parents('.reply-row').find('.proj-comment-desc').html();
            $(this).parents('.reply-row').next('[data-name=replyEdit]').removeClass('hide');
            $(this).closest('.reply-row').next('[data-name=replyEdit]').find('#CommentHeader').after(
                '<div id="replyEditBox" class="formtextarea" style="height:150px" data-name="userText"></div>');
            var id = $(this).closest('.proj-comment-row').data('id');

            if(parentmodule == "solutions"){
            $sol.details.commentData =null;
            var replyid = $(this).parents('.reply-row').data('id');  // No I18N
            $(this).closest('.proj-comment-row').find('[data-name=replyEdit]').find('.submit-row').find('.checkbox-inline').addClass('hide')
                if($sol.feedback.checkCommentScope(replyid,"scope",true) == true )
                {
                    var editReplyRow =$(this).closest('.proj-reply-row').find('[data-id='+replyid+']').next('[data-name=replyEdit]').find('.submit-row').find('.checkbox-inline');//No I18N
                    if(sdp_user.USERTYPE == "Technician"){
                    var commentStatus = $sol.details.commentData.show_to_requester;
                    editReplyRow.removeClass('hide')
                    editReplyRow.find("input[name='showthiscomment']").attr('data-comment-checkbox',replyid)
                    editReplyRow.find("input[name='showthiscomment']").prop("checked",commentStatus);//No I18N
                }
                }

            }

            commentBox = loadRichTextArea("replyEditBox",id, datanow); // No I18N
            $(this).parents('.reply-row').addClass('hide');
            $(this).parents('#Comments_Form_DIV').next().find('#ui-framework-design1').addClass('hide');
        });

        /*---------------EditReply Save Button click------------------*/
        $(divId).on('click', '[data-name=replySave]', function() {
            editedComment = commentBox.getContent();
            var id = $(this).closest('[data-name=replyEdit]').prev('.reply-row').data('id'); // No I18N
            if (!commentBox.isEmpty()) {
                var response = updateComment(id, editedComment);
                if (response.response_status.status === "success") {
                    $('[data-name=replyEdit]').addClass('hide');
                     var content = appendImageToken(response.comment.content, response.comment.image_token);
                    $(this).parents('.comment-box-cnt').addClass('hide').prev('.reply-row').find('.proj-comment-desc').html(content); // NO I18N
                    $('.proj-comment-row').find('.reply-row').removeClass('hide');

                    if(parentmodule=="solutions" )
                    {
                    $('.proj-comment-row').find('.reply-row').filter("[data-id='"+response.comment.id+"']").find('.proj-comment-owner').find('button').remove()
                        if(response.comment.show_to_requester==false)
                        {
                           $('.proj-comment-row').find('.reply-row').filter("[data-id='"+response.comment.id+"']").find('.proj-comment-owner').append("<button title='"+translate("solution.private")+"' rel='uitip' class='btn-link btn-xs ml5' type='button' data-name='conv-visisbility' isprivate='true'><span class='cspr icon-sm lock-line-clr top0'></span></button>");
                        }
                    }
                    $('.proj-comment-editsect').removeClass('hide');
                    $(this).next().trigger('click');
                    if(parentmodule == "solutions"){
                         $('.newComment').find('.submit-row').find('.checkbox-inline').find("input[name='showthiscomment']").prop("checked",false); // No I18N
                    }

                }
            } else {
                showalert('failure', getMessageForKey('sdp.project.entercommnet'), 'isAutoHide=true,delay=2'); //No I18N
            }
            initTooltip(".proj-comment-owner"); //No I18N
            ThemeCustomizer.zcontrastcolorinit(divId);// NO I18N
        });
        /*---------------Edited Data Cancel Button click------------------*/
        $(divId).on('click', '[data-name=editReplyCancel]', function(e, triggered) {
            if (!triggered) {
                commentBox = newCommentBox;
                $('.newComment').removeClass('hide');
                if(parentmodule == "solution"){
                $('.newComment').find('.submit-row').find('.checkbox-inline').find("input[name='showthiscomment']").prop("checked",false); // No I18N
                }
            }
            $('[data-name=replyEdit]').find('#replyEditBox,#ze_replyEditBox').remove();
            $('[data-name=replyEdit]').addClass('hide');
            $(this).parents('.comment-box-cnt').find('.ui-formtextarea').html(''); // No I18N
            $('.proj-comment-row').find('.reply-row').removeClass('hide');
            $(this).parents('#Comments_Form_DIV').next().find('#ui-framework-design1').removeClass('hide');
            $('.proj-comment-editsect').removeClass('hide');
            ThemeCustomizer.zcontrastcolorinit(divId);// NO I18N

        });

        /*---------------On Comment Reply Button click------------------*/
        $(divId).on('click', '[data-name=comment-reply]', function() {
            hideRichTextArea();
            $(this).closest('.proj-comment-row').find('[data-name=replyEditform]').removeClass('hide');
            $(this).closest('.proj-comment-row').find('[data-name=replyEditform] #CommentHeader').after(
                '<div id="replyBox" class="formtextarea" style="height:150px" data-name="userText"></div>');

            if(parentmodule == "solutions" ){
                var id = $(this).closest('.proj-comment-row').data('id')
                $sol.details.commentData =null;
                if($sol.feedback.checkCommentScope(id,"scope") == true && sdp_user.USERTYPE == "Technician" )
                {
                    var newReplyRow = $(this).closest('[data-id=' + id +']').find('[data-name=replyEditform]').find('.submit-row').find('.checkbox-inline');
                    newReplyRow.removeClass('hide');
                    newReplyRow.find("input[name='showthiscomment']").prop("checked",false); // No I18N

                }

            }

            var action = 'body,html',DigScrollVal = 0,OffsetTop = 0;  // No I18N
            //#83697 - IssueFix  
            if (jQuery('#replyBox').closest('#_DIALOG_CONTENT').length > 0) {
                action = '#_DIALOG_CONTENT'; // No I18N
                DigScrollVal = jQuery('#_DIALOG_CONTENT').scrollTop();
                OffsetTop = jQuery('#_DIALOG_CONTENT').offset().top; 
            }
            var ele = modalEle? '#' + modalEle : '' + action + '';
            jQuery(ele).stop().animate({
                scrollTop: jQuery('#replyBox').closest('#ui-framework-design1').offset().top + DigScrollVal - OffsetTop // No I18N
            },500);
            //Highlight the Background once Replied 
            jQuery('.proj-comment-form').css('background-color', '#ffc'); // No I18N
            //Remove Highlight After scroll
            setTimeout(function () {
                jQuery('.proj-comment-form').css('background-color', ''); // No I18N
            }, 700);

            commentBox = loadRichTextArea("replyBox", undefined, '', true); // No I18N

            $(this).parents('#Comments_Form_DIV').next().find('#ui-framework-design1').addClass('hide');

        });
        /*-----New Reply Save Button Click ----------------*/
        $(divId).on('click', '[data-name=replySavefom]', function() {

            var id = $(this).closest('.proj-comment-row').data('id');
            var owner = {
                id: $(this).closest('.proj-comment-row').data('owner-id'),
                name: $(this).closest('.proj-comment-row').data('owner')
            }
            var replyContent = commentBox.getContent().trim();
            if (!commentBox.isEmpty()) {
                var response = addReply(id, replyContent)
                if (response.response_status.status === "success") {
                    var comment = showMentions(response.comment);
                    if ($(this).closest('.proj-reply-row').find('.reply-row').length > 0) {
                        var seperator = '<div id="seperator"><hr class="mt10 mb20"></div>';
                        $(this).closest('.proj-reply-row').find('.reply-row').last().append(seperator);
                        $(this).closest('.proj-reply-row').find('[data-name=replyEditform]').before(templates.getReplyRow(comment, owner, 'newReply', id) + //No I18N
                            templates.getCommentBox(config.comment_types.EDIT_REPLY, null, mentionSupport));
                    } else {
                        $(this).closest(".proj-comment-row").find(".proj-comment-editsect").addClass('pb20');
                        $(this).closest('.proj-reply-row').find('[data-name=replyEditform]').before(templates.getReplyRow(comment, owner, 'firstReply', id) + //NO I18N
                            templates.getCommentBox(config.comment_types.EDIT_REPLY, null, mentionSupport));
                    }
                    $(this).next().trigger('click');
                    commentBox.setContent("");

                } else {
                    $(this).next().trigger('click');
                }
                if(parentmodule == "solution"){
                    $('.newComment').find('.submit-row').find('.checkbox-inline').find("input[name='showthiscomment']").prop("checked",false); // No I18N
                }
            } else {
                showalert('failure', getMessageForKey('sdp.project.entercommnet'), 'isAutoHide=true,delay=2'); //No I18N
            }
            ThemeCustomizer.zcontrastcolorinit(".proj-reply-row#comment" + id);// NO I18N
            initTooltip(".proj-comment-owner"); //No I18N
        });
        /*-----New Reply Cancel Button Click ----------------*/
        $(divId).on('click', '[data-name=newReplyCancel]', function(e, triggered) {
            if (!triggered) {
                commentBox = newCommentBox;
                $('.newComment').removeClass('hide');
                if(parentmodule == "solution"){
                     $('.newComment').find('.submit-row').find('.checkbox-inline').find("input[name='showthiscomment']").prop("checked",false); // No I18N
                }
            }
            $('[data-name=userText]').html('');
            $('[data-name=replyEditform]').addClass('hide');
            $('[data-name=replyEditform]').find('#replyBox,#ze_replyBox').remove();
            $('.proj-comment-editsect').removeClass('hide');
        });

        /*---------------New Comment Button click------------------*/
        $(divId).on("click", "#addCommentclick", function() {
            jQuery(newCommentBox.iframe).contents().find(".ze_body").trigger('focus');
            document.querySelector('.newComment').scrollIntoView({
                behavior: "smooth"
            }); // NO I18N

        });

        /*---------------Comment Delete Button click------------------*/
        $(divId).on('click', '[data-name=commentDelete]', function() {
            var id = $(this).closest('.proj-comment-row').data('id');
            var _self = this;
            showconfirm(true, 'title=' + translate("sdp.comment.delete") + ', message=' + translate('sdp.comment.delete.confirm') + ', submitbutton=' + translate("sdp.common.delete") + ', cancelbutton=' + translate("sdp.common.cancel") + ', closebutton=yes, closeOnEscKey=yes', function(boo) { //NO I18N
                if (boo) {
                    list_info.end_index--;
                    list_info.start_index--;
                    list_info.total_count--;
                    response = deleteComment(id);
                    if (response.response_status.status === "success") {
                        $(_self).closest('.proj-comment-row').remove();
                    }
                }
            },true)
        });

        /*---------------Reply Delete Button click------------------*/
        $(divId).on('click', '[data-name=replyDelete]', function(e) {
            var id = $(this).closest('.reply-row').data('id');
            var _self = this;
            showconfirm(true, 'title=' + translate("sdp.comment.delete") + ', message=' + translate('sdp.comment.delete.confirm') + ', submitbutton=' + translate("sdp.common.delete") + ', cancelbutton=' + translate("sdp.common.cancel") + ', closebutton=yes, closeOnEscKey=yes', function(boo) { //NO I18N
                if (boo) {
                    response = deleteComment(id);
                    if (response.response_status.status === "success") {

                        if ($(_self).closest('.reply-row').nextAll().length === 2) {
                            $(_self).closest('.reply-row').prevAll().eq(1).find('#seperator').remove();
                            if ($(_self).closest('.reply-row').prevAll().length === 0) {
                                $(_self).closest(".proj-comment-row").find('.proj-comment-editsect').removeClass('pb20');
                            }
                        }
                        $(_self).closest('.reply-row').next().remove();
                        $(_self).closest('.reply-row').remove();
                    }
                }
            },true)
        });

        /* @maintain field loaded via preview component */
        $(divId).on('click', 'a[user-id]', function(e) {
            var id = $(this).attr("user-id");
            window.$previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+id+'&minContent=true&externalframe=true','User Details','600px');  //No I18N
            return false;
        });

        /**
         * Handles both click and Enter key interactions on user mention spans.
         */
        $(divId)
        .off('.mentionHandler')  //No I18N
        .on('click.mentionHandler keydown.mentionHandler', 'span[mention-type="user"]', function (e) {
            if (e.type === 'click' || (e.type === 'keydown' && e.key === 'Enter')) {  //No I18N
                var id = $(this).attr("mention");
                window.$previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+id+'&minContent=true&externalframe=true','User Details','600px');  //No I18N
                return false;
            }
        });

        $(divId).on('mouseover', '.user-name,span[mention]', function(e) {
            $(this).css("text-decoration", "underline") //No I18N
            $(this).css("cursor", "pointer") //No I18N

        });

        $(divId).on('mouseleave', '.user-name,span[mention]', function(e) {
            $(this).css("text-decoration", "") //No I18N
        });
    }

    function attachViewMoreEvents(divId, module, moduleId) {

        // To prevent attaching duplicate events
        $(divId).off('click');

        /*---------------View More Button click------------------*/
        $(divId).on('click', '#viewMore', function() {
            var data = loadComments(module, moduleId);
            if (data.comments) {
                $.each(data.comments, function(index, comment) {
                    renderNewComment(comment, false);
                })
            }
            if (list_info.total_count - list_info.end_index <= 0) {
                $('#viewMore').text('View previous Comments(0)'); //NO I18N
                $('#viewMore').parent().addClass('hide');
            } else {
                $('#viewMore').text("View more comments(" + (list_info.total_count - list_info.end_index) + ')'); // No I18N
            }
        });

        $(divId).on('click', '.see-more', function() {
            $(this).parent().removeClass('limit-height');
            $(this).remove();
        });
    }

    function hideRichTextArea() {
        if ($(commentBox.outerdiv).attr('id') === 'ze_newComment') {
            $(commentBox.outerdiv).closest('.newComment').addClass('hide');
        } else {
            $(commentBox.outerdiv).parent().find("input[name='Cancel']").trigger('click', [true]); //NO I18N
        }
    }

    function loadRichTextArea(textAreaId , comment_id, content, isNew) {
        var isFocus =  true;
        var inlineimagesAPI = (comment_id) ? getCommentUrl() +'/'+comment_id+'/images' : getCommentUrl() +'/images'; //NO I18N
        if(textAreaId == "newComment"){
            isFocus = focusCommentBoxWhenOpenCommentsTab;
        }
        if(content && sdp_app.themes.IS_USER_THEME_ENABLED && sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF.userTheme && sdp_user.CLIENT_CONF.userTheme.nightMode) {
            let ele = jQuery("#"+textAreaId).closest("#comment"+comment_id).find("[data-content=rta]"); //NO I18N
            revertColorChanges({ alteredElems: ThemeCustomizer.z_contrastColor[ele[0].dataset.zcontrastcolor], domNode: ele[0]}); //NO I18N
            content = ele.html();
        }
        zeditor({element:textAreaId,toolbar:"toolbarOrder",imgParameters:{module: 'comment', formName:'CommentForm'},inlineimagesAPI: inlineimagesAPI, iframeheight:120,content:content,isEnterKeyHandler:isNew,customName:"commentBox",enableMention: true,maintainStructure: true, focus:isFocus}); //No I18N
        return commentBox;
    }

    window.showComments = showComments;

})(jQuery);