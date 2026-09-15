var zia_parser_config = {
    zp_bean : {},
    old_email_parser_bean : {},
    //To save email command via ajax call. Once completed, save the parser config via ajax call
    saveEmailCommand: function() {
        let inputJson = {};
        let email_parser_json = {};
        let ecForm = jQuery('#ec_configuration');
        email_parser_json.email_parser = ecForm.find('#parseEnabled').prop('checked'); //No I18N
        email_parser_json.email_parser_subject = ecForm.find('#titleString').val();
        email_parser_json.email_parser_delimiter = ecForm.find('#parseDelimiter').val();
        inputJson.email_parser = email_parser_json;
        return sdpAjax({
            url: "/api/v3/email_parsers/_save_email_parser", //NO I18N
            data: sdpAjaxInputData(inputJson),
		    type: "POST", //NO I18N
		    dataType:"json", //NO I18N
            async: false,
		    complete : function(resp) {
                let response = resp.responseJSON;
				if(response.response_status.status === "success") {
				    //Update the sample content based on the command delimiter
                    ecForm.find('#wcag-sampleCnt').html(response.email_parser.email_parser_sample_content);
                    zia_parser_config.old_email_parser_bean = response.email_parser;
				}
			}
        });
    },
    //Client side validation of email command configuration
    validateEmailCommand: function() {
        let emailCommandEle = jQuery('#ec_configuration');
        let subjectEle = emailCommandEle.find('#titleString');
        //In rebranded setup, #subject will not be rendered. So, setting zpSubject value as "" here
        let zpSubject = sdp_app.IS_REBRAND ? "" : jQuery('#subject').val().trim().toLowerCase();
        let ecSubject = subjectEle.val().trim().toLowerCase();
        let valid = jQuery('form[name="EMailDefForm"]').valid();
        if(valid && ecSubject === zpSubject) {
            showalert('failure', translate('zia.parser.subject.same.error', [translate('sdp.admin.email.mailparser.tooltip'), translate('zia.parser')]), 'isAutoHide=false'); //No I18N
            valid = false;
            subjectEle.focus();
        }
        if(!valid) {
            jQuery('#commandsavebtn').button('reset');
        }
        return valid;
    },
    alertNoChanges: function() {
        showalert('info', translate("sdp.common.nochangestosave") ,'isAutoHide=true');//NO I18N
    },
    //Validate both email commands and parser and initiate save.
    validateAndSaveBothCommands: function() {
        let emailCommandChanged = zia_parser_config.isEmailCommandChanged();
        let ziaParserChanged = zia_parser_config.isZiaParserChanged();
        if(!(emailCommandChanged || ziaParserChanged)) {
            return zia_parser_config.alertNoChanges();
        }

        if(emailCommandChanged && !zia_parser_config.validateEmailCommand()) {
            return false;
        }

        if(ziaParserChanged) {
            if(!zia_parser_config.validate()) {
                return false;
            }
        }
        let saveButton = jQuery('#commandsavebtn');
        saveButton.button('loading'); //No I18N

        zia_parser_config.saveBothCommands(true);

    },

    /**
     * Save both email commands and zia parser configuration. Proceed will be true / false based on user selection in confirmation dialog.
     * Without confirmation, it will always be true
     */
    saveBothCommands: async function(proceed) {

        if (proceed) {
        let ec_response, zp_response;
            let emailCommandChanged = zia_parser_config.isEmailCommandChanged();
            let ziaParserChanged = zia_parser_config.isZiaParserChanged();
            const promises = [];
            if (emailCommandChanged) {
                promises.push(zia_parser_config.saveEmailCommand().catch(error => error.responseJSON));
        }

            //Save Zia parser
            if (ziaParserChanged) {
                promises.push(zia_parser_config.saveConfig(true).catch(error => error.responseJSON));
            }

            // Wait for all promises to complete
            const results = await Promise.all(promises);

            //Get the results from promises
            if(emailCommandChanged && ziaParserChanged) {
                [ec_response, zp_response] = results;
            }
            else if(emailCommandChanged) {
                ec_response = results[0];
            }
            else if(ziaParserChanged) {
                zp_response = results[0];
        }

            //Process the response
            if (emailCommandChanged && ec_response) {
            if(ec_response.response_status.status === 'success') {
                ec_status = 'success'; //No I18N
                ec_msg = translate("api.saved.success", [translate("sdp.admin.email.mailparser.tooltip")]);
            }
            else {
                ec_status = ec_response.response_status.status;
                ec_msg = ec_response.response_status.messages[0].message;
            }
        }

        let zp_msg, zp_status;
            if (ziaParserChanged && zp_response) {
            if(zp_response.messages) {
                let first_message = zp_response.messages[0];
                zp_status = first_message.type;
                zp_msg = first_message.message;
            }
            else {
                zp_status = zp_response.status;
                zp_msg = zp_status === 'success' ? translate("api.saved.success", [translate("zia.parser")]) : result.message ? result.message : '';
            }
        }

        let st, msg = "", msg1 = "";
        if(emailCommandChanged && ziaParserChanged) {
            if(zp_status === 'success' && ec_status === 'success') {
                st = 'success'; //No I18N
                msg = translate("sdp.admin.backup.settings.save.success.msg");
            }
            else {
                st = (ec_status === 'failed') ? ec_status : zp_status; //No I18N
                msg = ec_msg;
                msg1 = zp_msg;
            }
        }
        else if(emailCommandChanged) {
            st = ec_status;
            msg = ec_msg;
        }
        else if(ziaParserChanged) {
            st = zp_status;
            msg = zp_msg;
        }

        //For info messages, the delay should be set to 8s for readability
            let delay = st === 'info' ? '8' : '3'; //No I18N
            let autoHide = (st === 'success' || st === 'info') ? 'true' : 'false'; //No I18N
            let opt = 'isAutoHide=' + autoHide + ',delay=' + delay; //No I18N
            st = (st === 'failed') ? 'failure' : st; //No I18N
            msg = e_html(msg);
            if(msg1 != "") {
                msg = msg + "<br/><br/>" + e_html(msg1); //NO I18N
            }
            showalert(st, msg, opt);
            jQuery('#commandsavebtn').button('reset'); //No I18N
        }

    },
    //Get zia email parsers metainfo. With this call, the excluded_fields & excluded_actions fields' allowed_values will be retrieved
    getMetaInfo: function() {
        let metainfo = {};
        sdpAjax({
            url: "/api/v3/zia_parsers/_metainfo", //No I18N
            method: "GET", //No I18N
            async: false,
            success: function(resp) {
                if(resp.response_status.status === 'success') {
                    metainfo = resp.metainfo;
                    zia_parser_config.metainfo = metainfo;
                }
            }
        });
        return metainfo;
    },
    //Get zia parser configurations and load it in zp_bean
    getZiaParser: function() {
        let ziaparser = {};
        sdpAjax({
            url: "/api/v3/zia_parsers", //No I18N
            method: "GET", //No I18N
            async: false,
            success: function(resp) {
                if(resp.response_status[0].status === 'success') {
                    ziaparser = resp.zia_parsers[0];
                }
            }
        });
        zia_parser_config.zp_bean = ziaparser;
        return ziaparser;
    },
    getHbsConfig: function() {
        let fromZiaConfig = zia_parser_config.fromZiaConfig();
        let hbsData = {
            "includeConfig" : true, //No I18N
            "includeModify" : fromZiaConfig, //No I18N
            "includeEnable" : !fromZiaConfig, //For zia configuration page, enable is handled in the row itself. //No I18N
            "includeFooter" : fromZiaConfig, //No I18N
            "includeTest" : fromZiaConfig,  //No I18N
            "includeTemplate" : fromZiaConfig //No I18N
        };
        return hbsData;
    },
    initValidator : function() {
        jQuery('#ZPConfigForm').removeData("validator").validate({ //No I18N
            errorClass: 'text-danger',      // No I18N
            errorPlacement: function(error, element) {
                error.insertAfter(element);
                error.addClass('alert alert-danger p5 pos-abs').css({
                    'overflow': 'visible',      // No I18N
                    'width' : 'auto'            // No I18N
                });
            }
        });
        jQuery('#ZPConfigForm input, #ZPConfigForm textarea').each(function() {
            jQuery(this).rules('add', { //No I18N
                normalizer: function(value) {
                    return jQuery.trim(value);
                }
            });
        });
        //Event bind on enabling the zia parser
        let zpForm = jQuery('#ZPConfigForm');
        zpForm.find('#ziaparserenabled').off('click.ziaparser').on('click.ziaparser', function(event) { //No I18N
            let isChecked = jQuery(event.target).prop('checked'); //No I18N
            if (isChecked) {
                event.preventDefault();
                event.stopPropagation();
                showconfirm(true, 'title=' + translate("common.confirm") + ',message=' + translate('zia.parser.enable.warning') + ',submitbutton=' + translate("common.proceed") + ',cancelbutton=' + translate("sdp.common.cancel")  + ',closebutton=yes', function(result) { //No I18N
                    if (result) {
                        zpForm.find('#ziaparserenabled').prop('checked', true); //No I18N
                    }
                }, null);
            }
        });
    },
    initPopupValidator : function() {
        let containerJQ = jQuery('#zp_popup');
        containerJQ.find('#ZPConfigForm').attr({
            id: 'ZPConfigForm_popup', //No I18N
            name: 'ZPConfigForm_popup' //No I18N
        });
        jQuery('#ZPConfigForm_popup').removeData("validator").validate({ //No I18N
            errorClass: 'text-danger',      // No I18N
            errorPlacement: function(error, element) {
                error.insertAfter(element);
                error.addClass('alert alert-danger p5 pos-abs').css({
                    'overflow': 'visible',      // No I18N
                    'width' : 'auto'    //NO I18N
                });
            }
        });
        jQuery('#ZPConfigForm_popup input, #ZPConfigForm_popup textarea').each(function() {
            jQuery(this).rules('add', { //No I18N
                normalizer: function(value) {
                    return jQuery.trim(value);
                }
            });
        });
    },
    /**
        Render the zia parser configuration. In email command page, it will be rendered parallel to email command configuration.
        In zia configurations page, it will be rendered in a popup
    */
    openConfig: function() {
        let fromZiaConfig = zia_parser_config.fromZiaConfig();
        if(fromZiaConfig) {
            jQuery('#z_config').append('<div id="zp_configuration"></div>');
        }
        zia_parser_config.getZiaParser(); //Load zia email parser bean
        let metainfo = zia_parser_config.getMetaInfo();
        let hbsData = zia_parser_config.getHbsConfig();
        hbsData.zp = zia_parser_config.zp_bean;

        renderhbs('#zp_configuration', "ziaparser", hbsData, false, "zia/zia-admin", true, false, zia_parser_config.initValidator); //No I18N
        let zpConfigDiv = jQuery('#zp_configuration');
        zpConfigDiv.find('input[name="appendParserInfo"][value="' + zia_parser_config.zp_bean.append_parser_info + '"]').attr("checked", true);
        if(fromZiaConfig) {
            zpConfigDiv.dialog({
                modal: true,
                title: translate("zia.parser.config.title"),
                width: 900,
                maxHeight: 800,
                resizable: false,
                position: { my: "center top", at: "center top+100", of: window },// No I18N
                open: function() {
                    zpConfigDiv.find('#zpconfigdiv').addClass('h-470px oya');
                },
                close: function() {
                    jQuery('body').removeClass('subheader-of-h of-h');
                    zia_parser_config.closeConfig();
                }
            });
            let titleEle = zpConfigDiv.prev().find('.ui-dialog-title');
            let html = titleEle.html();
            html += '<a href="https://help.servicedeskplus.com/zia-parser" target="_blank" class="text-link fr font-base mt1">' + translate("common.admin.guide") + '</a>';
            titleEle.html(html).css('width','94%'); //No I18N
        }
        else {
            zpConfigDiv.find('#zpconfigdiv').removeClass('oya');
        }
        zia_parser_config.loadConfig(metainfo, zia_parser_config.zp_bean);
        if(!fromZiaConfig) {
            zia_parser_config.loadEmailCommand();
        }

        //Handle events
        let containerJQ = jQuery('#zp_configuration');
        containerJQ.find('#zpSave, #zpTest, #test-zp, #zpCancel, #zp_modify_info, a[data-notify="acknowledge"]').off('click.ziaparser'); //No I18N
        containerJQ.find('#zpSave').on('click.ziaparser', function(){zia_parser_config.saveConfig();}); //No I18N
        containerJQ.find('#zpTest, #test-zp').on('click.ziaparser', function(){zia_parser_config.checkAndOpenTest();}); //No I18N
        containerJQ.find('#zpCancel').on('click.ziaparser', function(){zia_parser_config.closeConfig();}); //No I18N
        containerJQ.find('#zp_modify_info').on('click.ziaparser', function() {zia_parser_config.openModifyInfo();}); //No I18N
        containerJQ.find('a[data-notify="acknowledge"]').on('click.ziaparser', function() {zia_parser_config.openAcknowledgeCustomisation(this);}); //No I18N
    },
    isEmailCommandChanged : function() {
        let newJson = zia_parser_config.getEmailCommandConfig();
        let oldJson = {};
        oldJson.email_parser = zia_parser_config.old_email_parser_bean.email_parser;
        oldJson.email_parser_subject = zia_parser_config.old_email_parser_bean.email_parser_subject;
        oldJson.email_parser_delimiter = zia_parser_config.old_email_parser_bean.email_parser_delimiter;
        return !zia_parser_config.isEqual(newJson, oldJson);
    },
    loadEmailCommand : function() {
        zia_parser_config.old_email_parser_bean = zia_parser_config.getEmailCommandConfig();
    },
    getEmailCommandConfig : function() {
        let config = {};
        let ecForm = jQuery('#ec_configuration');
        config.email_parser = ecForm.find('#parseEnabled').prop('checked'); //No I18N
        config.email_parser_subject = ecForm.find('#titleString').val();
        config.email_parser_delimiter = ecForm.find('#parseDelimiter').val();
        return config;
    },
    isZiaParserChanged : function() {
        //In rebranded setup, this should return false since zia parser configurations will not be shown
        if (sdp_app.IS_REBRAND) {
            return false;
        }
        let oldZpBean = {};
        oldZpBean.enabled = zia_parser_config.zp_bean.enabled;
        oldZpBean.subject = zia_parser_config.zp_bean.subject;
        oldZpBean.excluded_fields = (zia_parser_config.zp_bean.excluded_fields == null || zia_parser_config.zp_bean.excluded_fields === '') ? [] : zia_parser_config.zp_bean.excluded_fields.split(',');
        oldZpBean.excluded_actions = (zia_parser_config.zp_bean.excluded_actions == null || zia_parser_config.zp_bean.excluded_actions === '') ? [] : zia_parser_config.zp_bean.excluded_actions.split(',');
        oldZpBean.append_parser_info = zia_parser_config.zp_bean.append_parser_info;
        oldZpBean.send_acknowledge = zia_parser_config.zp_bean.send_acknowledge;
        let currentZpBean = zia_parser_config.getZiaParserConfig();
        if(zia_parser_config.fromZiaConfig()) {
            currentZpBean.enabled = oldZpBean.enabled;
        }

        return !zia_parser_config.isEqual(oldZpBean, currentZpBean);

    },
    getZiaParserConfig: function() {
        let ziaParserConfig = {};

        let formEle = jQuery('#zp_configuration');
        ziaParserConfig.subject = formEle.find('#subject').val();
        ziaParserConfig.excluded_fields = formEle.find('#excludedFields').select2('val'); //No I18N
        ziaParserConfig.excluded_actions = formEle.find('#excludedActions').select2('val'); //No I18N
        ziaParserConfig.append_parser_info = formEle.find('input[name="appendParserInfo"]:checked').val(); //No I18N
        ziaParserConfig.enabled = formEle.find('#ziaparserenabled').prop('checked'); //No I18N
        ziaParserConfig.send_acknowledge = formEle.find('#parserAcknowledge').prop('checked'); //No I18N
        return ziaParserConfig;
    },
    isAllFieldsSelected: function() {
        let formEle = jQuery('#zp_configuration');
        let fieldsCount = zia_parser_config.metainfo ? zia_parser_config.metainfo.fields.excluded_fields.allowed_values.length : 0;
        let currentFieldsCount = formEle.find('#excludedFields').select2('data').length; //No I18N
        return fieldsCount === currentFieldsCount;
    },
    isAllActionsSelected: function() {
        let formEle = jQuery('#zp_configuration');
        let actionsCount = zia_parser_config.metainfo ? zia_parser_config.metainfo.fields.excluded_actions.allowed_values.length : 0;
        let currentActionsCount = formEle.find('#excludedActions').select2('data').length; //No I18N
        return actionsCount === currentActionsCount;
    },
    isEqual: function(json1, json2) {
        if(json1 && json2) {
            let keys1 = Object.keys(json1);
            let keys2 = Object.keys(json2);
            if(keys1.length != keys2.length) {
                return false;
            }

            for(const key of keys1) {
                let value1 = json1[key];
                let value2 = json2[key];
                if(value1 != undefined && value2 != undefined) {
                    if(typeof value1 == 'string') {
                        if(value1.trim().toLowerCase() != value2.trim().toLowerCase()) {
                            return false;
                        }
                    }
                    else if(typeof value1 != 'object') {
                        if(value1 != value2) {
                            return false;
                        }
                    }
                    else if(Array.isArray(value1)) {
                        if(!zia_parser_config.isEqualArray(value1, value2)) {
                            return false;
                        }
                    }
                }
                else {
                    return false;
                }
            }

            return true;
        }
        else {
            return false;
        }
    },
    isEqualArray : function(array1, array2) {
        if(array1 != undefined && array2 != undefined) {
            if(array1.size() != array2.size()) {
                return false;
            }
            let set1 = new Set(array1);
            let set2 = new Set(array2);
            if(set1.size != set2.size) {
                return false;
            }

            for(let item of set1) {
                if(!set2.has(item)) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    },
    //Method to load the select field configurations in the rendered configuration page
    loadConfig: function(metainfo, ziaparser) {

        let fields = metainfo.fields;
        let selectFields = {"excludedFields" : "excluded_fields", "excludedActions" : "excluded_actions"}; //No I18N
        let keys = Object.keys(selectFields);
        keys.forEach(id => {
            let field = selectFields[id];
            let dataArr = [];
            if(fields[field]) {
                fields[field].allowed_values.forEach(element => {
                    let entries = Object.entries(element);
                    dataArr.push({id: entries[0][0], text: entries[0][1]});
                });
                jQuery('#' + id).select2({
                    placeholder: translate("common.select.placeholder"),
                    data: dataArr,
                    multiple: true,
                    closeOnSelect: false
                });
            }
        });

        keys.forEach(id => {
            let field = selectFields[id];
            if(ziaparser[field]) {
                let fieldValues = ziaparser[field].split(",");
                let selFields = [];
                fieldValues.forEach(field => {
                    selFields.push(field);
                    jQuery('#' + id).select2('val', selFields);
                });
            }
        });
    },
    openAcknowledgeCustomisation: function(ele) {
        let fromZiaConfig = zia_parser_config.fromZiaConfig();
        let notificationName = jQuery(ele).attr("data-notify-name");
        let templateDetails = {"template_name" :  notificationName}; //No I18N
        zia_parser_config.getTemplateDetails(notificationName, templateDetails);
        let containerJQ;
        if(fromZiaConfig) {
            containerJQ = jQuery('#zp_configuration');
            containerJQ.find('#zpconfigdiv, #zptestdiv, #zpmodifydiv').addClass('hide');
            renderhbs('#zpacknowledgediv', 'ziaparser_acknowledgement', templateDetails, false, 'zia/zia-admin', true, true, zia_parser_config.initValidator); //NO I18N
            containerJQ.prev().find('.ui-dialog-title').html('<a href="/" id="title_back_button" class="btn btn-default btn-xs mr10 pos-abs mt-2" rel="uitip" title="' + translate("sdp.common.back") + '"><span class="cspr icon-xs go-back vtop top3"></span></a><span class="ml40">' + translate("sdp.admin.notificationrules.template") + '</span>' + '<a href="https://help.servicedeskplus.com/zia-parser" target="_blank" class="text-link fr font-base mt1">' + translate("common.admin.guide") + '</a>').css('width','94%'); //No I18N
            containerJQ.prev().find('#title_back_button').off('click.ziaparser').on('click.ziaparser', function() {zia_parser_config.backModifyInfo();}); //No I18N
        }
        else {
            templateDetails.includeFooter = true;
            templateDetails.includeTemplate = true;
            renderhbs('#zp_popup', 'ziaparser', templateDetails, false, 'zia/zia-admin', true); //NO I18N
            renderhbs('#zpacknowledgediv', 'ziaparser_acknowledgement', templateDetails, false, 'zia/zia-admin', true); //NO I18N
            containerJQ = jQuery('#zp_popup');
            zia_parser_config.initPopupValidator();
            containerJQ.dialog({
                title: translate("sdp.admin.notificationrules.template"),
                width: 900,
                maxHeight: 800,
                modal: true,
                resizable: false,
                position: { my: "center top", at: "center top+100", of: window },// No I18N
                close: function() {
                    jQuery('body').removeClass('subheader-of-h of-h');
                }
            });
            let titleEle = containerJQ.prev().find('.ui-dialog-title');
            let html = titleEle.html();
            html += '<a href="https://help.servicedeskplus.com/zia-parser" target="_blank" class="text-link fr font-base mt1">' + translate("common.admin.guide") + '</a>';
            titleEle.html(html).css('width','94%'); //No I18N
        }

        jQuery('#zpacknowledgediv').removeClass('hide');

        //Initialize the template with editor
        if(templateDetails.is_html_enabled) {
            zeditor({
                element : 'acknowledgeDesc', //No I18N
                edithtml: true,
                isEnterKeyHandler: true,
                buttonsToHide:['image'],
                content: templateDetails.description,
                allowFullscreen: true,
                customName:'ZPAckDescEditor' //No I18N
            });
            setTimeout(function(){zia_parser_config.initAutoComplete(notificationName)}, 1000);
        }
        else {
            jQuery('#acknowledgeDesc').html(templateDetails.description);
        }

        //Handle footer
        containerJQ.find('#zpSave, #zpCancel').off('click.ziaparser'); //No I18N
        containerJQ.find('#zpSave').on('click.ziaparser', function(){ zia_parser_config.saveAcknowledgementTemplate(); }); //No I18N
        containerJQ.find('#zpCancel').on('click.ziaparser', function(){ zia_parser_config.backModifyInfo(); }); //No I18N
        containerJQ.find('#zpTest').addClass('hide');
        containerJQ.find('#zpinfo').focus();
    },
    saveAcknowledgementTemplate: function() {
        let templateDiv = jQuery('#zpacknowledgediv');
        let saveButton = jQuery.find('#zpSave');
        jQuery(saveButton).prop('disabled', true); //No I18N
        let templateName = templateDiv.find('#template_name').val();
        let subject = templateDiv.find('#subject_ack').val();
        let description = '';
        let descriptionEle;
        if(templateDiv.find('#ze_acknowledgeDesc').length > 0) {
            descriptionEle = '#ze_acknowledgeDesc'; //NO I18N
            description = parent['ZPAckDescEditor'].getHTML();
            if(description.trim() !== '') {
            description = description.split('\n');
            description = description.map(line => `<div>${line}<br></div>`).join('');
        }
        }
        else {
            descriptionEle = '#acknowledgeDesc'; //NO I18N
            description = templateDiv.find('#acknowledgeDesc').val();
        }

        if(!zia_parser_config.isValidForm()) {
            jQuery(saveButton).prop('disabled', false); //No I18N
            return false;
        }
        else {
            if(description.trim() === '') {
                showalert('failure', translate('sdp.common.error.empty', [translate('common.message')]), 'isAutoHide=false'); //No I18N
                jQuery(saveButton).prop('disabled', false); //No I18N
                return false;
            }
        }

        const parser_ack = {"subject" : subject, "description" : description}; //No I18N

        sdpAjax({
            url: '/api/v3/zia_parsers/_save_acknowledgement_details/' + templateName, //No I18N
            async: false,
            method: 'POST', //No I18N
            data: sdpAjaxInputData({"parser_acknowledgement" : parser_ack}), //No I18N
            success: function(response) {
                showalert('success', translate("sdp.admin.backup.settings.save.success.msg"), 'isAutoHide=true,delay=5');// No I18N
                jQuery(saveButton).prop('disabled', false); //No I18N
                zia_parser_config.backModifyInfo();
            },
            error: function(response) {
                let result = repsonse.responseJSON;
                showalert('failure', response.responseText,'isAutoHide=false');// No I18N
                jQuery(saveButton).prop('disabled', false); //No I18N
            }
        });
    },
    isValidForm: function() {
        return zia_parser_config.fromZiaConfig() ? jQuery('#ZPConfigForm').valid() : jQuery('#ZPConfigForm_popup').valid();
    },
    initAutoComplete: function(notificationName) {
        let subject_msg = [];

        let desc_msg = [
            {text: "Full Name", value: "$FullName"}, //No I18N
            {text: "First Name", value: "$FirstName"}, //No I18N
            {text: "Middle Name", value: "$MiddleName"}, //No I18N
            {text: "Last Name", value: "$LastName"} //No I18N
        ];
        if(notificationName === 'zia_parser_ack') {
            desc_msg.push(
                {text: "Entity ID", value: "$EntityID"}, //No I18N
                {text: "Predicted details", value: "$PredictedDetails"}, //No I18N
                {text: "Performed details", value: "$PerformedDetails"}, //No I18N
                {text: "Not Performed details", value: "$NotPerformedDetails"} //No I18N
            );
        }
        sdpAjax({
            url: '/api/v3/global_variable_groups/_get_variables_list',//NO I18N
            type: 'GET',//NO I18N
            data:sdpAjaxInputData({"for":"Others"}),  //NO I18N
            async:false,
            success: (data) => {
                const list = data.global_variables_list.map((item) => {
                    const valueOfText = `{GV.${item.group}.${item.variable}}`;
                    return {
                        text: `GV.${item.group}.${item.variable}`,
                        value: `$${valueOfText}`
                    };
                });
                desc_msg.push(...list);
            }
        });

        const $editor = jQuery(ZPAckDescEditor.iframe).contents().find("body").attr({ contentEditable: 'true' });
        let regexp = "\\\$([\\\S]*)$";//No i18n

        autoSuggestion($editor, desc_msg, regexp);
    },
    getTemplateDetails: function(notification_name, result) {
        return sdpAjax({
            url: '/api/v3/zia_parsers/_get_acknowledgement_details/' + notification_name, //No I18N
            async: false,
            method: 'GET', //No I18N
            success: function(resp) {
                jQuery.extend(result, resp.zia_parser);
            }
        });
    },
    /**
        Open the zia parser info modification page.
        In email command page, it is rendered in a popup. In zia configurations page, rendered in the existing popup
    */
    openModifyInfo: function() {
        let fromZiaConfig = zia_parser_config.fromZiaConfig();
        let containerJQ;
        if(fromZiaConfig) {
            containerJQ = jQuery('#zp_configuration');
            containerJQ.find('#zpconfigdiv, #zptestdiv').addClass('hide');
            containerJQ.find('#zpmodifydiv').fadeIn(400, function(){}).removeClass('hide');
            containerJQ.prev().find('.ui-dialog-title').html('<a href="/" id="title_back_button" class="btn btn-default btn-xs mr10 pos-abs mt-2" rel="uitip" title="' + translate("sdp.common.back") + '"><span class="cspr icon-xs go-back vtop top3"></span></a><span class="ml40">' + translate("zia.parser.modify") + '</span>' + '<a href="https://help.servicedeskplus.com/zia-parser" target="_blank" class="text-link fr font-base mt1">' + translate("common.admin.guide") + '</a>').css('width','94%'); //No I18N
            containerJQ.prev().find('#title_back_button').off('click.ziaparser').on('click.ziaparser', function(){ zia_parser_config.backModifyInfo(); }); //No I18N
        }
        else {
            let hbsdata = {};
            hbsdata.includeModify = true;
            hbsdata.includeFooter = true;
            hbsdata.zp = zia_parser_config.zp_bean;
            renderhbs('#zp_popup', 'ziaparser', hbsdata, false, 'zia/zia-admin', true, true, zia_parser_config.initPopupValidator); //No I18N
            containerJQ = jQuery('#zp_popup');
            containerJQ.dialog({
                title: translate("zia.parser.modify.title"),
                width: 900,
                maxHeight: 800,
                modal: true,
                resizable: false,
                position: { my: "center top", at: "center top+100", of: window },// No I18N
                close: function() {
                    jQuery('body').removeClass('subheader-of-h of-h');
                }
            });
            let titleEle = containerJQ.prev().find('.ui-dialog-title');
            let html = titleEle.html();
            html += '<a href="https://help.servicedeskplus.com/zia-parser" target="_blank" class="text-link fr font-base mt1">' + translate("common.admin.guide") + '</a>';
            titleEle.html(html).css('width','94%'); //No I18N
            jQuery('#zpmodifydiv').removeClass('hide');
        }
        containerJQ.find('#zpSave, #zpCancel').off('click.ziaparser'); //No I18N
        containerJQ.find('#zpSave').on('click.ziaparser', function(){ zia_parser_config.saveModifyInfo(); }); //No I18N
        containerJQ.find('#zpCancel').on('click.ziaparser', function(){ zia_parser_config.backModifyInfo(); }); //No I18N
        containerJQ.find('#zpTest').addClass('hide');
        containerJQ.find('#zpinfo').focus();
    },
    //Go back from modify parser info page.
    backModifyInfo: function() {
        let fromZiaConfig = zia_parser_config.fromZiaConfig();
        let containerJQ;
        //Back to configuration section in the popup
        if(fromZiaConfig) {
            containerJQ = jQuery('#zp_configuration');
            containerJQ.find('#zpconfigdiv').fadeIn(400, function(){}).removeClass('hide');
            containerJQ.find('#zpmodifydiv, #zptestdiv, #zpacknowledgediv').addClass('hide');
            containerJQ.find('#zpSave, #zpCancel').off('click.ziaparser'); //No I18N
            containerJQ.find('#zpSave').on('click.ziaparser', function(){zia_parser_config.saveConfig();}).html(translate("common.save")).removeAttr('disabled'); //No I18N
            containerJQ.find('#zpCancel').on('click.ziaparser', function(){zia_parser_config.closeConfig();}); //No I18N
            containerJQ.find('#zpTest').removeClass('hide');
            containerJQ.prev().find('.ui-dialog-title').html(translate("zia.parser.config.title") + '<a href="https://help.servicedeskplus.com/zia-parser" target="_blank" class="text-link fr font-base mt1">' + translate("common.admin.guide") + '</a>').css('width','94%'); //No I18N
            initTooltip('#zp-config'); //No I18N
        }
        //Close the popup
        else {
            containerJQ = jQuery('#zp_popup'); //No I18N
            containerJQ.dialog('close'); //No I18N
            containerJQ.html('');
        }
    },
    checkAndOpenTest: function() {
        if(!zia_parser_config.zp_bean.is_bot_initialised) {
            sdpAjax({
                url : 'api/v3/zia_parsers/_get_parser_training_status', //No I18N
                method : 'GET', //No I18N
                success: function(response) {
                    var statusData = response.zia_parser;
                    var status = statusData.status.toLowerCase();
                    var statusMsg = response.zia_parser.message;
                    var alertType = (status === 'traininginprogress') ? "info" : "failure"; //NO I18N
                    if(status !== 'completed') {
                        showalert(alertType, e_html(statusMsg), 'isAutoHide=true,delay=8'); //No I18N
                    }
                    else {
                        zia_parser_config.zp_bean.is_bot_initialised = true;
                        zia_parser_config.zp_bean.sample_sentence = response.zia_parser.sample_sentence;
                        zia_parser_config.openTest();
                    }
                }
            });
        }
        else {
            zia_parser_config.openTest();
        }
    },
    //Open Test zia parser section
    openTest: function() {
        let fromZiaConfig = zia_parser_config.fromZiaConfig();
        let containerJQ;
        //Render the test zia parser section
        if(fromZiaConfig) {
            containerJQ = jQuery('#zp_configuration');
            containerJQ.find('#zpconfigdiv, #zpmodifydiv').addClass('hide');
            containerJQ.find('#zptestdiv').fadeIn(400, function(){}).removeClass('hide');
            containerJQ.prev().find('.ui-dialog-title').html('<a href="/" id="title_back_button" class="btn btn-default btn-xs mr10 pos-abs mt-2" rel="uitip" title="' + translate("sdp.common.back") + '"><span class="cspr icon-xs go-back vtop top3"></span></a><span class="ml40">' + translate("common.test", [translate('zia.parser')]) + '</span>' + '<a href="https://help.servicedeskplus.com/zia-parser" target="_blank" class="text-link fr font-base mt1">' + translate("common.admin.guide") + '</a>').css('width','94%'); //No I18N
            containerJQ.prev().find('#title_back_button').off('click.ziaparser').on('click.ziaparser', function(){ zia_parser_config.backModifyInfo(); }); //No I18N
        }
        //Open test zia parser popup
        else {
            let data = {};
            data.includeFooter = true;
            data.includeTest = true;
            data.zp = zia_parser_config.zp_bean;
            renderhbs('#zp_popup', 'ziaparser', data, false, 'zia/zia-admin', true, true, zia_parser_config.initPopupValidator); //No I18N
            containerJQ = jQuery('#zp_popup');
            containerJQ.dialog({
                title: translate("common.test", [translate('zia.parser')]),
                width: 900,
                maxHeight: 800,
                modal: true,
                resizable: false,
                position: { my: "center top", at: "center top+100", of: window },// No I18N
                close: function() {
                    jQuery('body').removeClass('subheader-of-h of-h');
                }
            });
            let titleEle = containerJQ.prev().find('.ui-dialog-title');
            let html = titleEle.html();
            html += '<a href="https://help.servicedeskplus.com/zia-parser" target="_blank" class="text-link fr font-base mt1">' + translate("common.admin.guide") + '</a>';
            titleEle.html(html).css('width','94%'); //No I18N
            jQuery('#zptestdiv').removeClass('hide');
        }
        //Handle sample sentences
        renderhbs('#example_prompt', 'ziaparser_samplesentence', {"zp": zia_parser_config.zp_bean}, false, 'zia/zia-admin', true); //No I18N
        containerJQ.find('#example_prompt').removeClass('hide');

        //Handle events
        containerJQ.find('#zpSave, #zpCancel').off('click.ziaparser'); //No I18N
        containerJQ.find('#zpSave').on('click.ziaparser', function(){ zia_parser_config.parseContent(); }).html(translate("common.parse"));
        if(!zia_parser_config.zp_bean.is_bot_initialised) {
            jQuery('#zpSave').attr('disabled', 'disabled');
        }
        containerJQ.find('#zpCancel').on('click.ziaparser', function(){ zia_parser_config.backModifyInfo(); }); //No I18N
        containerJQ.find('#zpTest').addClass('hide');
        containerJQ.find('#parsecontent').focus();
    },
    //Close the configuration
    closeConfig: function() {
        let zpConfigDiv = jQuery('#zp_configuration');
        zpConfigDiv.dialog('close'); //No I18N
        zpConfigDiv.remove();
    },
    //Validate the zp configuration before save
    validate: function() {
        let fromZiaConfig = zia_parser_config.fromZiaConfig();
        let formEle = jQuery('#zp_configuration');
        let subject = formEle.find('#subject').val().trim().toLowerCase();
        let ecSubject = fromZiaConfig ? "" : jQuery('#titleString').val().trim().toLowerCase();
        let msg = '';
        let valid = jQuery('#ZPConfigForm').valid();
        if(valid && !fromZiaConfig && subject === ecSubject) {
            msg = translate('zia.parser.subject.same.error', [translate('zia.parser'), translate('sdp.admin.email.mailparser.tooltip')]); //NO I18N
            showalert('failure', msg, 'isAutoHide=false'); //No I18N
            formEle.find('#subject').focus();
            valid = false;
        }

        //Validate other fields only when subject field is valid
        if(valid) {
        let message = "";
        try {

            if(zia_parser_config.isAllFieldsSelected() && zia_parser_config.isAllActionsSelected()) {
                    message = translate("zia.parser.config.all.excluded");
                }
            else if (zia_parser_config.isAllFieldsSelected()) {
                message = translate("zia.parser.config.fields.excluded");
            }
            else if(zia_parser_config.isAllActionsSelected()) {
                message = translate("zia.parser.config.actions.excluded");
            }
        }
        catch(e) {}
        if(message !== "") {
            let callBackFunction = fromZiaConfig ? zia_parser_config.saveZiaParser : zia_parser_config.saveBothCommands;
            showconfirm(true, 'title=' + translate("common.confirm") + ',message=' + message + ',submitbutton=' + translate("common.proceed") + ',cancelbutton=' + translate("sdp.common.cancel")  + ',closebutton=yes', callBackFunction,null); //No I18N
            valid = false;
        }
        else {
            valid = true;
        }
        }
        if(!valid) {
            jQuery('#commandsavebtn').button('reset');
        }
        return valid;
    },
    //Parse the content using api call
    parseContent: function() {
        let contentEle = jQuery('#parsecontent');
        let content = contentEle.val().trim();
        if(!zia_parser_config.isValidForm()) {
            return;
        }
        var loadingHtml = '<div class="h-350px fw pos-rel"> <div class="loading1 ml-20"> <div class="loading-bar1"></div> <div class="loading-bar1"></div> <div class="loading-bar1"></div> <div class="loading-bar1"></div> </div> </div>';
        jQuery('#parsedcontent').html(loadingHtml);
        sdpAjax({
            url: "/api/v3/zia_actions/_test_zia_parser", //No I18N
            type: "POST", //No I18N
            data: "content=" + encodeURIComponent(content),
            success: function(resp) {
                if(resp.response_status && resp.response_status.status == "success") {
                    let action = resp.zia_action;
                    zia_parser_config.populateParsedResult(action);
                    let parsedresult = jQuery("#parsedresult");
                    if(!parsedresult.hasClass('brd-left-medium')){
                        parsedresult.animate({width: "50%"}, 1000 , function(){
                            let curEle = jQuery(this);
                            curEle.find('> div').removeClass('hide');
                            curEle.prev().css('width','50%'); //No I18N
                            curEle.addClass('brd-left-medium');
                        });
                    }
                }
            },
            error: function(jqxhr) {
                let response = jqxhr.responseJSON;
                let status = 'failure'; //No I18N
                jQuery('#parsedcontent').html(''); //removing the loading bar on error
                if(response && response.response_status && response.response_status.status !== 'success') {
                    let message = response.response_status.messages ? response.response_status.messages[0].message : translate("sdp.api.internalerror");
                    showalert(status, message, 'isAutoHide=false,delay=5'); //No I18N
                }
            }
        });
    },
    //populate the parsed result
    populateParsedResult: function(zia_action) {
        if(zia_action) {
            let parsedContentEle = jQuery('#parsedcontent');
            parsedContentEle.html('');
            if(zia_action.explanation) {
                parsedContentEle.html(zia_action.explanation);
            }
        }
    },
    //save the zia parser configuration
    saveConfig: function(ignoreValidation) {
        return new Promise((resolve, reject) => {
        let valid = false;
        if(ignoreValidation) {
            valid = true;
        }
        else {
            if(!zia_parser_config.isZiaParserChanged()) {
                return zia_parser_config.alertNoChanges();
            }
            else {
                valid = zia_parser_config.validate();
            }
        }

        if(valid) {
                let result = zia_parser_config.saveZiaParser(true);
                resolve(result);
            }
            else {
                resolve(true);
            }
        });
    },
    saveZiaParser: function(proceed) {
        if(proceed) {
        let formEle = jQuery('#zp_configuration');
        let fromZiaConfig = zia_parser_config.fromZiaConfig();
            let subject = formEle.find('#subject').val();
            let excludedFields = formEle.find('#excludedFields').select2('val').join(); //No I18N
            let excludedActions = formEle.find('#excludedActions').select2('val').join(); //No I18N
            let appendParserInfo = formEle.find('input[name="appendParserInfo"]:checked').val(); //No I18N
        let sendAcknowledge = formEle.find('#parserAcknowledge').prop('checked'); //No I18N
            let input_data = {};
            let zia_parser = {};
            zia_parser.subject = subject;
            zia_parser.excluded_fields = excludedFields;
            zia_parser.excluded_actions = excludedActions;
            zia_parser.append_parser_info = appendParserInfo;
        zia_parser.send_acknowledge = sendAcknowledge;
            if(!fromZiaConfig) {
            zia_parser.enabled = formEle.find('#ziaparserenabled').prop('checked'); //No I18N
            }
            input_data.zia_parser = zia_parser;
            let result = {};
        zia_parser_config.callZiaEmailParserPut(input_data, result);
        if(zia_parser_config.fromZiaConfig()) {
                showalert(result.status, result.messages[0].message, 'isAutoHide=' + (result.status !== 'success' ? "false" : "true"));
            /**
             * If zia parser is disabled but enabled in UI (zia configurations page), the page is reloaded once.
             * This occurs in scenario where all fields and actions are excluded by user.
             * In this scenario, zia parser will be disabled at server side.
             */
            if(jQuery('#ziaparserbtn').closest('tr').find('span[id="mycheckbox1"]').hasClass('on') && !zia_parser_config.zp_bean.enabled) {
                window.location.reload();
            }
            }
            else {
            /**
             * If zia parser is disabled but enabled in UI (email commands page), then it is disabled via script.
             * This occurs in scenario where all fields and actions are excluded by user.
             * In this scenario, zia parser will be disabled at server side.
             */
            if(formEle.find('#ziaparserenabled').prop('checked') && !zia_parser_config.zp_bean.enabled) {
                formEle.find('#ziaparserenabled').prop('checked', false); //No I18N
            }
                return result;
            }
        }
    },
    //save the modified zia parser info
    saveModifyInfo: function() {
        let parserInfoEle = jQuery('#zpinfo');
        let parserInfo = parserInfoEle.val().trim();
        if(zia_parser_config.zp_bean.parser_info == parserInfo) {
            return zia_parser_config.alertNoChanges();
        }
        if(!zia_parser_config.isValidForm()) {
            return;
        }
        let zia_parser = {};
        zia_parser.parser_info = parserInfo;
        let input_data = {'zia_parser': zia_parser}; //No I18N
        let result = {};
        zia_parser_config.callZiaEmailParserPut(input_data, result);
        if(result.status == 'success') {
            let msg = translate("api.saved.success", [translate("zia.parser")]);
            showalert('success', msg, 'isAutoHide=true'); //No I18N
            zia_parser_config.backModifyInfo();
        }
        else if(result.status == 'failure') {
            showalert('failure', result.message, 'isAutoHide=false'); //No I18N
        }
    },
    //Method to update the zia parser configurations
    callZiaEmailParserPut: function(input_data, result){
        let id = zia_parser_config.zp_bean.id;
        return sdpAjax({
            url: '/api/v3/zia_parsers/' + id, //No I18N
            method: 'PUT', //No I18N
            data: sdpAjaxInputData(input_data),
            async: false,
            success: function(resp) {
                let response_status = resp.response_status;
                result['status'] = response_status.status;
                result['messages'] = response_status.messages;
                if(result.status === 'success') {
                    zia_parser_config.zp_bean = resp.zia_parser;
                }
            },
            error: function(resp) {
                let response = resp.responseJSON;
                let status = response.response_status.status;
                result.status = status === 'failed' ? "failure" : status; //No I18N
                result.messages = response.response_status.messages;
                if(result.status !== 'failure') {
                    zia_parser_config.zp_bean = response.zia_parser;
                }
            }
        });
    },
    //Method to check whether invoked from email command / zia configurations page
    fromZiaConfig: function() {
        return jQuery('#z_config').length > 0;
    }

}