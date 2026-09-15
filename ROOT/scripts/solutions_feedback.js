/* $Id$ */
$sol.feedback = {
    //This method is used to update a Feedback tab
    loadComments : function(){
        var _self = $sol.feedback;
        var navinfo = {
            entity: "solutions", // NO I18N
            entityId: $sol.details.id,
            entityOwner: $sol.details.entity_data.owner,
            mentionSupport : $sol.details.isTech ? true : false,
            enableShowToRequesterCheckbox : $sol.details.isTech ? true : false,
            enableCommentsFilter : $sol.details.commentFilter,
            newCommentBoxSaveButtonName : translate('common.add'),
            editCommentBoxSaveButtonName : translate('sdp.admin.replytemplate.update'),
            focusCommentBoxWhenOpenCommentsTab : false,
            technicianCommentsScope : $sol.feedback.technicianCommentsScope,
            requesterCommentsScope : $sol.feedback.requesterCommentsScope,
            callbackAfterCommentsRender : $sol.feedback.updateFeedbackCount,
            parentSingularName:"solution"// No I18N
        }
        showComments(navinfo);
        _self.updateFeedbackCount();
    },

     //update count in feedback
    updateFeedbackCount : function(){
        var _self = $sol.feedback;
        var isTech = sdp_user.USERTYPE=="Requester"?false:true;//No I18N
        var summaryResponse = {};
        var feedbackJQ = jQuery("#solution-comments");
        var likeDislikeJQ = jQuery("#like_dislike_div");
        var requiredFieldsArray = ["publicCommentsCount","isLiked","likesCount","dislikesCount"];   // No I18N
        if(isTech){
            requiredFieldsArray.push("privateCommentsCount");
            requiredFieldsArray.push("totalCommentsCount");
        }
        var input_data = {"list_info": {"fields_required" : requiredFieldsArray}};    // No I18N
        sdpAjax({
            type : "GET",   // No I18N
            url : $sol.details.base_url + "/" + $sol.details.id + "/_summary", // No I18N
            data : sdpAjaxInputData(input_data),
            async: false,
            success: function(resp) {
                summaryResponse = resp;
            }
        });
        //To update a comments count here
        if(isTech){
            if($sol.details.commentFilter == true ){
                if(summaryResponse.solution_summary.hasOwnProperty("privateCommentsCount")){
                    if(summaryResponse.solution_summary.privateCommentsCount > 0){
                        feedbackJQ.find("#commentsCount").html(summaryResponse.solution_summary.privateCommentsCount);
                         _self.commentsCountExpandHideShowActions(true, feedbackJQ);
                    }
                    else{
                        _self.commentsCountExpandHideShowActions(false, feedbackJQ);
                    }
                }
                else{
                    _self.commentsCountExpandHideShowActions(false, feedbackJQ);
                }
            }
            else{
                if(summaryResponse.solution_summary.hasOwnProperty("totalCommentsCount")){
                    if(summaryResponse.solution_summary.totalCommentsCount > 0){
                        feedbackJQ.find("#commentsCount").html(summaryResponse.solution_summary.totalCommentsCount);
                        _self.commentsCountExpandHideShowActions(true, feedbackJQ);
                        feedbackJQ.find("#filtercomment").prop('class','disp-ib fr pos-rel cur-ptr');    //No I18N
                    }
                    else{
                        jQuery("#filtercomment").prop('class','hide');  //No I18N
                        _self.commentsCountExpandHideShowActions(false, feedbackJQ);
                    }
                }
                else{
                    jQuery("#filtercomment").prop('class','hide');  //No I18N
                    _self.commentsCountExpandHideShowActions(false, feedbackJQ);
                }
            }
        }
        else{
            if(summaryResponse.solution_summary.hasOwnProperty("publicCommentsCount")){
                if(summaryResponse.solution_summary.publicCommentsCount > 0){
                    feedbackJQ.find("#commentsCount").html(summaryResponse.solution_summary.publicCommentsCount);
                    _self.commentsCountExpandHideShowActions(true, feedbackJQ);
                }
                else{
                    _self.commentsCountExpandHideShowActions(false, feedbackJQ);
                }
            }
            else{
                _self.commentsCountExpandHideShowActions(false, feedbackJQ);
            }
        }
        //To update a solution like and dislikes count and active the like/dislikes button at the time of user viewed the solution
        if($sol.settings.globalRatingScope == "true" && ((!isTech && $sol.settings.requesterRatingScope == "true") || $sol.details.entity_data.approval_status && $sol.details.entity_data.approval_status.name =="Approved") && ($sol.details.entity_data.deleted_time == null)){
            if(summaryResponse.solution_summary.hasOwnProperty("isLiked")){
                if(summaryResponse.solution_summary.isLiked){
                    likeDislikeJQ.find("#btn-like").addClass("active");
                }
                else{
                    likeDislikeJQ.find("#btn-dislike").addClass("active");
                }
            }
            if(summaryResponse.solution_summary.hasOwnProperty("likesCount")){
                likeDislikeJQ.find("#likesCount").html(summaryResponse.solution_summary.likesCount);
            }
            else{
                likeDislikeJQ.find("#likesCount").html(0);
            }
            if(summaryResponse.solution_summary.hasOwnProperty("dislikesCount")){
                likeDislikeJQ.find("#dislikesCount").html(summaryResponse.solution_summary.dislikesCount);
            }
            else{
                likeDislikeJQ.find("#dislikesCount").html(0);
            }
        }
        else{
            likeDislikeJQ.addClass('opac5 cur-na ptr-ev-none');
        }

    },

    //To get a like or dislike button state and made actions
    circledfeedback: function(curEle, operationName){
        var _self = this;
        var curEleJQ = jQuery(curEle);
        if(!curEleJQ.hasClass('active')){
            _self.apiCallForLikeDislikeRemovelikeOfSolution(operationName,curEleJQ);
        }
        else{
            _self.apiCallForLikeDislikeRemovelikeOfSolution("removelike",curEleJQ);
        }
    },
    /* This method is used to like, dislike, removelike api call operations */
    apiCallForLikeDislikeRemovelikeOfSolution : function(operationName,curEleJQ){
        sdpAjax({
            type: "PUT",    //NO I18N
            url: $sol.details.base_url + "/" + $sol.details.id + "/_"+operationName, // No I18N
            success: function(resp) {
                if (resp.response_status && resp.response_status.status == "success") {
                    jQuery("#likesCount").html(resp.solution.likes);
                    jQuery("#likesCount").attr('title',resp.solution.likes+' '+translate("solution.users.helpful"));

                    jQuery("#dislikesCount").html(resp.solution.dislikes);
                    jQuery("#dislikesCount").attr('title',resp.solution.dislikes+' '+translate("solution.users.nothelpful"));
                    if(operationName == "like" || operationName == "dislike"){
                        var solMsg = jQuery('#solmsg');
                        var messageTxt = "";
                        if(operationName === "like"){
                            messageTxt = translate("solution.helpful.selected")  //NO I18N
                        }
                        else{
                            messageTxt = translate("solution.nothelpful.selected")  //NO I18N
                        }
                        jQuery('span[data-feedback="circled"]').removeClass('active');
                        curEleJQ.addClass('active');
                        solMsg.text(messageTxt).fadeIn('fast'); //NO I18N
                        setTimeout(function(){solMsg.fadeOut('slow');},500);
                    }
                    else if(operationName == "removelike"){
                        curEleJQ.removeClass('active');
                    }
                }
            },
            async: false
        });
    },

    getCommentFilter :function(option,curEle){
        var _self = this,
        solfb = jQuery('#solfb-toggle'),
        solcmtFilter = solfb.find('#commentsFilter');
        curEle.preventDefault();
        curEle.stopImmediatePropagation();
        curEle.stopPropagation();
        if(option == "private"){
            $sol.details.commentFilter = true;
           solcmtFilter.html(translate("solution.private.comments"));
           solfb.parent().removeClass('open'); //NO I18N
        }
        else{
           $sol.details.commentFilter = false;
           solcmtFilter.html(translate("solution.all.comments"));
           solfb.parent().removeClass('open'); //NO I18N
        }
        _self.loadComments();

    },

    //To get a rating count of a solution
    getRatingCount: function(operationName){
        var count;
        sdpAjax({
            type: "GET",    //NO I18N
            url: $sol.details.base_url + "/" + $sol.details.id, // No I18N
            success: function(resp) {
                count = resp.solution[operationName];
            },
            async: false
        });
        return count;
    },

    //To get a comment data
    getCommentData:  function(id){
        var commentData;
        sdpAjax({
            type: "GET",    //NO I18N
            url: $sol.details.base_url + "/" + $sol.details.id + "/comments/"+id, // No I18N
            success: function(resp) {
                commentData = resp.comment
            },
            async: false
        });
        return commentData;
    },
    //To check comment scope and reply count
    checkCommentScope: function(id,func,isReply){
        if(sdp_user.USERTYPE == "Requester"){
            return false;
        }
        var _self = this;
        if($sol.details.commentData == null){
            $sol.details.commentData = _self.getCommentData(id)

        }
        if(func == "scope" ){
            if(isReply){
               return $sol.details.commentData.parent.show_to_requester;
            }
            return $sol.details.commentData.show_to_requester;
        }
        return $sol.details.commentData.reply_count;
    },
     //To construct a kanban view for liked disliked users popup
     reactedUsersConstruction : function(solId,isLiked){
        var _self = this;
        var tableHolderDiv = isLiked ? "reacted_users_like" : "reacted_users_dislike";  //No I18N
        var table_info = {"list_info" : {"start_index" : "1", "row_count" : "100"}}; //No I18N
        var header_metadata = {
            user_data: {
                "default": true, // No I18N
                "hide_label": true,// No I18N
                "column_settings": { "view_type": "row" ,"rowposition":1 }, // No I18N
                "dataCelltransformer": _self.constructProfilePictureDiv // No I18N
            }
        }
        var table_content = {"header" : header_metadata }; //No I18N
        var options = {
            entity_name      : "reacted_users", //No I18N
            callbackURL      : "solutions/"+solId+"/reacted_users", //No I18N
            tableHolder      : tableHolderDiv,
            paginationEnabled : true,
            row_inputdata : _self.rowDataConstructForReactedUsers(table_info,isLiked),
            staticHeader: true,
            width : '100%',
            height : '390',    //No I18N
            lazyloadingEnabled : true,
            default_sort_field : {
                sort_order : "desc" //No I18N
            },
            nodataString : '<div class="tc p15"><span>'+(isLiked ? translate('solution.helpful.empty.message') : translate('solution.nothelpful.empty.message'))+'</span></div>',  //No I18N
            isODAPI : true,
            view: "kanban", //No I18N
            view_mode: "linear" //No I18N
        }
        if(isLiked){
            _self.tableObjReactedUsersLike = new tableComponent(table_info,table_content,options);
        }
        else{
            _self.tableObjReactedUsersDislike = new tableComponent(table_info,table_content,options);
        }
    },
    //To construct a kanban view div for liked disliked users popup
    constructProfilePictureDiv : function(table_data){
        var rd = table_data.row_data;
        var pic = rd.user.profile_pic['content-url'];   //No I18N
        return '<div class="prp-circle disp-ib vmiddle mr10"><img src='+pic+' alt="'+translate('sdp.header.profilepic')+'"></div><span class="text-overflow disp-ib vmiddle maxw-300px" rel="uitip" mode_ellipsis=true title="'+e_attr(rd.user.name)+'">'+ZSEC.Encoder.encodeForHTML(rd.user.name)+'</span>';
    },
    //To construct a row data input for liked disliked users popup
    rowDataConstructForReactedUsers : function(table_info,isLiked){
        var inputObject = {};
        table_info.list_info.search_criteria =  isLiked ? {"field" : "like_dislike","condition":"eq","value" : true } : {"field" : "like_dislike","condition":"eq","value" : false } //No I18N


        inputObject.list_info = table_info.list_info;
        return inputObject;
    },
    //This function is used to  hide and show the comments count and expand icon
    commentsCountExpandHideShowActions : function(isShow, feedbackJQ){
        if(isShow){
            feedbackJQ.find("#commentsCount_div").show();
            feedbackJQ.find("#commentsExpand").show();
            feedbackJQ.find("#commentsCollapseDiv").addClass("cur-ptr");
            feedbackJQ.attr('toggle-on-header-click', true);    //SD-112673
        }
        else{
            feedbackJQ.find("#commentsCount_div").hide();
            feedbackJQ.find("#commentsExpand").hide();
            feedbackJQ.find("#commentsCollapseDiv").removeClass("cur-ptr");
            feedbackJQ.attr('toggle-on-header-click', false);   //SD-112673
        }
    },
    /* This function is used to active/inactive related users likes dislike tabs */
    reactedUsersPopupUIActions : function(operationName,reactedUserJQ){
        var oppositeOperationName = operationName == "like" ? "unlike" : "like";    //NO I18N
        reactedUserJQ.find('#'+operationName+'icon').addClass('active');
        reactedUserJQ.find('#'+operationName+'tab').prop('aria-expanded','true'); //NO I18N
        reactedUserJQ.find('#'+operationName).addClass('sdtab-pane fade in active');

        reactedUserJQ.find('#'+oppositeOperationName+'icon').addClass('');
        reactedUserJQ.find('#'+oppositeOperationName+'tab').prop('aria-expanded','false'); //NO I18N
        reactedUserJQ.find('#'+oppositeOperationName).addClass('sdtab-pane fade');
    },
    /* Call back function for technician based scope check in comments */
    technicianCommentsScope : function(){
        var solutionStatusBasedCheck = $sol.details.entity_data.approval_status && $sol.details.entity_data.approval_status.name == "Expired" ? true : false
         var trashedSolutionCheck = $sol.details.entity_data.deleted_time ? true : false;
        if((trashedSolutionCheck == true) || (solutionStatusBasedCheck == true) || (($sol.settings.globalCommentScope == "false") || $sol.details.entity_data.comment_isenabled==false)){
            return true;
        }else{
            return false;
        }
    },
    /*Call back function for requester based scope check in comments */
    requesterCommentsScope : function (){
        if($sol.settings.requesterCommentScope == "false" || $sol.details.entity_data.comment_isenabled != true){
            return true;
        }else{
            return false;
        }
    }
}
