/* $Id$ */
$sol.settings = {
     //To set all solution settings related data to _self
     getData : function(){
        var _self = $sol.settings;
        sdpAjax({
            type: "GET", //No I18N
            url: "/api/v3/solution_settings", // No I18N
            success: function(resp) {
                var settingsData=resp.solution_settings;
                for(var i=0;i<settingsData.length;i++){
                    var category = settingsData[i]["category"];
                    var parameter = settingsData[i]["parameter"];
                    if(parameter == "ReviewDateReached"){
                        _self.reviewDateReachAction = settingsData[i]["paramvalue"];
                    }
                    if(category == "SolutionComments"){
                        if(parameter == "isEnabled"){
                            _self.globalCommentScope = settingsData[i]["paramvalue"];
                        }
                        else if(parameter == "isRequesterPermission"){
                            _self.requesterCommentScope = settingsData[i]["paramvalue"];
                        }
                    }
                    else if(category == "HelpfulnessRating"){
                        if(parameter == "isEnabled"){
                            _self.globalRatingScope = settingsData[i]["paramvalue"]
                        }
                        else if(parameter == "isRequesterPermission"){
                            _self.requesterRatingScope = settingsData[i]["paramvalue"];
                        }
                    }
                    else if(category == "RequesterFeatures"){
                        if(parameter == "HideForwardSolutions"){
                            _self.hideForwardOptionForRequester = settingsData[i]["paramvalue"];
                        }
                    }
                }
            },
            async: false
        });
    },

    //To open and set the values of the solution settings popup
    openPopup : function (isPopup){
        var _self = $sol.settings;
        if(isPopup == "true"){
            _self.getData();
            var settingHtml =  renderhbs(null,"sol_settings_dialog",{},false,"solutions",null,null,null,true);    //No I18N
            jQuery('#solution_settings_popup').dialog({
            title:translate('sdp.common.solution.settings'),
            autoOpen : false,
            modal : true,
            position: { my: "center center", at: "center center", of: window }, //NO I18N
            open: function(event, ui){
                $sdEventListener(jQuery("#solution_settings_popup"));
                var settingsJQ = jQuery("#solutionSettingHTML");
                _self.settingsJQ = settingsJQ;

                settingsJQ.find('input[name="optradio"][value="'+_self.reviewDateReachAction+'"]').prop('checked',true)  //No I18N
                if(_self.globalCommentScope == "true")
                {
                    settingsJQ.find('input[name="enablecomments"]').prop('checked',true)  //No I18N
                    settingsJQ.find('input[id=techallow]').prop('checked',true)  //No I18N
                    if(_self.requesterCommentScope == "true"){
                        settingsJQ.find('input[id=allowcomment]').prop('checked',true)  //No I18N
                    }
                }
                if(_self.globalRatingScope=="true")
                {
                    settingsJQ.find('input[name="enablehelpfulness"]').prop('checked',true)  //No I18N
                    if(_self.requesterRatingScope=="true"){
                        settingsJQ.find('input[id=allowusers]').prop('checked',true)  //No I18N
                    }
                }

                if(_self.globalCommentScope == "true")
                {
                    _self.actions("enablecomments");//No I18N
                }


                if(_self.globalRatingScope == "true")
                {
                    _self.actions("enablehelpfulness");//No I18N
                }
            },
            close: function(event,ui){
                jQuery('#solutionSettingHTML').remove();
                jQuery('#solution_settings_popup').dialog("destroy"); // No I18N
            },
            width: 640,
            }).html(settingHtml).dialog("open"); // No I18N
            return;
        }
        _self.save();
    },
    /* This function is used to enable\disable checkbox for solution settings popup */
    actions : function(option){
         var _self = $sol.settings;
         var settingsJQ = _self.settingsJQ;
        var enablehelpfulness = settingsJQ.find("input[name='enablehelpfulness']:checked").val(); //No I18N
        var enablecomments = settingsJQ.find("input[name='enablecomments']:checked").val(); //No I18N

        if(option == "enablehelpfulness"){
            if(enablehelpfulness){
                if(!enablecomments){
                    settingsJQ.find('#child1 input[id="allowusers"]').prop('disabled',false); //No I18N
                }
                else{
                    settingsJQ.find('#child1 input[type=checkbox]').prop('disabled', false); //No I18N
                }
            }
            else{
                settingsJQ.find('#child1 input[type=checkbox]').prop('checked', false); //No I18N
                settingsJQ.find('#child1 input[type=checkbox]').prop('disabled', true); //No I18N
            }
        }
        if(option == "enablecomments"){
            if(enablecomments){
                settingsJQ.find('#child2 input[id="techallow"]').prop('checked',true); //No I18N
                settingsJQ.find('#child2 input[id=allowcomment]').prop('disabled',false); //No I18N
            }
            else{
                settingsJQ.find('#child2 input[type=checkbox]').prop('checked',false); //No I18N
                settingsJQ.find('#child2 input[id=allowcomment]').prop('disabled',true); //No I18N
            }
        }
    },
    //This function is used to save the solutions settings
    save : function(){
        var _self = $sol.settings;
        var settingsJQ = _self.settingsJQ;
        var enablehelpfulness = settingsJQ.find("input[name='enablehelpfulness']:checked").val() || false; //No I18N
        var enablecomments = settingsJQ.find("input[name='enablecomments']:checked").val() || false; //No I18N
        var option = settingsJQ.find("input[name='optradio']:checked").val(); //No I18N

        var ratingUserPermission = false;
        var commentUserPermission =false;

        if(enablehelpfulness)
        {
           ratingUserPermission = settingsJQ.find("input[id='allowusers']:checked").val() || false; //No I18N
        }
        if(enablecomments)
        {
            commentUserPermission = settingsJQ.find("input[id='allowcomment']:checked").val() || false; //No I18N
        }


        var input = { "solution_setting": [ { "paramvalue": option, "category": "SolutionSettings" ,"parameter": "ReviewDateReached"},// No I18N
        { "paramvalue": enablecomments, "category": "SolutionComments" ,"parameter": "isEnabled"},// No I18N
        { "paramvalue": commentUserPermission, "category": "SolutionComments" ,"parameter": "isRequesterPermission"},// No I18N
        { "paramvalue": enablehelpfulness, "category": "HelpfulnessRating" ,"parameter": "isEnabled"},// No I18N
        { "paramvalue": ratingUserPermission, "category": "HelpfulnessRating" ,"parameter": "isRequesterPermission"}]};// No I18N
        sdpAjax({
            url: "/api/v3/solution_settings", //No I18N
            type: "PUT", //No I18N
            data: sdpAjaxInputData(input),
            success: function(resp){
                showalert('success', translate("sdp.solution.settings.save.successmsg"), "isAutoHide=true"); // No I18N
                $sol.list.refreshList();
                jQuery('#solution_settings_popup').dialog('close'); // No I18N
            }
        });
    }
}
