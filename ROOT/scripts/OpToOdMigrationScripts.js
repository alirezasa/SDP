//$Id$
var odDc,clientId,clientSecret,authURI,alrtMsgType,alrtMsg,features,showUserConsentPopUp=false,alrtMsgPresent=false,isFormSubmitted=false, bulkAssociation={}, values=[], ids=[];
/*
    Load all pre-requisites optood migrationForm
*/
function loadOpOdMigFormDetails(){
  initTooltip();validateMigrationForm();
  jQuery('#oauthClientId,#oauthClientSecret').attr("autocomplete","off");//NO I18N
  jQuery("#sdpODPortalName").on("click",fetchODPortals);
  jQuery("#sdpODPortalName").on("change",function(){jQuery(this).valid();});
  jQuery("#entitySelectionControl").on("click",fetchEntity);
  jQuery("#eventStartTimeDisplay").on("change",changeFromDate);
  jQuery("#eventEndTimeDisplay").on("change",changeToDate);
  jQuery('#go-od-submit').attr("data-loading-text",translate("sdp.report.common.loading.message"));
  jQuery('#entitySelection').select2({multiple: "multiple", query:function(query){var data={results:[]};jQuery.each(values, function(){data.results.push({id:this.id, text:this.text});});query.callback(data);}});//NO I18N
  jQuery('#entitySelection').select2('data', values);// No I18N
  jQuery('#entitySelection').on('select2-open',function(event){jQuery(".select2-no-results").css('display','none');jQuery(".select2-drop").css('display','none');});
  jQuery('#s2id_entitySelection').on("click",fetchEntity);
  jQuery('#s2id_entitySelection').addClass("multi-field-holder");
  loadmeadmin();
  if(isFormSubmitted){
      jQuery('#sdpODDataCenter').val(odDc);
      changeODUrl("false");
      jQuery('#oauthClientId').val(clientId);
      jQuery('#eventStartTimeDisplay,#eventEndTimeDisplay,#entitySelection').val("");
      jQuery('#oauthClientSecret').val(clientSecret);
      jQuery('#sdpODDataCenter,#oauthClientId,#oauthClientSecret,#go-od-next,#ODMigrateCheck').prop('disabled',true);//NO I18N
      jQuery('#ODMigrateCheck').prop('checked',true);//NO I18N
  }
  if(showUserConsentPopUp){setTimeout(function (){NewWindow(authURI, 'preferences', '750', '650', 'yes', 'center');}, 5000);}// No I18n
  if(alrtMsgPresent){showalert(alrtMsgType,alrtMsg,features);}
}

var onDemandUrl;
/*
    When changing the dataCenter, automatically domainUrl will be changed here.
*/
function changeODUrl(resetCred){
    var dataCenter = jQuery('#sdpODDataCenter').val();
    var url=JSON.parse(onDemandUrl).valueOf()[dataCenter].apiDomainUrl;
    jQuery("#url").text(url);
    jQuery('#sdpODPortalName').children('option:not(:first)').remove(); //NO I18N
    jQuery('#go-od-next submit_div,#sdpODPortalName_div,#entitySelection_div').addClass('hide');
    jQuery('#go-od-next_div,#oauthClientId_div,#oauthClientSecret_div').removeClass('hide');
    if(resetCred!="false"){
        jQuery("#oauthClientId,#oauthClientSecret").val("");
        jQuery('#sdpODDataCenter,#oauthClientId,#oauthClientSecret').prop('disabled', false); // No I18N
    }
}
/*
    Alert to be displayed for invalidDate choosen.
*/
function alertForInvalidDate(element, element1){
    jQuery(element).val("").addClass('is-invalid').valid();//NO I18N
    jQuery(element1).removeClass('hide').css('display','block');//NO I18N
}
/*
    when changing endDate fields these validations would be happens.
*/
function changeFromDate(){
    if(jQuery("#eventStartTimeDisplay").val()!=""){
        jQuery('#error-startTimeDisplay').addClass('hide');
        var currentDate = new Date();
        var currentTime = Date.parse(currentDate);
        var startDate = jQuery("#eventStartTimeDisplay").val().split("-");
        var startDateWithUTC = new Date(startDate[0], startDate[1]-1, startDate[2]); //month index should be start from 0. ie.,jan=0

        var endDate = jQuery("#eventEndTimeDisplay").val().split("-");
        var endDateWithUTC = new Date(endDate[0], endDate[1]-1, endDate[2]);//month index should be start from 0. ie.,jan=0
        if (startDateWithUTC.getTime() >= currentTime){
            showalert('warning',translate("admin.optood.date.errormsg1"),'isAutoHide=false');//No I18N
            alertForInvalidDate("#eventStartTimeDisplay", "#error-startTimeDisplay");//NO I18N
        }
        else if(endDateWithUTC.getTime() < startDateWithUTC.getTime()){
            showalert('warning',translate("sdp.admin.operatinghours.greaterendtimejserror"),'isAutoHide=false');//No I18N
            alertForInvalidDate("#eventStartTimeDisplay", "#error-startTimeDisplay");//NO I18N
        }
        checkForMaxYear(startDateWithUTC, endDateWithUTC, "#eventStartTimeDisplay", "#error-startTimeDisplay");//NO I18N
    }
}
var maxNoOfYears;
/*
    when changing fromDate & endDate fields these validations would be happens.
*/
function checkForMaxYear(startDate, endDate, element, element1){
    if(jQuery("#eventStartTimeDisplay").val()!="" && jQuery("#eventEndTimeDisplay").val()!="") {
        var Difference_In_Time = endDate.getTime() - startDate.getTime();
        var noOfDates = Difference_In_Time / (1000 * 3600 * 24);
        if (parseInt(maxNoOfYears) > 5){
            maxNoOfYears = 5;
        }
        if (noOfDates > 365*parseInt(maxNoOfYears)){
            showalert('warning',translate('admin.optood.date.errormsg',[maxNoOfYears]),'isAutoHide=false');//No I18N
            alertForInvalidDate(element, element1);
        }
    }
}

/*
    when changing endDate fields these validations would be happens.
*/
function changeToDate(){
    if(jQuery("#eventEndTimeDisplay").val()!=""){
        jQuery('#error-endTimeDisplay').addClass('hide');
        var currentDate = new Date();
        var currentTime = Date.parse(currentDate);
        var startDate = jQuery("#eventStartTimeDisplay").val().split("-");
        var startDateWithUTC = new Date(startDate[0], startDate[1]-1, startDate[2]); //month index should be start from 0. ie.,jan=0
        var endDate = jQuery("#eventEndTimeDisplay").val().split("-");
        var endDateWithUTC = new Date(endDate[0], endDate[1]-1, endDate[2]);//month index should be start from 0. ie.,jan=0
        if(endDateWithUTC.getTime() > currentTime){
            showalert('warning',translate("admin.optood.date.errormsg1"),'isAutoHide=false');//No I18N
            alertForInvalidDate("#eventEndTimeDisplay", "#error-endTimeDisplay");//NO I18N
        }
        else if(endDateWithUTC.getTime() < startDateWithUTC.getTime()){
            showalert('warning',translate("sdp.admin.operatinghours.greaterendtimejserror"),'isAutoHide=false');//No I18N
            alertForInvalidDate("#eventEndTimeDisplay", "#error-endTimeDisplay");//NO I18N
        }
     checkForMaxYear(startDateWithUTC, endDateWithUTC, "#eventEndTimeDisplay", "#error-endTimeDisplay");//NO I18N
    }

}
/*
    ShowMore fields field is used to showing rest of the entities.
*/
function showMoreMultipleFields(ele,forAsset) {
    var field;
    if(forAsset) { field = jQuery(ele).parent().find('#multiasset');}
    else { field =  jQuery(ele).closest('.mti-select'); }  //No I18N
    var element = jQuery(ele);
    if(element.attr('data-id') == 'showmore') {
        field.find('.select2-container-multi').attr('style','z-index: 3;');
        if(forAsset) {
            field.find('ul.select2-choices').attr('style','max-height: inherit;');
        }
        else {
            field.find('ul.select2-choices').attr('style','height: auto !important; box-shadow: 0px 5px 10px 0px #DEDEDE');
        }
        element.attr('data-id','showless').addClass('showless');
        element.prop('title', translate('sdp.helpdesk.common.select2.showless')); //No I18N
    } else {
        field.find('.select2-container-multi,ul.select2-choices').removeAttr('style');
        element.attr('data-id','showmore').removeClass('showless');
        element.prop('title', translate('sdp.helpdesk.common.select2.showmore')); //No I18N
    }
}
/*
    OnLoad Functions of migration page.
*/
var isMigrationInProgress=false;
function execOpOdMigOnLoadFunctions()
{
  jQuery('#ODMigrateCheck').on('click',toggleTermsNCondCheckBox);
  jQuery('#sdpODDataCenter').on('change',changeODUrl);
  jQuery("#trialMode").prop("checked",true)//NO I18N
  if(!isFormSubmitted){setTimeout(function (){changeODUrl();if(jQuery('#ODMigrateCheck').is(':checked')){jQuery('#go-od-next').prop('disabled', false); }},300);}// No I18N
  if(isMigrationInProgress) {
      setTimeout(function(){
          jQuery("form[name=OpToOdMigrationForm] input").prop('disabled',true);//NO I18N
          jQuery("#sdpODDataCenter").prop('disabled',true);//NO I18N
          jQuery("#alertBox span").text(translate("admin.optood.errormsg"));
          jQuery("#alertBox").removeClass("alert-info").addClass("alert-warning");
      },300);
  }
}

/*
    After clicking the next and moveData button the form is to be submitted here.
*/
var form='';
maigrateOdFunc = (function() {
    var formSubmit = function(formVal) {
        form=formVal;
        if (jQuery('[id=migrate-od-form]').valid()) {
            if(jQuery("#sdpODPortalName").val()!="" && jQuery("#entitySelection").val()!=""){
                    jQuery("#go-od-submit").removeAttr("type name").attr("type", "submit");
            }
            var cliId=form.oauthClientId.value;
            var cliSecret=form.oauthClientSecret.value;
            jQuery("#sdpODDataCenter").prop("disabled", false); // No I18N
			if(jQuery("#finalMode").prop("checked") && jQuery("#eventStartTimeDisplay").val()!="" && jQuery("#eventEndTimeDisplay").val()!="") {
                    form.oauthClientId.value = encryptDataWithRSA(cliId.trim());
                    form.oauthClientSecret.value=encryptDataWithRSA(cliSecret.trim());
					var startDate = jQuery("#eventStartTimeDisplay").val().split("-");//dateformat -> yyyy-mm--dd
                    var startDateWithUTC = new Date(startDate[0], startDate[1]-1, startDate[2]); //month index should be start from 0. ie.,jan=0

					var endDate = jQuery("#eventEndTimeDisplay").val().split("-");//dateformat -> yyyy-mm--dd
                    var endDateWithUTC = new Date(endDate[0], endDate[1]-1, endDate[2]);//month index should be start from 0. ie.,jan=0

                    var currentDate = new Date();
                    //if the endDate is currentDate, set currentTime as endDate time.
                    if (currentDate.getDate() == endDateWithUTC.getDate()){
                        endDateWithUTC.setHours(currentDate.getHours(),currentDate.getMinutes(),currentDate.getSeconds());
                    }
                    else{
                        endDateWithUTC.setHours(23,59,59);
                    }

					jQuery("#eventStartTime").val(startDateWithUTC.getTime());
					jQuery("#eventEndTime").val(endDateWithUTC.getTime());
                    HTMLFormElement.prototype.submit.call(form);//alternative way of call submit method.
			}
			else{
                if(jQuery("#sdpODPortalName").val()==="" && jQuery("#entitySelection").val()===""){
                    sdpAjax({
                        url: "/OpToOdMigration.do?forwardTo=preValidateMigration",// NO I18N
                        async: false,
                        type: "GET",   // NO I18N
                        dataType: "HTML", // NO I18N
                        success: function(response){
                            response = JSON.parse(response);
                            if(jQuery.isEmptyObject(response)){
                                form.oauthClientId.value = encryptDataWithRSA(cliId.trim());
                                form.oauthClientSecret.value=encryptDataWithRSA(cliSecret.trim());
                                setFromDate("trial"); // No I18N
                                HTMLFormElement.prototype.submit.call(form);//alternative way of call submit method.
                            }
                            else {
                            form.oauthClientId.value = cliId;
                            form.oauthClientSecret.value = cliSecret;
                                if(response.host){
                                   showalert('failure',translate("admin.optood.errormsg2"),'isAutoHide=false');// No I18N
                                }else if(response.attachment){
                                    showalert('failure',translate("sdp.settings.filePathExists.error.msg"),'isAutoHide=false');// NO I18N
                            }

                        }
                        }
                    });
                }
                else{
                    setFromDate("trial"); // No I18N
                    HTMLFormElement.prototype.submit.call(form);//alternative way of call submit method.
                }
			}
		}
        else{
            closeCalDialog();
            jQuery('#go-od-submit').button('reset');
            jQuery('#s2id_entitySelection').show();
            jQuery('#sdpODPortalName, #trialMode, #finalMode, #eventStartTimeDisplay, #eventEndTimeDisplay').prop('disabled',false);// No I18N
        }
   };
   return {
	   formSubmit: formSubmit
	}
})();

/*
    Mode field selection to be controlled here.
*/
function setFromDate(mode){
    if(mode=='trial') {
      jQuery("#trialMode").prop("checked",true);jQuery("#finalMode").prop("checked",false);jQuery('#OPFromToDate_div').addClass('hide');//NO I18N
      jQuery("#eventStartTime").val(0);jQuery("#eventEndTime").val(0);
      closeCalDialog();
    }else{
      jQuery("#eventStartTimeDisplay,#eventEndTimeDisplay").val("");
      jQuery("#trialMode").prop("checked",false);jQuery("#finalMode").prop("checked",true);jQuery('#OPFromToDate_div,#error-startTimeDisplay,#error-endTimeDisplay').removeClass('hide');//NO I18N
    }
}
/*
    Each fields validation in the form is to be done here.
*/
function validateMigrationForm(){
    jQuery('#migrate-od-form').validate({
        onkeyup: function(element) {
            jQuery(element).valid()
        },
        onclick: false,
        onfocusout: false,
        rules: {
            sdpODPortalName: {required: true},
            oauthClientId : {required: true},
            entitySelection : {required: true},
            oauthClientSecret :{required: true},
            startTimeDisplay :{required: true},
            endTimeDisplay :{required: true}
        },
        messages: {
            sdpODPortalName: {required: translate("admin.optood.odportal")},
            entitySelection: {required: translate("admin.optood.entityselection")},
            oauthClientId : {required: translate("auth.oauth.alert.clientid.empty")},
            oauthClientSecret :{required: translate("auth.oauth.alert.clientsecret.empty")},
            startTimeDisplay :{required: translate("common.from.empty")},
            endTimeDisplay :{required: translate("common.to.empty")}
        },
        errorElement: 'div', //No i18N
        errorClass: 'is-invalid',  //No i18N

        errorPlacement: function(error, element) {
            var vertPos = element.height();
            if (element[0].name == "entitySelection"){
                jQuery('#s2id_entitySelection').addClass('is-invalid');
            }
            if (element[0].name == "startTimeDisplay" || element[0].name == "endTimeDisplay"){
               element.closest(".col-group").append(error);  //No i18N
               jQuery('#eventStartTimeDisplay').addClass('is-invalid');
            }
            else{
               element.closest(".right-col").append(error);  //No i18N
               element.closest(".col-group").find(".col-fields:nth-child(1) input").focus(); //No i18N
            }
            error.attr('id', 'error-'+element[0].name);//No user data involved
            error.addClass( 'alert alert-danger alert-arrow p5' ).css({ 'position':'absolute','bottom':'-'+(vertPos+33)+'px','z-index':'100' });//No i18N

        }
    });
}

function enableInputs(){
    jQuery('#sdpODDataCenter,#oauthClientId,#oauthClientSecret,#go-od-next').prop('disabled', false); // No I18N
}
/*
    MoveData page will be shown here after successful completion of OD Popup consent.
*/
function showMoveData(){
    sdpAjax({
        url: "/OpToOdMigration.do?forwardTo=getVersionInfo", type: "GET", dataType: "html", async: false, // NO I18N
        success: function(result) {
            try{
               if(result && result !== ""){
                    if(result.isVersionSupport === false){
                      setTimeout(function(){
                             jQuery("#alertBox span").text(translate("admin.optood.errormsg1", [result.odSupportedVersion]));
                             jQuery("#alertBox").removeClass("alert-info").addClass("alert-warning");
                       },1);
                    }
                    else{
                        jQuery('#entitySelection').val(ids.join(","));
                        jQuery('#go-od-submit_div,#sdpODPortalName_div,#ODMigrateCheck_div,#trialFinalDiv, #entitySelection_div').removeClass('hide');
                        jQuery('#sdpODDataCenter,#oauthClientId,#oauthClientSecret').prop('disabled',true);//NO I18N
                        jQuery('#go-od-submit').prop('disabled', false).removeClass('cur-na ptr-ev-init'); // No I18N
                        jQuery('#go-od-next_div').addClass('hide');
                        }
                }
                else{
                    showalert('failure',translate("admin.optood.errormsg3"),'isAutoHide=false');// No I18N
                }
            }
            catch(e){
                showalert('failure',translate("admin.optood.connection.error"),'isAutoHide=false');// No I18N
            }
        },
    });
}
/*
    RedirectUrl will be copied to the clipBoard
*/
function copyToClipboard(selectorId) {
    var copyText = document.getElementById(selectorId);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");   // No I18n
    showalert('success',translate("auth.oauth.common.redirecturl.copied"),'isAutoHide=true,delay=1');    // No I18n
}

/*
    Pre-validation Result will be getting here.
*/
var skipAndProceed=false;
function getPreValidationResult(){
    if (jQuery('[id=migrate-od-form]').valid()) {
        jQuery('#sdpODPortalName, #trialMode, #finalMode, #eventStartTimeDisplay, #eventEndTimeDisplay').prop('disabled',true);// No I18N
        jQuery('#entitySelection').select2("readonly",true);jQuery('#entitySelectionControl').unbind("click");// No I18N
        jQuery('#go-od-submit').button('loading');
        if(!skipAndProceed){
            sdpAjax({
                url: "/OpToOdMigration.do?forwardTo=getPreValidationInfo",//NO I18N
                type: "POST",   //NO I18N
    			data: "entitySelection="+jQuery("#entitySelection").val(),//(No userdata involved) //No I18N
                success: function(result) {
                    var hasPreValFailures=result.hasPreValidationFailures;
                    if(hasPreValFailures){
                        showDialog(jQuery('#preValidationDiv').html(),'closeButton=no,modal=yes,position=absmiddle');//No I18N
                        jQuery('[sdpJs="js-event-OpToOdMigration-10"]').off("click").on("click", function(event) { correctPreValErrors(); });//NO I18N
                        jQuery('[sdpJs="js-event-OpToOdMigration-11"]').off("click").on("click", function(event) { submitMigrationForm(true); });//NO I18N
                        jQuery('[sdpJs="js-event-OpToOdMigration-12"]').off("click").on("click", function(event) {  window.open('OpToOdMigration.do?forwardTo=getPreValXLS', '_parent', 'noopener'); });//NO I18N
                        jQuery('[sdpJs="js-event-OpToOdMigration-13"]').off("click").on("click", function(event) { event.preventDefault(); });//NO I18N

                        jQuery(document).on('keyup', function(event) {
                            if (event.key == "Escape") { correctPreValErrors();}
                        });
                    }else{
                        submitMigrationForm();
                    }
                  }
            });
       }else{
          submitMigrationForm();
       }
   }
   else{
        jQuery('#go-od-submit').button('reset');
        jQuery('#s2id_entitySelection').show();
        jQuery('#sdpODPortalName, #trialMode, #finalMode, #eventStartTimeDisplay, #eventEndTimeDisplay').prop('disabled',false);// No I18N
   }
}
/*
   When clicking the next and MoveData buttons.
*/
function submitMigrationForm(skip){
   closeDialog();
   jQuery('#sdpODPortalName, #trialMode, #finalMode').prop('disabled',false);// No I18N
   maigrateOdFunc.formSubmit(OpToOdMigrationForm);
   if(skip!=undefined){
    skipAndProceed=skip;
  }
}
/*
    To fetch OD portals through API.
*/
function fetchODPortals()
{
    jQuery('#go-od-submit').button('reset');
    if(jQuery("#sdpODPortalName").val() == ""){
        sdpAjax({
            url: "/OpToOdMigration.do?forwardTo=getPortalInfo",//NO I18N
            type: "GET",   // No i18n
            data: "sdpODDataCenter="+jQuery("#sdpODDataCenter").val(),//NO I18N
            dataType: "HTML",//NO I18N
            success: function(result) {
                jQuery('#sdpODPortalName').children('option:not(:first)').remove(); //NO I18N
                try{
                    result = JSON.parse(result);
                    if(result.response_status.length > 0 && result.response_status[0].status == "success"){
                        var portal = result.portals;
                        if(portal.length > 0){jQuery.each(portal, function(index, jsonObject) {jQuery("#sdpODPortalName").append(jQuery("<option>",{value:jsonObject.name,text:jsonObject.display_name}));});}
                    }else {
                        showalert('failure',result.response_status.messages[0].message,'isAutoHide=false');// No I18N
                    }
                }catch(e){
                    showalert('failure',translate("admin.optood.connection.error"),'isAutoHide=false');// No I18N
                }
            },
            error: function(data) {showalert('failure',translate("sdp.vulnerability.error.unknownexception.msg"),'isAutoHide=false');} // No I18N
        });
    }
}
/*
    Toggle button control of Terms and Conditions checkBox
*/
function toggleTermsNCondCheckBox(){
    if(jQuery(this).is(':checked')){
      jQuery('#go-od-submit,#go-od-next').prop('disabled', false).removeClass('cur-na ptr-ev-init'); //NO I18N
    }else{
      jQuery('#go-od-submit,#go-od-next').prop('disabled',true).addClass('cur-na ptr-ev-init'); //NO I18N
    }
}

/*
    Progress page will be scheduled reload here in every 2 minutes.
*/
var td;
isMigAlreadyRunning = false;
var prevVal = 0;
function reloadProgressPage()
{
  var completedCount = 0;
  var importFailedCount=0;
  sdpAjax({
    url: "/OpToOdMigration.do?forwardTo=getProgressDetails", //NO I18N
    async: false,
    dataType: "html",//NO I18N
    Type: "GET",//NO I18N
    success: function(data, textStatus, jqXHR){
      var json = JSON.parse(jqXHR.responseText).entityList;
      var migrationStatus =JSON.parse(jqXHR.responseText).migrationStatus;
      var exceptionMsg = translate(JSON.parse(jqXHR.responseText).exceptionMessage);
      var trow='';
      var total_percentage = 0;
      var data_percent = 0;
      var count = 0;
      for(i=0;i < json.length; i++)
      {
          var obj = json[i];
          var tc = 0;
          var pc = 0;
          var percentage = '';
          td= '';
          var checkBox = `<div style="width: 32px;" id="rerunSelection"><input id = "rerunCheck" name=${obj.ENTITY_ID} type="checkbox" disabled="disabled" sdpJs="js-event-OpToOdMigrationProgress-15" nonce=${sdpNonce}></div>`;
          var infoIcon = `<div id="infoIcon_${obj.ENTITY_ID}" class="infoIconIds"><span id="infoIconSpan" rel="uitip" title="${translate("admin.optood.migrate.yettostart")}" class="icon-sm sdp-loading disp-ib vmiddle"></span></div>`;
          var start_time = 0;
          var end_time = 0;
          var hours = 0;
          var minutes = 0;
          var status = obj.STATUS;
          var entity_name = translate(obj.DISPLAYNAME);
          if(obj.TOTAL_COUNT) {
              tc = obj.TOTAL_COUNT;
          }
          if(obj.PROCESSED_COUNT) {
              pc = obj.PROCESSED_COUNT;
          }


         if(tc !== 0 ){
            var infoMsg = (tc === pc)?translate("admin.optood.migrate.success"):translate("approval.pending");
            var infoCls = (tc === pc)?"cspr icon-md success-green":"icon-sm sdp-loading fill disp-ib vmiddle";// NO I18N
            infoIcon = `<div id="infoIcon_${obj.ENTITY_ID}" class="infoIconIds"><span id="infoIconSpan" rel="uitip" title="${infoMsg}" class="${infoCls}"></span></div>`;
          }
          else if(status === 4 || (status === 3 && tc === pc)) {
            infoIcon = `<div id="infoIcon_${obj.ENTITY_ID}" class="infoIconIds"><span id="infoIconSpan" rel="uitip" title="${translate("sdp.requests.viewrequest.noconversations")}" class="icon-sm sdp-loading disp-ib vmiddle"></span></div>`;
          }

          if(obj.FAILURE_COUNT && obj.FAILURE_COUNT !=0) {
            var fc = obj.FAILURE_COUNT;
            importFailedCount+= fc;

            if(migrationStatus == 2 || migrationStatus == 0){ //for paused and not running status.
                checkBox = `<div style="width: 32px;" id="rerunSelection"><input id = "rerunCheck" name=${obj.ENTITY_ID} type="checkbox" sdpJs="js-event-OpToOdMigrationProgress-15" nonce=${sdpNonce}></div>`;
            }
            if(tc === pc){
                infoIcon = `<div id="infoIcon_${obj.ENTITY_ID}" class="infoIconIds ml-5"><span rel="uitip" class="cspr icon-md close-red-bg ml3" mode_html="true" title="<div><div>${translate("common.success.record")} : ${(tc-fc)}</div><div class=\'mt10\'>${translate("sdp.request.import.failedrecords")} : ${fc}</div></div>"></span></div>`;
            }
          }

          if (tc !== 0 && tc !== pc && (migrationStatus == 3 || migrationStatus > 4)){ //for halted/stopped/cancelled
            infoIcon = `<div id="infoIcon_${obj.ENTITY_ID}" class="infoIconIds"><span id="infoIconSpan" rel="uitip" title="${translate("sdp.admin.statusDefI.paused")}" class="cspr icon-sm progress-run" style="background-position: -98px -295px;"></span></div>`;
          }

          if(obj.START_TIME) {
              start_time = obj.START_TIME;
          }
          if(obj.END_TIME) {
              end_time = obj.END_TIME;
          }
          if(start_time !== 0 && end_time !== 0) {
              var timeSpend = end_time - start_time;
              hours = parseInt(timeSpend/(1000*60*60));
              minutes = parseInt(parseInt( timeSpend/(1000*60) ) %60);
          }
          if(pc===0 && tc===0){
              percentage = 0;
          }else{
              percentage = Math.round(parseInt(pc)*100/parseInt(tc));
              total_percentage = total_percentage + percentage;
              count++;
          }
          if(status === 4 || (status === 3 && tc === pc)) {
            completedCount++;
          }
          if(tc === 0) {
            tc = '-';
          }
          if(pc === 0) {
            pc = '-';
          }
          if(percentage>100){percentage=100;}
          var percentageInfo = `<span class="ui-progressbar1-info ui-progressbar1-pos1"><span class="ui-progressbar1a"><span class="ui-progressbar1-fill" style="width:${percentage}%"></span></span><span class="ui-progressbar1-after top0">${percentage}%</span></span>`;
          if(obj.FAILURE_COUNT && obj.FAILURE_COUNT !=0 && tc===pc) {
            percentageInfo = `<span class="ui-progressbar1-info ui-progressbar1-pos1"><span class="ui-progressbar1a notif-ripple danger"><span class="ui-progressbar1-fill btn-rad origin" style="width:${percentage}%"></span></span><span class="ui-progressbar1-after top0">${percentage}%</span></span>`;
            jQuery('#rerunMigration, #rerunMigration1').prop('disabled', true);// NO I18N
          }
          var testing = {entity_name:[checkBox, infoIcon, entity_name,tc,pc,hours+' Hrs '+minutes+' mins',percentageInfo]}; //No i18N
          jQuery.each(testing.entity_name,formRowForOpOdMigProgress);
          trow += (`<tr class="tc-row">${td}</tr>`);
      }
      if(total_percentage !== 0) {
          data_percent  = total_percentage / count;
      }
      data_percent = Math.floor(data_percent);
      if(data_percent>100){data_percent=100;}
      jQuery("#tabBodyId").html(trow);

      //initTooltip applied for div ids startswith infoIcon_
      initTooltip(".infoIconIds");// NO I18N
      statusUpdate(json.length,completedCount,importFailedCount, migrationStatus);
      migrationIconUpdate(importFailedCount, migrationStatus, exceptionMsg);

     //migrateImageIcon and progress bar animation
      jQuery('#sdp-progress-id').animate({ width: `${data_percent}%` }, 500, function() {

      });

      var stepCount = prevVal;
      if(data_percent === 100){stepCount = 100;}
      //progress bar display text animation
      prevVal = data_percent;
      jQuery('#sdp-progress-text-id').prop('Counter', stepCount).animate({ Counter: data_percent }, {// NO I18N
        duration: 1000,
        step: function(now) {
            jQuery(this).text(Math.ceil(now) + '%');
        }
      });
      jQuery('[sdpJs="js-event-OpToOdMigrationProgress-15"]').on("change", function(event) {showHideRerunButton(); });//NO I18N
  }

  });
}

/*
    To enable and disable the checkbox of entities.
*/
function showHideRerunButton(){
    const isChecked = jQuery('#rerunSelection input:checked').length > 0;
    jQuery('#rerunMigration, #rerunMigration1').prop('disabled', !isChecked);// NO I18N
}

function formRowForOpOdMigProgress(idx,value){td += ('<td>'+'<div>' + value+ '</div>'+'</td>');}


/*
    Button actions to be handled here.
*/

function switchMigrationAction(actionToBePerformed){

    switch(actionToBePerformed){
        case "stop":// NO I18N
            jQuery("#stopMigrate, #rerunMigration, #rerunMigration1, #rerunSkip").prop("disabled", true);//NO I18N
            document.stopMigrationForm.submit();
            break;
        case "resume":// NO I18N
            jQuery("#resumeMigrate, #cancelMigrate").prop("disabled", true);//NO I18N
            document.resumeMigrationForm.submit();
            break;
        case "cancel":// NO I18N
            showconfirm(true,'title='+translate('common.confirm.submit')+', message='+translate('optood.confirm.cancel')+', submitbutton='+translate('common.proceed')+', cancelbutton='+translate('common.no')+', closebutton=yes, closeOnEscKey=yes', function(proceed) {  //NO I18N
                if(proceed){
                 jQuery("#resumeMigrate, #cancelMigrate, #rerunCheck, #rerunMigration,#rerunMigration1, #rerunSkip").prop("disabled", true);// NO I18N
                 document.cancelMigrationForm.submit();
                }
            }, true);
            break;
        case "rerun":// NO I18N
            jQuery('#rerunCheck, #rerunMigration, #rerunMigration1, #rerunSkip, #resumeMigrate, #cancelMigrate').prop('disabled', true);// NO I18N
            jQuery('#backViewBtn').hide();
            var selectedIDs = [];
            jQuery('#rerunSelection input:checked').each(function() {
               selectedIDs.push(jQuery(this).attr('name'));
            });
            jQuery('#rerunEntitySelection').val(selectedIDs.join(','));
            document.rerunMigrationForm.submit();
            break;
        case "skip":// NO I18N
            jQuery('#rerunCheck, #rerunMigration, #rerunMigration1, #rerunSkip, #resumeMigrate, #cancelMigrate').prop('disabled', true);// NO I18N
            jQuery('#backViewBtn').hide();
            document.resumeMigrationForm.submit();
            break;

    }
}


/*
    StatusUpdates,Back,Stop,Resume,Cancel Button Actions handled here.
*/
function statusUpdate(entityCount,completedCount,importFailedCount,migrationStatus) {
    const parentElement = jQuery('#migrationStatusBar');
    switch(migrationStatus){
        // Migration is in NonRunning state.
         case 0:
            if(entityCount==completedCount){ // Check the migration is completed

                if(importFailedCount !== 0 ){ //completed with failures
                    parentElement.removeClass("success unapproved1 danger off").addClass("danger off");
                    jQuery("#alreadyStarted").toggleClass("hide", !isMigAlreadyRunning).show();// NO I18N
                }
                else {
                    parentElement.removeClass("success unapproved1 danger off").addClass("success");//No i18N
                }
                jQuery("#stopMigrate, #resumeMigrate, #cancelMigrate").hide();//No i18N
                parentElement.text(translate("sdp.admin.statusDef.complete"));  //No i18N
                jQuery('#backViewBtn').show();
            }
            break;
        /* Migration is either running or rerunning.*/
        case 1: case 4:
            parentElement.removeClass("success unapproved1 danger off").addClass("success");
            const statusMsg = (migrationStatus === 1)?translate("sdp.admin.statusDefI.running"):translate("admin.optood.rerun.migration");
            parentElement.text(statusMsg);
            jQuery("#stopMigrate, #cancelMigrate").removeClass("hide").show().prop("disabled", false);//No i18N
            jQuery("#cancelMigrate").prop("disabled", true);// NO I18N
            jQuery('#backViewBtn, #resumeMigrate').hide();
            break;

        /* Migration is paused */
        case 2:

            if(importFailedCount != 0 ){
                parentElement.removeClass("success unapproved1 danger off").addClass("danger off");//No i18N
                jQuery("#resumeMigrate, #cancelMigrate").removeClass("hide").show().prop("disabled", true);//No i18N
                jQuery("#cancelMigrate").prop("disabled", false);//No i18N
                jQuery("#stopMigrate").hide();//No i18N
            }
            else{
                parentElement.removeClass("unapproved1 success danger off").addClass("unapproved1");
                jQuery("#resumeMigrate, #cancelMigrate").removeClass("hide").show().prop("disabled", false);//No i18N
                jQuery("#stopMigrate").hide();//No i18N
            }

            jQuery("#backViewBtn").hide();//No i18N
            parentElement.text(translate("sdp.admin.statusDefI.paused"));//No i18N
            break;

        /* Migration is either halted or stopped. */
        case 3: case 5:
            parentElement.removeClass("success unapproved1 danger off").addClass("danger off");//No i18N
            const statusMsg1 = (migrationStatus === 3) ? translate("admin.optood.migration.halted") : translate("common.stopped");
            parentElement.text(statusMsg1);
            jQuery("#stopMigrate, #backViewBtn").hide();//No i18N
            jQuery("#resumeMigrate, #cancelMigrate").prop("disabled", false).show().removeClass("hide");//No i18N
            break;
        /* Migration is cancelled. */
        case 6:
            parentElement.removeClass("success unapproved1 danger off").addClass("danger off").text(translate("sdp.common.cancelled"));//No i18N
            jQuery("#stopMigrate, #resumeMigrate, #cancelMigrate").hide();//No i18N
            jQuery('#backViewBtn').show();
            break;
    }
}

/*
    MigrationIcons, StatusIcons, ErrorAlert Updates are handled here.
*/
function migrationIconUpdate(importFailedCount,migrationStatus,exceptionMsg) {
    const parentElement = jQuery('#migrateProgress');
    switch(migrationStatus){

        /* Migration is in Not Running State. */
        case 0:
            parentElement.attr('src', importFailedCount !== 0 ? "/images/migration-fail.svg" : "/images/migration-success.svg");//No i18N
            jQuery("#MigrationRerunAlert1").toggleClass("hide", importFailedCount === 0).show();//No i18N
            jQuery("#MigrationRerunAlert").hide();//No i18N
            jQuery("#resumeMigration, #resumeHaltedMigration").hide();//No i18N
            break;

        /* Migration is either running or rerunning.*/
        case 1: case 4:
            parentElement.attr('src', "/images/optood-migrate-progress.gif");//No i18N
            jQuery("#MigrationRerunAlert, #MigrationRerunAlert1, #resumeMigration, #resumeHaltedMigration").hide();//No i18N
            break;

        /* Migration is paused.*/
        case 2:
            parentElement.attr('src', "/images/migration-pause.svg");//No i18N
            jQuery("#MigrationRerunAlert").toggleClass("hide", importFailedCount === 0).show();// NO I18N
            jQuery("#resumeMigration").toggleClass("hide", importFailedCount !== 0).show();// NO I18N
            jQuery("#MigrationRerunAlert1, #resumeHaltedMigration").hide();
            break;

        /* Migration is either halted or stopped.*/
        case 3: case 5:
            parentElement.attr('src', "/images/migration-stop.svg");//No i18N
            jQuery("#MigrationRerunAlert, #MigrationRerunAlert1, #resumeMigration, #resumeHaltedMigration").hide();
            if (migrationStatus === 3){
                jQuery("#resumeHaltedMigration").removeClass("hide").show();
                jQuery('#haltedMsg').empty().append(translate("admin.optood.migration.failure.msg",[exceptionMsg, exceptionMsg]));
            }
            break;

        /* Migration is cancelled.*/
        case 6:
            parentElement.attr('src', "/images/migration-stop.svg");//No i18N
            jQuery("#MigrationRerunAlert, #MigrationRerunAlert1, #resumeMigration, #resumeHaltedMigration").hide().removeClass("hide");//No i18N
            break;
    }
}

/*
    Open Bulk EntitySelection dialog
*/
function fetchEntity(){
	  var dialogTitle="admin.optood.entity.selected"; //No I18N
		var entitiesList = [];
        var entitiesID = [];
        sdpAjax({
			url: "/OpToOdMigration.do?forwardTo=getEntityInfo",//NO I18N
			type: "GET",   // No i18n
            async: false,
            dataType: "HTML",//NO I18N
			success: function(result) {
				try{
                    result = JSON.parse(result);
					var modules = result.entityList;
                    var selectedValues = jQuery("#entitySelection").val();
                    var selectedIDs = [];
                    selectedIDs = selectedValues.split(",").map(Number);
                    selectedIDs.sort();
                    if(modules.length > 0){
                        jQuery.each(modules, function(index, jsonObject)
                        {
                            entitiesList.push({"id":jsonObject.ENTITY_ID,
                                "name":translate(jsonObject.DISPLAYNAME)});// No I18N

                        });
                        options = {
                                allowed_values  : entitiesList,
                                selected_values : selectedIDs,
                                saveCallBack: function (selectedEntityList){
                                    saveAssociatedIds(selectedEntityList);
                                },
                                saveBtnText     : translate("sdp.common.add"),
                                dialogtitle     : translate(dialogTitle),
                                height          : 485
                            };

                        bulkAssociation = new BulkAssociationComponent(options,this);
                        jQuery(".select2-drop").css('display','none');//NO I18N
                        jQuery('#searchText').focus();
                        bulkAssociation.field = entitiesList;
                    }
				}
                catch(e){
					showalert('failure',translate("admin.optood.connection.error"),'isAutoHide=false');// No I18N
				}
			},
			error: function(data) {showalert('failure',translate("sdp.vulnerability.error.unknownexception.msg"),'isAutoHide=false');} // No I18N
		});
}

/*
    changes of bulk selection will be updated.
*/
function saveAssociatedIds(selectedObj) {
   var entitiesList = bulkAssociation.field;
   var values = [];
   var ids = selectedObj.selectedIds;
   for(var i=0; i<ids.length; i++){
        for (var j=0; j<entitiesList.length; j++){
            if (ids[i] == entitiesList[j].id){
                values.push({"id":ids[i], "text":entitiesList[j].name, "locked":true});
                break;
            }
        }
   }
   if(ids.length <= 30){
      jQuery('html,body').animate({
        scrollTop: jQuery('#migrate-od-form').offset().top
      }, 800);
   }
   jQuery('#entitySelection').select2({multiple: true,
      query: function (query){var data = {results: []};
          jQuery.each(values, function(){
              data.results.push({id: this.id, text: this.text }); //No userData involved.
          });
          query.callback(data);
        }
    });
   jQuery('#entitySelection').select2('data', values);// No I18N
   jQuery('#s2id_entitySelection').on("click",fetchEntity);
   jQuery('#s2id_entitySelection').addClass("multi-field-holder");
   //when updating entitySelection popup on showing all selection, it shouldn't shrink.
   if (jQuery('#show_hide').attr("data-id") === "showless"){
        showMoreMultipleFields('#show_hide');//NO I18N
        showMoreMultipleFields('#show_hide');//NO I18N
   }
   closeDialog();
   if(jQuery("#entitySelection").val() != ""){
       jQuery('#s2id_entitySelection').removeClass('is-invalid');
       jQuery("#entitySelection").valid();
   }else{
      jQuery('#s2id_entitySelection').addClass('is-invalid');
      jQuery('#entitySelection').valid();
     }
  }
/*
    If we select the go back option on pre-validation popup, the popup will be closed and the old page will be displayed.
*/

function correctPreValErrors(){
    jQuery('#sdpODPortalName, #trialMode, #finalMode, #eventStartTimeDisplay, #eventEndTimeDisplay').prop('disabled',false);// No I18N
    jQuery('#entitySelection').select2("readonly",false);jQuery('#entitySelectionControl').on("click",fetchEntity);// No I18N
    jQuery('#go-od-submit').button('reset');
    closeDialog();
}
