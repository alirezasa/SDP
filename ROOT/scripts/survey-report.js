/* $Id$ */
 var _json_stringify = JSON.stringify;
 JSON.stringify = function (value) {
     var _array_tojson = Array.prototype.toJSON;
     delete Array.prototype.toJSON;
     var r = _json_stringify(value);
     Array.prototype.toJSON = _array_tojson;
     return r;
 };

/**** Survey Home Page ****/
(function() {
    jQuery.fn.surveyhomefn = function(options) {
        var data = this;
        var reorderreset;
        var niceScrollString = {cursorcolor:'#ccc',horizrailenabled:false,cursorwidth:8,background:'transparent',autohidemode: true,railoffset: { top:0, left:4 },railpadding: { top:0, right:2, left:2, bottom:0 }};//NO I18N
        /*** Table Disable Sortable function ***/
        function reorderdisableload() {
            data.find('.admin-tbl .sortable').sortable("disable");//NO I18N
        }
        /*** Table Enable Sortable function **/
        function reorderenableload() {
            data.find('.admin-tbl .sortable').sortable("enable");//NO I18N
            /*** Home page Table Input Index value for Reorder ****/
            data.find('.survey-reorder input').each(function(index, value) {
                jQuery(this).val(index);
            });
        }
       
        function sidebaradminhgt() { // Admin panel Height And It's refer from ui-components.min.js file
            var hgt;
            if ( jQuery('[data-name=admin-wrapper] .admin-tbl .admin-box').length != 0 ) {
                if(jQuery(window).height() < (jQuery('.admin-sidebar').height()+jQuery('#header-placeholder').outerHeight(true)+40)) {
                    hgt = jQuery('.admin-sidebar').height() - (jQuery('[data-name=admin-wrapper] .admin-tbl .admin-box').offset().top - jQuery('#header-placeholder').outerHeight(true));
                }
                else {
                     hgt = jQuery(window).height() - (jQuery('[data-name=admin-wrapper] .admin-tbl .admin-box').offset().top - jQuery('#header-placeholder').outerHeight(true));
                }
                jQuery('[data-name=admin-wrapper] .admin-tbl .admin-box').height(hgt);
            }
        }
        /*** Email Translation Page ***/
        function emailNewTranslation(a) {
            jQuery(".nav-sdtabs").freeze();
            surveyObject.loadDefaultMsgs();
            jQuery(".survey-mail-langselect").val("0").trigger("change");
            var managelang = a.closest('[data-name=survey-mail-managelang]');//NO I18N
            managelang.addClass('survey-mail-addlang');
            managelang.find('[data-name=survey-mail-langbtns]').addClass('hide');
            managelang.find('[data-name=survey-mail-langselect]').removeClass('hide');
            
            managelang.find('[data-name=survey-mail-manageemail]').addClass('hide');
            jQuery(".survey-mail-defaultques").removeClass("hide").find('.form-footer').css('visibility','hidden');//NO I18N
            managelang.find('.survey-mail-defaultques .form-group').each(function(index, value){
                var hgt = managelang.find('[data-name=survey-mail-defaultques] .form-group:eq('+index+')').height();
                jQuery(this).height(hgt);
            });
            managelang.find('[data-name=survey-mail-defaultques] .form-footer [data-name=cancelemailtranslation]').removeClass('hide');
            //clear the fields
            jQuery("[data-name=survey-mail-defaultques] input").val('');
            editor.setHTML('');
            jQuery("[data-name=updateemail]").addClass("hide");
             jQuery("[data-name=saveemail]").removeClass("hide");
             let type="ticket";// No I18N
             if(jQuery("#generalTab").hasClass("active"))
             {
                type="general";// No I18N
             }

            //load default with the ticket/genral msgs
            // reinitialising editor to avoid toolbar ui breakage when right column is visible
            zeditor({element:'HTMLDesc1',edithtml:true,isEnterKeyHandler:true,resize:true,toolbar:"generalToolbar", afterload: function(){//NO I18N
                init_autocomplete(type);
              }});
        }
        function managelanguage() {
            var managelang = jQuery('[data-name=survey-mail-managelang]');
            managelang.removeClass('survey-mail-addlang');
            managelang.addClass('survey-mail-managelang');
            managelang.find('[data-name=survey-mail-manageemail]').removeClass('hide').addClass('survey-mail-manageemail');
            managelang.find('[data-name=survey-mail-defaultques] [data-name=survey-mail-langbtns],[data-name=survey-mail-defaultques] [data-name=survey-mail-langselect]').addClass('hide');
            jQuery(".survey-mail-defaultques").addClass("hide");
        }
        
        function checkAndHideTranslationList() {
            var needconf;
            var subject = jQuery("#subject").val();
            var success_msg = jQuery("#success").val();
            var thanks_msg = jQuery("#thanks").val();
            var failure_msg = jQuery("#failure").val();
            var description = parent.editor.getHTML();
            needconf = subject || success_msg || thanks_msg || failure_msg || description;
            if(needconf !== ""){
                showconfirm(true,'title='+translate("sdp.common.cancel")+',message='+translate("sdp.reports.selectModule.cancel")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes', showconfirmcallback);//NO I18N
                function showconfirmcallback(s) {
                    if(s){
                        hideTranslationList();
                    }
                }
            }else{
                hideTranslationList();
            }
        }
        function hideTranslationList() {
            jQuery("[data-name $= Translation].active").trigger('click');
            var managelang = jQuery('[data-id=survey-container-email]');
            managelang.find('[data-name=survey-mail-managelang]').removeClass('survey-mail-addlang');
            managelang.find('[data-name=survey-mail-manageemail]').removeClass('hide');
            managelang.find('.survey-mail-defaultques').addClass("hide");
            managelang.find('[data-name=survey-mail-langbtns]').removeClass('hide');
            managelang.find('[data-name=survey-mail-langselect]').addClass('hide');
            managelang.find('[data-name=survey-mail-defaultques] .form-group').each(function(index, value){
                jQuery(this).find('textarea.form-control').text(jQuery(this).find('textarea.form-control').attr('placeholder'));
            });
            managelang.find('[data-name=survey-mail-defaultques] .form-footer [data-name=cancelemailtranslation]').addClass('hide');
            jQuery(".nav-sdtabs").unfreeze();
        }
        
        /*** Email Translation Page ***/
        function boot() {
            var startIndex,stopIndex;
            var $origSelection;
            /*** New Survey form click ***/
            data.find('[data-name=newsuryfrm] li a,[data-name=secondmenu] button:not([data-switch=sdmenu]),.emptylist button:not([data-switch=sdmenu])').on('click', function() {
            });
            /*** Home page Reorder, Apply, Cancel and Reset Click Event ****/
            data.find('[data-name=surveyreorder]').on('click', function() {
                jQuery(this).closest('.widget-header').find('h4').addClass('hide');//NO I18N
                jQuery("[data-name=survyfilter] li.active").attr("data-active", "true");
                $origSelection = jQuery("[data-name=survyfilter] [data-active=true] a");

                var reorderCallback = function(){
                    data.find('.survey-reorder input').each(function(index, value) {
                        jQuery(this).val(index);
                    });
                    reorderreset = data.find('.admin-tbl:eq(0) .tbody .sortable').html(); // Used for reset and cancel
                    data.find('.sortable .survey-reorder,[data-name=surveyreorderhead]').removeClass('hide');
                    data.find('.sortable .surveytemp-sett,[data-name=surveynrmlhead]').addClass('hide');
                    data.find('.sortable tr').removeClass('hide');
                    data.find('.sortable tr[data-name=nodatadisplay],.sortable tr[data-name=emptydatadisplay]').addClass('hide');

                    reorderenableload();
                }
                refreshSurveyList('active', reorderCallback);
            });
            data.find('[data-name=resetsurveyreorder],[data-name=cancelsurveyreorder]').on('click', function() {
                jQuery(this).closest('.widget-header').find('h4').removeClass('hide');//NO I18N
                data.find('.admin-tbl:eq(0) .tbody .sortable').html(reorderreset);
                reorderreset = '';
                data.find('.sortable .survey-reorder,[data-name=surveyreorderhead]').addClass('hide');
                data.find('.sortable .surveytemp-sett,[data-name=surveynrmlhead]').removeClass('hide');
                reorderdisableload();
                jQuery($origSelection).trigger('click');
                jQuery($origSelection).closest('[data-active=true]').attr("data-active","false");
            });
            data.find('[data-name=applysurveyreorder]').on('click', function() {
                data.find('.sortable .survey-reorder,[data-name=secondmenu] [data-name=surveyreorderhead]').addClass('hide');
                data.find('.sortable .surveytemp-sett,[data-name=secondmenu] [data-name=surveynrmlhead]').removeClass('hide');
                reorderdisableload();
                surveyObject.updateSurveyOrder();
                jQuery($origSelection).closest('[data-active=true]').attr("data-active","false");
            });
            /*** Reorder Tooltip Function ***/
            
            /*** Survey Home Page Filter ****/
            data.find('[data-name=survyfilter] li a').on('click', function() {
                jQuery(this).closest('.btn-group').find('h4').html(jQuery(this).text()+'<span class="caret ml5"></span>');
                var x = jQuery(this).text().replace(/ /g, '').toLowerCase();
                data.find('[data-name=admin-wrapper] .admin-tbl:eq(0) .admin-box .row').addClass('hide');
                jQuery(this).closest('ul').find('li').removeClass('active');
                jQuery(this).parent().addClass('active');
                if (x == 'incidentrequest' || x == 'servicerequest') {
                    data.find('[data-name=admin-wrapper] .admin-tbl:eq(0) .admin-box .row[data-name=' + x + ']').removeClass('hide');
                } else if (x == 'incidentandservice') {//NO I18N
                    data.find('[data-name=admin-wrapper] .admin-tbl:eq(0) .admin-box .row').removeClass('hide');
                } else {
                    data.find('[data-name=admin-wrapper] .admin-tbl:eq(0) .admin-box .row[data-user=' + x + ']').removeClass('hide');
                }
                data.find('[data-name=admin-wrapper] .admin-tbl:eq(0) .admin-box .row[data-name=nodatadisplay],[data-name=admin-wrapper] .admin-tbl:eq(0) .admin-box .row[data-name=emptydatadisplay]').addClass('hide');
                if(data.find('[data-name=admin-wrapper] .admin-tbl:eq(0) .admin-box .row:visible').length < 1) {
                    data.find('[data-name=admin-wrapper] .admin-tbl:eq(0) .admin-box .row[data-name=nodatadisplay]').removeClass('hide');
                }
            });
            data.on('click','[data-name=surveyrptsatisfication]',function() {//NO I18N
                var leftPos = ( jQuery(window).outerWidth() - 1040 )/2;
                id=jQuery(this).attr("data-item-id");
                showURLInDialog('../survey/SurveyPreview.jsp?surveyID='+id, 'modal=yes,closeOnEscKey=yes,closeButton=no,width=1040,position=relative,top=10,left='+leftPos+'');//NO I18N
            });
            /*** Mosue Leave ***/
            data.on('mouseleave', '.admin-tbl tr,.admin-box .row', function() {//NO I18N
                jQuery(this).find('.setting-box').removeClass('open');
            });
            /*** Access this Template **/
            data.on('click','.tech-action',function(){//NO I18N
                jQuery(this).find('span').toggleClass('on').toggleClass('off');//NO I18N
                if( jQuery(this).attr('data-name') == 'surveyfreelayer' ) {
                    data.find('.surveyfreelayer').toggleClass('hide');//NO I18N
                }
            });
            /*** Email Translaion Page ***/
            data.find('select.survey-mail-langselect').select2({
                width: 'auto',//NO I18N
                minimumResultsForSearch: Infinity
            });
            data.on('click','.survey-mail-manageemail .admin-box .row',function(){
                data.find('.survey-mail-manageemail .admin-box .row').removeClass('active');
                jQuery(this).addClass('active');
            });
            data.on('click','[data-id=survey-container-email] [data-name=emailnewtranslation]',function(){
                emailNewTranslation(jQuery(this));
            });
            data.on('click','[data-id=survey-container-email] [data-name=managelanguage]',function(){
                managelanguage();
            });
            
            data.on('click','[data-id=survey-container-email] [data-name=cancelemailtranslation]',function(){
                checkAndHideTranslationList();
            });
            /*** Email Translaion Page ***/
        }
        boot();
        sidebaradminhgt();
        jQuery(window).on('resize', function() {
            //sidebaradminhgt();
        });
    }
})(jQuery);
/**** Survey Home Page ****/
/**** Survey Form Page ****/
(function() {
    jQuery.fn.surveyfrmfn = function(options) {
        var $el = this;
        var isSurveyChanged = false; // For page reload
        var surveyrightform = jQuery('.droppable-rightform');
        /*** Translation Question for new and old ***/
        function translaquesfn(a) {
            var translaques = jQuery(".survey-translation"),
            translaquesform = jQuery(".survey-translation-quesfrm");
            translaquesform.find('.survey-translation-nrmlques .form-droppablearea').html('');
            var form = translaquesform.find(".survey-translation-nrmlques .form-droppablearea").surveyForm({
                "survey_question": window.form.survey_question   //NO I18N
            });
            setTimeout(function(){
                translaques.find('.survtranshead,.listview').addClass('hide');
                translaquesform.removeClass('hide');
                // Input Show In Edit Language
                translaquesform.find('.survey-translation-editques .form-droppablearea').html('');
                var x = translaquesform.find('.survey-translation-nrmlques .form-droppablearea').html();
                translaquesform.find('.survey-translation-editques .form-droppablearea').append(x);
                translaques.find('.survey-translation-quesfrm .form-trashicon,.survey-translation-editques .formnoeffect').remove();
                // Equal height and alignment for H4 tag
                translaquesform.find('.survey-translation-nrmlques h4').attr('style', 'height: ' + translaquesform.find('.survey-translation-editques .select2-container').outerHeight(true) + 'px;');
                // Equal height and alignment for every question
                translaquesform.find('.survey-translation-editques .form-question-container').each(function(index, value) {
                    var placeholertxt = jQuery(this).find('.form-question-name').text();
                    // Title Question
                    if (a) { //for old language
                        jQuery(this).find('.form-question-name').html('<input maxlength="300" type="text" class="form-control" placeholder="' + encodeHTML(placeholertxt) + '" value="'+encodeHTML(a[index].ques_text)+'">');
                    } else { // for new language
                        jQuery(this).find('.form-question-name').html('<input maxlength="300" type="text" class="form-control" placeholder="' + encodeHTML(placeholertxt) + '">');
                    }
                    if (jQuery(this).find('.opinion-scale').length == 1) {
                        jQuery(this).find('.opinion-label-container .opinion-label').each(function(num) {
                            if (a) { //for old language
                                if(num ==0)
                                {
                                    optlabel = a[index].survey_rating_i18n.least_label;
                                }
                                else if(num == 1)
                                {
                                    optlabel = a[index].survey_rating_i18n.mid_label;
                                }
                                else if(num == 2)
                                {
                                    optlabel = a[index].survey_rating_i18n.max_label;
                                }
                                jQuery(this).html('<input type="text" class="form-control fl mt10" placeholder="' + encodeHTML(jQuery(this).text()) + '" value="'+encodeHTML(optlabel)+'">').attr('style','margin-right: 0.33%;');
                            } else { // for new language
                                jQuery(this).html('<input type="text" class="form-control fl mt10" placeholder="' + encodeHTML(jQuery(this).text()) + '">').attr('style','margin-right: 0.33%;');
                            }
                        });
                        //TODO:
                        var wdh = jQuery(this).find('.opinion-scale .field:first-child').width()*jQuery(this).find(".field").length;
                        jQuery(this).find('.opinion-label-container').width(wdh);
                        
                    }
                    if (jQuery(this).find('.binary-value').length == 1) {
                        jQuery(this).find('.binary-value .field-val').each(function(num) {
                            var classattr = jQuery(this).find('i').attr('class');
                            if (a) { //for old language
                                jQuery(this).html('<i class="' + classattr + '"></i><input type="text" class="form-control" placeholder="' + encodeHTML(jQuery(this).text()) + '" value="'+encodeHTML(a[index].survey_radio_i18n[num].option_text)+'" maxlength="10">');
                            } else { // for new language
                                jQuery(this).html('<i class="' + classattr + '"></i><input type="text" class="form-control" placeholder="' + encodeHTML(jQuery(this).text()) + '" maxlength="10">');
                            }
                        });
                    }
                    if (jQuery(this).find('.radio-options').length == 1) {
                        var wdh = 100 / jQuery(this).find('.radio-options .field-val').length;
                        jQuery(this).find('.radio-options .field-val').each(function(num) {
                            if (a) { //for old language
                                jQuery(this).html('<input type="radio"><input type="text" class="form-control" placeholder="' + encodeHTML(jQuery(this).text()) + '" value="'+encodeHTML(a[index].survey_radio_i18n[num].option_text)+'">');
                            } else { // for new language
                                jQuery(this).html('<input type="radio"><input type="text" class="form-control" placeholder="' + encodeHTML(jQuery(this).text()) + '">');
                            }
                        });
                    }
                    if(translaquesform.find('.survey-translation-nrmlques .form-question-container:eq(' + index + ')').height() > jQuery(this).height()) {
                        translaquesform.find('.survey-translation-nrmlques .form-question-container:eq(' + index + ')').attr('style', 'height: ' + translaquesform.find('.survey-translation-nrmlques .form-question-container:eq(' + index + ')').outerHeight(true) + 'px');
                        jQuery(this).attr('style','height:'+translaquesform.find('.survey-translation-nrmlques .form-question-container:eq(' + index + ')').outerHeight(true)+'px');
                    }
                    else {
                        translaquesform.find('.survey-translation-nrmlques .form-question-container:eq(' + index + ')').attr('style', 'height: ' + jQuery(this).outerHeight(true) + 'px');
                        jQuery(this).attr('style','height:'+jQuery(this).outerHeight(true)+'px');
                    }
                });
                translaquesform.find('.survey-translation-editques li:eq(0) .form-question-name input.form-control').trigger('focus');
                showPlaceholder();
                footerpos();
            },0);
        }
        /*** Survey Config input enable disable on radio btn click function ***/
        function suryconfiginput() {
            jQuery('.survey-config .survey-config-form .col-fields').each(function() {
                if (jQuery(this).find('[type=radio]').prop("checked") == true) {
                    jQuery(this).find('.form-control').prop('disabled', false);//NO I18N
                    jQuery(this).find('.form-control').focus();
                } else {
                    jQuery(this).find('.form-control').prop('disabled', true); //NO I18N
                }

            });
        }
        function translaqueshgt() 
        { 
                function translaqueshgtmn() 
                { 
                    if( jQuery('.survey-translation-editques ol li').length != 0 ) 
                    { 
                        jQuery('.surtransedit').height(jQuery('.content-panel-inner').height() - (jQuery('.content-panel-inner .headerbar').outerHeight(true) + jQuery('.content-panel-inner .nav-sdtabs').outerHeight(true) + jQuery('.content-panel-inner .survey-hddtls').outerHeight(true) + jQuery('.content-panel-inner .form-footer').outerHeight(true) ));  
                    } 
                } 
                translaqueshgtmn(); 
            jQuery(window).on('resize', translaqueshgtmn); 
        } 
        var data = this;
        function boot() {
            /*** Survey Configurations Change Function **/
            data.find('[data-name=surconfigchgfn]').on('change', function() {//NO I18N
                var a = jQuery(this).val();
                data.find('.survey-config,.survey-config-general').hide('fast');//NO I18N
                if (a == "1") {
                    jQuery('[data-name=survey-config-incident]').show('fast');//NO I18N
                }
                if (a == "2") {
                    jQuery('[data-name=survey-config-service]').show('fast');//NO I18N
                }
                if (a == "3") {
                    jQuery('[data-name=survey-config-incidentservice]').show('fast');//NO I18N
                }
                jQuery("#criteria_field").show('fast');//NO I18N
                var criteria_options=surveyObject.getTicketCriteriaOptions();
                jQuery("#ticket_criteria").custom_filter(criteria_options);
                if (a == "4") {
                    jQuery('[data-name=survey-config-general]').show('fast');//NO I18N
                    jQuery("#criteria_field").hide();//NO I18N
                    if (!data.find('.survey-recurrencetoggle').hasClass('btn-toggle-slide')) {
                        setTimeout(function() {
                            data.find('.survey-recurrencetoggle').toggleSlider({slider: true,activeClass: 'btn-success'});//NO I18N
                        },1);
                    }
                }
                jQuery(".surveyfilterwrapper").find("li.singlefilterwrapper").not(':first').remove();//NO I18N
                jQuery(".surveyfilterwrapper").find(".columnname").select2("val",-1).trigger('change');//NO I18N
                jQuery(".surveyfilterwrapper").find(".selectcriteria").select2("val",-1).trigger('change');//NO I18N
                jQuery(".surveyfilterwrapper").find(".selectcriteria").select2("close");//NO I18N
                footerpos();
            });
            /*** Survey General Configurations Targeted Audienece Radio button click event for ***/
            data.find('[data-name=allusergroup]').on('click', function() {
                jQuery('#usrgrp_Avaliable').find('li').each(function(){
                    this.click();
                });
                footerpos();
            });
            data.find('[data-name=surveysendreqclosed] label').on('click', function() {
                data.find('[data-name=surveysendgeneral] .col-fields').addClass('hide');
                data.find('[data-name=surveysendreqclosed] .col-fields').show('slow');//NO I18N
                footerpos();
            });
            /*** Form page Survey Recurrence ****/
            jQuery(document).on('click', '.survey-recurrencetoggle', function(e) {//NO I18N
                if(jQuery(this).find('input:checked').val()=='Untick'){
                    jQuery(this).attr("data-value","0");
                    data.find('.survey-recurrence').slideUp('fast');//NO I18N
                }
                else{
                    jQuery(this).attr("data-value","1");
                    data.find('.survey-recurrence').slideDown('fast');//NO I18N

                }
            });
            /*** Form page Survey Recurrence ****/
            /*** Form page preview function ***/
            data.on('click', '[data-name=formpreview]', function() {//NO I18N
                if(data.find('.droppable-rightform .form-question-container').length > 0) {
                    var leftPos = ( jQuery(window).outerWidth() - 1300 )/2;
                    var surveyID=jQuery(this).attr("data-item-id");
                    showURLInDialog('../survey/SurveyPreview.jsp?surveyID='+surveyID, 'modal=yes,closeOnEscKey=yes,closeButton=no,width=1040,height=auto,position=relative,top=10,left='+leftPos+'');//NO I18N
                }
                else {
                    showalert("failure",translate("sdp.admin.survey.question.warning"),'isAutoHide=false');//NO I18N
                }
            });
            /*** Report table Show in Popup ***/
            /*** Survey Form Page Comments Tab ***/
            data.on('keyup', '[data-name=commandvalidation] textarea', function() {//NO I18N
                var lines = [];
                jQuery.each(jQuery(this).val().split('\n'), function(i, line) {
                    if (line) {
                        lines.push(line);
                    }
                });
                if (lines.length >= 1) {
                    data.find('[data-name=commandvalidation] [data-name=surAddCmt]').prop('disabled', false);//NO I18N
                } else {
                    data.find('[data-name=commandvalidation] [data-name=surAddCmt]').prop('disabled', true); //NO I18N
                }
            });
            /*** Survey Form page Translation Tab and Tab nav click ***/
            data.on('click', '.survey-translation-quesfrm [data-name=closeLangfn],.survey-form-wrapper .nav-sdtabs li', function() {//NO I18N
                data.find('.survey-translation .survey-translation-quesfrm').addClass('hide').find('.survey-translation-nrmlques .form-droppablearea li,.survey-translation-editques .form-droppablearea li').remove();
                data.find('.survey-translation .survtranshead, .survey-translation .listview').removeClass('hide');
                jQuery('#selLang').val(0).trigger('change');
            });
            /*** New Language Click ***/
            data.on('click', '.survey-translation [data-name=surveynewLangfn]', function() {//NO I18N
                jQuery("#selLang").removeClass("hide");
                jQuery("#selLang").select2();
                jQuery("#transAction").removeClass("hide");
                jQuery("#transUpdate").addClass("hide");
                jQuery("#selectedLang").addClass("hide");
                translaquesfn();
                translaqueshgt();
            });
            /*** Old Language Click ***/
            data.on('click', '.survey-translation [data-name=surveyoldLangfn]', function() {//NO I18N
                var transID = jQuery(this).attr("data-item-id");
                var language = jQuery(this).attr("data-item-lang");
                var langID = jQuery(this).attr("data-item-langid");
                var surveyID = jQuery(this).attr("data-survey-id");
                data.find('.survey-translation-editques .form-control').val(jQuery(this).text()).change();
                jQuery("#selLang").addClass("hide");
                jQuery("#selectedLang").removeClass("hide").find("h4").html(language+" Translation");//NO I18N
                jQuery("[data-id=survey_translations]").attr("entity-id",transID);
                sdpAjax({
                    url: "/api/v3/survey_translations/"+transID, //No I18N
                    method: "GET", //No I18N
                    skipSUBREQUEST:true,
                    success: function(dataArg)
                    {
                      var trans_details = dataArg.survey_translation;
                      translaquesfn(trans_details.survey_question_i18n);
                    jQuery("#transAction").addClass("hide");
                    jQuery("#transUpdate").removeClass("hide");
                    jQuery("#transUpdate").off("click.addTranslation").on("click.addTranslation",function(){ // No I18N
                        surveyObject.addTranslation(surveyID,transID,langID);
                    });
                     jQuery("#translationHistory").removeClass('hide');
                     }
                });
            });
            /** Description Area ***/
            data.on('click', '[data-id=survey-descriptarea] .tech-action', function() {//NO I18N
                if (jQuery(this).parent().find('input').prop("checked") == true) {
                    jQuery(this).find('span.switch').removeClass('off').addClass('on');
                     data.find('#checkmntdv').removeClass('hide');
                      if(!jQuery("#checkmantr").is(":checked"))
                      {
                           jQuery('#checkmantr').prop( 'checked', false); //NO I18N
                      }
                } 
                else {
                    jQuery(this).find('span.switch').removeClass('on').addClass('off');
                    data.find('#checkmntdv').addClass('hide');
                }
            });
            /*** Template Tab ***/
            data.find('[data-name=survey-templatetab]').on('click', function(e) {
                showURLInDialog('../survey/survey-template.jsp', 'modal=yes,closeOnEscKey=yes,closeButton=no,width=1040,height=800,position=absmiddle');//NO I18N
                setTimeout(function() {
                    data.find('.survey-menu-list').height(data.find('.survey-template-ques').height() - data.find('.survey-template-menu h4').outerHeight(true)).niceScroll();
                    jQuery(".survey-template-menu").niceScroll();
                    jQuery(".survey-template-ques").niceScroll();
                }, 10);
            });
            /*** Survey Template Popup Tab ***/
            data.on('click', '.survey-menu-list-ul li a', function() {//NO I18N
                data.find('.survey-menu-list-ul li').removeClass('active');
                jQuery(this).parent().addClass('active');
                data.find('.survey-template-ques .sdtab-pane').removeClass('active');
                data.find('.survey-template-ques #' + jQuery(this).attr('class')).addClass('active');
            });
            /*** Select2 ***/
            /*** Save Publish And Cancel Survey Main Form ***/
            data.on('click', '[data-name=saveSrymnfrm],[data-name=saveandpublishSrymnfrm],[data-name=cancelSrymnfrm]', function() {//NO I18N
                isSurveyChanged = false;
            });
            /*** survey config form ***/
            data.on('mouseleave', '.survey-translation tr', function() {//NO I18N
                jQuery(this).find('.setting-box').removeClass('open');
            });
            data.on('click', '.survey-config-form .col-fields [type=radio]', function() {//NO I18N
                suryconfiginput();
            });
            data.find('.survey-config-wrapper [data-name=surconfigchgfn],.survey-translation-editques select').select2({
                width: '200px',//NO I18N
                minimumResultsForSearch: Infinity
            }); // custom select
            suryconfiginput();
            /*** Min-height all Tab menu ***/
            jQuery(window).on('resize', function() {
                pagehgtfix();
            });
        }
        boot();
        // Min-height for page alignment and change function in product
        function pagehgtfix() {
            var hgt = jQuery(window).height() - (jQuery('#header-placeholder').outerHeight(true) + 20);
            jQuery('.content-panel-inner').css({
                'min-height': hgt + 'px',//NO I18N
                'display': 'block'//NO I18N
            });
            if(jQuery('.survey-wrapper').length == 1) {                
                jQuery('.surveyreport').css('height',(hgt - parseInt(jQuery('.headerbar').height() + jQuery('.survey-hddtls').height() + jQuery('.survey-wrapper .survey-form-wrapper .sdtabs-ui1 .nav-sdtabs').height()) - 30)+'px');   //NO I18N         
            } 
        }
        pagehgtfix();
        /*** Page Scroll Event and Fixed Header Bar ***/
        function headerpos() {
            jQuery('.admin-panel').removeAttr('style'); //No I18N
            var top = 120; 
            function fixHeaderBar() {
                var width = jQuery('.admin-panel').outerWidth(true); //No I18N
                var scrollPos = jQuery(window).scrollTop();
                if (scrollPos > top) {
                    jQuery('.headerbar').addClass("headerbar-fixed"); //No I18N
                    jQuery('.headerbar').css({
                        "width": width//NO I18N
                    }); //No I18N
                    jQuery('.survey-hddtls').attr('style', 'padding-top:' + (jQuery('.headerbar-fixed').height()+10) + 'px');
                } else {
                    jQuery('.headerbar').removeClass("headerbar-fixed"); //No I18N
                    jQuery('.headerbar,.survey-hddtls').removeAttr('style'); //No I18N
                }
            }
            jQuery(window).on('scroll', fixHeaderBar);
            fixHeaderBar();
        }
        function footerpos() {
           /* function fixFooterBar() {
                if (jQuery('.survey-container').length != 1 || jQuery('#_DIALOG_LAYER').css('visibility') == 'hidden') {
                    var width = jQuery('.admin-panel').outerWidth(true); //No I18N
                    jQuery('[data-name="footer"]').css({"width": width}); //No I18N
                }
            }
            jQuery(window).scroll(fixFooterBar);
            fixFooterBar();*/
        }
        footerpos();
        jQuery(window).on('resize', function() {
            footerpos();
        });
        /*** Page Scroll Event and Fixed Header Bar ***/
        /*** Load Before Check Function ***/
        window.onbeforeunload = function(e) {
            if (isSurveyChanged) {
                return "Dashboard has been modifed. Leaving this page will discard all changes?"; //No I18N
            }
        }
        return $el;
    }
})(jQuery);
/**** Survey Form Page ****/
/*** Form Drag Section ***/
(function() {
    jQuery.fn.formdragsection = function(options) {
        var data = this;
        
        var radiobutton={ques_type:"Radio",ques_text:"",is_mandatory:!1,survey_radio:[{option_text:translate("sdp.admin.survey.question.radio.dummy1"),order:"",multiplier:""},{option_text:translate("sdp.admin.survey.question.radio.dummy2"),order:"",multiplier:""},{option_text:translate("sdp.admin.survey.question.radio.dummy3"),order:"",multiplier:""},{option_text:translate("sdp.admin.survey.question.radio.dummy4"),order:"",multiplier:""},{option_text:translate("sdp.admin.survey.question.radio.dummy5"),order:"",multiplier:""}],properties:{trail:!1}};//NO I18N
        var binaryvalue={ques_text:"",answer:!1,ques_type:"binaryValue",is_mandatory:!1,survey_radio:[{option_text:translate("sdp.admin.settings.yes"),multiplier:10},{option_text:translate("sdp.admin.settings.no"),multiplier:1}],properties:{className:{selected:"selected",unselected:"",option_1:"cspr icon-sm thumbs-up",option_2:"cspr icon-sm thumbs-down"},trail:!1}};//NO I18N
        var opinionscale={ques_text:"",answer:void 0,ques_type:"Rating",is_mandatory:!1,survey_rating:{least_val:1,least_label:translate("sdp.admin.survey.opinionscale.low"),max_val:5,max_label:translate("sdp.admin.survey.opinionscale.high"),mid_label:translate("sdp.admin.survey.opinionscale.mid")},properties:{step:1,trail:!1}};//NO I18N
        var rating={ques_text:"",answer:void 0,ques_type:"starRating",is_mandatory:!1,survey_rating:{least_val:1,max_val:5},properties:{name:"rate-service",className:{selected:"aspr star-fill1 icon-lg",unselected:"aspr star-empty1 icon-lg"},step:1,trail:!1}};//NO I18N

        var isSurveyChanged = false; // For page reload
        var droppablerightform = jQuery('.droppable-rightform');
        var databdy = data.closest('body');//NO I18N
        /*** Survey Popup Form Save, Cancel and Remove ***/
        function saveform() {
            var index = droppablerightform.find('li.active').index();
            var popUp = jQuery('#question-popup-form');
            var type = jQuery(popUp).find('#quesChange').val();
            form.survey_question[index].ques_text = jQuery(popUp).find(".form-questxt textarea").val();
            form.survey_question[index].is_mandatory = jQuery("#icheckbox1").prop("checked");//NO I18N
            if(type=="Rating")
            {
                form.survey_question[index].ques_type = "starRating";
                var el = jQuery(popUp).find(".form-rating-scale .formpopupSlider");
                form.survey_question[index].survey_rating.max_val = jQuery(el).slider("option","value");//NO I18N
                form.survey_question[index].survey_rating.least_label="NA";
                form.survey_question[index].survey_rating.mid_label="NA";
                form.survey_question[index].survey_rating.max_label="NA";
            }
            else if(type=="Opinion Scale")
            {
                form.survey_question[index].ques_type = "Rating";
                var el = jQuery(popUp).find(".form-opinionscale-scale .formpopupSlider");
                form.survey_question[index].survey_rating.max_val = jQuery(el).slider("option","value");//NO I18N
                
                var left = form.survey_question[index].survey_rating.least_label = jQuery("[data-id=opinion-scale-left-range]").val().trim();
                var mid = form.survey_question[index].survey_rating.mid_label = jQuery("[data-id=opinion-scale-center-range]").val().trim();
                var right = form.survey_question[index].survey_rating.max_label = jQuery("[data-id=opinion-scale-right-range]").val().trim();

                if(!(left && mid && right)){
                    showalert("failure", translate("sdp.admin.survey.question.optionnoempty"), "isAutoHide=false");//NO I18N
                    return;
                }
            }
            else if(type=="Binary Value")
            {
                form.survey_question[index].ques_type = "binaryValue";
                opt=[];
                var option1 = {};
                option1.option_text = jQuery("#option1text").val().trim();
                opt.push(option1);
                var option2 = {}
                option2.option_text = jQuery("#option2text").val().trim();
                opt.push(option2);

                option1.multiplier = 10;   
                option2.multiplier = 1;
                if(jQuery("#option1val").text() == "Min")
                {
                    option1.multiplier = 1;   
                    option2.multiplier = 10;
                }
                
                form.survey_question[index].survey_radio = opt;

                if(!(option1.option_text && option2.option_text)){
                    showalert("failure", translate("sdp.admin.survey.question.optionnoempty"), "isAutoHide=false");//NO I18N
                    return;
                }
                
            }
            else if(type=="Radio Button")
            {
                form.survey_question[index].ques_type = "Radio";
                form.survey_question[index].survey_radio.length = 0;
                opt = [];
                flag = 1;
                jQuery(".form-radiobutton-scale #colsort").find('li').each(function(optno){
                    option = {};
                    option.option_text = jQuery(this).find(".item input").val().trim();
                    option.multiplier = jQuery(this).find(".radio-status-value").text();
                    opt.push(option);
                    flag = flag && option.option_text;

                }); 
                form.survey_question[index].survey_radio = opt;

                if(!flag){
                    showalert("failure", translate("sdp.admin.survey.question.optionnoempty"), "isAutoHide=false");//NO I18N
                    return;
                }
            }

            jQuery('.questnameval').validate({
                rules: {
                    questname : {
                        required: true
                    }
                },
                messages: {
                    questname : {
                        required: translate("sdp.admin.survey.question.placeholder")
                    }
                },
                errorClass: 'text-danger',//NO I18N
                errorPlacement: function( error, element ) {
                    position = element.position();
                    error.insertAfter( element )
                    error.addClass( 'alert alert-danger alert-arrow p5 left10' ).css({ 'position':'absolute','overflow':'visible','bottom': '-40px','z-index':'99' });//NO I18N
                    element.focus();
                }
            });
            
            jQuery('.questnameval').valid();

            if ( jQuery('.questnameval').valid()) {
                jQuery('.question-popup-form').slideUp(500);
                setTimeout(function() {
                    droppablerightform.find('li').removeClass('active');
                    jQuery('.question-popup-form,#FreezeLayer').remove();
                    jQuery("#surveyform").html('');
                    jQuery("#surveyform").surveyForm(form);
                }, 600);
            }
        }
        function cancelremoveform() {
            jQuery('.question-popup-form').slideUp(500);
            setTimeout(function() {
                var index = droppablerightform.find('li.active').index();
                form.removeQuestion(index);
                droppablerightform.find('li.active').remove();
                jQuery('.question-popup-form,#FreezeLayer').remove();
                surveyemptyaction();
            }, 600);
        }
        function cancelform() {
            jQuery('.question-popup-form').slideUp(500);
            setTimeout(function() {
                //remove and add question to restore old state
                form.removeQuestion(databdy.index);
                form.createQuestion(jQuery('#surveyform'), databdy.index, databdy.origQuestions[databdy.index]);
                if(databdy.index != 0){
                    form.survey_question.splice(databdy.index, 0, databdy.origQuestions[databdy.index]);
                    form.answers.splice(databdy.index, 0, databdy.origAnswers[databdy.index]);
                }else{
                    form.survey_question.unshift(databdy.origQuestions[databdy.index]);
                    form.answers.unshift(databdy.origAnswers[databdy.index]);
                }

                droppablerightform.find('li').removeClass('active');
                jQuery('.question-popup-form,#FreezeLayer').remove();
            }, 600);
        }
        /*** Survey Popup Form Save, Cancel and Remove ***/
        /*** Popup Ascending Decending / min and max function ***/
        function binaryscalesort(a, b) {
            var firstlabel = databdy.find(".form-binaryvalue-scale .input-group:eq(" + a + ") [data-name=input-group-addonval]");
            var secondlabel = databdy.find(".form-binaryvalue-scale .input-group:eq(" + b + ") [data-name=input-group-addonval]");
            var atxt = firstlabel.text();
            var btxt = secondlabel.text();
            firstlabel.text(btxt);
            secondlabel.text(atxt);
        }
        /*** Popup Question Binary keypress event ***/
        function binarychoicetype(a, b) {
            jQuery(".form-binaryvalue-scale .input-group:eq(" + a + ") .input-group-addonlabel").text(b);
            if (droppablerightform.find('li').hasClass('active')) {
                var i = droppablerightform.find('li.active .binary-value .field-val:eq(' + a + ') i').attr('class');
                droppablerightform.find('li.active .binary-value .field-val:eq(' + a + ')').html('<i class="' + i + '"></i>' + b);
            }
        }
        function getOrderedRadioData(){
            var radstatueli = databdy.find(".form-radio-status li ");
            var retVal={}
            radstatueli.each(function(index,el){
                el = jQuery(el);
                var key = el.find(".radio-status-value").text();
                var value = el.find(".form-control").val();
                retVal[key]=value
            });
            return retVal;

        }
        function radiobuttonscalesort(a) 
        {
            var liContents = [],liValues=[];
            var radstatueli = databdy.find(".form-radio-status li");
            var orderedData = getOrderedRadioData();
            radstatueli.each(function(index,el) {
                liContents.push(jQuery(this).find('.item input').val());
            liValues.push(
                parseInt(jQuery(this).find('.radio-status-value').text())
                );
                 jQuery(el).find('.radio-status-value').text(jQuery(el).find('.item input').attr('data-index'));
            });
           if (a) {
               liValues.sort(numOrdDesc);
           } else {
               liValues.sort(numOrdDesc1);
           }



        radstatueli.map(function(el){
            var currentValue = liValues.pop();
            var currentText = orderedData[currentValue];

             jQuery(this).find('.item input').val(currentText);
             jQuery(this).find('.radio-status-value').text(currentValue)

        });

        }
        function numOrdDesc1(a, b) {
            return (b - a);
        }
        function numOrdDesc(a, b) {
            return (a - b);
        }
        /*** Popup Question loading scripts ***/
        function popupruntimescript() {
            jQuery('.form-radio-status').sortable({
                handle: ".drag1",//NO I18N
                create: function(e, ui){
                    var currentIndex;
                	setTimeout(function(){
                    	data.closest('body').find('.form-radio-status li').each(function(index) {//NO I18N
                           currentIndex = jQuery(this).find('.radio-status-value').text();
                            if(!currentIndex){
                            jQuery(this).find('.radio-status-value').text(index + 1);
                            currentIndex = index+1;
                        }
                        jQuery(this).find('input').data('index',currentIndex).attr('data-index',currentIndex); // NO I18N
                        });
                	},500);
                },
                start: function(e, ui) {
                    ui.placeholder.height(ui.item.height());
                },
                update: function(e, ui) {
                    // Radio question index value
                    data.closest('body').find('.form-radio-status li').each(function(index, value) {//NO I18N
                        //jQuery(this).find('.radio-status-value').text(index + 1);
                    });
                    radioquestchange();
                }
            });
            /*** for custom selectbox ***/
            if (!data.closest('body').find('#quesChange,.quesradioalign').prev().hasClass('select2-container')) {
                data.closest('body').find('#quesChange,.quesradioalign').select2({//NO I18N
                    width: '120px',//NO I18N
                    minimumResultsForSearch: Infinity
                });
            }
            data.closest('body').find('.formpopupSlider').slider({//NO I18N
                range: "min",//NO I18N
                value: 5,
                min: 1,
                max: 10,
                step: 1,
                create: function( event, ui ) {
                    if (droppablerightform.find('li.active .form-question-option>div').attr('data-name') == 'Opinion Scale') {
                        var wdh = droppablerightform.find('.active .opinion-scale .field').length*droppablerightform.find('.active .opinion-scale .field').width();
                        droppablerightform.find('.active .opinion-scale .opinion-label-container').width(wdh);
                    }
                },
                slide: function(event, ui){
                	var q_type = jQuery("#quesChange").val();
                    var limit = 0;
                    if(q_type == "Opinion Scale"){//No I18N
                        limit = 3;
                    }else if(q_type = "Rating"){//No I18N
                        limit = 2;
                    }
                    if(ui.value < limit){
                        showalert("failure", translate("sdp.admin.survey.slider.minvalue")+limit, "isAutoHide=false");//No I18N
                        return false;
                    }
                },
                stop: function(event, ui) {
                    // Slider Function for Rating
                    if (droppablerightform.find('li.active .form-question-option>div').attr('data-name') == 'Rating') {
                        droppablerightform.find('.active .star-rating').html('');
                        var xhtml = '<div class="field"></div>';
                        for (var i = ui.value; i >= 1; i--) {
                            droppablerightform.find('.active .star-rating').prepend(xhtml);
                            droppablerightform.find('.active .star-rating .field:eq(0)').html('<input type="radio" value="' + i + '" name="rate-service" class="opacity0"><div class="field-val"><i class="aspr star-empty1 icon-lg"></i><div>' + i + '</div></div>');
                        }
                    }
                    // Slider Function for Opinion Scale
                    if (droppablerightform.find('li.active .form-question-option>div').attr('data-name') == 'Opinion Scale') {
                        droppablerightform.find('.active .opinion-scale div:eq(1)').html('');
                        droppablerightform.find('.active .formnoeffect').after(xhtml);
                        var xhtml = '<div></div>';
                        for (var i = ui.value; i >= 1; i--) {
                            droppablerightform.find('.active .opinion-scale div:eq(1)').prepend('<div class="field"><input type="radio" class="opacity0" name="undefined" value="' + i + '"><div class="field-val ">' + i + '</div></div>');
                        }
                        var wdh = droppablerightform.find('.active .opinion-scale .field').length*droppablerightform.find('.active .opinion-scale .field').width();
                        droppablerightform.find('.active .opinion-scale .opinion-label-container').width(wdh);
                        //var wdh = (jQuery('.opinion-scale .opinion-label-container').width() - jQuery('.opinion-scale div .field:first-child').width()) / 2;
                        //jQuery('.form-droppablearea .opinion-scale .label-center').attr('style','left:'+wdh+'px;');
                    }
                }
            }).each(function() { //Rating Number Generation
				var opt = jQuery(this).data('ui-slider').options;//No I18N
				var vals = opt.max - opt.min;
				for (var i = 0; i <= vals; i++) {
						var el = jQuery('<label>' + (i + 1) + '</label>').css('left', (i / vals * 100) + '%');
					jQuery(".formpopupSlider").append(el);
				}
            });
        }
        /*** Popup Question loading scripts ***/
        /*** Question Popup ***/
        function editQuestion(a, c) {
            //Which ques is active and their top left height
            var activequeshgt = droppablerightform.find('li:eq(' + a + ')');
            var activequestop = parseInt(activequeshgt.offset().top + activequeshgt.outerHeight()) + "px";//NO I18N
            if(parent.sdp_user.DIRECTION == 'LTR') {
                var activequesleft = parseInt(activequeshgt.offset().left +50) + "px";//NO I18N
            }
            if(parent.sdp_user.DIRECTION == 'RTL') {
                var activequesleft = parseInt(activequeshgt.offset().left +450);
            }
            if (jQuery('.question-popup-form').length == 0) {
                jQuery.get("/survey/question-form.jsp", function(data) {
                    jQuery('body').append(data);
                    var wdt = jQuery(document).width();
                    var hgt = jQuery(document).height();
                    jQuery('body').append('<div id="FreezeLayer" class="freezeLayer" style="width: ' + wdt + 'px; background: none; z-index: 99; height: ' + hgt + 'px;"></div>');
                    jQuery('.question-popup-form').slideDown(400).removeClass('hide');
                    setTimeout(function() {
                        jQuery('.question-popup-form').css({
                            'top': activequestop,//NO I18N
                            'left': activequesleft//NO I18N
                        });
                    }, 10);
                    popupruntimescript();
                });
            } else {
                jQuery('.question-popup-form').css({
                    'top': activequestop,//NO I18N
                    'left': activequesleft//NO I18N
                });
            }
            //jQuery('.survey-descriptarea').removeClass('hide'); //Addtional Comments
            jQuery('[data-id=survey-descriptarea]').removeClass('hide'); //Addtional Comments
            /*** Hide and Show Popup Question Type ***/
            setTimeout(function() {
                jQuery('.form-questype-list .form-popup-scale .col-fields').addClass('hide');
                jQuery('.form-questype-list .form-popup-scale .form-' + c + '-scale').removeClass('hide');
                jQuery('.form-popup-ques .form-questxt textarea').trigger('keyup');
                var txt = droppablerightform.find('li:eq(' + a + ') .form-question-name').text();
                jQuery('.form-popup-ques .form-questxt textarea').val(txt).trigger('focus'); // Input Question filed
                jQuery('#quesChange').removeAttr('data-name'); //for new question or select box change question//NO I18N
            }, 410);
        }
        // For popup radio question changes ( Sortable, Bulk add and Delete )
        function radioquestchange() {
            var activequeshgt = droppablerightform.find('.active');
            droppablerightform.find('.active .field').html('');
            var xhtml = '<div class="field-val"></div>';
            for (var i = jQuery('.form-radio-status li').length; i > 0; i--) {
                var txt = jQuery('.form-radio-status li:eq(' + (i - 1) + ') .item input').val();
                var id = "12345" + (i - 1);
                droppablerightform.find('.active .field').prepend(xhtml);
                droppablerightform.find('.active .field .field-val:eq(0)').html('<label for="' + id + '"><input type="radio" name="name" value="' + id + '" id="' + id + '">' + encodeHTML(txt) + '</label>');
            }
            // Trash icon hide for 2 fields
            // Height and alignment in popup
            var a = droppablerightform.find('.active').index();
            var b = droppablerightform.find('li:eq(' + a + ')');
            var x = parseInt(b.offset().top + b.outerHeight()) + "px";//NO I18N
            if(parent.sdp_user.DIRECTION == 'LTR') {
                var y = parseInt(activequeshgt.offset().left +50) + "px";//NO I18N
            }
            if(parent.sdp_user.DIRECTION == 'RTL') {
                var y = parseInt(activequeshgt.offset().left +450);
            }
            setTimeout(function() {
                jQuery('.question-popup-form').css({
                    'top': x,//NO I18N
                    'left': y//NO I18N
                });
            }, 10);
        }
        /*** Popup star rating Slider label value change for question star rating field length ***/
        function starratsliderlbl(a) {
            setTimeout(function() {
                jQuery('.formpopupSlider').slider({
                    value: droppablerightform.find('li:eq(' + a + ') .form-question-option .field').length
                });
            }, 410);
        }
        /*** Opinion scale input text change for question opinion field length ***/
        function opinscleinputlbl(a) {
            var txtleft = droppablerightform.find('li:eq(' + a + ') .opinion-label-container .label-left').text();
            var txtright = droppablerightform.find('li:eq(' + a + ') .opinion-label-container .label-right').text();
            var txtcenter = droppablerightform.find('li:eq(' + a + ') .opinion-label-container .label-center').text();
            setTimeout(function() {
                databdy.find('.form-popup-ques [data-id=opinion-scale-left-range]').val(txtleft);
                databdy.find('.form-popup-ques [data-id=opinion-scale-right-range]').val(txtright);
                databdy.find('.form-popup-ques [data-id=opinion-scale-center-range]').val(txtcenter);
            }, 410);
        }
        /*** Binary value input field change for question binary field length ***/
        function bnrvalinputlbl(index) {
            var value = form.survey_question[index].survey_radio[0].multiplier;
            var txtmin,txtmax;
            if(value==10)
            {
                txtmax=form.survey_question[index].survey_radio[0].option_text;
                txtmin=form.survey_question[index].survey_radio[1].option_text;
            }
            else
            {
                txtmax=form.survey_question[index].survey_radio[1].option_text;
                txtmin=form.survey_question[index].survey_radio[0].option_text;
            }
            setTimeout(function() {
                databdy.find('.form-popup-ques [data-name=formbinaryactval] input').val(txtmax);
                databdy.find('.form-popup-ques [data-name=formbinarydeactval] input').val(txtmin);
            }, 410);
        }
        /*** Radio Btn Two Select Box for question radio field ***/
        function radiobtnalign(index) {
            setTimeout(function() {
                var xhtml = '';
                if(index != -1)
                {
                    for (var i = 0; i < form.survey_question[index].survey_radio.length; i++)
                    {
                        xhtml = xhtml + '<li class="p5 visi-parent"  style="height: 28px;"><span class="cspr drag1 icon-xs pos-abs top10"></span><span class="item disp-ib ml20" style="width: 80%;"><input type="text" maxlength="100" class="form-control form-control-nooutline" value="' + encodeHTML(form.survey_question[index].survey_radio[i].option_text) + '"></span><span class="cspr trash icon-sm visi-item pos-abs cur-ptr" data-id="trash"></span><span class="radio-status-value pos-abs pt10 right0 tc top0">' +  form.survey_question[index].survey_radio[i].multiplier + '</span></li>';
                    }
                }
                databdy.find('.form-popup-ques .form-radio-status').html(xhtml);
                databdy.find('.form-popup-ques .widget-header [data-name=quesradioalign],.form-popup-ques .h3 .customselect:eq(1)').removeClass('hide'); // Radion Btn Two Selectbox
            }, 410);
        }
        /*** Survey Empty Action ***/
        function surveyemptyaction() {
            //if(options.survey) {
                if (droppablerightform.find('.form-droppablearea li').length > 0) {
                    droppablerightform.find('.emptysurveyform').addClass('hide');
                    droppablerightform.find('[data-id=survey-descriptarea]').removeClass('hide');
                }
                else {
                    droppablerightform.find('.emptysurveyform').removeClass('hide');
                    droppablerightform.find('[data-id=survey-descriptarea]').addClass('hide');
                }
            //}
        }
        /*** Active Class for Question Container ***/
        function activeques(x) {
            droppablerightform.find('li').removeClass('active');
            droppablerightform.find('li:eq(' + x + ')').addClass('active');
            surveyemptyaction();
        }
        /*** Trigger and Click Event Call ***/
        function quesChangefn1(a, b) {
            activeques(b);
            droppablerightform.find('.form-question-container').each(function(index, value) {
                if (jQuery(this).hasClass('active')) {
                    if (a == 'rating') {
                        if (jQuery('#quesChange').attr('data-name') == 'clicktrigger') {
                            var dummy_rating = jQuery.extend(true, {}, rating);
                            form.addQuestion(dummy_rating, index);
                            activeques(b);
                        }
                        editQuestion(index, 'rating');//NO I18N
                        starratsliderlbl(index);
                    }
                    if (a == 'opinionscale') {
                        if (jQuery('#quesChange').attr('data-name') == 'clicktrigger') {
                            var dummy_opinionscale = jQuery.extend(true, {}, opinionscale);
                            form.addQuestion(dummy_opinionscale, index);
                            activeques(b);
                        }
                        editQuestion(index, 'opinionscale');//NO I18N
                        starratsliderlbl(index);
                        opinscleinputlbl(index);
                    }
                    if (a == 'binaryvalue') {
                        if (jQuery('#quesChange').attr('data-name') == 'clicktrigger') {
                            var dummy_binaryvalue = jQuery.extend(true, {}, binaryvalue);
                            form.addQuestion(dummy_binaryvalue, index);
                            activeques(b);
                        }
                        editQuestion(index, 'binaryvalue');//NO I18N
                        bnrvalinputlbl(index);
                    }
                    if (a == 'radiobutton') {
                        if (jQuery('#quesChange').attr('data-name') == 'clicktrigger') {
                            var dummy_radiobutton = jQuery.extend(true, {}, radiobutton);
                            form.addQuestion(dummy_radiobutton, index);
                            activeques(b);
                        }
                        editQuestion(index, 'radiobutton');//NO I18N
                        radiobtnalign(index);
                    }
                }
            });
        }
        function quesheadertrigger(a, b) { // Question popup header select change trigger
            setTimeout(function() {
                databdy.find('#changeselect').val('Question');//NO I18N
                databdy.find('#quesChange').val(a).change();
                if (b) {
                    databdy.find('#techselect-16').val('One By One').change();//NO I18N
                }
                databdy.find('.form-questxt textarea').focus();
            }, 410);
            setTimeout(function() {
                databdy.find('#changeselect').val('');
            }, 1000);
        }
        /*** Question Popup ***/
        function init() {
            var startIndex,stopIndex;
            data.find(".droppable-rightform .form-droppablearea").sortable({
                start: function(e, ui) {
                    ui.placeholder.height(ui.item.height());
                    startIndex = jQuery(ui.item).index();
                },
                stop: function(e, ui){
                    stopIndex = jQuery(ui.item).index();
                    if((startIndex != stopIndex) &&  (startIndex != -1))
                    {
                        var temp = form.survey_question[startIndex];
                        form.survey_question.splice(startIndex,1);
                        form.survey_question.splice(stopIndex,0,temp);
                    }
                    startIndex = -1;
                    stopIndex = -1;
                },
                update: function(event, ui) {
                    var x = ui.item.index();
                    var dataname = ui.item.attr('data-name');
                    if( dataname == 'rating' ) {
                        ui.item.remove();
                        var dummy_rating = jQuery.extend(true, {}, rating);
                        form.addQuestion(dummy_rating, x);
                        quesChangefn1('rating', x);//NO I18N
                        quesheadertrigger('Rating');//NO I18N
                    }
                    if( dataname == 'opinionscale' ) {
                        ui.item.remove();
                        var dummy_opinionscale = jQuery.extend(true, {}, opinionscale);
                        form.addQuestion(dummy_opinionscale, x);
                        quesChangefn1('opinionscale', x);//NO I18N
                        quesheadertrigger('Opinion Scale');//NO I18N
                    }
                    if( dataname == 'binaryvalue' ) {
                        ui.item.remove();
                        var dummy_binaryvalue = jQuery.extend(true, {}, binaryvalue);
                        form.addQuestion(dummy_binaryvalue, x);
                        quesChangefn1('binaryvalue', x);//NO I18N
                        quesheadertrigger('Binary Value');//NO I18N
                    }
                    if( dataname == 'radiobutton' ) {
                        ui.item.remove();
                        var dummy_radiobutton = jQuery.extend(true, {}, radiobutton);
                        form.addQuestion(dummy_radiobutton, x);
                        quesChangefn1('radiobutton', x);//NO I18N
                        quesheadertrigger('Radio Button');//NO I18N
                    }
                },
                receive: function(e, ui) {
                    ui.sender.data('copied', true);//NO I18N
                }
            });
            data.find(".form-draggablearea").sortable({
                connectWith: ".droppable-rightform .form-droppablearea",//NO I18N
                helper: function(e, li) {
                    this.copyHelper = li.clone().insertAfter(li);
                    jQuery(this).data('copied', false);//NO I18N
                    return li.clone();
                },
                stop: function() {
                    var copied = jQuery(this).data('copied');//NO I18N
                    if (!copied) {
                        this.copyHelper.remove();
                        jQuery(this).sortable('cancel');//NO I18N
                    }
                    this.copyHelper = null;
                }
            });
            /*** Popup Question name change keyup function ***/
            databdy.on('keyup', '.form-questxt textarea', function() {//NO I18N
                if(jQuery(this).val() != '' ) {
                    var a = jQuery(this).val();
                    if (droppablerightform.find('li').hasClass('active')) {
                        droppablerightform.find('li.active .form-question-name').text(a);
                    }
                    if (a == '') {
                        droppablerightform.find('li.active .form-question-name').text(jQuery(this).attr('placeholder'));
                    }
                    // Height and alignment in popup
                    var a = droppablerightform.find('.active').index();
                    var b = droppablerightform.find('li:eq(' + a + ')');
                    var x = parseInt(b.offset().top + b.outerHeight()) + "px";//NO I18N
                    var y = parseInt(b.offset().left+50) + "px";//NO I18N
                    setTimeout(function() {
                        databdy.find('#quesChange').removeAttr('data-name');//NO I18N
                    }, 10);
                }
            });
            /*** Popup Question name change keyup function ***/
            /** Question Click Change Event **/
            databdy.on('change', '.form-popup-ques select#quesChange', function() {//NO I18N
                if (databdy.find('#changeselect').val() == '') {
                    var a = jQuery(this).val().replace(/ /g, '').toLowerCase();
                    var index = droppablerightform.find('.active').index();
                    databdy.find('#quesChange').removeAttr('data-name').attr('data-name', 'clicktrigger');//NO I18N
                    quesChangefn1(a, index);
					setTimeout(function(){
						if(a == 'radiobutton') {
							databdy.find('.form-radio-status li').each(function(index, value) {
								jQuery(this).find('.radio-status-value').text(index + 1);
							});
						}
					},500);
                    form.removeQuestion(index+1);
                }
            });
            databdy.on('change', '.form-popup-ques select.quesradioalign', function() {//NO I18N
                if (jQuery(this).val() == 'One By One') {
                    droppablerightform.find('li.active').find('.form-radio-btn').addClass('formradiooneby');
                } else {
                    droppablerightform.find('li.active').find('.form-radio-btn').removeClass('formradiooneby');
                }
                radioquestchange();
            });
            databdy.on('click', '.droppable-rightform .form-settingicon', function(e) {//NO I18N
                e.preventDefault();
                e.stopPropagation();
                if(options.survey) {
                    var classname = jQuery(this).closest('.form-question-container').find('.form-question-option>div').attr('data-name');//NO I18N

                    //this stores some values for when the edit is cancelled, needed to restore qusetion to old state
                    databdy.classname = classname;
                    databdy.index = jQuery(this).closest('.form-question-container').index();//NO I18N
                    databdy.origQuestions = jQuery.extend(true, {}, form.survey_question);
                    databdy.origAnswers = jQuery.extend(true, {}, form.answers);

                    quesChangefn1(classname.replace(/ /g, '').toLowerCase(), jQuery(this).closest('.form-question-container').index());
                    if (jQuery(this).closest('.form-question-container').find('.form-question-option div:first-child').hasClass('formradiooneby')) {
                        quesheadertrigger(classname, 1);
                    } else {
                        quesheadertrigger(classname);
                    }
                    var x = jQuery(this).closest('.form-question-container').find('.form-question-name').hasClass('mandatory-field'); // Mandatory Question//NO I18N
                    setTimeout(function() {
                        if (x) { // Mandatory Question
                            databdy.find('.form-scale-info .checkmandatory').prop('checked', true); //NO I18N
                        }
                        databdy.find('[data-name=saveformpopup]').text(translate("sdp.common.update"));//NO I18N
                        databdy.find('[data-name=closepopupform]').attr('data-name', 'cancelsurveyform');
                    }, 500);
                }
            });
            /** Question Click Change Event **/
            /*** Check Mandatory Question **/
            databdy.on('click', '.form-scale-info .checkmandatory', function() {//NO I18N
                if (jQuery(this).prop("checked") == true) {
                    droppablerightform.find('li.active .form-question-name').addClass('mandatory-field');
                } else {
                    droppablerightform.find('li.active .form-question-name').removeClass('mandatory-field');
                }
            });
            /*** Check Mandatory Question **/
            /*** Save and Cancel Survey form fn ****/
            databdy.on('click', '.widget-header [data-name=closepopupform],.footer [data-name=cancelremoveformpopup]', function() {//NO I18N
                cancelremoveform();
            });
            databdy.on('click', '.widget-header [data-name=cancelsurveyform]', function() {//NO I18N
                cancelform();
            });
            databdy.on('click', '.footer [data-name=saveformpopup]', function() {//NO I18N
                saveform();
            });
            /*** Remove Survey Question ***/
            data.on('click', '.droppable-rightform .form-trashicon', function(e) {//NO I18N
                e.preventDefault();
                e.stopPropagation();
                showconfirm(true,'title='+translate("sdp.dashboard.common.confirmdelete")+',message='+translate("sdp.admin.survey.delete.option.confirm")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes', showconfirmcallback,true);//NO I18N
                var index = jQuery(this).closest('li').index();//NO I18N
                function showconfirmcallback(s){
                    if(s){
                        form.removeQuestion(index);
                        jQuery(this).closest('li').remove();//NO I18N
                        surveyemptyaction();
                    }
                }
                
            });
            /*** Save and Cancel Survey form fn ****/
            /*** Survey Bulk Add Button ***/
            databdy.on('click', '[data-name=formpopupbulkadd]', function() {//NO I18N
                var hgt = databdy.find('.form-radiobutton-scale .form-radio-status').height() + 90;
                var textareatxt = '';
                databdy.find('.form-radio-status li').each(function() {
                    textareatxt = textareatxt + jQuery(this).find('.item input').val() + '\n';//NO I18N
                });
                databdy.find('.form-radiobutton-scale .formpopupbulkadd').animate({left:'-10px'},200);//NO I18N
                databdy.find('#quesChange').prop('disabled',true); //NO I18N
                var hgt1 = databdy.find('[data-id=form-popup-rating-symbl]').height() + databdy.find('.questnameval .footer').height() + 30;
                databdy.find('.questnameval .form-scale-info,.questnameval .footer').addClass('hide');
                databdy.find('.formpopupbulkadd').height(hgt1);
                databdy.find('.questnameval .form-questype-list').height(hgt1 + 20);
                setTimeout(function() {
                    databdy.find('.form-radiobutton-scale .formpopupbulkadd').removeClass('hide').find('textarea').val('').height(hgt1 - 30).val(textareatxt).focus();
                }, 200);
            });
            /*** Cancel Bulk add ***/
            databdy.on('click', '[data-name=formbulkcancel]', function() {//NO I18N
				databdy.find('.form-radiobutton-scale .formpopupbulkadd').animate({left:'110%'},200);
                databdy.find('#quesChange').prop('disabled',false); //NO I18N
                databdy.find('[data-name=saveformpopup]').prop('disabled', false);//NO I18N
                databdy.find('.questnameval .form-questype-list').removeAttr('style');//NO I18N
                databdy.find('.questnameval .form-scale-info,.questnameval .footer').removeClass('hide');
            });
            /*** Radio Btn Bulk Add Btn Enable Disable function ***/
            databdy.on('keyup', '[name=bulkaddtextarea]', function() {//NO I18N
                var lines = [];
                jQuery.each(jQuery(this).val().split('\n'), function(i, line) {
                    if (line) {
                        lines.push(line);
                    }
                });
                if (lines.length < 2) {
                    databdy.find('[data-name=formbulkaddsubmit]').prop('disabled', true); //NO I18N
                } else {
                    databdy.find('[data-name=formbulkaddsubmit]').prop('disabled', false);//NO I18N
                }
            });
            /*** Survey Bulk Add Button ***/
            databdy.on('click', '[data-name=formbulkaddsubmit]', function() {//NO I18N
                var lines = [];
                jQuery.each(jQuery('.formpopupbulkadd textarea').val().split('\n'), function(i, line) {//NO I18N
                    if (line) {
                        lines.push(line);
                    }
                });
                if (lines.length >= 2) {
                    var xhtml = '';
                    for (var i = 0; i < lines.length; i++) {
                        var x = '<li class="p5 visi-parent" data-name="min" data-text="max" style="height: 28px;"><span class="cspr drag1 icon-xs pos-abs top10"></span><span class="item disp-ib ml20" style="width: 80%;"><input type="text" maxlength="100" class="form-control form-control-nooutline" value="' + encodeHTML(lines[i].substring(0,100)) + '"></span><span class="cspr trash icon-sm visi-item pos-abs cur-ptr" data-id="trash"></span><span class="radio-status-value pos-abs pt10 right0 tc top0">' + (i + 1) + '</span></li>';
                        xhtml = xhtml + x;
                    }
                    databdy.find('.form-radiobutton-scale .form-radio-status').html(xhtml);
                    radioquestchange();
                    databdy.find('.form-radiobutton-scale .formpopupbulkadd').animate({left:'110%'},200);
                    databdy.find('#quesChange').prop('disabled',false);//NO I18N
                    databdy.find('[data-name=saveformpopup]').prop('disabled', false);//NO I18N
                    databdy.find('.formpopupbulkadd textarea').removeAttr('style');//NO I18N
                }
                databdy.find('[data-name=saveformpopup]').prop('disabled', false);//NO I18N
                databdy.find('.questnameval .form-questype-list').removeAttr('style');//NO I18N
                databdy.find('.questnameval .form-scale-info,.questnameval .footer').removeClass('hide');
            });
            /*** Popup in Question type Radio Btn Input type hit and enter ***/
            databdy.on('keyup', '.form-radiobtn-scaletxt', function(e) {//NO I18N
                if (jQuery(this).val() != '') {
                    if (e.which == 13) {
                        var x = '<li class="p5 visi-parent" data-name="min" data-text="max" style="height: 28px;"><span class="cspr drag1 icon-xs pos-abs top10"></span><span class="item disp-ib ml20" style="width: 80%;"><input type="text" maxlength="100" class="form-control form-control-nooutline" value="Poor"></span><span class="cspr trash icon-sm visi-item pos-abs cur-ptr" data-id="trash"></span><span class="radio-status-value pos-abs pt10 right0 tc top0">1</span></li>';
                        databdy.find('.form-radio-status').prepend(x);
                        databdy.find('.form-radio-status li:eq(0)').find('.item input').val(jQuery(this).val());
                        databdy.find('.form-radio-status li').each(function(index, value) {
                            jQuery(this).find('.radio-status-value').text(index + 1);
                        });
                        databdy.find('.form-radio-status .sdp-glyph-trash-fill').removeClass('hide');
                        jQuery(this).val('');
                        radioquestchange();
                    }
                }
            });
            /*** Trash Question radio ***/
            databdy.on('click', '.form-radio-status [data-id=trash]', function(e) {//NO I18N
                    var $this = jQuery(this);//NO I18N
                    showconfirmcallback();
                    function showconfirmcallback(s){
                        if(databdy.find('.form-radio-status li').length > 1){
                            $this.closest('li').remove();//NO I18N
                            databdy.find('.form-radio-status li').each(function(index, value) {
                                jQuery(this).find('.radio-status-value').text(index + 1);
                            });
                            radioquestchange();
                        }else{
                            showalert('failure',translate("sdp.admin.survey.question.radio.nooption"),'isAutoHide=false');//NO I18N
                        }
                    }
                //}
            });
            databdy.on('keyup', '.form-radio-status .form-control', function(e) {
                if (jQuery(this).val() != '') {
                    var txtplaceholder = jQuery(this).attr('placeholder');
                    var txt = jQuery(this).val();
                    var thisindex = jQuery(this).closest('li').index();//NO I18N
                    jQuery(this).attr('placeholder',txt);
                    var txtid = droppablerightform.find('li.active .form-question-option .field .field-val:eq('+thisindex+')').find('input').attr('id');
                    var txtname = droppablerightform.find('li.active .form-question-option .field .field-val:eq('+thisindex+')').find('input').attr('name');
                    droppablerightform.find('li.active .form-question-option .field .field-val:eq('+thisindex+')').html('<label style="line-height: 1;" class="radio-inline" for="'+txtid+'"><input type="radio" name="'+txtname+'" value="'+txtid+'" id="'+txtid+'"><span>'+ZSEC.Encoder.encodeForHTML(txt)+'</span></label>');
                }
            });
            /*** Popup in Question type Radio Btn Input type hit and enter ***/
            /*** Popup Opinion Scale Text change keyup function ***/
            databdy.on('keyup', '.form-opinionscale-scale [data-id=opinion-scale-left-range]', function() {//NO I18N
                var a = jQuery(this).val();
                if (droppablerightform.find('li').hasClass('active')) {
                    droppablerightform.find('li.active .opinion-label-container .label-left').text(a);
                    if (droppablerightform.find('li.active .opinion-label-container .label-left').text() == '') {
                        droppablerightform.find('li.active .opinion-label-container .label-left').text(jQuery(this).attr('placeholder'));
                    }
                }
            });
            databdy.on('keyup', '.form-opinionscale-scale [data-id=opinion-scale-center-range]', function() {//NO I18N
                var a = jQuery(this).val();
                if (droppablerightform.find('li').hasClass('active')) {
                    droppablerightform.find('li.active .opinion-label-container .label-center').text(a);
                    if (droppablerightform.find('li.active .opinion-label-container .label-center').text() == '') {
                        droppablerightform.find('li.active .opinion-label-container .label-center').text(jQuery(this).attr('placeholder'));
                    }
                }
            });
            databdy.on('keyup', '.form-opinionscale-scale [data-id=opinion-scale-right-range]', function() {//NO I18N
                var a = jQuery(this).val();
                if (droppablerightform.find('li').hasClass('active')) {
                    droppablerightform.find('li.active .opinion-label-container .label-right').text(a);
                    if (droppablerightform.find('li.active .opinion-label-container .label-right').text() == '') {
                        droppablerightform.find('li.active .opinion-label-container .label-right').text(jQuery(this).attr('placeholder'));
                    }
                }
            });
            /*** Popup Opinion Scale Text change keyup function ***/
            /*** Popup Ascending Decending / min and max function ***/
            databdy.on('click', '.form-radiobutton-scale [data-name=accord-sort-btn]', function() {//NO I18N
                if (jQuery(this).attr('isToggle') == 'true') {
                    jQuery(this).find('span.cspr').attr('class', 'cspr asc icon-sm'); //NO I18N
                    jQuery(this).attr('isToggle', 'false'); //NO I18N
                    radiobuttonscalesort('asec');//NO I18N
                } else {
                    jQuery(this).find('span.cspr').attr('class', 'cspr desc1 icon-sm'); //NO I18N
                    jQuery(this).attr('isToggle', 'true'); //NO I18N
                    radiobuttonscalesort();
                }
            });
            databdy.on('click', '.form-binaryvalue-scale [data-name=accord-sort-btn]', function() {//NO I18N
                if (jQuery(this).attr('isToggle') == 'true') {
                    jQuery(this).find('span.cspr').attr('class', 'cspr asc icon-sm'); //NO I18N
                    jQuery(this).attr('isToggle', 'false'); //NO I18N
                    binaryscalesort(0, 1);
                } else {
                    jQuery(this).find('span.cspr').attr('class', 'cspr desc1 icon-sm'); //NO I18N
                    jQuery(this).attr('isToggle', 'true'); //NO I18N
                    binaryscalesort(1, 0);
                }
            });
            /*** Popup Ascending Decending / min and max function ***/
            /*** Popup Binary value change function ***/
            databdy.on('keyup', '.form-popup-binaryvalue [data-name=formbinaryactval] .form-control', function() {//NO I18N
                var txt = jQuery(this).val();
                if (txt != '') {
                    binarychoicetype(0, encodeHTML(txt));
                } else {
                    binarychoicetype(0, jQuery(this).attr('placeholder'));
                }
            });
            databdy.on('keyup', '.form-popup-binaryvalue [data-name=formbinarydeactval] .form-control', function() {//NO I18N
                var txt = jQuery(this).val();
                if (txt != '') {
                    binarychoicetype(1, encodeHTML(txt));
                } else {
                    binarychoicetype(1, jQuery(this).attr('placeholder'));
                }
            });
            /*** Popup Binary value change function ***/
        }
        init();
        function leftnavpos() {
            jQuery('.draggable-leftform .form-quest-type').removeAttr('style'); //No I18N
            function fixHeaderBar1() 
            {
                var top = jQuery('.draggable-leftform').position().top; //No I18N
                var bottom = jQuery('.survey-config-wrapper').position().top; //No I18N
                top1 = top - jQuery('.sticky-fixed').height();
                var width = jQuery('.draggable-leftform').width(); //No I18N
                var scrollPos = jQuery(window).scrollTop();
                if (scrollPos > top1) 
                {
                    jQuery('.draggable-leftform .form-quest-type').removeClass("leftnav-fixed").addClass("leftnav-fixed");
                    jQuery('.draggable-leftform .form-quest-type').css({"top": jQuery('.sticky-fixed').height()}).parent().css({'width': '16%'});//NO I18N
                    jQuery('.draggable-leftform .form-quest-type').css('width', jQuery('.draggable-leftform').width());//NO I18N
                }
                else 
                {
                    jQuery('.draggable-leftform .form-quest-type').removeClass("leftnav-fixed").removeAttr('style').parent().removeAttr('style'); //No I18N
                }
                if (jQuery('.leftnav-fixed').length > 0) 
                {
                    bottom1 = bottom - jQuery('.sticky-fixed').height() - jQuery('.sticky-fixed').height() - jQuery('.leftnav-fixed').height();
                    if (scrollPos > bottom1)
                    {
                        jQuery('.draggable-leftform .form-quest-type').removeClass("leftnav-fixed").removeAttr('style').parent().removeAttr('style'); //No I18N
                    }
                }
            }
            jQuery(window).on('scroll', fixHeaderBar1);
            fixHeaderBar1();
        }
        leftnavpos();
        surveyemptyaction();
        return options;
    }
})(jQuery);
/*** Form Drag Section ***/
/**** Survey Result and Report Page ****/
(function() {
    jQuery.fn.surveyreportfn = function(options) {
        var data = this;
        /*** Survey Result Page Report Selection ***/
        function survyresultfilter(a, b) {
            data.find('.survey-report-table .tableComponent tbody tr').each(function() {
                var x = parseInt(jQuery(this).find('td.svy-satis-level').text());
                if (x >= a && x <= b) {
                    jQuery(this).removeClass('hide');
                } else {
                    jQuery(this).addClass('hide');
                }
            });
        }
        function init() {
            /*** Survey Result by Percentage ****/
            data.find('[data-name=survyresultfilter]').on('change', function() {
                var x = jQuery(this).val();
                if (x == 'All Survey') {
                    survyresultfilter(0, 100);
                }
                if (x == 'Above 75%') {
                    survyresultfilter(75, 100);
                }
                if (x == '50% to 75%') {
                    survyresultfilter(50, 75);
                }
                if (x == '25% to 50%') {
                    survyresultfilter(25, 50);
                }
                if (x == 'Below 25%') {
                    survyresultfilter(0, 24);
                }
            });
            //Select2
            data.find('[data-name=selType]').select2({
                minimumResultsForSearch: Infinity
            });
            data.find('[data-name=survyresultfilter]').select2({
                minimumResultsForSearch: Infinity
            });
            data.find(".surveyreport-left [multiple=multiple]").select2({
                closeOnSelect: false
            }); // select2
            data.find('.surveyreport .select2-choices').niceScroll();
            /*** Survey Template Popup Tab ***/
            data.on('click', '.survey-menu-list-ul li a', function() {//NO I18N
                data.find('.survey-menu-list-ul li').removeClass('active');
                jQuery(this).parent().addClass('active');
                data.find('.survey-template-ques .sdtab-pane').removeClass('active');
                data.find('.survey-template-ques #' + jQuery(this).attr('class')).addClass('active');
            });
            /*** Table Preview Click ***/
            data.find('[data-name=surveyrptsatisfication]').on('click', function() {
                var leftPos = ( jQuery(window).outerWidth() - 1040 )/2;
                showURLInDialog('../survey/surveyPreview.jsp', 'modal=yes,closeOnEscKey=yes,closeButton=no,position=relative,top=10,left='+leftPos+'');//NO I18N
            });
            /*** Select2 ***/
            /** Dropdown select from table list **/
            data.on('click', '.survey-report-table .sdmenu-dd li a', function() {//NO I18N
                var txt = jQuery(this).text();
                var parent = jQuery(this).closest('ul').prev("[data-switch='sdmenu']");//NO I18N
                parent.html(txt+' <i class="caret"></i>');
            });
            var hgt = jQuery(window).height() - (jQuery('#header-placeholder').outerHeight(true) + jQuery('.survey-portal .headerbar').outerHeight(true) + 20);
            jQuery('.surveyreport').css('height',(hgt+'px'));   //NO I18N
        }
        init();
    }
})(jQuery);
/**** Survey Result and Report Page ****/


function getQueryVariable(variable) {   
    var query = window.location.search.substring(1);   
    var vars = query.split("&");   
    for (var i=0;i<vars.length;i++) 
    {           
        var pair = vars[i].split("=");           
        if(pair[0] == variable)
        {
            return pair[1];
        }   
    }   
    return(false);
}
/*** Available and Unavailable Group Scripts ***/

function getCustomFilterData(){
    outputdata = [];
    jQuery(".surveyfilterwrapper:first").find('li.singlefilterwrapper').each(function(i, v){
         operatorField = jQuery(this).find('select.andor').val();
         columnField = jQuery(this).find('select.columnname').val();
         criteriaField = jQuery(this).find('select.selectcriteria').val();
         if(columnField == 1){ // column name 1 is Requester name.
	         criteriaValString = jQuery(this).find('.criteriaval').val();
	         var criteriaValArray = criteriaValString.split(",");
	         var criteriaValField = [];
	         for(var i=0;i<criteriaValArray.length;i++){
	             criteriaValField[i] = parseInt(criteriaValArray[i]) ; 
	         }
         }else{
        	 criteriaValField = jQuery(this).find('.criteriaval').val();
         }
         if((columnField != -1) && (criteriaField != "") && (criteriaValField !== undefined) )
         {
             outputdata.push({'operator':operatorField, 'column':columnField, 'criteria':criteriaField, 'criteriaVal':criteriaValField});//NO I18N
         }
         
    });
    return outputdata;  
}

function validEmailConfig()
{
    var status = true;
    var alertMsg = "";
    
    if(jQuery("#subject").val().trim() == "")
    {
        status=false;
        alertMsg = translate("sdp.admin.survey.email.subject.error");
    }
    if(status){
        if(jQuery("#subject").val().trim().length > 250)
        {
            status=false;
            alertMsg = translate("sdp.admin.survey.email.subject.lengthexceeded", ["250"]);
        }
    }
    if(status)
    {
        if(jQuery("#success").val().trim() == "")
        {
            status=false;
            alertMsg = translate("sdp.admin.survey.email.success.error");
        }
        if(jQuery("#success").val().trim().length > 250)
        {
            status=false;
            alertMsg = translate("sdp.admin.survey.email.success.lengthexceeded", ["250"]);
        }
    }
    if(status)
    {
        if(jQuery("#thanks").val().trim() == "")
        {
            status=false;
            alertMsg = translate("sdp.admin.survey.email.thanks.error");
        }
        if(jQuery("#thanks").val().trim().length > 250)
        {
            status=false;
            alertMsg = translate("sdp.admin.survey.email.thanks.lengthexceeded", ["250"]);
        }
    }
    if(status)
    {
        if(jQuery("#failure").val().trim() == "")
        {
            status=false;
            alertMsg = translate("sdp.admin.survey.email.failure.error");
        }
        if(jQuery("#failure").val().trim().length > 250)
        {
            status=false;
            alertMsg = translate("sdp.admin.survey.email.failure.lengthexceeded", ["250"]);
        }
    }
    if(status)
    {
        if(editor.getHTML().trim() == "")
        {
            status=false;
            alertMsg = translate("sdp.admin.survey.email.description.error");
        }
    }
    if(status)
    {
    	var value=editor.getHTML();
    	if(value.indexOf("$SurveyLink")==-1){
    		status = false;
    		alertMsg = translate("sdp.admin.survey.necessary.surveylink");
    	}
    }
    if(!status)
    {
        showalert('failure',alertMsg,'isAutoHide=false');//NO I18N
    }
    return status;
    
}

function validInput()
{
    var status = true;
    var alertMsg = "";
    var type=undefined;
    //name
    if(jQuery("#surveyName").val().trim() == "")
    {
        status=false;
        alertMsg = translate("sdp.admin.survey.alert.name");
        jQuery("#surveyName").addClass('has-error');
    }
    //accounts
    if(isMSP){
        var accountslen = document.getElementsByName("selectedAccountsBox")[0].length;
        if(!document.getElementsByName('surveyAllAccounts')[0].checked && accountslen==0) {                  //No i18n
            status=false;
            alertMsg = translate("sdp.msp.reqTemplate.selectAccount.error");
        }
    }
    //questions
    if(form.survey_question.length == 0)
    {
        status=false;
        alertMsg = translate("sdp.admin.survey.alert.addquestion");   
    }
    //type
    if(status)
    {
        type = parseInt(jQuery("#surveyType").val());
        if(type < 1 && type > 4)
        {
            status=false;
            alertMsg = translate("sdp.admin.survey.alert.validtype");   
        }
    }
    
    //mode
    if(status)
    { 
        var survey_mode = jQuery('input:radio[name=config'+type+']:checked').val(); 
        if(survey_mode < 1 && survey_mode > 4)
        {
            status=false;
            alertMsg = translate("sdp.admin.survey.alert.validmode");   
        }
        else
        {
            var inputEle = jQuery('input:radio[name=config'+type+']:checked').next('input');//NO I18N
            if(inputEle[0] !== undefined)
            {
                var inputVal = jQuery(inputEle).val();
                if(parseInt(inputVal) <= 0 || isNaN(parseInt(inputVal)))
                {
                    status=false;
                    alertMsg = translate("sdp.admin.survey.alert.validmode");
                }
            }
        }
    }
    //date and loop
    if(status && type ==4)
    {
        if(jQuery(".survey-recurrencetoggle ").attr("data-value") == "1")
        {
            var startTime = jQuery("#datepicker11_IN_Display").val();
            var startDate = new Date(startTime);
           
            var endTime = jQuery("#datepicker12_IN_Display").val();
            var endDate = new Date(endTime);
            if(startTime!=undefined && endTime!=undefined &&startDate.getTime()>=endDate.getTime())
            {
                status=false;
                alertMsg = translate("sdp.admin.survey.alert.enddategreater");   
            }
            var repeatDays=jQuery("#repeatDays").val();
            if(isNaN(parseInt(repeatDays)))
            {
                status=false;
                alertMsg = translate("sdp.admin.survey.alert.validmode");
            }
            if(parseInt(repeatDays) <= 0)
            {
                status=false;
                alertMsg = translate("sdp.admin.survey.alert.loop.nozero");   
            }
            
        }
        if(status && jQuery("#checkpct").is(":checked")){
            var randomPickPercentage = jQuery("#pct_user").val(); 
            if(isNaN(parseInt(randomPickPercentage)))
            {
                status =false;
                alertMsg = translate("sdp.admin.survey.alert.validmode");
            }
            if(randomPickPercentage <1 || randomPickPercentage>100){
                status =false;
                alertMsg = translate("sdp.admin.survey.alert.invalidpctuser"); 
            }       
        }    
    }
    //criteria
    var isErrorMsgFromComp=false;
    if(status)
    {
        if(type != 4)
        {
            var selected_criteria=jQuery("#ticket_criteria").custom_filter("getFilterData");// No I18N
            if(selected_criteria!=null && !selected_criteria)
                {
                    status=false;
                isErrorMsgFromComp=true;
                }

        }
        else
        {
            if(jQuery('#move-fieldright3 ul').find('li').length - 2 > parseInt(jQuery("#uglimit").val()))
            {
                status=false;
                alertMsg = translate("sdp.admin.survey.alert.moreug");  
            }
        }
        

    }
    

    if(!status)
    {
        if(!isErrorMsgFromComp)
        {
        showalert('failure',alertMsg,'isAutoHide=false');//NO I18N
    }
    }
    return status;
}

jQuery.fn.extend({
    freeze: function() {//No I18N
      /* This method is used to freeze a container with a freeze layer on the top of it and set a boolean as data-attribute */
      this.css("position", "relative");//No I18N
      this.prepend("<div class='trans-freeze-layer'></div>");
      this.data("isFrozen", true);//No I18N
      this.find(".trans-freeze-layer").css({
        "position": "absolute",//No I18N
        "top": "0",//No I18N
        "bottom": "-1px",//No I18N
        "left": "0",//No I18N
        "right": "0",//No I18N
        "background-color": "#EFEFEF",//No I18N
        "opacity": "0.3",//No I18N
        "z-index": "999",//No I18N
        "cursor": "not-allowed"//No I18N
      });
    },
    unfreeze: function() {//No I18N
      /* This method does the opposite of freeze method */
      this.css("position", "");//No I18N
      this.find(".trans-freeze-layer").remove();
      this.data("isFrozen", null);//No I18N
    }
});

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}
var surveycommon = {
    closeDialog: function() {
        jQuery('#_DIALOG_LAYER').remove();//NO I18N
    }
};

