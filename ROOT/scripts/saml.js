/* $Id$ */

var samlActions =
{
    getNameIdFormat: function (nameIdFormat) {
        if (typeof (nameIdFormat) !== 'string') {
            nameIdFormat = jQuery('#name_id_format').val();
        }
        return nameIdFormat;
    },

    isTransientOrPersistent: function (nameIdFormat) {
        nameIdFormat = samlActions.getNameIdFormat(nameIdFormat);
        return nameIdFormat === 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient' ||       // No I18N
            nameIdFormat === 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent';        // No I18N
    },

    isNameIdEmail: function (nameIdFormat) {
        nameIdFormat = samlActions.getNameIdFormat(nameIdFormat);
        return nameIdFormat === 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'   // No I18N
    },

    isDynamicUserAdditionEnabled: function () {
        return "true" === jQuery("#dynamicUserAddition").text();
    },

    handleLoginNameDomainDisplay: function (nameIdFormat) {
        var colorTransparent = 'transparent';   // No I18N
        var colorBlack = jQuery('#saml_first_name').css('color');       // No I18N
        var transientOrPersistent = samlActions.isTransientOrPersistent(nameIdFormat);
        var loginNameCol = jQuery("#saml_login_name_col");
        loginNameCol.find(".mandatory").toggle(!transientOrPersistent && samlActions.isDynamicUserAdditionEnabled())
        loginNameCol.find("input[type='text']").prop('disabled', transientOrPersistent).css('color', transientOrPersistent ? colorTransparent : colorBlack);       // No I18N
        loginNameCol.find("input[type='checkbox']").prop('disabled', true).prop('checked', !transientOrPersistent);      // No I18N
        jQuery("#saml_domain_col input").prop('disabled', transientOrPersistent).css('color', transientOrPersistent ? colorTransparent : colorBlack);        // No I18N
        var domain_cb = jQuery("#saml_domain_col input[type='checkbox']");      // No I18N
        if (transientOrPersistent && domain_cb.prop('checked')) {
            domain_cb.prop('checked', !transientOrPersistent);      // No I18N
        }
        if (transientOrPersistent) {
            jQuery("#field_map_form").valid();
        }

        var isEmail = samlActions.isNameIdEmail(nameIdFormat);
        jQuery("#saml_email_id_col input").prop('disabled', isEmail).css('color', isEmail ? colorTransparent : colorBlack);        // No I18N
        var email_cb = jQuery("#saml_email_id_col input[type='checkbox']");     // No I18N
        if (isEmail && email_cb.prop('checked')) {
            email_cb.prop('checked', !isEmail);     // No I18N
        }
    },

    initIdpAndFields: function (responseJson) {
        responseJson.load_template = 'saml-idp-template'; //No I18N
        renderhbs('#samlidp', 'saml-form', responseJson, false, 'admin'); //No I18N
        if (!sdp_app.IS_AE && (!sdp_app.IS_MSPOrSCP || featureStatus().IS_SAML_ADDITIONAL_CLAIM_ENABLED)) {
            responseJson.load_template = 'saml-field-map-template';
            renderhbs('#samlfieldmap', 'saml-form', responseJson, false, 'admin');
        }
        samlActions.applyFormValidations();
        samlActions.convertToSelect2("algorithm"); //NO I18N
        jQuery("#algorithm").select2({
            placeholder: translate("ae.cmdb.chooseAttrib", [translate("saml.algorithm")])
        });
        if (responseJson.samlidp && responseJson.samlidp.algorithm) {
            jQuery('#algorithm').select2('val', responseJson.samlidp.algorithm); //No I18N
        }

        samlActions.convertToSelect2("name_id_format"); //NO I18N
        if (responseJson.samlidp && responseJson.samlidp.name_id_format) {
            jQuery('#name_id_format').select2('val', responseJson.samlidp.name_id_format); //No I18N
        }
        if (!sdp_app.IS_AE && (!sdp_app.IS_MSPOrSCP || featureStatus().IS_SAML_ADDITIONAL_CLAIM_ENABLED)) {
            samlActions.handleLoginNameDomainDisplay(responseJson.samlsp.name_id_format);
            jQuery("#name_id_format").on("change", samlActions.handleLoginNameDomainDisplay);
        }
    },
    submitForm : function(arg, value)
    {
        var formname = "idp_manual"; //No I18N
        if(arg == "cer")
        {
            if(jQuery('#samlidpid').html() != "" && jQuery('#idp_manual_browse').val() == "")
            {
                jQuery('#idp_manual_file').html(jQuery('#idp_manual_browse').val());
                jQuery('#idp_manual_browse').parent().find("label").remove();
            }
            else
            {
                document.getElementById(formname+"_file").innerHTML = jQuery("#"+formname+"_browse").val() ? jQuery("#"+formname+"_browse").val() : translate("sdp.request.import.nofileselected");
                if(!(jQuery("#"+formname+"_browse").valid()))
                {
                    return;
                }
            }
        }
        else if(arg == "algo")
        {
            jQuery('#algorithm').valid();
        }
        else
        {
            if(!jQuery("#idp_manual_form").valid() || (!sdp_app.IS_AE && (!sdp_app.IS_MSPOrSCP || featureStatus().IS_SAML_ADDITIONAL_CLAIM_ENABLED)&& !jQuery("#field_map_form").valid())) {
                    return;
                }
            }
        if(arg === "save")
        {
        	if(isMSP) {
        		var is_valid = samlmsp.validateSave();
        		if(!is_valid) {
        			return;
        		}
        	}
            var $form = jQuery("#"+formname+"_form");
            var formData = new FormData();
            var file = ($form[0]).elements[formname+"_browse"].files[0];
            if(formname === "idp_manual"){
                formData.append('loginurl',jQuery("#login_url").val());
                formData.append('logouturl',jQuery("#logout_url").val());
                formData.append('algorithm',jQuery("#algorithm").val());
                formData.append('name_id_format',jQuery("#name_id_format").val());
                formData.append('certificateFile', file);  //No I18N
                
                function getFieldJson(fieldName) {
                    var fields = [];
                    if(!sdp_app.IS_AE && (!sdp_app.IS_MSPOrSCP || featureStatus().IS_SAML_ADDITIONAL_CLAIM_ENABLED)) {
                        var children = jQuery('#' + fieldName).children();
                        for (var i = 0; i < children.length; i++) {
                            var fieldInfo = {};
                            var child = jQuery(children[i]);
                            var fieldVal = child.find("input[type=text]").prop("value")       // No I18N
                            if(typeof fieldVal === 'string') {
                                if(fieldVal.trim().length !== 0 || !child.find("input[type=checkbox]").prop("checked")) {
                                    fieldInfo["name"] = child.find("input[type=text]").prop("name")      // No I18N
                                    fieldInfo["enabled"] = child.find("input[type=checkbox]").prop("checked")       // No I18N
                                    fieldInfo["value"] = fieldVal.trim();
                                    fields.push(fieldInfo);
                                } else {
                                    alert(translate("saml.field.notempty"));    // No I18N
                                    return;
                                }
                                if(fieldVal.includes("</script>")) {
                                    alert(translate("sdp.xss.vulnerability.message"))   // No I18N
                                    return;
                                }
                            }
                        }
                    }
                    return fields;
                }

                var defaultAttributes = getFieldJson('defaultFields');      // No I18N
                var additionalAttributes = getFieldJson('additionalFields');    // No I18N
                formData.append('defaultFields', defaultAttributes.toJSON());    // No I18N
                formData.append('additionalFields', additionalAttributes.toJSON());      // No I18N
                
                if(isMSP) {
                	var sp_id = jQuery("#sp_id").val();
                	formData.append('id', sp_id);   //No I18N
                	formData.append('name', jQuery("#sp_name").val());
                	formData.append('isDefault', jQuery("#default_conf").prop("checked"));  //No I18N
                	var selectedAccounts = jQuery("#assoAccSel2").val();
                	var accountsData;
                	if(selectedAccounts !== "") {
                		 accountsData = '[' + selectedAccounts + ']';
                	}else{
                		accountsData = "[]";
                	}
                	var data = {};
                	data.id = sp_id;
                	data.accounts = accountsData;
                	if(!samlmsp.validateAccountMapping(data, "configEdit")) {
                		return;
                	}
                	formData.append('accounts', accountsData);  //No I18N
                }
            }
            jQuery.post({
                url: '/Saml.do?method=addIDP', //No I18N
                data: formData,
                processData: false,
                contentType: false,
                success : function(res)
                {
                    if (res.status === "success") {
                        showalert("success",res.message,"isAutoHide=true");  //NO I18N
                        samlActions.initIdpAndFields(res);
                    }
                    else
                    {
                        showalert("failure",res.message,"isAutoHide=false");  //NO I18N
                    }
                },
                error : function(res)
                {
                    //SD-86549                   
                    var responsetext=jQuery(res.responseText).find('#messageHolder').html();
                    showalert("failure",responsetext,"isAutoHide=false");  //NO I18N
                }
            });
        }
    },
    generateCertificate : function(){
    	var data = {};
        if(isMSP) {
        	data.id = jQuery("#sp_id").val();
        }
        jQuery.post({
            url :"/Saml.do?method=generateCertificate", //NO I18N
            data : data,
            success : function(resp){
                if(resp.status === "success")
                {
                    showalert("success",resp.message,"isAutoHide=true");  //NO I18N
                    resp.load_template = 'saml-sp-template';
                    renderhbs('#spDetails', 'saml-form', resp, false, 'admin');
                }else{
                    showalert("failure",resp.message,"isAutoHide=false");  //NO I18N
                }
            }
        });
    },
    toggleEnabled : function(){
        var pele = jQuery('.switchonoff');
        if(pele.find("#samlToggle").prop('disabled'))
        {
            return;
        }
        var isDisabled = pele.find("#samlToggle").hasClass('off'); //NO I18N
        if(isDisabled)
        {
            if(!jQuery('#certificate').html())
            {
                showalert("failure", getMessageForKey("saml.enable.cer"), "isAutoHide=false"); //No I18N
                return;
            }
            if( "" == jQuery('#samlidpid').html() )
            {
                showalert("failure",getMessageForKey("saml.enable.warning"), "isAutoHide=false"); //No I18N
                return;
            }
        }
        pele.find("#samlToggle").prop('disabled', true); //No I18N
        var data = {};
        data.status = ( isDisabled ? 'enable' : 'disable' ) ; //No I18N
        if(isMSP) {
        	data.id = jQuery("#sp_id").val();
        }
        jQuery.post({
            url: 'Saml.do?method=setSamlStatus', //No I18N
            data : data,
            success : function(resp){
                if(resp.status === "success"){
                    showalert('success', resp.message,"isAutoHide=true"); // No I18N
                    pele.find("#samlToggle").toggleClass("on off"); //NO I18N
                    pele.find('#samlToggleText').text( isDisabled ? translate("common.enabled") : translate("common.disabled"));
                    var hideLoginFormDiv = jQuery('#hideLoginFormDiv');
                    if(isDisabled) {
                        hideLoginFormDiv.removeClass('opac5');  // No I18N
                        hideLoginFormDiv.css("pointer-events","");      // No I18N
                    } else {
                        hideLoginFormDiv.addClass('opac5');     // No I18N
                        hideLoginFormDiv.css("pointer-events","none");      // No I18N
                    }
                    resp.load_template = 'saml-info-warning-template';
                    renderhbs('#infoWarning', 'saml-form', resp, false, 'admin');
                }
                else if(resp.status === 'failure' && resp.message){
                    showalert('failure', resp.message, "isAutoHide=false"); //No I18N
                }
            }
        });
        setTimeout(function(){pele.find("#samlToggle").prop('disabled', false);}, 2000); //No I18N
    },
    onHideLoginFormToggle : function(){
        var cbDivs = jQuery('.switchonoff');
        if(cbDivs.find("#hide-login-form").prop('disabled'))
        {
            return;
        }
        var isDisabled = cbDivs.find("#hide-login-form").hasClass('off'); //NO I18N

        cbDivs.find("#hide-login-form").prop('disabled', true); //No I18N
        var data = {"login_config": [{"parameter": "COLLAPSE_LOGIN_FORM", "category": "LOGIN_FORM", "param_value": isDisabled}]};       // No I18N
        sdpAjax({
            url: '/api/v3/login_config/', //No I18N
            data: {input_data: sdpToJSON(data)},
            type: 'PUT', // No I18N
            success: function (resp) {
                showalert('success', translate("sdp.admin.common.updatedsuccessfully"), "isAutoHide=true"); // No I18N
                cbDivs.find("#hide-login-form").toggleClass("on off"); //NO I18N
                cbDivs.find('#hide-login-form-text').text(isDisabled ? translate("common.enabled") : translate("common.disabled"));
            },
            error: (resp) => {
                showalert('failure', resp.message, "isAutoHide=false"); //No I18N
            }
        });
        setTimeout(function(){cbDivs.find("#hide-login-form").prop('disabled', false);}, 2000); //No I18N
    },
    refreshModel : function(){
        window.location.reload();
    },
    convertToSelect2 : function(fieldName)
    {
        var data = {formatNoMatches: getMessageForKey('ae.select2.no.message')};
        jQuery('[name='+fieldName+']').select2(data); //No I18N
    },
    applyFormValidations : function ()
    {
        jQuery('[name=idp_manual_form]').validate({
            ignore: [],
            onkeyup: function(element){
                jQuery(element).valid();
            },
            onclick: false,
            onfocusout: false,
            rules: {
                login_url: {
                    required: true,
                    url : true
                },
                logout_url: {
                    required: false,
                    url : true
                },
                algorithm: {
                    required: true
                },
                idp_manual_browse: {
                    required: function () {
                        return jQuery('#samlidpid').html() === "";
                    },
                    accept: "cer|der|crt|pem|cert" //No I18N
                }
            },
            messages: {
                login_url: {
                    required: getMessageForKey("saml.loginurl.mandate.msg"),
                    url : getMessageForKey("common.invalid.field.error.msg", [getMessageForKey("saml.loginurl")])
                },
                logout_url: {
                    url : getMessageForKey("common.invalid.field.error.msg", [getMessageForKey("saml.logouturl")])
                },
                algorithm: {
                    required: getMessageForKey("saml.algorithm.msg")
                },
                idp_manual_browse: {
                    required : getMessageForKey("saml.cer.choose"),
                    accept : getMessageForKey("saml.import.cer")
                }
            },
            errorClass: 'text-danger', //No I18N
            errorPlacement: function( error, element ) {
                position = element.position();
                error.insertAfter( element )
                error.addClass('alert alert-danger alert-arrow p5 left10').css({ 'position':'absolute','overflow':'visible','bottom': '-40px','z-index':'99' });//NO I18N
                element.focus();
            },
            invalidHandler: function(form, validator) {
                if (validator.numberOfInvalids()) {
                    validator.errorList[0].element.focus();
                }
            }
        });
        if(!sdp_app.IS_AE && (!sdp_app.IS_MSPOrSCP || featureStatus().IS_SAML_ADDITIONAL_CLAIM_ENABLED)) {
            jQuery('[name=field_map_form]').validate({
                onkeyup: function (element) {
                    jQuery(element).valid();
                },
                rules: {
                    login_name: {
                        required: function () {
                            return samlActions.isDynamicUserAdditionEnabled() && !samlActions.isTransientOrPersistent();
                        },
                        normalizer: function(value) {
                            return jQuery.trim(value);
                        }
                    },
                },
                messages: {
                    login_name: {
                        required: getMessageForKey("saml.claim.loginname.mandate.msg")
                    }
                },
                errorPlacement: function (error, element) {
                    error.insertAfter(element)
                    error.addClass('alert alert-danger alert-arrow p5 left10').css({'position': 'absolute', 'overflow': 'visible', 'bottom': '-55px', 'z-index': '99'});//NO I18N
                },
                invalidHandler: function (form, validator) {
                    if (validator.numberOfInvalids()) {
                        validator.errorList[0].element.focus();
            }
                }
        });
        }
    },
    loadSamlHistory : function() {
        $previewComponent.load("/common/ViewHistory.jsp?id=1&module=saml_auth&key=saml_history_sort_order", translate("common.history") + ' - ' + translate('saml.title'), '70%', false, false, "admin_history", true, false, "custom_class:whitebg history-dig,isFullPage:true"); // NO I18N
    },
    processHistory : function(data)
    {
        var i18nData = {};
        i18nData.add = translate("sdp.requests.history.created"); //No i18N
        i18nData.edit = translate("sdp.requests.history.updated"); //No i18N
        var isMDH = data.isMDH;

        var finalData = [];

        for (var historyIndex = 0; historyIndex < data.history.length; historyIndex ++)
        {
            var historyItem = data.history[historyIndex];
            if(historyItem.operation_name === 'add'){
                historyItem.className = "cspr icon-xs add1 vtop pos-rel top2 " + (isMDH ? "left1" : "left2");
            }
            else if(historyItem.operation_name === 'edit'){
                historyItem.className = "cspr icon-xs spot-edit1 vtop pos-rel top2 " + (isMDH ? "left1" : "left2");
            }
            historyItem.time = historyItem.time || {};
            historyItem.time.date = historyItem.time.date || historyItem.client_time.date;
            historyItem.time.time = historyItem.time.time || historyItem.client_time.time;
            historyItem.operation = historyItem.operation || historyItem.operation_name;
            historyItem.display_operation_name = i18nData[ historyItem.operation_name ];
            finalData.push(historyItem);
        }
        return finalData;
    }
}
