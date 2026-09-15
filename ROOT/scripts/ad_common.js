var adCommon=
{
    localAuthPassParam : {},
    passwordJsonParam : {},
    clickPreDefPass : function()
    {
        jQuery('#preDefinedPassValue').prop('disabled', false); //No I18N
        jQuery('#preDefinedPassValue').trigger('focus');
        jQuery('#resetPWDLink').prop('disabled', false); //No I18N
    },
    clickRandomPass : function()
    {
        jQuery('#preDefinedPassValue').prop('disabled',true); // No I18N
        jQuery('#resetPWDLink').prop('disabled',true); // No I18N
        jQuery('#localAuthPass').prop( 'disabled', false); // NO I18n
    },
    saveLocalAuthPass: function(btn)
    {
          var preDefinedPassValue = jQuery('#preDefinedPassValue').val();
          if(sdp_app.IS_DEMO_BUILD){
            disableForDemo();
            return false;
          }
          if(jQuery('#preDefinedPass').is(":checked"))
          {
              if(preDefinedPassValue == "")
              {
                  	alert(getMessageForKey("sdp.common.emptymessage",[getMessageForKey("sdp.admin.ad.localauth.predefinedpassword")]));
                  	jQuery('#preDefinedPassValue').trigger('focus');
                 	return false;
              }
              else
              {
                    if(isEmpty(preDefinedPassValue))
                    {
                        alert(getMessageForKey("sdp.admin.requester.resetpassword.passwordjserror"));
                        jQuery('#preDefinedPassValue').val('');
                        jQuery('#preDefinedPassValue').trigger('focus');
                        return false;
                    }
                  	adCommon.showTextBox(false);
                    preDefinedPassValue = encryptDataWithRSA(preDefinedPassValue);
    		        adCommon.passwordJsonParam.preDefinedPassValue = preDefinedPassValue;
              }
          }
          else
          {
              adCommon.showTextBox(true);
              jQuery('#resetPreDefPwdInfo').addClass('hide');
          }
        adCommon.passwordJsonParam.randomPass = jQuery('#randomPass').is(":checked") ? true : false; //No I18N
        return adCommon.localAuthAjaxCall(btn,"laPassSettings",adCommon.passwordJsonParam); //No I18N
    },
    loadLAuthPass : function()
    {
        if(adCommon.localAuthPassParam === true)
        {
            jQuery('#randomPass').prop('checked',true); //No I18N
            jQuery('#preDefinedPassValue').val('');
        }
        else
        {
           	jQuery('#preDefinedPass').prop('checked',true); //No I18N
            adCommon.showTextBox(false);
        }
    },
    editLocalAuthPassSection: function()
    {
        jQuery('#randomPass').prop('disabled',false); //No I18N
        jQuery('#preDefinedPass').prop('disabled', false); //No I18N
        jQuery('#resetPWDLink').prop('disabled', false); //No I18N
        if(adCommon.localAuthPassParam === false)
        {
           adCommon.showTextBox(true);
        }
    },
    showTextBox : function(preDefPWD)
    {
        if(preDefPWD)
        {
           jQuery('#resetLAPwd').addClass('hide');
           jQuery('#preDefPWD').removeClass('hide');

           jQuery('#preDefinedPassValue').val('');
           adCommon.clickPreDefPass();
        }
        else
        {
           jQuery('#preDefPWD').addClass('hide');
           jQuery('#resetLAPwd').removeClass('hide');

           jQuery('#resetPreDefPwdInfo').removeClass('hide');
           jQuery('#resetPWDLink').prop('disabled',true); // No I18N

           jQuery('#preDefinedPassValue').val('');
        }
    },
    initCalendarField : function(field){
      const field_input = field+'_IN';//No I18N
      const field_display = field_input+'_Display';//No I18N
      const field_cal_button = field+'_Cal_Button';//No I18N
      const value = document.getElementById(field).getAttribute('data-value');
      const display_date = document.getElementById(field).getAttribute('data-display-date');
      jQuery('#'+field).html(
        '<div class="input-group date">'+
          '<input type="hidden" id="'+field_input+'" value="'+value+'"></input>'+
          '<input type="textbox" readonly id="'+field_display+'" class="form-control dateFieldForceLTR cur-ptr" data-clear="yes">'+
          '<span class="input-group-addon cur-ptr" id='+field_cal_button+'><span class="cspr calendar"></span></span>'+
        '</div>'
        );
      jQuery('#'+field_display).val(display_date=='-'?'':display_date);
      jQuery('#'+field_cal_button).bind('click', function(){initCalendar(field_input);});
      jQuery('#'+field_display).bind('click', function(){initCalendar(field_input);});
    },
    restrictEnter : function(e)
    {
      code = e.keyCode ? e.keyCode : e.which;
    	if(code.toString() == 13)
      {
        e.preventDefault();
        showalert('warning',getMessageForKey('sdp.admin.ad.enter.restriction'),'isAutoHide=true,closeOnEscKey=yes,delay=4'); //No I18N
      }
    },
    localAuthAjaxCall : function (btn,form,jsonparam){
        var allowEditSection = false;
        var msg = jQuery(btn).button('loading');
        sdpAjax({
            url : "/servlet/AJaxServlet?action="+form,//No I18N
            type : "POST",//No I18N
            data : jsonparam,
            dataType : "text",//No I18N
            async: false,
            success : function(responseText){
                var response = JSON.parse(responseText);
                var status=response.status;
                var message = response.message;
                switch(status)
                {
                    case "Success": //No I18N
                        showalert('success',message,'isAutoHide=true'); //No I18N
                        adCommon.localAuthPassParam = jQuery('#randomPass').is(":checked") ? true : false; //No I18N
                        window.location.reload();
                        break;
                    case "Failure": //No I18N
                        showalert('failure',message,'isAutoHide=false,closeOnEscKey=no'); //No I18N
                        break;
                    case "Warning": //No I18N
                        showalert('warning',message,'isAutoHide=true'); //No I18N
                        allowEditSection = true;
                        break;
                    case "Info": //No I18N
                        showalert('info',message,'isAutoHide=true'); //No I18N
                        allowEditSection = true;
                        jQuery(btn).closest('.activedirect-section').find('.submit-row').addClass('hide').end().find('input').prop('disabled', true); //No I18N
                        jQuery(btn).closest('.activedirect-section').find('.modal-overlay2,.freezelayer-text').removeClass('hide'); //No I18N
                        window.location.reload();
                        break;
                }
                msg.button('reset');
            },
            error: function(){
                showalert('failure',getMessageForKey("sdp.admin.dcconfig.settings.error.message"),'isAutoHide=false,closeOnEscKey=no'); //No I18N
                msg.button('reset');
            }
        });
        return allowEditSection;
    }
}