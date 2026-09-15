/* $Id $ */
var TFAUserSettings = {
   table_comp: {},
    init: function(tab) {
       sdpAjax({
          url: "/RestAPI/WC/TwoFactorAction?method=getSelfEnrollmentConfiguration", //NO I18N
          type: "POST", //NO I18N
          success: function(tfaSelfConfig) {
             var userDetails = tfaSelfConfig.TFA_USER_DETAILS;
             if(Object.keys(userDetails).length) {
                userDetails.AuthName=getMessageForKey(userDetails.MODE_DISPLAY_NAME);
                if(userDetails.PAMMODULE_NAME=='TFA_GOOGLE_AUTHENTICATOR') {
                   userDetails.MODE_ICON="google-icon"; //NO I18N
                }
                if(userDetails.PAMMODULE_NAME=='TFA_MAIL_AUTHENTICATOR') {
                   userDetails.AuthName=getMessageForKey("tfa.email.mode", [userDetails.ATTRIBUTE_VALUE]); //NO I18N
                   userDetails.MODE_ICON="outgoing-conv-off"; //NO I18N
                }
             }
             else {
                userDetails.AuthName=getMessageForKey("sdp.common.notconfigured");
                userDetails.MODE_ICON="hide"; //NO I18N
             }
 
             var tfaArray = tfaSelfConfig.CONFIGURED_TFA_ARRAY;
             for(t=0;t<tfaArray.length;t++) {
                if(tfaArray[t].PAM_MODULE_NAME=='TFA_MAIL_AUTHENTICATOR') {
                   tfaArray[t].MODE_ICON = 'outgoing-conv-off'; //NO I18N
                }
                else if(tfaArray[t].PAM_MODULE_NAME=='TFA_GOOGLE_AUTHENTICATOR') {
                   tfaArray[t].MODE_ICON = 'google-icon'; //NO I18N
                }
             }
             
             sdpAjax({
                url: "/RestAPI/WC/TwoFactorAction?method=getBackupVerificationCode", //NO I18N
                type: "POST", //NO I18N
                success: function(backupCodes) {
                   tfaSelfConfig.TFA_BACKUP_VERIFICATION_CODE = backupCodes.TFA_BACKUP_VERIFICATION_CODE;
 
                   renderhbs('#topMenuHolder','tfa-top-menu', tfaSelfConfig,false,'common'); // NO I18N
 
                   TFAUserSettings.initializeTC();
 
                   TFAUserSettings.selectMode(userDetails.PAMMODULE_NAME);
                   TFAUserSettings.bindValidatefn();
                   if(tab) {
                      jQuery("#"+tab).trigger('click');
                   }
                   initTooltip("#topMenuHolder"); // NO I18N
                }
             });
          }
       });
    },
 
    bulkDeleteTrustedBrowsers: function() {
       var selectedBrowsers = jQuery("#TRUSTED_BROWSERS_body input[type=checkbox]:checked");
       if(selectedBrowsers.length) {
          showconfirm(true,'title='+getMessageForKey('common.confirm.submit')+', message='+getMessageForKey('common.sureDelete')+', submitbutton='+getMessageForKey('common.proceed')+', cancelbutton='+getMessageForKey('common.no')+', closebutton=yes, closeOnEscKey=yes', function(proceed) {  //NO I18N
             if(proceed) {
                var browserIds = [];
                selectedBrowsers.each(function(i, v) {
                   browserIds.push(v.value);
                });
                var delBrowsers = {DELETE_BROWSER_IDS: "["+browserIds.toString()+"]"};
                sdpAjax({
                   type: "POST", //NO I18N
                   data: delBrowsers,
                   url: "/RestAPI/WC/TwoFactorAction?method=deleteUserTrustedBrowser", //NO I18N
                   success: function(data) {
                      TFAUserSettings.showStatus(data);
                      TFAUserSettings.table_comp.refreshTable();
                   }
                });
             }
         },true);
       }
       else {
          showalert("failure", getMessageForKey("ads.login.twofactor.alert_atleast_one_browser_must_be_selected_to_delete"), "isAutoHide=true"); //NO I18N
       }
    },
 
    showStatus: function(data) {
       var isSuccess = true;
       var successMsg =  data.sSTATUS || data.MESSAGE;
       var failureMsg = data.eSTATUS || data.ERROR_MESSAGE;
       if(failureMsg) {
          showalert('failure', getMessageForKey(failureMsg), 'isAutoHide=false'); //NO I18N
          isSuccess = false;
       }
       else if(successMsg) {
          showalert('success', getMessageForKey(successMsg), 'isAutoHide=true'); //NO I18N
       }
       else if(data.wSTATUS) {
          showalert('warning', getMessageForKey(data.wSTATUS), 'isAutoHide=true'); //NO I18N
       }
       return isSuccess;
    },
 
    selectMode: function(id) {
       jQuery("#changeAuthTypesList span[name=icon]").removeClass().addClass("check-circle bg-light mr10");
       jQuery('#'+id+"_select").find("span[name=icon]").removeClass().addClass("cspr success icon-sm mr10");
    },
 
    //Tablecomponent functions starts
    initializeTC: function() {
       var table_content = {};
       table_content.header=TFAUserSettings.headerdataConstruct();
       var options = {};
       options.paginationEnabled = true;
       options.searchEnabled = true;
       options.callbackRowfunction = TFAUserSettings.rowdataConstruct;
       options.row_inputdata = TFAUserSettings.rowdataConstruct();
       options.callbackDataGet = TFAUserSettings.callbackDataGet;
       options.entity_name = "TRUSTED_BROWSERS"; //NO I18N
       TFAUserSettings.table_comp = new tableComponent(table_comp.getTableInfo(), table_content, options);
    }, 
 
    rowdataConstruct: function() {
       var inputObject = {"list_info":{"sort_field":"order","sort_order":"asc"}}; //No I18N
       return inputObject;
    },
 
    callbackDataGet: function() {
       var data = {};
       data.RECORDS_PER_PAGE=10;
       data.PAGE=1;
       if(TFAUserSettings.table_comp.t_obj) {
          var rowListInfo = TFAUserSettings.table_comp.t_obj.options.row_inputdata.list_info;
          var tableListInfo = TFAUserSettings.table_comp.t_obj.table_info.list_info;
          if(rowListInfo && tableListInfo) {
             if(rowListInfo.start_index && rowListInfo.row_count) {
                data.RECORDS_PER_PAGE = tableListInfo.row_count;
                data.PAGE = 1+Math.round(rowListInfo.start_index / parseInt(rowListInfo.row_count));
             }
             if(tableListInfo.search_fields) {
                var searchFields = tableListInfo.search_fields;
                data.SEARCH_IP_ADDRESS = searchFields.IP;
                data.SEARCH_USER_AGENT = searchFields.USER_AGENT;
             }
          }
       }
       
       var responseData = {};
       sdpAjax({
          async: false,
          data: data,
          type: "POST", //NO I18N
          url:"/RestAPI/WC/TwoFactorAction?method=getUserTrustedBrowsers", //NO I18N
          success: function(data) {
             responseData = data;
             var browserList = responseData.TRUSTED_BROWSERS;
             for(i=0;i<browserList.length;i++) { 
                browserList[i].id=browserList[i].ID;
             }
          }
       });
       responseData.list_info = {"sort_field":"order","sort_order":"asc", "start_index" : 1}; //NO I18N
       responseData.list_info.row_count = responseData.TRUSTED_BROWSERS.length;
       responseData.list_info.total_count = responseData.TRUSTED_BROWSERS_COUNT;
       responseData.list_info.has_more_rows = data.PAGE * parseInt(data.RECORDS_PER_PAGE) < responseData.TRUSTED_BROWSERS_COUNT;
       if(TFAUserSettings.table_comp.t_obj) {
          responseData.list_info.start_index = TFAUserSettings.table_comp.t_obj.options.row_inputdata.list_info.start_index;   
       }
       return responseData;
    },
 
    headerdataConstruct: function () {
        var  meta_data = {
          TRUSTED_BROWSERS_head_chk : {
                type : "checkbox", // No I18N
                default : true 
             },
          USER_AGENT : {
             text : getMessageForKey('common.Browser') // No I18N
          },
          TIME: {
             text: getMessageForKey('tfa.trustTime'), //NO I18N
             disableSearching: true
          },
          IP: {
             text: getMessageForKey('ae.cmdb.source.ipAddress'), //NO I18N
             dataCelltransformer : function(table_data) {
                var ip = e_attr(table_data.row_data.IP);
                if(table_data.row_data.CURRENT_BROWSER) {
                   ip = ip+" ("+getMessageForKey("ads.login.twofactor.this_browser")+")";
                }
                return "<span rel='uitip' title='"+ip+"'>"+ip+"</span>";
             }
          }
       };
       return meta_data;
    },
    //Tablecomponent functions end
 
    bindEvents: function() {
       jQuery('body').on('click','#ViewNotes',function () {
          jQuery('#HelpingNotes').slideToggle();
       });
    },
 
    generateBackupVerificationCode: function() {
       sdpAjax({
          type: "POST", //NO I18N
          url: "/RestAPI/WC/TwoFactorAction?method=generateBackupVerificationCode", //NO I18N
          success: function() {
             TFAUserSettings.init("backupCodeTab"); //NO I18N
          }
       });
    },
 
    //Common function to hide and show section
    CommonShowandHidefn: function(addHideEle, removeHideEle) {
       for (i = 0; i < addHideEle.length; i++) {
          jQuery('#' + addHideEle[i]).addClass('hide');
       }
       for (j = 0; j < removeHideEle.length; j++) {
          jQuery('#' + removeHideEle[j] + '').fadeIn(1000).removeClass('hide');
       }
    },
 
    // fn to verify the Selected option for Authentication mode
    VerifyEmailORGoogle: function() {
       var SelectedElement = jQuery('#SelectAuthMode').find('span.success').next().data('value'); //NO I18N
       if (SelectedElement == 'TFA_MAIL_AUTHENTICATOR') {
          TFAUserSettings.CommonShowandHidefn(['TwoFacAuthPanel','SelectAuthMode'],['VerifyEmail']); //NO I18N
       } 
       else if(SelectedElement == 'TFA_GOOGLE_AUTHENTICATOR') {
          var enrollmentDetails = TFAUserSettings.getSelfEnrollmentDetails(SelectedElement);
          jQuery("#GAUTH_SECRET_KEY").text(enrollmentDetails.MODE_DETAILS.AUTH_SECRET_KEY);
          jQuery("#G_QRCODE").attr('src', enrollmentDetails.MODE_DETAILS.PATH);
          TFAUserSettings.CommonShowandHidefn(['TwoFacAuthPanel','SelectAuthMode'],['VerifyGoogleAuth']); //NO I18N
       }
    },
 
    //After verified success goto auth selection mode
    GoToAuthMode: function(Curelement, formID) {
        if (jQuery('#' + formID).valid()) {
          var verifyAuth = {
             AUTH_RULE: "TFA_GOOGLE_AUTHENTICATOR", //NO I18N
             TRUSTED_BROWSER: jQuery("#verifyGoogleTrustBrowser").is(":checked"), //NO I18N
             SECRET_KEY: jQuery("#VerifyGoogleAuthCode").val().trim()
          };
          if(Curelement=='SendVerficationCode') {
             verifyAuth = {
                AUTH_RULE: "TFA_MAIL_AUTHENTICATOR", //NO I18N
                TRUSTED_BROWSER: jQuery("#verifyMailTrustBrowser").is(":checked"), //NO I18N
                SECRET_KEY: jQuery("#VerifyMailAuthCode").val().trim(),
                AUTH_SECRET_KEY: jQuery("#VerifyEmailInput").val()
             };
          }
          sdpAjax({
             type: "POST", //NO I18N
             url: "/RestAPI/WC/TwoFactorAction?method=verifySelfEnrollmentSecretCode", //NO I18N
             data: {VERIFY_AUTH: JSON.stringify(verifyAuth)},
             success: function(data) {
                TFAUserSettings.showStatus(data);
                if(data.IS_VALID) {
                   TFAUserSettings.init();
                }
             }
          });
       }
    },
 
    getSelfEnrollmentDetails: function(authType) {
       var result;
       sdpAjax({
          type: "POST", //NO I18N
          url: "/RestAPI/WC/TwoFactorAction?method=getSelfEnrollmentDetails", //NO I18N
          data: {AUTH_RULE: authType},
          async: false,
          success: function(data) {
             result = data;
          }
       });
       return result;
    },
 
    // after verifying the email send a code
    sendSelfEnrollmentSecretCode: function() {
        if (jQuery('#VerifyEmailform #VerifyEmailInput').valid()) {
          var email = jQuery("#VerifyEmailInput").val();
          sdpAjax({
             type: "POST", //NO I18N
             url: "/RestAPI/WC/TwoFactorAction?method=sendSelfEnrollmentSecretCode", //NO I18N
             data: {AUTH_RULE: "TFA_MAIL_AUTHENTICATOR", ENROLLMENT_KEY: email}, //NO I18N
             success: function(data) {
                TFAUserSettings.showStatus(data);
                if(data.IS_SUCCESS) {
                   jQuery('#VerifyEmail').addClass('hide');
                   jQuery('#SendVerficationCode').fadeIn(1000).removeClass('hide');
                }
             }
          });
        }
    },
 
    bindValidatefn: function() {
       var validateJson = {
          rules: {
             verifyCode: {
                required: true
             },
             VerifyEmailInput: {
                required: true,
                email: true
             }
          },
          messages: {
             verifyCode: {
                required: getMessageForKey("ads.login.twofactor.invalid_secret_key")
             },
             VerifyEmailInput: {
                required: getMessageForKey("ads.login.twofactor.email_auth_select_email_address")
             }
          },
          errorClass: 'text-danger', //NO I18N
          errorPlacement: function(error, element) {
             position = element.position();
             error.insertAfter(element);
             error.addClass('alert alert-danger alert-arrow p5 pos-abs').css({
                 'overflow': 'visible', //NO I18N
                 'top': (position.top + 50) + 'px', //NO I18N
                 'z-index': '100', //NO I18N
                 'left': '80px' //NO I18N
             });
             element.trigger('focus');
          }
       };
       jQuery('#GoogleAuthform').validate(validateJson);
       jQuery('#Verifycodeform').validate(validateJson);
       jQuery('#VerifyEmailform').validate(validateJson);
    }
 };