/* $Id$ */
/**
 * File is used to predict the template and category of the request
 * Zia Template and Category suggestions related changes
 */
 var zia_cat_temp_suggestion = {
    woId : '',
    tempId: '',
    templateName: '',
    callForZiaSuggestion: function(form, saveData) {
        var subject = form.subject.value,
            desc = "",
            seltemplate = $req.form.template.id,
            selcategory = "",
            _self = this; 
        this.tempSaveData = saveData || null;
        if (typeof $rf.fields.values.category !== "undefined") {// No I18N
            selcategory = $rf.fields.values.category;
        }
        // SD-109398 | Checking is the description field available.
        if (typeof form.description !== "undefined") {
            desc = form.description.value;
            desc = desc ? desc.substring(0, 30000) : "";
        }
        var inputJson = {
            zia_action: {
                subject: subject, 
                content: desc, 
                wobean: { 
                    request: {
                        template: { 
                            id: seltemplate
                        } 
                    }
                }
            }
        };
        if (selcategory) {
            inputJson.zia_action.wobean.request.category = {
                id: selcategory
            }; 
        }
        var strJson = sdpToJSON(inputJson);
        var inputData = {
            input_data: strJson
        };
        sdpAjax({
            url: "/api/v3/zia_actions/_get_all_prediction", //NO I18N
            data: inputData,
            type: "POST", //NO I18N
            success: function(responseJson) {
                if (responseJson.zia_action) {
                    _self.showZiaPopup(responseJson);
                }
            }
        });
    },
    showZiaPopup: function(resp) {
        var result = resp.zia_action;
        if (resp.response_status.status == "success") { // No I18N
            var iscatalog = false,
                openPopup = false;
            var catObject = result.ziasuggestion.category || {};
            var tempObject = result.ziasuggestion.template || {};
            var isCatDisabled = $rf.fields.category ? $rf.fields.category.element.disabled : true;
            if ($rf.fields.category && !jQuery($rf.fields.category.element).is(":visible")) {// NO I18N
                isCatDisabled = true;
            }
            if (catObject && $rf.fields.category && (!$rf.fields.category.allowedIds.length || !$rf.fields.category.allowedIds.includes(catObject.id + ""))) {
                isCatDisabled = true;
            }
			try {
				$req.form.zia_properties.prediction = JSON.stringify(result.ziaprediction);
			} catch (error) {
				/* eslint-disable no-console */
				console.error(error);
				/* eslint-enable no-console */
			}
         
            if (result.ziasuggestion.category == undefined && result.ziasuggestion.template == undefined) {
                $req.form.submit("zia_suggestion", event, this.tempSaveData); //No I18N
            } else {
                var title = getMessageForKey("zia.suggestion"); //NO I18N
                var content = '<div class="p10"><p class="mt0 mb10"><span class="text-color6">' + getMessageForKey("zia.addrequest.suggestion.msg1") + "</span></p>"; // No I18N
                if (result.ziasuggestion.category && !isCatDisabled) {
                    content = content + '<p class="mt0 mb5 sb"><input type="checkbox" id="suggest_category" name="zia_suggestion"><label class="ml5 pos-rel top-1 vtop" for="suggest_category">' + getMessageForKey("sdp.requests.common.category") + ' : "' + encodeHTML(catObject.name) + '"</label></p>'; // No I18N
                    openPopup = true;
                }
                if (result.ziasuggestion.template) {
                    content = content + '<p class="mt0 mb3 sb"><input type="checkbox" id="suggest_template" name="zia_suggestion"><label class="ml5 pos-rel top-1 vtop" for="suggest_template">' + getMessageForKey("sdp.admin.requesttemplate.template") + ' : "' + encodeHTML(tempObject.name) + '"</label></p>'; // No I18N
                    iscatalog = tempObject.iscatalog;
                    openPopup = true;
                }
                if (!openPopup) {
                    $req.form.submit("zia_suggestion", event, this.tempSaveData); //No I18N
                    return;
                }
                content = content + '<div class="alert alert-warning icon hide mt10 mb10" role="alert"><span class="msg">' + getMessageForKey("zia.request.templates.prediction.warning") + " </span></div>";
                content = content + '<p class="mt10 mb15"><span class="text-color6">' + getMessageForKey("zia.addrequest.suggestion.msg2") + '</span></p><p class="pt5 m0"><button type="button" class="btn btn-primary mr5" id="apply_suggestion" data-event="click" data-handler="zia_cat_temp_suggestion.applyZiaValues(' + (catObject.id || null) + "," + (tempObject.id || null) + "," + iscatalog + ")\" nonce="+sdpNonce+">" + getMessageForKey("common.apply") + '</button></a>\t<button id="reject_suggestion" type="button" class="btn btn-default" data-event="click" data-handler="zia_cat_temp_suggestion.continueToSubmit(' + (catObject.id || null) + " ," + (tempObject.id || null) + ')" nonce='+sdpNonce+'>' + getMessageForKey("common.reject") + "</button></div>"; //No I18N
                jQuery.fn.notifyWidget({
                    title: title,
                    content: content,
                    position: "TM", //NO I18N
                    autoClose: false,
                    closeBtn: false,
                    callbackfn: function() {
                        $sdEventListener("#apply_suggestion, #reject_suggestion");      // No I18N
                        jQuery("#suggest_category, #suggest_template").on("click", function() {
                            zia_cat_temp_suggestion.changeRejectButton();
                        });
                    },
                    headericon: '<span id="ziasuggestion_submit" class="fl cspr zia-noti icon-lg mr10"></span>' // No I18N
                });
                // Prevent body from scolling
                jQuery("body").addClass("atp-open");  // NO I18N
                if (!jQuery("#zia-notify-overlay").length) {// No I18N
                    jQuery("body").append('<div id="zia-notify-overlay" class="modal-overlay" tabindex="-1" role="dialog"></div>'); // No I18N
                } else {
                    jQuery("#zia-notify-overlay").show(); // No I18N
                }
            }
        }
    },
    changeRejectButton: function() {
        if (jQuery("#suggest_category").prop("checked") || jQuery("#suggest_template").prop("checked")) {
            jQuery("#reject_suggestion").prop("disabled", true); //NO I18N
        } else {
            jQuery("#reject_suggestion").prop("disabled", false); //NO I18N
        }
        if (jQuery("#suggest_template").prop("checked")) {
            jQuery("#tech-notification-tm").find(".alert-warning").removeClass("hide"); //NO I18N
            jQuery("#tech-notification-tm").find(".notification-content").css("max-height", 320); //NO I18N
        } else {
            jQuery("#tech-notification-tm").find(".alert-warning").addClass("hide"); //NO I18N
            jQuery("#tech-notification-tm").find(".notification-content").css("max-height", 270); //NO I18N
        }
    },
    applyZiaValues: function(categoryId, templateId, iscatalog) {
      // Re-enable the scroll functionality of body
       jQuery("body").removeClass("atp-open");
        var appliedProps = [],
            discardedProps = [];
        if (!jQuery("#suggest_category").is(":checked") && !jQuery("#suggest_template").is(":checked")) {// No I18N
            alert(getMessageForKey("approval.add.action.mandate")); // No I18N
            return;
        }
        if (categoryId != null) {
            if (jQuery("#suggest_category").is(":checked")) { // No I18N
                appliedProps.push("category"); // No I18N
                $rf.setFieldValue("category", categoryId + ""); // No I18N
            } else {
                discardedProps.push("category"); // No I18N
            }
        }
        if (templateId != null) {
            if (jQuery("#suggest_template").is(":checked")) {// No I18N
                appliedProps.push("template"); // No I18N
            } else {
                discardedProps.push("template"); // No I18N
            }
        }
        $req.form.zia_properties.appliedlist = appliedProps;
        $req.form.zia_properties.discardedlist = discardedProps;
        jQuery("#ziasuggestion_submit").parents(".ui-dialog").first().addClass("notification-zoom-out"); //No I18N
        jQuery("#zia-notify-overlay").hide(); // No I18N
        if (templateId != null && jQuery("#suggest_template").is(":checked")) {// No I18N
            if (!$req.form.retain_fields) {
                $req.form.retain_fields = {};
            }
            $req.form.retain_fields = {
                subject: $rf.fields.values.subject || "",
                description: $rf.fields.values.description || ""
            };
            this.isSuggestedByZia = true;
            $req.form.zia_properties.category = $rf.fields.values.category || "";
            $req.form.zia_properties.suggested_already = true;
            $req.form.changeTemplate(templateId, "zia_suggestion"); //NO I18N
        } else {
            if (jQuery("#suggest_category").is(":checked")) {// No I18N
                this.tempSaveData = null;
            }
            //SD-125059 : request submission is denied when zia category prediction is accepted - Handled in WoForm.js
            $req.form.submit("zia_suggestion", event, this.tempSaveData); //No I18N
        }
    },
    continueToSubmit: function(categoryId, templateId) {
        var discardedProps = [];
        if (categoryId != null) {
            discardedProps.push("category"); // No I18N
        }
        if (templateId != null) {
            discardedProps.push("template"); // No I18N
        }
        jQuery("#ziasuggestion_submit").parents(".ui-dialog").first().addClass("notification-zoom-out"); // No I18N
        jQuery("#zia-notify-overlay").hide(); // No I18N
        $req.form.zia_properties.discardedlist = discardedProps;
        $req.form.submit("zia_suggestion", event, this.tempSaveData); //No I18N
    },
    applyAITemplate: function(woId, templateId) {
            woId = woId || zia_cat_temp_suggestion.woId;
            templateId = templateId || zia_cat_temp_suggestion.tempId;
            var isInMinPreview = false;
            const activeWindow = $extFrame.getActiveWindow();
			try {
				isInMinPreview = activeWindow.jQuery("#wo-details-frame").length > 0;
			} catch (error) {}
			var url = "/WorkOrder.do?woMode=editWO&reqTemplate=" + templateId + "&woID=" + woId + "&isSuggestedByZia=true" + (window.externalframe ? "&externalframe=true&noheader=true" : ""); // No I18N
			if(isInMinPreview){
				activeWindow.window.location.href = url;
			}else{
				window.location.href = url;
			}
    },
    recommendAITemplate: function(woId, tempId, templateName, isCatalogTemplate) {
        var template = {}
        template.id = tempId;
        template.text = templateName;
        template.is_service_template = isCatalogTemplate;
        $req.notify.actions.emailReply(woId,true,'',true,false,'',template);
    },
    discardAISuggestion: function(woId, templateId) {
        if(woId === undefined) {
            woId = zia_cat_temp_suggestion.woId;
        }
        if(templateId === undefined) {
            templateId = zia_cat_temp_suggestion.tempId;
        }
        var url = "/servlet/AIAjaxServlet"; //NO I18N
        var input = {
            command: "discardZiaSuggestion", //NO I18N
            woId: woId,
            action: "templateprediction", //NO I18N
            tempId: templateId
        };
        sdpAjax({
            url: url,
            method: "POST", //NO I18N
            data: input,
            success: function(result) {
            }
        });
    },
    showZiaMessage: function(woID, tempId, template, isCatalogTemplate) {
        var title = getMessageForKey("zia.suggestion"); // No I18N
    		var displayMsgKey = window.canRecommendTemplate ? "zia.show.suggestion.option2" : "zia.show.suggestion.option1";   //NO I18N
        var content = '<div class="p15"><p class="mt0 mb10"><span class="text-color6">' + getMessageForKey(displayMsgKey, [template]) + '</span></p><br><p class="text-color6 m0"><input type="radio" id="apply" name="ziaoptions" value="applytemplate"><label class="disp-ib mb3 ml3 pos-rel top-2" for="apply">' + getMessageForKey("common.apply") + "</label>"; //No I18N
        if (window.canRecommendTemplate) {
            content = content + '<br><input type="radio" id="recommend" name="ziaoptions" value="recommendtemplate"><label class="disp-ib mb3 ml3 pos-rel top-2" for="recommend">' + getMessageForKey("sdp.common.recommend") + "</label>"; //NO I18N
        }
        content = content + '<br><input type="radio" id="reject" name="ziaoptions" value="reject"><label class="disp-ib mb3 ml3 pos-rel top-2" for="reject">' + getMessageForKey("common.reject") + '</label><br><br><button type="button" class="btn btn-primary" id="proceed" data-event="click" data-handler="zia_cat_temp_suggestion.processZiaOption(' + woID + "," + tempId +",`" + encodeHTML(template) + "`,"+ isCatalogTemplate+',this)" nonce='+sdpNonce+'>' + getMessageForKey("common.proceed") + '</button>&nbsp;<a class="fr pos-rel pt2 top5" id="remind_me_later" href="/" data-event="click" data-handler="zia_cat_temp_suggestion.remindZiaSuggestionLater(' + woID + "," + tempId + ",`" + e_html(template) + '`)" nonce='+sdpNonce+">" + getMessageForKey("zia.remindmelater") + "</a></div>"; //NO I18N
        jQuery.fn.notifyWidget({
            title: title,
            content: content,
            position: "TM", //NO I18N
            autoClose: false,
            closeBtn: false,
            timeDelay:100,
            callbackfn: function() {
                $sdEventListener("#remind_me_later, #proceed");     // No I18N
            },
            headericon: '<span id="ziasuggestion" class="fl cspr zia-noti icon-lg mr10"></span>' // No I18N
        });
        // Prevent body from scolling
        jQuery("body").addClass("atp-open");  // NO I18N
        if (!jQuery("#zia-notify-overlay").length) {// No I18N
            jQuery("body").append('<div id="zia-notify-overlay" class="modal-overlay" tabindex="-1" role="dialog"></div>'); // No I18N
        } else {
            jQuery("#zia-notify-overlay").show(); // No I18N
        }
    },
    processZiaOption: function(woId, templateId, template,isCatalogTemplate,action) {
        // re-enable the scroll options of the body
        jQuery("body").removeClass("atp-open"); // NO I18N
        var selectedoption = jQuery("input[name='ziaoptions']:checked").val(); // No I18N
        if (!selectedoption) {
            alert(getMessageForKey("approval.add.action.mandate")); // No I18N
            return;
        }
        if (selectedoption === "applytemplate") {// No I18N
            this.applyAITemplate(woId, templateId);
        } else if (selectedoption === "recommendtemplate") {// No I18N
            this.recommendAITemplate(woId, templateId,template,isCatalogTemplate);
        } else {
            this.discardAISuggestion(woId, templateId);
        }
        var parentdiv = jQuery("#ziasuggestion").parent().parent(); // No I18N
        parentdiv.closest(".ui-dialog").addClass("notification-zoom-out"); //No I18N
        jQuery("#zia-notify-overlay").hide(); // No I18N
        setTimeout(function() {
            parentdiv.closest(".ui-dialog").remove(); // No I18N
        }, 100);
    },
    remindZiaSuggestionLater: function(woId, tempId, template) {
       // re-enable the scroll options of the body
       jQuery("body").removeClass("atp-open"); // NO I18N
        var parentdiv = jQuery("#ziasuggestion").parent().parent(); // No I18N
        parentdiv.closest(".ui-dialog").addClass("notification-zoom-out"); //No I18N
        jQuery("#zia-notify-overlay").hide(); // No I18N
        var isInMinPreview = false;
        try {
         isInMinPreview = top.jQuery("#wo-details-frame").length > 0;
        } catch (error) {}
        setTimeout(function() {
            parentdiv.closest(".ui-dialog").remove(); // No I18N
        }, 100);
        var url = "/servlet/AIAjaxServlet"; //NO I18N
        var input = {
            command: "remindLaterZiaSuggestion",  //NO I18N
            woId: woId,
            action: "templateprediction" //NO I18N
        };
        sdpAjax({
            url: url,
            type: "POST", //NO I18N
            data: input,
            success: function(response) {
                isAISetRemindLater = true;
        				if(isInMinPreview){
        					showalert('info',getMessageForKey('zia.request.remainme.later.message'),'isAutoHide=true, delay=3'); // NO I18N
        				} else {
        					zia_cat_temp_suggestion.showZiaSuggetionInRemindLater(woId, tempId, template);
        				}
            }
        });
    },
    showZiaSuggetionInRemindLater: function(woId, tempId, template) {
        this.setZiaSuggestionProperties(woId, tempId, template);

        if(jQuery('#Request_zia_notify').length === 0) {
        //Loading zia prediction compiled template js if not available.
            ResourceLoader({
                js : ['/scripts/hbs-template-zia-prediction.js'], //No I18N
                success: function() {
            ziac.loadResource(true).then(function() {
                jQuery("#wrapper_Request_" + woId).prepend('<div class="btn-group bs-noconflict ml5 vbottom top10" id="Request_zia_notify"></div>');
                renderhbs("#Request_zia_notify", "request_zia_popup", {id: woId}, false, 'zia/zia-prediction');// No I18N
                var btn = jQuery("#request_zia_popup_button");
                btn.off('click.ziapopup').on('click.ziapopup', function() { //No I18N
                    zia_list.loadZiaForEntity(this, "Request", btn.data('entity-id'));   // No I18N
                });
                jQuery('#Request_ziaripple, #zia_navtabs_parent').addClass('hide'); //Hide the ripple div and the approval, reopen, parser tabs
                jQuery('#zia_view_all').toggleClass('disp-ib hide'); //Hide the View all  //No I18N
                jQuery("#Request_zia_remindlater").find('#suggestedTemplate').html(zia_cat_temp_suggestion.suggestedTemplate);
            });
        }
            });
        }
    },
    setZiaSuggestionProperties: function(woId, tempId, template) {
        zia_cat_temp_suggestion.woId = woId;
        zia_cat_temp_suggestion.tempId = tempId;
        zia_cat_temp_suggestion.templateName = template;
        zia_cat_temp_suggestion.suggestedTemplate = translate("zia.suggestion.template") + ' : <b>"' + zia_cat_temp_suggestion.templateName + '"</b>'; //No I18N
    },
    hideZiaSuggestion: function() {
        zia_cat_temp_suggestion.suggestedTemplate = '';
        let notifyDiv = jQuery('#Request_zia_notify');
        notifyDiv.find('#Request_zia_remindlater').addClass('hide');

//If the count is 0, hide the zia icon itself
        let count = parseInt(jQuery('#Request_ziaripple .origin').html());
        if(isNaN(count) || count === 0) {
            notifyDiv.before('<div class="btn-group bs-noconflict ml5 vbottom top10"><span>&nbsp;</span></div>').remove();
        }
    }
};
