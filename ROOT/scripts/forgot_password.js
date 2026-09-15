$ = jQuery;

var SDPAuthentication = {
  isForgotPasswordPage: true,
  domainDropdownenabled: false,
  isEmailBasedForgotPassword: false,
  showMessage: function (isSuccess, message) {
    var msgDiv = jQuery("#statusMessageDiv");
    msgDiv.removeClass(!isSuccess ? "alert-success" : "alert-danger");
    msgDiv.addClass(isSuccess ? "alert-success" : "alert-danger");
    msgDiv.find("span.msg").text(message);
    msgDiv.slideDown();
  },

  hideMessage: function() {
    var msgDiv = jQuery("#statusMessageDiv");
    msgDiv.slideUp();
  },

  onUsernameChange: function() {
    var username = jQuery('#username').val();
    if(username == null || username.trim() == '') {
        return;
    }
    sdpAjax({
      type: "GET",  // No I18N
      url: "/api/v3/app_resources/domains",     // No I18N
      data: {input_data: sdpToJSON({username: username, auth_type: "local_auth"})},    // No I18N
      success: function(resp) {
        var domainSelect = jQuery('select[name="domain"]');
        domainSelect.closest('.pt20').hide();       // No I18N
        var len = resp.result.domains_list.length;
        var html = "";
        if(len > 1) {
          html = '<option value="-- Choose Domain --">' + translate("sdp.login.nodomain") + '</option>';    // No I18N
          domainSelect.closest('.pt20').show();     // No I18N
        }
        for (var domain of resp.result.domains_list) {
          if(domain == "Not in Domain"){
            html += "<option value='-'>"+encodeHTML(domain)+"</option>\n";      // No I18N
          }
          else{
            html += "<option value='" + encodeHTMLAttribute(domain) + "'>"+encodeHTML(domain)+"</option>\n";      // No I18N
          }
        }
        domainSelect.html(html);
        domainSelect.select2();
      },
      error: function(resp) {
        try {
          SDPAuthentication.showMessage(false, resp.responseJSON.response_status.messages[0].message.error);
        } catch (error) {
          SDPAuthentication.showMessage(false, translate("sdp.api.errormessage.unknownerror"));
        }
      }
    });
  },

  disablePasswordPaste: function() {
    jQuery(function() {
      jQuery('body').on('focus','input[type=password]', function() {
        if(typeof this.disabledPaste == 'undefined') {
          this.disabledPaste = true;
          this.onpaste = function(e) { e.preventDefault() };
        }
      });
    });
  },

  init: function() {
    if(SDPAuthentication.isForgotPasswordPage) {
      if(jQuery('select[name="domain"]').length > 0) {
        jQuery('select[name="domain"]').select2();
      }
      jQuery('#username').trigger('onchange');
    } else {
      $passwordChecker.init('#newPwd','#changePwdButton'); // No I18N
    }

    jQuery("#forgotPasswordForm").submit(function(e) {
      jQuery("#statusMessageDiv").hide();
      e.preventDefault();
      if(SDPAuthentication.isForgotPasswordPage) {
		if (SDPAuthentication.isEmailBasedForgotPassword) {
			if (jQuery('#email').val().trim().length == 0) {
				SDPAuthentication.showMessage(false, translate("sdp.common.email.id.invalid"));   // No I18N
				return;
			}
	    }
        else{
        if(!SDPAuthentication.domainDropdownenabled) {
          jQuery("#username").val(jQuery("#username").val().substring(jQuery("#username").val().indexOf("\\")+1));
        }
        if(jQuery('#username').val().trim().length == 0) {
          SDPAuthentication.showMessage(false, translate("sdp.admin.dcconfig.emptyusername"));   // No I18N
          return;
        }
        if(!SDPAuthentication.domainDropdownenabled) {
            if(jQuery('#domain').val().trim().length==0){
              jQuery('#domain').val("-");
            }
        }
        else{
          var domainSel = jQuery('#domain');
          if(domainSel[0] != undefined && !domainSel.prop('disabled') && domainSel.val() == '-- Choose Domain --') {
            SDPAuthentication.showMessage(false, translate("sdp.login.chooseDomain"));   // No I18N
            return;
          }
        }
      }
      } else {
        var pass1 = jQuery('#newPwd').val().trim();
        var pass2 = jQuery('#confirmNewPwd').val().trim();
        if (pass1 != pass2) {
          SDPAuthentication.showMessage(false, translate("sdp.jserror.retypepassword"));   // No I18N
          return;
        }
        if (pass1 == '' || pass2 == '') {
          SDPAuthentication.showMessage(false, translate("sdp.common.password.empty.error"));   // No I18N
          return;
        }
      }
      var form = jQuery(this);
      var actionUrl = form.attr('action');
      if(!SDPAuthentication.isForgotPasswordPage) {
        var newPwd = jQuery(this.elements['newPwd']);
        var confirmNewPwd = jQuery(this.elements['confirmNewPwd']);
        newPwd.val(encryptDataWithRSA(newPwd.val()));
        confirmNewPwd.val(encryptDataWithRSA(confirmNewPwd.val()));
      }
      jQuery.ajax({
        type: "POST",   // No I18N
        url: actionUrl,
        data: form.serialize(),
        success: function(resp) {
          if(!SDPAuthentication.isForgotPasswordPage) {
            setTimeout(function(){
		if(isMSP) {
			//this user data is already validated in account
			//DOM based uncontrollged redirection is not possible
			window.location.href="/" + loginUrl;
		}
		else {
              		window.location.href="/";
		}
            },2500);
          }
          SDPAuthentication.showMessage(true, resp.result.message);
        },
        error: function(resp) {
          try {
            var message = resp.responseJSON.response_status.messages[0].message;
            SDPAuthentication.showMessage(false, message.error || message);
          } catch (error) {
            SDPAuthentication.showMessage(false, translate("sdp.api.errormessage.unknownerror"));   // No I18N
          }
          jQuery("#newPwd, #confirmNewPwd").val("");
        }
      });
    });
  },

  userNameKeyUp: function() {
      var domainName = jQuery("#username").val();
      var index = domainName.indexOf("\\");
      if(index > 0)
      {
          var str = domainName.substring(0, index);//NO I18N
          jQuery('#domainLabel').show();
          jQuery('#domainName').html(encodeHTML(str.toUpperCase()));
          jQuery('#domainName').val(str.toUpperCase());
          jQuery('#domain').val(str.toUpperCase());
      }
      else
      {
          jQuery('#domainLabel').hide();
          jQuery('#domain').val("");
      }
  }
}
